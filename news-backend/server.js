import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();

app.use(cors());
const PORT = process.env.PORT || 5000;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

if (!NEWS_API_KEY) {
  console.error("Error: NEWS_API_KEY is not defined in environment variables.");
  process.exit(1);
}

app.get("/api/news",async (req, res) => {
    try{
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

app.get("/", (req, res) => {
    res.send("News Backend is running. Use /api/news endpoint to fetch news.");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});