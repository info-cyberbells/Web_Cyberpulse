import Task from '../model/TaskModel.js';

// Create Task
// export const addTask = async (req, res) => {
//   try {
//     const { employeeId, title, status } = req.body;

//     const newTask = new Task({
//       employeeId,
//       title,
     
//       status,
//     });

//     await newTask.save();

//     res.status(201).json({ message: 'Task created successfully', task: newTask });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const convertToIST = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};
const formatToIST = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// Utility function to format response with IST dates
const formatTaskResponse = (task) => {
  const taskObj = task.toObject();
  return {
    ...taskObj,
    assignedDate: convertToIST(taskObj.assignedDate),
    startTime: convertToIST(taskObj.startTime),
    pauseTime: convertToIST(taskObj.pauseTime),
    completionTime: convertToIST(taskObj.completionTime),
    createdAt: convertToIST(taskObj.createdAt),
    updatedAt: convertToIST(taskObj.updatedAt),
    workSessions: taskObj.workSessions.map(session => ({
      ...session,
      startTime: convertToIST(session.startTime),
      endTime: convertToIST(session.endTime)
    }))
  };
};

export const addTask = async (req, res) => {
  try {
    const {
      employeeId,
      title,
      description,
      status = 'Pending'
    } = req.body;

    // Set current time in IST
    const istTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const assignedDate = new Date(istTime);

    const task = new Task({
      employeeId,
      title,
      description,
      status,
      assignedDate,
      startTime: status === 'In Progress' ? assignedDate : null
    });

    await task.save();
    
    const populatedTask = await Task.findById(task._id)
      .populate('employeeId', 'name');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: formatTaskResponse(populatedTask)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// Get All Tasks
// export const fetchAllTasks = async (req, res) => {
//   try {
//     const { employeeId } = req.params; // Extract employeeId from route parameters
//     const { date } = req.query; // Extract date from query parameters

//     let query = { employeeId }; // Base query to filter tasks by employeeId

//     // If a date is provided, add a match for the createdAt date
//     if (date) {
//       query = {
//         ...query,
//         $expr: {
//           $eq: [
//             { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//             date,
//           ],
//         },
//       };
//     }

//     const tasks = await Task.find(query).populate('employeeId', 'name'); // Fetch tasks matching the query

//     if (!tasks || tasks.length === 0) {
//       return res.status(404).json({ message: 'No tasks found' });
//     }

//     res.status(200).json({ tasks });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


export const fetchAllTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { 
      date,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    let query = { 
      employeeId,
      isDeleted: false
    };

    // Date filtering in IST
    if (date) {
      const istDate = new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const startOfDay = new Date(istDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(istDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    } else if (startDate && endDate) {
      const istStartDate = new Date(startDate).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istEndDate = new Date(endDate).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      
      query.createdAt = {
        $gte: new Date(istStartDate),
        $lte: new Date(istEndDate)
      };
    }

    if (status) {
      query.status = status;
    }
    console.log(query)

    const tasks = await Task.find(query)
      .populate('employeeId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    if (!tasks.length) {
      return res.status(404).json({
        success: false,
        message: 'No tasks found'
      });
    }

    res.status(200).json({
      success: true,
      data: tasks.map(task => formatTaskResponse(task)),
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get Task by ID
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query; // Extract the date from query parameters

    let task = await Task.findById(id).populate('employeeId', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If a date is provided, ensure it matches the task's date
    if (date) {
      const taskDate = task.date.toISOString().split('T')[0]; // Assuming task.date is a Date object
      if (taskDate !== date) {
        return res.status(404).json({ message: 'Task not found for the provided date' });
      }
    }

    res.status(200).json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update Task
// export const updateTask = async (req, res) => {
//   try {
//     const { title, status, completedDate } = req.body;

//     const updatedTask = await Task.findByIdAndUpdate(
//       req.params.id,
//       {
//         title,
//         status,
//         completedDate,
 
//       },
//       { new: true, runValidators: true }
//     );

//     if (!updatedTask) {
//       return res.status(404).json({ message: 'Task not found' });
//     }

//     res.status(200).json({ message: 'Task updated successfully', task: updatedTask });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
export const updateTask = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { description },
      { new: true, runValidators: true }
    ).populate('employeeId', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Clean and format the response
    const cleanWorkSessions = task.workSessions.map(session => ({
      _id: session._id,
      startTime: convertToIST(session.startTime),
      endTime: convertToIST(session.endTime),
      duration: session.duration
    }));

    const formattedResponse = {
      success: true,
      message: 'Task updated successfully',
      data: {
        _id: task._id,
        employeeId: {
          _id: task.employeeId._id,
          name: task.employeeId.name
        },
        description: task.description,
        status: task.status,
        startTime: convertToIST(task.startTime),
        pauseTime: convertToIST(task.pauseTime),
        completionTime: convertToIST(task.completionTime),
        duration: task.duration,
        assignedDate: convertToIST(task.assignedDate),
        workSessions: cleanWorkSessions,
        isDeleted: task.isDeleted,
        createdAt: convertToIST(task.createdAt),
        updatedAt: convertToIST(task.updatedAt)
      }
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// export const updateTaskStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     const task = await Task.findOne({
//       _id: id,
//       isDeleted: false
//     });

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     const now = new Date();

//     // Handle status transitions and time tracking
//     switch (status) {
//       case 'In Progress':
//         if (task.status !== 'In Progress') {
//           task.startTime = now;
//           task.workSessions.push({ startTime: now });
//         }
//         break;

//       case 'Paused':
//         if (task.status === 'In Progress') {
//           const currentSession = task.workSessions[task.workSessions.length - 1];
//           currentSession.endTime = now;
//           currentSession.duration = Math.floor((now - currentSession.startTime) / 1000);
//           task.pauseTime = now;
//           task.duration += currentSession.duration;
//         }
//         break;

//       case 'Completed':
//         if (task.status === 'In Progress') {
//           const currentSession = task.workSessions[task.workSessions.length - 1];
//           currentSession.endTime = now;
//           currentSession.duration = Math.floor((now - currentSession.startTime) / 1000);
//           task.duration += currentSession.duration;
//         }
//         task.completionTime = now;
//         break;
//     }

//     task.status = status;
//     await task.save();

//     res.status(200).json({
//       success: true,
//       message: 'Task status updated successfully',
//       data: task
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
// Delete Task

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    // console.log("status", status)
    const task = await Task.findOne({
      _id: id,
      isDeleted: false
    });
    // console.log("Task", task)
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Get current time in IST
    const istTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
    const now = new Date(istTime);

    // Handle status transitions and time tracking
    switch (status) {
      case 'In Progress':
        if (task.status !== 'In Progress') {
          task.startTime = now;
          task.workSessions.push({ startTime: now });
        }
        break;

      case 'Paused':
        if (task.status === 'In Progress') {
          const currentSession = task.workSessions[task.workSessions.length - 1];
          currentSession.endTime = now;
          currentSession.duration = Math.floor((now - currentSession.startTime) / 1000);
          task.pauseTime = now;
          task.duration += currentSession.duration;
        }
        break;

      case 'Completed':
        if (task.status === 'In Progress') {
          const currentSession = task.workSessions[task.workSessions.length - 1];
          currentSession.endTime = now;
          currentSession.duration = Math.floor((now - currentSession.startTime) / 1000);
          task.duration += currentSession.duration;
        }
        task.completionTime = now;
        break;
    }

    task.status = status;
    await task.save();

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: formatTaskResponse(task)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTaskAnalytics = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query; // Expect date in format 'YYYY-MM-DD'

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required in format YYYY-MM-DD'
      });
    }

    // Extract month and year from the date
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1; // getMonth() returns 0-11

    // Create date range for the month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    // Convert to IST and set time to start and end of day
    startOfMonth.setHours(0, 0, 0, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const query = {
      employeeId,
      isDeleted: false,
      assignedDate: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    };

    const tasks = await Task.find(query);

    // Calculate analytics for the month
    const monthlyAnalytics = {
      month: startOfMonth.toLocaleString('en-US', { 
        month: 'long', 
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
      }),
      totalTasks: tasks.length,
      tasksByStatus: {
        completed: tasks.filter(t => t.status === 'Completed').length,
        inProgress: tasks.filter(t => t.status === 'In Progress').length,
        pending: tasks.filter(t => t.status === 'Pending').length,
        paused: tasks.filter(t => t.status === 'Paused').length
      },
      durations: {
        totalWorkDuration: tasks.reduce((sum, task) => sum + (task.duration || 0), 0),
        averageTaskDuration: tasks.length > 0
          ? Math.floor(tasks.reduce((sum, task) => sum + (task.duration || 0), 0) / tasks.length)
          : 0
      },
      performance: {
        completionRate: tasks.length > 0
          ? (tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100
          : 0,
        tasksStarted: tasks.filter(t => t.startTime).length,
        averageCompletionTime: calculateAverageCompletionTime(tasks),
        totalWorkSessions: tasks.reduce((sum, task) => sum + (task.workSessions?.length || 0), 0)
      },
      dailyBreakdown: calculateDailyBreakdown(tasks, startOfMonth, endOfMonth)
    };

    res.status(200).json({
      success: true,
      data: monthlyAnalytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper functions remain the same
const calculateAverageCompletionTime = (tasks) => {
  const completedTasks = tasks.filter(task => 
    task.status === 'Completed' && task.startTime && task.completionTime
  );

  if (completedTasks.length === 0) return 0;

  const totalCompletionTime = completedTasks.reduce((sum, task) => {
    const startTime = new Date(task.startTime).getTime();
    const completionTime = new Date(task.completionTime).getTime();
    return sum + (completionTime - startTime);
  }, 0);

  return Math.floor(totalCompletionTime / completedTasks.length / 1000);
};

const calculateDailyBreakdown = (tasks, startOfMonth, endOfMonth) => {
  const dailyStats = {};
  const currentDate = new Date(startOfMonth);

  while (currentDate <= endOfMonth) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.assignedDate).toISOString().split('T')[0];
      return taskDate === dateStr;
    });

    dailyStats[dateStr] = {
      totalTasks: dayTasks.length,
      completed: dayTasks.filter(t => t.status === 'Completed').length,
      inProgress: dayTasks.filter(t => t.status === 'In Progress').length,
      duration: dayTasks.reduce((sum, task) => sum + (task.duration || 0), 0)
    };

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dailyStats;
};