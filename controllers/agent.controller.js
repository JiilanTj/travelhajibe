const { User, AgentTier } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

// Agent Operations
const createAgent = async (req, res) => {
    try {
        const {
            email,
            password,
            fullname,
            phone,
            address,
            nik,
            birthPlace,
            birthDate,
            gender,
            maritalStatus,
            occupation,
            education,
            bloodType,
            emergencyContact,
            agentTierId,
            referralCode,
            bankInfo
        } = req.body;

        // Validate required fields
        if (!email || !password || !fullname || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, fullname, and phone are required'
            });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }

        // Validate agent tier if provided
        if (agentTierId) {
            const tier = await AgentTier.findByPk(agentTierId);
            if (!tier) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid agent tier'
                });
            }
        }

        // Create new agent with AGEN role
        const newAgent = await User.create({
            email,
            password,
            fullname,
            phone,
            address,
            nik,
            birthPlace,
            birthDate,
            gender,
            maritalStatus,
            occupation,
            education,
            bloodType,
            emergencyContact,
            agentTierId,
            referralCode,
            bankInfo,
            role: 'AGEN',
            isActive: true
        });

        // Remove password from response
        const agentResponse = newAgent.toJSON();
        delete agentResponse.password;

        logger.info(`New agent created: ${newAgent.email}`);

        return res.status(201).json({
            success: true,
            message: 'Agent created successfully',
            data: agentResponse
        });

    } catch (error) {
        logger.error('Error creating agent:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getAgents = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {
            role: 'AGEN'
        };

        if (search) {
            whereClause[Op.or] = [
                { fullname: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { phone: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereClause,
            include: [{
                model: AgentTier,
                attributes: ['name', 'baseCommissionRate']
            }],
            attributes: { exclude: ['password'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        logger.error('Error fetching agents:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Remove sensitive fields that shouldn't be updated directly
        delete updateData.password;
        delete updateData.role;
        delete updateData.email;

        const agent = await User.findOne({
            where: { 
                id, 
                role: 'AGEN'
            }
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Validate agent tier if provided
        if (updateData.agentTierId) {
            const tier = await AgentTier.findByPk(updateData.agentTierId);
            if (!tier) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid agent tier'
                });
            }
        }

        await agent.update(updateData);
        const updatedAgent = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: AgentTier,
                attributes: ['name', 'baseCommissionRate']
            }]
        });

        logger.info(`Agent updated: ${agent.email}`);

        return res.status(200).json({
            success: true,
            message: 'Agent updated successfully',
            data: updatedAgent
        });
    } catch (error) {
        logger.error('Error updating agent:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;

        const agent = await User.findOne({
            where: { 
                id, 
                role: 'AGEN'
            }
        });

        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Instead of deleting, we'll deactivate the agent
        await agent.update({ isActive: false });

        logger.info(`Agent deactivated: ${agent.email}`);

        return res.status(200).json({
            success: true,
            message: 'Agent deactivated successfully'
        });
    } catch (error) {
        logger.error('Error deactivating agent:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

// Agent Tier Operations
const createAgentTier = async (req, res) => {
    try {
        const { name, baseCommissionRate, minimumJamaah, bonusRate, benefits } = req.body;

        // Validate required fields
        if (!name || !baseCommissionRate || !minimumJamaah) {
            return res.status(400).json({
                success: false,
                message: 'Name, baseCommissionRate, and minimumJamaah are required'
            });
        }

        // Validate benefits structure if provided
        if (benefits) {
            if (!benefits.description || !Array.isArray(benefits.features)) {
                return res.status(400).json({
                    success: false,
                    message: 'Benefits must include description and features array'
                });
            }
        }

        const newTier = await AgentTier.create({
            name,
            baseCommissionRate,
            minimumJamaah,
            bonusRate,
            benefits: benefits || {
                description: "Tier Dasar",
                features: ["Basic Support"]
            }
        });

        logger.info(`New agent tier created: ${newTier.name}`);

        return res.status(201).json({
            success: true,
            message: 'Agent tier created successfully',
            data: newTier
        });
    } catch (error) {
        logger.error('Error creating agent tier:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const getAgentTiers = async (req, res) => {
    try {
        const tiers = await AgentTier.findAll({
            order: [['minimumJamaah', 'ASC']]
        });

        return res.status(200).json({
            success: true,
            data: tiers
        });
    } catch (error) {
        logger.error('Error fetching agent tiers:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const updateAgentTier = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Validate benefits structure if provided
        if (updateData.benefits) {
            if (!updateData.benefits.description || !Array.isArray(updateData.benefits.features)) {
                return res.status(400).json({
                    success: false,
                    message: 'Benefits must include description and features array'
                });
            }
        }

        const tier = await AgentTier.findByPk(id);
        if (!tier) {
            return res.status(404).json({
                success: false,
                message: 'Agent tier not found'
            });
        }

        await tier.update(updateData);

        logger.info(`Agent tier updated: ${tier.name}`);

        return res.status(200).json({
            success: true,
            message: 'Agent tier updated successfully',
            data: tier
        });
    } catch (error) {
        logger.error('Error updating agent tier:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const deleteAgentTier = async (req, res) => {
    try {
        const { id } = req.params;

        const tier = await AgentTier.findByPk(id);
        if (!tier) {
            return res.status(404).json({
                success: false,
                message: 'Agent tier not found'
            });
        }

        // Check if any agents are using this tier
        const agentsUsingTier = await User.count({
            where: { agentTierId: id }
        });

        if (agentsUsingTier > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete tier as it is being used by agents'
            });
        }

        await tier.destroy();

        logger.info(`Agent tier deleted: ${tier.name}`);

        return res.status(200).json({
            success: true,
            message: 'Agent tier deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting agent tier:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    // Agent operations
    createAgent,
    getAgents,
    updateAgent,
    deleteAgent,
    // Agent Tier operations
    createAgentTier,
    getAgentTiers,
    updateAgentTier,
    deleteAgentTier
}; 