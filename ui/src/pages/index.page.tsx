import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from 'react';
import { useGlobalContext } from "./global-context";
import ZkappWorkerClient from './zkappWorkerClient';
import './reactCOIServiceWorker';
import { PublicKey } from 'o1js';


export default function Component() {
  const { globalState, setGlobalState } = useGlobalContext();

  // For setting a specific value
  const [inputValue, setInputValue] = useState('');
  const [displayText, setDisplayText] = useState('');
  const [transactionlink, setTransactionLink] = useState('');

  useEffect(() => {
    async function timeout(seconds: number): Promise<void> {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, seconds * 1000);
      });
    }

    (async () => {
      if (!globalState.hasBeenSetup) {
        setDisplayText('Loading web worker...');
        console.log('Loading web worker...');
        const zkappWorkerClient = new ZkappWorkerClient();
        await timeout(5);

        setDisplayText('Done loading web worker');
        console.log('Done loading web worker');

        await zkappWorkerClient.setActiveInstanceToBerkeley();

        const mina = (window as any).mina;

        if (mina == null) {
          setGlobalState({ ...globalState, hasWallet: false });
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

        const zkappPublicKey = PublicKey.fromBase58(globalState.zkappAddress);

        await zkappWorkerClient.initZkappInstance(zkappPublicKey);

        console.log('Getting zkApp state...');
        setDisplayText('Getting zkApp state...');
        await zkappWorkerClient.fetchAccount({ publicKey: zkappPublicKey });
        const currentNum = await zkappWorkerClient.getNum();
        const player1Hash = await zkappWorkerClient.getPlayer1Hash();
        const player2Hash = await zkappWorkerClient.getPlayer2Hash();
        const gamestate = await zkappWorkerClient.getGamestate();
        console.log(`Current state in zkApp: ${currentNum.toString()}`);
        setDisplayText('');

        setGlobalState({
          ...globalState,
          zkappWorkerClient,
          hasWallet: true,
          hasBeenSetup: true,
          publicKey,
          zkappPublicKey,
          accountExists,
          currentNum,
          gamestate,
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
      if (globalState.hasBeenSetup && !globalState.accountExists) {
        for (; ;) {
          setDisplayText('Checking if fee payer account exists...');
          console.log('Checking if fee payer account exists...');
          const res = await globalState.zkappWorkerClient!.fetchAccount({
            publicKey: globalState.publicKey!
          });
          const accountExists = res.error == null;
          if (accountExists) {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
        setGlobalState({ ...globalState, accountExists: true });
      }
    })();
  }, [globalState.hasBeenSetup]);


  // -------------------------------------------------------
  // Create UI elements

  let hasWallet;
  if (globalState.hasWallet != null && !globalState.hasWallet) {
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
      style={{ fontWeight: 'bold', fontSize: '1.5rem', paddingBottom: '5rem' }}
    >
      {stepDisplay}
      {hasWallet}
    </div>
  );

  let accountDoesNotExist;
  if (globalState.hasBeenSetup && !globalState.accountExists) {
    const faucetLink =
      'https://faucet.minaprotocol.com/?address=' + globalState.publicKey!.toBase58();
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
  if (globalState.hasBeenSetup && globalState.accountExists) {
    mainContent = (
      <div style={{ justifyContent: 'center', alignItems: 'center' }}>

        <div style={{ padding: 0 }}>
          Current state in zkApp: {globalState.currentNum!.toString()}{' '}
          player1hash: {globalState.player1Hash!.toString()}{' '}
          player2hash: {globalState.player2Hash!.toString()}{' '}
          gamestate: {globalState.gamestate!.toString()}{' '}
        </div>

      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="px-4 lg:px-6">
        <div className="container flex items-center justify-center h-14 px-4 md:px-6">
          <nav className="hidden gap-4 lg:flex">
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="create">
              Create
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="join">
              Join
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="playgame">
              Gameplay
            </Link>
            <Link className="text-sm font-medium hover:underline underline-offset-4" href="gettokens">
              Get Tokens
            </Link>
          </nav>
          <div className="flex-1" />
          <Link className="flex items-center justify-center text-sm font-medium" href="#">
            Home
          </Link>
        </div>
      </header>
      <main className="flex-1">

        <div style={{ padding: 0 }}>
          <div style={{ padding: 0 }}>
            {setup}
            {accountDoesNotExist}
            {mainContent}
          </div>
        </div>


        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container flex flex-col items-center justify-center space-y-4 text-center px-4 md:px-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Welcome to the Platform</h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Play decentralized Poker
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <div className="flex-1 flex items-center justify-center">
                <Button variant="primary">Load Contract</Button>
              </div>

              <Link
                className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                href="#"
              >
                Get Started
              </Link>
              <Link
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
                href="#"
              >
                Join Game
              </Link>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container flex items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Learn more about decentralized poker on Mina
              </h2>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

