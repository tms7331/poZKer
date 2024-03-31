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

  async getPlayer1Hash(): Promise<Field> {
    const result = await this._call('getPlayer1Hash', {});
    return Field.fromJSON(JSON.parse(result as string));
  }

  async getPlayer2Hash(): Promise<Field> {
    const result = await this._call('getPlayer2Hash', {});
    return Field.fromJSON(JSON.parse(result as string));
  }

  async getGamestate(): Promise<Field> {
    const result = await this._call('getGamestate', {});
    return Field.fromJSON(JSON.parse(result as string));
  }

  createUpdateTransaction() {
    return this._call('createUpdateTransaction', {});
  }

  createSetTempvarTx(num: number) {
    return this._call('createSetTempvarTx', { num: num });
  }

  createJoinGameTx(player: PublicKey) {
    const playerStr = player.toBase58();
    return this._call('createJoinGameTx', { publicKey58: playerStr });
  }

  createWithdrawTx(senderB58: string) {
    return this._call('createWithdrawTx', { senderB58 });
  }

  createDepositTx(senderB58: string) {
    return this._call('createDepositTx', { senderB58 });
  }

  createTakeActionTx(senderB58: string, action: number, betSize: number) {
    return this._call('createTakeActionTx', { senderB58: senderB58, action: action, betSize: betSize });
  }

  createShowdownTx() {
    return this._call('createShowdownTx', {});
  }

  createPlayerTimeoutTx() {
    return this._call('createPlayerTimeoutTx', {});
  }

  createTallyBoardCardsTx(cardPrime52: number) {
    return this._call('createTallyBoardCardsTx', { cardPrime52: cardPrime52 });
  }

  createStoreCardHashTx(slotI: number, shuffleSecretB58: string, epk1B58: string, epk2B58: string) {
    return this._call('createStoreCardHashTx', { slotI: slotI, shuffleSecretB58: shuffleSecretB58, epk1B58: epk1B58, epk2B58: epk2B58 });
  }

  createCommitCardTx(slotI: number, msg: string) {
    return this._call('createCommitCardTx', { slotI: slotI, msg: msg });
  }

  createShowCardsTx(senderB58: string, holecard0n: number, holecard1n: number, boardcard0n: number, boardcard1n: number, boardcard2n: number, boardcard3n: number, boardcard4n: number, useHolecard0b: boolean, useHolecard1b: boolean, useBoardcards0b: boolean, useBoardcards1b: boolean, useBoardcards2b: boolean, useBoardcards3b: boolean, useBoardcards4b: boolean, isFlushb: boolean, shuffleKeyB58: string, merkleMapKey: number, merkleMapVal: number) {
    return this._call('createShowCardsTx', { senderB58: senderB58, holecard0n: holecard0n, holecard1n: holecard1n, boardcard0n: boardcard0n, boardcard1n: boardcard1n, boardcard2n: boardcard2n, boardcard3n: boardcard3n, boardcard4n: boardcard4n, useHolecard0b: useHolecard0b, useHolecard1b: useHolecard1b, useBoardcards0b: useBoardcards0b, useBoardcards1b: useBoardcards1b, useBoardcards2b: useBoardcards2b, useBoardcards3b: useBoardcards3b, useBoardcards4b: useBoardcards4b, isFlushb: isFlushb, shuffleKeyB58: shuffleKeyB58, merkleMapKey: merkleMapKey, merkleMapVal: merkleMapVal });
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

