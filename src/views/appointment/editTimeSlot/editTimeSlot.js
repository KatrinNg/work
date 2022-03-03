import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import {
    Grid,
    Typography
} from '@material-ui/core';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSTable from '../../../components/Table/CIMSTable';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import moment from 'moment';
import {
    resetAll,
    updateState,
    listTimeslot
} from '../../../store/actions/appointment/editTimeSlot/editTimeSlotAction';
import * as editTimeSlotActionType from '../../../store/actions/appointment/editTimeSlot/editTimeSlotActionType';
import { getEncounterTypeList } from '../../../store/actions/common/commonAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import EditTimeSlotDialog from './editTimeSlotDialog';
import CommonMessage from '../../../constants/commonMessage';
import ValidatorEnum from '../../../enums/validatorEnum';
import { CommonUtil, AppointmentUtil, MessageUtil, EnctrAndRmUtil } from '../../../utilities';
import Enum from '../../../enums/enum';

const styles = () => ({
    root: {
        width: '100%'
    },
    subTitle: {
        paddingLeft: '10px',
        wordBreak: 'break-all'
    },
    tablebutton: {
        width: '150px',
        margin: '0px',
        marginBottom: '5px'
    },
    mainButton: {
        width: '100%'
    },
    tableHeadRow: {
        height: '38px'
    },
    container: {
        padding: '10px 0px'
    }
});

class EditTimeSlot extends Component {
    constructor(props) {
        super(props);

        let customChild = this.customChild();

        this.state = {
            encounterTypeTips: '',
            subEncounterTypeTips: '',
            rows: [
                {
                    name: 'slotDate', label: 'Date', width: 120, customBodyRender: (value) => {
                        return value ? moment(value).format(Enum.DATE_FORMAT_EDMY_VALUE) : null;
                    }
                },
                { name: 'weekday', label: 'Weekday', width: 80 },
                { name: 'startTime', label: 'Start Time', width: 80 },
                { name: 'overallQuota', label: 'Overall Quota', width: 80 },
                {
                    name: 'quota', label: 'New-Quota-Sub', width: 380, child: customChild
                },
                {
                    name: 'booking', label: 'New-Booked-Sub', width: 380, child: customChild
                }
            ],
            options: {
                rowExpand: true,
                headRowStyle: this.props.classes.tableHeadRow,
                multiHead: true,
                rowsPerPage: this.props.pageSize,
                rowsPerPageOptions: [10, 15, 20],
                onSelectIdName: 'slotId',
                onSelectedRow: (rowId, rowData, selectedData) => {
                    this.selectTableItem(selectedData);
                }
            }
        };
    }


    componentDidMount() {
        this.props.ensureDidMount();
        const { clinicCd, serviceCd } = this.props;
        this.props.getEncounterTypeList({
            params: { clinicCd, serviceCd },
            actionType: editTimeSlotActionType.INIT_CODE_LIST
        });
        this.msg110236 = MessageUtil.getMessageDescriptionByMsgCode('110920');
        this.msg110225 = MessageUtil.getMessageDescriptionByMsgCode('110917');
        this.msg110226 = MessageUtil.getMessageDescriptionByMsgCode('110918');
        this.msg110227 = MessageUtil.getMessageDescriptionByMsgCode('110919');
        this.props.updateState({ dateFrom: moment(), dateTo: moment() });
    }

    UNSAFE_componentWillUpdate(nextProps, nextState) {
        if (nextProps.pageSize !== nextState.options.rowsPerPage) {
            let { options } = nextState;
            options.rowsPerPage = nextProps.pageSize;
            this.setState({ options });
            this.tableRef.updateRowsPerPage(nextProps.pageSize);
        }
        if (nextProps.subEncounterTypeCd !== this.props.subEncounterTypeCd ||
            JSON.stringify(nextProps.subEncounterCodeList) !== JSON.stringify(this.props.subEncounterCodeList)) {
            const subEncounterDo = nextProps.subEncounterCodeList.find(item => item.subEncounterTypeCd === nextProps.subEncounterTypeCd);
            this.setState({ subEncounterTypeTips: subEncounterDo ? subEncounterDo.shortName : '' });
        }
        if (nextProps.encounterTypeCd !== this.props.encounterTypeCd) {
            const encounterDo = nextProps.encounterCodeList.find(item => item.encounterTypeCd === nextProps.encounterTypeCd);
            this.setState({ encounterTypeTips: encounterDo ? encounterDo.shortName : '' });
        }
    }

    componentWillUnmount() {
        this.props.resetAll();

    }

    loadQuotaType=(where)=>{
        let newQuotaArr = AppointmentUtil.loadQuotaType(where, this.props.clinicConfig);
        return newQuotaArr;
    }

    customChild = () => {
        const where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        let newQuotaArr = this.loadQuotaType(where);
        let child = [];
        newQuotaArr.forEach((item) => {
            let newParams = { name: `new${item.engDesc}`, label: `New${item.engDesc}` };
            let oldParams = { name: `old${item.engDesc}`, label: `Old${item.engDesc}` };
            child.push(newParams);
            child.push(oldParams);
        });
        // let bookingChild = [];
        // newQuotaArr.forEach((item) => {
        //     let newParams = { name: `new${item.engDesc}Book`, label: `New${item.engDesc}` };
        //     let oldParams = { name: `old${item.engDesc}Book`, label: `Old${item.engDesc}` };
        //     bookingChild.push(newParams);
        //     bookingChild.push(oldParams);
        // });

        return child;
    }

    selectTableItem = (selected) => {
        let selectedItem = _.cloneDeep(selected || []);
        this.props.updateState({ selectedItems: selectedItem });
    }

    handleDateChange = (e, name) => {
        this.props.updateState({ [name]: e });
    }

    handleDateAcceptOrBlur = (e, name) => {
        let field = {
            dateFrom: this.props.dateFrom,
            dateTo: this.props.dateTo
        };
        field[name] = e;
        if (field.dateFrom && field.dateTo && moment(field.dateFrom).isValid() && moment(field.dateTo).isValid()) {
            if (name === 'dateFrom' && moment(field.dateTo).isBefore(moment(field.dateFrom))) {
                field.dateTo = field.dateFrom;
            }
            if (name === 'dateTo' && moment(field.dateFrom).isAfter(moment(field.dateTo))) {
                field.dateFrom = field.dateTo;
            }
            let params = this.getSearchParams();
            params.dateFrom = moment(field.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE);
            params.dateTo = moment(field.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE);
            this.listTimeSlotListByClearSelected(params, true);
        }
        this.props.updateState(field);
    }

    handleSelectChange = (e, name) => {
        if (e && name) {
            let params = this.getSearchParams();
            if (name === 'encounterTypeCd') {
                let subCodeList = EnctrAndRmUtil.get_subEncounterTypeList_by_encounterTypeCd(this.props.encounterCodeList, e.value);
                let subEncounter = subCodeList[0] ? subCodeList[0].subEncounterTypeCd : '';
                this.props.updateState({
                    subEncounterCodeList: subCodeList,
                    subEncounterTypeCd: subEncounter,
                    [name]: e.value
                });
                params.subEncounterTypeCd = subEncounter;
            } else {
                this.props.updateState({ [name]: e.value });
            }
            params[name] = e.value;
            this.listTimeSlotListByClearSelected(params, true);
        }
    }

    handleSearch = () => {
        let params = this.getSearchParams();
        this.listTimeSlotListByClearSelected(params, true);
    }

    handleMultiple = () => {
        this.props.updateState({ dialogOpen: true, dialogName: 'multiple' });
    }

    handleReset = () => {
        this.props.resetAll();
        this.clearTableSelected();
    }

    handleDelete = () => {
        if (this.props.selectedItems && this.props.selectedItems.length > 0) {
            const selected = this.props.selectedItems[0];
            if (moment(selected.slotDate).diff(moment(), 'days') < 0) {
                this.props.openCommonMessage({
                    msgCode: '110921'

                });
                return;
            }
            this.props.updateState({ dialogOpen: true, dialogName: 'delete' });
        } else {
            this.props.openCommonMessage({
                msgCode: '110911'

            });
        }
    }

    handleNew = () => {
        this.props.updateState({ dialogOpen: true, dialogName: 'add' });
    }

    handleEdit = () => {
        if (this.props.selectedItems && this.props.selectedItems.length > 0) {
            const selected = this.props.selectedItems[0];
            if (moment(selected.slotDate).diff(moment(), 'days') < 0) {
                this.props.openCommonMessage({
                    msgCode: '110922'

                });
                return;
            }
            this.props.updateState({ dialogOpen: true, dialogName: 'edit' });
        } else {
            this.props.openCommonMessage({
                msgCode: '110911'

            });
        }
    }

    handlePrint = () => {
    }

    //eslint-disable-next-line
    handleOnChangePage = (event, newPage, rowPerPage) => {
        this.props.updateState({ page: newPage + 1 });
        let params = this.getSearchParams();
        params.page = newPage + 1;
        this.listTimeSlotListByClearSelected(params);
    }

    handleOnChangeRowPerPage = (event, page, newRowPerPage) => {
        this.props.updateState({ pageSize: newRowPerPage, page: page + 1 });
        let params = this.getSearchParams();
        params.page = page + 1;
        params.pageSize = newRowPerPage;
        this.listTimeSlotListByClearSelected(params);
    }

    listTimeSlotListByClearSelected = (params, reset = false) => {
        if (reset) {
            this.tableRef.updatePage(0);
            params.page = 1;
            this.props.updateState({ page: 1 });
        }
        this.props.listTimeslot(params);
        this.clearTableSelected();
    }

    getSearchParams = () => {
        return {
            encounterTypeCd: this.props.encounterTypeCd,
            subEncounterTypeCd: this.props.subEncounterTypeCd,
            dateFrom: this.props.dateFrom ? moment(this.props.dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE) : moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
            dateTo: this.props.dateTo ? moment(this.props.dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE) : moment().format(Enum.DATE_FORMAT_EYMD_VALUE),
            page: this.props.page,
            pageSize: this.props.pageSize
        };
    }

    clearTableSelected = () => {
        this.tableRef.clearSelected();
        this.props.updateState({ selectedItems: [] });
    }

    render() {
        const { classes, timeslotList } = this.props;
        const id = this.props.id || 'editTimeSlot';
        return (
            <Grid className={classes.root}>
                <ValidatorForm ref="timeslotMaintanceForm" onSubmit={this.handleSearch}>
                    <Grid container className={classes.container}>
                        <Grid item container xs={10} spacing={2}>
                            <Grid item container xs={6}>
                                <Grid item container xs={6} alignContent="center">
                                    <SelectFieldValidator
                                        options={this.props.encounterCodeList && this.props.encounterCodeList.map((item) => ({ value: item.encounterTypeCd, label: item.encounterTypeCd, shortName: item.shortName }))}
                                        id={id + '_encounterType'}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: 'Encounter'
                                        }}
                                        value={this.props.encounterTypeCd}
                                        onChange={e => this.handleSelectChange(e, 'encounterTypeCd')}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        ref="encounterTypeRef"
                                    />
                                </Grid>
                                <Grid item container xs={6} alignContent="center">
                                    <Typography variant="subtitle1" color="textSecondary" className={classes.subTitle}>{this.state.encounterTypeTips}</Typography>
                                </Grid>
                            </Grid>
                            <Grid item container xs={6}>
                                <Grid item container xs={6} alignContent="center">
                                    <SelectFieldValidator
                                        options={this.props.subEncounterCodeList && this.props.subEncounterCodeList.map((item) => ({ value: item.subEncounterTypeCd, label: item.subEncounterTypeCd, shortName: item.shortName }))}
                                        id={id + '_subEncounterType'}
                                        TextFieldProps={{
                                            variant: 'outlined',
                                            label: 'Sub-encounter'
                                        }}
                                        value={this.props.subEncounterTypeCd}
                                        onChange={e => this.handleSelectChange(e, 'subEncounterTypeCd')}
                                        validators={[ValidatorEnum.required]}
                                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                        ref="subEncounterTypeRef"
                                    />
                                </Grid>
                                <Grid item container xs={6} alignContent="center">
                                    <Typography variant="subtitle1" color="textSecondary" className={classes.subTitle}>{this.state.subEncounterTypeTips}</Typography>
                                </Grid>
                            </Grid>
                            <Grid item container xs={6}>
                                <DateFieldValidator
                                    id={id + '_fromDate'}
                                    isRequired
                                    withRequiredValidator
                                    label="From Date"
                                    value={this.props.dateFrom}
                                    onChange={e => this.handleDateChange(e, 'dateFrom')}
                                    onBlur={e => this.handleDateAcceptOrBlur(e, 'dateFrom')}
                                    onAccept={e => this.handleDateAcceptOrBlur(e, 'dateFrom')}
                                />
                            </Grid>
                            <Grid item container xs={6}>
                                <DateFieldValidator
                                    id={id + '_toDate'}
                                    isRequired
                                    withRequiredValidator
                                    label="To Date"
                                    value={this.props.dateTo}
                                    onChange={e => this.handleDateChange(e, 'dateTo')}
                                    onBlur={e => this.handleDateAcceptOrBlur(e, 'dateTo')}
                                    onAccept={e => this.handleDateAcceptOrBlur(e, 'dateTo')}
                                />
                            </Grid>
                        </Grid>
                        <Grid item container xs={2} alignItems="center" spacing={2}>
                            <Grid item xs={6}>
                                <CIMSButton
                                    id={id + '_search'}
                                    className={classes.mainButton}
                                    type="submit"
                                >Search</CIMSButton>
                            </Grid>
                            <Grid item xs={6}>
                                <CIMSButton
                                    id={id + '_multipleUpdate'}
                                    className={classes.mainButton}
                                    onClick={this.handleMultiple}
                                >Multiple Update</CIMSButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </ValidatorForm>
                <Grid container>
                    <Grid container item justify="flex-end">
                        <CIMSButton
                            id={id + '_print'}
                            className={classes.tablebutton}
                            onClick={this.handlePrint}
                        >Print</CIMSButton>

                        <CIMSButton
                            id={id + '_edit'}
                            className={classes.tablebutton}
                            onClick={this.handleEdit}
                        >Edit</CIMSButton>

                        <CIMSButton
                            id={id + '_new'}
                            className={classes.tablebutton}
                            onClick={this.handleNew}
                        >New</CIMSButton>

                        <CIMSButton
                            id={id + '_delete'}
                            className={classes.tablebutton}
                            onClick={this.handleDelete}
                        >Delete</CIMSButton>

                        <CIMSButton
                            id={id + '_reset'}
                            className={classes.tablebutton}
                            onClick={this.handleReset}
                        >Reset</CIMSButton>
                    </Grid>
                    <Grid container>
                        <CIMSTable
                            innerRef={ref => this.tableRef = ref}
                            id={id + '_table'}
                            data={timeslotList ? timeslotList.slotDtos : null}
                            rows={this.state.rows}
                            options={this.state.options}
                            // tableStyles={{
                            //     height: 420
                            // }}
                            remote
                            totalCount={timeslotList ? timeslotList.totalNum : 0}
                            onChangePage={(...args) => this.handleOnChangePage(...args)}
                            onChangeRowsPerPage={(...args) => this.handleOnChangeRowPerPage(...args)}
                        />
                    </Grid>
                </Grid>
                {
                    this.props.dialogOpen && this.props.dialogName ?
                        <EditTimeSlotDialog
                            id={id + '_editDialog'}
                            open={this.props.dialogOpen}
                            action={this.props.dialogName}
                            clearSelect={this.clearTableSelected}
                            onEncounterChange={this.handleSelectChange}
                            loadQuotaType={this.loadQuotaType}
                        /> : null
                }
                {/* {
                    multipleUpdateFinish ?
                        <EditMultipleDialog
                            id={id + '_multiChangeDetailDialog'}
                            dialogTitle="Multiple Update"
                            open={multipleUpdateFinish}
                            message={multipleUpdateMessage}
                            showTable={multipleUpdateDetails && multipleUpdateDetails.length > 0}
                            store={multipleUpdateDetails}
                            columns={[{ name: 'detail', label: `${multipleUpdateForm.encounterTypeCd} ${multipleUpdateForm.subEncounterTypeCd} Change fail detail` }]}
                            onClose={() => { this.props.updateState({ multipleUpdateFinish: false }); }}
                        /> : null
                } */}
            </Grid >
        );
    }
}

function mapStateToProps(state) {
    return {
        encounterTypeCd: state.editTimeSlot.encounterTypeCd,
        subEncounterTypeCd: state.editTimeSlot.subEncounterTypeCd,
        encounterCodeList: state.editTimeSlot.encounterCodeList || [],
        subEncounterCodeList: state.editTimeSlot.subEncounterCodeList || [],
        dateFrom: state.editTimeSlot.dateFrom,
        dateTo: state.editTimeSlot.dateTo,
        page: state.editTimeSlot.page,
        pageSize: state.editTimeSlot.pageSize,
        timeslotList: state.editTimeSlot.timeslotList,
        selectedItems: state.editTimeSlot.selectedItems,
        dialogOpen: state.editTimeSlot.dialogOpen,
        dialogName: state.editTimeSlot.dialogName,
        multipleUpdateFinish: state.editTimeSlot.multipleUpdateFinish,
        multipleUpdateData: state.editTimeSlot.multipleUpdateData,
        multipleUpdateForm: state.editTimeSlot.multipleUpdateForm,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd
    };
}

const mapDispatchToProps = {
    getEncounterTypeList,
    resetAll,
    updateState,
    listTimeslot,
    openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EditTimeSlot));