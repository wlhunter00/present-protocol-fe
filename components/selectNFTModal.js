import { Dialog, Grid, DialogTitle, DialogContent } from "@mui/material";
import { NFTCard } from "./NFTCard";
import useMediaQuery from "@mui/material/useMediaQuery";

// TODO: X close button
// TODO: Fix the wallet connect thing
// TODO: Add search

export default function SelectNFTModal(props) {
    const isDesktop = useMediaQuery("(min-width:600px)");

    return (
        <Dialog
            open={props.open}
            onClose={props.handleClose}
            scroll={"paper"}
            style={{ textAlign: "center" }}
            fullWidth={isDesktop}
            maxWidth={"lg"}
        >
            <DialogTitle>Select an NFT to Gift</DialogTitle>

            <DialogContent dividers>
                <div className="modal-content">
                    <Grid
                        container
                        direction={isDesktop ? 'row' : 'column'}
                        style={{ alignContent: 'center' }}
                        gap={4}
                    >
                        {props.nfts &&
                            props.nfts.map((nft, index) => (
                                <div
                                    onClick={() => props.selectNFT(nft)}
                                    key={index}
                                >

                                    <Grid item xs={6} key={index}>
                                        <NFTCard nft={nft} />
                                    </Grid>
                                </div>
                            ))}
                    </Grid>
                </div>
            </DialogContent>
        </ Dialog>
    )
};