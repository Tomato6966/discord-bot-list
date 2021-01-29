const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

const { server: {mod_log_id, role_ids} } = require("@root/config.json");

var modLog;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            permissionLevel: 8,
            usage: '[User:user]',
            description: "Verify a Discord Bot"
        });
    }

    async run(message, [user]) {
        if (!user || !user.bot) return message.channel.send(`Ping a **bot**.`);
        let bot = await Bots.findOne({botid: user.id}, { _id: false });

        const botUser = await this.client.users.fetch(user.id);
        if (bot.logo !== botUser.displayAvatarURL({format: "png", size: 256}))
            await Bots.updateOne({ botid: user.id }, {$set: {state: "verified", logo: botUser.displayAvatarURL({format: "png", size: 256})}});
        else 
            await Bots.updateOne({ botid: user.id }, {$set: { state: "verified" } })
        
        let owners = [bot.owners.primary].concat(bot.owners.additional)
        let e = new MessageEmbed()
            .setTitle('Bot Verified')
            .addField(`Bot`, `<@${bot.botid}>`, true)
            .addField(`Owner(s)`, owners.map(x => x ? `<@${x}>` : ""), true)
            .addField(`View on Site`, `[CLICK HERE](http://faster-bots.com/bots/${bot.botid})`, true)
            .addField("Mod", message.author, true)
            .setThumbnail(botUser.displayAvatarURL({format: "png", size: 256}))
            .setTimestamp()
            .setColor("GREEN")
        modLog.send(e);
        modLog.send(owners.map(x => x ? `<@${x}>` : "")).then(m => { m.delete() });

        owners = await message.guild.members.fetch({user:owners})
        owners.forEach(o => {
            o.roles.add(message.guild.roles.cache.get(role_ids.bot_developer));
            let e = new MessageEmbed()
            .setTimestamp()
            .setThumbnail(botUser.displayAvatarURL({format: "png", size: 256}))
            .addField(`Bot`, `<@${bot.botid}>`, true)
            .addField(`View on Site`, `[CLICK HERE](http://faster-bots.com/bots/${bot.botid})`, true)
            .addField("Mod", message.author, true)
            .setTitle(`Your bot \`${bot.username}\` has been verified.`)
            .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
            .setColor("GREEN")
            o.send(e)
        })
        message.guild.members.fetch(message.client.users.cache.find(u => u.id === bot.botid)).then(bot => {
            bot.roles.set([role_ids.bot, role_ids.verified]);
        })
        let e2 = new MessageEmbed()
            .setTimestamp()
            .setThumbnail(botUser.displayAvatarURL({format: "png", size: 256}))
            .setTitle(`Verified \`${bot.username}\``)
            .addField(`View on Site`, `[CLICK HERE](http://faster-bots.com/bots/${bot.id})`)
            .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
            .setColor("GREEN")
        message.channel.send(e2);
    }

    async init() {
        modLog = await this.client.channels.fetch(mod_log_id);
    }
};