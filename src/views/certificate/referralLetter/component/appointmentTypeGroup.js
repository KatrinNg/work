import React, { Component } from 'react';
import { RadioGroup, Radio, FormControlLabel } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
//import CIMSTextField from '../../../../components/TextField/CIMSTextField';

const CustomRadio = withStyles({
    root: {
        padding: 5
    }
})(Radio);

const CustomFormControlLabel = withStyles({
    root: {
        marginLeft: 'unset'
    }
})(FormControlLabel);

class AppointmentTypeGroup extends Component {

    handleAppointmentTypeChange = (value) => {
        this.props.onChange(value);
    }
    render() {
        const appointmentList = [
            { label: 'Normal', value: 'N' },
            { label: 'Urgent', value: 'U' }
        ];

        return (
            <RadioGroup
                id={this.props.id + '_appointmentTypeGroup'}
                row
                value={this.props.appointmentType}
                onChange={e => { this.handleAppointmentTypeChange(e.target.value); }}
            >
                {
                    appointmentList.map(item => (
                        <CustomFormControlLabel
                            key={item.value}
                            value={item.value}
                            control={<CustomRadio disabled={this.props.isSelected} color={'primary'} />}
                            label={item.label}
                        />
                    ))
                }
            </RadioGroup>
        );
    }
}

export default AppointmentTypeGroup;
