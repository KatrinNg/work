import React, {useState, useEffect} from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useStyles } from "./style";
import { Grid } from "@material-ui/core";
import ColorButton from 'components/ColorButton/ColorButton';
import PropTypes from 'prop-types';

export default function ConfirmFinishDialog(props) {
    const classes = useStyles();
    const {
        open = false,
        onClose = () => null,
        onConfirm = () => null,
        text = '治療',
        config = {
            currentTreatment: null,
            startTreatment: null
        }
    } = props;
    const {
        currentTreatment,
        startTreatment,
    } = config;

    const onModalClick = () => {
        onClose && onClose(false);
    }

    const onClickToConfirm = () => {
        onConfirm && onConfirm(config);
        onClose && onClose(false);
    }

    // useEffect(() => {
    //     setHandleOpen(open);
    // })

    return (
        <Dialog 
        classes={{
            paperScrollPaper: classes.paperScrollPaper
        }}
        className='confirm-finish-dialog-main-box' 
        open={open} onClose={onModalClick} 
        aria-labelledby="form-dialog-title">
            <DialogTitle
            classes={{
                root: classes.MuiDialogTitleRoot
            }}
            id="form-dialog-title">
                <Grid container>
                    {startTreatment && <Grid className={classes.confirmFinishTitle} item container justifyContent="center">開始{text} {startTreatment.treatment_seq}</Grid>}
                    {currentTreatment && <><Grid className={classes.confirmFinishSecTitle} item container justifyContent="center">結束以下{text}：</Grid>
                    <Grid className={classes.confirmFinishSecTitle} item container justifyContent="center">{currentTreatment.treatment_name}</Grid></>}
                </Grid>
            </DialogTitle>
            <DialogContent
                classes={{
                    root: classes.MuiDialogContentRoot
                }}
            >
                <DialogContentText>
                    <ColorButton
                        className={classes.confirmBtn}
                        variant="contained"
                        color="primary"
                        style={{width: '100%', height: 40, marginBottom: 10}}
                        onClick={() => {onClickToConfirm()}}>
                        確認{currentTreatment ? '結束' :'開始'}{text} {currentTreatment?currentTreatment.treatment_seq: startTreatment.treatment_seq}
                    </ColorButton>
                    <ColorButton
                        className={classes.confirmBtn}
                        variant="contained"
                        color="cancel"
                        style={{width: '100%', height: 40}}
                        onClick={() => {onModalClick()}}>
                        返回
                    </ColorButton>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}

ConfirmFinishDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
}