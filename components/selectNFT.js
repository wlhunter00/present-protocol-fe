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
import Gift from "../public/new-gift.svg";
import { Button, TextField } from '@mui/material';
import useMediaQuery from "@mui/material/useMediaQuery";


import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs from 'dayjs';
import WrapNFTModal from './wrapNFTModal';

// TODO: do I need to ask for apporval everytime?
export function SelectNFT() {
  const isDesktop = useMediaQuery("(min-width:600px)");
  const [selectModalOpen, setSelectModalOpen] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [PresentProtocolContract, setPresentProtocolContract] = useState();
  const [walletAddressToSendTo, setWalletAddressToSendTo] = useState(null);
  const [giftMessage, setGiftMessage] = useState("");
  const { user, walletConnector, setShowAuthFlow } = useDynamicContext();
  const [resolvedAddress, setResolvedAddress] = useState("");
  const [unwrapDate, setUnwrapDate] = useState();
  const [wrapModal, setWrapModal] = useState(false);
  // Status goes default, info (pending), success, error
  const [approvalStatus, setApprovalStatus] = useState("default");
  const [wrapStatus, setWrapStatus] = useState("default");
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState();
  const color = "white";

  // Getting all the user's NFTs
  const fetcher = (url) => fetch(url).then((r) => r.json());
  const { data: nfts, error: nftsError } = useSWR(
    user ? `/api/nfts?userWallet=${user.walletPublicKey}` : [],
    fetcher
  );

  useEffect(() => {
    setUnwrapDate(dayjs());
  }, [])

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

  function closeSelectModal() {
    setSelectModalOpen(false);
  }

  function closeWrapNFTModal() {
    if (approvalStatus === "error" || wrapStatus === "success" || wrapStatus === "error") {
      setWrapModal(false);
      setApprovalStatus("default");
      setWrapStatus("default");
      setErrorMessage("");
      setSuccessData();
    }
  }

  async function selectNFT(nft) {
    console.log('Setting the current NFT to: ');
    console.log(nft);

    // Setting the selected NFT in state
    setSelectedNFT(nft);
    closeSelectModal();
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
    console.log('Wrapping nft!', resolvedAddress, selectedNFT.collection_address, selectedNFT.token_id);
    console.log("message:", giftMessage, "date:", unwrapDate.unix());
    setWrapModal(true);

    if (selectedNFT.schema === "ERC721") {
      const abi = ["function approve(address _spender, uint256 _value) public returns (bool success)"];
      const provider = walletConnector.getWeb3Provider();
      const signer = provider.getSigner();

      const specificNFTContract = new ethers.Contract(selectedNFT.collection_address, abi, provider);

      try {
        console.log("requesting approval for", selectedNFT.collection_address);
        const approval = await specificNFTContract.connect(signer).approve(
          PRESENT_PROTOCOL_ADDY,
          selectedNFT.token_id
        );
        setApprovalStatus("info");

        await approval.wait();
        setApprovalStatus("success");
        console.log("approval granted")

        try {
          console.log("encoding", selectedNFT.collection_address, selectedNFT.token_id, unwrapDate.unix());

          const encodedGift = await PresentProtocolContract.encode(selectedNFT.collection_address, selectedNFT.token_id, unwrapDate.unix());
          console.log("encoded gift", encodedGift);

          console.log("requesting wrapping");
          const wrap = await PresentProtocolContract.wrap(
            encodedGift,
            resolvedAddress,
            giftMessage
          );

          setWrapStatus("info");
          console.log("wrapping request sent")
          const wraptxt = await wrap.wait();
          console.log(wraptxt);
          console.log("wrap done");
          setSuccessData(wraptxt);
          setWrapStatus("success");

          setResolvedAddress("");
          setUnwrapDate(dayjs());
          setSelectedNFT(null);
        }
        catch (error) {
          setWrapStatus("error");
          setErrorMessage(error.message);
          console.log("wrap error", error);
        }
      }
      catch (error) {
        setApprovalStatus("error");
        setErrorMessage(error.message);
        console.log("approval error", error);
      }
    }
    else {
      // todo - add 1555 support
      console.log("1155");
      const abi = ["function setApprovalForAll(address _operator, bool _approved) public returns (bool success)"];
      const provider = walletConnector.getWeb3Provider();
      const signer = provider.getSigner();

      const specificNFTContract = new ethers.Contract(selectedNFT.collection_address, abi, provider);

      try {
        console.log("requesting approval for", selectedNFT.collection_address);
        const approval = await specificNFTContract.connect(signer).setApprovalForAll(
          PRESENT_PROTOCOL_ADDY,
          true
        );
        setApprovalStatus("info");

        await approval.wait();
        setApprovalStatus("success");
        console.log("approval granted")

        try {
          console.log("encoding", selectedNFT.collection_address, selectedNFT.token_id, unwrapDate.unix());
          const encodedGift = await PresentProtocolContract.encode(selectedNFT.collection_address, selectedNFT.token_id, unwrapDate.unix());
          console.log("encoded gift", encodedGift);

          console.log("requesting wrapping");
          const wrap = await PresentProtocolContract.wrap(
            encodedGift,
            resolvedAddress,
            giftMessage
          );

          setWrapStatus("info");
          console.log("wrapping request sent")
          const wraptxt = await wrap.wait();
          console.log(wraptxt);
          console.log("wrap done");
          setSuccessData(wraptxt);
          setWrapStatus("success");

          setResolvedAddress("");
          setUnwrapDate(dayjs());
          setSelectedNFT(null);
        }
        catch (error) {
          setWrapStatus("error");
          setErrorMessage(error.message);
          console.log("wrap error", error);
        }
      }
      catch (error) {
        setApprovalStatus("error");
        setErrorMessage(error.message);
        console.log("approval error", error);
      }

    }

  }

  // todo - add message
  // TODO - UPDATE IMAGERY BASED OFF FIVERR
  return (
    <div className='gifting-bg'>
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
                <Gift width="150px" height="150px" />
                <h4>Select an NFT</h4>
              </div>
            }
          </div>
          {selectedNFT &&
            <div className='form-inputs'>
              <div style={{ margin: "1.5rem" }}>
                <DesktopDatePicker
                  label="Unwrap Date"
                  inputFormat="MM/DD/YYYY"
                  value={unwrapDate}
                  onChange={setUnwrapDate}
                  renderInput={
                    (params) =>
                      <TextField
                        required
                        sx={{
                          borderColor: { color },
                          svg: { color },
                          input: { color },
                          label: { color }
                        }}

                        {...params}
                      />
                  }
                  disablePast
                />
              </div>
              <WalletInput
                walletSetter={setWalletAddressToSendTo}
                resolvedAddress={resolvedAddress}
                selectedNFT={selectedNFT}
                isDesktop={isDesktop}
              />
              <TextField
                onChange={(e) => {
                  setGiftMessage(e.target.value);
                }}
                label="Gift Message (>250 Characters)"
                variant="filled"
                disabled={!selectedNFT}
                style={{ width: isDesktop ? "50%" : "80%", margin: "0 auto", marginBottom: "1rem", backgroundColor: "white" }}
                color='secondary'
                multiline
                inputProps={{ maxLength: 250 }}
              />
              {unwrapDate &&
                <p className="confirmation" style={{ marginBottom: "1rem" }}>They will be able to open it on: <i>{unwrapDate.format('MM/DD/YYYY')}</i></p>
              }
              <Button
                variant="contained"
                color="success"
                size="large"
                disabled={!resolvedAddress}
                onClick={wrapNFT}
              >
                Send Gift
              </Button>
            </div>
          }
          <SelectNFTModal
            open={selectModalOpen}
            handleClose={closeSelectModal}
            nfts={nfts}
            selectNFT={selectNFT}
          />
          <WrapNFTModal
            wrapModal={wrapModal}
            wrapStatus={wrapStatus}
            approvalStatus={approvalStatus}
            handleClose={closeWrapNFTModal}
            nft={selectedNFT}
            errorMessage={errorMessage}
            successData={successData}
          />
        </div>
      </Container>
    </div>
  );
}
