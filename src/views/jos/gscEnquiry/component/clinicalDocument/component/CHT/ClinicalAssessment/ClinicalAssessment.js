import React, { Component } from 'react';
import { withStyles, Grid, Checkbox, FormControlLabel, TextField, Table, TableHead, TableRow, TableCell, TableBody, Typography, Tooltip } from '@material-ui/core';
import _ from 'lodash';
import moment from 'moment';
import { styles } from './ClinicalAssessmentStyle';
import Enum from '../../../../../../../../../src/enums/enum';
import * as commonConstants from '../../../../../../../../constants/common/commonConstants';

class ClinicalAssessment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            valMap: new Map(),
            tableHeight: 0
        };
    }

    componentDidMount() {
        const { childRef } = this.props;
        childRef(this);
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.asmtItems !== this.props.asmtItems) {
            this.setState({ valMap: new Map() });
        }
    }

    handleText = (rowId, event) => {
        let { changeEditFlag } = this.props;
        let { valMap } = this.state;
        let val = this.cutOutString(event.target.value, 500);
        if (valMap.size > 0 && valMap.has(rowId)) {
            let items = valMap.get(rowId);
            if (items.opType == commonConstants.COMMON_ACTION_TYPE.INSERT && items.checkedFalg) {
                items.opType = commonConstants.COMMON_ACTION_TYPE.INSERT;
                items.rslt = val;
            } else {
                items.opType = commonConstants.COMMON_ACTION_TYPE.UPDATE;
                items.rslt = val;
            }
        }
        this.setState({ valMap });
        changeEditFlag && changeEditFlag();
    }

    handleTextBlur = (rowId, event) => {
        let { valMap } = this.state;
        let val = _.trim(event.target.value);
        if (valMap.size > 0 && valMap.has(rowId)) {
            let items = valMap.get(rowId);
            items.rslt = val;
        }
        this.setState({ valMap });
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

    handleChange = (rowId, event) => {
        let { neonatalDocId, dataCommon, changeEditFlag } = this.props;
        let { valMap } = this.state;
        let checkedBox = event.target.checked;
        if (valMap.size > 0 && valMap.has(rowId)) {
            let tempObj = valMap.get(rowId);
            if (tempObj.version) {
                tempObj.opType = checkedBox ? commonConstants.COMMON_ACTION_TYPE.UPDATE : commonConstants.COMMON_ACTION_TYPE.DELETE;
                tempObj.checkedFalg = checkedBox;
                tempObj.rslt = checkedBox ? tempObj.rslt : '';
            } else if (tempObj.opType == commonConstants.COMMON_ACTION_TYPE.INSERT && !checkedBox) {
                valMap.delete(rowId);
            }
        } else {
            let obj = {
                checkedFalg: checkedBox,
                asmtId: Math.random(),
                asmtItemId: rowId,
                createBy: '',
                createDtm: '',
                dbUpdateDtm: '',
                docId: neonatalDocId,
                encounterId: '',
                opType: commonConstants.COMMON_ACTION_TYPE.INSERT,
                patientKey: dataCommon.patientKey,
                rslt: '',
                updateBy: '',
                updateDtm: '',
                version: ''
            };
            valMap.set(obj.asmtItemId, obj);
        }
        this.setState({ valMap });
        changeEditFlag && changeEditFlag();
    }

    renderCheckBox = (rowId, name) => {
        let { classes,roleActionType } = this.props;
        let { valMap } = this.state;
        let roleActionFlag = roleActionType == 'D' ? false : true;
        let checkedFalg = false;
        let inputVal = '';
        if (valMap.size > 0 && valMap.has(rowId)) {
            let objItems = valMap.get(rowId);
            checkedFalg = objItems.checkedFalg;
            inputVal = objItems.rslt;
        }
        return (
            <>
                <Grid item xs={3} style={{ width: 235, maxWidth: 'none', flexBasis: 'auto' }}>
                    <FormControlLabel
                        label={name}
                        id={`checked_${rowId}`}
                        disabled={roleActionFlag}
                        classes={{
                            label: classes.normalFont,
                            disabled: classes.disabledLabel
                        }}
                        control={
                            <Checkbox
                                color="primary"
                                checked={checkedFalg}
                                onChange={(event) => this.handleChange(rowId, event)}
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                                className={classes.checkbox}
                            />
                        }
                    />
                </Grid>
                <Grid item xs={9}>
                    <TextField
                        type="text"
                        variant="outlined"
                        fullWidth
                        autoComplete="off"
                        value={inputVal}
                        className={classes.textField}
                        inputProps={{
                            style: { height: 32 },
                            maxLength: 500
                        }}
                        disabled={!checkedFalg || roleActionFlag}
                        onChange={(event) => this.handleText(rowId, event)}
                        onBlur={(event) => this.handleTextBlur(rowId, event)}
                    />
                </Grid>
            </>
        );
    }

    generateAssessmentObj = () => {
        let { valMap } = this.state;
        let asmtItems = [];
        if (valMap.size > 0) {
            for (let item of valMap.values()) {
                if (item.opType) {
                    let temp = _.cloneDeep(item);
                    if (temp.opType === commonConstants.COMMON_ACTION_TYPE.INSERT) {
                        temp.asmtId = 0;
                    }
                    asmtItems.push(temp);
                }
            }
        }
        return asmtItems;
    }

    generateTableContent = () => {
        const { classes, asmtItems } = this.props;
        let elements = asmtItems.map((item, index) => {
            return (
                <TableRow className={classes.tableContentRow} key={`ViewNeonatalLogTable_${item.asmtId}`} >
                    <TableCell className={classes.tableContentCell}>
                        <Tooltip title={item.createDtm ? moment(item.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.createDtm ? moment(item.createDtm).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''}</label>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.tableContentCell}>
                        <Tooltip title={item.createBy ? item.createBy : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.createBy ? item.createBy : ''}</label>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.tableContentCell}>
                        <Tooltip title={item.rslt ? item.rslt : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.rslt ? item.rslt : ''}</label>
                        </Tooltip>
                    </TableCell>
                </TableRow>);
        });
        return elements;
    }

    render() {
        const { classes, asmtItems } = this.props;
        let contentElements = this.generateTableContent();
        return (
            <div style={{ padding: 10 }} className={classes.contentTop}>
                <Grid id="cheboxWrapper">
                    <Grid className={classes.cheboxWrapper}>
                        {this.renderCheckBox(67001, 'Poor feeding / Vomiting')}
                    </Grid>
                    <Grid className={classes.cheboxWrapper}>
                        {this.renderCheckBox(67002, 'Hoarse cry')}
                    </Grid>
                    <Grid className={classes.cheboxWrapper}>
                        {this.renderCheckBox(67003, 'Constipation')}
                    </Grid>
                    <Grid className={classes.cheboxWrapper}>
                        {this.renderCheckBox(67004, 'Inactiveness')}
                    </Grid>
                    <Grid className={classes.cheboxWrapper}>
                        {this.renderCheckBox(67005, 'Prolonged jaundice')}
                    </Grid>
                    <Grid className={classes.cheboxWrapper}>
                        {this.renderCheckBox(67006, 'Large anterior fontanelle')}
                    </Grid>
                    <Grid className={classes.cheboxWrapper}>
                        {this.renderCheckBox(67007, 'Large tongue')}
                    </Grid>
                    <Grid className={classes.cheboxWrapper}>
                        {this.renderCheckBox(67008, 'Dry / cold / mottled skin')}
                    </Grid>
                    <Grid className={classes.cheboxWrapper}>
                        {this.renderCheckBox(67009, 'Umbilical hernia')}
                    </Grid>
                    <Grid className={classes.cheboxWrapper}>
                        {this.renderCheckBox(67010, 'other')}
                    </Grid>
                </Grid>
                <Typography component="div" className={classes.rootTable}>
                    <div style={{ height: 215, overflowY: 'auto' }}>
                        <Table>
                            <TableHead>
                                <TableRow className={classes.tableHeadRow}>
                                    <TableCell padding={'none'} className={classes.tableHeadCell} style={{ width: '10%', minWidth: 105 }}>Date</TableCell>
                                    <TableCell padding={'none'} className={classes.tableHeadCell} style={{ width: '10%', minWidth: 140 }}>Doctor</TableCell>
                                    <TableCell padding={'none'} className={classes.tableHeadCell}>Assessment</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {asmtItems.length > 0 ? (contentElements) : (
                                    <TableRow style={{ height: 'auto' }}>
                                        <TableCell colSpan={3} className={classes.tableCellRow}>
                                            <Typography style={{ padding: 10 }}>There is no data.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Typography>
            </div>
        );
    }
}

export default withStyles(styles)(ClinicalAssessment);
