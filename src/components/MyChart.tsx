// components/MyChart.tsx
"use client";
import {Line} from 'react-chartjs-2';
import {
    CategoryScale,
    Chart as ChartJS,
    ChartData,
    ChartOptions, LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
    Title
} from 'chart.js';
import React from "react";

ChartJS.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Title, Tooltip);

interface MyChartProps {
    chartData: ChartData<'line'>;
    options?: ChartOptions<'line'>;
}

const MyChart: React.FC<MyChartProps> = ({chartData, options}) => {
    const defaultOptions: ChartOptions<'line'> = {
        responsive: true,
    };

    const combinedOptions: ChartOptions<'line'> = {
        ...defaultOptions,
        ...options,
    };

    return <Line data={chartData} options={combinedOptions} height={100}/>;
};

export default MyChart;