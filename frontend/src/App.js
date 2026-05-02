import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Volunteers from './pages/Volunteers';
import Restaurants from './pages/Restaurants';
import Community from './pages/Community';
import Tracker from './pages/Tracker';
import Delivery from './pages/Delivery';
import Invoice from './pages/Invoice';
import PastOrders from './pages/PastOrders';
import RestaurantHistory from './pages/RestaurantHistory';
import Achievement from './pages/Achievement';
import Certificate from './pages/Certificate';
import Rewards from './pages/Rewards';
import LoginVolunteer from './pages/LoginVolunteer';
import LoginRestaurant from './pages/LoginRestaurant';
import RegisterVolunteer from './pages/RegisterVolunteer';
import RegisterRestaurant from './pages/RegisterRestaurant';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="App">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login-volunteer" element={<LoginVolunteer />} />
            <Route path="/login-restaurant" element={<LoginRestaurant />} />
            <Route path="/register-volunteer" element={<RegisterVolunteer />} />
            <Route path="/register-restaurant" element={<RegisterRestaurant />} />
            <Route 
              path="/volunteers" 
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <Volunteers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/delivery/:id" 
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <Delivery />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/past-orders" 
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <PastOrders />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/certificate/:id" 
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <Certificate />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rewards" 
              element={
                <ProtectedRoute allowedRoles={['volunteer']}>
                  <Rewards />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/restaurants" 
              element={
                <ProtectedRoute allowedRoles={['restaurant']}>
                  <Restaurants />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tracker/:id" 
              element={
                <ProtectedRoute allowedRoles={['restaurant']}>
                  <Tracker />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/invoice/:id" 
              element={
                <ProtectedRoute allowedRoles={['restaurant']}>
                  <Invoice />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/restaurant-history" 
              element={
                <ProtectedRoute allowedRoles={['restaurant']}>
                  <RestaurantHistory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/achievement/:type" 
              element={
                <ProtectedRoute allowedRoles={['restaurant']}>
                  <Achievement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/community" 
              element={
                <ProtectedRoute allowedRoles={['volunteer', 'restaurant']}>
                  <Community />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
