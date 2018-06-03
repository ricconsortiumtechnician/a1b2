require('dotenv').config()

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
 * @param guild {Discord.Guild}
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

bot.sendEmbed = (channel, embedData, color) => {
    let lColor = color === undefined ? 0x5cb85c : color;

    let embed = new Discord.RichEmbed(embedData)
        .setColor(lColor)
        .setFooter('ROBLOX Infantry Corps Automated System | Property of the Consortium');

    channel.send(embed);
}

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
        bot.sendEmbed(msg.channel, new Discord.RichEmbed(bot.autoResponders.get(command)), 0xe6ad28);
        return;
    }

    let cmd;
    if (bot.commands.has(command)) {
        cmd = bot.commands.get(command);
    } else if (bot.aliases.has(command)) {
        cmd = bot.commands.get(bot.aliases.get(command));
    }
    if (cmd) {
        cmd.run(bot, msg, params).catch(err => handleError(err, msg));
    }
});

bot.on("ready", () => {
    log(`${bot.user.username} ready.`);
});

bot.on("error", console.error);
bot.on("warn", console.warn);

bot.login(process.env.BOT_TOKEN);

function parseRoles(roleArr, guild) {
    let roles = '';

    for (let i = 0; i < roleArr.length; i++) {
        let role;

        if (roleArr[i] === 'here') {
            role = '@here';
        } else {
            role = guild.roles.find('name', roleArr[i]);
        }

        // TODO fix
        if (role == undefined) {
            throw 'temp'//throw resources.strings['shout'].errors['roleNotFound']
        }

        roles += role.toString() + ' ';
    }

    return roles;
}

function handleError(err, msg) {
    log(err.stack);

    let embed = new Discord.RichEmbed();
    embed.setAuthor("An error occurred")
        .setTitle(msg.member.displayName + ", " + err.type)
        .setDescription(err.message)
        .setColor(0xcc0000)
        .setFooter("ROBLOX Infantry Corps Automated System | Property of the Consortium");

    msg.reply('', {embed: embed});
}
