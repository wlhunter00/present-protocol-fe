import { Container, Grid } from "@mui/material"
import { useState, useEffect } from "react";
import useSWR from 'swr';
import { useDynamicContext } from '@dynamic-labs/sdk-react';
import { PresentCard } from "./presentCard";
import useMediaQuery from "@mui/material/useMediaQuery";



// Contract info
import { PRESENT_PROTOCOL_ADDY } from '../contractAddresses';
import PresentProtocolABI from '../abis/PresentProtocolABI.json';
import { ethers } from 'ethers';

export default function MyPresents() {
    const fetcher = (url) => fetch(url).then((r) => r.json());
    const { user, walletConnector } = useDynamicContext();
    const [PresentProtocolContract, setPresentProtocolContract] = useState();
    const isDesktop = useMediaQuery("(min-width:600px)");

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

    // todo - sort by id
    const { data: nfts, error: nftsError } = useSWR(
        user ? `/api/gifts?userWallet=${user.walletPublicKey}` : [],
        fetcher
    );

    async function unwrap(giftId, canUnwrap) {
        console.log("Unwrapping gift", giftId, canUnwrap);

        try {
            const unwrap = await PresentProtocolContract.unwrap(giftId);
            const unwraptxt = await unwrap.wait();
            console.log(unwraptxt)

        }
        catch (err) {
            console.log(err);
        }
    }

    return (
        <Container>
            {nfts &&
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <h2 className="subtitle">Open your Presents</h2>
                    <Grid
                        direction={isDesktop ? 'row' : 'column'}
                        container
                        spacing={2}
                    >
                        {nfts && nfts.map((nft, index) => (
                            <PresentCard nft={nft} key={index} unwrap={unwrap} />
                        ))
                        }
                    </Grid>
                </div>
            }
        </Container>
    )
};