import React from 'react';

import {
    Grid
} from '@material-ui/core';

import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import NewOldQuota from '../../../compontent/newOldQuota';

export default function (props) {

    const { fieldsValidator, fieldsErrorMessage, enCounterCodeList } = props;
    let filterEnCounterCodeList = enCounterCodeList.find(item => item.encounterTypeCd === props.encounterTypeCd);
    const subEnCounterList = filterEnCounterCodeList ? filterEnCounterCodeList.subEncounterTypeList : [];
    return (
        <Grid>
            <Grid style={{ display: 'flex' }}>
                <Grid style={{ marginRight: 6, flex: 1 }}>
                    <TextFieldValidator
                        isRequired
                        id={'slotProfileCode'}
                        labelText={'Code'}
                        labelPosition={'left'}
                        // value={props.slotProfileCode}
                        name={'slotProfileCode'}
                        inputProps={{
                            maxLength: 6
                        }}
                    // onChange={this.handleChange}
                    // onBlur={this.handleSlotProfileCodeBlur}
                    />
                </Grid>
                <Grid style={{ marginRight: 6, flex: 1 }}>
                    <SelectFieldValidator
                        isRequired
                        name={'encounterTypeCd'}
                        options={props.enCounterCodeList &&
                            props.enCounterCodeList.map((item) => (
                                { value: item.encounterTypeCd, label: item.encounterTypeCd }
                            ))}
                        // value={props.encounterTypeCd}
                        // onChange={(...arg) => this.handleSelectChange(...arg, 'encounterTypeCd')}
                        labelText={'Encounter'}
                        labelPosition={'left'}
                        id={'encounterType'}
                    />
                </Grid>
                <Grid style={{ flex: 1 }}>
                    <SelectFieldValidator
                        isRequired
                        options={subEnCounterList &&
                            subEnCounterList.map((item) => (
                                { value: item.subEncounterTypeCd, label: item.subEncounterTypeCd }
                            ))}
                        labelText={'Sub-encounter'}
                        labelPosition={'left'}
                        labelProps={{style:{width:224}}}
                        id={'subEncounterType'}
                    // onChange={(...arg) => this.handleSelectChange(...arg, 'subEncounterTypeCd')}
                    // value={props.subEncounterTypeCd}
                    />
                </Grid>
            </Grid>
            <Grid style={{ display: 'flex' }}>
                <Grid style={{ flex: 1, marginRight: 30 }} >
                    <Grid style={{ marginTop: 13 }}>
                        <TextFieldValidator
                            inputProps={{
                                maxLength: 100
                            }}
                            name={'description'}
                            id={'description'}
                            // onChange={this.handleChange}
                            labelText={'Description'}
                            // labelPosition={'left'}
                        // value={props.description || ''}
                        />
                    </Grid>
                    <Grid style={{ marginTop: 13 }}>
                        <TextFieldValidator
                            isRequired
                            id={'overallQuota'}
                            // value={props.overallQuota}
                            labelText={'Overall Quota'}
                            // labelPosition={'left'}
                            // onChange={this.handleChange}
                            inputProps={{
                                maxLength: 4
                            }}
                            // onBlur={(...arg) => this.handleQuotaBlur(...arg, 9999)}
                            name={'overallQuota'}
                        />
                    </Grid>
                </Grid>
                <Grid style={{ flex: 1 }} >
                    <NewOldQuota
                        id={'newOldQuota'}
                        validators={fieldsValidator.newOldQuota}
                        errorMessages={fieldsErrorMessage.newOldQuota}
                        // classes={classes}
                        newNormal={props.newNormal}
                        newUrgent={props.newUrgent}
                        newPublic={props.newPublic}
                        oldNormal={props.oldNormal}
                        oldUrgent={props.oldUrgent}
                        oldPublic={props.oldPublic}
                        // onChange={this.handleChange}
                        encounterTypeCd={props.encounterTypeCd}
                        subEncounterTypeCd={props.subEncounterTypeCd}
                        // blur={(...arg) => this.handleQuotaBlur(...arg, 0)}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
}