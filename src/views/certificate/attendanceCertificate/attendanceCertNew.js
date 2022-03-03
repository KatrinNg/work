import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import FastTextFieldValidator from '../../../components/TextField/FastTextFieldValidator';
import FastTextField from '../../../components/TextField/FastTextField';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import CIMSTextField from '../../../components/TextField/CIMSTextField';
import AttendanceReasonRadio from './component/attendanceReasonRadio';
import AttendanceDate from './component/attendanceDate';
import AttnDate from '../component/attnDate';
import accessRightEnum from '../../../enums/accessRightEnum';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import * as CertificateUtil from '../../../utilities/certificateUtilities';
import * as CertEnum from '../../../enums/certificate/certEformEnum';
import moment from 'moment';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import SiteAlterOpts from '../component/siteAlterOpts';

const styles = () => ({
    root: {
        width: '95%'
    }
});

class AttendanceCertNew extends Component {
    state = {
        edit: false,
        isPreview: false
    }

    handleOnChange = (value, name) => {
        if (name === 'attendanceSectionFrom' && moment(this.props.attendanceSectionTo).isBefore(value)) {
            this.props.handleOnChange(value, 'attendanceSectionTo');
        } else if (name === 'attendanceSectionTo' && moment(this.props.attendanceSectionFrom).isAfter(value)) {
            this.props.handleOnChange(value, 'attendanceSectionFrom');
        } else if (name === 'attendanceFor') {
            if (value !== 'O') {
                this.props.handleOnChange('', 'attendanceForOthers');
            }
        }
        this.props.handleOnChange(value, name);
        this.setState({ edit: true });
    }

    handleSubmit = () => {
        this.preparePrint();
    }

    getAttndCertDto = () => {
        const {
            attendanceDate,
            attendanceSection,
            attendanceSectionFrom,
            attendanceSectionTo,
            attendanceFor,
            attendanceForOthers,
            patientInfo,
            attendanceRemark,
            attendanceTo,
            attendanceIssueDate,
            caseNoInfo,
            encounterInfo,
            service,
            clinic,
            copyNo
        } = this.props;

        let attnCertDto = {
            attenDate: moment(attendanceDate).format(),
            attenEndTime: attendanceSection === 'R' ? moment(attendanceSectionTo).format('HH:mm') : '',
            attenForCd: attendanceFor,
            attenForOther: attendanceForOthers,
            attenSessionCd: attendanceSection,
            attenStartTime: attendanceSection === 'R' ? moment(attendanceSectionFrom).format('HH:mm') : '',
            caseNo: caseNoInfo && caseNoInfo.caseNo,
            certTo: attendanceTo,
            // clinicCd: clinic && clinic.clinicCd,
            siteId: clinic && clinic.siteId,
            encntrId: encounterInfo && encounterInfo.encounterId,
            noOfCopy: copyNo,
            patientKey: patientInfo && patientInfo.patientKey,
            remark: attendanceRemark,
            issueDate: attendanceIssueDate,
            // serviceCd: service && service.serviceCd,
            svcCd: service && service.serviceCd
        };
        return attnCertDto;

    }

    preparePrint = () => {
        if (this.props.handlingPrint) {
            return;
        }
        const {
            attendanceDate,
            attendanceSection,
            attendanceSectionFrom,
            attendanceSectionTo,
            attendanceFor,
            attendanceForOthers,
            patientInfo,
            attendanceRemark,
            attendanceTo,
            attendanceIssueDate,
            clinic,
            codSppSiteAlterCd,
            service
        } = this.props;

        let attndCertDto = this.getAttndCertDto();

        let params = {
            opType: 'SP',
            attDate: moment(attendanceDate).format(),
            attTime: attendanceSection === 'R' ?
                `${moment(attendanceSectionFrom).format('HH:mm')}-${moment(attendanceSectionTo).format('HH:mm')}` : '',
            attendanceFor: attendanceFor === 'O' ? attendanceForOthers : CertificateUtil.getAttendanceCertForLabel(attendanceFor),
            patientKey: patientInfo && patientInfo.patientKey,
            period: attendanceSection === 'R' ? '' : CertificateUtil.getAttendanceCertSessionLabel(attendanceSection),
            remark: attendanceRemark,
            toValue: attendanceTo,
            siteId: clinic && clinic.siteId,
            attendanceCertificateDto: attndCertDto,
            issueDate: attendanceIssueDate
        };
        let { isPreview } = this.state;
        if (isPreview) {
            this.props.handleSaveAndPreview(params);
        } else {
            this.props.handlePrint(params);
        }
        this.setState({ edit: false, isPreview : false });
    }

    render() {
        const {
            classes,
            attendanceTo,
            attendanceDate,
            attendanceSection,
            attendanceSectionFrom,
            attendanceSectionTo,
            attendanceFor,
            attendanceForOthers,
            attendanceRemark,
            copyNo,
            allowCopyList,
            isSelected,
            accessRights,
            pageStatus,
            attendanceIssueDate,
            service,
            codSppSiteAlterCd,
            selCert
        } = this.props;
        let allowEditAttendanceCertIndex = accessRights.findIndex(item => item.name === accessRightEnum.AllowEditAttendanceCert);
        const isEditable = allowEditAttendanceCertIndex !== -1 ? true : false;
        return (
            <ValidatorForm
                id="attendanceCertNew_form"
                ref={'attendanceCertNewForm'}
                onSubmit={this.handleSubmit}
                focusFail
            >
                <Grid container spacing={2} className={classes.root}>
                    <Grid item container><AttnDate id="attendanceCert" /></Grid>
                    <Grid item container xs={9}>
                        <FastTextFieldValidator
                            id="attendanceCertNew_to"
                            value={attendanceTo}
                            inputProps={{ maxLength: 34 }}
                            disabled={isSelected}
                            onBlur={e => this.handleOnChange(e.target.value, 'attendanceTo')}
                            label={<>To<RequiredIcon /></>}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            variant={'outlined'}
                            calActualLength
                        />
                    </Grid>
                    <Grid item container xs={3}>
                        <DateFieldValidator
                            id={'attendanceCertNew_issueDate'}
                            label={<>Date of Issue<RequiredIcon /></>}
                            isRequired
                            validByBlur
                            disabled={isSelected}
                            disableFuture
                            value={attendanceIssueDate}
                            onChange={(date) => { this.handleOnChange(date, 'attendanceIssueDate'); }}
                            inputVariant={'outlined'}
                        />
                    </Grid>
                    <Grid item container xs={12}>
                        <AttendanceDate
                            date={attendanceDate}
                            section={attendanceSection}
                            from={attendanceSectionFrom}
                            to={attendanceSectionTo}
                            value={attendanceSection && (attendanceSection === 'R' ? attendanceSectionFrom && attendanceSectionTo : true) ? '1' : ''}
                            handleChange={(value, name) => this.handleOnChange(value, name)}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            isSelected={isSelected}
                        />
                    </Grid>
                    <Grid item container xs={12}>
                        <AttendanceReasonRadio
                            value={attendanceFor && (attendanceFor === 'Others' ? attendanceForOthers : true) ? '1' : ''}
                            forValue={attendanceFor}
                            otherValue={attendanceForOthers}
                            handleChange={(value, name) => this.handleOnChange(value, name)}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            isSelected={isSelected}
                        />
                    </Grid>
                    <Grid item container xs={12}>
                        <FastTextField
                            id="attendanceCertNew_remark"
                            value={attendanceRemark}
                            onBlur={e => this.handleOnChange(e.target.value, 'attendanceRemark')}
                            inputProps={{
                                maxLength: 50
                            }}
                            label="Remarks"
                            disabled={isSelected}
                            variant={'outlined'}
                            calActualLength
                        />
                    </Grid>
                    <Grid item container xs={2}>
                        <SelectFieldValidator
                            id="attendanceCertNew_noOfCopy"
                            value={copyNo}
                            options={allowCopyList && allowCopyList.map(item => ({ value: item, label: item }))}
                            onChange={e => this.handleOnChange(e.value, 'copyNo')}
                            TextFieldProps={{
                                label: <>No. of Copy<RequiredIcon /></>,
                                variant: 'outlined'
                            }}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            isDisabled={isSelected}
                        />
                    </Grid>
                    {
                        service.svcCd === 'SPP' ?
                            selCert.svcCd === 'SPP' ?
                                <Grid item container xs={12}>
                                    <SiteAlterOpts
                                        id={this.props.id}
                                        innerRef={inner => this.siteAlterOptsRef = inner}
                                        codSppSiteAlterCd={codSppSiteAlterCd}
                                        updateSiteAlter={this.handleOnChange}
                                        isDisabled={isSelected}
                                        selCert={selCert}
                                    />
                                </Grid>
                                : null
                            : null
                    }
                    {
                        !isSelected ?
                            <CIMSButtonGroup
                                buttonConfig={
                                    [
                                        {
                                            id: 'attendanceCertNew_btnSaveAndPreview',
                                            name: 'Save & Preview',
                                            style: { display: (!isEditable) ? 'none' : '' },
                                            onClick: () => { this.refs.attendanceCertNewForm.submit(); this.setState({ isPreview: true }); }
                                        },
                                        {
                                            id: 'attendanceCertNew_btnSaveAndPrint',
                                            // name: 'Save & Print',
                                            name: 'Save & Print',
                                            // type: 'submit',
                                            style: { display: (!isEditable) ? 'none' : '' },
                                            onClick: () => { this.refs.attendanceCertNewForm.submit(); this.setState({ isPreview: false }); }
                                        },
                                        {
                                            id: 'attendanceCertNew_btnCancel',
                                            name: pageStatus === CertEnum.PAGESTATUS.CERT_EDITING ? 'Cancel' : 'Close',
                                            onClick: () => { this.props.handleClose(); }
                                        }
                                    ]
                                }
                            /> : null
                    }
                </Grid>
            </ValidatorForm>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patientInfo: state.patient.patientInfo,
        caseNoInfo: state.patient.caseNoInfo,
        encounterInfo: state.patient.encounterInfo,
        reportData: state.attendanceCert.reportData,
        handlingPrint: state.attendanceCert.handlingPrint,
        clinic: state.login.clinic,
        service: state.login.service,
        accessRights: state.login.accessRights
    };
};

const mapDispatchToProps = {
    //getAttendanceCert,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(AttendanceCertNew));