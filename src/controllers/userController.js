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
            const client = await this.pool.connect();
            const newUser = await User.createUser(this.pool, { first_name, last_name, phone_number, user_email, password });
            res.status(201).json({ message: 'User created successfully', user: newUser });
            client.release();
        } catch (error) {
            console.error('Error in register: ', error);
            res.status(500).json({ message: 'Server Error' });
        }
    };

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
            const query = 'SELECT user_email FROM users WHERE user_email = $1';
            const result = await this.pool.query(query, [user_email]);
            const user = result.rows[0]

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

        } catch (error) {
            console.error('Error trying to login:',);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    async searchUser(req, res) {
        const { user_id } = req.body;

        try {
            const client = await this.pool.connect();
            const query = 'SELECT first_name, last_name FROM users where user_id = $1';
            const result = await this.pool.query(query, user_id);
            const user = result.rows[0];
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            client.release();
        } catch (error) {
            console.error('Error trying to complete your request');
            return res.status().json({ error: 'Internal Server Error' })
        }
    };

    async updateUser(req, res) {
        const { user_id, password } = req.body;
        try {
            const client = await pool.connect();
            const query = 'SELECT user_email FROM users WHERE user_id = $1';
            const result = await this.pool.query(query, [user_id]);
            const user = result.rows[0];
            client.release();
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
        } catch (error) {
            console.error('Error trying to complete your request')
            return res.status(500).json({ error: 'Internal Server Error' });
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

