import React, { Component } from 'react';
import { withStyles,Grid,Card,CardContent,Typography,Tooltip } from '@material-ui/core';
import { styles } from './TemplateFieldsetStyle';
import { find,isUndefined,lowerFirst } from 'lodash';
import {debounce} from 'lodash';

class TemplateFieldset extends Component {
  constructor(props) {
    super(props);
    this.state={};
    this.card=React.createRef();
  }

  componentDidMount(){
    this.resetHeight();
    window.addEventListener('resize',this.resetHeight);
  }

  componentWillUnmount(){
    window.removeEventListener('resize',this.resetHeight);
  }

  resetHeight=debounce(()=>{
    if(this.card.current&&this.card.current.clientWidth&&this.card.current.clientWidth!==this.state.currentWidth){
      if(this.card.current.clientWidth!==this.state.currentWidth){
        this.setState({
          currentWidth:this.card.current.clientWidth
        });
      }
    }
  },500);

  handleClick = templateId => {
    const { filterTemplateMap,selectedTemplateSet,selectedTemplateIdSet,updateState,insertDxpxLog,type } = this.props;
    for (let value of filterTemplateMap.values()) {
        if (value.length>0) {
            let obj = find(value,templateObj => {
                return templateObj.templateId === templateId;
            });
        if (!isUndefined(obj)) {
        insertDxpxLog(`[${type} Service Favourite Dialog] Action: Select a ${lowerFirst(type)} in Available ${type} list (Code Term ID: ${obj.codeTermId}; ${type}: ${obj.diagnosisName})`,'');
          selectedTemplateSet.add(obj);
          selectedTemplateIdSet.add(obj.templateId);
          updateState&&updateState({
            selectedTemplateSet,
            selectedTemplateIdSet
          });
        }
      }
    }
  };

  generateCardList = () => {
    const { classes, selectedTemplateIdSet, filterTemplateMap } = this.props;
    let cards = [];
    let { currentWidth } = this.state;
    if (filterTemplateMap.size > 0) {
      for (let [key, value] of filterTemplateMap) {
        cards.push(
          <Card key={Math.random()} style={{width:(currentWidth-20)/3}} className={classes.card}>
            <CardContent
                classes={{
                root: classes.cardContent
              }}
            >
              {/* Group Name */}
              <Typography
                  component="div"
                  variant="subtitle1"
                  classes={{
                    subtitle1: classes.groupNameTitle
                  }}
                  noWrap
              >
                <label className={classes.title} title={key}>{key}</label>
              </Typography>
              {/* Template Display Names */}
              <Typography component="div">
                {value.map(item => {
                  return (
                    <Typography
                        key={item.templateId}
                        component="div"
                        variant="subtitle2"
                        noWrap
                        style={{ whiteSpace: 'pre' }}
                        className={selectedTemplateIdSet.has(item.templateId)?classes.selectedTemplateWrapper:null}
                    >
                      {(item.displayKey===0||item.displayKey===2)?
                      <Tooltip
                          title={item.diagnosisDisplayName}
                          classes={{tooltip:classes.tooltip}}
                      >
                        <label
                            id={`available_template_${item.templateId}`}
                            className={selectedTemplateIdSet.has(item.templateId)?classes.selectedTemplateDisplayTitle:classes.templateDisplayTitle}
                            onClick={() => {
                              this.handleClick(item.templateId);
                            }}
                        >
                          {`- ${item.diagnosisDisplayName}`}
                        </label>
                      </Tooltip>:null
                      }
                      {(item.displayKey===1||item.displayKey===2)?
                      <Typography noWrap variant="subtitle2" component="div" style={{paddingLeft:item.displayKey===1?0:12,whiteSpace:'pre'}}  className={selectedTemplateIdSet.has(item.templateId)?classes.selectedTemplateWrapper:null}>
                        <Tooltip
                            title={item.remarks}
                            classes={{tooltip:classes.tooltip}}
                        >
                            <label
                                id={`available_template_${item.remarks}`}
                                className={selectedTemplateIdSet.has(item.templateId)?classes.selectedTemplateDisplayTitle:classes.templateDisplayTitle}
                                onClick={() => {
                                  this.handleClick(item.templateId);
                                }}
                            >
                              {`- ${item.remarks}`}
                            </label>

                        </Tooltip>
                      </Typography>
                      :null
                      }
                    </Typography>
                  );
                })}
              </Typography>
            </CardContent>
          </Card>
        );
      }
    }
    return cards;
  };

  render() {
    const { classes, legendText = '' } = this.props;
    // let element = document.getElementById('serviceFavourite');
    // let horizontalScoll = element?element.scrollWidth > element.offsetWidth : false;
    return (
      <Grid container>
        <fieldset className={classes.fieldSetWrapper}>
          <legend className={classes.legend}>{legendText}</legend>
          <div id={'serviceFavourite'} ref={this.card} className={classes.wrapper}>
            <div className={classes.cardContainer}>
              {this.generateCardList()}
            </div>
          </div>
        </fieldset>
      </Grid>
    );
  }
}

export default withStyles(styles)(TemplateFieldset);
