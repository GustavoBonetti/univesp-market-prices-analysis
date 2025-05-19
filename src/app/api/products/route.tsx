// pages/api/data.js
import Database from 'better-sqlite3';
import path from "node:path";
import {NextResponse} from "next/server";

const db = new Database(path.join(process.cwd(), 'marketscraper.db'));

export async function GET() {
    try {
        const rows = db.prepare('SELECT MP.market_product_id as "product_id", ' +
            'MP.market_product_product_name as "product_name",\n' +
            'P.product_name                 as "product_category",\n' +
            'MP.market_product_product_image as "product_image",\n' +
            'DATETIME(MAX(PH."timestamp"))  as "last_modified"\n' +
            'FROM market_products mp\n' +
            'JOIN price_history PH ON PH.market_product_id = MP.market_product_id\n' +
            'JOIN products P ON mp.product_id = P.product_id\n' +
            'WHERE PH.price > 0\n' +
            'GROUP by MP.market_product_product_name').all();
        return NextResponse.json(rows);
    } catch (err) {
        console.error("Database error:", err); // Log the error on the server
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}
