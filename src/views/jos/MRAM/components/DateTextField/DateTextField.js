import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './DateTextFieldStyle';
import Enum from '../../../../../enums/enum';
import { MAX_DATE,MIN_DATE } from '../../../../../constants/common/commonConstants';
import * as generalUtil from '../../utils/generalUtil';
import moment from 'moment';
import DatePicker from './DatePicker';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

const customTheme = (theme) =>{
  return createMuiTheme({
    ...theme,
    overrides: {
      MuiFormHelperText:{
        root:{
          color:'red'
        }
      },
      MuiOutlinedInput:{
        input:{
          padding: '0 14px',
          height: 39
        }
      }
    }
  });
};

class DateTextField extends Component {
  constructor(props){
    super(props);
    this.state={
      val:''
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { fieldValMap,prefix,mramId } = props;
    let val = null;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    val = fieldValObj!==undefined?fieldValObj.value:'';
    if (val!==state.val) {
      return {
        val
      };
    }
    return null;
  }

  handleDateChanged = (event) => {
    let { updateState,fieldValMap,prefix,mramId } = this.props;
    let fieldValObj = fieldValMap.get(`${prefix}_${mramId}`);
    let val = event!==null?moment(event).format('DD-MMM-YYYY'):'';
    if(val==='Invalid date'){
      fieldValObj.isError=true;
    }
    else{
      fieldValObj.isError=false;
    }
    fieldValObj.value = event!==null?moment(event).format('YYYY-MM-DD HH:MM:SS'):'';
    generalUtil.handleOperationType(fieldValObj);
    if(val!==''){
      this.setState({
        val
      });
    }

    updateState&&updateState({
      fieldValMap
    });
  }

  StringToDate = (val) =>{
    let reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
      let dateArray = reggie.exec(val);
      let dateObject = new Date(
          (+dateArray[1]),
          (+dateArray[2])-1, // Careful, month starts at 0!
          (+dateArray[3]),
          (+dateArray[4]),
          (+dateArray[5]),
          (+dateArray[6])
      );
      return dateObject;
  }

  render() {
    const { id='', classes, viewMode=false } = this.props;
    let { val } = this.state;
    if(val!==''&&val!=='Invalid date'){
      val=this.StringToDate(val);
    }
    return (
      <div>
        <MuiThemeProvider theme={customTheme}>
          <DatePicker
              id={`${id}_Date`}
              placeholder={moment(new Date()).format('DD-MMM-YYYY')}
              className={classes.fullwidth}
              inputVariant="outlined"
              format={Enum.DATE_FORMAT_EDMY_VALUE}
              minDate={new Date(MIN_DATE)}
              maxDate={new Date(MAX_DATE)}
              value={val!==''?moment(val).format('DD-MMM-YYYY'):null}
              disabled={viewMode}
              InputProps={{
                classes: { input: classes.input }
              }}
              onChange={(e)=>{this.handleDateChanged(e);}}
          />
        </MuiThemeProvider>
      </div>
    );
  }
}

export default withStyles(styles)(DateTextField);
