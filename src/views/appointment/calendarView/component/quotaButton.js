import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import {
    Grid
} from '@material-ui/core';
import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import moment from 'moment';
import Enum from '../../../../enums/enum';
import _ from 'lodash';
import * as AppointmentUtil from '../../../../utilities/appointmentUtilities';

const styles =() => ({
    button: {
        'backgroundColor': 'white',
        'color': 'black',
        'marginBottom': '0.2rem',
        'marginTop': '0px',
        'borderRadius': '5rem',
        'paddingLeft': '1rem',
        'paddingRight': '1rem',
        'fontWeight': 'bold',
        'width': '100%',
        'minWidth': '4.5rem',
        'cursor': 'pointer',
        'height': '1.7rem',
        'textTransform': 'none',
        'border': '0.05rem solid black',
        transition: 'filter 0.3s ease-in-out',
        '&:hover': {
            filter: 'brightness(0.8)'
        }
    }
});

class QuotaButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isShowAvailable: false
        };
    }

    componentDidMount() {
        let where = { serviceCd: this.props.serviceCd, siteId: this.props.siteId };
        let configValue = AppointmentUtil.getQuotaDisplaySiteParams(where);
        if (configValue === 'Booked') {
            this.setState({ isShowAvailable: false });
        } else if (configValue === 'Available') {
            this.setState({ isShowAvailable: true });
        }
    }

    colorMap = (obj, qtBooked, qt, blocked) =>{
        let styleObj = {...obj};
        styleObj.backgroundColor = 'white';
        if (blocked) {
            styleObj.backgroundColor = 'grey';
            styleObj.color = 'white';
        }
        else {
            if(qtBooked * 100 / qt < 30 ){
                styleObj.backgroundColor = 'white';
            }
            else if(qtBooked * 100 / qt < 70 ){
                styleObj.backgroundColor = 'yellow';
            }
            else if(qtBooked * 100 / qt < 99 ){
                styleObj.backgroundColor = 'tomato';
            }
            else if(qtBooked * 100 / qt >= 100 ){
                styleObj.backgroundColor = 'violet';
            }
            styleObj.color = 'black';
        }
        return styleObj;
    }

    mapQuotaName = (qt ) =>{
        if (this.props.quotaName){
            let data = this.props.quotaName;
            if (data[qt + 'Shortname']){
                return data[qt + 'Shortname'];
            }
            return data[qt + 'Name'];
        }else
            return qt;
    }

    handleBookQuota = (data) =>{

        let today = moment();
        let datetimeDiff = -1;
        const { calendar } = data;
        //if (calendar === 'month') {
            //datetimeDiff = data.datetime.diff(today, 'days');
        //} else if (calendar === 'week') {
            //datetimeDiff = data.end - today  ;
        //} else if (calendar === 'day') {
            //datetimeDiff = data.datetime - today ;
        //}

        //updated by Irving Wu for calendar view bug fixes
        // let sDay = data.datetime.startOf('day');
        // let sToday = today.startOf('day');
        let sDay = _.cloneDeep(data.datetime).startOf('day');
        let sToday =today.startOf('day');
        datetimeDiff = sDay.diff(sToday, 'days');

        if (datetimeDiff >= 0) {
            this.props.bookQuota(data);
        } else {
            this.props.openCommonMessage({
                msgCode: '130400'
            });
        }
    }

    render() {
        const {classes, quotasData, calendar, bookingData, viewOnly} = this.props;
        const { isShowAvailable } = this.state;
        let divStyle = {};
        if( typeof (quotasData.quotas) === 'undefined'){
            return (
                 <span></span>
            );
        }
        else {
            let formatedQuotasData = {
                quotas:{},
                quotasBooked:{}
            };
            let tmp = [...Array(8).keys()];
            for (let i = 0; i < tmp.length; i++ ){
                formatedQuotasData.quotas['qt' + (i + 1)] = quotasData.quotas && quotasData.quotas['qt' + (i + 1)]? quotasData.quotas['qt' + (i + 1)]: 0;
                formatedQuotasData.quotasBooked['qt' + (i + 1) + 'Booked'] = quotasData.quotasBooked && quotasData.quotasBooked['qt' + (i + 1) + 'Booked']? quotasData.quotasBooked['qt' + (i + 1) + 'Booked']: 0;
            }
            let quotas = formatedQuotasData.quotas;
            let quotasBooked = formatedQuotasData.quotasBooked;
            let overallQt = quotasData.overallQt;
            let isUnavailable = quotasData.isUnavailable;
            for ( let quotaKey in quotas ){
                if (quotas[quotaKey] === 0 ){
                    delete quotas[quotaKey];
                }
            }
            let quotaKeys = Object.keys(quotas);
            if(quotaKeys.length === 0){
                return (<span></span>);
            }
            else {
                let layout = 12;
                let qtDom = {};
                for( let i = 0; i < quotaKeys.length; i++ ){
                    qtDom['qtBooked' + i] = quotasBooked[quotaKeys[i] + 'Booked'];
                    qtDom['qt' + i] = quotas[quotaKeys[i]];
                    qtDom['avaQt' + i] = quotas[quotaKeys[i]] - quotasBooked[quotaKeys[i] + 'Booked'];
                    qtDom['avaQt' + i] =  qtDom['avaQt' + i]< 0 ? 0 : qtDom['avaQt' + i];
                    qtDom['divStyle' + i] = {...divStyle, width: '98%'};
                }
                let blocked = isUnavailable || overallQt === 0;
                return (
                    <>
                        <Grid container spacing={0}>
                        {
                            quotaKeys.map((qtKey, i)=>{
                                let name = this.mapQuotaName(quotaKeys[i] );
                                if ( calendar === 'day'){
                                    layout = 6;
                                }
                                if(quotaKeys.length > 2){
                                    layout = 6;
                                }
                                if(quotaKeys.length > 5){
                                    layout = 4;
                                }
                                return(
                                <Grid key={i} item xs={layout}>
                                    {
                                        !qtDom['qt' + i]? null:
                                        <Grid  >
                                            <Button
                                                className={classes.button}
                                                disabled={blocked || viewOnly}
                                                onClick={()=>{this.handleBookQuota({
                                                    ...bookingData,
                                                    quota: qtKey
                                                    });
                                                }}
                                                style={this.colorMap(qtDom['divStyle' + i], qtDom['qtBooked' + i], qtDom['qt' + i], blocked)}
                                            >
                                                {name}:{isShowAvailable ? qtDom['avaQt' + i] : qtDom['qtBooked' + i]}{'/' + (blocked ? 0 : quotas[quotaKeys[i]])}
                                            </Button>
                                        </Grid>
                                    }
                                </Grid>
                                );
                            })
                        }
                        </Grid>
                    </>
                );
            }
        }
    }
}

const mapStateToProps = (state) => {
    return {
        serviceCd: state.login.service.svcCd,
        siteId: state.login.clinic.clinicCd
    };
};

const mapDispatchToProps = {
    openCommonMessage
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(QuotaButton));
