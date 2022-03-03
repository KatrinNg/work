import React from 'react';
import {
    FormGroup,
    FormControlLabel,
    RadioGroup,
    Radio,
    Checkbox,
    Grid
} from '@material-ui/core';

import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';


export default function (props) {
    const { id, classes } = props;
    return (
        // <ExpansionPanel style={{ margin: 0 }} square expanded={expanded === value} onChange={() => { expandedOnChange(value); }}>
        //     <ExpansionPanelSummary aria-controls="panel2d-content" id="panel2d-header">
        //         <IconButton
        //             className={classes.close_icon}
        //             color={'primary'}
        //             fontSize="small"
        //         >
        //             {expanded === value ? <Remove /> : <Add />}
        //             <b>Recurrence pattern</b>
        //         </IconButton>
        //     </ExpansionPanelSummary>
        //     <ExpansionPanelDetails>
        <Grid style={{ width: '100%',position: 'relative' }}>
        <Grid style={{position: 'absolute',top: -13,left: 16,padding: '0 10px',background: '#fff' }}>Recurrence pattern</Grid>
        <Grid style={{ display: 'flex', margin: '16px 0',border: '1px solid',padding: 11 }}>
                    <RadioGroup
                        id={id + '_contactMeanGroup'}
                        column
                        style={{ paddingRight: 10, borderRight: '3px solid #999' }}
                        value={'D'}
                        onChange={() => { }}
                    >
                        <FormControlLabel value={'D'}
                            // disabled={comDisabled}
                            label={'Daily'}
                            labelPlacement="end"
                            id={id + '_' + 'D' + '_radioLabel'}
                            control={
                                <Radio
                                    id={id + '_' + 'D' + '_radio'}
                                    color="primary"
                                    classes={{
                                        root: classes.radioBtn,
                                        checked: classes.radioBtnChecked
                                    }}
                                />}
                        />
                        <FormControlLabel value={'W'}
                            // disabled={comDisabled}
                            label={'Weekly'}
                            labelPlacement="end"
                            id={id + '_' + 'W' + '_radioLabel'}
                            control={
                                <Radio
                                    id={id + '_' + 'W' + '_radio'}
                                    color="primary"
                                    classes={{
                                        root: classes.radioBtn,
                                        checked: classes.radioBtnChecked
                                    }}
                                />}
                        />
                        <FormControlLabel value={'M'}
                            // disabled={comDisabled}
                            label={'Monthly'}
                            labelPlacement="end"
                            id={id + '_' + 'M' + '_radioLabel'}
                            control={
                                <Radio
                                    id={id + '_' + 'M' + '_radio'}
                                    color="primary"
                                    classes={{
                                        root: classes.radioBtn,
                                        checked: classes.radioBtnChecked
                                    }}
                                />}
                        />
                    </RadioGroup>
                    <Grid>
                        <RadioGroup
                            id={id + '_contactMeanGroup'}
                            // className={'hide'}
                            column
                            style={{ paddingLeft: 10 }}
                            value={'D'}
                            onChange={() => { }}
                        >
                            <Grid container>
                                <FormControlLabel value={'D'}
                                    // disabled={comDisabled}
                                    label={'Every'}
                                    id={id + '_' + 'D' + '_radioLabel'}
                                    control={
                                        <Radio
                                            id={id + '_' + 'D' + '_radio'}
                                            color="primary"
                                            classes={{
                                                root: classes.radioBtn,
                                                checked: classes.radioBtnChecked
                                            }}
                                        />
                                    }
                                />
                                <Grid style={{ width: 100, marginRight: 10 }}>
                                    <TextFieldValidator
                                        inputProps={{
                                            maxLength: 6
                                        }}
                                    // onChange={this.handleChange}
                                    // onBlur={this.handleSlotProfileCodeBlur}
                                    />
                                </Grid>
                                <span>day(s)</span>
                            </Grid>
                            <FormControlLabel value={'W'}
                                // disabled={comDisabled}
                                label={'Every weekday'}
                                control={
                                    <Radio
                                        id={id + '_' + 'D' + '_radio'}
                                        color="primary"
                                        classes={{
                                            root: classes.radioBtn,
                                            checked: classes.radioBtnChecked
                                        }}
                                    />
                                }
                            />
                        </RadioGroup>
                        <Grid
                            style={{ paddingLeft: 10 }}
                            className={'hide'}
                        >
                            <Grid container>
                                <span>Recur every</span>
                                <Grid style={{ width: 100, marginRight: 10 }}>
                                    <TextFieldValidator
                                        inputProps={{
                                            maxLength: 6
                                        }}
                                    // onChange={this.handleChange}
                                    // onBlur={this.handleSlotProfileCodeBlur}
                                    />
                                </Grid>
                                <span>week(s) on:</span>
                            </Grid>
                            <FormGroup row style={{ clear: 'both' }} onBlur={() => { }} id={'checkBoxGroup'}>
                                <FormControlLabel
                                    control={<Checkbox value={'1'} name={'sun'} id={'sun'} />}
                                    label={'Sun'}
                                    checked
                                    onChange={() => { }}
                                    id={'sunLabel'}
                                />
                                <FormControlLabel
                                    control={<Checkbox value={'1'} name={'mon'} id={'mon'} />}
                                    label={'Mon'}
                                    checked
                                    onChange={() => { }}
                                    id={'monLabel'}
                                />
                                <FormControlLabel
                                    control={<Checkbox value={'1'} name={'tue'} id={'tue'} />}
                                    label={'Tue'}
                                    checked
                                    onChange={() => { }}
                                    id={'tueLabel'}
                                />
                                <FormControlLabel
                                    control={<Checkbox value={'1'} name={'wed'} id={'wed'} />}
                                    label={'Wed'}
                                    checked
                                    onChange={() => { }}
                                    id={'wedLabel'}
                                />
                                <FormControlLabel
                                    control={<Checkbox value={'1'} name={'thur'} id={'thur'} />}
                                    label={'Thur'}
                                    checked
                                    onChange={() => { }}
                                    id={'thurLabel'}
                                />
                                <FormControlLabel
                                    control={<Checkbox value={'1'} name={'fri'} id={'fri'} />}
                                    label={'Fri'}
                                    checked
                                    onChange={() => { }}
                                    id={'friLabel'}
                                />
                                <FormControlLabel
                                    control={<Checkbox value={'1'} name={'sat'} id={'sat'} />}
                                    label={'Sat'}
                                    checked
                                    onChange={() => { }}
                                    id={'satLabel'}
                                />
                            </FormGroup>
                        </Grid>
                        <Grid
                            style={{ paddingLeft: 10 }}
                            className={'hide'}
                        >
                            <RadioGroup
                                // id={id + '_contactMeanGroup'}
                                column
                                value={'D'}
                                onChange={() => { }}
                            >
                                <Grid style={{ display: 'flex' }}>
                                    <FormControlLabel value={'D'}
                                        // disabled={comDisabled}
                                        label={'Day'}
                                        style={{ marginBottom: 10 }}
                                        // id={id + '_' + 'D' + '_radioLabel'}
                                        control={
                                            <Radio
                                                id={id + '_' + 'D' + '_radio'}
                                                color="primary"
                                                classes={{
                                                    root: classes.radioBtn,
                                                    checked: classes.radioBtnChecked
                                                }}
                                            />}
                                    />
                                    <Grid style={{ width: 80, margin: '0 14px' }}>
                                        <TextFieldValidator />
                                    </Grid>
                                    <span>occurrences</span>
                                    <Grid style={{ width: 80, margin: '0 14px' }}>
                                        <TextFieldValidator />
                                    </Grid>
                                    <span>month(s)</span>
                                </Grid>
                                <Grid style={{ display: 'flex' }}>
                                    <FormControlLabel value={'W'}
                                        // disabled={comDisabled}
                                        label={'The'}
                                        style={{ marginBottom: 10 }}
                                        // id={id + '_' + 'D' + '_radioLabel'}
                                        control={
                                            <Radio
                                                id={id + '_' + 'D' + '_radio'}
                                                color="primary"
                                                classes={{
                                                    root: classes.radioBtn,
                                                    checked: classes.radioBtnChecked
                                                }}
                                            />}
                                    />
                                    <Grid style={{ width: 116, margin: '0 0 0 14px' }}>
                                        <SelectFieldValidator
                                            options={[{ value: 'M', label: 'minutes' }, { value: 'H', label: 'Hour' }]}
                                            value={'M'}
                                        // onChange={(...arg) => this.handleSelectChange(...arg, 'encounterTypeCd')}
                                        />
                                    </Grid>
                                    <Grid style={{ width: 140, margin: '0 14px 0 4px' }}>
                                        <SelectFieldValidator
                                            options={[{ value: 'M', label: 'minutes' }, { value: 'H', label: 'Hour' }]}
                                            value={'M'}
                                        // onChange={(...arg) => this.handleSelectChange(...arg, 'encounterTypeCd')}
                                        />
                                    </Grid>
                                    <span>of every</span>
                                    <Grid style={{ width: 80, margin: '0 14px' }}>
                                        <TextFieldValidator />
                                    </Grid>
                                    <span>month(s)</span>
                                </Grid>

                            </RadioGroup>

                        </Grid>
                    </Grid>
                </Grid>
                </Grid>
        //     </ExpansionPanelDetails>

        // </ExpansionPanel>
    );
}