const { Router } = require("express");
const bodyParser = require("body-parser");
const { auth } = require("@utils/discordApi");
const Bots = require("@models/bots");
const { MessageEmbed } = require('discord.js');
const { server } = require("@root/config.json");

const route = Router();
route.use(bodyParser.urlencoded({extended: true}));

route.delete("/:id", auth, async (req, res) => {
    let {id} = req.params;
    
    const bot = await Bots.findOne({ botid: id }, { _id: false })

    if (!bot) return res.sendStatus(404)
    if (!bot.owners.primary !== req.user.id && !server.admin_user_ids.includes(req.user.id)) return res.sendStatus(403)
    
    await Bots.deleteOne({ botid: id })
    let ee = new MessageEmbed()
    .setTimestamp()
    .setDescription(`<@${req.user.id}> has deleted <@${bot.botid}>`)
    .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
    .setColor("RED")
    req.app.get('client').channels.cache.get(server.mod_log_id).send(ee);
    req.app.get('client').guilds.cache.get(server.id).members.fetch(id).then(bot => {bot.kick()}).catch(() => {})
    res.sendStatus(200)
});

module.exports = route;
