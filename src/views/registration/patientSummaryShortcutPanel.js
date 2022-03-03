import React, { useState, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import CIMSButton from '../../components/Buttons/CIMSButton';
import accessRightEnum from 'enums/accessRightEnum';
import { openCommonCircular, closeCommonCircular } from '../../store/actions/common/commonAction';
import { auditAction } from '../../store/actions/als/logAction';
import { skipTab } from '../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import * as EnctrAndRmUtil from '../../utilities/enctrAndRoomUtil';
import moment from 'moment';
import Enum from '../../enums/enum';
import {
    getHaveEncounterWithinOneMonth
} from '../../store/actions/patient/patientAction';
import * as CommonUtilities from '../../utilities/commonUtilities';

const useStyles = makeStyles(theme => ({
    buttonRoot: {
        margin: '10px',
        minWidth: '300px',
        maxWidth: '300px',
        minHeight: '150px',
        maxHeight: '150px',
        whiteSpace: 'pre',
        fontSize: '1.4rem',
        fontWeight: '700'
    }
}));

const PatientSummaryShortcutPanel = props => {
    const classes = useStyles();
    const theme = useTheme();
    const id = 'patientSummaryShortcutPanel';
    const { patientInfo, skipTab, specialties , svcCd, clinicConfig, siteId } = props;

    const encTypeCDUrgRefSiteParam = CommonUtilities.getTopPriorityOfSiteParams(clinicConfig, svcCd, siteId, 'ENCOUNTER_TYPE_CD_URGENT_REFERRAL').paramValue;
    const encTypeCDInpConSiteParam = CommonUtilities.getTopPriorityOfSiteParams(clinicConfig, svcCd, siteId, 'ENCOUNTER_TYPE_CD_INPATIENT_CONSULTATION').paramValue;
    const inpConLocCDSiteParam = CommonUtilities.getTopPriorityOfSiteParams(clinicConfig, svcCd, siteId, 'DEFAULT_INPATIENT_CONSULTATION_LOC_CD').paramValue;
    const inpConLocIDSiteParam = CommonUtilities.getTopPriorityOfSiteParams(clinicConfig, svcCd, siteId, 'DEFAULT_INPATIENT_CONSULTATION_LOC_ID').paramValue;

    const encounterTypeList = useMemo(() => {
        const { encounterTypeList, siteId } = props;
        return EnctrAndRmUtil.getActiveEnctrTypeIncludeAllClinic(siteId, encounterTypeList);
    }, [props.encounterTypeList, props.siteId]);

    const appointmentSimplified = (params) => {
        skipTab(accessRightEnum.booking);
    };

    const attendanceSimplified = (params) => {
        skipTab(accessRightEnum.attendance);
    };

    const paymentConsultationFee = (params) => {
        skipTab(accessRightEnum.consultationFee);
    };

    const paymentDrugFee = (params) => {
        skipTab(accessRightEnum.drugFee);
    };

    const handleSkipTab = (action, filter, cgsParams, target) => {
        openCommonCircular();
        const encntrTypeId = props.encounterTypeList.find((type) => type.encounterTypeCd == cgsParams?.encTypeCd)?.encntrTypeId || null;
        setTimeout(() => {
            skipTab(
                target,
                {
                    patientKey: patientInfo.patientKey,
                    redirectFrom: accessRightEnum.patientSummary,
                    action: action,
                    sspecFilter: filter,
                    encounterTypeId: encntrTypeId,
                    encounterTypeCd: cgsParams ? cgsParams.encTypeCd : null,
                    cgsInpatientCnsltLocCd: cgsParams ? cgsParams.locCd : null,
                    cgsInpatientCnsltLocId: cgsParams ? cgsParams.locId : null
                },
                true
            );
        }, 10);
        closeCommonCircular();
    };

    const handleWalkIn = (encTypeCd, locCd, locId) => {
        props.auditAction('Patient Summary Shortcut Panel Click Walk-In Attend Button', null, null, false, 'ana');
        if (patientInfo && patientInfo.patientKey && !parseInt(patientInfo.deadInd)) {
            const cgsParams = {encTypeCd: encTypeCd, locCd: locCd, locId: locId};
            handleSkipTab('walkIn', null, cgsParams, accessRightEnum.booking);
        } else {
            props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    };

    const handleWalkInWithFilter = (filter) => {
        props.auditAction('Patient Summary Shortcut Panel Click Walk-In Attend Button', null, null, false, 'ana');
        if (patientInfo && patientInfo.patientKey && !parseInt(patientInfo.deadInd)) {
            const sspecId = specialties.find(x => x.sspecCd === filter)?.sspecId;
            handleSkipTab('walkInWithFilter', sspecId, null, accessRightEnum.booking);

        } else {
            props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    };

    const handleWalkInBackDay = (encTypeCd, locCd, locId) => {
        props.auditAction('Patient Summary Shortcut Panel Click Walk-In Attend Button', null, null, false, 'ana');
        if (patientInfo && patientInfo.patientKey && !parseInt(patientInfo.deadInd)) {
            const cgsParams = {encTypeCd: encTypeCd, locCd: locCd, locId: locId};
            handleSkipTab('backdateWalkIn', null, cgsParams, accessRightEnum.booking);
        } else {
            props.openCommonMessage({
                msgCode: '115571',
                variant: 'error'
            });
        }
    };

    const SHSbtns = [
        [
            {r: 0, c: 0, label: 'Appointment\n(Simplified Mode)', disabled: false, func: appointmentSimplified, params: { r: 0, c: 0 }},
            {r: 0, c: 1, label: 'Attendance\n(Simplified Mode)', disabled: false, func: attendanceSimplified, params: { r: 0, c: 1 }},
            {r: 0, c: 2, label: 'Walk-in STI\nAttendance', disabled: false, func: () => handleWalkInWithFilter('STI'), params: { r: 0, c: 2 }}
        ],
        [
            {r: 1, c: 0, label: 'Payment\n(Consultation Fee)', disabled: false, func: paymentConsultationFee, params: { r: 1, c: 0 }},
            {r: 1, c: 1, label: 'Payment\n(Drug Fee)', disabled: false, func: paymentDrugFee, params: { r: 1, c: 1 }},
            {r: 1, c: 2, label: 'Walk-in Skin\nAttendance', disabled: false, func: () => handleWalkInWithFilter('Skin'), params: { r: 1, c: 2 }}
        ]
    ];

    const CGSbtns = [
        [
            {r: 0, c: 0, label: 'Urgent Referral\nCreate Attendance\nand Encounter', disabled: false, func: () => handleWalkIn(encTypeCDUrgRefSiteParam, null, null), params: { r: 0, c: 0 }},
            {r: 0, c: 1, label: 'Today\nInpatient Consultation -\nCreate Attendance\nand Encounter', disabled: false, func: () => handleWalkIn(encTypeCDInpConSiteParam, inpConLocCDSiteParam, inpConLocIDSiteParam), params: { r: 0, c: 1 }},
            {r: 0, c: 2, label: 'Backday\nInpatient Consultation -\nCreate Attendance\nand Encounter', disabled: false, func: () => handleWalkInBackDay(encTypeCDInpConSiteParam, inpConLocCDSiteParam, inpConLocIDSiteParam), params: { r: 0, c: 2 }}
        ]
    ];

    const [shortcuts, setShortcuts] = useState([
        []
    ]);

    const setDisabled = (state, r, c, value) => {
        let temp;
        let item = state.reduce((acc, cur) => (temp = cur.find(x => x.r === r && x.c === c), temp ? temp : acc), null);
        if (item)
            item.disabled = value;
        return state;
    };



    useEffect(() => {
        // let timerId;
        // setTimeout(() => {
        //     timerId = setInterval(() => {
        //         let newState = [...shortcuts];
        //         newState[0][0].disabled = !shortcuts[0][0].disabled;
        //         setShortcuts(newState);
        //     }, 1000);
        // }, 1000);

        return () => {
            // clearInterval(timerId);
        };
    }, []);

    useEffect(() => {
        let stiId, skinId, newState;
        stiId = specialties.find(x => x.sspecCd === 'STI')?.sspecId;
        skinId = specialties.find(x => x.sspecCd === 'Skin')?.sspecId;

        if (svcCd == 'SHS') {
            newState = [...SHSbtns];
            setDisabled(newState, 0, 2, !(encounterTypeList.filter(x => x.sspecId === stiId).length > 0));
            setDisabled(newState, 1, 2, !(encounterTypeList.filter(x => x.sspecId === skinId).length > 0));
        } else if (svcCd == 'CGS') {
            newState = [...CGSbtns];
        }

        setShortcuts(newState);
    }, [props.encounterTypeList, props.siteId]);

    useEffect(() => {
        if (props.mainFrame.subTabsActiveKey === accessRightEnum.patientSummary)
            refreshButtons();
    }, [props.mainFrame.subTabsActiveKey]);

    const checkDrugFeeButtonDisabled = (newState) => {
        const { appointmentHistory, siteId, patientInfo, getHaveEncounterWithinOneMonth } = props;
        const hasTodayAttendance = !!(appointmentHistory?.filter(x => moment().isSame(x.appointmentDate, 'day') && x.attnStatusCd === 'Y').length > 0);
        if(appointmentHistory){
            if(hasTodayAttendance){
                setDisabled(newState, 1, 1, false);
            } else {
                const startDate = moment(new Date()).subtract(30,'days').format(Enum.DATE_FORMAT_EYMD_VALUE);
                const endDate = moment().format(Enum.DATE_FORMAT_EYMD_VALUE);
                getHaveEncounterWithinOneMonth({
                    siteId: siteId,
                    patientKey: patientInfo.patientKey,
                    startDate: startDate,
                    endDate: endDate
                },(data)=>{
                    const attnEncntrTypes = data.find((item)=>{
                        return item.encntrId;
                    });
                    let disabled = attnEncntrTypes ? false : true;
                    setDisabled(newState, 1, 1, disabled);
                });
            }
        }
    };

    useEffect(() => {
        let hasUnattendAppt = !!(props.appointmentHistory?.filter(x => moment().isSame(x.appointmentDate, 'day') && x.attnStatusCd !== 'Y').length > 0);
        // console.log('[SHS] hasUnattendAppt', hasUnattendAppt);
        let hasTodayAttendance = !!(props.appointmentHistory?.filter(x => moment().isSame(x.appointmentDate, 'day') && x.attnStatusCd === 'Y').length > 0);
        // console.log('[SHS] hasTodayAttendance', hasTodayAttendance);

        let newState;
        if (svcCd == 'SHS') {
            newState = [...SHSbtns];
            setDisabled(newState, 0, 1, !hasUnattendAppt);
            setDisabled(newState, 1, 0, !hasTodayAttendance);
            setDisabled(newState, 1, 1, !hasTodayAttendance);
            checkDrugFeeButtonDisabled(newState);
        } else if (svcCd == 'CGS') {
            newState = [...CGSbtns];
        }

        setShortcuts(newState);
    }, [props.appointmentHistory]);

    const refreshButtons = () => {
        // console.log('[SHS] refreshButtons');
    };

    const functionButton = (data) => {
        const {label, disabled, func, params} = data;
        return (
            <CIMSButton
                id={id + '_btn_${r}_${c}'}
                className={classes.buttonRoot}
                onClick={e => {
                    func(params);
                }}
                disabled={disabled}
            >
                {label}
            </CIMSButton>
        );
    };

    return (
        <Box display="flex" flex="auto" flexDirection="column" justifyContent="space-around" style={{ width: '100%' }} className={[]}>
            {shortcuts?.map((row, r) => {
                return (
                    <Box key={`row-${r}`} display="flex" flex={1} flexDirection="row" justifyContent="space-around">
                        {row.map((cell, c) => {
                            return (
                                <Box
                                    key={`cell-${r}-${c}`}
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                >
                                    {functionButton(cell)}
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}
        </Box>
    );
};

const mapStateToProps = state => {
    return {
        appointmentHistory: state.patient.appointmentHistory,
        encounterTypeList: state.common.encounterTypeList,
        mainFrame: state.mainFrame,
        patientInfo: state.patient.patientInfo,
        specialties: state.common.specialties,
        siteId: state.login.clinic.siteId,
        svcCd: state.login.service.svcCd,
        clinicConfig: state.common.clinicConfig
    };
};

const mapDispatchToProps = {
    auditAction,
    closeCommonCircular,
    openCommonCircular,
    openCommonMessage,
    skipTab,
    getHaveEncounterWithinOneMonth
};

export default connect(mapStateToProps, mapDispatchToProps)(PatientSummaryShortcutPanel);