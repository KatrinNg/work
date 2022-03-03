import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {MenuItem, Select,FormControl,Grid,FormHelperText} from '@material-ui/core';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';

// styles
import useStyles from './styles';

const CommonSelect = (props) => {
    const {
        id, 
        items,
        value='',
        width='auto',
        placeholder='Please Select',
        disabled=false,
        isValidValue = () => null,
        validators,
        valueFiled = 'value',
        labelFiled = 'label',
        required=false,
        ...others
    } = props;
    const classes = useStyles({width});
    const [errSelect,setErrSelect] = useState(false)
    const [errorMessage, setErrorMessage] = useState('');
    // check errors first when render
    useEffect(() => {
        onValidation(value);
    }, []);

    // check errors when change render
    useEffect(() => {
        onValidation(value);
    }, [value]);

    const onValidation = (value)=> {
        let tempError = mapValidators(value, validators);
        isValidValue(tempError.length === 0);
        setErrSelect(tempError.length === 0)
        setErrorMessage(tempError.join(';'));
    }
    const mapValidators = (value, validators) => {
        let msgList = []
        if((validators && validators.length>0)){
            for (let index = 0; index < validators.length; index++) {
                const element = validators[index];
                const {required,checkFuc,msg} = element;
                if(required && value && value ==''){
                    msgList.push(msg)
                }
            }
        }
        return msgList
    }
    return (
        <Grid container direction="column" className={classes.selectContent}>
            <FormControl disabled={disabled}>
                <Select
                    labelId={`${id}label`}
                    id={id}
                    value={(required && value=='')?items[0][valueFiled]:value}
                    displayEmpty
                    classes={{select:classes.selectInput,...props.classes}}
                    disableUnderline={true}
                    label={placeholder}
                    IconComponent={KeyboardArrowDown}
                    MenuProps={{
                        anchorOrigin: {
                          vertical: "bottom",
                          horizontal: "left"
                        },
                        getContentAnchorEl: null
                      }}
                    {...others}
                >
                    {(placeholder && !required) && <MenuItem disabled={true} value="" ><span style={{color: '#b2b1b1'}}>{placeholder}</span></MenuItem>}
                    {items.map((item,index)=>{
                        return <MenuItem key={`${id}item${index}`} value={item[valueFiled]}>{item[labelFiled]}</MenuItem>
                    })}
                </Select>
                <FormHelperText className={errSelect?classes.hidden:classes.errorMessage}>{errorMessage}</FormHelperText>
            </FormControl>
        </Grid>
    );
}

CommonSelect.propTypes = {
    id: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired || [],
    width: PropTypes.any || 'auto',
    placeholder:PropTypes.string,
    disabled:PropTypes.bool
  };
export default CommonSelect;

