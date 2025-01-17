import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
const app = express();
const router = express.Router();
dotenv.config();

import { initiatePayment } from '../controllers/paymentController.js';

app.use(express.json());
app.use(initiatePayment);

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// router.post('/payments', initiatePayment);

router.post('/payment', async(req, res) => {
    try {
        const client = await pool.connect();
    } catch (error) {
        console.error('Error processing request');
        return res.status(400).json({ error: 'Error', error });
    }
});

export default router;