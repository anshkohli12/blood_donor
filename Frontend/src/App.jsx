import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import MainLayout from "./layouts/MainLayout"
import AuthLayout from "./layouts/AuthLayout"

// Pages
import Home from "./pages/Home"
import About from "./pages/About"
import Contact from "./pages/Contact"
import BecomeDonor from "./pages/BecomeDonor"
import RequestBlood from "./pages/RequestBlood"
import FindDonors from "./pages/FindDonors"
import BloodBanks from "./pages/BloodBanks"
import Events from "./pages/Events"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./pages/AdminDashboard"
import AdminContactMessages from "./pages/AdminContactMessages"
import AdminProfile from "./pages/AdminProfile"
import AdminUsers from "./pages/AdminUsers"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <AuthLayout>
                <Login />
              </AuthLayout>
            }
          />
          <Route
            path="/register"
            element={
              <AuthLayout>
                <Register />
              </AuthLayout>
            }
          />

          {/* Main Routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/about"
            element={
              <MainLayout>
                <About />
              </MainLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <MainLayout>
                <Contact />
              </MainLayout>
            }
          />
          <Route
            path="/become-donor"
            element={
              <MainLayout>
                <BecomeDonor />
              </MainLayout>
            }
          />
          <Route
            path="/request-blood"
            element={
              <MainLayout>
                <RequestBlood />
              </MainLayout>
            }
          />
          <Route
            path="/find-donors"
            element={
              <MainLayout>
                <FindDonors />
              </MainLayout>
            }
          />
          <Route
            path="/blood-banks"
            element={
              <MainLayout>
                <BloodBanks />
              </MainLayout>
            }
          />
          <Route
            path="/events"
            element={
              <MainLayout>
                <Events />
              </MainLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <Dashboard />
              </MainLayout>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            }
          />
          <Route
            path="/admin/contact-messages"
            element={
              <MainLayout>
                <AdminContactMessages />
              </MainLayout>
            }
          />
          <Route
            path="/admin/profile"
            element={
              <MainLayout>
                <AdminProfile />
              </MainLayout>
            }
          />
          <Route
            path="/admin/users"
            element={
              <MainLayout>
                <AdminUsers />
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
