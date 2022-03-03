import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Form } from 'react-formio';
import {
    updateState,
    saveEformResult,
    handleClose,
    deleteEformResult,
    markComplete
} from '../../../../store/actions/certificate/certificateEform';
import { EFORM_RESULT_STATUS, PAGESTATUS } from '../../../../enums/certificate/certEformEnum';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import {
    closeCommonCircular,
    openCommonCircular
} from '../../../../store/actions/common/commonAction';
import _ from 'lodash';
import { print, printWithRetryDefault } from '../../../../utilities/printUtilities';
import * as CertUtil from '../../../../utilities/certificateUtilities';
import moment from 'moment';
import * as jsPDF from 'jspdf';
import AccessRightEnum from '../../../../enums/accessRightEnum';
import { getMenuLabel, sleep } from '../../../../utilities/commonUtilities';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import { updateCurTab, deleteSubTabs } from '../../../../store/actions/mainFrame/mainFrameAction';
import { auditAction } from '../../../../store/actions/als/logAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import doCloseFuncSrc from '../../../../constants/doCloseFuncSrc';
import { getLoginName } from '../../../../store/sagas/certificate/certificateEform/eFormFunctionANT';

class EForm extends React.Component {
    constructor(props) {
        super(props);

        this.scssTocss = null;

        this.state = {
            isLoading: true,
            isFormDialogOpen: false,
            isPrinting: false,
            zoomRatio: 1.5,
            dialogZoomRatio: 1,
            isScaleOutOfScreen: false,
            isDialogScaleOutOfScreen: false,
            scss: '',
            css: '',
            eFormImg64Data: null,
            imageBlockList: null,
            finishedCompileCss: false
        };
    }

    componentDidMount() {
        // this.initSassWorker();
        this.handleOnChange('isLoading', false, () => {
            let workerPath = null;
            if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
                workerPath = 'js/sass/sass.worker.js';
            this.scssTocss = new window.Sass(workerPath);
            if (this.scssTocss)
                this.props.auditAction(' [EFORM] CSS loader ready ', null, null, false, 'clinical-doc');
            else
                this.props.auditAction(` [EFORM] Cannot create CSS loader. workerPath: ${workerPath} `, null, null, false, 'clinical-doc');
        });

        this.props.updateCurTab(AccessRightEnum.certificateEform, this.handleDirtyClose);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            eformObject,
            eformSubmission,
            eformSubmissionSync,
            eformParams
        } = this.props;

        const {
            isLoading,
            zoomRatio,
            dialogZoomRatio
        } = this.state;

        if (eformSubmission !== prevProps.eformSubmission) {
            if (eformSubmissionSync) {
                this.syncSubmission();
            }
        }

        if (!isLoading) {
            if (eformObject && eformObject !== prevProps.eformObject) {
                this.handleScss2Css(eformObject.scss);

                const allCalendar = document.querySelectorAll('.flatpickr-calendar');

                allCalendar && allCalendar.forEach((calendar) => {
                    calendar.remove();
                });

                this.handleFromLayoutZoomRatio(eformParams.open);
            }

            if (prevState.zoomRatio !== zoomRatio) {
                this.handleScaleOutOfScreen(false);
            }

            if (prevState.dialogZoomRatio !== dialogZoomRatio) {
                this.handleScaleOutOfScreen(true);
            }

            if (eformParams.open !== prevProps.eformParams.open) {
                this.handleFromLayoutZoomRatio(eformParams.open);
            }
        }
    }

    componentWillUnmount() {
        this.scssTocss && this.scssTocss.destroy();
    }

    initSassWorker = async () => {
        const {
            auditAction
        } = this.props;

        let workerPath = null;

        if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
            workerPath = 'js/sass/sass.worker.js';
        this.scssTocss = new window.Sass(workerPath);
        await sleep(500);
        if (!this.scssTocss) {
            auditAction(` Cannot create css loader, retry once after 1 second. workerPath: ${workerPath} `, null, null, false, 'clinical-doc');
            await sleep(1000);
            this.scssTocss = new window.Sass(workerPath);
            await sleep(500);
            if (!this.scssTocss) {
                auditAction(` Still cannot create css loader after retry. workerPath: ${workerPath} `, null, null, false, 'clinical-doc');
            }
        }
        else {
            // auditAction(` Success to create css loader. workerPath: ${workerPath} `, null, null, false, 'clinical-doc');
        }

        this.handleOnChange('isLoading', false);
    }

    getIsPrintOnly = () => {
        const {
            eformList,
            eformTemplate
        } = this.props;

        if (eformList && eformTemplate)
            return eformList.find(item => item.outDocTypeId === eformTemplate.eformId)?.isPrintOnly;
    }

    getFormScale = () => {
        const {
            eformList,
            eformTemplate
        } = this.props;
        return eformList.find(item => item.outDocTypeId === eformTemplate.eformId)?.scaleUp ?? 2;
    }

    getWebform = () => {
        return this.state.isFormDialogOpen ? this.eFormRefDialog?.instance?.instance : this.eFormRef?.instance?.instance;
    }

    syncSubmission = async () => {
        const {
            eformSubmission,
            updateState
        } = this.props;

        const webform = this.getWebform();

        let state = {};

        if (webform) {
            await webform.setSubmission({data: {...eformSubmission}});
            await new Promise((resolve) => {
                setTimeout(() => {
                    const webformData = _.cloneDeep(webform.submission.data);
                    state = {...state, eformSubmissionOriginal: webformData};
                    resolve();
                }, 0);
            });
        }

        state = {...state, eformSubmissionSync: false};
        updateState(state);
    }

    handleOnChange = (key, value, callback = null) => {
        this.setState({
            ...this.state,
            [key]: value
        }, () => {
            callback && callback();
        });
    }

    handleDirtyClose = (callback = null, doCloseParams = null) => {
        const {
            deleteSubTabs,
            pageStatus,
            updateState,
            handleClose,
            eformSubmission,
            eformSubmissionOriginal,
            auditAction,
            openCommonMessage
        } = this.props;

        const isDirty = () => {
            const comparator = (left, right, key) => {
                return (_.isEmpty(left) && _.isEmpty(right)) ? true : undefined;
            };

            return !_.isEqualWith(eformSubmission, eformSubmissionOriginal, comparator);
        };

        const triggerCloseTab = () => {
            auditAction(AlsDesc.CLOSE, null, null, false, 'clinical-doc');
            deleteSubTabs(AccessRightEnum.certificateEform);
            callback && callback(true);
        };

        const triggerSaveDiscardDialog = (discardCallback) => {
            openCommonMessage({
                msgCode: '110033',
                params: [{name: 'PAGENAME', value: getMenuLabel(AccessRightEnum.certificateEform)}],
                btnActions: {
                    btn1Click: () => {
                        //save
                        this.handleSubmit('SAVE', false, () => triggerCloseTab());
                    },
                    btn2Click: () => {
                        //discard
                        auditAction('Discard Changes', null, null, false, 'clinical-doc');
                        discardCallback(true);
                    }
                }
            });
        };

        const triggerDiscardDialog = () => {
            openCommonMessage({
                msgCode: '110054',
                btnActions: {
                    btn1Click: () => {
                        auditAction('Discard Changes', null, null, false, 'clinical-doc');

                        if(pageStatus === PAGESTATUS.CERT_ADDING) {
                            handleClose();
                        } else {
                            updateState({
                                pageStatus: PAGESTATUS.CERT_SELECTED,
                                eformSubmission: eformSubmissionOriginal,
                                eformSubmissionSync: true
                            });
                        }
                    },
                    btn2Click: () => {
                        auditAction('Keep Editing', null, null, false, 'clinical-doc');
                    }
                }
            });
        };

        switch (doCloseParams.src) {
            case doCloseFuncSrc.CLOSE_BY_MAIN_TAB_CLOSE_BUTTON:
            case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
            case 'bottomClose':
                isDirty() ? triggerSaveDiscardDialog(() => callback(true)) : triggerCloseTab();
                break;
            case 'bottomCancel':
                isDirty() ? triggerDiscardDialog() : handleClose();
                break;
            case doCloseFuncSrc.CLOSE_BY_LOGOUT:
            case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
                isDirty() ? this.handleSubmit('SAVE', false, () => callback(true)) : callback(true);
                break;
            default:
                triggerCloseTab();
                break;
        }
    }

    handleScss2Css = (scss) => {
        if (this.scssTocss && scss) {
            this.scssTocss.compile(`.eFormSection{${scss}}`, (result) => {
                this.handleOnChange('css', result.text);
                this.props.auditAction(' [EFORM] Finished compile css ', null, null, false, 'clinical-doc');
                this.setState({
                    finishedCompileCss: true
                });
            });
        }
        else if (!this.scssTocss) {
            this.props.auditAction(' [EFORM] Want to compile scss but css loader not ready ', null, null, false, 'clinical-doc');
        }
    }

    handleFromPrint = (eFormImg64Data, isCcp = true) => {
        if (isCcp) {
            const {
                eformList,
                eformTemplate
            } = this.props;

            printWithRetryDefault({
                base64: eFormImg64Data,
                callback: () => {},
                copies: 1,
                isShrinkPage: true,
                printQueue: eformList.find(item => item.outDocTypeId === eformTemplate.eformId)?.isPrintBothside === 1 ? 'CIMS2_LaserPrinter (Both Sides)' :'CIMS2_LaserPrinter'
            });
        } else {
            const eFormIframe = document.createElement('iframe');
            eFormIframe.id = 'eFormIframe';
            eFormIframe.setAttribute('style', 'position: fixed; left: -9999px;');
            document.body.appendChild(eFormIframe);
            const frameDoc = eFormIframe.contentWindow ? eFormIframe.contentWindow : eFormIframe.contentDocument.document ? eFormIframe.contentDocument.document : eFormIframe.contentDocument;
            frameDoc.document.write('<html><head></head><body style="text-align: center; margin: 0; overflow: hidden;">');
            frameDoc.document.write(this.state.imageBlockList.innerHTML);
            frameDoc.document.write('</body></html>');
            frameDoc.document.close();

            setTimeout(() => {
                frameDoc.focus();
                frameDoc.print();
                document.body.removeChild(eFormIframe);
            }, 500);
        }
    }

    preHandleEformDataBeforeEdit = (webform) => {
        const {
            eformObject
        } = this.props;

        let data = _.cloneDeep(webform.submission.data);
        switch (eformObject.functionName){
            case 'referralConsultationRequest': {
                data = {
                    ...data,
                    doctorFullName: getLoginName(this.props.login, false),
                    doctorsFullName: getLoginName(this.props.login, false)
                };
                break;
            }
        }

        return data;
    }

    preHandleEformDataBeforeSave = (webform) => {
        const {
            eformObject
        } = this.props;

        let data = _.cloneDeep(webform.submission.data);
        switch (eformObject.functionName){
            case 'referralConsultationRequest': {
                const currentMoment = moment();
                data = {
                    ...data,
                    dateTime: currentMoment,
                    dateTime2: currentMoment,
                    dateTime5: currentMoment,
                    page2DateTime: currentMoment
                };
                break;
            }
        }

        return data;
    }

    preHandleEformData = (actType) => {
        const {
            eFormImg64Data
        } = this.state;

        const {
            eformSubmission,
            eformObject
        } = this.props;

        let params = { formData: eformSubmission, fileStream: eFormImg64Data };
        if (actType === 'SAVE' || actType === 'SAVE_PRINT') {
            switch (eformObject.functionName){
                case 'defaulterTracingLetter': {
                    params = {
                        ...params,
                        formData: {
                            ...params.formData,
                            printDate: moment()
                        }
                    };
                    break;
                }
                case 'certificateOfAttendance': {
                    params = {
                        ...params,
                        formData: {
                            ...params.formData,
                            printDate: moment(),
                            printedBy: getLoginName(this.props.login, true),
                            certifyCaseNo: params.formData.certifyCaseNo === '---' ? '' : params.formData.certifyCaseNo,
                            patientCaseNo: params.formData.patientCaseNo === '---' ? '' : params.formData.patientCaseNo,
                            accompanyCaseNo: params.formData.accompanyCaseNo === '---' ? '' : params.formData.accompanyCaseNo
                        }
                    };
                    break;
                }
                case 'confinementLetter': {
                    params = {
                        ...params,
                        formData: {
                            ...params.formData,
                            printDate1: moment(),
                            printBy: getLoginName(this.props.login, true)
                        }
                    };
                    break;
                }
                case 'sickLeaveLetter': {
                    params = {
                        ...params,
                        formData: {
                            ...params.formData,
                            printDate: moment(),
                            printBy: getLoginName(this.props.login, true)
                        }
                    };
                    break;
                }
                case 'referralToIFSC': {
                    params = {
                        ...params,
                        formData: {
                            ...params.formData,
                            printDate: moment(),
                            printedBy: getLoginName(this.props.login, true)
                        }
                    };
                    break;
                }
                case 'smokingCessationHotline': {
                    params = {
                        ...params,
                        formData: {
                            ...params.formData,
                            printDate: moment(),
                            printedBy: getLoginName(this.props.login, true)
                        }
                    };
                    break;
                }
                case 'InformingHBsAg': {
                    params = {
                        ...params,
                        formData: {
                            ...params.formData,
                            printDate: moment(),
                            printedBy: getLoginName(this.props.login, false)
                        }
                    };
                    break;
                }
                case 'InformingRubella': {
                    params = {
                        ...params,
                        formData: {
                            ...params.formData,
                            printDate: moment(),
                            printedBy: getLoginName(this.props.login, false)
                        }
                    };
                    break;
                }
            }
        }
        return params;
    }

    handleSubmit = (actType, isFormDialogOpen = false, savedCallback = null) => {
        const {auditAction, encounterInfo, eformTemplate} = this.props;
        const patientKey = encounterInfo.patientKey || null;
        const templateName = eformTemplate?.clcEtemplateDto?.etemplateName || '';
        const templateId = eformTemplate?.clcEtemplateDto?.etemplateId || '';
        auditAction(` handle submit in e-form ( before conversion ), action type: ${actType||''} , template id: ${templateId} , template name: ${templateName} `, null, null, false, 'clinical-doc');
        if (this.eFormRef || this.eFormRefDialog) {
            const formioRef = isFormDialogOpen ? this.eFormRefDialog.formio : this.eFormRef.formio;

            const handleFromToPDFCallback = () => {
                const {
                    eFormImg64Data
                } = this.state;

                let params = this.preHandleEformData(actType);

                const saveEformResultCallback = (result) => {
                    if (actType !== 'PRINT') {
                        this.props.svcOptsFiltering(result);
                    }

                    if (actType !== 'SAVE') {
                        this.handleFromPrint(eFormImg64Data.split(',')[1]);
                    }

                    savedCallback && savedCallback();
                };

                if (actType !== 'PRINT') {
                    auditAction(` handle submit in e-form ( after conversion ), action type: ${actType||''}, template id: ${templateId} , template name: ${templateName} `, null, null, false, 'clinical-doc');
                    this.props.saveEformResult(actType, params, saveEformResultCallback);
                } else {
                    auditAction(` handle submit in e-form ( ready to print ), action type: ${actType||''}, template id: ${templateId} , template name: ${templateName} `, null, null, false, 'clinical-doc');
                    this.handleFromPrint(eFormImg64Data.split(',')[1]);
                }

            };

            formioRef.submit().then(() => {
                this.handleFromToPDF(isFormDialogOpen, handleFromToPDFCallback, actType);
            }).catch((errors) => {
                document.getElementById(errors[0].component.id).scrollIntoView();
            });
        }
    }

    handleFromToPDF = (fromDialog = false, callback = null, actType) => {
        const {
            openCommonCircular,
            closeCommonCircular,
            pageStatus,
            updateState
        } = this.props;
        const formToPDF = fromDialog ? this.formToPDF_dialog : this.formPDF;
        const dateTimeInputList = formToPDF.getElementsByClassName('formio-component-datetime');
        const formioTab = this.eFormRef.formio.getComponent('tabs');

        const imageList = [];
        let index = 0;

        const formScale = this.getFormScale();

        const handlePrintStyle = (dateTimeInputList, afterPrint = false, callback = null) => {
            const webform = this.getWebform();

            const data = (actType === 'SAVE' || actType === 'SAVE_PRINT') ? this.preHandleEformDataBeforeSave(webform) : _.cloneDeep(webform.submission.data);
            updateState({
                pageStatus: afterPrint ? pageStatus : PAGESTATUS.CERT_PRINTING,
                eformSubmission: data,
                eformSubmissionSync: true
            });

            setTimeout(() => {
                afterPrint ? formToPDF.classList.remove('printStyle') : formToPDF.classList.add('printStyle');

                document.getElementById('imageBlockList') && document.getElementById('imageBlockList').remove();

                document.getElementsByTagName('body')[0].style.overflow = afterPrint ? 'auto' : 'hidden';

                for (const key in dateTimeInputList) {
                    const input = dateTimeInputList[key].querySelector ? dateTimeInputList[key].querySelector('.input') : null;

                    if (input) {
                        input.placeholder = afterPrint ? 'dd-MM-yyyy' : '';
                    }
                }

                callback && callback();
            }, 1000);
        };

        const htmlToImage = () => {
            const allTabs = document.querySelectorAll('.formToPDF .card-body.tab-pane');

            window.html2canvas(formToPDF, {
                scale: formScale
            }).then((canvas) => {
                canvas.toBlob((blob) => {
                    const blobUrl = URL.createObjectURL(blob);

                    const image = document.createElement('img');
                    image.src = blobUrl;
                    image.setAttribute('style', 'width: 100%;');

                    const imageBlock = document.createElement('div');
                    imageBlock.className = 'imageBlock';

                    imageBlock.appendChild(image);

                    imageList.push(imageBlock);

                    if (formioTab && index < formioTab.component.components.length) {
                        // formioTab.setTab(index);

                        allTabs.forEach(tab => {
                            tab.style.display = 'none';
                        });

                        allTabs[index].style.display = 'block';

                        htmlToImage();
                    } else {
                        const imageBlockList = document.createElement('div');
                        imageBlockList.id = 'imageBlockList';

                        imageList.forEach(imageBlock => {
                            imageBlockList.appendChild(imageBlock);
                        });

                        this.formLayout.appendChild(imageBlockList);

                        this.handleOnChange('imageBlockList', imageBlockList, () => {
                            imageToPDF();
                        });
                    }
                }, 'image/png');
            });

            index++;
        };

        const imageToPDF = () => {
            const splitImage = (img, canvas, splitNum, doc, CCPprint) => {
                const ctx = canvas.getContext('2d'),
                    imageParts = [];

                const w2 = img.width,
                    h2 = img.height / splitNum;

                for (let i = 0; i < splitNum; i++) {

                    let x = 0,
                        y = -(h2 * i);

                    canvas.width = w2;
                    canvas.height = h2;

                    ctx.drawImage(img, x, y, w2, h2 * splitNum);
                    imageParts.push(canvas.toDataURL());
                }

                CCPprint && CCPprint(canvas, doc, imageParts, img.width > img.height / splitNum ? 'l' : 'p');
            };

            const exportPDF64Data = (canvas, doc, imageParts, orientation) => {
                imageParts.forEach((val, key, arr) => {
                    doc.addImage(val, 'png', 0, 0, orientation === 'l' ? 297 : 210, orientation === 'l' ? 210 : 297, null, 'SLOW');

                    if (!Object.is(arr.length - 1, key)) {
                        doc.addPage();
                    }
                });

                this.handleOnChange('eFormImg64Data', doc.output('dataurlstring'), () => {
                    handlePrintStyle(dateTimeInputList, true, () => {
                        this.handleOnChange('isPrinting', false, () => {
                            callback && callback();

                            closeCommonCircular();
                        });
                    });
                });
            };

            window.html2canvas(document.getElementById('imageBlockList'), {
                scale: formScale,
                useCORS: true
            }).then((canvas) => {
                const dpi = 96, mm = 25.4,
                    fullPdfWidthPx = parseInt(canvas.style.width, 10),
                    fullPdfHeightPx = parseInt(canvas.style.height, 10),
                    fullPdfWidthMm = (fullPdfWidthPx / dpi * mm).toFixed(0),
                    fullPdfHeightMm = (fullPdfHeightPx / dpi * mm).toFixed(0),
                    pdfTotalPage = (fullPdfWidthMm > 210 ? fullPdfHeightMm / 210 : fullPdfHeightMm / 297).toFixed(0);

                const doc = new jsPDF({
                    orientation: fullPdfWidthMm >= 250 ? 'l' : 'p',
                    unit: 'mm'
                });
                const img = new Image();

                img.src = canvas.toDataURL();
                img.onload = () => {
                    splitImage(img, canvas, pdfTotalPage, doc, exportPDF64Data);
                };
            });
        };

        // Start Printing
        this.handleOnChange('isPrinting', true, () => {
            openCommonCircular();

            let prevOpen = this.props.eformParams.open;

            if(this.props.login.service.svcCd === "SHS" && prevOpen){
                this.props.eformParams.open = !prevOpen;
            }

            handlePrintStyle(dateTimeInputList, false, () => {
                if (formioTab && index <= formioTab.component.components.length) {
                    // formioTab.setTab(0);

                    const allTabs = document.querySelectorAll('.formToPDF .card-body.tab-pane');

                    allTabs.forEach(tab => {
                        tab.style.display = 'none';
                    });

                    allTabs[0].style.display = 'block';
                }

                setTimeout(() => {
                    htmlToImage();
                    this.props.eformParams.open = prevOpen;
                }, 1000);
            });
        });
    }

    handleScaleOutOfScreen = (fromDialog = false) => {
        const eForm = fromDialog ? this.formToPDF_dialog : this.formPDF;

        if (eForm) {
            const eFormLayoutWidth = eForm.getBoundingClientRect().width;
            const parentWidth = eForm.parentElement.parentElement.getBoundingClientRect().width;
            const {
                isScaleOutOfScreen,
                isDialogScaleOutOfScreen
            } = this.state;

            const margin = 20;

            if (fromDialog) {
                if (eFormLayoutWidth > parentWidth - margin && !isDialogScaleOutOfScreen) {
                    this.handleOnChange('isDialogScaleOutOfScreen', true);
                } else if (eFormLayoutWidth < parentWidth - margin && isDialogScaleOutOfScreen) {
                    this.handleOnChange('isDialogScaleOutOfScreen', false);
                }
            } else {
                if (eFormLayoutWidth > parentWidth - margin && !isScaleOutOfScreen) {
                    this.handleOnChange('isScaleOutOfScreen', true);
                } else if (eFormLayoutWidth < parentWidth - margin && isScaleOutOfScreen) {
                    this.handleOnChange('isScaleOutOfScreen', false);
                }
            }
        }
    }

    handleFromLayoutZoomRatio = (isHistoryOpen = true) => {
        setTimeout(() => {
            if (this.formLayout && this.formLayout.getBoundingClientRect()) {
                const boundingClientRect = this.formLayout.getBoundingClientRect();

                const {
                    width,
                    height
                } = boundingClientRect;

                let zoomRatio = 1.5;

                if (width > height) {
                    zoomRatio = isHistoryOpen ? 1.1 : 1.5;
                } else if (height > width) {
                    zoomRatio = isHistoryOpen ? 1.5 : 2;
                }

                this.handleOnChange('zoomRatio', zoomRatio);
            }
        }, 500);
    }

    handleMarkComplete = () => {
        const {selected} = this.props.eformParams;
        this.props.markComplete(selected);
    }

    handleEdit = () => {
        const webform = this.getWebform();
        const data = this.preHandleEformDataBeforeEdit(webform);
        this.props.updateState({pageStatus: PAGESTATUS.CERT_EDITING, eformSubmission: data, eformSubmissionSync: true});
    }

    handleDelete = () => {
        const {
            auditAction,
            deleteEformResult,
            eformParams,
            openCommonMessage,
            svcOptsFiltering
        } = this.props;

        openCommonMessage({
            msgCode: '130903',
            btnActions: {
                btn1Click: () => {
                    // Delete
                    const {selected} = eformParams;
                    deleteEformResult(selected, (result) => {
                        svcOptsFiltering(result);
                    });
                },
                btn2Click: () => {
                    // Cancel
                    auditAction('Cancel Delete', null, null, false, 'clinical-doc');
                }
            }
        });
    }

    isEnableMarkCompleteBtn = () => {
        const {pageStatus, eformParams, encounterInfo, eformResult} = this.props;
        const {selected} = eformParams;
        if (pageStatus === PAGESTATUS.CERT_SELECTED && selected && encounterInfo) {
            const selectedResult = eformResult && eformResult.find(x => x.eformResultId === selected);
            const crossEncntrAllow = selectedResult && selectedResult.clcMapEformEtemplateDto && selectedResult.clcMapEformEtemplateDto.crossEncntrAllow;
            if (selectedResult) {
                if (moment(encounterInfo.encounterDate).isSame(moment(), 'day')) {
                    if (selectedResult && selectedResult.status === EFORM_RESULT_STATUS.INCOMPLETED) {
                        if (parseInt(crossEncntrAllow) === 1) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    isEnableEditBtn = (params) => {
        const { encounterInfo, eformResult, selected } = params;
        if (selected && encounterInfo) {
            const selectedResult = eformResult && eformResult.find(x => x.eformResultId === selected);
            const crossEncntrAllow = selectedResult && selectedResult.clcMapEformEtemplateDto && selectedResult.clcMapEformEtemplateDto.crossEncntrAllow;
            if (selectedResult) {
                // if (moment(encounterInfo.encounterDate).isSame(moment(), 'day')) {
                    // if (parseInt(crossEncntrAllow) === 0) {
                    //     if (encounterInfo.encounterId === selectedResult.encntrId) {
                    //         return true;
                    //     }
                    // }
                    // if (parseInt(crossEncntrAllow) === 1) {
                    //     return true;
                    // }
                // }
                return true;
            }
        }
        return false;
    }

    isEnableDeleteBtn = (params) => {
        return this.isEnableEditBtn(params);
    }

    render() {
        const {
            isPrinting,
            isFormDialogOpen,
            zoomRatio,
            dialogZoomRatio,
            isScaleOutOfScreen,
            isDialogScaleOutOfScreen,
            css
        } = this.state;

        const {
            classes,
            updateState,
            eformParams,
            eformResult,
            eformObject,
            eformSubmission,
            eformSubmissionOriginal,
            eformSiteId,
            loginSiteId,
            pageStatus,
            encounterInfo
        } = this.props;

        const {
            svcCd,
            siteId,
            selected,
            // dateFrom,
            // dateTo,
            open
        } = eformParams;

        const enableMarkComplete = this.isEnableMarkCompleteBtn();

        const enableEdit = this.isEnableEditBtn({
            selected: selected,
            encounterInfo: encounterInfo,
            eformResult: eformResult
        });

        const enableDelete = this.isEnableDeleteBtn({
            selected: selected,
            encounterInfo: encounterInfo,
            eformResult: eformResult
        });

        const isPrintOnly = this.getIsPrintOnly();

        return (
            <Grid item container>
                <style id="eFormCssStyle" dangerouslySetInnerHTML={{
                    __html: css
                }}
                />

                <Grid item container className="react-formio eFormSection">
                    <Paper className={classes.paper}>
                        {
                        <div ref={r => this.formLayout = r} className="formLayout" style={!isPrinting ? {
                            transform: `scale(${zoomRatio})`,
                            transformOrigin: isScaleOutOfScreen ? '0 0' : 'top center',
                            margin: isScaleOutOfScreen && '3px',
                            ...(!(eformObject && eformSubmission) && { display: 'none' })
                        } : {}}
                        >
                            <div ref={r => this.formPDF = r} className={`formToPDF ${pageStatus === PAGESTATUS.CERT_SELECTED ? 'disabled' : ''}`}>
                                <Form
                                    key={pageStatus}
                                    ref={r => this.eFormRef = r}
                                    form={eformObject}
                                    onChange={submission => {
                                        setTimeout(() => {
                                            if (submission.changed) {
                                                let submissionData = _.cloneDeep(submission.data);
                                                // delete submissionData.isShowPrintMsg;

                                                !_.isEqual(submissionData, eformSubmission) && updateState({
                                                    eformSubmission: submissionData
                                                });

                                                // _.isEmpty(eformSubmissionOriginal) && updateState({
                                                //     eformSubmissionOriginal: submissionData
                                                // });
                                            }
                                        }, 0);
                                    }}
                                    // submission={{ data: { ...eformSubmission, isShowPrintMsg: pageStatus === PAGESTATUS.CERT_SELECTED || isPrinting } }}
                                    options={{
                                        isShowPrintMsg: pageStatus === PAGESTATUS.CERT_SELECTED || isPrinting,
                                        readOnly: pageStatus === PAGESTATUS.CERT_SELECTED
                                    }}
                                />
                            </div>
                        </div>
                        }
                    </Paper>
                </Grid>

                <Grid container wrap="nowrap" justify="flex-end">
                    {(pageStatus === PAGESTATUS.CERT_ADDING || pageStatus === PAGESTATUS.CERT_EDITING || pageStatus === PAGESTATUS.CERT_SELECTED) &&
                    <>
                    <CIMSButton
                        disabled={zoomRatio <= 1 || !eformObject}
                        onClick={() => zoomRatio > 1 && this.handleOnChange('zoomRatio', zoomRatio - 0.1)}
                    >Zoom Out</CIMSButton>

                    <CIMSButton
                        disabled={zoomRatio >= 2 || !eformObject}
                        onClick={() => zoomRatio < 2 && this.handleOnChange('zoomRatio', zoomRatio + 0.1)}
                    >Zoom In</CIMSButton>
                    {false &&
                    <CIMSButton
                        disabled={!eformObject}
                        onClick={() => {
                            this.handleOnChange('isFormDialogOpen', !isFormDialogOpen);
                        }}
                    >Open Dialog</CIMSButton>
                    }
                    </>
                    }

                    {/*                        <CIMSButton
                            onClick={this.handleMarkComplete}
                            style={{display: CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? 'none' : ''}}
                            disabled={!enableMarkComplete}
                        >Mark Complete</CIMSButton>*/}

                    {((pageStatus === PAGESTATUS.CERT_EDITING || pageStatus === PAGESTATUS.CERT_ADDING) && isPrintOnly !== 1) &&
                    <>
                        <CIMSButton
                            onClick={() => this.handleSubmit('SAVE')}
                            disabled={(pageStatus !== PAGESTATUS.CERT_ADDING && pageStatus !== PAGESTATUS.CERT_EDITING) || !this.state.finishedCompileCss}
                        >Save</CIMSButton>

                        <CIMSButton
                            onClick={() => this.handleSubmit('SAVE_PRINT')}
                            disabled={(pageStatus !== PAGESTATUS.CERT_ADDING && pageStatus !== PAGESTATUS.CERT_EDITING) || !this.state.finishedCompileCss}
                        >Save & Print</CIMSButton>

                    </>
                    }

                    {((pageStatus === PAGESTATUS.CERT_EDITING || pageStatus === PAGESTATUS.CERT_ADDING) && isPrintOnly === 1) &&
                    <>
                        <CIMSButton
                            onClick={() => this.handleSubmit('PRINT')}
                            disabled={pageStatus !== PAGESTATUS.CERT_ADDING && pageStatus !== PAGESTATUS.CERT_EDITING || !this.state.finishedCompileCss}
                        >Print</CIMSButton>

                    </>
                    }

                    {pageStatus === PAGESTATUS.CERT_SELECTED &&
                    <CIMSButton
                        onClick={() => this.handleEdit()}
                        // style={{display: CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? 'none' : ''}}
                        disabled={!(enableEdit && pageStatus === PAGESTATUS.CERT_SELECTED && eformSiteId === loginSiteId)}
                    >Edit</CIMSButton>
                    }

                    {pageStatus === PAGESTATUS.CERT_ADDING || pageStatus === PAGESTATUS.CERT_EDITING || pageStatus === PAGESTATUS.CERT_SELECTED &&
                    <CIMSButton
                        onClick={() => this.handleSubmit('PRINT')}
                        disabled={!(pageStatus === PAGESTATUS.CERT_SELECTED && eformSiteId === loginSiteId)}
                    >{pageStatus === PAGESTATUS.CERT_SELECTED ? 'Reprint' : 'Print'}</CIMSButton>
                    }

                    {pageStatus === PAGESTATUS.CERT_SELECTED &&
                    <CIMSButton
                        onClick={() => this.handleDelete()}
                        // style={{display: CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? 'none' : ''}}
                        disabled={!(enableDelete && pageStatus === PAGESTATUS.CERT_SELECTED && eformSiteId === loginSiteId)}
                    >Delete</CIMSButton>
                    }

                    <CIMSButton
                        onClick={() => this.handleDirtyClose(null, {src: pageStatus === PAGESTATUS.CERT_VIEWING ? 'bottomClose' : 'bottomCancel'})}
                    >{(pageStatus === PAGESTATUS.CERT_VIEWING || pageStatus === PAGESTATUS.CERT_PRINTING) ? 'Close' : 'Cancel'}</CIMSButton>
                </Grid>

                <CIMSPromptDialog
                    open={isFormDialogOpen}
                    dialogTitle="Clinical Document Details"
                    dialogContentText={
                        <Grid item container className="react-formio eFormSection">
                            <Paper className={classes.dialogPaper}>
                                {
                                    <div className="formLayout" style={!isPrinting ? {
                                        transform: `scale(${dialogZoomRatio})`,
                                        transformOrigin: isDialogScaleOutOfScreen ? '0 0' : 'top center',
                                        margin: isDialogScaleOutOfScreen && '3px',
                                        ...(!(eformObject && eformSubmission) && { display: 'none' })
                                    } : {}}
                                    >
                                        <div ref={r => this.formToPDF_dialog = r} className={`formToPDF ${pageStatus === PAGESTATUS.CERT_SELECTED ? 'disabled' : ''}`}>
                                            <Form
                                                key={pageStatus}
                                                ref={r => this.eFormRefDialog = r}
                                                form={eformObject}
                                                // submission={{ data: { ...eformSubmission, isShowPrintMsg: pageStatus === PAGESTATUS.CERT_SELECTED || isPrinting } }}
                                                onChange={submission => {
                                                    setTimeout(() => {
                                                        if (submission.changed) {
                                                            let submissionData = _.cloneDeep(submission.data);
                                                            // delete submissionData.isShowPrintMsg;

                                                            !_.isEqual(submissionData, eformSubmission) && updateState({
                                                                eformSubmission: submissionData
                                                            });

                                                            // _.isEmpty(eformSubmissionOriginal) && updateState({
                                                            //     eformSubmissionOriginal: submissionData
                                                            // });
                                                        }
                                                    }, 0);
                                                }}
                                                options={{
                                                    isShowPrintMsg: pageStatus === PAGESTATUS.CERT_SELECTED || isPrinting,
                                                    readOnly: pageStatus === PAGESTATUS.CERT_SELECTED
                                                }}
                                            />
                                        </div>
                                    </div>
                                }
                            </Paper>
                        </Grid>
                    }
                    dialogActions={
                        <Grid container wrap="nowrap" justify="flex-end">
                            {(pageStatus === PAGESTATUS.CERT_ADDING || pageStatus === PAGESTATUS.CERT_EDITING || pageStatus === PAGESTATUS.CERT_SELECTED) &&
                            <>
                                <CIMSButton
                                    disabled={dialogZoomRatio <= 1 || !eformObject}
                                    onClick={() => dialogZoomRatio > 1 && this.handleOnChange('dialogZoomRatio', dialogZoomRatio - 0.1)}
                                >Zoom Out</CIMSButton>

                                <CIMSButton
                                    disabled={dialogZoomRatio >= 2 || !eformObject}
                                    onClick={() => dialogZoomRatio < 2 && this.handleOnChange('dialogZoomRatio', dialogZoomRatio + 0.1)}
                                >Zoom In</CIMSButton>
                            </>
                            }

                            {(pageStatus === PAGESTATUS.CERT_EDITING || pageStatus === PAGESTATUS.CERT_ADDING) &&
                            <>
                                <CIMSButton
                                    onClick={() => this.handleSubmit('SAVE')}
                                    disabled={pageStatus !== PAGESTATUS.CERT_ADDING && pageStatus !== PAGESTATUS.CERT_EDITING}
                                >Save</CIMSButton>

                                <CIMSButton
                                    onClick={() => this.handleSubmit('SAVE_PRINT')}
                                    disabled={pageStatus !== PAGESTATUS.CERT_ADDING && pageStatus !== PAGESTATUS.CERT_EDITING}
                                >Save & Print</CIMSButton>
                            </>
                            }

                            {pageStatus === PAGESTATUS.CERT_SELECTED &&
                            <CIMSButton
                                onClick={() => this.handleEdit()}
                                // style={{display: CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? 'none' : ''}}
                                disabled={!(enableEdit && pageStatus === PAGESTATUS.CERT_SELECTED && eformSiteId === loginSiteId)}
                            >Edit</CIMSButton>
                            }

                            {pageStatus === PAGESTATUS.CERT_ADDING || pageStatus === PAGESTATUS.CERT_EDITING || pageStatus === PAGESTATUS.CERT_SELECTED &&
                            <CIMSButton
                                onClick={() => this.handleSubmit('PRINT')}
                                disabled={!(pageStatus === PAGESTATUS.CERT_SELECTED && eformSiteId === loginSiteId)}
                            >{pageStatus === PAGESTATUS.CERT_SELECTED ? 'Reprint' : 'Print'}</CIMSButton>
                            }

                            {pageStatus === PAGESTATUS.CERT_SELECTED &&
                            <CIMSButton
                                onClick={() => this.handleDelete()}
                                // style={{display: CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? 'none' : ''}}
                                disabled={!(enableDelete && pageStatus === PAGESTATUS.CERT_SELECTED && eformSiteId === loginSiteId)}
                            >Delete</CIMSButton>
                            }

                            <CIMSButton
                                onClick={() => this.handleOnChange('isFormDialogOpen', false)}
                            >Close</CIMSButton>
                        </Grid>
                    }
                />
            </Grid>
        );
    }
}

const styles = theme => ({
    title: {
        color: theme.palette.primaryColor,
        fontWeight: 'bold',
        marginBottom: theme.spacing(1)
    },
    paper: {
        width: '100%',
        height: '64vh',
        padding: '1px',
        overflow: 'auto'
    },
    dialogPaper: {
        width: '1500px',
        height: 'calc(100vh - 250px)',
        padding: theme.spacing(1),
        overflow: 'auto'
    },
    formLayout: {
        position: 'relative',
        width: '210mm',
        height: '297mm',
        maxHeight: '297mm',
        margin: '0 auto'
    },
    formPDF: {
        position: 'relative',
        backgroundColor: 'white',
        margin: '0 auto',
        padding: '1rem 2rem',
        fontSize: '0.8rem !important',
        fontFamily: '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Oxygen\', \'Ubuntu\', \'Cantarell\', \'Fira Sans\', \'Droid Sans\', \'Helvetica Neue\', sans-serif'
    },
    formBlock: {
        width: '210mm',
        height: '297mm',
        margin: '0 auto',
        border: '1px solid'
    }
});

const mapState = (state) => ({
    pageStatus: state.certificateEform.pageStatus,
    eformTemplate: state.certificateEform.eformTemplate,
    eformObject: state.certificateEform.eformObject,
    eformSubmission: state.certificateEform.eformSubmission,
    eformSubmissionOriginal: state.certificateEform.eformSubmissionOriginal,
    eformSubmissionSync: state.certificateEform.eformSubmissionSync,
    eformList: state.certificateEform.eformList,
    eformResult: state.certificateEform.eformResult,
    eformParams: state.certificateEform.eformParams,
    eformSiteId: state.certificateEform.eformSiteId,
    loginSiteId: state.login.clinic.siteId,
    encounterInfo: state.patient.encounterInfo,
    login: state.login
});

const mapDispatch = {
    openCommonMessage,
    deleteEformResult,
    deleteSubTabs,
    auditAction,
    updateCurTab,
    openCommonCircular,
    closeCommonCircular,
    updateState,
    saveEformResult,
    handleClose,
    markComplete
};

export default connect(mapState, mapDispatch)(withStyles(styles)(EForm));
