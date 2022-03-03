import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { Dialog_Mode } from '../../../../enums/administration/apptSlipRemarks';
import Enum from '../../../../enums/enum';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import {
    listApptSlipRemarks,
    submitApptSlipRemarks,
    deleteApptSlipRemarks,
    getApptSlipReport,
    getEncounterTypeListBySite
} from '../../../../store/actions/administration/apptSlipRemarks/apptSlipRemarksAction';
import { initApptSlipRemarks } from '../../../../constants/administration/apptSlipRemarks/apptSlipRemarksConstants';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';
import ApptSlipRemarksDialog from '../component/apptSlipRemarksDialog';
import { print } from '../../../../utilities/printUtilities';
import { isClinicalAdminSetting } from '../../../../utilities/userUtilities';
import { remarkBasic } from '../../../../constants/administration/apptSlipRemarks/remarkBasic';
import _ from 'lodash';

class OrderNumRender extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { rowIndex } = this.props;
        return rowIndex + 1;
    }
}

const ApptSlipRemarksViewer = (props) => {
    const [dialogMode, setDialogMode] = useState(Dialog_Mode.CLOSE);
    const [isOpen, setIsOpen] = useState(() => { return false; });
    const [apptSlipRemarksBk, setApptSlipRemarksBk] = useState(() => { return initApptSlipRemarks; });
    const [curSelApptSlipRemarks, setCurSelApptSlipRemarks] = useState(() => { return initApptSlipRemarks; });
    const [apptSlipReportData, setApptSlipReportData] = useState(null);
    const
        {
            apptSlipRemarksList,
            isSystemAdmin,
            isServiceAdmin,
            isClinicalAdmin,
            serviceCd,
            encounterTypeTotalList
        } = props;
    const isReadOnly = !isSystemAdmin && !isServiceAdmin && !isClinicalAdmin;
    let refGrid = React.createRef();

    useEffect(() => {
        if (apptSlipReportData) {
            setIsOpen(true);
            setDialogMode(Dialog_Mode.PREVIEW);
        }
    }, [apptSlipReportData]);

    const clearSelect = () => {
        ApptSlipRemarksViewer.gridApi && ApptSlipRemarksViewer.gridApi.deselectAll();
    };

    const loadApptSlipRemarksData = (apptSlipRemarks) => {
        setCurSelApptSlipRemarks(apptSlipRemarks);
    };

    const handleUpdate = (apptSlipRemarks, isNeedCheckValidEnct) => {

        const { serviceCd } = props;
        let params = {
            svcCd: serviceCd,
            siteId: apptSlipRemarks.siteId
        };
        props.getEncounterTypeListBySite(params, (encounterTypeList) => {
            apptSlipRemarks.encounterTypeList = encounterTypeList;
            let encounter = encounterTypeList.find(item => item.encntrTypeId === apptSlipRemarks.encntrTypeId);
            if (!encounter && apptSlipRemarks.encntrTypeId) {
                apptSlipRemarks.encntrTypeId = null;
                props.openCommonMessage({ msgCode: '115731', showSnackbar: true });
            }
            getApptSlipRemarksDetail(apptSlipRemarks);
        }, isNeedCheckValidEnct);
    };

    const getApptSlipRemarksDetail = (apptSlipRemarks) => {
        const { serviceCd } = props;
        let params = {
            svcCd: serviceCd,
            apptSlipRemarkGroupId: apptSlipRemarks.apptSlipRemarkGroupId
        };
        props.listApptSlipRemarks(params, (data) => {
            apptSlipRemarks.anaApptSlipRemarkList = data[0] && data[0].anaApptSlipRemarkList;
            if (!apptSlipRemarks.anaApptSlipRemarkList ||
                (apptSlipRemarks.anaApptSlipRemarkList && apptSlipRemarks.anaApptSlipRemarkList.length) === 0
            ) {
                let newList = [];
                newList.push(_.cloneDeep(remarkBasic));
                apptSlipRemarks.anaApptSlipRemarkList = newList;
            }
            loadApptSlipRemarksData(apptSlipRemarks);
            setIsOpen(true);
            setDialogMode(Dialog_Mode.UPDATE);
        });
    };

    const refreshapptSlipRemarksList = () => {
        props.getApptSlipRemarksList();
    };

    const handleCreate = () => {
        clearSelect();
        loadApptSlipRemarksData(initApptSlipRemarks);
        setIsOpen(true);
        setDialogMode(Dialog_Mode.CREATE);
    };

    const handleCloseApptSlipRemarks = () => {
        setIsOpen(false);
        clearSelect();
        setCurSelApptSlipRemarks(initApptSlipRemarks);
        setApptSlipRemarksBk(initApptSlipRemarks);
    };

    const deleteApptSlipRemarks = (params) => {
        const callback = () => {
            refreshapptSlipRemarksList();
            handleCloseApptSlipRemarks();
        };
        props.deleteApptSlipRemarks(params, callback);
    };

    const handleDelete = () => {
        if (curSelApptSlipRemarks.apptSlipRemarkGroupId === 0) {
            return;
        }
        props.openCommonMessage({
            msgCode: '110067',
            btnActions: {
                btn1Click: () => {
                    props.auditAction('Confirm Delete apptSlipRemarks');
                    let params = {
                        ...curSelApptSlipRemarks,
                        status: 'D'
                    };
                    deleteApptSlipRemarks(params);
                },
                btn2Click: () => {
                    props.auditAction('Cancel Delete apptSlipRemarks', null, null, false, 'ana');
                }
            }
        });
    };

    const handlePreview = () => {
        let params = {
            svcCd: serviceCd,
            siteId: curSelApptSlipRemarks.siteId,
            slipType: 'Single',
            encounterTypeId: curSelApptSlipRemarks.encntrTypeId,
            isShowDetail: false
        };
        props.getApptSlipReport(params, (data) => {
            setApptSlipReportData(data);
        });
    };

    const handleSubmitApptSlipRemarksForm = (params) => {
        const callback = () => {
            setDialogMode(Dialog_Mode.CLOSE);
            setIsOpen(false);
            refreshapptSlipRemarksList();
            handleCloseApptSlipRemarks();
        };
        params.svcCd = props.serviceCd;
        params.anaApptSlipRemarkList.forEach(element => {
            if (element.apptSlipRemarkId === 0
                && !element.dspOrder && !element.content) {
                params.anaApptSlipRemarkList = [];
            }
        });
        delete params.encounterTypeList;
        props.submitApptSlipRemarks(params, callback);
    };

    const handlePrintApptSlipRemarks = () => {
        print({ base64: apptSlipReportData });
    };

    const setRowId = (data) => {
        return data.map((item, index) => ({
            ...item,
            rowId: index
        }));
    };

    const checkRecordExisted = () => {
        if (apptSlipRemarksList && apptSlipRemarksList.length === (encounterTypeTotalList.length + 1)) {
            return true;
        } else {
            return false;
        }
    };

    const rowData = setRowId(apptSlipRemarksList);

    const disableCreateBtn = isReadOnly || (isClinicalAdminSetting() && checkRecordExisted());

    return (
        <Grid container>
            <Grid item container justify="space-between">
                <Grid item xs={12} style={{ textAlign: 'end' }}>
                    <CIMSButton
                        id="createapptSlipRemarks"
                        disabled={disableCreateBtn}
                        onClick={() => {
                            props.auditAction(AlsDesc.CREATE, null, null, false, 'ana');
                            handleCreate();
                        }}
                    >Create</CIMSButton>
                    <CIMSButton
                        id="updateapptSlipRemarks"
                        disabled={curSelApptSlipRemarks.apptSlipRemarkGroupId === 0}
                        onClick={() => {
                            props.auditAction(AlsDesc.UPDATE, null, null, false, 'ana');
                            handleUpdate(curSelApptSlipRemarks, !disableCreateBtn);
                        }}
                    >Update</CIMSButton>
                    <CIMSButton
                        id="deleteApptSlipRemarks"
                        disabled={curSelApptSlipRemarks.apptSlipRemarkGroupId === 0 || isReadOnly}
                        onClick={() => {
                            props.auditAction(AlsDesc.DELETE, null, null, false, 'ana');
                            handleDelete();
                        }}
                    >Delete</CIMSButton>
                    <CIMSButton
                        id="previewapptSlipRemarks"
                        disabled={curSelApptSlipRemarks.apptSlipRemarkGroupId === 0}
                        onClick={() => {
                            props.auditAction('Click Preview Button', null, null, false, 'ana');
                            handlePreview();
                        }}
                    >Preview</CIMSButton>
                </Grid>
            </Grid>
            <Grid item container style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }} >
                {/* ag-grid */}
                <CIMSDataGrid
                    ref={refGrid}
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '75vh',
                        display: 'block'
                    }}
                    gridOptions={{
                        columnDefs: [
                            { headerName: '', colId: 'index', minWidth: 50, maxWidth: 50, cellRenderer: 'orderNumRender', lockPinned: true, sortable: false, filter: false },
                            {
                                headerName: 'Clinic', field: 'siteEngName', minWidth: 600, width: 600
                            },
                            {
                                headerName: 'Encounter Type', field: 'encntrTypeDesc', minWidth: 600, width: 600
                            },
                            {
                                headerName: 'Effective Date', field: 'efftDate', minWidth: 300, width: 300, valueFormatter: (params) => {
                                    return params.value ? moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) : '';
                                }
                            },
                            // {
                            //     headerName: 'Expiry Date', field: 'expyDate', minWidth: 130, valueFormatter: (params) => {
                            //         return params.value ? moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) : '';
                            //     }
                            // },
                            {
                                headerName: 'Status', field: 'status', minWidth: 300, width: 300, valueFormatter: (params) => {
                                    let desc = 'Active';
                                    if (params.value !== 'A') {
                                        desc = 'Inactive';
                                    }
                                    return desc;
                                }
                            }
                        ],
                        rowData: rowData,
                        suppressRowClickSelection: false,
                        rowSelection: 'single',
                        onRowSelected: params => {
                            let row = params.api.getSelectedRows()[0];
                            if ((row && curSelApptSlipRemarks.apptSlipRemarkGroupId === 0) || (row && curSelApptSlipRemarks.apptSlipRemarkGroupId !== row.apptSlipRemarkGroupId)) {
                                setCurSelApptSlipRemarks(row);
                                setApptSlipRemarksBk(row);
                            } else {
                                let apptSlipRemarks = initApptSlipRemarks;
                                if (row) {
                                    apptSlipRemarks = row;
                                }
                                setCurSelApptSlipRemarks(apptSlipRemarks);
                                setApptSlipRemarksBk(apptSlipRemarks);
                            }
                        },
                        getRowNodeId: item => item.rowId.toString(),
                        onRowDoubleClicked: params => {
                            props.auditAction('Update apptSlipRemarks', null, null, false, 'ana');
                            handleUpdate(params.data, !disableCreateBtn);
                            setApptSlipRemarksBk(params.data);
                        },
                        headerHeight: 50,
                        getRowHeight: params => 50,
                        onGridReady: params => {
                            if (params) {
                                const colIds = params.columnApi.getAllDisplayedColumns().map(col => col.getColId());
                                params.columnApi.autoSizeColumns(colIds);
                                ApptSlipRemarksViewer.gridApi = params.api;
                            }
                        },
                        frameworkComponents: {
                            orderNumRender: OrderNumRender
                        },
                        postSort: rowNodes => CommonUtil.forceRefreshCells(rowNodes, ['index'])
                    }}
                >
                </CIMSDataGrid>
            </Grid>
            <ApptSlipRemarksDialog
                dialogMode={dialogMode}
                openDialog={isOpen}
                apptSlipRemarksBk={apptSlipRemarksBk}
                isReadOnly={isReadOnly}
                handleSubmitApptSlipRemarksForm={(params) => { handleSubmitApptSlipRemarksForm(params); }}
                handlePrintApptSlipRemarks={handlePrintApptSlipRemarks}
                handleCloseApptSlipRemarks={handleCloseApptSlipRemarks}
                curSelApptSlipRemarks={curSelApptSlipRemarks}
                apptSlipReportData={apptSlipReportData}
                setCurSelApptSlipRemarks={setCurSelApptSlipRemarks}
            />
        </Grid >
    );
};


const mapState = (state) => {
    return {
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin
    };
};

const mapDispatch = {
    openCommonMessage,
    submitApptSlipRemarks,
    deleteApptSlipRemarks,
    getApptSlipReport,
    getEncounterTypeListBySite,
    listApptSlipRemarks,
    auditAction
};

export default connect(mapState, mapDispatch)(ApptSlipRemarksViewer);