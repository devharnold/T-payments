import { Pool } from "pg";
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

export const createPayment = async(user_id, amount, paymentMethod) => {
    // vaild payment methods
    const validPaymenthMethods = ['credit card', 'mobile money', 'debit card'];

    // check if the selected payment method is available
    if (!validPaymenthMethods.includes(paymentMethod.toLowerCase())) {
        throw new Error('Invalid Payment method');
    }

    // generate a random payment id for every payment made
    const queryForPaymentId = 'SELECT NEXTVAL(\'payment_id_seq\') AS payment_id';
    const paymentIdResult = await pool.query(queryForPaymentId);
    const payment_id = paymentIdResult.rows[0].paymentId;
    
    try {
        // SQL query to insert record into the database
        const query = `
            INSERT INTO payments(user_id, amount, paymentMethod, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [user_id, amount, payment_id, paymentMethod];

        // Execute the query
        const result = await pool.query(query, values);
        return result.rows[0]; // Returns the payment record
    } catch (error) {
        console.error('Error creating payment:', error);
        throw new Error('Could not create payment');
    }
};

export const getPaymentById = async(payment_id) => {
    try {
        const query = `
            SELECT * FROM payments
            WHERE payment_id = $1
        `;
        const result = await pool.query(query, [payment_id]);

        if (result.rows.length === 0) {
            throw new Error('Payment not found!')
        }
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching payment:', error);
        throw new Error('Could not fetch payment!');
    }
};

// function to update the payment status after payment is received
export const updatePaymentStatus = async(payment_id, status) => {
    try {
        const query = `
            UPDATE payments
            SET status = $1, updated_at = NOW()
            WHERE payment_id = $2
            RETURNING *;
        `;
        const values = [status, payment_id];

        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        console.error('Error updating payment status: ', error);
        throw new Error('Could not update payment status');
    }
};

export const getPaymentByUserId = async (user_id) => {
    try {
        const query = `
            SELECT * FROM payments
            WHERE user_id = $1
            ORDER BY created_at DESC
        `;
        const result = await pool.query(query, [user_id]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw new Error('Could not fetch payments');
    }
};

