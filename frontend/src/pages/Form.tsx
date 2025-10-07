import React, { useState, useEffect } from 'react';
import API_CONFIG from '../config/api';

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
  location: string;
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
  privacyAgreement: boolean;
}

interface Promo {
  id: number;
  name: string;
  status: string;
}

const Form: React.FC = () => {
  const apiBaseUrl = "http://127.0.0.1:8000";
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [promos, setPromos] = useState<Promo[]>([]);

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
    installationAddress: '',
    landmark: '',
    nearestLandmark1Image: null,
    nearestLandmark2Image: null,
    referredBy: '',
    plan: '',
    promo: 'None',
    proofOfBilling: null,
    governmentIdPrimary: null,
    governmentIdSecondary: null,
    houseFrontPicture: null,
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
      const response = await fetch(`${apiBaseUrl}/api/plans`); // ✅ FIXED HERE
      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }
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
            barangay: '',
            location: ''
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
      setPromos(data.data || []); // adjust if your Laravel controller returns differently
    } catch (error) {
      console.error('Error fetching promos:', error);
      setPromos([]);
    }
  };

  fetchPromos();
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
            barangay: '',
            location: ''
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

  // Track full location text
  const [fullLocationText, setFullLocationText] = useState<string>('');

  useEffect(() => {
    const selectedRegion = regions.find(r => r.region_code === formData.region);
    const selectedCity = cities.find(c => c.city_code === formData.city);
    const selectedBarangay = barangays.find(b => b.barangay_code === formData.barangay);
    
    let locationText = '';
    
    if (selectedRegion) {
      locationText += selectedRegion.region_name;
      
      if (selectedCity) {
        locationText += ', ' + selectedCity.city_name;
        
        if (selectedBarangay) {
          locationText += ', ' + selectedBarangay.barangay_name;
        }
      }
    }
    
    setFullLocationText(locationText);
    if (locationText) {
      setFormData(prev => ({
        ...prev,
        location: locationText
      }));
    }
  }, [formData.region, formData.city, formData.barangay, regions, cities, barangays]);

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
    console.log('Privacy agreement:', e.target.checked);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.privacyAgreement) {
      alert('Please agree to the privacy policy before submitting.');
      return;
    }
    
    // Create FormData object for file uploads
    const submissionData = new FormData();
    
    // Add form fields to FormData in a format matching the updated API
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
    submissionData.append('landmark', formData.landmark);
    submissionData.append('referredBy', formData.referredBy);
    
    // Add plan information
    submissionData.append('desired_plan_id', formData.plan);
    submissionData.append('promo_id', formData.promo || '');
    
    // Also append document files directly to the application submission
    // This way they are stored in the correct fields in the database
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
    
    if (formData.nearestLandmark1Image) {
      submissionData.append('nearestLandmark1Image', formData.nearestLandmark1Image);
    }
    
    if (formData.nearestLandmark2Image) {
      submissionData.append('nearestLandmark2Image', formData.nearestLandmark2Image);
    }
    
    try {
      setIsSubmitting(true);
      

      
      // No need for CSRF token with the updated API
      
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
        // Display specific validation errors if available
        if (errorData.errors) {
          const errorMessages = Object.values(errorData.errors).flat();
          throw new Error(errorMessages.join('\n'));
        }
        throw new Error(errorData.message || 'Failed to submit application');
      }
      
      const result = await response.json();
      
      alert('Form submitted successfully! Your application is now pending approval.');
      handleReset();
      
    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = 'Failed to submit application. Please try again.';
      
      // Check if it's a specific error with a message
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Show a more user-friendly alert
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    // Reset form fields including file inputs
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
      installationAddress: '',
      landmark: '',
      nearestLandmark1Image: null,
      nearestLandmark2Image: null,
      referredBy: '',
      plan: '',
      promo: 'None',
      proofOfBilling: null,
      governmentIdPrimary: null,
      governmentIdSecondary: null,
      houseFrontPicture: null,
      privacyAgreement: false
    });
    
    // Reset file input elements
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach((input) => {
      (input as HTMLInputElement).value = '';
    });
  };

  return (
    <div className="mx-auto max-w-4xl p-4 bg-white shadow-md rounded-lg">
      <header className="border-b border-gray-200 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your ISP Brand</h1>
      </header>
      
      <main>
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Application Form</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Contact Information Section */}
          <section className="mb-8">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-100">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your email address"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="mobile">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  placeholder="09********"
                  pattern="09[0-9]{9}"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <small className="text-gray-500 text-sm">Format: 09********</small>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your first name"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your last name"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="middleInitial">
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
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="secondaryMobile">
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
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
          
          {/* Installation Address Section */}
          <section className="mb-8">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-100">Installation Address</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="region">
                  Region <span className="text-red-500">*</span>
                </label>
                <select
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select region</option>
                  {regions && regions.length > 0 && regions.map(region => (
                    <option key={region.id} value={region.region_code}>{region.region_name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="city">
                  City/Municipality <span className="text-red-500">*</span>
                </label>
                <select
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.region}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select city/municipality</option>
                  {cities && cities.length > 0 && cities.map(city => (
                    <option key={city.id} value={city.city_code}>{city.city_name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="barangay">
                  Barangay <span className="text-red-500">*</span>
                </label>
                <select
                  id="barangay"
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.city}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select barangay</option>
                  {barangays && barangays.length > 0 && barangays.map(barangay => (
                    <option key={barangay.id} value={barangay.barangay_code}>{barangay.barangay_name}</option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="location">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={fullLocationText}
                  readOnly
                  required
                  placeholder="Select region, city, and barangay above"
                  className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50"
                />
                {!fullLocationText && (
                  <small className="text-gray-500 text-sm">This field will auto-populate based on your selections above</small>
                )}
              </div>
              
              <div className="col-span-1 md:col-span-2 mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="installationAddress">
                  Installation Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="installationAddress"
                  name="installationAddress"
                  value={formData.installationAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter complete address details"
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="landmark">
                  Landmark <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="landmark"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter a landmark"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="nearestLandmark1Image">
                  Nearest Landmark #1 Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    id="nearestLandmark1Image"
                    name="nearestLandmark1Image"
                    onChange={handleFileChange}
                    required
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <label htmlFor="nearestLandmark1Image" className="cursor-pointer bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm">
                    Choose Image
                  </label>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.nearestLandmark1Image ? formData.nearestLandmark1Image.name : 'No image chosen'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="nearestLandmark2Image">
                  Nearest Landmark #2 Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    id="nearestLandmark2Image"
                    name="nearestLandmark2Image"
                    onChange={handleFileChange}
                    required
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <label htmlFor="nearestLandmark2Image" className="cursor-pointer bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm">
                    Choose Image
                  </label>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.nearestLandmark2Image ? formData.nearestLandmark2Image.name : 'No image chosen'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="referredBy">
                  Referred By
                </label>
                <input
                  type="text"
                  id="referredBy"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleInputChange}
                  placeholder="Enter referrer name (optional)"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>
          
          {/* Plan Selection Section */}
          <section className="mb-8">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-100">Plan Selection</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="plan">
                  Plan <span className="text-red-500">*</span>
                </label>
                <select
                  id="plan"
                  name="plan"
                  value={formData.plan}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select plan</option>
                  {plans && plans.length > 0 && plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
  {plan.plan_name} - ₱{plan.price.toLocaleString()}
</option>

                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="promo">
                  Promo
                </label>
                <select
                  id="promo"
                  name="promo"
                  value={formData.promo}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">None</option>
{promos && promos.length > 0 && promos
  .filter(promo => promo.status === 'active')
  .map(promo => (
    <option key={promo.id} value={promo.id}>
      {promo.name}
    </option>
))}
                </select>
              </div>
            </div>
          </section>
          
          {/* Upload Documents Section */}
          <section className="mb-8">
            <h3 className="text-lg font-medium mb-4 pb-2 border-b border-gray-100">Upload Documents</h3>
            
            <p className="mb-4 text-sm text-gray-600">Allowed: JPG/PNG/PDF, up to 2 MB each.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="proofOfBilling">
                  Proof of Billing <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    id="proofOfBilling"
                    name="proofOfBilling"
                    onChange={handleFileChange}
                    required
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                  />
                  <label htmlFor="proofOfBilling" className="cursor-pointer bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm">
                    Choose File
                  </label>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.proofOfBilling ? formData.proofOfBilling.name : 'No file chosen'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="governmentIdPrimary">
                  Government Valid ID (Primary) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    id="governmentIdPrimary"
                    name="governmentIdPrimary"
                    onChange={handleFileChange}
                    required
                    accept=".jpg,.jpeg,.png,.pdf"
                    className="hidden"
                  />
                  <label htmlFor="governmentIdPrimary" className="cursor-pointer bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm">
                    Choose File
                  </label>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.governmentIdPrimary ? formData.governmentIdPrimary.name : 'No file chosen'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="governmentIdSecondary">
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
                  <label htmlFor="governmentIdSecondary" className="cursor-pointer bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm">
                    Choose File
                  </label>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.governmentIdSecondary ? formData.governmentIdSecondary.name : 'No file chosen'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="houseFrontPicture">
                  House Front Picture <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center">
                  <input
                    type="file"
                    id="houseFrontPicture"
                    name="houseFrontPicture"
                    onChange={handleFileChange}
                    required
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <label htmlFor="houseFrontPicture" className="cursor-pointer bg-gray-100 border border-gray-300 rounded px-3 py-2 text-sm">
                    Choose File
                  </label>
                  <span className="ml-3 text-sm text-gray-600">
                    {formData.houseFrontPicture ? formData.houseFrontPicture.name : 'No file chosen'}
                  </span>
                </div>
              </div>
            </div>
          </section>
          
          {/* Privacy Agreement */}
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
                className="text-sm text-gray-700"
              >
                I agree to the processing of my personal data in accordance with the Data Privacy Act of 2012 and ISO 27001-aligned policies.
              </label>
            </div>
          </section>
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              onClick={handleReset}
            >
              Reset
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              disabled={!formData.privacyAgreement || isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </main>
      
      {/* Loading Modal */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-center text-gray-700 font-medium">Submitting your application...</p>
            <p className="text-center text-gray-500 text-sm mt-2">Please wait while we process your form.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
