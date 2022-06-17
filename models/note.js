const { sequelize, Sequelize } = require('./db')

const Note = sequelize.define('note', {
    title: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    content: {
        type: Sequelize.STRING
    },
    date: {
        type: Sequelize.DATE
    },
    active: {
        type: Sequelize.BOOLEAN
    }
}, {
    timestamps: false
})

module.exports = Note