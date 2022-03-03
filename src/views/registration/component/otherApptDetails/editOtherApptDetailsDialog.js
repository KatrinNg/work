import React from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import _ from 'lodash';
import CIMSPromptDialog from '../../../../components/Dialog/CIMSPromptDialog';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import TimePicker from '../../../../components/FormValidator/TimeFieldValidator';
import FastTextFieldValidator from '../../../../components/TextField/FastTextFieldValidator';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import AddRemoveButtons from '../../../../components/Buttons/AddRemoveButtons';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import CIMSLightToolTip from '../../../../components/ToolTip/CIMSLightToolTip';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import { auditAction } from '../../../../store/actions/als/logAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { listOtherAppointmentType, saveOtherAppointmentDetails } from '../../../../store/actions/appointment/otherAppointmentDetails/otherAppointmentDetails';
import { othApptDtlStsMapping } from '../../../../enums/anSvcID/anSvcIDEnum';
import Enum from '../../../../enums/enum';
import { mapOthAppointmentDetailSts } from '../../../../utilities/appointmentUtilities';


const styles = theme => ({
    paper: {
        width: '100%'
        //height: 640
    },
    itemPadding: {
        padding: '12px 8px'
    },
    sectionTitle: {
        padding: '0px 8px',
        color: theme.palette.primaryColor
    },
    titleTxt: {
        fontWeight: 'bold'
    }
});





class EditOtherAppointmentDetailsDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            initialData: {
                clcAntId: 0,
                clcAntIdSrc: 0,
                apptDate: null,
                apptTime: null,
                hcinstTxt: null,
                codAntHaApptTypeId: null,
                remark: null,
                recSts: null
            },
            othApptType: [],
            detailList: []
        };
    }
    componentDidMount() {
        const { otherApptDetails, serviceCd, siteId } = this.props;
        let detailList = _.cloneDeep(otherApptDetails);
        let othApptType = [];
        if (detailList.length === 0) {
            let newData = this.createNewDetail();
            if (newData !== null) {
                newData.seq = 0;
                detailList.push(newData);
            }
        }
        detailList.forEach((detail, idx) => {
            if (detail.apptDatetime) {
                detail.apptDate = moment(detail.apptDatetime).format(Enum.DATE_FORMAT_EDMY_VALUE);
                detail.apptTime = moment(detail.apptDatetime).format(Enum.DATE_FORMAT_24);
                detail.seq = idx;
            }
        });
        this.setState({ detailList });
        const params = {
            svcCd: serviceCd,
            siteId: siteId
        };
        this.props.listOtherAppointmentType(params, (data) => {
            othApptType = data;
            this.setState({ othApptType });
        });
    }

    getActiveDetail = (detailList) => {
        const fullList = _.cloneDeep(detailList);
        return fullList.filter(x => x.recSts === othApptDtlStsMapping.CURRENT);
    }

    filterSubmitData = (detailList) => {
        let result = detailList.filter(item => {
            if (!_.isNumber(item.anaHcinstApptId) && !_.isNumber(item.anaHcinstApptIdSrc) && item.recSts !== othApptDtlStsMapping.CURRENT) {
                return false;
            } else {
                return true;
            }
        });
        return result;
    }

    detailRow = (activeList) => {
        const { id } = this.props;
        const { othApptType } = this.state;
        return activeList.map((detail, idx) => {
            const data = _.cloneDeep(detail);
            return (
                <Grid container spacing={1} style={{ padding: '12px 0px' }} key={`${id}_detail_${idx + 1}_container`}>
                    <Grid item xs={1}>
                        <DateFieldValidator
                            label={<>Date<RequiredIcon /></>}
                            variant={'outlined'}
                            id={`${id}_detail_${idx + 1}_appt_date`}
                            key={`${id}_detail_${idx + 1}_appt_date`}
                            value={data.apptDate || null}
                            inputVariant={'outlined'}
                            placeholder={''}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            onChange={(e) => this.handleDetailChange(data, 'apptDate', e)}
                            absoluteMessage
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <TimePicker
                            variant={'outlined'}
                            label={'Time'}
                            id={`${id}_detail_${idx + 1}_appt_time`}
                            key={`${id}_detail_${idx + 1}_appt_time`}
                            clearable={false}
                            value={data.apptTime || null}
                            onChange={(e) => this.handleDetailChange(data, 'apptTime', e)}
                            helperText=""
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <FastTextFieldValidator
                            id={`${id}_detail_${idx + 1}_place`}
                            key={`${id}_detail_${idx + 1}_place`}
                            label={<>Place<RequiredIcon /></>}
                            value={data.hcinstTxt}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            onBlur={(e) => this.handleDetailChange(data, 'hcinstTxt', e.target.value)}
                            inputProps={{ maxLength: 50 }}
                            calActualLength
                        //trim={'all'}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <SelectFieldValidator
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Booking Type<RequiredIcon /></>
                            }}
                            options={othApptType.map((item) => (
                                { value: item.othApptTypeId, label: item.othApptTypeDesc }))}
                            id={`${id}_detail_${idx + 1}_booking_type`}
                            key={`${id}_detail_${idx + 1}_booking_type`}
                            value={data.codAntHaApptTypeId}
                            onChange={e => this.handleDetailChange(data, 'codAntHaApptTypeId', e.value)}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            absoluteMessage
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <FastTextFieldValidator
                            id={`${id}_detail_${idx + 1}_remarks`}
                            key={`${id}_detail_${idx + 1}_remarks`}
                            value={data.remark}
                            onBlur={(e) => this.handleDetailChange(data, 'remark', e.target.value)}
                            inputProps={{ maxLength: 500 }}
                            calActualLength
                            //trim={'all'}
                            label={'Remarks'}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <FastTextFieldValidator
                            id={`${id}_detail_${idx + 1}_status`}
                            key={`${id}_detail_${idx + 1}_status`}
                            value={mapOthAppointmentDetailSts(data.recSts)}
                            label={'Status'}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={1}>
                        {data.updateBy ?
                            <CIMSLightToolTip
                                title={data.updateBy}
                            >
                                <FastTextFieldValidator
                                    id={`${id}_detail_${idx + 1}_updated_by`}
                                    key={`${id}_detail_${idx + 1}_updated_by`}
                                    value={data.updateBy}
                                    label={'Update By'}
                                    disabled
                                />
                            </CIMSLightToolTip>
                            :
                            <FastTextFieldValidator
                                id={`${id}_detail_${idx + 1}_updated_by`}
                                key={`${id}_detail_${idx + 1}_updated_by`}
                                value={data.updateBy}
                                label={'Update By'}
                                disabled
                            />
                        }

                    </Grid>
                    <Grid item xs={1}>
                        <FastTextFieldValidator
                            id={`${id}_detail_${idx + 1}_updated_on`}
                            key={`${id}_detail_${idx + 1}_updated_on`}
                            value={data.updateDtm ? moment(data.updateDtm).format(Enum.DATE_FORMAT_EDMY_VALUE) : null}
                            label={'Updated On'}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <AddRemoveButtons
                            id={`${id}_detail_${idx + 1}_addRemove_btn`}
                            key={`${id}_detail_${idx + 1}_addRemove_btn`}
                            RemoveButtonProps={{
                                onClick: () => {
                                    this.props.openCommonMessage({
                                        msgCode: '110067',
                                        btnActions: {
                                            btn1Click: () => {
                                                this.handleRemoveDetail(detail, idx);
                                            }
                                        }
                                    });
                                },
                                style: { alignItems: 'flex-start', padding: 6 }
                            }}
                            AddButtonProps={{
                                onClick: () => { this.handleAddNewDetail(); },
                                style: { alignItems: 'flex-start', padding: 6, visibility: idx !== activeList.length - 1 ? 'hidden' : 'visible' }
                            }}
                        />
                    </Grid>
                </Grid>
            );
        });

    };

    genDialogContent = () => {
        const { id } = this.props;
        const { detailList } = this.state;
        let _detailList = _.cloneDeep(detailList);
        const activeList = this.getActiveDetail(_detailList);
        return (
            <Grid container>
                <ValidatorForm style={{ height: 640, width: '100%' }} onSubmit={() => this.handleSubmit()} ref={ref => this.form = ref}>
                    <Grid item container xs={12} justify={'flex-end'}>
                        <CIMSButton
                            id={id + '_logBtn'}
                            children={'Log'}
                            onClick={() => {
                                this.props.auditAction('Click Log Button In Edit Other Appointment Details Dialog', null, null, false, 'ana');
                                this.props.openOtherApptDetailsLog(true);
                            }}
                        />
                    </Grid>
                    <Grid item container xs={12}>
                        {
                            activeList.length > 0 ?
                                this.detailRow(activeList)
                                :
                                <Grid item container xs={12} justify={'flex-end'}>
                                    <Grid item xs={1} style={{ padding: '12px 0px' }}>
                                        <AddRemoveButtons
                                            id={`${id}_no_record_addRemove_btn`}
                                            RemoveButtonProps={{
                                                onClick: () => {
                                                },
                                                style: { alignItems: 'flex-start', padding: 6, visibility: 'hidden' }
                                            }}
                                            AddButtonProps={{
                                                onClick: () => { this.handleAddNewDetail(); },
                                                style: { alignItems: 'flex-start', padding: 6 }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                        }
                    </Grid>
                </ValidatorForm>

            </Grid>

        );
    };

    handleDetailChange = (detail, name, value) => {
        const _detailList = _.cloneDeep(this.state.detailList);
        detail[name] = value;
        _detailList[detail.seq] = detail;
        this.setState({ detailList: _detailList });
    }

    createNewDetail = () => {
        const { antSvcInfo } = this.props;
        let newData = null;
        if (antSvcInfo && antSvcInfo.clcAntCurrent) {
            newData = _.cloneDeep(this.state.initialData);
            newData.clcAntId = antSvcInfo.clcAntCurrent.clcAntId;
            newData.clcAntIdSrc = antSvcInfo.clcAntCurrent.clcAntIdSrc;
            newData.recSts = othApptDtlStsMapping.CURRENT;
        }
        return newData;
    }

    handleAddNewDetail = () => {
        let _detailList = _.cloneDeep(this.state.detailList);
        let newData = this.createNewDetail();
        if (newData !== null) {
            newData.seq = _detailList.length > 0 ? _detailList.length : 0;
            _detailList.push(newData);
            this.setState({ detailList: _detailList });
        }
    }

    handleRemoveDetail = (detail) => {
        let _detailList = _.cloneDeep(this.state.detailList);
        detail.recSts = othApptDtlStsMapping.DELETED;
        _detailList[detail.seq] = detail;
        this.setState({ detailList: _detailList });
    }

    handleSubmit = () => {
        const { detailList } = this.state;
        let params = [];
        detailList.forEach(detail => {
            const detailTime = detail.apptTime ? detail.apptTime : moment().startOf('day');
            const apptDate = moment(detail.apptDate).isValid() ? moment(detail.apptDate).format(Enum.DATE_FORMAT_EYMD_VALUE) : '';
            const apptTime = moment(detailTime).isValid() ? moment(detailTime).format(Enum.TIME_FORMAT_24_HOUR_CLOCK) : '';
            let item = {
                hcinstTxt: detail.hcinstTxt,
                codAntHaApptTypeId: detail.codAntHaApptTypeId,
                apptDatetime: apptDate && apptTime ? `${apptDate} ${apptTime}` : '',
                recSts: detail.recSts || '',
                remark: detail.remark,
                clcAntId: detail.clcAntId,
                clcAntIdSrc: detail.clcAntIdSrc
            };
            if (_.isNumber(detail.anaHcinstApptId)) {
                item.anaHcinstApptId = detail.anaHcinstApptId;
                item.anaHcinstApptIdSrc = detail.anaHcinstApptIdSrc;
                item.version = detail.version;
            }
            delete item.seq;
            params.push(item);
        });
        let _params = this.filterSubmitData(params);
        this.props.saveOtherAppointmentDetails(_params, () => {
            this.props.closeDialog();
        });
    }
    render() {
        const { id, open, classes } = this.props;
        const { detailList } = this.state;
        const submitList = this.filterSubmitData(detailList);
        return (
            <Grid container>
                <CIMSPromptDialog
                    id={id}
                    open={open}
                    dialogTitle={'Edit Other Appointment Details'}
                    classes={{
                        paper: classes.paper
                    }}
                    dialogContentText={this.genDialogContent()}
                    buttonConfig={
                        [
                            {
                                id: id + '_saveBtn',
                                name: 'Save',
                                onClick: () => {
                                    this.props.auditAction('Save Other Appointment Details');
                                    const formValid = this.form.isFormValid(false);
                                    formValid.then(result => {
                                        if (result) {
                                            this.form.submit();
                                        }
                                    });
                                },
                                disabled: submitList.length === 0
                            },
                            {
                                id: id + '_backBtn',
                                name: 'Cancel',
                                onClick: () => {
                                    this.props.auditAction('Close Edit Other Appointment Details Dialog', null, null, false, 'ana');
                                    this.props.closeDialog();
                                }
                            }
                        ]
                    }
                />
            </Grid>
        );
    }

}

const mapState = (state) => {
    return ({
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        antSvcInfo: state.patient.patientInfo.antSvcInfo
    });
};

const dispatch = {
    auditAction,
    openCommonMessage,
    listOtherAppointmentType,
    saveOtherAppointmentDetails
};


export default connect(mapState, dispatch)(withStyles(styles)(EditOtherAppointmentDetailsDialog));