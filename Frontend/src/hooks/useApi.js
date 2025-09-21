import { useState, useEffect } from "react";

export function useApi(apiCall, options = {}) {
  const [data, setData] = useState(options.initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options.dependencies || []);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
}
