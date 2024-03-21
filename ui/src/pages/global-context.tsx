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
    hasBeenSetup: false;
    accountExists: false;
    currentNum: null | Field;
    player1Hash: null | Field;
    player2Hash: null | Field;
    publicKey: null | PublicKey;
    zkappPublicKey: null | PublicKey;
    creatingTransaction: false;
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
            player1Hash: null,
            player2Hash: null,
            publicKey: null,
            zkappPublicKey: null,
            creatingTransaction: false
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