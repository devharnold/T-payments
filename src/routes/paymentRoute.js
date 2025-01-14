import express from 'express';
import dotenv from 'dotenv';
const app = express();
const router = express.Router();
dotenv.config();

import { initiatePayment } from '../controllers/paymentController.js';

app.use(express.json());
app.use(initiatePayment);

router.post('/payments', initiatePayment);

export default router;