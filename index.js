'use strict'

let token_config = require('./token_config');
let Bot = require('./bot');
const request = require('superagent');

const wikiAPI = "https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=";
const wikiURL = 'https://en.wikipedia.org/wiki/';

const bot = new Bot({
    token : token_config.token,
    autoReconnect : true,
    autoMark : true
});

bot.respondTo('hello', (message, channel, user) => {
    bot.send(`Hello to you too, ${user.name}!`, channel)
}, true);

bot.respondTo('roll', (message, channel, user) => {
    const members = bot.getMembersByChannel(channel);

    if (!members) {
        bot.send('You have to challenge someone in a channel, not a direct message!', channel);
        return;
    }

    let args = getArgs(message.text);

    if (args.length < 1) {
        bot.send('You have to provide the name of the person you wish to challenge!', channel);
        return;
    }

    if (members.indexOf(args[0]) < 0) {
        bot.send(`Sorry ${user.name}, but i either can't find ${args[0]} in this channel, or they are a bot!`, channel);
        return;
    }
    let firstRoll = Math.round(Math.random() * 100);
    let secondRoll = Math.round(Math.random() * 100);
    while (firstRoll === secondRoll) {
        secondRoll = Math.round(Math.random() * 100);
    }
    let challenger = user.name;
    let opponent = args[0];
    let winner = firstRoll > secondRoll ? challenger : opponent;

    bot.send(`${challenger} fancies their changes against ${opponent}!\n
        ${challenger} rolls: ${firstRoll}\n
        ${opponent} rolls: ${secondRoll}\n\n
        *${winner} is the winner!*`, channel
    );

}, true)

bot.respondTo('help', (message, channel) => {
    bot.send(`To use my Wikipedia functionality, type \`wiki\` followed by your search query`, channel);
}, true)

bot.respondTo('wiki', (message, channel, user) => {
    if (user && user.is_bot) return;
    let args = message.text.split(' ').slice(1).join(' ');

    getWikiSummary( args, (err, result, url) => {
        if (err) {
            bot.send(`I\m Sorry, but something went wrong with your query`, channel);
            console.error(err);
            return;
        }
        let pageID = Object.keys(result.query.pages)[0];
        if (parseInt(pageID, 10) === -1) {
            bot.send(`That page does not exist yet, perhaps you\'d like to create it`, channel);
            bot.send(url, channel);
            return;
        }
        let page = result.query.pages[pageID];
        let summary = page.extract;
        if (/may refer to/i.test(summary)) {
            bot.send('Your search query may refer to multiple things, please be more specific or visit: ', channel);
            bot.send(url, channel);
            return;
        }

        if (summary !== '') {
            bot.send(url, channel);
            let paragraphs = summary.split('\n');
            
            paragraphs.forEach( paragraph => {
                if (paragraph !== '') {
                    bot.send(`> ${paragraph}`, channel);
                }
            });
        }
        else{
            bot.send('I\'m sorry, I couldn\'t find anything on that subject. Try another one!', channel)
        }
    });
}, true);

bot.respondTo('test', (message, channel) => {
    bot.setTypingIndicator(message.channel);

    setTimeout( () => {
        bot.send('Not typing anymore!', channel);
    }, 1000);

}, true);

function getArgs (msg) {
    return msg.split(' ').slice(1)
}

function getWikiSummary(term, cb) {
    let parameters = term.replace(/ /g, '%20');
    request
        .get(wikiAPI + parameters)
        .end((err, res) => {
            if (err){
                cb(err);
                return;
            }
            let url = wikiURL + parameters;
            cb(null, JSON.parse(res.text), url);
        });
}