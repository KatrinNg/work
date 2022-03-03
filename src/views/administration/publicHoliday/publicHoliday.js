import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import { Grid, FormControl } from '@material-ui/core';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import CIMSTable from '../../../components/Table/CIMSTable';
import {
    updateField,
    listHoliday,
    printHolidayList,
    resetAll
} from '../../../store/actions/administration/publicHoliday/publicHolidayAction';
import {
    openCommonCircular
} from '../../../store/actions/common/commonAction';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import ValidatorEnum from '../../../enums/validatorEnum';
import CommonMessage from '../../../constants/commonMessage';
import TextFieldValidator from '../../../components/FormValidator/TextFieldValidator';
import RequiredIcon from '../../../components/InputLabel/RequiredIcon';

const styles = () => ({
    root: {
        width: '100%',
        display: 'flex',
        height: '100%',
        flexFlow: 'column',
        padding: 4
    },
    dateInput: {
        marginLeft: 20
    },
    form_input: {
        width: '50%'
    },
    form_root: {
        width: '100%'
    }

});

class PublicHoliday extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableRows: [
                { name: 'dateStr', label: 'Date', width: 120 },
                { name: 'engDesc', label: 'Description' }
            ],
            tableStyle: {
                fontSize: '12pt',
                height: 'calc( 100vh - 316px)'
            },
            tableOptions: {
                rowsPerPage: 10,
                rowsPerPageOptions: [10],
                rowExpand: true
            }
        };
    }


    componentDidMount() {
        this.props.ensureDidMount();
        this.handleSearch();

        ValidatorForm.addValidationRule(ValidatorEnum.cmpValue, () => {
            return this.cmpValue();
        });
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    updateSearchParam = (value, name) => {
        // const minYear = 1990;
        // const maxYear = 2099;
        // const intYear = parseInt(value);
        // if (intYear < minYear || intYear > maxYear) {
        //     return;
        // }
        this.props.updateField({ [name]: value });
    }

    cmpValue = () => {
        const { yearFrom, yearTo } = this.props;
        return yearFrom <= yearTo;
    }

    handleSearch = () => {
        this.setState({ isSearch: true }, () => {
            this.refs.publicHolidayFormRef.submit();
        });
    }

    publicHolidaySubmit = () => {
        if (this.state.isSearch) {
            let { yearFrom, yearTo } = this.props;
            if (yearFrom.toString().length == 0 || yearTo.toString().length == 0) {
                return;
            }
            let searchParam = {
                yearFrom: yearFrom,
                yearTo: yearTo
            };
            this.props.listHoliday(searchParam, () => { this.tableRef.updatePage(0); });
            this.props.openCommonCircular();
        } else {
            let { yearFrom, yearTo } = this.props;
            let searchParam = {
                yearFrom: yearFrom,
                yearTo: yearTo
            };
            this.props.printHolidayList(
                searchParam
            );
        }
    }

    handlePrint = () => {
        this.setState({ isSearch: false }, () => {
            this.refs.publicHolidayFormRef.submit();
        });
    }

    dateInputBlur = () => {
        this.fromYearRef.validateCurrent();
        this.toYearRef.validateCurrent();
    }

    render() {
        const { classes, holidayList } = this.props;

        return (
            <Grid container className={classes.root}>
                <Grid container >
                    <Grid item container xs={9} alignItems={'center'}>
                        <ValidatorForm ref="publicHolidayFormRef" className={classes.form_root} onSubmit={this.publicHolidaySubmit}>
                            <Grid container spacing={2}>
                                <Grid item xs={5}>
                                    <FormControl className={classes.form_input}>
                                        <TextFieldValidator
                                            id={'publicHoliday_yearfrom_textField'}
                                            name={'yearFrom'}
                                            label={<>From Year<RequiredIcon /></>}
                                            ref={ref => this.fromYearRef = ref}
                                            value={this.props.yearFrom}
                                            validByBlur
                                            upperCase
                                            inputProps={{ maxLength: 4 }}
                                            validators={[
                                                ValidatorEnum.required,
                                                ValidatorEnum.cmpValue
                                            ]}
                                            errorMessages={[
                                                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                                CommonMessage.VALIDATION_NOTE_DATE_MUST_EARLIER('Year From', 'Year To')
                                            ]}
                                            msgPosition="bottom"
                                            onChange={e => this.updateSearchParam(e.target.value, e.target.name)}
                                            onBlur={this.dateInputBlur}
                                            type={'number'}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                                <Grid item xs={5}>
                                    <FormControl className={classes.form_input}>
                                        <TextFieldValidator
                                            id={'publicHoliday_yearto_textField'}
                                            name={'yearTo'}
                                            label={<>To<RequiredIcon /></>}
                                            ref={ref => this.toYearRef = ref}
                                            value={this.props.yearTo}
                                            validByBlur
                                            upperCase
                                            inputProps={{ maxLength: 4 }}
                                            validators={[
                                                ValidatorEnum.required,
                                                ValidatorEnum.cmpValue
                                            ]}
                                            errorMessages={[
                                                CommonMessage.VALIDATION_NOTE_REQUIRED(),
                                                CommonMessage.VALIDATION_NOTE_DATE_MUST_LATER('Year To', 'Year From')
                                            ]}
                                            msgPosition="bottom"
                                            onChange={e => this.updateSearchParam(e.target.value, e.target.name)}
                                            onBlur={this.dateInputBlur}
                                            type={'number'}
                                            fullWidth
                                        />
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </ValidatorForm>
                    </Grid>
                    <Grid item container xs={3} alignItems={'center'} justify={'flex-end'} >
                        <Grid>
                            <CIMSButton
                                id={'publicHoliday_search_button'}
                                variant={'contained'}
                                color={'primary'}
                                size={'small'}
                                onClick={this.handleSearch}
                                children={'Search'}
                            />
                            <CIMSButton
                                id={'publicHoliday_print_button'}
                                variant={'contained'}
                                color={'primary'}
                                size={'small'}
                                children={'Print'}
                                onClick={this.handlePrint}
                            />
                            <CIMSButton
                                id={'publicHoliday_exit_button'}
                                variant={'contained'}
                                color={'primary'}
                                size={'small'}
                                children={'Exit'}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container >
                    <CIMSTable
                        id={'publicHoliday_holiday_table'}
                        innerRef={ref => this.tableRef = ref}
                        rows={this.state.tableRows}
                        data={holidayList ? holidayList : null}
                        options={this.state.tableOptions}
                        totalCount={0}
                    />
                </Grid>
            </Grid>
        );
    }

}
const mapStateToProps = (state) => {
    return {
        ...state.publicHoliday
    };
};

const mapDispatchToProps = {
    updateField,
    listHoliday,
    printHolidayList,
    openCommonCircular,
    resetAll
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PublicHoliday));