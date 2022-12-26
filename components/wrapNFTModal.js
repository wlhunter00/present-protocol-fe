import { Dialog, DialogTitle, DialogContent, CircularProgress, Chip, Alert, AlertTitle } from "@mui/material";
import { Check, Error, Pause, Close } from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function WrapNFTModal(props) {
    const isDesktop = useMediaQuery("(min-width:600px)");

    return (
        <Dialog
            open={props.wrapModal}
            onClose={props.handleClose}
            scroll={"paper"}
            style={{ textAlign: "center" }}
            fullWidth={isDesktop}
            maxWidth={"lg"}
        >
            <DialogTitle>Wrapping your Gift</DialogTitle>
            {(props.approvalStatus === "error" || props.wrapStatus === "error" || props.wrapStatus === "success") &&
                <div className="close-button" onClick={props.handleClose}>
                    <Close />
                </div>
            }
            <DialogContent dividers>
                <div className="modal-content">
                    {(props.approvalStatus === "error" || props.wrapStatus === "error") &&
                        <Alert severity="error" variant="filled" className={isDesktop ? "error-alert w-30" : "error-alert w-15"}>
                            <AlertTitle>Error</AlertTitle>
                            {props.errorMessage.split("(")[0]}
                        </Alert>
                    }
                    <div style={{ margin: ".5rem" }}>
                        <Chip
                            icon={
                                <>
                                    {props.approvalStatus === "info" &&
                                        <CircularProgress
                                            size={30}
                                            sx={{
                                                color: "white",
                                            }}
                                        />
                                    }
                                    {props.approvalStatus === "success" &&
                                        <Check />
                                    }
                                    {props.approvalStatus === "default" &&
                                        <Pause />
                                    }
                                    {props.approvalStatus === "error" &&
                                        <Error />
                                    }
                                </>

                            }
                            color={props.approvalStatus}
                            label="Approval to Move NFT"
                            sx={{ fontSize: "x-large", padding: "1.5rem" }}
                        />
                    </div>
                    <div style={{ margin: ".5rem", marginTop: "1rem" }}>
                        <Chip
                            icon={
                                <>
                                    {props.wrapStatus === "info" &&
                                        <CircularProgress
                                            size={30}
                                            sx={{
                                                color: "white",
                                            }}
                                        />
                                    }
                                    {props.wrapStatus === "success" &&
                                        <Check />
                                    }
                                    {props.wrapStatus === "default" &&
                                        <Pause />
                                    }
                                    {props.wrapStatus === "error" &&
                                        <Error />
                                    }
                                </>

                            }
                            color={props.wrapStatus}
                            label="Wrapping the NFT"
                            sx={{ fontSize: "x-large", padding: "1.5rem" }}
                        />
                    </div>
                </div>
            </DialogContent>
        </ Dialog>
    )
};