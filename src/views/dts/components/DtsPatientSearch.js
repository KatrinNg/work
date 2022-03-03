import React, { useRef, useState, useEffect, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import _ from 'lodash';

import Enum from '../../../enums/enum';
import accessRightEnum from '../../../enums/accessRightEnum';
import PatientSearchGroup from '../../compontent/patientSearchGroup';
import PatientSearchDialog from '../../compontent/patientSearchResultDialog';
import PatientUnderCareDialog from '../../patientSpecificFunction/component/patientUnderCareDialog';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import * as CommonUtilities from '../../../utilities/commonUtilities';
import { getPatientInfo } from '../../../utilities/dtsUtilities';
import { setSearchParams, resetById, searchPatient, setSelectedPatient, setPUCParams } from '../../../store/actions/dts/patient/DtsPatientSearchAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { skipTab } from '../../../store/actions/mainFrame/mainFrameAction';
import { getMedicalSummaryVal } from '../../../store/actions/medicalSummary/medicalSummaryAction';
import { getPatientById } from '../../../store/actions/patient/patientAction';
import { checkPatientUnderCare, pucReasonLog } from '../../../store/actions/patient/patientSpecFunc/patientSpecFuncAction';

import '../../../styles/dts/DtsPatientSearch.scss';

const styles = {
    form: {
        display: 'contents'
    }
};

const DtsPatientSearch = React.forwardRef((props, ref) => {
    const { classes
        , didLoadPatient, onResetPatientSearch
        , customPatientNotFoundAction
        //, onSavePUCJustification, onCancelPUCJustification
        , initSearchPatientParam
        , id } = props;

    const patSearchTypeList = useSelector(state => state.common.patSearchTypeList);
    const service = useSelector(state => state.login.service);
    const clinic = useSelector(state => state.login.clinic);
    const stateSearchParam = useSelector(state => state.dtsPatientSearch.searchParams.find(e => e.id === id));
    const searchResult = useSelector(state => state.dtsPatientSearch.patientLists.find(e => e.id === id));
    const pucParam = useSelector(state => state.dtsPatientSearch.pucParams.find(e => e.id === id));
    const pucReasonList = useSelector(state => state.common.commonCodeList.puc_reason);
    const clinicConfig = useSelector(state => state.common.clinicConfig);
    const dispatch = useDispatch();

    const searchInputRef = useRef(null);

    let clinicConfigSearchType = CommonUtilities.getHighestPrioritySiteParams(
        Enum.CLINIC_CONFIGNAME.PAT_SEARCH_TYPE_DEFAULT,
        clinicConfig,
        { siteId: clinic.siteId, serviceCd: clinic.svcCd }
    );

    const initSearchParam = initSearchPatientParam ? { isFocusSearchInput: false, patientSearchParam: initSearchPatientParam} : null;
    const defaultSearchParam = { isFocusSearchInput: false, patientSearchParam: { searchType: clinicConfigSearchType.paramValue ? clinicConfigSearchType.paramValue : Enum.DOC_TYPE.HKID_ID, searchValue: ''}};

    // Use search parameters in redux first, then setting in caller provided initial parameters, then default parameters
    const searchParam = stateSearchParam || initSearchParam || defaultSearchParam;
    const updateSearchParam = (newParam) => {
        dispatch(setSearchParams(id, newParam));
    };

    const searchInputOnBlur = (patSearchParam) => {
        // Trigger patient search
        const { searchType, searchString } = patSearchParam;
        if (searchString) {
            let params = {
                searchStr: searchString,
                docType: searchType
            };
            dispatch(searchPatient(id, params));
        }
    };

    const autoFocus = () => searchInputRef.current.autoFocus();

    const resetResult = () => {
        dispatch(resetById(id));
    };

    const resetPatientSearch = () => {
        onResetPatientSearch && onResetPatientSearch();
        resetResult();
    };

    const handleSelectPatient = (selectPatient) => {
        dispatch(setSelectedPatient(id, selectPatient));
    };

    const loadPatientCallback = (appointmentList, patientLoadParam) => {
        didLoadPatient && didLoadPatient(patientLoadParam.patient, appointmentList);
    };

    const handlePatientUnderCareDialogSave = (reason, detail) => {
        const { patientInfoParams } = pucParam;
        if (patientInfoParams) {
            getPatientInfo({
                ...patientInfoParams,
                callback: (appointmentList, patientLoadParam) => {
                    //patientInfoParams.callback && patientInfoParams.callback(patient);
                    loadPatientCallback(appointmentList, patientLoadParam);
                    dispatch(pucReasonLog({
                        action: 'ACCESS',
                        caseNo: (patientInfoParams && patientInfoParams.caseNo) || null,
                        patientKey: patientInfoParams.patientKey,
                        siteId: clinic && clinic.siteId,
                        svcCd: clinic && clinic.svcCd,
                        pucReasonCd: reason,
                        pucReasonDetl: detail
                    }));
                    dispatch(openCommonMessage({ msgCode: '111301', showSnackbar: true }));
                }
            }, true, resetPatientSearch);
        }
        dispatch(setPUCParams(id, {dialogOpen: false, patientInfoParams: null}));
    };

    const handlePatientUnderCareDialogCancel = (reason, detail) => {
        const { patientInfoParams } = pucParam;
        if (patientInfoParams) {
            dispatch(pucReasonLog({
                action: 'CANCEL',
                caseNo: (patientInfoParams && patientInfoParams.caseNo) || null,
                patientKey: patientInfoParams.patientKey,
                siteId: clinic && clinic.siteId,
                svcCd: clinic && clinic.svcCd,
                pucReasonCd: reason,
                pucReasonDetl: detail
            }));
        }
        dispatch(setPUCParams(id, {dialogOpen: false, patientInfoParams: null}));
        resetPatientSearch();
    };

    useEffect(() => {
        updateSearchParam(searchParam);
        autoFocus();

        return () => {
            resetResult();
        };
    }, []);

    useEffect(() => {
        if (searchResult && searchResult.data){
            if (searchResult.data.length == 1){
                let patientInfoParams = { patientKey: searchResult.data[0].patientKey, callback: loadPatientCallback };
                getPatientInfo(
                    patientInfoParams,
                    false,
                    resetPatientSearch,
                    setPUCParams(id, {dialogOpen: true, patientInfoParams })
                );
                resetPatientSearch();
            }
            else if (searchResult.data.length == 0){
                if (customPatientNotFoundAction) {
                    customPatientNotFoundAction();
                }
                else {
                    // Default create new patient if patient not found
                    let searchTypeObj = patSearchTypeList.find(item => item.searchTypeCd === searchParam.patientSearchParam.searchType);
                    dispatch(openCommonMessage({
                        msgCode: '110137',
                        btnActions: {
                            btn1Click: () => {
                                const params = {
                                    searchType: searchTypeObj.isDocType === 1 ? searchTypeObj.searchTypeCd : Enum.DOC_TYPE.HKID_ID,
                                    searchString: searchTypeObj.isDocType === 1 || searchTypeObj.searchTypeCd === 'PMIDOC' ? searchParam.patientSearchParam.searchValue : '',
                                    action: 'createNew',
                                    redirectFrom: 'patientList'
                                };
                                dispatch(skipTab(
                                    accessRightEnum.registration,
                                    params,
                                    true
                                ));
                                resetPatientSearch();
                            },
                            btn2Click: () => {
                                resetPatientSearch();
                            }
                        }
                    }));
                }
            }
        }
    });

    useImperativeHandle(ref, () => ({
        focus: () => {
            autoFocus();
        },
        setPatientSearchParam: (patientSearchParam) => {
            updateSearchParam({ patientSearchParam });
        },
        reset: () => {
            resetPatientSearch();
        }
    }));

    return <ValidatorForm className={classes.form}>
        <PatientSearchGroup
            innerRef={searchInputRef}
            id={id + '_pateint_group'}
            docTypeList={patSearchTypeList || []}
            allDocType={false}
            patientSearchParam={searchParam.patientSearchParam}
            optVal={'searchTypeCd'}
            optLbl={'dspTitle'}
            updateState={updateSearchParam}
            searchInputOnBlur={searchInputOnBlur}
        >
        </PatientSearchGroup>
        {
            searchResult && searchResult.data && searchResult.data.length > 1 ?
                <PatientSearchDialog
                    id={id + '_patient_search_result_dialog'}
                    searchResultList={searchResult.data || []}
                    handleCloseDialog={resetPatientSearch}
                    handleSelectPatient={handleSelectPatient}
                /> : null
        }
        {
            pucParam && pucParam.dialogOpen ?
                <PatientUnderCareDialog className={classes.pucDialog}
                    onSave={handlePatientUnderCareDialogSave}
                    onCancel={handlePatientUnderCareDialogCancel}
                    reasonList={pucReasonList}
                />:null
        }
    </ValidatorForm>;
});

export default withStyles(styles)(DtsPatientSearch);
