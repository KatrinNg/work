import React, { Component } from 'react';
import { withStyles, Table, TableHead, TableRow, TableCell, TableBody, Typography, Divider, Tooltip } from '@material-ui/core';
import { styles } from './PassiveTableStyle';
import classNames from 'classnames';
import moment from 'moment';
import _ from 'lodash';
import * as constants from '../../../../../constants/common/commonConstants';
import * as medicalConstants from '../../../../../constants/medicalHistories/medicalHistoriesConstants';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import SelectBox from '../SelectBox/SelectBox';
import TextInputBox from '../TextInputBox/TextInputBox';
import * as utils from '../../util/utils';

class PassiveTable extends Component {
    constructor(props) {
        super(props);
        this.statusColumnRef = React.createRef();
        this.tableRef = React.createRef();
        this.tableBodyRef = React.createRef();
        this.contentRef = React.createRef();
        this.state = {
            statusWidth: undefined,
            selectedRowId: null
        };
    }
    componentDidMount() {
        this.resetHeight();
        window.addEventListener('resize', this.resetHeight);
    }
    componentDidUpdate() {
        this.resetHeight();
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.resetHeight);
    }
    resetHeight = _.debounce(() => {
        if (this.statusColumnRef.current && this.statusColumnRef.current.clientWidth !== this.state.statusWidth) {
            this.setState({ statusWidth: this.statusColumnRef.current.clientWidth });
        }
    }, 500);

    handleRowClick = (msPassiveSmkId, rowAddFlag = false) => {
        const { setSelectedRowId, moveToEnd = true } = this.props;
        setSelectedRowId && setSelectedRowId(msPassiveSmkId);
        this.setState({
            selectedRowId: msPassiveSmkId
        }, () => {
            if (rowAddFlag) {
                if (moveToEnd && this.tableRef.current) {
                  this.tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
                } else if (!moveToEnd && this.tableBodyRef.current && this.contentRef.current) {
                  const newRowIndex = this.tableBodyRef.current.children.length;
                  const offsetTop = this.tableBodyRef.current.children[newRowIndex - 1].offsetTop;
                  this.contentRef.current.scroll({ top: offsetTop, behavior: 'smooth' });
                }
              }
        });
    }
    handleRowAdd = () => {
        let { updateState, type, dataList, valMap } = this.props;
        let tempObj = utils.generateHistoryValObj(type);
        valMap.get(type).set(tempObj.msPassiveSmkId,tempObj);
        updateState && updateState({
            passiveHistoryList: _.concat(dataList, tempObj),
            valMap
        });
        this.handleRowClick(tempObj.msPassiveSmkId, true);
    }
    handleRowDelete = () => {
        let { updateState, dataList, valMap, type } = this.props;
        let { selectedRowId } = this.state;
        if (dataList.length > 0) {
            let tempArray = _.remove(dataList, item => {
                return item.msPassiveSmkId === selectedRowId;
            });
            if (tempArray.length > 0) {
                let tempObj = _.head(tempArray);
                if (tempObj.version) {
                    tempObj.operationType = constants.COMMON_ACTION_TYPE.DELETE;
                    tempObj.deleteInd = medicalConstants.DELETED_STATUS.YES;
                }
                if (valMap.get(type).has(selectedRowId)) {
                    if (tempObj.operationType === constants.COMMON_ACTION_TYPE.DELETE) {
                        valMap.get(type).set(selectedRowId, tempObj);
                    } else {
                        valMap.get(type).delete(selectedRowId);
                    }
                }
                this.handleRowClick(null);
                updateState && updateState({
                    passiveHistoryList: dataList,
                    valMap
                });
            }
        }
    }
    generateLogTableContent = () => {
        const { classes, dataList, serviceList } = this.props;
        let { selectedRowId } = this.state;
        let elements = [];
        elements = dataList.map(item => {
            let currentRowFlag = selectedRowId === item.msPassiveSmkId ? true : false;
            let targetServiceObj = _.find(serviceList, tempObj => {
                return tempObj.serviceCd === item.serviceCd;
            });
            return (
                <TableRow
                    key={`social_history_passive_table_row_${item.logMsPassiveSmkId}`}
                    className={classNames(classes.tableContentrow, {
                        [classes.tableContentRowSelected]: currentRowFlag
                    })}
                    onClick={() => { this.handleRowClick(item.logMsPassiveSmkId); }}
                >
                    {/* *Location */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={item.codRlatTypeName ? item.codRlatTypeName : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.codRlatTypeName ? item.codRlatTypeName : ''}</label>
                        </Tooltip>
                    </TableCell>
                    {/* Number of smokers */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={item.smkNum ? item.smkNum : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.smkNum ? item.smkNum : ''}</label>
                        </Tooltip>
                    </TableCell>
                    {/* Relationship of the smoker */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={item.rlat ? item.rlat : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.rlat ? item.rlat : ''}</label>
                        </Tooltip>
                    </TableCell>
                    {/* Action */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={item.logType ? medicalConstants.LOG_TYPE_MAP.get(item.logType) : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.logType ? medicalConstants.LOG_TYPE_MAP.get(item.logType) : ''}</label>
                        </Tooltip>
                    </TableCell>
                    {/* On */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={item.logDtm ? moment(item.logDtm).format('DD-MMM-YYYY') : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.logDtm ? moment(item.logDtm).format('DD-MMM-YYYY') : ''}</label>
                        </Tooltip>
                    </TableCell>
                    {/* By */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={item.updateBy ? item.updateBy : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.updateBy ? item.updateBy : ''}</label>
                        </Tooltip>
                    </TableCell>
                    {/* Service */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={targetServiceObj ? targetServiceObj.serviceName : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{targetServiceObj ? targetServiceObj.serviceName : ''}</label>
                        </Tooltip>
                    </TableCell>
                </TableRow>
            );
        });
        return elements;
    }
    generateTableContent = () => {
        const { classes, dataList, updateState, serviceList, valMap, type, dropdownOption, changeEditFlag,encounterExistFlag } = this.props;
        let { selectedRowId, statusWidth } = this.state;
        let elements = [];
        elements = dataList.map(item => {
            let currentRowFlag = selectedRowId === item.msPassiveSmkId ? true : false;
            let commonProps = {
                itemId: item.msPassiveSmkId,
                item,
                currentRowFlag,
                updateState,
                valMap,
                type,
                changeEditFlag,
                encounterExistFlag
            };
            let locationFieldProps = {
                val: item.codRlatTypeId,
                maxWidth: statusWidth,
                attrName: 'codRlatTypeId',
                options: dropdownOption ? dropdownOption.passiveOptions : [],
                ...commonProps
            };
            let numberFieldProps = {
                val: item.smkNum,
                attrName: 'smkNum',
                maxLength: 10,
                mandatoryFlag: true,
                ...commonProps
            };
            let relationShipFieldProps = {
                val: item.rlat,
                attrName: 'rlat',
                maxLength: 200,
                ...commonProps
            };

            let targetServiceObj = _.find(serviceList, tempObj => {
                return tempObj.serviceCd === item.serviceCd;
            });

            return (
                <TableRow
                    key={`social_history_passive_table_row_${item.msPassiveSmkId}`}
                    className={classNames(classes.tableContentrow, {
                        [classes.tableContentRowSelected]: currentRowFlag
                    })}
                    onClick={() => { this.handleRowClick(item.msPassiveSmkId); }}
                >
                    {/* *Location */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <SelectBox {...locationFieldProps} />
                    </TableCell>
                    {/* Number of smokers */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <TextInputBox {...numberFieldProps} />
                    </TableCell>
                     {/* Relationship of the smoker */}
                     <TableCell className={classes.tableContentCell} padding={'none'}>
                        <TextInputBox {...relationShipFieldProps} />
                    </TableCell>
                    {/* On */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={item.updateDtm ? moment(item.updateDtm).format('DD-MMM-YYYY') : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.updateDtm ? moment(item.updateDtm).format('DD-MMM-YYYY') : ''}</label>
                        </Tooltip>
                    </TableCell>
                    {/* By */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={item.updateBy ? item.updateBy : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.updateBy ? item.updateBy : ''}</label>
                        </Tooltip>
                    </TableCell>
                    {/* Service */}
                    <TableCell className={classes.tableContentCell} padding={'none'}>
                        <Tooltip title={targetServiceObj ? targetServiceObj.serviceName : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{targetServiceObj ? targetServiceObj.serviceName : ''}</label>
                        </Tooltip>
                    </TableCell>
                </TableRow>
            );
        });
        return elements;
    }
    render() {
        const { classes, dataList, tableHeight, viewMode } = this.props;
        let contentElements = viewMode ? this.generateLogTableContent() : this.generateTableContent();
        return (
            <div
                className={classNames(classes.tableContainer, {
                    [classes.tableViewContainer]: viewMode
                })}
                style={{ maxHeight: tableHeight }}
                ref={this.contentRef}
            >
                <ValidatorForm onSubmit={() => { }}>
                    <Table id="social_history_passive_table" ref={this.tableRef} >
                        <TableHead>
                            {viewMode ? (
                                <TableRow className={classes.tableHeadRow}>
                                    <TableCell ref={this.statusColumnRef} padding="none" className={classes.tableHeadCell} rowSpan={2} style={{ width: '15%' }}>Location</TableCell>
                                    <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>Number of smokers</TableCell>
                                    <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>Relationship of the smoker</TableCell>
                                    <TableCell padding="none" style={{width: '10%'}} className={classes.tableHeadCell} rowSpan={2}>Action</TableCell>
                                    <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Updated</TableCell>
                                    <TableCell padding="none" style={{ width: '12%' }} className={classes.tableHeadCell} rowSpan={2}>Service</TableCell>
                                </TableRow>
                            ) : (
                                    <TableRow className={classes.tableHeadRow}>
                                        <TableCell ref={this.statusColumnRef} padding="none" className={classes.tableHeadCell} rowSpan={2} style={{ width: '15%' }}>Location</TableCell>
                                        <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>Number of smokers</TableCell>
                                        <TableCell padding="none" className={classes.tableHeadCell} rowSpan={2}>Relationship of the smoker</TableCell>
                                        <TableCell padding="none" className={classes.tableHeadCell} colSpan={2}>Updated</TableCell>
                                        <TableCell padding="none" style={{ width: '15%' }} className={classes.tableHeadCell} rowSpan={2}>Service</TableCell>
                                    </TableRow>
                                )}
                            {viewMode ? (
                                <TableRow className={classes.tableHeadRow}>
                                    <TableCell padding="none" style={{ width: '13%', top: 32 }} className={classes.tableHeadCell}>
                                        <Divider className={classes.tableDivider} />
                                        <span style={{ position: 'absolute' }}>On</span>
                                    </TableCell>
                                    <TableCell padding="none" style={{ width: '13%', top: 32 }} className={classes.tableHeadCell}>
                                        <Divider className={classes.tableDivider} />
                                        <span style={{ position: 'absolute' }}>By</span>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                    <TableRow className={classes.tableHeadRow}>
                                        <TableCell padding="none" style={{ width: '13%', top: 32 }} className={classes.tableHeadCell}>
                                            <Divider className={classes.tableDivider} />
                                            <span style={{ position: 'absolute' }}>On</span>
                                        </TableCell>
                                        <TableCell padding="none" style={{ width: '13%', top: 32 }} className={classes.tableHeadCell}>
                                            <Divider className={classes.tableDivider} />
                                            <span style={{ position: 'absolute' }}>By</span>
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableHead>
                        <TableBody ref={this.tableBodyRef}>
                            {dataList.length > 0 ? (contentElements) : (
                                <TableRow style={{ height: 'auto' }}>
                                    <TableCell colSpan={viewMode ? 7 : 6} className={classes.tableCellRow}>
                                        <Typography style={{ padding: 10 }}>There is no data.</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ValidatorForm>
            </div>
        );
    }
}
export default withStyles(styles)(PassiveTable);