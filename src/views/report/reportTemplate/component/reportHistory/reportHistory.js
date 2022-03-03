import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSDialog from '../../../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import CIMSInputLabel from '../../../../../components/InputLabel/CIMSInputLabel';
import CIMSFormLabel from '../../../../../components/InputLabel/CIMSFormLabel';
import CIMSCommonSelect from '../../../../../components/Select/CIMSCommonSelect';
import { colors } from '@material-ui/core';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    Card,
    CardHeader,
    CardContent,
    Checkbox,
    FormHelperText,
    FormGroup,
    FormControl,
    FormControlLabel,
    Input,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Radio,
    Select,
    TextField,
    Typography
} from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import {
    ArrowDropDown as ArrowDropDownIcon
} from '@material-ui/icons';
import {
    KeyboardDatePicker
} from '@material-ui/pickers';
import withWidth from '@material-ui/core/withWidth';
import TimeFieldValidator from '../../../../../components/FormValidator/TimeFieldValidator';
import DateFieldValidator from '../../../../../components/FormValidator/DateFieldValidator';
import SelectFieldValidator from '../../../../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import Enum from '../../../../../enums/enum';
import TextFieldValidator from '../../../../../components/FormValidator/TextFieldValidator';
//import NewOldQuota from '../../../../compontent/newOldQuota';
import RequiredIcon from '../../../../../components/InputLabel/RequiredIcon';

import _ from 'lodash';
import moment from 'moment';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';

import { openCommonMessage } from '../../../../../store/actions/message/messageAction';
import CommonMessage from '../../../../../constants/commonMessage';
import CommonRegex from '../../../../../constants/commonRegex';
import * as ReportConstant from '../../../../../constants/report/reportConstant';
import * as listUtilities from '../../../../../utilities/listUtilities';
import * as reportUtilities from '../../../../../utilities/reportUtilities';
import ValidatorEnum from '../../../../../enums/validatorEnum';
import CIMSCustomDialog from '../../../../../components/Dialog/CIMSCustomDialog';
import * as messageUtilities from '../../../../../utilities/messageUtilities';
import CIMSCheckBox from '../../../../../components/CheckBox/CIMSCheckBox';
//import NewOldQuotaPublic from '../../../../compontent/newOldQuotaPublic';
import * as CommonUtil from '../../../../../utilities/commonUtilities';

import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import * as DateUtilities from '../../../../../utilities/dateUtilities';
import ReportHistoryDialog from './reportHistoryDialog';

import { fade } from '@material-ui/core/styles/colorManipulator';
import { print } from '../../../../../utilities/printUtilities';

//import localPDF from './RPT-FCS-STA-0019.pdf';

import CIMSPdfViewer from '../../../../../components/PDF/CIMSPdfViewer';

// import RestrictedDialog from './restrictedDialog';

import {
    updateField,
    requestData,
    postData,
    openPreviewWindow,
    jobLogPolling
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
        top: '-8px',
        minWidth: '250px'
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


class ReportHistory extends Component {
    constructor(props) {
        super(props);
        let columnDefs = [];
        let colDefs= [
            {headerName:'No. ',colId:'no', width:80,
                valueGetter: params => params.node.rowIndex + 1
            },
            {headerName: '', colId: 'checkBox', valueGetter: (params) => '', filter: false, headerCheckboxSelection: true, checkboxSelection: true, width: 40},
            // add field property (field:'result') to let ag-grid cell know that data are updated for ViewRenderer re-rendering
            {headerName:'View', field:'result', colId:'view', width:130, minWidth: 130, maxWidth:130, cellRenderer:'viewRenderer',
                cellRendererParams: {
                    openPreviewWindow:props.openPreviewWindow,
                    updateField:props.updateField,
                    requestData:props.requestData
                    // updateState:   (obj) => this.setState({ ...obj })
                }
            },
            // add field property (field:'result') to let ag-grid cell know that data are updated for downloadFileTypeButton re-rendering
            {headerName:'Download', field:'result', colId:'download', width:250, minWidth: 250, maxWidth:250, cellRenderer:'downloadFileTypeButton',
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
            sites: props.clinicList.filter(x => x.serviceCd === props.serviceCd)
            .map(x => ({
                value: x.siteId,
                label: x.siteName,
                item: x
            })),
            sessions: props.sessionsConfig.filter(x => x.siteId === props.siteId)
            .map(x => ({
                value: x.sessId,
                label: x.sessDesc,
                item: x
            })),
            rooms: props.rooms.filter(x => x.siteId === props.siteId)
            .map(x => ({
                value: x.rmId,
                label: x.rmDesc,
                item: x
            })),
            reportName: props.reportTemplateList.filter(x => x.svcCd === props.serviceCd)
            .map(x =>({
                value: x.reportId,
                label: x.reportName,
                item: x
            })),
            reportDesc: props.reportTemplateList.filter(x => x.svcCd === props.serviceCd)
            .map(x =>({
                value: x.reportId,
                label: x.reportDesc,
                item: x
            })),
            reportStatus: ReportConstant.REPORT_STATUS_SET.map(x =>({
                value: x.code,
                label: x.label,
                item: x
            })),
            users: props.users && props.users.filter(user =>  user.uamMapUserSiteDtos && user.uamMapUserSiteDtos.filter(x => x. siteId === props.siteId).length > 0 )
            .map(x => ({
                value: x.userId,
                label: x.engGivName + ' ' + x.engSurname + ' - ' + x.email,
                item: x
            })),
            startDate: moment(),
            endDate: moment(),
            siteInput: null,
            userInput: null,
            reportDescInput: null,
            reportStatusInput: null,
            reportNameInput: null,
            reportParametersInput: '',
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
            columnDefs: columnDefs,
            jobSts:Enum.STATISTICAL_RPT_STS.PENDING,
            timer:null
            // openWaringDialog: false,
            // confirmFunction: null
        };
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

    UNSAFE_componentWillMount() {
    }

    componentDidMount() {
        const {jobData, serviceCd}=this.props;
        if (document.fonts) {
            document.fonts.ready
            .then(() => {
                this.setFontsLoaded(true);
            });
        }
        if(this.props.rptHistoryInitSearch){
            this.handleSubmit();
        }
        if (jobData && jobData.result === Enum.STATISTICAL_RPT_STS.PENDING) {
            const params = {
                jobId: jobData.jobId,
                svcCd: serviceCd,
                startDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
                endDate: moment().format(Enum.DATE_FORMAT_EYMD_VALUE)
            };
            let timer = setInterval(() => {
                this.props.jobLogPolling(params, (data) => {
                    if (data.length > 0) {
                        this.setState({ jobSts: data[0].result });
                    }
                });
            }, 10000);
            this.setState({ timer });
        }
    }

    shouldComponentUpdate() {
        const { jobData,reportJobList } = this.props;
        if (this.state.jobSts === Enum.STATISTICAL_RPT_STS.Completed || this.state.jobSts === Enum.STATISTICAL_RPT_STS.Failed) {
            clearInterval(this.state.timer);
            this.setState({ jobSts: Enum.STATISTICAL_RPT_STS.PENDING });
            let msgCode = '';
            if (this.state.jobSts === Enum.STATISTICAL_RPT_STS.Completed) {
                msgCode = '112101';
            } else {
                msgCode = '112102';
            }
            this.props.openCommonMessage({
                msgCode: msgCode,
                params: [
                    { name: 'REPORT_NAME', value: jobData.reportName }
                ],
                showSnackbar: true
            });
            this.handleSubmit();
        }
        if (jobData) {
            const job = reportJobList.find(x => x.jobId === jobData.jobId);
            if (job && job.result !== Enum.STATISTICAL_RPT_STS.PENDING) {
                if (this.state.timer) {
                    clearInterval(this.state.timer);
                }
            }
        }

        return true;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.reportJobList !== this.props.reportJobList ) {
            this.setState({rowData: this.props.reportJobList});
        }
        if (prevProps.selectedReport !== this.props.selectedReport) {
            let updateExportTypeListForDialog = ReportConstant.exportTypeList.filter(x=>
                (this.props.selectedReport) && (
                    (this.props.selectedReport.pdf === 'Y' && x.value === 'pdf') ||
                    (this.props.selectedReport.excel === 'Y' && x.value === 'excel') ||
                    (this.props.selectedReport.csv === 'Y' && x.value === 'csv')
                )
            );
            this.setState({
                exportTypeListForDialog : updateExportTypeListForDialog,
                selectedExportType : updateExportTypeListForDialog[0]
            });
        }
        // if (prevProps.selectedReport && this.state.isDownloadAReport) {
        //     // this.downloadPDF();
        //     this.setState({isDownloadAReport: false});
        //     this.props.updateField({ selectedReport: null});
        // }
    }

    componentWillUnmount() {
        clearInterval(this.state.timer);
        this.setState({ jobSts: Enum.STATISTICAL_RPT_STS.PENDING });
        this.props.updateField({ jobData: null });
    }

    setFontsLoaded(complete) {
        this.setState({fontsLoaded: complete});
    }

    closeReportHistoryDialog = () => {
        this.props.updateField({ openReportPreview: false, reportData: null });
    }

    getForm = () => {
        if (this.refForm.current) {
            let form = this.refForm.current;
            return form;
        }
        return null;
    }

    getGrid = () => {
        if (this.refGrid.current) {
            let { grid } = this.refGrid.current;
            return grid;
        }
        return null;
    }

    handleSubmit = () => {
        const form = this.getForm();
        if(form){
            form.submitForm();
        }
    }

    handleSearch = (values) => {
        let siteIdList;
        let userIdList;
        let reportNameList;
        let reportDescList;
        let reportStatusList;
        let { site, user, reportName, reportDesc, reportStatus, startDate, endDate , reportParameters} = values;

        if( values ){
            if( site && site.length > 0 ){
                siteIdList = listUtilities.getFieldFromObjArray(site, 'item', 'siteId');
                siteIdList = listUtilities.uniqueList(siteIdList);
            }
            if( user && user.length > 0 ){
                userIdList = listUtilities.getFieldFromObjArray(user, 'item', 'userId');
                userIdList = listUtilities.uniqueList(userIdList);
            }
            if( reportName && reportName.length > 0 ){
                reportNameList = listUtilities.getFieldFromObjArray(reportName, 'label');
                reportNameList= listUtilities.uniqueList(reportNameList);
            }
            if( reportDesc && reportDesc.length > 0 ){
                reportDescList = listUtilities.getFieldFromObjArray(reportDesc, 'label' );
                reportDescList = listUtilities.uniqueList(reportDescList);
            }
            if( reportStatus && reportStatus.length > 0 ){
                reportStatusList = listUtilities.getFieldFromObjArray(reportStatus, 'label' );
                reportStatusList = listUtilities.uniqueList(reportStatusList);
            }
        }
        let params = {
            svcCd: this.props.serviceCd,
            startDate: startDate.format('YYYY-MM-DD'),
            endDate: endDate.format('YYYY-MM-DD'),
            siteId: siteIdList ? siteIdList: null,
            userId: userIdList ? userIdList: null,
            reportName: reportNameList ? reportNameList: null,
            reportDesc: reportDescList ? reportDescList: null,
            result: reportStatusList ? reportStatusList: null,
            paramString: reportParameters ? reportParameters: null
        };
        this.setState({
            startDate: this.state.startDate,
            endDate: this.state.endDate
        });

        this.props.requestData('reportJobList', params );
        this.props.setRptTemplateState({
            rptHistoryInitSearch: false
        });
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
        // if (jobIdList.length === 1) {
        //     // if (exportType === 'pdf') {
        //         // let params = {
        //         //     outDocId: this.props.reportJobList.filter(item => item.jobId === jobIdList[0])[0].documentId,
        //         //     openReportPreview: false
        //         // };
        //         //     this.props.requestData('reportData', params);
        //         // this.props.updateField({ selectedReport: this.props.reportJobList.filter(item => item.jobId === jobIdList[0])[0]});
        //         // this.setState({isDownloadAReport: true});
        //     // } else {
        //         // let submitData = {
        //         //     fileOutType: exportType,
        //         //     outDocId: this.props.reportJobList.filter(item => item.jobId === jobIdList[0])[0].documentId,
        //         //     fileName: this.props.reportJobList.filter(item => item.jobId === jobIdList[0])[0].reportName
        //         // };
        //         // this.props.requestData('downloadByType', submitData);
        //     // }
        //     let submitData = {
        //         jobIdList: jobIdList,
        //         exportType: exportType
        //     };
        //     this.props.requestData('batchDownload', submitData);
        // } else {
        let submitData = {
            jobIdList: jobIdList,
            exportType: exportType
        };
        this.props.requestData('batchDownload', submitData);
        // }
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
        const { classes, dialogAction, open, selectedItems, reportData, openReportPreview } = this.props;
        const idConstant = 'report_history';
        const pdfData = reportData && reportData.pdf;
        const xmlData = reportData && reportData.xml;
        return (
            <>
                <MuiThemeProvider theme={theme}>
                    <Formik
                        innerRef={this.refForm}
                        enableReinitialize
                        initialValues={{
                            startDate: this.state.startDate,
                            endDate: this.state.endDate,
                            site: this.props.isStatReportCrossSiteRight() ? this.state.siteInput : this.state.sites.filter(x => x.value == this.props.siteId),
                            user: this.state.userInput,
                            reportStatus: this.state.reportStatusInput,
                            reportName: this.state.reportNameInput,
                            reportDesc: this.state.reportDescInput,
                            reportParameters: this.state.reportParametersInput
                        }}
                        validationSchema={yup.object().shape({
                            site: yup
                                .array()
                                .nullable()
                                ,
                            user: yup
                                .array()
                                .nullable()
                                ,
                            selectedSession: yup
                                .object()
                                .nullable()
                                ,
                            startDate: yup
                                .object()
                                .nullable()
                                .required('Required')
                                .test('isDate', 'Invalid Date Format', function(date) {
                                    return date && date.isValid();
                                })
                                ,
                            endDate: yup
                                .object()
                                .nullable()
                                .required('Required')
                                .test('isDate', 'Invalid Date Format', function(date) {
                                    return date && date.isValid();
                                })
                                .test('isEndDateAfterStartDate', 'Cannot earlier than Start Date', function(endDate) {
                                    const { startDate } = this.parent;
                                    const _sdate = moment(startDate);
                                    const _edate = moment(endDate);
                                    if (_sdate.isValid() && _edate.isValid())
                                        return _edate.isSameOrAfter(_sdate);
                                    return true;
                                })
                                ,
                            reportDesc: yup
                                .array()
                                .nullable(),
                            reportStatus: yup
                                .array()
                                .nullable()
                                ,
                            reportName: yup
                                .array()
                                .nullable()
                                ,
                            reportParameters: yup
                                .string()
                                .nullable()
                        })}
                        onSubmit={(values, actions) => {
                            console.log('submitting');
                            this.handleSearch(values);
                            setTimeout(() => {
                                actions.setSubmitting(false);
                            }, 1000);
                        }}
                    >
                    {props => (
                        <Form className={classes.form}>
                            <Grid container spacing={4}>
                                <Grid item xs={3} className={classes.gridRow}>
                                    <Field name="startDate" >
                                    {({ field, form, meta }) => (
                                        <KeyboardDatePicker
                                            id={idConstant + '_startDate_picker'}
                                            label="* Request Start Date"
                                            margin="dense"
                                            inputVariant="outlined"
                                            fullWidth
                                            format="DD-MM-YYYY"
                                            autoOk
                                            helperText=""
                                            value={field.value}
                                            onBlur={() => form.setFieldTouched(field.name, true)}
                                            onChange={value => form.setFieldValue(field.name, value)}
                                            onClose={() => form.setFieldTouched(field.name, true)}
                                            InputProps={{
                                            }}
                                            KeyboardButtonProps={{
                                                'aria-label': 'change start date'
                                            }}
                                        />
                                    )}
                                    </Field>
                                    <ErrorMessage name="startDate" component="div" className={classes.error} />
                                </Grid>
                                <Grid item xs={3} className={classes.gridRow}>
                                    <Field name="endDate">
                                    {({ field, form, meta }) => (
                                        <KeyboardDatePicker
                                            id={idConstant + '_endDate_picker'}
                                            label="* Request End Date"
                                            margin="dense"
                                            inputVariant="outlined"
                                            fullWidth
                                            format="DD-MM-YYYY"
                                            autoOk
                                            helperText=""
                                            value={field.value}
                                            onBlur={() => form.setFieldTouched(field.name, true)}
                                            onChange={value => form.setFieldValue(field.name, value)}
                                            onClose={() => form.setFieldTouched(field.name, true)}
                                            InputProps={{
                                            }}
                                            KeyboardButtonProps={{
                                                'aria-label': 'change end date'
                                            }}
                                        />
                                    )}
                                    </Field>
                                    <ErrorMessage name="endDate" component="div" className={classes.error} />
                                </Grid>

                                <Grid item xs={6} className={classes.gridRow}
                                    onMouseDown={(e) =>this.handleMouseDownCapture(e, this.refSiteSelect)}
                                >
                                    <Field name="site">
                                    {({ field, form, meta }) => (
                                        <CIMSCommonSelect
                                            id={idConstant + '_site'}
                                            label="Site English Name"
                                            options={this.props.isStatReportCrossSiteRight() ? this.state.sites : this.state.sites.filter(x => x.value == this.props.siteId)}
                                            value={field.value}
                                            labelProps={{
                                                classes: {
                                                    root: classes.selectRoot,
                                                    shrink: classes.shrink
                                                }
                                            }}
                                            outlinedProps={{
                                                className: classes.selectOptionScrollBar
                                            }}
                                            inputProps={{
                                                isMulti: true,
                                                hideSelectedOptions: false,
                                                closeMenuOnSelect: false,
                                                selectAll: this.props.isStatReportCrossSiteRight() ? '[ Select All ]' : null,
                                                isDisabled: !this.props.isStatReportCrossSiteRight(),
                                                sortFunc: sortFunc,
                                                filterOption: {
                                                    matchFrom: 'start'
                                                },
                                                innerRef: this.setRefSiteSelect
                                            }}
                                            onBlur={() => form.setFieldTouched(field.name, true)}
                                            onChange={(value, params) => {
                                                form.setFieldValue(field.name, value);
                                            }}
                                        />
                                    )}
                                    </Field>
                                    <ErrorMessage name="site" component="div" className={classes.error} />
                                </Grid>

                                <Grid item xs={6} className={classes.gridRow}
                                    onMouseDown={(e) =>this.handleMouseDownCapture(e, this.refDescSelect)}
                                >
                                    <Field name="reportDesc">
                                    {({ field, form, meta }) => (
                                        <CIMSCommonSelect
                                            id={idConstant + '_reportDesc'}
                                            label="Description"
                                            options={this.state.reportDesc}
                                            value={field.value}
                                            labelProps={{
                                                classes: {
                                                    root: classes.selectRoot,
                                                    shrink: classes.shrink
                                                }
                                            }}
                                            outlinedProps={{
                                                className: classes.selectOptionScrollBar
                                            }}
                                            inputProps={{
                                                isMulti: true,
                                                hideSelectedOptions: false,
                                                closeMenuOnSelect: false,
                                                selectAll: '[ Select All ]',
                                                sortFunc: sortFunc,
                                                filterOption: {
                                                    matchFrom: 'start'
                                                },
                                                innerRef: this.setRefDescSelect
                                            }}
                                            onBlur={() => form.setFieldTouched(field.name, true)}
                                            onChange={(value, params) => {
                                                form.setFieldValue(field.name, value);
                                            }}
                                        />
                                    )}
                                    </Field>
                                    <ErrorMessage name="reportDesc" component="div" className={classes.error} />
                                </Grid>

                                <Grid item xs={6} className={classes.gridRow}
                                    onMouseDown={(e) =>this.handleMouseDownCapture(e, this.refNameSelect)}
                                >
                                    <Field name="reportName">
                                    {({ field, form, meta }) => (
                                        <CIMSCommonSelect
                                            id={idConstant + '_reportName'}
                                            label="Report Template Name"
                                            options={this.state.reportName}
                                            value={field.value}
                                            labelProps={{
                                                classes: {
                                                    root: classes.selectRoot,
                                                    shrink: classes.shrink
                                                }
                                            }}
                                            outlinedProps={{
                                                className: classes.selectOptionScrollBar
                                            }}
                                            inputProps={{
                                                isMulti: true,
                                                hideSelectedOptions: false,
                                                closeMenuOnSelect: false,
                                                selectAll: '[ Select All ]',
                                                sortFunc: sortFunc,
                                                filterOption: {
                                                    matchFrom: 'any'
                                                },
                                                innerRef: this.setRefNameSelect
                                            }}
                                            onBlur={() => form.setFieldTouched(field.name, true)}
                                            onChange={(value, params) => {
                                                form.setFieldValue(field.name, value);
                                            }}
                                        />
                                    )}
                                    </Field>
                                    <ErrorMessage name="reportName" component="div" className={classes.error} />
                                </Grid>

                                <Grid item xs={6} className={classes.gridRow}
                                    onMouseDown={(e) =>this.handleMouseDownCapture(e, this.refStatusSelect)}
                                >
                                    <Field name="reportStatus">
                                    {({ field, form, meta }) => (
                                        <CIMSCommonSelect
                                            id={idConstant + '_reportStatus'}
                                            label="Report Status"
                                            options={this.state.reportStatus}
                                            value={field.value}
                                            labelProps={{
                                                classes: {
                                                    root: classes.selectRoot,
                                                    shrink: classes.shrink
                                                }
                                            }}
                                            outlinedProps={{
                                                className: classes.selectOptionScrollBar
                                            }}
                                            inputProps={{
                                                isMulti: true,
                                                hideSelectedOptions: false,
                                                closeMenuOnSelect: false,
                                                selectAll: '[ Select All ]',
                                                sortFunc: sortFunc,
                                                filterOption: {
                                                    matchFrom: 'start'
                                                },
                                                innerRef: this.setRefStatusSelect
                                            }}
                                            onBlur={() => form.setFieldTouched(field.name, true)}
                                            onChange={(value, params) => {
                                                form.setFieldValue(field.name, value);
                                            }}
                                        />
                                    )}
                                    </Field>
                                    <ErrorMessage name="reportStatus" component="div" className={classes.error} />
                                </Grid>

                        {
                                //<Grid item xs={6} className={classes.gridRow}>
                                    //<Field name="user">
                                    //{({ field, form, meta }) => (
                                        //<CIMSCommonSelect
                                            //id={idConstant + '_user'}
                                            //label="Users"
                                            //options={this.state.users}
                                            //value={field.value}
                                            //labelProps={{
                                                //classes: {
                                                    //root: classes.selectRoot,
                                                    //shrink: classes.shrink
                                                //}
                                            //}}
                                            //inputProps={{
                                                //isMulti: true,
                                                //hideSelectedOptions: false,
                                                //closeMenuOnSelect: false,
                                                ////selectAll: '[ Select All ]',
                                                //sortFunc: sortFunc,
                                                //filterOption: {
                                                    //matchFrom: 'start'
                                                //}
                                            //}}
                                            //onBlur={() => form.setFieldTouched(field.name, true)}
                                            //onChange={(value, params) => {
                                                //form.setFieldValue(field.name, value);
                                            //}}
                                        ///>
                                    //)}
                                    //</Field>
                                    //<ErrorMessage name="user" component="div" className={classes.error} />
                                //</Grid>

                        }

                                <Grid item xs={6} className={classes.gridRow}>
                                    <Field name="reportParameters">
                                    {({ field, form, meta }) => (
                                        <TextField
                                            {...field}
                                            id={idConstant + '_reportParameters_textField'}
                                            label="Report Parameters"
                                            margin="dense"
                                            variant="outlined"
                                            fullWidth
                                        />
                                    )}
                                    </Field>
                                    <ErrorMessage name="reportParameters" component="div" className={classes.error} />
                                </Grid>
                                <Grid item container xs={12}>
                                    <Grid item xs={1}>
                                        <Button type="submit" className={classes.actionButtonRoot} variant="contained" color="primary" disabled={props.isSubmitting} id={idConstant + '_save'}>Search</Button>
                                    </Grid>
                                    <Grid item xs={1}>
                                        <Button className={classes.actionButtonRoot} variant="contained" color="primary" onClick={()=>{
                                            this.resetForm();
                                            props.resetForm();

                                        }} id={idConstant + '_cancel'}
                                        >Reset</Button>
                                    </Grid>
                                    <Grid item xs={2}>
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
                                    </Grid>
                                    <Grid item xs={2}>
                                        <Button type="button" className={classes.actionButtonRoot} variant="contained" color="primary" disabled={!this.state.activeBatchDownload} id={idConstant + '_batch_download'}
                                            onClick={()=>{ this.batchDownload();}}
                                        >{this.state.BatchDownloadButtonString}</Button>
                                    </Grid>
                                </Grid>

                            </Grid>
                        </Form>
                    )}
                    </Formik>
                </MuiThemeProvider>
                <Grid className={classes.tableContainer}>
                    <CIMSDataGrid
                        ref={this.refGrid}
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '45vh',
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
                                if (len === 1) {
                                    this.setState({BatchDownloadButtonString: 'Download'});
                                } else {
                                    this.setState({BatchDownloadButtonString: 'Batch Download'});
                                }
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
            {/* {
                this.state.openWaringDialog &&
                <RestrictedDialog
                    id={'report_Waring_Dialog'}
                    open={this.state.openWaringDialog}
                    handleCloseDialog={() => {
                        this.setState({openWaringDialog: false, confirmFunction: null});
                    }}
                    handleConfirmDialog={this.handleConfirmDialog}
                />
            } */}
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
        reportJobList: state.reportTemplate.reportJobList,
        reportTemplateList: state.reportTemplate.reportTemplateList,
        openReportPreview: state.reportTemplate.openReportPreview,
        commonMessageDetail: state.message.commonMessageDetail,
        jobData:state.reportTemplate.jobData
    };
}

const mapDispatchToProps = {
    requestData,
    postData,
    updateField,
    openPreviewWindow,
    openCommonMessage,
    jobLogPolling
};

export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(withStyles(styles)(ReportHistory)));
