"use strict";

import express from 'express';
import dotenv from 'dotenv';
const app = express();
const router = express.Router();
dotenv.config();

import paymentController, { initiatePayment } from '../controllers/paymentController.js';

app.use(express.json());
app.use(paymentController.initiatePayment);


router.post('/payment', (req, res) => paymentController.initiatePayment(req, res));

export default router;