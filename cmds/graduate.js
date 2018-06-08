const util = require('util');
const Discord = require('discord.js');

const roblox = require('../businesslogic/roblox');
const cmdHelper = require('../businesslogic/helpers/commandHelper');

const ranks = require('../resources').ranks;
const res = require('../resources/strings/graduate');

/**
 *
 * @param bot {Client}
 * @param msg {Message}
 * @param args {Array}
 * @returns {Promise<void>}
 */
exports.run = async (bot, msg, args) => {
    // Check minimum amount of parameters.
    if (args.length < 1) cmdHelper.tooFewArguments(this);

    let report = await generateReport(args);

    let response = new Discord.RichEmbed()
        .setAuthor(res.authorName)
        .setTitle(util.format(res.embedTitle, msg.member.displayName))
        .setDescription(res.embedDescription);

    // Either show that there were no users graduated or who were graduated.
    if (report.graduated.length === 0) {
        response.addField(res.graduated, res.noGraduated);
    } else {
        response.addField(res.graduated, report.graduated.join(', '));
    }

    addField(report.notFound, res.notFound, response);
    addField(report.notInGroup, res.notInGroup, response);
    addField(report.invalidRank, res.invalidRank, response);

    bot.sendEmbed(msg.channel, response);
};

exports.conf = res.conf;

exports.help = res.help;

/**
 * Loops over all the users you try to graduate and generates an object indicating the stats per user.
 * @param users {Array}
 * @returns {Promise<{graduated: Array, notFound: Array, notInGroup: Array, invalidRank: Array}>}
 */
async function generateReport(users){
    // Create object to save status
    let report = {
        graduated: [],
        notFound: [],
        notInGroup: [],
        invalidRank: []
    };

    // Loop over every username
    for (let i = 0; i < users.length; i++) {
        let currentUsername = users[i];

        try {
            const id = await roblox.lib.getIdFromUsername(currentUsername);
            const rank = await roblox.lib.getRankInGroup(process.env.GROUP_ID, id);

            if (rank === 0) {
                report.notInGroup.push(currentUsername);
                continue;
            }

            if (checkRank(rank, 'Private')) {
                await roblox.lib.promote(process.env.GROUP_ID, id);
                report.graduated.push(currentUsername);
            } else {
                report.invalidRank.push(currentUsername);
            }

        } catch (err) {
            if (err.message === "User not found") {
                report.notFound.push(currentUsername);
                continue;
            }

            throw err;
        }
    }

    return report;
}

/**
 *
 * @param users {Array}
 * @param fieldTitle {string}
 * @param embed {RichEmbed}
 */
function addField(users, fieldTitle, embed){
    if (users.length > 0) {
        embed.addField(fieldTitle, users.join(', '));
    }
}

function checkRank(userRank, rankName) {
    return ranks.find((val) => val.name === rankName).rankInGroup === userRank;
}