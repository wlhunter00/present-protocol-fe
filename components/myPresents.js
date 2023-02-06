import { Container, Grid, Snackbar, Alert } from "@mui/material"
import { useState, useEffect } from "react";
import useSWR from 'swr';
import { useDynamicContext } from '@dynamic-labs/sdk-react';
import { PresentCard } from "./presentCard";
import useMediaQuery from "@mui/material/useMediaQuery";
import UnwrapNFTModal from "./unwrapNFTModal";

// Contract info
import { PRESENT_PROTOCOL_ADDY } from '../contractAddresses';
import PresentProtocolABI from '../abis/PresentProtocolABI.json';
import { ethers } from 'ethers';

export default function MyPresents() {
    const fetcher = (url) => fetch(url).then((r) => r.json());
    const { user, walletConnector } = useDynamicContext();
    const [PresentProtocolContract, setPresentProtocolContract] = useState();
    const isDesktop = useMediaQuery("(min-width:600px)");

    const [unwrapModal, setUnwrapModal] = useState(false);
    const [unwrapStatus, setUnwrapStatus] = useState("default");
    const [errorMessage, setErrorMessage] = useState("");
    const [successData, setSuccessData] = useState();
    const [displayGifts, setDisplayGifts] = useState([]);
    const [filterIDs, setFilterIDs] = useState([]);
    const [alertOpen, setAlertOpen] = useState(false);

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

    const { data: nfts, error: nftsError } = useSWR(
        user ? `/api/gifts?userWallet=${user.walletPublicKey}` : [],
        fetcher
    );

    useEffect(() => {
        if (Array.isArray(nfts)) {
            filterGifts();
        }
    }, [nfts]);


    function filterGifts() {
        setDisplayGifts(nfts.filter((gift) => !filterIDs.includes(gift.token_id)).sort((a, b) => a.token_id - b.token_id));
    }

    useEffect(() => {
        if (displayGifts.length > 0) {
            filterGifts();
        }
    }, [filterIDs])

    function closeUnwrapNFTModal() {
        if (unwrapStatus === "success" || unwrapStatus === "error") {
            setUnwrapModal(false);
            setUnwrapStatus("default");
            setErrorMessage("");
            setSuccessData();
        }
    }

    async function unwrap(giftId, canUnwrap) {
        console.log("Unwrapping gift", giftId, canUnwrap);
        if (canUnwrap) {
            setUnwrapModal(true);
            try {
                const unwrap = await PresentProtocolContract.unwrap(giftId);
                setUnwrapStatus("info");

                const unwraptxt = await unwrap.wait();
                console.log(unwraptxt);
                console.log("unwrapped successful");
                setSuccessData(unwraptxt);
                setUnwrapStatus("success");
                setFilterIDs([...filterIDs, giftId]);
            }
            catch (error) {
                setUnwrapStatus("error");
                setErrorMessage(error.message);
                console.log("unwrap error", error);
                // TODO - parse the error message better
            }
        }
        else {
            setAlertOpen(true);
            console.log("Can't unwrap");
        }
    }

    return (
        <Container>
            {Array.isArray(nfts) &&
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h2 className="subtitle">Open your Presents</h2>
                    <Grid
                        direction={isDesktop ? 'row' : 'column'}
                        container
                        spacing={2}
                    >
                        {displayGifts && displayGifts.map((nft, index) => (
                            <PresentCard nft={nft} key={index} unwrap={unwrap} />
                        ))
                        }
                    </Grid>
                </div>
            }
            <UnwrapNFTModal
                unwrapModal={unwrapModal}
                unwrapStatus={unwrapStatus}
                handleClose={closeUnwrapNFTModal}
                errorMessage={errorMessage}
                successData={successData}
            />
            <Snackbar
                anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
                open={alertOpen}
                autoHideDuration={4000}
                onClose={() => setAlertOpen(false)}
            >
                <Alert
                    variant="filled"
                    onClose={() => setAlertOpen(false)}
                    color="info"
                    severity="error"
                >
                    Present isn't ready to be unwrapped!
                </Alert>
            </Snackbar>
        </Container>
    )
};