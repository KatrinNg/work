import React from 'react';
import PropTypes from 'prop-types';
import ValidatorComponent from './ValidatorComponent';
import {
    FormHelperText,
    Grid
} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import CIMSDatePicker from '../DatePicker/CIMSDatePicker';
import moment from 'moment';
import memoize from 'memoize-one';
import Enum from '../../enums/enum';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import _ from 'lodash';

const customTheme = (theme) => createMuiTheme({
    ...theme,
    overrides: {
        ...theme.overrides,
        MuiInputBase: {
            ...theme.overrides.MuiInputBase,
            input: {
                height: 39 * theme.palette.unit,
                width: '100%',
                textOverflow: 'ellipsis',
                padding: '0px 14px'
            }
        },
        MuiButton: {
            ...theme.overrides.MuiButton,
            root: {
                height: 'auto'
            }
        }
    }
});

class DateComponent extends ValidatorComponent {
    onFocus = (e) => {
        this.setState({ isFocus: true });
        this.props.onFocus && this.props.onFocus(e);
    }

    onBlur = (e) => {
        this.setState({ isFocus: false });
        this.props.onBlur && this.props.onBlur(e);
        setTimeout(() => {
            //when form is validating, cancel validate
            if (!this.context.form.getValidating()) {
                if (this.props.validByBlur) {
                    this.validateCurrent();
                }
                if (this.props.warning) {
                    this.checkWarning();
                }
            }
        }, 100);
    }

    onAccept = (e) => {
        this.setState({ isFocus: false });
        this.props.onAccept && this.props.onAccept(e);
        setTimeout(() => {
            //when form is validating, cancel validate
            if (!this.context.form.getValidating()) {
                if (this.props.validByBlur) {
                    this.validateCurrent();
                }
                if (this.props.warning) {
                    this.checkWarning();
                }
            }
        }, 100);
    }

    focus() {
        this.inputRef && this.inputRef.focus();
    }

    render() {
        /* eslint-disable */
        const { errorMessages, validators, validatorListener, withRequiredValidator, warning,//NOSONAR
            warningMessages, validByBlur, isRequired, labelText, labelPosition, labelProps,//NOSONAR
            msgPosition, notShowMsg, isSmallSize, absoluteMessage, ...rest } = this.props;//NOSONAR
        /* eslint-enable */

        return (
            <MuiThemeProvider theme={customTheme}>
                <Grid container direction="column" alignItems="flex-start" ref={ref => this.containerRef = ref}>
                    {
                        (labelText && labelPosition === 'top') || (msgPosition === 'top' && !notShowMsg) ?
                            <Grid container item alignItems="baseline" spacing={labelPosition === 'top' ? 1 : 0} style={{ paddingBottom: 1 }}>
                                {
                                    labelPosition === 'top' ?
                                        <Grid item {...labelProps}>
                                            {this.inputLabel(labelText, isRequired, isSmallSize)}
                                        </Grid>
                                        : null
                                }
                                {
                                    msgPosition === 'top' && !notShowMsg ?
                                        <Grid item>
                                            {this.errorMessage()}
                                        </Grid>
                                        : null
                                }
                            </Grid> : null
                    }
                    <Grid container item direction="row" alignItems="center" spacing={labelPosition === 'left' ? 1 : 0} wrap="nowrap">
                        {
                            labelPosition === 'left' ?
                                <Grid item {...labelProps}>
                                    {this.inputLabel(labelText, isRequired, isSmallSize)}
                                </Grid> : null
                        }
                        <Grid item style={{ width: '100%' }}>
                            {this.dateElement(rest)}
                        </Grid>
                        {
                            msgPosition === 'right' && !notShowMsg ?
                                <Grid container item wrap="nowrap" xs={4} style={{ marginLeft: 10 }}>
                                    {this.errorMessage()}
                                </Grid>
                                : null
                        }
                    </Grid>
                    {
                        msgPosition === 'bottom' && !notShowMsg ?
                            <Grid item>
                                {this.errorMessage()}
                            </Grid>
                            : null
                    }
                </Grid>
            </MuiThemeProvider>
        );
    }

    dateElement(params) {
        // eslint-disable-next-line
        const { error, onFocus, onBlur, onAccept, inputProps, ...rest } = params;//NOSONAR
        return (
            <CIMSDatePicker
                error={!this.state.isValid || error}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onAccept={this.onAccept}
                inputProps={{
                    ...inputProps,
                    ref: r => this.inputRef = r
                }}
                {...rest}
            />
        );
    }

    inputLabel(labelText, isRequired, isSmallSize) {
        return (
            labelText ?
                isSmallSize ?
                    <Typography style={{ fontWeight: 'bold' }}>
                        {labelText}
                        {isRequired ? <span style={{ color: 'red' }}>*</span> : null}
                    </Typography>
                    :
                    <label style={{ fontWeight: 'bold' }}>
                        {labelText}
                        {isRequired ? <span style={{ color: 'red' }}>*</span> : null}
                    </label>
                : null
        );
    }

    errorMessage() {
        const { isValid } = this.state;
        const { absoluteMessage } = this.props;
        const id = this.props.id ? this.props.id + '_helperText' : null;
        const width = this.containerRef && (this.containerRef.clientWidth - 4);
        if (isValid) {
            return null;
        }

        return (
            <FormHelperText
                error
                style={{
                    marginTop: 0,
                    position: absoluteMessage ? 'absolute' : 'relative',
                    width: width
                }}
                id={id}
            >
                {this.getErrorMessage && this.getErrorMessage()}
            </FormHelperText>
        );
    }
}

const DateFieldValidator = React.forwardRef((props, ref) => {
    // Added ignorePresetValidators prop to prevent adding validators when some case need to disable all validators.
    const filterValidator = memoize((
        ignorePresetValidators,
        validators,
        errorMessages,
        maxDate,
        maxDateMessage,
        minDate,
        minDateMessage,
        disableFuture,
        disableFutureMessage,
        disablePast,
        disablePastMessage,
        isRequired,
        shouldDisableDate,
        shouldDisableDateMessage
    ) => {
        let _validators = _.cloneDeep(validators);
        let _errorMessages = _.cloneDeep(errorMessages);
        if (!ignorePresetValidators) {
            if (isRequired) {
                _validators.push(ValidatorEnum.required);
                _errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
            }
            _validators.push(ValidatorEnum.isRightMoment);
            _errorMessages.push(CommonMessage.VALIDATION_NOTE_INVALID_MOMENT());
            if (maxDate) {
                _validators.push(ValidatorEnum.maxDate(moment(maxDate).format(Enum.DATE_FORMAT_EYMD_VALUE)));
                if (maxDateMessage) {
                    _errorMessages.push(maxDateMessage);
                } else {
                    _errorMessages.push(CommonMessage.VALIDATION_NOTE_MAX_DATE(moment(maxDate).format(Enum.DATE_FORMAT_EDMY_VALUE)));
                }
            }
            if (minDate) {
                _validators.push(ValidatorEnum.minDate(moment(minDate).format(Enum.DATE_FORMAT_EYMD_VALUE)));
                if (minDateMessage) {
                    _errorMessages.push(minDateMessage);
                } else {
                    _errorMessages.push(CommonMessage.VALIDATION_NOTE_MIN_DATE(moment(minDate).format(Enum.DATE_FORMAT_EDMY_VALUE)));
                }
            }
            if (disableFuture) {
                _validators.push(ValidatorEnum.maxDate(moment().format(Enum.DATE_FORMAT_EYMD_VALUE)));
                if (disableFutureMessage) {
                    _errorMessages.push(disableFutureMessage);
                } else {
                    _errorMessages.push(CommonMessage.VALIDATION_NOTE_DISABLE_FUTURE());
                }
            }
            if (disablePast) {
                _validators.push(ValidatorEnum.minDate(moment().format(Enum.DATE_FORMAT_EYMD_VALUE)));
                if (disablePastMessage) {
                    _errorMessages.push(disablePastMessage);
                } else {
                    _errorMessages.push(CommonMessage.VALIDATION_NOTE_DISABLE_PAST());
                }
            }
            if (shouldDisableDate) {
                const disabledFunc = memoize(value => !shouldDisableDate(value));
                _validators.push(disabledFunc);
                if(shouldDisableDateMessage) {
                    _errorMessages.push(shouldDisableDateMessage);
                } else {
                    _errorMessages.push(CommonMessage.VALIDATION_NOTE_DATE_DISABLED_DATE());
                }
            }
        }
        return { _validators, _errorMessages };
    });

    const { ignorePresetValidators, validators, errorMessages, maxDateMessage, minDateMessage, disableFutureMessage, disablePastMessage, shouldDisableDateMessage, ...rest } = props;
    const { maxDate, minDate, disableFuture, disablePast, isRequired, disabled, shouldDisableDate } = props;
    let _validator = filterValidator(
        ignorePresetValidators,
        validators,
        errorMessages,
        maxDate,
        maxDateMessage,
        minDate,
        minDateMessage,
        disableFuture,
        disableFutureMessage,
        disablePast,
        disablePastMessage,
        isRequired,
        shouldDisableDate,
        shouldDisableDateMessage
    );
    return (
        <DateComponent
            helperText=""
            validators={disabled ? [] : _validator._validators}
            errorMessages={disabled ? [] : _validator._errorMessages}
            ref={ref}
            {...rest}
        />
    );
});

DateFieldValidator.propTypes = {
    minDate: PropTypes.string,
    minDateMessage: PropTypes.string,
    maxDate: PropTypes.string,
    maxDateMessage: PropTypes.string,
    disableFuture: PropTypes.bool,
    disableFutureMessage: PropTypes.string,
    disablePast: PropTypes.bool,
    disablePastMessage: PropTypes.string
};

DateFieldValidator.defaultProps = {
    withRequiredValidator: false,
    errorMessages: [],
    validators: [],
    validatorListener: () => { },
    isRequired: false,
    labelText: '',
    notShowMsg: false,
    msgPosition: 'bottom',
    labelPosition: 'top',
    validByBlur: true,
    warning: [],
    warningMessages: '',
    labelProps: {},
    minDate: '1900-01-01',
    absoluteMessage: false
};

export default DateFieldValidator;