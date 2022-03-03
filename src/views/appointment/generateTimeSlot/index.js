import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import memoize from 'memoize-one';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Done from '@material-ui/icons/Done';
import Close from '@material-ui/icons/Close';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import RequireIcon from '../../../components/InputLabel/RequiredIcon';
import DatePicker from '../../../components/FormValidator/DateFieldValidator';
import Select from '../../../components/FormValidator/SelectFieldValidator';
import Input from '../../../components/TextField/CIMSTextField';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import CIMSDataGrid from '../../../components/Grid/CIMSDataGrid';
import _ from 'lodash';
import {
    resetAll,
    updateState,
    generateTimeSlot,
    initPage,
    updateTemplateList
} from '../../../store/actions/appointment/generateTimeSlot';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import ValidatorEnum from '../../../enums/validatorEnum';
import AccessRightEnum from '../../../enums/accessRightEnum';
import CommonMessage from '../../../constants/commonMessage';
import { CommonUtil, EnctrAndRmUtil } from '../../../utilities';
import Enum from '../../../enums/enum';
import { auditAction } from '../../../store/actions/als/logAction';

const styles = () => ({
    button: {
        margin: '0px'
    }
});

class WeekRenderer extends Component {
    render() {
        const { value } = this.props;
        if (value) {
            return <Done />;
        } else {
            return <Close />;
        }
    }
}

// class HeaderCheckBoxRender extends React.Component {

//     isSelectedAll = () => {
//         const { api } = this.props;
//         if (api) {
//             const totalRowCount = api.getModel().getRowCount();
//             const selectedCount = api.getSelectedRows().length;
//             return totalRowCount !== 0 && totalRowCount === selectedCount ? true : false;
//         }
//         return false;
//     }

//     isIndeterminate = () => {
//         const { api } = this.props;
//         if (api) {
//             const totalRowCount = api.getModel().getRowCount();
//             const selectedCount = api.getSelectedRows().length;
//             return totalRowCount > selectedCount && selectedCount > 0 ? true : false;
//         }
//         return false;
//     }

//     render() {
//         const { id, rowIndex } = this.props;

//         return (
//             <Checkbox
//                 id={`${id}_${rowIndex}`}
//                 // checked={this.isSelectedAll()}
//                 indeterminate={this.isIndeterminate()}
//                 onChange={e => {
//                     if (e.target.checked) {
//                         this.props.api.selectAll();
//                     } else {
//                         this.props.api.deselectAll();
//                     }
//                 }}
//                 color="primary"
//             />
//         );
//     }
// }

// class CheckBoxRender extends React.Component {

//     render() {
//         const { id, rowIndex, node } = this.props;

//         return (
//             <Checkbox
//                 id={`${id}_${rowIndex}`}
//                 checked={node.selected}
//                 onChange={e => {
//                     node.setSelected(e.target.checked);
//                 }}
//                 color="primary"
//             />
//         );
//     }
// }

class GenerateTimeSlot extends Component {
    constructor(props) {
        super(props);

        let columnDefs = [
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
                headerName: '',
                field: 'checkbox',
                minWidth: 50,
                maxWidth: 50,
                headerCheckboxSelection: true,
                checkboxSelection: true
                // cellRendererFramework: CheckBoxRender,
                // headerComponentFramework: HeaderCheckBoxRender
            },
            {
                headerName: 'Template Name',
                field: 'tmsltTmplName',
                minWidth: 200,
                valueFormatter: this.getTmslTmpName
            },
            { headerName: 'Start Time', field: 'startTime', minWidth: 150 },
            { headerName: 'End Time', field: 'endTime', minWidth: 180 }
        ];

        const weekColDefs = this.getWeekdayColDefs();
        const qtColDefs = this.getQTColDefs();

        columnDefs.splice(5, 0, ...weekColDefs);
        columnDefs.splice(12, 0, ...qtColDefs);

        this.state = {
            columnDefs: columnDefs,
            lastRightDate: null

        };
        this.props.resetAll();
    }

    componentDidMount() {
        this.props.initPage();
        let dateRangeLimit = CommonUtil.initDateRnage(
            this.props.clinicConfig,
            this.props.serviceCd,
            this.props.siteId,
            Enum.CLINIC_CONFIGNAME.GEN_TMSLT_DATE_RANGE_LIMIT);
        if (dateRangeLimit) {
            this.props.updateState({ dateRangeLimit });
        }
        this.props.updateState({ fromDate: moment(), toDate:moment() });
    }

    getTmslTmpName = () => {
        const { selectedTempDto } = this.props;
        return selectedTempDto && selectedTempDto.tmsltTmplName;
    }

    getWeekdayColDefs = () => {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((item, index) => ({
            headerName: item,
            field: `wkd${index}`,
            colId: `wkd${index}`,
            width: 74,
            cellRenderer: 'weekRenderer'
        }));
    }

    getQTColDefs = () => {
        const { quotaConfig } = this.props;
        const quotaNames = CommonUtil.getQuotaConfigName(CommonUtil.getAvailableQuotaConfig(quotaConfig));
        let cols = quotaNames.map(item => ({
            headerName: item.name,
            field: _.toLower(item.field),
            colId: _.toLower(item.field),
            width: 110
        }));
        cols.unshift({
            headerName: 'Overall Quota',
            field: 'overallQt',
            colId: 'overallQt',
            width: 150
        });
        return cols;
    }

    handleOpenGenerateDialog = () => {
        this.props.auditAction('Click Generate Button', null, null, false, 'ana');
        const formValid = this.refs.generateFromRef.isFormValid(false);
        formValid.then(result => {
            if (result) {
                const { selectedTempDetails } = this.props;
                if (!selectedTempDetails || selectedTempDetails.length <= 0) {
                    this.props.openCommonMessage({ msgCode: '110804' });
                    return;
                }
                this.props.openCommonMessage({
                    msgCode: '110803',
                    params: [
                        { name: 'FROM_DATE', value: moment(this.props.fromDate).format(Enum.DATE_FORMAT_EDMY_VALUE) },
                        { name: 'TO_DATE', value: moment(this.props.toDate).format(Enum.DATE_FORMAT_EDMY_VALUE) }
                    ],
                    btnActions: {
                        btn1Click: this.handleGenerate,
                        btn2Click: () => {
                            this.props.auditAction('Cancel Generate Timeslot', null, null, false, 'ana');
                        }
                    }
                });
            }
        });
    }

    handleGenerate = () => {
        let idArr = this.props.selectedTempDetails.map(item => {
            return item.tmsltTmplId;
        });
        let params = {
            dateFrom: moment(this.props.fromDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            dateTo: moment(this.props.toDate).format(Enum.DATE_FORMAT_EYMD_VALUE),
            rmId: this.props.roomId,
            slotTemplateIds: idArr
        };
        this.props.auditAction('Confirm Generate Timeslot');
        this.props.generateTimeSlot(params);
    }

    templateNameOnChange = (value) => {
        const { slotTempList } = this.props;
        const selectedTempDto = slotTempList.find(item => item.tmsltTmplProfileId === value);
        this.props.updateState({ selectedTempDto });
        this.props.updateTemplateList();
        this.gridApi.deselectAll();
    }

    handleOnChange = (obj) => {
        this.props.updateState({
            ...obj
        });
    }

    onAcceptDate = (value, name) => {
        const { fromDate, toDate, dateRangeLimit } = this.props;
        let dateRange = {
            fromDate: moment(fromDate),
            toDate: moment(toDate)
        };
        dateRange[name] = value;
        if (moment(dateRange.fromDate).isValid() && moment(dateRange.toDate).isValid()) {
            if (name === 'fromDate' && CommonUtil.isFromDateAfter(moment(value), dateRange.toDate)) {
                this.props.updateState({ toDate: null });
            }
            else if (name === 'toDate' && CommonUtil.isToDateBefore(dateRange.fromDate, moment(value))) {
                this.props.updateState({ fromDate: null });
            } else {
                if (moment(dateRange.fromDate).isSameOrAfter(moment('1900-01-01'))) {
                    if (Math.ceil(moment(dateRange.toDate).diff(moment(dateRange.fromDate), 'day', true)) > dateRangeLimit) {
                        this.props.updateState({
                            [name]: moment(this.state.lastRightDate).format(Enum.DATE_FORMAT_EYMD_VALUE)
                        });
                        this.setState({ lastRightDate: null });
                        this.props.openCommonMessage({
                            msgCode: '111303',
                            params: [
                                { name: 'HEADER', value: CommonUtil.getMenuNameByCd(AccessRightEnum.generateTimeSlot) },
                                { name: 'DATERANGE', value: dateRangeLimit }
                            ]
                        });

                    }
                }
            }
        }

    };

    handleFocus = (value) => {
        if (value && moment(value).isValid()) {
            this.setState({ lastRightDate: moment(value).format(Enum.DATE_FORMAT_EYMD_VALUE) });
        }

    }

    handleDateOpen = (value) => {
        if (value && moment(value).isValid()) {
            this.setState({ lastRightDate: moment(value).format(Enum.DATE_FORMAT_EYMD_VALUE) });
        }
    }

    onSelectionChanged = (params) => {
        if (params) {
            let selectedRows = params.api.getSelectedRows();
            this.props.updateState({
                selectedTempDetails: selectedRows
            });
            // params.api.refreshCells({ columns: ['checkbox'], force: true });
        }
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    getFilterRooms = memoize((rooms, siteId) => {
        return rooms && rooms.filter(item => (item.siteId === siteId || !item.siteId) && EnctrAndRmUtil.isActiveRoom(item));
    })

    render() {
        const {
            classes,
            slotTempList,
            selectedTempDto,
            clinicList,
            rooms,
            roomId,
            siteId,
            fromDate,
            toDate
        } = this.props;
        const { columnDefs } = this.state;

        const filterRooms = this.getFilterRooms(rooms, siteId);
        return (
            <Grid>
                <ValidatorForm
                    ref="generateFromRef"
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={4}>
                            <Select
                                id="generate_timeslot_tmpName"
                                options={slotTempList.map(item => ({
                                    value: item.tmsltTmplProfileId, label: item.tmsltTmplName
                                }))}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Template Name<RequireIcon /></>
                                }}
                                value={selectedTempDto.tmsltTmplProfileId}
                                onChange={e => this.templateNameOnChange(e.value)}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                absoluteMessage
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <Input
                                id="generate_timeslot_tmpDesc"
                                label="Template Description"
                                variant="outlined"
                                value={selectedTempDto.tmsltTmplDesc}
                                disabled
                            />
                        </Grid>
                        <Grid item xs={3}></Grid>
                        <Grid item xs={4}>
                            <Select
                                id="generate_timeslot_clinic"
                                options={clinicList.map(item => ({
                                    value: item.siteId, label: item.siteName
                                }))}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Clinic<RequireIcon /></>
                                }}
                                value={selectedTempDto.siteId}
                                isDisabled
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                absoluteMessage
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <Select
                                id="generate_timeslot_room"
                                options={filterRooms.map(item => ({
                                    value: item.rmId, label: item.rmDesc
                                }))}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Room<RequireIcon /></>
                                }}
                                sortBy="label"
                                value={roomId}
                                onChange={e => this.handleOnChange({ roomId: e.value })}
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                absoluteMessage
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <DatePicker
                                id="generate_timeslot_fromDtm"
                                isRequired
                                // disablePast
                                absoluteMessage
                                label={<>From Date<RequireIcon /></>}
                                value={fromDate}
                                onChange={e => this.handleOnChange({ fromDate: e })}
                                onBlur={e => this.onAcceptDate(e, 'fromDate')}
                                onAccept={e => this.onAcceptDate(e, 'fromDate')}
                                onFocus={this.handleFocus}
                                onOpen={() => this.handleDateOpen(fromDate)}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <DatePicker
                                id="generate_timeslot_toDtm"
                                isRequired
                                // disablePast
                                absoluteMessage
                                label={<>To Date<RequireIcon /></>}
                                value={toDate}
                                onChange={e => this.handleOnChange({ toDate: e })}
                                onBlur={e => this.onAcceptDate(e, 'toDate')}
                                onAccept={e => this.onAcceptDate(e, 'toDate')}
                                onFocus={this.handleFocus}
                                onOpen={() => this.handleDateOpen(toDate)}
                            />
                        </Grid>
                        <Grid item container xs={1} justify="flex-end">
                            <CIMSButton
                                id="generate_timeslot_genBtn"
                                className={classes.button}
                                onClick={this.handleOpenGenerateDialog}
                                onKeyDown={e => {
                                    if (e.keyCode !== 9) {
                                        return;
                                    }
                                    e.preventDefault();
                                    this.gridApi.ensureIndexVisible(0);
                                    let checkCol = this.gridColumnApi.getAllDisplayedColumns()[1];
                                    this.gridApi.ensureColumnVisible(checkCol);
                                    this.gridApi.setFocusedCell(0, checkCol);
                                }}
                            >Generate</CIMSButton>
                        </Grid>
                    </Grid>
                </ValidatorForm>
                <CIMSDataGrid
                    disableAutoSize
                    gridTheme="ag-theme-balham"
                    divStyle={{
                        width: '100%',
                        height: '70vh',
                        display: 'block',
                        marginTop: 12
                    }}
                    gridOptions={{
                        headerHeight: 50,
                        columnDefs: columnDefs,
                        rowData: selectedTempDto.tmsltTmplList,
                        suppressRowClickSelection: false,
                        onGridReady: this.onGridReady,
                        getRowHeight: () => 50,
                        getRowNodeId: data => data.tmsltTmplId,
                        onSelectionChanged: this.onSelectionChanged,
                        frameworkComponents: {
                            weekRenderer: WeekRenderer
                        },
                        onCellKeyPress: (params) => {
                            if (params && params.event.which === 13) {
                                params.node && params.node.setSelected(true);
                            }
                        },
                        tabToNextCell: (params) => {
                            if (params.nextCellPosition) {
                                let nextRowIndex = params.nextCellPosition.rowIndex;
                                nextRowIndex = params.backwards ? nextRowIndex - 1 : nextRowIndex + 1;
                                if (nextRowIndex < 0) {
                                    nextRowIndex = 0;
                                }
                                let checkCol = this.gridColumnApi.getAllDisplayedColumns()[1];
                                let result = {
                                    rowIndex: nextRowIndex,
                                    column: checkCol
                                };
                                const totalRowCount = this.gridApi.getModel().getRowCount();
                                if (nextRowIndex > totalRowCount) {
                                    return null;
                                } else {
                                    return result;
                                }
                            } else {
                                return null;
                            }
                        },
                        suppressCellSelection: false,
                        postSort: rowNodes => CommonUtil.forceRefreshCells(rowNodes, ['index'])
                    }}
                />
            </Grid>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        fromDate: state.generateTimeSlot.fromDate,
        toDate: state.generateTimeSlot.toDate,
        selectedTempDto: state.generateTimeSlot.selectedTempDto || {},
        roomId: state.generateTimeSlot.roomId,
        slotTempList: state.generateTimeSlot.slotTempList || {},
        selectedTempDetails: state.generateTimeSlot.selectedTempDetails,
        clinicConfig: state.common.clinicConfig,
        siteId: state.login.clinic.siteId,
        quotaConfig: state.common.quotaConfig,
        clinicList: state.common.clinicList || [],
        rooms: state.common.rooms || [],
        dateRangeLimit: state.generateTimeSlot.dateRangeLimit || 365,
        serviceCd: state.login.service.serviceCd
    };
};

const mapDispatchToProps = {
    resetAll,
    updateState,
    generateTimeSlot,
    updateTemplateList,
    openCommonMessage,
    initPage,
    auditAction
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(GenerateTimeSlot));
