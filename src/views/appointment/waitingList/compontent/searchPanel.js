import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid
} from '@material-ui/core';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import DateValidator from '../../../../components/FormValidator/DateFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import Enum from '../../../../enums/enum';
import * as CommonUtil from '../../../../utilities/commonUtilities';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import { memoize } from 'lodash';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import moment from 'moment';

class SearchPanel extends Component {

    handleOnChange = (value, name) => {
        this.props.updateField(name, value);
    }

    filterClinicList = memoize((list, clinicCd, isEnableCross) => {
        if (isEnableCross) {
            return list;
        } else {
            return list && list.filter(item => item.clinicCd === clinicCd);
        }
    });

    render() {
        const {
            id,
            classes,
            dateFrom,
            dateTo,
            siteId,
            status,
            dateType
        } = this.props;

        let { serviceCd, clinicList, clinicCd, isEnableCrossBookClinic } = this.props;
        let _clinicList = this.filterClinicList(CommonUtil.getClinicListByServiceCode(clinicList, serviceCd), clinicCd, isEnableCrossBookClinic);
        const fromDateValidator = [];
        const fromDateErrorMsg = [];
        if (dateTo && moment(dateTo).isValid()) {
            fromDateValidator.push(ValidatorEnum.maxDate(moment(dateTo).format(Enum.DATE_FORMAT_EYMD_VALUE)));
            fromDateErrorMsg.push(CommonMessage.VALIDATION_NOTE_MAX_DATE(moment(dateTo).format(Enum.DATE_FORMAT_EDMY_VALUE)));
        }
        const toDateValidator = [];
        const toDateErrorMsg = [];

        if (dateFrom && moment(dateFrom).isValid()) {
            toDateValidator.push(ValidatorEnum.minDate(moment(dateFrom).format(Enum.DATE_FORMAT_EYMD_VALUE)));
            toDateErrorMsg.push(CommonMessage.VALIDATION_NOTE_MIN_DATE(moment(dateFrom).format(Enum.DATE_FORMAT_EDMY_VALUE)));
        }

        return (
            <ValidatorForm
                id={id + 'Form'}
                ref={'form'}
                onSubmit={this.handSearchPanelSubmit}
                className={classes.form}
            >
                <Grid className={classes.fieldPanel} container item xs={2} style={{ marginRight: 8 }}>
                    <Grid className={classes.field} item xs={12}>
                        <SelectFieldValidator
                            id={id + 'ClinicSelectField'}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Clinic<RequiredIcon /></>
                            }}
                            fullWidth
                            // options={[
                            //     { value: '*All', label: '*All' },
                            //     ..._clinicList && _clinicList.map((item) => ({ value: item.siteId, label: item.clinicName }))]}
                            options={
                                _clinicList && _clinicList.map((item) => ({ value: item.siteId, label: item.clinicName }))
                            }
                            value={siteId}
                            msgPosition={'bottom'}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            onChange={(e) => this.handleOnChange(e.value, 'waitingListSiteId')}
                            isDisabled={!isEnableCrossBookClinic}
                            addAllOption
                            sortBy="label"
                        />
                    </Grid>
                </Grid >
                <Grid className={classes.fieldPanel} container item xs={2} style={{ marginRight: 8 }}>
                    <Grid className={classes.field} item xs={12}>
                        <SelectFieldValidator
                            id={id + 'dateTypeField'}
                            fullWidth
                            options={this.props.serviceCd !== 'THS' ? [{ value: 'R', label: 'Request Date' }] : [{ value: 'D', label: 'Departure Date' }, { value: 'R', label: 'Request Date' }]}
                            value={dateType}
                            msgPosition={'bottom'}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            onChange={(e) => this.handleOnChange(e.value, 'dateType')}
                            isDisabled={this.props.serviceCd !== 'THS'}
                        />
                    </Grid>
                </Grid >
                <Grid className={classes.fieldPanel} container item xs={2} style={{ marginRight: 8 }}>
                    <Grid className={classes.field} item xs={12}>
                        <DateValidator
                            id={id + 'DateFromDateField'}
                            isRequired
                            value={dateFrom}
                            onChange={(e) => this.handleOnChange(e, 'dateFrom')}
                            inputVariant={'outlined'}
                            label={<>From<RequiredIcon /></>}
                            absoluteMessage
                            withRequiredValidator
                            validators={fromDateValidator}
                            errorMessages={fromDateErrorMsg}
                            onBlur={(e) => this.handleOnChange(e, 'dateFrom')}
                            onAccept={(e) => this.handleOnChange(e, 'dateFrom')}
                        />
                    </Grid>
                </Grid >
                <Grid className={classes.fieldPanel} container item xs={2}>
                    <Grid className={classes.field} item xs={12}>
                        <DateValidator
                            id={id + 'DateToDateField'}
                            isRequired
                            value={dateTo}
                            onChange={(e) => this.handleOnChange(e, 'dateTo')}
                            inputVariant={'outlined'}
                            label={<>To<RequiredIcon /></>}
                            absoluteMessage
                            withRequiredValidator
                            validators={toDateValidator}
                            errorMessages={toDateErrorMsg}
                            onBlur={(e) => this.handleOnChange(e, 'dateTo')}
                            onAccept={(e) => this.handleOnChange(e, 'dateTo')}
                        />
                    </Grid>
                </Grid>
                <Grid className={classes.fieldPanel} container item xs={2} style={{ marginRight: 8 }}>
                    <Grid className={classes.field} item xs={12}>
                        <SelectFieldValidator
                            id={id + 'StatusField'}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>Status<RequiredIcon /></>
                            }}
                            fullWidth
                            options={Enum.WAITING_LIST_STATUS_LIST}
                            value={status}
                            msgPosition={'bottom'}
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            onChange={(e) => this.handleOnChange(e.value, 'status')}
                        />
                    </Grid>
                </Grid >
            </ValidatorForm>
        );
    }
}

const style = () => ({
    form: {
        display: 'flex'
    },
    fieldPanel: {
        flex: 1,
        display: 'flex'
    },
    field: {
        flex: 1,
        marginRight: 4
    },
    buttonPanel: {
        paddingTop: 14
    }

});
export default withStyles(style)(SearchPanel);