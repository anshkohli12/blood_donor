import { useState, useEffect } from 'react';
import { eventService } from '../services/eventService';
import { Calendar, MapPin, Users, Phone, Mail, CheckCircle, XCircle, Clock, Building } from 'lucide-react';
import { format } from 'date-fns';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching events with status:', statusFilter);
      
      const response = await eventService.getAllEventsAdmin({ 
        status: statusFilter,
        limit: 50 
      });
      
      console.log('API Response:', response);
      
      if (response.success) {
        console.log('Events data:', response.data);
        console.log('Status counts:', response.statusCounts);
        setEvents(response.data);
        setStatusCounts(response.statusCounts || {});
      } else {
        setError('Failed to fetch events');
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      console.error('Error details:', err.response?.data);
      setError(err.message || err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    if (!confirm('Are you sure you want to approve this event?')) {
      return;
    }

    try {
      setActionLoading(true);
      const response = await eventService.approveEvent(eventId);
      
      if (response.success) {
        alert('Event approved successfully!');
        fetchEvents();
      }
    } catch (err) {
      console.error('Error approving event:', err);
      alert(err.message || 'Failed to approve event');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      const response = await eventService.rejectEvent(selectedEvent._id, rejectionReason);
      
      if (response.success) {
        alert('Event rejected successfully');
        setShowRejectModal(false);
        setSelectedEvent(null);
        setRejectionReason('');
        fetchEvents();
      }
    } catch (err) {
      console.error('Error rejecting event:', err);
      alert(err.message || 'Failed to reject event');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (event) => {
    setSelectedEvent(event);
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedEvent(null);
    setRejectionReason('');
  };

  const openDetailModal = (event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEvent(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Management</h1>
          <p className="text-gray-600">Review and manage blood donation events</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap border-b">
            {['all', 'pending', 'approved', 'rejected', 'cancelled', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-6 py-3 font-medium transition-colors ${
                  statusFilter === status
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                {statusCounts[status] && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {statusCounts[status]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">No events found for this status</p>
          </div>
        ) : (
          /* Events List */
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Event Image */}
                  {event.image && (
                    <div 
                      className="lg:w-48 h-48 flex-shrink-0 cursor-pointer"
                      onClick={() => openDetailModal(event)}
                    >
                      <img
                        src={`http://localhost:5000${event.image}`}
                        alt={event.title}
                        className="w-full h-full object-cover rounded-lg hover:opacity-90 transition-opacity"
                      />
                    </div>
                  )}

                  {/* Event Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 
                          className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-red-600 transition-colors"
                          onClick={() => openDetailModal(event)}
                        >
                          {event.title}
                        </h3>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(event.status)}`}>
                          {event.status.toUpperCase()}
                        </span>
                      </div>
                      <button
                        onClick={() => openDetailModal(event)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details →
                      </button>
                    </div>

                    <p className="text-gray-700 mb-4">
                      {event.description?.length > 150 
                        ? `${event.description.substring(0, 150)}...` 
                        : event.description}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Building className="h-4 w-4 mr-2" />
                        <span><strong>Organizer:</strong> {event.organizerName || event.organizer?.name}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span><strong>Start:</strong> {format(new Date(event.date), 'PPp')}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span><strong>End:</strong> {format(new Date(event.endDate), 'PPp')}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span><strong>Location:</strong> {event.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span><strong>Capacity:</strong> {event.registeredCount || 0} / {event.maxCapacity}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span><strong>Phone:</strong> {event.contactPhone}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span><strong>Email:</strong> {event.contactEmail}</span>
                      </div>
                    </div>

                    {event.requirements && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <strong className="text-sm text-gray-700">Requirements:</strong>
                        <p className="text-sm text-gray-600 mt-1">{event.requirements}</p>
                      </div>
                    )}

                    {event.additionalInfo && (
                      <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                        <strong className="text-sm text-gray-700">Additional Info:</strong>
                        <p className="text-sm text-gray-600 mt-1">{event.additionalInfo}</p>
                      </div>
                    )}

                    {event.rejectionReason && (
                      <div className="mt-2 p-3 bg-red-50 rounded-lg">
                        <strong className="text-sm text-red-700">Rejection Reason:</strong>
                        <p className="text-sm text-red-600 mt-1">{event.rejectionReason}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {event.status === 'pending' && (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => handleApprove(event._id)}
                          disabled={actionLoading}
                          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </button>
                        <button
                          onClick={() => openRejectModal(event)}
                          disabled={actionLoading}
                          className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-4xl w-full p-8 my-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold text-gray-900">{selectedEvent.title}</h2>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Event Image */}
              {selectedEvent.image && (
                <img
                  src={`http://localhost:5000${selectedEvent.image}`}
                  alt={selectedEvent.title}
                  className="w-full h-96 object-cover rounded-lg"
                />
              )}

              {/* Status Badge */}
              <div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(selectedEvent.status)}`}>
                  {selectedEvent.status.toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>

              {/* Event Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Event Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Building className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Organizer</p>
                        <p className="font-medium">{selectedEvent.organizerName || selectedEvent.organizer?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium">{format(new Date(selectedEvent.date), 'PPp')}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-medium">{format(new Date(selectedEvent.endDate), 'PPp')}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium">{selectedEvent.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Capacity</p>
                        <p className="font-medium">{selectedEvent.registeredCount || 0} / {selectedEvent.maxCapacity}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{selectedEvent.contactPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{selectedEvent.contactEmail}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {selectedEvent.requirements && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Donor Requirements</h4>
                  <p className="text-gray-700">{selectedEvent.requirements}</p>
                </div>
              )}

              {/* Additional Info */}
              {selectedEvent.additionalInfo && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2">Additional Information</h4>
                  <p className="text-gray-700">{selectedEvent.additionalInfo}</p>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedEvent.rejectionReason && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-700 mb-2">Rejection Reason</h4>
                  <p className="text-red-600">{selectedEvent.rejectionReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedEvent.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      closeDetailModal();
                      handleApprove(selectedEvent._id);
                    }}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Approve Event
                  </button>
                  <button
                    onClick={() => {
                      closeDetailModal();
                      openRejectModal(selectedEvent);
                    }}
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Reject Event
                  </button>
                </div>
              )}

              {/* Close Button */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={closeDetailModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Event</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this event:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Event'}
              </button>
              <button
                onClick={closeRejectModal}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
