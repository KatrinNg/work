import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
 
import {
    Grid,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl,
    FormGroup,
    Paper,
    Checkbox,
    CardHeader,
    Box,
    IconButton,
    Menu,
    MenuItem
} from '@material-ui/core';
//import DtsTooth48 from 'components/DTS/DtsTooth48';
//import DtsTooth13 from 'components/DTS/DtsTooth13';


import DtsTooth48 from './DtsTooth48';
import DtsTooth13 from './DtsTooth13';
import { connect } from 'react-redux';
import moment from 'moment';
import { getDentalChart, updateDentalChart, resetAll, setDspTooth, setRemark, updateState} from '../../../../store/actions/dts/clinicalContent/DtsDentalChartAction';
import CIMSCheckBox from 'components/CheckBox/CIMSCheckBox';
import CIMSSelect from 'components/Select/CIMSSelect';
import CIMSButton from 'components/Buttons/CIMSButton';
import RequiredIcon from 'components/InputLabel/RequiredIcon';
import CIMSMultiTextField from '../../../../components/TextField/CIMSMultiTextField';
import ValidatorForm from '../../../../components/FormValidator/ValidatorForm';
import {MoreVert} from '@material-ui/icons';

const styles = ({
    root: {
        width: '1000px'
        
    },
    toothRootS: {
        width: '45px',
        height: '120px'
    },
    toothPaperS:{
        width:'45px',
        height:'45px',
        position:'relative'
    },
    toothSvgClassS:{
        borderRadius: '5px',
        position:'absolute',
        width:'45px',
        height:'45px'
    },
    toothRootM: {
        width: '100px',
        height: '120px'
    },
    toothPaperM:{
        width:'100px',
        height:'100px',
        position:'relative'
    },
    toothSvgClassM:{
        borderRadius: '5px',
        position:'absolute',
        width:'100px',
        height:'100px'
    },
    toothRootL: {
        width: '120px',
        height: '140px'
    },
    toothPaperL:{
        width:'120px',
        height:'120px',
        position:'relative'
    },
    toothSvgClassL:{
        borderRadius: '5px',
        position:'absolute',
        width:'120px',
        height:'120px'
    },
    option:{
        width: 270,
        marginBottom: '20px'
    },
    radioGroup:{
        display: 'block'
    },
    optionRoot:{
        marginLeft: '0px'
    },
    optionLabel:{
        fontSize: '10pt'
    },
    radioButton:{
        padding: '2px'
    },
    toothDesignLeft:{
        marginRight: '5px'
    },
    toothDesignLeft2nd:{
        marginLeft: '142px'
  
    } ,toothDesignRight2nd:{
        marginRight: '159px'
  
    },
    toothDesignRight:{
        //marginLeft: '5px'
  
    } ,
    gridDivider:{
        borderRight: "3px solid black",
        height: '100%',
        marginLeft: '10px'
        
    },gridDivider2:{
        borderRight: "3px solid black",
        height: '100%',
        marginLeft: '5px'
        
    }, toothBridgeRootS: {
        width: '49px',
        height: '20px',
        marginBottom:'0px'

    },
    toothBridgePaperS:{
        width:'49px',
        height:'20px',
        position:'relative'
    },
    toothBridgeSvgClassS:{
        borderRadius: '5px',
        position:'absolute',
        width:'49px',
        height:'20px'

    },toothBridgeRootM: {
        width: '100px',
        height: '120px'
    },
    toothBridgePaperM:{
        width:'100px',
        height:'100px',
        position:'relative'
    },
    toothBridgeSvgClassM:{
        borderRadius: '5px',
        position:'absolute',
        width:'100px',
        height:'100px'
    },
    toothBridgeRootL: {
        width: '120px',
        height: '140px'
    },
    toothBridgePaperL:{
        width:'120px',
        height:'120px',
        position:'relative'
    },
    toothBridgeSvgClassL:{
        borderRadius: '5px',
        position:'absolute',
        width:'120px',
        height:'120px'
    }
});

const probProcOption = [
    { value : '1-TDS10000000744' , label : "Dental Caries" },
    { value : '2-TDS20000000948' , label : "Filling" },
    { value : '2-TDS20000000790' , label : "Extraction" },
    { value : '1-TDS10000000778' , label : "RF" },
    { value : '1-TDS10000000622' , label : "Attrition of tooth" }
  ];
const toothSelOption = [
    { value : '11' , label : "11" },
    { value : '12' , label : "12" },
    { value : '13' , label : "13" },
    { value : '14' , label : "14" },
    { value : '15' , label : "15" },
    { value : '16' , label : "16" },
    { value : '17' , label : "17" },
    { value : '18' , label : "18" },
    { value : '21' , label : "21" },
    { value : '22' , label : "22" },
    { value : '23' , label : "23" },
    { value : '24' , label : "24" },
    { value : '25' , label : "25" },
    { value : '26' , label : "26" },
    { value : '27' , label : "27" },
    { value : '28' , label : "28" },
    { value : '42' , label : "42" }
  ];

  const surfaceSelOption = [
    { value : 'M' , label : "M" },
    { value : 'D' , label : "D" },
    { value : 'B' , label : "B" },
    { value : 'P' , label : "P" }

  ];

class DtsDentalChart2 extends Component {
    constructor(props){
        super(props);
        const { classes } = this.props;
        this.state={
            teethSize: 'S',
            probProc: null,
            toothSel: null,
            surfaceSel: null,
            toothInfo: null,
            //dentalChartData: null,
            toothClassS :{
                root:classes.toothRootS,
                
                paper:classes.toothPaperS,
                svgClass:classes.toothSvgClassS,
                bridgeRoot:classes.toothBridgeRootS,
                bridgePaper: classes.toothBridgePaperS,
                bridgeSvgClass: classes.toothBridgeSvgClassS
            },
            toothClassM :{
                root:classes.toothRootM,
                paper:classes.toothPaperM,
                svgClass:classes.toothSvgClassM,
                bridgeRoot:classes.toothBridgeRootM,
                bridgePaper: classes.toothBridgePaperM,
                bridgeSvgClass: classes.toothBridgeSvgClassM
            },
            toothClassL :{
                root:classes.toothRootL,
                paper:classes.toothPaperL,
                svgClass:classes.toothSvgClassL,
                bridgeRoot:classes.toothBridgeRootL,
                bridgePaper: classes.toothBridgePaperL,
                bridgeSvgClass: classes.toothBridgeSvgClassL
            },
            //testTeethAnatomy
            showTeethAnatomy: true,
            anchorEl: null
            //details: null
      
            
        
        };
        //console.log('classes : '+JSON.stringify(classes));
    }

    componentWillMount() {
        //let localDentalChartData = {"data":[ {"toothNo": 13, "imageType": "Caries", "abbrev": "PE", "rootAbbrev": "Implant"}, {"toothNo": 12, "imageType": "Extraction", "abbrev": "IT", "rootAbbrev": "Implant"}] };
        const { encounterId, encounterSdt} = this.props;
        this.setState({toothInfo :{parentClasses: this.state.toothClassS, sizeScale:0.45}});
        //this.props.getDentalChart(500245, '2020-09-23T14:30Z');
        this.props.getDentalChart(encounterId, encounterSdt);
        //const { dentalChartList } = this.props;
        //this.setState({dentalChartData :dentalChartList});
    }
    
    
    componentWillUnmount() {
        this.props.resetAll();
      }
      

    handleTeethSizeChange = (value) =>{
        //console.log('handleTeethSizeChange :'+value.target.value);
        this.setState({teethSize: value.target.value});

        if(value.target.value == 'S')
            this.setState({toothInfo :{parentClasses: this.state.toothClassS, sizeScale:0.5}});
        else if(value.target.value == 'M')
            this.setState({toothInfo :{parentClasses: this.state.toothClassM, sizeScale:1}});
        else if(value.target.value == 'L')
            this.setState({toothInfo :{parentClasses: this.state.toothClassL, sizeScale:1.2}});
    }

    handleCollapse = (value) =>{
        //console.log('handleTeethAnatomy ' + value);
    }

    addProblemProcedure = () => {
        const params = {
            clcEncntrId: 500245, 
            sdt: '2020-08-12T14:30Z',
            probProc: this.state.probProc,
            toothSel: this.state.toothSel,
            surfaceSel: this.state.surfaceSel

        };
        //console.log('probProc ' + params.probProc);
        
        this.props.updateDentalChart(params, () => {
            //this.handleClose();
            this.deselectAllFnc();
            this.props.getDentalChart(500245, '2020-08-12T14:30Z');
        });
        
    };

    deselectAllFnc = () => {
        //this.props.updateState({ probProc: '' });
        this.setState({probProc: '' });
        this.setState({toothSel: '' });
        this.setState({surfaceSel: ''});
    };

    handleClickSetting = (event) => {
        this.setState({anchorEl: event.currentTarget});
  
    };

    handleSettingMenuClose = () => {
        this.setState({anchorEl: null});
    };

    handleHidePrimiaryTeeth = () => {
        //const {handleIsPrimaryOnChange, ...rest } = this.props;
        //handleIsPrimaryOnChange(false);
        const {dentalChartData, ...rest } = this.props;
        let obj = {...dentalChartData};
        obj.dspTooth = "P";
        this.props.setDspTooth(obj); 
        this.handleSettingMenuClose();
    };

    handleShowPrimiaryTeeth = () => {
        //const {handleIsPrimaryOnChange, ...rest } = this.props;
        //handleIsPrimaryOnChange(true);
        const {dentalChartData, ...rest } = this.props;
        let obj = {...dentalChartData};
        obj.dspTooth = "B";
        this.props.setDspTooth(obj);
        this.handleSettingMenuClose();
    };

    handleDentalChartRemarkChange = (event, value) =>{
        const {dentalChartData, ...rest } = this.props;
        //console.log('Dicky remark', dentalChartList);
        let obj = {...dentalChartData};
        obj.remark = value;
        this.props.setRemark(obj);
        //this.setState({dentalChartRemark: value});
      };

    render(){
        const { classes, className, dentalChartList, dentalChartData, handleTeethSelectChange, handleSurfaceSelectChange, 
        handleIsPermanentOnChange, handleIsPrimaryOnChange, carryTooth, selectedTeeth, ...rest } = this.props;

        // const toothClassS = {
        //     root:classes.toothRootS,
        //     paper:classes.toothPaperS,
        //     svgClass:classes.toothSvgClassS
        // };
        // const toothClassM = {
        //     root:classes.toothRootM,
        //     paper:classes.toothPaperM,
        //     svgClass:classes.toothSvgClassM
        // };
        // const toothClassL = {
        //     root:classes.toothRootL,
        //     paper:classes.toothPaperL,
        //     svgClass:classes.toothSvgClassL
        // };

        //console.log('this.state.toothInfo : '+JSON.stringify(this.state.toothInfo));
        //const { isPermanentTeeth, isPrimaryTeeth, probProc, toothSel, surfaceSel} = this.state;
        // const toothInfo = {parentClasses: toothClassS, sizeScale:0.5};
        // this.setState({toothInfo :{parentClasses: this.toothClassS, sizeScale:0.5}});
        //console.log('isPermanentTeeth ' + isPermanentTeeth);
        
        const isPermanentTeeth = true;
        let isPrimaryTeeth = true;
        if (typeof dentalChartData != 'undefined' && dentalChartData != null && dentalChartData.dspTooth == 'P') {
            isPrimaryTeeth = false;
        }
        console.log('isPrimaryTeeth dentalChartData: ', dentalChartData);
        console.log('isPrimaryTeeth : '+isPrimaryTeeth);
        const toothFunctionData = {
            handleTeethSelectChange: handleTeethSelectChange,
            handleSurfaceSelectChange: handleSurfaceSelectChange,
            dentalChartData: dentalChartList,
            carryTooth: carryTooth,
            selectedTeeth: selectedTeeth
        };

        return(

            <Grid >
                {false && (
                <Grid className={classes.option} >
                    <FormControl component="fieldset" className={classes.formControl} >
                        <RadioGroup className={classes.radioGroup} aria-label="Teeth Size" defaultValue="S" name="TeethSize" value={this.state.teethSize} onChange={e => this.handleTeethSizeChange(e)} >
                            <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="S" control={<Radio classes={{root: classes.radioButton}} />} label="Small" />
                            <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="M" control={<Radio classes={{root: classes.radioButton}} />} label="Medium" />
                            <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="L" control={<Radio classes={{root: classes.radioButton}} />} label="Large" />
                        </RadioGroup>
                    </FormControl>
                </Grid>)
                }
                
                  <CardHeader style={{padding: '3px 16px 0px 16px'}}
                      action={
                      <Box variant="dense">
                        <IconButton aria-label="settings" onClick={this.handleClickSetting}>
                          <MoreVert />
                        </IconButton>
                      </Box>
                    }

                  />
                  <Menu
                      id="simple-menu"
                      anchorEl={this.state.anchorEl}
                      keepMounted
                      //open={Boolean(anchorEl)}
                      open={Boolean(this.state.anchorEl)}
                      onClose={this.handleSettingMenuClose}
                    >
                    {isPrimaryTeeth && (
                    <MenuItem onClick={this.handleHidePrimiaryTeeth}>
                        <label>Hide Primary Teeth</label>
                    </MenuItem>    
                    )}
                    {!isPrimaryTeeth && (
                    <MenuItem onClick={this.handleShowPrimiaryTeeth}>
                        <label>Show Primary Teeth</label>
                    </MenuItem>
                    )}
                    </Menu>


                {/* <Grid className={classes.option}>
                    <FormControl component="fieldset">
                        <FormGroup row>
                                   
                            <FormControlLabel
                                value="permanent"
                                control={<Checkbox color="primary" />}
                                label="Permanent"
                                labelPlacement="Right"
                                onChange={this.handleCollapse}/>
                            <FormControlLabel
                                value="primrary"
                                control={<Checkbox color="primary" />}
                                label="Primrary"
                                labelPlacement="Right"
                                onChange={this.handleCollapse}/>
                        </FormGroup>
                    </FormControl>
                </Grid> */}
               {/*  <Grid >
                <FormControlLabel control={
                            <CIMSCheckBox
                                name={'includePermanent'}
                                id={'includePermanent'}
                                value={isPermanentTeeth}
                                onChange={e => handleIsPermanentOnChange(e)}
                            />
                        } label={'Permanent'} checked={isPermanentTeeth === true}
                    />
                <FormControlLabel control={
                            <CIMSCheckBox
                                name={'includePrimary'}
                                id={'includePermanent'}
                                value={isPrimaryTeeth}
                                onChange={e => handleIsPrimaryOnChange(e)}
                            />
                        } label={'Primary'} checked={isPrimaryTeeth === true}
                    />

                </Grid> */}

                {/* Left */}
                <Grid container className={classes.root + ' ' + className}>
                    <div className={classes.gridDivider2}> 
                        {/* <Grid container className={classes.toothDesignLeft}  > */}
                        {isPermanentTeeth && (
                        <Grid container>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'18'} toothSurface={['B','D','P','M','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'17'} toothSurface={['B','D','P','M','O']} {...toothFunctionData}/>
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'16'} toothSurface={['B','D','P','M','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'15'} toothSurface={['B','D','P','M','O']} {...toothFunctionData}/>
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'14'} toothSurface={['B','D','P','M','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'13'} toothSurface={['B','D','P','M','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'12'} toothSurface={['B','D','P','M','I']} {...toothFunctionData}/>
                            </Grid>                 
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'11'} toothSurface={['B','D','P','M','I']} {...toothFunctionData}/>
                                
                            </Grid>
                                                                  
                        </Grid>)
                        }

                        <Grid container className={classes.toothDesignLeft2nd} style={!isPrimaryTeeth?{display: 'none'}:{}}>
                            <Grid>
                                  <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'55'} toothSurface={['B','D','P','M','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'54'} toothSurface={['B','D','P','M','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'53'} toothSurface={['B','D','P','M','I']} {...toothFunctionData}/>
                            </Grid>
                            <Grid>
                                 <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'52'} toothSurface={['B','D','P','M','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'51'} toothSurface={['B','D','P','M','I']} {...toothFunctionData}/>
                            </Grid>
                                    
                        </Grid>

                        <Grid container className={classes.toothDesignLeft2nd} style={!isPrimaryTeeth?{display: 'none'}:{}}>
                            <Grid>
                                <DtsTooth48 
                                    toothInfo={this.state.toothInfo} 
                                    toothNo={'85'} toothSurface={['L','D','B','M','O']}
                                    {...toothFunctionData}
                            />
                            </Grid>
                            <Grid>
                                <DtsTooth48 
                                    toothInfo={this.state.toothInfo} 
                                    toothNo={'84'}  toothSurface={['L','D','B','M','O']}
                                    {...toothFunctionData}
                            />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'83'} toothSurface={['L','D','B','M','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'82'} toothSurface={['L','D','B','M','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'81'} toothSurface={['L','D','B','M','I']} {...toothFunctionData} />
                            </Grid>                  
                        </Grid>
                        
                        {isPermanentTeeth && (
                        <Grid container>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'48'} toothSurface={['L','D','B','M','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'47'} toothSurface={['L','D','B','M','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'46'} toothSurface={['L','D','B','M','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'45'} toothSurface={['L','D','B','M','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'44'} toothSurface={['L','D','B','M','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'43'} toothSurface={['L','D','B','M','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'42'} toothSurface={['L','D','B','M','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid >
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'41'} toothSurface={['L','D','B','M','I']} {...toothFunctionData} />
                            </Grid>
                                                    
                        </Grid>)
                        }
                     
                            {/* <div className={classes.gridDivider2}></div>     */}
                        
                     </div>

                    {/* RIGHT */}
                      <div className={classes.toothDesignRight}>    
                        {isPermanentTeeth && ( 
                        <Grid container >
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'21'} toothSurface={['B','M','P','D','I']} {...toothFunctionData}/>
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'22'} toothSurface={['B','M','P','D','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'23'} toothSurface={['B','M','P','D','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'24'} toothSurface={['B','M','P','D','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'25'} toothSurface={['B','M','P','D','O']} {...toothFunctionData}/>
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'26'} toothSurface={['B','M','P','D','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'27'} toothSurface={['B','M','P','D','O']} {...toothFunctionData}/>
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'28'} toothSurface={['B','M','P','D','O']} {...toothFunctionData} />
                            </Grid>                           
                        </Grid>)
                        }

                        <Grid container style={!isPrimaryTeeth?{display: 'none'}:{}}>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'61'} toothSurface={['B','M','P','D','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'62'} toothSurface={['B','M','P','D','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'63'} toothSurface={['B','M','P','D','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'64'} toothSurface={['B','M','P','D','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'65'} toothSurface={['B','M','P','D','O']} {...toothFunctionData} />
                            </Grid>
                        </Grid>

                        <Grid container style={!isPrimaryTeeth?{display: 'none'}:{}}>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'71'} toothSurface={['L','M','B','D','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'72'} toothSurface={['L','M','B','D','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'73'} toothSurface={['L','M','B','D','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'74'} toothSurface={['L','M','B','D','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'75'} toothSurface={['L','M','B','D','O']} {...toothFunctionData} />
                            </Grid>
                                    
                        </Grid>
                         

                        {isPermanentTeeth && (
                        <Grid container>
                            <Grid>
                               <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'31'} toothSurface={['L','M','B','D','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'32'} toothSurface={['L','M','B','D','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'33'} toothSurface={['L','M','B','D','I']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'34'} toothSurface={['L','M','B','D','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'35'} toothSurface={['L','M','B','D','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'36'} toothSurface={['L','M','B','D','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                 <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'37'} toothSurface={['L','M','B','D','O']} {...toothFunctionData} />
                            </Grid>
                            <Grid>
                                <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'38'} toothSurface={['L','M','B','D','O']} {...toothFunctionData} />
                            </Grid>    
                        </Grid>)
                        }
                     </div>    
                        
            </Grid>   
            
            <Grid >
            
                <FormGroup row style={{ width: '100%' , fontSize: '4px'}}>
                    <label ><label>&nbsp;</label>  </label>
                </FormGroup>
                </Grid>
            {(typeof dentalChartData != 'undefined') && (
                <Grid >
                <CIMSMultiTextField
                    style={{ width: '780px' , fontSize: '18px'}}
                    id={'reamrksTextField'}
                    label={'Remarks'}
                    rows={1}
                    value={dentalChartData.remark}
                    placeholder="Remarks"
                    onChange={e => this.handleDentalChartRemarkChange(e, e.target.value)}
                />
                </Grid>
            )}
            
        </Grid>
        );
    }

}        

                    {/*Right  */}
                    {/* <Grid container className={classes.root + ' ' + className + ' ' + classes.toothDesign} >
                        <Grid>
                            <div className={classes.toothDesign}> <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'21'}/></div>
                        </Grid>
                        <Grid>
                            <div className={classes.toothDesign}> <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'22'}/></div>
                        </Grid>
                        <Grid>
                            <div className={classes.toothDesign}> <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'23'}/></div>
                        </Grid>
                        <Grid>
                            <div className={classes.toothDesign}> <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'24'}/></div>
                        </Grid>
                        <Grid>
                            <div className={classes.toothDesign}> <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'25'}/></div>
                        </Grid>
                        <Grid>
                            <div className={classes.toothDesign}> <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'26'}/></div>
                        </Grid>
                        <Grid>
                            <div className={classes.toothDesign}> <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'27'}/></div>
                        </Grid>
                        <Grid>
                            <div className={classes.toothDesign}> <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'28'}/></div>
                        </Grid>                   */}

       
   
                
                


                {/* <Grid container className={classes.root + ' ' + className + ' ' + classes.toothDesign} >
                    
            
                        <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'18'}/>
                        <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'17'}/>
                        <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'16'}/>
                        <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'15'}/>
                        <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'14'}/>
                        <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'13'}/>
                        <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'12'}/>
                        <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'11'}/>

                        <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'21'}/>
                        <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'22'}/>
                        <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={'23'}/>
                        <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'24'}/>
                        <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'25'}/>
                        <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'26'}/>
                        <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'27'}/>
                        <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={'28'}/>
                </Grid> */}



//export default withStyles(styles)(DtsDentalChart2);

function mapStateToProps(state) {
    return {
        dentalChartList: state.dtsDentalChart.dentalChartList,
        dentalChartData: state.dtsDentalChart.dentalChartData
    };
}

const mapDispatchToProps = {
    //initiPage,
    resetAll,
    getDentalChart,
    updateDentalChart,
    setDspTooth,
    setRemark
    //openCommonMessage,
    //updateState
    //resetDialogInfo
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsDentalChart2));