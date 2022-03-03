import React, {useState} from "react";
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import closeBtn from 'resource/detail/icon-times.svg';
import IconButton from '@material-ui/core/IconButton';
import { Grid } from '@material-ui/core';
import { useStyles } from "./style";

export default function PreventiveMeasureDialog(props) {
    const { 
      open = false, 
      list = [],
      onClose = () => null,
      precautionIconMap = {},
    } = props;
    const classes = useStyles();
    return (
         <Dialog
        open={open}
        scroll={'paper'}
        aria-labelledby="preventive-measure-title"
        aria-describedby="preventive-measure-description"
        classes={{
          paper: classes.paper,
          paperScrollPaper: classes.paperScrollPaper,
        }}
      >
        <DialogTitle
          classes={{
            root: classes.MuiDialogTitleRoot
          }}
        >
            <div className={classes.customPreventiveMeasureTitle}>
                <span className={classes.title}>預防措施種類</span>
                <IconButton onClick={() => {onClose && onClose()}} color="primary" className={classes.closeBtn} aria-label="upload picture" component="span">
                    <img src={closeBtn}/>
                </IconButton>
            </div>
            <Grid className={`${classes.dialogLabelBox} ${classes.baseFontSize}`} container >
              <Grid xs item>預防措施</Grid>
              <Grid xs item style={{textAlign: 'right'}}>提示</Grid>
            </Grid>
        </DialogTitle>
        <DialogContent 
         classes={{
          root: classes.MuiDialogContentRoot
        }}>
          <DialogContentText
            id="preventive-measure-dialog"
            tabIndex={-1}
          >
              {list.map((i,d) => {
                return (
                  <Grid key={d} className={`${classes.dialogItemBox} ${classes.baseFontSize}`} container >
                      <Grid xs item>{i.precaution_name}</Grid>
                      <Grid xs item style={{textAlign: 'right'}}>
                        <img className={classes.iconImage} src={precautionIconMap[i.precaution_id]} />
                      </Grid>
                  </Grid>
                )
              })}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    )
}