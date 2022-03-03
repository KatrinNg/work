import React, { Component } from 'react';
import { withStyles, Card, CardContent, Grid } from '@material-ui/core';
import { connect } from 'react-redux';
import { openErrorMessage } from '../../../store/actions/common/commonAction';

import { previewReportClinicalSummary } from '../../../store/actions/report/clinicalSummaryReportAction';
import ValidatorForm from '../../../components/FormValidator/ValidatorForm';
import { isUndefined, find } from 'lodash';
import PreviewPdfDialog from './components/printDialog/PreviewPdfDialog';
import {openCommonCircularDialog,closeCommonCircularDialog} from '../../../store/actions/common/commonAction';
import { openCommonMessage } from '../../../store/actions/message/messageAction';
import { josPrint} from '../../../store/actions/common/commonAction';
import Container from 'components/JContainer';
import * as commonUtils from '../../../utilities/josCommonUtilties';
// import PdfJsViewer from '../../../components/Preview/PdfJsViewer';
//  import PdfJsViewer from './components/index';
// import * as moeUtilities from '../../../utilities/moe/moeUtilities';
const styles = () => ({
  root: {
    width: '100%'
  },
  selectLabel: {
    fontSize: '1rem',
    float: 'left',
    paddingTop: '3px',
    paddingRight: '10px',
    fontFamily: 'Arial',
    fontWeight: 'bold'
  },
  fontLabel: {
    fontFamily: 'Arial',
    fontSize: '1rem'
  }
});

class ClinicalSummaryReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false,
      selectedServiceVal: '',
      selectedEncounterVal: '',
      selectedPatientKey: '',
      previewShow:false,
      previewData:null
    };
  }

  componentDidMount(){
    this.props.ensureDidMount();
  }

  closePreviewDialog=()=>{
    this.setState({previewShow:false});
  }

  handlePreview=()=>{
    this.props.openCommonCircularDialog();
    let { encounterData } = this.props;
    let { encounterId,patientKey,encounterDate,serviceCd,clinicCd } = encounterData;

    const params = {
      // serviceCd:loginService.serviceCd,
      encounterId,
      encounterServiceCd: serviceCd,
      encounterClinicCd: clinicCd,
      patientKey,
      encounterDate,
      patientDto: commonUtils.reportGeneratePatientDto()
    };
    this.props.previewReportClinicalSummary({
      params,
      callback:(data) =>{
        this.setState({
          previewData:data,
          previewShow:true
        });
      }
    });
  }

  print=()=>{
    this.props.openCommonCircularDialog();
    this.props.josPrint({
      base64:this.state.previewData,
      callback:(result)=>{
        if(result){
          let payload = {
            msgCode: '101317',
            showSnackbar:true,
            params:[
              {name:'reportType',value:'report'}
            ]
          };
          this.props.openCommonMessage(payload);
        }
        // else{
        //   let payload = {
        //     msgCode: '101318',
        //     params:[
        //       {name:'reportTypeTitle',value:'Report'},
        //       {name:'reportType',value:'report'}
        //     ]
        //   };
        //     this.props.openCommonMessage(payload);
        // }
        this.props.closeCommonCircularDialog();
      }
    });
  }

  b64toBlob = (b64Data, contentType, sliceSize) => {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offSet = 0; offSet < byteCharacters.length; offSet += sliceSize) {
        let slice = byteCharacters.slice(offSet, offSet + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        let byteArray = new Uint8Array(byteNumbers);

        byteArrays.push(byteArray);
    }
     let blob = new Blob(byteArrays, { type: contentType });
    return blob;

};

  render() {
    const { classes} = this.props;
    const buttonBar={
      isEdit:false,
      // height:'64px',
      // position:'fixed',
      buttons:[{
        title:'Preview',
        onClick:this.handlePreview,
        id:'preview_button'
      }],
      isPosition:true
    };

    return (
      <div className={classes.root}>
        <Card>
          <CardContent>
            <div>
              <ValidatorForm
                  onSubmit={() => { }}
                  ref="testForm"
              >
                <Grid container style={{ marginBottom: '10px' }}>
                  <Grid item xs={12}>
                    <PreviewPdfDialog
                        open
                        id={'previewPdfDialog'}
                        previewShow={this.state.previewShow}
                        previewData={this.state.previewData}
                        closePreviewDialog={this.closePreviewDialog}
                        print={this.print}
                    />
                    {/* <PdfJsViewer
                        url={{url: this.state.previewData ? window.URL.createObjectURL(this.b64toBlob(this.state.previewData, 'application/pdf')) : 'absolute'}}
                        disablePrint
                    /> */}
                  </Grid>
                </Grid>
              </ValidatorForm>
            </div>
            {/* test button */}
            <Container  buttonBar={buttonBar}/>
          </CardContent>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    loginService: state.login.service,
    // service: state.medicalSummary.tempServiceList.service,
    // encounterList: state.medicalSummary.tempEncounterList,
    encounterData: state.patient.encounterInfo
  };
};

const mapDispatchToProps = {
  previewReportClinicalSummary,
  openErrorMessage,
  openCommonCircularDialog,
  closeCommonCircularDialog,
  josPrint,
  openCommonMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ClinicalSummaryReport));
