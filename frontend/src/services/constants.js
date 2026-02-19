export const API_ROUTES = {
  LOGIN: "employee/login/",
  REGISTER_ORG_ADMIN: "admin/registerOrgAdmin",

  ADD_PROJECT: "/projects/add",
  DELETE_PROJECT: "/projects/delete/",
  EDIT_PROJECT: "/projects/update/",
  LIST_PROJECTS: "/projects/fetchAll/",
  STATUS_LIST: "/status/fetchAll",

  ADD_EMPLOYEE: "/employee/add",
  EMPLOYEE_LIST: "/employee/fetchAll",
  EDIT_EMPLOYEE: "/employee/update/",
  CHANGE_PASSWORD: "/employee/change/password/",
  DELETE_EMPLOYEE: "/employee/delete",
  UPDATE_EMPLOYEE_STATUS: "/employee/update/",
  GET_EMPLOYEE_ATTENDANCE_PER_MONTH: '/attendance/month/task',

  ADD_TECHNOLOGY: "/technology/add/",
  LIST_TECHNOLOGIES: "/technology/fetchAll",
  DELETE_TECHNOLOGY: "/technology/delete",
  EDIT_TECHNOLOGY: "/technology/update/",

  ADD_LEAVE: "/leave/add",
  DELETE_LEAVE: "/leave/delete",
  EDIT_LEAVE: "/leave/update/",
  LIST_All_LEAVE: "/leave/fetchAll/",
  LIST_LEAVE: 'leave/detail',

  ADD_EVENT: "/event/add",
  DELETE_EVENT: "/event/delete",
  EDIT_EVENT: "/event/update/",
  LIST_All_EVENT: "/event/fetchAll/",
  LIST_EVENT: 'event/detail',
  UPCOMING_ANNOUCMENT: '/announcement/upcomingAnnoucment',

  ADD_Annoucement: "/announcement/add",
  DELETE_Annoucement: "/announcement/delete",
  EDIT_Annoucement: "/announcement/update/",
  LIST_All_Annoucement: "/announcement/fetchAll",
  LIST_Annoucement: 'announcement/detail',

  ADD_Attendance: "/attendance/add",
  DELETE_Attendance: "/attendance/delete",
  EDIT_Attendance: "/attendance/update/",
  LIST_All_Attendance: "/attendance/fetchAll",
  ATTENDANCE_TASKS: "/attendance/month/task",
  LIST_Attendance: "/attendance",
  Count_Attendance: "/attendance/monthly-summary",
  CURRENT_EMP_LOGIN: "/attendance/currentEmpAttendance",
  PREVIOUS_DAY_AUTO_CLOCKOUT: '/attendance/previousDayAutoClockout',
  MONTHLY_ATTENDANCE: "/attendance/monthlyAttendence",

  ADD_TASK: "/task/add",
  DELETE_TASK: "/task/delete",
  EDIT_TASK: "/task/update/",
  STATUS_TASK: "/task/status/",

  LIST_All_TASK: "/task/fetchAll",
  LIST_TASK: 'task/detail',

  ADD_HELPDESK: "/help/desk/add",
  UPDATE_TICKET_STATUS: "/help/desk/updateStatus/",
  GET_USER_TICKETS: '/help/desk/fetchAll',
  LIST_ALL_HELPDESK: "/help/desk/fetchAll",

  ADD_HOLIDAY: "/holiday/add",
  DELETE_HOLIDAY: "/holiday/delete",
  EDIT_HOLIDAY: "/holiday/update/",
  LIST_All_HOLIDAY: "/holiday/fetchAll",
  LIST_HOLIDAY: 'holiday/detail',

  ADD_DEPARTMENT: "/department/addDepartment",
  FETCH_ALL_DEPARTMENTS: "/department/getAllDepartment",
  UPDATE_DEPERTMENT: "/department/",
  DELETE_DEPARTMENT: "/department/",

  ADD_ADVANCE_SALARY: "/salary/request",
  GET_ALL_SALARY_REQUESTS: "/salary/allRequestes",
  UPDATE_SALARY_STATUS: "/salary/updateRequest/",
  GET_SALARY_UPDATE_BY_ID: "/salary/myRequests/",

  FETCH_ALL_EMPLOYEES: "/employee/fetchAll",
  CALCULATE_SALAY_OF_EMPLOYEES: "/attendance/salaryCalculate",

  FETCH_ALL_HANDBOOK_FOR_EMPLOYEE: "/handbook/getAll",
  UPLOAD_HANDBOOK: "/handbook/upload",
  DELETE_HANDBOOK: "/handbook/delete/",
  GET_ALL_HANDBOOK: "/handbook/getAll",

  GET_EMPLOYEE_DOCUMENTS: '/employee/getDocuments/',
  UPLOAD_EMPLOYEE_DOCUMENT: '/employee/document/update/',

  GET_ALL_EMPLOYEES: '/employee/fetchAll',
  SEND_SALARY_SLIP_EMAIL: '/employee/sendSalarySlip',
  UPLOAD_SALARY_SLIP: '/employee/uploadSalarySlip/',

  ADD_EMPLOYEE_RATING: "performance/employee/",
  GET_EMPLOYEE_RATINGS: "performance/getEmployee/",

  CREATE_INVOICE: "/invoice/generateInvoice",
  GET_INVOICE_NUMBER: "/invoice/getInvoiceNumber",
  GET_ALL_INVOICES: "/invoice/getAllInvoices",

  DELETE_EMPLOYEE_ACCOUNT: "/employee/delete-account",

};
