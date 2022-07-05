import React , {useState, useEffect} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';


const TEST_GIFS = [
  'https://media0.giphy.com/media/l2R035GINW2k6ZoxG/200w.webp?cid=ecf05e47cmj4hgyok5npb2fcrud2y8q5zaxyl9ik55exxe3g&rid=200w.webp&ct=g',
  'https://media1.giphy.com/media/3o7TKB3oifq46DDhOE/200.webp?cid=ecf05e47cmj4hgyok5npb2fcrud2y8q5zaxyl9ik55exxe3g&rid=200.webp&ct=g',
  'https://media0.giphy.com/media/mmRmDX9Y3Q7NS/200.webp?cid=ecf05e47cmj4hgyok5npb2fcrud2y8q5zaxyl9ik55exxe3g&rid=200.webp&ct=g',
  'https://media0.giphy.com/media/j2jZAiyXdk44ipNi8c/200.webp?cid=ecf05e47cmj4hgyok5npb2fcrud2y8q5zaxyl9ik55exxe3g&rid=200.webp&ct=g',
  'https://media1.giphy.com/media/26TKa1M2DbIdetbkmE/200w.webp?cid=ecf05e47cmj4hgyok5npb2fcrud2y8q5zaxyl9ik55exxe3g&rid=200w.webp&ct=g',
  'https://media1.giphy.com/media/8UGoOaR1lA1uaAN892/200.webp?cid=ecf05e47cmj4hgyok5npb2fcrud2y8q5zaxyl9ik55exxe3g&rid=200.webp&ct=g',
  'https://media2.giphy.com/media/ARNz99G9mRFQ1dW7eG/200.webp?cid=ecf05e47cw9nlm954p4lvd1hbaj11g99ss61zc3pqriwcnmn&rid=200.webp&ct=g',
  'https://media1.giphy.com/media/kLGEjXf6yEMog/200w.webp?cid=ecf05e47cw9nlm954p4lvd1hbaj11g99ss61zc3pqriwcnmn&rid=200w.webp&ct=g',
  'https://media2.giphy.com/media/xT9IgoB4yOspMqzufu/100.webp?cid=ecf05e47cw9nlm954p4lvd1hbaj11g99ss61zc3pqriwcnmn&rid=100.webp&ct=g'
]


// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

const [walletAddress, setWalletAddress] = useState(null);
const [inputValue, setInputValue] = useState("");
const [gifList, setGifList] = useState([]);

const checkIfWalletIsConnected = async() => {
    try {
      const  { solana } = window;

      if ( solana ){
        if ( solana.isPhantom){
          console.log("Phantom wallet found!");

          const response = await solana.connect({ onlyIfTrusted : true});
          console.log(
            'connected with public key :',
            response.publicKey.toString()
          );
            setWalletAddress(response.publicKey.toString());

        }
      }else{
        alert('solana object not , Get a phantom wallet')
      }
    } catch (error) {
      console.error(error);
    }
};


const connectWallet = async () => {
    const { solana } = window;
    if ( solana ) {
      const response = await solana.connect();
      console.log('connected with publickey:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
    }
};

const sendGif = async () => {
  if( inputValue.length > 0){
    console.log('gif-link:', inputValue);
    setGifList([...gifList, inputValue]);
    setInputValue('');
  } else{
    console.log('Empty input. Try again')
  }
}

const onInputChange = (event) => {
  const { value } = event.target;
  setInputValue(value);
};

const renderNotConnectedContainer = () => (
  <button
    className='cta-button connect-wallet-button'
    onClick={connectWallet}
  >
    connect to walllet
  </button>
)

const ConnectedContainer = () => (
  <div className='connected-container'>
    <form
      onSubmit={(event) => {
        event.preventDefault();
          sendGif();
      }}
    >
      <input 
      type="text" 
      placeholder='Enter gif link!' 
      value={inputValue}
      onChange={onInputChange}
      />
      <button type='submit' className='cta-button submit-gif-button'>submit</button>
    </form>
    <div className='gif-grid'>
      {gifList.map(gif => (
        <div className='gif-item' key={gif}>
            <img src={gif} alt={gif}/>
        </div>
      ))}
    </div>
  </div>
);

useEffect(() => {
  const onLoad = async() =>{
    await checkIfWalletIsConnected();
  }
  window.addEventListener('load', onLoad);
  return () => window.removeEventListener('load', onLoad);
},[]);


useEffect(() => {
  if(walletAddress) {
    console.log('Fetching Gif list.... ');

    setGifList(TEST_GIFS);
  }
},[walletAddress]);

  return (
    <div>
    <div className="App">
      <div className="container">
        <div className="authed-container">
          <p className="header">🖼  Smh GIF Portal</p>
          <p className="sub-text">
            View your Smh  GIF collection in the metaverse ✨
          </p>

              {!walletAddress && renderNotConnectedContainer()}
              {walletAddress && <ConnectedContainer />}
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
    </div>
  );
};

export default App;
