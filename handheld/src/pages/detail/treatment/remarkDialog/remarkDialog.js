import React, {useState, useEffect} from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useStyles } from "./style";
import { Grid } from "@material-ui/core";
import TextField from '@material-ui/core/TextField';
import ColorButton from 'components/ColorButton/ColorButton';
import PropTypes from 'prop-types';
export default function RemarkDialog(props) {
    const classes = useStyles();
    const {
        open = false,
        onClose = () => null,
        onConfirm = () => null,
        remark = ''
    } = props;
    const [remarkText, setRemarkText] = useState(remark);

    const onModalClick = () => {
        setRemarkText('')
        onClose && onClose(false);
    }

    const onClickToConfirm = () => {
        
        onConfirm && onConfirm(remarkText);
        onClose && onClose(false);
        setRemarkText('')
    }

    return (
        <Dialog 
            classes={{
                paperScrollPaper: classes.paperScrollPaper,
            }}
            className='remark-dialog-main-box' 
            open={open} onClose={onModalClick} 
            aria-labelledby="form-dialog-title">
            <DialogTitle 
             classes={{
                root: classes.MuiDialogTitleRoot
              }}
            id="form-dialog-title">
                <Grid container>
                    <Grid className={classes.remarkTitle} item container justifyContent="center">備註</Grid>
                    <Grid className={classes.remarkSecTitle} item container justifyContent="center">備註會可以於摘要內查閱:</Grid>
                </Grid>
            </DialogTitle>
            <DialogContent
                classes={{
                    root: classes.MuiDialogContentRoot
                }}
            >
                <DialogContentText>
                <TextField
                    id="remark-text-field"
                    label=""
                    value={remarkText}
                    placeholder=""
                    className={`${classes.remarkTextField} remark-text-field`}
                    rows={3}
                    onChange={(e) => {setRemarkText(e.target.value)}}
                    multiline
                    variant="outlined"
                    />
                      <ColorButton
                    className={classes.confirmBtn}
                    variant="contained"
                    color="primary"
                    style={{width: '100%', height: 40}}
                    onClick={(e) => {onClickToConfirm(e)}}
                >
                    確認
                </ColorButton>
                </DialogContentText>
            </DialogContent>
        </Dialog>
    )
}

RemarkDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
    remark: PropTypes.string,
}