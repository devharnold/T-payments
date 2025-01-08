import { Pool } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { Client } from 'pg';
import BaseModel from './basemodel.js';
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
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

export default async function createUser(first_name, last_name, phone_number, email, hash) {
    const saltRounds = 10;

    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            console.error('Error generating salt:', err);
            return callback(err);
        }
        const query = `
            INSERT INTO users (first_name, last_name, phone_number, email, password_hash)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [first_name, last_name, phone_number, email, hash];

        // execute query to insert new user
        pool.query(query, values, (err, result) => {
            if (err) {
                console.error('Error inserting user into database:', err);
                return callback(err);
            }
            return callback(null, result.rows[0])
        })
    })
};