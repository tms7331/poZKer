// LOOKUP VAL!
// import { NextResponse } from "next/server";
// import { promises as fs } from 'fs';
// import path from 'path';


export async function GET() {
    let jsonData = { "lookupVal": 33, "isFlush": false };
    // TODO - need to load lookup table here and actually get their card value
    return new Response(JSON.stringify(jsonData));
}
