import * as React from 'react';
import {useAuth} from '../context/AuthContext';
import ProtectedRoute from './protect';
import PublicRoute from './public';

function Router() {
  const {isLoggedIn} = useAuth();

  return <>{isLoggedIn ? <ProtectedRoute /> : <PublicRoute />}</>;
}

export default Router;
