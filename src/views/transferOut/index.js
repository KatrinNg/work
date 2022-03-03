import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { CommonUtil } from '../../utilities';
import CIMSButton from '../../components/Buttons/CIMSButton';
import { Grid } from '@material-ui/core';
import CIMSDataGrid from '../../components/Grid/CIMSDataGrid';
import { auditAction } from '../../store/actions/als/logAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import moment from 'moment';
import _ from 'lodash';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import Enum from '../../enums/enum';
import AlsDesc from '../../constants/ALS/alsDesc';
import TransferOutDialog from './transferOutDialog';
import {
    getTransferOut,
    insertTransferOut,
    updateTransferOut,
    deleteTransferOut
} from '../../store/actions/transferOut';
import {
    refreshPatient
} from '../../store/actions/patient/patientAction';

class TransferOut extends Component {
    constructor(props) {
        super(props);
        this.initTransferOutForm = {
            originalLocation: null,
            reason: null,
            nation: null,
            transferDetail: null,
            transferDate: moment(),
            remarks: null
        };
        this.state = {
            isTransferOutDialogOpen: false,
            transferOutList: [],
            transferOutForm: _.cloneDeep(this.initTransferOutForm),
            selected: null
        };
    }

    componentDidMount() {
        this.getTransferOutList();
    }

    getTransferOutList = () => {
        let params = {
            patientKey: this.props.patient.patientKey
        };
        this.props.getTransferOut(params, (data) => {
            let transferOutList = data.map(item => {
                return {
                    ...item,
                    transferDate: item.xferDate ? moment(item.xferDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''
                };
            });
            this.setState({ transferOutList: transferOutList });
        });
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

    onSelectionChanged = (params) => {
        if (params) {
            let selectedRows = params.api.getSelectedRows();
            this.setState({ selected: (selectedRows.length > 0 ? selectedRows[0] : null) });
        }
    }

    getColumn = () => {
        return [
            {
                headerName: '',
                colId: 'index',
                valueGetter: params => params.node.rowIndex + 1,
                minWidth: 50,
                maxWidth: 50,
                pinned: 'left',
                filter: false
            },
            {
                headerName: 'Transfer Date',
                field: 'xferDate',
                valueFormatter: params => moment(params.value).format(Enum.DATE_FORMAT_FOCUS_DMY_VALUE),
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 144
            },
            {
                headerName: 'Original Location',
                field: 'siteName',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 340
            },
            {
                headerName: 'Transfer Detail',
                field: 'xferOutDetlnDesc',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 275
            },
            {
                headerName: 'Transfer Nation',
                field: 'xferOutNationDesc',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 180
            },
            {
                headerName: 'Reason',
                field: 'xferOutRsnDesc',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 200
            },
            {
                headerName: 'Staff Name',
                field: 'updateBy',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 160
            },
            {
                headerName: 'Remarks',
                field: 'rmrk',
                width: 300,
                tooltipField: undefined,
                tooltip: params => params.value
            },
            {
                headerName: 'Come Back Date',
                field: 'comeBackDate',
                width: 180,
                tooltipField: undefined,
                tooltip: params => params.value,
                valueFormatter: params => params.value ? moment(params.value).format(Enum.DATE_FORMAT_FOCUS_DMY_VALUE) : ''
            }
        ];
    }

    handleOnChange = (value, name) => {
        let { transferOutForm } = this.state;
        transferOutForm[name] = value;
        this.setState({ transferOutForm });
        if(name === 'reason'){
            transferOutForm['nation'] = null;
            transferOutForm['transferDetail'] = null;
            this.setState({ transferOutForm });
        }
    }

    handleCreate = () => {
        this.props.auditAction(AlsDesc.CREATE, null, null, false, 'patient');
        this.gridApi.deselectAll();
        let { clinic } = this.props;
        this.setState({
            transferOutForm: {
                originalLocation: clinic.siteCd,
                reason: null,
                nation: null,
                transferDetail: null,
                transferDate: moment(),
                remarks: null
            },
            selected: null,
            isTransferOutDialogOpen: true
        });
    }

    handleUpdate = (selected) => {
        this.props.auditAction(AlsDesc.UPDATE, null, null, false, 'patient');
        let { clinic } = this.props;
        this.setState({
            transferOutForm: {
                originalLocation: clinic.siteCd,
                reason: selected.codSppXferRsnId,
                nation: selected.codNatltyId,
                transferDetail: selected.codSppXferDetlId,
                transferDate: selected.xferDate,
                remarks: selected.rmrk
            },
            isTransferOutDialogOpen: true
        });
    }

    handleDelete = () => {
        this.props.auditAction(AlsDesc.DELETE, null, null, false, 'patient');
        this.props.openCommonMessage({
            msgCode: '130302',
            params: [
                { name: 'HEADER', value: 'Delete Transfer out Record' },
                { name: 'MESSAGE', value: 'Are you sure to delete the record?' }
            ],
            btnActions: {
                btn1Click: () => {
                    this.props.auditAction('Confirm Delete');
                    let params = {
                        patientKey: this.props.patient.patientKey,
                        pmiSppXferOutId: this.state.selected.pmiSppXferOutId,
                        version: this.state.selected.version
                    };
                    this.props.deleteTransferOut(params, () => {
                        this.handleReset();
                    });
                },
                btn2Click: () => {
                    this.props.auditAction('Cancel Delete');
                    this.handleCancel();
                }
            }
        });
    }

    handleSave = () => {
        this.props.auditAction('Save Transfer Out');
        let { selected, transferOutForm } = this.state;
        let { patient, clinic } = this.props;
        const validPromise = this.refs.transferOutRef.isFormValid(false);
        validPromise.then(result => {
            if (result) {
                if (selected) {
                    let params = {
                        pmiSppXferOutId: selected.pmiSppXferOutId,
                        patientKey: patient.patientKey,
                        siteId: clinic.siteId,
                        codSppXferLocId: transferOutForm.transferDetail,
                        xferDate: moment(transferOutForm.transferDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
                        codSppXferRsnId: transferOutForm.reason,
                        rmrk: transferOutForm.remarks,
                        comeBackDate: selected.comeBackDate,
                        codNatltyId: transferOutForm.nation,
                        codSppXferDetlId: transferOutForm.transferDetail,
                        version: selected.version
                    };
                    this.props.updateTransferOut(params, () => {
                        this.handleReset();
                    });
                } else {
                    let params = {
                        patientKey: patient.patientKey,
                        siteId: clinic.siteId,
                        codSppXferLocId: transferOutForm.transferDetail,
                        xferDate: moment(transferOutForm.transferDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
                        codSppXferRsnId: transferOutForm.reason,
                        rmrk: transferOutForm.remarks,
                        codNatltyId: transferOutForm.nation,
                        codSppXferDetlId: transferOutForm.transferDetail
                    };
                    this.props.insertTransferOut(params, () => {
                        this.handleReset();
                    });
                }
            } else {
                this.refs.transferOutRef.focusFail();
            }
        });
    }

    handleCancel = () => {
        this.props.auditAction(AlsDesc.CANCEL, null, null, false, 'patient');
        this.setState({
            isTransferOutDialogOpen: false
        }, () => {
            this.setState({
                transferOutForm: this.initTransferOutForm
            });
            this.gridApi.deselectAll();
        });
    }

    handleReset = () => {
        this.setState({
            isTransferOutDialogOpen: false
        }, () => {
            this.setState({
                transferOutForm: this.initTransferOutForm
            });
            this.gridApi.deselectAll();
            this.getTransferOutList();
            this.props.refreshPatient({
                isRefreshCaseNo: true
            });
        });
    }

    getDialogTitle = () => {
        const { selected } = this.state;
        if(selected){
            return 'Update Transfer out Request';
        }else{
            return 'Create New Transfer out Request';
        }
    }

    filterClinicList = () => {
        const { clinicList, service, clinic } = this.props;
        const { selected } = this.state;
        let _clinicList = [];
        if (selected) {
            _clinicList = (clinicList && clinicList.filter(item => item.svcCd === service.svcCd && item.siteId !== selected.siteIdFr)) || [];
        } else {
            _clinicList = (clinicList && clinicList.filter(item => item.svcCd === service.svcCd && item.siteId !== clinic.siteId)) || [];
        }
        return _clinicList;
    }

    render() {
        const columnDefs = this.getColumn();
        const { classes } = this.props;
        const { isTransferOutDialogOpen, transferOutList, transferOutForm, selected } = this.state;
        const rowData = this.setRowId(transferOutList);
        const clinicList = this.filterClinicList();
        return (
            <Grid container className={classes.root}>
                <Grid container item justify="flex-start" style={{ paddingBottom: 10 }}>
                    <CIMSButton
                        style={{ marginLeft: 0 }}
                        id="transferOut_create"
                        onClick={this.handleCreate}
                    >
                        Create
                    </CIMSButton>
                    <CIMSButton
                        id="transferOut_update"
                        disabled={selected ? false : true}
                        onClick={() => { this.handleUpdate(selected); }}
                    >
                        Update
                    </CIMSButton>
                    <CIMSButton
                        id="transferOut_delete"
                        disabled={selected ? false : true}
                        onClick={this.handleDelete}
                    >
                        Delete
                    </CIMSButton>
                </Grid>
                <Grid item container className={classes.gridStyle}>
                    <CIMSDataGrid
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '59vh',
                            display: 'block'
                        }}
                        disableAutoSize
                        gridOptions={{
                            headerHeight: 50,
                            columnDefs: columnDefs,
                            rowData: rowData,
                            suppressRowClickSelection: false,
                            rowSelection: 'single',
                            enableBrowserTooltips: true,
                            onRowDoubleClicked: params => {
                                this.setState({ selected: params.data }, () => {
                                    this.handleUpdate(params.data);
                                });
                            },
                            getRowHeight: () => 50,
                            getRowNodeId: item => item.rowId.toString(),
                            onGridReady: this.onGridReady,
                            onSelectionChanged: this.onSelectionChanged,
                            postSort: rowNodes => CommonUtil.forceRefreshCells(rowNodes, ['index'])
                        }}
                    />
                </Grid>
                <ValidatorForm ref="transferOutRef">
                    {isTransferOutDialogOpen ?
                        <TransferOutDialog
                            isOpen={isTransferOutDialogOpen}
                            title={this.getDialogTitle()}
                            transferOutForm={transferOutForm}
                            handleOnChange={this.handleOnChange}
                            handleSave={this.handleSave}
                            handleCancel={this.handleCancel}
                            selected={selected}
                            clinicList={clinicList}
                        />
                        : null
                    }
                </ValidatorForm>
            </Grid >
        );
    }
}

const styles = ({
    root: {
        width: '100%',
        padding: '0px 28px 0px 28px'
    }
});

const mapState = state => ({
    serviceList: state.common.serviceList,
    clinicList: state.common.clinicList,
    loginUser: state.login.loginInfo.userDto,
    service: state.login.service,
    clinic: state.login.clinic,
    patient: state.patient.patientInfo
});
const mapDispatch = {
    auditAction,
    openCommonMessage,
    getTransferOut,
    insertTransferOut,
    updateTransferOut,
    deleteTransferOut,
    refreshPatient
};

export default connect(mapState, mapDispatch)(withStyles(styles)(TransferOut));