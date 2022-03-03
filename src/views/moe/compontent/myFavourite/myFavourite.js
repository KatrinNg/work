import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import {
    Typography,
    Grid,
    List,
    ListItem,
    IconButton,
    Collapse,
    Paper,
    MenuList,
    MenuItem
} from '@material-ui/core';
import deleteIcon from '../../../../images/moe/cancel.png';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import minus from '../../../../images/moe/elbow-end-minus-lg2.gif';
import plus from '../../../../images/moe/elbow-end-plus-lg2.gif';
import * as prescriptionUtilities from '../../../../utilities/prescriptionUtilities';
import _ from 'lodash';
import {
    updateField,
    deleteMyFavourite,
    filterMyFavourite,
    reorderMyFavourite,
    addToMyFavourite
} from '../../../../store/actions/moe/myFavourite/myFavouriteAction';
// import CIMSAlertDialog from '../../../../components/Dialog/CIMSAlertDialog';
import * as moeUtilities from '../../../../utilities/moe/moeUtilities';
import MyFavouriteSearch from './myFavouriteSearch';
import MultipleRemarkDialog from './../editRemark/multipleRemarkDialog';
import imgDangerDrug from '../../../../images/moe/dangerous_drug.png';
import { openErrorMessage } from '../../../../store/actions/common/commonAction';
import DrugDetail from './drugDetail/drugDetail';
import style from '../../moeStyles';
// import { ContextMenu, ContextMenuTrigger } from 'react-contextmenu';
import { resizeHeight } from '../../../../utilities/moe/moeUtilities';
import { RESIZEHEIGHT_PANEL } from '../../../../enums/moe/moeEnums';
import PropTypes from 'prop-types';
import CIMSTextField from '../../../../components/TextField/CIMSTextField';
import {
    openCommonMessage
} from '../../../../store/actions/message/messageAction';
import {
    MOE_MSG_CODE
} from '../../../../constants/message/moe/commonRespMsgCodeMapping';

const CustomList = withStyles({
    root: {
        padding: 0,
        margin: 0
    }
})(List);

const CustomListItem = withStyles({
    root: {
        minHeight: 30,
        padding: 0,
        margin: 0,
        width: '100%'
    }
})(ListItem);

class MyFavourite extends React.Component {
    static propTypes = {
        tabValue: PropTypes.bool
    }
    constructor(props) {
        super(props);
        this.state = {
            // showDeleteIconParentIndex: -1,
            // showDeleteIconChildIndex: -1,

            // //remark dialog
            // showRemarkDialog: false,
            // remarkData: null,

            //dragMyFav
            dragObj: null,
            dragFavMode: false,
            leaveItselfFirst: true,
            isDragParent: false,
            searchedFavFlag: false,

            /** context menu */
            anchorEl: null,
            contextMenuDrugSet: null,
            contextMenuSelectedItem: null,
            /** context menu */
            myfavHeight: 0,

            /** edit fav name */
            editFavNameIndex: null,
            orginalFav: null,
            newFavName: null
            /** edit fav name */
        };
    }


    componentDidMount() {
        document.addEventListener('click', this.handleContextMenuClick);
        document.addEventListener('wheel', this.handleContextMenuClick);
        this.setState({
            myfavHeight: resizeHeight(
                RESIZEHEIGHT_PANEL.OUTMOST_MOE_MYFAVER_CONTAINER.ID,
                RESIZEHEIGHT_PANEL.OUTMOST_MOE_MYFAVER_CONTAINER.MINUEND()
            )
        });
        // console.log('mafavier_componentDidMount()', this.state.myfavHeight);
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.tabValue !== this.props.tabValue && nextProps.tabValue) {
            this.setState({
                myfavHeight: resizeHeight(
                    RESIZEHEIGHT_PANEL.OUTMOST_MOE_MYFAVER_CONTAINER.ID,
                    RESIZEHEIGHT_PANEL.OUTMOST_MOE_MYFAVER_CONTAINER.MINUEND()
                )
            });
        }
        return true;
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleContextMenuClick);
        document.removeEventListener('wheel', this.handleContextMenuClick);
    }

    handleCollapse = (item, index) => {
        let list = _.cloneDeep(this.props.myFavouriteList);
        list.map((_item, i) => {
            if (i === index)
                _item.open = !_item.open;
            return _item;
        });
        let updateData = {
            myFavouriteList: list
        };
        this.props.updateField(updateData);
    }

    handleAddDrugToPriscription = (item, isParent) => {
        let newData;
        if (isParent) {
            newData = item.moeMedProfiles;
        } else {
            newData = item;
        }
        let newItems = prescriptionUtilities.getNewOrderDrugListOrObject(newData, this.props.drugList);
        //show remark dialog
        const setting = moeUtilities.getMoeSetting();
        if ((setting.isEdit || setting.isBackdate) && newItems) {
            this.handleRemark(newItems);
            return;
        }

        this.props.confirmDrug(newItems, true);
    }

    handleDeleteDialog = (parentItem, childItem) => {
        // let updateData = {};
        // if (isOpen) {
        // updateData.showDeleteDialog = isOpen;
        // updateData.deleteParentItem = parentItem;
        // updateData.deleteChildItem = childItem;
        let msgCode = MOE_MSG_CODE.MY_FAV_DELETE_DRUG_SET;
        if (childItem) {
            const remainingData = parentItem.moeMedProfiles
                && parentItem.moeMedProfiles.filter(item => item.orgItemNo !== childItem.orgItemNo);
            if (parentItem.myFavouriteName && (!remainingData || remainingData.length === 0)) {
                msgCode = MOE_MSG_CODE.MY_FAV_DELETE_DRUG_SET_WITHOUT_ITEM;
            }
        }
        this.props.openCommonMessage({
            msgCode: msgCode,
            btnActions: {
                btn1Click: () => {
                    let params = {
                        'myFavouriteId': parentItem.myFavouriteId,
                        'frontMyFavouriteId': parentItem.frontMyFavouriteId,
                        'version': parentItem.version
                    };
                    let isParent = false;
                    if (childItem && parentItem.myFavouriteName) {
                        if (msgCode === MOE_MSG_CODE.MY_FAV_DELETE_DRUG_SET_WITHOUT_ITEM) {
                            isParent = true;
                        } else {
                            params.moeMedProfiles = [];
                            params.moeMedProfiles.push({ 'orgItemNo': childItem.orgItemNo });
                        }
                    } else {
                        isParent = true;
                    }
                    this.props.deleteMyFavourite(params, isParent, this.props.favKeyword);
                }
            }
        });
        // } else {
        //     updateData.showDeleteDialog = isOpen;
        //     updateData.deleteParentItem = null;
        //     updateData.deleteChildItem = null;
        // }
        // this.props.updateField(updateData);
    }

    // handleDeleteMyFavourite = () => {
    //     const deleteParentItem = this.props.deleteParentItem;
    //     const deleteChildItem = this.props.deleteChildItem;
    //     let params = {
    //         'myFavouriteId': deleteParentItem.myFavouriteId,
    //         'frontMyFavouriteId': deleteParentItem.frontMyFavouriteId,
    //         'version': deleteParentItem.version
    //     };
    //     let isParent = false;
    //     if (deleteChildItem && deleteParentItem.myFavouriteName) {
    //         isParent = false;
    //         params.moeMedProfiles = [];
    //         params.moeMedProfiles.push({ 'orgItemNo': deleteChildItem.orgItemNo });
    //     } else {
    //         isParent = true;
    //     }
    //     this.props.deleteMyFavourite(params, isParent, this.props.favKeyword);
    // }

    handleMouseOver = (e) => {
        e.stopPropagation();
        if (!this.state.dragFavMode) {
            let tempDom = e.target;

            while (tempDom.tagName.toUpperCase() !== 'LI') {
                tempDom = tempDom.parentNode;
            }
            tempDom.querySelector('[data-buttonid="delBtn"]').style.display = 'block';
        }
    }

    // handleMouseOver = (parentIndex, childIndex) => {
    //     this.setState({
    //         showDeleteIconParentIndex: parentIndex,
    //         showDeleteIconChildIndex: childIndex
    //     });
    // }

    handleMouseOut = (e) => {
        let tempDom = e.target;

        while (tempDom.tagName.toUpperCase() !== 'LI') {
            tempDom = tempDom.parentNode;
        }

        tempDom.querySelector('[data-buttonid="delBtn"]').style.display = 'none';
    }

    // handleMouseOut = () => {
    //     this.setState({
    //         showDeleteIconParentIndex: -1,
    //         showDeleteIconChildIndex: -1
    //     });
    // }

    searchMyFav = (keyword) => {
        if (keyword) {
            this.setState({
                searchedFavFlag: true
            });
        }
        else {
            this.setState({
                searchedFavFlag: false
            });
        }

        let params = {
            'department': false,
            'searchString': keyword,
            'userId': this.props.loginInfo.user.loginId
        };
        this.props.filterMyFavourite(params);
    }

    //Drag & Drop function start
    // getParentsByAttr = (children,attrId,attrVal) => {
    //     let tempDom = children;
    //     if(!(tempDom.getAttribute(attrId) && tempDom.getAttribute(attrId)===attrVal)){
    //         let parentEle = tempDom.parentNode;
    //         while(!(parentEle.getAttribute(attrId) && parentEle.getAttribute(attrId)===attrVal)){
    //             parentEle = parentEle.parentNode;
    //         }

    //         tempDom = parentEle;
    //     }
    //     return tempDom;
    // }

    // getAllParentsScrollTop = (children) => {
    //     let tempDom = children.parentNode;
    //     let tempScrollTop = 0;
    //     while(tempDom !== document.body){
    //         tempDom = tempDom.parentNode;
    //         tempScrollTop = tempScrollTop + tempDom.scrollTop;
    //     }
    //     return tempScrollTop;
    // }

    // insertAfter = (newElement, targentElement) => {
    //     let parent = targentElement.parentNode;
    //     if (parent.lastChild == targentElement) {
    //         parent.appendChild(newElement);
    //     } else {
    //         parent.insertBefore(newElement, targentElement.nextSibling);
    //     }
    // }

    // offset = (e) => {
    //     let offest = {
    //         top: 0,
    //         left: 0
    //     };

    //     let _position;

    //     function getOffset(node, init) {
    //         if (node.nodeType !== 1) {
    //             return;
    //         }
    //         _position = window.getComputedStyle(node)['position'];

    //         if (typeof(init) === 'undefined' && _position === 'static') {
    //             getOffset(node.parentNode);
    //             return;
    //         }
    //         offest.top = node.offsetTop + offest.top - node.scrollTop;
    //         offest.left = node.offsetLeft + offest.left - node.scrollLeft;

    //         if (_position === 'fixed') {
    //             return;
    //         }

    //         getOffset(node.parentNode);
    //     }

    //     getOffset(e, true);

    //     return offest;
    // }

    // isSiblilngNode = (node1,node2) => {
    //     if(node1.parentNode == node2.parentNode){
    //         return true;
    //     }else{
    //         return false;
    //     }
    // }

    addlistHoverClass = (ele) => {
        let isNavTag = moeUtilities.getParentsByAttr(ele, 'data-idfordrag', 'myFavDropPanel').parentNode;
        if (isNavTag) {
            isNavTag = this.getNavTag(isNavTag);
            const liArr = isNavTag.querySelectorAll('li');
            for (let i = 0; i < liArr.length; i++) {
                liArr[i].classList.add('listItem');
            }
        }
    }

    getNavTag = (nodeObj) => {
        while (nodeObj.tagName.toUpperCase() !== 'NAV') {
            nodeObj = nodeObj.parentNode;
        }
        return nodeObj;
    }

    handleDragStart = (e, item, isDrugSet, isSingleDrug, subItem) => {
        e.stopPropagation();

        let beDraggedEle = moeUtilities.getParentsByAttr(e.target, 'data-idfordrag', 'myFavDropPanel');
        e.dataTransfer.setData('flag', 'MOEMYFAV');

        if (isDrugSet || isSingleDrug) {
            let isNavTag = null;
            isNavTag = beDraggedEle = beDraggedEle.parentNode;
            if (!this.state.searchedFavFlag) {
                if (isNavTag) {
                    isNavTag = this.getNavTag(isNavTag);
                    const allDIv = isNavTag.querySelectorAll('div[data-idfordrag="outermostMyFavPanel"]');
                    for (let i = 0; i < allDIv.length; i++) {
                        allDIv[i].style.cssText = 'background-color:rgb(212,212,212);';
                    }
                }
                if (isSingleDrug) {
                    beDraggedEle = moeUtilities.getParentsByAttr(beDraggedEle, 'data-idfordrag', 'outermostMyFavPanel');
                }
            }
            // else{
            //     this.setState({
            //         isDragParent: true
            //     });
            //     return; // if searched my favourite, user can't reorder my favourite drugSet
            // }
            e.dataTransfer.setData('isDrugSet', 'true');
        }
        else {
            beDraggedEle.parentNode.style.cssText = 'background-color:rgb(212,212,212)'; // set the draggable region style
            e.dataTransfer.setData('isDrugSet', 'false');
            e.dataTransfer.setData('subItem', JSON.stringify(subItem));
        }
        e.dataTransfer.setData('item', JSON.stringify(item));

        beDraggedEle.style.cssText = 'background-color:rgb(7,125,198);color:rgb(255,255,255);'; // set the dragged element style

        this.setState({
            isDragParent: (isDrugSet || isSingleDrug),
            dragObj: beDraggedEle,
            dragFavMode: true // hidden delete my favourite button
        });
    }

    handleOnDrag = (e) => {
        if (!this.state.searchedFavFlag && this.state.isDragParent && this.state.leaveItselfFirst) {
            let beDraggedEle = moeUtilities.getParentsByAttr(e.target, 'data-idfordrag', 'myFavDropPanel');
            let navTag = this.getNavTag(beDraggedEle);
            let allParents = navTag.querySelectorAll('li[data-isparent="true"]');
            let allExtendIcon = navTag.querySelectorAll('img[data-extendicon]');
            for (let i = 0; i < allParents.length; i++) {
                let node = allParents[i].nextSibling;
                if (node) {
                    node.style.display = 'none';
                }
            }

            for (let i = 0; i < allExtendIcon.length; i++) {
                allExtendIcon[i].src = plus;
            }
            // let list = _.cloneDeep(this.props.myFavouriteList);
            // list.map((item) => {
            //     item.open = false; // close all drugset
            //     return item;
            // });
            // let updateData = {
            //     myFavouriteList: list
            // };
            // this.props.updateField(updateData);

            // this.setState({
            //     leaveItselfFirst : false
            // });
        }
    }

    handleDragEnd = (e, isDrugSet, isSingleDrug, fontColor) => {
        e.stopPropagation();
        let beDraggedEle = moeUtilities.getParentsByAttr(e.target, 'data-idfordrag', 'myFavDropPanel');
        if (isDrugSet || isSingleDrug) {
            let isNavTag = null;
            isNavTag = beDraggedEle = beDraggedEle.parentNode;
            if (isNavTag) {
                isNavTag = this.getNavTag(isNavTag);
                //isNavTag.style.cssText = 'background-color:none;padding:0px;margin:0px;overflow-y:auto;height:'+isNavTag.offsetHeight+'px;max-height:calc(455px);'; // reset the draggable region style
                const allDIv = isNavTag.querySelectorAll('div[data-idfordrag="outermostMyFavPanel"]');
                for (let i = 0; i < allDIv.length; i++) {
                    allDIv[i].style.cssText = 'background-color:none;';
                }
            }
            if (isSingleDrug) {
                beDraggedEle = moeUtilities.getParentsByAttr(beDraggedEle, 'data-idfordrag', 'outermostMyFavPanel');
            }
        }
        else {
            beDraggedEle.parentNode.style.cssText = 'background-color:none';  // reset the draggable region style
        }
        if (!fontColor) fontColor = 'rgb(64,64,64)';
        beDraggedEle.style.cssText = `background-color:none;color:${fontColor};`;// reset the dragged element style

        this.addlistHoverClass(e.target); // reset listItem:hover

        if (this.state.dragFavMode) {
            this.searchMyFav(this.props.favKeyword); // if hasn't drop in dropable area, reset the list
        }

        this.setState({
            dragObj: null,
            dragFavMode: false,
            leaveItselfFirst: true
        });
    }

    handleDragEnter = (e) => {
        e.preventDefault();
    }

    handleDragOver = (e, isDrugSet, isSingleDrug) => {
        let hoverEle = moeUtilities.getParentsByAttr(e.target, 'data-idfordrag', 'myFavDropPanel');

        if (
            !(this.state.searchedFavFlag && this.state.isDragParent) &&
            (moeUtilities.isSiblilngNode(isDrugSet ? hoverEle.parentNode : isSingleDrug ? moeUtilities.getParentsByAttr(hoverEle, 'data-idfordrag', 'outermostMyFavPanel') : hoverEle, this.state.dragObj))
        ) {
            e.preventDefault();
            hoverEle.classList.remove('listItem');

            if (isSingleDrug) {
                hoverEle = moeUtilities.getParentsByAttr(hoverEle, 'data-idfordrag', 'outermostMyFavPanel');
            }
            if (hoverEle !== this.state.dragObj) {
                if (e.clientY + moeUtilities.getAllParentsScrollTop(this.getNavTag(hoverEle)) - moeUtilities.offset(hoverEle).top < hoverEle.clientHeight / 2) { // Get the mouse position in the object
                    if (hoverEle.previousElementSibling !== this.state.dragObj) {
                        if (isDrugSet) {
                            hoverEle = hoverEle.parentNode;
                        }
                        hoverEle.parentNode.insertBefore(this.state.dragObj, hoverEle);
                    }
                }
                else { // Mouse position greater than or equal to the hover object (height / 2)
                    if (hoverEle.nextElementSibling !== this.state.dragObj) {
                        if (isDrugSet) {
                            hoverEle = hoverEle.parentNode;
                        }
                        moeUtilities.insertAfter(this.state.dragObj, hoverEle);
                    }
                }
            }
        }
    }

    // handleDragLeave = (e,isDrugSet,isSingleDrug) => {
    //     let hoverEle = moeUtilities.getParentsByAttr(e.target,'data-idfordrag','myFavDropPanel');
    //     // hoverEle.classList.add('listItem');

    //     if(
    //         !(this.state.searchedFavFlag && this.state.isDragParent) &&
    //         (isDrugSet || isSingleDrug) && this.state.leaveItselfFirst &&
    //         hoverEle === this.state.dragObj.querySelector('[data-idfordrag="myFavDropPanel"]')
    //     )
    //     {
    //         let list = _.cloneDeep(this.props.myFavouriteList);
    //         list.map((item) => {
    //             item.open = false; // close all drugset
    //             return item;
    //         });
    //         let updateData = {
    //             myFavouriteList: list
    //         };
    //         this.props.updateField(updateData);

    //         this.setState({
    //             leaveItselfFirst : false
    //         });
    //     }
    // }

    handleDrop = (e) => {
        e.stopPropagation();
        e.preventDefault();

        let dropEle = moeUtilities.getParentsByAttr(e.target, 'data-idfordrag', 'myFavDropPanel');
        let isNavTag = dropEle.parentNode;
        let searchParams = {
            'searchString': this.props.favKeyword,
            'userId': this.props.loginInfo.user.loginId
        };

        if (this.state.isDragParent) {
            let orderedMyFavDrugSetEle = this.getNavTag(isNavTag).querySelectorAll('[data-idfordrag="myFavDropPanel"][data-isparent=true]');

            let myFavOrderData = {
                department: false,
                favouriteHdrs: []
            };

            let preMyFavId = '';
            for (let i = 0; i < orderedMyFavDrugSetEle.length; i++) {
                const dataArray = orderedMyFavDrugSetEle[i].getAttribute('data-favitem').split('|');
                const favHdrs = {
                    myFavouriteId: dataArray[0],
                    frontMyFavouriteId: i === 0 ? 0 : preMyFavId,
                    version: dataArray[1],
                    createUserId: dataArray[2]
                };
                preMyFavId = dataArray[0];
                myFavOrderData.favouriteHdrs.push(favHdrs);
            }

            this.props.reorderMyFavourite(myFavOrderData, searchParams, false);
        }
        else {
            let orderedMyFavChildEle = this.getNavTag(isNavTag).querySelectorAll('[data-idfordrag="myFavDropPanel"][data-isparent=false]');
            try {
                const myFavJson = JSON.parse(e.dataTransfer.getData('item'));
                const myFavouriteId = myFavJson.myFavouriteId;
                const createUserId = myFavJson.createUserId;
                const version = myFavJson.version;
                const existsMoeMedProfiles = myFavJson.moeMedProfiles;

                let myFavOrderData = {
                    department: false,
                    favouriteHdrs: []
                };

                let newOrderObj = [];
                let newNo = 1;
                for (let i = 0; i < orderedMyFavChildEle.length; i++) {
                    const dataArray = orderedMyFavChildEle[i].getAttribute('data-favitem').split('|');
                    if (dataArray[0] === myFavouriteId) {
                        newOrderObj.push({
                            orgItemNo: dataArray[3],
                            newNo
                        });
                        newNo++;
                    }
                }

                let newOrderSubItem = [];
                for (let z = 0; z < existsMoeMedProfiles.length; z++) {
                    let j = 0;
                    while (newOrderObj[j].orgItemNo.toString() !== existsMoeMedProfiles[z].orgItemNo.toString()) {
                        j++;
                    }
                    newOrderSubItem.push({ orgItemNo: newOrderObj[j].newNo });
                }

                myFavOrderData.favouriteHdrs.push({
                    myFavouriteId,
                    version,
                    createUserId,
                    moeMedProfiles: newOrderSubItem
                });

                this.props.reorderMyFavourite(myFavOrderData, searchParams, true);
            } catch (error) {
                console.log(error);
                this.props.openErrorMessage('Error', null, 'Service error.');
            }
        }
        this.setState({
            dragFavMode: false
        });
    }
    //Drag & Drop function end

    /* context menu */
    handleContextMenuClick = () => {
        if (this.state.contextMenuSelectedItem) {
            this.handleClose();
        }
    }
    handleClose = (resetItem) => {
        let { contextMenuSelectedItem, contextMenuDrugSet } = this.state;
        if (resetItem) {
            contextMenuSelectedItem = null;
            contextMenuDrugSet = null;
        }

        // let ele = document.querySelectorAll('[data-idfordrag="myFavDropPanel"]');
        // if (ele) {
        //     for (let i = 0; i < ele.length; i++) {
        //         ele[i].style.backgroundColor = null;
        //     }
        // }
        let lastEle = this.state.anchorEl;
        if (lastEle)
            lastEle.style.backgroundColor = null;

        this.setState({
            anchorEl: null,
            contextMenuSelectedItem,
            contextMenuDrugSet
        });
    };
    handleContextMenu = (e, item, subItem, eleId) => {
        e.stopPropagation();
        e.preventDefault();
        let clickX = e.clientX;
        let clickY = e.clientY;

        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        let menu = document.getElementById(this.props.id + '_contextMenuPaper');
        const menuW = menu.offsetWidth;
        const menuH = menu.offsetHeight;

        const right = (screenW - clickX) > menuW;
        const left = !right;
        const bottom = (screenH - clickY) > menuH;
        const top = !bottom;

        if (right) {
            menu.style.left = `${clickX}px`;
        }

        if (left) {
            menu.style.left = `${clickX - menuW}px`;
        }

        if (bottom) {
            menu.style.top = `${clickY}px`;
        }
        if (top) {
            menu.style.top = `${clickY - menuH}px`;
        }
        let lastEle = this.state.anchorEl;
        if (lastEle)
            lastEle.style.backgroundColor = null;
        document.getElementById(eleId).style.backgroundColor = 'rgba(0, 0, 0, 0.08)';

        this.setState({
            anchorEl: document.getElementById(eleId),
            contextMenuSelectedItem: subItem,
            contextMenuDrugSet: item
        });

    }
    showEditPanel = () => {
        let { contextMenuSelectedItem, contextMenuDrugSet } = this.state;
        this.props.updateField({
            showEditPanel: true,
            curDrugDetail: contextMenuSelectedItem,
            drugSetItem: contextMenuDrugSet
        });
        this.handleClose(true);
    }
    /* context menu */

    /***update favourite name */
    editFavName = (e, index, item) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            editFavNameIndex: index,
            orginalFav: item,
            newFavName: item.myFavouriteName
        });
    }
    handleChangeFavName = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({
            newFavName: e.target.value
        });
    }
    handleBlurFavName = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.state.newFavName
            || this.state.newFavName.toUpperCase().trim() == this.state.orginalFav.myFavouriteName.toUpperCase().trim()) {
            this.setState({
                editFavNameIndex: null,
                orginalFav: null,
                newFavName: null
            });
            return;
        }
        //check duplicate
        let duplicateList = this.props.myFavouriteListFromBackend.filter(item =>
            item.myFavouriteName &&
            item.myFavouriteName.toUpperCase().trim() === this.state.newFavName.toUpperCase().trim());
        if (duplicateList && duplicateList.length > 0) {
            // e.target.focus();
            // document.getElementById(this.props.id + '_editMyFavNameInput').focus();
            // this.props.openErrorMessage('The DrugSet Name exists, please rename.', null, 'Information/Attention');
            // console.log('demi', this.editMyFavNameRef);
            // this.editMyFavNameRef.focus();
            this.props.openCommonMessage({ msgCode: MOE_MSG_CODE.MY_FAV_DUPLICATED_DRUG_SET_NAME });
            return;
        }


        //update
        let params = _.cloneDeep(this.state.orginalFav);
        params.myFavouriteName = this.state.newFavName;
        let callback = () => {
            this.setState({
                editFavNameIndex: null,
                orginalFav: null,
                newFavName: null
            });
        };
        this.props.addToMyFavourite(
            params.moeMedProfiles,
            params,
            this.props.codeList,
            true,
            this.props.favKeyword,
            null,
            callback
        );
    }
    /***update favourite name */
    render() {
        const { myFavouriteList, id, classes } = this.props;
        // let autoCalHeight = this.state.myfavHeight;
        // if (document.querySelector('[dptid="outmost_moe_myfaver_container"]')) {
        //     autoCalHeight = resizeHeight(
        //         RESIZEHEIGHT_PANEL.OUTMOST_MOE_MYFAVER_CONTAINER.ID,
        //         RESIZEHEIGHT_PANEL.OUTMOST_MOE_MYFAVER_CONTAINER.MINUEND()
        //     );
        //     // console.log('myFavourite-render()---', autoCalHeight);
        // }
        // console.log('myFavourite-render()', this.state.myfavHeight, this.props.gridHeight);
        let setting = moeUtilities.getMoeSetting();
        return (
            <Typography component={'div'} style={{ positon: 'relative' }}>
                <Grid container style={{ marginBottom: '5px', height: '48px' }} >
                    <Grid style={{ width: '60px', paddingLeft: '25px' }} >Search:</Grid>
                    <Grid style={{ paddingLeft: 10, width: 'calc(100% - 110px)' }}>
                        <MyFavouriteSearch
                            id={'prescriptionMyFavoriteSearch'}
                            inputPlaceHolder={''}
                            limitValue={4}
                            inputMaxLength={256}
                            onChange={this.searchMyFav}
                        />
                    </Grid>
                </Grid>
                <CustomList
                    id={id + '_allItems'}
                    dptid={'outmost_moe_myfaver_container'}
                    style={{
                        padding: 0,
                        margin: 0,
                        overflowY: 'auto',
                        height: this.state.myfavHeight,
                        maxHeight: this.state.myfavHeight
                    }}
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                >
                    {myFavouriteList && myFavouriteList.map((item, index) => {
                        return (
                            <Typography component={'div'}
                                key={JSON.stringify(item)}
                                data-idfordrag={'outermostMyFavPanel'}
                            >
                                {item.myFavouriteName ?
                                    <CustomListItem
                                        id={id + '_parentItem' + index}
                                        style={{ position: 'relative' }}
                                        onMouseOver={this.handleMouseOver}
                                        onMouseOut={this.handleMouseOut}
                                        divider
                                        className={'listItem'}
                                        data-idfordrag={'myFavDropPanel'}
                                        data-favitem={item.myFavouriteId + '|' + item.version + '|' + item.createUserId}
                                        data-isparent
                                        draggable={!this.state.editFavNameIndex || this.state.editFavNameIndex < 0}
                                        onDragStart={e => this.handleDragStart(e, item, true, false, null)}
                                        onDrag={this.handleOnDrag}
                                        onDragEnd={e => this.handleDragEnd(e, true, false)}
                                        onDragEnter={e => this.handleDragEnter(e)}
                                        onDragOver={e => this.handleDragOver(e, true, false)}
                                        // onDragLeave={e=>this.handleDragLeave(e,true,false)}
                                        onDrop={this.handleDrop}
                                    >
                                        <Grid container>
                                            <Grid style={{
                                                width: '24px'
                                            }}
                                            >
                                                <IconButton id={id + '_parentDeleteBtn' + index}
                                                    style={{
                                                        padding: 0,
                                                        margin: '5px 0 0 5px',
                                                        // display: this.state.showDeleteIconParentIndex === index &&
                                                        //     this.state.showDeleteIconChildIndex === -1 && this.state.dragFavMode === false ? 'block' : 'none'
                                                        display: 'none'
                                                    }}
                                                    onClick={() => this.handleDeleteDialog(item, null)}
                                                    data-buttonid={'delBtn'}
                                                >
                                                    <img src={deleteIcon} alt={''} />
                                                </IconButton>
                                            </Grid>
                                            <Grid>
                                                <IconButton id={id + '_parentCollapseBtn' + index} style={{ padding: 0 }} onClick={() => this.handleCollapse(item, index)}>
                                                    <img src={item.open ? minus : plus} alt={''} data-extendicon />
                                                </IconButton>
                                            </Grid>
                                            <Grid id={id + '_myFavouriteName' + index}>
                                                {this.state.editFavNameIndex === index ?
                                                    <CIMSTextField
                                                        id={id + '_editMyFavNameCIMSTextField'}
                                                        value={this.state.newFavName}
                                                        onChange={this.handleChangeFavName}
                                                        onBlur={this.handleBlurFavName}
                                                        inputProps={{
                                                            maxLength: 50,
                                                            id: id + '_editMyFavNameInput'
                                                        }}
                                                        inputRef={node => {
                                                            this.editMyFavNameRef = node;
                                                        }}
                                                        // classes={{
                                                        //     focused: classes.textFieldFocused
                                                        // }}
                                                        autoFocus
                                                    />
                                                    :
                                                    <Typography
                                                        style={{ fontWeight: 'bold' }}
                                                        onDoubleClick={(e) => this.editFavName(e, index, item)}
                                                    >{item.myFavouriteName}</Typography>
                                                }
                                            </Grid>
                                            <Grid style={setting.isEnquiry ? { display: 'none' } : null}>
                                                <IconButton
                                                    id={id + '_parentAddToDrugBtn' + index}
                                                    style={{ position: 'absolute', right: 5, padding: 0 }}
                                                    onClick={() => this.props.handleAddDrugToPriscription(item, true)}
                                                >
                                                    <ChevronRightIcon />
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                    </CustomListItem>
                                    : null
                                }
                                <Collapse in timeout="auto" unmountOnExit style={{ margin: 0, display: item.open || !item.myFavouriteName ? 'block' : 'none' }}>
                                    <List component="div" disablePadding id={id + '_allSubItems' + index}>
                                        {item && item.moeMedProfiles.map((subItem, subIndex) => {
                                            let title = prescriptionUtilities.generatePanelTitle(subItem, this.props.codeList, true);
                                            let disableSubItem = !moeUtilities.isAvailable(subItem);
                                            let fontColor = null;
                                            if (disableSubItem) fontColor = 'grey';
                                            return (
                                                <CustomListItem
                                                    // button
                                                    className={'listItem'}
                                                    key={JSON.stringify(subItem)}
                                                    onMouseOver={this.handleMouseOver}
                                                    onMouseOut={this.handleMouseOut}
                                                    divider
                                                    id={id + '_parent' + index + '_childrenItem' + subIndex}
                                                    draggable={!this.state.editFavNameIndex || this.state.editFavNameIndex < 0}
                                                    onDragStart={e => this.handleDragStart(e, item, false, !item.myFavouriteName, subItem)}
                                                    onDrag={this.handleOnDrag}
                                                    onDragEnd={e => this.handleDragEnd(e, false, !item.myFavouriteName, fontColor)}
                                                    onDragEnter={e => this.handleDragEnter(e)}
                                                    onDragOver={e => this.handleDragOver(e, false, !item.myFavouriteName)}
                                                    // onDragLeave={e=>this.handleDragLeave(e,false,!item.myFavouriteName)}
                                                    onDrop={e => this.handleDrop(e)}
                                                    data-idfordrag={'myFavDropPanel'}
                                                    data-favitem={item.myFavouriteId + '|' + item.version + '|' + item.createUserId + (!item.myFavouriteName ? '' : '|' + subItem.orgItemNo)}
                                                    data-isparent={!item.myFavouriteName}
                                                    onContextMenu={(e) => this.handleContextMenu(e, item, subItem, id + '_parent' + index + '_childrenItem' + subIndex)}
                                                    style={{ color: fontColor }}
                                                >
                                                    <Grid container
                                                        style={{ padding: !item.myFavouriteName ? '0px' : '0 0 0 20px' }}
                                                    >
                                                        <Grid item
                                                            style={{
                                                                width: '24px'
                                                            }}
                                                        >
                                                            <IconButton
                                                                id={id + '_parent' + index + '_childDeleteBtn' + subIndex}
                                                                style={{
                                                                    padding: 0,
                                                                    margin: '5px 0 0 5px',
                                                                    // display: this.state.showDeleteIconParentIndex === index &&
                                                                    //     this.state.showDeleteIconChildIndex === subIndex && this.state.dragFavMode === false ? 'block' : 'none'
                                                                    display: 'none'
                                                                }}
                                                                onClick={() => this.handleDeleteDialog(item, subItem)}
                                                                data-buttonid={'delBtn'}
                                                            >
                                                                <img src={deleteIcon} alt={''} />
                                                            </IconButton>
                                                        </Grid>

                                                        <Grid item xs={10} style={{ width: 'cacl(100% - 78px)' }}
                                                            id={id + '_parent' + index + '_title' + subIndex}
                                                        >
                                                            <Typography component="div" style={{ display: subItem.dangerDrug && subItem.dangerDrug === 'Y' ? 'inline-block' : 'none' }}>
                                                                <img src={imgDangerDrug} style={{ marginTop: '6px' }} alt="" />
                                                            </Typography>
                                                            <Typography
                                                                component="div"
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    width: subItem.dangerDrug && subItem.dangerDrug === 'Y' ? '95%' : ''
                                                                }}
                                                            >
                                                                {title}
                                                            </Typography>
                                                            <i>{subItem.remarkText ? 'Note: ' + subItem.remarkText : null}</i>
                                                        </Grid>
                                                        <Grid item style={{ width: '24px', display: setting.isEnquiry || subItem.freeText === 'F' || disableSubItem ? 'none' : 'block' }}>
                                                            <IconButton
                                                                style={{ position: 'absolute', right: 5, padding: 0 }}
                                                                onClick={() => this.props.handleAddDrugToPriscription(subItem)}
                                                                id={id + '_parent' + index + '_childAddToDrug' + subIndex}
                                                            >
                                                                <ChevronRightIcon />
                                                            </IconButton>
                                                        </Grid>
                                                    </Grid>
                                                </CustomListItem>

                                            );
                                        }
                                        )}
                                    </List>
                                </Collapse>
                            </Typography>
                        );
                    }
                    )}
                </CustomList>
                {/* <CIMSAlertDialog
                    id="delete_dialog"
                    open={this.props.showDeleteDialog}
                    onClickOK={this.handleDeleteMyFavourite}
                    onClickCancel={() => this.handleDeleteDialog(false)}
                    dialogTitle={'Warning'}
                    dialogContentText={'Are you sure to delete this record?'}
                    cancelButtonName={'Cancel'}
                    okButtonName={'OK'}
                    // dialogTitle="Question"
                    // dialogContentText={'No item in the prescription, this order will be deleted.'}
                    // okButtonName={'OK'}
                    btnCancel
                /> */}

                {
                    this.props.showMyFavRemarkDialog &&
                    <MultipleRemarkDialog
                        id={id + '_multipleRemarkDialog'}
                        open={this.props.showMyFavRemarkDialog}
                        cancelClick={this.props.handleMyFavRemarkCancel}
                        okClick={this.props.handleMyFavRemarkOk}
                        data={this.props.myFavRemarkData}
                    />
                }
                {
                    this.props.showEditPanel &&
                    <DrugDetail
                        id={id + '_editPanel'}
                        handleDeleteDialog={this.handleDeleteDialog}
                    />
                }
                {/* context menu start */}
                <Paper
                    id={id + '_contextMenuPaper'}
                    style={{
                        outline: 'none',
                        position: 'fixed',
                        display: this.state.anchorEl ? 'block' : 'none',
                        backgroundColor: '#fff',
                        padding: 0,
                        margin: 0
                    }}
                >
                    <MenuList
                        style={{ padding: 0 }}
                        id={id + '_contextmenuMenuList'}
                        onMouseOut={(e) => { e.stopPropagation(); }}
                        onMouseOver={(e) => { e.stopPropagation(); }}
                    >
                        <MenuItem
                            id={id + '_editDrugMenuItem'}
                            style={{
                                display: this.state.contextMenuSelectedItem ? 'block' : 'none'
                            }}
                            onClick={this.showEditPanel}
                            className={classes.contextMenuItem}
                            onMouseOut={(e) => { e.stopPropagation(); }}
                            onMouseOver={(e) => { e.stopPropagation(); }}
                        >
                            Edit My Favourite Drug
                        </MenuItem>
                    </MenuList>
                </Paper>
                {/* context menu end */}
            </Typography >
        );
    }
}
const mapStateToProps = (state) => {
    return {
        myFavouriteListFromBackend: state.moeMyFavourite.myFavouriteListFromBackend,
        myFavouriteList: state.moeMyFavourite.myFavouriteList,
        codeList: state.moe.codeList,
        drugList: state.moe.drugList,
        // showDeleteDialog: state.moeMyFavourite.showDeleteDialog,
        // deleteParentItem: state.moeMyFavourite.deleteParentItem,
        // deleteChildItem: state.moeMyFavourite.deleteChildItem,
        loginInfo: state.moe.loginInfo,
        favKeyword: state.moeMyFavourite.favKeyword,
        showEditPanel: state.moeMyFavourite.showEditPanel
    };
};
const mapDispatchToProps = {
    updateField,
    deleteMyFavourite,
    filterMyFavourite,
    openErrorMessage,
    reorderMyFavourite,
    addToMyFavourite,
    openCommonMessage
};
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(style)(MyFavourite));