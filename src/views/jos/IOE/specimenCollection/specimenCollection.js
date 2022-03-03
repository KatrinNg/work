/*
 * Front-end UI for load&save specimen collection readings
 * Load EncounterId Field Dropdown List and get specimen collection list Action: [specimenCollection.js] componentDidMount
 * -> [medicalSummaryAction.js] [specimenCollectionAction.js] getIoeSpecimenCollectionList
 * -> [medicalSummarySaga.js] [specimenCollectionSaga.js] getIoeSpecimenCollectionList
 * -> Backend API = clinical-note/clinicalNote/${encounterId},ioe/loadIoeRequestRecords
 * Save Action: [specimenCollection.js]  submit,handlePrintLabel,handlePrintOutPutForm
 * -> [specimenCollectionAction.js] saveIoeSpecimenCollectionList
 * -> [specimenCollectionSaga.js] saveIoeSpecimenCollectionList
 * -> Backend API =ioe/operateIoeRequests
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Card, CardContent, Typography, CardHeader, Grid, Checkbox } from '@material-ui/core';
import { styles } from './specimenCollectionStyle';
import { getIoeSpecimenCollectionList, saveIoeSpecimenCollectionList, getIoeSpecimenCollectionTemplsForReport} from '../../../../store/actions/IOE/specimenCollection/specimenCollectionAction';
import { doAllOperation,doAllOperationSubmit} from '../../../../store/actions/IOE/ixRequest/ixRequestAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { openCommonCircularDialog,josPrint,closeCommonCircularDialog,josPrinterCheck,josPrinterStatusCheck} from '../../../../store/actions/common/commonAction';
import { indexOf, toLower, trim, includes, find } from 'lodash';
import SpecimenCollectionSearchInput from './components/SpecimenCollectionSearchInput';
import JOSTableNoPagination from './components/JOSTableNoPagination';
import moment from 'moment';
import { SPECIMEN_COLLECTION_CODE } from '../../../../constants/message/IOECode/specimenCollectionCode';
import Container from 'components/JContainer';
import * as commonUtils from '../../../../utilities/josCommonUtilties';
import CustomDateTimePicker from './components/DateTimePicker/CustomDateTimePicker';
import JPrinter from '../../../../components/JPrinter/JPrinter';
import ReminderPrintDialog from './components/ReminderPrintDialog';
import Enum from '../../../../../src/enums/enum';
import * as commonConstants from '../../../../constants/common/commonConstants';
import * as constants from '../../../../constants/IOE/specimenCollection/specimenCollectionConstants';
import { getServiceSpecificFunctionInfo } from '../../../../store/actions/IOE/ixRequest/ixRequestAction';
import {updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import _ from 'lodash';
import accessRightEnum from '../../../../enums/accessRightEnum';
import doCloseFuncSrc from '../../../../constants/doCloseFuncSrc';
import { getState } from '../../../../store/util';
const { color } = getState((state) => state.cimsStyle) || {};

class SpecimenCollection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: null,
      dataList: [],
      searchProcedureRecordList: [],
      clinicEngDesc: JSON.parse(sessionStorage.getItem('clinic')).clinicName!==undefined?JSON.parse(sessionStorage.getItem('clinic')).clinicName+'('+JSON.parse(sessionStorage.getItem('clinic')).clinicCd+')':JSON.parse(sessionStorage.getItem('clinic')).clinicCd,
      serviceCd: JSON.parse(sessionStorage.getItem('service')).serviceCd,
      pageNum: null,
      tableRows: [
        {
          name: 'requestDatetime', width: '6%', label: 'Request Date', customBodyRender: (value) => {
            return value ? moment(value).format('DD-MMM-YYYY') : null;
          }
        },
        { name: 'requestUser', width: '6%', label: 'Requested By' },
        { name: 'instruction', width: '6%', label: 'Instruction' },
        { name: 'test', width: '15%', label: 'Test' },
        { name: 'specimen', width: '10%', label: 'Specimen' },
        { name: 'outputFormPrinted', width: '5%', label: 'Output Form' },
        { name: 'formName', label: 'Form Name', width: '15%' }
      ],
      tableOptions: {
        rowHover: true,
        rowsPerPage: 5,
        onSelectIdName: 'seq', //显示tips的列
        tipsListName: 'test', //显示tips的list
        tipsDisplayListName: 'codeIoeFormItem', //显示tips的列
        tipsDisplayName: 'frmItemName', //显示tips的值
        bodyCellStyle: this.props.classes.customRowStyle,
        headRowStyle: this.props.classes.headRowStyle,
        headCellStyle: this.props.classes.headCellStyle
      },
      specimenCollectionList: [],
      oldSpecimenCollectionList: [],
      inputVal: '',
      selected: [],
      oldSelected: [],
      oldSelectTimes: 0,
      isSave: true,
      specimentCollectionDTSwitch: false,  //default:enable
      specimentCollectionDT: new Date(),
      btnSwith:false,
      reminderIsChecked: false,
      lableIsChecked: false,
      outputFormIsChecked: false,
      labelTimes:0,
      requestList:[],
      printReportNum:1,
      printReportFail:'',
      printLabelFail:'',
      freshIoeRequest:[],
      templateList:[],
      selectedSpecimenCollectionList:[],
      reminderReported:false,
      freshIoeFlag:false
    };
  }

  componentDidMount() {
    this.props.ensureDidMount();
    const { encounterData } = this.props;
    let params = {
      patientKey: encounterData.patientKey
    };
    let templParams = {};
    this.props.openCommonCircularDialog();

    this.props.getIoeSpecimenCollectionTemplsForReport({
      templParams,
      callback: (data) => {
        this.setState({
          templateList: data
        });
      }
    });

    this.props.getIoeSpecimenCollectionList({
      params,
      callback: (data) => {
        this.setState({
          specimenCollectionList: data,
          oldSpecimenCollectionList: data
        });
      }
    });
    this.props.getServiceSpecificFunctionInfo({
      params:{
        functionName: constants.FUNCTION_NAME
      },
      callback: (data) => {
        let outputFormIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.SPECIMEN_COLLECTION_OUTPUT_FORM_FUNCTION_CODE);
        let reminderIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.SPECIMEN_COLLECTION_REMINDER_FUNCTION_CODE);
        let lableIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.SPECIMEN_COLLECTION_LABEL_FUNCTION_CODE);
        let btnSwith = outputFormIsChecked || reminderIsChecked || lableIsChecked;
        let specimentCollectionDTSwitch= commonUtils.getDefalutValByCheckBoxCd(data.data,commonConstants.COMMON_CODE.SPECIMEN_COLLECTION_DATE_CHECKBOX_CODE);
        this.setState({
          specimentCollectionDTSwitch,
          outputFormIsChecked,
          reminderIsChecked,
          lableIsChecked,
          btnSwith
        });
      }
    });
    this.props.closeCommonCircularDialog();
    this.insertSpecimenCollectionLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} Specimen Collections`,'ioe/loadIoeRequestRecords');
    this.props.updateCurTab(accessRightEnum.specimenCollection, this.doClose);
    this.setState({
      selectedEncounterVal: encounterData.encounterId,
      selectedPatientKey: encounterData.patientKey
    });
  }

  doClose = (callback, doCloseParams) => {
    if (doCloseParams.src === doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON) {
      this.insertSpecimenCollectionLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to Close Specimen Collections`, '');
      callback(true);
    } else {
      callback(true);
    }
  }

  getSelectRow = (selectedArray) => {
    if (this.state.oldSelectTimes === 1) {
      //control select update
      let oldSelected = this.state.oldSelected;
      let specimenCollectionList = this.state.specimenCollectionList;
      if (selectedArray.length > 0) {
        for (let a = 0; a < specimenCollectionList.length; a++) {
          for (let b = 0; b < selectedArray.length; b++) {
            if (specimenCollectionList[a].ioeRequestId === selectedArray[b]) {
              if (indexOf(this.state.oldSelected, selectedArray[b]) === -1) {
                oldSelected.push(selectedArray[b]);
                break;
              }
            }
            else {
              if (selectedArray.length - 1 === b) {
                if (indexOf(this.state.oldSelected, selectedArray[b]) !== -1) {
                  let index = indexOf(this.state.oldSelected, selectedArray[b]);
                  oldSelected.splice(index, 1);
                }
              }
            }
          }
        }
      }
      else {
        for (let a = 0; a < specimenCollectionList.length; a++) {
          if (indexOf(this.state.oldSelected, specimenCollectionList[a].ioeRequestId) !== -1) {
            let index = indexOf(this.state.oldSelected, specimenCollectionList[a].ioeRequestId);
            oldSelected.splice(index, 1);
          }
        }
      }
      this.setState({
        selected: _.cloneDeep(selectedArray),
        oldSelected: oldSelected,
        isSave: false
      });
    }
    else {
      this.setState({
        selected: _.cloneDeep(selectedArray),
        oldSelected: selectedArray,
        isSave: false
      });
    }
  }

  handleFuzzySearch = (value) => {
    //filter value
    if (trim(value) !== '') {
      let dataList = this.state.oldSpecimenCollectionList;
      let newSelected = [];
      let filterDataList = [];
      let oldSelected = this.state.oldSelected;
      let deleteSelected = [];

      for (let index = 0; index < dataList.length; index++) {
        if (includes(toLower(moment(dataList[index].requestDatetime).format('DD-MMM-YYYY')), toLower(value)) || includes(toLower(dataList[index].test), toLower(value)) || includes(toLower(dataList[index].formName), toLower(value))) {
          filterDataList[filterDataList.length] = dataList[index];
          if (indexOf(this.state.selected, dataList[index].ioeRequestId) !== -1) {
            newSelected.push(dataList[index].ioeRequestId);
          } else {
            deleteSelected.push(dataList[index].ioeRequestId);
          }
        }
      }

      //add
      for (let a = 0; a < newSelected.length; a++) {
        if (indexOf(oldSelected, newSelected[a]) === -1) {
          oldSelected.push(newSelected[a]);
        }
      }
      //delete
      if (oldSelected.length > 0) {
        for (let a = 0; a < deleteSelected.length; a++) {
          if (indexOf(oldSelected, deleteSelected[a]) !== -1) {
            let index = indexOf(oldSelected, deleteSelected[a]);
            oldSelected.splice(index, 1);
          }
        }
      }
      this.setState({
        specimenCollectionList: filterDataList,
        selected: _.cloneDeep(newSelected),
        oldSelected: oldSelected,
        oldSelectTimes: 1
      });
      this.insertSpecimenCollectionLog(`Action: Search ${value} in 'Search by Requested Date / Test / Form Name'`,'');
    }
    else {
      this.setState({
        specimenCollectionList: this.state.oldSpecimenCollectionList,
        selected: _.cloneDeep(this.state.oldSelected),
        oldSelectTimes: 0
      });
    }
  }

  handlePrintOrSubmit = (selected, method, params, type) => {
    let { specimentCollectionDTSwitch, outputFormIsChecked } = this.state;
    if (specimentCollectionDTSwitch) {
      if (outputFormIsChecked) {
        if (this.validateSpecimenCollectionDT(selected)) {
          if (type === 'submit') {
            method && method(params.submitType, selected);
          } else {
            method && method(selected || [], params.reminderIsChecked, params.lableIsChecked, params.outputFormIsChecked, params.reminderReported, params.freshIoeRequest);
          }
        }
      } else {
        if (type === 'submit') {
          if (this.validateSpecimenCollectionDT(selected)) {
            method && method(params.submitType, selected);
          }
        } else {
          method && method(selected || [], params.reminderIsChecked, params.lableIsChecked, params.outputFormIsChecked, params.reminderReported, params.freshIoeRequest);
        }
      }
    } else {
      this.specimentCollectionDTSwitchUnClick(selected);
      if (type === 'submit') {
        method && method(params.submitType, selected);
      } else {
        method && method(selected || [], params.reminderIsChecked, params.lableIsChecked, params.outputFormIsChecked, params.reminderReported, params.freshIoeRequest);
      }
    }
  }

  specimentCollectionDTSwitchUnClick = (selected) => {
    let { loginInfo } = this.props;
    let result = selected;
    let flag = true;
    for (let index = 0; index < result.length; index++) {
      if(!result[index].specimenCollectDatetime){
        flag = false;
        break;
      }
    }
    if(!flag){
      for (let index = 0; index < result.length; index++) {
        if(!result[index].specimenCollectDatetime){
          result[index].specimenCollectDatetime = new Date();
          result[index].specimenCollectedBy = loginInfo.loginName;
          result[index].updatedBy = loginInfo.loginName;
          result[index].updatedDtm = new Date();
        }
      }
    }
  }

  validateSpecimenCollectionDT = (selected) =>{
    let {specimentCollectionDT} = this.state;
    let selectList = selected;
    let validFlag = true;
    let { loginInfo } = this.props;
    for (let index = 0; index < selected.length; index++) {
      if(selected[index].specimenCollectDatetime && (moment(moment(specimentCollectionDT).format(Enum.DATE_FORMAT_EDMY_VALUE)).diff((moment(selectList[index].requestDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE)))<0)){
        validFlag = false;
        break;
      }
    }
    if(!validFlag){
      let payload = {
        msgCode: SPECIMEN_COLLECTION_CODE.SPECIMEN_COLLECTION_DATETIME_VALUE_INVALIDATED
      };
      this.props.openCommonMessage(payload);
      this.props.closeCommonCircularDialog();
    }else{
      for (let index = 0; index < selectList.length; index++) {
        if(!selectList[index].specimenCollectDatetime || moment(moment(specimentCollectionDT).format(Enum.DATE_FORMAT_EDMY_VALUE)).diff((moment(selectList[index].requestDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE)))>=0){
          selectList[index].specimenCollectDatetime = specimentCollectionDT;
          selectList[index].specimenCollectedBy = loginInfo.loginName;
          selectList[index].updatedBy = loginInfo.loginName;
          selectList[index].updatedDtm = new Date();
        }
      }
    }
    return validFlag;
  }

  handleSubmit = (type) => {
    let selected= this.state.selected;
    if (selected.length > 0) {
      let submitType = '';
      let payload = {
        msgCode: SPECIMEN_COLLECTION_CODE.IS_SUBMIT_SPECIMEN_COLLECTION,
        btn1AutoClose:false,
        btnActions: {
          // Yes
          btn1Click: () => {
            if (type === 'Submit') {
              submitType = 'SU';
            } else if (type === 'Submit and Print') {
              submitType = 'SPOF';
            }
            let params = { submitType };
            selected = this.filterRequestList(selected);
            this.handlePrintOrSubmit(selected,this.submit,params,'submit');
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
    else {
      let payload = { msgCode: SPECIMEN_COLLECTION_CODE.IS_SELECT_SPECIMEN_COLLECTION };
      this.props.openCommonMessage(payload);
    }
  }

  submit = (type, DTdata = []) => {
    let { specimentCollectionDTSwitch, dataList, selected } = this.state;
    let requestList = [];
    if (DTdata.length === 0) {
      for (let a = 0; a < selected.length; a++) {
        for (let b = 0; b < dataList.length; b++) {
          if (selected[a] === dataList[b].ioeRequestId) {
            requestList[requestList.length] = dataList[b];
            break;
          }
        }
      }
    } else {
      requestList = DTdata;
    }
    this.props.openCommonCircularDialog();
    if (!specimentCollectionDTSwitch) {
      for (let index = 0; index < requestList.length; index++) {
        requestList[index].specimenCollectDatetime = null;
      }
    }
    let params = {
      ioeReminderTemplateReportDto: {},
      ioeRequestDtos: requestList,
      operationType: type === 'SPOF' ? 'SU' : type,
      patientDto: commonUtils.reportGeneratePatientDto(),
      userHclDrCode: type === 'POF' || type === 'PL' ? commonUtils.getUserHclDrCode() : ''
    };
    if (type === 'SU' || type === 'SPOF') {
      this.props.doAllOperationSubmit({
        params,
        callback: (data) => {
          //fresh data
          if (data.respCode !== undefined && data.respCode !== 0) {
            this.props.closeCommonCircularDialog();
            let payload = {
              msgCode: data.msgCode,
              btnActions: {
                btn1Click: () => {
                  if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                    let name = commonUtils.commonMessageLog(data.msgCode, 'Refresh Page');
                    this.insertSpecimenCollectionLog(name, '');
                    this.freshSpecimenCollection(type);
                  }
                }, btn2Click: () => {
                  let name = commonUtils.commonMessageLog(data.msgCode, 'Cancel');
                  this.insertSpecimenCollectionLog(name, '');
                }
              }
            };
            this.props.openCommonMessage(payload);
          }
          else {
            if (type === 'SU') {
              let content = 'Selected records: ';
              let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Submit' button`;
              selected.forEach(element => { content += element + ';'; });
              let payload = { msgCode: data.respCode === 0 ? '101302' : '101303' };
              if (data.respCode === 0) {
                payload.showSnackbar = true;
                this.freshSpecimenCollection('A');
              }
              this.props.openCommonMessage(payload);
              this.insertSpecimenCollectionLog(name, '/ioe/ixRequest/operation', content);
            }
            else if (type === 'SPOF') {
              let payload = { msgCode: data.respCode === 0 ? '101302' : '101303' };
              if (data.respCode === 0) {
                let { reminderIsChecked, lableIsChecked, outputFormIsChecked } = this.state;
                payload.showSnackbar = true;
                this.setState({ freshIoeRequest: data.data, freshIoeFlag: true });
                this.handlePrint(reminderIsChecked, lableIsChecked, outputFormIsChecked, false, data.data, type);
              }
              this.props.openCommonMessage(payload);
            }
          }
        }
      });
    } else {
      //check printer open status
      this.printerIsOpen(type, params);
    }
  }

  printMultipleReport = (type,reportDataList,index) => {
    if(this.state.selected.length>=index){
        let multipleParams={reportDataList:reportDataList,type:type,index:index};
        multipleParams.requestList = this.state.requestList;
        multipleParams.labelTimes = this.state.labelTimes;
        multipleParams.printLabelFail = this.state.printLabelFail;
        multipleParams.printReportFail = this.state.printReportFail;
        multipleParams.freshIoeRequest = this.state.freshIoeRequest;
        let params={
          base64: reportDataList,callback:this.printMultipleReportCallback,
          printQueue:type==='PL'?'CIMS2_ZebraLabelPrinter':''
        };
        this.props.josPrint(params);
        this.setState({multipleParams});
    }
    else{
      //2 was print report type num
      if(this.state.printReportNum<2){
        let labelList = [];
        let freshIoeRequest =this.state.freshIoeRequest;
        labelList.push(freshIoeRequest[0]);
        this.setState({printReportNum:2,labelTimes:0,freshIoeFlag:true});
        this.submit('POF',labelList);
      }else{
        //print report fail label.
        if(this.state.printReportFail===''){
          let payload = {
            msgCode: '101317',
            showSnackbar: true,
            params:[
              {name:'reportType',value:type==='PL'?'label':'report'}
            ]
          };
          this.props.openCommonMessage(payload);
        }
        this.freshSpecimenCollection('A');
      }
    }
  }

  printMultipleReportCallback = (data, multipleParams) => {
    multipleParams = multipleParams ? multipleParams : this.state.multipleParams;
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
          this.freshSpecimenCollection(type);
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
            // let freshIoeRequest = this.state.freshIoeRequest?this.state.freshIoeRequest:multipleParams.freshIoeRequest;
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
            this.freshSpecimenCollection('A');
          }
        }
      }
    }
  }

  getPrintReportAPI = (type, params) => {
    if (type === 'POF' && this.state.specimentCollectionDTSwitch) {
      params.ioeRequestDtos[0].specimenCollectDatetime = this.state.specimentCollectionDT;
    }
    this.props.openCommonCircularDialog();
    this.props.doAllOperation({
      params,
      callback: (data) => {
        //fresh data
        if (data.respCode !== undefined && data.respCode !== 0) {
          let payload = { msgCode: data.msgCode };
          this.props.openCommonMessage(payload);
          this.props.closeCommonCircularDialog();
        }
        else {
          if (data.respCode === 0) {
            let labelTimes = this.state.labelTimes + 1;
            let freshIoeRequest = this.state.freshIoeRequest;
            data.data.ioeRequestData[0].ioeRequestItems = null;
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
    if(type === 'PL') {
      let multipleParams = {
        type,
        apiParams
      };
      let params={
        multipleParams,
        callback:this.printerIsOpenCallback,
        printQueue:'CIMS2_ZebraLabelPrinter',
        action:'isPrintQueueAvailable'
      };
      this.props.josPrinterStatusCheck(params);
    } else {
       this.getPrintReportAPI(type, apiParams);
    }
  }

  printerIsOpenCallback = (printResult, params) => {
    if(printResult) {
      this.getPrintReportAPI(params.multipleParams.type, params.multipleParams.apiParams);
    } else {
      let payload = {
        msgCode: SPECIMEN_COLLECTION_CODE.LABEL_PRINTER_IS_NOT_AVAILABLE,
        btnActions: {
          btn1Click: () => {
            let { outputFormIsChecked } = this.state;
            if(outputFormIsChecked){
              params.multipleParams.apiParams.operationType = 'POF';
              this.setState({printReportNum:2,labelTimes:0,freshIoeFlag:false},() => this.getPrintReportAPI('POF', params.multipleParams.apiParams));
            }else {
              this.freshSpecimenCollection('A');
            }
            this.props.closeCommonCircularDialog();
          }
        }
      };
      this.props.openCommonMessage(payload);
    }
  }

  handlePrintLabel = () => {
    let selected = this.state.selected;
    if (selected.length < 1) {
      let payload = {
        msgCode: SPECIMEN_COLLECTION_CODE.IS_SELECT_SPECIMEN_COLLECTION
      };
      this.props.openCommonMessage(payload);
    }
    else {
      if (selected.length !== 1) {
        let payload = {
          msgCode: SPECIMEN_COLLECTION_CODE.IS_ONLY_SELECT_ONE_SPECIMEN_COLLECTION
        };
        this.props.openCommonMessage(payload);
      }
      else {
        this.submit('PL');
      }
    }
  }

  handlePrintOutPutForm = (type,freshIoeRequest) => {
    let selected = this.state.selected;
    if (selected.length < 1) {
      let payload = {
        msgCode: SPECIMEN_COLLECTION_CODE.IS_SELECT_SPECIMEN_COLLECTION
      };
      this.props.openCommonMessage(payload);
    }
    else {
      let tempObj = this.filterRequestList(selected);
      let initArray = [];
      if(freshIoeRequest.length<1){
        initArray.push(tempObj.selectedDataList[0]);
      }else{
        initArray.push(freshIoeRequest[0]);
      }
      if(type){
        this.submit('POF',initArray);
      }else{
        this.submit('PL',initArray);
      }
    }
  }

  freshSpecimenCollection = (type) => {
    let params = { patientKey: this.state.selectedPatientKey };
    this.props.openCommonCircularDialog();
    this.props.getIoeSpecimenCollectionList({
      params,
      callback: (data) => {
        if (!(type === 'PL' || type === 'POF')) {
          this.setState({
            oldSpecimenCollectionList: data,
            specimenCollectionList: data,
            selected: [],
            oldSelected: [],
            inputVal: '',
            isSave: true,
            labelTimes:0,
            printReportNum:1,
            printLabelFail:'',
            printReportFail:'',
            freshIoeRequest:[],
            freshIoeFlag:false
          });
          this.props.closeCommonCircularDialog();
        }
        else {
          this.setState({
            oldSpecimenCollectionList: data,
            specimenCollectionList: data,
            selected: [],
            // oldSelected: [],
            inputVal: '',
            isSave: true,
            labelTimes:0,
            printReportNum:1,
            printLabelFail:'',
            printReportFail:'',
            freshIoeRequest:[],
            freshIoeFlag:false
          });
          this.props.closeCommonCircularDialog();
        }
      }
    });
  }

  handleDTCheckboxChanged = (event) => {
    if(event.target.checked){
      this.setState({specimentCollectionDT:new Date()});
    }
    this.setState({specimentCollectionDTSwitch:event.target.checked});
  }

  handleDatetimeChanged = (momentObj) => {
    this.setState({
      specimentCollectionDT: momentObj!==null?(moment(momentObj).isValid()?moment(momentObj).toDate():null):null
    });
  }

  onPrinterCheckboxChange = (event,name,printDisabledFlag) => {
    let flag = printDisabledFlag ? false : true;
    this.setState({
      btnSwith: flag,
      [name]: event.target.checked
    });
  }

  handlePrint=(reminderIsChecked,lableIsChecked,outputFormIsChecked,reminderReported,freshIoeRequest,type)=>{
    let param = {
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      reminderReported,
      freshIoeRequest
    };
    let { selected,specimentCollectionDTSwitch,specimentCollectionDT } = this.state;
    if (selected.length < 1) {
      let payload = {
        msgCode: SPECIMEN_COLLECTION_CODE.IS_SELECT_SPECIMEN_COLLECTION
      };
      this.props.openCommonMessage(payload);
    }else{
      let name=`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Print' button`;
      let content = 'Selected records: ';
      if (type === 'SPOF') { name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Submit & Print' button`; }
      selected.forEach(element => { content += element + ';'; });
      content += `\nIs 'Specimen Collection Date & Time' checked:${specimentCollectionDTSwitch ? 'Yes' : 'No'};\n`;
      let dateTime = moment(specimentCollectionDT).format(Enum.DATE_FORMAT_24_HOUR);
      content += `Specimen Collection Date & Time: ${specimentCollectionDTSwitch ? dateTime : 'show null'};\n`;
      content += `Is 'Reminder' checked: ${reminderIsChecked ? 'Yes' : 'No'};\n`;
      content += `Is 'Label' checked: ${lableIsChecked ? 'Yes' : 'No'};\n`;
      content += `Is 'Output Form' checked: ${outputFormIsChecked ? 'Yes' : 'No'};`;
      this.insertSpecimenCollectionLog(name, '', content);
      //check ccp printer's status
      let params={
        callback:this.printStart,
        param
      };
      this.props.josPrinterCheck(params);
    }
  }

  printStart=(data,params) => {
    if(data) {
      //filter isInvld' value is 1
      this.props.openCommonCircularDialog();
      let { selected } = this.state;
      selected = this.filterRequestList(selected);
      this.handlePrintOrSubmit(selected,this.printMethod,params.param,'print');
    }
  }

  printMethod = (requestList, reminderIsChecked, lableIsChecked, outputFormIsChecked, reminderReported, freshIoeRequest) => {
    let num = 0;
    // let { selected } = this.state;
    if (lableIsChecked)
      num++;
    if (outputFormIsChecked)
      num++;
    if (reminderIsChecked)
      num++;
    if (num === 1 && lableIsChecked) {
      let labelList = [];
      if (freshIoeRequest == undefined || freshIoeRequest.length < 1) {
        this.setState({ requestList });
        labelList.push(requestList[0]);
      } else {
        labelList = freshIoeRequest;
      }
      this.submit('PL', labelList);
      this.setState({ printReportNum: 2 });
    }
    else if (num === 1 && outputFormIsChecked) {
      if (freshIoeRequest && freshIoeRequest.length > 0) {
        requestList = freshIoeRequest;
      }
      this.handlePrintOutPutForm(true, requestList);
      this.setState({ requestList, printReportNum: 2 });
    }
    else if (num === 1 && reminderIsChecked) {
      this.handleOpenReminderPrintDialog();
    }
    else if (outputFormIsChecked && lableIsChecked && reminderIsChecked) {
      this.handleOpenReminderPrintDialog();
    } else if (outputFormIsChecked && lableIsChecked) {
      if (freshIoeRequest && freshIoeRequest.length > 0) {
        requestList = freshIoeRequest;
      }
      this.setState({ requestList });
      this.handlePrintOutPutForm(false, requestList);
    } else if (reminderIsChecked && lableIsChecked) {
      if (reminderReported) {
        let labelList = [];
        if (freshIoeRequest.length < 1) {
          labelList.push(requestList[0]);
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

  filterRequestList = (selected) => {
    let { specimenCollectionList } = this.state;
    let arr = [];
    for (let a = 0; a < selected.length; a++) {
      for (let b = 0; b < specimenCollectionList.length; b++) {
        if (selected[a] === specimenCollectionList[b].ioeRequestId && specimenCollectionList.isInvld !== 1) {
          arr.push(specimenCollectionList[b]);
          break;
        }
      }
    }
    return arr;
  }

  handleCloseReminderPrintDialog = () => {
    this.setState({ open: false });
  }

  handleOpenReminderPrintDialog = () => {
    let { specimenCollectionList, selected } = this.state;
    let selectedDataList = [];
    if (selected.length < 1) {
      let payload = {
        msgCode: SPECIMEN_COLLECTION_CODE.IS_SELECT_SPECIMEN_COLLECTION
      };
      this.props.openCommonMessage(payload);
    } else {
      for (let i = 0; i < selected.length; i++) {
        let tempObj = find(specimenCollectionList, obj => {
          let tempioeRequestId = selected[i];
          return obj.ioeRequestId === tempioeRequestId;
        });
        if (tempObj !== undefined) {
          selectedDataList.push(tempObj);
        }
      }
      this.setState({
        open: true,
        selectedSpecimenCollectionList: selectedDataList
      });
      this.props.closeCommonCircularDialog();
    }
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
        oldSelected: [],
        inputVal: '',
        isSave: true,
        labelTimes: 0,
        printReportNum: num === 1 ? 2 : 1,
        printLabelFail: '',
        printReportFail: '',
        freshIoeRequest: []
      });
    }
    else {
      this.setState({
        // selected: [],
        oldSelected: [],
        inputVal: '',
        isSave: true,
        labelTimes: 0,
        printReportNum: 1,
        printLabelFail: '',
        printReportFail: '',
        freshIoeRequest: []
      });
      this.props.closeCommonCircularDialog();
    }
  }

  insertSpecimenCollectionLog = (desc, apiName = '', content = null) => {
    commonUtils.commonInsertLog(apiName, 'F115', 'Specimen Collections', desc, 'ioe', content);
  };

  handleCancelLog = (name,apiName='') => {
    this.insertSpecimenCollectionLog(name, apiName);
  }

  render() {
    const { classes, loginInfo } = this.props;
    let { service } = loginInfo;
    let { code } = service;
    let {
          specimentCollectionDTSwitch,
          specimentCollectionDT,
          reminderIsChecked,
          lableIsChecked,
          outputFormIsChecked,
          selected,
          open,
          templateList,
          reminderReported,
          selectedSpecimenCollectionList
         } = this.state;
    let dateTimeProps = {
      id:'specimen_collection_dt',
      datetime: specimentCollectionDT,
      disableFlag: !specimentCollectionDTSwitch,
      onChange: this.handleDatetimeChanged,
      format: 'DD-MMM-YYYY HH:mm'
    };
    let printerProps = {
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      onPrinterCheckboxChange:this.onPrinterCheckboxChange,
      handlePrint:this.handlePrint
    };
    let reminderPrintDialogParams={
      open:open,
      lableIsChecked,
      outputFormIsChecked,
      reminderReported:reminderReported,
      templateList:templateList,
      specimentCollectionDTSwitch,
      requestDtos:selectedSpecimenCollectionList,
      patientDto: commonUtils.reportGeneratePatientDto(),
      handleCloseDialog:this.handleCloseReminderPrintDialog,
      handleMultipleReportCallback:this.handleMultipleReportCallback
    };

    let disableSave = selected.length===0;
    let btnBarNot = [{
      title: (!disableSave && (reminderIsChecked || lableIsChecked || outputFormIsChecked))?'Submit & Print':'Submit',
      id: 'btn_ix_request_save_print',
      disabled: (!disableSave && (reminderIsChecked || lableIsChecked || outputFormIsChecked))?false:(disableSave || reminderIsChecked || lableIsChecked || outputFormIsChecked),
      onClick: () => { this.handleSubmit((!disableSave && (reminderIsChecked || lableIsChecked || outputFormIsChecked))?'Submit and Print':'Submit'); }
    }
  ];

    const buttonBar={
      isEdit:false,
      height:'70px',
      position:'fixed',
      render:()=>{
        return(
          <div className={classes.specimenCollctionWrapper}>
            <div className={classes.specimenCollctionDiv}>
              <div style={{paddingLeft: 45, fontWeight: 'bold',color: specimentCollectionDTSwitch ? color.cimsTextColor : 'rgba(0, 0, 0, 0.26)'}}>Specimen Collection Date & Time</div>
              <div>
                <Checkbox id="specimen_collection_dt_checkbox" color="primary" checked={specimentCollectionDTSwitch} onChange={this.handleDTCheckboxChanged} />
                <CustomDateTimePicker {...dateTimeProps} />
              </div>
            </div>
            <div style={{float:'right',marginRight: 10}}>
              <JPrinter {...printerProps} />
            </div>
          </div>
        );
      },
      buttons:btnBarNot,
      handleCancelLog: this.handleCancelLog,
      buttonContainerStyle:{
        width: '233px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        whiteSpace:'pre'
      }
    };
    return (
      <Container buttonBar={buttonBar}>
        <div>
          <Card className={classes.cardWrapper}>
            {/* Top Title */}
            <CardHeader
                classes={{
                  root:classes.cardHeader
                }}
                titleTypographyProps={{
                style: {
                  fontSize: '1.5rem',
                  fontFamily: 'Arial'
                }
              }}
                title={`Specimen Collections (${code})`}
            />
            <CardContent className={classes.cardContent}>
                <Typography
                    className={classes.divFirst}
                    component="div"
                >
                  <ReminderPrintDialog {...reminderPrintDialogParams}></ReminderPrintDialog>
                  <div className={classes.topDiv}>
                      <Grid className={classes.gridContainer}
                          container
                          justify="flex-end"
                      >
                        <Grid item
                            xs={9}
                        >
                          <label className={classes.left_Label}
                              id="tokenTenplateForm_clinic_Lable"
                          >Clinic: {this.state.clinicEngDesc}</label>
                        </Grid>
                        <Grid className={classes.gridFuzzy}
                            item
                            xs={3}
                        >
                          <SpecimenCollectionSearchInput
                              dataList={this.state.searchProcedureRecordList}
                              displayField={['termDesc']}
                              handleSearchBoxLoadMoreRows={this.handleProcedureSearchBoxLoadMoreRows}
                              id={'fuzzySearchBoxId'}
                              inputPlaceHolder={'Search by Request Date /Test / Form Name'}
                              limitValue={4}
                              onChange={this.handleFuzzySearch}
                              value={this.state.inputVal}
                              insertSpecimenCollectionLog={this.insertSpecimenCollectionLog}
                          >
                          </SpecimenCollectionSearchInput>
                        </Grid>
                      </Grid>
                    </div>
                    <div className={classes.tableDiv}>
                      <Typography className={classes.JosTable}
                          component="div"
                      >
                        <JOSTableNoPagination
                            data={this.state.specimenCollectionList}
                            getSelectRow={this.getSelectRow}
                            options={this.state.tableOptions}
                            rows={this.state.tableRows}
                            rowsPerPage={this.state.pageNum}
                            selected={this.state.selected}
                        />
                      </Typography>
                    </div>
                    <Typography
                        className={classes.cimsButtonDiv}
                        component="div"
                    >
                    </Typography>
                </Typography>
            </CardContent>
          </Card>
        </div>

      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginInfo: {
      ...state.login.loginInfo,
      service:{
        code:state.login.service.serviceCd
      }
    },
    encounterData: state.patient.encounterInfo,
    patientPanelInfo: state.patient.patientInfo
  };
};

const mapDispatchToProps = {
  openCommonMessage,
  openCommonCircularDialog,
  getIoeSpecimenCollectionList,
  saveIoeSpecimenCollectionList,
  josPrint,
  getIoeSpecimenCollectionTemplsForReport,
  closeCommonCircularDialog,
  doAllOperation,
  doAllOperationSubmit,
  josPrinterCheck,
  getServiceSpecificFunctionInfo,
  josPrinterStatusCheck,
  updateCurTab
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(SpecimenCollection));
