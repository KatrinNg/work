
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {style} from './mramPrintCss';
import { withStyles } from '@material-ui/core/styles';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {Grid, Typography} from '@material-ui/core';
import CIMSButton from '../../../../components/Buttons/CIMSButton';
import  EditTemplateDialog from './EditMRAMPrintDialog';
import {requestHistoryService} from '../../../../store/actions/MRAM/mramHistory/mramHistoryAction';
import { openCommonMessage } from '../../../../store/actions/message/messageAction';
import { getMramFieldValueList,initMramFieldValueList} from '../../../../store/actions/MRAM/mramAction';
import {openCommonCircularDialog,closeCommonCircularDialog} from '../../../../store/actions/common/commonAction';
import {
    Card,
    CardContent,
    CardHeader
  } from '@material-ui/core';


class MRAMPrintDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
        pageNum:null,
        openPrint: this.props.openPrint,
        report:'Metabolic Risk Assessment Report'
    };
  }

  // initData = (patientKey) => {
  //   if(patientKey!==undefined){
  //     this.props.openCommonCircularDialog();
  //     const params = {patientKey:patientKey};
  //     this.props.requestHistoryService({
  //       params,
  //       callback:(templateList) =>{
  //         this.props.closeCommonCircularDialog();
  //         this.setState({
  //           templateList: templateList.data,
  //           selectRow:null
  //         });
  //       }
  //     });
  //   }
  // };

  handleDialogClose=()=>{
    let {handleClose,insertMramLog}=this.props;
    insertMramLog&&insertMramLog('[MRAM Report Dialog] Action: Click \'Cancel\' button','');
    handleClose&&handleClose();
  }

  handleRadio=(obj)=>{
    this.setState({report:obj.target.value});
  }

  handleViewOpen=()=>{
    let {getPreviewReportData,insertMramLog}=this.props;
    let apiName = this.state.report === 'Metabolic Risk Assessment Report' ? '/mram/reportMramReport' : '/mram/reportMramPatientReport';
    let name = `[MRAM Report Dialog] Action: Click 'OK' button to view ${this.state.report}`;
    insertMramLog && insertMramLog(name, apiName);
    if(this.state.report!==undefined&&this.state.report!==null){
      getPreviewReportData&&getPreviewReportData(this.state.report,'');
    }
  }

  render() {
    const {classes,openPrint} = this.props;
    return (
      <EditTemplateDialog
          dialogTitle={'MRAM Report'}
          open={openPrint}
          onEscapeKeyDown={() => this.handleDialogClose()}
          classes={{
          paper: classes.paper
        }}
      >
        <Card className={classes.CardPosition}>
          <CardHeader title={'Print'} className={classes.titlelabel} />
          <CardContent>
            <RadioGroup className={classes.radioGroup} onChange={this.handleRadio} value={this.state.report}>
              <FormControlLabel className={classes.radioPosition}
                  classes={{ label: classes.normalFont }}
                  label="Metabolic Risk Assessment Report"
                  value={'Metabolic Risk Assessment Report'}
                  control={<Radio color="primary" />}
              />
              <FormControlLabel classes={{ label: classes.normalFont }}
                  label="Metabolic Risk Assessment Patient Summary"
                  value={'Metabolic Risk Assessment Patient Summary'}
                  control={<Radio color="primary" />}
              />
            </RadioGroup>
          </CardContent>
        </Card>
        <Typography component="div" >
          <Grid container justify="flex-end">
            <CIMSButton
                classes={{
                  root: classes.btnRoot,
                  label: classes.fontLabel
                }}
                color="primary"
                id="btn_mramPrint_affirm"
                size="small"
                onClick={this.handleViewOpen}
            >
              OK
            </CIMSButton>
            <CIMSButton
                classes={{
                  root: classes.btnRoot,
                  label: classes.fontLabel
                }}
                color="primary"
                id="btn_mramPrint_reset"
                onClick={() => this.handleDialogClose()}
                size="small"
            >
              Cancel
            </CIMSButton>
          </Grid>
        </Typography>
      </EditTemplateDialog>
    );
  }
}

function mapStateToProps(state) {
  return {
    templateList: state.diagnosisReducer.templateList
  };
}
const mapDispatchToProps = {
  requestHistoryService,
  getMramFieldValueList,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  openCommonMessage,
  initMramFieldValueList
};
export default connect(mapStateToProps,mapDispatchToProps)(withStyles(style)(MRAMPrintDialog));
