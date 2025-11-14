"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  MessageSquare,
  Mail,
  Phone,
  User,
  Calendar,
  Clock,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock3,
  XCircle,
  MessageCircle,
  Send,
  ArrowLeft
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import CustomButton from "../components/CustomButton"
import FormInput from "../components/FormInput"
import { contactService } from "../services/contactService"
import { useAuth } from "../hooks/useAuth"

const AdminContactMessages = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [newNote, setNewNote] = useState("")
  const [addingNote, setAddingNote] = useState(false)
  const [adminResponse, setAdminResponse] = useState("")
  const [sendingResponse, setSendingResponse] = useState(false)

  // Fetch all messages
  const fetchMessages = async () => {
    try {
      setLoading(true)
      const params = {
        search: searchTerm,
        status: statusFilter,
        priority: priorityFilter,
        limit: 50
      }
      const response = await contactService.getAllMessages(params)
      if (response.success) {
        setMessages(response.data.messages)
        setStats(response.data.stats)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchMessages()
    }
  }, [user, searchTerm, statusFilter, priorityFilter])

  // Filter messages based on search term, status and priority
  const filteredMessages = useMemo(() => {
    return messages.filter(message => {
      const matchesSearch = !searchTerm || 
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || message.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || message.priority === priorityFilter
      
      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [messages, searchTerm, statusFilter, priorityFilter])

  // Update message status/priority
  const updateMessage = async (id, updateData) => {
    try {
      const response = await contactService.updateMessage(id, updateData)
      if (response.success) {
        fetchMessages()
        if (selectedMessage?._id === id) {
          setSelectedMessage(response.data)
        }
      }
    } catch (error) {
      console.error('Error updating message:', error)
    }
  }

  // Mark as read
  const markAsRead = async (id) => {
    try {
      const response = await contactService.markAsRead(id)
      if (response.success) {
        fetchMessages()
        if (selectedMessage?._id === id) {
          setSelectedMessage(response.data)
        }
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Add note
  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return

    try {
      setAddingNote(true)
      const response = await contactService.addNote(selectedMessage._id, newNote)
      if (response.success) {
        setSelectedMessage(response.data)
        setNewNote("")
        fetchMessages()
      }
    } catch (error) {
      console.error('Error adding note:', error)
    } finally {
      setAddingNote(false)
    }
  }

  // Send admin response
  const handleSendResponse = async (e) => {
    e.preventDefault()
    if (!adminResponse.trim()) return
    
    if (adminResponse.trim().length < 10) {
      alert('Response must be at least 10 characters long')
      return
    }

    try {
      setSendingResponse(true)
      const response = await contactService.sendResponse(selectedMessage._id, adminResponse)
      if (response.success) {
        setSelectedMessage(response.data)
        setAdminResponse("")
        fetchMessages()
        alert('Response sent successfully! User will be able to see it.')
      }
    } catch (error) {
      console.error('Error sending response:', error)
      alert('Failed to send response')
    } finally {
      setSendingResponse(false)
    }
  }

  // Delete message with confirmation modal
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  
  const deleteMessage = async (id) => {
    try {
      const response = await contactService.deleteMessage(id)
      if (response.success) {
        fetchMessages()
        if (selectedMessage?._id === id) {
          setSelectedMessage(null)
        }
        setDeleteConfirm(null)
        // Show success message
        console.log('Message deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('Failed to delete message. Please try again.')
    }
  }

  // Bulk delete selected messages
  const [selectedMessages, setSelectedMessages] = useState([])
  
  const toggleMessageSelection = (id) => {
    setSelectedMessages(prev => 
      prev.includes(id) 
        ? prev.filter(msgId => msgId !== id)
        : [...prev, id]
    )
  }

  const selectAllMessages = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([])
    } else {
      setSelectedMessages(filteredMessages.map(msg => msg._id))
    }
  }

  const bulkDeleteMessages = async () => {
    if (selectedMessages.length === 0) return
    
    if (!confirm(`Are you sure you want to delete ${selectedMessages.length} selected messages?`)) return

    try {
      for (const id of selectedMessages) {
        await contactService.deleteMessage(id)
      }
      fetchMessages()
      setSelectedMessages([])
      console.log(`${selectedMessages.length} messages deleted successfully`)
    } catch (error) {
      console.error('Error bulk deleting messages:', error)
      alert('Failed to delete some messages. Please try again.')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'in-progress': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-gray-100 text-gray-700'
      case 'medium': return 'bg-indigo-100 text-indigo-700'
      case 'high': return 'bg-orange-100 text-orange-700'
      case 'urgent': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock3
      case 'in-progress': return Clock
      case 'resolved': return CheckCircle
      case 'closed': return XCircle
      default: return AlertCircle
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="pt-32 section-padding">
        <div className="container-custom text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">Access Denied</h2>
            <p className="text-red-600">You don't have admin privileges to access this page.</p>
          </div>
        </div>
      </div>
    )
  }

  if (selectedMessage) {
    const StatusIcon = getStatusIcon(selectedMessage.status)
    
    return (
      <div className="pt-32 section-padding bg-gray-50 min-h-screen">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <CustomButton
              variant="outline"
              icon={ArrowLeft}
              onClick={() => setSelectedMessage(null)}
              className="mb-4"
            >
              Back to Messages
            </CustomButton>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Message Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <MessageSquare className="h-5 w-5 text-blood-crimson" />
                        <span>{selectedMessage.subject}</span>
                        {!selectedMessage.isRead && (
                          <span className="w-2 h-2 bg-blood-crimson rounded-full"></span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        From: {selectedMessage.firstName} {selectedMessage.lastName}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(selectedMessage.status)}`}>
                        <StatusIcon className="h-3 w-3 inline mr-1" />
                        {selectedMessage.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedMessage.priority)}`}>
                        {selectedMessage.priority}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed">{selectedMessage.message}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{selectedMessage.email}</span>
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{selectedMessage.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Received: {new Date(selectedMessage.createdAt).toLocaleDateString()}</span>
                      </div>
                      {selectedMessage.readBy && (
                        <div className="flex items-center space-x-2">
                          <Eye className="h-4 w-4" />
                          <span>Read by: {selectedMessage.readBy.firstName} {selectedMessage.readBy.lastName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Admin Response to User */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="h-5 w-5 text-blood-crimson" />
                    <span>Response to User</span>
                  </CardTitle>
                  <CardDescription>
                    Send a response that the user can see when they check their messages
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedMessage.adminResponse?.message ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-green-800">Response Sent</span>
                        <span className="text-xs text-green-600">
                          {new Date(selectedMessage.adminResponse.respondedAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{selectedMessage.adminResponse.message}</p>
                      <div className="text-xs text-gray-600">
                        By: {selectedMessage.adminResponse.respondedBy?.firstName} {selectedMessage.adminResponse.respondedBy?.lastName}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSendResponse} className="space-y-3">
                      <div>
                        <textarea
                          value={adminResponse}
                          onChange={(e) => setAdminResponse(e.target.value)}
                          placeholder="Type your response to the user here... (minimum 10 characters)"
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson resize-none"
                          rows={4}
                          required
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {adminResponse.trim().length} / 2000 characters 
                          {adminResponse.trim().length < 10 && adminResponse.trim().length > 0 && (
                            <span className="text-red-600 ml-2">
                              (Minimum 10 characters required)
                            </span>
                          )}
                        </div>
                      </div>
                      <CustomButton
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={sendingResponse}
                        icon={Send}
                        disabled={!adminResponse.trim() || adminResponse.trim().length < 10}
                      >
                        Send Response to User
                      </CustomButton>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Status History */}
              {selectedMessage.statusHistory && selectedMessage.statusHistory.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blood-crimson" />
                      <span>Status History</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedMessage.statusHistory.map((history, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start space-x-3 pb-3 border-b border-gray-200 last:border-0"
                        >
                          <div className={`mt-1 p-1.5 rounded-full ${
                            history.status === 'resolved' ? 'bg-green-100' :
                            history.status === 'in-progress' ? 'bg-blue-100' :
                            history.status === 'closed' ? 'bg-gray-100' :
                            'bg-yellow-100'
                          }`}>
                            {history.status === 'resolved' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                             history.status === 'in-progress' ? <Clock3 className="h-4 w-4 text-blue-600" /> :
                             history.status === 'closed' ? <XCircle className="h-4 w-4 text-gray-600" /> :
                             <AlertCircle className="h-4 w-4 text-yellow-600" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 capitalize">{history.status.replace('-', ' ')}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(history.changedAt).toLocaleString()}
                              </span>
                            </div>
                            {history.note && (
                              <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              By: {history.changedBy?.firstName} {history.changedBy?.lastName}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Admin Notes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5 text-blood-crimson" />
                    <span>Admin Notes ({selectedMessage.adminNotes?.length || 0})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="space-y-3">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Add a note about this message..."
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson resize-none"
                      rows={3}
                    />
                    <CustomButton
                      type="submit"
                      variant="primary"
                      size="sm"
                      loading={addingNote}
                      icon={Plus}
                      disabled={!newNote.trim()}
                    >
                      Add Note
                    </CustomButton>
                  </form>

                  {/* Existing Notes */}
                  <div className="space-y-3">
                    {selectedMessage.adminNotes?.map((note, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-3"
                      >
                        <p className="text-gray-700 mb-2">{note.note}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{note.addedBy?.firstName} {note.addedBy?.lastName}</span>
                          <span>{new Date(note.addedAt).toLocaleString()}</span>
                        </div>
                      </motion.div>
                    ))}
                    {(!selectedMessage.adminNotes || selectedMessage.adminNotes.length === 0) && (
                      <p className="text-gray-500 text-center py-4">No notes added yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Panel */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!selectedMessage.isRead && (
                    <CustomButton
                      variant="outline"
                      icon={Eye}
                      onClick={() => markAsRead(selectedMessage._id)}
                      className="w-full"
                    >
                      Mark as Read
                    </CustomButton>
                  )}
                  <CustomButton
                    variant="outline"
                    icon={Trash2}
                    onClick={() => deleteMessage(selectedMessage._id)}
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Delete Message
                  </CustomButton>
                </CardContent>
              </Card>

              {/* Update Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Update Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedMessage.status}
                      onChange={(e) => updateMessage(selectedMessage._id, { status: e.target.value })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={selectedMessage.priority}
                      onChange={(e) => updateMessage(selectedMessage._id, { priority: e.target.value })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blood-crimson focus:ring-blood-crimson"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-32 section-padding bg-gray-50 min-h-screen">
      <div className="container-custom">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Contact Messages</h1>
          <p className="text-gray-600">Manage and respond to user inquiries</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-r from-slate-500 to-slate-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-100 text-sm">Total Messages</p>
                    <p className="text-3xl font-bold">{stats.total || 0}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-slate-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Pending</p>
                    <p className="text-3xl font-bold">{stats.pending || 0}</p>
                  </div>
                  <Clock3 className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">In Progress</p>
                    <p className="text-3xl font-bold">{stats.inProgress || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Resolved</p>
                    <p className="text-3xl font-bold">{stats.resolved || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Unread</p>
                    <p className="text-3xl font-bold">{stats.unread || 0}</p>
                  </div>
                  <Mail className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Bulk Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <FormInput
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={Search}
                  />
                </div>
                <div className="w-full md:w-48">
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none block w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm focus:border-blood-crimson focus:ring-2 focus:ring-blood-crimson/20 focus:outline-none transition-colors"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="w-full md:w-48">
                  <div className="relative">
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="appearance-none block w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white shadow-sm focus:border-blood-crimson focus:ring-2 focus:ring-blood-crimson/20 focus:outline-none transition-colors"
                    >
                      <option value="all">All Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                    <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
              
              {/* Bulk Actions */}
              {filteredMessages.length > 0 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMessages.length === filteredMessages.length && filteredMessages.length > 0}
                        onChange={selectAllMessages}
                        className="rounded border-gray-300 text-blood-crimson focus:ring-blood-crimson"
                      />
                      <span className="text-sm text-gray-600">
                        Select All ({filteredMessages.length})
                      </span>
                    </label>
                    {selectedMessages.length > 0 && (
                      <span className="text-sm text-gray-500">
                        {selectedMessages.length} selected
                      </span>
                    )}
                  </div>
                  
                  {selectedMessages.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <CustomButton
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMessages([])}
                        className="text-gray-600 border-gray-300 hover:bg-gray-50"
                      >
                        Clear Selection
                      </CustomButton>
                      <CustomButton
                        variant="danger"
                        size="sm"
                        onClick={bulkDeleteMessages}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Delete Selected ({selectedMessages.length})
                      </CustomButton>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Messages List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                All Messages ({filteredMessages.length}
                {filteredMessages.length !== messages.length && ` of ${messages.length}`})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-20 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {messages.length === 0 
                      ? "No messages found." 
                      : "No messages match your current filters."
                    }
                  </p>
                  {messages.length > 0 && filteredMessages.length === 0 && (
                    <CustomButton
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('')
                        setStatusFilter('all')
                        setPriorityFilter('all')
                      }}
                      className="mt-3"
                    >
                      Clear Filters
                    </CustomButton>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((message, index) => {
                    const StatusIcon = getStatusIcon(message.status)
                    const isSelected = selectedMessages.includes(message._id)
                    return (
                      <motion.div
                        key={message._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                          !message.isRead ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-200'
                        } ${isSelected ? 'ring-2 ring-blood-crimson ring-opacity-50' : ''}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex items-center pt-1">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  e.stopPropagation()
                                  toggleMessageSelection(message._id)
                                }}
                                className="rounded border-gray-300 text-blood-crimson focus:ring-blood-crimson"
                              />
                            </div>
                            
                            <div 
                              className="flex-1 cursor-pointer"
                              onClick={() => setSelectedMessage(message)}
                            >
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                                  <span>{message.subject}</span>
                                  {!message.isRead && (
                                    <span className="w-2 h-2 bg-blood-crimson rounded-full"></span>
                                  )}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(message.status)}`}>
                                  <StatusIcon className="h-3 w-3 inline mr-1" />
                                  {message.status}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(message.priority)}`}>
                                  {message.priority}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-2">
                                From: {message.firstName} {message.lastName} ({message.email})
                              </p>
                              <p className="text-gray-700 text-sm line-clamp-2">{message.message}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <div className="text-right text-sm text-gray-500">
                              <p>{new Date(message.createdAt).toLocaleDateString()}</p>
                              <p>{new Date(message.createdAt).toLocaleTimeString()}</p>
                            </div>
                            <CustomButton
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setDeleteConfirm(message)
                              }}
                              className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                            </CustomButton>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Delete Message</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Subject: {deleteConfirm.subject}
                </p>
                <p className="text-sm text-gray-600">
                  From: {deleteConfirm.firstName} {deleteConfirm.lastName}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <CustomButton
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </CustomButton>
                <CustomButton
                  variant="danger"
                  onClick={() => deleteMessage(deleteConfirm._id)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Message
                </CustomButton>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminContactMessages