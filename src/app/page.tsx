'use client'

import {useEffect, useState} from "react";
import Link from "next/link";

interface ProductItem {
    product_id: number;
    product_name: string;
    product_category: string;
    product_image: string;
    last_modified: string;
}

export default function Home() {
    const [data, setData] = useState<ProductItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const capitalizeName = (name: string) => {
        if (!name) return '';
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    useEffect(() => {
        fetch('/api/products')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                return response.json();
            })
            .then((responseData: ProductItem[]) => {
                setData(responseData.map((item) => ({...item, checked: false})));
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
        <div className="flex flex-col min-h-screen p-5 bg-gray-100">
            <header className="flex justify-between items-center mb-5 py-2">
                <div className="font-bold text-xl">PROJETO INTEGRADOR UNIVESP</div>
                <div className="flex">
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    placeholder="Pesquisar..."*/}
                    {/*    className="border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"*/}
                    {/*/>*/}
                    {/*<button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r-md">*/}
                    {/*    Pesquisar*/}
                    {/*</button>*/}
                </div>
            </header>

            <main className="flex-grow">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {data.map((item) => (
                        <Link key={item.product_id} href={`/product/${item.product_id}`} passHref>
                            <div
                                key={item.product_id}
                                className="bg-white border border-gray-200 rounded-md shadow-md p-2"
                            >
                                <img src={"products_images/" + (item.product_image ? item.product_image : 'empty.jpeg')} className="w-full"/>
                                <div className="mt-2">
                                    <p className="text-sm"><b>Nome:</b> {capitalizeName(item.product_name)}</p>
                                    <p className="text-sm"><b>Categoria:</b> {capitalizeName(item.product_category)}</p>
                                    <p className="text-sm"><b>Última atualização:</b> {capitalizeName(item.last_modified)}</p>
                                </div>

                            </div>
                        </Link>
                    ))}
                </div>
            </main>
        </div>
    );
}