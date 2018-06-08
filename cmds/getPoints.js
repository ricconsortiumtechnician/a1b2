const util = require('util')
const cmdHelper = require('../businesslogic/helpers/commandHelper');

const User = require('../model/user');

const Discord = require('discord.js');
const roblox = require('../businesslogic/roblox');

const ranks = require('../resources').ranks;
const res = require('../resources/strings/getPoints');

const userDao = require('../datastorage/userDao');

exports.run = async (bot, msg, args) => {
    if (args.length < 1) cmdHelper.tooFewArguments(this);

    const username = args[0];

    const id = await roblox.lib.getIdFromUsername(username);
    const rank = await roblox.lib.getRankInGroup(process.env.GROUP_ID, id);

    if (rank === 0) roblox.notInGroup();

    let rankData = getRankData(rank);

    if (checkRank(isRank(rank, 'Private'), util.format(res.isPrivate, username), msg)) return;
    if (checkRank(isRank(rank, 'Second Lieutenant'), util.format(res.is2LT, username), msg)) return;
    if (checkRank(rank > getRank('Captain'), util.format(res.higherThanCPT, username), msg)) return;
    if (checkRank(rank > getRank('Second Lieutenant'), util.format(res.higherThan2LT, username, rankData.curRank.name), msg)) return;

    let user = await userDao.findById(id);

    if (user === undefined) {
        user = new User(id, 0, rank, true);
        userDao.create(user);
    }

    const required = rankData.nextRank.requiredPoints;

    const amountTillNext = required - user.points;
    const percentage = Math.round(user.points / required * 100);

    const meritFieldName = util.format(res.meritFieldName, user.points, required, amountTillNext, rankData.nextRank.name);

    let embed = new Discord.RichEmbed()
        .setAuthor(util.format(res.authorName, username), util.format(res.authorIcon, id), util.format(res.authorUrl, id))
        .setTitle(res.embedTitle)
        .addField(meritFieldName, util.format(res.meritFieldValue, percentage));

    bot.sendEmbed(msg.channel, embed);
};

exports.conf = res.conf;
exports.help = res.help;

function checkRank(expr, message, msg) {
    if (expr) {
        msg.reply(message);
    }

    return expr;
}

function isRank(userRank, rankName) {
    return ranks.find((val) => val.name === rankName).rankInGroup === userRank;
}

function getRank(rankName) {
    return ranks.find((val) => val.name === rankName).rankInGroup;
}

function getRankData(rank) {
    let currentRank = ranks.find((val) => val.rankInGroup === rank);

    return {
        prevRank: ranks[ranks.indexOf(currentRank) - 1],
        curRank: currentRank,
        nextRank: ranks[ranks.indexOf(currentRank) + 1]
    }
}