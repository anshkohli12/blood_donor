# Admin Login Guide

## ✅ ISSUE FIXED!

The admin login issue has been resolved. The problem was that all users (including admins) were being redirected to `/dashboard` after login. Now admins are properly redirected to `/admin-dashboard`.

## Admin Credentials

**Email:** admin@blooddonor.com  
**Password:** Admin@123

## How to Login as Admin

1. **Start Backend Server** (if not running):
   ```powershell
   cd "c:\Users\ANSH KOHLI\Desktop\Blood_Donor\Backend"
   node server.js
   ```

2. **Start Frontend Server** (if not running):
   ```powershell
   cd "c:\Users\ANSH KOHLI\Desktop\Blood_Donor\Frontend"
   npm run dev
   ```

3. **Access the Application**:
   - Open browser and go to: http://localhost:5174/ (or http://localhost:5173/)
   - Click on "Login" or navigate to: http://localhost:5174/login

4. **Login with Admin Credentials**:
   - Email: `admin@blooddonor.com`
   - Password: `Admin@123`

5. **You will be redirected to**: `/admin-dashboard`

## Admin Dashboard Features

Once logged in, you can access:
- **Dashboard Overview** - Statistics and analytics
- **Manage Users** - View and manage registered users
- **Manage Donors** - View all donor registrations
- **Manage Blood Banks** - Create and manage blood banks
- **Contact Messages** - View contact form submissions
- **Admin Profile** - Update admin profile

## What Was Fixed

### Backend (Already Working ✅)
- Admin user creation via `init-admin.js` ✅
- Login endpoint at `/api/auth/login` ✅
- JWT token generation with role information ✅

### Frontend (FIXED 🔧)
- **Before**: All users redirected to `/dashboard` after login
- **After**: Admins redirected to `/admin-dashboard`, regular users to `/dashboard`

### Changes Made

File: `Frontend/src/pages/Login.jsx`

```javascript
const onSubmit = async (data) => {
  try {
    setIsLoading(true)
    setApiError("")
    const response = await login(data.email, data.password)
    
    // Redirect based on user role
    if (response.user.role === 'admin') {
      navigate("/admin-dashboard")
    } else {
      navigate("/dashboard")
    }
  } catch (error) {
    setApiError(error.response?.data?.message || "Login failed. Please try again.")
  } finally {
    setIsLoading(false)
  }
}
```

## Troubleshooting

### If Admin User Doesn't Exist
Run the admin initialization script:
```powershell
cd "c:\Users\ANSH KOHLI\Desktop\Blood_Donor\Backend"
node init-admin.js
```

### If Login Still Fails
1. Check if backend is running on port 5000
2. Check if frontend is running on port 5173 or 5174
3. Check browser console for errors
4. Verify admin credentials in `.env` file

### If Redirected to Wrong Dashboard
1. Clear browser cache and localStorage
2. Try logging out and logging in again
3. Check that the Login.jsx file has been updated with role-based redirect

## Additional Notes

- Regular users should login with their registered email/password
- Blood bank staff have a separate login at `/blood-bank-login`
- Admin can manage all aspects of the system from the admin dashboard

## Server Status

Backend: http://localhost:5000  
Frontend: http://localhost:5174 (or 5173)

Both servers are currently running! ✅
