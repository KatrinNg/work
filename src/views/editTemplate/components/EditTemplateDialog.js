import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {Dialog,DialogTitle} from '@material-ui/core';
// import Typography from '@material-ui/core/Typography';
import FormControl from '@material-ui/core/FormControl';
import {styles} from './EditTemplateDialogCss';
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

class EditTemplateDialog extends Component {
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
                onEnter={this.props.onEnter}
                onClose={this.props.onClose}
                open={this.props.open}
                PaperComponent={PaperComponent}
                onEscapeKeyDown={this.props.handleEscKeyDown}
            >
               <DialogTitle
                   className={classes.dialogTitle||null}
                   id={this.props.id + 'Title'}
                   disableTypography customdrag="allowed"
               >
                {this.props.dialogTitle}
              </DialogTitle>
                <FormControl className={classes.formControlCss||null}
                    style={this.props.formControlStyle||null}
                >
                    <FormControl className={classes.formControl2Css||null}
                        {...this.props.dialogContentProps}
                    >
                        {this.props.children}
                    </FormControl>
                </FormControl>
            </Dialog>
        );
    }
}

export default withStyles(styles)(EditTemplateDialog);