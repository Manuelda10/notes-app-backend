const { sequelize, Sequelize } = require('./db')

const CategoryNote = sequelize.define('categorynote', {
    categorynoteId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
}, {
    timestamps: false
})

module.exports = CategoryNote