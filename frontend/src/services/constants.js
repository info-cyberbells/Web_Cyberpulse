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
  CHECK_WFH_ELIGIBILITY: "/leave/wfh-eligibility/",
  CHECK_BIRTHDAY_ELIGIBILITY: "/leave/birthday-eligibility/",

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

  PAUSE_ALL_TASKS: "/task/pauseAll/",
  LIST_All_TASK: "/task/fetchAll",
  LIST_TASK: 'task/detail',
  FETCH_TASKS_BY_PROJECT: "/task/fetchByProject",
  DETAIL_PROJECT: "/projects/detail/",

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

  EVALUATE_WFH_CREDIT: "/wfh-credit/evaluate",
  GET_ALL_WFH_CREDITS: "/wfh-credit/all",
  GET_MY_WFH_CREDITS: "/wfh-credit/my-credits",
  GET_EMPLOYEE_WFH_CREDITS: "/wfh-credit/employee/",

  SEND_CREDIT_UPDATE_REQUEST: "/wfh-credit/request-update",
  GET_ALL_CREDIT_UPDATE_REQUESTS: "/wfh-credit/update-requests",
  GET_MY_CREDIT_UPDATE_REQUESTS: "/wfh-credit/my-update-requests",
  UPDATE_CREDIT_UPDATE_REQUEST: "/wfh-credit/update-request/",

  GET_NOTIFICATIONS: "/notifications",
  GET_UNREAD_COUNT: "/notifications/unread-count",
  MARK_NOTIFICATION_READ: "/notifications/",
  MARK_ALL_NOTIFICATIONS_READ: "/notifications/mark-all-read",
  GET_NOTIFICATION_SETTINGS: "/notifications/settings",
  UPDATE_NOTIFICATION_SETTINGS: "/notifications/settings",

  GET_ORG_SETTINGS: "/org-settings/",
  UPDATE_ORG_SETTINGS: "/org-settings/",

  GET_USER_NOTIF_PREFERENCES: "/notification-preferences",
  UPDATE_USER_NOTIF_PREFERENCES: "/notification-preferences",
  REGISTER_FCM_TOKEN: "/fcm-token",
  REMOVE_FCM_TOKEN: "/fcm-token",
  REMOVE_ALL_FCM_TOKENS: "/fcm-token/all",

  GET_ADMIN_PROFILE: "/admin-profile/get-profile",
  UPDATE_ADMIN_PROFILE: "/admin-profile/me",
  UPDATE_ORG_DETAILS: "/admin-profile/organization",
};
