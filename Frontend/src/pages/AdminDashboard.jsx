"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import {
  Users,
  MessageSquare,
  Calendar,
  Droplets,
  TrendingUp,
  Settings,
  Shield,
  Bell,
  Search,
  Filter,
  Download,
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Plus,
  BarChart3,
  PieChart,
  UserCheck,
  UserX,
  LogOut,
  Heart,
  X,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"
import { Progress } from "../components/ui/Progress"
import CustomButton from "../components/CustomButton"
import { useAuth } from "../hooks/useAuth"
import { authService } from "../services/authService"
import { contactService } from "../services/contactService"
import { donorService } from "../services/donorService"
import { eventService } from "../services/eventService"
import { requestService } from "../services/requestService"

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    totalDonations: 0,
    totalEvents: 0,
    activeUsers: 0,
    pendingMessages: 0,
    completedDonations: 0,
    upcomingEvents: 0
  })
  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loadingData, setLoadingData] = useState(false)

  // Mock data for demonstration
  const mockStats = {
    totalUsers: 1247,
    totalMessages: 89,
    totalDonations: 456,
    totalEvents: 23,
    activeUsers: 892,
    pendingMessages: 12,
    completedDonations: 423,
    upcomingEvents: 5
  }

  const mockRecentActivity = [
    {
      id: 1,
      type: "user_registration",
      message: "New user registered: John Doe",
      time: "2 minutes ago",
      icon: UserCheck,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "contact_message",
      message: "New contact message from Sarah Wilson",
      time: "15 minutes ago",
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      id: 3,
      type: "donation",
      message: "Blood donation completed by Mike Johnson",
      time: "1 hour ago",
      icon: Droplets,
      color: "text-red-600"
    },
    {
      id: 4,
      type: "event",
      message: "New blood drive event scheduled",
      time: "2 hours ago",
      icon: Calendar,
      color: "text-purple-600"
    }
  ]

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/login')
      return
    }

    // Load admin data
    loadAdminData()
  }, [user, navigate])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      
      // Load real data from available services only
      const [usersResponse, messagesResponse] = await Promise.all([
        authService.getAllUsers().catch(() => ({ success: false, data: [] })),
        contactService.getMessages().catch(() => ({ success: false, data: [] }))
      ])

      // Process users data
      const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : 
                       (usersResponse.success && Array.isArray(usersResponse.users) ? usersResponse.users : [])
      setUsers(usersData)

      // Process messages data
      const messagesData = Array.isArray(messagesResponse.data) ? messagesResponse.data : 
                          (messagesResponse.success && Array.isArray(messagesResponse.messages) ? messagesResponse.messages : [])
      setMessages(messagesData)

      // For now, use mock data for services that don't have backend endpoints yet
      const donorsData = [] // Will be real when backend is ready
      const eventsData = [] // Will be real when backend is ready  
      const requestsData = [] // Will be real when backend is ready

      // Calculate real stats
      const now = new Date()
      const realStats = {
        totalUsers: usersData.length,
        totalMessages: messagesData.length,
        totalDonations: donorsData.length > 0 ? donorsData.reduce((sum, donor) => sum + (donor.donationCount || 0), 0) : 156, // Mock until backend ready
        totalEvents: eventsData.length || 8, // Mock until backend ready
        activeUsers: usersData.filter(u => u.isActive !== false).length,
        pendingMessages: messagesData.filter(m => m.status === 'pending').length,
        completedDonations: requestsData.length > 0 ? requestsData.filter(r => r.status === 'completed').length : 142, // Mock until backend ready
        upcomingEvents: eventsData.length > 0 ? eventsData.filter(e => new Date(e.date) > now).length : 3 // Mock until backend ready
      }
      
      setStats(realStats)

      // Create recent activity from real data
      const activity = []
      
      // Add recent users (last 2)
      const recentUsers = usersData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2)
      
      recentUsers.forEach(user => {
        activity.push({
          id: `user_${user._id}`,
          type: "user_registration",
          message: `New user registered: ${user.firstName} ${user.lastName}`,
          time: new Date(user.createdAt).toLocaleDateString(),
          icon: UserCheck,
          color: "text-green-600"
        })
      })

      // Add recent messages (last 2)
      const recentMessages = messagesData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 2)
        
      recentMessages.forEach(msg => {
        activity.push({
          id: `msg_${msg._id}`,
          type: "contact_message",
          message: `New contact message from ${msg.firstName} ${msg.lastName}`,
          time: new Date(msg.createdAt).toLocaleDateString(),
          icon: MessageSquare,
          color: "text-blue-600"
        })
      })

      // Add mock activity for services not yet implemented
      if (activity.length < 4) {
        activity.push({
          id: 'mock_event_1',
          type: "event_created",
          message: `Blood drive event scheduled for Community Center`,
          time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleDateString(), // 2 hours ago
          icon: Calendar,
          color: "text-purple-600"
        })
      }

      if (activity.length < 5) {
        activity.push({
          id: 'mock_request_1',
          type: "blood_request",
          message: `Urgent blood request: O+ blood needed`,
          time: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleDateString(), // 4 hours ago
          icon: Heart,
          color: "text-red-600"
        })
      }

      // Sort by most recent and limit to 6 items
      const sortedActivity = activity
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 6)
        
      setRecentActivity(sortedActivity)
      
    } catch (error) {
      console.error('Error loading admin data:', error)
      // Fall back to mock data if there's a major error
      console.log('Error occurred, using mock data for demonstration')
      setStats(mockStats)
      setRecentActivity(mockRecentActivity)
      setUsers([])
      setMessages([])
    } finally {
      setLoading(false)
    }
  }

  const adminSections = [
    {
      id: "overview",
      name: "Overview",
      icon: BarChart3,
      description: "Dashboard overview and statistics"
    },
    {
      id: "users",
      name: "Users",
      icon: Users,
      description: "Manage registered users"
    },
    {
      id: "donors",
      name: "Donors",
      icon: Heart,
      description: "View and manage blood donors"
    },
    {
      id: "messages",
      name: "Contact Messages",
      icon: MessageSquare,
      description: "View and respond to user inquiries"
    },
    {
      id: "website",
      name: "Website Pages",
      icon: Eye,
      description: "Navigate to main website pages"
    },
    {
      id: "donations",
      name: "Donations",
      icon: Droplets,
      description: "Track and manage blood donations"
    },
    {
      id: "events",
      name: "Events",
      icon: Calendar,
      description: "Organize and manage blood drive events"
    },
    {
      id: "blood-banks",
      name: "Blood Banks",
      icon: Building2,
      description: "Manage blood bank registrations and inventory"
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: TrendingUp,
      description: "View detailed reports and analytics"
    },
    {
      id: "settings",
      name: "Settings",
      icon: Settings,
      description: "System settings and configuration"
    }
  ]

  const websitePages = [
    { name: "Home", path: "/", icon: Activity, description: "Main homepage" },
    { name: "About", path: "/about", icon: Users, description: "About us page" },
    { name: "Find Donors", path: "/find-donors", icon: Search, description: "Find blood donors" },
    { name: "Blood Banks", path: "/blood-banks", icon: MapPin, description: "Blood bank locations" },
    { name: "Events", path: "/events", icon: Calendar, description: "Blood drive events" },
    { name: "Contact", path: "/contact", icon: Mail, description: "Contact us page" },
    { name: "Become Donor", path: "/become-donor", icon: UserCheck, description: "Donor registration" },
    { name: "Request Blood", path: "/request-blood", icon: Droplets, description: "Blood request form" }
  ]

  const quickStats = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      change: "+12%",
      changeType: "positive",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Contact Messages",
      value: stats.totalMessages,
      change: "+8%",
      changeType: "positive",
      icon: MessageSquare,
      color: "bg-green-500"
    },
    {
      title: "Total Donations",
      value: stats.totalDonations,
      change: "+23%",
      changeType: "positive",
      icon: Droplets,
      color: "bg-red-500"
    },
    {
      title: "Active Events",
      value: stats.totalEvents,
      change: "+5%",
      changeType: "positive",
      icon: Calendar,
      color: "bg-purple-500"
    }
  ]

  const renderOverview = () => (
      <div className="space-y-6">
      {/* Quick Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Dashboard Statistics</h2>
          <div className="flex items-center space-x-2">
            {(stats.totalUsers > 0 || stats.totalMessages > 0) ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ✓ Users & Messages: Real Data
              </span>
            ) : null}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              ⚠ Events & Donations: Mock Data
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                      <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>      {/* Admin Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>
            Common administrative tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminSections.slice(1, 5).map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <section.icon className="h-8 w-8 text-gray-600 group-hover:text-blood-crimson mb-2" />
                <h3 className="font-semibold text-gray-900 group-hover:text-blood-crimson">
                  {section.name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{section.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Latest system activities and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const handleUserAction = async (userId, action) => {
    try {
      setLoadingData(true)
      // Here you would make API calls to perform user actions
      console.log(`${action} user ${userId}`)
      // For now, just reload data
      await loadAdminData()
    } catch (error) {
      console.error(`Error ${action} user:`, error)
    } finally {
      setLoadingData(false)
    }
  }

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage registered users and donors ({users.length} total)</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blood-crimson"
            />
          </div>
          <CustomButton variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </CustomButton>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
              <p className="text-gray-600">No registered users in the system yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blood-crimson flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.role === 'admin' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Admin
                                </span>
                              ) : (
                                'User'
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Droplets className="h-3 w-3 mr-1" />
                          {user.bloodType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.city}, {user.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleUserAction(user._id, 'view')}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View User"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleUserAction(user._id, 'edit')}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleUserAction(user._id, user.isActive ? 'deactivate' : 'activate')}
                              className={user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                              title={user.isActive ? 'Deactivate User' : 'Activate User'}
                            >
                              {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const handleMessageAction = async (messageId, action, status = null) => {
    try {
      setLoadingData(true)
      if (action === 'updateStatus' && status) {
        await contactService.updateMessageStatus(messageId, status)
      }
      await loadAdminData()
    } catch (error) {
      console.error(`Error ${action} message:`, error)
    } finally {
      setLoadingData(false)
    }
  }

  const renderWebsitePages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Website Pages</h2>
          <p className="text-gray-600">Navigate to main website pages for testing and preview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {websitePages.map((page) => (
          <Card key={page.path} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blood-crimson rounded-lg">
                  <page.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{page.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{page.description}</p>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={page.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blood-crimson hover:text-blood-deep text-sm font-medium"
                    >
                      Visit Page →
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Quick Website Actions</span>
          </CardTitle>
          <CardDescription>
            Common website management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/"
              target="_blank"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center group"
            >
              <Activity className="h-8 w-8 text-gray-600 group-hover:text-blood-crimson mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 group-hover:text-blood-crimson">
                View Homepage
              </h3>
              <p className="text-sm text-gray-600 mt-1">Check main website</p>
            </Link>
            <Link
              to="/contact"
              target="_blank"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center group"
            >
              <Mail className="h-8 w-8 text-gray-600 group-hover:text-blood-crimson mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 group-hover:text-blood-crimson">
                Test Contact Form
              </h3>
              <p className="text-sm text-gray-600 mt-1">Submit test message</p>
            </Link>
            <Link
              to="/become-donor"
              target="_blank"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center group"
            >
              <UserCheck className="h-8 w-8 text-gray-600 group-hover:text-blood-crimson mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 group-hover:text-blood-crimson">
                Test Registration
              </h3>
              <p className="text-sm text-gray-600 mt-1">Check user signup</p>
            </Link>
            <Link
              to="/find-donors"
              target="_blank"
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors text-center group"
            >
              <Search className="h-8 w-8 text-gray-600 group-hover:text-blood-crimson mx-auto mb-2" />
              <h3 className="font-semibold text-gray-900 group-hover:text-blood-crimson">
                Test Search
              </h3>
              <p className="text-sm text-gray-600 mt-1">Check donor search</p>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Contact Messages</h2>
          <p className="text-gray-600">View and respond to user inquiries ({messages.length} total)</p>
        </div>
        <Link to="/admin/contact-messages">
          <CustomButton variant="primary" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>View All Messages</span>
          </CustomButton>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Messages</h3>
              <p className="text-gray-600">No contact messages received yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messages.slice(0, 10).map((message) => (
                    <tr key={message._id} className={`hover:bg-gray-50 ${!message.isRead ? 'bg-blue-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                              <Mail className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {message.firstName} {message.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{message.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={message.subject}>
                          {message.subject}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate" title={message.message}>
                          {message.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          message.priority === 'high' ? 'bg-red-100 text-red-800' :
                          message.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {message.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          message.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          message.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          message.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {message.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleMessageAction(message._id, 'updateStatus', 'in-progress')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Mark In Progress"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMessageAction(message._id, 'updateStatus', 'resolved')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark Resolved"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/admin/contact-messages`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "users":
        return renderUsers()
      case "donors":
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Donor Management</h3>
                <p className="text-gray-600 mb-4">View and manage all registered blood donors</p>
                <Link to="/admin/donors">
                  <CustomButton variant="primary">
                    View All Donors
                  </CustomButton>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      case "messages":
        return renderMessages()
      case "website":
        return renderWebsitePages()
      case "donations":
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Droplets className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Donation Management</h3>
                <p className="text-gray-600">Track and manage blood donations - Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        )
      case "events":
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Management</h3>
                <p className="text-gray-600">Organize blood drive events - Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        )
      case "blood-banks":
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-blood-crimson mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Blood Bank Management</h3>
                <p className="text-gray-600 mb-4">Manage blood bank registrations, credentials, and inventory</p>
                <Link to="/admin/blood-banks">
                  <CustomButton variant="primary">
                    Open Blood Bank Management
                  </CustomButton>
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      case "analytics":
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics & Reports</h3>
                <p className="text-gray-600">Detailed analytics and reporting - Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        )
      case "settings":
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
                <p className="text-gray-600">Configure system settings - Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return renderOverview()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blood-crimson mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-blood-crimson" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.firstName}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Back to Site
              </Link>
              <Link
                to="/admin/profile"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <Card className="sticky top-8">
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {adminSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === section.id
                          ? "bg-blood-crimson text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <section.icon className="h-4 w-4" />
                      <span className="font-medium">{section.name}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard