import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    FormControl, Typography, withStyles, CardContent, InputLabel,Divider,
    Table, TableCell, TableHead, TableRow, TableBody,Card,TablePagination
} from '@material-ui/core';
import JSelect from '../../../../components/JSelect';
import Form from '../../../../components/JForm';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import { styles } from './assessmentHistoryStyle';
import * as assessmentTypes from '../../../../store/actions/assessment/assessmentActionType';
import _ from 'lodash';
import moment from 'moment';
import classNames from 'classnames';
import Container from 'components/JContainer';
import TablePaginationActions from '../../../../components/Table/TablePaginationActions';
import * as commonConstants from '../../../../constants/common/commonConstants';
import * as commonUtils from '../../../../utilities/josCommonUtilties';
import Enum from '../../../../../src/enums/enum';
import { updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import doCloseFuncSrc from '../../../../constants/doCloseFuncSrc';
import * as commonActionType from '../../../../store/actions/common/commonActionType';


class assessmentHistory extends Component {
  constructor(props) {
    super(props);
      this.content = React.createRef();
      this.state = {
          emptyList: [{ value: 'ALL', title: 'ALL' }],
          serviceOptions: [],
          clinicOptions: [],
          currentService: '',
          clinicCdValue: '',
          tableHeadInfo: [],
          tableBodyInfo: [],
          tableArray: [],
          divTableHight: 500,
          pageNum: 0,
          pageSize: 10,
          pageCount: 0,
          pageRowOptions: [10, 20, 50],
          initialParm: {},
          disabledFlag: false
      };
  }
    componentWillMount() {
        this.resetHeight();
        window.addEventListener('resize', this.resetHeight);
    }
    componentDidMount() {
        this.props.ensureDidMount();
        const { loginInfo = {} ,patientInfo} = this.props;
        document.getElementById('undefined_nextPage').addEventListener('click',this.handleLogPaginationChange);
        document.getElementById('undefined_lastPage').addEventListener('click',this.handleLogPaginationChange);
        document.getElementById('undefined_previousPage').addEventListener('click',this.handleLogPaginationChange);
        document.getElementById('undefined_firstPage').addEventListener('click',this.handleLogPaginationChange);
        let clinicOptions = commonUtils.getClinicListByServiceCd(loginInfo.service.serviceCd);
        let genderCd = patientInfo.genderCd;
        let serviceCd = loginInfo.service.serviceCd;
        let clinicCd = loginInfo.clinic.clinicCd;
        let owneClinic = commonUtils.getOwnClinic();
        let initialParm = {
            genderCd: genderCd,
            patientKey: patientInfo.patientKey,
            serviceCd: serviceCd,
            clinicCd: owneClinic?owneClinic:clinicCd,
            pageNum: this.state.pageNum,
            pageSize: this.state.pageSize
        };
        this.setState({
            clinicOptions,
            // currentService: serviceCd,
            // clinicCdValue: owneClinic?owneClinic:clinicCd,
            initialParm: initialParm
        });
        this.loadHeadData(genderCd, serviceCd, owneClinic?owneClinic:clinicCd);
        setTimeout(() => {
            this.loadBodyData(initialParm);
        }, 500);
        this.insertClinicalnoteLog('Action: ' + commonConstants.INSERT_LOG_STATUS.Open + ' Assessment History', 'assessment/assessmentHistory/');
        this.initServiceListAndClinicList('/assessment/assessmentHistory');
        this.props.updateCurTab('F128', this.doClose);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.resetHeight);
         document.getElementById('undefined_nextPage').removeEventListener('click', this.handleLogPaginationChange);
        document.getElementById('undefined_lastPage').removeEventListener('click', this.handleLogPaginationChange);
        document.getElementById('undefined_previousPage').removeEventListener('click', this.handleLogPaginationChange);
        document.getElementById('undefined_firstPage').removeEventListener('click', this.handleLogPaginationChange);
    }
    resetHeight = _.debounce(() => {
        if (this.content.current && this.content.current.clientHeight && this.content.current.clientHeight !== this.state.divTableHight) {
            this.setState({
                divTableHight: this.content.current.clientHeight-270
            });
        }
    }, 1000);

    initServiceListAndClinicList = (apiFunctionName) =>{
        const { dispatch, patientInfo, loginInfo }=this.props;
        let { patientKey } = patientInfo;
        let params = {
          apiFunctionName:apiFunctionName,
          patientKey : patientKey
        };
        dispatch({
          type:commonActionType.GET_COMMON_SERVICED_LIST,
          params,
          callback : (data) => {
            let serviceOptions = commonUtils.getServiceListByServiceCdList(data);
            let clinicOptions = commonUtils.getClinicListByServiceCd(loginInfo.service.serviceCd);
            let serviceCdIsExist = _.find(serviceOptions,{ 'value': loginInfo.service.serviceCd });
            this.handleServiceChange(serviceOptions.length == 1 || !serviceCdIsExist ? 'ALL' : loginInfo.service.serviceCd);
            let owneClinic = commonUtils.getOwnClinic();
            this.setState({
                clinicOptions,
                serviceOptions,
                currentService: serviceOptions.length == 1 || !serviceCdIsExist ? 'ALL' : loginInfo.service.serviceCd,
                clinicCdValue: serviceOptions.length == 1 || !serviceCdIsExist ? 'ALL' : (owneClinic ? owneClinic : loginInfo.clinic.clinicCd)
            });
          }
        });
      }

    findCurrentResult = (result,clinic,service) =>{
        let arr = [];
        if(result.has('first')){
          arr.push(result.get('first').svcCd);
          arr.push(result.get('first').paramValue==='Clinic'?clinic.clinicCd:'ALL');
        }else if(result.has('second')){
          arr.push(result.get('second').svcCd);
          arr.push(result.get('second').paramValue==='Clinic'?clinic.clinicCd:'ALL');
        }else if(result.has('third')){
          arr.push(service.serviceCd);
          arr.push(result.get('third').paramValue==='Clinic'?clinic.clinicCd:'ALL');
        }else{
          arr.push(service.serviceCd);
          arr.push(clinic.clinicCd);
        }
        return arr;
      }

    loadHeadData = (genderCd,serviceCd,clinicCd) => {
        this.props.dispatch({
            type: assessmentTypes.GET_ASSESSMENT_HISTORY_TABLEHEAD_LIST, params: {
                genderCd: genderCd,
                serviceCd: serviceCd,
                clinicCd: clinicCd
            },
            callback: (templateHeadList) => {
                let tableHeadReuslt = this.generaltableHeadResult(templateHeadList);
                this.setState({
                    tableHeadInfo: tableHeadReuslt[0].tableHeadRow,
                    tableArray: tableHeadReuslt[0].tableHeadBodyRow
                });
            }
        });
    }

    loadBodyData = (initialParm) => {
        let params = {
            genderCd: initialParm.genderCd,
            patientKey: initialParm.patientKey || 0,
            serviceCd: initialParm.serviceCd,
            clinicCd: initialParm.clinicCd,
            pageNum: initialParm.pageNum === undefined ? 0 : initialParm.pageNum,
            pageSize: initialParm.pageSize === undefined ? 10 : initialParm.pageSize
        };
        this.props.dispatch({
            type: assessmentTypes.GET_ASSESSMENT_HISTORY_TABLEBODY_LIST,
            params: params,
            callback: (dataList) => {
                if (dataList.respCode === 0) {
                    const { pageDto, resultData } = dataList.data;
                    let tableBodyResult = this.generaltableCellResult(resultData, this.state.tableArray);
                    this.setState({
                        pageNum: initialParm.pageNum === undefined ? 0 : initialParm.pageNum,
                        pageCount: pageDto.count,
                        tableBodyInfo: tableBodyResult
                    });
                } else {
                    this.setState({
                        pageNum: 0,
                        pageSize: 10,
                        pageCount: 0
                    });
                }
            }
        });
    }

    doClose = (callback, doCloseParams) => {
        if (doCloseParams.src === doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON) {
            this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'X' to Close Assessment History`, 'assessment/assessmentHistory/');
            callback(true);
        } else {
            callback(true);
        }
    }

    handleServiceChange = (value) => {
        const { loginInfo = {}, common } = this.props;
        const { serviceList } = common;
        let name = '';
        let serviceCd = serviceList.filter(item => {
            return item.serviceCd === value;
        });
        let clinicOption = commonUtils.getClinicListByServiceCd(value);
        let ownerClinic = commonUtils.getOwnClinic();
        if (value === 'ALL') {
            name = `Action: ${commonConstants.INSERT_LOG_STATUS.Select} service: ${value} in drop-down list`;
        } else {
            name = `Action: ${commonConstants.INSERT_LOG_STATUS.Select} service: ${serviceCd[0].serviceName} in drop-down list (Service code: ${value})`;
        }
        this.insertClinicalnoteLog(name, '');
        this.setState({
            currentService: value,
            clinicOptions: clinicOption,
            clinicCdValue: value === loginInfo.service.serviceCd ? (ownerClinic ? ownerClinic : loginInfo.clinic.clinicCd) : 'ALL',
            disabledFlag: value === 'ALL' ? true : false
        });

    }
    handleClinicChange = (value) => {
        if (value === 'ALL') {
            this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} clinic: ${value} in drop-down list`, 'assessment/assessmentHistory/');
        } else {
            const { common } = this.props;
            const { clinicList } = common;
            let { currentService } = this.state;
            let clinicOptions = clinicList.filter(item => {
                return item.serviceCd === currentService;
            });
            let clinicValue = clinicOptions.filter(item => {
                return item.clinicCd === value;
            });
            this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Select} clinic: ${clinicValue[0].clinicName} in drop-down list (Clinic code: ${value})`, 'assessment/assessmentHistory/');
        }
        this.setState({ clinicCdValue: value });
    }
    onSearch = (params) => {
        const { initialParm } = this.state;
        initialParm.serviceCd = params.serviceCd;
        initialParm.clinicCd = params.clinicCd;
        initialParm.pageNum = params.pageNum || 0;
        initialParm.pageSize = params.pageSize || 10;
        this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} 'Search' button (Service: ${initialParm.serviceCd}; Clinic: ${initialParm.clinicCd}; Page size: ${initialParm.pageSize}; Page number: ${initialParm.pageNum})`,'assessment/assessmentHistory/');
        this.setState({
            tableHeadInfo: [],
            tableBodyInfo: [],
            tableArray: []
        });
        this.loadHeadData(initialParm.genderCd, params.serviceCd, params.clinicCd);
        setTimeout(() => {
            this.loadBodyData(initialParm);
        }, 1000);
    }

    generaltableHeadResult=(tableHeadList)=>{
        let params = [];
        let secondRowCell = [];
        let rowspan = 0;
        let tableArray=[];
        const { classes } = this.props;
        if (tableHeadList.length > 0) {
            for (let index = 0; index < tableHeadList.length; index++) {
                if (tableHeadList[index].value.length > 0) {
                    rowspan = 2; break;
                }
            }
            params.push(<TableRow className={classes.tableHeadRow}>
                {
                    tableHeadList.map(data => {
                        if (data.value.length > 0) {
                            secondRowCell = _.concat(secondRowCell, data.value);
                            data.value.forEach(element => {
                                tableArray.push(element);
                            });
                            return <TableCell padding="none" className={classes.tableHeadCell} colSpan={data.value.length}>{data.key}</TableCell>;
                        } else {
                            tableArray.push(data.key);
                            let styleWidth = 0;
                            switch (data.key) {
                                case 'Encounter Date':
                                    styleWidth = 120;
                                    break;
                                case 'Last Updated User':
                                case 'Last Updated Date':
                                    styleWidth = 150;
                                    break;
                                default:
                                    return rowspan > 0 ? <TableCell padding="none" className={classes.tableHeadCell} rowSpan={rowspan}>{data.key}</TableCell> : <TableCell padding="none" className={classes.tableHeadCell}>{data.key}</TableCell>;
                            }
                            return rowspan > 0 ? <TableCell padding="none" style={{ width: styleWidth }} className={classes.tableHeadCell} rowSpan={rowspan}>{data.key}</TableCell> : <TableCell padding="none" style={{width:styleWidth}} className={classes.tableHeadCell}>{data.key}</TableCell>;
                        }
                    })
                }
            </TableRow>);
            if (secondRowCell.length > 0) {
                params.push(<TableRow className={classes.tableHeadRow}>
                    {
                        secondRowCell.map((data, index) => {
                            if (data === 'Weight Gain(BW)(kg)' || data === 'Pre-pregnancy BMI' || data === 'Weight Gain(BW)' || data === '1st Encounter BMI') {
                                return <TableCell padding="none" style={{ width: '6%', minWidth: 170, top: 32 }} key={`${index}_row_2`} className={classes.tableHeadCell}>
                                    <Divider className={classes.tableDivider} />
                                    <span style={{ position: 'absolute' }}>{data}</span>
                                </TableCell>;
                            } else {
                                return <TableCell padding="none" style={{ width: '6%', minWidth: data.length > 12 ? 130 : 100, top: 32 }} key={`${index}_row_2`} className={classes.tableHeadCell}>
                                    <Divider className={classes.tableDivider} />
                                    <span style={{ position: 'absolute' }}>{data}</span>
                                </TableCell>;
                            }
                        })
                    }
                </TableRow>);
            }
        } else {
            let rowText = <TableRow className={classes.tableHeadRow}><TableCell align="center">There is no data</TableCell></TableRow>;
            return [{ tableHeadRow: rowText, tableHeadBodyRow: tableArray }];
        }
        return [{ tableHeadRow: params, tableHeadBodyRow: tableArray }];
    }

    generaltableCellResult = (tableBodyList, tableArray) => {
        let contents = [];
        const { classes } = this.props;
        if (tableBodyList.length > 0) {
            let defauleDMY = tableArray[0];
            let defauleDMYHM = tableArray[tableArray.length - 1];
            for (let i = 0; i < tableBodyList.length; i++) {
                const element = tableBodyList[i];
                let { TotalRow } = element;
                for (let j = 0; j < TotalRow[0]; j++) {
                    let tableBody = this.subMethod(element, tableArray, j, TotalRow, defauleDMY, defauleDMYHM);
                    let tableRows = <TableRow key={`tableRow_${i}_${j}`} className={i % 2 == 0 ? classNames(classes.tableContentrow, classes.odd) : classNames(classes.tableContentrow, classes.event)}>{tableBody}</TableRow>;
                    contents.push(tableRows);
                }
            }
        } else {
            return <TableRow><TableCell align="center" colSpan={tableArray.length}>There is no data</TableCell></TableRow>;
        }
        return contents;
    }
    subMethod = (element, tableArray, index, totalRow, dateDMY, dateDMYHM) => {
        const { classes } = this.props;
        let contents = [];
        tableArray.forEach((item, dataRow) => {
            let values = element[item] ? true : false;
            if(!values) {
                contents.push(<TableCell className={classes.tableContentCell} key={`dataIndex1_${dataRow}`}></TableCell>);
            }else {
                let dataStr = '';
                values = element[item][index];
                if (element[item].length === 0) {
                    if (index === 0) {
                        contents.push(<TableCell className={classes.tableContentCell} key={`rowIndex_${dataRow}`} rowSpan={totalRow}></TableCell>);
                    }
                } else if (element[item].length === 1) {
                    if (values) {
                        if (item === dateDMYHM) {
                            dataStr = moment(values).format(Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR);
                        } else if (item === dateDMY) {
                            dataStr = moment(values).format(Enum.DATE_FORMAT_EDMY_VALUE);
                        } else { dataStr = values;}
                        contents.push(<TableCell className={classes.tableContentCell} key={`dataIndex_${dataRow}`} rowSpan={totalRow}>{dataStr}</TableCell>);
                    }
                } else {
                    if (values) {
                        if (item === dateDMYHM) {
                            dataStr = moment(values).format(Enum.DATE_FORMAT_EYMMD_VALUE_24_HOUR);
                        } else {
                            dataStr = values;
                        }
                        contents.push(<TableCell className={classes.tableContentCell} key={`rowIndex1_${dataRow}`}>{dataStr}</TableCell>);
                    } else {
                        contents.push(<TableCell className={classes.tableContentCell} key={`dataIndex1_${dataRow}`}></TableCell>);
                    }
                }
            }
        });
        return contents;
    }

    handleChangePage = (event, newPage) => {
        const { initialParm } = this.state;
        initialParm.pageNum = newPage;
        this.setState({ pageNum: newPage, tableBodyInfo: [] }, () => {
            this.loadBodyData(initialParm);
        });
    }

    handleLogPaginationChange = (event) => {
        const { initialParm, count, rowsPerPage } = this.state;
        const { currentTarget } = event;
        let { ariaLabel } = currentTarget;
        if (ariaLabel === 'Next Page') {
            this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} '>' button to go to page: ${initialParm.pageNum + 2}`, '');
        } else if (ariaLabel === 'Last Page') {
            this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} '>|' button to go to page: ${parseInt(count / rowsPerPage) + 1}`, '');
        } else if (ariaLabel === 'Previous Page') {
            this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} '<' button to go to page: ${initialParm.pageNum}`, '');
        } else if (ariaLabel === 'First Page') {
            this.insertClinicalnoteLog(`Action: ${commonConstants.INSERT_LOG_STATUS.Click} '|<' button to go to page: ${1}`, '');
        }
    }

    handleChangeRowsPerPage = (event) => {
        const { initialParm } = this.state;
        let rowsPerPage = parseInt(event.target.value, 10);
        initialParm.pageNum = 0;
        initialParm.pageSize = rowsPerPage;
        this.setState({ pageNum: 0, pageSize: rowsPerPage, tableBodyInfo: [] }, () => {
            this.loadBodyData(initialParm);
        });
    }
    handleCancelLog = (name,apiName='') => {
        this.insertClinicalnoteLog(name, apiName);
    };

    // Demo Test
    // generaltableCellResultTest = (tableBodyList,tableArray) => {
    //     let params = [];
    //     if (tableBodyList.length > 0) {
    //         tableBodyList.map(item => {
    //             params.push(this.generaltableTest(item, tableArray));
    //         });
    //     } else {
    //         return <TableRow><TableCell align="center" colSpan={tableArray.length}>There no is data</TableCell></TableRow>;
    //     }
    //     return params;
    // }
    // generaltableTest = (item, tableArray) => {
    //     let tableRows = tableArray.map((data, dataIndex) => {
    //         let values = '';
    //         if (item[data].length === 1) {
    //             values = item[data];
    //         } else if (item[data].length > 1) {
    //             values = item[data].map((row, rowIndex) => {
    //                 return <div key={`tableCell_${rowIndex}`} style={{ textAlign: 'center' }}>
    //                     <label>{row}</label>
    //                     <Divider />
    //                 </div>;
    //             });
    //         }
    //         return <TableCell key={dataIndex}>{values}</TableCell>;
    //     });
    //     return <TableRow>{tableRows}</TableRow>;
    // }

    insertClinicalnoteLog = (desc, apiName = '',content='') => {
        commonUtils.commonInsertLog(apiName, 'F128', 'Assessment History', desc,'assessment',content);
    };

    render() {
        const { classes } = this.props;
        let { currentService, serviceOptions,
            clinicOptions, clinicCdValue,
            emptyList, tableHeadInfo, tableBodyInfo,
            pageNum, pageSize, pageCount, pageRowOptions,
            divTableHight,
            disabledFlag
        } = this.state;
        return (
            <Container buttonBar={{ position: 'fixed', handleCancelLog: this.handleCancelLog }}>
                <Typography component="div" className={classes.wrapper} ref={this.content}>
                    <Card className={classes.bigContainer}>
                        <CardContent style={{ paddingTop: 0 }}>
                            <Typography component="div" className={classes.topDiv}>
                                <Typography component="div" className={classes.fontTitle}>Assessment History</Typography>
                                <Typography component="div">
                                    <Form style={{ marginLeft: 20 }} onSubmit={this.onSearch}>
                                        <FormControl id={'assessment_service_select'}>
                                            <InputLabel classes={{root: classes.inputLabel,focused: classes.inputLabel}}>Service</InputLabel>
                                            <JSelect name="serviceCd" options={serviceOptions} value={currentService} onChange={this.handleServiceChange} onChangeFlag/>
                                        </FormControl>
                                        <FormControl id={'assessment_clinic_select'}>
                                            <InputLabel classes={{root: classes.inputLabel,focused: classes.inputLabel}}>Clinic</InputLabel>
                                            <JSelect name="clinicCd" options={clinicOptions.length > 0 ? clinicOptions : emptyList} value={clinicCdValue} onChange={this.handleClinicChange} disabled={disabledFlag} />
                                        </FormControl>
                                        <CIMSButton classes={{ root: classes.btnRoot }} id="Search" type={'submit'} maxWidth="6%" style={{ width: '30%' }} variant="contained" color="primary">Search</CIMSButton>
                                    </Form>
                                </Typography>
                            </Typography>
                            <Typography component="div" style={{ overflow: 'auto', height: divTableHight }}>
                                <Table id="manage_template_table">
                                    <TableHead>{tableHeadInfo}</TableHead>
                                    <TableBody>{tableBodyInfo}</TableBody>
                                </Table>
                            </Typography>
                            <TablePagination
                                classes={{
                                    root: classes.paginationRoot,
                                    caption: classes.caption,
                                    menuItem: classes.menuItem
                                }}
                                component="div"
                                rowsPerPageOptions={pageRowOptions}
                                count={pageCount}
                                rowsPerPage={pageSize}
                                page={pageNum}
                                ActionsComponent={TablePaginationActions}
                                onChangePage={this.handleChangePage}
                                onChangeRowsPerPage={this.handleChangeRowsPerPage}
                            />
                        </CardContent>
                    </Card>
                </Typography>
            </Container>
        );
    }
}
function mapStateToProps(state) {
    return {
        loginInfo: {
            ...state.login.loginInfo,
            service: state.login.service,
            clinic: state.login.clinic
        },
        common: state.common,
        patientInfo: state.patient.patientInfo,
        encounterData: state.patient.encounterInfo
    };
}

const mapDispatchToProps = {
    updateCurTab
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(assessmentHistory));