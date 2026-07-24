import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isConfigured } from '../../firebase';
import { useNavigate } from 'react-router-dom';

export const useAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured || !auth) {
      setError('Firebase is not configured. Please set your environment variables.');
      return;
    }
    
    if (email.toLowerCase() !== 'mdalaminkhalifa2002@gmail.com') {
      setError('You are not authorized to access this admin panel.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin-dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials in Firebase Console.');
      } else if (err.code === 'auth/user-not-found') {
        setError('No admin account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else {
        setError(err.message || 'An error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleLogin,
    isConfigured
  };
};
