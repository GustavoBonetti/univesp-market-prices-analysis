// pages/api/data.js
import Database from 'better-sqlite3';
import path from "node:path";
import {NextRequest, NextResponse} from "next/server";

interface ProductPriceItem {
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

interface ResultQueryPriceHistory {
    id: number,
    name: string,
    image: string,
    prices: string,
    timestamps: string,
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
            'MP.market_product_product_name  AS name,\n' +
            'MP.market_product_product_image AS image,\n' +
            'GROUP_CONCAT(price)             AS prices,\n' +
            'GROUP_CONCAT(timestamp)         AS timestamps,\n' +
            'PH.price                        AS last_price,\n' +
            'DATETIME(PH.timestamp)          AS updated_at\n' +
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

        let actualPrice = 0;
        const pricesIndex: number[] = [];
        const prices: number[] = [];
        const labels: string[] = [];
        priceHistoryResult.prices.split(',').forEach((price, index) => {
            const priceValue = parseFloat(price);

            if (priceValue != actualPrice && pricesIndex.length < 10) {
                pricesIndex.push(index);
                actualPrice = priceValue;
            }
        });

        pricesIndex.forEach(index => {
            const price = priceHistoryResult.prices.split(',').at(index);
            const timestamp = priceHistoryResult.timestamps.split(',').at(index)

            if (typeof price === 'string') {
                prices.push(parseFloat(price));
            }

            if (typeof timestamp === 'string') {
                labels.push(timestamp.substring(0, timestamp.lastIndexOf('.')));
            }

        })

        products.push({
            name: priceHistoryResult.name,
            image: priceHistoryResult.image,
            timestamps: labels,
            prices: prices,
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