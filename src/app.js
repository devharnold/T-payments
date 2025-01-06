#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
const app = express();
const HOST = process.env.APP_HOST;
const PORT = process.env.APP_PORT;

import db from '';
app.use(express.json());
app.use('/api', );

app.listen(PORT, HOST, () => {
    console.log(`Server running at http://${HOST}:${PORT}`);
}).on('error', (err) => {
    if(err.code == 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please choose another port.`);
        process.exit(1);
    } else {
        console.error('Server error', err);
    }
})

import pg from 'pg';
import { Client } from 'pg';

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME, 
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

client.connect()
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection error:', err));