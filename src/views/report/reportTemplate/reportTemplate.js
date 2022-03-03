import React, { Component, useState } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import CIMSDialog from '../../../components/Dialog/CIMSDialog';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSInputLabel from '../../../components/InputLabel/CIMSInputLabel';
import CIMSFormLabel from '../../../components/InputLabel/CIMSFormLabel';
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
import TimeFieldValidator from '../../../components/FormValidator/TimeFieldValidator';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import ReactSelect from '../../../components/Select/ReactSelect';
import Enum from '../../../enums/enum';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import NewOldQuota from '../../compontent/newOldQuota';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';

import _ from 'lodash';
import moment from 'moment';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';

import { openCommonMessage } from '../../../store/actions/message/messageAction';
import CommonMessage from '../../../constants/commonMessage';
import CommonRegex from '../../../constants/commonRegex';
import ValidatorEnum from '../../../enums/validatorEnum';
//import CIMSPromptDialog from '../../../components/Dialog/CIMSPromptDialog';
import * as reportConstant from '../../../constants/report/reportConstant';
import * as messageUtilities from '../../../utilities/messageUtilities';
import * as listUtilities from '../../../utilities/listUtilities';
import CIMSCheckBox from '../../../components/CheckBox/CIMSCheckBox';
import NewOldQuotaPublic from '../../compontent/newOldQuotaPublic';
import * as CommonUtil from '../../../utilities/commonUtilities';

import { createMuiTheme } from '@material-ui/core';
import { MuiThemeProvider } from '@material-ui/core/styles';
import * as DateUtilities from '../../../utilities/dateUtilities';
import ReportHistory from './component/reportHistory/reportHistory';
import IndividualReportHistory from './component/reportHistory/IndividualReportHistory';
import ReportConfig from './component/reportConfig/reportConfig';
import ReportTemplateDialog from './reportTemplateDialog';
import {
    updateField,
    getDynamicFormParameterByApi,
    requestData
} from '../../../store/actions/report/reportTemplateAction';

const theme = createMuiTheme({});

const styles = theme => ({
    form: {
        marginLeft: '5rem',
        marginRight: '5rem',
        marginTop: '1rem'
    },
    navigationBtnBar: {
        height: '3rem'
    },
    linkButton: {
        fontWeight: 'bold',
        backgroundColor: '#bedcf1',
        borderRadius: '0.5rem',
        border: '1px solid black',
        color: 'black',
        marginRight: '1rem',
        '&:hover': {
            //backgroundColor:'#4299d4',
            backgroundColor: '#0579c8',
            color: 'white'
        }
    },
    linkButtonActive: {
        fontWeight: 'bold',
        //backgroundColor:'#4299d4',
        backgroundColor: '#0579c8',
        color: 'white',
        borderRadius: '0.5rem',
        border: '1px solid black',
        marginRight: '1rem',
        '&:hover': {
            //backgroundColor:'#0663a2',
            backgroundColor: '#075388',
            color: 'white'
        }
    },
    tableContainer: {
        marginLeft: '1rem',
        marginRight: '1rem',
        marginTop: '1rem'
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
    //dialogActions: {
    //justifyContent: 'flex-start'
    //},
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
        background: 'white'
    },
    error: {
        color: 'red',
        fontSize: '0.75rem'
    }
});

const sortFunc = (a, b) => a.label > b.label ? 1 : b.label > a.label ? -1 : 0;

class GridCellRenderer extends Component {
    constructor(props) {
        super(props);
        props.eParentOfValue.style.height = '100%';
        props.eParentOfValue.style.justifyContent = 'center';
        props.eParentOfValue.style.display = 'flex';
        props.eParentOfValue.style.alignItems = 'center';
    }

    handleCellEvent = (e, data) => {
        let rptTmplParamList = data && data.rptTmplParamList ? data.rptTmplParamList : [];
        let apiMaps = [];
        rptTmplParamList.forEach(
            function(rptTmplParam, index) {
                if (rptTmplParam.componentParams) {
                    apiMaps.push({
                        api: rptTmplParam.componentParams,
                        rptTmplParamId: rptTmplParam.rptTmplParamId
                    });
                }
            }
        );
        setTimeout(() => {
            this.props.updateField({
                dialogTemplateOpen: true,
                selectedTemplate: data
            });
        }, 100);
        e.preventDefault();
        setTimeout(() => {
            apiMaps.forEach(apiMap =>
                this.props.getDynamicFormParameterByApi(
                    'dynamicFormByTemplate',
                    {
                        rptTmplParamId: apiMap.rptTmplParamId,
                        api: apiMap.api
                    }
                )
            );
        }, 0);
    }

    render() {
        const { data } = this.props;
        return (<>
            {
                //data && data.enableInstantGen === 'Y' ?
                <Button
                    id={data.reportId}
                    onClick={(e) => { this.handleCellEvent(e, data); }}
                    variant="contained"
                    color="primary"
                > generate
                </Button>
                //:<span>No</span>
            }
        </>
        );
    }
}

class BatchJobCellRenderer extends Component {
    constructor(props) {
        super(props);
        props.eParentOfValue.style.height = '100%';
        props.eParentOfValue.style.justifyContent = 'center';
        props.eParentOfValue.style.display = 'flex';
        props.eParentOfValue.style.alignItems = 'center';
    }

    navigateToReportConfig = (prefill) => {
        this.props.updateField({ activePageMode: 'config', dialogConfigOpen: true, dialogConfigAction: 'create', selectedReportConfigId: 0, prefillReportConfig: prefill });
    }

    handleCellEvent = (e, data) => {
        e.preventDefault();
        //this.props.updateField({ dialogTemplateOpen: true , selectedTemplate: data});
        let prefillReportConfig = {
            reportId: data && data.reportId
        };
        this.navigateToReportConfig(prefillReportConfig);
    }

    render() {
        const { data } = this.props;
        return (
            <Button
                id={data.reportId}
                onClick={(e) => this.handleCellEvent(e, data)}
                variant="contained"
                color="primary"
            > Select
            </Button>
        );
    }
}

class ReportTemplate extends Component {
    constructor(props) {
        super(props);
        let columnDefs = [];
        let colDefs = [
            {
                headerName: 'No. ', colId: 'no', width: 80, maxWidth: 120,
                valueGetter: params => params.node.rowIndex + 1
            },
            //{headerName:"report id",field:"reportId", width:300, maxWidth:400},
            { headerName: 'Report Template Name', field: 'reportName', width: 300, maxWidth: 400 },
            { headerName: 'Description', field: 'reportDesc', width: 800 },
            {
                headerName: 'Type', field: 'periodType', width: 200,
                valueFormatter: (param) => {
                    let r = reportConstant.PERIOD_TYPE_CODE.find(x => x.code === param.value);
                    return r ? r.cycle : '';
                }
            },

            {
                headerName: 'Adhoc Generate', colId: 'enableInstantGen', width: 200, minWidth: 140, maxWidth: 150, cellRenderer: 'gridCellRenderer',
                cellRendererParams: {
                    getDynamicFormParameterByApi: props.getDynamicFormParameterByApi,
                    updateField: props.updateField,
                    requestData: props.requestData
                }
            }
        ];
        if (this.isStatReportCronJobRight()) {
            colDefs.push(
                {
                    headerName: 'Batch job', colId: 'batchJob', width: 160, minWidth: 140, maxWidth: 150, cellRenderer: 'batchJobCellRenderer',
                    cellRendererParams: {
                        // TODO :. BATCH JOB SET DynamicForm
                        updateField: props.updateField,
                        requestData: props.requestData
                    }
                }
            );
        }
        for (let i = 0; i < colDefs.length; i++) {
            let { colId, field, width } = colDefs[i];
            let col = {
                ...colDefs[i],
                cellStyle: { whiteSpace: 'pre-line' },
                resizable: true,
                maxWidth: width,
                minWidth: width,
                filter: true,
                sortable: true
            };
            switch (field) {
                default:
                    switch (colId) {
                        case 'generate':
                            col = {
                                ...col,
                                sortable: false
                            };
                            break;
                    }
                    break;
            }
            colDefs[i] = col;
        }

        columnDefs = columnDefs.concat(colDefs);
        this.state = {
            fontsLoaded: false,
            serviceCd: '',
            rowData: [],
            activePageMode: 'template',
            columnDefs: columnDefs,
            rptHistoryInitSearch: false,
            rptHistoryPrefillData: {
                startDate: moment(),
                endDate: moment()
            }
        };
        this.refGrid = React.createRef();
    }

    UNSAFE_componentWillMount() {

    }

    componentDidMount() {
        if (document.fonts) {
            document.fonts.ready
                .then(() => {
                    this.setFontsLoaded(true);
                });
        }
        this.getUsers();
        this.getReportTemplateList();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.reportTemplateList !== this.props.reportTemplateList) {
            let reportTemplateList = this.props.reportTemplateList;
            this.setState({ rowData: reportTemplateList });
        }
    }

    setFontsLoaded(complete) {
        this.setState({ fontsLoaded: complete });
    }

    setRptTemplateState = (s) => {
        this.setState(s);
    }
    rptHistoryPrefill = () => {
        this.setState({
            rptHistoryPrefillData: {
                startDate: moment(),
                endDate: moment()
            },
            rptHistoryInitSearch: true
        });
    }

    resetRptHistoryPrefill = () => {
        this.setState({
            rptHistoryPrefillData: {
                startDate: null,
                endDate: null
            }
        });
    }

    isStatReportCronJobRight = () => {
        let predicate = this.props.accessRights && this.props.accessRights.filter(x => x.name === reportConstant.RPT_COD_ACCESS_RIGHT.STAT_REPORT_CRON_JOB_COD);
        return predicate.length > 0;
    }

    isStatReportCrossSiteRight = () => {
        let predicate = this.props.accessRights && this.props.accessRights.filter(x => x.name === reportConstant.RPT_COD_ACCESS_RIGHT.STAT_REPORT_SVC_SITES_COD);
        return predicate.length > 0;
    }

    isStatReportSvcUsersRight = () => {
        let predicate = this.props.accessRights && this.props.accessRights.filter(x => x.name === reportConstant.RPT_COD_ACCESS_RIGHT.STAT_REPORT_SVC_USERS_COD);
        return predicate.length > 0;
    }

    isStatReportSiteUsersRight = () => {
        let predicate = this.props.accessRights && this.props.accessRights.filter(x => x.name === reportConstant.RPT_COD_ACCESS_RIGHT.STAT_REPORT_SITE_USERS_COD);
        return predicate.length > 0;
    }

    isStatReportInstantGenRight = () => {
        let predicate = this.props.accessRights && this.props.accessRights.filter(x => x.name === reportConstant.RPT_COD_ACCESS_RIGHT.STAT_REPORT_INSTANT_GEN_COD);
        return predicate.length > 0;
    }

    getReportTemplateList = () => {
        this.props.requestData('reportTemplateList', { svcCd: this.props.serviceCd });
    }

    getUsers = () => {
        const isSvcUser = this.isStatReportSvcUsersRight();
        const isSiteUser = this.isStatReportSiteUsersRight();
        let requestObj = {
            statuses: '!D',
            isNeedMap: 'Y'
        };
        if (isSvcUser) {
            requestObj.svcCds = [this.props.serviceCd];
            this.props.requestData('userByService', requestObj);
        } else if (isSiteUser) {
            requestObj.svcCds = [this.props.serviceCd];
            requestObj.siteIds = [this.props.siteId];
            this.props.requestData('userByService', requestObj);
        } else {
            this.props.updateField({ users: [this.props.userDto] });
        }
    }

    handleActivePageModeChange = (mode) => {
        this.props.updateField({ activePageMode: mode });
    }

    render() {
        const { activePageMode, classes, dialogTemplateOpen, selectedItems, reportData, openReportPreview } = this.props;
        const idConstant = 'report_history';
        return (
            <>
                <MuiThemeProvider theme={theme}>
                    <Grid className={classes.form}>
                        <Grid container spacing={0}>
                            <Grid item xs={6} className={classes.navigationBtnBar}>
                                <Button
                                    id={idConstant + '_report_template'}
                                    variant="contained"
                                    color="primary"
                                    className={activePageMode === 'template' ? classes.linkButtonActive : classes.linkButton}
                                    onClick={() => this.handleActivePageModeChange('template')}
                                >Report Template
                                </Button>
                                <Button
                                    id={idConstant + '_view_report_history'}
                                    variant="contained"
                                    color="primary"
                                    className={activePageMode === 'history' ? classes.linkButtonActive : classes.linkButton}
                                    onClick={() => this.handleActivePageModeChange('history')}
                                >View Report History
                                </Button>
                                {
                                    !this.isStatReportCronJobRight() ? null :
                                        <Button
                                            id={idConstant + '_report_config'}
                                            variant="contained"
                                            color="primary"
                                            className={activePageMode === 'config' ? classes.linkButtonActive : classes.linkButton}
                                            onClick={() => this.handleActivePageModeChange('config')}
                                        >Report Config
                                        </Button>
                                }
                                {/* <Button
                                    id={idConstant + '_view_individual_report'}
                                    variant="contained"
                                    color="primary"
                                    className={activePageMode === 'individual' ? classes.linkButtonActive : classes.linkButton}
                                    onClick={() => this.handleActivePageModeChange('individual')}
                                >View Individual Report
                                </Button> */}
                            </Grid>
                        </Grid>
                    </Grid>
                </MuiThemeProvider>
                <Grid className="pageContainer">
                    {
                        (() => {
                            switch (activePageMode) {
                                case 'template':
                                    return (
                                        <Grid className={classes.tableContainer}>
                                            <CIMSDataGrid
                                                ref={this.refGrid}
                                                gridTheme="ag-theme-balham"
                                                divStyle={{
                                                    width: '100%',
                                                    height: '58vh',
                                                    display: 'block'
                                                }}
                                                gridOptions={{
                                                    columnDefs: this.state.columnDefs,
                                                    rowData: this.state.rowData,
                                                    frameworkComponents: {
                                                        gridCellRenderer: GridCellRenderer,
                                                        batchJobCellRenderer: BatchJobCellRenderer
                                                    },
                                                    getRowNodeId: data => data.reportId,
                                                    getRowHeight: params => 55,
                                                    defaultColDef: { autoHeight: true },
                                                    postSort: rowNodes => {
                                                        let rowNode = rowNodes[0];
                                                        if (rowNode) {
                                                            setTimeout((rowNode) => {
                                                                rowNode.gridApi.refreshCells();
                                                            }, 100, rowNode);
                                                        }
                                                    }
                                                }}
                                                suppressGoToRow
                                                suppressDisplayTotal
                                            />
                                        </Grid>
                                    );
                                case 'instantGen':
                                    return <p>instant gen</p>;
                                case 'history':
                                    return (
                                        <ReportHistory
                                            rptHistoryPrefillData={this.state.rptHistoryPrefillData}
                                            rptHistoryInitSearch={this.state.rptHistoryInitSearch}
                                            setRptTemplateState={this.setRptTemplateState}
                                            isStatReportCrossSiteRight={this.isStatReportCrossSiteRight}
                                        />
                                    );
                                case 'config':
                                    return (
                                        <ReportConfig
                                            isStatReportSvcUsersRight={this.isStatReportSvcUsersRight}
                                            isStatReportSiteUsersRight={this.isStatReportSiteUsersRight}
                                        />
                                    );
                                // case 'individual':
                                //     return <IndividualReportHistory />;
                                default:
                                    return null;
                            }
                        })()
                    }
                </Grid>
                <MuiThemeProvider theme={theme}>
                    {
                        this.props.dialogTemplateOpen ?
                            <>
                                <ReportTemplateDialog
                                    id={idConstant + '_reportTemplateDialog'}
                                    isStatReportCrossSiteRight={this.isStatReportCrossSiteRight}
                                    isStatReportInstantGenRight={this.isStatReportInstantGenRight}
                                    isStatReportSvcUsersRight={this.isStatReportSvcUsersRight}
                                    isStatReportSiteUsersRight={this.isStatReportSiteUsersRight}
                                    open={this.props.dialogTemplateOpen}
                                    rptHistoryPrefill={this.rptHistoryPrefill}
                                />
                            </>
                            : null
                    }
                </MuiThemeProvider>
            </>
        );
    }
}

function mapStateToProps(state) {
    return {
        dialogTemplateOpen: state.reportTemplate.dialogTemplateOpen,
        clinicList: state.common.clinicList,
        accessRights: state.login.accessRights,
        //uamMapUserRoleDtos: state.login.loginInfo.userDto.uamMapUserRoleDtos,
        userDto: state.login.loginInfo.userDto,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd,
        siteId: state.login.clinic.siteId,
        selectedReport: state.reportTemplate.selectedReport,
        reportData: state.reportTemplate.reportData,
        activePageMode: state.reportTemplate.activePageMode,
        reportTemplateList: state.reportTemplate.reportTemplateList,
        openReportPreview: state.reportTemplate.openReportPreview,
        commonMessageDetail: state.message.commonMessageDetail
    };
}

const mapDispatchToProps = {
    getDynamicFormParameterByApi,
    requestData,
    updateField,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withWidth()(withStyles(styles)(ReportTemplate)));
