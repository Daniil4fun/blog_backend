const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        return next();
    }
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        jwt.verify(token, process.env.SECRET_KEY);
        
        req.personalToken = token;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Токен истек", subcode: 10 });
        }
        return res.status(401).json({ message: "Не авторизован" });
    }
}