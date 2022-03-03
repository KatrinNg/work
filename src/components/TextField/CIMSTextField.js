import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import * as commonUtilities from '../../utilities/commonUtilities';
import { isNumber } from 'lodash';

const styles = () => ({
});

const getTextWidth = (str = '') => {
    const dom = document.createElement('span');
    dom.style.display = 'inline-block';
    dom.textContent = str;
    document.body.appendChild(dom);
    const width = dom.clientWidth;
    document.body.removeChild(dom);
    return width;
};

class CIMSTextField extends Component {
    handleOnChange = (e) => {
        if (this.props.onlyOneSpace) {
            e.target.value = e.target.value.replace(/(\s)\1+/g, '$1');
        }
        if (this.props.type === 'number') {
            if (e.target.value) {
                if (this.props.allowNegative)
                    e.target.value = e.target.value.replace(/(?!^-)[^0-9]/ig, '');
                else
                    e.target.value = e.target.value.replace(/[^0-9]/ig, '');
            }
        }
        if (this.props.type === 'cred') {
            if (e.target.value) {
                e.target.value = e.target.value.replace(/[^0-9a-zA-Z]+$/ig, '');
            }
        }
        if (this.props.onlyOneUnderline) {
            e.target.value = e.target.value.replace(/(_)\1+/g, '$1');
        }
        //20191025 create new text field type for drug dosage use by Louis Chen
        if (this.props.type === 'decimal') {
            if (e.target.value) {
                // e.target.value = e.target.value.replace(/[^0-9.]+$/ig, '');
                // e.target.value = commonUtilities.formatterDecimal(e.target.value);//update by Demi on 20191205
                e.target.value = commonUtilities.formatterDecimal(e);
            }
        }
        //replace all chinese
        if (this.props.noChinese){
            if(e.target.value){
                e.target.value = e.target.value.replace(/[\u4e00-\u9fa5]+/, '');
            }
        }
        //20191127 create new action to cal actual length
        if (this.props.calActualLength && parseInt(e.target.maxLength) > 0) {
            // eslint-disable-next-line no-constant-condition
            while (true) {
                const byteSize = commonUtilities.getUTF8StringLength(e.target.value);
                if (byteSize <= e.target.maxLength) {
                    break;
                }
                e.target.value = e.target.value.substr(0, e.target.value.length - 1);
            }
        }
        //word per rows
        if (this.props.multiline && this.props.wordMaxWidth && parseInt(this.props.wordMaxWidth) > 0) {
            let strArr = e.target.value.split('\n').slice(0, parseInt(this.props.rows || 8));
            for (let i = 0; i < strArr.length; i++) {
                let str = strArr[i];
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    let width = getTextWidth(str);
                    if (width <= parseInt(this.props.wordMaxWidth)) {
                        break;
                    }
                    str = str.substr(0, str.length - 1);
                }
                strArr[i] = str;
            }
            e.target.value = strArr.join('\n');
        }
        if (this.props.onChange) {
            this.props.onChange(e);
        }
    }

    handleOnBlur = (e) => {
        if (this.props.trim && this.props.trim !== 'none') {
            if (this.props.trim.toLowerCase() === 'all') {
                e.target.value = e.target.value.trim();
            }
            else if (this.props.trim.toLowerCase() === 'left') {
                e.target.value = e.target.value.trimLeft();
            }
            else if (this.props.trim.toLowerCase() === 'right') {
                e.target.value = e.target.value.trimRight();
            }
            if (this.props.onChange) {
                this.props.onChange(e);
            }
        }

        if(this.props.onlyOneUnderline){
            if((e.target.value.charAt(e.target.value.length-1) === '_')){
                e.target.value = e.target.value.substr(0, e.target.value.length - 1);
            }
            if((e.target.value.charAt(0) === '_')){
                e.target.value = e.target.value.substr(1, e.target.value.length );
            }
        }

        //upperCase when onchange
        if (this.props.upperCase) {
            e.target.value = (e.target.value || '').toUpperCase();
            this.props.onChange && this.props.onChange(e);
        }

        if (e.target && e.target.value && e.target.maxLength > 0) {
            if (e.target.value.length > e.target.maxLength) {
                // e.target.value = e.target.value.substr(0, e.target.maxLength - 1);
                e.target.value = e.target.value.substr(0, e.target.maxLength);
            }
            this.props.onChange && this.props.onChange(e);
        }
        if (this.props.onBlur) {
            this.props.onBlur(e);
        }
    }

    render() {
        /* eslint-disable */
        const {
            classes,//NOSONAR
            inputProps,//NOSONAR
            onChange,//NOSONAR
            onBlur,//NOSONAR
            upperCase,//NOSONAR
            type,//NOSONAR
            value,//NOSONAR
            calActualLength,//NOSONAR
            onlyOneSpace,//NOSONAR
            noChinese,//NOSONAR
            wordMaxWidth,//NOSONAR
            ...rest
        } = this.props;
        /* eslint-enable */
        let custom_inputProps = inputProps || {};
        if (upperCase) {
            custom_inputProps.style = Object.assign({}, custom_inputProps.style, { textTransform: 'uppercase', margin:'0' });
        }

        let custom_value =  isNumber(value) ? value : (value || '');
        let custom_type = type;
        if (type === 'number') {
            custom_type = '';
        }

        return (
            <TextField
                fullWidth
                variant="outlined"
                // variant="outlined"
                autoComplete="off"
                inputProps={{
                    ...custom_inputProps,
                    spellCheck: false
                }}
                InputProps={{
                    ...this.props.InputProps
                }}
                type={custom_type}
                value={custom_value}
                onChange={this.handleOnChange}
                onBlur={this.handleOnBlur}
                {...rest}
            />
        );
    }
}

CIMSTextField.defaultProps = {
    type: 'text',
    trim: 'all'
};

CIMSTextField.propTypes = {
    /**
   * `number` ,`cred`,`password`,`email`,`decimal` is available.Default use `text`.
   * `number` number only.
   * `cred` is for credentials,english and number only.
   * `password` passowrd input field.
   * `email` email input field.
   * `decimal` decimal number
   */
    type: PropTypes.oneOf(['number', 'cred', 'text', 'password', 'email', 'decimal']),
    /**
   * `all`, `left` and `right` is available. Default use `all`.
   * `all` is for triming left and right space.
   * `left` is for triming left space.
   * `right` is for triming right space.
   */
    trim: PropTypes.oneOf(['all', 'left', 'right', 'none']),
    calActualLength: PropTypes.bool
};

export default withStyles(styles)(CIMSTextField);