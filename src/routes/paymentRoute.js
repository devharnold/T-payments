import express from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
const app = express();
const router = express.Router();
dotenv.config();

import { initiatePayment } from '../controllers/paymentController.js';

app.use(express.json());
app.use(initiatePayment);

router.post('/payments', initiatePayment);

router.get('payment', async(req, res) => {
    try {
        const pool = new Pool({
            
        })
    }
})

export default router;