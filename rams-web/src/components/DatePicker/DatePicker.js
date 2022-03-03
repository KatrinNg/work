import 'date-fns';
import React from 'react';
import DateFnsUtils from '@date-io/date-fns';
import calendarImg from 'resource/Icon/calendar.svg';
import { MuiPickersUtilsProvider, KeyboardDatePicker} from '@material-ui/pickers';
import useStyles from './styles';
import moment from 'moment'
export default function DatePicker(props) {
  // The first commit of Material-UI
  const classes = useStyles()
  const {value = new Date(),onChange,...others} = props;
  const [selectedDate, setSelectedDate] = React.useState(value);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onChange(moment(date).format('DD-MMM-yyyy'))
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <KeyboardDatePicker
          classes={{root:classes.datepickerRoot}}
          disableToolbar
          variant="inline"
          format="dd-MMM-yyyy"
          id="date-picker-inline"
          value={selectedDate}
          autoOk
          onChange={handleDateChange}
          keyboardIcon={<img alt="caledar" src={calendarImg} />}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
          InputProps={{readOnly:true}}
          {...others}
        />
    </MuiPickersUtilsProvider>
  );
}
