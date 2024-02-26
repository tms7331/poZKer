import { fetchAccount, PublicKey, PrivateKey, UInt32, UInt64, Field, Bool, MerkleMapWitness } from 'o1js';

import type {
  ZkappWorkerRequest,
  ZkappWorkerReponse,
  WorkerFunctions,
} from './zkappWorker';

export default class ZkappWorkerClient {
  // ---------------------------------------------------------------------------------------

  setActiveInstanceToBerkeley() {
    return this._call('setActiveInstanceToBerkeley', {});
  }

  loadContract() {
    return this._call('loadContract', {});
  }

  compileContract() {
    return this._call('compileContract', {});
  }

  fetchAccount({
    publicKey,
  }: {
    publicKey: PublicKey;
  }): ReturnType<typeof fetchAccount> {
    const result = this._call('fetchAccount', {
      publicKey58: publicKey.toBase58(),
    });
    return result as ReturnType<typeof fetchAccount>;
  }

  initZkappInstance(publicKey: PublicKey) {
    return this._call('initZkappInstance', {
      publicKey58: publicKey.toBase58(),
    });
  }

  async getNum(): Promise<Field> {
    const result = await this._call('getNum', {});
    return Field.fromJSON(JSON.parse(result as string));
  }

  createUpdateTransaction() {
    return this._call('createUpdateTransaction', {});
  }


  createJoinGameTx(player: PublicKey) {
    return this._call('createJoinGameTx', { player: PublicKey });
  }

  createWithdrawTx() {
    return this._call('createWithdrawTx', {});
  }

  createDepositTx() {
    return this._call('createDepositTx', {});
  }

  createTakeActionTx(action: UInt32, betSize: UInt32) {
    return this._call('createTakeActionTx', { action: action, betSize: betSize });
  }

  createShowdownTx() {
    return this._call('createShowdownTx', {});
  }

  createPlayerTimeoutTx() {
    return this._call('createPlayerTimeoutTx', {});
  }

  createTallyBoardCardsTx(cardPrime52: Field) {
    return this._call('createTallyBoardCardsTx', { cardPrime52: cardPrime52 });
  }

  createStoreCardHashTx(slotI: Field, shuffleSecret: PrivateKey, epk1: PublicKey, epk2: PublicKey) {
    return this._call('createStoreCardHashTx', { slotI: slotI, shuffleSecret: shuffleSecret, epk1: epk1, epk2: epk2 });
  }

  createCommitCardTx(slotI: Field, msg: PublicKey) {
    return this._call('createCommitCardTx', { slotI: slotI, msg: msg });
  }

  createShowCardsTx(holecard0: UInt64, holecard1: UInt64, boardcard0: UInt64, boardcard1: UInt64, boardcard2: UInt64, boardcard3: UInt64, boardcard4: UInt64, useHolecard0: Bool, useHolecard1: Bool, useBoardcards0: Bool, useBoardcards1: Bool, useBoardcards2: Bool, useBoardcards3: Bool, useBoardcards4: Bool, isFlush: Bool, shuffleKey: PrivateKey, merkleMapKey: Field, merkleMapVal: Field, path: MerkleMapWitness) {
    return this._call('createShowCardsTx', { holecard0: holecard0, holecard1: holecard1, boardcard0: boardcard0, boardcard1: boardcard1, boardcard2: boardcard2, boardcard3: boardcard3, boardcard4: boardcard4, useHolecard0: useHolecard0, useHolecard1: useHolecard1, useBoardcards0: useBoardcards0, useBoardcards1: useBoardcards1, useBoardcards2: useBoardcards2, useBoardcards3: useBoardcards3, useBoardcards4: useBoardcards4, isFlush: isFlush, shuffleKey: shuffleKey, merkleMapKey: merkleMapKey, merkleMapVal: merkleMapVal, path: path });
  }


  proveUpdateTransaction() {
    return this._call('proveUpdateTransaction', {});
  }

  async getTransactionJSON() {
    const result = await this._call('getTransactionJSON', {});
    return result;
  }

  // ---------------------------------------------------------------------------------------

  worker: Worker;

  promises: {
    [id: number]: { resolve: (res: any) => void; reject: (err: any) => void };
  };

  nextId: number;

  constructor() {
    this.worker = new Worker(new URL('./zkappWorker.ts', import.meta.url));
    this.promises = {};
    this.nextId = 0;

    this.worker.onmessage = (event: MessageEvent<ZkappWorkerReponse>) => {
      this.promises[event.data.id].resolve(event.data.data);
      delete this.promises[event.data.id];
    };
  }

  _call(fn: WorkerFunctions, args: any) {
    return new Promise((resolve, reject) => {
      this.promises[this.nextId] = { resolve, reject };

      const message: ZkappWorkerRequest = {
        id: this.nextId,
        fn,
        args,
      };

      this.worker.postMessage(message);

      this.nextId++;
    });
  }
}

