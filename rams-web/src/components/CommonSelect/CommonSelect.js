import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {MenuItem, Select,FormControl,Grid,FormHelperText} from '@material-ui/core';

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
        required = false,
        noMsg= false,
        ...others
    } = props;
    const [errSelect,setErrSelect] = useState(false)
    const classes = useStyles({width,errSelect});
    
    const [errorMessage, setErrorMessage] = useState('');
    // check errors first when render
    useEffect(() => {
        onValidation(value);
    }, []);

    // check errors when change render
    useEffect(() => {
        onValidation(value);
    }, [value,items]);
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
        if(value && value !=='' && items){
            let outItems = true;
            for (let index = 0; index < items.length; index++) {
                const element = items[index];
                if(value == element[valueFiled]){
                    outItems = false
                    break;
                }else{
                    outItems = true
                }
            }
            if(outItems && !noMsg){
                msgList.push('This selected not exist list')
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
                    value={(required && value=='')?((items&&items.length>0) ? items[0][valueFiled]:''):value}
                    displayEmpty
                    classes={{select:classes.selectInput,...props.classes}}
                    disableUnderline={true}
                    label={placeholder}
                    {...others}
                >
                    {(placeholder && !required) && <MenuItem disabled={true} value="" ><span style={{color: '#b2b1b1'}}>{placeholder}</span></MenuItem>}
                    {items&&items.length>0?items.map((item,index)=>{
                        return <MenuItem key={`${id}item${index}`} value={item[valueFiled]}>{item[labelFiled]}</MenuItem>
                    }):<MenuItem key={`${id}item-no-data`} value={''}>{'No Data'}</MenuItem>}
                </Select>
                <FormHelperText className={errSelect?classes.hidden:classes.errorMessage}>{errorMessage}</FormHelperText>
            </FormControl>
        </Grid>
    );
}

CommonSelect.propTypes = {
    id: PropTypes.string.isRequired,
    items: PropTypes.array || [],
    width: PropTypes.any || 'auto',
    placeholder:PropTypes.string,
    disabled:PropTypes.bool
  };
export default CommonSelect;