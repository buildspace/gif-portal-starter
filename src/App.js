import React, { useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor"; 
import twitterLogo from './assets/twitter-logo.svg';
import idl from './idl.json';
import kp from "./keypair.json";
import './App.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
  'https://media1.giphy.com/media/6DsvupGsbVTEc/200w.webp?cid=ecf05e470bklfms9b5be913kodno9a10s0rxcg8bjcpp4h3m&rid=200w.webp&ct=g',
  'https://media.giphy.com/media/CKAdUL5cM0zC0/giphy.gif',
  'https://media3.giphy.com/media/aDS8SjVtS3Mwo/200.webp?cid=ecf05e470bklfms9b5be913kodno9a10s0rxcg8bjcpp4h3m&rid=200.webp&ct=g',
  'https://media2.giphy.com/media/c4p59oQhRFE1W/giphy.webp?cid=ecf05e47wy8s9b7vkmki2hf86dlzoqcjsq7uoa36j8o4lvjb&rid=giphy.webp&ct=g',
  'https://media1.giphy.com/media/Advd8M8jbsoG4/200.webp?cid=ecf05e47qvtgefwu9pdpt3lujw6rye1r15087yvswnps092i&rid=200.webp&ct=g',
  'https://media2.giphy.com/media/4hggD9I4GjwuQ/200.webp?cid=ecf05e47qvtgefwu9pdpt3lujw6rye1r15087yvswnps092i&rid=200.webp&ct=g',
  'https://media0.giphy.com/media/4fCFRodZ5tJu0/200w.webp?cid=ecf05e47qvtgefwu9pdpt3lujw6rye1r15087yvswnps092i&rid=200w.webp&ct=g',
  'https://media3.giphy.com/media/jh7F7XwHTywg85ekdl/200w.webp?cid=ecf05e4781vzhmetwhitl4amet1azwbzn4pr2ek93tf4604h&rid=200w.webp&ct=g',
  'https://media2.giphy.com/media/fTn01fiFdTd5pL60ln/200w.webp?cid=ecf05e4781vzhmetwhitl4amet1azwbzn4pr2ek93tf4604h&rid=200w.webp&ct=g',
  'https://media2.giphy.com/media/1tWfO5cOkdF3uGG0Ix/200w.webp?cid=ecf05e4781vzhmetwhitl4amet1azwbzn4pr2ek93tf4604h&rid=200w.webp&ct=g'
]

const { SystemProgram, Keypair } = web3;

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
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
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
      console.log("GIF successfully sent to program", inputValue);
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error);
    }
  };

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
            {gifList.map(gif => (
              <div className="gif-item" key={gif.gifLink}>
                <img src={gif.gifLink} alt={gif} />
              </div>
            ))}
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
