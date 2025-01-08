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
        const createSequence = `
            CREATE SEQUENCE IF NOT EXISTS payment_id_seq
            START WITH 1
            INCREMENT BY 1;
        `;
        await client.query(createSequence);
        console.log('Sequence "payment_id_seq" created or already exists!');

        const createTransactionsTable = `
            CREATE TABLE IF NOT EXISTS transactions (
                transaction_id SERIAL PRIMARY KEY,
                sender_id INTEGER NOT NULL REFERENCES users(id),
                receiver_id INTEGER NOT NULL REFERENCES users(id),
                amount NUMERIC(10, 2) NOT NULL,
                currency VARCHAR(10) NOT NULL CHECK (currency IN('USD', 'EUR', 'GBP', 'KES')),
                transaction_status VARCHAR(20) DEFAULT 'pending' CHECK (transaction_status IN('pending', 'completed', 'failed')),
                payment_method_id INTEGER NOT NULL REFERENCES payment_methods(payment_method_id),
                description TEXT,
                reference_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_At TIMESTAMP DEFAULT NOW()
            );
        `;
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER DEFAULT nextval('account_id') PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                phone_number INTEGER NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                paypal_id VARCHAR(100) UNIQUE,
                paypal_email VARCHAR(100) UNIQUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;
        const createPaymentMethodsTable = `
            CREATE TABLE IF NOT EXISTS payment_methods (
                payment_method_id PRIMARY KEY,
                user_id REFERENCES users(id),
                method_type VARCHAR(20) NOT NULL CHECK (method_type IN('credit card', 'mobile money', 'debit card')),
                details JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;
        const createAccountsTable = `
            CREATE TABLE IF NOT EXISTS accounts (
                account_id BIGINT PRIMARY KEY,
                user_id REFERENCES users(user_id),
                account_type VARCHAR(50) NOT NULL CHECK (account_type IN('savings', 'business', 'current)),
                balance NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
                currency VARCHAR(10) NOT NULL CHECK (currency IN('KES', 'USD', 'GBP', 'EUR')),
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
                currency VARCHAR(10) NOT NULL CHECK (currency IN('KES', 'USD', 'GBP', 'EUR')),
                billing_cycle VARCHAR(20) NOT NULL CHECK(billing_cycle IN('Monthly', 'Weekly', 'Annually', 'Daily')),
                next_billing_date DATE NOT NULL,
                status VARCHAR(20) NOT NULL CHECK(status IN('active', 'cancelled', 'expired')),
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;
        await client.query(createTransactionsTable);
        await client.query(createUsersTable);
        await client.query(createPaymentMethodsTable);
        await client.query(createAccountsTable);
        await client.query(createSubscriptionsTable)
        console.log('Table "payments" created or already exists');
        console.log('Table "users" created successfully!')
    } catch (error) {
        console.error('Error setting up database structure: ', error);
    } finally {
        await client.end();
        console.log('Connection closed')
    }
};
