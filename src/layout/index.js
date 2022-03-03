import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import MenuBar from './component/menuBar';
import { Grid, withStyles } from '@material-ui/core';
import CIMSSnackbar from '../components/Dialog/CIMSSnackbar';
import CIMSMultiTabs from '../components/Tabs/CIMSMultiTabs';
import CIMSMultiTab from '../components/Tabs/CIMSMultiTab';
import accessRightEnum from '../enums/accessRightEnum';
import { cleanCommonMessageDetail } from '../store/actions/message/messageAction';
import { updateState as updatePatientState } from '../store/actions/patient/patientAction';
import { addTabs, deleteTabs, deleteSubTabs, changeTabsActive, cleanTabParams, skipTab, updateTabs } from '../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage, closeCommonMessage } from '../store/actions/message/messageAction';
import { closeWarnSnackbar, openCommonCircular, closeCommonCircular } from '../store/actions/common/commonAction';
import { updateisTemporaryLogin, logout } from '../store/actions/login/loginAction';
import * as CommonUtilities from '../utilities/commonUtilities';
import Loadable from 'react-loadable';
import Loading from './component/loading';
import IndexPatient from './indexPatient';
import NotFound from './component/notfound';
import CommonCircularDialog from '../views/compontent/commonProgress/commonCircularDialog';
import CaseNoDialog from '../views/compontent/caseNoDialog';
import CaseNoSelectDialog from '../views/compontent/caseNoSelectDialog';
import Enum, { EHS_SHARED_COMPONENT_SPA_CONFIG, SERVICE_CODE } from '../enums/enum';
import MaskContainer from './component/maskContainer';
import NotLiveRoute from 'react-live-route';
import ErrorBoundary from 'components/JErrorBoundary';
import MwecsDialogContainer from 'components/ECS/Mwecs/MwecsDialogContainer';
import EcsDialogContainer from 'components/ECS/Ecs/EcsDialogContainer';
import { checkEcs, checkMwecs, closeMwecsDialog, closeEcsDialog } from '../store/actions/ECS/ecsAction';
import moment from 'moment';
import CIMSIdleAlertDialog from '../components/Dialog/CIMSIdleAlertDialog';
import * as singleSpa from 'single-spa';
import * as spaHelper from '../spaHelper';
import { globalEventDistributor } from '../globalEventDistributor';
import doCloseFuncSrc from '../constants/doCloseFuncSrc';
import DtsAttendanceAlert from '../views/dts/appointment/components/DtsAttendanceAlert';
import DtsAppointmentLogDialog from '../views/dts/appointment/components/DtsAppointmentLogDialog';
import palette from '../theme/palette';
import DtsDialogsContainer from '../views/dts/components/DtsDialogsContainer';
//import AnServiceIDDialog from '../views/compontent/anServiceIDDialog';
import ClinicalDocImportDialog from '../views/compontent/ClinicalDocImportDialog';
import CaseNoAliasGenDialog from '../views/compontent/caseNoAliasGenDialog';
import {genPMICaseNoAction} from '../utilities/caseNoUtilities';
import CommonClinicalDocument from '../views/compontent/commonClinicalDocument/commonClinicalDocument';
import PUCDialog from '../views/patientSpecificFunction/component/pucDialog';

const LiveRoute = withRouter(NotLiveRoute);

const styles = theme => ({
  root: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexFlow: 'column',
    overflow: 'hidden'
  },
  main_body: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    overflowY: 'auto'
  },
  multiTabs: {
    width: '100%'
  },
  flexContainer: {
    //Add min-height:0 to fix no scroll bar issue.
    //By default, it will use min-height:auto which is NOT for a scroll container.
    //For a scroll container, min-height:0 should be used.
    //References:
    //https://stackoverflow.com/questions/36247140/why-dont-flex-items-shrink-past-content-size
    //https://www.w3.org/TR/css-flexbox-1/#min-size-auto  (Please see section "4.5. Automatic Minimum Size of Flex Items")
    minHeight: 0,
    flexFlow: 'column nowrap',
    flexBasis: '100%',
    WebkitFlexBasis: '100%'
  },
  flexContainerItem: {
    flexBasis: '100%',
    WebkitFlexBasis: '100%',
    justifyContent: 'center',
    overflowX: 'hidden',
    overflowY: 'auto',
    height: 0
  },
  backgroundColor: theme.palette.cimsBackgroundColor
});

const loadCss = (path) => {
  if (!path || path.length === 0) {
    return;
  }
  let body = document.getElementsByTagName('body')[0];
  let link = document.createElement('link');
  link.href = path;
  link.rel = 'stylesheet';
  link.type = 'text/css';
  body.appendChild(link);
};

const setPageTitle = () => {
  const loginInfo = JSON.parse(window.sessionStorage.getItem('loginInfo'));
  const clientIp = JSON.parse(window.sessionStorage.getItem('clientIp'));
  const clinic = JSON.parse(window.sessionStorage.getItem('clinic'));
  let loginName = loginInfo && loginInfo.loginName;
  let serviceCd = clinic && clinic.clinicCd;
  let ip = clientIp && `IP: ${clientIp.ipAddr}`;
  let loginTime = loginInfo && `Login Time: ${loginInfo.loginTime}`;
  let titleArr = [loginName, serviceCd, ip, loginTime];
  document.title = titleArr.join(' | ');
};

const patientCall = CommonUtilities.getPatientCall();
class IndexWarp extends Component {
  constructor(props) {
    super(props);
    this.componentList = [];
    const { accessRights } = this.props;
    if (accessRights) {
      accessRights
        .filter(item =>
          (item.type === Enum.ACCESS_RIGHT_TYPE.FUNCTION || item.type === Enum.ACCESS_RIGHT_TYPE.CODE_ACCESS)
          && item.isPatRequired !== 'Y')
        .forEach(right => {
          this.componentList.push({
            name: right.name,
            path: right.path,
            componentParams: right.componentParams,
            component: ErrorBoundary(Loadable({
              loader: () => import(`../views${right.path}`),
              loading: Loading
            }))
          });
        });
    }
    this.state = {
      // spaLoaded: false,
      isWithinExpDates: false,
      patientUnderCareDialog: {
        open: false
      }
    };

    //set website page title
    setPageTitle();
  }

  componentDidMount() {
    if (this.props.isLoginSuccess) {
      const init = async () => {
        let spaList = this.props.spaList;;
        if (this.props.serviceCd === SERVICE_CODE.EHS) {
          spaList.push(EHS_SHARED_COMPONENT_SPA_CONFIG);
        }
        if (spaList) {
          // if (spaList.length === 0) {
          //   this.state.spaLoaded = true;
          // }
          const callback = () => {
            if (singleSpa.getAppNames().length === spaList.length) {
              // this.setState({
              //   spaLoaded: true
              // });
              return true;
            }
            return false;
          };
          const service = JSON.parse(window.sessionStorage.getItem('service'));
          const svcCd = service && service.serviceCd;
          const loadApps = {};
          for (let i = 0; i < spaList.length; i++) {
            const spaId = CommonUtilities.combineSpaPrefixAndPath(spaList[i].spaPrefix, spaList[i].spaStorePath);
            if (!singleSpa.getAppStatus(spaId) && !loadApps[spaId]) {
              loadApps[spaId] = true;
              spaHelper.loadApp(
                spaList[i].accessRightCd
                , spaId
                //Set dummy=1 as a parameter for spa-immu-portal temporarily
                //, spaList[i].spaEntryPath + `?svcCd=${encodeURIComponent(svcCd)}`
                //, spaList[i].spaStorePath + `?svcCd=${encodeURIComponent(svcCd)}`
                , spaList[i].spaEntryPath + `?svcCd=${encodeURIComponent(svcCd)}` + `${spaId.startsWith('spa-immu-portal')?'&dummy=1':''}`
                , spaList[i].spaStorePath + `?svcCd=${encodeURIComponent(svcCd)}` + `${spaId.startsWith('spa-immu-portal')?'&dummy=1':''}`
                , globalEventDistributor
                , callback
              );
              //loadCss(spaList[i].spaCssPath + `?svcCd=${encodeURIComponent(svcCd)}`);
              loadCss(spaList[i].spaCssPath + `?svcCd=${encodeURIComponent(svcCd)}` + `${spaId.startsWith('spa-immu-portal')?'&dummy=1':''}`);

              if (spaId.startsWith('spa-immu-portal')){
                console.log('Please remove this from the code later! Hardcoded dummy=1 as a parameter for ' + spaId + ' in order to avoid getting the js and css files from the browser cache.');
              }

            } else {
              if (callback()) {
                break;
              }
            }
          }
        }
      };

      init().then(() => {
        singleSpa.addErrorHandler((err) => {
          if (err.toString().indexOf('404') || err.toString().indexOf('502')) {
            // if (!err.appOrParcelName || err.appOrParcelName && singleSpa.getAppStatus(err.appOrParcelName) === singleSpa.LOADING_SOURCE_CODE) {
            // show message to user for which spa not work
            // if(err.appOrParcelName)SystemJS.delete(SystemJS.resolve(err.appOrParcelName));
            // if (singleSpa.getAppStatus(err.appOrParcelName) === singleSpa.LOAD_ERROR) {
            //     SystemJS.delete(SystemJS.resolve(err.appOrParcelName));
            // }
            this.props.openCommonMessage({
              msgCode: '115011',
              showSnackbar: true,
              variant: 'error',
              params: [
                {
                  name: 'MSG',
                  value: 'Some of the SPA files were not loaded successfully. Please contact system administrator for more details.'
                }
              ]
            });
          }
          else {
            this.props.closeCommonCircular();
            this.props.openCommonMessage({
              msgCode: '115005',
              showSnackbar: true,
              variant: 'error'
            });
          }
        });
      });

      let where = { serviceCd: this.props.serviceCd, clinicCd: this.props.clinicCd };
      let passwordRemindDayObj = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.PASSWORD_REMIND_DAY, this.props.clinicConfig, where);
      let passwordEffectiveDayObj = CommonUtilities.getPriorityConfig(Enum.CLINIC_CONFIGNAME.PASSWORD_EFFECTIVE_DAY, this.props.clinicConfig, where);
      let expiryDates = moment(this.props.pwdLastDate, Enum.DATE_FORMAT_EYMD_VALUE).add(passwordEffectiveDayObj.configValue, 'day');
      let expiryDays = moment(expiryDates.format(Enum.DATE_FORMAT_EYMD_VALUE), Enum.DATE_FORMAT_EYMD_VALUE).diff(moment(moment().format(Enum.DATE_FORMAT_EYMD_VALUE), Enum.DATE_FORMAT_EYMD_VALUE), 'day');
      let expiryNum = expiryDays - passwordRemindDayObj.configValue;
      if (expiryDays <= 0) {
        // expiry
        this.props.addTabs(this.props.accessRights.find(item => item.name === accessRightEnum.changePersonalPassword));
        this.props.updateisTemporaryLogin('E');// update expiry status after login to contorl display in changepassword
      } else if (expiryNum < 0) {
        //within password remind days
        this.setState({
          isWithinExpDates: true
        });
        this.props.openCommonMessage({
          msgCode: '110397',
          params: [
            { name: 'REMIND_DAY', value: expiryDays },
            { name: 'EXPIRY_DATES', value: expiryDates.format(Enum.DATE_FORMAT_EDMY_VALUE) }
          ],
          btnActions: {
            btn1Click: () => {
              this.props.skipTab(accessRightEnum.changePersonalPassword, { isPwdexpired: true });
              this.setState({
                isWithinExpDates: false
              });
            },
            btn2Click: () => {
              this.setState({
                isWithinExpDates: false
              });
            }
          }
        });
        this.props.addTabs({ name: accessRightEnum.patientSpec, label: `${patientCall}-specific Function(s)`, disableClose: true, path: 'indexPatient', deep: 1, isPatRequired: 'N' });
        this.props.history.push(`/index/${accessRightEnum.patientSpec}`);
      } else if (this.props.isTemporaryLogin || this.props.isFirstTimeLogin || this.props.isExpiryLogin || this.props.isResetPassword) {
        // forgot passowrd or isFirstTimeLogin
        this.props.addTabs(this.props.accessRights.find(item => item.name === accessRightEnum.changePersonalPassword));
      } else {
        this.props.addTabs({ name: accessRightEnum.patientSpec, label: `${patientCall}-specific Function(s)`, disableClose: true, path: 'indexPatient', deep: 1, isPatRequired: 'N' });
        this.props.history.push(`/index/${accessRightEnum.patientSpec}`);
      }
    }
  }

  componentDidUpdate(prevProps) {
    const { tabsActiveKey, subTabsActiveKey, isLoginSuccess } = this.props;
    const prev_tabsActiveKey = prevProps.tabsActiveKey;
    const prev_subTabsActiveKey = prevProps.subTabsActiveKey;

    if (isLoginSuccess) {
      if (prev_tabsActiveKey !== tabsActiveKey || prev_subTabsActiveKey !== subTabsActiveKey) {
        if (prev_tabsActiveKey !== tabsActiveKey) {
          if (tabsActiveKey === accessRightEnum.patientSpec && subTabsActiveKey) {
            const subActiveTab = this.props.subTabs.find(item => item.name === subTabsActiveKey);
            if (subActiveTab) {
              const spaPrefix = subActiveTab.spaPrefix;
              if (spaPrefix) {
                const spaList = this.props.spaList.find((spa) => { return spa.isPatRequired == 'Y' && spa.accessRightCd === subActiveTab.name; });
                if (singleSpa.getAppStatus(CommonUtilities.combineSpaPrefixAndPath(spaList.spaPrefix, spaList.spaStorePath)) !== 'MOUNTED') {
                  this.props.openCommonCircular();
                }
                const milliInterval = 500;
                let countTimer = 0;
                const checkStatusInterval = setInterval(() => {
                  countTimer += 1;
                  if (singleSpa.getAppStatus(CommonUtilities.combineSpaPrefixAndPath(spaList.spaPrefix, spaList.spaStorePath)) === 'MOUNTED' || countTimer * milliInterval === 15000) {
                    this.props.closeCommonCircular();
                    clearInterval(checkStatusInterval);
                  }
                }, milliInterval);

                this.props.history.replace({
                  pathname: `/index/${accessRightEnum.patientSpec}/${spaPrefix}/${subTabsActiveKey}`, //Added by Renny for spa link prefix on 20200324
                  state: subActiveTab.params,
                  tabParams: subActiveTab.componentParams
                });
              } else {
                this.props.history.replace({
                  pathname: `/index/${accessRightEnum.patientSpec}/${subTabsActiveKey}`,
                  state: subActiveTab.params,
                  tabParams: subActiveTab.componentParams
                });
              }

              if (typeof subActiveTab.refreshTabFunc === 'function'
                && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON
                && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_LOGOUT
                && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_ALL_PATIENT_RELATE_TABS
                && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON)
                subActiveTab.refreshTabFunc();

              if (subActiveTab.params) {
                this.props.cleanTabParams(subTabsActiveKey);
              }
            }
          } else {
            const activeTab = this.props.tabs.find(item => item.name === tabsActiveKey);
            if (activeTab) {
              const spaPrefix = activeTab.spaPrefix;
              if (spaPrefix) {
                const spaList = this.props.spaList.find((spa) => { return spa.isPatRequired !== 'Y' && spa.accessRightCd === activeTab.name; });
                if (singleSpa.getAppStatus(CommonUtilities.combineSpaPrefixAndPath(spaList.spaPrefix, spaList.spaStorePath)) !== 'MOUNTED') {
                  this.props.openCommonCircular();
                }
                const milliInterval = 500;
                let countTimer = 0;
                const checkStatusInterval = setInterval(() => {
                  countTimer += 1;
                  if (singleSpa.getAppStatus(CommonUtilities.combineSpaPrefixAndPath(spaList.spaPrefix, spaList.spaStorePath)) === 'MOUNTED' || countTimer * milliInterval === 15000) {
                    this.props.closeCommonCircular();
                    clearInterval(checkStatusInterval);
                  }
                }, milliInterval);

                if (activeTab.name === accessRightEnum.EhsWaitingList) {
                  globalEventDistributor.stores[CommonUtilities.combineSpaPrefixAndPath(spaList.spaPrefix, spaList.spaStorePath)]?.dispatch({
                      type: 'EHS_WAITING_LIST_TAB_ACTIVE'
                  });
                }

                this.props.history.replace({
                  pathname: `/index/${spaPrefix}/${tabsActiveKey}`, //Added by Renny for spa link prefix on 20200324
                  state: activeTab.params,
                  tabParams: activeTab.componentParams
                });

              } else {
                this.props.history.replace({
                  pathname: `/index/${tabsActiveKey}`,
                  state: activeTab.params,
                  tabParams: activeTab.componentParams
                });
              }

              if (typeof activeTab.refreshTabFunc === 'function'
                && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON
                && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_LOGOUT
                && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_ALL_PATIENT_RELATE_TABS
                && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON)
                activeTab.refreshTabFunc();

              if (activeTab.params) {
                this.props.cleanTabParams(tabsActiveKey);
              }
            }
          }
        } else {
          const subActiveTab = this.props.subTabs.find(item => item.name === subTabsActiveKey);
          if (subActiveTab) {
            const spaPrefix = subActiveTab.spaPrefix;
            if (spaPrefix) {
              const spaList = this.props.spaList.find((spa) => { return spa.isPatRequired === 'Y' && spa.accessRightCd === subActiveTab.name; });
              if (singleSpa.getAppStatus(CommonUtilities.combineSpaPrefixAndPath(spaList.spaPrefix, spaList.spaStorePath)) !== 'MOUNTED') {
                this.props.openCommonCircular();
              }
              const milliInterval = 500;
              let countTimer = 0;
              const checkStatusInterval = setInterval(() => {
                countTimer += 1;
                if (singleSpa.getAppStatus(CommonUtilities.combineSpaPrefixAndPath(spaList.spaPrefix, spaList.spaStorePath)) === 'MOUNTED' || countTimer * milliInterval === 15000) {
                  this.props.closeCommonCircular();
                  clearInterval(checkStatusInterval);
                }
              }, milliInterval);

              this.props.history.replace({
                pathname: `/index/${accessRightEnum.patientSpec}/${spaPrefix}/${subTabsActiveKey}`, //Added by Renny for spa link prefix on 20200324
                state: subActiveTab.params,
                tabParams: subActiveTab.componentParams
              });
            } else {
              this.props.history.replace({
                pathname: `/index/${accessRightEnum.patientSpec}/${subTabsActiveKey}`,
                state: subActiveTab.params,
                tabParams: subActiveTab.componentParams
              });
            }

            if (typeof subActiveTab.refreshTabFunc === 'function'
              && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_NEXT_PATIENT_BUTTON
              && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_LOGOUT
              && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_ALL_PATIENT_RELATE_TABS
              && this.props.curCloseTabMethodType !== doCloseFuncSrc.CLOSE_BY_PATIENT_SPEC_TAB_CLOSE_BUTTON)
              subActiveTab.refreshTabFunc();

            if (subActiveTab.params) {
              this.props.cleanTabParams(subTabsActiveKey);
            }

            // // Added by Renny refresh ES when change subTabs
            // if (subTabsActiveKey === accessRightEnum.encounterSummary && prev_tabsActiveKey === accessRightEnum.patientSpec) {
            //   if (typeof subActiveTab.refreshTabFunc === 'function')
            //     subActiveTab.refreshTabFunc();
            // }
            // // End added by Renny refresh ES when change subTabs

            // // Added by Renny refresh moe when switch to moe
            // if (subTabsActiveKey === accessRightEnum.precription) {
            //   if (typeof subActiveTab.refreshTabFunc === 'function')
            //     subActiveTab.refreshTabFunc();
            // }
            // // End added by Renny refresh moe when switch to moe
          } else { //Updated by Renny reset url when empty subtab 20200211 start
            this.props.history.replace({
              pathname: `/index/${accessRightEnum.patientSpec}`
            });
          }  //Updated by Renny reset url when empty subtab when empty subtab 20200211 end
        }
      }
    }
  }

  componentWillUnmount() {
    this.props.cleanCommonMessageDetail();
    this.props.closeWarnSnackbar();
  }

  handleChangeTab = (e, newValue) => {
    if (newValue == accessRightEnum.patientSpec && this.props.isOpenReview) {
      return;
    }
    this.props.changeTabsActive(1, newValue);
  };

  handleDeleteTab = (e, index) => {
    let tabItem = this.props.tabs[index];
    let umnountTabSpa = () => {
      const spaList = this.props.spaList.find((spa) => { return spa.isPatRequired !== 'Y' && spa.accessRightCd === tabItem.name; });
      if (spaList) {
        const spaId = CommonUtilities.combineSpaPrefixAndPath(spaList.spaPrefix, spaList.spaStorePath);
        if (singleSpa.getAppStatus(spaId) === 'MOUNTED') {
          singleSpa.unloadApplication(spaId);
        }
      }
    };
    if (typeof tabItem.doCloseFunc === 'function') {
      let doCloseParams = { ...tabItem.doCloseParams, src: doCloseFuncSrc.CLOSE_BY_MAIN_TAB_CLOSE_BUTTON };
      this.props.updateTabs({ [tabItem.name]: { doCloseParams: doCloseParams } });
      let colseTabsAction = (success) => {
        if (success) {
          this.props.deleteTabs(tabItem.name);
          umnountTabSpa();
        }
      };
      tabItem.doCloseFunc(colseTabsAction, doCloseParams);
    }
    else {
      this.props.deleteTabs(tabItem.name);
      umnountTabSpa();
    }
  };

  getTabLabel = (item) => {
    const { patientInfo, caseNoInfo } = this.props;
    let label = item.label;
    if (item.name === accessRightEnum.patientSpec) {
      label = `${patientCall} List`;
      if (patientInfo && patientInfo.patientKey) {
        const isUseCase = CommonUtilities.isUseCaseNo();
        if (caseNoInfo.caseNo || !isUseCase || (patientInfo.caseList || []).filter(i => i.statusCd === Enum.CASE_STATUS.ACTIVE).length === 0) {
          label = `${patientCall}-specific Function(s)`;
        }
      }
    }
    return label;
  }

  handlePatientUnderCareDialogOpen = () => {
    this.setState({
      ...this.state,
      patientUnderCareDialog: {
        open: !this.state.patientUnderCareDialog.open
      }
    });
  }

  genCaseNoDialog=(genCaseNoAction)=>{
    if(this.props.openCaseNo){
      if(genCaseNoAction===Enum.CASE_NO_GEN_ACTION.GEN_WITH_ALIAS){
        return (
          <CaseNoAliasGenDialog/>
        );
      }else if(genCaseNoAction===Enum.CASE_NO_GEN_ACTION.EXISTING){
        return (
          <CaseNoDialog />
        );
      }else {
        return null;
      }
    }else{
      return null;
    }
  }

  render() {
    const { maskFunctions, classes,patientInfo} = this.props;
    //let isPMICaseNoAliasGen= getIsPMICaseNoAliasGen(this.props.clinicConfig,this.props.serviceCd,this.props.clinicInfo.siteId);
    const genCaseNoAction=genPMICaseNoAction(patientInfo);
    if (!this.props.isLoginSuccess) {
      // this.props.history.replace('/');
      this.props.logout();
      window.location.replace('/');
    }



    return (
      <Grid className={classes.root} style={{ background: this.state.isWithinExpDates ? '#FFF' : palette.cimsBackgroundColor }}>
        {
          this.state.isWithinExpDates ? null :
            <>
              <MenuBar spaLoaded={this.state.spaLoaded} />
              <Grid container className={classes.flexContainer}>
                <Grid item container>
                  <CIMSMultiTabs
                      value={this.props.tabsActiveKey}
                      onChange={this.handleChangeTab}
                      className={classes.multiTabs}
                  >
                    {this.props.tabs.map((item, index) => (
                      <CIMSMultiTab
                          disableClose={(this.props.isTemporaryLogin || this.props.isFirstTimeLogin || this.props.isExpiryLogin || this.props.isResetPassword) || item.disableClose}
                          key={item.name}
                          label={this.getTabLabel(item)}
                          value={item.name}
                          onClear={e => this.handleDeleteTab(e, index)}
                          tabIndex={-1}
                      />
                    ))}
                  </CIMSMultiTabs>
                </Grid>

                <Grid className={classes.leftPanelItme} item>{this.props.serviceCd === 'DTS' ? <DtsAttendanceAlert /> : null}</Grid>
                {this.props.serviceCd === 'DTS' && <DtsDialogsContainer />}
                <Grid item container className={classes.flexContainerItem}>
                  {
                    this.props.tabs.findIndex(item => item.name === accessRightEnum.patientSpec) > -1 ?
                      <MaskContainer
                          loading={maskFunctions.findIndex(item => item === accessRightEnum.patientSpec) > -1}
                          functionCd={accessRightEnum.patientSpec}
                          activeFuncCd={this.props.tabsActiveKey}
                          padding={false}
                      >
                        <LiveRoute
                            alwaysLive
                            path={`/index/${accessRightEnum.patientSpec}`}
                            children={(props) => <IndexPatient {...props} functionCd={accessRightEnum.patientSpec} />}
                        />
                      </MaskContainer> : null
                  }

                  {
                    this.props.tabs.filter(item => item.name !== accessRightEnum.patientSpec).map(item => {
                      const asyncComp = this.componentList.find(i => i.name === item.name);
                      const spaList = this.props.spaList.find((spa) => { return spa.isPatRequired !== 'Y' && spa.accessRightCd === item.name; });
                      if (spaList) {
                        const spaId = CommonUtilities.combineSpaPrefixAndPath(spaList.spaPrefix, spaList.spaEntryPath);
                        return <Grid item container key={spaId} id={spaId} style={{ 'display': this.props.tabsActiveKey === item.name ? 'block' : 'none', 'height': '100%' }}></Grid>;
                      }
                      return asyncComp ?
                        <MaskContainer
                            key={asyncComp.name}
                            loading={maskFunctions.findIndex(i => i === asyncComp.name) > -1}
                            functionCd={asyncComp.name}
                            activeFuncCd={this.props.tabsActiveKey}
                        >
                          <LiveRoute
                              exact
                              alwaysLive
                              key={asyncComp.name}
                              path={`/index/${asyncComp.name}`}
                              children={(props) => <asyncComp.component {...props} functionCd={asyncComp.name} />}
                          />
                        </MaskContainer>
                        :
                        <LiveRoute
                            exact
                            alwaysLive
                            key={item.name}
                            path={`/index/${item.name}`}
                            component={NotFound}
                        />
                        ;
                    })
                  }
                </Grid>
              </Grid>
            </>
        }
        <CommonCircularDialog />
        <MwecsDialogContainer parentPageName={'index'} />
        <EcsDialogContainer parentPageName={'index'} />
        <CIMSIdleAlertDialog handleCloseExpMessage={() => { this.setState({ isWithinExpDates: false }); }} />
        {/* {this.props.openCaseNo ?
        genCaseNoAction===Enum.CASE_NO_GEN_ACTION.GEN_WITH_ALIAS?<CaseNoAliasGenDialog/>:
        <CaseNoDialog /> : null
        } */}
        {
          this.genCaseNoDialog(genCaseNoAction)
        }
        {this.props.openSelectCase === Enum.CASE_SELECTOR_STATUS.OPEN ? <CaseNoSelectDialog /> : null}
        {
          process.env.NODE_ENV === 'development' ?
            <CIMSSnackbar
                open={this.props.warnSnackbarStatus}
                message={this.props.warnSnackbarMessage}
                close={() => { this.props.closeWarnSnackbar(); }}
            /> : null
        }
        {/* {this.props.openAntSvcInfoDialog?<AnServiceIDDialog/>:null} */}
        {this.props.clinicalDocImportDialogOpen?<ClinicalDocImportDialog/>:null}
        <CommonClinicalDocument/>
        {
            (this.props.patientUnderCareDialogOpen && this.props.patientUnderCareVersion === 1) ?
                <PUCDialog /> : null
        }
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    isLoginSuccess: state.login.isLoginSuccess,
    isTemporaryLogin: state.login.isTemporaryLogin === 'Y',
    isFirstTimeLogin: state.login.isTemporaryLogin === 'F',
    isExpiryLogin: state.login.isTemporaryLogin === 'E',
    isResetPassword: state.login.isTemporaryLogin === 'R',
    accessRights: state.login.accessRights,
    //list spa function start
    spaList: state.common.spaList,
    //list spa function end
    curCloseTabMethodType: state.mainFrame.curCloseTabMethodType,
    tabs: state.mainFrame.tabs,
    tabsActiveKey: state.mainFrame.tabsActiveKey,
    subTabs: state.mainFrame.subTabs,
    subTabsActiveKey: state.mainFrame.subTabsActiveKey,
    maskFunctions: state.mainFrame.maskFunctions,
    patientInfo: state.patient.patientInfo,
    caseNoInfo: state.patient.caseNoInfo,
    warnSnackbarStatus: state.common.warnSnackbarStatus,
    warnSnackbarMessage: state.common.warnSnackbarMessage,
    openCaseNo: state.caseNo.openCaseNo,
    openSelectCase: state.caseNo.openSelectCase,
    ecsInputParams: state.ecs.ecsDialogInput,
    mwecsInputParams: state.ecs.mwecsDialogInput,
    ecsOpenDialogKey: state.ecs.openDialog,
    ecsActiveComponentKey: state.ecs.activeComponent,
    ecs: state.ecs,
    loginInfo: state.login.loginInfo,
    clinicInfo: state.login.clinic,
    isOpenReview: state.registration.isOpenReview,
    pwdLastDate: state.login.loginInfo && state.login.loginInfo.pwdLastDate,
    serviceCd: state.login.service.serviceCd,
    clinicCd: state.login.clinic.clinicCd,
    clinicConfig: state.common.clinicConfig,
    //anSvcIdDialogSts:state.anSvcId.anSvcIdDialogSts,
    clinicalDocImportDialogOpen: state.certificateEform.clinicalDocImportDialogOpen,
    openAntSvcInfoDialog:state.patient.openAntSvcInfoDialog,
    patientUnderCareDialogOpen: state.patientSpecFunc.patientUnderCareDialogOpen,
    patientUnderCareVersion: state.patientSpecFunc.patientUnderCareVersion
  };
}

const dispatchProps = {
  changeTabsActive,
  addTabs,
  deleteTabs,
  deleteSubTabs,
  closeWarnSnackbar,
  openCommonMessage,
  cleanTabParams,
  updatePatientState,
  cleanCommonMessageDetail,
  checkMwecs,
  closeMwecsDialog,
  closeEcsDialog,
  checkEcs,
  skipTab,
  updateisTemporaryLogin,
  closeCommonMessage,
  openCommonCircular,
  closeCommonCircular,
  logout,
  updateTabs
};
export default withRouter(connect(mapStateToProps, dispatchProps)(withStyles(styles)(IndexWarp)));
