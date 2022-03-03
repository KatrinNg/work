import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSDataGrid from '../../../../components/Grid/CIMSDataGrid';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { Dialog_Mode } from '../../../../enums/administration/noticeBoard';
import NoticeBoardDialog from '../component/noticeDialog';
import Enum from '../../../../enums/enum';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import {
    listNotice,
    updateField,
    submitNotice,
    deleteNotice
} from '../../../../store/actions/administration/noticeBoard/noticeBoardAction';
import { initNotice } from '../../../../constants/administration/noticeBoard/noticeBoardConstants';
import { auditAction } from '../../../../store/actions/als/logAction';
import AlsDesc from '../../../../constants/ALS/alsDesc';

class OrderNumRender extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { rowIndex } = this.props;
        return rowIndex + 1;
    }
}

class ServiceRender extends React.Component {

    render() {
        const { serviceList, value } = this.props;
        if (value) {
            let svcDesc = CommonUtil.getServiceNameByServiceCd(value, serviceList);
            return svcDesc;
        } else {
            return 'All Services';
        }
    }

}


const NoticeViewer = (props) => {
    const [dialogMode, setDialogMode] = useState(Dialog_Mode.CLOSE);
    const [isOpen, setIsOpen] = useState(() => { return false; });
    const [noticeBk, setNoticeBk] = useState(() => { return initNotice; });
    const { noticesList, curSelNotice, serviceList, file } = props;
    let refGrid = React.createRef();

    useEffect(() => {

    }, []);

    const clearSelect = () => {
        NoticeViewer.gridApi && NoticeViewer.gridApi.deselectAll();
    };


    const loadNoticeData = (notice) => {
        notice.efftDate = notice.efftDate ? moment(notice.efftDate) : null;
        notice.efftTime = notice.efftDate ? moment(notice.efftDate) : null;
        notice.expyDate = notice.expyDate ? moment(notice.expyDate) : null;
        notice.expyTime = notice.expyDate ? moment(notice.expyDate) : null;
        notice.newExpyDate = notice.newExpyDate ? moment(notice.newExpyDate) : null;
        notice.urgExpyDate = notice.urgExpyDate ? moment(notice.urgExpyDate) : null;
        notice.imprtntExpyDate = notice.imprtntExpyDate ? moment(notice.imprtntExpyDate) : null;
        if (!notice.svcCd) {
            notice.svcCd = 'all';
        }

        props.updateField({ curSelNotice: notice });
    };

    const handleUpdate = (notice) => {
        loadNoticeData(notice);
        setIsOpen(true);
        setDialogMode(Dialog_Mode.UPDATE);
    };

    const refreshNoticeList = () => {
        props.listNotice();
    };

    const handleCreate = () => {
        clearSelect();
        loadNoticeData(initNotice);
        setIsOpen(true);
        setDialogMode(Dialog_Mode.CREATE);
    };

    const handleCloseNotice = () => {
        setIsOpen(false);
        clearSelect();
        props.updateField({
            curSelNotice: initNotice,
            file: null,
            pastEfftDate: false,
            pastExpyDate: false,
            efftDateSameOrGreater: false,
            expyDateSameOrEarly: false
        });
        setNoticeBk(initNotice);
    };

    const deleteNotice = (noticeId) => {
        const callback = () => {
            refreshNoticeList();
            handleCloseNotice();
        };
        props.deleteNotice(noticeId, callback);
    };

    const handleDelete = () => {
        if (curSelNotice.noticeId === 0) {
            return;
        }
        props.openCommonMessage({
            msgCode: '110067',
            btnActions: {
                btn1Click: () => {
                    props.auditAction('Confirm Delete Notice');
                    deleteNotice(curSelNotice.noticeId);
                },
                btn2Click:()=>{
                    props.auditAction('Cancel Delete Notice',null,null,false,'cmn');
                }
            }
        });
    };

    const handlePreview = () => {
        setIsOpen(true);
        setDialogMode(Dialog_Mode.PREVIEW);
    };

    const handleSubmitNotice = (params) => {
        const callback = () => {
            setDialogMode(Dialog_Mode.CLOSE);
            setIsOpen(false);
            refreshNoticeList();
            handleCloseNotice();
        };
        props.submitNotice(params, file, callback);


    };

    const setRowId = (data) => {
        return data.map((item, index) => ({
            ...item,
            rowId: index
        }));
    };

    const rowData = setRowId(noticesList);

    return (
        <Grid container>
            <Grid item container justify="space-between">
                <Grid item xs={12} style={{ textAlign: 'end' }}>
                    <CIMSButton
                        id="createNotice"
                        onClick={()=>{
                            props.auditAction(AlsDesc.CREATE,null,null,false,'cmn');
                            handleCreate();
                        }}
                    >Create</CIMSButton>
                    <CIMSButton
                        id="updateNotice"
                        disabled={curSelNotice.noticeId === 0}
                        // onClick={() => { handleUpdate(); }}
                        onClick={() =>{
                            props.auditAction(AlsDesc.UPDATE,null,null,false,'cmn');
                             handleUpdate(curSelNotice);
                        }}
                    >Update</CIMSButton>
                    <CIMSButton
                        id="deleteNotice"
                        disabled={curSelNotice.noticeId === 0}
                        onClick={()=>{
                            props.auditAction(AlsDesc.DELETE,null,null,false,'cmn');
                            handleDelete();
                        }}
                    >Delete</CIMSButton>
                    <CIMSButton
                        id="previewNotice"
                        // disabled={curSelNotice.noticeId === 0}
                        onClick={()=>{
                            props.auditAction('Click Preview Button',null,null,false,'cmn');
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
                            { headerName: '',colId:'index', minWidth: 50, maxWidth: 50, cellRenderer: 'orderNumRender', lockPinned: true, sortable: false, filter: false },
                            {
                                headerName: 'Create Date', field: 'createDtm', minWidth: 130, valueFormatter: (params) => {
                                    return moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE);
                                }
                            },
                            { headerName: 'Recipient', field: 'recipient', minWidth: 120 },
                            {
                                headerName: 'Effective Date', field: 'efftDate', minWidth: 150, valueFormatter: (params) => {
                                    return moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE);
                                }
                            },
                            {
                                headerName: 'Expiry Date', field: 'expyDate', minWidth: 130, valueFormatter: (params) => {
                                    return params.value ? moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE) : '';
                                }
                            },
                            { headerName: 'Content', field: 'content', minWidth: 160 },
                            {
                                headerName: 'Service', field: 'svcCd', minWidth: 240, cellRenderer: 'serviceRender',
                                cellRendererParams: {
                                    serviceList: serviceList
                                }
                            },
                            { headerName: 'Attachment', field: 'docName', minWidth: 150 },
                            {
                                headerName: 'Enable', field: 'isEnable', minWidth: 150, valueFormatter: (params) => {
                                    let desc = 'Enable';
                                    if (params.value !== '1') {
                                        desc = 'Disable';
                                    }
                                    return desc;
                                }
                            },
                            { headerName: 'Updated By', field: 'updateBy', minWidth: 150, width: 200 }
                        ],
                        rowData: rowData,
                        suppressRowClickSelection: false,
                        rowSelection: 'single',
                        onRowSelected: params => {
                            let row = params.api.getSelectedRows()[0];
                            if ((row && curSelNotice.noticeId === 0) || (row && curSelNotice.noticeId !== row.noticeId)) {
                                props.updateField({ curSelNotice: row });
                                setNoticeBk(row);
                            } else {
                                let notice = initNotice;
                                if (row) {
                                    notice = row;
                                }
                                props.updateField({ curSelNotice: notice });
                                setNoticeBk(notice);
                            }
                        },
                        // getRowNodeId: data => data.noticeId,
                        getRowNodeId: item => item.rowId.toString(),
                        onRowDoubleClicked: params => {
                            props.auditAction('Update Notice',null,null,false,'cmn');
                            handleUpdate(params.data);
                            setNoticeBk(params.data);
                        },
                        headerHeight: 50,
                        getRowHeight: params => 50,
                        onGridReady: params => {
                            if (params) {
                                const colIds = params.columnApi.getAllDisplayedColumns().map(col => col.getColId());
                                params.columnApi.autoSizeColumns(colIds);
                                // handleGetUserList();
                                NoticeViewer.gridApi = params.api;
                            }
                        },
                        frameworkComponents: {
                            orderNumRender: OrderNumRender,
                            serviceRender: ServiceRender
                        },
                        postSort: rowNodes => CommonUtil.forceRefreshCells(rowNodes,['index'])
                    }}
                >
                </CIMSDataGrid>
            </Grid>
            <NoticeBoardDialog
                dialogMode={dialogMode}
                openDialog={isOpen}
                noticeBk={noticeBk}
                // handleSaveNotice={() => { setDialogMode(Dialog_Mode.CLOSE); }}
                handleSubmitNotice={handleSubmitNotice}
                handleCloseNotice={handleCloseNotice}
            />
        </Grid >
    );
};


const mapState = (state) => {
    return {
        noticesList: state.noticeBoard.noticesList,
        curSelNotice: state.noticeBoard.curSelNotice,
        file: state.noticeBoard.file,
        serviceList: state.common.serviceList
    };
};

const mapDispatch = {
    openCommonMessage,
    listNotice,
    updateField,
    submitNotice,
    deleteNotice,
    auditAction
};

export default connect(mapState, mapDispatch)(NoticeViewer);