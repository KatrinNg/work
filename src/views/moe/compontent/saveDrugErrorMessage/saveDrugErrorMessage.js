import React from 'react';
import { connect } from 'react-redux';
// import { withStyles } from '@material-ui/core/styles';
import {
    Typography,
    Grid
} from '@material-ui/core';

class SaveDrugErrorMessage extends React.Component {
    render() {
        return (
            <div>
                {this.props.isSaveSuccess === false
                    && this.props.saveMessageList
                    && Array.isArray(this.props.saveMessageList) ?
                    this.props.saveMessageList.map((item, index) => (
                        <Grid item container key={index} justify="flex-start">
                            <Typography color={'error'}>{`${item.fieldName}: ${item.errMsg}`}</Typography>
                        </Grid>
                    ))
                    : <Grid item container justify="flex-start">
                        <Typography color={'error'}>{this.props.saveMessageList}</Typography>
                    </Grid>
                }
            </div>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        isSaveSuccess: state.moe.isSaveSuccess,
        saveMessageList: state.moe.saveMessageList
    };
};
const mapDispatchToProps = {
};
export default connect(mapStateToProps, mapDispatchToProps)(SaveDrugErrorMessage);