import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(backendDirectory, '.env') });
console.log(`JWT authentication ${process.env.JWT_SECRET?.trim() ? 'configured' : 'not configured'}`);
const [{ default: app }, { default: connectDB }] = await Promise.all([
  import('./app.js'),
  import('./config/db.js'),
]);

const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await connectDB();
    } else {
      console.warn('MONGO_URI is not set. Starting without a database connection.');
    }

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`API server listening on port ${port}`);
    });
  } catch (error) {
    if (process.env.MONGO_URI) {
      console.error(`MongoDB connection failed: ${error.message}`);
    } else {
      console.error(`Failed to start server: ${error.message}`);
    }
    process.exit(1);
  }
};

startServer();