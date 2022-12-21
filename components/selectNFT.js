import { Puff } from 'react-loading-icons';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useDynamicContext, DynamicAuthFlow } from '@dynamic-labs/sdk-react';
import useSWR from 'swr';
import { Grid, Snackbar, Alert } from '@mui/material';
import { Container } from '@mui/system';
import Image from 'next/image';

import { NFTCard } from './NFTCard';

export function SelectNFT() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const { user, walletConnector, setShowAuthFlow, showAuthFlow } =
    useDynamicContext();

  // Getting all the user's NFTs
  const fetcher = (url) => fetch(url).then((r) => r.json());
  const { data: nfts, error: nftsError } = useSWR(
    user ? `/api/nfts?userWallet=${user.walletPublicKey}` : null,
    fetcher
  );
  const isDesktop = true; // @Will
  //   console.log(nfts);

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
  }

  return (
    <div>
      <div className="custom-card" onClick={openSelectModal}>
        <p>Click to Select NFT</p>
      </div>
      <Modal
        isOpen={modalOpen}
        onAfterOpen={afterOpenModal}
        onRequestClose={closeModal}
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
    </div>
  );
}
