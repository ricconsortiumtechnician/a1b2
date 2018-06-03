exports.run = async (bot, msg, args) => {
    if (!args[0]) {
        msg.channel.send(`= Command List =\n\n[Use ?help <commandname> for details]\n\n${bot.commands.map(c => `${c.help.name}:: ${c.help.description}`).join("\n")}`, {code: "text"});
    } else {
        let command = args[0];
        if (bot.commands.has(command)) {
            command = bot.commands.get(command);
            msg.channel.send(`= ${command.help.name} = \n${command.help.description}\nusage::${command.help.usage}`, {code: "text"});
        }
    }
};

exports.conf = {
    aliases: [],
    authorizedRoles: ['@everyone']
};

exports.help = {
    name : "help",
    description: "Shows how commands are used.",
    usage: "help [command]"
};