const userManager = require('../../businesslogic/userManager');

class UserController {

    constructor() {
        //this.userDao = require('../../common/dao/userDao');
    }

    // POST api/users/{robloxId}/merit
    addMerit(req, res) {
        if(!validate(req, res)) return;

        let amount = parseInt(req.body.amount);

        userManager.findOrCreateUser(parseInt(req.params.robloxId))
            .then((user) => {
                if(amount > 0) {
                    userManager.addPoints(user, amount);
                } else {
                    userManager.deductPoints(user, Math.abs(amount));
                }

                console.log(`${amount} merit added to ${user._id}`);

                res.status(200);
                res.json(user);
            })
            .catch(err => handleError(err, res));
    }
}

function handleError(err, res) {
    res.status(500);
    res.json(err);
}

function validate(req, res) {
    if (req.query.key !== process.env.API_KEY) {
        res.status(401);
        res.json("Unauthorized");
        return false;
    }

    return true;
}

module.exports = UserController;