const { Note, Category, CategoryNote } = require('../models/association')
const notesRouter = require('express').Router()

notesRouter.post('/', async (req, res) => {
    const { title, content, active, categories } = req.body
    // Categories are received as an array
    if (!title) {
        return res.status(400).send({
            message: 'Content can not be empty'
        })
    }

    const note = {
        title,
        content,
        date: new Date(),
        active: active === undefined ? true : active
    }

    try {
        const savedNote = await Note.create(note)
        if (categories !== null && categories !== undefined) {
            for (const category of categories) {
                const [newCategory, created] = await Category.findOrCreate({
                    where: {name : category}
                })
                newCategory.addNotes(savedNote)
            }
        }

        res.status(201).json(savedNote)
    } catch (err) {
        res.status(500).send({
            message: err.message || 'An error ocurred while creating the note'
        })
    }
})

notesRouter.get('/all', async (req, res) => {
    try {
        const notes = await Note.findAll({})
        res.json(notes)
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Some error ocurred while retreving notes'
        })
    }
})

notesRouter.get('/active', async (req, res) => {
    try {
        const notes = await Note.findAll({
            where: {active: true}
        })
        res.json(notes)
    } catch (err) {
        res.status(500).send({
            message: `Some error ocurred while retrieving archived notes`
        })
    }
})

notesRouter.get('/archived', async (req, res) => {
    try {
        const notes = await Note.findAll({
            where: {active: false}
        })
        res.json(notes)
    } catch (err) {
        res.status(500).send({
            message: err.message || 'Some error ocurred while retrieving archived notes'
        })
    }
})

notesRouter.get('/all/:id', async (req, res) => {
    const id = req.params.id
    try {
        const note = await Note.findByPk(id)
        res.send(note)
    } catch (err) {
        res.status(500).send({
            message: `Error retrieving Note with id: ${id}`
        })
    }
})

notesRouter.get('/:id/categories', async (req, res) => {
    const id = req.params.id
    const categories = []
    try {
        const matchedCategories = await CategoryNote.findAll({
            where: { noteId: id },
            attributes: ['categoryId']
        })
        for (const mCategory of matchedCategories) {
            const category = await Category.findByPk(mCategory.dataValues.categoryId)
            categories.push(category)
        }

        res.json(categories)
    } catch (err) {
        res.status(500).send({
            message: `Error retrieving categories of Note with id: ${id}`
        })
    }

})

notesRouter.put('/:id', async (req, res) => {
    const id = req.params.id
    const { title, content, active, categories } = req.body

    try {
        const updatedNote = await Note.update({ title, content, active }, {
            where: {id: id}
        })

        if (categories === undefined || categories === null) {
            if (updatedNote == 1) {
                return res.send({
                    message: 'Note was updated successfully'
                })
            } else {
                return res.send({
                    message: `Cannot update Note with id ${id}. Maybe is not found or req.body is empty`
                })
            }
        }

        const categoryNotes = await CategoryNote.findAll({
            where: { noteId: id },
            attributes: ['categoryId']
        })
        const rCategories = [] //Registered categories names
        for (const catN of categoryNotes) {
            const cat = await Category.findByPk(catN.dataValues.categoryId)
            rCategories.push(cat.dataValues.name)
        }
        const deleteCategories = rCategories.filter(el => !categories.includes(el))
        const deleteIdCategories = [] //Categories that are going to be deleted
        for (const dCat of deleteCategories) {
            const cat = await Category.findOne({
                where: {name: dCat}
            })
            deleteIdCategories.push(cat.dataValues.id)
        }

        // If there is categories to delete
        if (deleteIdCategories.length > 0) {
            for (const dCatId of deleteIdCategories) {
                const deletedCN = await CategoryNote.destroy({
                    where: {noteId: id,categoryId: dCatId}
                })
                if (deletedCN != 1) {
                    res.send({
                        message: 'Note was updated successfully but Category was not. There is a problem'
                    })
                }

                //We identify if there is a category that needs to be deleted on category table because is not be using
                const cateN = await CategoryNote.findOne({
                    where: {categoryId: dCatId}
                })

                if (cateN === null || cateN === undefined) {
                    const deletedCategory = await Category.destroy({
                        where: {id: dCatId}
                    })
                    if (deletedCategory != 1) {
                        res.send({
                            message: 'Note and Category were updated successfully but the category couldnt be deleted from Category table'
                        })
                    }
                }
            }
        }

        const note = await Note.findByPk(id) //Get the note to update categories related to it
        for (const cat of categories) { //Find or create the notes depending of if they are registerd
            const [newCategory, created] = await Category.findOrCreate({
                where: {name: cat}
            })
            if (created === true) {
                note.addCategories(newCategory)
            }
        }

        if (updatedNote == 1) {
            res.send({
                message: 'Note and its categories were updated successfully'
            }) 
        } else {
            res.send({
                message: 'Cannot update Note with id ${id}. Maybe is not found or req.body is empty.'
            })
        }
    } catch (err) {
        res.status(500).send({
            message: `Error updating Note with id ${id}`
        })
    }
})

notesRouter.delete('/:id', async (req, res) => {
    const id = req.params.id
    try {

        const categoriesNote = await CategoryNote.findAll({
            where: {noteId: id}
        })

        const deletedNote = await Note.destroy({
            where: { id: id }
        })

        for (const catN of categoriesNote) {
            const cateN = await CategoryNote.findOne({
                where: {categoryId: catN.dataValues.categoryId} 
            }) 

            if (cateN === null || cateN === undefined) {
                const deletedCategory = await Category.destroy({
                    where: {id: catN.dataValues.categoryId }
                })
                if (deletedCategory != 1) {
                    res.send({
                        message: 'Note and CategoryNote were deleted successfully but the category couldnt be deleted from Category table'
                    })
                }
            }
        }

        

        if (deletedNote == 1) {
            res.send({
                message: 'Note was deleted successfully'
            })
        } else {
            res.send({
                message: `Cannot delete Note with id:${id}. Maybe was not found`
            })
        }
    } catch (err) {
        res.status(500).send({
            message: `Could not delete Note with id: ${id}`
        })
    }
})

module.exports = notesRouter