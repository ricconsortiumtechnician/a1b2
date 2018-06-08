exports.run = async (bot, msg, args) => {
    // TODO implement
    console.log('Hello World');
};

exports.conf = {
    aliases: ['addMerit', 'addmerit'],
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
    name: "addPoints",
    description: "Adds merit to the specified user",
    usage: "addmerit username amount reason"
};