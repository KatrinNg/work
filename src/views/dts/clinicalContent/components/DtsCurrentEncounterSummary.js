import React, { Component } from 'react';
import { makeStyles, withStyles  } from '@material-ui/core/styles';
import { connect, useDispatch  } from 'react-redux';
import {Card, CardHeader, CardContent, CardActions, CardMedia, Link, Popper} from '@material-ui/core';
import Collapse from '@material-ui/core/Collapse';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { green, pink, yellow,  purple} from '@material-ui/core/colors';
import * as clinicalNoteConstants from '../../../../constants/clinicalNote/clinicalNoteConstants';
import * as DtsClinicalContentConstant from '../../../../constants/dts/clinicalContent/DtsClinicalContentConstant';
import Button from '@material-ui/core/Button';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import {FontDownload,Done,Edit,Info,LibraryAdd,MoreVert,Print,Save,SaveAlt,Visibility,VisibilityOff} from '@material-ui/icons';
import {FormControl, TextField, Select, InputLabel} from '@material-ui/core';
import {Dialog,DialogActions,DialogContent,DialogTitle} from '@material-ui/core';
import Draggable from 'react-draggable';
import SummaryForm from './DtsSummaryForm';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import { Box, Grid, Paper  } from '@material-ui/core';
import * as utils from '../util/utils';
import {List, ListItem, ListItemText, ListItemIcon} from '@material-ui/core';
import {Table, TableBody, TableCell,TableHead, TableRow} from '@material-ui/core';
//import TableContainer from '@material-ui/core/TableContainer';
import * as config from './config';
import ShortCutKey from '../util/ShortCutKey';
import DtsExistingProblemTreatment from './DtsExistingProblemTreatment';
import DtsEncounterListProcedure from './DtsEncounterListProcedure';
import DtsEncounterBanner from './DtsEncounterBanner';
import TreatmentPlan from '../treatmentPlan';
// import { TOGGLE_SMALLTHEME, TOGGLE_MEDIUMTHEME, TOGGLE_LARGETHEME, TOGGLE_DARKTHEME } from '../actions';
import moment from 'moment';
import { useSelector } from 'react-redux';
import FaMehBlank from '../../../../images/clinicalContent/meh-blank-solid.svg';
// import { FormGroup, TextareaAutosize } from '@material-ui/core';
import { FormGroup} from '@material-ui/core';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import { setRedirect } from '../../../../store/actions/dts/clinicalContent/encounterAction';
import { REDIRECT_ACTION_TYPE } from '../../../../enums/dts/clinicalContent/currentEncounterEnum';
import AccessRightEnum from '../../../../enums/accessRightEnum';
import { skipTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import { openCommonCircular, closeCommonCircular } from '../../../../store/actions/common/commonAction';
import { getBookingAlert } from '../../../../store/actions/dts/appointment/bookingAction';
import Icon from '@material-ui/core/Icon';
import 'font-awesome/css/font-awesome.css';
import {
  updateEncounter,
  getLatestEncounter,
  getNoteByEncounter,
  saveClinicalNote,
  resetAll,
  insertEncounter,
  getPatientAppointment,
  getProblemAndQualifier,
  getProceduresAndQualifiers,
  getCarryForwardData,
  getDoseInstruction,
  getLoginUserInfo

} from '../../../../store/actions/dts/clinicalContent/encounterAction';
import DtsClinicalNote from './DtsClinicalNote';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import DtsDirectEncounterDialog from './DtsDirectEncounterDialog';
import DtsAssessment from './DtsAssessment';
import { cloneDeep, trim } from 'lodash';
import * as dtsUtilities from '../../../../utilities/dtsUtilities';
import DtsMedicalHistories from './DtsMedicalHistories';
import DtsAdditionalNote  from './DtsAdditionalNote';
import * as userUtilities from '../../../../utilities/userUtilities';

import {
  getAssessment_saga,
  getAssessmentEncntrByPatientKey_saga
} from '../../../../store/actions/dts/clinicalContent/assessmentAction';

import {
  getDtoClcDtpObj,
  getMonth_s
 } from './assessmentComp/common/AssessmentUnit.js';

const avatarStyle=
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

  expandOpen: {
    transform: 'rotate(180deg)'
  },


  speedDialWrapper: {
    position: 'relative',
    marginTop: theme.spacing(3)
  },
  speedDial: {
    position: 'absolute',
    bottom: theme.spacing(2),
    left: 'calc(100vw/2 - 80px)' //880
  },
  iconButtonLabel: {
    flexDirection: 'column'
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 100
  },form_input: {
        width: 150,
        padding: '5px 0px'
    }
    ,
    iconImage: {
      height: 25,
      width: 30
  },
  readOnly: {
    backgroundColor: 'lightgrey'
  },
  normal:{
    backgroundColor: 'white'
  },
  smallIcon: {
    height: '1.1rem',
    width: '1.1rem'
  },
  mediumIcon: {
    height: '1.3 rem',
    width: '1.3rem'
  }

});

const useStyles1 = makeStyles(theme => ({
  titleContainer: {
      height: 48
  },
  title: {
      fontWeight: 'bold',
      color: theme.palette.primary.main,
      fontFamily: 'Arial,MingLiU,Helvertica,Sans-serif,Arial Unicode MS',
      fontSize: '1rem'
  },
  container: {
      border: `1px solid ${theme.palette.grey[500]}`
  },
  tableContainer: {
      height: 'unset',
      minHeight: 70
      // maxHeight: 100
  },
  tableRowRoot: {
      height: 'unset'
  },
  headerTop: {
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 5
  },
  formControlLabelRoot: {
      marginLeft: 11,
      marginBottom: 0
  },
  formControlLabelLabel: {
      color: theme.palette.primary.main,
      fontWeight: 'bold'
  },
  checkBox: {
      padding: 4
  },
  link: {
    fontWeight: 700,
    fontSize: '1rem'
  }
}));

const BlockInfo = props => {
  const classes = useStyles1();
  const { title, titleFn, id, isShow, toggleFn, children } = props;
  const elements = [];
  if (typeof isShow == 'undefined') {
    elements.push(children);
  }
  else {
    elements.push(
    <Collapse in={isShow} collapsedHeight={50} timeout="auto" unmountOnExit>
      {children}
    </Collapse>);
  }

  return (
    <Grid container>
      <Grid item container justify="space-between" className={classes.titleContainer} alignItems="center">
        {titleFn != null && typeof titleFn === 'function' ? (
          <Grid item className={classes.title} >
            <Link id={`${id}_TitleLink`} component="button" variant="body2" className={classes.link} onClick={titleFn}>
              {title}
            </Link>
          </Grid>) :
          (
            <Grid item className={classes.title}>
              {title}
            </Grid>)
        }
        {toggleFn != null && typeof toggleFn === 'function' ?
          <Grid item>
            <IconButton onClick={toggleFn}>
              {isShow ? (<VisibilityOff />) : (<Visibility />)}
            </IconButton>
          </Grid>
          : <div/>
        }
      </Grid>
      <Grid item xs={12}>
        {elements}
      </Grid>
    </Grid>
  );
};

class DtsCurrentEncounterSummary extends Component {

    constructor(props){
        super(props);

        const {loginInfo={},latestEncounter, allSpecialties, clinicList,common,patientInfo}= props;
        const {service={},clinic={},loginName,userRoleType,userDto}=loginInfo;
        const { patientKey } = patientInfo;

        // console.log("constructor ==> this.props.latestEncounter" + JSON.stringify(this.props.latestEncounter));
        // console.log("constructor ==> this.props.clinicList ==> " + JSON.stringify(this.props.clinicList));

        console.log('constructor ==> userDto ==> ' + JSON.stringify(userDto));
        let userRoleName = userUtilities.getBaseRoleName(userDto);
        // console.log("constructor ==> userRoleName ==> " + userRoleName);
        // console.log("constructor ==> roleTypeCd ==> " + DtsClinicalContentConstant.USER_ROLE_NAME_TYPE[userRoleName]);

        // let cimsDoctorRole = this.props.loginUserRoleList.find(item => item.uamRoleDto && item.uamRoleDto.status === 'A' && item.uamRoleDto.roleName === 'CIMS-DOCTOR');
        // console.log("constructor ==> cimsDoctorRole ==> " + JSON.stringify(cimsDoctorRole));


        this.childHandleTabRefreshFunc = [];
        this.state = {
            readOnly: (this.props.latestEncounter && this.props.latestEncounter.encntrSts === 'C')? true: false,
            currentEncounter: this.props.appointmentInfo.encounterBaseVo,
            isPastEncounter: false,
            open: false,
            openNote: false,
            sdOpen: false,
            hidden: false,
            probProc: 'Problem',
            showAll: true,
            cNoteAbbreviation: false,
            history: true,
            problems: true,
            procedures: true,
            txPlans: true,
            medications: true,
            assessment: true,
            documents: true,
            additionalNotes: true,
            bookingAlert: [],
            specialties: null,
            specialtiesCd: null,
            practionerName: (typeof this.props.latestEncounter != 'undefined') ? this.props.latestEncounter.cimsUserPract: null,
            openConfirmDialog: false,
            openDirectEncounterDialog: false,
            params:{
              // currentEncounterId:latestEncounter.encntrId,
              // currentEncounterClinicCd: clinicCd,
              // currentEncounterServiceCd:latestEncounter.svcCd,
              // currentEncounterDate:latestEncounter.sdt,
              // currentEncounterTypeId: latestEncounter.encntrTypeId,
              userRoleType: userRoleName,  //common
              patientKey
            },
            userLogName:JSON.parse(sessionStorage.getItem('loginInfo')).loginName || null,
            inputAreaValMap: new Map(),
            currentNoteInfo: null,
            currentClinicalNoteInfo: null,
            currentAdditionalNoteInfo: null,
            initFlag:true,
            editClinicalNoteIds: new Set(),
            multipleAppointmentWarningMsg: false,
            showDialog: false,
            doseInstruction: [],
            newNotes: [],
            accessmentTriggerSaveNum: 0,
            assessmentData: { ...getDtoClcDtpObj},
            assessmentLastDate: '',
            bpeNANum: 0
        };
    }

    componentDidMount(prevProps){

      //   this.props.getLatestEncounter({
      //             patientKey: this.props.patientInfo.patientKey
      //  });
      const {latestEncounter, subTabsActiveKey, mainFrame} = this.props;

      if(typeof latestEncounter != 'undefined' && latestEncounter && latestEncounter.encntrId!= null){


        this.loadData();
      }

      // add handleTabRefresh function to current tab
      let subActiveTab = mainFrame.subTabs.find(item => item.name === subTabsActiveKey);
      if(subActiveTab) {
        subActiveTab.refreshTabFunc = this.handleTabRefresh;
      }

      // Derek, add for assessment, start
      this.props.getAssessment_saga({encntrId: this.props.latestEncounter.encntrId});
      // Derek, add for assessment, end
    }

    componentDidUpdate(prevProps){


      // Derek, add for assessment, start
      if(this.props.assessmentData != prevProps.assessmentData && this.props.assessmentData !== '') {
        if (this.props.assessmentData.createDtm !== undefined) {
          let dT = new Date(this.props.assessmentData.createDtm);
          let getMonth = dT.getMonth() < 12 ? dT.getMonth() + 1 : 1;
          let fDt = dT.getDate() + '-' + getMonth_s[getMonth - 1] + '-' + dT.getUTCFullYear();
          this.setState({
            assessmentLastDate: fDt,
            assessmentData: this.props.assessmentData
           });
        } else {
          this.props.getAssessmentEncntrByPatientKey_saga({patientKey: this.props.latestEncounter.patientKey, sRow: 1, eRow: 1});
        }
      }
      if(this.props.assessmentEncntrData != prevProps.assessmentEncntrData) {
        if (this.props.assessmentEncntrData.length > 0) {
          let dT = new Date(this.props.assessmentEncntrData[0].createDtm);
          let getMonth = dT.getMonth() < 12 ? dT.getMonth() + 1 : 1;
          let fDt = dT.getDate() + '-' + getMonth_s[getMonth - 1] + '-' + dT.getUTCFullYear();
          this.setState({ assessmentLastDate: fDt });
        }
      }
      // Derek, add for assessment, end
    }

    componentWillUnmount(){
      this.props.resetAll();
    }

    openAppointmentDialogBox = () => {
        this.setState({openConfirmDialog: true});

    };

    closeAppointmentDialogBox = () => {
        this.setState({openConfirmDialog: false});
    };

    //   openDirectEncounterDialogBox = () => {
    //     console.log('openDialogBox');
    //     this.setState({openDirectEncounterDialog: true});

    // }
    openDirectEncounterDialogBox = () => {
        this.handleMenuClose();
        setRedirect({ action: REDIRECT_ACTION_TYPE.DIRECT_ENCOUNTER });
        this.setState({openDirectEncounterDialog: true});

        // show warning message
        if(this.props.latestEncounter.encntrSts == 'C')
            this.props.openCommonMessage({
                msgCode: '115549',
                showSnackbar: true,
                variant: 'warning'
            });
    };

    closeDirectEncounterDialogBox = () => {
        this.setState({openDirectEncounterDialog: false});
    }



    loadData = () =>  {
      const {allSpecialties,clinicList,latestEncounter, loginService} = this.props;
      const {params} = this.state;

                this.props.getLoginUserInfo({
                  loginNames: latestEncounter.cimsUserPract,
                  svcCds: loginService.svcCd
                });


                this.props.getBookingAlert(
                {
                    //patientKey: this.props.patientInfo.patientKey
                    patientKey: latestEncounter.patientKey
                },
                this.setBookingAlert
              );




                  //Load Carry Forward Data
               this.props.getCarryForwardData(
                 {
                     encntrId: latestEncounter.encntrId,
                     //patientKey: this.props.patientInfo.patientKey,
                     patientKey: latestEncounter.patientKey,
                     sdt: latestEncounter.sdt
                 },((encntrId, patientKey) => {
                      return () => {
                          this.props.getProblemAndQualifier({encntrId, patientKey});
                      };
                  })(latestEncounter.encntrId, latestEncounter.patientKey));

             this.props.getPatientAppointment(
                 {
                     //patientKey: this.props.patientInfo.patientKey,
                     patientKey: latestEncounter.patientKey,
                     appointmentDateFrom: dtsUtilities.formatDateParameter(moment().startOf('day')),
                     appointmentDateTo: dtsUtilities.formatDateParameter(moment().endOf('day'))
                 }
           );



             this.props.getProceduresAndQualifiers(
               {
                 encntrId: latestEncounter.encntrId,
                 patientKey: latestEncounter.patientKey
                 //patientKey: this.props.patientInfo.patientKey
               });

         let specialtiesCd = allSpecialties.find(specialty => specialty.sspecId == latestEncounter.sspecId).sspecCd;

         console.log('specialtiesCd: ' + JSON.stringify(specialtiesCd));
         //let encounterType = this.props.encounterTypeList.find(item => item.encntrTypeId === this.props.latestEncounter.encntrTypeId).description;
         this.setState({specialtiesCd: specialtiesCd});

         let clinicCd = clinicList.find(item => item.siteId === latestEncounter.siteId).siteCd;
         params.currentEncounterId = latestEncounter.encntrId;
         params.currentEncounterClinicCd =  clinicCd;
         params.currentEncounterServiceCd = latestEncounter.svcCd;
         params.currentEncounterDate = latestEncounter.sdt;
         params.currentEncounterTypeId =  latestEncounter.encntrTypeId;
         this.setState({ params },this.getCurrentEncounterNoteInfo);

         this.getCurrentEncounterDoseInstruction();

         // register function for changing tab action triggered refresh
         this.onRef({handleRefresh:this.getCurrentEncounterDoseInstruction});
    }


    setBookingAlert = (bookingAlert) => {
        if(bookingAlert.length) {
            this.setState((prevState) => ({ bookingAlert : bookingAlert}));
        }
    }

    getCurrentEncounterNoteInfo = () => {
      // console.log('===> getCurrentEncounterNoteInfo');
      let { inputAreaValMap, editClinicalNoteIds } = this.state;
      this.clearClinicalNoteMaps();
      let params = {
        encounterId: this.state.params.currentEncounterId,
        encounterClinicCd: this.state.params.currentEncounterClinicCd,
        userRoleTypeCd: this.state.params.userRoleType,
        selectedServiceCd: this.state.params.currentEncounterServiceCd,
        selectedClinicCd: this.state.params.currentEncounterClinicCd,
        currentEncounterClinicCd: this.state.params.currentEncounterClinicCd
      };
      const callBack = (data) => {
        let clinicalNotes = data.filter((note) => note.typeId == DtsClinicalContentConstant.CLINICAL_NOTE_TYPE.DOCTOR_NOTE);
        let additionalNotes = data.filter((note) => note.typeId == DtsClinicalContentConstant.CLINICAL_NOTE_TYPE.ADDITIONAL_NOTE);
        // console.log('===> getCurrentEncounterNoteInfo *** data  ==> ' + JSON.stringify(data));
        // console.log('===> getCurrentEncounterNoteInfo *** clinicalNotes  ==> ' + JSON.stringify(clinicalNotes));
        // console.log('===> getCurrentEncounterNoteInfo *** additionalNotes  ==> ' + JSON.stringify(additionalNotes));
        let currentNoteInfo  = {
          encounterId:this.state.params.currentEncounterId,
          encounterDate:this.state.params.currentEncounterDate,
          encounterDesc:this.state.params.currentEncounterDesc,
          contents:data
        };

        if(data && Array.isArray(data)) {
          data.forEach(noteType => {
            let notes = noteType.notes;
            if(notes && Array.isArray(notes)) {
              notes.forEach(note => {
                inputAreaValMap.set(note.clinicalnoteId,cloneDeep(note));
              });
            }
          });
        }

        let currentClinicalNoteInfo = {
          encounterId:this.state.params.currentEncounterId,
          encounterDate:this.state.params.currentEncounterDate,
          encounterDesc:this.state.params.currentEncounterDesc,
          contents:clinicalNotes
        };

        let currentAdditionalNoteInfo = {
          encounterId:this.state.params.currentEncounterId,
          encounterDate:this.state.params.currentEncounterDate,
          encounterDesc:this.state.params.currentEncounterDesc,
          contents:additionalNotes
        };
        // console.log('currentNoteInfo  ==> ' + currentNoteInfo);
        this.setState({
          currentNoteInfo,currentClinicalNoteInfo, currentAdditionalNoteInfo
        });
        // console.log('===> getCurrentEncounterNoteInfo ===> data  ==> ');
        // console.log( data);
      };

      this.props.getNoteByEncounter(params, callBack);
    }

    getCurrentEncounterDoseInstruction = () => {

      let params = {
        episodeNo: this.state.params.currentEncounterId,
        episodeType: 'A',
        hospCode: this.state.params.currentEncounterClinicCd,
        loginId: this.props.loginInfo.userDto.userId,
        patientKey: this.state.params.patientKey
      };
      const callBack = (data) => {
        // console.log('currentNoteInfo  ==> ' + currentNoteInfo);
        this.setState({
          doseInstruction: data
        });
      };

      this.props.getDoseInstruction(params, callBack);
    }

  handleTabRefresh = () => {
    if(this.childHandleTabRefreshFunc) {
      this.childHandleTabRefreshFunc.forEach( refreshFunc => {
        refreshFunc();
      });
    }
  }

  handleNewAdditionalNote = () => {
    if(this.additionalNoteRef) {
      this.additionalNoteRef.addNote();
    }
    // console.log("========= this.additionalNoteRef " + this.additionalNoteRef);
  }


  clearClinicalNoteMaps = () => {
    let { inputAreaValMap, editClinicalNoteIds, newNotes } = this.state;
    inputAreaValMap.clear();
    editClinicalNoteIds.clear();
    newNotes.splice(0, newNotes.length);
    if(this.additionalNoteRef) {
      this.additionalNoteRef.clearNewNote();
    }

    this.setState({
      editClinicalNoteIds,
      inputAreaValMap
    });
  };

    generateResultDto = () => {
      let {  currentNoteInfo, params, inputAreaValMap } = this.state;
      let infoObj = currentNoteInfo;
      let resultObj = {
        encounterServiceCd: params.currentEncounterServiceCd,
        encounterClinicCd: params.currentEncounterClinicCd,
        encounterDate: new Date(params.currentEncounterDate),
        encounterId: params.currentEncounterId,
        encounterTypeId: params.currentEncounterTypeId,
        patientKey: params.patientKey,
        userRoleTypeCd: params.userRoleType,
        clinicalNoteDetailList: []
      };
      if (infoObj) {
        let { contents } = infoObj;
        if (contents && contents.length > 0) {

          if (inputAreaValMap.size > 0) {
            for (let noteObj of inputAreaValMap.values()) {

              // console.log('dtscurrentencounterSummary.generateResultDto: ' + JSON.stringify(noteObj));
              if (noteObj.actionType) {
                if (this.noteTypeClinicalNoteIsChange(contents, noteObj)) {
                  let tempObj = {
                    clinicalnoteId: noteObj.clinicalnoteId,
                    clinicalnoteText: trim(noteObj.clinicalnoteText),
                    typeId: noteObj.typeId,
                    version: noteObj.version,
                    isDelete: trim(noteObj.clinicalnoteText) === '' ? 'Y' : ''
                  };
                  if (noteObj.actionType === clinicalNoteConstants.ACTION_TYPE.INSERT) {
                    tempObj.createDtm = new Date();
                    delete tempObj.clinicalnoteId;
                  }
                  resultObj.clinicalNoteDetailList.push(tempObj);
                }
              }
            }
          }


        }
      }
//console.log('dtscurrentencounterSummary.generateResultDto.resultObj:' + JSON.stringify(resultObj));
      return resultObj;
    }

    onRef = (ref) => {
      if(ref && typeof ref.handleRefresh === 'function') {
        this.childHandleTabRefreshFunc.push(ref.handleRefresh);
        console.log('=====> handleRefresh added');
      }
    }

    updateState = obj => {
      this.setState({
        ...obj
      });
    }

    noteTypeClinicalNoteIsChange = (contents, noteObj) => {
      let flag = true;
      if (noteObj.actionType === 'I' && noteObj.clinicalnoteText.trim() === '') {
        flag = false;
      } else {
        contents.forEach(element => {
          element.notes.forEach(note => {
            if (note.clinicalnoteId === noteObj.clinicalnoteId && note.clinicalnoteText === noteObj.clinicalnoteText) {
              flag = false;
            }
          });
        });
      }
      return flag;
    }

  contentScrollTo = (refObj, targetObj) => {
     if(targetObj === null) {
       this.contentRef.current.scrollTo(0,0);
       console.log('contentRef.current.scrollTop  =>' + this.contentRef.current.scrollTop);
     }
     else {
       this.contentRef.current.scrollTo(0,targetObj.current.offsetTop - refObj.current.offsetTop);
     }
  };

  // ShortCutKey(['Alt', '1'], () => contentScrollTo(null,null));
  // ShortCutKey(['Alt', '2'], () => contentScrollTo(medHistoryRef ,clinicalNoteRef));
  // ShortCutKey(['Alt', '3'], () => contentScrollTo(medHistoryRef ,assessmentRef));
  // ShortCutKey(['Alt', '4'], () => contentScrollTo(medHistoryRef ,problemRef));
  // ShortCutKey(['Alt', '5'], () => contentScrollTo(medHistoryRef ,txPlanRef));
  // ShortCutKey(['Alt', '6'] ,() => contentScrollTo(medHistoryRef ,procedureRef ));
  // ShortCutKey(['Alt', '7'] ,() => contentScrollTo(medHistoryRef ,medicationRef ));
  // ShortCutKey(['Alt', '8'] ,() => contentScrollTo(medHistoryRef ,documentRef ));

    toggleAll = () => {
      let isShowAll = !this.state.showAll;
      this.setState({
        problems: isShowAll,
        procedures: isShowAll,
        txPlans: isShowAll,
        assessment: isShowAll,
        additionalNotes: isShowAll,
        documents: isShowAll,
        showAll: isShowAll
      });
    };

    toggle = (stateKey) => {
      this.setState(prevState => ({ [stateKey]: !prevState[stateKey] }));
    }

  refreshEncounter =() =>{
    // console.log("===> refreshEncounter");
     this.props.getLatestEncounter({
      patientKey: this.props.latestEncounter.patientKey
    }, [this.loadData]
    );
  }

  resetAll = () => {


  }


    handleSdOpen = () => {
      this.setState({sdOpen: true});
    };

    handleSdClose = () => {
      this.setState({sdOpen: false});
    };

    handleClose = () => {
      this.setState({open: false});
    };

   printOrder = () => {
      const printableElements = document.getElementById('printme').innerHTML;
      const orderHTML = '<html><head><title></title></head><body>' + printableElements + '</body></html>';
      const oldPage = document.body.innerHTML;
      document.body.innerHTML = orderHTML;
      window.print();
      document.body.innerHTML = oldPage;
  };

  handleSkipTab = (accessRightCd,checkExist) => {
    let {latestEncounter} = this.props;
    if(latestEncounter && latestEncounter.encntrId) {
      let encounterData = {};
      encounterData.currentEncounter = cloneDeep(latestEncounter);
      this.props.skipTab(accessRightCd,encounterData,checkExist);
    }
  };

  handleTreatmentPlanClick =() => {
    this.handleSkipTab(AccessRightEnum.TreatmentPlan,false);
  }

  handleProbProcClick =() =>{
    this.handleSkipTab(AccessRightEnum.EditProbProcedure,true);
  }

  openMedicalHistoriesTab =() =>{
    this.props.skipTab(AccessRightEnum.medicalHistories,null,false);
  }

  openStructureAlertTab =() =>{
    this.props.skipTab(AccessRightEnum.structureAlert,null,false);
  }

  openPrecriptionTab =() =>{
    this.props.skipTab(AccessRightEnum.precription,null,false);
  }

  retrieveLastEncounterId =() => {

  }

  getCurrentEncounterTitle = () => {
    let title;

    // console.log("getCurrentEncounterTitle ==> this.props.latestEncounter.siteId ==>" + this.props.latestEncounter.siteId);
    // console.log("getCurrentEncounterTitle ==> this.props.clinicList ==> " + JSON.stringify(this.props.clinicList));

    let encounterType = this.props.encounterTypes.find(item => item.encntrTypeId === this.props.latestEncounter.encntrTypeId).encntrTypeDesc;
    let rmCd = this.props.roomList.find(item => item.rmId === this.props.latestEncounter.rmId).rmCd;
    let clinicCd = this.props.clinicList.find(item => item.siteId === this.props.latestEncounter.siteId).siteCd;
    let practionerName;
    if(this.props.latestEncounter){


         if(this.props.latestEncounter.cimsUserPract != null){
            practionerName = this.props.latestEncounter.cimsUserPract;
         }else{
           practionerName = '';
         }
    }
    if(typeof practionerName == 'undefined' || practionerName == ''){
        title = encounterType + ' / ' + clinicCd+'('+rmCd+')  ';
    }else{
      title = encounterType + ' / ' + clinicCd+'('+rmCd+') / ' + practionerName;
    }



    return title;

  }

  getPractionerName = () =>{

    let salutation = this.props.loginInfo.userDto.salutation;
    let engGivName = this.props.loginInfo.userDto.engGivName;
    let engSurName =  this.props.loginInfo.userDto.engSurname;
    let patitionerName;

    if(typeof salutation !== 'undefined'){
      patitionerName = salutation + ' ' + engGivName + ' ' + engSurName;
    }else{
     patitionerName = engGivName + ' ' + engSurName;
    }


    return patitionerName;
  }

   getBookingAlertIcon = (bookingAlertCode) => {
        switch (bookingAlertCode) {
            case 'BLEEDING_TENDENCY':
                return(<Icon className="fa fa-tint" style={{ color: 'red', fontSize: 20, marginLeft:5 }} />);
            case 'REQUIRE_ANTIBIOTIC_COVER':
                return(<Icon className="fa fa-flask" style={{ color: 'red', fontSize: 20, marginLeft:5}} />);
            case 'MEDICAL_ALERT':
                return(<Icon className="fa fa-plus-circle" style={{ color: 'red', fontSize: 20, marginLeft:5}} />);
            default:
                return(null);
        }
    }

    handleSaveEncounterClick =(event, status) =>{

      const { classes,latestEncounter,problemQualifier,proceduresQualifiers} = this.props;

      let resultObj = this.generateResultDto();
      let clinicalNoteSaveDto =null;
      if (resultObj.clinicalNoteDetailList.length > 0) {
        clinicalNoteSaveDto = resultObj;
      }


      if(status == 'Save'){
          this.props.updateEncounter({
            //patientKey: this.props.patientInfo.patientKey,
            patientKey: latestEncounter.patientKey,
            sspecId: latestEncounter.sspecId,
            encntrSts: 'I',
            //cimsUserPract: this.getPractionerName(),
            cimsUserPract: latestEncounter.cimsUserPract,
            encntrId: latestEncounter.encntrId,
            version: moment().format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z',
            updateDtm: moment().format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z',
            clinicalNoteSaveDto
          },
            [this.loadData]
          );
          this.resetAll();

          let accessTSN = this.state.accessmentTriggerSaveNum;
          this.setState({ accessmentTriggerSaveNum: ++accessTSN });

      }else if(status == 'Complete'){
        this.props.updateEncounter({
            //patientKey: this.props.patientInfo.patientKey,
            patientKey: latestEncounter.patientKey,
            sspecId: latestEncounter.sspecId,
            encntrSts: 'C',
            //cimsUserPract: this.getPractionerName(),
            cimsUserPract: latestEncounter.cimsUserPract,
            encntrId: latestEncounter.encntrId,
            version: moment().format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z',
            updateDtm: moment().format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z',
            clinicalNoteSaveDto
          },
            [this.loadData]
          );

          // eslint-disable-next-line
           if (confirm("Do you want to be directed to attendance page?") == true) {
                this.handleSkipTab(AccessRightEnum.DtsAttendance,true);
            } else {
               this.loadData();
            }
          this.resetAll();
      }else{
        this.props.updateEncounter({
            //patientKey: this.props.patientInfo.patientKey,
            patientKey: this.props.latestEncounter.patientKey,
            sspecId: this.props.latestEncounter.sspecId,
            encntrSts: 'P',
            //cimsUserPract: this.getPractionerName(),
            cimsUserPract: latestEncounter.cimsUserPract,
            encntrId: this.props.latestEncounter.encntrId,
            version: moment().format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z',
            updateDtm: moment().format('YYYY-MM-DDTHH:mm:ss.SSS')+'Z',
            clinicalNoteSaveDto
          },
            [this.loadData]
          );

          this.resetAll();

          // /this.props.setRedirect({ action: REDIRECT_ACTION_TYPE.DTS_ATTENDANCE });
          //this.handleSkipTab('attendance', null, AccessRightEnum.DtsAttendance);
          this.handleSkipTab(AccessRightEnum.DtsAttendance,true);

      }
    }

    // Derek, add for assessment, start
    setBPE2NA = () => {
      let num = this.state.bpeNANum;
      this.setState({ bpeNANum: ++num });
    }
    // Derek, add for assessment, end

  render(){
        const { classes,latestEncounter,problemQualifier,proceduresQualifiers} = this.props;
        const {currentClinicalNoteInfo, currentAdditionalNoteInfo, newNotes, readOnly} = this.state;

        const commonEncounterProps = {
          updateState: this.updateState,
          currentEncounter: latestEncounter,
          // problemQualifierList: problemQualifier,
          // proceduresQualifiersList: proceduresQualifiers,
          readOnly
        };


        const bannerProps = {
          ...commonEncounterProps,
          toggleAll: this.toggleAll,
          showAll: this.state.showAll,
          openPrecriptionTab: this.openPrecriptionTab,
          handleNewAdditionalNote: this.handleNewAdditionalNote
          //refreshEncounter: this.refreshEncounter

        };

        const currentMedicalHistoryProps = {
          ...commonEncounterProps,
          currentEncounter: latestEncounter,
          openStructureAlertTab: this.openStructureAlertTab,
          openMedicalHistoriesTab: this.openMedicalHistoriesTab
        };

        const currentClincialNoteProps = {
          ...commonEncounterProps,
          params: this.state.params,
          editClinicalNoteIds: this.state.editClinicalNoteIds,
          inputAreaValMap: this.state.inputAreaValMap,
          seed: this.state.currentSeed,
          currentClinicalNoteInfo
        };

        const currentNoteProps = {
          ...commonEncounterProps,
          params: this.state.params,
          editClinicalNoteIds: this.state.editClinicalNoteIds,
          inputAreaValMap: this.state.inputAreaValMap,
          newNotes,
          currentAdditionalNoteInfo
        };

        const currentAssmentProps = {
          ...commonEncounterProps,
          assessment: this.state.assessment,
          assessmentDTO: this.state.assessmentDTO
        };

        const accessmentTriggerSaveNum = this.state.accessmentTriggerSaveNum;

        // Derek, add for assessment, start
        const assessmentLastDate = this.state.assessmentLastDate;
        const assessmentData = this.state.assessmentData;
        const bpeNANum = this.state.bpeNANum;
        let txtTitle = '';
        txtTitle = (assessmentLastDate === '') ? ' ( No record )' : ' ( Last updated on: ' + assessmentLastDate + ' )';
        // Derek, add for assessment, end

        return(
           <Card  component="div" display="inline">

                <DtsEncounterBanner {...bannerProps}></DtsEncounterBanner>

                <CardContent  id="contentRef" className={classes.encounterContent} >

                <section id="medHistoryRef">
                  {latestEncounter && latestEncounter.encntrId!= null &&
                    <DtsMedicalHistories {...currentMedicalHistoryProps} onRef={this.onRef}/>
                  }
                </section>


                <section id="clinicalNoteRef">
                  <BlockInfo title="Clinical Note" >
                     {latestEncounter && latestEncounter.encntrId!= null && currentClinicalNoteInfo &&
                        <DtsClinicalNote {...currentClincialNoteProps} />
                     }
                  </BlockInfo>
                </section>

                <section id="assessmentRef">
                <BlockInfo title={'Assessment ' + txtTitle} isShow={this.state.assessment} toggleFn={() => this.toggle('assessment')} toggleCEFn={() => this.setBPE2NA()}>
                  {latestEncounter && latestEncounter.encntrId!= null &&
                    <DtsAssessment bpeNANum={bpeNANum} readOnly={readOnly} aData={assessmentData} show={this.state.assessment} saveNum={accessmentTriggerSaveNum} {...currentAssmentProps}/>
                  }
                  </BlockInfo>
                </section>


              <section id="problemRef">
                <BlockInfo title="Existing and Resolved Problems" titleFn={this.handleProbProcClick} isShow={this.state.problems} toggleFn={() => this.toggle('problems')} >
                  {latestEncounter && latestEncounter.encntrId != null &&
                      <DtsExistingProblemTreatment />
                  }
                </BlockInfo>
              </section>
              <br />

              <section id="txPlanRef">
                <BlockInfo title="Treatment Plan" titleFn={this.handleTreatmentPlanClick} isShow={this.state.txPlans} toggleFn={() => this.toggle('txPlans')} >
                  {latestEncounter && latestEncounter.encntrId != null &&
                      <TreatmentPlan />
                  }
                </BlockInfo>
              </section>

              <br />

              <section id="procedureRef">
                <BlockInfo title="New procedure" titleFn={this.handleProbProcClick}>
                  {latestEncounter && latestEncounter.encntrId != null &&
                    <DtsEncounterListProcedure />
                  }
                </BlockInfo>
              </section>

                  {/* {this.medicationComp} */}
                  <section id="medicationRef">
                  {latestEncounter && latestEncounter.encntrId!= null && this.state.doseInstruction && this.state.doseInstruction.length > 0 &&
                      <BlockInfo title="Medication" titleFn={this.openPrecriptionTab} >
                        <List disablePadding dense>
                                {this.state.doseInstruction.map((text, index) => (
                                    <ListItem
                                        key={index}
                                        button
                                        className={classes.nested}
                                        dense
                                    >
                                      <ListItemText
                                          classes={{ primary: classes.list_text }}
                                          primary={<span className={classes.primaryText}>{text}</span>}
                                      />
                                    </ListItem>
                                ))}
                        </List>
                      </BlockInfo>
                      }
                  </section>

                    {/* {this.documentComp} */}
                      <section id="documentRef">
                          <BlockInfo title="Clinical Document"  isShow={this.state.documents} toggleFn={()=>this.toggle('documents')} >
                          {latestEncounter && latestEncounter.encntrId!= null &&
                                <div/>
                          }
                          </BlockInfo>
                    </section>

                   <section id="additionalNoteRef">
                      <BlockInfo title="Additional Note" isShow={this.state.additionalNotes} toggleFn={()=>this.toggle('additionalNotes')} >
                      {latestEncounter && latestEncounter.encntrId!= null && currentAdditionalNoteInfo &&
                        <DtsAdditionalNote onRef={ref => (this.additionalNoteRef = ref)} {...currentNoteProps}/>
                      }
                      </BlockInfo>
                  </section>


                  <div>
                  <Typography paragraph variant="h6"  component="p" align="center">
                    ~END~
                  </Typography>
                  </div>
                  </CardContent>
                  <div>
                    <Dialog
                        open={this.state.cNoteAbbreviation}
                        aria-labelledby="draggable-dialog-title"
                        PaperComponent={utils.PaperComponent}
                        maxWidth={'xl'}
                    >
                      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                        Abbreviation
                      </DialogTitle>
                      <DialogContent>
                  {/* <Typography className={classes.title} color="textSecondary" gutterBottom>
                    {config.abbreviations.map((row, index) => (
                    <Box>
                      <b>{row.abb} </b> {row.desc}
                    </Box>
                    ))}
                  </Typography> */}
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={()=>this.setState({cNoteAbbreviation: false})} color="primary">
                          Close
                        </Button>

                      </DialogActions>
                    </Dialog>
                  </div>

                <Box  displayPrint="none" >
                      <SpeedDial
                          ariaLabel=""
                          className={classes.speedDial}
                          hidden={this.state.hidden}
                          icon={<SpeedDialIcon openIcon={<Edit />} />}
                          onClose={this.handleSdClose}
                          onOpen={this.handleSdOpen}
                          open={this.state.sdOpen}

                      >
                        {/* {actions.map(action => (
                          <SpeedDialAction
                              key={action.name}
                              icon={action.icon}
                              tooltipTitle={action.name}
                          />
                        ))} */}

                            <SpeedDialAction
                                key={'Print'}
                                icon={<Print />}
                                tooltipTitle={'Print'}

                            />
                            <SpeedDialAction
                                key={'Save'}
                                icon={<Save />}
                                tooltipTitle={'Save'}
                                onClick={e => this.handleSaveEncounterClick(e, 'Save')}
                            />
                            <SpeedDialAction
                                key={'Pending'}
                                icon={<SaveAlt />}
                                onClick={e => this.handleSaveEncounterClick(e, 'Pending')}
                                tooltipTitle={'Pending'}
                            />
                            <SpeedDialAction
                                key={'Done'}
                                icon={<Done />}
                                tooltipTitle={'Complete'}
                                onClick={e => this.handleSaveEncounterClick(e, 'Complete')}

                            />
                            {latestEncounter && latestEncounter.encntrId == null &&

                              <SpeedDialAction
                                  key={'createEncounter'}
                                  icon={<Done />}
                                  tooltipTitle={'Create Direct Encounter'}
                                  onClick={e => this.handleSaveEncounterClick(e, 'Complete')}
                              />

                            }

                      </SpeedDial>
                </Box>
              </Card>
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
      mainFrame:state.mainFrame,
      subTabsActiveKey:state.mainFrame.subTabsActiveKey,
      latestEncounter: state.clinicalContentEncounter.latestEncounter,
      patientAppointmentList: state.clinicalContentEncounter.patientAppointmentList,
      roomList: state.common.rooms,
      encounterTypes: state.common.encounterTypes,
      clinicList: state.common.clinicList,
      problemQualifier: state.clinicalContentEncounter.problemQualifierList,
      proceduresQualifiers: state.clinicalContentEncounter.proceduresQualifiersList,
      carryFowardDataList: state.clinicalContentEncounter.carryFowardDataList,
      loginUserRoleList: state.common.loginUserRoleList,
      assessmentData: state.clinicalContentAssessment.assessmentData,
      assessmentEncntrData: state.clinicalContentAssessment.assessmentEncntrData,
      loginService: state.login.service
    };
};

const mapDispatchToProps = {
  setRedirect,
  skipTab,
  openCommonCircular,
  closeCommonCircular,
  getBookingAlert,
  updateEncounter,
  getLatestEncounter,
  getNoteByEncounter,
  saveClinicalNote,
  openCommonMessage,
  resetAll,
  insertEncounter,
  getPatientAppointment,
  getProblemAndQualifier,
  getProceduresAndQualifiers,
  getCarryForwardData,
  getDoseInstruction,
  getAssessment_saga,
  getAssessmentEncntrByPatientKey_saga,
  getLoginUserInfo

};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsCurrentEncounterSummary));
