// Implementation of the account class model
import { Client } from "pg";
import { Pool } from "pg";
import bcrypt from 'bcrypt';
import sha256 from "crypto-js/sha256";

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

/**
 * @param: account_id -> unique identifier of the account.
 * @param: account_number -> unique account number.
 * @param: pin -> secure password for the account
 * @param: user_id -> references users(id).
 * @param: account_type -> type of account opened.
 * @param: currency -> the currencies the account will accept.
 * @param: status -> status of the account { active, inactive }
 * @returns: the operational account
 */

export default class Accounts {
    constructor(account_id, account_number, pin, user_id, category, currency, status) {
        this.account_id = account_id;
        this.account_number = account_number;
        this.category = this.validateCategory(category);
        this.pin = pin;
        this.user_id = user_id;
        this.currency = currency;
        this.status = status;
    }

    validateCategory(category) {
        const validateCategories = ['Business', 'Single-user', 'Multi-user'];
        if (!validateCategories.includes(category)) {
            throw new Error(`Invalid category. Valid categories are : ${validateCategories.join(', ')}`);
        }
        return category;
    }

    hashPin(Pin) {
        if (!pin || typeof pin !== 'number' || pin.length < 4) {
            throw new Error('Invalid PIN. It must be of 4 numbers');
        }
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.sha256(pin, salt, 100, 64, 'sha256').toString('hex');
    }
    
    verifyPin(pin) {
        const [salt, storedHash] = this.hashPin.split('.');
        const hash = crypto.sha256(pin, salt, 100, 64, 'sha256').toString('hex');
        return hash === storedHash;
    }

    getAccountDetails() {
        return {
            account_id: this.account_id,
            account_number: this.account_number,
            user: this.user,
            category: this.category
        };
    }
}

