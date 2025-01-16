import User from "../models/user.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Pool } from "pg";
const secretKey = process.env.JWT_SECRET;

import { authService } from '../middlewares/authService.js';

export async function registerUser(req, res) {
    try {
        /**
         * pool over client because the pool will create a new client every time
         * need arises. So pool is the most efficient way to handle this
         */
        const pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        })
        await pool.connect();
        
        if (!pool) {
            return(500).json({ error: 'Failed! Database Error' });
        }
        const { first_name, last_name, user_email, phone_number, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({ first_name, last_name, user_email, phone_number, password: hashPassword });
        pool.query(newUser);
        return res.status(201).json(newUser);
    } catch (err) {
        return res.status(500).json({ error: 'Error creating your account', err })
    }
}

export async function userLogin(req, res) {
    try {
        const pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        })
        await pool.connect();

        if (!pool) {
            return(500).json({ message: 'Failed. Database Error' });
        }

        const { user_email, password } = req.body;
        const user = await User.findOne({ where: { user_email } });
        if (user) {
            const authenticate = authService();
        }
        if (!user) {
            return(404).json({ error: "No user found!" });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res(401).json({ message: 'Invalid Credentials' });
        }
        const token = generateToken(user);
        res.json({ token });
    } catch(err) {
        return res(500).json({ error: 'Server error', err });
    }
}

export async function updateUser(req, res) {
    try {
        const pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        })
        if (!pool) {
            return res(500).json({ error: 'Connection Failed' });
        }
        const { user_id, password } = req.body;
        const user = await User.findByPk({ where: { user_id } });
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
        return res.status(500).json({ error: 'Error', error });
    }
};

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