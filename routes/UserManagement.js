import { Router } from "express";
import User from "../models/User.js";
const router = Router();
// GET all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }); 
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error while fetching users', error: error.message });
  }
});

// GET a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(`Error fetching user by ID ${req.params.id}:`, error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid user ID format' });
    }
    res.status(500).json({ message: 'Server error while fetching user', error: error.message });
  }
});

// Add a new user
router.post('/', async (req, res) => {
  try {
    const { name, fatherName, cnic, phone, address, degree, semester, university } = req.body;

    if (!name || !fatherName || !cnic || !phone || !address || !degree || !semester || !university) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ cnic });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this CNIC already exists' }); // 409 Conflict
    }

    const newUser = new User({
      name,
      fatherName,
      cnic,
      phone,
      address,
      degree,
      semester,
      university
    });

    const savedUser = await newUser.save();
    res.status(201).json(savedUser); 
  } catch (error) {
    console.error('Error adding new user:', error);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error while adding user', error: error.message });
  }
});

// Update an existing user by ID
router.put('/:id', async (req, res) => {
  try {
    const { name, fatherName, cnic, phone, address, degree, semester, university } = req.body;

    if (!name && !fatherName && !cnic && !phone && !address && !degree && !semester && !university) {
      return res.status(400).json({ message: 'At least one field must be provided for update' });
    }
    
    if (cnic) {
        const existingUserWithNewCnic = await User.findOne({ cnic: cnic, _id: { $ne: req.params.id } });
        if (existingUserWithNewCnic) {
            return res.status(409).json({ message: 'Another user with this CNIC already exists' });
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body, 
      { new: true, runValidators: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found for update' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user by ID ${req.params.id}:`, error);
    if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid user ID format for update' });
    }
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error during update', errors: error.errors });
    }
    if (error.code === 11000 && error.keyValue && error.keyValue.cnic) { 
        return res.status(409).json({ message: 'This CNIC is already in use by another user.' });
    }
    res.status(500).json({ message: 'Server error while updating user', error: error.message });
  }
});

// DELETE a user by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found for deletion' });
    }
    res.json({ message: 'User deleted successfully', userId: req.params.id });
  } catch (error) {
    console.error(`Error deleting user by ID ${req.params.id}:`, error);
     if (error.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid user ID format for deletion' });
    }
    res.status(500).json({ message: 'Server error while deleting user', error: error.message });
  }
});

export default router;