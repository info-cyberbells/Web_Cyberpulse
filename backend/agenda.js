import { Agenda } from 'agenda';
import { MongoBackend } from '@agendajs/mongo-backend';
import mongoose from 'mongoose';
import { runAutoClockOutJob } from './controller/attendanceController.js';

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

  // Start agenda
  await agenda.start();
  console.log('🚀 Agenda started successfully');

  // Schedule the job to run every day at 9:00 PM Asia/Kolkata
  // The '0 21 * * *' cron expression means 9:00 PM
  await agenda.every('0 21 * * *', 'daily-auto-clock-out', { timezone: 'Asia/Kolkata' });
  console.log('🕒 Scheduled daily-auto-clock-out job for 9:00 PM Asia/Kolkata');
};

export const getAgenda = () => agenda;
