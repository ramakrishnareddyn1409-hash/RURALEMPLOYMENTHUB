import React from "react";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "./Loading";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role, allowedRoles }) => {
  const { isAuthenticated, user, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role || "";
  const isSuperOrState = userRole === "superadmin" || userRole === "state_admin";
  const isAssistant = userRole === "assistant_admin";
  const isField = userRole === "field_admin" || userRole === "admin";
  const isFieldWorker = userRole === "field_worker";
  const isWorkerRole = userRole === "worker" || userRole === "employee";

  // Super Admin / State Admin has access to everything
  if (isSuperOrState) {
    return children;
  }

  const targetRoles = allowedRoles || (role ? [role] : []);
  if (!targetRoles.length) {
    return children;
  }

  // Check what roles are permitted on this route
  const allowsState = targetRoles.some((r) => r === "state_admin" || r === "superadmin");
  const allowsAssistant = targetRoles.some((r) => r === "assistant_admin");
  const allowsField = targetRoles.some((r) => r === "field_admin" || r === "admin");
  const allowsWorker = targetRoles.some((r) => r === "worker" || r === "employee");

  // 1. Assistant Admin: Access Assistant, Field, Worker (NOT State)
  if (isAssistant) {
    if (allowsAssistant || allowsField || allowsWorker) {
      return children;
    }
    return <Navigate to="/admin/assistant-admin" replace />;
  }

  // 2. Field Admin / Field Worker: Access Field, Worker (NOT State or Assistant)
  if (isField) {
    if (allowsField || allowsWorker) {
      return children;
    }
    return <Navigate to="/admin/field-admin" replace />;
  }

  if (isFieldWorker) {
    if (allowsWorker) {
      return children;
    }
    return <Navigate to="/employee/dashboard" replace />;
  }

  // 3. Worker: Access Worker only
  if (isWorkerRole) {
    if (allowsWorker) {
      return children;
    }
    return <Navigate to="/employee/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
