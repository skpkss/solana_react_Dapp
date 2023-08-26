// import functionalities
import React from 'react';
import './App.css';
import {
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import {useEffect , useState } from "react";
import './App.css'

// create types
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

// create a provider interface (hint: think of this as an object) to store the Phantom Provider
interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

 /**
 * @description gets Phantom provider, if it exists
 */
 const getProvider = (): PhantomProvider | undefined => {
  if ("solana" in window) {
    // @ts-ignore
    const provider = window.solana as any;
    if (provider.isPhantom) return provider as PhantomProvider;
  }
};

export default function App() {
  const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined);
  const [walletKey, setWalletKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    const provider = getProvider();
    if (provider) setProvider(provider);
    else setProvider(undefined);
  }, []);

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      try {
        const response = await solana.connect();
        console.log('wallet account ', response.publicKey.toString());
        setWalletKey(response.publicKey.toString());
      } catch (err) {
        // Handle error
      }
    }
  };

  const disconnectWallet = async () => {
    if (provider) {
      await provider.disconnect();
      setWalletKey(undefined);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2>Connect to Phantom Wallet</h2>
        {provider && !walletKey && (
          <button
            style={{
              fontSize: "16px",
              padding: "15px",
              fontWeight: "bold",
              borderRadius: "5px",
            }}
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
        {provider && walletKey && (
          <div>
            <p>Connected account: {walletKey}</p>
            <button onClick={disconnectWallet}>Disconnect</button>
          </div>
        )}
        {!provider && (
          <p>
            No provider found. Install{" "}
            <a href="https://phantom.app/">Phantom Browser extension</a>
          </p>
        )}
      </header>
    </div>
  );
}
