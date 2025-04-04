import { useState, useEffect } from "react";
import axios from "axios";

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get("/api/settings");
      setSettings(response.data);
    } catch (err) {
      setError("Failed to fetch user settings");
      console.error("Error fetching user settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, isLoading, error, refetch: fetchSettings };
};
