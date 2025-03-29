import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AidTypesChart = ({ data }) => {
  const chartData = {
    labels: ['Food', 'Water', 'Medicine', 'Shelter', 'Clothing'],
    datasets: [
      {
        label: 'Distribution by Type',
        data: data || [65, 40, 55, 30, 70],
        backgroundColor: [
          'hsl(262, 58%, 55%)', // Primary (purple)
          'hsl(330, 100%, 71%)', // Pink
          'hsl(187, 85%, 43%)',  // Cyan
          'hsl(38, 92%, 50%)',   // Orange
          'hsl(270, 95%, 60%)',  // Violet
        ],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-sm font-medium text-gray-700 mb-3">Aid Items Distribution by Type</div>
      <div className="h-60 w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AidTypesChart;
