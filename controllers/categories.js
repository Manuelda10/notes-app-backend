const { Note, Category, CategoryNote } = require('../models/association')
const categoriesRouter = require('express').Router()

categoriesRouter.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll({})
        res.json(categories)
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Some error ocurred while retrieving categories'
        })
    }
})

categoriesRouter.get('/:id/notes', async (req, res) => {
    const id = req.params.id
    const notes = []
    try {
        const matchedNotes = await CategoryNote.findAll({
            where: { categoryId: id },
            attributes: ['noteId']
        })
        for (const mNote of matchedNotes) {
            const note = await Note.findByPk(mNote.dataValues.noteId)
            notes.push(note)
        }
        res.json(notes)
    } catch (err) {
        res.status(500).send({
            message: err.message || `Some error ocurred while retrieving notes of Category id:${id}`
        })
    }
})

categoriesRouter.get('/:id/notes/active', async (req, res) => {
    const id = req.params.id
    const activeNotes = []

    try {
        const matchedNotes = await CategoryNote.findAll({
            where: { categoryId: id },
            attributes: ['noteId']
        })

        for (const mNote of matchedNotes) {
            const note = await Note.findByPk(mNote.dataValues.noteId)
            if (note.dataValues.active === true) {
                activeNotes.push(note)
            }
        }
        res.json(activeNotes)
    } catch (err) {
        res.status(500).send({
            message: err.message || `Some error ocurred while retrieving active notes of category id:${id}`
        })
    }
})

categoriesRouter.get('/:id/notes/archived', async (req, res) => {
    const id = req.params.id
    const archivedNotes = []

    try {
        const matchedNotes = await CategoryNote.findAll({
            where: { categoryId: id },
            attributes: ['noteId']
        })

        for (const mNote of matchedNotes) {
            const note = await Note.findByPk(mNote.dataValues.noteId)
            if (note.dataValues.active === false) {
                archivedNotes.push(note)
            }
        }
        res.json(archivedNotes)
    } catch (err) {
        res.status(500).send({
            message: err.message || `Some error ocurred while retrieving archived notes of category id:${id}`
        })
    }
})

module.exports = categoriesRouter

