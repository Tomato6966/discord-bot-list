const { Command } = require('klasa');
const fetch = require('node-fetch');
const Bots = require("@models/bots");
const { MessageEmbed, MessageAttachment } = require('discord.js');
const { web: {domain_with_protocol} } = require("@root/config.json");

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            usage: '[User:user]',
            description: "See the Widget of a Bot"
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`You didn't ping a bot to get a widget of.`);
        let url = `${domain_with_protocol}/api/embed/${user.id}`;
        let img = await fetch(url).then(res => res.buffer());
        message.channel.send({ files: [img] });
    }

};