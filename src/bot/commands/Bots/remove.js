const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');
const Bots = require("@models/bots");

const { server: {mod_log_id, role_ids} } = require("@root/config.json");

const reasons = {
    "1": `Your bot was offline when we tried to verify it.`,
    "2": `Your bot is a clone of another bot`,
    "3": `Your bot responds to other bots`,
    "4": `Your bot doesn't have any/enough working commands. (Minimum: 7)`,
    "5": `Your bot has NSFW commands that work in non-NSFW marked channels`,
    "6": `Your bot doesn't have a working help command or commands list`
}
var modLog;

module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            name: 'remove',
            runIn: ['text'],
            aliases: ["delete"],
            permissionLevel: 8,
            botPerms: ["SEND_MESSAGES"],
            description: "Remove a bot from the botlist",
            usage: '[Member:user]'
        });
    }

    async run(message, [Member]) {
        if (!Member || !Member.bot) return message.channel.send(`You didn't ping a bot to remove.`)
        let e = new MessageEmbed()
            .setTitle('Reasons')
            .setColor("#5081fd")
            .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
        
            .addField(`Removing bot`, `${Member}`)
        let cont = ``;
        for (let k in reasons) {
            let r = reasons[k];
            cont += ` - **${k}**: ${r}\n`
        }
        cont += `\nEnter a valid reason number or your own reason.`
        e.setDescription(cont)
        message.channel.send(e);
        let filter = m => m.author.id === message.author.id;

        let collected = await message.channel.awaitMessages(filter, { max: 1, time: 20000, errors: ['time'] });
        let reason = collected.first().content
        let r = collected.first().content;
        let invalid = new MessageEmbed()
        .setTimestamp()
        .setTitle("Inavlid reason number.")
        .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
        .setColor("RED")
        if (parseInt(reason)) {
            r = reasons[reason]
            if (!r) return message.channel.send(invalid)
        }

        let bot = await Bots.findOne({ botid: Member.id }, { _id: false });
        await Bots.updateOne({ botid: Member.id }, { $set: { state: "deleted", owners: {primary: bot.owners.primary, additional: []} } });
        const botUser = await this.client.users.fetch(Member.id);

        if (!bot) return message.channel.send(`Unknown Error. Bot not found.`)
        let owners = [bot.owners.primary].concat(bot.owners.additional)
        e = new MessageEmbed()
            .setTitle('Bot Removed')
            .addField(`Bot`, `<@${bot.botid}>`, true)
            .addField(`Owner`, owners.map(x => x ? `<@${x}>` : ""), true)
            .addField("Mod", message.author, true)
            .addField("Reason", r)
            .setThumbnail(botUser.displayAvatarURL({format: "png", size: 256}))
            .setTimestamp()
            .setColor("RED")
        modLog.send(e)
        modLog.send(owners.map(x => x ? `<@${x}>` : "")).then(m => { m.delete() });
        
        let rem = new MessageEmbed()
        .setTimestamp()
        .setDescription(`Removed <@${bot.botid}> Check <#${mod_log_id}>.`)
        .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
        .setColor("#5081fd")
        message.channel.send(rem)
        
        owners = await message.guild.members.fetch({user: owners})
        owners.forEach(o => {
            let rem = new MessageEmbed()
            .setTimestamp()
            .setTitle(`Your bot ${bot.username} has been removed`)
            .setDescription(`>>> ${r}`)
            .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
            .setColor("RED")
            o.send(rem)
        })
        if (!message.client.users.cache.find(u => u.id === bot.botid).bot) return;
        try {
            message.guild.members.fetch(message.client.users.cache.find(u => u.id === bot.botid))
                .then(bot => {
                    bot.kick().then(() => {})
                        .catch(e => { console.log(e) })
                }).catch(e => { console.log(e) });
        } catch (e) { console.log(e) }
    }

    async init() {
        modLog = await this.client.channels.fetch(mod_log_id);
    }
};
