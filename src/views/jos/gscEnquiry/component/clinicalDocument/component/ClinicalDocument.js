import React, {Component} from 'react';
import {
    AppBar, Card, CardContent, Checkbox,
    Divider, Drawer, FormControlLabel, IconButton,
    List, ListItem, ListItemText, RadioGroup,
    Toolbar, Tooltip, Typography
} from '@material-ui/core';
import {connect} from 'react-redux';
import {withStyles} from '@material-ui/core/styles';
import {styles} from './ClinicalDocumentStyle';
import {CHT_CLINICAL_DOCUMENT_TABS, G6PD_CLINICAL_DOCUMENT_TABS} from '../clinicalDocumentConstant';
import ClientInformation from './common/ClientInformation/ClientInformation';
import ClinicalAssessment from './CHT/ClinicalAssessment/ClinicalAssessment';
import FollowUpAction from './common/FollowUpAction/FollowUpAction';
import InvestigationResult from './CHT/InvestigationResult/InvestigationResult';
import ConfirmedCHT from './CHT/ConfirmedCHT/ConfirmedCHT';
import RecordonG6PDDeficiency from './G6PD/RecordonG6PDDeficiency/RecordonG6PDDeficiency';
import G6PDDeficiency from './G6PD/G6PDDeficiency/G6PDDeficiency';
import LaboratoryInvestigation from './G6PD/LaboratoryInvestigation/LaboratoryInvestigation';
import G6PDBorderline from './G6PD/G6PDBorderline/G6PDBorderline';
import CIMSButton from '../../../../../../components/Buttons/CIMSButton';
import classNames from 'classnames';
import {ChevronLeft, Menu} from '@material-ui/icons';
import * as commonConstants from '../../../../../../constants/common/commonConstants';
import _ from 'lodash';
import * as commonUtils from '../../../../../../utilities/josCommonUtilties';
import { UserUtil } from '../../../../../../utilities';
import {
    getClinicalDoc, getGscReferralLetter,
    saveClinicalDoc, printChtGspdReport
} from '../../../../../../store/actions/gscEnquiry/gscEnquiryAction';
import accessRightEnum from '../../../../../../enums/accessRightEnum';
import { closeCommonMessage, openCommonMessage } from '../../../../../../store/actions/message/messageAction';
import { closeCommonCircularDialog, openCommonCircularDialog, print } from '../../../../../../store/actions/common/commonAction';
import EditTemplateDialog from '../../EditTemplateDialog/EditTemplateDialog';
import ReferralLetter from '../../ReferralLetter/ReferralLetter';

class ClinicalDocument extends Component {
    constructor(props) {
        super(props);
        this.clinicalAssessmentRef = React.createRef();
        this.followUpActionRef = React.createRef();
        this.state={
            iconOpen: true,
            selectedModule: 0,
            roleActionType: '',
            chtRslt: '',
            btnArrVal:'',
            boderlineNum:'',
            referenceNum:'',
            preparedBy:'',
            endorsedBy:'',
            valMap: new Map(),
            dataCommon: {},
            dataList: [],
            asmtItems: [],
            flwupItems: [],
            investigationResult: [],
            neonatalScrn:{},
            patientDto: {},
            showReferralLetter: false,
            referralLetterData: {},
            backData:[],
            deficiencyDrowDownList:[]
        };
    }

    UNSAFE_componentWillMount() {
        const { clinicalDocumentType, neonatalDocId } = this.props;
        let type = clinicalDocumentType == 'CHT' ? 'Action: Open [Suspected Congenital Hypothyroidism Dialog]' : '[G6PD Deficiency / Borderline Dialog]';
        let apiName = `/cgs-consultation/geneticScreening/doc/${neonatalDocId}?docType=${clinicalDocumentType}`;
        commonUtils.commonInsertLog(apiName, accessRightEnum.gscEnquiry, 'GSC Enquiry', type, 'cgs-consultation', null);
        this.handleLoadData();
    }

    componentDidMount() {

    }

    componentWillUnmount(){

    }

    insertGscEnquiryLog = (desc, apiName = '', content = null) => {
        const { clinicalDocumentType } = this.props;
        let type = clinicalDocumentType == 'CHT' ? '[Suspected Congenital Hypothyroidism] ' : '[G6PD Deficiency / Borderline] ';
        commonUtils.commonInsertLog(apiName, accessRightEnum.gscEnquiry, 'GSC Enquiry', type + desc, 'cgs-consultation', content);
    };

    generateTabContent = () => {
       let { backData,deficiencyDrowDownList} =this.state;
        let { clinicalDocumentType = 'CHT', classes, neonatalDocId, patientKey, encounterInfo, changeEditFlag, openCommonMessage } = this.props;
        let {
            selectedModule, roleActionType,
            valMap, dataList, dataCommon, asmtItems, flwupItems,
            investigationResult, patientDto
        } = this.state;
        let commonProps = {
            valMap,
            backData,
            dataList,
            asmtItems,
            flwupItems,
            dataCommon,
            investigationResult,
            clinicalDocumentType,
            neonatalDocId,
            patientKey,
            patientDto,
            encounterInfo,
            roleActionType,
            changeEditFlag,
            deficiencyDrowDownList,
            openCommonMessage,
            updateState: this.updateState,
            insertGscEnquiryLog: this.insertGscEnquiryLog
        };
        if(clinicalDocumentType === 'CHT') {
            return(
                <div  className={classes.moduleWrapper}>
                    <div style={{width:'inherit', height:'inherit',display: CHT_CLINICAL_DOCUMENT_TABS[0].value === selectedModule ? 'block' : 'none'}}>
                        <ClientInformation {...commonProps}/>
                    </div>
                    <div style={{width:'inherit', height:'inherit',display: CHT_CLINICAL_DOCUMENT_TABS[1].value === selectedModule ? 'block' : 'none'}}>
                        <ClinicalAssessment childRef={(ref) => (this.clinicalAssessmentRef = ref)} {...commonProps}/>
                    </div>
                    <div style={{width:'inherit', height:'inherit',display: CHT_CLINICAL_DOCUMENT_TABS[2].value === selectedModule ? 'block' : 'none'}}>
                        <FollowUpAction childRef={(ref) => (this.followUpActionRef = ref)} {...commonProps}/>
                    </div>
                    <div style={{width:'inherit', height:'inherit',display: CHT_CLINICAL_DOCUMENT_TABS[3].value === selectedModule ? 'block' : 'none'}}>
                        <InvestigationResult {...commonProps}/>
                    </div>
                    <div style={{width:'inherit', height:'inherit',display: CHT_CLINICAL_DOCUMENT_TABS[4].value === selectedModule ? 'block' : 'none'}}>
                        <ConfirmedCHT {...commonProps}/>
                    </div>
                </div>
            );
        }else if(clinicalDocumentType === 'G6PD') {
            return(
                <div >
                    <div style={{width:'inherit', height:'inherit',display: G6PD_CLINICAL_DOCUMENT_TABS[0].value === selectedModule ? 'block' : 'none'}}>
                        <ClientInformation {...commonProps}/>
                    </div>
                    <div style={{width:'inherit', height:'inherit',display: G6PD_CLINICAL_DOCUMENT_TABS[1].value === selectedModule ? 'block' : 'none'}}>
                        <RecordonG6PDDeficiency {...commonProps}/>
                    </div>
                    <div style={{width:'inherit', height:'inherit',display: G6PD_CLINICAL_DOCUMENT_TABS[2].value === selectedModule ? 'block' : 'none'}}>
                        <G6PDDeficiency {...commonProps}/>
                    </div>
                    <div style={{width:'inherit', height:'inherit',display: G6PD_CLINICAL_DOCUMENT_TABS[3].value === selectedModule ? 'block' : 'none'}}>
                        <LaboratoryInvestigation {...commonProps}/>
                    </div>
                    <div style={{width:'inherit', height:'inherit',display: G6PD_CLINICAL_DOCUMENT_TABS[4].value === selectedModule ? 'block' : 'none'}}>
                        <FollowUpAction childRef={(ref) => (this.followUpActionRef = ref)} {...commonProps}/>
                    </div>
                    <div style={{width:'inherit', height:'inherit',display: G6PD_CLINICAL_DOCUMENT_TABS[5].value === selectedModule ? 'block' : 'none'}}>
                        <G6PDBorderline {...commonProps}/>
                    </div>
                </div>
            );
        }
    }

    generatePrintZone = () => {
        let { classes, clinicalDocumentType } = this.props;
        let { roleActionType, dataCommon } = this.state;
        let btnGspd = clinicalDocumentType == 'CHT' ? true : false;
        let docStatus = dataCommon.docSts;
        let sheelFlag = false;
        let endorseFlag = false;
        let saveFlag = false;
        let backFlag = false;
        let submitFlag = false;
        let referralFlag =false;
        let printFlag = false;
        if (clinicalDocumentType == 'CHT') {
            if (docStatus == 'CD') {
                referralFlag = true;
                submitFlag = true;
                if (roleActionType != 'D' && roleActionType != 'N') {
                    printFlag = true;
                }
                if (roleActionType != 'D') {
                    backFlag = true;
                    saveFlag = true;
                    endorseFlag = true;
                }
            } else if (docStatus == 'CC') {
                referralFlag = true;
                submitFlag = true;
                endorseFlag = true;
                saveFlag = true;
                if (roleActionType != 'D' && roleActionType != 'N') {
                    printFlag = true;
                }
                if (roleActionType != 'D') {
                    backFlag = true;
                }
            } else if (docStatus == 'PD' || docStatus == 'RC') {
                if (roleActionType == 'N') { //User role = CIMS-NURSE
                    referralFlag = true;
                    endorseFlag = true;
                    backFlag = true;
                } else if (roleActionType == 'D') { //User role = CIMS-DOCTOR
                    submitFlag = true;
                } else if (roleActionType != 'N' && roleActionType != 'D') {  //neither 'CIMS-DOCTOR' nor 'CIMS-NURSE'
                    submitFlag = true;
                    referralFlag = true;
                    backFlag = true;
                    endorseFlag = true;
                    saveFlag = true;
                    printFlag = true;
                }
            }
        }
        else if (clinicalDocumentType == 'G6PD') {
            if (docStatus == 'ED') {
                submitFlag = true;
                if (roleActionType != 'D') {
                    backFlag = true;
                    saveFlag = true;
                    endorseFlag = true;
                }
                if (roleActionType != 'D' && roleActionType != 'N') {
                    endorseFlag = true;
                    saveFlag = true;
                    backFlag = true;
                    submitFlag = true;
                    referralFlag = true;
                    printFlag = true;
                }
            } else if (docStatus == 'CC') {
                submitFlag = true;
                endorseFlag = true;
                saveFlag = true;
                if (roleActionType != 'D') {
                    backFlag = true;
                }
                if (roleActionType != 'D' && roleActionType != 'N') {
                    endorseFlag = true;
                    saveFlag = true;
                    backFlag = true;
                    submitFlag = true;
                    referralFlag = true;
                    printFlag = true;
                }
            } else if (docStatus == 'PD') {
                backFlag = true;
                if (roleActionType != 'N') {
                    submitFlag = true;
                }
                if (roleActionType != 'D') {
                    endorseFlag = true;
                }
                if (roleActionType != 'N' && roleActionType != 'D') {
                    endorseFlag = true;
                    saveFlag = true;
                    backFlag = true;
                    submitFlag = true;
                    referralFlag = true;
                    printFlag = true;
                }
            }
        }
        return (
            <>
                <div className={classes.btnDiv}>
                    <div>
                        <div>
                            {/* <CIMSButton classes={{ root: classes.btnLeftRoot }} disabled={sheelFlag} onClick={() => this.handleBtnAction('coverSheel')}>Referral Cover Sheel</CIMSButton> */}
                            <CIMSButton classes={{ root: classes.btnLeftRoot }} disabled={submitFlag} onClick={() => this.handleBtnAction('submit')}>Submit to Doctor</CIMSButton>
                            <CIMSButton classes={{ root: classes.btnLeftRoot }} style={{ display: btnGspd ? 'block' : 'none', float: 'left' }} disabled={referralFlag} onClick={() => this.handleBtnAction('referralLetter')}>Referral Letter</CIMSButton>
                            <CIMSButton classes={{ root: classes.btnLeftRoot }} disabled={backFlag} onClick={() => this.handleBtnAction('back')}>Back for Update</CIMSButton>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <CIMSButton classes={{ root: classes.btnRightRoot }} disabled={endorseFlag} onClick={() => this.handleBtnAction('endorse')}>Endorse</CIMSButton>
                        <CIMSButton classes={{ root: classes.btnRightRoot }} disabled={saveFlag} onClick={() => this.handleBtnAction('save')} >Save</CIMSButton>
                        <CIMSButton classes={{ root: classes.btnRightRoot }} disabled={printFlag} onClick={this.handlePrint}>Print</CIMSButton>
                        <CIMSButton classes={{ root: classes.btnRightRoot }} onClick={this.handleCancel} >Cancel</CIMSButton>
                        {/* <CIMSButton classes={{root: classes.btnRoot}} onClick={this.handleSave} >Exit</CIMSButton> */}
                    </div>
                </div>
            </>
        );
    }

    validateValMap=()=>{
        let { valMap } = this.state;
        let flag = true;
        let tempDocItemsMap = valMap;
        if (tempDocItemsMap.size > 0) {
            for (let valObj of tempDocItemsMap.values()) {
                if (valObj.itemValErrorFlag) {
                    flag = false;
                    break;
                }
            }
        }
        if (flag) {
            this.setState({ valMap });
        }
        return flag;
    }

    handleBtnAction = (btnType) => {
        let { clinicalDocumentType,changeEditFlag } = this.props;
        let { valMap, dataCommon, chtRslt } = this.state;
        let docItems = [];
        let asmtItems = this.clinicalAssessmentRef ? (this.clinicalAssessmentRef.generateAssessmentObj ? this.clinicalAssessmentRef.generateAssessmentObj() : [] ) : [];
        let flwupItems = this.followUpActionRef ? (this.followUpActionRef.generateFollowObj ? this.followUpActionRef.generateFollowObj() : []) : [];
        let tempDocItemsMap = valMap;
        if (this.validateValMap()) {
            if (tempDocItemsMap.size > 0) {
                for (let item of tempDocItemsMap.values()) {
                    if (item.opType) {
                        let temp = _.cloneDeep(item);
                         if (temp.opType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
                            temp.docItemId = 0;
                        }
                        delete temp.itemValErrorFlag;
                        docItems.push(temp);
                        // Test demo
                        // if (temp.opType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
                        //     temp.docItemId = 0;
                        //     delete temp.itemValErrorFlag;
                        //     docItems.push(temp);
                        // } else if (temp.opType === commonConstants.COMMON_ACTION_TYPE.UPDATE) {
                        //     let itemId = item.formItemId;
                        //     let itemVal = item.itemVal;
                        //     if (backDataMap.size > 0 && backDataMap.has(itemId)) {
                        //         let backItemVal = backDataMap.get(itemId);
                        //         if (itemVal != backItemVal.itemVal) {
                        //             delete temp.itemValErrorFlag;
                        //             docItems.push(temp);
                        //         }
                        //     }
                        // } else if (temp.opType === commonConstants.COMMON_ACTION_TYPE.DELETE) {
                        //     delete temp.itemValErrorFlag;
                        //     docItems.push(temp);
                        // }
                    }
                }
            }
            let params = {
                cgsNeonatalDocDto: {
                    docItems,
                    opType: btnType,
                    docType: clinicalDocumentType,
                    asmtItems,
                    flwupItems,
                    caseCloseDate: dataCommon.caseCloseDate,
                    caseConfirmedDate: dataCommon.caseConfirmedDate,
                    caseNum: dataCommon.caseNum,
                    chtRslt: chtRslt == '' ? dataCommon.chtRslt : chtRslt,
                    chtRsltSpecTxt: dataCommon.chtRsltSpecTxt,
                    chtRsltTxt: dataCommon.chtRsltTxt,
                    createBy: dataCommon.createBy,
                    createDtm: dataCommon.createDtm,
                    dbUpdateDtm: dataCommon.dbUpdateDtm,
                    diagIndt: dataCommon.diagIndt,
                    docId: dataCommon.docId,
                    formId: dataCommon.formId,
                    g6pdRslt: dataCommon.g6pdRslt,
                    patientKey: dataCommon.patientKey,
                    updateBy: dataCommon.updateBy,
                    updateDtm: dataCommon.updateDtm,
                    version: dataCommon.version
                },
                docType:clinicalDocumentType
            };
            if (btnType === 'referralLetter') {
                this.handleClinicalBtn(params);
                return;
            }
            let apiUrl = '/cgs-consultation/geneticScreening/enquiry';
            this.props.openCommonCircularDialog();
            this.props.saveClinicalDoc({
                params: params, callback: (data) => {
                    this.props.closeCommonCircularDialog();
                    if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                        let payload = {
                            msgCode: data.msgCode,
                            btnActions: {
                                btn1Click: () => {
                                    this.handleLoadData();
                                    changeEditFlag && changeEditFlag(false);
                                    let name = commonUtils.commonMessageLog(data.msgCode, 'Refresh Page');
                                    this.insertGscEnquiryLog(name, apiUrl);
                                },
                                btn2Click: () => {
                                    let name = commonUtils.commonMessageLog(data.msgCode, 'Cancel');
                                    this.insertGscEnquiryLog(name, apiUrl);
                                }
                            }
                        };
                        this.props.openCommonMessage(payload);
                    } else {
                        let btnName = '';
                        if (btnType == 'submit') { btnName = 'Submit to Doctor'; }
                        else if (btnType == 'referralLetter') { btnName = 'Referral Letter'; }
                        else if (btnType == 'back') { btnName = 'Back for Update'; }
                        else if (btnType == 'endorse') { btnName = 'Endorse'; }
                        else if (btnType == 'save') { btnName = 'Save'; }
                        this.handleLoadData();
                        changeEditFlag && changeEditFlag(false);
                        let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} '${btnName}' button`;
                        this.insertGscEnquiryLog(name, apiUrl);
                        let payload = {
                            msgCode: data.msgCode,
                            params: [
                                { name: 'docType', value: clinicalDocumentType },
                                { name: 'operation', value: btnType }
                            ],
                            showSnackbar: true
                        };
                        this.props.openCommonMessage(payload);
                    }
                }
            });
        }
    }

    handleCancel = () => {
        let { closeDialog } = this.props;
        this.insertGscEnquiryLog('Action: Click \'Cancel\' button', '');
        closeDialog && closeDialog();
    }

    handleDrawerClose = () => {
        this.setState({ iconOpen: false });
    };

    handleDrawerOpen = () => {
        this.setState({ iconOpen: true });
    };

    handleDrawerClick = name => {
        let { clinicalDocumentType } = this.props;
        let title = clinicalDocumentType == 'CHT' ? CHT_CLINICAL_DOCUMENT_TABS[name].label : G6PD_CLINICAL_DOCUMENT_TABS[name].label;
        let result = `Action: Click '${title}' button`;
        this.setState({
            selectedModule: name
        });
        this.insertGscEnquiryLog(result, '');
    };

    handleCheckBoxChange = (event, value) => {
        let { clinicalDocumentType } = this.props;
        if (clinicalDocumentType == 'G6PD') {
            this.setState({
                dataCommon: {
                    g6pdRslt: event.target.checked ? value : ''
                }
            });
        } else {
            this.setState({
                dataCommon: {
                    chtRslt: event.target.checked ? value : ''
                }
            });
        }
    }

    handleLoadData = () => {
        let { backData } = this.state;
        const { patientKey, loginUser, clinicalDocumentType, neonatalDocId } = this.props;
        let roleActionType = UserUtil.currentUserBaseRole(loginUser);
        let dataCommon = {};
        let valMap = new Map();
        let dataList = [];
        this.props.openCommonCircularDialog();
        this.props.getClinicalDoc({
            params: {
                docType: clinicalDocumentType,
                docId : neonatalDocId
            }, callback: (data) => {
                this.props.closeCommonCircularDialog();
                let { docItems, asmtItems, flwupItems, investigationResult, neonatalScrn, referToItems, patientDto } = data.data;
                dataCommon = {
                    docId: data.data.docId,
                    patientKey: data.data.patientKey,
                    displayPatientKey: data.data.displayPatientKey,
                    formId: data.data.formId,
                    diagIndt: data.data.diagIndt,
                    chtRslt: data.data.chtRslt,
                    g6pdRslt: data.data.g6pdRslt,
                    chtRsltTxt: data.data.chtRsltTxt,
                    docSts: data.data.docSts,
                    caseNum: data.data.caseNum,
                    caseCloseDate: data.data.caseCloseDate,
                    createBy: data.data.createBy,
                    createDtm: data.data.createDtm,
                    updateBy: data.data.updateBy,
                    updateDtm: data.data.updateDtm,
                    dbUpdateDtm: data.data.dbUpdateDtm,
                    chtRsltSpecTxt: data.data.chtRsltSpecTxt,
                    caseConfirmedDate: data.data.caseConfirmedDate,
                    g6pdDeficy: data.data.g6pdDeficy,
                    edc: data.data.edc,
                    version: data.data.version
                };
                docItems.forEach(itemObj => {
                    let valObj = {
                        docItemId: itemObj.docItemId,
                        docId: itemObj.docId,
                        formItemId: itemObj.formItemId,
                        itemVal: itemObj.itemVal,
                        patientKey: itemObj.patientKey == null ? patientKey : itemObj.patientKey,
                        createBy: itemObj.createBy,
                        createDtm: itemObj.createDtm,
                        updateBy: itemObj.updateBy,
                        updateDtm: itemObj.updateDtm,
                        dbUpdateDtm: itemObj.dbUpdateDtm,
                        version: itemObj.version,
                        opType: itemObj.opType,
                        itemValErrorFlag: false
                    };
                    dataList.push(itemObj);
                    valMap.set(itemObj.formItemId, valObj);
                });

                let docTypeFlag = clinicalDocumentType == 'CHT' ? true : false;
                let referenceId = docTypeFlag ? 2038 : 2042;
                let preparedById = docTypeFlag ? 2045 : 2091;
                let endorsedById = docTypeFlag ? 2046 : 2092;
                let btnArrVal = docTypeFlag ? (dataCommon.chtRslt >= 3 ? 3 : dataCommon.chtRslt) : (dataCommon.g6pdRslt >= 3 ? 3 : dataCommon.g6pdRslt);
                let boderlineNum = valMap.size > 0 && valMap.has(2039) ? valMap.get(2039).itemVal : '';
                let referenceNum = valMap.size > 0 && valMap.has(referenceId) ? valMap.get(referenceId).itemVal : '';
                let preparedBy = valMap.size > 0 && valMap.has(preparedById) ? valMap.get(preparedById).itemVal : '';
                let endorsedBy = valMap.size > 0 && valMap.has(endorsedById) ? valMap.get(endorsedById).itemVal : '';

                backData = _.cloneDeep(valMap);
                this.setState({
                    valMap,
                    backData,
                    dataList,
                    asmtItems,
                    flwupItems,
                    dataCommon,
                    roleActionType,
                    investigationResult,
                    neonatalScrn,
                    patientDto,
                    deficiencyDrowDownList:referToItems,
                    btnArrVal,
                    boderlineNum,
                    referenceNum,
                    preparedBy,
                    endorsedBy,
                    chtRslt: ''
                });
            }
        });
    }

    updateState = (obj, fun) => {
        let { changeEditFlag } = this.props;
        if (!fun) {
            this.setState({ ...obj });
        } else {
            this.setState({ ...obj }, fun);
        }
        changeEditFlag && changeEditFlag();
    }

    handlePrint = () => {
        let { clinicalDocumentType, neonatalDocId } = this.props;
        let name = 'Action: Click \'Pring\' button';
        this.insertGscEnquiryLog(name, '/cgs-consultation/geneticScreening/doc/print/');
        this.props.openCommonCircularDialog();
        this.props.printChtGspdReport({
            params: {
                docType: clinicalDocumentType,
                docId: neonatalDocId
            },
            callback: result => {
                this.props.closeCommonCircularDialog();
                let base64Data = result.data.reportData;
                this.handlePringCallback(base64Data);
            }
        });
    }

    handlePringCallback = (baseData) => {
        this.props.openCommonCircularDialog();
        this.props.print({
            base64: baseData,
            callback: (result) => {
                this.props.closeCommonCircularDialog();
                let payload;
                if (result) {
                    payload = {
                        msgCode: '101317',
                        showSnackbar: true,
                        params: [{ name: 'reportType', value: 'report' }]
                    };
                } else {
                    payload = {
                        msgCode: '101318',
                        params: [
                            { name: 'reportTypeTitle', value: 'Report' },
                            { name: 'reportType', value: 'report' }
                        ]
                    };
                }
                this.props.openCommonMessage(payload);
            }
        });
    }

    handleClinicalBtn = (clinicalParams)=>{
        console.log('handleClinicalBtn',clinicalParams);
        if (clinicalParams.cgsNeonatalDocDto.opType === 'referralLetter'){
            this.showReferralLetterDialog(clinicalParams);
        }
    }
    showReferralLetterDialog = (clinicalParams,callBack)=>{
        let {docId='',patientKey=''} = clinicalParams.cgsNeonatalDocDto;
        this.props.openCommonCircularDialog();
        this.props.getGscReferralLetter({
            params: {docId: docId || '',pmi: patientKey},
            callback: (res)=>{
                let resData = res.data;
                let referralLetterData = this.setReferralLetterData({resData,clinicalParams});
                this.setState({
                    showReferralLetter: true,
                    referralLetterData
                });
                if (callBack) {
                    callBack(referralLetterData);
                }else {
                    this.props.closeCommonCircularDialog();
                }
            }
        });
        // this.setState({
        //     showReferralLetter: true,
        //     referralLetterData
        // });
        // this.setReferralLetterData({resData:{hospitalList:[{valEng: 'valEng', codCgsItlId: 'codCgsItlId'}]},clinicalParams});

    }

    onCloseReferralLetter = ()=>{
        this.setState({
            showReferralLetter:false,
            referralLetterData: {}
        });
    }

    setReferralLetterData({resData,clinicalParams}){
        let hospitalList = resData.hospitalList ? resData.hospitalList.map(i=>({label: i.valEng, value: i.codCgsItlId})) : [];
        return {
            resData: {...resData, hospitalList},
            clinicalParams
        };
    }

    render() {
        let { classes, btnArr, clinicalDocumentType = 'CHT' } = this.props;
        let {
            selectedModule, iconOpen, dataCommon, showReferralLetter, referralLetterData,
            neonatalScrn, btnArrVal, boderlineNum, referenceNum, preparedBy, endorsedBy
        } = this.state;
        let moduleNameList = clinicalDocumentType === 'CHT' ? CHT_CLINICAL_DOCUMENT_TABS : G6PD_CLINICAL_DOCUMENT_TABS;
        let referralLetterProps = {
            open: showReferralLetter,
            onCloseReferralLetter: this.onCloseReferralLetter,
            showReferralLetterDialog: this.showReferralLetterDialog,
            referralLetterData,
            insertGscEnquiryLog: this.insertGscEnquiryLog,
            neonatalScrn
        };
        return (
            <div style={{height: 780}}>
                <Card>
                    <CardContent className={classes.cardContent} style={{ paddingBottom: 0 }}>
                        <div style={{ position: 'relative', clear: 'both' }}>
                            <AppBar
                                className={classNames(classes.appBar, {
                                    [classes.appBarShift]: iconOpen
                                })}
                                position="relative"
                            >
                                <Toolbar disableGutters={!iconOpen}>
                                    <IconButton
                                        aria-label="Open drawer"
                                        className={classNames(classes.menuButton, {
                                            [classes.hide]: iconOpen
                                        })}
                                        color="inherit"
                                        onClick={this.handleDrawerOpen}
                                    >
                                        <Menu />
                                    </IconButton>
                                    <Typography variant="h6" color="inherit" noWrap className={classes.title}>
                                        {clinicalDocumentType === 'CHT' ? 'Suspected Congenital Hypothyroidism' : 'G6PD Deficiency / Borderline'}
                                    </Typography>
                                </Toolbar>
                            </AppBar>
                            <Drawer
                                id="divDrawer"
                                classes={{
                                    root: classes.drawerRoot,
                                    paper: classNames(classes.drawerPaperRoot, {
                                        [classes.drawerOpen]: iconOpen,
                                        [classes.drawerClose]: !iconOpen
                                    })
                                }}
                                className={classNames(classes.drawer, {
                                    [classes.drawerOpen]: iconOpen,
                                    [classes.drawerClose]: !iconOpen
                                })}
                                open={iconOpen}
                                variant="permanent"
                            >
                                <div className={classes.toolbar}>
                                    <IconButton onClick={this.handleDrawerClose}>
                                        <ChevronLeft />
                                    </IconButton>
                                </div>
                                <Divider />
                                <List className={classes.listRoot}>
                                    {moduleNameList.map(item => {
                                        return (
                                            <Tooltip
                                                key={item.label}
                                                title={item.label}
                                                classes={{
                                                    tooltip: classes.tooltip
                                                }}
                                            >
                                                <ListItem
                                                    button
                                                    onClick={() => {
                                                        this.handleDrawerClick(item.value);
                                                    }}
                                                    className={classNames({
                                                        [classes.selectedItem]: item.value === selectedModule
                                                    })}
                                                >
                                                    <ListItemText
                                                        primary={<Typography noWrap>{item.label}</Typography>}
                                                    />
                                                </ListItem>
                                            </Tooltip>
                                        );
                                    })}
                                </List>
                            </Drawer>
                            <div
                                style={{height:this.state.contentWrapperHight,boxSizing:'border-box'}}
                                ref={this.contentWrapper}
                                className={classNames(classes.content, {
                                    [classes.contentOpen]: iconOpen
                                })}
                            >
                                <div id="timeWrapper" ref={this.timeWrapper} className={classes.timeWrapper}>
                                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}>
                                        <div className={classes.headerBtn}>
                                            <RadioGroup style={{ flexDirection: 'unset' }}>
                                                {
                                                    btnArr.map((item) => (
                                                        <FormControlLabel
                                                            classes={{
                                                                label: classes.normalFont,
                                                                disabled: classes.disabledLabel
                                                            }}
                                                            disabled
                                                            checked={item.value === btnArrVal}
                                                            value={item.value}
                                                            control={
                                                                <Checkbox color="primary"
                                                                    classes={{ root: classes.checkBoxStyle }}
                                                                />}
                                                            label={item.label}
                                                            onChange={(event) => { this.handleCheckBoxChange(event, item.value); }}
                                                        />
                                                    ))
                                                }
                                            </RadioGroup>
                                        </div>
                                        <div style={{ width: '23%', paddingTop: 9 }}>
                                            {clinicalDocumentType === 'CHT' ? `Confirmed Case No:${dataCommon.caseNum == null ? '' : dataCommon.caseNum}` : `Borderline Num:${boderlineNum}`}
                                        </div>
                                        {clinicalDocumentType === 'CHT' ? (dataCommon.g6pdDeficy > 0 ? <div style={{ width: '22%', paddingTop: 9, color: 'red' }}>G6PD Deficiency</div> : null) : null}
                                        <div style={{ paddingTop: 9 }}>Ref. No.:{referenceNum}</div>
                                    </div>
                                </div>
                                <div style={{ height: this.state.contentHeight }} className={classes.contentWrapper}>
                                    {this.generateTabContent()}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div>
                    <div style={{ display: 'flex', marginTop: 10 }}>
                        <div style={{ marginLeft: 15, width: '50%' }}>
                            <label>Prepared By:&nbsp;</label>
                            <lable title={preparedBy != '' ? preparedBy : ''}>
                                {preparedBy != '' ? preparedBy.length > 70 ? preparedBy.slice(0, 70) + '...' : preparedBy : ''}
                            </lable>
                        </div>
                        <div style={{ marginLeft: 15, width: '50%' }}>
                            <label>Endorsed By:&nbsp;</label>
                            <lable title={endorsedBy != '' ? endorsedBy : ''}>
                                {endorsedBy != '' ? endorsedBy.length > 70 ? endorsedBy.slice(0, 70) + '...' : endorsedBy : ''}
                            </lable>
                        </div>
                    </div>
                    <div style={{height:'23%'}}>
                        {this.generatePrintZone()}
                    </div>
                </div>
                {/*Referral Letter dialog*/}
                <EditTemplateDialog
                    dialogTitle="Referral Letter"
                    open={showReferralLetter}
                    id={Math.random()}
                    classes={{
                        paper: classes.paper,
                        formControl2Css: classes.formControl2Css,
                        formControlCss: classes.formControlCss
                    }}
                    titleStyle={{cursor: 'move'}}
                    handleEscKeyDown={() => this.onCloseReferralLetter()}
                    onExit={()=>{
                        // 重新获取clinicalDocument dialog数据
                        // this.handleLoadData();
                        // changeEditFlag && changeEditFlag(false);
                    }}
                >
                    <ReferralLetter {...referralLetterProps}  />
                </EditTemplateDialog>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    patientInfo: state.patient.patientInfo,
    encounterInfo: state.patient.encounterInfo,
    common: state.common,
    loginUser: state.login.loginInfo.userDto,
    accessRights: state.login.accessRights
});

const mapDispatchToProps = {
    openCommonMessage,
    closeCommonMessage,
    openCommonCircularDialog,
    closeCommonCircularDialog,
    getClinicalDoc,
    saveClinicalDoc,
    getGscReferralLetter,
    printChtGspdReport,
    print
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ClinicalDocument));