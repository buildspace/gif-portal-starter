/** @format */

import { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import idl from "./idl.json";
import kp from "./keypair.json";
const BN = require("bn.js");

const { SystemProgram, Keypair } = web3;

// let baseAccount = Keypair.generate();
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);

const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");
const opts = {
  preflightCommitment: "processed",
};

// Constants
const TWITTER_HANDLE = "_buildspace";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState("");
  const [gifList, setGifList] = useState([]);

  const shortenAddress = address =>
    address.slice(0, 4) + "..." + address.slice(-4);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");

          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            "Connected with Public Key:",
            response.publicKey.toString()
          );
          const shortWalletAddress = shortenAddress(
            response.publicKey.toString()
          );
          setWalletAddress([response.publicKey.toString(), shortWalletAddress]);
        }
      } else {
        alert("Solana object not found! Get a Phantom wallet!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      const shortWalletAddress = shortenAddress(response.publicKey.toString());
      console.log("Connected with Public Key:", response.publicKey.toString());
      console.log("Shortened wallet address: ", shortWalletAddress);
      setWalletAddress([response.publicKey.toString(), shortWalletAddress]);
    }
  };

  const disconnectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.disconnect();
      console.log("Wallet disconnected", response);
      setWalletAddress(null);
    }
  };

  const onInputChange = event => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const createGifAccount = async () => {
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
        signers: [baseAccount],
      });
      console.log(
        "Created a new BaseAccount w/ address:",
        baseAccount.publicKey.toString()
      );
      await getGifList();
    } catch (error) {
      console.log("Error creating BaseAccount account:", error);
    }
  };

  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No gif link given");
      return;
    }
    console.log("Gif link: ", inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      });
      console.log("Gif successfully sent to program ", inputValue);

      await getGifList();
      setInputValue("");
    } catch (error) {
      console.log("Error sending Gif ", error);
    }
  };

  const upvoteGif = async gifIndex => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.upvoteGif(new BN(gifIndex), {
        accounts: {
          baseAccount: baseAccount.publicKey,
        },
      });
      console.log("Upvoted gif aat index", gifIndex);
      await getGifList();
    } catch (error) {
      console.log("Error upvoting gif", error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className='cta-button connect-wallet-button'
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderDisconnectContainer = () => (
    <button
      className='cta-button connect-wallet-button'
      onClick={disconnectWallet}
    >
      {console.log(walletAddress)}
      <div>Disconnect</div>
      <div>{walletAddress[1]}</div>
    </button>
  );

  const renderConnectedContainer = () => {
    // If we hit this, it means the program account hasn't be initialized.
    if (gifList === null) {
      return (
        <div className='connected-container'>
          <button
            className='cta-button submit-gif-button'
            onClick={createGifAccount}
          >
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      );
    }
    // Otherwise, we're good! Account exists. User can submit GIFs.
    else {
      return (
        <div className='connected-container'>
          <input
            type='text'
            placeholder='Enter gif link!'
            value={inputValue}
            onChange={onInputChange}
          />
          <button className='cta-button submit-gif-button' onClick={sendGif}>
            Submit
          </button>
          <div className='gif-grid'>
            {/* We use index as the key instead, also, the src is now item.gifLink */}
            {gifList.map((item, index) => (
              <div
                className='gif-item'
                style={{
                  border: "1px solid red",
                  borderRadius: "10px",
                  borderColor: "grey",
                  padding: "10px",
                }}
                key={index}
              >
                <img src={item.gifLink} />
                <div
                  style={{
                    color: "white",
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "15px",
                  }}
                >
                  <div>
                    User:
                    {shortenAddress(item.userAddress.toString())}
                  </div>
                  <div>Tip</div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div
                      className='upvote-container'
                      onClick={() => upvoteGif(index)}
                    >
                      Upvote
                    </div>
                    <div>{item.votes.toString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
  };

  useEffect(() => {
    window.addEventListener("load", async event => {
      await checkIfWalletIsConnected();
    });
  }, []);

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(
        baseAccount.publicKey
      );

      console.log("Got the account", account);
      setGifList(account.gifList);
    } catch (error) {
      console.log("Error in getGifs: ", error);
      setGifList(null);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching Gif List ...");
      getGifList();
    }
  }, [walletAddress]);

  return (
    <div className='App'>
      <div className={walletAddress ? "authed-container" : "container"}>
        <div className='header-container'>
          {walletAddress && renderDisconnectContainer()}
          <p className='header'>🖼 GIF Portal</p>
          <p className='sub-text'>
            View your GIF collection in the metaverse ✨
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className='footer-container'>
          <img alt='Twitter Logo' className='twitter-logo' src={twitterLogo} />
          <a
            className='footer-text'
            href={TWITTER_LINK}
            target='_blank'
            rel='noreferrer'
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
