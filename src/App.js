import React, { useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl, Transaction, TransactionInstruction, SystemInstruction } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor"; 
import { AiOutlineLike, AiFillLike, AiOutlineLoading } from "react-icons/ai";


import twitterLogo from './assets/twitter-logo.svg';
import idl from './idl.json';
import kp from "./keypair.json";
import './App.css';
import { BN } from "bn.js";

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const { SystemProgram } = web3;

// the keypair for the account that will hold the GIF data.
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

const programID = new PublicKey(idl.metadata.address);

//set out network to devnet
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: 'processed'
}

const App = () => {
  const [busy, setBusy] = useState(false);
  const [activeGif, setActiveGif] = useState("");
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [tip, setTip] = useState("");
  const [showTipInput, setShowTipInput] = useState(false);
  const [gifList, setGifList] = useState([]);

  const checkIfWalletIsConnected = async() => {
    try {
      const { solana } = window;
      if(solana && solana.isPhantom) {
        console.log("Phantom wallet found!")

        const response = await solana.connect({ onlyIfTrusted: true });
        console.log(
          'Connected with public key',
          response.publicKey.toString()
        );
        setWalletAddress(response.publicKey.toString());
      } else {
        alert("Solana object not found! Get a Phantom wallet 👻")
      }
    } catch (error) {
      console.error(error);
    }
  }

  const connectWallet = async() => {
    const { solana } = window;

    if(solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  }

  const getGifList = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account);
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error in getGifList:", error);
      setGifList(null)
    }
  }

  const createGifAccount = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      })
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();
    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  }

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log('No gif link given!');
      return;
    }
    console.log("GIF link:", inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey
        }
      });
      setInputValue("");
      console.log("GIF successfully sent to program", inputValue);
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error);
    }
  };

  const likeGif = async(gifLink) => {
    setBusy(true);
    setActiveGif(gifLink);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.likeGif(gifLink, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey
        }
      })
      console.log("liked GIF successfully");
      await getGifList();
      setBusy(false);
      setActiveGif("")
    } catch (error) {
      setBusy(false);
      console.log("Error liking GIF:", error)
    }
  }

  const unLikeGif = async(gifLink) => {
    setBusy(true);
    setActiveGif(gifLink);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.unLikeGif(gifLink, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey
        }
      })
      console.log("removed like successfully");
      await getGifList();
      setBusy(false);
      setActiveGif("")
    } catch (error) {
      setBusy(true);
      console.log("error removing like:", error);
    }
  }

  const tipUser = async(data) => {
    setBusy(true);
    setActiveGif(data.gifLink);
    try {
      const provider = getProvider();
      const recentBlockhash = await provider.connection.getRecentBlockhash();
      const transaction = new Transaction();
      transaction.instructions = [
        SystemProgram.transfer({
          fromPubkey: provider.wallet.publicKey,
          lamports: web3.LAMPORTS_PER_SOL * parseInt(tip),
          programId: SystemProgram.programId,
          toPubkey: data.userAddress,
        })
      ]
      transaction.recentBlockhash = recentBlockhash.blockhash;
      transaction.feePayer = provider.wallet.publicKey
      const signedTransaction = await window.solana.signTransaction(transaction);
      const signature = await provider.connection.sendRawTransaction(signedTransaction.serialize());
      console.log("transaction success: ", signature);
      setBusy(false)
      setActiveGif(null)
      setShowTipInput(false);
      alert(`Transaction Success: ${signature}`);
    } catch (error) {
      setBusy(true);
      setActiveGif(null)
      console.log(("transaction failed: ", error));
    }
  }

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment
    );
    return provider;
  }

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to wallet
    </button>
  )

  const renderConnectedContainer = () => {
    if(gifList === null)
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      )
    else
      return (
        <div className="connected-container">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendGif();
            }}
          >
            <input 
              type="text" 
              placeholder="Enter gif link!" 
              value={inputValue}
              onChange={onInputChange}
            />
            <button type="submit" className="cta-button submit-gif-button">Submit</button>
          </form>
          <div className="gif-grid">
            {gifList.map(gif => {
              const liked = gif.likedByList.find(item => item.toString() === walletAddress)
              return (
                <div className="gif-item" key={gif.gifLink}>
                  <img src={gif.gifLink} alt={gif} />
                  <p className="mt-1 text-white">user: <strong>{gif.userAddress.toString()}</strong></p>
                  <div
                    className="flex flex-row items-center mt-2 space-x-6"
                  >
                    <button
                      onClick={liked ? () => unLikeGif(gif.gifLink) : () => likeGif(gif.gifLink)}
                      disabled={busy}
                      className="w-[fit-content] p-2 flex flex-row items-end"
                    >
                      {busy && activeGif === gif.gifLink ? (
                        <AiOutlineLoading color="white" className="animate-spin" />
                      ) : (
                        liked ? <AiFillLike size={25} /> : <AiOutlineLike size={25} color="white" />
                      )}
                      <p
                        className="text-white font-medium ml-2 text-[18px]"
                      >
                        {gif.likes.toString()}</p>
                    </button>
                    <button
                      onClick={() => {
                        setShowTipInput(!showTipInput);
                        setActiveGif(gif.gifLink);
                      }}
                      className="text-white font-bold submit-gif-button h-[fit-content] px-4 rounded"
                    >
                      Tip User!
                    </button>
                  </div>
                  {showTipInput && activeGif === gif.gifLink && (
                    <div
                      className="flex flex-row items-center space-x-2"
                    >
                      <input 
                        onChange={(e) => setTip(e.target.value)}
                        placeholder="Enter amount in SOL"
                        className="w-[200px] rounded p-2"
                      />
                      <button
                        onClick={() => tipUser(gif)}
                        className="submit-gif-button text-white font-bold w-[200px] capitalize px-4 rounded"
                      >
                        Send tip
                      </button>
                    </div>
                  )}
                </div>
              )})}
          </div>
        </div>
      )
  }

  useEffect(() => {
    const onLoad = async() => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad)
  }, [])

  useEffect(() => {
    if(walletAddress) {
      console.log("Fetching GIF list...");

      getGifList()
    }
  }, [walletAddress])

  return (
    <div className="App">
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className="header-container">
          <p className="header">🖼 Anime GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
