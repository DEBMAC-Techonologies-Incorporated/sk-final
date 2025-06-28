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
    ? `<img src="${config.cityLogoUrl}" alt="City Logo" width="65" height="65" style="object-fit: contain;" />`
    : `<div style="width: 65px; height: 65px; font-size: 9px; color: #999; text-align: center; border: 1px dashed #ccc; line-height: 65px;">[City Logo]</div>`;
    
  const skLogo = config.skLogoUrl 
    ? `<img src="${config.skLogoUrl}" alt="SK Logo" width="65" height="65" style="object-fit: contain;" />`
    : `<div style="width: 65px; height: 65px; font-size: 9px; color: #999; text-align: center; border: 1px dashed #ccc; line-height: 65px;">[SK Logo]</div>`;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px; font-family: 'Times New Roman', serif; border: none; border-collapse: collapse;">
      <tr>
        <td width="10%" align="center" valign="middle" style="border: none; padding: 4px;">
          <!-- Left Margin 10% -->
        </td>
        <td width="18%" align="center" valign="middle" style="border: none; padding: 4px; text-align: center;">
          ${cityLogo}
        </td>
        <td width="44%" align="center" valign="middle" style="font-family: 'Times New Roman', serif; color: #000; padding: 4px 8px; border: none; line-height: 1.1;">
          <div style="font-size: 11px; margin: 0; line-height: 1.1; text-align: center;">Republic of the Philippines</div>
          <div style="font-size: 13px; font-weight: bold; margin: 0; line-height: 1.1; text-align: center;">${config.provinceOrCity.toUpperCase()} OF ${config.provinceCityName.toUpperCase()}</div>
          <div style="font-size: 12px; margin: 0; line-height: 1.1; text-align: center;">${config.municipalityOrCity === 'city' ? 'City' : 'Municipality'} of ${config.municipalityCityName}</div>
          <div style="font-size: 11px; margin: 0; line-height: 1.1; text-align: center;">Barangay ${config.barangayName}</div>
          <div style="font-size: 12px; font-weight: bold; margin: 0; line-height: 1.1; text-align: center; white-space: nowrap;">OFFICE OF THE SANGGUNIANG KABATAAN</div>
        </td>
        <td width="18%" align="center" valign="middle" style="border: none; padding: 4px; text-align: center;">
          ${skLogo}
        </td>
        <td width="10%" align="center" valign="middle" style="border: none; padding: 4px;">
          <!-- Right Margin 10% -->
        </td>
      </tr>
      <tr>
        <td colspan="5" style="padding: 4px 0 0 0; border: none;">
          <hr style="border: none; border-top: 1px solid #000; margin: 0; height: 1px;" />
        </td>
      </tr>
    </table>
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