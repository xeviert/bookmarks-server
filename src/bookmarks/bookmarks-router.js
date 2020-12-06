const express = require('express')
const { v4: uuid } = require('uuid')
const { isWebUri } = require('valid-url')
const logger = require('../logger')
const { bookmarks } = require('../store')

// CHANGE LOCATION BOOKMARKS GET PUSHED TO. .location(~~~)

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res
        .json(bookmarks)
    })
    .post(bodyParser, (req, res) => {
        const { title, url, description, rating } = req.body

        if (!title) {
            logger.error('TItle is required');
            return res
                .status(400)
                .send('Invalid data')
        }
        if (!isWebUri(url)) {
            logger.error('Invalid URL. Must contain http://')
                .status(400)
                .send('Invalid data')
        }
        
        const id = uuid();

        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        }

        bookmarks.push(bookmark);

        logger.info(`Bookmark created with ${id} as id`);

        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${id}`)
            .json(bookmark);
    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => {
        const { id } = req.params;
        const bookmark = bookmarks.find(b => b.id == id);

        if (!bookmark) {
            logger.error(`Bookmark with id ${id} not found`)
            return res
                .status(404)
                .send('Bookmark not found')
        }
        res.json(bookmark)
    })
    .delete((req, res) => {
        const { id } = req.params;

        const bookmarkIndex = bookmarks.findIndex(b => b.id == id);

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`)
            return res 
                .status(400)
                .send('Not found')
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Card with id ${id} deleted`);

        res
            .status(204)
            .end()

    })

module.exports = bookmarkRouter