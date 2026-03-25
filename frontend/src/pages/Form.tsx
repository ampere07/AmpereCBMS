import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import API_CONFIG from '../config/api';
import LoadingModal from '../components/Loading/LoadingModal';
import LocationMap from '../components/Map/LocationMap';
import CameraFileInput from '../components/Form/CameraFileInput';
import SearchableSelect from '../components/Form/SearchableSelect';

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

interface Promo {
  id: number;
  name: string;
  status: string;
}

interface Referrer {
  id: number;
  name: string;
}

export interface FormRef {
  saveColors: () => void;
}

interface FormProps {
  showEditButton?: boolean;
  onLayoutChange?: (layout: 'original' | 'multistep') => void;
  currentLayout?: 'original' | 'multistep';
  isEditMode?: boolean;
  onEditModeChange?: (isEdit: boolean) => void;
  requireFields?: boolean;
}

const Form = forwardRef(function Form(props: FormProps, ref: React.ForwardedRef<FormRef>) {
  const {
    showEditButton = false,
    onLayoutChange,
    currentLayout = 'original',
    isEditMode: externalIsEditMode,
    onEditModeChange,
    requireFields = true
  } = props;
  const apiBaseUrl = process.env.REACT_APP_API_URL || "https://backend1.atssfiber.ph";
  const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "";
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 14.5995, lng: 120.9842 });
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSubmitFailedModal, setShowSubmitFailedModal] = useState(false);
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [captchaError, setCaptchaError] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const isEditMode = externalIsEditMode !== undefined ? externalIsEditMode : false;
  const [backgroundColor, setBackgroundColor] = useState('');
  const [formBgColor, setFormBgColor] = useState('');
  const [formBgOpacity, setFormBgOpacity] = useState(100);
  const [buttonColor, setButtonColor] = useState('#3B82F6');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [brandName, setBrandName] = useState<string>('');
  const [initialEditValues, setInitialEditValues] = useState<{
    backgroundColor: string;
    buttonColor: string;
    logoPreview: string;
    brandName: string;
    formBgColor: string;
    formBgOpacity: number;
    showProofOfBilling: string;
    showIdPrimary: string;
    showIdSecondary: string;
    showHouseFront: string;
    showSecondaryNumber: string;
    showCaptcha: string;
    termsAndCondition: string;
    privacyPolicy: string;
    contactInformation: string;
    submitModal: string;
  }>({
    backgroundColor: '',
    buttonColor: '',
    logoPreview: '',
    brandName: '',
    formBgColor: '',
    formBgOpacity: 100,
    showProofOfBilling: 'active',
    showIdPrimary: 'active',
    showIdSecondary: 'active',
    showHouseFront: 'active',
    showSecondaryNumber: 'active',
    showCaptcha: 'active',
    termsAndCondition: '',
    privacyPolicy: '',
    contactInformation: '',
    submitModal: ''
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [showSaveFailedModal, setShowSaveFailedModal] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  const [showProofOfBilling, setShowProofOfBilling] = useState('active');
  const [showIdPrimary, setShowIdPrimary] = useState('active');
  const [showIdSecondary, setShowIdSecondary] = useState('active');
  const [showHouseFront, setShowHouseFront] = useState('active');
  const [showSecondaryNumber, setShowSecondaryNumber] = useState('active');
  const [showCaptcha, setShowCaptcha] = useState('active');
  const [termsAndCondition, setTermsAndCondition] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [contactInformation, setContactInformation] = useState('');
  const [submitModal, setSubmitModal] = useState('');

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
              setLogoPreview(convertedUrl);
            }

            if (result.data.brand_name) {
              setBrandName(result.data.brand_name);
            }

            if (result.data.proof_of_billing) setShowProofOfBilling(result.data.proof_of_billing);
            if (result.data.id_primary) setShowIdPrimary(result.data.id_primary);
            if (result.data.id_secondary) setShowIdSecondary(result.data.id_secondary);
            if (result.data.house_front_) setShowHouseFront(result.data.house_front_);
            if (result.data.secondary_number) setShowSecondaryNumber(result.data.secondary_number);
            if (result.data.captcha) setShowCaptcha(result.data.captcha);
            if (result.data.terms_and_condition) setTermsAndCondition(result.data.terms_and_condition);
            if (result.data.privacy_policy) setPrivacyPolicy(result.data.privacy_policy);
            if (result.data.contact_information) setContactInformation(result.data.contact_information);
            if (result.data.submit_modal) setSubmitModal(result.data.submit_modal);
          }
        }
      } catch (error) {
        console.error('Error fetching UI settings:', error);
      }
    };

    fetchUISettings();
    generateCaptcha();
  }, []);

  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);
  const [referrers, setReferrers] = useState<Referrer[]>([]);

  useImperativeHandle(ref, () => ({
    saveColors: () => { }
  }));

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
      setShowProofOfBilling(initialEditValues.showProofOfBilling);
      setShowIdPrimary(initialEditValues.showIdPrimary);
      setShowIdSecondary(initialEditValues.showIdSecondary);
      setShowHouseFront(initialEditValues.showHouseFront);
      setShowSecondaryNumber(initialEditValues.showSecondaryNumber);
      setShowCaptcha(initialEditValues.showCaptcha);
      setTermsAndCondition(initialEditValues.termsAndCondition);
      setPrivacyPolicy(initialEditValues.privacyPolicy);
      setContactInformation(initialEditValues.contactInformation);
      setSubmitModal(initialEditValues.submitModal);
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
        formBgOpacity: formBgOpacity,
        showProofOfBilling: showProofOfBilling,
        showIdPrimary: showIdPrimary,
        showIdSecondary: showIdSecondary,
        showHouseFront: showHouseFront,
        showSecondaryNumber: showSecondaryNumber,
        showCaptcha: showCaptcha,
        termsAndCondition: termsAndCondition,
        privacyPolicy: privacyPolicy,
        contactInformation: contactInformation,
        submitModal: submitModal
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
      setIsSavingSettings(true);
      setSaveErrorMessage('');

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

      formData.append('proof_of_billing', showProofOfBilling);
      formData.append('id_primary', showIdPrimary);
      formData.append('id_secondary', showIdSecondary);
      formData.append('house_front_', showHouseFront);
      formData.append('secondary_number', showSecondaryNumber);
      formData.append('captcha', showCaptcha);

      formData.append('terms_and_condition', termsAndCondition);
      formData.append('privacy_policy', privacyPolicy);
      formData.append('contact_information', contactInformation);
      formData.append('submit_modal', submitModal);

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
          setShowSaveSuccessModal(true);
          if (onEditModeChange) {
            onEditModeChange(false);
          }
        } else {
          setSaveErrorMessage(result.message || 'Failed to save settings');
          setShowSaveFailedModal(true);
        }
      } else {
        const errorData = await response.json();
        setSaveErrorMessage(errorData.message || 'Failed to save settings');
        setShowSaveFailedModal(true);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveErrorMessage('Error saving settings. Please check your connection and try again.');
      setShowSaveFailedModal(true);
    } finally {
      setIsSavingSettings(false);
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
    return isColorDark(backgroundColor) ? '#FFFFFF' : '#1F2937';
  };

  const getLabelColor = (): string => {
    return isColorDark(backgroundColor) ? '#E5E7EB' : '#374151';
  };

  const getBorderColor = (): string => {
    return isColorDark(backgroundColor) ? '#4B5563' : '#E5E7EB';
  };

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
        if (!response.ok) {
          throw new Error('Failed to fetch region');
        }
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
        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }
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
    const fetchCities = async () => {
      if (formData.region) {
        try {
          const response = await fetch(`${apiBaseUrl}/api/cities?region_code=${formData.region}`);
          if (!response.ok) {
            throw new Error('Failed to fetch cities');
          }
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
    const fetchPromos = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/promo_list`);
        if (!response.ok) {
          throw new Error('Failed to fetch promos');
        }
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
    const fetchBarangays = async () => {
      if (formData.city) {
        try {
          const response = await fetch(`${apiBaseUrl}/api/barangays?city_code=${formData.city}`);
          if (!response.ok) {
            throw new Error('Failed to fetch barangays');
          }
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





  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

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
    if (name === 'middleInitial') {
      const filteredValue = value.replace(/[^a-zA-Z]/g, '');
      setFormData({ ...formData, [name]: filteredValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (showCaptcha === 'active' && parseInt(captchaAnswer) !== captchaQuestion.answer) {
      setCaptchaError(true);
      return;
    }

    if (!formData.privacyAgreement) {
      setValidationMessage('Please agree to the privacy policy before submitting.');
      setShowValidationModal(true);
      return;
    }

    if (requireFields) {
      const missingImages = [];



      if (showProofOfBilling === 'active' && !formData.proofOfBilling) {
        missingImages.push('Proof of Billing');
      }

      if (showIdPrimary === 'active' && !formData.governmentIdPrimary) {
        missingImages.push('Government Valid ID (Primary)');
      }

      if (showHouseFront === 'active' && !formData.houseFrontPicture) {
        missingImages.push('House Front Picture');
      }

      if (formData.promo && formData.promo !== '' && !formData.promoProof) {
        missingImages.push('Promo Proof Document');
      }

      if (missingImages.length > 0 || !formData.coordinates) {
        let message = '';
        if (missingImages.length > 0) {
          message += `Please upload the following required documents:\n\n${missingImages.join('\n')}\n\n`;
        }
        if (!formData.coordinates) {
          message += 'Please pin your location on the map.';
        }
        setValidationMessage(message);
        setShowValidationModal(true);
        return;
      }
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

    if (formData.proofOfBilling) {
      submissionData.append('proofOfBilling', formData.proofOfBilling);
    }

    if (formData.governmentIdPrimary) {
      submissionData.append('governmentIdPrimary', formData.governmentIdPrimary);
    }

    if (formData.governmentIdSecondary) {
      submissionData.append('governmentIdSecondary', formData.governmentIdSecondary);
    }

    if (formData.houseFrontPicture) {
      submissionData.append('houseFrontPicture', formData.houseFrontPicture);
    }



    if (formData.promoProof) {
      submissionData.append('promoProof', formData.promoProof);
    }

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

      const result = await response.json();

      setIsSubmitting(false);
      setShowSuccessModal(true);
      generateCaptcha();

    } catch (error) {
      let errorMessage = 'Failed to submit application. Please try again.';

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSubmitErrorMessage(errorMessage);
      setIsSubmitting(false);
      setShowSubmitFailedModal(true);
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

    generateCaptcha();
  };

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

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Terms and Conditions
                </label>
                <textarea
                  value={termsAndCondition}
                  onChange={(e) => {
                    setTermsAndCondition(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  rows={4}
                  className="w-full border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                    resize: 'vertical'
                  }}
                  placeholder="Enter terms and conditions text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Privacy Policy
                </label>
                <textarea
                  value={privacyPolicy}
                  onChange={(e) => {
                    setPrivacyPolicy(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  rows={4}
                  className="w-full border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                    resize: 'vertical'
                  }}
                  placeholder="Enter privacy policy text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Contact Information
                </label>
                <textarea
                  value={contactInformation}
                  onChange={(e) => {
                    setContactInformation(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  rows={4}
                  className="w-full border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                    resize: 'vertical'
                  }}
                  placeholder="Enter contact information..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Submit Modal Text
                </label>
                <textarea
                  value={submitModal}
                  onChange={(e) => {
                    setSubmitModal(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  rows={4}
                  className="w-full border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                  style={{
                    borderColor: '#E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                    resize: 'vertical'
                  }}
                  placeholder="Enter text to show in the success modal..."
                />
              </div>
            </div>

            <div className="mt-8 border-t pt-6">
              <label className="block text-sm font-medium mb-4" style={{ color: '#374151' }}>
                Form Field Visibility
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { label: 'Proof of Billing', state: showProofOfBilling, setter: setShowProofOfBilling },
                  { label: 'Primary ID', state: showIdPrimary, setter: setShowIdPrimary },
                  { label: 'Secondary ID', state: showIdSecondary, setter: setShowIdSecondary },
                  { label: 'House Front Image', state: showHouseFront, setter: setShowHouseFront },
                  { label: 'Secondary Number', state: showSecondaryNumber, setter: setShowSecondaryNumber },
                  { label: 'Captcha', state: showCaptcha, setter: setShowCaptcha },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="text-sm font-medium" style={{ color: '#4B5563' }}>{item.label}</span>
                    <button
                      type="button"
                      onClick={() => {
                        item.setter(item.state === 'active' ? 'inactive' : 'active');
                        setHasUnsavedChanges(true);
                      }}
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none"
                      style={{ backgroundColor: item.state === 'active' ? buttonColor : '#D1D5DB' }}
                    >
                      <span
                        className={`${item.state === 'active' ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm`}
                      />
                    </button>
                  </div>
                ))}
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

        <div className="rounded-lg transition-colors p-8" style={{ backgroundColor: `rgba(${formBgColor ? `${parseInt(formBgColor.slice(1, 3), 16)}, ${parseInt(formBgColor.slice(3, 5), 16)}, ${parseInt(formBgColor.slice(5, 7), 16)}` : '255, 255, 255'}, ${(formBgOpacity / 100).toFixed(2)})`, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}>
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
            <section className="mb-8">
              <h3 className="text-lg font-medium mb-4 pb-2 border-b" style={{ color: '#1F2937', borderColor: '#E5E7EB' }}>Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block font-medium mb-2" htmlFor="email" style={{ color: '#374151' }}>
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
                    className="w-full border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2" htmlFor="firstName" style={{ color: '#374151' }}>
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
                    className="w-full border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2" htmlFor="middleInitial" style={{ color: '#374151' }}>
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
                    className="w-full border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2" htmlFor="lastName" style={{ color: '#374151' }}>
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
                    className="w-full border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2" htmlFor="mobile" style={{ color: '#374151' }}>
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
                    className="w-full border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  />
                  <small className="text-sm" style={{ color: '#6B7280' }}>Format: 09********</small>
                </div>

                {showSecondaryNumber === 'active' && (
                  <div className="mb-4">
                    <label className="block font-medium mb-2" htmlFor="secondaryMobile" style={{ color: '#374151' }}>
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
                      className="w-full border-2 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                      style={{
                        borderColor: '#E5E7EB',
                        backgroundColor: '#FFFFFF',
                        color: '#1F2937'
                      }}
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-medium mb-4 pb-2 border-b" style={{ color: '#1F2937', borderColor: '#E5E7EB' }}>Installation Address</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block font-medium mb-2" htmlFor="region" style={{ color: '#374151' }}>
                    Region {requireFields && <span className="text-red-500">*</span>}
                  </label>
                  <SearchableSelect
                    id="region"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required={requireFields}
                    placeholder="Select region"
                    options={regions.map(r => ({ id: r.id, name: r.region_name, code: r.region_code }))}
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2" htmlFor="city" style={{ color: '#374151' }}>
                    City/Municipality {requireFields && <span className="text-red-500">*</span>}
                  </label>
                  <SearchableSelect
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required={requireFields}
                    disabled={!formData.region}
                    placeholder="Select city/municipality"
                    options={cities.map(c => ({ id: c.id, name: c.city_name, code: c.city_code }))}
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2" htmlFor="barangay" style={{ color: '#374151' }}>
                    Barangay {requireFields && <span className="text-red-500">*</span>}
                  </label>
                  <SearchableSelect
                    id="barangay"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    required={requireFields}
                    disabled={!formData.city}
                    placeholder="Select barangay"
                    options={barangays.map(b => ({ id: b.id, name: b.barangay_name, code: b.barangay_code }))}
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  />
                </div>



                <div className="col-span-1 md:col-span-2 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block font-medium" htmlFor="installationAddress" style={{ color: '#374151' }}>
                      Installation Address {requireFields && <span className="text-red-500">*</span>}
                    </label>
                  </div>
                  <textarea
                    id="installationAddress"
                    name="installationAddress"
                    value={formData.installationAddress}
                    onChange={handleInputChange}
                    required={requireFields}
                    placeholder="House/Unit Number & Street Name"
                    rows={3}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  ></textarea>
                  <div className="mt-2 relative">
                    <input
                      type="text"
                      value={formData.coordinates}
                      readOnly
                      required={requireFields}
                      placeholder="Coordinates will appear here after pinning location"
                      className="w-full border rounded px-3 py-2 pr-28"
                      style={{
                        borderColor: '#E5E7EB',
                        backgroundColor: '#F3F4F6',
                        color: '#6B7280'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleOpenMap}
                      className="absolute right-1 top-1 bottom-1 px-3 py-1 text-xs font-medium text-white rounded hover:opacity-90 transition-all"
                      style={{ backgroundColor: buttonColor }}
                    >
                      Pin Location
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-2" htmlFor="landmark" style={{ color: '#374151' }}>
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
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  />
                </div>



                <div className="mb-4">
                  <label className="block font-medium mb-2" htmlFor="referredBy" style={{ color: '#374151' }}>
                    Referred By
                  </label>
                  <SearchableSelect
                    id="referredBy"
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleInputChange}
                    placeholder="None / Walk-in"
                    options={referrers.map(r => ({ id: r.id, name: r.name, code: r.name }))}
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  />
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-medium mb-4 pb-2 border-b" style={{ color: '#1F2937', borderColor: '#E5E7EB' }}>Plan Selection</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block font-medium mb-2" htmlFor="plan" style={{ color: '#374151' }}>
                    Plan {requireFields && <span className="text-red-500">*</span>}
                  </label>
                  <SearchableSelect
                    id="plan"
                    name="plan"
                    value={formData.plan}
                    onChange={handleInputChange}
                    required={requireFields}
                    placeholder="Select plan"
                    options={plans
                      .filter(plan => {
                        const planNameLower = plan.plan_name.toLowerCase();
                        return !planNameLower.includes('wfh') &&
                          !planNameLower.includes('vip') &&
                          !planNameLower.includes('work from home');
                      })
                      .map(p => ({ id: p.id, name: `${p.plan_name} ${Math.floor(p.price)}`, code: String(p.id) }))}
                    style={{
                      borderColor: '#E5E7EB',
                      backgroundColor: '#FFFFFF',
                      color: '#1F2937'
                    }}
                  />
                </div>

                {promos && promos.length > 0 && (
                  <div className="mb-4">
                    <label className="block font-medium mb-2" htmlFor="promo" style={{ color: '#374151' }}>
                      Promo
                    </label>
                    <SearchableSelect
                      id="promo"
                      name="promo"
                      value={formData.promo}
                      onChange={handleInputChange}
                      placeholder="None"
                      options={promos.map(p => ({ id: p.id, name: p.name, code: p.name }))}
                      style={{
                        borderColor: '#E5E7EB',
                        backgroundColor: '#FFFFFF',
                        color: '#1F2937'
                      }}
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-lg font-medium mb-4 pb-2 border-b" style={{ color: '#1F2937', borderColor: '#E5E7EB' }}>Upload Documents</h3>

              <p className="mb-4 text-sm" style={{ color: '#6B7280' }}>Allowed: JPG/PNG/PDF, up to 2 MB each.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {showProofOfBilling === 'active' && (
                  <CameraFileInput
                    label="Proof of Billing"
                    name="proofOfBilling"
                    required={requireFields}
                    accept="image/*,application/pdf"
                    value={formData.proofOfBilling}
                    onChange={(file) => handleFileChange('proofOfBilling', file)}
                    labelColor="#374151"
                    borderColor="#E5E7EB"
                    backgroundColor="#FFFFFF"
                    textColor="#1F2937"
                  />
                )}

                {showIdPrimary === 'active' && (
                  <CameraFileInput
                    label="Government Valid ID (Primary)"
                    name="governmentIdPrimary"
                    required={requireFields}
                    accept="image/*,application/pdf"
                    value={formData.governmentIdPrimary}
                    onChange={(file) => handleFileChange('governmentIdPrimary', file)}
                    labelColor="#374151"
                    borderColor="#E5E7EB"
                    backgroundColor="#FFFFFF"
                    textColor="#1F2937"
                  />
                )}

                {showIdSecondary === 'active' && (
                  <CameraFileInput
                    label="Government Valid ID (Secondary)"
                    name="governmentIdSecondary"
                    required={false}
                    accept="image/*,application/pdf"
                    value={formData.governmentIdSecondary}
                    onChange={(file) => handleFileChange('governmentIdSecondary', file)}
                    labelColor="#374151"
                    borderColor="#E5E7EB"
                    backgroundColor="#FFFFFF"
                    textColor="#1F2937"
                  />
                )}

                {showHouseFront === 'active' && (
                  <CameraFileInput
                    label="House Front Picture"
                    name="houseFrontPicture"
                    required={requireFields}
                    accept="image/*,application/pdf"
                    value={formData.houseFrontPicture}
                    onChange={(file) => handleFileChange('houseFrontPicture', file)}
                    labelColor="#374151"
                    borderColor="#E5E7EB"
                    backgroundColor="#FFFFFF"
                    textColor="#1F2937"
                  />
                )}

                {formData.promo && formData.promo !== '' && (
                  <div>
                    <CameraFileInput
                      label="Promo Proof Document"
                      name="promoProof"
                      required={requireFields}
                      accept="image/*,application/pdf"
                      value={formData.promoProof}
                      onChange={(file) => handleFileChange('promoProof', file)}
                      labelColor="#374151"
                      borderColor="#E5E7EB"
                      backgroundColor="#FFFFFF"
                      textColor="#1F2937"
                    />
                    <small className="text-sm" style={{ color: '#6B7280' }}>Required when a promo is selected</small>
                  </div>
                )}
              </div>
            </section>

            {showCaptcha === 'active' && (
              <section className="mb-8">
                <div className="mb-4">
                  <label className="block font-medium mb-2" style={{ color: '#374151' }}>
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
                        borderColor: captchaError ? '#EF4444' : '#E5E7EB',
                        backgroundColor: '#FFFFFF',
                        color: '#1F2937'
                      }}
                    />
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="px-3 py-2 text-sm border-2 rounded-lg hover:bg-gray-50 transition-all"
                      style={{ borderColor: '#E5E7EB', color: '#374151' }}
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
              </section>
            )}

            <section className="mb-8">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="privacyAgreement"
                  name="privacyAgreement"
                  checked={formData.privacyAgreement}
                  onChange={handleCheckboxChange}
                  required
                  className="mr-2 h-4 w-4"
                />
                <label
                  htmlFor="privacyAgreement"
                  className="text-sm"
                  style={{ color: '#374151' }}
                >
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="underline hover:no-underline"
                    style={{ color: buttonColor }}
                  >
                    terms and conditions
                  </button>
                </label>
              </div>
            </section>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 text-white rounded hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: buttonColor
                }}
                disabled={!formData.privacyAgreement || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {isSubmitting && (
        <LoadingModal
          message="Submitting your application..."
          submessage="Please wait while we process your form."
          spinnerColor="blue"
        />
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Application Received!</h3>
            <p className="text-center text-gray-600 mb-6">
              {submitModal || "thankyou for your application.we will review your requirements and contact you within 2-3 business days."}
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  handleReset();
                  window.location.href = 'https://sync.atssfiber.ph';
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isSavingSettings && (
        <LoadingModal
          message="Saving settings..."
          spinnerColor="blue"
        />
      )}

      {showSaveSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowSaveSuccessModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Settings Saved</h3>
            <p className="text-center text-gray-600 mb-4">Your settings have been saved successfully.</p>
          </div>
        </div>
      )}

      {showSaveFailedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowSaveFailedModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Save Failed</h3>
            <p className="text-center text-gray-600 mb-4">{saveErrorMessage}</p>
          </div>
        </div>
      )}

      {showValidationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowValidationModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Validation Error</h3>
            <p className="text-center text-gray-600 mb-4 whitespace-pre-line">{validationMessage}</p>
          </div>
        </div>
      )}

      {showSubmitFailedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowSubmitFailedModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
            <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">Submission Failed</h3>
            <p className="text-center text-gray-600 mb-4 whitespace-pre-line">{submitErrorMessage}</p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowSubmitFailedModal(false)}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showTermsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
                <p className="text-sm text-gray-500 mt-1">{brandName || 'ATSS'} Fiber Internet Services</p>
              </div>
              <button
                onClick={() => setShowTermsModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto px-8 py-6 bg-gray-50">
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  By using our internet services, you agree to the Terms and Conditions and Privacy Policy outlined below.
                  These ensure your protection, quality service, and secure network operations.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('terms')}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Terms and Conditions</h3>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.includes('terms') ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.includes('terms') && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
                      <div className="pt-4 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {termsAndCondition || `Please refer to ${brandName || 'ATSS'}'s official terms and conditions documentation.`}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('privacy')}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Privacy Policy</h3>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.includes('privacy') ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.includes('privacy') && (
                    <div className="px-6 pb-6 space-y-4 border-t border-gray-100">
                      <div className="pt-4 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {privacyPolicy || `${brandName || 'ATSS'} is committed to protecting your personal data in accordance with the Data Privacy Act of 2012.`}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleSection('contact')}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.includes('contact') ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.includes('contact') && (
                    <div className="px-6 pb-6 border-t border-gray-100">
                      <div className="pt-4 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {contactInformation || `For any inquiries, please contact ${brandName || 'ATSS'} customer support.`}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  <span className="font-semibold">By continuing, you confirm that you have read, understood, and agree to the Terms & Conditions and Privacy Policy,</span> including service limitations, billing policies, and acceptable use guidelines.
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center px-8 py-4 border-t border-gray-200 bg-white">
              <button
                onClick={() => setExpandedSections(['terms', 'privacy', 'contact'])}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
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

export default Form;
