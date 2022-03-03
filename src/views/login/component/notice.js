import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Grid, Typography, Tooltip, Box} from '@material-ui/core';
import {colors} from '@material-ui/core';
import SelectFieldValidator from '../../../components/FormValidator/SelectFieldValidator';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import MarqueeScrollTable from './MarqueeScrollTable';
// import AutoScrollTable from '../../../components/Table/AutoScrollTable';
import {withStyles} from '@material-ui/core/styles';
import {getServiceNotice} from '../../../store/actions/login/loginAction';
import _ from 'lodash';
import moment from 'moment';
import memoize from 'memoize-one';
import {DeleteForever, FiberNewRounded, NotificationImportantRounded, Warning} from '@material-ui/icons';
import Enum from '../../../enums/enum';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import {
    downloadFile
} from '../../../store/actions/administration/noticeBoard/noticeBoardAction';

const style = () => ({
    buttonRoot: {
        padding: 0,
        textTransform: 'none'
    },
    gridPadding15: {
        paddingBottom: 15
    },
    detailTypography: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'justify',
        fontSize: '0.875rem',
        fontWeight: 400
    },
    svgIcon: {
        marginBottom: -5
    },
    themeColor: {
        dark: colors.green[500]
    },
    get buttonColor() {
        return {
            color: this.themeColor.dark,
            borderColor: this.themeColor.dark,
            '&:hover': {
                color: '#ffffff',
                backgroundColor: this.themeColor.dark
            }
        };
    }
});

const columnStyle = {
    head: {
        backgroundColor: colors.green[500]
    }
};

class Notice extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [
                {
                    label: 'To',
                    name: 'recipient',
                    width: '10%',
                    style: columnStyle
                },
                {
                    label: 'Date',
                    name: 'efftDate',
                    width: '10%',
                    style: columnStyle,
                    customBodyRender: (value) => {
                        return value ? moment(value).format(Enum.DATE_FORMAT_24_HOUR) : value;
                    }
                },
                {
                    label: 'Details',
                    name: 'content',
                    width: '80%',
                    style: columnStyle,
                    customBodyRender: (value, rowData) => {
                        return (
                            <Typography component="div" className={this.props.classes.detailTypography}>
                                {rowData.isDel ? <Tooltip title="Delete"><DeleteForever
                                    className={this.props.classes.svgIcon}
                                                                         /></Tooltip> : null}
                                {rowData.isImprtnt && (rowData.imprtntExpyDate ? moment().isSameOrBefore(moment(rowData.imprtntExpyDate), 'day') : true) ? <Tooltip title="Important"><Warning color="secondary"
                                    className={this.props.classes.svgIcon}
                                                                                                                                                                                      /></Tooltip> : null}
                                {rowData.isNew && (rowData.newExpyDate ? moment().isSameOrBefore(moment(rowData.newExpyDate), 'day') : true) ? <Tooltip title="New"><FiberNewRounded htmlColor="blue"
                                    className={this.props.classes.svgIcon}
                                                                                                                                                                    /></Tooltip> : null}
                                {rowData.isUrg && (rowData.urgExpyDate ? moment().isSameOrBefore(moment(rowData.urgExpyDate), 'day') : true) ? <Tooltip title="Urgent"><NotificationImportantRounded color="error"
                                    className={this.props.classes.svgIcon}
                                                                                                                                                                       /></Tooltip> : null}
                                {value}
                                {rowData.docName ? ' Please click ' : ''}
                                {rowData.docName ?
                                    <span style={{ color: 'blue', textDecoration: 'underline' }}
                                        onClick={() => {
                                            this.props.downloadFile(rowData.noticeId, (data) => {
                                                let blob = new Blob([data]);
                                                blob = new Blob([blob], { type: 'octet/stream' });
                                                const link = document.createElement('a');
                                                let url = window.URL.createObjectURL(blob);
                                                link.download = rowData.docName;
                                                link.href = url;
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            });
                                        }}
                                    >
                                        {'here'}
                                    </span> : ''}
                                {rowData.docName ? ' to read the document.' : ''}
                            </Typography>
                        );
                    }
                }
            ],
            serviceCd: '',
            selectIndex: [],
            isMarqueeBtnStart: true,
            noticeFilterList: null
        };
    }

    componentDidMount() {
        this.props.getServiceNotice();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.noticeList !== this.props.noticeList || prevProps.serviceList !== this.props.serviceList) {
            // let dummy_noticeFilterList = [];
            const noticeFilterList = this.filterNotice(this.props.noticeList, this.state.serviceCd);
            /*            for (let i = 0; i < 20; i++) {
                            noticeFilterList.map((value, key) => {
                                dummy_noticeFilterList.push(noticeFilterList[key]);
                            });
                        }*/
            this.setState({
                ...this.state,
                noticeFilterList: noticeFilterList.filter((item) => {
                    let isEffective = true;
                    if (moment().isBefore(moment(item.efftDate),'day') || (item.expyDate && moment().isAfter(moment(item.expyDate),'day'))) {
                        isEffective = false;
                    }
                    return item.isEnable == 1 && isEffective && item.isDel !== 1;
                }).sort((a, b) => {
                    if (a.isAlwaysOnTop === 1 && b.isAlwaysOnTop === 0) {
                        return -1;
                    } else if (a.isAlwaysOnTop === 0 && b.isAlwaysOnTop === 1) {
                        return 1;
                    }
                    else {
                        if (moment(a.efftDate).isAfter(moment(b.efftDate))) {
                            return -1;
                        } else {
                            return 1;
                        }
                    }
                })
            });
        }
    }

    filterNotice = (list, serviceCd) => {
        let serviceList = _.cloneDeep(this.props.serviceList);
        serviceList = serviceList.filter(item => item.cims2Svc === 1);
        list = list.filter(item => serviceList.filter(ele => ele.serviceCd === item.svcCd).length > 0 || item.svcCd === undefined);
        if (serviceCd) {
            return list.filter((item) => {
                return item.svcCd === serviceCd || item.svcCd === undefined;
            });
        } else {
            return list;
        }
    }

    handleChange = (value, name) => {
        const noticeFilterList = this.filterNotice(this.props.noticeList, value);
        /*            for (let i = 0; i < 20; i++) {
                        noticeFilterList.map((value, key) => {
                            dummy_noticeFilterList.push(noticeFilterList[key]);
                        });
                    }*/
        this.setState({
            ...this.state,
            [name]: value,
            noticeFilterList: noticeFilterList.filter((item) => {
                let isEffective = true;
                if (moment().isBefore(moment(item.efftDate),'day') || (item.expyDate && moment().isAfter(moment(item.expyDate),'day'))) {
                    isEffective = false;
                }
                return item.isEnable === 1 && isEffective && item.isDel !== 1;
            }).sort((a, b) => {
                if (a.isAlwaysOnTop === 1 && b.isAlwaysOnTop === 0) {
                    return -1;
                } else if (a.isAlwaysOnTop === 0 && b.isAlwaysOnTop === 1) {
                    return 1;
                }
                else {
                    if (moment(a.efftDate).isAfter(moment(b.efftDate))) {
                        return -1;
                    } else {
                        return 1;
                    }
                }
            })
        });
    }

    handleTableRowClick = (e, row, index) => {
        if (this.state.selectIndex.indexOf(index) > -1) {
            this.setState({selectIndex: []});
        } else {
            this.setState({selectIndex: [index]});
        }
    }

    render() {
        const {classes} = this.props;
        let serviceList = [];
        if (this.props.serviceList) {
            serviceList = _.cloneDeep(this.props.serviceList);
            serviceList = serviceList.filter(item=> item.cims2Svc === 1).sort((a, b) => { return a.serviceName.localeCompare(b.serviceName); });
            serviceList.splice(0, 0, {serviceCd: '', serviceName: 'All Services'});
        }

        return (
            <ValidatorForm onSubmit={() => {
            }}
            >
                <Grid container>
                    <Grid item xs={6} style={{'alignSelf': 'center'}}>
                        <SelectFieldValidator
                            id="notice_serviceCd"
                            options={serviceList.map((item) => (
                                {value: item.serviceCd, label: item.serviceName}
                            ))}
                            value={this.state.serviceCd}
                            placeholder="All Services"
                            onChange={e => this.handleChange(e.value, 'serviceCd')}
                        />
                    </Grid>
                    <Grid item xs={6}
                        style={{'textAlign': 'right'}}
                    >
                        <CIMSButton
                            id={'marqueeStartPauseBtn'}
                            className={classes.buttonColor}
                            color="primary"
                            onClick={() => {
                                this.setState({
                                    ...this.state,
                                    isMarqueeBtnStart: !this.state.isMarqueeBtnStart
                                });
                            }}
                        >
                            {this.state.isMarqueeBtnStart ? 'Pause' : 'Start'}
                        </CIMSButton>
                    </Grid>
                    <Grid item xs={12}>
                        <MarqueeScrollTable
                            id="login_notice_scrollTable"
                            columns={this.state.columns}
                            store={this.state.noticeFilterList}
                            selectIndex={this.state.selectIndex}
                            handleRowClick={this.handleTableRowClick}
                            isMarqueeBtnStart={this.state.isMarqueeBtnStart}
                        />
                    </Grid>
                </Grid>
            </ValidatorForm>
        );
    }
}

function mapStateToProps(state) {
    return {
        serviceList: state.common.serviceList,
        noticeList: state.login.noticeList,
        serviceCd: state.login.service.serviceCd
    };
}

const dispatchProps = {
    getServiceNotice,
    downloadFile
};

export default connect(mapStateToProps, dispatchProps)(withStyles(style)(Notice));
