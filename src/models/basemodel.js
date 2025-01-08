import { Client } from 'pg';
import { uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { DateTime } from 'luxon';
dotenv.config();

class BaseModel {
    constructor(args={}) {
        // class constructor 
        this.id = args.id || uuidv4();
        // if provided in args, they are parsed using `DateTime.fromISO()` 
        // if not they default to current UTC time
        this.created_at = args.created_at ? DateTime.fromISO(args.created_at) : DateTime.utc();
        this.updated_at = args.updated_at ? DateTime.fromISO(args.updated_at) : DateTime.utc();

        // checks if there is any additional properties parsed in args and adds them to the instance
        if (args && Object.keys(args).length > 0) {
            for (const [key, value] of Object.entries(args)) {
                if (key !== __class__) {
                    this[key] == value;
                }
            }
        }
    }

    toString() {
        // String representation of the object
        return `[${this.constructor.name}] (${this.id}) ${JSON.stringify(this)}`;
    }
    async save() {
        // this method updates the `updated_at` field to the current UTC time
        // then establishes a DB connection, constructs an insert query and does it's thing
        this.updated_at = DateTime.utc();

        const client = await this.getDbConnection();
        const query = `
            INSERT INTO models (id, created_at, updated_at)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO UPDATE
            SET updated_at = EXCLUDED.updated_at;
        `;
        const values = [this.id, this.created_at.toISO(), this.updated_at.toISO()];

        await client.query(query, values);
        await client.end();
    }

    toDict() {
        // method to convert the object to a dictionary
        // returns a new object with all the properties of the current instance
        const newDict = { ...this };
        if (newDict.created_at) {
            newDict.created_at = newDict.created_at.toISO();
        }
        if (newDict.updated_at) {
            newDict.updated_at = newDict.updated_at.toISO();
        }
        newDict.__class__ = this.constructor.name;
        return newDict;
    }

    async delete() {
        // method to delete the object
        const client = await this.getDbConnection();
        const query = "DELETE FROM models WHERE id = $1";
        await client.query(query, [this.id]);
        await client.end();
    }

    static async getDbConnection() {
        // establish a database connection
        const client = new Client({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        await client.connect();
        return client;
    }
};

export default BaseModel;