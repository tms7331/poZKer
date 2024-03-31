import { Mina, fetchAccount, Field, PublicKey, PrivateKey, Bool, UInt64, UInt32, MerkleMapWitness } from 'o1js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

//import type { PoZKerApp } from '../../../contracts/src/PoZKer';
import type { PoZKerApp } from './contracts_copy/PoZKer';
// import { Gamestate } from '../../../contracts/src/PoZKer';

const state = {
  PoZKerApp: null as null | typeof PoZKerApp,
  zkapp: null as null | PoZKerApp,
  transaction: null as null | Transaction
};

// ---------------------------------------------------------------------------------------

const functions = {
  setActiveInstanceToBerkeley: async (args: {}) => {
    const Berkeley = Mina.Network({
      mina: [
        // 'https://proxy.berkeley.minaexplorer.com/graphql',
        'https://berkeley.minascan.io/graphql',
        // 'https://api.minascan.io/node/berkeley/v1/graphql'
      ],
    });
    console.log('Berkeley Instance Created');
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async (args: {}) => {
    //const { PoZKerApp } = await import('../../../contracts/build/src/PoZKer.js');
    const { PoZKerApp } = await import('./contracts_copy/PoZKer.js');
    state.PoZKerApp = PoZKerApp;
  },
  compileContract: async (args: {}) => {
    await state.PoZKerApp!.compile();
  },

  fetchAccount: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    return await fetchAccount({ publicKey });
  },
  initZkappInstance: async (args: { publicKey58: string }) => {
    const publicKey = PublicKey.fromBase58(args.publicKey58);
    //state.zkapp = new state.Add!(publicKey);
    state.zkapp = new state.PoZKerApp!(publicKey);
    console.log("COMPLETED initZkappInstance")
  },
  getNum: async (args: {}) => {
    const currentNum = await state.zkapp!.slot4.get();
    return JSON.stringify(currentNum.toJSON());
  },
  getPlayer1Hash: async (args: {}) => {
    const player1Hash = await state.zkapp!.player1Hash.get();
    return JSON.stringify(player1Hash.toJSON());
  },
  getPlayer2Hash: async (args: {}) => {
    const player2Hash = await state.zkapp!.player2Hash.get();
    return JSON.stringify(player2Hash.toJSON());
  },

  getGamestate: async (args: {}) => {
    const gamestate = await state.zkapp!.gamestate.get();
    return JSON.stringify(gamestate.toJSON());
  },

  createSetTempvarTx: async (args: { num: number }) => {
    // setTempvarValue(val: Field)
    const value: Field = Field(args.num);
    const transaction = await Mina.transaction(() => {
      state.zkapp!.setTempvarValue(value);
    })
    state.transaction = transaction;
  },

  // Real app functions
  //createJoinGameTx: async (args: { player: PublicKey }) => {
  createJoinGameTx: async (args: { publicKey58: string }) => {
    const player = PublicKey.fromBase58(args.publicKey58);
    const transaction = await Mina.transaction(() => {
      state.zkapp!.joinGame(player);
    });
    state.transaction = transaction;
  },

  createWithdrawTx: async (args: {}) => {
    const transaction = await Mina.transaction(() => {
      state.zkapp!.withdraw();
    });
    state.transaction = transaction;
  },

  createDepositTx: async (args: {}) => {
    const transaction = await Mina.transaction(() => {
      const depositAmount: UInt32 = UInt32.from(100);
      state.zkapp!.deposit(depositAmount);
    });
    state.transaction = transaction;
  },

  createTakeActionTx: async (args: { action: number, betSize: number }) => {
    // takeAction(action: UInt32, betSize: UInt32)
    const actionU: UInt32 = UInt32.from(args.action);
    const betSizeU: UInt32 = UInt32.from(args.betSize);
    const transaction = await Mina.transaction(() => {
      state.zkapp!.takeAction(actionU, betSizeU);
    });
    state.transaction = transaction;
  },

  createShowdownTx: async (args: {}) => {
    // showdown()
    const transaction = await Mina.transaction(() => {
      state.zkapp!.showdown();
    });
    state.transaction = transaction;
  },

  createPlayerTimeoutTx: async (args: {}) => {
    const transaction = await Mina.transaction(() => {
      state.zkapp!.playerTimeout();
    });
    state.transaction = transaction;
  },

  createTallyBoardCardsTx: async (args: { cardPrime52: number }) => {
    // tallyBoardCards(cardPrime52: Field)
    const cardPrime52F: Field = Field(args.cardPrime52);
    const transaction = await Mina.transaction(() => {
      state.zkapp!.tallyBoardCards(cardPrime52F);
    });
    state.transaction = transaction;
  },

  createStoreCardHashTx: async (args: { slotI: number, shuffleSecretB58: string, epk1B58: string, epk2B58: string }) => {
    // storeCardHash(slotI: Field, shuffleSecret: PrivateKey, epk1: PublicKey, epk2: PublicKey, msg1: PublicKey, msg2: PublicKey)
    const slotIF: Field = Field(args.slotI)
    const shuffleSecret: PrivateKey = PrivateKey.fromBase58(args.shuffleSecretB58);
    const epk1: PublicKey = PublicKey.fromBase58(args.epk1B58)
    const epk2: PublicKey = PublicKey.fromBase58(args.epk2B58)
    const transaction = await Mina.transaction(() => {
      state.zkapp!.storeCardHash(slotIF, shuffleSecret, epk1, epk2);
    });
    state.transaction = transaction;
  },

  createCommitCardTx: async (args: { slotI: number, msg: string }) => {
    // commitCard(slotI: Field, msg: PublicKey)
    const slotIF: Field = Field(args.slotI);
    const msgPK = PublicKey.fromBase58(args.msg);
    const transaction = await Mina.transaction(() => {
      state.zkapp!.commitCard(slotIF, msgPK);
    });
    state.transaction = transaction;
  },

  createShowCardsTx: async (args: { holecard0n: number, holecard1n: number, boardcard0n: number, boardcard1n: number, boardcard2n: number, boardcard3n: number, boardcard4n: number, useHolecard0b: boolean, useHolecard1b: boolean, useBoardcards0b: boolean, useBoardcards1b: boolean, useBoardcards2b: boolean, useBoardcards3b: boolean, useBoardcards4b: boolean, isFlushb: boolean, shuffleKeyB58: string, merkleMapKey: number, merkleMapVal: number }) => {
    // showCards(holecard0: UInt64, holecard1: UInt64, boardcard0: UInt64, boardcard1: UInt64, boardcard2: UInt64, boardcard3: UInt64, boardcard4: UInt64, useHolecard0: Bool, useHolecard1: Bool, useBoardcards0: Bool, useBoardcards1: Bool, useBoardcards2: Bool, useBoardcards3: Bool, useBoardcards4: Bool, isFlush: Bool, shuffleKey: PrivateKey, merkleMapKey: Field, merkleMapVal: Field, path: MerkleMapWitness)

    const holecard0: UInt64 = UInt64.from(args.holecard0n);
    const holecard1: UInt64 = UInt64.from(args.holecard1n);
    const boardcard0: UInt64 = UInt64.from(args.boardcard0n);
    const boardcard1: UInt64 = UInt64.from(args.boardcard1n);
    const boardcard2: UInt64 = UInt64.from(args.boardcard2n);
    const boardcard3: UInt64 = UInt64.from(args.boardcard3n);
    const boardcard4: UInt64 = UInt64.from(args.boardcard4n);
    const useHolecard0: Bool = Bool(args.useHolecard0b);
    const useHolecard1: Bool = Bool(args.useHolecard1b);
    const useBoardcards0: Bool = Bool(args.useBoardcards0b);
    const useBoardcards1: Bool = Bool(args.useBoardcards1b);
    const useBoardcards2: Bool = Bool(args.useBoardcards2b);
    const useBoardcards3: Bool = Bool(args.useBoardcards3b);
    const useBoardcards4: Bool = Bool(args.useBoardcards4b);
    const isFlush: Bool = Bool(args.isFlushb);
    const shuffleKey: PrivateKey = PrivateKey.fromBase58(args.shuffleKeyB58);
    const merkleMapKeyF: Field = Field(args.merkleMapKey);
    const merkleMapValF: Field = Field(args.merkleMapVal);

    // Hardcoding empty lookup value here - tricky to pass in 
    const isLefts: Bool[] = [];
    const siblings: Field[] = [];
    const path: MerkleMapWitness = new MerkleMapWitness(isLefts, siblings);

    const transaction = await Mina.transaction(() => {
      // const test: UInt64 = UInt64.from(33);
      state.zkapp!.showCards(holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4, useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4, isFlush, shuffleKey, merkleMapKeyF, merkleMapValF, path);
    });
    state.transaction = transaction;
  },

  createUpdateTransaction: async (args: {}) => {
    const transaction = await Mina.transaction(() => {
      state.zkapp!.setTempvar();
    });
    state.transaction = transaction;
  },

  proveUpdateTransaction: async (args: {}) => {
    await state.transaction!.prove();
  },
  getTransactionJSON: async (args: {}) => {
    return state.transaction!.toJSON();
  }
};

// ---------------------------------------------------------------------------------------

export type WorkerFunctions = keyof typeof functions;

export type ZkappWorkerRequest = {
  id: number;
  fn: WorkerFunctions;
  args: any;
};

export type ZkappWorkerReponse = {
  id: number;
  data: any;
};

if (typeof window !== 'undefined') {
  addEventListener(
    'message',
    async (event: MessageEvent<ZkappWorkerRequest>) => {
      const returnData = await functions[event.data.fn](event.data.args);

      const message: ZkappWorkerReponse = {
        id: event.data.id,
        data: returnData
      };
      postMessage(message);
    }
  );
}

console.log('Web Worker Successfully Initialized.');