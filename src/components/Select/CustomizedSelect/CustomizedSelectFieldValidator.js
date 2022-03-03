import React from 'react';
//import PropTypes from 'prop-types';
import CustomizedSelect from './CustomizedSelect';
import { FormHelperText } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import ValidatorComponent from '../../FormValidator/ValidatorComponent';
import { ErrorOutline } from '@material-ui/icons';

class CustomizedSelectFieldValidator extends ValidatorComponent {
    // static defaultState = {
    //     isValid: true,
    //     errorMessages: [],
    //     validators: [],
    //     validatorListener: () => { }
    // };

    // constructor(props) {
    //     super(props);

    //     this.state = {
    //         ...SelectFieldValidator.defaultState,
    //         ...this.props
    //     };
    // }

    handleOnChange = (e) => {
        this.validate(this.props.value);
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    render() {
        const {
            errorMessages,
            validators,
            validatorListener,
            isRequired,
            labelText,
            labelPosition,
            labelProps,
            msgPosition,
            notShowMsg,
            validByBlur,
            msgNoWrap,
            ...rest } = this.props;

        return (
            <Grid container direction={'column'} alignItems={'flex-start'}>
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
                </Grid>
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
        const { onChange, selectClassName, ...rest } = props;
        const { isValid } = this.state;
        return (
            <CustomizedSelect
                className={selectClassName}
                onChange={this.handleOnChange}
                isValid={isValid}
                {...rest}
            />
        );
    }

    inputLabel(labelText, isRequired) {
        return (
            <label style={{ fontWeight: 'bold' }}>
                {labelText}
                {isRequired ? <span style={{ color: 'red' }}>*</span> : null}
            </label>
        );
    }

    errorMessage() {
        const { isValid, showErrorIcon = true ,errorMessages } = this.props;
        const id = this.props.id ? this.props.id + '_helperText' : null;
        if (isValid||errorMessages==='') {
            return null;
        }

        return (
            <FormHelperText error style={{ marginTop: 0, fontSize: '1rem', fontFamily: 'Arial', padding: 0 }} id={id}>
                {showErrorIcon ? (<ErrorOutline style={{ fontSize: 14, height: '1rem', width: '1rem' }} />) : null}
                {this.getErrorMessage()}
            </FormHelperText>
        );
    }

}

CustomizedSelectFieldValidator.defaultProps = {
    errorMessages: '',
    validators: [],
    validatorListener: () => { },
    isRequired: false,
    labelText: '',
    notShowMsg: false,
    msgPosition: 'top',
    labelPosition: 'top',
    validByBlur: false,
    msgNoWrap: false
};

export default CustomizedSelectFieldValidator;
