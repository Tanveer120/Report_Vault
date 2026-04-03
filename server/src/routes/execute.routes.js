const express = require('express');
const { execute, logs } = require('../controllers/execute.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAny } = require('../middleware/role.middleware');
const { executionLimiter } = require('../middleware/rate-limiter');

const router = express.Router();

router.use(authenticate);

router.post('/:id/execute', executionLimiter, requireAny, execute);
router.get('/:id/logs', requireAny, logs);

module.exports = router;
