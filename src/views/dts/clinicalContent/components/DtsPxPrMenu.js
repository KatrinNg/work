import React, { Component } from 'react';
import {fade } from '@material-ui/core/styles';
import { makeStyles, withStyles ,createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import {List, ListItem, ListItemText, ListItemIcon, ListItemAvatar, SvgIcon, MenuList} from '@material-ui/core';
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faUserMd, faClinicMedical, faTeeth, faTooth, faPills, faFileMedical, faMehBlank } from '@fortawesome/free-solid-svg-icons';
import { Paper,Card, CardMedia } from '@material-ui/core';
import * as config from './probProcConfig';
import Button from '@material-ui/core/Button';
import { green, purple } from '@material-ui/core/colors';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import MoreIcon from '@material-ui/icons/MoreVert';
import pink from '@material-ui/core/colors/pink';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Fade from '@material-ui/core/Fade';
import Divider from '@material-ui/core/Divider';
import DirectionsIcon from '@material-ui/icons/Directions';
import Tooltip from '@material-ui/core/Tooltip';

import Grid from '@material-ui/core/Grid';
//import toothIcon from '../../../../images/clinicalContent/tooth.svg';
import FaTooth  from '../../../../images/clinicalContent/tooth-solid.svg';
import FauserMd  from '../../../../images/clinicalContent/user-md-solid.svg';
import { connect } from 'react-redux';
import { getCommonUsedProbProc, getQualifier, getProbProcAddDetails, resetSelectedVal, resetAll} from '../../../../store/actions/dts/clinicalContent/problemProcedureAction';
import classNames from 'classnames';
import FuzzySearchBox from '../../../../components/Search/FuzzySearchBox';
import {
  getInputProblemList,
  getProblemCodeDiagnosisStatusList,
  updatePatientProblem,
  deletePatientProblem,
  listCodeDiagnosisTypes,
  getHistoricalRecords,
  queryProblemList,
  requestProblemTemplateList,
  savePatient,
  getChronicProblemList,
  getCodeLocalTerm
} from '../../../../store/actions/consultation/dxpx/diagnosis/diagnosisAction';
import {
  getInputProcedureList,
  getProcedureCodeDiagnosisStatusList,
  updatePatientProcedure,
  deletePatientProcedure,
  queryProcedureList,
  requestProcedureTemplateList
} from '../../../../store/actions/consultation/dxpx/procedure/procedureAction';
import {
  COMMON_ACTION_TYPE,
  COMMON_SYS_CONFIG_KEY,
  DEFAULT_OFFLINE_PAGE_SIZE,
  COMMON_CHECKBOX_TYPE
} from '../../../../constants/common/commonConstants';
import { find, isUndefined, toInteger, findIndex ,cloneDeep,isEmpty} from 'lodash';
import {axios} from '../../../../services/axiosInstance';

const PROCEDURE = 1;
const PROBLEM = 0;

const styles = (theme) => ({
  // root: {
  //   flexGrow: 1,
  //   backgroundColor: theme.palette.background.paper,
  //   display: 'flex',
  //   // height: 224,
  // },
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 400,
    flexGrow: 1
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
    // backgroundColor: theme.palette.background.paper,
  },
  iconButton: {
    padding: 10
  },
  divider: {
    height: 28,
    margin: 4
  },
  grow: {
  flexGrow: 1
  },
  tabsRight: {
    borderRight: `1px solid ${theme.palette.divider}`
  },
  tabsBottom: {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  listRoot: {
      width: '100%',
      maxWidth: 360,
      // backgroundColor: 'inherit',
      position: 'relative',
      overflow: 'auto'
      // height: 750,
  },
  listSection: {
    // backgroundColor: 'inherit',
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    marginRight: theme.spacing(2),
    marginLeft: theme.spacing(3),
    // width: 700,
    width: '100%'
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  inputRoot: {
    width: '240px',
    backgroundColor: '#f48fb1',
    color: 'inherit'
  },
  inputRootSecondary: {
    width: '240px',
    backgroundColor: '#3f51b5',
    color: 'inherit'
  },
  appbar: {
    // vertical padding + font size from searchIcon
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      '&:focus': {
        width: '20ch'
      }
    }
  },
  inputPaper: {
    height: 40,
    border: 'none',
    boxShadow: 'none',
    borderRadius: 0,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25)
    },
    color: 'inherit !important'
  },
  serachInput: {
    flex: 1,
    fontSize: '12pt',
    marginTop: 10,
    paddingLeft: 7,
    marginLeft: -12,
    width: 178,
    color: 'inherit'
    // width: 303
  },
  inputInput: {
    //padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    //paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    paddingLeft: '19px',
    padding:'0px 14px',
    //transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '20.7ch',
      '&:focus': {
        width: '24.7ch'
      }
    },
    color: 'inherit !important'
  },
    iconImage: {
    // height: 19,
    // width: 24
    height: 25,
    width: 30
  },
  selectedItem: {
    backgroundColor: '#DCDCDC'
  },
  probProc: {
    '&:hover': {
      backgroundColor: '#77C3EC',
      color: 'white'
    }
  }
});

// const theme1 = createMuiTheme({
//   palette: {
//     secondary: {
//       main: pink[200]
//     }
//   }
// });
const StyledTab = withStyles((theme) => ({
  root: {
    minWidth: 30,
    textTransform: 'none',
    '&$selected': {
      color: '#FFFFFF',
      backgroundColor : '#c2c2c2'
    }
  },
  selected: {}

}))((props) => <Tab disableRipple {...props} />);


class DtsPxPrMenu extends Component {

  // const [anchorEl, setAnchorEl] = React.useState(null);
  // const open = Boolean(anchorEl);
  // const isMenuOpen = Boolean(anchorEl);
  // const [specTabIndx, setSpecTabIndx] = React.useState(0);
  // const [setOpen] = React.useState(false);
  // const [probProcIndx, setProbProcIndx] = React.useState(tmpProbProc);
  // const [showProblem, setShowProblem] = React.useState(false);
  // const [showProcedure, setShowProcedure] = React.useState(tmpProbProc);



  constructor(props){

        super(props);

        this.state = {
            anchorEl: null,
            open: false,
            isMenuOpen: false,
            specTabIndx: 2,
            probProcIndx: 0,
            cmnTermIndx: -1,
            showProblem: false,
            showProcedure: 0,
            searchProbProcList: [],
            searchProbProcTotalNums: 0

        };
    }

    componentDidMount(prevProps, prevState){
      this.props.getCommonUsedProbProc();
    }

    componentDidUpdate(prevProps, prevState){

       if(prevProps.probProcAddDetails != this.props.probProcAddDetails){
        if (typeof this.props.probProcAddDetails != 'undefined' && typeof this.props.probProcAddDetails.defaultHx != 'undefined' && this.props.probProcAddDetails.defaultHx=='Y'){
          this.props.setDefaultProbHx(true);
        } else{
          this.props.setDefaultProbHx(false);
        }
       }

    }

    componentWillUnmount() {
      this.props.resetAll();
    }


  handleChange = (event, newValue) => {

    this.setState({specTabIndx: newValue});
    this.setState({cmnTermIndx: -1});
    //console.log('handleChange: ' + newValue);
  };

  handleCmnTermChange = (event, newValue, newTermCncptId, newTermId, encounterSdt) => {
    const { probProcAddDetails, setDefaultProbHx, ...rest} = this.props;
    this.setState({cmnTermIndx: newValue});
    this.props.getQualifier(newTermCncptId, encounterSdt);
    this.props.getProbProcAddDetails(newTermId);
  };

  handleMenuClose = () => {
    this.setState({anchorEl: null});
  };

  handleHotKeyClick =() => {
    const { handleCmnTermIndxOnChange, ...rest} = this.props;
    if(this.state.probProcIndx ===0){
      //console.log('handleHotKeyClick: 0');
      this.setState({probProcIndx: 1, specTabIndx: 2, cmnTermIndx: -1});
      handleCmnTermIndxOnChange(-1);

    }else{
      //console.log('handleHotKeyClick: 1');
      this.setState({probProcIndx: 0, specTabIndx: 2, cmnTermIndx: -1});
      handleCmnTermIndxOnChange(-1);
    }
  }

  printMeueTab = (isProbleProcedure, pname) => {
    //console.log('isProbleProcedure ==> ' + isProbleProcedure );
    //console.log('pname ==> ' + pname );
    if(pname !== 'RESET' && pname !== 'SET' && pname !== 'PREVENT') {
      return <StyledTab label={pname}  />;
    }
    else if (pname === 'RESET' && isProbleProcedure === PROBLEM) {
        // console.log("problem ==> " + isProbleProcedure + ", pname ==> " + pname)
      return <StyledTab label={pname}  />;
    }
    else if ( (pname === 'SET' || pname === 'PREVENT') && isProbleProcedure === PROCEDURE) {
      // console.log("PROCEDURE ==> " + isProbleProcedure + ", pname ==> " + pname)
      return <StyledTab label={pname}  />;
    }
    else {
      return <section />;
    }
  };

  handleProblemSearchBoxLoadMoreRows = (
    startIndex,
    stopIndex,
    valText,
    dataList,
    updateState,
    localTerm = 'Y',
    diagnosisText = valText,
    diagnosisTypeCd = '1',
    start = startIndex,
    end = stopIndex + 1
  ) => {
    let probProcIndx = this.state.probProcIndx;
    if (probProcIndx == 1){
      diagnosisTypeCd = '2';
    }

    return axios
        .get(`/diagnosis/codeList/codeDxpxTerm/page/?localTerm=${localTerm}&diagnosisText=${diagnosisText}&diagnosisTypeCd=${diagnosisTypeCd}&start=${start}&end=${end}`)
        .then(response => {
            if (response.data.respCode === 0) {
                dataList = dataList.concat(response.data.data.recordList);
                updateState &&
                    updateState({
                        dataList
                    });
            }
        });
  };

  handleProbProcFuzzySearch = (textVal, InputBlur) => {
    let { sysConfig } = this.props;
    let probProcIndx = this.state.probProcIndx;

    if (probProcIndx == 0){
      this.props.queryProblemList({
          params: {
              localTerm:'Y',
              diagnosisText: textVal,
              diagnosisTypeCd: '1',
              start: 0,
              end: !!sysConfig[COMMON_SYS_CONFIG_KEY.PAGE_SIZE]
                  ? toInteger(
                        sysConfig[COMMON_SYS_CONFIG_KEY.PAGE_SIZE].value
                    )
                  : DEFAULT_OFFLINE_PAGE_SIZE
          },
          callback: data => {
              this.setState({
                  searchProbProcList: data.recordList,
                  searchProbProcTotalNums: data.totalRecord || 0
              });
          }
      });
    } else{
      this.props.queryProcedureList({
        params: {
            localTerm:'Y',
            diagnosisText: textVal,
            diagnosisTypeCd: '2',
            start: 0,
            end: 30
        },
        callback: data => {
            /*
            let tempObj = find(data.recordList, item => {
                return item.termDisplayName === textVal.trim();
            });
            if (tempObj) {
                this.setState({
                    isShowBtnProcedure: true
                });
            } else {
                this.setState({
                    isShowBtnProcedure: false
                });
            }
            */
            this.setState({
                searchProbProcList: data.recordList,
                searchProbProcTotalNums: data.totalRecord || 0
            });
        }
    });
    }
  };

  handleProbProcSelectItem = item => {
    const {encounterSdt, handlePxPrMenuOnChange, ...rest } = this.props;
    let probProcIndx = this.state.probProcIndx;
    //console.log('Dicky search ' , item);
    this.props.getQualifier(item.termCncptId, encounterSdt);
    this.props.getProbProcAddDetails(item.codeTermId);
    handlePxPrMenuOnChange(null, item.termDesc, item.codeTermId, probProcIndx==0?'1':'2');
  }

  closeSearchData = () => {

  };

  handleAddSearchData = (textVal, clickAddMark) => {

  };

  theme1 = (theme) => createMuiTheme({
  palette: {
    secondary: {
      main: pink[200]
    }
  },
  overrides: {
    ...theme.overrides,
    MuiInputBase: {
        root: {
            color: 'inherit'
        },
        input: {
            color: 'inherit'
        }
    }
}
});
        render(){

          const { classes,className, commonUsedProbProcList, qualifierList, probProcAddDetails, multiSel, handlePxPrMenuOnChange, encounterSdt, handleCmnTermIndxOnChange, cmnTermIndx, submitQualifierForm, ...rest } = this.props;

          const open = Boolean(this.state.anchorEl);

          //console.log('this.state.probProcIndx: ' + this.state.probProcIndx);
          //console.log('this.state.specTabIndx: ' + this.state.specTabIndx);
          //console.log('this.state.cmnTermIndx: ' + this.state.cmnTermIndx);
          //console.log('probProcAddDetails ', probProcAddDetails);

          const commonUsedLoaded = commonUsedProbProcList && Boolean(commonUsedProbProcList.length > 0);
          let searchProbProcList = this.state.searchProbProcList;
          let searchProbProcTotalNums = this.state.searchProbProcTotalNums;
          return(
              <Grid container spacing={0}>
                {commonUsedLoaded && (
                  <Grid item key="menuAppBar" xs={12}>
                        <MuiThemeProvider theme={this.theme1}>
                          <AppBar className={classes.appbar} dense position="static" color={this.state.probProcIndx === 0 ? 'secondary' : 'primary'} >
                          <Toolbar variant="dense">
                          {/*<IconButton edge="start" className={classes.menuButton} color="inherit" onClick={handleMenuClick}>
                            <MenuIcon />
                          </IconButton>*/}

                        <Tooltip title={this.state.probProcIndx === 0 ? 'Pr Hotkey' : 'Px Hotkey'}  >
                          {/* <IconButton edge="start" className={classes.menuButton} color="inherit" onClick={()=>this.setState({propProcIndx: this.state.probProcIndx===0? 1 : 0})} > */}

                              <IconButton id={'hotKey'} edge="start" color="inherit" onClick={()=>this.handleHotKeyClick()} >
                                    {/* <FaTooth style={{width: 19, height: 24}}/> */}
                              {this.state.probProcIndx== 0?
                                <FaTooth className={classes.iconImage}/>: <FauserMd className={classes.iconImage}></FauserMd>
                              }

                            </IconButton>
                        </Tooltip>


                        <div >

                        <FuzzySearchBox
                            dataList={
                              searchProbProcList
                            }
                            inputPlaceHolder={this.state.probProcIndx === 0 ? 'Search  Problem' : 'Search Procedure'}
                            classes={this.state.probProcIndx === 0 ? {
                              root: classes.inputRoot,
                              input: classes.inputInput,
                              inputPaper: classes.inputPaper
                            }:{
                              root: classes.inputRootSecondary,
                              input: classes.inputInput,
                              inputPaper: classes.inputPaper
                            }}
                            displayField={[
                              'termDisplayName'
                            ]}
                            handleSearchBoxLoadMoreRows={
                                this.handleProblemSearchBoxLoadMoreRows
                            }
                            id="probProcSearchBox"
                            limitValue={3}
                            onChange={
                                this.handleProbProcFuzzySearch
                            }
                            onSelectItem={this.handleProbProcSelectItem.bind(this)}
                            totalNums={
                              searchProbProcTotalNums
                            }
                            //{...searchAddProblem}
                            closeSearchData={this.closeSearchData.bind(this)}
                            handleAddSearchData={
                                this.handleAddSearchData
                            }
                            inputProps={{ 'aria-label': 'search' , size: 60}}
                        />
                        </div>

                        </Toolbar>
                        </AppBar>

                        <Menu
                            id="pxpr-hotkey-menu"
                            anchorEl={this.state.anchorEl}
                            keepMounted
                            open={open}
                            onClose={this.handleMenuClose}
                            TransitionComponent={Fade}
                        >
                          <MenuItem onClick={()=>{this.setState({probProcIndx: PROBLEM, specTabIndx: 2, cmnTermIndx: -1}); handleCmnTermIndxOnChange(-1); this.handleMenuClose();}}>PX Hotkey</MenuItem>
                          <MenuItem onClick={()=>{this.setState({probProcIndx: PROCEDURE, specTabIndx: 2, cmnTermIndx: -1});handleCmnTermIndxOnChange(-1);this.handleMenuClose();}}>PR Hotkey</MenuItem>
                        </Menu>
                      </MuiThemeProvider>
                  </Grid>
                )
              }
              {commonUsedLoaded && (
                  <Grid item key="dispTab" xs={3} spacing={1}>

                      {/* <Tabs
                          orientation="vertical"
                          variant="scrollable"
                          value={specTabIndx}
                          onChange={handleChange}
                          className={classes.tabsRight}
                          width={500}
                      >

                      {commonUsedProbProcList.map((speciality, nindex) => (
                          printMeueTab(probProcIndx,speciality.pname)
                      ))}
                      </Tabs> */}
                              <MenuList id="split-button-menu">
                                    {commonUsedProbProcList.map((option, index) => (
                                          <MenuItem
                                              open={open}
                                              key={index}
                                              //className={classes.tabsRight}
                                              className={classNames({
                                                [classes.selectedItem]: index === this.state.specTabIndx},
                                                classes.tabsRight)}
                                              onClick={event => this.handleChange(event, index)}
                                          >
                                          {this.printMeueTab(this.state.probProcIndx,option.pname)}


                                        </MenuItem>
                                    ))}
                              </MenuList>

                        {/* <MenuList id="menu-list">
                            {config.probProcMap.map(function(value, idx){
                                <MenuItem
                                    key={idx}
                                    className={(props.direct === 'vertical') ? classes.menuItemHorizontal : ''}
                                >
                                                    {value.item}
                                            </MenuItem>;
                                        })}
                        </MenuList> */}


                  </Grid>
                  )
                  }
                   {commonUsedLoaded && (
                  <Grid item key="hotKeyTab" xs={9} spacing={1}>
                      {commonUsedProbProcList.map((speciality, nindex) => (
                        // not show reset
                          this.state.specTabIndx === nindex && this.state.probProcIndx === PROBLEM  && (
                            <List disablePadding dense className={classes.listRoot} >
                                {speciality.probDetail.map((prob, index) => (
                                  <ListItem
                                      button
                                      //className={classes.nested}
                                      className={classNames({
                                        [classes.selectedItem]: (this.state.specTabIndx === nindex && index === cmnTermIndx && (typeof qualifierList != 'undefined'))},
                                        classes.nested)} onClick={event => {submitQualifierForm(prob.termDescDsp, prob.codeTermId, '1', index, prob.termCncptId, encounterSdt);}}
                                      dense
                                      key
                                  >
                                  <ListItemText primary={prob.dspDesc} />
                                  </ListItem>
                                ))}
                            </List>
                          )
                      ))}
                      {commonUsedProbProcList.map((speciality, nindex) => (
                        // not show reset
                         this.state. specTabIndx === nindex && this.state.probProcIndx === PROCEDURE  && (
                            <List disablePadding dense className={classes.listRoot}>
                                {speciality.procDetail.map((proc, index) => (
                                  <ListItem
                                      button
                                      //className={classes.nested}
                                      className={classNames({
                                        [classes.selectedItem]: (this.state.specTabIndx === nindex && index === cmnTermIndx && (typeof qualifierList != 'undefined'))},
                                        classes.nested)} onClick={event => {submitQualifierForm(proc.termDescDsp, proc.codeTermId, '2', index, proc.termCncptId, encounterSdt);}}
                                      dense
                                      key
                                  >
                                  <ListItemText  classes={{ primary: classes.list_text }}   primary={proc.dspDesc} />
                                  </ListItem>
                                ))}
                            </List>
                          )
                      ))}
                  </Grid>
                  )
                }
              </Grid>
          );
        }

}

const mapStateToProps = (state) => {
    // console.log(state.dtsAppointmentAttendance.patientKey);

    return {
      encounter: state.patient.encounterInfo,
      commonUsedProbProcList: state.dtsProbProc.commonUsedProbProcList,
      qualifierList: state.dtsProbProc.qualifierList,
      probProcAddDetails: state.dtsProbProc.probProcAddDetails,
      selectedMulQualifier: state.dtsProbProc.selectedMulQualifier,
      //cmnTermIndx: state.dtsProbProc.cmnTermIndx,
      sysConfig: state.clinicalNote.sysConfig
    };
};

const mapDispatchToProps = {
    getCommonUsedProbProc,
    getQualifier,
    getProbProcAddDetails,
    resetSelectedVal,
    resetAll,
    queryProblemList,
    queryProcedureList
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DtsPxPrMenu));