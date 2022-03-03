import React, { Component } from 'react';
import { styles } from './ExpressIoeContainerStyle';
import { withStyles } from '@material-ui/core/styles';
import { Card, CardContent, Typography, Button,TextField} from '@material-ui/core';
import * as constants from '../../../../../../constants/IOE/ixRequest/ixRequestConstants';
import ClickExpreeIoeBoxField from '../../components/ClickExpreeIoeBoxField/ClickExpreeIoeBoxField';
import ExpressIoeSIteContainer from '../../components/ExpressIoeSIteContainer/ExpressIoeSIteContainer';
import InputBoxContainer from '../../components/InputBoxContainer/InputBoxContainer';
import DropdownContainer from '../../components/DropdownContainer/DropdownContainer';
import * as utils from '../../utils/ixUtils';
import classNames from 'classnames';
import { isNull, isUndefined } from 'lodash';

class ExpressIoeContainer extends Component {
  constructor(props) {
    super(props);
    this.titleRef = React.createRef();
    this.state = {
      containerHeight: undefined
    };
  }

  componentDidMount() {
    if (this.props.wrapperHeight) {
      let titleHeight = this.titleRef.current ? this.titleRef.current.clientHeight : 25;
      let containerHeight = this.props.wrapperHeight - titleHeight;
      if (containerHeight !== this.state.containerHeight) {
        this.setState({ containerHeight });
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.wrapperHeight) {
      let { displayHeader = false } = nextProps;
      let titleHeight = this.titleRef.current ? this.titleRef.current.clientHeight : 25;
      if (displayHeader || (!displayHeader && this.titleRef.current.clientHeight !== 0)) {
        if (nextProps.parentRef.clientHeight !== 0) {
          let containerHeight = nextProps.wrapperHeight - titleHeight;
          if (containerHeight !== this.state.containerHeight || document.documentElement.clientWidth < 1746) {
            this.setState({ containerHeight: document.documentElement.clientWidth < 1746 ? containerHeight - 20 : containerHeight });
          }
        }
      } else if (this.state.containerHeight === undefined || document.documentElement.clientWidth < 1746) {
        this.setState({ containerHeight: document.documentElement.clientWidth < 1746 ? nextProps.wrapperHeight - 20 : nextProps.wrapperHeight });
      }
    }
  }

  handleTest = (id, valMap, masterTestMap) => {
    const { selectedLabId } = this.props;
    utils.handleTestItem(id, valMap, masterTestMap, selectedLabId);
  }

  generateItemByType = (item, groups,groupName) => {
    const { openCommonMessage, expressIoeMap, updateState, updateStateWithoutStatus,dropdownMap } = this.props;
    let itemType = null;
    itemType=item.frmItemTypeCd;
    let fieldProps = {
      openCommonMessage,
      id: item.codeIoeRequestScatgryId,
      inputLabel:groups.detlLbl,
      expressIoeMap,
      labelButtonDiabled:groups.isChecked,
      item,
      groupID:groupName,
      updateStateWithoutStatus,
      updateState
    };
    let element = null;
    switch (itemType) {
      case constants.FORM_ITEM_TYPE.INPUT_BOX: {
        element = (<InputBoxContainer {...fieldProps} />);
        break;
      }
      case constants.FORM_ITEM_TYPE.DROP_DOWN_LIST:{
        // fieldProps.dropdownMap = dropdownMap;
        // fieldProps.sideEffect = utils.handleDropdownOperationType;
        element = (<DropdownContainer {...fieldProps} />);
        break;
      }
      default:
        break;
    }
    return element;
  }

  generateItem = item => {
    let { classes } = this.props;
    // let type1Element = this.generateItemByType(item,constants.ITEM_VALUE.TYPE1);
    let type2Element = this.generateItemByType(item, constants.ITEM_VALUE.TYPE2);

    return (
      <div>
        <div>
          <span>{item.codeIoeRequestScatgryName}</span>
        </div>
        {/* <div>{type1Element}</div> */}
        <div>

          {type2Element}
        </div>
      </div>
    );
  }


  generateGroupItems = (items,groupName) => {
    let {updateExpressIoeContainerState,checkedExpressIoeMap, basicInfo,updateState, updateStateWithoutStatus, classes, updateGroupingContainerState, selectedFormId, expressIoeMap, ioeFormMap, openCommonMessage } = this.props;
    let itemElements = [];
    if (items.size > 0) {
      items.forEach(item => {
        let cbFieldProps = {
          id: item.codeIoeRequestScatgryId,
          updateGroupingContainerState,
          expressIoeMap,
          selectedFormId,
          categoryType: constants.ITEM_CATEGORY_TYPE.TEST,
          sideEffect: this.handleTest,
          ioeFormMap,
          openCommonMessage,
          updateState,
          updateStateWithoutStatus,
          groupName,
          checkedExpressIoeMap,
          basicInfo,
          updateExpressIoeContainerState
        };
        let itemElement = this.generateItem(item);
        let isFieldCount=0;
        let isFieldObj={};
        let isFieldArray=[];
        if(item.isDisplayOnly === 0){
          item.codeIoeRequestScatgryFrmMap.forEach(valArray => {
            for (let index = 0; index < valArray.length; index++) {
              let valObj = valArray[index];
              if(!isUndefined(valObj.isInputField)&&valObj.isInputField!=null&&valObj.isInputField!=0){
                isFieldArray.push(valObj);
                isFieldCount++;
              }
            }
            if(isFieldCount===1){
              item.codeIoeRequestScatgryFrmMap.forEach(valArray => {
                for (let index = 0; index < valArray.length; index++) {
                  let valObj = valArray[index];
                  if(!isUndefined(valObj.isInputField)&&valObj.isInputField!=null&&valObj.isInputField!=0){
                    isFieldObj=valObj;
                    break;
                  }
                }
                });
            }
            let fieldProps = {
              groupID:groupName,
              id: item.codeIoeRequestScatgryId,
              inputLabel:item.detlLbl,
              expressIoeMap,
              labelButtonDiabled:item.isChecked,
              updateState,
              updateStateWithoutStatus,
              isFieldArray,
              codeIoeRequestScatgryName:item.codeIoeRequestScatgryName,
              openCommonMessage
            };
            itemElements.push(
              <div key={`expressIoe_grounp_${groupName}_${item.codeIoeRequestScatgryId}`} id={`${groupName}_${item.codeIoeRequestScatgryId}`}>
                <div  className={classes.itemWrapperDiv}>
                  <div className={
                    classNames(classes.checkBoxDiv, {
                      [classes.checkBoxDivWithSign]: item.ioeType !== constants.TEST_ITEM_IOE_TYPE.ITE
                    })
                  }
                  >
                    <div className={classes.checkBoxWrapper}>
                       <ClickExpreeIoeBoxField {...cbFieldProps} />
                    </div>
                  </div>
                  <div className={classes.formItemDiv}>
                    {itemElement}
                  </div>
                </div>
                {
                isFieldCount!=0?(isFieldCount>=2?<ExpressIoeSIteContainer {...fieldProps}/>:this.generateItemByType(isFieldObj,item,groupName)) :null
                }
              </div>
            );
          });
        }else{
          itemElements.push(
            <div key={`expressIoe_grounp_${groupName}_${item.codeIoeRequestScatgryId}`} id={`${groupName}_${item.codeIoeRequestScatgryId}`}>
              <div  className={classes.itemWrapperDiv}>
                <div>
                  <div className={classes.checkBoxWrapper}>
                    <span style={{color:'#0579C8'}}>{item.codeIoeRequestScatgryName}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        }
      });
    }
    return itemElements;
  }

  stylePropChange = (str) => {
    let parseCSSObj = '';
    parseCSSObj = '{' + str + '}';
    parseCSSObj = parseCSSObj.replace(/'/g, '"');
    let obj = JSON.parse(parseCSSObj);
    let newObj = {};
    for (let key in obj) {
      console.log(key + obj[key]);
      if (key.indexOf('-') > 0) {
        let iconIndex = key.indexOf('-');
        let propName = key.substring(0, iconIndex) + key[iconIndex + 1].toUpperCase() + key.substring(iconIndex + 2);
        newObj[propName] = obj[key];
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }

  generateGroupList = () => {
    const { expressIoeMap } = this.props;
    let groups = [];
    if (expressIoeMap.size > 0 ) {
      for (let index = 0; index < 3; index++) {
        groups.push(
          <div style={{width:(100/3) + '%'}}>
            {this.generateGroup(index)}
          </div>
         );
      };
    }
    return groups;
  }

  generateGroup = (index) => {
    const { classes, expressIoeMap } = this.props;
    let groups = [];
    let i = 0;
    for (let [groupName, items] of expressIoeMap) {
      if(i%3===index){
        let style = this.stylePropChange(items.categoryStyle);
        let itemElements = this.generateGroupItems(items.formMap,groupName);
        groups.push(
         <Card key={`expressIoe_grounp_${groupName}`} className={classes.card}>
           <CardContent classes={{ root: classes.cardContent }}>
             <Typography
                 component="div"
                 variant="subtitle1"
                 style={{width: 'max-content',...style}}
                 classes={{ subtitle1: classes.groupNameTitle }}
             >
               <label>{items.categoryName}</label>

             </Typography>
             <Typography component="div">{itemElements}</Typography>
           </CardContent>
         </Card>
        );
      }
      i++;
    };
    return groups;
  }

  render() {
    const { classes, displayHeader = false, ioeContainerHeight } = this.props;
    let { containerHeight } = this.state;
    return (
      <div>
        <Typography
            ref={this.titleRef}
            classes={{
            h6: classNames(classes.title, {
              [classes.hiddenTitle]: displayHeader === true
            })
          }}
            component="div"
            variant="h6"
            noWrap
        >
          Express Ioe
        </Typography>
        <div style={{ height: ioeContainerHeight ? ioeContainerHeight : undefined }} className={classNames(classes.wrapper, { [classes.wrapperHidden]: displayHeader === true })}>
          <div className={classNames(classes.cardContainer)}>
            {this.generateGroupList()}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ExpressIoeContainer);
