import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TableHeadActions from '../../../../../components/Table/TableHeadActions';
// import Tooltip from '@material-ui/core/Tooltip';
import CIMSTableCell from '../../../../../components/TableCell/CIMSTableCell';
import CircularProgress from '@material-ui/core/CircularProgress';
import DecimalTextField from '../../components/DecimalTextField/DecimalTextField';
import {getState} from '../../../../../store/util';
const { color } = getState(state => state.cimsStyle) || {};

const customTheme = (theme) => createMuiTheme({
  ...theme,
  overrides: {
    ...theme.overrides,
    MuiTableRow: {
      root: {
        // height: 35,
        backgroundColor: color.cimsBackgroundColor,
        '&$selected': {
            backgroundColor: 'cornflowerblue'
        }
      }
    }
  }
});

const useStyles2 = () => ({
  root: {
    width: '100%'
  },
  table: {
    tableLayout: 'fixed'
  },
  actionBtnRoot: {
    padding: 2
  },
  progressBarRoot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'red',
    top: 0,
    left: 0
  },
  progressBar: {
    top: '50%',
    position: 'relative',
    left: '50%',
    marginTop: '-20px',
    marginLeft: '-20px'
  },
  labelRoot: {
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    fontFamily: 'inherit',
    color: 'inherit'
  },
  wrapper:{
    padding:'0px 5px 0px 5px'
  },
  helperError:{
    fontSize: '10pt !important'
  }
});

class CimsTableNoPagination extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      rowsPerPage: this.props.options.rowsPerPage || 5,
      selected: [],
      showProgress: false,
      confirmHide: 'none',
      showPage: false,
      measurementAndLabTestList : this.props.measurementAndLabTestList
    };
  }

  inputOnChange=(e)=>{
    let { measurementAndLabTestFieldValMap,updateValMaps } = this.props;
    measurementAndLabTestFieldValMap.get(e.target.id).value = e.target.value;
    this.setState({
      measurementAndLabTestFieldValMap:measurementAndLabTestFieldValMap
    });
    updateValMaps(measurementAndLabTestFieldValMap);
  }

  handleClickRow = (e, data) => {
    const sequence = this.props.options.onSelectIdName;
    this.setState({
      sequence: data[sequence]
    });
    this.props.getSelectRow(data);
  }
  isSelected = rowId => this.state.selected.indexOf(rowId) !== -1;

  emptyRowsFunc = () => {
    const { remote, data } = this.props;
    const { rowsPerPage, page } = this.state;
    let emptyRows = 0;
    if (!data) return 0;
    if (remote) {
      emptyRows = data.length % rowsPerPage === 0 ? 0 : rowsPerPage - data.length % rowsPerPage;
    } else {
      emptyRows = rowsPerPage - Math.min(rowsPerPage, data.length - page * rowsPerPage);
    }
    return emptyRows;
  }

  render() {
    const { classes, rows, data, tableStyles, nodataMessage,measurementAndLabTestFieldValMap,view } = this.props;
    const options = this.props.options || {};
    // let valMap = new Map();
    // valMap.set('melt_51',{'operationType': null, 'version': null, 'value': ''});
    const { onSelectIdName } = options;
    let isNoData = !data || data.length < 1;
    let bodyData = data;
    let initRows = rows;  //表头
    const textFieldId = 51; // initial id
    const textFieldHead = 'melt';
    const id = this.props.id || 'CIMSTable';
    return (
      <MuiThemeProvider theme={customTheme}>
        <Paper className={classes.root} >
          <Typography component="div" className={classes.tableWrapper}>
            <Table className={classes.table} style={tableStyles} id={id}>
              <TableHeadActions
                  id={id + '_tableHead'}
                  headStyle={options.headRowStyle ? options.headRowStyle : null}
                  cellStyle={options.headCellStyle ? options.headCellStyle : null}
                  headRows={rows}
                  isNoData={isNoData}
              />
              <TableBody>
                {
                  bodyData && bodyData.length > 0 ?
                  (
                    <>
                      {
                        bodyData.map((n, i) => {
                          const isSelected = this.props.selectRow === n[onSelectIdName] ? true : false;
                          return (
                            <TableRow

                                onClick={
                                  event => this.handleClickRow(event, n)
                                }
                                key={i}
                                selected={isSelected}
                                hover={options.rowHover}
                                style={{height: 35,backgroundColor:i%2===0 ? color.cimsBackgroundColor: '#D1EEFC'}}
                                // style={{ cursor: options.onRowClick || options.onSelectedRow ? 'pointer' : 'default' }}
                                id={id + '_tableRow_' + i}
                            >
                              {
                                initRows && initRows.map((rowItem, index) => {
                                  const cellStyle = options.bodyCellStyle ? options.bodyCellStyle : null;
                                  // let tipsList = n[tipsListName];
                                  return  index===1?
                                  (
                                      <CIMSTableCell key={index} variant="body" align="left" className={cellStyle}>
                                         <DecimalTextField
                                             classes={{helper_error:classes.helper_error}}
                                             id={textFieldHead+(textFieldId+i)}
                                             fieldValMap={measurementAndLabTestFieldValMap}
                                             prefix={textFieldHead}
                                             mramId={(textFieldId+i)===68?'204':(textFieldId+i)}
                                             updateState={this.props.updateState}
                                            //abnormalMsg={'The value should not less than 30.'}
                                             maxLength={10}
                                             viewMode={view}
                                         />
                                         <div style={{display:'inline-flex',paddingTop:10,paddingLeft:7}}>
                                          <span style={{verticalAlign: 'sub',fontSize:'1rem'}}>
                                            {
                                              rowItem.customBodyRender ? rowItem.customBodyRender(n[rowItem.name], n) : n[rowItem.name]
                                            }
                                            {
                                               i===8&&<sup style={{fontSize:10}}>2</sup>
                                            }
                                            </span>
                                        </div>
                                      </CIMSTableCell>
                                  ):
                                    <CIMSTableCell key={index} variant="body" align="left" className={cellStyle}>
                                       {
                                               i===8&&index===0&&<sup style={{fontSize:1}}>L</sup>
                                            }
                                      {
                                        rowItem.customBodyRender ? rowItem.customBodyRender(n[rowItem.name], n) : n[rowItem.name]
                                      }
                                    </CIMSTableCell>;
                                })
                              }

                            </TableRow>
                          );
                        })
                      }
                    </>
                  )
                  :
                  (
                    <TableRow style={{ height: 'auto' }}>
                      <TableCell colSpan={initRows.length} style={{ textAlign: 'center' }}>
                        <Typography variant="h6">{nodataMessage ? nodataMessage : 'There is no data.'}</Typography>
                      </TableCell>
                    </TableRow>
                  )
                }
              </TableBody>
            </Table>
            <Typography component="div" className={classes.progressBarRoot} style={{ display: this.state.showProgress ? '' : 'none' }}><CircularProgress className={classes.progressBar} /></Typography>
          </Typography>
        </Paper>
      </MuiThemeProvider>
    );
  }
}

CimsTableNoPagination.propTypes = {
    rows: PropTypes.array.isRequired
};

export default withStyles(useStyles2)(CimsTableNoPagination);