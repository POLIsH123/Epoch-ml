import { Box, Heading, Text, VStack, HStack, Progress, Stat, StatLabel, StatNumber, StatGroup, Grid, GridItem, Card, CardBody, CardHeader } from '@chakra-ui/react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TrainingVisualization({ trainingSession }) {
  // Extract training history from the session
  const trainingHistory = trainingSession?.results?.history || {
    loss: [0.8, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2, 0.18, 0.15, 0.12],
    accuracy: [0.5, 0.6, 0.65, 0.7, 0.75, 0.78, 0.8, 0.82, 0.85, 0.88],
    epochs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  };

  // Prepare data for loss chart
  const lossData = {
    labels: trainingHistory.epochs,
    datasets: [
      {
        label: 'Loss',
        data: trainingHistory.loss,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  // Prepare data for accuracy chart
  const accuracyData = {
    labels: trainingHistory.epochs,
    datasets: [
      {
        label: 'Accuracy',
        data: trainingHistory.accuracy,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
      },
    },
  };

  // Calculate final metrics
  const finalLoss = trainingHistory.loss[trainingHistory.loss.length - 1];
  const finalAccuracy = trainingHistory.accuracy[trainingHistory.accuracy.length - 1];

  return (
    <VStack spacing={6} align="stretch">
      <Heading as="h2" size="md">Training Progress</Heading>

      {trainingSession && (
        <>
          <StatGroup>
            <Stat>
              <StatLabel>Current Status</StatLabel>
              <StatNumber textTransform="capitalize">{trainingSession.status}</StatNumber>
            </Stat>

            <Stat>
              <StatLabel>Progress</StatLabel>
              <StatNumber>{trainingSession.progress}%</StatNumber>
            </Stat>

            {trainingSession.totalEpochs > 0 && (
              <Stat>
                <StatLabel>Epoch</StatLabel>
                <StatNumber>{trainingSession.currentEpoch} / {trainingSession.totalEpochs}</StatNumber>
              </Stat>
            )}

            {trainingSession.status === 'completed' && (
              <>
                <Stat>
                  <StatLabel>Final Loss</StatLabel>
                  <StatNumber>{finalLoss ? finalLoss.toFixed(4) : 'N/A'}</StatNumber>
                </Stat>

                <Stat>
                  <StatLabel>Final Accuracy</StatLabel>
                  <StatNumber>{finalAccuracy ? `${(finalAccuracy * 100).toFixed(2)}%` : 'N/A'}</StatNumber>
                </Stat>
              </>
            )}
          </StatGroup>

          <Progress
            value={trainingSession.progress}
            size="md"
            colorScheme="teal"
          />

          {trainingSession.status === 'completed' && (
            <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
              <Card>
                <CardHeader>
                  <Heading size="sm">Loss Over Time</Heading>
                </CardHeader>
                <CardBody>
                  <Line options={options} data={lossData} />
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <Heading size="sm">Accuracy Over Time</Heading>
                </CardHeader>
                <CardBody>
                  <Line options={options} data={accuracyData} />
                </CardBody>
              </Card>
            </Grid>
          )}
        </>
      )}

      {!trainingSession && (
        <Text>No training session selected or available.</Text>
      )}
    </VStack>
  );
}
