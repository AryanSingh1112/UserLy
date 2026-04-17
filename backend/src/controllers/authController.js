const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@userly.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Platform Admin';

const ensureAdminUser = async () => {
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL }).select('+password');

  if (!existingAdmin) {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      status: 'active',
    });
    return;
  }

  if (existingAdmin.role !== 'admin' || existingAdmin.status !== 'active') {
    existingAdmin.role = 'admin';
    existingAdmin.status = 'active';
    await existingAdmin.save();
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    await ensureAdminUser();

    let user = await User.findOne({ email }).select('+password');

    // Requirement: "from any mail user can login only specific mail there for login of admin"
    // Handle Auto-registration if user doesn't exist (and it's not the admin email)
    if (!user) {
      if (email === ADMIN_EMAIL) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
      }

      // Automatically create the user if it doesn't exist
      user = await User.create({
        name: email.split('@')[0], // Default name from email
        email,
        password: password || 'password123', // Use password123 as default if none provided
        role: 'user',
        status: 'active'
      });
      
      // Fetch again to get full object minus password selectivity
      user = await User.findById(user._id);
    } else {
      // Normal login check for existing users
      if (user.status === 'inactive') {
        return res.status(401).json({ success: false, message: 'Your account is inactive' });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  console.log(`Registration attempt: ${email}`);

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user',
      status: 'active'
    });

    console.log(`User created successfully: ${user.email}`);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error('SERVER REGISTER ERROR:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email address is already in use' });
    }
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
