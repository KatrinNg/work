import { Box, Button, DialogActions, makeStyles, Paper } from '@material-ui/core';
import * as PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import accessRightEnum from '../../../../enums/accessRightEnum';
import { auditAction } from '../../../../store/actions/als/logAction';
import { addTabs } from '../../../../store/actions/mainFrame/mainFrameAction';
import { getPatientById, getPatientEncounter } from '../../../../store/actions/patient/patientAction';
import { handleNextPatientForFamilyEncounterSearch } from '../../../../utilities/commonUtilities';
import { familyEncounterColumns } from '../../../../utilities/familyEncounterUtilities';
import { switchPatient } from '../../../../utilities/patientUtilities';
import { alsLogAudit } from '../../../../store/actions/als/logAction';

const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(1)
    }
}));

const FamilyEncounterSearchGrid = ({ toggle }) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const familyEncounterSearchList = useSelector(state => state.patient.familyEncounterSearchList);
    const accessRights = useSelector(state => state.login.accessRights);
    const columnDefs = useMemo(() => familyEncounterColumns, []);
    const [selectPatient, setSelectPatient] = useState(null);

    const openEncounterSummary = ({ patientKey, apptId, callback }) => {
        dispatch(auditAction('Open Encounter Summary from Family Encounter Search Dialog',null,null,false,'patient'));

        if (patientKey) {
            const encounterSummaryTab = accessRights.find((el) => el.name === accessRightEnum.encounterSummary);
            const getPatientFunc = () => {
                dispatch(alsLogAudit({
                    desc: `[FamilyEncounterSearch] Switch Patient. PMI: ${patientKey} Appt: ${apptId}`,
                    dest: 'patient',
                    functionName: 'FamilyEncounterSearch',
                    isEncrypt: true
                }));
                let params = {
                    patientKey,
                    appointmentId: apptId
                };
                switchPatient({
                    patient: params,
                    needPUC: true,
                    dest: accessRightEnum.encounterSummary
                });
                // let params = {
                //     patientKey,
                //     appointmentId: apptId,
                //     callBack: () => {
                //         apptId && dispatch(getPatientEncounter(apptId));
                //         callback && callback();
                //         dispatch(addTabs(encounterSummaryTab));

                //         // this.props.mainFrameUpdateField({
                //         //     curCloseTabMethodType: doCloseFuncSrc.null
                //         // });
                //     }
                // };
                // dispatch(getPatientById(params));
            };

            // this.props.mainFrameUpdateField({
            //     curCloseTabMethodType: doCloseFuncSrc.CLOSE_BY_HANDLE_BEFORE_OPEN_PATIENT_PANEL
            // });
            handleNextPatientForFamilyEncounterSearch(patientKey, getPatientFunc, toggle);
        }
    };

    const handleOkClicked = () => {
        selectPatient && openEncounterSummary(selectPatient);
    };

    const handleRowClicked = ({data}) => {
        const rowUniqueKey = data.patientKey+data.encntrTypeDesc+data.apptId;

        setSelectPatient((prevPatient) => {
            const selectPatientRowUniqueKey = prevPatient?.patientKey+prevPatient?.encntrTypeDesc+prevPatient?.apptId;
            if (!prevPatient || (rowUniqueKey && (selectPatientRowUniqueKey !== rowUniqueKey))) return data;
            return null;
        });
    };

    return (
        <>
            <Paper container className={classes.paper} elevation={3}>
                <CIMSDataGrid
                    disableAutoSize
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '78vh',
                        display: 'block'
                    }}
                    gridOptions={{
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
                        rowStyle: {
                            cursor: 'pointer'
                        },
                        columnDefs,
                        rowData: familyEncounterSearchList,
                        headerHeight: 50,
                        rowHeight: 50,
                        getRowNodeId: (item) => item.patientKey+item.encntrTypeDesc+item.apptId,
                        suppressFieldDotNotation: true,
                        pagination: true,
                        paginationPageSize: 50,
                        onRowClicked: handleRowClicked,
                        onRowDoubleClicked: (params) => {
                            params.data && openEncounterSummary(params.data);
                        },
                        suppressRowClickSelection: false,
                        rowSelection: 'single'
                    }}
                    suppressGoToRow
                    suppressDisplayTotal
                />
            </Paper>

            <Box mt={3}>
                <DialogActions>
                    <Box mr={1}>
                        <Button variant="contained" color="primary" onClick={handleOkClicked} disabled={!selectPatient}>
                            Ok
                        </Button>
                    </Box>
                    <Button variant="contained" color="primary" onClick={toggle}>
                        Close
                    </Button>
                </DialogActions>
            </Box>
        </>
    );
};

FamilyEncounterSearchGrid.propTypes = {
    toggle: PropTypes.func
};

export default FamilyEncounterSearchGrid;
