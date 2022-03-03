import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import AssessmentBox from './AssessmentBox.js';

import { cariesSelData, 
  perioSelData,
  preBPEInputId,
  prePCAInputId,
  preBPESelectId,
  prePCASelectId,
  ohSelData,
  idSelData,
  chkPCAInputVal,
  chkBPEInputVal,
  getNextInputId,
  getDtoClcDtpDetlObj,
  getDtoClcDtpObj,
  getPcaInputValByLab,
  getPcaInputLabByVal,
  getCariesLalByVal,
  getPerioLalByVal,
  chkSelEmpty,
  chkInEmpty
 } from './common/AssessmentUnit.js';

 import {
  updateAssessment_saga
} from '../../../../../store/actions/dts/clinicalContent/assessmentAction';

const styles = (theme) => ({
});

let assessmentPcaInputVal_1 = "";
let assessmentPcaInputVal_2 = "";
let assessmentPcaInputVal_3 = "";
let assessmentPcaInputVal_4 = "";
let assessmentPcaInputVal_5 = "";
let assessmentPcaInputVal_6 = "";

let assessmentBpeInputVal_1 = "";
let assessmentBpeInputVal_2 = "";
let assessmentBpeInputVal_3 = "";
let assessmentBpeInputVal_4 = "";
let assessmentBpeInputVal_5 = "";
let assessmentBpeInputVal_6 = "";

class Assessment extends Component {

  constructor(props){
    super(props);

    this.state = {
      assessment: true,
      selBPECaries: "",
      selBPEPerio: "",
      selPCAOh: "",
      selPCAId: "",
      clcDtpId: "",
      txtCariesRisk : "",
      txtPerioRisk: "",
      dtsMandatoryEncntrType: this.props.dtsMandatoryEncntrType,
      latestEncounter: this.props.latestEncounter,
      encounterTypes: this.props.encounterTypes,
      patientInfo: this.props.patientInfo,
      isBPERiskMandate: false,
      isBPE6InMandate: false,
      selBpeOneError: false,
      selBpeTwoError: false,
      inBpe6InError: false
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    let dtsMandatoryEncntrType = this.state.dtsMandatoryEncntrType;
    let latestEncounter = this.state.latestEncounter;
    let encounterTypes = this.state.encounterTypes;
    let patientInfo = this.state.patientInfo;

    let encounterType = encounterTypes.find(item => item.encntrTypeId === latestEncounter.encntrTypeId).encntrTypeDesc;
    let isMEType = false;
    let i;
    for (i = 0; i < dtsMandatoryEncntrType.length; i++) {
      if (dtsMandatoryEncntrType[i].value === encounterType) {
        isMEType = true;
      }
    }
    let isBInM = ((patientInfo.age > 17) && isMEType) ? true : false;
    this.setState({ 
      isBPERiskMandate: isMEType,
      isBPE6InMandate: isBInM
    });

    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentDidUpdate(prevProps) {
    
    if (this.props.aData != prevProps.aData) {
      let data = this.props.aData;
      if (data.encntrId !== undefined) {
        let cariesRisk = getCariesLalByVal(String(data.codCariesRiskId));
        let perioRisk = getPerioLalByVal(String(data.codPerioRiskId));
        let txtCariesRisk = (cariesRisk !== "Low" && cariesRisk !== "NA" && cariesRisk !== "") ? " Caries Risk: " + cariesRisk : "";
        let txtPerioRisk = (perioRisk !== "Low" && perioRisk !== "NA" && perioRisk !== "") ? " Perio Risk: " + perioRisk : "";
        txtCariesRisk = (txtPerioRisk !== "" && txtCariesRisk !== "")? txtCariesRisk + "," : txtCariesRisk;

        this.setState({ 
          selBPECaries: data.codCariesRiskId,
          selBPEPerio: data.codPerioRiskId,
          selPCAOh: data.codOralHygieneId,
          selPCAId: data.codInterDentalId,
          clcDtpId: data.clcDtpId,
          txtCariesRisk : txtCariesRisk,
          txtPerioRisk: txtPerioRisk
        });

        let i;
        for (i = 0; i < data.clcDtpDetlDto.length; i++) {

          let detlData = data.clcDtpDetlDto[i];
          let furcation = (detlData.isFurcation === 1) ? "*" : "";
          let type = (detlData.seq < 4) ? "upper" : "lower";
          let bpeInputVal = (detlData.bpe !== null && detlData.bpe !==undefined) ? detlData.bpe + furcation : "";
          let pcaInputVal = (detlData.codPlaqueCtrlId !== null && detlData.codPlaqueCtrlId !==undefined) ? getPcaInputLabByVal(String(detlData.codPlaqueCtrlId), type) : "";
          
          document.getElementById(preBPEInputId + '_' + detlData.seq).value = bpeInputVal;
          document.getElementById(prePCAInputId + '_' + detlData.seq).value = pcaInputVal;

          eval('assessmentBpeInputVal_' + detlData.seq + ' = bpeInputVal');
          eval('assessmentPcaInputVal_' + detlData.seq + ' = pcaInputVal');
        }
      }
    }

    if (this.props.bpeNA != prevProps.bpeNA) {
      this.setBPE2NA();
    }

    if (this.props.save != prevProps.save) {
      this.save();
    }
    
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (event) => {
    let id = document.activeElement.id;
    if (((id.indexOf(preBPEInputId) > -1) || (id.indexOf(prePCAInputId) > -1) || (id.indexOf(preBPESelectId) > -1) || (id.indexOf(prePCASelectId) > -1)) && (id !== "select-" + preBPESelectId + "_2")) {
      switch( event.keyCode ) {
        case 110: {
          event.preventDefault();
          event.stopPropagation();
          document.getElementById(getNextInputId(id)).focus();
          break;
        }
        default: 
            break;
      }
    }
  }

  handelBPECariesSel = (e) => {
    if (e.target.value !== undefined) {
      let isBPERiskMandate = this.state.isBPERiskMandate;
      let selBpeOneError = this.state.selBpeOneError;
      let txtPerioRisk = this.state.txtPerioRisk;

      if (isBPERiskMandate && selBpeOneError && (e.target.value !== "")) { this.setState({ selBpeOneError: false }); }
      
      let cariesRisk = getCariesLalByVal(e.target.value);
      let txtCariesRisk = (cariesRisk !== "Low" && cariesRisk !== "NA" && cariesRisk !== "") ? " Caries Risk: " + cariesRisk : "";
      txtCariesRisk = txtCariesRisk.replace(",", "");
      txtCariesRisk = (txtCariesRisk !== "" && txtPerioRisk !== "")? txtCariesRisk + ", " : txtCariesRisk;

      this.setState({ 
        txtCariesRisk : txtCariesRisk,
        selBPECaries: e.target.value
      });
    
    }
  }

  handelBPEPerioSel = (e) => {
    if (e.target.value !== undefined) {
      let isBPERiskMandate = this.state.isBPERiskMandate;
      let selBpeTwoError = this.state.selBpeTwoError;
      let txtCariesRisk = this.state.txtCariesRisk;

      if (isBPERiskMandate && selBpeTwoError && (e.target.value !== "")) { this.setState({ selBpeTwoError: false }); }
    
      let perioRisk = getPerioLalByVal(e.target.value);
      let txtPerioRisk = (perioRisk !== "Low" && perioRisk !== "NA" && perioRisk !== "") ? " Perio Risk: " + perioRisk : "";
      txtCariesRisk = txtCariesRisk.replace(",", "");
      txtCariesRisk = (txtCariesRisk !== "" && txtPerioRisk !== "") ? txtCariesRisk + ", " : txtCariesRisk;

      this.setState({ 
        txtPerioRisk : txtPerioRisk,
        txtCariesRisk : txtCariesRisk,
        selBPEPerio: e.target.value
      });
    }
  }

  handelPCAOhSel = (e) => {
    if (e.target.value !== undefined) {
      this.setState({ selPCAOh: e.target.value });
    }
  }

  handelPCAIdSel = (e) => {
    if (e.target.value !== undefined) {
      this.setState({ selPCAId: e.target.value });
    }
  }

  handelPCAInputChange = (id) => {
    let val = document.getElementById(id).value.toUpperCase();
    let ids = id.split('_');
    if (val === "") {
      document.getElementById(id).value = val;
      eval('assessmentPcaInputVal_' + ids[1] + ' = val');
    } else {
      let type = (ids[1] < 4) ? "upper" : "lower";
      let nVal = chkPCAInputVal(val, type);
      eval('nVal = (nVal === "") ? assessmentPcaInputVal_' + ids[1] + ' : nVal');
      document.getElementById(id).value = nVal;
      eval('assessmentPcaInputVal_' + ids[1] + ' = nVal');

      if (nVal.length === 5) {
        document.getElementById(getNextInputId(id)).focus();
      }
    }
  }

  handelBPEInputChange = (id) => {
    let val = document.getElementById(id).value.toUpperCase();
    let ids = id.split('_');
    let isBPE6InMandate = this.state.isBPERiskMandate;
    let inBpe6InError = this.state.inBpe6InError;

    if (val === "") {
      document.getElementById(id).value = val;
      eval('assessmentBpeInputVal_' + ids[1] + ' = val');
    } else {
      let nVal = chkBPEInputVal(val);
      eval('nVal = (nVal === "") ? assessmentBpeInputVal_' + ids[1] + ' : nVal');
      document.getElementById(id).value = nVal;
      eval('assessmentBpeInputVal_' + ids[1] + ' = nVal');

      if (nVal.length === 2) {
        document.getElementById(getNextInputId(id)).focus();
      }
    }
    if (isBPE6InMandate && inBpe6InError) {
      this.chkBpe6Input();
    }
  }

  chkBpe6Input = () => {
    let isBpe6InError = false;
    let i;
    for (i = 0; i < 6; i++) {
      let bpeVal = document.getElementById(preBPEInputId + '_' + (i + 1)).value;
      isBpe6InError = (bpeVal === "") ? true: false;
    }
    if (!isBpe6InError) { this.setState({ inBpe6InError: isBpe6InError }); }
  }

  save = () => {
    let dtoClcDtpObj = { ...getDtoClcDtpObj};
    let listClcDtpDetl = [];
    let isBPERiskMandate = this.state.isBPERiskMandate;
    let isBPE6InMandate = this.state.isBPERiskMandate;
    let valBpeCaries = parseInt(this.state.selBPECaries);
    let valBpePerio = parseInt(this.state.selBPEPerio);
    let latestEncounter = this.state.latestEncounter;

    if (!latestEncounter.readOnly) {
      let isBpe6InError = false;
      let isBpeCariesError = (chkSelEmpty(valBpeCaries) && isBPERiskMandate) ? true : false;
      let isBpePerioError = (chkSelEmpty(valBpePerio) && isBPERiskMandate) ? true : false;

      dtoClcDtpObj.encntrId = latestEncounter.encntrId;
      dtoClcDtpObj.codOralHygieneId = parseInt(this.state.selPCAOh);
      dtoClcDtpObj.codInterDentalId = parseInt(this.state.selPCAId);
      dtoClcDtpObj.createBy = latestEncounter.cimsUserPract;

      let i;
      for (i = 0; i < 6; i++) {
        let dtoClcDtpDetlObj = { ...getDtoClcDtpDetlObj};
        let bpeVal = document.getElementById(preBPEInputId + '_' + (i + 1)).value;
        let pcaVal = document.getElementById(prePCAInputId + '_' + (i + 1)).value;

        isBpe6InError = (chkInEmpty(bpeVal) && isBPE6InMandate) ? true : false;
        if (isBpe6InError) { break; }

        dtoClcDtpDetlObj.seq = (i + 1);
        dtoClcDtpDetlObj.bpe = (parseInt(bpeVal.charAt(0)) > -1) ? bpeVal.charAt(0) : bpeVal;
        dtoClcDtpDetlObj.isFurcation = (bpeVal.charAt(1) === "*") ? 1 : 0;
        let type = (i < 3) ? "upper" : "lower";
        dtoClcDtpDetlObj.codPlaqueCtrlId = getPcaInputValByLab(pcaVal, type);
        listClcDtpDetl.push(dtoClcDtpDetlObj);
      }

      if (isBpe6InError) { this.setState({ inBpe6InError: isBpe6InError }); }

      if (isBpeCariesError) {
        this.setState({ selBpeOneError: isBpeCariesError });
      } else {
        dtoClcDtpObj.codCariesRiskId = parseInt(this.state.selBPECaries);
      }

      if (isBpePerioError) {
        this.setState({ selBpeTwoError: isBpePerioError });
      } else {
        dtoClcDtpObj.codPerioRiskId = parseInt(this.state.selBPEPerio);
      }
      
      if (!isBpe6InError && !isBpeCariesError && !isBpePerioError) {
        dtoClcDtpObj.clcDtpDetlDto = listClcDtpDetl;
        this.props.updateAssessment_saga({clcDtpDto: dtoClcDtpObj});
      }
    }
  }

  setBPE2NA = () => {
    let i;
    for (i = 0; i < 6; i++) {
      document.getElementById(preBPEInputId + '_' + (i + 1)).value = "NA";
    }
    this.setState({ 
      selBPECaries : "10787",
      selBPEPerio : "10788"
    });
  }

  render(){

    const { aData, bpeNA, divId, save, classes } = this.props;
    const assessment = this.state.assessment;
    const selBPECaries = this.state.selBPECaries;
    const selBPEPerio = this.state.selBPEPerio;
    const selPCAOh = this.state.selPCAOh;
    const selPCAId = this.state.selPCAId;
    const lengthBPEInput = 2;
    const lengthPCAInput = 5;
    const txtCariesRisk = this.state.txtCariesRisk;
    const txtPerioRisk = this.state.txtPerioRisk;
    const isBPERiskMandate = this.state.isBPERiskMandate;
    const isBPE6InMandate = this.state.isBPE6InMandate;
    const selBpeOneError = this.state.selBpeOneError;
    const selBpeTwoError = this.state.selBpeTwoError;
    const inBpe6InError = this.state.inBpe6InError;
    const isReadOnly = this.state.latestEncounter.readOnly;

    const risk_s = {
      color: "red",
      fontFamily: "Microsoft JhengHei, Calibri",
      fontSize: "1rem",
      fontWeight: "600"
    };

    const leftPadding_s = {
      paddingRight: "40px"
    };

    return (
        <div id={divId}>
          <table>
            <tr>
              <td style={risk_s} colSpan="2">{txtCariesRisk + " " + txtPerioRisk}</td>
            </tr>
            <tr>
              <td style={leftPadding_s}> 
                <AssessmentBox 
                    headerIn="Plaque Control Area"
                    headerSel=""
                    indexS={10}
                    Input_preId={prePCAInputId}
                    input_length={lengthPCAInput}
                    input_handleChange={this.handelPCAInputChange}
                    input_disable={isReadOnly}
                    preSelectId={prePCASelectId}
                    selectOne_data={ohSelData} 
                    selectOne_sel={this.handelPCAOhSel} 
                    selectOne_value={selPCAOh} 
                    selectOne_label="OH"
                    selectOne_disable={isReadOnly}
                    selectTwo_data={idSelData} 
                    selectTwo_sel={this.handelPCAIdSel} 
                    selectTwo_value={selPCAId} 
                    selectTwo_label="ID"
                    selectTwo_disable={isReadOnly}
                /> 
              </td>
              <td> 
                <AssessmentBox 
                    headerIn="BPE"
                    headerSel="Risk"
                    indexS={20}
                    Input_preId={preBPEInputId}
                    input_length={lengthBPEInput}
                    input_mandate={isBPE6InMandate}
                    input_error={inBpe6InError}
                    input_handleChange={this.handelBPEInputChange}
                    input_disable={isReadOnly}
                    preSelectId={preBPESelectId}
                    selectOne_data={cariesSelData} 
                    selectOne_sel={this.handelBPECariesSel} 
                    selectOne_value={selBPECaries} 
                    selectOne_label="Caries"
                    selectOne_mandate={isBPERiskMandate}
                    selectOne_error={selBpeOneError}
                    selectOne_disable={isReadOnly}
                    selectTwo_data={perioSelData} 
                    selectTwo_sel={this.handelBPEPerioSel} 
                    selectTwo_value={selBPEPerio} 
                    selectTwo_label="Perio"
                    selectTwo_mandate={isBPERiskMandate}
                    selectTwo_error={selBpeTwoError}
                    selectTwo_disable={isReadOnly}
                /> 
              </td>
            </tr>
          </table>
        </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    dtsMandatoryEncntrType: state.dtsPreloadData.dtsMandatoryEncntrType,
    latestEncounter: state.clinicalContentEncounter.latestEncounter,
    encounterTypes: state.common.encounterTypes,
    patientInfo: state.patient.patientInfo
  };
};

const mapDispatchToProps = {
  updateAssessment_saga
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Assessment));