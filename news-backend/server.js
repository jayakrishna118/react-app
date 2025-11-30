import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();

app.use(cors());
const PORT = process.env.PORT || 5000;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!NEWS_API_KEY) {
  console.error("Error: NEWS_API_KEY is not defined in environment variables.");
  process.exit(1);
}

app.use(express.json()); // For parsing JSON bodies
// MongoDB and User model setup (top-level, not inside routes)
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

let User;
try {
    User = mongoose.model('User');
} catch {
    const userSchema = new mongoose.Schema({
        name: String,
        email: { type: String, unique: true },
        password: String,
    });
    User = mongoose.model('User', userSchema);
}

// News API route
app.get("/api/news", async (req, res) => {
    try {
        const q = req.query.q || "latest";
        const page = req.query.page || 1;
        const pageSize = req.query.pageSize || 5;
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=${pageSize}&page=${page}&apiKey=${NEWS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Error fetching news:", error);
        res.status(500).json({ error: "Error fetching news" });
    }
});


// Create user via /api/users (for curl/manual testing)
app.post('/api/users', async (req, res) => {
    console.log('POST /api/users called, body =', req.body);
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        // For demo, save plain password. For production, hash it!
        // const hashedPassword = await bcrypt.hash(password, 10);
        // const user = new User({ name, email, password: hashedPassword });
        const user = new User({ name, email, password });
        await user.save();
        res.status(201).json({ message: 'User created', user: { name, email } });
    } catch (err) {
        console.error('Error saving user:', err);
        res.status(500).json({ error: 'Failed to save user' });
    }
});

// Signin Route
app.post('/api/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

        // Create JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: 'Signin failed' });
    }
});

app.get("/", (req, res) => {
    res.send("News Backend is running. Use /api/news endpoint to fetch news.");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});