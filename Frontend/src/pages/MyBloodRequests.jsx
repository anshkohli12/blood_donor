"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Droplets, Clock, CheckCircle, XCircle, Calendar, MapPin,
  FileText, AlertTriangle, ChevronDown, ChevronUp, Package,
  ArrowLeft, RefreshCw, Hospital
} from "lucide-react"
import { Card, CardContent } from "../components/ui/Card"
import CustomButton from "../components/CustomButton"
import { requestService } from "../services/requestService"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"

const STATUS_CONFIG = {
  pending:   { label: "Pending",   icon: Clock,       color: "bg-yellow-100 text-yellow-800 border-yellow-300", dot: "bg-yellow-400", emoji: "🟡" },
  approved:  { label: "Approved",  icon: CheckCircle, color: "bg-green-100 text-green-800 border-green-300",   dot: "bg-green-500",  emoji: "🟢" },
  rejected:  { label: "Rejected",  icon: XCircle,     color: "bg-red-100 text-red-800 border-red-300",         dot: "bg-red-500",    emoji: "🔴" },
  scheduled: { label: "Scheduled", icon: Calendar,    color: "bg-blue-100 text-blue-800 border-blue-300",      dot: "bg-blue-500",   emoji: "🔵" },
  completed: { label: "Completed", icon: Package,     color: "bg-gray-100 text-gray-800 border-gray-300",      dot: "bg-gray-600",   emoji: "⚫" },
  fulfilled: { label: "Completed", icon: Package,     color: "bg-gray-100 text-gray-800 border-gray-300",      dot: "bg-gray-600",   emoji: "⚫" },
  cancelled: { label: "Cancelled", icon: XCircle,     color: "bg-gray-100 text-gray-500 border-gray-300",      dot: "bg-gray-400",   emoji: "⚪" },
}

const MyBloodRequests = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (isAuthenticated) fetchMyRequests()
  }, [isAuthenticated])

  const fetchMyRequests = async () => {
    try {
      setLoading(true)
      const response = await requestService.getMyRequests()
      if (response.success) setRequests(response.data)
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRequests = filter === "all"
    ? requests
    : requests.filter(r => r.status === filter)

  const formatDate = (d) => {
    if (!d) return "—"
    return new Date(d).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  const getStatusChip = (status) => {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    const Icon = cfg.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.color} transition-all`}>
        <Icon className="h-3.5 w-3.5" />
        {cfg.label}
      </span>
    )
  }

  // --- LOGIN GUARD ---
  if (!isAuthenticated) {
    return (
      <div className="pt-20 section-padding min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Login Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your requests.</p>
          <CustomButton variant="primary" onClick={() => navigate("/login")}>Login Now</CustomButton>
        </div>
      </div>
    )
  }

  // --- LOADING ---
  if (loading) {
    return (
      <div className="pt-28 section-padding min-h-screen">
        <div className="container-custom max-w-5xl">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-28 pb-12 section-padding min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-montserrat text-gradient">
                My Blood Requests
              </h1>
              <p className="text-gray-600 mt-1">{requests.length} total requests</p>
            </div>
            <div className="flex gap-3">
              <CustomButton variant="outline" size="sm" icon={RefreshCw} onClick={fetchMyRequests}>
                Refresh
              </CustomButton>
              <CustomButton variant="primary" size="sm" onClick={() => navigate("/request-blood")}>
                + New Request
              </CustomButton>
            </div>
          </div>
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {[
            { key: "all", label: "All" },
            { key: "pending", label: "🟡 Pending" },
            { key: "approved", label: "🟢 Approved" },
            { key: "rejected", label: "🔴 Rejected" },
            { key: "scheduled", label: "🔵 Scheduled" },
            { key: "completed", label: "⚫ Completed" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-blood-crimson text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span className="ml-1.5 text-xs opacity-75">
                  ({requests.filter(r => tab.key === "completed" ? (r.status === "completed" || r.status === "fulfilled") : r.status === tab.key).length})
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requests Found</h3>
            <p className="text-gray-500 mb-6">
              {filter === "all"
                ? "You haven't made any blood requests yet."
                : `No ${filter} requests found.`}
            </p>
            <CustomButton variant="primary" onClick={() => navigate("/request-blood")}>
              Request Blood Now
            </CustomButton>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((req, idx) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Main Row */}
                  <CardContent
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === req._id ? null : req._id)}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Blood Type Badge */}
                        <div className="w-14 h-14 bg-gradient-to-br from-blood-crimson to-red-700 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-md">
                          <Droplets className="h-4 w-4 text-white/80" />
                          <span className="text-white font-bold text-sm">{req.bloodType}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-sm font-bold text-blood-crimson">{req.requestId || req._id?.slice(-8)}</span>
                            {getStatusChip(req.status)}
                          </div>
                          <p className="text-gray-800 font-medium mt-1 truncate">{req.patientName}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Droplets className="h-3 w-3" /> {req.unitsNeeded} units
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {formatDate(req.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Expand Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          Updated {formatDate(req.updatedAt)}
                        </span>
                        {expandedId === req._id
                          ? <ChevronUp className="h-5 w-5 text-gray-400" />
                          : <ChevronDown className="h-5 w-5 text-gray-400" />}
                      </div>
                    </div>
                  </CardContent>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedId === req._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-6 pt-2 border-t border-gray-100">
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Left: Timeline */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blood-crimson" />
                                Request Timeline
                              </h4>
                              <div className="relative pl-6">
                                {(req.statusHistory || [{ status: "pending", timestamp: req.createdAt, note: "Request submitted" }]).map((entry, i, arr) => {
                                  const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending
                                  const isLast = i === arr.length - 1
                                  return (
                                    <div key={i} className="relative pb-6 last:pb-0">
                                      {/* Vertical line */}
                                      {!isLast && (
                                        <div className="absolute left-[-14px] top-6 bottom-0 w-0.5 bg-gray-200" />
                                      )}
                                      {/* Dot */}
                                      <div className={`absolute left-[-18px] top-1.5 w-3 h-3 rounded-full ${cfg.dot} ring-2 ring-white shadow`} />
                                      {/* Content */}
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-sm text-gray-900">
                                            {cfg.label}
                                          </span>
                                          {isLast && (
                                            <span className="text-[10px] bg-blood-crimson/10 text-blood-crimson px-2 py-0.5 rounded-full font-medium">
                                              Current
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          {formatDate(entry.timestamp)}
                                        </p>
                                        {entry.note && (
                                          <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded px-2 py-1">
                                            {entry.note}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>

                            {/* Right: Details */}
                            <div className="space-y-4">
                              {/* Appointment Details (if approved/scheduled) */}
                              {(req.status === "approved" || req.status === "scheduled") && req.appointmentDate && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200"
                                >
                                  <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                                    <Hospital className="h-4 w-4" />
                                    Appointment Details
                                  </h5>
                                  <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                      <span className="text-green-600 text-xs">Date</span>
                                      <p className="font-medium text-gray-900">{req.appointmentDate}</p>
                                    </div>
                                    <div>
                                      <span className="text-green-600 text-xs">Time</span>
                                      <p className="font-medium text-gray-900">{req.appointmentTime}</p>
                                    </div>
                                    {req.appointmentRoom && (
                                      <div>
                                        <span className="text-green-600 text-xs">Room/Counter</span>
                                        <p className="font-medium text-gray-900">{req.appointmentRoom}</p>
                                      </div>
                                    )}
                                  </div>
                                  {req.instructions && (
                                    <div className="mt-3 pt-3 border-t border-green-200">
                                      <span className="text-green-600 text-xs">Instructions</span>
                                      <p className="text-sm text-gray-800 mt-1">{req.instructions}</p>
                                    </div>
                                  )}
                                </motion.div>
                              )}

                              {/* Rejection Reason */}
                              {req.status === "rejected" && req.rejectionReason && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="bg-red-50 rounded-xl p-4 border border-red-200"
                                >
                                  <h5 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                    <XCircle className="h-4 w-4" />
                                    Rejection Reason
                                  </h5>
                                  <p className="text-sm text-red-700">{req.rejectionReason}</p>
                                </motion.div>
                              )}

                              {/* Request Details */}
                              <div className="bg-gray-50 rounded-xl p-4">
                                <h5 className="font-semibold text-gray-900 mb-3 text-sm">Request Details</h5>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-gray-500 text-xs">Blood Type</span>
                                    <p className="font-bold text-blood-crimson">{req.bloodType}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-xs">Units</span>
                                    <p className="font-medium">{req.unitsNeeded}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-xs">Emergency</span>
                                    <p className="font-medium capitalize">{req.emergencyLevel || req.urgency || "—"}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-xs">Request Type</span>
                                    <p className="font-medium capitalize">{req.requestType || "—"}</p>
                                  </div>
                                  {req.hospitalName && (
                                    <div className="col-span-2">
                                      <span className="text-gray-500 text-xs">Hospital</span>
                                      <p className="font-medium">{req.hospitalName}</p>
                                    </div>
                                  )}
                                  {req.location && (
                                    <div className="col-span-2">
                                      <span className="text-gray-500 text-xs">Location</span>
                                      <p className="font-medium">{req.location}</p>
                                    </div>
                                  )}
                                  {req.medicalNote && (
                                    <div className="col-span-2">
                                      <span className="text-gray-500 text-xs">Medical Note</span>
                                      <p className="font-medium">{req.medicalNote}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBloodRequests
