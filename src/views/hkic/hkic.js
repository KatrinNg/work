import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Grid, Stepper, Step, StepLabel, FormHelperText, Dialog, DialogTitle, DialogContent, DialogActions, Typography, InputBase } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import LoadingDialog from './loadingDialog';
import { resetAll, uploadFile, convert, cancelUpload, exit, uploadFailed, updateState } from '../../store/actions/hkic/hkicAction';
import CIMSButton from '../../components/Buttons/CIMSButton';
import * as messageUtilities from '../../utilities/messageUtilities';
import * as CommonUtil from '../../utilities/commonUtilities.js';
import AccessRightEnum from '../../enums/accessRightEnum';
import { updateCurTab } from '../../store/actions/mainFrame/mainFrameAction';
import {auditAction} from '../../store/actions/als/logAction';

class HKIC extends Component {
  state = {
    open: false
  }
  UNSAFE_componentWillMount() {
    this.props.resetAll();
  }

  componentDidMount() {
    this.props.ensureDidMount();
    this.doClose = CommonUtil.getDoCloseFunc_2(AccessRightEnum.hkicIVRS, this.checkIsDirty, this.saveFunc);
    this.props.updateCurTab(AccessRightEnum.hkicIVRS, this.doClose);
  }

  componentWillUnmount() {
    this.props.resetAll();
  }

  checkIsDirty = () => {
    return this.props.file ? true : false;
  }

  saveFunc = (closeTab) => {
    this.convertButtonOnClick(null, closeTab);
  }

  fileFieldOnChange = (el) => {
    let file = el.target.files[0];
    if (!file) {
      this.props.resetAll();
    } else {
      let fileType = file.name.substring(file.name.lastIndexOf('.'), file.name.length).toLowerCase();
      let errorMessage = (fileType === '.xlsx' || fileType === '.xls') ? null : messageUtilities.getMessageDescriptionByMsgCode('110109');
      errorMessage = (!errorMessage && file.size > 2097152) ? messageUtilities.getMessageDescriptionByMsgCode('110110') : errorMessage;
      this.props.uploadFile({ file, errorMessage });
      this.refs.hkicUploadFile.value = null;
    }
  }
  convertButtonOnClick = (e, closeTab) => {
    const reader = new FileReader();
    reader.readAsBinaryString(this.props.file);
    this.props.auditAction('Click Convert');
    reader.onload = () => {
      this.props.convert({ openLodingDailog: true, file: this.props.file });
      this.props.updateState({
        doCloseCallBack: closeTab || null,
        file: null,
        openDownloadDailog: false,
        openLodingDailog: false,
        fileBlob: null,
        activeStep: 0,
        errorMessage: null,
        fileName: ''
      });
    };
    reader.onerror = () => {
      this.props.uploadFailed(messageUtilities.getMessageDescriptionByMsgCode('110151'));
    };
  }
  loadingDialogCancelButtonOnClick = () => {
    this.props.cancelUpload();
  }
  downloadButtonOnClick = () => {
    this.props.auditAction('Download IVRS result', null, null, false, 'patient');
    if (window.navigator.msSaveOrOpenBlob) {
      navigator.msSaveBlob(this.props.fileBlob, this.props.fileName);
    } else {
      let link = document.createElement('a');
      link.href = window.URL.createObjectURL(this.props.fileBlob);
      link.download = this.props.fileName;
      document.body.appendChild(link);
      let evt = document.createEvent('MouseEvents');
      evt.initEvent('click', false, false);
      link.dispatchEvent(evt);
      document.body.removeChild(link);
    }
    if(this.props.doCloseCallBack) {
      this.props.doCloseCallBack(true);
    }
  }
  exitButtonOnClick = () => {
    this.props.exit();
    if (this.props.doCloseCallBack) {
      this.props.doCloseCallBack(true);
    }
  }

  render() {
    let steps = ['Upload your file', 'Click <<Convert>>'];
    const { classes } = this.props;
    return (
      <Typography component={'div'} >
        <Typography component={'div'} classes={{ root: classes.typography }} >
          <Stepper style={{ paddingLeft: 0, paddingRight: 0 }} activeStep={this.props.activeStep} orientation="vertical" >
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Grid id="hkicUpLoadFileFiled">
            <input
                style={{ display: 'none' }}
                id="hkicUpLoadFileFiledInput"
                type="file"
                accept=".xlsx, .xls"
                label="Browse"
                onChange={this.fileFieldOnChange}
                ref="hkicUploadFile"
            />
            <label htmlFor="hkicUpLoadFileFiledInput">
              <InputBase
                  id="hkicUpLoadFileFiledFileNameInput"
                  style={{ border: '1px solid #B8BCB9', height: '26px', borderRadius: 6, marginRight: 5, width: 300 }}
                  inputProps={{ style: { padding: 4 } }}
                  value={!this.props.file ? '' : this.props.file.name}
                  readOnly
              />
              <CIMSButton
                  id="hkicUpLoadFileFiledBrowseButton"
                  variant="contained"
                  component="span"
                  size="small"
                // classes={{ root: classes.button }}
                  style={{ height: '28px', marginRight: 5 }}
                  onClick={() => { this.props.resetAll(); this.refs.hkicUploadFile.value = null; }}
              >
                Browse...
              </CIMSButton>
            </label>
            {
              !this.props.errorMessage ? null :
                <FormHelperText error >
                  {this.props.errorMessage}
                </FormHelperText>
            }
          </Grid>
        </Typography>
        <Typography component={'div'} >
          <CIMSButton
              id="hkicConvertButton"
              variant="contained"
            // color="primary"
              size="small"
              disabled={!this.props.file}
            // classes={{ root: classes.button, label: classes.buttonLabel }}
              onClick={this.convertButtonOnClick}
          >
            Convert
        </CIMSButton>
        </Typography>
        <LoadingDialog
          //ref="loadingDialog"
            id="hkicLodingDialog"
            open={this.props.openLodingDailog}
            cancel={this.loadingDialogCancelButtonOnClick}
        />
        <Dialog
            id="hkicDownloadDailog"
            open={this.props.openDownloadDailog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
          <DialogTitle>{messageUtilities.getMessageDescriptionByMsgCode('110108')}</DialogTitle>
          <DialogContent>
            {/* <a download={this.props.fileName} href={this.props.fileBlob}>Download</a> */}
            <Button id="hkicDownloadDailogContentDownloadButton" color="primary" style={{ textTransform: 'none' }} onClick={this.downloadButtonOnClick}>
              Download
          </Button>
          </DialogContent>
          <DialogActions>
            <Button id="hkicDownloadDailogActionsExitButton" style={{ textTransform: 'none' }} onClick={this.exitButtonOnClick} color="primary" autoFocus>
              Exit
          </Button>
          </DialogActions>
        </Dialog>
      </Typography>
    );
  }
}

const styles = theme => ({
  button: {
    margin: theme.spacing(1),
    textTransform: 'none',
    backgroundColor: '#999'
  },
  buttonLabel: {
    fontSize: 14
  },
  input: {
    display: 'none'
  },
  typography: {
    margin: '0 0 2px 8px'
  }
});

function mapStateToProps(state) {
  return {
    file: state.hkicReducer.file,
    fileName: state.hkicReducer.fileName,
    openDownloadDailog: state.hkicReducer.openDownloadDailog || false,
    openLodingDailog: state.hkicReducer.openLodingDailog || false,
    fileBlob: state.hkicReducer.fileBlob,
    activeStep: state.hkicReducer.activeStep,
    errorMessage: state.hkicReducer.errorMessage,
    doCloseCallBack: state.hkicReducer.doCloseCallBack
  };
}
const dispatchProps = {
  resetAll,
  uploadFile,
  convert,
  cancelUpload,
  exit,
  // uploadSuccess,
  uploadFailed,
  updateCurTab,
  updateState,
  auditAction
};
export default connect(mapStateToProps, dispatchProps)(withStyles(styles)(HKIC));