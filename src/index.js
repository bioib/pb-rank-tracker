require("dotenv").config();
const Discord = require("discord.js");
const scraperjs = require("scraperjs");

const bot = new Discord.Client({ intents: ["GUILDS", "GUILD_MESSAGES"] });
const TOKEN = process.env.BOT_TOKEN;
const prefix = ".";

bot.once("ready", () => {
    bot.user.setPresence({ activities: [{ name: "@bioib_", type: "COMPETING" }] });
    console.log(`${bot.user.username} is online with prefix: ${prefix}`);
});

bot.on("messageCreate", (msg) => {
    if (!msg.content.startsWith(prefix)) return;
    if (msg.author.bot) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/g);
    const cmdName = args.shift();

    if (["check", "c"].includes(cmdName)) {
        if (args < 1) return msg.channel.send(`Usage: \`${prefix}check <nickname>\``);

        scraperjs.StaticScraper.create(
            `https://pointblank.id/ranking/individual/list?keyword=${args[0]}`
        )
            .scrape(function ($) {
                return $(".rank_d .rank, .rank_d .nick")
                    .map(function () {
                        return $(this).text();
                    })
                    .get();
            })
            .then(function (res) {
                const nick = res[0];
                const rank = res[1].match(/\w+\s+\d?/g).join("");

                const rankEmbed = new Discord.MessageEmbed()
                    .setTitle("Point Blank Rank Tracker")
                    .addFields({ name: "Nickname", value: nick }, { name: "Rank", value: rank });
                msg.channel.send({ embeds: [rankEmbed] });
            });
    }
});

bot.login(TOKEN);
