const Discord = require('discord.js');

/**
 *
 * @param bot {Client}
 * @param msg {Message}
 * @param args {Array}
 * @returns {Promise<void>}
 */
exports.run = async (bot, msg, args) => {
    // Check min parameters
    if (args.length < 2) tooFewArguments();

    const embedData = removeColons(args[0]);

    const channelName = removeColons(args[1]);
    const channel = msg.guild.channels.find('name', channelName);

    if (channel === undefined) channelNotFound(channelName);

    let roles = removeColons(args[2]);
    roles = roles !== undefined ? roles : '';

    if (roles !== '') {
        let rolesArr = roles.split(', ');
        roles = bot.parseRoles(rolesArr, msg.channel);
    }

    let embed = parseEmbedData(embedData);

    let checkMessage = await msg.reply(`Are you sure you want to send this embed in ${channel.toString()}?`, {embed: embed});
    await checkMessage.react('✅');
    await checkMessage.react('❌');

    const filter = (reaction, user) => (
        reaction.emoji.name === '✅'
        || reaction.emoji.name === '❌'
    ) && user.id === msg.author.id;

    let reactions = await checkMessage.awaitReactions(filter, {max: 1, time: 120000});

    switch (reactions.first().emoji.name) {
        case '✅':
            channel.send(roles, embed);
            checkMessage.edit(`${msg.member.displayName} sent an embed to ${channelName}.`);
            break;
        case '❌':
            checkMessage.delete();
            break;
    }
    msg.delete();

};

function channelNotFound(channelName) {
    throw{
        type: "Invalid argument",
        message: `No channel with the name ${channelName} found`
    }
}

function parseEmbedData(embedData) {
    const regex = new RegExp("[\s\S]*?(?=\n.*?::|$)", "gi")
    const options = embedData.split(regex);

    const embed = new Discord.RichEmbed();

    for (let i = 0; i < options.length; i++) {
        let currentOption = options[i];

        // Remove new line at the start.
        if (currentOption.startsWith('\n')) {
            currentOption = currentOption.slice(1);
        }

        let key = currentOption.substr(0, currentOption.indexOf(':: '));
        let val = currentOption.substr(currentOption.indexOf(':: ') + 2);

        if (key === 'title') {
            embed.setTitle(val);
            continue;
        }

        if (key === 'description') {
            embed.setDescription(val);
            continue;
        }

        if (key === 'link') {
            embed.setURL(val);
            continue;
        }

        if (key === 'color') {
            let color = parseInt(val, 16);

            embed.setColor(color);
            continue;
        }

        if (key === 'thumbnail') {
            embed.setThumbnail(val);
            continue;
        }

        // Author
        if (setAuthor(key, "author_name", val, 'name', embed)) continue;
        if (setAuthor(key, "author_link", val, 'url', embed)) continue;
        if (setAuthor(key, "author_icon", val, 'icon_url', embed)) continue;

        if (key === 'addField') {
            let fieldKVP = val.split('_');

            let fieldKey = fieldKVP[0];
            let fieldVal = fieldKVP[1];
            let inline = fieldKVP[2] === 'inline';

            if (fieldVal === '') {
                fieldVal = '\u200b';
            }

            embed.addField(fieldKey, fieldVal === '' ? '\u200b' : fieldVal, inline);
            continue;
        }

        if (key === 'addBlankField') {
            embed.addBlankField();
            continue;
        }

        if (key === 'footer') {
            embed.setFooter(val);
            continue;
        }

        if (key === 'image') {
            embed.setImage(val);
            continue;
        }

        console.log(key + " : " + val);
        console.log('\n');
    }

    return embed;
}

function setAuthor(key, keyToCheck, val, property, embed) {
    if (key === keyToCheck) {
        if (embed.author === undefined) {
            embed.author = {};
        }

        embed.author[property] = val;
        return true;
    }

    return false;
}

exports.conf = {
    aliases: [],
    authorizedRoles: [
        'General',
        'Adjutant General',
        'Chief of Staff',
        'Commander'
    ]
};

exports.help = {
    name: "announce",
    description: "Creates an advanced embed message posted by the bot, typically used for official system information or similar to the help message you are reading. General+, [Ask the Director before using this command]",
    usage: ''
};

function tooFewArguments() {
    throw {
        type: "Too few arguments!",
        message: "There are too few arguments, run '>help announce' to see usage"
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