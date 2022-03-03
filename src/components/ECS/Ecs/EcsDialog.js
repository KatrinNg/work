import React, { Component } from 'react';
import CIMSButton from '../../Buttons/CIMSButton';
import CIMSDialog from '../../Dialog/CIMSDialog';
import CIMSTextField from '../../TextField/CIMSTextField';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import ValidatorForm from '../../FormValidator/ValidatorForm';
import HKIDInput from '../../../views/compontent/hkidInput';
import EcsDateBirthField from './EcsDateBirthField';
import {
  Box, Grid,Dialog,IconButton
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
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
import CIMSDataGrid from '../../Grid/CIMSDataGrid';
import { getEligibleIndexFromEcsResult,getDetailArray,checkEcsDataIsValid } from '../../../utilities/ecsUtilities';
import { forceRefreshCells } from '../../../utilities/commonUtilities';

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
  lastCheckedTime:'lastCheckedTime',
  openDetail:'openDetail',
  ecsDetail:'ecsDetail'
};


class selectRender extends React.Component{
  render(){
    const rowData = this.props.data;
    const {afterCheckingCallback,callbackAction,selectTwinsRecAction,rowIndex,state,props,onCloseDialog}=this.props;
    return (
      <CIMSButton
          id={'ecsResultGrid_select_button_'+rowIndex}
          style={{
          minHeight: '35px',
          maxHeight: '35px'
        }}
          onClick={e => {
          onCloseDialog(
            () => {
              selectTwinsRecAction(
                rowData,
                props.patientKey,
                state[stateKeys.lastCheckedTime],
                state[stateKeys.benefitType],
                (response) => {
                  afterCheckingCallback(state, response);
                },
                callbackAction
              );
            }
          );
        }
      }
          children={'Select'}
      />
    );
  }

}

class viewDetailRender extends React.Component{
  //const rowData = p.data;

  render(){
    const {rowIndex,setDetailContent}=this.props;
    const rowData = this.props.data;
    return (
    <Grid container ref={ref=>this.gridRef=ref}>
      <CIMSButton
          id={'ecsResultGrid_veiwDetail_button_'+rowIndex}
          style={{
            minHeight: '35px',
            maxHeight: '35px'
          }}
          onClick={()=>setDetailContent(rowData)}
      >
      {'View Detail'}
      </CIMSButton>
    </Grid>

  );
  }
}

class EcsDialog extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (!prevState[stateKeys.activeComponent]) {
      const { hkid, associatedHkic, dob, benefitType, exactDob, mustBeAssociated } = nextProps;

      return {
        [stateKeys.hkid]: hkid,
        [stateKeys.associatedHkic]: associatedHkic && mustBeAssociated
          ? associatedHkic
          : '',
        [stateKeys.dob]: dob ? mustBeAssociated ? null : dob : null,
        [stateKeys.benefitType]: benefitType
          ? benefitType
          : prevState[stateKeys.benefitType],
        [stateKeys.exactDob]: mustBeAssociated ? (prevState[stateKeys.exactDob] ? prevState[stateKeys.exactDob] : Enum.DATE_FORMAT_EDMY_KEY) : exactDob,
        [stateKeys.isOpeningSelectMenu]: prevState.isOpeningSelectMenu,
        [stateKeys.enterKeyPressControl]: true,
        [stateKeys.activeComponent]: nextProps.activeComponent,
        [stateKeys.openDialog]: nextProps.openDialog,
        [stateKeys.lastCheckedTime]:null,
        [stateKeys.openDetail]:false,
        [stateKeys.ecsDetail]:null
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
      [stateKeys.hkid]: '',
      [stateKeys.associatedHkic]: '',
      [stateKeys.dob]: null,
      [stateKeys.benefitType]: 'Both',
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

  handleDobTypeChange = dobData => {
    this.setState({ [stateKeys.exactDob]: (dobData && dobData.exactDobCd) || Enum.DATE_FORMAT_EDMY_KEY });
  };

  handleEnterKeyPress(e) {
    let that = this;
    if (e.key === 'Enter' && this.state[stateKeys.enterKeyPressControl]) {

      setTimeout(() => {
        that.setState({ [stateKeys.enterKeyPressControl]: true });
      }, 200);

      e.target.blur();
      setTimeout(() => {
        that.setState({ [stateKeys.enterKeyPressControl]: false });
        that.submitEcsCheckingForm();
      }, 0);


    }
  }

  handleSelectOnMenuShow() {
    this.setState({ [stateKeys.isOpeningSelectMenu]: true });
  }

  handleSelectOnKeyPress(e) {
    if (!this.state[stateKeys.isOpeningSelectMenu]) {
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
      patientKey = null,
      atndId = null
    } = thatProps;

    const purifyHkid = EcsUtil.purifyHkid;


    const isSearchBoth = thatState[stateKeys.benefitType] === 'Both';

    return EcsUtil.getEcsParams(
      isSearchBoth,
      this.isSelfSearch(),
      cimsUser,
      defaultTemplate,
      thatState.dob,
      thatState.exactDobCd,
      this.isSelfSearch() ? purifyHkid(thatState[stateKeys.hkid]) : purifyHkid(thatState[stateKeys.associatedHkic]),
      locationCode,
      requestID,
      thatState[stateKeys.benefitType],
      purifyHkid(thatState[stateKeys.hkid]),
      patientKey,
      atndId
    );

  }

  onDialogFormSubmit = (e, props, action, afterCheckingCallback, callbackAction) => {
    const that = this;
    //this.onCloseDialog(
    //() => {
    action(
      that.transformStateToCheckEcsParams(that.state, props),
      that.state[stateKeys.hkid],
      (response) => {
        afterCheckingCallback(that.state, response);
        if (response.isSingle) {
          this.onCloseDialog();
        } else {
          //do something.
          this.setState({[stateKeys.lastCheckedTime]:response.lastCheckedTime});
        }
      },
      callbackAction
    );
    //}
    //);

  };

  onCloseDialog = onCloseDialogCallback => {
    if (this.props.closeDialog) {
      this.props.closeDialog(onCloseDialogCallback);
    }
  };

  isSelfSearch = () => {
    return (
      this.state[stateKeys.associatedHkic] === null ||
      this.state[stateKeys.associatedHkic] === ''
    ) && !this.props.mustBeAssociated;
  };

  orderNumberRender = (props) => {
    const { rowIndex } = props;
    return rowIndex + 1;
  };

  resultGetter = (params) => {
    const eligibleIndex = getEligibleIndexFromEcsResult(params.data);
    let org = '';
    let eligibleMedicalStr = 'N';
    let eligibleDentalStr = 'N';
    org = params.data['svrOrg' + eligibleIndex];
    eligibleMedicalStr = params.data['eligibleMedical' + eligibleIndex];
    eligibleDentalStr = params.data['eligibleDental' + eligibleIndex];
    return `${org}: Eligible for Medical: ${eligibleMedicalStr === 'Y' ? eligibleMedicalStr : '-'} , Eligible for Dental: ${eligibleDentalStr === 'Y' ? eligibleDentalStr : '-'}`;
  }

  setDetailContent=(rowData)=>{
    rowData=checkEcsDataIsValid(rowData,this.state[stateKeys.benefitType]);
    rowData.isInitState = false;
    rowData.lastCheckedTime=this.state[stateKeys.lastCheckedTime];
    const detailArray = getDetailArray(rowData);
    this.setState({
      [stateKeys.ecsDetail]:detailArray,
      [stateKeys.openDetail]:true
    });
  }


  render() {
    const {
      parentPageName = '',
      dialogTilte = 'ECS Checking',
      ecsCheckingAction,
      disabled,
      disableMajorKeys = false,
      afterCheckingCallback = () => { },
      onCloseDialogCallback = () => { },
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
      mustBeAssociated = false,
      callbackAction,
      dialogContentProps,
      formContentProps,
      ecsCheckingResult,
      selectTwinsRecAction
    } = this.props;
    //let {ecsCheckingResult}=this.props;
    const docTypeIsNotHkic =
      docTypeCd !== '' && !PatientUtil.isHKIDFormat(docTypeCd);
    const engName = `${engSurname}${engSurname.length > 0 ? ' ' : ''
      }${engGivename}`;

    let isSelfSearch = this.isSelfSearch();

    const isHkidNotProvided = this.state[stateKeys.hkid] === '' || this.state[stateKeys.hkid] === null;
    const isHKIDRequired = isSelfSearch && (!disableMajorKeys && isHkidNotProvided);
    const isEngNameEmpty = engName.length <= 0;
    const isChineseNameEmpty = chineseName.length <= 0;
    let hkidValidators = [ValidatorEnum.isHkid];
    if (isHKIDRequired) {
      hkidValidators.push(ValidatorEnum.required);
    }

    let associatedHkidValidators = [ValidatorEnum.isHkid];

    const associatedHkidIsRequired = (!isHKIDRequired && isHkidNotProvided) || mustBeAssociated;
    if (associatedHkidIsRequired) {
      associatedHkidValidators.push(ValidatorEnum.required);
    }

    let hkidLeftInput = <HKIDInput
        id={`${parentPageName}_ecs_hkid`}
        onKeyPress={(e) => { this.handleEnterKeyPress(e); }}
        label={
        <>HKID {isHKIDRequired ? <RequiredTips /> : null}</>
      }
        disabled={!isSelfSearch || disableMajorKeys}
        autoFocus={!disableMajorKeys}
        inputProps={{ maxLength: 12 }}
        isHKID
        fullWidth
        variant="outlined"
        msgPosition="bottom"
        value={isSelfSearch ? this.state.hkid : ''}
        validByBlur
        validators={hkidValidators}
        errorMessages={[
        this.commonMsg.hkidError,
        this.commonMsg.requireError
      ]}
        onChange={e => {
        this.handleFieldChange(e, stateKeys.hkid);
      }}
                        />;
    let hkidRightInput = <HKIDInput
        id={`${parentPageName}_ecs_assoHkid`}
        onKeyPress={(e) => { this.handleEnterKeyPress(e); }}
        autoFocus={disableMajorKeys}
        inputProps={{ maxLength: 12 }}
        label={<>Associated HKID {associatedHkidIsRequired ? <RequiredTips /> : null}</>}
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
                         />;

    if (mustBeAssociated) {
      hkidLeftInput = hkidRightInput;
      hkidRightInput = <></>;
    }

    return (
      <>
        <CIMSDialog
            id={`${parentPageName}_ecs_dialog`}
            dialogTitle={dialogTilte}
            open={this.state[stateKeys.openDialog] && !disabled}
            {...dialogContentProps}
            onEntered={() => {
            this.onDialogEntered();
          }}
            onClose={() => {
            this.onCloseDialog(() => { onCloseDialogCallback(this.state, this.props); });
          }}
        >
          <ValidatorForm
              ref="form"
              {...formContentProps}
              id={`${parentPageName}_ecs_form`}
              onError={errors => this.handleEcsCheckingFormOnError(errors)}
              onSubmit={e => {
              this.onDialogFormSubmit(e, this.props, ecsCheckingAction, afterCheckingCallback, callbackAction);
            }}
          >
            <DialogContent style={{ padding: 12 }}>
              <InnerGrid
                  left={
                  <CIMSTextField
                      variant={'outlined'}
                      disabled
                      label={<>Search Type</>}
                      id={`${parentPageName}_ecs_englishName1`}
                      value={isSelfSearch ? 'Self' : 'Associated Person'}
                      InputProps={{
                      endAdornment: (
                        mustBeAssociated ? <></> :
                          <InputAdornment position="end">
                            <Tooltip
                                title={
                                <Typography variant="h5">
                                  {
                                    isSelfSearch ?
                                      'Enter Associated HKIC to search the associated person.' :
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
                  ></CIMSTextField>
                }
              />
              {isEngNameEmpty && isChineseNameEmpty ? null : (
                <InnerGrid
                    left={
                    <CIMSTextField
                        variant={'outlined'}
                        disabled
                        label={<>English Name</>}
                        id={`${parentPageName}_ecs_englishName2`}
                        value={engName}
                    ></CIMSTextField>
                  }
                    right={
                    !isChineseNameEmpty ? (
                      <CIMSTextField
                          variant={'outlined'}
                          disabled
                          label={'中文姓名'}
                          id={`${parentPageName}_ecs_chineseName`}
                          value={chineseName}
                      ></CIMSTextField>
                    ) : null
                  }
                />
              )}


              <InnerGrid
                  left={
                  hkidLeftInput
                }
                  right={
                  hkidRightInput
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

              <EcsDateBirthField

                  id={`${parentPageName}_ecs`}
                  onChange={(value, name) => {
                  this.handleDobChange(name, value);
                }}
                  comDisabled={disableMajorKeys && isSelfSearch}
                  dobValue={this.state[stateKeys.dob]}
                  exact_dobValue={this.state[stateKeys.exactDob]}
                  exact_dobList={exact_dobList}
                  dobProps={
                  {
                    isRequired: !isSelfSearch,
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
              {ecsCheckingResult.length > 1 ?
                <Grid container style={{ marginTop: 18 }}>
                  <CIMSDataGrid
                    //ref={refGrid}

                      gridTheme="ag-theme-balham"
                      divStyle={{
                      width: '100%',
                      height: '25vh',
                      display: 'block'
                    }}
                      gridOptions={{
                      columnDefs: [
                        {
                          headerName: '',
                          colId: 'index',
                          valueGetter: params => params.node.rowIndex + 1,
                          minWidth: 60,
                          maxWidth: 60,
                          //pinned: 'left',
                          filter: false
                        },
                        {
                          headerName: 'Result', field: 'result', minWidth: 400, width: 400,
                          valueGetter: this.resultGetter,
                          tooltipValueGetter: this.resultGetter

                        },
                        {
                          headerName: 'Name', field: 'englishName', minWidth: 200, width: 200, tooltipField: 'englishName'
                        },
                        {
                          headerName: '',
                          colId: 'viewAction',
                          minWidth: 150,
                          maxWidth: 150,
                          cellRenderer: 'viewDetailRender',
                          cellRendererParams: {
                            setDetailContent:this.setDetailContent
                          },
                          cellStyle: () => {
                            let cellStyle = {
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            };
                            return cellStyle;
                          },
                          filter: false,
                          pinned: 'right'
                        },
                        {
                          headerName: '',
                          colId: 'selectAction',
                          minWidth: 150,
                          maxWidth: 150,
                          cellRenderer: 'selectRender',
                          cellRendererParams: {
                            afterCheckingCallback:afterCheckingCallback,
                            callbackAction:callbackAction,
                            selectTwinsRecAction:selectTwinsRecAction,
                            ecsCheckingAction:ecsCheckingAction,
                            onCloseDialog:this.onCloseDialog,
                            //transformStateToCheckEcsParams:this.transformStateToCheckEcsParams,
                            state:this.state,
                            props:this.props
                          },
                          cellStyle: () => {
                            let cellStyle = {
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center'
                            };
                            return cellStyle;
                          },
                          filter: false,
                          pinned: 'right'
                        }
                      ],
                      rowData: ecsCheckingResult,
                      rowSelection: 'single',
                      onRowSelected: params => {
                      },
                      getRowNodeId: item => item.ecsChkId.toString(),
                      onRowDoubleClicked: params => {
                      },
                      headerHeight: 50,
                      getRowHeight: params => 50,
                      onGridReady: params => {
                      },
                      frameworkComponents: {
                        orderNumRender: this.orderNumberRender,
                        viewDetailRender: viewDetailRender,
                        selectRender: selectRender
                      },
                      context: {
                        id:`${parentPageName}_result_grid`
                    },
                      enableBrowserTooltips: true,
                      postSort: rowNodes => forceRefreshCells(rowNodes, ['index'])
                    }}
                  />
                </Grid>
                : null}
            </DialogContent>
            <DialogActions>
              {ecsCheckingResult.length === 0 ?
                <CIMSButton
                    id={`${parentPageName}_ecs_checkBtn`}
                    color="primary"
                    onClick={e => {
                    this.submitEcsCheckingForm();
                  }}
                >
                  Check
            </CIMSButton>
                : null}

              <CIMSButton
                  id={`${parentPageName}_ecs_closeBtn`}
                  color="primary"
                  onClick={() => {
                  this.onCloseDialog(() => { onCloseDialogCallback(this.state, this.props); });
                }}
              >
                Close
            </CIMSButton>
            </DialogActions>

          </ValidatorForm>
        </CIMSDialog>
        <Dialog
            open={this.state[stateKeys.openDetail]}
            // onClose={() => {
            //   this.setState({[stateKeys.openDetail]:false});
            // }}
            id={`${parentPageName}_ecs_detailDialog`}
        >
          {
            <div style={{
              flexGrow: 1,
              width: '250px',
              padding:12
              //overflow:'hidden'
            }}
            >
            <Grid container>
              <Grid container justify={'flex-end'}>
              <IconButton
                  size={'small'}
                  id={`${parentPageName}_ecs_detailDialog_closeBtn`}
                  aria-label="close"
                  //className={classes.closeButton}
                  onClick={()=>{this.setState({[stateKeys.openDetail]:false});}}
              >
                <CloseIcon />
              </IconButton>
              </Grid>
              <Grid container spacing={1}>
              {
                this.state[stateKeys.ecsDetail]&&this.state[stateKeys.ecsDetail].map(
                  (item, index) => {
                    return (
                      <Grid key={`${item.label}_detail_key`} container item xs={12}>
                        <Grid container item xs={7} alignItems="center" justify="flex-end">
                          <Typography style={{
                            textAlign: 'right',
                            fontSize: '12px',
                            color: 'black'
                          }}
                          >
                            {item.label}
                          </Typography>
                        </Grid>
                        <Grid container item xs={5} alignItems="center" justify="center">
                          <Typography style={{
                            fontSize: '12px',
                            textAlign: 'center',
                            paddingLeft: '12px',
                            color: 'black'
                          }}
                          >
                            {item.desc}
                          </Typography>
                        </Grid>
                      </Grid>
                    );
                  }
                )
              }
            </Grid>
          </Grid>
        </div>
          }
        </Dialog>
      </>
    );
  }
}
export default EcsDialog;
