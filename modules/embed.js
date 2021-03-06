
module.exports = (otherResult,index,msg)=>{
    result = otherResult[index];
    var video_url = `https://media.trace.moe/video/${result.anilist_id}/${encodeURIComponent(result.filename)}?t=${result.at}&token=${result.tokenthumb}`.replace(/[)]/g, '%29')
    return {
        title: `That's what i've found ฅ^•ﻌ•^ฅ`,
        color: 7589871,
         footer: {
             icon_url: msg.author.avatarURL(),
             text: `Requested by ${msg.author.username}, Author: wnm#1663`
         },
        thumbnail: {
            url: `https://trace.moe/thumbnail.php?anilist_id=${result.anilist_id}&file=${encodeURIComponent(result.filename)}&t=${result.at}&token=${result.tokenthumb}`
        },
        description: `Anime: **${result.title_romaji}**\n` +
                     `Similarity: **${result.similarity.toFixed(4) * 100}%**\n` +
                     `Episode: **${result.episode.toString().padStart(2, "0")}**\n` +
                     `Timestamp: **${formatTime(result.at)}**\n` +
                     `MyAnimeList: [Click!](https://myanimelist.net/anime/${result.mal_id})\n` +
                     `Video: [Click!](${video_url})\n` +
                     `NSFW: ${result.is_adult ? '**Yes! Yes! Yes!**' : '**No 😫**'}`,
        image: {
            url: `https://trace.moe/thumbnail.php?anilist_id=${result.anilist_id}&file=${encodeURIComponent(result.filename)}&t=${result.at}&token=${result.tokenthumb}`
        },
        fields: [{
            name: "Other results:",
            value: `${otherResult.map((e,i)=>{
                return `[${index == i ? '👉 ' + e.title_english : e.title_englishindex == i ? '👉' + e.title_english : e.title_english}](https://myanimelist.net/anime/${result.mal_id}})`
            }).join('\n')}`
        }]
        }
    }

const formatTime = timeInSeconds => {
    const sec_num = parseInt(timeInSeconds, 10);
    const hours = Math.floor(sec_num / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((sec_num - hours * 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (sec_num - hours * 3600 - minutes * 60)
      .toString()
      .padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };
