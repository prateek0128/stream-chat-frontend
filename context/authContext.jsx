import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext({
  userId: null,
  userName: null,
  setAuth: (_id, _name) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);

  const setAuth = (id, name) => {
    const _id = String(id || "").trim();
    if (!_id) return;
    setUserId(_id);
    setUserName(String(name || _id));
  };

  const logout = () => {
    setUserId(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ userId, userName, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
