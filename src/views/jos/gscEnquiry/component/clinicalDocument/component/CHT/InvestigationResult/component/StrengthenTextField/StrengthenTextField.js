import React, { Component } from 'react';
import { withStyles, TextField, FormHelperText } from '@material-ui/core';
import _ from 'lodash';
import classNames from 'classnames';
import * as utils from '../../../../../../../../../jos/medicalHistories/util/utils';
import { styles } from './StrengthenTextFieldStyle';

class StrengthenTextField extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    generateNotSavedData = (id, valMap) => {
        let { patientKey, neonatalDocId }=this.props;
        let tempObj = {
            docId: neonatalDocId,
            docItemId: Math.random(),
            formItemId: id,
            itemVal: '',
            opType: 'I',
            createBy: '',
            createDtm: '',
            dbUpdateDtm: '',
            patientKey,
            updateBy: '',
            updateDtm: '',
            version: '',
            itemValErrorFlag:false
        };
        valMap.set(id, tempObj);
        return valMap;
    }
    handleChangeText = (event, inputName) => {
        const { updateState, valMap, itemId, attrName, multiline, changeEditFlag } = this.props;
        let value =multiline ? utils.cutOutString(event.target.value,500):utils.cutOutString(event.target.value,500);
        if(valMap.size > 0 && valMap.has(itemId)){
            const tempObj=valMap.get(itemId);
            tempObj[attrName]=value;
            if(tempObj.opType=='I' ){
                    if( tempObj[attrName]=='' ){
                        valMap.delete(itemId);
                    }
            }else{

                tempObj.opType=tempObj[attrName]=='' ? 'D' :'U';
            }
            updateState && updateState({valMap:valMap});
        }else{
            let resValMap=this.generateNotSavedData(itemId,valMap);
            if(resValMap.size > 0 && resValMap.has(itemId)){
                const tempObj=resValMap.get(itemId);
                tempObj[attrName]=value;
                if(tempObj.opType=='I' && tempObj[attrName]==''){
                    resValMap.delete(itemId);
                }
                updateState && updateState({ValMap:resValMap});
            }
        }
        changeEditFlag&&changeEditFlag();
    }
    handleBlur = (event) => {
        const { updateState, valMap, itemId, attrName } = this.props;
        if(valMap.size > 0 && valMap.has(itemId)){
            const tempObj=valMap.get(itemId);
            tempObj[attrName]=_.trim(tempObj[attrName]);
        }
        updateState && updateState({valMap});
    }
    render() {
        let { classes, errorFlag = false, val='', label='', labelStyle={}, containerStyle, TextFieldStyle, multiline, nameTextField, more} = this.props;
        return (
            <div className={classNames({ [classes.textField]:true})}  style={containerStyle}>
                {label !== '' && <label  className={classes.label} style={labelStyle} >{label}</label>}
                    <TextField
                        id="StrengthenTextField"
                        name={nameTextField}
                        value={val}
                        error={errorFlag}
                        onChange={e => this.handleChangeText(e)}
                        onBlur={e => this.handleBlur(e)}
                        style={TextFieldStyle}
                        multiline={multiline}
                        variant="outlined"
                        {...more}
                    />
                    {errorFlag ? <FormHelperText
                        error
                        classes={{
                            error: classNames(classes.helperTextError)
                        }}
                                 >This is required.</FormHelperText> : ''}
            </div>
        );
    }
}

export default withStyles(styles)(StrengthenTextField);