// Implementation of the account class model
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

export default class Accounts extends BaseModel {
    constructor(account_id, password, user_id, category, currency, status) {
        this.account_id = account_id
        this.password =  User.password();
        this.user_id = user_id;
        this.category = category;
        this.currency = currency;
        this.status = status;
    }
    // for userAccounts
    static generateUserAccountId() {
        const prefix = 'accNum';
        // removes all the hyphens from the genrated account_number by uuid then picks up the first 8 characters
        const u_account_id = uuidv4().replace(/-/g, '').slice(0, 8);
        return `${prefix}-${u_account_id}`;
    };

    static async createUserAccount(pool, { user_id, u_account_id, password, currency, balance=0.00 }) {
        try {
            // const saltRounds = 10;
            // const hashedPin = await bcrypt.hash(pin, saltRounds);
            // const account_number = this.generateAccountId();

            const available_currencies = ['KES', 'USD', 'GBP'];
            if(!available_currencies.includes(currency)) {
                console.error(`Unavailable currency. Available currencies are: ${available_currencies.join(', ')}`);
            }

            const client = await pool.connect();
            if (!client) {
                return res.status(500).json({ error: 'Error connecting' });
            }
            const query = `
                INSERT INTO user_accounts(user_id, account_id, currency, balance)
                VALUES($1, $2, $3, $4, $5)
                RETUNING *;
            `;
            const values = [u_account_id, user_id, password, category, currency, balance=0.00];
            const result = await client.query(query, values);
            client.release();

            return result.rows[0];
        } catch(error) {
            console.error('Error within the database: ', error.message);
            throw new Error('Failed to createa new account');
        }
    };

    static getUserAccountDetails() {
        return {
            u_account_id: this.u_account_id,
            user_id: this.user_id,
            currency: this.currency,
            balance: this.balance
        }
    };
};