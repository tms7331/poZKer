# PoZKer - ZK Poker with o1js, a Mina zkApp

Tagline: Play poker with your friends in a fully permissionless and trustless manner.

The problem it solves: 

Challenges we ran into: 

Technologies we used: o1js, typescript, nextJs serverless api function for the Oracle  

The oracle code can be found at: https://github.com/enderNakamoto/pozker-oracle

## How to build

Navigate to the `contracts` folder, and run:

```sh
npm run build
```

## How to run tests

```sh
npm run test
```

## How to play poker

After building run 

```sh
node build/src/playpoker.js
```

A local Mina blockchain instance will be created and both players can choose their actions via the console.

## Attempts at building Mental Poker
We tried to build mental poker based on the following work: 
https://github.com/mirceanis/prove-my-turn. which is an old implementation on `snarkyjs`, an attempt was made to port this code to latest `O1js` version. 

This was in turn based on 
https://geometry.xyz/notebook/mental-poker-in-the-age-of-snarks-part-1

However, we could not finish this, we plan on building this in the future. , Instead we used an oracle that sends shuffled card based on the gameId with a verifiable signature. 

## License

[Apache-2.0](LICENSE)
