import React from 'react';
import { connect } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { colors } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSTable from '../../../../components/Table/CIMSTable';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import * as PatientUtil from '../../../../utilities/patientUtilities';
import Enum from '../../../../enums/enum';

import { updateState, getPatientById, searchPatient } from '../../../../store/actions/registration/registrationAction';
import { auditAction } from '../../../../store/actions/als/logAction';
import { RegistrationUtil } from '../../../../utilities';

const useStyles = makeStyles(theme => ({
    dialogPaper: {
        width: '75%'
    },
    form: {
        width: '100%'
    },
    errorTips: {
        padding: '5px 0px',
        fontWeight: 'bold'
    },
    chip: {
        backgroundColor: colors.orange[600],
        color: 'white'
    }
}));

const SearchPMIDialog = React.forwardRef((props, ref) => {

    const classes = useStyles();
    const {
        id, searchPMI, docTypeCodeList,
        updateState, getPatientById,
        searchPatient, isOpenSearchPmiPopup//NOSONAR
    } = props;
    const { selected, searchParams } = searchPMI;
    const data = searchPMI.data && searchPMI.data.patientDtos;
    const total = searchPMI.data && searchPMI.data.total;
    const tableRef = React.useRef();

    const updateSearchPMI = (object) => {
        updateState({ searchPMI: { ...searchPMI, ...object } });
    };

    const getLabel = (value, rowData) => {
        if (PatientUtil.isProblemPMI(rowData.documentPairList)) {
            return <Chip className={classes.chip} label="CHECK ID" />;
        } else {
            return null;
        }
    };

    const getEngName = (value, rowData) => {
        return CommonUtil.getFullName(rowData.engSurname, rowData.engGivename);
    };

    const getFormatDob = (value,rowData) => {
        return RegistrationUtil.getDobDateByFormat(rowData.exactDobCd, value);
    };

    const getPrimaryDocType = (value, rowData) => {
        const docDto = PatientUtil.getPatientPrimaryDoc(rowData.documentPairList);
        if (docDto) {
            const docTypeCode = docTypeCodeList.find(item => item.code === docDto.docTypeCd);
            return docTypeCode && docTypeCode.engDesc;
        }
        return '';
    };

    const getPrimaryDocNo = (value, rowData) => {
        const docDto = PatientUtil.getPatientPrimaryDoc(rowData.documentPairList);
        return PatientUtil.getFormatDocNoByDocumentPair(docDto);
    };

    const getAdditionalDocType = (value, rowData) => {
        const docDto = PatientUtil.getPatientAdditionalDoc(rowData.documentPairList);
        if (docDto) {
            if(docDto.docTypeCd === Enum.DOC_TYPE.HKID_ID){
                return '';
            }
            const docTypeCode = docTypeCodeList.find(item => item.code === docDto.docTypeCd);
            return docTypeCode && docTypeCode.engDesc;
        }
        return '';
    };

    const getAdditionalDocNo = (value, rowData) => {
        const docDto = PatientUtil.getPatientAdditionalDoc(rowData.documentPairList);
        if(docDto){
            if(docDto.docTypeCd === Enum.DOC_TYPE.HKID_ID){
                return '';
            }
            return PatientUtil.getFormatDocNoByDocumentPair(docDto);
        }
        return '';
    };


    const selectPMI = (patientKey) => {
        props.auditAction('Select PMI');
        getPatientById(patientKey, () => {
            updateState({
                searchPMI: {
                    ...searchPMI,
                    selected: null,
                    data: null,
                    searchParams: null
                },
                isOpenSearchPmiPopup: false
            });
        });
    };

    const getTableRows = (data) => {
        let tableRows = [
            { name: 'label', label: '', width: 100, align: 'center', customBodyRender: getLabel },
            { name: 'engName', label: 'English Name', width: 120, customBodyRender: getEngName },
            { name: 'nameChi', label: 'Chinese Name', width: 100 },
            { name: 'docType', label: 'Doc. Type', width: 120, customBodyRender: getPrimaryDocType },
            { name: 'docNo', label: 'Doc. No.', width: 100, customBodyRender: getPrimaryDocNo },
            { name: 'addDocType', label: 'Additional Doc. Type', width: 120, customBodyRender: getAdditionalDocType },
            { name: 'addDocNo', label: 'Additional Doc. No.', width: 100, customBodyRender: getAdditionalDocNo },
            { name: 'dob', label: 'D.O.B.', width: 100, customBodyRender: getFormatDob },
            { name: 'genderCd', label: 'Sex', width: 50 }
        ];
        let isAllPMIValid = true;
        data && data.forEach(element => {
            if (PatientUtil.isProblemPMI(element.documentPairList)) {
                isAllPMIValid = false;
            }
        });
        if (isAllPMIValid) {
            tableRows.splice(0,1);
        }
        return tableRows;
    };

    const getTableOptions = () => {
        return {
            rowHover: true,
            rowsPerPage: 10,
            rowsPerPageOptions: [10, 15, 20],
            onSelectIdName: 'patientKey',
            onSelectedRow: (rowId, rowData, selectedData) => {
                const _selected = selectedData.length === 0 ? null : selectedData[0];
                updateSearchPMI({ selected: _selected });
            },
            onRowDoubleClick: (rowData) => {
                selectPMI(rowData.patientKey);
            }
        };
    };

    const handleOnSelect = () => {
        if (selected) {
            selectPMI(selected && selected.patientKey);
        }
    };

    const handleOnClose = () => {
        props.auditAction('Cancel Select PMI', null, null, false, 'patient');
        updateState({
            searchPMI: {
                ...searchPMI,
                selected: null,
                data: null,
                searchParams: null
            },
            isOpenSearchPmiPopup: false
        });
    };

    const handleOnChangePageOrSize = (event, newPage, rowPerPage) => {
        if (searchParams) {
            let _searchParams = { ...searchParams };
            _searchParams.pageNum = newPage + 1;
            _searchParams.pageSize = rowPerPage;
            searchPatient(_searchParams);
        }
    };

    React.useEffect(() => {
        if (tableRef.current) {
            if (selected) {
                tableRef.current.setSelected(selected.patientKey);
            } else {
                tableRef.current.clearSelected();
            }
        }
    }, [selected]);

    let tRows = getTableRows(data);
    let tOptions = getTableOptions();
    return (
        <Grid>
            <CIMSPromptDialog
                open={isOpenSearchPmiPopup}
                id={`${id}_searchPMI`}
                dialogTitle="PMI Record"
                classes={{ paper: classes.dialogPaper }}
                dialogContentText={
                    <Grid container>
                        <Grid item xs={12}>
                            <Typography color="error" className={classes.errorTips}>
                                Please review all record(s) and identify those required to be marked as ‘Problem PMI’ before creating new registration:
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <CIMSTable
                                innerRef={tableRef}
                                id={`${id}_searchPMI_table`}
                                data={data || []}
                                options={tOptions}
                                rows={tRows}
                                remote
                                totalCount={total || 0}
                                onChangePage={handleOnChangePageOrSize}
                                onChangeRowsPerPage={handleOnChangePageOrSize}
                            />
                        </Grid>
                    </Grid>
                }
                dialogActions={
                    <Grid container wrap="nowrap" justify="flex-end">
                        <CIMSButton
                            id={`${id}_searchPMI_confirmBtn`}
                            onClick={handleOnSelect}
                        >Select</CIMSButton>
                        <CIMSButton
                            id={`${id}_searchPMI_cancelBtn`}
                            onClick={handleOnClose}
                        >Cancel</CIMSButton>
                    </Grid>
                }
            />
        </Grid>
    );
});

const stateProps = (state) => {
    return {
        searchPMI: state.registration.searchPMI,
        docTypeCodeList: state.common.commonCodeList.doc_type || [],
        isOpenSearchPmiPopup: state.registration.isOpenSearchPmiPopup
    };
};

const dispatchProps = {
    updateState,
    getPatientById,
    searchPatient,
    auditAction
};

export default connect(stateProps, dispatchProps)(SearchPMIDialog);