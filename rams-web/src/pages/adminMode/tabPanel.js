import React from 'react'
import PropTypes from 'prop-types';

const TabPanel = (props)=> {
    const { children, value, index, ...other } = props;

    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.any.isRequired,
        value: PropTypes.any.isRequired,
    };

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            style={{height:'100%'}}
            {...other}
        >
            {value === index &&  children}
        </div>
    );
}

export default TabPanel
