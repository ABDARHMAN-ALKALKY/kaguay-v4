class Kick {
  constructor() {
    this.name = "طرد";
    this.author = "Kaguya Project";
    this.cooldowns = 5;
    this.description = "طرد عضو من المجموعة عن طريق الرد على رسالته أو تاجه";
    this.role = "admin";
    this.aliases = ["kick"];
  }

  async execute({ api, event }) {
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
    }

    if (!targetID) {
      return api.sendMessage(
        "❌ | يرجى الرد على رسالة الشخص المراد طرده أو تاجه.\n📌 | مثال: رد على رسالة + طرد\nأو: طرد @اسم",
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
