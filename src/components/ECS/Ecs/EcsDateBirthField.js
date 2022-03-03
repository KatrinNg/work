import React from 'react';
import DateFieldValidator from '../../../components/FormValidator/DateFieldValidator';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import CommonMessage from '../../../constants/commonMessage';
import ValidatorEnum from '../../../enums/validatorEnum';
import {
    FormControl,
    Grid
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import * as RegUtil from '../../../utilities/registrationUtilities';
// import FormInputLabel from '../../compontent/label/formInputLabel';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';
import moment from 'moment';
import Enum from '../../../enums/enum';

const styles = () => ({
    birth_date_form_input: {
        width: '95%'
    }
});

class EcsDateBirthField extends React.Component {
    constructor(props) {
        super(props);

        let fm = RegUtil.getDateFormat(this.props.exact_dobValue);

        this.state = {
            date_format: fm,
            lastDate: null
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state !== nextState ||
            this.props.dobValue !== nextProps.dobValue ||
            this.props.exact_dobValue !== nextProps.exact_dobValue ||
            this.props.exact_dobList !== nextProps.exact_dobList ||
            this.props.comDisabled !== nextProps.comDisabled ||
            this.props.dobProps !== nextProps.dobProps;
    }

    UNSAFE_componentWillUpdate(nextProps) {
        if (nextProps.exact_dobValue !== this.props.exact_dobValue) {
            this.setState({ date_format: RegUtil.getDateFormat(nextProps.exact_dobValue) }, () => {
                if(this.props.dobValue && moment(this.props.dobValue).isValid()){
                    const dobVal = RegUtil.getDateByFormat(nextProps.exact_dobValue, moment(this.props.dobValue).format(Enum.DATE_FORMAT_EYMD_VALUE));
                    this.props.onChange(dobVal, 'dob');
                }
            });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.date_format !== this.state.date_format){
            if(this.props.dobValue instanceof moment){
                if(!this.props.dobValue.isValid()){
                    this.handleOnChange(null, 'dob');
                }
            }else {
                this.handleOnChange(null, 'dob');
            }
            this.dateOfBirthRef.validateCurrent();
        }
    }

    handleOnChange = (value, name) => {
        if (this.props.onChange) {
            this.props.onChange(value, name);
        }
    }

    handleDateOnFocus = () => {
        this.setState({ lastDate: this.props.dobValue });
    }

    handleDateOnBlur = (date, name) => {
        if(date && !moment(date).isValid()){
            if(this.state.lastDate && moment(this.state.lastDate).isValid()){
                this.props.onChange(this.state.lastDate, name);
            } else {
                this.props.onChange(moment(), name);
            }
        }
    }

    render() {
        const { classes, dobValue, exact_dobValue, exact_dobList, comDisabled, id, dobProps = {}, exactDobProps = {} } = this.props;
        const { date_format } = this.state;
        const isRequired = dobProps.isRequired === undefined? true: dobProps.isRequired;
        return (
            <FormControl fullWidth style={{ display: 'flex', flexDirection: 'column' }}>
                <Grid container item wrap="nowrap">
                    <Grid item xs={6}>
                        <DateFieldValidator
                            ref={ref => this.dateOfBirthRef = ref}
                            key={date_format}
                            id={id + '_dateOfBirth'}
                            InputProps={{ className: classes.birth_date_form_input }}
                            label={<>DOB {isRequired ? <RequiredIcon /> : null}</>}
                            inputVariant="outlined"
                            disabled={comDisabled}
                            format={date_format}
                            onChange={e => this.handleOnChange(e, 'dob')}
                            onFocus={this.handleDateOnFocus}
                            onBlur={e => this.handleDateOnBlur(e, 'dob')}
                            value={dobValue}
                            isRequired
                            disableFuture
                            validByBlur
                            absoluteMessage
                            {...dobProps}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <SelectFieldValidator
                            id={id + '_exactDob'}
                            options={exact_dobList && exact_dobList.map((item) => (
                                { value: item.code, label: item.engDesc }))}
                            value={exact_dobValue}
                            onChange={e => this.handleOnChange(e.value, 'exactDobCd')}
                            isDisabled={comDisabled}
                            absoluteMessage
                            validators={[ValidatorEnum.required]}
                            errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            TextFieldProps={{
                                variant: 'outlined',
                                label: <>DOB Format<RequiredIcon /></>
                            }}
                            {...exactDobProps}
                        />
                    </Grid>
                </Grid>
            </FormControl>
        );
    }
}

export default withStyles(styles)(EcsDateBirthField);