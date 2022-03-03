import React, { Component, useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import {fade, makeStyles, withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';

import {Box,Card, CardHeader, CardContent, CardActions, Grid} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputBase from '@material-ui/core/InputBase';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
//import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import  Button from '@material-ui/core/Button';
import  Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import Typography from '@material-ui/core/Typography';
import FormHelperText from '@material-ui/core/FormHelperText';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import accessRightEnum from '../../../../enums/accessRightEnum';
import { deleteSubTabsByOtherWay, updateCurTab } from '../../../../store/actions/mainFrame/mainFrameAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import SelectFieldValidator from '../../../../components/FormValidator/SelectFieldValidator';
import RequiredIcon from '../../../../components/InputLabel/RequiredIcon';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import DtsMultipleSelect from '../../components/DtsMultipleSelect';
import { getCommonUsedProbProc, getQualifier, resetSelectedVal, resetAll, saveProbProc, deleteProbProc} from '../../../../store/actions/dts/clinicalContent/problemProcedureAction';
import { getDentalChart} from '../../../../store/actions/dts/clinicalContent/DtsDentalChartAction';
import ValidatorEnum from '../../../../enums/validatorEnum';
import CommonMessage from '../../../../constants/commonMessage';
import CIMSCheckBox from 'components/CheckBox/CIMSCheckBox';
import {
  getProblemAndQualifier,
  getProceduresAndQualifiers
} from '../../../../store/actions/dts/clinicalContent/encounterAction';

const styles = (theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 150
  },
  selectEmpty: {
    marginTop: theme.spacing(2)
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%'

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
   // height : '100%',
   overflow: 'auto'
  },
    fdiToothLabel:{
        //width: '100%',
        display: 'inline-block',
        fontSize: 16,
        marginTop:10,
        color: 'darkgreen'
        //fontFamily: 'Microsoft JhengHei, Calibri'
    }
});

const qualifer1 = [
   { value : '' , label : '' },
   { value : 10 , label : 'Instrumentation completed - with stainless stell and NiTi Rotary files' },
   { value : 11 , label : 'Other medicaments or dressing materials (Please specify in the "Details" box)' }

 ];

 const qualifer1a = [
  { value : '' , label : '' },
  { value : 10 , label : 'Instrumentation completed - with stainless stell and NiTi Rotary files' },
  { value : 11 , label : 'Other medicaments or dressing materials (Please specify in the "Details" box)' }

];

const qualifer2 = [
   { value : '' , label : '' },
   { value : 10 , label : 'Sodium chlorite 0.9% sterile irrigation' },
   { value : 11 , label : 'Other irrigation (Please specify in the "Details" box)' }

 ];

const qualifer3 = [
   { value : '' , label : '' },
   { value : 10 , label : 'Calcium hydroxide paste - non-setting (e.g Hypocal)' },
   { value : 11 , label : 'Other medicaments or dressing materials (Please specify in the "Details" box)' }

 ];

const qualifer4 = [
   { value : '' , label : '' },
   { value : 10 , label : 'Infiltration - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)' },
   { value : 11 , label : 'Infiltration - Mepivacaine hydrochloride 3%' },
   { value : 12 , label : 'ID Block - Lignocaine (lidocaine) hydrochloride 2% + adrenaline (epinephrine)' }
 ];

 const probStatusOptions = [
  { value: 'A', label: 'Active' },
  { value: 'P', label: 'Provisional' },
  { value: 'I', label: 'Inactive' },
  { value: 'R', label: 'Resolved' },
  { value: 'C', label: 'Cancelled' }
];

const procStatusOptions = [
  { value: 'C', label: 'Completed' },
  { value: 'I', label: 'Incompleted' },
  { value: 'O', label: 'Others' }
];

class DtsEditQualifierFields extends Component {
    constructor(props){
        super(props);

        this.state = {

          age:'',
          name: 'hai',
          labelWidth: 0,
          details: null,
          fdiToothNo: [12, 11, 20],
          selectedQualifier1: null,
          selectedQualifier1a: null,
          selectedMulQualifier: [],
          selectedQualifier2: null,
          selectedQualifier3: null,
          selectedQualifier4: null,
          supernumerary: false,
          edit: false

        };

        this.options = {
          probStatus : probStatusOptions,
          procStatus : procStatusOptions
        };

        //this._assignFormRef = (formElement) => {
        //  this.formElement = formElement;
        //};
        this.formElement=React.createRef();
    }

    handleChange = (name, event) => {
      this.setState({name: event.target.value});
      this.setState({edit:true});

    }

    onFDIToothChange = (event, value) => {

      this.setState({fdiToothNo: value});
      this.setState({edit:true});
    }


    doClose = (callback) => {
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
    }

    getValidator = (name) => {
        let validators = [];
        if (name === 'qualifier1Selector') {
            validators.push('required');
            return validators;
        }
         if (name === 'idSelector') {
            validators.push('required');
            return validators;
        }
        if (name === 'CariesSelector') {
            validators.push('required');
            return validators;
        }
        if (name === 'PerioSelector') {
            validators.push('required');
            return validators;
        }

    }
    
    /*
    getErrorMessage = (name) => {
        let errorMessages = [];
        if (name === 'qualifier1Selector') {
            errorMessages.push('Qualifier 1 cannot be null');
            return errorMessages;
        }
         if (name === 'idSelector') {
            errorMessages.push('ID cannot be null');
            return errorMessages;
      }
         if (name === 'CariesSelector') {
            errorMessages.push('Caries cannot be null');
            return errorMessages;
        }
         if (name === 'PerioSelector') {
            errorMessages.push('Perio cannot be null');
            return errorMessages;
        }

    }
    */
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

    getSelectedFDIToothNo =() =>{

        let selectedFDIToothNo = '';

        let tempArray = this.state.fdiToothNo;

        if(Array.isArray(tempArray)){

            for(let i = 0; i < tempArray.length; i++){

                selectedFDIToothNo += tempArray[i] + ', ';
          }

        }

        if(selectedFDIToothNo.endsWith(', ')){
          selectedFDIToothNo = selectedFDIToothNo.slice(0, -2) + '';
        }
        return selectedFDIToothNo;
    }

    displayTeethSurface = (selectedTeeth, qualifierList) => {

      //let selectedTeeth
      const sortedSelected = selectedTeeth.sort((a,b) =>  {
        return a.localeCompare(b);
      });

      const surfaceQual = qualifierList.filter(i => (i.qlfCod === 'TOOTH_SURFACE' || i.qlfCod === 'ROOT_SURFACE'));
      const toothToQual = qualifierList.filter(i => (i.qlfCod === 'TOOTH_TO'));
      let displayResult = '';
      let displayResultItem = [];
      if (toothToQual.length > 0){
        // with tooth_to
        sortedSelected.forEach((item, index, array) => {
          if (index == 0){
            displayResult = displayResult + item.substring(0,2); 
          } else if (index == sortedSelected.length - 1){
            displayResult = displayResult + (" to " + item.substring(0,2));
          } else{
            // do nothing
          }
        });
        displayResultItem.push(<span>{displayResult}</span>);
      } else if (surfaceQual.length > 0){
        sortedSelected.forEach((item, index, array) => {
          if (index == 0){
            //displayResult = displayResult + item; 
            if (item.length < 3){
              displayResultItem.push(<span style={{color:'red'}}>{item}</span>);
            } else{
              displayResultItem.push(<span>{item}</span>);
            }
          } else if (item.substring(0,2) === array[index-1].substring(0,2)){
            //displayResult = displayResult + item.substring(2,3);
            displayResultItem.push(<span>{item.substring(2,3)}</span>);
          } else{
            //displayResult = displayResult + ("," + item);
            if (item.length < 3){
              displayResultItem.push(<span>,</span>);
              displayResultItem.push(<span style={{color:'red'}}>{item}</span>);
            } else{
              displayResultItem.push(<span>,{item}</span>);
            }
          }
          
        }); 
      } else{
        sortedSelected.forEach((item, index, array) => {
          if (index == 0){
            displayResult = displayResult + item.substring(0,2); 
          } else if (item.substring(0,2) === array[index-1].substring(0,2)){
            // do nothing
          } else{
            displayResult = displayResult + ("," + item.substring(0,2)); 
          }      
        });
        displayResultItem.push(<span>{displayResult}</span>);
      }
      //return displayResult;
      return (<span>{displayResultItem}</span>);

  }


    handleDelete =() =>{
      const {resetSelectedTeeth, resetSelectedVal, carryTooth, encounterId, encounterSdt, termKey, patientKey, probProcIndx} = this.props;
      if (termKey != null && termKey != ''){
        this.props.deleteProbProc(termKey, probProcIndx, () => {
          if (probProcIndx == 1){
            this.props.getProblemAndQualifier(
              {
                encntrId: encounterId,
                patientKey: patientKey
              });
          }
          if (probProcIndx == 2){
            this.props.getProceduresAndQualifiers(
              {
                encntrId: encounterId,
                patientKey: patientKey
              });
            }
        });
        this.props.getDentalChart(encounterId, encounterSdt);
      } 
      resetSelectedVal();
      if (!carryTooth){
        resetSelectedTeeth();
      }
      
      
    }
    /*
    generateQlfList = (toothQualVal, surfaceQualVal, qualSelectedValue, qlfCase, toothToQual) => {
      const clcQlfList = [];
     
      if (qlfCase == "1"){
        clcQlfList.push(toothQualVal[0].codQlfValId);
        clcQlfList.push(surfaceQualVal[0].codQlfValId);
      } else if (qlfCase == "2"){
        clcQlfList.push(toothQualVal[0].codQlfValId);
        if (qualSelectedValue.multiSel2.length>0){
          qualSelectedValue.multiSel2.forEach(item => {
            clcQlfList.push(item.codQlfValId);
          });
        } else if (qualSelectedValue.toogleChecked2!=''){
          clcQlfList.push(qualSelectedValue.toogleChecked2.codQlfValId);
        } else if (qualSelectedValue.singleSel2!=null){
          clcQlfList.push(qualSelectedValue.singleSel.codQlfValId);
        }
      } else if (qlfCase == "3"){
        toothQualVal.forEach(item => {
          clcQlfList.push(item[0].codQlfValId);
        });

        if (qualSelectedValue.multiSel2.length>0){
          qualSelectedValue.multiSel2.forEach(item => {
            clcQlfList.push(item.codQlfValId);
          });
        } else if (qualSelectedValue.toogleChecked2!=''){
          clcQlfList.push(qualSelectedValue.toogleChecked2.codQlfValId);
        } else if (qualSelectedValue.singleSel2!=null){
          clcQlfList.push(qualSelectedValue.singleSel2.codQlfValId);
        }
      } else if (qlfCase == "4"){
        if (qualSelectedValue.multiSel1.length>0){
          qualSelectedValue.multiSel1.forEach(item => {
            clcQlfList.push(item.codQlfValId);
          });
        } else if (qualSelectedValue.toogleChecked1!=''){
          clcQlfList.push(qualSelectedValue.toogleChecked1.codQlfValId);
        } else if (qualSelectedValue.singleSel1!=null){
          clcQlfList.push(qualSelectedValue.singleSel1.codQlfValId);
        }
        if (qualSelectedValue.multiSel2.length>0){
          qualSelectedValue.multiSel2.forEach(item => {
            clcQlfList.push(item.codQlfValId);
          });
        } else if (qualSelectedValue.toogleChecked2!=''){
          clcQlfList.push(qualSelectedValue.toogleChecked2.codQlfValId);
        } else if (qualSelectedValue.singleSel2!=null){
          clcQlfList.push(qualSelectedValue.singleSel2.codQlfValId);
        }
      } else if (qlfCase == "5"){
        clcQlfList.push(toothQualVal[0].codQlfValId);
        clcQlfList.push(toothToQual[0].codQlfValId);
      }

      if (qualSelectedValue.multiSel3.length>0){
        qualSelectedValue.multiSel3.forEach(item => {
          clcQlfList.push(item.codQlfValId);
        });
      } else if (qualSelectedValue.toogleChecked3!=''){
        clcQlfList.push(qualSelectedValue.toogleChecked3.codQlfValId);
      } else if (qualSelectedValue.singleSel3!=null){
        clcQlfList.push(qualSelectedValue.singleSel3.codQlfValId);
      }
      if (qualSelectedValue.multiSel4.length>0){
        qualSelectedValue.multiSel4.forEach(item => {
          clcQlfList.push(item.codQlfValId);
        });
      } else if (qualSelectedValue.toogleChecked4!=''){
        clcQlfList.push(qualSelectedValue.toogleChecked4.codQlfValId);
      } else if (qualSelectedValue.singleSel4!=null){
        clcQlfList.push(qualSelectedValue.singleSel4.codQlfValId);
      }
      if (qualSelectedValue.multiSel5.length>0){
        qualSelectedValue.multiSel5.forEach(item => {
          clcQlfList.push(item.codQlfValId);
        });
      } else if (qualSelectedValue.toogleChecked5!=''){
        clcQlfList.push(qualSelectedValue.toogleChecked5.codQlfValId);
      } else if (qualSelectedValue.singleSel5!=null){
        clcQlfList.push(qualSelectedValue.singleSel5.codQlfValId);
      }
      if (qualSelectedValue.multiSel6.length>0){
        qualSelectedValue.multiSel6.forEach(item => {
          clcQlfList.push(item.codQlfValId);
        });
      } else if (qualSelectedValue.toogleChecked6!=''){
        clcQlfList.push(qualSelectedValue.toogleChecked6.codQlfValId);
      } else if (qualSelectedValue.singleSel6!=null){
        clcQlfList.push(qualSelectedValue.singleSel6.codQlfValId);
      }
      return clcQlfList;
    }
    */
    /*
    handleOnSubmit = () => {
      const { selectedTeeth, qualifierList, qualSelectedValue, selectedProbProcTermId, probProcIndx, selectedProbProc, probProcDetails, isProbHx, termStatus, patientKey, encounterId, encounterSdt, isPrimaryTeeth, dentalChartList, dentalChartData} = this.props;
      //console.log("Qual save", selectedTeeth);
      //console.log("Qual save 2", qualSelectedValue);
      const toothQual = qualifierList.filter(i => i.qlfCod === 'TOOTH');
      const surfaceQual = qualifierList.filter(i => (i.qlfCod === 'TOOTH_SURFACE' || i.qlfCod === 'ROOT_SURFACE'));
      const toothToQual = qualifierList.filter(i => (i.qlfCod === 'TOOTH_TO'));
      let toothQualVal = [];
      let surfaceQualVal = [];
      let toothToQualVal = [];
      let toothMapType = "S";
      //console.log("Qual save 2a", toothQual);
      if (toothToQual.length > 0){
        if (selectedTeeth){
          toothQualVal.push(toothQual[0].codQlfValList.filter(i => i.valDesc === selectedTeeth[0].substring(0,2)));
          toothToQualVal.push(toothToQual[0].codQlfValList.filter(i => i.valDesc === selectedTeeth[selectedTeeth.length-1].substring(0,2)));
        }
        //console.log("Dicky Tooth", toothQualVal);
        //console.log("Dicky Tooth to", toothToQualVal);
      } else{
        if (toothQual.length > 0){
          //console.log("Qual save 2b", toothQual[0].codQlfValList);
          toothMapType = toothQual[0].mapType;
          selectedTeeth.forEach(item => {
            toothQualVal.push(toothQual[0].codQlfValList.filter(i => i.valDesc === item.substring(0,2)));
          });
        }
        //console.log("Qual save 3a", surfaceQual);
        if (surfaceQual.length > 0){
          //console.log("Qual save 3b", surfaceQual[0].codQlfValList);
          selectedTeeth.forEach(item => {
            if (item.length > 2){
              surfaceQualVal.push(surfaceQual[0].codQlfValList.filter(i => i.valDesc === item.substring(2,3)));
            } else{
              surfaceQualVal.push(null);
            }
          });
        }
      }
      //console.log("Qual save 4", toothQualVal);

      // check input tooth
      if (toothQual.length > 0 && selectedTeeth.length == 0 ){
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
        termStatus: termStatus
      };
      let params = {};

      if (toothQual.length > 0 && toothMapType ==="S"){
        if (toothToQual.length > 0){  
            let clcQlfListArr = [];
            //console.log("Dicky selected Tooth 1", toothQualVal[0]);
            //console.log("Dicky selected Tooth 2", toothToQualVal[0]);
            const clcQlfList = this.generateQlfList(toothQualVal[0], null, qualSelectedValue, "5", toothToQualVal[0]);
            clcQlfListArr.push(clcQlfList);

            params = {
              ...commonSaveProp,
              toothSel: [selectedTeeth[0].substring(0, 2)], 
              clcQlfList: clcQlfListArr,
              mapType: 'S',
              toothToSel: selectedTeeth[selectedTeeth.length-1].substring(0, 2)
            };

            this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey);

        } else if (surfaceQual.length > 0){
            // has tooth and surface
            
            let clcQlfListArr = [];
            let groupSelectedTeeth = [];
            let toothNoMissingSurface = [];
            selectedTeeth.forEach((item, index) => {
              if (item.length < 3){
                toothNoMissingSurface.push(item.substring(0,2));
              } else{
                const clcQlfList = this.generateQlfList(toothQualVal[index], surfaceQualVal[index], qualSelectedValue, "1");
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
            this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey);
        
        } else{
            // has tooth but no surface
            let clcQlfListArr = [];
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
            this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey);
        }
      } else if (toothQual.length > 0 && toothMapType ==="M"){
        // has tooth and can select multiple
        // has tooth but no surface
          let clcQlfListArr = [];
          const clcQlfList = this.generateQlfList(toothQualVal, surfaceQualVal, qualSelectedValue, "3");
          clcQlfListArr.push(clcQlfList);

          //console.log('Qual save 61' , clcQlfListArr);
          
          const selectedTeethNo = selectedTeeth.map((selectedTooth) => (selectedTooth[0] + selectedTooth[1]));
          //const selectedTeethSurface = selectedTeeth.map((selectedTooth) => (selectedTooth[2]));

          params = {
            ...commonSaveProp,
            toothSel: selectedTeethNo, 
            clcQlfList: clcQlfListArr,
            mapType: 'M',
             toothToSel: null
          };
          this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey);
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
      this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey);
      
    }
    */
    /*
    submitProbPRocQual = (params, encounterId, encounterSdt, patientKey) => {
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
                  this.submitProbPRocQual(params, encounterId, encounterSdt, patientKey);
                },btn2Click: () => {
                  this.runCallBackAfterSubmit(encounterId, encounterSdt, patientKey);
                }
                }
            });
          } else{
            this.props.openCommonMessage({
              msgCode: '130301',
              params: [{ name: 'MESSAGE', value: params.probProcTermDesc + ': ' + this.getSystemErrorMessage(saveResult.error)}, { name: 'HEADER', value: 'Save Problem / Procedure' }]
            });
            this.runCallBackAfterSubmit(encounterId, encounterSdt, patientKey);
          }
        } else{
          this.runCallBackAfterSubmit(encounterId, encounterSdt, patientKey);
        }
        
    });
    }
    */
    /*
    runCallBackAfterSubmit = (encounterId, encounterSdt, patientKey) => {
      const {resetSelectedTeeth, resetSelectedVal, carryTooth} = this.props;
      resetSelectedVal();
      if (!carryTooth){
        resetSelectedTeeth();
      }
      this.props.getDentalChart(encounterId, encounterSdt);
      this.props.getProblemAndQualifier(
        {
          encntrId: encounterId,
          patientKey: patientKey
        });
      this.props.getProceduresAndQualifiers(
        {
          encntrId: encounterId,
          patientKey: patientKey
        });
    }
    */
    getQualifierElement = (qualifierList, qualSeq, selectedTeeth) => {
      
      const { classes } = this.props;
      const {handleMulQualifierChange, handleSinQualifierChange, handleChangeToogle, qualSelectedValue} = this.props;
      /*
      if (qualifierList.implmntType === 'text' || qualifierList.implmntType === 'email') {
        return (
          <React.Fragment>
            {' '}
            {qualifierList.qlfDesc + ': '}
            <TextField variant="outlined" label={qualifierList.qlfDesc} />{' '}
          </React.Fragment>
        );
      }
      */

      if (qualifierList.qlfCod === 'TOOTH') {
        return (
          <React.Fragment>
            <FormGroup row style={{ width: '100%' }}>
            <label className={classes.fdiToothLabel}><label>*FDI Tooth No.: </label> {selectedTeeth}</label>
          </FormGroup>
         </React.Fragment>
        );
      } else if (qualifierList.qlfCod === 'TOOTH_TO' || qualifierList.qlfCod === 'TOOTH_SURFACE' || qualifierList.qlfCod === 'ROOT_SURFACE') {
        //do nothing
      } else{
        if (qualifierList.implmntType === 'C') {
          return (
            <React.Fragment>
              <FormGroup row style={{ width: '100%' }}>
                <FormControlLabel
                    control={
                    <Switch
                        checked={qualSeq==1?qualSelectedValue.toogleChecked1:qualSeq==2?qualSelectedValue.toogleChecked2:qualSeq==3?qualSelectedValue.toogleChecked3:qualSeq==4?qualSelectedValue.toogleChecked4:qualSeq==5?qualSelectedValue.toogleChecked5:qualSelectedValue.toogleChecked6}
                        color="primary"
                        isRequired={qualifierList.isMandatory==1}
                        name={qualifierList.qlfDesc}
                        onChange={(el, state) => handleChangeToogle(el, state, qualSeq==1?1:qualSeq==2?2:qualSeq==3?3:qualSeq==4?4:qualSeq==5?5:6, qualifierList && qualifierList.codQlfValList[0].codQlfValId)}
                    />
                  }
                    label={qualifierList.qlfDesc}
                />
              </FormGroup>
            </React.Fragment>
          );
        }
    
        if (qualifierList.implmntType === 'L' && qualifierList.mapType === 'M') {
            let selectedMulQualifier = this.state.selectedMulQualifier;
            //console.log("qualSelectedValue:", qualSelectedValue);

              return (
                <React.Fragment>
                  <FormGroup row style={{ width: '100%' }}>
                    <FormControl required={qualifierList.isMandatory==1} className={classes.formControl}  style={{ width: '100%' }} variant="outlined"  size="small">
                    
                    <SelectFieldValidator
                        id={`${qualifierList.codQlfId}_QualSelectMultiple`}
                        isDisabled={false}
                        isRequired={qualifierList.isMandatory==1}
                        // value={selectedMulQualifier}
                        value={qualSeq==1?qualSelectedValue.multiSel1:qualSeq==2?qualSelectedValue.multiSel2:qualSeq==3?qualSelectedValue.multiSel3:qualSeq==4?qualSelectedValue.multiSel4:qualSeq==5?qualSelectedValue.multiSel5:qualSelectedValue.multiSel6}
                        label={qualifierList.qlfDesc}
                        TextFieldProps={{
                          variant: 'outlined',
                          label: <>{qualifierList.qlfDesc} {qualifierList.isMandatory == 1 ? <RequiredIcon /> : null}</>
                        }}
                        msgPosition="bottom"
                        hideSelectedOptions={false}
                        closeMenuOnSelect={false}
                        isMulti
                        addAllOption
                        style={{width: '100%'}}
                        options={qualifierList && qualifierList.codQlfValList.map((item) => ({value:item.codQlfValId, label:item.valDesc}))}
                        //onChange={this.handleMulQualifierChange}
                        onChange={e => handleMulQualifierChange(e, qualSeq==1?1:qualSeq==2?2:qualSeq==3?3:qualSeq==4?4:qualSeq==5?5:6, qualifierList && qualifierList.codQlfValList)}
                        validators={qualifierList.isMandatory==1 ? [ValidatorEnum.required] : null}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                    />
    
                  </FormControl>
                </FormGroup>
                </React.Fragment>
              );
        }
    
        if (qualifierList.implmntType === 'L' && qualifierList.mapType === 'S') {
          return (
            <React.Fragment>
              <FormGroup row style={{ width: '100%' }}>
                  <FormControl required={qualifierList.isMandatory==1} className={classes.formControl}  style={{ width: '100%' }} variant="outlined"  size="small">
                    <SelectFieldValidator
                        id={`${qualifierList.codQlfId}_QualMultiple`}
                        isDisabled={false}
                        isRequired={qualifierList.isMandatory==1}
                        value={qualSeq==1?qualSelectedValue.singleSel1:qualSeq==2?qualSelectedValue.singleSel2:qualSeq==3?qualSelectedValue.singleSel3:qualSeq==4?qualSelectedValue.singleSel4:qualSeq==5?qualSelectedValue.singleSel5:qualSelectedValue.singleSel6}
                        label={qualifierList.qlfDesc}
                        TextFieldProps={{
                          variant: 'outlined',
                          label: <>{qualifierList.qlfDesc} {qualifierList.isMandatory == 1 ? <RequiredIcon /> : null}</>
                        }}
                        style={{width: '100%'}}
                        options={qualifierList && qualifierList.codQlfValList.map((item) => ({value:item.codQlfValId, label:item.valDesc}))}
                        onChange={e => handleSinQualifierChange(e.value, qualSeq==1?1:qualSeq==2?2:qualSeq==3?3:qualSeq==4?4:qualSeq==5?5:6)}
                        validators={qualifierList.isMandatory==1 ? [ValidatorEnum.required] : null}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                    />
                    {/*<FormHelperText>Required</FormHelperText>*/}
                  </FormControl>
                </FormGroup>

            </React.Fragment>
          );
        }
      }

    };

    render(){
      const { classes, qualifierList, probProcAddDetails, selectedProbProc, selectedTeeth, probProcIndx, probProcDetails, isProbHx, termStatus, handleProbProcDetailsChange, handleIsProbHxOnChange, setDefaultProbHx, handleStatusOnChange, dentalChartList, dentalChartData,
              carryTooth, handleCarrytoothOnChange, handleOnSubmit, submitQualifierForm, isCurProb, ...rest} = this.props;
      //console.log('999', qualifierList);
      //console.log('Dicky updatedTeeth', selectedTeeth);
      const isPrimaryTeeth = (typeof dentalChartData != 'undefined' && dentalChartData != null && dentalChartData.dspTooth == 'P')?false:true;
      //let {isProbHx} = this.props;
      //if (typeof probProcAddDetails != 'undefined' && typeof probProcAddDetails.defaultHx != 'undefined' && probProcAddDetails.defaultHx=='Y'){
      //  isProbHx = true;
      //}
      //console.log('this.submitForm2', this.props.submitForm);
      //console.log('Dicky test qual', qualifierList);
      //console.log('Dicky test isCurProb', isCurProb);
        return(
          <ValidatorForm ref={this.props.submitForm} onSubmit={handleOnSubmit} onError={this.handleSubmitError}>
            <Card classes={{ root: classes.card }}>
            
              <CardContent style={isPrimaryTeeth?{overflowY: 'auto', overflowX: 'hidden', maxHeight: 'calc(100vh - 940px)'}:{overflowY: 'auto', overflowX: 'hidden', maxHeight: 'calc(100vh - 660px)'}}>
                {(typeof qualifierList != 'undefined') && (
                  <Typography style={{ color: 'purple' }} variant="h6" gutterBottom>{selectedProbProc}</Typography>
                )}
                {(typeof probProcAddDetails != 'undefined' && typeof probProcAddDetails.defaultHx != 'undefined' && probProcIndx == 1) && (typeof qualifierList != 'undefined') && (
                <div>
                  <FormControlLabel style={{ padding: '0px 20px 0px 0px' }} control={
                            <CIMSCheckBox
                                name={'isHx'}
                                id={'isHx'}
                                disabled={probProcAddDetails.defaultHx=='Y'} 
                                value={isProbHx}
                                onChange={e => handleIsProbHxOnChange(e)}
                            />
                        } label={'History'} checked={isProbHx===true}
                    />
                  <FormControlLabel style={{width: '200px'}} control={
                    <SelectFieldValidator
                        id={`probStatus`}
                        isRequired
                        value={termStatus}
                        label="Status"
                        TextFieldProps={{
                          variant: 'outlined',
                          label: <>Status<RequiredIcon /></>
                        }}                       
                        options={this.options.probStatus.map((option) => ({ value: option.value, label: option.label }))}
                        onChange={e => handleStatusOnChange(e.value)}          
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                    />}
                    />
                    <FormControlLabel
                        control={
                          <Switch
                              checked={carryTooth}
                              color="primary"
                              name={'carryTooth'}
                              onChange={(el, state) => handleCarrytoothOnChange(el, state)}
                          />
                        }
                        label={'Carry tooth'}
                    />
                </div>
                
                )}
                {(probProcIndx == 2) && (typeof qualifierList != 'undefined') && (
                <div>
                  <FormControlLabel style={{width: '200px', padding: '0px 0px 0px 20px'}} control={
                    <SelectFieldValidator
                        id={`probStatus`}
                        isRequired
                        value={termStatus}
                        label="Status"
                        TextFieldProps={{
                          variant: 'outlined',
                          label: <>Status<RequiredIcon /></>
                        }}                       
                        options={this.options.procStatus.map((option) => ({ value: option.value, label: option.label }))}
                        onChange={e => handleStatusOnChange(e.value)}          
                        validators={[ValidatorEnum.required]}
                        errorMessages={[CommonMessage.VALIDATION_NOTE_REQUIRED()]}
                    />}
                    />
                   <FormControlLabel
                       control={
                          <Switch
                              checked={carryTooth}
                              color="primary"
                              name={'carryTooth'}
                              onChange={(el, state) => handleCarrytoothOnChange(el, state)}
                          />
                        }
                       label={'Carry tooth'}
                    /> 
                </div>
                
                )}
                {(typeof qualifierList != 'undefined') && Boolean(qualifierList.length > 0) && (
                <div >
                  {this.getQualifierElement(qualifierList[0], 1, this.displayTeethSurface(selectedTeeth, qualifierList))}
                </div>
                )}
                {(typeof qualifierList != 'undefined') && Boolean(qualifierList.length > 1) && (
                <div >
                  {this.getQualifierElement(qualifierList[1], 2, this.displayTeethSurface(selectedTeeth, qualifierList))}
                </div>
                )}
                {(typeof qualifierList != 'undefined') && Boolean(qualifierList.length > 2) && (
                <div >
                  {this.getQualifierElement(qualifierList[2], 3, this.displayTeethSurface(selectedTeeth, qualifierList))}
                </div>
                )}
                {(typeof qualifierList != 'undefined') && Boolean(qualifierList.length > 3) && (
                <div >
                  {this.getQualifierElement(qualifierList[3], 4, this.displayTeethSurface(selectedTeeth, qualifierList))}
                </div>
                )}
                {(typeof qualifierList != 'undefined') && Boolean(qualifierList.length > 4) && (
                <div >
                  {this.getQualifierElement(qualifierList[4], 5, this.displayTeethSurface(selectedTeeth, qualifierList))}
                </div>
                )}
                {(typeof qualifierList != 'undefined') && Boolean(qualifierList.length > 5) && (
                <div >
                  {this.getQualifierElement(qualifierList[5], 6, this.displayTeethSurface(selectedTeeth, qualifierList))}
                </div>
                )}

                {(typeof qualifierList != 'undefined') && (
                <FormGroup row style={{ width: '100%' }}>
                  <FormControl className={classes.formControl}>
                      {/* <TextareaAutosize

                          rowsMin={3}
                          style={{ width: '440px', fontSize: '18px' }}
                          aria-label="empty textarea" placeholder="Details"
                      /> */}
                    <CIMSMultiTextField
                        style={{ width: '740px' , fontSize: '18px'}}
                        id={'detailsTextField'}
                        label={'Details'}
                        rows={3}
                        value={probProcDetails}
                        placeholder="Details"
                          //onChange={e => this.onNoteChange(e)}
                          //onBlur={e => this.onNoteBlur(e)}
                        onChange={e => handleProbProcDetailsChange(e, e.target.value)}
                    />
                  </FormControl>
                </FormGroup>
                )}

                <FormGroup row ></FormGroup>
                {(typeof qualifierList != 'undefined')  && (
              <CardActions disableSpacing>
                <div style={{ width: '100%' }}>

                  <Box display="flex" p={1} >
                    <Box width="100%">
                        <CIMSButton
                            onClick={() => submitQualifierForm()}
                            ref={this.props.submitButton}
                            id={'qualifier_submit'}
                            color="primary"
                        >Save</CIMSButton>
                        {(typeof isCurProb != 'undefined') && isCurProb == 'Y' && (
                        <CIMSButton
                            onClick={() => handleOnSubmit('Y')}
                            id={'qualifier_renew'}
                            color="primary"
                        >Renew</CIMSButton>
                    )}
                    </Box>

                    <Box flexShrink={0}>
                      {/* <Button edge="start" size="small" variant="contained">Delete</Button> */}
                      <CIMSButton
                          onClick={this.handleDelete}
                          color="primary"
                          id={'qualifier_delete'}
                      >Delete</CIMSButton>
                    </Box>
                  </Box>
                </div>
              </CardActions>
              )}
              </CardContent>


              
            </Card>
         </ValidatorForm>
        );
    }
}

const mapStateToProps = (state) => {
    return {
      qualifierList: state.dtsProbProc.qualifierList,
      probProcAddDetails: state.dtsProbProc.probProcAddDetails,
      selectedMulQualifier: state.dtsProbProc.selectedMulQualifier,
      dentalChartList: state.dtsDentalChart.dentalChartList,
      dentalChartData: state.dtsDentalChart.dentalChartData,
      saveResult: state.dtsProbProc.saveResult,
      cmnTermIndx: state.dtsProbProc.cmnTermIndx
    };
};

const mapDispatchToProps = {
  updateCurTab,
  openCommonMessage,
  resetSelectedVal,
  resetAll,
  saveProbProc,
  deleteProbProc,
  getDentalChart,
  getProblemAndQualifier,
  getProceduresAndQualifiers
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsEditQualifierFields));
