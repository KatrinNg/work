import React, { Component } from 'react';
import { connect } from 'react-redux';
import Iframe from 'react-iframe';
import { getEHRUrl, resetEHRUrl } from '../../store/actions/patient/patientAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import Enum from '../../enums/enum';
import * as PatientUtil from '../../utilities/patientUtilities';
import * as CommonUtilities from '../../utilities/commonUtilities';
import * as EHRUtilities from '../../utilities/eHRUtilities';
import { openCommonCircular, closeCommonCircular } from '../../store/actions/common/commonAction';

class eHRRegistration extends Component {

    componentDidMount() {
        const { patient, eHRId, loginName, loginId, pcName, ipAddr, correlationId } = this.props;

        // Reset the eHR url;
        this.props.resetEHRUrl();

        this.props.openCommonCircular();

        let isEHRSSRegistered = EHRUtilities.isEHRSSRegistered(patient);
        // // TODO : Add the ehruId check in accessRights
        let isEHRAccessRight = EHRUtilities.isEHRAccessRight(eHRId);

        let hkId;
        patient && patient.documentPairList.filter(item => item.patientKey === patient.patientKey
                && item.docTypeCd === Enum.DOC_TYPE.HKID_ID).forEach(patientInfo => {
            if (patientInfo.docNo) {
                hkId = patientInfo.docNo;
            }
        });

        patient && patient.documentPairList.filter(item => item.patientKey === patient.patientKey)
                .forEach(patientInfo => {
            let isHKIC = PatientUtil.isHKIDFormat(patientInfo.docTypeCd);
            if (isHKIC && !hkId) {
                hkId = patientInfo.docNo;
            }
        });

        let documentId;
        let documentType;
        patient && patient.documentPairList.filter(item => item.patientKey === patient.patientKey)
                .forEach(patientInfo => {
            if (!documentId && !documentType) {
                let isHKIC = PatientUtil.isHKIDFormat(patientInfo.docTypeCd);
                if (!isHKIC) {
                    documentId = patientInfo.docNo;
                    documentType = patientInfo.docTypeCd;
                }
            }
        });

        let patientData = EHRUtilities.getEHRISViewerData(patient, hkId, documentId, documentType, this.props.serviceCd, loginName, loginId, pcName, ipAddr, correlationId, eHRId);

        this.btnEHROnClick(patientData, isEHRAccessRight, isEHRSSRegistered);
    }

    componentDidUpdate() {
        setTimeout(function() {
            this.props.closeCommonCircular();
        }.bind(this), 10000);
    }

    componentWillUnmount() {
        this.props.closeCommonCircular();
    }

    btnEHROnClick = (patient, isEHRAccessRight, isEHRSSRegistered) => {
        let where = {
            serviceCd: null,
            clinicCd: null
        };
        let eHRViewerConfig = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.EHR_VIEWER_URL, this.props.clinicConfig, where);
        let eHRViewerUrl = '';
        if (eHRViewerConfig && eHRViewerConfig.configValue) {
            eHRViewerUrl = eHRViewerConfig.configValue;
        }
        this.props.getEHRUrl(patient, isEHRAccessRight, isEHRSSRegistered, eHRViewerUrl);
    }

    render() {
        return (
            this.props.eHRUrl || this.props.eHRUrl !== '' ?
                <Iframe
                    ref="eHRRegistrationiframe"
                    id="eHRRegistrationiframe"
                    url={(this.props.eHRUrl)}
                    src={(this.props.eHRUrl)}
                    width="99.7%"
                    height="99%"
                    loading="lazy"
                />
                : <></>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        patient: state.patient.patientInfo,
        serviceCd: state.login.service.serviceCd,
        loginName: state.login.loginInfo.loginName,
        loginId: state.login.loginInfo.loginId,
        correlationId: state.login.loginInfo.correlationId,
        pcName: state.login.loginForm.ipInfo.pcName,
        ipAddr: state.login.loginForm.ipInfo.ipAddr,
        eHRId: state.login.loginInfo && state.login.loginInfo.eHRId,
        clinicConfig: state.common.clinicConfig,
        eHRUrl: state.patient.eHRUrl
    };
};

const mapDispatchToProps = {
    getEHRUrl,
    resetEHRUrl,
    openCommonCircular,
    closeCommonCircular,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)((eHRRegistration));