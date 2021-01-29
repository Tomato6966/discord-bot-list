const { Command } = require('klasa');
const discord = require("discord.js")
module.exports = class extends Command {
    constructor(...args) {
        super(...args, {
            runIn: ['text'],
            aliases: ["pong", "latency"],
            description: "Check the bot's latency",
        });
    }

    async run(message, [...params]) {
        function duration(ms) {
            const sec = Math.floor((ms / 1000) % 60).toString()
            const min = Math.floor((ms / (1000 * 60)) % 60).toString()
            const hrs = Math.floor((ms / (1000 * 60 * 60)) % 60).toString()
            const days = Math.floor((ms / (1000 * 60 * 60 * 24)) % 60).toString()
            return `${days.padStart(1, '0')} Days, ${hrs.padStart(2, '0')} Hours, ${min.padStart(2, '0')} Minutes, ${sec.padStart(2, '0')} Seconds, `
        }
    
        let sEmbed = new discord.MessageEmbed()
            .setDescription(`📈 **Faster-Bots.com** is since ${duration(this.client.uptime)} online.`)
            .setColor("#5081fd")
            .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
        
    message.channel.send(sEmbed);
    }

};