
import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Grid, Card, Typography, TextField, CardContent, FormControlLabel, Checkbox, RadioGroup, Radio,Paper, FormGroup  } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import 'react-quill/dist/quill.snow.css';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import { styles } from './backgroundInformationCss';
import _, { trim } from 'lodash';
import moment from 'moment';
import JCustomizedSelectFieldValidator from '../../../../../components/JSelect/JCustomizedSelect/JCustomizedSelectFieldValidator';
import clsx from 'clsx';
import TextareaField from '../../components/TextareaField/TextareaField';
import YearTextField from '../../components/YearTextField/YearTextField';
import NormalTextField from '../../components/NormalTextField/NormalTextField';

import {
  MRAM_BACKGROUNDINFOMATION_DM_PREFIX,
  MRAM_BACKGROUNDINFOMATION_HT_PREFIX,
  MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX,
  MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_PREFIX,
  MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX,
  MRAM_BACKGROUNDINFOMATION_DM_ID,
  MRAM_BACKGROUNDINFOMATION_HT_ID,
  MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID,
  MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_ID,
  MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID,
  TYPE_OF_DM,
  SELF_MONITORING_TYPE,
  ETHNICITY,
  SMOKING,
  OCCUPATION,
  ALCOHOL,
  EDUCATION,
  PHYSICAL_ACTIVITY_OF_MODERATE_INTENSITY,
  LIPODYSTROPHY_AT_INJECTION_SITES
}  from '../../../../../constants/MRAM/backgroundInformation/backgroundInformationConstant';
import * as generalUtil from '../../utils/generalUtil';
import { MRAM_FEILD_MAX_LENGTH } from '../../../../../constants/MRAM/mramConstant';

class BackgroundInformation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundInformationFieldValMap:new Map(),
      dmNoChecked:true,
      checkedDM:false,
      htNoChecked:true,
      checkedHT:false,
      familyRadioChecked:false,
      checkSibling:false,
      familyRadioCheckedValue:'',
      checkChild:false,
      yearOfDiagnosisDm:'',
      yearOfDiagnosisHt:'',
      typeOfDmValue:' ',
      hxOfDKAOrHHS:'',
      familyHxOfDM:'',
      father:false,
      mother:false,
      affectedSibling:'',
      affectedSiblingTotal:'',
      affectedChild:'',
      affectedChildTotal:'',
      familyHxOfPrematureCVD:'',
      familyHxOfHT:'',
      selfMonitoringTypeValue:' ',
      ethnicityValue:' ',
      ethnicityChecked:false,
      ethnicityDescription:'',
      occupationValue:' ',
      occupationChecked:false,
      occupationDescription:'',
      educationValue:' ',
      smokingValue:' ',
      smokingChecked:false,
      cigPeDay:'',
      smokingYears:'',
      alcoholValue:' ',
      alcoholChecked:false,
      alcoholDescription:'',
      physicalActivityValue:' ',
      injectionSitesValue:' ',
      antiDiabeticDrug:'',
      insulinTreatment:'',
      antiHypertensiveDrug:'',
      antiPlateletDrug:'',
      lipidLoweringDrug:'',
      drugAdherence:'',
      remarks:'',
      affectedSiblingCheck:false,
      affectedSiblingTotalCheck:false,
      affectedGtTotal:false,
      affectedChildCheck:false,
      affectedChildTotalCheck:false,
      childGtTotal:false,
      yearOfDiagnosisHtCheck:false,
      yearOfDiagnosisDmCheck:false,
      yearOfDiagnosisHtAbnormalFlag:false,
      yearOfDiagnosisDmAbnormalFlag:false
    };
    // this.resetStatus = _.debounce(this.resetStatus, 500);
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    let {backgroundInformationFieldValMap,view}=nextProps;
    if (nextProps.backgroundInformationFieldValMap !== this.props.backgroundInformationFieldValMap||view!==this.props.view) {
      this.setState({
        backgroundInformationFieldValMap: nextProps.backgroundInformationFieldValMap
      });
    if(view){
      this.setState({
        checkedDM:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.DM}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.DM}`).value==='true')?true:false):false,
        checkedHT:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.HT}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.HT}`).value==='true')?true:false):false,
        checkSibling:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.SIBLING_HX}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.SIBLING_HX}`).value==='true')?true:false):false,
        checkChild:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.CHILDREN_HX}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.CHILDREN_HX}`).value==='true')?true:false):false,
        yearOfDiagnosisDm:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.YEAR_OF_DIAGNOSIS_DM}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.YEAR_OF_DIAGNOSIS_DM}`).value:'',
        yearOfDiagnosisHt:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.YEAR_OF_DIAGNOSIS_HT}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.YEAR_OF_DIAGNOSIS_HT}`).value:'',
        typeOfDmValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.TYPE_OF_DM}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.TYPE_OF_DM}`).value:'',
        hxOfDKAOrHHS:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.HX_OF_DKA_HHS}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.HX_OF_DKA_HHS}`).value:'',
        familyRadioChecked:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FAMILY_HX_DM}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FAMILY_HX_DM}`).value==='true')?true:false):false,
        familyHxOfDM:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FAMILY_HX_DM}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FAMILY_HX_DM}`).value:'',
        father:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FATHER_HX}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FATHER_HX}`).value==='true')?true:false):false,
        mother:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.MOTHER_HX}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.MOTHER_HX}`).value==='true')?true:false):false,
        affectedSibling:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_SIBLING}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_SIBLING}`).value:'',
        affectedSiblingTotal:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_SIBLING}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_SIBLING}`).value:'',
        affectedChild:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_CHILDREN}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_CHILDREN}`).value:'',
        affectedChildTotal:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_CHILDREN}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_CHILDREN}`).value:'',
        familyHxOfPrematureCVD:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_PREMATURE_CVD}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_PREMATURE_CVD}`).value:'',
        familyHxOfHT:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_HT}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_HT}`).value:'',
        selfMonitoringTypeValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_ID.SELF_MONITORING_TYPE}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_ID.SELF_MONITORING_TYPE}`).value:' ',
        ethnicityValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY}`).value:' ',
        ethnicityChecked:false,
        ethnicityDescription:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY_DESCRIPTION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY_DESCRIPTION}`).value:'',
        occupationValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.OCCUPATION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.OCCUPATION}`).value:' ',
        occupationChecked:false,
        occupationDescription:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY_DESCRIPTION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY_DESCRIPTION}`).value:'',
        educationValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.EDUCATION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.EDUCATION}`).value:' ',
        smokingValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING}`).value:' ',
        smokingChecked:false,
        cigPeDay:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DAILY_CONSUMPTION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DAILY_CONSUMPTION}`).value:'',
        smokingYears:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DURATION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DURATION}`).value:'',
        alcoholValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL}`).value:' ',
        alcoholChecked:false,
        alcoholDescription:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL_DESCRIPTION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL_DESCRIPTION}`).value:'',
        physicalActivityValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.PHYSICAL_ACTIVITY_OF_MODERATE_INTENSITY}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.PHYSICAL_ACTIVITY_OF_MODERATE_INTENSITY}`).value:' ',
        injectionSitesValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPODYSTROPHY_AT_INJECTION_SITE}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPODYSTROPHY_AT_INJECTION_SITE}`).value:' ',
        antiDiabeticDrug:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_DIABETIC_DRUG}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_DIABETIC_DRUG}`).value:'',
        insulinTreatment:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.INSULIN_TREATMENT}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.INSULIN_TREATMENT}`).value:'',
        antiHypertensiveDrug:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_HYPERTENSIVE_DRUG}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_HYPERTENSIVE_DRUG}`).value:'',
        antiPlateletDrug:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_PLATELET_DRUG}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_PLATELET_DRUG}`).value:'',
        lipidLoweringDrug:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPID_LOWERING_DRUG}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPID_LOWERING_DRUG}`).value:'',
        drugAdherence:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.DRUG_ADHERENCE}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.DRUG_ADHERENCE}`).value:'',
        remarks:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.REMARKS}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.REMARKS}`).value:'',
        affectedSiblingCheck:false,
        affectedSiblingTotalCheck:false,
        affectedGtTotal:false,
        affectedChildCheck:false,
        affectedChildTotalCheck:false,
        childGtTotal:false,
        dmNoChecked:true,
        htNoChecked:true,
        yearOfDiagnosisDmCheck:false,
        yearOfDiagnosisHtCheck:false,
        cigPeDayCheck:false,
        smokingYearsCheck:false,
        yearOfDiagnosisHtAbnormalFlag:false,
        yearOfDiagnosisDmAbnormalFlag:false
      });
      }else{
      this.setState({
        checkedDM:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.DM}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.DM}`).value==='true')?true:false):false,
        checkedHT:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.HT}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.HT}`).value==='true')?true:false):false,
        familyRadioChecked:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FAMILY_HX_DM}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FAMILY_HX_DM}`).value==='Yes')?true:false):false,
        checkSibling:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.SIBLING_HX}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.SIBLING_HX}`).value==='true')?true:false):false,
        familyRadioCheckedValue:'',
        checkChild:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.CHILDREN_HX}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.CHILDREN_HX}`).value==='true')?true:false):false,
        yearOfDiagnosisDm:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.YEAR_OF_DIAGNOSIS_DM}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.YEAR_OF_DIAGNOSIS_DM}`).value:'',
        yearOfDiagnosisHt:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.YEAR_OF_DIAGNOSIS_HT}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.YEAR_OF_DIAGNOSIS_HT}`).value:'',
        typeOfDmValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.TYPE_OF_DM}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.TYPE_OF_DM}`).value:'',
        hxOfDKAOrHHS:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.HX_OF_DKA_HHS}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.HX_OF_DKA_HHS}`).value:'',
        familyHxOfDM:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FAMILY_HX_DM}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FAMILY_HX_DM}`).value:'',
        father:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FATHER_HX}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FATHER_HX}`).value==='true')?true:false):false,
        mother:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.MOTHER_HX}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.MOTHER_HX}`).value==='true')?true:false):false,
        affectedSibling:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_SIBLING}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_SIBLING}`).value:'',
        affectedSiblingTotal:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_SIBLING}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_SIBLING}`).value:'',
        affectedChild:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_CHILDREN}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_CHILDREN}`).value:'',
        affectedChildTotal:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_CHILDREN}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_CHILDREN}`).value:'',
        familyHxOfPrematureCVD:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_PREMATURE_CVD}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_PREMATURE_CVD}`).value:'',
        familyHxOfHT:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_HT}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_HT}`).value:'',
        selfMonitoringTypeValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_ID.SELF_MONITORING_TYPE}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_ID.SELF_MONITORING_TYPE}`).value:' ',
        ethnicityValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY}`).value:' ',
        ethnicityChecked:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY}`).value==='Others (Please specify)')?true:false):false,
        ethnicityDescription:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY_DESCRIPTION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY_DESCRIPTION}`).value:'',
        occupationValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.OCCUPATION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.OCCUPATION}`).value:' ',
        occupationChecked:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.OCCUPATION}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.OCCUPATION}`).value==='Others (Please specify)')?true:false):false,
        occupationDescription:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY_DESCRIPTION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.OCCUPATION_DESCRIPTION}`).value:'',
        educationValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.EDUCATION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.EDUCATION}`).value:' ',
        smokingValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING}`).value:' ',
        smokingChecked:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING}`).value==='Current smoker')?true:false):false,
        cigPeDay:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DAILY_CONSUMPTION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DAILY_CONSUMPTION}`).value:'',
        smokingYears:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DURATION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DURATION}`).value:'',
        alcoholValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL}`).value:' ',
        alcoholChecked:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL}`).value==='Current drinker')?true:false):false,
        alcoholDescription:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL_DESCRIPTION}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL_DESCRIPTION}`).value:'',
        physicalActivityValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.PHYSICAL_ACTIVITY_OF_MODERATE_INTENSITY}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.PHYSICAL_ACTIVITY_OF_MODERATE_INTENSITY}`).value:' ',
        injectionSitesValue:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPODYSTROPHY_AT_INJECTION_SITE}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPODYSTROPHY_AT_INJECTION_SITE}`).value:' ',
        antiDiabeticDrug:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_DIABETIC_DRUG}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_DIABETIC_DRUG}`).value:'',
        insulinTreatment:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.INSULIN_TREATMENT}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.INSULIN_TREATMENT}`).value:'',
        antiHypertensiveDrug:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_HYPERTENSIVE_DRUG}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_HYPERTENSIVE_DRUG}`).value:'',
        antiPlateletDrug:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_PLATELET_DRUG}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_PLATELET_DRUG}`).value:'',
        lipidLoweringDrug:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPID_LOWERING_DRUG}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPID_LOWERING_DRUG}`).value:'',
        drugAdherence:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.DRUG_ADHERENCE}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.DRUG_ADHERENCE}`).value:'',
        remarks:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.REMARKS}`)?backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.REMARKS}`).value:'',
        affectedSiblingCheck:false,
        affectedSiblingTotalCheck:false,
        affectedGtTotal:false,
        affectedChildCheck:false,
        affectedChildTotalCheck:false,
        childGtTotal:false,
        yearOfDiagnosisDmCheck:false,
        yearOfDiagnosisHtCheck:false,
        yearOfDiagnosisHtAbnormalFlag:false,
        yearOfDiagnosisDmAbnormalFlag:false,
        cigPeDayCheck:false,
        smokingYearsCheck:false,
        dmNoChecked:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.DM}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.DM}`).value==='true')?false:true):true,
        htNoChecked:backgroundInformationFieldValMap.has(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.HT}`)?((backgroundInformationFieldValMap.get(`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.HT}`).value==='true')?false:true):true
      });
      }
    }
    // this.resetStatus = _.debounce(this.resetStatus, 500);
  }

  handleCheckBoxChange = (event,mramId,name) => {
    let { updateState } = this.props;
    let { backgroundInformationFieldValMap } = this.state;
    let fieldValObj = backgroundInformationFieldValMap.get(mramId);
    if(name==='checkedDM'){
      if (!event.target.checked) {
        for (let [key, obj] of backgroundInformationFieldValMap.entries()) {
          if(key.startsWith('bidm')){
            obj.value = '';
            obj.isError = false;
            generalUtil.handleOperationType(obj);
          }
        }
      }
       this.setState({
        checkedDM: event.target.checked,
        dmNoChecked:!event.target.checked,
        yearOfDiagnosisDm:'',
        typeOfDmValue:' ',
        hxOfDKAOrHHS:'',
        familyHxOfDM:'',
        father:false,
        mother:false,
        checkSibling:false,
        checkChild:false,
        affectedSibling:'',
        affectedSiblingTotal:'',
        familyRadioChecked:false,
        affectedChild:'',
        affectedChildTotal:'',
        affectedSiblingCheck:false,
        affectedSiblingTotalCheck:false,
        affectedChildCheck:false,
        affectedChildTotalCheck:false,
        childGtTotal:false,
        affectedGtTotal:false,
        yearOfDiagnosisDmCheck:false,
        yearOfDiagnosisDmAbnormalFlag:false
     });
    }
   else if(name==='checkedHT'){
    if (!event.target.checked) {
      for (let [key, obj] of backgroundInformationFieldValMap.entries()) {
        if(key.startsWith('biht')){
          obj.value='';
          generalUtil.handleOperationType(obj);
        }
      }
    }
     this.setState({
        checkedHT: event.target.checked,
        htNoChecked:!event.target.checked,
        yearOfDiagnosisHt:'',
        familyHxOfPrematureCVD:'',
        familyHxOfHT:'',
        yearOfDiagnosisHtCheck:false,
        yearOfDiagnosisHtAbnormalFlag:false
       });
    }
    else if(name==='checkSibling'){
        this.setState({
          affectedSibling:'',
          affectedSiblingTotal:'',
          affectedSiblingCheck:false,
          affectedSiblingTotalCheck:false,
          affectedGtTotal:false,
          checkSibling:!this.state.checkSibling
          });
       this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_SIBLING}`,'');
       this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_SIBLING}`,'');
    }else if (name==='checkChild'){
      this.setState({
        affectedChild:'',
        affectedChildTotal:'',
        checkChild:!this.state.checkChild,
        affectedChildCheck:false,
        affectedChildTotalCheck:false,
        childGtTotal:false
        });
        this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_CHILDREN}`,'');
        this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_CHILDREN}`,'');
    }else{
      this.setState({
        [name]:event.target.checked
        });
    }
    if(event.target.checked){
      fieldValObj.value = event.target.checked;
      generalUtil.handleOperationType(fieldValObj);
      this.resetStatus(backgroundInformationFieldValMap);
    }else{
      fieldValObj.value ='';
      this.setState({
        [name]:''
      });
      generalUtil.handleOperationType(fieldValObj);
      this.resetStatus(backgroundInformationFieldValMap);
    }
  }

  handleFamilyRadiosChange = (event, type) => {
    let { backgroundInformationFieldValMap } = this.state;
    const { updateState } = this.props;
    let val = event.target.checked ? type : '';
    this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FAMILY_HX_DM}`, val);
    if (val === 'Yes') {
      this.setState({
        familyHxOfDM: val,
        familyRadioChecked: true
      });
    } else {
      for (let [key, obj] of backgroundInformationFieldValMap.entries()) {
        if (key.startsWith('bidm')) {
          if (obj.codeMramId > 4 && obj.codeMramId != 208) {
            if (obj.codeMramId === 5 || obj.codeMramId === 10 || obj.codeMramId === 6 || obj.codeMramId === 7) {
              obj.value = false;
              obj.isError = false;
              generalUtil.handleOperationType(obj);
            } else {
              obj.value = '';
              obj.isError = false;
              generalUtil.handleOperationType(obj);
            }
          }
        }
      }
      this.setState({
        familyHxOfDM: val,
        father: false,
        mother: false,
        checkSibling: false,
        checkChild: false,
        affectedSibling: '',
        affectedSiblingTotal: '',
        familyRadioChecked: false,
        affectedChild: '',
        affectedChildTotal: '',
        affectedSiblingCheck: false,
        affectedSiblingTotalCheck: false,
        affectedChildCheck: false,
        affectedChildTotalCheck: false,
        childGtTotal: false,
        affectedGtTotal: false
      });
      this.resetStatus(backgroundInformationFieldValMap);
    }
  }

  integerValCheck = val => {
    let partten = /^\d+$/;
    if (partten.test(val)&&trim(val)!='') {
      return true;
    }
    return false;
  }

  changeMapObjValue = (mramId, value, errorFlag) => {
    let { backgroundInformationFieldValMap } = this.state;
    let fieldValObj = backgroundInformationFieldValMap.get(mramId);
    fieldValObj.value = value;
    generalUtil.handleOperationType(fieldValObj);
    if (errorFlag) {
      fieldValObj.isError = errorFlag;
    } else {
      fieldValObj.isError = false;
    }
    this.resetStatus(backgroundInformationFieldValMap);
  }

  resetStatus = (backgroundInformationFieldValMap) =>{
    const { updateState } = this.props;
    updateState && updateState({
      backgroundInformationFieldValMap
    });
  }

  inputTextChange=(name,mramId,event)=>{
    let errorFlag=false;
    let value = event.target.value;
    if((name==='yearOfDiagnosisDm'||name==='yearOfDiagnosisHt'||name==='cigPeDay'||name==='smokingYears')){
      if(this.integerValCheck(value)||trim(value)===''){
        this.setState({
          [name]:value,
          [name+'Check']:false
        });
      }else{
          this.setState({
            [name]:value,
            [name+'Check']:true
          });
          errorFlag=true;
      }
    }else{
      this.setState({[name]:value});
    }

    if (!errorFlag&&(name==='yearOfDiagnosisDm'||name==='yearOfDiagnosisHt')) {
      // check input year
      if (trim(value)!=='') {
        if (_.toInteger(value) < 1000) {
          errorFlag = true;
        } else {
          // Patient DOB year ≤ Year of Diagnosis ≤ System date year
          const { patientInfo } = this.props;
          let dobYear = _.toString(moment(patientInfo.dob).year());
          let currentYear = _.toString(moment(new Date()).year());
          errorFlag = !moment(value).isBetween(dobYear, currentYear, null, '[]');
        }
      }
      this.setState({ [name+'AbnormalFlag']:errorFlag });
    }
    this.changeMapObjValue(mramId,value,errorFlag);
  }

  inputSiblingAffectedChange=(name,e)=>{
    let {affectedSiblingTotal}=this.state;
    let errorFlag=false;
    if (this.integerValCheck(e.target.value)&&this.integerValCheck(affectedSiblingTotal)) {
      if (e.target.value*1>affectedSiblingTotal*1) {
        this.setState({[name]:e.target.value,[name+'Check']:true,affectedGtTotal:true,affectedSiblingCheck:true});
        errorFlag=true;
      } else {
        this.setState({[name+'Check']:false,[name]:e.target.value,affectedGtTotal:false,affectedSiblingCheck:false,affectedSiblingTotalCheck:false});
        // errorFlag=false;
      }
    }else{
      if(this.state.affectedGtTotal){
        this.setState({affectedSiblingTotalCheck:false});
        // errorFlag=false;
      }
      if(this.integerValCheck(e.target.value)||trim(e.target.value)===''){
          this.setState({[name]:e.target.value,[name+'Check']:false,affectedGtTotal:false});
        //  errorFlag=false;
      }else{
          this.setState({[name]:e.target.value,[name+'Check']:true,affectedGtTotal:false});
          errorFlag=true;
      }
    }
    this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_SIBLING}`,e.target.value,errorFlag);
  }

  inputSiblingTotalChange=(name,e)=>{
    let {affectedSibling}=this.state;
    let errorFlag=false;
    if (this.integerValCheck(e.target.value)&&this.integerValCheck(affectedSibling)) {
      if (affectedSibling!=''&&e.target.value!=''&&this.state.affectedSibling*1>e.target.value*1) {
        this.setState({[name+'Check']:true,[name]:e.target.value,affectedGtTotal:true,affectedSiblingCheck:true});
        errorFlag=true;
      } else {
        this.setState({[name+'Check']:false,[name]:e.target.value,affectedGtTotal:false,affectedSiblingCheck:false});
        // errorFlag=false;
      }
    }else{
        if(this.state.affectedGtTotal){
          this.setState({affectedSiblingCheck:false});
          // errorFlag=false;
        }
        if(this.integerValCheck(e.target.value)||trim(e.target.value)===''){
            this.setState({[name]:e.target.value,[name+'Check']:false,affectedGtTotal:false});
            // errorFlag=false;
        }else{
          this.setState({[name]:e.target.value,[name+'Check']:true,affectedGtTotal:false});
            errorFlag=true;
        }
    }
    this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_SIBLING}`,e.target.value,errorFlag);
  }


  inputChildAffectedChange=(name,e)=>{
    let {affectedChildTotal}=this.state;
    let errorFlag=false;
    if (this.integerValCheck(e.target.value)&&this.integerValCheck(affectedChildTotal)) {
      if (e.target.value*1>affectedChildTotal*1) {
        this.setState({[name]:e.target.value,[name+'Check']:true,childGtTotal:true,affectedChildCheck:true});
        errorFlag=true;
      } else {
        this.setState({[name+'Check']:false,[name]:e.target.value,childGtTotal:false,affectedChildCheck:false,affectedChildTotalCheck:false});
        // errorFlag=false;
      }
    }else{
      if(this.state.childGtTotal){
        this.setState({affectedChildTotalCheck:false});
        // errorFlag=false;
      }
      if(this.integerValCheck(e.target.value)||trim(e.target.value)===''){
          this.setState({[name]:e.target.value,[name+'Check']:false,childGtTotal:false});
        //  errorFlag=false;
      }else{
          this.setState({[name]:e.target.value,[name+'Check']:true,childGtTotal:false});
          errorFlag=true;
      }
    }
    this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_AFFECTED_CHILDREN}`,e.target.value,errorFlag);
  }


  inputChildTotalChange=(name,e)=>{
    let {affectedChild}=this.state;
    let errorFlag=false;
    if (this.integerValCheck(e.target.value)&&this.integerValCheck(affectedChild)) {
      if (affectedChild!=''&&e.target.value!=''&&this.state.affectedChild*1>e.target.value*1) {
        this.setState({[name+'Check']:true,[name]:e.target.value,childGtTotal:true,affectedChildCheck:true});
        errorFlag=true;
      } else {
        this.setState({[name+'Check']:false,[name]:e.target.value,childGtTotal:false,affectedChildCheck:false});
        // errorFlag=false;
      }
    }else{
        if(this.state.childGtTotal){
          this.setState({affectedChildCheck:false});
          // errorFlag=false;
        }
        if(this.integerValCheck(e.target.value)||trim(e.target.value)===''){
            this.setState({[name]:e.target.value,[name+'Check']:false,childGtTotal:false});
            // errorFlag=false;
        }else{
          this.setState({[name]:e.target.value,[name+'Check']:true,childGtTotal:false});
            errorFlag=true;
        }
    }
    this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.NO_OF_TOTAL_CHILDREN}`,e.target.value,errorFlag);
  }

  handleDropdownChanged= (name,mramId,e) => {
    let { updateState } = this.props;
    let { backgroundInformationFieldValMap } = this.state;
    let fieldValObj = backgroundInformationFieldValMap.get(mramId);
    fieldValObj.value =e.value;
    if(name==='ethnicityValue'){
      if(e.value==='Others (Please specify)'){
        this.setState({
          ethnicityChecked:true,
          [name]:e.value
        });
      }else{
        this.setState({
          ethnicityChecked:false,
          [name]:e.value,
          ethnicityDescription:' '
        });
        //回传改变 backgroundInformationFieldValMap 中ETHNICITY_DESCRIPTION的值
        this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY_DESCRIPTION}`,'');
      }
    }else if(name==='occupationValue'){
      if(e.value==='Others (Please specify)'){
        this.setState({
          occupationChecked:true,
          [name]:e.value
        });
      }else{
        this.setState({
          occupationChecked:false,
          [name]:e.value,
          occupationDescription:' '
        });
        this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.OCCUPATION_DESCRIPTION}`,'');
      }
    }else if(name==='smokingValue'){
      if(e.value==='Current smoker'){
        this.setState({
          smokingChecked:true,
          [name]:e.value
        });
      }else{
        this.setState({
          smokingChecked:false,
          [name]:e.value,
          cigPeDayCheck:false,
          smokingYearsCheck:false,
          cigPeDay:'',
          smokingYears:''
        });
        this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DURATION}`,'');
        this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DAILY_CONSUMPTION}`,'');
      }
    }else if(name==='alcoholValue'){
      if(e.value==='Current drinker'){
        this.setState({
          alcoholChecked:true,
          [name]:e.value
        });
      }else{
        this.setState({
          alcoholChecked:false,
          [name]:e.value,
          alcoholDescription:' '
        });
        this.changeMapObjValue(`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL_DESCRIPTION}`,'');
      }
    }
    else{
      this.setState({
        [name]:e.value
      });
    }

    generalUtil.handleOperationType(fieldValObj);
    this.resetStatus(backgroundInformationFieldValMap);
  }

  handleRadioGroupChange = (name, mramId, event, type) => {
    let val = event.target.checked ? type : '';
    this.changeMapObjValue(mramId, val);
    this.setState({ [name]: val });
  }
  // textareaNotesChange = (name,mramId,e,type) => {
  //   this.setState({ [name]: e.target.value});
  //   this.changeMapObjValue(mramId,e.target.value,type);
  // };

  render() {
    const { classes, id, view } = this.props;
    let { dmNoChecked ,checkedDM,htNoChecked,familyRadioChecked,checkSibling,checkChild,affectedChild,affectedChildTotal,ethnicityChecked,
          yearOfDiagnosisDm,hxOfDKAOrHHS,father,mother,affectedSibling,affectedSiblingTotal,yearOfDiagnosisHt,occupationChecked,smokingChecked,remarks,backgroundInformationFieldValMap}= this.state;
    return (
      <Card className={classes.card} style={{height: this.props.height}}>
      <CardContent>
        <Typography component="div">
          <Paper elevation={1} className={classes.paper}>
            <Grid container>
              <Grid item xs={6} style={{borderRight: 'solid 1px #ecf5fb'}}>
                <Grid container>
                  {/* DM start */}
                <Grid item xs={12}>
                  <Typography variant="h5" component="h3" className={classes.leftHeader}>DM</Typography>
                <ValidatorForm onSubmit={()=>{}} autoCapitalize="off" id={`${id}_dm_form`}>
                      <Grid container spacing={8}>
                        <Grid
                            className={classes.checkBoxGrid}
                            item
                            key={Math.random()}
                            xs={4}
                        >
                          <FormControlLabel
                              classes={{label: classes.normalFont, disabled: classes.disabledLabel}}
                              control={
                              <Checkbox
                                  disabled={view}
                                  color="primary"
                                  id="DM"
                                  checked={checkedDM}
                                  onChange={(event) => { this.handleCheckBoxChange(event,`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.DM}`, 'checkedDM');}}
                                  classes={{
                                    root: classes.checkBoxStyle
                                  }}
                              />
                            }
                              label={'DM'}
                          />
                        </Grid>
                      </Grid>

                      <Grid container className={classes.gridContainer}>
                        <Grid item xs={3} className={classes.leftLableCenter}>
                          <span className={dmNoChecked?classes.disableInputStyle:classes.inputStyle}>Year of diagnosis</span>
                        </Grid>
                        <Grid item xs={6}>
                            <YearTextField
                                classes={{helper_error:classes.helper_error}}
                                id={`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.YEAR_OF_DIAGNOSIS_DM}`}
                                fieldValMap={backgroundInformationFieldValMap}
                                prefix={MRAM_BACKGROUNDINFOMATION_DM_PREFIX}
                                mramId={MRAM_BACKGROUNDINFOMATION_DM_ID.YEAR_OF_DIAGNOSIS_DM}
                                updateState={this.props.updateState}
                                abnormalMsg={'Invalid year of diagnosis'}
                                maxLength={4}
                                placeholder="Please enter number"
                                viewMode={dmNoChecked}
                            />
                        </Grid>
                      </Grid>
                      <Grid container className={classes.gridContainer}>
                        <Grid item xs={3} className={classes.leftLableCenter} />
                        <Grid item xs={6} style={{marginBottom:-7}}>
                          <p style={{color:'red', fontSize:14, margin:0, display:this.state.yearOfDiagnosisDmCheck||this.state.yearOfDiagnosisDmAbnormalFlag?'inline-block':'none'}}>
                            {
                              this.state.yearOfDiagnosisDmCheck?'This value is illegal.':(this.state.yearOfDiagnosisDmAbnormalFlag?'Invalid year of diagnosis':'')
                            }
                          </p>
                        </Grid>
                      </Grid>

                      <Grid container className={classes.gridContainerSecond}>
                        <Grid item xs={3} className={classes.leftLableCenter}>
                          <span className={dmNoChecked?classes.disableInputStyle:classes.inputStyle}> Type of DM<sup className={classes.gridSup}>R</sup></span>
                        </Grid>
                        <Grid item xs={6}>
                          <JCustomizedSelectFieldValidator
                              isDisabled={dmNoChecked}
                              id="bidm_2"
                              value={this.state.typeOfDmValue}
                              options={TYPE_OF_DM.map((item) => ({ value:item.value, label:item.lable}))}
                              onChange={(e) => { this.handleDropdownChanged('typeOfDmValue',`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.TYPE_OF_DM}`,e);}}
                          />
                        </Grid>
                      </Grid>
                      <Grid container className={classes.gridContainerSecond}>
                        <Grid item  className={classes.gridLableLeft} xs={3}>
                          <span className={dmNoChecked?classes.disableInputStyle:classes.inputStyle}>Hx of DKA / HHS</span>
                        </Grid>
                        <Grid item xs={6}>
                          <FormGroup aria-label="position" row id={'bidm_3'} className={classes.formGroup}>
                              <FormControlLabel
                                  classes={{ label: classes.tableCell, disabled: classes.disabledLabel }}
                                  disabled={dmNoChecked}
                                  onChange={(event) => { this.handleRadioGroupChange('hxOfDKAOrHHS', `${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.HX_OF_DKA_HHS}`, event, 'Yes'); }}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.hxOfDKAOrHHS === 'Yes' ? true : false}
                                  />
                                }
                                  label={'Yes'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.tableCell, disabled: classes.disabledLabel }}
                                  disabled={dmNoChecked}
                                  onChange={(event) => { this.handleRadioGroupChange('hxOfDKAOrHHS', `${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.HX_OF_DKA_HHS}`, event, 'No'); }}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.hxOfDKAOrHHS === 'No' ? true : false}
                                  />
                                }
                                  label={'No'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.tableCell, disabled: classes.disabledLabel }}
                                  disabled={dmNoChecked}
                                  onChange={(event) => { this.handleRadioGroupChange('hxOfDKAOrHHS', `${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.HX_OF_DKA_HHS}`, event, 'Not known'); }}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.hxOfDKAOrHHS === 'Not known' ? true : false}
                                  />
                                }
                                  label={'Not known'}
                              />
                            </FormGroup>
                        </Grid>
                      </Grid>
                      <Grid container className={classes.gridContainerSecond}>
                        <Grid item className={classes.gridLableLeft} xs={3}>
                          <span className={dmNoChecked?classes.disableInputStyle:classes.inputStyle}>Family Hx of DM</span>
                        </Grid>
                        <Grid item xs={6}>
                          <FormGroup aria-label="position" row id={'bidm_4'} className={classes.formGroup}>
                              <FormControlLabel
                                  classes={{ label: classes.tableCell, disabled: classes.disabledLabel }}
                                  disabled={dmNoChecked}
                                  onChange={(event) => { this.handleFamilyRadiosChange(event, 'Yes'); }}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.familyHxOfDM === 'Yes' ? true : false}
                                  />
                                }
                                  label={'Yes'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.tableCell, disabled: classes.disabledLabel }}
                                  disabled={dmNoChecked}
                                  onChange={(event) => { this.handleFamilyRadiosChange(event, 'No'); }}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.familyHxOfDM === 'No' ? true : false}
                                  />
                                }
                                  label={'No'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.tableCell, disabled: classes.disabledLabel }}
                                  disabled={dmNoChecked}
                                  onChange={(event) => { this.handleFamilyRadiosChange(event, 'Not known'); }}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.familyHxOfDM === 'Not known' ? true : false}
                                  />
                                }
                                  label={'Not known'}
                              />
                            </FormGroup>

                        </Grid>
                      </Grid>

                      <Grid container className={classes.gridContainerSecond}>
                        <Grid item xs={3}>
                        </Grid>
                        <Grid item xs={6}>
                          <FormControlLabel
                              className={classes.radioGroup}
                              classes={{label: classes.normalFont, disabled: classes.disabledLabel}}
                              onChange={(event) => { this.handleCheckBoxChange(event,`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.FATHER_HX}`, 'father');}}
                              control={
                              <Checkbox
                                  color="primary"
                                  id="bidm_5"
                                  disabled={!dmNoChecked&&familyRadioChecked?false:true}
                                  checked={father}
                                  classes={{
                                    root: classes.checkBoxStyle
                                  }}
                              />
                            }
                              label={'Father'}
                          />
                        </Grid>
                      </Grid>
                      <Grid container className={classes.gridContainerSecond}>
                        <Grid item xs={3} />
                        <Grid item  xs={6}>
                          <FormControlLabel
                              classes={{label: classes.normalFont, disabled: classes.disabledLabel}}
                              onChange={(event) => { this.handleCheckBoxChange(event,`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.MOTHER_HX}`, 'mother');}}
                              control={
                              <Checkbox
                                  color="primary"
                                  id="bidm_6"
                                  disabled={!dmNoChecked&&familyRadioChecked?false:true}
                                  checked={mother}
                                  classes={{
                                    root: classes.checkBoxStyle
                                  }}
                              />
                            }
                              label={'Mother'}
                          />
                        </Grid>
                      </Grid>

                      <Grid container className={classes.gridContainerSecond}>
                        <Grid item className={classes.gridLable} xs={3}/>
                        <Grid item xs={2} style={{marginTop:9}}>
                          <FormControlLabel
                              // className={classes.radioGroup}
                              classes={{label: classes.normalFont, disabled: classes.disabledLabel}}
                              control={
                              <Checkbox
                                  color="primary"
                                  id="bidm_7"
                                  disabled={!dmNoChecked&&familyRadioChecked?false:true}
                                  checked={checkSibling}
                                  onChange={(event) => { this.handleCheckBoxChange(event,`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.SIBLING_HX}`, 'checkSibling');}}
                                  classes={{
                                    root: classes.checkBoxStyle
                                  }}
                              />
                            }
                              label={'Sibling(s),'}
                          />
                        </Grid>

                        <Grid item xs={2} style={{ marginTop: 8 }}>
                          <Grid item container>
                            <Grid item   style={{marginTop:7}}>
                              <span className={!dmNoChecked&&checkSibling?classes.leftSpan:classes.disableLeftSpan}>Affected</span>
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                  autoCapitalize="off"
                                  id="bidm_8"
                                  name="no_of_affected_sibling"
                                  className={classes.affectedSibling}
                                  type="text"
                                  variant="outlined"
                                  disabled={!dmNoChecked&&checkSibling?false:true}
                                  inputProps={{
                                    style:{paddingLeft: 6,paddingRight: 0}
                                  }}
                                  InputProps={{
                                    classes: {
                                      input: classes.input,
                                      disabled: classes.disabled
                                    }
                                  }}
                                  value={affectedSibling}
                                  error={this.state.affectedSiblingCheck}
                                  onChange={(e) => { this.inputSiblingAffectedChange('affectedSibling',e);}}
                              />
                            </Grid>
                            <span style={{color:'red',fontSize:10,display:this.state.affectedSiblingCheck&&!this.state.affectedGtTotal?'inline-block':'none'}}>This value is illegal.</span>
                          </Grid>
                        </Grid>
                        <Grid item xs={3} className={classes.gridTotal}>
                          <Grid item container>
                            <Grid item xs="auto" style={{marginTop:7}}>
                             <span className={!dmNoChecked&&checkSibling?classes.punctuationTotal:classes.disabledPunctuationTotal}>/</span> <span className={!dmNoChecked&&checkSibling?classes.leftSpan:classes.disableLeftSpan}> Total</span>
                            </Grid>
                            <Grid item xs={3}>
                                <TextField
                                    id={'bidm_9'}
                                    name="no_of_total_sibling"
                                    className={classes.affectedSibling}
                                    type="text"
                                    variant="outlined"
                                    disabled={!dmNoChecked&&checkSibling?false:true}
                                    inputProps={{
                                      style:{paddingLeft: 6,paddingRight: 0}
                                    }}
                                    InputProps={{
                                      classes: {
                                        input: classes.input,
                                        disabled: classes.disabled
                                      }
                                    }}
                                    value={affectedSiblingTotal}
                                    error={this.state.affectedSiblingTotalCheck}
                                    onChange={(e) => { this.inputSiblingTotalChange('affectedSiblingTotal',e);}}
                                />
                            </Grid>
                            <span style={{color:'red',fontSize:10,display:this.state.affectedSiblingTotalCheck&&!this.state.affectedGtTotal?'inline-block':'none'}}>This value is illegal.</span>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid container style={{marginLeft:35,marginTop:-6,marginBottom:-15}}>
                        <Grid xs={3} item />
                        <Grid  item>
                          <span style={{color:'red',fontSize:10,display:this.state.affectedGtTotal?'inline-block':'none'}}>The affected number of siblings should be equal or smaller than the total number of siblings.</span>
                        </Grid>
                      </Grid>

                      {/* Child(ren) start */}
                      <Grid container
                          className={classes.gridContainerSecond}
                          style={{marginBottom:10}}
                      >
                        <Grid item className={classes.gridLable} xs={3}/>
                        <Grid item xs={2}>
                          <FormControlLabel
                              classes={{label: classes.normalFont, disabled: classes.disabledLabel}}
                              control={
                              <Checkbox
                                  color="primary"
                                  id="bidm_10"
                                  disabled={!dmNoChecked&&familyRadioChecked?false:true}
                                  checked={checkChild}
                                  onChange={(event) => { this.handleCheckBoxChange(event,`${MRAM_BACKGROUNDINFOMATION_DM_PREFIX}_${MRAM_BACKGROUNDINFOMATION_DM_ID.CHILDREN_HX}`, 'checkChild');}}
                                  classes={{
                                    root: classes.checkBoxStyle
                                  }}
                              />
                            }
                              label={'Child(ren),'}
                          />
                        </Grid>

                        <Grid item xs={2}>
                          <Grid item container>
                            <Grid item style={{marginTop:6}}>
                              <span  className={!dmNoChecked&&checkChild?classes.leftSpan:classes.disableLeftSpan}>Affected</span>
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                  id={'bidm_11'}
                                  name="no_of_affected_children"
                                  className={classes.affectedSibling}
                                  type="text"
                                  variant="outlined"
                                  disabled={!dmNoChecked&&checkChild?false:true}
                                  inputProps={{
                                    style:{paddingLeft: 6,paddingRight: 0}
                                  }}
                                  InputProps={{
                                    classes: {
                                      input: classes.input,
                                      disabled: classes.disabled
                                    }
                                  }}
                                  value={affectedChild}
                                  error={this.state.affectedChildCheck}
                                  onChange={(e) => { this.inputChildAffectedChange('affectedChild',e);}}
                              />
                            </Grid>
                            <span style={{color:'red',fontSize:10,display:this.state.affectedChildCheck&&!this.state.childGtTotal?'inline-block':'none'}}>This value is illegal.</span>
                          </Grid>
                        </Grid>

                        <Grid item
                            xs={3}
                            className={classes.gridTotal}
                            style={{marginTop:0}}
                        >
                          <Grid item container>
                            <Grid item xs="auto" style={{marginTop:6}}>
                              <span className={!dmNoChecked&&checkChild?classes.punctuationTotal:classes.disabledPunctuationTotal}>/</span> <span className={!dmNoChecked&&checkChild?classes.leftSpan:classes.disableLeftSpan}> Total</span>
                            </Grid>
                            <Grid item xs={3}>
                              <TextField
                                  autoCapitalize="off"
                                  id={'bidm_12'}
                                  name="no_of_affected_children"
                                  className={classes.affectedSibling}
                                  type="text"
                                  variant="outlined"
                                  disabled={!dmNoChecked&&checkChild?false:true}
                                  inputProps={{
                                    style:{paddingLeft: 6,paddingRight: 0}
                                  }}
                                  InputProps={{
                                    classes: {
                                      input: classes.input,
                                      disabled: classes.disabled
                                    }
                                  }}
                                  value={affectedChildTotal}
                                  error={this.state.affectedChildTotalCheck}
                                  onChange={(e) => { this.inputChildTotalChange('affectedChildTotal',e);}}
                              />
                            </Grid>
                            <span style={{color:'red',fontSize:10,display:this.state.affectedChildTotalCheck&&!this.state.childGtTotal?'inline-block':'none'}}>This value is illegal.</span>
                          </Grid>
                        </Grid>
                      <Grid container style={{marginTop:-6,marginBottom:-15}}>
                        <Grid xs={3} item />
                        <Grid  item>
                          <span style={{color:'red',fontSize:10,display:this.state.childGtTotal?'inline-block':'none'}}>The affected number of children should be equal or smaller than the total number of children.</span>
                        </Grid>
                      </Grid>
                      </Grid>
                  </ValidatorForm>
                </Grid>
                 {/* DM end */}

                 {/*HT start */}
                <Grid item xs={12}>
                <Typography variant="h5" component="h3" className={classes.headerNoRegistration}>
                  HT
                </Typography>
                <ValidatorForm onSubmit={()=>{}} id={`${id}_ht_form`}>
                <Grid container spacing={8}>
                        <Grid
                            className={classes.checkBoxGrid}
                            item
                            key={Math.random()}
                            xs={4}
                        >
                          <FormControlLabel
                              classes={{label: classes.normalFont, disabled: classes.disabledLabel}}
                              control={
                              <Checkbox
                                  disabled={view}
                                  color="primary"
                                  id="BIHT_24"
                                  checked={this.state.checkedHT}
                                  onChange={(event) => {this.handleCheckBoxChange(event,`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.HT}`, 'checkedHT'); }}
                                  classes={{
                                    root: classes.checkBoxStyle
                                  }}
                              />
                            }
                              label={'HT'}
                          />
                        </Grid>
                      </Grid>
                      <Grid container className={classes.gridContainer}>
                        <Grid item xs={3} className={classes.leftLableCenter}>
                          <span className={htNoChecked?classes.disableInputStyle:classes.inputStyle}>Year of diagnosis</span>
                        </Grid>
                        <Grid item xs={6}>
                            <YearTextField
                                classes={{helper_error:classes.helper_error}}
                                id={`${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.YEAR_OF_DIAGNOSIS_HT}`}
                                fieldValMap={backgroundInformationFieldValMap}
                                prefix={MRAM_BACKGROUNDINFOMATION_HT_PREFIX}
                                mramId={MRAM_BACKGROUNDINFOMATION_HT_ID.YEAR_OF_DIAGNOSIS_HT}
                                updateState={this.props.updateState}
                                abnormalMsg={'Invalid year of diagnosis'}
                                maxLength={4}
                                placeholder="Please enter number"
                                viewMode={htNoChecked}
                            />
                        </Grid>
                      </Grid>

                      <Grid container className={classes.gridContainer}>
                        <Grid item xs={3} className={classes.leftLableCenter} />
                        {/* <Grid item xs={6} style={{marginBottom:-15}}>
                          <p style={{color:'red',fontSize:14,display:this.state.yearOfDiagnosisHtCheck?'inline-block':'none'}}>This value is illegal.</p>
                        </Grid> */}
                        <Grid item xs={6} style={{marginBottom:-7}}>
                          <p style={{color:'red', fontSize:14, margin:0, display:this.state.yearOfDiagnosisHtCheck||this.state.yearOfDiagnosisHtAbnormalFlag?'inline-block':'none'}}>
                            {
                              this.state.yearOfDiagnosisHtCheck?'This value is illegal.':(this.state.yearOfDiagnosisHtAbnormalFlag?'Invalid year of diagnosis':'')
                            }
                          </p>
                        </Grid>
                      </Grid>
                      {/* Family Hx of HT */}
                      <Grid container className={classes.gridContainerSecond}>
                        <Grid item xs={3} className={classes.gridLableLeft}>
                          <span className={htNoChecked?classes.disableInputStyle:classes.inputStyle}>Family Hx of HT</span>
                        </Grid>
                        <Grid item xs={6}>
                            <FormGroup aria-label="position" row id={'BIHT_26'}>
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={htNoChecked}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.familyHxOfHT === 'Yes' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('familyHxOfHT', `${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_HT}`, event, 'Yes'); }}
                                      classes={{
                                        root: classes.checkBoxStyle
                                      }}
                                  />
                                }
                                  label={'Yes'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={htNoChecked}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.familyHxOfHT === 'No' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('familyHxOfHT', `${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_HT}`, event, 'No'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'No'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={htNoChecked}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.familyHxOfHT === 'Not known' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('familyHxOfHT', `${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_HT}`, event, 'Not known'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Not known'}
                              />
                            </FormGroup>
                        </Grid>
                      </Grid>
                      {/* Family Hx of Premature CVD */}
                      <Grid container className={classes.gridContainerSecond}>
                        <Grid item className={classes.gridLableLeft} xs={3}>
                          <span className={htNoChecked?classes.disableInputStyle:classes.inputStyle}>Family Hx of Premature CVD</span>
                        </Grid>
                        <Grid item xs={6}>
                          <FormGroup aria-label="position" row id={'BIHT_27'}>
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={htNoChecked}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.familyHxOfPrematureCVD === 'Yes' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('familyHxOfPrematureCVD', `${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_PREMATURE_CVD}`, event, 'Yes'); }}
                                      classes={{
                                        root: classes.checkBoxStyle
                                      }}
                                  />
                                }
                                  label={'Yes'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={htNoChecked}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.familyHxOfPrematureCVD === 'No' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('familyHxOfPrematureCVD', `${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_PREMATURE_CVD}`, event, 'No'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'No'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={htNoChecked}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.familyHxOfPrematureCVD === 'Not known' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('familyHxOfPrematureCVD', `${MRAM_BACKGROUNDINFOMATION_HT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_HT_ID.FAMILY_HX_PREMATURE_CVD}`, event, 'Not known'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Not known'}
                              />
                            </FormGroup>
                        </Grid>
                      </Grid>
                </ValidatorForm>
              </Grid>
              {/*HT end */}

              <Grid item xs={12}>
                <Typography variant="h5" component="h3" className={classes.headerNoRegistration}>
                Self Monitoring
                </Typography>
                <ValidatorForm onSubmit={()=>{}} id={`${id}_self_monitoring_form`}>
                  <Grid container
                      style={{ marginLeft: 35, marginTop: 10}}
                  >
                        <Grid item
                            xs={3}
                            className={classes.leftLableCenter}
                        >
                          <span className={view?classes.disableInputStyle:classes.inputStyle}> Self monitoring type </span>
                        </Grid>
                        <Grid item xs={6}>

                          <JCustomizedSelectFieldValidator
                           // menuIsOpen={true}
                            //menuPosition = "auto"
                            //menuPortalTarget={document.querySelector('#root')}
                            // classes={{
                            //   singleValue:classes.tableCell,
                            //   menuItem:classes.tableCell
                            // }}
                              isDisabled={view}
                              id="BISM_28"
                              value={this.state.selfMonitoringTypeValue}
                              options={SELF_MONITORING_TYPE.map((item) => ({ value:item.value, label:item.lable}))}
                              onChange={(e) => { this.handleDropdownChanged('selfMonitoringTypeValue',`${MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SELF_MONITORING_ID.SELF_MONITORING_TYPE}`,e);}}
                          />
                        </Grid>
                    </Grid>
		          	</ValidatorForm>
                </Grid>
              </Grid>
            </Grid>

          {/* Social History start */}
          <Grid item xs={6}>
          <Grid container>
              <Grid item xs={12}>
                <Typography variant="h5" component="h3" className={classes.rightHeader}>
                Social History
                </Typography>
                <ValidatorForm   onSubmit={()=>{}} id={`${id}_social_history_form`}>
                <Grid container className={classes.socialHistoryGrid}  >
                  <Grid item xs={6}>
                    <Grid container
                        style={{ marginLeft: 35}}
                    >
                      <Grid item
                          xs={12}
                      >
                        <span className={view?classes.disableInputStyle:classes.inputStyle}>Ethnicity</span>
                      </Grid>

                      <Grid item xs={10}>
                        <JCustomizedSelectFieldValidator
                            isDisabled={view}
                            id="bish_13"
                            value={this.state.ethnicityValue}
                            options={ETHNICITY.map((item) => ({ value:item.value, label:item.lable}))}
                            onChange={(e) => { this.handleDropdownChanged('ethnicityValue',`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY}`,e);}}
                        />
                      </Grid>

                      <Grid item xs={10}>
                        <NormalTextField
                            id={`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY_DESCRIPTION}`}
                            fieldValMap={backgroundInformationFieldValMap}
                            prefix={MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}
                            mramId={MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ETHNICITY_DESCRIPTION}
                            updateState={this.props.updateState}
                            viewMode={ethnicityChecked?false:true}
                        />
                      </Grid>

                    </Grid>

                    <Grid container style={{ marginLeft: 35}}>
                      <Grid item xs={12}>
                      <span  className={view?classes.disableInputStyle:classes.inputStyle}>Occupation</span>
                      </Grid>
                      <Grid item xs={10}>
                        <JCustomizedSelectFieldValidator
                            isDisabled={view}
                            id={'bish_18'}
                            value={this.state.occupationValue}
                            options={OCCUPATION.map((item) => ({ value:item.value, label:item.lable}))}
                            onChange={(e) => { this.handleDropdownChanged('occupationValue',`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.OCCUPATION}`,e);}}
                        />
                      </Grid>
                      <Grid item  xs={10}>
                        <NormalTextField
                            id={`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.OCCUPATION_DESCRIPTION}`}
                            fieldValMap={backgroundInformationFieldValMap}
                            prefix={MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}
                            mramId={MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.OCCUPATION_DESCRIPTION}
                            updateState={this.props.updateState}
                            viewMode={occupationChecked?false:true}
                        />
                      </Grid>
                    </Grid>

                    <Grid container style={{ marginLeft: 35}}>
                      <Grid item xs={12}>
                      <span  className={view?classes.disableInputStyle:classes.inputStyle}>Education</span>
                      </Grid>
                      <Grid item xs={10}>
                        <JCustomizedSelectFieldValidator
                            isDisabled={view}
                            id={'bish_22'}
                            value={this.state.educationValue}
                            options={EDUCATION.map((item) => ({ value:item.value, label:item.lable}))}
                            onChange={(e) => { this.handleDropdownChanged('educationValue',`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.EDUCATION}`,e);}}
                        // classes={{
                        //   singleValue:classes.tableCell,
                        //   menuItem:classes.tableCell
                        // }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={6}>
                  <Grid container style={{ marginLeft: 35}}>
                      <Grid item xs={12}>
                      <span  className={view?classes.disableInputStyle:classes.inputStyle}>Smoking<sup className={classes.gridSup}>R</sup></span>
                      </Grid>
                      <Grid item xs={10}>
                        <JCustomizedSelectFieldValidator
                            id={'bish_15'}
                            value={this.state.smokingValue}
                            options={SMOKING.map((item) => ({ value:item.value, label:item.lable}))}
                            onChange={(e) => { this.handleDropdownChanged('smokingValue',`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING}`,e);}}
                            isDisabled={view}
                        />
                      </Grid>
                      <Grid item container row="true" style={{marginBottom:2}}>
                          <Grid xs={7} item>
                          <Grid item xs={3}>
                            <YearTextField
                                classes={{helper_error:classes.helper_error}}
                                id={`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DAILY_CONSUMPTION}`}
                                fieldValMap={backgroundInformationFieldValMap}
                                prefix={MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}
                                mramId={MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DAILY_CONSUMPTION}
                                updateState={this.props.updateState}
                                // abnormalMsg={'Invalid year of diagnosis'}
                                // maxLength={4}
                                // placeholder="Please enter number"
                                viewMode={smokingChecked?false:true}
                            />
                          </Grid>
                          <Grid style={{marginTop:7}} >
                          <span style={{marginLeft:4}} className={smokingChecked?classes.inputStyle:classes.disableInputStyle}> cig. per day for</span>
                          </Grid>
                          {
                             this.state.cigPeDayCheck?  <span style={{color:'red',fontSize:10,marginLeft:'-56px',marginTop:10}}>This value is illegal.</span>:null
                          }
                          </Grid>

                        <Grid xs={5} item>
                          <Grid item xs={4}>
                            <YearTextField
                                classes={{helper_error:classes.helper_error}}
                                id={`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DURATION}`}
                                fieldValMap={backgroundInformationFieldValMap}
                                prefix={MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}
                                mramId={MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.SMOKING_DURATION}
                                updateState={this.props.updateState}
                                // abnormalMsg={'Invalid year of diagnosis'}
                                // maxLength={4}
                                // placeholder="Please enter number"
                                viewMode={smokingChecked?false:true}
                            />
                          </Grid>

                          <Grid item style={{marginTop:7}}  >
                          <span style={{marginLeft:2}}  className={smokingChecked?classes.inputStyle:classes.disableInputStyle}> year(s)</span>
                          </Grid>
                          {
                             this.state.smokingYearsCheck?<span style={{color:'red',fontSize:10,marginLeft:'-56px',marginTop:10}}>This value is illegal.</span>:null
                          }
                          </Grid>
                      </Grid>

                    </Grid>

                    <Grid container style={{ marginLeft: 35}}>
                      <Grid item xs={12}>
                      <span  className={view?classes.disableInputStyle:classes.inputStyle}>Alcohol</span>
                      </Grid>

                      <Grid item xs={10} >
                        <JCustomizedSelectFieldValidator
                            id={'bish_20'}
                            value={this.state.alcoholValue}
                            options={ALCOHOL.map((item) => ({ value:item.value, label:item.lable}))}
                            onChange={(e) => { this.handleDropdownChanged('alcoholValue',`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL}`,e);}}
                            isDisabled={view}
                        />
                      </Grid>
                      {/* <Grid item  xs={10}>
                        <TextField
                            autoCapitalize="off"
                            id={'bish_21'}
                            className={classes.yearDiagnosisHt}
                            type="text"
                            variant="outlined"
                            value={this.state.alcoholDescription}
                            onChange={(e) => { this.inputTextChange('alcoholDescription',`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.ALCOHOL_DESCRIPTION}`,e);}}
                            disabled={this.state.alcoholChecked?false:true}
                        />
                      </Grid> */}
                    </Grid>

                      <Grid container style={{ marginLeft: 35,marginTop:35}}>
                        <Grid item xs={12}>
                        <span  className={view?classes.disableInputStyle:classes.inputStyle}>Physical activity of moderate intensity</span>
                        </Grid>
                        <Grid item xs={10}>
                          <JCustomizedSelectFieldValidator
                              isDisabled={view}
                              id={'bish_23'}
                              value={this.state.physicalActivityValue}
                              options={PHYSICAL_ACTIVITY_OF_MODERATE_INTENSITY.map((item) => ({ value:item.value, label:item.lable}))}
                              onChange={(e) => { this.handleDropdownChanged('physicalActivityValue',`${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_PREFIX}_${MRAM_BACKGROUNDINFOMATION_SOCIAL_HISTORY_ID.PHYSICAL_ACTIVITY_OF_MODERATE_INTENSITY}`,e);}}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
		              </ValidatorForm>
                 </Grid>

                 <Grid item xs={12}>
                    <Typography variant="h5" component="h3" className={classes.headerNoRegistration}>
                      Current Treatment
                    </Typography>

                <ValidatorForm onSubmit={()=>{}} id={`${id}_current_treatment_form`}>
                    <Grid container className={classes.radioGroupContainer}>
                        <Grid item xs={4}>
                          <span className={view?classes.disableInputStyle:classes.inputStyle}>Anti-diabetic drug<sup className={classes.gridSup}>R</sup></span>
                        </Grid>
                        <Grid item xs={6}>
                            <FormGroup aria-label="position" row id={'BICT_29'}>
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.antiDiabeticDrug === 'Yes' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('antiDiabeticDrug', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_DIABETIC_DRUG}`, event, 'Yes'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Yes'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.antiDiabeticDrug === 'No' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('antiDiabeticDrug', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_DIABETIC_DRUG}`, event, 'No'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'No'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.antiDiabeticDrug === 'Not known' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('antiDiabeticDrug', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_DIABETIC_DRUG}`, event, 'Not known'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Not known'}
                              />
                            </FormGroup>
                        </Grid>
                      </Grid>
                      <Grid container className={classes.radioGroupContainer}>
                        <Grid item xs={4}>
                          <span className={view?classes.disableInputStyle:classes.inputStyle}>Insulin treatment<sup className={classes.gridSup}>R</sup></span>
                        </Grid>
                        <Grid item xs={6}>
                            <FormGroup aria-label="position" row id={'BICT_30'}>
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.insulinTreatment === 'Yes' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('insulinTreatment', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.INSULIN_TREATMENT}`, event, 'Yes'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Yes'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.insulinTreatment === 'No' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('insulinTreatment', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.INSULIN_TREATMENT}`, event, 'No'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'No'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.insulinTreatment === 'Not known' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('insulinTreatment', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.INSULIN_TREATMENT}`, event, 'Not known'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Not known'}
                              />
                            </FormGroup>
                        </Grid>
                    </Grid>

                    <Grid container className={classes.radioGroupContainer}>
                        <Grid item xs={4}>
                          <span className={view?classes.disableInputStyle:classes.inputStyle}>Anti-hypertensive drug<sup className={classes.gridSup}>R</sup></span>
                        </Grid>
                        <Grid item xs={6}>
                            <FormGroup aria-label="position" row id={'BICT_31'}>
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.antiHypertensiveDrug === 'Yes' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('antiHypertensiveDrug',`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_HYPERTENSIVE_DRUG}`,event,'Yes');}}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Yes'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      disabled={view}
                                      color="primary"
                                      checked={this.state.antiHypertensiveDrug === 'No' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('antiHypertensiveDrug',`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_HYPERTENSIVE_DRUG}`,event,'No');}}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'No'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.antiHypertensiveDrug === 'Not known' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('antiHypertensiveDrug',`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_HYPERTENSIVE_DRUG}`,event,'Not known');}}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Not known'}
                              />
                            </FormGroup>

                        </Grid>
                      </Grid>

                      <Grid container className={classes.radioGroupContainer}>
                        <Grid item xs={4}>
                          <span className={view?classes.disableInputStyle:classes.inputStyle}>Anti-platelet drug </span>
                        </Grid>
                        <Grid item xs={6}>
                            <FormGroup aria-label="position" row id={'BICT_32'}>
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.antiPlateletDrug === 'Yes' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('antiPlateletDrug', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_PLATELET_DRUG}`, event, 'Yes'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Yes'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.antiPlateletDrug === 'No' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('antiPlateletDrug', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_PLATELET_DRUG}`, event, 'No'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'No'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.antiPlateletDrug === 'Not known' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('antiPlateletDrug', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.ANTI_PLATELET_DRUG}`, event, 'Not known'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Not known'}
                              />
                            </FormGroup>
                        </Grid>
                      </Grid>

                      <Grid container className={classes.radioGroupContainer}>
                        <Grid item xs={4}>
                          <span className={view?classes.disableInputStyle:classes.inputStyle}>Lipid-lowering drug<sup className={classes.gridSup}>R</sup></span>
                        </Grid>
                        <Grid item xs={6}>
                            <FormGroup aria-label="position" row id={'BICT_33'}>
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.lipidLoweringDrug === 'Yes' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('lipidLoweringDrug', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPID_LOWERING_DRUG}`, event, 'Yes'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Yes'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.lipidLoweringDrug === 'No' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('lipidLoweringDrug', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPID_LOWERING_DRUG}`, event, 'No'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'No'}
                              />
                              <FormControlLabel
                                  classes={{ label: classes.normalFont, disabled: classes.disabledLabel }}
                                  disabled={view}
                                  control={
                                  <Checkbox
                                      icon={<RadioButtonUncheckedIcon />}
                                      checkedIcon={<RadioButtonCheckedIcon />}
                                      color="primary"
                                      checked={this.state.lipidLoweringDrug === 'Not known' ? true : false}
                                      onChange={(event) => { this.handleRadioGroupChange('lipidLoweringDrug', `${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPID_LOWERING_DRUG}`, event, 'Not known'); }}
                                      classes={{
                                      root: classes.checkBoxStyle
                                    }}
                                  />
                                }
                                  label={'Not known'}
                              />
                            </FormGroup>
                        </Grid>
                      </Grid>

                     <Grid container
                         className={classes.radioGroupContainer}
                     >
                        <Grid item
                            xs={4}
                            className={classes.leftLableCenter}
                        >
                          <span  className={view?classes.disableInputStyle:classes.inputStyle}>Lipodystrophy at injection sites</span>
                        </Grid>
                        <Grid item xs={6}>

                          <JCustomizedSelectFieldValidator
                              isDisabled={view}
                              id={'BICT_34'}
                              value={this.state.injectionSitesValue}
                              options={LIPODYSTROPHY_AT_INJECTION_SITES.map((item) => ({ value:item.value, label:item.lable}))}
                              onChange={(e) => { this.handleDropdownChanged('injectionSitesValue',`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.LIPODYSTROPHY_AT_INJECTION_SITE}`,e);}}
                          />
                        </Grid>
                      </Grid>

                      <Grid container
                          className={classes.radioGroupContainer}
                      >
                        <Grid item
                            xs={4}
                            style={{marginTop:35}}
                        >
                          <span  className={view?classes.disableInputStyle:classes.inputStyle}>Drug adherence</span>
                        </Grid>
                        <Grid item xs={6}>
                          <TextareaField
                              id={`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.DRUG_ADHERENCE}`}
                              fieldValMap={backgroundInformationFieldValMap}
                              prefix={MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}
                              mramId={MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.DRUG_ADHERENCE}
                              updateState={this.props.updateState}
                              viewMode={view}
                              maxLength={MRAM_FEILD_MAX_LENGTH.remarks}
                          />
                        </Grid>
                      </Grid>

                      <Grid container
                          className={classes.radioGroupContainer}
                          style={{marginBottom:10}}
                      >
                        <Grid item
                            xs={4}
                            style={{marginTop:35}}
                        >
                          <span  className={view?classes.disableInputStyle:classes.inputStyle}>Remarks</span>
                        </Grid>
                        <Grid item xs={6}>
                          <TextareaField
                              id={`${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}_${MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.REMARKS}`}
                              fieldValMap={backgroundInformationFieldValMap}
                              prefix={MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_PREFIX}
                              mramId={MRAM_BACKGROUNDINFOMATION_CURRENT_TREATMENT_ID.REMARKS}
                              updateState={this.props.updateState}
                              viewMode={view}
                              maxLength={MRAM_FEILD_MAX_LENGTH.remarks}
                          />
                        </Grid>
                      </Grid>
                    </ValidatorForm>
                  </Grid>
                 </Grid>
                </Grid>
              </Grid>
            </Paper>
          </Typography>
        </CardContent>
      </Card>
    );
  }
}


export default withStyles(styles)(BackgroundInformation);

