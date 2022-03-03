/*
 * Front-end UI for insert input problem/procedure
 * Save Action: [ServiceFavouriteDialog.js] Save -> handleSave
 * -> problem: [problemAction.js] saveInputProblem / procedure: [procedureAction.js] saveInputProcedure
 * -> problem: [problemSaga.js] saveInputProblem / procedure: [procedureSaga.js] saveInputProcedure
 * -> problem: Backend API = /diagnosis/savePatientProblems / procedure: Backend API = /diagnosis/savePatientProcedures
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, Dialog, DialogTitle, DialogContent, Divider, DialogActions, Grid, Button, Paper,Typography } from '@material-ui/core';
import { styles } from './serviceFavouriteDialogStyle';
import SearchBox from './components/SearchBox/SearchBox';
import TemplateFieldset from './components/TemplateFieldset/TemplateFieldset';
import SelectedBox from './components/SelectedBox/SelectedBox';
import {PROBLEM_MODE,DEFAULT_PROBLEM_SAVE_STATUS} from '../../../../constants/diagnosis/diagnosisConstants';
import {PROCEDURE_MODE,DEFAULT_PROCEDURE_SAVE_STATUS} from '../../../../constants/procedure/procedureConstants';
import {openCommonCircularDialog,closeCommonCircularDialog} from '../../../../store/actions/common/commonAction';
import { getInputProblemList } from '../../../../store/actions/consultation/dxpx/diagnosis/diagnosisAction';
import { getInputProcedureList } from '../../../../store/actions/consultation/dxpx/procedure/procedureAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { SERVICE_FAVOURITE_CODE } from '../../../../constants/message/serviceFavouriteCode';
// import { COMMON_CODE } from '../../../../constants/message/common/commonCode';
import Draggable from 'react-draggable';
import {isEqual,cloneDeep} from 'lodash';
import CIMSButton from '../../../../components/Buttons/CIMSButton';

function PaperComponent(props) {
  return (
    <Draggable
        enableUserSelectHack={false}
        onStart={(e)=> e.target.getAttribute('customdrag') === 'allowed'}
    >
      <Paper {...props} />
    </Draggable>
  );
}

class ServiceFavouriteDialog extends Component {
  constructor(props){
    super(props);
    this.state={
      originTemplateMap:new Map(),
      filterTemplateMap:new Map(),
      selectedTemplateSet:new Set(),
      selectedTemplateIdSet:new Set(),
      problemTemplateList:[],
      procedureTemplateList:[]
    };
  }

  componentDidMount(){
    const { mode,problemTemplateList,procedureTemplateList } = this.props;
    let tempMap = new Map();
    switch (mode) {
      case PROBLEM_MODE:{
        problemTemplateList.forEach(item=>{
          tempMap.set(item.groupName,item.dxpxTemplates);
        });
        break;
      }
      case PROCEDURE_MODE:{
        procedureTemplateList.forEach(item=>{
          tempMap.set(item.groupName,item.dxpxTemplates);
        });
        break;
      }
      default:
        break;
    }
    this.setState({
      originTemplateMap:tempMap,
      filterTemplateMap:tempMap,
      procedureTemplateList:procedureTemplateList,
      problemTemplateList:problemTemplateList
    });
  }

  UNSAFE_componentWillUpdate(nextProps) {
    const { mode,isOpen } = this.props;
    const { procedureTemplateList,problemTemplateList } = this.state;
    if (isOpen) {
      let tempMap = new Map();
      let flag = false;
      switch (mode) {
        case PROBLEM_MODE:{
          if (!isEqual(nextProps.problemTemplateList,problemTemplateList)) {
            nextProps.problemTemplateList.forEach(item=>{
              tempMap.set(item.groupName,item.dxpxTemplates);
            });
            flag = true;
          }
          break;
        }
        case PROCEDURE_MODE:{
          if (!isEqual(nextProps.procedureTemplateList,procedureTemplateList)) {
            nextProps.procedureTemplateList.forEach(item=>{
              tempMap.set(item.groupName,item.dxpxTemplates);
            });
            flag = true;
          }
          break;
        }
        default:
          break;
      }
      if (flag) {
        this.setState({
          originTemplateMap:tempMap,
          filterTemplateMap:tempMap,
          procedureTemplateList:nextProps.procedureTemplateList,
          problemTemplateList:nextProps.problemTemplateList
        });
      }
    }
  }

  updateState = (obj) => {
    this.setState({
      ...obj
    });
  }

  generateResultObj = () => {
    const {mode=PROBLEM_MODE,patientKey,encounterId} = this.props;
    let {selectedTemplateSet} = this.state;
    let resultObj = {
      patientKey,
      encounterId,
      dtos:[]
    };
    switch (mode) {
      case PROBLEM_MODE:{
        for (let item of selectedTemplateSet.values()) {
          resultObj.dtos.push({
            patientKey,
            encounterId,
            diagnosisStatusCd:DEFAULT_PROBLEM_SAVE_STATUS,
            codeTermId:item.codeTermId,
            diagnosisText:item.diagnosisName,
            diagnosisName:item.diagnosisName,
            remarks:item.remarks,
            isServiceFavourite:true
          });
        }
        break;
      }
      case PROCEDURE_MODE:{
        for (let item of selectedTemplateSet.values()) {
          resultObj.dtos.push({
            patientKey,
            encounterId,
            diagnosisStatusCd:DEFAULT_PROCEDURE_SAVE_STATUS,
            codeTermId:item.codeTermId,
            procedureText:item.diagnosisName,
            procedureName:item.diagnosisName,
            remarks:item.remarks,
            isServiceFavourite:true
          });
        }
        break;
      }
      default:
        break;
    }
    return resultObj;
  }

  handleSave = () => {
    const { handleClose,mode=PROBLEM_MODE,addMethod,insertDxpxLog,type} = this.props;
    let resultObj = this.generateResultObj();
    if (resultObj.dtos.length !== 0) {
        let content=`Selected ${type}(s):`;
        resultObj.dtos.forEach(element => {
            content+=`${element.diagnosisName}(${element.codeTermId});`;
        });
        this.props.openCommonCircularDialog();
        switch (mode) {
          case PROBLEM_MODE:{
            addMethod&&addMethod(resultObj.dtos);
            insertDxpxLog(`[${type} Service Favourite Dialog] Action: Click 'OK' button`, '',content);
            this.InitialData();
            handleClose&&handleClose();
            this.props.closeCommonCircularDialog();
            break;
          }
          case PROCEDURE_MODE:{
            addMethod&&addMethod(resultObj.dtos);
            insertDxpxLog(`[${type} Service Favourite Dialog] Action: Click 'OK' button`, '',content);
            this.props.closeCommonCircularDialog();
            this.InitialData();
            handleClose&&handleClose();
            break;
          }
          default:
            break;
        }
    } else {
      this.InitialData();
      handleClose&&handleClose();
    }
  }

  handleCancel = () => {
    const {mode=PROBLEM_MODE,handleClose,insertDxpxLog,type} = this.props;
    let {selectedTemplateSet} = this.state;
    if (selectedTemplateSet.size>0) {
      let payload = {
        msgCode: mode === PROBLEM_MODE ? SERVICE_FAVOURITE_CODE.CLOSE_PROBLEM_DIALOG_COMFIRM : SERVICE_FAVOURITE_CODE.CLOSE_PROCEDURE_DIALOG_COMFIRM,
        btnActions: {
          // Yes
          btn1Click: () => {
            this.InitialData();
            handleClose&&handleClose();
            insertDxpxLog(`[${type} Service Favourite Dialog] Action: Click 'Cancel' button`, '');
          }
        }
      };
      this.props.openCommonMessage(payload);
    } else {
      this.InitialData();
      handleClose&&handleClose();
      insertDxpxLog(`[${type} Service Favourite Dialog] Action: Click 'Cancel' button`, '');
    }
  }

  InitialData = () => {
    this.setState({
      originTemplateMap: new Map(),
      filterTemplateMap: new Map(),
      selectedTemplateSet: new Set(),
      selectedTemplateIdSet: new Set(),
      problemTemplateList: [],
      procedureTemplateList: []
    });
  }

  generateLabel = (mode) => {
    switch (mode) {
      case PROBLEM_MODE:
        return {
          //Search Diagnosis
          searchBoxLabel: 'Search Service Favourite Problem',
          templateFieldseLegendText: 'Available Problem',
          selectedBoxLegendText: 'Selected Problem'
        };
      case PROCEDURE_MODE:
        return {
          //Search Procedure
          searchBoxLabel: 'Search Service Favourite Procedure',
          templateFieldseLegendText: 'Available Procedure',
          selectedBoxLegendText: 'Selected Procedure'
        };
      default:
        break;
    }
  }

  resetState = () => {
    let { originTemplateMap } = this.state;
    this.setState({
      filterTemplateMap:cloneDeep(originTemplateMap),
      selectedTemplateSet:new Set(),
      selectedTemplateIdSet:new Set()
    });
  }

  render() {
    const {
      classes,
      mode=PROBLEM_MODE, //Default:problem
      isOpen=false,
      insertDxpxLog,
      type
    } = this.props;
    let {originTemplateMap,filterTemplateMap,selectedTemplateSet,selectedTemplateIdSet} = this.state;

    let labelObj = this.generateLabel(mode);
    let searchBoxProps = {
      labelText: labelObj.searchBoxLabel,
      originTemplateMap,
      insertDxpxLog,
      updateState: this.updateState,
      type
    };
    let templateFieldsetProps = {
      legendText: labelObj.templateFieldseLegendText,
      filterTemplateMap,
      selectedTemplateSet,
      selectedTemplateIdSet,
      insertDxpxLog,
      type,
      updateState: this.updateState
    };
    let selectedBoxProps = {
      legendText: labelObj.selectedBoxLegendText,
      selectedTemplateSet,
      selectedTemplateIdSet,
      insertDxpxLog,
      type,
      updateState: this.updateState
    };

    return (
      <Dialog
          fullWidth
          id={`${mode}_service_favourite_dialog`}
          maxWidth="lg"
          open={isOpen}
          PaperComponent={PaperComponent}
          scroll="body"
          onExited={this.resetState}
          onEscapeKeyDown={this.handleCancel}
      >
        {/* title */}
        <DialogTitle className={classes.dialogTitle} customdrag="allowed" disableTypography>
          Service Favourite
        </DialogTitle>
        {/* content */}
        <Typography component="div" className={classes.dialogBorder}>
          <DialogContent
              classes={{
                'root':classes.dialogContent
              }}
          >
            <Grid
                classes={{
                  'container':classes.gridWrapper
                }}
                container
            >
              {/* search box */}
              <Grid item xs={12}>
                <SearchBox {...searchBoxProps}/>
              </Grid>
              {/* available box*/}
              <Grid
                  classes={{
                  'grid-xs-12':classes.gridXs12
                }}
                  item
                  xs={12}
              >
                <TemplateFieldset {...templateFieldsetProps}/>
              </Grid>
              {/* selected box */}
              <Grid
                  classes={{
                  'grid-xs-12':classes.gridXs12
                }}
                  item
                  xs={12}
              >
                <SelectedBox {...selectedBoxProps}/>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          {/* button group */}
          <DialogActions className={classes.dialogAcitons}>
            <Grid
                alignItems="center"
                container
                direction="row"
                justify="flex-end"
            >
              <CIMSButton
                  id="btn_favourite_dialog_save"
                  onClick={this.handleSave}
              >
                OK
              </CIMSButton>
              <CIMSButton
                  id="btn_favourite_dialog_cancel"
                  onClick={this.handleCancel}
              >
                Cancel
              </CIMSButton>
            </Grid>
          </DialogActions>
        </Typography>
      </Dialog>
    );
  }
}

const mapStateToProps = state => {
  return {
    problemTemplateList: state.diagnosisReducer.templateList,
    procedureTemplateList: state.procedureReducer.templateList
  };
};

const mapDispatchToProps = {
  openCommonMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  getInputProblemList,
  getInputProcedureList
};

export default connect(mapStateToProps,mapDispatchToProps)(withStyles(styles)(ServiceFavouriteDialog));
