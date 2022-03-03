import React, {useCallback, useEffect, useState} from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core/styles";
import {Redirect, useHistory} from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import haLogo from "../../assets/img/ha_logo.gif";
import { FormService } from "../../services/FormService";
import hospWardList from "../../assets/files/hospital.json";
import LoadingBackdrop from "../../components/LoadingBackdrop";

import HAlogo from "../../assets/img/ha-45x45.png"

const useStyles = makeStyles((theme) => ({
    wrapper: {
        padding: theme.spacing(3)
    },
    displayBox: {
        padding: theme.spacing(3),
        backgroundColor: "white",
        borderRadius: 32,
        boxShadow: "1px 1px 8px 0px"
    },
    grid: {
        flexDirection: "column",
        alignItems: "center",
        maxWidth: theme.spacing(100),
        textAlign: "justify",
        marginRight: "auto",
        marginLeft: "auto"
    },
    description: {
        [theme.breakpoints.down("sm")]: {
            fontSize: "1rem"
        }
    },
    image: {
        maxWidth: "100%",
        maxHeight: "100%"
    },
    dialogButton: {
        fontSize: "18px",
        textTransform: "none",
        border: "1px solid",
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        marginLeft: theme.spacing(4),
        marginRight: theme.spacing(4),
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        paddingLeft: theme.spacing(5),
        paddingRight: theme.spacing(5)
    }
}));

const src_prefix = "data:image/png;base64,"
const ResultQRCodePage = () => {
    const classes = useStyles();
    const history = useHistory();
    const { generatedQrCode_base64, form, email } = history?.location?.state || {
        generatedQrCode_base64: "",
        form: {},
        email: ""
    };
//    const [hosp,setHosp] = useState(hospWardList.find(h => h.id == form.patHosp)) ;
    const [hosp,setHosp] = useState(hospWardList.filter(function (h) {
        return h.id == form.patHosp
   })[0]);
    // const hospName = hosp?.labelEN + " \n " + hosp?.labelTC ;

    const [src, setSrc] = useState(src_prefix + generatedQrCode_base64);

    const [visrEmailAddr, setVisrEmailAddr] = React.useState(email || "");
    const [confirmed, setConfirmed] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState([]);
    const [openSuccess, setOpenSuccess] = React.useState(false);
    const [dialogMessage, setDialogMessage] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const getTodayStr = useCallback(()=>{
        let today = new Date();
        return  `Generated on 產生於 (DD-MM-YYYY):  ${('0'+today.getDate()).slice(-2)}-${('0'+(today.getMonth()+1)).slice(-2)}-${today.getFullYear()} `
    });


    const handleChangeVisrEmailAddr = (event) => {
        setVisrEmailAddr(event.target.value);
        setConfirmed(false);
    };

    // const handleConfirm = (event) => {
    //     if (validate()) {
    //         setConfirmed(true);
    //     }
    // };

    const handleStay = (event) => {
        setOpenSuccess(false);
        setDialogMessage("");
        setVisrEmailAddr("");
    };

    const handleSubmit = async (event) => {
        setIsLoading(true);
        event.preventDefault();
        if (validate()) {
            const token = await window.grecaptcha.execute('6LevXaUZAAAAAN5Me3Y5_-uBfzbqs7BKt1amJFsh', {action: 'submit'})
            const data = { visrEmailAddr, token, ...form };
            const res = await FormService.sendQrCodeToEmail(data)
            if (res.status === 200 ){
                setOpenSuccess(true);
            } else{
                setDialogMessage(res.data?.error || "Server Error.")
            }
            // history.replace(); //clear history state
        }
        setIsLoading(false);
    };

    const handleClose = () => {
        history.push("/");
    };
    const handleEnter = (e)=>{
        e.preventDefault();
        // if(!confirmed) {
        //     handleConfirm();
        // }
    }
    const validate = () => {
        let errorMsgList = [];
        let error = false;

        if (!visrEmailAddr.trim()) {
            errorMsgList.visrEmailAddr = "required 必需填寫";
            error = true;
        }

        if (
            visrEmailAddr &&
            !visrEmailAddr.match(
                /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
        ) {
            errorMsgList.visrEmailAddr = "invalid email format 格式錯誤";
            error = true;
        }

        setErrorMsg(errorMsgList);
        return !error;
    };

    useEffect(()=>{
        return ()=>{
            history.replace(); //clear history state
        }
    },[])


    if (src === src_prefix){
        return <Redirect to={"/"} />
    }

    return (
        <div id="resultQRCode">
            <div className="page-top-heading">
                <img className="ha-logo" src={haLogo} alt="logo" />
                <span className="page-title">
                    Hospital Visit
                    <br />
                    醫院探訪
                </span>
            </div>
            <Grid container className={classes.wrapper} justify={"center"}>
                <LoadingBackdrop isShown={isLoading}/>
                <div className={classes.displayBox}>
                    {/*<Grid container className={classes.grid}>*/}
                    <Grid item xs={12} >
                        <Typography variant={"subtitle1"} style={{maxWidth:800}}>
                            {"Dear Visitor,"}
                            <br />
                            {
                                "The input of health declaration form was successful. Please print, save or capture the QR code, and present the QR code to our staff during hospital visit. This QR code is only valid for today ("
                            }
                            <b>
                                <u>{"expired at 23:59 of input date"}</u>
                            </b>
                            {"). Once the QR code expired, please input the visit information again."}
                            <br />
                            {"你好，"}
                            <br />
                            {
                                "已成功填寫健康申報表, 請自行列印或存取此二維碼, 訪客必須在探訪登記時出示以下二維碼。此二維碼只會在當天有效(並於"
                            }
                            <b>
                                <u>{"當日23時59分到期"}</u>
                            </b>
                            {")。過期後, 請再填寫探訪資訊。"}
                        </Typography>
                        <Grid container alignItems={"center"} style={{display:"flex"}}>
                            <img  src={HAlogo} alt="logo" />
                            <Typography style={{padding:"15px 10px 10px"}}>
                                Visit Hospital: {hosp?.labelEN}
                                <br/>
                                探訪醫院: {hosp?.labelTC}
                            </Typography>
                        </Grid>

                        <img
                            src={src}
                            className={classes.image}
                            alt="QR Code is not available"
                        />

                        <Typography variant={"subtitle2"}>{getTodayStr()} </Typography>
                        <br />
                        <form
                            id="emailForm"
                            name="emailForm"
                            onSubmit={handleEnter}
                            style={{ width: "inherit" }}
                        >
                            <Grid container spacing={2}>
                                {/* 1 - Patient Information */}
                                <Grid item xs={12}>
                                    <div>
                                        <Typography>Or Send QR Code to 或傳送二維碼到</Typography>
                                    </div>
                                    <Grid item xs  spacing={2}>
                                        <Grid  xs  direction="column">
                                            <Grid item xs>
                                                <Typography>
                                                    <span className="star">*</span>
                                                    Email 電郵
                                                </Typography>
                                            </Grid>
                                            <Grid item  spacing={2}>
                                                <Grid item xs={12} md>
                                                    <TextField
                                                        id="visrEmailAddr"
                                                        name="visrEmailAddr"
                                                        value={visrEmailAddr}
                                                        onChange={handleChangeVisrEmailAddr}
                                                        error={!!errorMsg.visrEmailAddr}
                                                        helperText={errorMsg.visrEmailAddr ?? ""}
                                                        variant="outlined"
                                                        size="small"
                                                        className={classes.textField}
                                                        inputProps={{ maxLength: 40 }}
                                                        style={{ width: "100%" }}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={4} container direction="column">
                                                    <br/>
                                                    <Button
                                                        id="submitBtn"
                                                        name="submitBtn"
                                                        variant="contained"
                                                        color="primary"
                                                        className={classes.submitButton}
                                                        onClick={handleSubmit}
                                                    >
                                                        {/*Confirm Email 確認電郵*/}
                                                        Send Email 傳送電郵
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        </Grid>

                                        {/* {confirmed ? (
                                            <Grid item  spacing={2}>
                                                <Grid item xs={12}>
                                                    <br />
                                                    <Typography variant={"subtitle1"}>
                                                        <b>Confirm email to 確認電郵至: {visrEmailAddr}</b>
                                                        <br />
                                                        QR Code email will be sent by{" "}
                                                        <a
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href="mailto:havis@ha.org.hk"
                                                        >
                                                            havis@ha.org.hk
                                                        </a>
                                                        . If you do not receive the e-mail, please check
                                                        your spam folder.
                                                        <br />
                                                        二維碼電郵會經由
                                                        <a
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href="mailto:havis@ha.org.hk"
                                                        >
                                                            havis@ha.org.hk
                                                        </a>
                                                        發出. 如未能收取電郵,請查看你的垃圾信件匣.
                                                    </Typography>
                                                </Grid>
                                                <Grid
                                                    item
                                                    xs={3}
                                                    implementation="css"
                                                    xsDown
                                                    component={Hidden}
                                                />
                                                <Grid item xs={12} md={6}  direction="column">
                                                    <br/>
                                                    <Button
                                                        id="submitBtn"
                                                        name="submitBtn"
                                                        // type="submit"
                                                        variant="contained"
                                                        color="primary"
                                                        className={classes.submitButton}
                                                        onClick={handleSubmit}
                                                    >
                                                        Send Email 傳送電郵
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        ) : (
                                            ""
                                        )}*/}
                                    </Grid>
                                </Grid>
                            </Grid>
                        </form>
                        <br />
                        <Link to={"/"} align={"center"}>
                            <Typography variant={"caption"}>
                                Return to input health declaration form
                            </Typography>
                            <br />
                            <Typography variant={"caption"}>重新填寫健康申報表</Typography>
                        </Link>
                        <br />
                        <br />

                        <Dialog open={openSuccess} onClose={handleClose} disableBackdropClick={true}>
                            <DialogContent>
                                <DialogContentText
                                    id="alert-dialog-description"
                                    style={{
                                        fontSize: "24px",
                                        color: "green",
                                        padding: "0 10px"
                                    }}
                                >
                                    Email sent to
                                    <br />
                                    電郵已發送至:
                                    <br />
                                    {visrEmailAddr}
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions style={{ justifyContent: "center" }}>
                                <Button
                                    color="primary"
                                    onClick={handleStay}
                                    autoFocus
                                    className={classes.dialogButton}
                                >
                                    OK
                                    <br />
                                    確認
                                </Button>
                            </DialogActions>
                        </Dialog>
                        <Dialog open={!!dialogMessage} onClose={handleStay} disableBackdropClick>
                            {/* <DialogTitle id="alert-dialog-title" className={classes.dialogTitle}>
	                  Confirmation
	                </DialogTitle> */}
                            <DialogContent>
                                <DialogContentText
                                    id="alert-dialog-description"
                                    style={{
                                        fontSize: "24px",
                                        color: "red",
                                        padding: "0 10px"
                                    }}
                                >
                                    {dialogMessage}
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions style={{ justifyContent: "center" }}>
                                <Button
                                    color="primary"
                                    onClick={handleStay}
                                    autoFocus
                                    className={classes.dialogButton}
                                >
                                    OK
                                    <br />
                                    確認
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Grid>
                </div>
            </Grid>
        </div>
    );
};
export default ResultQRCodePage;
