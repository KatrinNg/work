import React, { Component } from 'react';
import { connect } from 'react-redux';
import Dialog from '@material-ui/core/Dialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import { resetCommonCircular } from '../../../store/actions/common/commonAction';

class CommonCircularDialog extends Component {
    componentDidMount(){
        this.props.resetCommonCircular();
    }

    render() {
        return (
            <Dialog PaperProps={{
                style: {
                  boxShadow: 'none',
                  backgroundColor: 'rgb(127,127,127,0)',
                  overflow:'hidden'
                }
              }}
                open={this.props.open}
            >
                 <CircularProgress style={{width:'60px',height:'60px'}} />
            </Dialog>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        open: state.common.openCommonCircularDialog
    };
};

const mapDispatch = {
    resetCommonCircular
};

export default connect(mapStateToProps, mapDispatch)(CommonCircularDialog);