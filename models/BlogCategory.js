const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class BlogCategory extends Model {}

BlogCategory.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'BlogCategory',
    timestamps: true,
    paranoid: true // Enables soft delete
});

// Define associations
BlogCategory.associate = (models) => {
    BlogCategory.hasMany(models.BlogPost, {
        foreignKey: 'categoryId',
        as: 'BlogPosts'
    });
};

module.exports = BlogCategory; 