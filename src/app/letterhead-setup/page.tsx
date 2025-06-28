'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileImage, Eye, Save, ArrowLeft, Building, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LetterheadConfig, DEFAULT_LETTERHEAD_CONFIG, generateLetterheadHtml } from '@/lib/constants';

export default function LetterheadSetupPage() {
  const router = useRouter();
  const [config, setConfig] = useState<LetterheadConfig>(DEFAULT_LETTERHEAD_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const cityLogoInputRef = useRef<HTMLInputElement>(null);
  const skLogoInputRef = useRef<HTMLInputElement>(null);

  // Check if user has completed budget onboarding
  useEffect(() => {
    const budgetData = localStorage.getItem('budgetData');
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    
    if (!budgetData || !onboardingComplete) {
      router.push('/onboarding');
      return;
    }

    // Load existing letterhead config if available
    const savedConfig = localStorage.getItem('letterheadConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, [router]);

  const handleImageUpload = async (file: File, type: 'city' | 'sk') => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB');
      return;
    }

    try {
      // Convert file to base64 for local storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        
        setConfig(prev => ({
          ...prev,
          [type === 'city' ? 'cityLogoUrl' : 'skLogoUrl']: base64
        }));
        
        setError(null);
      };
      
      reader.onerror = () => {
        setError('Failed to read image file');
      };
      
      reader.readAsDataURL(file);
      
    } catch (err) {
      setError('Failed to upload image');
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!config.provinceCityName.trim()) {
      setError('Province/City name is required');
      return;
    }
    
    if (!config.municipalityCityName.trim()) {
      setError('Municipality/City name is required');
      return;
    }
    
    if (!config.barangayName.trim()) {
      setError('Barangay name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Save letterhead configuration
      localStorage.setItem('letterheadConfig', JSON.stringify(config));
      localStorage.setItem('letterheadSetupComplete', 'true');
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/');
      }, 1000);
      
    } catch (err) {
      setError('Failed to save letterhead configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/onboarding')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Letterhead Setup</h1>
            <p className="text-muted-foreground">Configure your official document letterhead</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Form */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Letterhead Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Province/City Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Province or City</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="provinceOrCity"
                      value="province"
                      checked={config.provinceOrCity === 'province'}
                      onChange={(e) => setConfig(prev => ({ ...prev, provinceOrCity: e.target.value as 'province' | 'city' }))}
                      className="mr-2"
                    />
                    Province of
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="provinceOrCity"
                      value="city"
                      checked={config.provinceOrCity === 'city'}
                      onChange={(e) => setConfig(prev => ({ ...prev, provinceOrCity: e.target.value as 'province' | 'city' }))}
                      className="mr-2"
                    />
                    City of
                  </label>
                </div>
                <input
                  type="text"
                  value={config.provinceCityName}
                  onChange={(e) => setConfig(prev => ({ ...prev, provinceCityName: e.target.value.toUpperCase() }))}
                  placeholder="Enter province/city name"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Municipality/City Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Municipality or City</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="municipalityOrCity"
                      value="municipality"
                      checked={config.municipalityOrCity === 'municipality'}
                      onChange={(e) => setConfig(prev => ({ ...prev, municipalityOrCity: e.target.value as 'municipality' | 'city' }))}
                      className="mr-2"
                    />
                    Municipality of
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="municipalityOrCity"
                      value="city"
                      checked={config.municipalityOrCity === 'city'}
                      onChange={(e) => setConfig(prev => ({ ...prev, municipalityOrCity: e.target.value as 'municipality' | 'city' }))}
                      className="mr-2"
                    />
                    City of
                  </label>
                </div>
                <input
                  type="text"
                  value={config.municipalityCityName}
                  onChange={(e) => setConfig(prev => ({ ...prev, municipalityCityName: e.target.value }))}
                  placeholder="Enter municipality/city name"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Barangay */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Barangay
                </label>
                <input
                  type="text"
                  value={config.barangayName}
                  onChange={(e) => setConfig(prev => ({ ...prev, barangayName: e.target.value }))}
                  placeholder="Enter barangay name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* City Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">City/Municipality Logo</label>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => cityLogoInputRef.current?.click()}
                    className="flex-1"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    {config.cityLogoUrl ? 'Change City Logo' : 'Upload City Logo'}
                  </Button>
                  {config.cityLogoUrl && (
                    <div className="w-12 h-12 border rounded overflow-hidden">
                      <img 
                        src={config.cityLogoUrl} 
                        alt="City Logo Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <input
                  ref={cityLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'city')}
                  className="hidden"
                />
              </div>

              {/* SK Logo Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">SK Logo</label>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => skLogoInputRef.current?.click()}
                    className="flex-1"
                  >
                    <FileImage className="w-4 h-4 mr-2" />
                    {config.skLogoUrl ? 'Change SK Logo' : 'Upload SK Logo'}
                  </Button>
                  {config.skLogoUrl && (
                    <div className="w-12 h-12 border rounded overflow-hidden">
                      <img 
                        src={config.skLogoUrl} 
                        alt="SK Logo Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <input
                  ref={skLogoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'sk')}
                  className="hidden"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowPreview(!showPreview)}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showPreview ? 'Hide Preview' : 'Show Preview'}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save & Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {showPreview && (
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Letterhead Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-white border rounded-lg p-6">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: generateLetterheadHtml(config) 
                    }}
                  />
                  <div className="mt-4 p-4 bg-gray-50 rounded border-t">
                    <p className="text-sm text-gray-600">
                      This is how your letterhead will appear on official documents.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 