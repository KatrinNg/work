import React from 'react';
import moment from 'moment';
import {
    Grid
} from '@material-ui/core';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import TextFieldValidator from '../../../../components/FormValidator/TextFieldValidator';
import TimeFieldValidator from '../../../../components/FormValidator/TimeFieldValidator';
export default function (props) {

    const { id } = props;
    return (
        // <ExpansionPanel style={{ margin: 0 }} square expanded={expanded===value} onChange={() => { expandedOnChange(value); }}>
        //     <ExpansionPanelSummary aria-controls="panel1d-content" id="panel1d-header">
        //         <IconButton
        //             className={classes.close_icon}
        //             color={'primary'}
        //             fontSize="small"
        //         >
        //             {expanded===value ? <Remove /> : <Add />}
        //             <b>Time range</b>
        //         </IconButton>
        //     </ExpansionPanelSummary>
        //     <ExpansionPanelDetails>
        <Grid style={{ width: '100%', position: 'relative' }}>
            <Grid style={{ position: 'absolute', top: -13, left: 16, padding: '0 10px', background: '#fff' }}>Time range</Grid>
            <Grid style={{ display: 'flex', margin: '16px 0', border: '1px solid', padding: 11 }}>
                <Grid style={{ flex: 1, paddingRight: 10, borderRight: '3px solid #999' }}>
                    <Grid style={{ display: 'flex',marginBottom:6 }}>
                        <Grid style={{ marginRight: 6 }}>
                            <TimeFieldValidator
                                id={id + 'StartTimeField'}
                                labelText="Start:"
                                labelPosition={'left'}
                                // isRequired
                                value={null}
                            // onChange={(e) => { this.props.subEncounterTypeDetailOnChange(e, 'timeField', 'sessionTime'); }}
                            />
                        </Grid>
                        <Grid>
                            <TimeFieldValidator
                                id={id + 'EndTimeField'}
                                labelText="End:"
                                labelPosition={'left'}
                                value={null}
                            // isRequired
                            // value={!this.props.subEncounterTypeDetail.sessionTime ? null : moment(this.props.subEncounterTypeDetail.sessionTime, 'HH:mm')}
                            // onChange={(e) => { this.props.subEncounterTypeDetailOnChange(e, 'timeField', 'sessionTime'); }}
                            />
                        </Grid>
                    </Grid>
                    <Grid style={{ display: 'flex' }}>
                        <Grid style={{ marginRight: 6,flex:1 }}>
                            <TextFieldValidator
                                //isRequired
                                // id={'slotProfileCode'}
                                labelText={'Duration:'}
                                labelPosition={'left'}
                                // value={this.props.slotProfileCode}
                                name={'slotProfileCode'}
                                inputProps={{
                                    maxLength: 6
                                }}
                            // onChange={this.handleChange}
                            // onBlur={this.handleSlotProfileCodeBlur}
                            />
                        </Grid>
                        <Grid  style={{flex:1 }}>
                            <SelectFieldValidator
                                labelPosition={'left'}
                                options={[{ value: 'M', label: 'minutes' }, { value: 'H', label: 'Hour' }]}
                                value={'M'}
                            // onChange={(...arg) => this.handleSelectChange(...arg, 'encounterTypeCd')}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid style={{ flex: 1, paddingLeft: 10 }}>
                    <Grid style={{ marginBottom: 11, textAlign: 'center' }}>
                        Exception range(i.e. Lunch)
                    </Grid>
                    <Grid style={{ display: 'flex' }}>
                        <Grid style={{ marginRight: 6 }}>
                            <TimeFieldValidator
                                labelText="Start:"
                                labelPosition={'left'}
                                // isRequired
                                value={moment('12:00', 'HH:mm')}
                            // onChange={(e) => { this.props.subEncounterTypeDetailOnChange(e, 'timeField', 'sessionTime'); }}
                            />
                        </Grid>
                        <Grid>
                            <TimeFieldValidator
                                labelText="End:"
                                labelPosition={'left'}
                                // isRequired
                                value={null}
                            // onChange={(e) => { this.props.subEncounterTypeDetailOnChange(e, 'timeField', 'sessionTime'); }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
        //     </ExpansionPanelDetails>
        // </ExpansionPanel>

    );
}