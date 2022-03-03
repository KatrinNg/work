import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Fade from '@material-ui/core/Fade';
import CIMSTimePicker from '../DatePicker/CIMSTimePicker';
import ArrowPopper from '../Popper/ArrowPopper';
import ValidatorComponent from './ValidatorComponent';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
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

class TimeComponent extends ValidatorComponent {
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
            ...rest //NOSONAR
        } = this.props;
        /* eslint-enable */

        const { isValid, isWarn, hideMsg } = this.state;
        const isPopperOpen = (!isValid || isWarn) && this.gridRef && !hideMsg ? true : false;
        return (
            <MuiThemeProvider theme={customTheme}>
                <Grid container ref={ref => this.gridRef = ref}>
                    <CIMSTimePicker
                        error={!isValid || error}
                        onFocus={this.onFocus}
                        onBlur={this.onBlur}
                        onAccept={this.onAccept}
                        inputRef={r => this.inputRef = r}
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

const TimeComponentRender = withStyles(styles)(TimeComponent);

const TimeValidator = React.forwardRef((props, ref) => {
    const filterValidator = memoize((
        validators,
        errorMessages,
        isRequired
    ) => {
        let _validators = _.cloneDeep(validators);
        let _errorMessages = _.cloneDeep(errorMessages);
        if (isRequired) {
            _validators.push(ValidatorEnum.required);
            _errorMessages.push(CommonMessage.VALIDATION_NOTE_REQUIRED());
        }
        _validators.push(ValidatorEnum.isRightMoment);
        _errorMessages.push(CommonMessage.VALIDATION_NOTE_INVALID_MOMENT());
        return { _validators, _errorMessages };
    });

    const { validators, errorMessages, ...rest } = props;
    const { isRequired, disabled } = props;
    let _validator = filterValidator(
        validators,
        errorMessages,
        isRequired
    );
    return (
        <TimeComponentRender
            helperText=""
            validators={disabled ? [] : _validator._validators}
            errorMessages={disabled ? [] : _validator._errorMessages}
            ref={ref}
            {...rest}
        />
    );
});

TimeValidator.propTypes = {
    minDate: PropTypes.string,
    minDateMessage: PropTypes.string,
    maxDate: PropTypes.string,
    maxDateMessage: PropTypes.string,
    disableFuture: PropTypes.bool,
    disableFutureMessage: PropTypes.string,
    disablePast: PropTypes.bool,
    disablePastMessage: PropTypes.string
};

TimeValidator.defaultProps = {
    withRequiredValidator: false,
    errorMessages: [],
    validators: [],
    validatorListener: () => { },
    isRequired: false,
    notShowMsg: false,
    validByBlur: true,
    warning: [],
    warningMessages: ''
};

export default TimeValidator;