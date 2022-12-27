import { Grid } from "@mui/material"
import Gift from "../public/new-gift.svg"
export function PresentCard(props) {
    return (
        <Grid item xs={3}>
            <div onClick={() => props.unwrap(props.nft.token_id)}>
                <Gift width="200px" height="200px" />
                <p className="body">this is my gift {props.nft.token_id}</p>
            </div>
        </Grid>
    )
};