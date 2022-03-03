import React from 'react';
import {withStyles} from '@material-ui/core/styles';

const styles={
    markLayer:{
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1200,
        position: 'absolute'
    }
};

class MarkLayer extends React.Component{
    render(){
        const { classes,open, ...rest } = this.props;
        return(
            <div style={{ display: open ? 'block' : 'none' }} className={classes.markLayer} {...rest}></div>
        );
    }
}

export default withStyles(styles)(MarkLayer);