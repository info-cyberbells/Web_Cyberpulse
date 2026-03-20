import 'dotenv/config';
import mongoose from 'mongoose';
import Attendance from '../model/AttendanceModel.js';

// 9:40 AM to 9:50 AM IST = 4:10 to 4:20 UTC (IST = UTC+5:30)
const MIN_MINUTES_UTC = 4 * 60 + 10; // 4:10 UTC
const MAX_MINUTES_UTC = 4 * 60 + 20; // 4:20 UTC

function randomClockInTime() {
  const totalMinutes = Math.floor(Math.random() * (MAX_MINUTES_UTC - MIN_MINUTES_UTC + 1)) + MIN_MINUTES_UTC;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = Math.floor(Math.random() * 60);
  const ms = Math.floor(Math.random() * 1000);

  const date = new Date('2026-03-19T00:00:00.000Z');
  date.setUTCHours(hours, minutes, seconds, ms);
  return date.toISOString();
}

async function run() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to DB');

  const start = new Date('2026-03-19T00:00:00.000Z');
  const end = new Date('2026-03-19T23:59:59.999Z');

  const records = await Attendance.find({ date: { $gte: start, $lte: end } });
  console.log(`Found ${records.length} attendance records for 19 March 2026`);

  let fixed = 0;
  for (const record of records) {
    const newTime = randomClockInTime();
    console.log(`Employee ${record.employeeId} → clockInTime: ${newTime} (IST: ${new Date(newTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })})`);
    record.clockInTime = newTime;
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
