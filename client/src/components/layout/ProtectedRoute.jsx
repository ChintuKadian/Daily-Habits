import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ReminderManager from './ReminderManager';

const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  return user ? (
    <>
      <ReminderManager />
      <Outlet />
    </>
  ) : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
