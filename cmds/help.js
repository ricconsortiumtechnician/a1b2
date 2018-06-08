const Discord = require('discord.js');

exports.run = async (bot, msg, args) => {
    let embed = new Discord.RichEmbed();
    if (!args[0]) {
        embed.setAuthor('Displaying command list')
            .setDescription('Use >help <commandname> for details');

        bot.commands.map(cmd => embed.addField(cmd.help.name, cmd.help.description));
    } else {
        let command = args[0];
        if (!bot.commands.has(command)) return;

        command = bot.commands.get(command);

        embed.setAuthor(`Displaying information on the command: ${command.help.name}`)
            .addField('Description:', command.help.description)
            .addField('Usage:', command.help.usage);

        if (command.help.notes) {
            embed.addField('Additional information:', command.help.notes);
        }
    }
    bot.sendEmbed(msg.channel, embed);
};

exports.conf = {
    aliases: [],
    authorizedRoles: [
        'Major',
        'Colonel',
        'General',
        'Adjutant General',
        'Chief of Staff',
        'Commander'
    ]
};

exports.help = {
    name: "help",
    description: "Shows how commands are used.",
    usage: "help [command]"
};