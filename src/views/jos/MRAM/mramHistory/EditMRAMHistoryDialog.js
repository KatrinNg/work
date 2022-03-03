import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {Dialog,DialogTitle} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import {style} from './css/mramHistoryDialogCss';
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

class EditMRAMHistoryDialog extends Component {
    render() {
        const { classes, dialogTitle, ...rest } = this.props;
        return (
            <Dialog
                aria-describedby="alert-dialog-description"
                aria-labelledby="alert-dialog-title"
                classes={{
                    paper: classes.paper
                }}
                maxWidth="md"
                id={this.props.id}
                onClose={this.props.onClose}
                open={this.props.open}
                PaperComponent={PaperComponent}
                scroll="paper"
                {...rest}
            >
               <DialogTitle
                   className={classes.dialogTitle}
                   id={this.props.id + 'Title'}
                   disableTypography customdrag="allowed"
               >
                {dialogTitle}
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

export default withStyles(style)(EditMRAMHistoryDialog);