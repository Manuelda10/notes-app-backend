require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()

const db = require('./models/db')
db.sequelize.sync({})

const notesRouter = require('./controllers/notes')
const categoriesRouter = require('./controllers/categories')

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
    res.send('<h1>NOTES API</h1>')
})

app.use('/api/notes', notesRouter)
app.use('/api/categories', categoriesRouter)

const PORT = process.env.PORT || 3030

const server = app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`)
})

module.exports = {app, server}