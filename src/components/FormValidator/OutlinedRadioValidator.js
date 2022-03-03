import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import classNames from 'classnames';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
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
        backgroundColor: theme.palette.cimsBackgroundColor,
        paddingLeft: '6px',
        paddingRight: '6px',
        '&$disabled': {
            color: theme.palette.cimsPlaceholderColor,
            borderColor: theme.palette.action.disabled
        },
        '&$errorColor': {
            color: theme.palette.error.main,
            borderColor: theme.palette.error.main
        }
    },
    radioGroup: {
        borderStyle: 'solid',
        borderWidth: '1px',
        borderColor: 'rgba(0, 0, 0, 0.23)',
        height: 39 * theme.palette.unit - 2,
        borderRadius: '4px',
        display: 'flex',
        paddingLeft: '14px',
        justifyContent: 'space-around',
        backgroundColor: theme.palette.cimsBackgroundColor,
        '&$disabled': {
            color: theme.palette.text.disabled,
            borderColor: theme.palette.action.disabled,
            backgroundColor: theme.palette.cimsDisableColor
        },
        '&$errorColor': {
            borderColor: theme.palette.error.main
        }
    },
    radio: {
        padding: theme.spacing(1) / 2
    }
});

class OutlinedRadioComponent extends ValidatorComponent {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        super.componentDidMount();
        window.addEventListener('keypress', this.keypressFn);
    }

    keypressFn = (e) => {
        if (e.keyCode === 13 && (e.code === 'Enter' || e.code === 'NumpadEnter')) {
            let { onEnter, value } = this.props;
            if (value == e.target.value) {
                if (onEnter) {
                    onEnter();
                }
            } else {
                e.target.click();
            }
        }
    }

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
            RadioGroupProps,
            disabled,
            value,
            name,
            onChange,
            error,
            FormControlLabelProps,
            RadioProps,
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
                    <RadioGroup
                        id={this.props.id + '_radioGroup'}
                        row
                        value={value}
                        onChange={e => onChange(e)}
                        {...RadioGroupProps}
                        className={classNames({
                            [classes.errorColor]: isError,
                            [classes.disabled]: disabled,
                            [classes.radioGroup]: true
                        }, RadioGroupProps && RadioGroupProps.className)}
                    >
                        {
                            list && list.map((item, index) =>
                                <FormControlLabel
                                    id={this.props.id + '_' + item.value + '_radioLabel'}
                                    key={index}
                                    value={item.value}
                                    disabled={disabled}
                                    label={item.label}
                                    labelPlacement="end"
                                    name={`${name}${item.value}`}
                                    control={
                                        <Radio
                                            id={this.props.id + '_' + item.value + '_radio'}
                                            color="primary"
                                            {...RadioProps}
                                            inputRef={r => this[`inputRef${index}`] = r}
                                            className={classNames(classes.radio, RadioProps && RadioProps.className)}
                                        />}
                                    {...FormControlLabelProps}
                                />
                            )}
                    </RadioGroup>
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

const OutlinedRadioComponentRender = withStyles(styles)(OutlinedRadioComponent);

const OutlinedRadioValidator = React.forwardRef((props, ref) => {
    const { validators, errorMessages, ...rest } = props;
    const { disabled } = props;
    return (
        <OutlinedRadioComponentRender
            validators={disabled ? [] : validators}
            errorMessages={disabled ? [] : errorMessages}
            innerRef={ref}
            {...rest}
        />
    );
});

OutlinedRadioValidator.propTypes = {
    labelPosition: PropTypes.oneOf(['top', 'left']),
    msgPosition: PropTypes.oneOf(['top', 'right', 'bottom']),
    id: PropTypes.string.isRequired
};

OutlinedRadioValidator.defaultProps = {
    errorMessages: 'error',
    validators: [],
    validatorListener: () => { },
    isRequired: false,
    labelText: '',
    notShowMsg: false,
    labelProps: {},
    RadioGroupProps: {},
    RadioProps: {},
    FormControlLabelProps: {},
    absoluteMessage: false
};

export default OutlinedRadioValidator;