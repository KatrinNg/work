import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';
import CIMSDatePicker from '../DatePicker/CIMSDatePicker';
import ArrowPopper from '../Popper/ArrowPopper';
import ValidatorComponent from './ValidatorComponent';
import Enum from '../../enums/enum';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import moment from 'moment';
import memoize from 'memoize-one';
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

const styles = theme => ({
    errorMessage: {
        color: theme.palette.errorColor,
        fontSize: '0.75rem'
    },
    warnMessage: {
        color: theme.palette.grey[700],
        fontSize: '0.75rem'
    }
});

class DateComponent extends ValidatorComponent {
    onFocus = (e) => {
        const { hideMessage, onFocus } = this.props;
        this.setState({ isFocus: true });
        if (hideMessage) {
            this.showMessage();
        }
        onFocus && onFocus(e);
    }

    onBlur = (e) => {
        const { hideMessage, validByBlur, warning, onBlur } = this.props;
        this.setState({ isFocus: false });
        if (hideMessage) {
            this.hideMessage();
        }
        onBlur && onBlur(e);
        setTimeout(() => {
            //when form is validating, cancel validate
            if (!this.context.form.getValidating()) {
                if (validByBlur) {
                    this.validateCurrent();
                }
                if (warning) {
                    this.checkWarning();
                }
            }
        }, 100);
    }

    onAccept = (e) => {
        const { onAccept, validByBlur, warning } = this.props;
        this.setState({ isFocus: false });
        onAccept && onAccept(e);
        setTimeout(() => {
            //when form is validating, cancel validate
            if (!this.context.form.getValidating()) {
                if (validByBlur) {
                    this.validateCurrent();
                }
                if (warning) {
                    this.checkWarning();
                }
            }
        }, 100);
    }

    getErrOrWarnMsg() {
        const { classes } = this.props;
        const { isValid, isWarn } = this.state;
        if (!isValid) {
            return <Typography className={classes.errorMessage}>{this.getErrorMessage && this.getErrorMessage()}</Typography>;
        }
        if (isWarn) {
            return <Typography className={classes.warnMessage}>{this.getWarningMessage && this.getWarningMessage()}</Typography>;
        }
        return null;
    }

    hideMessage = () => {
        this.setState({ hideMsg: true });
    }

    showMessage = () => {
        this.setState({ hideMsg: false });
    }

    focus() {
        this.inputRef && this.inputRef.focus();
    }

    render() {
        /* eslint-disable */
        const {
            classes, //NOSONAR
            errorMessages, //NOSONAR
            validators, //NOSONAR
            validatorListener, //NOSONAR
            withRequiredValidator, //NOSONAR
            warning,//NOSONAR
            warningMessages, //NOSONAR
            validByBlur, //NOSONAR
            isRequired, //NOSONAR
            notShowMsg, //NOSONAR
            error, //NOSONAR
            PopperProps, //NOSONAR
            onFocus, //NOSONAR
            onBlur, //NOSONAR
            onAccept, //NOSONAR
            portalContainer = this.gridRef, //NOSONAR
            hideMessage = false, //NOSONAR
            inputProps,
            ...rest //NOSONAR
        } = this.props;
        /* eslint-enable */

        const { isValid, isWarn, hideMsg } = this.state;
        const isPopperOpen = (!isValid || isWarn) && this.gridRef && !hideMsg ? true : false;
        return (
            <MuiThemeProvider theme={customTheme}>
                <Grid container ref={ref => this.gridRef = ref}>
                    <CIMSDatePicker
                        error={!isValid || error}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onAccept={this.onAccept}
                        inputProps={{
                            ...inputProps,
                            ref: r => this.inputRef = r
                        }}
                        {...rest}
                    />
                    {
                        !notShowMsg && portalContainer ?
                            <ArrowPopper
                                {...PopperProps}
                                id={this.props.id + '_arrowPopper'}
                                container={portalContainer}
                                open={isPopperOpen}
                                anchorEl={this.gridRef}
                                TransitionComponent={Fade}
                            >
                                {this.getErrOrWarnMsg()}
                            </ArrowPopper> : null
                    }
                </Grid>
            </MuiThemeProvider>
        );
    }
}

const DateComponentRender = withStyles(styles)(DateComponent);

const DateValidator = React.forwardRef((props, ref) => {
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
                _validators.push(value => !shouldDisableDate(value));
                if (shouldDisableDateMessage) {
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
        <DateComponentRender
            helperText=""
            validators={disabled ? [] : _validator._validators}
            errorMessages={disabled ? [] : _validator._errorMessages}
            ref={ref}
            {...rest}
        />
    );
});

DateValidator.propTypes = {
    minDate: PropTypes.string,
    minDateMessage: PropTypes.string,
    maxDate: PropTypes.string,
    maxDateMessage: PropTypes.string,
    disableFuture: PropTypes.bool,
    disableFutureMessage: PropTypes.string,
    disablePast: PropTypes.bool,
    disablePastMessage: PropTypes.string
};

DateValidator.defaultProps = {
    withRequiredValidator: false,
    errorMessages: [],
    validators: [],
    validatorListener: () => { },
    isRequired: false,
    notShowMsg: false,
    validByBlur: true,
    warning: [],
    warningMessages: '',
    minDate: '1900-01-01'
};

export default DateValidator;