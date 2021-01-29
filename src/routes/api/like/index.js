const { Router } = require("express");
const fetch = require("node-fetch");
const { auth } = require("@utils/discordApi");
const Bots = require("@models/bots");
const Users = require("@models/users");
const { server } = require("@root/config.json");
const { MessageEmbed } = require("discord.js")

const route = Router();

route.patch("/:id", auth, async (req, res) => {
  let user = await Users.findOne({ userid: req.user.id })
  if (user && (Date.now() - user.time) < 43200000) 
    return res.json({success: false, time: Date.now() - user.time})

  let bot = await Bots.findOneAndUpdate({ botid: req.params.id }, { $inc: { likes: 1 } })
  await Users.updateOne({ userid: req.user.id }, { $set: { time: Date.now(), botliked: req.params.id } }, { upsert: true })

  let userProfile = await req.app.get('client').users.fetch(req.user.id);
  
  // Discord Webhook
  let channel = await req.app.get('client').channels.cache.get(server.like_log);
  let webhook = (await channel.fetchWebhooks()).first();
  if (!webhook) 
    webhook = await channel.createWebhook('Faster Bots')


    bot = await Bots.findOne({ botid: req.params.id }, { _id: false })
        if (!bot) return console.log(`Bot not found.`);
        let e = new MessageEmbed()
        .setTimestamp()
       .setFooter("Faster-Bots.com", "https://cdn.discordapp.com/attachments/780891045402640394/803379629805010985/logo.png")
        .setColor("#5081fd")
                e.setAuthor(bot.username, bot.logo, bot.invite)
                e.setDescription("```" + bot.description + "```")
                e.setURL(bot.invite)
                e.setThumbnail(bot.logo)
                e.setTimestamp()
                e.addField(`Prefix`, `\`${bot.prefix ? bot.prefix : "Unknown"}\``, true)
                e.addField(`Now having:`, `\`${bot.likes || 0} Likes\``, true)
                e.addField(`View on Site`, `[CLICK HERE](https://faster-bots.com/bots/${bot.botid})`, true)
                e.addField(`Owner`, `<@${bot.owners.primary}>`, true)

  await channel.send(`<@${req.user.id}> \`(${userProfile.tag})\` liked <@${req.params.id}>`)
  await channel.send(e);

  // Custom webhook
  if (bot.webhook) {
    fetch(bot.webhook, {
      method: "POST",
      body: JSON.stringify({
        type: "like",
        bot: req.params.id,
        user: req.user.id,
        timestamp: new Date()
      }),
      headers: { 'Content-Type': 'application/json' }
    })
  }

  return res.json({ success: true })
});

module.exports = route;
