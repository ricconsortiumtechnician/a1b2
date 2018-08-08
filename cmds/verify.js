const errors = require('../model/errors');
const cmdHelper = require('../businesslogic/helpers/commandHelper');

const userDao = require('../datastorage/userDao');

exports.run = async (bot, msg, args) => {
    if (args.length < 1) cmdHelper.argumentsError(this);

    const code = args[0];

    let user = await userDao.findByCode(code);

    if(user === null){
        throw new errors.argumentsError("No matching code found")
    }

    user.verificationCode = null;
    user.discordId = msg.author.toString();

    userDao.update(user);

    msg.reply(`You are now verified as roblox user with id: ${user._id}`)
};


exports.conf = {
    aliases: [],
    authorizedRoles: [
        "Captain",
        'Major',
        'Colonel',
        'General',
        'Adjutant General',
        'Chief of Staff',
        'Commander'
    ]
};

exports.help = {
    name: "verify",
    description: "Shows how commands are used.",
    usage: "help [command]"
};