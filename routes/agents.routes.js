const express = require('express');
const router = express.Router();
const { 
    createAgent,
    getAgents,
    updateAgent,
    deleteAgent,
    createAgentTier,
    getAgentTiers,
    updateAgentTier,
    deleteAgentTier
} = require('../controllers/agent.controller');
const { protect } = require('../middleware/auth.middleware');
const { restrictTo } = require('../middleware/roleAuth.middleware');

// Agent Routes
router.post(
    '/',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    createAgent
);

router.get(
    '/',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    getAgents
);

router.put(
    '/:id',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    updateAgent
);

router.delete(
    '/:id',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    deleteAgent
);

// Agent Tier Routes
router.post(
    '/tiers',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    createAgentTier
);

router.get(
    '/tiers',
    protect,
    getAgentTiers
);

router.put(
    '/tiers/:id',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    updateAgentTier
);

router.delete(
    '/tiers/:id',
    protect,
    restrictTo('ADMIN', 'SUPERADMIN'),
    deleteAgentTier
);

module.exports = router; 