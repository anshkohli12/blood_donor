import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, User, Phone, Mail, Droplet, MapPin, Calendar, 
  ArrowLeft, Download, Search, Filter, CheckCircle, Clock 
} from 'lucide-react';
import { eventService } from '../services/eventService';
import CustomButton from '../components/CustomButton';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const EventRegistrations = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eventData, setEventData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBloodType, setFilterBloodType] = useState('all');
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);

  useEffect(() => {
    fetchEventRegistrations();
  }, [eventId]);

  useEffect(() => {
    if (eventData && eventData.registrations) {
      let filtered = eventData.registrations;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(reg => {
          const user = reg.userId;
          if (!user) return false;
          
          const searchLower = searchTerm.toLowerCase();
          return (
            user.firstName?.toLowerCase().includes(searchLower) ||
            user.lastName?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.phone?.includes(searchTerm)
          );
        });
      }

      // Filter by blood type
      if (filterBloodType !== 'all') {
        filtered = filtered.filter(reg => 
          reg.userId?.bloodType === filterBloodType
        );
      }

      setFilteredRegistrations(filtered);
    }
  }, [eventData, searchTerm, filterBloodType]);

  const fetchEventRegistrations = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await eventService.getEventRegistrations(eventId);
      
      if (response.success) {
        setEventData(response.data);
        setFilteredRegistrations(response.data.registrations || []);
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError(err.message || 'Failed to load event registrations');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!eventData || !eventData.registrations) return;

    const headers = ['Name', 'Email', 'Phone', 'Blood Type', 'City', 'State', 'Status', 'Registered At'];
    const rows = eventData.registrations.map(reg => {
      const user = reg.userId;
      return [
        `${user.firstName} ${user.lastName}`,
        user.email,
        user.phone || 'N/A',
        user.bloodType,
        user.city || 'N/A',
        user.state || 'N/A',
        reg.status,
        new Date(reg.registeredAt).toLocaleDateString()
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventData.eventTitle.replace(/\s+/g, '_')}_registrations.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'O+': 'bg-red-100 text-red-700',
      'O-': 'bg-red-200 text-red-800',
      'A+': 'bg-blue-100 text-blue-700',
      'A-': 'bg-blue-200 text-blue-800',
      'B+': 'bg-green-100 text-green-700',
      'B-': 'bg-green-200 text-green-800',
      'AB+': 'bg-purple-100 text-purple-700',
      'AB-': 'bg-purple-200 text-purple-800',
    };
    return colors[bloodType] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      confirmed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
      attended: { color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-700', icon: Clock },
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-700', icon: Clock };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blood-crimson mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registrations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <Users className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Registrations</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <CustomButton variant="primary" onClick={() => navigate(-1)}>
              Go Back
            </CustomButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-blood-crimson transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Events
          </button>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Registrations</h1>
              <p className="text-xl text-gray-600">{eventData?.eventTitle}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Registrations</p>
                <p className="text-3xl font-bold text-blood-crimson">
                  {eventData?.registeredCount} / {eventData?.maxCapacity}
                </p>
              </div>
              <CustomButton 
                variant="primary"
                onClick={exportToCSV}
                disabled={!eventData?.registrations?.length}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </CustomButton>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-transparent"
                />
              </div>

              {/* Blood Type Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={filterBloodType}
                  onChange={(e) => setFilterBloodType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-transparent appearance-none cursor-pointer"
                >
                  <option value="all">All Blood Types</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span>Showing {filteredRegistrations.length} of {eventData?.registeredCount} registrations</span>
            </div>
          </CardContent>
        </Card>

        {/* Registrations List */}
        {filteredRegistrations.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Registrations Found</h3>
              <p className="text-gray-600">
                {searchTerm || filterBloodType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No one has registered for this event yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRegistrations.map((registration, index) => {
              const user = registration.userId;
              if (!user) return null;

              return (
                <motion.div
                  key={registration._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex items-center justify-center w-12 h-12 bg-blood-crimson/10 rounded-full flex-shrink-0">
                            <User className="h-6 w-6 text-blood-crimson" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {user.firstName} {user.lastName}
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              
                              {user.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 flex-shrink-0" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                              
                              {user.city && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 flex-shrink-0" />
                                  <span>{user.city}, {user.state}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 flex-shrink-0" />
                                <span>{formatDate(registration.registeredAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Blood Type & Status */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Droplet className="h-4 w-4 text-blood-crimson" />
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getBloodTypeColor(user.bloodType)}`}>
                              {user.bloodType}
                            </span>
                          </div>
                          
                          {getStatusBadge(registration.status)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegistrations;
