import { TextField } from "@mui/material";
import { useState } from "react";

export default function WalletInput(props) {
    const [inputVal, setInputVal] = useState("");

    function handleInput(input) {
        setInputVal(input);
        props.walletSetter(input);
    }

    return (
        <div>
            <TextField
                required
                label="Recepient Address"
                variant="filled"
                style={{ width: props.isDesktop ? "50%" : "80%", margin: "0 auto", marginBottom: "1rem", backgroundColor: "white" }}
                onChange={(e) => {
                    handleInput(e.target.value);
                }}
                helperText={!props.resolvedAddress && inputVal && "Must be ENS or wallet address."}
                error={!props.resolvedAddress && (inputVal != "")}
                disabled={!props.selectedNFT}
            />
            {props.selectedNFT &&
                <div style={{ padding: ".5rem" }}>
                    <p className="confirmation">"{props.selectedNFT.name}" will be gifted to:</p>
                    {props.resolvedAddress ?
                        <p className="confirmation"><i>{props.resolvedAddress}</i></p>
                        :
                        <p className="confirmation">...</p>
                    }
                </div>
            }
        </div>
    )
};