const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle, } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "partner",
  description: "Prime Partner'in partnerlik ayarlarını aktif eder veya silersiniz.",
  options: [
    {
      type: 1,
      name: "ayarla",
      description: "Prime Partner bu komutun kullanıldığı sunucuya partnerlik sistemini aktif eder.",
      options: [
        {
          type: 7,
          name: "partner-kanal",
          description: "Partnerliklerin gönderileceği kanalı belirtiniz.",
          required: true
        },
        {
          type: 7,
          name: "partner-log",
          description: "Partnelik isteklerinin gönderileceği kanalı belirtiniz.",
          required: true
        }
      ]
    },
    {
      type: 1,
      name: "gönder",
      description: "Prime Partner girdiğiniz sunucu koduna partnerlik isteği gönderir.",
      options: [
        {
          type: 3,
          name: "kod",
          description: "Partnerlik yapmak istediğiniz sunucunun kodunu giriniz.",
          required: true
        }
      ]
    },
    {
      type: 1,
      name: "yazı",
      description: "Prime Partner girilen yazıları partnerlik yazısı olarak kayıt eder.",
      options: [
        {
          type: 3,
          name: "partner-yazı",
          description: "Partnerlik yazınızı giriniz.",
          required: true
        }
      ]
    },
    {
      type: 1,
      name: "bul",
      description: "Prime Partner partnerlik sistemi aktif olan sunucuların üye sayısı ve idlerini listeler."
    }
  ],
  
  execute: async(client, interaction, db) => {
    await interaction.deferReply();
    
    const { user, guild, options } = interaction;
    const subCommand = options.getSubcommand();
    
    switch(subCommand) {
      case "ayarla": {
        const partnerKanal = options.getChannel("partner-kanal");
        const partnerLog = options.getChannel("partner-log");
        
        if(partnerKanal.type === 0 && partnerLog.type === 0) {
         db.set(`partnerServer_${guild.id}`, { date: Date.now(), whoOpen: user.id, kanal: partnerKanal.id, log: partnerLog.id })           
        return await interaction.followUp({ embeds: [{ color: 0x2F3136, description: "<:tik:1039607067729727519> **|** GG! Partnerlik sistemleri için gerekli işlemleri yaptın." }] }) 
        } else {
         return await interaction.followUp({ embeds: [{ color: 0x2F3136, description: "<:carpi:1040649840394260510> **|** Girilen her iki kanalın türüde `Metin Kanalı` olmak zorundadır." }] }) 
        }
      }
        
      case "gönder": {
        const code = options.getString("kod");
        const partnerText = db.fetch(`partnerText_${guild.id}`);
        const server = await client.guilds.cache.get(code);
        const ourPartnerText = db.fetch(`partnerText_${server.id}`);
        const myPartnerServer = db.fetch(`partnerServer_${guild.id}`)
        
        const parnetlikload = db.fetch(`partnerlikLoad_${server.id}${guild.id}`);
        
        if(parnetlikload) {
          return await interaction.followUp({ embeds: [{ color: 0x2F3136, description: "<:carpi:1040649840394260510> **|** Karşı sunucuya zaten partnerlik isteği gönderilmiş." }] }) 
        }
        
        if(!ourPartnerText) {
          return await interaction.followUp({ embeds: [{ color: 0x2F3136, description: "<:carpi:1040649840394260510> **|** Partnerlik isteği gönderebilmeniz için karşı sunucunun partnerlik yazısını aktif etmesi gerekmektedir." }] }) 
        }
        
        if(!partnerText) {
          return await interaction.followUp({ embeds: [{ color: 0x2F3136, description: "<:carpi:1040649840394260510> **|** Partnerlik isteği gönderebilmeniz için partnerlik yazınızı aktif etmeniz gerekmektedir." }] }) 
        }
        
        if(!myPartnerServer) {
          return await interaction.followUp({ embeds: [{ color: 0x2F3136, description: "<:carpi:1040649840394260510> **|** Partnerlik isteği gönderebilmeniz için partnerlik sistemini kendi sunucunuzda aktif etmeniz gerekmektedir." }] }) 
        }
        
        if(!server) {
           return await interaction.followUp({ embeds: [{ color: 0x2F3136, description: "<:carpi:1040649840394260510> **|** Girilen sunucu kodu ya hatalıdır yada ben bulunmuyorum." }] }) 
        } else {       
          const partnerServer = db.fetch(`partnerServer_${code}`);
          if(!partnerServer) {
            return await interaction.followUp({ embeds: [{ color: 0x2F3136, description: "<:carpi:1040649840394260510> **|** Bu sunucudaki partnerlik sistemi aktif edilmemiş." }] }) 
          }
          
          const channel =  server.channels.cache.get(partnerServer.log);
          const myChannel =  guild.channels.cache.get(myPartnerServer.log);
          
          const row = new ActionRowBuilder()
			    .addComponents(
            new ButtonBuilder()
              .setCustomId(`kabulet_${guild.id}`)
              .setLabel('Kabul et')
              .setEmoji("✅")
              .setStyle(ButtonStyle.Secondary),
             new ButtonBuilder()
              .setCustomId(`reddet_${guild.id}`)
              .setLabel('Reddet')
              .setEmoji("❌")
              .setStyle(ButtonStyle.Secondary),
			    );
          
          const embed = new EmbedBuilder()
          .setColor(0x2F3136)
          .setAuthor({ name: "Partnerlik İsteği | "+guild.name, iconURL: guild.iconURL() })
          .setThumbnail(user.displayAvatarURL())
          .setDescription(`\`-\` **${guild.name}** adlı sunucudan bir partnerlik isteği aldınız, yapmak istediğiniz işlemi butonlar aracılığı ile uygulayınız.`)
          
          channel.send({ embeds: [embed], components: [row] })
          db.set(`partnerlikLoad_${guild.id}${server.id}`, { otherServerId: guild.id, otherUserId: user.id })
          
          return interaction.followUp({ embeds: [{ color: 0x2F3136, description: "<:tik:1039607067729727519> **|** Karşı sunucuya partnerlik isteği başarıyla gönderildi." }] })
        }
      }
        
      case "yazı": {
        const partnerText = db.fetch(`partnerText_${guild.id}`);
        const text = options.getString("partner-yazı");
        
        if(!text.includes("https://discord.gg/")) {
          return await interaction.followUp({ embeds: [{ color: 0x2F3136, description: "<:carpi:1040649840394260510> **|** Partnerlik yazısında en az bir kere sunucu linki olmalıdır." }] }) 
        }
        
        db.set(`partnerText_${guild.id}`, { text: text });
        return interaction.followUp({ embeds: [{ color: 0x2F3136, description: "<:tik:1039607067729727519> **|** Partnerlik yazısı başarıyla ayarlandı." }] })
      }
      
      case "bul": {
        const partnerGuilds = await client.guilds.cache.filter(sw => db.fetch(`partnerServer_${sw.id}`))
        const allGuilds = await client.guilds.cache.size;
        
        const totalPartnerGuilds = (allGuilds - partnerGuilds.lenght)
        const partners = partnerGuilds.map(guild => `👋 **|** **Sunucu İsmi:** \`${guild.name}\` *-* **Üye sayısı:** \`${guild.memberCount}\` - **Kod:** \`${guild.id}\``)
        
        var maxPage = 12;
        var minPage = 0;

        let nowPage = 1;
        let valuePage = 1
        
        var splitPage = partners.slice(minPage, maxPage).join("\n") || "Sayfa boş."
        
        const row = new ActionRowBuilder()
			.addComponents(
				new StringSelectMenuBuilder()
					.setCustomId(`pbul_${user.id}`)
					.setPlaceholder('Geçmek istediğiniz sayfayı seçiniz.')
					.addOptions([
						{
							label: `Sayfa: ${nowPage++} `,
							description: 'Prime Partner üzerinden partnerlik gönderebileceğiniz sunuculardır.',
							value: `${valuePage++}`,
						},
						{
							label: `Sayfa: ${nowPage++} `,
							description: 'Prime Partner üzerinden partnerlik gönderebileceğiniz sunuculardır.',
							value: `${valuePage++}`,
						},
						{
							label: `Sayfa: ${nowPage++} `,
							description: 'Prime Partner üzerinden partnerlik gönderebileceğiniz sunuculardır.',
							value: `${valuePage++}`,
						},
            {
							label: `Sayfa: ${nowPage++} `,
							description: 'Prime Partner üzerinden partnerlik gönderebileceğiniz sunuculardır.',
							value: `${valuePage++}`,
						},
						{
							label: `Sayfa: ${nowPage++} `,
							description: 'Prime Partner üzerinden partnerlik gönderebileceğiniz sunuculardır.',
							value: `${valuePage++}`,
						},
						{
							label: `Sayfa: ${nowPage++} `,
							description: 'Prime Partner üzerinden partnerlik gönderebileceğiniz sunuculardır.',
							value: `${valuePage++}`,
						},
            {
							label: `Sayfa: ${nowPage++} `,
							description: 'Prime Partner üzerinden partnerlik gönderebileceğiniz sunuculardır.',
							value: `${valuePage++}`,
						},
						{
							label: `Sayfa: ${nowPage++} `,
							description: 'Prime Partner üzerinden partnerlik gönderebileceğiniz sunuculardır.',
							value: `${valuePage++}`,
						},
						{
							label: `Sayfa: ${nowPage++} `,
							description: 'Prime Partner üzerinden partnerlik gönderebileceğiniz sunuculardır.',
							value: `${valuePage++}`,
						},
					]),
			);
        
        
        
        const embed = new EmbedBuilder()
        .setColor(0x2F3136)
        .setDescription(`<:buyutec:1059874676521840671> **|** İşte partnerlik sistemi aktif olan sunucular:\n\n ${splitPage}`)
        
        return interaction.followUp({ embeds: [embed], components: [row] }).then(async() => {
          const filter = i =>  i.user.id === user.id;

          const collector = interaction.channel.createMessageComponentCollector({ filter });

          collector.on('collect', async i => {
            const selected = i.values[0];
            row.components.placeholder = `Sayfa: ${selected}`
            
            if(selected === "1") {
              var splitPage = partners.slice(0, 12).join("\n") || "Sayfa boş."
              
              await i.update({ embeds: [embed.setDescription(`<:buyutec:1059874676521840671> **|** İşte partnerlik sistemi aktif olan sunucular:\n\n ${splitPage}`)] });
            } else if(selected === "2") {
              var splitPage = partners.slice(12, 24).join("\n") || "Sayfa boş."
              
              await i.update({ embeds: [embed.setDescription(`<:buyutec:1059874676521840671> **|** İşte partnerlik sistemi aktif olan sunucular:\n\n ${splitPage}`)] });
            } else if(selected === "3") {
              var splitPage = partners.slice(24, 36).join("\n") || "Sayfa boş."
              
             await i.update({ embeds: [embed.setDescription(`<:buyutec:1059874676521840671> **|** İşte partnerlik sistemi aktif olan sunucular:\n\n ${splitPage}`)] });
            } else if(selected === "4") {
              var splitPage = partners.slice(12, 24).join("\n") || "Sayfa boş."
              
            await i.update({ embeds: [embed.setDescription(`<:buyutec:1059874676521840671> **|** İşte partnerlik sistemi aktif olan sunucular:\n\n ${splitPage}`)] });
            } else if(selected === "5") {
              var splitPage = partners.slice(24, 36).join("\n") || "Sayfa boş."
              
              await i.update({ embeds: [embed.setDescription(`<:buyutec:1059874676521840671> **|** İşte partnerlik sistemi aktif olan sunucular:\n\n ${splitPage}`)] });
            } else if(selected === "6") {
              var splitPage = partners.slice(36, 48).join("\n") || "Sayfa boş."
              
              await i.update({ embeds: [embed.setDescription(`<:buyutec:1059874676521840671> **|** İşte partnerlik sistemi aktif olan sunucular:\n\n ${splitPage}`)] });
            } else if(selected === "7") {
              var splitPage = partners.slice(48, 60).join("\n") || "Sayfa boş."          
              
              await i.update({ embeds: [embed.setDescription(`<:buyutec:1059874676521840671> **|** İşte partnerlik sistemi aktif olan sunucular:\n\n ${splitPage}`)] });
            } else if(selected === "8") {
              var splitPage = partners.slice(60, 72).join("\n") || "Sayfa boş."
            
              await i.update({ embeds: [embed.setDescription(`<:buyutec:1059874676521840671> **|** İşte partnerlik sistemi aktif olan sunucular:\n\n ${splitPage}`)] });
            } else if(selected === "9") {
              var splitPage = partners.slice(72, 84).join("\n") || "Sayfa boş."
              
              
              await i.update({ embeds: [embed.setDescription(`<:buyutec:1059874676521840671> **|** İşte partnerlik sistemi aktif olan sunucular:\n\n ${splitPage}`)] });
            }
          });
          
        })
        
        
      }
    }
  }
}