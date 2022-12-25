import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react';
import useSWR from 'swr';
const { toChecksumAddress } = require('ethereum-checksum-address');

// Contract info
import { PRESENT_PROTOCOL_ADDY } from '../contractAddresses';
import PresentProtocolABI from '../abis/PresentProtocolABI.json';
import { ethers } from 'ethers';

import SelectNFTModal from './selectNFTModal';
import { NFTCard } from './NFTCard';
import WalletInput from './walletInput';
import { Container } from '@mui/system'
import GiftLogo from '../public/gift.svg';
import { Button } from '@mui/material';

// todo fix the mobile

export function SelectNFT() {
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [walletInputError, setWalletInputError] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [PresentProtocolContract, setPresentProtocolContract] = useState();
  const [walletAddressToSendTo, setWalletAddressToSendTo] = useState(null);
  const { user, walletConnector, setShowAuthFlow, showAuthFlow } =
    useDynamicContext();
  const [resolvedAddress, setResolvedAddress] = useState("");

  // Getting all the user's NFTs
  const fetcher = (url) => fetch(url).then((r) => r.json());
  const { data: nfts, error: nftsError } = useSWR(
    user ? `/api/nfts?userWallet=${user.walletPublicKey}` : null,
    fetcher
  );

  useEffect(() => {
    checkAddressInput();
  }, [walletAddressToSendTo]);

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

  async function checkAddressInput() {
    if (user && walletConnector) {
      const checkProvider = walletConnector.getWeb3Provider();

      try {
        const ensCheck = await checkProvider.resolveName(walletAddressToSendTo);

        if (!ensCheck) {
          throw 'ENS Resolve Failed';
        }
        else {
          setResolvedAddress(ensCheck);
        }
        console.log("ens output", ensCheck);
      }
      catch (err) {
        try {
          const checkSumCheck = toChecksumAddress(walletAddressToSendTo);
          if (checkSumCheck) {
            console.log("checksum output", checkSumCheck);
            setResolvedAddress(checkSumCheck);
          }
        }
        catch (err) {
          setResolvedAddress("");
        }
      }
    }
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
    <Container>
      <div className='gifting-form'>
        <h2 className="subtitle">Gift an NFT</h2>
        <div className="image-select-card" >
          {selectedNFT ?
            <div style={{ width: "fit-content", margin: "0 auto" }} onClick={openSelectModal}>
              <NFTCard nft={selectedNFT} />
            </div>
            :
            <div className="custom-card highlight-hover" onClick={openSelectModal}>
              <GiftLogo />
              <h4>Select Which NFT</h4>
            </div>
          }
        </div>
        <SelectNFTModal
          open={selectModalOpen}
          handleClose={closeSelectModal}
          nfts={nfts}
          selectNFT={selectNFT}
        />
        {selectedNFT &&
          <div className='form-inputs'>
            <WalletInput
              walletSetter={setWalletAddressToSendTo}
              resolvedAddress={resolvedAddress}
              selectedNFT={selectedNFT}
            />
            <Button variant="contained" color="success" size="large" disabled={!resolvedAddress}>Gift</Button>
          </div>
        }

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
    </Container>
  );
}
