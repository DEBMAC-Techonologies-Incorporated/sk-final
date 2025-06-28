// Editor constants
export const DEFAULT_EDITOR_HEADER = '<h1 style="text-align: center"><strong>Barangay South Poblacion</strong></h1>';

// Letterhead template structure
export interface LetterheadConfig {
  provinceOrCity: 'province' | 'city';
  provinceCityName: string;
  municipalityOrCity: 'municipality' | 'city';
  municipalityCityName: string;
  barangayName: string;
  cityLogoUrl?: string;
  skLogoUrl?: string;
}

export const DEFAULT_LETTERHEAD_CONFIG: LetterheadConfig = {
  provinceOrCity: 'province',
  provinceCityName: 'CEBU',
  municipalityOrCity: 'city',
  municipalityCityName: 'NAGA',
  barangayName: 'SOUTH POBLACION',
  cityLogoUrl: undefined,
  skLogoUrl: undefined,
};

export const generateLetterheadHtml = (config: LetterheadConfig): string => {
  const cityLogo = config.cityLogoUrl 
    ? `<img src="${config.cityLogoUrl}" alt="City Logo" style="width: 80px; height: 80px; object-fit: contain; display: block; border: none; outline: none;" />`
    : `<div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #ccc; text-align: center; background-color: transparent; border: none;">[City Logo]</div>`;
    
  const skLogo = config.skLogoUrl 
    ? `<img src="${config.skLogoUrl}" alt="SK Logo" style="width: 80px; height: 80px; object-fit: contain; display: block; border: none; outline: none;" />`
    : `<div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #ccc; text-align: center; background-color: transparent; border: none;">[SK Logo]</div>`;

  return `
    <div style="width: 100%; margin-bottom: 24px; page-break-inside: avoid; border: none; outline: none; background: transparent;">
      <table style="width: 100%; border-collapse: collapse; margin: 0 auto; max-width: 100%; border: none; outline: none;" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="width: 100px; text-align: center; vertical-align: middle; padding: 8px; border: none; outline: none;">
            ${cityLogo}
          </td>
          <td style="text-align: center; vertical-align: middle; padding: 8px 16px; width: auto; border: none; outline: none;">
            <div style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.3; border: none; outline: none;">
              <div style="font-size: 14px; font-weight: normal; margin-bottom: 2px; border: none;">Republic of the Philippines</div>
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 2px; border: none;">${config.provinceOrCity.toUpperCase()} OF ${config.provinceCityName.toUpperCase()}</div>
              <div style="font-size: 15px; font-weight: normal; margin-bottom: 2px; border: none;">${config.municipalityOrCity === 'city' ? 'City' : 'Municipality'} of ${config.municipalityCityName}</div>
              <div style="font-size: 14px; font-weight: normal; margin-bottom: 2px; border: none;">Barangay ${config.barangayName}</div>
              <div style="font-size: 15px; font-weight: bold; margin-top: 4px; border: none;">OFFICE OF THE SANGGUNIANG KABATAAN</div>
            </div>
          </td>
          <td style="width: 100px; text-align: center; vertical-align: middle; padding: 8px; border: none; outline: none;">
            ${skLogo}
          </td>
        </tr>
      </table>
      <div style="border-top: 3px solid #000; width: 100%; margin-top: 16px; border-left: none; border-right: none; border-bottom: none;"></div>
    </div>
  `;
};

// Determine which document types need letterheads
export const needsLetterhead = (step: string): boolean => {
  // Official documents that need letterhead
  const officialDocuments = ['planning', 'approval', 'withdrawal'];
  return officialDocuments.includes(step);
};

// Get letterhead configuration from localStorage
export const getLetterheadConfig = (): LetterheadConfig | null => {
  if (typeof window === 'undefined') return null;
  const config = localStorage.getItem('letterheadConfig');
  return config ? JSON.parse(config) : null;
};

// Apply letterhead to content if needed (for export purposes)
export const applyLetterheadToContent = (content: string, step: string): string => {
  if (!needsLetterhead(step)) {
    return content;
  }
  
  const config = getLetterheadConfig();
  if (!config) {
    return content;
  }
  
  const letterheadHtml = generateLetterheadHtml(config);
  return `${letterheadHtml}${content}`;
};

// Add other constants here as needed 