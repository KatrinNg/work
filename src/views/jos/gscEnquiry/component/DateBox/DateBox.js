import React, { Component } from 'react';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { withStyles, FormHelperText } from '@material-ui/core';
import { styles } from './DateBoxStyle';
import { MIN_DATE, MAX_DATE } from '../../../../../constants/common/commonConstants';
import Enum from '../../../../../../src/enums/enum';

const customTheme = (theme) => createMuiTheme({
    ...theme,
    overrides: {
        ...theme.overrides,
        MuiPickersTimePickerToolbar: {
            ...theme.overrides.MuiPickersTimePickerToolbar,
            hourMinuteLabel: {
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'flex-end'
            }
        }
    }
});

class DateBox extends Component {
    constructor(props) {
        super(props);
        let { value = null, format } = props;
        this.state = {
            value: value,
            format: format
        };
    }

    // UNSAFE_componentWillReceiveProps(nextProps) {
    //   if (nextProps.value !== this.state.value) {
    //     this.setState({
    //       value: nextProps.value,
    //       error: nextProps.error
    //     });
    //   }
    // }

    handleChange = (moment) => {
        let { attrName, onChange = null, formItemId = null, updateState } = this.props;
        if (onChange) {
            onChange(moment, formItemId, attrName);
        } else {
            updateState && updateState({
                [attrName]: moment ? moment.toDate() : null,
                [`${attrName}ErrorFlag`]: moment === null ? false : !moment.isValid()
            });
        }
    };

    inputOnFocus = () => {
        let editFormat = this.props.format;
        if (this.props.format === Enum.DATE_FORMAT_EDMY_VALUE) {
            editFormat = Enum.DATE_FORMAT_DMY;
        }
        this.setState({ format: editFormat });
    };

    inputOnBlur = (event) => {
        const { format, attrName, handleBlur } = this.props;
        this.setState({ format });
        handleBlur && handleBlur(event, attrName);
    };

    render() {
        const {
            classes, format, value = null, errorFlag = false, itemId = '',
            editMode = false, onAccept = null, helperText = null,
            maxDate, minDate, maxDateMessage, minDateMessage, ...rest
        } = this.props;
        delete rest.handleBlur;
        return (
            <MuiThemeProvider theme={customTheme}>
                <div className={classes.wrapper}>
                    <KeyboardDatePicker
                        style={{ whiteSpace: 'pre' }}
                        id={`date_${itemId}`}
                        autoFocus={this.state.format === Enum.DATE_FORMAT_FOCUS_DMY_VALUE && format === Enum.DATE_FORMAT_EDMY_VALUE}
                        onChange={this.handleChange}
                        value={value}
                        onFocus={this.inputOnFocus}
                        onBlur={this.inputOnBlur}
                        onAccept={onAccept}
                        inputVariant="outlined"
                        autoOk
                        format={this.state.format}
                        error={errorFlag}
                        minDate={minDate ? minDate : new Date(MIN_DATE)}
                        maxDate={maxDate ? maxDate : new Date(MAX_DATE)}
                        invalidDateMessage="Invalid Date"
                        FormHelperTextProps={{
                            className: classes.helperTextError
                        }}
                        disabled={editMode}
                        maxDateMessage={maxDateMessage === '' || maxDateMessage ? maxDateMessage : 'Date should not be after maximal date'}
                        minDateMessage={minDateMessage === '' || minDateMessage ? minDateMessage : 'Date should not be before minimal date'}
                    />
                    {helperText ? (
                        <FormHelperText error classes={{ error: classes.helperTextError }}>
                            {helperText}
                        </FormHelperText>
                    ) : null}
                </div>
            </MuiThemeProvider>
        );
    }
}

export default withStyles(styles)(DateBox);
