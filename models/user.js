const { DataTypes } = require('sequelize');
const db = require('../db');

const User = db.define('User', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false, unique: true }
});

module.exports = { User };