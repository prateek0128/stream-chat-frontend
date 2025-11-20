import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext({
  userId: null,
  userName: null,
  setAuth: (_id, _name) => {},
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

  return (
    <AuthContext.Provider value={{ userId, userName, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
