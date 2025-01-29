const { Post } = require("./post");
const { User } = require("./user");

User.hasMany(Post);
Post.belongsTo(User);

module.exports = { User, Post };