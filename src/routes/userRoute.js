"use strict";

import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg';
dotenv.config();
const app = express();
const router = express.Router();

import { User } from '../models/user.js';
import { registerUser, userLogin, updateUser } from '../controllers/userController.js';
// import { authenticateUser } from '../middlewares/authUser.js';

app.use(express.json());
app.use(registerUser);
app.use(userLogin);
app.use(updateUser);

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
        await pool.connect();
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


// register a new user
router.post('/user', async(req, res) => {
    try {
        const pool = new Pool ({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        })
        await pool.connect();
        if (!pool) {
            return res.status().json({ error: 'Database Error' });
        }

        const newUser = await User.registerUser(); // call the registerUser function
        return res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Error trying to process your service request');
        res.status(500).send({ message: 'Server Error' });
    }
});

// LOGIN a user
router.post('/user', async(req, res) => {
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
            return res.status().json({ error: 'Database Error' });
        }

        const user = await userLogin(); // call the userLogin function
        return res.status(200).json({ message: 'Success' });
    } catch(error) {
        console.error('Error trying to Login');
        res.status(500).json({ error: 'Error', error });
    }
});

// update a user's password
router.patch('/user/:user_id', async(req, res) => {
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
            return res.status().json({ error: 'Database Error' });
        }

        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status().json({ error: 'User not found' });
        }
        await user.updateUser();
        return res.status(201).json({ message: 'Successfully updated user' });
    } catch (error) {
        res.status(500).json({ error: 'Error', error });
    }
})

// router.delete('/user', async(req, res) => {
// })