import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import ApptSlipRemarksViewer from './ApptSlipRemarksViewer';
import { listApptSlipRemarks, getEncounterTypeListBySite, resetAll } from '../../../store/actions/administration/apptSlipRemarks/apptSlipRemarksAction';
import { isServiceAdminSetting, isSystemAdminSetting } from '../../../utilities/userUtilities';
import { getApptSlipRemarksGroupList } from '../../../utilities/apptSlipRemarksUtilities';
import accessRightEnum from '../../../enums/accessRightEnum';

const styles = () => ({
    root: {
        height: '100%'
    }
});
class ApptSlipRemarks extends React.Component {

    state = {
        encounterTypeTotalList: [],
        apptSlipRemarksList: []
    };

    componentDidMount() {
        this.refreshEncountertAndApptSlipList();
    }

    shouldComponentUpdate(nextP) {
        if (nextP.tabsActiveKey !== this.props.tabsActiveKey && nextP.tabsActiveKey === accessRightEnum.apptSlipRemarks) {
            this.refreshEncountertAndApptSlipList();
        }
        return true;
    }

    componentWillUnmount() {
        this.props.resetAll();
    }

    refreshEncountertAndApptSlipList = () => {
        const { serviceCd, siteId } = this.props;
        let encounterListParams = {};
        if (isSystemAdminSetting() || isServiceAdminSetting()) {
            encounterListParams = {
                svcCd: serviceCd,
                withRooms: 'Y'
            };
        } else {
            encounterListParams = {
                svcCd: serviceCd,
                siteId: siteId,
                withRooms: 'Y'
            };
        }

        this.props.getEncounterTypeListBySite(encounterListParams, (encounterTypeList) => {
            this.setState({
                encounterTypeTotalList: encounterTypeList
            }, () => {
                let params = {
                    svcCd: serviceCd
                };
                this.getApptSlipRemarksList(params);
            });
        });
    }

    getApptSlipRemarksList = (params) => {
        const { clinicList } = this.props;
        const { encounterTypeTotalList } = this.state;
        this.props.listApptSlipRemarks(params, (apptSlipRemarksList) => {
            this.setState({
                apptSlipRemarksList: getApptSlipRemarksGroupList(apptSlipRemarksList, clinicList, encounterTypeTotalList)
            });
        });
    }

    render() {
        const { classes } = this.props;
        const { encounterTypeTotalList, apptSlipRemarksList } = this.state;
        return (
            <Grid className={classes.root}>
                <ApptSlipRemarksViewer
                    encounterTypeTotalList={encounterTypeTotalList}
                    apptSlipRemarksList={apptSlipRemarksList}
                    getApptSlipRemarksList={this.refreshEncountertAndApptSlipList}
                />
            </Grid>
        );
    }
}

const mapState = (state) => {
    return {
        clinicList: state.common.clinicList,
        serviceCd: state.login.service.serviceCd,
        siteId: state.login.clinic.siteId,
        tabsActiveKey: state.mainFrame.tabsActiveKey
    };
};

const mapDispatch = {
    listApptSlipRemarks,
    getEncounterTypeListBySite,
    resetAll
};

export default connect(mapState, mapDispatch)(withStyles(styles)(ApptSlipRemarks));