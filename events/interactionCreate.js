const Discord = require("discord.js");
const fs = require("fs");
const db = require("croxydb");
const config = require("../config.json");

module.exports = {
  name: Discord.Events.InteractionCreate,
  
  execute: async(client, interaction) => {
	if(interaction.isChatInputCommand()) {
		if (!interaction.guild) return;

	for(let props of fs.readdirSync("./commands")) {
			const command = require(`../commands/${props}`);

			if(interaction.commandName.toLowerCase() === command.name.toLowerCase()) {
        		return command.execute(client, interaction, db);
      		}
		  }	
	  }
    
    if(interaction.isButton()) {
        const id = interaction.customId.split("_")[1]
        
        
        if(interaction.customId === `kabulet_${id}`) {
          
          const data = db.fetch(`partnerlikLoad_${id}${interaction.guild.id}`);
          const server = await client.guilds.cache.get(data.otherServerId);
          
          const partnerServer = db.fetch(`partnerServer_${id}`);
          const myPartnerServer = db.fetch(`partnerServer_${interaction.guild.id}`)
          
          const channel =  server.channels.cache.get(partnerServer.kanal);
          const myChannel =  interaction.guild.channels.cache.get(myPartnerServer.kanal);
          
          const log =  server.channels.cache.get(partnerServer.log);
          const myLog =  interaction.guild.channels.cache.get(myPartnerServer.log);
          
          const partnerText = db.fetch(`partnerText_${interaction.guild.id}`);
          const ourPartnerText = db.fetch(`partnerText_${server.id}`);
          
          const user = await client.users.cache.get(data.otherUserId)
          
          const embed = new Discord.EmbedBuilder()
          .setColor(0x2F3136)
           .setThumbnail(server.iconURL())
          .setAuthor({ name: "Partnerlik Kabul Edildi", iconURL: interaction.user.displayAvatarURL() })
          .addFields([
            {
              name: "Kabul eden:",
              value: "```"+interaction.user.tag+"```",
              inline: true
            },
            {
              name: "Gönderen:",
              value: "```"+user.tag+"```",
              inline: true
            }
          ]);
          
          
          
          log.send({ embeds: [embed] })
          myLog.send({ embeds: [embed] })
          
          channel.send({ content: `${partnerText.text}` })
          myChannel.send({ content: `${ourPartnerText.text}` })
          
          db.delete(`partnerlikLoad_${server.id}${interaction.guild.id}`)
          return interaction.update({ embeds: [{ color: 0x2F3136, description: "<:tik:1039607067729727519> **|** Partnerlik isteğini başarıyla onayladınız." }], components: [] })
        }
        
      }
    }
  }