import React, { Component } from 'react';
import { connect } from 'react-redux';
import {Grid, Typography,Checkbox,RadioGroup,FormControlLabel,Radio,Table,TableBody,TableRow,TableCell,FormGroup,Card,CardContent,Paper} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@material-ui/icons/RadioButtonChecked';
import {style} from './dietAssessmentStyle';
import {Person} from '@material-ui/icons';
import moment from 'moment';
import { isEqual,includes} from 'lodash';
import * as generalUtil from '../../utils/generalUtil';
import {COMMON_ACTION_TYPE} from '../../../../../constants/common/commonConstants';
import {
  MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID,
  MRAM_DIETASSESSMENT_DASM_PREFIX
} from '../../../../../constants/MRAM/dietAssessment/dietAssessmentConstants';
import { MRAM_FEILD_MAX_LENGTH } from '../../../../../constants/MRAM/mramConstant';
import DatePicker from '../../components/DateTextField/DateTextField';
import _ from 'lodash';
import TextareaField from '../../components/TextareaField/TextareaField';
import NameTextField from '../../components/NameTextField/NameTextField';

class DietAssessment extends Component {

  static initCheckBoxValue=(dietAssessmentFieldValMap)=>{
    let fieldValObj = dietAssessmentFieldValMap.get('dasm_168');
    let fiveList = [
      { label: 'Breakfast', value: 'Breakfast', checked: false },
      { label: 'Lunch', value: 'Lunch', checked: false },
      { label: 'Dinner', value: 'Dinner', checked: false },
      { label: 'Rarely eat out', value: 'Rarely eat out', checked: false }
    ];
    if(fieldValObj.value!==null){
        // arr=fieldValObj.value.split(',');
        // for (let index = 0; index < arr.length; index++) {
        //   fiveList[index].checked=arr[index]==='1'?true:false;
        // }
        for (let index = 0; index < fiveList.length; index++) {
          fiveList[index].checked=includes(fieldValObj.value,fiveList[index].value)?true:false;
        }
    }
    return fiveList;
  }

  constructor(props) {
    super(props);
    this.state = {
      dateTime:'',
      textArea:'',
      loginName:'',
      gender5:[],
      oneList:[{label:'2 meals',value:'2 meals'},{label:'3 meals',value:'3 meals'},{label:'>3 meals',value:'>3 meals'},{label:'Not fixed meals',value:'Not fixed meals'}],
      twoList:[{label:'Regular portion',value:'Regular portion'},{label:'Irregular portion',value:'Irregular portion'},{label:'No carbonhydrates sometimes',value:'No carbonhydrates sometimes'},{label:'No carbonhydrates at all',value:'No carbonhydrates at all'}],
      threeList:[{label:'< 1 bowl',value:'< 1 bowl'},{label:'1 bowl',value:'1 bowl'},{label:'2 bowls',value:'2 bowls'},{label:'3 bowls',value:'3 bowls'}],
      fourList:[{label:'< 1 portion',value:'< 1 portion'},{label:'1 portion',value:'1 portion'},{label:'2 portions',value:'2 portions'},{label:'3 portions',value:'3 portions'}],
      fiveList:[{label:'Breakfast',value:'Breakfast',checked:false},{label:'Lunch',value:'Lunch',checked:false},{label:'Dinner',value:'Dinner',checked:false},{label:'Rarely eat out',value:'Rarely eat out',checked:false}],
      sixList:[{label:'> 4 times',value:'> 4 times'},{label:'2-3 times',value:'2-3 times'},{label:'Once',value:'Once'},{label:'Never',value:'Never'}],
      dietAssessmentFieldValMap:new Map()
    };
    this.resetStatus = _.debounce(this.resetStatus, 800);
}

static getDerivedStateFromProps(props, state) {
  let { dietAssessmentFieldValMap } = props;
  if (!isEqual(dietAssessmentFieldValMap,state.dietAssessmentFieldValMap)) {
    let dateTime=dietAssessmentFieldValMap.get(`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.ASSESSMETN_DATE}`).value;
    let fiveList=DietAssessment.initCheckBoxValue(dietAssessmentFieldValMap);
    return {
      dietAssessmentFieldValMap,
      fiveList,
      dateTime
    };
  }
  return null;
}

  handleChange=(obj,prefix,mramId,type)=>{
    let { dietAssessmentFieldValMap } = this.state;
    let fieldValObj = dietAssessmentFieldValMap.get(`${prefix}_${mramId}`);
    let value = obj.target.checked ? type : '';
    fieldValObj.value = value;
    generalUtil.handleOperationType(fieldValObj);
    // if(mramId != MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_7){
      this.setState({
        dietAssessmentFieldValMap
      });
    // }
    this.resetStatus(dietAssessmentFieldValMap);
  }

  handleCheckBoxChange = (index) => {
    let { dietAssessmentFieldValMap } = this.state;
    let fieldValObj = dietAssessmentFieldValMap.get('dasm_168');
    let items = [...this.state.fiveList];
    let checkBoxArr = '';
    items[index].checked = !items[index].checked;
    let falseTimes = 0;
    for (let i = 0; i < items.length; i++) {
      if (i === 0) {
        if (items[i].checked) {
          checkBoxArr = items[i].value;
        } else {
          falseTimes++;
        }
      } else {
        if (items[i].checked) {
          checkBoxArr = checkBoxArr === '' ? items[i].value : checkBoxArr + ',' + items[i].value;
        } else {
          falseTimes++;
        }
      }
    }
    this.handleCheckBoxOperationType(fieldValObj,falseTimes);
    this.updateValMaps(dietAssessmentFieldValMap);
    fieldValObj.value=checkBoxArr;
    this.setState({
      dietAssessmentFieldValMap
    });
    this.setState({fiveList:items});
  }

  handleCheckBoxOperationType=(fieldValObj,falseTimes)=>{
    let { version } = fieldValObj;
    if (version!==null) {
      if (falseTimes!==4) {
        fieldValObj.operationType = COMMON_ACTION_TYPE.UPDATE;
      } else {
        fieldValObj.operationType = COMMON_ACTION_TYPE.DELETE;
      }
    } else if (version === null && falseTimes !==4) {
      fieldValObj.operationType = COMMON_ACTION_TYPE.INSERT;
    } else {
      fieldValObj.operationType = null;
    }

  }

  handleTextAreaChange=(e)=>{
    this.setState({
      textArea:e.target.value
    });
  }

  getLoginName=(obj,prefix,mramId)=>{
    let { loginInfo } = this.props;
    let { dietAssessmentFieldValMap } = this.state;
    let fieldValObj = dietAssessmentFieldValMap.get(`${prefix}_${mramId}`);
    fieldValObj.value = loginInfo.userDto.salutation?`${loginInfo.userDto.salutation} ${loginInfo.userDto.engSurname} ${loginInfo.userDto.engGivName}`:`${loginInfo.userDto.engSurname} ${loginInfo.userDto.engGivName}`;
    generalUtil.handleOperationType(fieldValObj);
    this.updateValMaps(dietAssessmentFieldValMap);
    this.setState({
      dietAssessmentFieldValMap
    });
  }

  changeLoginName=(e)=>{
    this.setState({loginName:e.target.value});
  }

  changeDateTime=(e)=>{
    this.setState({dateTime:e!==null?moment(e).format('DD-MM-YYYY'):''});
  }

  updateValMaps = (map) => {
    const { updateState } = this.props;
    updateState&&updateState({
      dietAssessmentFieldValMap:map
    });
  }

  resetStatus = (fieldValMap) =>{
    const { updateState } = this.props;
    updateState && updateState({
      dietAssessmentFieldValMap:fieldValMap
    });
  }

  initCheckBoxValue=(dietAssessmentFieldValMap)=>{
      let fieldValObj = dietAssessmentFieldValMap.get('dasm_168');
      let arr=[];
      let fiveList=this.state.fiveList;
      if(fieldValObj.value!==null){
          arr=fieldValObj.value.split(',');
          for (let index = 0; index < arr.length; index++) {
            fiveList[index].checked=arr[index]==='1'?true:false;
          }
        }
      this.setState({fiveList});
  }

  handleDateChanged = (obj,prefix,mramId) => {
    let { updateState} = this.props;
    let { dietAssessmentFieldValMap } = this.state;
    let fieldValObj = dietAssessmentFieldValMap.get(`${prefix}_${mramId}`);
    let val = obj!==null?moment(obj).format('DD-MMM-YYYY'):'';
    if(val==='Invalid date'){
      fieldValObj.isError=true;
    }
    else{
      fieldValObj.isError=false;
    }
    fieldValObj.value = val===''?(moment(new Date()).format('DD-MMM-YYYY')):val;
    generalUtil.handleOperationType(fieldValObj);
    if(val!==''){
      this.setState({
        val
      });
    }
    updateState&&updateState({
      dietAssessmentFieldValMap
    });
  }

  render() {
    const { classes,view=false } = this.props;
    let { dietAssessmentFieldValMap } = this.state;
    return (
      <Card className={classes.card} style={{height: this.props.height}}>
        <CardContent className={classes.cardContent}>
          <Typography component="div">
            <Paper elevation={1} className={classes.wrapper}>
              <Typography className={classes.leftHeader} component="h3" variant="h5">Dietitian Assessment</Typography>
                <Table id="tableDietitianAssessment">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography className={classes.font} component="div">
                          Please answer the following questions based on your diet in the past 7days
                        </Typography>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell>
                        <Grid alignItems="center" container>
                          <Grid item xs={4} className={classes.wordWrap}>
                            <Typography className={classes.font} component="div">
                              <span className={classes.font}>1.How many main meals do you have per day?</span>
                            </Typography>
                          </Grid>
                          <Grid item xs={8} className={classes.wordWrap}>
                              <FormGroup aria-label="position" row className={classes.radioGroup} id="DASM_164">
                                {this.state.oneList.map((item, index) => {
                                  return (
                                    <FormControlLabel
                                        className={classes.Checkbox}
                                        key={index}
                                        disabled={view}
                                        style={{ marginLeft: 50, width: '16%' }}
                                        control={
                                        <Checkbox
                                            icon={<RadioButtonUncheckedIcon />}
                                            checkedIcon={<RadioButtonCheckedIcon />}
                                            color="primary"
                                            id={`Radio_DASM_164_${index}`}
                                            onChange={(obj) => { this.handleChange(obj, MRAM_DIETASSESSMENT_DASM_PREFIX, MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_1, item.value); }}
                                            checked={item.value ===
                                            (dietAssessmentFieldValMap.has(`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_1}`) ?
                                              dietAssessmentFieldValMap.get(`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_1}`).value : ''
                                            ) ? true : false}
                                        />
                                      }
                                        label={item.label}
                                        classes={{
                                          label: classes.answerFont
                                        }}
                                    />
                                  );
                                })}
                              </FormGroup>
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <Grid alignItems="center" container>
                            <Grid item xs={4} className={classes.wordWrap}>
                              <Typography className={classes.font} component="div">
                                <span className={classes.font}>2.Regarding carbonhydrates intake(e.g.rice/noodles/congee/spaghetti),how is the portion in your main meal usually?</span>
                              </Typography>
                            </Grid>
                            <Grid item xs={8} className={classes.wordWrap}>
                              <FormGroup className={classes.radioGroup} id="DASM_165">
                                {this.state.twoList.map((item, index) => {
                                  return (
                                    <FormControlLabel
                                        className={classes.Checkbox}
                                        key={index}
                                        disabled={view}
                                        control={
                                        <Checkbox
                                            icon={<RadioButtonUncheckedIcon />}
                                            checkedIcon={<RadioButtonCheckedIcon />}
                                            color="primary"
                                            id={`Radio_DASM_165_${index}`}
                                            onChange={(obj) => { this.handleChange(obj, MRAM_DIETASSESSMENT_DASM_PREFIX, MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_2, item.value); }}
                                            checked={item.value ===
                                            (dietAssessmentFieldValMap.has(`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_2}`) ?
                                              dietAssessmentFieldValMap.get(`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_2}`).value : ''
                                            ) ? true : false}
                                        />
                                      }
                                        label={item.label}
                                        classes={{
                                        label: classes.answerFont
                                      }}
                                    />
                                  );
                                })}
                              </FormGroup>
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <Grid alignItems="center" container>
                            <Grid item xs={4} className={classes.wordWrap}>
                              <Typography className={classes.font} component="div">
                                <span className={classes.font}>3.How much vegetables do you have per day?</span>
                              </Typography>
                            </Grid>
                            <Grid item xs={8} className={classes.wordWrap}>
                              <FormGroup aria-label="position" row className={classes.radioGroup} id="DASM_166">
                                {this.state.threeList.map((item, index) => {
                                    return (
                                      <FormControlLabel
                                          className={classes.Checkbox}
                                          key={index}
                                          disabled={view}
                                          control={
                                          <Checkbox
                                              icon={<RadioButtonUncheckedIcon />}
                                              checkedIcon={<RadioButtonCheckedIcon />}
                                              color="primary"
                                              id={`Radio_DASM_166_${index}`}
                                              onChange={(obj) => { this.handleChange(obj, MRAM_DIETASSESSMENT_DASM_PREFIX, MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_3, item.value); }}
                                              checked={item.value ===
                                              (dietAssessmentFieldValMap.has(`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_3}`) ?
                                                dietAssessmentFieldValMap.get(`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_3}`).value : ''
                                              ) ? true : false}
                                          />
                                        }
                                          label={item.label}
                                          classes={{
                                          label: classes.answerFont
                                        }}
                                      />
                                    );
                                  })}
                              </FormGroup>
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Grid alignItems="center" container>
                            <Grid item xs={4} className={classes.wordWrap}>
                              <Typography className={classes.font} component="div">
                                <span className={classes.font}>4.How many portions of fruits do you have per day?</span>
                              </Typography>
                            </Grid>
                            <Grid item xs={8} className={classes.wordWrap}>
                              <FormGroup aria-label="position" row className={classes.radioGroup} id="DASM_167">
                                {this.state.fourList.map((item, index) => {
                                      return (
                                        <FormControlLabel
                                            className={classes.Checkbox}
                                            key={index}
                                            disabled={view}
                                            control={
                                            <Checkbox
                                                icon={<RadioButtonUncheckedIcon />}
                                                checkedIcon={<RadioButtonCheckedIcon />}
                                                color="primary"
                                                id={`Radio_DASM_167_${index}`}
                                                onChange={(obj) => { this.handleChange(obj, MRAM_DIETASSESSMENT_DASM_PREFIX, MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_4, item.value); }}
                                                checked={item.value ===
                                                (dietAssessmentFieldValMap.has(`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_4}`) ?
                                                  dietAssessmentFieldValMap.get(`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_4}`).value : ''
                                                ) ? true : false}
                                            />
                                          }
                                            label={item.label}
                                            classes={{
                                            label: classes.answerFont
                                          }}
                                        />
                                      );
                                    })}
                              </FormGroup>
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <Grid alignItems="center" container>
                            <Grid item xs={4} className={classes.wordWrap}>
                              <Typography className={classes.font} component="div">
                                <span className={classes.font}>5.When do you mostly eat out?(Tick all that apply)</span>
                              </Typography>
                            </Grid>
                            <Grid item xs={8} className={classes.wordWrap} >
                              {this.state.fiveList.map((item,index) => {
                                return (
                                  <FormControlLabel
                                      className={classes.Checkbox}
                                      control={
                                      <Checkbox
                                          disabled={view}
                                          name="DASM_168"
                                          color="primary"
                                          checked={item.checked}
                                          onClick={()=>this.handleCheckBoxChange(index)}
                                      />}
                                      key={index}
                                      label={item.label}
                                      value={item.value}
                                      classes={{
                                        label: classes.answerFont
                                      }}
                                  />
                                  );
                              })}
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <Grid alignItems="center" container>
                            <Grid item xs={4} className={classes.wordWrap}>
                              <Typography className={classes.font} component="div">
                                <span className={classes.font}>6.How often do you have food or beverages that contain simple sugar?(e.g fruit juice/ soda/ sweet soup)</span>
                              </Typography>
                            </Grid>
                            <Grid item xs={8} className={classes.wordWrap}>
                                <FormGroup aria-label="position" row className={classes.radioGroup} id="DASM_169">
                                  {this.state.sixList.map((item, index) => {
                                      return (
                                        <FormControlLabel
                                            className={classes.Checkbox}
                                            key={index}
                                            disabled={view}
                                            control={
                                            <Checkbox
                                                icon={<RadioButtonUncheckedIcon />}
                                                checkedIcon={<RadioButtonCheckedIcon />}
                                                color="primary"
                                                id={`Radio_DASM_169_${index}`}
                                                onChange={(obj) => { this.handleChange(obj, MRAM_DIETASSESSMENT_DASM_PREFIX, MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_6, item.value); }}
                                                checked={item.value ===
                                                (dietAssessmentFieldValMap.has(`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_6}`) ?
                                                  dietAssessmentFieldValMap.get(`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_6}`).value : ''
                                                ) ? true : false}
                                            />
                                          }
                                            label={item.label}
                                            classes={{
                                            label: classes.answerFont
                                          }}
                                        />
                                      );
                                    })}
                              </FormGroup>
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell>
                          <Grid alignItems="center" container>
                            <Grid item xs={4} className={classes.wordWrap}>
                              <Typography className={classes.font} component="div">
                                <span className={classes.font}>7.Other</span>
                              </Typography>
                            </Grid>
                            <Grid item xs={8} className={classes.wordWrap}>
                              <div className={classes.textAreaMargin}>
                                <TextareaField
                                    classes={{textBox:classes.textBox}}
                                    id={`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_7}`}
                                    fieldValMap={dietAssessmentFieldValMap}
                                    prefix={MRAM_DIETASSESSMENT_DASM_PREFIX}
                                    mramId={MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.QUESTION_7}
                                    updateState={this.props.updateState}
                                    viewMode={view}
                                    maxLength={MRAM_FEILD_MAX_LENGTH.remarks}
                                />
                              </div>
                            </Grid>
                          </Grid>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <Typography className={classes.contentHeader}
                      component="h3"
                      variant="h5"
                  >
                    Other Information
                  </Typography>
                  <Typography className={classes.otherInformation}
                      component="div" id="divOtherInformation"
                  >
                    <Grid className={classes.font} container>
                      <Grid item xs={2} className={classes.font} style={{marginTop:7}}>
                        Assessed by
                      </Grid>
                      <Grid item xs={4} className={classes.width50}>
                        <div className={classes.width50}>
                          <NameTextField
                              id={`${MRAM_DIETASSESSMENT_DASM_PREFIX}_${MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.ASSESSED_BY}`}
                              fieldValMap={dietAssessmentFieldValMap}
                              prefix={MRAM_DIETASSESSMENT_DASM_PREFIX}
                              mramId={MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.ASSESSED_BY}
                              updateState={this.props.updateState}
                              viewMode={view}
                          />
                        </div>
                      </Grid>
                      <Grid item xs={2} className={classes.font} style={{marginTop:7}}>
                        Assessment date
                      </Grid>
                      <Grid item
                          style={{
                              flexBasis:'32%',
                              fontSize: '1rem',
                              fontWeight:'normal'
                            }}
                          xs={4}
                      >
                        <DatePicker
                            fieldValMap={dietAssessmentFieldValMap}
                            prefix={MRAM_DIETASSESSMENT_DASM_PREFIX}
                            mramId={MRAM_DIETASSESSMENT_DASM_EXAMINATION_ID.ASSESSMETN_DATE}
                            updateState={this.props.updateState}
                            id="DASM_172"
                            disabled={view}
                        />
                      </Grid>
                    </Grid>
                  </Typography>
                </Paper>
              </Typography>
            </CardContent>
          </Card>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginInfo: state.login.loginInfo
  };
};

export default connect(mapStateToProps)(withStyles(style)(DietAssessment));
