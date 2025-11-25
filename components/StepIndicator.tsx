
import React from 'react';
import { AppStep } from '../types';
import { User, Image as ImageIcon, Move, CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: AppStep;
  onStepChange: (step: AppStep) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepChange }) => {
  const steps = [
    { id: AppStep.UPLOAD_CHARACTER, label: 'Characters', icon: User },
    { id: AppStep.BACKGROUND_SETUP, label: 'Background', icon: ImageIcon },
    { id: AppStep.COMPOSITION, label: 'Place & Pose', icon: Move },
    { id: AppStep.RESULT, label: 'Result', icon: CheckCircle },
  ];

  return (
    <div className="w-full py-6 px-4 mb-8">
      <div className="max-w-4xl mx-auto flex items-center justify-between relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-800 -z-10 transform -translate-y-1/2 rounded-full"></div>
        <div 
            className="absolute top-1/2 left-0 h-1 bg-indigo-600 -z-10 transform -translate-y-1/2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;
          
          return (
            <div 
              key={step.id} 
              className="flex flex-col items-center gap-2 cursor-pointer group"
              onClick={() => onStepChange(step.id)}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 
                  ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 group-hover:border-indigo-500/50 group-hover:text-indigo-400'}
                  ${isCurrent ? 'ring-4 ring-indigo-500/30 scale-110' : ''}
                `}
              >
                <Icon size={18} />
              </div>
              <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
