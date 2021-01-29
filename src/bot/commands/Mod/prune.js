const { MessageEmbed } = require('discord.js');
const { Command } = require('klasa');
module.exports = class extends Command {

    constructor(...args) {
        super(...args, {
            permissionLevel: 6,
            requiredPermissions: ['MANAGE_MESSAGES'],
            runIn: ['text'],
            description: 'Prunes a certain amount of messages w/o filter.',
            usage: '[limit:integer] [link|invite|bots|you|me|upload|user:user]',
            usageDelim: ' '
        });
    }

    async run(msg, [limit = 50, filter = null]) {
        let messages = await msg.channel.messages.fetch({ limit: 100 });
        if (filter) {
            const user = typeof filter !== 'string' ? filter : null;
            const type = typeof filter === 'string' ? filter : 'user';
            messages = messages.filter(this.getFilter(msg, type, user));
        }
        messages = messages.array().slice(0, limit);
        await msg.channel.bulkDelete(messages);
        let e = new MessageEmbed()
        .setTimestamp()
        .setTitle(`Successfully deleted ${messages.length} messages from ${limit}.`)
        .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
        .setColor("#5081fd")
        return msg.sendMessage(e);
    }

    getFilter(msg, filter, user) {
        switch (filter) {
            case 'link':
                return mes => /https?:\/\/[^ /.]+\.[^ /.]+/.test(mes.content);
            case 'invite':
                return mes => /(https?:\/\/)?(www\.)?(discord\.(gg|li|me|io)|discord\.com\/invite)\/.+/.test(mes.content);
            case 'bots':
                return mes => mes.author.bot;
            case 'you':
                return mes => mes.author.id === this.client.user.id;
            case 'me':
                return mes => mes.author.id === msg.author.id;
            case 'upload':
                return mes => mes.attachments.size > 0;
            case 'user':
                return mes => mes.author.id === user.id;
            default:
                return () => true;
        }
    }

};