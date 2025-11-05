import React, { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import {
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  TableChart as CsvIcon,
  BarChart as ExcelIcon,
  Share as ShareIcon
} from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material'

const ExportReports = () => {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [exportType, setExportType] = useState('pdf')
  const [selectedData, setSelectedData] = useState({
    dashboardStats: true,
    detectionHistory: true,
    complianceReports: true,
    activityLogs: true
  })
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [exporting, setExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  const handleClickOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setExportSuccess(false)
  }

  const handleDataSelection = (event) => {
    setSelectedData({
      ...selectedData,
      [event.target.name]: event.target.checked
    })
  }

  const handleExport = async () => {
    setExporting(true)
    setExportSuccess(false)

    // Simulate export process
    setTimeout(() => {
      setExporting(false)
      setExportSuccess(true)

      // Close dialog after 2 seconds
      setTimeout(() => {
        handleClose()
      }, 2000)
    }, 1500)
  }

  const exportOptions = [
    { value: 'pdf', label: 'PDF Document', icon: <PdfIcon /> },
    { value: 'csv', label: 'CSV File', icon: <CsvIcon /> },
    { value: 'xlsx', label: 'Excel Spreadsheet', icon: <ExcelIcon /> }
  ]

  return (
    <div>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleClickOpen}
        sx={{
          ...(theme === 'dark' && {
            color: 'white',
            borderColor: '#4b5563',
            '&:hover': {
              borderColor: '#6b7280'
            }
          })
        }}
      >
        Export Reports
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        className={theme === 'dark' ? 'dark' : ''}
      >
        <DialogTitle className={theme === 'dark' ? 'dark:bg-gray-800 dark:text-white' : ''}>
          Export Dashboard Reports
        </DialogTitle>
        <DialogContent className={theme === 'dark' ? 'dark:bg-gray-800' : ''}>
          {exportSuccess ? (
            <Alert
              severity="success"
              className={`mb-4 ${theme === 'dark' ? 'dark:bg-green-900 dark:text-green-200' : ''}`}
            >
              Report exported successfully! The file has been downloaded.
            </Alert>
          ) : null}

          <div className="space-y-4 mt-2">
            <FormControl fullWidth>
              <InputLabel className={theme === 'dark' ? 'dark:text-gray-300' : ''}>
                Export Format
              </InputLabel>
              <Select
                value={exportType}
                label="Export Format"
                onChange={(e) => setExportType(e.target.value)}
                className={theme === 'dark' ? 'dark:text-white' : ''}
              >
                {exportOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      {option.icon}
                      <span className="ml-2">{option.label}</span>
                    </div>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div>
              <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>
                Select Data to Export
              </h3>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedData.dashboardStats}
                      onChange={handleDataSelection}
                      name="dashboardStats"
                      className={theme === 'dark' ? 'dark:text-white' : ''}
                    />
                  }
                  label={
                    <span className={theme === 'dark' ? 'text-gray-300' : ''}>
                      Dashboard Statistics
                    </span>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedData.detectionHistory}
                      onChange={handleDataSelection}
                      name="detectionHistory"
                      className={theme === 'dark' ? 'dark:text-white' : ''}
                    />
                  }
                  label={
                    <span className={theme === 'dark' ? 'text-gray-300' : ''}>
                      Detection History
                    </span>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedData.complianceReports}
                      onChange={handleDataSelection}
                      name="complianceReports"
                      className={theme === 'dark' ? 'dark:text-white' : ''}
                    />
                  }
                  label={
                    <span className={theme === 'dark' ? 'text-gray-300' : ''}>
                      Compliance Reports
                    </span>
                  }
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedData.activityLogs}
                      onChange={handleDataSelection}
                      name="activityLogs"
                      className={theme === 'dark' ? 'dark:text-white' : ''}
                    />
                  }
                  label={
                    <span className={theme === 'dark' ? 'text-gray-300' : ''}>
                      Activity Logs
                    </span>
                  }
                />
              </FormGroup>
            </div>

            <div>
              <h3 className={`font-medium mb-2 ${theme === 'dark' ? 'text-white' : ''}`}>
                Date Range (Optional)
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <TextField
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className={theme === 'dark' ? 'dark:text-white' : ''}
                  InputProps={{
                    className: theme === 'dark' ? 'dark:text-white' : ''
                  }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className={theme === 'dark' ? 'dark:text-white' : ''}
                  InputProps={{
                    className: theme === 'dark' ? 'dark:text-white' : ''
                  }}
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogActions className={theme === 'dark' ? 'dark:bg-gray-800' : ''}>
          <Button
            onClick={handleClose}
            disabled={exporting}
            className={theme === 'dark' ? 'text-white' : ''}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={exporting}
            startIcon={exporting ? <CircularProgress size={20} /> : <ShareIcon />}
            className={theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ExportReports