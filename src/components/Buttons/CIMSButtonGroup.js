
import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Tooltip } from '@material-ui/core';
import CIMSButton from './CIMSButton';

const style = () => ({
    leftFooter: {
        position: 'fixed',
        left: 10,
        // bottom: 10,
        bottom: 2,
        width: 'auto',
        zIndex: 999,
        padding: '5px 10px'
    },
    rightFooter: {
        position: 'fixed',
        right: 10,
        // bottom: 10,
        bottom: 2,
        width: 'auto',
        zIndex: 999,
        padding: '5px 10px'
    }
});

class CIMSButtonGroup extends Component {
    render() {
        const { buttonConfig, isLeft, classes, customStyle } = this.props;
        return (
            <Grid container className={isLeft ? classes.leftFooter : classes.rightFooter} style={customStyle ? customStyle : null}>
                {
                    buttonConfig && buttonConfig.map(item => {
                        if (item.type && item.type !== 'submit') {
                            return item;
                        } else {
                            let { id, name, ...rest } = item;
                            return (
                                <Tooltip title={name === 'Next PMI Reg' ? 'Create next PMI on same Family No.' : ''}>
                                    <CIMSButton
                                        id={id}
                                        key={id}
                                        children={name}
                                        {...rest}
                                        // size={'small'}
                                    />
                                </Tooltip>
                            );
                        }
                    })
                }
            </Grid>
        );

    }
}

export default withStyles(style)(CIMSButtonGroup);
