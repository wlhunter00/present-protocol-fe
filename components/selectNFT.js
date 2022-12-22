import { Puff } from 'react-loading-icons';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useDynamicContext, DynamicAuthFlow } from '@dynamic-labs/sdk-react';
import useSWR from 'swr';
import { Grid, Snackbar, Alert } from '@mui/material';
import { Container } from '@mui/system';
import Image from 'next/image';
// Contract info
import { PRESENT_PROTOCOL_ADDY } from '../contractAddresses';
import PresentProtocolABI from '../abis/PresentProtocolABI.json';
import { ethers } from 'ethers';

import { NFTCard } from './NFTCard';
import { WrapTextOutlined } from '@mui/icons-material';

export function SelectNFT() {
  const [modalOpen, setModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [PresentProtocolContract, setPresentProtocolContract] = useState();
  const [walletAddressToSendTo, setWalletAddressToSendTo] = useState(null);
  const { user, walletConnector, setShowAuthFlow, showAuthFlow } =
    useDynamicContext();

  // Getting all the user's NFTs
  const fetcher = (url) => fetch(url).then((r) => r.json());
  const { data: nfts, error: nftsError } = useSWR(
    user ? `/api/nfts?userWallet=${user.walletPublicKey}` : null,
    fetcher
  );
  const isDesktop = true; // @Will

  // Setting the contract
  useEffect(() => {
    if (user && walletConnector) {
      //   const defaultProvider = new ethers.providers.AlchemyProvider(
      //     'goerli',
      //     process.env.NEXT_PUBLIC_ALCHEMY_API_KEY_GOERLI
      //   );
      const provider = walletConnector.getWeb3Provider();
      const signer = provider.getSigner();
      const presentProtocolContract = new ethers.Contract(
        PRESENT_PROTOCOL_ADDY,
        PresentProtocolABI,
        signer
      );

      setPresentProtocolContract(presentProtocolContract);
    }
    console.log(PresentProtocolContract);
  }, [user, walletConnector]);

  const openSelectModal = async () => {
    console.log('Opening select modal');
    if (user) {
      if (nftsError) {
        console.log('cant open modal, error retrieving nfts');
        console.log(nftsError);
      } else {
        setModalOpen(true);
      }
    } else {
      setModalOpen(false);
      setShowAuthFlow(true);
    }
  };

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    // subtitle.style.color = "#f00";
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function selectNFT(nft) {
    console.log('Setting the current NFT to: ');
    console.log(nft);

    // Setting the selected NFT in state
    setSelectedNFT(nft);
    closeModal();

    // Now just do whatever you want with it
    setFormModalOpen(true);
  }

  async function wrapNFT() {
    console.log('Wrapping nft!');

    try {
      // Approve txn - need to also add for 1155 (check if it's an 1155 or 721 and then use the proper approve func)
      //   const approval = await PresentProtocolContract.approve(
      //     walletAddressToSendTo,
      //     selectedNFT.token_id
      //   );
      //   await approval.wait();

      // Wrap NFT (and send)
      const wrap = await PresentProtocolContract.wrap(
        selectedNFT.collection_addy,
        selectedNFT.token_id,
        walletAddressToSendTo
      );
      await wrap.wait();
    } catch (error) {
      alert(error.message);
      console.log(error);
    }
  }

  return (
    <div>
      <div className="custom-card" onClick={openSelectModal}>
        <p>Click to Select NFT</p>
      </div>
      <Modal
        isOpen={modalOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={() => {
          setModalOpen(false);
        }}
        contentLabel="NFT Selection"
        className="modal"
        ariaHideApp={false}
      >
        <Container className="body-container">
          {nfts &&
            nfts.map((nft, index) => (
              <div
                onClick={() => {
                  selectNFT(nft);
                }}
              >
                <Grid
                  container
                  spacing={2}
                  direction={isDesktop ? 'row' : 'column'}
                  style={{ alignContent: 'center' }}
                >
                  <Grid item xs={6} key={index}>
                    <NFTCard nft={nft} />
                  </Grid>
                </Grid>
              </div>
            ))}
        </Container>
      </Modal>

      <Modal
        isOpen={formModalOpen}
        // onAfterOpen={afterOpenModal}
        onRequestClose={() => {
          setFormModalOpen(false);
        }}
        contentLabel="Wrap your NFT"
        className="modal"
        ariaHideApp={false}
      >
        <Grid
          container
          spacing={2}
          direction={isDesktop ? 'row' : 'column'}
          style={{ alignContent: 'center' }}
        >
          <h2>Send this NFT as a gift to someone!</h2>
          <br />
          <form>
            <label for="walletaddy">Wallet address:</label>
            <br />
            <input
              type="text"
              id="walletaddy"
              name="walletaddy"
              placeholder="wallet addy"
              onChange={(e) => {
                setWalletAddressToSendTo(e.target.value);
                console.log(e.target.value);
              }}
            />
            <input type="submit" value="Submit" onClick={wrapNFT} />
          </form>
        </Grid>
      </Modal>
    </div>
  );
}
