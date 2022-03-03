import React, { Component } from 'react';
import { styles } from './ProblemContainerStyle';
import { withStyles, Card, CardContent, Typography, Tooltip, Grid } from '@material-ui/core';
import _ from 'lodash';
import CIMSButton from '../../../../../../../components/Buttons/CIMSButton';
import FuzzyQueryBox from '../../../../components/FuzzyQueryBox/FuzzyQueryBox';
import { COMMON_SYS_CONFIG_KEY, DEFAULT_OFFLINE_PAGE_SIZE} from '../../../../../../../constants/common/commonConstants';
import {axios} from '../../../../../../../services/axiosInstance';
// import * as constants from '../../../../../../../constants/medicalHistories/medicalHistoriesConstants';

class ProblemContainer extends Component {
  constructor(props){
    super(props);
    this.titleRef = React.createRef();
    this.btnBarRef = React.createRef();
    this.state={
      cardContainerHeight: undefined,
      inputProblemText: '',
      searchProblemList: [],
      cardColumns: 3,
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

  resetHeight = _.debounce(() => {
    if (
      this.props.containerHeight &&
      this.titleRef.current &&
      this.btnBarRef.current &&
      this.btnBarRef.current.clientHeight !== 0 &&
      this.titleRef.current.clientHeight !== 0
    ) {
      let cardContainerHeight = this.props.containerHeight - this.titleRef.current.clientHeight - this.btnBarRef.current.clientHeight - 20;
      if (cardContainerHeight !== this.state.cardContainerHeight) {
        this.setState({ cardContainerHeight });
      }
    }
  }, 300);

  handleAddClick = () => {
    const { handleOtherProblemAdd,insertMedicalHistoriesLog } = this.props;
    let { inputProblemText } = this.state;
    let item = {
      codeTermId: null,
      termDesc: inputProblemText,
      termCncptId: null
    };
    insertMedicalHistoriesLog && insertMedicalHistoriesLog(`[Family History] [Family History Problem Dialog] Action: Click 'Add' button in Other Problem(s) (Problem: ${inputProblemText})`, '');
    handleOtherProblemAdd&&handleOtherProblemAdd(item);
  }

  handleSetText = (textVal) => {
    this.setState({
      inputProblemText: _.trim(textVal),
      searchProblemListTotalNums:0,
      searchProblemList:[]
    });
  }

  handleProblemSelectItem = item => {
    const { handleOtherProblemAdd,insertMedicalHistoriesLog } = this.props;
    handleOtherProblemAdd&&handleOtherProblemAdd(item);
    this.setState({
      searchProblemList: [],
      searchProblemListTotalNums: 0
    });
    let name=`[Family History] [Family History Problem Dialog] Action: Select a problem in Other Problem(s) Did You Mean drop-down list (Code Term ID: ${item.codeTermId}; Problem: ${item.termDisplayName})`;
    insertMedicalHistoriesLog && insertMedicalHistoriesLog(name, '');
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
    insertMedicalHistoriesLog&&insertMedicalHistoriesLog(`[Family History] [Family History Problem Dialog] Action: Search ${textVal} in Other Problem(s)`,'/diagnosis/codeList/codeDxpxTermByG/page/');
  };

  handleSearchBoxLoadMoreRows = (startIndex,stopIndex,valText,dataList,updateState) => {
    return axios
      .get(`/diagnosis/codeList/codeDxpxTermByG/page/?start=${startIndex}&end=${stopIndex+1}&diagnosisText=${encodeURIComponent(valText)}`)
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
          <Card key={`family_terminology_card_${i}`} className={classes.card}>
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
                            id={`family_terminology_service_item_${item.terminologyServiceId}`}
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
    const { classes, sysConfig, insertMedicalHistoriesLog } = this.props;
    let { cardContainerHeight, searchProblemListTotalNums, searchProblemList, inputProblemText } = this.state;

    let fuzzyQueryProps = {
      id: 'family_other_problem',
      paperLeftSize: -60,
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
      historyTypeName:'[Family History] [Family History Problem Dialog]'
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
                    id="btn_family_history_problem_table_add"
                    disabled={inputProblemText === ''}
                    style={{minHeight: 32, maxHeight: 32}}
                    onClick={()=>{this.handleAddClick();}}
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
