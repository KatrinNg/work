import React, { Component } from 'react';
import CIMSButton from '../../Buttons/CIMSButton';
import CIMSDialog from '../../Dialog/CIMSDialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import ValidatorForm from '../../FormValidator/ValidatorForm';
import HKIDInput from '../../../views/compontent/hkidInput';
import RegDateBirthField from '../../../views/registration/component/regDateBirthField';
import {
  // ListItemText,
  // ListItem,
  // List,
  TextField,
  Box
} from '@material-ui/core';
import SelectFieldValidator from '../../FormValidator/SelectFieldValidator';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import * as RegUtil from '../../../utilities/registrationUtilities';
import Enum from '../../../enums/enum';
import * as PatientUtil from '../../../utilities/patientUtilities';
import * as EcsUtil from '../../../utilities/ecsUtilities';
import InfoIcon from '@material-ui/icons/Info';
import Tooltip from '@material-ui/core/Tooltip';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';


const RequiredTips = () => {
  return <span style={{ color: 'red' }}>*</span>;
};

const InnerGrid = props => {
  const {
    leftOrder = 0,
    rightOrder = 0,
    leftWidth = '1',
    rightWidth = '1'
  } = props;
  return (
    <Box display="flex" pb={1}>
      <Box pr={1} width={leftWidth} order={leftOrder}>
        {props.left}
      </Box>
      <Box width={rightWidth} order={rightOrder}>
        {props.right}
      </Box>
    </Box>
  );
};

export const stateKeys = {
  hkid: 'hkid',
  associatedHkic: 'associatedHkic',
  dob: 'dob',
  exactDob: 'exactDobCd',
  benefitType: 'benefitType',
  openDialog: 'openDialog',
  activeComponent: 'activeComponent',
  cimsUsers: 'cimsUsers',
  defaultTemplete: 'defaultTemplete',
  locationCode: 'locationCode',
  requestID: 'requestID',
  isOpeningSelectMenu: 'isOpeningSelectMenu',
  enterKeyPressControl: 'enterKeyPressControl',
  onChangeDob: 'onChangeDob'
};

class EcsButton extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (!prevState[stateKeys.activeComponent]) {
      const { data = {} } = nextProps;

      return {
        [stateKeys.hkid]: data.hkid,
        [stateKeys.associatedHkic]: data.associatedHkic
          ? data.associatedHkic
          : '',
        [stateKeys.dob]: data.dob ? data.dob : null,
        [stateKeys.benefitType]: data.benefitType
          ? data.benefitType
          : prevState[stateKeys.benefitType],
        [stateKeys.exactDob]: data.exactDob,
        [stateKeys.isOpeningSelectMenu]: prevState.isOpeningSelectMenu,
        [stateKeys.enterKeyPressControl]: true
      };
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      [stateKeys.hkid]: '',
      [stateKeys.associatedHkic]: '',
      [stateKeys.dob]: null,
      [stateKeys.benefitType]: 'GS',
      [stateKeys.openDialog]: false,
      [stateKeys.activeComponent]: false,
      [stateKeys.isOpeningSelectMenu]: false,
      [stateKeys.enterKeyPressControl]: true
    };
    this.commonMsg = {
      hkidError: CommonMessage.VALIDATION_NOTE_HKIC_FORMAT_ERROR(),
      requireError: CommonMessage.VALIDATION_NOTE_REQUIRED()
    };
  }

  handleFieldChange = (e, stateKey) => {
    if (stateKey !== null && stateKey !== undefined) {
      switch (stateKey) {
        case stateKeys.dob:
          this.setState({ [stateKey]: e });
          break;
        case stateKeys.benefitType:
          this.setState({ [stateKey]: e ? e.value : null });
          break;
        default:
          this.setState({ [stateKey]: e.target.value });
      }
    }
  };

  handleEnterKeyPress(e){
    let that = this;
    if(e.key === 'Enter' && this.state[stateKeys.enterKeyPressControl]){

      setTimeout(()=>{
        that.setState({ [stateKeys.enterKeyPressControl]: true });
      },200);

      e.target.blur();
      setTimeout(()=>{
        that.setState({ [stateKeys.enterKeyPressControl]: false });
          that.submitEcsCheckingForm();
      },0);


    }
  }

  handleSelectOnMenuShow() {
    this.setState({ [stateKeys.isOpeningSelectMenu]: true });
  }

  handleSelectOnKeyPress(e) {
    if(!this.state[stateKeys.isOpeningSelectMenu]){
      this.handleEnterKeyPress(e);
    }
  }

  handleSelectOnMenuClose() {
    this.setState({ [stateKeys.isOpeningSelectMenu]: false });
  }

  handleDobChange = (stateKey, value) => {

    if (stateKey !== null && stateKey !== undefined) {
      this.setState({ [stateKey]: value });
    }
  };

  handleOnClickEcsBtn = (event, callback) => {
    this.switchDialog(true);
    if (callback) {
      callback(this.state);
    }
  };

  switchDialog = isOn => {
    if(isOn){
      this.setState({
        [stateKeys.activeComponent]: isOn
      });
    }
    this.setState({
      [stateKeys.openDialog]: isOn
    });
  };

  onDialogEntered = () => {
    let formRef = this.refs.form;
    formRef.resetValidations();
  };

  submitEcsCheckingForm = () => {
    let formRef = this.refs.form;
    formRef.submit();
  };

  handleEcsCheckingFormOnError(errors) {

  }

  transformStateToCheckEcsParams = (thatState, thatProps) => {
    const {
      cimsUser = '',
      defaultTemplate = '',
      locationCode = '',
      requestID = '',
      patientKey = -1
    } = thatProps;

    const purifyHkid = EcsUtil.purifyHkid;

    const isCompletedDateFormatCode = thatState.exactDobCd === Enum.DATE_FORMAT_EDMY_KEY ;

    const isSearchBoth = thatState[stateKeys.benefitType] === 'Both';

    let tempDob = null;
    if(thatState.dob instanceof moment){
      tempDob = thatState.dob;
    }else {
      tempDob = moment(thatState.dob, RegUtil.getDateFormat(thatState.exactDobCd));
    }

    return {
      'checkBoth': isSearchBoth ? 'Y': 'N',
      'checkType': this.isSelfSearch() ? 'H' : 'N',
      'cimsUser': cimsUser,
      'defaultTemplate': defaultTemplate,
      'dob': isCompletedDateFormatCode ? tempDob.format(Enum.DATE_FORMAT_ECS_EDMY_VALUE) : tempDob.format(Enum.DATE_FORMAT_EY_VALUE),
      'dobEstd': isCompletedDateFormatCode ? 'Y' : 'N',
      'hkid': this.isSelfSearch() ? purifyHkid(thatState[stateKeys.hkid]) : purifyHkid(thatState[stateKeys.associatedHkic]),
      'locationCode': locationCode,
      'requestID': requestID,
      'svrOrg': isSearchBoth ? 'GS': thatState[stateKeys.benefitType],
      'patientHkid': purifyHkid(thatState[stateKeys.hkid]),
      'patientKey': patientKey
    };
  }

  onDialogFormSubmit = (e, props, action, afterCheckingCallback, onCloseDialogCallback, storeInState) => {
    const that = this;
    this.switchDialog(false);
    action(
      this.transformStateToCheckEcsParams(this.state, props),
      this.state[stateKeys.hkid],
      (response) => {
        afterCheckingCallback(that.state, response);
        that.onCloseDialog(onCloseDialogCallback);
      },
      storeInState
    );
  };

  onCloseDialog = onCloseDialogCallback => {
    this.switchDialog(false);
    this.setState({
      [stateKeys.enterKeyPressControl]:true
    });

    if (onCloseDialogCallback) {
      onCloseDialogCallback(this.state);
    }
    this.setState({
      [stateKeys.activeComponent]: false
    });
  };

  isSelfSearch = () => {
    return (
      this.state[stateKeys.associatedHkic] === null ||
      this.state[stateKeys.associatedHkic] === ''
    );
  };

  render() {
    const {
      parentPageName = '',
      dialogTilte = 'ECS Checking',
      buttonClasses = {},
      dialogClasses = {},
      btnStyle = { padding: '0px', margin: '0px' },
      onClickEcsBtnCallback = () => {},
      ecsCheckingAction,
      disabled,
      disableMajorKeys = false,
      afterCheckingCallback = () => {},
      onCloseDialogCallback = () => {},
      exact_dobList = [],
      engSurname = '',
      engGivename = '',
      chineseName = '',
      docTypeCd = '',
      cimsUser = '',
      defaultTemplate = '',
      locationCode = '',
      requestID = '',
      patientKey = -1,
      ButtonComponent = props => <CIMSButton {...props}></CIMSButton>,
      storeInState = true,
      ...rest
    } = this.props;

    const docTypeIsNotHkic =
      docTypeCd !== '' && !PatientUtil.isHKIDFormat(docTypeCd);
    const engName = `${engSurname}${
      engSurname.length > 0 ? ' ' : ''
    }${engGivename}`;
    //const isHkidNotProvided = this.state[stateKeys.isHkidNotProvided];
    const isHKIDRequired = this.isSelfSearch() ;//&& isHkidNotProvided;
    const isEngNameEmpty = engName.length <= 0;
    const isChineseNameEmpty = chineseName.length <= 0;
    let hkidValidators = [ValidatorEnum.isHkid];
    if (isHKIDRequired) {
      hkidValidators.push(ValidatorEnum.required);
    }

    let associatedHkidValidators = [ValidatorEnum.isHkid];
    if (!isHKIDRequired) {
      associatedHkidValidators.push(ValidatorEnum.required);
    }
    return (
      <>
        <CIMSDialog
            classes={dialogClasses}
            id={`${parentPageName}_ecs_dialog`}
            dialogTitle={dialogTilte}
            open={this.state[stateKeys.openDialog] && !disabled}
            dialogContentProps={{ style: { minWidth: 500 } }}
            onEntered={() => {
            this.onDialogEntered();
          }}
            onClose={() => {
            this.onCloseDialog(onCloseDialogCallback);
          }}
        >
        <ValidatorForm
            ref="form"
            id={`${parentPageName}_ecs_form`}
            onError={errors => this.handleEcsCheckingFormOnError(errors)}
            onSubmit={e => {
                this.onDialogFormSubmit(e, this.props, ecsCheckingAction, afterCheckingCallback, onCloseDialogCallback, storeInState);
              }}
        >
          <DialogContent style={{ padding: 12 }}>
            <InnerGrid
                left={
                <TextField
                    variant={'outlined'}
                    disabled
                    label={<>Search Type</>}
                    id={`${parentPageName}_ecs_englishName`}
                    value={this.isSelfSearch() ? 'Self' : 'Associated Person'}
                    InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip
                            title={
                            <Typography variant="h5">
                              {
                                this.isSelfSearch()?
                                'Enter Associated HKIC to search the associated person.':
                                'Clear Associated HKIC to search the individual person.'
                              }
                            </Typography>
                          }
                        >
                          <InfoIcon></InfoIcon>
                        </Tooltip>
                      </InputAdornment>
                    )
                  }}
                ></TextField>
              }
            />
            {isEngNameEmpty && isChineseNameEmpty ? null : (
              <InnerGrid
                  left={
                  <TextField
                      variant={'outlined'}
                      disabled
                      label={<>English Name</>}
                      id={`${parentPageName}_ecs_englishName`}
                      value={engName}
                  ></TextField>
                }
                  right={
                  !isChineseNameEmpty ? (
                    <TextField
                        variant={'outlined'}
                        disabled
                        label={'中文姓名'}
                        id={`${parentPageName}_ecs_chineseName`}
                        value={chineseName}
                    ></TextField>
                  ) : null
                }
              />
            )}


              <InnerGrid
                  left={
                    <HKIDInput
                        id={`${parentPageName}_ecs_hkid`}
                        onKeyPress={(e)=>{this.handleEnterKeyPress(e);}}
                        label={
                        <>HKID {isHKIDRequired ? <RequiredTips /> : null}</>
                      }
                        disabled={!this.isSelfSearch() || disableMajorKeys}
                        autoFocus={!disableMajorKeys}
                        inputProps={{ maxLength:  11  }}
                        isHKID
                        fullWidth
                        variant="outlined"
                        msgPosition="bottom"
                        value={this.isSelfSearch()?this.state.hkid: ''}
                        validByBlur
                        validators={hkidValidators}
                        errorMessages={[
                        this.commonMsg.hkidError,
                        this.commonMsg.requireError
                      ]}
                        onChange={e => {
                        this.handleFieldChange(e, stateKeys.hkid);
                      }}
                    />
                }
                  right={
                  <HKIDInput
                      id={`${parentPageName}_ecs_assoHkid`}
                      onKeyPress={(e)=>{this.handleEnterKeyPress(e);}}
                      autoFocus={disableMajorKeys}
                      inputProps={{ maxLength:  11  }}
                      label={<>Associated HKID {!isHKIDRequired ? <RequiredTips /> : null}</>}
                      isHKID
                      fullWidth
                      variant="outlined"
                      msgPosition="bottom"
                      value={this.state.associatedHkic}
                      validByBlur
                      validators={associatedHkidValidators}
                      errorMessages={[this.commonMsg.hkidError,
                        this.commonMsg.requireError]}
                      onChange={e => {
                      this.handleFieldChange(e, stateKeys.associatedHkic);
                    }}
                  />
                }
              />

              <InnerGrid
                  left={
                  <SelectFieldValidator

                      onMenuOpen={() => this.handleSelectOnMenuShow()}
                      onMenuClose={() => this.handleSelectOnMenuClose()}
                      onKeyDown={(e) => this.handleSelectOnKeyPress(e)}

                      id={`${parentPageName}_ecs_assoHkid`}
                      options={Enum.ECS_BENEFIT_TYPE.map((item, idx) => ({
                      value: item.value,
                      label: item.label,
                      shortName: item.label,
                      idx: idx
                    }))}
                      TextFieldProps={{
                      variant: 'outlined',
                      label: (
                        <>
                          Benefit Type <RequiredTips />
                        </>
                      )
                    }}
                      onChange={e => {
                      this.handleFieldChange(e, stateKeys.benefitType);
                    }}
                      value={this.state.benefitType}
                  />
                }
                  right={<></>}
              />

              <RegDateBirthField

                  id={`${parentPageName}_ecs`}
                  onChange={(value, name) => {
                  this.handleDobChange(name, value);
                }}
                  comDisabled={disableMajorKeys}
                  dobValue={this.state[stateKeys.dob]}
                  exact_dobValue={this.state[stateKeys.exactDob]}
                  exact_dobList={exact_dobList}
                  dobProps={
                    {
                      onKeyPress: (e) => {
                        this.handleEnterKeyPress(e);
                      }
                    }
                  }
                  exactDobProps={
                    {
                      onMenuOpen: () => this.handleSelectOnMenuShow(),
                      onMenuClose: () => this.handleSelectOnMenuClose(),
                      onKeyDown: (e) => this.handleSelectOnKeyPress(e)
                    }
                  }
              />
          </DialogContent>
          <DialogActions>
            <CIMSButton
                id={`${parentPageName}_ecs_checkBtn`}
                color="primary"
                onClick={e => {
                  this.submitEcsCheckingForm();
                }}
            >
              Check
            </CIMSButton>
            <CIMSButton
                id={`${parentPageName}_ecs_closeBtn`}
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
        <ButtonComponent
            disabled={disabled}
            style={btnStyle}
            onClick={e => {
            this.handleOnClickEcsBtn(e, onClickEcsBtnCallback);
          }}
            classes={buttonClasses}
            {...rest}
        >
          {this.props.children}
        </ButtonComponent>

      </>
    );
  }
}
export default EcsButton;
