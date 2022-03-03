import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid, Typography, Tooltip } from '@material-ui/core';
import { colors } from '@material-ui/core';
import MarqueeScrollTable from './../../../login/component/MarqueeScrollTable';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import { DeleteForever, FiberNewRounded, NotificationImportantRounded, Warning } from '@material-ui/icons';
import Enum from '../../../../enums/enum';
import {
    downloadFile
} from '../../../../store/actions/administration/noticeBoard/noticeBoardAction';
import _ from 'lodash';

const style = () => ({
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

class PreviewNotice extends Component {
    constructor(props) {
        super(props);

        this.state = {
            columns: [
                {
                    label: 'To',
                    name: 'recipient',
                    width: '20%',
                    style: columnStyle
                },
                {
                    label: 'Date',
                    name: 'efftDate',
                    width: '20%',
                    style: columnStyle,
                    customBodyRender: (value) => {
                        return value ? moment(value).format(Enum.DATE_FORMAT_24_HOUR) : value;
                    }
                },
                {
                    label: 'Details',
                    name: 'content',
                    width: '70%',
                    style: columnStyle,
                    customBodyRender: (value, rowData) => {
                        return (
                            <Typography component="div" className={this.props.classes.detailTypography}>
                                {rowData.isDel ? <Tooltip title="Delete"><DeleteForever
                                    className={this.props.classes.svgIcon}
                                                                         /></Tooltip> : null}
                                {rowData.isImprtnt && (rowData.imprtntExpyDate ? moment().isSameOrBefore(moment(rowData.imprtntExpyDate),'day') : true) ? <Tooltip title="Important"><Warning color="secondary"
                                    className={this.props.classes.svgIcon}
                                                                                                                                                                                     /></Tooltip> : null}
                                {rowData.isNew && (rowData.newExpyDate ? moment().isSameOrBefore(moment(rowData.newExpyDate),'day') : true) ? <Tooltip title="New"><FiberNewRounded htmlColor="blue"
                                    className={this.props.classes.svgIcon}
                                                                                                                                                                   /></Tooltip> : null}
                                {rowData.isUrg && (rowData.urgExpyDate ? moment().isSameOrBefore(moment(rowData.urgExpyDate),'day') : true) ? <Tooltip title="Urgent"><NotificationImportantRounded color="error"
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
            selectIndex: [],
            noticeFilterList: null
        };
    }

    componentDidMount() {
        let serviceList = _.cloneDeep(this.props.serviceList);
        serviceList = serviceList.filter(item => item.cims2Svc === 1);
        this.setState({
            ...this.state,
            noticeFilterList: this.props.noticeList.filter((item) => {
                let isEffective = true;
                if (moment().isBefore(moment(item.efftDate),'day') || (item.expyDate && moment().isAfter(moment(item.expyDate),'day'))) {
                    isEffective = false;
                }
                return item.isEnable == 1 && isEffective && item.isDel !== 1 &&
                (serviceList.filter(ele => ele.serviceCd === item.svcCd).length > 0 || item.svcCd === undefined);
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


    handleChange = (value, name) => {
        this.setState({ [name]: value });
    }

    handleTableRowClick = (e, row, index) => {
        if (this.state.selectIndex.indexOf(index) > -1) {
            this.setState({ selectIndex: [] });
        } else {
            this.setState({ selectIndex: [index] });
        }
    }

    render() {

        return (
            <Grid container style={{ maxWidth: 1200, marginTop: 6 }}>
                <MarqueeScrollTable
                    id="noticeBoard_notice_scrollTable"
                    columns={this.state.columns}
                    store={this.state.noticeFilterList}
                    selectIndex={this.state.selectIndex}
                    handleRowClick={this.handleTableRowClick}
                />
            </Grid>
        );
    }
}

function mapStateToProps(state) {
    return {
        noticeList: state.noticeBoard.noticesList,
        serviceCd: state.login.service.serviceCd,
        serviceList: state.common.serviceList
    };
}

const dispatchProps = {
    downloadFile
};

export default connect(mapStateToProps, dispatchProps)(withStyles(style)(PreviewNotice));
