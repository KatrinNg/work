import React, { Component } from 'react';
import { connect } from 'react-redux';
// import {
//     Dialog,
//     Backdrop,
//     CircularProgress
// } from '@material-ui/core';
import timg from '../../../images/timg.gif';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    backdrop: {
        width: '100%',
        height: '100%',
        // backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: theme.zIndex.drawer + 9999,
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cleanMask: {
        width: '100%',
        height: '100%',
        // backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: theme.zIndex.snackbar - 1,
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
    // backdrop: {
    //     zIndex: theme.zIndex.drawer + 1,
    //     color: '#fff'
    // }
});

class CommonCircular extends Component {

    render() {
        const { classes } = this.props;
        return (
            // <Dialog open={this.props.open}>
            //     <img src={timg} alt={''} />
            // </Dialog>
            <div className={this.props.openCleanMask ? classes.cleanMask : classes.backdrop}
                style={{ display: this.props.open || this.props.openCleanMask ? 'flex' : 'none'}}
                id={'loadingBar'}
            >
                {!this.props.openCleanMask &&
                    <img src={timg} alt={''} />
                }
                {/* <Backdrop
                    className={classes.backdrop}
                    open={this.props.open}
                >
                    <img src={timg} alt={''} />
                </Backdrop> */}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        open: state.common.openCommonCircular,
        openCleanMask: state.common.openCleanMask
    };
};

export default connect(mapStateToProps)(withStyles(styles)(CommonCircular));