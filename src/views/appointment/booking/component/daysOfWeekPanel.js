import React from 'react';
import { connect } from 'react-redux';
import { Grid, FormControlLabel, FormHelperText } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import _ from 'lodash';
import memorize from 'memoize-one';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import ValidatorComponent from '../../../../components/FormValidator/ValidatorComponent';
import CIMSCheckBox from '../../../../components/CheckBox/CIMSCheckBox';
import CIMSFormLabel from '../../../../components/InputLabel/CIMSFormLabel';
import { getDaysOfWeekDefault } from '../../../../utilities/appointmentUtilities';

const styles = theme => ({
    chbMargin: {
        margin: 0
    },
    rsn: {
        width: 300
    },
    rsnTxt: {
        width: 473
    },
    root: {
        padding: 4
    },
    labelPadding: {
        padding: '4px 8px'
    }
});

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];

class DaysOfWeekPanel extends ValidatorComponent {
    constructor(props) {
        super(props);

        this.state = {
            isSelectAll: 1,
            isSelectMonWedFri: 1,
            isSelectTueThur: 1,
            //defaultByte: parseInt('1111111', 2),
            monWedFirByteDefault: parseInt('0101010', 2),
            tueThurByteDefault: parseInt('0010100', 2),
            ...this.state
        };

    }

    shouldComponentUpdate(nextP, nextS) {
        if (nextP.daysOfWeekValArr !== this.props.daysOfWeekValArr) {
            const daysOfWeek = nextP.daysOfWeekValArr.join('');
            const daysOfWeekDefault = this.getDaysOfWeekDefault();
            const defaultByte = parseInt(daysOfWeekDefault, 2);
            const daysOfWeekByte = parseInt(daysOfWeek, 2);
            const { monWedFirByteDefault, tueThurByteDefault } = this.state;
            const monWedFirByte = this.andCalc(monWedFirByteDefault, defaultByte);
            const tueThurByte = this.andCalc(tueThurByteDefault, defaultByte);
            if (daysOfWeekByte === defaultByte) {
                this.setState({ isSelectAll: 1, isSelectMonWedFri: 1, isSelectTueThur: 1 });
            } else {
                const isSelectMonWedFri = this.andCalc(daysOfWeekByte, monWedFirByteDefault) === monWedFirByte;
                const isSelectTueThur = this.andCalc(daysOfWeekByte, tueThurByteDefault) === tueThurByte;
                this.setState({
                    isSelectAll: 0,
                    isSelectMonWedFri: isSelectMonWedFri ? 1 : 0,
                    isSelectTueThur: isSelectTueThur ? 1 : 0
                });
            }
        }

        return true;
    }

    getDaysOfWeekDefault = memorize(() => {
        const daysOfWeekDefault = getDaysOfWeekDefault();
        return daysOfWeekDefault;
    })

    resetOptions = () => {
        this.setState({ isSelectAll: 1, isSelectMonWedFri: 1, isSelectTueThur: 1 });
    }

    andCalc = (a, b) => {
        return (a & b);
    }

    orCalc = (a, b) => {
        return (a | b);
    }

    handleDaysChange = (idx, value) => {
        const { daysOfWeekValArr } = this.props;
        let arr = _.clone(daysOfWeekValArr);
        arr[idx] = value;
        this.props.updateDaysOfWeek(arr);
        //setDftTraceParam(newParam);
    };

    handleTypeChange = (name, value) => {
        const { daysOfWeekValArr } = this.props;
        const { monWedFirByteDefault, tueThurByteDefault } = this.state;
        const daysOfWeekDefault = this.getDaysOfWeekDefault();
        const daysOfWeek = daysOfWeekValArr.join('');
        const defaultByte = parseInt(daysOfWeekDefault, 2);
        const monWedFirByte = this.andCalc(monWedFirByteDefault, defaultByte);
        const tueThurByte = this.andCalc(tueThurByteDefault, defaultByte);
        let _daysOfWeekValArr = _.clone(daysOfWeekValArr);
        if (name === 'all') {
            if (value === 1) {
                daysOfWeekDefault.split('').forEach((x, idx) => {
                    _daysOfWeekValArr[idx] = parseInt(x);
                });
                this.setState({ isSelectMonWedFri: 1, isSelectTueThur: 1 });
            } else {
                _daysOfWeekValArr = [0, 0, 0, 0, 0, 0, 0];
                this.setState({ isSelectMonWedFri: 0, isSelectTueThur: 0 });
            }
            this.setState({ isSelectAll: value });
            this.props.updateDaysOfWeek(_daysOfWeekValArr);
        } else if (name === 'monWedFri') {
            let daysOfWeekByte = parseInt(daysOfWeek, 2);
            let daysOfWeekByteStr = '';
            if (value === 1) {
                daysOfWeekByteStr = this.orCalc(daysOfWeekByte, monWedFirByte).toString(2);
            } else {
                daysOfWeekByteStr = (daysOfWeekByte - monWedFirByte).toString(2);
            }
            if (daysOfWeekByteStr.length < 7) {
                daysOfWeekByteStr = daysOfWeekByteStr.padStart(7, '0');
            }
            daysOfWeekByteStr.split('').forEach((x, idx) => {
                _daysOfWeekValArr[idx] = parseInt(x);
            });
            this.setState({ isSelectMonWedFri: value });
            this.props.updateDaysOfWeek(_daysOfWeekValArr);
        } else if (name === 'tueThur') {
            let daysOfWeekByte = parseInt(daysOfWeek, 2);
            let daysOfWeekByteStr = '';
            if (value == 1) {
                daysOfWeekByteStr = this.orCalc(daysOfWeekByte, tueThurByte).toString(2);
            } else {
                daysOfWeekByteStr = (daysOfWeekByte - tueThurByte).toString(2);
            } if (daysOfWeekByteStr.length < 7) {
                daysOfWeekByteStr = daysOfWeekByteStr.padStart(7, '0');
            }
            daysOfWeekByteStr.split('').forEach((x, idx) => {
                _daysOfWeekValArr[idx] = parseInt(x);
            });
            this.setState({ isSelectTueThur: value });
            this.props.updateDaysOfWeek(_daysOfWeekValArr);
        }
    };
    render() {
        const { id, classes, daysOfWeekValArr, comDisabled } = this.props;
        const daysOfWeekDefault = this.getDaysOfWeekDefault();
        const settingArr = daysOfWeekDefault.split('');
        const { isSelectAll, isSelectMonWedFri, isSelectTueThur, isValid } = this.state;

        return (
            <Grid container>
                <CIMSFormLabel
                    fullWidth
                    labelText={<>Days of Week<RequiredIcon /></>}
                    className={classes.labelPadding}
                    error={!isValid}
                >
                    <Grid container>
                        <Grid item xs={5}>
                            <Grid container>
                                {
                                    settingArr.map((x, idx) => {
                                        if (x === '1') {
                                            return (
                                                <Grid item>
                                                    <FormControlLabel
                                                        className={classes.chbMargin}
                                                        control={
                                                            <CIMSCheckBox
                                                                id={`${id}_${weekdays[idx]}_chb`}
                                                                onChange={e => this.handleDaysChange(idx, e.target.checked ? 1 : 0)}
                                                                value={daysOfWeekValArr[idx]}
                                                            />
                                                        }
                                                        checked={daysOfWeekValArr[idx] === 1}// eslint-disable-line
                                                        label={weekdays[idx]}
                                                        disabled={comDisabled}
                                                    />
                                                </Grid>
                                            );
                                        } else { return null; }
                                    })
                                }
                            </Grid>
                        </Grid>
                        <Grid item>
                            <FormControlLabel
                                className={classes.chbMargin}
                                control={
                                    <CIMSCheckBox
                                        id={id + '_select_all_chb'}
                                        onChange={e => this.handleTypeChange('all', e.target.checked ? 1 : 0)}
                                        value={isSelectAll}
                                    />
                                }
                                checked={isSelectAll === 1}// eslint-disable-line
                                label={'Select All'}
                                disabled={comDisabled}
                            />
                        </Grid>
                        <Grid item>
                            <FormControlLabel
                                className={classes.chbMargin}
                                control={
                                    <CIMSCheckBox
                                        id={id + '_select_mon_wed_fir_chb'}
                                        onChange={e => this.handleTypeChange('monWedFri', e.target.checked ? 1 : 0)}
                                        value={isSelectMonWedFri}
                                    />
                                }
                                checked={isSelectMonWedFri === 1}// eslint-disable-line
                                label={'Select Mon, Wed, Fri'}
                                disabled={comDisabled}
                            />
                        </Grid>
                        <Grid item>
                            <FormControlLabel
                                className={classes.chbMargin}
                                control={
                                    <CIMSCheckBox
                                        id={id + '_select_tue_thur_chb'}
                                        onChange={e => this.handleTypeChange('tueThur', e.target.checked ? 1 : 0)}
                                        value={isSelectTueThur}
                                    />
                                }
                                checked={isSelectTueThur === 1}// eslint-disable-line
                                label={'Select Tue, Thur'}
                                disabled={comDisabled}
                            />
                        </Grid>
                    </Grid>
                </CIMSFormLabel>
                {
                    !isValid ?
                        <FormHelperText error id={id + '_errorMessage'} style={{ marginTop: 0 }}>
                            {this.getErrorMessage()}
                        </FormHelperText> : null
                }
            </Grid>
        );
    }
}

const mapState = (state) => {
    return ({
        svcCd: state.login.service.svcCd,
        siteId: state.login.clinic.siteId,
        siteParams: state.common.siteParams
    });
};

const dispatch = {};

export default connect(mapState, dispatch)(withStyles(styles)(DaysOfWeekPanel));