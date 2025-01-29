const Router = require('express');
const router = new Router();
const postRouter = require('./postRouter');
const userRouter = require('./userRouter');

router.use('/posts', postRouter);
router.use('/user', userRouter);

module.exports = router;