import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import Enum from '../../../enums/enum';
import Grid from '@material-ui/core/Grid';
import ApptRedistContainer from './component/apptRedistContainer';
import RoomUtilization from '../../compontent/roomUtilization';
import Form from '../../../components/FormValidator/ValidatorForm';
import CIMSButtonGroup from '../../../components/Buttons/CIMSButtonGroup';
import { getRoomUtilization, updateState, resetAll, resetApptDetails, confirmRedistribution } from '../../../store/actions/appointment/redistribution/redistributionAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { updateCurTab, deleteTabs } from '../../../store/actions/mainFrame/mainFrameAction';
import RedistributionMismatchDialog from './component/redistributionMismatchDialog';
import RedistributionFailureDialog from './component/redistributionFailureDialog';
import AccessRightEnum from '../../../enums/accessRightEnum';
import {
    isValidCriteria,
    isSameCriteria,
    isExactMatch,
    moveExactItemToRight,
    getMismatchData,
    moveItemToLeft,
    moveSuggestItemToRight
} from '../../../utilities/redistributionUtilities';
import * as CommonUtil from '../../../utilities/commonUtilities.js';
import { auditAction } from '../../../store/actions/als/logAction';
import AlsDesc from '../../../constants/ALS/alsDesc';
import { readySearchCriteriaStr } from '../../../utilities/appointmentUtilities';

const Redistribution = React.forwardRef((props, ref) => {

    const {
        roomUtilizationData,
        redistributionMismatch,
        redistributionFailure,
        fromTargetData,
        toTargetData,
        fromOriginalData,
        toOriginalData,
        fromSelected,
        toSelected,
        fromSearchCriteria,
        toSearchCriteria
    } = props;
    const validCriteria = React.useMemo(() => isValidCriteria(fromSearchCriteria) && isValidCriteria(toSearchCriteria), [fromSearchCriteria, toSearchCriteria]);
    const sameCriteria = React.useMemo(() => isSameCriteria(fromSearchCriteria, toSearchCriteria), [fromSearchCriteria, toSearchCriteria]);

    const isToTargetNotNull = React.useMemo(() => toTargetData ? toTargetData.filter(x => !x.isNoSlot && !x.isWhlDay).length > 0 : false, [toTargetData]);
    const isAllRightEnabled = React.useMemo(() => {
        return _.flatten(fromTargetData && fromTargetData.map(item => item.appts)).filter(x => (!x.dod && !x.isAtnd)).length > 0
            && isToTargetNotNull
            && validCriteria
            && !sameCriteria;
    }, [fromTargetData, isToTargetNotNull, validCriteria, sameCriteria]);
    const isAllLeftEnabled = React.useMemo(() => {
        if (toOriginalData && toTargetData) {
            let old_apptListLen = _.flatten(toOriginalData.map(item => item.appts)).map(item => item.apptId).length;
            let cur_apptListLen = _.flatten(toTargetData.map(item => item.appts)).map(item => item.apptId).length;
            return old_apptListLen < cur_apptListLen && validCriteria && !sameCriteria;
        } else {
            return false;
        }
    }, [toOriginalData, toTargetData, validCriteria, sameCriteria]);
    const isSingleRightEnabled = React.useMemo(() => fromSelected && fromSelected.length > 0 && isToTargetNotNull && validCriteria && !sameCriteria, [fromSelected, isToTargetNotNull, validCriteria, sameCriteria]);
    const isSingleLeftEnabled = React.useMemo(() => toSelected && toSelected.length > 0 && validCriteria && !sameCriteria, [toSelected, validCriteria, sameCriteria]);

    const isMoving = React.useMemo(() => {
        let old_apptListLen = _.flatten((toOriginalData || []).map(item => item.appts)).map(item => item.apptId).length;
        let cur_apptListLen = _.flatten((toTargetData || []).map(item => item.appts)).map(item => item.apptId).length;
        return old_apptListLen < cur_apptListLen;
    }, [toOriginalData, toTargetData]);

    const [searchCriteria,setSearchCriteria]=React.useState([]);

    useEffect(() => {
        props.resetAll();
    }, []);

    useEffect(() => {
        if (moment(toSearchCriteria.date).isValid()) {
            setSearchCriteria([{ label: 'Exact Date: ', value: moment(toSearchCriteria.date).format(Enum.DATE_FORMAT_EDMY_VALUE) }]);
        }
    }, [toSearchCriteria.date]);

    const getRoomUtilization = (slotDate) => {
        const siteId = props.siteId;
        props.getRoomUtilization({ siteId, slotDate });
    };

    const onClickAllRight = () => {
        const usefulApptIds = _.uniq(_.flatten(fromTargetData.map(x => x.appts)).filter(x => (!x.dod && !x.isAtnd)).map(x => x.apptId));
        if (usefulApptIds && usefulApptIds.length > 0) {
            let _fromData = _.cloneDeep(fromTargetData),
                _toData = _.cloneDeep(toTargetData),
                _redistributionMismatch = _.cloneDeep(redistributionMismatch),
                _redistributionFailure = _.cloneDeep(redistributionFailure);

            let matchApptFilter = [];
            /**exact match appt */
            usefulApptIds.forEach(x => {
                if (isExactMatch(x, _fromData, _toData)) {
                    const result = moveExactItemToRight(x, _fromData, _toData);
                    if (result) {
                        _fromData = result.fromData;
                        _toData = result.toData;
                    }
                    matchApptFilter.push(x);
                }
            });
            /**miss match appt */
            let misMatchToData = _.cloneDeep(_toData);
            usefulApptIds.filter(x => !matchApptFilter.includes(x)).forEach(x => {
                let mismatch = getMismatchData(x, _fromData, misMatchToData);
                if (mismatch.succeed) {
                    _redistributionMismatch.misMatchList.push(mismatch);
                    _redistributionMismatch.open = true;
                } else {
                    _redistributionFailure.failureList.push(mismatch);
                    _redistributionFailure.open = true;
                }
            });
            props.updateState({
                toSelected: [],
                fromSelected: [],
                fromTargetData: _fromData,
                toTargetData: _toData,
                redistributionMismatch: _redistributionMismatch,
                redistributionFailure: _redistributionFailure
            });
        }
    };

    const onClickSingleRight = () => {
        if (fromSelected && fromSelected.length > 0) {
            let _fromData = _.cloneDeep(fromTargetData),
                _toData = _.cloneDeep(toTargetData),
                _redistributionMismatch = _.cloneDeep(redistributionMismatch),
                _redistributionFailure = _.cloneDeep(redistributionFailure);

            let matchApptFilter = [];
            /**exact match appt */
            fromSelected.forEach(x => {
                if (isExactMatch(x, _fromData, _toData)) {
                    const result = moveExactItemToRight(x, _fromData, _toData);
                    if (result) {
                        _fromData = result.fromData;
                        _toData = result.toData;
                    }
                    matchApptFilter.push(x);
                }
            });
            /**miss match appt */
            let misMatchToData = _.cloneDeep(_toData);
            fromSelected.filter(x => !matchApptFilter.includes(x)).forEach(x => {
                let mismatch = getMismatchData(x, _fromData, misMatchToData);
                if (mismatch.succeed) {
                    _redistributionMismatch.misMatchList.push(mismatch);
                    _redistributionMismatch.open = true;
                } else {
                    _redistributionFailure.failureList.push(mismatch);
                    _redistributionFailure.open = true;
                }
            });
            props.updateState({
                toSelected: [],
                fromSelected: [],
                fromTargetData: _fromData,
                toTargetData: _toData,
                redistributionMismatch: _redistributionMismatch,
                redistributionFailure: _redistributionFailure
            });
        }
    };

    const onClickSingleLeft = () => {
        if (toSelected && toSelected.length > 0) {
            let _fromData = _.cloneDeep(fromTargetData), _toData = _.cloneDeep(toTargetData);
            toSelected.forEach(x => {
                const result = moveItemToLeft(x, _fromData, _toData, fromOriginalData);
                _fromData = result.fromData;
                _toData = result.toData;
            });
            props.updateState({
                toSelected: [],
                fromSelected: [],
                fromTargetData: _fromData,
                toTargetData: _toData
            });
        }
    };

    const onClickAllLeft = () => {
        props.updateState({
            toSelected: [],
            fromSelected: [],
            fromTargetData: _.cloneDeep(fromOriginalData),
            toTargetData: _.cloneDeep(toOriginalData)
        });
    };

    const proceedMismatch = () => {
        const { misMatchList } = redistributionMismatch;
        if (misMatchList && misMatchList.length > 0) {
            let _fromData = _.cloneDeep(fromTargetData),
                _toData = _.cloneDeep(toTargetData);
            misMatchList.filter(x => x.proceed).forEach(x => {
                const result = moveSuggestItemToRight(x.targetSlots, x.suggestSlots, _fromData, _toData);
                if (result) {
                    _fromData = result.fromData;
                    _toData = result.toData;
                }
            });
            props.updateState({
                toSelected: [],
                fromSelected: [],
                fromTargetData: _fromData,
                toTargetData: _toData,
                redistributionMismatch: {
                    misMatchList: [],
                    open: false
                }
            });
        }
    };

    const confirm = React.useCallback((closeTab) => {
        if (toTargetData && toOriginalData) {
            props.updateState({ doCloseCallBack: closeTab || null });
            let params = [];
            const originalApptIds = _.flatten((toOriginalData || []).map(item => item.appts)).map(item => item.apptId);
            let toTargetAppts = _.flatten((toTargetData || []).map(item => item.appts));
            if (originalApptIds && originalApptIds.length > 0) {
                toTargetAppts = toTargetAppts.filter(x => !originalApptIds.includes(x.apptId));
            }
            const searchCriteriaStr = readySearchCriteriaStr(searchCriteria);
            toTargetAppts.forEach(x => {
                let index = params.findIndex(i => i.appointmentId === x.apptId);
                if (index !== -1) {
                    params[index].appointmentDetlBaseVo.mapAppointmentTimeSlotVosList.push({
                        qtType: x.qtType,
                        tmsltId: x.tmsltId
                    });
                    if (props.serviceCd === 'SHS') {
                        params[index].appointmentDetlBaseVo.searchCriteria = searchCriteriaStr;
                    }
                } else {
                    let apptDetail={
                        appointmentId: x.apptId,
                        siteId: props.siteId,
                        apptDate: moment(x.date + ' ' + x.stime, Enum.DATE_FORMAT_EYMD_24_HOUR_CLOCK),
                        version: x.apptVersion,
                        appointmentDetlBaseVo: {
                            rmId: toSearchCriteria.room,
                            sessId: toSearchCriteria.session,
                            mapAppointmentTimeSlotVosList: [{
                                qtType: x.qtType,
                                tmsltId: x.tmsltId
                            }]
                        }
                    };
                    if (props.serviceCd === 'SHS') {
                        apptDetail.appointmentDetlBaseVo.searchCriteria = searchCriteriaStr;
                    }
                    params.push(apptDetail);
                }
            });
            props.auditAction('Confirm Redistribution');
            props.confirmRedistribution(params);
        }
    }, [toTargetData, toOriginalData]);

    const resetPage = () => {
        props.resetApptDetails();
    };

    const checkIsDirty = React.useCallback(() => isMoving, [isMoving]);
    const saveFunc = React.useCallback((closeTab) => { confirm(closeTab); }, [confirm]);
    const doClose = React.useCallback(CommonUtil.getDoCloseFunc_2(AccessRightEnum.redistribution, checkIsDirty, saveFunc), [checkIsDirty, saveFunc]);

    useEffect(() => {
        props.updateCurTab(AccessRightEnum.redistribution, doClose);
    }, [doClose]);

    const onClose = () => {
        CommonUtil.runDoClose(doClose, AccessRightEnum.redistribution);
    };


    return (
        <Grid container style={{ height: '100%' }}>
            <Grid container style={{ height: '93%', flexDirection: 'column', flexWrap: 'nowrap' }}>
                <Form style={{ width: '100%', marginBottom: 10 }}>
                    <RoomUtilization
                        id="redistribution"
                        rowData={roomUtilizationData}
                        getRoomUtilization={getRoomUtilization}
                    />
                </Form>
                <ApptRedistContainer
                    onClickAllRight={onClickAllRight}
                    onClickSingleRight={onClickSingleRight}
                    onClickSingleLeft={onClickSingleLeft}
                    onClickAllLeft={onClickAllLeft}
                    isAllRightEnabled={isAllRightEnabled}
                    isAllLeftEnabled={isAllLeftEnabled}
                    isSingleRightEnabled={isSingleRightEnabled}
                    isSingleLeftEnabled={isSingleLeftEnabled}
                    isDisabledCriteria={isMoving}
                />
            </Grid>
            {
                redistributionMismatch && redistributionMismatch.open ?
                    <RedistributionMismatchDialog
                        rowData={redistributionMismatch && redistributionMismatch.misMatchList}
                        redistributionMismatch={props.redistributionMismatch}
                        updateState={props.updateState}
                        confirm={proceedMismatch}
                        onClose={() => props.updateState({ redistributionMismatch: { open: false, misMatchList: [] } })}
                        auditAction={props.auditAction}
                    >
                    </RedistributionMismatchDialog> : null
            }
            {
                redistributionFailure && redistributionFailure.open && !redistributionMismatch.open ?
                    <RedistributionFailureDialog
                        rowData={redistributionFailure && redistributionFailure.failureList}
                        redistributionFailure={props.redistributionFailure}
                        updateState={props.updateState}
                        onClose={() => {
                            props.auditAction('Close Failure Dialog',null, null, false, 'ana');
                            if (redistributionFailure.callback) {
                                redistributionFailure.callback();
                            }
                            props.updateState({ redistributionFailure: { open: false, failureList: [], callback: null } });
                        }}
                    >
                    </RedistributionFailureDialog> : null
            }
            <CIMSButtonGroup
                buttonConfig={
                    [
                        {
                            id: 'redistribution_autoRebBtn',
                            name: 'Auto Redistribution',
                            disabled: !isAllRightEnabled,
                            onClick: () => {
                                props.auditAction('Auto Redistribution', null, null, false, 'ana');
                                onClickAllRight();
                            }
                        },
                        {
                            id: 'redistribution_confirmBtn',
                            name: 'Confirm',
                            disabled: !isAllLeftEnabled,
                            onClick: () => {
                                props.auditAction('Click Confirm Button', null, null, false, 'ana');
                                confirm();
                            }
                        },
                        {
                            id: 'redistribution_resetBtn',
                            name: 'Reset',
                            onClick: () => {
                                props.auditAction(AlsDesc.RESET, null, null, false, 'ana');
                                resetPage();
                            }
                        },
                        {
                            id: 'redistribution_closeBtn',
                            name: 'Close',
                            onClick: () => {
                                props.auditAction(AlsDesc.CLOSE, null, null, false, 'ana');
                                onClose();
                            }
                        }
                    ]
                }
            />
        </Grid>
    );
});

const mapState = state => ({
    siteId: state.login.clinic.siteId,
    roomUtilizationData: state.redistribution.roomUtilizationData,
    redistributionMismatch: state.redistribution.redistributionMismatch,
    redistributionFailure: state.redistribution.redistributionFailure,
    fromOriginalData: state.redistribution.fromOriginalData,
    toOriginalData: state.redistribution.toOriginalData,
    fromTargetData: state.redistribution.fromTargetData,
    toTargetData: state.redistribution.toTargetData,
    fromSelected: state.redistribution.fromSelected,
    toSelected: state.redistribution.toSelected,
    fromSearchCriteria: state.redistribution.fromSearchCriteria,
    toSearchCriteria: state.redistribution.toSearchCriteria,
    serviceCd:state.login.service.serviceCd
});

const mapDispatch = {
    getRoomUtilization,
    updateState,
    resetAll,
    resetApptDetails,
    confirmRedistribution,
    updateCurTab,
    deleteTabs,
    openCommonMessage,
    auditAction
};

export default connect(mapState, mapDispatch)(Redistribution);