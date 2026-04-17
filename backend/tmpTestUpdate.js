const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const User = require('./src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'auto@example.com' });
    console.log('Found', user ? user._id.toString() : 'none');
    if (!user) {
      return process.exit(0);
    }
    user.name = 'Direct Update Test';
    user.updatedBy = user._id;
    const updated = await user.save();
    console.log('Saved', updated.name, updated._id.toString());
  } catch (err) {
    console.error('Mongoose error', err);
    console.error(err.stack);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
