import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import {
  Grid,
  Stepper,
  Step,
  StepButton,
  Typography
} from '@material-ui/core';
import _ from 'lodash';
import moment from 'moment';

import CIMSButtonGroup from '../../components/Buttons/CIMSButtonGroup';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import ButtonStatusEnum from '../../enums/registration/buttonStatusEnum';
import accessRightEnum from '../../enums/accessRightEnum';
import { codeList } from '../../constants/codeList';
import * as RegistrationType from '../../store/actions/registration/registrationActionType';
import * as EcsActionType from '../../store/actions/ECS/ecsActionType';
import * as RegUtil from '../../utilities/registrationUtilities';
import PersonalParticulars from './personalParticulars';
import ContactInformation from './contactInformation';
import ContactPerson from './contactPerson';
import SocialData from './socialData';
import SearchPMIDialog from './component/searchPMI/searchPMIDialog';
import ApprovalDialog from './component/approvalDialog';
import ProblemPMIDialog from './component/problemPMI/problemPMIDialog';
import FieldConstant from '../../constants/fieldConstant';
import { getLanguageList, putPatientPUC } from '../../store/actions/patient/patientAction';
import {
  resetAll,
  updatePatientOperateStatus,
  getPatientById,
  updatePatient,
  registerPatient,
  updateState,
  listValidForProblemPMI,
  checkValidPMIExist,
  confirmProblemPatient,
  checkAccessRightByStaffId,
  initMiscellaneous,
  createNewPMI,
  patientListDoNewPMI,
  openMode,
  resetBabyInfo,
  mapPmiWithProvenDocVal,
  searchPatient,
  checkFamilyNo,
  getPatientGrp,
  enrollEhsMember
} from '../../store/actions/registration/registrationAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import { openCommonCircular, closeCommonCircular, getCodeList } from '../../store/actions/common/commonAction';
import { skipTab, deleteTabs, deleteSubTabs, updateCurTab, addTabs } from '../../store/actions/mainFrame/mainFrameAction';
import { updateTabLabel } from '../../store/actions/mainFrame/mainFrameAction';
import { refreshServiceStatus } from '../../store/actions/ECS/ecsAction';
import Enum, { EHS_CONSTANT, SERVICE_CODE } from '../../enums/enum';
import {
  resetAll as resetPatient,
  getPatientById as getPatientPanelPatientById
} from '../../store/actions/patient/patientAction';
import RegFieldName from '../../enums/registration/regFieldName';
import Miscellaneous from './miscellaneous';
import { PatientUtil, SiteParamsUtil, CommonUtil, RegistrationUtil } from '../../utilities';
import ValidatorEnum from '../../enums/validatorEnum';
import { alsLogAudit, auditAction } from '../../store/actions/als/logAction';
import AlsDedsc from '../../constants/ALS/alsDesc';

import { updatePmiData } from '../../store/actions/appointment/booking/bookingAction';
import PatientSearchResultDialog from '../compontent/patientSearchResultDialog';
import PatientInfoDialog from './component/patientInformation';
import BabyInfoDialog from './component/babyInfoDialog';
import NewPMISearchResultDialog from '../compontent/newPMISearchResultDialog';
import ServiceSpecific from './cgsServiceSpecific';
import MultiRegSummaryDialog from './component/multiRegSummary/MultiRegSummaryDialog';
import { familyNoTypes } from '../../constants/registration/registrationConstants';
import EhsServiceSpecific from './ehsServiceSpecific';
import ContactTelDialog from './component/serviceSpecific/EHS/ContactTelDialog';
import * as commonUtilities from '../../utilities/commonUtilities';
import { ageCalculator, isApplyEhsMember } from '../../utilities/patientUtilities';

const useStyle1 = (theme) => ({
  root: {
    display: 'flex',
    flexFlow: 'column',
    height: 'calc(100% - 70px)'
  },
  stepperGrid: {
    display: 'flex',
    justifyContent: 'center'
  },
  stepper: {
    width: '80%',
    padding: 10,
    backgroundColor: theme.palette.cimsBackgroundColor
  },
  stepperButton: {
    margin: -5,
    padding: 5,
    borderRadius: theme.spacing(1) / 2
  },
  content: {
    flex: 1,
    overflowY: 'auto'
  },
  buttonGroup: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  button: {
    minWidth: 120
  },
  hidden: {
    display: 'none'
  },
  buttonRoot: {
    margin: '0px 18px',
    padding: '4px 12px'
  },
  markAsPMIBtn: {
    left: 85
    // bottom: 10,
  },
  errorTips: {
    padding: '5px 0px',
    fontWeight: 'bold'
  }
});

const sysRatio = CommonUtil.getSystemRatio();
const unit = CommonUtil.getResizeUnit(sysRatio);
const customTheme = (theme) => createMuiTheme({
  ...theme,
  spacing: (16 * unit)
});

const PDStatus = {
  CLOSE: 'C',
  OPEN: 'O',
  OPENBYSAVE: 'S'
};

const APPRStatus = {
  CLOSE: 'C',
  MAJORKEY: 'M',
  CHINESENAME: 'CN'
};

export const viaSts = {
  NEW_REG: 'NEW_REGISTRATION',
  PMI_SUM: 'PMI_SUMMARY'
};

class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      steps: props.serviceCd === 'CGS' ? ['Personal Particulars', 'Contact Information', 'Contact Person', 'Social Data', 'Miscellaneous', 'Service-specific']:['Personal Particulars', 'Contact Information', 'Contact Person', 'Social Data', 'Miscellaneous'],
      openApproval: APPRStatus.CLOSE,
      problemDialogStatus: PDStatus.CLOSE,
      // loginName: '',
      // password: '',
      staffId: '',
      activeStep: 0,
      comDisabled: true,
      openBabyInfoDialog: false,
      isSubmit: false,
      isReset: false,
      isNextReg: false,
      isNewFamily: false,
      registeredPatientList: [],
      isSummaryDialogOpen: false,
      isCompleteClick: false,
      doClose: null,
      pucChecking: null,
      openEhsContactTelDialog: false,
      contactPersonIndex: -1
    };
    this.integratedPatient = null;
  }

  static getDerivedStateFromProps(nextProps) {
    if (nextProps.patientOperationStatus === ButtonStatusEnum.EDIT || nextProps.patientOperationStatus === ButtonStatusEnum.ADD) {
      return { comDisabled: false };
    } else {
      return { comDisabled: true };
    }
  }

  componentDidMount() {

    if (this.props.serviceCd === 'EHS') {
      this.setState({steps: [...this.state.steps, 'Service Specific']});
    }

    const { alsLogAudit } = this.props;
    alsLogAudit({ desc: `[Registration] didMount`, dest: 'patient', functionName: `Registration`, isEncrypt: false });
    this.initCodeList();
    alsLogAudit({ desc: `[Registration] AFTER initCodeList`, dest: 'patient', functionName: `Registration`, isEncrypt: false });
    this.initValidRule();

    this.props.refreshServiceStatus();
    this.props.resetAll();

    this.props.mapPmiWithProvenDocVal();
    alsLogAudit({ desc: `[Registration] AFTER mapPmiWithProvenDocVal`, dest: 'patient', functionName: `Registration`, isEncrypt: false });

    this.initPassInParams();
    alsLogAudit({ desc: `[Registration] AFTER initPassInParams`, dest: 'patient', functionName: `Registration`, isEncrypt: false });

    this.initDoClose();
    alsLogAudit({ desc: `[Registration] AFTER initDoClose`, dest: 'patient', functionName: `Registration`, isEncrypt: false });

    this.props.openMode();
  }

  componentDidUpdate(prevProps){
      const { alsLogAudit } = this.props;
      const { isNextReg } = this.state;
      const { patientOperationStatus, patientBaseInfo } = this.props;
      // If Next PMI Reg patient exists and family group not equal to current family group -> pop up warning message dialog
      if (
          prevProps.patientBaseInfo !== patientBaseInfo &&
          isNextReg &&
          patientOperationStatus === ButtonStatusEnum.DATA_SELECTED &&
          patientBaseInfo.cgsSpec.pmiGrpName &&
          patientBaseInfo.cgsSpec.pmiGrpName !== patientBaseInfo.pmiGrpName
      ) {
          alsLogAudit({ desc: `[Registration] didUpdate showPatientFamilyNoExistsDialog`, dest: 'patient', functionName: `Registration`, isEncrypt: true, content: JSON.stringify(patientBaseInfo) });
          RegUtil.showPatientFamilyNoExistsDialog(patientBaseInfo, (result) => {
              if (result) this.resetFields();
          });
        }
  }

  componentWillUnmount() {
    this.props.resetAll();
  }

  initCodeList = () => {
    let getCodeParams = [
      codeList.gender,
      codeList.exact_date_of_birth,
      codeList.district,
      codeList.sub_district,
      codeList.document_type,
      codeList.edu_level,
      codeList.ethnicity,
      // codeList.gov_department,
      codeList.marital_status,
      codeList.occupation,
      codeList.relationship,
      codeList.religion,
      codeList.translation_lang,
      codeList.waiver,
      codeList.patient_status
    ];
    this.props.getCodeList({
      params: getCodeParams,
      actionType: [RegistrationType.PUT_GET_CODE_LIST, EcsActionType.PUT_GET_CODE_LIST]
    });
    this.props.getLanguageList();
  }

  initValidRule = () => {
    ValidatorForm.addValidationRule(ValidatorEnum.hasSameValue, () => {
      return this.personalParticularsRef.checkIsSameAsPriDocPair();
    });
  }

  initPassInParams = () => {
    //redirect from other page by params
    if (this.props.location.state) {
      const params = this.props.location.state;
      //redirect from patientlist linkpatient
      if (params.redirectFrom === 'linkPatient') {
        this.redirectFromLinkPatient(params);
      }

      //redirect from patient summary
      if (params.redirectFrom === accessRightEnum.patientSummary) {
        this.redirectFromPatientSummary(params);
      }

      if (params.redirectFrom === 'patientList') {
        this.redirectFromPatientList(params);
      }
    }
  }

  redirectFromLinkPatient = (params) => {
    let patient = {};
    patient.engSurname = params.engSurname || '';
    patient.engGivename = params.engGivename || '';
    // let { phoneNo = undefined, ctryCd = undefined, areaCd = undefined, dialingCd } = params;
    // if (phoneNo && dialingCd) {
    //   let phone = RegUtil.addPatientPhone(Enum.PHONE_TYPE_MOBILE_PHONE, true);
    //   let phoneList = [];
    //   // const countryList = this.props.countryList || [];
    //   // let country = countryList.find(c => c.countryCd === ctryCd);
    //   phone.countryCd = ctryCd;
    //   phone.phoneNo = phoneNo;
    //   phone.areaCd = areaCd;
    //   // phone.dialingCd = country? country.dialingCd : (areaCd? areaCd : '');
    //   phone.dialingCd = dialingCd;
    //   // phone.phonePriority = 1;
    //   phoneList.push(phone);
    //   phoneList = RegUtil.initPatientPhone(phoneList);
    //   // patient.phoneList = [phone];
    //   patient.phoneList = phoneList;
    // }
    let { contactPhone } = params;
    if (contactPhone.phoneNo) {
      let phoneList = [];
      phoneList.push(contactPhone);
      phoneList = RegUtil.initPatientPhone(phoneList);
      patient.phoneList = phoneList;
    }
    if (params.docTypeCd && params.hkidOrDocNum) {
      patient.documentPairList = [{
        docTypeCd: params.docTypeCd,
        docNo: params.hkidOrDocNum,
        serviceCd: this.props.serviceCd,
        isPrimary: 1,
        isProblem: 0
      }];
    }
    this.props.createNewPMI(patient);
    this.resetAllValidation();
  }

  redirectFromPatientSummary = (params) => {
    if (params.patientKey) {
      // this.props.getPatientById(params.patientKey, () => {
      //   if (typeof params.stepIndex === 'number') {
      //     this.handleStep(params.stepIndex, () => {
      //       this.props.updateState({
      //         patientOperationStatus: ButtonStatusEnum.EDIT
      //       });
      //     });
      //   }
      // });
      if (typeof params.stepIndex === 'number') {
        this.handleStep(params.stepIndex);
      }
      this.props.getPatientById(params.patientKey, () => {
        this.props.updateState({
          patientOperationStatus: ButtonStatusEnum.EDIT,
          via: viaSts.PMI_SUM
        });
        this.setState({ pucChecking: params.pucChecking });
        this.props.closeCommonCircular();
      });
    }
  }

  redirectFromPatientList = (params) => {
    if (params.action === 'createNew') {
      let patient = {};
      patient.documentPairList = [{
        docTypeCd: params.searchType,
        docNo: params.searchString,
        serviceCd: this.props.serviceCd,
        isPrimary: 1,
        isProblem: 0
      }];
      // this.props.createNewPMI(patient);
      // this.props.updateState({ autoFocus: true });
      if (params.smartCardData) {
        this.preFillSmartCardData(params.smartCardData);
        this.props.updateState({ patientOperationStatus: ButtonStatusEnum.ADD });
      } else {
        this.props.patientListDoNewPMI(patient);
      }
    }
  }

  handleStep = (step, callback) => {
    const { isNextReg } = this.state;
    this.props.openCommonCircular();
    const { patientBaseInfo, isFamilyNoValid, isServiceSpecificFormValid, serviceCd } = this.props;
    if (this.state.activeStep === 0 && !this.state.comDisabled) {
      const personalValid = this.refs.personalForm.isFormValid(false);
      personalValid.then((result) => {
        if (
            (serviceCd !== 'CGS' && result) ||
            // Check family number field when serviceCd is CGS
            (serviceCd === 'CGS' && result &&
                (
                  isNextReg || patientBaseInfo.familyNoType !== familyNoTypes.EXISTING ||
                    (
                      patientBaseInfo.familyNoType === familyNoTypes.EXISTING &&
                        patientBaseInfo.pmiGrpName && isFamilyNoValid !== 'N'
                    )
                )
            )
        ) {
              this.setState({ activeStep: step });
          }
          this.props.closeCommonCircular();
      });
    } else if (this.state.activeStep === 1 && !this.state.comDisabled) {
      const contactValid = this.refs.contactInfoForm.isFormValid(false);
      contactValid.then(result => {
        if (result) {
          this.setState({ activeStep: step });
        }
        this.props.closeCommonCircular();
      });
    } else if (this.state.activeStep === 2 && !this.state.comDisabled) {
      const contactPerValid = this.refs.contactPersonForm.isFormValid(false);
      contactPerValid.then(result => {
        if (result) {
          this.setState({ activeStep: step });
        } else {
          this.contactPersonRef.focusErrorPanel();
        }
        this.props.closeCommonCircular();
      });
    } else if (this.state.activeStep === 4 && !this.state.comDisabled) {
      const paperBasedRecValid = this.miscellaneousRef.validPaperBasedRec();
      const patientReminderValid = this.miscellaneousRef.validPatientReminder();
      const waiverInfoValid = this.miscellaneousRef.validWaiverInfo();
      paperBasedRecValid.then(result => {
        if (result) {
          patientReminderValid.then(result1 => {
            if (result1) {
              waiverInfoValid.then(result2 => {
                if (result2) {
                  this.setState({ activeStep: step });
                } else {
                  this.miscellaneousRef.focusWaiverInfoFail();
                }
              });
            } else {
              this.miscellaneousRef.focusPatientReminderFail();
            }
          });
        } else {
          this.miscellaneousRef.focusPaperBasedFail();
        }
        this.props.closeCommonCircular();
      });
    } else if (this.state.activeStep === 5 && !isServiceSpecificFormValid && serviceCd === 'CGS')
        this.props.closeCommonCircular();
    else {
      this.setState({ activeStep: step });
      this.props.closeCommonCircular();
    }
    callback && callback();
  }

  btnCreateNew = () => {
    const { patientById } = this.props;
    this.setState({ activeStep: 0 });
    this.props.auditAction('Create New', null, null, false, 'patient');
    this.props.checkValidPMIExist({
      documentPairList: patientById && patientById.documentPairList,
      callback: (patientList) => {
        this.props.createNewPMI({ documentPairList: patientById && patientById.documentPairList });
        if (patientList.length > 0) {

          const primaryDoc = PatientUtil.getPatientPrimaryDoc(patientById && patientById.documentPairList);
          let isHKIDFormat = PatientUtil.isHKIDFormat(primaryDoc.docTypeCd);
          let docNo = primaryDoc.docNo.trim();
          if (isHKIDFormat) {
            docNo = PatientUtil.getHkidFormat(docNo);
          }
          this.props.openCommonMessage({
            msgCode: '110147',
            showSnackbar: true,
            // params: [{ name: 'DOC_NO', value: PatientUtil.getHkidFormat(primaryDoc.docNo.trim()) }]
            params: [{ name: 'DOC_NO', value: docNo }]
          });
        }
        this.props.updateState({ via: null });
      }
    });
  }

  btnBackOnClick = () => {
    if (this.state.activeStep === 1 && !this.state.comDisabled) {
      const contactValid = this.refs.contactInfoForm.isFormValid(false);
      contactValid.then(result => {
        if (result) {
          this.backStepAction();
        } else {
          this.refs.contactInfoForm.focusFail();
        }
      });
    } else if (this.state.activeStep === 2 && !this.state.comDisabled) {
      const contactPerValid = this.refs.contactPersonForm.isFormValid(false);
      contactPerValid.then(result => {
        if (result) {
          this.backStepAction();
        } else {
          // this.refs.contactPersonForm.focusFail();
          this.contactPersonRef.focusErrorPanel();
        }
      });
    } else if (this.state.activeStep === 4 && !this.state.comDisabled) {
      const paperBasedRecValid = this.miscellaneousRef.validPaperBasedRec();
      const patientReminderValid = this.miscellaneousRef.validPatientReminder();
      const waiverInfoValid = this.miscellaneousRef.validWaiverInfo();
      paperBasedRecValid.then(result => {
        if (result) {
          patientReminderValid.then(result1 => {
            if (result1) {
              waiverInfoValid.then(result2 => {
                if (result2) {
                  this.backStepAction();
                } else {
                  this.miscellaneousRef.focusWaiverInfoFail();
                }
              });
            } else {
              this.miscellaneousRef.focusPatientReminderFail();
            }
          });
        } else {
          this.miscellaneousRef.focusPaperBasedFail();
        }
      });
    } else {
      this.backStepAction();
    }
  }

  backStepAction() {
    if (this.state.activeStep > 0) {
      const activeStep = this.state.activeStep - 1;
      this.setState({ activeStep: activeStep });
    }
  }

  // NOTE
  btnNextOnClick = (e) => {
    e.preventDefault();
    this.props.auditAction(`Click Next Btn`, null, null, false, 'patient');
    const { isNextReg } = this.state;
    const { patientBaseInfo, isFamilyNoValid, serviceCd } = this.props;
    if (this.state.activeStep === 0 && !this.state.comDisabled) {
    const personalValid = this.refs.personalForm.isFormValid(false);
    personalValid.then((result) => {
        if (
            (serviceCd !== 'CGS' && result) ||
            // Check family number field when serviceCd is CGS
            (serviceCd === 'CGS' && result &&
                (
                  isNextReg || patientBaseInfo.familyNoType !== familyNoTypes.EXISTING ||
                    (
                      patientBaseInfo.familyNoType === familyNoTypes.EXISTING &&
                        patientBaseInfo.pmiGrpName && isFamilyNoValid !== 'N'
                    )
                )
            )
        ) {
            this.nextStepAction();
        } else {
            this.refs.personalForm.focusFail();
        }
    });
    } else if (this.state.activeStep === 1 && !this.state.comDisabled) {
      const contactValid = this.refs.contactInfoForm.isFormValid(false);
      contactValid.then(result => {
        if (result) {
          this.nextStepAction();
        } else {
          this.refs.contactInfoForm.focusFail();
        }
      });
    } else if (this.state.activeStep === 2 && !this.state.comDisabled) {
      const contactPerValid = this.refs.contactPersonForm.isFormValid(false);
      contactPerValid.then(result => {
        if (result) {
          this.nextStepAction();
        } else {
          // this.refs.contactPersonForm.focusFail();
          this.contactPersonRef.focusErrorPanel();
        }
      });
    } else {
      this.nextStepAction();
    }
  }

  nextStepAction = () => {
    if (this.state.activeStep < this.state.steps.length - 1) {
      const activeStep = this.state.activeStep + 1;
      this.setState({ activeStep: activeStep });
    }
  }

  genAddressDataList = () => {
    let result = [];
    const curAddressList = _.cloneDeep(this.props.addressList);
    curAddressList.forEach(address => {
      if (address.isDirty) {
        delete address.isDirty;
        delete address.regionCode;
        delete address.districtCode;
        delete address.subDistrictCode;
        result.push(address);
      }
    });
    return result;
  }

  isLack_PostMail = () => {
    const { patientContactInfo } = this.props;
    // if (patientContactInfo.communicationMeansCd.indexOf(Enum.CONTACT_MEAN_POSTALMAIL) > -1) {
    //   let _addressList = this.genAddressDataList();
    //   if (_addressList.length === 0) {
    //     return true;
    //   }
    // }
    if ((patientContactInfo.pmiPatientCommMeanList.findIndex(item => item.commMeanCd === Enum.CONTACT_MEAN_POSTALMAIL)) > -1) {
      let _addressList = this.genAddressDataList();
      if (_addressList.length === 0) {
        return true;
      }
    }
    return false;
  }

  isChangeMajorKey = () => {
    const { patientBaseInfo, patientById, patientOperationStatus } = this.props;
    if (patientOperationStatus === ButtonStatusEnum.EDIT) {
      return (patientBaseInfo.primaryDocNo || '') !== (patientById.primaryDocNo || '') ||
        (patientBaseInfo.primaryDocTypeCd || '') !== (patientById.primaryDocTypeCd || '') ||
        (patientBaseInfo.engSurname || '') !== (patientById.engSurname || '') ||
        (patientBaseInfo.engGivename || '') !== (patientById.engGivename || '') ||
        (patientBaseInfo.genderCd || '') !== (patientById.genderCd || '') ||
        moment(patientBaseInfo.dob).format(Enum.DATE_FORMAT_EYMD_VALUE) !== moment(patientById.dob).format(Enum.DATE_FORMAT_EYMD_VALUE) ||
        patientBaseInfo.exactDobCd !== patientById.exactDobCd;
    }
    return false;
  }

  isChangeChineseName = () => {
    const { patientBaseInfo, patientById, patientOperationStatus } = this.props;
    if (patientOperationStatus === ButtonStatusEnum.EDIT) {
      return (patientBaseInfo.nameChi || '') !== (patientById.nameChi || '');
    }
    return false;
  }

  isLack_SMS_MobilePhone = () => {
    const { phoneList, patientContactInfo } = this.props;
    if ((patientContactInfo.pmiPatientCommMeanList.findIndex(item => item.commMeanCd === Enum.CONTACT_MEAN_SMS)) > -1) {
      return phoneList.findIndex(item => item.phoneTypeCd === Enum.PHONE_TYPE_MOBILE_PHONE
        && parseInt(item.smsPhoneInd) === 1
        // && item.countryCd === FieldConstant.COUNTRY_CODE_DEFAULT_VALUE
        // && item.dialingCd === FieldConstant.DIALING_CODE_DEFAULT_VALUE
        && item.phoneNo) === -1;
    }
    return false;
  }

  // isLack_PreferPhone = () => {
  //   const { phoneList } = this.props;
  //   if (phoneList.length === 1) {
  //     return false;
  //   }
  //   let avaliPhoneList = RegUtil.getAvailablePhoneList(phoneList);
  //   let preferPhoneIdx = avaliPhoneList.findIndex(item => item.phonePriority === 1);
  //   return preferPhoneIdx === -1;
  // }

  checkPatientIsRegistered =()=>{
      const isEdit = this.props.patientOperationStatus === ButtonStatusEnum.EDIT;
      const { registeredPatientList } = this.state;
      const { patientBaseInfo } = this.props;
      const result = registeredPatientList.filter((data) => data.primaryDocNo === patientBaseInfo.primaryDocNo);
      if (result.length === 0 || isEdit) return false;
      else return true;
  }

  // NOTE Complete button
  btnOnComplete = () => {
    const { patientBaseInfo } = this.props;
    this.props.auditAction(AlsDedsc.COMPLETE, null, null, false, 'patient');
    if (!patientBaseInfo.primaryDocNo) this.setState({ isSummaryDialogOpen: true });
    else {
        if (this.checkPatientIsRegistered())
            this.setState({ isSummaryDialogOpen: true }, () => this.setState({ isCompleteClick: false }));
        else this.setState({ isCompleteClick: true }, () => this.btnSaveOnClick());
    }
  };

  // next reg
  btnOnNextReg = () => {
    this.props.auditAction(`Click Next PMI Reg Btn`, null, null, false, 'patient');
    this.btnSaveOnClick(null, null, true);
  };

  performEhsValidation = async () => {
    return await new Promise((resolve) => {
      const { activeStep } = this.state;
      const { patientBaseInfo, phoneList, addressList } = this.props;

      const { patientEhsDto } = patientBaseInfo;

      let isValid = true;
      let message = '';

      if (patientBaseInfo?.isApplyEhsMember === Enum.COMMON_YES || isApplyEhsMember(patientBaseInfo?.ehsMbrSts)) {
        // age >= 65 by year
        if (isValid && !ageCalculator(RegistrationUtil.getDateByFormat(patientBaseInfo.exactDobCd, patientBaseInfo.dob), RegistrationUtil.getDateFormat(patientBaseInfo.exactDobCd), 65)) {
          activeStep !== 0 && this.setState({activeStep: 0});
            message = 'Age of the Client MUST be 65 or above, please re-enter the information.';
            isValid = false;
        }

        // mandatory phone & address
        if (isValid &&
            !phoneList?.some(
                (phone) =>
                    phone.phoneNo !== '' && (phone.phoneTypeCd === Enum.PHONE_TYPE_HOME_PHONE || phone.phoneTypeCd === Enum.PHONE_TYPE_OTHER_PHONE)
            )
        ) {
            activeStep !== 1 && this.setState({activeStep: 1});
            message = 'Missing Telephone No (Home/Other), please provide the information.';
            isValid = false;
        }

        if (isValid && !RegUtil.checkIfHasAddress(addressList.find((address) => address.addressTypeCd === Enum.PATIENT_CORRESPONDENCE_ADDRESS_TYPE))) {
          activeStep !== 1 && this.setState({activeStep: 1});
          message='Missing Correspondence Address Details, please provide the information.';
          isValid = false;
        }

        if (isValid && patientEhsDto?.submitType === 5) {
          if (!patientEhsDto?.submitName?.length > 0) {
            activeStep !== 5 && this.setState({activeStep: 5});
            message="Missing Submitted Representative Name, please provide the information.";
            isValid = false;
          } else if (!patientEhsDto?.submitRelationshipCd) {
            activeStep !== 5 && this.setState({activeStep: 5});
            message="Missing Submuitted Representative Relationship, please provide the information.";
            isValid = false;
          }
        }

        if (isValid && (patientEhsDto?.smsOpt === 'E' || patientEhsDto?.smsOpt === 'C' || (patientEhsDto?.phnSmsAreaCd && patientEhsDto?.phnSmsAreaCd?.length > 0) || (patientEhsDto?.phnSmsDialingCd && patientEhsDto?.phnSmsDialingCd !== '852' && patientEhsDto?.phnSmsDialingCd !== ''))) {
          if (!patientEhsDto?.phnSms?.length > 0) {
            activeStep !== 5 && this.setState({activeStep: 5});
            message="Missing SMS Phone, please provide the information.";
            isValid = false;
          }
        }

        if (isValid && patientEhsDto?.phnSms?.length > 0) {
          if (!patientEhsDto?.phnSmsDialingCd?.length > 0) {
            activeStep !== 5 && this.setState({activeStep: 5});
            message="Missing SMS Country Code, please provide the information.";
            isValid = false;
          }
        }

        if (isValid && (patientEhsDto?.dod || patientEhsDto?.exactDodCd)) {
          if (!patientEhsDto?.dod || !moment(patientEhsDto?.dod).isValid()) {
            activeStep !== 5 && this.setState({activeStep: 5});
            message="Missing Date of Death, please provide the information.";
            isValid = false;
          } else if (!patientEhsDto?.exactDodCd) {
            activeStep !== 5 && this.setState({activeStep: 5});
            message="Missing Date of Death Format, please provide the information.";
            isValid = false;
          } else if (moment(patientEhsDto?.dod).isValid() && moment(patientEhsDto?.dod).isAfter(moment())) {
            activeStep !== 5 && this.setState({activeStep: 5});
            message="Date of Death CANNOT be a date before Application Date, please re-enter the information.";
            isValid = false;
          }
        }
      } else {
        // non member age 65 by year
        if (isValid && !ageCalculator(moment(patientBaseInfo.dob).format('YYYY'), 'YYYY', 65)) {
          activeStep !== 0 && this.setState({activeStep: 0});
            message = 'Age of the Client MUST be 65 or above, please re-enter the information.';
            isValid = false;
        }
      }
      if (isValid) {
        return resolve(true);
      } else {
        this.props.closeCommonCircular();
        this.props.openCommonMessage({
            msgCode: '130300',
            params: [
                { name: 'HEADER', value: 'Validation Error' },
                { name: 'MESSAGE', value: message }
            ]
        });
        return;
      }
    });
  };

  btnSaveOnClick = async (e, closeTab, isNextRegClick=false) => {
    const { isCompleteClick } = this.state;
    const { patientBaseInfo, isServiceSpecificFormValid, serviceCd, patientOperationStatus } = this.props;
    // console.log('btnSaveOnClick', isNextRegClick);

    if (serviceCd === SERVICE_CODE.EHS) {
      if (patientOperationStatus === ButtonStatusEnum.ADD) {
        const isNonMemebrReg = this.state.activeStep === 0 || (this.state.activeStep !== 0 && patientBaseInfo.isApplyEhsMember === 0);
        await new Promise((resolve) => {
            this.props.openCommonMessage({
                msgCode: isNonMemebrReg ? '110180' : '110181',
                btnActions: {
                    btn1Click: () => {
                        // auditAction('Confirm Delete');
                        // updatePatientEhsDto({ [`isPhn${index}Deleted`]: 1 });
                        // if (selectedPhn[`phn${index}`]) {
                        //     setSeletedPhn({ ...selectedPhn, [`phn${index}`]: false });
                        // }
                        if (isNonMemebrReg) {
                            this.props.updateState({ patientBaseInfo: { ...this.props.patientBaseInfo, isApplyEhsMember: 0 } });
                        }
                        resolve(true);
                    },
                    btn2Click: () => {
                        // auditAction('Cancel Delete');
                        return;
                    }
                }
            });
        });
      } else if (patientOperationStatus === ButtonStatusEnum.EDIT) {
        const isEnrollEhsMember = !isApplyEhsMember(this.props.patientBaseInfo.ehsMbrSts) && this.props.patientBaseInfo.isApplyEhsMember === Enum.COMMON_YES;
        if (isEnrollEhsMember) {
          await new Promise((resolve) => {
              this.props.openCommonMessage({
                  msgCode: '110182',
                  btnActions: {
                      btn1Click: () => {
                          // auditAction('Confirm Delete');
                          // updatePatientEhsDto({ [`isPhn${index}Deleted`]: 1 });
                          // if (selectedPhn[`phn${index}`]) {
                          //     setSeletedPhn({ ...selectedPhn, [`phn${index}`]: false });
                          // }
                          resolve(true);
                      },
                      btn2Click: () => {
                          // auditAction('Cancel Delete');
                          return;
                      }
                  }
              });
          });
        }
      }
    }

    (!isCompleteClick && !isNextRegClick) && this.props.auditAction(`Click Save Btn`, null, null, false, 'patient');

    this.setState({ isSubmit: true }, ()=> {
    //is lack hk mobile phone
    if (this.isLack_SMS_MobilePhone()) {
      this.props.openCommonMessage({ msgCode: '110145' });
      this.setState({ activeStep: 1 });
      return;
    }

    //is lack contact mean
    if (this.isLack_PostMail()) {
      this.props.openCommonMessage({ msgCode: '110141' });
      this.setState({ activeStep: 1 });
      return;
    }

    //lack of prefer phone
    // if (this.isLack_PreferPhone()) {
    //   this.props.openCommonMessage({ msgCode: '110052' });
    //   this.setState({ activeStep: 1 });
    //   return;
    // }

    this.props.openCommonCircular();

    // Family number validation
    const familyNoValid = new Promise((resolve) => {
        if (patientBaseInfo.familyNoType === familyNoTypes.EXISTING && serviceCd === 'CGS') {
            this.props.checkFamilyNo((data) => {
                if (data === 'invalid') resolve(false);
                else resolve(true);
            });
        } else resolve(true);
    });
    const baseValid = this.refs.personalForm.isFormValid(false);
    const contactValid = this.refs.contactInfoForm.isFormValid(false);
    const contactPerValid = this.refs.contactPersonForm.isFormValid(false);
    const paperBasedRecValid = this.miscellaneousRef.validPaperBasedRec();
    const patientReminderValid = this.miscellaneousRef.validPatientReminder();
    const waiverInfoValid = this.miscellaneousRef.validWaiverInfo();
    const serviceSpecValid = new Promise((resolve) => {
        if (!isServiceSpecificFormValid && serviceCd === 'CGS') return resolve(false);
        else return resolve(true);
    });
    const ehsServiceSpecificValid = serviceCd === SERVICE_CODE.EHS ? this.performEhsValidation() : true;

    Promise.all([
        familyNoValid,
        baseValid,
        contactValid,
        contactPerValid,
        paperBasedRecValid,
        patientReminderValid,
        waiverInfoValid,
        serviceSpecValid,
        ehsServiceSpecificValid
    ]).then((result) => {
        // If all valid
        if (result.every((x) => x === true)) {
            this.props.updateState({ doCloseCallbackFunc: closeTab || null });
            if (this.isChangeMajorKey()) {
                this.setState({ openApproval: APPRStatus.MAJORKEY });
                this.props.closeCommonCircular();
            } else if (this.isChangeChineseName()) {
                this.setState({ openApproval: APPRStatus.CHINESENAME });
                this.props.closeCommonCircular();
            } else {
                this.doRegister(isNextRegClick);
            }
        }
        // When familyNoValid is false
        else if (!result[0]) {
            this.setState({ activeStep: 0 });
            this.refs.personalForm.focusFail();
        }
        // When baseValid is false
        else if (!result[1]) {
            this.setState({ activeStep: 0 });
            this.refs.personalForm.focusFail();
        }
        // When contactValid is false
        else if (!result[2]) {
            this.setState({ activeStep: 1 });
            this.refs.contactInfoForm.focusFail();
        }
        // When contactPerValid is false
        else if (!result[3]) {
            this.setState({ activeStep: 2 });
            this.contactPersonRef.focusErrorPanel();
        }
        // When paperBasedRecValid is false
        else if (!result[4]) {
            this.setState({ activeStep: 4 });
            this.miscellaneousRef.focusPaperBasedFail();
        }
        // When patientReminderValid is false
        else if (!result[5]) {
            this.setState({ activeStep: 4 });
            this.miscellaneousRef.focusPatientReminderFail();
        }
        // When waiverInfoValid is false
        else if (!result[6]) {
            this.setState({ activeStep: 4 });
            this.miscellaneousRef.focusWaiverInfoFail();
        }
        // Invalid service specific
        else if (!result[7]) this.setState({ activeStep: 5 });
        this.props.closeCommonCircular();
    });
    this.setState({ isSubmit: false });
  });
  }

  btnCreateGeneralPublicPMIOnClick = (e, closeTab) => {
    let patient = _.cloneDeep(this.props.patientBaseInfo);
    patient[RegFieldName.PATIENT_STATUS] = 'P';
    patient[RegFieldName.PENSIONER] = 0;
    this.props.updateState({ patientBaseInfo: patient }).then(() => {
      this.btnSaveOnClick(e, closeTab);
    });
  }

  transformToGroupCd = () => {
    let defaultLangGroup = '';
    const { patientBaseInfo, languageData } = this.props;
    const langGroupList = languageData.codeLangGroupDtos;
    langGroupList.forEach((item) => {
      let filterPreferredLangList = languageData && languageData.codePreferredLangMap && languageData.codePreferredLangMap[item.langGroupCd] && languageData.codePreferredLangMap[item.langGroupCd].filter(itemObj => itemObj.preferredLangCd == patientBaseInfo.preferredLangCd);
      if (filterPreferredLangList && filterPreferredLangList.length == 1) {
        defaultLangGroup = filterPreferredLangList[0] && filterPreferredLangList[0].langGroupCd;
      } else if (filterPreferredLangList && filterPreferredLangList.length == 2) {
        defaultLangGroup = filterPreferredLangList[1] && filterPreferredLangList[1].langGroupCd;

      }
    });
    return defaultLangGroup || langGroupList[0].langGroupCd;
  }

  integrateContactPerson = (contactPersonList) => {
    let cplist = [];
    contactPersonList.forEach(contactPerson => {
      if (RegUtil.isContactPersonDirty(contactPerson)) {
        let availPhoneList = RegUtil.getAvailablePhoneList(contactPerson.contactPhoneList);
        contactPerson.contactPhoneList = availPhoneList;
        //check if change address format only
        if (contactPerson[RegFieldName.CHANGE_ADDRESS_FORMAT]) {
          cplist.push(contactPerson);
        }
        else {
          delete contactPerson[RegFieldName.CHANGE_ADDRESS_FORMAT];
          cplist.push(contactPerson);
        }
      }
      delete contactPerson.regionCode;
      delete contactPerson.districtCode;
      delete contactPerson.subDistrictCode;
    });
    return cplist;
  }

  integrationPatient = () => {
    let patientParams = _.cloneDeep(this.props.patientById);

    //handle phone
    patientParams.phoneList = RegUtil.getAvailablePhoneList(this.props.phoneList);

    patientParams = _.assign(patientParams, this.props.patientBaseInfo);
    patientParams = _.assign(patientParams, this.props.assoPersonInfo);
    patientParams.assoPersHkid = PatientUtil.getCleanHKIC(patientParams.assoPerHKID);
    patientParams.assoPersName = patientParams.assoPerName;
    patientParams.assoPersRlatSts = patientParams.assoPerReltship;
    delete patientParams.assoPerHKID;
    delete patientParams.assoPerName;
    delete patientParams.assoPerReltship;

    patientParams = _.assign(patientParams, this.props.patientContactInfo);
    patientParams = _.assign(patientParams, this.props.patientSocialData);
    patientParams.contactPersonList = this.integrateContactPerson(this.props.contactPersonList);
    patientParams.addressList = [];
    patientParams.pmiPersPaperBasedList = (patientParams.pmiPersPaperBasedList || []).filter(x => !RegUtil.isPmiPaperBasedActive(x, this.props.serviceCd));
    patientParams.pmiPersRemarkList = (patientParams.pmiPersRemarkList || []).filter(x => !RegUtil.isPmiPersRemarkActive(x, this.props.serviceCd, this.props.clinicCd));
    patientParams.pmiPersWaiverList = [];
    patientParams.dtsElctrncCommCnsntUpdDtm = patientParams.dtsElctrncCommCnsntUpdDtm ? moment(patientParams.dtsElctrncCommCnsntUpdDtm).format(Enum.DATE_FORMAT_EYMD_VALUE) : '';
    const curAddressList = this.genAddressDataList();
    const curPaperBasedRecList = _.cloneDeep(this.props.paperBasedRecordList);
    const curReminderList = _.cloneDeep(this.props.patientReminderList);
    const curWaiverList = _.cloneDeep(this.props.waiverList);
    // const checkedMeans=patientParams.pmiPatientCommMeanList.filter(item=>item.status==='A');
    // if(checkedMeans.length===0){
    //   delete patientParams.commLangCd;
    // }
    let docPairList = RegUtil.genDocPairList(patientParams, this.props.serviceCd);
    patientParams.documentPairList = docPairList;


    //check if all address is dirty
    if (curAddressList.length > 0) {
      patientParams.addressList = curAddressList;
    }

    //handle miscellaneous
    if (curPaperBasedRecList.length > 0) {
      curPaperBasedRecList.forEach(paperBasedRec => {
        // delete paperBasedRec.seq;
        if (!paperBasedRec.isEmpty) {
          delete paperBasedRec.seq;
          delete paperBasedRec.isEmpty;
          patientParams.pmiPersPaperBasedList.push(paperBasedRec);
        }
      });
    }

    if (curReminderList.length > 0) {
      curReminderList.forEach(reminderRec => {
        // delete reminderRec.seq;
        if (!reminderRec.isEmpty) {
          delete reminderRec.seq;
          delete reminderRec.isEmpty;
          patientParams.pmiPersRemarkList.push(reminderRec);
        }
      });
    }

    if (curWaiverList.length > 0) {
      curWaiverList.forEach(waiverRec => {
        if (!waiverRec.isEmpty) {
          waiverRec.startDate = waiverRec.startDate !== null ? waiverRec.startDate.format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
          waiverRec.endDate = waiverRec.endDate !== null ? waiverRec.endDate.format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
          waiverRec.issueDate = waiverRec.issueDate !== null ? waiverRec.issueDate.format(Enum.DATE_FORMAT_EYMD_VALUE) : null;
          delete waiverRec.seq;
          delete waiverRec.isEmpty;
          patientParams.pmiPersWaiverList.push(waiverRec);
        }

      });
    }

    //delete data field
    delete patientParams.hkid;
    delete patientParams.otherDocNo;
    delete patientParams.docTypeCd;

    patientParams.dob = RegUtil.getDateByFormat(patientParams.exactDobCd, patientParams.dob).format(Enum.DATE_FORMAT_EYMD_VALUE);

    const preferredLangList = this.props.languageData && this.props.languageData.codePreferredLangMap && this.props.languageData.codePreferredLangMap[this.transformToGroupCd()];

    let params = {
      ...patientParams,
      preferredLangCd: (this.props.patientBaseInfo.preferredLangCd != 'E' && this.props.patientBaseInfo.preferredLangCd) || (preferredLangList && preferredLangList[0] && preferredLangList[0].preferredLangCd)
    };
    this.integratedPatient = params;
  }

  checkProblemPMIAndSave = (isNextRegClick) => {
    this.props.closeCommonCircular();
    const documentPairList = this.integratedPatient.documentPairList;
    this.props.checkValidPMIExist({
      documentPairList,
      excludePatient: this.integratedPatient.patientKey || '',
      status: 'save',
      callback: () => {
        this.doSavePatient(isNextRegClick);
      }
    });
  }

  doRegister = (isNextRegClick) => {
    this.integrationPatient();
    const { docTypeCodeList } = this.props;
    const isPrimaryUnique = PatientUtil.isPrimaryDocTypeUnique(this.integratedPatient.documentPairList, docTypeCodeList);
    if (!isPrimaryUnique) {
      this.doSavePatient(isNextRegClick);
    } else {
      this.checkProblemPMIAndSave(isNextRegClick);
    }
  }

  // NOTE doSavePatient Add next patient handler
  doSavePatient = (isNextRegClick) => {
      const { isCompleteClick } = this.state;
      const isAdd = this.props.patientOperationStatus === ButtonStatusEnum.ADD;
      const isEdit = this.props.patientOperationStatus === ButtonStatusEnum.EDIT;
      // console.log('doSavePatient', isNextRegClick, isCompleteClick);
      let patient = _.cloneDeep(this.integratedPatient);
      if (patient) {
          if (isEdit) this.updatePatient(patient, isNextRegClick, isCompleteClick);
          else if (isAdd)
              this.savePatient(patient, isNextRegClick, isCompleteClick);
          this.props.closeCommonCircular();
          this.integratedPatient = null;
      }
  }

  updatePatient = (patient, isNextRegClick, isCompleteClick) =>{
      this.props.auditAction(`Edit patient/client. PMI: ${patient.patientKey}`);

      patient.userId = 'admin';
      patient.clinicCd = 'A2';
      // patient.loginName = this.state.loginName;
      // patient.password = this.state.password;

      const successCallback = (patientKey, isEnrollEhsMember = false) => {
        if (isNextRegClick || isCompleteClick) {
          // store patient info into registeredPatientList
          this.handleRegPatientList(patientKey, patient);
          if (isCompleteClick)
              this.setState({ isSummaryDialogOpen: true }, () => this.setState({ isCompleteClick: false }));
          //  clear form data
          this.resetFields();
        } else{
            this.setState({ isNextReg: false, isNewFamily: false, registeredPatientList: [] });
            if (this.props.via === viaSts.NEW_REG  && !isEnrollEhsMember) {
                this.skipToPatientList(this.props.doCloseCallbackFunc);
            } else {
              this.skipToPatientSummary(patientKey, this.props.doCloseCallbackFunc, isEnrollEhsMember);
            }
        }
      };

      const isEnrollEhsMember = this.props.serviceCd === SERVICE_CODE.EHS && !isApplyEhsMember(patient.ehsMbrSts) && patient?.isApplyEhsMember === Enum.COMMON_YES;

      if(!isEnrollEhsMember) {
          this.props.updatePatient(patient, (patientKey) => successCallback(patientKey));
      } else {
          patient.patientEhsDto.siteId = this.props.siteId;
          this.props.enrollEhsMember(patient, (patientKey) => successCallback(patientKey, isEnrollEhsMember));
      }
  }

  savePatient = (patient, isNextRegClick, isCompleteClick)=>{
      this.props.auditAction('Create patient/client.');
      this.props.registerPatient(patient, (patientKey) => {
          if (isNextRegClick || isCompleteClick) {
              // store patient info into registeredPatientList
              this.handleRegPatientList(patientKey, patient);
              if (isCompleteClick)
                  this.setState({ isSummaryDialogOpen: true }, () => this.setState({ isCompleteClick: false }));
              //  clear form data
              this.resetFields();
          } else {
              this.setState({ isNextReg: false, isNewFamily: false, registeredPatientList: [] });
              this.skipToPatientSummary(patientKey, this.props.doCloseCallbackFunc, this.props.serviceCd === SERVICE_CODE.EHS && patient?.isApplyEhsMember === Enum.COMMON_YES);
              const linkPara = this.props.linkPmiData;
              this.props.updatePmiData('linkPmiData',
              {
                  anonymousPatientKey: linkPara.anonymousPatientKey,
                  appointmentId: linkPara.appointmentId,
                  patientKey: patientKey,
                  enCounter: linkPara.enCounter,
                  room: linkPara.room,
                  apptTime: linkPara.apptTime,
                  encntrTypeId:linkPara.encntrTypeId
              });
          }
      });
  }

  handleRegPatientList =(patientKey , patient)=>{
    const { familyNoType, getPatientGrp } = this.props;
    const { registeredPatientList } = this.state;
    // if type === NEW => get new group name by patientKey
    if (familyNoType === familyNoTypes.NEW) {
        getPatientGrp(patientKey, (result) => {
            const newRegisteredPatientList = RegUtil.summaryPatientListGenerator(
                registeredPatientList,
                patientKey,
                patient,
                result.pmiGrpId,
                result.pmiGrpName
            );
            this.setState(
                { registeredPatientList: newRegisteredPatientList, isNextReg: true, isNewFamily: true },
                () => this.setState({ isNewFamily: false })
            );
          this.props.closeCommonCircular();
        });
      } else {
        const newRegisteredPatientList = RegUtil.summaryPatientListGenerator(
            registeredPatientList,
            patientKey,
            patient
        );
        this.setState({ registeredPatientList: newRegisteredPatientList, isNextReg: true });
    }
  }

  skipToPatientList = (closeTab) => {
    if (closeTab) {
      closeTab(true);
    } else {
      this.props.deleteTabs(accessRightEnum.registration);
    }
  }

  skipToPatientSummary = (patientKey, closeTab, isApplyEhsMember) => {
    this.props.getPatientPanelPatientById({
      patientKey: patientKey,
      callBack: (patient) => {
        if(this.state.pucChecking) {
          this.props.putPatientPUC(_.cloneDeep(this.state.pucChecking));
          //reset the pucChecking params
          this.setState({ pucChecking: null });
        }
        if (isApplyEhsMember && commonUtilities.getEhsSharedComponentsStore()) {
            const { openPrintAcknowledgeLetterDialog } = commonUtilities.getEhsSharedComponentsStore().getState().sharedComponents;
            commonUtilities.getEhsSharedComponentsStore().dispatch(openPrintAcknowledgeLetterDialog(patient));
        }
      }
    });
    if (closeTab) {
      closeTab(true);
    } else {
      this.props.deleteTabs(accessRightEnum.registration);
    }
    this.props.skipTab(accessRightEnum.patientSummary, null, true);
  }

  btnEditOnClick = () => {
    this.props.auditAction(AlsDedsc.EDIT, null, null, false, 'patient');
    this.props.updateState({ via: viaSts.NEW_REG });
    this.props.updatePatientOperateStatus(ButtonStatusEnum.EDIT);
  }

  btnCancelOnClick = () => {
      this.props.auditAction(AlsDedsc.CANCEL, null, null, false, 'patient');
      // this.contactInfoRef.resetState();
      // this.contactPersonRef.resetState();
      // this.setState({ activeStep: 0 });
      // this.resetAllValidation();
      // this.personalParticularsRef.resetSearchGroup();
      // this.props.resetAll();
      CommonUtil.runDoClose(this.state.doClose, accessRightEnum.registration);
  }

  resetFields =()=>{
      this.setState({ isReset: true }, () => {
          this.contactInfoRef.resetState();
          this.contactPersonRef.resetState();
          this.setState({ activeStep: 0 });
          this.resetAllValidation();
          this.personalParticularsRef.resetSearchGroup();
          this.props.resetAll();
          this.setState({ isReset: false, isNextRegClick: false });
      });
  }

  resetAllValidation = () => {
    this.refs.personalForm.resetValidations();
    this.refs.contactInfoForm.resetValidations();
    this.refs.contactPersonForm.resetValidations();
    this.refs.miscellaneousForm.resetValidations();
    this.miscellaneousRef.clearAllErrMsg();
  }

  checkContactPersonValid = (isIncludeRequired) => {
    return this.refs.contactPersonForm.isFormValid(false, isIncludeRequired);
  }

  checkPersonalFormValid = (isIncludeRequired) => {
    return this.refs.personalForm.isFormValid(false, isIncludeRequired);
  }

  isCurrentUserHaveAccess = (rightCd) => {
    // const { accessRights } = this.props;
    // if (rightCd === accessRightEnum.changePatientMajorKey && this.state.openApproval === APPRStatus.CHINESENAME) {
    //   return true;
    // }
    // return accessRights && accessRights.findIndex(item => item.name === rightCd) > -1;
    if (this.state.openApproval === APPRStatus.CHINESENAME) {
      return true;
    } else {
      return false;
    }
  }

  handleConfirmApproval = () => {
    let { staffId } = this.state;

    this.props.auditAction(`Confirm Patient Major Key Change. Approver Staff ID: ${staffId}`, null, null, false, 'patient');

    const confirmAndSave = () => {
      this.props.openCommonCircular();
      this.doRegister();
      this.setState({ openApproval: APPRStatus.CLOSE, staffId: '' });
    };
    if (this.isCurrentUserHaveAccess(accessRightEnum.changePatientMajorKey)) {
      confirmAndSave();
      return;
    }
    this.props.checkAccessRightByStaffId(staffId, accessRightEnum.changePatientMajorKey, (isHaveRight) => {
      if (isHaveRight === 'Y') {
        confirmAndSave();
      } else {
        this.props.openCommonMessage({ msgCode: '110146' });
      }
    });
  }

  handleConfirmProblemDialog = () => {
    let { problemDialogStatus, staffId } = this.state;

    const confirmAndSave = (name) => {
      const { patientById } = this.props;
      this.props.openCommonCircular();
      const _callback = () => {
        if (problemDialogStatus === PDStatus.OPENBYSAVE) {
          this.doSavePatient();
        } else {
          this.props.getPatientById(patientById.patientKey);
        }
        this.setState({ problemDialogStatus: PDStatus.CLOSE, staffId: '' });
        this.props.closeCommonCircular();
      };

      const { problemDialogList } = this.props;
      const keyList = problemDialogList.map(item => item.patientKey);
      if (keyList.length > 0) {
        this.props.auditAction(`Confirm Mark Problem PMI. Approver staff ID: ${staffId}`);
        this.props.confirmProblemPatient({
          patientKeyList: keyList,
          loginName: name,
          callback: _callback
        });
      }
    };

    this.props.checkAccessRightByStaffId(staffId, accessRightEnum.markProblemPatient, (isHaveRight) => {
      if (isHaveRight === 'Y') {
        confirmAndSave(this.props.loginName);
      } else {
        this.props.openCommonMessage({ msgCode: '110144' });
      }
    });
  }

  markAsProblemPMI = () => {
    this.props.listValidForProblemPMI();
    this.setState({ problemDialogStatus: PDStatus.OPEN });
  }

  validMiscellaneous = (isIncludeRequired) => {
    return this.refs.miscellaneousForm.isFormValid(false, isIncludeRequired);
  }

  isDisplayProblemBtn = () => {
    const { isProblemPMI, isPrimaryUnique, patientOperationStatus } = this.props;
    return !isProblemPMI && isPrimaryUnique && patientOperationStatus === ButtonStatusEnum.DATA_SELECTED ? true : false;
  }

  isDisplayNewRegistrationBtn = () => {
    const { isProblemPMI, isPrimaryUnique, patientOperationStatus } = this.props;
    return (isProblemPMI || !isPrimaryUnique) && patientOperationStatus === ButtonStatusEnum.DATA_SELECTED ? true : false;
  }

  checkIsDirty = () => {
    const { isPageDirty } = this.props;
    return isPageDirty;
  }

  initDoClose = () => {
    const saveFunc = (closeTab) => {
      this.btnSaveOnClick(null, closeTab);
    };
    const discardFunc = (closeTab) => {
      if (this.props.via === viaSts.NEW_REG || !this.props.via) {
        this.skipToPatientList(closeTab);
      } else if (this.props.via === viaSts.PMI_SUM) {
        this.skipToPatientSummary(this.props.patientById.patientKey, closeTab);
      }
    };
    const noChangeFunc = (closeTab) => {
      if (this.props.via === viaSts.NEW_REG || !this.props.via) {
        this.skipToPatientList(closeTab);
      } else if (this.props.via === viaSts.PMI_SUM) {
        this.skipToPatientSummary(this.props.patientById.patientKey, closeTab);
      }
    };
    let doClose = CommonUtil.getDoCloseFunc_1(accessRightEnum.registration, this.checkIsDirty, saveFunc, discardFunc, noChangeFunc);
    this.setState({ doClose: doClose });
    this.props.updateCurTab(accessRightEnum.registration, doClose);
  }

  cancelApproval = () => {
    this.props.auditAction('Cancel Patient Major Key Change', null, null, false, 'patient');
    this.setState({ openApproval: APPRStatus.CLOSE, staffId: '' });
  }

  closeSearchAssoPerDialog = () => {
    this.props.auditAction('Cancel Select Associated Patient', null, null, false, 'patient');
    const _assoPersonInfo = {
      ...this.props.assoPersonInfo,
      assoPerHKID: '',
      assoPerName: ''
    };
    this.props.updateState({
      assoPersList: null,
      openSearchAssoPer: false,
      assoPersonInfo: _assoPersonInfo
    });
  }

  searchSelectAssoPer = (selectPatient) => {
    this.props.auditAction('Select Associated Patient', null, null, false, 'patient');
    if (selectPatient) {
      let patientName = CommonUtil.getFullName(selectPatient.engSurname, selectPatient.engGivename);
      patientName = patientName.substring(0, 160);
      const _assoPersonInfo = {
        ...this.props.assoPersonInfo,
        assoPerName: patientName
      };
      this.props.updateState({ assoPersonInfo: _assoPersonInfo, openSearchAssoPer: false, assoPersList: null });
    }
  }

  closeViewPatDetails = () => {
    this.props.auditAction('Close View Patient Details', null, null, false, 'patient');
    this.props.deleteSubTabs(accessRightEnum.viewPatientDetails);
  }

  openBabyInfoDialog = () => {
    this.setState({ openBabyInfoDialog: true });
    this.props.resetBabyInfo();
  }

  handleSaveBabyInfo = (babyInfo, ccCodeChiChar) => {
    const { patientOperationStatus, patientBaseInfo } = this.props;
    if (patientOperationStatus === ButtonStatusEnum.ADD) {
      let _patientBaseInfo = _.cloneDeep(patientBaseInfo);
      _patientBaseInfo.engSurname = babyInfo.engSurname;
      _patientBaseInfo.engGivename = babyInfo.engGivename;
      _patientBaseInfo.primaryDocNo = babyInfo.docNo;
      _patientBaseInfo.nameChi = babyInfo.nameChi;
      _patientBaseInfo.dob = babyInfo.dob;
      _patientBaseInfo.genderCd = babyInfo.genderCd;
      _patientBaseInfo.exactDobCd = babyInfo.exactDobCd;
      _patientBaseInfo.ccCode1 = '';
      _patientBaseInfo.ccCode2 = '';
      _patientBaseInfo.ccCode3 = '';
      _patientBaseInfo.ccCode4 = '';
      _patientBaseInfo.ccCode5 = '';
      _patientBaseInfo.ccCode6 = '';
      this.props.updateState({
        patientBaseInfo: _patientBaseInfo,
        ccCodeChiChar: ccCodeChiChar
      });
    } else {
      this.patientCoreInfoRef && this.patientCoreInfoRef.saveBabyInfo(babyInfo, ccCodeChiChar);
    }
  }

    // smart card reader component use only
    preFillSmartCardData = (cardData) => {
      let patient = _.cloneDeep(this.props.patientBaseInfo);
      patient.primaryDocTypeCd = Enum.DOC_TYPE.HKID_ID;
      patient.primaryDocNo = cardData?.hkid;
      patient.idSts = 'N';
      patient.nameChi = cardData?.chi_name;

      if (cardData?.eng_name) {
        let eng_name = cardData.eng_name.split(',');
        if (eng_name.length > 1){
          patient.engSurname = eng_name[0].trim().toUpperCase();
          patient.engGivename = eng_name[1].trim().toUpperCase();
        } else {
          if (eng_name.length === 1){
            patient.engSurname = eng_name[0].trim().toUpperCase();
          }
        }
      } else {
        patient.engSurname = '';
        patient.engGivename = '';
      }

      if (cardData?.dob) {
        let dob = cardData.dob;
        if (dob.length == 8){
          let month = dob.substring(4, 6);
          let day = dob.substring(6, 8);
          let year = dob.substring(0, 4);
          if (month == '00') {
            patient.dob = year+'0101';
            patient.exactDobCd = 'EY';
          } else if (day == '00'){
            patient.dob = year + month + '01';
            patient.exactDobCd = 'EMY';
          } else {
            patient.dob = year + month + day;
            patient.exactDobCd = 'EDMY';
          }
        }
      } else {
        patient.dob = '';
        patient.exactDobCd = 'EDMY';
      }

      let updateData = { patientBaseInfo: patient };
      this.props.updateState(updateData);
  }

  handleSearchPMISelect = (selectPatient) => {
    this.props.auditAction('Select PMI');
    if (selectPatient && selectPatient.patientKey) {
      this.props.getPatientById(selectPatient.patientKey, () => {
        this.props.updateState({
          searchPMI: {
            ...this.props.searchPMI,
            selected: null,
            data: null,
            searchParams: null
          },
          isOpenSearchPmiPopup: false
        });
      });
    }
  }

  handleSearchPMIClose = () => {
    this.props.auditAction('Cancel Select PMI', null, null, false, 'patient');
    this.props.updateState({
      searchPMI: {
        ...this.props.searchPMI,
        selected: null,
        data: null,
        searchParams: null
      },
      isOpenSearchPmiPopup: false
    });
  }

  handleCloseEhsContactTelDialog = () => {
    this.setState({openEhsContactTelDialog: false, contactPersonIndex: -1});
  }

  handleOpenEhsContactTelDialog = (contactPersonIndex = -1) => {
    this.setState({openEhsContactTelDialog: true, contactPersonIndex});
  }

  render() {
    const { activeStep, steps, comDisabled, openBabyInfoDialog, isSubmit, isReset, isSummaryDialogOpen, registeredPatientList, isNextReg, isNewFamily, openEhsContactTelDialog, contactPersonIndex} = this.state;
    const {
      classes,
      patientOperationStatus,
      patientBaseInfo,
      patientById,
      changeAddressFormatOnly,
      assoPersList,
      problemDialogList,
      docTypeCodeList,
      serviceCd,
      openSearchAssoPer,
      viewPatDetails,
      hasIdentify,
      babyInfo,
      siteParams,
      siteId,
      isOpenSearchPmiPopup,
      searchPMI,
      familyNoType
    } = this.props;
    const isDisplayEditBtn = patientOperationStatus === ButtonStatusEnum.DATA_SELECTED ? true : false;
    const isDisplayProblemBtn = this.isDisplayProblemBtn();
    const isDisplayNewRegistrationBtn = this.isDisplayNewRegistrationBtn();
    const isLackHKMobile = this.isLack_SMS_MobilePhone();
    const isDisplayCreateGeneralPublicBtn = serviceCd === 'DTS' && !comDisabled && patientOperationStatus !== ButtonStatusEnum.EDIT;
    const isNewPmiSearchResultDialog = SiteParamsUtil.getIsNewPmiSearchResultDialogSiteParams(siteParams, serviceCd, siteId);

    // console.log(patientBaseInfo, registeredPatientList, isNextReg, patientOperationStatus);
    return (
      <Grid className={classes.root}>
        <Grid className={classes.stepperGrid}>
          <Stepper className={classes.stepper} nonLinear activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepButton
                    className={classes.stepperButton}
                    onClick={() => { this.handleStep(index); }}
                    completed={index < activeStep}
                    tabIndex={-1}
                    id={`registration_${label}_step_icon`}
                >
                  {label}
                  {index === 0 ? <span style={{ color: 'red' }}>*</span> : null}
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Grid>
        <Grid className={classes.content}>
          <ValidatorForm className={activeStep !== 0 ? classes.hidden : null} ref="personalForm">
            <MuiThemeProvider theme={customTheme}>
              <PersonalParticulars
                  innerRef={ref => this.personalParticularsRef = ref}
                  comDisabled={comDisabled || viewPatDetails}
                  checkPersonalFormValid={this.checkPersonalFormValid}
                  focusFail={() => { this.refs.personalForm && this.refs.personalForm.focusFail(); }}
                  openBabyInfoDialog={this.openBabyInfoDialog}
                  isNextReg={isNextReg}
                  isNewFamily={isNewFamily}
                  registeredPatientList={registeredPatientList}
                  preFillSmartCardData={this.preFillSmartCardData}
              />
            </MuiThemeProvider>
          </ValidatorForm>
          <ValidatorForm className={activeStep !== 1 ? classes.hidden : null} ref="contactInfoForm">
            <ContactInformation
                innerRef={r => this.contactInfoRef = r}
                comDisabled={comDisabled || viewPatDetails}
                isLackHKMobile={isLackHKMobile}
                resetValidators={() => { this.refs.contactInfoForm.resetValidations(); }}
                openEhsContactTelDialog={() => this.handleOpenEhsContactTelDialog()}
            />
          </ValidatorForm>
          <ValidatorForm className={activeStep !== 2 ? classes.hidden : null} ref="contactPersonForm">
            <ContactPerson
                innerRef={r => this.contactPersonRef = r}
                comDisabled={comDisabled || viewPatDetails}
                checkContactValid={this.checkContactPersonValid}
                resetValidations={() => { this.refs.contactPersonForm.resetValidations(); }}
                changeAddressFormatOnly={changeAddressFormatOnly}
                formEntity={this.refs.contactPersonForm}
                openEhsContactTelDialog={(contactPersonIndex) => this.handleOpenEhsContactTelDialog(contactPersonIndex)}
            />
          </ValidatorForm>
          <ValidatorForm className={activeStep !== 3 ? classes.hidden : null} ref="socialDataForm">
            <MuiThemeProvider theme={customTheme}>
              <SocialData comDisabled={comDisabled || viewPatDetails} />
            </MuiThemeProvider>
          </ValidatorForm>
          <ValidatorForm className={activeStep !== 4 ? classes.hidden : null} ref={'miscellaneousForm'}>
            <Miscellaneous
                innerRef={ref => this.miscellaneousRef = ref}
                comDisabled={comDisabled || viewPatDetails}
                resetValidators={() => { this.refs.miscellaneousForm.resetValidations(); }}
                checkMiscellaneous={this.validMiscellaneous}
            />
          </ValidatorForm>
          <ValidatorForm className={activeStep !== 5 ? classes.hidden : null}>
            {serviceCd === SERVICE_CODE.EHS && (<EhsServiceSpecific comDisabled={comDisabled || viewPatDetails} />)}
            {serviceCd === 'CGS' && (<ServiceSpecific isNextReg={isNextReg} isSubmit={isSubmit} isReset={isReset} comDisabled={comDisabled || viewPatDetails} isDisplayEditBtn={isDisplayEditBtn} />)}
          </ValidatorForm>
        </Grid>
        {
          viewPatDetails ?
            <CIMSButtonGroup
                buttonConfig={
                [
                  {
                    id: 'viewPatientDetails_btn_close',
                    name: 'Close',
                    onClick: this.closeViewPatDetails
                  }
                ]
              }
            /> :
            <>
              <CIMSButtonGroup
                  classes={{ leftFooter: classes.markAsPMIBtn }}
                  buttonConfig={
                  [
                    {
                      id: 'registration_btn_mark_as_problem_pmi',
                      name: 'Mark as Problem PMI',
                      style: { display: isDisplayProblemBtn ? '' : 'none' },
                      disabled: patientOperationStatus !== ButtonStatusEnum.DATA_SELECTED,
                      onClick: this.markAsProblemPMI
                    }
                  ]
                }
                  isLeft
              />
              {/* NOTE Button Group */}
              <CIMSButtonGroup
                  buttonConfig={isDisplayCreateGeneralPublicBtn ? [
                  {
                    id: 'registration_btn_goto_newRegistration',
                    name: 'Create New',
                    classes: { sizeSmall: classes.buttonRoot },
                    className: `${isDisplayNewRegistrationBtn ? null : classes.hidden}`,
                    disabled: patientOperationStatus !== ButtonStatusEnum.DATA_SELECTED,
                    onClick: this.btnCreateNew
                  },
                  {
                    id: 'registration_btn_goto_createGeneralPublicPMI',
                    name: 'Create General Public PMI',
                    disabled: comDisabled,
                    onClick: this.btnCreateGeneralPublicPMIOnClick,
                    classes: { sizeSmall: classes.buttonRoot }
                  },
                  {
                    id: 'registration_btnBack',
                    name: 'Back',
                    className: `${activeStep === 0 ? classes.hidden : null}`,
                    classes: { sizeSmall: classes.buttonRoot },
                    onClick: this.btnBackOnClick
                  },
                  {
                    id: 'registration_btnNext',
                    name: 'Next',
                    className: `${activeStep >= steps.length - 1 ? classes.hidden : null}`,
                    onClick: this.btnNextOnClick,
                    disabled: comDisabled && !isDisplayEditBtn,
                    classes: { sizeSmall: classes.buttonRoot }
                  },
                  {
                    id: serviceCd === 'CGS' ? 'registration_btnNextPmiReg' : '',
                    name: serviceCd === 'CGS' ? 'Next PMI Reg' : '',
                    onClick:  serviceCd === 'CGS' ? this.btnOnNextReg : null,
                    disabled: comDisabled || familyNoType === 'NONE',
                    classes: { sizeSmall: classes.buttonRoot },
                    className: serviceCd === 'CGS' && (isNextReg || ![ButtonStatusEnum.EDIT, ButtonStatusEnum.DATA_SELECTED].includes(patientOperationStatus)) ? '' : `${classes.hidden}`
                  },
                  {
                    id: 'registration_btnSave',
                    name: serviceCd === 'CGS' && isNextReg ?  'Complete' : 'Save',
                    disabled: comDisabled && !isNextReg || isDisplayEditBtn,
                    onClick: serviceCd === 'CGS' && isNextReg ? this.btnOnComplete: this.btnSaveOnClick,
                    classes: { sizeSmall: classes.buttonRoot }
                  },
                  {
                    id: 'registration_btnEdit',
                    name: 'Edit',
                    disabled: !isDisplayEditBtn,
                    onClick: this.btnEditOnClick,
                    classes: { sizeSmall: classes.buttonRoot }
                  },
                  {
                    id: 'registration_btnCancel',
                    name: 'Cancel',
                    disabled: comDisabled && !isDisplayEditBtn,
                    onClick: isDisplayEditBtn || isNextReg ? this.resetFields : this.btnCancelOnClick,
                    classes: { sizeSmall: classes.buttonRoot }
                  }
                ] :
                  [
                    {
                      id: 'registration_btn_goto_newRegistration',
                      name: 'Create New',
                      classes: { sizeSmall: classes.buttonRoot },
                      className: `${isDisplayNewRegistrationBtn ? null : classes.hidden}`,
                      disabled: patientOperationStatus !== ButtonStatusEnum.DATA_SELECTED,
                      onClick: this.btnCreateNew
                    },
                    {
                      id: 'registration_btnBack',
                      name: 'Back',
                      className: `${activeStep === 0 ? classes.hidden : null}`,
                      classes: { sizeSmall: classes.buttonRoot },
                      onClick: this.btnBackOnClick
                    },
                    {
                      id: 'registration_btnNext',
                      name: 'Next',
                      className: `${activeStep >= steps.length - 1 ? classes.hidden : null}`,
                      onClick: this.btnNextOnClick,
                      disabled: comDisabled && !isDisplayEditBtn,
                      classes: { sizeSmall: classes.buttonRoot }
                    },
                    {
                      id: serviceCd === 'CGS' ? 'registration_btnNextPmiReg' : '',
                      name: serviceCd === 'CGS' ? 'Next PMI Reg' : '',
                      onClick:  serviceCd === 'CGS' ? this.btnOnNextReg : null,
                      disabled: comDisabled || familyNoType === 'NONE',
                      classes: { sizeSmall: classes.buttonRoot },
                      className: serviceCd === 'CGS' && (isNextReg || ![ButtonStatusEnum.EDIT, ButtonStatusEnum.DATA_SELECTED].includes(patientOperationStatus)) ? '' : `${classes.hidden}`
                    },
                    {
                      id: 'registration_btnSave',
                      name: serviceCd === 'CGS' && isNextReg ?  'Complete' : 'Save',
                      disabled: comDisabled && !isNextReg || isDisplayEditBtn,
                      onClick: serviceCd === 'CGS' && isNextReg ? this.btnOnComplete: this.btnSaveOnClick ,
                      classes: { sizeSmall: classes.buttonRoot }
                    },
                    {
                      id: 'registration_btnEdit',
                      name: 'Edit',
                      disabled: !isDisplayEditBtn,
                      onClick: this.btnEditOnClick,
                      classes: { sizeSmall: classes.buttonRoot }
                    },
                    {
                      id: 'registration_btnCancel',
                      name: 'Cancel',
                      disabled: comDisabled && !isDisplayEditBtn,
                      onClick: isDisplayEditBtn || isNextReg ? this.resetFields : this.btnCancelOnClick,
                      classes: { sizeSmall: classes.buttonRoot }
                    }
                  ]
                }
              />
            </>
        }
        {
          viewPatDetails ?
            null :
            <>
              <ApprovalDialog
                  open={this.state.openApproval !== APPRStatus.CLOSE}
                  confirm={this.handleConfirmApproval}
                  cancel={this.cancelApproval}
                // approverName={this.state.loginName}
                // approverPassword={this.state.password}
                  staffId={this.state.staffId}
                  onChange={(value, name) => this.setState({ [name]: value })}
                  existingInfo={patientById}
                  newInfo={patientBaseInfo}
                  docTypeCodeList={docTypeCodeList}
                  isUserHaveAccess={this.isCurrentUserHaveAccess(accessRightEnum.changePatientMajorKey)}
              />
              {
                isOpenSearchPmiPopup ?
                  isNewPmiSearchResultDialog ?
                    <NewPMISearchResultDialog
                        id="registration_searchDialog"
                        title="PMI Record"
                        results={searchPMI.data && searchPMI.data.patientDtos || []}
                        header={
                          <Grid item xs={12}>
                            <Typography color="error" className={classes.errorTips}>
                              Please review all record(s) and identify those required to be marked as ‘Problem PMI’ before creating new registration:
                            </Typography>
                          </Grid>
                        }
                        okBtnProps={{ children: 'Select' }}
                        handleSelectPatient={this.handleSearchPMISelect}
                        handleCloseDialog={this.handleSearchPMIClose}
                    />
                    :
                    <SearchPMIDialog id="registration_searchDialog" />
                  :
                  null
              }
              <ProblemPMIDialog
                  id="registration_problemDialog"
                  open={this.state.openApproval === APPRStatus.CLOSE && this.state.problemDialogStatus !== PDStatus.CLOSE}
                // approverName={this.state.loginName}
                // approverPassword={this.state.password}
                  staffId={this.state.staffId}
                  onChange={(value, name) => this.setState({ [name]: value })}
                  onClose={() => {
                  this.props.auditAction('Cancel Mark Problem PMI', null, null, false, 'patient');
                  this.setState({ problemDialogStatus: PDStatus.CLOSE, staffId: '' });
                  this.props.updateState({ problemDialogList: [] });
                }}
                  onConfirm={this.handleConfirmProblemDialog}
                  data={problemDialogList}
                  docTypeCodeList={docTypeCodeList}
              // isUserHaveAccess={this.isCurrentUserHaveAccess(accessRightEnum.markProblemPatient)}
              />
              {
                (assoPersList || []).length > 1 ?
                  isNewPmiSearchResultDialog?
                    <NewPMISearchResultDialog
                        id="registration_associated_person_search_dialog"
                        title="Search Result"
                        results={assoPersList || []}
                        handleCloseDialog={this.closeSearchAssoPerDialog}
                        handleSelectPatient={this.searchSelectAssoPer}
                    />
                    :
                    <PatientSearchResultDialog
                        id="registration_associated_person_search_dialog"
                        searchResultList={assoPersList || []}
                        handleCloseDialog={this.closeSearchAssoPerDialog}
                        handleSelectPatient={this.searchSelectAssoPer}
                    />
                    : null
              }
              {
                hasIdentify ?
                  <PatientInfoDialog
                      innerRef={ref => this.patientCoreInfoRef = ref}
                      getCoreFieldProps={this.personalParticularsRef && this.personalParticularsRef.getCoreFieldProps}
                  /> : null
              }
              {
                openBabyInfoDialog ?
                  <BabyInfoDialog
                      id={'babyInfoDialog'}
                      openBabyInfoDialog
                      babyInfo={babyInfo}
                      handleSave={this.handleSaveBabyInfo}
                      handleCloseDialog={() => {
                        this.setState({ openBabyInfoDialog: false });
                      }}
                  /> : null
              }
              {
                openEhsContactTelDialog ? (
                    <ContactTelDialog
                        open={openEhsContactTelDialog}
                        handleOnClose={() => this.handleCloseEhsContactTelDialog()}
                        activeStep={activeStep}
                        steps={steps}
                        contactPersonIndex={contactPersonIndex}
                    />
                  ) : null
              }
            </>
        }
        <MultiRegSummaryDialog
            isSummaryDialogOpen={isSummaryDialogOpen}
            toggle={() => this.setState({ isSummaryDialogOpen: !isSummaryDialogOpen })}
            skipToPatientSummary={this.skipToPatientSummary}
            registeredPatientList={registeredPatientList}
        />
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    patientOperationStatus: state.registration.patientOperationStatus,
    isOpenPatientDialog: state.registration.isOpenPatientDialog,
    patientErrorMessage: state.registration.patientErrorMessage,
    patientErrorData: state.registration.patientErrorData,
    patientList: state.registration.patientList,
    patientBaseInfo: state.registration.patientBaseInfo,
    patientContactInfo: state.registration.patientContactInfo,
    patientSocialData: state.registration.patientSocialData,
    contactPersonList: state.registration.contactPersonList,
    addressList: state.registration.addressList,
    phoneList: state.registration.phoneList,
    patientById: state.registration.patientById,
    languageData: state.patient.languageData,
    serviceCd: state.login.service.serviceCd,
    clinicCd: state.login.clinic.clinicCd,
    siteId: state.login.clinic.siteId,
    accessRights: state.login.accessRights,
    changeAddressFormatOnly: state.registration.changeAddressFormatOnly,
    paperBasedRecordList: state.registration.paperBasedRecordList,
    patientReminderList: state.registration.patientReminderList,
    waiverList: state.registration.waiverList,
    service: state.login.service,
    loginName: state.login.loginInfo.loginName,
    isProblemPMI: state.registration.isProblemPMI,
    isPrimaryUnique: state.registration.isPrimaryUnique,
    problemDialogList: state.registration.problemDialogList,
    docTypeCodeList: state.common.commonCodeList.doc_type,
    countryList: state.patient.countryList,
    linkPmiData: state.bookingInformation.linkPmiData,
    doCloseCallbackFunc: state.registration.doCloseCallbackFunc,
    assoPersList: state.registration.assoPersList,
    openSearchAssoPer: state.registration.openSearchAssoPer,
    assoPersonInfo: state.registration.assoPersonInfo,
    viewPatDetails: state.registration.viewPatDetails,
    hasIdentify: state.registration.hasIdentify,
    babyInfo: state.registration.babyInfo,
    siteParams: state.common.siteParams,
    searchPMI: state.registration.searchPMI,
    isOpenSearchPmiPopup: state.registration.isOpenSearchPmiPopup,
    patient:state.patient,
    isFamilyNoValid: state.registration.isFamilyNoValid,
    isServiceSpecificFormValid: state.registration.isServiceSpecificFormValid,
    familyNoType: state.registration.patientBaseInfo.familyNoType,
    tabs: state.mainFrame.tabs,
    via: state.registration.via,
    isPageDirty: state.registration.isPageDirty
  };
}

const dispatchProps = {
  getCodeList,
  resetAll,
  updatePatientOperateStatus,
  getPatientById,
  openCommonCircular,
  closeCommonCircular,
  updatePatient,
  registerPatient,
  updateState,
  openCommonMessage,
  updateTabLabel,
  getLanguageList,
  refreshServiceStatus,
  resetPatient,
  getPatientPanelPatientById,
  skipTab,
  deleteTabs,
  deleteSubTabs,
  listValidForProblemPMI,
  checkValidPMIExist,
  confirmProblemPatient,
  checkAccessRightByStaffId,
  initMiscellaneous,
  createNewPMI,
  patientListDoNewPMI,
  updatePmiData,
  updateCurTab,
  alsLogAudit,
  auditAction,
  openMode,
  resetBabyInfo,
  mapPmiWithProvenDocVal,
  searchPatient,
  checkFamilyNo,
  getPatientGrp,
  addTabs,
  putPatientPUC,
  enrollEhsMember
};

export default connect(mapStateToProps, dispatchProps)(withStyles(useStyle1)(Registration));