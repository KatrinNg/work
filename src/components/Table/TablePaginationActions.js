import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

const useStyles1 = theme => ({
    root: {
        flexShrink: 0,
        color: theme.palette.text.secondary,
        marginLeft: theme.spacing(1)
    }
});

class TablePaginationActions extends React.Component {
    constructor(props) {
        super(props);

        this.handleFirstPageButtonClick = this.handleFirstPageButtonClick.bind(this);
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.handleNextButtonClick = this.handleNextButtonClick.bind(this);
        this.handleLastPageButtonClick = this.handleLastPageButtonClick.bind(this);
    }

    componentDidUpdate(){
        const { count, rowsPerPage, page } = this.props;
        if(count !== 0 && page !== 0){
            const maxPage = Math.ceil(count / rowsPerPage);
            if(maxPage < (page + 1) && this.props.onChangePage){
                this.props.onChangePage(true, maxPage - 1);
            }
        }
    }

    handleFirstPageButtonClick(event) {
        if(this.props.onChangePage){
            this.props.onChangePage(event, 0);
        }
    }

    handleBackButtonClick(event) {
        if(this.props.onChangePage){
            this.props.onChangePage(event, this.props.page - 1);
        }
    }

    handleNextButtonClick(event) {
        if(this.props.onChangePage){
            this.props.onChangePage(event, this.props.page + 1);
        }
    }

    handleLastPageButtonClick(event) {
        if(this.props.onChangePage){
            this.props.onChangePage(event, Math.max(0, Math.ceil(this.props.count / this.props.rowsPerPage) - 1));
        }
    }

    render() {
        // const theme = useTheme();
        const { count, page, rowsPerPage, classes, id } = this.props;
        return (
            <div className={classes.root}>
                <IconButton
                    id={id+'_firstPage'}
                    onClick={this.handleFirstPageButtonClick}
                    disabled={page === 0}
                    aria-label="First Page"
                >
                    <FirstPageIcon />
                </IconButton>
                <IconButton
                    id={id+'_previousPage'}
                    onClick={this.handleBackButtonClick}
                    disabled={page === 0}
                    aria-label="Previous Page"
                >
                    <KeyboardArrowLeft />
                </IconButton>
                <IconButton
                    id={id+'_nextPage'}
                    onClick={this.handleNextButtonClick}
                    disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                    aria-label="Next Page"
                >
                    <KeyboardArrowRight />
                </IconButton>
                <IconButton
                    id={id+'_lastPage'}
                    onClick={this.handleLastPageButtonClick}
                    disabled={page >= Math.ceil(count / rowsPerPage) - 1}
                    aria-label="Last Page"
                >
                    <LastPageIcon />
                </IconButton>
            </div>
        );
    }
}

TablePaginationActions.propTypes = {
    count: PropTypes.number.isRequired,
    onChangePage: PropTypes.func.isRequired,
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired
};

export default withStyles(useStyles1)(TablePaginationActions);