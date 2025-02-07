// Business Accounts Model

import { Client } from "pg";
import { Pool } from "pg";
import bcrypt from 'bcrypt';
import User from "./user.js";
import sha256 from "crypto-js/sha256";
import BaseModel from "./basemodel.js";

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

export default class BusinessAccounts extends BaseModel {
    constructor(b_account_id, password, user_id, category, currency, status) {
        this.b_account_id = b_account_id
        this.password =  User.password();
        this.user_id = user_id;
        this.category = category;
        this.currency = currency;
        this.status = status;
    }

    static generateBusinessAccountId() {
        const prefix = 'B-id';
        // removes all the hyphens from the generated account number by uuid then picks the first 6 characters
        const b_account_id = uuidv4().replace(/-/g, '').slice(0, 6);
        return `${prefix}-${b_account_id}`;
    };

    static async createBusinessAccount(pool, { user_id, b_account_id, password, currency, balance=0.00 }) {
        try {
            // const b_account_id = this.generateBusinessAccountId();
            const available_currencies = ['USD', 'KES', 'GBP'];
            if(!available_currencies.includes(currency)) {
                console.error(`Unavailable currency. Available currencies are: ${available_currencies.join(', ')}`);
            }
            const client = await pool.connect();
            if(!client) {
                return res.status(500).json({ error: "Error" });
            }
            const query = `
                INSERT INTO business_accounts(user_id, b_account_id, password, currency, balance)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            const values = [user_id, b_account_id, password, currency, balance=0.00];
            const result = await client.query(query, values);
            client.release();

            return result.rows[0];
        } catch(error) {
            console.error("Error", error.message);
            throw new Error("Failed to create your business account");
        }
    };

    static getBusinessAccountDetails() {
        return {
            b_account_id: this.b_account_id,
            user_id: this.user_id,
            currency: this.currency,
            balance: this.balance
        }
    };
};