/* Load Modules */
const express = require('express');
/**
 * @type {Router}
 */
const router = express.Router({});

/* Load controller */
const UserController = require('../../controllers/userController');
const userController = new UserController();

/**
 * User Entity routes
 */
router.post('/:robloxId/merit', function (req, res) {
    userController.addMerit(req, res);
});

router.get('/', function (req, res){
    res.status(200);
    res.content('Hello World');
});

// router.post('/verify', function (req, res) {
//     botController.addVerifyCode(req, res);
// })

module.exports = router;