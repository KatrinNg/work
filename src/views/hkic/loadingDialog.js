import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import LinearProgress from '@material-ui/core/LinearProgress';
import * as messageUtilities from '../../utilities/messageUtilities';

class LoadingDialog extends React.Component {
  // state = {
  //   open: false
  // };

  // handleClickOpen = () => {
  //   this.setState({ open: true });
  //   setTimeout(()=>{
  //       this.handleClose();
  //       this.props.succe();
  //   },1000);
  // };

  // handleClose = () => {
  //   this.setState({ open: false });
  // };
  idConfig=this.props.id!=null?{
    dialogId:{id:this.props.id},
    dialogCancelButton:{id:this.props.id+'ActionsButton'}
  }:{};

  render() {
    return (
      <div>
        <Dialog
            {...this.idConfig.dialogId}
            open={this.props.open}
            //onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{messageUtilities.getMessageDescriptionByMsgCode('110107')}</DialogTitle>
          <DialogContent>
            <LinearProgress />
          </DialogContent>
          <DialogActions>
            <Button {...this.idConfig.dialogCancelButton} onClick={this.props.cancel}  style={{textTransform: 'none'}} color="primary" autoFocus>
                Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default LoadingDialog;