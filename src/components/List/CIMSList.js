import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import _ from 'lodash';

const styles = theme => ({
    list: {},
    listItem: {}
});

class CIMSList extends React.Component{
    constructor(props){
        super(props);
    }

    handleListItemClick = (event, index) => {
        const { selectedIndex, onListItemClick } = this.props;
        if(typeof selectedIndex === 'string'){
            if(selectedIndex === index){
                onListItemClick && onListItemClick(event, '');
            } else {
                onListItemClick && onListItemClick(event, index);
            }
        } else if(Array.isArray) {
            if(selectedIndex.indexOf(index) > -1){
                const i = selectedIndex.indexOf(index);
                onListItemClick && onListItemClick(event, _.cloneDeep(selectedIndex).splice(i, 1));
            } else {
                onListItemClick && onListItemClick(event, _.cloneDeep(selectedIndex).push(index));
            }
        }
    }

    isSelected = (index) => {
        const { selectedIndex } = this.props;
        if(typeof selectedIndex === 'string'){
            return selectedIndex === index;
        } else {
            return selectedIndex.indexOf(index) > -1;
        }
    }

    render() {
        const {
            classes,
            data,
            ListProps,
            ListItemProps,
            renderChild,
            id,
            disabled
        } = this.props;
        return (
            <List
                id={`${id}_list`}
                className={classes.list}
                {...ListProps}
            >
                {data && data.map((item, index) => (
                    <ListItem
                        id={`${id}_listItem${index}`}
                        disabled={disabled}
                        key={index}
                        className={classes.listItem}
                        selected={this.isSelected(_.toString(index))}
                        onClick={event => this.handleListItemClick(event, _.toString(index))}
                        {...ListItemProps}
                    >{renderChild(item, index)}</ListItem>
                ))}
            </List>
        );
    }
}

CIMSList.propTypes = {
    data: PropTypes.array,
    selectedIndex: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.string
    ]),
    onListItemClick: PropTypes.func,
    ListItemProps: PropTypes.object,
    ListProps: PropTypes.object,
    renderChildren: PropTypes.func
};

export default withStyles(styles)(CIMSList);