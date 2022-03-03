import React,{Component} from 'react';
import { KeyboardDatePicker} from '@material-ui/pickers';
import moment from 'moment';

class DatePicker extends Component {
  constructor(props){
    super(props);
    this.state={
      value:props.value
    };
  }

  handleChange=(m,f)=>{
    const {onChange}=this.props;
    this.setState({value:m});
    onChange&&onChange(m,f);
  }
  inputOnBlur = (e) => {
    const { format, value, disableFuture, disablePast } = this.props;
    const minDate = this.props.minDate || '1900-01-01';
    const maxDate = this.props.maxDate || '2100-01-01';

    if (e.target.value) {
        let targetValue = moment(e.target.value, this.state.format);
        if (targetValue.format(this.state.format) === 'Invalid date') {
            e.target.value = value ? moment(value).format(this.state.format) : moment().format(this.state.format);
        } else if ((disableFuture && targetValue.isAfter(moment())) || (disablePast && targetValue.isBefore(moment()))) {
            e.target.value = moment().format(this.state.format);
        } else if (minDate && targetValue < moment(minDate)) {
            e.target.value = moment(minDate).format(this.state.format);
        } else if (maxDate && targetValue > moment(maxDate)) {
            e.target.value = moment(maxDate).format(this.state.format);
        }
    }

    if (this.props.onChange) {
        this.props.onChange(e.target.value ? moment(e.target.value, this.state.format) : null);
    }
    this.setState({ format });
}

  render(){
    return <KeyboardDatePicker {...this.props} onChange={this.handleChange} value={this.state.value} onBlur={this.inputOnBlur}/>;
  }
}

DatePicker.defaultProps={
  'no-need-input-label':true
};

export default DatePicker;
