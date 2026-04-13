import apiClient from "./api";
import { API_ROUTES } from "./constants";
import { format } from 'date-fns';
import { getOrganizationId, getUserDepartment } from './globalOrg';

console.log("Org ID is:", getOrganizationId());
console.log("Org Logged in Dept is:", getUserDepartment());
// Login service
export const login = async (credentials) => {
  try {
    const response = await apiClient.post(API_ROUTES.LOGIN, credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Register service
export const register = async (registrationData) => {
  try {
    const response = await apiClient.post(API_ROUTES.REGISTER_ORG_ADMIN, registrationData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// Add Project Service
export const addProject = async (projectData) => {
  try {
    const orgId = getOrganizationId();
    const projectDataWithOrg = {
      ...projectData,
      ...(orgId ? { organizationId: orgId } : {}),
    };
    console.log("Sending project data:", projectDataWithOrg);

    const response = await apiClient.post(API_ROUTES.ADD_PROJECT, projectDataWithOrg);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete Project Service
export const deleteProject = async (projectId) => {
  try {
    const response = await apiClient.delete(
      `${API_ROUTES.DELETE_PROJECT}${projectId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Edit Project Service
export const editProject = async (projectId, updatedData) => {
  console.log(`${API_ROUTES.EDIT_PROJECT}${projectId}`);
  try {
    const response = await apiClient.patch(
      `${API_ROUTES.EDIT_PROJECT}${projectId}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// List Projects Service
export const listProjects = async () => {
  try {
    const orgId = getOrganizationId();
    const queryParams = orgId ? { organizationId: orgId } : {};
    console.log("Fetching projects with query:", queryParams);

    const response = await apiClient.get(API_ROUTES.LIST_PROJECTS, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getProjectDetail = async (projectId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.DETAIL_PROJECT}${projectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchTasksByProject = async (projectName) => {
  try {
    const organizationId = getOrganizationId();
    const response = await apiClient.get(API_ROUTES.FETCH_TASKS_BY_PROJECT, {
      params: {
        projectName,
        ...(organizationId && { organizationId }),
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add employee service
export const addEmployee = async (employeeData) => {
  const organizationId = getOrganizationId();

  if (organizationId) {
    employeeData.organizationId = organizationId;
  }

  console.log("Final employee data being sent:", employeeData);

  try {
    const response = await apiClient.post(
      API_ROUTES.ADD_EMPLOYEE,
      employeeData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get employee list service
export const getEmployeeList = async () => {
  try {
    const organizationId = getOrganizationId();
    const department = getUserDepartment();
    const params = {};
    if (organizationId) params.organizationId = organizationId;
    if (department) params.department = department;

    const response = await apiClient.get(API_ROUTES.EMPLOYEE_LIST, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Service to edit an employee
export const editEmployee = async (id, employeeData) => {
  try {
    const response = await apiClient.patch(
      `${API_ROUTES.EDIT_EMPLOYEE}${id}`,
      employeeData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateEmployeeStatus = async (employeeId, statusData) => {
  try {
    const response = await apiClient.patch(`${API_ROUTES.UPDATE_EMPLOYEE_STATUS}${employeeId}`, statusData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Service to delete an employee
export const deleteEmployee = async (id) => {
  try {
    const response = await apiClient.delete(
      `${API_ROUTES.DELETE_EMPLOYEE}/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Service to add a new technology
export const addTechnology = async (technologyData) => {
  try {
    const organizationId = getOrganizationId();
    const response = await apiClient.post(API_ROUTES.ADD_TECHNOLOGY, {
      ...technologyData,
      ...(organizationId && { organizationId }),
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Change Password Service
export const changePasswordService = async (id, passwordData) => {
  try {
    // console.log("id", id, "passwordData", passwordData)
    const response = await apiClient.patch(
      `${API_ROUTES.CHANGE_PASSWORD}${id}`,
      passwordData
    );
    // console.log("responseData", response.data)
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Service to fetch the list of technologies
export const getTechnologyList = async () => {
  try {
    const organizationId = getOrganizationId();
    const response = await apiClient.get(API_ROUTES.LIST_TECHNOLOGIES, {
      params: organizationId ? { organizationId } : {},
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete Technology Service
export const deleteTechnology = async (id) => {
  try {
    const response = await apiClient.delete(
      `${API_ROUTES.DELETE_TECHNOLOGY}/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Edit Technology Service
export const editTechnology = async (id, updatedData) => {
  try {
    const response = await apiClient.patch(
      `${API_ROUTES.EDIT_TECHNOLOGY}${id}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Service to fetch the status list
export const getStatusList = async () => {
  try {
    const response = await apiClient.get(API_ROUTES.STATUS_LIST);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add Leave Service
export const addLeave = async (leaveData) => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.post(API_ROUTES.ADD_LEAVE, {
      ...leaveData,
      ...(organizationId && { organizationId }),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Leave List Service

export const getLeaveList = async () => {
  try {
    const organizationId = getOrganizationId();
    const department = getUserDepartment();

    const params = {};
    if (organizationId) params.organizationId = organizationId;
    if (department) params.department = department;

    const response = await apiClient.get(API_ROUTES.LIST_All_LEAVE, { params });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Edit Leave Service
export const editLeave = async (id, leaveData) => {
  try {
    const response = await apiClient.patch(
      `${API_ROUTES.EDIT_LEAVE}${id}`,
      leaveData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete Leave Service
export const deleteLeave = async (id) => {
  try {
    const response = await apiClient.delete(
      `${API_ROUTES.DELETE_LEAVE}/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLeaveById = async (employeeId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.LIST_LEAVE}/${employeeId}`);
    console.log(response)
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check WFH eligibility
export const checkWfhEligibility = async (employeeId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.CHECK_WFH_ELIGIBILITY}${employeeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const checkBirthdayLeaveEligibility = async (employeeId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.CHECK_BIRTHDAY_ELIGIBILITY}${employeeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Send credit update request
export const sendCreditUpdateRequest = async (data) => {
  try {
    const response = await apiClient.post(API_ROUTES.SEND_CREDIT_UPDATE_REQUEST, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all credit update requests (for TL/HR/Manager)
export const getAllCreditUpdateRequests = async (organizationId, status) => {
  try {
    const params = {};
    if (organizationId) params.organizationId = organizationId;
    if (status) params.status = status;
    const response = await apiClient.get(API_ROUTES.GET_ALL_CREDIT_UPDATE_REQUESTS, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get my credit update requests
export const getMyCreditUpdateRequests = async () => {
  try {
    const response = await apiClient.get(API_ROUTES.GET_MY_CREDIT_UPDATE_REQUESTS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update credit update request status
export const updateCreditUpdateRequestStatus = async (id, status) => {
  try {
    const response = await apiClient.put(`${API_ROUTES.UPDATE_CREDIT_UPDATE_REQUEST}${id}`, { status });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Notifications
export const getNotifications = async (page = 1, limit = 50) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.GET_NOTIFICATIONS}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await apiClient.get(API_ROUTES.GET_UNREAD_COUNT);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await apiClient.patch(`${API_ROUTES.MARK_NOTIFICATION_READ}${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.patch(API_ROUTES.MARK_ALL_NOTIFICATIONS_READ);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNotificationSettings = async () => {
  try {
    const response = await apiClient.get(API_ROUTES.GET_NOTIFICATION_SETTINGS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateNotificationSettings = async (settings) => {
  try {
    const response = await apiClient.put(API_ROUTES.UPDATE_NOTIFICATION_SETTINGS, settings);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// User Notification Preferences
export const getUserNotificationPreferences = async () => {
  try {
    const response = await apiClient.get(API_ROUTES.GET_USER_NOTIF_PREFERENCES);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserNotificationPreferences = async (data) => {
  try {
    const response = await apiClient.put(API_ROUTES.UPDATE_USER_NOTIF_PREFERENCES, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// FCM Token Management
export const registerFcmToken = async (data) => {
  try {
    const response = await apiClient.post(API_ROUTES.REGISTER_FCM_TOKEN, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFcmToken = async (data) => {
  try {
    const response = await apiClient.delete(API_ROUTES.REMOVE_FCM_TOKEN, { data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeAllFcmTokens = async () => {
  try {
    const response = await apiClient.delete(API_ROUTES.REMOVE_ALL_FCM_TOKENS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add Event Service
export const addEvent = async (eventData) => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.post(API_ROUTES.ADD_EVENT, {
      ...eventData,
      ...(organizationId && { organizationId }),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get All Events List Service
export const getAllEvents = async () => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.get(API_ROUTES.LIST_All_EVENT, {
      params: organizationId ? { organizationId } : {},
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Event Details Service
export const getEventDetails = async (eventId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.LIST_EVENT}/${eventId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Edit Event Service
export const editEvent = async (id, eventData) => {
  try {
    const response = await apiClient.patch(
      `${API_ROUTES.EDIT_EVENT}${id}`,
      eventData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete Event Service
export const deleteEvent = async (id) => {
  try {
    const response = await apiClient.delete(
      `${API_ROUTES.DELETE_EVENT}/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

//upcomming annoucment
export const getUpcomingAnnouncements = async () => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.get(API_ROUTES.UPCOMING_ANNOUCMENT, {
      params: organizationId ? { organizationId } : {}
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add Annoucement Service
export const addAnnoucement = async (eventData) => {
  try {
    const orgId = getOrganizationId();
    const eventDataWithOrg = {
      ...eventData,
      ...(orgId ? { organizationId: orgId } : {}),
    };
    console.log("Sending announcement data:", eventDataWithOrg);

    const response = await apiClient.post(API_ROUTES.ADD_Annoucement, eventDataWithOrg);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get All Events List Service
export const getAllAnnoucement = async () => {
  try {
    const orgId = getOrganizationId();
    const queryParams = orgId ? { organizationId: orgId } : {};
    console.log("Fetching announcements with query:", queryParams);
    const response = await apiClient.get(API_ROUTES.LIST_All_Annoucement, {
      params: queryParams,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Event Details Service
export const getAnnoucementDetails = async (eventId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.LIST_Annoucement}/${eventId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Edit Event Service
export const editAnnoucement = async (id, eventData) => {
  try {
    const response = await apiClient.patch(
      `${API_ROUTES.EDIT_Annoucement}${id}`,
      eventData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete Event Service
export const deleteAnnoucement = async (id) => {
  try {
    const response = await apiClient.delete(
      `${API_ROUTES.DELETE_Annoucement}/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add Annoucement Service
export const addAttendance = async (eventData) => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.post(API_ROUTES.ADD_Attendance, {
      ...eventData,
      ...(organizationId && { organizationId })
    });

    return response.data;
  } catch (error) {
    console.log("ERROR", error);
    throw error;
  }
};

// Get All Events List Service
export const getAllAttendance = async () => {
  try {
    const response = await apiClient.get(API_ROUTES.LIST_All_Attendance);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Event Details Service
export const getAttendanceDetails = async (eventId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.LIST_Attendance}/${eventId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAttendanceDetailAPI = async (Id, date) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.LIST_Attendance}/${Id}`, {
      params: {
        date: date
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Edit Event Service
export const editAttendance = async (id, eventData) => {
  try {
    const response = await apiClient.patch(
      `${API_ROUTES.EDIT_Attendance}${id}`,
      eventData
    );
    return response.data;
  } catch (error) {
    console.log("ERROR", error)
    throw error;
  }
};

// Delete Event Service
export const deleteAttendance = async (id) => {
  try {
    const response = await apiClient.delete(
      `${API_ROUTES.DELETE_Attendance}/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

//get attendence
export const getAttendanceMonthlySummary = async (employeeId, date) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.Count_Attendance}`, {
      params: {
        employeeId,
        date
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};



export const getCurrentEmpAttendance = async (date) => {
  try {
    const params = { date };

    const orgId = getOrganizationId();
    if (orgId) {
      params.organizationId = orgId;
    }
    const department = getUserDepartment();
    if (department) {
      params.department = department;
    }
    const response = await apiClient.get(API_ROUTES.CURRENT_EMP_LOGIN, { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || "Failed to fetch current employee attendance";
  }
};


//autoclockout employees
export const getPreviousDayAutoClockout = async () => {
  try {
    const orgId = getOrganizationId();
    const params = {};
    if (orgId) {
      params.organizationId = orgId;
    }
    const department = getUserDepartment();
    if (department) {
      params.department = department;
    }
    const response = await apiClient.get(API_ROUTES.PREVIOUS_DAY_AUTO_CLOCKOUT, {
      params,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

//get monthly atendance
export const getMonthlyAttendance = async (year, month) => {
  try {
    const organizationId = getOrganizationId();
    const department = getUserDepartment();

    const response = await apiClient.get(API_ROUTES.MONTHLY_ATTENDANCE, {
      params: {
        year,
        month,
        ...(organizationId && { organizationId }),
        ...(department && { department }),
      },
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};



//add task
export const addTask = async (taskData) => {
  try {
    const organizationId = getOrganizationId();
    const payload = organizationId
      ? { ...taskData, organizationId }
      : taskData;

    const response = await apiClient.post(API_ROUTES.ADD_TASK, payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//get all tasks
export const getAllTasks = async (employeeId, date, status, startDate, endDate) => {
  try {
    const organizationId = getOrganizationId();
    const response = await apiClient.get(`${API_ROUTES.LIST_All_TASK}/${employeeId}`, {
      params: {
        date,
        status,
        startDate,
        endDate,
        ...(organizationId && { organizationId })
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// export const getAllTasks = async (employeeId, date) => {
//   try {
//     const response = await apiClient.get(`${API_ROUTES.LIST_All_TASK}/${employeeId}`, {
//       params: { date }
//     });
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

//get task by id
export const getTaskById = async (taskId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.LIST_TASK}/${taskId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


//update task
export const updateTask = async (id, taskData) => {
  try {
    const response = await apiClient.patch(`${API_ROUTES.EDIT_TASK}${id}`, taskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTaskStatus = async (id, taskData) => {
  try {
    const response = await apiClient.patch(`${API_ROUTES.STATUS_TASK}${id}`, taskData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const pauseAllRunningTasks = async (employeeId) => {
  try {
    const response = await apiClient.patch(`${API_ROUTES.PAUSE_ALL_TASKS}${employeeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTask = async (id) => {
  try {
    const response = await apiClient.delete(`${API_ROUTES.DELETE_TASK}/${id}`);
    return { id, ...response.data };
  } catch (error) {
    throw error;
  }
};

export const getAttendanceTasks = async (date, employeeId) => {
  try {
    const response = await apiClient.get(API_ROUTES.ATTENDANCE_TASKS, {
      params: {
        date,
        employeeId
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


//help desk
export const addHelpdesk = async (data) => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.post(API_ROUTES.ADD_HELPDESK, {
      ...data,
      ...(organizationId && { organizationId }),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

//update help desk status
export const updateHelpdeskTicketStatus = async (ticketId, statusData) => {
  try {
    const response = await apiClient.patch(`${API_ROUTES.UPDATE_TICKET_STATUS}${ticketId}`, statusData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//help desk ticket per user
export const getUserTickets = async (employeeId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.GET_USER_TICKETS}`, {
      params: { employeeId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//get all help desk tickets
export const getAllHelpdeskTickets = async () => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.get(API_ROUTES.LIST_ALL_HELPDESK, {
      params: organizationId ? { organizationId } : {},
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};


//Add Holidays
export const addHoliday = async (holidayData) => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.post(API_ROUTES.ADD_HOLIDAY, {
      ...holidayData,
      ...(organizationId && { organizationId }),
    });

    console.log("ADD HOLIDAYS", response);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get All HOlidays Service
export const getAllHolidays = async () => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.get(API_ROUTES.LIST_All_HOLIDAY, {
      params: organizationId ? { organizationId } : {},
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get HOliday Details Service
export const getHolidayDetails = async (eventId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.LIST_HOLIDAY}/${eventId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Edit Holiday Service
export const editHoliday = async (id, eventData) => {
  try {
    const response = await apiClient.patch(
      `${API_ROUTES.EDIT_HOLIDAY}${id}`,
      eventData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete Holiday Service
export const deleteHoliday = async (id) => {
  try {
    const response = await apiClient.delete(
      `${API_ROUTES.DELETE_HOLIDAY}/${id}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


//add department
export const addDepartment = async (departmentData) => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.post(API_ROUTES.ADD_DEPARTMENT, {
      ...departmentData,
      ...(organizationId && { organizationId }),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

//fetchall department
export const getAllDepartments = async () => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.get(API_ROUTES.FETCH_ALL_DEPARTMENTS, {
      params: organizationId ? { organizationId } : {},
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

//UPDATE DEPARTMENT
export const updateDepartment = async (departmentId, departmentData) => {
  try {
    const response = await apiClient.put(`${API_ROUTES.UPDATE_DEPERTMENT}${departmentId}`, departmentData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//delete department
export const deleteDepartment = async (departmentId) => {
  try {
    const response = await apiClient.delete(`${API_ROUTES.DELETE_DEPARTMENT}${departmentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


//add advance salary
export const createAdvanceSalaryRequest = async (requestData) => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.post(API_ROUTES.ADD_ADVANCE_SALARY, {
      ...requestData,
      ...(organizationId && { organizationId }),
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

//get advance salary requests
export const getAllAdvanceSalaryRequests = async () => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.get(API_ROUTES.GET_ALL_SALARY_REQUESTS, {
      params: organizationId ? { organizationId } : {},
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

//update salary requests
export const updateAdvanceSalaryRequest = async (requestId, updateData) => {
  try {
    const response = await apiClient.put(`${API_ROUTES.UPDATE_SALARY_STATUS}${requestId}`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//get advance salary request by id
export const getMyAdvanceSalaryRequests = async (employeeId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.GET_SALARY_UPDATE_BY_ID}${employeeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//fetch all employees for salary calculate
export const fetchAllEmployees = async () => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.get(API_ROUTES.FETCH_ALL_EMPLOYEES, {
      params: organizationId ? { organizationId } : {},
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//calculate salary of employee
export const calculateSalary = async (salaryData) => {
  try {
    const response = await apiClient.post(API_ROUTES.CALCULATE_SALAY_OF_EMPLOYEES, salaryData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


//fetch all handbooks
export const getAllHandbooks = async (employeeId) => {
  try {
    const response = await apiClient.get(API_ROUTES.FETCH_ALL_HANDBOOK_FOR_EMPLOYEE, {
      params: { employeeId }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//upload handbook
export const uploadHandbook = async (formData) => {
  try {
    const organizationId = getOrganizationId();
    if (organizationId) {
      formData.append('organizationId', organizationId);
    }

    const response = await apiClient.post(API_ROUTES.UPLOAD_HANDBOOK, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//delete handbook
export const deleteHandbook = async (handbookId) => {
  try {
    const response = await apiClient.delete(`${API_ROUTES.DELETE_HANDBOOK}${handbookId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//get All handbook to admin
export const getAllHandbooksAdmin = async () => {
  try {
    const organizationId = getOrganizationId();
    const response = await apiClient.get(API_ROUTES.GET_ALL_HANDBOOK, {
      params: organizationId ? { organizationId } : {},
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

//get employee atendnece by month
export const getEmployeeDetails = async (monthDate, employeeId) => {
  try {
    const formattedDate = format(monthDate, "yyyy-MM-dd");
    const response = await apiClient.get(`${API_ROUTES.GET_EMPLOYEE_ATTENDANCE_PER_MONTH}?date=${formattedDate}&employeeId=${employeeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


//get employees documents
export const getEmployeeDocuments = async (employeeId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.GET_EMPLOYEE_DOCUMENTS}${employeeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//uploads employee documents
export const uploadEmployeeDocument = async (employeeId, formData) => {
  try {
    const response = await apiClient.patch(`${API_ROUTES.UPLOAD_EMPLOYEE_DOCUMENT}${employeeId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


//get all employees
export const getAllEmployees = async () => {
  try {
    const response = await apiClient.get(API_ROUTES.GET_ALL_EMPLOYEES);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//sent salary slip to mail
export const sendSalarySlipEmail = async (emailData) => {
  try {
    const response = await apiClient.post(API_ROUTES.SEND_SALARY_SLIP_EMAIL, emailData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//update salary slip
export const uploadSalarySlip = async (employeeId, formData) => {
  try {
    const response = await apiClient.patch(`${API_ROUTES.UPLOAD_SALARY_SLIP}${employeeId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};


//performance analysis
export const addEmployeeRating = async (employeeId, ratingData) => {
  try {
    const response = await apiClient.post(`${API_ROUTES.ADD_EMPLOYEE_RATING}${employeeId}`, ratingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//fetch performance analysis of employee
export const fetchEmployeeRatings = async (employeeId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.GET_EMPLOYEE_RATINGS}${employeeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

//invoice generator
export const createInvoice = async (invoiceData) => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.post(API_ROUTES.CREATE_INVOICE, {
      ...invoiceData,
      ...(organizationId && { organizationId })
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

//get innvoice number
export const getInvoiceNumber = async () => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.get(API_ROUTES.GET_INVOICE_NUMBER, {
      params: organizationId ? { organizationId } : {}
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllInvoices = async () => {
  try {
    const organizationId = getOrganizationId();

    const response = await apiClient.get(API_ROUTES.GET_ALL_INVOICES, {
      params: organizationId ? { organizationId } : {}
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

// WFH Credit Services
export const evaluateWfhCredit = async (creditData) => {
  try {
    const response = await apiClient.post(API_ROUTES.EVALUATE_WFH_CREDIT, creditData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllWfhCredits = async (month, year) => {
  try {
    const organizationId = getOrganizationId();
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    if (organizationId) params.organizationId = organizationId;

    const response = await apiClient.get(API_ROUTES.GET_ALL_WFH_CREDITS, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getMyWfhCredits = async () => {
  try {
    const response = await apiClient.get(API_ROUTES.GET_MY_WFH_CREDITS);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getEmployeeWfhCredits = async (employeeId, month, year) => {
  try {
    const params = {};
    if (month) params.month = month;
    if (year) params.year = year;
    const response = await apiClient.get(`${API_ROUTES.GET_EMPLOYEE_WFH_CREDITS}${employeeId}`, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Organization Settings
export const getOrgSettings = async (orgId) => {
  try {
    const response = await apiClient.get(`${API_ROUTES.GET_ORG_SETTINGS}${orgId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrgSettings = async (orgId, data) => {
  try {
    const response = await apiClient.put(`${API_ROUTES.UPDATE_ORG_SETTINGS}${orgId}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Admin Profile Services
export const getAdminProfile = async () => {
  try {
    const response = await apiClient.get(API_ROUTES.GET_ADMIN_PROFILE);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAdminProfile = async (profileData) => {
  try {
    const response = await apiClient.put(API_ROUTES.UPDATE_ADMIN_PROFILE, profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateOrgDetails = async (orgData) => {
  try {
    const response = await apiClient.put(API_ROUTES.UPDATE_ORG_DETAILS, orgData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteMyAccount = async (employeeId) => {
  try {
    const response = await apiClient.post(
      API_ROUTES.DELETE_EMPLOYEE_ACCOUNT,
      {
        data: { employeeId },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
