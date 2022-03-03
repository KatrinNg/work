import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import Select from '../../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import CommonMessage from '../../../constants/commonMessage';
import ValidatorEnum from '../../../enums/validatorEnum';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import CIMSDrawer from '../../../components/Drawer/CIMSDrawer';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import * as CertUtil from '../../../utilities/certificateUtilities';
import Enum from '../../../enums/enum';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import {
    updateState,
    selectEformResult,
    markComplete,
    deleteEformResult,
    refreshPage
} from '../../../store/actions/certificate/certificateEform';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { PAGESTATUS, EFORM_RESULT_STATUS } from '../../../enums/certificate/certEformEnum';
import { forceRefreshCells, readySiteOptLbl, onlyServerSharingDoc } from '../../../utilities/commonUtilities';
import { auditAction } from '../../../store/actions/als/logAction';
import {
    openClinicalDocImportDialog
} from '../../../store/actions/certificate/certificateEform';
import { getIsEnableEformAccessControl } from 'utilities/siteParamsUtilities';

function getColumnDefs() {
    const clinicFormatter = (params) => {
        const {clinicList} = params.context;
        const clinic = clinicList.find(x => x.siteId === params.value);
        return clinic && clinic.siteCd;
    };

    const docTypeFormatter = (params) => {
        const {allOutDocList} = params.context;
        const {clcMapEformEtemplateDto} = params.data;
        if (clcMapEformEtemplateDto && clcMapEformEtemplateDto.eformId) {
            const eform = allOutDocList && allOutDocList.find(x => x.outDocTypeId === clcMapEformEtemplateDto.eformId);
            return eform && eform.outDocTypeDesc;
        }
        return '';
    };

    const remarkFormatter = (params) => {
        const {allOutDocList} = params.context;
        const {clcMapEformEtemplateDto} = params.data;
        if (clcMapEformEtemplateDto && clcMapEformEtemplateDto.eformId) {
            const eform = allOutDocList && allOutDocList.find(x => x.outDocTypeId === clcMapEformEtemplateDto.eformId);
            return eform ? `E-Form(${eform.outDocTypeDesc})` : null;
        }
        return '';
    };

    const statusFormatter = params => {
        let val = params.value;
        switch (params.value) {
            case EFORM_RESULT_STATUS.COMPLETED:
                val = 'Completed';
                break;
            case EFORM_RESULT_STATUS.INCOMPLETED:
                val = 'Incompleted';
                break;
            case EFORM_RESULT_STATUS.REPLACED:
                val = 'Replaced';
                break;
            case EFORM_RESULT_STATUS.DELETED:
                val = 'Deleted';
                break;
        }
        return val;
    };

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
            headerName: 'Encounter Date',
            field: 'encntrDate',
            minWidth: 120,
            valueFormatter: (params) => {
                return params.value && moment(params.value, Enum.DATE_FORMAT_EYMD_VALUE).format(Enum.DATE_FORMAT_EDMY_VALUE);
            }
        },
        {
            headerName: 'Service',
            field: 'svcCd',
            minWidth: 100
        },
        {
            headerName: 'Clinic',
            field: 'siteId',
            minWidth: 90,
            valueFormatter: clinicFormatter
        },
        {
            headerName: 'Doc. Type',
            field: '',
            minWidth: 300,
            valueFormatter: docTypeFormatter
        },
        {
            headerName: 'Create Date',
            field: 'createDtm',
            minWidth: 120,
            valueFormatter: (params) => {
                return params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE);
            }
        },
        {
            headerName: 'Remarks',
            field: '',
            valueFormatter: remarkFormatter,
            minWidth: 300
        },
/*        {
            headerName: 'Status',
            field: 'status',
            minWidth: 120,
            valueFormatter: statusFormatter
        },*/
        {
            headerName: 'Updated By',
            field: 'updateBy',
            minWidth: 130
        }
    ];
}

function sortFunc(list) {
    list.sort((a, b) => {
        if (moment(a.createDtm).isBefore(moment(b.createDtm))) {
            return 1;
        } else if (moment(a.createDtm).isSame(moment(b.createDtm))) {
            return 0;
        } else {
            return -1;
        }
    });
}

// const sortByEncounterDate = (a, b) => {
//     if (moment(a.encntrDate, Enum.DATE_FORMAT_EYMD_VALUE).isBefore(moment(b.encntrDate, Enum.DATE_FORMAT_EYMD_VALUE)))
//         return 1;
//     else if (moment(a.encntrDate, Enum.DATE_FORMAT_EYMD_VALUE).isAfter(moment(b.encntrDate, Enum.DATE_FORMAT_EYMD_VALUE)))
//         return -1;
//     else
//         return 0;
// };

class HistoryContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            clickCount: 0,
            filterSvc: []
        };
    }

    componentDidUpdate(prevProps) {
        const prevSelected = prevProps.eformParams.selected;
        const currSelected = this.props.eformParams.selected;
        if (prevSelected !== currSelected) {
            if (currSelected) {
                const selectedRow = this.gridApi && this.gridApi.getRowNode(currSelected);
                if (selectedRow) {
                    selectedRow.setSelected(true);
                }
            } else {
                this.gridApi && this.gridApi.deselectAll();
            }
        }
    }

    handleOnChange = (name, value) => {
        const {
            refreshPage,
            pageStatus
        } = this.props;

        let _eformParams = {
            ...this.props.eformParams,
            [name]: value
        };
        if (name === 'svcCd') {
            // const clinics = this.props.clinicList.filter(x => x.svcCd === _eformParams.svcCd);
            // _eformParams.siteId = clinics && clinics.length > 0 ? clinics[0].siteId : null;
            _eformParams.siteId = '*All';
        }
        this.props.updateState({eformParams: _eformParams});
        if (name === 'svcCd' || name === 'siteId') {
            setTimeout(() => {
                this.props.updateHistoryList(_eformParams, () => {
                    if (pageStatus !== PAGESTATUS.CERT_ADDING) {
                        refreshPage();
                        this.props.getFirstEformResultId();
                    }
                });
            }, 500);
        }
    };

    // handleDateAccept = (name, value) => {
    //     let _eformParams = _.cloneDeep(this.props.eformParams);
    //     _eformParams[name] = value;
    //     if (name === 'dateFrom' && CommonUtil.isFromDateAfter(moment(value), moment(_eformParams.dateTo))) {
    //         _eformParams.dateTo = null;
    //         setTimeout(() => {
    //             this.dateToRef.focus();
    //         }, 100);
    //     }
    //     if (name === 'dateTo' && CommonUtil.isToDateBefore(moment(_eformParams.dateFrom), moment(value))) {
    //         _eformParams.dateFrom = null;
    //         setTimeout(() => {
    //             this.dateFromRef.focus();
    //         }, 100);
    //     }
    //     this.props.updateState({ eformParams: _eformParams });
    //     this.props.updateHistoryList(_eformParams);
    // };

    isFormValid = () => {
        return this.historyForm.isFormValid(false);
    }

    onRowClicked = (params) => {
        this.setState({clickCount: this.state.clickCount + 1}, () => {
            setTimeout(() => {
                const {clickCount} = this.state;
                if (clickCount !== 0) {
                    this.setState({clickCount: 0}, () => {
                        if (clickCount === 1) {
                            this.handleRowClick(params);
                        } else if (clickCount === 2) {
                            this.handleRowDoubleClick(params);
                        }
                    });
                }
            }, 300);
        });
    }

    handleRowClick = (params) => {
        if (this.props.pageStatus === PAGESTATUS.CERT_EDITING) {
            return;
        }
        let selected = _.cloneDeep(this.props.eformParams.selected);
        if (selected && selected === params.data.eformResultId) {
            selected = null;
        } else {
            selected = params.data.eformResultId;
        }
        if (this.props.pageStatus === PAGESTATUS.CERT_ADDING) {
            this.props.openCommonMessage({
                msgCode: '110603',
                btnActions: {
                    btn1Click: () => {
                        this.props.selectEformResult(selected);
                    }
                }
            });
            return;
        }
        this.props.selectEformResult(selected);
    }

    handleRowDoubleClick = (params) => {
        if (this.props.pageStatus === PAGESTATUS.CERT_EDITING) {
            return;
        }
        if (this.props.pageStatus === PAGESTATUS.CERT_ADDING) {
            return;
        }
        const isEnableEdit = this.isEnableEditBtn({
            selected: params.data.eformResultId,
            encounterInfo: this.props.encounterInfo,
            eformResult: this.props.eformResult
        });
        if (isEnableEdit) {
            this.props.selectEformResult(params.data.eformResultId, true);
            const selectedRow = this.gridApi && this.gridApi.getRowNode(params.data.eformResultId);
            if (selectedRow) {
                selectedRow.setSelected(true);
            }
        }
    }

    isEnableEditBtn = (params) => {
        const {encounterInfo, eformResult, selected} = params;
        if (selected && encounterInfo) {
            const selectedResult = eformResult && eformResult.find(x => x.eformResultId === selected);
            const crossEncntrAllow = selectedResult && selectedResult.clcMapEformEtemplateDto && selectedResult.clcMapEformEtemplateDto.crossEncntrAllow;
            if (selectedResult) {
                if (moment(encounterInfo.encounterDate).isSame(moment(), 'day')) {
                    if (parseInt(crossEncntrAllow) === 0) {
                        if (encounterInfo.encounterId === selectedResult.encntrId) {
                            return true;
                        }
                    }
                    if (parseInt(crossEncntrAllow) === 1) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    isEnableMarkCompleteBtn = () => {
        const {pageStatus, eformParams, encounterInfo, eformResult} = this.props;
        const {selected} = eformParams;
        if (pageStatus === PAGESTATUS.CERT_SELECTED && selected && encounterInfo) {
            const selectedResult = eformResult && eformResult.find(x => x.eformResultId === selected);
            const crossEncntrAllow = selectedResult && selectedResult.clcMapEformEtemplateDto && selectedResult.clcMapEformEtemplateDto.crossEncntrAllow;
            if (selectedResult) {
                if (moment(encounterInfo.encounterDate).isSame(moment(), 'day')) {
                    if (selectedResult && selectedResult.status === EFORM_RESULT_STATUS.INCOMPLETED) {
                        if (parseInt(crossEncntrAllow) === 1) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    isEnableDeleteBtn = (params) => {
        return this.isEnableEditBtn(params);
    }

    handleImport = () => {
        if (!this.props.clinicalDocImportDialogOpen) {
            this.props.auditAction('Click Open in Clinical Doc Import dialog', null, null, false, 'clinical-doc');
            this.props.openClinicalDocImportDialog();
        }
    }

    handleEdit = () => {
        this.props.updateState({pageStatus: PAGESTATUS.CERT_EDITING, eformSubmissionOriginal: null});
    }

    handleMarkComplete = () => {
        const {selected} = this.props.eformParams;
        this.props.markComplete(selected);
    }

    handleDelete = () => {
        const {selected} = this.props.eformParams;
        this.props.deleteEformResult(selected, (result) => {
            this.props.svcOptsFiltering(result);
        });
    }

    // handleHistoryListFiltering = (output = []) => {
    //     const {
    //         eformParams,
    //         eformResult
    //     } = this.props;

    //     if (eformResult) {
    //         const { accessRights, siteParams, svcCd, siteId } = this.props;
    //         const isEnableEformAccessControl = getIsEnableEformAccessControl(siteParams, svcCd, siteId);
    //         const eformRights = accessRights.filter(x => x.type === 'eform' && x.path);

    //         const _eformResult = eformResult.filter(item => (
    //             (!isEnableEformAccessControl || eformRights.find(x => x.path === String(item.clcMapEformEtemplateDto?.eformId))) &&
    //             (onlyServerSharingDoc(item))
    //         ));
    //         _eformResult.sort(sortByEncounterDate);
    //         output = _eformResult;

    //         (eformParams.svcCd !== '*All') && (output = output.filter(item => item.svcCd === eformParams.svcCd));

    //         (eformParams.siteId !== '*All') && (output = output.filter(item => item.siteId === eformParams.siteId));
    //     }

    //     return output;
    // }

    render() {
        const {
            classes,
            allOutDocList,
            clinicList,
            eformParams,
            service,
            eformResult,
            eformList,
            encounterInfo,
            pageStatus,
            filterSvc,
            historyList
        } = this.props;

        const {
            svcCd,
            siteId,
            selected,
            // dateFrom,
            // dateTo,
            open
        } = eformParams;

        const columnDefs = getColumnDefs();
        const serviceList = CertUtil.getAccessedServices(filterSvc, service.svcCd);
        const sharedList = CertUtil.getShareSvcCertList(eformResult, serviceList, sortFunc);
        const filterClinics = clinicList.filter(x => x.svcCd === svcCd);

        const enableEdit = this.isEnableEditBtn({
            selected: selected,
            encounterInfo: encounterInfo,
            eformResult: eformResult
        });
        const enableMarkComplete = this.isEnableMarkCompleteBtn();
        const enableDelete = this.isEnableDeleteBtn({
            selected: selected,
            encounterInfo: encounterInfo,
            eformResult: eformResult
        });

        return (
            <CIMSDrawer
                id="certificate_eform_history"
                open={open}
                title="CIMS2 eForms History"
                onClick={() => this.handleOnChange('open', !open)}
                drawerWidth={'100%'}
                classes={{
                    drawer: classes.drawerRoot
                }}
            >
                <ValidatorForm className={classes.form} ref={r => this.historyForm = r}>
                    <Grid container className={classes.formContainer}>
                        <Grid item container justify="flex-start" spacing={1}>
                            <CIMSButton
                                id="certificate_eform_cims1_importDialogBtn"
                                children="CIMS1 eForms (Incomplete)"
                                onClick={this.handleImport}
                            />
                        </Grid>
                        {/*<Grid item container justify="flex-end" spacing={1}>*/}
                        {/*                            <CIMSButton
                                id="certificate_eform_history_editBtn"
                                children="Edit"
                                onClick={this.handleEdit}
                                style={{ display: CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? 'none' : '' }}
                                disabled={!(enableEdit && pageStatus === PAGESTATUS.CERT_SELECTED)}
                            />*/}
                        {/*                            <CIMSButton
                                id="certificate_eform_history_markCompleteBtn"
                                children="Mark Complete"
                                onClick={this.handleMarkComplete}
                                style={{ display: CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? 'none' : '' }}
                                disabled={!enableMarkComplete}
                            />*/}
                        {/*                            <CIMSButton
                                id="certificate_eform_history_deleteBtn"
                                children="Delete"
                                onClick={this.handleDelete}
                                style={{ display: CertUtil.isPastEncounterDate(encounterInfo.encounterDate) ? 'none' : '' }}
                                disabled={!(enableDelete && pageStatus === PAGESTATUS.CERT_SELECTED)}
                            />*/}
                        {/*</Grid>*/}

                        <Grid container item className={classes.filterContainer} spacing={1}>
                            <Grid item xs={6}>
                                <Select
                                    id="certificate_eform_history_service"
                                    value={svcCd}
                                    options={serviceList.map((item) => (
                                        {value: item.svcCd, label: item.serviceName}
                                    ))}
                                    onChange={e => this.handleOnChange('svcCd', e.value)}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    TextFieldProps={{
                                        label: <>Service<RequiredIcon/></>,
                                        variant: 'outlined'
                                    }}
                                    withRequiredValidator
                                    absoluteMessage
                                    addAllOption
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Select
                                    id="certificate_eform_history_clinic"
                                    value={siteId}
                                    options={filterClinics && filterClinics.map((item) => (
                                        {value: item.siteId, label: readySiteOptLbl(item)}
                                    ))}
                                    onChange={e => this.handleOnChange('siteId', e.value)}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                    TextFieldProps={{
                                        label: <>Clinic<RequiredIcon/></>,
                                        variant: 'outlined'
                                    }}
                                    withRequiredValidator
                                    absoluteMessage
                                    sortBy="label"
                                    addAllOption
                                />
                            </Grid>
                        </Grid>

                        {/* <Grid item xs={6}>
                                <DatePicker
                                    id="certificate_eform_history_dateFrom"
                                    inputRef={r => this.dateFromRef = r}
                                    label={<>Date From<RequiredIcon /></>}
                                    onChange={e => this.handleOnChange('dateFrom', e)}
                                    onBlur={e => this.handleDateAccept('dateFrom', e)}
                                    onAccept={e => this.handleDateAccept('dateFrom', e)}
                                    value={dateFrom}
                                    isRequired
                                    withRequiredValidator
                                    absoluteMessage
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    id="certificate_eform_history_dateTo"
                                    inputRef={r => this.dateToRef = r}
                                    label={<>Date To<RequiredIcon /></>}
                                    onChange={e => this.handleOnChange('dateTo', e)}
                                    onBlur={e => this.handleDateAccept('dateTo', e)}
                                    onAccept={e => this.handleDateAccept('dateTo', e)}
                                    value={dateTo}
                                    isRequired
                                    withRequiredValidator
                                    absoluteMessage
                                />
                            </Grid> */}

                        <Grid item xs={12}>
                            <CIMSDataGrid
                                suppressGoToRow
                                suppressDisplayTotal
                                // disableAutoSize
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    width: '100%',
                                    height: '57vh',
                                    display: 'block',
                                    marginBottom: 4
                                }}
                                gridOptions={{
                                    rowSelection: 'single',
                                    headerHeight: 50,
                                    columnDefs: columnDefs,
                                    rowData: historyList,
                                    suppressRowClickSelection: pageStatus === PAGESTATUS.CERT_EDITING ? true : false,
                                    onGridReady: (params) => {
                                        this.gridApi = params.api;
                                        this.gridColumnApi = params.columnApi;
                                    },
                                    getRowHeight: () => 50,
                                    getRowNodeId: data => data.eformResultId,
                                    onRowClicked: this.onRowClicked,
                                    context: {
                                        allOutDocList,
                                        clinicList,
                                        eformList
                                    },
                                    postSort: rowNodes => forceRefreshCells(rowNodes, ['index'])
                                }}
                            />
                        </Grid>
                    </Grid>
                </ValidatorForm>
            </CIMSDrawer>
        );
    }
}

const styles = theme => ({
    drawerRoot: {
        height: '69vh'
    },
    form: {
        width: '100%',
        height: '100%'
    },
    formContainer: {
        padding: theme.spacing(1),
        height: '100%'
    },
    filterContainer: {
        margin: '0.2rem 0'
    }
});

const mapState = state => ({
    clinicList: state.common.clinicList,
    eformList: state.certificateEform.eformList,
    eformResult: state.certificateEform.eformResult,
    eformParams: state.certificateEform.eformParams,
    pageStatus: state.certificateEform.pageStatus,
    allOutDocList: state.common.outDocumentTypes.fullList,
    service: state.login.service,
    encounterInfo: state.patient.encounterInfo,
    clinicalDocImportDialogOpen: state.clinicalDoc.clinicalDocImportDialogOpen,
    accessRights: state.login.accessRights,
    svcCd: state.login.service.svcCd,
    siteId: state.login.clinic.siteId,
    siteParams: state.common.siteParams
});

const mapDispatch = {
    updateState,
    selectEformResult,
    markComplete,
    deleteEformResult,
    openCommonMessage,
    refreshPage,
    auditAction,
    openClinicalDocImportDialog
};

export default connect(mapState, mapDispatch)(withStyles(styles)(HistoryContainer));
