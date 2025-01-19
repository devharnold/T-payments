import { Pool } from 'pg';
import { v4 as uuidv4 } from uuid;
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import BaseModel from './basemodel.js';
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

export default class User extends BaseModel {
    constructor (first_name, last_name, phone_number, user_email, password, user_id, paypal_id) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.phone_number = phone_number;
        this.user_email = user_email;
        this.password = password;
        this.user_id = user_id;
        this.paypal_id = paypal_id
    }

    /**
     * Function to generate a unique user_id for each users
     * @param {string} user_id -> the user_id generated
     * @returns {string} a unique user id
     */
    static generateUserId(user_id) {
        const prefix = 'id';
        // generate a unique id and shorten to first 8 characters
        const user_id = uuidv4().split('-')[0];
        // combine prefix and the unique user_id
        return `${prefix}-${user_id}`;
    }

    // create a user in the database
    static async createUser(pool, { first_name, last_name, phone_number, user_email, password }) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const user_id = this.generateUserId();

            const client = await pool.connect();

            const query = `
                INSERT INTO users(user_id, first_name, last_name, phone_number, user_email, password)
                VALUES($1, $2, $3, $4, $5, $6)
                RETURNING *;
            `;
            const values = [user_id, first_name, last_name, phone_number, user_email, hashedPassword];
            const result = await client.query(query, values);
            client.release();

            return result.rows[0];
        } catch(error) {
            console.error('Error inserting user into the database: ', error.message);
            throw new Error('Failed to create new user');
        }
    }

    getUserDetails() {
        return {
            first_name: this.first_name,
            last_name: this.last_name,
            user_email: this.user_email,
            phone_number: this.phone_number,
            paypal_id: this.paypal_id
        };
    }
};

