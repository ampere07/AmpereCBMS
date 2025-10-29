import React, { useState, useEffect, useRef } from 'react';
import Form, { FormRef } from './Form';
import MultiStepForm, { MultiStepFormRef } from '../components/MultiStepForm';

const FormPage: React.FC = () => {
  const formRef = useRef<FormRef>(null);
  const multiStepFormRef = useRef<MultiStepFormRef>(null);
  const [formLayout, setFormLayout] = useState<'original' | 'multistep'>('original');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const savedLayout = localStorage.getItem('form_layout') as 'original' | 'multistep';
    if (savedLayout) {
      setFormLayout(savedLayout);
    }
  }, []);

  const handleLayoutChange = (layout: 'original' | 'multistep') => {
    setFormLayout(layout);
    localStorage.setItem('form_layout', layout);
  };

  return (
    <>
      {formLayout === 'original' ? (
        <Form 
          ref={formRef} 
          showEditButton={false}
          onLayoutChange={handleLayoutChange}
          currentLayout={formLayout}
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
        />
      ) : (
        <MultiStepForm 
          ref={multiStepFormRef} 
          showEditButton={false}
          onLayoutChange={handleLayoutChange}
          currentLayout={formLayout}
          isEditMode={isEditMode}
          onEditModeChange={setIsEditMode}
        />
      )}
    </>
  );
};

export default FormPage;
