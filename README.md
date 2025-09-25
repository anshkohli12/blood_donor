# Blood Donor Management System

A comprehensive blood donation management system built with React.js frontend and Node.js backend, designed to connect blood donors with those in need.

## 🩸 Features

### For Users
- **User Registration & Authentication** - Secure user registration and login system
- **Donor Profile Management** - Complete donor profile with blood type, location, and availability
- **Blood Request System** - Easy blood request submission with urgent priority options
- **Donor Search** - Find blood donors by blood type, location, and availability
- **Event Management** - View and register for blood donation events
- **Contact System** - Contact form for inquiries and support

### For Admins
- **Admin Dashboard** - Comprehensive admin panel with real-time statistics
- **User Management** - View, edit, activate/deactivate user accounts
- **Contact Message Management** - View, respond to, and manage contact inquiries
- **Website Navigation** - Quick access to all main website pages
- **Real-time Data** - Live statistics for users, messages, donations, and events
- **Responsive Design** - Mobile-friendly admin interface

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface library
- **React Router** - Client-side routing
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool and development server

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📱 Screenshots

*Add screenshots of your application here*

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup
1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/blooddonor
   JWT_SECRET=your_jwt_secret_key_here
   NODE_ENV=development
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the Frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the Frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (Admin only)

### Contact Messages
- `POST /api/contact/submit` - Submit contact form
- `GET /api/contact/messages` - Get all messages (Admin only)
- `PUT /api/contact/messages/:id/status` - Update message status
- `DELETE /api/contact/messages/:id` - Delete message

### Blood Requests (Planned)
- `POST /api/requests` - Create blood request
- `GET /api/requests` - Get all blood requests
- `PUT /api/requests/:id` - Update blood request

### Events (Planned)
- `GET /api/events` - Get all events
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event

## 👥 User Roles

### Regular Users
- Register as blood donors
- Search for blood donors
- Submit blood requests
- View events and register
- Contact support

### Admin Users
- Full dashboard access
- User management capabilities
- Contact message management
- System statistics and analytics
- Website navigation tools

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in localStorage
- Protected routes require valid authentication
- Admin routes require admin role verification
- Automatic token refresh on page reload

## 📊 Admin Dashboard Features

### Real-time Statistics
- Total registered users
- Contact messages (pending/resolved)
- Blood donations tracking
- Event management

### User Management
- View all registered users
- User profile details
- Activate/deactivate accounts
- Search and filter capabilities

### Contact Management
- View all contact messages
- Update message status
- Priority-based organization
- Response tracking

## 🎨 UI/UX Features

- **Responsive Design** - Works on all device sizes
- **Modern UI** - Clean and intuitive interface
- **Smooth Animations** - Framer Motion animations
- **Loading States** - User-friendly loading indicators
- **Error Handling** - Comprehensive error management
- **Form Validation** - Client-side and server-side validation

## 📄 Project Structure

```
Blood_Donor/
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── styles/
│   ├── package.json
│   └── vite.config.js
├── Backend/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── controllers/
│   ├── config/
│   ├── package.json
│   └── server.js
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all blood donors who save lives every day
- Inspired by the need for better blood donation management systems
- Built with modern web technologies for scalability and performance

## 📞 Contact

For questions or support, please contact:
- Email: your-email@example.com
- GitHub: [your-github-username](https://github.com/your-username)

---

**Made with ❤️ for the blood donation community**