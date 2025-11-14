import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const eventService = {
  // PUBLIC API

  // Get all approved events (public)
  async getAllEvents(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.upcoming) params.append('upcoming', 'true');
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await axios.get(`${API_BASE_URL}/events?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error.response?.data || { message: 'Failed to fetch events' };
    }
  },

  // Get single event by ID
  async getEventById(id) {
    try {
      const response = await axios.get(`${API_BASE_URL}/events/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error.response?.data || { message: 'Failed to fetch event' };
    }
  },

  // BLOOD BANK API (Requires Authentication)

  // Create new event (Blood Bank only)
  async createEvent(eventData, imageFile = null) {
    try {
      const token = localStorage.getItem('bloodbankToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      let requestData;
      let headers = {
        'Authorization': `Bearer ${token}`
      };

      // If there's an image file, use FormData
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('data', JSON.stringify(eventData));
        requestData = formData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        requestData = eventData;
        headers['Content-Type'] = 'application/json';
      }

      const response = await axios.post(
        `${API_BASE_URL}/events`,
        requestData,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error.response?.data || { message: 'Failed to create event' };
    }
  },

  // Get events created by logged-in blood bank
  async getMyEvents() {
    try {
      const token = localStorage.getItem('bloodbankToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${API_BASE_URL}/events/my-events/list`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching blood bank events:', error);
      throw error.response?.data || { message: 'Failed to fetch your events' };
    }
  },

  // Update event (Blood Bank - own events only)
  async updateEvent(eventId, eventData, imageFile = null) {
    try {
      const token = localStorage.getItem('bloodbankToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      let requestData;
      let headers = {
        'Authorization': `Bearer ${token}`
      };

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('data', JSON.stringify(eventData));
        requestData = formData;
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        requestData = eventData;
        headers['Content-Type'] = 'application/json';
      }

      const response = await axios.put(
        `${API_BASE_URL}/events/${eventId}`,
        requestData,
        { headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error.response?.data || { message: 'Failed to update event' };
    }
  },

  // Delete event (Blood Bank - own events only)
  async deleteEvent(eventId) {
    try {
      const token = localStorage.getItem('bloodbankToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.delete(
        `${API_BASE_URL}/events/${eventId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error.response?.data || { message: 'Failed to delete event' };
    }
  },

  // USER REGISTRATION API (Requires Authentication)

  // Register for an event
  async registerForEvent(eventId) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Please login to register for events');
      }

      const response = await axios.post(
        `${API_BASE_URL}/events/${eventId}/register`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error.response?.data || { message: 'Failed to register for event' };
    }
  },

  // Unregister from an event
  async unregisterFromEvent(eventId) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.post(
        `${API_BASE_URL}/events/${eventId}/unregister`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error unregistering from event:', error);
      throw error.response?.data || { message: 'Failed to unregister from event' };
    }
  },

  // Get user's registered events
  async getMyRegistrations() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${API_BASE_URL}/events/my-registrations/list`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching registrations:', error);
      throw error.response?.data || { message: 'Failed to fetch your registrations' };
    }
  },

  // Get registered users for a specific event (Blood Bank/Admin only)
  async getEventRegistrations(eventId) {
    try {
      const token = localStorage.getItem('bloodbankToken') || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.get(
        `${API_BASE_URL}/events/${eventId}/registrations`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching event registrations:', error);
      throw error.response?.data || { message: 'Failed to fetch event registrations' };
    }
  },

  // ADMIN API (Requires Admin Authentication)

  // Get all events including pending (Admin only)
  async getAllEventsAdmin(filters = {}) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await axios.get(
        `${API_BASE_URL}/events/admin/all-events?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error fetching all events (admin):', error);
      throw error.response?.data || { message: 'Failed to fetch events' };
    }
  },

  // Approve event (Admin only)
  async approveEvent(eventId) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.put(
        `${API_BASE_URL}/events/${eventId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error approving event:', error);
      throw error.response?.data || { message: 'Failed to approve event' };
    }
  },

  // Reject event (Admin only)
  async rejectEvent(eventId, reason) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await axios.put(
        `${API_BASE_URL}/events/${eventId}/reject`,
        { reason },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error rejecting event:', error);
      throw error.response?.data || { message: 'Failed to reject event' };
    }
  }
};

