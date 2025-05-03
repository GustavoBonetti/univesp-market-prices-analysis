// pages/api/data.js
import Database from 'better-sqlite3';
import path from "node:path";
import {NextRequest, NextResponse} from "next/server";

interface ProductPriceItem {
    name: string;
    prices: number[];
    last_price: number;
    updated_at: string;
    max_price_month: number
    min_price_month: number
    max_price_annual: number
    min_price_annual: number
}

interface ResultQueryPriceHistory {
    id: number,
    name: string,
    prices: string,
    last_price: number
    updated_at: string
}

interface ResultQueryPriceMonth {
    max_price: number
    min_price: number
}

interface ResultQueryPriceAnnual {
    max_price: number
    min_price: number
}

const db = new Database(path.join(process.cwd(), 'marketscraper.db'));

export async function GET(request: NextRequest) {
    const id = request.nextUrl.searchParams.get('id');
    const products: ProductPriceItem[] = [];

    try {
        const priceHistoryStmt = db.prepare('SELECT MP.market_product_id           AS id,\n' +
            'MP.market_product_product_name AS name,\n' +
            'GROUP_CONCAT(price)            AS prices,\n' +
            'PH.price                       AS last_price,\n' +
            'DATETIME(PH.timestamp)         AS updated_at\n' +
            'FROM price_history PH JOIN market_products MP ON MP.market_product_id = PH.market_product_id\n' +
            'WHERE MP.market_product_id = ?\n' +
            'GROUP BY MP.market_product_id\n' +
            'ORDER BY MP.market_product_id, timestamp DESC');
        const priceHistory = priceHistoryStmt.get(id)

        const pricesMonthStmt = db.prepare("SELECT MIN(PH.price) as min_price, MAX(PH.price) as max_price\n" +
            "FROM price_history PH\n" +
            "WHERE STRFTIME('%m', PH.\"timestamp\") = STRFTIME('%m', DATE('NOW'))\n" +
            "  AND PH.market_product_id = ?\n" +
            "  AND PH.price > 0");
        const pricesMonth = pricesMonthStmt.get(id)

        const pricesAnnualStmt = db.prepare("SELECT MIN(PH.price) as min_price, MAX(PH.price) as max_price\n" +
            "FROM price_history PH\n" +
            "WHERE STRFTIME('%Y', PH.\"timestamp\") = STRFTIME('%Y', DATE('NOW'))\n" +
            "  AND PH.market_product_id = ?\n" +
            "  AND PH.price > 0");
        const pricesAnnual = pricesAnnualStmt.get(id)

        const priceHistoryResult: ResultQueryPriceHistory = priceHistory as ResultQueryPriceHistory;
        const priceMonthResult: ResultQueryPriceMonth = pricesMonth as ResultQueryPriceMonth;
        const priceAnnualResult: ResultQueryPriceAnnual = pricesAnnual as ResultQueryPriceAnnual;

        products.push({
            name: priceHistoryResult.name,
            prices: priceHistoryResult.prices.split(',').map(parseFloat),
            last_price: priceHistoryResult.last_price,
            updated_at: priceHistoryResult.updated_at,
            max_price_month: priceMonthResult.max_price,
            min_price_month: priceMonthResult.min_price,
            max_price_annual: priceAnnualResult.max_price,
            min_price_annual: priceAnnualResult.min_price,
        });

        console.log()

        return NextResponse.json(products);
    } catch (err) {
        console.error("Database error:", err);
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}