import express from 'express';
import { initiatePayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/payments', initiatePayment);

export default router;