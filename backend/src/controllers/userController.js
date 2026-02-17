import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, upiPassword } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = { name, email, password: hashedPassword, role };
    if (role === 'SECURITY') {
      if (!upiPassword || !upiPassword.trim()) {
        return res.status(400).json({ message: 'UPI password is required for SECURITY role' });
      }
      userData.upiPassword = await bcrypt.hash(upiPassword, 10);
    }
    const user = new User(userData);
    await user.save();
    const { password: _, upiPassword: __, ...userWithoutSensitive } = user.toObject();
    res.status(201).json(userWithoutSensitive);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: err.message });
    }
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role, password, upiPassword } = req.body;
    const update = { name, email, role };
    if (password) update.password = await bcrypt.hash(password, 10);
    if (role === 'SECURITY') {
      if (!upiPassword || !upiPassword.trim()) {
        return res.status(400).json({ message: 'UPI password is required for SECURITY role' });
      }
      update.upiPassword = await bcrypt.hash(upiPassword, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password -upiPassword');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAssignedSecurities = async (req, res) => {
  try {
    const securities = await User.find({ role: 'SECURITY' }).populate('assignedParking');
    res.json(securities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const removeSecurityAssignment = async (req, res) => {
  try {
    const { securityId } = req.params;
    const user = await User.findById(securityId);
    if (!user || user.role !== 'SECURITY') {
      return res.status(404).json({ message: 'Security user not found' });
    }
    user.assignedParking = null;
    await user.save();
    res.json({ message: 'Security assignment removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addOrUpdateUPI = async (req, res) => {
  try {
    const { upiId, upiPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user || user.role !== 'SECURITY') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (!user.upiPassword || typeof user.upiPassword !== 'string') {
      // If upiPassword not set, set it with the provided password
      user.upiPassword = await bcrypt.hash(upiPassword, 10);
    } else {
      // Verify the provided password against the stored one
      const isPasswordValid = await bcrypt.compare(upiPassword, user.upiPassword);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid UPI password' });
      }
    }
    user.upiId = upiId;
    await user.save();
    res.json({ message: 'UPI ID updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
