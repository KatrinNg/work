import React, { Component } from 'react';
import TableCell from '@material-ui/core/TableCell';

class CIMSTableCell extends Component {
    render() {
        const { ...rest } = this.props;
        return (
            <TableCell
                {...rest}
                title={typeof this.props.children === 'string' ? this.props.children : ''}
            >{this.props.children}</TableCell>
        );
    }
}

export default CIMSTableCell;