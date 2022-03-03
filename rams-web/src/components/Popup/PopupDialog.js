import React from "react";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import { Typography, Grid, makeStyles, IconButton, DialogContent, DialogTitle } from '@material-ui/core';
import { CloseRounded } from '@material-ui/icons';
import ColorButton from 'components/ColorButton/ColorButton';


export default function PopupDialog(props) {
    const { open, id, title, content, topCloseBtn, closeAction, maxWidth, style, leftBtn, leftAction, rightBtn, rightAction, handheld, dialogActionsDirection, leftStyle, rightStyle, ...rest } = props;


    const useStyles = makeStyles((theme) => ({
        title: {
            fontSize: '18px',
            fontWeight: 600,
        },
        closeBtnBg: {
            margin: "-20px"

        },
        ".MuiDialogTitle-root": {
            padding: "5px"
        },
        content: {
            "&.MuiDialogContent-root": {
                paddingLeft: dialogActionsDirection == "column" ? "4px" : "0px"
            }
        },
        dialogActions: {
            "&.MuiDialogActions-spacing > :not(:first-child)": dialogActionsDirection == "column" && {
                marginLeft: "0px"
            },
            display: "flex",
            paddingLeft: "0",
            flexDirection: dialogActionsDirection,
            paddingRight: "0",
            paddingBottom: dialogActionsDirection == "column" ? "30px" : "21px",
            justifyContent: leftBtn && rightBtn ? "space-between" : "center",
        },
        leftBtnStyle: {
            width: leftBtn && rightBtn && dialogActionsDirection != "column" ? "120px" : "252px",
            borderRadius: "10px",
        },
        rightBtnStyle: {
            width: leftBtn && rightBtn && dialogActionsDirection != "column" ? "120px" : "252px",
            borderRadius: "10px",
        }

    }));

    const classes = useStyles();
    const [scroll, setScroll] = React.useState('body');

    const paperStyle = {
        borderRadius: 10,
        padding: 0,
        maxWidth: maxWidth,
        paddingLeft: handheld && "18px",
        paddingRight: handheld && "18px",
        background: handheld ? "#f8f8f8" : "#ffffff",
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

            <DialogTitle id={`${id}_dialog_title`}>
                <Grid container justifyContent={topCloseBtn ? "space-between" : "center"} spacing={2}>
                    <Grid item className={classes.title}>{title}</Grid>
                    {topCloseBtn && <Grid item>
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
                    </Grid>}




                </Grid></DialogTitle>



            <DialogContent dividers={false} className={handheld && classes.content}>
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

                    {leftBtn && rightBtn && dialogActionsDirection == "column" &&
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