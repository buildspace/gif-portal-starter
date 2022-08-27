import { NextPage } from 'next'
import Image from 'next/image'

import twitterImg from '../public/twitter-logo.svg'

const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const Home: NextPage = () => {
  return (
    <div className='h-screen bg-gray-800 text-center'>
      <div className='h-full flex relative flex-col justify-center px-8'>
        <div className='flex flex-col p-8'>
          <p className='text-5xl font-bold text-white'>🖼 GIF Portal</p>
          <p className='my-8 text-2xl text-white'>
            View your GIF collection in the metaverse ✨
          </p>
        </div>
        <div className='flex justify-center items-center absolute w-full bottom-0 left-0 pb-16'>
          <Image alt="Twitter Logo" width={35} height={35} src={twitterImg} />
          <a className='text-white font-bold' href={TWITTER_LINK} target="_blank" rel="noreferrer">
            {`built on @${TWITTER_HANDLE}`}
          </a>
        </div>
      </div>
    </div>
  )
}

export default Home
