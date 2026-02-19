import Task from '../model/TaskModel.js';


const getCurrentISTTime = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset);
};

// Convert any date to IST for storage
const convertToISTForStorage = (date) => {
  if (!date) return null;
  return new Date(new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
};

// Format date for response
const formatDateResponse = (date) => {
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
const formatDateResponse2 = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
};

// Format task response
const formatTaskResponse = (task) => {
  const taskObj = task.toObject();
  return {
    ...taskObj,
    assignedDate: formatDateResponse2(taskObj.assignedDate),
    startTime: formatDateResponse2(taskObj.startTime),
    pauseTime: formatDateResponse2(taskObj.pauseTime),
    completionTime: taskObj.completionTime,
    createdAt: formatDateResponse(taskObj.createdAt),
    updatedAt: formatDateResponse(taskObj.updatedAt),
    workSessions: taskObj.workSessions.map(session => ({
      ...session,
      startTime: formatDateResponse2(session.startTime),
      endTime: formatDateResponse2(session.endTime)
    }))
  };
};

// Add Task
export const addTask = async (req, res) => {
  try {
    const {
      employeeId,
      title,
      description,
      projectName,
      status = 'Pending',
      estimatedHours = 0,
      organizationId,
      estimatedMinutes = 0
    } = req.body;

    const currentTime = getCurrentISTTime();

    const task = new Task({
      employeeId,
      title,
      description,
      status,
      projectName,
      assignedDate: currentTime,
      startTime: status === 'In Progress' ? currentTime : null,
      estimatedHours: Number(estimatedHours) || 0,
      estimatedMinutes: Number(estimatedMinutes) || 0
    });
    if (organizationId) {
      task.organizationId = organizationId;
    }

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


// Fetch All Tasks
export const fetchAllTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date, status, startDate, endDate, organizationId } = req.query;

    let query = {
      employeeId,
      isDeleted: false
    };
    if (organizationId) {
      query.organizationId = organizationId;
    }

    if (date) {
      const queryDate = convertToISTForStorage(date);
      const startOfDay = new Date(queryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    } else if (startDate && endDate) {
      const startDateTime = convertToISTForStorage(startDate);
      const endDateTime = convertToISTForStorage(endDate);

      startDateTime.setHours(0, 0, 0, 0);
      endDateTime.setHours(23, 59, 59, 999);

      query.createdAt = {
        $gte: startDateTime,
        $lte: endDateTime
      };
    }

    if (status) {
      if (status === 'Pending') {
        query.status = { $in: ['Pending', 'Paused', 'In Progress'] };
      } else {
        query.status = status;
      }
    }

    const tasks = await Task.find(query)
      .populate('employeeId', 'name')
      .sort({ createdAt: -1 });

    if (!tasks.length) {
      return res.status(200).json({
        success: true,
        data: [],
        message: "No tasks found"
      });
    }

    res.status(200).json({
      success: true,
      data: tasks.map(task => formatTaskResponse(task)),
      total: tasks.length
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
    const { date } = req.query;

    let task = await Task.findById(id).populate('employeeId', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (date) {
      const taskDate = convertToISTForStorage(task.assignedDate).toISOString().split('T')[0];
      const queryDate = convertToISTForStorage(date).toISOString().split('T')[0];

      if (taskDate !== queryDate) {
        return res.status(404).json({
          success: false,
          message: 'Task not found for the provided date'
        });
      }
    }

    res.status(200).json({
      success: true,
      data: formatTaskResponse(task)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


//update task
export const updateTask = async (req, res) => {
  try {
    const {
      description,
      projectName,
      estimatedHours,
      estimatedMinutes,
      duration  
    } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    const updateData = { description };

    if (projectName !== undefined) {
      updateData.projectName = projectName;
    }


    if (estimatedHours !== undefined) {
      updateData.estimatedHours = Number(estimatedHours) || 0;
    }

    if (estimatedMinutes !== undefined) {
      updateData.estimatedMinutes = Number(estimatedMinutes) || 0;
    }

     if (duration !== undefined) {
      updateData.duration = Number(duration) || 0;
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      updateData,
      { new: true, runValidators: true }
    ).populate('employeeId', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: formatTaskResponse(task)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update Task Status
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const task = await Task.findOne({
      _id: id,
      isDeleted: false
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const currentTime = getCurrentISTTime();

    switch (status) {
      case 'In Progress':
        if (task.status !== 'In Progress') {
          task.startTime = currentTime;
          task.workSessions.push({ startTime: currentTime });
        }
        break;

      case 'Paused':
        if (task.status === 'In Progress') {
          const currentSession = task.workSessions[task.workSessions.length - 1];
          currentSession.endTime = currentTime;
          currentSession.duration = Math.floor((currentTime - currentSession.startTime) / 1000);
          task.pauseTime = currentTime;
          task.duration += currentSession.duration;
        }
        break;

      case 'Completed':
        if (task.status === 'In Progress') {
          const currentSession = task.workSessions[task.workSessions.length - 1];
          currentSession.endTime = currentTime;
          currentSession.duration = Math.floor((currentTime - currentSession.startTime) / 1000);
          task.duration += currentSession.duration;
        }
        task.completionTime = currentTime;
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

// Delete Task
// export const deleteTask = async (req, res) => {
//   try {
//     const task = await Task.findOneAndUpdate(
//       { _id: req.params.id, isDeleted: false },
//       { isDeleted: true },
//       { new: true }
//     );

//     if (!task) {
//       return res.status(404).json({
//         success: false,
//         message: 'Task not found'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: 'Task deleted successfully'
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted permanently'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Get Task Analytics
export const getTaskAnalytics = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required in format YYYY-MM-DD'
      });
    }

    const selectedDate = convertToISTForStorage(date);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

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

// Helper functions
const calculateAverageCompletionTime = (tasks) => {
  const completedTasks = tasks.filter(task =>
    task.status === 'Completed' && task.startTime && task.completionTime
  );

  if (completedTasks.length === 0) return 0;

  const totalCompletionTime = completedTasks.reduce((sum, task) => {
    return sum + (task.completionTime - task.startTime);
  }, 0);

  return Math.floor(totalCompletionTime / completedTasks.length / 1000);
};

const calculateDailyBreakdown = (tasks, startOfMonth, endOfMonth) => {
  const dailyStats = {};
  const currentDate = new Date(startOfMonth);

  while (currentDate <= endOfMonth) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayTasks = tasks.filter(task => {
      const taskDate = convertToISTForStorage(task.assignedDate).toISOString().split('T')[0];
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