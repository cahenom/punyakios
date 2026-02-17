import React, {createContext, useContext, useState, useEffect} from 'react';
import CustomAlert from '../components/CustomAlert';
import {setGlobalAlertHandler} from '../utils/alert';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({children}) => {
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: [],
  });
  const lastAlertRef = React.useRef({time: 0, message: '', isNetworkError: false});

  const showAlert = (title, message, type = 'info', buttons = []) => {
    const now = Date.now();
    const isNetworkError = message?.toLowerCase().includes('server') || 
                          message?.toLowerCase().includes('jaringan') ||
                          message?.toLowerCase().includes('koneksi');
    
    // Anti-spam logic:
    // 1. Don't show the exact same message within 3 seconds
    // 2. Don't show consecutive network errors within 3 seconds
    if (now - lastAlertRef.current.time < 3000) {
      if (message === lastAlertRef.current.message) return;
      if (isNetworkError && lastAlertRef.current.isNetworkError) return;
    }

    lastAlertRef.current = {time: now, message, isNetworkError};
    setAlert({visible: true, title, message, type, buttons});
  };

  const hideAlert = () => {
    setAlert(prev => ({...prev, visible: false}));
  };

  // Set global alert handler for backward compatibility
  useEffect(() => {
    setGlobalAlertHandler(showAlert);
  }, []);

  return (
    <AlertContext.Provider value={{showAlert, hideAlert}}>
      {children}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        buttons={alert.buttons}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};
