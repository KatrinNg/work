import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';

import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';

import DtsTooth48 from './DtsTooth48';
import DtsTooth13 from './DtsTooth13';

const styles = ({
    root: {
        width: '540px'
    },
    toothRootS: {
        width: '50px',
        height: '70px'
    },
    toothPaperS:{
        width:'50px',
        height:'50px',
        position:'relative'
    },
    toothSvgClassS:{
        borderRadius: '5px',
        position:'absolute',
        width:'50px',
        height:'50px'
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
        width: 270
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
    }

});

const teeth =
  [
    {type: 48, toothNum : 18},
    {type: 48, toothNum : 17},
    {type: 48, toothNum : 16},
    {type: 48, toothNum : 15},
    {type: 48, toothNum : 14},
    {type: 13, toothNum : 13},
    {type: 13, toothNum : 12},
    {type: 13, toothNum : 11},
    {type: 13, toothNum : 21},
    {type: 13, toothNum : 22},
    {type: 13, toothNum : 23},
    {type: 48, toothNum : 24},
    {type: 48, toothNum : 25},
    {type: 48, toothNum : 26},
    {type: 48, toothNum : 27},
    {type: 48, toothNum : 28}
  ];


class DtsDentalChat extends Component {
    constructor(props){
        super(props);
        const { classes } = this.props;
        this.state={
            teethSize: 'S',
            toothInfo: null,
            toothClassS :{
                root:classes.toothRootS,
                paper:classes.toothPaperS,
                svgClass:classes.toothSvgClassS
            },
            toothClassM :{
                root:classes.toothRootM,
                paper:classes.toothPaperM,
                svgClass:classes.toothSvgClassM
            },
            toothClassL :{
                root:classes.toothRootL,
                paper:classes.toothPaperL,
                svgClass:classes.toothSvgClassL
            }
        };
        console.log('classes : '+JSON.stringify(classes));
    }

    componentWillMount() {
        this.setState({toothInfo :{parentClasses: this.state.toothClassS, sizeScale:0.5}});
        console.log('order check point 1');
    }

    handleTeethSizeChange = (value) =>{
        console.log('handleTeethSizeChange :'+value.target.value);
        this.setState({teethSize: value.target.value});

        if(value.target.value == 'S')
            this.setState({toothInfo :{parentClasses: this.state.toothClassS, sizeScale:0.5}});
        else if(value.target.value == 'M')
            this.setState({toothInfo :{parentClasses: this.state.toothClassM, sizeScale:1}});
        else if(value.target.value == 'L')
            this.setState({toothInfo :{parentClasses: this.state.toothClassL, sizeScale:1.2}});
    }
    renderTeeth = (teeth) => {
       return <Box style={{ display: 'inline-block', verticalAlign: 'top' }}  >
         {teeth.map(tooth => (
         tooth.type === 48 ? (
            <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={tooth.toothNum} />
          )
         : (
            <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={tooth.toothNum}/>
          )
       ))}
         </Box>;
     }
    render(){
        const { classes, className, ...rest } = this.props;

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

        console.log('order check point 2');
        console.log('this.state.toothInfo : '+JSON.stringify(this.state.toothInfo));

        // const toothInfo = {parentClasses: toothClassS, sizeScale:0.5};
        // this.setState({toothInfo :{parentClasses: this.toothClassS, sizeScale:0.5}});

        return(

            <Paper >
                <Grid className={classes.option}>
                    <FormControl component="fieldset" className={classes.formControl}>
                        <RadioGroup className={classes.radioGroup} aria-label="Teeth Size" defaultValue="S" name="TeethSize" value={this.state.teethSize} onChange={e => this.handleTeethSizeChange(e)}>
                            <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="S" control={<Radio classes={{root: classes.radioButton}} />} label="Small" />
                            <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="M" control={<Radio classes={{root: classes.radioButton}} />} label="Medium" />
                            <FormControlLabel classes={{root: classes.optionRoot, label:classes.optionLabel}} value="L" control={<Radio classes={{root: classes.radioButton}} />} label="Large" />
                        </RadioGroup>
                    </FormControl>
                </Grid>

                <Grid container className={classes.root + ' ' + className} >
                  {/*this.renderTeeth(teeth)*/}

                  {teeth.map(tooth => (
                  tooth.type === 48 ? (
                     <DtsTooth48 toothInfo={this.state.toothInfo} toothNo={tooth.toothNum} />
                   )
                  : (
                     <DtsTooth13 toothInfo={this.state.toothInfo} toothNo={tooth.toothNum}/>
                   )
                ))}
                </Grid>
            </Paper>
        );
    }

}

export default withStyles(styles)(DtsDentalChat);
