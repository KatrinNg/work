import React from 'react';
import {
    Grid,
    FormControlLabel,
    Typography
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import CIMSCheckBox from '../../components/CheckBox/CIMSCheckBox';
import CIMSButton from '../../components/Buttons/CIMSButton';
import * as CommonUtilities from '../../utilities/commonUtilities';

const sysRatio = CommonUtilities.getSystemRatio();
const unit = CommonUtilities.getResizeUnit(sysRatio);
const styles = (theme) => ({
    formlabelRoot: {
        marginLeft: 16
    },
    iconBtnRoot: {
        padding: 0,
        marginLeft: 4,
        color: theme.palette.white
    },
    gridTitle: {
        padding: '4px 0px'
    },
    chbLabel: {
        fontWeight: 500,
        color: theme.palette.white
    },
    toolsBarTitle: {
        fontWeight: 600,
        color: theme.palette.white,
        paddingLeft: 8
    },
    buttonRoot: {
        margin: 2,
        padding: 0,
        height: 35 * unit
    },
    lalbelTool: {
        display: 'inline-block',
        marginRight: 6
    },
    headerLeft: {
        width: 'auto'
    },
    headerRight: {
        width: 'auto',
        flex: 1
    }
});

class CommomTableToolsBar extends React.PureComponent {
    render() {
        const { classes, tools, labelArr } = this.props;
        return (
            <Grid
                container
                item
                justify="space-around"
                alignItems="center"
                wrap="nowrap"
                className={classes.gridTitle}
            >
                {labelArr && labelArr.length > 0 ?
                    <Grid className={classes.headerLeft} item container direction={'column'}>
                        {labelArr.map((label, index) => {
                            return (
                                <Grid item container alignItems="flex-end" key={index}>
                                    <Typography className={classes.toolsBarTitle} key={index}>{label}</Typography>
                                </Grid>
                            );
                        })}
                    </Grid>
                    : null
                }
                {/* {labelTxt ?
                    <Grid style={{ flex: 1 }} item container alignItems="flex-end">
                        <Typography className={classes.toolsBarTitle}>{labelTxt}</Typography>
                    </Grid>
                    : null
                } */}
                {/* {labelTxt ?
                    <Grid style={{ flex: 1 }} item container alignItems="flex-end">
                        <Typography className={classes.toolsBarTitle}>{labelTxt}</Typography>
                    </Grid>
                    : null
                } */}

                <Grid className={classes.headerRight} item container justify={'flex-end'} direction={'row'}>
                    {
                        tools && tools.map((item, idx) => {
                            let { id, label, func, type, ...rest } = item;
                            if (type === 'checkBox') {
                                return (
                                    <FormControlLabel
                                        className={classes.formlabelRoot}
                                        control={
                                            <CIMSCheckBox
                                                // checked={this.state.allServiceChecked}
                                                id={id}

                                                onChange={func}
                                                // color="primary"
                                                // className={classes.iconBtnRoot}
                                                {...rest}
                                            />
                                        }
                                        key={idx}
                                        label={<Typography className={classes.chbLabel}>{label}</Typography>}
                                    />
                                );
                            }
                            if (type === 'button') {
                                return (
                                    <CIMSButton
                                        id={id}
                                        key={idx}
                                        // classes={{ sizeSmall: classes.buttonRoot }}

                                        onClick={func || null}
                                        children={label}
                                        {...rest}
                                    />
                                );
                            }
                            if (type === 'label') {
                                return (
                                    <Grid item className={classes.lalbelTool} key={idx} id={id}>
                                        <Typography className={classes.chbLabel}>{label}</Typography>

                                    </Grid>

                                );
                            }
                        })
                    }
                    {/* <FormControlLabel
                        className={classes.formlabelRoot}
                        control={
                            <CIMSCheckBox
                                // checked={this.state.allServiceChecked}
                                onChange={this.handleAllServiceOnChange}
                                color="primary"
                                className={classes.iconBtnRoot}
                            />
                        }
                        label={<Typography className={classes.chbLabel}>All Services</Typography>}
                    />
                    <CIMSButton
                        id="booking_history_editBtn"
                        classes={{ sizeSmall: classes.buttonRoot }}

                        onClick={() => this.handleEditAppointment(this.state.currentSelectedAppt)}
                    >Edit</CIMSButton>
                    <CIMSButton
                        id="booking_history_deleteBtn"
                        classes={{ sizeSmall: classes.buttonRoot }}

                        onClick={() => this.handleCancelAppointment(this.state.currentSelectedAppt)}
                    >Delete</CIMSButton>
                    <CIMSButton
                        id="booking_history_printBtn"
                        classes={{ sizeSmall: classes.buttonRoot }}
                        // disabled={this.props.isEditingAppt || !this.state.currentSelectedAppt}
                        onClick={() => this.printReportSingleSlip(this.state.currentSelectedAppt)}
                    >Print</CIMSButton>
                    <CIMSButton
                        id="booking_history_printAllBtn"
                        classes={{ sizeSmall: classes.buttonRoot }}

                        onClick={this.printReportMultipleSlip}
                    >Print All</CIMSButton> */}
                </Grid>
            </Grid>
        );
    }
}

export default withStyles(styles)(CommomTableToolsBar);