class Restart {
  constructor() {
    this.name = "restart";               // اسم الأمر
    this.aliases = ["ريستارت", "إعادة تشغيل"];
    this.description = "إعادة تشغيل البوت (Owner only)";
    this.role = "owner";                 // فقط المالك يستطيع استخدامه
    this.cooldowns = 5;                  // فترة انتظار بين الاستخدامات
  }

  async execute({ api, event, args }) {
    const { threadID } = event;

    try {
      // إرسال رسالة قبل إعادة التشغيل
      await api.sendMessage("🔄 جاري إعادة تشغيل البوت...", threadID);

      // يعطي وقت للرسالة لتظهر قبل الإغلاق
      setTimeout(() => {
        process.exit(0); // Render سيعيد تشغيل البوت تلقائيًا إذا Auto Restart مفعل
      }, 1000);

    } catch (err) {
      console.error("[Restart] خطأ:", err);
      await api.sendMessage("❌ حدث خطأ أثناء إعادة التشغيل", threadID);
    }
  }
}

export default new Restart();