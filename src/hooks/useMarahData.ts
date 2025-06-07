import { useState, useEffect, useCallback, useRef } from 'react';

interface UseMarahDataOptions {
  endpoint: string;
  params?: Record<string, string>;
  refreshInterval?: number;
  enabled?: boolean;
}

interface UseMarahDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export function useMarahData<T = any>({
  endpoint,
  params = {},
  refreshInterval = 60000,
  enabled = true
}: UseMarahDataOptions): UseMarahDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const queryParams = new URLSearchParams(params);
      const url = `${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json',
        },
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(`Error fetching ${endpoint}:`, err);
        setError(err.message || 'Failed to fetch data');
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, enabled]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    // Set up interval for real-time updates
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refresh, lastUpdated };
}

// Hook for MARAH company ID
export function useMarahCompany() {
  const [marahCompanyId, setMarahCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarahCompany = async () => {
      try {
        const response = await fetch('/api/companies', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          const marahCompany = data.companies.find((company: any) => 
            company.name === 'MARAH Inflatable Games Rental'
          );
          
          if (marahCompany) {
            setMarahCompanyId(marahCompany.id);
          } else {
            setError('MARAH company not found. Please create it first from the Companies page.');
          }
        } else {
          setError('Failed to fetch company information');
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
        setError('Failed to fetch company information');
      } finally {
        setLoading(false);
      }
    };

    fetchMarahCompany();
  }, []);

  return { marahCompanyId, loading, error };
}

// Hook for optimized filtering
export function useMarahFilters<T>(
  data: T[],
  searchFields: (keyof T)[],
  searchTerm: string,
  filters: Record<string, any>
) {
  return useState(() => {
    if (!data) return [];

    let filtered = [...data];

    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        searchFields.some(field => {
          const value = item[field];
          return value && String(value).toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        filtered = filtered.filter(item => {
          const itemValue = (item as any)[key];
          if (key.includes('Range') || key.includes('Filter')) {
            // Handle special range filters
            return handleRangeFilter(itemValue, value);
          }
          return itemValue === value;
        });
      }
    });

    return filtered;
  })[0];
}

function handleRangeFilter(value: any, range: string): boolean {
  switch (range) {
    case 'positive':
      return Number(value) > 0;
    case 'negative':
      return Number(value) < 0;
    case 'zero':
      return Number(value) === 0;
    case 'low':
      return Number(value) < 100;
    case 'medium':
      return Number(value) >= 100 && Number(value) <= 300;
    case 'high':
      return Number(value) > 300 && Number(value) <= 500;
    case 'premium':
      return Number(value) > 500;
    case '0':
      return Number(value) === 0;
    case '1-5':
      return Number(value) >= 1 && Number(value) <= 5;
    case '6-20':
      return Number(value) >= 6 && Number(value) <= 20;
    case '21+':
      return Number(value) > 20;
    default:
      return true;
  }
} 