const express = require('express');
const { exportReport } = require('../controllers/export.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAny } = require('../middleware/role.middleware');
const { exportLimiter } = require('../middleware/rate-limiter');

const router = express.Router();

router.use(authenticate);

router.post('/:id/export', exportLimiter, requireAny, exportReport);

module.exports = router;
