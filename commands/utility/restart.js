// ملف: commands/utility/restart.js
module.exports = {
  name: "restart",
  description: "إعادة تشغيل البوت (Owner only)",
  ownerOnly: true, // يشتغل لك فقط
  execute: async (bot, message, args) => {
    try {
      await message.reply("🔄 جاري إعادة تشغيل البوت...");
      
      // يعطي وقت للرسالة تطلع قبل الإغلاق
      setTimeout(() => {
        process.exit(0); // Render سيعيد تشغيل الخدمة تلقائيًا إذا Auto Restart مفعل
      }, 1000);
      
    } catch (err) {
      console.error("Error restarting bot:", err);
      message.reply("❌ حدث خطأ أثناء إعادة التشغيل");
    }
  },
};