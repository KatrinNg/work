import React from 'react';
import { connect } from 'react-redux';
import {
    Typography,
    Grid,
    Tabs,
    Tab,
    IconButton
} from '@material-ui/core';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { withStyles } from '@material-ui/core/styles';
import MyFavourite from './myFavourite/myFavourite';
import DrugHistory from './drugHistory/drugHistory';
import DepartmentFavourite from './departmentFavourite/departmentFavourite';
// import {
//     getDeptFavouriteList
// } from '../../../store/actions/moe/departmentFavourite/departmentFavouriteAction';
import { resizeHeight } from '../../../utilities/moe/moeUtilities';
import { RESIZEHEIGHT_PANEL } from '../../../enums/moe/moeEnums';

const styles = () => ({
    root: {
        display: 'flex',
        overFlowY: 'auto'
    },
    // appBar: {
    //     transition: theme.transitions.create(['margin', 'width'], {
    //         easing: theme.transitions.easing.sharp,
    //         duration: theme.transitions.duration.leavingScreen
    //     })
    // },
    drawerHeader: {
        display: 'flex',
        alignItems: 'center',
        // padding: '0 8px',
        justifyContent: 'flex-end'
    },
    minHeightContainer: {
        minHeight: 300
    },
    minTabHeight: {
        maxHeight: `calc(${window.screen.availHeight - 300}px)`
    },
    hide: {
        display: 'none'
    },
    nephele_content_body: {
        width: 'calc(100% - 22px)',
        padding: '5px 10px',
        backgroundColor: 'white',
        borderTop: '1px solid #e6e6e6',
        fontSize: '14px'
    }
});
const maxWidth = '580';
class SlideLayer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            tabValue: 0,
            drugSlideLayerHeight: 0
        };
    }

    componentDidMount() {
        this.setState({
            drugSlideLayerHeight: resizeHeight(
                RESIZEHEIGHT_PANEL.OUTMOST_MOE_SLIDELAYER_CONTAINER.ID,
                RESIZEHEIGHT_PANEL.OUTMOST_MOE_SLIDELAYER_CONTAINER.MINUEND()
            )
        });
    }

    changeTabValue = (event, value) => {
        this.setState({ tabValue: value });
    }
    // getDeptFavouriteList = () => {
    //     if (this.props.deptFavouriteList && this.props.deptFavouriteList.length > 0) return;
    //     let params = {
    //         'department': true,
    //         'searchString': ''
    //         // 'userId': this.props.loginInfo.user.loginId//.user.moeCaseNo.loginId
    //     };
    //     this.props.getDeptFavouriteList(params);
    // }
    render() {
        const { id, open, classes, patient } = this.props;
        // let {gridHeight} = this.props;
        // gridHeight = this.state.drugHistoryHeight;
        // console.log('slideLayer-render()', gridHeight, this.state.drugHistoryHeight);
        return (
            <Typography component={'div'}
                className={classes.root}
                style={{ margin: 0, padding: 0, transition: 'width 0.5s', width: open ? '100%' : '35px', position: 'relative' }}
            >
                <Grid item style={{ display: open ? 'block' : 'none', width: '100%' }} >
                    <Tabs
                        value={this.state.tabValue}
                        onChange={this.changeTabValue}
                        indicatorColor={'primary'}
                        style={{ marginTop: 10 }}
                        id={id + '_tabs'}
                    >
                        <Tab id={id + '_historyTab'} label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>Drug History</Typography>} className={this.state.tabValue === 0 ? 'tabSelected' : 'tabNavigation'} />
                        <Tab id={id + '_myFavoriteTab'} label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>My Favourite</Typography>} className={this.state.tabValue === 1 ? 'tabSelected' : 'tabNavigation'} />
                        <Tab
                            id={id + '_deptFavouriteTab'}
                            // onClick={this.getDeptFavouriteList}
                            label={<Typography style={{ fontSize: 16, textTransform: 'none' }}>Department Favourite</Typography>} className={this.state.tabValue === 2 ? 'tabSelected' : 'tabNavigation'}
                        />
                    </Tabs>
                    <Grid className={classes.nephele_content_body} dptid={'outmost_moe_slayer_container'} style={{ height: this.state.drugSlideLayerHeight }}>
                        <Typography component={'div'} style={{ /*maxHeight: `calc(${this.props.gridHeight}px)`,*/ display: this.state.tabValue === 0 ? 'block' : 'none' }} >
                            <DrugHistory
                                id={id + '_drugHistory'}
                                patient={patient}
                                confirmDrug={this.props.confirmDrug}
                                // gridHeight={gridHeight}
                                maxWidth={maxWidth}
                                handleCheckAllergen={this.props.handleCheckAllergen}
                                handleAddDrugToPriscription={this.props.handleAddDrugToPriscription}
                                tabValue={this.state.tabValue === 0 ? true : false}
                            />
                        </Typography>
                        <Typography component={'div'} style={{ /*maxHeight: `calc(${this.props.gridHeight}px)`,*/ display: this.state.tabValue === 1 ? 'block' : 'none' }}>
                            <MyFavourite
                                id={id + '_myFavourite'}
                                patient={patient}
                                confirmDrug={this.props.confirmDrug}
                                // gridHeight={gridHeight}
                                handleAddDrugToPriscription={this.props.handleAddDrugToPriscription}
                                handleMyFavRemarkOk={this.props.handleMyFavRemarkOk}
                                showMyFavRemarkDialog={this.props.showMyFavRemarkDialog}
                                myFavRemarkData={this.props.myFavRemarkData}
                                handleMyFavRemarkCancel={this.props.handleMyFavRemarkCancel}
                                tabValue={this.state.tabValue === 1 ? true : false}
                            />
                        </Typography>
                        <Typography component={'div'} style={{/* maxHeight: `calc(${this.props.gridHeight}px)`,*/display: this.state.tabValue === 2 ? 'block' : 'none' }}>
                            <DepartmentFavourite
                                id={id + '_departmentFavourite'}
                                // gridHeight={gridHeight}
                                handleAddDrugToPriscription={this.props.handleAddDrugToPriscription}
                                tabValue={this.state.tabValue === 2 ? true : false}
                            />
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item style={{ position: 'absolute', right: '0px' }}>
                    {!open ?
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            onClick={() => this.props.toggleDrawer(true)}
                            edge="start"
                            id={id + '_openLeftMenu'}
                        >
                            <ChevronRightIcon />
                        </IconButton>
                        : <IconButton
                            onClick={() => this.props.toggleDrawer(false)}
                            id={id + '_closeLeftMenu'}
                          >
                            <ChevronLeftIcon />
                        </IconButton>
                    }
                </Grid>
            </Typography>
        );
    }
}
const mapStateToProps = (state) => ({
    // loginInfo: state.moe.loginInfo,
    deptFavouriteList: state.departmentFavourite.deptFavouriteList
});
const mapDispacthToProps = {
    // getDeptFavouriteList
};
export default connect(mapStateToProps, mapDispacthToProps)(withStyles(styles)(SlideLayer));

