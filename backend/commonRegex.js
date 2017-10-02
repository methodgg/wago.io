module.exports = {
  WeakAuraBlacklist: /((getfenv|setfenv|loadstring|pcall|SendMail|SetTradeMoney|AddTradeMoney|PickupTradeMoney|PickupPlayerMoney|TradeFrame|MailFrame|EnumerateFrames|RunScript|AcceptTrade|SetSendMailMoney|EditMacro|SlashCmdList|DevTools_DumpCommand|hash_SlashCmdList|CreateMacro|SetBindingMacro|GuildDisband|GuildUninvite)([\s]*\([^\)]*\))?)/g,

  MaliciousCode: /((UninviteUnit)([\s]*\([^\)]*\))?)/g,

  LuaKeyWord: /\b(and|break|do|else|elseif|end|false|for|if|in|local|nil|not|repeat|return|then|true|until|while|_G|_VERSION|getfenv|getmetatable|ipairs|load|module|next|pairs|pcall|print|rawequal|rawget|rawset|select|setfenv|setmetatable|tonumber|tostring|type|unpack|xpcall|coroutine|debug|math|package|string|table|SetAttribute|SetAllPoints|CreateFrame|unit|player|target)\b/g
}