import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

interface Region {
  id: number;
  region_code: string;
  region_name: string;
}

interface City {
  id: number;
  city_code: string;
  city_name: string;
}

interface Barangay {
  id: number;
  barangay_code: string;
  barangay_name: string;
}

interface Village {
  id: number;
  village_code: string;
  village_name: string;
}

interface Plan {
  id: number;
  plan_name: string;
  description?: string;
  price: number;
}

interface Promo {
  id: number;
  name: string;
  status: string;
}

interface FormState {
  email: string;
  mobile: string;
  firstName: string;
  lastName: string;
  middleInitial: string;
  secondaryMobile: string;
  region: string;
  city: string;
  barangay: string;
  location: string;
  completeLocation: string;
  installationAddress: string;
  landmark: string;
  nearestLandmark1Image: File | null;
  nearestLandmark2Image: File | null;
  referredBy: string;
  plan: string;
  promo: string;
  proofOfBilling: File | null;
  governmentIdPrimary: File | null;
  governmentIdSecondary: File | null;
  houseFrontPicture: File | null;
  promoProof: File | null;
  privacyAgreement: boolean;
}

export interface MultiStepFormRef {
  saveColors: () => void;
}

interface MultiStepFormProps {
  showEditButton?: boolean;
  onLayoutChange?: (layout: 'original' | 'multistep') => void;
  currentLayout?: 'original' | 'multistep';
  isEditMode?: boolean;
  onEditModeChange?: (isEdit: boolean) => void;
  requireFields?: boolean;
}

const MultiStepForm = forwardRef<MultiStepFormRef, MultiStepFormProps>(({ showEditButton = false, onLayoutChange, currentLayout = 'multistep', isEditMode: externalIsEditMode, onEditModeChange, requireFields = true }, ref) => {
  const apiBaseUrl = process.env.REACT_APP_API_URL || "https://backend1.atssfiber.ph";
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const isEditMode = externalIsEditMode !== undefined ? externalIsEditMode : false;
  const [backgroundColor, setBackgroundColor] = useState('');
  const [formBgColor, setFormBgColor] = useState('');
  const [buttonColor, setButtonColor] = useState('#3B82F6');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [initialEditValues, setInitialEditValues] = useState<{backgroundColor: string; buttonColor: string; logoPreview: string}>({backgroundColor: '', buttonColor: '', logoPreview: ''});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  useEffect(() => {
    const fetchUISettings = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/form-ui/settings`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            if (result.data.page_hex) {
              setBackgroundColor(result.data.page_hex);
            } else {
              const savedBgColor = localStorage.getItem('formPageBackgroundColor');
              if (savedBgColor) setBackgroundColor(savedBgColor);
            }
            
            if (result.data.form_hex) {
              setFormBgColor(result.data.form_hex);
            } else {
              const savedFormBgColor = localStorage.getItem('formContainerBackgroundColor');
              if (savedFormBgColor) setFormBgColor(savedFormBgColor);
            }
            
            if (result.data.logo) {
              setLogoPreview(`${apiBaseUrl}/storage/${result.data.logo}`);
            }
          }
        } else {
          const savedBgColor = localStorage.getItem('formPageBackgroundColor');
          const savedFormBgColor = localStorage.getItem('formContainerBackgroundColor');
          if (savedBgColor) setBackgroundColor(savedBgColor);
          if (savedFormBgColor) setFormBgColor(savedFormBgColor);
        }
      } catch (error) {
        console.error('Error fetching UI settings:', error);
        const savedBgColor = localStorage.getItem('formPageBackgroundColor');
        const savedFormBgColor = localStorage.getItem('formContainerBackgroundColor');
        if (savedBgColor) setBackgroundColor(savedBgColor);
        if (savedFormBgColor) setFormBgColor(savedFormBgColor);
      }
    };
    
    fetchUISettings();
  }, []);

  const handleEdit = () => {
    if (isEditMode && hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to exit without saving?');
      if (!confirm) {
        return;
      }
      setBackgroundColor(initialEditValues.backgroundColor);
      setButtonColor(initialEditValues.buttonColor);
      setLogoPreview(initialEditValues.logoPreview);
      setLogoFile(null);
      setHasUnsavedChanges(false);
    }
    
    if (!isEditMode) {
      setInitialEditValues({
        backgroundColor: backgroundColor,
        buttonColor: buttonColor,
        logoPreview: logoPreview
      });
      setHasUnsavedChanges(false);
    }
    
    if (onEditModeChange) {
      onEditModeChange(!isEditMode);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setHasUnsavedChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveColors = async () => {
    try {
      const formData = new FormData();
      
      if (backgroundColor) {
        formData.append('page_hex', backgroundColor);
      }
      if (formBgColor) {
        formData.append('form_hex', formBgColor);
      }
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      
      const response = await fetch(`${apiBaseUrl}/api/form-ui/settings`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          if (backgroundColor) {
            localStorage.setItem('formPageBackgroundColor', backgroundColor);
          }
          if (formBgColor) {
            localStorage.setItem('formContainerBackgroundColor', formBgColor);
          }
          setHasUnsavedChanges(false);
          alert('Colors saved successfully!');
          if (onEditModeChange) {
            onEditModeChange(false);
          }
        } else {
          alert('Failed to save colors: ' + (result.message || 'Unknown error'));
        }
      } else {
        alert('Failed to save colors to database');
      }
    } catch (error) {
      console.error('Error saving colors:', error);
      alert('Error saving colors. Please try again.');
    }
  };

  const isColorDark = (color: string): boolean => {
    if (!color) return false;
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  };

  const getTextColor = (): string => {
    return isColorDark(formBgColor) ? '#FFFFFF' : '#1F2937';
  };

  const getLabelColor = (): string => {
    return isColorDark(formBgColor) ? '#E5E7EB' : '#374151';
  };

  const getBorderColor = (): string => {
    return isColorDark(formBgColor) ? '#4B5563' : '#E5E7EB';
  };
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);

  useImperativeHandle(ref, () => ({
    saveColors: () => {}
  }));

  const [formData, setFormData] = useState<FormState>({
    email: '',
    mobile: '',
    firstName: '',
    lastName: '',
    middleInitial: '',
    secondaryMobile: '',
    region: '',
    city: '',
    barangay: '',
    location: '',
    completeLocation: '',
    installationAddress: '',
    landmark: '',
    nearestLandmark1Image: null,
    nearestLandmark2Image: null,
    referredBy: '',
    plan: '',
    promo: '',
    proofOfBilling: null,
    governmentIdPrimary: null,
    governmentIdSecondary: null,
    houseFrontPicture: null,
    promoProof: null,
    privacyAgreement: false
  });

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/region`);
        if (!response.ok) throw new Error('Failed to fetch region');
        const data = await response.json();
        setRegions(data.regions || []);
      } catch (error) {
        console.error('Error fetching regions:', error);
        setRegions([]);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/plans`);
        if (!response.ok) throw new Error('Failed to fetch plans');
        const data = await response.json();
        setPlans(data.data || []);
      } catch (error) {
        console.error('Error fetching plans:', error);
        setPlans([]);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const fetchPromos = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/promo_list`);
        if (!response.ok) throw new Error('Failed to fetch promos');
        const data = await response.json();
        setPromos(data.data || []);
      } catch (error) {
        console.error('Error fetching promos:', error);
        setPromos([]);
      }
    };
    fetchPromos();
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (formData.region) {
        try {
          const response = await fetch(`${apiBaseUrl}/api/cities?region_code=${formData.region}`);
          if (!response.ok) throw new Error('Failed to fetch cities');
          const data = await response.json();
          setCities(data.cities || []);
          setFormData(prev => ({
            ...prev,
            city: '',
            barangay: '',
            location: '',
            completeLocation: ''
          }));
          setBarangays([]);
        } catch (error) {
          console.error('Error fetching cities:', error);
          setCities([]);
        }
      } else {
        setCities([]);
      }
    };
    fetchCities();
  }, [formData.region]);

  useEffect(() => {
    const fetchBarangays = async () => {
      if (formData.city) {
        try {
          const response = await fetch(`${apiBaseUrl}/api/barangays?city_code=${formData.city}`);
          if (!response.ok) throw new Error('Failed to fetch barangays');
          const data = await response.json();
          setBarangays(data.barangays || []);
          setFormData(prev => ({
            ...prev,
            barangay: '',
            location: '',
            completeLocation: ''
          }));
          setVillages([]);
        } catch (error) {
          console.error('Error fetching barangays:', error);
          setBarangays([]);
        }
      } else {
        setBarangays([]);
      }
    };
    fetchBarangays();
  }, [formData.city]);

  useEffect(() => {
    const fetchVillages = async () => {
      if (formData.barangay) {
        try {
          const response = await fetch(`${apiBaseUrl}/api/villages?barangay_code=${formData.barangay}`);
          if (!response.ok) throw new Error('Failed to fetch villages');
          const data = await response.json();
          setVillages(data.villages || []);
          setFormData(prev => ({
            ...prev,
            location: '',
            completeLocation: ''
          }));
        } catch (error) {
          console.error('Error fetching villages:', error);
          setVillages([]);
        }
      } else {
        setVillages([]);
      }
    };
    fetchVillages();
  }, [formData.barangay]);

  const [fullLocationText, setFullLocationText] = useState<string>('');

  useEffect(() => {
    const selectedRegion = regions.find(r => r.region_code === formData.region);
    const selectedCity = cities.find(c => c.city_code === formData.city);
    const selectedBarangay = barangays.find(b => b.barangay_code === formData.barangay);
    const selectedLocation = villages.find(v => v.village_code === formData.location);
    
    const locationParts = [];
    
    if (selectedLocation) locationParts.push(selectedLocation.village_name);
    if (selectedBarangay) locationParts.push(selectedBarangay.barangay_name);
    if (selectedCity) locationParts.push(selectedCity.city_name);
    if (selectedRegion) locationParts.push(selectedRegion.region_name);
    
    const locationText = locationParts.join(', ');
    
    setFullLocationText(locationText);
    if (locationText) {
      setFormData(prev => ({
        ...prev,
        completeLocation: locationText
      }));
    }
  }, [formData.region, formData.city, formData.barangay, formData.location, regions, cities, barangays, villages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        [name]: files[0]
      }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const validateStep = (step: number): boolean => {
    if (!requireFields) {
      return true;
    }
    switch (step) {
      case 1:
        return !!(
          formData.email &&
          formData.mobile &&
          formData.firstName &&
          formData.lastName
        );
      case 2:
        return !!(
          formData.region &&
          formData.city &&
          formData.barangay &&
          formData.completeLocation &&
          formData.installationAddress &&
          formData.landmark &&
          formData.nearestLandmark1Image &&
          formData.nearestLandmark2Image
        );
      case 3:
        return !!(
          formData.plan &&
          formData.proofOfBilling &&
          formData.governmentIdPrimary &&
          formData.houseFrontPicture &&
          formData.privacyAgreement &&
          (!formData.promo || formData.promoProof)
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      alert('Please fill in all required fields before proceeding.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacyAgreement) {
      alert('Please agree to the privacy policy before submitting.');
      return;
    }
    
    const submissionData = new FormData();
    
    submissionData.append('firstName', formData.firstName);
    submissionData.append('middleInitial', formData.middleInitial);
    submissionData.append('lastName', formData.lastName);
    submissionData.append('email', formData.email);
    submissionData.append('mobile', formData.mobile);
    submissionData.append('secondaryMobile', formData.secondaryMobile || '');
    
    const selectedRegion = formData.region ? regions.find(r => r.region_code === formData.region)?.region_name || '' : '';
    const selectedCity = formData.city ? cities.find(c => c.city_code === formData.city)?.city_name || '' : '';
    const selectedBarangay = formData.barangay ? barangays.find(b => b.barangay_code === formData.barangay)?.barangay_name || '' : '';
    const selectedLocation = formData.location ? villages.find(v => v.village_code === formData.location)?.village_name || '' : '';
    
    submissionData.append('region', selectedRegion);
    submissionData.append('city', selectedCity);
    submissionData.append('barangay', selectedBarangay);
    submissionData.append('location', selectedLocation);
    submissionData.append('installationAddress', formData.installationAddress);
    submissionData.append('landmark', formData.landmark);
    submissionData.append('referredBy', formData.referredBy);
    
    submissionData.append('plan', formData.plan);
    submissionData.append('promo', formData.promo || '');
    
    if (formData.proofOfBilling) submissionData.append('proofOfBilling', formData.proofOfBilling);
    if (formData.governmentIdPrimary) submissionData.append('governmentIdPrimary', formData.governmentIdPrimary);
    if (formData.governmentIdSecondary) submissionData.append('governmentIdSecondary', formData.governmentIdSecondary);
    if (formData.houseFrontPicture) submissionData.append('houseFrontPicture', formData.houseFrontPicture);
    if (formData.nearestLandmark1Image) submissionData.append('nearestLandmark1Image', formData.nearestLandmark1Image);
    if (formData.nearestLandmark2Image) submissionData.append('nearestLandmark2Image', formData.nearestLandmark2Image);
    if (formData.promoProof) submissionData.append('promoProof', formData.promoProof);
    
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${apiBaseUrl}/api/application/store`, {
        method: 'POST',
        body: submissionData,
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Validation errors:', errorData);
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          throw new Error(errorMessages.join('\n'));
        }
        throw new Error(errorData.message || 'Failed to submit application');
      }
      
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = 'Failed to submit application. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      email: '',
      mobile: '',
      firstName: '',
      lastName: '',
      middleInitial: '',
      secondaryMobile: '',
      region: '',
      city: '',
      barangay: '',
      location: '',
      completeLocation: '',
      installationAddress: '',
      landmark: '',
      nearestLandmark1Image: null,
      nearestLandmark2Image: null,
      referredBy: '',
      plan: '',
      promo: '',
      proofOfBilling: null,
      governmentIdPrimary: null,
      governmentIdSecondary: null,
      houseFrontPicture: null,
      promoProof: null,
      privacyAgreement: false
    });
    
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => {
      (input as HTMLInputElement).value = '';
    });
    
    setCurrentStep(1);
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors`}
                style={{
                  backgroundColor: currentStep >= step ? buttonColor : (isColorDark(formBgColor) ? '#374151' : '#E5E7EB'),
                  color: currentStep >= step ? '#FFFFFF' : (isColorDark(formBgColor) ? '#9CA3AF' : '#6B7280')
                }}
              >
                {step}
              </div>
              <div 
                className="mt-2 text-sm font-medium"
                style={{ color: currentStep >= step ? buttonColor : getLabelColor() }}
              >
                {step === 1 && 'Contact Info'}
                {step === 2 && 'Installation Address'}
                {step === 3 && 'Plan & Documents'}
              </div>
            </div>
            {step < 3 && (
              <div
                className="h-1 flex-1 mx-2 transition-colors"
                style={{
                  backgroundColor: currentStep > step ? buttonColor : (isColorDark(formBgColor) ? '#374151' : '#E5E7EB')
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderContactInformation = () => (
    <section>
      <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-700" style={{ color: getTextColor() }}>Contact Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="email" style={{ color: getLabelColor() }}>
            Email {requireFields && <span className="text-red-500">*</span>}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required={requireFields}
            placeholder="Enter your email address"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="mobile" style={{ color: getLabelColor() }}>
            Mobile {requireFields && <span className="text-red-500">*</span>}
          </label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleInputChange}
            required={requireFields}
            placeholder="09********"
            pattern="09[0-9]{9}"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
          <small className="text-sm" style={{ color: getLabelColor(), opacity: 0.8 }}>Format: 09********</small>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="firstName" style={{ color: getLabelColor() }}>
            First Name {requireFields && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required={requireFields}
            placeholder="Enter your first name"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="lastName" style={{ color: getLabelColor() }}>
            Last Name {requireFields && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required={requireFields}
            placeholder="Enter your last name"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="middleInitial" style={{ color: getLabelColor() }}>
            Middle Initial
          </label>
          <input
            type="text"
            id="middleInitial"
            name="middleInitial"
            value={formData.middleInitial}
            onChange={handleInputChange}
            maxLength={1}
            placeholder="M"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="secondaryMobile" style={{ color: getLabelColor() }}>
            Secondary Mobile
          </label>
          <input
            type="tel"
            id="secondaryMobile"
            name="secondaryMobile"
            value={formData.secondaryMobile}
            onChange={handleInputChange}
            placeholder="09********"
            pattern="09[0-9]{9}"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
        </div>
      </div>
    </section>
  );

  const renderInstallationAddress = () => (
    <section>
      <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-700" style={{ color: getTextColor() }}>Installation Address</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="region" style={{ color: getLabelColor() }}>
            Region {requireFields && <span className="text-red-500">*</span>}
          </label>
          <select
            id="region"
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            required={requireFields}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          >
            <option value="">Select region</option>
            {regions.map(region => (
              <option key={region.id} value={region.region_code}>{region.region_name}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="city" style={{ color: getLabelColor() }}>
            City/Municipality {requireFields && <span className="text-red-500">*</span>}
          </label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            required={requireFields}
            disabled={!formData.region}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          >
            <option value="">Select city/municipality</option>
            {cities.map(city => (
              <option key={city.id} value={city.city_code}>{city.city_name}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="barangay" style={{ color: getLabelColor() }}>
            Barangay {requireFields && <span className="text-red-500">*</span>}
          </label>
          <select
            id="barangay"
            name="barangay"
            value={formData.barangay}
            onChange={handleInputChange}
            required={requireFields}
            disabled={!formData.city}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          >
            <option value="">Select barangay</option>
            {barangays.map(barangay => (
              <option key={barangay.id} value={barangay.barangay_code}>{barangay.barangay_name}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="location" style={{ color: getLabelColor() }}>
            Location
          </label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            disabled={!formData.barangay}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          >
            <option value="">Select location</option>
            {villages.map(village => (
              <option key={village.id} value={village.village_code}>{village.village_name}</option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="completeLocation" style={{ color: getLabelColor() }}>
            Complete Location {requireFields && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            id="completeLocation"
            name="completeLocation"
            value={fullLocationText}
            readOnly
            required={requireFields}
            placeholder="Select region, city, barangay, and location above"
            className="w-full border rounded px-3 py-2"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#0a0a0a' : '#f9fafb',
              color: getTextColor()
            }}
          />
          {!fullLocationText && (
            <small className="text-sm" style={{ color: getLabelColor(), opacity: 0.8 }}>This field will auto-populate based on your selections above</small>
          )}
        </div>
        
        <div className="col-span-1 md:col-span-2 mb-4">
          <label className="block font-medium mb-2" htmlFor="installationAddress" style={{ color: getLabelColor() }}>
            Installation Address {requireFields && <span className="text-red-500">*</span>}
          </label>
          <textarea
            id="installationAddress"
            name="installationAddress"
            value={formData.installationAddress}
            onChange={handleInputChange}
            required={requireFields}
            placeholder="Enter complete address details"
            rows={3}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="landmark" style={{ color: getLabelColor() }}>
            Landmark {requireFields && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            id="landmark"
            name="landmark"
            value={formData.landmark}
            onChange={handleInputChange}
            required={requireFields}
            placeholder="Enter a landmark"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="nearestLandmark1Image" style={{ color: getLabelColor() }}>
            Nearest Landmark #1 Image {requireFields && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center">
            <input
              type="file"
              id="nearestLandmark1Image"
              name="nearestLandmark1Image"
              onChange={handleFileChange}
              required={requireFields}
              accept=".jpg,.jpeg,.png"
              className="hidden"
            />
            <label 
              htmlFor="nearestLandmark1Image" 
              className="cursor-pointer border rounded px-3 py-2 text-sm"
              style={{ 
                borderColor: getBorderColor(),
                backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb',
                color: getTextColor()
              }}
            >
              Choose Image
            </label>
            <span className="ml-3 text-sm" style={{ color: getLabelColor() }}>
              {formData.nearestLandmark1Image ? formData.nearestLandmark1Image.name : 'No image chosen'}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="nearestLandmark2Image" style={{ color: getLabelColor() }}>
            Nearest Landmark #2 Image {requireFields && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center">
            <input
              type="file"
              id="nearestLandmark2Image"
              name="nearestLandmark2Image"
              onChange={handleFileChange}
              required={requireFields}
              accept=".jpg,.jpeg,.png"
              className="hidden"
            />
            <label 
              htmlFor="nearestLandmark2Image" 
              className="cursor-pointer border rounded px-3 py-2 text-sm"
              style={{ 
                borderColor: getBorderColor(),
                backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb',
                color: getTextColor()
              }}
            >
              Choose Image
            </label>
            <span className="ml-3 text-sm" style={{ color: getLabelColor() }}>
              {formData.nearestLandmark2Image ? formData.nearestLandmark2Image.name : 'No image chosen'}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="referredBy" style={{ color: getLabelColor() }}>
            Referred By
          </label>
          <input
            type="text"
            id="referredBy"
            name="referredBy"
            value={formData.referredBy}
            onChange={handleInputChange}
            placeholder="Enter referrer name (optional)"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
        </div>
      </div>
    </section>
  );

  const renderPlanAndDocuments = () => (
    <section>
      <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-700" style={{ color: getTextColor() }}>Plan Selection</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="plan" style={{ color: getLabelColor() }}>
            Plan {requireFields && <span className="text-red-500">*</span>}
          </label>
          <select
            id="plan"
            name="plan"
            value={formData.plan}
            onChange={handleInputChange}
            required={requireFields}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          >
            <option value="">Select plan</option>
            {plans.map(plan => (
              <option key={plan.id} value={plan.id}>
                {plan.plan_name} - ₱{plan.price.toLocaleString()}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="promo" style={{ color: getLabelColor() }}>
            Promo
          </label>
          <select
            id="promo"
            name="promo"
            value={formData.promo}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{ 
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          >
            <option value="">None</option>
            {promos.map(promo => (
              <option key={promo.id} value={promo.name}>
                {promo.name}
              </option>
            ))}
          </select>
          {promos.length === 0 && (
            <small className="text-sm" style={{ color: getLabelColor(), opacity: 0.8 }}>No active promos available</small>
          )}
        </div>
      </div>
      
      <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-700" style={{ color: getTextColor() }}>Upload Documents</h3>
      
      <p className="mb-4 text-sm" style={{ color: getLabelColor() }}>Allowed: JPG/PNG/PDF, up to 2 MB each.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="proofOfBilling" style={{ color: getLabelColor() }}>
            Proof of Billing {requireFields && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center">
            <input
              type="file"
              id="proofOfBilling"
              name="proofOfBilling"
              onChange={handleFileChange}
              required={requireFields}
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
            />
            <label 
              htmlFor="proofOfBilling" 
              className="cursor-pointer border rounded px-3 py-2 text-sm"
              style={{ 
                borderColor: getBorderColor(),
                backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb',
                color: getTextColor()
              }}
            >
              Choose File
            </label>
            <span className="ml-3 text-sm" style={{ color: getLabelColor() }}>
              {formData.proofOfBilling ? formData.proofOfBilling.name : 'No file chosen'}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="governmentIdPrimary" style={{ color: getLabelColor() }}>
            Government Valid ID (Primary) {requireFields && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center">
            <input
              type="file"
              id="governmentIdPrimary"
              name="governmentIdPrimary"
              onChange={handleFileChange}
              required={requireFields}
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
            />
            <label 
              htmlFor="governmentIdPrimary" 
              className="cursor-pointer border rounded px-3 py-2 text-sm"
              style={{ 
                borderColor: getBorderColor(),
                backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb',
                color: getTextColor()
              }}
            >
              Choose File
            </label>
            <span className="ml-3 text-sm" style={{ color: getLabelColor() }}>
              {formData.governmentIdPrimary ? formData.governmentIdPrimary.name : 'No file chosen'}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="governmentIdSecondary" style={{ color: getLabelColor() }}>
            Government Valid ID (Secondary)
          </label>
          <div className="flex items-center">
            <input
              type="file"
              id="governmentIdSecondary"
              name="governmentIdSecondary"
              onChange={handleFileChange}
              accept=".jpg,.jpeg,.png,.pdf"
              className="hidden"
            />
            <label 
              htmlFor="governmentIdSecondary" 
              className="cursor-pointer border rounded px-3 py-2 text-sm"
              style={{ 
                borderColor: getBorderColor(),
                backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb',
                color: getTextColor()
              }}
            >
              Choose File
            </label>
            <span className="ml-3 text-sm" style={{ color: getLabelColor() }}>
              {formData.governmentIdSecondary ? formData.governmentIdSecondary.name : 'No file chosen'}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="houseFrontPicture" style={{ color: getLabelColor() }}>
            House Front Picture {requireFields && <span className="text-red-500">*</span>}
          </label>
          <div className="flex items-center">
            <input
              type="file"
              id="houseFrontPicture"
              name="houseFrontPicture"
              onChange={handleFileChange}
              required={requireFields}
              accept=".jpg,.jpeg,.png"
              className="hidden"
            />
            <label 
              htmlFor="houseFrontPicture" 
              className="cursor-pointer border rounded px-3 py-2 text-sm"
              style={{ 
                borderColor: getBorderColor(),
                backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb',
                color: getTextColor()
              }}
            >
              Choose File
            </label>
            <span className="ml-3 text-sm" style={{ color: getLabelColor() }}>
              {formData.houseFrontPicture ? formData.houseFrontPicture.name : 'No file chosen'}
            </span>
          </div>
        </div>
        
        {formData.promo && formData.promo !== '' && (
          <div className="mb-4">
            <label className="block font-medium mb-2" htmlFor="promoProof" style={{ color: getLabelColor() }}>
              Promo Proof Document {requireFields && <span className="text-red-500">*</span>}
            </label>
            <div className="flex items-center">
              <input
                type="file"
                id="promoProof"
                name="promoProof"
                onChange={handleFileChange}
                required={requireFields}
                accept=".jpg,.jpeg,.png,.pdf"
                className="hidden"
              />
              <label 
                htmlFor="promoProof" 
                className="cursor-pointer border rounded px-3 py-2 text-sm"
                style={{ 
                  borderColor: getBorderColor(),
                  backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb',
                  color: getTextColor()
                }}
              >
                Choose File
              </label>
              <span className="ml-3 text-sm" style={{ color: getLabelColor() }}>
                {formData.promoProof ? formData.promoProof.name : 'No file chosen'}
              </span>
            </div>
            <small className="text-sm" style={{ color: getLabelColor(), opacity: 0.8 }}>Required when a promo is selected</small>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="privacyAgreement"
            name="privacyAgreement"
            checked={formData.privacyAgreement}
            onChange={handleCheckboxChange}
            required
            className="mr-2 h-4 w-4"
          />
          <label htmlFor="privacyAgreement" className="text-sm" style={{ color: getLabelColor() }}>
            I agree to the processing of my personal data in accordance with the Data Privacy Act of 2012 and ISO 27001-aligned policies. {requireFields && <span className="text-red-500">*</span>}
          </label>
        </div>
      </div>
    </section>
  );

  return (
    <div style={{ backgroundColor: backgroundColor || '#1a1a1a', minHeight: '100vh', padding: '2rem 0' }}>
      <div className="mx-auto max-w-4xl px-4">
        {isEditMode && (
          <div className="mb-6 border-2 rounded-lg p-6" style={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold" style={{ color: '#1F2937' }}>Edit</h3>
              <button
                onClick={handleSaveColors}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Save
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Upload Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full border-2 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937'
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative h-11 w-24 rounded-lg border-2 overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                    <input
                      type="color"
                      value={backgroundColor || '#1a1a1a'}
                      onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="absolute inset-0 w-full h-full cursor-pointer"
                      style={{ border: 'none' }}
                    />
                  </div>
                  <input
                    type="text"
                    value={backgroundColor || '#1a1a1a'}
                    onChange={(e) => {
                      setBackgroundColor(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="#1a1a1a"
                    className="flex-1 border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#1F2937'
                    }}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Button Color
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative h-11 w-24 rounded-lg border-2 overflow-hidden shadow-sm" style={{ borderColor: '#E5E7EB' }}>
                    <input
                      type="color"
                      value={buttonColor}
                      onChange={(e) => {
                        setButtonColor(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="absolute inset-0 w-full h-full cursor-pointer"
                      style={{ border: 'none' }}
                    />
                  </div>
                  <input
                    type="text"
                    value={buttonColor}
                    onChange={(e) => {
                      setButtonColor(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="#3B82F6"
                    className="flex-1 border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#1F2937'
                    }}
                  />
                </div>
              </div>
              
              {onLayoutChange && (
                <div>
                  <label className="block text-sm font-medium mb-3" style={{ color: '#374151' }}>
                    Form Layout
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => onLayoutChange('original')}
                      className="p-4 border-2 rounded-lg text-left transition-all shadow-sm hover:shadow-md"
                      style={{
                        borderColor: currentLayout === 'original' ? buttonColor : '#E5E7EB',
                        backgroundColor: currentLayout === 'original' ? `${buttonColor}15` : '#F9FAFB'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm" style={{ color: '#1F2937' }}>Original Layout</h4>
                          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                            Single-page form
                          </p>
                        </div>
                        {currentLayout === 'original' && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: buttonColor }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => onLayoutChange('multistep')}
                      className="p-4 border-2 rounded-lg text-left transition-all shadow-sm hover:shadow-md"
                      style={{
                        borderColor: currentLayout === 'multistep' ? buttonColor : '#E5E7EB',
                        backgroundColor: currentLayout === 'multistep' ? `${buttonColor}15` : '#F9FAFB'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm" style={{ color: '#1F2937' }}>Multi-Step Layout</h4>
                          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                            Step-by-step form
                          </p>
                        </div>
                        {currentLayout === 'multistep' && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: buttonColor }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="rounded-lg p-8" style={{ backgroundColor: '#FFFFFF', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}>
          <div className="mb-6 flex justify-center items-center py-8">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="h-24 object-contain" />
            ) : (
              <div className="text-2xl font-bold" style={{ color: '#1F2937' }}>LOGO</div>
            )}
          </div>
          
          <div className="mb-8 text-center">
            <p className="text-sm" style={{ color: '#6B7280' }}>Powered by SYNC</p>
          </div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold" style={{ color: '#1F2937' }}>Application Form</h2>
            {showEditButton && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isEditMode ? 'Cancel' : 'Edit'}
              </button>
            )}
          </div>
          
          {renderStepIndicator()}
          
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderContactInformation()}
            {currentStep === 2 && renderInstallationAddress()}
            {currentStep === 3 && renderPlanAndDocuments()}
          </form>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-6 py-2 border rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              borderColor: buttonColor,
              color: buttonColor,
              backgroundColor: 'transparent'
            }}
          >
            Back
          </button>
          
          <div>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2 text-white rounded hover:opacity-90"
                style={{
                  backgroundColor: buttonColor
                }}
              >
                Next
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2 text-white rounded hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: buttonColor
                }}
                disabled={!formData.privacyAgreement || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center font-medium text-gray-900">Submitting your application...</p>
            <p className="text-center text-sm mt-2 text-gray-600">Please wait while we process your form.</p>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Submission Successful!</h3>
            <p className="text-center text-gray-600 mb-6">Your application has been submitted successfully and is now pending approval.</p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  handleReset();
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default MultiStepForm;
