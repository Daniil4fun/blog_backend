require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const db = require('./db');
const errorHandler = require('./middleware/errorMiddleware');
const router = require('./routes/index');
const path = require('path');

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
app.use('/api', router);

app.use(errorHandler);

const startServer = async () => {
    try {
        await db.authenticate();
        await db.sync({ force: false });

        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (error) {
        console.log(`Something wrong: ${error}`);
    }
}

startServer();