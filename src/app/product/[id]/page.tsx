'use client';

import { useParams } from 'next/navigation';
import {useEffect, useState} from "react";
import MyChart from "@/components/MyChart";
import Link from "next/link";

interface DatasetItem {
    label: string;
    data: number[];
}

interface ProductPricesItem {
    name: string;
    image: string;
    prices: number[];
    timestamps: string[];
    last_price: number;
    updated_at: string;
    max_price_month: number
    min_price_month: number
    max_price_annual: number
    min_price_annual: number
}

export default function ItemDetailsPage() {
    const params = useParams<{ id: string }>();
    const productId = params ? params.id : null;
    const [productInfo, setProductInfo] = useState<ProductPricesItem>();
    const [chartDataValues, setChartDataValues] = useState<DatasetItem[]>([]);
    const [chartDataLabels, setChartDataLabels] = useState<string[] | undefined>([]);
    const [error, setError] = useState<string | null>(null);

    const chartData = {
        labels: chartDataLabels,
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
            .then((responseData: ProductPricesItem[]) => {
                setChartDataValues(responseData.map((item) => {
                    return {
                        label: item.name,
                        data: item.prices,
                        backgroundColor: randomRgba(),
                        borderColor: randomRgba()
                    };
                }));

                setChartDataLabels(responseData.at(0)?.timestamps);

                setProductInfo(responseData.at(0));
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
                <div className="font-bold text-xl">PROJETO INTEGRADOR UNIVESP</div>
                <div className="flex items-center">
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Side */}
                    <div className="md:w-1/3 flex flex-col gap-6">
                        <div className="bg-white rounded-md shadow-md p-6 flex items-center justify-center">
                            <div className="text-center">
                                <img src={"/products_images/" + (productInfo?.image ? productInfo.image : 'empty.jpeg')}/>
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
                                {productInfo?.name}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-2">ESTATÍSTICAS</h3>
                            <p>Preço mais recente: R$ {productInfo?.last_price}</p>
                            <p>Menor preço (mês): R$ {productInfo?.min_price_month}</p>
                            <p>Menor preço (ano): R$ {productInfo?.min_price_annual}</p>
                            <p>Maior preço (mês): R$ {productInfo?.max_price_month}</p>
                            <p>Maior preço (ano): R$ {productInfo?.max_price_annual}</p>
                            <p>Atualizado em: {productInfo?.updated_at}</p>
                        </div>
                    </div>
                </div>

                <div className="md:w-full flex flex-col gap-6">
                    <div className="bg-white rounded-md shadow-md p-6 items-center justify-center">
                        <label htmlFor="descricao" className="block text-gray-700 text-sm font-bold mb-2 text-center">
                            Variações de preços:
                        </label>
                        <div className="text-center w-full">
                            <MyChart chartData={chartData}/>
                        </div>
                    </div>
                </div>


            </main>
        </div>
    );
}