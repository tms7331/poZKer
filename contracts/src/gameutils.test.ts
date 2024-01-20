import { cardMapping52 } from './PoZKer';
import { PrivateKey, PublicKey, UInt64, } from 'o1js';
import { getShowdownData, cardPrimeToPublicKey, buildCardMapping } from './gameutils.js';
import { Card, addPlayerToCardMask, mask, partialUnmask, EMPTYKEY } from './mentalpoker.js';


describe('PoZKer', () => {

    it('correctly evaluates hand', async () => {

        const card1prime52 = cardMapping52["Ah"];
        const card2prime52 = cardMapping52["Ad"];
        // we'll give p2 a flush
        const card3prime52 = cardMapping52["Ks"];
        const card4prime52 = cardMapping52["Ts"];

        const boardcard0 = cardMapping52["Kc"];
        const boardcard1 = cardMapping52["Ac"];
        const boardcard2 = cardMapping52["Qs"];
        const boardcard3 = cardMapping52["8s"];
        const boardcard4 = cardMapping52["6s"];

        const allCardsP1: [UInt64, UInt64, UInt64, UInt64, UInt64, UInt64, UInt64] = [UInt64.from(card1prime52), UInt64.from(card2prime52), UInt64.from(boardcard0), UInt64.from(boardcard1), UInt64.from(boardcard2), UInt64.from(boardcard3), UInt64.from(boardcard4)]
        const [useCardsP1, isFlushP1, merkleMapKeyP1, merkleMapValP1] = getShowdownData(allCardsP1);

        const allCardsP2: [UInt64, UInt64, UInt64, UInt64, UInt64, UInt64, UInt64] = [UInt64.from(card3prime52), UInt64.from(card4prime52), UInt64.from(boardcard0), UInt64.from(boardcard1), UInt64.from(boardcard2), UInt64.from(boardcard3), UInt64.from(boardcard4)]
        const [useCardsP2, isFlushP2, merkleMapKeyP2, merkleMapValP2] = getShowdownData(allCardsP2);

        const merkleMapKeyP1_: number = Number(merkleMapKeyP1) as number;
        const merkleMapValP1_: number = Number(merkleMapValP1) as number;
        const merkleMapKeyP2_: number = Number(merkleMapKeyP2) as number;
        const merkleMapValP2_: number = Number(merkleMapValP2) as number;
        const isFlushP1_ = isFlushP1.toBoolean();
        const isFlushP2_ = isFlushP2.toBoolean();

        expect(isFlushP1_).toEqual(false);
        expect(isFlushP2_).toEqual(true);

        // p1 - should use 2 hole cards and first 3 board cards
        expect(useCardsP1[0].toBoolean()).toEqual(true);
        expect(useCardsP1[1].toBoolean()).toEqual(true);
        expect(useCardsP1[2].toBoolean()).toEqual(true);
        expect(useCardsP1[3].toBoolean()).toEqual(true);
        expect(useCardsP1[4].toBoolean()).toEqual(true);
        expect(useCardsP1[5].toBoolean()).toEqual(false);
        expect(useCardsP1[6].toBoolean()).toEqual(false);

        // p2 - should use 2 hold cards and all the spades (final 3 board cards)
        expect(useCardsP2[0].toBoolean()).toEqual(true);
        expect(useCardsP2[1].toBoolean()).toEqual(true);
        expect(useCardsP2[2].toBoolean()).toEqual(false);
        expect(useCardsP2[3].toBoolean()).toEqual(false);
        expect(useCardsP2[4].toBoolean()).toEqual(true);
        expect(useCardsP2[5].toBoolean()).toEqual(true);
        expect(useCardsP2[6].toBoolean()).toEqual(true);

        // p1 lookup key is AAAKQ = 41*41*41*37*31 = 79052387
        expect(merkleMapKeyP1_).toEqual(79052387);
        // and lookup val from csv is 1609:
        // Q K A A A Three Aces THREE OF A KIN33D
        expect(merkleMapValP1_).toEqual(1609);
        // p2 lookup key is KTQ86 = 37*23*31*17*11 = 4933247
        expect(merkleMapKeyP2_).toEqual(4933247);
        // and lookup val from csv is 858
        // 6 8 T Q K
        expect(merkleMapValP2_).toEqual(858);
    })


    it.only('encodes and decodes a hand', async () => {

        const cardMapping: Record<string, string> = buildCardMapping(cardMapping52)

        const encodeCard = "Th";
        const thPrime = cardMapping52[encodeCard];
        const cardPoint = cardPrimeToPublicKey(thPrime);

        // const cardPoint = PrivateKey.fromBigInt(BigInt(41)).toPublicKey();

        let card: Card = new Card(EMPTYKEY, cardPoint, EMPTYKEY);

        // shuffleKey is a singular key for each player, unique key
        const shuffleKeyP1 = PrivateKey.fromBase58('EKEkAXjGJ6V3hYzKzAhMmL99457RH4NV8g9PuvkAYPZrySxxAjx3')
        const shuffleKeyP2 = PrivateKey.fromBase58('EKEjUYuVthQgmY5QZAqg68TCzi1rNLN1JPimnohGbLN1wTEXiMWs')

        // need a cardKey for each card
        const cardSecretP1 = PrivateKey.fromBase58('EKEK7kMjM6ETaffSUi16BxM8ifZi4yS75nUNdgXUqkZtZfBvBjue')
        const cardSecretP2 = PrivateKey.fromBase58('EKEcBmCtWv9FP8mqWLSFTqhHKchwn9e1h6niFZyYLvQK118DbNpY')

        // If dealing with full deck need to shuffle as part of this step

        // shuffleKey, so each player can shuffle at any point in this round
        card = addPlayerToCardMask(card, shuffleKeyP1);
        card = mask(card);

        card = addPlayerToCardMask(card, shuffleKeyP2);
        card = mask(card);

        // cards are shuffled at this point, should not shuffle again
        // so we're REMOVING our mask with the shuffle key
        // and then remasking with a different key (unique to each card)
        card = partialUnmask(card, shuffleKeyP1);
        card = addPlayerToCardMask(card, cardSecretP1);
        card = mask(card);

        card = partialUnmask(card, shuffleKeyP2);
        card = addPlayerToCardMask(card, cardSecretP2);
        card = mask(card);

        // Final round - both unmasks should result in original card
        // and we can decode in either order
        card = partialUnmask(card, cardSecretP2);
        card = partialUnmask(card, cardSecretP1);

        // Card should be decoded at this point
        expect(card.msg.toBase58()).toMatch(cardPoint.toBase58());
        // And - we should be able to map back to the card string
        const decodedCard = cardMapping[card.msg.toBase58()];
        expect(decodedCard).toMatch(encodeCard);
    })

});