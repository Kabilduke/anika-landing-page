// src/hooks/useAdmin.js
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      console.log("Current user:", user?.id, user?.email); // DEBUG

      if (!user) {
        console.log("No user logged in"); // DEBUG
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      console.log("Query result:", { data, error }); // DEBUG

      if (error) {
        console.error("Admin check error:", error.message);
        setLoading(false);
        return;
      }

      console.log("Is admin?", data?.role === "admin"); // DEBUG
      setIsAdmin(data?.role === "admin");
      setLoading(false);
    };

    checkAdmin();
  }, []);

  return { isAdmin, loading };
}