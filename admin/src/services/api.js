import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL?.trim()
  || (import.meta.env.DEV ? 'http://localhost:5000/api' : '');

if (!apiBaseUrl) {
  throw new Error('VITE_API_URL must be set for production deployments.');
}

const api = axios.create({
  baseURL: apiBaseUrl.replace(/\/+$/, ''),
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isLoginRequest = requestUrl.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginRequest && window.location.pathname !== '/login') {
      window.localStorage.removeItem('token');
      window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (error.code === 'ECONNABORTED') {
    return 'The request timed out. Check the backend and try again.';
  }
  if (error.response) {
    return error.response.data?.message || fallback;
  }
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Unable to reach the backend. Check that it is running and VITE_API_URL is set.';
  }
  return error.message || fallback;
}

export async function uploadProductImages(files, onProgress) {
  const signatureResponse = await api.post('/products/upload/sign', {
    files: files.map(({ name, type, size }) => ({ name, type, size })),
  });
  const uploads = signatureResponse.data?.uploads;
  if (!signatureResponse.data?.success || !Array.isArray(uploads) || uploads.length !== files.length) {
    throw new Error('The image upload service returned an unexpected response.');
  }

  const uploadedPublicIds = new Set();
  const fileProgress = files.map(() => 0);
  const totalBytes = files.reduce((total, file) => total + file.size, 0);
  const updateProgress = () => {
    if (totalBytes && onProgress) {
      onProgress(Math.round(fileProgress.reduce((total, loaded) => total + loaded, 0) / totalBytes * 100));
    }
  };

  try {
    const results = await Promise.allSettled(files.map(async (file, index) => {
      const signedUpload = uploads[index];
      const formData = new FormData();
      formData.append('file', file);
      for (const field of ['api_key', 'timestamp', 'signature', 'folder', 'public_id', 'allowed_formats']) {
        formData.append(field, String(signedUpload[field]));
      }

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(signedUpload.cloud_name)}/image/upload`,
        formData,
        {
          onUploadProgress: (event) => {
            fileProgress[index] = Math.min(file.size, event.loaded);
            updateProgress();
          },
        },
      );
      const image = response.data;
      if (typeof image?.public_id === 'string') uploadedPublicIds.add(image.public_id);
      const publicIdMatches = image?.public_id === signedUpload.public_id
        || image?.public_id?.endsWith(`/${signedUpload.public_id}`);
      let secureCloudinaryUrl = false;
      try {
        const imageUrl = new URL(image?.secure_url);
        secureCloudinaryUrl = imageUrl.protocol === 'https:' && imageUrl.hostname === 'res.cloudinary.com';
      } catch {}
      if (!publicIdMatches || !secureCloudinaryUrl || image.bytes > file.size || image.bytes > 5 * 1024 * 1024) {
        throw new Error('Cloudinary returned an invalid product image.');
      }

      fileProgress[index] = file.size;
      updateProgress();
      return image.public_id;
    }));

    const failedUpload = results.find((result) => result.status === 'rejected');
    if (failedUpload) throw failedUpload.reason;

    const publicIds = results.map((result) => result.value);
    const completionResponse = await api.post('/products/upload/complete', { publicIds });
    if (!completionResponse.data?.success || !Array.isArray(completionResponse.data.images) || completionResponse.data.images.length !== files.length) {
      throw new Error('The image upload service returned an unexpected response.');
    }

    return completionResponse.data.images;
  } catch (error) {
    if (uploadedPublicIds.size > 0) {
      await api.post('/products/upload/cleanup', { publicIds: [...uploadedPublicIds] }).catch(() => {});
    }
    throw error;
  }
}

export default api;