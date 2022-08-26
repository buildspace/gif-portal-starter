import { Html, Head, Main, NextScript } from 'next/document'

const Document = () => {
  return (
    <Html>
      <Head>
        <meta charSet="utf-8"/>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000"/>
        <meta name="description" content="Web site created using create-react-app" />
        <meta name="title" content="GIF Portal" />
        <meta name="description" content="Create a GIF collection with the Metaverse!" />

        { /* Facebook */ }
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://buildspace.so/" />
        <meta property="og:title" content="GIF Portal" />
        <meta property="og:description" content="Create a GIF collection with the Metaverse!" />
        <meta property="og:image" content="https://s3.amazonaws.com/cdn.buildspace.so/courses/web3-solana-app/metadata.png" />

        { /* Twitter */ }
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://buildspace.so/" />
        <meta property="twitter:title" content="GIF Portal" />
        <meta property="twitter:description" content="Create a GIF collection with the Metaverse!" />
        <meta property="twitter:image" content="https://s3.amazonaws.com/cdn.buildspace.so/courses/web3-solana-app/metadata.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}

export default Document
