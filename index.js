'use strict'
let token_config = require('./token_config');
let Bot = require('./bot');

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

function getArgs (msg) {
    return msg.split(' ').slice(1)
}