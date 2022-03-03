import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import clsx from 'clsx';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

// import {getT48TopAreaSvg,
//     getT48LeftAreaSvg,
//     getT48BottomAreaSvg,
//     getT48RightAreaSvg,
//     getT48CenterAreaSvg,
//     getT48Line1,
//     getT48Line2,
//     getT48Line3,
//     getT48Line4,
//     getT48Line5,
//     getCariesSvg,
//     getAbrasionSvg} from 'components/DTS/DtsToothSvg';
 
//import * as toothSvgUtil from 'components/DTS/DtsToothSvg';
import * as toothSvgUtil from './DtsToothSvg';

const styles = ({
    root: {
        width: '100px',
        height: '120px'
    },
    bridgeRoot: {
        width: '100px',
        height: '120px'
    },
    bridgePaper:{
        width:'100px',
        height:'100px',
        position:'relative'
    },
    paper:{
        width:'100px',
        height:'100px',
        position:'relative'
    },
    toothNo:{
        width: '100%',
        textAlign: 'center',
        fontWeight: 600
    },
    abbrevClass:{
        width: '100%',
        textAlign: 'center',
        fontSize: '14px',
        color: 'green'
    },
    abbrevClass2:{
        fontSize: '14px',
        color: 'green',
        verticalAlign: 'top',
        fontWeight: 500
    },
    supernermaryClass:{
        width: '100%',
        textAlign: 'center',
        fontSize: '14px',
        color: 'red'
    },
    svgClass:{
        borderRadius: '5px',
        position:'absolute',
        width:'100px',
        height:'100px'
    },bridgeSvgClass:{
        borderRadius: '5px',
        position:'absolute',
        width:'100px',
        height:'100px'
    },
    toothBridgePaper:{
        width:'50',
        height:'20px',
        position:'relative'
    },toothBorder:{
        marginRight: '2px',
        marginLeft: '2px'
    },
    toothBridgeBorder:{
    
    }

});

class DtsTooth48 extends Component {
    constructor(props){
        super(props);
        this.state = {
            topColor: 'transparent',
            leftColor: 'transparent',
            rightColor: 'transparent',
            bottomColor: 'transparent',
            centerColor: 'transparent',
            toothNoColor: 'transparent',
            bridgeLineColor: 'Red',
            sizeScale: 1
        };
    }

    // componentWillMount(){

    // }

    componentDidUpdate(prevProps) {
        if (!this.props.carryTooth){
            if (prevProps.dentalChartData !== this.props.dentalChartData) {
                this.resetColor(true);
                this.resetColor(false);
            }
        }

        if (prevProps.selectedTeeth != this.props.selectedTeeth){
           console.log('Dicky updateTooth', this.props.selectedTeeth);
           this.resetColor(true);
            this.resetColor(false);
           if (this.props.selectedTeeth.includes(this.props.toothNo)){
                this.setState({toothNoColor: 'yellow'});
           } 
           if (this.props.selectedTeeth.includes(this.props.toothNo + this.props.toothSurface[0])){
                this.setState({topColor: 'yellow'});
           }
           if (this.props.selectedTeeth.includes(this.props.toothNo + this.props.toothSurface[1])){
                this.setState({leftColor: 'yellow'});
            }
            if (this.props.selectedTeeth.includes(this.props.toothNo + this.props.toothSurface[2])){
                this.setState({bottomColor: 'yellow'});
            }
            if (this.props.selectedTeeth.includes(this.props.toothNo + this.props.toothSurface[3])){
                this.setState({rightColor: 'yellow'});
            }
            if (this.props.selectedTeeth.includes(this.props.toothNo + this.props.toothSurface[4])){
                this.setState({centerColor: 'yellow'});
            }
        }
    }

    resetColor = (isTooth) =>{
        if (isTooth){
            this.setState({toothNoColor: 'transparent'});
        } else{
            this.setState({topColor: 'transparent'});
            this.setState({leftColor: 'transparent'});
            this.setState({rightColor: 'transparent'});
            this.setState({bottomColor: 'transparent'});
            this.setState({centerColor: 'transparent'});
        }

    }

    handleOnClick = (input, event) => {
        try{
             //console.log('area click!' + input);

            let newColor;
            if(input === 'toothNo'){
                if(this.state.toothNoColor != 'yellow'){
                    newColor = 'yellow';
                    this.resetColor(false);
                }else
                    newColor = 'transparent';

                this.setState({toothNoColor: newColor});
            }
            if(input === 'top'){
                if(this.state.topColor != 'yellow'){
                    newColor = 'yellow';
                    this.resetColor(true);
                }
                else
                    newColor = 'transparent';

                this.setState({topColor: newColor});
            }

            if(input === 'left'){
                if(this.state.leftColor != 'yellow'){
                    newColor = 'yellow';
                    this.resetColor(true);
                }
                else
                    newColor = 'transparent';

                this.setState({leftColor: newColor});
            }

            if(input === 'right'){
                if(this.state.rightColor != 'yellow'){
                    newColor = 'yellow';
                    this.resetColor(true);
                }
                else
                    newColor = 'transparent';

                this.setState({rightColor: newColor});
            }

            if(input === 'bottom'){
                if(this.state.bottomColor != 'yellow'){
                    newColor = 'yellow';
                    this.resetColor(true);
                }
                else
                    newColor = 'transparent';

                this.setState({bottomColor: newColor});
            }

            if(input === 'center'){
                if(this.state.centerColor != 'yellow'){
                    newColor = 'yellow';
                    this.resetColor(true);
                }
                else
                    newColor = 'transparent';

                this.setState({centerColor: newColor});
            }



        }catch(err){
            console.log(err.message);
        }
    }

    render(){
        const { classes, toothInfo, toothNo, toothSurface, dentalChartData, toothBridgeCondition, handleTeethSelectChange, handleSurfaceSelectChange, selectedTeeth,...rest } = this.props;

        const rootClass = clsx(toothInfo.parentClasses ? toothInfo.parentClasses.root : '', classes.root);
        const paperClass = clsx(toothInfo.parentClasses ? toothInfo.parentClasses.paper : '', classes.paper);
        const svgClass = clsx(toothInfo.parentClasses ? toothInfo.parentClasses.svgClass : '', classes.svgClass);

        const bridgeRootClass = clsx(toothInfo.parentClasses ? toothInfo.parentClasses.bridgeRoot : '', classes.bridgeRoot);
        const bridgePaperClass = clsx(toothInfo.parentClasses ? toothInfo.parentClasses.bridgePaper : '', classes.bridgePaper);
        const bridgeSvgClass = clsx(toothInfo.parentClasses ? toothInfo.parentClasses.bridgeSvgClass : '', classes.bridgeSvgClass);

        const scale = toothInfo.sizeScale ? toothInfo.sizeScale : this.state.sizeScale;
        
        const toothNoColor = this.state.toothNoColor;
        const topColor = this.state.topColor;
        const leftColor = this.state.leftColor;
        const bottomColor = this.state.bottomColor;
        const rightColor = this.state.rightColor;
        const centerColor = this.state.centerColor;

        //console.log('toothNoColor ' + toothNoColor);
        //console.log('toothSurface ' + toothSurface);
        //const supernermary = (toothNo == 14)?'1s':' ';

        //console.log('svgToothBridgeClass ' + svgToothBridgeClass);

        return(

                    
             <React.Fragment>
                 <div className={classes.toothBridgeBorder}>
                    <Grid container className={bridgePaperClass}>
                        {/* <Paper elevation={0} className={bridgePaperClass}>     */}
                            {
                                <svg xmlns="http://www.w3.org/2000/svg" className={bridgeSvgClass}>
                                {toothSvgUtil.getDrawBridgeSvg(scale, toothNo,dentalChartData)}
                                </svg>
                            }
                            

                               
                        {/* </Paper> */}
                    </Grid>
                 </div>
        
                <div className={classes.toothBorder}>
                    <Grid container className={rootClass}>                         
                        <Paper className={paperClass}>                        
                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className={svgClass}>
                                    {/* section of the teeth */}
                                    <path d={toothSvgUtil.getT48TopAreaSvg(scale)} fill={this.state.topColor} />
                                    <path d={toothSvgUtil.getT48LeftAreaSvg(scale)} fill={this.state.leftColor} />
                                    <path d={toothSvgUtil.getT48BottomAreaSvg(scale)} fill={this.state.bottomColor} />
                                    <path d={toothSvgUtil.getT48RightAreaSvg(scale)} fill={this.state.rightColor}/>
                                    <path d={toothSvgUtil.getT48CenterAreaSvg(scale)} fill={this.state.centerColor} />

                                   
                                    {/* line of the teeth */}
                                    <path d={toothSvgUtil.getT48Line1(scale)} stroke="black" strokeWidth={5*scale} fill="none"/>
                                    <path d={toothSvgUtil.getT48Line2(scale)} stroke="black" strokeWidth={3*scale} fill="none"/>
                                    <path d={toothSvgUtil.getT48Line3(scale)} stroke="black" strokeWidth={3*scale} fill="none"/>
                                    <path d={toothSvgUtil.getT48Line4(scale)} stroke="black" strokeWidth={3*scale} fill="none"/>
                                    <path d={toothSvgUtil.getT48Line5(scale)} stroke="black" strokeWidth={3*scale} fill="none"/>
                                    <path d={toothSvgUtil.getT48Line5(scale)} stroke="black" strokeWidth={3*scale} fill="none"/>
                                
                                    

                                    {/* tooth condition */}
                                    {/*toothSvgUtil.getCariesSvg(scale, toothSvgUtil.positionSB, toothSvgUtil.tooth48)*/}
                                    {/*toothSvgUtil.getAbrasionSvg(scale, toothSvgUtil.positionSB)*/}
                                    {/*toothSvgUtil.getAbutmentSvg(scale)*/}
                                    {/*toothSvgUtil.getPonticSvg(scale)*/}
                                    {""}
                                    {toothSvgUtil.getToothSvg(scale, toothSvgUtil.tooth48, toothNo, dentalChartData)}
                                    {toothSvgUtil.getPositionSTSvg(scale, toothSvgUtil.positionSB, toothSvgUtil.tooth48, toothNo, dentalChartData, topColor)}
                                    {toothSvgUtil.getPositionSBSvg(scale, toothSvgUtil.positionSB, toothSvgUtil.tooth48, toothNo, dentalChartData, bottomColor)}
                                    {toothSvgUtil.getPositionSCSvg(scale, toothSvgUtil.positionSC, toothSvgUtil.tooth48, toothNo, dentalChartData, centerColor)}
                                    {toothSvgUtil.getPositionSRSvg(scale, toothSvgUtil.positionSB, toothSvgUtil.tooth48, toothNo, dentalChartData, rightColor)}
                                    {toothSvgUtil.getPositionSLSvg(scale, toothSvgUtil.positionSL, toothSvgUtil.tooth48, toothNo, dentalChartData, leftColor)}

                                     {/* interaction section of the teeth */}
                                     <path d={toothSvgUtil.getT48TopAreaSvg(scale)} fill="transparent" onClick={(e) => {this.handleOnClick('top', e); handleTeethSelectChange(toothNo + toothSurface[0], topColor == 'yellow'?true:false);}}/>
                                     <path d={toothSvgUtil.getT48LeftAreaSvg(scale)} fill="transparent" onClick={(e) => {this.handleOnClick('left', e); handleTeethSelectChange(toothNo + toothSurface[1], leftColor == 'yellow'?true:false);}}/>
                                     <path d={toothSvgUtil.getT48BottomAreaSvg(scale)} fill="transparent" onClick={(e) => {this.handleOnClick('bottom', e); handleTeethSelectChange(toothNo + toothSurface[2], bottomColor == 'yellow'?true:false);}}/>
                                     <path d={toothSvgUtil.getT48RightAreaSvg(scale)} fill="transparent" onClick={(e) => {this.handleOnClick('right', e); handleTeethSelectChange(toothNo + toothSurface[3], rightColor == 'yellow'?true:false);}}/>
                                     <path d={toothSvgUtil.getT48CenterAreaSvg(scale)} fill="transparent" onClick={(e) => {this.handleOnClick('center', e); handleTeethSelectChange(toothNo + toothSurface[4], centerColor == 'yellow'?true:false);}}/>

                            </svg>
                        </Paper>
                        {
                        toothNoColor == 'yellow' && (
                        <span style={{backgroundColor: 'yellow'}} onClick={(e) => {this.handleOnClick('toothNo', e);handleTeethSelectChange(toothNo, true);}} className={classes.toothNo}>{toothNo}&nbsp;<span className={classes.abbrevClass2}>{toothSvgUtil.getAbbrev(scale, toothNo, dentalChartData)}</span></span>
                        )
                        }
                        {
                        toothNoColor != 'yellow'  && (
                        <span onClick={(e) => {this.handleOnClick('toothNo', e);handleTeethSelectChange(toothNo);}} className={classes.toothNo}>{toothNo}&nbsp;<span className={classes.abbrevClass2}>{toothSvgUtil.getAbbrev(scale, toothNo, dentalChartData)}</span></span>
                        )
                        }
                    <span className={classes.abbrevClass}><span className={classes.abbrevClass2}>{toothSvgUtil.getRootAbbrev(scale, toothNo, dentalChartData)}</span>&nbsp;</span>  
                    <span className={classes.supernermaryClass}><span className={classes.supernermaryClass}>{toothSvgUtil.getSupernumerary(scale, toothNo, dentalChartData)}</span>&nbsp;</span>
                    </Grid>
                </div>
                
             </React.Fragment>
        );
    }

}

export default withStyles(styles)(DtsTooth48);
