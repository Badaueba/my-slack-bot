//enable strict mode, use es6 sintax, such let, const...
'use strict'

const RtmClient = require('@slack/client').RtmClient;

const MemoryDataScore = require('@slack/client').MemoryDataStore;

const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const token = require('./token_config').token;

let slack = new RtmClient(token, {
    logLevel : 'error',
    dataStore : new MemoryDataScore(),
    autoReconnect : true,
    autoMark : true
})

slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
    let user = slack.dataStore.getUserById(slack.activeUserId);

    let team = slack.dataStore.getTeamById(slack.activeTeamId);

    console.log(`Connected to ${team.name} as ${user.name}`);

    let channels = getChannels(slack.dataStore.channels);

    let channelNames = channels.map( (channel) => {
        return channel.name
    }).join(', ');
    console.log(`Currently in : ${channelNames}`)
    
    channels.forEach((channel) => {
        let members = channel.members.map( (id) => {
            return slack.dataStore.getUserById(id);
        })
        members = members.filter((member) => {
            return !member.is_bot;
        });
        
        let membersNames = members.map( (member) => {
            return member.name;
        }).join(', ');

        console.log('Members of this channel: ', membersNames)
    });

})


slack.start();

//return an array of all the channels the bot resides in
function getChannels(allChannels) {
    let channels = []

    for (let id in allChannels) {
        let channel = allChannels[id]
        console.log(channel.name)
        if (channel.is_member){
            channels.push(channel)
        }
        return channels;
    }
}