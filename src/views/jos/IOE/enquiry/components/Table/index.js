/*
* @Author: vento
* @Date:   2019-10-30 16:26:06
* @Last Modified by:   toutouli
* @Last Modified time: 2019-11-12 11:54:16
*/
import React from 'react';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import MaterialTable from 'material-table';

const customTheme = (theme) => createMuiTheme({
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
        padding:'0px',
        fontFamily:'Arial',
        fontSize:'1rem',
        paddingTop:5,
        paddingBottom:5
      }
    }
  }
});



class MyTable extends React.Component{
  constructor(props) {
    super(props);
    this.state={
      selected:props.selected||[],
      selectionKey:typeof(props.options.selection)=='string'?props.options.selection:undefined
    };
  }

  componentWillReceiveProps(props){
    const {selected}=props;
    this.setState({
      selected:selected
    });
  }

  defaultOptions={
    headerStyle:{
      backgroundColor:'#7BC1D9',
      color:'#fff'
    },
    toolbar:false,
    paging:false,
    sorting:false,
    rowStyle:(rowData)=>({
      backgroundColor:(this.state.selected.find(item=>item.ioeRequestNumber===rowData.ioeRequestNumber))?'lightgoldenrodyellow':'#fff'
    })
  };

  handleRowClick=(e,rowData)=>{
    const {onSelectionChange}=this.props;
    const {selectionKey}=this.state;
    let dataIndex=null;
    if(this.state.selected.find((item,index)=>{
        dataIndex=index;
        return item[selectionKey]===rowData[selectionKey];
      })
    ){
      this.state.selected.splice(dataIndex,1);
    }else{
      this.state.selected.push(rowData);
    }
    let arr=[...this.state.selected];
    if(onSelectionChange){
      onSelectionChange(arr);
    }
    this.setState({
      selected:arr
    });
  }

  render(){
    const {options,...others}=this.props;
    const rowSelection=typeof(options.selection)=='string';
    options.selection=rowSelection?false:options.selection;
    return (
      <MuiThemeProvider theme={customTheme}>
        <MaterialTable {...others} options={{...this.defaultOptions,...options}} onRowClick={this.handleRowClick}/>
      </MuiThemeProvider>
    );
  }
}

export default MyTable;
