import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export default class AuthService {
    constructor(secret) {
        this.secret = secret || process.env.JWT_SECRET;
    }

    generateToken(user) {
        const payload = { id: user.user_id, email: user.user_email };
        return jwt.sign(payload, this.secret, { expiresIn: '1hr' });
    }

    async authenticateUser(req, res, next) {
        const token = req.header('Authorization')?.replace('Bearer ', '').trim();

        if (!token) {
            return res.status(401).json({ message: 'Access Denied' });
        }
        try {
            const decoded = jwt.verify(token, this.secret);
            req.user = decoded;
            next();
        } catch (error) {
            res.status(400).json({ message: 'Invalid Token' });
        }
    }
}