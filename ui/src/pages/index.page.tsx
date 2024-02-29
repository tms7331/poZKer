import { useEffect, useState } from 'react';
import './reactCOIServiceWorker';
import ZkappWorkerClient from './zkappWorkerClient';
import { Field, PublicKey, PrivateKey, Bool, UInt64, UInt32, MerkleMapWitness } from 'o1js';
import GradientBG from '../components/GradientBG.js';
import styles from '../styles/Home.module.css';

let transactionFee = 0.1;
// Address we deployed to on berkeley
const ZKAPP_ADDRESS = 'B62qpGqTpNvxMNjh1msVt1Dy6KTSZo2Q9XYR3dcc8Ld1LpcuDm4VUhW';


export default function Home() {
  const [state, setState] = useState({
    zkappWorkerClient: null as null | ZkappWorkerClient,
    hasWallet: null as null | boolean,
    hasBeenSetup: false,
    accountExists: false,
    currentNum: null as null | Field,
    player1Hash: null as null | Field,
    player2Hash: null as null | Field,
    publicKey: null as null | PublicKey,
    zkappPublicKey: null as null | PublicKey,
    creatingTransaction: false
  });

  // For setting a specific value
  const [inputValue, setInputValue] = useState('');

  const [displayText, setDisplayText] = useState('');
  const [transactionlink, setTransactionLink] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  // -------------------------------------------------------
  // Do Setup

  useEffect(() => {
    async function timeout(seconds: number): Promise<void> {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, seconds * 1000);
      });
    }

    (async () => {
      if (!state.hasBeenSetup) {
        setDisplayText('Loading web worker...');
        console.log('Loading web worker...');
        const zkappWorkerClient = new ZkappWorkerClient();
        await timeout(5);

        setDisplayText('Done loading web worker');
        console.log('Done loading web worker');

        await zkappWorkerClient.setActiveInstanceToBerkeley();

        const mina = (window as any).mina;

        if (mina == null) {
          setState({ ...state, hasWallet: false });
          return;
        }

        const publicKeyBase58: string = (await mina.requestAccounts())[0];
        console.log("index: publicKeyBase58", publicKeyBase58)
        const publicKey = PublicKey.fromBase58(publicKeyBase58);

        console.log(`Using key:${publicKey.toBase58()}`);
        setDisplayText(`Using key:${publicKey.toBase58()}`);

        setDisplayText('Checking if fee payer account exists...');
        console.log('Checking if fee payer account exists...');

        const res = await zkappWorkerClient.fetchAccount({
          publicKey: publicKey!
        });
        console.log("Res was...", res)
        const accountExists = res.error == null;

        await zkappWorkerClient.loadContract();

        // Already deployed contract address, use that instead
        console.log('Compiling zkApp...');
        setDisplayText('Compiling zkApp...');
        await zkappWorkerClient.compileContract();
        console.log('zkApp compiled');
        setDisplayText('zkApp compiled...');

        const zkappPublicKey = PublicKey.fromBase58(ZKAPP_ADDRESS);

        await zkappWorkerClient.initZkappInstance(zkappPublicKey);

        console.log('Getting zkApp state...');
        setDisplayText('Getting zkApp state...');
        await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        const currentNum = await zkappWorkerClient.getNum();
        const player1Hash = await zkappWorkerClient.getPlayer1Hash();
        const player2Hash = await zkappWorkerClient.getPlayer2Hash();
        console.log(`Current state in zkApp: ${currentNum.toString()}`);
        setDisplayText('');

        setState({
          ...state,
          zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zkappPublicKey,
          accountExists,
          currentNum,
          player1Hash,
          player2Hash
        });
      }
    })();
  }, []);

  // -------------------------------------------------------
  // Wait for account to exist, if it didn't

  useEffect(() => {
    (async () => {
      if (state.hasBeenSetup && !state.accountExists) {
        for (; ;) {
          setDisplayText('Checking if fee payer account exists...');
          console.log('Checking if fee payer account exists...');
          const res = await state.zkappWorkerClient!.fetchAccount({
            publicKey: state.publicKey!
          });
          const accountExists = res.error == null;
          if (accountExists) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        setState({ ...state, accountExists: true });
      }
    })();
  }, [state.hasBeenSetup]);

  // -------------------------------------------------------
  // Send a transaction


  const onSendTransaction = async (methodStr: string) => {
    setState({ ...state, creatingTransaction: true });

    setDisplayText('Creating a transaction...');
    console.log('Creating a transaction...');

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.publicKey!
    });

    switch (methodStr) {
      case 'createUpdateTransaction':
        await state.zkappWorkerClient!.createUpdateTransaction();
        break;
      case 'createSetTempvarTx':
        const num = Number(inputValue);
        await state.zkappWorkerClient!.createSetTempvarTx(num);
        break;
      case "joinGame":
        const player: PublicKey = state.publicKey!;
        await state.zkappWorkerClient!.createJoinGameTx(player);
        break;
      case "playerTimeout":
        await state.zkappWorkerClient!.createPlayerTimeoutTx();
        break;
      case "withdraw":
        await state.zkappWorkerClient!.createWithdrawTx();
        break;
      case 'deposit':
        await state.zkappWorkerClient!.createDepositTx();
        break;
      case 'takeAction':
        const action: UInt32 = UInt32.from(0);
        const betSize: UInt32 = UInt32.from(0);
        await state.zkappWorkerClient!.createTakeActionTx(action, betSize);
        break;
      case 'showdown':
        await state.zkappWorkerClient!.createShowdownTx();
        break;
      case 'tallyBoardCards':
        const cardPrime52: Field = Field(0);
        await state.zkappWorkerClient!.createTallyBoardCardsTx(cardPrime52);
        break;
      case 'showCards':
        const holecard0: UInt64 = UInt64.from(0);
        const holecard1: UInt64 = UInt64.from(0);
        const boardcard0: UInt64 = UInt64.from(0);
        const boardcard1: UInt64 = UInt64.from(0);
        const boardcard2: UInt64 = UInt64.from(0);
        const boardcard3: UInt64 = UInt64.from(0);
        const boardcard4: UInt64 = UInt64.from(0);
        const useHolecard0: Bool = Bool(false);
        const useHolecard1: Bool = Bool(false);
        const useBoardcards0: Bool = Bool(false);
        const useBoardcards1: Bool = Bool(false);
        const useBoardcards2: Bool = Bool(false);
        const useBoardcards3: Bool = Bool(false);
        const useBoardcards4: Bool = Bool(false);
        const isFlush: Bool = Bool(false);
        const shuffleKey: PrivateKey = PrivateKey.random();
        const merkleMapKey: Field = Field(0);
        const merkleMapVal: Field = Field(0);
        const isLefts: Bool[] = [];
        const siblings: Field[] = [];
        const path: MerkleMapWitness = new MerkleMapWitness(isLefts, siblings);
        await state.zkappWorkerClient!.createShowCardsTx(holecard0, holecard1, boardcard0, boardcard1, boardcard2, boardcard3, boardcard4, useHolecard0, useHolecard1, useBoardcards0, useBoardcards1, useBoardcards2, useBoardcards3, useBoardcards4, isFlush, shuffleKey, merkleMapKey, merkleMapVal, path);
        break;
      case 'storeCardHash':
        const slotIsc: Field = Field(0);
        const shuffleSecret: PrivateKey = PrivateKey.random();
        const epk1: PublicKey = shuffleSecret.toPublicKey();
        const epk2: PublicKey = shuffleSecret.toPublicKey();
        await state.zkappWorkerClient!.createStoreCardHashTx(slotIsc, shuffleSecret, epk1, epk2);
        break;
      case 'commitCard':
        const slotIcc: Field = Field(0);
        const msg: PublicKey = PrivateKey.random().toPublicKey();
        await state.zkappWorkerClient!.createCommitCardTx(slotIcc, msg);
        break;
    }

    setDisplayText('Creating proof...');
    console.log('Creating proof...');
    await state.zkappWorkerClient!.proveUpdateTransaction();

    console.log('Requesting send transaction...');
    setDisplayText('Requesting send transaction...');
    const transactionJSON = await state.zkappWorkerClient!.getTransactionJSON();

    setDisplayText('Getting transaction JSON...');
    console.log('Getting transaction JSON...');
    const { hash } = await (window as any).mina.sendTransaction({
      transaction: transactionJSON,
      feePayer: {
        fee: transactionFee,
        memo: ''
      }
    });

    //const transactionLink = `https://berkeley.minaexplorer.com/transaction/${hash}`;
    const transactionLink = `minascan.io/berkeley/tx/${hash}`;
    console.log(`View transaction at ${transactionLink}`);

    setTransactionLink(transactionLink);
    setDisplayText(transactionLink);

    setState({ ...state, creatingTransaction: false });
  };

  // -------------------------------------------------------
  // Refresh the current state

  const onRefreshCurrentNum = async () => {
    console.log('Getting zkApp state...');
    setDisplayText('Getting zkApp state...');

    await state.zkappWorkerClient!.fetchAccount({
      publicKey: state.zkappPublicKey!
    });
    const currentNum = await state.zkappWorkerClient!.getNum();
    setState({ ...state, currentNum });
    console.log(`Current state in zkApp: ${currentNum.toString()}`);
    setDisplayText('');
  };

  // -------------------------------------------------------
  // Create UI elements

  let hasWallet;
  if (state.hasWallet != null && !state.hasWallet) {
    const auroLink = 'https://www.aurowallet.com/';
    const auroLinkElem = (
      <a href={auroLink} target="_blank" rel="noreferrer">
        Install Auro wallet here
      </a>
    );
    hasWallet = <div>Could not find a wallet. {auroLinkElem}</div>;
  }

  const stepDisplay = transactionlink ? (
    <a href={displayText} target="_blank" rel="noreferrer">
      View transaction
    </a>
  ) : (
    displayText
  );

  let setup = (
    <div
      className={styles.start}
      style={{ fontWeight: 'bold', fontSize: '1.5rem', paddingBottom: '5rem' }}
    >
      {stepDisplay}
      {hasWallet}
    </div>
  );

  let accountDoesNotExist;
  if (state.hasBeenSetup && !state.accountExists) {
    const faucetLink =
      'https://faucet.minaprotocol.com/?address=' + state.publicKey!.toBase58();
    accountDoesNotExist = (
      <div>
        <span style={{ paddingRight: '1rem' }}>Account does not exist.</span>
        <a href={faucetLink} target="_blank" rel="noreferrer">
          Visit the faucet to fund this fee payer account
        </a>
      </div>
    );
  }


  let mainContent;
  if (state.hasBeenSetup && state.accountExists) {
    mainContent = (
      <div style={{ justifyContent: 'center', alignItems: 'center' }}>

        <div className={styles.center} style={{ padding: 0 }}>
          Current state in zkApp: {state.currentNum!.toString()}{' '}
          player1hash: {state.player1Hash!.toString()}{' '}
          player2hash: {state.player2Hash!.toString()}{' '}
        </div>

        <button className={styles.card} onClick={() => onSendTransaction('createUpdateTransaction')} disabled={state.creatingTransaction}>
          testFunc1
        </button>

        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Set field value"
        />

        <button className={styles.card} onClick={() => onSendTransaction('createSetTempvarTx')} disabled={state.creatingTransaction}>
          testFunc2
        </button>

        <button className={styles.card} onClick={() => onSendTransaction('joinGame')} disabled={state.creatingTransaction}>
          joinGame
        </button>

        <button className={styles.card} onClick={() => onSendTransaction('playerTimeout')} disabled={state.creatingTransaction}>
          playerTimeout
        </button>

        <button className={styles.card} onClick={() => onSendTransaction('withdraw')} disabled={state.creatingTransaction}>
          withdraw
        </button>

        <button className={styles.card} onClick={() => onSendTransaction('deposit')} disabled={state.creatingTransaction}>
          deposit
        </button>

        <button className={styles.card} onClick={() => onSendTransaction('takeAction')} disabled={state.creatingTransaction}>
          takeAction
        </button>

        <button className={styles.card} onClick={() => onSendTransaction('showdown')} disabled={state.creatingTransaction}>
          showdown
        </button>

        <button className={styles.card} onClick={() => onSendTransaction('tallyBoardCards')} disabled={state.creatingTransaction}>
          tallyBoardCards
        </button>

        <button className={styles.card} onClick={() => onSendTransaction('showCards')} disabled={state.creatingTransaction}>
          showCards
        </button>

        <button className={styles.card} onClick={() => onSendTransaction('storeCardHash')} disabled={state.creatingTransaction}>
          storeCardHash
        </button>

        <button className={styles.card} onClick={() => onSendTransaction('commitCard')} disabled={state.creatingTransaction}>
          commitCard
        </button>

        <button className={styles.card} onClick={onRefreshCurrentNum}>
          Get Latest State
        </button>

      </div>
    );
  }

  return (
    <GradientBG>
      <div className={styles.main} style={{ padding: 0 }}>
        <div className={styles.center} style={{ padding: 0 }}>
          {setup}
          {accountDoesNotExist}
          {mainContent}
        </div>
      </div>
    </GradientBG>
  );
}