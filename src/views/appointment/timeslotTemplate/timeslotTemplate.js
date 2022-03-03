import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    withStyles
} from '@material-ui/core/styles';
import {
    Grid,
    InputLabel
} from '@material-ui/core';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import {
    updateSearchField,
    resetAll,
    searchTimslotTemplate,
    openDialog,
    closeDialog,
    getTimeslotTemplate
} from '../../../store/actions/appointment/timeslotTemplate/timeslotTemplateAction';
import * as timeslotTemplateActionType from '../../../store/actions/appointment/timeslotTemplate/timeslotTemplateActionType';
import { getEncounterTypeList } from '../../../store/actions/common/commonAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import UpdateTimeslotDialog from './updateTimeslotDialog';
import { StatusEnum } from '../../../enums/appointment/timeslot/timeslotTemplateEnum';
import CIMSTable from '../../../components/Table/CIMSTable';
import ComplexGeneration from '../complexSlotGeneration/complexSlotGeneration';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import CommonRegex from '../../../constants/commonRegex';
import * as CommonUtil from '../../../utilities/commonUtilities';
import Enum from '../../../enums/enum';

const style = {
    select: {
        // marginBottom: 10,
        // marginTop: 5,
        width: '100%'
    },
    buttonNavigator: {
        //flexWrap:'nowrap',
        margin: '0px',
        //height: 26,
        width: 'calc(100% / 7)',
        marginBottom: '5px'
    },
    shortName: {
        paddingLeft: '10px',
        wordBreak: 'break-all'
    }
};
class TimeslotTemplate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedItems: [],
            tableRows: [
                { name: 'slotProfileCode', label: 'Slot Profile Code', width: 150 },
                { name: 'sun', label: 'SUN', width: 50 },
                { name: 'mon', label: 'MON', width: 50 },
                { name: 'tue', label: 'TUE', width: 50 },
                { name: 'wed', label: 'WED', width: 50 },
                { name: 'thur', label: 'THUR', width: 50 },
                { name: 'fri', label: 'FRI', width: 50 },
                { name: 'sat', label: 'SAT', width: 50 },
                { name: 'startTime', label: 'Start Time', width: 100 },
                { name: 'overallQuota', label: 'Overall Quota', width: 120 }
            ],
            tableOptions: {
                // rowHover: true,
                rowExpand: true,
                rowsPerPage: 10,
                rowsPerPageOptions: [10, 15, 20],
                onSelectIdName: 'slotTemplateId',
                onSelectedRow: (rowId, rowData, selectedData) => {
                    this.selectTableItem(selectedData);
                }
            },
            defaultQuotaDescValue: null,
            open:false

        };
    }
    UNSAFE_componentWillMount() {
        this.props.resetAll();
        const where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
        const defaultQuotaDesc = CommonUtil.getPriorityConfig(Enum.CLINIC_CONFIGNAME.QUOTA_TYPE_DESC, this.props.clinicConfig, where);

        const quotaArr = defaultQuotaDesc.configValue ? defaultQuotaDesc.configValue.split('|') : null;
        let newQuotaArr = CommonUtil.transformToMap(quotaArr);
        this.setState({ defaultQuotaDescValue: newQuotaArr });
    }
    componentDidMount() {
        this.props.ensureDidMount();
        this.props.resetAll();
        const { clinicCd, serviceCd } = this.props;
        this.props.getEncounterTypeList({
            params: { clinicCd, serviceCd } ,
            actionType: timeslotTemplateActionType.ENCOUNTERTYPE_CODE_LIST
        });
        let { tableRows } = this.state;
        this.state.defaultQuotaDescValue.forEach((item) => {
            let newParams = {};
            let oldParams = {};
            newParams.name = 'new' + item.engDesc;
            newParams.label = 'New ' + item.engDesc;
            newParams.width = 120;
            oldParams.name = 'old' + item.engDesc;
            oldParams.label = 'Old ' + item.engDesc;
            oldParams.width = 120;
            tableRows.push(newParams);
            tableRows.push(oldParams);
            this.setState({ tableRows });
        });
    }
    componentWillUnmount() {
        this.props.resetAll();
    }
    handleSearch = () => {
        const params = {
            encounterTypeCd: this.props.encounterTypeCd,
            slotProfileCode: '',
            subEncounterTypeCd: this.props.subEncounterTypeCd
        };
        params.page = 1;
        this.tablRef.updatePage(0);
        this.props.searchTimslotTemplate(params);
    }
    handleSearchSelectChange = (e, name) => {
        let value = e.value;
        this.props.updateSearchField(name, value, e.shortName);
    }
    openDialog = (isOpen, statusEnum) => {
        if (statusEnum === StatusEnum.EDIT) {
            const { selectedItems } = this.state;
            if (!selectedItems || selectedItems.length <= 0) {
                this.props.openCommonMessage({
                    msgCode: '110701'

                });
                return;
            }
            this.props.getTimeslotTemplate(selectedItems);
            return;
        }
        this.props.openDialog(isOpen, statusEnum);
    }
    selectTableItem = (selected) => {
        let selectedItem = [];
        if (selected && selected.length > 0)
            selectedItem.push(selected[0].slotTemplateId);
        this.setState({ selectedItems: selectedItem });
    }
    render() {
        const { classes, status, isOpenDialog } = this.props;
        const fieldsValidator = {
            encounterType: [ValidatorEnum.required],
            subEncounterType: [ValidatorEnum.required],
            slotProfileCode: [
                //ValidatorEnum.required,
                ValidatorEnum.isEnglishOrNumber
            ],
            weekday: [ValidatorEnum.required],
            timeBlock: [ValidatorEnum.required],
            description: [],
            week: [ValidatorEnum.required],
            newOldQuota: [
                ValidatorEnum.required,
                ValidatorEnum.matchRegexp(CommonRegex.VALIDATION_REGEX_ZERO_INTEGER)
            ],
            overallQuota: [
                ValidatorEnum.required,
                ValidatorEnum.matchRegexp(CommonRegex.VALIDATION_REGEX_ZERO_INTEGER)
            ]
        };

        const fieldsErrorMessage = {
            encounterType: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
            subEncounterType: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
            slotProfileCode: [
                //CommonMessage.VALIDATION_NOTE_REQUIRED(),
                CommonMessage.VALIDATION_NOTE_ENGLISH_OR_NUM()
            ],
            weekday: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
            timeBlock: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
            description: [],
            week: [CommonMessage.VALIDATION_NOTE_REQUIRED()],
            newOldQuota: [
                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                CommonMessage.VALIDATION_NOTE_NUMBERFIELD()
            ],
            overallQuota: [
                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                CommonMessage.VALIDATION_NOTE_NUMBERFIELD()
            ]
        };
        return (
            <Grid>
                <ValidatorForm onSubmit={this.handleSearch}>
                    <Grid container>
                        <Grid item container xs={5}>
                            <Grid item container xs={6} alignContent="center">
                                <SelectFieldValidator
                                    options={this.props.enCounterCodeList &&
                                        this.props.enCounterCodeList.map((item) => (
                                            { value: item.encounterTypeCd, label: item.encounterTypeCd, shortName: item.shortName }
                                        ))}
                                    value={this.props.encounterTypeCd}
                                    onChange={(...arg) => this.handleSearchSelectChange(...arg, 'encounterTypeCd')}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: 'Encounter'
                                    }}
                                    id={'timeslot_Template_EncounterType'}
                                    className={classes.select}
                                    validators={fieldsValidator.encounterType}
                                    errorMessages={fieldsErrorMessage.encounterType}
                                />
                            </Grid>
                            <Grid item container xs={6} alignContent="center">
                                <InputLabel className={classes.shortName}>{this.props.encounterTypeCdShortName}</InputLabel>
                            </Grid>
                        </Grid>
                        <Grid item container xs={5}>
                            <Grid item container xs={6} alignContent="center">
                                <SelectFieldValidator
                                    options={this.props.subEnCounterCodeList &&
                                        this.props.subEnCounterCodeList.map((item) => (
                                            { value: item.subEncounterTypeCd, label: item.subEncounterTypeCd, shortName: item.shortName }
                                        ))}
                                    value={this.props.subEncounterTypeCd}
                                    onChange={(...arg) => this.handleSearchSelectChange(...arg, 'subEncounterTypeCd')}
                                    TextFieldProps={{
                                        variant: 'outlined',
                                        label: 'Sub-encounter'
                                    }}
                                    id={'timeslot_Template_SubEncounterType'}
                                    className={classes.select}
                                    validators={[ValidatorEnum.required]}
                                    errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                                />
                            </Grid>
                            <Grid item container xs={6} alignContent="center">
                                <InputLabel className={classes.shortName}>{this.props.subEncounterTypeCdShortName}</InputLabel>
                            </Grid>
                        </Grid>
                        <Grid item container xs={2}>
                            <CIMSButton
                                id="timeslot_Template_Search_Button"
                                type={'submit'}
                                style={{ width: '100%' }}
                            >Search</CIMSButton>
                        </Grid>
                    </Grid>
                </ValidatorForm>

                <Grid item xs={12}>
                    <Grid item container xs={12} spacing={0} justify={'center'} style={{ margin: '9px 0', padding: 0, flexWrap: 'nowrap' }}>
                        <CIMSButton
                            id="timeslot_Template_Filter_Button"
                            className={classes.buttonNavigator}
                        >Filter</CIMSButton>
                        <CIMSButton
                            id="timeslot_Template_Copy_Button"
                            className={classes.buttonNavigator}
                        >Copy</CIMSButton>
                        <CIMSButton
                            id="timeslot_Template_Move_Button"
                            className={classes.buttonNavigator}
                        >Move</CIMSButton>
                        <CIMSButton
                            id="timeslot_Template_Edit_Button"
                            className={classes.buttonNavigator}
                            onClick={() => this.openDialog(true, StatusEnum.EDIT)}
                        >Edit</CIMSButton>
                        <CIMSButton
                            id="timeslot_Template_New_Button"
                            className={classes.buttonNavigator}
                            onClick={() => this.openDialog(true, StatusEnum.NEW)}
                        >New</CIMSButton>
                        <CIMSButton
                            id="timeslot_Template_Delete_Button"
                            className={classes.buttonNavigator}
                        >Delete</CIMSButton>
                        <CIMSButton
                            id="timeslot_Template_TwoInOne_Button"
                            className={classes.buttonNavigator}
                            // onClick={() => this.setState({ open: true })}
                        >2 in 1</CIMSButton>
                        <CIMSButton
                            id="timeslot_Template_Reset_Button"
                            className={classes.buttonNavigator}
                        >Reset</CIMSButton>
                    </Grid>
                    <Grid item container xs={12} justify={'center'}>
                        <CIMSTable
                            innerRef={ref => this.tablRef = ref}
                            data={this.props.timeslotTempalteList}
                            rows={this.state.tableRows}
                            options={this.state.tableOptions}
                        />
                    </Grid>
                </Grid>
                {status === StatusEnum.NEW || status === StatusEnum.EDIT ?
                    <UpdateTimeslotDialog
                        id={'updateFormDialog'}
                        open={isOpenDialog}
                        close={this.props.closeDialog}
                        title={status === StatusEnum.NEW ? 'Add Timeslot Profile' : status === StatusEnum.EDIT ? 'Edit Timeslot Profile' : ''}
                        handleClose={() => this.openDialog(false, StatusEnum.VIEW)}
                        fieldsValidator={fieldsValidator}
                        fieldsErrorMessage={fieldsErrorMessage}
                    />
                    : null}
                <ComplexGeneration
                    open={this.state.open}
                    close={() => { this.setState({ open: false }); }}
                    fieldsValidator={fieldsValidator}
                    fieldsErrorMessage={fieldsErrorMessage}
                />
            </Grid>
        );
    }
}
function mapStateToProps(state) {
    return {
        status: state.timeslotTemplate.status,
        isOpenDialog: state.timeslotTemplate.isOpenDialog,
        enCounterCodeList: state.timeslotTemplate.enCounterCodeList,
        subEnCounterCodeList: state.timeslotTemplate.subEnCounterCodeList,
        timeslotTempalteList: state.timeslotTemplate.timeslotTempalteList,
        ...state.timeslotTemplate.searchDTO,
        clinicConfig: state.common.clinicConfig,
        serviceCd: state.login.service.serviceCd,
        clinicCd: state.login.clinic.clinicCd
    };
}
const dispatchProps = {
    getEncounterTypeList,
    updateSearchField,
    resetAll,
    searchTimslotTemplate,
    openDialog,
    closeDialog,
    getTimeslotTemplate,
    openCommonMessage
};
export default connect(mapStateToProps, dispatchProps)(withStyles(style)(TimeslotTemplate));