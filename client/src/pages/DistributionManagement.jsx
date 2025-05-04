const handleCreateDistribution = async (distributionData) => {
  console.log('Sending distribution data:', distributionData);
  try {
    const response = await fetch('/api/distributions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(distributionData)
    });
  } catch (error) {
    console.error('Error creating distribution:', error);
  }
}; 