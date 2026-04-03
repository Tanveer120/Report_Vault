const express = require('express');
const { list, getById, create, update, remove } = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin, requireAny } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createReportSchema, updateReportSchema } = require('../validators/report.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', requireAny, list);
router.get('/:id', requireAny, getById);
router.post('/', requireAdmin, validate(createReportSchema), create);
router.put('/:id', requireAdmin, validate(updateReportSchema), update);
router.delete('/:id', requireAdmin, remove);

module.exports = router;
