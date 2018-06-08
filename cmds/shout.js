const util = require('util');

const cmdHelper = require('../businesslogic/helpers/commandHelper');

const Discord = require('discord.js');
const roblox = require('../businesslogic/roblox');

const res = require('../resources/strings/shout');

exports.run = async (bot, msg, args) => {
    // Check minimum amount of parameters.
    if (args.length < 1) cmdHelper.tooFewArguments(this);

    let message = cmdHelper.removeColons(args[0]);

    // Check if message isn't too long for roblox
    if (message.length > 256) throw res.errors.msgTooLong;

    let roles = args[1] !== undefined ? cmdHelper.removeColons(args[1]) : '@everyone';
    roles = roles.split(', ');

    await bot.broadcast(message, msg.member.guild, roles);
    roblox.shout(message);

    const embed = new Discord.RichEmbed()
        .setAuthor(res.authorName)
        .setTitle(util.format(res.embedTitle, msg.member.displayName))
        .setDescription(util.format(res.embedDescription, message));

    bot.sendEmbed(msg.channel, embed);
};

exports.conf = res.conf;

exports.help = res.help;