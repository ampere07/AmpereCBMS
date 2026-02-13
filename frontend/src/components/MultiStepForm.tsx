import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import LoadingModal from './Loading/LoadingModal';
import LocationMap from './Map/LocationMap';
import CameraFileInput from './Form/CameraFileInput';
import TermsModal from './TermsModal';

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

interface Referrer {
  id: number;
  name: string;
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
  installationAddress: string;
  coordinates: string;
  landmark: string;

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
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
  const [currentStep, setCurrentStep] = useState(1);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 14.5995, lng: 120.9842 });
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [captchaError, setCaptchaError] = useState(false);
  const isEditMode = externalIsEditMode !== undefined ? externalIsEditMode : false;
  const [backgroundColor, setBackgroundColor] = useState('');
  const [formBgColor, setFormBgColor] = useState('');
  const [formBgOpacity, setFormBgOpacity] = useState(100);
  const [buttonColor, setButtonColor] = useState('#3B82F6');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [brandName, setBrandName] = useState<string>('');
  const [initialEditValues, setInitialEditValues] = useState<{ backgroundColor: string; buttonColor: string; logoPreview: string; brandName: string; formBgColor: string; formBgOpacity: number }>({ backgroundColor: '', buttonColor: '', logoPreview: '', brandName: '', formBgColor: '', formBgOpacity: 100 });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const convertGDriveUrl = (url: string): string => {
    if (!url) return '';

    if (url.includes('drive.google.com/file/d/')) {
      const fileId = url.split('/file/d/')[1].split('/')[0];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    }

    if (url.includes('drive.google.com/uc?')) {
      return url;
    }

    return url;
  };

  useEffect(() => {
    const fetchUISettings = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/form-ui/settings`);
        if (response.ok) {
          const result = await response.json();
          console.log('Fetched UI settings:', result);
          if (result.success && result.data) {
            if (result.data.page_hex) {
              setBackgroundColor(result.data.page_hex);
            }

            if (result.data.button_hex) {
              setButtonColor(result.data.button_hex);
            }

            if (result.data.form_hex) {
              setFormBgColor(result.data.form_hex);
            }

            if (result.data.transparency_rgba) {
              const rgbaMatch = result.data.transparency_rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*([\d.]+)?\)/);
              if (rgbaMatch) {
                const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
                setFormBgOpacity(Math.round(a * 100));
              }
            }

            if (result.data.logo_url) {
              const convertedUrl = convertGDriveUrl(result.data.logo_url);
              console.log('Original logo URL:', result.data.logo_url);
              console.log('Converted logo URL:', convertedUrl);
              setLogoPreview(convertedUrl);
            }

            if (result.data.brand_name) {
              setBrandName(result.data.brand_name);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching UI settings:', error);
      }
    };

    fetchUISettings();
    generateCaptcha();
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
      setBrandName(initialEditValues.brandName);
      setFormBgColor(initialEditValues.formBgColor);
      setFormBgOpacity(initialEditValues.formBgOpacity);
      setLogoFile(null);
      setHasUnsavedChanges(false);
    }

    if (!isEditMode) {
      setInitialEditValues({
        backgroundColor: backgroundColor,
        buttonColor: buttonColor,
        logoPreview: logoPreview,
        brandName: brandName,
        formBgColor: formBgColor,
        formBgOpacity: formBgOpacity
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
      setIsSaving(true);
      const formData = new FormData();

      if (backgroundColor) {
        formData.append('page_hex', backgroundColor);
      }
      if (buttonColor) {
        formData.append('button_hex', buttonColor);
      }
      if (formBgColor) {
        formData.append('form_hex', formBgColor);
      }
      if (formBgColor && formBgOpacity !== null) {
        const r = parseInt(formBgColor.slice(1, 3), 16);
        const g = parseInt(formBgColor.slice(3, 5), 16);
        const b = parseInt(formBgColor.slice(5, 7), 16);
        const rgbaValue = `rgba(${r}, ${g}, ${b}, ${(formBgOpacity / 100).toFixed(2)})`;
        formData.append('transparency_rgba', rgbaValue);
      }
      if (logoFile) {
        formData.append('logo', logoFile);
      }

      if (brandName) {
        formData.append('brand_name', brandName);
      }

      const multiStepValue = currentLayout === 'multistep' ? 'active' : 'inactive';
      formData.append('multi_step', multiStepValue);

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
          setHasUnsavedChanges(false);
          if (onEditModeChange) {
            onEditModeChange(false);
          }
          setShowSaveSuccessModal(true);
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
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
  const [plans, setPlans] = useState<Plan[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [referrers, setReferrers] = useState<Referrer[]>([]);

  useImperativeHandle(ref, () => ({
    saveColors: () => { }
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
    installationAddress: '',
    coordinates: '',
    landmark: '',

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
        const sortedPlans = (data.data || []).sort((a: Plan, b: Plan) => a.price - b.price);
        setPlans(sortedPlans);
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
        const activePromos = (data.data || []).filter((promo: Promo) => promo.status === 'active' || promo.status === 'Active');
        setPromos(activePromos);
      } catch (error) {
        console.error('Error fetching promos:', error);
        setPromos([]);
      }
    };
    fetchPromos();
  }, []);

  useEffect(() => {
    const fetchReferrers = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/referrers`);
        if (!response.ok) throw new Error('Failed to fetch referrers');
        const data = await response.json();
        setReferrers(data.referrers || []);
      } catch (error) {
        console.error('Error fetching referrers:', error);
        setReferrers([]);
      }
    };
    fetchReferrers();
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
            barangay: ''
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
            barangay: ''
          }));
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





  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1, num2, answer: num1 + num2 });
    setCaptchaAnswer('');
    setCaptchaError(false);
  };

  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptchaAnswer(e.target.value);
    setCaptchaError(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (fieldName: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.checked });
  };

  const validateStep = (step: number): boolean => {
    if (!requireFields) {
      return true;
    }

    const missing: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^09[0-9]{9}$/;

    switch (step) {
      case 1:
        if (!formData.email) {
          missing.push('Email');
        } else if (!emailRegex.test(formData.email)) {
          missing.push('Email (invalid format - must include @ and domain)');
        }

        if (!formData.mobile) {
          missing.push('Mobile');
        } else if (!mobileRegex.test(formData.mobile)) {
          missing.push('Mobile (invalid format - must be 09XXXXXXXXX)');
        }

        if (!formData.firstName) missing.push('First Name');
        if (!formData.lastName) missing.push('Last Name');
        break;
      case 2:
        if (!formData.region) missing.push('Region');
        if (!formData.city) missing.push('City/Municipality');
        if (!formData.barangay) missing.push('Barangay');
        if (!formData.installationAddress) missing.push('Installation Address');
        if (!formData.landmark) missing.push('Landmark');

        break;
      case 3:
        if (!formData.plan) missing.push('Plan');
        if (!formData.proofOfBilling) missing.push('Proof of Billing');
        if (!formData.governmentIdPrimary) missing.push('Government Valid ID (Primary)');
        if (!formData.houseFrontPicture) missing.push('House Front Picture');
        if (!formData.privacyAgreement) missing.push('Privacy Agreement');
        if (formData.promo && !formData.promoProof) missing.push('Promo Proof Document');
        break;
      default:
        break;
    }

    setMissingFields(missing);
    return missing.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      setShowValidationModal(true);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseInt(captchaAnswer) !== captchaQuestion.answer) {
      setCaptchaError(true);
      return;
    }

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


    submissionData.append('region', selectedRegion);
    submissionData.append('city', selectedCity);
    submissionData.append('barangay', selectedBarangay);
    submissionData.append('installationAddress', formData.installationAddress);
    submissionData.append('coordinates', formData.coordinates || '');
    submissionData.append('landmark', formData.landmark);
    submissionData.append('referredBy', formData.referredBy);

    submissionData.append('plan', formData.plan);
    submissionData.append('promo', formData.promo || '');

    if (formData.proofOfBilling) submissionData.append('proofOfBilling', formData.proofOfBilling);
    if (formData.governmentIdPrimary) submissionData.append('governmentIdPrimary', formData.governmentIdPrimary);
    if (formData.governmentIdSecondary) submissionData.append('governmentIdSecondary', formData.governmentIdSecondary);
    if (formData.houseFrontPicture) submissionData.append('houseFrontPicture', formData.houseFrontPicture);

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
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          throw new Error(errorMessages.join('\n'));
        }
        throw new Error(errorData.message || 'Failed to submit application');
      }

      setShowSuccessModal(true);
      generateCaptcha();

    } catch (error) {
      let errorMessage = 'Failed to submit application. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenMap = () => {
    setShowMapModal(true);
    if (selectedPosition) {
      setMapCenter(selectedPosition);
    }
  };

  const handleGetMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedPosition(newPos);
          setMapCenter(newPos);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please check your browser permissions.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setSelectedPosition({ lat, lng });
  };

  const handleConfirmLocation = () => {
    if (selectedPosition) {
      const coordString = `${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`;
      setFormData(prev => ({ ...prev, coordinates: coordString }));
      setShowMapModal(false);
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
      installationAddress: '',
      coordinates: '',
      landmark: '',

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
    generateCaptcha();
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
            title="Please enter a valid email address"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
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
            title="Please enter your first name"
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
            pattern="[A-Za-z]"
            title="Please enter a single letter"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
          <small className="text-sm" style={{ color: getLabelColor(), opacity: 0.8 }}>Single letter only</small>
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
            title="Please enter your last name"
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
            title="Please enter a valid mobile number (format: 09XXXXXXXXX)"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
          <small className="text-sm" style={{ color: getLabelColor(), opacity: 0.8 }}>Format: 09XXXXXXXXX (11 digits)</small>
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
            title="Please enter a valid mobile number (format: 09XXXXXXXXX)"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
          <small className="text-sm" style={{ color: getLabelColor(), opacity: 0.8 }}>Format: 09XXXXXXXXX (optional)</small>
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
            title="Please select your region"
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
            title="Please select your city/municipality"
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
            title="Please select your barangay"
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



        <div className="col-span-1 md:col-span-2 mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block font-medium" htmlFor="installationAddress" style={{ color: getLabelColor() }}>
              Installation Address {requireFields && <span className="text-red-500">*</span>}
            </label>
            <button
              type="button"
              onClick={handleOpenMap}
              className="px-3 py-1 text-sm font-medium text-white rounded hover:opacity-90 transition-all"
              style={{ backgroundColor: buttonColor }}
            >
              Pin Location
            </button>
          </div>
          <textarea
            id="installationAddress"
            name="installationAddress"
            value={formData.installationAddress}
            onChange={handleInputChange}
            required={requireFields}
            placeholder="Enter complete address details"
            title="Please provide your complete installation address"
            rows={3}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          ></textarea>
          <div className="mt-2">
            <input
              type="text"
              value={formData.coordinates}
              readOnly
              placeholder="Coordinates will appear here after pinning location"
              className="w-full border rounded px-3 py-2"
              style={{
                borderColor: getBorderColor(),
                backgroundColor: isColorDark(formBgColor) ? '#0a0a0a' : '#f9fafb',
                color: getTextColor()
              }}
            />
          </div>
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
            title="Please enter a landmark near your location"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          />
        </div>



        <div className="mb-4">
          <label className="block font-medium mb-2" htmlFor="referredBy" style={{ color: getLabelColor() }}>
            Referred By
          </label>
          <select
            id="referredBy"
            name="referredBy"
            value={formData.referredBy}
            onChange={handleInputChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          >
            <option value="">None / Walk-in</option>
            {referrers.map(referrer => (
              <option key={referrer.id} value={referrer.name}>
                {referrer.name}
              </option>
            ))}
          </select>
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
            title="Please select a plan"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{
              borderColor: getBorderColor(),
              backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
              color: getTextColor()
            }}
          >
            <option value="">Select plan</option>
            {plans
              .filter(plan => {
                const planNameLower = plan.plan_name.toLowerCase();
                return !planNameLower.includes('wfh') &&
                  !planNameLower.includes('vip') &&
                  !planNameLower.includes('work from home');
              })
              .map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.plan_name} {plan.price}
                </option>
              ))}
          </select>
        </div>

        {promos && promos.length > 0 && (
          <div className="mb-4">
            <label className="block font-medium mb-2" htmlFor="promo" style={{ color: getLabelColor() }}>
              Promo
            </label>
            <select
              id="promo"
              name="promo"
              value={formData.promo}
              onChange={handleInputChange}
              title="Select a promo if available (optional)"
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
          </div>
        )}
      </div>

      <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-700" style={{ color: getTextColor() }}>Upload Documents</h3>

      <p className="mb-4 text-sm" style={{ color: getLabelColor() }}>Allowed: JPG/PNG/PDF, up to 2 MB each.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CameraFileInput
          label="Proof of Billing"
          name="proofOfBilling"
          required={requireFields}
          accept="image/*,application/pdf"
          value={formData.proofOfBilling}
          onChange={(file) => handleFileChange('proofOfBilling', file)}
          labelColor={getLabelColor()}
          borderColor={getBorderColor()}
          backgroundColor={isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb'}
          textColor={getTextColor()}
        />

        <CameraFileInput
          label="Government Valid ID (Primary)"
          name="governmentIdPrimary"
          required={requireFields}
          accept="image/*,application/pdf"
          value={formData.governmentIdPrimary}
          onChange={(file) => handleFileChange('governmentIdPrimary', file)}
          labelColor={getLabelColor()}
          borderColor={getBorderColor()}
          backgroundColor={isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb'}
          textColor={getTextColor()}
        />

        <CameraFileInput
          label="Government Valid ID (Secondary)"
          name="governmentIdSecondary"
          required={false}
          accept="image/*,application/pdf"
          value={formData.governmentIdSecondary}
          onChange={(file) => handleFileChange('governmentIdSecondary', file)}
          labelColor={getLabelColor()}
          borderColor={getBorderColor()}
          backgroundColor={isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb'}
          textColor={getTextColor()}
        />

        <CameraFileInput
          label="House Front Picture"
          name="houseFrontPicture"
          required={requireFields}
          accept="image/*,application/pdf"
          value={formData.houseFrontPicture}
          onChange={(file) => handleFileChange('houseFrontPicture', file)}
          labelColor={getLabelColor()}
          borderColor={getBorderColor()}
          backgroundColor={isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb'}
          textColor={getTextColor()}
        />

        {formData.promo && formData.promo !== '' && (
          <div>
            <CameraFileInput
              label="Promo Proof Document"
              name="promoProof"
              required={requireFields}
              accept="image/*,application/pdf"
              value={formData.promoProof}
              onChange={(file) => handleFileChange('promoProof', file)}
              labelColor={getLabelColor()}
              borderColor={getBorderColor()}
              backgroundColor={isColorDark(formBgColor) ? '#1a1a1a' : '#f9fafb'}
              textColor={getTextColor()}
            />
            <small className="text-sm" style={{ color: getLabelColor(), opacity: 0.8 }}>Required when a promo is selected</small>
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="mb-4">
          <label className="block font-medium mb-2" style={{ color: getLabelColor() }}>
            Please solve this math problem: {captchaQuestion.num1} + {captchaQuestion.num2} = ?
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={captchaAnswer}
              onChange={handleCaptchaChange}
              required
              placeholder="Enter your answer"
              className="w-32 border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
              style={{
                borderColor: captchaError ? '#EF4444' : getBorderColor(),
                backgroundColor: isColorDark(formBgColor) ? '#1a1a1a' : '#ffffff',
                color: getTextColor()
              }}
            />
            <button
              type="button"
              onClick={generateCaptcha}
              className="px-3 py-2 text-sm border-2 rounded-lg hover:bg-gray-50 transition-all"
              style={{ borderColor: getBorderColor(), color: getLabelColor() }}
              title="Generate new question"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          {captchaError && (
            <p className="text-red-500 text-sm mt-2">Incorrect answer. Please try again.</p>
          )}
        </div>

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
            I accept the{' '}
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="underline hover:no-underline"
              style={{ color: buttonColor }}
            >
              terms and conditions
            </button>
            {requireFields && <span className="text-red-500"> *</span>}
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
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Brand Name
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => {
                    setBrandName(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Enter brand name"
                  className="w-full border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937'
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Logo
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
                  <div className="relative h-10 w-20 rounded border-2 overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
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
                    className="flex-1 border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  <div className="relative h-10 w-20 rounded border-2 overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
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
                    className="flex-1 border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  Form Background Color
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative h-10 w-20 rounded border-2 overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                    <input
                      type="color"
                      value={formBgColor || '#FFFFFF'}
                      onChange={(e) => {
                        setFormBgColor(e.target.value);
                        setHasUnsavedChanges(true);
                      }}
                      className="absolute inset-0 w-full h-full cursor-pointer"
                      style={{ border: 'none' }}
                    />
                  </div>
                  <input
                    type="text"
                    value={formBgColor || '#FFFFFF'}
                    onChange={(e) => {
                      setFormBgColor(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="#FFFFFF"
                    className="flex-1 border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  Form Transparency
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={formBgOpacity}
                    onChange={(e) => {
                      setFormBgOpacity(parseInt(e.target.value));
                      setHasUnsavedChanges(true);
                    }}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formBgOpacity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value >= 0 && value <= 100) {
                        setFormBgOpacity(value);
                        setHasUnsavedChanges(true);
                      }
                    }}
                    className="w-20 border-2 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#F9FAFB',
                      color: '#1F2937'
                    }}
                  />
                  <span className="text-sm font-medium" style={{ color: '#374151' }}>%</span>
                </div>
                <small className="text-xs mt-1 block" style={{ color: '#6B7280' }}>0% = transparent, 100% = opaque</small>
              </div>
            </div>

            <div className="mt-4">

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

        <div className="rounded-lg p-8" style={{ backgroundColor: `rgba(${formBgColor ? `${parseInt(formBgColor.slice(1, 3), 16)}, ${parseInt(formBgColor.slice(3, 5), 16)}, ${parseInt(formBgColor.slice(5, 7), 16)}` : '255, 255, 255'}, ${(formBgOpacity / 100).toFixed(2)})`, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}>
          <div className="mb-6 flex justify-center items-center py-8">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="h-24 object-contain"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  console.error('Logo failed to load:', logoPreview);
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="text-2xl font-bold" style="color: #1F2937">LOGO</div>';
                }}
              />
            ) : (
              <div className="text-2xl font-bold" style={{ color: '#1F2937' }}>LOGO</div>
            )}
          </div>

          <div className="mb-8 text-center">
            <p className="text-sm" style={{ color: '#6B7280' }}>Powered by SYNC</p>
          </div>

          <div className="flex justify-between items-center mb-6">
            {showEditButton && (
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {isEditMode ? 'Cancel' : 'Edit'}
              </button>
            )}
          </div>

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
            className="px-6 py-2 border-2 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              borderColor: buttonColor,
              color: '#FFFFFF',
              backgroundColor: buttonColor
            }}
          >
            Back
          </button>

          <div>
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-10 py-2 text-white rounded hover:opacity-90"
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
                className="px-10 py-2 text-white rounded hover:opacity-90 disabled:opacity-50"
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

      {isSaving && (
        <LoadingModal
          message="Saving settings..."
          submessage="Please wait while we save your changes."
          spinnerColor="green"
        />
      )}

      {showSaveSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowSaveSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2 mt-4">Settings Saved!</h3>
            <p className="text-center text-gray-600 mb-4">Your settings have been saved successfully.</p>
          </div>
        </div>
      )}

      {isSubmitting && (
        <LoadingModal
          message="Submitting your application..."
          submessage="Please wait while we process your form."
          spinnerColor="blue"
        />
      )}

      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => {
                setShowValidationModal(false);
                setMissingFields([]);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2 mt-4">Required Fields Missing</h3>
            <p className="text-center text-gray-600 mb-4">Please fill in the following required fields:</p>
            <div className="mb-6 max-h-48 overflow-y-auto">
              <ul className="space-y-2">
                {missingFields.map((field, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-700">{field}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} buttonColor={buttonColor} />}

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

      {showMapModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 relative">
            <button
              onClick={() => setShowMapModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-4">Pin Your Location</h3>
            <p className="text-center text-gray-600 mb-4">Click on the map or drag the marker to set your location</p>
            <div className="mb-4 flex justify-center">
              <button
                type="button"
                onClick={handleGetMyLocation}
                className="px-4 py-2 text-white rounded hover:opacity-90 transition-all flex items-center gap-2"
                style={{ backgroundColor: buttonColor }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Get My Location
              </button>
            </div>
            <div className="h-96 w-full mb-4">
              <LocationMap
                center={mapCenter}
                onLocationSelect={handleMapLocationSelect}
                buttonColor={buttonColor}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={selectedPosition?.lat || mapCenter.lat}
                onChange={(e) => setSelectedPosition({ lat: parseFloat(e.target.value), lng: selectedPosition?.lng || mapCenter.lng })}
                className="w-full border rounded px-3 py-2 mb-2"
                style={{ borderColor: '#E5E7EB' }}
              />
              <label className="block text-sm font-medium mb-2 text-gray-700">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={selectedPosition?.lng || mapCenter.lng}
                onChange={(e) => setSelectedPosition({ lat: selectedPosition?.lat || mapCenter.lat, lng: parseFloat(e.target.value) })}
                className="w-full border rounded px-3 py-2"
                style={{ borderColor: '#E5E7EB' }}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowMapModal(false)}
                className="px-6 py-2 border-2 rounded hover:bg-gray-50"
                style={{ borderColor: '#E5E7EB', color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLocation}
                className="px-6 py-2 text-white rounded hover:opacity-90"
                style={{ backgroundColor: buttonColor }}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default MultiStepForm;
