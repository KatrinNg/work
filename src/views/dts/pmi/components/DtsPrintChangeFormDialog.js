import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import Enum from '../../../../enums/enum';
import * as RegUtil from '../../../../utilities/registrationUtilities';
import { print } from '../../../../utilities/printUtilities';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSPdfViewer from '../../components/CIMSPdfViewer';
import { getChangeForm } from '../../../../store/actions/dts/patient/DtsPatientSummaryAction';
import * as commonUtilities from '../../../../utilities/commonUtilities';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { CLINIC_CONFIGNAME } from '../../../../enums/dts/patient/DtsPatientSummaryEnum';
import _ from 'lodash';

const styles = () => ({
    dialogPaper: {
        width: '51%'
    }
});

class DtsPrintChangeFormDialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            previewData: null
        };
    }

    componentDidMount() {
        this.getChangeFormData(this.props.patientInfo);
    }

    handleClose = () => {
        this.props.closeConfirmDialog();
    };

    handlePrint = () => {
        const { previewData } = this.state;
        const { svcCd, siteId } = this.props.clinic;
        const callback = printSuccess => {
            if (printSuccess) {
                this.props.closeConfirmDialog();
            } else {
                this.props.openCommonMessage({msgCode: '110041'});
            }
        };
        let params = { base64: previewData, callback: callback };

        let tempParam = dtsUtilities.getPrintParam(
            params,
            CLINIC_CONFIGNAME.PRINT_CHANGE_FORM_PRINT_QUEUE,
            CLINIC_CONFIGNAME.PRINT_CHANGE_FORM_PRINT_ORIENTATION,
            CLINIC_CONFIGNAME.PRINT_CHANGE_FORM_PRINT_TRAY,
            CLINIC_CONFIGNAME.PRINT_CHANGE_FORM_PRINT_PAPER_SIZE,
            this.props.clinicConfig,
            {siteId,serviceCd: svcCd}
        );
        // const printQueueParam = commonUtilities.getHighestPrioritySiteParams(CLINIC_CONFIGNAME.PRINT_CHANGE_FORM_PRINT_QUEUE, this.props.clinicConfig, {
        //     siteId,
        //     serviceCd: svcCd
        // });
        // params = printQueueParam && printQueueParam.paramValue ? { ...params, printQueue: printQueueParam.paramValue } : params;

        // const orientationParam = commonUtilities.getHighestPrioritySiteParams(CLINIC_CONFIGNAME.PRINT_CHANGE_FORM_PRINT_ORIENTATION, this.props.clinicConfig, {
        //     siteId,
        //     serviceCd: svcCd
        // });
        // params = orientationParam && orientationParam.paramValue ? { ...params, orientation: parseInt(orientationParam.paramValue) } : params;

        // const printTrayParam = commonUtilities.getHighestPrioritySiteParams(CLINIC_CONFIGNAME.PRINT_CHANGE_FORM_PRINT_TRAY, this.props.clinicConfig, {
        //     siteId,
        //     serviceCd: svcCd
        // });
        // params = printTrayParam && printTrayParam.paramValue ? { ...params, printTray: parseInt(printTrayParam.paramValue) } : params;

        // const paperSizeParam = commonUtilities.getHighestPrioritySiteParams(CLINIC_CONFIGNAME.PRINT_CHANGE_FORM_PRINT_PAPER_SIZE, this.props.clinicConfig, {
        //     siteId,
        //     serviceCd: svcCd
        // });
        // params = paperSizeParam && paperSizeParam.paramValue ? { ...params, paperSize: parseInt(paperSizeParam.paramValue) } : params;
        print(tempParam);
        // print({ base64: previewData, callback: callback });
    };

    getChangeFormData = patientInfo => {
        let param = {};

        param.patientKey = patientInfo.patientKey || "";
        param.engSurname = patientInfo.engSurname || "";
        param.engGivename = patientInfo.engGivename || "";
        param.chiName = patientInfo.nameChi || "";

        let codeList = this.props.commonCodeList;

        let docType = codeList.doc_type && codeList.doc_type.find(item => item.code === patientInfo.primaryDocTypeCd);

        param.docNum = patientInfo.primaryDocNo || "";
        param.docType = docType.engDesc || "";
        let tempdob = RegUtil.getDateByFormat(patientInfo.exactDobCd, patientInfo.dob).format(Enum.DATE_FORMAT_EYMD_VALUE);
        param.dob = tempdob.split("-").reverse().join("-") || "";
        let genderType = codeList.gender && codeList.gender.find(item => item.code === patientInfo.genderCd);
        param.gender = genderType && genderType.engDesc || "";

        // let patientStatus = this.props.patientStatusList && this.props.patientStatusList.find(item => item.code === patientInfo.patientSts);
        // let patientStatus = codeList.patient_status && codeList.patient_status.find(item => item.code === patientInfo.patientSts);
        // dental Miki sprint 8 2020/08/25 - Start
        let patientStatus = patientInfo.patientSts ? patientInfo.patientSts : 'O';
        let isPnsnStatus = patientInfo.isPnsn != undefined ? patientInfo.isPnsn : 0;
        if (patientStatus == 'G' && isPnsnStatus == 0) {
            param.status = 'G';
        } else if (patientStatus == 'G' && isPnsnStatus == 1) {
            param.status = 'G1';
        } else if (patientStatus == 'S' && isPnsnStatus == 0) {
            param.status = 'S';
        } else if (patientStatus == 'S' && isPnsnStatus == 1) {
            param.status = 'S1';
        } else {
            param.status = patientStatus || "";
        }
        // param.status = patientStatus && patientStatus.engDesc;
        param.statusDescription = (patientStatus == 'P') ? 'General Public' : '';
        // dental Miki sprint 8 2020/08/25 - End
        param.address = this.props.address || "";

        const _patientPhones = patientInfo.phoneList ? patientInfo.phoneList : [];
        let tempPhoneList = [];
        _patientPhones.forEach(list => {
            let tempphoneTypeCd = '(other)';
            if (list.phoneTypeCd == 'M'){tempphoneTypeCd = '(Mobile)';}
            if (list.phoneTypeCd == 'H'){tempphoneTypeCd = '(Home)';}
            if (list.phoneTypeCd == 'O'){tempphoneTypeCd = '(Office)';}
            if (list.phoneTypeCd == 'F'){tempphoneTypeCd = '(Fax)';}
            if (list.phoneTypeCd == 'T'){tempphoneTypeCd = '(Other)';}
            let dialingCd = list.dialingCd? ( '+' + list.dialingCd ) : '';
            let phoneNo = list.phoneNo;
            let combinePhone = dialingCd + ' ' + phoneNo.substr(0, 4) + ' ' +phoneNo.substr(4, 4) + '\n' + tempphoneTypeCd;
            // tempPhoneList.push({"phone":combinePhone, "phoneTypeCd": list.phoneTypeCd });
            tempPhoneList.push(combinePhone);
        });
        param.phoneList = tempPhoneList || "";
        if (tempPhoneList.length > 0) {
            for (let i = 0; i < tempPhoneList.length; i++) {
                let phoneType = '';
                switch (tempPhoneList[i].phoneTypeCd) {
                    case 'M':
                        phoneType = 'mobile';
                        break;
                    case 'H':
                        phoneType = 'home';
                        break;
                    case 'O':
                        phoneType = 'office';
                        break;
                    case 'F':
                        phoneType = 'fax';
                        break;
                    case 'T':
                        phoneType = 'other';
                        break;
                    case 'MSMS':
                        break;
                }
                param[phoneType] = tempPhoneList[i].phone;
            }
        }
        // if (_patientPhones.length > 0) {
        //     for (let i = 0; i < _patientPhones.length; i++) {
        //         let phoneType = '';
        //         switch (_patientPhones[i].phoneTypeCd) {
        //             case 'M':
        //                 phoneType = 'mobile';
        //                 break;
        //             case 'H':
        //                 phoneType = 'home';
        //                 break;
        //             case 'O':
        //                 phoneType = 'office';
        //                 break;
        //             case 'F':
        //                 phoneType = 'fax';
        //                 break;
        //             case 'T':
        //                 phoneType = 'other';
        //                 break;
        //             case 'MSMS':
        //                 break;
        //         }
        //         param[phoneType] = this.props.patientPhoneCallBack(i);
        //     }
        // }
        //   "reminder"
        let reminder = [];
        const _patientCommMeans = patientInfo.pmiPatientCommMeanList ? patientInfo.pmiPatientCommMeanList : [];
        _patientCommMeans.forEach(patientCommMean => {
            let commCd = Enum.CONTACT_MEAN_LIST.find(item => item.code === patientCommMean.commMeanCd);
            if (commCd) reminder.push(commCd.code);
        });
        // if (reminder.length > 0) param.reminder = reminder.join();
        param.reminder = reminder;
        // "language"
        let lang = Enum.LANGUAGE_LIST.find(item => item.code === patientInfo.commLangCd);
        param.language = lang && lang.engDesc;

        param.email = patientInfo.emailAddress || '';

        let _contactPer = patientInfo.contactPersonList || [];
        let relationshipList = codeList && codeList.relationship;
        let relationship = null;
        let contactPersonName = null;
        if (!_.isEmpty(_contactPer)) {
            relationship = relationshipList && relationshipList.find(item => item.code === _contactPer[0]['relationshipCd']);
            contactPersonName = commonUtilities.getFullName(_contactPer[0]['engSurname'], _contactPer[0]['engGivename']);
        }

        param.contactPersonName = contactPersonName || "";
        param.contactPersonRelationship = relationship && relationship.engDesc || "";
        //get report pdf
        console.log('====> before call saga ===> ');
        this.props.getChangeForm(param, result => {
            // console.log('====> call back ===> result.data ==> '  + result.data);
            this.setState({
                previewData: result.data
            });
            console.log(param);
            console.log(result);
        });
    };

    render() {
        const { classes, openConfirmDialog } = this.props;
        const { previewData } = this.state;
        const id = 'printChangeForm';
        return (
            <CIMSPromptDialog
                open={openConfirmDialog}
                dialogTitle={'Preview Change Form'}
                classes={{
                    paper: classes.dialogPaper
                }}
                dialogContentText={<CIMSPdfViewer id={`${id}_pdfViewer`} isShowControlBar={false} defaultScale={1.5} height={'880px'}previewData={previewData}/>}
                buttonConfig={[





                    {
                        id: `${id}_printButton`,
                        name: 'Print',
                        disabled: !previewData,
                        onClick: this.handlePrint
                    },
                    {
                        id: `${id}_ClosePreviewButton`,
                        name: 'Cancel',
                        onClick: this.handleClose
                    }
                ]}
            />
        );
    }
}

const mapStateToProps = state => {
    return {
        patientInfo: state.patient.patientInfo,
        action: state.dtsPatientSummary.redirect.action,
        commonCodeList: state.common.commonCodeList,
        clinic: state.login.clinic,
        clinicConfig: state.common.clinicConfig,
        siteId: state.login.loginForm.siteId
    };
};

const mapDispatchToProps = {
    getChangeForm,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPrintChangeFormDialog));
