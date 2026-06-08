// src/hooks/useAdmin.js
import { useState, useEffect } from "react";
import { authService } from "../services/authService";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await authService.getUser();
        
        console.log("Current user:", user?.id, user?.email); // DEBUG

        if (!user) {
          console.log("No user logged in"); // DEBUG
          setLoading(false);
          return;
        }

        const data = await authService.checkAdminUser(user.id);
        console.log("Query result:", { data }); // DEBUG

        console.log("Is admin?", data?.role === "admin"); // DEBUG
        setIsAdmin(data?.role === "admin");
      } catch (error) {
        console.error("Admin check error:", error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
}