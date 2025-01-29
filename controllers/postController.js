const { v4 } = require("uuid");
const path = require('path');
const { Post, User } = require("../models");
const ApiError = require("../api/apiError");
const { existsSync, unlinkSync } = require("fs");

class PostController {
    createPost = async (req, res, next) => {
        try {
            const { userId, title, content } = req.body;

            let media = [];
            const filesNames = [];

            if (req?.files) {
                const { img } = req.files;

                media = Array.isArray(img) ? img : [img];
                media.forEach(item => {
                    let filename;
                    let category;
                    let format;

                    if (item.mimetype.split('/')[0] === 'video') {
                        const dotLastIndex = item.name.lastIndexOf('.');

                        format = item.name.slice(dotLastIndex + 1);
                        filename = v4() + '.' + format;
                        category = 'video';
                    } else {
                        format = 'jpg'
                        filename = v4() + '.jpg';
                        category = 'image';
                    }
                    item.mv(path.resolve(__dirname, '..', 'static', filename));
                    filesNames.push({ filename, category, format });
                });
            }

            const post = await Post.create({
                UserId: userId,
                title,
                content,
                media: filesNames
            });

            const postWithUser = await Post.findByPk(post.id, {
                include: [{
                    model: User,
                    attributes: ['username']
                }]
            })

            return res.status(200).json(postWithUser);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    updatePost = async (req, res, next) => {
        try {
            const { id } = req.params;
            const { title, content, deletedMedia } = req.body;

            const parsedDeletedMedia = JSON.parse(deletedMedia);

            const post = await Post.findByPk(id);

            if (parsedDeletedMedia && parsedDeletedMedia.length > 0) {
                parsedDeletedMedia.forEach(filename => {
                    const filePath = path.resolve(__dirname, '..', 'static', filename);
                    if (existsSync(filePath)) {
                        unlinkSync(filePath);
                    }
                });

                post.media = post.media.filter(media => !parsedDeletedMedia.includes(media.filename));
            }

            let newMedia = [];

            if (req?.files) {
                const { img } = req.files;
                const filesNames = [];

                const media = Array.isArray(img) ? img : [img];
                media.forEach(item => {
                    let filename;
                    let category;
                    let format;

                    if (item.mimetype.split('/')[0] === 'video') {
                        const dotLastIndex = item.name.lastIndexOf('.');
                        format = item.name.slice(dotLastIndex + 1);
                        filename = v4() + '.' + format;
                        category = 'video';
                    } else {
                        format = 'jpg';
                        filename = v4() + '.jpg';
                        category = 'image';
                    }

                    item.mv(path.resolve(__dirname, '..', 'static', filename));
                    filesNames.push({ filename, category, format });
                });

                newMedia = filesNames;
            }

            post.title = title || post.title;
            post.content = content || post.content;
            post.media = [...post.media, ...newMedia];

            await post.save();

            const updatedPost = await Post.findByPk(post.id, {
                include: [{
                    model: User,
                    attributes: ['username']
                }]
            });

            return res.status(200).json(updatedPost);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    deletePost = async (req, res, next) => {
        try {
            const { id } = req.params;

            const post = await Post.findByPk(id);

            if (post.media && post.media.length > 0) {
                post.media.forEach(media => {
                    const filePath = path.resolve(__dirname, '..', 'static', media.filename);
                    if (existsSync(filePath)) {
                        unlinkSync(filePath);
                    }
                });
            }

            await post.destroy();

            return res.status(200).json({ message: 'Пост успешно удален' });
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }

    getAllPosts = async (req, res) => {
        let { limit, page } = req.query;

        page = page || 1;
        limit = limit || 9;

        let offset = page * limit - limit;

        const posts = await Post.findAndCountAll({
            limit,
            offset,
            include: [{
                model: User,
                attributes: ['username']
            }]
        });

        return res.status(200).json(posts);
    }

    getOnePost = async (req, res) => {
        let { id } = req.params;

        const postWithUser = await Post.findByPk(id, {
            include: [{
                model: User,
                attributes: ['username']
            }]
        });

        return res.status(200).json(postWithUser)
    }
}

module.exports = new PostController;