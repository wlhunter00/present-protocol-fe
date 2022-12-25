import { DynamicWidget } from '@dynamic-labs/sdk-react';
import GiftLogo from '../public/gift.svg';
import useMediaQuery from "@mui/material/useMediaQuery";

export function Header() {
    const isDesktop = useMediaQuery("(min-width:600px)");

    const styles = {
        marginTop: '1rem',
        paddingLeft: isDesktop ? "10rem" : "1.5rem",
        paddingRight: isDesktop ? "10rem" : "1.5rem",
        marginBottom: ".5rem"
    }

    return (
        <header
            style={styles}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <GiftLogo />
                <DynamicWidget buttonClassName="custom-connect-button" innerButtonComponent="Connect Wallet" />
            </div>
        </header>
    )
};