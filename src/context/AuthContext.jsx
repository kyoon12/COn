// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkUser = async () => {
      const storedUser = localStorage.getItem('auth');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.user && parsed.isAuthenticated) {
            // Verify user still exists in database
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', parsed.user.id)
              .single();

            if (!error && data) {
              setUser(data);
            } else {
              localStorage.removeItem('auth');
            }
          }
        } catch (error) {
          console.error('Error checking user:', error);
          localStorage.removeItem('auth');
        }
      }
      setLoading(false);
    };

    checkUser();
  }, []);

  const signUp = async (email, password, name) => {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Insert new user
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password, // In production, hash this password!
            name,
            role: 'user'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Auto login after signup
      setUser(data);
      localStorage.setItem('auth', JSON.stringify({
        user: data,
        role: data.role,
        isAuthenticated: true
      }));

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      // Query user by email and password
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password) // In production, compare hashed passwords!
        .single();

      if (error || !data) {
        throw new Error('Invalid email or password');
      }

      // Set user in state and localStorage
      setUser(data);
      localStorage.setItem('auth', JSON.stringify({
        user: data,
        role: data.role,
        isAuthenticated: true
      }));

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('auth');
  };

  const updateProfile = async (updates) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setUser(data);
      
      // Update localStorage
      const stored = JSON.parse(localStorage.getItem('auth') || '{}');
      localStorage.setItem('auth', JSON.stringify({
        ...stored,
        user: data
      }));

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};