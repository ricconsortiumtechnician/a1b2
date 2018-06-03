/**
 * Express Router configuration
 */
const express = require('express');
const router = express.Router();

/* API routes */
//router.use('/users', require('./api/userRoutes'));
router.use('/bot', require('./api/botRoutes'));

module.exports = router;