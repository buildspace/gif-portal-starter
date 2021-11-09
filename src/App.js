import { useEffect, useState } from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import {Connection, PublicKey, clusterApiUrl} from '@solana/web3.js';
import {Program, Provider,web3} from '@project-serum/anchor';

import idl from './idl.json';
import kp from './keypair.json'

const { SystemProgram } = web3;

const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr)
const baseAccount = web3.Keypair.fromSecretKey(secret)

const programID = new PublicKey(idl.metadata.address);

const network = clusterApiUrl('devnet');

const opts = {
  preflightCommitment: "processed"
}

// Constants
const TWITTER_HANDLE = 'danicuki';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

// const TEST_GIFS = [
// 	'https://media2.giphy.com/media/Dl2seYrwPvfjO/giphy.webp?cid=ecf05e47kndf035wgn1xa7m2jn7q13oxvhx54uk2fcjhbhrg&rid=giphy.webp&ct=g',
// 	'https://media2.giphy.com/media/WU6QkqR4DZ1O15Z9Xf/200w.webp?cid=ecf05e47a50kiywvavh7vq817tyeubgh8tyfi47ret2eod7g&rid=200w.webp&ct=g',
// 	'https://media0.giphy.com/media/xUNd9TLcssBOqBOwVO/200w.webp?cid=ecf05e47iymoayh7rf2y7uwn0q8y3hf3tkvur9x0zw624g69&rid=200w.webp&ct=g',
// 	'https://media4.giphy.com/media/aLwLJ9JzPVe3O0hzzv/giphy.webp?cid=ecf05e47j3nu4eleeyhovewirqpizh65msirr5ncslk50475&rid=giphy.webp&ct=g',
//   'https://media2.giphy.com/media/1GMrkiwNw0OhW/200.webp?cid=ecf05e4761qvgb1i3qt6axovq5w8o01bkbe43l1432d7d5t5&rid=200.webp&ct=g',
//   'https://media1.giphy.com/media/u1ntxwWK5fNf2/giphy.webp?cid=ecf05e47z89oorv5xju4fpha0pv1re9127rsdyt8epbo1uhy&rid=giphy.webp&ct=g'
// ]


const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList, setGifList] = useState([]);

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found!');

          const response = await solana.connect({ onlyIfTrusted: true });
          console.log(
            'Connected with Public Key:',
            response.publicKey.toString()
          );
  
          setWalletAddress(response.publicKey.toString());

        }
      } else {
        alert('Solana object not found! Get a Phantom Wallet 👻');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    window.addEventListener('load', async (event) => {
      await checkIfWalletIsConnected();
    });
  }, []);

  const getGifList = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);
      
      console.log("Got the account", account)
      setGifList(account.gifList)
  
    } catch (error) {
      console.log("Error in getGifs: ", error)
      setGifList(null);
    }
  }

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching GIF list...');
      
      getGifList();
    }
// eslint-disable-next-line
  }, [walletAddress]);
  

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };

  const createGifAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping")
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:", baseAccount.publicKey.toString())
      await getGifList();
  
    } catch(error) {
      console.log("Error creating BaseAccount account:", error)
    }
  }
  
  
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  };

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }
  
  
  const sendGif = async () => {
    if (inputValue.length === 0) {
      console.log("No gif link given!")
      return
    }
  
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
        },
      });

      console.log("GIF sucesfully sent to program", inputValue)
  
      await getGifList();
    } catch (error) {
      console.log("Error sending GIF:", error)
    }
  };
  
  const renderConnectedContainer = () => {
    if (gifList === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={createGifAccount}>
            Do One-Time Initialization For GIF Program Account
          </button>
        </div>
      )
    } 
    // Otherwise, we're good! Account exists. User can submit GIFs.
    else {
      return (
        <div className="connected-container">
        <input type="text" placeholder="Enter gif link!" value={inputValue} onChange={onInputChange} />
        <button className="cta-button submit-gif-button" onClick={sendGif}>Submit</button>
        <div className="gif-grid">
          {gifList.map((item, index) =>  (
            <div className="gif-item" key={index}>
              <img src={item.gifLink} alt={item.gifLink} />
            </div>
          ))}
        </div>
      </div>)
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header">🇧🇷 Brazil GIF Portal</p>
          <p className="sub-text">
            View Brazilian culture GIFs ✨
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
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
