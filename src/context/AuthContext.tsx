
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

type MockedUsers = {
  [key: string]: User;
};

// Mock users for demonstration
const MOCKED_USERS: MockedUsers = {
  "user1": { 
    id: "user1", 
    name: "John Resident",
    email: "john@example.com",
    role: "user"
  },
  "user2": { 
    id: "user2", 
    name: "Jane Resident",
    email: "jane@example.com",
    role: "user"
  },
  "admin1": { 
    id: "admin1", 
    name: "Admin Secretary",
    email: "admin@example.com",
    role: "admin"
  }
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (userId: string) => void;
  logout: () => void;
  allUsers: MockedUsers;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Check if user exists in localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId && MOCKED_USERS[storedUserId]) {
      setUser(MOCKED_USERS[storedUserId]);
    }
  }, []);
  
  const login = (userId: string) => {
    if (MOCKED_USERS[userId]) {
      setUser(MOCKED_USERS[userId]);
      localStorage.setItem("userId", userId);
      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${MOCKED_USERS[userId].name}!`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "User not found",
      });
    }
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };
  
  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin", 
        login, 
        logout,
        allUsers: MOCKED_USERS 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
