import React from 'react';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import _ from 'lodash';
import moment from 'moment';
import Grid from '@material-ui/core/Grid';
import CheckBox from '@material-ui/core/Checkbox';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import CIMSDataGrid from '../../../../../components/Grid/CIMSDataGrid';
import TimePicker from '../../../../../components/FormValidator/TimeValidator';
import Input from '../../../../../components/FormValidator/TextValidator';
import AddRemoveButtons from '../../../../../components/Buttons/AddRemoveButtons';
import Enum from '../../../../../enums/enum';
import { updateState } from '../../../../../store/actions/appointment/timeslotTemplate/index';
import { StatusEnum } from '../../../../../enums/appointment/timeslot/timeslotTemplateEnum';
import * as AppointmentUtil from '../../../../../utilities/appointmentUtilities';
import * as CommonUtil from '../../../../../utilities/commonUtilities';
import CommonMessage from '../../../../../constants/commonMessage';
import {auditAction} from '../../../../../store/actions/als/logAction';

class TimeRender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value ? moment(this.props.value, 'HH:mm') : null
        };
    }

    componentDidMount() {
        this.timeRef.validateCurrent();
    }

    isValueChanged = (state_value, props_value) => {
        if (props_value && state_value) {
            const stateVal = moment(state_value, Enum.TIME_FORMAT_24_HOUR_CLOCK).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
            const propsVal = moment(props_value, Enum.TIME_FORMAT_24_HOUR_CLOCK).format(Enum.TIME_FORMAT_24_HOUR_CLOCK);
            return stateVal !== propsVal;
        } else {
            return !props_value && !state_value ? false : true;
        }
    }


    onChange = (e) => {
        this.setState({ value: e });
    }

    onBlur = () => {
        const { data } = this.props;
        const { value } = this.state;
        if (this.timeRef.isValidCurr()) {
            if (this.isValueChanged(value, this.props.value) && (!value || moment(value).isValid())) {
                this.props.onChange(value && moment(value).format(Enum.TIME_FORMAT_24_HOUR_CLOCK), data.rowId, data);
            }
        }
    }

    onAccept = (e) => {
        const { data } = this.props;
        if (this.isValueChanged(e, this.props.value)) {
            this.props.onChange(moment(e).format(Enum.TIME_FORMAT_24_HOUR_CLOCK), data.rowId, data);
        }
    }

    refresh = () => {
        this.timeRef && this.timeRef.hideMessage();
        return false;
    }

    sametimeValid = (value) => {
        const { data, id } = this.props;
        if (id === 'timeslot_template_detailList_startTime') {
            return !CommonUtil.isSameTime(moment(value), moment(data.endTime, 'HH:mm'));
        } else {
            return !CommonUtil.isSameTime(moment(data.startTime, 'HH:mm'), moment(value));
        }
    }

    render() {
        const { id, rowIndex, isDisabled } = this.props;
        const disabled = isDisabled && isDisabled();
        return (
            <Grid container>
                <TimePicker
                    id={`${id}_${rowIndex}`}
                    ref={ref => this.timeRef = ref}
                    inputVariant="outlined"
                    value={this.state.value}
                    onChange={this.onChange}
                    onBlur={this.onBlur}
                    onAccept={this.onAccept}
                    portalContainer={this.props.api.gridPanel.eCenterContainer}
                    disabled={disabled}
                    isRequired
                    validators={[this.sametimeValid]}
                    errorMessages={[CommonMessage.START_TIME_EARLIER()]}
                    // inputProps={{
                    //     tabIndex: rowIndex + 1
                    // }}
                />
            </Grid>
        );
    }
}

class CheckBoxRender extends React.Component {

    refresh = () => {
        return false;
    }

    render() {
        const { id, value, onChange, rowIndex, isDisabled, data } = this.props;
        const disabled = isDisabled && isDisabled();
        return (
            <CheckBox
                id={`${id}_${rowIndex}`}
                checked={value ? true : false}
                onChange={e => onChange(e.target.checked ? 1 : 0, data.rowId)}
                color="primary"
                disabled={disabled}
                // tabIndex={rowIndex + 1}
            />
        );
    }
}

class InputRender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value
        };
    }

    onChange = (e) => {
        this.setState({ value: e.target.value });
    }

    render() {
        const { id, onChange, rowIndex, isDisabled, data } = this.props;
        const disabled = isDisabled && isDisabled();
        return (
            <Input
                id={`${id}_${rowIndex}`}
                value={_.toString(this.state.value)}
                onChange={this.onChange}
                onBlur={e => onChange(e.target.value, data.rowId)}
                disabled={disabled}
                inputProps={{
                    maxLength: 4
                    // tabIndex: rowIndex + 1
                }}
                type="number"
            />
        );
    }
}

class ActionRender extends React.Component {
    render() {
        const { rowIndex, handleDelete, handleAdd, isDisabled, data } = this.props;
        const disabled = isDisabled && isDisabled();
        return (
            <AddRemoveButtons
                id={`timeslot_template_detailList_addRemove_${rowIndex}`}
                AddButtonProps={{
                    onClick: () => handleAdd(data.rowId),
                    disabled: disabled
                    // tabIndex: rowIndex + 1
                }}
                RemoveButtonProps={{
                    onClick: () => handleDelete(data.rowId),
                    disabled: disabled
                    // tabIndex: rowIndex + 1
                }}
            />
        );
    }
}

class DetailList extends React.Component {
    constructor(props) {
        super(props);

        let columnDefs = [
            {
                headerName: '',
                field: 'rowId',
                colId: 'rowId',
                valueFormatter: params => params.value + 1,
                minWidth: 50,
                maxWidth: 50,
                pinned: 'left',
                filter: false
            },
            {
                headerName: 'Start Time',
                field: 'startTime',
                colId: 'startTime',
                width: 150,
                cellRenderer: 'timeRender',
                cellRendererParams: {
                    id: 'timeslot_template_detailList_startTime',
                    onChange: (value, rowIndex, rowData) => {
                        const fm = Enum.TIME_FORMAT_24_HOUR_CLOCK;
                        if (rowData.endTime &&
                            moment(rowData.endTime, fm).isValid &&
                            moment(rowData.endTime, fm).isBefore(moment(value, fm))) {
                            this.handleOnChange({ startTime: value, endTime: null }, rowIndex);
                        } else {
                            this.handleOnChange({ startTime: value }, rowIndex);
                        }
                        this.refreshEndTimeCol();
                    },
                    isDisabled: this.getIsDisabled
                }
            },
            {
                headerName: 'End Time',
                field: 'endTime',
                colId: 'endTime',
                width: 150,
                cellRenderer: 'timeRender',
                cellRendererParams: {
                    id: 'timeslot_template_detailList_endTime',
                    onChange: (value, rowIndex, rowData) => {
                        const fm = Enum.TIME_FORMAT_24_HOUR_CLOCK;
                        if (rowData.startTime &&
                            moment(rowData.startTime, fm).isValid &&
                            moment(rowData.startTime, fm).isAfter(moment(value, fm))) {
                            this.handleOnChange({ startTime: null, endTime: value }, rowIndex);
                        } else {
                            this.handleOnChange({ endTime: value }, rowIndex);
                        }
                        this.refreshStartTimeCol();
                    },
                    isDisabled: this.getIsDisabled
                }
            },
            {
                headerName: 'Updated On',
                field: 'updateDtm',
                colId: 'updateDtm',
                width: 133,
                valueFormatter: params => params.value && moment(params.value).format(Enum.DATE_FORMAT_EDMY_VALUE)
            },
            {
                colId: 'action',
                width: 110,
                cellRenderer: 'actionRender',
                cellRendererParams: {
                    handleAdd: this.handleAddDetail,
                    handleDelete: this.handleDeleteDetail,
                    isDisabled: this.getIsDisabled
                }
            }
        ];

        const weekColDefs = this.getWeekdayColDefs();
        const qtColDefs = this.getQTColDefs();

        columnDefs.splice(3, 0, ...weekColDefs);
        columnDefs.splice(10, 0, ...qtColDefs);

        this.state = {
            columnDefs: columnDefs
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.status !== this.props.status) {
            if (this.gridColumnApi && this.gridApi) {
                const colIds = this.gridColumnApi.getAllDisplayedColumns().map(col => col.getColId());
                this.gridApi.refreshCells({ columns: colIds, force: true });
            }
        }
    }

    getIsDisabled = () => {
        return this.props.status === StatusEnum.VIEW;
    }

    getWeekdayColDefs = () => {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((item, index) => ({
            headerName: item,
            field: `wkd${index}`,
            colId: `wkd${index}`,
            width: 74,
            cellRenderer: 'checkBoxRender',
            cellRendererParams: {
                id: `timeslot_template_detailList_weekday_${index}`,
                onChange: (value, i) => {
                    this.handleOnChange({ [`wkd${index}`]: value }, i);
                },
                isDisabled: this.getIsDisabled
            }
        }));
    }

    getQTColDefs = () => {
        const { quotaConfig } = this.props;
        const quotaNames = CommonUtil.getQuotaConfigName(CommonUtil.getAvailableQuotaConfig(quotaConfig));
        let cols = quotaNames.map((item, index) => ({
            headerName: item.name,
            field: _.toLower(item.field),
            colId: _.toLower(item.field),
            width: 110,
            cellRenderer: 'inputRender',
            cellRendererParams: {
                id: `timeslot_template_detailList_quota_${_.toLower(item.field)}`,
                onChange: (value, index) => {
                    this.handleOnChange({ [_.toLower(item.field)]: value }, index);
                },
                isDisabled: this.getIsDisabled
            }
        }));
        cols.unshift({
            headerName: 'Overall Quota',
            field: 'overallQt',
            colId: 'overallQt',
            width: 148,
            cellRenderer: 'inputRender',
            cellRendererParams: {
                id: 'timeslot_template_detailList_quota_overAll',
                onChange: (value, index) => {
                    this.handleOnChange({ overallQt: value }, index);
                },
                isDisabled: this.getIsDisabled
            }
        });
        return cols;
    }

    handleOnChange = (object, index) => {
        let _tempDetailList = _.cloneDeep(this.props.templateDetailList);
        _tempDetailList[index] = { ..._tempDetailList[index], ...object };
        this.props.updateState({ templateDetailList: _tempDetailList });
        const rowNode = this.gridApi.getRowNode(index);
        for (let key in object) {
            rowNode.setDataValue(key, object[key]);
        }
    }

    handleAddDetail = (rowIndex) => {
        const { templateDetailList, loginUser } = this.props;
        let _templateDetailList = _.cloneDeep(templateDetailList);
        let newTemp = AppointmentUtil.getInitTmslTmp(loginUser);
        _templateDetailList.splice(rowIndex + 1, 0, newTemp);
        this.props.updateState({ templateDetailList: _templateDetailList });
        this.refreshActionColumn();
        this.refreshDateRow(rowIndex);
    }

    handleDeleteDetail = (rowIndex) => {
        const { templateDetailList, loginUser } = this.props;
        let _templateDetailList = _.cloneDeep(templateDetailList);
        _templateDetailList.splice(rowIndex, 1);
        if (_templateDetailList.length === 0) {
            _templateDetailList.push(AppointmentUtil.getInitTmslTmp(loginUser));
        }
        this.props.updateState({ templateDetailList: _templateDetailList });
        this.refreshActionColumn();
        this.refreshDateRow(rowIndex);
    }

    refreshStartTimeCol = () => {
        this.gridApi.refreshCells({ columns: ['startTime'], force: true });
    }

    refreshEndTimeCol = () => {
        this.gridApi.refreshCells({ columns: ['endTime'], force: true });
    }

    refreshActionColumn = () => {
        this.gridApi.refreshCells({ columns: ['action'], force: true });
    }

    refreshDateRow = (rowIndex) => {
        const rowNode = this.gridApi.getRowNode(rowIndex);
        this.gridApi.refreshCells({ rowNodes: [rowNode], force: true });
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridColumnApi = params.columnApi;
    }

    setRowId = (data) => {
        return data && data.map((item, index) => ({
            ...item,
            rowId: index
        }));
    }

    render() {
        const { classes, templateDetailList, status } = this.props;
        const { columnDefs } = this.state;
        const rowData = this.setRowId(templateDetailList);
        return (
            <Grid item container>
                <Grid item container>
                    <CIMSButton
                        id="timeslot_template_detail_batchCreateBtn"
                        className={classes.button}
                        children="Batch Create"
                        disabled={status !== StatusEnum.NEW}
                        onClick={() => {
                            this.props.auditAction('Click Batch Button',null,null,false,'ana');
                            this.props.updateState({
                                isOpenBatchCreate: true
                            });
                        }}
                    />
                </Grid>
                <Grid item container>
                    <CIMSDataGrid
                        disableAutoSize
                        gridTheme="ag-theme-balham"
                        divStyle={{
                            width: '100%',
                            height: '54vh',
                            display: 'block'
                        }}
                        gridOptions={{
                            columnDefs: columnDefs,
                            rowData: rowData,
                            rowSelection: 'single',
                            onGridReady: this.onGridReady,
                            getRowHeight: () => 50,
                            getRowNodeId: item => item.rowId.toString(),
                            frameworkComponents: {
                                actionRender: ActionRender,
                                timeRender: TimeRender,
                                checkBoxRender: CheckBoxRender,
                                inputRender: InputRender
                            },
                            tabToNextCell: (params) => {},
                            suppressKeyboardEvent: (params) => {
                                const KEY_ENTER = [37, 38, 39, 40];
                                const event = params.event;
                                const key = event.which;
                                const suppress = KEY_ENTER.includes(key);
                                return suppress;
                            },
                            rowBuffer: 9999,
                            suppressColumnVirtualisation: true,
                            ensureDomOrder: true
                        }}
                    />
                </Grid>
            </Grid>
        );
    }
}

const styles = theme => ({
    button: {
        margin: `${theme.spacing(2)}px 0px`
    }
});

const mapState = state => ({
    templateDetailList: state.timeslotTemplate.templateDetailList,
    loginUser: state.login.loginInfo,
    status: state.timeslotTemplate.status,
    quotaConfig: state.common.quotaConfig
});

const mapDispatch = {
    updateState,
    auditAction
};

export default connect(mapState, mapDispatch)(withStyles(styles)(DetailList));