import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {Dialog,DialogTitle} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import {style} from './EnquiryDialogCss';
import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';

function PaperComponent(props) {
  return (
    <Draggable enableUserSelectHack={false}
        onStart={(e)=>{
      return e.target.getAttribute('customdrag') === 'allowed';
    }}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class EditEnquiryDialog extends Component {
    render() {
        const { classes } = this.props;
        return (
            <Dialog
                aria-describedby="alert-dialog-description"
                aria-labelledby="alert-dialog-title"
                classes={{
                    paper: classes.paper
                }}
                id={this.props.id}
                onClose={this.props.onClose}
                open={this.props.open}
                PaperComponent={PaperComponent}
                scroll="body"
                onEscapeKeyDown={this.props.onEscapeKeyDown}
            >
               <DialogTitle
                   className={classes.dialogTitle}
                   id={this.props.id + 'Title'}
                   disableTypography customdrag="allowed"
               >
                {this.props.dialogTitle}
              </DialogTitle>
              <Typography component="div" variant="body3" className={classes.dialogText}>
                {this.props.children}
              </Typography>
            </Dialog>
        );
    }
}

export default withStyles(style)(EditEnquiryDialog);