import { createPayment, updatePaymentStatus } from '../models/paymentsService.js';

// function to initiate a payment activity
export const initiatePayment = async (req, res) => {
    const { user_id, amount, paymentMethod } = req.body;

    try {
        // call the createPayment fucntion
        const payment = await createPayment(user_id, amount, paymentMethod);
        res.status(201).json({
            message: 'Payment created successfully',
            payment: payment
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    }
};

// confirm if payment is successful
export const confirmPayment = async (req, res) => {
    const { user_id, payment_id, account_id} = req.body;

    try {
        const payment = await updatePaymentStatus(payment_id, user_id);

        res.status(200).json({
            message: `Confirmed payment made to ${account_id}`,
            payment: payment
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
};

// paypal webhook that allows account holders to receive payments from paypal
export const paypalWebhook = async (req, res) => {
    const { payment_id, status} = req.body;

    try {
        const updatePaymentStatus = await updatePaymentStatus(payment_id, status);

        res.status(200).json({
            message: 'Payment status updated successfully',
            payment: updatePayment
        });
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
};