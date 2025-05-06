const { Op } = require('sequelize');
const { BlogPost, BlogCategory, User } = require('../models');
const logger = require('../config/logger');
const fs = require('fs').promises;
const path = require('path');
const { getFullUrl } = require('../utils/urlHelper');
const slugify = require('slugify');
const { Sequelize } = require('sequelize');
const multer = require('multer');

// Konfigurasi multer untuk blog
const blogStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/blog');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'blog-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const blogFileFilter = (req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG & WEBP files are allowed.'), false);
    }
};

const uploadBlogImage = multer({
    storage: blogStorage,
    fileFilter: blogFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const handleBlogUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                status: 'error',
                message: 'File too large. Maximum size is 5MB'
            });
        }
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
    
    if (err.message.includes('Invalid file type')) {
        return res.status(400).json({
            status: 'error',
            message: err.message
        });
    }
    
    next(err);
};

// Create blog category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Generate slug from name
        const slug = slugify(name, { lower: true, strict: true });
        
        const category = await BlogCategory.create({
            name,
            slug,
            description
        });

        res.status(201).json({
            status: 'success',
            message: 'Blog category created successfully',
            data: category
        });
    } catch (error) {
        logger.error('Create blog category error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error creating blog category'
        });
    }
};

// Get all categories with pagination
exports.getAllCategories = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10,
            search = '',
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const whereClause = {};
        if (search) {
            whereClause.name = { [Op.iLike]: `%${search}%` };
        }

        const categories = await BlogCategory.findAndCountAll({
            where: whereClause,
            limit: +limit,
            offset: (+page - 1) * +limit,
            order: [[sortBy, sortOrder]]
        });

        res.json({
            status: 'success',
            data: categories.rows,
            pagination: {
                total: categories.count,
                pages: Math.ceil(categories.count / limit),
                page: +page,
                limit: +limit
            }
        });
    } catch (error) {
        logger.error('Get blog categories error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching blog categories'
        });
    }
};

// Create blog post
exports.createPost = async (req, res) => {
    try {
        let postData;
        try {
            postData = req.body.data ? JSON.parse(req.body.data) : req.body;
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid JSON data format'
            });
        }

        // Generate slug from title
        postData.slug = slugify(postData.title, { lower: true, strict: true });
        
        // Handle featured image
        if (req.file) {
            postData.featuredImage = `/uploads/blog/${req.file.filename}`;
        }

        // Set author as current user
        postData.authorId = req.user.id;

        // If status is published, set publishedAt
        if (postData.status === 'published') {
            postData.publishedAt = new Date();
        }

        const post = await BlogPost.create(postData);
        
        // Transform post URLs and fetch associations
        const createdPost = await BlogPost.findByPk(post.id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'fullname', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category'
                }
            ]
        });

        const transformedPost = {
            ...createdPost.toJSON(),
            featuredImage: createdPost.featuredImage ? {
                path: createdPost.featuredImage,
                url: getFullUrl(req, createdPost.featuredImage)
            } : null
        };

        res.status(201).json({
            status: 'success',
            message: 'Blog post created successfully',
            data: transformedPost
        });
    } catch (error) {
        logger.error('Create blog post error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error creating blog post'
        });
    }
};

// Get all posts with pagination and filters
exports.getAllPosts = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10,
            search = '',
            categoryId,
            status = 'published',
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const whereClause = {};
        
        // Add search condition
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { content: { [Op.iLike]: `%${search}%` } }
            ];
        }

        // Filter by category
        if (categoryId) {
            whereClause.categoryId = categoryId;
        }

        // Filter by status
        if (status !== 'all') {
            whereClause.status = status;
        }

        const posts = await BlogPost.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'fullname', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category'
                }
            ],
            limit: +limit,
            offset: (+page - 1) * +limit,
            order: [[sortBy, sortOrder]]
        });

        // Transform URLs for each post
        const transformedPosts = posts.rows.map(post => {
            const postData = post.toJSON();
            if (postData.featuredImage) {
                postData.featuredImage = {
                    path: postData.featuredImage,
                    url: getFullUrl(req, postData.featuredImage)
                };
            }
            return postData;
        });

        res.json({
            status: 'success',
            data: transformedPosts,
            pagination: {
                total: posts.count,
                pages: Math.ceil(posts.count / limit),
                page: +page,
                limit: +limit
            }
        });
    } catch (error) {
        logger.error('Get blog posts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching blog posts'
        });
    }
};

// Get single post
exports.getPost = async (req, res) => {
    try {
        const post = await BlogPost.findOne({
            where: {
                [Op.or]: [
                    { id: req.params.id },
                    { slug: req.params.id }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'fullname', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category'
                }
            ]
        });

        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Blog post not found'
            });
        }

        // Increment view count
        await post.increment('viewCount');

        // Transform post URLs
        const postData = post.toJSON();
        if (postData.featuredImage) {
            postData.featuredImage = {
                path: postData.featuredImage,
                url: getFullUrl(req, postData.featuredImage)
            };
        }

        res.json({
            status: 'success',
            data: postData
        });
    } catch (error) {
        logger.error('Get blog post error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching blog post'
        });
    }
};

// Update post
exports.updatePost = async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Blog post not found'
            });
        }

        let updateData;
        try {
            updateData = req.body.data ? JSON.parse(req.body.data) : req.body;
        } catch (error) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid JSON data format'
            });
        }

        // Update slug if title is changed
        if (updateData.title) {
            updateData.slug = slugify(updateData.title, { lower: true, strict: true });
        }

        // Handle featured image
        if (req.file) {
            // Delete old image if exists
            if (post.featuredImage) {
                const oldImagePath = path.join(__dirname, '../public', post.featuredImage);
                await fs.unlink(oldImagePath).catch(err => 
                    logger.error('Error deleting old image:', err)
                );
            }
            updateData.featuredImage = `/uploads/blog/${req.file.filename}`;
        }

        // Handle status changes
        if (updateData.status === 'published' && post.status !== 'published') {
            // If changing to published for the first time
            updateData.publishedAt = new Date();
        } else if (updateData.status && updateData.status !== 'published') {
            // If changing from published to draft/archived
            updateData.publishedAt = null;
        }

        // Handle content images
        if (updateData.content) {
            // Find images that were in the old content but not in the new content
            const oldImageRegex = /!\[.*?\]\(\/uploads\/blog\/(.*?)\)/g;
            const newImageRegex = /!\[.*?\]\(\/uploads\/blog\/(.*?)\)/g;
            
            const oldImages = new Set();
            const newImages = new Set();
            
            let match;
            while ((match = oldImageRegex.exec(post.content)) !== null) {
                oldImages.add(match[1]);
            }
            while ((match = newImageRegex.exec(updateData.content)) !== null) {
                newImages.add(match[1]);
            }

            // Delete images that are no longer used
            for (const oldImage of oldImages) {
                if (!newImages.has(oldImage)) {
                    const imagePath = path.join(__dirname, '../public/uploads/blog', oldImage);
                    await fs.unlink(imagePath).catch(err => 
                        logger.error('Error deleting unused content image:', err)
                    );
                }
            }
        }

        await post.update(updateData);

        // Fetch updated post with associations
        const updatedPost = await BlogPost.findByPk(post.id, {
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'fullname', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category'
                }
            ]
        });

        // Transform post URLs
        const transformedPost = {
            ...updatedPost.toJSON(),
            featuredImage: updatedPost.featuredImage ? {
                path: updatedPost.featuredImage,
                url: getFullUrl(req, updatedPost.featuredImage)
            } : null
        };

        res.json({
            status: 'success',
            message: 'Blog post updated successfully',
            data: transformedPost
        });
    } catch (error) {
        logger.error('Update blog post error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error updating blog post'
        });
    }
};

// Delete post (Hard Delete)
exports.deletePost = async (req, res) => {
    try {
        const post = await BlogPost.findByPk(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                status: 'error',
                message: 'Blog post not found'
            });
        }

        // Delete featured image if exists
        if (post.featuredImage) {
            const imagePath = path.join(__dirname, '../public', post.featuredImage);
            await fs.unlink(imagePath).catch(err => 
                logger.error('Error deleting image:', err)
            );
        }

        // Delete any content images from the post
        const contentImageRegex = /!\[.*?\]\(\/uploads\/blog\/(.*?)\)/g;
        let match;
        while ((match = contentImageRegex.exec(post.content)) !== null) {
            const imagePath = path.join(__dirname, '../public/uploads/blog', match[1]);
            await fs.unlink(imagePath).catch(err => 
                logger.error('Error deleting content image:', err)
            );
        }

        // Hard delete the post
        await BlogPost.destroy({
            where: {
                id: req.params.id
            },
            force: true // Ensures hard delete
        });

        res.json({
            status: 'success',
            message: 'Blog post and all associated images deleted successfully'
        });
    } catch (error) {
        logger.error('Delete blog post error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting blog post'
        });
    }
};

// Get blog statistics
exports.getBlogStats = async (req, res) => {
  try {
    // Get total posts
    const totalPosts = await BlogPost.count();

    // Get count by status
    const publishedPosts = await BlogPost.count({
      where: { status: 'published' }
    });

    const draftPosts = await BlogPost.count({
      where: { status: 'draft' }
    });

    const archivedPosts = await BlogPost.count({
      where: { status: 'archived' }
    });

    // Get total categories
    const totalCategories = await BlogCategory.count();

    // Get total views across all posts
    const totalViews = await BlogPost.sum('viewCount');

    // Get top 5 most viewed posts
    const topViewedPosts = await BlogPost.findAll({
      attributes: ['id', 'title', 'viewCount', 'status', 'publishedAt'],
      where: {
        viewCount: {
          [Op.gt]: 0
        }
      },
      order: [['viewCount', 'DESC']],
      limit: 5
    });

    return res.status(200).json({
      status: 'success',
      data: {
        totalPosts,
        postsByStatus: {
          published: publishedPosts,
          draft: draftPosts,
          archived: archivedPosts
        },
        totalCategories,
        views: {
          total: totalViews || 0,
          topPosts: topViewedPosts.map(post => ({
            title: post.title,
            views: post.viewCount,
            status: post.status,
            publishedAt: post.publishedAt
          }))
        }
      }
    });
  } catch (error) {
    console.error('Error in getBlogStats:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error'
    });
  }
};

// Upload gambar untuk konten artikel
exports.uploadContentImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No image file provided'
            });
        }

        // Generate URL untuk gambar
        const imageUrl = getFullUrl(req, `/uploads/blog/${req.file.filename}`);
        
        res.status(200).json({
            status: 'success',
            data: {
                filename: req.file.filename,
                path: `/uploads/blog/${req.file.filename}`,
                url: imageUrl
            }
        });
    } catch (error) {
        logger.error('Upload content image error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Error uploading content image'
        });
    }
};

// Get latest published posts
exports.getLatestPosts = async (req, res) => {
    try {
        const posts = await BlogPost.findAll({
            where: {
                status: 'published'
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'fullname', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category'
                }
            ],
            order: [['publishedAt', 'DESC']],
            limit: 5
        });

        // Transform URLs for each post
        const transformedPosts = posts.map(post => {
            const postData = post.toJSON();
            if (postData.featuredImage) {
                postData.featuredImage = {
                    path: postData.featuredImage,
                    url: getFullUrl(req, postData.featuredImage)
                };
            }
            return postData;
        });

        res.json({
            status: 'success',
            data: transformedPosts
        });
    } catch (error) {
        logger.error('Get latest posts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching latest posts'
        });
    }
};

// Get most popular posts
exports.getPopularPosts = async (req, res) => {
    try {
        const posts = await BlogPost.findAll({
            where: {
                status: 'published',
                viewCount: {
                    [Op.gt]: 0
                }
            },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'fullname', 'email']
                },
                {
                    model: BlogCategory,
                    as: 'category'
                }
            ],
            order: [['viewCount', 'DESC']],
            limit: 5
        });

        // Transform URLs for each post
        const transformedPosts = posts.map(post => {
            const postData = post.toJSON();
            if (postData.featuredImage) {
                postData.featuredImage = {
                    path: postData.featuredImage,
                    url: getFullUrl(req, postData.featuredImage)
                };
            }
            return postData;
        });

        res.json({
            status: 'success',
            data: transformedPosts
        });
    } catch (error) {
        logger.error('Get popular posts error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching popular posts'
        });
    }
};

module.exports = {
    createCategory: exports.createCategory,
    getAllCategories: exports.getAllCategories,
    createPost: exports.createPost,
    getAllPosts: exports.getAllPosts,
    getPost: exports.getPost,
    updatePost: exports.updatePost,
    deletePost: exports.deletePost,
    getBlogStats: exports.getBlogStats,
    uploadBlogImage,
    handleBlogUploadError,
    uploadContentImage: exports.uploadContentImage,
    getLatestPosts: exports.getLatestPosts,
    getPopularPosts: exports.getPopularPosts
}; 