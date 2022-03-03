import React, { Component } from 'react';
import { styles } from './ProblemContainerStyle';
import { withStyles, Card, CardContent, Typography, Tooltip, Grid, TextField } from '@material-ui/core';
import _ from 'lodash';
import CIMSButton from '../../../../../../../components/Buttons/CIMSButton';
import FuzzyQueryBox from '../../../../components/FuzzyQueryBox/FuzzyQueryBox';
import { COMMON_SYS_CONFIG_KEY, DEFAULT_OFFLINE_PAGE_SIZE} from '../../../../../../../constants/common/commonConstants';
import {axios} from '../../../../../../../services/axiosInstance';
import * as constants from '../../../../../../../constants/medicalHistories/medicalHistoriesConstants';

class ProblemContainer extends Component {
  constructor(props){
    super(props);
    this.titleRef = React.createRef();
    this.btnBarRef = React.createRef();
    this.state={
      cardContainerHeight: undefined,
      inputProblemText: '',
      inputAccident: '',
      cardColumns: 3,
      searchProblemList: [],
      searchProblemListTotalNums: 0
    };
  }

  componentDidMount(){
    this.resetHeight();
    window.addEventListener('resize',this.resetHeight);
  }

  componentDidUpdate(){
    this.resetHeight();
  }

  componentWillUnmount(){
    window.removeEventListener('resize',this.resetHeight);
  }

  resetHeight=_.debounce(()=>{
    if (this.props.containerHeight&&this.titleRef.current&&this.btnBarRef.current&&this.btnBarRef.current.clientHeight!==0&&this.titleRef.current.clientHeight!==0) {
      let cardContainerHeight = this.props.containerHeight - this.titleRef.current.clientHeight - this.btnBarRef.current.clientHeight - 20;
      if (cardContainerHeight!==this.state.cardContainerHeight) {
        this.setState({cardContainerHeight});
      }
    }
  },300);

  handleAddClick = (type) => {
    const { handleOtherProblemAdd,insertMedicalHistoriesLog } = this.props;
    let { inputProblemText,inputAccident } = this.state;
    let name='';
    if(type===constants.PAST_MED_HISTORY_INDT.INPUT_PROBLEM){
      name=`[Past Medical History] Action: Click 'Add' button in Other Problem(s) (Problem: ${inputProblemText})`;
    }else if(type===constants.PAST_MED_HISTORY_INDT.ACCIDENT){
      name=`[Past Medical History] Action: Click 'Add' button in Significant Accident(s) (Significant Accident: ${inputAccident})`;
    }
    let item = {
      codeTermId: null,
      termDesc: type===constants.PAST_MED_HISTORY_INDT.INPUT_PROBLEM?inputProblemText:inputAccident,
      termCncptId: null
    };
    this.setState({
      inputProblemText: '',
      inputAccident: ''
    });
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog(name,'');
    handleOtherProblemAdd&&handleOtherProblemAdd(item, type===constants.PAST_MED_HISTORY_INDT.ACCIDENT);
  }

  handleSetText = (textVal) => {
    this.setState({inputProblemText: _.trim(textVal)});
  }

  handleProblemSelectItem = item => {
    const { handleOtherProblemAdd,insertMedicalHistoriesLog } = this.props;
    if (item) {
      let name = `[Past Medical History] Action: Select a problem in Other Problem(s) Did You Mean drop-down list (Code Term ID: ${item.codeTermId}; Problem: ${item.termDisplayName})`;
      insertMedicalHistoriesLog && insertMedicalHistoriesLog(name, '');
      handleOtherProblemAdd&&handleOtherProblemAdd(item);
    }
  }

  handleProblemChange = textVal => {
    let {insertMedicalHistoriesLog}=this.props;
    this.setState({ inputProblemText: textVal });
    this.props.queryProblemList({
      params: {
        diagnosisText: textVal,
        start: 0,
        end: 30
      },
      callback: data => {
        this.setState({
          searchProblemList: data.recordList,
          searchProblemListTotalNums: data.totalRecord || 0
        });
      }
    });
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog(`[Past Medical History] Action: Search ${textVal} in Other Problem(s) `,'diagnosis/codeList/codeDxpxTermByG/page/');
  };

  handleSearchBoxLoadMoreRows = (startIndex,stopIndex,valText,dataList,updateState) => {
    return axios
      .get(`/diagnosis/codeList/codeDxpxTermByG/page/?start=${startIndex}&end=${stopIndex+1}&diagnosisText=${unescape(encodeURIComponent(valText))}`)
      .then(response => {
        if (response.data.respCode === 0) {
          dataList = dataList.concat(response.data.data.recordList);
          updateState && updateState({dataList});
        }
      });
  };

  closeSearchData = () => {
    this.setState({
        searchProblemListTotalNums:0,
        searchProblemList:[]
    });
  };

  handleItemClick = (item) => {
    const { handleProblemItemClick } = this.props;
    handleProblemItemClick&&handleProblemItemClick(item);
  }

  handleAccidentChange = (event) => {
    this.setState({inputAccident: event.target.value});
  }

  handleAccidentBlur = (event) => {
    this.setState({inputAccident: _.trim(event.target.value)});
  }

  // 将一个数组切割为二维数组
  splitMultipleArray = (array, maxMultiple) => {
    let newArray = [];
    if(_.isArray(array)) {
      // 创建空二维数组
      for(let i = 0; i < maxMultiple; i++) {
        newArray.push([]);
      }
      // 为每列填充数据
      let m = maxMultiple;
      array.forEach((g, index) => {
        let i = index + 1;
        let n = Math.floor(index / m);
        let mapArray = new Array(m)
          .fill()
          .map((item, index) => {
            let i = index + 1;
            return m * n + i;
          });
        newArray[mapArray.indexOf(i)].push(g);
      });

      return newArray;
    }
    else {
      return false;
    }
  }

  generateCardList = () => {
    const { classes, terminologyServiceList, encounterExistFlag } = this.props;
    let cards = [];
    if (_.isArray(terminologyServiceList)) {
      for (let i = 0; i < terminologyServiceList.length; i++) {
        let tempObj = terminologyServiceList[i];
        let { groupName, content } = tempObj;
        cards.push(
          <Card key={`terminology_card_${i}`} className={classes.card}>
            <CardContent classes={{root: classes.cardContent}}>
              {/* Group Name */}
              <Typography
                  component="div"
                  variant="subtitle1"
                  classes={{subtitle1: classes.groupNameTitle}}
                  noWrap
              >
                <label>{groupName}</label>
              </Typography>
              {/* terminology service */}
              <Typography component="div">
                {content.map(item => {
                  return(
                    <Typography
                        key={item.terminologyServiceId}
                        component="div"
                        variant="subtitle2"
                        noWrap
                    >
                      <Tooltip title={item.pastMedHistoryText} classes={{tooltip:classes.tooltip}}>
                        <label
                            className={encounterExistFlag?classes.textDisplayTitle:classes.textDisplayDefaultTitle}
                            id={`terminology_service_item_${item.terminologyServiceId}`}
                            onClick={() => {this.handleItemClick(item);}}
                        >
                          {`- ${item.pastMedHistoryText}`}
                        </label>
                      </Tooltip>
                    </Typography>
                  );
                })}
              </Typography>
            </CardContent>
          </Card>
        );
      }
    }

    let multipleColumnsArray = this.splitMultipleArray(cards, 3);
    return multipleColumnsArray;
  }

  render() {
    const { classes, sysConfig, encounterExistFlag, insertMedicalHistoriesLog } = this.props;
    let { cardContainerHeight, searchProblemListTotalNums, searchProblemList, inputProblemText, inputAccident } = this.state;

    let fuzzyQueryProps = {
      id: 'other_problem',
      paperLeftSize: -30,
      disabledFlag: !encounterExistFlag,
      dataList: searchProblemList,
      displayField:['termDisplayName'],
      handleSearchBoxLoadMoreRows: this.handleSearchBoxLoadMoreRows,
      onChange: this.handleProblemChange,
      onSelectItem: this.handleProblemSelectItem,
      handleSetText: this.handleSetText,
      closeSearchData: this.closeSearchData,
      totalNums:searchProblemListTotalNums,
      pageSize: !!sysConfig[COMMON_SYS_CONFIG_KEY.PAGE_SIZE]?_.toInteger(sysConfig[COMMON_SYS_CONFIG_KEY.PAGE_SIZE].value): DEFAULT_OFFLINE_PAGE_SIZE,
      limitValue:3,
      insertMedicalHistoriesLog,
      historyTypeName:'[Past Medical History]'
    };

    return (
      <div>
        <Grid container ref={this.btnBarRef}>
          <Grid item xs={6}>
            <Grid container alignItems="center">
              <Grid item xs={4}>
                <label>Other Problem(s): </label>
              </Grid>
              <Grid item xs={4}>
                <FuzzyQueryBox {...fuzzyQueryProps} />
              </Grid>
              <Grid item xs>
                <CIMSButton
                    id="past_history_other_problems_add"
                    disabled={inputProblemText === ''}
                    style={{minHeight: 32, maxHeight: 32}}
                    onClick={()=>{this.handleAddClick(constants.PAST_MED_HISTORY_INDT.INPUT_PROBLEM);}}
                >
                  Add
                </CIMSButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Grid container alignItems="center">
              <Grid item xs={4}>
                <label>Significant Accident(s): </label>
              </Grid>
              <Grid item xs={4}>
                <TextField
                    id="past_history_other_accident_text_box"
                    disabled={!encounterExistFlag}
                    fullWidth
                    autoComplete="off"
                    value={inputAccident}
                    onChange={this.handleAccidentChange}
                    onBlur={this.handleAccidentBlur}
                    inputProps={{
                      style: styles.accidentInput
                    }}
                />
              </Grid>
              <Grid item xs>
                <CIMSButton
                    id="past_history_other_accident_add"
                    style={{minHeight: 32, maxHeight: 32}}
                    disabled={inputAccident === ''}
                    onClick={()=>{this.handleAddClick(constants.PAST_MED_HISTORY_INDT.ACCIDENT);}}
                >
                  Add
                </CIMSButton>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <fieldset className={classes.fieldSetWrapper} >
          <legend ref={this.titleRef} className={classes.legend}>Problems</legend>
          <div style={{height: cardContainerHeight, overflowY: 'auto'}}>
            <div className={classes.cardList}>
                {
                  this.generateCardList().map((cardColumn, i) => {
                    return (
                      <div className={classes.cardColumn}  style={{width: `${100 / this.state.cardColumns}%`}} key={i}>
                        {
                          cardColumn
                        }
                      </div>
                    );
                  })
                }
            </div>
          </div>
        </fieldset>
      </div>
    );
  }
}

export default withStyles(styles)(ProblemContainer);
