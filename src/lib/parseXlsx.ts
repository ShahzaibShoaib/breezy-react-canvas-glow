import { getAuthHeader } from "./auth";

/**
 * Fetches product data from the API for a given filename
 */
export async function parseXlsx(fileName: string) {
  console.log('parseXlsx called with fileName:', fileName);
  
  try {
    const headers = getAuthHeader();
    if (!headers) {
      throw new Error('Authentication required');
    }

    // Clean up the filename by removing the "Data/" prefix if present
    const cleanFileName = fileName.replace(/^Data\//, '');
    console.log('Requesting records for filename:', cleanFileName);

    const response = await fetch('https://backorder.xclusivetradinginc.cloud/records-by-filename-A', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        file_name: cleanFileName
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        window.location.href = '/auth';
        return [];
      }

      const errorText = await response.text();
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      
      if (response.status === 404) {
        console.log('No data found for file:', cleanFileName);
        return [];
      }
      
      throw new Error(`Failed to fetch data: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    
    // API returns {data: any[]}
    const records = responseData.data || [];
    
    // Add IDs to each row
    return records.map((row: any, idx: number) => ({
      ...row,
      id: `${fileName}-${idx + 1}`
    }));

  } catch (error) {
    console.error('Failed to fetch data:', error);
    if (error.message === 'Authentication required') {
      window.location.href = '/auth';
    }
    throw error;
  }
}
