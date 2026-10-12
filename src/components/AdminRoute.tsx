import { Outlet } from 'react-router-dom';

export const AdminRoute = ({ children }: { children?: React.ReactNode }) => {

  // Bypass auth check for development/preview purposes
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" replace />;
  // }

  // if (user?.role !== 'Admin') {
  //   return <Navigate to="/" replace />;
  // }

  return children ? <>{children}</> : <Outlet />;
};
