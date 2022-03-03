/*
 * Front-end UI for save/update IOE Ix Request
 * Load Ix Request Item Data Action: [ixRequest.js] componentDidMount -> getIxRequestFrameworkList
 * -> [ixRequestAction.js] getIxRequestFrameworkList
 * -> [ixRequestSaga.js] getIxRequestFrameworkList
 * -> Backend API = /ioe/ixRequest/forms
 * Load Ix Request Dropdown Item options Action: [ixRequest.js] componentDidMount -> getIxRequestItemDropdownList
 * -> [ixRequestAction.js] getIxRequestItemDropdownList
 * -> [ixRequestSaga.js] getIxRequestItemDropdownList
 * -> Backend API = /ioe/loadCodeIoeFormItemDrops
 * Load Ix Request Order List Action: [ixRequest.js] componentDidMount -> getIxRequestOrderList
 * -> [ixRequestAction.js] getIxRequestOrderList
 * -> [ixRequestSaga.js] getIxRequestOrderList
 * -> Backend API = /ioe/ixRequest/orders/${patientKey}/${encounterId}
 * Load Ix Request Item Mapping Action: [ixRequest.js] componentDidMount -> getIxRequestSpecificMapping
 * -> [ixRequestAction.js] getIxRequestSpecificMapping
 * -> [ixRequestSaga.js] getIxRequestSpecificMapping
 * -> Backend API = /ioe/ixRequest/specificItemMapping
 * Load Ix Profile Template Action: [ixRequest.js] componentDidMount -> getAllIxProfileTemplate
 * -> [ixRequestAction.js] getAllIxProfileTemplate
 * -> [ixRequestSaga.js] getAllIxProfileTemplate
 * -> Backend API = /ioe/ixRequest/templates
 * Load IOE Form Item(test & specimen) Action: [ixRequest.js] componentDidMount -> getIxAllItemsForSearch
 * -> [ixRequestAction.js] getIxAllItemsForSearch
 * -> [ixRequestSaga.js] getIxAllItemsForSearch
 * -> Backend API = /ioe/loadAllItemsForSearch
 * Save Action: [ixRequest.js] Save -> handleSave
 * -> [ixRequestAction.js] saveIxRequestOrder
 * -> [ixRequestSaga.js] saveIxRequestOrder
 * -> Backend API = /ioe/ixRequest/operation/${operationType}
 * operationType:
 * 1.save:data
 * 2.save and print reminder:dataReminder
 * 3.save print label or output form:dataLabelOrForm
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Typography, Card, CardContent, Grid, Checkbox } from '@material-ui/core';
import { styles } from './ixRequestStyle';
import {getListExpressIoe, getIxRequestItemDropdownList,getIxRequestFrameworkList,getIxRequestSpecificMapping,saveIxRequestOrder,getIxRequestOrderList,getIxAllItemsForSearch,getAllIxProfileTemplate, getCodeIoeFormPanelMapping } from '../../../../store/actions/IOE/ixRequest/ixRequestAction';
import { doAllOperation,doAllOperationSubmit,doAllOperationSave,getServiceSpecificFunctionInfo } from '../../../../store/actions/IOE/ixRequest/ixRequestAction';
import { openCommonCircularDialog,josPrint,closeCommonCircularDialog,josPrinterCheck,josPrinterStatusCheck} from '../../../../store/actions/common/commonAction';
import {getInputProblemList} from '../../../../store/actions/consultation/dxpx/diagnosis/diagnosisAction';
import { openCommonMessage,closeCommonMessage } from '../../../../store/actions/message/messageAction';
import { deleteSubTabs,updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import BasicInfo from './modules/BasicInfo/BasicInfo';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import ContentContainer from './modules/ContentContainer/ContentContainer';
import * as utils from './utils/ixUtils';
import { cloneDeep, concat, isNull } from 'lodash';
import * as constants from '../../../../constants/IOE/ixRequest/ixRequestConstants';
import { COMMON_ACTION_TYPE } from '../../../../constants/common/commonConstants';
import Container from 'components/JContainer';
import {COMMON_CODE} from 'constants/message/common/commonCode';
import accessRightEnum from '../../../../enums/accessRightEnum';
import JPrinter from '../../../../components/JPrinter/JPrinter';
import _ from 'lodash';
import * as commonUtils from '../../../../utilities/josCommonUtilties';
import { SPECIMEN_COLLECTION_CODE } from '../../../../constants/message/IOECode/specimenCollectionCode';
import { IX_REQUEST_CODE } from '../../../../constants/message/IOECode/ixRequestCode';
import { getIoeSpecimenCollectionTemplsForReport} from '../../../../store/actions/IOE/specimenCollection/specimenCollectionAction';
import ReminderPrintDialog from '../specimenCollection/components/ReminderPrintDialog';
import CustomDateTimePicker from '../specimenCollection/components/DateTimePicker/CustomDateTimePicker';
import moment from 'moment';
import Enum from '../../../../../src/enums/enum';
import * as commonConstants from '../../../../constants/common/commonConstants';
import doCloseFuncSrc from '../../../../constants/doCloseFuncSrc';
import { getOfficerDoctorDropdownList } from '../../../../store/actions/IOE/officerInCharge/officerInChargeAction';
import { getState } from '../../../../store/util';
import { getAnServiceId } from '../../../../store/actions/ant/antAction';
const { color } = getState((state) => state.cimsStyle) || {};

class ixRequest extends Component {
  constructor(props){
    super(props);
    this.formRef = React.createRef();
    this.basicInfoRef = React.createRef();
    let { loginInfo,encounterData,loginServiceCd,accessRights,patientInfo } = props;
    this.topTabs = []; // default
    this.codeIoeRequestTypeCd = null;
    this.defaultOrderType = null;
    this.clickButtonType = '';
    this.privilegeInvalidate = {
      doctor: false,
      nurse: false
    };
    if (accessRights.length>0) {
      for (let i = 0; i < accessRights.length; i++) {
        const accessRightObj = accessRights[i];
        if (accessRightObj.name === accessRightEnum.privilegeIxRequestForDoctor) {
          // Discipline, Service and Personal
          this.topTabs = concat(this.topTabs,constants.PRIVILEGES_DOCTOR_TABS);
        } else if (accessRightObj.name === accessRightEnum.privilegeIxRequestForNurse) {
          // Nurse
          this.topTabs = concat(this.topTabs,constants.PRIVILEGES_NURSE_TABS);
        }

        if (accessRightObj.name === accessRightEnum.ioeInvalidateRequestForDocter) {
          this.privilegeInvalidate.doctor = true;
        } else if (accessRightObj.name === accessRightEnum.ioeInvalidateRequestForNurse) {
          this.privilegeInvalidate.nurse = true;
        }
      }
      if (this.topTabs.length === 4 || this.topTabs.length === 3 || this.topTabs.length === 5) {
        // Discipline, Service, Personal and Nurse
        this.codeIoeRequestTypeCd = constants.IOE_REQUEST_TYPE.DOCTOR; // TODO
        this.defaultOrderType = constants.PRIVILEGES_DOCTOR_TABS[1].value;
      } else if (this.topTabs.length === 1) {
        // Nurse
        this.codeIoeRequestTypeCd = constants.IOE_REQUEST_TYPE.NURSE;
        this.defaultOrderType = constants.PRIVILEGES_NURSE_TABS[0].value;
      }
    }

    this.state={
      privilegeFlag: this.topTabs.length>0?true:false,
      contentHeight: undefined,
      containerHeight: undefined,
      ioeContainerHeight: undefined,
      frameworkMap: new Map(),
      lab2FormMap: new Map(),
      ioeFormMap: new Map(),
      categoryMap: new Map(),
      selectionAreaIsEdit: false,
      isEdit: false,
      temporaryStorageMap: new Map(),
      deletedStorageMap: new Map(),
      editDeletedMap: new Map(),
      middlewareObject: {},
      questionEditMode:false,
      questionEditMiddlewareObject: null,
      middlewareMapObj: new Map(),
      orderIsEdit:false,
      selectedOrderKey:null,
      diagnosisErrorFlag: false,
      serviceSpecificFunctionInfo:[],
      basicInfo:{
        infoOrderType: this.defaultOrderType, // category of Info dialog (Discipline,Service,Personal,Nurse)
        orderType: this.defaultOrderType, // category of Top tab (Discipline,Service,Personal,Nurse)
        codeIoeRequestTypeCd: this.codeIoeRequestTypeCd,
        privilegeInvalidate: this.privilegeInvalidate,
        encounterId: encounterData.encounterId,
        patientKey: encounterData.patientKey,
        serviceCd: loginServiceCd,
        createdBy: null,
        createdDtm: null,
        updatedBy: null,
        updatedDtm: null,
        ioeRequestId: 0,
        ioeRequestNumber: null,
        requestDatetime: null,
        version:null,
        invldReason:null,
        isInvld: 0,
        ivgRqstSeqNum: 0, // invalid
        outputFormPrinted: 0, // invalid
        outputFormPrintedBy: null, // invalid
        outputFormPrintedDatetime: null, // invalid
        specimenCollectDatetime: null, // invalid
        specimenCollected: 0, // invalid
        specimenCollectedBy: null, // invalid
        specimenLabelPrinted: 0, // invalid
        specimenLabelPrintedBy: null, // invalid
        specimenLabelPrintedDatetime: null, // invalid
        urgentIsChecked: false,
        requestedBy: loginInfo.loginName,  //requestUser
        requestLoginName : loginInfo.userDto.loginName,  //requestUser
        requestUser: loginInfo.userDto.salutation?`${loginInfo.userDto.salutation} ${loginInfo.userDto.engSurname} ${loginInfo.userDto.engGivName}`:`${loginInfo.userDto.engSurname} ${loginInfo.userDto.engGivName}`, // only display request by
        requestingUnit:encounterData.clinicCd||'',  //clinicCd
        reportTo:encounterData.clinicCd||'',
        clinicRefNo:'',
        infoDiagnosis:'',
        infoRemark:'',
        infoInstruction:'',
        shsExpressIoeChecked:false,
        isShowEditButton:false,
        checkedExpressIoeMap:new Map()
      },
      contentVals: {
        labId: null,
        selectedSubTabId: null,
        infoTargetLabId: null,
        infoTargetFormId: null
      },
      btnSwith:false,
      reminderIsChecked: false,
      lableIsChecked: false,
      outputFormIsChecked: false,
      tabSwitchFlag: false,
      nextStepParamsObj: {},
      topTabSwitchFlag: false,
      topTabParamsObj: {},
      searchFieldLengthObj: {},
      templateList:[],
      open:false,
      labelTimes:0,
      printReportNum:1,
      specimentCollectionDTSwitch: true,
      specimentCollectionDT: new Date(),
      disabledFlag:false,
      removeOrderList:[],
      printForceDisabledFlag: false,
      autoMiddlewareMapObj: null,
      autoAddDefaultAllOrder: null,
      submitIsDisable: false,
      fopServiceTemplateIsActive: false,
 	    genderCd: patientInfo.genderCd,
	    functionLevelFlag:false,
      antGBSIsActive: false,
      antZIKAIsActive: false,
      gbsValue:'',
      zikaValue:'',
      antLFTIsActive: false,
      printCheckedFlagSubmit: false,
      ioeExpressQuickBtnDtoList:[],
      expressIoeMap: new Map(),
      resetexpressIoeMap:new Map(),
      artificialChecked: false,
      defaultNSLFlag:false
    };
  }

  componentWillMount() {
    this.resetHeight();
    window.addEventListener('resize', this.resetHeight);
  }

  componentDidMount(){
    this.props.ensureDidMount();
    const { encounterData,patientInfo } = this.props;
    let { privilegeFlag } = this.state;
    if(!this.checkUserRoleAuthority()){
      return;
    }
    if (privilegeFlag) {
      this.props.openCommonCircularDialog();
      this.props.getIxAllItemsForSearch({});
      this.props.getIxRequestSpecificMapping({});
      this.props.getIxRequestItemDropdownList({});
      this.props.getCodeIoeFormPanelMapping({});
      this.props.getIxRequestFrameworkList({
        params:{},
        callback: data => {
          this.initDefaultFramework(data);
          this.props.getAllIxProfileTemplate({
            params:{},
            callback:getAllIxProfileTemplateData=>{
              if (this.defaultOrderType === constants.PRIVILEGES_NURSE_TABS[0].value||this.defaultOrderType === constants.PRIVILEGES_DOCTOR_TABS[1].value) {
                this.initNotDisciplineFramework(getAllIxProfileTemplateData,this.defaultOrderType);
              }
              this.setState({
                categoryMap:getAllIxProfileTemplateData
              });
            }
          });
          this.props.getIxRequestOrderList({
            params:{
              patientKey: encounterData.patientKey,
              encounterId: encounterData.encounterId
            },
            callback:getIxRequestOrderListData=>{
              this.printButtonDisable(getIxRequestOrderListData);
              this.setState({
                temporaryStorageMap: getIxRequestOrderListData
              });
            }
          });
        }
      });
      let templParams={};
      this.props.getIoeSpecimenCollectionTemplsForReport({
        templParams,
        callback: (data) => {
          this.setState({
            templateList: data
          });
        }
      });
    }
    this.props.updateCurTab(accessRightEnum.ixRequest, this.doClose); //tab关闭提示
    this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} Investigation Order Entry`, '');
  }

  componentWillUnmount(){
    window.removeEventListener('resize',this.resetHeight);
  }

  getServiceSpecificFunctionInfo= () => {
    const { encounterData,patientInfo,lab2FormMap } = this.props;
    let { frameworkMap } = this.state;
    this.props.getServiceSpecificFunctionInfo({
      params:{
        functionName: constants.FUNCTION_NAME
      },
      callback: (data) => {
        let {basicInfo} = this.state;
        let outputFormIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.IX_REQUEST_OUTPUT_FORM_FUNCTION_CODE);
        let reminderIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.IX_REQUEST_REMINDER_FUNCTION_CODE);
        let lableIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.IX_REQUEST_LABEL_FUNCTION_CODE);
        let btnSwith = outputFormIsChecked || reminderIsChecked || lableIsChecked;
        let submitIsDisable = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.IX_REQUEST_DISABLE_SUBMIT_FUNCTION_CODE);
        let fopServiceTemplateIsActive = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.IX_REQUEST_FOP_TEMPLATE_IS_ACTIVE_FUNCTION_CODE);
        let functionLevelFlag= commonUtils.getDefalutValByOrderType(data.data,commonConstants.COMMON_CODE.IX_REQUEST_FOP_TEMPLATE_IS_ACTIVE_FUNCTION_CODE);
        let antServiceIdIsActive = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.ANT_SERVICE_ID_CODE);
        let antGBSIsActive = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.ANT_GBS_CODE);
        let antZIKAIsActive = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.ANT_ZIKA_CODE);
        let antLFTIsActive = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(data.data,commonConstants.COMMON_CODE.ANT_LFT_CODE);
        let specimentCollectionDTSwitch= commonUtils.getDefalutValByCheckBoxCd(data.data,commonConstants.COMMON_CODE.IX_REQUEST_DATE_CHECKBOX_CODE);
        let shsExpressIoeChecked= commonUtils.getDefalutValByOrderType(data.data,commonConstants.COMMON_CODE.SHS_EXPRESS_IOE_CHECKED);// get expressIoe DB setting
        btnSwith = this.printButtonDisable(this.state.temporaryStorageMap);
        let defaultNSLFlag= commonUtils.getDefalutValByOrderType(data.data,commonConstants.COMMON_CODE.DEFAULT_NSL_AS_LANDING_PAGE_OF_IX_REQUEST_CODE);// get request DB setting for nsl
        if(defaultNSLFlag){
  		    let {lab2FormMap}=this.state;
          let defaultFormId = lab2FormMap.get('NSL')[0];
          basicInfo.infoOrderType =  constants.PRIVILEGES_DOCTOR_TABS[0].value;
          basicInfo.orderType = constants.PRIVILEGES_DOCTOR_TABS[0].value;
          let formObj = frameworkMap.has('NSL')?frameworkMap.get('NSL').formMap.get(defaultFormId):null;
          let valObj = utils.initMiddlewareObject(formObj);
          this.setState({
            basicInfo,
            middlewareObject:valObj,
            contentVals:{
              labId:'NSL',
              selectedSubTabId: defaultFormId,
              infoTargetLabId: 'NSL',
              infoTargetFormId: defaultFormId
            }
          });
        }
        if(shsExpressIoeChecked){
          this.props.getListExpressIoe({
            params:{
              encounterTypeId: encounterData.encntrTypeId,
              sex: patientInfo.genderCd ? patientInfo.genderCd : '',
              roleName:commonUtils.getUserRoleType()
            },
            callback: data => {
            this.defaultOrderType = constants.PRIVILEGES_EXPRESS_IOE_TABS[0].value;
            this.setState({
                expressIoeMap: data.expressIoeMap,
                resetexpressIoeMap:cloneDeep(data.expressIoeMap),
                ioeExpressQuickBtnDtoList: data.ioeExpressQuickBtnDtoList,
                contentVals:{
                  labId:null
                }
            });
            }
          });
          this.topTabs = concat(this.topTabs,constants.PRIVILEGES_EXPRESS_IOE_TABS);
          basicInfo.shsExpressIoeChecked = shsExpressIoeChecked;
          basicInfo.isShowEditButton = shsExpressIoeChecked;
          basicInfo.infoOrderType =  constants.PRIVILEGES_EXPRESS_IOE_TABS[0].value;
          basicInfo.orderType =  constants.PRIVILEGES_EXPRESS_IOE_TABS[0].value;
          this.setState({basicInfo});
        }else{
          this.initClinicalSummaryAndDiagnosis();
        }
        if(antServiceIdIsActive || antGBSIsActive || antZIKAIsActive){
          this.props.getAnServiceId({
            params:{
              patientKey: encounterData.patientKey,
              encounterId: encounterData.encounterId
            },
            callback: (data) => {
              let {antServiceId='',hcinstCd='',wrkEdc=''} = data.data || {};
              let message = antServiceId != null && antServiceId !== '' ? `AN ${antServiceId}` : '';
              let gbsValue = hcinstCd != null ? hcinstCd : '';
              let zikaValue = wrkEdc != null && wrkEdc !== '' ? moment(wrkEdc).format(Enum.DATE_FORMAT_FOCUS_DMY_VALUE) : '';
              if(antServiceIdIsActive) {
                let {basicInfo} = this.state;
                basicInfo.clinicRefNo = message;
                this.setState({basicInfo});
              }
              this.setState({
                gbsValue,
                zikaValue
              });
            }
          });
          this.setState({
            outputFormIsChecked,
             serviceSpecificFunctionInfo:data.data,
            reminderIsChecked,
            lableIsChecked,
            btnSwith,
            disabledFlag: btnSwith,
            submitIsDisable,
            fopServiceTemplateIsActive,
            functionLevelFlag,
            antGBSIsActive,
            antLFTIsActive,
            antZIKAIsActive,
            specimentCollectionDTSwitch,
            defaultNSLFlag
          });
        }else{
          this.setState({
            outputFormIsChecked,
            reminderIsChecked,
            lableIsChecked,
            btnSwith,
            disabledFlag: btnSwith,
            submitIsDisable,
            fopServiceTemplateIsActive,
            serviceSpecificFunctionInfo: data.data,
            antGBSIsActive,
            functionLevelFlag,
            antZIKAIsActive,
            antLFTIsActive,
            specimentCollectionDTSwitch,
            defaultNSLFlag
          });
        }
        this.props.closeCommonCircularDialog();
      }
    });
  }


  initClinicalSummaryAndDiagnosis = () => {
    const { encounterData } = this.props;
    let fieldLength = null;
      this.props.getInputProblemList({
        params:{
          patientKey: encounterData.patientKey,
          encounterId: encounterData.encounterId
        },
        callback: data => {
          let infoDiagnosis = '';
		      let {basicInfo} = this.state;
          data.data.forEach(element => {
            let index = element.diagnosisText.lastIndexOf('{');
            let displayText = index !== -1?element.diagnosisText.substring(0,index-1):element.diagnosisText;
            infoDiagnosis=infoDiagnosis===''?displayText:infoDiagnosis+','+displayText;
          });
          const { contentVals, frameworkMap, middlewareMapObj, autoMiddlewareMapObj } = this.state;
          if (!!contentVals.labId && !!contentVals.selectedSubTabId) {
            let otherItemsMap = frameworkMap.get(contentVals.labId).formMap.get(contentVals.selectedSubTabId).otherItemsMap;
            let items = !!otherItemsMap ? otherItemsMap.get(constants.OTHER_ITEM_MAP_KEY) : [];
            items.forEach(item => {
              if (item.ioeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Diagnosis) {
                fieldLength = item.fieldLength;
              }
            });
          } else {
            let middlewareMapData = autoMiddlewareMapObj ? autoMiddlewareMapObj : middlewareMapObj;
            if (middlewareMapData && middlewareMapData.middlewareMap && middlewareMapData.middlewareMap.size > 0) {
              for (let mapObj of middlewareMapData.middlewareMap.values()) {
                let ioeFormId = mapObj.codeIoeFormId;
                let templateOtherItemsMap = null;
                for (let [key, value] of frameworkMap.entries()) {
                   templateOtherItemsMap = frameworkMap.get(key).formMap.has(ioeFormId) ? frameworkMap.get(key).formMap.get(ioeFormId).otherItemsMap : null;
                   if(templateOtherItemsMap) {
                     break;
                   }
                }
                let items = !!templateOtherItemsMap ? templateOtherItemsMap.get(constants.OTHER_ITEM_MAP_KEY) : [];
                items.forEach(tempObj => {
                  if (tempObj.ioeType === constants.OTHER_ITEM_FIELD_IOE_TYPE.Diagnosis) {
                    fieldLength = fieldLength?((tempObj.fieldLength && fieldLength>tempObj.fieldLength)?tempObj.fieldLength:fieldLength):(tempObj.fieldLength?tempObj.fieldLength:fieldLength);
                  }
                });
              }
            }
          }
          basicInfo.infoDiagnosis = fieldLength ? (infoDiagnosis.length > fieldLength ? infoDiagnosis.substring(0, fieldLength - 3) + '...' : infoDiagnosis) : (infoDiagnosis ? infoDiagnosis.substring(0, 47) + '...' : infoDiagnosis);

          this.setState({ basicInfo });
          this.props.closeCommonCircularDialog();
        }
      });
  }

  checkUserRoleAuthority=()=>{
    let {login} = this.props;
    let {basicInfo} = this.state;
    let userRoleType = commonUtils.getUserRoleType();
    let userInCharge = login.clinic.userInCharge;
    // let userRoleType = commonUtils.getUserRoleType;
    if (userRoleType === 'CIMS-NURSE') {
      if(userInCharge==''||userInCharge==null||userInCharge==undefined){
        this.handleClosePage();
        return false;
      }
      let params = {};
      params.roleName='CIMS-DOCTOR';
      params.userSvcCd = login.service.serviceCd;
      params.userSiteId =login.clinic.siteId;
      this.props.getOfficerDoctorDropdownList({
        params,
        callback: (data) => {
          for(let item of data.data){
            // officer-in-charge setting exist "Request By" field should show the returned value (CIMS.CMN_SITE.USER_IN_CHARGE)
            if(item.userId==userInCharge){
              basicInfo.requestUser = commonUtils.getUserFullName(item);
              basicInfo.requestLoginName = item.loginName;
              this.setState({
                basicInfo
              });
              return;
            }
          }
          // officer-in-charge setting not exist popup message / close tab
         this.handleClosePage();
         return false;
        }
      });
    }
    return true;
  }

  resetHeight=_.debounce(()=>{
    if (this.formRef.current && this.formRef.current.clientHeight && this.formRef.current.clientHeight !== this.state.contentHeight || document.documentElement.clientWidth < 1746) {
      let contentHeight = this.formRef.current.clientHeight - this.basicInfoRef.current.clientHeight;
      this.setState({
        contentHeight: document.documentElement.clientWidth < 1746? contentHeight - 30:contentHeight - 10,
        containerHeight: document.documentElement.clientWidth < 1746? contentHeight - 30:contentHeight - 10,
        ioeContainerHeight: window.innerHeight ? (Math.round(window.devicePixelRatio * 100) > 100 ? window.innerHeight - 384 - this.basicInfoRef.current.clientHeight : window.innerHeight - 369 - this.basicInfoRef.current.clientHeight) : undefined
      });
      // this.setState({
      //   contentHeight: contentHeight - 94,
      //   containerHeight: contentHeight - 93
      // });
    }
  },500);

  doClose = (callback, doCloseParams) => {
    let editFlag = this.state.isEdit;
    switch (doCloseParams.src) {
      case doCloseFuncSrc.CLOSE_BY_LOGOUT:
      case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
        if (editFlag) {
          this.props.openCommonMessage({
            msgCode: COMMON_CODE.SAVE_WARING,
            btnActions: {
              btn1Click: () => {
                this.handleCancleSave(callback);
                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'Ix Request');
                this.insertIxRequestLog(name,'/ioe/ixRequest/operation');
              },
              btn2Click: () => {
                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'Ix Request');
                this.insertIxRequestLog(name,'');
                callback(true);
              }, btn3Click: () => {
                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'Ix Request');
                this.insertIxRequestLog(name, '');
              }
            },
            params: [{ name: 'title', value: 'Ix Request' }]
          });
        } else {
          this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close Investigation Order Entry`, '');
          callback(true);
        }
        break;
      case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
        editFlag ? this.handleCancleSave(callback) : callback(true);
        break;
    }
  }

  handleClosePage =()=>{
    this.props.openCommonMessage({
      msgCode: IX_REQUEST_CODE.OFFICER_IN_CHARGE_NOT_SETTING,
      btnActions: {
        btn1Click: () => {
          this.handleCancel();
        }
      }, params: [{ name: 'title', value: 'Ix Request' }]
    });
  }

  initNotDisciplineFramework = (categoryMap,orderType) => {
    let { frameworkMap } = this.state;
    let categoryObj = categoryMap.has(orderType)?categoryMap.get(orderType):null;
    let defaultTemplateId = null;
    let defaultMiddlewareMap = new Map();
    if (!!categoryObj&&categoryObj.templateMap.size>0) {
      let i = 0;
      for (let templateId of categoryObj.templateMap.keys()) {
        defaultTemplateId = templateId;
        if (++i === 1) {
          break;
        }
      }
      let defaultTemplateObj = categoryObj.templateMap.get(defaultTemplateId);
      // template has order list
      if (defaultTemplateObj.storageMap.size>0) {
        for (let [storageKey,storageObj] of defaultTemplateObj.storageMap) {
          // init middlewareObject
          let formObj = frameworkMap.has(storageObj.labId)?frameworkMap.get(storageObj.labId).formMap.get(storageObj.codeIoeFormId):null;
          let middlewareObject = utils.initMiddlewareObject(formObj,storageObj,true,orderType);
          defaultMiddlewareMap.set(storageKey,middlewareObject);
        }
      }
    }

    this.setState({
      middlewareMapObj:{
        templateId:defaultTemplateId,
        templateSelectAll: false,
        middlewareMap:defaultMiddlewareMap
      },
      contentVals:{
        labId:null,
        selectedSubTabId: defaultTemplateId,
        infoTargetLabId: null,
        infoTargetFormId: defaultTemplateId
      }
    },() => this.getServiceSpecificFunctionInfo());
  }

  resetDiscipline = (lab2FormMap) => {
    let defaultTabValue = null;
    let defaultSubTabValue = null;
    if (lab2FormMap.size > 0) {
      let i = 0;
      for (let [labId, formIds] of lab2FormMap) {
        defaultTabValue = labId;
        defaultSubTabValue = formIds[0];
        if (++i === 1) {
          break;
        }
      }
    }
    return {
      labId: defaultTabValue,
      selectedSubTabId: defaultSubTabValue,
      infoTargetLabId: defaultTabValue,
      infoTargetFormId: defaultSubTabValue
    };
  }

  initDefaultFramework = data => {
    let defaultObj = this.resetDiscipline(data.lab2FormMap);
    let formObj = data.frameworkMap.has(defaultObj.labId)?data.frameworkMap.get(defaultObj.labId).formMap.get(defaultObj.selectedSubTabId):null;
    let valObj = utils.initMiddlewareObject(formObj);
    this.setState({
      frameworkMap: data.frameworkMap,
      lab2FormMap: data.lab2FormMap,
      ioeFormMap: data.ioeFormMap,
      middlewareObject: valObj,
      contentVals: {
        ...defaultObj
      }
    });
  }

  generateItemList = (itemList,itemMap,operationType) => {
    if (itemMap && itemMap.size>0) {
      for (let itemValObj of itemMap.values()) {
        if ((isNull(itemValObj.version)&&
          (itemValObj.operationType === COMMON_ACTION_TYPE.UPDATE||itemValObj.operationType === COMMON_ACTION_TYPE.DELETE))||
          (isNull(itemValObj.operationType))) {
          continue;
        } else {
          let tempObj = {
            codeIoeFormId: itemValObj.codeIoeFormId,
            codeIoeFormItemId: itemValObj.codeIoeFormItemId,
            ioeRequestId: itemValObj.ioeRequestId,
            ioeRequestItemId: itemValObj.ioeRequestItemId,
            // itemIoeType: itemValObj.itemIoeType,
            itemVal: itemValObj.itemVal,
            itemVal2: itemValObj.itemVal2,
            operationType: operationType?operationType:itemValObj.operationType,
            createdBy: itemValObj.createdBy,
            createdDtm: itemValObj.createdDtm,
            updatedBy: itemValObj.updatedBy,
            updatedDtm: itemValObj.updatedDtm,
            version: itemValObj.version
          };
          // if (operationType) {
          //   tempObj.operationType = operationType;
          // }
          itemList.push(tempObj);
        }
      }
    }
  }

  generateOrderObj = (valObj,operationType=null) => {
    let tempObj = {
      clinicCd: valObj.clinicCd,
      codeIoeFormId: valObj.codeIoeFormId,
      codeIoeRequestTypeCd: valObj.codeIoeRequestTypeCd,
      createdBy: valObj.createdBy,
      createdDtm: valObj.createdDtm,
      encounterId: valObj.encounterId,
      invldReason: valObj.invldReason,
      ioeRequestId: valObj.ioeRequestId,
      ioeRequestNumber: valObj.ioeRequestNumber,
      isInvld: valObj.isInvld,
      isReportReturned: valObj.isReportReturned,
      ivgRqstSeqNum: valObj.ivgRqstSeqNum,
      outputFormPrinted: valObj.outputFormPrinted,
      outputFormPrintedBy: valObj.outputFormPrintedBy,
      outputFormPrintedDatetime: valObj.outputFormPrintedDatetime,
      patientKey: valObj.patientKey,
      requestDatetime: valObj.requestDatetime,
      requestUser: valObj.requestUser,
      requestLoginName : valObj.requestLoginName,
      serviceCd: valObj.serviceCd,
      specimenCollectDatetime: valObj.specimenCollectDatetime,
      specimenCollected: valObj.specimenCollected,
      specimenCollectedBy: valObj.specimenCollectedBy,
      specimenLabelPrinted: valObj.specimenLabelPrinted,
      specimenLabelPrintedBy: valObj.specimenLabelPrintedBy,
      specimenLabelPrintedDatetime: valObj.specimenLabelPrintedDatetime,
      updatedBy: valObj.updatedBy,
      updatedDtm: valObj.updatedDtm,
      version: valObj.version,
      ioeRequestItems:[],
      ioeRequestScatgryHxDtoItems:valObj.ioeRequestScatgryHxDtoItems
    };
    let { testItemsMap, specimenItemsMap, otherItemsMap, questionItemsMap, panelItems=[] } = valObj;
    this.generateItemList(tempObj.ioeRequestItems,testItemsMap,operationType);
    this.generateItemList(tempObj.ioeRequestItems,specimenItemsMap,operationType);
    this.generateItemList(tempObj.ioeRequestItems,otherItemsMap,operationType);
    this.generateItemList(tempObj.ioeRequestItems,questionItemsMap,operationType);
    utils.transformPanelItem2IoeRequestItem(tempObj.ioeRequestItems,panelItems,operationType);
    if (operationType) {
      tempObj.operationType = operationType;
    } else {
      tempObj.operationType = valObj.operationType;
    }
    return tempObj;
  }

  handleEditDeleteMap = (editDeletedMap,innerSaveIxRequestDtos) => {
    if (editDeletedMap.size>0) {
      for (let [ioeRequestId, valObj] of editDeletedMap) {
        let targetObj = _.find(innerSaveIxRequestDtos,dto=>{
          return dto.ioeRequestId == ioeRequestId;
        });
        if (targetObj) {
          let tempArray = [];
          let { testItemsMap, specimenItemsMap, otherItemsMap, questionItemsMap, panelItems } = valObj;
          this.generateItemList(tempArray,testItemsMap);
          this.generateItemList(tempArray,specimenItemsMap);
          this.generateItemList(tempArray,otherItemsMap);
          this.generateItemList(tempArray,questionItemsMap);
          utils.transformPanelItem2IoeRequestItem(tempArray, panelItems);
          targetObj.ioeRequestItems = _.concat(targetObj.ioeRequestItems,tempArray);
        }
      }
    }
  }

  generateResultObj = saveType => {
    let {
      temporaryStorageMap,
      deletedStorageMap,
      editDeletedMap
    } = this.state;

    let innerSaveIxRequestDtos = [];
    //handle delete
    if (deletedStorageMap.size > 0) {
      for (let valWrapperObj of deletedStorageMap.values()) {
        let tempObj = this.generateOrderObj(valWrapperObj,COMMON_ACTION_TYPE.UPDATE);
        innerSaveIxRequestDtos.push(tempObj);
      }
    }

    //handle temporary
    if (temporaryStorageMap.size > 0) {
      for (let valWrapperObj of temporaryStorageMap.values()) {
        let tempObj = this.generateOrderObj(valWrapperObj);
        // && tempObj.specimenCollected === 0
        if (!!tempObj.operationType && tempObj.isInvld === 0) {
          tempObj.operationType = tempObj.ioeRequestId === 0?COMMON_ACTION_TYPE.INSERT:COMMON_ACTION_TYPE.UPDATE;
          innerSaveIxRequestDtos.push(tempObj);
        }
      }
    }

    this.handleEditDeleteMap(editDeletedMap,innerSaveIxRequestDtos);

    return {
      operationType:saveType,
      innerSaveIxRequestDtos
    };
  }

  handleSave = (saveType,type) => {
    const { encounterData } = this.props;
    let { reminderIsChecked, lableIsChecked, outputFormIsChecked, specimentCollectionDTSwitch, specimentCollectionDT, temporaryStorageMap } = this.state;
    let resultObj = this.generateResultObj(saveType);
    this.props.openCommonCircularDialog();
    this.clickButtonType = type;
    let requestList = this.initOrderList();
    if (resultObj.innerSaveIxRequestDtos.length > 0 && requestList.length > 0) {
      // Test Start
      this.props.doAllOperationSubmit({
        params: {
          ioeReminderTemplateReportDto: {},
          ioeRequestDtos: requestList,
          operationType: 'CV4P',
          patientDto: commonUtils.reportGeneratePatientDto(),
          requester: 'F121'
        },
        callback: (data) => {
          this.props.closeCommonCircularDialog();
          if (data.respCode !== 0 || data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
            let payload = {
              msgCode: data.msgCode,
              btnActions: {
                btn1Click: () => {
                  this.refreshPageData();
                },
                btn2Click: () => {
                  this.props.closeCommonCircularDialog();
                }
              }
            };
            this.props.openCommonMessage(payload);
          } else {
            console.log('aa', 'handleSave-->doAllOperationSubmit->msgCode=0');
            if (type === 'SS') {
              if (!specimentCollectionDTSwitch) {
                let result = resultObj.innerSaveIxRequestDtos;
                let flag = true;
                let { loginInfo } = this.props;
                for (let index = 0; index < result.length; index++) {
                  if (!result[index].specimenCollectDatetime) {
                    flag = false;
                    break;
                  }
                }
                if (!flag) {
                  for (let index = 0; index < result.length; index++) {
                    if (!result[index].specimenCollectDatetime) {
                      result[index].specimenCollectDatetime = new Date();
                      result[index].specimenCollectedBy = loginInfo.loginName;
                      result[index].updatedBy = loginInfo.loginName;
                      result[index].updatedDtm = new Date();
                    }
                  }
                  this.saveMethod(resultObj, encounterData, type, reminderIsChecked, lableIsChecked, outputFormIsChecked);
                } else {
                  for (let index = 0; index < result.length; index++) {
                    result[index].updatedBy = loginInfo.loginName;
                    result[index].updatedDtm = new Date();
                  }
                  this.saveMethod(resultObj, encounterData, type, reminderIsChecked, lableIsChecked, outputFormIsChecked);
                }
              } else {
                if (outputFormIsChecked) {
                  if (this.validateSpecimenCollectionDT(resultObj.innerSaveIxRequestDtos)) {
                    this.saveMethod(resultObj, encounterData, type, reminderIsChecked, lableIsChecked, outputFormIsChecked);
                  }
                } else {
                  this.saveMethod(resultObj, encounterData, type, reminderIsChecked, lableIsChecked, outputFormIsChecked);
                }
              }
            } else {
              this.saveMethod(resultObj, encounterData, type, reminderIsChecked, lableIsChecked, outputFormIsChecked);
            }
          }
        }
      });
      // Test End
    } else if(resultObj.innerSaveIxRequestDtos.length > 0){
      if (type === 'SS') {
        if (!specimentCollectionDTSwitch) {
          let result = resultObj.innerSaveIxRequestDtos;
          let flag = true;
          let { loginInfo } = this.props;
          for (let index = 0; index < result.length; index++) {
            if (!result[index].specimenCollectDatetime) {
              flag = false;
              break;
            }
          }
          if (!flag) {
            for (let index = 0; index < result.length; index++) {
              if (!result[index].specimenCollectDatetime) {
                result[index].specimenCollectDatetime = new Date();
                result[index].specimenCollectedBy = loginInfo.loginName;
                result[index].updatedBy = loginInfo.loginName;
                result[index].updatedDtm = new Date();
              }
            }
            this.saveMethod(resultObj, encounterData, type, reminderIsChecked, lableIsChecked, outputFormIsChecked);
          } else {
            for (let index = 0; index < result.length; index++) {
              result[index].updatedBy = loginInfo.loginName;
              result[index].updatedDtm = new Date();
            }
            this.saveMethod(resultObj, encounterData, type, reminderIsChecked, lableIsChecked, outputFormIsChecked);
          }
        } else {
          if (outputFormIsChecked) {
            if (this.validateSpecimenCollectionDT(resultObj.innerSaveIxRequestDtos)) {
              this.saveMethod(resultObj, encounterData, type, reminderIsChecked, lableIsChecked, outputFormIsChecked);
            }
          } else {
            this.saveMethod(resultObj, encounterData, type, reminderIsChecked, lableIsChecked, outputFormIsChecked);
          }
        }
      } else {
        this.saveMethod(resultObj, encounterData, type, reminderIsChecked, lableIsChecked, outputFormIsChecked);
      }
    } else {
      // check if the data is operable
      // Test Start 1
      this.props.openCommonCircularDialog();
      this.props.doAllOperationSave({
        params: {
          ioeReminderTemplateReportDto: {},
          ioeRequestDtos: requestList,
          operationType: 'CV4P',
          patientDto: commonUtils.reportGeneratePatientDto(),
          requester: 'F121'
        },
        callback: saveData => {
          this.props.closeCommonCircularDialog();
          if (saveData.respCode !== 0 || saveData.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
            let payload = {
              msgCode: saveData.msgCode,
              btnActions: {
                btn1Click: () => {
                  this.refreshPageData();
                },
                btn2Click: () => {
                  this.props.closeCommonCircularDialog();
                }
              }
            };
            this.props.openCommonMessage(payload);
          } else {
            // Test End 1
            let data = requestList;
            if (type === 'S') {
              this.setState({
                diagnosisErrorFlag: false,
                isEdit: false,
                // temporaryStorageMap: data,
                deletedStorageMap: new Map(),
                editDeletedMap: new Map(),
                //print report param
                labelTimes: 0,
                printReportNum: 1,
                printLabelFail: '',
                printReportFail: '',
                freshIoeRequest: [],
                freshIoeFlag: false
              });
              this.props.closeCommonCircularDialog();
              this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, 'ixRequest/orders/');
            } else if (type === 'SS') {
              let orderData = this.freshOrderList(temporaryStorageMap);
              if (orderData.length > 0) {
                this.isNeedFullSpecimenCollection(orderData, type);
                let content = 'Selected records: ';
                for (const value of data.values()) {
                  content += value.ioeRequestId + ';';
                }
                this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save & Submit' button`, 'ixRequest/orders/', content);
              } else {
                this.props.closeCommonCircularDialog();
              }
            } else if (type === 'SP') {
              this.props.openCommonCircularDialog();
              this.setState({
                diagnosisErrorFlag: false,
                isEdit: false,
                deletedStorageMap: new Map(),
                editDeletedMap: new Map()
              });
              if (specimentCollectionDTSwitch) {
                data = this.addSpecimenCollectionTime(data);
              }
              //Log--start---
              let content = 'Selected records: ';
              data.forEach(element => { content += element.ioeRequestId + ','; });
              content += `;\nIs 'Specimen Collection Date & Time' checked:${specimentCollectionDTSwitch ? 'Yes' : 'No'};\n`;
              let dateTime = moment(specimentCollectionDT).format(Enum.DATE_FORMAT_24_HOUR);
              content += `Specimen Collection Date & Time: ${specimentCollectionDTSwitch ? dateTime : 'show null'};\n`;
              content += `Is 'Reminder' checked: ${reminderIsChecked ? 'Yes' : 'No'};\n`;
              content += `Is 'Label' checked: ${lableIsChecked ? 'Yes' : 'No'};\n`;
              content += `Is 'Output Form' checked: ${outputFormIsChecked ? 'Yes' : 'No'};`;
              this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save & Print' button`, '/ioe/ixRequest/operation', content);
              //log--end---
              this.handlePrint(reminderIsChecked, lableIsChecked, outputFormIsChecked, false, this.filterOrderList(data), type);
            }
            else if (type === 'SSP') {
              this.setState({ printCheckedFlagSubmit: true });
              let orderData = this.freshOrderList(temporaryStorageMap);
              if (orderData.length > 0) {
                let content = 'Selected records: ';
                data.forEach(element => { content += element.ioeRequestId + ','; });
                content += `\nIs 'Specimen Collection Date & Time' checked:${specimentCollectionDTSwitch ? 'Yes' : 'No'};\n`;
                let dateTime = moment(specimentCollectionDT).format(Enum.DATE_FORMAT_24_HOUR);
                content += `Specimen Collection Date & Time: ${specimentCollectionDTSwitch ? dateTime : 'show null'};\n`;
                content += `Is 'Reminder' checked: ${reminderIsChecked ? 'Yes' : 'No'};\n`;
                content += `Is 'Label' checked: ${lableIsChecked ? 'Yes' : 'No'};\n`;
                content += `Is 'Output Form' checked: ${outputFormIsChecked ? 'Yes' : 'No'};`;
                this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save, Submit & Print' button`, 'ixRequest/orders/', content);
                // this.isNeedFullSpecimenCollection(this.freshOrderList(data), type);
                this.handlePrint(reminderIsChecked, lableIsChecked, outputFormIsChecked, false, orderData, type);
              }
            }
            this.printButtonDisable(data);
          }
          // Test Start 2
        }
      });
    }
    // Test End 2
  }

  addSpecimenCollectionTime = (data) => {
    if(data){
      let { specimentCollectionDT } = this.state;
      let { loginInfo } = this.props;
      for (let tempObj of data.values()) {
        tempObj.specimenCollectDatetime = specimentCollectionDT;
        tempObj.specimenCollectedBy = loginInfo.loginName;
        tempObj.updatedBy = loginInfo.loginName;
        tempObj.updatedDtm = new Date();
      }
    }
    return data;
  }

  printButtonDisable = (data) => {
    // let flag = true;
    let orders = [...data.values()];
    let index = _.findIndex(orders, orderObj => orderObj.ioeRequestNumber && orderObj.isInvld != 1);
    let flag = index === -1;

    // if (data.size > 0) {
    //   for (let valWrapperObj of data.values()) {
    //     if(valWrapperObj.ioeRequestNumber && valWrapperObj.isInvld != 1){
    //       flag = false;
    //     }
    //   }
    // }
    let stateObj = {
      // reminderIsChecked: flag?false:this.state.reminderIsChecked,
      // lableIsChecked: flag?false:this.state.lableIsChecked,
      printForceDisabledFlag: flag,
      disabledFlag: orders.length === 0||(orders.length > 0&&flag)
    };
    this.setState(stateObj);
    // if(flag) {
    //   this.setState({
    //     reminderIsChecked: false,
    //     lableIsChecked: false
    //   });
    // }
    // this.setState({
    //   disabledFlag: flag
    // });
  }

  isNeedFullSpecimenCollection = (result,type) =>{
    let { specimentCollectionDTSwitch } = this.state;
    this.props.openCommonCircularDialog();
    if(!specimentCollectionDTSwitch){
      let flag = true;
      let { loginInfo } = this.props;
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
        type ==='SS'?this.submit('SU',result): this.submit('SU',result,'saveMode');
      }else{
        for (let index = 0; index < result.length; index++) {
          result[index].updatedBy = loginInfo.loginName;
          result[index].updatedDtm = new Date();
        }
        type ==='SS'?this.submit('SU',result): this.submit('SU',result,'saveMode');
      }
    }else{
      if (this.state.outputFormIsChecked) {
        if(this.validateSpecimenCollectionDT(result)){
          type ==='SS'?this.submit('SU',result): this.submit('SU',result,'saveMode');
        }
      } else {
        type ==='SS'?this.submit('SU',result): this.submit('SU',result,'saveMode');
      }
    }
  }

  saveMethod = (resultObj, encounterData, type, reminderIsChecked, lableIsChecked, outputFormIsChecked) =>{
    let {specimentCollectionDTSwitch}=this.state;
    let  requestList= resultObj.innerSaveIxRequestDtos;
    if (!specimentCollectionDTSwitch) {
        for (let index = 0; index < requestList.length; index++) {
          requestList[index].specimenCollectDatetime = null;
        }
    }
    this.props.openCommonCircularDialog();
    this.props.doAllOperationSave({
      params:{
        ioeReminderTemplateReportDto:{},
        ioeRequestDtos:requestList,
        operationType: 'SA',
        patientDto: commonUtils.reportGeneratePatientDto(),
        requester: 'F121'
      },
      callback:saveData=>{
        if (saveData.respCode !== 0 || saveData.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          let payload = {
            msgCode: saveData.msgCode,
            btnActions: {
              btn1Click: () => {
                this.refreshPageData();
              },
              btn2Click: () => {
                this.props.closeCommonCircularDialog();
              }
            }
          };
          this.props.openCommonMessage(payload);
        } else {
          this.props.getIxRequestOrderList({
            params:{
              patientKey: encounterData.patientKey,
              encounterId: encounterData.encounterId
            },
            callback:data=>{
              let payload = {
                msgCode: saveData.msgCode,
                showSnackbar: true
              };
              this.props.openCommonMessage(payload);
              if(type==='S'){
                this.setState({
                  diagnosisErrorFlag:false,
                  isEdit: false,
                  temporaryStorageMap: data,
                  deletedStorageMap: new Map(),
                  editDeletedMap: new Map(),
                  //print report param
                  labelTimes:0,
                  printReportNum:1,
                  printLabelFail:'',
                  printReportFail:'',
                  freshIoeRequest:[],
                  freshIoeFlag:false
                });
                this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button `, '/ioe/ixRequest/operation', '');
                this.props.closeCommonCircularDialog();
              }else if(type==='SS'){
                if(this.freshOrderList(data).length>0){
                  let content = 'Selected records: ';
                  for (const value of data.values()) {
                    content += value.ioeRequestId + ';';
                  }
                  this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save & Submit' button `, '/ioe/ixRequest/operation', content);
                  this.isNeedFullSpecimenCollection(this.freshOrderList(data),type);
                }else{
                  this.props.closeCommonCircularDialog();
                }
              }else if(type==='SP'){
                let { specimentCollectionDTSwitch,specimentCollectionDT } = this.state;
                this.props.openCommonCircularDialog();
                this.setState({
                  diagnosisErrorFlag: false,
                  isEdit: false,
                  temporaryStorageMap: data,
                  deletedStorageMap: new Map(),
                  editDeletedMap: new Map()
                });
                if(specimentCollectionDTSwitch){
                  data = this.addSpecimenCollectionTime(data);
                }
                let content = 'Selected records: ';
                data.forEach(element => { content += element.ioeRequestId + ','; });
                content += `;\nIs 'Specimen Collection Date & Time' checked:${specimentCollectionDTSwitch ? 'Yes' : 'No'};\n`;
                let dateTime = moment(specimentCollectionDT).format(Enum.DATE_FORMAT_24_HOUR);
                content += `Specimen Collection Date & Time: ${specimentCollectionDTSwitch ? dateTime : 'show null'};\n`;
                content += `Is 'Reminder' checked: ${reminderIsChecked ? 'Yes' : 'No'};\n`;
                content += `Is 'Label' checked: ${lableIsChecked ? 'Yes' : 'No'};\n`;
                content += `Is 'Output Form' checked: ${outputFormIsChecked ? 'Yes' : 'No'};`;
                this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save & Print' button`, '/ioe/ixRequest/operation', content);
                this.handlePrint(reminderIsChecked, lableIsChecked, outputFormIsChecked, false, this.filterOrderList(data), type);
              }
              else if(type==='SSP'){
                this.setState({
                  printCheckedFlagSubmit: true,
                  diagnosisErrorFlag: false,
                  isEdit: false,
                  temporaryStorageMap: data,
                  deletedStorageMap: new Map(),
                  editDeletedMap: new Map()
                });
                if(this.freshOrderList(data).length>0){
                  let { specimentCollectionDTSwitch,specimentCollectionDT } = this.state;
                  let content = 'Selected records: ';
                  data.forEach(element => { content += element.ioeRequestId + ','; });
                  content += `;\nIs 'Specimen Collection Date & Time' checked:${specimentCollectionDTSwitch ? 'Yes' : 'No'};\n`;
                  let dateTime = moment(specimentCollectionDT).format(Enum.DATE_FORMAT_24_HOUR);
                  content += `Specimen Collection Date & Time: ${specimentCollectionDTSwitch ? dateTime : 'show null'};\n`;
                  content += `Is 'Reminder' checked: ${reminderIsChecked ? 'Yes' : 'No'};\n`;
                  content += `Is 'Label' checked: ${lableIsChecked ? 'Yes' : 'No'};\n`;
                  content += `Is 'Output Form' checked: ${outputFormIsChecked ? 'Yes' : 'No'};`;
                  this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save, Submit & Print' button`, '/ioe/ixRequest/operation', content);
                  this.handlePrint(reminderIsChecked, lableIsChecked, outputFormIsChecked, false, this.filterOrderList(data), type);
                  // this.isNeedFullSpecimenCollection(this.freshOrderList(data),type);
                }
              }
              this.printButtonDisable(data);
            }
          });
        }
      }
    });
  }

  updateStateWithoutStatus = (obj, fun) => {
    if(!fun) {
      this.setState({
        selectionAreaIsEdit:true,
        ...obj
      });
    }else {
      this.setState({
        selectionAreaIsEdit:true,
        ...obj
      },fun);
    }
  }

  updateState=(obj)=>{
    this.setState({
      selectionAreaIsEdit:true,
      // isEdit:true,
      ...obj
    });
  }

  reminderUpdateState = (obj) => {
    this.setState({ ...obj });
  }

  onPrinterCheckboxChange = (event,name,printDisabledFlag) => {
    let flag = printDisabledFlag ? false : true;
    this.setState({
      btnSwith: flag,
      artificialChecked: true,
      [name]: event.target.checked
    });
  }

  handlePrintResult = (reminderIsChecked, lableIsChecked, outputFormIsChecked, reminderReported, freshIoeRequest) => {
    //log--start---
    let { specimentCollectionDTSwitch, specimentCollectionDT } = this.state;
    let valObj = freshIoeRequest === undefined ? this.initOrderList() : freshIoeRequest;
    let content = 'Selected records: ';
    valObj.forEach(element => { content += element.ioeRequestId + ','; });
    content += `;\nIs 'Specimen Collection Date & Time' checked:${specimentCollectionDTSwitch ? 'Yes' : 'No'};\n`;
    let dateTime = moment(specimentCollectionDT).format(Enum.DATE_FORMAT_24_HOUR);
    content += `Specimen Collection Date & Time: ${specimentCollectionDTSwitch ? dateTime : 'show null'};\n`;
    content += `Is 'Reminder' checked: ${reminderIsChecked ? 'Yes' : 'No'};\n`;
    content += `Is 'Label' checked: ${lableIsChecked ? 'Yes' : 'No'};\n`;
    content += `Is 'Output Form' checked: ${outputFormIsChecked ? 'Yes' : 'No'};`;
    this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Print' button`, '/ioe/ixRequest/operation', content);
    //log--end---
    this.clickButtonType = 'S';
    // Test check if the data is operable
    this.props.openCommonCircularDialog();
    this.props.doAllOperationSave({
      params: {
        ioeReminderTemplateReportDto: {},
        ioeRequestDtos: valObj,
        operationType: 'CV4P',
        patientDto: commonUtils.reportGeneratePatientDto(),
        requester: 'F121'
      },
      callback: data => {
        this.props.closeCommonCircularDialog();
        if (data.respCode !== 0 || data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
          let payload = {
            msgCode: data.msgCode,
            btnActions: {
              btn1Click: () => {
                this.refreshPageData();
              },
              btn2Click: () => {
                this.props.closeCommonCircularDialog();
              }
            }
          };
          this.props.openCommonMessage(payload);
        } else {
          if (this.orderIsEdit()) {
            let payload = {
              msgCode: IX_REQUEST_CODE.SELECTED_ORDERLIST_NO_IRN_NO,
              btnActions: {
                btn1Click: () => {
                  this.handleSave(constants.IX_REQUEST_SAVE_TYPE.IX_REQUEST_SAVE, 'SP');
                },
                btn2Click: () => {
                  this.props.closeCommonCircularDialog();
                }
              }
            };
            this.props.openCommonMessage(payload);
          } else {
            this.handlePrint(reminderIsChecked, lableIsChecked, outputFormIsChecked, reminderReported, freshIoeRequest, null);
          }
        }
      }
    });
  }

  orderIsEdit = () => {
    let flag = false;
    let { temporaryStorageMap } = this.state;
    for (let obj of temporaryStorageMap.values()) {
      if(obj.operationType) {
        flag = true;
      }
    }
    return flag;
  }

  //for print function
  handlePrint=(reminderIsChecked,lableIsChecked,outputFormIsChecked,reminderReported,freshIoeRequest,btnType)=>{
    let param = {
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      reminderReported,
      freshIoeRequest,
      btnType
    };
    let params={
      callback:this.printStart,
      param
    };
    this.props.josPrinterCheck(params);
  }

  printStart=(data,params) => {
    if(data){
      let selectList = [];
      let { reminderIsChecked,lableIsChecked,outputFormIsChecked,reminderReported,freshIoeRequest,btnType } = params.param;
      let { specimentCollectionDTSwitch } = this.state;
      let { loginInfo } = this.props;
      //if at least one of lab order with IRN No. in the order list?
      selectList = this.initOrderList();
      let IRNFlag = true;
      for (let index = 0; index < selectList.length; index++) {
        const element = selectList[index];
        if(!element.ioeRequestNumber){
          IRNFlag = false;
          break;
        }
      }
      this.props.openCommonCircularDialog();
      if(!IRNFlag){
        let payload = {
          msgCode: IX_REQUEST_CODE.SELECTED_ORDERLIST_NO_IRN_NO,
          btnActions: {
            btn1Click: () => {
              this.handleSave(constants.IX_REQUEST_SAVE_TYPE.IX_REQUEST_SAVE,'SP');
            },
            btn2Click: () => {
              this.props.closeCommonCircularDialog();
            }
          }
        };
        this.props.openCommonMessage(payload);
      }else{
        if(this.judgeOrderListIsSave()){
          if(specimentCollectionDTSwitch){
            if (outputFormIsChecked) {
              if(this.validateSpecimenCollectionDT(selectList)){
                this.printMethod(selectList,reminderIsChecked,lableIsChecked,outputFormIsChecked,reminderReported,freshIoeRequest,btnType);
              }
            }else{
              this.printMethod(selectList,reminderIsChecked,lableIsChecked,outputFormIsChecked,reminderReported,freshIoeRequest,btnType);
            }
          }else{
            let result = selectList;
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
              this.printMethod(selectList,reminderIsChecked,lableIsChecked,outputFormIsChecked,reminderReported,freshIoeRequest,btnType);
            }else{
              for (let index = 0; index < result.length; index++) {
                result[index].updatedBy = loginInfo.loginName;
                result[index].updatedDtm = new Date();
              }
              this.printMethod(selectList,reminderIsChecked,lableIsChecked,outputFormIsChecked,reminderReported,freshIoeRequest,btnType);
            }
          }
        }else{
          let payload = {
            msgCode: IX_REQUEST_CODE.EDIT_NOT_FINISH,
            btnActions: {
              btn1Click: () => {
                this.props.closeCommonCircularDialog();
              }
            }
          };
          this.props.openCommonMessage(payload);
        }
      }
    }
  }

  initOrderList = () => {
    let { temporaryStorageMap } = this.state;
    let requestDtos = [];
    if (temporaryStorageMap && temporaryStorageMap.size > 0) {
      for (let valWrapperObj of temporaryStorageMap.values()) {
          let tempObj = this.generateOrderObj(valWrapperObj);
          requestDtos.push(tempObj);
        }
    }
    return requestDtos;
  }

  filterNoIRNOrder = (selectList) => {
    let removeOrderList = [];
    let arr = [];
    for (let index = 0; index < selectList.length; index++) {
      const element = selectList[index];
      if(!element.ioeRequestNumber){
        removeOrderList.push(element);
      }
      else{
        arr.push(element);
      }
    }
    this.setState({removeOrderList});
    return arr;
  }

  printMethod = (selectList, reminderIsChecked, lableIsChecked, outputFormIsChecked, reminderReported, freshIoeRequest,btnType) => {
    let num = 0;
    freshIoeRequest = freshIoeRequest ? freshIoeRequest : [];
    let requestList = [];
    if (lableIsChecked)
      num++;
    if (outputFormIsChecked)
      num++;
    if (reminderIsChecked)
      num++;
    if (selectList.length < 1) {
      let payload = {
        msgCode: SPECIMEN_COLLECTION_CODE.IS_SELECT_SPECIMEN_COLLECTION
      };
      this.props.openCommonMessage(payload);
    } else {
      selectList = this.filterSelectList(selectList);
      if (num === 1 && lableIsChecked) {
        let labelList = [];
        if (freshIoeRequest.length < 1) {
          requestList = selectList;
          // this.setState({requestList});
          labelList.push(selectList[0]);
        } else {
          requestList = selectList;
          labelList = freshIoeRequest;
        }
        this.submit('PL', labelList);
        this.setState({ requestList, printReportNum: 2 });
      }
      else if (num === 1 && outputFormIsChecked) {
        if (freshIoeRequest.length < 1) {
          requestList = selectList;
        } else {
          requestList = freshIoeRequest;
        }
        this.setState({ requestList: requestList, printReportNum: 2 });
        this.handlePrintOutPutForm(true, selectList, freshIoeRequest, btnType);
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
        this.handlePrintOutPutForm(false, selectList, freshIoeRequest, btnType);
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
          this.handlePrintOutPutForm(true, selectList, [], btnType);
        } else {
          this.handleOpenReminderPrintDialog();
        }
      }
    }
  }

  filterSelectList = (selectList) =>{
    let arr = [];
    for (let a = 0; a < selectList.length; a++) {
      let element = selectList[a];
      if (element.isInvld !== 1 && element.specimenCollected !== 1 && element.isReportReturned!=='Y') {
        arr.push(element);
      }
    }
    return arr;
  }

  validateSpecimenCollectionDT = (selectList) => {
    let validFlag = true;
    let { loginInfo } = this.props;
    let { specimentCollectionDT } = this.state;
    for (let index = 0; index < selectList.length; index++) {
      if (selectList[index].specimenCollectDatetime && (moment(moment(specimentCollectionDT).format(Enum.DATE_FORMAT_EDMY_VALUE)).diff(moment(selectList[index].requestDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE)) < 0)) {
        validFlag = false;
        break;
      }
    }
    if (!validFlag) {
      this.props.closeCommonCircularDialog();
      let payload = {
        msgCode: IX_REQUEST_CODE.SELECTED_ENCOUNTERTIME_TOO_LATER,
        btn1Click: () => {
          this.props.closeCommonMessage();
        }
      };
      this.props.openCommonMessage(payload);
    } else {
      for (let index = 0; index < selectList.length; index++) {
        if (!selectList[index].specimenCollectDatetime || (moment(moment(specimentCollectionDT).format(Enum.DATE_FORMAT_EDMY_VALUE)).diff(moment(selectList[index].requestDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE))) >= 0) {
          selectList[index].specimenCollectDatetime = specimentCollectionDT;
          selectList[index].specimenCollectedBy = loginInfo.loginName;
          selectList[index].updatedBy = loginInfo.loginName;
          selectList[index].updatedDtm = new Date();
        }
      }
    }
    return validFlag;
  }

  judgeOrderListIsSave = () =>{
    let {temporaryStorageMap,deletedStorageMap} = this.state;
    if (temporaryStorageMap.size > 0) {
      for (let valWrapperObj of temporaryStorageMap.values()) {
        if(valWrapperObj.ioeRequestId===0){
          return false;
        }
      }
    }
    if (deletedStorageMap.size > 0) {
       return false;
    }
    return true;
  }

  // freshAndFilterOrderList = (OrderList) =>{
  //   let requestDtos = [];
  //   if (OrderList.size > 0) {
  //     for (let item of OrderList) {
  //       if(item.specimenCollected!==1&&item.isInvld!==1&&item.isReportReturned!=='Y'){
  //         requestDtos.push(item);
  //       }
  //     }
  //   }
  //   return requestDtos;
  // }

  freshOrderList = (OrderList) =>{
    // let {temporaryStorageMap} = this.state;
    let requestDtos = [];
    if (OrderList.size > 0) {
      for (let valWrapperObj of OrderList.values()) {
        if(valWrapperObj.specimenCollected!==1&&valWrapperObj.isInvld!==1&&valWrapperObj.isReportReturned!=='Y'){
          let tempObj = this.generateOrderObj(valWrapperObj);
          requestDtos.push(tempObj);
        }
      }
    }
    return requestDtos;
  }

  filterOrderList = (addedStorageMap) =>{
    let {temporaryStorageMap} = this.state;
    let requestDtos = [];
    if(addedStorageMap){
      for (let valWrapperObj of addedStorageMap.values()) {
        if (valWrapperObj.isInvld != 1 && valWrapperObj.specimenCollected != 1 && valWrapperObj.isReportReturned!=='Y') {
          let tempObj = this.generateOrderObj(valWrapperObj);
          requestDtos.push(tempObj);
        }
      }
    }else{
      if (temporaryStorageMap && temporaryStorageMap.size > 0) {
        for (let valWrapperObj of temporaryStorageMap.values()) {
          if (valWrapperObj.isInvld != 1 && valWrapperObj.specimenCollected != 1 && valWrapperObj.isReportReturned!=='Y') {
              let tempObj = this.generateOrderObj(valWrapperObj);
              requestDtos.push(tempObj);
            }
          }
      }
    }
    return requestDtos;
  }

  submit = (type,DTdata,sspFlag) => {
    // let dataList = this.state.specimenCollectionList;
    // let selected = this.state.selected;
    let requestList = DTdata;
    let { specimentCollectionDTSwitch } = this.state;
    if (!specimentCollectionDTSwitch) {
      for (let index = 0; index < requestList.length; index++) {
        requestList[index].specimenCollectDatetime = null;
      }
    } else {
      for (let index = 0; index < requestList.length; index++) {
        requestList[index].specimenCollectDatetime = this.state.specimentCollectionDT;
      }
    }
    this.props.openCommonCircularDialog();
    let params = {
      ioeReminderTemplateReportDto:{},
      ioeRequestDtos:requestList,
      operationType:type==='SPOF'?'SU':type,
      patientDto: commonUtils.reportGeneratePatientDto(),
      requester: 'F121'
    };
    if(type === 'SU'|| type === 'SPOF'){
      this.props.doAllOperationSubmit({
        params,
        callback: (data) => {
          //fresh data
          if (data.respCode !== undefined && data.respCode !== 0) {
            let payload = {
              msgCode: data.msgCode,
              btnActions: {
                btn1Click: () => {
                  if (data.msgCode === IX_REQUEST_CODE.SELECTED_ENCOUNTERTIME_TOO_LATER || data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                    let { encounterData } = this.props;
                    this.props.getIxRequestOrderList({
                      params: {
                        patientKey: encounterData.patientKey,
                        encounterId: encounterData.encounterId
                      },
                      callback: orderData => {
                        this.setState({
                          diagnosisErrorFlag: false,
                          isEdit: false,
                          temporaryStorageMap: orderData,
                          deletedStorageMap: new Map(),
                          editDeletedMap: new Map(),
                          //print report param
                          labelTimes: 0,
                          printReportNum: 1,
                          printLabelFail: '',
                          printReportFail: '',
                          freshIoeRequest: [],
                          freshIoeFlag: false
                        });
                        this.props.closeCommonCircularDialog();
                      }
                    });
                  }
                },
                btn2Click: () => {
                  this.props.closeCommonCircularDialog();
                }
              }
            };
            this.props.openCommonMessage(payload);
          }
          else {
            if (type === 'SU') {
              let payload = {  msgCode: data.respCode === 0 ? '101302' : '101303' };
              if (data.respCode === 0) {
                payload.showSnackbar = true;
                this.freshSpecimenCollection(sspFlag);
              }
              this.props.openCommonMessage(payload);
            }
            else if (type === 'SPOF') {
              let payload = {
                msgCode: data.respCode === 0 ? '101302' : '101303'
              };
              if (data.respCode === 0) {
                let { reminderIsChecked, lableIsChecked, outputFormIsChecked } = this.state;
                payload.showSnackbar = true;
                this.setState({ freshIoeRequest: data.data, freshIoeFlag: true });
                this.handlePrint(reminderIsChecked, lableIsChecked, outputFormIsChecked, false, data.data);
              }
              this.props.openCommonMessage(payload);
            }
          }
        }
      });
    }else{
       //check printer open status
      this.printerIsOpen(type, params, sspFlag);
    }
  }

  freshSpecimenCollection = (sspFlag) => {
    const { encounterData } = this.props;
    let { temporaryStorageMap,serviceSpecificFunctionInfo } = this.state;
    this.props.getIxRequestOrderList({
      params:{
        patientKey: encounterData.patientKey,
        encounterId: encounterData.encounterId
      },
      callback:data=>{
        this.setState({
          printCheckedFlagSubmit: false,
          diagnosisErrorFlag:false,
          isEdit: false,
          temporaryStorageMap: data,
          deletedStorageMap: new Map(),
          editDeletedMap: new Map(),
          //print report param
          labelTimes:0,
          printReportNum:1,
          printLabelFail:'',
          printReportFail:'',
          freshIoeRequest:[],
          freshIoeFlag:false,
          removeOrderList:[]
        });
        if (sspFlag && sspFlag === 'saveMode') {
          let { reminderIsChecked, lableIsChecked, outputFormIsChecked } = this.state;
          let orderData = this.filterOrderList(data);
          if (orderData.length > 0) {
            this.handlePrint(reminderIsChecked, lableIsChecked, outputFormIsChecked, false, orderData);
          }
        } else if (sspFlag && sspFlag === 'printMode') {
          this.addTempOrder(data, temporaryStorageMap);
        } else {
          let outputFormIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_OUTPUT_FORM_FUNCTION_CODE);
          let reminderIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_REMINDER_FUNCTION_CODE);
          let lableIsChecked = commonUtils.getDefalutValByCodeIoeSpecificFunctionCd(serviceSpecificFunctionInfo, commonConstants.COMMON_CODE.IX_REQUEST_LABEL_FUNCTION_CODE);
          this.setState({
            reminderIsChecked,
            lableIsChecked,
            outputFormIsChecked,
            btnSwith: false,
            artificialChecked:false
          });
        }
        this.printButtonDisable(data);
        this.props.closeCommonCircularDialog();
      }
    });
  }

  addTempOrder = (orderMap,temporaryStorageMap) => {
    for(let [key, value] of temporaryStorageMap.entries()) {
      if(!value.ioeRequestNumber){
        orderMap.set(key,value);
      }
    }
  }

  printMultipleReport = (type,reportDataList,index,btnType) => {
    let { requestList } =this.state;
    if(requestList.length>=index){
      let multipleParams={reportDataList:reportDataList,type:type,index:index,btnType:btnType};
        multipleParams.requestList = requestList;
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
        this.submit('POF', labelList);
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
        if (btnType === 'SSP') {
          this.submit('SU', reportDataList);
        } else {
          this.freshSpecimenCollection('printMode');
        }
      }
    }
  }

  printMultipleReportCallback = (data)=>{
    let multipleParams =this.state.multipleParams;
    let type = multipleParams.type;
    let btnType = multipleParams.btnType;
    let { freshIoeRequest, labelTimes, freshIoeFlag } = this.state;
    let labelList = [];
    let labelArr =[];
    if (data) {
        let requestList = this.state.requestList;
        if(requestList.length>labelTimes||freshIoeRequest.length>labelTimes){
          if(freshIoeRequest.length>0 && freshIoeFlag){
            labelArr.push(freshIoeRequest[labelTimes]);
          }else{
            labelArr.push(requestList[labelTimes]);
          }
          if(type!=='PL'){
            this.submit('POF',labelArr);
          }else{
            this.submit('PL',labelArr);
          }
        }else{
          if(this.state.printReportNum<2){
            labelList.push(freshIoeRequest[0]);
            this.setState({printReportNum:2,labelTimes:0,freshIoeFlag:true});
            this.submit('POF',labelList);
          }
          else{
            let payload = {
              msgCode: '101317',
              showSnackbar: true,
              params:[
                {name:'reportType',value:type==='PL'?'label':'report'}
              ]
            };
            this.props.openCommonMessage(payload);
            if (this.clickButtonType === 'SSP') {
              this.submit('SU', freshIoeRequest);
            } else {
              this.freshSpecimenCollection('printMode');
            }
          }
        }
    }
    else {
      if(type!=='PL'){
        let printReportFail = this.state.printReportFail;
        printReportFail = multipleParams.index===1?'1':printReportFail+','+multipleParams.index;
        this.setState({printReportFail});
        this.printMultipleReport(type,multipleParams.reportDataList,multipleParams.index+1,btnType);
      }
      else{
        let printLabelFail = this.state.printLabelFail;
        printLabelFail = multipleParams.index===1?'1':printLabelFail+','+multipleParams.index;
        this.setState({printLabelFail});
        if(multipleParams.requestList.length>labelTimes||multipleParams.freshIoeRequest.length>labelTimes){
          if(freshIoeRequest.length>0 && freshIoeFlag){
            labelArr.push(freshIoeRequest[labelTimes]);
          }else{
            labelArr.push(multipleParams.requestList[labelTimes]);
          }
          this.submit('PL',labelArr);
        }else{
          if(this.state.printReportNum<2){
            labelList.push(freshIoeRequest[0]);
            this.setState({printReportNum:2,labelTimes:0,freshIoeFlag:true});
            this.submit('POF',labelList);
          }
          else{
            let printReportFail = multipleParams.printReportFail;
            if(printLabelFail===''){
              if(printReportFail===''){
                let payload = {
                  msgCode: '101317',
                  showSnackbar: true,
                  params:[
                    {name:'reportType',value:type==='PL'?'label':'report'}
                  ]
                };
                this.props.openCommonMessage(payload);
              }
            }
            // Test
            if (this.clickButtonType === 'SSP') {
              this.submit('SU', freshIoeRequest);
            } else {
              this.freshSpecimenCollection('printMode');
            }
          }
        }
      }
    }
  }

  getPrintReportAPI = (type,params,btnType) => {
    if(type === 'POF' && this.state.specimentCollectionDTSwitch){
        params.ioeRequestDtos[0].specimenCollectDatetime = this.state.specimentCollectionDT;
    }
    this.props.doAllOperation({
      params,
      callback: (data) => {
        //fresh data
        if (data.respCode !== undefined && data.respCode !== 0) {
          let payload = {
            msgCode: data.msgCode,
            btnActions: {
              btn1Click: () => {
                if (data.msgCode === IX_REQUEST_CODE.SELECTED_ENCOUNTERTIME_TOO_LATER || data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                  this.refreshPageData();
                }
              },
              btn2Click:()=>{
                this.props.closeCommonCircularDialog();
              }
            }
          };
          this.props.openCommonMessage(payload);
        }
        else {
            if(data.respCode === 0){
                let labelTimes = this.state.labelTimes+1;
                let freshIoeRequest = this.state.freshIoeRequest == undefined?[]:this.state.freshIoeRequest;
                data.data.ioeRequestData[0].ioeRequestItems = [];
                freshIoeRequest[this.state.labelTimes] = data.data.ioeRequestData[0];
                this.setState({freshIoeRequest,labelTimes});
                this.printMultipleReport(type,data.data.reportData,1,btnType);
            }
          }
      }
    });
  }

  printerIsOpen = (type, apiParams,btnType) => {
    //print label
    if(type === 'PL') {
      let multipleParams = {
        type,
        apiParams,
        btnType
      };
      let params={
        multipleParams,
        callback:this.printerIsOpenCallback,
        printQueue:'CIMS2_ZebraLabelPrinter',
        action:'isPrintQueueAvailable'
      };
      this.props.josPrinterStatusCheck(params);
    } else {
       this.getPrintReportAPI(type, apiParams,btnType);
    }
  }

  printerIsOpenCallback = (printResult, params) => {
    if(printResult) {
      this.getPrintReportAPI(params.multipleParams.type, params.multipleParams.apiParams,params.multipleParams.btnType);
    } else {
      let payload = {
        msgCode: SPECIMEN_COLLECTION_CODE.LABEL_PRINTER_IS_NOT_AVAILABLE,
        btnActions: {
          btn1Click: () => {
            let { outputFormIsChecked } = this.state;
            if(outputFormIsChecked){
              params.multipleParams.apiParams.operationType = 'POF';
              this.setState({ printReportNum: 2, labelTimes: 0, freshIoeFlag: false }, () => this.getPrintReportAPI('POF', params.multipleParams.apiParams,params.multipleParams.btnType));
            }else {
              this.freshSpecimenCollection('printMode');
            }
            this.props.closeCommonCircularDialog();
          }
        }
      };
      this.props.openCommonMessage(payload);
      // this.freshSpecimenCollection('printMode');
    }
  }

  handlePrintOutPutForm = (type,initData,freshIoeRequest,btnType) => {
      let initArray = [];
      let selectList = this.filterOrderList(initData);
      if(freshIoeRequest.length<1){
        initArray.push(selectList[0]);
      }else{
        initArray.push(freshIoeRequest[0]);
      }
      if(type){
        this.submit('POF', initArray, btnType);
      } else {
        this.submit('PL', initArray, btnType);
      }
  }

  handleOpenReminderPrintDialog=()=>{
    let selectList = this.filterHasIRNOrderList();
    this.setState({
      open:true,
      selectedSpecimenCollectionList:selectList
    });
    this.props.closeCommonCircularDialog();
  }

  filterHasIRNOrderList = () =>{
    let {temporaryStorageMap} = this.state;
    let requestDtos = [];
    if(temporaryStorageMap && temporaryStorageMap.size > 0) {
      for (let valWrapperObj of temporaryStorageMap.values()) {
        if (valWrapperObj.ioeRequestNumber && valWrapperObj.isInvld != 1 && valWrapperObj.specimenCollected != 1 && valWrapperObj.isReportReturned!=='Y') {
            let tempObj = this.generateOrderObj(valWrapperObj);
            requestDtos.push(tempObj);
          }
        }
    }
    return requestDtos;
  }

  handleCloseReminderPrintDialog=()=>{
    this.props.closeCommonCircularDialog();
    this.setState({open:false});
  }

  handleMultipleReportCallback = (reminderReported, dataResult) => {
    let { lableIsChecked, outputFormIsChecked,printCheckedFlagSubmit } = this.state;
    if (reminderReported) {
      let num = 0;
      this.props.openCommonCircularDialog();
      this.setState({ reminderReported: reminderReported });
      this.handlePrint(false, lableIsChecked, outputFormIsChecked, reminderReported, [], null);
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
      if (printCheckedFlagSubmit) { this.submit('SU', dataResult); }
    }
  }

  handleCancleSave = (saveCallback) => {
    const { encounterData } = this.props;
    let resultObj = this.generateResultObj('data');
    this.props.openCommonCircularDialog();
    if(resultObj.innerSaveIxRequestDtos.length>0){
      this.props.doAllOperationSave({
        params:{
          ioeReminderTemplateReportDto:{},
          ioeRequestDtos:resultObj.innerSaveIxRequestDtos,
          operationType: 'SA',
          patientDto: commonUtils.reportGeneratePatientDto(),
          requester: 'F121'
        },
        callback:saveData=>{
          if (saveData.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
            this.props.closeCommonCircularDialog();
            let payload = {
              msgCode: saveData.msgCode,
              btnActions: {
                btn1Click: () => {
                  this.props.openCommonCircularDialog();
                  this.refreshPageData();
                }
              }
            };
            this.props.openCommonMessage(payload);
          } else {
            this.props.getIxRequestOrderList({
              params:{
                patientKey: encounterData.patientKey,
                encounterId: encounterData.encounterId
              },
              callback:data=>{
                let payload = {
                  msgCode: saveData.msgCode,
                  showSnackbar: true
                };
                this.props.openCommonMessage(payload);
                  this.setState({
                    diagnosisErrorFlag:false,
                    isEdit: false,
                    temporaryStorageMap: data,
                    deletedStorageMap: new Map(),
                    editDeletedMap: new Map(),
                    //print report param
                    labelTimes:0,
                    printReportNum:1,
                    printLabelFail:'',
                    printReportFail:'',
                    freshIoeRequest:[],
                    freshIoeFlag:false
                  });
                  this.props.closeCommonCircularDialog();
                  if(typeof saveCallback != 'function' || saveCallback === undefined){
                    this.insertIxRequestLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, 'ixRequest/orders/');
                    return false;
                  }else{
                    saveCallback(true);
                  }
              }
            });
          }
        }
      });
      this.props.closeCommonCircularDialog();
    }else{
      this.props.getIxRequestOrderList({
        params:{
          patientKey: encounterData.patientKey,
          encounterId: encounterData.encounterId
        },
        callback:data=>{
          this.setState({
            diagnosisErrorFlag:false,
            isEdit: false,
            temporaryStorageMap: data,
            deletedStorageMap: new Map(),
            editDeletedMap: new Map(),
            //print report param
            labelTimes:0,
            printReportNum:1,
            printLabelFail:'',
            printReportFail:'',
            freshIoeRequest:[],
            freshIoeFlag:false
          });
          this.props.closeCommonCircularDialog();
        }
      });
    }
  }

  handleCancel=()=>{
    const {mainFrame,dispatch}=this.props;
    const {subTabsActiveKey,tabsActiveKey}=mainFrame;
    if (tabsActiveKey == accessRightEnum.patientSpec){
      dispatch({type:'MAIN_FRAME_DELETE_SUB_TABS',params:subTabsActiveKey});
    }else{
      dispatch({type:'MAIN_FRAME_DELETE_TABS',params:tabsActiveKey});
    }
  }

  handleDatetimeChanged = (momentObj) => {
    this.setState({
      specimentCollectionDT: momentObj!==null?(moment(momentObj).isValid()?moment(momentObj).toDate():null):null
    });
  }

  handleDTCheckboxChanged = (event) => {
    if(event.target.checked){
      this.setState({specimentCollectionDT:new Date()});
    }
    this.setState({specimentCollectionDTSwitch:event.target.checked});
  }

  insertIxRequestLog = (desc, apiName = '', content = '') => {
    commonUtils.commonInsertLog(apiName, 'F121', 'Investigation Order Entry', desc, 'ioe', content);
  };

  handleCancelLog = (name,apiName='') => {
    this.insertIxRequestLog(name, apiName);
  };

  verifyPrintStatusAfterAddOrder = (temp) => {
    let { temporaryStorageMap } = this.state;
    temporaryStorageMap = temp ? temp : temporaryStorageMap;
    let orders = [...temporaryStorageMap.values()];
    let availableOrderIndex = _.findIndex(orders, orderObj => (orderObj.ioeRequestNumber!==null && orderObj.isInvld != 1)||orderObj.ioeRequestNumber === null );
    let savedOrderIndex = _.findIndex(orders, orderObj => orderObj.ioeRequestNumber!==null && orderObj.isInvld != 1);
    this.setState({
      disabledFlag: availableOrderIndex === -1,
      printForceDisabledFlag: savedOrderIndex===-1
    });
  }

  refreshPageData = () => {
    const { encounterData } = this.props;
    this.props.getIxRequestOrderList({
      params:{ patientKey: encounterData.patientKey, encounterId: encounterData.encounterId },
      callback:data => {
        this.setState({
          diagnosisErrorFlag:false,
          isEdit: false,
          temporaryStorageMap: data,
          deletedStorageMap: new Map(),
          editDeletedMap: new Map(),
          labelTimes:0,
          printReportNum:1,
          printLabelFail:'',
          printReportFail:'',
          freshIoeRequest:[],
          freshIoeFlag:false
        });
        this.props.closeCommonCircularDialog();
        return ;
      }
    });
  }

  orderListHasReport = (temporaryStorageMap) => {
    let flag = true;
    if (temporaryStorageMap.size>0) {
      for (let valObj of temporaryStorageMap.values()) {
        if (valObj.isInvld!=1&&valObj.specimenCollected!=1&&valObj.isReportReturned!='Y') {
          flag = false;
          break;
        }
      }
    }
    return flag;
  }

  render() {
    const {
      classes,
      loginClinicCd,
      loginInfo,
      dropdownMap,
      clinicList,
      itemMapping,
      loginServiceCd
    } = this.props;
    let {
      categoryMap,
      ioeFormMap,
      temporaryStorageMap,
      middlewareMapObj,
      middlewareObject,
      orderIsEdit,
      deletedStorageMap,
      editDeletedMap,
      selectedOrderKey,
      basicInfo,
      frameworkMap,
      lab2FormMap,
      contentVals,
      diagnosisErrorFlag,
      isEdit,
      selectionAreaIsEdit,
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      btnSwith,
      questionEditMode,
      questionEditMiddlewareObject,
      tabSwitchFlag,
      nextStepParamsObj,
      topTabSwitchFlag,
      topTabParamsObj,
      searchFieldLengthObj,
      contentHeight,
      reminderReported,
      templateList,
      selectedSpecimenCollectionList,
      open,
      privilegeFlag,
      specimentCollectionDTSwitch,
      specimentCollectionDT,
      disabledFlag,
      printForceDisabledFlag,
      autoMiddlewareMapObj,
      autoAddDefaultAllOrder,
      submitIsDisable,
      fopServiceTemplateIsActive,
	    genderCd,
	    functionLevelFlag,
      serviceSpecificFunctionInfo,
      antGBSIsActive,
      antZIKAIsActive,
      gbsValue,
      zikaValue,
      antLFTIsActive,
      ioeExpressQuickBtnDtoList,
      expressIoeMap,
      resetexpressIoeMap,
      artificialChecked,
      ioeContainerHeight,
      defaultNSLFlag
    } = this.state;
    let basicInfoClinicList = [];
    basicInfoClinicList = clinicList.filter(clinic => {
      return clinic.serviceCd === loginServiceCd;
    });
    let basicInfoProps = {
      privilegeFlag,
      diagnosisErrorFlag,
      basicInfo,
      contentVals,
      clinicList:basicInfoClinicList.length>0?basicInfoClinicList:[],
      loginClinicCd,
      frameworkMap,
      middlewareMapObj,
      searchFieldLengthObj,
      autoMiddlewareMapObj,
      updateState:this.updateState,
      updateStateWithoutStatus:this.updateStateWithoutStatus,
      resetHeight: this.resetHeight
    };
    let contentProps = {
      privilegeFlag,
      contentHeight:diagnosisErrorFlag?contentHeight-15:contentHeight,
      topTabSwitchFlag,
      topTabParamsObj,
      tabSwitchFlag,
      nextStepParamsObj,
      questionEditMode,
      questionEditMiddlewareObject,
      selectionAreaIsEdit,
      ioeFormMap,
      clinicList:basicInfoClinicList.length>0?basicInfoClinicList:[],
      diagnosisErrorFlag,
      basicInfo,
      contentVals,
      loginInfo,
      categoryMap,
      itemMapping,
      frameworkMap,
      lab2FormMap,
      dropdownMap,
      temporaryStorageMap,
      middlewareMapObj,
      middlewareObject,
      deletedStorageMap,
      editDeletedMap,
      orderIsEdit,
      selectedOrderKey,
      topTabs: this.topTabs,
      openCommonMessage:this.props.openCommonMessage,
      closeCommonMessage:this.props.closeCommonMessage,
      searchFieldLengthObj,
      officerInChargeRequestUser:basicInfo.requestUser,
      officerInChargeRequestLoginName:basicInfo.requestLoginName,
      autoMiddlewareMapObj,
      updateState:this.updateState,
      updateStateWithoutStatus:this.updateStateWithoutStatus,
      resetDiscipline:this.resetDiscipline,
      insertIxRequestLog:this.insertIxRequestLog,
      verifyPrintStatusAfterAddOrder: this.verifyPrintStatusAfterAddOrder,
      autoAddDefaultAllOrder,
      fopServiceTemplateIsActive,
      genderCd,
      functionLevelFlag,
      serviceSpecificFunctionInfo,
      antGBSIsActive,
      antZIKAIsActive,
      gbsValue,
      zikaValue,
      antLFTIsActive,
      ioeExpressQuickBtnDtoList,
      expressIoeMap,
      resetexpressIoeMap,
      loginClinicCd,
      artificialChecked,
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      ioeContainerHeight,
      resetHeight: this.resetHeight,
      defaultNSLFlag
	};
    let printerProps = {
      reminderIsChecked,
      lableIsChecked,
      outputFormIsChecked,
      disabledFlag: disabledFlag || utils.isDisableSubimt(temporaryStorageMap),
      // printForceDisabledFlag: !printForceDisabledFlag || this.orderListHasReport(temporaryStorageMap),
      printForceDisabledFlag: this.orderListHasReport(temporaryStorageMap),
      onPrinterCheckboxChange:this.onPrinterCheckboxChange,
      handlePrint:this.handlePrintResult
    };
    let reminderPrintDialogParams={
      open:open,
      lableIsChecked,
      outputFormIsChecked,
      reminderReported,
      templateList,
      requestDtos:selectedSpecimenCollectionList,
      patientDto: commonUtils.reportGeneratePatientDto(),
      handleCloseDialog:this.handleCloseReminderPrintDialog,
      reminderUpdateState: this.reminderUpdateState,
      handleMultipleReportCallback:this.handleMultipleReportCallback
    };
    let dateTimeProps = {
      id:'specimen_collection_dt',
      datetime: specimentCollectionDT,
      disableFlag: !specimentCollectionDTSwitch,
      onChange: this.handleDatetimeChanged,
      format: 'DD-MMM-YYYY HH:mm'
    };

    let disableSave = (temporaryStorageMap.size>0||deletedStorageMap.size>0)?!utils.isDisableSaving(temporaryStorageMap,deletedStorageMap):true;
    let btnBarNotPrint = [{
      title: 'Save',
      id: 'btn_ix_request_save',
      disabled:disableSave,
      onClick:()=>{this.handleSave(constants.IX_REQUEST_SAVE_TYPE.IX_REQUEST_SAVE,'S');}
    },{
      title: 'Save & Submit',
      id: 'btn_ix_request_save_print_form',
      disabled:submitIsDisable || utils.isDisableSubimt(temporaryStorageMap),
      onClick:()=>{this.handleSave(constants.IX_REQUEST_SAVE_TYPE.IX_REQUEST_SAVE,'SS');}
    }];
    let btnBarWithPrint = [{
      title: 'Save & Print',
      id: 'btn_ix_request_save_print',
      disabled:disableSave || this.orderListHasReport(temporaryStorageMap),
      onClick:()=>{this.handleSave(constants.IX_REQUEST_SAVE_TYPE.IX_REQUEST_SAVE,'SP');}
    },{
      title: 'Save, Submit & Print',
      id: 'btn_ix_request_save_submit_print',
      disabled: submitIsDisable || utils.isDisableSubimt(temporaryStorageMap) || this.orderListHasReport(temporaryStorageMap),
      onClick:()=>{this.handleSave(constants.IX_REQUEST_SAVE_TYPE.IX_REQUEST_SAVE,'SSP');}
    }];
    const buttonBar = {
      isEdit,
      logSaveApi:'ixRequest/orders/',
      saveFuntion:this.handleCancleSave,
      handleCancelLog: this.handleCancelLog,
      position: 'fixed',
      height:'50px',
      style:{
        justifyContent:'space-between',
        display: 'flex',
        height: 62,
        minWidth: 1746,
        position: 'relative'
      },
      render:()=>{
        console.log('innerSaveIxRequestDtos==',this.generateResultObj('SP'));
        return(
          <div style={{flexGrow: 2,display:'flex',justifyContent:'space-between',alignItems:'center',minWidth: 870}}>
            <div style={{float:'left'}}>
              <p className={classes.remark}><span className={classes.iteoSign}>@</span>: The test must be ordered independently.</p>
              <p className={classes.remark}><span className={classes.itefSign}>#</span>: The test must be ordered with other test(s) not labeled with #.</p>
            </div>
            <div className={classes.specimenCollctionWrapper}>
              <div className={classes.specimenCollctionDiv}>
                <div style={{ paddingLeft: 45, fontWeight: 'bold', color: specimentCollectionDTSwitch ? color.cimsTextColor : 'rgba(0, 0, 0, 0.26)' }}>Specimen Collection Date & Time</div>
                <div>
                  <Checkbox id="specimen_collection_dt_checkbox" color="primary" checked={specimentCollectionDTSwitch} onChange={this.handleDTCheckboxChanged} />
                  <CustomDateTimePicker {...dateTimeProps} />
                </div>
              </div>
              <div style={{float:'right',marginRight: 10}}>
                <JPrinter {...printerProps} />
              </div>
            </div>
          </div>
        );
      },
      buttons:btnSwith? (disabledFlag ? btnBarNotPrint : btnBarWithPrint):btnBarNotPrint,
      buttonContainerStyle:{
        width: '418px',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }
    };
    return (
      <Container buttonBar={buttonBar}>
        <Typography component="div" id="wrapper" className={classes.wrapper} ref={this.formRef}>
          <Card className={classes.cardWrapper} style={{height: document.documentElement.clientWidth < 1746?'98%':'100%'}} >
            <CardContent style={{height:'calc(100% - 10px)'}} className={classes.cardContent}>
              <ValidatorForm style={{height: '100%'}} id="ixForm" onSubmit={()=>{}}>
                <ReminderPrintDialog {...reminderPrintDialogParams}></ReminderPrintDialog>
                <Grid container>
                  <Grid ref={this.basicInfoRef} item xs={12}>
                    <BasicInfo {...basicInfoProps}/>
                  </Grid>
                  <Grid style={{height:diagnosisErrorFlag?this.state.containerHeight-15:this.state.containerHeight}} item xs={12}>
                    <ContentContainer {...contentProps}/>
                  </Grid>
                </Grid>
              </ValidatorForm>
            </CardContent>
          </Card>
        </Typography>
      </Container>
    );
  }
}

const mapStateToProps = state => {
  return {
    encounterData: state.patient.encounterInfo,
    loginInfo: state.login.loginInfo,
    accessRights: state.login.accessRights,
    loginServiceCd: state.login.service.serviceCd,
    loginClinicCd: state.login.clinic.clinicCd,
    // clinicList: state.ixRequest.clinicList,
    clinicList: state.common.clinicList,
    frameworkMap: state.ixRequest.frameworkMap,
    lab2FormMap: state.ixRequest.lab2FormMap,
    dropdownMap: state.ixRequest.dropdownMap,
    itemMapping: state.ixRequest.itemMapping,
    categoryMap: state.ixRequest.categoryMap,
    expressIoeMap:state.ixRequest.expressIoeMap,
    ioeExpressQuickBtnDtoList:state.ixRequest.ioeExpressQuickBtnDtoList,
    // common: state.common,
    encounter: state.patient.encounterInfo,
    mainFrame:state.mainFrame,
    codeIoeFormPanelMapping: state.ixRequest.codeIoeFormPanelMapping,
    patientInfo: state.patient.patientInfo
  };
};

const mapDispatchToProps = {
  getIxRequestSpecificMapping,
  getIxRequestFrameworkList,
  getIxRequestItemDropdownList,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  openCommonMessage,
  closeCommonMessage,
  deleteSubTabs,
  saveIxRequestOrder,
  getIxRequestOrderList,
  getIxAllItemsForSearch,
  getAllIxProfileTemplate,
  updateCurTab,
  getInputProblemList,
  doAllOperation,
  doAllOperationSubmit,
  getIoeSpecimenCollectionTemplsForReport,
  josPrint,
  josPrinterCheck,
  doAllOperationSave,
  getServiceSpecificFunctionInfo,
  getOfficerDoctorDropdownList,
  getCodeIoeFormPanelMapping,
  josPrinterStatusCheck,
  getAnServiceId,
  getListExpressIoe
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ixRequest));
