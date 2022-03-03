import './components/perioChartComp/css/textarea.css';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import html2canvas from 'html2canvas';
import { skipTab } from '../../../store/actions/mainFrame/mainFrameAction';
import Typography from '@material-ui/core/Typography';
import PerioChartView from './components/perioChartComp/PerioChartView';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import accessRightEnum from '../../../enums/accessRightEnum';
import { print } from '../../../utilities/printUtilities';
import * as jsPDF from 'jspdf';
import { dateJavaToJS, getPCStateNumByEncntrId, getPCViewTypeForId, filterPerioChartView, getNewDtoPCObj, getPockToothInputType, getRecToothInputType, getListPDStateObj, getListPDStateObjT, getList32WithTwo, getList32WithSix, getToothNumByInputId, getTypeFromInputId, removeArrItem, convertToDtoPerioChart, getBoolByNum, getNumByBool, getDtoPCObj, getDtoPCToothObj } from './components/perioChartComp/common/PerioChartUnits.js';
import {
  getPerioChartDataCollectionByPatientKey_saga,
  resetPerioChartCallBack,
  resetPerioChartDataCollection
} from '../../../store/actions/dts/clinicalContent/perioChartAction';
import { axios } from '../../../services/axiosInstance';

const styles = (theme) => ({
  button: {
    borderRadius: 10,
    backgroundColor:'#e0e0eb'
  },
  font: {
    // fontFamily: 'Microsoft JhengHei, Calibri',
    fontSize: '12pt',
    color: 'black'
  }
});

let PerioChartViewList_sRow = 1;
let PerioChartViewList_eRow = 2;
let PerioChartViewList_rowInterval = 2;
let PerioChartViewList_patientKey = 21;

class PerioChartViewList extends Component {

  constructor(props){
    super(props);
    this.state = {
      inputId: '',
      listPCState: [],
      listPDState: getListPDStateObj(),
      listPCSeq: getList32WithSix,
      listRecSeq: getList32WithSix,
      isRecSixInput: true,
      isCmplChartOnly: false,
      isPerioTeamChartOnly: false,
      listNotCmplChartId: [],
      listNotPerioTeamChartId: [],
      isNoData: false,
      isReadOnly: this.props.latestEncounter.readOnly,
      listPrintDivId: []
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    this.props.getPerioChartDataCollectionByPatientKey_saga({patientKey:this.props.latestEncounter.patientKey, sRow:PerioChartViewList_sRow, eRow:PerioChartViewList_eRow});
  }

  componentDidUpdate(prevProps) {
    if(this.props.arrPerioChartDataCollection != prevProps.arrPerioChartDataCollection) {
      this.setState({
        listPCState: this.props.arrPerioChartDataCollection
      });
      if (this.props.arrPerioChartDataCollection.length < PerioChartViewList_rowInterval) {
        this.setState({ isNoData: true });
      } else {
        this.setState({ isNoData: false });
      }
      this.updateChartState(this.props.arrPerioChartDataCollection);
    }
    if(this.props.blnPerioChartCallBack != prevProps.blnPerioChartCallBack) {
      if (this.props.blnPerioChartCallBack) {
        this.props.resetPerioChartCallBack();
        this.props.resetPerioChartDataCollection();
        PerioChartViewList_sRow = 1;
        PerioChartViewList_eRow = 2;
        this.props.getPerioChartDataCollectionByPatientKey_saga({patientKey:this.props.latestEncounter.patientKey, sRow:PerioChartViewList_sRow, eRow:PerioChartViewList_eRow});
      }
    }
  }

  componentWillUnmount() {
    this.props.resetPerioChartCallBack();
    this.props.resetPerioChartDataCollection();
    this.setState({
      isCmplChartOnly: false,
      isPerioTeamChartOnly: false,
      listNotCmplChartId: [],
      listNotPerioTeamChartId: [],
      isNoData: false
    });
    PerioChartViewList_sRow = 1;
    PerioChartViewList_eRow = 2;
    PerioChartViewList_rowInterval = 2;
    // PerioChartViewList_patientKey = 21;
  }

  updateChartState = (data) => {
    this.setState({
      isCmplChartOnly: false,
      isPerioTeamChartOnly: false
    });
    let listNotCmplChartId = [];
    let listNotPerioTeamChartId = [];
    let i;
    for (i = 0; i < data.length; i++) {
      if (!(data[i].perioChartDto.isCmplChart === 1)) {
        listNotCmplChartId.push(data[i].perioChartDto.encntrId);
      }
      if (!(data[i].perioChartDto.isPerioTeam === 1)) {
        listNotPerioTeamChartId.push(data[i].perioChartDto.encntrId);
      }
    }
    this.setState({
      listNotCmplChartId: listNotCmplChartId,
      listNotPerioTeamChartId: listNotPerioTeamChartId
    });
  };

  handleCompleteChartFilterToggle = (e) => {
    let listNotCmplChartId = this.state.listNotCmplChartId;
    let listNotPerioTeamChartId = this.state.listNotPerioTeamChartId;

    let toggleCompleteChart = this.state.isCmplChartOnly;
    let togglePerioTeamChart = this.state.isPerioTeamChartOnly;

    if (toggleCompleteChart) {
      filterPerioChartView(listNotCmplChartId, listNotPerioTeamChartId, getPCViewTypeForId, togglePerioTeamChart, 'block');
      this.setState({isCmplChartOnly: false});
    } else {
      filterPerioChartView(listNotCmplChartId, listNotPerioTeamChartId, getPCViewTypeForId, togglePerioTeamChart, 'none');
      this.setState({isCmplChartOnly: true});
    }
  };

  handlePerioTeamChartFilterToggle = (e) => {
    let listNotCmplChartId = this.state.listNotCmplChartId;
    let listNotPerioTeamChartId = this.state.listNotPerioTeamChartId;

    let toggleCompleteChart = this.state.isCmplChartOnly;
    let togglePerioTeamChart = this.state.isPerioTeamChartOnly;

    if (togglePerioTeamChart) {
      filterPerioChartView(listNotPerioTeamChartId, listNotCmplChartId, getPCViewTypeForId, toggleCompleteChart, 'block');
      this.setState({isPerioTeamChartOnly: false});
    } else {
      filterPerioChartView(listNotPerioTeamChartId, listNotCmplChartId, getPCViewTypeForId, toggleCompleteChart, 'none');
      this.setState({isPerioTeamChartOnly: true});
    }
  };

  handleClickSeeMore = (e) => {
      PerioChartViewList_sRow = PerioChartViewList_sRow + PerioChartViewList_rowInterval;
      PerioChartViewList_eRow = PerioChartViewList_eRow + PerioChartViewList_rowInterval;
      axios
      .get(`/dts-cc/perio-chart/data-collection-byPatientKey/?patientKey=${this.props.latestEncounter.patientKey}&sRow=${PerioChartViewList_sRow}&eRow=${PerioChartViewList_eRow}`)
      .then(response => {
        if (response.data.respCode === 0) {
          let data = response.data.data;
          if (data.length != 0) {
            let listPCState = this.state.listPCState;
            listPCState = listPCState.concat(data);
            this.setState({
              listPCState: listPCState
            });
            this.updateChartState(listPCState);
            if (data.length < PerioChartViewList_rowInterval) {
              this.setState({ isNoData: true });
            }
          } else {
            this.setState({ isNoData: true });
          }
        }
      });
  };

  createNewChart = () => {
    let state = getNewDtoPCObj();
    state.encntrId = this.props.latestEncounter.encounterChartPo.encntrId;
    state.createBy = this.props.latestEncounter.encounterChartPo.createBy;
    state.dspTooth = this.props.latestEncounter.encounterChartPo.dspTooth;
    state.clcEncntrChartId = this.props.latestEncounter.encounterChartPo.clcEncntrChartId;
    this.handleSkipTab(state, accessRightEnum.dtsPerioChart);
  };

  handleSkipTab = (state, target) => {
    this.props.skipTab(
        target,
        {copyPCState: state, chartNum: -1, newEncntrId: this.props.latestEncounter.encounterChartPo.encntrId},
        true
    );
  };

  handlePrint = (e) => {
    this.print();

    // let listPrintDivId = this.state.listPrintDivId;
    // if (listPrintDivId.length > 0) {
    //   let iDiv = document.createElement('div');
    //   let i;
    //   for (i = 0; i < listPrintDivId.length; i++) {
    //     let itm = document.getElementById(listPrintDivId[i]);
    //     iDiv.appendChild(itm.cloneNode(true));
    //   }
    //   document.getElementsByTagName('body')[0].appendChild(iDiv);
    //   html2canvas(iDiv).then((canvas) => {
    //     document.getElementsByTagName('body')[0].removeChild(iDiv);
    //     iDiv.remove();
    //     const imgData = canvas.toDataURL();
    //     let raw = imgData.split(",");
    //     print({base64: raw[1], callback: console.log, copies: 1});
    //   });
    // }
  };

  async print() {
    let listPrintDivId = this.state.listPrintDivId;
    let rawAll = new jsPDF('', 'pt', 'a4');
    let title = "RESTRICTED";

    if (listPrintDivId.length > 0) {
      let listPCState = this.state.listPCState;
      let i = 0;
      let tiTleHeight = 40;
      let subTitHeight = 60;
      let height = 70;
      let options = {
        scale: 3
      };

      rawAll.setFontSize(18);
      rawAll.setFontType("bold");
      rawAll.text(250, tiTleHeight, title);
      let textWidth = rawAll.getTextWidth(title);
      rawAll.setFontType("normal");
      rawAll.setFontSize(10);
      rawAll.line(250, tiTleHeight + 2, 250 + textWidth, tiTleHeight + 2);

      listPrintDivId.sort();
      for (i = 0; i < listPrintDivId.length; i++) {
        let id = listPrintDivId[i].split("_")[1];
        let num = getPCStateNumByEncntrId(listPCState, parseInt(id));
        let txtCmplChart = (parseInt(listPCState[num].perioChartDto.isCmplChart) === 1)? "          ( FULL CHART )" : "";

        let subTitle = "Date: " + dateJavaToJS(listPCState[num].createDtm) + 
        "     Patient Key: " + this.props.patientInfo.patientKey + 
        "     Patient Name: " + this.props.patientInfo.engSurname + " " + this.props.patientInfo.engGivename + 
        txtCmplChart;

        await html2canvas(document.getElementById(listPrintDivId[i]), options).then((canvas) => {
          rawAll.text(20, subTitHeight, subTitle);
          const imgData = canvas.toDataURL("image/png");
          rawAll.addImage(imgData, 'JPEG', 20, height, 600, 200);
        });
        if (this.isOdd(i) && listPrintDivId.length > i + 2) {
          rawAll.addPage();
          subTitHeight = 30;
          height = 40;
        } else {
          subTitHeight = subTitHeight + 240;
          height = height + 240;
        }
      }

      rawAll.setFontSize(18);
      rawAll.setFontType("bold");
      rawAll.text(250, height - 10, title);
      let rawAA = rawAll.output('datauristring').split(',');
      print({base64: rawAA[1], callback: console.log, copies: 1});
    }

  }

  isOdd = (num) => { return num % 2;};

  handleOnClickPrintSel = (e) => {
    let tarChk = e.target.checked;
    let tarVal = e.target.value;
    let listPrintDivId = this.state.listPrintDivId;
    let index = listPrintDivId.indexOf(tarVal);
    if (index > -1) {
      if (!tarChk) {
        listPrintDivId.splice(index, 1);
        this.setState({listPrintDivId: listPrintDivId});
      }
    } else {
      if (tarChk) {
        listPrintDivId.push(tarVal);
        this.setState({listPrintDivId: listPrintDivId});
      }
    }
  };

  render(){

    const {classes} = this.props;
    const pcPanelSize = 0.5;

    const table_header = {
      paddingTop: 20,
      paddingLeft: 10,
      width: 1750 * pcPanelSize
    };

    const table_footer = {
      paddingTop: 20,
      paddingBottom: 70,
      width: 1750 * pcPanelSize
    };

    const getPCViewDataSet = this.state.listPCState;
    const getShowDataBtn = this.state.isNoData;
    const labNoMoreData = 'NO DATA!';

    let pcViewList = getPCViewDataSet.map((pcState, i) => {
      let encntrId = pcState.perioChartDto.encntrId;
        return (<div key={i}><PerioChartView onClick={this.handleOnClickPrintSel} pcState={pcState} chartNum={i} uuid={getPCViewTypeForId + '_' + encntrId}/></div>);
    });


    let footer = (getShowDataBtn) ? <td align="center">{labNoMoreData}</td> : <td align="center"><CIMSButton onClick={this.handleClickSeeMore}>see more</CIMSButton></td>;
    let isReadOnly = this.state.isReadOnly;

      return (

        <div>
        <table style={table_header}>
          <tr>
            <td width="80" align="left">
          <FormGroup row>
            <FormControlLabel
                control={
                <Switch
                    onChange={this.handleCompleteChartFilterToggle}
                    checked={this.state.isCmplChartOnly}
                    name="chkCompleteChart"
                />
                }
                label={<Typography className={classes.font}>Completed</Typography>}
            />
            </FormGroup>
          </td>
            <td width="330"align="left">
          <FormGroup row>
            <FormControlLabel
                control={
                <Switch
                    onChange={this.handlePerioTeamChartFilterToggle}
                    checked={this.state.isPerioTeamChartOnly}
                    name="chkPerioTeamC"
                />
                }
                label={<Typography className={classes.font}>Perio Team</Typography>}
            />
            </FormGroup>
          </td>
          <td width="100" align="right">
            <CIMSButton disabled={isReadOnly} onClick={this.createNewChart}>Blank Chart</CIMSButton>
          </td>
          <td width="120" align="right">
            <CIMSButton onClick={this.handlePrint}>Print Selected</CIMSButton>
          </td>
          </tr>
        </table>
        {pcViewList}
        <table style={table_footer}>
          <tr>
            {footer}
          </tr>
        </table>
      </div>

    );
  }
}

const mapStateToProps = (state) => {
  return {
    arrPerioChartDataCollection: state.clinicalContentPerioChart.arrPerioChartDataCollection,
    blnPerioChartCallBack: state.clinicalContentPerioChart.blnPerioChartCallBack,
    latestEncounter: state.clinicalContentEncounter.latestEncounter,
    patientInfo: state.patient.patientInfo
  };
};

const mapDispatchToProps = {
  getPerioChartDataCollectionByPatientKey_saga,
  resetPerioChartCallBack,
  skipTab,
  resetPerioChartDataCollection
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PerioChartViewList));