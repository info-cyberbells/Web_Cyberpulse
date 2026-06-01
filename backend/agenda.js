import { Agenda } from 'agenda';
import { MongoBackend } from '@agendajs/mongo-backend';
import mongoose from 'mongoose';
import { runAutoClockOutJob, runAutoClockOutJobOrg2 } from './controller/attendanceController.js';

let agenda;

export const initAgenda = async () => {
  // Ensure mongoose is connected before initializing Agenda
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

  // ✅ Added
  agenda.define('daily-auto-clock-out-org2', async (job) => {
    await runAutoClockOutJobOrg2();
  });

  // Start agenda
  await agenda.start();
  console.log('🚀 Agenda started successfully');

  // Schedule the job to run every day at 9:00 PM Asia/Kolkata
  // The '0 21 * * *' cron expression means 9:00 PM
  await agenda.every('0 21 * * *', 'daily-auto-clock-out', { timezone: 'Asia/Kolkata' });
  console.log('🕒 Scheduled daily-auto-clock-out job for 9:00 PM Asia/Kolkata');

  // ✅ Added — runs at 9:00 PM IST, clock-out time inside function is 7:00 PM
  await agenda.every('0 21 * * *', 'daily-auto-clock-out-org2', { timezone: 'Asia/Kolkata' });
  console.log('🕒 Scheduled daily-auto-clock-out-org2 job for 9:00 PM IST');
};

export const getAgenda = () => agenda;
