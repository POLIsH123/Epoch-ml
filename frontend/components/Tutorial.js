import { Box, Button, Text, VStack, HStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Step, StepDescription, StepIcon, StepIndicator, StepNumber, StepSeparator, StepStatus, StepTitle, Stepper } from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiPlay, FiDatabase, FiCpu, FiBarChart2, FiCheck } from 'react-icons/fi';

export default function Tutorial({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Epoch-ML',
      description: 'A platform for creating and training neural networks',
      elementId: null
    },
    {
      title: 'Upload Your Data',
      description: 'Go to the Data section to upload your datasets',
      elementId: 'data-link'
    },
    {
      title: 'Create a Model',
      description: 'Design your neural network architecture',
      elementId: 'models-link'
    },
    {
      title: 'Train Your Model',
      description: 'Configure parameters and start training',
      elementId: 'train-link'
    },
    {
      title: 'Evaluate Performance',
      description: 'Check metrics and compare models',
      elementId: 'model-comparison-link'
    }
  ];

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      onClose();
      // Remove overlay when tutorial is complete
      const overlay = document.querySelector('.tutorial-overlay');
      if (overlay) overlay.remove();
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Function to create spotlight effect
  const createSpotlight = (elementId) => {
    // Remove any existing tutorial overlay
    const existingOverlay = document.querySelector('.tutorial-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    if (!elementId) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0, 0, 0, 0.8)';
    overlay.style.zIndex = '9998';
    overlay.style.pointerEvents = 'none';
    
    // Find the target element
    const targetElement = document.getElementById(elementId) || document.querySelector(`[data-tutorial-id="${elementId}"]`);
    
    if (targetElement) {
      // Get element position and dimensions
      const rect = targetElement.getBoundingClientRect();
      
      // Create spotlight hole
      const spotlight = document.createElement('div');
      spotlight.style.position = 'absolute';
      spotlight.style.borderRadius = '50%';
      spotlight.style.width = '400px';
      spotlight.style.height = '400px';
      spotlight.style.background = 'transparent';
      spotlight.style.boxShadow = `inset 0 0 0 2000px rgba(0, 0, 0, 0.8), 0 0 30px 5px rgba(45, 212, 191, 0.8)`;
      spotlight.style.top = `${rect.top + rect.height / 2 - 200}px`;
      spotlight.style.left = `${rect.left + rect.width / 2 - 200}px`;
      spotlight.style.pointerEvents = 'auto';
      spotlight.style.cursor = 'pointer';
      spotlight.style.zIndex = '9999';
      
      // Add click handler to advance tutorial
      spotlight.addEventListener('click', () => {
        if (activeStep < steps.length - 1) {
          setActiveStep(activeStep + 1);
        } else {
          onClose();
          overlay.remove();
        }
      });
      
      overlay.appendChild(spotlight);
      document.body.appendChild(overlay);
    } else {
      // If element not found, just create a general overlay
      document.body.appendChild(overlay);
    }
  };
  
  // Create spotlight when step changes
  useEffect(() => {
    if (isOpen) {
      createSpotlight(steps[activeStep].elementId);
    } else {
      // Remove overlay when tutorial is closed
      const overlay = document.querySelector('.tutorial-overlay');
      if (overlay) overlay.remove();
    }
    
    return () => {
      // Cleanup on unmount
      const overlay = document.querySelector('.tutorial-overlay');
      if (overlay) overlay.remove();
    };
  }, [activeStep, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" isCentered>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white" zIndex="10000">
        <ModalHeader textAlign="center" borderBottom="1px solid" borderColor="gray.700">
          Getting Started with Epoch-ML
        </ModalHeader>
        <ModalBody py={8}>
          <VStack spacing={8}>
            <Stepper size="lg" index={activeStep} colorScheme="teal">
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>
                  <Box flexShrink="0">
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                  </Box>
                  <StepSeparator />
                </Step>
              ))}
            </Stepper>

            <VStack spacing={4} align="center" px={8}>
              <Text fontSize="lg" textAlign="center" color="gray.300">
                {steps[activeStep].description}
              </Text>
              <Text fontSize="sm" textAlign="center" color="gray.500">
                Step {activeStep + 1} of {steps.length}
              </Text>
            </VStack>
          </VStack>
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Button 
            onClick={prevStep} 
            isDisabled={activeStep === 0}
            variant="outline"
            colorScheme="gray"
          >
            Previous
          </Button>
          <Button 
            onClick={() => {
              if (activeStep < steps.length - 1) {
                setActiveStep(activeStep + 1);
              } else {
                onClose();
              }
            }}
            colorScheme={activeStep === steps.length - 1 ? "green" : "teal"}
            rightIcon={activeStep === steps.length - 1 ? <FiCheck /> : <FiPlay />}
          >
            {activeStep === steps.length - 1 ? 'Complete' : 'Next'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}