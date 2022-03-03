import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Typography, Grid } from '@material-ui/core';
import accessRightEnum from '../../../enums/accessRightEnum';
import { styles } from './gscEnquiryStyle';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import * as commonConstants from '../../../constants/common/commonConstants';
import { COMMON_CODE } from '../../../constants/message/common/commonCode';
import { openCommonMessage,closeCommonMessage } from '../../../store/actions/message/messageAction';
import { openCommonCircularDialog, closeCommonCircularDialog, print } from '../../../store/actions/common/commonAction';
import * as commonUtils from '../../../utilities/josCommonUtilties';
import ReportDialog from './component/ReportDialog/ReportDialog';
import _ from 'lodash';
import moment from 'moment';
import Filter from './component/Filter/Filter';
import Enum from '../../../../src/enums/enum';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import {
    getGscEnquiry, getGscEnquiryReport, saveGscEnquiry,
    saveGscEnquiryReport, getGscEnquirySelect, getHospitalList
} from '../../../store/actions/gscEnquiry/gscEnquiryAction';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import { updateCurTab, addTabs } from '../../../store/actions/mainFrame/mainFrameAction';
import ClinicalDocumentDialog from './component/clinicalDocument/ClinicalDocumentDialog';
import GscEnquiryTable from './component/gscEnquiryTable/gscEnquiryTable';

class GscEnquiry extends Component {
    constructor(props) {
        super(props);
        this.filterRef = React.createRef();
        this.gscEnquiryTable = React.createRef();
        this.state = {
            isEdit: false,
            valMap: [],
            totalCases: 0,
            tableList: [],
            tableHeight: 0,
            reviewedByEditFlag: false,
            contactCheckedFlag: false,
            labNum: '',
            dropList: {
                diagnosisDrop: [
                    { title: 'All', value: 'All' },
                    { title: 'CHT', value: 'CHT' },
                    { title: 'G6PD', value: 'G6PD' }
                ],
                resultDrop : [
                    { title: 'All', value: 'All' },
                    { title: 'Screened Positive', value: 'A' },
                    { title: 'Screened Negative', value: 'N' }
                ],
                // resultDrop: [
                //     { title: 'All', value: 'All' },
                //     { title: 'Screened Positive/Deficient', value: 'A' },
                //     { title: 'Screened Positive/Deficient/Borderline', value: 'AB' },
                //     { title: 'Borderline', value: 'B' },
                //     { title: 'Screened Negative/Not Deficient', value: 'N' }
                // ],
                screeningDrop: [
                    { title: 'All', value: 'All' },
                    { title: 'Completed', value: 'C' },
                    { title: 'Pending', value: 'P' }
                ],
                docStatusDrop: [
                    { title: 'All', value: 'All' },
                    { title: 'Confirming Diagnosis', value: 'CD' },
                    { title: 'Confirmed Case', value: 'CC' },
                    { title: 'Endorsing Document', value: 'ED' },
                    { title: 'Pending Document', value: 'PD' },
                    { title: 'Referral Case', value: 'RC' }
                ],
                plaseOfBirthDrop: [
                    { title: 'All', value: 'All' },
                    { title: 'S', value: 'S' },
                    { title: 'T', value: 'T' }
                ],
                reviewedByDoctorDrop: [
                    { title: 'All', value: 'All' },
                    { title: 'Screened Positive', value: 'A' },
                    { title: 'Screened Negative', value: 'N' },
                    { title: 'Nil', value: 'Nil' }
                ]
            },
            tabCHTDrop: [
                { title: 'Nil', value: 'Nil' },
                { title: 'Screened Positive', value: 'A' },
                { title: 'Screened Negative', value: 'N' }
            ],
            tabG6PDDrop: [
                { title: 'Nil', value: 'Nil' },
                { title: 'Deficient', value: 'A' },
                { title: 'Borderline', value: 'B' },
                { title: 'Not Deficient', value: 'N' }
            ],
            selectedRowId: null,
            clinicalDocumentType: null,
            neonatalDocId: null,
            clinicalDocmentRslt: null,
            clinicalDocumentChtSts:null,
            clinicalDocmentg6pdSts:null,
            reportDocId: null,
            isReportShow: false,
            isDocShow: false,
            version: null,
            searchParams: {}
        };
    }

    UNSAFE_componentWillMount() {
        this.insertGscEnquiryLog('Action: Open GSC Enquiry', '');
        let params = {};
        let today = moment();
        let sixDayAgo = today.subtract(6, 'days');
        params.rptRcvDatetimeStart =  sixDayAgo.format('YYYY-MM-DD');
        params.rptRcvDatetimeEnd =  moment().format('YYYY-MM-DD');
        params.babyDobStart = '';
        params.babyDobEnd = '';
        params.diagnosis = 'CHT';
        params.result = 'A';
        params.screening = 'P';
        params.docSts = '';
        params.birthplaceCod = '';
        params.rslt = '';
        this.handleLoadData(params);
        console.log(params);
    }

    componentDidMount() {
        this.props.updateCurTab(accessRightEnum.gscEnquiry,this.doClose);
        this.resetHeight();
        window.addEventListener('resize',this.resetHeight);
        this.setBirthOfPlact();
    }

    componentWillUnmount(){
        window.removeEventListener('resize',this.resetHeight);
    }

    setBirthOfPlact = () => {
        this.props.openCommonCircularDialog();
        this.props.getHospitalList({
            callback: (data) => {
                let dropList = _.cloneDeep(this.state.dropList);
                let birthOfPlaceList = [
                    { title: 'All', value: 'All' },
                    { title: 'S', value: 'S' },
                    { title: 'T', value: 'T' }
                ];
                data.data?.map(item => {
                    birthOfPlaceList.push({ title: item.cod, value: item.cod });
                });
                dropList.plaseOfBirthDrop = birthOfPlaceList;
                this.props.closeCommonCircularDialog();
                this.setState({ dropList });
            }
        });
    }

    resetHeight = _.debounce(() => {
        let screenHeight = document.body.clientHeight;
        if (screenHeight > 0) {
            let tableHeight = screenHeight - 145 - (this.filterRef?.clientHeight || 0);
            this.setState({tableHeight});
        }
    }, 300);

    doClose = (callback, doCloseParams) => {
        const { isEdit } = this.state;
        switch (doCloseParams.src) {
            case doCloseFuncSrc.CLOSE_BY_LOGOUT:
            case doCloseFuncSrc.CLOSE_BY_MAIN_TAB_CLOSE_BUTTON:
                if (isEdit) {
                    this.props.openCommonMessage({
                        msgCode: COMMON_CODE.SAVE_WARING,
                        params: [{ name: 'title', value: 'GSC Enquiry' }],
                        btn1AutoClose: true,
                        btnActions: {
                            btn1Click: () => {
                                this.handleSave(callback, '1');
                            },
                            btn2Click: () => {
                                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Discard', '', 'title', 'GSC Enquiry');
                                this.insertGscEnquiryLog(name, '');
                                callback(true);
                            },
                            btn3Click: () => {
                                let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Cancel', '', 'title', 'GSC Enquiry');
                                this.insertGscEnquiryLog(name, '');
                            }
                        }
                    });
                } else {
                    this.insertGscEnquiryLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to close GSC Enquiry`, '');
                    callback(true);
                }
                break;
            case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
                isEdit ? this.handleSave(callback, null) : callback(true);
                this.insertGscEnquiryLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'next_patient' button in GSC Enquiry`, '');
                break;
        }
    }

    handleLoadData = (params = null) => {
        this.props.openCommonCircularDialog();
        this.props.getGscEnquiry({
            params: { params }, callback: (data) => {
                this.props.closeCommonCircularDialog();
                let { screeningEnquiryDtoList, count } = data.data; console.log(params);
                let tableListInfo = [];
                let valMap = new Map();
                let contactCheckedFlag = screeningEnquiryDtoList.length > 0 && screeningEnquiryDtoList.every(obj => !!obj.isFailCntct);
                screeningEnquiryDtoList.forEach(itemObj => {
                    let valObj = {
                        clcCgsNeonatalScrnId: itemObj.clcCgsNeonatalScrnId,
                        ioeReportId: itemObj.ioeReportId > 0 ? itemObj.ioeReportId : 0,//0.1/icon
                        babyName: itemObj.babyName,
                        codSexIDBaby:itemObj.codSexIDBaby,// Test
                        babySex: itemObj.babySex,
                        babyDob: itemObj.babyDob,
                        dateCollected: itemObj.dateCollected,
                        diagnosis: itemObj.diagnosis,
                        rslt: itemObj.diagnosis !== 'G6PD' ? itemObj.chtRslt : itemObj.g6pdRslt,
                        chtRslt: itemObj.chtRslt,
                        g6pdRslt: itemObj.g6pdRslt,
                        chtSts: itemObj.chtSts,
                        g6pdSts:itemObj.g6pdSts,//Test
                        labNum: itemObj.labNum,
                        birthplaceCod: itemObj.birthplaceCod,
                        birthplaceType:itemObj.birthplaceType,//Test
                        patientKey: itemObj.patientKey,
                        displayPatientKey: itemObj.displayPatientKey,
                        refNum: itemObj.refNum,
                        docSts: itemObj.docSts,
                        clcNeonatalDocId: itemObj.clcNeonatalDocId > 0 ? itemObj.clcNeonatalDocId : 0,//0.1/icon
                        cmnInDocIdOthr: itemObj.cmnInDocIdOthr,
                        chkChtRslt: itemObj.chkChtRslt,
                        chkChtRsltEditable: itemObj.chkChtRsltEditable == 'TRUE' ? true : false,//drop
                        chkG6pdRslt: itemObj.chkG6pdRslt,
                        chkG6pdRsltEditable: itemObj.chkG6pdRsltEditable == 'TRUE' ? true : false,//drop
                        isInactive: itemObj.isInactive,//Test
                        rptRcvDatetime: itemObj.rptRcvDatetime,
                        idSts:itemObj.idSts,//Test
                        chtScrnRslt: itemObj.chtScrnRslt,
                        chtScrnRsltInput: itemObj.chtScrnRsltInput == 'TRUE' ? true : false,//drop
                        g6pdScrnRslt: itemObj.g6pdScrnRslt,
                        g6pdScrnRsltInput: itemObj.g6pdScrnRsltInput == 'TRUE' ? true : false,//drop
                        tshTestRslt: itemObj.tshTestRslt,
                        ft4TestRslt: itemObj.ft4TestRslt,
                        t3TestRslt: itemObj.t3TestRslt,
                        g6pdTestRslt: itemObj.g6pdTestRslt,
                        version: itemObj.version,
                        failCntct: itemObj.isFailCntct == 1 ? true : false,
                        amended: itemObj.amended,
                        operationType: '',
                        isAmended: itemObj.isAmended,
                        chtRsltDrowdown: 'Nil',
                        g6pdRsltDrowdown: 'Nil'
                    };
                    tableListInfo.push(valObj);
                    valMap.set(`${itemObj.diagnosis}_${itemObj.clcCgsNeonatalScrnId}`, valObj);
                });
                this.setState({
                    valMap: valMap,
                    tableList: tableListInfo,
                    totalCases: count,
                    selectedRowId: null,
                    version: null,
                    isEdit: false,
                    searchParams: params,
                    contactCheckedFlag
                },()=> this.gscEnquiryTable && this.gscEnquiryTable.current &&  this.gscEnquiryTable.current.freshData());
            }
        });
    }

    handleFilter = (params) => {
        params.rptRcvDatetimeStart = params.rptRcvDatetimeStart !== '' ? moment(params.rptRcvDatetimeStart).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE) : params.rptRcvDatetimeStart;
        params.rptRcvDatetimeEnd = params.rptRcvDatetimeEnd !== '' ? moment(params.rptRcvDatetimeEnd).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE) : params.rptRcvDatetimeEnd;
        params.babyDobStart = params.babyDobStart !== '' ? moment(params.babyDobStart).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE) : params.babyDobStart;
        params.babyDobEnd = params.babyDobEnd !== '' ? moment(params.babyDobEnd).format(Enum.DATE_FORMAT_MWECS_EDMY_VALUE) : params.babyDobEnd;
        let rptFromDate = params.rptRcvDatetimeStart;
        let rptToDate = params.rptRcvDatetimeEnd;
        let fromDate = params.babyDobStart;
        let toDate = params.babyDobEnd;
        let rptDays = (rptToDate == '' && rptToDate == '') ? 0 : moment(rptToDate).diff(moment(rptFromDate), 'days');
        let days = (fromDate == '' && toDate == '') ? 0 : moment(toDate).diff(moment(fromDate), 'days');
        let logParams = `rptRcvDatetimeStart: ${params.rptRcvDatetimeStart},
            rptRcvDatetimeEnd:${params.rptRcvDatetimeEnd},
            Diagnosis:${params.diagnosis},
            Result: ${params.result},
            Screening: ${params.screening},
            Doc Status: ${params.docSts},
            Lab No.: ${params.labNum},
            babyDobStart ${params.babyDobStart},
            babyDobEnd: ${params.babyDobEnd},
            Place of Birth: ${params.birthplaceCod},
            Reviewed by Doctor:${params.rslt}`;
        if (rptDays < 29 && days < 29) {
            this.insertGscEnquiryLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Filter' button`, '/cgs-consultation/geneticScreening/enquiry', logParams);
            this.handleLoadData(params);
        } else {
            let payload = {
                msgCode: '102619',
                btnActions: {
                    btn1Click: () => {
                        let name = commonUtils.commonMessageLog('102619', 'Yes');
                        this.insertGscEnquiryLog(name, '', logParams);
                        this.handleLoadData(params);
                    },
                    btn2Click: () => {
                        let name = commonUtils.commonMessageLog('102619', 'No');
                        this.insertGscEnquiryLog(name, '', logParams);
                    }
                }
            };
            this.props.openCommonMessage(payload);
        }
    }

    handleSave = (saveCallback, saveType = '2') => {
        const { valMap } = this.state;
        let enquiryListDto = [];
        let tempEnquiryMap = valMap;
        if (tempEnquiryMap.size > 0) {
            for (let item of tempEnquiryMap.values()) {
                if (item.operationType) {
                    let name = item.diagnosis;
                    let failCntct = item.failCntct;
                    let typeBool = name == 'CHT/G6PD' && failCntct ? true : false;
                    let itemsObj = {
                        clcCgsNeonatalScrnId: item.clcCgsNeonatalScrnId,
                        version: item.version,
                        diagnosis: item.diagnosis,
                        g6pdFailCntct: typeBool ? true : (name == 'G6PD' ? failCntct : false),
                        chtFailCntct: typeBool ? true : (name == 'CHT' ? failCntct : false),
                        chkG6pdRslt: item.chkG6pdRsltEditable ? (item.chkG6pdRslt == null || item.chkG6pdRslt === 'Nil' ? '' : item.chkG6pdRslt) : '',
                        chkChtRslt: item.chkChtRsltEditable ? (item.chkChtRslt == null || item.chkChtRslt === 'Nil' ? '' : item.chkChtRslt) : '',
                        g6pdRslt: item.g6pdScrnRsltInput ? (item.g6pdRsltDrowdown == null || item.g6pdRsltDrowdown === 'Nil' ? '' : item.g6pdRsltDrowdown) : '',
                        chtRslt: item.chtScrnRsltInput ? (item.chtRsltDrowdown == null || item.chtRsltDrowdown === 'Nil' ? '' : item.chtRsltDrowdown) : ''
                    };
                    enquiryListDto.push(itemsObj);
                }
            }
        }
        this.props.openCommonCircularDialog();
        this.props.saveGscEnquiry({
            params: enquiryListDto, callback: (data) => {
                this.props.closeCommonCircularDialog();
                if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                    let payload = {
                        msgCode: data.msgCode,
                        btnActions: {
                            btn1Click: () => {
                                this.handleLoadData(this.state.searchParams);
                                let name = commonUtils.commonMessageLog(data.msgCode, 'Refresh Page');
                                this.insertGscEnquiryLog(name, '');
                            },
                            btn2Click: () => {
                                let name = commonUtils.commonMessageLog(data.msgCode, 'Cancel');
                                this.insertGscEnquiryLog(name, '');
                            }
                        }
                    };
                    this.props.openCommonMessage(payload);
                } else {
                    let apiUrl = '/cgs-consultation/geneticScreening/enquiry';
                    if (saveType == '1') {
                        let name = commonUtils.commonMessageLog(COMMON_CODE.SAVE_WARING, 'Save', '', 'title', 'GSC Enquiry');
                        this.insertGscEnquiryLog(name, apiUrl);
                    } else if (saveType == '2') {
                        let name = `Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`;
                        this.insertGscEnquiryLog(name, apiUrl);
                    }
                    this.handleLoadData(this.state.searchParams);
                    let payload = { msgCode: data.msgCode, showSnackbar: true };
                    this.props.openCommonMessage(payload);
                    if (typeof saveCallback === 'function') {
                        saveCallback && saveCallback(true);
                    }
                }
            }
        });
    }

    handleViewLog = () => {
        let name = 'Action: \'View Log\' button';
        this.insertGscEnquiryLog(name, '');
        this.props.addTabs(this.props.accessRights.find(item => item.name === accessRightEnum.viewNeonatalLog));
    }

    insertGscEnquiryLog = (desc, apiName = '', content = null) => {
        commonUtils.commonInsertLog(apiName, accessRightEnum.gscEnquiry, 'GSC Enquiry', desc, 'cgs-consultation', content);
    };

    handleReportAndClinicalDocClick = (type, item) => {
        if (type === 'report') {
            let roleFalg = this.props.accessRights.find(item => item.name === accessRightEnum.rescreenNslResult);
            let reScreenRoleFlag = roleFalg === undefined ? false : true;
            this.setState({
                isReportShow: true,
                selectedRowId: item.clcCgsNeonatalScrnId,
                clinicalDocumentType: item.diagnosis,
                neonatalDocId: item.clcNeonatalDocId,
                clinicalDocumentChtSts: item.chtSts,
                clinicalDocmentg6pdSts: item.g6pdSts,
                clinicalDocmentRslt: item.rslt,
                chtRslt: item.chtRslt,
                g6pdRslt: item.g6pdRslt,
                reportDocId: item.cmnInDocIdOthr,
                reScreenRoleFlag,
                labNum: item.labNum,
                version: item.version
            });
        } else {
            this.setState({
                isDocShow: true,
                selectedRowId: item.clcCgsNeonatalScrnId,
                clinicalDocumentType: item.diagnosis,
                neonatalDocId:item.clcNeonatalDocId,
                clinicalDocumentChtSts: null,
                clinicalDocmentg6pdSts: null,
                clinicalDocmentRslt: null,
                chtRslt: null,
                g6pdRslt: null
            });
        }
        let name = `Action: Click '${type}' icon (docId : ${item.clcNeonatalDocId})`;
        this.insertGscEnquiryLog(name, '');
    };

    onChangeDiagnosis = (event) => {
        const { dropList } = this.state;
        let resultDrop = [];
        let reviewedByDoctorDrop = [];
        let reviewedByEditFlag = false;
        if (event == 'All') {
            resultDrop = [
                { title: 'All', value: 'All' },
                { title: 'Screened Positive/Deficient', value: 'A' },
                { title: 'Screened Positive/Deficient/Borderline', value: 'AB' },
                { title: 'Borderline', value: 'B' },
                { title: 'Screened Negative/Not Deficient', value: 'N' }
            ];
            reviewedByDoctorDrop = [
                { title: 'All', value: 'All' }
            ];
            reviewedByEditFlag = true;
        } else if (event == 'CHT') {
            resultDrop = [
                { title: 'All', value: 'All' },
                { title: 'Screened Positive', value: 'A' },
                { title: 'Screened Negative', value: 'N' }
            ];
            reviewedByDoctorDrop = [
                { title: 'All', value: 'All' },
                { title: 'Screened Positive', value: 'A' },
                { title: 'Screened Negative', value: 'N' },
                { title: 'Nil', value: 'Nil' }
            ];
        } else if (event == 'G6PD') {
            resultDrop = [
                { title: 'All', value: 'All' },
                { title: 'Deficient', value: 'A' },
                { title: 'Deficient/Borderline', value: 'AB' },
                { title: 'Borderline', value: 'B' },
                { title: 'Not Deficient', value: 'N' }
            ];
            reviewedByDoctorDrop = [
                { title: 'All', value: 'All' },
                { title: 'Deficient', value: 'A' },
                { title: 'Borderline', value: 'B' },
                { title: 'Not Deficient', value: 'N' },
                { title: 'Nil', value: 'Nil' }
            ];
        }
        this.setState({
            reviewedByEditFlag,
            dropList: {
                ...dropList,
                resultDrop,
                reviewedByDoctorDrop
            }
        });
    }

    updateState = (obj, fun) => {
        if (!fun) {
            this.setState({ ...obj });
        } else {
            this.setState({ ...obj }, fun);
        }
    }

    setSelectedRowId = rowId => {
        this.setState({ selectedRowId: rowId });
    }

    handleRefreshPage = () => {
        this.handleLoadData(this.state.searchParams);
    }

    handleReportSaveCallback = ({ labNum, clcCgsNeonatalScrnId }, callbackFn) => {
        this.props.openCommonCircularDialog();
        let params = {
            labNum
        };
        this.props.getGscEnquiry({
            params: { params },
            callback: (data) => {
                this.props.closeCommonCircularDialog();
                let enquiryList = data.data.screeningEnquiryDtoList;
                let clinicalDocumentChtSts = '';
                let clinicalDocmentg6pdSts = '';
                let chtRslt = '';
                let g6pdRslt = '';
                let chtRecord = {};
                let g6pdRecord = {};
                enquiryList.map(item => {
                    if (item.clcCgsNeonatalScrnId === clcCgsNeonatalScrnId) {
                        let diagnosis = item.diagnosis.toUpperCase();
                        if (diagnosis !== 'G6PD') {
                            chtRecord = item;
                            chtRslt = item.chtRslt;
                            clinicalDocumentChtSts = item.chtSts;
                        }
                        if (diagnosis !== 'CHT') {
                            g6pdRecord = item;
                            g6pdRslt = item.g6pdRslt;
                            clinicalDocmentg6pdSts = item.g6pdSts;
                        }
                    }
                });
                this.setState({
                    clinicalDocumentChtSts,
                    clinicalDocmentg6pdSts,
                    chtRslt,
                    g6pdRslt
                });
                callbackFn?.({ chtRecord, g6pdRecord });
            }
        });
    }

    render() {
        let { classes,openCommonMessage } = this.props;
        let {
            tableHeight, totalCases, dropList, tableList, tabCHTDrop, tabG6PDDrop,
            isReportShow, isDocShow, selectedRowId, valMap, clinicalDocumentType,
            reScreenRoleFlag, neonatalDocId, reportDocId, reviewedByEditFlag, chtRslt, g6pdRslt,
            clinicalDocumentChtSts, clinicalDocmentg6pdSts, contactCheckedFlag, labNum, version
        } = this.state;

        let tableProps = {
            valMap,
            tableList,
            tabCHTDrop,
            tabG6PDDrop,
            selectedRowId,
            dropList,
            contactCheckedFlag,
            updateState: this.updateState,
            setSelectedRowId: this.setSelectedRowId,
            insertGscEnquiryLog: this.insertGscEnquiryLog,
            handleReportAndClinicalDocClick: this.handleReportAndClinicalDocClick
        };

        let reportDialogProps={
            selectedRowId,
            open: isReportShow,
            clinicalDocumentType,
            clinicalDocumentChtSts,
            clinicalDocmentg6pdSts,
            reScreenRoleFlag,
            reportDocId,
            neonatalDocId,
            labNum,
            chtRslt,
            g6pdRslt,
            version,
            updateState: this.updateState,
            insertGscEnquiryLog: this.insertGscEnquiryLog,
            onRefreshPage: this.handleRefreshPage,
            handleSaveCallback: this.handleReportSaveCallback
        };

        let clinicalProps = {
            open: isDocShow,
            clinicalDocumentType,
            neonatalDocId,
            openCommonMessage,
            updateState: this.updateState,
            onRefreshPage: this.handleRefreshPage
        };
        return (
            <Grid item container xs direction={'column'} justify={'space-between'} alignItems={'stretch'} className={classes.root}>
                <Grid className={classes.cardContainer}>
                    <Typography component="div" className={classes.wrapper}>
                        <ValidatorForm id="gscEnquiryForm" onSubmit={() => { }} ref="form">
                            <Typography component="div" className={classes.topDiv} ref={(ref) => this.filterRef = ref}>
                                <Filter onSearch={this.handleFilter} onChangeDrop={this.onChangeDiagnosis} options={dropList} resetHeight={this.resetHeight} reviewedByEditFlag={reviewedByEditFlag} />
                            </Typography>
                            <Typography component="div" className={classes.tabDiv} style={{ height: tableHeight }}>
                                <GscEnquiryTable ref={this.gscEnquiryTable} {...tableProps} />
                            </Typography>
                        </ValidatorForm>
                    </Typography>
                </Grid>
                <Typography component="div" className={classes.footDiv}>
                    <Typography component="div">
                        Total no.of cases = {totalCases}
                    </Typography>
                    <Typography component="div">
                        <CIMSButton id="viewlogDialog" onClick={() => { this.handleViewLog(); }}>View Log</CIMSButton>
                        <CIMSButton id="saveButton" onClick={() => { this.handleSave(); }}>Save</CIMSButton>
                    </Typography>
                </Typography>
                <ReportDialog {...reportDialogProps} />
                <ClinicalDocumentDialog {...clinicalProps}/>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    patientInfo: state.patient.patientInfo,
    common: state.common,
    accessRights: state.login.accessRights
});

const mapDispatchToProps = {
    openCommonMessage,
    closeCommonMessage,
    getGscEnquiry,
    getGscEnquiryReport,
    saveGscEnquiry,
    saveGscEnquiryReport,
    getGscEnquirySelect,
    openCommonCircularDialog,
    closeCommonCircularDialog,
    print,
    updateCurTab,
    addTabs,
    getHospitalList
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GscEnquiry));
