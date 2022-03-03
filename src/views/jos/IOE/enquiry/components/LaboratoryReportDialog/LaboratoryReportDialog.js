import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { Grid, Typography, Tooltip, FormControlLabel, Checkbox, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { styles } from './LaboratoryReportDialogStyle';
import EditTemplateDialog from '../../../../../administration/editTemplate/components/EditTemplateDialog';
import CIMSButton from '../../../../../../components/Buttons/CIMSButton';
import moment from 'moment';
import { previewReportDoctor } from '../../../../../../store/actions/MRAM/mramAction';
import { getPatientByIdToEmpty, getIoeLaboratoryReportList, getIoeLaboratoryReportVersionList, getIoeLaboratoryReportPdf, saveIoeLaboratoryReportComment, getIoeLaboratoryReportCommentList, getPatientById, getRequestDetailById, updateIoeReportFollowUpStatus } from '../../../../../../store/actions/IOE/laboratoryReport/laboratoryReportAction';
import { openCommonMessage, strCommonMessage } from '../../../../../../store/actions/message/messageAction';
import LabTable from './components/Table/LabTable';
import CommentTable from './components/Table/CommentTable';
import { josPrint, openCommonCircularDialog, closeCommonCircularDialog } from '../../../../../../store/actions/common/commonAction';
import { trim } from 'lodash';
import { COMMON_CODE } from '../../../../../../constants/message/common/commonCode';
import { IX_REQUEST_CODE } from '../../../../../../constants/message/IOECode/ixRequestCode';
import Enum from '../../../../../../../src/enums/enum';
import PdfJsViewer from '../../../../../jos/report/components/index';
import * as commonConstants from '../../../../../../constants/common/commonConstants';
import * as commonType from '../../../../../../store/actions/common/commonActionType';
import { PatientUtil } from '../../../../../../utilities';
import _ from 'lodash';

const inital_state = {
    numPages: 0,
    pageNumber: 1,
    scale: 1.0,
    isPrinted: false,
    dataType: 'D',
    justifyContent: 'center',
    minScale: 1.0,
    maxScale: 3,
    padding: '5px'
};

const legends = {
    '0': { codeName: 'Fin', describe: 'Final Report' },
    '1': { codeName: 'N', describe: 'Report Not Yet Received' },
    '2': { codeName: 'IN', describe: 'Interim Report' },
    '3': { codeName: 'Pre', describe: 'Preliminary Report' },
    '4': { codeName: 'P', describe: 'Provisional' },
    '5': { codeName: 'PS', describe: 'Provisional Supplementary' },
    '6': { codeName: 'FS', describe: 'Final Supplementary' },
    '7': { codeName: 'A', describe: 'Amend Report' },
    '8': { codeName: 'AS', describe: 'Amend Supplementary' },
    '9': { codeName: 'X', describe: 'Report Wipeout' }
};

// const Tip=withStyles(theme => ({
//     tooltip: {
//       backgroundColor: '#f5f5f9',
//       color: 'rgba(0, 0, 0, 0.87)',
//       fontSize: theme.typography.pxToRem(12),
//       border: '1px solid #dadde9'
//     }
//   }))((props)=>{
//     return (
//       <Tooltip {...props} title={
//         <React.Fragment>
//           <List>
//           {
//             Object.keys(legends).map(key=>{
//               const item=legends[key];
//               return (
//                 <ListItem key={key}>
//                   <ListItemIcon>{item.codeName}</ListItemIcon>
//                   <ListItemText>{item.describe}</ListItemText>
//                 </ListItem>
//               );
//             })
//           }
//           </List>
//         </React.Fragment>}
//       >
//         <lable>Rep Status</lable>
//       </Tooltip>
//     );
//   });

class LaboratoryReportDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...inital_state,
            medicalListData: [],
            checkBoxList: [{ label: 'Screened', value: 'Screened', checked: false }, { label: 'Reviewed', value: 'Reviewed', checked: false }, { label: 'Explained', value: 'Explained', checked: false }],
            pageNumber: 1,
            previewData: '',
            textareaVal: '',
            reportDetailReportId: '',
            reportVersionId: '',
            laboratoryReportList: [],
            laboratoryReportVersionList: [],
            laboratoryReportCommentList: [],
            requestDetail: null,
            explainChecked: false,
            reviewChecked: false,
            screenedChecked: false,
            checkBoxListFlag: false,
            checkBoxEditFlag: false,
            messageEditFlag: false,
            funNormal: true,
            blob: '',
            pdfReportUrl: '',
            ReportDataFlag: false,
            ReportDataHtmlFlag: false,
            showRemark: false
        };
    }


    UNSAFE_componentWillUpdate(nextProps) {
        if (nextProps.open !== this.props.open) {
            // this.initData(nextProps.open);
            this.initData(nextProps);
        }
    }
    customTheme = (theme) => createMuiTheme({
        ...theme,
        overrides: {
            MuiCheckbox: {
                root: {
                    margin: 0,
                    padding: '5px 14px'
                }
            },
            MuiTableRow: {
                root: {
                    height: 40
                }
            },
            MuiTableCell: {
                root: {
                    borderColor: '#B8BCB9',
                    borderStyle: 'solid',
                    borderWidth: 1
                },
                head: {
                    backgroundColor: 'rgb(123, 193, 217)'
                }
            },
            MuiButton: {
                containedPrimary: {
                    color: '#0579c8',
                    border: 'solid 1px #0579C8',
                    boxShadow: '2px 2px 2px #6e6e6e',
                    backgroundColor: '#FFFFFF',
                    '&:hover': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText
                    }
                }
            }
        }
    });

    initData(nextProps) {
        if (nextProps.open) {
                this.props.openCommonCircularDialog();
                //  let {selected}=this.props;
                let selected = nextProps.selected;
                let selectedRequestIds = '';
                let selectedRequestLabNums = '';
                let reportDetailReportId = '';
                selectedRequestIds = this.getSelectedRequestIds(selected);
                selectedRequestLabNums = this.getSelectedRequesLabNums(selected);
                if (selectedRequestIds.toString().length > 0) {
                    let params = {
                        requestIds: selectedRequestIds,
                        labNums: selectedRequestLabNums
                    };
                    this.props.getIoeLaboratoryReportList({
                        params,
                        callback: (result) => {
                            this.setState({
                                laboratoryReportList: result.data,
                                currentIndex: 0,
                                selectedRequestIds: selectedRequestIds,
                                selectedRequestLabNums: selectedRequestLabNums
                            });
                            if (result.data.length > 0) {
                                reportDetailReportId = result.data[0].ioeReportId;
                                params = {
                                    patientKey: result.data[0].patientKey
                                };
                                this.props.getPatientById({
                                    params
                                });
                                params = { ioeRequestId: result.data[0].ioeRequestId };
                                this.props.getRequestDetailById({
                                    params,
                                    callback: (result) => {
                                        this.setState({ requestDetail: result.data });
                                    }
                                });
                                params = {
                                    ioeRequestId: result.data[0].ioeRequestId,
                                    labNum: result.data[0].labNum
                                };
                                this.getIoeLaboratoryReportVersionList(params, reportDetailReportId);
                            }
                            else {
                                this.setState({
                                    laboratoryReportList: [],
                                    laboratoryReportVersionList: [],
                                    laboratoryReportCommentList: [],
                                    blob: '',
                                    previewData: ''
                                });
                            }
                        }
                    });
                    this.setState({
                        checkBoxListFlag: false,
                        checkBoxEditFlag: false,
                        messageEditFlag: false,
                        textareaVal: '',
                        funNormal: true
                    });
                } else {
                    this.setState({
                        funNormal: false,
                        laboratoryReportList: [],
                        laboratoryReportVersionList: [],
                        laboratoryReportCommentList: [],
                        blob: '',
                        previewData: ''
                    });
                }

        }
        else {
            this.setState({
                funNormal: false,
                laboratoryReportVersionList: [],
                laboratoryReportCommentList: [],
                blob: '',
                previewData: '',
                requestDetail: null
            });
        }
    }


    getSelectedRequestIds = (selected) => {
        let selectedRequestIds = '';
        for (let index = 0; index < selected.length; index++) {
            if (selected[index].labNum != null) {
                if (index === 0) {
                    selectedRequestIds = selected[index].ioeRequestId;
                }
                else {
                    selectedRequestIds = selectedRequestIds + ',' + selected[index].ioeRequestId;
                }
            }
        }
        return selectedRequestIds;
    }
    getSelectedRequesLabNums = (selected) => {
        let selectedRequestLabNums = '';
        for (let index = 0; index < selected.length; index++) {
            if (selected[index].labNum != null) {
                if (index === 0) {
                    selectedRequestLabNums = selected[index].labNum;
                }
                else {
                    selectedRequestLabNums = selectedRequestLabNums + ',' + selected[index].labNum;
                }
            }
        }
        return selectedRequestLabNums;
    }

    getIoeLaboratoryReportVersionList = (params, ioeReportId) => {
        let showRemark = false;
        this.props.getIoeLaboratoryReportVersionList({
            params,
            callback: (result) => {
                let laboratoryReportVersionList = result.data;
                for (let i = 0; i < laboratoryReportVersionList.length; i++) {
                    if (laboratoryReportVersionList[i].rptSts === 'X') {
                        showRemark = true;
                        let deleteLineVersionList = laboratoryReportVersionList.slice(i);//截取Wipeout以及之前的数据
                        deleteLineVersionList.forEach(reportVersionObj => {
                            reportVersionObj.deleteLine = true;//添加删除线
                        });
                        break;
                    } else {
                        laboratoryReportVersionList[i].deleteLine = false;
                    }
                }
                this.setState({
                    showRemark,
                    laboratoryReportVersionList,
                    reportVersionId: result.data.length > 0 ? result.data[0].ioeReportId : '',
                    reportDetailReportId: ioeReportId,
                    selectedReportedDetail: result.data.length > 0 ? result.data[0] : null
                });
                this.props.closeCommonCircularDialog();
                if (result.data.length > 0) {
                    this.getIoeLaboratoryReportCommentList(result.data[0].ioeReportId);
                    this.getIoeLaboratoryReportPdf(result.data[0].cmnInDocIdOthr);
                }
            }
        });
    }

    getIoeLaboratoryReportCommentList = (ioeReportId) => {
        let params = { reportId: ioeReportId };
        this.props.getIoeLaboratoryReportCommentList({
            params,
            callback: (result) => {
                this.setState({
                    laboratoryReportCommentList: result.data
                });
            }
        });
    }

    getIoeLaboratoryReportPdf = (ioeReportId) => {
        let params = { cmnInDocIdOthr: ioeReportId };
        this.props.getIoeLaboratoryReportPdf({
            params,
            callback: (result) => {
                if (result.respCode === 0) {
                    this.b64toBlob(result.data, 'application/pdf');
                } else {
                    let payload = { msgCode: '101615', params: [{ name: 'DESCR', value: result.errMsg }] };
                    this.props.strCommonMessage(payload);
                    this.setState({ blob: this.props.commonMessageDetail.description, previewData: '', ReportDataFlag: false, ReportDataHtmlFlag: false });
                }
            }
        });
    }

    handleDialogClose = (type) => {
        let reportId = this.state.reportVersionId;
        let textareaVal = this.state.textareaVal;
        if (this.state.messageEditFlag) {
            if (type === 'saveAndClose') {
                if (reportId != '' && reportId != null) {
                    if (trim(textareaVal) !== '') {
                        this.props.dispatch({
                            type: 'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
                            payload: {
                                msgCode: COMMON_CODE.SAVE_DIALOG_IX_WARING,
                                btnActions: {
                                    btn1Click: () => {
                                        this.props.openCommonCircularDialog();
                                        let params = {
                                            cmnt: textareaVal,
                                            ioeReportId: reportId,
                                            createdBy: '',
                                            createdDtm: '',
                                            ioeReportCommentId: '',
                                            updatedBy: '',
                                            updatedDtm: ''
                                        };
                                        this.props.saveIoeLaboratoryReportComment({
                                            params,
                                            callback: (result) => {
                                                if (result.respCode === 0) {
                                                    let payloadMgs = {
                                                        msgCode: '101605',
                                                        showSnackbar: true
                                                    };
                                                    this.props.openCommonMessage(payloadMgs);
                                                }
                                                this.props.closeCommonCircularDialog();
                                            }
                                        });
                                        if (!this.isEmptyCheckList()) {
                                            this.props.openCommonCircularDialog();
                                            params = {
                                                // ioeReportId: this.state.reportDetailReportId,
                                                ioeReportId: reportId,
                                                explainChecked: this.state.explainChecked,
                                                reviewChecked: this.state.reviewChecked,
                                                screenedChecked: this.state.screenedChecked,
                                                version: this.state.selectedReportedDetail.version
                                            };
                                            this.props.updateIoeReportFollowUpStatus({
                                                params, callback: (result) => {
                                                    if (result.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                                                        let payload = {
                                                            msgCode: result.msgCode,
                                                            btnActions:
                                                            {
                                                                btn1Click: () => {
                                                                    let { currentIndex } = this.state;
                                                                    let currentReport = this.state.laboratoryReportList[currentIndex];
                                                                    this.reloadLaboratoryReport(currentReport);
                                                                    this.updateLoadsetState(true);
                                                                    this.props.closeCommonCircularDialog();
                                                                },
                                                                btn2Click: () => {
                                                                    this.props.closeCommonCircularDialog();
                                                                    this.updateLoadsetState();
                                                                }
                                                            }
                                                        };
                                                        this.props.openCommonMessage(payload);
                                                    } else {
                                                        this.updateLoadsetState();
                                                    }
                                                }
                                            });
                                        } else {
                                            this.updateLoadsetState();
                                        }
                                        this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Close' button`, '', '');
                                    },
                                    btn2Click: () => {
                                        this.updateLoadsetState();
                                        this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Close' button`, '', '');
                                    }
                                }
                            }
                        });
                    }
                }
            }
            else if (type === 'normal') {
                if (trim(textareaVal) !== '') {
                    this.props.dispatch({
                        type: 'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
                        payload: {
                            msgCode: COMMON_CODE.SAVE_DIALOG_IX_WARING,
                            btnActions: {
                                btn1Click: () => {
                                    //Load
                                    this.props.openCommonCircularDialog();
                                    // Save
                                    let params = {
                                        cmnt: textareaVal,
                                        ioeReportId: reportId,
                                        createdBy: '',
                                        createdDtm: '',
                                        ioeReportCommentId: '',
                                        updatedBy: '',
                                        updatedDtm: ''
                                    };
                                    this.props.saveIoeLaboratoryReportComment({
                                        params,
                                        callback: (result) => {
                                            if (result.respCode === 0) {
                                                let payloadMgs = {
                                                    msgCode: '101605',
                                                    showSnackbar: true
                                                };
                                                this.props.openCommonMessage(payloadMgs);
                                            }
                                        }
                                    });
                                    this.props.closeCommonCircularDialog();
                                    this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Close' button`, '');
                                    this.updateLoadsetState();
                                },
                                btn2Click: () => {
                                    // Discard
                                    this.updateLoadsetState();
                                }
                            }
                        }
                    });
                } else {
                    this.updateLoadsetState();
                }
            }
        } else {
            if (this.state.checkBoxEditFlag) {
                if (!this.isEmptyCheckList()) {
                    this.props.dispatch({
                        type: 'COMMON_MESSAGE_OPEN_COMMON_MESSAGE',
                        payload: {
                            msgCode: COMMON_CODE.SAVE_DIALOG_IX_WARING,
                            btnActions: {
                                btn1Click: () => {
                                    //load
                                    this.props.openCommonCircularDialog();
                                    let params = {
                                        // ioeReportId: this.state.reportDetailReportId,
                                        ioeReportId: reportId,
                                        explainChecked: this.state.explainChecked,
                                        reviewChecked: this.state.reviewChecked,
                                        screenedChecked: this.state.screenedChecked,
                                        version: this.state.selectedReportedDetail.version
                                    };
                                    this.props.updateIoeReportFollowUpStatus({
                                        params,
                                        callback: (result) => {
                                            if (result.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                                                let payload = {
                                                    msgCode: result.msgCode,
                                                    btnActions:
                                                    {
                                                        btn1Click: () => {
                                                            let { currentIndex } = this.state;
                                                            let currentReport = this.state.laboratoryReportList[currentIndex];
                                                            this.reloadLaboratoryReport(currentReport);
                                                            this.updateLoadsetState(true);
                                                            this.props.closeCommonCircularDialog();
                                                        },
                                                        btn2Click: () => {
                                                            this.props.closeCommonCircularDialog();
                                                            this.updateLoadsetState();
                                                        }
                                                    }
                                                };
                                                this.props.openCommonMessage(payload);
                                            } else {
                                                let payload = { msgCode: result.msgCode, showSnackbar: true };
                                                this.props.openCommonMessage(payload);
                                                this.updateLoadsetState();
                                                this.props.closeCommonCircularDialog();
                                            }
                                        }
                                    });
                                    this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Close' button`, '');
                                }, btn2Click: () => {
                                    this.updateLoadsetState();
                                }
                            }
                        }
                    });
                }
                // this.updateLoadsetState();
            } else {
                this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Close' button`, '');
                this.updateLoadsetState();
            }
        }
    }

    updateLoadsetState = (openFlag) => {
        let { updateState } = this.props;
        this.setState({
            explainChecked: false,
            reviewChecked: false,
            screenedChecked: false,
            checkBoxEditFlag: false,
            messageEditFlag: false,
            showRemark: false,
            textareaVal: '',
            blob: '',
            previewData: '',
            ReportDataFlag: false,
            ReportDataHtmlFlag: false,
            checkBoxList: [{ label: 'Screened', value: 'Screened', checked: false }, { label: 'Reviewed', value: 'Reviewed', checked: false }, { label: 'Explained', value: 'Explained', checked: false }]
        });
        this.props.getPatientByIdToEmpty({
        });
        if (!openFlag) {
            updateState && updateState({ LaboratoryReportDialogOpen: false });
        }
    }

    handleCheckBoxChange = (row) => {
        let items = [...this.state.checkBoxList];
        items[row].checked = !items[row].checked;
        if (items[row].checked && this.state.funNormal) {
            this.setState({
                checkBoxListFlag: false,
                checkBoxEditFlag: true
            });
        }
        for (let index = 0; index < items.length; index++) {
            if (index === 0) {
                this.setState({ screenedChecked: items[index].checked });
            }
            else if (index === 1) {
                this.setState({ reviewChecked: items[index].checked });
            }
            else if (index === 2) {
                this.setState({ explainChecked: items[index].checked });
            }
        }
        if (this.isEmptyCheckList()) {
            this.setState({
                checkBoxListFlag: false,
                checkBoxEditFlag: false
            });
        }
        this.setState({ checkBoxList: items });
    }

    b64toBlob = (b64Data, contentType, sliceSize) => {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        let byteCharacters = atob(b64Data);
        let byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            let slice = byteCharacters.slice(offset, offset + sliceSize);
            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            let byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        let blob = new Blob(byteArrays, { type: contentType });
        this.setState({ blob: blob, previewData: b64Data, ReportDataFlag: true, ReportDataHtmlFlag: true });
    }


    changeTextarea = (e) => {
        let messageEditFlag = false;
        if (trim(e.target.value).length > 0) {
            messageEditFlag = true;
        }
        this.setState({
            textareaVal: e.target.value,
            messageEditFlag: messageEditFlag
        });
    }

    saveComment = (types) => {
        let reportId = this.state.reportVersionId;
        let textareaVal = this.state.textareaVal;
        if (reportId != '' && reportId != null) {
            if (trim(textareaVal) != '') {
                let params = {
                    cmnt: textareaVal,
                    ioeReportId: reportId,
                    createdBy: '',
                    createdDtm: '',
                    ioeReportCommentId: '',
                    updatedBy: '',
                    updatedDtm: ''
                };
                this.props.saveIoeLaboratoryReportComment({
                    params,
                    callback: (result) => {
                        if (result.respCode === 0) {
                            let payload = {
                                msgCode: result.msgCode,
                                showSnackbar: true
                            };
                            this.getIoeLaboratoryReportCommentList(reportId);
                            this.props.openCommonMessage(payload);
                        }
                    }
                });
                this.insertIxEnquiryLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Save + ' service saveComment the data and load Table List', '', '');
                this.setState({ messageEditFlag: false, textareaVal: '' });
            } else {
                let payload = { msgCode: IX_REQUEST_CODE.ENQUIRY_NOT_EMPTY };
                this.props.openCommonMessage(payload);
            }
        } else {
            return false;
        }
    }

    changeReportDetail = (item, index) => {
        let currentReport = this.state.laboratoryReportList[index];
        this.props.getRequestDetailById({
            params: {
                ioeRequestId: currentReport.ioeRequestId
            },
            callback: (resultInfo) => {
                this.setState({ requestDetail: resultInfo.data });
            }
        });
        this.insertIxEnquiryLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Select + ` a lab report in result list (Report Received Date: Report ${currentReport.rptRcvDatetime}; Lab No.:${currentReport.labNum})`, '');
        this.reloadLaboratoryReport(currentReport);
        this.setState({ currentIndex: index });
    }

    changeReportVersion = item => {
        let currentReport = this.state.laboratoryReportList[this.state.currentIndex];
        this.setState({
            reportVersionId: item.ioeReportId,
            selectedReportedDetail: item
        });
        this.insertIxEnquiryLog(commonConstants.INSERT_LOG_ACTION.Action + commonConstants.INSERT_LOG_STATUS.Select + ` a version of lab report in result list (Report Received Date:${currentReport.rptRcvDatetime}; Lab No.: ${item.labNum}; Report Version: ${item.rptRcvDatetime})`, '');
        this.getIoeLaboratoryReportCommentList(item.ioeReportId);
        this.getIoeLaboratoryReportPdf(item.cmnInDocIdOthr);
    }

    previousReport = () => {
        this.updateIoeReportFollowUpResult('previous');
    }

    nextReport = () => {
        this.updateIoeReportFollowUpResult('next');
    }

    currentReport = () => {
        this.updateIoeReportFollowUpResult('other');
    }

    updateIoeReportFollowUpResult = (status) => {
        let textareaVal = this.state.textareaVal;
        if (this.state.funNormal) {
            if (!this.isEmptyCheckList()) {
                this.setState({ checkBoxListFlag: false });
                let content = `Is 'Screened' checked:${this.state.screenedChecked}\n
                Is 'Reviewed' checked:${this.state.reviewChecked}\n
                Is 'Explained' checked: ${this.state.explainChecked}\n`;
                let params = {
                    // ioeReportId: this.state.reportDetailReportId,
                    ioeReportId: this.state.reportVersionId,
                    explainChecked: this.state.explainChecked,
                    reviewChecked: this.state.reviewChecked,
                    screenedChecked: this.state.screenedChecked,
                    version: this.state.selectedReportedDetail.version
                };
                this.props.updateIoeReportFollowUpStatus({
                    params,
                    callback: (result) => {
                        if (result.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                            let payload = {
                                msgCode: result.msgCode,
                                btnActions:
                                {
                                    btn1Click: () => {
                                        let { currentIndex } = this.state;
                                        let currentReport = this.state.laboratoryReportList[currentIndex];
                                        this.reloadLaboratoryReport(currentReport);
                                    },
                                    btn2Click: () => {
                                        this.props.closeCommonCircularDialog();
                                    }
                                }
                            };
                            this.props.openCommonMessage(payload);
                        } else {
                            let newIndex;
                            if (trim(textareaVal) != '') {
                                this.saveComment(status);
                            }
                            // else{
                            //     let currentReport = this.state.laboratoryReportList[newIndex];
                            //     this.reloadLaboratoryReport(currentReport);
                            // }
                            if (status === 'previous') {
                                if (this.state.currentIndex > 0) {
                                    newIndex = this.state.currentIndex - 1;
                                    let currentReport = this.state.laboratoryReportList[newIndex];
                                    this.reloadLaboratoryReport(currentReport);
                                }
                                else {
                                    newIndex = this.state.currentIndex;
                                    this.setState({ selectedReportedDetail: result.data });
                                }
                                this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Previous & Save' button`, '', content);
                            }
                            else if (status === 'next') {
                                if (this.state.currentIndex < this.state.laboratoryReportList.length - 1) {
                                    newIndex = this.state.currentIndex + 1;
                                    let currentReport = this.state.laboratoryReportList[newIndex];
                                    this.reloadLaboratoryReport(currentReport);
                                } else {
                                    newIndex = this.state.currentIndex;
                                    this.setState({ selectedReportedDetail: result.data });
                                }
                                this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Next & Save' button`, '', content);
                            }
                            else {
                                this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, '', content);
                                newIndex = this.state.currentIndex;
                                this.setState({ selectedReportedDetail: result.data });
                            }
                            let currentReport = this.state.laboratoryReportList[newIndex];
                            this.reloadLaboratoryReport(currentReport);
                            this.setState({
                                currentIndex: newIndex,
                                checkBoxEditFlag: false,
                                messageEditFlag: false,
                                textareaVal: ''
                            });
                        }
                    }
                });
            } else {
                let newIndex;
                if (trim(textareaVal) != '') {
                    this.saveComment(status);
                }
                // else{
                //     let currentReport = this.state.laboratoryReportList[newIndex];
                //     this.reloadLaboratoryReport(currentReport);
                // }
                if (status === 'previous') {
                    if (this.state.currentIndex > 0) {
                        newIndex = this.state.currentIndex - 1;
                        let currentReport = this.state.laboratoryReportList[newIndex];
                        this.reloadLaboratoryReport(currentReport);
                    }
                    else {
                        newIndex = this.state.currentIndex;
                    }
                    this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Previous' button`, '', '');
                }
                else if (status === 'next') {
                    if (this.state.currentIndex < this.state.laboratoryReportList.length - 1) {
                        newIndex = this.state.currentIndex + 1;
                        let targetReport = this.state.laboratoryReportList[newIndex];
                        this.reloadLaboratoryReport(targetReport);
                    } else {
                        newIndex = this.state.currentIndex;
                    }
                    this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Next' button`, '');
                }
                else {
                    this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Save' button`, '');
                    newIndex = this.state.currentIndex;
                }
                let currentReport = this.state.laboratoryReportList[newIndex];
                this.reloadLaboratoryReport(currentReport);
                this.setState({
                    currentIndex: newIndex,
                    messageEditFlag: false,
                    checkBoxEditFlag: false,
                    textareaVal: ''
                });
            }
        }
        else {
            let payload = { msgCode: COMMON_CODE.WARNING_NO_DATA };
            this.props.openCommonMessage(payload);
        }
    }

    isEmptyCheckList = () => {
        let flag = true;
        let checkBoxList = this.state.checkBoxList;
        for (let index = 0; index < checkBoxList.length; index++) {
            if (checkBoxList[index].checked) {
                flag = false;
                break;
            }
        }
        return flag;
    }

    reloadLaboratoryReport = (currentReport) => {
        this.setState({ requestDetail: null });
        let params = { requestIds: this.state.selectedRequestIds, labNums: this.state.selectedRequestLabNums };
        this.props.getIoeLaboratoryReportList({
            params,
            callback: (result) => {
                this.setState({ laboratoryReportList: result.data });
                params = { patientKey: currentReport.patientKey };
                this.props.getPatientById({ params });
                let reportDetailReportId = currentReport.ioeReportId;
                params = {
                    ioeRequestId: currentReport.ioeRequestId,
                    labNum: currentReport.labNum
                };
                this.getIoeLaboratoryReportVersionList(params, reportDetailReportId);
                //get Request Detail
                params = { ioeRequestId: currentReport.ioeRequestId };
                this.props.getRequestDetailById({
                    params,
                    callback: (result) => {
                        this.setState({ requestDetail: result.data });
                    }
                });
            }
        });
    }

    onHandlePrint = () => {
        this.props.openCommonCircularDialog();
        this.props.josPrint({
            base64: this.state.previewData,
            callback: result => {
                if (result) {
                    let payload = {
                        msgCode: '101317',
                        showSnackbar: true,
                        params: [
                            { name: 'reportType', value: 'report' }
                        ]
                    };
                    this.props.openCommonMessage(payload);
                }
                this.props.closeCommonCircularDialog();
            }
        });
        this.insertIxEnquiryLog(`[Report Details Dialog] Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Print' button`, '', '');
    }

    handleReportpdfUrl = (blob) => {
        let url = 'absolute';
        let { ReportDataFlag, pdfReportUrl } = this.state;
        if (ReportDataFlag) {
            if (blob) {
                url = window.URL.createObjectURL(blob);
                this.setState({ pdfReportUrl: url, ReportDataFlag: false });
            }
        } else {
            url = pdfReportUrl === '' ? 'absolute' : pdfReportUrl;
        }
        return url;
    }

    insertIxEnquiryLog = (desc, apiName = '', content = null) => {
        const { insertIxEnquiryLog } = this.props;
        insertIxEnquiryLog && insertIxEnquiryLog(desc, apiName, content);
    };

    getPrimaryDocType = (value) => {
        // const docTypeCode = this.props.docTypeCodeList.find(item => item.code === value);
        if (value) {
            switch (value) {
                case 'ID':
                    return 'HKID';
                case 'BC':
                    return 'HKBC';
                default:
                    return 'Other Doc.';
            }

        }
        return 'Other Doc.';
    };

    getPatientDocumentPair = (patientInfo) => {
        if (patientInfo && patientInfo.documentPairList && patientInfo.documentPairList.length > 0) {
            const primaryDocPair = patientInfo.documentPairList.find(item => item.isPrimary === 1);
            return primaryDocPair;
        }
        return null;
    }

    getConfirmationDocPair = (patientInfo) => {
        let docNo = '';
        if (patientInfo && patientInfo.documentPairList && patientInfo.documentPairList.length > 0) {
            let primaryDocPair = this.getPatientDocumentPair(patientInfo);
            // let docType = this.getPrimaryDocType(primaryDocPair.docTypeCd);
            docNo = PatientUtil.isHKIDFormat(primaryDocPair.docTypeCd) ? PatientUtil.getHkidFormat(primaryDocPair.docNo) : PatientUtil.getOtherDesc(primaryDocPair.docTypeCd) + (primaryDocPair.docNo);
        }
        return docNo;
    }

    render() {
        const { classes, open, patientInfo, disabledFlag } = this.props;
        const { blob, laboratoryReportList, laboratoryReportVersionList, laboratoryReportCommentList, requestDetail, reportDetailReportId, reportVersionId, ReportDataHtmlFlag, selectedReportedDetail, textareaVal } = this.state;
        let labTableParams = {
            laboratoryReportList,
            laboratoryReportVersionList,
            reportDetailReportId,
            reportVersionId,
            changeReportVersion: this.changeReportVersion,
            changeReportDetail: this.changeReportDetail
        };
        let commentTableParams = {
            laboratoryReportCommentList
        };
        let hkid = '';
        let hkidNum = '';
        let hkidName = '';
        let primaryDocPair = {};
        let hkidSurname = '';
        let hkidGivename = '';
        let hkidNameChi = '';
        if (patientInfo) {
            primaryDocPair = this.getPatientDocumentPair(patientInfo);
            hkid = patientInfo.documentPairList && patientInfo.documentPairList[0].docNo.substring(0, patientInfo.documentPairList[0].docNo.length - 1);
            hkidNum = patientInfo.documentPairList && patientInfo.documentPairList[0].docNo.substring(patientInfo.documentPairList[0].docNo.length - 1);
            hkidSurname = (patientInfo.engSurname !== undefined && patientInfo.engSurname != null) ? patientInfo.engSurname : '';
            hkidGivename = (patientInfo.engGivename !== undefined && patientInfo.engGivename !== null) ? (hkidSurname ? (',' + patientInfo.engGivename) : patientInfo.engGivename) : '';
            hkidNameChi = (patientInfo.nameChi !== undefined && patientInfo.nameChi !== null) ? ('(' + patientInfo.nameChi + ')') : '';
            hkidName = hkidSurname + hkidGivename + hkidNameChi;
        }
        return (
            <MuiThemeProvider theme={this.customTheme}>
                <EditTemplateDialog
                    ref={this.content}
                    dialogTitle="Report Details"
                    open={open}
                    classes={{ paper: classes.paper }}
                    handleEscKeyDown={this.state.explainChecked || this.state.reviewChecked || this.state.screenedChecked || _.trim(textareaVal).length > 0 ? () => this.handleDialogClose('saveAndClose') : () => this.handleDialogClose('normal')}
                >
                    <Typography component="div" id={'reportDetailsDialog'} style={{ backgroundColor: 'white', marginLeft: 5, marginRight: 5, marginTop: 5, position: 'relative' }}>
                        <Grid container>
                            <Grid className={classes.left_warp} item xs={7} style={{ maxWidth: '55%', flexBasis: '55%' }}>
                                <Typography component="div" style={{ backgroundColor: patientInfo !== null ? patientInfo.genderCd === 'M' ? 'rgba(209, 238, 252, 1)' : patientInfo.genderCd === 'U' ? 'rgba(248, 209, 134, 1)' : 'rgba(254, 222, 237, 1)' : 'white' }}>
                                    <label className={classes.label}>Name: </label>
                                    <lable style={{ paddingLeft: 0 }} className={classes.label} title={patientInfo !== null ? hkidName : ''}>
                                        {patientInfo !== null ? hkidName.length > 70 ? hkidName.slice(0, 70) + '...' : hkidName : ''}
                                    </lable>
                                </Typography>
                                <Typography component="div" style={{ backgroundColor: patientInfo !== null ? patientInfo.genderCd === 'M' ? 'rgba(209, 238, 252, 1)' : patientInfo.genderCd === 'U' ? 'rgba(248, 209, 134, 1)' : 'rgba(254, 222, 237, 1)' : 'white' }}>
                                    <label className={classes.label}>{patientInfo !== null ? this.getPrimaryDocType(primaryDocPair.docTypeCd) + ':' + this.getConfirmationDocPair(patientInfo) : ''}</label>
                                    <label className={classes.label}>DOB: {patientInfo !== null ? moment(patientInfo.dob).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''}</label>
                                    <label className={classes.label}>Age: {`${patientInfo !== null ? patientInfo.age : ''}${patientInfo !== null ? patientInfo.ageUnit[0] : ''}`}</label>
                                    <label className={classes.label}>Sex: {patientInfo !== null ? patientInfo.genderCd : ''}</label>
                                </Typography>
                                <Typography className={classes.leftHeader} component="h3" variant="h5">
                                    <label className={classes.label}>Ix Request No. (IRN):</label><label className={classes.label_right}>{requestDetail !== null ? requestDetail.ioeRequestNumber : ''}</label>
                                    <label className={classes.label}>Request Date:</label><label className={classes.label_right}>{requestDetail !== null ? moment(requestDetail.requestDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''}</label>
                                    <br />
                                    <label className={classes.label}>Test:</label><label title={requestDetail !== null ? (requestDetail.test !== null ? (requestDetail.test) : '') : ''} className={classes.label_right}>{requestDetail !== null ? (requestDetail.test !== null ? (requestDetail.test.length > 55 ? requestDetail.test.slice(0, 55) + '...' : requestDetail.test) : '') : ''}</label>
                                    <label className={classes.label}>Specimen:</label><label title={requestDetail !== null ? (requestDetail.specimen !== null ? (requestDetail.specimen) : '') : ''} className={classes.label_right}>{requestDetail !== null ? (requestDetail.specimen !== null ? (requestDetail.specimen.length > 45 ? requestDetail.specimen.slice(0, 45) + '...' : requestDetail.specimen) : '') : ''}</label>
                                </Typography>
                                <Typography component="div" style={{ height: '49%' }}>
                                    <LabTable {...labTableParams} />
                                </Typography>
                                <Typography component="div" className={classes.save_div}>
                                    <Grid container>
                                        <Grid item style={{ flexGrow: 0, maxWidth: '10%', flexBasis: '10%' }}>
                                            <Typography component="div" style={{ fontWeight: 600 }}>
                                                <label>Comment</label>
                                            </Typography>
                                        </Grid>
                                        <Grid item style={{ flexGrow: 0, maxWidth: '90%', flexBasis: '90%' }}>
                                            <Typography component="div" style={{ marginRight: 10 }}>
                                                <textarea disabled={disabledFlag} maxLength="1000" value={textareaVal} onChange={this.changeTextarea} className={classes.textarea}></textarea>
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Typography>
                                <Typography className={classes.table} component="div" style={{ minHeight: 160, height: '11%', marginLeft: 5, marginRight: 5 }}>
                                    <CommentTable {...commentTableParams} />
                                </Typography>
                            </Grid>
                            <Grid item xs={5} style={{ maxWidth: '45%', flexBasis: '45%' }}>
                                {
                                    ReportDataHtmlFlag ?
                                        <Typography className={classes.right_warp} component="div">
                                            <PdfJsViewer
                                                scale={0.9}
                                                height={726}
                                                url={{ url: this.handleReportpdfUrl(blob) }}
                                                disablePrint
                                            />
                                        </Typography> :
                                        <Typography className={classes.right_html} component="div">
                                            <Typography component="div" style={{ height: '45%' }}></Typography>
                                            <Typography component="div" className={classes.right_html_div}>
                                                <label className={classes.right_html_div_label}>{blob}</label>
                                            </Typography>
                                        </Typography>
                                }
                            </Grid>
                        </Grid>
                        <Typography component="div" className={classes.actionBack}>
                            <Typography style={{ marginLeft: 15, fontWeight: 'bold' }} component="div">
                                Actions
                            </Typography>
                        </Typography>
                        <Typography component="div" className={classes.btnDiv}>
                            <Grid container>
                                <Grid item xs={5} >
                                    <Grid alignItems="center" container justify="flex-start">
                                        {this.state.checkBoxList.map((item, index) => {
                                            return (
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox name="DASM_168" disabled={disabledFlag} color="primary" checked={item.checked} onClick={() => this.handleCheckBoxChange(index)}
                                                            inputProps={{ style: { width: 30 } }}
                                                            classes={{ root: classes.checkbox_sty }}
                                                        />}
                                                    key={index}
                                                    label={item.label}
                                                    value={item.value}
                                                    classes={{ label: classes.font, root: classes.checkBox_root }}
                                                />
                                            );
                                        })}

                                        <CIMSButton
                                            classes={{ label: classes.fontLabel }}
                                            color="primary"
                                            id="btn_ioe_lab_save"
                                            onClick={() => this.previousReport()}
                                            size="small"
                                        >
                                            {this.state.explainChecked || this.state.reviewChecked || this.state.screenedChecked || _.trim(textareaVal).length > 0 ? 'Previous & Save' : 'Previous'}
                                        </CIMSButton>
                                        <CIMSButton
                                            classes={{ label: classes.fontLabel }}
                                            color="primary"
                                            id="btn_ioe_lab_save"
                                            onClick={() => this.currentReport()}
                                            size="small"
                                        >
                                            Save
                                        </CIMSButton>
                                        <CIMSButton
                                            classes={{ label: classes.fontLabel }}
                                            color="primary"
                                            id="btn_ioe_lab_nextReport"
                                            onClick={() => this.nextReport()}
                                            size="small"
                                        >
                                            {this.state.explainChecked || this.state.reviewChecked || this.state.screenedChecked || _.trim(textareaVal).length > 0 ? 'Next & Save' : 'Next'}
                                        </CIMSButton>
                                        {this.state.checkBoxListFlag ? (
                                            <div>
                                                <span className={classes.templateDetailValidation}
                                                    id="checkBoxList_ioe_lab_validation"
                                                >This field selected at least one.</span>
                                            </div>
                                        ) : <div></div>}
                                    </Grid>
                                </Grid>
                                <Grid item xs={5} >
                                    <Grid alignItems="center" style={{ float: 'right', display: this.state.showRemark ? 'block' : 'none', marginTop: -20 }} >
                                        <span>Result:</span>
                                        <span className={classes.fontCaution}>Please note the report Wipeout is happened to this request form. Please contact H&C Lab for details. Please note that the e-result from lab cannot fulfill CIMS checking in patient demographic,you may verify report content and may contact with lab if necessary</span>
                                    </Grid>
                                </Grid>
                                <Grid item xs={2}>
                                    <Grid direction="row" alignItems="center" container justify="flex-end" style={{ float: 'right' }} >
                                        <CIMSButton
                                            classes={{ label: classes.fontLabel }}
                                            size="small"
                                            color="primary"
                                            onClick={this.onHandlePrint}
                                            id="btn_ioe_lab_print"
                                            // disabled={laboratoryReportVersionList.length > 0 ? false : true}
                                            disabled={!ReportDataHtmlFlag}
                                        >
                                            Print
                                        </CIMSButton>
                                        <CIMSButton
                                            classes={{ label: classes.fontLabel }}
                                            color="primary"
                                            id="btn_ioe_lab_close"
                                            onClick={this.state.explainChecked || this.state.reviewChecked || this.state.screenedChecked || _.trim(textareaVal).length > 0 ? () => this.handleDialogClose('saveAndClose') : () => this.handleDialogClose('normal')}
                                            size="small"
                                        >
                                            Close
                                            {/* {this.state.explainChecked || this.state.reviewChecked || this.state.screenedChecked ? 'Save & Close' : 'Close'} */}
                                        </CIMSButton>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Typography>
                    </Typography>
                </EditTemplateDialog>
            </MuiThemeProvider>
        );
    }
}
const mapStateToProps = state => {
    return {
        commonMessageDetail: state.message.commonMessageDetail,
        patientInfo: state.laboratoryReport.patientInfo,
        patient: state.patient.patientInfo,
        docTypeCodeList: state.common.commonCodeList.doc_type
    };
};

const mapDispatchToProps = {
    previewReportDoctor,
    getIoeLaboratoryReportList,
    getIoeLaboratoryReportVersionList,
    getIoeLaboratoryReportPdf,
    saveIoeLaboratoryReportComment,
    getIoeLaboratoryReportCommentList,
    getPatientById,
    openCommonMessage,
    getRequestDetailById,
    updateIoeReportFollowUpStatus,
    openCommonCircularDialog,
    closeCommonCircularDialog,
    josPrint,
    strCommonMessage,
    getPatientByIdToEmpty
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LaboratoryReportDialog));

