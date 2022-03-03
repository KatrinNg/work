import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { styles } from './SpecimenContainerStyle';
import { Card, CardContent, Typography } from '@material-ui/core';
import ClickBoxField from '../../components/ClickBoxField/ClickBoxField';
import InputBoxField from '../../components/InputBoxField/InputBoxField';
import DropdownField from '../../components/DropdownField/DropdownField';
import * as utils from '../../utils/ixUtils';
import classNames from 'classnames';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';

class SpecimenContainer extends Component {
  constructor(props){
    super(props);
    this.titleRef = React.createRef();
    this.state={
      containerHeight:undefined
    };
  }

  componentDidMount(){
    if (this.props.wrapperHeight&&this.titleRef.current) {
      let containerHeight = this.props.wrapperHeight - this.titleRef.current.clientHeight;
      if (containerHeight!==this.state.containerHeight||document.documentElement.clientWidth < 1746) {
        this.setState({containerHeight: document.documentElement.clientWidth < 1746 ? containerHeight - 20:containerHeight});
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps){
    if (nextProps.wrapperHeight&&this.titleRef.current&&this.titleRef.current.clientHeight!==0) {
      let containerHeight = nextProps.wrapperHeight - this.titleRef.current.clientHeight;
      if (containerHeight!==this.state.containerHeight||document.documentElement.clientWidth < 1746) {
        this.setState({containerHeight: document.documentElement.clientWidth < 1746 ? containerHeight - 20:containerHeight});
      }
    }
  }

  handleSpecimen = (id,valMap) => {
    utils.handleSepcimenItem(id,valMap);
  }

  handleSpecimenToNsl = (id,valMap) => {
    utils.handleSepcimenNSLItem(id,valMap);
  }

  generateItemByType = (item,type=constants.ITEM_VALUE.TYPE1) => {
    const { dropdownMap,middlewareObject,updateState,updateStateWithoutStatus } = this.props;
    let itemType = null;
    if (type === constants.ITEM_VALUE.TYPE1) {
      itemType = item.frmItemTypeCd;
    } else if (type === constants.ITEM_VALUE.TYPE2) {
      itemType = item.frmItemTypeCd2;
    }

    let fieldProps = {
      id:item.codeIoeFormItemId,
      middlewareObject,
      itemValType:type,
      categoryType:constants.ITEM_CATEGORY_TYPE.SPECIMEN,
      updateState,
      updateStateWithoutStatus
    };

    let element = null;
    switch (itemType) {
      case constants.FORM_ITEM_TYPE.CLICK_BOX:{
        if (type !== constants.ITEM_VALUE.TYPE1) {
          element = (<ClickBoxField {...fieldProps} />);
        }
        break;
      }
      case constants.FORM_ITEM_TYPE.INPUT_BOX:{
        fieldProps.maxLength = item.fieldLength;
        fieldProps.sideEffect = utils.handleInputBoxOperationType;
        fieldProps.nullAble = item.nullAble;
        element = (<InputBoxField {...fieldProps} />);
        break;
      }
      case constants.FORM_ITEM_TYPE.DROP_DOWN_LIST:{
        fieldProps.dropdownMap = dropdownMap;
        fieldProps.sideEffect = utils.handleDropdownOperationType;
        element = (<DropdownField {...fieldProps} />);
        break;
      }
      default:
        break;
    }
    return element;
  }

  generateItem = item => {
    let type1Element = this.generateItemByType(item,constants.ITEM_VALUE.TYPE1);
    let type2Element = this.generateItemByType(item,constants.ITEM_VALUE.TYPE2);

    return (
      <div>
        <div>
          <span>{item.frmItemName}</span>
        </div>
        <div>{type1Element}</div>
        <div>{type2Element}</div>
      </div>
    );
  }

  generateGroupItems = items => {
    let { updateState,updateStateWithoutStatus,classes,selectedLabId,selectedFormId,middlewareObject } = this.props;
    let itemElements = [];
    if (items.length>0) {
      items.forEach(item => {
        let cbFieldProps = {
          id:item.codeIoeFormItemId,
          middlewareObject,
          selectedFormId,
          categoryType:constants.ITEM_CATEGORY_TYPE.SPECIMEN,
          sideEffect:selectedFormId===100004?this.handleSpecimenToNsl:this.handleSpecimen,
          updateState,
          updateStateWithoutStatus
        };
        let itemElement = this.generateItem(item);

        itemElements.push(
          <div key={`${selectedLabId}_${selectedFormId}_${item.codeIoeFormItemId}`} id={`${selectedLabId}_${selectedFormId}_${item.codeIoeFormItemId}`} className={classes.itemWrapperDiv}>
            <div className={classes.checkBoxDiv}>
              <ClickBoxField {...cbFieldProps} />
            </div>
            <div className={classes.formItemDiv}>
              {itemElement}
            </div>
          </div>
        );
      });
    }
    return itemElements;
  }

  generateGroupList = () => {
    const { classes,specimenFrameworkMap,selectedLabId,selectedFormId } = this.props;
    let groups = [];
    if (specimenFrameworkMap.size > 0 ) {
      for (let [groupName, items] of specimenFrameworkMap) {
        let itemElements = this.generateGroupItems(items);
        groups.push(
          <Card key={`${selectedLabId}_${selectedFormId}_${groupName}`} className={classes.card}>
            <CardContent classes={{root:classes.cardContent}}>
              <Typography
                  component="div"
                  variant="subtitle1"
                  classes={{
                    subtitle1: classes.groupNameTitle
                  }}
              >
                <label>{groupName}</label>
              </Typography>
              <Typography component="div">{itemElements}</Typography>
            </CardContent>
          </Card>
        );
      }
    }
    return groups;
  }

  render() {
    const { classes,displayHeader=false } = this.props;
    let { containerHeight } = this.state;
    return (
      <div>
        <Typography
            ref={this.titleRef}
            classes={{
              h6:classNames(classes.title,{
                [classes.hiddenTitle]: displayHeader === true
              })
            }}
            component="div"
            variant="h6"
            noWrap
        >
          Specimen
        </Typography>
        <div style={{height:containerHeight?(containerHeight+5):undefined}} className={classNames(classes.wrapper,{[classes.wrapperHidden]:displayHeader === true})}>
          <div style={{height:containerHeight?(containerHeight-10):undefined}} className={classNames(classes.cardContainer,{[classes.cardContainerHidden]:displayHeader === true})}>
            {this.generateGroupList()}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(SpecimenContainer);
