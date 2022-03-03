import React, { Component } from 'react';
import { Card, CardContent, Typography, Grid, Paper, Table, TableHead, TableRow, TableCell, TableBody, RadioGroup, FormControl, FormControlLabel, withStyles, Checkbox } from '@material-ui/core';
import { styles } from './CarePlanStyle';
import classNames from 'classnames';
import ValidatorForm from '../../../../../components/FormValidator/ValidatorForm';
import { MRAM_CARE_PLAN_PREFIX, MRAM_CARE_PLAN_ID, RISK_LEVEL_CATEGORY } from '../../../../../constants/MRAM/carePlan/carePlanConstant';
import JCustomizedSelectFieldValidator from '../../../../../components/JSelect/JCustomizedSelect/JCustomizedSelectFieldValidator';
import * as generalUtil from '../../utils/generalUtil';
import { MRAM_FEILD_MAX_LENGTH } from '../../../../../constants/MRAM/mramConstant';
import _ from 'lodash';
import TextareaField from '../../components/TextareaField/TextareaField';

class CarePlan extends Component {
  constructor(props) {
    super(props);
    this.state = {
     riskCategory:' ',
     pageValueChange:'',
     dietitian_1:'',
     dietitian_2:'',
     podiatrist_1:'',
     podiatrist_2:'',
     nurse_educator_1:'',
     nurse_educator_2:'',
     ophthalmologist_1:'',
     ophthalmologist_2:'',
     managementCarePlan:' ',
     remarks:' ',
     patient_empowerment_programme:'',
     wound_care:'',
     patient_support_call_centre:'',
     smoking_counselling:'',
     carePlanFieldValMap:new Map()
    };
  }

  UNSAFE_componentWillUpdate(nextProps){
    if (nextProps.carePlanFieldValMap !== this.props.carePlanFieldValMap||nextProps.view!==this.props.view) {
      this.setState({
        carePlanFieldValMap:nextProps.carePlanFieldValMap
      });
    }
  }

  handleCheckBoxChange = (event,mramId,name) => {
    let {carePlanFieldValMap}=this.state;
    if(event.target.checked){
      if(name.endsWith('1')){
        if(carePlanFieldValMap.has(mramId)){
          let arry= carePlanFieldValMap.get(mramId).value.endsWith('2')?'1,2':'1';
          this.changeMapObjValue(mramId,arry);
        }
      }else if(name.endsWith('2')){
        if(carePlanFieldValMap.has(mramId)){
          let arry= carePlanFieldValMap.get(mramId).value.startsWith('1')?'1,2':'2';
          this.changeMapObjValue(mramId,arry);
        }
      }else{
        this.changeMapObjValue(mramId,event.target.checked);
      }
    }else{
      if(name.endsWith('1')){
        if(carePlanFieldValMap.has(mramId)){
          let arry= carePlanFieldValMap.get(mramId).value.endsWith('2')?'2':'';
          this.changeMapObjValue(mramId,arry);
        }
      }else if(name.endsWith('2')){
        if(carePlanFieldValMap.has(mramId)){
          let arry= carePlanFieldValMap.get(mramId).value.startsWith('1')?'1':'';
          this.changeMapObjValue(mramId,arry);
        }
      }else{
        this.changeMapObjValue(mramId,event.target.checked);
      }
    }
  }

  changeMapObjValue=(mramId,value,errorFlag)=>{
    let { updateState } = this.props;
    let { carePlanFieldValMap } = this.state;
    let fieldValObj = carePlanFieldValMap.get(mramId);
    fieldValObj.value = value;
    generalUtil.handleOperationType(fieldValObj);
    if (errorFlag) {
      fieldValObj.isError=errorFlag;
    } else {
      fieldValObj.isError=false;
    }
    updateState&&updateState({
      carePlanFieldValMap
    });
  }

  riskCategoryChange= (e) => {
    this.changeMapObjValue(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.RISK_LEVEL_CATEGORY}`,e.value);
    this.setState({
      riskCategory:e.value
    });
  }

  textareaNotesChange = (mranId,e) => {
    this.changeMapObjValue(mranId,e.target.value);
  };

  render() {
    const { classes,carePlanFieldValMap,view } = this.props;
    return (
      <Card className={classes.card} style={{height: this.props.height}}>
        <CardContent className={classes.cardContent}>
          <Typography component="div">
            <Paper elevation={1} className={classes.paper}>
              {/* Risk Level */}
              <div id="divRiskLevel">
                <Typography variant="h5" component="h3" className={classes.header}>
                  Risk Level
                </Typography>
                <ValidatorForm onSubmit={()=>{}} id={'mramRiskProfileCarePlanEducationOrFollowUp'}>
                  <Grid container className={classes.levelGrid}>
                    <Grid item xs={12}>
                      <label className={classes.levelLabel}>Risk level category</label>
                      <div className={classes.levelSelect}>
                        <JCustomizedSelectFieldValidator
                            isDisabled={view}
                            id={`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.RISK_LEVEL_CATEGORY}_dropDown`}
                            value={
                                    carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.RISK_LEVEL_CATEGORY}`)?
                                    carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.RISK_LEVEL_CATEGORY}`).value:
                                    ' '
                                  }
                            options={RISK_LEVEL_CATEGORY.map((item) => ({ value:item.value, label:item.lable}))}
                            onChange={(e) => { this.riskCategoryChange(e);}}
                        />
                      </div>
                    </Grid>
                  </Grid>
                </ValidatorForm>
              </div>
              {/* Care Plan */}
              <div id="divCarePlan">
                <Typography variant="h5" component="h3" className={classes.middleHeader}>
                  Care Plan
                </Typography>
                <Grid container>
                  <Grid item xs={6}>
                    <ValidatorForm onSubmit={()=>{}}>
                      <FormControl component="fieldset" style={{marginInlineStart:1}} className={classes.form}>
                        <Table className={classes.table}>
                          <TableHead>
                            <TableRow className={classes.tableRow}>
                              <TableCell colSpan={2} className={classNames(classes.tableHeadFirstCell,classes.tableHeadCell)}>Education / Follow Up</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow className={classes.tableRow}>
                              <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Dietitian</TableCell>
                              <TableCell>
                                <RadioGroup className={classes.radioGroup}>
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.DIETITIAN}`)?
                                      (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.DIETITIAN}`).value.includes('1')?true:false):false}
                                      value="dietitian_1" control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}}/>} label="Ever attended" onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.DIETITIAN}`,'dietitian_1');}}
                                  />
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.DIETITIAN}`)?
                                     (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.DIETITIAN}`).value.includes('2')?true:false):false}
                                      value="dietitian_2" control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}}/>} label="Require referral"  onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.DIETITIAN}`,'dietitian_2');}}
                                  />
                                </RadioGroup>
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Podiatrist</TableCell>
                              <TableCell>
                                <RadioGroup className={classes.radioGroup}>
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PODIARTRIST}`)?
                                      (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PODIARTRIST}`).value.includes('1')?true:false):false}
                                      value="podiatrist_1" control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}} />} label="Ever attended" onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PODIARTRIST}`,'podiatrist_1');}}
                                  />
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PODIARTRIST}`)?
                                      (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PODIARTRIST}`).value.includes('2')?true:false):false}
                                      value="podiatrist_2" control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}}/>} label="Require referral"  onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PODIARTRIST}`,'podiatrist_2');}}
                                  />
                                </RadioGroup>
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Nurse Educator</TableCell>
                              <TableCell>
                                <RadioGroup className={classes.radioGroup}>
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.NURSE_EDUCATION}`)?
                                      (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.NURSE_EDUCATION}`).value.includes('1')?true:false):false}
                                      value="nurse_educator_1" control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}}/>} label="Ever attended" onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.NURSE_EDUCATION}`,'nurse_educator_1');}}
                                  />
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.NURSE_EDUCATION}`)?
                                      (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.NURSE_EDUCATION}`).value.includes('2')?true:false):false}
                                      value="nurse_educator_2" control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}}/>} label="Require referral" onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.NURSE_EDUCATION}`,'nurse_educator_2');}}
                                  />
                                </RadioGroup>
                              </TableCell>
                            </TableRow>

                            <TableRow className={classes.tableRow}>
                              <TableCell className={classNames(classes.tableRowFieldCell,classes.firstLevelHeadCell)}>Ophthalmologist</TableCell>
                              <TableCell>
                                <RadioGroup className={classes.radioGroup}>
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.OPHTHALMOLOGIST}`)?
                                      (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.OPHTHALMOLOGIST}`).value.includes('1')?true:false):false}
                                      value="ophthalmologist_1" control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}}/>} label="Ever attended"  onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.OPHTHALMOLOGIST}`,'ophthalmologist_1');}}
                                  />
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.OPHTHALMOLOGIST}`)?
                                  (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.OPHTHALMOLOGIST}`).value.includes('2')?true:false):false}
                                      value="ophthalmologist_2" control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}}/>} label="Require referral"  onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.OPHTHALMOLOGIST}`,'ophthalmologist_2');}}
                                  />
                                </RadioGroup>
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell colSpan={2} className={classNames(classes.tableRowFieldCell,classes.width50,classes.borderNone)}>Management Care Plan</TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell colSpan={2} className={classes.borderNone}>
                                <TextareaField
                                    classes={{textBox:classes.textBox}}
                                    id={`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.MANAGEMENT_CARE_PLAN}`}
                                    fieldValMap={carePlanFieldValMap}
                                    prefix={MRAM_CARE_PLAN_PREFIX}
                                    mramId={MRAM_CARE_PLAN_ID.MANAGEMENT_CARE_PLAN}
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
                  <Grid item xs={6}>
                    <ValidatorForm onSubmit={()=>{}} id={'mramRiskProfileCarePlanRecommendedProgramme'}>
                      <FormControl component="fieldset" className={classes.form}>
                        <Table className={classes.table}>
                          <TableHead>
                            <TableRow className={classes.tableRow}>
                              <TableCell colSpan={2} className={classNames(classes.tableHeadFirstCell,classes.tableHeadCell)}>Recommended Programme</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            <TableRow className={classes.tableRow}>
                              <TableCell colSpan={2}>
                                <RadioGroup className={classNames(classes.radioGroup,classes.paddingLeft5)}>
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={
                                       carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PATIENT_EMPOWERMENT_PROGRAMME}`)?
                                       (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PATIENT_EMPOWERMENT_PROGRAMME}`).value==='true'||carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PATIENT_EMPOWERMENT_PROGRAMME}`).value===true?true:false):false}
                                      control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}}/>}  label="Patient Empowerment Programme"   onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PATIENT_EMPOWERMENT_PROGRAMME}`,'patient_empowerment_programme');}}
                                  />
                                </RadioGroup>
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell colSpan={2}>
                                <RadioGroup className={classNames(classes.radioGroup,classes.paddingLeft5)}>
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={
                                    carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.NAHC_WOUND_CARE}`)?
                                    (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.NAHC_WOUND_CARE}`).value==='true'||carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.NAHC_WOUND_CARE}`).value===true?true:false):false}
                                      control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}}/>} label="NAHC - Wound Care" onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.NAHC_WOUND_CARE}`,'wound_care');}}
                                  />
                                </RadioGroup>
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell colSpan={2}>
                                <RadioGroup className={classNames(classes.radioGroup,classes.paddingLeft5)}>
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={
                                    carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PATIENT_SUPPORT_CALL_CENTRE}`)?
                                    (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PATIENT_SUPPORT_CALL_CENTRE}`).value==='true'||carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PATIENT_SUPPORT_CALL_CENTRE}`).value===true?true:false):false}
                                      control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}}/>} label="Patient Support Call Centre" onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.PATIENT_SUPPORT_CALL_CENTRE}`,'patient_support_call_centre');}}
                                  />
                                </RadioGroup>
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell colSpan={2}>
                                <RadioGroup className={classNames(classes.radioGroup,classes.paddingLeft5)}>
                                  <FormControlLabel
                                      classes={{
                                        label: classes.normalFont,
                                        disabled: classes.disabledLabel
                                      }}
                                      disabled={view}
                                      checked={
                                    carePlanFieldValMap.has(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.SMOKING_COUNSELLING_CESSATION_PROGRAMME}`)?
                                    (carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.SMOKING_COUNSELLING_CESSATION_PROGRAMME}`).value==='true'||carePlanFieldValMap.get(`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.SMOKING_COUNSELLING_CESSATION_PROGRAMME}`).value===true?true:false):false}
                                      control={<Checkbox color="primary" classes={{root:classes.checkBoxStyle}}/>} label="Smoking Counselling & Cessation Programme" onChange={(event)=>{this.handleCheckBoxChange(event,`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.SMOKING_COUNSELLING_CESSATION_PROGRAMME}`,'smoking_counselling');}}
                                  />
                                </RadioGroup>
                              </TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell colSpan={2} className={classNames(classes.tableRowFieldCell,classes.width50,classes.borderNone)}>Remarks</TableCell>
                            </TableRow>
                            <TableRow className={classes.tableRow}>
                              <TableCell colSpan={2} className={classes.borderNone}>
                                <TextareaField
                                    classes={{textBox:classes.textBox}}
                                    id={`${MRAM_CARE_PLAN_PREFIX}_${MRAM_CARE_PLAN_ID.REMARKS}`}
                                    fieldValMap={carePlanFieldValMap}
                                    prefix={MRAM_CARE_PLAN_PREFIX}
                                    mramId={MRAM_CARE_PLAN_ID.REMARKS}
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
              </div>
            </Paper>
          </Typography>
        </CardContent>
      </Card>
    );
  }
}

export default withStyles(styles)(CarePlan);
