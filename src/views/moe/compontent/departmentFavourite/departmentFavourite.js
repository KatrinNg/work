import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Typography,
    Grid,
    List,
    ListItem,
    IconButton,
    Collapse
} from '@material-ui/core';
import CommonSearch from './../../../compontent/commonSearch';
import * as moeUtilities from '../../../../utilities/moe/moeUtilities';
// import deleteIcon from '../../../../images/moe/cancel.png';
import minus from '../../../../images/moe/elbow-end-minus-lg2.gif';
import plus from '../../../../images/moe/elbow-end-plus-lg2.gif';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import * as prescriptionUtilities from '../../../../utilities/prescriptionUtilities';
import imgDangerDrug from '../../../../images/moe/dangerous_drug.png';
// import CIMSAlertDialog from '../../../../components/Dialog/CIMSAlertDialog';
// import MultipleRemarkDialog from './../editRemark/multipleRemarkDialog';
import {
    getDeptFavouriteList,
    updateField
} from '../../../../store/actions/moe/departmentFavourite/departmentFavouriteAction';
import _ from 'lodash';
import { resizeHeight } from '../../../../utilities/moe/moeUtilities';
import { RESIZEHEIGHT_PANEL } from '../../../../enums/moe/moeEnums';

const CustomList = withStyles({
    root: {
        padding: 0,
        margin: 0
    }
})(List);

const CustomListItem = withStyles({
    root: {
        minHeight: 30,
        padding: 0,
        margin: 0,
        width: '100%'
    }
})(ListItem);

const style = {

};
class DepartmentFavourite extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dptHeight: 0
        };
    }

    shouldComponentUpdate(nextProps) {
        const diffList = nextProps.deptFavouriteList !== this.props.deptFavouriteList;
        const diffCodeList = nextProps.codeList !== this.props.codeList;
        const diffTabValue = nextProps.tabValue !== this.props.tabValue && nextProps.tabValue;
        if (diffTabValue)
            this.setState({
                dptHeight: resizeHeight(
                    RESIZEHEIGHT_PANEL.OUTMOST_MOE_DEPTFAVER_CONTAINER.ID,
                    RESIZEHEIGHT_PANEL.OUTMOST_MOE_DEPTFAVER_CONTAINER.MINUEND()
                )
            });
        return diffList || diffCodeList || diffTabValue;
    }

    reCaculateHeight() {
        this.setState({
            dptHeight: resizeHeight(
                RESIZEHEIGHT_PANEL.OUTMOST_MOE_DEPTFAVER_CONTAINER.ID,
                RESIZEHEIGHT_PANEL.OUTMOST_MOE_DEPTFAVER_CONTAINER.MINUEND()
            )
        });
        console.log('reCaculateHeight()', this.state.myfavHeight);
    }

    handleCollapse = (item, index) => {
        let list = _.cloneDeep(this.props.deptFavouriteList);
        list.map((_item, i) => {
            if (i === index)
                _item.open = !_item.open;
            return _item;
        });
        let updateData = {
            deptFavouriteList: list
        };
        this.props.updateField(updateData);
    }

    searchList = (value) => {
        // if (!this.props.loginInfo) return;
        let params = {
            'department': true,
            'searchString': value
            // 'userId': this.props.loginInfo.user.loginId
        };
        this.props.getDeptFavouriteList(params);
    }

    //drag start
    handleDragStart = (event, item, isDrugSet) => {
        event.stopPropagation();
        event.dataTransfer.setData('isDrugSet', isDrugSet);
        event.dataTransfer.setData('flag', 'MOEDEPTFAV');
        event.dataTransfer.setData('item', JSON.stringify(item));
        event.target.style.opacity = '0.5';
        return false;
    }
    handleDragEnd = (event) => {
        event.target.style.opacity = '1';
    }
    //drag end
    render() {
        const { id, deptFavouriteList } = this.props;
        // let autoCalHeight = this.state.dptHeight;
        // if (document.querySelector('[dptid="outmost_moe_deptfaver_container"]')) {
        //     autoCalHeight = resizeHeight(
        //         RESIZEHEIGHT_PANEL.OUTMOST_MOE_DEPTFAVER_CONTAINER.ID,
        //         RESIZEHEIGHT_PANEL.OUTMOST_MOE_DEPTFAVER_CONTAINER.MINUEND()
        //     );
        //     console.log('deptfavour-render()---', autoCalHeight);
        // }
        let setting = moeUtilities.getMoeSetting();
        return <Typography component={'div'} style={{ position: 'relative' }}>
            <Grid container style={{ marginBottom: '5px' }}>
                <Grid style={{ width: '60px', paddingLeft: '25px' }}>Search:</Grid>
                <Grid style={{ paddingLeft: 10, width: 'calc(100% - 110px)' }}>
                    <CommonSearch
                        id={id + '_search'}
                        inputPlaceHolder={''}
                        limitValue={4}
                        inputMaxLength={256}
                        value={''}
                        onChange={this.searchList}
                    />
                </Grid>
            </Grid>

            <CustomList
                id={id + '_allItems'}
                dptid={'outmost_moe_deptfaver_container'}
                style={{
                    padding: 0,
                    margin: 0,
                    overflowY: 'auto',
                    height: this.state.dptHeight,
                    maxHeight: this.state.dptHeight
                }}
                component="nav"
                aria-labelledby="nested-list-subheader"
            >
                {deptFavouriteList && deptFavouriteList.map((item, index) => {
                    return (
                        <Typography component={'div'}
                            key={index}
                        >
                            {item.myFavouriteName ?
                                <CustomListItem
                                    id={id + '_parentItem' + index}
                                    style={{ position: 'relative' }}
                                    onMouseOver={this.handleMouseOver}
                                    onMouseOut={this.handleMouseOut}
                                    divider
                                    className={'listItem'}
                                    draggable
                                    onDragStart={e => this.handleDragStart(e, item, true)}
                                    onDragEnd={this.handleDragEnd}
                                >
                                    <Grid container>
                                        <Grid>
                                            <IconButton id={id + '_parentCollapseBtn' + index} style={{ padding: 0 }} onClick={() => this.handleCollapse(item, index)}>
                                                <img src={item.open ? minus : plus} alt={''} data-extendicon />
                                            </IconButton>
                                        </Grid>
                                        <Grid style={{ fontWeight: 'bold' }} id={id + '_myFavouriteName' + index}>
                                            {item.myFavouriteName}
                                        </Grid>
                                        <Grid style={setting.isEnquiry ? { display: 'none' } : null}>
                                            <IconButton
                                                id={id + '_parentAddToDrugBtn' + index}
                                                style={{ position: 'absolute', right: 5, padding: 0 }}
                                                onClick={() => this.props.handleAddDrugToPriscription(item, true)}
                                            >
                                                <ChevronRightIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </CustomListItem>
                                : null
                            }
                            <Collapse in timeout="auto" unmountOnExit style={{ margin: 0, display: item.open || !item.myFavouriteName ? 'block' : 'none' }}>
                                <List component="div" disablePadding id={id + '_allSubItems' + index}>
                                    {item && item.moeMedProfiles.map((subItem, subIndex) => {
                                        let title = prescriptionUtilities.generatePanelTitle(subItem, this.props.codeList, true);
                                        let disableSubItem = !moeUtilities.isAvailable(subItem);
                                        let fontColor = null;
                                        if (disableSubItem) fontColor = 'grey';
                                        return (
                                            <CustomListItem
                                                // button
                                                className={'listItem'}
                                                key={subIndex}
                                                onMouseOver={this.handleMouseOver}
                                                onMouseOut={this.handleMouseOut}
                                                divider
                                                id={id + '_parent' + index + '_childrenItem' + subIndex}
                                                draggable
                                                onDragStart={e => this.handleDragStart(e, subItem, false)}
                                                onDragEnd={this.handleDragEnd}
                                                style={{ color: fontColor }}
                                            >
                                                <Grid container
                                                    style={{ padding: !item.myFavouriteName ? '0px' : '0 0 0 20px' }}
                                                >
                                                    <Grid item xs={10} style={{ width: 'cacl(100% - 78px)', whiteSpace: 'pre-line' }}
                                                        id={id + '_parent' + index + '_title' + subIndex}
                                                    >
                                                        <Typography component="div" style={{ display: subItem.dangerDrug && subItem.dangerDrug === 'Y' ? 'inline-block' : 'none' }}>
                                                            <img src={imgDangerDrug} style={{ marginTop: '6px' }} alt="" />
                                                        </Typography>
                                                        <Typography component="div" style={{ display: 'inline-flex', width: subItem.dangerDrug && subItem.dangerDrug === 'Y' ? '95%' : '' }}>
                                                            {title}
                                                        </Typography>
                                                        <i>{subItem.remarkText ? 'Note: ' + subItem.remarkText : null}</i>
                                                    </Grid>
                                                    <Grid item style={{ width: '24px', display: setting.isEnquiry || subItem.freeText === 'F' || disableSubItem ? 'none' : 'block' }}>
                                                        <IconButton
                                                            style={{ position: 'absolute', right: 5, padding: 0 }}
                                                            onClick={() => this.props.handleAddDrugToPriscription(subItem)}
                                                            id={id + '_parent' + index + '_childAddToDrug' + subIndex}
                                                        >
                                                            <ChevronRightIcon />
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                            </CustomListItem>

                                        );
                                    }
                                    )}
                                </List>
                            </Collapse>
                        </Typography>
                    );
                }
                )}
            </CustomList>
        </Typography>;
    }
}
const mapStateToProps = (state) => {
    return {
        drugList: state.moe.drugList,
        // loginInfo: state.moe.loginInfo,
        deptFavouriteList: state.departmentFavourite.deptFavouriteList,
        codeList: state.moe.codeList
    };
};
const mapDispatchToProps = {
    getDeptFavouriteList,
    updateField
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(DepartmentFavourite));