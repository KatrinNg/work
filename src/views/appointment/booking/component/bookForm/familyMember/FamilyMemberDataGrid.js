import { Box, Button, DialogActions, makeStyles, Paper } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CIMSDataGrid from '../../../../../../components/Grid/CIMSDataGrid';
import PmiComponent from '../../../../../../components/Grid/frameworkComponents/PmiComponent';
import PmiGroupComponent from '../../../../../../components/Grid/frameworkComponents/PmiGroupComponent';
import AlsDesc from '../../../../../../constants/ALS/alsDesc';
import { auditAction } from '../../../../../../store/actions/als/logAction';
import {
    UPDATE_ATTN_FAMILY_MEMBER,
    UPDATE_DATE_BACK_FAMILY_MEMBER,
    UPDATE_SELECTED_ATTN_FAMILY_MEMBER,
    UPDATE_SELECTED_DATE_BACK_FAMILY_MEMBER,
    UPDATE_SELECTED_FAMILY_MEMBER
} from '../../../../../../store/actions/appointment/booking/bookingActionType';
import {
    checkIsSelectedPatient,
    familyMembercolumns,
    isPastAppointment
} from '../../../../../../utilities/appointmentUtilities';
import { initFamilyMemberInfo } from '../../../../../../utilities/attendanceUtilities';
import { isTempMemberExist } from '../../../../../../utilities/familyNoUtilities';
import FamilyNumberContext from './FamilyNumberContext';
import './styles.css';

const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(1)
    }
}));

const FamilyMemberDataGrid = ({ toggle, isSelect, notAttendHandler }) => {
    const classes = useStyles();

    const dispatch = useDispatch();

    const { isAttend, isDateBack, isConfirm, isEdit } = useContext(FamilyNumberContext);

    const patientKey = useSelector((state) => state.patient?.patientInfo?.patientKey);

    const {
        selectedFamilyMember,
        selectedAttnFamilyMember,
        selectedDateBackFamilyMember,
        familyMemberData,
        attnFamilyMemberData,
        dateBackFamilyMemberData
    } = useSelector((state) => state.bookingInformation);

    const [gridApi, setGridApi] = useState(null);

    const columnDefs = useMemo(() => familyMembercolumns(isConfirm || isEdit), []);

    const audit = useCallback(
        (desc = '', handleByOriginalApi = true, pmi = null) =>
            dispatch(auditAction(desc, null, null, handleByOriginalApi, 'ana', pmi)),
        [dispatch]
    );

    const updateSelectedFamilyMember = useCallback(
        (selectedData) => dispatch({ type: UPDATE_SELECTED_FAMILY_MEMBER, payload: { selectedData } }),
        [dispatch]
    );

    const updateSelectedAttnFamilyMember = useCallback(
        (selectedData) => dispatch({ type: UPDATE_SELECTED_ATTN_FAMILY_MEMBER, payload: { selectedData } }),
        [dispatch]
    );

    const updateSelectedDateBackFamilyMember = useCallback(
        (selectedData) => dispatch({ type: UPDATE_SELECTED_DATE_BACK_FAMILY_MEMBER, payload: { selectedData } }),
        [dispatch]
    );

    const updateAttnFamilyMember = useCallback(
        (familyMember) => dispatch({ type: UPDATE_ATTN_FAMILY_MEMBER, payload: { familyMember } }),
        [dispatch]
    );

    const updateDateBackFamilyMember = useCallback(
        (familyMember) => dispatch({ type: UPDATE_DATE_BACK_FAMILY_MEMBER, payload: { familyMember } }),
        [dispatch]
    );

    const handleClick = () => {
        audit(AlsDesc.OK, false);

        const selectedNodes = gridApi?.getSelectedNodes();
        // Check selected row
        if (selectedNodes.length > 0) {
            const selectedData = selectedNodes.map((node) => node.data);

            if (isSelect || isAttend || isDateBack) {
                // Select by Patient List
                if (isSelect) {
                    const isPastAppt = isPastAppointment(selectedFamilyMember[0]);

                    const doNotInit = isPastAppt ? 'dateBack' : 'attn';

                    if (isPastAppt) {
                        updateDateBackFamilyMember(familyMemberData);
                        updateSelectedDateBackFamilyMember(
                            selectedData.filter((patient) => patient.patientKey !== patientKey)
                        );
                    } else {
                        updateSelectedAttnFamilyMember(
                            selectedData.filter((patient) => patient.patientKey !== patientKey)
                        );
                        updateAttnFamilyMember(familyMemberData);
                    }

                    notAttendHandler(selectedFamilyMember[0]);
                    initFamilyMemberInfo(doNotInit);
                }

                if (isDateBack) {
                    if (isTempMemberExist(dateBackFamilyMemberData)) return;

                    updateSelectedDateBackFamilyMember(
                        selectedData.filter((patient) => patient.patientKey !== patientKey)
                    );
                }

                if (isAttend) {
                    if (isTempMemberExist(attnFamilyMemberData)) return;

                    updateSelectedAttnFamilyMember(selectedData.filter((patient) => patient.patientKey !== patientKey));
                }
            } else updateSelectedFamilyMember(selectedData.filter((patient) => patient.patientKey !== patientKey));
        } else {
            if (isSelect) notAttendHandler(selectedFamilyMember[0]);

            if (isAttend) updateSelectedAttnFamilyMember([]);
            else if (isDateBack) updateSelectedDateBackFamilyMember([]);
            else updateSelectedFamilyMember([]);
        }

        toggle();
    };

    // eslint-disable-next-line react/jsx-boolean-value
    const WrapPmiComponent = (data) => <PmiComponent data={data} isRegist={true} />;

    const WrapPmiGroupComponent = (data) => (
        <PmiGroupComponent
            isConfirm={isConfirm || isEdit}
            data={data}
            patientKey={patientKey || selectedFamilyMember[0]?.patientKey}
            familyMemberData={familyMemberData}
            selectedFamilyMember={selectedFamilyMember}
        />
    );

    useEffect(() => {
        if (gridApi) {
            switch (
                isAttend
                    ? selectedAttnFamilyMember.length
                    : isDateBack
                    ? selectedDateBackFamilyMember.length
                    : selectedFamilyMember.length
            ) {
                case 0:
                    // Reset selected checkbox
                    gridApi.deselectAll();
                    break;
                default:
                    // Set selected data when selectedFamilyMember is not empty
                    gridApi.forEachNode((node) => {
                        const checked = isAttend
                            ? selectedAttnFamilyMember.filter((data) => data.patientKey === node.data.patientKey)
                            : isDateBack
                            ? selectedDateBackFamilyMember.filter((data) => data.patientKey === node.data.patientKey)
                            : selectedFamilyMember.filter((data) => data.patientKey === node.data.patientKey);
                        if (checked.length > 0) node.setSelected(true);
                    });
            }
        }
    }, [gridApi, selectedFamilyMember.length, selectedAttnFamilyMember.length, selectedDateBackFamilyMember.length]);

    useEffect(() => {
        if (gridApi && toggle && isSelect) gridApi.selectAll();
    }, [gridApi, toggle]);

    const getRowClass = (params) => {
        if (
            params.data.patientKey ===
            (patientKey ||
                selectedFamilyMember[0]?.patientKey ||
                selectedAttnFamilyMember[0]?.patientKey ||
                selectedDateBackFamilyMember[0]?.patientKey)
        ) {
            return 'ag-row-selected';
        } else if (isConfirm || isEdit) {
            const result = checkIsSelectedPatient(familyMemberData, selectedFamilyMember, patientKey, params);
            if (result) return 'ag-row-selected';
        }
    };

    const familyData = useMemo(() => {
        if (isAttend) return attnFamilyMemberData;
        else if (isDateBack) return dateBackFamilyMemberData;
        else return familyMemberData;
    }, [isAttend, isDateBack, familyMemberData.length, attnFamilyMemberData.length, dateBackFamilyMemberData.length]);

    const handleCloseBtn = () => {
        audit(AlsDesc.CLOSE, false);
        toggle();
    };

    const auditRowClick = (e) => audit(`${e.type} PMI ${e.data.patientKey}`, false);

    return (
        <>
            <Paper container className={classes.paper} elevation={3}>
                <CIMSDataGrid
                    disableAutoSize
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '68vh',
                        display: 'block'
                    }}
                    gridOptions={{
                        getRowClass: getRowClass,
                        defaultColDef: {
                            filter: true,
                            sortable: true,
                            resizable: true,
                            cellStyle: {
                                display: 'flex',
                                justifyContent: 'flex-start',
                                alignItems: 'center'
                            }
                        },
                        onGridReady: (params) => setGridApi(params.api),
                        frameworkComponents: {
                            PmiComponent: WrapPmiComponent,
                            PmiGroupComponent: WrapPmiGroupComponent
                        },
                        columnDefs,
                        rowData: familyData,
                        headerHeight: 50,
                        rowHeight: 50,
                        getRowNodeId: (item) => item.patientKey,
                        suppressRowClickSelection: false,
                        suppressFieldDotNotation: true,
                        pagination: true,
                        paginationPageSize: 50,
                        rowSelection: 'multiple',
                        rowMultiSelectWithClick: true,
                        isRowSelectable: function (rowNode) {
                            return isConfirm || isEdit
                                ? false
                                : rowNode.data?.patientKey !==
                                      (patientKey ||
                                          selectedFamilyMember[0]?.patientKey ||
                                          selectedAttnFamilyMember[0]?.patientKey ||
                                          selectedDateBackFamilyMember[0]?.patientKey);
                        },
                        onRowClicked: auditRowClick
                    }}
                    suppressGoToRow
                    suppressDisplayTotal
                />
            </Paper>

            <Box mt={3}>
                <DialogActions>
                    {!isConfirm && !isEdit && (
                        <Button id="okBtn" variant="contained" color="primary" onClick={handleClick}>
                            OK
                        </Button>
                    )}

                    <Button id="closeBtn" variant="contained" color="primary" onClick={handleCloseBtn}>
                        Close
                    </Button>
                </DialogActions>
            </Box>
        </>
    );
};

FamilyMemberDataGrid.propTypes = {
    toggle: PropTypes.func,
    isSelect: PropTypes.bool,
    notAttendHandler: PropTypes.func
};

export default FamilyMemberDataGrid;
