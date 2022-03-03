import React, { Component } from 'react';
import { styles } from './SearchBoxStyle';
import { withStyles, Grid, Paper, IconButton, InputBase } from '@material-ui/core';
import { includes, trim, toLower, debounce } from 'lodash';
import { Search, Clear } from '@material-ui/icons';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textVal: ''
    };
  }

  searchTemplate = (inputVal) => {
    const { originTemplateMap,updateState } = this.props;
    let tempMap = new Map();
    for (let [key, value] of originTemplateMap) {
      // filter group name
      if (includes(toLower(key),toLower(inputVal))) {
        tempMap.set(key,value);
      } else {
        // filter template display name
        let tempGronpName = key;
        let tempTemplateList = [];
        for (let i = 0; i < value.length; i++) {
          const templateObj = value[i];
          if (templateObj.displayKey===0){
            if (includes(toLower(templateObj.diagnosisDisplayName),toLower(inputVal))) {
              tempTemplateList.push(templateObj);
            }
          }else if (templateObj.displayKey===1){
            if (includes(toLower(templateObj.remarks),toLower(inputVal))) {
              tempTemplateList.push(templateObj);
            }
          }
          else if (templateObj.displayKey===2){
            if (includes(toLower(templateObj.remarks),toLower(inputVal))||includes(toLower(templateObj.diagnosisDisplayName),toLower(inputVal))) {
              tempTemplateList.push(templateObj);
            }
          }
        }
        if (tempTemplateList.length > 0) {
          tempMap.set(tempGronpName,tempTemplateList);
        }
      }
    }
    updateState&&updateState({
      filterTemplateMap:tempMap
    });
  }

  handleTextChange = (event) => {
    const { insertDxpxLog, type } = this.props;
    let val = event.target.value;
    this.setState({ textVal: val });
    // this.searchTemplate(trim(val));
    // 防止频繁输入后,卡死页面
    let debounceData = debounce(this.searchTemplate, 500);
    debounceData(trim(val));
    insertDxpxLog(`[${type} Service Favourite Dialog] Action: Search ${event.target.value} in 'Search Service Favourite ${type}`, '');
  }

  handleTextClear = () => {
    const{insertDxpxLog,type}=this.props;
    insertDxpxLog(`[${type} Service Favourite Dialog] Action: Click 'X' button to clear the searching text in 'Search Service Favourite ${type} '`,'');
    this.setState({ textVal: '' });
    this.searchTemplate('');
  }

  render() {
    const { classes, labelText = '' } = this.props;
    let { textVal } = this.state;
    return (
      <Grid container direction="row" alignItems="center">
        <Grid
            container
            item
            justify="flex-start"
            alignItems="center"
            spacing={0}
            className={classes.labelWrapper}
        >
          <Grid item>
            <Paper className={classes.paperRoot} elevation={1}>
              <Search className={classes.iconButton}/>
              <InputBase
                  className={classes.input}
                  placeholder={labelText}
                  onChange={(e)=>{this.handleTextChange(e);}}
                  value={textVal}
                  autoComplete="off"
                  id="service_favourite_search_box"
                  classes={{ input: classes.innerInput }}
              />
              <IconButton
                  id="btn_search_clear"
                  className={classes.iconButton}
                  aria-label="clear"
                  classes={{
                    'root':textVal.length>0?classes.displayBlock:classes.displayNone
                  }}
                  onClick={this.handleTextClear}
              >
                <Clear />
              </IconButton>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(SearchBox);
