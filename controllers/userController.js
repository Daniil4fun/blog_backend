const bcrypt = require('bcrypt');
const jsonWebToken = require('jsonwebtoken');
const ApiError = require('../api/apiError');
const { User } = require('../models');

const generateJwt = (id, username) => {
    return jsonWebToken.sign(
        { id, username },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
}

class UserController {
    registration = async (req, res, next) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return next(ApiError.internal("Некорректный логин или пароль"));
        }

        const candidate = await User.findOne({ where: { username } });
        if (candidate) {
            return next(ApiError.internal("Пользователь с таким логином уже существует"));
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const user = await User.create({ username, password_hash: hashPassword });

        const token = generateJwt(user.id, username);

        return res.json({ token });
    }

    login = async (req, res, next) => {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return next(ApiError.internal("Пользователь не найден"));
        }

        let comparePassword = bcrypt.compareSync(password, user.password_hash);
        if (!comparePassword) {
            return next(ApiError.internal("Указан неверный пароль"));
        }

        const token = generateJwt(user.id, user.username);

        return res.json({ token });
    }

    check = async (req, res) => {
        const token = req.personalToken
        return res.json({ token });
    }
}

module.exports = new UserController;