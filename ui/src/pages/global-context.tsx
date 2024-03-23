import React, { createContext, useContext, useState } from 'react';
import { Field, PublicKey } from 'o1js';
import ZkappWorkerClient from './zkappWorkerClient';

type GlobalContextProviderProps = {
    children: React.ReactNode;
}

type GlobalState = {
    testStr: string;
    zkappWorkerClient: null | ZkappWorkerClient;
    hasWallet: null | boolean;
    hasBeenSetup: boolean;
    accountExists: boolean;
    currentNum: null | Field;
    // This should have the o1js-pack encoded game state
    gamestate: null | Field;
    player1Hash: null | Field;
    player2Hash: null | Field;
    publicKey: null | PublicKey;
    zkappPublicKey: null | PublicKey;
    creatingTransaction: boolean;
    transactionFee: Number,
    // Address we deployed to on berkeley
    zkappAddress: string,
}


type GlobalContext = {
    globalState: GlobalState;
    setGlobalState: React.Dispatch<React.SetStateAction<GlobalState>>;
};

export const GlobalContext = createContext<GlobalContext | null>(null);

export default function GlobalContextProvider({ children }: GlobalContextProviderProps) {
    const [globalState, setGlobalState] = useState<GlobalState>(
        {
            testStr: "abcd",
            zkappWorkerClient: null,
            hasWallet: null,
            hasBeenSetup: false,
            accountExists: false,
            currentNum: null,
            gamestate: null,
            player1Hash: null,
            player2Hash: null,
            publicKey: null,
            zkappPublicKey: null,
            creatingTransaction: false,
            // These are constants
            transactionFee: 0.1,
            zkappAddress: 'B62qpGqTpNvxMNjh1msVt1Dy6KTSZo2Q9XYR3dcc8Ld1LpcuDm4VUhW',
        }
    );

    return (
        <GlobalContext.Provider value={{ globalState, setGlobalState }}>
            {children}
        </GlobalContext.Provider>
    );
}

export function useGlobalContext() {
    const context = useContext(GlobalContext);
    if (!context) {
        throw new Error('useGlobalContext must be used within a GlobalContextProvider');
    }
    return context;
}