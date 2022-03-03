import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import NoticeViewer from './noticeViewer';
import { listNotice, resetAll } from '../../../store/actions/administration/noticeBoard/noticeBoardAction';

const styles = () => ({
    root: {
        height: '100%'
    }
});
class NoticeBoard extends React.Component {
    componentDidMount() {
        this.props.listNotice();
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    render() {
        // const classes = useSytles();
        const { classes } = this.props;
        return (
            <Grid className={classes.root}>
                <NoticeViewer />
            </Grid>
        );
    }
}

const mapState = (state) => {
    return {
        pageStatus: state.userAccount.pageStatus
    };
};

const mapDispatch = {
    listNotice,
    resetAll
};

export default connect(mapState, mapDispatch)(withStyles(styles)(NoticeBoard));