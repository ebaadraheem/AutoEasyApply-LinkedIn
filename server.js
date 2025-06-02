import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import UserManagement from './routes/UserManagement.js'; 
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5001; 
const MONGODB_URI = process.env.MONGODB_URI ; 

const app = express();

app.use(cors()); 
app.use(express.json()); 

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });


app.get('/', (req, res) => {
  res.send('User Management API Server is running!');
});

app.use('/api/users', UserManagement); 

app.use((err, req, res, next) => {
  console.error("Unhandled application error:", err.stack);
  res.status(500).send('Something broke on the server!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
