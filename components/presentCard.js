import { Grid } from "@mui/material";
import Gift from "../public/new-gift.svg";
import { Redeem, Send } from "@mui/icons-material";
import dayjs from "dayjs";
import { useState, useEffect } from "react";

export function PresentCard(props) {
    const [truncatedAddress, setTruncatedAddress] = useState("");
    const [canUnwrap, setCanUnwrap] = useState(false);

    const address = props.nft.from;
    const unwrapDate = dayjs.unix(props.nft.unwrapDate);

    useEffect(() => {
        setTruncatedAddress(address.substring(0, 4) + "..." + address.slice(-4));
        if (unwrapDate > dayjs()) {
            setCanUnwrap(false);
        }
        else {
            setCanUnwrap(true);
        }
    }, []);

    return (
        <Grid item xs={3}>
            <div className="gift-card highlight-hover">
                <div
                    style={{ cursor: "pointer" }}
                    onClick={() => props.unwrap(props.nft.token_id, canUnwrap)}
                >
                    <Gift width="200px" height="200px" />
                </div>
                <p className="gift-text">Present {props.nft.token_id}</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", color: "blue" }}>
                    <Send />
                    <p className="gift-text no-cursive">
                        <a
                            style={{ textDecoration: "none", marginLeft: ".3rem" }}
                            target="_blank"
                            href={`https://goerli.etherscan.io/address/${address}`}
                            rel="noopener noreferrer">
                            {truncatedAddress}
                        </a>
                    </p>
                </div>
                {/* Add a tooltip for date */}
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }} className={canUnwrap ? "can-unwrap" : "cant-unwrap"}>
                    <Redeem />
                    <p className="gift-text no-cursive" style={{ margin: ".5rem" }}>{unwrapDate.format('MM/DD/YY')}</p>
                </div>
            </div>
        </Grid>
    )
};