import React from 'react';
import ValidatorComponent from './ValidatorComponent';
import {
    FormHelperText,
    Grid
} from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import * as commonUtilities from '../../utilities/commonUtilities';
import memoize from 'memoize-one';
import _ from 'lodash';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import CIMSTimePicker from '../DatePicker/CIMSTimePicker';

const sysRatio = commonUtilities.getSystemRatio();
const unit = commonUtilities.getResizeUnit(sysRatio);


const customTheme = (theme) => createMuiTheme({
    ...theme,
    overrides: {
        ...theme.overrides,
        MuiInputBase: {
            ...theme.overrides.MuiInputBase,
            input: {
                height: 39 * unit,
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

class TimeComponent extends ValidatorComponent {

    // eslint-disable-next-line
    handleChange = (date, value) => {
        if (this.props.onChange) {
            this.props.onChange(date);
        }
    }

    onFocus = (e) => {
        const { onFocus } = this.props;
        this.setState({ isFocus: true });
        onFocus && onFocus(e);
    }

    onBlur = (e) => {
        const { onBlur, validByBlur, warning } = this.props;
        this.setState({ isFocus: false });
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

    render() {
        /* eslint-disable */
        const { errorMessages, validators, withRequiredValidator, validatorListener, warning,//NOSONAR
            warningMessages, validByBlur, isRequired, labelText, labelPosition, labelProps,//NOSONAR
            msgPosition, notShowMsg, isValid, absoluteMessage, ...rest } = this.props;//NOSONAR
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
                                            {this.inputLabel(labelText, isRequired)}
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
                                    {this.inputLabel(labelText, isRequired)}
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

    focus() {
        this.inputRef && this.inputRef.focus();
    }

    dateElement(inputProps) {
        // eslint-disable-next-line
        const { error, onFocus, onBlur, onAccept, ...rest } = inputProps;//NOSONAR
        return (
            <CIMSTimePicker
                error={!this.state.isValid || error}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onAccept={this.onAccept}
                inputRef={r => this.inputRef = r}
                {...rest}
            />
        );
    }

    inputLabel(labelText, isRequired) {
        return (
            labelText ?
                <label style={{ fontWeight: 'bold' }}>
                    {labelText}
                    {isRequired ? <span style={{ color: 'red' }}>*</span> : null}
                </label>
                :
                null
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

const TimeFieldValidator = React.forwardRef((props, ref) => {
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
        <TimeComponent
            helperText=""
            validators={disabled ? [] : _validator._validators}
            errorMessages={disabled ? [] : _validator._errorMessages}
            ref={ref}
            {...rest}
        />
    );
});

TimeFieldValidator.defaultProps = {
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
    absoluteMessage: false
};


export default TimeFieldValidator;