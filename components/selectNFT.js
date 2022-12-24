import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDynamicContext } from '@dynamic-labs/sdk-react';
import useSWR from 'swr';

// Contract info
import { PRESENT_PROTOCOL_ADDY } from '../contractAddresses';
import PresentProtocolABI from '../abis/PresentProtocolABI.json';
import { ethers } from 'ethers';

import SelectNFTModal from './selectNFTModal';
import { NFTCard } from './NFTCard';

export function SelectNFT() {
  const [selectModalOpen, setSelectModalOpen] = useState(false);
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
        setSelectModalOpen(true);
      }
    } else {
      setSelectModalOpen(false);
      setShowAuthFlow(true);
    }
  };

  function afterOpenModal() {
    // references are now sync'd and can be accessed.
    // subtitle.style.color = "#f00";
  }

  function closeSelectModal() {
    setSelectModalOpen(false);
  }

  async function selectNFT(nft) {
    console.log('Setting the current NFT to: ');
    console.log(nft);

    // Setting the selected NFT in state
    setSelectedNFT(nft);
    closeSelectModal();

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
      <div className="image-select-card" onClick={openSelectModal}>

        {selectedNFT ?
          // <Image
          //   loader={() => {
          //     return selectedNFT.image;
          //   }}
          //   src={selectedNFT.image}
          //   width={300}
          //   height={300}
          //   alt={selectedNFT.name}
          // />
          <div style={{ width: "500px", margin: "auto" }}>
            <NFTCard nft={selectedNFT} />
          </div>
          :
          <div className="custom-card highlight-hover">
            <p>Click to Select NFT</p>
          </div>
        }
      </div>

      <SelectNFTModal
        open={selectModalOpen}
        handleClose={closeSelectModal}
        nfts={nfts}
        selectNFT={selectNFT}
      />

      {/* <Modal
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
      </Modal> */}
    </div>
  );
}
