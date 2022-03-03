import React, { Component } from 'react';
import CIMSButton from '../../Buttons/CIMSButton';
import CIMSDialog from '../../Dialog/CIMSDialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import ValidatorForm from '../../FormValidator/ValidatorForm';
import {
  Box
} from '@material-ui/core';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import Enum from '../../../enums/enum';
import OutlinedRadioValidator from 'components/FormValidator/OutlinedRadioValidator';
import HKIDInput from '../../../views/compontent/hkidInput';
import moment from 'moment';
import * as EcsUtil from '../../../utilities/ecsUtilities';

const RequiredTips = () => {
  return <span style={{ color: 'red' }}>*</span>;
};

export const stateKeys = {
    idNum: 'idNum',
    idType: 'idType',
    openDialog: 'openDialog',
    activeComponent: 'activeComponent',
    enterKeyPressControl: 'enterKeyPressControl'
};

class MwecsDialog extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (!prevState[stateKeys.activeComponent]) {

      let idType =  nextProps.idType &&  nextProps.idType !== '' ?  nextProps.idType : Enum.MWECS_ID_TYPE_KEYS.hkid;
      return {
        [stateKeys.idNum]: nextProps.idNum,
        [stateKeys.idType]: idType,
        [stateKeys.activeComponent]: nextProps.activeComponent,
        [stateKeys.openDialog]: nextProps.openDialog
      };

    } else {
        return {
            [stateKeys.activeComponent]: nextProps.activeComponent,
            [stateKeys.openDialog]: nextProps.openDialog
        };
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      [stateKeys.idNum]: '',
      [stateKeys.idType]: '',
      [stateKeys.openDialog]: false,
      [stateKeys.activeComponent]: false,
      [stateKeys.enterKeyPressControl]: false
    };

    this.commonMsg = {
      hkidError: CommonMessage.VALIDATION_NOTE_HKIC_FORMAT_ERROR(),
      requireError: CommonMessage.VALIDATION_NOTE_REQUIRED()
    };
  }

  handleFieldChange = (e, stateKey) => {
    if (stateKey !== null && stateKey !== undefined) {
      switch (stateKey) {
        default:
          this.setState({ [stateKey]: e.target.value });
      }
    }
  };

  handleEnterKeyPress(e){
    let that = this;
    if(e.key === 'Enter' && this.state[stateKeys.enterKeyPressControl]){

      this.handleEnterDebounce();
      e.target.blur();
    }
  }

  handleEnterDebounce(){
    let that = this;
    setTimeout(()=>{
      that.setState({ [stateKeys.enterKeyPressControl]: true });
    },200);

    setTimeout(()=>{
      that.setState({ [stateKeys.enterKeyPressControl]: false });
        that.submitMwecsCheckingForm();
    },0);
  }

  onDialogEntered = () => {
    let formRef = this.refs.form;
    formRef.resetValidations();
  };

  submitMwecsCheckingForm = () => {
    let formRef = this.refs.form;
    formRef.submit();
  };

  handleMwecsCheckingFormOnError(errors) {

  }

  onDialogFormSubmit = (e, props, action, afterCheckingCallback, onCloseDialogCallback, callbackAction) => {
    const that = this;
    that.onCloseDialog(
      () => {
        action(
          that.transformStateToCheckEcsParams(that.state, props),
          (response) => {
            afterCheckingCallback(that.state, response);
            if(onCloseDialogCallback){
              onCloseDialogCallback(that.state);
            }
          },
          callbackAction
        );
      }
    );
  };

  onCloseDialog = onCloseDialogCallback => {
    if(this.props.closeDialog){
      this.props.closeDialog(onCloseDialogCallback);
    }
  };

  transformStateToCheckEcsParams = (state, props) => {
    let {patientKey = null, appointmentId = null} = props;
    let currentDateStr =  moment().format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE);
    return {
        hkidFormat: state.idType === Enum.MWECS_ID_TYPE_KEYS.hkid ? 'Y' : 'N',
        idNumber: EcsUtil.purifyHkid(state.idNum),
        reqEndDate: currentDateStr,
        reqStartDate: currentDateStr,
        patientKey: patientKey,
        appointmentId: appointmentId
    };
  }


  render() {
    const {
      parentPageName = '',
      dialogTilte = 'Medical Waiver Eligibility Checking',
      mwecsCheckingAction,
      afterCheckingCallback = () => {},
      onCloseDialogCallback = () => {},
      dialogProps,
      callbackAction
    } = this.props;

    const {idType, idNum, openDialog, activeComponent} = this.state;
    const idTypeIsHkid = idType === Enum.MWECS_ID_TYPE_KEYS.hkid;

    let idNumValidators = [ValidatorEnum.required];
    let idNumErrorMsg = [
      this.commonMsg.requireError
    ];
    if (idTypeIsHkid) {
        idNumValidators.push(ValidatorEnum.isHkid);
        idNumErrorMsg.push(this.commonMsg.hkidError);
    }


    return (
      <>
        <CIMSDialog
            id={`${parentPageName}_mwecs_dialog`}
            dialogTitle={dialogTilte}
            open={openDialog !== undefined ? openDialog : false}
            dialogContentProps={{ style: { minWidth: 400 } }}
            onEntered={() => {
                this.onDialogEntered();
            }}
            onClose={() => {}}
            {...dialogProps}
        >
        <ValidatorForm
            ref="form"
            id={`${parentPageName}_mwecs_form`}
            onError={errors => this.handleMwecsCheckingFormOnError(errors)}
            onSubmit={e => {
                this.onDialogFormSubmit(e, this.props, mwecsCheckingAction, afterCheckingCallback, onCloseDialogCallback, callbackAction);
              }}
        >
          <DialogContent style={{ padding: 12 }}>
            <Box display="flex" pb={2}>
              <Box width={1}>
                <OutlinedRadioValidator
                    id={`${parentPageName}_mwecs_idType`}
                    name="idType"
                    labelText="ID Type"
                    onEnter={() => {
                        this.handleEnterDebounce();
                    }}
                    isRequired
                    value={idType}
                    onChange={e => this.handleFieldChange(e, stateKeys.idType)}
                    list={
                      Enum.MWECS_ID_TYPES.map(item => ({ label: item.desc, value: item.key }))
                    }


                    validators={[ValidatorEnum.required]}
                    errorMessages={[this.commonMsg.requireError]}
                />
              </Box>
            </Box>
            <Box display="flex" pb={1}>
              <Box width={1}>
                <HKIDInput
                    id={`${parentPageName}_mwecs_hkid`}
                    onKeyPress={(e)=>{this.handleEnterKeyPress(e);}}
                    label={<>{idTypeIsHkid? 'ID Number' : 'Document Number'} <RequiredTips /></>}
                  //  autoFocus={!disableMajorKeys}
                    inputProps={{ maxLength: idTypeIsHkid ? 11 : 20  }}
                    isHKID={idTypeIsHkid}
                    fullWidth
                    variant="outlined"
                    msgPosition="bottom"
                    value={idNum}
                    validByBlur
                    validators={idNumValidators}
                    errorMessages={idNumErrorMsg}
                    onChange={e => {
                    this.handleFieldChange(e, stateKeys.idNum);
              }}
                />
              </Box>
            </Box>

          </DialogContent>
          <DialogActions>
            <CIMSButton
                id={`${parentPageName}_mwecs_submitBtn`}
                color="primary"
                onClick={(e) => {
                  this.submitMwecsCheckingForm();
              }}
            >
              Check
            </CIMSButton>
            <CIMSButton  id={`${parentPageName}_mwecs_closeBtn`}
                color="primary"
                onClick={() => {
                this.onCloseDialog(onCloseDialogCallback);
              }}
            >
              Close
            </CIMSButton>
          </DialogActions>

        </ValidatorForm>
        </CIMSDialog>
      </>
    );
  }
}
export default MwecsDialog;
