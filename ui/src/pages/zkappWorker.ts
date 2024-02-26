import { Mina, fetchAccount, Field, PublicKey, PrivateKey, Bool, UInt64, UInt32, MerkleMapWitness } from 'o1js';

type Transaction = Awaited<ReturnType<typeof Mina.transaction>>;

// ---------------------------------------------------------------------------------------

import type { PoZKerApp } from '../../../contracts/src/PoZKer';
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
        'https://proxy.berkeley.minaexplorer.com/graphql',
        'https://berkeley.minascan.io/graphql',
        'https://api.minascan.io/node/berkeley/v1/graphql'
      ],
    });
    console.log('Berkeley Instance Created');
    Mina.setActiveInstance(Berkeley);
  },
  loadContract: async (args: {}) => {
    const { PoZKerApp } = await import('../../../contracts/build/src/PoZKer.js');
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
  getGamestate: async (args: {}) => {
    // const gamestate = await state.zkapp!.gamestate.get();
    // const unpacked = Gamestate.unpack(gamestate.packed);
    // // All UInt32s, representing:
    // // stack1, stack2, turn, street, lastAction, gameOver
    // return JSON.stringify([unpacked[0].toJSON(), unpacked[1].toJSON(), unpacked[2].toJSON(), unpacked[3].toJSON(), unpacked[4].toJSON(), unpacked[5].toJSON()])
  },
  createSetTempvarTx: async (args: { val: Field }) => {
    // setTempvarValue(val: Field)
    const transaction = await Mina.transaction(() => {
      state.zkapp!.setTempvarValue(args.val);
    })
    state.transaction = transaction;
  },

  // Real app functions
  createJoinGameTx: async (args: { player: PublicKey }) => {
    // joinGame(player: PublicKey)
    const transaction = await Mina.transaction(() => {
      state.zkapp!.joinGame(args.player);
    });
    state.transaction = transaction;
  },

  createWithdrawTx: async (args: {}) => {
    //withdraw()
    const transaction = await Mina.transaction(() => {
      state.zkapp!.withdraw();
    });
    state.transaction = transaction;
  },

  createDepositTx: async (args: {}) => {
    // deposit()
    const transaction = await Mina.transaction(() => {
      state.zkapp!.deposit();
    });
    state.transaction = transaction;
  },

  createTakeActionTx: async (args: { action: UInt32, betSize: UInt32 }) => {
    // takeAction(action: UInt32, betSize: UInt32)
    const transaction = await Mina.transaction(() => {
      state.zkapp!.takeAction(args.action, args.betSize);
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

  createTallyBoardCardsTx: async (args: { cardPrime52: Field }) => {
    // tallyBoardCards(cardPrime52: Field)
    const transaction = await Mina.transaction(() => {
      state.zkapp!.tallyBoardCards(args.cardPrime52);
    });
    state.transaction = transaction;
  },

  createStoreCardHashTx: async (args: { slotI: Field, shuffleSecret: PrivateKey, epk1: PublicKey, epk2: PublicKey }) => {
    // storeCardHash(slotI: Field, shuffleSecret: PrivateKey, epk1: PublicKey, epk2: PublicKey, msg1: PublicKey, msg2: PublicKey)
    const transaction = await Mina.transaction(() => {
      state.zkapp!.storeCardHash(args.slotI, args.shuffleSecret, args.epk1, args.epk2);
    });
    state.transaction = transaction;
  },

  createCommitCardTx: async (args: { slotI: Field, msg: PublicKey }) => {
    // commitCard(slotI: Field, msg: PublicKey)
    const transaction = await Mina.transaction(() => {
      state.zkapp!.commitCard(args.slotI, args.msg);
    });
    state.transaction = transaction;
  },

  createShowCardsTx: async (args: { holecard0: UInt64, holecard1: UInt64, boardcard0: UInt64, boardcard1: UInt64, boardcard2: UInt64, boardcard3: UInt64, boardcard4: UInt64, useHolecard0: Bool, useHolecard1: Bool, useBoardcards0: Bool, useBoardcards1: Bool, useBoardcards2: Bool, useBoardcards3: Bool, useBoardcards4: Bool, isFlush: Bool, shuffleKey: PrivateKey, merkleMapKey: Field, merkleMapVal: Field, path: MerkleMapWitness }) => {
    // showCards(holecard0: UInt64, holecard1: UInt64, boardcard0: UInt64, boardcard1: UInt64, boardcard2: UInt64, boardcard3: UInt64, boardcard4: UInt64, useHolecard0: Bool, useHolecard1: Bool, useBoardcards0: Bool, useBoardcards1: Bool, useBoardcards2: Bool, useBoardcards3: Bool, useBoardcards4: Bool, isFlush: Bool, shuffleKey: PrivateKey, merkleMapKey: Field, merkleMapVal: Field, path: MerkleMapWitness)
    const transaction = await Mina.transaction(() => {
      // const test: UInt64 = UInt64.from(33);
      state.zkapp!.showCards(args.holecard0, args.holecard1, args.boardcard0, args.boardcard1, args.boardcard2, args.boardcard3, args.boardcard4, args.useHolecard0, args.useHolecard1, args.useBoardcards0, args.useBoardcards1, args.useBoardcards2, args.useBoardcards3, args.useBoardcards4, args.isFlush, args.shuffleKey, args.merkleMapKey, args.merkleMapVal, args.path);
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