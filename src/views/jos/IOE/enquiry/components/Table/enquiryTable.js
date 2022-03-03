import React from 'react';
import { MuiThemeProvider, createMuiTheme,withStyles } from '@material-ui/core/styles';
import MaterialTable from 'material-table';
import TableHeader from './enquiryTableHeader';
import {TablePagination} from '@material-ui/core';
import TablePaginationActions from '../../../../../../components/Table/TablePaginationActions';
import { COMMON_STYLE } from '../../../../../../constants/commonStyleConstant';
import {getState} from '../../../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const customStyle={
    root:(props)=>{
      const {options={}}=props;
      if(options.maxBodyHeight==undefined){
        return {
          '& div':{
            overflow:'unset!important'
          }
        };
      }
      else{
        return null;
      }
    }
};

class enquiryTable extends React.Component{
  constructor(props) {
    super(props);
    const {options={},selected=[]}=props;
    this.state={
      selected:selected,
      page: this.props.page||0,
      rowsPerPage:this.props.page||10,
      rowsPerPageOptions: this.props.rowsPerPageOptions || [10, 20, 50],
      selectionKey:typeof(options.selection)=='string'?options.selection:undefined,
      selectionLabNum: 'labNum',
      clickCount:0
    };
  }

  componentWillReceiveProps(props){
    const {selected}=props;
    if(selected){
      this.setState({
        selected:selected
      });
    }
  }

  customTheme = (theme) => createMuiTheme({
    ...theme,
    palette:{
      primary:{
        main:'#7BC1D9'
      },
      secondary:{
        main:'#0579c8'
      }
    },
    overrides: {
      // MuiTableHead:{
      //   root:{
      //     backgroundColor:'#7BC1D9'
      //   }
      // },

      MuiTableCell:{
        root:{
          padding:'8px',
          fontSize: font.fontSize,
          fontFamily: font.fontFamily,
          backgroundColor:color.cimsBackgroundColor
        }
      },
      MuiInputBase: {
        inputSelect: {
            fontSize: font.fontSize,
            fontFamily: font.fontFamily
        },
      input: {
            fontSize: font.fontSize,
            fontFamily: font.fontFamily
        }
      },
      MuiMenuItem: {
        root: {
            fontFamily: font.fontFamily
        }
      },
      MuiTablePagination:{
        height: 45,
        minHeight: 45
      },
      MuiList:{
        root:{
          backgroundColor:color.cimsBackgroundColor
        }
      }
    }
  });

  defaultOptions={
    headerStyle:{
      backgroundColor:COMMON_STYLE.TABLE_BGCKGROUNDCOLOR,
      color: COMMON_STYLE.whiteTitle
    },
    toolbar:false,
    paging:false,
    sorting:false,
    rowStyle:(rowData)=>({
      backgroundColor:(this.state.selected&&this.state.selected.find(item=>JSON.stringify(item)==JSON.stringify(rowData)))?'#eee':color.cimsBackgroundColor
    })
  };

  defaultComponents={
    Header:(props)=>{
      return <TableHeader {...props}/>;
    }
  }


  handleChangePage = (event, newPage) => {
    const {handleChangePageCallBack}=this.props;
    handleChangePageCallBack&&handleChangePageCallBack(newPage);
      this.setState({page:newPage});
  }

  handleChangeRowsPerPage=(event)=>{
    const {handleChangeRowsPerPageCallBack}=this.props;
    let newRowsPerPage = parseInt(event.target.value, 10);
    handleChangeRowsPerPageCallBack&&handleChangeRowsPerPageCallBack(newRowsPerPage);
    this.setState({rowsPerPage:newRowsPerPage});
  }

  handleRowClick=(e,rowData)=>{
    const {onSelectionChange,onRowClick,handleOnClick}=this.props;
    const {selectionKey,selectionLabNum}=this.state;
    let dataIndex=null;
    let arr;
    this.setState({clickCount:this.state.clickCount+1},()=>{
      setTimeout(() => {
        const {clickCount}=this.state;
        if(clickCount!==0){
          this.setState({clickCount:0},()=>{
            onRowClick && onRowClick(e, rowData);
            if (selectionKey) {
              if (this.state.selected.find((item, index) => {
                dataIndex = index;
                return item[selectionKey] === rowData[selectionKey] && item[selectionLabNum] === rowData[selectionLabNum];
              })
              ) {
                //选中当前data，进行双击获取data并弹出Dialog
                if (clickCount == 2) {
                  let array = [];
                  let dataRow = this.state.selected.find(item => JSON.stringify(item) == JSON.stringify(rowData));
                  if (dataRow != undefined) {
                    array.push(dataRow);
                  }
                  handleOnClick && handleOnClick(array);
                } else {
                  this.state.selected.splice(dataIndex, 1);
                }
              } else {
                this.state.selected.push(rowData);
              }
              arr = [...this.state.selected];
            } else {
              if (this.state.selected && JSON.stringify(rowData) == JSON.stringify(this.state.selected[0])) {
                arr = [];
              } else {
                arr = [rowData];
              }
            }
            if (onSelectionChange) {
              onSelectionChange(arr);
            }
            this.setState({ selected: arr });
            //没有选中行data，进行双击获取data并弹出Dialog
            if (clickCount === 2) {
              let array=[];
              let dataRow = this.state.selected.find(item => JSON.stringify(item) == JSON.stringify(rowData));
              if (dataRow != undefined) {
                array.push(dataRow);
              }
              handleOnClick && handleOnClick(array);
            }
          });
        }
      }, 200);
    });
  }

  render(){
    const { options = {}, classes, count, isPagination, components, id = '', ...others } = this.props;
    const { headerStyle = {} } = options;
    const rowSelection = typeof (options.selection) == 'string';
    options.selection = rowSelection ? false : options.selection;
    const { page, rowsPerPage, rowsPerPageOptions } = this.state;
    return (
      <MuiThemeProvider theme={this.customTheme}>
        <div id={id} className={classes.root}>
          <MaterialTable
              id={id + 'Table'}
              {...others}
              options={{
                ...this.defaultOptions,
                ...options,
                headerStyle: {
                  ...this.defaultOptions.headerStyle,
                  ...headerStyle
                }
              }}
              components={{ ...this.defaultComponents, ...components }}
              onRowClick={this.handleRowClick}
          />
          {
             isPagination?
             <TablePagination
                 rowsPerPageOptions={rowsPerPageOptions}
                 component="div"
                 count={count}
                 rowsPerPage={rowsPerPage}
                 page={page}
                 ActionsComponent={TablePaginationActions}
                 onChangePage={this.handleChangePage}
                 onChangeRowsPerPage={this.handleChangeRowsPerPage}
             />:null
          }
        </div>
      </MuiThemeProvider>
    );
  }
}

export default withStyles(customStyle)(enquiryTable);