import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  theme: 'light', // light or dark
  notifications: [],
  loading: false,
  snackbars: []
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload
    },
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    showNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        ...action.payload
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },
    showSnackbar: (state, action) => {
      const snackbar = {
        id: Date.now(),
        ...action.payload
      }
      state.snackbars.push(snackbar)
    },
    removeSnackbar: (state, action) => {
      state.snackbars = state.snackbars.filter(
        snackbar => snackbar.id !== action.payload
      )
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    }
  }
})

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setTheme,
  showNotification,
  removeNotification,
  showSnackbar,
  removeSnackbar,
  setLoading
} = uiSlice.actions

export default uiSlice.reducer