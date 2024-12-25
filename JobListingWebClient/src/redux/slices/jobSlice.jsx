import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jobAPI } from '../../services/JobAPI';

// Async thunks
export const fetchJobLevels = createAsyncThunk(
  'job/fetchJobLevels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jobAPI.fetchJobLevels();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải danh sách cấp bậc công việc');
    }
  }
);

export const addJob = createAsyncThunk(
  'job/addJob',
  async (jobData, { rejectWithValue }) => {
    try {
      const response = await jobAPI.addJob(jobData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể thêm công việc mới');
    }
  }
);

export const fetchJobs = createAsyncThunk(
  'job/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jobAPI.fetchJobs();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải danh sách việc làm');
    }
  }
);

export const fetchAdminJobs = createAsyncThunk(
  'job/fetchAdminJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jobAPI.fetchAdminJobs();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải danh sách việc làm');
    }
  }
);

export const fetchUnapprovedJobs = createAsyncThunk(
  'job/fetchUnapprovedJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jobAPI.fetchUnapprovedJobs();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải danh sách việc làm chưa duyệt');
    }
  }
);

export const fetchJobsbyComp = createAsyncThunk(
  'job/fetchJobsbyComp',
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await jobAPI.fetchJobsbyComp(companyId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải danh sách việc làm của công ty');
    }
  }
);

export const fetchAdminJobsbyComp = createAsyncThunk(
  'job/fetchAdminJobsbyComp',
  async (companyId, { rejectWithValue }) => {
    try {
      const response = await jobAPI.fetchAdminJobsbyComp(companyId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải danh sách việc làm của công ty');
    }
  }
);

export const fetchFeaturedJobs = createAsyncThunk(
  'job/fetchFeaturedJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jobAPI.fetchFeaturedJobs();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải danh sách việc làm nổi bật');
    }
  }
);

export const fetchJobsbyId = createAsyncThunk(
  'job/fetchJobsbyId',
  async (id, { rejectWithValue }) => {
    try {
      const response = await jobAPI.fetchJobsbyId(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể tải việc làm');
    }
  }
);

export const restoreJob = createAsyncThunk(
  'job/restoreJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await jobAPI.restoreJob(jobId);
      return jobId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể khôi phục việc làm');
    }
  }
);

export const deleteJob = createAsyncThunk(
  'job/deleteJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await jobAPI.deleteJob(jobId);
      return jobId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể xóa việc làm');
    }
  }
);

export const deleteJobPermanently = createAsyncThunk(
  'job/deleteJobPermanently',
  async (jobId, { rejectWithValue }) => {
    try {
      await jobAPI.deleteJobPermanently(jobId);
      return jobId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể xóa việc làm');
    }
  }
);

export const updateJobStatus = createAsyncThunk(
  'job/updateJobStatus',
  async ({ jobId, status }, { rejectWithValue }) => {
    try {
      const response = await jobAPI.updateJobStatus(jobId, status);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể cập nhật trạng thái việc làm');
    }
  }
);

export const extendJob = createAsyncThunk(
  'job/extendJob',
  async ({ jobId, days }, { rejectWithValue }) => {
    try {
      const response = await jobAPI.extendJob(jobId, days);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể cập nhật trạng thái việc làm');
    }
  }
);

export const updateJob = createAsyncThunk(
  'job/updateJob',
  async ({ id, jobData }, { rejectWithValue }) => {
    try {
      const response = await jobAPI.updateJob(id, jobData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Không thể cập nhật công việc');
    }
  }
);

export const toggleFeatureJob = createAsyncThunk(
  'companies/toggleFeatureJob',
  async (jobId, { rejectWithValue }) => {
    try {
      await jobAPI.toggleFeatureJob(jobId);
      return jobId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const jobSlice = createSlice({
  name: 'job',
  initialState: {
    jobs: [],
    unapprovedJobs: [],
    compJobs: [],
    featuredJobs: [],
    jobbyId: null,
    jobLevels: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    currentJob: null
  },
  reducers: {
    resetJobStatus: (state) => {
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchJobLevels
      .addCase(fetchJobLevels.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJobLevels.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobLevels = action.payload;
      })
      .addCase(fetchJobLevels.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // addJob
      .addCase(addJob.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentJob = action.payload;
      })
      .addCase(addJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAdminJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAdminJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = action.payload;
      })
      .addCase(fetchAdminJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchUnapprovedJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUnapprovedJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.unapprovedJobs = action.payload;
      })
      .addCase(fetchUnapprovedJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchJobsbyComp.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJobsbyComp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.compJobs = action.payload;
      })
      .addCase(fetchJobsbyComp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchAdminJobsbyComp.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAdminJobsbyComp.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.compJobs = action.payload;
      })
      .addCase(fetchAdminJobsbyComp.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchFeaturedJobs.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFeaturedJobs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.featuredJobs = action.payload;
      })
      .addCase(fetchFeaturedJobs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchJobsbyId.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchJobsbyId.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobbyId = action.payload;
      })
      .addCase(fetchJobsbyId.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteJob.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = state.jobs.filter(job => job.jobID !== action.payload);
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteJobPermanently.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteJobPermanently.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = state.jobs.filter(job => job.jobID !== action.payload);
      })
      .addCase(deleteJobPermanently.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(restoreJob.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(restoreJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.jobs = state.jobs.filter(job => job.jobID !== action.payload);
      })
      .addCase(restoreJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateJobStatus.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.jobs.findIndex(job => job.jobID === action.payload.jobID);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(updateJobStatus.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(extendJob.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(extendJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.jobs.findIndex(job => job.jobID === action.payload.jobID);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(extendJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateJob.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.jobs.findIndex(job => job.jobID === action.payload.jobID);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
        state.currentJob = action.payload;
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(toggleFeatureJob.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(toggleFeatureJob.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Update the job's featured status in the jobs array
        const jobIndex = state.jobs.findIndex(
          job => job.jobId === action.payload
        );
        if (jobIndex !== -1) {
          state.jobs[jobIndex] = {
            ...state.jobs[jobIndex],
            isFeature: !state.jobs[jobIndex].isFeatured
          };
        }
        
        const featuredIndex = state.featuredJobs.findIndex(
          job => job.jobId === action.payload
        );
        if (featuredIndex !== -1) {
          state.featuredJobs.splice(featuredIndex, 1);
        } else {
          const jobToAdd = state.jobs.find(
            job => job.jobId === action.payload
          );
          if (jobToAdd && jobToAdd.isFeature) {
            state.featuredJobs.push(jobToAdd);
          }
        }
      })
      .addCase(toggleFeatureJob.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { resetJobStatus } = jobSlice.actions;
export default jobSlice.reducer;