import React from 'react';
import PropTypes from 'prop-types';
import { withStyles, MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import TableHeadActions from './TableHeadActions';
import Tooltip from '@material-ui/core/Tooltip';
import CIMSTableCell from '../TableCell/CIMSTableCell';
import CircularProgress from '@material-ui/core/CircularProgress';
import {getState} from '../../store/util';
const { color, font } = getState(state => state.cimsStyle) || {};

const customTheme = (theme) => createMuiTheme({
  ...theme,
  overrides: {
    ...theme.overrides,
    MuiTableRow: {
      root: {
        height: '45px',
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
    tableLayout: 'fixed',
    marginBotton:'50px'
    //minWidth: 700
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
  }, labelRoot: {
    fontSize: 'inherit',
    fontWeight: 'inherit',
    lineHeight: 'inherit',
    fontFamily: 'inherit',
    color: 'inherit'
  },
  tableWrapper:{
    marginBottom:50
  }
});

const HtmlTooltip = withStyles(theme => ({
  tooltip: {
    marginTop:-10,
    backgroundColor: color.cimsBackgroundColor,
    color: 'rgba(0, 0, 0, 1)',
    maxWidth: '100%',
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9'
  },
  popper: {
    opacity:1
  }
}))(Tooltip);

let count = 0;
class CimsTableNoPagination extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 0,
      rowsPerPage: this.props.options.rowsPerPage || 5,
      selected: [],
      showProgress: false,
      confirmHide: 'none',
      showPage: false
    };
  }


  handleClickRow = (e, data) => {
    const sequence = this.props.options.onSelectIdName;
    this.setState({
      sequence: data[sequence]
    });
    let {getSelectRow,handleRowDoubleClick} = this.props;
    count += 1;
    setTimeout(() => {
      if (count === 1) {
        getSelectRow&&getSelectRow(data);
      } else if (count === 2) {
        handleRowDoubleClick&&handleRowDoubleClick(data);
      }
      count = 0;
    }, 300);
    // this.props.getSelectRow(data);
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
    const { classes, rows, data, tableStyles, nodataMessage, tableRowStyle,tipsListSize } = this.props;
    const options = this.props.options || {};
    const {tipsDisplayName, tipsListName, onSelectIdName, tipsDisplayListName,tipsCustomRender,tipsCutomStyle=null,tooltipDivStyle=null,tipsPlacement='bottom-start'} = options;
    let isNoData = !data || data.length < 1;
    let bodyData = data;
    let initRows = rows;  //表头
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
                                style={tableRowStyle}
                                // style={{ cursor: options.onRowClick || options.onSelectedRow ? 'pointer' : 'default' }}
                                id={id + '_tableRow_' + i}
                            >
                              {
                                initRows && initRows.map((rowItem, index) => {
                                  const cellStyle = options.bodyCellStyle ? options.bodyCellStyle : null;
                                  let tipsList = n[tipsListName];
                                  return  tipsList&&tipsList.length>0&&index===1?
                                  (
                                    <HtmlTooltip key={index}
                                        classes={tipsCutomStyle}
                                        title={
                                          <React.Fragment >
                                            <div classes={tooltipDivStyle} style={{ maxWidth: 1000, whiteSpace: 'pre-wrap' }}>
                                            {
												                      typeof tipsCustomRender === 'function'?tipsCustomRender(i):(
                                                tipsList.map((tips)=>{
                                                  let title = tipsDisplayListName===null?tips[tipsDisplayName]:tips[tipsDisplayListName][tipsDisplayName];
                                                  if(index===tipsListSize){
                                                    return (
                                                      <Typography key={index} color="inherit">......</Typography>
                                                    );
                                                  } else if(tipsListSize!==null&&index>tipsListSize){
                                                    return null;
                                                  } else {
                                                    return (
                                                      <Typography key={index} color="inherit">- {title}</Typography>
                                                    );
                                                  }
                                                })
                                              )}
                                            </div>
                                          </React.Fragment>
                                          }
                                        placement={tipsPlacement}
                                    >
                                      <CIMSTableCell id={id + '_tableCell_'+rowItem.name} key={index} variant="body" align="left" className={cellStyle}>
                                        {
                                          rowItem.customBodyRender ? rowItem.customBodyRender(n[rowItem.name], n) : n[rowItem.name]
                                        }
                                      </CIMSTableCell>
                                    </HtmlTooltip>):
                                    (n[rowItem.name] == null || (rowItem.customBodyRender ? ((typeof rowItem.customBodyRender(n[rowItem.name], n)) === 'string' ? false : true): false)?
                                      (<CIMSTableCell id={id + '_tableCell_' + rowItem.name} key={index} variant="body" align="left" className={cellStyle}>
                                        {
                                          rowItem.customBodyRender ? rowItem.customBodyRender(n[rowItem.name], n) : n[rowItem.name]
                                        }
                                      </CIMSTableCell>) :
                                      (<HtmlTooltip key={index}
                                          classes={tipsCutomStyle}
                                          title={
                                            <React.Fragment >
                                              <div style={{ maxWidth: 500, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                <Typography key={index} color="inherit">
                                                  {rowItem.customBodyRender ? rowItem.customBodyRender(n[rowItem.name], n) : n[rowItem.name]}
                                                </Typography>
                                              </div>
                                            </React.Fragment>
                                          }
                                          placement={tipsPlacement}
                                       >
                                        <CIMSTableCell id={id + '_tableCell_' + rowItem.name} key={index} variant="body" align="left" className={cellStyle}>
                                          {
                                            rowItem.customBodyRender ? rowItem.customBodyRender(n[rowItem.name], n) : n[rowItem.name]
                                          }
                                        </CIMSTableCell>
                                      </HtmlTooltip>));
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
                        <Typography style={{fontFamily: font.fontFamily, fontSize: font.fontSize, padding: 10}}>{nodataMessage ? nodataMessage : 'There is no data.'}</Typography>
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