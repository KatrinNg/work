import React from 'react';
import {
    FormControlLabel,
    RadioGroup,
    Radio,
    Grid
} from '@material-ui/core';

import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';

export default function (props) {
    const { id, classes } = props;
    return (
        // <ExpansionPanel id={id} style={{ margin: 0 }} square expanded={expanded === value} onChange={() => { expandedOnChange(value); }}>
        //     <ExpansionPanelSummary aria-controls="panel2d-content" id="panel2d-header">
        //         <IconButton
        //             className={classes.close_icon}
        //             color={'primary'}
        //             fontSize="small"
        //         >
        //             {expanded === value ? <Remove /> : <Add />}
        //             <b>Range of recurrence</b>
        //         </IconButton>
        //     </ExpansionPanelSummary>
        //     <ExpansionPanelDetails>
        <Grid style={{ width: '100%',position: 'relative' }}>
            <Grid style={{position: 'absolute',top: -13,left: 16,padding: '0 10px',background: '#fff' }}>Range of recurrence</Grid>
            <Grid style={{ display: 'flex', margin: '16px 0',border: '1px solid',padding: 11 }}>
                <Grid style={{ width: 400 }}>
                    <DateFieldValidator
                        // id={FieldName.USER_PROFILE_ACCOUNT_EXPIRY_DATE}
                        // InputProps={{
                        //     className: 'input_field'
                        // }}
                        // isRequired
                        // msgPosition="right"
                        // disabled={isInputDisabled}
                        labelText="Start:"
                        labelPosition={'left'}
                        msgPosition="bottom"
                        disablePast
                        value={null}
                    />
                </Grid>
                <Grid style={{ flex: 1 }}>
                    <RadioGroup
                        id={id + '_contactMeanGroup'}
                        // style={{ marginTop: 24 }}
                        column
                        value={'N'}
                        onChange={() => { }}
                    >
                        <Grid style={{ display: 'flex' }}>
                            <FormControlLabel value={'A'}
                                // disabled={comDisabled}
                                label={'End after:'}
                                style={{ margin: '0 0 10px 25px' }}
                                id={id + '_' + 'A' + '_radioLabel'}
                                control={
                                    <Radio
                                        id={id + '_' + 'A' + '_radio'}
                                        color={'primary'}
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
                        </Grid>
                        <Grid style={{ display: 'flex' }}>
                            <FormControlLabel value={'B'}
                                // disabled={comDisabled}
                                label={'End by:'}
                                style={{ margin: '0 0 10px 25px' }}
                                id={id + '_' + 'B' + '_radioLabel'}
                                control={
                                    <Radio
                                        id={id + '_' + 'B' + '_radio'}
                                        color={'primary'}
                                        classes={{
                                            root: classes.radioBtn,
                                            checked: classes.radioBtnChecked
                                        }}
                                    />}
                            />
                            <Grid style={{ marginLeft: 29 }}>
                                <DateFieldValidator
                                    msgPosition="bottom"
                                    disablePast
                                    value={null}
                                />
                            </Grid>
                        </Grid>


                    </RadioGroup>
                </Grid>
            </Grid>
        </Grid>
        //     </ExpansionPanelDetails>
        // </ExpansionPanel>
    );
}