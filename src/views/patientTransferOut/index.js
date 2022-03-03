import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { CommonUtil, DateUtil, PatientUtil } from '../../utilities';
import CIMSButton from '../../components/Buttons/CIMSButton';
import { Grid } from '@material-ui/core';
import CIMSDataGrid from '../../components/Grid/CIMSDataGrid';
import TransferOutDialog from './transferOutDialog';
import { auditAction } from '../../store/actions/als/logAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import {
    getPatientTransferList,
    insertPatientTransfer,
    updatePatientTransfer,
    deletePatientTransfer
} from '../../store/actions/patientTransferOut';
import moment from 'moment';
import _ from 'lodash';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import Enum from '../../enums/enum';
import AlsDesc from '../../constants/ALS/alsDesc';

class PatientTransferOut extends Component {
    constructor(props) {
        super(props);
        this.initTransferOutForm = {
            staffName: null,
            recordID: null,
            originalLocation: null,
            transferTo: null,
            transferDate: moment(),
            reason: null,
            remarks: null
        };
        this.state = {
            isTransferOutDialogOpen: false,
            patientTransferList: [],
            transferOutForm: _.cloneDeep(this.initTransferOutForm),
            selected: null
        };
    }

    componentDidMount() {
        this.getPatientTransferList();
    }

    getPatientTransferList = () => {
        let params = {
            patientKey: this.props.patient.patientKey,
            svcCd: this.props.service.svcCd
        };
        this.props.getPatientTransferList(params, (data) => {
            let patientTransferList = data.map(item => {
                return {
                    ...item,
                    transferDate: item.xferDate ? moment(item.xferDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''
                };
            });
            this.setState({ patientTransferList: patientTransferList });
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
                headerName: 'Transfer Date',
                field: 'transferDate',
                comparator: DateUtil.formatDateComparator(Enum.DATE_FORMAT_EDMY_VALUE),
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 144
            },
            {
                headerName: 'Paper base record ID',
                field: 'recIdTxt',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 205
            },
            {
                headerName: 'Original Location',
                field: 'siteNameFr',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 295
            },
            {
                headerName: 'Transfer to',
                field: 'siteNameTo',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 295
            },
            {
                headerName: 'Staff Name',
                field: 'staffName',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 280
            },
            {
                headerName: 'Reason',
                field: 'rsn',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 305
            },
            {
                headerName: 'Remarks',
                field: 'rmrk',
                width: 305,
                tooltipField: undefined,
                tooltip: params => params.value
            }
        ];
    }

    handleOnChange = (value, name) => {
        let { transferOutForm } = this.state;
        transferOutForm[name] = value;
        this.setState({ transferOutForm });
    }

    handleCreate = () => {
        this.props.auditAction(AlsDesc.CREATE, null, null, false, 'patient');
        this.gridApi.deselectAll();
        let { loginUser, patient, clinic } = this.props;
        const primaryDocPair = patient.documentPairList.find(item => item.isPrimary === 1);

        this.setState({
            transferOutForm: {
                staffName: [(loginUser.engSurname || ''), (loginUser.engGivName || '')].join(' ').trim(),
                recordID: primaryDocPair.docNo && primaryDocPair.docNo.trim() || '',
                originalLocation: clinic.clinicName || '',
                transferTo: null,
                transferDate: moment(),
                reason: null,
                remarks: null
            },
            isTransferOutDialogOpen: true
        });
    }

    handleUpdate = (selected) => {
        this.props.auditAction(AlsDesc.UPDATE, null, null, false, 'patient');
        this.setState({
            transferOutForm: {
                staffName: selected.staffName || '',
                recordID: selected.recIdTxt || '',
                originalLocation: selected.siteNameFr || '',
                transferTo: (selected.siteIdTo !== selected.siteIdFr) ? selected.siteIdTo : null,
                transferDate: selected.xferDate || '',
                reason: selected.rsn || '',
                remarks: selected.rmrk || ''
            },
            isTransferOutDialogOpen: true
        });
    }

    handleDelete = () => {
        this.props.auditAction(AlsDesc.DELETE, null, null, false, 'patient');
        this.props.openCommonMessage({
            msgCode: '130302',
            params: [
                { name: 'HEADER', value: 'Confirm Delete' },
                { name: 'MESSAGE', value: 'Do you confirm the delete action?' }
            ],
            btnActions: {
                btn1Click: () => {
                    this.props.auditAction('Confirm Delete');
                    let params = {
                        recXferId: this.state.selected.recXferId
                    };
                    this.props.deletePatientTransfer(params, () => {
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
        this.props.auditAction('Save Patient Transfer Out');
        let { selected, transferOutForm } = this.state;
        let { patient, clinic } = this.props;
        const validPromise = this.refs.transferOutRef.isFormValid(false);
        validPromise.then(result => {
            if (result) {
                if (selected) {
                    let params = {
                        recXferId: selected.recXferId,
                        recIdTxt: transferOutForm.recordID,
                        patientKey: selected.patientKey,
                        rmrk: transferOutForm.remarks,
                        rsn: transferOutForm.reason,
                        siteIdFr: selected.siteIdFr,
                        siteIdTo: transferOutForm.transferTo,
                        staffName: transferOutForm.staffName,
                        xferDate: moment(transferOutForm.transferDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
                        version: selected.version
                    };
                    this.props.updatePatientTransfer(params, () => {
                        this.handleReset();
                    });
                } else {
                    let params = {
                        recIdTxt: transferOutForm.recordID,
                        patientKey: patient.patientKey,
                        rmrk: transferOutForm.remarks,
                        rsn: transferOutForm.reason,
                        siteIdFr: clinic.siteId,
                        siteIdTo: transferOutForm.transferTo,
                        staffName: transferOutForm.staffName,
                        xferDate: moment(transferOutForm.transferDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
                    };
                    this.props.insertPatientTransfer(params, () => {
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
            this.getPatientTransferList();
        });
    }

    getDialogTitle = () => {
        const { patient, classes } = this.props;
        let engNameArr = [(patient.engSurname || ''), (patient.engGivename || '')];
        let engName = engNameArr.join(' ').trim();
        let nameChi = (patient.nameChi || '');
        return <><span className={classes.titleMarginTop}>Transfer out </span>({<span className={classes.titleMarginTop}>{PatientUtil.getFormatDHPMINO(patient.patientKey)}</span>}{'-'}{<span className={classes.titleMarginTop}>{engName}</span>}{nameChi ? ' ' : null}{nameChi})</>;
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
        const { isTransferOutDialogOpen, patientTransferList, transferOutForm, selected } = this.state;
        const rowData = this.setRowId(patientTransferList);
        const clinicList = this.filterClinicList();
        return (
            <Grid container className={classes.root}>
                <Grid container item justify="flex-start" style={{ paddingBottom: 10 }}>
                    <CIMSButton
                        style={{ marginLeft: 0 }}
                        id="patientTransferOut_create"
                        onClick={this.handleCreate}
                    >
                        Create
                    </CIMSButton>
                    <CIMSButton
                        id="patientTransferOut_update"
                        disabled={selected ? false : true}
                        onClick={() => { this.handleUpdate(selected); }}
                    >
                        Update
                    </CIMSButton>
                    <CIMSButton
                        id="patientTransferOut_delete"
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
                            refreshPatientTransferList={this.getPatientTransferList}
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
    },
    titleMarginTop: {
        position: 'relative',
        top: 2
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
    getPatientTransferList,
    insertPatientTransfer,
    updatePatientTransfer,
    deletePatientTransfer
};
export default connect(mapState, mapDispatch)(withStyles(styles)(PatientTransferOut));