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

        const createPaymentsTable = `
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER DEFAULT nextval('payment_id_seq') PRIMARY KEY,
                user_id INTEGER NOT NULL,
                amount NUMERIC(10, 2) NOT NULL,
                payment_method VARCHAR(20) NOT NULL CHECK (paymentMethod IN ('credit card', 'debit card', 'mobile money')),
                status VARCHAR(20) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `;
        await client.query(createPaymentsTable);
        console.log('Table "payments" created or already exists');
    } catch (error) {
        console.error('Error setting up database structure: ', error);
    } finally {
        await client.end();
        console.log('Connection closed')
    }
};
