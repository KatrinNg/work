import React, { Component } from 'react';
import { withStyles, Card, CardContent, Typography, Grid, TextField } from '@material-ui/core';
import { styles } from './DeleteOrderDialogStyle';
import EditTemplateDialog from '../../../../../administration/editTemplate/components/EditTemplateDialog';
import CIMSButton from '../../../../../../components/Buttons/CIMSButton';

class DeleteOrderDialog extends Component {
  constructor(props){
    super(props);
    this.state={
      reason: ''
    };
  }

  handleReasonChange = event => {
    this.setState({
      reason: event.target.value
    });
  };

  handleConfirm = () => {
    const {handleDeleteDialogConfirm} = this.props;
    let { reason } = this.state;
    handleDeleteDialogConfirm&&handleDeleteDialogConfirm(reason);
  }

  handleEscKeyDown = () => {
    this.handleCancel();
  };

  handleCancel = () => {
    const { handleDeleteDialogCancel } = this.props;
    handleDeleteDialogCancel&&handleDeleteDialogCancel();
  }

  resetState = () => {
    this.setState({
      reason:''
    });
  }

  render() {
    const { classes, isOpen=false, id=''} = this.props;
    let { reason } = this.state;
    return (
      <EditTemplateDialog
          id={id}
          dialogTitle="Delete Request Order"
          open={isOpen}
          onEnter={this.resetState}
          handleEscKeyDown={this.handleEscKeyDown}
      >
        <Card component="div" id={'deleteRequestOrderDialog'} className={classes.card}>
          <CardContent className={classes.cardContent}>
            <Grid container alignItems="center">
              <Grid item xs={12} className={classes.gridItem}>
                <label className={classes.labelContent}>Please specify the reason:</label>
              </Grid>
              <Grid item xs={12}>
                <TextField
                    id={`${id}_reason_textarea`}
                    autoCapitalize="off"
                    variant="outlined"
                    className={classes.textarea}
                    multiline
                    rows={5}
                    value={reason}
                    onChange={this.handleReasonChange}
                    inputProps={{
                      className:classes.inputProps
                    }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Typography component="div">
          <Grid alignItems="center" container justify="flex-end">
            <Typography component="div">
              <CIMSButton
                  classes={{ label: classes.fontLabel }}
                  color="primary"
                  id={`${id}_btn_confirm`}
                  size="small"
                  onClick={this.handleConfirm}
              >
                Confirm
              </CIMSButton>
            </Typography>
            <CIMSButton
                classes={{ label: classes.fontLabel }}
                color="primary"
                id={`${id}_btn_cancel`}
                size="small"
                onClick={this.handleCancel}
            >
              Cancel
            </CIMSButton>
          </Grid>
        </Typography>
      </EditTemplateDialog>
    );
  }
}

export default withStyles(styles)(DeleteOrderDialog);
