import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
	children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
	const { user, loading } = useAuth();

	if (loading) {
		return (
			<div className="grid min-h-screen place-items-center">
				<div className="flex flex-col items-center gap-4">
					<div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
					<p className="text-sm text-gray-600">Loading…</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;