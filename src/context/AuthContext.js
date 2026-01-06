import React, { createContext, useContext, useReducer, useEffect } from 'react';
import ApiService from '../services/ApiService';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Helper function to access electron IPC in development/production
const getElectronAPI = () => {
  if (window.electron && window.electron.ipcRenderer) {
    return window.electron.ipcRenderer;
  }
  return null;
};

// Simplified storage interface
const SessionStorage = {
  saveSession: async (token, user) => {
    try {
      // Save to sessionStorage (always available in web)
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      // Also try to save to SQLite if in Electron
      const ipc = getElectronAPI();
      if (ipc) {
        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
        try {
          await ipc.invoke('save-session', { token, userId: user.id, expiresAt });
          console.log('Session also saved to SQLite');
        } catch (error) {
          console.warn('Could not save to SQLite, but sessionStorage is available:', error);
        }
      }
      return true;
    } catch (error) {
      console.error('Error saving session:', error);
      return false;
    }
  },

  getSession: async () => {
    try {
      // First try sessionStorage (fastest)
      if (typeof sessionStorage !== 'undefined') {
        const token = sessionStorage.getItem('authToken');
        const userStr = sessionStorage.getItem('user');
        if (token && userStr) {
          try {
            return { token, user: JSON.parse(userStr) };
          } catch (error) {
            console.error('Error parsing stored user:', error);
          }
        }
      }

      // If nothing in sessionStorage, try SQLite
      const ipc = getElectronAPI();
      if (ipc) {
        try {
          const session = await ipc.invoke('get-session');
          if (session) {
            console.log('Session retrieved from SQLite');
            return { 
              token: session.token, 
              user: { 
                id: session.user_id, 
                username: session.username, 
                email: session.email, 
                role: session.role 
              } 
            };
          }
        } catch (error) {
          console.error('Error retrieving session from SQLite:', error);
        }
      }
    } catch (error) {
      console.error('Error in getSession:', error);
    }
    
    return null;
  },

  clearSession: async () => {
    try {
      // Clear from sessionStorage
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
      }

      // Also clear from SQLite if in Electron
      const ipc = getElectronAPI();
      if (ipc) {
        try {
          await ipc.invoke('invalidate-session');
          console.log('Session cleared from SQLite');
        } catch (error) {
          console.warn('Could not clear SQLite session:', error);
        }
      }
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  },
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = await SessionStorage.getSession();
        if (session && session.token && session.user) {
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              token: session.token,
              user: session.user,
            },
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        await SessionStorage.clearSession();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await ApiService.login(credentials);
      
      // Store auth data in SQLite (via IPC) or sessionStorage
      await SessionStorage.saveSession(response.token, response.user);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          token: response.token,
          user: response.user,
        },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed';
      
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    await SessionStorage.clearSession();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    user: state.user,
    token: state.token,
    isAuthenticated: state.isAuthenticated,
    loading: state.loading,
    error: state.error,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};