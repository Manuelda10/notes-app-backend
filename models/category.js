const { sequelize, Sequelize } = require('./db')

const Category = sequelize.define('category', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
}, {
    timestamps: false
})

module.exports = Category