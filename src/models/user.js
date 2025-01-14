import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Client } from 'pg';
import BaseModel from './basemodel.js';
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

/**
 * User class model. Creates a new user and saves in the database
 * @param: {string} first_name
 * @param: {string} last_name
 * @param: {integer} phone_number
 * @param: {string} email
 * @param: {string} passwordHash
 * @returns: {Promise<Object>}
 */

export default class User {
    constructor(first_name, last_name, user_email, password, paypal_id) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.user_email = user_email;
        this.password = password;
        this.paypal_id = paypal_id;
    }

    createUser(first_name, last_name, user_email, phone_number, password) {
        const saltRounds = 10;

        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
                console.error('Error generating salt: ', err);
                return callback(err);
            }
            const query = `
                INSERT INTO users (first_name, last_name, phone_number, user_email, password)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            const values = [first_name, last_name, phone_number, user_email, password];

            pool.query(query, values, (err, result) => {
                if (err) {
                    console.error('Error inserting user into database: ', err);
                    return callback(err);
                }
                return callback(null, result.rows[0]);
            })
        })
    }

    passwordHash(password) {
        if(!password || typeof password !== 'string' || password.length < 8) {
            throw new Error('Invalid. Password must be of more than 8 characters');
        }
        const salt = crypto.randomBytes(16).toString('hex');
        const password_hash = crypto.sha256(password, salt, 1000, 64, 'sha256').toString('hex');
    }

    verifyPassword(password) {
        const [salt, storedHash] = this.passwordHash.split('.');
        const hash = crypto.sha256(pin, salt, 1000, 64, 'sha256').toString('hex');
        return hash === storedHash;
    }

    getUserDetails() {
        return {
            user_id: this.user_id,
            user_email: this.user_email,
            first_name: this.first_name,
            last_name: this.last_name,
            paypal_id: this.paypal_id
        }
    }
};
