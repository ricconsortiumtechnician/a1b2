require('dotenv').config()

const res = require('./resources/strings/common');

const fs = require("fs");

const Discord = require("discord.js");
const moment = require("moment");

const log = (msg) => {
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${msg}`);
};

const bot = new Discord.Client();

module.exports = bot;

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
bot.autoResponders = new Discord.Collection();

/**
 * Broadcasts a message to the discord.
 * @param message {string}
 * @param guild {Guild}
 * @param roles {Array}
 * @returns {Promise<void>}
 */
bot.broadcast = async (message, guild, roles) => {
    if (message.toLowerCase() === 'clear') {
        roles = [];
        message = 'Event concluded.';
    }

    roles = roles === undefined ? [] : roles;
    let channel = guild.channels.find('name', process.env.SHOUT_CHANNEL);

    let discordRoles = parseRoles(roles, guild)
    channel.send(discordRoles + message);
};

/**
 *
 * @param channel {TextChannel}
 * @param embed {RichEmbed}
 */
bot.sendEmbed = (channel, embed) => {
    if (!embed.color) embed.setColor(0x5cb85c);
    if (!embed.footer) embed.setFooter('ROBLOX Infantry Corps Automated System | Property of the Consortium');

    channel.send(embed);
};

/**
 *
 * @param msg {Message}
 * @param embed {RichEmbed}
 */
bot.invalidArgument = (msg, embed) => {
    if (!embed.author) embed.setAuthor('An error occurred.');
    if (!embed.title) embed.setTitle(`${msg.member.displayName}, Invalid argument!`);
    if (!embed.color) embed.setColor(0xcc0000);

    bot.sendEmbed(msg.channel, embed)
};

bot.parseRoles = (roleArr, guild) => {
    let roles = '';

    for (let i = 0; i < roleArr.length; i++) {
        let role;

        if (roleArr[i] === 'here') {
            role = '@here';
        } else {
            role = guild.roles.find('name', roleArr[i]);
        }

        if (role === undefined) {
            throw{
                type: "Invalid argument!",
                message: "One of the given roles was not found."
            }
        }

        roles += role.toString() + ' ';
    }

    return roles;
};

// Load commands
fs.readdir("./cmds/", (err, files) => {
    if (err) console.error(err);

    log(`Loading a total of ${files.length} commands.`);

    files.forEach(f => {
        let props = require(`./cmds/${f}`);
        log(`Loading Command: ${props.help.name}. :ok_hand:`);
        bot.commands.set(props.help.name, props);

        props.conf.aliases.forEach(alias => {
            bot.aliases.set(alias, props.help.name);
        });
    });
});

// Load auto responders
fs.readdir("./autoresponders/", (err, files) => {
    if (err) console.error(err);

    log(`Loading a total of ${files.length} commands.`);

    files.forEach(f => {
        let props = require(`./autoresponders/${f}`);
        log(`Loading auto responder: ${props.name}. :ok_hand:`);
        bot.autoResponders.set(props.name, props.embed);
    });
});

bot.on("message", msg => {
    if (!msg.content.startsWith(process.env.PREFIX)) return;
    if (msg.author.bot) return;

    let text = msg.content.substr(process.env.PREFIX.length);

    let command = text.match(new RegExp(process.env.ARGUMENT_INFIX, "gi"))[0];
    let params = text.match(new RegExp(process.env.ARGUMENT_INFIX, "gi")).splice(1);

    if (bot.autoResponders.has(command)) {
        let autoResponder = new Discord.RichEmbed(bot.autoResponders.get(command))
            .setColor(0xe6ad28);

        bot.sendEmbed(msg.channel, autoResponder);
        return;
    }

    let cmd;
    if (bot.commands.has(command)) {
        cmd = bot.commands.get(command);
    } else if (bot.aliases.has(command)) {
        cmd = bot.commands.get(bot.aliases.get(command));
    }

    if (cmd) {
        if (!authorize(msg.member.roles, cmd.conf.authorizedRoles)) return;
        cmd.run(bot, msg, params).catch(err => handleError(err, msg));
    }
});

bot.on("ready", () => {
    log(`${bot.user.username} ready.`);
});

bot.on("error", console.error);
bot.on("warn", console.warn);

bot.login(process.env.BOT_TOKEN);

function authorize(memberRoles, cmdRoles) {
    let authorized = false;

    for (let i = 0; i < cmdRoles.length; i++) {
        let curRole = cmdRoles[i];

        let temp = memberRoles.find('name', curRole);

        if (temp) {
            authorized = true;
        }
    }

    return authorized;
}

function handleError(err, msg) {
    log(err.stack);

    if (err.message === "User not found") {
        err = {
            type: "Invalid argument!",
            message: "The user was not found"
        }
    }

    let embed = new Discord.RichEmbed();
    embed.setAuthor("An error occurred")
        .setTitle(msg.member.displayName + ", " + err.type)
        .setDescription(err.message)
        .setColor(0xcc0000)
        .setFooter("ROBLOX Infantry Corps Automated System | Property of the Consortium");

    msg.reply('', {embed: embed});
}
