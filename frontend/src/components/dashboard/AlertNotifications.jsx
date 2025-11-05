import React, { useState, useEffect } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import {
  Card,
  CardContent,
  Typography,
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'

const AlertNotifications = () => {
  const { theme } = useTheme()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)

  // Mock notifications data
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'warning',
        title: 'High False Positive Rate',
        message: 'Detection accuracy dropped below 95% in the last hour',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        read: false,
        priority: 'high',
        category: 'Detection'
      },
      {
        id: 2,
        type: 'error',
        title: 'System Overload',
        message: 'Processing queue has exceeded capacity threshold',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        priority: 'critical',
        category: 'System'
      },
      {
        id: 3,
        type: 'info',
        title: 'New Model Deployed',
        message: 'Deepfake detection model v2.1.0 has been deployed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: true,
        priority: 'low',
        category: 'Updates'
      },
      {
        id: 4,
        type: 'success',
        title: 'Compliance Audit Passed',
        message: 'Monthly compliance audit completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        read: true,
        priority: 'medium',
        category: 'Compliance'
      },
      {
        id: 5,
        type: 'warning',
        title: 'Storage Threshold',
        message: 'Storage usage at 85% capacity',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        read: false,
        priority: 'medium',
        category: 'System'
      }
    ]

    setNotifications(mockNotifications)
    setUnreadCount(mockNotifications.filter(n => !n.read).length)
  }, [])

  const getIconByType = (type) => {
    switch (type) {
      case 'warning': return <WarningIcon className={theme === 'dark' ? "text-yellow-400" : "text-yellow-500"} />
      case 'error': return <ErrorIcon className={theme === 'dark' ? "text-red-400" : "text-red-500"} />
      case 'success': return <CheckCircleIcon className={theme === 'dark' ? "text-green-400" : "text-green-500"} />
      case 'info': return <InfoIcon className={theme === 'dark' ? "text-blue-400" : "text-blue-500"} />
      default: return <NotificationsIcon />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error'
      case 'high': return 'warning'
      case 'medium': return 'primary'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const markAsRead = (id) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id)
    if (!notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000)
    let interval = seconds / 31536000

    if (interval > 1) return Math.floor(interval) + ' years ago'
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + ' months ago'
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + ' days ago'
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + ' hours ago'
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + ' minutes ago'
    return Math.floor(seconds) + ' seconds ago'
  }

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification)
    setOpenDialog(true)
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedNotification(null)
  }

  return (
    <div>
      <Card className={theme === 'dark' ? 'dark:bg-gray-800' : ''}>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon fontSize="large" className={theme === 'dark' ? 'text-white' : ''} />
              </Badge>
              <Typography variant="h6" className={`ml-2 ${theme === 'dark' ? 'text-white' : ''}`}>
                Alert Notifications
              </Typography>
            </div>
            <div className="space-x-2">
              <Button
                size="small"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className={theme === 'dark' ? 'text-white' : ''}
              >
                Mark All Read
              </Button>
              <Button
                size="small"
                onClick={clearAllNotifications}
                color="error"
                className={theme === 'dark' ? 'text-red-400' : ''}
              >
                Clear All
              </Button>
            </div>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <NotificationsIcon
                className={theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
                style={{ fontSize: 48 }}
              />
              <Typography
                variant="h6"
                className={`mt-2 ${theme === 'dark' ? 'text-white' : ''}`}
              >
                No notifications
              </Typography>
              <Typography
                variant="body2"
                className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
              >
                You're all caught up!
              </Typography>
            </div>
          ) : (
            <List className={theme === 'dark' ? 'dark:bg-gray-800' : ''}>
              {notifications.map((notification) => (
                <ListItem
                  key={notification.id}
                  className={`py-3 ${
                    theme === 'dark'
                      ? notification.read
                        ? 'border-b border-gray-700'
                        : 'border-b border-gray-700 bg-blue-900/20'
                      : notification.read
                        ? 'border-b border-gray-200'
                        : 'border-b border-gray-200 bg-blue-50'
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: 'pointer' }}
                >
                  <ListItemIcon>
                    {getIconByType(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <div className="flex items-center">
                        <span className={theme === 'dark' ? 'font-medium text-white' : 'font-medium'}>
                          {notification.title}
                        </span>
                        <Chip
                          label={notification.priority}
                          size="small"
                          className="ml-2"
                          color={getPriorityColor(notification.priority)}
                          variant="outlined"
                        />
                        <Chip
                          label={notification.category}
                          size="small"
                          className="ml-2"
                          variant="outlined"
                          className={theme === 'dark' ? 'dark:text-white dark:border-white' : ''}
                        />
                      </div>
                    }
                    secondary={
                      <div>
                        <Typography
                          component="span"
                          variant="body2"
                          className={`block ${theme === 'dark' ? 'text-gray-300' : ''}`}
                        >
                          {notification.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
                        >
                          {formatTimeAgo(notification.timestamp)}
                        </Typography>
                      </div>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Delete">
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className={theme === 'dark' ? 'text-white' : ''}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Notification Detail Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        className={theme === 'dark' ? 'dark' : ''}
      >
        {selectedNotification && (
          <>
            <DialogTitle className={theme === 'dark' ? 'dark:bg-gray-800 dark:text-white' : ''}>
              <div className="flex items-center">
                {getIconByType(selectedNotification.type)}
                <span className="ml-2">{selectedNotification.title}</span>
                <Chip
                  label={selectedNotification.priority}
                  size="small"
                  className="ml-2"
                  color={getPriorityColor(selectedNotification.priority)}
                  variant="outlined"
                />
              </div>
            </DialogTitle>
            <DialogContent className={theme === 'dark' ? 'dark:bg-gray-800' : ''}>
              <Typography
                variant="body1"
                className={`mb-4 ${theme === 'dark' ? 'dark:text-gray-300' : ''}`}
              >
                {selectedNotification.message}
              </Typography>
              <div className={`flex justify-between items-center text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                <span>Category: {selectedNotification.category}</span>
                <span>{formatTimeAgo(selectedNotification.timestamp)}</span>
              </div>
            </DialogContent>
            <DialogActions className={theme === 'dark' ? 'dark:bg-gray-800' : ''}>
              <Button
                onClick={handleCloseDialog}
                color="primary"
                className={theme === 'dark' ? 'text-white' : ''}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  )
}

export default AlertNotifications