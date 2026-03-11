import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addProject, deleteProject, editProject, listProjects, getProjectDetail, fetchTasksByProject } from '../../services/services';

// Async Thunks for API calls

// Fetch all projects
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await listProjects();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Add a new project
export const createProject = createAsyncThunk(
  'projects/addProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await addProject(projectData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Edit an existing project
export const updateProject = createAsyncThunk(
  'projects/editProject',
  async ({ projectId, updatedData }, { rejectWithValue }) => {
    console.log({ projectId, updatedData })
    try {
      const response = await editProject(projectId, updatedData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Delete a project
export const removeProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await deleteProject(projectId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Fetch single project detail
export const fetchProjectDetail = createAsyncThunk(
  'projects/fetchProjectDetail',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await getProjectDetail(projectId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch tasks for a project
export const fetchProjectTasks = createAsyncThunk(
  'projects/fetchProjectTasks',
  async (projectName, { rejectWithValue }) => {
    try {
      const response = await fetchTasksByProject(projectName);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Initial state
const initialState = {
  projects: [],
  currentProject: null,
  projectTasks: null,
  loading: false,
  detailLoading: false,
  error: null,
  successMessage: null,
};

// Project slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.projectTasks = null;
    },
  },
  extraReducers: (builder) => {
    // Handle fetchProjects lifecycle
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle createProject lifecycle
    builder
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.push(action.payload.data); // Add the new project to the state
        state.successMessage = 'Project created successfully';

      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle updateProject lifecycle
    builder
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.projects.findIndex((proj) => proj._id === action.payload.data._id);
        if (index !== -1) {
          state.projects[index] = action.payload.data; // Update the project
        }
        state.successMessage = 'Project updated successfully';
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle removeProject lifecycle
    builder
      .addCase(removeProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((proj) => proj.id !== action.meta.arg); // Remove the deleted project
        state.successMessage = 'Project deleted successfully';
      })
      .addCase(removeProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Handle fetchProjectDetail
    builder
      .addCase(fetchProjectDetail.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectDetail.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectDetail.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });

    // Handle fetchProjectTasks
    builder
      .addCase(fetchProjectTasks.pending, (state) => {
        state.detailLoading = true;
      })
      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.projectTasks = action.payload;
      })
      .addCase(fetchProjectTasks.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      });
  },
});
export const { clearSuccessMessage, clearError, clearCurrentProject } = projectSlice.actions;
export const selectProjects = (state) => state.projects.projects;
export const selectProjectsLoading = (state) => state.projects.loading;
export const selectProjectsError = (state) => state.projects.error;
export default projectSlice.reducer;
