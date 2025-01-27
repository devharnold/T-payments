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

export default class Accounts {
    constructor(account_id, password, user_id, category, currency, status) {
        this.account_id = account_id
        this.password =  password;
        this.user_id = user_id;
        this.category = category;
        this.currency = currency;
        this.status = status;
    }
    static generateAccountId() {
        const prefix = 'accNum';
        // removes all the hyphens from the genrated account_number by uuid then picks up the first 13 characters
        const account_id = uuidv4().replace(/-/g, '').slice(0, 13);
        return `${prefix}-${account_id}`;
    };

    static validateCategory(category) {
        const validateCategories = ['Business', 'Single-user', 'Multi-user'];
        if (!validateCategories.includes(category)) {
            console.error(`Invalid category. Valid categories are: ${validateCategories.join(', ')}`);
        }
        return category;
    };

    static async createAccount(pool, { pin, currency}) {
        try {
            const saltRounds = 10;
            const hashedPin = await bcrypt.hash(pin, saltRounds);
            const account_number = this.generateAccountId();
            const category = this.validateCategory();

            const available_currencies = ['KES', 'USD', 'GBP'];
            if(!available_currencies.includes(currency)) {
                console.error(`Unavailable currency. Available currencies are: ${available_currencies.join(', ')}`);
            }

            const client = await this.pool.connect();
            if (!client) {
                return res.status(500).json({ error: 'Error connecting' });
            }
            const query = `
                INSERT INTO accounts(account_id, password, user_id, category, currency)
                VALUES($1, $2, $3, $4, $5)
                RETUNING *;
            `;
            const values = [account_id, user_id, password, category, currency];
            const result = await client.query(query, values);
            client.release();

            return result.rows[0];
        } catch(error) {
            console.error('Error within the database: ', error.message);
            throw new Error('Failed to createa new account');
        }
    };

    static getAccountDetails() {
        return {
            account_id: this.account_id,
            user_id: this.user_id,
            category: this.category,
            currency: this.currency
        }
    };
};
// export default class Accounts {
//     constructor(account_id, account_number, pin, user_id, category, currency, status) {
//         this.account_id = account_id;
//         this.account_number = account_number;
//         this.category = this.validateCategory(category);
//         this.pin = pin;
//         this.user_id = user_id;
//         this.currency = currency;
//         this.status = status;
//     }
// 
//     validateCategory(category) {
//         const validateCategories = ['Business', 'Single-user', 'Multi-user'];
//         if (!validateCategories.includes(category)) {
//             throw new Error(`Invalid category. Valid categories are : ${validateCategories.join(', ')}`);
//         }
//         return category;
//     }
// 
//     hashPin(Pin) {
//         if (!pin || typeof pin !== 'number' || pin.length < 4) {
//             throw new Error('Invalid PIN. It must be of 4 numbers');
//         }
//         const salt = crypto.randomBytes(16).toString('hex');
//         const hash = crypto.sha256(pin, salt, 100, 64, 'sha256').toString('hex');
//     }
//     
//     verifyPin(pin) {
//         const [salt, storedHash] = this.hashPin.split('.');
//         const hash = crypto.sha256(pin, salt, 100, 64, 'sha256').toString('hex');
//         return hash === storedHash;
//     }
// 
//     getAccountDetails() {
//         return {
//             account_id: this.account_id,
//             account_number: this.account_number,
//             user: this.user,
//             category: this.category
//         };
//     }
// };