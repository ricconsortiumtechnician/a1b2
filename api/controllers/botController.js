const User = require('../../model/user');
const bot = require('../../bot');
const roblox = require('../../businesslogic/roblox');

const userDao = require('../../datastorage/userDao');

class BotController {

    constructor() {
        //this.userDao = require('../../common/dao/userDao');
    }

    shout(req, res) {
        if (!validate(req, res)) return;

        let message = req.body.message;
        let roles = req.body.roles;

        //if (message !== "clear") {
        let guild = bot.guilds.find("id", process.env.DISCORD_SERVER_ID);

        bot.broadcast(message, guild, roles)
            .then(() => {
                roblox.shout(message);

                res.status(200);
                res.json('succes');
            })
            .catch((err) => {
                res.status(500);
                res.json(err);
            });
        //}
    }

    async addVerifyCode(req, res) {
        if (!validate(req, res)) return;

        let code = req.body.code;
        let robloxId = req.body.robloxId;

        let user = await userDao.findById(robloxId);

        if (!user) {
            user = new User(robloxId, 0, 10, true, code);
            userDao.create(user)
                .then(() => {
                    res.status(200);
                    res.json(user);
                })
                .catch(err => {
                    res.status(500);
                    res.json(err);
                });
        } else{
            if(user.verificationCode){
                res.status(500);
                res.json("Already verified");
            } else {
                user.verificationCode = code;
                userDao.update(user);

                res.status(200);
                res.json(user);
            }
        }
    }

}

function validate(req, res) {
    if (req.query.key !== process.env.API_KEY) {
        res.status(401);
        res.json("Unauthorized");
        return false;
    }

    return true;
}

module.exports = BotController;