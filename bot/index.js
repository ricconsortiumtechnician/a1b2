require('dotenv').config()
var http = require('http');

const Discord = require("discord.js");
const bot = new Discord.Client({fetchAllMembers: true});
const fs = require("fs");
const moment = require("moment");

const log = (msg) => {
    console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${msg}`);
};

bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();
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

bot.on("message", msg => {
    if (!msg.content.startsWith(process.env.PREFIX)) return;
    if (msg.author.bot) return;


    let command = msg.content.split(" ")[0].slice(process.env.PREFIX.length);
    let params = msg.content.split(" ").slice(1);

    let cmd;
    if (bot.commands.has(command)) {
        cmd = bot.commands.get(command);
    } else if (bot.aliases.has(command)) {
        cmd = bot.commands.get(bot.aliases.get(command));
    }
    if (cmd) {
        cmd.run(bot, msg, params).catch(err=> handleError(err, msg));
    }
});


function handleError(err, msg) {
    log(err.stack);

    let embed = new Discord.RichEmbed();
    embed.setAuthor("An error occurred")
        .setTitle(msg.member.displayName + ", " + err.type)
        .setDescription(err.message)
        .setColor(0xcc0000)
        .setFooter("ROBLOX Infantry Corps Automated System | Property of the Consortium");

    msg.reply('', { embed: embed });
}

bot.on("ready", () => {
    log(`RoleBot: Ready to serve ${bot.users.size} users, in ${bot.channels.size} channels of ${bot.guilds.size} servers.`);
});

bot.on("error", console.error);
bot.on("warn", console.warn);

bot.login(process.env.BOT_TOKEN);

http.createServer(function (req, res) {
    res.write('Hello World!'); //write a response to the client
    res.end(); //end the response
}).listen(process.env.PORT);