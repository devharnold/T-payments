import Accounts from "../models/account.js";
import { Pool } from "pg";
import dotenv from 'dotenv';
dotenv.config();


export default class userAccountsController {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
    }
    
    async createUserAccount(req, res) {
        const { user_id, currency, amount, u_account_id } = req.body;

        if (!user_id || !currency || !amount) {
            return res.status(400).json({message: "Missing requirements"});
        }
        try {
            const client = await this.pool.connect();
            const newUserAccount = Accounts.createUserAccount(this.pool, { user_id, currency, amount, u_account_id });
            res.status(201).json({ Message: "User Account Created!" });
            client.release();
        } catch(error) {
            console.error('Error creating account', error);
            res.status(500).json({ Message: 'Server Error' });
        }
    }
};
