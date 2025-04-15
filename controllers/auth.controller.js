const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../config/logger');
const redisClient = require('../config/redis');
const { Op } = require('sequelize');

// Register new user
exports.register = async (req, res) => {
    try {
        const { email, password, fullname, phone, address, role, referralCode } = req.body;

        // Check if user already exists
        const userExists = await User.findOne({ where: { email } });
        if (userExists) {
            return res.status(400).json({
                status: 'error',
                message: 'Email already registered'
            });
        }

        let referredBy = null;
        // If referral code is provided, validate it
        if (referralCode) {
            const agent = await User.findOne({
                where: { 
                    referralCode,
                    role: 'AGEN',
                    isActive: true
                }
            });

            if (!agent) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid referral code'
                });
            }

            referredBy = agent.id;
            logger.info(`Valid referral code from agent: ${agent.id}`);
        }

        // Create new user with referral if provided
        const userData = {
            email,
            password,
            fullname,
            phone,
            address,
            role: role || 'JAMAAH'
        };

        if (referredBy) {
            userData.referredBy = referredBy;
        }

        const user = await User.create(userData);

        // If user is registered with referral code, update agent's stats
        if (referredBy) {
            await User.increment('totalJamaah', {
                where: { id: referredBy }
            });

            logger.info(`Updated totalJamaah for agent: ${referredBy}`);
        }

        // Get user with agent information
        const userWithReferral = await User.findOne({
            where: { id: user.id },
            include: [{
                model: User,
                as: 'Agent',
                attributes: ['id', 'fullname', 'email']
            }]
        });

        // Remove password from response
        const userResponse = userWithReferral.toJSON();
        delete userResponse.password;

        logger.info(`New user registered: ${email} ${referredBy ? 'with referral' : 'without referral'}`);

        res.status(201).json({
            status: 'success',
            message: 'User registered successfully',
            data: userResponse
        });
    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error registering user',
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user || !(await user.validatePassword(password))) {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid credentials'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'Account is inactive'
            });
        }

        // Generate token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Get token expiration time
        const decoded = jwt.decode(token);
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

        // Store token in Redis with user ID
        await redisClient.set(`token_${user.id}`, token, {
            EX: expiresIn
        });

        logger.info(`User logged in: ${email} with role ${user.role}`);

        res.json({
            status: 'success',
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullname: user.fullname,
                    role: user.role
                }
            }
        });
    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error during login'
        });
    }
};

// Get current user
exports.me = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: user
        });
    } catch (error) {
        logger.error('Get user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user data'
        });
    }
};

// Logout user
exports.logout = async (req, res) => {
    try {
        const token = req.token;
        const decoded = jwt.decode(token);
        const timeToExpire = decoded.exp - Math.floor(Date.now() / 1000);

        // Add token to blacklist in Redis
        await redisClient.set(`bl_${token}`, 'true', {
            EX: timeToExpire
        });

        // Remove user's active token
        await redisClient.del(`token_${req.user.id}`);

        logger.info(`User logged out: ${req.user.email}`);
        
        res.json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error during logout'
        });
    }
};

// Force logout from all devices
exports.logoutAll = async (req, res) => {
    try {
        // Get all tokens for user
        const userTokenPattern = `token_${req.user.id}`;
        const tokens = await redisClient.keys(userTokenPattern);

        // Blacklist all tokens
        for (const tokenKey of tokens) {
            const token = await redisClient.get(tokenKey);
            const decoded = jwt.decode(token);
            const timeToExpire = decoded.exp - Math.floor(Date.now() / 1000);

            await redisClient.set(`bl_${token}`, 'true', {
                EX: timeToExpire
            });
            await redisClient.del(tokenKey);
        }

        logger.info(`User logged out from all devices: ${req.user.email}`);

        res.json({
            status: 'success',
            message: 'Logged out from all devices successfully'
        });
    } catch (error) {
        logger.error('Logout all error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error during logout from all devices'
        });
    }
};

// Get all users with filtering
exports.getAllUsers = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            role,
            isActive,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        // Build where clause
        const whereClause = {};
        
        if (search) {
            whereClause[Op.or] = [
                { fullname: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } }
            ];
        }

        if (role) {
            whereClause.role = role;
        }

        if (isActive !== undefined) {
            whereClause.isActive = isActive === 'true';
        }

        // Get users with pagination
        const { count, rows: users } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password'] },
            order: [[sortBy, sortOrder]],
            limit: +limit,
            offset: (+page - 1) * +limit
        });

        res.json({
            status: 'success',
            data: users,
            pagination: {
                total: count,
                pages: Math.ceil(count / limit),
                page: +page,
                limit: +limit
            }
        });
    } catch (error) {
        logger.error('Get all users error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching users'
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        res.json({
            status: 'success',
            data: user
        });
    } catch (error) {
        logger.error('Get user by id error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user'
        });
    }
};

// Update profile (for logged in user)
exports.updateProfile = async (req, res) => {
    try {
        const allowedUpdates = [
            'fullname', 'phone', 'address', 'birthPlace', 
            'birthDate', 'gender', 'maritalStatus', 'occupation',
            'education', 'bloodType', 'emergencyContact', 'nik'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        const user = await User.findByPk(req.user.id);
        await user.update(updates);

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            status: 'success',
            message: 'Profile updated successfully',
            data: userResponse
        });
    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating profile'
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        // Verify current password
        if (!(await user.validatePassword(currentPassword))) {
            return res.status(401).json({
                status: 'error',
                message: 'Current password is incorrect'
            });
        }

        // Update password
        await user.update({ password: newPassword });

        res.json({
            status: 'success',
            message: 'Password changed successfully'
        });
    } catch (error) {
        logger.error('Change password error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error changing password'
        });
    }
};

// Update user (Admin only)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Admin can update additional fields
        const allowedUpdates = [
            'fullname', 'phone', 'address', 'role', 'isActive',
            'birthPlace', 'birthDate', 'gender', 'maritalStatus',
            'occupation', 'education', 'bloodType', 'emergencyContact',
            'agentTierId', 'referralCode'
        ];

        const updates = {};
        Object.keys(req.body).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updates[key] = req.body[key];
            }
        });

        await user.update(updates);

        // Remove password from response
        const userResponse = user.toJSON();
        delete userResponse.password;

        res.json({
            status: 'success',
            message: 'User updated successfully',
            data: userResponse
        });
    } catch (error) {
        logger.error('Update user error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating user'
        });
    }
}; 