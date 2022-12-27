import { Grid } from "@mui/material"
import Gift from "../public/new-gift.svg"
export function PresentCard(props) {
    const address = "0x69EC014c15baF1C96620B6BA02A391aBaBB9C96b";
    const truncatedAddress = address.substring(0, 4) + "..." + address.slice(-4);

    return (
        <Grid item xs={3}>
            <div className="gift-card">
                <div
                    style={{ cursor: "pointer" }}
                    onClick={() => props.unwrap(props.nft.token_id)}
                >
                    <Gift width="200px" height="200px" />
                </div>
                <p className="body">Present {props.nft.token_id}</p>
                <p className="body">From
                    <a
                        style={{ textDecoration: "none", marginLeft: ".3rem" }}
                        target="_blank"
                        href={`https://goerli.etherscan.io/addess/${address}`}
                        rel="noopener noreferrer">
                        {truncatedAddress}
                    </a>
                </p>
                {/* Add a tooltip for date */}
                <p className="body">12/25/22</p>
            </div>
        </Grid>
    )
};