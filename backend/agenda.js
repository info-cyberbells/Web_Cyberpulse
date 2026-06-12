import { Agenda } from 'agenda';
import { MongoBackend } from '@agendajs/mongo-backend';
import mongoose from 'mongoose';
import { runAutoClockOutJob } from './controller/attendanceController.js'; 

let agenda;

/**
 * Compute the next 9:00 PM IST as a UTC Date.
 * IST = UTC + 5:30, so 9:00 PM IST = 3:30 PM UTC (15:30).
 * If 9 PM IST already passed today, returns tomorrow's 9 PM IST.
 */
const getNext9pmIST = () => {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(15, 30, 0, 0); // 15:30 UTC = 21:00 IST = 9:00 PM IST
  if (next <= now) {
    next.setUTCDate(next.getUTCDate() + 1);
  }
  return next;
};

export const initAgenda = async () => {
  if (mongoose.connection.readyState !== 1) {
    console.log('Waiting for MongoDB connection to initialize Agenda...');
  }

  const mongoConnectionString = process.env.MONGO_URL;

  if (!mongoConnectionString) {
    console.error('MONGO_URL environment variable is not set. Cannot initialize Agenda.');
    return;
  }

  agenda = new Agenda({
    backend: new MongoBackend({ address: mongoConnectionString, collection: 'agendaJobs' })
  });

  // Define jobs
  agenda.define('daily-auto-clock-out', async (job) => {
    await runAutoClockOutJob();
  });

  // ──────────────────────────────────────────────────────────────────
  //  RESTART-SAFE SCHEDULING
  //  • Updates or creates the jobs with correct cron string (9 PM IST)
  //  • Safety fix for stale nextRunAt dates
  // ──────────────────────────────────────────────────────────────────

  const jobNames = ['daily-auto-clock-out'];
  const collection = mongoose.connection.collection('agendaJobs');

  for (const jobName of jobNames) {
    // 1. Force the correct cron interval in the DB so it doesn't get stuck on old schedules
    // Using UTC cron: 30 15 * * * = 3:30 PM UTC = 9:00 PM IST
    await agenda.every('30 15 * * *', jobName, null, { skipImmediate: true });

    // 2. Check the database to ensure the nextRunAt date isn't stuck in the past
    const existing = await collection.findOne({ name: jobName });
    if (existing) {
      const nextRun = existing.nextRunAt;
      
      // Safety: if nextRunAt is in the past (stale), fix it to the future
      if (!nextRun || new Date(nextRun) < new Date()) {
        const next9pm = getNext9pmIST();
        await collection.updateOne(
          { name: jobName },
          { $set: { nextRunAt: next9pm } }
        );
        console.log(`  ⚠️  Fixed stale nextRunAt → ${next9pm.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`);
      } else {
        const nextRunIST = new Date(nextRun).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        console.log(`🕒 ${jobName} next run: ${nextRunIST} IST`);
      }
    } else {
      console.log(`🕒 Created ${jobName} — will run daily at 9:00 PM IST`);
    }
  }

  // Start agenda AFTER fixing the dates so it doesn't pick up old jobs immediately
  await agenda.start();
  console.log('🚀 Agenda started successfully');
};

export const getAgenda = () => agenda;
