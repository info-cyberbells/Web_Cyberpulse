import 'dotenv/config';
import mongoose from 'mongoose';
import Attendance from '../model/AttendanceModel.js';
import Employee from '../model/employeeModel.js';

const TARGET_ORG_ID = '69dc91330cf75741348c30a2';

// 7:00 PM IST = 13:30 UTC (IST = UTC+5:30)
function getClockOutTime(dateStr) {
  // dateStr is like '2026-03-19'
  const date = new Date(`${dateStr}T13:30:00.000Z`); // 7:00 PM IST in UTC
  return date.toISOString();
}

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to DB');

  // Get last 2 months date range
  const now = new Date();
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(now.getMonth() - 2);
  twoMonthsAgo.setHours(0, 0, 0, 0);

  console.log(`Scanning from ${twoMonthsAgo.toISOString()} to ${now.toISOString()}`);

  // Get all employees of the target org
  const orgEmployees = await Employee.find({ organizationId: TARGET_ORG_ID }, '_id');
  const empIds = orgEmployees.map(e => e._id);
  console.log(`Found ${empIds.length} employees in org ${TARGET_ORG_ID}`);

    const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find all attendance records that have clockIn but no clockOut in last 2 months
  const records = await Attendance.find({
    employeeId: { $in: empIds },
    clockInTime: { $exists: true, $ne: null },
    clockOutTime: null,
    date: { $gte: twoMonthsAgo, $lt: today },
  });

  console.log(`Found ${records.length} records with missing clock-out`);

  let fixed = 0;
  for (const record of records) {
    const dateStr = new Date(record.date).toISOString().split('T')[0];
    const clockOutISO = getClockOutTime(dateStr);

    console.log(
      `Employee ${record.employeeId} | Date: ${dateStr} → clockOutTime: ${clockOutISO} (IST: ${new Date(clockOutISO).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })})`
    );

    record.clockOutTime = clockOutISO;
    record.isEmergency = true;
    record.emergencyReason = 'Auto Clock-Out via fix script (missing clock-out)';
    record.autoClockOut = true;
    record.Employeestatus = 'clocked out';

    if (!record.workingDay || record.workingDay === 0) {
      record.workingDay = 1;
    }

    await record.save();
    fixed++;
  }

  console.log(`\nDone. Fixed ${fixed} records.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});