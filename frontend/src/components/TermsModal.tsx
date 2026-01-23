import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
  buttonColor: string;
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
        <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed">
          {children}
        </div>
      )}
    </div>
  );
};

const TermsModal: React.FC<TermsModalProps> = ({ onClose, buttonColor }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const expandAll = () => {
    const allSections = [
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

  const allExpanded = Object.keys(openSections).length === 11 && Object.values(openSections).every(v => v);

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
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Welcome to ATSS</h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              By using our internet services, you agree to the Terms and Conditions and Privacy Policy outlined below. 
              These ensure your protection, quality service, and secure network operations.
            </p>
          </div>

          <div className="bg-white">
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Terms and Conditions</h4>
            </div>

            <Section
              title="Service Provision"
              isOpen={openSections['service-provision']}
              onToggle={() => toggleSection('service-provision')}
            >
              <p>
                ATSS provides internet services on a best-effort basis. Actual speeds and service quality may vary 
                depending on network conditions, customer equipment, location, and external factors.
              </p>
            </Section>

            <Section
              title="Installation & Equipment"
              isOpen={openSections['installation']}
              onToggle={() => toggleSection('installation')}
            >
              <p>
                All installed network equipment provided by ATSS remains company property unless otherwise stated. 
                Customers are responsible for safeguarding installed equipment. Any loss, damage, or unauthorized 
                relocation may be subject to replacement or service fees.
              </p>
            </Section>

            <Section
              title="Billing & Payments"
              isOpen={openSections['billing']}
              onToggle={() => toggleSection('billing')}
            >
              <p>
                Internet service is billed in advance. Failure to settle payments on or before the due date may 
                result in temporary service restriction or suspension without prior notice. Reconnection may be 
                subject to applicable fees. Long-term non-payment may result in permanent service termination.
              </p>
            </Section>

            <Section
              title="Acceptable Use"
              isOpen={openSections['acceptable-use']}
              onToggle={() => toggleSection('acceptable-use')}
            >
              <p>
                Customers agree not to use the service for illegal activities, network abuse, spam distribution, 
                unauthorized resale, or actions that may degrade network performance for other users. ATSS reserves 
                the right to suspend or terminate service, with or without notice, in cases of policy violation.
              </p>
            </Section>

            <Section
              title="Service Interruptions"
              isOpen={openSections['interruptions']}
              onToggle={() => toggleSection('interruptions')}
            >
              <p>
                Service interruptions may occur due to maintenance, equipment failure, power outages, force majeure, 
                or third-party network issues. ATSS will make reasonable efforts to restore service promptly. 
                Scheduled maintenance may be performed without prior notice when necessary to protect network stability.
              </p>
            </Section>

            <Section
              title="Updates to Terms"
              isOpen={openSections['updates']}
              onToggle={() => toggleSection('updates')}
            >
              <p>
                ATSS may update these terms from time to time. Continued use of the service constitutes acceptance 
                of the updated terms.
              </p>
            </Section>
          </div>

          <div className="bg-white border-t border-gray-200">
            <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900">Privacy Policy</h4>
              <p className="text-sm text-gray-600 mt-1">
                ATSS is committed to protecting personal data in accordance with the Data Privacy Act of 2012 
                (RA 10173) and National Privacy Commission regulations.
              </p>
            </div>

            <Section
              title="Information We Collect"
              isOpen={openSections['collect']}
              onToggle={() => toggleSection('collect')}
            >
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Full name, address, contact number, and email</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Valid ID (type, number, and copy)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Billing and payment records</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Service and account information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Internet usage logs (IP, MAC, bandwidth usage)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Customer support interactions</span>
                </li>
              </ul>
            </Section>

            <Section
              title="Why We Collect Your Information"
              isOpen={openSections['why-collect']}
              onToggle={() => toggleSection('why-collect')}
            >
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Create and verify your account</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Provide, maintain, and troubleshoot your internet service</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Process billing and payments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Deliver customer support</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Secure our network</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Comply with legal and regulatory requirements (BIR, LGU, NTC, law enforcement)</span>
                </li>
              </ul>
            </Section>

            <Section
              title="How Your Data Is Shared"
              isOpen={openSections['sharing']}
              onToggle={() => toggleSection('sharing')}
            >
              <ul className="space-y-2 mb-3">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Authorized ATSS employees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Third-party service providers (e.g., Appsheet)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Payment gateways</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Government agencies when required by law</span>
                </li>
              </ul>
              <p className="font-semibold text-gray-800">We DO NOT sell your personal data.</p>
            </Section>

            <Section
              title="Data Retention"
              isOpen={openSections['retention']}
              onToggle={() => toggleSection('retention')}
            >
              <ul className="space-y-2 mb-3">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Subscriber & Billing: 1 year from termination</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Network Logs: 1 year</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Support Records: 2 years</span>
                </li>
              </ul>
              <p>After these periods, data is securely deleted or destroyed.</p>
            </Section>

            <Section
              title="Your Rights"
              isOpen={openSections['rights']}
              onToggle={() => toggleSection('rights')}
            >
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Access your personal information</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Request correction of data</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Withdraw consent</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>Request deletion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-gray-400 mr-2">•</span>
                  <span>File a complaint with NPC</span>
                </li>
              </ul>
            </Section>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold text-gray-900">Data Protection Officer (DPO):</span> Joselito Abdao
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mt-1">
                <span className="font-semibold text-gray-900">Email:</span> dpo@atssfiber.ph
              </p>
              <p className="text-sm text-gray-700 leading-relaxed mt-1">
                <span className="font-semibold text-gray-900">Address:</span> Purok 4 Zone 8 Cupang Antipolo Rizal
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
              <p className="text-sm text-gray-800 font-semibold leading-relaxed">
                I confirm that I have read, understood, and agree to the ATSS Terms & Conditions and Privacy Policy, 
                including service limitations, billing policies, and acceptable use guidelines.
              </p>
            </div>

            <div className="p-4 bg-white rounded border border-gray-200">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-gray-900">Contact Us:</span> 0956 370 4451 | support@atssfiber.ph
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
