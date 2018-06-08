google = require('googleapis');
const Discord = require('discord.js');

const util = require('util');

const res = require('../resources/strings/getEvents');

// configure a JWT auth client
let jwtClient = new google.auth.JWT(
    process.env.GOOGLE_API_EMAIL,
    null,
    process.env.GOOGLE_API_KEY2.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/calendar']);

//authenticate request
jwtClient.authorize(function (err, tokens) {
    if (err) {
        console.log(err);
        return;
    } else {
        console.log("Successfully connected!");
    }
});

let calendar = google.calendar('v3');

exports.run = async (bot, msg, args) => {
    let timeZone = args[0];
    timeZone = timeZone !== undefined ? timeZone : 'EST';
    timeZone = timeZone.toUpperCase();

    let embed = new Discord.RichEmbed()
        .setAuthor(res.authorName)
        .setTitle(util.format(res.embedTitle, timeZone))
        .setDescription(res.embedDescription);

    let events = await doGetEvents(timeZone);

    if (events.length === 0) {
        embed.addField(res.noEvents, '\u200b');
    } else {
        for (let i = 0; i < events.length; i++) {
            let event = events[i];

            let time = event.start.dateTime;
            time = time.substring(time.indexOf('T') + 1);

            if (!time.endsWith('Z')) {
                let timeZonePosition = time.indexOf('-') > 0 ? time.indexOf('-') : time.indexOf('+');
                time = time.substring(0, timeZonePosition);
            } else {
                time = time.substring(0, time.length - 1);
            }

            embed.addField(time, event.summary, true);
        }
    }

    bot.sendEmbed(msg.channel, embed);
};

exports.conf = res.conf;
exports.help = res.help;

/**
 *
 * @param timeZone {string}
 * @returns {Promise<Array>}
 */
function doGetEvents(timeZone) {
    const minTime = new Date();
    const maxTime = new Date();
    maxTime.setHours(23);
    maxTime.setMinutes(59);
    maxTime.setSeconds(59);

    return new Promise((resolve, reject) => {
        calendar.events.list({
            auth: jwtClient,
            timeMin: minTime.toISOString(),
            timeMax: maxTime.toISOString(),
            calendarId: 'lsoh5vt1vath2mt0bj6s201fe8@group.calendar.google.com',
            timeZone: timeZone,
            orderBy: "startTime",
            singleEvents: true
        }, function (err, response) {
            if (err) throw err;

            // Check timezone
            if (timeZone !== 'PST' && response.data.items[0] !== undefined) {
                if (response.data.items[0].start.dateTime.endsWith('-07:00')) {
                    reject(res.errors.timeZoneNotFound);
                }
            }

            resolve(response.data.items);
        });
    });
}