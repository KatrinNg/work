import React from 'react';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import moment from 'moment';
import CIMSPromptDialog from '../../../../../components/Dialog/CIMSPromptDialog';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
import * as PatientUtil from '../../../../../utilities/patientUtilities';
import * as CommonUtil from '../../../../../utilities/commonUtilities';
import Enum from '../../../../../enums/enum';

const style = () => ({
    dialogPaper: {
        width: '75%'
    }
});

const getDocTypeAndNO = (docPairList, docTypeList) => {
    if (!docPairList) {
        return '';
    }
    let priDocPair = docPairList.find(item => item.isPrimary === 1);
    if (!priDocPair) {
        return '';
    }
    let docTpye = docTypeList.find(item => item.code === priDocPair.docTypeCd);
    let docNo = PatientUtil.getFormatDocNoByDocumentPair(priDocPair);

    return `${ docTpye && docTpye.engDesc || priDocPair.docTypeCd } : ${ docNo }`;
};

const getEHRSS = (ehrInfo) => {
    if (!ehrInfo) {
        return 'Not Joined';
    } else {
        let isMatch = parseInt(ehrInfo.isMatch || 0);
        if (isMatch > 0) {
            return 'Joined';
        } else {
            return 'Not Joined';
        }
    }
};

const formatEncounter = (encounter) => {
    if (encounter) {
        let index = encounter.indexOf('(');
        let dateStr = encounter.substring(0, index);
        let rest = encounter.substring(index, encounter.length);
        dateStr = moment(dateStr).format(Enum.DATE_FORMAT_EDMY_VALUE);
        let formatEncounterStr = `${ dateStr } ${ rest }`;
        return formatEncounterStr;
    } else {
        return 'No';
    }

};

const formatPMIStatus = (value) => {
    if (value === 'N') {
        return 'Permanent';
    }
    if (value === 'T') {
        return 'Temporary PMI';
    }
};

const getColumn = (docTypeList) => {
    return [
        {
            headerName: 'PMI Number',
            field: 'patientKey',
            colId: 'patientKey',
            width: 150,
            valueGetter: params => {
                return PatientUtil.getFormatDHPMINO(params.data && params.data.patientKey, params.data && params.data.idSts);
            }
        },
        {
            headerName: 'Document Type & No.',
            field: 'documentPairList',
            width: 300,
            // maxWidth: 300,
            valueFormatter: params => getDocTypeAndNO(params.value, docTypeList)
        },
        {
            headerName: 'Eng Full Name',
            field: '',
            colId: '',
            width: 300,
            valueFormatter: params => CommonUtil.getFullName(params.data.engSurname, params.data.engGivename)
        },
        {
            headerName: 'Sex',
            field: 'genderCd',
            colId: 'genderCd',
            width: 70
        },
        {
            headerName: 'Date of Birth',
            field: 'dob',
            colId: 'dob',
            width: 150,
            // maxWidth: 150,
            valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE)
        },
        {
            headerName: 'eHRSS',
            field: 'patientEhr',
            width: 160,
            valueFormatter: params => getEHRSS(params.value)
        },
        {
            headerName: 'Encounter',
            field: 'encounter',
            width: 200,
            valueFormatter: params => formatEncounter(params.value)
        },
        {
            headerName: 'Future Appt.',
            field: 'futureAppt',
            width: 150,
            valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) || 'No'
        },
        {
            headerName: 'PMI Status',
            field: 'idSts',
            colId: 'idSts',
            width: 150,
            valueFormatter: params => formatPMIStatus(params.value)
        }
    ];
};


// const patientSearchResultDialog = React.forwardRef((props, ref) => {
class PatientSearchResultDialog extends React.Component {

    state = {
        selectPatient: null
    }

    componentWillUnmount() {
        this.setState = () => false;
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    setRowId = (data) => {
        return data.map((item, index) => ({
            ...item,
            rowId: index
        }));
    }
    handleOnClose = () => {
        this.setState({selectPatient: null});
        this.props.handleCloseDialog();
    }
    handleOnSelect = () => {
        const selectPatient = this.state.selectPatient;
        this.props.handleSelectPatient(selectPatient);
    }

    render() {
        const {id, searchResultList, classes} = this.props;
        // const classes = styles();
        // const { column } = this.state;
        const column = getColumn(this.props.docTypeList);
        const rowData = this.setRowId(searchResultList);
        return (
            <Grid>
                <CIMSPromptDialog
                    open={searchResultList.length > 1}
                    id={id}
                    dialogTitle={'Search Result'}
                    classes={{paper: classes.dialogPaper}}
                    dialogContentText={
                        <Grid container>
                            <Grid item xs={12}>
                                <CIMSDataGrid
                                    disableAutoSize
                                    gridTheme="ag-theme-balham"
                                    divStyle={{
                                        width: '100%',
                                        height: '64vh',
                                        display: 'block'
                                    }}
                                    gridOptions={{
                                        columnDefs: column,
                                        rowData: rowData,
                                        rowSelection: 'single',
                                        onGridReady: this.onGridReady,
                                        getRowHeight: () => 50,
                                        getRowNodeId: item => item.rowId.toString(),
                                        suppressRowClickSelection: false,
                                        onRowClicked: params => {
                                            let {selectPatient} = this.state;
                                            if (!selectPatient || (params.data.patientKey && (selectPatient.patientKey !== params.data.patientKey))) {
                                                this.setState({selectPatient: params.data});
                                            } else {
                                                this.setState({selectPatient: null});
                                            }
                                        },
                                        onRowDoubleClicked: params => {
                                            // handleUpdate(params.data.userId);
                                            this.props.handleSelectPatient(params.data);
                                        }
                                        // frameworkComponents: {
                                        //     siteRender: SiteRender,
                                        //     actionRender: ActionRender,
                                        //     adminRender: AdminRender,
                                        //     primarySiteRender: PrimarySiteRender,
                                        //     effDateRender: EffDateRender,
                                        //     expiryDateRender: ExpiryDateRender
                                        // },
                                        // context: {
                                        //     pageStatus: this.props.pageStatus,
                                        //     isNonEdit: isNonEdit,
                                        //     originalUser: this.props.sourceUser
                                        // },
                                        // suppressKeyboardEvent: this.suppressEnter
                                    }}
                                />
                            </Grid>
                        </Grid>
                    }
                    dialogActions={
                        <Grid container wrap="nowrap" justify="flex-end">
                            <CIMSButton
                                id={`${ id }_confirmBtn`}
                                onClick={this.handleOnSelect}
                                disabled={!this.state.selectPatient}
                            >OK</CIMSButton>
                            <CIMSButton
                                id={`${ id }_cancelBtn`}
                                onClick={this.handleOnClose}
                            >Cancel</CIMSButton>
                        </Grid>
                    }
                />
            </Grid>
        );
    }
}

const mapState = (state) => ({
    docTypeList: state.common.commonCodeList.doc_type
});


export default connect(mapState)(withStyles(style)(PatientSearchResultDialog));