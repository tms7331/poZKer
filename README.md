# poZKer - ZK Mental Poker with o1js, a Mina zkApp

poZKer is a decentralized no-limit Texas hold'em application, built with zero knowledge smart contracts (zkApps) for the Mina blockchain. 

Leveraging the power of TypeScript and o1js, poZKer is permissionless and trustless.  Game logic is entirely onchain, and mental poker is used for card shuffling to remove the need for a trusted source for dealing cards.


## Mental Poker Explainer

Mental poker is a cryptographic concept that refers to a protocol designed to allow individuals to play a card game over a network without the need for a trusted third party or a centralized server. The primary challenge addressed by mental poker is the secure and fair distribution of cards to players without revealing any information about the cards to others. Traditional card games involve physically shuffling and dealing cards, but in the context of mental poker, the goal is to achieve the same level of randomness and secrecy in a virtual environment.

The key feature of mental poker is that it is a commutative encryption scheme, so if two players sequentially encode a card, the decryption can take place in either order.

The result of this is that players can get private cards (their hole cards in Texas hold'em) if one player decrypts half the card and sends it to the other player, who decrypts the card in private.  To avoid the possibility of cheating, the opposing player commits the encrypted card to the smart contract, and a function in the contract finishes the decryption and stores the card hashed internally, so it can be verified at the end of the hand if players need to show their cards.

The encoding process takes place as follows:

As part of our encoding scheme each card in a standard deck is mapped to a unique prime number.  From this unique value, 'cardPrime', we obtain a unique point on an elliptic curve as follows:

`PrivateKey.fromBigInt(BigInt(cardPrime)).toPublicKey()`

This point is known to both players, and will be the decoded value of the card.  A full mapping of these points can be seen here: 
https://github.com/tredfern0/poZKer/blob/main/contracts/src/mentalpoker.ts#L159

A card consists of three group elements, which for convenience are represented with public keys in o1js.  

These elements are:

First, the joint ephemeral key (epk) for this card, the elliptic curve point representing the sum of public keys that are randomly generated and unique to each card.  Second, the card value (msg).  Third, the elliptic curve point representing the sum of the public keys of all players masking this card (pk).

Encoding is a two step process which each player must independently perform.  In addition each player must shuffle the cards at some point during this process.

The first step of encoding leaves the ephemeral key (epk) unchanged.  Each player should generate a new random private key to be used for encoding the cards.  In this first step of encoding, a new public key sum (pk) is calculated by adding the public key of this random private key to the existing value.  This sum is actually performed using group representations of the public keys, in o1js:

`pk.toGroup().add(playerSecret.toPublicKey().toGroup());`

Updating the card value is more complicated, we must add the scaled epk to the card's current message. The scaling factor is derived from the player's secret key which they randomly generated for the encryption.  In o1js:

`msg.toGroup().add(epk.scale(Scalar.fromFields(playerSecret.toFields())));`

The second encryption step involves encrypting with an additional random point, which should be unique to each card.  The joint ephemeral key (epk) is the sum of these points, and the card representation 'msg' field is modified in the same way as before.

The decryption step is simpler.  The joint ephemeral key (epk) and player's public keys are combined and then subtracted from the card.msg, which has the effect of removing that player's encoding.  Once each player performs this operation, the card is decrypted.

This poZKer mental poker implementation is a port of a snarkyjs implementation available here:
https://github.com/mirceanis/prove-my-turn/

Some useful resources with more technical explanations of mental poker are available here:

https://github.com/mirceanis/prove-my-turn/blob/main/docs/shuffle-mask.md

http://archive.cone.informatik.uni-freiburg.de/teaching/teamprojekt/dog-w10/literature/mentalpoker-revisited.pdf

https://geometry.xyz/notebook/mental-poker-in-the-age-of-snarks-part-1

https://geometry.xyz/notebook/mental-poker-in-the-age-of-snarks-part-2


## How to build

Navigate to the `contracts` folder, and run:

```sh
npm run build
```

## How to run tests

```sh
npm run test
```

## How to play via command line

Navigate to the `contracts` folder, and after building, run:

```sh
node build/src/playpoker.js
```

A local Mina blockchain instance will be created and both players can choose their actions via the console.

## Missing Features

Testnet deployment and basic UI coming in February 2024

UI improvement and full onchain gameplay coming in March 2024

## About

poZKer was started at the <a href=https://zkhack.dev>zkhack.dev</a> Istanbul hackathon in November 2023 with <a href=https://github.com/enderNakamoto>enderNakamoto</a>.  

Work is continuing as part of the <a href="https://minafoundation.notion.site/Mina-Navigators-Program-Information-e8d0490aa0e04c28b061887a8cc22f9a">Mina Navigators Program</a>

## License

[Apache-2.0](LICENSE)
