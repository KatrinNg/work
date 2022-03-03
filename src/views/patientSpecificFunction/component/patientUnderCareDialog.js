import React, { Component } from 'react';
import NewAprrovalDialog from '../../../views/compontent/newAprrovalDialog';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import TextField from '@material-ui/core/TextField';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import {
  Checkbox,
  DialogContent,
  DialogActions,
  Grid,
  withStyles
} from '@material-ui/core';
import { connect } from 'react-redux';
import { auditAction, alsLogAudit } from '../../../store/actions/als/logAction';
import _ from 'lodash';

import '../../../styles/common/patientUnderCare.scss';

class PatientUnderCareDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      radioValue: '',
      selectedReasons: {},
      detail: ''
    };
  }

  componentDidMount() {
    this.props.alsLogAudit({
      desc: '[Patient Under Care] Open dialog',
      dest: 'patient'
    });
  }

  componentWillUnmount() {
    this.props.alsLogAudit({
      desc: '[Patient Under Care] Close dialog',
      dest: 'patient'
    });
  }

  handleValueChange = (key, value) => {
    this.setState({
      ...this.state,
      [key]: value
    });
  };

  render() {
    const {
      onSave,
      onCancel,
      reasonList,
      classes,
      auditAction
    } = this.props;

    const otherChecked = !!this.state.selectedReasons['OTHER'];
    const detailWarning = otherChecked && _.isEmpty(this.state.detail);
    const noReason = !(this.state.selectedReasons && Object.values(this.state.selectedReasons).some(x => x === true));

    return (
      <NewAprrovalDialog
          id="patientUnderCareDialog"
          open
          dialogTitle="Patient Might Not Under Your Direct Care"
          classes={{
            paper: classes.paper
          }}
      >
        <DialogContent id="patientUnderCareDialogContent" style={{ maxHeight: '80vh' }}>
          <Grid container>
            <div>You are attempting to access the electronic clinical records of a patient/client who might not under your direct clinical care.</div>
            <div>You are required to give reason(s) before accessing the clinical records in this PMI.</div>
            <div>Your access will be logged and subject to auditing.</div>
            <div>Unauthorised access will lead to disciplinary action.</div>
          </Grid>
          <Grid container style={{ marginTop: '20px' }}>
            <div style={{ display: 'inline-block' }, { width: '100%' }}>
              <div style={{ backgroundColor: '#e0e0e0', padding: '5px' }}>Please select one or more reason(s):</div>
              <FormControl component="fieldset" style={{ marginTop: '5px' }}>
                <FormLabel component="legend"></FormLabel>
                {/* <RadioGroup aria-label="reason" name="reason1" value={this.state.radioValue} onChange={e => this.handleValueChange('radioValue', e.target.value)}>
                  {
                    reasonList && reasonList.filter(item => item.code !== 'CANCEL').map((item, index) => <FormControlLabel key={index} value={item.code} control={<Radio />} label={item.engDesc} />)
                  }
                </RadioGroup> */}
                {reasonList && reasonList.filter(item => item.code !== 'CANCEL').map((item, index) =>
                  <FormControlLabel
                      key={index}
                      control={
                        <Checkbox
                            value={item.code}
                            checked={!!this.state.selectedReasons[item.code]}
                            onChange={(e) => {
                                let { value, checked } = e.target;
                                console.log(value, checked);
                                let selectedReasons = {...this.state.selectedReasons};
                                selectedReasons[value] = checked;
                                this.setState({ selectedReasons });
                            }}
                        />
                      }
                      label={item.engDesc}
                  />
                )}
              </FormControl>
            </div>
            {/* <div style={{ display: 'inline-block' }, { width: '50%' }}>
              <div style={{ backgroundColor: '#e0e0e0', padding: '5px' }}>Please provide details on:</div>
              <div className="ReasonDetailBlock" style={{ marginTop: '5px' }}>
                {
                  reasonList && reasonList.filter(item => item.code !== 'CANCEL').map((item, index) => <div key={index}>{item.chiDesc}</div>)
                }
              </div>
            </div> */}
          </Grid>
          <Grid container style={{ marginTop: '20px' }}>
            <TextField
                style={{ width: '100%' }}
                label={<><span>Details:</span>{otherChecked ? <span style={{ color: 'red' }}>*</span> : null}</>}
                multiline
                rows={4}
                variant="outlined"
                value={this.state.detail}
                error={detailWarning}
                helperText={'This field is required.'}
                FormHelperTextProps={{
                    style: {
                        padding: '2px 14px',
                        visibility: detailWarning ? 'visible' : 'hidden'
                    }
                }}
                onChange={e => this.handleValueChange('detail', e.target.value)}
            />
          </Grid>
        </DialogContent>
        <DialogActions style={{ justifyContent: 'center', padding: 0 }}>
          <CIMSButton
              style={{ minWidth: '140px', height: '38px' }}
              id="patientUnderCare_btnSaveDialog"
              onClick={() => {
                  const entries = this.state.selectedReasons ? Object.entries(this.state.selectedReasons).map(([k, v]) => ({code: k, checked: v})) : [];
                  const values = entries.filter(x => x.checked).map(x => x.code);
                  auditAction('[Patient Under Care] Click "Save" button', null, null, false);
                  onSave(values, this.state.detail);
              }}
              disabled={noReason || detailWarning}
          >Save</CIMSButton>
          <CIMSButton
              style={{ minWidth: '140px', height: '38px' }}
              id="patientUnderCare_btnCancelDialog"
              onClick={() => {
                auditAction('[Patient Under Care] Click "Cancel" button', null, null, false);
                onCancel('CANCEL', '');
              }}
          >Cancel</CIMSButton>
        </DialogActions>
      </NewAprrovalDialog>
    );
  }
}

const styles = () => ({
  paper: {
    maxWidth: 720
  }
});

const dispatchProps = {
  auditAction,
  alsLogAudit
};

export default connect(null, dispatchProps)(withStyles(styles)(PatientUnderCareDialog));