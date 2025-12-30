import { Box, Button, Text, VStack, HStack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Step, StepDescription, StepIcon, StepIndicator, StepNumber, StepSeparator, StepStatus, StepTitle, Stepper } from '@chakra-ui/react';
import { useState } from 'react';
import { FiPlay, FiDatabase, FiCpu, FiBarChart2, FiCheck } from 'react-icons/fi';

export default function Tutorial({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Epoch-ML',
      description: 'A platform for creating and training neural networks',
      icon: FiCpu
    },
    {
      title: 'Upload Your Data',
      description: 'Go to the Data section to upload your datasets',
      icon: FiDatabase
    },
    {
      title: 'Create a Model',
      description: 'Design your neural network architecture',
      icon: FiCpu
    },
    {
      title: 'Train Your Model',
      description: 'Configure parameters and start training',
      icon: FiPlay
    },
    {
      title: 'Evaluate Performance',
      description: 'Check metrics and compare models',
      icon: FiBarChart2
    }
  ];

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
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
            onClick={nextStep}
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