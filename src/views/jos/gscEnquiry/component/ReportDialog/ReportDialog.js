import React, { Component } from 'react';
import {
    withStyles, FormHelperText, Typography,
    Grid, FormControlLabel, Checkbox, TextField
} from '@material-ui/core';
import { connect } from 'react-redux';
import classNames from 'classnames';
import styles from './ReportDialogStyle';
import EditTemplateDialog from '../EditTemplateDialog/EditTemplateDialog';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import PdfJsViewer from '../../../../jos/report/components/index';
import _ from 'lodash';
import * as commonConstants from '../../../../../constants/common/commonConstants';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import { openCommonMessage,closeCommonMessage,strCommonMessage } from '../../../../../store/actions/message/messageAction';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../../../store/actions/common/commonAction';
import CustomizedSelectFieldValidator from '../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import * as commonUtils from '../../../../../utilities/josCommonUtilties';
import { refreshPatient } from '../../../../../store/actions/patient/patientAction';
import CIMSFormLabel from '../../../../../components/InputLabel/CIMSFormLabel';
import { saveLabReportCreate, getLabReportPatientKey, saveLabReport, getGscLabReportPdf } from '../../../../../store/actions/gscEnquiry/gscEnquiryAction';

class ReportDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            checkBoxList: {
                'G6PD': [
                    { label: 'Deficient', value: 'A' },
                    { label: 'Borderline', value: 'B' },
                    { label: 'Not Deficient', value: 'N' }
                ],
                'CHT': [
                    { label: 'Screened Positive', value: 'A' },
                    { label: 'Screened Negative', value: 'N' }
                ]
            },
            chtCheckBoxValue: '',
            g6pdCheckBoxValue: '',
            reasonDrop: [
                // { label: 'All', value: '' },
                { label: 'Lab result changed', value: 'LRC' },
                { label: 'Human error', value: 'HE' },
                { label: 'Others', value: 'OTH' }
            ],
            chtEditFlag: false,
            g6pdEditFlag: false,
            blob: '',
            previewData: '',
            pdfReportUrl: '',
            ReportDataFlag: false,
            ReportDataHtmlFlag: false,
            selectValue: '',
            chtErrorFlag: false,
            g6pdErrorFlag: false,
            chtReasonFlag:false,
            g6pdReasonFlag:false,
            chtSelectValFlag: false,
            g6pdSelectValFlag: false,
            chtTextValue: '',
            g6pdTextValue: '',
            chtOtherFlag: false,
            g6pdOtherFlag: false,
            chtDisableSaveFlag: false,
            g6pdDisableSaveFlag: false,
            chtDisableCreateDocFlag: false,
            g6pdDisableCreateDocFlag: false,
            chtDisableRescreen: false,
            g6pdDisableRescreen: false
        };
    }

    UNSAFE_componentWillUpdate(nextProps) {
        if (nextProps.open !== this.props.open) {
            this.initData(nextProps);
        }
    }

    initData = (nextProps) => {
        if (nextProps.open) {
            let chtDisableSaveFlag = false;
            let g6pdDisableSaveFlag = false;
            let chtDisableCreateDocFlag = false;
            let g6pdDisableCreateDocFlag = false;
            let chtCheckBoxValue = '';
            let g6pdCheckBoxValue = '';
            chtDisableCreateDocFlag = g6pdDisableCreateDocFlag = nextProps.neonatalDocId > 0 ? true : false;
            // 控制Save/Create Clinical Document button是否开启
            if (nextProps.clinicalDocumentChtSts == 'P' || nextProps.chtRslt === 'N') {
                chtDisableCreateDocFlag = true;
            }
            if (nextProps.clinicalDocmentg6pdSts == 'P' || nextProps.g6pdRslt === 'N') {
                g6pdDisableCreateDocFlag = true;
            }

            if (nextProps.clinicalDocumentChtSts == 'C' || nextProps.clinicalDocmentg6pdSts == 'C') {
                chtDisableSaveFlag = nextProps.clinicalDocumentChtSts == 'C';
                g6pdDisableSaveFlag = nextProps.clinicalDocmentg6pdSts == 'C';

                chtCheckBoxValue = nextProps.chtRslt == null ? '' : nextProps.chtRslt;
                g6pdCheckBoxValue = nextProps.g6pdRslt == null ? '' : nextProps.g6pdRslt;
            }
            this.getReportPdf(nextProps.reportDocId);
            this.setState({
                chtCheckBoxValue,
                g6pdCheckBoxValue,
                chtDisableSaveFlag,
                g6pdDisableSaveFlag,
                chtDisableCreateDocFlag,
                g6pdDisableCreateDocFlag
            });
        } else {
            this.handleCancel();
        }
    }

    handleSaveDocCreate = (docType,selectedRowId,pmi) => {
        let { insertGscEnquiryLog } = this.props;
        this.props.openCommonCircularDialog();
        let apiUrl = '/cgs-consultation/geneticScreening/doc/create';
        let params = {
            docType: docType,
            neonatalScrnId: selectedRowId
        };
        if (pmi){
            params.pmi = pmi;
        }
        this.props.saveLabReportCreate({
            params, callback: (data) => {
                let dataCommon = {
                    clinicalDocumentType: docType,
                    neonatalDocId: data.data.docId,
                    patientKey: data.data.patientKey,
                    docStatus: data.data.docSts
                };
                this.props.closeCommonCircularDialog();
                if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                    let payload = {
                        msgCode: data.msgCode,
                        btnActions: {
                            btn1Click: () => {
                                this.handleCancel();
                                let name = commonUtils.commonMessageLog(data.msgCode, 'Refresh Page');
                                insertGscEnquiryLog && insertGscEnquiryLog(name, apiUrl);
                            },
                            btn2Click: () => {
                                let name = commonUtils.commonMessageLog(data.msgCode, 'Cancel');
                                insertGscEnquiryLog && insertGscEnquiryLog(name, apiUrl);
                            }
                        }
                    };
                    this.props.openCommonMessage(payload);
                } else {
                    let name = '[Report Details Dialog] Action: \'Save\' button';
                    insertGscEnquiryLog && insertGscEnquiryLog(name, apiUrl);
                    this.handleCancel(dataCommon);
                    this.props.refreshPatient({
                        isRefreshCaseNo: true, isRefreshBannerData: true
                    });
                    // let payload = { msgCode: data.msgCode, showSnackbar: true };
                    // this.props.openCommonMessage(payload);
                }
            }
        });
    }

    handleSaveLabReport = (params = null, callbackFn) => {
        let { insertGscEnquiryLog } = this.props;
        let apiUrl = '/cgs-consultation/geneticScreening/saveLabReport';
        this.props.openCommonCircularDialog();
        this.props.saveLabReport({
            params, callback: (data) => {
                this.props.closeCommonCircularDialog();
                if (data.msgCode === commonConstants.COMMON_MESSAGE.CONCURRENT_CODE) {
                    let payload = {
                        msgCode: data.msgCode,
                        btnActions: {
                            btn1Click: () => {
                                let name = commonUtils.commonMessageLog(data.msgCode, 'Refresh Page');
                                insertGscEnquiryLog && insertGscEnquiryLog(name, apiUrl);
                                this.handleCancel();
                            },
                            btn2Click: () => {
                                let name = commonUtils.commonMessageLog(data.msgCode, 'Cancel');
                                insertGscEnquiryLog && insertGscEnquiryLog(name, apiUrl);
                            }
                        }
                    };
                    this.props.openCommonMessage(payload);
                } else {
                    let logName='[Report Details Dialog] Action: \'Save\' button';
                    insertGscEnquiryLog && insertGscEnquiryLog(logName, apiUrl);
                    let payload = { msgCode: data.msgCode, showSnackbar: true };
                    this.props.openCommonMessage(payload);
                    callbackFn?.();
                }
            }
        });
    }

    handleCheckBoxChange = (event, type, attrName) => {
        let val = event.target.checked ? type : '';
        this.setState({ [`${attrName}EditFlag`]: true, [`${attrName}CheckBoxValue`]: val });
    }

    getReportPdf = (reportId) => {
        let params = { cmnInDocIdOthr: reportId };
        this.props.getGscLabReportPdf({
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

    handleSave = (clinicalDocumentType, callbackFn, closeDialog = false) => {
        const { selectedRowId, version } = this.props;
        let {
            chtCheckBoxValue, g6pdCheckBoxValue,
            chtSelectValue, g6pdSelectValue,
            chtTextValue, g6pdTextValue,
            chtSelectValFlag, g6pdSelectValFlag,
            chtReasonFlag, g6pdReasonFlag
        } = this.state;
        let chtVal = clinicalDocumentType === 'CHT' ? chtCheckBoxValue : '';
        let g6pdVal = clinicalDocumentType === 'G6PD' ? g6pdCheckBoxValue : '';
        let reasonFlag = clinicalDocumentType === 'CHT' ? chtReasonFlag : g6pdReasonFlag;
        let params = {
            chtRslt: chtVal,
            clcCgsNeonatalScrnId: selectedRowId,
            g6pdRslt: g6pdVal,
            version: version,
            reScreen: clinicalDocumentType === 'CHT' ? chtSelectValFlag : g6pdSelectValFlag,
            reason: clinicalDocumentType === 'CHT' ? chtSelectValue : g6pdSelectValue,
            reasonTxt: clinicalDocumentType === 'CHT' ? chtTextValue : g6pdTextValue
        };
        if (params.chtRslt == '' && params.g6pdRslt == '') {
            let payload = {
                msgCode: '130301',
                params: [
                    { name: 'HEADER', value: `${clinicalDocumentType} Screening` },
                    { name: 'MESSAGE', value: 'Please select Screening Result' }]
            };
            this.props.openCommonMessage(payload);
        }
        else if (reasonFlag && !params.reason) {
            let payload = {
                msgCode: '130301',
                params: [
                    { name: 'HEADER', value: `${clinicalDocumentType} Screening` },
                    { name: 'MESSAGE', value: ' You must make at least one selection' }]
            };
            this.props.openCommonMessage(payload);
            // this.props.openCommonMessage({
            //     msgCode: '130302',
            //     params: [
            //         { name: 'HEADER', value: `${clinicalDocumentType} Screening` },
            //         { name: 'MESSAGE', value: `Confirm ${params.selectValue} result?` }
            //     ],
            //     btnActions: {
            //         btn1Click: () => {
            //             console.log('aa','test');
            //             this.handleSaveLabReport(params);
            //         },
            //         btn2Click: () => {
            //             console.log('aa', 'testInfo');
            //         }
            //     }
            // });
        }
        else {
            let selectScreeningVal = clinicalDocumentType === 'CHT' ? chtCheckBoxValue : g6pdCheckBoxValue;
            let selectScreeningLabel = this.state.checkBoxList[clinicalDocumentType].find(screen => screen.value === selectScreeningVal)?.label;
            this.props.openCommonMessage({
                msgCode: '130302',
                params: [
                    { name: 'HEADER', value: `${clinicalDocumentType} Screening` },
                    { name: 'MESSAGE', value: `Confirm ${selectScreeningLabel} result?` }
                ],
                btnActions: {
                    btn1Click: () => {
                        this.handleSaveLabReport(params, () => {
                            if (closeDialog) {
                                callbackFn?.();
                            } else {
                                this.props.handleSaveCallback({ labNum: this.props.labNum, clcCgsNeonatalScrnId: selectedRowId, clinicalDocumentType }, (data) => {
                                    let { chtRecord, g6pdRecord } = data;
                                    let chtDisableCreateDocFlag = false;
                                    let g6pdDisableCreateDocFlag = false;
                                    chtDisableCreateDocFlag = chtRecord.clcNeonatalDocId > 0 ? true : false;
                                    g6pdDisableCreateDocFlag = g6pdRecord.clcNeonatalDocId > 0 ? true : false;
                                    // 控制Save/Create Clinical Document button是否开启
                                    if (chtRecord.chtSts == 'P' || chtRecord.chtRslt === 'N') {
                                        chtDisableCreateDocFlag = true;
                                    }
                                    if (g6pdRecord.g6pdSts == 'P' || g6pdRecord.g6pdRslt === 'N') {
                                        g6pdDisableCreateDocFlag = true;
                                    }
                                    this.setState({
                                        [`${clinicalDocumentType.toLowerCase()}DisableSaveFlag`]: true,
                                        [`${clinicalDocumentType.toLowerCase()}ReasonFlag`]: false,
                                        [`${clinicalDocumentType.toLowerCase()}OtherFlag`]: false,
                                        [`${clinicalDocumentType.toLowerCase()}DisableRescreen`]: false,
                                        [`${clinicalDocumentType.toLowerCase()}SelectValue`]: '',
                                        [`${clinicalDocumentType.toLowerCase()}TextValue`]: '',
                                        [`${clinicalDocumentType.toLowerCase()}EditFlag`]: false,
                                        chtDisableCreateDocFlag,
                                        g6pdDisableCreateDocFlag
                                    });
                                    callbackFn?.();
                                });
                            }
                        });
                    },
                    btn2Click: () => {
                    }
                }
            });
        }
    }

    handleCancelResult = (clinicalDocumentType) =>{
        let { insertGscEnquiryLog } = this.props;
        let logName = '[Report Details Dialog] Action: Click \'Cancel\' button';
        insertGscEnquiryLog && insertGscEnquiryLog(logName, '');
        this.cancelFn(null, clinicalDocumentType);
    }

    cancelFn = (result = null, clinicalDocumentType = 'CHT') => {
        let { chtEditFlag, g6pdEditFlag } = this.state;
        if (chtEditFlag || g6pdEditFlag) {
            let firstPopUp = clinicalDocumentType === 'CHT' ? (chtEditFlag ? 'CHT' : 'G6PD') : (g6pdEditFlag ? 'G6PD' : 'CHT') ;
            let secondPopUp = firstPopUp === 'CHT' ? 'G6PD' : 'CHT';
            let secondPopUpParams = chtEditFlag && g6pdEditFlag ? {
                // btn1AutoClose: false,
                msgCode: '102639',
                params: [{ name: 'documentType', value: secondPopUp }],
                btnActions: {
                    btn1Click: () => {
                        setTimeout(() => {
                            this.handleSave(secondPopUp, () => {
                                this.handleCancel(result);
                            }, true);
                        }, 0);
                    },
                    btn2Click: () => {
                        this.handleCancel(result);
                        // this.props.closeCommonMessage();
                    },
                    btn3Click: () => {
                    }
                }
            } : null;
            let firstPopUpParams = {
                // btn1AutoClose: false,
                msgCode: '102639',
                params: [{ name: 'documentType', value: firstPopUp }],
                btnActions: {
                    btn1Click: () => {
                        setTimeout(() => {
                            this.handleSave(firstPopUp, () => {
                                if (secondPopUpParams) {
                                    this.setState({ [`${firstPopUp.toLowerCase()}EditFlag`]: false });
                                    this.props.openCommonMessage(secondPopUpParams);
                                } else {
                                    this.handleCancel(result);
                                }
                            }, !secondPopUpParams);
                        }, 0);
                    },
                    btn2Click: () => {
                        if (secondPopUpParams) {
                            setTimeout(() => {
                                this.props.openCommonMessage(secondPopUpParams);
                            }, 0);
                        } else {
                            this.handleCancel(result);
                        }
                    },
                    btn3Click: () => {
                        // if (secondPopUpParams) {
                        //     setTimeout(() => {
                        //         this.props.openCommonMessage(secondPopUpParams);
                        //     }, 0);
                        // }
                    }
                }
            };
            this.props.openCommonMessage(firstPopUpParams);
        } else {
            this.handleCancel(result);
        }
    }

    handleCancel = (result = null) => {
        let { updateState, onRefreshPage } = this.props;
        this.setState({
            chtCheckBoxValue: '',
            g6pdCheckBoxValue: '',
            isEdit: false,
            blob: '',
            previewData: '',
            pdfReportUrl: '',
            ReportDataFlag: false,
            ReportDataHtmlFlag: false,
            chtSelectValue: '',
            g6pdSelectValue: '',
            chtErrorFlag: false,
            chtReasonFlag: false,
            chtTextValue: '',
            chtOtherFlag: false,
            chtDisableSaveFlag: false,
            chtDisableCreateDocFlag: false,
            g6pdErrorFlag: false,
            g6pdReasonFlag: false,
            g6pdTextValue: '',
            g6pdOtherFlag: false,
            g6pdDisableSaveFlag: false,
            g6pdDisableCreateDocFlag: false,
            chtDisableRescreen: false,
            g6pdDisableRescreen: false,
            chtEditFlag: false,
            g6pdEditFlag: false
        });
        onRefreshPage && onRefreshPage();
        if (result != null) {
            updateState && updateState({
                isReportShow: false,
                neonatalDocId: result.neonatalDocId,
                clinicalDocumentType: result.clinicalDocumentType,
                isDocShow: true,
                patientKey: result.patientKey
            });
        } else {
            updateState && updateState({ isReportShow: false });
        }
    }

    handleReScreen = (attrName) => {
        let { insertGscEnquiryLog } = this.props;
        let logName = `[Report Details Dialog] Action: Click 'Re-Screen' button in ${attrName}`;
        this.setState({
            [`${attrName}ReasonFlag`]: true,
            [`${attrName}DisableSaveFlag`]: false,
            [`${attrName}DisableRescreen`]: true,
            [`${attrName}DisableCreateDocFlag`]:true
        });
        insertGscEnquiryLog && insertGscEnquiryLog(logName, '');
    }

    handleReportToChanged = (event, attrName) => {
        let val = event.value;
        if (val === 'OTH') {
            this.setState({
                [`${attrName}SelectValue`]: val,
                [`${attrName}OtherFlag`]: true,
                [`${attrName}SelectValFlag`]: true,
                [`${attrName}EditFlag`]: true
            });
        } else {
            this.setState({
                [`${attrName}EditFlag`]: true,
                [`${attrName}SelectValue`]: val,
                [`${attrName}OtherFlag`]: false,
                [`${attrName}SelectValFlag`]: val == '' ? false : true,
                [`${attrName}TextValue`]: ''
            });
        }
    }

    handleTextChange = (event, attrName) => {
        this.setState({
            [`${attrName}EditFlag`]: true,
            [`${attrName}TextValue`]: this.cutOutString(event?.target.value, 995) // resonText 后端会拼接上别的字符串
        });
    }

    handleTextBlur = (event, attrName) => {
        let value = _.trim(event?.target.value);
        this.setState({
            [`${attrName}TextValue`]: value
            // errorFlag: value === '' ? true : false
        });
    }

    handleCreateReport = (clinicalDocumentType) => {
        const { selectedRowId, insertGscEnquiryLog } = this.props;
        let {
            chtCheckBoxValue, g6pdCheckBoxValue,
            chtSelectValue, g6pdSelectValue,
            chtReasonFlag, g6pdReasonFlag
        } = this.state;
        let chtVal = clinicalDocumentType === 'CHT' ? chtCheckBoxValue : '';
        let g6pdVal = clinicalDocumentType === 'G6PD' ? g6pdCheckBoxValue : '';
        let reasonFlag = clinicalDocumentType === 'CHT' ? chtReasonFlag : g6pdReasonFlag;
        let reason = clinicalDocumentType === 'CHT' ? chtSelectValue : g6pdSelectValue;
        let apiUrl = '/cgs-consultation/geneticScreening/getPatientKey';
        let logName = `[Report Details Dialog] Action: Click 'Create Clinical Document' button in ${clinicalDocumentType}`;
        if (chtVal == '' && g6pdVal == '') {
            let payload = {
                msgCode: '130301',
                params: [
                    { name: 'HEADER', value: `${clinicalDocumentType} Screening` },
                    { name: 'MESSAGE', value: 'Please select Screening Result' }]
            };
            this.props.openCommonMessage(payload);
        }
        else if (reasonFlag && !reason) {
            let payload = {
                msgCode: '130301',
                params: [
                    { name: 'HEADER', value: `${clinicalDocumentType} Screening` },
                    { name: 'MESSAGE', value: ' You must make at least one selection' }]
            };
            this.props.openCommonMessage(payload);
        } else {
            this.props.openCommonCircularDialog();
            this.props.getLabReportPatientKey({
                params: { neonatalScrnId: selectedRowId }, callback: (data) => {
                    this.props.closeCommonCircularDialog();
                    let result = data.data;
                    if (data.respCode == 0) {
                        if (result == null) {
                            let payload = {
                                msgCode: '102630',
                                btnActions: {
                                    btn1Click: () => {
                                        insertGscEnquiryLog && insertGscEnquiryLog(logName, apiUrl);
                                        this.handleSaveDocCreate(clinicalDocumentType, selectedRowId);
                                    },
                                    btn2Click: () => {
                                        let name = commonUtils.commonMessageLog('102630', 'No');
                                        insertGscEnquiryLog && insertGscEnquiryLog(name, apiUrl);
                                    }
                                }
                            };
                            this.props.openCommonMessage(payload);
                        } else {
                            let payload = {
                                msgCode: '102620',
                                params: [{ name: 'title', value: result }],
                                btnActions: {
                                    btn1Click: () => {
                                        insertGscEnquiryLog && insertGscEnquiryLog(logName, apiUrl);
                                        let pmi = result;
                                        let reg = /^T/i;
                                        let isTemporaryPmi = reg.test(pmi);
                                        if (isTemporaryPmi) {
                                            pmi = pmi.replace(reg,'');
                                        }
                                        this.handleSaveDocCreate(clinicalDocumentType, selectedRowId,parseInt(pmi));
                                    },
                                    btn2Click: () => {
                                        let name = `Action: Click 'No' button in message dialog (message code: 102620; message: Use PMI:${result} to create Clinical Document?);`;
                                        insertGscEnquiryLog && insertGscEnquiryLog(name, apiUrl);
                                    }
                                }
                            };
                            this.props.openCommonMessage(payload);
                        }
                    }
                }
            });
        }
    }

    cutOutString = (value, maxValue) => {
        let countIn = 0;
        let realCount = 0;
        for (let i = 0; i < value.length; i++) {
            const element = value.charCodeAt(i);
            if (element >= 0 && element <= 255) {
                if (countIn + 1 > maxValue) {
                    break;
                } else {
                    countIn += 1;
                    realCount++;
                }
            } else {
                if (countIn + 3 > maxValue) {
                    break;
                } else {
                    countIn += 3;
                    realCount++;
                }
            }
        }
        return value ? value.slice(0, realCount) : value;
    }

    render() {
        const { classes, open, clinicalDocumentType, reScreenRoleFlag = false, clinicalDocumentChtSts, clinicalDocmentg6pdSts } = this.props;
        let {
            checkBoxList, blob,
            ReportDataHtmlFlag, reasonDrop,
            chtSelectValue, g6pdSelectValue,
            chtTextValue, g6pdTextValue,
            chtReasonFlag, g6pdReasonFlag,
            chtErrorFlag, g6pdErrorFlag,
            chtCheckBoxValue, g6pdCheckBoxValue,
            chtOtherFlag, g6pdOtherFlag,
            chtDisableSaveFlag,
            g6pdDisableSaveFlag,
            chtDisableCreateDocFlag,
            g6pdDisableCreateDocFlag,
            chtDisableRescreen, g6pdDisableRescreen
        } = this.state;
        let inputProps = {
            InputProps: {
                classes: {
                    multiline: classes.multilineInput
                }
            },
            inputProps: {
                className: classes.inputProps,
                maxLength: 1000
            }
        };
        return (
            <EditTemplateDialog
                ref={this.content}
                dialogTitle="Report Details"
                open={open}
                id={Math.random()}
                classes={{ paper: classes.paper }}
                handleEscKeyDown={() => this.handleCancelResult()}
                formControlStyle={{ overflow: 'auto' }}
            >
                <Typography component="div" id={'reportDetailsDialog'} className={classes.divConten}>
                    <Grid container>
                        <Grid item xs={12}>
                            {
                                ReportDataHtmlFlag ?
                                    <Typography className={classes.right_warp} component="div">
                                        <PdfJsViewer
                                            scale={0.9}
                                            height={570}
                                            url={{ url: this.handleReportpdfUrl(blob) }}
                                            disablePrint
                                        />
                                    </Typography>
                                    :
                                    <Typography className={classes.right_html} component="div">
                                        <Typography component="div" style={{ height: '45%', width: 500 }}></Typography>
                                        <Typography component="div" className={classes.right_html_div}>
                                            <label className={classes.right_html_div_label}>{blob}</label>
                                        </Typography>
                                    </Typography>
                            }
                        </Grid>
                    </Grid>

                    {clinicalDocumentType !== 'G6PD' ? (
                        <CIMSFormLabel
                            labelText={clinicalDocumentType === 'CHT/G6PD' ? 'CHT Screening' : 'Screening Result'}
                            FormLabelProps={{
                                className: classes.labelText
                            }}
                            style={{ marginTop: 10 }}
                        >
                            <Typography component="div" style={{ paddingTop: 10 }}>
                                <Grid container alignItems="center">
                                    <Grid item xs={3} style={{ marginLeft: 10, maxWidth: '24%', flexBasis: '24%' }}>
                                        {checkBoxList['CHT'].map((item, index) => {
                                            return (
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            disabled={chtDisableSaveFlag}
                                                            color="primary"
                                                            checked={item.value === chtCheckBoxValue}
                                                            onClick={(e) => this.handleCheckBoxChange(e, item.value, 'cht')}
                                                            className={classes.checkPadding}
                                                        />}
                                                    key={index}
                                                    label={item.label}
                                                    value={item.value}
                                                    classes={{ label: classes.controlLabel, disabled: classes.disabledLabel }}
                                                />
                                            );
                                        })}
                                    </Grid>
                                    <Grid item xs={5} style={{ width: 200, maxWidth: '38%', flexBasis: '38%' }}>
                                        <div style={{ display: chtReasonFlag ? 'block' : 'none' }}>
                                            <ValidatorForm style={{ height: '100%' }} id="ixForm" onSubmit={() => { }}>
                                                <div className={classes.flexCenter}>
                                                    <label>Reason:</label>
                                                    <CustomizedSelectFieldValidator
                                                        id="reason"
                                                        options={reasonDrop.map(items => {
                                                            return {
                                                                label: items.label,
                                                                value: items.value
                                                            };
                                                        })}
                                                        isDisabled={false}
                                                        value={chtSelectValue}
                                                        menuPortalTarget={document.body}
                                                        styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                                        onChange={event => { this.handleReportToChanged(event, 'cht'); }}
                                                    />
                                                </div>
                                            </ValidatorForm>
                                        </div>
                                    </Grid>
                                    <Grid item xs={4} style={{ maxWidth: '36%', flexBasis: '36%' }}>
                                        <div style={{ display: chtOtherFlag ? 'block' : 'none' }}>
                                            <Typography component="div">
                                                <TextField
                                                    id={'text'}
                                                    autoCapitalize="off"
                                                    variant="outlined"
                                                    type="text"
                                                    value={chtTextValue}
                                                    multiline
                                                    rows={3}
                                                    className={classes.inputField}
                                                    onChange={e => this.handleTextChange(e, 'cht')}
                                                    onBlur={e => this.handleTextBlur(e, 'cht')}
                                                    error={chtErrorFlag}
                                                    {...inputProps}
                                                />
                                                {chtErrorFlag ? (
                                                    <FormHelperText
                                                        error
                                                        classes={{
                                                            error: classNames(classes.helperTextError, {
                                                                [classes.background]: false
                                                            })
                                                        }}
                                                    >
                                                        This field is required.
                                                    </FormHelperText>
                                                ) : null
                                                }
                                            </Typography>
                                        </div>
                                    </Grid>
                                </Grid>
                            </Typography>
                            <Typography component="div">
                                <Grid container justify="flex-end">
                                    <CIMSButton
                                        classes={{ label: classes.fontLabel }}
                                        color="primary"
                                        id="btn_report_save"
                                        size="small"
                                        disabled={chtDisableSaveFlag}
                                        onClick={() => this.handleSave('CHT')}
                                    >Save
                                    </CIMSButton>
                                    <CIMSButton
                                        classes={{ label: classes.fontLabel }}
                                        color="primary"
                                        id="btn_report_cancel"
                                        onClick={() => this.handleCancelResult('CHT')}
                                        size="small"
                                    >
                                        Cancel
                                    </CIMSButton>
                                    <CIMSButton
                                        classes={{ label: classes.fontLabel }}
                                        color="primary"
                                        id="btn_report_create"
                                        size="small"
                                        disabled={chtDisableCreateDocFlag}
                                        onClick={() => this.handleCreateReport('CHT')}
                                    >Create Clinical Document
                                    </CIMSButton>
                                    <CIMSButton
                                        style={{ display: reScreenRoleFlag && clinicalDocumentChtSts === 'C' ? 'block' : 'none' }}
                                        classes={{ label: classes.fontLabel }}
                                        color="primary"
                                        id="btn_rescreen_rebtn"
                                        size="small"
                                        disabled={chtDisableRescreen || clinicalDocumentChtSts !== 'C'}
                                        onClick={() => this.handleReScreen('cht')}
                                    >Re-Screen
                                    </CIMSButton>
                                </Grid>
                            </Typography>
                        </CIMSFormLabel>
                        // <Typography component="div" className={classes.btnDiv}>
                        //     <Typography style={{ fontWeight: 'bold' }} component="div">
                        //         {clinicalDocumentType === 'CHT/G6PD' ? 'CHT Screening' : 'Screening Result'}
                        //     </Typography>

                        // </Typography>
                    ) : null}

                    {clinicalDocumentType !== 'CHT' ? (
                        <CIMSFormLabel
                            labelText={clinicalDocumentType === 'CHT/G6PD' ? 'G6PD Screening' : 'Screening Result'}
                            FormLabelProps={{
                                className: classes.labelText
                            }}
                            style={{ marginTop: 10 }}
                        >
                            <Typography component="div" style={{ paddingTop: 10 }}>
                                <Grid container alignItems="center">
                                    <Grid item xs={3} style={{ marginLeft: 10, maxWidth: '24%', flexBasis: '24%' }}>
                                        {checkBoxList['G6PD'].map((item, index) => {
                                            return (
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            disabled={g6pdDisableSaveFlag}
                                                            color="primary"
                                                            checked={item.value === g6pdCheckBoxValue}
                                                            onClick={(e) => this.handleCheckBoxChange(e, item.value, 'g6pd')}
                                                            className={classes.checkPadding}
                                                        />}
                                                    key={index}
                                                    label={item.label}
                                                    value={item.value}
                                                    classes={{ label: classes.controlLabel, disabled: classes.disabledLabel }}
                                                />
                                            );
                                        })}
                                    </Grid>
                                    <Grid item xs={5} style={{ width: 200, maxWidth: '38%', flexBasis: '38%' }}>
                                        <div style={{ display: g6pdReasonFlag ? 'block' : 'none' }}>
                                            <ValidatorForm style={{ height: '100%' }} id="ixForm" onSubmit={() => { }}>
                                                <div className={classes.flexCenter}>
                                                    <label>Reason:</label>
                                                    <CustomizedSelectFieldValidator
                                                        id="reason"
                                                        options={reasonDrop.map(items => {
                                                            return {
                                                                label: items.label,
                                                                value: items.value
                                                            };
                                                        })}
                                                        isDisabled={false}
                                                        value={g6pdSelectValue}
                                                        menuPortalTarget={document.body}
                                                        styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                                        onChange={event => { this.handleReportToChanged(event, 'g6pd'); }}
                                                    />
                                                </div>
                                            </ValidatorForm>
                                        </div>
                                    </Grid>
                                    <Grid item xs={4} style={{ maxWidth: '36%', flexBasis: '36%' }}>
                                        <div style={{ display: g6pdOtherFlag ? 'block' : 'none' }}>
                                            <Typography component="div">
                                                <TextField
                                                    id={'text'}
                                                    autoCapitalize="off"
                                                    variant="outlined"
                                                    type="text"
                                                    value={g6pdTextValue}
                                                    multiline
                                                    rows={3}
                                                    className={classes.inputField}
                                                    onChange={e => this.handleTextChange(e, 'g6pd')}
                                                    onBlur={e => this.handleTextBlur(e, 'g6pd')}
                                                    error={g6pdErrorFlag}
                                                    {...inputProps}
                                                />
                                                {g6pdErrorFlag ? (
                                                    <FormHelperText
                                                        error
                                                        classes={{
                                                            error: classNames(classes.helperTextError, {
                                                                [classes.background]: false
                                                            })
                                                        }}
                                                    >
                                                        This field is required.
                                                    </FormHelperText>
                                                ) : null
                                                }
                                            </Typography>
                                        </div>
                                    </Grid>
                                </Grid>
                            </Typography>
                            <Typography component="div">
                                <Grid container justify="flex-end">
                                    <CIMSButton
                                        classes={{ label: classes.fontLabel }}
                                        color="primary"
                                        id="btn_report_save"
                                        size="small"
                                        disabled={g6pdDisableSaveFlag}
                                        onClick={() => this.handleSave('G6PD')}
                                    >Save
                                    </CIMSButton>
                                    <CIMSButton
                                        classes={{ label: classes.fontLabel }}
                                        color="primary"
                                        id="btn_report_cancel"
                                        onClick={() => this.handleCancelResult('G6PD')}
                                        size="small"
                                    >
                                        Cancel
                                    </CIMSButton>
                                    <CIMSButton
                                        classes={{ label: classes.fontLabel }}
                                        color="primary"
                                        id="btn_report_create"
                                        size="small"
                                        disabled={g6pdDisableCreateDocFlag}
                                        onClick={() => this.handleCreateReport('G6PD')}
                                    >Create Clinical Document
                                    </CIMSButton>
                                    <CIMSButton
                                        style={{ display: reScreenRoleFlag && clinicalDocmentg6pdSts === 'C' ? 'block' : 'none' }}
                                        classes={{ label: classes.fontLabel }}
                                        color="primary"
                                        id="btn_rescreen_rebtn"
                                        size="small"
                                        disabled={g6pdDisableRescreen || clinicalDocmentg6pdSts !== 'C'}
                                        onClick={() => this.handleReScreen('g6pd')}
                                    >Re-Screen
                                    </CIMSButton>
                                </Grid>
                            </Typography>
                        </CIMSFormLabel>
                    ) : null}
                </Typography>
            </EditTemplateDialog>
        );
    }
}



const mapStateToProps = state => ({
    commonMessageDetail: state.message.commonMessageDetail,
    patientInfo: state.patient.patientInfo,
    common: state.common,
    accessRights: state.login.accessRights
});

const mapDispatchToProps = {
    openCommonMessage,
    closeCommonMessage,
    openCommonCircularDialog,
    closeCommonCircularDialog,
    saveLabReportCreate,
    saveLabReport,
    getLabReportPatientKey,
    getGscLabReportPdf,
    strCommonMessage,
    refreshPatient
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ReportDialog));