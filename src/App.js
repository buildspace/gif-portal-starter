import React, { useEffect, useState } from "react";
import twitterLogo from "./assets/twitter-logo.svg";
import "./App.css";
import idl from "./idl.json"
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor' 
import kp from './keypair.json'
// SystemProgram is a reference to the Solana runtime!
const { SystemProgram,Keypair } = web3;

// Create a keypair for the account that will hold the GIF data
const arr = Object.values(kp._keypair.secretKey)
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret)
//Get our program's id from the IDL file
const programID = new PublicKey(idl.metadata.address);

// Set our network to devnet.
const network = clusterApiUrl('devnet');

//Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}


// Constants
const TWITTER_HANDLE = "adarshzpatel";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [gifList,setGifList] = useState([]);

  const getGifList = async() => {
    try {
       const provider = getProvider();
       const program = new Program(idl,programID,provider);
       const account = await program.account.baseAccount.fetch(baseAccount.publicKey)
       console.log("Got the account",account)
       setGifList(account.gifList)
      } catch (error) {
        console.log("Errors in getGifList: ",error)
        setGifList(null);
      }

  }

  const createGifAccount = async () => {
    try{
      const provider = getProvider();
      const program = new Program(idl,programID,provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts:{
          baseAccount:baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers:[baseAccount]
      });
      console.log("Created a new BaseAccount w/ address:",baseAccount.publicKey.toString())
      await getGifList();

    } catch(error) {
      console.log("Error creating BaseAccount account: ",error)
    }
  }

  const renderConnectedContainer = () => {
    //If we hit this , it means the program account hasn't been initalized 
    if(gifList === null){
      return (
        <div className="connected-container">
          <button className="cta-button submit-gif-button" onClick={()=>createGifAccount()}>Do One Time Initialization For Gif Program Account </button>
        </div>
      )
    }
    // Otherwise ,we're good! Account exist. User can sbumit GIFs;'
    else {
      return(
        <div className="connected-container">
          <form onSubmit={(event)=>{
            event.preventDefault();
            sendGif();
          }}>
            <input type="text" placeholder="Enter gif link!" value={inputValue}
            onChange={onInputChange}
            />
            <button type="submit" className="cta-button submit-gif-button">
              Submit
            </button>
          </form>
          <div className="gif-grid">
            {gifList.map((item,index)=> (
              <div className="gif-item" key={index}>
                <img src={item.gifLink} alt='gif'/>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }
  
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        console.log("Phantom wallet found!");
        /*
         * The solana object gives us a function that will allow us to connect
         * directly with the user's wallet!
         */
        const response = await solana.connect({ onIfTrusted: true });
        console.log(
          "Connected with Public key:",
          response.publicKey.toString()
        );
        // Set user's public key in state.
        setWalletAddress(response.publicKey.toString());
      } else {
        alert("Solana object not found! Get a Phantom Wallet 👻");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const getProvider = () => {
    const connection = new Connection(network , opts.preflightCommitment)
    const provider = new Provider (
      connection, window.solana, opts.preflightCommitment
    );
    return provider
  }

  const connectWallet = async () => {
    const { solana } = window;

    if (solana) {
      const response = await solana.connect();
      console.log("Connected with Public Key:", response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
  };
  // we want to render the connect button if theuser has'nt connected their wallet on our app yet
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to wallet
    </button>
  );

  const onInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const sendGif = async () => {
    if(inputValue.length === 0){
      console.log("No gif link given!")
      return
    }
    console.log('Gif Link: ', inputValue);
    try{
      const provider = getProvider();
      const program = new Program(idl,programID,provider);

      await program.rpc.addGif(inputValue, {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        }
      });
      console.log("GIF successfully sent to program", inputValue);
    } catch(error) {
      console.error("Error Sending Gif: ", error);
    }
  };

  useEffect(()=> {
    if(walletAddress){
      console.log('Fetching GIF list...');
      //  Call solana program
      getGifList()
    }
  },[walletAddress])

  
  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header gradient-text">One Piece Gifs</p>
          <p className="sub-text">
            Journey to the ONE PIECE !!
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
