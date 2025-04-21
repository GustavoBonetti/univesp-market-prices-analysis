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
    PointElement
} from 'chart.js';
import React from "react";

ChartJS.register(CategoryScale, LinearScale, LineController, LineElement, PointElement);

interface MyChartProps {
    chartData: ChartData<'line'>;
    options?: ChartOptions<'line'>;
}

const MyChart: React.FC<MyChartProps> = ({chartData, options}) => {
    const defaultOptions: ChartOptions<'line'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart.js Line Chart',
            },
        },
    };

    const combinedOptions: ChartOptions<'line'> = {
        ...defaultOptions,
        ...options,
    };

    return <Line data={chartData} options={combinedOptions} height={100}/>;
};

export default MyChart;