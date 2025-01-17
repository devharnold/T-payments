import { Pool } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Client } from 'pg';
import BaseModel from './basemodel.js';
dotenv.config();

export default class User extends BaseModel {
    constructor (first_name, last_name, phone_number, user_email, password, paypal_id) {
        this.first_name = first_name;
        this.last_name = last_name;
        this.phone_number = phone_number;
        this.user_email = user_email;
        this.password = password;
        this.paypal_id = paypal_id
    }

    // create a user in the database
    static async createUser(pool, { first_name, last_name, phone_number, user_email, password }) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const query = `
                INSERT INTO users(first_name, last_name, phone_number, user_email, password)
                VALUES($1, $2, $3, $4, $5)
                RETURNING *;
            `;
            const values = [first_name, last_name, phone_number, user_email, hashedPassword];

            const client = await pool.connect();
            const result = await client.query(query, values);
            client.release();

            return result.rows[0];
        } catch(error) {
            console.error('Error inserting user into the database: ', error);
            throw new Error;
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

