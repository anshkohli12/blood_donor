"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, Check, CheckCheck, Clock, XCircle, CheckCircle, Calendar, Package } from "lucide-react"
import { notificationService } from "../services/notificationService"
import { useNavigate } from "react-router-dom"

const NotificationBell = ({ isScrolled, isHomePage }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  // Fetch unread count on mount and poll every 30s
  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount()
      if (response.success) setUnreadCount(response.count)
    } catch (err) {
      // Silently fail — notification count is non-critical
    }
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationService.getNotifications(1, 10)
      if (response.success) setNotifications(response.data)
    } catch (err) {
      console.error("Failed to fetch notifications:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleBellClick = () => {
    if (!isOpen) fetchNotifications()
    setIsOpen(!isOpen)
  }

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error("Failed to mark as read:", err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    }
  }

  const handleNotificationClick = (notification) => {
    if (!notification.read) handleMarkAsRead(notification._id)
    if (notification.requestId) {
      navigate("/my-blood-requests")
    }
    setIsOpen(false)
  }

  const getNotifIcon = (type) => {
    switch (type) {
      case "request_pending": return <Clock className="h-4 w-4 text-yellow-500" />
      case "request_approved": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "request_rejected": return <XCircle className="h-4 w-4 text-red-500" />
      case "request_scheduled": return <Calendar className="h-4 w-4 text-blue-500" />
      case "request_completed": return <Package className="h-4 w-4 text-purple-500" />
      default: return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const timeAgo = (dateStr) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now - date
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return "Just now"
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    const diffDays = Math.floor(diffHr / 24)
    return `${diffDays}d ago`
  }

  const textColor = isScrolled || !isHomePage
    ? "text-gray-800 hover:text-blood-crimson"
    : "text-white hover:text-pink-200"

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className={`relative p-2 rounded-lg transition-all duration-300 hover:scale-110 ${textColor} hover:bg-gray-100/50`}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 shadow-lg"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blood-deep to-blood-crimson text-white">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs flex items-center gap-1 hover:text-red-200 transition-colors"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blood-crimson" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <Bell className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleNotificationClick(notif)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                      !notif.read ? "bg-red-50/50" : ""
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {getNotifIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm leading-tight ${!notif.read ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.read && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 bg-gray-50 border-t">
                <button
                  onClick={() => { navigate("/my-blood-requests"); setIsOpen(false) }}
                  className="text-xs text-blood-crimson hover:text-blood-deep font-medium w-full text-center"
                >
                  View all requests →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell
