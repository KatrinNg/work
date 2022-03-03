import React from 'react';
import Grid from '@material-ui/core/Grid';
import '../../../../styles/common/customHeaderStyle.scss';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { Checkbox } from '@material-ui/core';
import _ from 'lodash';
import {forceRefreshCells} from '../../../../utilities/commonUtilities';

class CheckBoxRender extends React.Component {

    refresh = () => {
        return false;
    }

    render() {
        const { value, onChange, rowIndex, data } = this.props;
        return (
            <Checkbox
                id={`redistribution_procced_${rowIndex}`}
                checked={value ? true : false}
                onChange={e => onChange(e.target.checked ? 1 : 0, data.rowId)}
                color="primary"
            />
        );
    }
}

class RedistributionMismatchDialog extends React.Component {
    constructor(props) {
        super(props);
    }

    idPrefix = 'redistribution_mismatchDialog';

    column = [
        {
            headerName: '',
            colId:'index',
            valueGetter: params => params.node.rowIndex + 1,
            minWidth: 50,
            maxWidth: 50,
            pinned: 'left',
            filter: false
        },
        {
            field: 'patientInfo',
            headerName: 'Patient Info.',
            width: 300
        },
        { field: 'originalAppt', headerName: 'Original Appt.', width: 300, minWidth: 200 },
        { field: 'suggestedAppt', headerName: 'Suggested Appt.', width: 300, minWidth: 200 },
        {
            headerName: 'Proceed?',
            field: 'proceed',
            cellRenderer: 'checkBoxRender',
            width: 279, minWidth: 150,
            cellRendererParams: {
                onChange: (value, i) => {
                    this.handleOnChange({ 'proceed': value }, i);
                }
            }
        }
    ];

    handleOnChange = (object, index) => {
        let _misMatchList = _.cloneDeep(this.props.rowData);
        _misMatchList[index] = { ..._misMatchList[index], ...object };
        this.props.updateState({ redistributionMismatch: { ...this.props.redistributionMismatch, misMatchList: _misMatchList } });
        const rowNode = this.gridApi.getRowNode(index);
        for (let key in object) {
            rowNode.setDataValue(key, object[key]);
        }
    };

    setRowId = (data) => {
        return data && data.map((item, index) => ({
            ...item,
            rowId: index
        }));
    };

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    };


    render() {
        let { rowData,auditAction } = this.props;
        rowData = this.setRowId(rowData);
        let proceedIndex = rowData.findIndex(item => item.proceed === 1);
        let isDisabledConfirm = proceedIndex === -1;
        return (
            <Grid>
                <CIMSPromptDialog
                    open
                    id={this.idPrefix}
                    dialogTitle={'Redistribution Mismatch'}
                    dialogContentText={
                        <Grid>
                            <CIMSDataGrid
                                // disableAutoSize
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    width: '65vw',
                                    height: '55vh',
                                    display: 'block',
                                    paddingBottom: 8
                                }}
                                gridOptions={{
                                    columnDefs: this.column,
                                    rowData: rowData,
                                    rowSelection: 'single',
                                    onGridReady: this.onGridReady,
                                    getRowHeight: () => 50,
                                    getRowNodeId: item => item.rowId.toString(),
                                    suppressRowClickSelection: true,
                                    frameworkComponents: {
                                        checkBoxRender: CheckBoxRender
                                    },
                                    tooltipShowDelay: 0,
                                    suppressColumnVirtualisation: true,
                                    ensureDomOrder: true,
                                    postSort: rowNodes => forceRefreshCells(rowNodes,['index'])
                                }}
                            />
                        </Grid>
                    }
                    buttonConfig={[
                        {
                            id: `${this.idPrefix}_selectAllBtn`,
                            name: 'Select All',
                            onClick: () => {
                                auditAction('Mismatch Dialog Select All',null, null, false, 'ana');
                                let _misMatchList = _.cloneDeep(this.props.rowData);
                                _misMatchList.forEach(element => {
                                    element.proceed = 1;
                                });
                                this.props.updateState({ redistributionMismatch: { ...this.props.redistributionMismatch, misMatchList: _misMatchList } });
                                this.gridApi.refreshCells({ columns: ['proceed'], force: true });
                            }
                        },
                        {
                            id: `${this.idPrefix}_clearAllBtn`,
                            name: 'Clear All',
                            onClick: () => {
                                auditAction('Mismatch Dialog Clear All',null, null, false, 'ana');
                                let _misMatchList = _.cloneDeep(this.props.rowData);
                                _misMatchList.forEach(element => {
                                    element.proceed = 0;
                                });
                                this.props.updateState({ redistributionMismatch: { ...this.props.redistributionMismatch, misMatchList: _misMatchList } });
                                this.gridApi.refreshCells({ columns: ['proceed'], force: true });
                            }
                        },
                        {
                            id: `${this.idPrefix}_confirmBtn`,
                            name: 'Confirm',
                            disabled: isDisabledConfirm,
                            onClick: () => {
                                auditAction('Mismatch Dialog Confirm',null, null, false, 'ana');
                                this.props.confirm();
                            }
                        },
                        {
                            id: `${this.idPrefix}_cancelBtn`,
                            name: 'Cancel',
                            onClick: () => {
                                auditAction('Close Mismatch Dialog',null, null, false, 'ana');
                                this.props.onClose();
                            }
                        }
                    ]}
                />
            </Grid>
        );
    }
}

export default RedistributionMismatchDialog;