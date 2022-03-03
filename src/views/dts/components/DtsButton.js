import React, { Component } from 'react';
import { withStyles, Button } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import ReceiptIcon from '@material-ui/icons/Receipt';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import RefreshIcon from '@material-ui/icons/Refresh';
import TodayIcon from '@material-ui/icons/Today';
import BookmarkIcon from '@material-ui/icons/Bookmark';
import EditIcon from '@material-ui/icons/Edit';

const styles = theme => ({
    root: {
        textTransform: 'none',
        fontWeight: 400,
        fontFamily: 'Microsoft JhengHei, Calibri',
        borderRadius: '25px',
        color: '#ffffff',
        backgroundColor: '#64aeed',
        '&:hover': {
            backgroundColor:'#306c9e',
            '@media (hover: none)': {
                backgroundColor: 'transparent'
            }
        }
    },
    sizeSmall: {
        margin: theme.spacing(1),
        padding: '4px 12px'
    },
    sizeLarge: {
        margin: theme.spacing(1),
        padding: '8px 24px'
        //fontSize: '0.6rem'
    },
    label: {
        // fontSize: '0.5rem'
    },
    disabled: {
        borderColor: theme.palette.action.disabledBackground
    }
});

class DtsButton extends Component {
    static defaultProps = {
        icon : ''
    }

    render() {
        const { classes, icon, iconType, ...rest } = this.props;
        // const btnColor = color ? color : 'primary';
        const btnColor = '#306c9e';
        if (this.props.display === false) {
            return null;
        }

        return (
            <Button
                disableFocusRipple
                classes={{
                    root: classes.root,
                    label: classes.label,
                    disabled: classes.disabled,
                    sizeSmall: classes.sizeSmall,
                    sizeLarge: classes.sizeLarge
                }}
                variant="contained"
                // color="primary"
                color={btnColor}
                size="small"
                {...rest}
            >
            {
                (iconType == 'SEARCH') ? <SearchIcon/> :
                (iconType == 'TODAY') ? <TodayIcon/> :
                (iconType == 'RECEIPT') ? <ReceiptIcon/> :
                (iconType == 'SKIPNEXT') ? <SkipNextIcon/> :
                (iconType == 'REFRESH') ? <RefreshIcon/> :
                (iconType == 'BOOKMARK') ? <BookmarkIcon/> :
                (iconType == 'EDIT') ? <EditIcon/> :
                icon
            }{this.props.children}</Button>
        );
    }
}

export default withStyles(styles)(DtsButton);