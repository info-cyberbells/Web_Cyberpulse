import cron from "node-cron";
import fs from "fs";
import path from "path";
import Attendance from "../model/AttendanceModel.js";

console.log("✅ Cron jobs initialized - attendance selfie cleanup scheduled.");

// Runs at 2:00 AM on the 1st of every month
cron.schedule("0 2 1 * *", async () => {
  try {
    console.log("🧹 Starting attendance selfie cleanup (records older than 1 month)...");

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    // Find attendance records older than 1 month that have selfie paths
    const records = await Attendance.find({
      date: { $lt: oneMonthAgo },
      $or: [
        { clockInSelfie: { $ne: null, $exists: true } },
        { clockOutSelfie: { $ne: null, $exists: true } },
      ],
    }).select("_id clockInSelfie clockOutSelfie");

    let deletedFiles = 0;
    let failedFiles = 0;

    for (const record of records) {
      const pathsToDelete = [record.clockInSelfie, record.clockOutSelfie].filter(Boolean);

      for (const imageUrl of pathsToDelete) {
        try {
          // Extract relative file path from full URL (e.g. "https://domain.com/uploads/clockIn/...")
          const relativePath = imageUrl.replace(/^https?:\/\/[^/]+\//, "");
          const absolutePath = path.resolve(relativePath);

          if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
            deletedFiles++;
          }
        } catch (fileErr) {
          console.error(`❌ Failed to delete file: ${imageUrl}`, fileErr.message);
          failedFiles++;
        }
      }

      // Clear selfie fields from DB record
      await Attendance.findByIdAndUpdate(record._id, {
        $unset: { clockInSelfie: "", clockOutSelfie: "" },
      });
    }

    console.log(`✅ Selfie cleanup done — ${records.length} records processed, ${deletedFiles} files deleted, ${failedFiles} failed.`);
  } catch (error) {
    console.error("❌ Error in attendance selfie cleanup cron:", error);
  }
}, {
  timezone: "Asia/Kolkata",
});
