const util = require('util');

const discord = require('discord.js');
const roblox = require('../businesslogic/roblox');
const cmdHelper = require('../businesslogic/helpers/commandHelper');
const userManager = require('../businesslogic/userManager');
const errors = require('../model/errors');

const res = require('../resources/strings/addPoints');
const ranks = require('../resources').ranks;

/**
 *
 * @param bot
 * @param msg
 * @param args {Array}
 * @returns {Promise<void>}
 */
exports.run = async (bot, msg, args) => {
    if (args.length < 3) cmdHelper.argumentsError(this);

    const reason = parseReason(args.pop());
    const amount = parseAmount(args.pop());

    let report = {};

    if (amount > 0) {
        const eventType = await getEventType(msg, bot);

        // Stop on cancel
        if (eventType === undefined) {
            return;
        }

        report = await generateReport(args, amount, reason, eventType, reportAdd, msg, bot);
    } else {
        report = await generateReport(args, amount, reason, undefined, reportDeduct, msg, bot);
    }

    let response = new discord.RichEmbed()
        .setAuthor(res.reportAuthor)
        .setTitle(util.format(res.reportTitle, msg.member.displayName))
        .setDescription(res.reportDescription);

    if (report.success.length === 0) {
        response.addField(res.affected, res.noAffected);
    } else {
        response.addField(res.affected, report.success.join(', '));
    }

    addField(report.changed, res.rankChanged, response);
    addField(report.notFound, res.notFound, response);
    addField(report.notInGroup, res.notInGroup, response);
    addField(report.invalidRank, res.invalidRank, response);
    addField(report.belowZero, res.belowZero, response);

    bot.sendEmbed(msg.channel, response);
};

function reportAdd(user, username, amount, report, rankData, channel, bot) {
    if (userManager.addPoints(user, amount)) {
        report.changed.push(username);
        report.success.push(username);
        sendMeritPromotionEmbed(channel, user, username, rankData.nextRank, rankData.curRank, bot);
    } else {
        report.success.push(username);
        sendMeritSuccessEmbed(channel, user, username, rankData.nextRank, rankData.curRank, bot);
    }
}

function reportDeduct(user, username, amount, report, rankData, channel, bot) {
    if (userManager.deductPoints(user, Math.abs(amount))) {
        report.changed.push(username);
        report.success.push(username);
    } else {
        report.success.push(username);
        sendMeritSuccessEmbed(channel, user, username, rankData.nextRank, rankData.curRank, bot);
    }
}

async function generateReport(users, amount, reason, eventType, func, msg, bot) {
    let report = {
        success: [],
        changed: [],
        notFound: [],
        notInGroup: [],
        invalidRank: [],
        belowZero: []
    };

    const channel = msg.guild.channels.find('name', 'merit_log');

    for (let i = 0; i < users.length; i++) {
        let currentUser = users[i];

        try {
            const id = await roblox.lib.getIdFromUsername(currentUser);
            const rank = await roblox.lib.getRankInGroup(process.env.GROUP_ID, id);

            let rankData = getRankData(rank);

            let user = await userManager.findOrCreateUser(id, rank);

            func(user, currentUser, amount, report, rankData, channel, bot);

            user.pointsLogs.push({
                date: Date.now(),
                issuedBy: msg.member.displayName,
                amount: amount,
                reason: reason,
                eventType: eventType
            })

        } catch (err) {
            switch (err.message) {
                case 'idNotFound':
                    report.notFound.push(currentUser);
                    break;
                case 'notInGroup':
                    report.notInGroup.push(currentUser);
                    break;
                case 'invalidRank':
                    report.invalidRank.push(currentUser);
                    break;
                case "belowZero":
                    report.belowZero.push(currentUser);
                    break;
                case 'User not found':
                    report.notFound.push(currentUser);
                    break;
            }
        }
    }

    return report;
}

exports.conf = res.conf;

exports.help = res.help;

/**
 * Parses and validates the amount and returns it.
 * @param {string} amount the amount to validate
 * @returns {number} The amount if valid.
 */
function parseAmount(amount) {
    const parsedAmount = parseInt(amount);

    // Check if -4 < amount < 4 a && amount is not zero.
    if (!parsedAmount || parsedAmount < -4 || parsedAmount > 4) {
        throw new errors.invalidArgument(res.errors.amountInvalid);
    }

    return parsedAmount;
}

/**
 *
 * @param reason {string}
 */
function parseReason(reason) {
    const parsedReason = cmdHelper.removeColons(reason);

    if (parsedReason === "" || parsedReason === undefined) {
        throw new errors.invalidArgument(res.errors.reasonInvalid);
    }

    return parsedReason;
}

async function getEventType(msg, bot) {
    const filter = (reaction, user) => (
        reaction.emoji.name === res.infoIcon
        || reaction.emoji.name === res.combatReadinessIcon
        || reaction.emoji.name === res.communityEventIcon
        || reaction.emoji.name === res.jointEventIcon
        || reaction.emoji.name === res.canceledIcon
        || reaction.emoji.name === res.manualHQMeritIcon
    ) && user.id === msg.author.id;

    let desc = res.eventTypeDescription.join('\n');

    let embed = new discord.RichEmbed()
        .setTitle(res.eventTypeTitle)
        .setDescription(desc)
        .setAuthor(res.eventTypeAuthor);

    let msg1 = await bot.sendEmbed(msg.channel, embed);

    react(msg1);

    let reactions = await msg1.awaitReactions(filter, {max: 1});

    msg1.delete();

    switch (reactions.first().emoji.name) {
        case res.canceledIcon:
            msg.reply(res.canceled);
            break;
        case res.infoIcon:
            return res.infoTrain;
        case res.combatReadinessIcon:
            return res.combatReadiness;
        case res.communityEventIcon:
            return res.communityEvent;
        case res.jointEventIcon:
            return res.jointEvent;
        case res.manualHQMeritIcon:
            return res.manualHQMerit;
    }
}

async function react(msg) {
    try {
        await msg.react(res.infoIcon);
        await msg.react(res.combatReadinessIcon);
        await msg.react(res.communityEventIcon);
        await msg.react(res.jointEventIcon);
        await msg.react(msg.guild.emojis.find('name', res.manualHQMeritIcon));
        await msg.react(res.canceledIcon);
    } catch (err) {
    }
}

async function sendMeritPromotionEmbed(channel, user, username, nextRank, curRank, bot) {
    let authorName = util.format(res.meritLogAuthor, username);
    let authorIcon = util.format(res.robloxHeadshot, user._id);
    let authorUrl = util.format(res.robloxUrl, user._id);

    let title = util.format(res.promotionLogTitle, username);

    let rankTransition = util.format(res.promotionLogDescription, curRank.abbreviation, nextRank.abbreviation);

    let embed = new discord.RichEmbed()
        .setAuthor(authorName, authorIcon, authorUrl)
        .setTitle(title)
        .addField(res.rankTransition, rankTransition, true)
        .addField(res.reason, res.meritAutoPromo, true)
        .setThumbnail(nextRank.thumbnail);

    bot.sendEmbed(channel, embed);
}

function getRankData(rank) {
    let currentRank = ranks.find((val) => val.rankInGroup === rank);

    return {
        prevRank: ranks[ranks.indexOf(currentRank) - 1],
        curRank: currentRank,
        nextRank: ranks[ranks.indexOf(currentRank) + 1]
    }
}

async function sendMeritSuccessEmbed(channel, user, username, nextRank, curRank, bot) {
    let authorName = util.format(res.meritLogAuthor, username);
    let authorIcon = util.format(res.robloxHeadshot, user._id);
    let authorUrl = util.format(res.robloxUrl, user._id);

    let amountTillNext = nextRank.requiredPoints - user.points;
    let percentage = Math.round(user.points / nextRank.requiredPoints * 100);

    let meritFieldName = util.format(res.successMeritFieldName, user.points, nextRank.requiredPoints, amountTillNext, nextRank.name);
    let meritFieldValue = util.format(res.successMeritFieldValue, percentage);
    let embed = new discord.RichEmbed()
        .setAuthor(authorName, authorIcon, authorUrl)
        .setTitle(res.successTitle)
        .addField(meritFieldName, meritFieldValue)
        .setThumbnail(curRank.thumbnail);

    bot.sendEmbed(channel, embed);
}

/**
 *
 * @param users {Array}
 * @param fieldTitle {string}
 * @param embed {RichEmbed}
 */
function addField(users, fieldTitle, embed) {
    if (users.length > 0) {
        embed.addField(fieldTitle, users.join(', '));
    }
}