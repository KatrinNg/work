import './css/textarea.css';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { skipTab } from '../../../../../store/actions/mainFrame/mainFrameAction';
import accessRightEnum from '../../../../../enums/accessRightEnum';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import Checkbox from '@material-ui/core/Checkbox';
import CIMSButton from '../../../../../components/Buttons/CIMSButton';
import PCInputBox from './PCInputBox';
import PerioDraw from './PerioDraw';
import PerioDrawTextField from './PerioDrawTextField';
import { getPockToothInputType, getRecToothInputType, getListPDStateObj, getList32WithTwo, getList32WithSix, showPerioChartWithData, clearnTthPRDataDto } from './common/PerioChartUnits.js';

const styles = (theme) => ({
  button: {
    borderRadius: 10,
    backgroundColor:'#e0e0eb'
  },
  font: {
    fontFamily: 'Microsoft JhengHei, Calibri',
    fontSize: '12pt',
    color: '#404040'
  }
});

class PerioChartView extends Component {

  constructor(props){
    super(props);

    this.state = {
      inputId: "",
      listPDState: getListPDStateObj(),
      listPCSeq: getList32WithSix,
      isRecSixInput: true,
      isReadOnly: this.props.latestEncounter.readOnly
    };
  }

  componentWillMount() {
  }

  componentDidMount() {
    let listPDState = showPerioChartWithData(this.props.pcState.perioChartDto, this.props.chartNum);
    this.setState({
      listPDState: listPDState
    });

  }

  componentDidUpdate(prevProps) {
    if(this.props.pcState != prevProps.pcState) {
      let listPDState = showPerioChartWithData(this.props.pcState.perioChartDto, this.props.chartNum);
      this.setState({
        listPDState: listPDState
      });
    }
  }

  componentWillUnmount() {
  }

  handleSkipTab = (state, num, target) => {
    this.props.skipTab(
        target,
        {copyPCState: state, chartNum: num, newEncntrId: this.props.latestEncounter.encounterChartPo.encntrId},
        true
    );
  }

  copyToNewChart(mode) {
    let pcDto = {...this.props.pcState.perioChartDto};
    if (mode === "new") {
      let i;
      for (i = 0; i < pcDto.perioChartToothDto.length; i++) {
        pcDto.perioChartToothDto[i] = clearnTthPRDataDto(pcDto.perioChartToothDto[i]);
      }
    }
    this.handleSkipTab(pcDto, this.props.chartNum, accessRightEnum.dtsPerioChart);
  }

  render(){

    const {pcState, onClick, chartNum, uuid, classes} = this.props;

    const upperToothNums = ['18', '17', '16', '15', '14', '13', '12', '11', '21', '22', '23', '24', '25', '26', '27', '28'];
    const lowerToothNums = ['48', '47', '46', '45', '44', '43', '42', '41', '31', '32', '33', '34', '35', '36', '37', '38'];

    const isReadOnly = this.state.isReadOnly;
    const getListPDState =  this.state.listPDState;
    const getListPCSeq =  this.state.listPCSeq;
    const getListRecSeq =  (pcState.perioChartDto.is2RecInput === 1) ? getList32WithTwo : getList32WithSix; 

    const siteName = pcState.siteName;
    const rmCod = pcState.rmCod;
    const chartDT = new Date(pcState.createDtm);
    const getchartDTMonth = chartDT.getMonth() < 12 ? chartDT.getMonth() + 1 : 1;
    const cChartDT = chartDT.getDate() + "/" + getchartDTMonth + "/" + chartDT.getUTCFullYear();
    const chartOwner = (pcState.cimsUserPract != null) ? pcState.cimsUserPract : "";
    const isCmplChart = (parseInt(pcState.perioChartDto.isCmplChart) === 1)? "COMPLETED" : "";
    const isPerioTeamChart = (pcState.perioChartDto.isPerioTeam === 1)? "PERIO TEAM" : "";
    const isBothSChart = (pcState.perioChartDto.isCmplChart === 1 && pcState.perioChartDto.isPerioTeam === 1)? " / " : "";
    // const tthSurfCount = (pcState.perioChartDto.is2RecInput === 1) ? 2 : 6; getList32WithSix

    const viewNodeNum = chartNum;
    const pcPanelSize = 0.55;
    const pcFontSize = 0.85;
    const isView = true;

    const table = {
      borderCollapse: 'collapse',
      padding: '0 0 0 0'
    };

    const td_numLoop = {
      padding: 0,
      border: "none",
      borderTop: "1",
      borderBottom: "1"
    };

    const td_hd_font = {
      // border: '1px solid black',
      borderCollapse: 'collapse',
      padding: 0,
      fontSize: 15 * pcFontSize,
      backgroundColor: 'rgb(123, 193, 217)',
      color: 'white',
      fontWeight: 400
    };

    const td_horizontal_bar = {
      borderLeft: '0px solid black',
      borderRight: '0px solid black',
      borderBottom: '10px solid black',
      borderCollapse: 'collapse',
      padding: 0
    };

    const td_vertical_bar_dc = {
      borderRight: '10px solid black',
      borderCollapse: 'collapse',
      padding: 0
    };

    const td_vertical_bar = {
      borderRight: '10px solid black',
      borderCollapse: 'collapse',
      padding: 0
    };

    const td_vh_bar = {
      borderRight: '10px solid black',
      borderBottom: '10px solid black',
      borderCollapse: 'collapse',
      padding: 0
    };

    const td_filter_font = {
      color: 'rgb(123, 193, 217)',
      fontWeight: 400,
      width: 200
    };

    const table_viewHeader = {
      width: 1750 * pcPanelSize,
      paddingTop: 20,
      paddingLeft: 10
    };

    const td_label = {
      width: 300,
      fontSize: '10'
    };

    const tr_chart = {
      color: 'black',
      align: 'center'
    };

    const td_font = {
      color: 'black',
      fontFamily: 'Arial, MingLiU, Helvertica, Sans-serif, Arial Unicode MS',
      padding: 0
    };

    let upperPCLoop = getListPDState.map((pdState, i) => {
      if (i <= 15) {
        let isDisable = false;
        isDisable = (getListPDState[i].props.isImplant) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 7) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PerioDraw border="0" scale={pcPanelSize} pdState={pdState} isDisable={isDisable} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PerioDraw border="0" scale={pcPanelSize} pdState={pdState} isDisable={isDisable} /></td>);
        }
      }
    });
    let upperPockLoop = getListPCSeq.map((seq, i) => {
      if (i <= 15) {
        let isDisable = false;
        isDisable = (getListPDState[i].topLeft.val === 1) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 7) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PCInputBox toothNum={i} toothSeq={seq} type={getPockToothInputType + "-v" + viewNodeNum} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PCInputBox toothNum={i} toothSeq={seq} type={getPockToothInputType + "-v" + viewNodeNum} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>);
        }
      }
    });
    let upperNumLoop = upperToothNums.map((upperToothNum, i) => {
      if (i === 7) {
        return (<td style={td_vertical_bar_dc}>
          <td style={td_font}>{upperToothNum}</td>
          </td>);
      } else {
        return (<td style={td_font}>{upperToothNum}</td>);
      }
    });
    let upperRecLoop = getListRecSeq.map((seq, i) => {
      if (i <= 15) {
        let isDisable = false;
        isDisable = (getListPDState[i].topLeft.val === 1) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 7) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PCInputBox toothNum={i} toothSeq={seq} type={getRecToothInputType + "-v" + viewNodeNum} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PCInputBox toothNum={i} toothSeq={seq} type={getRecToothInputType + "-v" + viewNodeNum} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>);
        }
      }
    });
    let upperDCLoop = getListPDState.map((pdState, i) => {
      if (i <= 15) {
        if (i === 7) {
          return (<td style={td_vh_bar}>
            <td><PerioDrawTextField border="0" scale={pcPanelSize} isImplant={getListPDState[i].props.isImplant} /></td>
            </td>);
        } else {
          return (<td style={td_horizontal_bar}><PerioDrawTextField border="0" scale={pcPanelSize} isImplant={getListPDState[i].props.isImplant} /></td>);
        }
      }
    });
    let lowerDCLoop = getListPDState.map((pdState, i) => {
      if (i > 15 && i < 32) {
        if (i === 23) {
          return (<td style={td_vertical_bar_dc}>
            <td><PerioDrawTextField border="0" scale={pcPanelSize} isImplant={getListPDState[i].props.isImplant} /></td>
            </td>);
        } else {
          return (<td><PerioDrawTextField border="0" scale={pcPanelSize} isImplant={getListPDState[i].props.isImplant} /></td>);
        }
      }
    });
    let lowerRecLoop = getListRecSeq.map((seq, i) => {
      if (i > 15 && i < 32) {
        let isDisable = false;
        isDisable = (getListPDState[i].topLeft.val === 1) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 23) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PCInputBox toothNum={i} toothSeq={seq} type={getRecToothInputType + "-v" + viewNodeNum} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PCInputBox toothNum={i} toothSeq={seq} type={getRecToothInputType + "-v" + viewNodeNum} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>);
        }
      }
    });
    let lowerNumLoop = lowerToothNums.map((lowerToothNum, i) => {
      if (i === 7) {
        return (<td style={td_vertical_bar_dc}>
          <td style={td_font}>{lowerToothNum}</td>
          </td>);
      } else {
        return (<td style={td_font}>{lowerToothNum}</td>);
      }
    });
    let lowerPockLoop = getListPCSeq.map((seq, i) => {
      if (i > 15 && i < 32) {
        let isDisable = false;
        isDisable = (getListPDState[i].topLeft.val === 1) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 23) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PCInputBox toothNum={i} toothSeq={seq} type={getPockToothInputType + "-v" + viewNodeNum} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PCInputBox toothNum={i} toothSeq={seq} type={getPockToothInputType + "-v" + viewNodeNum} isDisable={isDisable} isView={isView} scale={pcPanelSize} fontSize={pcFontSize} /></td>);
        }
      }
    });
    let lowerPCLoop = getListPDState.map((pdState, i) => {
      if (i > 15 && i < 32) {
        let isDisable = false;
        isDisable = (getListPDState[i].props.isImplant) ? true: isDisable;
        isDisable = (getListPDState[i].props.isExtract) ? true: isDisable;
        if (i === 23) {
          return (<td style={td_vertical_bar}>
            <td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PerioDraw border="0" scale={pcPanelSize} pdState={pdState} isDisable={isDisable} /></td>
            </td>);
        } else {
          return (<td style={isDisable ? {backgroundColor: '#bfbfbf'} : {padding: 0}}><PerioDraw border="0" scale={pcPanelSize} pdState={pdState} isDisable={isDisable} /></td>);
        }
      }
    });

    
    let btnChart = () => {
      if (pcState.perioChartDto.encntrId === this.props.latestEncounter.encounterChartPo.encntrId) {
        return <CIMSButton isDisable={isReadOnly} onClick={() => this.copyToNewChart("edit")}>Edit Chart</CIMSButton>;
      } else {
        return <CIMSButton isDisable={isReadOnly} onClick={() => this.copyToNewChart("new")}>New Chart</CIMSButton>;
      }
    };
    
    return (

      <div>
        <table style={table_viewHeader}>
          <tr>
            <td style={td_label}>{siteName} ({rmCod}) / {chartOwner} ({cChartDT})
            </td>
            <td style={td_filter_font} align="right">
              {isCmplChart} {isBothSChart} {isPerioTeamChart}
            </td>
            <td align="right" width="90">
            {btnChart()}
            </td>
            <td width="10">
            <FormControl>
              <FormGroup aria-label="position" row>
                <FormControlLabel 
                    value={uuid} 
                    onChange={e => {
                    onClick(e);
                    }}
                    control={<Checkbox />} 
                    label={<Typography className={classes.font}>Print</Typography>} 
                    labelPlacement="start" 
                />
              </FormGroup>
            </FormControl>
            </td>
          </tr>
        </table>
        {/* <table border="1px solid black" style={table}> */}
        <div id={uuid}>
          <table style={table}>
            <tr align="center">
              {/* <td style={td_hd_font} align="center">M</td><td style={td_hd_font}></td> */}
              <td style={td_hd_font} align="center">M</td>
              {upperPCLoop}
            </tr>
            <tr align="center">
              {/* <td style={td_hd_font} align="center">P</td><td style={td_hd_font}><Grid>B</Grid><Grid>P</Grid></td> */}
              <td style={td_hd_font} align="center">P</td>
              {upperPockLoop}
            </tr>
            <tr align="center">
              {/* <td style={td_hd_font}></td><td style={td_hd_font}></td> */}
              <td style={td_hd_font}></td>
              {upperNumLoop}
            </tr>
            <tr align="center">
              {/* <td style={td_hd_font} align="center">R</td><td style={td_hd_font}><Grid>B</Grid><Grid>P</Grid></td> */}
              <td style={td_hd_font} align="center">R</td>
              {upperRecLoop}
            </tr>
            <tr style={tr_chart}>
              {/* <td style={td_hd_font}></td><td style={td_hd_font}></td> */}
              <td style={td_hd_font}></td>
              {upperDCLoop}
            </tr>
            <tr style={tr_chart}>
              {/* <td style={td_hd_font}></td><td style={td_hd_font}></td> */}
              <td style={td_hd_font}></td>
              {lowerDCLoop}
            </tr>
            <tr align="center">
              {/* <td style={td_hd_font} align="center">R</td><td style={td_hd_font}><Grid>L</Grid><Grid>B</Grid></td> */}
              <td style={td_hd_font} align="center">R</td>
              {lowerRecLoop}
            </tr>
            <tr align="center">
              {/* <td style={td_hd_font}></td><td style={td_hd_font}></td> */}
              <td style={td_hd_font}></td>
              {lowerNumLoop}
            </tr>
            <tr align="center">
              {/* <td style={td_hd_font} align="center">P</td><td style={td_hd_font}><Grid>L</Grid><Grid>B</Grid></td> */}
              <td style={td_hd_font} align="center">P</td>
              {lowerPockLoop}
            </tr>
            <tr align="center">
              {/* <td style={td_hd_font} align="center">M</td><td style={td_hd_font}></td> */}
              <td style={td_hd_font} align="center">M</td>
              {lowerPCLoop}
            </tr>
          </table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    latestEncounter: state.clinicalContentEncounter.latestEncounter
  };
};

const mapDispatchToProps = {
  skipTab
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(PerioChartView));
