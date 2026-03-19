import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
  buttonColor: string;
  termsAndCondition?: string;
  privacyPolicy?: string;
  contactInformation?: string;
  brandName?: string;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const Section: React.FC<SectionProps> = ({ title, children, isOpen, onToggle }) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center py-4 px-6 hover:bg-gray-50 transition-colors"
      >
        <h5 className="font-semibold text-gray-800 text-left">{title}</h5>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
          {children}
        </div>
      )}
    </div>
  );
};

const TermsModal: React.FC<TermsModalProps> = ({ onClose, buttonColor, termsAndCondition, privacyPolicy, contactInformation, brandName }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const expandAll = () => {
    const allSections = [
      'terms-main',
      'privacy-main',
      'contact-main',
      'service-provision',
      'installation',
      'billing',
      'acceptable-use',
      'interruptions',
      'updates',
      'collect',
      'why-collect',
      'sharing',
      'retention',
      'rights'
    ];
    const newState: Record<string, boolean> = {};
    allSections.forEach(section => {
      newState[section] = true;
    });
    setOpenSections(newState);
  };

  const collapseAll = () => {
    setOpenSections({});
  };

  const allExpanded = Object.keys(openSections).length >= 3 && Object.values(openSections).every(v => v);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Terms & Conditions and Privacy Policy</h3>
            <p className="text-sm text-gray-500 mt-1">Please review our policies carefully</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">Click sections to expand or collapse</p>
          <button
            onClick={allExpanded ? collapseAll : expandAll}
            className="text-sm font-medium px-4 py-1.5 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
            style={{ color: buttonColor }}
          >
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Welcome to {brandName || 'ATSS'}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              By using our internet services, you agree to the Terms and Conditions and Privacy Policy outlined below. 
              These ensure your protection, quality service, and secure network operations.
            </p>
          </div>

          <div className="bg-white">
            {/* 1. Terms and Conditions Section */}
            <Section
              title="Terms and Conditions"
              isOpen={openSections['terms-main']}
              onToggle={() => toggleSection('terms-main')}
            >
              <div className="whitespace-pre-wrap py-2">
                {termsAndCondition || `Please refer to ${brandName || 'ATSS'}'s official terms and conditions documentation.`}
              </div>
            </Section>

            {/* 2. Privacy Policy Section */}
            <Section
              title="Privacy Policy"
              isOpen={openSections['privacy-main']}
              onToggle={() => toggleSection('privacy-main')}
            >
              <div className="whitespace-pre-wrap py-2">
                {privacyPolicy || `${brandName || 'ATSS'} is committed to protecting your personal data in accordance with the Data Privacy Act of 2012.`}
              </div>
            </Section>

            {/* 3. Contact Information Section */}
            <Section
              title="Contact Information"
              isOpen={openSections['contact-main']}
              onToggle={() => toggleSection('contact-main')}
            >
              <div className="whitespace-pre-wrap py-2">
                {contactInformation || `For any inquiries, please contact ${brandName || 'ATSS'} customer support.`}
              </div>
            </Section>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
              <p className="text-sm text-gray-800 font-semibold leading-relaxed">
                I confirm that I have read, understood, and agree to the {brandName || 'ATSS'} Terms & Conditions and Privacy Policy, 
                including service limitations, billing policies, and acceptable use guidelines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-8 py-2.5 text-white rounded font-medium hover:opacity-90 transition-all shadow-sm"
            style={{ backgroundColor: buttonColor }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
