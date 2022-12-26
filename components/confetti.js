import { useWindowSize } from '@react-hook/window-size'
import Confetti from 'react-confetti';
import useMediaQuery from "@mui/material/useMediaQuery";

export default function ConfettiAnimation() {
    const isDesktop = useMediaQuery("(min-width:600px)");
    const [width, height] = useWindowSize();
    // todo - fix height
    return (
        <Confetti
            width={isDesktop ? "1150rem" : "300rem"}
            height={height}
        />
    )
};