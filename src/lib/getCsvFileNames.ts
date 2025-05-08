import { formatDisplayText } from "./utils";
import { getAuthHeader } from "./auth";

/**
 * Fetches all available filenames from the API
 */
export async function getXlsxFileNames(): Promise<string[]> {
  console.log('Getting file names from API...');
  try {
    const headers = getAuthHeader();
    if (!headers) {
      throw new Error('Authentication required');
    }

    const response = await fetch('https://backorder.xclusivetradinginc.cloud/distinct-files-A', {
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('token_type');
        window.location.href = '/auth';
        return [];
      }
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response:', data);
    
    // API returns {distinct_file_names: string[]}
    const fileNames = data.distinct_file_names.map((name: string) => `Data/${name}`);
    console.log('Total files found:', fileNames.length);
    return fileNames;
  } catch (error) {
    console.error('Failed to fetch file names:', error);
    if (error.message === 'Authentication required') {
      window.location.href = '/auth';
    }
    return [];
  }
}

/**
 * Parses filter metadata from the XLSX filenames:
 * Returns { filterTypes: { [type]: FilterOption[] }, allFilters: FilterOption[] }
 * Adaptively finds all filter types, e.g. by-category, by-device, by-brand, etc.
 */
export function parseFiltersFromFilenames(filenames: string[]) {
  type FilterOption = {
    label: string;
    file: string;
    path: string[];
    type: string; // E.g. "category", "device", "brand", ...
  };
  const filterTypes: Record<string, FilterOption[]> = {};

  filenames.forEach((name) => {
    const cleanedName = name.startsWith("/") ? name.slice(1) : name;
    // Detect "by-xxx" where xxx is filter type (device, category, brand, etc)
    const match = cleanedName.match(/by-([a-z0-9-]+)_/i);
    if (match) {
      const filterType = match[1]; // e.g. category, device, brand, etc

      // Look for Deepest Path: after by-xxx_ until _p=, split by "_"
      // (by-category_foo_bar_baz_p=, by-brand_samsung_p=, etc)
      const mid = cleanedName.match(new RegExp(`by-${filterType}_(.+?)_p=`, 'i'));
      if (mid && mid[1]) {
        // Split components, allow for - and _ in names
        const path = mid[1].split('_').filter(Boolean);
        if (path.length) {
          const label = formatDisplayText(path[path.length - 1]);
          const opt: FilterOption = {
            label,
            file: cleanedName,
            path: path.map(formatDisplayText),
            type: filterType,
          };
          if (!filterTypes[filterType]) filterTypes[filterType] = [];
          filterTypes[filterType].push(opt);
        }
      }
    }
  });

  // Build a flat all-filters array for convenience if needed
  const allFilters = Object.values(filterTypes).flat();

  return {
    filterTypes,
    allFilters,
  };
}

