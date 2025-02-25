import { Pool } from "pg";
import dotenv from 'dotenv';
import User from "../user.js";
import Accounts from "../account.js";
import { request, response } from "express";
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

export default class paymentsService {
    constructor(user_id, business_account_id, balance, amount, from_currency, to_currency, transaction_id) {
        this.user_id = user_id;
        this.receiver_account_id = business_account_id;
        this.balance = balance;
        this.amount = amount;
        this.from_currency = from_currency;
        this.to_currency = to_currency;
        this.transaction_id = transaction_id
    }
    
    static async initiatePayment(payments) {
        // const validPaymentMethods = ['mobile money', 'debit card'];
        const available_currencies = ['GBP', 'USD', 'KES'];
        
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const result = [];
            for(const payment of payments) {
                const {
                    user_id,
                    business_account_id,
                    from_currency,
                    to_currency,
                    amount,
                    transaction_id,
                } = payment;

                if (amount <= 0) {
                    // check if amount is less than or equal to 0
                    result.push({
                        transaction_id,
                        status: "Incomplete! Cannot transafer 0 funds"
                    });
                    continue;
                }
                // if the currency is not available then return error message
                // checks both the `from_currency` and `to_currency`
                if(!available_currencies.includes(from_currency) || !available_currencies.includes(to_currency)) {
                    result.push({
                        transaction_id,
                        status: "Currency not available"
                    });
                }

                // checks if the currencies differ; and if yes, perform the get exchange rate and charge some fees
                if (from_currency !== to_currency) {
                    this.getExchangeRate();
                }

                // check user's balance before making payment 
                const [senderRows] = await client.query(
                    "SELECT balance FROM account WHERE user_id = $1",
                    [sender_account_id]
                );
                if (senderRows.length === 0) {
                    result.push({
                        transaction_id,
                        status: "Sender account not found"
                    });
                    continue;
                }

                // checks if the senderBalance < amount to be transacted
                const senderBalance = senderRows[0].balance;
                if (senderBalance < amount) {
                    result.push({
                        transaction_id,
                        status: "Insufficient funds in your wallet"
                    });
                    continue;
                }

                // check receiver account
                const [receiverRows] = await client.query(
                    "SELECT account_id FROM accounts WHERE account_id = $1",
                    [receiver_account_id]
                );
                if (receiverRows.length === 0) {
                    result.push({
                        transaction_id,
                        status: "Receipient not found"
                    });
                    continue;
                }
                // insert the transaction if checks pass
                await client.query(
                    `
                    INSERT INTO transactions(user_id, business_account_id, from_currency, to_currency, amount, transaction_id)
                    VALUES ($!, $2, $3, $4, $5, $6)
                    `,
                    [user_id, business_account_id, from_currency, to_currency, amount, transaction_id]
                );
                result.push({
                    transaction_id,
                    status: "Payment complete!"
                });
            }
            await client.query('COMMIT');
            return result;
        } catch(error) {
            await client.query('ROLLBACK');
            return {
                error: "Transaction failed",
                message: error.message
            };
        } finally {
            await client.end();
        }
    }
    
    static async getExchangeRate(from_currency, to_currency) {
        // fetch real-time exchange rate data to be used in transactions that involve 2 different currencies
        const url = `https://api.exchangerate-api.com/v4/latest/${from_currency}`;
        try {
            const response = await fetch(url);
            const json = await response.json();

            if (response.status == 200 && "rates" in json) {
                const exchange_rate = json["rates"][to_currency];
                if (exchange_rate) {
                    return exchange_rate;
                } else {
                    throw new Error(`Exchange rate not available for ${to_currency}`);
                }
            } else {
                throw new Error("Failed to get exchange rates");
            }
        } catch (error) {
            console.error(error.message);
        }
    };

    static calculateFee(amount) {
        // defines a fair transaction fee
        const flatFee = 0.10 // flat fee of ($0.10)
        const percentageFee = 1.5 / 100 // 1.5% of the amount

        // calculate the total fee
        const fee = flatFee + (amount * percentageFee);

        // ensure fee does not exceed 5% of the transacted amount
        return Math.min(fee, amount * 0.05).toFixed(2);
    }

    static async convertAndChange(from_currency, to_currency, amount) {
        const exchangeRate = await this.getExchangeRate(from_currency, to_currency);

        if (!exchangeRate) {
            console.error("Exchange rate could not be retreived");
            return null;
        }

        const convertedAmount = amount * exchangeRate;
        const transactionFee = this.calculateFee(amount);
        const finalAmount = convertedAmount - transactionFee;

        return {
            from_currency,
            to_currency,
            exchangeRate,
            originalAmount: amount,
            convertedAmount: convertedAmount.toFixed(2),
            transactionFee,
            finalAmount: finalAmount.toFixed(2)
        };
    }
};

// export const getPaymentById = async(payment_id) => {
//     try {
//         const query = `
//             SELECT * FROM payments
//             WHERE payment_id = $1
//         `;
//         const result = await pool.query(query, [payment_id]);
// 
//         if (result.rows.length === 0) {
//             throw new Error('Payment not found!')
//         }
//         return result.rows[0];
//     } catch (error) {
//         console.error('Error fetching payment:', error);
//         throw new Error('Could not fetch payment!');
//     }
// };

// function to update the payment status after payment is received
// export const updatePaymentStatus = async(payment_id, status) => {
//     try {
//         const client = await pool.connect();
//         const query = `
//             UPDATE payments
//             SET status = $1, updated_at = NOW()
//             WHERE payment_id = $2
//             RETURNING *;
//         `;
//         const values = [status, payment_id];
// 
//         const result = await client.query(query, values);
//         return result.rows[0];
// 
//         client.release();
//     } catch (error) {
//         console.error('Error updating payment status: ', error);
//         throw new Error('Could not update payment status');
//     }
// };

// export const getPaymentByUserId = async (user_id) => {
//     try {
//         const client = await pool.connect();
//         const query = `
//             SELECT * FROM payments
//             WHERE user_id = $1
//             ORDER BY created_at DESC
//         `;
//         const result = await pool.query(query, [user_id]);
//         return result.rows[0];
// 
//         client.release();
//     } catch (error) {
//         console.error('Error fetching payments:', error);
//         throw new Error('Could not fetch payments');
//     }
// };

