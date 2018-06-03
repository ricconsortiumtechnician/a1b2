/* Load Modules */
const express = require('express');
const router = express.Router();

/* Load controller */
const BotController = require('../../controllers/botController');
const botController = new BotController();

/**
 * User Entity routes
 */
router.post('/shout', function (req, res) {
    botController.shout(req, res);
});

// router.post('/verify', function (req, res) {
//     botController.addVerifyCode(req, res);
// })

module.exports = router;