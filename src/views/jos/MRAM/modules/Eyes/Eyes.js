import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Card, CardContent, Typography, Grid, Paper, Table, TableHead, TableRow, TableCell, TableBody, RadioGroup, FormControl, FormControlLabel, withStyles, Checkbox } from '@material-ui/core';
import { styles } from './EyesStyle';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import classNames from 'classnames';
import { MRAM_EYES_OTHER_INFORMATION_PREFIX, MRAM_EYES_PREFIX, MRAM_EYES_ID, MRAM_EYES_OTHER_INFORMATION_ID, DL_GRADE_OF_DIABETIC_RETINOPATHY, DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY, DL_ACCESSED_BY, DL_DIABETIC_RETINOPATHY_SUMMARY, RANGE_BEST_VISUAL_ACUITY, DERIVING_RULE_DIABETIC_RETINOPATHY_SUMMARY_RELATED_ITEM_IDS } from '../../../../../constants/MRAM/eyes/eyesConstant';
import { RADIO_OPTION_1,RADIO_OPTION_2,RADIO_OPTION_3 } from '../../../../../constants/MRAM/mramConstant';
import JCustomizedSelectFieldValidator from '../../../../../components/JSelect/JCustomizedSelect/JCustomizedSelectFieldValidator';
// import CustomizedSelectFieldValidator from '../../../../../components/Select/CustomizedSelect/CustomizedSelectFieldValidator';
import _, { isEqual } from 'lodash';
import DecimalTextField from '../../components/DecimalTextField/DecimalTextField';
import * as generalUtil from '../../utils/generalUtil';
import DateTextField from '../../components/DateTextField/DateTextField';
import NameTextField from '../../components/NameTextField/NameTextField';
import TextareaField from '../../components/TextareaField/TextareaField';
import RadioField from '../../components/RadioField/RadioField';
import { MRAM_FEILD_MAX_LENGTH } from '../../../../../constants/MRAM/mramConstant';

class Eyes extends Component {
  constructor(props){
    super(props);
    this.state={
      rightCataractExtractedDisabledFlag: true,
      leftCataractExtractedDisabledFlag: true,
      rightExudativeIschaemicOption:false,
      leftExudativeIschaemicOption:false,
      rightExudativeIschaemicDisabledFlag: true,
      leftExudativeIschaemicDisabledFlag: true,
      rightMaculopathyVal:'',
      leftMaculopathyVal:'',
      rightExudativeIschaemicVal: false,
      leftExudativeIschaemicVal: false,
      eyesFieldValMap:new Map()
    };
  }

  static getDerivedStateFromProps(props, state) {
    let { eyesFieldValMap } = props;
    if (!isEqual(eyesFieldValMap,state.eyesFieldValMap)) {
      return {
        eyesFieldValMap
      };
    }
    return null;
  }

  updateValMaps = (map) => {
    const { updateState } = this.props;
    updateState&&updateState({
      eyesFieldValMap:map
    });
  }

  handleDiabeticRetinopathySummary = (mramId) => {
    let { eyesFieldValMap } = this.state;
    let index = _.findIndex(DERIVING_RULE_DIABETIC_RETINOPATHY_SUMMARY_RELATED_ITEM_IDS, targetId => targetId === mramId);
    if (index !== -1) {
      let fieldValObj = eyesFieldValMap.get(`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.DIABETIC_RETINOPATHY_SUMMARY}`);
      let val = 'Not known';
      let GDR_R = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_DIABETIC_RETINOPATHY}`).value;
      let GDR_L = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_GRADE_OF_DIABETIC_RETINOPATHY}`).value;
      let MA_R = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_MACULOPATHY}`).value;
      let MA_L = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_MACULOPATHY}`).value;
      let TRD_R = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_TRACTIONAL_RETINAL_DETACHMENT}`).value;
      let TRD_L = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_TRACTIONAL_RETINAL_DETACHMENT}`).value;
      let NG_R = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_NEOVASCULAR_GLAUCOMA}`).value;
      let NG_L = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_NEOVASCULAR_GLAUCOMA}`).value;

      let LRM_R = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_LASER_FOR_RETINOPATHY_OR_MACULOPATHY}`).value;
      let LRM_L = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_LASER_FOR_RETINOPATHY_OR_MACULOPATHY}`).value;
      let VE_R = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_VITRECTOMY}`).value;
      let VE_L = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_VITRECTOMY}`).value;
      let EAR_R = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_ANTIVEGF_RX}`).value;
      let EAR_L = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_ANTIVEGF_RX}`).value;
      // Advanced DM Eye Disease
      if (TRD_R === 'Yes' || TRD_L === 'Yes' || MA_R === 'exudative/ischaemic' || MA_L === 'exudative/ischaemic' || NG_R === 'Yes' || NG_L === 'Yes') {
        val = 'Advanced DM Eye Disease';
      } else if ((EAR_R === 'Yes'||EAR_L === 'Yes') ||(VE_R === 'Yes'||VE_L === 'Yes') ||(LRM_R === 'Yes'||LRM_L === 'Yes') ||(MA_R === 'Yes'||MA_L === 'Yes')||(GDR_R === 'Severe NPDR'||GDR_L === 'Severe NPDR'||GDR_R === 'PDR'||GDR_L === 'PDR') ) {
        // Sight threatening retinopathy
        val = 'Sight threatening retinopathy';
      } else if ((GDR_R === 'Mild NPDR'||GDR_L === 'Mild NPDR'||GDR_R === 'Moderate NPDR'||GDR_L === 'Moderate NPDR') && ( MA_R === 'No'&& MA_L === 'No')) {
        // Non sight threatening retinopathy
        val = 'Non sight threatening retinopathy';
      } else if (GDR_R==='No DR'&&GDR_L==='No DR') {
        // No retinopathy
        val = 'No retinopathy';
      }
      fieldValObj.value = val;
      generalUtil.handleOperationType(fieldValObj);
      this.updateValMaps(eyesFieldValMap);
    }
  }

  handleMaculopathy = (val,mramId) => {
    let {
      rightExudativeIschaemicDisabledFlag,
      leftExudativeIschaemicDisabledFlag,
      rightMaculopathyVal,
      leftMaculopathyVal,
      rightExudativeIschaemicVal,
      leftExudativeIschaemicVal
    } = this.state;
    if (mramId === MRAM_EYES_ID.RIGHT_EYE_MACULOPATHY) {
      rightMaculopathyVal = val;
      rightExudativeIschaemicVal = false;
      if (val === 'Yes') {
        rightExudativeIschaemicDisabledFlag = false;
      } else {
        rightExudativeIschaemicDisabledFlag = true;
      }
    } else if (mramId === MRAM_EYES_ID.LEFT_EYE_MACULOPATHY) {
      leftMaculopathyVal = val;
      leftExudativeIschaemicVal = false;
      if (val === 'Yes') {
        leftExudativeIschaemicDisabledFlag = false;
      } else {
        leftExudativeIschaemicDisabledFlag = true;
      }
    }
    this.setState({
      rightExudativeIschaemicDisabledFlag,
      leftExudativeIschaemicDisabledFlag,
      rightMaculopathyVal,
      leftMaculopathyVal,
      rightExudativeIschaemicVal,
      leftExudativeIschaemicVal
    });
    this.handleDiabeticRetinopathySummary(mramId);
  }

  handleRadioChanged = (event,prefix,mramId) => {
    let { eyesFieldValMap } = this.state;
    let fieldValObj = eyesFieldValMap.get(`${prefix}_${mramId}`);
    fieldValObj.value = event.target.value;
    this.handleMaculopathy(event.target.value,mramId);
    generalUtil.handleOperationType(fieldValObj);
    this.updateValMaps(eyesFieldValMap);
    this.setState({
      eyesFieldValMap
    });
  }

  handleMaculopathyCheckBoxChanged = (prefix,mramId) => event => {
    let {
      eyesFieldValMap,
      rightExudativeIschaemicVal,
      leftExudativeIschaemicVal
    } = this.state;
    let fieldValObj = eyesFieldValMap.get(`${prefix}_${mramId}`);
    if (event.target.checked) {
      fieldValObj.value = 'exudative/ischaemic';
    } else {
      fieldValObj.value = 'Yes';
    }
    if (mramId === MRAM_EYES_ID.RIGHT_EYE_MACULOPATHY) {
      rightExudativeIschaemicVal = event.target.checked;
    } else if (mramId === MRAM_EYES_ID.LEFT_EYE_MACULOPATHY) {
      leftExudativeIschaemicVal = event.target.checked;
    }
    generalUtil.handleOperationType(fieldValObj);
    this.setState({
      rightExudativeIschaemicVal,
      leftExudativeIschaemicVal,
      eyesFieldValMap
    });
    this.updateValMaps(eyesFieldValMap);
    this.handleDiabeticRetinopathySummary(mramId);
  }

  handleGradeOfDiabeticRetinopathy = (prefix,mramId) => {
    let { eyesFieldValMap } = this.state;
    if (mramId === MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_DIABETIC_RETINOPATHY||mramId === MRAM_EYES_ID.LEFT_EYE_GRADE_OF_DIABETIC_RETINOPATHY) {
      let fieldValObj = eyesFieldValMap.get(`${prefix}_${mramId}`);
      let val = '';
      switch (fieldValObj.value) {
        case '[Blank]':
          val = 'Not known';
          break;
        case 'No HR':
          val = 'Not known';
          break;
        case 'Mild NPDR':
          val = 'Not known';
          break;
        case 'Moderate NPDR':
          val = 'Not known';
          break;
        case 'Severe NPDR':
          val = 'Sight threatening retinopathy';
          break;
        case 'PRD':
          val = 'Sight threatening retinopathy';
          break;
        default:
          break;
      }
      let summaryObj = eyesFieldValMap.get(`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.DIABETIC_RETINOPATHY_SUMMARY}`);
      summaryObj.value = val;
      generalUtil.handleOperationType(summaryObj);
    }
  }

  handleDropdownChanged = (obj,prefix,mramId) => {
    let { eyesFieldValMap } = this.state;
    let fieldValObj = eyesFieldValMap.get(`${prefix}_${mramId}`);
    fieldValObj.value = obj.value;
    this.handleGradeOfDiabeticRetinopathy(prefix,mramId);
    this.handleDiabeticRetinopathySummary(mramId);
    generalUtil.handleOperationType(fieldValObj);
    this.updateValMaps(eyesFieldValMap);
    this.setState({
      eyesFieldValMap
    });
  }

  handleCataractExtracted = (val,mramId) => {
    let { rightCataractExtractedDisabledFlag, leftCataractExtractedDisabledFlag, eyesFieldValMap } = this.state;
    if (mramId === MRAM_EYES_ID.RIGHT_EYE_CATARACT_EXTRACTED) {
      rightCataractExtractedDisabledFlag = val === 'Yes'?true:false;
      if (rightCataractExtractedDisabledFlag) {
        let fieldValObj = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_PRESENCE_OF_CATARACT}`);
        fieldValObj.value = '';
        generalUtil.handleOperationType(fieldValObj);
      }
    } else if (mramId === MRAM_EYES_ID.LEFT_EYE_CATARACT_EXTRACTED) {
      leftCataractExtractedDisabledFlag = val === 'Yes'?true:false;
      if (leftCataractExtractedDisabledFlag) {
        let fieldValObj = eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_PRESENCE_OF_CATARACT}`);
        fieldValObj.value = '';
        generalUtil.handleOperationType(fieldValObj);
      }
    }

    this.setState({
      rightCataractExtractedDisabledFlag,
      leftCataractExtractedDisabledFlag,
      eyesFieldValMap
    });
    this.updateValMaps(eyesFieldValMap);
  }

  render() {
    const { classes,view=false } = this.props;
    let { eyesFieldValMap } = this.state;
    let rightMaculopathyFlag = eyesFieldValMap.has(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_MACULOPATHY}`);
    let leftMaculopathyFlag= eyesFieldValMap.has(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_MACULOPATHY}`);
    let rightMaculopathyValue = rightMaculopathyFlag?eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_MACULOPATHY}`).value:'';
    let leftMaculopathyValue = leftMaculopathyFlag?eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_MACULOPATHY}`).value:'';
    let rightExudativeIschaemicOption = rightMaculopathyFlag&&(rightMaculopathyValue==='exudative/ischaemic')?true : false;
    let leftExudativeIschaemicOption = leftMaculopathyFlag&&(leftMaculopathyValue==='exudative/ischaemic')?true : false;
    let rightExudativeIschaemicDisabledFlag = rightMaculopathyFlag&&(rightMaculopathyValue==='exudative/ischaemic'||rightMaculopathyValue==='Yes')?false : true;
    let leftExudativeIschaemicDisabledFlag = leftMaculopathyFlag&&(leftMaculopathyValue==='exudative/ischaemic'||leftMaculopathyValue==='Yes')?false : true;
    let rightExudativeIschaemicVal = rightMaculopathyFlag&&(rightMaculopathyValue==='exudative/ischaemic')?true : false;
    let leftExudativeIschaemicVal = leftMaculopathyFlag&&(leftMaculopathyValue==='exudative/ischaemic')?true : false;

    let rightCataractExtractedFlag = eyesFieldValMap.has(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_CATARACT_EXTRACTED}`);
    let leftCataractExtractedFlag = eyesFieldValMap.has(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_CATARACT_EXTRACTED}`);
    let rightCataractExtractedValue = rightCataractExtractedFlag?eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_CATARACT_EXTRACTED}`).value:'';
    let leftCataractExtractedValue = leftCataractExtractedFlag?eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_CATARACT_EXTRACTED}`).value:'';
    let rightCataractExtractedDisabledFlag = rightCataractExtractedValue === 'Yes' ? true : false;
    let leftCataractExtractedDisabledFlag = leftCataractExtractedValue === 'Yes' ? true : false;

    return (
      <Card className={classes.card} style={{height: this.props.height}}>
        <CardContent className={classes.cardContent}>
          <Typography component="div">
            <Paper elevation={1}>
              <Grid container>
                <Grid item xs={7} id="divEyes">
                  <Typography variant="h5" component="h3" className={classes.leftHeader}>
                    Eyes
                  </Typography>
                  <ValidatorForm onSubmit={()=>{}}>
                    <FormControl component="fieldset" className={classes.form}>
                      <Table className={classes.table}>
                        <TableHead>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableHeadFirstCell}></TableCell>
                            <TableCell align="left" className={classNames(classes.tableHeadCell,classes.eyesBorder)}>Right</TableCell>
                            <TableCell align="left" className={classes.tableHeadCell}>Left</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Mydriatic used</TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_MYDRIATIC_USED}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.RIGHT_EYE_MYDRIATIC_USED}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_1}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <RadioGroup
                                  className={classes.radioGroup}
                                  value={
                                    eyesFieldValMap.has(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_MYDRAIATIC_USED}`)?
                                    eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_MYDRAIATIC_USED}`).value:
                                    ''
                                  }
                                  onChange={(e)=>{this.handleRadioChanged(e,MRAM_EYES_PREFIX,MRAM_EYES_ID.LEFT_EYE_MYDRAIATIC_USED);}}
                              >
                                <RadioField
                                    id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_MYDRAIATIC_USED}`}
                                    fieldValMap={eyesFieldValMap}
                                    prefix={MRAM_EYES_PREFIX}
                                    mramId={MRAM_EYES_ID.LEFT_EYE_MYDRAIATIC_USED}
                                    updateState={this.props.updateState}
                                    sideEffect={this.handleMaculopathy}
                                    radioOptions={RADIO_OPTION_1}
                                    viewMode={view}
                                />
                              </RadioGroup>
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>History of Glaucoma</TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_HX_OF_GLAUCOMA}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.RIGHT_EYE_HX_OF_GLAUCOMA}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_HX_OF_GLAUCOMA}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.LEFT_EYE_HX_OF_GLAUCOMA}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow id="trBestVisualAcuity" className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Best visual acuity</TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <DecimalTextField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_BEST_VISUAL_ACUITY}`}
                                  rangeValObj={RANGE_BEST_VISUAL_ACUITY}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.RIGHT_EYE_BEST_VISUAL_ACUITY}
                                  updateState={this.props.updateState}
                                  errorMsg={'The value should be less than 2.'}
                                  abnormal2ErrorSwitch
                                  disabledNegative
                                  // abnormalMsg={'The value should be less than 2.'}
                                  maxLength={5}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <DecimalTextField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_BEST_VISUAL_ACUITY}`}
                                  rangeValObj={RANGE_BEST_VISUAL_ACUITY}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.LEFT_EYE_BEST_VISUAL_ACUITY}
                                  updateState={this.props.updateState}
                                  errorMsg={'The value should be less than 2.'}
                                  abnormal2ErrorSwitch
                                  disabledNegative
                                  // abnormalMsg={'The value should be less than 2.'}
                                  maxLength={5}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Presence of Cataract</TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_PRESENCE_OF_CATARACT}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.RIGHT_EYE_PRESENCE_OF_CATARACT}
                                  updateState={this.props.updateState}
                                  // sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view?true:rightCataractExtractedDisabledFlag}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_PRESENCE_OF_CATARACT}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.LEFT_EYE_PRESENCE_OF_CATARACT}
                                  updateState={this.props.updateState}
                                  // sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view?true:leftCataractExtractedDisabledFlag}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Cataract extracted</TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_CATARACT_EXTRACTED}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.RIGHT_EYE_CATARACT_EXTRACTED}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleCataractExtracted}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_CATARACT_EXTRACTED}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.LEFT_EYE_CATARACT_EXTRACTED}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleCataractExtracted}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Gradable Fundus Photo</TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_GRADABLE_FUNDUS_PHOTO}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.RIGHT_EYE_GRADABLE_FUNDUS_PHOTO}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_GRADABLE_FUNDUS_PHOTO}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.LEFT_EYE_GRADABLE_FUNDUS_PHOTO}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Maculopathy<sup className={classes.sup}>R</sup></TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <Grid container>
                                <Grid item xs={12}>
                                  <RadioField
                                      id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_MACULOPATHY}`}
                                      fieldValMap={eyesFieldValMap}
                                      prefix={MRAM_EYES_PREFIX}
                                      mramId={MRAM_EYES_ID.RIGHT_EYE_MACULOPATHY}
                                      updateState={this.props.updateState}
                                      sideEffect={this.handleMaculopathy}
                                      radioOptions={rightExudativeIschaemicOption?RADIO_OPTION_3:RADIO_OPTION_2}
                                      viewMode={view}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <RadioGroup className={classes.radioGroup}>
                                    <FormControlLabel
                                        classes={{
                                          label: classes.normalFont,
                                          disabled: classes.disabled
                                        }}
                                        label="exudative/ischaemic"
                                        disabled={view?true:rightExudativeIschaemicDisabledFlag}
                                        control={
                                          <Checkbox
                                              color="primary"
                                              id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_MACULOPATHY}_checkbox`}
                                              checked={rightExudativeIschaemicVal}
                                              onChange={this.handleMaculopathyCheckBoxChanged(MRAM_EYES_PREFIX,MRAM_EYES_ID.RIGHT_EYE_MACULOPATHY)}
                                              classes={{
                                                root: classes.checkBoxStyle
                                              }}
                                          />
                                        }
                                    />
                                  </RadioGroup>
                                </Grid>
                              </Grid>
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <Grid container>
                                <Grid item xs={12}>
                                  <RadioField
                                      id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_MACULOPATHY}`}
                                      fieldValMap={eyesFieldValMap}
                                      prefix={MRAM_EYES_PREFIX}
                                      mramId={MRAM_EYES_ID.LEFT_EYE_MACULOPATHY}
                                      updateState={this.props.updateState}
                                      sideEffect={this.handleMaculopathy}
                                      radioOptions={leftExudativeIschaemicOption?RADIO_OPTION_3:RADIO_OPTION_2}
                                      viewMode={view}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <RadioGroup className={classes.radioGroup}>
                                    <FormControlLabel
                                        classes={{
                                          label: classes.normalFont,
                                          disabled: classes.disabled
                                        }}
                                        label="exudative/ischaemic"
                                        disabled={view?true:leftExudativeIschaemicDisabledFlag}
                                        control={
                                          <Checkbox
                                              color="primary"
                                              id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_MACULOPATHY}_checkbox`}
                                              checked={leftExudativeIschaemicVal}
                                              onChange={this.handleMaculopathyCheckBoxChanged(MRAM_EYES_PREFIX,MRAM_EYES_ID.LEFT_EYE_MACULOPATHY)}
                                              classes={{
                                                root: classes.checkBoxStyle
                                              }}
                                          />
                                        }
                                    />
                                  </RadioGroup>
                                </Grid>
                              </Grid>
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Tractional Retinal Detachment<sup className={classes.sup}>R</sup></TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_TRACTIONAL_RETINAL_DETACHMENT}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.RIGHT_EYE_TRACTIONAL_RETINAL_DETACHMENT}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_TRACTIONAL_RETINAL_DETACHMENT}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.LEFT_EYE_TRACTIONAL_RETINAL_DETACHMENT}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Neovascular Glaucoma<sup className={classes.sup}>R</sup></TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_NEOVASCULAR_GLAUCOMA}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.RIGHT_EYE_NEOVASCULAR_GLAUCOMA}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_NEOVASCULAR_GLAUCOMA}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.LEFT_EYE_NEOVASCULAR_GLAUCOMA}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Grade of Diabetic Retinopathy<sup className={classes.sup}>R</sup></TableCell>
                            <TableCell
                                classes={{
                                  'body':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_DIABETIC_RETINOPATHY}_Dropdown`}
                                  options={
                                    DL_GRADE_OF_DIABETIC_RETINOPATHY.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    eyesFieldValMap.has(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_DIABETIC_RETINOPATHY}`)?
                                    eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_DIABETIC_RETINOPATHY}`).value:
                                    ''
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_EYES_PREFIX,MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_DIABETIC_RETINOPATHY);}}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_GRADE_OF_DIABETIC_RETINOPATHY}_Dropdown`}
                                  options={
                                    DL_GRADE_OF_DIABETIC_RETINOPATHY.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    eyesFieldValMap.has(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_GRADE_OF_DIABETIC_RETINOPATHY}`)?
                                    eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_GRADE_OF_DIABETIC_RETINOPATHY}`).value:
                                    ''
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_EYES_PREFIX,MRAM_EYES_ID.LEFT_EYE_GRADE_OF_DIABETIC_RETINOPATHY);}}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Grade of Hypertensive Retinopathy<sup className={classes.sup}>R</sup></TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY}_Dropdown`}
                                  options={
                                    DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    eyesFieldValMap.has(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY}`)?
                                    eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY}`).value:
                                    ''
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_EYES_PREFIX,MRAM_EYES_ID.RIGHT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY);}}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY}_Dropdown`}
                                  options={
                                    DL_GRADE_OF_HYPERTENSIVE_RETINOPATHY.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    eyesFieldValMap.has(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY}`)?
                                    eyesFieldValMap.get(`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY}`).value:
                                    ''
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_EYES_PREFIX,MRAM_EYES_ID.LEFT_EYE_GRADE_OF_HYPERTENSIVE_RETINOPATHY);}}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Laser for retinopathy or maculopathy<sup className={classes.sup}>R</sup></TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_LASER_FOR_RETINOPATHY_OR_MACULOPATHY}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.RIGHT_EYE_LASER_FOR_RETINOPATHY_OR_MACULOPATHY}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_LASER_FOR_RETINOPATHY_OR_MACULOPATHY}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.LEFT_EYE_LASER_FOR_RETINOPATHY_OR_MACULOPATHY}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classes.tableRowFieldCell}>Vitrectomy<sup className={classes.sup}>R</sup></TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_VITRECTOMY}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.RIGHT_EYE_VITRECTOMY}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_VITRECTOMY}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.LEFT_EYE_VITRECTOMY}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classNames(classes.tableRow,classes.tableCrossRow)}>
                            <TableCell className={classes.tableRowFieldCell}>Anti-VEGF Rx<sup className={classes.sup}>R</sup></TableCell>
                            <TableCell
                                classes={{
                                  'root':classNames(classes.tableCellSpan,classes.eyesBorder)
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.RIGHT_EYE_ANTIVEGF_RX}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.RIGHT_EYE_ANTIVEGF_RX}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_PREFIX}_${MRAM_EYES_ID.LEFT_EYE_ANTIVEGF_RX}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_PREFIX}
                                  mramId={MRAM_EYES_ID.LEFT_EYE_ANTIVEGF_RX}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </FormControl>
                  </ValidatorForm>
                </Grid>
                {/* Other Information */}
                <Grid item xs={5} id="divOtherInformation" className={classes.backgroud}>
                  <Typography variant="h5" component="h3" className={classes.rightHeader}>
                    Other Information
                  </Typography>
                  <ValidatorForm onSubmit={()=>{}}>
                    <FormControl component="fieldset" className={classes.form}>
                      <Table>
                        <TableBody>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.width50)}>Assessed by</TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.EYE_ASSESSED_BY}_Dropdown`}
                                  options={
                                    DL_ACCESSED_BY.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    eyesFieldValMap.has(`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.EYE_ASSESSED_BY}`)?
                                    eyesFieldValMap.get(`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.EYE_ASSESSED_BY}`).value:
                                    ''
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_EYES_OTHER_INFORMATION_PREFIX,MRAM_EYES_OTHER_INFORMATION_ID.EYE_ASSESSED_BY);}}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.width50)}>Assessment date</TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <DateTextField
                                  id={`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.EYE_ASSESSSMENT_DATE}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_OTHER_INFORMATION_PREFIX}
                                  mramId={MRAM_EYES_OTHER_INFORMATION_ID.EYE_ASSESSSMENT_DATE}
                                  updateState={this.props.updateState}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.width50)}>Name of physician/examiner</TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <NameTextField
                                  id={`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.EYE_ASSESSMENT_PHYSICIANEXAMINER_NAME}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_OTHER_INFORMATION_PREFIX}
                                  mramId={MRAM_EYES_OTHER_INFORMATION_ID.EYE_ASSESSMENT_PHYSICIANEXAMINER_NAME}
                                  updateState={this.props.updateState}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.width50)}>Diabetic Retinopathy Summary</TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <JCustomizedSelectFieldValidator
                                  id={`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.DIABETIC_RETINOPATHY_SUMMARY}_Dropdown`}
                                  options={
                                    DL_DIABETIC_RETINOPATHY_SUMMARY.map(option => {
                                      return {
                                        label: option.label,
                                        value: option.value
                                      };
                                    })
                                  }
                                  value={
                                    eyesFieldValMap.has(`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.DIABETIC_RETINOPATHY_SUMMARY}`)?
                                    eyesFieldValMap.get(`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.DIABETIC_RETINOPATHY_SUMMARY}`).value:
                                    ' '
                                  }
                                  isDisabled={view}
                                  styles={{ menuPortal: base => ({ ...base, zIndex: 1600 }) }}
                                  menuPortalTarget={document.body}
                                  onChange={(obj)=>{this.handleDropdownChanged(obj,MRAM_EYES_OTHER_INFORMATION_PREFIX,MRAM_EYES_OTHER_INFORMATION_ID.DIABETIC_RETINOPATHY_SUMMARY);}}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell className={classNames(classes.tableRowFieldCell,classes.width50)}>Currently under ophthalmologist follow up</TableCell>
                            <TableCell
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <RadioField
                                  id={`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.CURRENTLY_OPHTHALMOLOGIST_FU}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_OTHER_INFORMATION_PREFIX}
                                  mramId={MRAM_EYES_OTHER_INFORMATION_ID.CURRENTLY_OPHTHALMOLOGIST_FU}
                                  updateState={this.props.updateState}
                                  sideEffect={this.handleMaculopathy}
                                  radioOptions={RADIO_OPTION_2}
                                  viewMode={view}
                              />
                            </TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell colSpan={2} className={classNames(classes.tableRowFieldCell,classes.width50,classes.borderNone)}>Remarks</TableCell>
                          </TableRow>
                          <TableRow className={classes.tableRow}>
                            <TableCell
                                colSpan={2}
                                className={classes.borderNone}
                                classes={{
                                  'root':classes.tableCellSpan
                                }}
                            >
                              <TextareaField
                                  id={`${MRAM_EYES_OTHER_INFORMATION_PREFIX}_${MRAM_EYES_OTHER_INFORMATION_ID.REMARKS}`}
                                  fieldValMap={eyesFieldValMap}
                                  prefix={MRAM_EYES_OTHER_INFORMATION_PREFIX}
                                  mramId={MRAM_EYES_OTHER_INFORMATION_ID.REMARKS}
                                  updateState={this.props.updateState}
                                  viewMode={view}
                                  maxLength={MRAM_FEILD_MAX_LENGTH.remarks}
                              />
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </FormControl>
                  </ValidatorForm>
                </Grid>
              </Grid>
            </Paper>
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

export default connect()(withStyles(styles)(Eyes));
