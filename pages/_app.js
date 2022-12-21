import '../styles/globals.css';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react';
import { ethers } from "ethers";
import Head from "next/head";
import { Header } from "../components/header";



export default function App({ Component, pageProps }) {
  // TODO Change for mainnet
  const defaultProvider = new ethers.providers.AlchemyProvider(
    "goerli",
    process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_GOERLI
  );

  return (
    <DynamicContextProvider
      settings={{
        appLogoUrl:
          "https://upload.wikimedia.org/wikipedia/commons/3/34/Examplelogo.svg",
        appName: "Present Protocol",
        environmentId: "db7a8968-4e63-4ccd-bf6b-c7082545ee22",
        // privacyPolicyUrl: "/privacypolicy",
        // termsOfServiceUrl: "/termsofservice",
        onAuthSuccess: ({ authToken, user }) => {
          console.log(
            `Welcome ${user.walletPublicKey} your token expires on ${authToken.exp}`
          );
          window.location.assign("/");
        },
      }}
    >
      <Head>
        <title>Present Protocol</title>
      </Head>
      <Header />
      <Component {...pageProps} />
    </DynamicContextProvider>
  );
}
