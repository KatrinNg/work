import React, { Component } from 'react';
import { Grid, Tooltip, colors } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as Colors from '@material-ui/core/colors';
import { Field, FastField, getIn } from 'formik';
import _ from 'lodash';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import DateFnsUtils from '@date-io/date-fns';
import Checkbox from '@material-ui/core/Checkbox';

import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import ListItemText from '@material-ui/core/ListItemText';

import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker
} from '@material-ui/pickers';
import ReactSelect from '../../components/Select/ReactSelect';

const sortFunc = (a, b) => a.label > b.label ? 1 : b.label > a.label ? -1 : 0;

const styles = theme => ({
    cellContainer:{
        justifyContent: 'center',
        display: 'flex'
    },
    formControl: {
      width: '100%',
        '&Select':{
            width:'100%',
            '&MenuItem': {
                width:'100%'
            }
        }
    },
    datePicker:{
        '& input':{
            '&:focus':{
                boxSizing:'content-box'
            }
        }
    }
});

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

class GridCellRenderer extends Component {
    constructor(props) {
        super(props);
        props.eParentOfValue.style.width= '100%';
        const rowId = this.props.data?.rowId;
        const colId = this.props.colDef?.colId ?? this.props.colDef?.field;
        const fieldName = `rowData[${rowId}].${colId}`;


        this.params = {
            rowId,
            colId
        };

        this.state = {
            rowId,
            colId,
            fieldName,
            value: props.value
            // refresh: 0
        };

        this.refInput = React.createRef();
    }

    componentDidMount() {
        this.props.api && this.props.api.addEventListener('cellFocus', this.onCellFocus);
        if(this.refInput.current){
            this.refInput.current.addEventListener('keydown', this.onKeyDown);
        }
        // console.log(this.state.fieldName + ' mount');
    }

    componentWillUnmount() {
        this.props.api && this.props.api.removeEventListener('cellFocus', this.onCellFocus);
        if(this.refInput.current){
            this.refInput.current.removeEventListener('keydown', this.onKeyDown);
        }
        // console.log(this.state.fieldName + ' unmount');
    }

    refresh() {
        // console.log(this.state.fieldName + " refresh");
        // this.setState({ refresh: !this.state.refresh });
        return true;
    }

    onCellFocus = event => {
        const { rowId, colId } = this.state;
        if (event.params.rowId === rowId && event.params.colId === colId) {
            this.refInput.current.focus();
        }
    }

    getCharCodeFromEvent(event) {
        event = event || window.event;
        return typeof event.which === 'undefined' ? event.keyCode : event.which;
    }

    onKeyDown = event => {
        let charCode = this.getCharCodeFromEvent(event);
        // console.log(charCode);
        switch (charCode) {
        case 9:
        case 35:
        case 36:
        case 37:
        case 38:
        case 39:
        case 40:
            event.stopPropagation();
            break;
        case 13:
            console.log(this.props);
            event.preventDefault();
            break;
        default:
            break;
        }
    };

    onClick = (event, field, form) => {
        const value = event.target.checked;
        this.setState({ value }, () => {
            let params = { ...this.params, field, form, value: this.state.value };
            this.props.changeField(params);
            // this.changeParent(params);
        });
    };

    onChange = (event, field, form) => {
        const value = event.target.value;
        console.log('--------------------------------------------------');
        console.log({value}, field, form);
        console.log('--------------------------------------------------');
        this.setState({ value }, () => {
            let params = { ...this.params, field, form, value: this.state.value };
            this.props.changeField(params);
            // this.changeParent(params);
        });
    };

    //selectAll = (all, field, form) => {
        //this.setState({ all }, () => {
            //let params = { ...this.params, field, form, value: this.state.value };
            //this.props.changeField(params);
            //// this.changeParent(params);
        //});
    //};


    onMultiSelectChange = (event, options, field, form) => {
        let prevValue = this.state.value;
        let value = event.target.value;
        let index = value.indexOf('Select All');
        let hasSelectedAllToken;
        // now selected all
        if (index > -1) {
            hasSelectedAllToken = true;
        }
        let prevSelectedAll = prevValue.length === options.length;
        if(prevSelectedAll){
            if (hasSelectedAllToken) {
                //remove the selectedAll token
                value.splice(index, 1);
            } else {
                // if previously it selected all, and now it does not have the selected all, then deselect all
                value = [];
            }
        } else {
            if(hasSelectedAllToken){
                // if previously it did not have selected all, and now it has, then select all
                value = options;
            }
        }
        console.log('--------------------------------------------------');
        console.log({value}, field, form);
        console.log('--------------------------------------------------');
        this.setState({ value }, () => {
            let params = { ...this.params, field, form, value: this.state.value };
            this.props.changeField(params);
            // this.changeParent(params);
        });
    };

    //toggleSelectAll = (checkedAll, value field, form) => {
        //console.log('--------------------------------------------------');
        //console.log(value, field, form);
        //console.log('--------------------------------------------------');
        //// trigger toggles value
        ////let value=[];
        //if(checkedAll){
            //value=[];
        //}
        //// trigger toggles checkbox ui
        ////this.setState({
          ////checkedAll:!this.state.checkedAll
        ////});

        //// set state argument,
        //this.setState({value}, () => {
            //let params = { ...this.params, field, form, value: this.state.value };
            //this.props.changeField(params);
            //// this.changeParent(params);
        //});
    //}

    onDateChange = (date, field, form) => {
        const value = date;
        this.setState({ value }, () => {
            let params = { ...this.params, field, form, value: this.state.value };
            this.props.changeField(params);
            // this.changeParent(params);
        });
    };

    changeParent = _.debounce(params => {
        this.props.changeField(params);
    }, 200);

    onBlur = (field, form) => {
        let params = { ...this.params, field, form, value: this.state.value };
        // this.changeParent.cancel();
        // this.props.changeField(params);
        this.props.blurField(params);
        // _.delay(this.props.blurField, 100, params);
    }

    getStateField = field => {
        return this.state[field];
    };

    setStateField = (field, value) => {
        this.setState({ [field]: value });
    };

    render() {
        const { fieldName } = this.state;
        const { classes, inputType, inputStyle } = this.props;
        const colName = this.props.colDef.field;

        const optionList = {
            descriptionList: [
                'Weekly Statistical Report - General Report',
                'Weekly Statistical Report - Appointment Report',
                'Weekly Statistical Report - attendance Report'
            ],
            reportTemplateNameList : [
                'PRT-FCS-STA-0001',
                'PRT-FCS-STA-0002',
                'PRT-FCS-STA-0003'
            ],
            siteList: [
                'ANT',
                'KFC',
                'FCS'
            ]
        };

        return (
            <FastField
                name={fieldName}
            >
                {({ field, form }) => {
                    let fieldError = getIn(form.errors, fieldName);
                    let fieldTouched = getIn(form.touched, fieldName);
                    let error = !!fieldError && !!fieldTouched;
                    switch(inputType){
                        case 'date': {
                            return (
                                <CustomTooltip
                                    title={error ? fieldError : ''}
                                >
                                <div className={classes.datePicker}>
                                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                        <KeyboardDatePicker
                                            ref={this.refInput}
                                            margin="normal"
                                            id="date-picker-dialog"
                                            label=""
                                            format="MM/dd/yyyy"
                                            animation={false}
                                            value={this.state.value}
                                            //onChange={handleDateChange}
                                            onChange={date=> this.onDateChange(date, field, form)}
                                            KeyboardButtonProps={{
                                                'aria-label': 'change date'
                                          }}
                                        />
                                    </MuiPickersUtilsProvider>
                                </div>
                                </CustomTooltip>
                            );
                        }
                        case 'select': {
                            console.log(this.props);
                            console.log('fn', fieldName);
                            console.log('f', field);
                            // let menuItemList = optionList[`${colName}List`];
                            let menuItemList = this.props.data && this.props.data.selectOption ? this.props.data.selectOption : [];
                            return (
                                <CustomTooltip
                                    title={error ? fieldError : ''}
                                >
                                    <FormControl className={classes.formControl}>
                                        <Select
                                            ref={this.refInput}
                                            type={inputType}
                                            name="select"
                                            autoWidth={false}
                                            style={{
                                                width: '100%',
                                                ...inputStyle
                                            }}
                                            value={this.state.value}
                                            onChange={event => this.onChange(event, field, form)}
                                        >
                                        {
                                            menuItemList.map((item, k)=><MenuItem key={k} value={item.parameter}>{item.description}</MenuItem>)
                                        }
                                        </Select>
                                    </FormControl>
                                </CustomTooltip>
                             );
                        }
                        case 'multiselect': {
                            console.log(this.props);
                            console.log('fn', fieldName);
                            console.log('f', field);
                            let menuOpen = `${colName}MenuOpen`;
                            let menuInput = `${colName}Input`;
                            let menuItemList = optionList[`${colName}List`];
                            console.log(menuItemList);
                            let selectedValues = [...this.state.value];
                            selectedValues = selectedValues ? selectedValues: [];
                            let checkedAll = menuItemList.length === selectedValues.length;
                            if(checkedAll){
                                selectedValues.push('Select All');
                            }
                            return (
                                <CustomTooltip
                                    title={error ? fieldError : ''}
                                >
                                    <FormControl className={classes.formControl}>
                                        <Select
                                            ref={this.refInput}
                                            type={inputType}
                                            name="select"
                                            autoWidth={false}
                                            multiple
                                            style={{
                                                width: '100%',
                                                ...inputStyle
                                            }}
                                            value={selectedValues}
                                            onChange={event => this.onMultiSelectChange(event, menuItemList, field, form)}
                                            renderValue={(selected) => selected.filter((item)=>item != 'Select All').join(', ')}
                                        >
                                            <MenuItem
                                                key={-1}
                                                value="Select All"
                                            >
                                                <Checkbox
                                                    checked={checkedAll}
                                                />
                                                <ListItemText primary={'Select All'} />
                                            </MenuItem>
                                        {
                                            menuItemList.map((item, k) => (
                                                <MenuItem key={k} value={item}>
                                                   <Checkbox checked={selectedValues.indexOf(item) > -1} />
                                                   <ListItemText primary={item} />
                                                </MenuItem>
                                           ))
                                        }
                                        </Select>
                            {/*
                                        <Select
                                            ref={this.refInput}
                                            type={inputType}
                                            name="select"
                                            autoWidth={false}
                                            labelId="demo-mutiple-checkbox-label"
                                            id="demo-mutiple-checkbox"
                                            value={this.state.value}
                                            onChange={event => this.onChange(event, field, form)}
                                            multiple
                                            style={{
                                                width: "100%",
                                                ...inputStyle
                                            }}
                                            input={<Input />}
                                            renderValue={(selected) => {
                                                console.log(selected);
                                                return (
                                                    <span>hihi</span>
                                                );
                                                //selected.join(', ');
                                            }}
                                            MenuProps={MenuProps}
                                         >
                                           {menuItemList.map((item, k) => (
                                             <MenuItem key={k} value={item}>
                                               <Checkbox checked={menuItemList.indexOf(item) > -1} />
                                               <ListItemText primary={item} />
                                             </MenuItem>
                                           ))}
                                         </Select>
                                */
                            }
                                {
                                        //<ReactSelect
                                            //ref={this.refInput}
                                            //type={inputType}
                                            //name="multiselect"
                                            //autoWidth={false}
                                            //style={{
                                                //width: "100%",
                                                //...inputStyle
                                            //}}
                                            ////value={this.state.value}
                                            ////onChange={event => this.onChange(event, field, form)}

                                            ////innerRef:ref => this[multiSelectRefs.site] = ref,
                                            //isClearable
                                            ////isDisabled= dialogAction !== 'create'
                                            //isLoading={false}
                                            //isRtl={false}
                                            //isSearchable
                                            //filterOption={{
                                                //matchFrom: "any"
                                            //}}
                                            //placeholder=""
                                            //menuPlacement="auto"
                                            //maxMenuHeight={500}
                                            //menuPortalTarget={document.body}
                                            //isMulti
                                            //hideSelectedOptions={false}
                                            //closeMenuOnSelect={false}
                                            //sortFunc={sortFunc}
                                            //selectAll="[ Select All ]"
                                            //options={menuItemList}
                                            //onMenuOpen={() => this.setState({[menuOpen]: true})}
                                            //onMenuClose={() => this.setState({[menuOpen]: false})}
                                            //value={field.value}
                                            //inputValue={this.state[menuInput]}
                                            //onChange={event => this.onChange(event,field,form)}
                                            ////onChange= (value params) => form.setFieldValue(field.name value)
                                            //onInputChange={(value,params) => this.setState({[menuInput]: value})}
                                            ////onInputChange= (value,params) => this.setState({siteInput: value})
                                        //>
                                        //{
                                            //menuItemList.map((item, k)=><MenuItem key={k} value={item}>{item}</MenuItem>)
                                        //}
                                        //</ReactSelect>

                                }

                                    </FormControl>
                                </CustomTooltip>
                             );
                        }
                        break;
                        case 'checkbox':
                            return (
                                <CustomTooltip
                                    title={error ? fieldError : ''}
                                >
                                    <div className={classes.cellContainer}>
                                        <Checkbox
                                            ref={this.refInput}
                                            type={inputType}
                                            name="checkbox"
                                            color="primary"
                                            style={{
                                                ...inputStyle
                                            }}
                                            checked={this.state.value}
                                            onClick={event => this.onClick(event, field, form)}
                                        />
                                    </div>
                                </CustomTooltip>
                            );
                        break;
                        default:
                            return (
                                <CustomTooltip
                                    title={error ? fieldError : ''}
                                >
                                    <div>
                                        <input
                                            ref={this.refInput}
                                            type={inputType}
                                            name="input"
                                            style={{
                                                fontFamily: 'inherit',
                                                fontSize: 'inherit',
                                                width: '100%',
                                                borderColor: error ? '#ff0000' : 'initial',
                                                borderStyle: error ? 'solid' : 'inset',
                                                ...inputStyle
                                            }}
                                            value={this.state.value}
                                            onChange={event => this.onChange(event, field, form)}
                                            onBlur={event => this.onBlur(field, form)}
                                        />
                                    </div>
                                </CustomTooltip>
                            );
                        break;
                    }
                }}
            </FastField>
        );
    }
}

export default withStyles(styles)(GridCellRenderer);

const tooltipStyles = theme => ({
    tooltip: {
        backgroundColor: Colors.red[400],
        color: Colors.common.white,
        boxShadow: '1px 1px 1px 1px rgba(0, 0, 0, 0.2)',
        fontSize: 14
    }
});
const CustomTooltip = withStyles(tooltipStyles)(Tooltip);
