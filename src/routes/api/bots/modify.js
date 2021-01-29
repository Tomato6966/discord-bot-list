const { Router } = require("express");
const sanitizeHtml = require('sanitize-html');
const { auth } = require("@utils/discordApi");
const checkFields = require('@utils/checkFields');
const Bots = require("@models/bots");
const { MessageEmbed } = require('discord.js');
const { server } = require("@root/config.json");

const opts = {
    allowedTags: [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'hr', 'br',
    'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img', 's', 'u'],
    disallowedTagsMode: 'discard',
    allowedAttributes: {
        a: [ 'href' ],
        img: [ 'src' ]
    },
    allowedSchemes: [ 'https' ]
}

const route = Router();

route.patch("/:id", auth, async (req, res) => {
    let data = req.body;
    data.long = sanitizeHtml(data.long, opts);
    let bot = await Bots.findOne({ botid: req.params.id }, { _id: false });

    // Backward compatability
    if (String(bot.owners).startsWith("["))
        bot.owners = {
            primary: String(bot.owners).replace("[ '", "").replace("' ]", "").split("', '")[0],
            additional: String(bot.owners).replace("[ '", "").replace("' ]", "").split("', '").slice(1)
        }

    let check = await checkFields(req, bot);
    if (!check.success) return res.json(check);

    let { long, description, invite, prefix, support, website, github, tags, webhook } = data;

    await Bots.updateOne({ botid: req.params.id }, {$set: { long, description, invite, prefix, support, website, github, tags, webhook, owners: { primary: bot.owners.primary, additional: check.users } } })
    
    bot = await Bots.findOne({ botid: req.params.id }, { _id: false })
    let servers;
        if (bot.servers[bot.servers.length - 1])
            servers = bot.servers[bot.servers.length - 1].count;
    let ee = new MessageEmbed()
        .setTimestamp()
        .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
        .setColor("#5081fd")
                try{ee.setAuthor(bot.username, bot.logo, bot.invite)}catch{}
                try{ee.setDescription("```" + bot.description + "```")}catch{}
                try{ee.setThumbnail(bot.logo)}catch{}
                try{ee.setTimestamp()}catch{}
                try{ee.setURL(bot.invite)}catch{}
                try{ee.addField(`Prefix`, `\`${bot.prefix ? bot.prefix : "Unknown"}\``, true)}catch{}
                try{ee.addField(`View on Site`, `[\`CLICK HERE\`](http://faster-bots.com/bots/${bot.botid})`, true)}catch{}
                try{ee.addField(`Owner`, `<@${bot.owners.primary}>`, true)}catch{}
                try{ee.addField(`State`, "`" + bot.state + "`", true)}catch{}
                req.app.get('client').channels.cache.get(server.mod_log_id).send(`<@${req.user.id}> has updated <@${bot.botid}>`)
    req.app.get('client').channels.cache.get(server.mod_log_id).send(ee)
    return res.json({success: true, message: "Added bot", url: `/bots/${bot.botid}`})
});

module.exports = route;
