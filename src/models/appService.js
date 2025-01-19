import bcrypt from 'bcrypt';
i
import { Pool } from 'pg';
import dotenv from 'dotenv';
import crypto from 'crypto-js';
dotenv.config();


/**
 * The apps application service that handles items like pin creation.
 * The pin is intended to be global in the application.
 * After creation, it will be used throughout the app's crucial activities
 */

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
})

export default class AppService extends B {
    constructor()
}