import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import {
    Grid
} from '@material-ui/core';
import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import moment from 'moment';

const styles =() => ({
    button: {
        'color': 'black',
        'marginBottom': '0.2rem',
        'marginTop': '0px',
        'borderRadius': '1rem',
        'paddingLeft': '1rem',
        'paddingRight': '1rem',
        'fontWeight': 'bold',
        'width': '100%',
        'minWidth': '4.5rem',
        'cursor': 'pointer',
        'height': 'auto',
        'textTransform': 'none',
        'border': '0.05rem solid black',
        transition: 'filter 0.3s ease-in-out',
        '&:hover': {
            filter: 'brightness(1.5)'
        }
    }
});

class UnavaButton extends Component {
    constructor(props) {
        super(props);
    }

    colorMap = ( obj, qtBooked, qt) =>{
        let styleObj = {...obj};
         styleObj.backgroundColor = 'white';
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
        // const { calendar } = data;
        //if (calendar === 'month') {
            //datetimeDiff = data.datetime.diff(today, 'days');
        //} else if (calendar === 'week') {
            //datetimeDiff = data.end - today  ;
        //} else if (calendar === 'day') {
            //datetimeDiff = data.datetime - today ;
        //}
        datetimeDiff = data.datetime.diff(today, 'days');
        if (datetimeDiff >= 0) {
            this.props.bookQuota(data);
        } else {
            this.props.openCommonMessage({
                msgCode: '130400'
            });
        }
    }

    render() {
        const {classes, items, remarks} = this.props;
        if( typeof (items) === 'undefined'){
            return (
                 <span></span>
            );
        }
        else {
            //let slots = data.items;
            if(items.length === 0){
                return (<span></span>);
            }
            else {
                let layout = 12;
                // Only show the first item
                let first = [items[0]];
                return (
                    <>
                        <Grid container spacing={0}>
                        {
                            first.map((item, i)=>{
                                return(
                                <Grid key={i} item xs={layout}>
                                    {
                                        <Grid>
                                            <Button
                                                className={classes.button}
                                                style={{
                                                    backgroundColor:'grey'
                                                }}
                                            >
                                            {
                                                remarks.map((remark, i)=><span key={i}>{item[remark]}</span>)
                                            }
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
    return {};
};

const mapDispatchToProps = {
    openCommonMessage
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(UnavaButton));
