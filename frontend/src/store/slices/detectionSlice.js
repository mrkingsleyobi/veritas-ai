import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const analyzeMedia = createAsyncThunk(
  'detection/analyzeMedia',
  async (mediaData, { rejectWithValue }) => {
    try {
      const response = await api.post('/detection/analyze', mediaData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getDetectionHistory = createAsyncThunk(
  'detection/getHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/detection/history')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const getDetectionResult = createAsyncThunk(
  'detection/getResult',
  async (detectionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/detection/${detectionId}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  currentAnalysis: null,
  history: [],
  selectedResult: null,
  loading: false,
  analysisLoading: false,
  error: null
}

const detectionSlice = createSlice({
  name: 'detection',
  initialState,
  reducers: {
    clearCurrentAnalysis: (state) => {
      state.currentAnalysis = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Analyze media
      .addCase(analyzeMedia.pending, (state) => {
        state.analysisLoading = true
        state.error = null
      })
      .addCase(analyzeMedia.fulfilled, (state, action) => {
        state.analysisLoading = false
        state.currentAnalysis = action.payload
        // Add to history
        state.history.unshift(action.payload)
      })
      .addCase(analyzeMedia.rejected, (state, action) => {
        state.analysisLoading = false
        state.error = action.payload
      })
      // Get history
      .addCase(getDetectionHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDetectionHistory.fulfilled, (state, action) => {
        state.loading = false
        state.history = action.payload
      })
      .addCase(getDetectionHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Get result
      .addCase(getDetectionResult.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getDetectionResult.fulfilled, (state, action) => {
        state.loading = false
        state.selectedResult = action.payload
      })
      .addCase(getDetectionResult.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearCurrentAnalysis, clearError } = detectionSlice.actions

export default detectionSlice.reducer