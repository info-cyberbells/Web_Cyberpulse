import cron from "node-cron";
import Employee from "../model/employeeModel.js";
import OrganizationSettings from "../model/organizationSettingsModel.js";

console.log("✅ leaveQuota cron initialized");
console.log("🕐 Server time:", new Date().toISOString());
console.log("🌍 Timezone:", Intl.DateTimeFormat().resolvedOptions().timeZone);

// ─────────────────────────────────────────────────────────────────────────────
// CRON A — 1st of Jan / Apr / Jul / Oct @ 12:02 AM IST
//   → Only for orgs with policy = "quarterly_reset"
//   → Resets ALL employees in those orgs to leaveQuota = "3"
//   → Does NOT touch employees in monthly_increment orgs
// ─────────────────────────────────────────────────────────────────────────────
cron.schedule(
  "2 0 1 1,4,7,10 *",
  async () => {
    try {
      console.log("🔄 [Quarterly Reset] Running...");

      const orgs = await OrganizationSettings.find({
        $or: [
          { leaveQuotaPolicy: "quarterly_reset" },
          { leaveQuotaPolicy: { $exists: false } },
        ],
      }).select("organizationId");

      if (!orgs.length) {
        console.log("ℹ️  [Quarterly Reset] No orgs with quarterly_reset policy.");
        return;
      }

      const orgIds = orgs.map((o) => o.organizationId);

      const result = await Employee.updateMany(
        { organizationId: { $in: orgIds } },
        { $set: { leaveQuota: "3" } }
      );

      console.log(
        `✅ [Quarterly Reset] Reset to 3 for ${result.modifiedCount} employees in ${orgIds.length} org(s).`
      );
    } catch (err) {
      console.error("❌ [Quarterly Reset] Error:", err);
    }
  },
  { scheduled: true, timezone: "Asia/Calcutta" }
);

// ─────────────────────────────────────────────────────────────────────────────
// CRON B — 1st of every month @ 12:03 AM IST
//   → Only for orgs with policy = "monthly_increment"
//   → Only runs if currentMonth >= org's leaveQuotaIncrementStartMonth
//   → Adds +1 on top of each employee's CURRENT leaveQuota (used leaves preserved)
//   → Does NOT touch employees in quarterly_reset orgs
// ─────────────────────────────────────────────────────────────────────────────
cron.schedule(
  "3 0 1 * *",
  async () => {
    try {
      const currentMonth = new Date().getMonth() + 1; // 1-12
      console.log(`🔄 [Monthly Increment] Running for month ${currentMonth}...`);

      const orgs = await OrganizationSettings.find({
        leaveQuotaPolicy: "monthly_increment",
      }).select("organizationId leaveQuotaIncrementStartMonth");

      if (!orgs.length) {
        console.log("ℹ️  [Monthly Increment] No orgs with monthly_increment policy.");
        return;
      }

      let totalUpdated = 0;

      for (const orgSetting of orgs) {
        const startMonth = orgSetting.leaveQuotaIncrementStartMonth ?? 4;

        if (currentMonth < startMonth) {
          console.log(
            `⏭️  [Monthly Increment] Org ${orgSetting.organizationId} skipped — month ${currentMonth} < startMonth ${startMonth}`
          );
          continue;
        }

        // Fetch only active employees of this specific org
        const employees = await Employee.find({
          organizationId: orgSetting.organizationId,
          status: "1",
        }).select("_id leaveQuota");

        if (!employees.length) continue;

        const bulkOps = employees.map((emp) => {
          const current = parseFloat(emp.leaveQuota) || 0;
          
          // ANNUAL RESET LOGIC: 
          // If this is the starting month of the cycle, reset to 1 instead of adding +1
          let newValue;
          if (currentMonth === startMonth) {
            newValue = "1";
            console.log(`♻️  [Monthly Increment] Annual Reset triggered for Org ${orgSetting.organizationId}`);
          } else {
            newValue = (current + 1).toString();
          }

          return {
            updateOne: {
              filter: { _id: emp._id },
              update: { $set: { leaveQuota: newValue } },
            },
          };
        });

        const result = await Employee.bulkWrite(bulkOps);
        totalUpdated += result.modifiedCount;

        console.log(
          `✅ [Monthly Increment] Org ${orgSetting.organizationId} — +1 applied to ${result.modifiedCount} employees`
        );
      }

      console.log(`✅ [Monthly Increment] Done — ${totalUpdated} employees updated total.`);
    } catch (err) {
      console.error("❌ [Monthly Increment] Error:", err);
    }
  },
  { scheduled: true, timezone: "Asia/Calcutta" }
);

console.log("📅 Cron schedules:");
console.log("  CRON A — Jan/Apr/Jul/Oct 1st @ 12:02 AM → Quarterly reset to 3 (quarterly_reset orgs only)");
console.log("  CRON B — Every 1st @ 12:03 AM           → +1 increment (monthly_increment orgs only, after start month)");
