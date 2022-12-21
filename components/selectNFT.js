import { Puff } from 'react-loading-icons';
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useDynamicContext, DynamicAuthFlow } from '@dynamic-labs/sdk-react';
import useSWR from 'swr';

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
  console.log(nfts);

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
      >
        {nfts && nfts.map((nft) => <h1>{nft.name}</h1>)}
      </Modal>
    </div>
  );
}
