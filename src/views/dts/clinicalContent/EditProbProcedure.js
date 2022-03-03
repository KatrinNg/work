import React, { Component, useState, useEffect, useRef } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {fade } from '@material-ui/core/styles';
import { makeStyles, withStyles ,createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import {List, ListItem, ListItemText, ListItemIcon, ListItemAvatar} from '@material-ui/core';
import { Paper,Card, CardMedia } from '@material-ui/core';
import * as config from './components/probProcConfig';
import DtsEditQualifierFields from './components/DtsEditQualifierFields';
import DtsDentalChart2 from './components/DtsDentalChart2';
import Button from '@material-ui/core/Button';
import { green, purple } from '@material-ui/core/colors';
import  Collapse from '@material-ui/core/Collapse';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MenuIcon from '@material-ui/icons/Menu';
import MoreIcon from '@material-ui/icons/MoreVert';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import Grid from '@material-ui/core/Grid';
import pink from '@material-ui/core/colors/pink';

import DtsListProblems from './components/DtsListProblems';
import DtsListProblems_paging from './components/DtsListProblems_paging';
import DtsListNewProblems from './components/DtsListNewProblems';
import DtsProbProcProcedures from './components/DtsProbProcProcedures';
import DtsProbProcExistProbTreat from './components/DtsProbProcExistProbTreat';
import DtsProbProcNewHistProb from './components/DtsProbProcNewHistProb';
import DtsListProbProc from './components/DtsListProbProc';
import DtsPxPrMenu from './components/DtsPxPrMenu';
import CIMSMultiTab from '../../../components/Tabs/CIMSMultiTab';
import CIMSMultiTabs from '../../../components/Tabs/CIMSMultiTabs';
import DentalChart from '../../../images/clinicalContent/DentalChart.png';
import TreatmentPlanTable from '../../../images/clinicalContent/treatment_plan_table.png';
import accessRightEnum from '../../../enums/accessRightEnum';
import {UPDATE_CURRENT_TAB} from '../../../store/actions/mainFrame/mainFrameActionType';
import * as commonUtils from '../../../utilities/josCommonUtilties';
import * as actionTypes from '../../../store/actions/clinicalNote/clinicalNoteActionType'; //For testing
import * as clinicalNoteConstants from '../../../constants/clinicalNote/clinicalNoteConstants';
import { deleteSubTabsByOtherWay, updateCurTab } from '../../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { setRemark, getDentalChart} from '../../../store/actions/dts/clinicalContent/DtsDentalChartAction';
import { saveProbProc, resetSelectedVal, getQualifier, getProbProcAddDetails} from '../../../store/actions/dts/clinicalContent/problemProcedureAction';
import {
  getProblemAndQualifier,
  getProceduresAndQualifiers
} from '../../../store/actions/dts/clinicalContent/encounterAction';

const styles = (theme) => ({
    root: {
      //flexGrow: 1,
      //display: 'flex',
      height: '100%',
      width: '100%',
      overflow: 'hidden'
      // height: 224,
    },
    grow: {
      flexGrow: 1
    },
    menuButton: {
      marginRight: theme.spacing(2)
    },
    title: {
      display: 'none',
      [theme.breakpoints.up('sm')]: {
        display: 'block'
      },
      flex: '1 1 100%',
      color: 'purple'
    },
    tabsRight: {
      borderRight: `1px solid ${theme.palette.divider}`
    },
    tabsBottom: {
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    listRoot: {
        // width: '100%',
        // maxWidth: 360,
        // backgroundColor: theme.palette.background.paper,
        // position: 'relative',
        overflow: 'hidden',
        minHeight: 325,
        maxHeight: 325
    },
    listSection: {
      backgroundColor: 'inherit'
    },
    ul: {
      backgroundColor: 'inherit',
      padding: 0
    },
    margin: {
      margin : 8
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: fade(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: fade(theme.palette.common.white, 0.25)
      },
      marginRight: theme.spacing(2),
      marginLeft: theme.spacing(3),
      width: 700
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    inputRoot: {
      color: 'inherit'
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%'
    },

    card: {
    // borderRadius: 0,
    // backgroundColor: theme.palette.primary.light,
    // color: theme.palette.primary.contrastText,
    boxShadow: 'none',
    border : 0,
    overflow: 'hidden'
    // height : '100%',
    }
});

const StyledTab = withStyles((theme) => ({
  root: {
    minWidth: 80,
    textTransform: 'none',
    '&$selected': {
      color: '#FFFFFF',
      backgroundColor : '#c2c2c2'
    }
  },
  selected: {}

}))((props) => <Tab disableRipple {...props} />);

// const chartClasses = useChartStyles();

const useChartStyles = makeStyles(theme => ({
  chart: {
    backgroundColor: theme.palette.background.paper,
    width: 700,
    height: 350,
    margin: 'auto',
    display: 'block'
  },
  treamentPlan: {
    backgroundColor: theme.palette.background.paper,
    width: 718,
    height: 388,
    margin: 'auto',
    display: 'block'
  }
}));



class EditProbProcedure extends Component {
    constructor(props){
        super(props);

        this.state = {
          anchorEl: null,
          isMenuOpen: false,
          probProcIndx: '',
          showProblem: false,
          showProcedure: 0,
          value: 0,
          edit: false,
          selectedProbProc: '',
          selectedProbProcTermId: '',
          selectedTeeth: [],
          //selectedTeethSurface: [],
          multiSel: [],
          multiSel1: [],
          multiSel2: [],
          multiSel3: [],
          multiSel4: [],
          multiSel5: [],
          multiSel6: [],
          singleSel1: null,
          singleSel2: null,
          singleSel3: null,
          singleSel4: null,
          singleSel5: null,
          singleSel6: null,
          toogleChecked1: '',
          toogleChecked2: '',
          toogleChecked3: '',
          toogleChecked4: '',
          toogleChecked5: '',
          toogleChecked6: '',
          probProcDetails: '',
          isMenuChange: false,
          patientKey: this.props.location.state?this.props.location.state.currentEncounter.patientKey:4157247,
          encounterId: this.props.location.state?this.props.location.state.currentEncounter.encntrId:500245,
          encounterSdt: this.props.location.state?this.props.location.state.currentEncounter.sdt:'2020-09-23T14:30Z',
          isPermanentTeeth: true,
          isPrimaryTeeth: true,
          carryTooth: false,
          cmnTermIndx: -1

        };
        //console.log('Dicky encounter', this.props.location.state.currentEncounter);

        this.submitButton=React.createRef();
        this.submitForm=React.createRef();
        this.props.resetSelectedVal();
    }

    componentDidMount() {

        this.props.updateCurTab(accessRightEnum.EditProbProcedure, this.doClose);

    }

    resetSelectedTeeth = () => {
      this.setState({selectedTeeth: []});
    }

    handleTeethSelectChange = (value, isRemove) => {
      let toothSurfaceChange = false;
      if (value.length > 2){
        toothSurfaceChange = true;
      }

      let _selectedTeethlList = this.state.selectedTeeth;
      if (isRemove){
        let index = _selectedTeethlList.indexOf(value);
        //console.log('handleTeethSelectChange' + value + ' ' + index);
        if (index > -1) {
          _selectedTeethlList.splice(index,1);
        }
      } else{
        // if tooth remove originally selected tooth surface
        // if tooth surface remove originally selected tooth
        if (toothSurfaceChange){
          let index = _selectedTeethlList.indexOf(value.substring(0, 2));
          if (index > -1) {
            _selectedTeethlList.splice(index,1);
          }
        } else{
           _.remove(_selectedTeethlList, function(c) {
              return c.startsWith(value);
          });
        }
        _selectedTeethlList.push(value);
      }
      //console.log('Dicky _selectedTeethlList: ',  _selectedTeethlList);

      this.setState({selectedTeeth: _selectedTeethlList});

    }

    /*
    handleSurfaceSelectChange = (tooth, surface, isRemove) => {
      let _selectedTeethSurfacelList = this.state.selectedTeethSurface;
      if (isRemove){
        let index = _selectedTeethSurfacelList.indexOf(tooth + surface);
        console.log('Dicky: handleSurfaceSelectChange' + tooth + ' ' + index);
        if (index > -1) {
          _selectedTeethSurfacelList.splice(index,1);
        }
      } else{
        _selectedTeethSurfacelList.push(tooth + surface);
      }
      console.log('Dicky _selectedTeethSurfacelList: ',  _selectedTeethSurfacelList);

      this.setState({selectedTeethSurface: _selectedTeethSurfacelList});

    }
    */

    handleIsPermanentOnChange = (value) =>{
      //console.log('handleIsPermanentOnChange :'+value.target.checked);
      this.setState({isPermanentTeeth: value});
    }

    handleIsPrimaryOnChange = (value) =>{
      //console.log('handleIsPrimaryOnChange :'+value.target.checked);
        this.setState({isPrimaryTeeth: value});
    }

    handleCarrytoothOnChange = (elem, value) =>{
      //console.log('handleIsPrimaryOnChange :'+value.target.checked);
        this.setState({carryTooth: value});
    }

    handleCmnTermIndxOnChange = (value) =>{
      //console.log('handleIsPrimaryOnChange :'+value.target.checked);
        this.setState({cmnTermIndx: value});
    }

    handlePxPrMenuOnChange = (event, probProcTxt, probProcTermId, probProcIndx) => {
     //console.log('handlePxPrMenuOnChange');
      this.setState({multiSel: [],
        multiSel1: [],
        multiSel2: [],
        multiSel3: [],
        multiSel4: [],
        multiSel5: [],
        multiSel6: [],
        singleSel1: null,
        singleSel2: null,
        singleSel3: null,
        singleSel4: null,
        singleSel5: null,
        singleSel6: null,
        toogleChecked1: '',
        toogleChecked2: '',
        toogleChecked3: '',
        toogleChecked4: '',
        toogleChecked5: '',
        toogleChecked6: '',
        probProcDetails: '',
        isProbHx: false,
        termStatus: (probProcIndx==1)?'A':'C',
        termKey: '',
        isCurProb: ''
      });
      this.setState({isMenuChange: false});
      this.setState({selectedProbProc: probProcTxt});
      this.setState({selectedProbProcTermId: probProcTermId});
      this.setState({probProcIndx: probProcIndx});
    }
    handleMulQualifierChange = (value, qualSeq, codQlfValList) => {

      console.log('handleMulQualifierChange1',value);
      console.log('handleMulQualifierChange2',codQlfValList);
      let _selectedMulQualList = [];
      if (value) {
          const valueList = value.map((item) => (item.value));
          if (valueList.includes('*All')){
            codQlfValList.forEach(item => {
              _selectedMulQualList.push(item.codQlfValId);
                });
          } else{
            valueList.forEach(item => {
              _selectedMulQualList.push(item);
              });
          }
      } else {
        _selectedMulQualList = [];
      }
      console.log('handleMulQualifierChange3: ',  _selectedMulQualList);
      if (qualSeq == 1){
        this.setState({multiSel1: _selectedMulQualList});
      } else if (qualSeq == 2){
        this.setState({multiSel2: _selectedMulQualList});
      } else if (qualSeq == 3){
        this.setState({multiSel3: _selectedMulQualList});
      } else if (qualSeq == 4){
        this.setState({multiSel4: _selectedMulQualList});
      } else if (qualSeq == 5){
        this.setState({multiSel5: _selectedMulQualList});
      } else if (qualSeq == 6){
        this.setState({multiSel6: _selectedMulQualList});
      }
    }

    handleSinQualifierChange  = (value, qualSeq) => {
      //console.log('Dicky select4', value);
      if (qualSeq == 1){
        this.setState({singleSel1: value});
      } else if (qualSeq == 2){
        this.setState({singleSel2: value});
      } else if (qualSeq == 3){
        this.setState({singleSel3: value});
      } else if (qualSeq == 4){
        this.setState({singleSel4: value});
      } else if (qualSeq == 5){
        this.setState({singleSel5: value});
      } else if (qualSeq == 6){
        this.setState({singleSel6: value});
      }
      //this.setState({edit:true});
    }

    handleChangeToogle = (elem, value, qualSeq, qlfVal) => {
      if (qualSeq == 1){
        if (value){
          this.setState({toogleChecked1: qlfVal});
        } else{
          this.setState({toogleChecked1: ''});
        }
      } else if (qualSeq == 2){
        if (value){
          this.setState({toogleChecked2: qlfVal});
        } else{
          this.setState({toogleChecked2: ''});
        }
      } else if (qualSeq == 3){
        //console.log('Dicky toogle1', value);
        if (value){
          //console.log('Dicky toogle2', qlfVal);
          this.setState({toogleChecked3: qlfVal});
        } else{
          this.setState({toogleChecked3: ''});
        }
      } else if (qualSeq == 4){
        if (value){
          this.setState({toogleChecked4: qlfVal});
        } else{
          this.setState({toogleChecked4: ''});
        }
      } else if (qualSeq == 5){
        if (value){
          this.setState({toogleChecked5: qlfVal});
        } else{
          this.setState({toogleChecked5: ''});
        }
      } else if (qualSeq == 6){
        if (value){
          this.setState({toogleChecked6: qlfVal});
        } else{
          this.setState({toogleChecked6: ''});
        }
      }

    }

    handleProbProcDetailsChange = (event, value) =>{
      this.setState({probProcDetails: value});
    };

    handleIsProbHxOnChange = (event) =>{
        this.setState({isProbHx: event.target.checked});
    }

    setDefaultProbHx = (value) =>{
        this.setState({isProbHx: value});
    }


    handleStatusOnChange = (value) =>{
        this.setState({termStatus: value});
    }

    handleChange = (event, newValue) => {
      this.setState({value: newValue});
      this.setState({ edit: true });
    // setValue(newValue);
    // console.log(newValue)
    };

    resetTooth = (value) =>{
      this.setState({toothResetInd: value});

  }
    doClose = (callback) => {
        /*
        if (this.state.edit) {
            this.props.openCommonMessage({
                msgCode: '110018',
                btnActions: {
                    btn1Click: () => {
                        callback(true);
                    }
                }
            });
        }
        else {
            callback(true);
        }
        */
       callback(true);
    }

    getSystemErrorMessage = (name) => {
      if (name === 'error_bridge_for_primary_teeth') {
          return 'Bridge is not allowed for primary teeth';
      }
      if (name === 'error_bridge_overlap') {
        return 'Bridge overlap';
      }
      if (name === 'error_dental_arch_not_sync') {
        return 'Dental Arch not synchronized';
      }
      if (name === 'error_bridge_not_found') {
        return 'Bridge not found';
      }
      if (name.startsWith('DUP_PROC_E') && name.length <= 10){
        return 'Duplicate procedure is not allowed.';
      }
      if (name.startsWith('DUP_PROC_E') && name.length > 10){
        return 'Duplicate procedure with the same ' + name.substring(11) + ' is not allowed.';
      }
      if (name.startsWith('DUP_PROC_W') && name.length <= 10){
        return 'Duplicate procedure is found. To record, please click YES. To cancel, please click NO.';
      }
      if (name.startsWith('DUP_PROC_W') && name.length > 10){
        return 'Duplicate procedure with the same ' + name.substring(11) + ' is found. To record, please click YES. To cancel, please click NO.';
      }
  }

    generateQlfList = (toothQualVal, surfaceQualVal, qualSelectedValue, qlfCase, toothToQual) => {
      const clcQlfList = [];
     
      if (qlfCase == "1"){
        clcQlfList.push(toothQualVal[0].codQlfValId);
        clcQlfList.push(surfaceQualVal[0].codQlfValId);
      } else if (qlfCase == "2"){
        clcQlfList.push(toothQualVal[0].codQlfValId);
        if (qualSelectedValue.multiSel2.length>0){
          qualSelectedValue.multiSel2.forEach(item => {
            clcQlfList.push(item);
          });
        } else if (qualSelectedValue.toogleChecked2!=''){
          clcQlfList.push(qualSelectedValue.toogleChecked2);
        } else if (qualSelectedValue.singleSel2!=null){
          clcQlfList.push(qualSelectedValue.singleSel);
        }
      } else if (qlfCase == "3"){
        toothQualVal.forEach(item => {
          clcQlfList.push(item[0].codQlfValId);
        });

        if (qualSelectedValue.multiSel2.length>0){
          qualSelectedValue.multiSel2.forEach(item => {
            clcQlfList.push(item);
          });
        } else if (qualSelectedValue.toogleChecked2!=''){
          clcQlfList.push(qualSelectedValue.toogleChecked2);
        } else if (qualSelectedValue.singleSel2!=null){
          clcQlfList.push(qualSelectedValue.singleSel2);
        }
      } else if (qlfCase == "4"){
        if (qualSelectedValue.multiSel1.length>0){
          qualSelectedValue.multiSel1.forEach(item => {
            clcQlfList.push(item);
          });
        } else if (qualSelectedValue.toogleChecked1!=''){
          clcQlfList.push(qualSelectedValue.toogleChecked1);
        } else if (qualSelectedValue.singleSel1!=null){
          clcQlfList.push(qualSelectedValue.singleSel1);
        }
        if (qualSelectedValue.multiSel2.length>0){
          qualSelectedValue.multiSel2.forEach(item => {
            clcQlfList.push(item);
          });
        } else if (qualSelectedValue.toogleChecked2!=''){
          clcQlfList.push(qualSelectedValue.toogleChecked2);
        } else if (qualSelectedValue.singleSel2!=null){
          clcQlfList.push(qualSelectedValue.singleSel2);
        }
      } else if (qlfCase == "5"){
        clcQlfList.push(toothQualVal[0].codQlfValId);
        clcQlfList.push(toothToQual[0].codQlfValId);
      }

      if (qualSelectedValue.multiSel3.length>0){
        qualSelectedValue.multiSel3.forEach(item => {
          clcQlfList.push(item);
        });
      } else if (qualSelectedValue.toogleChecked3!=''){
        clcQlfList.push(qualSelectedValue.toogleChecked3);
      } else if (qualSelectedValue.singleSel3!=null){
        clcQlfList.push(qualSelectedValue.singleSel3);
      }
      if (qualSelectedValue.multiSel4.length>0){
        qualSelectedValue.multiSel4.forEach(item => {
          clcQlfList.push(item);
        });
      } else if (qualSelectedValue.toogleChecked4!=''){
        clcQlfList.push(qualSelectedValue.toogleChecked4);
      } else if (qualSelectedValue.singleSel4!=null){
        clcQlfList.push(qualSelectedValue.singleSel4);
      }
      if (qualSelectedValue.multiSel5.length>0){
        qualSelectedValue.multiSel5.forEach(item => {
          clcQlfList.push(item);
        });
      } else if (qualSelectedValue.toogleChecked5!=''){
        clcQlfList.push(qualSelectedValue.toogleChecked5);
      } else if (qualSelectedValue.singleSel5!=null){
        clcQlfList.push(qualSelectedValue.singleSel5);
      }
      if (qualSelectedValue.multiSel6.length>0){
        qualSelectedValue.multiSel6.forEach(item => {
          clcQlfList.push(item);
        });
      } else if (qualSelectedValue.toogleChecked6!=''){
        clcQlfList.push(qualSelectedValue.toogleChecked6);
      } else if (qualSelectedValue.singleSel6!=null){
        clcQlfList.push(qualSelectedValue.singleSel6);
      }
      return clcQlfList;
    }

    handleOnSubmit = (isReNew, termDescDsp, codeTermId, probInd, index, termCncptId) => {
      //console.log('Dicky tun ' + new Date());
      const { selectedTeeth, selectedProbProcTermId, probProcIndx, selectedProbProc, probProcDetails, isProbHx, termStatus, patientKey, encounterId, encounterSdt, termKey, isCurProb} = this.state;
      const {qualifierList, dentalChartData}= this.props;
      let qualSelectedValue = {multiSel1: this.state.multiSel1,
        multiSel2: this.state.multiSel2,
        multiSel3: this.state.multiSel3,
        multiSel4: this.state.multiSel4,
        multiSel5: this.state.multiSel5,
        multiSel6: this.state.multiSel6,
        singleSel1: this.state.singleSel1,
        singleSel2: this.state.singleSel2,
        singleSel3: this.state.singleSel3,
        singleSel4: this.state.singleSel4,
        singleSel5: this.state.singleSel5,
        singleSel6: this.state.singleSel6,
        toogleChecked1: this.state.toogleChecked1,
        toogleChecked2: this.state.toogleChecked2,
        toogleChecked3: this.state.toogleChecked3,
        toogleChecked4: this.state.toogleChecked4,
        toogleChecked5: this.state.toogleChecked5,
        toogleChecked6: this.state.toogleChecked6};

      //console.log("Qual save", selectedTeeth);
      //console.log("Qual save 2", qualSelectedValue);
      //console.log("Dicky Left save", qualSelectedValue);
      //console.log("Dicky Left save2" + termDescDsp + termCncptId);
      if (typeof qualifierList == 'undefined'){
        if (typeof termCncptId != 'undefined'){
          this.handlePxPrMenuOnChange(null, termDescDsp, codeTermId, probInd);
          this.handleCmnTermChange(index, termCncptId, codeTermId, encounterSdt);
        }
        return;
      } 
      const toothQual = qualifierList.filter(i => i.qlfCod === 'TOOTH');
      const surfaceQual = qualifierList.filter(i => (i.qlfCod === 'TOOTH_SURFACE' || i.qlfCod === 'ROOT_SURFACE'));
      const toothToQual = qualifierList.filter(i => (i.qlfCod === 'TOOTH_TO'));
      let toothQualVal = [];
      let surfaceQualVal = [];
      let toothToQualVal = [];
      let toothMapType = "S";
      //console.log("Qual save 2a", toothQual);
      if (toothToQual.length > 0){
        if (typeof selectedTeeth != 'undefined' && selectedTeeth.length > 0){
          toothQualVal.push(toothQual[0].codQlfValList.filter(i => i.valDesc === selectedTeeth[0].substring(0,2)));
          toothToQualVal.push(toothToQual[0].codQlfValList.filter(i => i.valDesc === selectedTeeth[selectedTeeth.length-1].substring(0,2)));
        }
        //console.log("Dicky Tooth", toothQualVal);
        //console.log("Dicky Tooth to", toothToQualVal);
      } else{
        if (toothQual.length > 0){
          //console.log("Qual save 2b", toothQual[0].codQlfValList);
          toothMapType = toothQual[0].mapType;
          if (selectedTeeth){
            selectedTeeth.forEach(item => {
              toothQualVal.push(toothQual[0].codQlfValList.filter(i => i.valDesc === item.substring(0,2)));
            });
          }
        }
        //console.log("Qual save 3a", surfaceQual);
        if (surfaceQual.length > 0){
          //console.log("Qual save 3b", surfaceQual[0].codQlfValList);
          if (selectedTeeth){
            selectedTeeth.forEach(item => {
              if (item.length > 2){
                surfaceQualVal.push(surfaceQual[0].codQlfValList.filter(i => i.valDesc === item.substring(2,3)));
              } else{
                surfaceQualVal.push(null);
              }
            });
          }
        }
      }
      //console.log("Qual save 4", toothQualVal);
      //console.log("Dicky Left save2" + selectedTeeth.length);
      // check input tooth
      if (selectedTeeth && selectedTeeth.length == 0 && toothQual.length > 0 ){
        //alert('Please select tooth no.');
        this.props.openCommonMessage({
          msgCode: '130301',
          params: [{ name: 'MESSAGE', value: 'Please select tooth no.' }, { name: 'HEADER', value: 'Save Problem / Procedure' }]
        });
        return;
      }
      //construct common parameters for save
      const commonSaveProp = {
        patientKey: patientKey,
        clcEncntrId: encounterId, 
        sdt: encounterSdt,
        probProcIndx: probProcIndx,
        probProc: selectedProbProcTermId, 
        dentalChartRemark: dentalChartData.remark,
        probProcDetail: probProcDetails,
        probProcTermDesc: selectedProbProc,
        dspTooth: dentalChartData.dspTooth,
        isProbHx: isProbHx?1:0,
        termStatus: termStatus,
        termKey: termKey,
        isReNew: isReNew
      };
      let params = {};

      if (toothQual.length > 0 && toothMapType ==="S"){
        if (toothToQual.length > 0){  
            let clcQlfListArr = [];
            //console.log("Dicky selected Tooth 1", toothQualVal[0]);
            //console.log("Dicky selected Tooth 2", toothToQualVal[0]);
            const clcQlfList = this.generateQlfList(toothQualVal[0], null, qualSelectedValue, "5", toothToQualVal[0]);
            clcQlfListArr.push(clcQlfList);

            if (selectedTeeth){
              params = {
                ...commonSaveProp,
                toothSel: [selectedTeeth[0].substring(0, 2)], 
                clcQlfList: clcQlfListArr,
                mapType: 'S',
                toothToSel: selectedTeeth[selectedTeeth.length-1].substring(0, 2)
              };
            }
            this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey, termDescDsp, codeTermId, probInd, index, termCncptId);

        } else if (surfaceQual.length > 0){
            // has tooth and surface
            
            let clcQlfListArr = [];
            let groupSelectedTeeth = [];
            let toothNoMissingSurface = [];
            
            if (selectedTeeth){
              selectedTeeth.forEach((item, index) => {
                if (item.length < 3){
                  toothNoMissingSurface.push(item.substring(0,2));
                } else{
                  const clcQlfList = this.generateQlfList(toothQualVal[index], surfaceQualVal[index], qualSelectedValue, "1");
                  console.log('Dicky tun2 ' + new Date());
                  let toothAdded = false;
                  clcQlfListArr.forEach((itemQlf) => {
                    if (clcQlfList[0] == itemQlf[0]){
                      toothAdded = true;
                      itemQlf.push(clcQlfList[1]);
                    }
                  });
                  if (toothAdded){
                    // do nothing;
                  } else{
                    clcQlfListArr.push(clcQlfList);
                    groupSelectedTeeth.push(item);
                  }
                }
              });

              if (toothNoMissingSurface.length > 0){
                let warnTooth = "";
                toothNoMissingSurface.forEach((item, index) => {
                  if (index == toothNoMissingSurface.length - 1){
                    warnTooth = warnTooth + item;
                  } else{
                    warnTooth = warnTooth + (item + ",");
                  }
                });
                //alert('Please select tooth surface for tooth no. ' + warnTooth);
                this.props.openCommonMessage({
                  msgCode: '130301',
                  params: [{ name: 'MESSAGE', value: 'Please select tooth surface for tooth no. ' + warnTooth }, { name: 'HEADER', value: 'Save Problem / Procedure' }]
                });
                return;
              }
              //console.log('Qual save 6' , clcQlfListArr);
              
              const selectedTeethNo = groupSelectedTeeth.map((selectedTooth) => (selectedTooth[0] + selectedTooth[1]));
              //const selectedTeethSurface = selectedTeeth.map((selectedTooth) => (selectedTooth[2]));
              
              params = {
                ...commonSaveProp,
                toothSel: selectedTeethNo, 
                clcQlfList: clcQlfListArr,
                mapType: 'S',
                toothToSel: null
              };
              this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey, termDescDsp, codeTermId, probInd, index, termCncptId);
            }
        } else{
            // has tooth but no surface
            let clcQlfListArr = [];
            if (selectedTeeth){
              selectedTeeth.forEach((item, index) => {
                const clcQlfList = this.generateQlfList(toothQualVal[index], surfaceQualVal[index], qualSelectedValue, "2");
                clcQlfListArr.push(clcQlfList);
              });

              //console.log('Qual save 6' , clcQlfListArr);
              
              const selectedTeethNo = selectedTeeth.map((selectedTooth) => (selectedTooth[0] + selectedTooth[1]));
              //const selectedTeethSurface = selectedTeeth.map((selectedTooth) => (selectedTooth[2]));

              params = {
                ...commonSaveProp,
                toothSel: selectedTeethNo, 
                clcQlfList: clcQlfListArr,
                mapType: 'S',
                toothToSel: null
              };
              this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey, termDescDsp, codeTermId, probInd, index, termCncptId);
            }
        }
      } else if (toothQual.length > 0 && toothMapType ==="M"){
        // has tooth and can select multiple
        // has tooth but no surface
          let clcQlfListArr = [];
          const clcQlfList = this.generateQlfList(toothQualVal, surfaceQualVal, qualSelectedValue, "3");
          clcQlfListArr.push(clcQlfList);

          //console.log('Qual save 61' , clcQlfListArr);
          if (selectedTeeth){
            const selectedTeethNo = selectedTeeth.map((selectedTooth) => (selectedTooth[0] + selectedTooth[1]));
            //const selectedTeethSurface = selectedTeeth.map((selectedTooth) => (selectedTooth[2]));

            params = {
              ...commonSaveProp,
              toothSel: selectedTeethNo, 
              clcQlfList: clcQlfListArr,
              mapType: 'M',
              toothToSel: null
            };
            this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey, termDescDsp, codeTermId, probInd, index, termCncptId);
          }
      } else{
          // no tooth
          let clcQlfListArr = [];
          const clcQlfList = this.generateQlfList(toothQualVal, surfaceQualVal, qualSelectedValue, "4");
          clcQlfListArr.push(clcQlfList);

          params = {
            ...commonSaveProp,
            toothSel: null, 
            clcQlfList: clcQlfListArr,
            mapType: 'M',
            toothToSel: null
          };
          
      }
      this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey, termDescDsp, codeTermId, probInd, index, termCncptId);
      
    }

    submitProbPRocQual = (params, encounterId, encounterSdt, patientKey, termDescDsp, codeTermId, probInd, index, termCncptId) => {
      //console.log('Dicky tun3 ' + new Date());
      this.props.saveProbProc(params, () => {
        //this.handleClose();
        //this.props.resetSelectedVal();
        //this.deselectAllFnc();
        const {saveResult, resetSelectedTeeth, resetSelectedVal, ...rest } = this.props;
        if (saveResult && saveResult.error != null && saveResult.error != ''){
          //alert('Please select tooth no.');

          if (saveResult.error.startsWith("DUP_PROC_W")){
            this.props.openCommonMessage({
              msgCode: '130302',
              params: [{ name: 'MESSAGE', value: params.probProcTermDesc + ': ' + this.getSystemErrorMessage(saveResult.error)}, { name: 'HEADER', value: 'Save Problem / Procedure' }],
              btnActions: {
                btn1Click: () => {
                  params.isCheckDup = true;
                  this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey, termDescDsp, codeTermId, probInd, index, termCncptId);
                },btn2Click: () => {
                  this.runCallBackAfterSubmit(encounterId, encounterSdt, patientKey, true);
                }
                }
            });
          } else{
            //console.log('Dicky tun3a ' + new Date() + saveResult.error);
            this.props.openCommonMessage({
              msgCode: '130301',
              params: [{ name: 'MESSAGE', value: params.probProcTermDesc + ': ' + this.getSystemErrorMessage(saveResult.error)}, { name: 'HEADER', value: 'Save Problem / Procedure' }]
            });
            this.runCallBackAfterSubmit(encounterId, encounterSdt, patientKey, true);
          }
        } else{
          this.runCallBackAfterSubmit(encounterId, encounterSdt, patientKey, false, termDescDsp, codeTermId, probInd, index, termCncptId);
        }
        
    });
    }

    runCallBackAfterSubmit = (encounterId, encounterSdt, patientKey, isRetFrErr, termDescDsp, codeTermId, probInd, index, termCncptId) => {
      //console.log('Dicky tun4 ' + new Date());
      const {carryTooth} = this.state;
      this.props.resetSelectedVal();
      if (!carryTooth){
        this.resetSelectedTeeth();
      }
      //console.log('AAABBB' + termDescDsp + codeTermId + probInd + termCncptId);
      if (typeof termCncptId != 'undefined'){
        this.handlePxPrMenuOnChange(null, termDescDsp, codeTermId, probInd);
        this.handleCmnTermChange(index, termCncptId, codeTermId, encounterSdt);
      }
      
      if (!isRetFrErr){
        this.props.getDentalChart(encounterId, encounterSdt);
        if (this.state.probProcIndx == 1){
          this.props.getProblemAndQualifier(
            {
              encntrId: encounterId,
              patientKey: patientKey
            });
        }
        if (this.state.probProcIndx == 2){
          this.props.getProceduresAndQualifiers(
            {
              encntrId: encounterId,
              patientKey: patientKey
            });
          }
        }
        //console.log('Dicky tun5 ' + new Date()); 
    }

    handleCmnTermChange = (newValue, newTermCncptId, newTermId, encounterSdt) => {
      this.setState({cmnTermIndx: newValue});
      this.props.getQualifier(newTermCncptId, encounterSdt);
      this.props.getProbProcAddDetails(newTermId);
    };

    submitQualifierForm = (termDescDsp, codeTermId, probInd, index, termCncptId, encounterSdt) => {
      //console.log('this.submitButton', this.submitButton);
      //console.log('this.submitForm', this.submitForm);
      let formValid = 0;
      if (typeof this.submitForm.props != 'undefined'){
        //console.log('this.submitButton2');
        formValid = this.submitForm.isFormValid(false);
        //console.log('this.submitButton3', formValid);
        formValid.then(result => {
          if (result) {
            this.handleOnSubmit("N", termDescDsp, codeTermId, probInd, index, termCncptId);
          }  
        });
      } else{
        if (typeof termCncptId != 'undefined'){
          this.handlePxPrMenuOnChange(null, termDescDsp, codeTermId, probInd);
          this.handleCmnTermChange(index, termCncptId, codeTermId, encounterSdt);
        }
      }
      //handlePxPrMenuOnChange(event, prob.termDescDsp, prob.codeTermId, "1");this.handleCmnTermChange(event, index, prob.termCncptId, prob.codeTermId, encounterSdt);

      //console.log('editQualifier', this.editQualifier);
      //this.editQualifier.formElement.submit();
    };

    setQualifierValue = (selectedRow) => {
        //console.log('Dicky selectedRow', selectedRow);
        let toothVal = '';
        let pushedTooth = [];
        this.setState({probProcDetails: selectedRow.remarks, termStatus:selectedRow.diagnosisStatusCd, isProbHx: selectedRow.dtsIsHistory});
        if (typeof selectedRow.diagnosisId != 'undefined'){
          //console.log('Dicky selectedRow2', selectedRow.diagnosisId);
          this.setState({termKey: selectedRow.diagnosisId});
          
        }
        if (typeof selectedRow.procedureId != 'undefined'){
          //console.log('Dicky selectedRow2', selectedRow.procedureId);
          this.setState({termKey: selectedRow.procedureId});
        }
        if (typeof selectedRow.isCurProb != 'undefined' && selectedRow.isCurProb == 'Y'){
          this.setState({isCurProb: 'Y'});
          
        }
        if (selectedRow.codQlfValDto1.length > 0 && selectedRow.codQlfValDto2.length > 0){
            if (selectedRow.codQlfValDto1[0].qlfCod == 'TOOTH' && selectedRow.codQlfValDto2[0].qlfCod == 'TOOTH_SURFACE'){
              selectedRow.codQlfValDto2.forEach((item) => {
                pushedTooth.push(selectedRow.codQlfValDto1[0].valDesc + item.valDesc);
              });
            }
            this.setState({selectedTeeth: pushedTooth});
        } else if (selectedRow.codQlfValDto1.length > 0){
          if (selectedRow.codQlfValDto1[0].qlfCod == 'TOOTH'){
            pushedTooth.push(selectedRow.codQlfValDto1[0].valDesc);
          }
          this.setState({selectedTeeth: pushedTooth});
        }

        // Qualifier 1
        if (selectedRow.codQlfValDto1.length > 0){
          if (selectedRow.codQlfValDto1[0].implmntType === 'L' && selectedRow.codQlfValDto1[0].mapType === 'M') {
            const mappedQlfVal = selectedRow.codQlfValDto1.map( item => {
              const { codQlfValId: value, ...rest } = item;
              return { value, ...rest };
             }
            );
            this.handleMulQualifierChange(mappedQlfVal, 1);
          } else if (selectedRow.codQlfValDto1[0].implmntType === 'L' && selectedRow.codQlfValDto1[0].mapType === 'S') {
            this.handleSinQualifierChange(selectedRow.codQlfValDto1[0].codQlfValId, 1);
          } else if (selectedRow.codQlfValDto1[0].implmntType === 'C'){
            this.handleChangeToogle(null, true, 1, selectedRow.codQlfValDto1[0].codQlfValId);
          }
        }
        // Qualifier 2
        if (selectedRow.codQlfValDto2.length > 0){
          if (selectedRow.codQlfValDto2[0].implmntType === 'L' && selectedRow.codQlfValDto2[0].mapType === 'M') {
            const mappedQlfVal = selectedRow.codQlfValDto2.map( item => {
              const { codQlfValId: value, ...rest } = item;
              return { value, ...rest };
             }
            );
            this.handleMulQualifierChange(mappedQlfVal, 2);
          } else if (selectedRow.codQlfValDto2[0].implmntType === 'L' && selectedRow.codQlfValDto2[0].mapType === 'S') {
            this.handleSinQualifierChange(selectedRow.codQlfValDto2[0].codQlfValId, 1);
          } else if (selectedRow.codQlfValDto2[0].implmntType === 'C'){
            this.handleChangeToogle(null, true, 2, selectedRow.codQlfValDto2[0].codQlfValId);
          }
        }
         // Qualifier 3
        if (selectedRow.codQlfValDto3.length > 0){
          if (selectedRow.codQlfValDto3[0].implmntType === 'L' && selectedRow.codQlfValDto3[0].mapType === 'M') {
            const mappedQlfVal = selectedRow.codQlfValDto3.map( item => {
              const { codQlfValId: value, ...rest } = item;
              return { value, ...rest };
             }
            );
            this.handleMulQualifierChange(mappedQlfVal, 3);
          } else if (selectedRow.codQlfValDto3[0].implmntType === 'L' && selectedRow.codQlfValDto3[0].mapType === 'S') {
            this.handleSinQualifierChange(selectedRow.codQlfValDto3[0].codQlfValId, 3);
          } else if (selectedRow.codQlfValDto3[0].implmntType === 'C'){
            this.handleChangeToogle(null, true, 3, selectedRow.codQlfValDto3[0].codQlfValId);
          }
        }
         // Qualifier 4
        if (selectedRow.codQlfValDto4.length > 0){
          if (selectedRow.codQlfValDto4[0].implmntType === 'L' && selectedRow.codQlfValDto4[0].mapType === 'M') {
            const mappedQlfVal = selectedRow.codQlfValDto4.map( item => {
              const { codQlfValId: value, ...rest } = item;
              return { value, ...rest };
             }
            );
            this.handleMulQualifierChange(mappedQlfVal, 4);
          } else if (selectedRow.codQlfValDto4[0].implmntType === 'L' && selectedRow.codQlfValDto4[0].mapType === 'S') {
            this.handleSinQualifierChange(selectedRow.codQlfValDto4[0].codQlfValId, 4);
          } else if (selectedRow.codQlfValDto4[0].implmntType === 'C'){
            this.handleChangeToogle(null, true, 4, selectedRow.codQlfValDto4[0].codQlfValId);
          }
        }
         // Qualifier 5
        if (selectedRow.codQlfValDto5.length > 0){
          if (selectedRow.codQlfValDto5[0].implmntType === 'L' && selectedRow.codQlfValDto5[0].mapType === 'M') {
            const mappedQlfVal = selectedRow.codQlfValDto5.map( item => {
              const { codQlfValId: value, ...rest } = item;
              return { value, ...rest };
             }
            );
            this.handleMulQualifierChange(mappedQlfVal, 5);
          } else if (selectedRow.codQlfValDto5[0].implmntType === 'L' && selectedRow.codQlfValDto5[0].mapType === 'S') {
            this.handleSinQualifierChange(selectedRow.codQlfValDto5[0].codQlfValId, 5);
          } else if (selectedRow.codQlfValDto5[0].implmntType === 'C'){
            this.handleChangeToogle(null, true, 5, selectedRow.codQlfValDto5[0].codQlfValId);
          }
        }
        // Qualifier 6
        if (selectedRow.codQlfValDto6.length > 0){
          if (selectedRow.codQlfValDto6[0].implmntType === 'L' && selectedRow.codQlfValDto6[0].mapType === 'M') {
            const mappedQlfVal = selectedRow.codQlfValDto6.map( item => {
              const { codQlfValId: value, ...rest } = item;
              return { value, ...rest };
             }
            );
            this.handleMulQualifierChange(mappedQlfVal, 6);
          } else if (selectedRow.codQlfValDto6[0].implmntType === 'L' && selectedRow.codQlfValDto6[0].mapType === 'S') {
            this.handleSinQualifierChange(selectedRow.codQlfValDto6[0].codQlfValId, 6);
          } else if (selectedRow.codQlfValDto6[0].implmntType === 'C'){
            this.handleChangeToogle(null, true, 1, selectedRow.codQlfValDto6[0].codQlfValId);
          }
        }
    }

    render(){
        const { classes, ...rest } = this.props;
        let multiSel = this.state.multiSel;
        let selectedProbProc = this.state.selectedProbProc;
        let selectedProbProcTermId = this.state.selectedProbProcTermId;
        let selectedTeeth = this.state.selectedTeeth;
        //let selectedTeethSurface = this.state.selectedTeethSurface;
        /*
        let multiSel1 = this.state.multiSel1;
        let multiSel2 = this.state.multiSel2;
        let multiSel3 = this.state.multiSel3;
        let multiSel4 = this.state.multiSel4;
        let multiSel5 = this.state.multiSel5;
        let multiSel6 = this.state.multiSel6;
        let singleSel1 = this.state.singleSel1;
        let singleSel2 = this.state.singleSel2;
        let singleSel3 = this.state.singleSel3;
        let singleSel4 = this.state.singleSel4;
        let singleSel5 = this.state.singleSel5;
        let singleSel6 = this.state.singleSel6;
        let toogleChecked1 = this.state.toogleChecked1;
        let toogleChecked2 = this.state.toogleChecked2;
        let toogleChecked3 = this.state.toogleChecked3;
        let toogleChecked4 = this.state.toogleChecked4;
        let toogleChecked5 = this.state.toogleChecked5;
        let toogleChecked6 = this.state.toogleChecked6;
        */
        let qualSelectedValue = {multiSel1: this.state.multiSel1,
          multiSel2: this.state.multiSel2,
          multiSel3: this.state.multiSel3,
          multiSel4: this.state.multiSel4,
          multiSel5: this.state.multiSel5,
          multiSel6: this.state.multiSel6,
          singleSel1: this.state.singleSel1,
          singleSel2: this.state.singleSel2,
          singleSel3: this.state.singleSel3,
          singleSel4: this.state.singleSel4,
          singleSel5: this.state.singleSel5,
          singleSel6: this.state.singleSel6,
          toogleChecked1: this.state.toogleChecked1,
          toogleChecked2: this.state.toogleChecked2,
          toogleChecked3: this.state.toogleChecked3,
          toogleChecked4: this.state.toogleChecked4,
          toogleChecked5: this.state.toogleChecked5,
          toogleChecked6: this.state.toogleChecked6};

        let isMenuChange = this.state.isMenuChange;
        let probProcDetails = this.state.probProcDetails;
        let isProbHx = this.state.isProbHx;
        let termStatus = this.state.termStatus;
        let patientKey = this.state.patientKey;
        let encounterId = this.state.encounterId;
        let encounterSdt = this.state.encounterSdt;
        /*
        if (isMenuChange) {
          multiSel = [];
            multiSel1 = [];
            multiSel2 = [];
            multiSel3 = [];
            multiSel4 = [];
            multiSel5 = [];
            multiSel6 = [];
            singleSel1 = null;
            singleSel2 = null;
            singleSel3 = null;
            singleSel4 = null;
            singleSel5 = null;
            singleSel6 = null;
            toogleChecked1 = null;
            toogleChecked2 = null;
            toogleChecked3 = null;
            toogleChecked4 = null;
            toogleChecked5 = null;
            toogleChecked6 = null;
        }
        */

        return(
              <Grid container className={classes.root} style={{ overflowY: 'hidden', overflowX: 'hidden' }}>
                <Grid item key="pxprMenu" xs={2}>
                  <DtsPxPrMenu encounterSdt={encounterSdt} isMenuChange={isMenuChange} handlePxPrMenuOnChange={this.handlePxPrMenuOnChange} setDefaultProbHx={this.setDefaultProbHx}
                      submitQualifierForm={this.submitQualifierForm} handleCmnTermIndxOnChange={this.handleCmnTermIndxOnChange} cmnTermIndx={this.state.cmnTermIndx}/>
                </Grid>
                <Grid item key="pxprEdit" xs={5}>

                  <DtsDentalChart2 encounterId={encounterId} encounterSdt={encounterSdt} selectedTeeth={selectedTeeth}
                      handleTeethSelectChange={this.handleTeethSelectChange} handleSurfaceSelectChange={this.handleSurfaceSelectChange} 
                      handleIsPermanentOnChange={this.handleIsPermanentOnChange} handleIsPrimaryOnChange={this.handleIsPrimaryOnChange} isPermanentTeeth={this.state.isPermanentTeeth} isPrimaryTeeth={this.state.isPrimaryTeeth} carryTooth={this.state.carryTooth} 
                  />
                  <DtsEditQualifierFields patientKey={patientKey} encounterId={encounterId} encounterSdt={encounterSdt} selectedTeeth={selectedTeeth} selectedProbProc={selectedProbProc} selectedProbProcTermId={selectedProbProcTermId}
                      qualSelectedValue={qualSelectedValue} probProcDetails={probProcDetails} isProbHx={isProbHx} termStatus={termStatus} 
                      handleProbProcDetailsChange={this.handleProbProcDetailsChange} handleIsProbHxOnChange={this.handleIsProbHxOnChange} setDefaultProbHx={this.setDefaultProbHx} handleStatusOnChange={this.handleStatusOnChange} 
                      handleSinQualifierChange={this.handleSinQualifierChange} handleMulQualifierChange={this.handleMulQualifierChange} handleChangeToogle={this.handleChangeToogle} probProcIndx={this.state.probProcIndx} resetSelectedTeeth={this.resetSelectedTeeth}
                      isPermanentTeeth={this.state.isPermanentTeeth} isPrimaryTeeth={this.state.isPrimaryTeeth} carryTooth={this.state.carryTooth} handleCarrytoothOnChange={this.handleCarrytoothOnChange} 
                      submitButton={el => this.submitButton = el} submitForm={el => this.submitForm = el} handleOnSubmit={this.handleOnSubmit} submitQualifierForm={this.submitQualifierForm} termKey={this.state.termKey} isCurProb={this.state.isCurProb}
                  />
                </Grid>
                <Grid item key="pxprList" xs={5}>
                      <Grid container  >
                        <Grid item key="problem" xs={12} style={{minHeight: '450px', maxHeight: '450px', overflowY: 'auto', overflowX: 'hidden'}}>
                            <CIMSMultiTabs
                                value={this.state.value}
                                onChange={this.handleChange}
                            >
                            <CIMSMultiTab disableClose label="Existing Problem" />
                            <CIMSMultiTab disableClose label="New Problem (Send to History)" />
                            <CIMSMultiTab disableClose label="Treatment Plan" />
                            </CIMSMultiTabs>

                            {this.state.value === 0 && (
                              <Box component="div" p={1} m={1}  classes={classes.listRoot}>
                                {/*<Box component="div" display="inline"   style={{ display: "inline-block", height : "100%", verticalAlign: 'top'  }} p={1} m={1} >*/}
                                <DtsProbProcExistProbTreat handlePxPrMenuOnChange={this.handlePxPrMenuOnChange} handleCmnTermChange={this.handleCmnTermChange} setQualifierValue={this.setQualifierValue} encounterSdt={encounterSdt}/>
                              {/*<DtsListProblems_paging/>*/}
                                </Box>
                              )}
                              {this.state.value === 1 && (
                                <Box component="div" p={1} m={1} classes={classes.listRoot}>
                                <DtsProbProcNewHistProb handlePxPrMenuOnChange={this.handlePxPrMenuOnChange} handleCmnTermChange={this.handleCmnTermChange} setQualifierValue={this.setQualifierValue} encounterSdt={encounterSdt}/>
                                </Box>
                              )}

                              {this.state.value === 2 && (
                                <Box component="div" p={0} m={1}>
                                  <CardMedia component="img" class={useChartStyles.treamentPlan}  image={TreatmentPlanTable}/>
                                </Box>
                              )}
                        </Grid>
                        <Grid item key="procedure" xs={12} style={{minHeight: 'calc(100vh - 690px)', maxHeight: 'calc(100vh - 690px)', overflowY: 'auto', overflowX: 'hidden'}}>
                            <Box component="div" p={1} m={1} >
                            <Typography className={classes.title} variant="h6" id="tableTitle" component="div" gutterBottom>
                                New Procedures
                              </Typography>
                              <DtsProbProcProcedures handlePxPrMenuOnChange={this.handlePxPrMenuOnChange} handleCmnTermChange={this.handleCmnTermChange} setQualifierValue={this.setQualifierValue} encounterSdt={encounterSdt}/>
                            </Box>
                        </Grid>
                    </Grid>

                  </Grid>
              </Grid>
        );
    }

}

const mapStateToProps = (state) => {
    return {
      dentalChartList: state.dtsDentalChart.dentalChartList,
      dentalChartData: state.dtsDentalChart.dentalChartData,
      qualifierList: state.dtsProbProc.qualifierList,
      saveResult: state.dtsProbProc.saveResult
    };
};

const mapDispatchToProps = {
  updateCurTab,
  openCommonMessage,
  setRemark,
  saveProbProc,
  resetSelectedVal,
  getDentalChart,
  getProblemAndQualifier,
  getProceduresAndQualifiers,
  getQualifier,
  getProbProcAddDetails
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EditProbProcedure));
