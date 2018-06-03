const roblox = require('../businesslogic/roblox');

exports.run = async (bot, msg, args) => {
    // Check minimum amount of parameters.
    if (args.length < 1) tooFewArguments();

    let message = removeColons(args[0]);

    // Check if message isn't too long for roblox
    if (message.length > 256) messageTooLong();

    let roles = args[1] !== undefined ? removeColons(args[1]) : '@everyone';
    roles = roles.split(', ');

    await bot.broadcast(message, msg.member.guild, roles);
    roblox.shout(message);

    bot.sendEmbed(msg.channel, response(msg.member.displayName, message));
};

exports.conf = {
    aliases: ['broadcast'],
    authorizedRoles: ['@everyone']
};

exports.help = {
    name: "shout",
    description: "Shows how commands are used.",
    usage: "shout \"message\" [\"role1, role2\"]"
};

function response(sender, message) {
    return {
        author: {
            name: "Broadcast Feed"
        },
        title: `${sender} has issued a broadcast to the group shout & broadcast channel.`,
        description: `"${message}"`
    }
}

function tooFewArguments() {
    throw {
        type: "Too few arguments!",
        message: "The correct usage for this command is: " + exports.help.usage
    };
}

function messageTooLong() {
    throw {
        type: "Invalid argument!",
        message: "The message is too big for roblox. Please enter it manually in the broadcast channel."
    };
}

/**
 * Removes the colons from a string
 * @param str {string}
 * @returns {string} The string given without colons
 */
function removeColons(str) {
    if (str !== undefined) {
        if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
            str = str.slice(1, str.length - 1);
        }
    }

    return str;
}