const bot = require('../../bot');

class BotController {

    constructor() {
        //this.userDao = require('../../common/dao/userDao');
    }

    shout(req, res) {
        if (!validate(req, res)) {
            return;
        }

        let message = req.body.message;
        let roles = req.body.roles;

        //if (message !== "clear") {
        let guild = bot.guilds.find("id", process.env.DISCORD_SERVER_ID);
        let channel = guild.channels.find('name', process.env.SHOUT_CHANNEL);

        bot.broadcast(message, guild, roles).catch((err) => {
            res.status(500);
            res.json(err);
        });
        //}

        //robloxManager.shout(message);

        res.status(200);
        res.json('succes');
    }

    // addVerifyCode(req, res){
    //     if (!this.common.validate(req, res)) {
    //         return;
    //     }
    //
    //     let code = req.body.code;
    //     let robloxId = req.body.robloxId;
    //
    //     let user = new User(robloxId, 0, 10, true, code);
    //     UserDao.create(user);
    //
    //     res.status(200);
    //     res.json(user);
    // }
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