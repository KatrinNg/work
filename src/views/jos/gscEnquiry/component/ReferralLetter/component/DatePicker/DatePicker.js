import React,{Component} from 'react';
import {FormHelperText, withStyles} from '@material-ui/core';
import styles from './DatePickerStyle';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker
  } from '@material-ui/pickers';
import moment from 'moment';
import {COMMON_CODE} from '../../../../../../../constants/message/common/commonCode';

class DatePicker extends Component{
    constructor(props){
        super(props);
        this.dateRef = React.createRef();
        this.timeRef = React.createRef();
        this.state={
            val:props.defaultValue || '',
            dateVal:null,
            timeVal:null,
            date:new Date('2014-08-18T21:11:54'),
            dateErrorFlag: false,
            timeErrorFlag: false,
            dateErrorMess: '',
            timeErrorMess: '',
            showHelperText: false
        };
    }

    componentDidMount() {
        this.setDateFn(this.props);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.props.value){
           this.setDateFn(nextProps);
        }
    }
    setDateFn(props){
        if (props.onlyType === 'date') {
            this.setState({dateVal:props.value ? new Date(props.value) : null,showHelperText: moment(props.value).format() === 'Invalid date'});
        }else{
            this.setState({timeVal:props.value ? new Date(props.value) : null,showHelperText: moment(props.value).format() === 'Invalid date'});
        }
    }

    handleDateChange = (date,type) => {
        let {pickerFormat = 'dd-MM-yyyy' } = this.props;
        let errorFlag = false;
        let errorMess = '';
        let showHelperText = false;
        if (date) {
            let val = moment(date).format();
            if (val === 'Invalid date') {
                errorFlag = true;
                showHelperText = true;
                errorMess = type === 'date' ? 'Invalid Date' : 'Invalid Time';
            }
        }
        if (errorFlag) {
            if (!showHelperText) {
                this.props.openCommonMessage({
                    msgCode: COMMON_CODE.COMMON_ERROR,
                    params: [
                        {
                            name: 'MSG',
                            value: errorMess
                        }
                    ]
                });
                if (type === 'date') {
                    this.dateRef.current.focus();
                } else {
                    this.timeRef.current.focus();
                }
            }
        } else {
            if (type === 'date') {
                let format = pickerFormat.toUpperCase();
                date = date !=null ? moment(date, format).format():'';
            } else {
                date = date !=null ? moment(date, 'HH:mm').format(): '';
            }
        }
        let dateVal = (date && moment(date).format() === 'Invalid date') ? 'Invalid date' : date;
        this.setState({
            [type]: dateVal,
            [`${type}ErrorFlag`]: errorFlag,
            [`${type}ErrorMess`]: errorMess,
            showHelperText
        },()=>{
            this.props.onChange(this.state[type]);
        });

    };
    handleDateBlur = (event, type) => {
        let { pickerFormat = 'dd-MM-yyyy', pattern = /^\d{2}-\d{2}-\d{4}$/ } = this.props;
        let value = !!event ? event.target?.value : '';
        let errorFlag = false;
        let errorMess = '';
        let showHelperText = false;
        let val = '';
        if (value) {
            console.log('handleDateBlur--val',value);
            if (type === 'date') {
                if (pattern.test(value)) {
                    let format = pickerFormat.toUpperCase();
                    val = moment(value, format).format();
                } else {
                    val = 'Invalid date';
                }
            } else {
                val = moment(new Date(`1900-01-01 ${value}`)).format();
            }

            if (val === 'Invalid date') {
                errorFlag = true;
                showHelperText = true;
                errorMess = type === 'date' ? 'Invalid Date' : 'Invalid Time';
            }
        }

        if (errorFlag) {
            if (!showHelperText) {
                this.props.openCommonMessage({
                    msgCode: COMMON_CODE.COMMON_ERROR,
                    params: [
                        {
                            name: 'MSG',
                            value: errorMess
                        }
                    ]
                });
                if (type === 'date') {
                    this.dateRef.current.focus();
                } else {
                    this.timeRef.current.focus();
                }
            }
        } else {
            console.log('val---',val);
            if (type === 'date') {
                let format = pickerFormat.toUpperCase();
                val = val ? moment(value, format).format() : '';
            } else {
                val =  val ? moment(value, 'HH:mm').format() : '';
            }
        }
        val = (val && moment(val).format() === 'Invalid date') ? 'Invalid date' : val;
        this.setState({
            [type]: val,
            [`${type}ErrorFlag`]: errorFlag,
            [`${type}ErrorMess`]: errorMess,
            showHelperText
        },()=>{
            this.props.onChange(this.state[type]);
        });
    }
   render(){
      let {dateVal,dateErrorFlag,
          dateErrorMess,
          showHelperText}=this.state;
      let {classes=null,strengthenStyle,disabled,keyboardDatePickerStyle,pickerFormat = 'dd-MM-yyyy'} =this.props;


        return (<div style={strengthenStyle}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        inputRef={this.dateRef}
                        format={pickerFormat}
                        value={dateVal}
                        className={classes.dateStyle}
                        style={keyboardDatePickerStyle}
                        KeyboardButtonProps={{
                            'aria-label': 'change date', style: { padding: 2 ,position: 'absolute', right: 0 }
                        }}
                        disabled={disabled}
                        inputProps={{
                            disableUnderline: true,
                            style: {width: '100%'}
                        }}
                        InputProps={{
                            disableUnderline: true,
                            style: {
                                backgroundColor: disabled ? '#fafafa': '#dde5fe',
                                borderRadius: 4
                            }
                        }}
                        onBlur={value => this.handleDateBlur(value, 'date')}
                        onChange={(date)=>this.handleDateChange(date,'date')}
                        helperText=""
                    />
                    {dateErrorFlag && showHelperText ? (
                        <FormHelperText
                            error
                            classes={{
                                error:classes.helper_error
                            }}
                        >
                            {dateErrorMess}
                        </FormHelperText>
                    ) : null}
                </MuiPickersUtilsProvider>
            </div>
        );
   }
}

export default withStyles(styles)(DatePicker);