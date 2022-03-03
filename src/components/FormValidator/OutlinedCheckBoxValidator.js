import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import ValidatorComponent from './ValidatorComponent';
import RequiredIcon from '../InputLabel/RequiredIcon';

const styles = theme => ({
    errorColor: {},
    disabled: {},
    formLabel: {
        transform: 'translate(14px, -6px) scale(0.75)',
        top: 0,
        left: '-10px',
        position: 'absolute',
        backgroundColor: 'white',
        paddingLeft: '6px',
        paddingRight: '6px',
        '&$disabled': {
            color: theme.palette.text.disabled,
            borderColor: theme.palette.action.disabled
        },
        '&$errorColor': {
            color: theme.palette.error.main,
            borderColor: theme.palette.error.main
        }
    },
    formGroup: {
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: 'rgba(0, 0, 0, 0.23)',
        height: 39 * theme.palette.unit - 2,
        borderRadius: '4px',
        display: 'flex',
        paddingLeft: '14px',
        justifyContent: 'space-around',
        '&$disabled': {
            color: theme.palette.text.disabled,
            borderColor: theme.palette.action.disabled
        },
        '&$errorColor': {
            borderColor: theme.palette.error.main
        }
    },
    checkbox: {
        padding: theme.spacing(1) / 2
    }
});

class OutlinedCheckBoxComponent extends ValidatorComponent {

    focus() {
        this.inputRef0 && this.inputRef0.focus();
    }

    render() {
        const {
            classes,
            isRequired,
            labelText,
            labelProps,
            notShowMsg,
            FormGroupProps,
            disabled,
            value,
            onChange,
            error,
            FormControlLabelProps,
            CheckBoxProps,
            list
        } = this.props;

        const isError = !this.state.isValid || error;
        return (
            <Grid container>
                <FormControl fullWidth>
                    <FormLabel
                        {...labelProps}
                        className={classNames({
                            [classes.errorColor]: isError,
                            [classes.disabled]: disabled,
                            [classes.formLabel]: true
                        }, labelProps && labelProps.className)}
                    >{labelText}{isRequired ? <RequiredIcon /> : null}
                    </FormLabel>
                    <FormGroup
                        id={this.props.id + '_formGroup'}
                        row
                        {...FormGroupProps}
                        className={classNames({
                            [classes.errorColor]: isError,
                            [classes.disabled]: disabled,
                            [classes.formGroup]: true
                        }, FormGroupProps && FormGroupProps.className)}
                    >
                        {
                            list && list.map((item, index) =>
                                <FormControlLabel
                                    id={this.props.id + '_' + item.value + '_checkboxLabel'}
                                    key={index}
                                    name={item.value}
                                    value={item.value}
                                    // disabled={disabled||item.spec==='disable'}
                                    disabled={disabled}
                                    label={item.label}
                                    labelPlacement="end"
                                    checked={value.indexOf(item.value) > -1}
                                    onChange={e => {
                                        const groupDom = document.getElementById(this.props.id + '_formGroup');
                                        const cbList = groupDom && groupDom.getElementsByTagName('input');
                                        onChange(e, cbList);
                                    }}
                                    control={
                                        <Checkbox
                                            id={this.props.id + '_' + item.value + '_checkbox'}
                                            color="primary"
                                            {...CheckBoxProps}
                                            inputRef={r => this[`inputRef${index}`] = r}
                                            className={classNames(classes.checkbox, CheckBoxProps && CheckBoxProps.className)}
                                        />}
                                    {...FormControlLabelProps}
                                />
                            )}
                    </FormGroup>
                </FormControl>
                {
                    !notShowMsg ? <Grid item container>{this.errorMessage()}</Grid> : null
                }
            </Grid>
        );
    }

    errorMessage() {
        const { isValid } = this.state;
        const { absoluteMessage } = this.props;
        const id = this.props.id ? this.props.id + '_helperText' : null;
        if (isValid) {
            return null;
        } else {
            return (
                <FormHelperText
                    error
                    style={{
                        marginTop: 0,
                        position: absoluteMessage ? 'absolute' : 'relative'
                    }}
                    id={id}
                >
                    {this.getErrorMessage && this.getErrorMessage()}
                </FormHelperText>
            );
        }
    }
}

const OutlinedCheckBoxComponentRender = withStyles(styles)(OutlinedCheckBoxComponent);

const OutlinedCheckBoxValidator = React.forwardRef((props, ref) => {
    const { validators, errorMessages, ...rest } = props;
    const { disabled } = props;
    return (
        <OutlinedCheckBoxComponentRender
            validators={disabled ? [] : validators}
            errorMessages={disabled ? [] : errorMessages}
            innerRef={ref}
            {...rest}
        />
    );
});

OutlinedCheckBoxValidator.propTypes = {
    labelPosition: PropTypes.oneOf(['top', 'left']),
    msgPosition: PropTypes.oneOf(['top', 'right', 'bottom'])
};

OutlinedCheckBoxValidator.defaultProps = {
    errorMessages: 'error',
    validators: [],
    validatorListener: () => { },
    isRequired: false,
    labelText: '',
    notShowMsg: false,
    labelProps: {},
    FormGroupProps: {},
    CheckBoxProps: {},
    FormControlLabelProps: {},
    absoluteMessage: false
};

export default OutlinedCheckBoxValidator;