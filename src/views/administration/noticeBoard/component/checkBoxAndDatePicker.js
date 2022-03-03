import React from 'react';
import moment from 'moment';
import { MuiThemeProvider, withStyles, createMuiTheme } from '@material-ui/core/styles';
import { Grid, Checkbox } from '@material-ui/core';
import * as Colors from '@material-ui/core/colors';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import DateFieldValidator from '../../../../components/FormValidator/DateFieldValidator';
import CommonMessage from '../../../../constants/commonMessage';
import { dtmIsDirty, getMinDtm } from '../../../../utilities/noticeBoardUtilities';
import { getSystemRatio, getResizeUnit } from '../../../../utilities/commonUtilities';


const styles = () => ({
    disabledTextFieldRoot: {
        backgroundColor: Colors.grey[200]
    },
    disabledTextFieldInput: {
        color: 'rgba(0, 0, 0, 0.54)',
        readOnly: true
    },
    errMsg: {
        color: '#fd0000',
        padding: '2px 14px',
        fontSize: 12
    }
});
const sysRatio = getSystemRatio();
const unit = getResizeUnit(sysRatio);

const customTheme = (theme) => createMuiTheme({
    ...theme,
    overrides: {
        ...theme.overrides,
        MuiInputLabel: {
            ...theme.overrides.MuiInputLabel,
            outlined: {
                zIndex: 1,
                transform: `translate(14px, ${10.5 * unit}px) scale(1)`,
                '&$shrink': {
                    transform: 'translate(14px, -6px) scale(1)',
                    zIndex: 1,
                    padding: '0px 4px',
                    fontSize: 12,
                    backgroundColor: 'white'
                }
            }
        }

    }
});

class CheckBoxAndDatePicker extends React.Component {

    handleNoticeOnChange = (value, name) => {
        this.props.handleNoticeOnChange(value, name);
    }

    validateDateField = () => {
        this.newExpyDateRef.validateCurrent();
        this.urgExpyDateRef.validateCurrent();
        this.imprtntExpyDateRef.validateCurrent();
    }

    render() {
        const { notice, noticeBk, createMode, classes } = this.props;
        const efftDateIsDirty = createMode ? true : dtmIsDirty(notice.efftDate, noticeBk.efftDate);
        const newExpyDateIsDirty = createMode ? true : dtmIsDirty(notice.newExpyDate, noticeBk.newExpyDate);
        const urgExpyDateIsDirty = createMode ? true : dtmIsDirty(notice.urgExpyDate, noticeBk.urgExpyDate);
        const imprtntExpyDateIsDirty = createMode ? true : dtmIsDirty(notice.imprtntExpyDate, noticeBk.imprtntExpyDate);
        const newMinDtm = getMinDtm(notice.newExpyDate, notice.efftDate);
        const urgMinDtm = getMinDtm(notice.urgExpyDate, notice.efftDate);
        const imprtntDtm = getMinDtm(notice.imprtntExpyDate, notice.efftDate);
        return (
            <MuiThemeProvider theme={customTheme}>
                <Grid>
                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <FormControlLabel
                                checked={notice.isNew === 1}
                                onChange={(e) => this.handleNoticeOnChange(e.target.checked ? 1 : 0, 'isNew')}
                                control={<Checkbox
                                    name="New"
                                    color="primary"
                                         />}
                                label="New"
                                labelPlacement="end"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <DateFieldValidator
                                id={'NewIconExpired'}
                                label="Icon Expired On"
                                inputVariant={'outlined'}
                                placeholder={''}
                                value={notice.newExpyDate}
                                onChange={(e) => this.handleNoticeOnChange(e, 'newExpyDate')}
                                // disablePast
                                minDate={
                                    efftDateIsDirty || newExpyDateIsDirty ? newMinDtm : ''
                                    // moment(notice.efftDate).format(Enum.DATE_FORMAT_EDMY_VALUE) || moment().format(Enum.DATE_FORMAT_EDMY_VALUE) : null
                                }
                                minDateMessage={CommonMessage.VALIDATION_NOTE_DATE_MUST_AFTER_OR_EQUAL('New Icon Expiry Date', 'current date and Issuance Period (From)')}
                                disabled={notice.isNew !== 1}
                                ref={ref => this.newExpyDateRef = ref}
                                shouldDisableDate={(date) => { return moment(date).isBefore(moment(), 'days'); }}
                                InputProps={{
                                    className: notice.isNew !== 1 ? classes.disabledTextFieldRoot : null
                                }}

                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <FormControlLabel
                                checked={notice.isUrg === 1}
                                onChange={(e) => this.handleNoticeOnChange(e.target.checked ? 1 : 0, 'isUrg')}
                                control={<Checkbox
                                    name="Urgent"
                                    color="primary"
                                         />}
                                label="Urgent"
                                labelPlacement="end"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <DateFieldValidator
                                id={'UrgentIconExpired'}
                                label="Icon Expired On"
                                inputVariant={'outlined'}
                                placeholder={''}
                                value={notice.urgExpyDate}
                                onChange={(e) => this.handleNoticeOnChange(e, 'urgExpyDate')}
                                minDate={efftDateIsDirty || urgExpyDateIsDirty ? urgMinDtm : ''}
                                minDateMessage={CommonMessage.VALIDATION_NOTE_DATE_MUST_AFTER_OR_EQUAL('Urgent Icon Expiry Date', 'current date and Issuance Period (From)')}
                                disabled={notice.isUrg !== 1}
                                ref={ref => this.urgExpyDateRef = ref}
                                shouldDisableDate={(date) => { return moment(date).isBefore(moment(), 'days'); }}
                                InputProps={{
                                    className: notice.isUrg !== 1 ? classes.disabledTextFieldRoot : null
                                }}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={4}>
                        <Grid item xs={6}>
                            <FormControlLabel
                                checked={notice.isImprtnt === 1}
                                onChange={(e) => this.handleNoticeOnChange(e.target.checked ? 1 : 0, 'isImprtnt')}
                                control={<Checkbox
                                    name="Important"
                                    color="primary"
                                         />}
                                label="Important"
                                labelPlacement="end"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <DateFieldValidator
                                id={'ImportantIconExpired'}
                                label="Icon Expired On"
                                inputVariant={'outlined'}
                                placeholder={''}
                                value={notice.imprtntExpyDate}
                                onChange={(e) => this.handleNoticeOnChange(e, 'imprtntExpyDate')}
                                minDate={efftDateIsDirty || imprtntExpyDateIsDirty ? imprtntDtm : ''}
                                minDateMessage={CommonMessage.VALIDATION_NOTE_DATE_MUST_AFTER_OR_EQUAL('Important Icon Expiry Date', 'current date and Issuance Period (From)')}
                                disabled={notice.isImprtnt !== 1}
                                ref={ref => this.imprtntExpyDateRef = ref}
                                shouldDisableDate={(date) => { return moment(date).isBefore(moment(), 'days'); }}
                                InputProps={{
                                    className: notice.isImprtnt !== 1 ? classes.disabledTextFieldRoot : null
                                }}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </MuiThemeProvider>
        );
    }
}

export default withStyles(styles)(CheckBoxAndDatePicker);