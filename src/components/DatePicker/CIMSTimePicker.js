import React, { Component } from 'react';
import { KeyboardTimePicker } from '@material-ui/pickers';
import withStyles from '@material-ui/core/styles/withStyles';
import {
    Grid
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

class CIMSTimePicker extends Component {

    // eslint-disable-next-line
    handleChange = (date, value) => {
        this.props.onChange(date);
    }

    inputOnFocus = (e) => {
        let { onFocus, value } = this.props;
        onFocus && onFocus(value);
    }

    inputOnBlur = (e) => {
        const { onBlur, value } = this.props;
        onBlur && onBlur(value);
    }

    render() {
        // eslint-disable-next-line
        const { classes, onChange, onBlur, onFocus, KeyboardButtonProps, ...rest } = this.props;//NOSONAR
        return (
            <Grid container className={classes.root}>
                <KeyboardTimePicker
                    fullWidth
                    ampm={false}
                    style={{ width: 'inherit' }}
                    onFocus={this.inputOnFocus}
                    onBlur={this.inputOnBlur}
                    inputVariant="outlined"
                    // inputVariant="outlined"
                    placeholder={this.props.disabled ? '' : moment().format(Enum.TIME_FORMAT_24_HOUR_CLOCK)}
                    onChange={this.handleChange}
                    KeyboardButtonProps={{
                        style: { padding: 2, position: 'absolute', right: 0 },
                        ...KeyboardButtonProps
                    }}
                    {...rest}
                />
            </Grid>
        );
    }
}

export default withStyles(styles)(CIMSTimePicker);