require('dotenv').config()
const fs = require('fs')
const Discord = require("discord.js")
const Statcord = require("statcord.js")
const prefix = require("./prefix.js")
const language = require("./language.js")
const user = require("./user.js")
const help = require("./help.js")
const deleteMessage = require("./deleteMessage.js")

const client = new Discord.Client();
const statcord = new Statcord.Client({
    client,
    key: process.env.STATS_KEY
})

if (!fs.existsSync('data/')) {fs.mkdirSync('data/')}
if (!fs.existsSync('data/server.json')) {let rawData = '{"servers":[]}'; fs.writeFileSync('data/server.json', rawData)} else {let rawData = fs.readFileSync('data/server.json')} try {JSON.parse(rawData)} catch {let rawData = '{"servers":[]}'; fs.writeFileSync('data/server.json', rawData)}
if (!fs.existsSync('data/user.json')) {let rawData = '{"users":[]}'; fs.writeFileSync('data/user.json', rawData)} else {let rawData = fs.readFileSync('data/user.json')}try {JSON.parse(rawData)} catch {let rawData = '{"users":[]}'; fs.writeFileSync('data/user.json', rawData)}

client.on('ready', () => {
    console.log(`app.js: Logged in as ${client.user.username}!`)
    client.user.setActivity('ty help', {type: 'PLAYING'})
    statcord.autopost();
})

client.on('message', msg => {
    const author = msg.author
    const contentWithPrefix = msg.content.toLocaleLowerCase()
    const channel = msg.channel
     
    // Check if the bot is in a guild or in private message
    if (msg.guild) {let channelType = 'guild'; let id = msg.guild.id} else {let channelType = 'user'; let id = msg.author.id}

    const guildLanguage = language.get(id, channelType)
    const guildPrefix = prefix.get(id, channelType)

    // Check if message starts with prefix
    if (contentWithPrefix.startsWith("ty ")) {
        let content = contentWithPrefix.substr(3).toLocaleLowerCase()
    }
    else if (contentWithPrefix.startsWith(`${guildPrefix}`)) {
        let content = contentWithPrefix.substr(guildPrefix.length).toLocaleLowerCase()
    }
    else {return}

    statcord.postCommand(content, msg.author.id);

    // Language handling
    if (content == "language list" && msg.member.hasPermission("ADMINISTRATOR")) {
        language.list(channel)
        return
    }
    else if (content.startsWith("language ") && msg.member.hasPermission("ADMINISTRATOR")) {
        language.set(content.substring(9), channel, id, channelType)
        return
    }

    // Prefix handling
    if (content == "prefix" && msg.member.hasPermission("ADMINISTRATOR")) {
        prefix.show(guildPrefix, guildLanguage, channel)
        return
    }
    else if (content.startsWith("prefix ") && msg.member.hasPermission("ADMINISTRATOR")) {
        prefix.set(id, channelType, content.substring(7), guildLanguage, channel)
        return
    }

    // Booster handling
    if (content == "buy" || content == "b") {
        let handler = new user.userHandler(author.id, channel, guildLanguage, author.id, id, channelType)
        handler.buy(msg)
        return
    }

    // Money request handling
    if (content == "money" || content == "m") {
        let handler = new user.userHandler(author.id, channel, guildLanguage)
        handler.money(guildLanguage)
        return
    }

    // View request handling
    if (content.startsWith("view") || content.startsWith("v")) {
        if (msg.mentions.users.first() != undefined) {
            let handler = new user.userHandler(msg.mentions.users.first().id, channel, guildLanguage, author.id, id, channelType)
        }
        else {
            let handler = new user.userHandler(author.id, channel, guildLanguage, author.id, id, channelType)
        }
        handler.view(msg)
        return
    }

    // Delete message
    if (content == "delete_message" && msg.member.hasPermission("ADMINISTRATOR")) {
        deleteMessage.change(id, channelType, guildLanguage, channel)
        return
    }

    // Help
    if (content == "help" || content == "h") {
        let handler = new help.helpHandler(msg.member, channel, guildLanguage)
        handler.view()
        return
    }
})

statcord.on("autopost-start", () => {
    console.log('Started autopost')
});

statcord.on("post", status => {
    if (!status) console.log("Successful post")
    else console.error(status)
})

client.login(process.env.BOT_TOKEN)