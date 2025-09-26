const Discord = require('discord.js');
const client = new Discord.Client({
    intents: 32767
})
const discordTranscripts = require('discord-html-transcripts')
const mysql = require('mysql')
const config = require('./config.json')
client.login(config.token)

client.on("ready", () => {
    client.user.setActivity('discord.gg/eclipseroleplay', { type: 'PLAYING' });
    console.log("\x1b[31mBOT AVVIATO CON SUCCESSO\x1b[0m")
    setTimeout(function() {MandaEmbeded();checkallticket()}, 3000)
})
// var con = mysql.createPool({
//     host: "185.229.238.89",
//     user: "emerals",
//     password: "parmex",
//     database: "drago"
// })



//////////////// FUNZIONI ////////////////

setInterval(function(){
    inattivi(config.categoriaidgenerale)
    inattivi(config.categoriaiddonazione)
    inattivi(config.categoriaunban)
    inattivi(config.categoriapermadeath)
    inattivi(config.categoriaidvip)
}, 3600000) // ogni ora 3600000

function inattivi(idcate) {
    const guild = client.guilds.cache.get(config.idserver)
    const canaliCategoria = guild?.channels.cache.filter(ch => ch.parentId === idcate)
    var arrayid = canaliCategoria?.map(ch => ch.id)
    arrayid.forEach(id => {
        var sergitroia = client.channels.cache.get(id)
        sergitroia.messages.fetch({ limit: 1 }).then(m => {
            var lm = m.first();
            var numerogiorno = new Date(lm.createdTimestamp).getDate()
            var ora = new Date(lm.createdTimestamp).getHours()
            var oggi = new Date().getDate()
            var oradiora = new Date().getHours()
            var diff = oggi - numerogiorno
            
            if (diff >= 1 && oradiora >= ora) {
                console.log(sergitroia.name+" <== ticket inattivo da "+diff+" giorni")
                var messinattivo = '**Questo ticket è stato inattivo da piu\' di 24h, pertanto verrà chiuso automaticamente.**'
                sergitroia.send(messinattivo)
                setTimeout(chiuditicketinattivo(id), 1500)
            }
        }).catch(console.error);
    })
}

function chiuditicketinattivo(idcanale) {
    const ticketto = client.channels.cache.get(idcanale)
    const transcript = discordTranscripts.createTranscript(ticketto, {fileName: ticketto.name+'.html'});
    setTimeout(function(){
        const logtranscript = client.channels.cache.get(config.canaletranscript)

        var trascrip = new Discord.MessageEmbed()
            .setTitle(config.nomeserver+" - Transcript")
            .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
            .setColor(config.coloreserver)
            .setDescription("**Trascrizione del ticket **"+ticketto.name+"\n**Chiuso da:** Chiusura automatica per inattività\n**Categoria ticket:** "+ticketto.parent.name+"\n**Aperto da:** "+ticketto.name.slice(7)+"\n**ID Utente:** "+ticketto.topic+"")
            .setThumbnail(config.logoserver)
            .setTimestamp()

            logtranscript.send({embeds: [trascrip]})
            logtranscript.send({files: [transcript]})
            ticketto.delete();
            return
    }, 3000);
}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
  }
  
function formattaData(data) {
    return [
      padTo2Digits(data.getDate()),
      padTo2Digits(data.getMonth() + 1),
      data.getFullYear(),
    ].join('/');
  }

function checkallticket() {
    const nticketgenerale= getTicketopen(config.categoriaidgenerale)
    console.log("\n\nTotale ticket \x1b[31mGENERALE\x1b[0m aperti", nticketgenerale)
    const nticketdonazione = getTicketopen(config.categoriaiddonazione)
    console.log("Totale ticket \x1b[31mDONAZIONE\x1b[0m aperti", nticketdonazione)
    const nticketunban = getTicketopen(config.categoriaidunban)
    console.log("Totale ticket \x1b[31mUNBAN\x1b[0m aperti", nticketunban)
    const nticketperma= getTicketopen(config.categoriaidpermadeath)
    console.log("Totale ticket \x1b[31mPERMADEATH\x1b[0m aperti", nticketperma)
    const nticketvip= getTicketopen(config.categoriaidvip)
    console.log("Totale ticket \x1b[31mVIP\x1b[0m aperti", nticketvip)
    const nticketamm= getTicketopen(config.categoriaidamm)
    console.log("Totale ticket \x1b[31mAMMINISTRAZIONE\x1b[0m aperti", nticketamm)
    console.log("Totale ticket \x1b[31mAPERTI\x1b[0m", nticketgenerale+nticketdonazione+nticketunban+nticketperma+nticketvip+nticketamm)
    //generale/donazione/unban/permadeath/vip/amministrazione
}

function MandaEmbeded() {
    var canalesesso = client.channels.cache.get(config.canaleticket)
    var mandabottoni = new Discord.MessageActionRow()
            .addComponents(buttongenerale)
            .addComponents(buttondonazione)
            .addComponents(buttonunban)
            .addComponents(buttonpermadeath)
            .addComponents(buttonvip)
            var mandabottoni2 = new Discord.MessageActionRow()
            .addComponents(buttondev)
            .addComponents(buttonamm)

            var creaticket = new Discord.MessageEmbed()
            .setTitle(config.nomeserver+" - Tickets")
            .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
            .setColor(config.coloreserver)
            .setDescription("✉ **Clicca il bottone per aprire un ticket !**"+config.messaggio)
            .setThumbnail(config.logoserver)
            .setTimestamp()
        var mandamessaggio = canalesesso.send({ embeds: [creaticket], components: [mandabottoni, mandabottoni2] })
        if (mandamessaggio) {
            console.log("Messaggio Creazione ticket inoltrato con successo")
        }
        canalesesso.bulkDelete(1).catch((e) => {
            console.log(e)
            return console.log("Errore nell'eliminazione vecchio pannello ticket")
        })
}

function getTicketopen(idCategoria) {
    const guild = client.guilds.cache.get(config.idserver)
    const canaliCategoria = guild?.channels.cache.filter(ch => ch.parentId === idCategoria)
    return canaliCategoria?.size
}

function aggiornatotaleticket(idStaffer, Totale) {
    con.query("UPDATE staffer SET totale="+Totale+" WHERE discord="+idStaffer, function(err, result){
        if(err){
            console.log(err)
            return
    }});
}


//////////////// TERMINE FUNZIONI ////////////////

//APRIRE GENERALE
client.on("interactionCreate", async interaction => {
    const customId = interaction.customId


    ////////////////////////////
    if (customId == "apriGenerale") {
        if (interaction.guild.channels.cache.find(canale => canale.topic == `${interaction.user.id}`)) {
            interaction.reply({content: "**Hai già un ticket aperto.**", ephemeral: true})
            return
        }
        interaction.guild.channels.create("ticket "+interaction.user.username, {
            type: "text",
            topic: `${interaction.user.id}`,
            parent: config.categoriaidgenerale,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: interaction.user.id,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: config.ruolostaff,
                    allow: ["VIEW_CHANNEL"]
                }
            ]
        }).then(ticket => {
            var aprigenerale = new Discord.MessageEmbed()
            .setTitle(config.nomeserver+" - Tickets")
            .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
            .setColor(config.coloreserver)
            .setDescription("**Hai aperto un ticket generale !\nEsponi il tuo problema allo staff.**")
            .setThumbnail(config.logoserver)
            .setTimestamp()
            interaction.reply({content: "**Hai aperto un ticket generale** <#"+ticket+">", ephemeral: true})
            ticket.send({ content: `${interaction.member} `,embeds: [aprigenerale], components: [chiudi] })
        })
    }
    //////////////////////////////
    if (customId == "apriDonazione") {
        if (interaction.guild.channels.cache.find(canale => canale.topic == `${interaction.user.id}`)) {
            interaction.reply({content: "**Hai già un ticket aperto.**", ephemeral: true})
            return
        }
        interaction.guild.channels.create("ticket "+interaction.user.username, {
            type: "text",
            topic: `${interaction.user.id}`,
            parent: config.categoriaiddonazione,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: interaction.user.id,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: config.ruolostaff,
                    allow: ["VIEW_CHANNEL"]
                }
            ]
        }).then(ticket => {
            var apridonazione = new Discord.MessageEmbed()
            .setTitle(config.nomeserver+" - Tickets")
            .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
            .setColor(config.coloreserver)
            .setDescription("**Ciao caro, dicci come possiamo aiutarti nella tua donazione al server, grazie in anticipo per la donazione.**")
            .setThumbnail(config.logoserver)
            .setTimestamp()
            interaction.reply({content: "**Hai aperto un ticket donazioni** <#"+ticket+">", ephemeral: true})
            ticket.send({ content: `${interaction.member} `,embeds: [apridonazione], components: [chiudi] })
        })
    }
    /////////////////////////
    if (customId == "apriUnban") {
        if (interaction.guild.channels.cache.find(canale => canale.topic == `${interaction.user.id}`)) {
            interaction.reply({content: "**Hai già un ticket aperto.**", ephemeral: true})
            return
        }
        interaction.guild.channels.create("ticket "+interaction.user.username, {
            type: "text",
            topic: `${interaction.user.id}`,
            parent: config.categoriaidunban,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: interaction.user.id,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: config.ruolostaff,
                    allow: ["VIEW_CHANNEL"]
                }
            ]
        }).then(ticket => {
            var apriunban = new Discord.MessageEmbed()
            .setTitle(config.nomeserver+" - Tickets")
            .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
            .setColor(config.coloreserver)
            .setDescription("**Ciao caro, fornisci screen del ban e tagga l' autore, il prima possibile cercheremo di risolvere il tuo problema.**")
            .setThumbnail(config.logoserver)
            .setTimestamp()
            interaction.reply({content: "**Hai aperto un ticket UnBan** <#"+ticket+">", ephemeral: true})
            ticket.send({ content: `${interaction.member} `,embeds: [apriunban], components: [chiudi] })
        })
    }
    /////////////////////
    if (customId == "apriPermadeath") {
        if (interaction.guild.channels.cache.find(canale => canale.topic == `${interaction.user.id}`)) {
            interaction.reply({content: "**Hai già un ticket aperto.**", ephemeral: true})
            return
        }
        interaction.guild.channels.create("ticket "+interaction.user.username, {
            type: "text",
            topic: `${interaction.user.id}`,
            parent: config.categoriaidpermadeath,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: interaction.user.id,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: config.ruolostaff,
                    allow: ["VIEW_CHANNEL"]
                }
            ]
        }).then(ticket => {
            var apriperma = new Discord.MessageEmbed()
            .setTitle(config.nomeserver+" - Tickets")
            .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
            .setColor(config.coloreserver)
            .setDescription("**Ciao caro, fornisci 5 motivazioni valide e clip video a sostegno di ciò.**")
            .setThumbnail(config.logoserver)
            .setTimestamp()
            interaction.reply({content: "**Hai aperto un ticket PermaDeath** <#"+ticket+">", ephemeral: true})
            ticket.send({ content: `${interaction.member} `,embeds: [apriperma], components: [chiudi] })
        })
    }
    //////////////////////////
    if (customId == "apriVip") {
        if(interaction.member.roles.cache.has(config.ruolovip)) {
        if (interaction.guild.channels.cache.find(canale => canale.topic == `${interaction.user.id}`)) {
            interaction.reply({content: "**Hai già un ticket aperto.**", ephemeral: true})
            return
        }
        interaction.guild.channels.create("ticket "+interaction.user.username, {
            type: "text",
            topic: `${interaction.user.id}`,
            parent: config.categoriaidvip,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: interaction.user.id,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: config.ruolostaff,
                    allow: ["VIEW_CHANNEL"]
                }
            ]
        }).then(ticket => {
            var aprivip = new Discord.MessageEmbed()
            .setTitle(config.nomeserver+" - Tickets")
            .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
            .setColor(config.coloreserver)
            .setDescription("**Ciao caro, dicci di cosa hai bisogno !**")
            .setThumbnail(config.logoserver)
            .setTimestamp()
            interaction.reply({content: "**Hai aperto un ticket VIP** <#"+ticket+">", ephemeral: true})
            ticket.send({ content: `${interaction.member} `,embeds: [aprivip], components: [chiudi] })
        })
    }else{
        interaction.reply({content: '**Questa categoria è riservata solamente ai VIP.**', ephemeral: true})
        return
    }
  }

    
      //////////////////////////
      if (customId == "apriDeveloper") {
        if (interaction.guild.channels.cache.find(canale => canale.topic == `${interaction.user.id}`)) {
            interaction.reply({content: "**Hai già un ticket aperto.**", ephemeral: true})
            return
        }
        interaction.guild.channels.create("ticket "+interaction.user.username, {
            type: "text",
            topic: `${interaction.user.id}`,
            parent: config.categoriaiddev,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: interaction.user.id,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: config.ruolostaff,
                    allow: ["VIEW_CHANNEL"]
                }
            ]
        }).then(ticket => {
            var apridev = new Discord.MessageEmbed()
            .setTitle(config.nomeserver+" - Tickets")
            .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
            .setColor(config.coloreserver)
            .setDescription("**Ciao caro, benvenuto all'interno dei ticket Developer.**")
            .setThumbnail(config.logoserver)
            .setTimestamp()
            interaction.reply({content: "**Hai aperto un ticket Developer** <#"+ticket+">", ephemeral: true})
            ticket.send({ content: `${interaction.member} `,embeds: [apridev], components: [chiudi] })
        })
  }
      //////////////////////////
      if (customId == "apriAmm") {
        if (interaction.guild.channels.cache.find(canale => canale.topic == `${interaction.user.id}`)) {
            interaction.reply({content: "**Hai già un ticket aperto.**", ephemeral: true})
            return
        }
        interaction.guild.channels.create("ticket "+interaction.user.username, {
            type: "text",
            topic: `${interaction.user.id}`,
            parent: config.categoriaidamm,
            permissionOverwrites: [
                {
                    id: interaction.guild.id,
                    deny: ["VIEW_CHANNEL"]
                },
                {
                    id: interaction.user.id,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: config.ruoli.respstaff,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: config.ruoli.cofounder,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: config.ruoli.founder,
                    allow: ["VIEW_CHANNEL"]
                }
            ]
        }).then(ticket => {
            var aprimm = new Discord.MessageEmbed()
            .setTitle(config.nomeserver+" - Tickets")
            .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
            .setColor(config.coloreserver)
            .setDescription("**Ciao caro, benvenuto all'interno dei ticket Amministrazione.**")
            .setThumbnail(config.logoserver)
            .setTimestamp()
            interaction.reply({content: "**Hai aperto un ticket Amministrazione** <#"+ticket+">", ephemeral: true})
            ticket.send({ content: `${interaction.member} `,embeds: [apriamm], components: [chiudi] })
        })
  }
})


client.on("messageCreate", async  message => {
    if (message.content == "-st") {
        message.delete()
        if(message.member.roles.cache.has(config.ruolostaff)){
        const nticketgenerale= getTicketopen(config.categoriaidgenerale)
        const nticketdonazione = getTicketopen(config.categoriaiddonazione)
        const nticketunban = getTicketopen(config.categoriaidunban)
        const nticketperma= getTicketopen(config.categoriaidpermadeath)
        const nticketvip= getTicketopen(config.categoriaidvip)
        const nticketdev = getTicketonpe(config.categoriaiddev)
        const nticketamm = getTicketopen(config.categoriaidamm)
        var msggg = `**Totale ticket GENERALE aperti** *${nticketgenerale}*\n**Totale ticket DONAZIONE aperti** *${nticketdonazione}*\n**Totale ticket UNBAN aperti** *${nticketunban}*\n**Totale ticket PERMADEATH aperti** *${nticketperma}*\n**Totale ticket VIP aperti** *${nticketvip}*\n**Totale ticket DEVELOPER aperti** *${nticketdev}**Totale ticket AMMINISTRAZIOINE aperti** *${nticketamm}*\n**Totale ticket APERTI** *${nticketgenerale+nticketdonazione+nticketunban+nticketperma+nticketvip+nticketamm}*`
        var embedd = new Discord.MessageEmbed()
        .setTitle(config.nomeserver+" - Statistiche Ticket")
        .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
        .setColor(config.coloreserver)
        .setDescription(msggg)
        .setThumbnail(config.logoserver)
        message.channel.send({embeds: [embedd]})
    }
    }
})
client.on("messageCreate", async  message => {
    if (message.content.startsWith("-r")) {
        message.delete()
        if(message.member.roles.cache.has(config.ruolostaff)){
            if (!message.channel.topic) {
                message.channel.send("**Non puoi utilizzare questo comando qui.**");
                return
            }
            let args = message.content.split(/ +/)
            var nome = args.slice(1)
            var chiapre = client.users.cache.get(message.channel.topic)
            message.channel.setName(nome+" "+chiapre.username)
            console.log(nome)
     }
    }
})

//CHIUDI TICKET
client.on("interactionCreate", async interaction => {
    const customId = interaction.customId
    // console.log(customId)
    if (customId == "chiudiTicket") {
        // if (interaction.member.roles.cache.has(config.ruolostaff)) {
        await interaction.reply({ content: '**Il ticket verrà chiuso ed eliminato tra pochi secondi. Trascrizione inoltrata in **<#'+config.canaletranscript+">", ephemeral: true });
        const ticketto = interaction.channel;
        const transcript =  await discordTranscripts.createTranscript(ticketto, {fileName: interaction.channel.name+'.html'});
        setTimeout(function(){
        const logtranscript = client.channels.cache.get(config.canaletranscript)


        var persona = ticketto.topic
        var tizio = client.users.cache.get(persona)
        // console.log(tizio)
        var trascrip = new Discord.MessageEmbed()
            .setTitle(config.nomeserver+" - Transcript")
            .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
            .setColor(config.coloreserver)
            .setDescription("**Trascrizione del ticket **"+ticketto.name+"\n**Chiuso da:** "+interaction.member.user.tag+"\n**Categoria ticket:** "+ticketto.parent.name+"\n**Aperto da:** "+ticketto.name.slice(7)+"\n**ID Utente:** "+ticketto.topic+"\n**[Inoltra una recensione staff](https://docs.google.com/forms/d/1f_FKN5hXPp5_XMIxS9_tfNp1pAqZdRvASTVRbprFEBg)**")
            .setThumbnail(config.logoserver)
            .setTimestamp()


        logtranscript.send({embeds: [trascrip]})

        logtranscript.send({
            files: [transcript]
        }).then(link => {
            var nometrans = link.attachments?.map(MessageAttachment => MessageAttachment.name)
            var urltrans = link.attachments?.map(MessageAttachment => MessageAttachment.url)
            // console.log(nometrans,urltrans)
            con.query("UPDATE gestiti SET url="+urltrans+" WHERE discord="+interaction.user.id, function(err, result){
                if(err){
                    console.log(err)
                    return
            }});
            con.query("INSERT INTO transcript (nome, url, chiapre, chichiude, idcanale) values ('"+nometrans+"', '"+urltrans+"', '"+ticketto.topic+"', '"+interaction.user.id+"', '"+config.canaletranscript+"')", function(err, result){
                if(err){
                    // console.log(err)
                    return
                }
            });    
        })

        tizio.send({embeds: [trascrip]}).catch(() => { })
        tizio.send({files: [transcript], content: "**Scarica questo file ed aprilo con il tuo browser per visualizzare il tuo ticket.**"}).catch(() => { })

        interaction.channel.delete();
        return
    }, 3000);
//    }
  }
})


//GESTIONE TICKET


client.on("interactionCreate", async interaction => {
    const customId = interaction.customId
    if (customId == "gestisciTicket") {
        if (interaction.member.roles.cache.has(config.ruolostaff)) {
        if(!interaction.channel.topic.startsWith("PG")) {
        await interaction.reply({ content: '**Hai preso in gestione questo ticket**', ephemeral: true });
       await interaction.channel.send({content: `**Lo staffer ${interaction.member} ha preso in gestione questo ticket.**`}).then(mess => {mess.pin()})
        const tickettozzo = interaction.channel;
        // tickettozzo.permissionOverwrites.edit(interaction.user.id, { SEND_MESSAGES: true });
        // tickettozzo.permissionOverwrites.edit(config.ruolostaff, { SEND_MESSAGES: false });
        // tickettozzo.permissionOverwrites.edit(interaction.guild.id, { SEND_MESSAGES: false });
        // tickettozzo.permissionOverwrites.edit(interaction.channel.topic, { SEND_MESSAGES: true });
        // let c = interaction.channel.topic
        // tickettozzo.setTopic("PG-"+interaction.user.tag+" "+c)
        setTimeout(function(){
        const loggestione = client.channels.cache.get(config.canalegestione)
            var data = new Date();
        con.query("INSERT INTO gestiti (nome, discord, data, ticket,idcanale) values ('"+interaction.member.user.tag+"', '"+interaction.member.id+"', '"+formattaData(data)+" - "+data.getHours() + ":" + data.getMinutes()+"', '"+tickettozzo.name+"', '"+tickettozzo+"')", function(err, result){
            if(err){
                console.log(err)
                return
            }
        });




            con.query("SELECT * FROM staffer WHERE discord = '"+interaction.member.id+"'", function(err, result){
            if(err){
                console.log(err)
                return
            }

            if(result[0]){
                var tcount = result[0].totale
                var n = tcount + 1
                // console.log(tcount, n)
                aggiornatotaleticket(interaction.member.id, n)
            }else{
                con.query("INSERT INTO staffer (nome, discord, totale) values ('"+interaction.member.user.tag+"', '"+interaction.member.id+"', '1')");
            }
        });

        var embeded = new Discord.MessageEmbed()
            .setTitle(config.nomeserver+" - Gestione")
            .setFooter({ text: config.nomeserver, iconURL: config.logoserver })
            .setColor(config.coloreserver)
            .setDescription("**Preso in gestione da:** "+interaction.member.user.tag+"\n**Categoria ticket:** "+tickettozzo.parent.name+"\n**Aperto da:** "+tickettozzo.name.slice(7)+"\n**ID Utente:** "+tickettozzo.topic+"")
            .setThumbnail(config.logoserver)
            .setTimestamp()
            loggestione.send({embeds: [embeded]})
        return
    }, 3000);
   }
}
   if (!interaction.member.roles.cache.has(config.ruolostaff)) {
    await interaction.reply({ content: '**I ticket possono prenderli in gestione solo gli staffer.**', ephemeral: true });
   }
  }
})



//FACIMM STI BOTTON
var bottonechiudi = new Discord.MessageButton()
.setLabel("Chiudi")
.setCustomId("chiudiTicket")
.setStyle("PRIMARY")
.setEmoji("🔒")
var bottonegestione = new Discord.MessageButton()
.setLabel("Prendi in gestione")
.setCustomId("gestisciTicket")
.setStyle("PRIMARY")
.setEmoji("📌")


var buttongenerale = new Discord.MessageButton()
.setLabel("Generale")
.setCustomId("apriGenerale")
.setStyle("SECONDARY")
.setEmoji("📣")
var buttondonazione = new Discord.MessageButton()
.setLabel("Donazione")
.setCustomId("apriDonazione")
.setStyle("SECONDARY")
.setEmoji("🎁")
var buttonunban = new Discord.MessageButton()
.setLabel("UnBan")
.setCustomId("apriUnban")
.setStyle("SECONDARY")
.setEmoji("❌")
var buttonpermadeath = new Discord.MessageButton()
.setLabel("Permadeath")
.setCustomId("apriPermadeath")
.setStyle("SECONDARY")
.setEmoji("💀")
var buttonvip = new Discord.MessageButton()
.setLabel("VIP")
.setCustomId("apriVip")
.setStyle("SECONDARY")
.setEmoji("💎")
var buttondev = new Discord.MessageButton()
.setLabel("Developer")
.setCustomId("apriDeveloper")
.setStyle("SECONDARY")
.setEmoji("💻")
var buttonamm = new Discord.MessageButton()
.setLabel("Amministrazione")
.setCustomId("apriAmm")
.setStyle("SECONDARY")
.setEmoji("🔰")


var chiudi = new Discord.MessageActionRow()
.addComponents(bottonechiudi)
.addComponents(bottonegestione)

var ticketopen = new Discord.MessageEmbed()
.setTitle(config.nomeserver+" - Tickets")
.setFooter({ text: config.nomeserver, iconURL: config.logoserver })
.setColor(config.coloreserver)
.setDescription("**Hai aperto un ticket !\nEsponi il tuo problema allo staff.**")
.setThumbnail(config.logoserver)
.setTimestamp()


process.on('unhandledRejection', (reason, p) => {
    console.log('Drago | SCRIPT RIFIUTATO');
    console.log(reason, p);
    return
});



process.on("uncaughtException", (err, origin) => {
    console.log('Drago | ERRORE DI CATTURA');
    console.log(err, origin); 
    return
}) 



process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log('Drago | BLOCCATO'); 
    console.log(err, origin);
    return
});


process.on('multipleResolves', (type, promise, reason) => {
    console.log('Drago | ERRORI VARI'); 
    console.log(type, promise, reason);
    return
});