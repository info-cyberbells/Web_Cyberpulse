import { configureStore, combineReducers } from '@reduxjs/toolkit';
import projectsReducer from './features/projects/projectsSlice';
import authReducer from './features/auth/authSlice';
import employeeReducer from './features/employees/employeeSlice';
import technologyReducer from './features/technologies/technologySlice';
import statusReducer from './features/status/statusSlice';
import leaveReducer from './features/leave/leaveSlice';
import eventReducer from './features/events/eventSlice';
import annoucementReducer from './features/annoucement/AnnoucementSlice';
import attendanceReducer from './features/attendance/attendanceSlice';
import taskReducer from './features/task/taskSlice';
import helpDeskReducer from './features/helpDesk/helpSlice';
import holidayReducer from './features/holiday/holidaySlice';
import departmentReducer from './features/department/departmentSlice';
import advanceSalaryReducer from './features/advanceSalary/advanceSalarySlice';
import salaryReducer from './features/salary/salarySlice';
import handbookReducer from './features/handbook/handbookSlice';
import employeeDetailsReducer from './features/employeeDetail/employeeDetailSlice';
import employeeDocumentsReducer from './features/employeeDocuments/employeeDocumentsSlice';
import salarySlipReducer from './features/salarySlip/salarySlipSlice';
import employeeRatingReducer from './features/employeeRating/employeeRatingSlice';
import invoiceReducer from "./features/invoice/invoiceSlice";
import { RESET_APP_STATE } from './features/auth/authSlice';


const appReducer = combineReducers({
  projects: projectsReducer,
  auth: authReducer,
  employees: employeeReducer,
  technologies: technologyReducer,
  status: statusReducer,
  leaves: leaveReducer,
  events: eventReducer,
  announcements: annoucementReducer,
  attendances: attendanceReducer,
  tasks: taskReducer,
  helpdesk: helpDeskReducer,
  holiday: holidayReducer,
  departments: departmentReducer,
  advanceSalary: advanceSalaryReducer,
  salary: salaryReducer,
  handbook: handbookReducer,
  employeeDetails: employeeDetailsReducer,
  employeeDocuments: employeeDocumentsReducer,
  salarySlip: salarySlipReducer,
  employeeRatings: employeeRatingReducer,
  invoice: invoiceReducer,
});


const rootReducer = (state, action) => {

  if (action.type === 'auth/logoutUser' || action.type === RESET_APP_STATE) {

    localStorage.clear();

    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});