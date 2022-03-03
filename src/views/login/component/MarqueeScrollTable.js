import React, {Component} from 'react';
import {
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Box
} from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';
import CIMSButton from '../../../components/Buttons/CIMSButton';
import DialogActions from '@material-ui/core/DialogActions';


const useStyles = (theme) => ({
    root: {
        width: '100%'
    },
    container: {
        height: 300,
        overflowY: 'hidden',
        border: `1px solid ${theme.palette.grey.A100}`
    },
    table: {
        tableLayout: 'fixed'
    },
    tableHead: {},
    tableBody: {
        overflowY: 'auto'
    },
    tableRowHead: {
        height: 35
    },
    tableRowRoot: {
        height: 35,
        '&$tableRowSelected': {},
        '&$tableRowHover:hover': {}
    },
    tableRowSelected: {},
    tableRowHover: {},
    tableCellRoot: {
        wordBreak: 'break-word'
    },
    tableCellHead: {
        position: 'sticky',
        top: -1,
        left: 0,
        zIndex: 2,
        border: 0
    },
    marqueeData: {
        overflowY: 'scroll',
        height: 260
    }
});

let scrollTableInterval = null;

class MarqueeScrollTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
            clickCount: 0,
            isCursorInside: false
        };
    }

    componentDidMount() {
        this.scrollToMyScrollEl();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
/*        if (prevProps.isMarqueeBtnStart !== this.props.isMarqueeBtnStart) {
            this.triggerMarqueeScrollTable();
        }*/
    }

    componentWillUnmount() {
        // clearInterval(scrollTableInterval);
    }

    scrollToMyScrollEl = () => {
        const content = document.getElementById(this.getId() + '_tableOfDataRoot');
        let scrolledHeight = 0;
        const scrollDistance = 35;

        const easeOutCubic = (t) => {
            return 1 - Math.pow(1 - t, 3);
        };

        const easeInSine = (t) => {
            return 1 - Math.cos((t * 3.14) / 2);
        };

        const easeInOutExpo = (t) => {
            return t === 0
                ? 0
                : t === 1
                    ? 1
                    : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2
                        : (2 - Math.pow(2, -20 * t + 10)) / 2;
        };

        const easeInOutBack = (t) => {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;

            return t < 0.5
                ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
                : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
        };

        function easeInOutQuad(t) {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        }

        const scrollToX = (element, xFrom, xTo, t01, speed, step, motion) => {
            if (t01 < 0 || t01 > 1 || speed <= 0) {
                element.scrollTop = xTo;
                return;
            }
            element.scrollTop = xFrom - (xFrom - xTo) * motion(t01);
            t01 += speed * step;

            setTimeout(() => {
                scrollToX(element, xFrom, xTo, t01, speed, step, motion);
            }, step);
        };

        // Element to move, element or px from, element or px to, time in ms to animate
        const scrollToC = (element, from, to, duration) => {
            if (duration <= 0) return;
            if (typeof from === 'object') from = from.offsetTop;
            if (typeof to === 'object') to = to.offsetTop;

            scrollToX(element, from, to, 0, 1 / duration, 20, easeInOutQuad);
        };

        // Element to move, time in ms to animate
        const scrollTo = (element, distance, duration) => {
            if (element.scrollTop === 0) {
                let t = element.scrollTop;
                ++element.scrollTop;
                element = t + 1 === element.scrollTop-- ? element : document.body;
            }
            scrollToC(element, element.scrollTop, distance, duration);
        };

        const autoScrollTable = () => {
            if (!this.state.isCursorInside && this.props.isMarqueeBtnStart) {
                const contentHeight = content.scrollHeight - content.offsetHeight;
                const contentScrollOffset = content.scrollTop;

                if (scrolledHeight != 0 && (contentScrollOffset - scrolledHeight > scrollDistance || scrolledHeight - contentScrollOffset > scrollDistance)) {
                    scrolledHeight = contentScrollOffset;
                }

                // content.scrollTo({top: scrolledHeight, behavior: 'smooth'});

                scrollTo(content, scrolledHeight, 2000);

                if (scrolledHeight >= contentHeight) {
                    scrolledHeight = 0;
                } else {
                    scrolledHeight = scrolledHeight + scrollDistance;
                }
            }

            // console.log('kl_', document.visibilityState);

            // if (document.visibilityState === 'visible') {
            //     setTimeout(autoScrollTable, 4000);
            // }
        };

        // autoScrollTable();

        scrollTableInterval = setInterval(() => {
            setTimeout(() => {
                if (document.visibilityState === 'visible') {
                    autoScrollTable();
                }
            }, 50);
        }, 4000);
    }

    triggerMarqueeScrollTable = () => {
        this.setState({
            ...this.state,
            isCursorInside: !this.state.isCursorInside
        });
    }

    handleClick = (e, row, index) => {
        const {handleRowClick, handleRowDbClick} = this.props;
        const tbr = document.getElementById(this.getId() + '_bodyRow_' + index);
        if (tbr) {
            tbr.style.boxShadow = '0 0 5px #4e4e4e inset';
        }
        setTimeout(() => {
            if (tbr) {
                tbr.style.boxShadow = '';
            }
        }, 200);
        this.setState({clickCount: this.state.clickCount + 1}, () => {
            setTimeout(() => {
                const {clickCount} = this.state;
                if (clickCount !== 0) {
                    this.setState({clickCount: 0}, () => {
                        if (clickCount === 1) {
                            handleRowClick && handleRowClick(e, row, index);
                        } else if (clickCount === 2) {
                            handleRowDbClick && handleRowDbClick(e, row, index);
                        }
                    });
                }
            }, 200);
        });
    }

    getId = () => {
        return this.props.id || 'autoScrollTable';
    }

    render() {
        const {classes, columns, store, selectIndex, handleRowClick, handleRowDbClick, hasCustomKey, customKeyName} = this.props;

        const id = this.getId();
        const useCutomKey = hasCustomKey && customKeyName !== undefined;

        return (
            <Box className={classes.root}>
                <Grid className={classes.container}
                    onMouseEnter={() => {
                          this.triggerMarqueeScrollTable();
                      }}
                    onMouseLeave={() => {
                          this.triggerMarqueeScrollTable();
                      }}
                >
                    <Table
                        id={id + '_tableOfBody'}
                        className={classes.table}
                    >
                        <TableHead
                            id={id + '_head'}
                            className={classes.tableHead}
                        >
                            <TableRow
                                id={id + '_headRow'}
                                classes={{
                                    head: classes.tableRowHead
                                }}
                            >
                                {columns && columns.map((column, index) => {
                                    // eslint-disable-next-line
                                    const {name, label, customBodyRender, style, ...rest} = column;//NOSONAR
                                    return (
                                        <TableCell
                                            id={id + '_headCell_' + index}
                                            key={name}
                                            variant="head"
                                            align="left"
                                            padding="default"
                                            classes={{
                                                head: classes.tableCellHead,
                                                root: classes.tableCellRoot
                                            }}
                                            title={typeof label === 'string' ? label : ''}
                                            style={style && style.head}
                                            {...rest}
                                        >
                                            {label}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                    </Table>
                    <div
                        id={id + '_tableOfDataRoot'}
                        className={classes.marqueeData}
                    >
                        <Table
                            id={id + '_tableOfData'}
                            className={classes.table}
                        >
                            <TableBody id={id + '_body'} className={classes.tableBody}>
                                {
                                    store && store.map((row, index) => {
                                        return (
                                            <TableRow
                                                // id={id + '_bodyRow_' + index}
                                                id={`${id}_bodyRow_${useCutomKey ? row[customKeyName] : index}`}
                                                // key={index}
                                                key={useCutomKey ? row[customKeyName] : index}
                                                classes={{
                                                    root: classes.tableRowRoot,
                                                    selected: classes.tableRowSelected,
                                                    hover: classes.tableRowHover
                                                }}
                                                selected={selectIndex && selectIndex.indexOf(index) > -1}
                                                onClick={(...args) => this.handleClick(...args, row, index)}
                                                hover={handleRowClick || handleRowDbClick ? true : false}
                                                style={{cursor: handleRowClick || handleRowDbClick ? 'pointer' : 'default'}}
                                                ref={ref => this.myScrollEl = ref}
                                            >
                                                {columns.map((column, i) => {
                                                    const {name, customBodyRender, style, ...rest} = column;
                                                    const cellContent = customBodyRender ? customBodyRender(row[name], row) : row[name];
                                                    return (
                                                        <TableCell
                                                            id={id + '_bodyRow_' + index + '_bodyCell_' + i}
                                                            key={name}
                                                            classes={{
                                                                root: classes.tableCellRoot
                                                            }}
                                                            {...rest}
                                                            style={{
                                                                ...style,
                                                                whiteSpace: selectIndex && selectIndex.indexOf(index) > -1 ? 'pre-line' : 'nowrap'
                                                            }}
                                                            title={typeof cellContent === 'string' ? cellContent : ''}
                                                        >
                                                            {cellContent}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        );
                                    })
                                }
                            </TableBody>
                        </Table>
                    </div>
                </Grid>
            </Box>
        );
    }
}

export default withStyles(useStyles)(MarqueeScrollTable);
