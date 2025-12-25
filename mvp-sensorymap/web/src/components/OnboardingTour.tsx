import React, { useState, useEffect } from 'react';
import './OnboardingTour.css';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to SenseScape! 🌈',
    description: 'Explore sensory experiences in urban environments. Let\'s take a quick tour to get you started.',
    target: 'body',
    position: 'center',
  },
  {
    id: 'add-feeling',
    title: 'Add Your Feelings',
    description: 'Click the "+ Add Feeling" button to log your sensory experiences at any location on the map.',
    target: '.fab-add-feeling',
    position: 'left',
  },
  {
    id: 'map-click',
    title: 'Explore Locations',
    description: 'Click anywhere on the map to see aggregated sensory reviews from the community.',
    target: '.map-screen',
    position: 'center',
  },
  {
    id: 'atmosphere',
    title: 'View Atmosphere',
    description: 'Toggle the "Atmosphere" button to see collective emotional overlays on the map.',
    target: '.map-view-controls .map-control-button:first-child',
    position: 'left',
  },
  {
    id: 'sensory-layers',
    title: 'Sensory Layers',
    description: 'Enable "Sensory" layers to visualize specific sensory elements like sound, light, and smell.',
    target: '.map-view-controls .map-control-button:last-child',
    position: 'left',
  },
  {
    id: 'time-filter',
    title: 'Filter by Time',
    description: 'Use the time filter to see how feelings change throughout the day.',
    target: '.time-filter-panel',
    position: 'right',
  },
];

interface OnboardingTourProps {
  visible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({ visible, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (visible && currentStep < TOUR_STEPS.length) {
      updateHighlightPosition();
      window.addEventListener('resize', updateHighlightPosition);
      return () => window.removeEventListener('resize', updateHighlightPosition);
    }
  }, [visible, currentStep]);

  const updateHighlightPosition = () => {
    const step = TOUR_STEPS[currentStep];
    if (step.target === 'body' || step.target === '.map-screen') {
      setHighlightPosition(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    } else {
      setHighlightPosition(null);
    }
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sensescape-onboarding-completed', 'true');
    }
    onComplete();
  };

  const handleSkip = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sensescape-onboarding-completed', 'true');
    }
    onSkip();
  };

  if (!visible) return null;

  const step = TOUR_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <>
      {/* Overlay */}
      <div className="tour-overlay" onClick={handleSkip} />
      
      {/* Highlight */}
      {highlightPosition && (
        <div
          className="tour-highlight"
          style={{
            top: `${highlightPosition.top}px`,
            left: `${highlightPosition.left}px`,
            width: `${highlightPosition.width}px`,
            height: `${highlightPosition.height}px`,
          }}
        />
      )}

      {/* Tooltip */}
      <div className={`tour-tooltip tour-tooltip-${step.position}`}>
        <div className="tour-progress">
          Step {currentStep + 1} of {TOUR_STEPS.length}
        </div>
        <h3 className="tour-title">{step.title}</h3>
        <p className="tour-description">{step.description}</p>
        <div className="tour-actions">
          {!isFirstStep && (
            <button className="tour-button tour-button-secondary" onClick={handlePrevious}>
              Previous
            </button>
          )}
          <button className="tour-button tour-button-skip" onClick={handleSkip}>
            Skip Tour
          </button>
          <button className="tour-button tour-button-primary" onClick={handleNext}>
            {isLastStep ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}

