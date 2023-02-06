import { DynamicWidget } from '@dynamic-labs/sdk-react';
import Gift from "../public/new-gift.svg";

import useMediaQuery from "@mui/material/useMediaQuery";

export function Header() {
    const isDesktop = useMediaQuery("(min-width:600px)");

    const styles = {
        marginTop: '1rem',
        paddingLeft: isDesktop ? "10rem" : "1.5rem",
        paddingRight: isDesktop ? "10rem" : "1.5rem",
        marginBottom: ".5rem"
    }
    // TODO: figure out how to have the warning about being on the wrong chain

    return (
        <header
            style={styles}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Gift width="75px" height="75px" />
                <DynamicWidget buttonClassName="custom-connect-button" innerButtonComponent="Connect Wallet" />
            </div>
        </header>
    )
};