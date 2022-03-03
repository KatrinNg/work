import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import {
    Grid
} from '@material-ui/core';
import { useStyles } from './styles';
import {
    messageType
} from 'constants/MessageList';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
// import CloseIcon from '@material-ui/icons/Close';
import buttonCloseBtn from 'resource/Icon/demo-icon/button-close-btn.svg'
import ColorButton from 'components/ColorButton/ColorButton';

export default function CustomizedDialogs(props) {
    const { g_open, setOpen, g_messageInfo} = props;
    
    const classes = useStyles();

    const isError = g_messageInfo?.messageType === 'error' ? true : false;

    const handleClose = () => {
        setOpen(false, null)
    }

    const handleBtn1Click = () => {
        typeof g_messageInfo?.btn1Action === 'function' && g_messageInfo.btn1Action();
        handleClose();
    }

    const handleBtn2Click = () => {
        typeof g_messageInfo?.btn2Action === 'function' && g_messageInfo.btn2Action();
        handleClose();
    }
    return (
        <Dialog
            // fullWidth
            open={g_open}
            // backdropclick={true}
            disableEscapeKeyDown={true}
            TransitionComponent={'none'}
            
        >
            <Grid container className={classes.messageBox}>
                {/* <Grid item lg={1} md={1} sm={1} xs={1} ></Grid> */}
                <Grid 
                    item 
                    container
                    justifyContent="space-between" 
                    direction="column" 
                    className={classes.messageContentBox}>
                    <Grid  container justifyContent='flex-end' className={classes.messageTitle}>
                        <IconButton onClick={handleClose}>
                            <img src={buttonCloseBtn} width={28} height={28}/>
                        </IconButton>
                    </Grid>
                    <Grid container justifyContent="center" style={{padding: '0 15px'}}><Typography className={classes.messageDetail}>{g_messageInfo?.message}</Typography></Grid>
                    <Grid container className={classes.messageAction} justifyContent="center">
                        {g_messageInfo?.btn1Label &&
                            <Grid item style={{ paddingRight: '5px' }}>
                                <ColorButton className={`${classes.messageButton}`} id={'msg_btn1'} onClick={handleBtn1Click} variant={'contained'} color={ 'cancel'}>
                                    {g_messageInfo.btn1Label}
                                </ColorButton>
                            </Grid>
                        }
                        {g_messageInfo?.btn2Label &&
                            <Grid item>
                                <ColorButton className={`${classes.messageButton}`} id={'msg_btn2'} onClick={handleBtn2Click} variant={'contained'} color={isError ?'error' :'primary'}>
                                    {g_messageInfo.btn2Label}
                                </ColorButton>
                            </Grid>
                        }
                    </Grid>
                </Grid>
            </Grid>
        </Dialog>
    );
}