import React from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import { Typography, Grid, makeStyles, IconButton, DialogContent, DialogTitle } from '@material-ui/core';
import { CloseRounded } from '@material-ui/icons';
import ColorButton from 'components/ColorButton/ColorButton';


export default function PopupDialog(props) {
    const { open, id, title, content, topCloseBtn, closeAction, maxWidth, style, leftBtn, leftAction, rightBtn, rightAction,  dialogActionsDirection, leftStyle, rightStyle, ...rest } = props;


    const useStyles = makeStyles((theme) => ({
        title: {
            fontSize: topCloseBtn ? "18px" : "16px",
            fontWeight: 600,
            color: topCloseBtn ? "#39ad90" : "#000000",
        },
        closeBtnBg: {
            margin: "-20px"

        },
        ".MuiDialogTitle-root": {
            padding: "5px"
        },
        content: {
            "&.MuiDialogContent-root": {
                paddingLeft: "0px",
                paddingRight: "0px"
            }
        },
        dialogActions: {
            "&.MuiDialogActions-spacing > :not(:first-child)": dialogActionsDirection === "column" && {
                marginLeft: "0px"
            },
            display: "flex",
            paddingLeft: "0",
            flexDirection: dialogActionsDirection,
            paddingRight: "0",
            paddingBottom: dialogActionsDirection === "column" ? "30px" : "21px",
            justifyContent: leftBtn && rightBtn ? "space-between" : "center",
        },
        leftBtnStyle: {
            width: leftBtn && rightBtn && dialogActionsDirection !== "column" ? "120px" : "258px",
            borderRadius: "10px",
        },
        rightBtnStyle: {
            width: leftBtn && rightBtn && dialogActionsDirection !== "column" ? "120px" : "258px",
            borderRadius: "10px",
        }

    }));

    const classes = useStyles();
    const [scroll, setScroll] = React.useState('body');

    const paperStyle = {
        borderRadius: 10,
        padding: 0,
        maxWidth: maxWidth,
        minWidth:"296px",   //265
        paddingLeft: "18px",
        paddingRight: "18px",
        paddingTop:"5px",
        background: "#f8f8f8",
        margin:0,
        ...style
    }
    return (
        <Dialog
            open={open}
            aria-labelledby={`${id}_popup_dialog_title`}
            scroll={scroll}
            fullWidth={true}
            PaperProps={{
                style: paperStyle
            }}
            {...rest}
        >

            <DialogTitle id={`${id}_dialog_title`} style={{paddingBottom:"0"}}>
                <Grid container justifyContent={"center"} spacing={2}>
                    <Grid item className={classes.title}>{title}</Grid>
                    {topCloseBtn && <div style={{position:"absolute", right:25, top:18}}>
                        <IconButton
                            className={classes.closeBtnBg}
                            aria-label="close"
                            onClick={closeAction}
                            sx={{
                                position: 'absolute',

                            }}
                        >
                            <CloseRounded />
                        </IconButton>
                    </div>}




                </Grid></DialogTitle>



            <DialogContent dividers={false} className={classes.content}>
                <Typography component="div" style={{ color: 'rgba(0, 0, 0, 0.87)', minWidth: "200px", marginBottom: '12px' }}>
                    {content}
                </Typography>
            </DialogContent>

            {
                ((leftBtn && leftAction) || (rightBtn && rightAction)) &&
                <DialogActions className={classes.dialogActions} >
                    {leftBtn &&
                        <ColorButton
                            className={classes.leftBtnStyle}
                            variant="contained"
                            color="primary"
                            onClick={leftAction}
                            style={leftStyle}
                        >
                            {leftBtn}
                        </ColorButton>
                    }

                    {leftBtn && rightBtn && dialogActionsDirection === "column" &&
                        <div style={{ height: "10px" }}></div>}


                    {rightBtn &&

                        <ColorButton
                            className={classes.rightBtnStyle}
                            variant="contained"
                            color="primary"
                            onClick={rightAction}
                            style={rightStyle}
                        >
                            {rightBtn}
                        </ColorButton>

                    }


                </DialogActions>
            }
        </Dialog >
    );
}