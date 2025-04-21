// pages/api/data.js
import Database from 'better-sqlite3';
import path from "node:path";
import {NextRequest, NextResponse} from "next/server";

interface ProductPriceItem {
    name: string;
    price: number[];
}

interface ResultQueryPriceHistory {
    id: number,
    name: string,
    prices: string,
}

const db = new Database(path.join(process.cwd(), 'marketscraper.db'));

export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');

    try {
        const stmt = db.prepare('SELECT MP.market_product_product_id AS id, MP.market_product_product_name AS name, GROUP_CONCAT(price) AS prices\n' +
            'FROM price_history PH JOIN market_products MP ON MP.market_product_id = PH.market_product_id\n' +
            'WHERE MP.product_id = ?\n' +
            'GROUP BY MP.market_product_product_id\n' +
            'ORDER BY MP.market_product_product_id, timestamp DESC');
        const rows = stmt.all(id)

        const products: ProductPriceItem[] = [];
        rows.forEach((row) => {
            if (typeof row === 'object' && row !== null) {
                const result: ResultQueryPriceHistory = row as ResultQueryPriceHistory;
                products.push({
                    name: result.name,
                    price: result.prices.split(',').map(parseFloat),
                })
            }
        })

        return NextResponse.json(products);
    } catch (err) {
        console.error("Database error:", err);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}