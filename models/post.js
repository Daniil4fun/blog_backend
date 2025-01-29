const { DataTypes } = require("sequelize");
const db = require("../db");

const Post = db.define('Post', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    media: { type: DataTypes.JSON, allowNull: true }
});

module.exports = { Post };