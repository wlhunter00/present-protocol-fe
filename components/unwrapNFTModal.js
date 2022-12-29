import { Dialog, DialogTitle, DialogContent, CircularProgress, Chip, Alert, AlertTitle } from "@mui/material";
import { Check, Error, Pause, Close } from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import ConfettiAnimation from "./confetti";
import { useState, useEffect } from "react";
import Image from "next/image";
import wrapGIF from '../public/box-shake.gif';
import GiftLogo from '../public/gift.svg';
import OpenSea from '../public/opensea.png';

export default function UnwrapNFTModal(props) {
    const isDesktop = useMediaQuery("(min-width:600px)");
    const [triggerConfetti, setTriggerConfetti] = useState(false);

    // const [transactionID, setTransactionID] = useState("");

    // useEffect(() => {
    //     if (props.successData) {
    //         console.log(props.successData.events[3]);
    //         console.log("sent to:", props.successData.events[3].args['_receiver']);
    //         setrecieverAddress(props.successData.events[3].args['_receiver']);
    //         console.log("gift number:", props.successData.events[3].args['_presentId'].toNumber());
    //         setGiftID(props.successData.events[3].args['_presentId'].toNumber());
    //         setTransactionID(props.successData.transactionHash);
    //     }
    // }, [props.successData])

    useEffect(() => {
        if (props.unwrapStatus === "success") {
            setTriggerConfetti(true);
            setTimeout(() => setTriggerConfetti(false), 3000);
        }
    }, [props.unwrapStatus])

    return (
        <Dialog
            open={props.unwrapModal}
            onClose={props.handleClose}
            scroll={"paper"}
            style={{ textAlign: "center" }}
            fullWidth={isDesktop}
            maxWidth={"lg"}
        >
            <div style={{ backgroundColor: "rgb(251, 251, 251)" }}>
                <DialogTitle>{props.unwrapStatus === "success" ? "Opened your Gift!" : "Opening your Gift"}</DialogTitle>
                {(props.unwrapStatus === "error" || props.unwrapStatus === "success") &&
                    <div className="close-button" onClick={props.handleClose}>
                        <Close />
                    </div>
                }
                <DialogContent dividers>
                    <div className="modal-content">
                        {props.unwrapStatus === "error" &&
                            <Alert severity="error" variant="filled" className={isDesktop ? "error-alert w-30" : "error-alert w-15"}>
                                <AlertTitle>Error</AlertTitle>
                                {props.errorMessage.split("(")[0]}
                            </Alert>
                        }
                        {props.unwrapStatus != "success" &&
                            <Image
                                src={wrapGIF}
                                width={isDesktop ? 400 : 312}
                                height={isDesktop ? 300 : 250}
                                alt={"Unwrapping GIF"}
                            />
                        }
                        {props.unwrapStatus === "success" &&
                            <div style={{ margin: "2rem" }}>
                                <h2>Present Sucessfully Unwrapped!</h2>
                                <GiftLogo style={{ height: "150px", width: "150px" }} />
                                {/* TODO - change etherscan link */}
                                {/* <a
                                    className="success-link"
                                    target="_blank"
                                    href={`https://goerli.etherscan.io/address/${recieverAddress}`}
                                    rel="noopener noreferrer"
                                >
                                    <p className="confirmation">{recieverAddress}</p>
                                </a>
                                <p className="confirmation">Recieved
                                    <a
                                        className="success-link"
                                        target="_blank"
                                        href={`https://testnets.opensea.io/assets/goerli/0x04bb356146fc2c760d88614b51da38429b9cb6c6/${giftID}`}
                                        rel="noopener noreferrer"
                                        style={{ marginLeft: ".3rem" }}
                                    >
                                        Gift #{giftID}
                                    </a>
                                </p>
                                <a
                                    className="success-link"
                                    target="_blank"
                                    href={`https://testnets.opensea.io/assets/goerli/0x04bb356146fc2c760d88614b51da38429b9cb6c6/${giftID}`}
                                    rel="noopener noreferrer"
                                    style={{ marginLeft: ".3rem" }}
                                >
                                    <Image
                                        src={OpenSea}
                                        width={50}
                                        height={50}
                                        alt="opensea"
                                    />
                                </a>
                                <a
                                    className="success-link"
                                    target="_blank"
                                    href={`https://goerli.etherscan.io/tx/${transactionID}`}
                                    rel="noopener noreferrer"
                                >
                                    <p style={{ marginTop: "1rem" }} className="confirmation">Transaction Confirmation</p>
                                </a> */}
                            </div>
                        }
                        <div style={{ margin: ".5rem" }}>
                            <Chip
                                icon={
                                    <>
                                        {props.unwrapStatus === "info" &&
                                            <CircularProgress
                                                size={30}
                                                sx={{
                                                    color: "white",
                                                }}
                                            />
                                        }
                                        {props.unwrapStatus === "success" &&
                                            <Check />
                                        }
                                        {props.unwrapStatus === "default" &&
                                            <Pause />
                                        }
                                        {props.unwrapStatus === "error" &&
                                            <Error />
                                        }
                                    </>

                                }
                                color={props.unwrapStatus}
                                label="Opening Present"
                                sx={{ fontSize: "x-large", padding: "1.5rem" }}
                            />
                        </div>
                    </div>
                    {triggerConfetti && <ConfettiAnimation />}
                </DialogContent>
            </div>
        </ Dialog>
    )
};