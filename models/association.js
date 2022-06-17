const Category = require('./category')
const Note = require('./note')
const CategoryNote = require('./categorynote')

Category.belongsToMany(Note, { through: CategoryNote })
Note.belongsToMany(Category, { through: CategoryNote })

module.exports = {Category, Note, CategoryNote}