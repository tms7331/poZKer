import { getHoleFromOracle, getFlopFromOracle, getRiverFromOracle, getTakeFromOracle } from "./oracleLib.js";

const responseA = await getHoleFromOracle("32");
console.log("hole", responseA);

const responseB = await getFlopFromOracle("32");
console.log("flop", responseB);
let flopHand = responseB.hand
console.log("flop hand", flopHand);

const responseC = await getTakeFromOracle("32");
console.log("take", responseC);

const responseD = await getRiverFromOracle("32");
console.log("river", responseD);