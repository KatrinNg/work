import React, { Component } from 'react';
import { KeyboardDatePicker } from '@material-ui/pickers';
import withStyles from '@material-ui/core/styles/withStyles';
import { MuiThemeProvider } from '@material-ui/core/styles';
import {
    Grid,
    createMuiTheme
} from '@material-ui/core';
import moment from 'moment';
import Enum from '../../enums/enum';

const styles = () => ({
    root: {
        width: '100%',
        display: 'flex',
        height: '100%',
        flexFlow: 'column'
    }
});

const cimsPickerTheme=(theme)=>createMuiTheme({
    ...theme,
    overrides:{
        ...theme.overrides,
        MuiPickersCalendarHeader:{
            iconButton:{
                backgroundColor:theme.palette.cimsBackgroundColor
            }
        }
    }
});

class CIMSDatePicker extends Component {
    constructor(props) {
        super(props);

        this.state = {
            format: this.props.format
        };
    }

    // eslint-disable-next-line
    handleChange = (date, value) => {
        this.props.onChange(date, value);
    }

    // eslint-disable-next-line no-unused-vars
    inputOnFocus = (e) => {
        let { format, onFocus, value } = this.props;
        let editFormat = format;
        if (format === Enum.DATE_FORMAT_EDMY_VALUE) {
            editFormat = Enum.DATE_FORMAT_FOCUS_DMY_VALUE;
        } else if (format === Enum.DATE_FORMAT_EMY_VALUE) {
            editFormat = Enum.DATE_FORMAT_FOCUS_MY_VALUE;
        }
        this.setState({ format: editFormat });
        onFocus && onFocus(value);
    }

    // eslint-disable-next-line no-unused-vars
    inputOnBlur = (e) => {
        const { format, onBlur, value } = this.props;
        // const { format, value, disableFuture, disablePast } = this.props;
        // const minDate = this.props.minDate || '1900-01-01';
        // const maxDate = this.props.maxDate || '2100-01-01';

        // if (e.target.value) {
        //     let targetValue = moment(e.target.value, this.state.format);
        //     if (targetValue.format(this.state.format) === 'Invalid date') {
        //         e.target.value = value ? moment(value).format(this.state.format) : moment().format(this.state.format);
        //     } else if ((disableFuture && targetValue.isAfter(moment())) || (disablePast && targetValue.isBefore(moment()))) {
        //         e.target.value = moment().format(this.state.format);
        //     } else if (minDate && targetValue < moment(minDate)) {
        //         e.target.value = moment(minDate).format(this.state.format);
        //     } else if (maxDate && targetValue > moment(maxDate)) {
        //         e.target.value = moment(maxDate).format(this.state.format);
        //     }
        // }

        // if (this.props.onChange) {
        //     this.props.onChange(e.target.value ? moment(e.target.value, this.state.format) : null);
        // }
        this.setState({ format });
        onBlur && onBlur(value);
    }

    render() {
        // eslint-disable-next-line
        const { classes, format, onChange, onBlur, onFocus, KeyboardButtonProps, ...rest } = this.props;//NOSONAR
        return (
            <MuiThemeProvider theme={cimsPickerTheme}>
            <Grid container className={classes.root}>
                <KeyboardDatePicker
                    fullWidth
                    onChange={this.handleChange}
                    format={this.state.format}
                    autoFocus={
                        (this.state.format === Enum.DATE_FORMAT_FOCUS_DMY_VALUE && format === Enum.DATE_FORMAT_EDMY_VALUE) ||
                        (this.state.format === Enum.DATE_FORMAT_FOCUS_MY_VALUE && format === Enum.DATE_FORMAT_EMY_VALUE)
                    }
                    openTo="date"
                    inputVariant="outlined"
                    // inputVariant="outlined"
                    placeholder={this.props.disabled ? '' : moment().format(this.state.format)}
                    onFocus={this.inputOnFocus}
                    onBlur={this.inputOnBlur}
                    KeyboardButtonProps={{
                        style: { padding: 2, position: 'absolute', right: 0 },
                        tabIndex: -1,
                        ...KeyboardButtonProps
                    }}
                    {...rest}
                />
            </Grid>
            </MuiThemeProvider>
        );
    }
}

CIMSDatePicker.defaultProps = {
    format: Enum.DATE_FORMAT_EDMY_VALUE,
    autoOk: true
};

export default withStyles(styles)(CIMSDatePicker);