import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { CommonUtil, DateUtil, PatientUtil } from '../../utilities';
import CIMSButton from '../../components/Buttons/CIMSButton';
import { Grid } from '@material-ui/core';
import CIMSDataGrid from '../../components/Grid/CIMSDataGrid';
import { auditAction } from '../../store/actions/als/logAction';
import { openCommonMessage } from '../../store/actions/message/messageAction';
import {
    getDefaulterTracingList,
    getSppTeam
} from '../../store/actions/defaulterTracing';
import moment from 'moment';
import _ from 'lodash';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import FastDatePicker from '../../components/DatePicker/FastDatePicker';
import DateFieldValidator from '../../components/FormValidator/DateFieldValidator';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import Enum, { DEFAULTER_TRACING_RANGE } from '../../enums/enum';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import RadioFieldValidator from '../../components/FormValidator/RadioFieldValidator';
import CnctHistoryDialog from './component/cnctHistoryDialog';

class DefaulterTracing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            defaulterTracingList: [],
            teamList: [],
            searchForm: {
                searchDate: moment(),
                range: 3,
                team: '*All',
                mustCall: 'A'
            },
            selected: null,
            openCnctHistoryDialog: false
        };
    }

    componentDidMount() {
        this.init();
    }

    init = () => {
        this.props.getSppTeam((data) => {
            let teamList = data.spp_team;
            this.setState({ teamList: teamList, searchForm: { ...this.state.searchForm } }, () => {
                this.getDefaulterTracingList();
            });
        });
    }

    getDefaulterTracingList = () => {
        const { searchForm } = this.state;
        let params = {
            dtm: moment(searchForm.searchDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            isMustCall: searchForm.mustCall === 'A' ? null : searchForm.mustCall,
            range: searchForm.range,
            siteIds: [
                this.props.siteId
            ],
            team: searchForm.team === '*All' ? null : searchForm.team
        };
        this.props.getDefaulterTracingList(params, (data) => {
            this.setState({ defaulterTracingList: data });
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
                minWidth: 60,
                maxWidth: 60,
                pinned: 'left',
                filter: false
            },
            {
                headerName: 'PMI Number',
                field: 'patientKey',
                width: 135,
                valueGetter: params => {
                    return PatientUtil.getFormatDHPMINO(params.data.patientKey);
                }
            },
            {
                headerName: 'SMC Number',
                field: 'smcNum',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 154
            },
            {
                headerName: 'Name',
                field: 'engName',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 400
            },
            {
                headerName: 'Chinese Name',
                field: 'nameChi',
                tooltipField: undefined,
                tooltip: params => params.value,
                width: 155
            },
            {
                headerName: 'Tel',
                field: 'phoneNo',
                tooltipField: undefined,
                tooltip: params => {
                    return params.data.phoneNo ? CommonUtil.getFormatPhone(this.props.countryList, { dialingCd: params.data.dialingCd, areaCd: params.data.areaCd, phoneNo: params.data.phoneNo }) : '';
                },
                valueGetter: params => {
                    return params.data.phoneNo ? CommonUtil.getFormatPhone(this.props.countryList, { dialingCd: params.data.dialingCd, areaCd: params.data.areaCd, phoneNo: params.data.phoneNo }) : '';
                },
                width: 190
            },
            {
                headerName: 'Last SMC Date',
                field: 'lastSmcDate',
                tooltipField: undefined,
                tooltip: params => {
                    if (params.data.lastSmcDate) {
                        return moment(params.data.lastSmcDate).format(Enum.DATE_FORMAT_EDMY_VALUE);
                    } else {
                        return '';
                    }
                },
                comparator: DateUtil.dateComparator,
                valueGetter: params => {
                    if (params.data.lastSmcDate) {
                        return moment(params.data.lastSmcDate).format(Enum.DATE_FORMAT_EDMY_VALUE);
                    } else {
                        return '';
                    }
                },
                width: 160
            },
            {
                headerName: 'Last Appt Date',
                field: 'lastApptDate',
                tooltipField: undefined,
                tooltip: params => {
                    if (params.data.lastApptDate) {
                        return moment(params.data.lastApptDate).format(Enum.DATE_FORMAT_EDMY_VALUE);
                    } else {
                        return '';
                    }
                },
                comparator: DateUtil.dateComparator,
                valueGetter: params => {
                    if (params.data.lastApptDate) {
                        return moment(params.data.lastApptDate).format(Enum.DATE_FORMAT_EDMY_VALUE);
                    } else {
                        return '';
                    }
                },
                width: 160
            },
            {
                headerName: 'Team',
                field: 'team',
                width: 115,
                tooltipField: undefined,
                tooltip: params => params.value
            },
            {
                headerName: 'Number of Contact in 2 years',
                field: 'totalContactInPast2Year',
                width: 180,
                tooltipField: undefined,
                tooltip: params => params.value
            },
            {
                headerName: 'Must Call',
                field: 'isMustCall',
                width: 120,
                tooltipField: undefined,
                tooltip: params => params.value
            }
        ];
    }

    handleOnChange = (value, name) => {
        let { searchForm } = this.state;
        searchForm[name] = value;
        this.setState({ searchForm });
    }

    handleSearch = () => {
        this.props.auditAction('Click Search button', null, null, false, 'patient');
        let searchFormValid = this.searchFormRef.isFormValid(false);
        searchFormValid.then(result => {
            if (result) {
                this.getDefaulterTracingList();

            } else {
                this.searchFormRef.focusFail();
            }
        });
    }

    shouldDisableDate = (date) => {
        return moment(date).isAfter(moment(), 'days');
    };


    handleOpenViewCnctHistoryDialog = (openCnctHistoryDialog) => {
        this.setState({openCnctHistoryDialog});
    }

    handleViewCnctHistory = () => {
        this.handleOpenViewCnctHistoryDialog(true);
    }


    render() {
        const columnDefs = this.getColumn();
        const { classes } = this.props;
        const { defaulterTracingList, teamList, searchForm, selected ,openCnctHistoryDialog} = this.state;
        const rowData = this.setRowId(defaulterTracingList);

        return (
            <Grid container className={classes.root}>
                <ValidatorForm ref={r => this.searchFormRef = r} style={{ width: '100%' }}>
                    <Grid container className={classes.searchFormContainer}>
                        <Grid item container xs={9} alignItems="center" spacing={2}>
                            <Grid item container xs={3}>
                                <Grid item xs={4} style={{ margin: 'auto 0px' }}><>Search Date:<RequiredIcon /></></Grid>
                                <Grid item xs={6}>
                                    <FastDatePicker
                                        id={'defaulterTracing_searchDate'}
                                        component={DateFieldValidator}
                                        value={searchForm.searchDate}
                                        isRequired
                                        onChange={value => this.handleOnChange(value, 'searchDate')}
                                        onBlur={value => this.handleOnChange(value, 'searchDate')}
                                        onAccept={value => this.handleOnChange(value, 'searchDate')}
                                        shouldDisableDate={this.shouldDisableDate}
                                        shouldDisableDateMessage={'The date cannot be later than today'}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        absoluteMessage
                                    />
                                </Grid>
                            </Grid>
                            <Grid item container xs={3}>
                                <Grid item xs={2} style={{ margin: 'auto 5px' }}>Range:</Grid>
                                <Grid item xs={5} style={{ marginLeft: '10px' }}>
                                    <SelectFieldValidator
                                        options={DEFAULTER_TRACING_RANGE}
                                        id={'defaulterTracing_range'}
                                        value={searchForm.range}
                                        onChange={e => this.handleOnChange(e.value, 'range')}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        absoluteMessage
                                    />
                                </Grid>
                                <Grid item xs={2} style={{ margin: 'auto 6px' }}>Months</Grid>
                            </Grid>
                            <Grid item container xs={2}>
                                <Grid item xs={3} style={{ margin: 'auto 0px' }}>Team:</Grid>
                                <Grid item xs={7} style={{ marginLeft: '10px' }}>
                                    <SelectFieldValidator
                                        options={teamList && teamList.map((item => (
                                            { value: item.code, label: item.engDesc }
                                        )))}
                                        id={'defaulterTracing_team'}
                                        value={searchForm.team}
                                        onChange={e => this.handleOnChange(e.value, 'team')}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        absoluteMessage
                                        addAllOption
                                    />
                                </Grid>
                            </Grid>
                            <Grid item container xs={4}>
                                <Grid item xs={2} style={{ margin: 'auto 0px' }}>Must Call:</Grid>
                                <Grid item xs={9} style={{ marginLeft: '10px' }}>
                                    <RadioFieldValidator
                                        id="defaulterTracing_mustCall"
                                        value={searchForm.mustCall}
                                        onChange={e => this.handleOnChange(e.target.value, 'mustCall')}
                                        list={[{ label: 'All', value: 'A' }, { label: 'Yes', value: 'Y' }, { label: 'No', value: 'N' }]}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        absoluteMessage
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item container xs={3} alignItems="center" justify="flex-end" >
                            <CIMSButton
                                id={'defaulterTracing_search'}
                                onClick={this.handleSearch}
                            >Search</CIMSButton>
                            <CIMSButton
                                id={'defaulterTracing_viewContactHistory'}
                                disabled={!selected}
                                onClick={this.handleViewCnctHistory}
                            >View Contact History</CIMSButton>
                        </Grid>
                    </Grid>
                </ValidatorForm>

                <Grid item container className={classes.gridStyle}>
                    <CIMSDataGrid
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '72vh',
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
                            getRowHeight: () => 50,
                            getRowNodeId: item => item.rowId.toString(),
                            onGridReady: this.onGridReady,
                            onSelectionChanged: this.onSelectionChanged,
                            postSort: rowNodes => CommonUtil.forceRefreshCells(rowNodes, ['index'])
                        }}
                    />
                </Grid>
                {
                    openCnctHistoryDialog ?
                        <CnctHistoryDialog
                            id={'defaulterTracing_contact_history_dialog'}
                            open={openCnctHistoryDialog}
                            dfltTraceRec={selected}
                            onClose={() => this.handleOpenViewCnctHistoryDialog(false)}
                        />
                        : null
                }
            </Grid >
        );
    }
}

const styles = ({
    root: {
        width: '100%',
        padding: '0px 28px 0px 28px'
    },
    searchFormContainer: {
        padding: '5px 0px 17px'
    }
});

const mapState = state => ({
    siteId: state.login.clinic.siteId,
    countryList: state.patient.countryList || []
});
const mapDispatch = {
    auditAction,
    openCommonMessage,
    getDefaulterTracingList,
    getSppTeam
};
export default connect(mapState, mapDispatch)(withStyles(styles)(DefaulterTracing));