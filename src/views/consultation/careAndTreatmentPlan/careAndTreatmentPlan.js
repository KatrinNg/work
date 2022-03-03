import React from 'react';
import { withStyles, Box, Grid } from '@material-ui/core';
import { connect } from 'react-redux';
import moment from 'moment';
import ReferralPanel from './component/referralPanel';
import FollowUpPanel from './component/followUpPanel';
import HlthEduAndRcmdPanel from './component/hlthEduAndRcmdPanel';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import AttnDate from '../../certificate/component/attnDate';
import {
    resetAll,
    ctpSummary,
    ctrlCreateAndUpdateDialog,
    listReferralLetter,
    listFollowUp,
    listHlthEduRcmd,
    previewRfrLetter,
    updateField,
    getTodayEncntrCTP,
    submitTdCTP
} from '../../../store/actions/consultation/careAndTreatmentPlan/ctpAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import {
    closeCommonCircular,
    openCommonCircular
} from '../../../store/actions/common/commonAction';
import CreateAndUpdateCTPDialog from './component/createAndUpdateCTPDialog';
import Enum from '../../../enums/enum';
import AccessRightEnum from '../../../enums/accessRightEnum';
import { print } from '../../../utilities/printUtilities';
import CIMSCompatViewerDialog from '../../../components/Dialog/CIMSCompatViewerDialog';
import { auditAction } from '../../../store/actions/als/logAction';

const styles = (theme) => ({
    expansionPanelRoot: {
        marginTop: 0,
        marginBottom: 10,
        backgroundColor: '#ccc'
    },
    expansionPanelSummaryRoot: {
        backgroundColor: '#0579c8',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
        paddingLeft: 10
    },
    expansionPanelSummaryIcon: {
        padding: '6px 12px',
        color: '#ffffff',
        marginRight: -19
    },
    expansionPanelSummaryLabel: {
        fontWeight: 'bold',
        color: '#ffffff'
    },
    expansionPanelDetails: {
        backgroundColor: theme.palette.white
    },
    border: {
        backgroundColor: '#fff',
        borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
        borderRight: '1px solid rgba(0, 0, 0, 0.12)'
    },
    detailContainer: {
        padding: theme.spacing(2)
    },
    normalFont: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: '20px',
        whiteSpace: 'nowrap'
    }
});

class CareAndTreatmentPlan extends React.Component {

    componentDidMount() {
        const paras = this.initSummaryCTPParas();
        this.props.ctpSummary(paras.rfrPara, paras.flwupPara, paras.hlthEduRcmdPara);
    }

    shouldComponentUpdate(nextP) {
        if (nextP.subTabsActiveKey !== this.props.subTabsActiveKey && nextP.subTabsActiveKey === AccessRightEnum.careAndTreatmentPlan) {
            const paras = this.initSummaryCTPParas();
            const callback = () => {
                if (this.rfrPanelRef) {
                    this.rfrPanelRef.grid.api.redrawRows();
                    this.rfrPanelRef.grid.api.deselectAll();
                }
            };
            this.props.ctpSummary(paras.rfrPara, paras.flwupPara, paras.hlthEduRcmdPara, callback);

            // return false;
        }
        return true;
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    initSummaryCTPParas = () => {
        const rfrPara = {
            patientKey: this.props.patientInfo.patientKey,
            from: moment().subtract(20, 'years').format(Enum.DATE_FORMAT_EYMD_VALUE), //Temporary to set a large date range to support retriving historical data from CIMS1. Target to accept null date range for CTP usage.
            to: moment().format(Enum.DATE_FORMAT_EYMD_VALUE)
        };

        const flwupPara = {
            patientKey: this.props.patientInfo.patientKey,
            sortByEncounterDate: 'D',
            isCancel: false,
            isPaging: false,
            isFlwUpNotNull: true
        };
        const hlthEduRcmdPara = {
            patientKey: this.props.patientInfo.patientKey
        };

        return {rfrPara, flwupPara, hlthEduRcmdPara};
    }

    handleCreateAndUpdateOnClick = () => {
        const {encounterInfo} = this.props;
        // this.props.ctrlCreateAndUpdateDialog(true);
        this.props.auditAction('Click create & update button', null, null, false, 'clinical-doc');
        this.props.getTodayEncntrCTP(encounterInfo.encounterId);
    }

    previewRfrLetter = (data) => {
        const {
            serviceList, clinicList, specialty, hospital,
            openCommonCircular,
            closeCommonCircular,
            previewRfrLetter,
            updateField
        } = this.props;

        const hosp = hospital && hospital.find(x => x.hcinstId === data.rfrHcinstId);
        let clinic = hosp ? hosp.name:data.hcinstName||'';
        if (data.groupCd === 'HA' || data.groupCd === 'Private' || (data.groupCd === 'Others' && clinic === 'Occupational Health Clinic')) {
            let selSpecialty = specialty.find(item => item.specialtyCd === data.specialityCd);
            clinic = clinic + `, ${selSpecialty.specialtyName}`;
        }
        if (data.groupCd === 'DH') {
            const selService = serviceList.find(item => item.serviceCd === data.letterSvcCd);
            // fixing find clinic by serviceCd && clinicCd, as clinicCd is not unique across services
            const selClinic = clinicList.find(item => item.serviceCd === data.letterSvcCd && item.clinicCd === clinic);
            clinic = (selService && selService.serviceName || data.letterSvcCd) + `, ${selClinic && selClinic.clinicName || clinic}`;
        }
        if (data.groupCd === 'Others' && clinic === 'Others') {
            clinic = data.others;
        }

        let appointmentType = data.priority;
        switch (appointmentType) {
            // case 'N': appointmentType = 'Normal Appointment'; break;
            case 'U':
                appointmentType = 'Urgent Appointment';
                break;
            case 'E':
                appointmentType = 'Early Appointment';
                break;
        }
        let params = {
            opType: 'P',
            familyHistory: data.allergies,
            appointmentType: appointmentType,
            problem: data.problem,
            commenced: data.medications,
            results: data.result,
            serviceClinic: clinic,
            date: moment().format(Enum.DATE_FORMAT_EYMD_VALUE).toString(),
            to: data.certTo,
            patientKey: data.patientKey,
            outDocId: data.documentId,
            referralLetterDto: data
        };

        this.props.auditAction('Preview a referral letter in CTP');

        openCommonCircular();

        if (data.isMigration === 1 && data.src === 'O') {
            previewRfrLetter(params, (res) => {
                this.downLoadFileFromBlob(this.b64toBlob(res.data, 'application/pdf'), data.docName);

                closeCommonCircular();
            });
        } else {
            previewRfrLetter(params, (res) => {
                updateField({openRfrPreviewDialog: true});

                closeCommonCircular();
            });
        }
    }

    b64toBlob = (b64Data, contentType, sliceSize) => {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        let byteCharacters = atob(b64Data);
        let byteArrays = [];

        for (let offSet = 0; offSet < byteCharacters.length; offSet += sliceSize) {
            let slice = byteCharacters.slice(offSet, offSet + sliceSize);

            let byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            let byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        return new Blob(byteArrays, {type: contentType});
    };

    downLoadFileFromBlob = (blob, docName) => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = docName;
        a.click();
    };

    closePreviewDialog = () => {
        this.props.updateField({openRfrPreviewDialog: false, rfrLetterPreviewData: null});
    }

    printRfrLetter = () => {
        this.props.auditAction('Print a referral letter in CTP', null, null, false, 'clinical-doc');

        const {rfrLetterPreviewData} = this.props;
        const callback = (printSuccess) => {
            if (printSuccess) {
                this.closePreviewDialog();
            }
        };
        print({base64: rfrLetterPreviewData, callback: callback});
    }

    handleSubmitTdCTP = (params) => {
        const {hasTdCTP, encounterInfo} = this.props;
        params.clcEncntrId = encounterInfo.encounterId;
        const callback = () => {
            const paras = this.initSummaryCTPParas();
            this.props.ctpSummary(paras.rfrPara, paras.flwupPara, paras.hlthEduRcmdPara);
        };

        this.props.auditAction('Save in create & update ctp dialog');
        this.props.submitTdCTP(params, hasTdCTP, callback);
    }

    render() {
        const {
            openCreateAndUpdate, rfrDetails, flwUpDetails, hlthEduRcmdList,
            openRfrPreviewDialog, rfrLetterPreviewData, encounterInfo, tdHlthEduRcmdList,
            flwUp, eduCatgrtyList, hlthEduTypeList, hasTdCTP, serviceList, clinicConfig,
            loginSvc, hospital
        } = this.props;
        // const cmnParam = { patientKey: patientInfo.patientKey };
        // const hasTodayEncounter = CTPUtil.hasTodayEncounter(encounterInfo);
        const hasEncounterDate = encounterInfo && encounterInfo.encounterDate;
        const encounterDateStr = encounterInfo && encounterInfo.encounterDate ? moment(encounterInfo.encounterDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : '';

        return (
            <Grid container style={{padding: '0px 8px 8px'}}>
                <Grid container>
                    <Grid item container xs={12} alignItems={'center'}>
                        <Box display="flex" flex="auto" flexDirection="row" justifyContent="flex-start" alignItems="center" style={{ width: '100%' }}>
                            <Box flex={1} component="Typography" className={this.props.classes.normalFont}>Care and Treatment Plan (CTP)</Box>
                            <Box style={{ maxWidth: '40%' }}><AttnDate id="ctp_encounter_attnDate"/></Box>
                            <Box>
                                <CIMSButton
                                    id={'CTP_create_and_update_button'}
                                    children={'Create & Update'}
                                    onClick={this.handleCreateAndUpdateOnClick}
                                    disabled={!hasEncounterDate}
                                />
                            </Box>
                        </Box>
                    </Grid>
                    {/* <Grid item container xs={7} alignItems={'center'} style={{fontSize: 20}}><b>Care and Treatment Plan
                        (CTP)</b></Grid>
                    <Grid item container xs={3} alignItems={'center'} style={{fontSize: 20, paddingLeft: 16}} id="ctp_encounter_attnDate">
                        <b>{`Encounter Date: ${encounterDateStr}`}</b>
                    </Grid> */}
                    {/* <Grid item container xs={1} alignItems={'center'} style={{ fontSize: 20 }}>
                        <label>
                            {
                                ` ${encounterInfo && encounterInfo.encounterDate ? moment(encounterInfo.encounterDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : null}`
                            }
                        </label>
                    </Grid> */}
                    {/* <Grid item container xs={2} justify={'flex-end'}>
                        <CIMSButton
                            id={'CTP_create_and_update_button'}
                            children={'Create & Update'}
                            onClick={this.handleCreateAndUpdateOnClick}
                            disabled={!hasEncounterDate}
                        />
                    </Grid> */}
                </Grid>
                <Grid container>
                    <ReferralPanel
                        id={'CTP_referral'}
                        rfrDetails={rfrDetails || []}
                        classes={this.props.classes}
                        previewRfrLetter={this.previewRfrLetter}
                        ref={ref => this.rfrPanelRef = ref}
                        serviceList={serviceList}
                        clinicConfig={clinicConfig}
                        loginSvcCd={loginSvc.svcCd}
                        hospital={hospital}
                    />
                    <FollowUpPanel
                        id={'CTP_followUp'}
                        flwUpDetails={flwUpDetails || []}
                        classes={this.props.classes}

                    />
                    <HlthEduAndRcmdPanel
                        id={'CTP_health_edu_recommendation'}
                        hlthEduRcmdList={hlthEduRcmdList || []}
                        classes={this.props.classes}

                    />
                </Grid>
                <CreateAndUpdateCTPDialog
                    id={'create_and_update_CTP_dialog'}
                    open={openCreateAndUpdate}
                    tdHlthEduRcmdList={tdHlthEduRcmdList}
                    flwUp={flwUp}
                    eduCatgrtyList={eduCatgrtyList}
                    hlthEduTypeList={hlthEduTypeList}
                    hasTdCTP={hasTdCTP}
                    ctrlCreateAndUpdateDialog={this.props.ctrlCreateAndUpdateDialog}
                    updateField={this.props.updateField}
                    handleSubmitTdCtp={this.handleSubmitTdCTP}
                    openCommonMessage={this.props.openCommonMessage}
                    encounterDateStr={encounterDateStr}
                />

                <CIMSCompatViewerDialog
                    id={'rfrLetter_view_dialog'}
                    isDialogOpen={openRfrPreviewDialog}
                    closeDialog={this.closePreviewDialog}
                    base64={rfrLetterPreviewData}
                    fileType={'pdf'}
                    /*print={this.printRfrLetter}*/
                    position={'vertical'}
                />
            </Grid>
        );
    }
}

const mapState = (state) => {
    return {
        openCreateAndUpdate: state.ctp.openCreateAndUpdate,
        rfrDetails: state.ctp.rfrDetails,
        flwUpDetails: state.ctp.flwUpDetails,
        hlthEduRcmdList: state.ctp.hlthEduRcmdList,
        encounterInfo: state.patient.encounterInfo,
        patientInfo: state.patient.patientInfo,
        openRfrPreviewDialog: state.ctp.openRfrPreviewDialog,
        rfrLetterPreviewData: state.ctp.rfrLetterPreviewData,
        serviceList: state.common.serviceList,
        clinicList: state.common.clinicList,
        specialty: state.common.specialty,
        flwUp: state.ctp.flwUp,
        tdHlthEduRcmdList: state.ctp.tdHlthEduRcmdList,
        eduCatgrtyList: state.common.commonCodeList.edu_catgry,
        hlthEduTypeList: state.common.commonCodeList.hlth_edu_type,
        hasTdCTP: state.ctp.hasTdCTP,
        subTabsActiveKey: state.mainFrame.subTabsActiveKey,
        clinicConfig: state.common.clinicConfig,
        loginSvc: state.login.service,
        hospital: state.common.hospital
    };
};

const disPatch = {
    resetAll,
    ctrlCreateAndUpdateDialog,
    ctpSummary,
    listReferralLetter,
    listFollowUp,
    listHlthEduRcmd,
    previewRfrLetter,
    updateField,
    getTodayEncntrCTP,
    submitTdCTP,
    openCommonMessage,
    auditAction,
    openCommonCircular,
    closeCommonCircular
};

export default connect(mapState, disPatch)(withStyles(styles)(CareAndTreatmentPlan));
