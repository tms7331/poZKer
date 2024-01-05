
export async function getHoleFromOracle(gameId: string) {
    const url = `http://localhost:3000/api/deal_hands?gameId=${gameId}&handId=hole`
    const response = await fetch(url);
    const data = await response.json();
    return data
}


export async function getFlopFromOracle(gameId: string) {
    const url = `http://localhost:3000/api/deal_hands?gameId=${gameId}&handId=flop`
    const response = await fetch(url);
    const data = await response.json();
    return data
}


export async function getTakeFromOracle(gameId: string) {
    const url = `http://localhost:3000/api/deal_hands?gameId=${gameId}&handId=take`
    const response = await fetch(url);
    const data = await response.json();
    return data
}


export async function getRiverFromOracle(gameId: string) {
    const url = `http://localhost:3000/api/deal_hands?gameId=${gameId}&handId=take`
    const response = await fetch(url);
    const data = await response.json();
    return data
}


export async function getCardFromOracle(gameId: string) {
    const url = `http://localhost:3000/api/deal_hands?gameId=${gameId}&handId=take`
    const response = await fetch(url);
    const data = await response.json();
    return data;
}