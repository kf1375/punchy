import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [telegramUser, setTelegramUser] = useState(null);
  const [isUserExists, setIsUserExists] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [redirected, setRedirected] = useState(false);  // Track if redirection occurred

  const navigate = useNavigate();

  useEffect(() => {
    const checkUserExistence = async () => {
      if (redirected) return;  // Skip if already redirected

      const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
      setTelegramUser(user);

      if (user && user.id) {
        try {
          const response = await fetch(`/api/users/${user.id}`);
          const data = await response.json();

          if (data && data.user_id) {
            setIsUserExists(true);
            setRedirected(true);  // Mark as redirected to prevent further API calls
            navigate('/'); // Redirect to the home page for existing users
          }
        } catch (err) {
          console.error('Error checking user existence:', err);
          setError('Failed to check user existence. Please try again later.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setError('Could not retrieve Telegram user information.');
      }
    };

    checkUserExistence();
  }, [navigate, redirected]);  // Added 'redirected' to dependencies to ensure it's considered

  const handleSignUp = () => {
    if (!telegramUser) return;

    const userData = {
      telegram_id: telegramUser.id,
      name: `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim(),
      subscription_type: 0, // Default subscription type
    };

    fetch(`/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to register user.');
        }
        return response.json();
      })
      .then(() => {
        alert('User registered successfully!');
        setRedirected(true);  // Mark as redirected
        navigate('/'); // Redirect new users to the home page
      })
      .catch((err) => {
        console.error('Error registering user:', err);
        setError('Failed to register. Please try again later.');
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isUserExists) {
    return <div>You are already registered. Redirecting...</div>;
  }

  return (
    <div>
      <h1>Sign Up</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {telegramUser ? (
        <div>
          <p>
            Welcome, {telegramUser.first_name} {telegramUser.last_name || ''}!
          </p>
          <button onClick={handleSignUp}>Sign Up</button>
        </div>
      ) : (
        <p>Telegram user information is not available.</p>
      )}
    </div>
  );
};

export default Login;
