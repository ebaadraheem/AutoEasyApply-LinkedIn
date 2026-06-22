import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fatherName: { type: String, required: true, trim: true },
  cnic: { type: String, required: true, unique: true, trim: true }, 
  phone: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
  degree: { type: String, required: true, trim: true },
  semester: { type: String, required: true, trim: true },
  university: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

export default User;