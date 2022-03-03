import React, { Component } from 'react';
import { withStyles, Grid, TextField, Table, TableRow, TableBody, TableCell, Typography, Tooltip } from '@material-ui/core';
import * as commonConstants from '../../../../../../../../constants/common/commonConstants';
import CIMSButton from '../../../../../../../../components/Buttons/CIMSButton';
import Enum from '../../../../../../../../../src/enums/enum';
import classNames from 'classnames';
import { styles } from './FollowUpActionStyle';
import moment from 'moment';
import _ from 'lodash';

class FollowUpAction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: '',
            selectRowId: null,
            dataList: [],
            disabledDelFalg: true,
            disabledAddFalg: true
        };
    }

    componentDidMount() {
        const { childRef } = this.props;
        childRef(this);
    }

    UNSAFE_componentWillUpdate(nextProps) {
        if (nextProps.flwupItems !== this.props.flwupItems) {
            this.setState({
                inputValue: '',
                selectRowId: null,
                dataList: [],
                disabledDelFalg: true,
                disabledAddFalg: true
            });
        }
    }

    handleTextChangeAction = (event) => {
        let value = this.cutOutString(event.target.value, 500);
        this.setState({
            inputValue: value,
            disabledAddFalg: false
        });
    };

    handleTextBlurAction = (event) => {
        let value = _.trim(event.target.value);
        this.setState({ inputValue: value });
    }

    handleAddClick = () => {
        const { neonatalDocId, dataCommon, changeEditFlag, insertGscEnquiryLog,openCommonMessage } = this.props;
        const { inputValue, dataList } = this.state;
        let value = _.trim(inputValue);
        if (value == null || value == '') {
            let payload = {
                msgCode: '130301',
                params: [
                    { name: 'MESSAGE', value: 'Action could not be null!' },
                    { name: 'HEADER', value: 'Follow Up Action' }
                ]
            };
            openCommonMessage && openCommonMessage(payload);
        } else {
            let tempObj = {
                flwupId: Math.random(),
                docId: neonatalDocId,
                flwupAction: inputValue,
                encounterId: '',
                patientKey: dataCommon.patientKey,
                opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
                version: '',
                createBy: '',
                createDtm: '',
                updateBy: '',
                updateDtm: '',
                dbUpdateDtm: ''
            };
            dataList.unshift(tempObj);
            this.setState({
                inputValue: '',
                selectRowId: tempObj.flwupId,
                disabledAddFalg: true,
                disabledDelFalg: false,
                dataList
            });
            let name = '[Follow Up Action] Action: \'Add\' button';
            insertGscEnquiryLog && insertGscEnquiryLog(name, '');
            changeEditFlag && changeEditFlag();
        }
    };

    handleDeleteClick = () => {
        let { insertGscEnquiryLog } = this.props;
        const { selectRowId, dataList } = this.state;
        if (dataList.length > 0) {
            dataList.splice(selectRowId, 1);
            this.setState({
                selectRowId: null,
                disabledDelFalg: true,
                dataList
            });
        }
        let name = '[Follow Up Action] Action: \'Delete\' button';
        insertGscEnquiryLog && insertGscEnquiryLog(name, '');
    };

    handleTextChange = (e, index) => {
        let { dataList } = this.state;
        let value = this.cutOutString(e.target.value, 500);
        dataList.forEach(element => {
            if (element.flwupId === index) {
                element.flwupAction = value;
                return;
            }
        });
        this.setState({ dataList });
    }

    handleTextBlur = (e, index) => {
        let { dataList } = this.state;
        let value = _.trim(e.target.value);
        dataList.forEach(element => {
            if (element.flwupId === index) {
                element.flwupAction = value;
                return;
            }
        });
        this.setState({ dataList });
    }

    handleRowClick = (row) => {
        this.setState({
            selectRowId: row,
            disabledDelFalg: false
        });
    }

    cutOutString = (value, maxValue) => {
        let countIn = 0;
        let realCount = 0;
        for (let i = 0; i < value.length; i++) {
            const element = value.charCodeAt(i);
            if (element >= 0 && element <= 255) {
                if (countIn + 1 > maxValue) {
                    break;
                } else {
                    countIn += 1;
                    realCount++;
                }
            } else {
                if (countIn + 3 > maxValue) {
                    break;
                } else {
                    countIn += 3;
                    realCount++;
                }
            }
        }
        return value ? value.slice(0, realCount) : value;
    }

    generateFollowObj = () => {
        let { dataList } = this.state;
        let items = [];
        dataList.forEach(element => {
            if (element.opType) {
                if (element.opType === commonConstants.COMMON_ACTION_TYPE.INSERT && element.flwupAction != '') {
                    element.flwupId = 0;
                    items.push(element);
                }
            }
        });
        return items;
    }

    generateTableData = () => {
        let { classes, flwupItems } = this.props;
        let elements = flwupItems.map(item => {
            return (
                <TableRow>
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={item.createDtm ? moment(item.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.createDtm ? moment(item.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''}</label>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={item.updateBy ? item.createBy : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.createBy ? item.createBy : ''}</label>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={item.flwupAction ? item.flwupAction : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.flwupAction ? item.flwupAction : ''}</label>
                        </Tooltip>
                    </TableCell>
                </TableRow>
            );
        });
        return elements;
    }

    render() {
        const { classes, flwupItems, roleActionType } = this.props;
        const { inputValue, selectRowId, disabledDelFalg, disabledAddFalg, dataList } = this.state;
        let roleActionFlag = (roleActionType != 'D' && roleActionType != 'N') ? true : false;
        let elements = this.generateTableData();
        let inputProps = {
            InputProps:{
              classes:{
                multiline:classes.multilineInput
              }
            },
            inputProps: {
              className:classes.inputProps,
              maxLength: 500
            }
          };
        return (
            <div className={classes.contentTop}>
                <Grid
                    container
                    direction="row"
                    justifyContent="flex-start"
                    alignItems="center"
                >
                    <Grid item><label className={classes.topText}>Action:</label></Grid>
                    <Grid item xs={4}>
                        <TextField
                            className={classes.inputField}
                            id="Action"
                            type="text"
                            variant="outlined"
                            value={inputValue}
                            disabled={roleActionFlag}
                            onBlur={this.handleTextBlurAction}
                            onChange={(event) => this.handleTextChangeAction(event)}
                            rowsMax={3}
                            multiline
                            {...inputProps}

                        />
                    </Grid>
                    <Grid item xs={4}>
                        <CIMSButton
                            classes={{ root: classes.btnLeftRoot }}
                            onClick={this.handleAddClick}
                            disabled={disabledAddFalg}
                        >
                            Add
                        </CIMSButton>
                        <CIMSButton
                            classes={{ root: classes.btnLeftRoot }}
                            onClick={this.handleDeleteClick}
                            disabled={disabledDelFalg}
                        >
                            Delete
                        </CIMSButton>
                    </Grid>
                    <Grid item xs={7} className={classes.centerBox}>
                        <Table id={'action_table'}>
                            <TableRow className={classes.tableHeadRow}>
                                <TableCell padding={'none'} className={classes.tableHeadCell}>Action</TableCell>
                            </TableRow>
                            <TableBody>
                                {dataList.length > 0 ? dataList.map((item, index) => (
                                    <TableRow key={`action_table_${index}_${item.flwupId}`}
                                        className={classNames(classes.tableContentrow, {
                                            [classes.tableContentRowSelected]: selectRowId === item.flwupId ? true : false
                                        })}
                                        onClick={() => { this.handleRowClick(item.flwupId); }}
                                    >
                                         <TableCell className={classes.tableContentCell} padding={'none'}>
                                            <TextField
                                                id={`action_textarea_${item.flwupId}`}
                                                variant="outlined"
                                                type="text"
                                                value={item.flwupAction}
                                                multiline
                                                rows={3}
                                                className={classes.inputField}
                                                onChange={(event) => this.handleTextChange(event, item.flwupId)}
                                                onBlur={(event) => this.handleTextBlur(event, item.flwupId)}
                                                error={false}
                                                {...inputProps}
                                            />
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow style={{ height: 'auto' }}>
                                        <TableCell className={classes.tableCellRow}>
                                            <Typography style={{ padding: 10 }}>There is no data.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Grid>
                    <Grid item xs={9} >
                        <div className={classes.tableBox} style={{ height: 192, overflowY: 'auto' }}>
                            <Table id={'followUpAction_Table'}>
                                <TableRow className={classes.tableHeadRow}>
                                    <TableCell padding={'none'} className={classes.tableHeadCell}>Date</TableCell>
                                    <TableCell padding={'none'} className={classes.tableHeadCell}>Doctor/Nurse</TableCell>
                                    <TableCell padding={'none'} className={classes.tableHeadCell}>Action</TableCell>
                                </TableRow>
                                <TableBody>
                                    {flwupItems.length > 0 ? (elements) : (
                                        <TableRow style={{ height: 'auto' }}>
                                            <TableCell colSpan={3} className={classes.tableCellRow}>
                                                <Typography style={{ padding: 10 }}>There is no data.</Typography>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default withStyles(styles)(FollowUpAction);