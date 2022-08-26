import { NextPage } from 'next'
import Image from 'next/image'

import styles from '../styles/Home.module.css'
import twitterImg from '../public/twitter-logo.svg'

const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const Home: NextPage = () => {
  return (
    <div className={styles['app']}>
      <div className={styles['container']}>
        <div className={styles['header-container']}>
          <p className={styles["header"]}>🖼 GIF Portal</p>
          <p className={styles["sub-text"]}>
            View your GIF collection in the metaverse ✨
          </p>
        </div>
        <div className={styles["footer-container"]}>
          <Image alt="Twitter Logo" width={35} height={35} src={twitterImg} />
          <a
            className={styles["footer-text"]}
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default Home
