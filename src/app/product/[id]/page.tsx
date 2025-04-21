'use client';

import { useParams } from 'next/navigation';
import {useEffect, useState} from "react";
import MyChart from "@/components/MyChart";
import Link from "next/link";

interface DatasetItem {
    label: string;
    data: number[];
}

interface ProductPriceItem {
    name: string;
    price: number[];
}

export default function ItemDetailsPage() {
    const params = useParams<{ id: string }>();
    const productId = params ? params.id : null;
    const [chartDataValues, setChartDataValues] = useState<DatasetItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const range = (start: number, end: number): number[] => {
        const result: number[] = [];

        for (let a = start; a <= end; a++) {
            result.push(a);
        }

        return result;
    };

    const chartData = {
        labels: range(1, 7),
        datasets: chartDataValues,
    };

    function randomRgba() {
        const o = Math.round, r = Math.random, s = 255;
        return 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + r().toFixed(1) + ')';
    }

    useEffect(() => {
        fetch('/api/data?id=' + productId)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then((responseData: ProductPriceItem[]) => {
                setChartDataValues(responseData.map((item) => {
                    return {
                        label: item.name,
                        data: item.price,
                        backgroundColor: randomRgba(),
                        borderColor: randomRgba()
                    };
                }));
            })
            .catch((err) => {
                console.error('Error fetching data:', err);
                setError('Failed to load data.');
            });
    }, []);


    if(error){
        return <div>{error}</div>
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col p-6">
            {/* Header */}
            <header className="flex items-center justify-between mb-6">
                <Link href="/" className="text-blue-500 hover:underline">
                    Voltar para a página inicial
                </Link>
                <div className="font-bold text-xl">LOGO DA EMPRESA</div>
                <div className="flex items-center">
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        className="border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r-md">
                        Pesquisar
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-col md:flex-row gap-6">
                {/* Left Side */}
                <div className="md:w-1/3 flex flex-col gap-6">
                    <div className="bg-white rounded-md shadow-md p-6 flex items-center justify-center h-48">
                        <div className="text-center">
                            <div className="font-bold mb-2">FOTO</div>
                            <div className="font-bold">DO</div>
                            <div className="font-bold">PRODUTO</div>
                        </div>
                    </div>
                    <div className="bg-white rounded-md shadow-md p-6 flex items-center justify-center h-48">
                        <div className="text-center">
                            <MyChart chartData={chartData}/>
                        </div>
                    </div>
                </div>

                {/* Right Side */}
                <div className="md:w-2/3 bg-white rounded-md shadow-md p-6 flex flex-col justify-start">
                    <h2 className="text-xl font-bold mb-4">INFORMAÇÕES DO PRODUTO</h2>
                    <div className="mb-4">
                        <label htmlFor="descricao" className="block text-gray-700 text-sm font-bold mb-2">
                            Descrição:
                        </label>
                        <div className="border-b border-gray-300 py-2">
                            {/* Aqui você pode adicionar o conteúdo da descrição */}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold mb-2">ESTATÍSTICAS</h3>
                        <p>Preço mais recente: R$ ______</p>
                        <p>Menor preço (mês): R$ ______</p>
                        <p>Menor preço (ano): R$ ______</p>
                        <p>Maior preço (mês): R$ ______</p>
                        <p>Maior preço (ano): R$ ______</p>
                    </div>
                </div>
            </main>
        </div>
    );
}