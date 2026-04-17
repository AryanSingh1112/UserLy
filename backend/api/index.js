const app = require('../src/app');
const connectDB = require('../src/config/db');

let isDbConnected = false;

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    'https://user-ly.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
  ].filter(Boolean)
);

const vercelDomainPattern = /^https:\/\/user-ly(?:-[a-z0-9-]+)?\.vercel\.app$/;

const applyCorsHeaders = (req, res) => {
  const origin = req.headers.origin;
  const isAllowed =
    !origin || allowedOrigins.has(origin) || vercelDomainPattern.test(origin);

  if (isAllowed && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

module.exports = async (req, res) => {
  try {
    applyCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    if (!isDbConnected) {
      await connectDB();
      isDbConnected = true;
    }

    return app(req, res);
  } catch (error) {
    console.error('Vercel function error:', error.message);
    applyCorsHeaders(req, res);

    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};