import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Home from "@/pages/Home.jsx";
import Layout from "@/Layouts/Layout";
import Profile from "@/pages/Profile";
import SettingsLayout from "@/Layouts/SettingsLayout";
import SettingsProfile from "@/pages/SettingsProfile";
import SettingsDeleteAccount from "@/pages/SettingsDeleteAccount";
import CreateEventForm from "./Components/CreateEventForm";
import EventsPage from "@/Components/EventsBox";

function PageNotFoundRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();

  navigate(user ? "/" : "/login");
}

function ProtectedRoute({ children }) {
  const { user, loading, fetchUser } = useAuth();

  if (!user) {
    console.log("fetchUser() from protected routes.");
    fetchUser();
  }

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  return user ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            {" "}
            <Login />{" "}
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            {" "}
            <Signup />{" "}
          </PublicRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/create" element={<CreateEventForm />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <SettingsLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/settings" element={<SettingsProfile />} />
        <Route
          path="/settings/deleteAccount"
          element={<SettingsDeleteAccount />}
        />
      </Route>
      <Route path="*" element={<PageNotFoundRedirect />} />
    </Routes>
  );
}
