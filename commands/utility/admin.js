class Admin {
  constructor() {
    this.name = "ادمن";
    this.author = "Kaguya Project";
    this.cooldowns = 5;
    this.description = "رفع أو نزع صلاحية الادمن عن طريق الرد أو التاج";
    this.role = "admin";
    this.aliases = ["admin"];
  }

  async execute({ api, event, args }) {
    const { threadID, messageID, senderID, messageReply, mentions } = event;

    if (!event.isGroup) {
      return api.sendMessage("❌ | هذا الأمر يعمل فقط في المجموعات.", threadID, messageID);
    }

    const action = args[0];

    if (!action || !["رفع", "نزع", "up", "down"].includes(action)) {
      return api.sendMessage(
        "❌ | يرجى تحديد العملية:\n" +
        "📌 ادمن رفع + رد أو تاج ← لرفع الادمن\n" +
        "📌 ادمن نزع + رد أو تاج ← لنزع الادمن",
        threadID,
        messageID
      );
    }

    const isPromote = action === "رفع" || action === "up";

    let targetID = null;

    if (messageReply) {
      targetID = messageReply.senderID;
    } else if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    }

    if (!targetID) {
      return api.sendMessage(
        `❌ | يرجى الرد على رسالة الشخص أو تاجه لـ${isPromote ? "رفعه" : "نزعه"}.`,
        threadID,
        messageID
      );
    }

    if (targetID === senderID) {
      return api.sendMessage("❌ | لا يمكنك تعديل صلاحياتك بنفسك.", threadID, messageID);
    }

    if (targetID === api.getCurrentUserID()) {
      return api.sendMessage("❌ | لا يمكن تعديل صلاحيات البوت.", threadID, messageID);
    }

    try {
      const userInfo = await api.getUserInfo(targetID);
      const targetName = userInfo?.[targetID]?.name || targetID;

      await api.changeAdminStatus(String(threadID), [targetID], isPromote);

      const emoji = isPromote ? "👑" : "🚫";
      const actionText = isPromote ? "تم رفع" : "تم نزع";
      const statusText = isPromote ? "إلى مشرف" : "من الإشراف";

      await api.sendMessage(
        `${emoji} | ${actionText}『${targetName}』${statusText} بنجاح.`,
        threadID
      );
    } catch (err) {
      console.error("[ادمن] خطأ:", JSON.stringify(err));
      const errCode = err?.error || err?.rawResponse?.error || "";
      let reason = "تأكد من أن البوت لديه صلاحيات الإدارة في هذه المجموعة.";
      if (errCode === 1976004 || String(err).includes("not an admin")) {
        reason = "البوت ليس مشرفاً في هذه المجموعة. يرجى تعيينه كمشرف أولاً.";
      } else if (errCode === 1357031 || String(err).includes("not a group")) {
        reason = "هذا الأمر يعمل فقط في المجموعات.";
      }
      await api.sendMessage(`❌ | فشلت العملية.\n⚠️ | ${reason}`, threadID, messageID);
    }
  }
}

export default new Admin();
