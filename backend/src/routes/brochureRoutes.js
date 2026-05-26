const { Router } = require('express');
const brochureController = require('../controllers/brochureController');

const router = Router();

router.get('/data', brochureController.getBrochureData);

module.exports = router;
