import { Box, CardHeader, Divider } from '@material-ui/core';
import {Avatar,Icon,IconButton, ListItemIcon, ListItemText ,Menu, MenuItem } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { AddToQueue, AssignmentInd, FontDownload, MoreVert, NoteAdd, Visibility, VisibilityOff } from '@material-ui/icons';
import 'font-awesome/css/font-awesome.css';
import moment from 'moment';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Enum from '../../../../enums/enum';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import accessRightEnum from '../../../../enums/accessRightEnum';
import { REDIRECT_ACTION_TYPE } from '../../../../enums/dts/clinicalContent/currentEncounterEnum';
import { closeCommonCircular, openCommonCircular } from '../../../../store/actions/common/commonAction';
import { getBookingAlert } from '../../../../store/actions/dts/appointment/bookingAction';
import { getLatestEncounter, getPatientAppointment, resetAll, setRedirect, updatePractitioner,getProblemAndQualifier,getProceduresAndQualifiers,getCarryForwardData
        ,getLoginUserInfo } from '../../../../store/actions/dts/clinicalContent/encounterAction';
import { skipTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import DtsDirectEncounterDialog from './DtsDirectEncounterDialog';

//import Popup from 'react-popup';

const avatarStyle =
{
  'GD': 'green',
  'Endo': 'pink',
  'OMS': 'yellow',
  'Ortho': 'purple'
};


const styles = (theme) => ({
  encounterContent: {
    maxHeight: 'calc(100vh - 340px)',
    overflowY: 'auto',
    overflowX: 'hidden'
  },

  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest
    })
  },

  heading: {
    fontSize: theme.typography.body,
    fontWeight: theme.typography.fontWeightRegular
  },
  readOnly: {
    backgroundColor: '#404040'
  },
  normal: {
    backgroundColor: 'white'
  },
  smallIcon: {
    height: '1.1rem',
    width: '1.1rem'
  },
  mediumIcon: {
    height: '1.3 rem',
    width: '1.3rem'
  },
  warningLabel: {
    color: 'blue',
    textAlign: 'left'
  },
  icon: {
    margin: theme.spacing(2)
  }

});

class DtsEncounterBanner extends Component {

  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      open: false,
      openProbProc: false,
      openTxPlan: false,
      openNote: false,
      anchorEl: null,
      sdOpen: false,
      hidden: false,
      // cNoteAbbreviation: false,
      history: true,
      problems: true,
      txPlans: true,
      medications: true,
      assessment: true,
      documents: true,
      bookingAlert: [],
      specialties: null,
      avatarColor: null,
      specialtiesCd: null,
      //practitionerName: (typeof this.props.latestEncounter != 'undefined') ? this.props.currentEncounter.cimsUserPract: null,
      openConfirmDialog: false,
      openDirectEncounterDialog: false,
      initFlag: true,
      showDialog: false
    };
  }

  componentDidMount() {
    const { currentEncounter } = this.props;

    this.props.getLatestEncounter({patientKey: this.props.patientInfo.patientKey});

    if (typeof currentEncounter != 'undefined' && currentEncounter && currentEncounter.encntrId != null) {

      this.loadData();
    }
  }

  componentDidUpdate(prevProps) {

    const { currentEncounter} = this.props;

    if (typeof currentEncounter != 'undefined' && currentEncounter && prevProps.currentEncounter != currentEncounter ) {

      //this.refreshEncounter;

      this.loadData();
    }
  }
  componentWillUnmount() {
    this.props.resetAll();
  }

  toggleAll = () => {
    this.handleMenuClose();
    this.props.toggleAll();
  };

  openDirectEncounterDialogBox = () => {
    const { currentEncounter } = this.props;
    this.handleMenuClose();
    setRedirect({ action: REDIRECT_ACTION_TYPE.DIRECT_ENCOUNTER });
    this.setState({ openDirectEncounterDialog: true });

    // show warning message

    if (currentEncounter.encntrSts == 'C')
      this.props.openCommonMessage({
        msgCode: '115549',
        showSnackbar: true,
        variant: 'warning'
      });
  };

  openProcedureSetTab = () => {
    this.handleMenuClose();
    this.props.skipTab(
      accessRightEnum.ProcedureSet,
      {},
      true
    );
  };

  openPrecriptionTab = () => {
    this.handleMenuClose();
    this.props.openPrecriptionTab();
  };

  handleNewAdditionalNote = () => {
    this.handleMenuClose();
    this.props.handleNewAdditionalNote();
  };


  closeDirectEncounterDialogBox = () => {
    this.setState({ openDirectEncounterDialog: false });
  }

  getProblemProcedures = () =>{
     const { allSpecialties, currentEncounter } = this.props;
        this.props.getProceduresAndQualifiers(
               {
                 encntrId: currentEncounter.encntrId,
                 patientKey: currentEncounter.patientKey
                 //patientKey: this.props.patientInfo.patientKey
               });
        this.props.getProblemAndQualifier(
                    {
                      encntrId: currentEncounter.encntrId,
                      patientKey: currentEncounter.patientKey
                      //patientKey: this.props.patientInfo.patientKey
        });

  }

  refreshEncounter =() =>{
    // console.log("===> refreshEncounter");
     this.props.getLatestEncounter({
      patientKey: this.props.latestEncounter.patientKey
    }, [this.loadData]
    );
  }

  loadData = () => {


    const { allSpecialties, currentEncounter } = this.props;

    console.log('Hin 1 loadData');

                this.props.getLoginUserInfo({
                  loginNames: currentEncounter.cimsUserPract,
                  svcCds: currentEncounter.svcCd
                });


             this.props.getBookingAlert(
              {
                patientKey: this.props.patientInfo.patientKey
              },
              this.setBookingAlert
            );



          this.props.getCarryForwardData(
                 {
                     encntrId: currentEncounter.encntrId,
                     patientKey: currentEncounter.patientKey,
                     sdt: currentEncounter.sdt
                 },((encntrId, patientKey) => {
                      return () => {
                          this.props.getProblemAndQualifier({encntrId, patientKey});
                      };
                  })(currentEncounter.encntrId, currentEncounter.patientKey));


              this.props.getPatientAppointment(
                {
                  patientKey: this.props.patientInfo.patientKey,
                  appointmentDateFrom: dtsUtilities.formatDateParameter(moment().startOf('day')),
                  appointmentDateTo: dtsUtilities.formatDateParameter(moment().endOf('day'))
                }
              );



             this.props.getProceduresAndQualifiers(
               {
                 encntrId: currentEncounter.encntrId,
                 patientKey: currentEncounter.patientKey
                 //patientKey: this.props.patientInfo.patientKey
               });

    let specialtiesCd = allSpecialties.find(specialty => specialty.sspecId == currentEncounter.sspecId).sspecCd;
    console.log('specialtiesCd: ' + JSON.stringify(specialtiesCd));
    //let encounterType = this.props.encounterTypeList.find(item => item.encntrTypeId === this.props.latestEncounter.encntrTypeId).description;
    this.setState({ specialtiesCd: specialtiesCd });

  }

  checkIfMultipleAppointmentExisted = () => {

    const { currentEncounter, patientAppointmentList } = this.props;

    if (patientAppointmentList.length > 1) {

      let isWarningMessageShow = false;

      //let latestEncounterStartTime = latestEncounter.sdt;

      let latestEncounterStartTime = moment(currentEncounter.sdt).format('YYYY-MM-DD HH:mm:ss');

      if (moment().isSame(currentEncounter.sdt, 'day')) {

        for (let i = 0; i < patientAppointmentList.length; i++) {

          let patientAppointmentTime = moment(patientAppointmentList[i].appointmentDetlBaseVoList[0].mapAppointmentTimeSlotVosList[0].startDtm).format('YYYY-MM-DD HH:mm:ss');

          if (moment(latestEncounterStartTime).isBefore(moment(patientAppointmentTime))) {

            isWarningMessageShow = true;
          }

        }

        if (isWarningMessageShow) {

          return (
            <Box p={0} >
              <Typography
                  paragraph
                  variant="h5"
                  component="p"
                  p={1}
                  color="blue"
              >
                <b style={{ color: 'blue' }} variant="h5">Note: More than one appointment found for this patient today</b>
              </Typography>
            </Box>
          );
        }
      }
    }
  }


  setBookingAlert = (bookingAlert) => {
    if (bookingAlert.length) {
      this.setState(() => ({ bookingAlert: bookingAlert }));
    }
  }

  updatePractitioner = () => {
    const { currentEncounter,loginInfo } = this.props;



    this.handleMenuClose();

    this.props.updatePractitioner({
      patientKey: this.props.patientInfo.patientKey,
      encntrId: currentEncounter.encntrId,
      //cimsUserPract: this.getPractionerName(),
      cimsUserPract: loginInfo.loginName,
      version: moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z',
      updateDtm: moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z'
    },[this.loadData,
      ((patientKey) => {
                      return () => {
                          this.props.getLatestEncounter({patientKey: patientKey});
                      };
                  })(this.props.patientInfo.patientKey)]);

  }

  handleSdOpen = () => {
    this.setState({ sdOpen: true });
  };

  handleSdClose = () => {
    this.setState({ sdOpen: false });
  };

  handleClick = (event) => {
    this.setState({ anchorEl: event.currentTarget });

  };

  handleMenuClose = () => {
    this.setState({ anchorEl: null });
  };

  getCurrentEncounterTitle = () => {
    const { currentEncounter,userLoginInfo } = this.props;

    let title;

    // console.log("getCurrentEncounterTitle ==> this.props.latestEncounter.siteId ==>" + this.props.latestEncounter.siteId);
    // console.log("getCurrentEncounterTitle ==> this.props.clinicList ==> " + JSON.stringify(this.props.clinicList));

    let encounterType = this.props.encounterTypes.find(item => item.encntrTypeId === currentEncounter.encntrTypeId).encntrTypeDesc;
    let rmCd = this.props.roomList.find(item => item.rmId === currentEncounter.rmId).rmCd;
    let clinicCd = this.props.clinicList.find(item => item.siteId === currentEncounter.siteId).siteCd;
    let cimsUserPract = currentEncounter.cimsUserPract;
    let practitionerSalutation;
    let practitionerengGivName;
    let practitionerengSurname;
    let practitionerFullName;
    if (userLoginInfo && userLoginInfo.length > 0) {

      console.log('Hin: loginUserRoleList[0] ', userLoginInfo[0]);

      practitionerSalutation = userLoginInfo[0].salutation;
      practitionerengGivName = userLoginInfo[0].engGivName;
      practitionerengSurname = userLoginInfo[0].engSurname;

      practitionerFullName = practitionerSalutation + ' ' + practitionerengGivName + ' ' + practitionerengSurname;

      title = encounterType + ' / ' + clinicCd + '(' + rmCd + ') / ' + practitionerFullName;
    }else{
      title = encounterType + ' / ' + clinicCd + '(' + rmCd + ')  ';
    }
    // if (typeof practitionerName == 'undefined' || practitionerName == '') {
    //   title = encounterType + ' / ' + clinicCd + '(' + rmCd + ')  ';
    // } else {
    //   title = encounterType + ' / ' + clinicCd + '(' + rmCd + ') / ' + practitionerName;
    // }



    return title;

  }

  getPractionerName = () => {

    let salutation = this.props.loginInfo.userDto.salutation;
    let engGivName = this.props.loginInfo.userDto.engGivName;
    let engSurName = this.props.loginInfo.userDto.engSurname;
    let patitionerName;

    if (typeof salutation !== 'undefined') {
      patitionerName = salutation + ' ' + engGivName + ' ' + engSurName;
    } else {
      patitionerName = engGivName + ' ' + engSurName;
    }


    return patitionerName;
  }

  getEncounterDate = () => {

    const { currentEncounter } = this.props;

    let encounterDate = currentEncounter.sdt;

    encounterDate = moment(encounterDate).format(Enum.DATE_FORMAT_EDMY_VALUE);

    return encounterDate;

  }

  getBookingAlertIcon = (bookingAlertCode) => {
    switch (bookingAlertCode) {
      case 'BLEEDING_TENDENCY':
        return (<Icon className="fa fa-tint" style={{ color: 'red', fontSize: 20, marginLeft: 5 }} />);
      case 'REQUIRE_ANTIBIOTIC_COVER':
        return (<Icon className="fa fa-flask" style={{ color: 'red', fontSize: 20, marginLeft: 5 }} />);
      case 'MEDICAL_ALERT':
        return (<Icon className="fa fa-plus-circle" style={{ color: 'red', fontSize: 20, marginLeft: 5 }} />);
      default:
        return (null);
    }
  }

  generateMenu = () => {
    const { currentEncounter,showAll } = this.props;
    let toolMenu = [
      {
        fn: this.toggleAll,
        icon: showAll ? <VisibilityOff /> : <Visibility />,
        label: showAll ? 'Hide All' : 'Show All',
        isSkip: false
      },
      {
        fn: this.updatePractitioner,
        icon: <AssignmentInd  />,
        label: 'Update Practitioner',
        //isSkip: currentEncounter.cimsUserPract == this.getPractionerName()
        isSkip: false
      },
      {
        fn: this.openDirectEncounterDialogBox,
        icon: <AddToQueue />,
        label: 'Create Direct Encounter',
        isSkip: false
      },
      {
        fn: this.openProcedureSetTab,
        icon: <Icon className="fa fa-object-group" style={{height: 25, width: 30}} />,
        label: 'Procedure Set',
        isSkip: false
      },
      {
        isDivider: true,
        isSkip: false
      },
      {
        fn: this.openPrecriptionTab,
        icon: <Icon className="fa fa-medkit" style={{height: 25, width: 30}} />,
        label: 'Add Precription',
        isSkip: false
      },
      {
        fn: this.handleNewAdditionalNote,
        icon: <NoteAdd />,
        label: 'New Additional Note',
        isSkip: false
      }
    ];

    return (
      <Menu
          anchorEl={this.state.anchorEl}
          keepMounted
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleMenuClose}
          transformOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        {toolMenu.map((item, index) => {
          let { isSkip, isDivider } = item;
          return (
            isDivider || isSkip ? (isDivider ? <Divider component="li" variant="inset" key={index} /> : null)
            :
            <MenuItem key={index} onClick={item.fn}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
            </MenuItem>
          );
        })}

      </Menu>
    );
  }

  render() {
    const { classes, currentEncounter } = this.props;
    const { specialtiesCd } = this.state;


    return (

      <ValidatorForm ref="form" onSubmit={this.handleOnSubmit} onError={this.handleSubmitError}>
        {currentEncounter && currentEncounter.encntrId != null &&
          <CardHeader

              classes={{ root: (currentEncounter.readOnly == true ? classes.readOnly : classes.normal) }}
              avatar={specialtiesCd &&
              <Avatar aria-label="recipe" style={{ backgroundColor: currentEncounter && avatarStyle[specialtiesCd] }}>
                {specialtiesCd}
              </Avatar>
            }
              action={
              <Box variant="dense">
                <IconButton aria-label="small" onClick={() => console.log('toggleSmallTheme')} >
                  <FontDownload className={classes.smallIcon} />
                </IconButton>
                <IconButton aria-label="medium" onClick={() => console.log('toggleMediumTheme')} >
                  <FontDownload className={classes.mediumIcon} />
                </IconButton>
                <IconButton aria-label="large" onClick={() => console.log('toogleLargeTheme')} >
                  {/* <FontDownload  className={classes.largeIcon}/> */}
                  <FontDownload />
                </IconButton>
                <IconButton aria-label="settings" onClick={this.handleClick}>
                  <MoreVert />
                </IconButton>
              </Box>
            }

              title={currentEncounter && this.getCurrentEncounterTitle()}
              subheader={
              <span>
                {this.getEncounterDate()}


                {this.state.bookingAlert.map((value, index) => {
                  return value.alertEnabled ?
                    (<Tooltip
                        title={
                        <Typography className={classes.body} align="left">{value.alertContent}</Typography>
                      }
                        key={index}
                        placement={'right'}
                    >
                      {this.getBookingAlertIcon(value.alertCode)}
                    </Tooltip>
                    ) : null;
                })}
              </span>
            }

          />
        }
        {this.generateMenu()}

        <section id="multiAppointmentWarningRef">
          {this.checkIfMultipleAppointmentExisted()}
        </section>

        {this.state.openDirectEncounterDialog && (
          <DtsDirectEncounterDialog id={'dtsDirectEncounterDialog'} openConfirmDialog={this.state.openDirectEncounterDialog} closeConfirmDialog={this.closeDirectEncounterDialogBox} />
        )}

      </ValidatorForm>
    );
  }
}



const mapStateToProps = (state) => {
  // console.log(state.dtsAppointmentAttendance.patientKey);

  return {
    allSpecialties: state.dtsPreloadData.allSpecialties,
    patientInfo: state.patient.patientInfo,
    appointmentInfo: state.patient.appointmentInfo,
    loginInfo: state.login.loginInfo,
    //latestEncounter: state.clinicalContentEncounter.latestEncounter,
    patientAppointmentList: state.clinicalContentEncounter.patientAppointmentList,
    roomList: state.common.rooms,
    encounterTypes: state.common.encounterTypes,
    clinicList: state.common.clinicList,
    loginUserRoleList: state.common.loginUserRoleList,
    userLoginInfo: state.clinicalContentEncounter.userLoginInfo

  };
};

const mapDispatchToProps = {
  setRedirect,
  skipTab,
  openCommonCircular,
  closeCommonCircular,
  getBookingAlert,
  getLatestEncounter,
  getCarryForwardData,
  updatePractitioner,
  openCommonMessage,
  resetAll,
  getPatientAppointment,
  getProblemAndQualifier,
  getProceduresAndQualifiers,
  getLoginUserInfo
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsEncounterBanner));
