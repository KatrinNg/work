import React from 'react';
import { connect } from 'react-redux';
import PatientUnderCareDialog from './patientUnderCareDialog';
import accessRightEnum from '../../../enums/accessRightEnum';
import * as BookingEnum from '../../../enums/appointment/booking/bookingEnum';
import { alsLogAudit } from '../../../store/actions/als/logAction';
import { closeMask, openMask, skipTab } from '../../../store/actions/mainFrame/mainFrameAction';
import {
    openCommonMessage
} from '../../../store/actions/message/messageAction';
import {
    getLatestPatientEncntrCase,
    getPatientEncounter,
    getPatientPUC,
    putPatientPUC,
    updateState as updatePatientState
} from '../../../store/actions/patient/patientAction';
import {
    pucReasonLog,
    pucReasonLogs,
    updatePatientListField
} from '../../../store/actions/patient/patientSpecFunc/patientSpecFuncAction';
import * as UserUtilities from '../../../utilities/userUtilities';

const pucDialog =(props) => {
    let _landing = null;

    const setLanding = (landing, replaceExist = false) => {
        //const {code,param}
        if (_landing && !replaceExist) {
            // console.log('[PUC] landing exist and not force replace');
            return;
        }
        // console.log('[PUC] set landing', landing);
        _landing = { ...landing };
    };

    const gotoLanding = () => {
        // console.log('[PUC] gotoLanding', this.landing);
        if (_landing) {
            props.skipTab(_landing.code, _landing.params);
            _landing = null;
        }
    };
    const gotoSummary = (patientKey) => {
        // if (this.props.userRoleType === Enum.USER_ROLE_TYPE.COUNTER)
        //     this.skipToPatientSummary({ patientKey });
        // else
        //     this.skipToEncounterSummary({ patientKey });

        const { loginInfo, pucChecking } = props;
        // console.log('[PUC] gotoSummary, landing', this.landing);
        if (_landing != null)
            return;

        let dest;
        if (UserUtilities.isPucHandle(loginInfo, pucChecking)) {
            dest = accessRightEnum.patientSummary;
        }
        else {
            // if (this.props.login.accessRights.find(item => item.name === accessRightEnum.openESAfterSelectedPatient)) {
            //     dest = accessRightEnum.encounterSummary;
            // }
            // else {
            if (UserUtilities.isClinicalBaseRole(loginInfo.userDto))
                dest = accessRightEnum.encounterSummary;
            else
                dest = accessRightEnum.patientSummary;
            // }
        }
        // console.log('[PUC] gotoSummary', patientKey, dest);

        if (dest)
            setLanding({ code: dest });
    };

    const loadPatientPanelCallback = (item, pucChecking) => {
        // const { pucChecking } = this.props;
        // console.log('[PUC] loadPatientPanelCallback', pucChecking);
        if (item.appointmentId) {
            props.getPatientEncounter(item.appointmentId, item.callback);
        } else {
            item.callback && item.callback();
        }
        if (pucChecking) {
            if (pucChecking.pucResult === 100 || pucChecking.pucResult === 101)
                setLanding({ code: accessRightEnum.patientSummary });
            else if (pucChecking.pucResult === 0)
                gotoSummary();
        }
        if (props.serviceCd === 'SHS') {
            props.getLatestPatientEncntrCase({
                patientKey: item.patientKey,
                sspecID: BookingEnum.SHS_APPOINTMENT_GROUP.SKIN_GRP
            });
        }
        gotoLanding();
    };

    const getPatientInfo = (item, nonCheckPUC) => {
        props.alsLogAudit({
            desc: `[Patient List]Get patient/customer info in the patient list. PMI: ${item.patientKey}`,
            dest: 'patient',
            functionName: 'Patient List',
            isEncrypt: true
        });

        props.getPatientPUC(loadPatientPanelCallback, item);
    };

    const handleRetainDocType = () => {
        // const { functionCd } = this.props;
        // props.openMask({ functionCd });
        // let searchParameter = _.cloneDeep(this.props.searchParameter);
        // this.resetPatSearchValue();
        // this.getPatientQueueByPage(searchParameter);
        // props.closeMask({ functionCd });

        // this.refGrid.current.resetGrid();
    };

    const handlePatientUnderCareDialogSave = (reasons, detail) => {
        const { patientSelected, clinic, pucChecking } = props;
        if (patientSelected) {
            props.updatePatientState({
                pucChecking: {
                    ...pucChecking,
                    justificationAction: 'access'
                }
            });

            gotoSummary();
            /* keep for reference */
            getPatientInfo({
                ...patientSelected,
                callback: () => {
                    // patientSelected.callback && patientSelected.callback();
                    props.pucReasonLogs({
                        pmiPucAccessLogs: reasons.map(reason => ({
                            action: 'ACCESS',
                            caseNo: (patientSelected && patientSelected.caseNo) || null,
                            patientKey: patientSelected.patientKey,
                            siteId: clinic && clinic.siteId,
                            svcCd: clinic && clinic.svcCd,
                            pucReasonCd: reason,
                            pucReasonDetl: detail
                        }))
                    });
                    props.openCommonMessage({ msgCode: '111301', showSnackbar: true });
                }
            }, true);
            /* */
        }
        props.updatePatientListField({ patientUnderCareDialogOpen: false, patientUnderCareVersion: null, patientSelected: null });
    };

    const handlePatientUnderCareDialogCancel = (reason, detail) => {
        const { patientSelected, clinic, loginInfo, pucChecking } = props;
        if (patientSelected) {
            props.pucReasonLog({
                action: 'CANCEL',
                caseNo: (patientSelected && patientSelected.caseNo) || null,
                patientKey: patientSelected.patientKey,
                siteId: clinic && clinic.siteId,
                svcCd: clinic && clinic.svcCd,
                pucReasonCd: reason,
                pucReasonDetl: detail
            });
            props.updatePatientState({
                pucChecking: {
                    ...pucChecking,
                    justificationAction: 'cancel'
                }
            });

            const pucHandle = UserUtilities.isPuc102Handle(loginInfo, pucChecking);
            if (pucHandle) {
                setLanding({ code: accessRightEnum.patientSummary });
                /* keep for reference */
                getPatientInfo({
                    ...patientSelected,
                    callback: () => {
                        // patientSelected.callback && patientSelected.callback();
                        props.openCommonMessage({ msgCode: '111301', showSnackbar: true });
                    }
                }, true);
                /* */
            }
            else {
                handleRetainDocType();
                props.updatePatientListField({ isFocusSearchInput: true });
                props.putPatientPUC(null);
            }
        }
        props.updatePatientListField({ patientUnderCareDialogOpen: false, patientUnderCareVersion: null, patientSelected: null });
    };

    return (
        <PatientUnderCareDialog
            onSave={handlePatientUnderCareDialogSave}
            onCancel={handlePatientUnderCareDialogCancel}
            reasonList={props.commonCodeList && props.commonCodeList.puc_reason}
            {...props}
        />
    );
};

const mapStateToProps = (state) => {
    return {
        clinic: state.login.clinic,
        commonCodeList: state.common.commonCodeList,
        loginInfo: state.login.loginInfo,
        patientSelected: state.patientSpecFunc.patientSelected,
        pucChecking: state.patient.pucChecking,
        serviceCd: state.login.service.serviceCd
    };
};

const mapDispatchToProps = {
    alsLogAudit,
    getLatestPatientEncntrCase,
    getPatientEncounter,
    getPatientPUC,
    openCommonMessage,
    pucReasonLog,
    pucReasonLogs,
    putPatientPUC,
    skipTab,
    updatePatientListField,
    updatePatientState
};

export default connect(mapStateToProps, mapDispatchToProps, null, { forwardRef: true })(pucDialog);