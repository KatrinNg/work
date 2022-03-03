import React from 'react';
import {
    Grid,
    FormControl,
    FormLabel,
    Checkbox
} from '@material-ui/core';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import { EnctrAndRmUtil } from '../../../../utilities';
import moment from 'moment';

export default function (props) {
    const {
        classes,
        id,
        encounterTypeListData,
        encounterTypeValue,
        encounterTypeValueOnChange,
        subEncounterTypeListData,
        subEncounterTypeValue,
        subEncounterTypeValueOnChange,
        sessionsConfig,
        toggleSessCheckbox
    } = props;
    let filteredSubEncounterTypeListData = subEncounterTypeListData || [];
    let _encounterTypeListData = encounterTypeListData || [];

    return (
        <ValidatorForm
            id={id + 'Form'}
            className={classes.form}
            // ref="form"
            onSubmit={() => { }}
        >
            <FormControl className={classes.formControl}>
                <FormLabel component="legend" className={classes.formLabel}>Encounter<span style={{ color: 'red' }}>*</span></FormLabel>
                <SelectFieldValidator
                    id={id + 'EncounterTypeSelectField'}
                    options={_encounterTypeListData.map((item) => ({ value: item.encounterTypeCd, label: item.description, rowData: item }))}
                    msgPosition="bottom"
                    value={encounterTypeValue}
                    onChange={encounterTypeValueOnChange}
                    sortBy="label"
                    addNullOption={false}
                />
            </FormControl>
        {
            <FormControl className={classes.formControl}>
                <FormLabel component="legend" className={classes.formLabel}>Room<span style={{ color: 'red' }}>*</span></FormLabel>
                <SelectFieldValidator
                    id={id+'SubEncounterTypeCheckboxGroup'}
                    options={filteredSubEncounterTypeListData.map((item) => ({ value: item.rmId, label: item.description, rowData: item }))}
                    msgPosition="bottom"
                    value={subEncounterTypeValue}
                    onChange={subEncounterTypeValueOnChange}
                    sortBy="label"
                    addNullOption={false}
                />
            </FormControl>
        }
        {
            //calendarViewValue !== 'M' ? null :
            <FormControl className={classes.formControl}>
                <FormLabel component="legend" className={classes.formLabel}>Session</FormLabel>
                    <Grid className={classes.boxBorder}>
                        <Grid container spacing={1}>
                            {sessionsConfig.sort((a,b)=> (moment(a.stime,'HH:mm') - moment(b.stime, 'HH:mm'))).map((sess)=>
                                <Grid item xs={12}
                                    key={sess.sessId}
                                >
                                    <Checkbox
                                        onClick={()=>{toggleSessCheckbox(sess.sessId);}}
                                        checked={sess.checked}
                                        color="primary"
                                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                                    />
                                    <span>{sess.sessDesc}</span>
                                </Grid>
                            )
                            }
                        </Grid>
                    </Grid>
            </FormControl>
        }
        {
            /*
            <FormControl component="fieldset" className={classes.formControl}>
                <FormLabel component="legend" className={classes.formLabel} >Rooms</FormLabel>
                <FormGroup id={id+'SubEncounterTypeCheckboxGroup'} className={classes.checkboxFormGroup}>
                    {subEncounterTypeListData && subEncounterTypeListData.length > 0 ?
                        <Grid className={classes.checkboxGroup}>
                            {subEncounterTypeListData.map((item, index) => (
                                <FormControlLabel
                                    key={index}
                                    id={id+'SubEncounterTypeCheckboxGroupCheckbox' + index}
                                    className={classes.formControlLabel}
                                    control={
                                        <CIMSCheckBox
                                            //style={{ padding: 4 }}
                                            checked={subEncounterTypeValue.indexOf(item.subEncounterTypeCd) !== -1}
                                            onChange={() => { checkboxOnChange('subEncounterTypeValue', item.subEncounterTypeCd); }}
                                            value={item.subEncounterTypeCd}
                                            //color={'Secondary'}
                                            //disabled
                                        />
                                    }
                                    label={<div className={classes.checkboxLabel}>{item.subEncounterTypeCd + ' ' + item.shortName}</div>}
                                />
                            ))
                            }
                        </Grid> : null
                    }
                </FormGroup>
            </FormControl>
            */
        }

        </ValidatorForm>
    );
}
