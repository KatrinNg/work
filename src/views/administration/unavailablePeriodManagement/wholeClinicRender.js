import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
    Grid, Checkbox
} from '@material-ui/core';

const styles = () => ({
    container: {
        padding: '10px 0px'
    }
});

class WholeClinicRender extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { rowIndex, colDef, data } = this.props;
        return (
            <Grid container>
                <Checkbox
                    id={`upmList_${colDef.field}_${rowIndex}`}
                    color="primary"
                    checked={data && data['isWhl'] ? true : false}
                    disabled
                />
            </Grid>
        );
    }
}

export default (withStyles(styles)(WholeClinicRender));