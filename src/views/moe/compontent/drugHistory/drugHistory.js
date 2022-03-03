import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Typography,
    Grid,
    List,
    ListItem,
    IconButton,
    Collapse,
    Tooltip,
    Icon
} from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import minus from '../../../../images/moe/elbow-end-minus-lg2.gif';
import plus from '../../../../images/moe/elbow-end-plus-lg2.gif';
import homeleave from '../../../../images/moe/homeleave.png';
import inpatient from '../../../../images/moe/inpatient.png';
import outpatient from '../../../../images/moe/outpatient.png';
import imgBackdate from '../../../../images/moe/backdate.png';
import * as prescriptionUtilities from '../../../../utilities/prescriptionUtilities';
import _ from 'lodash';
import {
    updateField,
    filterDrugHistory
} from '../../../../store/actions/moe/drugHistory/drugHistoryAction';
import {
    updateField as updateMoeField
} from '../../../../store/actions/moe/moeAction';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import {
    defaultTypeVal,
    typeCodeList,
    defaultPeriodVal,
    periodCodeList
} from '../../../../enums/moe/drugHistoryEnum';
import * as moeUtilities from '../../../../utilities/moe/moeUtilities';
import infoIcon from '../../../../images/moe/icon-info.gif';
import CIMSAlertDialog from '../../../../components/Dialog/CIMSAlertDialog';
import MultipleRemarkDialog from './../editRemark/multipleRemarkDialog';
import imgDangerDrug from '../../../../images/moe/dangerous_drug.png';
import warningIcon from '../../../../images/moe/warning.gif';
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
    iconButtonRoot: {
        cursor: 'default'
    },
    withAnIcon: {
        width: '95%',
        display: 'inline-flex'
    },
    withIcons: {
        width: '92%',
        display: 'inline-flex'
    },
    withoutIcons: {
        width: '100%',
        display: 'inline-flex'
    },
    toolTip: {
        maxWidth: '450px'
    }
};

class DrugHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectIndex: -1,

            //remark dialog
            showRemarkDialog: false,
            remarkData: null,
            drugHistoryHeight: 0
        };
    }

    //20190930 handle double click event by Louis Chen
    componentWillMount = () => {
        this.clickTimeout = null;
    }

    componentDidMount() {
        this.setState({
            drugHistoryHeight: resizeHeight(
                RESIZEHEIGHT_PANEL.OUTMOST_MOE_DRUGHISTORY_CONTAINER.ID,
                RESIZEHEIGHT_PANEL.OUTMOST_MOE_DRUGHISTORY_CONTAINER.MINUEND()
            )
        });
    }
    //20190930 handle double click event by Louis Chen

    shouldComponentUpdate(nextProps) {
        if (nextProps.tabValue !== this.props.tabValue && nextProps.tabValue)
            this.setState({
                drugHistoryHeight: resizeHeight(
                    RESIZEHEIGHT_PANEL.OUTMOST_MOE_DRUGHISTORY_CONTAINER.ID,
                    RESIZEHEIGHT_PANEL.OUTMOST_MOE_DRUGHISTORY_CONTAINER.MINUEND()
                )
            });
        return true;
    }

    handleChangeSelect = (e, name) => {
        let value = e.value;
        let updateData = {};
        updateData[name] = value;
        this.props.updateField(updateData);
        let params = {
            prescType: this.props.prescType || defaultTypeVal,
            withinMonths: this.props.withinMonths || defaultPeriodVal
        };
        params[name] = value;
        this.props.filterDrugHistory(params);
    }

    //20190930 handle double click event by Louis Chen
    handleCollapseClicks = (item, index) => {
        if (this.clickTimeout !== null) {
            this.handleCollapse(item, index);
            clearTimeout(this.clickTimeout);
            this.clickTimeout = null;
        } else {
            this.clickTimeout = setTimeout(() => {
                this.handleCollapse(item, index);
                clearTimeout(this.clickTimeout);
                this.clickTimeout = null;
            }, 200);
        }
    }
    //20190930 handle double click event by Louis Chen

    handleCollapse = (item, index) => {
        let list = _.cloneDeep(this.props.drugHistoryList);
        list.map((_item, i) => {
            if (i === index)
                _item.open = !_item.open;
            return _item;
        });
        let updateData = {
            drugHistoryList: list
        };
        this.props.updateField(updateData);
    }

    //drag start
    handlDragStart = (event, item, isDrugSet) => {
        event.stopPropagation();
        // let newData;
        // if (isParent) {
        //     newData = item.moeOrder.moeMedProfiles;
        // } else {
        //     newData = item;
        // }
        // let newItems = prescriptionUtilities.getNewOrderDrugListOrObject(newData, this.props.drugList);
        event.dataTransfer.setData('flag', 'MOEHISTORY');
        event.dataTransfer.setData('isDrugSet', isDrugSet);
        event.dataTransfer.setData('item', JSON.stringify(item));
        // if (item.freeText === 'F') return;
        // event.dataTransfer.dropEffect = 'copy';
        event.target.style.opacity = '0.5';
        return false;
    }
    handleDragEnd = (event) => {
        event.target.style.opacity = '1';
    }
    //drag end

    handleClickDrugHistory = (e, item, index) => {
        let updateData = {
            drugList: item.moeOrder.moeMedProfiles,
            orderData: item
        };
        this.props.updateMoeField(updateData);
        this.setState({ selectIndex: index });
    }

    handleClickOk = () => {
        let newItems = prescriptionUtilities.getNewOrderDrugListOrObject(this.props.newData, this.props.drugList);

        this.props.updateField({
            open: false,
            newData: [],
            freeTextData: []
        });
        this.props.handleCheckAllergen(newItems, this.props, false);
        //const setting = moeUtilities.getMoeSetting();

        // if ((setting.isEdit || setting.isBackdate) && newItems && newItems.length > 0) {
        //     //this.handleRemark(newItems);
        //     this.props.confirmDrug(newItems, true);
        //     return;
        // }
        // this.props.confirmDrug(newItems, true);
    }

    //remark dialog
    handleRemark = (drugData) => {
        this.setState({
            showRemarkDialog: true,
            remarkData: drugData
        });
    }
    handRemarkOk = (remarkValue, data) => {
        this.props.confirmDrug(data, true, null, () => {
            this.setState({
                showRemarkDialog: false,
                remarkData: null
            });
        });
    }



    render() {
        const { drugHistoryList, id, classes, open, freeTextData, maxWidth } = this.props;
        let setting = moeUtilities.getMoeSetting();
        // console.log('drugHistory-render()', this.state.drugHistoryHeight);
        return (
            <Typography
                component={'div'}
                dptid={'outmost_moe_drufhistory_container'}
                style={{
                    height: (this.state.drugHistoryHeight - 10) + 'px'
                }}
            >
                <ValidatorForm ref={'durHistoryForm'} onSubmit={() => { }}>
                    <Grid container spacing={1} style={{ maxWidth: `calc(${maxWidth - 50}px)` }}>
                        <Grid item xs={6}>
                            <div style={{ width: '80%' }}>
                                <SelectFieldValidator
                                    fullWidth
                                    labelText="Type: "
                                    labelPosition="left"
                                    id={id + '_drugHistoryTypeSelectFieldValidator'}
                                    options={typeCodeList.map((item) => ({ value: item.value, label: item.desc }))}
                                    value={this.props.prescType || defaultTypeVal}
                                    name={'prescType'}
                                    onChange={(...arg) => this.handleChangeSelect(...arg, 'prescType')}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={6}>
                            <div style={{ width: '80%' }}>
                                <SelectFieldValidator
                                    fullWidth
                                    labelText="Period: "
                                    labelPosition="left"
                                    id={id + '_drugHistoryPeriodSelectFieldValidator'}
                                    options={periodCodeList.map((item) => ({ value: item.value, label: item.desc }))}
                                    value={this.props.withinMonths || defaultPeriodVal}
                                    name={'withinMonths'}
                                    onChange={(...arg) => this.handleChangeSelect(...arg, 'withinMonths')}
                                />
                            </div>
                        </Grid>
                    </Grid>
                </ValidatorForm>
                <CustomList
                    id={id + '_allItems'}
                    style={{
                        // display: 'table',
                        // tableLayout: 'fixed',
                        boxSizing: 'border-box',
                        width: '100%',
                        padding: 0,
                        margin: '10px 0 0 0',
                        overflowY: 'auto',
                        height: this.state.drugHistoryHeight,
                        maxHeight: this.state.drugHistoryHeight,
                        position: 'relative',
                        maxWidth: `calc(${maxWidth - 50}px)`
                    }}
                    component={'nav'}
                >
                    {drugHistoryList && drugHistoryList.map((item, index) => {
                        let ordSubtypeIcon;
                        let ordSubtypeTitle;
                        let parentIcon;
                        let parentIconTitle;//20190927 Create a variable to contain parent icon title by Louis Chen
                        switch (item.moeOrder.prescType) {
                            case 'D':
                                parentIcon = inpatient;
                                parentIconTitle = 'Inpatient';//20190927 Create a variable to contain parent icon title by Louis Chen
                                break;
                            case 'H':
                                parentIcon = homeleave;
                                parentIconTitle = 'Homeleave';//20190927 Create a variable to contain parent icon title by Louis Chen
                                break;
                            case 'O':
                                parentIcon = outpatient;
                                parentIconTitle = 'Outpatient';//20190927 Create a variable to contain parent icon title by Louis Chen
                                break;
                            default: break;
                        }
                        if (item.moeOrder.ordSubtype === 'B') {//DAVID 20200223
                            ordSubtypeIcon = imgBackdate;
                            ordSubtypeTitle = 'Back-dated Prescription';
                        }
                        return (
                            <Typography
                                component={'div'}
                                key={index}
                                onDragStart={(e) => this.handlDragStart(e, item.moeOrder, true)}
                                onDragEnd={this.handleDragEnd}
                                className={'droptarget'}
                                draggable={!setting.isEnquiry}
                            >
                                <CustomListItem
                                    id={id + '_parentItem' + index}
                                    style={{ backgroundColor: this.state.selectIndex === index ? 'rgba(0, 0, 0, 0.1)' : '#fff' }}
                                    component={'li'}
                                    className={'listItem'}
                                    divider
                                    onDoubleClick={setting.isEnquiry ? null : () => this.handleCollapseClicks(item, index)}//20190930 handle double click event by Louis Chen
                                >
                                    <Grid
                                        container
                                        onClick={setting.isEnquiry ? (e) => this.handleClickDrugHistory(e, item, index) : null}
                                        style={{ cursor: setting.isEnquiry ? 'pointer' : 'default' }}
                                    >
                                        <Grid style={setting.isEnquiry ? { display: 'none' } : null}>
                                            <IconButton
                                                id={id + '_parentCollapseBtn' + index}
                                                style={{ padding: 0, marginRight: '10px' }}
                                                onClick={() => this.handleCollapseClicks(item, index)}//20190930 handle double click event by Louis Chen
                                            >
                                                <img src={item.open ? minus : plus} alt={''} />
                                            </IconButton>
                                        </Grid>
                                        <Grid>
                                            <Icon
                                                id={id + '_parentHomeLeaveIcon' + index}
                                                style={{ padding: 0, lineHeight: 1 }}
                                                classes={{
                                                    root: classes.iconButtonRoot
                                                }}
                                            >
                                                <img
                                                    src={parentIcon}
                                                    alt={''}
                                                    title={parentIconTitle}
                                                //20190927 Change icon button as icon by Louis Chen
                                                />
                                            </Icon >
                                        </Grid>
                                        <Grid>
                                            <Icon
                                                id={id + '_orderSubtypeIcon' + index}
                                                style={{ padding: 0, lineHeight: 1 }}
                                                classes={{
                                                    root: classes.iconButtonRoot
                                                }}
                                            >
                                                <img
                                                    src={ordSubtypeIcon}
                                                    alt={''}
                                                    title={ordSubtypeTitle}
                                                //DAVID 20200223
                                                />
                                            </Icon >
                                        </Grid>
                                        <Grid style={{ fontWeight: 'bold' }} id={id + '_orderData' + index}>
                                            <span style={{ margin: '5px 30px 0 0', float: 'left', minWidth: '80px' }}>{item.moeOrder.ordDate}</span>
                                            <span style={{ margin: '5px 30px 0 0', float: 'left', minWidth: '60px' }} component={'span'}> {item.moeOrder.hospcode}</span>
                                            <span style={{ margin: '5px 30px 0 0', float: 'left', minWidth: '80px' }} component={'span'}> {item.createUser}</span>
                                        </Grid>
                                        <Grid style={setting.isEnquiry ? { display: 'none' } : null}>
                                            <IconButton
                                                id={id + '_parentAddToDrugBtn' + index}
                                                style={{ position: 'absolute', right: 5, padding: 0 }}
                                                onClick={() => this.props.handleAddDrugToPriscription(item.moeOrder, true, 'MOEHISTORY')}
                                            >
                                                <ChevronRightIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </CustomListItem>
                                <Collapse in timeout="auto" unmountOnExit style={{ margin: 0, display: item.open ? 'block' : 'none' }}>
                                    <CustomList component={'nav'} disablePadding id={id + '_allSubItems' + index}>
                                        {item.moeOrder.moeMedProfiles.map((subItem, subIndex) => {
                                            let title = prescriptionUtilities.generatePanelTitle(subItem, this.props.codeList);
                                            let titleProps = classes.withoutIcons;
                                            if (subItem.dangerDrug && subItem.dangerDrug === 'Y' && subItem.allergens && subItem.allergens.length > 0) {
                                                titleProps = classes.withIcons;
                                            } else if ((subItem.dangerDrug && subItem.dangerDrug === 'Y') || (subItem.allergens && subItem.allergens.length > 0)) {
                                                titleProps = classes.withAnIcon;
                                            }
                                            let disableSubItem = !moeUtilities.isAvailable(subItem);

                                            return (
                                                <CustomListItem
                                                    // button
                                                    key={subIndex}
                                                    id={id + '_parent' + index + '_childrenItem' + subIndex}
                                                    onDragStart={(e) => this.handlDragStart(e, subItem, false)}
                                                    onDragEnd={this.handleDragEnd}
                                                    draggable
                                                    divider
                                                    style={{color: disableSubItem ? 'grey' : null }}
                                                    className={`${'listItem'} ${'droptarget'}`}
                                                >
                                                    <Grid container
                                                        style={{ padding: '0 0 0 20px' }}
                                                    >
                                                        <Grid item xs={10} style={{ width: 'cacl(100% - 78px)', whiteSpace: 'pre-line' }}
                                                            id={id + '_parent' + index + '_title' + subIndex}
                                                        >
                                                            <Typography component="div" style={{ width: '4%', display: subItem.dangerDrug && subItem.dangerDrug === 'Y' ? 'inline-block' : 'none' }}>
                                                                <img src={imgDangerDrug} style={{ marginTop: '6px' }} alt="" />
                                                            </Typography>
                                                            <Typography component="div" style={{ width: '4%', display: subItem.allergens && subItem.allergens.length > 0 ? 'inline-block' : 'none' }}>
                                                                <Tooltip title={moeUtilities.getDACReason(subItem.allergens)} classes={{ tooltip: classes.toolTip }}>
                                                                    <img src={warningIcon} style={{ marginTop: '6px' }} alt="" />
                                                                </Tooltip>
                                                            </Typography>
                                                            <Typography component="div" className={`${titleProps}`}>
                                                                {title}
                                                            </Typography>
                                                            <Typography style={{ whiteSpace: 'pre-wrap' }}><i>{subItem.remarkText ? 'Note: ' + subItem.remarkText : null}</i></Typography>
                                                        </Grid>
                                                        <Grid item
                                                            style={{
                                                                width: '24px',
                                                                display: (subItem.freeText === 'F' || disableSubItem) ? 'none' : 'block'
                                                            }}
                                                        >
                                                            <IconButton
                                                                style={{ position: 'absolute', right: 5, padding: 0 }}
                                                                onClick={() => this.props.handleAddDrugToPriscription(subItem, false, 'MOEHISTORY')}
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
                                    </CustomList>
                                </Collapse>
                            </Typography>
                        );
                    }
                    )}
                </CustomList>
                {open && <CIMSAlertDialog
                    id={id + '_infoDialog'}
                    open={open}
                    onClickOK={this.handleClickOk}
                    dialogTitle={'Information/Attention'}
                    dialogContentText={
                        <Grid container>
                            <Grid style={{ width: '32px' }}>
                                <img src={infoIcon} alt="" />
                            </Grid>
                            <Grid style={{ width: 'calc(100% - 42px)', marginLeft: '10px' }}>
                                {freeTextData && freeTextData.length > 1 &&
                                    <Typography component={'span'} id={id + '_infoTitle1'}>There are some drug no longer available because of inventory updates.You may contact pharmacy for their available alternatives.</Typography>}
                                {freeTextData && freeTextData.map((item, index) => {
                                    let vtm = (item.vtm && item.vtm !== '' ? ' (' + item.vtm + ')' : '');
                                    let strength = item.freeText === 'F' ? item.txtStrength : item.isShowAdvanced && item.ddlPrep;
                                    let form = item.txtForm;
                                    return <Typography key={index} component={'p'} style={{ whiteSpace: 'pre-wrap' }} id={id + '_infoFreeTextDrugs'}>
                                        <Typography component={'span'} id={id + '_infoDrugName'}>{freeTextData && freeTextData.length > 1 && '(' + (index + 1) + ') '}<b>{item.drugName}</b></Typography>
                                        {vtm && <Typography component={'span'} id={id + '_infoVtm'}> {vtm}</Typography>}
                                        {strength && <Typography component={'span'} id={id + '_infoStrength'}> {strength}</Typography>}
                                        {form && <Typography component={'span'} id={id + '_infoForm'}> {form}</Typography>}
                                        {freeTextData && freeTextData.length === 1 &&
                                            <Typography component={'span'} id={id + '_infoTitle2'}> is no longer available because of inventory updates.You may contact pharmacy for their available alternatives.</Typography>}
                                    </Typography>;
                                })}
                            </Grid>
                        </Grid>
                    }
                    okButtonName={'OK'}
                         />}
                {this.state.showRemarkDialog &&
                    <MultipleRemarkDialog
                        id={id + '_multipleRemarkDialog'}
                        open={this.state.showRemarkDialog}
                        cancelClick={() => { this.setState({ showRemarkDialog: false, data: null }); }}
                        okClick={this.handRemarkOk}
                        data={this.state.remarkData}
                    />
                }
            </Typography>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        codeList: state.moe.codeList,
        drugList: state.moe.drugList,
        drugHistoryList: state.moeDrugHistory.drugHistoryList,
        prescType: state.moeDrugHistory.prescType,
        withinMonths: state.moeDrugHistory.withinMonths,
        open: state.moeDrugHistory.open,
        newData: state.moeDrugHistory.newData,
        freeTextData: state.moeDrugHistory.freeTextData
    };
};
const mapDispatchToProps = {
    updateField,
    filterDrugHistory,
    updateMoeField
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(DrugHistory));