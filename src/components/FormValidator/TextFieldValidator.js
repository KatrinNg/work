import React from 'react';
import PropTypes from 'prop-types';
import CIMSTextField from '../TextField/CIMSTextField';
import Typography from '@material-ui/core/Typography';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import ValidatorComponent from './ValidatorComponent';
import RequiredIcon from '../InputLabel/RequiredIcon';

class TextFieldComponent extends ValidatorComponent {
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

    focus() {
        this.inputRef && this.inputRef.focus();
    }

    render() {
        /* eslint-disable */
        const { errorMessages, validators, withRequiredValidator, validatorListener, validByBlur,//NOSONAR
            onFocus, onBlur, warning, warningMessages, isRequired, labelText, labelProps,//NOSONAR
            labelPosition, msgPosition, notShowMsg, error, isSmallSize, absoluteMessage, ...rest } = this.props;//NOSONAR
        /* eslint-enable */

        return (
            <Grid container direction="column" alignItems="flex-start">
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
                    <Grid
                        item
                        style={{ width: '100%' }}
                        id={'div_' + this.props.id}
                        ref={r => this.gridRef = r}
                    >
                        <CIMSTextField
                            error={!this.state.isValid || error}
                            ref={r => { this.input = r; }}
                            inputRef={r => this.inputRef = r}
                            onFocus={this.onFocus}
                            onBlur={this.onBlur}
                            {...rest}
                        />
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
        );
    }

    inputLabel(labelText, isRequired, isSmallSize) {
        return (
            isSmallSize ?
                <Typography style={{ fontWeight: 'bold' }}>
                    {labelText}
                    {isRequired ? <RequiredIcon /> : null}
                </Typography>
                :
                <Typography>
                    <label style={{ fontWeight: 'bold' }}>
                        {labelText}
                        {isRequired ? <RequiredIcon /> : null}
                    </label>
                </Typography>
        );
    }

    errorMessage() {
        const { isValid, isWarn } = this.state;
        const { absoluteMessage, messageWidth } = this.props;
        const id = this.props.id ? this.props.id + '_helperText' : null;
        if (!this.width) {
            this.width = this.gridRef && (this.gridRef.offsetWidth - 4);
        }
        if (!isValid) {
            return (
                <FormHelperText
                    error
                    style={{
                        marginTop: 0,
                        position: absoluteMessage ? 'absolute' : 'relative',
                        width: messageWidth ? messageWidth : this.width
                    }}
                    id={id}
                >
                    {this.getErrorMessage && this.getErrorMessage()}
                </FormHelperText>
            );
        }
        if (isWarn) {
            return (
                <FormHelperText
                    style={{
                        marginTop: 0,
                        position: absoluteMessage ? 'absolute' : 'relative',
                        color: '#6E6E6E',
                        padding: '2px 14px',
                        width: this.width
                    }}
                    id={id}
                >
                    {this.getWarningMessage && this.getWarningMessage()}
                </FormHelperText>
            );
        }
        return null;
    }
}

const TextFieldValidator = React.forwardRef((props, ref) => {
    const { validators, errorMessages, ...rest } = props;
    const { disabled } = props;
    return (
        <TextFieldComponent
            validators={disabled ? [] : validators}
            errorMessages={disabled ? [] : errorMessages}
            ref={ref}
            {...rest}
        />
    );
});

TextFieldValidator.propTypes = {
    errorMessages: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.string
    ]),
    validators: PropTypes.array,
    value: PropTypes.any,
    validatorListener: PropTypes.func,
    withRequiredValidator: PropTypes.bool,
    validByBlur: PropTypes.bool
};

TextFieldValidator.defaultProps = {
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


export default TextFieldValidator;