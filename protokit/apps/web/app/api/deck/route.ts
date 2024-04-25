// DECK!
import { NextResponse } from "next/server";
import { promises as fs } from 'fs';
import path from 'path';


export async function GET() {
    // Return n cards from the deck

    const min: number = 0;
    const max: number = 52;
    const range: number = max - min;
    // GET INFO...
    const cards = [];
    for (let i = 0; i < 5; i++) {
        const randNum: number = Math.random() * range + min;
        cards.push(Math.floor(randNum).toString());
    }

    let jsonData = { "cards": cards };
    // TODO - need to be loading cards, and somehow return card objects - how can we serialize them?
    // TODO - need two separate return types:  
    // 1. Return entire deck (in shuffle and deal section) - and we'll have to generate deck here if it doesn't exist
    // 2. Return n cards from the deck (in deal section)
    return new Response(JSON.stringify(jsonData));
}

export async function POST() {
    // Store the entire deck in a file
    let jsonData = { "success": true };
    // TODO - need to be loading cards, and somehow return card objects - how can we serialize them?
    // TODO - need two separate return types:  
    // 1. Return entire deck (in shuffle and deal section) - and we'll have to generate deck here if it doesn't exist
    // 2. Return n cards from the deck (in deal section)
    return new Response(JSON.stringify(jsonData));
}