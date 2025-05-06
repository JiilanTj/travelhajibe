'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BlogPosts', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      excerpt: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      featuredImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metaTitle: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metaDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metaKeywords: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        defaultValue: 'draft'
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      authorId: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'BlogCategories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      viewCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Add indexes for better performance and SEO
    await queryInterface.addIndex('BlogPosts', ['slug']);
    await queryInterface.addIndex('BlogPosts', ['status', 'publishedAt']);
    await queryInterface.addIndex('BlogPosts', ['authorId']);
    await queryInterface.addIndex('BlogPosts', ['categoryId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BlogPosts');
  }
};
