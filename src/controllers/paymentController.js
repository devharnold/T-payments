import paymentsService, { initiatePayment, createPayment, updatePaymentStatus } from "../models/paymentsService/initiatePayments.js";
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();



export default class paymentController {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
    }

    // payments controller to enable a user make payment
    async makePayment(req, res) {
        const {user_id, business_account_id, amount, from_currency, to_currency} = req.body;

        if (!business_account_id || !amount || !from_currency || !to_currency) {
            return res.status(400).json({"Error": "Missing fields"})
        }
        try {
            const client = await this.pool.connect();
            const newPayment = paymentsService.initiatePayment(this.pool, { user_id, business_account_id, amount, from_currency, to_currency });
            res.status(201).json({ message: "Payment done!", payment: newPayment });
            client.release();
        } catch(error) {
            console.error('Error creating payment', error);
            res.status(500).json({ message: "Server error" });
        }
    }
};





























































    // static async updatePaymentStatus(payment_id, status) {
    //     try {
    //         const client = await pool.connect();
    //         const query = `
    //             UPDATE payments
    //             SET status = $1, updated_at = NOW()
    //             WHERE payment_id = $2
    //             RETURNING *;
    //         `;
    //         const values = [status, payment_id];

    //         const result = await client.query(query, values);
    //         return result.rows[0];

    //         client.release();
    //     } catch (error) {
    //         console.error('Error updating payment status: ', error);
    //         throw new Error('Could not update payment status');
    //     }
    // }






































// import { createPayment, updatePaymentStatus } from "../models/paymentsService/initiatePayments.js";
// 
// // function to initiate a payment activity
// export const initiatePayment = async (req, res) => {
//     const { user_id, amount, paymentMethod } = req.body;
// 
//     try {
//         // call the createPayment fucntion
//         const payment = await createPayment(user_id, amount, paymentMethod);
//         res.status(201).json({
//             message: 'Payment created successfully',
//             payment: payment
//         });
//     } catch (error) {
//         res.status(400).json({
//             message: error.message
//         });
//     }
// };
// 
// 
// 
// // confirm if payment is successful
// export const confirmPayment = async (req, res) => {
//     const { user_id, payment_id, account_id} = req.body;
// 
//     try {
//         const payment = await updatePaymentStatus(payment_id, user_id);
// 
//         res.status(200).json({
//             message: `Confirmed payment made to ${account_id}`,
//             payment: payment
//         });
//     } catch (error) {
//         res.status(400).json({
//             message: error.message
//         })
//     }
// };
// 
// // paypal webhook that allows account holders to receive payments from paypal
// export const paypalWebhook = async (req, res) => {
//     const { payment_id, status} = req.body;
// 
//     try {
//         const updatePaymentStatus = await updatePaymentStatus(payment_id, status);
// 
//         res.status(200).json({
//             message: 'Payment status updated successfully',
//             payment: updatePayment
//         });
//     } catch (error) {
//         res.status(400).json({
//             message: error.message
//         })
//     }
// };