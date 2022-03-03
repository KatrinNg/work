import React, { Component } from 'react';
import {
    Typography,
    Grid,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@material-ui/core';
import DoneIcon from '@material-ui/icons/Done';
import ClearIcon from '@material-ui/icons/Clear';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import health from '../../../images/moe/health.png';
import exampleSameDrug from '../../../images/moe/exampleSameDrug.jpg';
import exampleHLAB from '../../../images/moe/exampleHLAB.jpg';
import {getMDSEnq} from '../../../store/actions/moe/moeAction';
import {getLoginInfo} from '../../../utilities/moe/moeUtilities';

const styles = theme => ({
    headerBackground: {
        backgroundColor: '#b8bcb9'
    },
    hearder: {
        height:'32px',
        paddingTop:'4px'
    },
    headerFontSize: {
        fontSize: '16px',
        fontWeight: 'bold'
    },
    tabRoot: {
        maxWidth: '100%',
        minHeight: '0px'
    },
    sizeSmall: {
        margin: theme.spacing(1),
        padding: '8px 24px'
    },
    dacCurHospital: {
        width: '100%',
        overflow: 'auto',
        paddingLeft:'40px',
        height: '420px'
    }
});

let setting = null;

class MdsEnqPanel extends Component{
    constructor(props){
        super(props);
        this.state={
            overallTabValue : 0,
            dacTabVal: 0,
            dacTabArr: ['TESTTAB1','TESTTAB2','TESTTAB3','TESTTAB4','TESTTAB5','TESTTAB6','TESTTAB7','TESTTAB8','TESTTAB10','TESTTAB11','TESTTAB12'],
            valArr1: ['TEST1','TEST2','TEST3','TEST4','TEST5','TEST6','TEST7','TEST8','TEST9','TEST10','TEST11','TEST12','TEST13','TEST14','TEST15','TEST16','TEST17','TEST18','TEST19','TEST20','TEST22','TEST23','TEST24','TEST25','TEST26','TEST27','TEST28','TEST29','TEST30','TEST31','TEST32','TEST33','TEST34','TEST35','TEST36','TEST37','TEST38','TEST39','TEST40','TEST41','TEST43','TEST44','TEST45','TEST46','TEST47','TEST48','TEST49','TEST50','TEST51','TEST52','TEST53'],
            valArr2: ['TEST1','TEST2','TEST3','TEST4','TEST5 TEST5 TEST5 TEST5 TEST5 TEST5 TEST5 TEST5 TEST5 TEST5 TEST5 TEST5 TEST5 TEST5 TEST5 TEST5','TEST6','TEST7','TEST8','TEST9','TEST10','TEST11','TEST12','TEST13','TEST14','TEST15','TEST16','TEST17','TEST18','TEST19','TEST20','TEST22','TEST23']
        };
    }

    componentDidMount() {
        let param = {
            hospCode : setting.hospitalCd,
            userId : setting.userId
        };
        this.props.getMDSEnq(param);
    }


    handleChangeOverallTabVal = (e, value) => {
        this.setState({
            overallTabValue: value
        });
    }

    handleChangeDacTabVal = (e, value) => {
        this.setState({
            dacTabVal: value
        });
    }

    render(){
        const { classes, id } = this.props;

        setting = getLoginInfo();

        const rowNum = 16;
        let tabDetail = (curCol,dataArr) => {
            let res = [];
            for (let index = curCol*rowNum; index < (curCol*rowNum)+rowNum && index < dataArr.length; index++) {
                res.push(
                    <ListItem key={id+'_TabDetail'+index} style={{padding:'0 0',margin:'0 0'}}>
                        <ListItemIcon>
                            {dataArr[index].isSuppressed ? <ClearIcon/> : <DoneIcon/>}
                        </ListItemIcon>
                        <ListItemText>
                            <Typography style={{fontSize: '10px'}}>{dataArr[index].activeIngredient}</Typography>
                        </ListItemText>
                    </ListItem>
                );
            }
            return res;
        };

        let tabColHtml = (dataArr) => {
            let res = [];
            for (let index = 0; index < dataArr.length/rowNum; index++) {
                res.push(
                    <List key={id+'_TabList'+index} style={{padding:'0 0',margin:'0 0',width:100/Math.ceil(dataArr.length/rowNum)+'%',float:'left'}}>
                        {tabDetail(index,dataArr)}
                    </List>
                );
            }
            return res;
        };

        let tabHtml = (mdsList) =>{
            let res = [];
            for (let index = 0; index < mdsList.length; index++) {
                res.push(
                    <Grid
                        key={id+'_dacTabVal'+index}
                        item
                        xs={12}
                        style={{display:this.state.dacTabVal === index ? 'block' : 'none'}}
                        className={classes.dacCurHospital}
                    >
                        {tabColHtml(mdsList[index].activeIngredientList)}
                    </Grid>
                );
            }
            return res;
        };

        return(
            <Typography
                style={{ justifyItems: 'center', width: '100%', height: '730px', position: 'relative'}}
                id={id}
                component={'div'}
            >
                <Grid container className={`${classes.headerBackground} ${classes.hearder}`}>
                    <Grid item>
                        <img src={health} alt={'Health'} height="22" width="33"/>
                    </Grid>
                    <Grid item style={{paddingLeft:'8px'}}>
                        <Typography className={classes.headerFontSize}>Medication Decision Support Module (MDS) Enquiry</Typography>
                    </Grid>
                </Grid>
                    <Grid container>
                        <Tabs
                            value={this.state.overallTabValue}
                            onChange={this.handleChangeOverallTabVal}
                            id={id+'_OverallTabs'}
                            indicatorColor={'primary'}
                            style={{minHeight:'0px'}}
                        >
                            <Tab
                                id={id+'_AllergyChecking'}
                                classes={{root: classes.tabRoot}}
                                label={<Typography style={{fontSize:16, textTransform: 'none'}}>Drug allergy checking function (allergen group checking)</Typography>}
                                className={this.state.overallTabValue === 0 ? 'tabSelected' : 'tabNavigation'}
                            />
                            <Tab
                                id={id+'_SameDrugChecking'}
                                classes={{root: classes.tabRoot}}
                                label={<Typography style={{fontSize:16, textTransform: 'none'}}>Same route/site same drug checking</Typography>}
                                className={this.state.overallTabValue === 1 ? 'tabSelected' : 'tabNavigation'}
                            />
                            <Tab
                                id={id+'_HLAB'}
                                classes={{root: classes.tabRoot}}
                                label={<Typography style={{fontSize:16, textTransform: 'none'}}>HLA-B*1502 laboratory test reminder</Typography>}
                                className={this.state.overallTabValue === 2 ? 'tabSelected' : 'tabNavigation'}
                            />
                        </Tabs>
                    </Grid>
                    <Grid container className={classes.sizeSmall}>
                        <Grid item container style={{display: this.state.overallTabValue === 0 ? 'block' : 'none'}}>
                            <Grid item xs={12}>
                                <Typography component={'u'} style={{fontWeight:'bold'}}>What's drug allergy checking function (allergen group)?</Typography>
                                <Grid item xs={12}>
                                    <Typography>The drug allergy checking function checks for allergies of active ingredients and a limited number of allergen groups (as listed below) which might contain different but related ingredients to the drug with which the patient has a recorded allergy.</Typography>
                                </Grid>
                            </Grid>
                            <Grid item xs={12}>
                                <br/>
                                <Typography component={'u'} style={{fontWeight:'bold'}}>Current setting in hospital</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Tabs
                                    value={this.state.dacTabVal}
                                    onChange={this.handleChangeDacTabVal}
                                    id={id+'_DACTabs'}
                                    indicatorColor={'primary'}
                                    variant="scrollable"
                                    scrollButtons="auto"
                                >
                                    {this.props.mdsList && this.props.mdsList.map(function(item, index){
                                        return(
                                            <Tab
                                                id={id+'dacTab'+index}
                                                key={id+'dacTab'+index}
                                                classes={{root: classes.tabRoot}}
                                                label={<Typography style={{fontSize:16, textTransform: 'none'}}>{item.allergenGroupDescription}</Typography>}
                                            />
                                        );
                                    })}
                                </Tabs>
                            </Grid>
                            {this.props.mdsList && tabHtml(this.props.mdsList)}
                            {/* <Grid item xs={12} style={{display:this.state.dacTabVal === 0 ? 'block' : 'none'}} className={classes.dacCurHospital}>
                                {tabHtml(this.state.valArr1)}
                            </Grid>
                            <Grid item xs={12} style={{display:this.state.dacTabVal === 1 ? 'block' : 'none', paddingLeft:'40px'}} className={classes.dacCurHospital}>
                                {tabHtml(this.state.valArr2)}
                            </Grid>
                            <Grid item xs={12} style={{display:this.state.dacTabVal !== 0 ? 'block' : 'none', paddingLeft:'40px'}} className={classes.dacCurHospital}>
                                {tabHtml([])}
                            </Grid> */}
                        </Grid>
                        <Grid item container style={{display: this.state.overallTabValue === 1 ? 'block' : 'none'}}>
                            <Grid item xs={12}>
                                <Typography component={'u'} style={{fontWeight:'bold'}}>What's same route/site same drug checking?</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography>The same route/site same drug checking in the MDS is designed to assist medical practitioners using the MOE (or equivalent) from accidentally prescribing the same drug with the same route/site of administration twice. It will flag a duplicate in the MOE if the identical drug name is used and the same route/site of administration is chosen.</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <img src={exampleSameDrug} alt={'Example Same Drug'} height="250" width="500" style={{border:'1px solid black',marginTop:'8px'}}/>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography component={'u'} style={{fontWeight:'bold'}}>Current setting in hospital:</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography>This checking is enabled in this hospital MOE.</Typography>
                            </Grid>
                        </Grid>
                        <Grid item container style={{display: this.state.overallTabValue === 2 ? 'block' : 'none'}}>
                            <Grid item xs={12}>
                                <Typography component={'u'} style={{fontWeight:'bold'}}>What's HLA-B*1502 laboratory test reminder?</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography>Dangerous or even fatal skin reaction (Stevens Johnson syndrome and toxic epidermal necrolysis), that can be caused by carbamazepine, are significantly more common in patients with HLA-B*1502. Patients should be screened for HLA-B*1502 before newly started treatment with carbamazepine (carbamazepine treatment naive individuals).</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <br/>
                                <Typography>The MDS provides a reminder to conduct a HLA-B*1502 test if carbamazepine is prescribed when the Structured Alert Adaptation Module (SAAM) and Medication Order Entry Module (MOE) are used.</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <br/>
                                <Typography>When the status 'HLA-B*1502 Positive' is detected or the status of 'HLA-B*1502' is unknown, a reminder message will be prompted.</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <img src={exampleHLAB} alt={'Example HLA-B*1502'} height="250" width="1000" style={{border:'1px solid black',marginTop:'8px'}}/>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography component={'u'} style={{fontWeight:'bold'}}>Current setting in hospital:</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography>This checking is enabled in this hospital MOE.</Typography>
                            </Grid>
                        </Grid>
                        <Grid item container justify={'flex-end'} style={{position:'absolute',bottom:'10px',right:'20px'}}>
                            <CIMSButton id={id + '_CloseBtn'} onClick={this.props.hideMDSEnqPanel}>Close</CIMSButton>
                        </Grid>
                    </Grid>
            </Typography>
        );
    }
}

const mapStateToProps = (state) => {
    return{
        mdsList : state.moe.mdsList
    };
};
const mapDispatchToProps = {
    getMDSEnq
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MdsEnqPanel));
