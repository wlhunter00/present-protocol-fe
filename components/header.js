import { DynamicWidget } from '@dynamic-labs/sdk-react';
import Image from 'next/image';
import GiftLogo from '../public/gift.svg';

// TODO: mobile friendly header

export function Header() {
    return (
        <header
            style={{
                marginTop: '1rem',
                paddingLeft: "10rem",
                paddingRight: "10rem",
                paddingBottom: '.5rem',
            }}
        >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <GiftLogo />
                <DynamicWidget buttonClassName="custom-connect-button" innerButtonComponent="Connect Wallet" />
            </div>
        </header>
    )
};