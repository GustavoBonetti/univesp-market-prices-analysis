// pages/api/data.js
import Database from 'better-sqlite3';
import path from "node:path";
import {NextResponse} from "next/server";

const db = new Database(path.join(process.cwd(), 'marketscraper.db'));

export async function GET() {
    try {
        const rows = db.prepare('SELECT * FROM products ORDER BY product_name').all();
        return NextResponse.json(rows);
    } catch (err) {
        console.error("Database error:", err); // Log the error on the server
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}
