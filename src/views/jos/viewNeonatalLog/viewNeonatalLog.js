import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Grid, Table, TableHead, TableBody, TableRow, TableCell, Typography, Tooltip } from '@material-ui/core';
import _ from 'lodash';
import { styles } from './viewNeonatalLogStyle';
import { openCommonMessage, closeCommonMessage } from '../../../store/actions/message/messageAction';
import { openCommonCircularDialog, closeCommonCircularDialog } from '../../../store/actions/common/commonAction';
import accessRightEnum from '../../../enums/accessRightEnum';
import doCloseFuncSrc from '../../../constants/doCloseFuncSrc';
import * as commonUtils from '../../../utilities/josCommonUtilties';
import * as commonConstants from '../../../constants/common/commonConstants';
import Filter from './component/Filter/Filter';
import moment from 'moment';
import Enum from '../../../../src/enums/enum';
import { updateCurTab, deleteTabs, redirectTab } from '../../../store/actions/mainFrame/mainFrameAction';
import { getViewNeonatalLogLoadDrop, getViewNeonatalLogSearch } from '../../../store/actions/viewNeonatalLog/ViewNeonatalLogAction';

class ViewNeonatalLog extends Component {
    constructor(props) {
        super(props);
        this.filterRef = React.createRef();
        this.state = {
            actionDrop: [
                { title: 'ALL', value: 'All' },
                { title: 'RE-SCREEN', value: 'RS' },
                { title: 'LINK PMI', value: 'LP' }
            ],
            actionBy: [],
            tableList: [],
            tableHeight: 0
        };
    }

    UNSAFE_componentWillMount() {
        this.loadDrop();
        this.loadingData();
        this.insertCgsViewNeonatalLogLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Open} View Neonatal Log`, '');
    }

    componentDidMount() {
        this.props.updateCurTab(accessRightEnum.viewNeonatalLog, this.doClose);
        this.resetHeight();
        window.addEventListener('resize', this.resetHeight);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resetHeight);
    }

    insertCgsViewNeonatalLogLog = (desc, apiName = '', content = null) => {
        commonUtils.commonInsertLog(apiName, accessRightEnum.viewNeonatalLog, 'View Neonatal Log', desc, 'cgs-consultation', content);
    };

    loadingData = (params = null) => {
        this.props.openCommonCircularDialog();
        this.props.getViewNeonatalLogSearch({
            params, callback: (data) => {
                this.props.closeCommonCircularDialog();
                let dataList = data.data;
                this.setState({ tableList: dataList });
            }
        });
    }

    loadDrop = () => {
        this.props.openCommonCircularDialog();
        this.props.getViewNeonatalLogLoadDrop({
            params: {}, callback: (data) => {
                this.props.closeCommonCircularDialog();
                let dropData = data.data;
                let defaultOption = [{ title: 'ALL', value: 'All' }];
                let drop = dropData.map((item) => {
                    return { title: item.userName, value: item.userId };
                });
                drop = defaultOption.concat(drop);
                this.setState({ actionBy: drop });
            }
        });
    }

    onSearch = (params) => {
        let logParams = `action:${params.action},actionBy:${params.userName},PMI:${params.pmi},Ref No: ${params.refNo}`;
        this.insertCgsViewNeonatalLogLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Search' button`, logParams);
        delete params.userName;
        this.loadingData(params);
    }

    updateState = (obj, fun) => {
        if (!fun) {
            this.setState({ ...obj });
        } else {
            this.setState({ ...obj }, fun);
        }
    }

    resetHeight = _.debounce(() => {
        let screenHeight = document.documentElement.clientHeight;
        if (screenHeight > 0 && this.filterRef && this.filterRef.clientHeight) {
            let tableHeight = screenHeight - 107 - this.filterRef.clientHeight;
            this.setState({ tableHeight });
        }
    }, 500)

    doClose = (callback, doCloseParams) => {
        switch (doCloseParams.src) {
            case doCloseFuncSrc.CLOSE_BY_LOGOUT:
            case doCloseFuncSrc.CLOSE_BY_MAIN_TAB_CLOSE_BUTTON:
            case doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON:
            case doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON:
                callback(true);
                this.props.deleteTabs(accessRightEnum.viewNeonatalLog);
                break;
        }
    }

    handleBack = () => {
        this.props.tabs.map((item,index)=>{
            if (item.name==accessRightEnum.gscEnquiry) {
                this.props.redirectTab(accessRightEnum.viewNeonatalLog,accessRightEnum.gscEnquiry);
            } else {
                this.props.deleteTabs(accessRightEnum.viewNeonatalLog);
            }
        });
        this.setState({ tableList: [], actionBy: [] });
        this.insertCgsViewNeonatalLogLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Back' button`);
    }
    replaceStr = (str, index, char) => {
        const strAry = str.split(',');
        if (strAry.length>1 && strAry[1]!=' ') {
            strAry[index] = `${char},`;
        }else{
            strAry[index] = char;
        }
        return strAry.join('');
    }
    generateTableContent = () => {
        let { classes } = this.props;
        let { tableList } = this.state;
        let elements = tableList.map((item, index) => {
            let reasonVal=_.cloneDeep(item.reason);
            let matchedStr=reasonVal==null ? 'other' : reasonVal.split(',')[0];
            switch ( matchedStr ) {
                case 'LRC':
                   item.reason= this.replaceStr(item.reason,0,'Lab result changed');
                    break;
                case 'HE':
                    item.reason= this.replaceStr(item.reason,0,'Human error');
                    break;
                case 'OTH':
                    item.reason= this.replaceStr(item.reason,0,'Others');
                    break;
            }
            if (item.patchedRecord.includes('CHT')) {
                switch (item.valBefore) {
                    case 'A':
                        item.valBefore='Screened Positive';
                        break;
                    case 'N':
                        item.valBefore='Screened Negative';
                        break;
                }
                switch (item.valAfter) {
                    case 'A':
                        item.valAfter='Screened Positive';
                        break;
                    case 'N':
                        item.valAfter='Screened Negative';
                        break;
                }
            }else if(item.patchedRecord.includes('G6PD')){
                switch (item.valBefore) {
                    case 'A':
                        item.valBefore='Deficient';
                        break;
                    case 'B':
                        item.valBefore='Borderline';
                        break;
                    case 'N':
                        item.valBefore='Not Deficient';
                        break;
                }
                switch (item.valAfter) {
                    case 'A':
                        item.valAfter='Deficient';
                        break;
                    case 'B':
                        item.valAfter='Borderline';
                        break;
                    case 'N':
                        item.valAfter='Not Deficient';
                        break;
                }

            }
            return (
                <TableRow className={classes.tableRow} key={`viewNeonatalLogTable_${index}`} >
                    <TableCell className={classes.tableCall}>
                        <Tooltip title={item.actionDate ? moment(item.actionDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item.actionDate ? moment(item.actionDate).format(Enum.DATE_FORMAT_EDMY_VALUE) : ''}</label>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.tableCall}>
                        <Tooltip title={item ? item.userName : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item ? item.userName : ''}</label>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.tableCall}>
                        <Tooltip title={item ? item.action : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item ? item.action : ''}</label>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.tableCall}>
                        <Tooltip title={item ? item.patchedRecord : ''} classes={{ tooltip: classes.tooltip }} >
                            <label className={classes.displayLabel}>{item ? item.patchedRecord : ''}</label>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.tableCall}>
                        <Tooltip title={item ? item.valBefore : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item ? item.valBefore : ''}</label>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.tableCall}>
                        <Tooltip title={item ? item.valAfter : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item ? item.valAfter : ''}</label>
                        </Tooltip>
                    </TableCell>
                    <TableCell className={classes.tableCall}>
                        <Tooltip title={item ? item.reason : ''} classes={{ tooltip: classes.tooltip }}>
                            <label className={classes.displayLabel}>{item ? item.reason : ''}</label>
                        </Tooltip>
                    </TableCell>
                </TableRow>
            );
        });
        return elements;
    }

    render() {
        let { classes } = this.props;
        let { actionDrop, actionBy, tableHeight, tableList } = this.state;
        let dropList = { actionDrop, actionBy };
        let FilterProps = {
            tableHeight,
            updateState: this.updateState,
            handleBack: this.handleBack,
            onSearch: this.onSearch
        };
        let contentElements = this.generateTableContent();
        return (
            <Grid className={classes.root}>
                <Grid ref={(ref) => { this.filterRef = ref; }}>
                    <Filter options={dropList} {...FilterProps} />
                </Grid>
                <div className={classes.rootTable}>
                    <Grid style={{ height: tableHeight }}>
                        <Table>
                            <TableHead>
                                <TableRow className={classes.tableHeadRow}>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '15%' }}>Action Date</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '18%' }}>Action By</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '10%' }}>Action</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '10%' }}>Patched Record</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '22%' }}>Before Value</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '10%' }}>After Value</TableCell>
                                    <TableCell className={classes.tableHeadCall} style={{ width: '15%' }}>Reason</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableList.length > 0 ? (contentElements) : (
                                    <TableRow style={{ height: 'auto' }}>
                                        <TableCell colSpan={7} className={classes.tableCellRow}>
                                            <Typography style={{ padding: 10 }}>There is no data.</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Grid>
                </div>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    patientInfo: state.patient.patientInfo,
    tabs: state.mainFrame.tabs
});

const mapDispatchToProps = {
    deleteTabs,
    redirectTab,
    updateCurTab,
    openCommonMessage,
    closeCommonMessage,
    openCommonCircularDialog,
    closeCommonCircularDialog,
    getViewNeonatalLogLoadDrop,
    getViewNeonatalLogSearch
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ViewNeonatalLog));