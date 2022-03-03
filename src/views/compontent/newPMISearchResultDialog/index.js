import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import { colors } from '@material-ui/core';
import _ from 'lodash';
import { PatientUtil } from '../../../utilities';
import { labelRender, getColumns } from './columns';

class NewPMISearchResultDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            column: null,
            selectPatient: null
        };

        this.state.column = getColumns({
            classes: this.props.classes,
            docTypeList: this.props.docTypeList,
            listConfig: this.props.listConfig
        });
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    handleRowClicked = params => {
        let { selectPatient } = this.state;
        if (!selectPatient || (params.data.patientKey && (selectPatient.patientKey !== params.data.patientKey))) {
            this.setState({ selectPatient: params.data });
        } else {
            this.setState({ selectPatient: null });
        }
    }

    handleRowDoubleClicked = params => {
        this.props.handleSelectPatient && this.props.handleSelectPatient(params.data);
    }

    handleOnSelect = () => {
        this.props.handleSelectPatient && this.props.handleSelectPatient(this.state.selectPatient);
    }

    handleOnClose = () => {
        this.setState({ selectPatient: null });
        this.props.handleCloseDialog && this.props.handleCloseDialog();
    }

    rowCustoms = (data) => {
        let _data = data.map((item, index) => ({
            ...item,
            rowId: index
        }));
        return _data;
    }

    columnCustoms = (column, data) => {
        let _column = _.cloneDeep(column);
        let isAllPMIValid = true;
        data && data.forEach(element => {
            if (PatientUtil.isProblemPMI(element.documentPairList)) {
                isAllPMIValid = false;
            }
        });
        if (isAllPMIValid) {
            _column.splice(0, 1);
        }
        return _column;
    }

    render() {
        const {
            classes,
            id,
            title,
            header,
            gridStyle,
            gridOptions,
            okBtnProps,
            cancelBtnProps,
            footer,
            results
        } = this.props;

        const {
            column,
            selectPatient
        } = this.state;

        let _column = this.columnCustoms(column, results || []);
        let _rowData = this.rowCustoms(results || []);
        return (
            <CIMSPromptDialog
                open
                id={id}
                dialogTitle={title}
                classes={{ paper: classes.dialogPaper }}
                dialogContentText={
                    <Grid container>
                        {header}
                        <Grid item xs={12}>
                            <CIMSDataGrid
                                disableAutoSize
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    width: '100%',
                                    height: '64vh',
                                    display: 'block',
                                    ...gridStyle
                                }}
                                gridOptions={{
                                    columnDefs: _column,
                                    rowData: _rowData,
                                    rowSelection: 'single',
                                    onGridReady: this.onGridReady,
                                    getRowHeight: () => 50,
                                    headerHeight: 50,
                                    getRowNodeId: item => item.rowId.toString(),
                                    suppressRowClickSelection: false,
                                    frameworkComponents: {
                                        labelRender: labelRender
                                    },
                                    onRowClicked: this.handleRowClicked,
                                    onRowDoubleClicked: this.handleRowDoubleClicked,
                                    ...gridOptions
                                }}
                            />
                        </Grid>
                    </Grid>
                }
                dialogActions={
                    <Grid container wrap="nowrap" justify="flex-end">
                        {footer}
                        <CIMSButton
                            id={`${id}_confirmBtn`}
                            onClick={this.handleOnSelect}
                            disabled={!selectPatient}
                            children={'OK'}
                            {...okBtnProps}
                        />
                        <CIMSButton
                            id={`${id}_cancelBtn`}
                            onClick={this.handleOnClose}
                            children={'Cancel'}
                            {...cancelBtnProps}
                        />
                    </Grid>
                }
            />
        );
    }
}
const styles = () => ({
    dialogPaper: {
        width: '95%'
    },
    chip: {
        backgroundColor: colors.orange[600],
        color: 'white'
    }
});
const mapState = state => ({
    docTypeList: state.common.commonCodeList && state.common.commonCodeList.doc_type || [],
    listConfig: state.common.listConfig
});
const mapDispatch = {};
export default connect(mapState, mapDispatch)(withStyles(styles)(NewPMISearchResultDialog));