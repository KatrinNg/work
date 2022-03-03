import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import { Grid } from '@material-ui/core';
import { PAGE_STATUS } from '../../../enums/administration/roomManagement/roomManagementEnum';
import RoomList from './component/roomList';
import RoomDetail from './component/roomDetail/roomDetail';
import { resetAll } from '../../../store/actions/administration/roomManagement/roomManagementActions';

const styles = () => ({
    root: {
        height: '100%'
    }
});
class RoomManagement extends React.Component {
    componentWillUnmount() {
        this.props.resetAll();
    }

    render() {
        const { classes, pageStatus,isSystemAdmin,isServiceAdmin,isClinicalAdmin } = this.props;
        const isGeneralUser=!isSystemAdmin&&!isServiceAdmin&&!isClinicalAdmin;
        // const pageStatus = PAGE_STATUS.VIEWING;
        return (
            <Grid className={classes.root}>
                {
                    pageStatus === PAGE_STATUS.VIEWING ? <RoomList isGeneralUser={isGeneralUser}/> : <RoomDetail isGeneralUser={isGeneralUser}/>
                }
            </Grid>
        );

    }
}

const mapState = (state) => {
    return {
        pageStatus: state.roomManagement.pageStatus,
        isSystemAdmin: state.login.isSystemAdmin,
        isServiceAdmin: state.login.isServiceAdmin,
        isClinicalAdmin: state.login.isClinicalAdmin
    };
};

const dispatch = {
    resetAll
};

export default connect(mapState, dispatch)(withStyles(styles)(RoomManagement));