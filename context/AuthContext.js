import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("auth_token");
    if (token) {
      // trust, but for this context it'd be fine
      try {
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
          Cookies.remove("auth_token");
          setUser(null);
        } else {
          setUser({
            token,
            volunteer_id: decoded.volunteer_id,
            full_name: decoded.full_name,
            is_admin: decoded.is_admin,
          });
        }
      } catch (error) {
        console.error("Invalid token:", error);
        Cookies.remove("auth_token");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = (token) => {
    const decoded = jwtDecode(token);

    Cookies.set("auth_token", token, {
      expires: 1,
      secure: process.env.NODE_ENV === "production",
    });

    setUser({
      token,
      volunteer_id: decoded.volunteer_id,
      full_name: decoded.full_name,
      is_admin: decoded.is_admin,
    });

    router.push("/dashboard");
  };

  const logout = () => {
    Cookies.remove("auth_token");
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated: !!user, user, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
