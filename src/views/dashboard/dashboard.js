import React, { Component } from 'react';
import Chart from 'react-apexcharts';
import { connect } from 'react-redux';
import moment from 'moment';
import Enum from '../../enums/enum';
import { data, fieldLabels } from './jsonData';
import { Grid, Tabs, Tab, Typography } from '@material-ui/core';
import DatePicker from '../../components/FormValidator/DateFieldValidator';
import RequiredIcon from '../../components/InputLabel/RequiredIcon';
import ValidatorForm from '../../components/FormValidator/ValidatorForm';
import CIMSButton from '../../components/Buttons/CIMSButton';
import withWidth from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';
import SelectFieldValidator from '../../components/FormValidator/SelectFieldValidator';
import ValidatorEnum from '../../enums/validatorEnum';
import CommonMessage from '../../constants/commonMessage';
import {dateComparator} from '../../utilities/dateUtilities';
import _ from 'lodash';

const styles = theme => ({
    root: {
        width: '100%',
        height: '7rem',
        overflow: 'unset',
        padding: '10px'
    },
    mt20: {
        marginTop:'20px'
    }
});

const heatMapChartsId = 'dashboard_heat_map_charts';
const barChartsId = 'dashboard_bar_charts';

class Dashboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            heatMapChartsOption:{
                chart: {
                    height: 350,
                    type: 'heatmap',
                    id:heatMapChartsId
                },
                legend: {
                    // position: 'right'
                    fontSize: '14px'
                },
                plotOptions: {
                    heatmap: {
                        shadeIntensity: 0.5,
                        radius: 0,
                        useFillColorAsStroke: false,
                        distributed: true,
                        colorScale: {
                            ranges: [{
                                from: 0,
                                to: 10,
                                color: '#00A100'
                            }
                            // {
                            //     from: 3,
                            //     to: 4,
                            //     color: '#DDEEA7'
                            // },
                            // {
                            //     from: 5,
                            //     to: 6,
                            //     color: '#9AD06B'
                            // },
                            // {
                            //     from: 7,
                            //     to: 8,
                            //     color: '#298D51'
                            // },
                            // {
                            //     from: 9,
                            //     to: 10,
                            //     color: '#186B3A'
                            // }
                            ]
                        }
                    }
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    width: 1
                },
                xaxis: {
                    title: {
                        text: 'Data',
                        style: {
                            fontWeight:400
                        }
                    }
                }
            },
            heatMapChartsData:[
                // {
                // name: 'Series 11',
                // data: [{
                //         x: 'W1',
                //         y: 22
                //     }, {
                //         x: 'W2',
                //         y: 29
                //     }, {
                //         x: 'W3',
                //         y: 13
                //     }, {
                //         x: 'W4',
                //         y: 32
                //     }]
                // },
                // {
                // name: 'Series 22',
                // data: [{
                //         x: 'W1',
                //         y: 43
                //     }, {
                //         x: 'W2',
                //         y: 43
                //     }, {
                //         x: 'W3',
                //         y: 43
                //     }, {
                //         x: 'W4',
                //         y: 43
                //     }]
                // }
            ],
            barChartsOption:{
                chart: {
                    type: 'bar',
                    height: 350,
                    id: barChartsId
                },
                plotOptions: {
                    bar: {
                        borderRadius: 4,
                        horizontal: true
                    }
                },
                dataLabels: {
                 enabled: false
                },
                xaxis: {
                    categories: [],
                    title: {
                        text: 'Count',
                        style: {
                            fontWeight:400
                        }
                    }
                },
                colors: ['#146738']
            },
            barChartsData:[{
                data: []
              }],
            fromData: '2021-01-01',
            toData: '2021-12-31',
            lastRightDate: null,
            tabVal: 0,
            assessment:'assessment_count'
        };
    };

    componentDidMount() {
        this.renderHeatMapCharts();
        this.renderBarCharts();
    }

    renderHeatMapCharts = () => {
        let updateData = [], xData = [];
        data.map((item) => {
            let x = moment(item.appointment_date).format(Enum.DATE_FORMAT_FOCUS_DMY_VALUE);
            let y = item[this.state.assessment];
            if(this.state.assessment === 'assessment_count'){
                y = item.new_assessment_count+item.old_assessment_count;
            }
            let dateFormat = moment(item.appointment_date).format(Enum.DATE_FORMAT_EYMD_VALUE);
            if(dateComparator(dateFormat,moment(this.state.fromData).format(Enum.DATE_FORMAT_EYMD_VALUE)) >= 0 && dateComparator(moment(this.state.toData).format(Enum.DATE_FORMAT_EYMD_VALUE), dateFormat) >= 0){
                if(xData.indexOf(item.site_cod) == -1){
                    xData.push(item.site_cod);
                    let obj = {
                        name: item.site_cod,
                        data: [{
                            x: x,
                            y: y
                        }]
                    };
                    updateData.push(obj);
                }else{
                    for(let k of updateData){
                        if(k.name === item.site_cod){
                            k.data.push({
                                x: x,
                                y: y
                            });
                        }
                    }
                }
            }
        });
        this.setState({
            heatMapChartsOption: this.state.heatMapChartsOption,
            heatMapChartsData: updateData
        });
        console.log('heatmap',updateData);
    }

    renderBarCharts = () => {
        let categories = [], seriesData = [];
        data.map((item) => {
            let assessment = item[this.state.assessment];
            let dateFormat = moment(item.appointment_date).format(Enum.DATE_FORMAT_EYMD_VALUE);
            if(this.state.assessment === 'assessment_count'){
                assessment = item.new_assessment_count+item.old_assessment_count;
            }
            if(dateComparator(dateFormat,moment(this.state.fromData).format(Enum.DATE_FORMAT_EYMD_VALUE)) >= 0 && dateComparator(moment(this.state.toData).format(Enum.DATE_FORMAT_EYMD_VALUE), dateFormat) >= 0){
                if(categories.indexOf(item.site_cod) == -1){
                    categories.push(item.site_cod);
                    seriesData.push(assessment);
                }else{
                    seriesData[categories.indexOf(item.site_cod)] += assessment;
                }
            }
        });
        let _barChartsOption = _.cloneDeep(this.state.barChartsOption);
        _barChartsOption.xaxis.categories = categories;
        this.setState({
            barChartsOption: _barChartsOption,
            barChartsData: [{
                name: 'Value',
                data: seriesData
            }]
        });
    }

    isValueChanged = (state_value, props_value) => {
        if (props_value && state_value) {
            return !moment(state_value).isSame(moment(props_value), 'day');
        } else {
            return !props_value && !state_value ? false : true;
        }
    }

    handleDateChange = (value, name) => {
        let dateDto = {
            [name]: value
        };
        this.setState({ ...dateDto }, () => {
            this.renderHeatMapCharts();
            this.renderBarCharts();
        });
    }

    handleDateAccept = (value, name) => {
        let dateDto = {
            [name]: value
        };
        this.setState({ ...dateDto });
    }

    assessmentOnChange = (e) => {
        this.setState({
            assessment: e.value
        },()=>{
            this.renderHeatMapCharts();
            this.renderBarCharts();
        });
    }

    render(){
        const { classes} = this.props;
        return (
            <Grid container className={classes.root}>
                <ValidatorForm ref={r => this.dashboardFormRef = r} >
                    <Grid container item spacing={1} alignItems="center">
                        <Grid item xs={4}>
                            <DatePicker
                                id="dashboard_fromDate"
                                ref={r => this.fromDateRef = r}
                                inputVariant="outlined"
                                label={<>From Date<RequiredIcon /></>}
                                value={this.state.fromData}
                                isRequired
                                maxDate={
                                    moment(this.state.toData).isValid() ?
                                        moment(this.state.toData).format(Enum.DATE_FORMAT_EYMD_VALUE) : '2100-01-01'
                                }
                                onChange={e => this.handleDateChange(e, 'fromData')}
                                onBlur={e => this.handleDateAccept(e, 'fromData')}
                                onAccept={e => this.handleDateAccept(e, 'fromData')}
                                absoluteMessage
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <DatePicker
                                id="dashboard_toDate"
                                ref={r => this.toDateRef = r}
                                inputVariant="outlined"
                                label={<>To Date</>}
                                value={this.state.toData}
                                isRequired
                                minDate={
                                    moment(this.state.fromData).isValid() ?
                                        moment(this.state.fromData).format(Enum.DATE_FORMAT_EYMD_VALUE) :
                                        moment().format(Enum.DATE_FORMAT_EYMD_VALUE)
                                }
                                onChange={e => this.handleDateChange(e, 'toData')}
                                onBlur={e => this.handleDateAccept(e, 'toData')}
                                onAccept={e => this.handleDateAccept(e, 'toData')}
                                absoluteMessage
                            />
                        </Grid>
                        <Grid item xs={4}>
                            {/* <CIMSButton
                                id={'dashboard_today'}
                            >Today</CIMSButton> */}
                        </Grid>
                    </Grid>
                    <Grid container className={classes.mt20}>
                        <Tabs
                            value={this.state.tabVal}
                            indicatorColor={'primary'}
                            onChange={(e,newValue)=>{
                                this.setState({tabVal:newValue});
                            }}
                        >
                            <Tab id={`dashboard_tabs_tab_date_view`} label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>Date View</Typography>} />
                            {/* <Tab id={`dashboard_tabs_tab_month_view`} label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>Month View</Typography>} /> */}
                        </Tabs>
                    </Grid>
                    <Grid container className={classes.mt20}>
                        <Grid item xs={6}>
                            <SelectFieldValidator
                                id={'dashboard_assessment'}
                                placeholder=""
                                options={fieldLabels}
                                TextFieldProps={{
                                    variant: 'outlined',
                                    label: <>Assessment<RequiredIcon /></>
                                }}
                                value={this.state.assessment}
                                onChange={this.assessmentOnChange}
                                absoluteMessage
                                validators={[ValidatorEnum.required]}
                                errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                            />
                        </Grid>
                    </Grid>
                </ValidatorForm>
                <Grid container className={classes.mt20}>
                    <Grid item xs={6}>
                        <Chart id={heatMapChartsId} options={this.state.heatMapChartsOption} series={this.state.heatMapChartsData} type="heatmap" width={500} height={320} />
                    </Grid>
                    <Grid item xs={6}>
                        <Chart id={barChartsId} options={this.state.barChartsOption} series={this.state.barChartsData} type="bar" width={500} height={320} />
                    </Grid>
                </Grid>
            </Grid>
        );
    }
};

export default connect()(withWidth()(withStyles(styles)(Dashboard)));