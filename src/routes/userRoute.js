"use strict";

import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg';
dotenv.config();
const app = express();
const router = express.Router();

import { User } from '../models/user.js';
import { registerUser, userLogin } from '../controllers/userController.js';
import { authenticateUser } from '../middlewares/authUser.js';

app.use(express.json());
app.use(registerUser);
app.use(userLogin);

// get user by id
router.get('/user/:user_id', async(req, res) => {
    try {
        const pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        })
        if (!pool) {
            return res.status(500).json({ error: 'Database Error' });
        }

        const user_id = req.params.id;
        const user = await User.findByPk(user_id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).send({ message: 'OOPS! User not found' });
        }
    } catch (error) {
        console.error('Error finding the user', error);
        res.status(500).send({ message: 'server error' });
    }
});

// get user by name
// router.get('/user', async(req, res) => {
//     try {
//         const pool = new Pool ({
//             host: process.env.DB_HOST,
//             port: process.env.DB_PORT,
//             database: process.env.DB_NAME,
//             user: process.env.DB_USER,
//             password: process.env.DB_PASSWORD
//         })
//         const first_name = req.params.first_name;
//         const last_name = req.params.last_name;
//         const user = await User.findOne({ where: { first_name, last_name } });
// 
//         if (user) {
//             res.json(user);
//         } else {
//             res.status(404).json({ error: 'User not found!'});
//         }
//     } catch (error) {
//         console.error('Error trying to find user');
//         res.status().json({ error: 'Server error'});
//     }
// })

router.post('/user', async(req, res) => {
    try {
        const pool = new Pool ({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        })
        if (!pool) {
            return res.status().json({ error: 'Database Error' });
        }
        const { first_name, last_name, user_email, phone_number, password } = req.body;
        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await User.registerUser({ first_name, last_name, user_email, phone_number, password: hashPassword });
        return res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Error trying to process your service request');
        res.status(500).send({ message: 'Server Error' });
    }
});

// update a user's password
router.put('/user/:user_id', async(req, res) => {
    try {
        const pool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        })
        if (!pool) {
            return res.status().json({ error: 'Database Error' });
        }
        // only field to be updated
        const { password } = req.body;
        
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status().json({ error: 'User not found' });
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
                return res.status(400).json({ message: 'Make sure your password meets requirements'}); // this will be in instances of a bad request
            }
            const saltRounds = 10;
            const hashPassword = await bcrypt.hash(password, saltRounds);
            user.password = hashPassword;
        }
        await user.save();
        res.json({ message: 'Successfully updated user password', user });
    } catch(error) {
        res.status(500).json({ message: 'Error', error });
    }
});