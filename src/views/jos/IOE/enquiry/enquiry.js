import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Tooltip, List, ListItem, ListItemIcon, ListItemText, Checkbox } from '@material-ui/core';
import { Help } from '@material-ui/icons';
import { styles } from './enquiryStyle';
import Table from '../enquiry/components/Table/enquiryTable';
import Filter from './components/SearchBox';
import LaboratoryReportDialog from './components/LaboratoryReportDialog/LaboratoryReportDialog';
import EnquiryPatientDialog from './EnquiryPatientDialog';
import InvalidateFormDialog from './components/InvalidateForm/InvalidateFormDialog';
import { Priority1, Priority2, Priority3, Backdate, Urgent, Partial } from '../../../../components/Icons';
import * as actionTypes from '../../../../store/actions/IOE/enquiry/enquiryActionType';
import * as ixRequestActionType from '../../../../store/actions/IOE/ixRequest/ixRequestActionType';
import * as commonActionType from '../../../../store/actions/common/commonActionType';
import * as specimenCollectionActionType from '../../../../store/actions/IOE/specimenCollection/specimenCollectionActionType';
import moment from 'moment';
import * as messageTypes from '../../../../store/actions/message/messageActionType';
import Container from 'components/JContainer';
import JPrinter from '../../../../components/JPrinter/JPrinter';
import classNames from 'classnames';
import _ from 'lodash';
import Typography from '@material-ui/core/Typography';
import { SPECIMEN_COLLECTION_CODE } from '../../../../constants/message/IOECode/specimenCollectionCode';
import * as commonUtils from '../../../../utilities/josCommonUtilties';
import ReminderPrintDialog from '../specimenCollection/components/ReminderPrintDialog';
import { openCommonMessage,closeCommonMessage } from '../../../../store/actions/message/messageAction';
import { openCommonCircularDialog,closeCommonCircularDialog } from '../../../../store/actions/common/commonAction';
import Enum from '../../../../../src/enums/enum';
import * as commonConstants from '../../../../constants/common/commonConstants';
import CustomDateTimePicker from '../specimenCollection/components/DateTimePicker/CustomDateTimePicker';
import * as constants from '../../../../constants/IOE/enquiry/enquiryConstants';
import { getServiceSpecificFunctionInfo,doAllOperationSubmit } from '../../../../store/actions/IOE/ixRequest/ixRequestAction';
import { getOfficerDoctorDropdownList } from '../../../../store/actions/IOE/officerInCharge/officerInChargeAction';
import { IX_REQUEST_CODE } from '../../../../constants/message/IOECode/ixRequestCode';
import { getPatientByIdClinic } from '../../../../store/actions/IOE/laboratoryReport/laboratoryReportAction';
import accessRightEnum from '../../../../enums/accessRightEnum';
import { updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import { getState } from '../../../../store/util';
import * as laboratoryReportActionType from '../../../../store/actions/IOE/laboratoryReport/laboratoryReportActionType';
import { IOE_REQUEST_TYPE } from '../../../../constants/IOE/ixRequest/ixRequestConstants';
const { color, font } = getState((state) => state.cimsStyle) || {};

const legends = {
  'IS_ATTE_HIGH_LOW_CHEM_HAEM': { icon: Priority1, color: '#ff0000', describe: 'Attention High/Low For Chem/Haem' },
  'URGENT': { icon: Urgent, color: '#ff0000', describe: 'Urgent Request/Important result marked by H&C' },
  'IS_BACKDATE_ENCNTR': { icon: Backdate, color: '#0579c8', describe: 'Backdate Encounter' },
  'IS_SUPP_AMEND_HC': { icon: Priority2, color: '#ff0000', describe: 'Attentions Supplementary/Amendment Report for H&C' },
  'IS_WIPEOUT': { icon: Priority3, color: '#ff0000', describe: 'Report Wipeout for H&C' },
  'IS_PARTIAL_MATCHED': { icon: Partial, color: '#ff0000', describe: 'Partial Match on PMI Core Fields(s)' }
};

const Tip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9'
  }
}))((props) => {
  return (
    <Tooltip {...props} title={
      <React.Fragment>
        <List>
          {
            Object.keys(legends).map(key => {
              const item = legends[key];
              return (
                <ListItem key={key}>
                  <ListItemIcon><item.icon style={{ color: item.color }} /></ListItemIcon>
                  <ListItemText>{item.describe}</ListItemText>
                </ListItem>
              );
            })
          }
        </List>
      </React.Fragment>}
    >
      <Help />
    </Tooltip>
  );
});

const commonReportStatus = {
  'Fin': { name: 'FIN', color: '#ff0000', describe: 'Final Report' },
  'N': { name: 'N', color: '#ff0000', describe: 'Report Not Yet Received' },
  'IN': { name: 'IN', color: '#0579c8', describe: 'Interim Report' },
  'Pre': { name: 'Pre', color: '#ff0000', describe: 'Preliminary Report' }
};

const specificReportStatus = {
  'P': { name: 'P', color: '#ff0000', describe: 'Provisional' },
  'PS': { name: 'PS', color: '#ff0000', describe: 'Provisional Supplementary' },
  'FS': { name: 'FS', color: '#0579c8', describe: 'Final Supplementary' },
  'A': { name: 'A', color: '#ff0000', describe: 'Amend Report' },
  'AS': { name: 'AS', color: '#ff0000', describe: 'Amend Supplementary' },
  'X': { name: 'X', color: '#ff0000', describe: 'Report Wipeout' }
};

const ReportStatusTip = withStyles(theme => ({
  tooltip: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    maxWidth: 310
  }

}))((props) => {
  return (
    <Tooltip {...props} title={
      <React.Fragment>
        <List style={{ width: 310 }}>
          <ListItemText>
            <span style={{ marginLeft: 16, textDecoration: 'none', borderBottom: '1px solid' }}>Common Report Status</span>
          </ListItemText>
          {
            Object.keys(commonReportStatus).map(key => {
              const item = commonReportStatus[key];
              return (
                <ListItem style={{ paddingTop: key === 0 ? 'unset' : '0', paddingBottom: key === 0 ? 'unset' : 2 }} key={key}>
                  <ListItemText style={{ width: '30%' }}>{item.name}</ListItemText>
                  <ListItemText style={{ width: '70%' }}>{item.describe}</ListItemText>
                </ListItem>
              );
            })
          }
          <ListItemText>
            <span style={{ marginLeft: 16, textDecoration: 'none', borderBottom: '1px solid' }}> H&C Specific Report Status</span>
          </ListItemText>
          {
            Object.keys(specificReportStatus).map(key => {
              const item = specificReportStatus[key];
              return (
                <ListItem style={{ paddingTop: key === 0 ? 'unset' : '0', paddingBottom: key === 0 ? 'unset' : 2 }} key={key}>
                  <ListItemText style={{ width: '30%' }}>{item.name}</ListItemText>
                  <ListItemText style={{ width: '70%' }}>{item.describe}</ListItemText>
                </ListItem>
              );
            })
          }
        </List>
      </React.Fragment>}
    >
      <Help />
    </Tooltip>
  );
});

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    marginTop: -10,
    backgroundColor: color.cimsBackgroundColor,
    color: 'rgba(0, 0, 0, 1)',
    maxWidth: '100%',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    whiteSpace: 'pre-wrap'
  },
  popper: {
    opacity: 1
  }
}))(Tooltip);


class Enquiry extends Component {
  constructor(props) {
    super(props);
    this.content = React.createRef();
    const { accessRights } = props;
    this.privilegeRepeatForDoctor = false;
    this.privilegeRepeatForNurse = false;
    this.privilegeInvalidateForDoctor = false;
    this.privilegeInvalidateForNurse = false;
    if (accessRights.length > 0) {
      for (let i = 0; i < accessRights.length; i++) {
        const accessRightObj = accessRights[i];
        if (accessRightObj.name === accessRightEnum.ioeRepeatRequestForDocter) {
          this.privilegeRepeatForDoctor = true;
        } else if (accessRightObj.name === accessRightEnum.ioeRepeatRequestForNurse) {
          this.privilegeRepeatForNurse = true;
        } else if (accessRightObj.name === accessRightEnum.ioeInvalidateRequestForDocter) {
          this.privilegeInvalidateForDoctor = true;
        } else if (accessRightObj.name === accessRightEnum.ioeInvalidateRequestForNurse) {
          this.privilegeInvalidateForNurse = true;
        }
      }
    }
    this.state = {
      openTooltip: false,
      LaboratoryReportDialogOpen: false,
      selected: [],
      selectedRequestIds: '',
      invalidateFormDialogOpen: false,
      initialParm: {},
      reminderIsChecked: false,
      lableIsChecked: false,
      outputFormIsChecked: false,
      btnSwith: false,
      wrapperHight: 500,
      templateList: [],
      open: false,
      labelTimes: 0,
      rowsPerPage: 10,
      page: 0,
      rowsPerPageOptions: [10, 20, 50],
      count: 0,
      printReportNum: 1,
      serviceCd: '',
      clinicCd: '',
      disabledFlag: false,
      printDisabledFlag: false,
      selectedRow: [],
      specimentCollectionDTSwitch: true,
      specimentCollectionDT: new Date(),
      clinicOptions: [],
      serviceOptions: [],
      labReportShowFlag: false,
      submitFlagChecked: true,
      labReportFlagChecked: true,
      deleteFormFlagChecked: true,
      repeatOrderFlagChecked: true,
      showFlag: false,
      privilegeRepeatOrder: false,
      privilegeDeleteForm: false,
      specialRemarkPrompt:false
    };
  }

  componentWillMount() {
    this.resetHeight();
    window.addEventListener('resize', this.resetHeight);
    const { location } = this.props;
    let mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';
    let typeName = mode === 'patient' ? 'Investigation Result Enquiry' : 'IOE Enquiry by Clinic';
    this.insertIxEnquiryLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} ${typeName}`, 'ioe/reminderTemplate/reminderTmplsForReport');
  }

  componentDidMount() {
    this.props.ensureDidMount();
    const { dispatch, location, login } = this.props;
    const { clinic } = login;
    document.getElementById('undefined_nextPage').addEventListener('click', this.handleLogPaginationChange);
    document.getElementById('undefined_lastPage').addEventListener('click', this.handleLogPaginationChange);
    document.getElementById('undefined_previousPage').addEventListener('click', this.handleLogPaginationChange);
    document.getElementById('undefined_firstPage').addEventListener('click', this.handleLogPaginationChange);
    let mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';
    dispatch({ type: actionTypes.getForms, params: {}, callback: (data) => { } });
    let templParams = {};
    dispatch({
      type: specimenCollectionActionType.GET_IOE_SPECIMEN_COLLECTION_TEMPLS_FOR_REPORT, params: templParams, callback: (data) => {
        this.setState({
          templateList: data
        });
      }
    });
    if (mode === 'clinic') {
      dispatch({
        type: actionTypes.UPDATE_IOE_LABORATORY_FOLLOWUP_STATUS, params: { serviceCd: clinic.svcCd, SiteId: clinic.siteId }, callback: () => {
          // this.getClinics(this.props.loginInfo.service.code);
        }
      });
    }
    // if (mode == 'patient') {
      // let clinicOptions = commonUtils.getClinicListByServiceCd(clinic.serviceCd);
      // this.setState(clinicOptions);
    // }
    this.setState({
      selectedRequestIds: '',
      historyList: []
    });
    this.props.getServiceSpecificFunctionInfo({
      params: {
        functionName: constants.FUNCTION_NAME
      },
      callback: (data) => {
        let outputFormIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.IX_ENQUIRY_OUTPUT_FORM_FUNCTION_CODE);
        let reminderIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.IX_ENQUIRY_REMINDER_FUNCTION_CODE);
        let lableIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.IX_ENQUIRY_LABEL_FUNCTION_CODE);
        let specialRemarkPrompt= commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.SPECIFIC_REMARK_POP_UP_FOR_IOE_ENQUIRY);
        let btnSwith = outputFormIsChecked || reminderIsChecked || lableIsChecked;
        let specimentCollectionDTSwitch= commonUtils.getDefalutValByCheckBoxCd(data.data,commonConstants.COMMON_CODE.IX_ENQUIRY_DATE_CHECKBOX_CODE);
        this.setState({
          outputFormIsChecked,
          reminderIsChecked,
          lableIsChecked,
          btnSwith,
          specimentCollectionDTSwitch,
          specialRemarkPrompt
        });
      }
    });
    if (mode == 'patient') {
      this.props.updateCurTab(accessRightEnum.ioeEnquiryPatient, this.doClose);
    } else {
      this.props.updateCurTab(accessRightEnum.ioeEnquiryClinic, this.doClose);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resetHeight);
    document.getElementById('undefined_nextPage').removeEventListener('click', this.handleLogPaginationChange);
    document.getElementById('undefined_lastPage').removeEventListener('click', this.handleLogPaginationChange);
    document.getElementById('undefined_previousPage').removeEventListener('click', this.handleLogPaginationChange);
    document.getElementById('undefined_firstPage').removeEventListener('click', this.handleLogPaginationChange);
  }

  resetHeight = _.debounce(() => {
    if (this.content.current && this.content.current.clientHeight && this.content.current.clientHeight !== this.state.wrapperHight) {
      this.setState({
        wrapperHight: this.content.current.clientHeight
      });
    }
  }, 1000);

  handleLogPaginationChange = (event) => {
    const { initialParm, count, rowsPerPage } = this.state;
    const { currentTarget } = event;
    let { ariaLabel } = currentTarget;
    if (ariaLabel === 'Next Page') {
      this.insertIxEnquiryLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '>' button to go to page: ${initialParm.pageNum + 2}`, '');
    } else if (ariaLabel === 'Last Page') {
      this.insertIxEnquiryLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '>|' button to go to page: ${parseInt(count / rowsPerPage) + 1}`, '');
    } else if (ariaLabel === 'Previous Page') {
      this.insertIxEnquiryLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '<' button to go to page: ${initialParm.pageNum}`, '');
    } else if (ariaLabel === 'First Page') {
      this.insertIxEnquiryLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ` '|<' button to go to page: ${1}`, '');
    }
  }
  handleHint = (record) => {
    let { dispatch, common } = this.props;
    event.stopPropagation();
    let params = { 'ioeRequestId': record.ioeRequestId };
    dispatch({
      type: actionTypes.REQUEST_ORDER_DETAILS, params: params, callback: (data) => {
        let { clinicList } = common;
        let clinicsNameObj = clinicList.filter(item => {
          return item.clinicCd === data.clinicCd;
        });
        let reportToObj = clinicList.filter(item => {
          return item.clinicCd === data.reportTo;
        });
        data.clinicName = clinicsNameObj.length > 0 ? (clinicsNameObj[0].clinicName ? clinicsNameObj[0].clinicName : '') : '';
        data.reportTo = reportToObj.length > 0 ? (reportToObj[0].clinicName ? reportToObj[0].clinicName : '') : data.reportTo;
        this.setState({
          openTooltip: true,
          details: data
        });
      }
    });
    event.preventDefault();
    this.insertIxEnquiryLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} Form Name: ${record.formName} in result list (IOE Request ID: ${record.ioeRequestId};IRN: ${record.ioeRequestNumber}; Form ID: ${record.codeIoeFormId})`, 'ioe/getLaboratoryRequestDetailById');
  }

  //关闭close tab
  doClose = (callback) => {
    let typeName = location.href.indexOf('F117') > -1 ? 'Investigation Result Enquiry' : 'IOE Enquiry by Clinic';
    this.insertIxEnquiryLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close ${typeName}`, '');
    callback(true);
  }

  handleClose = () => {
    this.setState({ openTooltip: false });
    this.insertIxEnquiryLog(`[Ix Request Detail Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Close' button`, '');
  }

  handBtnSubmit = () => {
    let { patientInfoByClinic, patientInfoByClinicCaseNo, location } = this.props;
    let { specimentCollectionDTSwitch, selected, initialParm, specimentCollectionDT } = this.state;
    if (selected.length > 0) {
      let requestList = [];
      let mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';
      let patientDto = mode == 'patient' ? (commonUtils.reportGeneratePatientDto()) : (patientInfoByClinic != null ? commonUtils.reportGeneratePatientDto(patientInfoByClinic, patientInfoByClinicCaseNo) : null);
      for (let index = 0; index < selected.length; index++) {
        const element = selected[index];
        if (element.specimenCollected === 0 && element.isInvld === 0 && element.ioeReportId == null) {
          requestList.push(element);
        }
      }
      if (specimentCollectionDTSwitch) {
          if (this.validateSpecimenCollectionDT(requestList)) {
            for (let index = 0; index < requestList.length; index++) {
              requestList[index].specimenCollectDatetime = specimentCollectionDT;
            }
            this.handBtnSubmitApiData(requestList, patientDto, initialParm);
          }
      } else {
        for (let index = 0; index < requestList.length; index++) {
          requestList[index].specimenCollectDatetime = null;
        }
        this.handBtnSubmitApiData(requestList, patientDto, initialParm);
      }
    } else {
      let payload = { msgCode: SPECIMEN_COLLECTION_CODE.IS_SELECT_SPECIMEN_COLLECTION };
      this.props.openCommonMessage(payload);
    }
  }

  handBtnSubmitApiData=(requestList,patientDto,initialParm)=>{
    let payload={
      msgCode: SPECIMEN_COLLECTION_CODE.IS_SUBMIT_SPECIMEN_COLLECTION,
      btn1AutoClose:false,
      btnActions: {
        btn1Click: () => {
          this.insertIxEnquiryLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Submit' button`, '/ioe/ixRequest/operation');
          this.props.openCommonCircularDialog();
          let params = {
            ioeReminderTemplateReportDto: {},
            ioeRequestDtos: requestList,
            operationType: 'SU',
            patientDto,
            userHclDrCode: ''
          };
          this.props.doAllOperationSubmit({
            params, callback: (data) => {
              this.props.closeCommonCircularDialog();
              if (data.respCode !== undefined && data.respCode !== 0) {
                let payloadError = {
                  msgCode: data.msgCode,
                  btnActions: {
                    btn1Click: () => {
                      if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                        this.handleSearch(initialParm);
                        let name = commonUtils.commonMessageLog(data.msgCode, 'Refresh Page');
                        this.insertIxEnquiryLog(name, '');
                      }
                    },
                    btn2Click: () => {
                      let name = commonUtils.commonMessageLog(data.msgCode, 'Cancel');
                      this.insertIxEnquiryLog(name, '');
                    }
                  }
                };
                this.props.openCommonMessage(payloadError);
              } else {
                let payloadSuccess = { msgCode: data.respCode === 0 ? '101302' : '101303' };
                payloadSuccess.showSnackbar = true;
                this.handleSearch(initialParm);
                this.props.openCommonMessage(payloadSuccess);
              }
            }
          });
        }
      }
    };
    this.props.openCommonMessage(payload);
  }

  toggleDialog = () => {
    const {  login } = this.props;
    const {service } = login;
    let { selected,specialRemarkPrompt } = this.state;
    let content = 'Selected Report(s):';
    selected.forEach(element => {
      content += `IOE Request ID: ${element.ioeRequestId}; Request Date: ${element.requestDatetime}; IRN: IRN : ${element.ioeRequestNumber}; Lab No.: ${element.labNum}\n`;
    });
    if (selected.length > 0) {
      if(specialRemarkPrompt){
        let payload = {
          msgCode: IX_REQUEST_CODE.SPECIFIC_REMARK_POP_UP_FOR_IOE_ENQUIRY_CODE,
          params: [
              {
                name: 'FUNCTION',
                value: `${service.serviceName}`
              }
            ],
            btn1AutoClose:false,
          btnActions:
          {
              btn1Click: () => {
                this.setState({
                  selectedRow: selected,
                  LaboratoryReportDialogOpen: true
                });
                this.props.closeCommonMessage();
              }
          }
      };
      this.props.openCommonMessage(payload);
      }else{
        this.setState({
          selectedRow: selected,
          LaboratoryReportDialogOpen: true
        });
      }
      this.insertIxEnquiryLog(`${commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click} 'Lab Report' Button`, '', content);
    }
    else {
      let payload = { msgCode: '101601' };
      this.props.openCommonMessage(payload);
    }
  }

  handleChangeRowsPerPageCallBack = (rowsPerPage) => {
    const { initialParm } = this.state;
    initialParm.pageSize = rowsPerPage;
    let { ix } = initialParm;
    this.insertIxEnquiryLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} Select rows per page：${rowsPerPage} in drop-down list`, '');
    if (_.trim(ix) != '' && ix != null) {
      this.setState({ rowsPerPage: rowsPerPage }, () => {
        this.handleSearch(initialParm);
      });
    } else {
      this.setState({ rowsPerPage: rowsPerPage });
    }
  }

  handleChangePageCallBack = (newPage) => {
    const { initialParm } = this.state;
    initialParm.pageNum = newPage;
    this.setState({ page: newPage }, () => {
      this.handleSearch(initialParm);
    });
  }

  handleSelectionChange = (selected) => {
    this.setState({
      selected: _.cloneDeep(selected)
    });
    //judge lab report button display
    this.labReportShow(selected);
  }

  labReportShow = (selected) => {
    let { location, patient } = this.props;
    let { encounterInfo } = patient;
    let RepeatOrderFlag = encounterInfo.encounterId ? true : false;
    let disabledFlag = false;
    let printFlag = true;
    let deleteFlag = false;
    let submitFlagChecked = true;
    let patientKeyResult = '';
    let privilegeRepeatOrder = true;
    let privilegeDeleteForm = true;

    selected.forEach(item => {
      patientKeyResult = item.patientKey;
      const codeIoeRequestTypeCd = item.codeIoeRequestTypeCd;
      if (codeIoeRequestTypeCd === IOE_REQUEST_TYPE.DOCTOR) {
        if (!this.privilegeRepeatForDoctor) {
          privilegeRepeatOrder = false;
        }
        if (!this.privilegeInvalidateForDoctor) {
          privilegeDeleteForm = false;
        }
      } else if (codeIoeRequestTypeCd === IOE_REQUEST_TYPE.NURSE) {
        if (!this.privilegeRepeatForNurse) {
          privilegeRepeatOrder = false;
        }
        if (!this.privilegeInvalidateForNurse) {
          privilegeDeleteForm = false;
        }
      }

      let currentServiceAndClinic = commonUtils.checkIsNotCurrentServiceAndClinic(item.serviceCd, item.clinicCd);
      if (item.specimenCollected == 0 && item.isInvld == 0 && item.ioeReportId == null) {
        submitFlagChecked = false;
      }
      if (currentServiceAndClinic) {
        disabledFlag = true;
      }
      if (item.isInvld != 1) {
        printFlag = false;
      } else {
        deleteFlag = true;
      }
    });
    let mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';
    let labReportFlagChecked = true;
    let deleteFormFlagChecked = selected.length < 1 || disabledFlag || printFlag;
    let repeatOrderFlagChecked = RepeatOrderFlag ? (selected.length < 1 || disabledFlag) : true;
    if (mode === 'clinic') {
      let { showFlag } = this.state;
      for (let index = 0; index < selected.length; index++) {
        if (selected[index].labNum !== null) {
          labReportFlagChecked = false;
          break;
        }
      }
      this.setState({ submitFlagChecked: submitFlagChecked, labReportFlagChecked: labReportFlagChecked, printDisabledFlag: showFlag || deleteFlag || this.filterIsExistReportId(selected) });
      // if (!this.state.printDisabledFlag && patientKeyResult != '') {
      //   this.props.openCommonCircularDialog();
      //   this.props.getPatientByIdClinic({ params: patientKeyResult });
      // }
      return false;
    }
    for (let index = 0; index < selected.length; index++) {
      if (selected[index].labNum !== null ) {
        // submitFlagChecked = (selected[index].specimenCollected != 1 && selected[index].isInvld != 1) ? false : true;
        labReportFlagChecked = false;
        deleteFormFlagChecked = selected.length < 1 || disabledFlag;
        repeatOrderFlagChecked = RepeatOrderFlag ? (selected.length < 1 || disabledFlag) : true;
        break;
      }
    }
    this.setState({
      // labReportShow,
      submitFlagChecked: submitFlagChecked,
      labReportFlagChecked: labReportFlagChecked,
      deleteFormFlagChecked: deleteFormFlagChecked || !privilegeDeleteForm,
      repeatOrderFlagChecked: repeatOrderFlagChecked || !privilegeRepeatOrder,
      privilegeDeleteForm,
      privilegeRepeatOrder,
      disabledFlag,
      printDisabledFlag: deleteFlag || this.filterIsExistReportId(selected)
    });
  }

  filterIsExistReportId = (selected) =>{
    let flag = false;
    for (const key in selected) {
      if(selected[key].ioeReportId != null) {
        flag = true;
      }
    }
    return flag;
  }

  handleSearch = (params, selectRefresh, refreshFlag) => {
    const { dispatch, location } = this.props;
    let { rowsPerPage, page } = this.state;
    params.pageSize = rowsPerPage;
    params.pageNum = page;
    let patientKey = '';
    if (this.props.patientInfo) {
      patientKey = this.props.patientInfo.patientKey;
    } else {
      patientKey = 0;
    }
    let mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';
    params.patientKey = patientKey;
    let submitFlagChecked = true;
    let labReportFlagChecked = true;
    let deleteFormFlagChecked = true;
    let repeatOrderFlagChecked = true;
    if (mode === 'clinic') {
      const { loginInfo } = this.props;
      params.requestBy = params.requestBy === '' ? null : params.requestBy;
      params.clinicCd = loginInfo.clinic.code;
      params.serviceCd = loginInfo.service.code;
      params.patientKey = 0;
      labReportFlagChecked = true;
    }
    params.clinicCd = params.clinicCd === 'ALL' ? '' : params.clinicCd;
    params.fromDate = !params.fromDate || params.fromDate === '' || params.fromDate === null ? null : moment(params.fromDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE);
    params.toDate = !params.toDate || params.toDate === '' || params.toDate === null ? null : moment(params.toDate).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE);
    params.formId = !params.formId || params.formId === '' ? 0 : params.formId;
    if (params.followUpStatus === 'A') {
      params.followUpStatus = null;
    }
    if (params.ix === 'report') {
      params.turnaroundTime = 0;
    } else {
      params.followUpStatus = null;
    }
    let fromDateFlag = false;
    let toDateFlag = false;
    if (params.fromDate !== null) {
      if (
        moment(params.fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE) === 'Invalid date' ||
        moment(moment(params.fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).diff((moment(new Date()).format(Enum.DATE_FORMAT_EDMY_VALUE))) > 0 ||
        !moment(moment(params.fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).isBetween(moment('01-01-1900').format(Enum.DATE_FORMAT_EDMY_VALUE), moment('01-01-2100').format(Enum.DATE_FORMAT_EDMY_VALUE), null, '[]')
      ) {
        fromDateFlag = true;
      }
    }
    if (params.toDate !== null) {
      if (
        moment(params.toDate).format(Enum.DATE_FORMAT_EDMY_VALUE) === 'Invalid date' ||
        !moment(moment(params.toDate).format(Enum.DATE_FORMAT_EDMY_VALUE)).isBetween(moment('01-01-1900').format(Enum.DATE_FORMAT_EDMY_VALUE), moment('01-01-2100').format(Enum.DATE_FORMAT_EDMY_VALUE), null, '[]')
      ) {
        toDateFlag = true;
      }
    }
    if ((!fromDateFlag && !toDateFlag) || (fromDateFlag && !toDateFlag)) {
      if (moment(params.toDate).format(Enum.DATE_FORMAT_EDMY_VALUE) !== 'Invalid date' && moment(params.fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE) !== 'Invalid date') {
        if (moment(params.toDate).diff(moment(params.fromDate)) < 0) {
          fromDateFlag = true;
          toDateFlag = true;
        }
      }
    }
    if (fromDateFlag || toDateFlag) {
      let payload = {
        msgCode: params.ix === 'report' ? '101816' : '101815',
        btnActions: { btn1Click: () => { } }
      };
      this.props.openCommonMessage(payload);
      return;
    }
    this.props.openCommonCircularDialog();
    dispatch({
      type: actionTypes.getHistoryList, params: params, callback: (data) => {
        if (data.respCode === 0) {
          const { pageDto, investigationRequesDtos, showFlag } = data.data;
          if (showFlag == true) {
            dispatch({ type: laboratoryReportActionType.PUT_PATINET_INFOMATIONINFO, fillingData: null, caseListData: {} });
            let patientKeyVal = investigationRequesDtos && investigationRequesDtos.length > 0 ? (investigationRequesDtos[0].patientKey ? investigationRequesDtos[0].patientKey : '') : '';
            if (patientKeyVal) {
              this.props.getPatientByIdClinic({ params: patientKeyVal });
            }
          }
          if (refreshFlag) {
            this.setState({
              historyList: investigationRequesDtos,
              initialParm: params,
              selected: selectRefresh ? _.cloneDeep(this.filterSelectedData(investigationRequesDtos)) : [],
              count: pageDto.count,
              printDisabledFlag: !showFlag,
              labReportShowFlag: !showFlag,
              showFlag: !showFlag
            }, () => this.props.closeCommonCircularDialog());
          } else {
            this.setState({
              historyList: investigationRequesDtos,
              initialParm: params,
              selected: selectRefresh ? _.cloneDeep(this.filterSelectedData(investigationRequesDtos)) : [],
              submitFlagChecked: submitFlagChecked,
              labReportFlagChecked: labReportFlagChecked,
              deleteFormFlagChecked: deleteFormFlagChecked,
              repeatOrderFlagChecked: repeatOrderFlagChecked,
              count: pageDto.count,
              printDisabledFlag: !showFlag,
              labReportShowFlag: !showFlag,
              showFlag: !showFlag
            }, () => this.props.closeCommonCircularDialog());
          }
        }
      else{
        dispatch({
          type: messageTypes.OPEN_COMMON_MESSAGE,
          payload: {
            msgCode: data.msgCode,
            btnActions: {
              btn1Click: () => {
                this.props.closeCommonCircularDialog();
              }
            }
          }
        });
      }
    }});
    let logParams = '';
    if (mode === 'patient') {
      logParams =
        `Report/Request: ${params.ix},
        Form Date:${params.fromDate},
        To Date:${params.toDate},
        Form ID: ${params.formId},
        Follow-up Status: ${params.followUpStatus},
        Service: ${_.trim(params.serviceCd) === '' ? 'ALL' : params.serviceCd},
        Clinic: ${_.trim(params.clinicCd) === '' ? 'ALL' : params.clinicCd},
        Is Exp Turnaround ${params.turnaroundTime},
        Page Size: ${params.pageSize},
        Page Number: ${params.pageNum};`;
    } else {
      logParams =
        `Report/Request: ${params.ix}
        Form Date:${params.fromDate}
        To Date:${params.toDate}
        Form ID: ${params.formId}
        Follow-up Status: ${params.followUpStatus}
        Requested By:  ${params.requestBy}
        PMI/IRN/HKID:${params.docType}
        Is Exp Turnaround ${params.turnaroundTime}
        Page Size: ${params.pageSize}
        Page Number: ${params.pageNum}`;
    }
    this.insertIxEnquiryLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Search' button`, 'ioe/listLaboratoryRequest', logParams);
  }

  filterSelectedData = (historyList) => {
    let { selected } = this.state;
    let arr = [];
    for (let index = 0; index < historyList.length; index++) {
      const element = historyList[index];
      for (let row = 0; row < selected.length; row++) {
        const select = selected[row];
        if (select.ioeRequestNumber === element.ioeRequestNumber && select.labNum === element.labNum) {
          arr.push(element);
        }
      }
      // if (selectedIndex < selectedResult.length && element.ioeRequestNumber === selectedResult[selectedIndex].ioeRequestNumber) {
      //   arr.push(element);
      //   selectedIndex++;
      // } else if(selectedIndex >= selectedResult.length) {
      //   break;
      // }
    }
    return arr;
  }

  handleInvalidateFormCallback = (params) => {
    const { dispatch, location, login } = this.props;
    const { clinic } = login;
    let mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';
    this.props.openCommonCircularDialog();
    if (mode === 'clinic') {
      dispatch({
        type: actionTypes.UPDATE_IOE_LABORATORY_FOLLOWUP_STATUS, params: { serviceCd: clinic.svcCd, SiteId: clinic.siteId }, callback: () => {
          this.getClinics(this.props.loginInfo.service.code);
        }
      });
    }
    dispatch({
      type: actionTypes.getHistoryList, params: params, callback: (data) => {
        if(data.respCode === 0) {
          const { pageDto, investigationRequesDtos } = data.data;
          this.setState({
            // labReportShow: labReportShow,
            submitFlagChecked: true,
            labReportFlagChecked: true,
            deleteFormFlagChecked: true,
            repeatOrderFlagChecked: true,
            historyList: _.cloneDeep(investigationRequesDtos),
            selectedRequestIds: '',
            selected: [],
            count: pageDto.count
          }, () => this.props.closeCommonCircularDialog());
        }else {
          dispatch({
            type: messageTypes.OPEN_COMMON_MESSAGE,
            payload: {
              msgCode: data.msgCode,
              btnActions: {
                btn1Click: () => {
                  this.props.closeCommonCircularDialog();
                }
              }
            }
          });
        }
      }
    });
  }

  getClinics = (value) => {
    const { dispatch } = this.props;
    let params = {
      clinicCd: '',
      displaySeq: '',
      cdFlag: '',
      clinicName: '',
      serviceCd: value,
      clinicNameChi: '',
      locationEng: '',
      locationChi: '',
      phoneNo: '',
      fax: ''
    };
    dispatch({
      type: actionTypes.getClinics, params: params, callback: () => {
      }
    });
  }

  updateState = (obj) => {
    let { location } = this.props;
    let { selected, privilegeDeleteForm, privilegeRepeatOrder } = this.state;
    let { serviceCd, clinicCd } = obj;
    let currentServiceAndClinic = commonUtils.checkIsNotCurrentServiceAndClinic(serviceCd, clinicCd);
    let mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';

    let submitFlagChecked = true;
    let labReportFlagChecked = true;
    let deleteFormFlagChecked = selected.length < 1 || currentServiceAndClinic || !privilegeDeleteForm;
    let repeatOrderFlagChecked = selected.length < 1 || currentServiceAndClinic || !privilegeRepeatOrder;
    if (mode === 'clinic') {
      for (let index = 0; index < selected.length; index++) {
        if (selected[index].labNum !== null ) {
          labReportFlagChecked = false;
          break;
        }
      }
      this.setState({
        submitFlagChecked: submitFlagChecked,
        labReportFlagChecked: labReportFlagChecked,
        deleteFormFlagChecked: deleteFormFlagChecked,
        repeatOrderFlagChecked: repeatOrderFlagChecked
      });
      return false;
    }
    for (let index = 0; index < selected.length; index++) {
      if (selected[index].labNum !== null) {
        labReportFlagChecked = false;
        deleteFormFlagChecked = selected.length < 1 || currentServiceAndClinic || !privilegeDeleteForm;
        repeatOrderFlagChecked = selected.length < 1 || currentServiceAndClinic || !privilegeRepeatOrder;
        break;
      }
    }
    this.setState({ ...obj });
  }

  onSelectAllClick = event => {
    const { location } = this.props;
    let mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';
    if (event.target.checked) {
      let selected = _.cloneDeep(this.state.historyList);
      this.setState({ selected });
      this.labReportShow(this.state.historyList);
      return;
    }
    if (mode === 'clinic') {
      this.setState({
        selected: [],
        submitFlagChecked: true,
        labReportFlagChecked: true
      });
    } else {
      this.setState({
        selected: [],
        // submitFlagChecked: true,
        labReportFlagChecked: true,
        deleteFormFlagChecked: !event.target.checked,
        repeatOrderFlagChecked: !event.target.checked
      });
    }
  };

  isSelected = id => {
    let flag = false;
    for (let index = 0; index < this.state.selected.length; index++) {
      if (this.state.selected[index].ioeRequestId === id.ioeRequestId && this.state.selected[index].labNum === id.labNum) {
        flag = true;
        break;
      }
    }
    return flag;
    // this.state.selected.indexOf(_.cloneDeep(id)) !== -1;
  }

  onPrinterCheckboxChange = (event, name, printDisabledFlag) => {
    let flag = printDisabledFlag ? false : true;
    this.setState({
      btnSwith: flag,
      [name]: event.target.checked
    });
  }

  handleCloseInvalidateFormDialog = () => {
    this.setState({ invalidateFormDialogOpen: false });
  }

  handleOpenInvalidateFormDialog = () => {
    let { selected } = this.state;
    let content = 'Selected Report(s):';
    selected.forEach(element => {
      content += `IOE Request ID: ${element.ioeRequestId}; Request Date: ${element.requestDatetime}; IRN: IRN : ${element.ioeRequestNumber}; Lab No.: ${element.labNum}\n`;
    });
    this.insertIxEnquiryLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ' \'Delete Form\' button', '', content);
    this.checkUserRoleAuthority(true);
  }

  handleRepeatOrder = () => {
    this.checkUserRoleAuthority();
  }

  executeRepeatOrder = (selected) => {
    let { patient, dispatch, location, login } = this.props;
    const { clinic } = login;
    let { encounterInfo } = patient;
    let mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';
    let content = 'Selected Report(s):';
    selected.forEach(element => {
      content += `IOE Request ID: ${element.ioeRequestId}; Request Date: ${element.requestDatetime}; IRN: IRN : ${element.ioeRequestNumber}; Lab No.: ${element.labNum}\n`;
    });
    let params = {
      encounterInfoDto: encounterInfo,
      investigationRequestDtos: selected
    };
    if (mode === 'clinic') {
      dispatch({
        type: actionTypes.UPDATE_IOE_LABORATORY_FOLLOWUP_STATUS, params: { serviceCd: clinic.svcCd, SiteId: clinic.siteId }, callback: () => {
          this.getClinics(this.props.loginInfo.service.code);
        }
      });
    }
    let { initialParm } = this.state;
    dispatch({
      type: actionTypes.saveRepeatEnquiryList, params, callback: (data) => {
        let payload = {
          msgCode: data.msgCode,
          showSnackbar: true
        };
        this.props.openCommonMessage(payload);
        this.setState({
          onSelectAllClick: true,
          labReportFlagChecked: true,
          deleteFormFlagChecked: true,
          repeatOrderFlagChecked: true
        });
        this.handleInvalidateFormCallback(initialParm);
      }
    });
    this.insertIxEnquiryLog(`${commonConstants.INSERT_LOG_ACTION.Action} ${commonConstants.INSERT_LOG_STATUS.Click} 'Repeat Order' Button`, '', content);
  }

  checkUserRoleAuthority = (clickDeleteFormFalg = false) => {
    let { selected } = this.state;
    let { login, loginInfo } = this.props;
    let { userDto } = loginInfo;
    let userRoleType = commonUtils.getUserRoleType();
    let userInCharge = login.clinic.userInCharge;
    // let userRoleType = commonUtils.getUserRoleType;
    selected.forEach(obj => {
      obj.requestUser = commonUtils.getUserFullName();
      obj.requestLoginName = userDto.loginName;
      obj.codeIoeRequestTypeCd = 'DO';
    });
    if (userRoleType == 'CIMS-NURSE') {
      if (userInCharge == '' || userInCharge == null || userInCharge == undefined) {
        this.handleStop();
        return;
      }
      let params = {};
      params.roleName = 'CIMS-DOCTOR';
      params.userSvcCd = login.service.serviceCd;
      params.userSiteId = login.clinic.siteId;
      this.props.getOfficerDoctorDropdownList({
        params,
        callback: (data) => {
          for (let item of data.data) {
            if (item.userId == userInCharge) {
              if (clickDeleteFormFalg) {
                this.setState({ invalidateFormDialogOpen: true });
                return;
              }
              selected.forEach(obj => {
                obj.requestUser = commonUtils.getUserFullName(item);
                obj.requestLoginName = item.loginName;
                obj.codeIoeRequestTypeCd = 'NO';
              });
              this.executeRepeatOrder(selected);
              return;
            }
          }
          // this.handleStop();
          // return;
        }
      });
    } else {
      if (clickDeleteFormFalg) {
        this.setState({ invalidateFormDialogOpen: true });
      } else {
        this.executeRepeatOrder(selected);
      }
      return;
    }
  }

  handleStop = () => {
    this.props.openCommonMessage({
      msgCode: IX_REQUEST_CODE.OFFICER_IN_CHARGE_NOT_SETTING,
      btnActions: {
        btn1Click: () => {
          this.insertIxEnquiryLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click + ' OK & Close', '');
          return;
        }
      }, params: [{ name: 'title', value: 'Ix Enquiry' }]
    });
  }

  //print report function
  handlePrint = (reminderIsChecked, lableIsChecked, outputFormIsChecked, reminderReported, freshIoeRequest) => {
    let { dispatch } = this.props;
    let { selected, specimentCollectionDTSwitch, specimentCollectionDT } = this.state;
    let selectList = selected;
    let selectRecords = 'Selected records:';
    selectList.forEach(obj => {
      selectRecords += obj.ioeRequestId + ',';
    });
    let specimentCheck = `;Is 'Specimen Collection Date & Time' checked:${specimentCollectionDTSwitch};`;
    if (specimentCollectionDTSwitch) {
      specimentCheck += `Specimen Collection Date & Time:${specimentCollectionDT}; `;
    } else {
      specimentCheck += 'Specimen Collection Date & Time:null;';
    }
    let content = selectRecords + specimentCheck + `Is 'Reminder' checked:${reminderIsChecked},Is 'Label' checked: ${lableIsChecked},Is 'Output Form' checked: ${outputFormIsChecked}`;
    if (selectList.length < 1) {
      let payload = { msgCode: SPECIMEN_COLLECTION_CODE.IS_SELECT_SPECIMEN_COLLECTION };
      this.props.openCommonMessage(payload);
    } else {
        if(this.getPatientInfo()){
          let param = {
            reminderIsChecked,
            lableIsChecked,
            outputFormIsChecked,
            reminderReported,
            freshIoeRequest
          };
          let params = {
            callback: this.printStart,
            param
          };
          dispatch({ type: commonActionType.JOS_PRINT_CHECK, params });
        }else {
          let payload = {
            msgCode: IX_REQUEST_CODE.INVALID_PARAMETER_CODE,
            params:[
              { name: 'parameters', value: 'The patient information is not found.' }
            ],
            btn1Click: () => {
              this.props.closeCommonCircularDialog();
            }
          };
          this.props.openCommonMessage(payload);
        }
      }

    this.insertIxEnquiryLog(`${commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Click} 'Print' Button`, '', content);
  }

  getPatientInfo = () => {
    let flag = false;
    let { patientInfoByClinic, location } = this.props;
    let mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';
    if(patientInfoByClinic || mode === 'patient') {
      flag = true;
    }
    return flag;
  }

  printStart = (data, params) => {
    if (data) {
      this.props.openCommonCircularDialog();
      let num = 0;
      let { reminderIsChecked, lableIsChecked, outputFormIsChecked, reminderReported, freshIoeRequest } = params.param;
      freshIoeRequest = freshIoeRequest ? freshIoeRequest : [];
      let selectList = this.state.selected;
      let requestList = [];
      if (lableIsChecked) {
        num++;
      }
      if (outputFormIsChecked) {
        num++;
      }
      if (reminderIsChecked) {
        num++;
      }
      if (this.state.specimentCollectionDTSwitch) {
        if (outputFormIsChecked) {
          if (this.validateSpecimenCollectionDT(selectList)) {
            this.printMethod(num, lableIsChecked, freshIoeRequest, outputFormIsChecked, requestList, reminderIsChecked, reminderReported, selectList);
          }
        } else {
          this.printMethod(num, lableIsChecked, freshIoeRequest, outputFormIsChecked, requestList, reminderIsChecked, reminderReported, selectList);
        }
      } else {
        selectList.forEach(obj => {
          obj.specimenCollectDatetime = null;
        });
        requestList.forEach(obj => {
          if (obj.specimenCollectDatetime) {
            obj.specimenCollectDatetime = null;
          }
        });
        freshIoeRequest.forEach(obj => {
          if (obj.specimenCollectDatetime) {
            obj.specimenCollectDatetime = null;
          }
        });
        this.printMethod(num, lableIsChecked, freshIoeRequest, outputFormIsChecked, requestList, reminderIsChecked, reminderReported, selectList);
      }
    }
  }

  printMethod = (num, lableIsChecked, freshIoeRequest, outputFormIsChecked, requestList, reminderIsChecked, reminderReported, selectList) => {
    selectList = this.filterSelectList(selectList);
    if (num === 1 && lableIsChecked) {
      let labelList = [];
      let requestList = [];
      if (freshIoeRequest.length < 1) {
        requestList = selectList;
        this.setState({ requestList });
        labelList.push(selectList[0]);
      } else {
        labelList = freshIoeRequest;
      }
      this.submit('PL', labelList);
      this.setState({ printReportNum: 2 });
    }
    else if (num === 1 && outputFormIsChecked) {
      if (freshIoeRequest.length < 1) {
        requestList = selectList;
      } else {
        requestList = freshIoeRequest;
      }
      this.setState({ requestList: requestList, printReportNum: 2 });
      this.handlePrintOutPutForm(true, freshIoeRequest);
    }
    else if (num === 1 && reminderIsChecked) {
      this.handleOpenReminderPrintDialog();
    }
    else if (outputFormIsChecked && lableIsChecked && reminderIsChecked) {
      this.handleOpenReminderPrintDialog();
    } else if (outputFormIsChecked && lableIsChecked) {
      if (freshIoeRequest.length < 1) {
        requestList = selectList;
      } else {
        requestList = freshIoeRequest;
      }
      this.setState({ requestList });
      this.handlePrintOutPutForm(false, freshIoeRequest);
    } else if (reminderIsChecked && lableIsChecked) {
      if (reminderReported) {
        requestList = selectList;
        let labelList = [];
        if (freshIoeRequest.length < 1) {
          labelList.push(selectList[0]);
        } else {
          labelList = freshIoeRequest;
        }
        this.setState({ requestList });
        this.submit('PL', labelList);
      } else {
        this.handleOpenReminderPrintDialog();
      }
    }
    else if (reminderIsChecked && outputFormIsChecked) {
      if (reminderReported) {
        this.handlePrintOutPutForm(true, []);
      } else {
        this.handleOpenReminderPrintDialog();
      }
    }
  }

  validateSpecimenCollectionDT = (selected) => {
    let { loginInfo } = this.props;
    let { specimentCollectionDT } = this.state;
    let selectList = selected;
    let validFlag = true;
    for (let index = 0; index < selected.length; index++) {
      if (selectList[index].specimenCollectDatetime && (moment(moment(specimentCollectionDT).format(Enum.DATE_FORMAT_EDMY_VALUE)).diff(moment(selectList[index].requestDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE)) < 0)) {
        validFlag = false;
        break;
      }
    }
    if (validFlag) {
      for (let index = 0; index < selectList.length; index++) {
        if (!selectList[index].specimenCollectDatetime || (moment(moment(specimentCollectionDT).format(Enum.DATE_FORMAT_EDMY_VALUE)).diff(moment(selectList[index].requestDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE))) >= 0) {
          selectList[index].specimenCollectDatetime = specimentCollectionDT;
          selectList[index].specimenCollectedBy = loginInfo.loginName;
          selectList[index].updatedBy = loginInfo.loginName;
          selectList[index].updatedDtm = new Date();
        }
      }
    } else {
      this.props.closeCommonCircularDialog();
      let payload = {
        msgCode: IX_REQUEST_CODE.SELECTED_ENCOUNTERTIME_TOO_LATER,
        btn1Click: () => {
          this.props.closeCommonMessage();
        }
      };
      this.props.openCommonMessage(payload);
    }
    return validFlag;
  }

  filterSelectList = (selectList) => {
    let arr = [];
    for (let index = 0; index < selectList.length; index++) {
      let element = selectList[index];
      if (element.isInvld != 1) {
        arr.push(element);
      }
    }
    return arr;
  }

  submit = (type, DTdata = []) => {
    let requestList = DTdata;
    let { patientInfoByClinic, patientInfoByClinicCaseNo, location } = this.props;
    let { specimentCollectionDTSwitch } = this.state;
    let mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';
    this.props.openCommonCircularDialog();
    let patientDto = mode == 'patient' ? (commonUtils.reportGeneratePatientDto()) : (patientInfoByClinic != null ? commonUtils.reportGeneratePatientDto(patientInfoByClinic, patientInfoByClinicCaseNo) : null);
    if (!specimentCollectionDTSwitch) {
      for (let index = 0; index < requestList.length; index++) {
        requestList[index].specimenCollectDatetime = null;
      }
    }
    let params = {
      ioeReminderTemplateReportDto: {},
      ioeRequestDtos: requestList,
      operationType: type,
      patientDto,
      userHclDrCode: type === 'POF' || type === 'PL' ? commonUtils.getUserHclDrCode() : ''
    };
    //check printer open status
    this.printerIsOpen(type, params);
  }

  freshSpecimenCollection = () => {
    let { initialParm } = this.state;
    this.handleSearch(initialParm, true, true);
    this.setState({
      isEdit: false,
      //print report param
      labelTimes: 0,
      printReportNum: 1,
      printLabelFail: '',
      printReportFail: '',
      freshIoeRequest: [],
      freshIoeFlag: false
      // printDisabledFlag:false
    });
  }

  printMultipleReport = (type, reportDataList, index) => {
    let { dispatch } = this.props;
    if (this.state.requestList.length >= index) {
      let multipleParams = { reportDataList: reportDataList, type: type, index: index };
      multipleParams.requestList = this.state.requestList;
      multipleParams.labelTimes = this.state.labelTimes;
      multipleParams.printLabelFail = this.state.printLabelFail;
      multipleParams.printReportFail = this.state.printReportFail;
      multipleParams.freshIoeRequest = this.state.freshIoeRequest;
      let params = {
        base64: reportDataList, callback: this.printMultipleReportCallback,
        printQueue: type === 'PL' ? 'CIMS2_ZebraLabelPrinter' : ''
      };
      dispatch({ type: commonActionType.JOS_PRINT_START, params });
      this.setState({ multipleParams });
    }
    else {
      //2 was print report type num
      if (this.state.printReportNum < 2) {
        let labelList = [];
        let freshIoeRequest = this.state.freshIoeRequest;
        labelList.push(freshIoeRequest[0]);
        this.setState({ printReportNum: 2, labelTimes: 0, freshIoeFlag: true });
        this.submit('POF', labelList);
      } else {
        //print report fail label.
        if (this.state.printReportFail === '') {
          let payload = {
            msgCode: '101317',
            showSnackbar: true,
            params: [
              { name: 'reportType', value: type === 'PL' ? 'label' : 'report' }
            ]
          };
          this.props.openCommonMessage(payload);
        }
        this.freshSpecimenCollection();
      }
    }
  }

  printMultipleReportCallback = (data) => {
    let multipleParams = this.state.multipleParams;
    let type = multipleParams.type;
    let { freshIoeRequest, labelTimes, freshIoeFlag } = this.state;
    let labelList = [];
    let labelArr = [];
    if (data) {
      let requestList = this.state.requestList;
      if (requestList.length > labelTimes || freshIoeRequest.length > labelTimes) {
        if (freshIoeRequest.length > 0 && freshIoeFlag) {
          labelArr.push(freshIoeRequest[labelTimes]);
        } else {
          labelArr.push(requestList[labelTimes]);
        }
        if (type !== 'PL') {
          this.submit('POF', labelArr);
        } else {
          this.submit('PL', labelArr);
        }
      } else {
        if (this.state.printReportNum < 2) {
          labelList.push(freshIoeRequest[0]);
          this.setState({ printReportNum: 2, labelTimes: 0, freshIoeFlag: true });
          this.submit('POF', labelList);
        }
        else {
          let payload = {
            msgCode: '101317',
            showSnackbar: true,
            params: [
              { name: 'reportType', value: type === 'PL' ? 'label' : 'report' }
            ]
          };
          this.props.openCommonMessage(payload);
          this.freshSpecimenCollection();
        }
      }
    }
    else {
      if (type !== 'PL') {
        let printReportFail = this.state.printReportFail;
        printReportFail = multipleParams.index === 1 ? '1' : printReportFail + ',' + multipleParams.index;
        this.setState({ printReportFail });
        this.printMultipleReport(type, multipleParams.reportDataList, multipleParams.index + 1);
      }
      else {
        let printLabelFail = this.state.printLabelFail;
        printLabelFail = multipleParams.index === 1 ? '1' : printLabelFail + ',' + multipleParams.index;
        this.setState({ printLabelFail });
        if (multipleParams.requestList.length > labelTimes || multipleParams.freshIoeRequest.length > labelTimes) {
          if (freshIoeRequest.length > 0 && freshIoeFlag) {
            labelArr.push(freshIoeRequest[labelTimes]);
          } else {
            labelArr.push(multipleParams.requestList[labelTimes]);
          }
          this.submit('PL', labelArr);
        } else {
          if (this.state.printReportNum < 2) {
            labelList.push(freshIoeRequest[0]);
            this.setState({ printReportNum: 2, labelTimes: 0, freshIoeFlag: true });
            this.submit('POF', labelList);
          }
          else {
            let printReportFail = multipleParams.printReportFail;
            if (printLabelFail === '') {
              if (printReportFail === '') {
                let payload = {
                  msgCode: '101317',
                  showSnackbar: true,
                  params: [
                    { name: 'reportType', value: type === 'PL' ? 'label' : 'report' }
                  ]
                };
                this.props.openCommonMessage(payload);
              }
            }
            this.freshSpecimenCollection();
          }
        }
      }
    }
  }

  getPrintReportAPI = (type, params) => {
    if (type === 'POF' && this.state.specimentCollectionDTSwitch) {
      params.ioeRequestDtos[0].specimenCollectDatetime = this.state.specimentCollectionDT;
    }
    let { dispatch } = this.props;
    this.props.openCommonCircularDialog();
    dispatch({
      type: ixRequestActionType.DO_ALL_OPERATION, params: params, callback: (data) => {
        //fresh data
        if (data.respCode !== undefined && data.respCode !== 0) {
          let payload = { msgCode: data.msgCode };
          this.props.closeCommonCircularDialog();
          this.props.openCommonMessage(payload);
        }
        else {
          if (data.respCode === 0) {
            let labelTimes = this.state.labelTimes + 1;
            let freshIoeRequest = this.state.freshIoeRequest == undefined ? [] : this.state.freshIoeRequest;
            data.data.ioeRequestData[0].ioeRequestItems = [];
            freshIoeRequest[this.state.labelTimes] = data.data.ioeRequestData[0];
            this.setState({ freshIoeRequest, labelTimes });
            this.printMultipleReport(type, data.data.reportData, 1);
          }
        }
      }
    });
  }

  printerIsOpen = (type, apiParams) => {
    //print label
    let { dispatch } = this.props;
    if (type === 'PL') {
      let multipleParams = {
        type,
        apiParams
      };
      let params = {
        multipleParams,
        callback: this.printerIsOpenCallback,
        printQueue: 'CIMS2_ZebraLabelPrinter',
        action: 'isPrintQueueAvailable'
      };
      dispatch({ type: commonActionType.JOS_PRINTER_CHECK, params });
      // this.props.josPrinterStatusCheck(params);
    } else {
      this.getPrintReportAPI(type, apiParams);
    }
  }

  printerIsOpenCallback = (printResult, params) => {
    if (printResult) {
      this.getPrintReportAPI(params.multipleParams.type, params.multipleParams.apiParams);
    } else {
      let payload = {
        msgCode: SPECIMEN_COLLECTION_CODE.LABEL_PRINTER_IS_NOT_AVAILABLE,
        btnActions: {
          btn1Click: () => {
            let { outputFormIsChecked } = this.state;
            if (outputFormIsChecked) {
              params.multipleParams.apiParams.operationType = 'POF';
              this.setState({ printReportNum: 2, labelTimes: 0, freshIoeFlag: false }, () => this.getPrintReportAPI('POF', params.multipleParams.apiParams));
            } else {
              this.freshSpecimenCollection();
            }
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
  }

  handlePrintOutPutForm = (type, freshIoeRequest) => {
    let initArray = [];
    let selectList = this.state.selected;
    if (freshIoeRequest.length < 1) {
      initArray.push(selectList[0]);
    } else {
      initArray.push(freshIoeRequest[0]);
    }
    if (type) {
      this.submit('POF', initArray);
    } else {
      this.submit('PL', initArray);
    }
  }

  handleOpenReminderPrintDialog = () => {
    let selectList = this.state.selected;
    this.setState({
      open: true,
      selectedSpecimenCollectionList: this.filterSelectList(selectList)
    });
    this.props.closeCommonCircularDialog();
  }

  handleCloseReminderPrintDialog = () => {
    this.setState({ open: false });
  }

  handleMultipleReportCallback = (reminderReported) => {
    let {
      lableIsChecked,
      outputFormIsChecked
    } = this.state;
    if (reminderReported) {
      let num = 0;
      this.props.openCommonCircularDialog();
      this.setState({ reminderReported: reminderReported });
      this.handlePrint(false, lableIsChecked, outputFormIsChecked, reminderReported, []);
      if (lableIsChecked)
        num++;
      if (outputFormIsChecked)
        num++;
      this.setState({
        labelTimes: 0,
        printReportNum: num === 1 ? 2 : 1,
        printLabelFail: '',
        printReportFail: '',
        freshIoeRequest: []
      });
    }
    else {
      this.setState({
        labelTimes: 0,
        printReportNum: 1,
        printLabelFail: '',
        printReportFail: '',
        freshIoeRequest: []
      });
      this.props.closeCommonCircularDialog();
    }
  }
  handleOnClick = (data) => {
    const {  login } = this.props;
    const {service } = login;
    let { specialRemarkPrompt } = this.state;
    if (data.length > 0 && data[0].labNum !== null) {
      if(specialRemarkPrompt){
        let payload = {
          msgCode: IX_REQUEST_CODE.SPECIFIC_REMARK_POP_UP_FOR_IOE_ENQUIRY_CODE,
          params: [
              {
                name: 'FUNCTION',
                value: `${service.serviceName}`
              }
            ],
          btn1AutoClose:false,
          btnActions:
          {
              btn1Click: () => {
                this.setState({
                  selectedRow: data,
                  LaboratoryReportDialogOpen: true
                });
                this.props.closeCommonMessage();
              }
          }
      };
      this.props.openCommonMessage(payload);
      }else{
        this.setState({
          selectedRow: data,
          LaboratoryReportDialogOpen: true
        });
      }
    }
  }
  handleDTCheckboxChanged = (event) => {
    if (event.target.checked) {
      this.setState({ specimentCollectionDT: new Date() });
    }
    let typeName = event.target.checked ? 'Select' : 'UnSelect';
    this.insertIxEnquiryLog(typeName + ' Specimen Collection Date & Time checkbox', '');
    this.setState({ specimentCollectionDTSwitch: event.target.checked });
  }
  handleDatetimeChanged = (momentObj) => {
    this.setState({
      specimentCollectionDT: momentObj !== null ? (moment(momentObj).isValid() ? moment(momentObj).toDate() : null) : null
    });
  }

  insertIxEnquiryLog = (desc, apiName = '', content = null) => {
    const { location } = this.props;
    let typeName = location.pathname.indexOf('F117') > -1 ? 'Investigation Result Enquiry' : 'IOE Enquiry by Clinic';
    let locationName = typeName === 'Investigation Result Enquiry' ? 'F117' : 'F118';
    commonUtils.commonInsertLog(apiName, locationName, typeName, desc, 'ioe', content);
  };

  handleCancelLog = (name, apiName = '') => {
    this.insertIxEnquiryLog(name, apiName);
  }

  render() {
    const { location, loginInfo, classes, login, dispatch, patientInfoByClinic, patientInfoByClinicCaseNo, patientInfo } = this.props;
    const { clinic,service } = login;
    const { forms, requestedByList } = this.props.enquiry;
    let {
      historyList = [],
      details,
      count,
      rowsPerPageOptions,
      serviceOptions,
      clinicOptions,
      openTooltip,
      selected,
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      invalidateFormDialogOpen,
      reminderReported,
      templateList,
      selectedSpecimenCollectionList,
      open,
      printDisabledFlag,
      specimentCollectionDT,
      specimentCollectionDTSwitch,
      labReportShowFlag,
      submitFlagChecked,
      labReportFlagChecked,
      deleteFormFlagChecked,
      repeatOrderFlagChecked
    } = this.state;
    const mode = location.pathname.indexOf('F117') > -1 ? 'patient' : 'clinic';

    let btnBarNot = [
      {
        title: 'Submit',
        onClick: this.handBtnSubmit,
        disabled: submitFlagChecked,
        id: 'submit_button'
      },
      {
        title: 'Lab Report',
        onClick: this.toggleDialog,
        disabled: labReportFlagChecked,
        id: 'labReport_button'
      },
      {
        title: 'Delete Form',
        onClick: this.handleOpenInvalidateFormDialog,
        disabled: deleteFormFlagChecked,
        id: 'labReport_invalidate_button'
      },
      {
        title: 'Repeat Order',
        onClick: this.handleRepeatOrder,
        disabled: repeatOrderFlagChecked,
        id: 'labReportRepeatOrderButton'
      }
    ];
    if (mode === 'clinic') {
      btnBarNot = [{
        title: 'Submit',
        onClick: this.handBtnSubmit,
        disabled: labReportShowFlag || submitFlagChecked,
        id: 'submit_button'
      }, {
        title: 'Lab Report',
        onClick: this.toggleDialog,
        disabled: labReportFlagChecked,
        id: 'labReport_button'
      }];
    }

    const options = {
      showTitle: false,
      selection: 'ioeRequestNumber',
      maxBodyHeight: mode === 'patient' ? this.state.wrapperHight - 318 : this.state.wrapperHight - 227,
      overflowX: 'unset',
      overflowY: 'unset',
      draggable: false,
      headerStyle: {
        top: 0,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        maxWidth: '8vw',
        fontSize: font.fontSize,
        fontFamily: font.fontFamily,
        borderColor: '#B8BCB9',
        borderStyle: 'solid',
        borderWidth: 0,
        borderBottom: '1px solid #B8BCB9'
      }
      // paging:true
    };
    let EnquiryPatientDialogParams = {
      details: details,
      openTooltip: openTooltip,
      handleClose: this.handleClose
    };
    let InvalidateFormDialogParams = {
      enquiryList: selected,
      handleClose: this.handleCloseInvalidateFormDialog,
      invalidateFormDialogOpen: invalidateFormDialogOpen,
      insertIxEnquiryLog: this.insertIxEnquiryLog,
      handleInvalidateFormCallback: this.handleInvalidateFormCallback,
      initialParm: this.state.initialParm
    };
    let dateTimeProps = {
      id: 'specimen_collection_dt',
      datetime: specimentCollectionDT,
      disableFlag: !specimentCollectionDTSwitch || printDisabledFlag,
      onChange: this.handleDatetimeChanged,
      format: 'DD-MMM-YYYY HH:mm'
    };

    let dateTimePropsInfo = {
      id: 'specimen_collection_dt',
      datetime: specimentCollectionDT,
      disableFlag: !specimentCollectionDTSwitch || printDisabledFlag,
      onChange: this.handleDatetimeChanged,
      format: 'DD-MMM-YYYY HH:mm'
    };
    const columns = [
      {
        title: <Checkbox
            checked={selected.length === historyList.length && historyList.length > 0}
            onChange={this.onSelectAllClick}
            id={'checkbox_all'}
               />, disabledTitle: true, field: 'checkBox', cellStyle: { width: '2%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, headerStyle: { width: '2%', textAlign: 'center' }, render: (record) => {
          return (<Checkbox checked={this.isSelected(record)} />);
        }
      },
      {
        title: <Tip />, disabledTitle: true, headerStyle: { width: '2%', paddingLeft: 4, textAlign: 'center' }, field: 'warningFlag', cellStyle: { width: '2%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' },
        render: (record) => {
          if (record.warningFlag) {
            const item = legends[record.warningFlag];
            if (item) {
              return <Tooltip style={{ margin: '0 0 0 4px' }} title={<Typography className={classes.tooltip}>{item.describe}</Typography>}><p><item.icon style={{ color: item.color }} /></p></Tooltip>;
            }
          }
        }
      },
      {
        title: 'Request Date', field: 'requestDatetime', headerStyle: { width: '9%' }, cellStyle: { width: '9%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          if (record.requestDatetime) {
            return (
              <HtmlTooltip placement="bottom-start"
                  title={
                  <React.Fragment >
                    <div style={{ maxWidth: 200 }}>
                      <Typography className={classes.labelRoot}
                          component="div"
                      >{moment(record.requestDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE)}</Typography>
                    </div>
                  </React.Fragment>
                }
              >
                <p className={classNames(classes.cellContent, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{moment(record.requestDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE)}</p>
              </HtmlTooltip>
            );
          }
        }
      },
      {
        title: 'Ix Request No. (IRN)', field: 'ioeRequestNumber', headerStyle: { width: '9%' }, cellStyle: { width: '9%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip
                placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 200 }}>
                    <Typography className={classes.labelRoot}
                        component="div"
                    >{record.ioeRequestNumber}</Typography>
                  </div>
                </React.Fragment>
              }
            >
              <p className={classNames(classes.cellContent, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{record.ioeRequestNumber}</p>
            </HtmlTooltip>
          );
        }
      },
      {
        title: 'Patient Name', field: 'patientName', headerStyle: { width: '9%' }, cellStyle: { width: '9%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 200 }}>
                    <Typography className={classes.labelRoot}
                        component="div"
                    >{record.patientName}</Typography>
                  </div>
                </React.Fragment>
              }
            >
              <p className={classNames(classes.cellContent, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{record.patientName}</p>
            </HtmlTooltip>
          );
        }
      },
      {
        title: 'Form Name', field: 'formName', headerStyle: { width: '9%' }, cellStyle: { width: '9%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 500 }}>
                    <Typography className={classes.labelRoot}
                        component="div"
                    >{record.formName}</Typography>
                  </div>
                </React.Fragment>
              }
            >
              <a className={classNames(classes.cellContentItem, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })} href="#" onClick={() => { this.handleHint(record); }}>{record.formName}</a>
            </HtmlTooltip>
          );
        }
      },
      {
        title: 'Service', field: 'serviceCd', headerStyle: { width: '6%' }, cellStyle: { width: '6%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 200 }}>
                    <Typography className={classes.labelRoot}
                        component="div"
                    >{record.serviceCd}</Typography>
                  </div>
                </React.Fragment>
              }
            >
              <p className={classNames(classes.cellContent, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{record.serviceCd}</p>
            </HtmlTooltip>
          );
        }
      },
      {
        title: 'Clinic', field: 'clinicCd', headerStyle: { width: '11%' }, cellStyle: { width: '11%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 200 }}>
                    <Typography className={classes.labelRoot}
                        component="div"
                    >{record.clinicName}</Typography>
                  </div>
                </React.Fragment>
              }
            >
              <p className={classNames(classes.cellContentItem, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{record.clinicName}</p>
            </HtmlTooltip>
          );
        }
      },
      {
        title: 'Instruction', field: 'instruction', headerStyle: { width: '9%' }, cellStyle: { width: '9%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 200 }}>
                    <Typography className={classes.labelRoot}
                        component="div"
                    >{record.instruction}</Typography>
                  </div>
                </React.Fragment>
              }
            >
              <p className={classNames(classes.cellContentItem, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{record.instruction}</p>
            </HtmlTooltip>
          );
        }
      },
      {
        title: 'Test', field: 'test', headerStyle: { width: '11%' }, cellStyle: { width: '11%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip
                placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 1000 }}>
                    {
                      _.split(record.test === undefined ? '' : record.test, '-|-', 100).map((teststr, index) => {
                        return (
                          <Typography className={classes.labelRoot}
                              component="div"
                              key={index}
                          >- {teststr}</Typography>
                        );
                      })

                    }
                  </div>
                </React.Fragment>
              }
            >
              <div
                  title={
                  <div style={{ maxWidth: 1000 }}>
                    {
                      _.split(record.test === undefined ? '' : record.test, '-|-', 100).map((teststr, index) => {
                        return (
                          <Typography className={classes.labelRoot}
                              component="div"
                              key={index}
                          >- {teststr}</Typography>
                        );
                      })

                    }
                  </div>
                }
                  className={classNames(classes.cellContent, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}
              >
                {
                  _.split(record.test, '-|-', 100).map((teststr, index) => {
                    if (index < 3) {
                      if (index === 2 && (_.split(record.test, '-|-', 100)).length > 3) {
                        return (
                          <Typography
                              style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                              component="div"
                              key={index}
                              className={classes.labelRoot}
                          >- {teststr}...</Typography>
                        );
                      }
                      else {
                        return (
                          <Typography
                              style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                              className={classes.labelRoot}
                              component="div"
                              key={index}
                          >- {teststr}</Typography>
                        );
                      }
                    }
                    else {
                      return;
                    }
                  })
                }
              </div>
            </HtmlTooltip>
          );
        }
      },
      {
        title: 'Specimen', field: 'specimen', headerStyle: { width: '12%' }, cellStyle: { width: '12%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip
                placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 1000 }}>
                    {
                      _.split(record.specimen === undefined ? '' : record.specimen, '-|-', 100).map((teststr, index) => {
                        return (
                          <Typography className={classes.labelRoot}
                              component="div"
                              key={index}
                          >- {teststr}</Typography>
                        );
                      })

                    }
                  </div>
                </React.Fragment>
              }
            >
              <div
                  className={classNames(classes.cellContent, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}
              >
                {
                  _.split(record.specimen, '-|-', 100).map((teststr, index) => {
                    if (index < 3) {
                      if (index === 2 && (_.split(record.specimen, '-|-', 100)).length > 3) {
                        return (
                          <Typography
                              style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                              component="div"
                              key={index}
                              className={classes.labelRoot}
                          >- {teststr}...</Typography>
                        );
                      }
                      else {
                        return (
                          <Typography
                              style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
                              className={classes.labelRoot}
                              component="div"
                              key={index}
                          >- {teststr}</Typography>
                        );
                      }
                    }
                    else {
                      return;
                    }
                  })
                }
              </div>
            </HtmlTooltip>
          );
        }
      },
      {
        title: 'Request By', field: 'requestUser', headerStyle: { width: '6%' }, cellStyle: { width: '6%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 200 }}>
                    <Typography className={classes.labelRoot}
                        component="div"
                    >{record.requestUser}</Typography>
                  </div>
                </React.Fragment>
              }
            >
              <p className={classNames(classes.cellContentUserBy, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{record.requestUser}</p>
            </HtmlTooltip>
          );
        }
      },
      {
        title: 'Specimen Collection Date', field: 'specimenCollectDatetime', headerStyle: { maxWidth: '6vw' }, cellStyle: { borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          if (record.specimenCollectDatetime) {
            return (
              <HtmlTooltip placement="bottom-start"
                  title={
                  <React.Fragment >
                    <div style={{ maxWidth: 200 }}>
                      <Typography className={classes.labelRoot}
                          component="div"
                      >{moment(record.specimenCollectDatetime).format(Enum.DATE_FORMAT_24_HOUR)}</Typography>
                    </div>
                  </React.Fragment>
                }
              >
                <p className={classNames(classes.cellContent, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{moment(record.specimenCollectDatetime).format(Enum.DATE_FORMAT_24_HOUR)}</p>
              </HtmlTooltip>
            );
          }
        }
      },
      {
        title: 'Report Received Date', field: 'rptRcvDatetime', headerStyle: { maxWidth: '5vw' }, cellStyle: { width: '6%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          if (record.rptRcvDatetime) {
            return (
              <HtmlTooltip placement="bottom-start"
                  title={
                  <React.Fragment >
                    <div style={{ maxWidth: 200 }}>
                      <Typography className={classes.labelRoot}
                          component="div"
                      >{moment(record.rptRcvDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE)}</Typography>
                    </div>
                  </React.Fragment>
                }
              >
                <p className={classNames(classes.cellContentUserBy, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{moment(record.rptRcvDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE)}</p>
              </HtmlTooltip>
            );
          }
        }
      },
      {
        title: 'Lab No.', field: 'labNum', headerStyle: { width: '10%' }, cellStyle: { width: '10%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 200 }}>
                    <Typography className={classes.labelRoot}
                        component="div"
                    >{record.labNum}</Typography>
                  </div>
                </React.Fragment>
              }
            >
              <p className={classNames(classes.cellContent, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{record.labNum}</p>
            </HtmlTooltip>
          );
        }
      },
      {
        title: <ReportStatusTip />, disabledTitle: true, headerStyle: { width: '2%', paddingLeft: 4, textAlign: 'center' }, field: 'warningFlag', cellStyle: { width: '2%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' },
        render: (record) => {
        }
      },
      {
        title: 'Report Status', field: 'reportStatus', headerStyle: { width: '5%', maxWidth: '3vw' }, cellStyle: { width: '5%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 200 }}>
                    <Typography className={classes.labelRoot}
                        component="div"
                    >{record.reportStatus}</Typography>
                  </div>
                </React.Fragment>
              }
            >
              <p className={classNames(classes.cellContentItem, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{record.reportStatus}</p>
            </HtmlTooltip>
          );
        }
      },
      {
        title: 'Report Items', field: 'reportItem', headerStyle: { width: '5%' }, cellStyle: { width: '5%', borderColor: '#B8BCB9', borderStyle: 'solid', borderWidth: 0, borderBottom: '1px solid #B8BCB9' }, render: (record) => {
          return (
            <HtmlTooltip placement="bottom-start"
                title={
                <React.Fragment >
                  <div style={{ maxWidth: 500 }}>
                    <Typography className={classes.labelRoot}
                        component="div"
                    >{record.reportItem}</Typography>
                  </div>
                </React.Fragment>
              }
            >
              <p className={classNames(classes.cellContentItem, { [classes.invalidateCellContent]: record.isInvld === 1 ? true : false })}>{record.reportItem}</p>
            </HtmlTooltip>
          );
        }
      }
    ];
    let printerProps = {
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      onPrinterCheckboxChange: this.onPrinterCheckboxChange,
      handlePrint: this.handlePrint,
      disabledFlag: printDisabledFlag
    };

    let printerPropsInfo = {
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      onPrinterCheckboxChange: this.onPrinterCheckboxChange,
      handlePrint: this.handlePrint,
      disabledFlag: printDisabledFlag
    };
    let patientDto = mode == 'patient' ? (commonUtils.reportGeneratePatientDto()) : (patientInfoByClinic != null ? commonUtils.reportGeneratePatientDto(patientInfoByClinic, patientInfoByClinicCaseNo) : null);
    let reminderPrintDialogParams = {
      open: open,
      lableIsChecked,
      outputFormIsChecked,
      reminderReported,
      templateList,
      specimentCollectionDTSwitch,
      requestDtos: selectedSpecimenCollectionList,
      patientDto,
      handleCloseDialog: this.handleCloseReminderPrintDialog,
      insertIxEnquiryLog: this.insertIxEnquiryLog,
      handleMultipleReportCallback: this.handleMultipleReportCallback
    };
    const buttonBar = {
      isEdit: false,
      position: 'fixed',
      buttons: btnBarNot,
      handleCancelLog: this.handleCancelLog,
      style: {
        // justifyContent:'space-between',
        // display: 'flex',
        height: 60
      },
      render: () => {
        return (
          <div style={{ flexGrow: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 870 }}>
            <div style={{ float: 'left' }}>
              No.of Request: {count}
            </div>
            <div className={classes.enquiryWrapper}>
              <div className={classes.enquiryDiv}>
                <div style={{ paddingLeft: 45, fontWeight: 'bold', color: printDisabledFlag ? 'rgba(0, 0, 0, 0.26)' : (specimentCollectionDTSwitch ? color.cimsTextColor : 'rgba(0, 0, 0, 0.26)') }}>Specimen Collection Date & Time</div>
                <div>
                  {/* disabled={printDisabledFlag}  */}
                  <Checkbox id="specimen_collection_dt_checkbox" color="primary" checked={specimentCollectionDTSwitch} disabled={printDisabledFlag} onChange={this.handleDTCheckboxChanged} />
                  <CustomDateTimePicker {...dateTimePropsInfo} />
                </div>
              </div>

              <div style={{ float: 'right', marginRight: 10 }}>
                <JPrinter {...printerPropsInfo} />
              </div>
            </div>
          </div>
        );
      }
    };
    const buttonBarForClinic = {
      isEdit: false,
      position: 'fixed',
      buttons: btnBarNot,
      handleCancelLog: this.handleCancelLog,
      style: { height: 60 },
      render: () => {
        return (
          <div style={{ flexGrow: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', minWidth: 870 }}>
            <div style={{ float: 'left' }}>
              No.of Request: {count}
            </div>
            <div className={classes.enquiryWrapper}>
              <div className={classes.enquiryDiv}>
                <div style={{ paddingLeft: 45, fontWeight: 'bold', color: printDisabledFlag ? 'rgba(0, 0, 0, 0.26)' : (specimentCollectionDTSwitch ? color.cimsTextColor : 'rgba(0, 0, 0, 0.26)') }}>Specimen Collection Date & Time</div>
                <div>
                  <Checkbox id="specimen_collection_dt_checkbox_Clini" color="primary" checked={specimentCollectionDTSwitch} disabled={printDisabledFlag} onChange={this.handleDTCheckboxChanged} />
                  <CustomDateTimePicker {...dateTimeProps} />
                </div>
              </div>
              <div style={{ float: 'right', marginRight: 10 }}>
                <JPrinter {...printerProps} />
              </div>
            </div>
          </div>
        );
      }
    };
    return (
      <Container buttonBar={mode === 'patient' ? buttonBar : buttonBarForClinic} style={{ margin: '12px' }}>
        <div ref={this.content} className={classes.wrapper}>
          <div className={classes.label_div}>
            <div style={{ color: '#000000', fontSize: '1.5rem', fontFamily: 'Arial' }}>
              Ix Enquiry
              {mode == 'patient' ? '' : ' by Clinic'}
            </div><br />
            {
              mode == 'patient' ? null :
                <div style={{ color: '#000000', fontSize: '1rem', fontFamily: 'Arial', fontWeight: 600, marginBottom: 15 }}>
                  Clinic:&nbsp;{clinic.clinicName}({clinic.clinicCd})
            </div>
            }
            <Filter updateState={this.updateState} insertIxEnquiryLog={this.insertIxEnquiryLog} onSearch={this.handleSearch} mode={mode} options={{ forms, serviceOptions, clinicOptions, requestedByList }} getClinics={this.getClinics} loginInfo={loginInfo} dispatch={dispatch} patientInfo={patientInfo} />
          </div>
          <div
              className={classNames(classes.tableDiv, { [classes.byClinic]: mode === 'patient' ? false : true })}
          >
            <Table
                isPagination
                id="enquiryTable"
                size={'sticky'}
                columns={mode == 'clinic' ? columns.filter(item => item.title !== 'Service' && item.title !== 'Clinic') : columns.filter(item => item.title !== 'Patient Name')}
                data={historyList}
                options={options}
                selected={selected}
                rowsPerPageOptions={rowsPerPageOptions}
                onSelectionChange={this.handleSelectionChange}
                handleChangeRowsPerPageCallBack={this.handleChangeRowsPerPageCallBack}
                handleChangePageCallBack={this.handleChangePageCallBack}
                handleOnClick={this.handleOnClick}
                count={count}
            />
          </div>
        </div>
        <LaboratoryReportDialog  disabledFlag={this.state.disabledFlag} selected={this.state.selectedRow} open={this.state.LaboratoryReportDialogOpen} insertIxEnquiryLog={this.insertIxEnquiryLog} dispatch={dispatch} updateState={(state) => { this.setState(state); }} />
        <EnquiryPatientDialog  {...EnquiryPatientDialogParams} />
        <InvalidateFormDialog  {...InvalidateFormDialogParams} />
        <ReminderPrintDialog {...reminderPrintDialogParams} />
      </Container>
    );

  }
}

const mapStateToProps = state => {
  return {
    patientInfo: state.patient.patientInfo,
    patientInfoByClinic: state.laboratoryReport.patientInfoByClinic,
    patientInfoByClinicCaseNo: state.laboratoryReport.patientInfoByClinicCaseNo,
    enquiry: state.enquiry,
    loginInfo: {
      ...state.login.loginInfo,
      clinic: {
        code: state.login.clinic.clinicCd
      },
      service: {
        code: state.login.service.serviceCd
      }
    },
    common: state.common,
    accessRights: state.login.accessRights
  };
};

const mapDispatchToProps = {
  getServiceSpecificFunctionInfo,
  getOfficerDoctorDropdownList,
  openCommonMessage,
  closeCommonMessage,
  getPatientByIdClinic,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  updateCurTab,
  doAllOperationSubmit
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Enquiry));

