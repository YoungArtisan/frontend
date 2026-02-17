import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    if (!currentUser) {
        console.log('ProtectedRoute: No user logged in, redirecting to /login');
        // Redirect to login but save the current location for after login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    console.log('ProtectedRoute: Current user:', currentUser);
    console.log('ProtectedRoute: Required role:', requiredRole);
    console.log('ProtectedRoute: User role:', currentUser.role);

    if (requiredRole && currentUser.role !== requiredRole) {
        console.log(`ProtectedRoute: Role mismatch! Required: ${requiredRole}, Got: ${currentUser.role}`);
        // Redirect to home if user doesn't have required role
        return <Navigate to="/" replace />;
    }

    console.log('ProtectedRoute: Access granted!');
    return children;
};

export default ProtectedRoute;
