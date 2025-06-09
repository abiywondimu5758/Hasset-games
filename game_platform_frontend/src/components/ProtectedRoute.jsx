// ProtectedRoute.js
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { observer } from "mobx-react-lite"; 
import { authStore } from "../stores/AuthStore"; 

const ProtectedRoute = observer(({ children }) => {
  const isAuthenticated = authStore.isAuthenticated();

  if (authStore.isLoggedOut) {
    // Redirect if the user has been logged out due to token refresh failure
    return <Navigate to="/login" />;
  }

  return isAuthenticated ? children : <Navigate to="/login" />; 
});

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
