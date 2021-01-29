const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");


module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            aliases: ["bot-info", "info"],
            usage: '[User:user]',
            description: "See information about the tagged Bot"
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Ping a **bot** to get info about.`);
        if (user.id === message.client.user.id) return message.channel.send(`-_- No`);

        const bot = await Bots.findOne({ botid: user.id }, { _id: false })
        if (!bot) return message.channel.send(`Bot not found.`);

        let servers;
        console.log(bot.servers.count)
        if (bot.servers[bot.servers.length - 1])
            servers = bot.servers[bot.servers.length - 1].count;
        else servers = "NOT SETUPPED";

        const botUser = await this.client.users.fetch(user.id);
        if (bot.logo !== botUser.displayAvatarURL({format: "png", size: 256}))
            await Bots.updateOne({ botid: user.id }, {$set: {logo: botUser.displayAvatarURL({format: "png", size: 256})}});
        let e = new MessageEmbed()
            try{e.setColor("#5081fd")}catch{}
            try{e.setAuthor(bot.username, botUser.displayAvatarURL({format: "png", size: 256}), bot.invite)}catch{}
            try{ee.setDescription("```" + bot.description + "```")}catch{}
            try{e.setThumbnail(botUser.displayAvatarURL({format: "png", size: 256}))}catch{}
            try{e.setTimestamp()}catch{}
            try{e.setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")}catch{}
            try{e.addField(`Prefix`, `\`${bot.prefix ? bot.prefix : "Unknown"}\``, true)}catch{}
            try{e.addField(`Support Server`, !bot.support ? "Not Added" : `[\`Click Here\`](${bot.support})`, true)}catch{}
            try{e.addField(`Website`, !bot.website ? "Not Added" : `[\`Click Here\`](${bot.website})` , true)}catch{}
            try{e.addField(`Github`, !bot.github ? "Not Added" : `[\`Click Here\`](${bot.github})` , true)}catch{}
            try{e.addField(`Likes`, "`" + `${bot.likes || 0} Likes` + "`", true)}catch{}
            //try{e.addField("Servers","`" + servers + "`")}catch{}
            try{e.addField(`Owner`, `<@${bot.owners.primary}>`, true)}catch{}
            try{ e.addField(`View on Site`, `[\`CLICK HERE\`](http://faster-bots.com/bots/${bot.botid})`)}catch{}
            try{ e.addField(`State`, bot.state, true)}catch{}
        message.channel.send(e);
    }
};