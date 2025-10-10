import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addTask,
  getAllTasks,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../../services/services";
import { toast } from "react-toastify";

// Async Thunks
export const addTaskAsync = createAsyncThunk(
  "tasks/addTask",
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await addTask(taskData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add task");
    }
  }
);

export const fetchTasksAsync = createAsyncThunk(
  "tasks/fetchTasks",
  async ({ employeeId, date, status, startDate, endDate }, { rejectWithValue }) => {
    try {
      console.log("Fetching tasks with dates:", { startDate, endDate });
      const response = await getAllTasks(employeeId, date, status, startDate, endDate);
      console.log("Response data:", response);
      return response.data || [];
    } catch (error) {
      console.error("Error in fetchTasksAsync:", error);
      return rejectWithValue(error.response?.data || "Failed to fetch tasks");
    }
  }
);

export const fetchTasksByStatusAsync = createAsyncThunk(
  "tasks/fetchTasksByStatus",  // Changed the type to avoid conflict
  async ({ employeeId, date, status }, { rejectWithValue }) => {
    try { 
      console.log("Fetching tasks by status:", { employeeId, date, status });
      const response = await getAllTasks(employeeId, date, status);
      console.log("Response data status:", response);
      return response.data || [];
    } catch (error) {
      console.error("Error in fetchTasksByStatusAsync:", error);
      return rejectWithValue(error.response?.data || "Failed to fetch tasks");
    }
  }
);

export const updateTaskAsync = createAsyncThunk(
  "tasks/updateTask",
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await updateTask(id, taskData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update task");
    }
  }
);

export const updateTaskStatusAsync = createAsyncThunk(
  "tasks/updateTaskStatus",
  async ({ id, taskData }, { rejectWithValue }) => {
    try {
      const response = await updateTaskStatus(id, taskData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update task");
    }
  }
);

export const deleteTaskAsync = createAsyncThunk(
  "tasks/deleteTask",
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteTask(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete task");
    }
  }
);

const initialState = {
  tasks: [],
  previousTasks: [],
  loading: false,
  error: null,
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  inPausedTasks: 0,
  inProgressTasks: 0,
  statusUpdateLoading: false,
  statusUpdateError: null,
  successMessage: null,
  currentTask: null,
};

const resetCounters = (state) => {
  state.totalTasks = 0;
  state.completedTasks = 0;
  state.pendingTasks = 0;
  state.inPausedTasks = 0;
  state.inProgressTasks = 0;
};

const calculateTaskCounts = (tasks) => {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inPausedTasks: 0,
      inProgressTasks: 0,
    };
  }

  return tasks.reduce(
    (counts, task) => {
      const status = (task?.status || "").toLowerCase();
      return {
        totalTasks: counts.totalTasks + 1,
        completedTasks: counts.completedTasks + (status === "completed" ? 1 : 0),
        pendingTasks: counts.pendingTasks + (status === "pending" ? 1 : 0),
        inPausedTasks: counts.inPausedTasks + (status === "paused" ? 1 : 0),
        inProgressTasks: counts.inProgressTasks + (status === "in progress" ? 1 : 0),
      };
    },
    {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      inPausedTasks: 0,
      inProgressTasks: 0,
    }
  );
};

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
    clearTaskSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    resetTaskState: () => initialState,
    updateTaskCounts: (state) => {
      const counts = calculateTaskCounts(state.tasks);
      Object.assign(state, counts);
    },
    setPreviousTasks: (state, action) => {
      state.previousTasks = action.payload;
    },
    updatePreviousTask: (state, action) => {
      const index = state.previousTasks.findIndex(
        (task) => task._id === action.payload._id
      );
      if (index !== -1) {
        state.previousTasks[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Task
      .addCase(addTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTaskAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.task) {
          state.tasks.push(action.payload.task);
          state.previousTasks.push(action.payload.task);
          const counts = calculateTaskCounts(state.tasks);
          Object.assign(state, counts);
        }
        // toast.success("Task added successfully!");
      })
      .addCase(addTaskAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        toast.error(action.payload || "Failed to add task");
      })

      // Fetch Tasks
      .addCase(fetchTasksAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksAsync.fulfilled, (state, action) => {
        state.loading = false;
        const tasksData = Array.isArray(action.payload) ? action.payload : [];
        state.tasks = tasksData;
        state.previousTasks = [...tasksData];
        
        const counts = calculateTaskCounts(tasksData);
        Object.assign(state, counts);
      })
      .addCase(fetchTasksAsync.rejected, (state, action) => {
        state.loading = false;
        state.tasks = [];
        state.previousTasks = [];
        resetCounters(state);
        state.error = action.payload?.message || "Failed to fetch tasks";
      })


      // Fetch Tasks By Status
    .addCase(fetchTasksByStatusAsync.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(fetchTasksByStatusAsync.fulfilled, (state, action) => {
      state.loading = false;
      const tasksData = Array.isArray(action.payload) ? action.payload : [];
      // Update previousTasks if status is not for current day
      if (action.meta.arg.status === 'previous') {
        state.previousTasks = tasksData;
      } else {
        state.tasks = tasksData;
        const counts = calculateTaskCounts(tasksData);
        Object.assign(state, counts);
      }
    })
    .addCase(fetchTasksByStatusAsync.rejected, (state, action) => {
      state.loading = false;
      if (action.meta.arg.status === 'previous') {
        state.previousTasks = [];
      } else {
        state.tasks = [];
        resetCounters(state);
      }
      state.error = action.payload?.message || "Failed to fetch tasks";
    })

      // Update Task
      .addCase(updateTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateTaskAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.task) {
          // Update in current tasks
          const index = state.tasks.findIndex(
            (task) => task._id === action.payload.task._id
          );
          if (index !== -1) {
            state.tasks[index] = action.payload.task;
          }

          // Update in previous tasks
          const prevIndex = state.previousTasks.findIndex(
            (task) => task._id === action.payload.task._id
          );
          if (prevIndex !== -1) {
            state.previousTasks[prevIndex] = action.payload.task;
          }

          const counts = calculateTaskCounts(state.tasks);
          Object.assign(state, counts);
        }
        // toast.success("Task updated successfully");
      })
      .addCase(updateTaskAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update task";
        toast.error(action.payload?.message || "Failed to update task");
      })

      // Update Task Status
      .addCase(updateTaskStatusAsync.pending, (state) => {
        state.statusUpdateLoading = true;
        state.statusUpdateError = null;
      })
      .addCase(updateTaskStatusAsync.fulfilled, (state, action) => {
        state.statusUpdateLoading = false;

        if (action.payload?.task) {
          // Update in current tasks
          const index = state.tasks.findIndex(
            (task) => task._id === action.payload.task._id
          );
          if (index !== -1) {
            state.tasks[index] = {
              ...state.tasks[index],
              ...action.payload.task,
              status: action.payload.task.status,
              duration: action.payload.task.duration,
              startTime: action.payload.task.startTime,
              pauseTime: action.payload.task.pauseTime,
              completionTime: action.payload.task.completionTime,
              workSessions: action.payload.task.workSessions,
            };
          }

          // Update in previousTasks
          const previousTaskIndex = state.previousTasks.findIndex(
            (task) => task._id === action.payload.task._id
          );
          if (previousTaskIndex !== -1) {
            state.previousTasks[previousTaskIndex] = {
              ...state.previousTasks[previousTaskIndex],
              ...action.payload.task,
              status: action.payload.task.status,
              duration: action.payload.task.duration,
              startTime: action.payload.task.startTime,
              pauseTime: action.payload.task.pauseTime,
              completionTime: action.payload.task.completionTime,
              workSessions: action.payload.task.workSessions
            };
          }

          const counts = calculateTaskCounts(state.tasks);
          Object.assign(state, counts);
        }

        // toast.success("Task status updated successfully");
      })
      .addCase(updateTaskStatusAsync.rejected, (state, action) => {
        state.statusUpdateLoading = false;
        state.statusUpdateError = action.payload?.message || "Failed to update task status";
        toast.error(action.payload?.message || "Failed to update task status");
      })

      // Delete Task
      .addCase(deleteTaskAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteTaskAsync.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.id) {
          // Remove from current tasks
          state.tasks = state.tasks.filter(
            (task) => task._id !== action.payload.id
          );
          
          // Remove from previous tasks
          state.previousTasks = state.previousTasks.filter(
            (task) => task._id !== action.payload.id
          );

          const counts = calculateTaskCounts(state.tasks);
          Object.assign(state, counts);
          // toast.success("Task deleted successfully");
        }
        
        if (state.tasks.length === 0) {
          resetCounters(state);
        }
      })
      .addCase(deleteTaskAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete task";
        toast.error(action.payload?.message || "Failed to delete task");
      });
  },
});

export const {
  clearTaskError,
  clearTaskSuccessMessage,
  setCurrentTask,
  resetTaskState,
  updateTaskCounts,
  setPreviousTasks,
  updatePreviousTask,
} = taskSlice.actions;

// Selectors
export const selectTasks = (state) => state.tasks?.tasks || [];
export const selectPreviousTasks = (state) => state.tasks?.previousTasks || [];
export const selectTasksLoading = (state) => state.tasks?.loading || false;
export const selectTotalTasks = (state) => state.tasks?.totalTasks || 0;
export const selectCompletedTasks = (state) => state.tasks?.completedTasks || 0;
export const selectPendingTasks = (state) => state.tasks?.pendingTasks || 0;
export const selectInPausedTasks = (state) => state.tasks?.inPausedTasks || 0;
export const selectInProgressTasks = (state) => state.tasks?.inProgressTasks || 0;
export const selectStatusUpdateLoading = (state) => state.tasks?.statusUpdateLoading || false;
export const selectStatusUpdateError = (state) => state.tasks?.statusUpdateError;
export const selectCurrentTask = (state) => state.tasks?.currentTask;

export default taskSlice.reducer;