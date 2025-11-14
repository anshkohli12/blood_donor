import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, Mail, Calendar, CheckCircle, Clock, 
  XCircle, AlertCircle, Search, ArrowLeft, Send 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import CustomButton from '../components/CustomButton';
import { contactService } from '../services/contactService';

const MyMessages = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await contactService.getMyMessages(email);
      
      if (response.success) {
        setMessages(response.data);
        setSearched(true);
        
        if (response.data.length === 0) {
          setError('No messages found for this email address');
        }
      }
    } catch (err) {
      setError('Failed to fetch messages. Please try again.');
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock, text: 'Pending' },
      'in-progress': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: AlertCircle, text: 'In Progress' },
      'resolved': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, text: 'Resolved' },
      'closed': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle, text: 'Closed' }
    };
    
    const config = statusConfig[status] || statusConfig['pending'];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'low': 'bg-gray-100 text-gray-700',
      'medium': 'bg-blue-100 text-blue-700',
      'high': 'bg-orange-100 text-orange-700',
      'urgent': 'bg-red-100 text-red-700'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || colors['medium']}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
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

  if (selectedMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 pt-28 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedMessage(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-blood-crimson transition-colors mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Messages
          </button>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">{selectedMessage.subject}</CardTitle>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedMessage.status)}
                    {getPriorityBadge(selectedMessage.priority)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Original Message */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Your Message</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedMessage.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {selectedMessage.email}
                  </span>
                </div>
              </div>

              {/* Admin Response */}
              {selectedMessage.adminResponse?.message && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Send className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-900">Response from Support Team</h3>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap mb-3">{selectedMessage.adminResponse.message}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {selectedMessage.adminResponse.respondedBy?.firstName} {selectedMessage.adminResponse.respondedBy?.lastName}
                    </span>
                    <span>{formatDate(selectedMessage.adminResponse.respondedAt)}</span>
                  </div>
                </motion.div>
              )}

              {/* Status History */}
              {selectedMessage.statusHistory && selectedMessage.statusHistory.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Status Updates</h3>
                  <div className="space-y-3">
                    {selectedMessage.statusHistory.map((history, index) => (
                      <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0">
                        <div className={`mt-1 p-1.5 rounded-full ${
                          history.status === 'resolved' ? 'bg-green-100' :
                          history.status === 'in-progress' ? 'bg-blue-100' :
                          history.status === 'closed' ? 'bg-gray-100' :
                          'bg-yellow-100'
                        }`}>
                          {history.status === 'resolved' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
                           history.status === 'in-progress' ? <Clock className="h-4 w-4 text-blue-600" /> :
                           history.status === 'closed' ? <XCircle className="h-4 w-4 text-gray-600" /> :
                           <AlertCircle className="h-4 w-4 text-yellow-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900 capitalize">{history.status.replace('-', ' ')}</span>
                            <span className="text-xs text-gray-500">{formatDate(history.changedAt)}</span>
                          </div>
                          {history.note && <p className="text-sm text-gray-600 mt-1">{history.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedMessage.adminResponse?.message && selectedMessage.status !== 'resolved' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-blue-800 font-medium">We're reviewing your message</p>
                  <p className="text-blue-600 text-sm mt-1">You'll receive a response here soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 pt-28 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">My Messages</h1>
          <p className="text-lg text-gray-600">Check the status of your contact messages and view responses</p>
        </motion.div>

        {!searched ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-blood-crimson" />
                  Find Your Messages
                </CardTitle>
                <CardDescription>
                  Enter the email address you used to contact us
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                      }}
                      placeholder="your.email@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blood-crimson focus:border-transparent"
                      required
                    />
                  </div>
                  
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
                      {error}
                    </div>
                  )}

                  <CustomButton
                    type="submit"
                    variant="primary"
                    className="w-full"
                    loading={loading}
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Search Messages
                  </CustomButton>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600">
                  Showing messages for: <span className="font-semibold text-gray-900">{email}</span>
                </p>
                <p className="text-sm text-gray-500">{messages.length} message(s) found</p>
              </div>
              <CustomButton
                variant="outline"
                onClick={() => {
                  setSearched(false);
                  setMessages([]);
                  setEmail('');
                  setError('');
                }}
              >
                Search Again
              </CustomButton>
            </div>

            {messages.map((message, index) => (
              <motion.div
                key={message._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedMessage(message)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{message.subject}</h3>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{message.message}</p>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(message.status)}
                          {getPriorityBadge(message.priority)}
                          {message.adminResponse?.message && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Send className="h-3 w-3" />
                              Response Received
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(message.createdAt)}
                      </span>
                      <span className="text-blood-crimson hover:underline">View Details →</span>
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

export default MyMessages;
