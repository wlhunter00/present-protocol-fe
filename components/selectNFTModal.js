import { Dialog, Grid, DialogTitle, DialogContent, TextField, InputAdornment } from "@mui/material";
import { Search, Close } from "@mui/icons-material";
import { NFTCard } from "./NFTCard";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useState, useEffect } from "react";

export default function SelectNFTModal(props) {
    const isDesktop = useMediaQuery("(min-width:600px)");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchNFTs, setSearchNFTs] = useState(props.nfts);

    useEffect(() => {
        setSearchNFTs(props.nfts);
    }, [props.nfts]);

    useEffect(() => {
        if (props.nfts && Array.isArray(searchNFTs)) {
            setSearchNFTs(props.nfts.filter((nft) => (nft.name.toLowerCase().includes(searchQuery) || nft.collection_name.toLowerCase().includes(searchQuery))));
        }
    }, [searchQuery]);


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
            <div className="close-button" onClick={props.handleClose}>
                <Close />
            </div>
            <TextField
                id="outlined-basic"
                label="Search"
                variant="outlined"
                style={{ width: isDesktop ? "50%" : "80%", margin: "0 auto", marginBottom: "1rem" }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <DialogContent dividers>
                <div className="modal-content">
                    <Grid
                        container
                        direction={isDesktop ? 'row' : 'column'}
                        style={{ alignContent: 'center' }}
                        gap={4}
                    >
                        {searchNFTs && Array.isArray(searchNFTs) &&
                            searchNFTs.map((nft, index) => (
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