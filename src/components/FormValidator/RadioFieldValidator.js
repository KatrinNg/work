import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import ValidatorComponent from './ValidatorComponent';
import RequiredIcon from '../InputLabel/RequiredIcon';

const styles = theme => ({
    errorColor: {
        color: theme.palette.error.main
    }
});

class RadioFieldComponent extends ValidatorComponent {
    constructor(props) {
        super(props);
    }

    // tabPreId = '';
    // tabCurId = '';

    componentDidMount() {
        super.componentDidMount();
        // const radioGroup = document.getElementById(this.props.id + '_radioGroup');
        // this.radioList = radioGroup.getElementsByTagName('input') || [];
        // window.addEventListener('keydown', this.tabKeyDown);
        // window.addEventListener('keyup', this.tabKeyUp);
        window.addEventListener('keypress', this.keypressFn);
    }

    // tabKeyDown = (e) => {
    //     if (e.keyCode !== 9) return;
    //     this.tabPreId = e.target.id;
    // }
    // tabKeyUp = (e) => {
    //     if (e.keyCode !== 9) return;
    //     let tabCurIndex = -1;
    //     let tabPreIndex = -1;
    //     for (let i = 0; i < this.radioList.length; i++) {
    //         if (this.radioList[i].id === e.target.id) {
    //             tabCurIndex = i;
    //         }
    //         if (this.radioList[i].id === this.tabPreId) {
    //             tabPreIndex = i;
    //         }
    //     }
    //     if (tabCurIndex > -1 && tabPreIndex === -1) {
    //         this.tabCurId = this.radioList[0].id;
    //         this.radioList[0].focus();
    //     }
    //     if (tabPreIndex > -1 && tabPreIndex < this.radioList.length - 1) {
    //         this.tabCurId = this.radioList[tabPreIndex + 1].id;
    //         this.radioList[tabPreIndex + 1].focus();
    //     }
    // }
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
            isRequired,
            labelText,
            labelProps,
            labelPosition,
            msgPosition,
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
            <Grid container direction="column" alignItems="flex-start">
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
                    <Grid item style={{ width: '100%' }} id={'div_' + this.props.id}>
                        <RadioGroup
                            id={this.props.id + '_radioGroup'}
                            row
                            value={value}
                            onChange={e => onChange(e)}
                            {...RadioGroupProps}
                            className={`${RadioGroupProps && RadioGroupProps.className} ${isError ? this.props.classes.errorColor : null}`}
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
                                            />}
                                        {...FormControlLabelProps}
                                    />
                                )}
                        </RadioGroup>
                    </Grid>
                    {
                        msgPosition === 'right' && !notShowMsg ?
                            <Grid container item wrap="nowrap" alignItems="center" xs={4} style={{ marginLeft: -40 }}>
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

    inputLabel(labelText, isRequired) {
        return (
            <label style={{ fontWeight: 'bold' }}>
                {labelText}
                {isRequired ? <RequiredIcon /> : null}
            </label>
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

const RadioFieldComponentRender = withStyles(styles)(RadioFieldComponent);

const RadioFieldValidator = React.forwardRef((props, ref) => {
    const { validators, errorMessages, ...rest } = props;
    const { disabled } = props;
    return (
        <RadioFieldComponentRender
            validators={disabled ? [] : validators}
            errorMessages={disabled ? [] : errorMessages}
            innerRef={ref}
            {...rest}
        />
    );
});

RadioFieldValidator.propTypes = {
    labelPosition: PropTypes.oneOf(['top', 'left']),
    msgPosition: PropTypes.oneOf(['top', 'right', 'bottom'])
};

RadioFieldValidator.defaultProps = {
    errorMessages: 'error',
    validators: [],
    validatorListener: () => { },
    isRequired: false,
    labelText: '',
    labelPosition: 'top',
    msgPosition: 'bottom',
    notShowMsg: false,
    absoluteMessage: false
};

export default RadioFieldValidator;