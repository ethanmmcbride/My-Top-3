const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
//const { getDB } = require('./db');
require('dotenv').config({ path: '../.env' });
console.log('Gemini API Key:', process.env.GEMINI_API_KEY ? 'Present' : 'Missing');

// Initialize Gemini AI
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

const model = 'gemini-1.5-flash';

// Get song recommendations based on a list of songs
router.post('/recommendations', async (req, res) => {
    console.log('Entering Gemini Recs');
    try {
        const { songs } = req.body;
    
        const prompt = `You are a music recommendation assistant. 
        Based on these songs: ${JSON.stringify(songs)},  
        suggest 3 similar songs by first mentioning the songs you're basing
        the recommendations from.`;
        // in JSON format like this:
        // {
        // "recommendations": [
        //     {
        //     "song": "Song Name",
        //     "artist": "Artist Name",
        //     "reason": "Why this recommendation fits"
        //     }
        // ]
        // }`;

        const result = await ai.models.generateContent({
            model: model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        // Parse the JSON response from Gemini
        // let recommendations;
        // try {
        //     recommendations = JSON.parse(text);
        // } catch (e) {
        //     const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        //     if (jsonMatch && jsonMatch[1]) {
        //         try {
        //         recommendations = JSON.parse(jsonMatch[1]);
        //         } catch (e2) {
        //         // If extraction fails, return the raw text
        //         recommendations = { recommendations: [{ song: "Raw Response", artist: "", reason: text }] };
        //         }
        //     } else {
        //         recommendations = { recommendations: [{ song: "Raw Response", artist: "", reason: text }] };
        //     }
        // }
        res.json({ response: text });

    } catch (err) {
        console.error('Gemini recommendation error:', err);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

module.exports = router;