import React, { useEffect, useState } from 'react';

import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TEST_GIFS = [
	'https://i.giphy.com/media/eIG0HfouRQJQr1wBzz/giphy.webp',
	'https://media3.giphy.com/media/L71a8LW2UrKwPaWNYM/giphy.gif?cid=ecf05e47rr9qizx2msjucl1xyvuu47d7kf25tqt2lvo024uo&rid=giphy.gif&ct=g',
	'https://media4.giphy.com/media/AeFmQjHMtEySooOc8K/giphy.gif?cid=ecf05e47qdzhdma2y3ugn32lkgi972z9mpfzocjj6z1ro4ec&rid=giphy.gif&ct=g',
	'https://i.giphy.com/media/PAqjdPkJLDsmBRSYUp/giphy.webp'
];

const App = () => {

  const [walletAddress, setWalletAddress] = useState(null);
  const [gifList, setGifList] = useState([]);
  const [gifInput, setGifInput] = useState("");

  //handlers
  const gifSubmitHandler = (e) => {
    e.preventDefault();
    if (gifInput.length > 0) {
      console.log("Sending gif...");
      sendGif();
    } else {
      console.log("gif link is empty. nothing submitted.")
    }
  };

  const gifInputChangeHandler = (e) => {
    const { value } = e.target;
    setGifInput(value);
  };

  // solana object utils
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        console.log("Solana Object found!");
        if (solana.isPhantom) {
          console.log("Phantom wallet found!");
          const response = await solana.connect({onlyIfTrusted: true});
          console.log("Connected with public key:", response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("You need a Solana wallet 👻 linked to your browser to use this application");
      }

    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log("Connected with public key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const sendGif = async () => {
    console.log("new gif:", gifInput);
    setGifList([...gifList, gifInput]);
    setGifInput("");
  };

  //container renders
  const renderConnectedContainer = () => (
    <div className="connected-container">
      <form onSubmit={gifSubmitHandler} >
        <input placeholder="Paste your gif link here!" type="text" value={gifInput} onChange={gifInputChangeHandler}/>
        <button type="submit" className="cta-button submit-gif-button">
          Submit
        </button>
      </form>
      <div className="gif-grid">
        {gifList.map(gif => (
          <div className="gif-item" key={gif} >
            <img src={gif} alt={gif}/>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };

    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching list of Gifs...")
      setGifList(TEST_GIFS);
    }
  }, [walletAddress])

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">🖼 GIF Portal</p>
          <p className="sub-text">
            View your GIF collection in the metaverse ✨
          </p>
          {walletAddress ? renderConnectedContainer() : renderNotConnectedContainer()}
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
