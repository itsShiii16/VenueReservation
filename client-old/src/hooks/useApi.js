/**
 * useApi.js — Custom hook for API calls with loading/error state
 */

import { useState, useCallback } from "react";

export function useApi(apiFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunction(...args);
        setData(result.data);
        return result;
      } catch (err) {
        const message = err.response?.data?.message || err.message || "An error occurred";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction]
  );

  return { data, loading, error, execute };
}
