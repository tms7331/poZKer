/*
NOTE - MerkleTree and MerkleMapSerializable were taken nearly unchanged from o1js libraries:
https://github.com/o1-labs/o1js/blob/5ca4368/src/lib/merkle_map.ts#L19
https://github.com/o1-labs/o1js/blob/5ca43684e98af3e4f348f7b035a0ad7320d88f3d/src/lib/merkle_tree.ts

Couldn't figure out any other reasonable way to serialize besides manually overwriting
the 'nodes' and 'zeroes' elements after casting the serialized data to the proper
types, and was unable to do this without extra methods to access those (private) 
variables.
*/
import { Field, Poseidon, MerkleWitness, MerkleMapWitness } from 'o1js';

const bits = 255;
const printDebugs = false;


type Witness = { isLeft: boolean; sibling: Field }[];

/**
 * A [Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree) is a binary tree in which every leaf is the cryptography hash of a piece of data,
 * and every node is the hash of the concatenation of its two child nodes.
 *
 * A Merkle Tree allows developers to easily and securely verify the integrity of large amounts of data.
 *
 * Take a look at our [documentation](https://docs.minaprotocol.com/en/zkapps) on how to use Merkle Trees in combination with zkApps and zero knowledge programming!
 *
 * Levels are indexed from leaves (level 0) to root (level N - 1).
 */
class MerkleTree {
    private nodes: Record<number, Record<string, Field>> = {};
    private zeroes: Field[];

    /**
     * Creates a new, empty [Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree).
     * @param height The height of Merkle Tree.
     * @returns A new MerkleTree
     */
    constructor(public readonly height: number) {
        this.zeroes = new Array(height);
        this.zeroes[0] = Field(0);
        for (let i = 1; i < height; i += 1) {
            this.zeroes[i] = Poseidon.hash([this.zeroes[i - 1], this.zeroes[i - 1]]);
        }
    }

    setNodes(nodes: Record<number, Record<string, Field>>) {
        this.nodes = nodes;
    }

    setZeroes(zeroes: Field[]) {
        this.zeroes = zeroes;
    }

    getNodes(): Record<number, Record<string, Field>> {
        return this.nodes;
    }

    getZeroes(): Field[] {
        return this.zeroes;
    }

    /**
     * Returns a node which lives at a given index and level.
     * @param level Level of the node.
     * @param index Index of the node.
     * @returns The data of the node.
     */
    getNode(level: number, index: bigint): Field {
        return this.nodes[level]?.[index.toString()] ?? this.zeroes[level];
    }

    /**
     * Returns the root of the [Merkle Tree](https://en.wikipedia.org/wiki/Merkle_tree).
     * @returns The root of the Merkle Tree.
     */
    getRoot(): Field {
        return this.getNode(this.height - 1, 0n);
    }

    // TODO: this allows to set a node at an index larger than the size. OK?
    private setNode(level: number, index: bigint, value: Field) {
        (this.nodes[level] ??= {})[index.toString()] = value;
    }

    // TODO: if this is passed an index bigger than the max, it will set a couple of out-of-bounds nodes but not affect the real Merkle root. OK?
    /**
     * Sets the value of a leaf node at a given index to a given value.
     * @param index Position of the leaf node.
     * @param leaf New value.
     */
    setLeaf(index: bigint, leaf: Field) {
        if (index >= this.leafCount) {
            throw new Error(
                `index ${index} is out of range for ${this.leafCount} leaves.`
            );
        }
        this.setNode(0, index, leaf);
        let currIndex = index;
        for (let level = 1; level < this.height; level++) {
            currIndex /= 2n;

            const left = this.getNode(level - 1, currIndex * 2n);
            const right = this.getNode(level - 1, currIndex * 2n + 1n);

            this.setNode(level, currIndex, Poseidon.hash([left, right]));
        }
    }

    /**
     * Returns the witness (also known as [Merkle Proof or Merkle Witness](https://computersciencewiki.org/index.php/Merkle_proof)) for the leaf at the given index.
     * @param index Position of the leaf node.
     * @returns The witness that belongs to the leaf.
     */
    getWitness(index: bigint): Witness {
        if (index >= this.leafCount) {
            throw new Error(
                `index ${index} is out of range for ${this.leafCount} leaves.`
            );
        }
        const witness = [];
        for (let level = 0; level < this.height - 1; level++) {
            const isLeft = index % 2n === 0n;
            const sibling = this.getNode(level, isLeft ? index + 1n : index - 1n);
            witness.push({ isLeft, sibling });
            index /= 2n;
        }
        return witness;
    }

    // TODO: this will always return true if the merkle tree was constructed normally; seems to be only useful for testing. remove?
    /**
     * Checks if the witness that belongs to the leaf at the given index is a valid witness.
     * @param index Position of the leaf node.
     * @returns True if the witness for the leaf node is valid.
     */
    validate(index: bigint): boolean {
        const path = this.getWitness(index);
        let hash = this.getNode(0, index);
        for (const node of path) {
            hash = Poseidon.hash(
                node.isLeft ? [hash, node.sibling] : [node.sibling, hash]
            );
        }

        return hash.toString() === this.getRoot().toString();
    }

    // TODO: should this take an optional offset? should it fail if the array is too long?
    /**
     * Fills all leaves of the tree.
     * @param leaves Values to fill the leaves with.
     */
    fill(leaves: Field[]) {
        leaves.forEach((value, index) => {
            this.setLeaf(BigInt(index), value);
        });
    }

    /**
     * Returns the amount of leaf nodes.
     * @returns Amount of leaf nodes.
     */
    get leafCount(): bigint {
        return 2n ** BigInt(this.height - 1);
    }
}


export class MerkleMapSerializable {
    // Must refer to modified MerkleTree with the read and write methods
    tree: InstanceType<typeof MerkleTree>;

    // ------------------------------------------------

    /**
     * Creates a new, empty Merkle Map.
     * @returns A new MerkleMap
     */
    constructor() {
        if (bits > 255) {
            throw Error('bits must be <= 255');
        }
        if (bits !== 255) {
            console.warn(
                'bits set to',
                bits + '. Should be set to 255 in production to avoid collisions'
            );
        }
        this.tree = new MerkleTree(bits + 1);
    }

    // ------------------------------------------------

    _keyToIndex(key: Field) {
        // the bit map is reversed to make reconstructing the key during proving more convenient
        let keyBits = key
            .toBits()
            .slice(0, bits)
            .reverse()
            .map((b) => b.toBoolean());

        let n = 0n;
        for (let i = 0; i < keyBits.length; i++) {
            const b = keyBits[i] ? 1 : 0;
            n += 2n ** BigInt(i) * BigInt(b);
        }

        return n;
    }

    // ------------------------------------------------

    /**
     * Sets a key of the merkle map to a given value.
     * @param key The key to set in the map.
     * @param key The value to set.
     */
    set(key: Field, value: Field) {
        const index = this._keyToIndex(key);
        this.tree.setLeaf(index, value);
    }

    // ------------------------------------------------

    /**
     * Returns a value given a key. Values are by default Field(0).
     * @param key The key to get the value from.
     * @returns The value stored at the key.
     */
    get(key: Field) {
        const index = this._keyToIndex(key);
        return this.tree.getNode(0, index);
    }

    // ------------------------------------------------

    /**
     * Returns the root of the Merkle Map.
     * @returns The root of the Merkle Map.
     */
    getRoot() {
        return this.tree.getRoot();
    }

    /**
     * Returns a circuit-compatible witness (also known as [Merkle Proof or Merkle Witness](https://computersciencewiki.org/index.php/Merkle_proof)) for the given key.
     * @param key The key to make a witness for.
     * @returns A MerkleMapWitness, which can be used to assert changes to the MerkleMap, and the witness's key.
     */
    getWitness(key: Field) {
        const index = this._keyToIndex(key);
        class MyMerkleWitness extends MerkleWitness(bits + 1) { }
        const witness = new MyMerkleWitness(this.tree.getWitness(index));

        if (printDebugs) {
            // witness bits and key bits should be the reverse of each other, so
            // we can calculate the key during recursively traversing the path
            console.log(
                'witness bits',
                witness.isLeft.map((l) => (l.toBoolean() ? '0' : '1')).join(', ')
            );
            console.log(
                'key bits',
                key
                    .toBits()
                    .slice(0, bits)
                    .map((l) => (l.toBoolean() ? '1' : '0'))
                    .join(', ')
            );
        }
        return new MerkleMapWitness(witness.isLeft, witness.path);
    }
}

export function serialize(merkleMapSerializable: MerkleMapSerializable): string {
    const obj = {
        "nodes": merkleMapSerializable.tree.getNodes(),
        "zeroes": merkleMapSerializable.tree.getZeroes()
    };
    return JSON.stringify(obj);
}

export function deserialize(jsonData: string): MerkleMapSerializable {

    // We need to cast the data in the json object back into the proper field types
    const obj = JSON.parse(jsonData)

    const nodes: Record<number, Record<string, Field>> = {};
    const zeroes: Field[] = [];

    for (const [level, record] of Object.entries(obj.nodes)) {
        // This is what the regular insert looks like
        // nodes[level] ??= {})[index.toString()] = value;
        const levelInt = parseInt(level);
        nodes[levelInt] = {};

        const rec = record as Record<string, string>
        for (const [index, value] of Object.entries(rec)) {
            nodes[levelInt][index] = Field(value);
        }
    }

    for (let i = 0; i < obj.zeroes.length; i++) {
        zeroes.push(Field(obj.zeroes[i]));
    }

    const merkleMapSerializable = new MerkleMapSerializable();
    merkleMapSerializable.tree.setZeroes(zeroes);
    merkleMapSerializable.tree.setNodes(nodes);

    return merkleMapSerializable;
}
