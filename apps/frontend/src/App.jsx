import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import { ProtectedRoute } from './auth/ProtectedRoute.jsx';
import { AppLayout } from './components/layout/AppLayout.jsx';

const LoginPage = lazy(() => import('./pages/LoginPage.jsx').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx').then((m) => ({ default: m.RegisterPage })));
const HomePage = lazy(() => import('./pages/HomePage.jsx').then((m) => ({ default: m.HomePage })));
const BookingPage = lazy(() => import('./pages/BookingPage.jsx').then((m) => ({ default: m.BookingPage })));
const BookingSuccessPage = lazy(() => import('./pages/BookingSuccessPage.jsx').then((m) => ({ default: m.BookingSuccessPage })));
const BookingFailurePage = lazy(() => import('./pages/BookingFailurePage.jsx').then((m) => ({ default: m.BookingFailurePage })));
const BookingPendingPage = lazy(() => import('./pages/BookingPendingPage.jsx').then((m) => ({ default: m.BookingPendingPage })));
const MyBookingsPage = lazy(() => import('./pages/MyBookingsPage.jsx').then((m) => ({ default: m.MyBookingsPage })));
const TournamentsPage = lazy(() => import('./pages/TournamentsPage.jsx').then((m) => ({ default: m.TournamentsPage })));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx').then((m) => ({ default: m.AdminPage })));
const VideosPage = lazy(() => import('./pages/VideosPage.jsx').then((m) => ({ default: m.VideosPage })));

function AppFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sand">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-ocean/40 border-t-ocean animate-spin" />
        <span className="text-sm text-slateText/70">A Beach Arena</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<AppFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/home" replace />} />
            <Route path="home" element={<HomePage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="booking/success" element={<BookingSuccessPage />} />
            <Route path="booking/failure" element={<BookingFailurePage />} />
            <Route path="booking/pending" element={<BookingPendingPage />} />
            <Route path="my-bookings" element={<MyBookingsPage />} />
            <Route path="tournaments" element={<TournamentsPage />} />
            <Route path="videos" element={<VideosPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

