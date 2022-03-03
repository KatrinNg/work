import React from 'react';
import { connect } from 'react-redux';
import { Box } from '@material-ui/core';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import EcsResultTextField from '../../../../../components/ECS/Ecs/EcsResultTextField';
import * as EcsUtilities from '../../../../../utilities/ecsUtilities';
import { openEcsDialog, checkEcs, refreshServiceStatus, setEcsPatientStatus } from '../../../../../store/actions/ECS/ecsAction';

const ECSInfo = React.forwardRef((props, ref) => {
    const { id, accessRights, patientInfo, ecsUserId,
        ecsLocCode, ecsServiceStatus, selectedPatientEcsStatus,
        appointmentInfo, showEcsBtnInBooking, isCrossService, isSppEnable } = props;

    React.useEffect(() => {
        props.refreshServiceStatus();
    }, []);

    const ecs = {
        docTypes: patientInfo.documentPairList.map(item => item.docTypeCd),
        ecsUserId: ecsUserId,
        dob: patientInfo.dob,
        exactDobCd: patientInfo.exactDobCd,
        hkicForEcs: EcsUtilities.getProperHkicForEcs(patientInfo),
        ecsLocCode: ecsLocCode,
        patientKey: patientInfo.patientKey,
        appointmentId: appointmentInfo ? appointmentInfo.appointmentId : null
    };

    if(!showEcsBtnInBooking){
        return null;
    }
    return (
        <Box width={1} pt={1}>
            <Box display="flex" >
                <Box pr={1}>
                    <CIMSButton
                        id={id + '_ecsBtn'}
                        disabled={isSppEnable ? !EcsUtilities.isEcsEnable(
                            accessRights,
                            ecs.docTypes,
                            ecsUserId,
                            ecsLocCode,
                            false,
                            ecsServiceStatus,
                            ecs.hkicForEcs) || isCrossService:true}
                        style={EcsUtilities.getEcsBtnStyle()}
                        onClick={(e) => {
                            props.checkEcs(
                                EcsUtilities.getEcsParamsForDirectCall(
                                    ecs.ecsUserId,
                                    ecs.dob,
                                    ecs.exactDobCd,
                                    ecs.hkicForEcs,
                                    ecs.ecsLocCode,
                                    ecs.patientKey,
                                    null
                                ),
                                ecs.hkicForEcs,
                                null,
                                setEcsPatientStatus);
                        }}
                    >
                        {EcsUtilities.getEcsBtnName()}
                    </CIMSButton>
                </Box>
                <Box pr={1}>
                    <CIMSButton
                        id={id + '_ecsAssocBtn'}
                        disabled={isSppEnable ? !EcsUtilities.isEcsEnable(
                            accessRights,
                            ecs.docTypes,
                            ecsUserId,
                            ecsLocCode,
                            false,
                            ecsServiceStatus,
                            ecs.hkicForEcs,
                            true) || isCrossService:true}
                        style={EcsUtilities.getEcsAssocBtnStyle()}
                        onClick={(e) => {
                            props.openEcsDialog({
                                docTypeCd: EcsUtilities.getProperDocTypeCdForEcs(patientInfo),
                                disableMajorKeys: true,
                                engSurname: patientInfo.engSurname,
                                engGivename: patientInfo.engGivename,
                                chineseName: patientInfo.chineseName,
                                cimsUser: ecs.ecsUserId,
                                locationCode: ecs.ecsLocCode,
                                patientKey: ecs.patientKey,
                                hkid: ecs.hkicForEcs,
                                dob: ecs.dob,
                                exactDob: ecs.exactDobCd,
                                mustBeAssociated: true,
                                associatedHkic: patientInfo.assoPersHkid
                            },
                                null,
                                setEcsPatientStatus);
                        }}
                    >{EcsUtilities.getEcsAssoBtnName()}</CIMSButton>
                </Box>
                <Box flexGrow={1}>
                    <EcsResultTextField id={id + '_ecsResultTxt'} ecsStore={selectedPatientEcsStatus} fullWidth ></EcsResultTextField>
                </Box>
            </Box>
        </Box>
    );
});


const mapStatetoProps = (state) => {
    return ({
        patientInfo: state.patient.patientInfo,
        appointmentInfo: state.patient.appointmentInfo,
        accessRights: state.login.accessRights,
        ecsUserId: state.login.loginInfo.ecsUserId,
        ecsLocCode: state.login.clinic.ecsLocCode,
        ecsServiceStatus: state.ecs.ecsServiceStatus,
        selectedPatientEcsStatus: state.ecs.selectedPatientEcsStatus,
        showEcsBtnInBooking: state.ecs.showEcsBtnInBooking
    });
};

const mapDispatchtoProps = {
    openEcsDialog, checkEcs, refreshServiceStatus, setEcsPatientStatus
};

export default connect(mapStatetoProps, mapDispatchtoProps)(ECSInfo);