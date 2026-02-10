import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    let token = req.headers.token;

    // ALSO support Authorization: Bearer <token>
    if (!token && req.headers.authorization) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.json({ success: false, message: 'Not Authorized. Login Again' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.body.userId = decoded.id;
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

export default authMiddleware;
