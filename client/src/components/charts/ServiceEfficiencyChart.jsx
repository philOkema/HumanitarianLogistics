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

const ServiceEfficiencyChart = ({ data }) => {
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Average Days to Deliver',
        data: data || [1.2, 2.3, 2.8, 2.5, 3.5],
        backgroundColor: [
          'hsl(262, 58%, 55%)', // Primary (purple)
          'hsl(38, 92%, 50%)',   // Orange
          'hsl(187, 85%, 43%)',  // Cyan
          'hsl(330, 100%, 71%)', // Pink
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
      <div className="text-sm font-medium text-gray-700 mb-3">Average Distribution Time</div>
      <div className="h-60 w-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default ServiceEfficiencyChart;
