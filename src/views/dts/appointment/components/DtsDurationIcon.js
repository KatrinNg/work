import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { Grid, Typography } from '@material-ui/core';

const styles = ({
    flexStart: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    flexEnd: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    text:{
        fontWeight: '800',
        fontSize: '13px'
    }
});

class DtsDurationIcon extends Component {

    getPath(remainder) {
        switch(remainder) {
        case 1:
            return 'M5 5 V1 A4 4 0 0 1 9 5';
        case 2:
            return 'M5 5 V1 A4 4 0 0 1 5 9';
        case 3:
            return 'M5 5 V1 A4 4 0 1 1 1 5';
        }
    }

    render(){
        const { classes, duration, iconType, ...rest } = this.props;

        const color = iconType == 'isSqueeze'? '#DC143C':'#338196';
        const text = `${Math.floor(duration / 4)} hr${duration >= 8? 's':''}`;
        const Icon = (
            <svg width="30" height="30" viewBox="0 0 10 10">
                <circle cx="5" cy="5" r="4" stroke={color} strokeWidth="1" fill="white" />
                {duration % 4 && <path d={this.getPath(duration % 4)} fill={color}/>}
            </svg>
        );

        return (
            <Grid container spacing="1">
                <Grid item xs={6} className={classes.flexEnd}>
                    <Typography className={classes.text}>{duration >= 4 && text}</Typography>
                </Grid>
                <Grid item xs={6} className={classes.flexStart}>{Icon}</Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(DtsDurationIcon);