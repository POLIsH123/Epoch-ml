import { Box, Heading, Text, Button, VStack, Container, Card, CardHeader, CardBody, CardFooter, useToast, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';
import { useState } from 'react';

export default function ModelExporter({ modelId, modelName }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState(null);
  const toast = useToast();
  
  const handleExport = async () => {
    if (!modelId) {
      toast({
        title: 'Error',
        description: 'No model selected for export',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsExporting(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`/api/models/${modelId}/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setExportStatus(data);
        toast({
          title: 'Export Started',
          description: `Exporting model: ${modelName}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // In a real implementation, this would trigger a file download
        // For now, we'll just show the export status
      } else {
        throw new Error(data.error || 'Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: 'Export Failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <VStack spacing={4} align="stretch">
      <Heading as="h3" size="md">Export Model</Heading>
      
      <Text>
        Export your trained model to use locally or share with others.
        The exported model will be in TensorFlow.js format.
      </Text>
      
      <Button 
        colorScheme="teal" 
        onClick={handleExport}
        isLoading={isExporting}
        loadingText="Exporting..."
        isDisabled={!modelId}
      >
        Export Model
      </Button>
      
      {exportStatus && (
        <Alert status="success">
          <AlertIcon />
          <AlertTitle mr={2}>Export Complete!</AlertTitle>
          <AlertDescription>{exportStatus.message}</AlertDescription>
        </Alert>
      )}
      
      {exportStatus && (
        <Card>
          <CardHeader>
            <Heading size="sm">Export Details</Heading>
          </CardHeader>
          <CardBody>
            <Text><strong>Model ID:</strong> {exportStatus.modelId}</Text>
            <Text><strong>Model Name:</strong> {exportStatus.modelName}</Text>
            <Text><strong>Status:</strong> {exportStatus.status}</Text>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
}
