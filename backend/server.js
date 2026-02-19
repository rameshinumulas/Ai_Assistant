import dotenv from "dotenv";

dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from "url";
import connectDB from './config/db.js'
import errorHandler from '../backend/middleware/erroHandler.js';

// ES6 module __dirname alternative

const __filename = fileURLToPath(import.meta.url);
const __direname = path.dirname(__filename);

// Initialize express app
const app = express();

//Connect to MongoDB
connectDB();

// Middleware to handle cors

app.use(
    cors({
        origin:'*',
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// STATIC FOLDER FOR UPLOADS
app.use('/uploads', express.static(path.join[__direname, 'uploads']));


//Routes
app.use(errorHandler);

//404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found",
        statusCoe: 404
    });
});

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} MODE ON PORT ${PORT}`)
});

process.on('unhandledRejection', (err) => {
    console.log(`Erro: ${err.message}`);
    process.exit(1) 
})