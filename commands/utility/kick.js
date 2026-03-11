class Kick {
  constructor() {
    this.name = "طرد";
    this.author = "Kaguya Project";
    this.cooldowns = 5;
    this.description = "طرد عضو من المجموعة عن طريق الرد أو التاج أو المعرف أو رابط الحساب";
    this.role = "admin";
    this.aliases = ["kick"];
  }

  extractIDFromArg(arg) {
    if (!arg) return null;

    if (/^\d+$/.test(arg)) {
      return arg;
    }

    const idFromQuery = arg.match(/[?&]id=(\d+)/);
    if (idFromQuery) return idFromQuery[1];

    const fbUrlMatch = arg.match(/facebook\.com\/(?:profile\.php\?id=)?([^/?&\s]+)/);
    if (fbUrlMatch) {
      const segment = fbUrlMatch[1];
      if (/^\d+$/.test(segment)) return segment;
      return segment;
    }

    return null;
  }

  async resolveTarget(api, arg) {
    const extracted = this.extractIDFromArg(arg);
    if (!extracted) return null;

    if (/^\d+$/.test(extracted)) {
      return extracted;
    }

    try {
      const info = await api.getUserInfo(extracted);
      if (info && Object.keys(info).length > 0) {
        return Object.keys(info)[0];
      }
    } catch (_) {}

    return null;
  }

  async execute({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;

    if (!event.isGroup) {
      return api.sendMessage("❌ | هذا الأمر يعمل فقط في المجموعات.", threadID, messageID);
    }

    let targetID = null;
    let targetName = null;

    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (args[0]) {
      targetID = await this.resolveTarget(api, args[0]);
      if (!targetID) {
        return api.sendMessage(
          "❌ | تعذّر إيجاد الحساب. تأكد من صحة المعرف أو الرابط.",
          threadID,
          messageID
        );
      }
    }

    if (!targetID) {
      return api.sendMessage(
        "❌ | يرجى تحديد الشخص المراد طرده بإحدى الطرق التالية:\n" +
        "📌 رد على رسالته + طرد\n" +
        "📌 طرد @اسم\n" +
        "📌 طرد [معرف الحساب]\n" +
        "📌 طرد [رابط الحساب]",
        threadID,
        messageID
      );
    }

    if (targetID === senderID) {
      return api.sendMessage("❌ | لا يمكنك طرد نفسك.", threadID, messageID);
    }

    if (targetID === api.getCurrentUserID()) {
      return api.sendMessage("❌ | لا يمكنك طرد البوت.", threadID, messageID);
    }

    try {
      const userInfo = await api.getUserInfo(targetID);
      targetName = userInfo?.[targetID]?.name || targetID;

      await api.removeUserFromGroup(targetID, threadID);

      await api.sendMessage(
        `✅ | تم طرد『${targetName}』من المجموعة بنجاح.`,
        threadID
      );
    } catch (err) {
      await api.sendMessage(
        "❌ | فشل طرد العضو. تأكد من أن البوت لديه صلاحيات الإدارة.",
        threadID,
        messageID
      );
    }
  }
}

export default new Kick();
