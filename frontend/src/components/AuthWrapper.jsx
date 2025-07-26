import React, { useState } from 'react';
import Login from './Login';
import Registration from './Registration';

const AuthWrapper = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleLoginSuccess = (result) => {
    console.log('Login successful:', result);
    if (onAuthSuccess) {
      onAuthSuccess(result);
    }
  };

  const handleRegistrationSuccess = (result) => {
    console.log('Registration successful:', result);
    if (onAuthSuccess) {
      onAuthSuccess(result);
    }
  };

  const switchToRegister = () => {
    setIsLogin(false);
  };

  const switchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <>
      {isLogin ? (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={switchToRegister}
        />
      ) : (
        <Registration 
          onRegistrationSuccess={handleRegistrationSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}
    </>
  );
};

export default AuthWrapper;
