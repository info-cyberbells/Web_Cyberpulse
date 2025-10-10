import cron from "node-cron";
import Employee from '../model/employeeModel.js'; 

console.log("✅ Cron jobs initialized - leaveQuota jobs scheduled.");
console.log("🕐 Current server time:", new Date().toISOString());
console.log("🌍 Server timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);


cron.schedule("1 0 1 * *", async () => {
  try {
    console.log("🔄 Starting monthly negative quota reset...");
    const result = await Employee.updateMany(
      { leaveQuota: { $lt: 0 } }, 
      { $set: { leaveQuota: 0 } }  
    );
    console.log(`✅ Monthly Reset Done - Updated ${result.modifiedCount} employees with leaveQuota < 0`);
  } catch (error) {
    console.error("❌ Error in monthly leaveQuota reset:", error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Calcutta" 
});


cron.schedule("2 0 1 1,4,7,10 *", async () => {
  try {
    console.log("🔄 Starting quarterly quota reset to 3...");
    const result = await Employee.updateMany(
      {},
      { $set: { leaveQuota: 3 } } 
    );
    console.log(`✅ Quarterly Reset Done - Reset leaveQuota to 3 for ${result.modifiedCount} employees`);
  } catch (error) {
    console.error("❌ Error in quarterly leaveQuota reset:", error);
  }
}, {
  scheduled: true,
  timezone: "Asia/Calcutta" 
});

console.log("📅 Cron schedules set:");
console.log("Monthly: 1st of every month at 12:01 AM IST (negative quotas → 0)");
console.log("Quarterly: 1st of Jan/Apr/Jul/Oct at 12:02 AM IST (all quotas → 3)");
