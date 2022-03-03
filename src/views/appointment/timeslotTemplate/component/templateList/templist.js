import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
import { updateState, editTemplate, selectTemplate, initTemplateDetail } from '../../../../../store/actions/appointment/timeslotTemplate';
import Enum from '../../../../../enums/enum';
import {forceRefreshCells} from '../../../../../utilities/commonUtilities';

class TempList extends React.Component {

    state = {
        column: [
            {
                headerName: '',
                colId: 'index',
                valueGetter: (params) => params.node.rowIndex + 1,
                minWidth: 50,
                maxWidth: 50,
                pinned: 'left',
                filter: false
            },
            {
                headerName: 'Service Code',
                field: 'svcCd',
                colId: 'svcCd',
                width: 200
            },
            {
                headerName: 'Site Code',
                field: 'siteId',
                colId: 'siteId',
                width: 200,
                valueFormatter: (params) => {
                    const site = this.props.clinicList.find(item => item.siteId === params.value);
                    return site && site.siteCd;
                }
            },
            {
                headerName: 'Template Name',
                field: 'tmsltTmplName',
                colId: 'tmsltTmplName',
                width: 200
            },
            {
                headerName: 'Template Description',
                field: 'tmsltTmplDesc',
                colId: 'tmsltTmplDesc',
                width: 230
            },
            {
                headerName: 'Updated On',
                field: 'updateDtm',
                colId: 'updateDtm',
                width: 150,
                valueFormatter: (params) => {
                    return params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE);
                }
            },
            {
                headerName: 'Updated By',
                field: 'updateBy',
                colId: 'updateBy',
                width: 150
            }
        ]
    }

    componentDidUpdate(prevProps) {
        if (prevProps.templateListSelected !== this.props.templateListSelected) {
            if (this.props.templateListSelected > -1) {
                const selectedRow = this.gridApi && this.gridApi.getRowNode(this.props.templateListSelected);
                if (selectedRow) {
                    selectedRow.setSelected(true);
                }
            } else {
                this.gridApi && this.gridApi.deselectAll();
            }
        }
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;

        if (this.props.templateListSelected > -1) {
            const selectedRow = this.gridApi.getRowNode(this.props.templateListSelected);
            if (selectedRow) {
                selectedRow.setSelected(true);
            }
        }
    }

    setRowId = (data) => {
        return data && data.map((item, index) => ({
            ...item,
            rowId: index
        }));
    }

    render() {
        const { templateList } = this.props;
        const { column } = this.state;
        const rowData = this.setRowId(templateList);
        return (
            <Grid container>
                <CIMSDataGrid
                    disableAutoSize
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '69vh',
                        display: 'block'
                    }}
                    gridOptions={{
                        columnDefs: column,
                        rowData: rowData,
                        rowSelection: 'single',
                        onGridReady: this.onGridReady,
                        getRowHeight: () => 50,
                        getRowNodeId: item => item.tmsltTmplProfileId.toString(),
                        suppressRowClickSelection: false,
                        onRowClicked: params => {
                            if (this.props.templateListSelected !== params.data.tmsltTmplProfileId) {
                                this.props.updateState({ templateListSelected: params.data.tmsltTmplProfileId });
                                this.props.selectTemplate(params.data.tmsltTmplProfileId);
                            } else {
                                this.props.initTemplateDetail();
                            }
                        },
                        onRowDoubleClicked: params => {
                            this.props.updateState({ templateListSelected: params.data.tmsltTmplProfileId });
                            const selectedRow = this.gridApi.getRowNode(params.data.tmsltTmplProfileId);
                            if (selectedRow) {
                                selectedRow.setSelected(true);
                            }
                            this.props.editTemplate(params.data.tmsltTmplProfileId);
                        },
                        postSort: rowNodes => forceRefreshCells(rowNodes,['index'])
                    }}
                />
            </Grid>
        );
    }
}

const mapState = state => ({
    templateList: state.timeslotTemplate.templateList,
    templateListSelected: state.timeslotTemplate.templateListSelected,
    clinicList: state.common.clinicList
});

const mapDispatch = {
    updateState,
    editTemplate,
    selectTemplate,
    initTemplateDetail
};

export default connect(mapState, mapDispatch)(TempList);