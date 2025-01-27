"use strict";

import dotenv from 'dotenv';
import express from 'express';
dotenv.config();
const app = express();
const router = express.Router();

import userController, { registerUser, userLogin, updateUser, searchUser } from '../controllers/userController.js';
// import { User } from '../models/user.js';
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



export default router;