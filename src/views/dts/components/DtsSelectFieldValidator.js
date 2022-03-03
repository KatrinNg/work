import React from 'react';
import PropTypes from 'prop-types';
import DtsSelect from './DtsSelect';
import { FormHelperText, Typography } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import ValidatorComponent from '../../../components/FormValidator/ValidatorComponent';

class SelectComponent extends ValidatorComponent {
    handleOnChange = (e, filterInput) => {
        this.validate(this.props.value);
        if (this.props.onChange) {
            if (this.props.moeFilter) {
                this.props.onChange(e, filterInput);
            } else {
                this.props.onChange(e);
            }
        }
    }

    render() {
        /* eslint-disable */
        const { errorMessages, validators, validatorListener, withRequiredValidator,//NOSONAR
            isRequired, labelText, labelPosition, labelProps, msgPosition,//NOSONAR
            notShowMsg, warning, warningMessages, validByBlur, msgNoWrap,//NOSONAR
            absoluteMessage, ...rest } = this.props;//NOSONAR
        /* eslint-enable */

        return (
            <Grid container direction={'column'} alignItems={'flex-start'} ref={ref => this.containerRef = ref}>
                {
                    (labelText && labelPosition === 'top') || (msgPosition === 'top' && !notShowMsg) ?
                        <Grid container item alignItems={'baseline'} spacing={labelPosition === 'top' ? 1 : 0} style={{ paddingBottom: 1 }} wrap={msgNoWrap ? 'nowrap' : 'wrap'}>
                            {
                                labelPosition === 'top' ?
                                    <Grid item {...labelProps}>
                                        {this.inputLabel(labelText, isRequired)}
                                    </Grid>
                                    : null
                            }
                            {
                                msgPosition === 'top' && !notShowMsg ?
                                    <Grid item xs>
                                        {this.errorMessage()}
                                    </Grid>
                                    : null
                            }
                        </Grid> : null
                }
                <Grid container item direction={'row'} alignItems={'center'} spacing={labelPosition === 'left' ? 1 : 0} wrap={'nowrap'}>
                    {
                        labelPosition === 'left' ?
                            <Grid component="div" item  {...labelProps}>
                                {this.inputLabel(labelText, isRequired)}
                            </Grid> : null
                    }
                    <Grid item style={{ width: '100%' }} id={'div_' + this.props.id}>
                        {this.selectElement(rest)}
                    </Grid>
                    {
                        msgPosition === 'right' && !notShowMsg ?
                            <Grid container item wrap={'nowrap'} xs={4} style={{ marginLeft: 10 }}>
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

    selectElement(props) {
        // eslint-disable-next-line
        const { onChange, selectClassName, ...rest } = props;//NOSONAR
        const { isValid } = this.state;
        return (
            <DtsSelect
                className={selectClassName}
                // innerRef={'input'}
                ref={ref => this.selectRef = ref}
                onChange={this.handleOnChange}
                isValid={isValid}
                {...rest}
            />
        );
    }

    focus = () => {
        this.selectRef.select.focus();
    }

    inputLabel(labelText, isRequired) {
        return (
            <Typography>
                <label style={{ fontWeight: 'bold' }}>
                    {labelText}
                    {isRequired ? <span style={{ color: 'red' }}>*</span> : null}
                </label>
            </Typography>
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
                {this.getErrorMessage()}
            </FormHelperText>
        );
    }
}

const DtsSelectFieldValidator = React.forwardRef((props, ref) => {
    const { validators, errorMessages, ...rest } = props;
    const { isDisabled } = props;
    return (
        <SelectComponent
            validators={isDisabled ? [] : validators}
            errorMessages={isDisabled ? [] : errorMessages}
            ref={ref}
            {...rest}
        />
    );
});

DtsSelectFieldValidator.propTypes = {
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

DtsSelectFieldValidator.defaultProps = {
    withRequiredValidator: false,
    errorMessages: [],
    validators: [],
    validatorListener: () => { },
    isRequired: false,
    labelText: '',
    notShowMsg: false,
    msgPosition: 'bottom',
    labelPosition: 'top',
    validByBlur: false,
    warning: [],
    warningMessages: '',
    labelProps: {},
    absoluteMessage: false
};

export default DtsSelectFieldValidator;