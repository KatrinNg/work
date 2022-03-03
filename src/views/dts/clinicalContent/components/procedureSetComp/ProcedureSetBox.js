import './css/textarea.css';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withStyles, makeStyles, useTheme } from '@material-ui/core/styles';
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import MSelect from './MSelect';
import NSelect from './NSelect';
import CheckBox from './CheckBox';
import accessRightEnum from '../../../../../enums/accessRightEnum';
import { deleteTabs, deleteSubTabs } from '../../../../../store/actions/mainFrame/mainFrameAction';
import {
    getProcedureQualifier_saga,
    updateProcedureQualifier_saga
  } from '../../../../../store/actions/dts/clinicalContent/procedureSetAction';
import { axios } from '../../../../../services/axiosInstance';

import { 
    chkArr,
    selToothQlfId,
    chkSupernumeraryQlfId,
    clcQlfDto,
    preProcDetailId,
    dbProcId,
    getQlfVIdInStateId,
    toUrlDateTime
} from './common/ProcedureSetUnit.js';


const styles = (theme) => ({
    formControl: {
        margin: theme.spacing(1),
        width: 600
      },
    button: {
        borderRadius: 10,
        backgroundColor:'#e0e0eb'
    },
    textField: {
        width: 600
    },
    helper: {
        fontSize: '1em'
    }
});

class ProcedureSetBox extends Component {

  constructor(props){
    super(props);

    this.state = {
        termCncptId: this.props.termCncptId,
        codTermServId: this.props.codTermServId,
        termDesc: this.props.termDesc,
        disable: this.props.disable,
        divId: this.props.divId,
        cmnSetId: this.props.cmnSetId,
        errorList: [],
        latestEncounter: this.props.latestEncounter,
        saveResult: "",
        hasError: "",
        hasSave: false
    };
  }

  componentWillMount() {

  }

  componentDidMount() {
    let termCncptId = this.state.termCncptId;
    let latestEncounter = this.state.latestEncounter;
    axios
    .get(`/dts-cc/probProc/cc/probProc/getQualifier/${termCncptId}/${toUrlDateTime(latestEncounter.sdt)}`)
    .then(response => {
      if (response.data.respCode === 0) {
        let data = response.data.data;
        this.setState({qlfSet: data});
      }
    });
    let x = document.getElementById(termCncptId);
    x.style.display = "none";
  }

  componentDidUpdate(prevProps) {
    if (this.props.termCncptId != prevProps.termCncptId) {
        let latestEncounter = this.state.latestEncounter;
        let termCncptId = this.props.termCncptId;
        this.setState({termCncptId: termCncptId});
        axios
        .get(`/dts-cc/probProc/cc/probProc/getQualifier/${termCncptId}/${toUrlDateTime(latestEncounter.sdt)}`)
        .then(response => {
            
          if (response.data.respCode === 0) {
            let data = response.data.data;
            this.setState({qlfSet: data});
          }
        });

        let x = document.getElementById(termCncptId);
        x.style.display = "none";

        this.resetHasSave();
    }

    if (this.props.cmnSetId != prevProps.cmnSetId) {
        this.setState({cmnSetId: this.props.cmnSetId});
    }

    if (this.props.codTermServId != prevProps.codTermServId) {
        this.setState({codTermServId: this.props.codTermServId});
    }

    if (this.props.saveIdList != prevProps.saveIdList) {

        let hasSave = this.state.hasSave;
        if (!hasSave) {

            let latestEncounter = this.state.latestEncounter;
            let qlfSet = this.state.qlfSet;
            let disable = this.props.disable;
            let codTermServId = this.state.codTermServId;
            let termDesc = this.state.termDesc;
            let cmnSetId = this.state.cmnSetId;
            let errorList = [];

            if (!disable) {
                let nClcQlfDto = { ...clcQlfDto};
                let nClcQlf = [];
                let nSelTth = [];

                let i;
                for (i = 0; i < qlfSet.length; i++) {
                    let qlfId = qlfSet[i].codQlfId;
                    let qlfValId = this.state[codTermServId + "_" + qlfId];
                    if (qlfId != selToothQlfId && qlfId != chkSupernumeraryQlfId && qlfValId != undefined) {
                        if (Array.isArray(qlfValId)) {
                            let j;
                            for (j = 0; j < qlfValId.length; j++) {
                                nClcQlf.push(qlfValId[j]);
                            }
                        } else {
                            nClcQlf.push(qlfValId);
                        }
                    } else if (qlfId === chkSupernumeraryQlfId && qlfValId) {
                        let qlfValId = qlfSet[i].codQlfValList[0].codQlfValId;
                        nClcQlf.push(qlfValId);
                    } else if (qlfId === selToothQlfId && qlfValId != undefined)  {
                        if (Array.isArray(qlfValId)) {
                            let j;
                            for (j = 0; j < qlfValId.length; j++) {
                                nSelTth.push(qlfValId[j]);
                            }
                        } else {
                            nSelTth.push(qlfValId);
                        }
                        nClcQlfDto.mapType = qlfSet[i].mapType;
                    } else if (qlfSet[i].isMandatory === 1)  {
                        if (Array.isArray(qlfValId)) {
                            if (qlfValId.length < 1) {
                                errorList.push(qlfId);
                            }
                        } else {
                            if (qlfValId === "" || qlfValId === undefined) {
                                errorList.push(qlfId);
                            }
                        }
                    } 
                }
                this.setState({errorList: errorList});
                if (errorList.length === 0) {
                    let txtBoxId = preProcDetailId + codTermServId + "_" + cmnSetId;
                    nClcQlfDto.clcEncntrId = latestEncounter.encntrId;
                    nClcQlfDto.patientKey = latestEncounter.patientKey;
                    nClcQlfDto.clcQlfList[0] = nClcQlf;
                    nClcQlfDto.toothSel = nSelTth;
                    nClcQlfDto.probProc = codTermServId;
                    nClcQlfDto.probProcIndx = dbProcId;
                    nClcQlfDto.probProcTermDesc = termDesc;
                    nClcQlfDto.probProcDetail = document.getElementById(txtBoxId).value;
    
                    axios
                    .put(`/dts-cc/probProc/cc/probProc`, nClcQlfDto)
                    .then(response => {
                    if (response.data.respCode === 0) {
                        let data = response.data.data;
                        if (response.data.errMsg === null || response.data.errMsg === "") {
                            this.setState({hasError: "Result: saved successfully"});
                            this.setState({hasSave: true});
                        } else {
                            this.setState({hasError: response.data.errMsg});
                            this.setState({hasSave: false});
                        }
                    }
                    });
                }
            }
        }
    }
  }

  componentWillUnmount() {
  }

  handleSelectOnChange = (event) => {
    this.setState({[event.target.name]: event.target.value});
    this.removeInErrList(getQlfVIdInStateId(event.target.name));
    this.resetHasSave();
  }

  handleCheckBoxOnChange = (event) => {
    this.setState({[event.target.name]: event.target.checked });
    this.removeInErrList(getQlfVIdInStateId(event.target.name));
    this.resetHasSave();
  }

  handleTextFieldOnChange = (event) => {
    this.resetHasSave();
  }

  resetHasSave = () => {
    let hasSave = this.state.hasSave;
    if (hasSave) {
        this.setState({hasSave: false});
        this.setState({hasError: ""});
    }
  }

  removeInErrList = (id) => {
    let errorList = this.state.errorList;
    if (errorList.length > 0) {
        const index = errorList.indexOf(id);
        if (index > -1) {
            errorList.splice(index, 1);
            this.setState({errorList: errorList});
        }
    }
  }

  render(){

    const {codTermServId, divId, disable, saveIdList, classes} = this.props;

    const qlfSet = this.state.qlfSet;
    const errorList = this.state.errorList;
    const content = new Array();
    const cmnSetId = this.state.cmnSetId;
    const hasError = this.state.hasError;

    const footer = {
        width: 620,
        padding: '10px 10px 10px 10px'
    };

    if (chkArr(qlfSet)) {
        

        let i;
        for (i = 0; i < qlfSet.length; i++) {
            let qlf = qlfSet[i];
            let mandateKey = (qlf.isMandatory === 1) ? " * " : "";
            let hasError = (errorList.includes(qlf.codQlfId)) ? true : false;
            let name = codTermServId + "_" + qlf.codQlfId;
            let data;
            switch(qlf.implmntType) {
                case "L":
                    data = qlf.codQlfValList.map((x) => {
                        let value = (x.codQlfId === selToothQlfId) ? x.valDesc : x.codQlfValId;
                        return ({ value: value, label: x.valDesc, item: x });
                    });
                    if (qlf.mapType === "S") {
                        content.push(<tr><td width="620">{mandateKey}
                        <NSelect 
                            state={this.state[name]}
                            data={data} 
                            // qlf={qlf}
                            name={name}
                            label={qlf.qlfDesc}
                            disable={disable}
                            hasError={hasError}
                            handleOnChange={this.handleSelectOnChange}
                        />
                        </td></tr>);
                    } else if (qlf.mapType === "M") {
                        content.push(<tr><td width="620">{mandateKey}
                        <MSelect 
                            state={this.state[name]}
                            data={data} 
                            // qlf={qlf}
                            name={name}
                            label={qlf.qlfDesc}
                            disable={disable}
                            hasError={hasError}
                            handleOnChange={this.handleSelectOnChange}
                        />
                        </td></tr>);
                    }
                    break;
                case "C":
                    content.push(<tr><td width="620">{mandateKey}
                    <CheckBox 
                        state={this.state[name]}
                        name={name}
                        label={qlf.qlfDesc}
                        disable={disable}
                        hasError={hasError}
                        handleOnChange={this.handleCheckBoxOnChange}
                    />
                    </td></tr>);
                    break;
                default:
                    break;
            }
        }
    }



    return (
        <div id={divId}>
            {content}
            <tr><td style={footer}><TextField
                id={preProcDetailId + codTermServId + "_" + cmnSetId}
                label="Detail"
                type="text"
                multiline
                variant="outlined"
                className={classes.textField}
                rows={1}
                rowsMax={2}
                onChange={this.handleTextFieldOnChange} 
                disabled={disable}
            /></td></tr>
            <tr><td>
                {hasError !== "" && <FormHelperText className={classes.helper}>{hasError}</FormHelperText>}
            </td></tr>
        </div>
    );
  }
}

const mapStateToProps = (state) => {
    return {
        procedureQualifier: state.clinicalContentProcedureSet.procedureQualifier,
        latestEncounter: state.clinicalContentEncounter.latestEncounter
    };
  };
  
const mapDispatchToProps = {
    getProcedureQualifier_saga,
    updateProcedureQualifier_saga,
    deleteSubTabs,
    deleteTabs
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(ProcedureSetBox));