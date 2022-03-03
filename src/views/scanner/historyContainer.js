import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import CIMSDrawer from '../../components/Drawer/CIMSDrawer';
import CIMSDataGrid from '../../components/Grid/CIMSDataGrid';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import {
    triggerUpdateHistoryContainerOpenClose
} from '../../store/actions/certificate/scannerCertificate/scannerCertificateAction';
import { Checkbox, IconButton } from '@material-ui/core';
import { Assignment, CheckBox, CheckBoxOutlineBlank } from '@material-ui/icons';
import {
    closeCommonCircular,
    openCommonCircular
} from '../../store/actions/common/commonAction';
import { triggerGetSingleInOutDoc } from '../../store/actions/consultation/doc/docAction';
import CIMSCompatViewerDialog from '../../components/Dialog/CIMSCompatViewerDialog';

class HistoryContainer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            previewInfo: {
                fileExtension: '',
                isPdf: false
            },
            isPreviewDialogOpen: false,
            clickCount: 0,
            filterSvc: []
        };
    }

    componentDidUpdate(prevProps) {
    }

    handleOnChange = (name, value) => {
        this.props.triggerUpdateHistoryContainerOpenClose(value);

        setTimeout(() => {
            this.props.updateHistoryList(() => {
            });
        }, 500);
    };

    isFormValid = () => {
        return this.historyForm.isFormValid(false);
    }

    downLoadFileFromBlob = (blob, docName) => {
        let url = window.URL.createObjectURL(blob);
        let a = document.createElement('a');
        a.href = url;
        a.download = docName;
        a.click();
    };

    handleDocOnChange = (value, key1, key2 = null, callback = null) => {
        this.setState(prevState => ({
            ...this.state,
            [key1]: key2 ? {
                ...prevState[key1],
                [key2]: value
            } : value
        }), () => {
            callback && callback();
        });
    }

    triggerOpenPreviewDialog = (data) => {
        const {
            isPreviewDialogOpen
        } = this.state;

        const {
            openCommonCircular,
            closeCommonCircular,
            triggerGetSingleInOutDoc
        } = this.props;

        openCommonCircular();

        const docId = data.docId || data.outDocId;

        let fileExtension = data.fileType;

        const allowedFileExtension = ['pdf', 'jpeg', 'jpg', 'png', 'gif'];

        allowedFileExtension.find((item) => {
            if (item === ((/[.]/.exec(data.docName)) ? /[^.]+$/.exec(data.docName)[0].toLowerCase() : undefined)) {
                fileExtension = item;
            }

            return fileExtension;
        });

        if (fileExtension) {
            if (data.isMigration === 1 && data.src === 'O') {
                triggerGetSingleInOutDoc(docId, data.src === 'I' ? true : false, (res) => {
                    this.downLoadFileFromBlob(this.b64toBlob(res.data, `${fileExtension === 'pdf' ? 'application' : 'image'}/${fileExtension}`), data.docName);

                    closeCommonCircular();
                });
            } else {
                this.handleDocOnChange({
                    fileExtension: fileExtension,
                    isPdf: fileExtension === 'pdf'
                }, 'previewInfo', null, () => {
                    const callback = () => {
                        this.handleDocOnChange(!isPreviewDialogOpen, 'isPreviewDialogOpen', null, () => closeCommonCircular());
                    };

                    triggerGetSingleInOutDoc(docId, data.src === 'I' ? true : false, callback);
                });
            }
        } else {
            triggerGetSingleInOutDoc(docId, data.src === 'I' ? true : false, (res) => {
                this.downLoadFileFromBlob(this.b64toBlob(res.data, `${fileExtension === 'pdf' ? 'application' : 'image'}/${fileExtension}`), data.docName);

                closeCommonCircular();
            });
        }
    }
    render() {
        const {
            classes,
            scannerParams,
            scannerHistoryList,
            previewData
        } = this.props;
        const {
            previewInfo,
            isPreviewDialogOpen
        } = this.state;

        const {
            open,
            svcCd,
            siteId
            // dateFrom: null,
            // dateTo: null,
        } = scannerParams;

        return (
            <>
            <CIMSDrawer
                id="scanner_certificate_history"
                open={open}
                title="History"
                onClick={() => this.handleOnChange('open', !open)}
                drawerWidth={'100%'}
                classes={{
                    drawer: classes.drawerRoot
                }}
            >
                <ValidatorForm className={classes.form} ref={r => this.historyForm = r}>
                    <Grid container spacing={2} className={classes.formContainer}>
                        <Grid item container>
                            <CIMSDataGrid
                                suppressGoToRow
                                suppressDisplayTotal
                                // disableAutoSize
                                gridTheme="ag-theme-balham"
                                divStyle={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'block',
                                    marginBottom: 4
                                }}
                                gridOptions={{
                                    rowSelection: 'single',
                                    headerHeight: 50,
                                    columnDefs: [
                                        {
                                            headerName: '',
                                            valueGetter: (params) => params.node.rowIndex + 1,
                                            minWidth: 50,
                                            maxWidth: 50
                                        },
                                        {
                                            headerName: 'View Doc.',
                                            maxWidth: 116,
                                            minWidth: 116,
                                            sortable: false,
                                            cellRenderer: 'inOutDocPreviewRenderer',
                                            cellRendererParams: {
                                                onClick: (data) => {
                                                    this.triggerOpenPreviewDialog(data);
                                                }
                                            }
                                        },
                                        {
                                            headerName: 'Date',
                                            maxWidth: 108,
                                            minWidth: 108,
                                            sort: 'desc',
                                            valueGetter: (params) => {
                                                return moment(params.data.createDtm).format('DD-MM-YYYY');
                                            },
                                            tooltipValueGetter: (params) => params.value
                                        },
                                        {
                                            headerName: 'Doc Type',
                                            maxWidth: 177,
                                            minWidth: 177,
                                            valueGetter: (params) => {
                                                return params.data.docTypeDesc;
                                            },
                                            tooltipValueGetter: (params) => params.value
                                        },
                                        {
                                            headerName: 'Status',
                                            maxWidth: 122,
                                            minWidth: 122,
                                            valueGetter: (params) => {
                                                switch (params.data.docSts) {
                                                    case 'N':
                                                        return 'Completed';
                                                    case 'I':
                                                        return 'Incompleted';
                                                    case 'C':
                                                        return 'Cancelled';
                                                    case 'P':
                                                        return 'Pending for Review';
                                                    case 'R':
                                                        return 'Rejected';
                                                    default:
                                                        return '';
                                                }
                                            },
                                            tooltipValueGetter: (params) => params.value
                                        },
                                        {
                                            headerName: 'Service',
                                            maxWidth: 202,
                                            minWidth: 202,
                                            valueGetter: (params) => {
                                                return this.props.serviceList.find(item => item.svcCd === params.data.svcCd).svcName;
                                            },
                                            tooltipValueGetter: (params) => params.value
                                        },
                                        {
                                            headerName: 'Remarks',
                                            maxWidth: 200,
                                            minWidth: 200,
                                            valueGetter: (params) => {
                                                return params.data.docRemark;
                                            },
                                            tooltipValueGetter: (params) => params.value
                                        },
                                        {
                                            headerName: 'Updated By',
                                            maxWidth: 205,
                                            minWidth: 205,
                                            valueGetter: (params) => {
                                                return params.data.updateBy;
                                            },
                                            tooltipValueGetter: (params) => params.value
                                        }
                                    ],
                                    onCellFocused: e => {
                                    },
                                    frameworkComponents: {
                                        selectCheckboxRenderer: SelectCheckboxRenderer,
                                        inOutDocPreviewRenderer: inOutDocPreview
                                    },
                                    rowMultiSelectWithClick: false,
                                    enableBrowserTooltips: true,
                                    rowData: scannerHistoryList,
                                    onRowSelected: event => {
                                    },
                                    onRowDoubleClicked: event => {

                                    },
                                    getRowHeight: (params) => 40,
                                    getRowNodeId: data => data.docId,
                                    postSort: rowNodes => {
                                        let rowNode = rowNodes[0];
                                        if (rowNode) {
                                            setTimeout((rowNode) => {
                                                rowNode.gridApi.refreshCells();
                                            }, 100, rowNode);
                                        }
                                    }
                                }}
                            />
                        </Grid>
                    </Grid>
                </ValidatorForm>
            </CIMSDrawer>
            {previewData &&
                <CIMSCompatViewerDialog
                    isDialogOpen={isPreviewDialogOpen}
                    base64={previewData}
                    fileType={previewInfo.fileExtension}
                    closeDialog={() => {
                        this.handleDocOnChange(!isPreviewDialogOpen, 'isPreviewDialogOpen');
                    }}
                />
                }

            </>
        );
    }
}

class SelectCheckboxRenderer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Checkbox
                color="default"
                checkedIcon={<CheckBox/>}
                icon={<CheckBoxOutlineBlank/>}
            />
        );
    }
}

const inOutDocPreview = (props) => {
    const {rowIndex, data} = props;
    return (
        <Grid container>
            <IconButton
                id={`rfrLetter_assignment_${rowIndex}`}
                color={'primary'}
                title={'Assignment'}
                onClick={() => props.onClick(data)}
            >
                <Assignment/>
            </IconButton>
        </Grid>
    );
};


const styles = theme => ({
    drawerRoot: {
        height: '69vh',
        width: '69vh'
    },
    form: {
        width: '418px',
        height: '100%'
    },
    formContainer: {
        width: '600px',
        padding: theme.spacing(1),
        height: '100%'
    }
});

const mapState = state => ({
    clinicList: state.common.clinicList,
    serviceList: state.common.serviceList,
    pageStatus: state.certificateEform.pageStatus,
    scannerParams: state.scannerCertificate.scannerParams,
    scannerHistoryList: state.scannerCertificate.scannerHistoryList,
    service: state.login.service,
    previewData: state.doc.previewData,
    encounterInfo: state.patient.encounterInfo
});

const mapDispatch = {
    openCommonCircular,
    closeCommonCircular,
    triggerUpdateHistoryContainerOpenClose,
    triggerGetSingleInOutDoc,
    openCommonMessage
};

export default connect(mapState, mapDispatch)(withStyles(styles)(HistoryContainer));
