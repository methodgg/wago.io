module.exports = {
  typeMatch: /^MACRO$/i,
  domain: ENUM.DOMAIN.WOW,

  decode: async (str) => {
    // does this look like a macro?
    if (!str.match(reSlashCommand)) {
      return false
    }
    return str.replace(/\\n/)
  },

  encode: async (str) => {
    if (!encodedString.match(reSlashCommand)) {
        return false
    }
    
    return str.replace(/target=/g, '@')
  },

  processMeta: () => {
    return {
        type: "MACRO",
        name: "My Macro"
    }
  },

  plainText: true
}

const reSlashCommand = /^\/(cancelaura|cancelqueuedspell|cancelform|cast|castrandom|castsequence|changeactionbar|startattack|stopattack|stopcasting|stopspelltarget|swapactionbar|use|usetoy|userandom|guilddemote|guilddisband|guildinfo|guildinvite|guildleader|guildquit|guildmotd|guildpromote|guildroster|guildremove|clearworldmarker|invite|ffa|group|master|mainassist|mainassistoff|maintank|maintankoff|promote|raidinfo|readycheck|requestinvite|targetmarker|threshold|uninvite|worldmarker|petassist|petattack|petautocastoff|petautocaston|petautocasttoggle|petdefensive|petdismiss|petfollow|petmoveto|petpassive|petstay|duel|forfeit|pvp|wargame|console|click|disableaddons|enableaddons|help|logout|macrohelp|played|quit|random|reload|script|stopmacro|time|timetest|who|assist|clearfocus|cleartarget|focus|target|targetexact|targetenemy|targetenemyplayer|targetfriend|targetfriendplayer|targetparty|targetraid|targetlastenemy|targetlastfriend|targetlasttarget)/m