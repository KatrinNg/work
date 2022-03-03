import React, { Component } from 'react';
import Enum from '../../../../../../enums/enum';
import { KeyboardDateTimePicker } from '@material-ui/pickers';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const customTheme = (theme) => createMuiTheme({
  ...theme,
  overrides: {
    ...theme.overrides,
    MuiPaper:{
      root:{
        backgroundColor:color.cimsBackgroundColor
      }
    },
    MuiPickersToolbarButton: {
      ...theme.overrides.MuiPickersToolbarButton,
      toolbarBtn: {
        height:'fit-content'
      }
    },
    MuiPickersCalendarHeader:{
      iconButton:{
        backgroundColor:color.cimsBackgroundColor
      }
    },
    MuiFormHelperText: {
      contained: {
        margin: 0
      }
    }
  }
});

class CustomDateTimePicker extends Component {
  constructor(props){
    super(props);
    this.state={
      value:props.datetime,
      format:props.format
    };
  }

  static getDerivedStateFromProps(props, state){
    let { datetime } = props;
    if(datetime !== state.value){
      return {
        value:datetime
      };
    }
  }

  handleChange=(date)=>{
    const { onChange } = this.props;
    this.setState({value:date});
    onChange&&onChange(date);
  }

  handleOnFocus = () => {
    const { format } = this.props;
    let editFormat = format;
    if (format === Enum.DATE_FORMAT_24_HOUR) {
      editFormat = 'DD-MM-YYYY HH:mm';
    }
    this.setState({format:editFormat});
  }

  handleOnBlur = () => {
    const { format } = this.props;
    this.setState({ format });
  }

  render() {
    const { id='', disableFlag } = this.props;
    let {value,format} = this.state;
    return (
      <MuiThemeProvider theme={customTheme}>
        <KeyboardDateTimePicker
            id={`${id}_datetime`}
            ampm={false}
            value={value}
            autoFocus={(format === 'DD-MM-YYYY HH:mm' && this.props.format === 'DD-MMM-YYYY HH:mm')}
            inputVariant="outlined"
            format={format}
            onChange={this.handleChange}
            onFocus={this.handleOnFocus}
            onBlur={this.handleOnBlur}
            disabled={disableFlag}
            InputProps={{
              style: {
                fontSize: font.fontSize,
                fontFamily: font.fontFamily,
                color: disableFlag ? 'rgba(0, 0, 0, 0.26)' : color.cimsTextColor,
                backgroundColor: disableFlag ? color.cimsDisableColor : 'unset'
              }
            }}
        />
      </MuiThemeProvider>
    );
  }
}

export default CustomDateTimePicker;
