import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import PostApi from '../../services/PostApi';

// Async thunks for handling API calls
export const fetchAllBlogs = createAsyncThunk('posts/fetchAllBlogs', async (includeDeleted = true) => {
    const response = await PostApi.getAllBlogs(includeDeleted);
    return response;
});

export const fetchNewestBlogs = createAsyncThunk('posts/fetchNewestBlogs', async (limit) => {
    const response = await PostApi.getNewestBlogs(limit);
    return response;
});

export const fetchBlogById = createAsyncThunk('posts/fetchBlogById', async (id) => {
    const response = await PostApi.getBlogById(id);
    return response;
});

export const fetchBlogsByUser = createAsyncThunk('posts/fetchBlogsByUser', async (userId) => {
    const response = await PostApi.getBlogsByUser(userId);
    return response;
});

export const fetchBlogsByType = createAsyncThunk('posts/fetchBlogsByType', async (blogTypeId) => {
    const response = await PostApi.getBlogsByType(blogTypeId);
    return response;
});

export const createBlog = createAsyncThunk('posts/createBlog', async (blogData) => {
    const response = await PostApi.createBlog(blogData);
    return response;
});

export const uploadImage = createAsyncThunk(
    'posts/uploadImage',
    async (formData, { rejectWithValue }) => {
      try {
        const imageUrl = await PostApi.uploadImage(formData);
        return imageUrl;
      } catch (error) {
        const errorMessage = error.response?.data || 
          error.message || 
          'Failed to upload image';
        return rejectWithValue(errorMessage);
      }
    }
  );

export const updateBlog = createAsyncThunk('posts/updateBlog', async ({ id, blogData }) => {
    const response = await PostApi.updateBlog(id, blogData);
    return response;
});

export const publishBlog = createAsyncThunk('posts/publishBlog', async (id) => {
    const response = await PostApi.publishBlog(id);
    return response;
});

export const unpublishBlog = createAsyncThunk('posts/unpublishBlog', async (id) => {
    const response = await PostApi.unpublishBlog(id);
    return response;
});

export const incrementViewCount = createAsyncThunk('posts/incrementViewCount', async (id) => {
    const response = await PostApi.incrementViewCount(id);
    return response;
});

export const softDeleteBlog = createAsyncThunk('posts/softDeleteBlog', async (id) => {
    const response = await PostApi.softDeleteBlog(id);
    return response;
});

export const permanentDeleteBlog = createAsyncThunk('posts/permanentDeleteBlog', async (id) => {
    const response = await PostApi.permanentDeleteBlog(id);
    return response;
});

export const restoreBlog = createAsyncThunk('posts/restoreBlog', async (id) => {
    const response = await PostApi.restoreBlog(id);
    return response;
});

export const searchBlogs = createAsyncThunk('posts/searchBlogs', async (searchModel) => {
    const response = await PostApi.searchBlogs(searchModel);
    return response;
});

export const fetchAllBlogTypes = createAsyncThunk('posts/fetchAllBlogTypes', async (includeDeleted = false) => {
    const response = await PostApi.getAllBlogTypes(includeDeleted);
    return response;
});

export const fetchBlogTypeById = createAsyncThunk('posts/fetchBlogTypeById', async (id) => {
    const response = await PostApi.getBlogTypeById(id);
    return response;
});

export const addBlogType = createAsyncThunk('posts/addBlogType', async (blogTypeData) => {
    const response = await PostApi.addBlogType(blogTypeData);
    return response;
});

export const updateBlogType = createAsyncThunk('posts/updateBlogType', async ({ id, blogTypeData }) => {
    const response = await PostApi.updateBlogType(id, blogTypeData);
    return response;
});

export const softDeleteBlogType = createAsyncThunk('posts/softDeleteBlogType', async (id) => {
    const response = await PostApi.softDeleteBlogType(id);
    return response;
});

export const permanentDeleteBlogType = createAsyncThunk('posts/permanentDeleteBlogType', async (id) => {
    const response = await PostApi.permanentDeleteBlogType(id);
    return response;
});

export const restoreBlogType = createAsyncThunk('posts/restoreBlogType', async (id) => {
    const response = await PostApi.restoreBlogType(id);
    return response;
});

export const searchBlogTypes = createAsyncThunk('posts/searchBlogTypes', async (searchTerm) => {
    const response = await PostApi.searchBlogTypes(searchTerm);
    return response;
});

const postSlice = createSlice({
    name: 'posts',
    initialState: {
        posts: [],
        blogTypes: [],
        currentBlog: null, 
        status: 'idle',
        error: null,
    },
    reducers: {
        clearCurrentBlog: (state) => {
            state.currentBlog = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllBlogs.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllBlogs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = action.payload || [];
            })
            .addCase(fetchAllBlogs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchNewestBlogs.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchNewestBlogs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = action.payload || [];
                state.error = null;
            })
            .addCase(fetchNewestBlogs.rejected, (state, action) => {
                state.status = 'failed';
                state.posts = [];
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchBlogById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.currentBlog = null;
            })
            .addCase(fetchBlogById.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBlog = action.payload;
                state.error = null;
            })
            .addCase(fetchBlogById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
                state.currentBlog = null;
            })
            .addCase(fetchBlogsByUser.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBlogsByUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = action.payload || [];
            })
            .addCase(fetchBlogsByUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchBlogsByType.pending, (state) => {
                state.status = 'loading';
                state.posts = []; 
            })
            .addCase(fetchBlogsByType.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = action.payload || [];
                state.error = null;
            })
            .addCase(fetchBlogsByType.rejected, (state, action) => {
                state.status = 'failed';
                state.posts = [];
                state.error = action.payload || action.error.message;
            })
            .addCase(createBlog.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createBlog.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts.push(action.payload);
            })
            .addCase(createBlog.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(updateBlog.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateBlog.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBlog = action.payload;
                const index = state.posts.findIndex(post => post.id === action.payload.id);
                if (index !== -1) {
                    state.posts[index] = action.payload;
                }
                state.error = null;
            })
            .addCase(updateBlog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(publishBlog.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(publishBlog.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = state.posts.map(post => post.id === action.payload.id ? action.payload : post);
            })
            .addCase(publishBlog.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(unpublishBlog.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(unpublishBlog.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = state.posts.map(post => post.id === action.payload.id ? action.payload : post);
            })
            .addCase(unpublishBlog.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(incrementViewCount.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(incrementViewCount.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = state.posts.map(post => post.id === action.payload.id ? action.payload : post);
            })
            .addCase(incrementViewCount.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(softDeleteBlog.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(softDeleteBlog.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = state.posts.filter(post => post.id !== action.payload.id);
            })
            .addCase(softDeleteBlog.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(permanentDeleteBlog.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(permanentDeleteBlog.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = state.posts.filter(post => post.id !== action.payload.id);
            })
            .addCase(permanentDeleteBlog.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(restoreBlog.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(restoreBlog.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = state.posts.map(post => post.id === action.payload.id ? action.payload : post);
            })
            .addCase(restoreBlog.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(searchBlogs.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(searchBlogs.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.posts = action.payload || [];
            })
            .addCase(searchBlogs.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(fetchAllBlogTypes.pending, (state) => {
                state.status = state.blogTypes.length > 0 ? 'idle' : 'loading';
            })
            .addCase(fetchAllBlogTypes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                if (state.blogTypes.length === 0) {
                state.blogTypes = action.payload || [];
                }
            })
            .addCase(fetchAllBlogTypes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchBlogTypeById.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchBlogTypeById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.blogTypes = state.blogTypes.map(blogType => blogType.id === action.payload.id ? action.payload : blogType);
            })
            .addCase(fetchBlogTypeById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(addBlogType.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addBlogType.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.blogTypes.push(action.payload);
            })
            .addCase(addBlogType.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(updateBlogType.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(updateBlogType.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.blogTypes = state.blogTypes.map(blogType => blogType.id === action.payload.id ? action.payload : blogType);
            })
            .addCase(updateBlogType.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(softDeleteBlogType.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(softDeleteBlogType.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.blogTypes = state.blogTypes.filter(blogType => blogType.id !== action.payload.id);
            })
            .addCase(softDeleteBlogType.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(permanentDeleteBlogType.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(permanentDeleteBlogType.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.blogTypes = state.blogTypes.filter(blogType => blogType.id !== action.payload.id);
            })
            .addCase(permanentDeleteBlogType.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(restoreBlogType.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(restoreBlogType.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.blogTypes = state.blogTypes.map(blogType => blogType.id === action.payload.id ? action.payload : blogType);
            })
            .addCase(restoreBlogType.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            .addCase(searchBlogTypes.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(searchBlogTypes.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.blogTypes = action.payload || [];
            })
            .addCase(searchBlogTypes.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    },
});

export const { clearCurrentBlog } = postSlice.actions;

export default postSlice.reducer;
