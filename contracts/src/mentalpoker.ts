// NOTE - Code ported from snarkyjs implementation
// Available under Apache License 2.0 at: 
// https://github.com/mirceanis/prove-my-turn/blob/main/src/utils.ts
import { Struct, Group, Scalar, PublicKey, PrivateKey, Bool, Provable, } from 'o1js';
import fs from 'fs';

export class Card extends Struct({
    /**
     * The joint ephemeral key for this card, resulting from all the masking operations.
     * New cards should have this set to the zero point (For example `Group.generator.sub(Group.generator)`)
     */
    epk: PublicKey,

    /**
     * The card value( or masked value) represented as a Group element.
     *
     * Mapping to and from actual game cards and group elements must be done at the application level.
     */
    msg: PublicKey,

    /**
     * The elliptic curve point representing the sum of the public keys of all players masking this card.
     */
    pk: PublicKey,
}) {
    constructor(c1: PublicKey, c2: PublicKey, h: PublicKey) {
        super({ epk: c1, msg: c2, pk: h });
    }
}

// We cannot use PrivateKey.empty() because converting it to a group fails
// so use this as our identifier for an empty private key
export const EMPTYKEY = PrivateKey.fromBigInt(BigInt(1)).toPublicKey();

export function addPlayerToCardMask(card: Card, playerSecret: PrivateKey): Card {
    const isUnmasked: Bool = card.pk.equals(EMPTYKEY);
    const epk: Group = Provable.if(isUnmasked, Group.generator, card.epk.toGroup());
    const newMsg = card.msg.toGroup().add(epk.scale(Scalar.fromFields(playerSecret.toFields())));
    const msg = Provable.if(isUnmasked, card.msg.toGroup(), newMsg);
    const pkMasked = card.pk.toGroup().add(playerSecret.toPublicKey().toGroup());
    const pkIsUnmasked = Group.zero.add(playerSecret.toPublicKey().toGroup());
    const pk = Provable.if(isUnmasked, pkIsUnmasked, pkMasked);
    return new Card(card.epk, PublicKey.fromGroup(msg), PublicKey.fromGroup(pk));
}

function computeSharedSecret(local: PrivateKey, remote: PublicKey): PublicKey {
    return PublicKey.fromGroup(remote.toGroup().scale(Scalar.fromFields(local.toFields())));
}

export function mask(card: Card, nonce: Scalar = Scalar.random()): Card {
    if (card.pk.equals(EMPTYKEY).toBoolean()) {
        throw new Error('illegal_operation: unable to mask as there are no players available to unmask');
    }
    const ePriv = PrivateKey.fromFields(nonce.toFields());
    const ePub = PublicKey.fromPrivateKey(ePriv);
    const epkIsUnmasked: Bool = card.epk.equals(EMPTYKEY);
    const epkUnmasked = ePub.toGroup();
    const epkMasked = card.epk.toGroup().add(ePub.toGroup()); // add an ephemeral public key to the joint ephemeral
    const epk = Provable.if(epkIsUnmasked, epkUnmasked, epkMasked);
    const msg = card.msg.toGroup().add(computeSharedSecret(ePriv, card.pk).toGroup()); // apply ephemeral mask
    return new Card(PublicKey.fromGroup(epk), PublicKey.fromGroup(msg), card.pk);
}

export function partialUnmask(card: Card, playerSecret: PrivateKey): Card {
    if (card.pk.equals(EMPTYKEY).toBoolean() || card.epk.equals(EMPTYKEY).toBoolean()) {
        throw new Error('Cannot unmask card with empty key');
    }
    const d1 = computeSharedSecret(playerSecret, card.epk);
    const pubKey = PublicKey.fromGroup(card.msg.toGroup().sub(d1.toGroup()));
    const privKey = PublicKey.fromGroup(card.pk.toGroup().sub(playerSecret.toPublicKey().toGroup()));;
    const retCard = new Card(card.epk, pubKey, privKey);
    return retCard;
}


//////////// Helper functions

// Used to generate the mapping / switch statement used in cardPrimeToCardPoint
export function buildCardPrimeToCardPointMapping(cardMapping52: Record<string, number>) {
    const fn = "CardPointToPrimeMap.txt";
    for (const [key, value] of Object.entries(cardMapping52)) {
        if (key === "") {
            continue
        }
        const publicKey: PublicKey = cardPrimeToPublicKey(value)
        const publicKeyStr: string = publicKey.toBase58();
        // just print them all out, we'll manually put together the switch statement
        console.log(publicKeyStr)
        console.log(value)
        fs.appendFileSync(fn, publicKeyStr);
        fs.appendFileSync(fn, "\n");
        fs.appendFileSync(fn, value.toString());
        fs.appendFileSync(fn, "\n");

    }
}

// Helper functions for decoding cards
export function getCardAndPrime(card_: Card, shuffleKeyP1: PrivateKey, shuffleKeyP2: PrivateKey): string {
    // TODO - doesn't make sense to have this here, 
    // function that takes both private keys is clearly no good.
    // But how are players communicating with each other?
    // Are we storing the cards in the contract and decoding step by step?
    let card = partialUnmask(card_, shuffleKeyP1);
    card = partialUnmask(card, shuffleKeyP2);
    const cardB58 = card.msg.toBase58()
    const cardStr = cardMapping[cardB58];
    return cardStr
}

export function getCardAndPrimeHalf(card_: Card, shuffleKey: PrivateKey): string {
    // Same as function above, need to rethink how this fits in
    let card = partialUnmask(card_, shuffleKey);
    const cardB58 = card.msg.toBase58()
    const cardStr = cardMapping[cardB58];
    return cardStr
}

// We need public keys as points for our mental poker encryption scheme,
// it's acceptable to make these points deterministic
export function cardPrimeToPublicKey(cardPrime: number): PublicKey {
    return PrivateKey.fromBigInt(BigInt(cardPrime)).toPublicKey();
}

// Want to return a mapping that will allow us to recover the card
// from the public key generated with cardPrimeToPublicKey
// This will map back to the card str!
export function buildCardMapping(cardMapping52: Record<string, number>): Record<string, string> {
    const keyToCard: Record<string, string> = {}

    for (const [key, value] of Object.entries(cardMapping52)) {
        if (key === "") {
            continue
        }
        const publicKey: PublicKey = cardPrimeToPublicKey(value)
        const publicKeyStr: string = publicKey.toBase58();
        keyToCard[publicKeyStr] = key;
    }
    return keyToCard;
}


// Output of buildCardMapping, a mapping from base58 representation of card prime52:
// PrivateKey.fromBigInt(BigInt(cardPrime)).toPublicKey();
// to the card string
// We need this to do a reverse lookup from decoded cards to the card string
export const cardMapping: Record<string, string> = {
    B62qs2xPJgNhvBw7ubgppB4YSDf1dYyvLYD1ghCrhnkXabLSVAainWx: '2h',
    B62qoK7BxuzJx9Kn7hzNXxJGLXXzmXgzfg59p4ZCWYGXsJE2hbwZC2j: '3h',
    B62qrKpP3NBbF97cx2aAdCmaSuVqaiGgvs9fMARxASPmVFgugoQekjr: '4h',
    B62qmn9ZV1nNyLUG7fCcQHpkkt4PaT8ctgtrPyqtBNHP2KfexF2hPro: '5h',
    B62qkj5CSRx9qWwYtHUWaYp5M3whGuhavCmZWBwsTAK9Du7xsq1NgUb: '6h',
    B62qopEG5GqujH3reoh4uAwcbGMJnzSBnokPS1aP7KZGJDK9Yvsn8g3: '7h',
    B62qoYts8pW1GVTt44vhA3esBDN67UsX9jLBackLGarfVKBRWtjQBkU: '8h',
    B62qmK1iyMJfJZXd717RexE9TVf7uLd848gpkWYnnnEufUUWjsmN1Xs: '9h',
    B62qjuepd8NRZzHqVbKcRJUtM5zdM9B2Me2pzDi4i1kUKz1C8Mous19: 'Th',
    B62qmS2bNfvrRXPzLyvbaBVF9g2J6crL4zR6LjcRQzTxzqXTBEjprno: 'Jh',
    B62qnLS6BkhAXF3YHkpSZ9brNoLk1kSo55VQsZqrfYorZVrnjckzQfQ: 'Qh',
    B62qjbhEXAYUqMESzUk4XZcXf5dcTpUy8Sv4Kd231oKs29j25AF23Jc: 'Kh',
    B62qoa5ohnNnFEXfbPshXCzkBkgWSzXk3auy2yS9hyjLma4EkH7xWbs: 'Ah',
    B62qqqUB9WmFCviaiPxnvT6a8PhtFyyfWtGUC5fLzrZh8MLuHteR23u: '2d',
    B62qn7Qv1Ur7eEd8MUvm8G2QX2xy5KZ2XGFpHSvXFapzpUPe3mkqscG: '3d',
    B62qpaK3GbVbpeoZyF95KmaDbTzM9YPpzeGNFVNfiuCAaS6iEAUqTVy: '4d',
    B62qj8HkeQ2fzttty6TdWuDawJzFB1YozQARYCAtU3w2SUhDBtkQk8V: '5d',
    B62qj7gbbFMhEPnsmVsouRyDuqzqY5GYYL9xYYxC9VVoREJcGEZAmRy: '6d',
    B62qrYfYzv33FQ7tkKSveW4Bv5TPWR8w8BHFRboCezML9uia1JvQqM4: '7d',
    B62qnT7U86RKp6wmCeDN9H8hLoQM63iwREcaYZ3QprmbHFp3B8pJ3Tg: '8d',
    B62qmTF5nNcEfTqmoEuTgjBFRYdZ2P4SBBNsyV4qgtFuqKvWKVZ6vxH: '9d',
    B62qk6tpoVSvS9N6tba72VAYij9kGkYfntz2HxuGXWbKTHnJcexYLBU: 'Td',
    B62qoXjH7mB9F1Lh7bqCJ2HK6ugV5aL4hsmJQKDhnNVPojqoUywk8tD: 'Jd',
    B62qpYXzESQUfvssCXHpMBBA68PDWyg5AbKqsS6uPh6edTeJRaeMCeX: 'Qd',
    B62qoNUbnMGz2wSP6fThYAzi9pgXjbXCsFLcN24feAGjfK9FEikyv44: 'Kd',
    B62qiuLMUJ9xPCYGqAzJY2C8JTwgAFhfgZFTnVRsq3EBksHKAE1G3mX: 'Ad',
    B62qobewhPUGcq3d51k7LpprwpdvZXHa3tt5cQqrHXFwGMYr1sfzytJ: '2c',
    B62qpzcCZwyVuc3jMMK6hSWML5XFBDHhjGzxmQxqbxsj7CUq69tz73u: '3c',
    B62qkJX7rwZhVvERKLTgdP1nR2uvp7r71gUMbg4r433hqGchqVUSAvH: '4c',
    B62qjzb33UZEW73Azm4UNLHt5h9j8QGN1VHthZ5qtLp4HW2RopPgqnq: '5c',
    B62qiyjjmivsXANPdai446hdVxbzp3XGvBeqrp2MwPagawWgGFscitu: '6c',
    B62qmm9QtXK2sgunTFQZHcZ4QLoWxcm2kqR8Funhhz1cCnoWDKrZCo7: '7c',
    B62qmCRjfwQf5TqVAthSsahapRo3TzAJLWV111Jvjysnd52T15Hhqv8: '8c',
    B62qndkT7z5GRdNdVzFVJS5n3VyY2F7Vz3EpGyPiCUpiHRUm6uLdb8Z: '9c',
    B62qkehCjfnN9sppd6XqsP8yBg5QcBgKpYbBqBz57ucmi5PLhwG2S9f: 'Tc',
    B62qnfRT4wwPbTqDA5RaLYpoQEnB1HoafQmpZDjyhqUGfy6JmcpW5cB: 'Jc',
    B62qpemVeQk9KtShw7i4LBkXHKncPLEmWvubA2Rm79adXDmNYP8DbuA: 'Qc',
    B62qiczv8AH2wHirAXEYWs3FofpqmwMAMqsH1turCF5pg4yDyTHo96o: 'Kc',
    B62qoxgp76z6NxCACZMhVFmtFivGBXySv6rt1K4njuQj5FDek14KqmZ: 'Ac',
    B62qrjCGUYUt7RkTaycWK9UxmK2UrL2PqzTnsfbZ2TqKJzoRRQ4AETX: '2s',
    B62qju23mB8xFV8LD6KuzjYP5TrQ5oC8m3nbq21kJCaQyJhwBrS1BYJ: '3s',
    B62qniYvDRvQeGenwoCSWbuHkRYVJP35a1KhrWVg8DEV22HMg9BbRby: '4s',
    B62qpt7XdABiHZtKWaf7wYmf4ZpeYJd2LfbT7w9dJAR9hhM4UC8MpsP: '5s',
    B62qn6aN7zUMDNDCq4s39nf32mks7YRRatUimtgmTyEH5ghPnbnCqER: '6s',
    B62qnwVexivudVh5CAj1yqGXFkrgjimR1F3WB4cq3VZ2KNn5WL8XNGX: '7s',
    B62qmTVrhEfXW1h5R9Ea8Lzgv8LapGZmmjBwzujsPoe58DtKA896QLb: '8s',
    B62qqPPARzHjNc222t1EHbaU2jAVNGxai1Pfv229xj2Qen6R3dHuw6V: '9s',
    B62qrdxHXHyuQjDSyYPsWYTEgtZBSEqF5bpTktk5RqSwbdojebLVZLH: 'Ts',
    B62qn9vSE3Jmep2pwx2XtfKV86omVpdcaYiY91mbcseKRRoPSEzx28Y: 'Js',
    B62qogwrj3eDhmoNETRUX3VToBYuXo8r7NM8w1onp6RWYat1c56zpyu: 'Qs',
    B62qnp98SGKe6dQ2cTMUKJeWGhECfj57vZGS5D5MA9hr5bXFYMo3wDM: 'Ks',
    B62qqA4jWdkLUE2ceoJPyqVYViFga2kJJ1UUMG2hS4pbD8zxEHhtfvW: 'As'
}
