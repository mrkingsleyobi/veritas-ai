import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

// Async thunks
export const fetchComplianceReports = createAsyncThunk(
  'compliance/fetchReports',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/compliance/reports')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const generateComplianceReport = createAsyncThunk(
  'compliance/generateReport',
  async (reportData, { rejectWithValue }) => {
    try {
      const response = await api.post('/compliance/reports', reportData)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

export const fetchRegulations = createAsyncThunk(
  'compliance/fetchRegulations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/compliance/regulations')
      return response.data
    } catch (error) {
      return rejectWithValue(error.response.data)
    }
  }
)

const initialState = {
  reports: [],
  regulations: [],
  currentReport: null,
  loading: false,
  error: null
}

const complianceSlice = createSlice({
  name: 'compliance',
  initialState,
  reducers: {
    clearCurrentReport: (state) => {
      state.currentReport = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reports
      .addCase(fetchComplianceReports.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchComplianceReports.fulfilled, (state, action) => {
        state.loading = false
        state.reports = action.payload
      })
      .addCase(fetchComplianceReports.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Generate report
      .addCase(generateComplianceReport.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(generateComplianceReport.fulfilled, (state, action) => {
        state.loading = false
        state.reports.unshift(action.payload)
        state.currentReport = action.payload
      })
      .addCase(generateComplianceReport.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch regulations
      .addCase(fetchRegulations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRegulations.fulfilled, (state, action) => {
        state.loading = false
        state.regulations = action.payload
      })
      .addCase(fetchRegulations.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearCurrentReport, clearError } = complianceSlice.actions

export default complianceSlice.reducer