import React, { Component } from 'react';
import { TableHead, TableBody, TableRow, Table, TableCell, Typography } from '@material-ui/core';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { getState } from '../../../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

class CommonTable extends Component {
  constructor(props) {
    super(props);
    const {options={},selected=[]}=props;
    this.state={
      selected:selected,
      selectionKey:typeof(options.selection)=='string'?options.selection:undefined
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
      MuiTableCell:{
        root:{
          padding:'8px',
          fontSize: font.fontSize,
          fontFamily: font.fontFamily
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
      }
    }
  });

  handleRowClick=(e,rowData)=>{
    const {onSelectionChange,onRowClick}=this.props;
    const {selectionKey}=this.state;
    let dataIndex=null;
    let arr;
    onRowClick && onRowClick(e, rowData);
    if (selectionKey) {
      if (this.state.selected.find((item, index) => {
        dataIndex = index;
        return item[selectionKey] === rowData[selectionKey];
      })
      ) {
        this.state.selected.splice(dataIndex, 1);
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
  }

  render() {
    const { headers, data, tSplit, options, id, errorFlag = false } = this.props;
    const defaultOptions={
      rowStyle:(rowData)=>({
        backgroundColor:(this.state.selected&&this.state.selected.find(item=>JSON.stringify(item)==JSON.stringify(rowData)))?'#eee':color.cimsBackgroundColor
      })
    };

    return (
      <MuiThemeProvider theme={this.customTheme}>
        <Typography component="div" style={{maxHeight:options.maxBodyHeight?options.maxBodyHeight:'unset',overflowX:options.maxBodyHeight?'auto':'unset'}}>
          <Table id={id + 'Table'}>
            <TableHead style={options.headerStyle}>
              <TableRow>
                {
                  headers && headers.map((header, index) =>(
                      <TableCell
                          key={index}
                          colSpan={header.colSpan ? header.colSpan : 1}
                          rowSpan={header.rowSpan ? header.rowSpan : 1}
                          style={header.headerStyle?header.headerStyle:null}
                      >
                        {header.title}
                      </TableCell>
                    )
                  )
                }
              </TableRow>

              {errorFlag ? (
                <TableRow>
                  <TableCell
                      id={id + 'error-table-row'}
                      colSpan={3}
                      style={{ backgroundColor: color.cimsBackgroundColor }}
                  >
                    <div style={{ color: 'red', fontSize: '0.75rem', textAlign: 'center' }}>
                      <label>Fail to connect service(s):</label><br />
                      <label>Vaccination.</label>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableHead>
            <TableBody>
              {
                data && data.map((dataObj)=>(
                  <>
                    <TableRow style={defaultOptions.rowStyle(dataObj)} onClick={(e)=>this.handleRowClick(e,dataObj)}>
                      {
                        tSplit.map((rowItem, index)=>(
                          <TableCell
                              key={index}
                              // colSpan={rowItem.colSpan ? rowItem.colSpan : 1}
                              // rowSpan={rowItem.rowSpan ? rowItem.rowSpan : 1}
                              style={rowItem.cellStyle ? rowItem.cellStyle : null}
                          >
                              {rowItem.render?rowItem.render(dataObj):dataObj[rowItem.name]}
                          </TableCell>
                        ))
                      }
                    </TableRow>
                  </>
                ))
              }
            </TableBody>
          </Table>
        </Typography>
      </MuiThemeProvider>
    );
  }
}

export default CommonTable;