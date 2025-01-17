import User from "../models/user.js";
import crypto from 'crypto-js';
import bcrypt from 'bcrypt.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Pool } from "pg";
const secretKey = process.env.JWT_SECRET;

import { authService } from '../middlewares/authService.js';

export default class userController {
    constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
    }

    async registerUser(req, res) {
        const { first_name, last_name, phone_number, user_email, password } = req.body;

        if (!first_name || !last_name || !phone_number || !user_email || !password) {
            return res.status(400).json({ error: 'missing requirements' });
        }
        try {
            const newUser = await User.createUser(this.pool, { first_name, last_name, phone_number, user_email, password });
            res.status(201).json({ message: 'User created successfully', user: newUser });
        } catch (error) {
            console.error('Error in register: ', error);
            res.status(500).json({ message: 'Server Error' });
        }
    }

    async userLogin(req, res) {
        const { user_email, password } = req.body;

        if (!user_email || !password ) {
            return res.status(400).json({error: 'Missing fields' });
        }
        try {
            const client = await this.pool.connect();
            if(!client) {
                return res.status(500).json({ message: 'Failed. Database Error' });
            }
            // const user = await User.findOne({ where: { user_email } });
            const user = 'SELECT user_email FROM users WHERE user_id = $1';
            const result = await this.pool.query(query, [user_id]);

            client.release();

            if(!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) {
                return res.status(401).json({ error: 'Invalid Credentials' });
            }

            const token = generateToken(user);
            res.json({ token });

            client.release();
        } catch (error) {
            console.error('Error tryint to login:', error);
            return res.status(500).json({ error: 'Server Error', error });
        }
    }

    async searchUser(req, res) {
        const { first_name, last_name, user_id } = req.body;

        try {
            const client = await this.pool.connect();
            const user = 'SELECT first_name, last_name FROM users where user_id = $1';
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            client.release();
        } catch (error) {
            console.error('Error trying to complete your request');
            throw new Error;
        }
    }

    async updateUser(req, res) {
        const { user_id, password } = req.body;
        try {
            const client = await pool.connect();
            const user = 'SELECT user_email FROM users WHERE user_id = $1';
            const result = await this.pool.query(query, [user_id]);
            // const user = await User.findByPk({ where: { user_id } });
            if(!user) {
                return res(404).json({ error: 'User not found' });
            }
            const validatePassword = (password) => {
                const isValidLength = password.length >= 8;
                const hasUpperCase = /[A-Z]/.test(password);
                const hasLowerCase = /[a-z]/.test(password);
                const hasNumber = /\d/.test(password);
    
                return isValidLength && hasUpperCase && hasLowerCase && hasNumber;
            }
            if (password) {
                if (!validatePassword(password)) {
                    return res.status(400).json({ message: 'Make sure password meets requirements' });
                }
                const saltRounds = 10;
                const hashPassword = await bcrypt.hash(password, saltRounds);
                user.password = hashPassword;
            }
            client.release();
        } catch (error) {
            return res.status(500).json({ error: 'Error', error });
        }
    };
    
    async generateToken(user) {
        const payload = {
            id: user.user_id,
            email: user.user_email,
            role: user.user
        };
        return jwt.sign(payload, secretKey, { expiresIn: '30mins' })
    }
};

//     static async verifyPassword(pool, { user_email, password }) {
//         try {
//             const client = await pool.connect();
//             const query = `SELECT password FROM users WHERE user_email = $1`;
//             const result = await client.query(query, [user_email]);
//             client.release();
// 
//             if (result.rows.length === 0) {
//                 throw new Error('user not found');
//             }
//             const { password: storedHash } = result.rows[0];
//             const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
// 
//             return hashedPassword === storedHash;
//         } catch(error) {
//             console.error('Error trying to verify password');
//             throw new Error;
//         }
//     }
// }

// 
// export async function deleteUser(req, res) {
//     try {
//         const pool = new Pool({
//             host: process.env.DB_HOST,
//             port: process.env.DB_PORT,
//             database: process.env.DB_NAME,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASSWORD
//         })
//         await pool.connect();
//
//         if(!pool) {
//             return(500).json({ error: 'Database Error' });
//         }
//         const { user_email, password } = req.body;
//         const user = await User.findOne({ where: { user_email } });
//         if (!user) {
//             return res.status(400).json({ error: 'User not found' });
//         }
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({ error: 'Invalid credentials' });
//         }
//         await user.destroy();
//         return res.status(200).json({ message: 'User deleted successfully' })
//     } catch(err) {
//         console.error('Error deleting user: ', err.message);
//         res.status(500).json({ error: 'Error occured while deleting user. Please try again later' });
//     }
// }

// export default function generateToken(user) {
//     const payload = {
//         id: user.user_id,
//         email: user.user_email,
//         role: user.user
//     };
//     return jwt.sign(payload, secretKey, { expiresIn: '2hrs' });
// }