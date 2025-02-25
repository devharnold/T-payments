// The payments db structure
import { Client } from 'pg';
import dotenv from 'dotenv';
dotenv.config()

// Database connection
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    user: process.env.DB_USER
});

// Function to create the database structure
export const setUpDatabase = async () => {
    try {
        await client.connect();
        console.log('Connected to the database');

        // create the sequence
        // const createSequence = `
        //     CREATE SEQUENCE IF NOT EXISTS payment_id_seq
        //     START WITH 1
        //     INCREMENT BY 1;
        // `;
        // await client.query(createSequence);
        // console.log('Sequence "payment_id_seq" created or already exists!');

        // const createTransactionsTable = `
        //     CREATE TABLE IF NOT EXISTS transactions (
        //         transaction_id SERIAL PRIMARY KEY,
        //         user_id INTEGER NOT NULL REFERENCES users(id),
        //         b_account_id INTEGER NOT NULL REFERENCES business_accounts(b_account_id),
        //         amount NUMERIC(10, 2) NOT NULL,
        //         transaction_fees NUMERIC(10, 2) NOT NULL,
        //         currency VARCHAR(10) NOT NULL CHECK (currency IN('USD', 'EUR', 'GBP', 'KES')),
        //         transaction_status VARCHAR(20) DEFAULT 'pending' CHECK (transaction_status IN('pending', 'completed', 'failed')),
        //         description TEXT,
        //         reference_id VARCHAR(255),
        //         created_at TIMESTAMP DEFAULT NOW(),
        //         updated_At TIMESTAMP DEFAULT NOW()
        //     );
        // `;
        // const createUsersTable = `
        //     CREATE TABLE IF NOT EXISTS users (
        //         user_id INTEGER PRIMARY KEY,
        //         first_name VARCHAR(50) NOT NULL,
        //         last_name VARCHAR(50) NOT NULL,
        //         phone_number INTEGER NOT NULL,
        //         user_email VARCHAR(100) UNIQUE NOT NULL,
        //         password VARCHAR(255) NOT NULL,
        //         paypal_id VARCHAR(100) UNIQUE,
        //         paypal_email VARCHAR(100) UNIQUE,
        //         created_at TIMESTAMP DEFAULT NOW(),
        //         updated_at TIMESTAMP DEFAULT NOW()
        //     );
        // `;
        // const createPaymentMethodsTable = `
        //     CREATE TABLE IF NOT EXISTS payment_methods (
        //         payment_method_id PRIMARY KEY,
        //         user_id REFERENCES users(user_id),
        //         method_type VARCHAR(20) NOT NULL CHECK (method_type IN('credit card', 'mobile money', 'debit card')),
        //         details JSONB NOT NULL,
        //         created_at TIMESTAMP DEFAULT NOW(),
        //         updated_at TIMESTAMP DEFAULT NOW()
        //     );
        // `;
        // const createUserAccountsTable = `
        //     CREATE TABLE IF NOT EXISTS user_accounts (
        //         account_id PRIMARY KEY,
        //         user_id REFERENCES users(user_id),
        //         balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
        //         currency VARCHAR(10) NOT NULL CHECK (currency IN('KES', 'USD', 'GBP')),
        //         status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'suspended', 'closed')),
        //         created_at TIMESTAMP DEFAULT NOW(),
        //         updated_at TIMESTAMP DEFAULT NOW()
        //     );
        // `;

        const createPaymentLogsTable = `
            CREATE TABLE IF NOT EXISTS payment_logs (
                user_account_id REFERENCES accounts(account_id),
                user_id REFERENCES users(user_id),
                payment_id VARCHAR(13) UNIQUE NOT NULL,
                currency VARCHAR(10) NOT NULL CHECH (currency IN('KES', 'USD', 'GBP')),
                payment_date TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
            );
        `;
        const createBusinessAccountsTable = `
            CREATE TABLE IF NOT EXISTS business_accounts (
                user_id REFERENCES users(user_id),
                b_account_id PRIMARY KEY,
                currency VARCHAR(10) NOT NULL CHECK (currency IN('KES', 'USD', 'GBP')),
                balance NUMERIC(10, 2) DEFAULT 0.00 NULL,
                status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'suspended', 'closed')),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;
        const createSubscriptionsTable = `
            CREATE TABLE IF NOT EXISTS subscriptions (
                user_id REFERENCES users(user_id),
                service_name VARCHAR(100) NOT NULL CHECK (service_name IN('Spotify', 'X', 'Youtube Music', 'Instagram')),
                amount NUMERIC(10, 2) NOT NULL,
                transaction_fees NUMERIC(10, 2) NOT NULL,
                currency VARCHAR(10) NOT NULL CHECK (currency IN('KES', 'USD', 'GBP')),
                billing_cycle VARCHAR(20) NOT NULL CHECK(billing_cycle IN('Monthly', 'Weekly', 'Annually', 'Daily')),
                next_billing_date DATE NOT NULL,
                status VARCHAR(20) NOT NULL CHECK(status IN('active', 'cancelled', 'expired')),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;
        //await client.query(createTransactionsTable);
        //await client.query(createPaymentMethodsTable);
        await client.query(createUserAccountsTable);
        await client.query(createBusinessAccountsTable);
        await client.query(createSubscriptionsTable)
        await client.query(createPaymentLogsTable);
        // await client.query(createUsersTable);
        console.log('Table "payments" created or already exists');
    } catch (error) {
        console.error('Error setting up database schema: ', error);
    } finally {
        await client.end();
        console.log('Connection closed')
    }
};
