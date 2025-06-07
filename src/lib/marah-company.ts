/**
 * MARAH Company Utility
 * Provides consistent company initialization and fetching across all MARAH pages
 */

export interface MarahCompanyResult {
  companyId: string | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * Fetches or creates the MARAH company for the current user
 * This ensures all MARAH pages have consistent access to the company data
 */
export async function ensureMarahCompany(): Promise<MarahCompanyResult> {
  try {
    // First, try to fetch existing companies
    const companiesResponse = await fetch('/api/companies', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (companiesResponse.ok) {
      const data = await companiesResponse.json();
      const marahCompany = data.companies.find((company: any) => 
        company.name === 'MARAH Inflatable Games Rental'
      );

      if (marahCompany) {
        return {
          companyId: marahCompany.id,
          error: null,
          isLoading: false,
        };
      }
    }

    // If MARAH company doesn't exist, create it
    const createResponse = await fetch('/api/companies/marah', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (createResponse.ok) {
      const createData = await createResponse.json();
      return {
        companyId: createData.company.id,
        error: null,
        isLoading: false,
      };
    } else {
      const errorData = await createResponse.json();
      return {
        companyId: null,
        error: errorData.error || 'Failed to create MARAH company',
        isLoading: false,
      };
    }
  } catch (error) {
    console.error('Error ensuring MARAH company:', error);
    return {
      companyId: null,
      error: 'Failed to initialize MARAH company',
      isLoading: false,
    };
  }
}

/**
 * React hook for MARAH company management
 * Provides consistent state management across all MARAH pages
 */
export function useMarahCompany() {
  const [result, setResult] = React.useState<MarahCompanyResult>({
    companyId: null,
    error: null,
    isLoading: true,
  });

  React.useEffect(() => {
    ensureMarahCompany().then(setResult);
  }, []);

  const refetch = React.useCallback(async () => {
    setResult(prev => ({ ...prev, isLoading: true }));
    const newResult = await ensureMarahCompany();
    setResult(newResult);
  }, []);

  return {
    ...result,
    refetch,
  };
}

// Import React for the hook
import React from 'react'; 