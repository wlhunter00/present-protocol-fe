import '../styles/globals.css';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react';
import { ethers } from 'ethers';
import Head from 'next/head';
import { Header } from '../components/header';
import { Pacifico } from '@next/font/google';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'

const pacficio = Pacifico({ subsets: ['latin'], weight: '400' });

export default function App({ Component, pageProps }) {
  // TODO Change for mainnet
  const defaultProvider = new ethers.providers.AlchemyProvider(
    'goerli',
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_GOERLI
  );

  return (
    <DynamicContextProvider
      settings={{
        appName: 'Present Protocol',
        environmentId: 'db7a8968-4e63-4ccd-bf6b-c7082545ee22',
        // privacyPolicyUrl: "/privacypolicy",
        // termsOfServiceUrl: "/termsofservice",
      }}
    >
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <main className={pacficio.className}>
          <Head>
            <title>Present Protocol</title>
          </Head>
          <Header />
          <Component {...pageProps} />
        </main>
      </LocalizationProvider>
    </DynamicContextProvider>
  );
}
