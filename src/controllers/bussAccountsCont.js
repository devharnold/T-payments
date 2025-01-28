import Accounts from "../models/account.js";
import { Pool } from "pg";
import dotenv from 'dotenv';
dotenv.config();

export default class businessAccountsController {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
    }

    async createBusinessAccount(req, res) {
        const { user_id, currency, amount, b_account_id } = req.body;

        if(!user_id || !currency || !amount || !b_account_id) {
            return res.status(400).json({Message: 'Missing required fields'});
        }
        try {
            const client = await this.pool.connect();
            const newBusinessAccount = Accounts.createBusinessAccount(this.pool, { user_id, currency, amount, b_account_id });
            return res.status(201).json({ Message: 'Business Account Created!' });
            client.release();
        } catch(error) {
            console.error('Error creating account', error);
            res.status(500).json({ message: 'Server Error' });
        }
    }
    
};