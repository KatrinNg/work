import React from 'react';
import Grid from '@material-ui/core/Grid';
import moment from 'moment';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';

const FilterPatient = (props) => {
    const handleOnChange = (name, value) => {
        if (props.onChange) {
            props.onChange(name, value);
        }
    };


    const {
        searchParameter,
        subEncounterTypeList,
        encounterTypeList,
        statusList,
        filterCondition,
        onBlur,
        isAtndGenEncntrChargeableControl
    } = props;
    const attnStatusCd = filterCondition.attnStatusCd===''?'*All':filterCondition.attnStatusCd;
    const encounterTypeCd = filterCondition.encounterTypeCd===''?'*All':filterCondition.encounterTypeCd;
    const subEncounterTypeCd =filterCondition.subEncounterTypeCd===''?'*All':filterCondition.subEncounterTypeCd;
    let _statusList = statusList;
    if (isAtndGenEncntrChargeableControl === true) {
        _statusList = _statusList.filter(x => x.value !== 'A');
    }

    return (
        <Grid container spacing={3}>
            <Grid item xs={2}>
                <DateFieldValidator
                    // labelText="From:"
                    label={<>From<RequiredIcon /></>}
                    isRequired
                    value={searchParameter && searchParameter.dateFrom}
                    id={'fromtDate'}
                    validByBlur
                    onChange={(e) => handleOnChange('dateFrom', e)}
                    onBlur={e => onBlur('dateFrom', e)}
                    onAccept={e => onBlur('dateFrom', e)}
                    onFocus={e => { props.onFocus('dateFrom', e); }}
                    onOpen={() => { props.onOpen('dateFrom', searchParameter && searchParameter.dateFrom); }}
                    absoluteMessage
                />
            </Grid>
            <Grid item xs={2}>
                <DateFieldValidator
                    // labelText="To:"
                    label={<>To<RequiredIcon /></>}
                    isRequired
                    value={searchParameter && searchParameter.dateTo}
                    id={'toDate'}
                    validByBlur
                    onChange={(e) => handleOnChange('dateTo', e)}
                    onBlur={e => onBlur('dateTo', e)}
                    onAccept={e => onBlur('dateTo', e)}
                    onFocus={e => { props.onFocus('dateTo', e); }}
                    onOpen={() => { props.onOpen('dateTo', searchParameter && searchParameter.dateTo); }}
                    absoluteMessage
                />
            </Grid>
            <Grid item xs={2}>
                <SelectFieldValidator
                    id={'attnStatusCd'}
                    TextFieldProps={{
                        variant: 'outlined',
                        label: <>Status<RequiredIcon /></>,
                        InputLabelProps: { shrink: true }
                    }}
                    name={'status'}
                    onChange={(e) => handleOnChange('attnStatusCd', e.value)}
                    value={attnStatusCd}
                    options={_statusList &&
                        _statusList.map((item) => (
                            { value: item.value, label: item.label }
                        ))}
                    addAllOption
                />
            </Grid>
            <Grid item xs={2}>
                <SelectFieldValidator
                    TextFieldProps={{
                        variant: 'outlined',
                        label: <>Encounter<RequiredIcon /></>,
                        InputLabelProps: { shrink: true }
                    }}
                    options={encounterTypeList &&
                        encounterTypeList.map((item) => (
                            { value: item.encounterTypeCd, label: item.description }
                        ))}
                    id={'encounterTypeCd'}
                    name={'encounterType'}
                    onChange={(e) => handleOnChange('encounterTypeCd', e.value)}
                    value={encounterTypeCd}
                    sortBy="label"
                    addAllOption
                />
            </Grid>
            <Grid item xs={2}>
                <SelectFieldValidator
                    id={'subEncounterTypeCd'}
                    TextFieldProps={{
                        variant: 'outlined',
                        label: <>Room<RequiredIcon /></>,
                        InputLabelProps: { shrink: true }
                    }}
                    options={subEncounterTypeList &&
                        subEncounterTypeList.map((item) => (
                            { value: item.subEncounterTypeCd, label: item.description }
                        ))}
                    name={'subEncounterType'}
                    onChange={(e) => handleOnChange('subEncounterTypeCd', e.value)}
                    value={subEncounterTypeCd}
                    sortBy="label"
                    addAllOption
                />
            </Grid>
        </Grid>
    );
};

export default FilterPatient;