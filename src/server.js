import app from './app.js';
import config from './config.js';
import { connectDB } from './db.js';

async function start() {
  try {
    await connectDB(config.mongoUri);
  } catch (err) {
    console.error(`[Server Warning] Could not connect to MongoDB at ${config.mongoUri}`);
    console.error('Please verify your MONGODB_URI in .env file.');
  }

  const server = app.listen(config.port, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Express 5 Catch-All Server running on port ${config.port}`);
    console.log(`🌐 Local URL:      http://localhost:${config.port}`);
    console.log(`🎯 Subdomain demo: http://subdomain.localhost:${config.port}`);
    console.log(`📦 Database:       ${config.mongoUri}`);
    console.log(`=======================================================`);
  });

  const shutdown = async () => {
    console.log('\nShutting down server...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start();
