import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, Filter, Search, AlertTriangle, CheckCircle, 
  XCircle, Clock, Calendar, Phone, Mail, MapPin, User,
  FileText, Droplets
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import CustomButton from '../components/CustomButton';
import { requestService } from '../services/requestService';

const BloodBankRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    urgency: 'all',
    bloodType: 'all',
    search: ''
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, requests]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching blood bank requests...');
      const response = await requestService.getBloodBankRequests();
      console.log('Response:', response);
      if (response.success) {
        setRequests(response.data);
        console.log('Requests loaded:', response.data.length);
      } else {
        setError(response.message || 'Failed to load requests');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (filters.status !== 'all') {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    if (filters.urgency !== 'all') {
      filtered = filtered.filter(req => req.urgency === filters.urgency);
    }

    if (filters.bloodType !== 'all') {
      filtered = filtered.filter(req => req.bloodType === filters.bloodType);
    }

    if (filters.search) {
      filtered = filtered.filter(req =>
        req.patientName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        req.hospitalName?.toLowerCase().includes(filters.search.toLowerCase()) ||
        req.contactName?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleUpdateStatus = async (requestId, status, note = '') => {
    try {
      setUpdating(true);
      const response = await requestService.updateRequestStatus(requestId, status, note);
      if (response.success) {
        await fetchRequests();
        if (selectedRequest?._id === requestId) {
          setSelectedRequest(response.data);
        }
        alert(`Request ${status} successfully!`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      fulfilled: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      fulfilled: CheckCircle,
      cancelled: XCircle
    };

    const Icon = icons[status] || Clock;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      urgent: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200'
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[urgency] || styles.medium}`}>
        {urgency === 'urgent' && <AlertTriangle className="h-3 w-3" />}
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const urgentCount = requests.filter(r => r.urgency === 'urgent' && r.status === 'pending').length;
  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Blood Requests</h1>
          <p className="text-lg text-gray-600">Manage incoming blood requests from patients and hospitals</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className={urgentCount > 0 ? 'border-red-200 bg-red-50' : ''}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Urgent Requests</p>
                  <p className="text-3xl font-bold text-red-600">{urgentCount}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-transparent"
                />
              </div>

              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filters.urgency}
                onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-transparent"
              >
                <option value="all">All Urgency</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filters.bloodType}
                onChange={(e) => setFilters({ ...filters, bloodType: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-transparent"
              >
                <option value="all">All Blood Types</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <div>
                  <p className="font-semibold">Error loading requests</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blood-crimson"></div>
          </div>
        ) : filteredRequests.length === 0 && !error ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
              <p className="text-gray-600">There are no blood requests matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`hover:shadow-xl transition-shadow ${request.urgency === 'urgent' ? 'border-red-300' : ''}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{request.patientName}</h3>
                          <span className="text-2xl font-bold text-blood-crimson">{request.bloodType}</span>
                          {getUrgencyBadge(request.urgency)}
                          {getStatusBadge(request.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Droplets className="h-4 w-4" />
                            <span>{request.unitsNeeded} units needed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Needed by: {formatDate(request.neededBy)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{request.hospitalName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{request.contactName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{request.contactPhone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{request.contactEmail}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {request.medicalCondition && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-600 font-medium mb-1">Medical Condition:</p>
                        <p className="text-sm text-gray-800">{request.medicalCondition}</p>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {request.status === 'pending' && (
                        <>
                          <CustomButton
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(request._id, 'approved', 'Request approved by blood bank')}
                            loading={updating}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </CustomButton>
                          <CustomButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(request._id, 'rejected', 'Request rejected by blood bank')}
                            loading={updating}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </CustomButton>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <CustomButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateStatus(request._id, 'fulfilled', 'Blood provided to patient')}
                          loading={updating}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark as Fulfilled
                        </CustomButton>
                      )}
                      <CustomButton
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Details
                      </CustomButton>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BloodBankRequests;
