import * as React from 'react';
import {useAuth} from '../context/AuthContext';
import ProtectedRoute from './protect';
import AdminProtectedRoute from './AdminProtectedRoute';
import MerchantProtectedRoute from './MerchantProtectedRoute';
import PublicRoute from './public';
import { getAppFlavor } from '../utils/flavorConfig';

function Router() {
  const {isLoggedIn} = useAuth();
  const flavor = getAppFlavor();

  if (!isLoggedIn) {
    return <PublicRoute />;
  }

  switch (flavor) {
    case 'admin':
      return <AdminProtectedRoute />;
    case 'merchant':
      return <MerchantProtectedRoute />;
    default:
      return <ProtectedRoute />;
  }
}

export default Router;
