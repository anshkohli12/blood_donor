import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService } from '../services/eventService';
import FormInput from '../components/FormInput';
import CustomButton from '../components/CustomButton';
import { Calendar, MapPin, Users, Phone, Mail, FileText, Image as ImageIcon, Clock } from 'lucide-react';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    endDate: '',
    location: '',
    maxCapacity: '',
    contactPhone: '',
    contactEmail: '',
    requirements: '',
    additionalInfo: '',
    coordinates: {
      lat: '',
      lng: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'lat' || name === 'lng') {
      setFormData(prev => ({
        ...prev,
        coordinates: {
          ...prev.coordinates,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate dates
      const startDate = new Date(formData.date);
      const endDate = new Date(formData.endDate);
      const now = new Date();

      if (startDate < now) {
        throw new Error('Event start date must be in the future');
      }

      if (endDate < startDate) {
        throw new Error('Event end date must be after start date');
      }

      // Prepare event data
      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        endDate: formData.endDate,
        location: formData.location,
        maxCapacity: parseInt(formData.maxCapacity),
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        requirements: formData.requirements,
        additionalInfo: formData.additionalInfo
      };

      // Add coordinates if provided
      if (formData.coordinates.lat && formData.coordinates.lng) {
        eventData.coordinates = {
          lat: parseFloat(formData.coordinates.lat),
          lng: parseFloat(formData.coordinates.lng)
        };
      }

      // Call API
      const response = await eventService.createEvent(eventData, imageFile);

      if (response.success) {
        setSuccess('Event created successfully! Awaiting admin approval.');
        
        // Reset form
        setTimeout(() => {
          navigate('/blood-bank-dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 pt-32 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-red-600" />
              Create Blood Donation Event
            </h1>
            <p className="text-gray-600">
              Fill in the details below to create a new blood donation event. Your event will be reviewed by our admin team before being published.
            </p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Event Image Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:border-red-400 transition-colors">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-red-600" />
                Event Image
              </label>
              
              {!imagePreview ? (
                <div className="text-center">
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <ImageIcon className="h-16 w-16 text-gray-400 mb-3" />
                    <span className="text-sm font-medium text-gray-700 mb-1">
                      Click to upload event image
                    </span>
                    <span className="text-xs text-gray-500">
                      PNG, JPG up to 5MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
            <FormInput
              label="Event Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              required
              icon={FileText}
            />

            {/* Description */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="Describe your blood donation event..."
              />
            </div>

            {/* Date & Time */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                Event Schedule
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="datetime-local"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Location */}
            <FormInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter event location"
              required
              icon={MapPin}
            />

            {/* Coordinates (Optional) */}
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                GPS Coordinates (Optional)
              </h3>
              <p className="text-xs text-gray-600 mb-4">Add coordinates to show event location on map</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Latitude"
                  name="lat"
                  type="number"
                  step="any"
                  value={formData.coordinates.lat}
                  onChange={handleChange}
                  placeholder="e.g., 40.7128"
                />
                <FormInput
                  label="Longitude"
                  name="lng"
                  type="number"
                  step="any"
                  value={formData.coordinates.lng}
                  onChange={handleChange}
                  placeholder="e.g., -74.0060"
                />
              </div>
            </div>

            {/* Max Capacity */}
            <FormInput
              label="Maximum Capacity"
              name="maxCapacity"
              type="number"
              value={formData.maxCapacity}
              onChange={handleChange}
              placeholder="Maximum number of donors"
              required
              icon={Users}
              min="1"
            />

            {/* Contact Information */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-600" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput
                  label="Contact Phone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="Enter contact phone"
                  required
                  icon={Phone}
                />
                <FormInput
                  label="Contact Email"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="Enter contact email"
                  required
                  icon={Mail}
                />
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Donor Requirements (Optional)
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="List any specific requirements for donors (e.g., age, health conditions)..."
              />
            </div>

            {/* Additional Info */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Additional Information (Optional)
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="Any additional information about the event..."
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
              <CustomButton
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Event...
                  </span>
                ) : (
                  'Create Event'
                )}
              </CustomButton>
              
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
