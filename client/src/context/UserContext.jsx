import React, { createContext, useContext, useState, useEffect } from 'react';

// Default user data for beneficiaries
const defaultUsers = [
  {
    id: 1,
    name: 'Jane Smith',
    role: 'Beneficiary',
    email: 'jane@example.com',
    password: 'password123',
    country: 'Tanzania',
    phone: '+255 123 456 789',
    uniqueId: 'BEN-2025-001',
    bio: 'I am a representative for a community of 200 people affected by the recent drought in Arusha region.',
    photo: null
  },
  {
    id: 2,
    name: 'John Doe',
    role: 'Beneficiary',
    email: 'john@example.com',
    password: 'password123',
    country: 'Kenya',
    phone: '+254 987 654 321',
    uniqueId: 'BEN-2025-002',
    bio: 'Representing a community health center serving over 5,000 people in rural Kenya.',
    photo: null
  }
];

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(() => {
    const savedUsers = localStorage.getItem('users');
    return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Save users to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Check if a user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Login function
  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: 'Invalid email or password' };
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  // Register a new user
  const register = (userData) => {
    // Check if email already exists
    if (users.some(user => user.email === userData.email)) {
      return { success: false, message: 'Email already in use' };
    }

    const newUser = {
      ...userData,
      id: users.length + 1,
      uniqueId: `BEN-2025-00${users.length + 1}`,
    };

    setUsers([...users, newUser]);
    
    // Auto login after registration
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    return { success: true, user: newUser };
  };

  // Update user profile
  const updateProfile = (updatedData) => {
    const updatedUsers = users.map(user => 
      user.id === currentUser.id ? { ...user, ...updatedData } : user
    );
    
    setUsers(updatedUsers);
    
    // Update current user
    const updatedUser = { ...currentUser, ...updatedData };
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return { success: true, user: updatedUser };
  };

  return (
    <UserContext.Provider value={{ 
      currentUser, 
      isAuthenticated, 
      login, 
      logout, 
      register,
      updateProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext;