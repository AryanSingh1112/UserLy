const app = require('../src/app');
const connectDB = require('../src/config/db');

let isDbConnected = false;

module.exports = async (req, res) => {
  try {
    if (!isDbConnected) {
      await connectDB();
      isDbConnected = true;
    }

    return app(req, res);
  } catch (error) {
    console.error('Vercel function error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};