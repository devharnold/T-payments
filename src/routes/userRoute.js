"use strict";

import dotenv from 'dotenv';
import express from 'express';
import { Pool } from 'pg';
dotenv.config();
const app = express();
const router = express.Router();

import { User } from '../models/user.js';
import userController, { registerUser, userLogin, updateUser, searchUser } from '../controllers/userController.js';
// import { authenticateUser } from '../middlewares/authUser.js';

app.use(express.json());
app.use(userController.registerUser);
app.use(userController.userLogin);
app.use(userController.updateUser);
app.use(userController.searchUser)

router.post('/login', (req, res) => userController.userLogin(req, res));
router.post('/user', (req, res) => userController.registerUser(req, res));
router.patch('/user', (req, res) => userController.updateUser(req, res));
router.get('/user', (req, res) => userController.searchUser(req, res));

// get user by id
// router.get('/user/:user_id', async(req, res) => {
//     try {
//         const client = await pool.connect();
//         const user_id = req.params.user_id;
//         
//         const query = 'SELECT * FROM users WHERE user_id = $1';
//         const result = await pool.query(query, [user_id]);
// 
//         client.release(); // Realease the database connection
// 
//         if (result.rows.length > 0) {
//             res.json(result.rows[0]);
//         } else {
//             res.status(404).json({ error: 'OOPS user not found!' });
//         }
//     } catch (error) {
//         console.error('Error finding the user', error);
//         res.status(500).send({ message: 'server error' });
//     }
// });

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
// router.post('/user', async(req, res) => {
//     try {
//         const client = await pool.connect();
// 
//         const { first_name, last_name, phone_number, user_email, password } = req.body;
// 
//         if (!first_name || !last_name || !phone_number || !user_email || password ) {
//             return res.status(400).json({ message: 'All fields are required' })
//         }
// 
//         const query = `
//             INSERT INTO users (first_name, last_name, user_email, phone_number, password)
//             VALUES ($1, $2, $3, $4, $5)
//             RETURNING *;
//         `;
//         const result = await client.query(query, [first_name, last_name, phone_number, user_email, password]);
// 
//         client.release();
//         return res.status(201).json({
//             message: 'User created',
//             user: result.rows[0]
//         });
//     } catch (error) {
//         console.error('Error trying to process your service request');
//         res.status(500).send({ message: 'Server Error' });
//     }
// });

// LOGIN a user
// router.post('/user', async(req, res) => {
//     try {
//         const client = await pool.connect();
//         if (!pool) {
//             return res.status().json({ error: 'Database Error' });
//         }
// 
//         const user = await userLogin(); // call the userLogin function
//         return res.status(200).json({ message: 'Success' });
//     } catch(error) {
//         console.error('Error trying to Login');
//         res.status(500).json({ error: 'Error', error });
//     }
// });

// update a user's password
// router.patch('/user/:user_id', async(req, res) => {
//     try {
//         const client = await pool.connect();
//         if (!pool) {
//             return res.status().json({ error: 'Database Error' });
//         }
// 
//         const user = await User.findByPk(user_id);
//         if (!user) {
//             return res.status().json({ error: 'User not found' });
//         }
//         const query = `
//             UPDATE users
//             SET password = $1, `
//         await user.updateUser();
//         return res.status(201).json({ message: 'Successfully updated user' });
//     } catch (error) {
//         res.status(500).json({ error: 'Error', error });
//     }
// })

// router.delete('/user', async(req, res) => {
// })


export default router;