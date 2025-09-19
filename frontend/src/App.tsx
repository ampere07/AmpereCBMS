import React, { useState, useEffect } from 'react';

// Geographic data interfaces
interface RegionData {
  id: string;
  name: string;
}

interface CitiesData {
  [key: string]: RegionData[];
}

interface BarangaysData {
  [key: string]: RegionData[];
}

interface LocationsData {
  [key: string]: RegionData[];
}

interface GeographicDataType {
  regions: RegionData[];
  cities: CitiesData;
  barangays: BarangaysData;
  locations: LocationsData;
}

// Geographic data for dropdowns
const geographicData: GeographicDataType = {
  regions: [
    { id: 'NCR', name: 'National Capital Region (NCR)' },
    { id: 'CAR', name: 'Cordillera Administrative Region (CAR)' },
    { id: 'R1', name: 'Region 1 - Ilocos Region' },
    { id: 'R2', name: 'Region 2 - Cagayan Valley' },
    { id: 'R3', name: 'Region 3 - Central Luzon' },
    { id: 'R4A', name: 'Region 4A - CALABARZON' },
    { id: 'R4B', name: 'Region 4B - MIMAROPA' },
    { id: 'R5', name: 'Region 5 - Bicol Region' },
    { id: 'R6', name: 'Region 6 - Western Visayas' },
    { id: 'R7', name: 'Region 7 - Central Visayas' },
    { id: 'R8', name: 'Region 8 - Eastern Visayas' },
    { id: 'R9', name: 'Region 9 - Zamboanga Peninsula' },
    { id: 'R10', name: 'Region 10 - Northern Mindanao' },
    { id: 'R11', name: 'Region 11 - Davao Region' },
    { id: 'R12', name: 'Region 12 - SOCCSKSARGEN' },
    { id: 'R13', name: 'Region 13 - Caraga' },
    { id: 'BARMM', name: 'Bangsamoro Autonomous Region in Muslim Mindanao' },
  ],
  cities: {
    'NCR': [
      { id: 'manila', name: 'Manila' },
      { id: 'quezon', name: 'Quezon City' },
      { id: 'makati', name: 'Makati' },
      { id: 'pasig', name: 'Pasig' },
      { id: 'taguig', name: 'Taguig' },
      { id: 'pasay', name: 'Pasay' },
      { id: 'caloocan', name: 'Caloocan' },
    ],
    'CAR': [
      { id: 'baguio', name: 'Baguio City' },
      { id: 'la_trinidad', name: 'La Trinidad' },
      { id: 'bangued', name: 'Bangued' },
      { id: 'tabuk', name: 'Tabuk' },
    ],
    'R1': [
      { id: 'san_fernando_lu', name: 'San Fernando City, La Union' },
      { id: 'laoag', name: 'Laoag City' },
      { id: 'dagupan', name: 'Dagupan City' },
      { id: 'vigan', name: 'Vigan City' },
    ],
    'R2': [
      { id: 'tuguegarao', name: 'Tuguegarao City' },
      { id: 'ilagan', name: 'Ilagan City' },
      { id: 'cauayan', name: 'Cauayan City' },
      { id: 'santiago', name: 'Santiago City' },
    ],
    'R3': [
      { id: 'san_fernando_p', name: 'San Fernando City, Pampanga' },
      { id: 'angeles', name: 'Angeles City' },
      { id: 'olongapo', name: 'Olongapo City' },
      { id: 'malolos', name: 'Malolos City' },
    ],
    'R4A': [
      { id: 'calamba', name: 'Calamba City' },
      { id: 'batangas', name: 'Batangas City' },
      { id: 'lipa', name: 'Lipa City' },
      { id: 'antipolo', name: 'Antipolo City' },
    ],
    'R4B': [
      { id: 'calapan', name: 'Calapan City' },
      { id: 'puerto_princesa', name: 'Puerto Princesa City' },
    ],
    'R5': [
      { id: 'legazpi', name: 'Legazpi City' },
      { id: 'naga', name: 'Naga City' },
      { id: 'sorsogon', name: 'Sorsogon City' },
    ],
    'R6': [
      { id: 'iloilo', name: 'Iloilo City' },
      { id: 'bacolod', name: 'Bacolod City' },
      { id: 'roxas', name: 'Roxas City' },
    ],
    'R7': [
      { id: 'cebu', name: 'Cebu City' },
      { id: 'lapu_lapu', name: 'Lapu-Lapu City' },
      { id: 'mandaue', name: 'Mandaue City' },
      { id: 'tagbilaran', name: 'Tagbilaran City' },
    ],
    'R8': [
      { id: 'tacloban', name: 'Tacloban City' },
      { id: 'ormoc', name: 'Ormoc City' },
      { id: 'catbalogan', name: 'Catbalogan City' },
    ],
    'R9': [
      { id: 'zamboanga', name: 'Zamboanga City' },
      { id: 'dipolog', name: 'Dipolog City' },
      { id: 'pagadian', name: 'Pagadian City' },
    ],
    'R10': [
      { id: 'cagayan_de_oro', name: 'Cagayan de Oro City' },
      { id: 'iligan', name: 'Iligan City' },
      { id: 'valencia', name: 'Valencia City' },
    ],
    'R11': [
      { id: 'davao', name: 'Davao City' },
      { id: 'tagum', name: 'Tagum City' },
      { id: 'digos', name: 'Digos City' },
    ],
    'R12': [
      { id: 'general_santos', name: 'General Santos City' },
      { id: 'koronadal', name: 'Koronadal City' },
      { id: 'cotabato', name: 'Cotabato City' },
    ],
    'R13': [
      { id: 'butuan', name: 'Butuan City' },
      { id: 'surigao', name: 'Surigao City' },
      { id: 'tandag', name: 'Tandag City' },
    ],
    'BARMM': [
      { id: 'marawi', name: 'Marawi City' },
      { id: 'lamitan', name: 'Lamitan City' },
    ],
  },
  barangays: {
    // Example for Manila
    'manila': [
      { id: 'binondo', name: 'Binondo' },
      { id: 'ermita', name: 'Ermita' },
      { id: 'intramuros', name: 'Intramuros' },
      { id: 'malate', name: 'Malate' },
      { id: 'quiapo', name: 'Quiapo' },
      { id: 'sampaloc', name: 'Sampaloc' },
      { id: 'san_andres', name: 'San Andres' },
      { id: 'san_miguel', name: 'San Miguel' },
      { id: 'san_nicolas', name: 'San Nicolas' },
      { id: 'santa_ana', name: 'Santa Ana' },
      { id: 'santa_cruz', name: 'Santa Cruz' },
      { id: 'tondo', name: 'Tondo' },
    ],
    // Example for Quezon City
    'quezon': [
      { id: 'bahay_toro', name: 'Bahay Toro' },
      { id: 'batasan_hills', name: 'Batasan Hills' },
      { id: 'commonwealth', name: 'Commonwealth' },
      { id: 'fairview', name: 'Fairview' },
      { id: 'holy_spirit', name: 'Holy Spirit' },
      { id: 'kamuning', name: 'Kamuning' },
      { id: 'new_era', name: 'New Era' },
      { id: 'novaliches', name: 'Novaliches' },
      { id: 'tandang_sora', name: 'Tandang Sora' },
      { id: 'cubao', name: 'Cubao' },
      { id: 'diliman', name: 'Diliman' },
      { id: 'loyola_heights', name: 'Loyola Heights' },
    ],
    // Add barangays for Iligan City
    'iligan': [
      { id: 'acmac', name: 'Acmac' },
      { id: 'bagong_silang', name: 'Bagong Silang' },
      { id: 'bonbonon', name: 'Bonbonon' },
      { id: 'buruun', name: 'Buruun' },
      { id: 'digkilaan', name: 'Digkilaan' },
      { id: 'hinaplanon', name: 'Hinaplanon' },
      { id: 'mainit', name: 'Mainit' },
      { id: 'mandulog', name: 'Mandulog' },
      { id: 'pala-o', name: 'Pala-o' },
      { id: 'poblacion', name: 'Poblacion' },
      { id: 'santa_elena', name: 'Santa Elena' },
      { id: 'santiago', name: 'Santiago' },
      { id: 'suarez', name: 'Suarez' },
      { id: 'tambacan', name: 'Tambacan' },
      { id: 'tipanoy', name: 'Tipanoy' },
      { id: 'tubod', name: 'Tubod' },
      { id: 'upper_hinaplanon', name: 'Upper Hinaplanon' },
    ],
    // Add barangays for other cities as needed
  },
  locations: {
    // Sample locations for some barangays in Manila
    'binondo': [
      { id: 'divisoria', name: 'Divisoria Area' },
      { id: 'juan_luna', name: 'Juan Luna Street' },
      { id: 'binondo_church', name: 'Binondo Church Area' },
    ],
    'ermita': [
      { id: 'roxas_blvd', name: 'Roxas Boulevard' },
      { id: 'pedro_gil', name: 'Pedro Gil Area' },
      { id: 'manila_bay', name: 'Manila Bay Area' },
    ],
    // Sample locations for some barangays in Quezon City
    'diliman': [
      { id: 'up_campus', name: 'UP Campus' },
      { id: 'philcoa', name: 'Philcoa' },
      { id: 'teachers_village', name: 'Teachers Village' },
    ],
    'cubao': [
      { id: 'araneta_center', name: 'Araneta Center' },
      { id: 'gateway_mall', name: 'Gateway Mall Area' },
      { id: 'ali_mall', name: 'Ali Mall Area' },
    ],
    // Add more locations as needed
  }
};

function App() {
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
    nearestLandmark1: string;
    nearestLandmark2: string;
    plan: string;
    promo: string;
    proofOfBilling: File | null;
    governmentIdPrimary: File | null;
    governmentIdSecondary: File | null;
    houseFrontPicture: File | null;
    privacyAgreement: boolean;
  }

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
    nearestLandmark1: '',
    nearestLandmark2: '',
    plan: '',
    promo: 'None',
    proofOfBilling: null,
    governmentIdPrimary: null,
    governmentIdSecondary: null,
    houseFrontPicture: null,
    privacyAgreement: false
  });

  // State for available dropdown options
  const [availableCities, setAvailableCities] = useState<Array<{ id: string, name: string }>>([]);
  const [availableBarangays, setAvailableBarangays] = useState<Array<{ id: string, name: string }>>([]);

  // Update city options when region changes
  useEffect(() => {
    if (formData.region && formData.region in geographicData.cities) {
      setAvailableCities(geographicData.cities[formData.region]);
      // Reset dependent fields
      setFormData(prev => ({
        ...prev,
        city: '',
        barangay: '',
        location: ''
      }));
      setAvailableBarangays([]);
    } else {
      setAvailableCities([]);
    }
  }, [formData.region]);

  // Update barangay options when city changes
  useEffect(() => {
    if (formData.city && formData.city in geographicData.barangays) {
      setAvailableBarangays(geographicData.barangays[formData.city]);
      // Reset dependent fields
      setFormData(prev => ({
        ...prev,
        barangay: '',
        location: ''
      }));
    } else {
      setAvailableBarangays([]);
    }
  }, [formData.city]);

  // Track full location text
  const [fullLocationText, setFullLocationText] = useState<string>('');

  // Update full location when region, city, or barangay changes
  useEffect(() => {
    const selectedRegion = geographicData.regions.find(r => r.id === formData.region);
    const selectedCity = availableCities.find(c => c.id === formData.city);
    const selectedBarangay = availableBarangays.find(b => b.id === formData.barangay);
    
    let locationText = '';
    
    if (selectedRegion) {
      locationText += selectedRegion.name;
      
      if (selectedCity) {
        locationText += ', ' + selectedCity.name;
        
        if (selectedBarangay) {
          locationText += ', ' + selectedBarangay.name;
        }
      }
    }
    
    setFullLocationText(locationText);
    // Update the location field in formData
    if (locationText) {
      setFormData(prev => ({
        ...prev,
        location: locationText
      }));
    }
  }, [formData.region, formData.city, formData.barangay, availableCities, availableBarangays]);

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
    
    // Add form fields to FormData
    submissionData.append('first_name', formData.firstName);
    submissionData.append('middle_name', formData.middleInitial);
    submissionData.append('last_name', formData.lastName);
    submissionData.append('email', formData.email);
    // Generate a random password (will be changed by user later)
    const tempPassword = Math.random().toString(36).slice(-8);
    submissionData.append('password', tempPassword);
    submissionData.append('password_confirmation', tempPassword);
    submissionData.append('phone_number', formData.mobile);
    
    // Add address information
    submissionData.append('address_line1', formData.installationAddress);
    submissionData.append('city', formData.city);
    submissionData.append('province', formData.region);
    submissionData.append('postal_code', '1000'); // Default postal code
    
    // Add additional information
    submissionData.append('application_status', 'pending');
    submissionData.append('application_date', new Date().toISOString().split('T')[0]);
    submissionData.append('is_applicant', 'true');
    
    try {
      // First submit the application form
      const apiBaseUrl = 'http://127.0.0.1:8080'; // Update this to match your server
      
      // Get CSRF token first
      await fetch(`${apiBaseUrl}/sanctum/csrf-cookie`, {
        credentials: 'include'
      });
      
      const response = await fetch(`${apiBaseUrl}/api/application/submit`, {
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
      const userId = result.user.id;
      
      // Now upload documents if they exist
      const documentsToUpload = [
        { file: formData.proofOfBilling, type: 'proof_of_billing' },
        { file: formData.governmentIdPrimary, type: 'government_id_primary' },
        { file: formData.governmentIdSecondary, type: 'government_id_secondary' },
        { file: formData.houseFrontPicture, type: 'house_front_picture' }
      ];
      
      // Upload each document
      for (const doc of documentsToUpload) {
        if (doc.file) {
          const docFormData = new FormData();
          docFormData.append('user_id', userId);
          docFormData.append('document_type', doc.type);
          docFormData.append('document', doc.file);
          
          const docResponse = await fetch(`${apiBaseUrl}/api/documents`, {
            method: 'POST',
            body: docFormData,
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${result.token}`
            }
          });
          
          if (!docResponse.ok) {
            console.error(`Failed to upload ${doc.type}:`, await docResponse.json());
          }
        }
      }
      
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
      nearestLandmark1: '',
      nearestLandmark2: '',
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
                  {geographicData.regions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
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
                  {availableCities.map(city => (
                    <option key={city.id} value={city.id}>{city.name}</option>
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
                  {availableBarangays.map(barangay => (
                    <option key={barangay.id} value={barangay.id}>{barangay.name}</option>
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
                <label className="block text-gray-700 font-medium mb-2" htmlFor="nearestLandmark1">
                  Nearest Landmark #1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nearestLandmark1"
                  name="nearestLandmark1"
                  value={formData.nearestLandmark1}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter nearest landmark"
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2" htmlFor="nearestLandmark2">
                  Nearest Landmark #2 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nearestLandmark2"
                  name="nearestLandmark2"
                  value={formData.nearestLandmark2}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter second nearest landmark"
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
                  <option value="basic">Basic Plan - 20 Mbps</option>
                  <option value="standard">Standard Plan - 50 Mbps</option>
                  <option value="premium">Premium Plan - 100 Mbps</option>
                  <option value="business">Business Plan - 200 Mbps</option>
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
                  <option value="None">None</option>
                  <option value="3MonthsFree">3 Months Free</option>
                  <option value="HalfOff">50% Off First Month</option>
                  <option value="FreeInstallation">Free Installation</option>
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
              disabled={!formData.privacyAgreement}
            >
              Submit
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default App;