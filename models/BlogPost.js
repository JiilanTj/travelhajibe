const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class BlogPost extends Model {}

BlogPost.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    excerpt: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    featuredImage: {
        type: DataTypes.STRING,
        allowNull: true
    },
    metaTitle: {
        type: DataTypes.STRING,
        allowNull: true
    },
    metaDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    metaKeywords: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
    },
    publishedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    authorId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'BlogCategories',
            key: 'id'
        }
    },
    viewCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'BlogPost',
    timestamps: true // Keep timestamps for createdAt and updatedAt
});

// Define associations
BlogPost.associate = (models) => {
    BlogPost.belongsTo(models.User, {
        foreignKey: 'authorId',
        as: 'author'
    });
    
    BlogPost.belongsTo(models.BlogCategory, {
        foreignKey: 'categoryId',
        as: 'category'
    });
};

module.exports = BlogPost; 