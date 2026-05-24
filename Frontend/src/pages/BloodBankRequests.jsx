"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package, Search, AlertTriangle, CheckCircle, XCircle, Clock,
  Calendar, Phone, Mail, MapPin, User, FileText, Droplets,
  X, Hospital, Eye, Download
} from "lucide-react"
import { Card, CardContent } from "../components/ui/Card"
import CustomButton from "../components/CustomButton"
import { requestService } from "../services/requestService"

const TABS = [
  { key: "pending", label: "Incoming", icon: Clock, color: "text-yellow-600" },
  { key: "approved", label: "Approved", icon: CheckCircle, color: "text-green-600" },
  { key: "scheduled", label: "Scheduled", icon: Calendar, color: "text-blue-600" },
  { key: "rejected", label: "Rejected", icon: XCircle, color: "text-red-600" },
  { key: "completed", label: "Completed", icon: Package, color: "text-gray-600" },
]

const BloodBankRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("pending")
  const [searchQuery, setSearchQuery] = useState("")
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(null)

  // Modal states
  const [approveModal, setApproveModal] = useState(null)
  const [rejectModal, setRejectModal] = useState(null)
  const [scheduleModal, setScheduleModal] = useState(null)
  const [detailModal, setDetailModal] = useState(null)

  // Approve form
  const [approveForm, setApproveForm] = useState({
    appointmentDate: "", appointmentTime: "", appointmentRoom: "", instructions: ""
  })

  // Reject form
  const [rejectReason, setRejectReason] = useState("")

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    appointmentDate: "", appointmentTime: "", appointmentRoom: "", instructions: ""
  })

  useEffect(() => { fetchRequests() }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await requestService.getBloodBankRequests()
      if (response.success) setRequests(response.data)
      else setError(response.message || "Failed to load requests")
    } catch (error) {
      console.error("Error fetching requests:", error)
      setError(error.response?.data?.message || error.message || "Failed to load requests")
    } finally {
      setLoading(false)
    }
  }

  // Filter by tab + search
  const filteredRequests = requests
    .filter(r => {
      if (activeTab === "completed") return r.status === "completed" || r.status === "fulfilled"
      return r.status === activeTab
    })
    .filter(r => {
      if (!searchQuery) return true
      const q = searchQuery.toLowerCase()
      return (
        r.patientName?.toLowerCase().includes(q) ||
        r.hospitalName?.toLowerCase().includes(q) ||
        r.contactName?.toLowerCase().includes(q) ||
        r.bloodType?.toLowerCase().includes(q) ||
        r.requestId?.toLowerCase().includes(q)
      )
    })

  const tabCounts = {
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    scheduled: requests.filter(r => r.status === "scheduled").length,
    rejected: requests.filter(r => r.status === "rejected").length,
    completed: requests.filter(r => r.status === "completed" || r.status === "fulfilled").length,
  }

  // --- APPROVE ---
  const handleApprove = async () => {
    if (!approveModal) return
    try {
      setUpdating(true)
      await requestService.updateRequestStatus(approveModal._id, {
        status: "approved",
        note: "Request approved by blood bank",
        ...approveForm
      })
      await fetchRequests()
      setApproveModal(null)
      setApproveForm({ appointmentDate: "", appointmentTime: "", appointmentRoom: "", instructions: "" })
    } catch (err) {
      console.error("Error approving:", err)
      alert("Failed to approve request")
    } finally {
      setUpdating(false)
    }
  }

  // --- REJECT ---
  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return
    try {
      setUpdating(true)
      await requestService.updateRequestStatus(rejectModal._id, {
        status: "rejected",
        rejectionReason: rejectReason,
        note: rejectReason
      })
      await fetchRequests()
      setRejectModal(null)
      setRejectReason("")
    } catch (err) {
      console.error("Error rejecting:", err)
      alert("Failed to reject request")
    } finally {
      setUpdating(false)
    }
  }

  // --- SCHEDULE ---
  const handleSchedule = async () => {
    if (!scheduleModal || !scheduleForm.appointmentDate || !scheduleForm.appointmentTime) return
    try {
      setUpdating(true)
      await requestService.scheduleVisit(scheduleModal._id, scheduleForm)
      await fetchRequests()
      setScheduleModal(null)
      setScheduleForm({ appointmentDate: "", appointmentTime: "", appointmentRoom: "", instructions: "" })
    } catch (err) {
      console.error("Error scheduling:", err)
      alert("Failed to schedule visit")
    } finally {
      setUpdating(false)
    }
  }

  // --- COMPLETE ---
  const handleComplete = async (requestId) => {
    if (!confirm("Mark this request as completed?")) return
    try {
      setUpdating(true)
      await requestService.updateRequestStatus(requestId, {
        status: "completed",
        note: "Blood provided to patient"
      })
      await fetchRequests()
    } catch (err) {
      console.error("Error completing:", err)
      alert("Failed to complete request")
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    })
  }

  const getUrgencyBadge = (urgency) => {
    const styles = {
      critical: "bg-red-100 text-red-800 border-red-200",
      urgent: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200",
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[urgency] || styles.medium}`}>
        {(urgency === "urgent" || urgency === "critical") && <AlertTriangle className="h-3 w-3" />}
        {(urgency || "medium").charAt(0).toUpperCase() + (urgency || "medium").slice(1)}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Blood Requests</h1>
          <p className="text-lg text-gray-600">Manage incoming blood requests from patients and hospitals</p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {TABS.map(tab => {
            const Icon = tab.icon
            const count = tabCounts[tab.key]
            return (
              <motion.button
                key={tab.key}
                whileHover={{ y: -2 }}
                onClick={() => setActiveTab(tab.key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  activeTab === tab.key
                    ? "border-blood-crimson bg-white shadow-lg"
                    : "border-transparent bg-white/70 hover:bg-white hover:shadow"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Icon className={`h-5 w-5 ${tab.color}`} />
                  <span className="text-2xl font-bold text-gray-900">{count}</span>
                </div>
                <p className="text-xs font-medium text-gray-600">{tab.label}</p>
              </motion.button>
            )
          })}
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by patient name, hospital, blood type, request ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blood-crimson focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4 flex items-center gap-3 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Error loading requests</p>
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Requests List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blood-crimson" />
          </div>
        ) : filteredRequests.length === 0 && !error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No {activeTab} Requests</h3>
              <p className="text-gray-600">There are no {activeTab} blood requests at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className={`hover:shadow-xl transition-shadow ${
                  (request.urgency === "urgent" || request.urgency === "critical") ? "border-l-4 border-l-red-500" : ""
                }`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className="font-mono text-sm font-bold text-blood-crimson">
                            {request.requestId || request._id?.slice(-8)}
                          </span>
                          <span className="text-2xl font-bold text-blood-crimson">{request.bloodType}</span>
                          {getUrgencyBadge(request.urgency || request.emergencyLevel)}
                          {request.requestType && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                              {request.requestType === "self" ? "Self Request" : "For Others"}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate"><b>Patient:</b> {request.patientName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4 flex-shrink-0" />
                            <span>{request.unitsNeeded} units needed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span>Needed by: {formatDate(request.neededBy || request.requiredBeforeDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate"><b>Requester:</b> {request.requesterName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 flex-shrink-0" />
                            <span>{request.contactPhone || "—"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{request.requesterEmail || request.contactEmail || "—"}</span>
                          </div>
                          {request.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{request.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {(request.medicalCondition || request.medicalNote) && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-600 font-medium mb-1">Medical Note:</p>
                        <p className="text-sm text-gray-800">{request.medicalNote || request.medicalCondition}</p>
                      </div>
                    )}

                    {/* Prescription Link */}
                    {request.prescriptionPath && (
                      <div className="mb-4">
                        <a
                          href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/${request.prescriptionPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg"
                        >
                          <Download className="h-4 w-4" />
                          View Prescription
                        </a>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {request.status === "pending" && (
                        <>
                          <CustomButton
                            variant="primary"
                            size="sm"
                            onClick={() => { setApproveModal(request); setApproveForm({ appointmentDate: "", appointmentTime: "", appointmentRoom: "", instructions: "" }) }}
                            disabled={updating}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </CustomButton>
                          <CustomButton
                            variant="outline"
                            size="sm"
                            onClick={() => { setRejectModal(request); setRejectReason("") }}
                            disabled={updating}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </CustomButton>
                          <CustomButton
                            variant="outline"
                            size="sm"
                            onClick={() => { setScheduleModal(request); setScheduleForm({ appointmentDate: "", appointmentTime: "", appointmentRoom: "", instructions: "" }) }}
                            disabled={updating}
                          >
                            <Calendar className="h-4 w-4 mr-1" /> Schedule Visit
                          </CustomButton>
                        </>
                      )}
                      {(request.status === "approved" || request.status === "scheduled") && (
                        <>
                          <CustomButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleComplete(request._id)}
                            loading={updating}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Mark Completed
                          </CustomButton>
                          {request.status === "approved" && (
                            <CustomButton
                              variant="outline"
                              size="sm"
                              onClick={() => { setScheduleModal(request); setScheduleForm({ appointmentDate: "", appointmentTime: "", appointmentRoom: "", instructions: "" }) }}
                              disabled={updating}
                            >
                              <Calendar className="h-4 w-4 mr-1" /> Schedule Visit
                            </CustomButton>
                          )}
                        </>
                      )}
                      <CustomButton
                        variant="outline"
                        size="sm"
                        onClick={() => setDetailModal(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Details
                      </CustomButton>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* === APPROVE MODAL === */}
      <AnimatePresence>
        {approveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setApproveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-6 w-6" /> Approve Request
                  </h3>
                  <button onClick={() => setApproveModal(null)} className="p-1 hover:bg-green-100 rounded-lg">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Approving request for <b>{approveModal.patientName}</b> — {approveModal.bloodType} ({approveModal.unitsNeeded} units)
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
                    <input
                      type="date"
                      value={approveForm.appointmentDate}
                      onChange={e => setApproveForm({ ...approveForm, appointmentDate: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Time</label>
                    <input
                      type="time"
                      value={approveForm.appointmentTime}
                      onChange={e => setApproveForm({ ...approveForm, appointmentTime: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room / Counter</label>
                  <input
                    type="text"
                    placeholder="e.g., Room 3, Counter B"
                    value={approveForm.appointmentRoom}
                    onChange={e => setApproveForm({ ...approveForm, appointmentRoom: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Any special instructions for the patient..."
                    value={approveForm.instructions}
                    onChange={e => setApproveForm({ ...approveForm, instructions: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <CustomButton variant="outline" onClick={() => setApproveModal(null)} className="flex-1">Cancel</CustomButton>
                  <CustomButton variant="primary" onClick={handleApprove} loading={updating} className="flex-1 !bg-green-600 hover:!bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-1" /> Approve Request
                  </CustomButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === REJECT MODAL === */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setRejectModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b bg-gradient-to-r from-red-50 to-rose-50 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-red-800 flex items-center gap-2">
                    <XCircle className="h-6 w-6" /> Reject Request
                  </h3>
                  <button onClick={() => setRejectModal(null)} className="p-1 hover:bg-red-100 rounded-lg">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Rejecting request for <b>{rejectModal.patientName}</b>
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectReason}
                    onChange={e => setRejectReason(e.target.value)}
                    placeholder="Please provide a reason for rejection..."
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 py-2 px-3"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Blood unavailable", "Invalid documents", "Capacity full", "Patient ineligible"].map(reason => (
                    <button
                      key={reason}
                      onClick={() => setRejectReason(reason)}
                      className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-full hover:bg-red-100 transition-colors border border-red-200"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 pt-2">
                  <CustomButton variant="outline" onClick={() => setRejectModal(null)} className="flex-1">Cancel</CustomButton>
                  <CustomButton
                    variant="primary"
                    onClick={handleReject}
                    loading={updating}
                    disabled={!rejectReason.trim()}
                    className="flex-1 !bg-red-600 hover:!bg-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-1" /> Reject Request
                  </CustomButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === SCHEDULE MODAL === */}
      <AnimatePresence>
        {scheduleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setScheduleModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-blue-800 flex items-center gap-2">
                    <Calendar className="h-6 w-6" /> Schedule Visit
                  </h3>
                  <button onClick={() => setScheduleModal(null)} className="p-1 hover:bg-blue-100 rounded-lg">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Schedule a visit for <b>{scheduleModal.patientName}</b>
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={scheduleForm.appointmentDate}
                      onChange={e => setScheduleForm({ ...scheduleForm, appointmentDate: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={scheduleForm.appointmentTime}
                      onChange={e => setScheduleForm({ ...scheduleForm, appointmentTime: e.target.value })}
                      className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room / Counter</label>
                  <input
                    type="text"
                    placeholder="e.g., Room 3, Counter B"
                    value={scheduleForm.appointmentRoom}
                    onChange={e => setScheduleForm({ ...scheduleForm, appointmentRoom: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Any special instructions..."
                    value={scheduleForm.instructions}
                    onChange={e => setScheduleForm({ ...scheduleForm, instructions: e.target.value })}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <CustomButton variant="outline" onClick={() => setScheduleModal(null)} className="flex-1">Cancel</CustomButton>
                  <CustomButton
                    variant="primary"
                    onClick={handleSchedule}
                    loading={updating}
                    disabled={!scheduleForm.appointmentDate || !scheduleForm.appointmentTime}
                    className="flex-1 !bg-blue-600 hover:!bg-blue-700"
                  >
                    <Calendar className="h-4 w-4 mr-1" /> Schedule Visit
                  </CustomButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === DETAIL MODAL === */}
      <AnimatePresence>
        {detailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDetailModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b bg-gradient-to-r from-gray-50 to-red-50 rounded-t-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
                  <p className="text-sm text-gray-600 font-mono">{detailModal.requestId || detailModal._id}</p>
                </div>
                <button onClick={() => setDetailModal(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500">Patient</span><p className="font-semibold">{detailModal.patientName}</p></div>
                  <div><span className="text-gray-500">Blood Type</span><p className="font-bold text-blood-crimson text-lg">{detailModal.bloodType}</p></div>
                  <div><span className="text-gray-500">Units</span><p className="font-semibold">{detailModal.unitsNeeded}</p></div>
                  <div><span className="text-gray-500">Urgency</span><p className="font-semibold capitalize">{detailModal.urgency || detailModal.emergencyLevel}</p></div>
                  <div><span className="text-gray-500">Requester</span><p className="font-semibold">{detailModal.requesterName}</p></div>
                  <div><span className="text-gray-500">Email</span><p className="font-semibold truncate">{detailModal.requesterEmail}</p></div>
                  <div><span className="text-gray-500">Phone</span><p className="font-semibold">{detailModal.contactPhone || "—"}</p></div>
                  <div><span className="text-gray-500">Location</span><p className="font-semibold">{detailModal.location || "—"}</p></div>
                  <div><span className="text-gray-500">Submitted</span><p className="font-semibold">{formatDate(detailModal.createdAt)}</p></div>
                  {detailModal.patientAge && <div><span className="text-gray-500">Age</span><p className="font-semibold">{detailModal.patientAge}</p></div>}
                  {detailModal.patientGender && <div><span className="text-gray-500">Gender</span><p className="font-semibold capitalize">{detailModal.patientGender}</p></div>}
                </div>

                {(detailModal.medicalNote || detailModal.medicalCondition) && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Medical Note</p>
                    <p className="text-sm text-gray-800">{detailModal.medicalNote || detailModal.medicalCondition}</p>
                  </div>
                )}

                {/* Status History */}
                {detailModal.statusHistory?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Status History</h4>
                    <div className="space-y-2">
                      {detailModal.statusHistory.map((entry, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            entry.status === "pending" ? "bg-yellow-400" :
                            entry.status === "approved" ? "bg-green-500" :
                            entry.status === "rejected" ? "bg-red-500" :
                            entry.status === "scheduled" ? "bg-blue-500" : "bg-gray-500"
                          }`} />
                          <span className="font-medium capitalize">{entry.status}</span>
                          <span className="text-gray-400">—</span>
                          <span className="text-gray-500">{formatDate(entry.timestamp)}</span>
                          {entry.note && <span className="text-gray-600 italic">({entry.note})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BloodBankRequests
