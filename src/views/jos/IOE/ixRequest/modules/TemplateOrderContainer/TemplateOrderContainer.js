import React, { Component } from 'react';
import { styles } from './TemplateOrderContainerStyle';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Typography, FormGroup, FormControlLabel, Tooltip } from '@material-ui/core';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import classNames from 'classnames';
import {isNull,cloneDeep} from 'lodash';
import TemplateClickBoxField from '../../components/TemplateClickBoxField/TemplateClickBoxField';
import * as utils from '../../utils/ixUtils';
import { InfoOutlined } from '@material-ui/icons';

class TemplateOrderContainer extends Component {
  constructor(props){
    super(props);
    this.cbRef = React.createRef();
    this.state = {
      containerHeight:undefined
    };
  }

  componentDidMount() {
    if (this.props.wrapperHeight&&this.cbRef.current) {
      let containerHeight = this.props.wrapperHeight - this.cbRef.current.clientHeight;
      if (containerHeight!==this.state.containerHeight || document.documentElement.clientWidth < 1746) {
        this.setState({containerHeight: document.documentElement.clientWidth < 1746 ? containerHeight - 20:containerHeight});
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if (nextProps.wrapperHeight&&this.cbRef.current&&this.cbRef.current.clientHeight!==0) {
      let containerHeight = nextProps.wrapperHeight - this.cbRef.current.clientHeight;
      if (containerHeight!==this.state.containerHeight || document.documentElement.clientWidth < 1746) {
        this.setState({containerHeight: document.documentElement.clientWidth < 1746 ? containerHeight - 20:containerHeight});
      }
    }
  }

  generateItemDisplayName = valObj => {
    const { dropdownMap } = this.props;
    let displayVal = valObj.itemName||'';
    let val1 = valObj.itemVal,
        val2 = valObj.itemVal2;
    if (valObj.frmItemTypeCd === constants.FORM_ITEM_TYPE.DROP_DOWN_LIST) {
      val1 = utils.generateDropdownValue(dropdownMap,valObj,constants.ITEM_VALUE.TYPE1);
    }
    if (valObj.frmItemTypeCd2 === constants.FORM_ITEM_TYPE.DROP_DOWN_LIST) {
      val2 = utils.generateDropdownValue(dropdownMap,valObj,constants.ITEM_VALUE.TYPE2);
    }
    if (!!val1&&!!val2) {
      displayVal = displayVal!==''?`${displayVal}: ${val1},${val2}`:`${val1},${val2}`;
    } else if (!isNull(val1)&&val1!=='') {
      displayVal = displayVal!==''?`${displayVal}: ${val1}`:`${val1}`;
    } else if (!isNull(val2)&&val2!=='') {
      displayVal = displayVal!==''?`${displayVal}: ${val2}`:`${val2}`;
    }
    return displayVal;
  }

  generateOrderItems = (orderKey,orderObj,disabled) => {
    let { updateState,classes,middlewareMapObj,updateStateWithoutStatus } = this.props;
    let { testItemsMap,specimenItemsMap } = orderObj;
    let itemElements = [],displayVals = [],displayTests = [],testIds=[];
    //handle specimen
    let displaySpecimen = '', specimentId = null, displaySpecimenIsActive;
    if (specimenItemsMap.size>0) {
      for (let valObj of specimenItemsMap.values()) {
        displaySpecimen = this.generateItemDisplayName(valObj);
        displaySpecimenIsActive = valObj.isActive;
        specimentId = valObj.codeIoeFormItemId;
        disabled = displaySpecimenIsActive == 0 ? true : disabled;
      }
    }
    //handle test
    if (testItemsMap.size > 0) {
      for (let valObj of testItemsMap.values()) {
        let displayVal = '';
        let displayTest = this.generateItemDisplayName(valObj);
        if (displaySpecimen!=='') {
          if(valObj.isActive == 1) {
            displayVal = displaySpecimenIsActive == 1 ? `${displaySpecimen}, ${displayTest}`: `${displaySpecimen}, ${displayTest}(specimen is removed)`;
          }else {
            displayVal = displaySpecimenIsActive == 1 ? `${displaySpecimen}, ${displayTest}(test is removed)`:`${displaySpecimen}, ${displayTest}(test and specimen are removed)`;
          }
        } else {
          if(valObj.isActive == 1) {
            displayVal = `${displayTest}`;
          }else {
            displayVal = `${displayTest}(test is removed)` ;
          }
        }
        displayTests.push(displayVal);
        testIds.push(valObj.codeIoeFormItemId);
      }
    }else{
      if(disabled){
        let displayVal = '';
        displayVal = displaySpecimen?`${displaySpecimen}(specimen is removed)`:'';
        displayTests.push(displayVal);
      }
    }

    if (displayTests.length>0) {
      displayVals = cloneDeep(displayTests);
    } else {
      displayVals.push(displaySpecimen);
    }
    if (displayVals.length>0) {
      displayVals.forEach((item,index) => {
        let testId = testIds[index]||null;
        disabled = item.indexOf('removed)') != -1 ? true : false;
        let cbFieldProps = {
          id:`${specimentId}_${testId}`,
          specimentId,
          testId,
          middlewareMapObj,
          orderKey,
          level:constants.IX_REQUEST_TEMPLATE_CB.LEVEL_3,
          updateState,
          updateStateWithoutStatus,
          disabled
        };

        itemElements.push(
          <FormControlLabel
              key={`${Math.random()}_order_item`}
              classes={{
                root: classes.itemFormControlRoot,
                label: classes.itemFormControlLabel
              }}
              control={
                <TemplateClickBoxField {...cbFieldProps}/>
              }
              label={
                <div>
                  <span style={{color:item.indexOf('removed)') != -1 ?'gray':'black'}}>{item}</span>
                </div>
              }
          />
        );
      });
    }
    return itemElements;
  }

  generateInfoTooltip = valMap => {
    const { classes } = this.props;
    let element = '';
    if (valMap.size>0) {
      let items = [];
      for (let [itemId, valObj] of valMap) {
        if (!isNull(valObj.itemVal)&&valObj.itemVal!=='') {
          let displayLabel = `${valObj.itemName}: `;
          let displayValue = `${valObj.itemVal}`;
          items.push(
            <Typography key={`${itemId}_info_item`} component="div" variant="caption">
              <span className={classes.tooltipItemSpanLabel}>{displayLabel}</span>
              <span className={classes.tooltipItemSpan}>{displayValue}</span>
            </Typography>
          );
        }
      }
      if (items.length>0) {
        element = (
          <div>
            {items}
          </div>
        );
      }
    }
    return element;
  }

  generateOrderList = () => {
    const { classes,storageMap,selectedLabId,updateState,middlewareMapObj, updateStateWithoutStatus } = this.props;
    let groups = [];
    if (storageMap.size > 0 ) {
      for (let [orderKey, orderObj] of storageMap) {
        let disabled = this.selectAllOrderItemsDisabledFlag(orderObj);
        let itemElements = this.generateOrderItems(orderKey,orderObj,disabled);
        let title = this.generateInfoTooltip(orderObj.otherItemsMap);
        let cbFieldProps = {
          id:orderKey,
          middlewareMapObj,
          orderKey,
          level:constants.IX_REQUEST_TEMPLATE_CB.LEVEL_2,
          updateState,
          updateStateWithoutStatus,
          disabled
        };
        groups.push(
          <Card key={`${selectedLabId}_${orderKey}`} className={classes.card}>
            <CardContent classes={{root:classes.cardContent}}>
              <FormControlLabel
                  classes={{
                    // root: classes.formControlRoot,
                    label: classes.formControlLabel
                  }}
                  control={
                    <TemplateClickBoxField {...cbFieldProps}/>
                  }
                  label={
                    <Typography component="div" noWrap className={classes.groupNameTitle}>
                      {/* <Tooltip title={`${orderObj.labId}, ${orderObj.formShortName}`} classes={{tooltip:classes.tooltip}}> */}
                        <span style={{color:disabled?'grey':'black'}}>{`${orderObj.labId}, ${orderObj.formShortName}`}</span>
                      {/* </Tooltip> */}
                      {title!==''?(
                        <Tooltip title={title}>
                          <span style={{display:'flex'}}>
                            <InfoOutlined className={classes.infoIcon} />
                          </span>
                        </Tooltip>
                      ):null}
                    </Typography>
                  }
              />
              <Typography component="div">{itemElements}</Typography>
            </CardContent>
          </Card>
        );
      }
    }
    return groups;
  }

  selectAllOrderItemsDisabledFlag = (orderObj) => {
    let testFlag = true;
    let sepcimenFlag = true;
    if(orderObj.testItemsMap.size > 0) {
      for (let valObj of orderObj.testItemsMap.values()){
        if(valObj.isActive == 1){
          testFlag = false;
          break;
        }
      }
    }else{
      testFlag = false;
    }
    if(orderObj.specimenItemsMap.size > 0) {
      for (let valObj of orderObj.specimenItemsMap.values()){
        if(valObj.isActive == 1){
          sepcimenFlag = false;
          break;
        }
      }
    }else{
      sepcimenFlag = false;
    }

    return testFlag || sepcimenFlag;
  }

  render() {
    const { classes,templateId,middlewareMapObj,isHasTemplateOrder=true,updateState,updateStateWithoutStatus } = this.props;
    let { containerHeight } = this.state;
    let cbFieldProps = {
      id:templateId,
      middlewareMapObj,
      level:constants.IX_REQUEST_TEMPLATE_CB.LEVEL_1,
      updateState,
      updateStateWithoutStatus
    };

    return (
      <div>
        <FormGroup row className={classes.formGroupRow}>
          <div ref={this.cbRef} className={classNames(classes.selectAllBar,{[classes.hidden]: !isHasTemplateOrder})}>
            <FormControlLabel
                classes={{
                  root: classes.formControlRoot,
                  label: classes.formControlLabel
                }}
                control={
                  <TemplateClickBoxField {...cbFieldProps}/>
                }
                label={<span>ALL</span>}
            />
          </div>
          <div style={{height:containerHeight?(containerHeight+5):undefined}} className={classNames(classes.wrapper)}>
            <div style={{height:containerHeight?(containerHeight):undefined}} className={classNames(classes.cardContainer)}>
              {this.generateOrderList()}
            </div>
          </div>
        </FormGroup>
      </div>
    );
  }
}

export default withStyles(styles)(TemplateOrderContainer);
