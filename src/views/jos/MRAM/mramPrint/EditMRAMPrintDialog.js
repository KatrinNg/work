import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {Dialog,DialogTitle} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import {style} from '../mramHistory/css/mramHistoryDialogCss';
import Draggable from 'react-draggable';
import Paper from '@material-ui/core/Paper';

function PaperComponent(props) {
  return (
    <Draggable enableUserSelectHack={false}
        onStart={(e)=> e.target.getAttribute('customdrag') === 'allowed'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class EditMRAMPrintDialog extends Component {
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
            >
               <DialogTitle
                   className={classes.dialogTitle}
                   id={this.props.id + 'Title'}
                   disableTypography customdrag="allowed"
               >
                {this.props.dialogTitle}
              </DialogTitle>
                <FormControl className={classes.formControlCss}
                    style={this.props.formControlStyle}
                >
                    <FormControl className={classes.formControl2Css}
                        {...this.props.dialogContentProps}
                    >
                        {this.props.children}
                    </FormControl>
                </FormControl>
            </Dialog>
        );
    }
}

export default withStyles(style)(EditMRAMPrintDialog);