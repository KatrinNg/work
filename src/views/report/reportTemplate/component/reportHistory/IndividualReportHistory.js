import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSCommonSelect from '../../../../../components/Select/CIMSCommonSelect';
import { Button, Grid } from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import withWidth from '@material-ui/core/withWidth';
import Enum from '../../../../../enums/enum';
import _ from 'lodash';
import moment from 'moment';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import * as ReportConstant from '../../../../../constants/report/reportConstant';
import * as listUtilities from '../../../../../utilities/listUtilities';
import * as reportUtilities from '../../../../../utilities/reportUtilities';
import CIMSCustomDialog from '../../../../../components/Dialog/CIMSCustomDialog';
import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import * as DateUtilities from '../../../../../utilities/dateUtilities';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { print } from '../../../../../utilities/printUtilities';
import CIMSPdfViewer from '../../../../../components/PDF/CIMSPdfViewer';


import {
    updateField,
    requestData,
    postData,
    openPreviewWindow
} from '../../../../../store/actions/report/reportTemplateAction';

const theme = createMuiTheme({});

const styles = theme => ({
    form: {
        marginLeft: '5rem',
        marginRight: '5rem',
        marginTop: '1rem'
    },
    selectRoot: {
        color: fade(Colors.common.black, 1) + ' !important',
        '&$shrink': {
            transform: 'translate(14px, -10px) scale(0.75)',
            borderRadius: '4px',
            backgroundColor: Colors.common.white,
            padding: '2px 4px 2px 4px'
        }
    },
    selectOption: {
        minWidth: '250px'
    },
    selectOptionScrollBar: {
        '& div': {
            maxHeight: '70px',
            overflowY: 'auto'
        }
    },
    batchDownloadOption: {
        padding: 3,
        top: '-11px',
        minWidth: '165px'
    },
    tableContainer: {
        marginLeft: '1rem',
        marginRight: '1rem',
        marginTop: '1rem'
    },
    gridRow: {
        maxHeight: '80px',
        height: '80px'
    },
    labelField: {
        textAlign: 'right',
        marginTop: '20px',
        color: 'black '
    },
    fieldMargin: {
        marginRight: '25px'
    },
    card: {
        width: '100%',
        marginTop: 8
    },
    cardHeaderRoot: {
        background: theme.palette.text.primary,
        padding: '8px'
    },
    cardHeaderTitle: {
        fontSize: theme.palette.textSize,
        color: theme.palette.background.default,
        fontWeight: 'bold'
    },
    dialogActions: {
        justifyContent: 'flex-start'
    },
    buttonRoot: {
        minWidth: '150px'
    },
    actionButtonRoot: {
        color: '#0579c8',
        border: 'solid 1px #0579C8',
        boxShadow: '2px 2px 2px #6e6e6e',
        backgroundColor: '#ffffff',
        minWidth: '90px',
        '&:disabled': {
            border: 'solid 1px #aaaaaa',
            boxShadow: '1px 1px 1px #6e6e6e'
        },
        '&:hover': {
            color: '#ffffff',
            backgroundColor: '#0579c8'
        }
    },
    actionButtonRootDiv: {
        paddingLeft: '278px'
    },
    actionButtonDiv: {
        paddingRight: '25px'
    },
    actionButtonPadding: {
        paddingLeft: '10px',
        paddingRight: '10px'
    },
    disabledTextFieldRoot: {
        backgroundColor: Colors.grey[200]
    },
    multipleTipRoot: {
        color: theme.palette.primary.main
    },
    disableChangeTimeFromHelper: {
        paddingLeft: 5,
        color: theme.palette.primary.main
    },
    multipleUpdateForm: {
        width: 800,
        height: 550,
        paddingTop: 20
    },
    labelContainer: {
        paddingTop: 15,
        paddingBottom: 15
    },
    inputLabel: {
        zIndex: 5,
        background:'white'
    },
    error: {
        color: 'red',
        fontSize: '0.75rem'
    },
    dialogPaper: {
        width: '80%'
    }
});

const sortFunc = (a, b) => a.label > b.label ? 1 : b.label > a.label ? -1 : 0;

const multiSelectRefs = {
    site:'refSite',
    reportDesc:'refReportDesc',
    reportStatus:'refReportStatus',
    userId:'refUserId',
    reportName:'refReportName'
};

class ViewRenderer extends Component {
    constructor(props) {
        super(props);
        props.eParentOfValue.style.height =  '100%';
        props.eParentOfValue.style.justifyContent =  'center';
        props.eParentOfValue.style.display =  'flex';
        props.eParentOfValue.style.alignItems =  'center';
    }

    // Test to get report data
    getReportData = (newData) => {
        let fileData = newData || {};
        let submitData = {
            date: fileData.reportId || this.props.selectedReport.reportId
        };
        this.props.requestData('reportData', submitData, fileData);
    }

    // Test Local server
    readTextFile = (file) =>{
        console.log('reading');
        let rawFile = new XMLHttpRequest();
        rawFile.open('GET', file, true);
        rawFile.overrideMimeType('text/plain; charset=x-user-defined');
        rawFile.onreadystatechange = () => {
            if(rawFile.readyState === 4)
            {
                if(rawFile.status === 200 || rawFile.status == 0)
                {
                    let rawData = rawFile.responseText;
                    let base64EncodedStr = reportUtilities.base64Encode(rawData);
                    this.props.updateField({ openReportPreview: true, reportData: base64EncodedStr});
                }
            }
        };
        rawFile.send(null);
    }

    openPreviewWindow = (data) => {
        console.log('opening');

        // read local
        //this.readTextFile(localPDF);

        // uncomment this to enable request data
        let params = {
            outDocId: data.documentId,
            openReportPreview: true
        };
        this.props.requestData('reportData', params);
    }

    handleViewPDF= ( e, data )=>{
        e.preventDefault();
        // this.props.updateState({openWaringDialog: true, confirmFunction: () => {
        //     this.openPreviewWindow(data);
        //     this.props.updateField({ selectedReport: data});
        // }});
        this.openPreviewWindow(data);
        this.props.updateField({ selectedReport: data});
    }

    render() {
        const { data } = this.props;
        return (
            <>
                {data && data.documentId && data.pdf && data.pdf === 'Y' ?
                    <Button
                        id={data.reportId}
                        onClick={(e)=>{this.handleViewPDF(e, data);}}
                        variant="contained"
                        color="primary"
                        style={{height:'40px'}}
                    >view
                    </Button>:
                    null
                }
            </>
        );
    }
}

class DownloadFileTypeButton extends Component {
    constructor(props) {
        super(props);
        props.eParentOfValue.style.height =  '100%';
        props.eParentOfValue.style.justifyContent =  'center';
        props.eParentOfValue.style.display =  'flex';
        props.eParentOfValue.style.alignItems =  'center';
    }

    handleDownloadFile= (e, data, exportType)=>{
        e.preventDefault();
        let params = {
            fileOutType: exportType,
            outDocId: data.documentId,
            fileName: data.reportName
        };
        // this.props.updateState({openWaringDialog: true, confirmFunction: () => {
        //     this.props.requestData('downloadByType', params);
        // }});
        this.props.requestData('downloadByType', params);
    }

    render() {
        const { data } = this.props;
        return (
            <Grid container spacing={4}>
                <Grid item xs={3} className={{}}>
                <Button
                    classes={{
                        padding: '0px 10px 0px 0px'
                    }}
                    disabled={!(data && data.documentId && data.csv && data.csv === 'Y')}
                    id={data.reportId}
                    onClick={(e)=>{
                        this.handleDownloadFile(e, data, 'csv');
                    }}
                    variant="contained"
                    color="primary"
                    style={{height:'40px'}}
                >CSV
                </Button>
                </Grid>
                <Grid item xs={3} className={{}}></Grid>
                <Grid item xs={3} className={{}}>
                <Button
                    classes={{
                        padding: '0px 10px 0px 0px'
                    }}
                    disabled={!(data && data.documentId && data.excel && data.excel === 'Y')}
                    id={data.reportId}
                    onClick={(e)=>{
                        this.handleDownloadFile(e, data, 'excel');
                    }}
                    variant="contained"
                    color="primary"
                    style={{height:'40px'}}
                >excel
                </Button>
                </Grid>
            </Grid>
        );
    }
}


class IndividualReportHistory extends Component {
    constructor(props) {
        super(props);
        let columnDefs = [];
        let colDefs= [
            {headerName:'No. ',colId:'no', width:80,
                valueGetter: params => params.node.rowIndex + 1
            },
            {headerName: '', colId: 'checkBox', valueGetter: (params) => '', filter: false, headerCheckboxSelection: true, checkboxSelection: true, width: 40},
            {headerName:'View',colId:'view', width:130, minWidth: 130, maxWidth:130, cellRenderer:'viewRenderer',
                cellRendererParams: {
                    openPreviewWindow:props.openPreviewWindow,
                    updateField:props.updateField,
                    requestData:props.requestData
                    // updateState:   (obj) => this.setState({ ...obj })
                }
            },
            {headerName:'Download',colId:'download', width:250, minWidth: 250, maxWidth:250, cellRenderer:'downloadFileTypeButton',
                cellRendererParams: {
                    openPreviewWindow:props.openPreviewWindow,
                    updateField:props.updateField,
                    postData: props.postData,
                    downloadByFileType: props.downloadByFileType,
                    requestData:props.requestData
                    // updateState:   (obj) => this.setState({ ...obj })
                }
            },
            //{headerName:"Job id",field:"jobId", width:250 },
            {headerName:'Report Template Name',field:'reportName', width:200},
            {headerName:'Description',field:'reportDesc', width:350},
            {headerName:'Report Status',field:'result', width:150},
            //{headerName:"User",field:"userId", width:350,
                //valueFormatter: param => {
                    //console.log(param.value);
                    //let userObj = this.props && this.props.users.find(x => x.userId === param.value);
                    //let userInfo = "";
                    //if(userObj){
                        //userInfo = userObj.engGivName + " " + userObj.engSurname + " - " + userObj.email;
                    //}
                    //return userInfo;
                //}
            //},
            {headerName:'Request Date',field:'createDtm', width:150, _type:'Date' },
            {headerName:'Clinic Name',field:'siteId', width:150,
                valueFormatter: param => {
                    let siteObj = this.props.clinicList.find(x => x.siteId === param.value);
                    return siteObj && siteObj.siteCd;
                }
            },
            {headerName:'Job Start',field:'jobStartTime', width:190, _type:'Datetime'},
            {headerName:'Job End',field:'jobEndTime', width:190, _type:'Datetime'},
            //{headerName:"Is instant gen",field:"isInstantGen", width:150},
            {headerName:'Report Parameters',field:'paramString', width:777},
            {headerName:'Error Code',field:'errorCode', width:200}
            //{headerName:"Retry",field:"retryCount", width:150},
            //{headerName:"Max Retry",field:"maxRetryCount", width:150}
        ];
        for (let i = 0; i < colDefs.length; i++){
            let {colId, field, width, _type} = colDefs[i];
            let col = {
                ...colDefs[i],
                cellStyle: {
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                },
                resizable: true,
                maxWidth:width * 10,
                minWidth:width,
                sortable: true
            };
            switch (field){
                default:
                    switch(colId) {
                        case 'view':
                            col = {
                                ...col,
                                sortable: false
                            };
                            break;
                    }
                    break;
            }
            switch (_type){
                case 'Datetime':
                    col = {
                        ...col,
                        valueFormatter: (param) => param.value ? moment(param.value).format( Enum.NO_ZERO_DATE_FORMAT_24 ) : null,
                        comparator: DateUtilities.formatDateComparator(),
                        filterParams: {
                            comparator: DateUtilities.dateFilter,
                            browserDatePicker: true
                        }
                    };
                    break;
                case 'Date':
                    col = {
                        ...col,
                        valueFormatter: (param) => param.value? moment(param.value).format( Enum.NO_ZERO_DATE_FORMAT_EDMY_VALUE) : null,
                        comparator: DateUtilities.formatDateComparator(),
                        filterParams: {
                            comparator: DateUtilities.dateFilter,
                            browserDatePicker: true
                        }
                    };
                    break;
                default:
                    break;
            }
            colDefs[i] = col;
        }
        columnDefs = columnDefs.concat(colDefs);
        this.state = {
            fontsLoaded: false,
            reportStatus: ReportConstant.REPORT_STATUS_SET.map(x =>({
                value: x.code,
                label: x.label,
                item: x
            })),
            exportTypeList: ReportConstant.exportTypeList,
            selectedExportType: null,
            exportTypeListForDialog: ReportConstant.exportTypeList,
            activeBatchDownload: false,
            selectedBatchExportType: ReportConstant.exportTypeList[0],
            siteMenuOpen: false,
            reportDescMenuOpen: false,
            reportStatusMenuOpen: false,
            reportNameMenuOpen: false,
            serviceCd: '',
            rowData: [],
            BatchDownloadButtonString: 'Batch Download',
            isDownloadAReport: false,
            columnDefs: columnDefs
            // openWaringDialog: false,
            // confirmFunction: null
        };
        console.log('this.props.individualReportList');
        console.log(this.props.individualReportList);
        console.log('this.props.individualReportList');

        this.refGrid = React.createRef();
        this.refForm = React.createRef();
        //this.refSelect = null;
        //this.setRefSelect = element => this.refSelect= element;

        this.refSiteSelect = null;
        this.setRefSiteSelect = el => this.refSiteSelect= el;

        this.refDescSelect = null;
        this.setRefDescSelect = el => this.refDescSelect= el;

        this.refNameSelect = null;
        this.setRefNameSelect = el => this.refNameSelect= el;

        this.refStatusSelect = null;
        this.setRefStatusSelect = el => this.refStatusSelect= el;
    }

    componentDidMount() {
        this.props.requestData('searchIndividualReport');
    }

    componentDidUpdate(prevProps) {
        if (prevProps.individualReportList !== this.props.individualReportList ) {
            this.setState({rowData: this.props.individualReportList});
        }

    }

    setFontsLoaded(complete) {
        this.setState({fontsLoaded: complete});
    }

    closeReportHistoryDialog = () => {
        this.props.updateField({ openReportPreview: false, reportData: null });
    }

    getGrid = () => {
        if (this.refGrid.current) {
            let { grid } = this.refGrid.current;
            return grid;
        }
        return null;
    }

    printPDF = () => {
        const { reportData } = this.props;
        const pdfData = reportData && reportData.pdf;
        const callback = (printSuccess) => {
            if (printSuccess) {
                this.closeReportHistoryDialog();
            }
        };
        const printParam = {
            base64: pdfData,
            callback: callback,
            copies: 1
        };
        console.log('---------------------------------------------------');
        console.log('print: ', printParam);
        console.log('---------------------------------------------------');
        print(printParam);
    }

    downloadFile = () =>{
        const exportType = this.state.selectedExportType;
        console.log('---------------------------------------------------');
        console.log(exportType);
        console.log('---------------------------------------------------');
        if(exportType.value === 'pdf'){
            this.downloadPDF();
        } else {
            const { selectedReport } = this.props;
            let submitData = {
                fileOutType: exportType.value,
                b64String: this.props.reportData && this.props.reportData.xml,
                fileName: selectedReport.reportName
            };
            this.props.postData('convertFromB64Xml', submitData );
        }
    }

    downloadPDF = () => {
        const { reportData, selectedReport } = this.props;
        const pdfData = reportData && reportData.pdf;
        const linkSource = `data:application/pdf;base64,${pdfData}`;
        const downloadLink = document.createElement('a');
        let fileName = selectedReport.reportName;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        //downloadLink.click();
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    resetForm = () => {
        this.props.updateField({'reportJobList': []});
        for (let k in multiSelectRefs) {
            let ref = this[multiSelectRefs[k]];
            if(ref){
                ref.props.deselectAll();
            }
        }
    }
    getSelectedRowData = () => {
        console.log('getting selected row');
        const grid = this.getGrid();
        let selectedNodes = grid.api.getSelectedNodes();
        let selectedData = selectedNodes.map(node => node.data);
        selectedData = selectedData.filter(x => x.documentId && x.result == 'Completed' );
        console.log(selectedData);
        return selectedData;
    };

    batchDownload = () => {
        let jobs = this.getSelectedRowData();
        let jobIdList = listUtilities.getFieldFromObjArray(jobs, 'jobId');
        const exportTypeObj = this.state.selectedBatchExportType;
        let exportType = exportTypeObj && exportTypeObj.value;
        console.log('---------------------------------------------------');
        console.log(jobIdList);
        console.log('export type: ' + exportType);
        console.log('---------------------------------------------------');
        // If Download One File not need zip
        // Use componentDidUpdate() logic
        if (jobIdList.length === 1) {
            // if (exportType === 'pdf') {
                // let params = {
                //     outDocId: this.props.reportJobList.filter(item => item.jobId === jobIdList[0])[0].documentId,
                //     openReportPreview: false
                // };
                //     this.props.requestData('reportData', params);
                // this.props.updateField({ selectedReport: this.props.reportJobList.filter(item => item.jobId === jobIdList[0])[0]});
                // this.setState({isDownloadAReport: true});
            // } else {
                // let submitData = {
                //     fileOutType: exportType,
                //     outDocId: this.props.reportJobList.filter(item => item.jobId === jobIdList[0])[0].documentId,
                //     fileName: this.props.reportJobList.filter(item => item.jobId === jobIdList[0])[0].reportName
                // };
                // this.props.requestData('downloadByType', submitData);
            // }
            let submitData = {
                jobIdList: jobIdList,
                exportType: exportType
            };
            this.props.requestData('batchDownload', submitData);
        } else {
            let submitData = {
                jobIdList: jobIdList,
                exportType: exportType
            };
            this.props.requestData('batchDownload', submitData);
        }
    }

    disableClickSelectionRenderers = ['viewRenderer'];

    handleMouseDownCapture = (e, ref ) =>{
        const select = ref;
        const {scrollHeight, clientHeight} = e.target;
        let scrollBar =false;
        if(scrollHeight > clientHeight){
            scrollBar =true;
        }

        const menuIsOpen = select && select.state && select.state.menuIsOpen;
        console.log('menu is open', menuIsOpen);

        if(scrollBar){
            if(menuIsOpen){
                console.log('menu is opened');
                // Menu is opened
                //open
                console.log('Blur');
            } else{
                //close
                console.log('menu is opened');
                select.blur();
                select.focus();
                console.log('Blur + focus');
            }
        }
    }

    // handleConfirmDialog = () => {
    //     const {confirmFunction} = this.state;
    //     this.setState({openWaringDialog: false}, () => {
    //         if (typeof confirmFunction === 'function') confirmFunction();
    //     });
    // }

    render() {
        const { classes, reportData, openReportPreview } = this.props;
        const idConstant = 'report_history';
        const pdfData = reportData && reportData.pdf;
        const xmlData = reportData && reportData.xml;

        return (
            <>
                <MuiThemeProvider theme={theme}>
                <Grid item container xs={12}>
                    <Grid item xs={4}> </Grid>
                    <Grid item xs={4}> </Grid>
                    <Grid item xs={4} className={classes.actionButtonRootDiv}>
                        <CIMSCommonSelect
                            id={idConstant + '_export_type'}
                            label="Batch Export Type"
                            options={this.state.exportTypeList}
                            value={this.state.selectedBatchExportType}
                            defaultValue={this.state.exportTypeList[0]}
                            controlProps={{
                                    className: classes.batchDownloadOption,
                                    fullWidth: false
                                    }}
                            inputProps={{
                                    gilterOption: {
                                        matchFrom: 'start'
                                    },
                                    isClearable: false
                                    }}
                            onChange={(value, params) => this.setState({selectedBatchExportType: value})}
                        />
                        <Button type="button" className={classes.actionButtonRoot} variant="contained" color="primary" disabled={!this.state.activeBatchDownload} id={idConstant + '_batch_download'}
                            onClick={()=>{ this.batchDownload();}}
                        >{this.state.BatchDownloadButtonString}</Button>
                    </Grid>
                </Grid>
                </MuiThemeProvider>
                <Grid className={classes.tableContainer}>
                    <CIMSDataGrid
                        ref={this.refGrid}
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '71vh',
                            display:'block'
                        }}
                        gridOptions={{
                            columnDefs: this.state.columnDefs,
                            onCellFocused: e => {
                                if (e.column && this.disableClickSelectionRenderers.includes(e.column.colDef.cellRenderer)) {
                                    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = true;
                                }
                                else {
                                    e.api.gridOptionsWrapper.gridOptions.suppressRowClickSelection = false;
                                }
                            },
                            onSelectionChanged: e => {
                                const selectedRowData = this.getSelectedRowData();
                                let len = selectedRowData && selectedRowData.length;
                                let activeBatchFlag = len > 0 && len <= 100;
                                this.setState({activeBatchDownload: activeBatchFlag});
                                // if (len === 1) {
                                //     this.setState({BatchDownloadButtonString: 'Download'});
                                // } else {
                                //     this.setState({BatchDownloadButtonString: 'Batch Download'});
                                // }
                            },
                            rowData: this.state.rowData,
                            frameworkComponents: {
                                viewRenderer: ViewRenderer,
                                downloadFileTypeButton: DownloadFileTypeButton
                            },
                            rowBuffer: 30,
                            rowSelection: 'multiple',
                            rowMultiSelectWithClick: true,
                            getRowNodeId: data=>data.jobId,
                            postSort: rowNodes => {
                                let rowNode = rowNodes[0];
                                if (rowNode) {
                                    setTimeout((rowNode) => {
                                        rowNode.gridApi.refreshCells();
                                    }, 100, rowNode);
                                }
                            },
                            rowHeight: 55,
                            getRowHeight: params =>55,
                            //suppressRowHoverHighlight: true,
                            defaultColDef: { autoHeight: true }
                        }}
                        //suppressGoToRow
                        //suppressDisplayTotal
                    />
                </Grid>
            {
                <CIMSCustomDialog
                    open={openReportPreview}
                    //open={true}
                    id={idConstant}
                    dialogTitle={'Preview >> Reports'}
                    classes={{
                        paper: classes.dialogPaper
                    }}
                    children={
                            <CIMSCommonSelect
                                id={idConstant + '_export_type'}
                                label="ExportType"
                                options={this.state.exportTypeListForDialog}
                                value={this.state.selectedExportType}
                                defaultValue={this.state.exportTypeListForDialog ? this.state.exportTypeListForDialog[0] : []}
                                controlProps={{
                                    className: classes.selectOption,
                                    fullWidth: false
                                }}
                                inputProps={{
                                    gilterOption: {
                                        matchFrom: 'start'
                                    },
                                    isClearable: false
                                }}
                                onChange={(value, params) => this.setState({selectedExportType: value})}
                            />
                    }
                    dialogContentText={
                        <Grid>
                            <CIMSPdfViewer
                                id={`${idConstant}_pdfViewer`}
                                previewData={pdfData}
                            />
                        </Grid>
                    }
                    buttonConfig={
                        [
                            {
                                id: `${idConstant}_printDownloadButton`,
                                name: 'Download',
                                disabled: !pdfData,
                                onClick: () => { this.downloadFile(); }
                            },
                            {
                                id: `${idConstant}_printReportHistoryButton`,
                                name: 'Print',
                                disabled: !pdfData,
                                onClick: () => { this.printPDF(); }
                            },
                            {
                                id: `${idConstant}_closeReportPreviewButton`,
                                name: 'Cancel',
                                onClick: () => {
                                    // this.setState({ deleteReasonDialogOpen: false, deleteReasonType: '', deleteReasonText: '' });
                                    this.closeReportHistoryDialog();
                                }
                            }
                        ]
                    }
                />
            }
            </>
        );

    }
}

function mapStateToProps(state) {
    return {
        clinicList: state.common.clinicList,
        rooms: state.common.rooms,
        //users: state.reportTemplate.users,
        sessionsConfig: state.common.sessionsConfig,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        siteId: state.login.clinic.siteId,
        selectedReport: state.reportTemplate.selectedReport,
        reportData: state.reportTemplate.reportData,
        individualReportList: state.reportTemplate.individualReportList,
        reportJobList: state.reportTemplate.reportJobList,
        reportTemplateList: state.reportTemplate.reportTemplateList,
        openReportPreview: state.reportTemplate.openReportPreview,
        commonMessageDetail: state.message.commonMessageDetail
    };
}

const mapDispatchToProps = {
    requestData,
    postData,
    updateField,
    openPreviewWindow,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(withStyles(styles)(IndividualReportHistory)));
