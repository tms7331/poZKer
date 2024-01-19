// NOTE - Code ported from snarkyjs implementation
// Available under Apache License 2.0 at: 
// https://github.com/mirceanis/prove-my-turn/blob/main/src/utils.ts
import { Struct, Group, Scalar, PublicKey, PrivateKey, Bool, Provable, } from 'o1js';

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
    const isUnmasked: Bool = card.pk.equals(EMPTYKEY);
    if (isUnmasked.toBoolean()) {
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
    const isUnmasked: Bool = card.pk.equals(EMPTYKEY);
    const pk = PublicKey.fromGroup(card.pk.toGroup().sub(playerSecret.toPublicKey().toGroup()));
    const epk = Provable.if(isUnmasked, PublicKey.empty(), card.epk);
    const safeEpk = Provable.if(epk.isEmpty(), EMPTYKEY, card.epk);
    const d1 = computeSharedSecret(playerSecret, safeEpk);
    const msg = PublicKey.fromGroup(card.msg.toGroup().sub(d1.toGroup()));
    const pubKey = Provable.if(isUnmasked, card.msg, msg);
    const privKey = Provable.if(isUnmasked, card.pk, pk);
    const retCard = new Card(epk, pubKey, privKey);
    return retCard;
}