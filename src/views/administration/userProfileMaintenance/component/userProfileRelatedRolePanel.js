import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import CIMSTable from '../../../../components/Table/CIMSTable';
import Palette from '../../../../theme/palette';
import * as CommmonUtilities from '../../../../utilities/commonUtilities';

const styles = (theme) => ({
    root: {
        width: '100%',
        display: 'flex',
        height: '100%',
        paddingTop: 10,
        flexFlow: 'column'
    },
    tableRoot: {
        marginTop: theme.spacing(1)
    },
    dateInput: {
        marginLeft: 20
    },
    customTableHeader: Palette.defaultTableHeader,
    customTableHeaderCell: Palette.customTableHeaderCell
});

function genTableHeader(serviceList) {
    let serviceRender = (value, rowData) => {
        return CommmonUtilities.getServiceNameByServiceCd(value, serviceList);
    };
    let rows = [
        {
            name: 'serviceCd',
            label: 'Service',
            width: 105,
            customBodyRender: serviceRender
        },
        {
            name: 'userRoleName',
            label: 'User Role Name',
            width: 105
        },
        {
            name: 'userRoleDesc',
            label: 'User Role Description',
            width: 105
        }
    ];
    return rows;
}

class UserProfileRelatedRolePanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tableRows: genTableHeader(this.props.serviceList),
            tableOptions: {
                rowExpand: true,
                rowsPerPage: 10,
                rowsPerPageOptions: [5, 10, 15],
                headCellStyle: this.props.classes.customTableHeader,
                headRowStyle: this.props.classes.customTableHeaderCell
            }
        };
    }
    render() {
        const { userRelatedRoleData } = this.props;
        let id = this.props.id ? this.props.id : 'user_profile_related_role_panel';
        return (
            <CIMSTable
                id={`${id}_table`}
                innerRef={ref => this.tableRef = ref}
                rows={this.state.tableRows}
                options={this.state.tableOptions}
                data={userRelatedRoleData || null}
            />
        );
    }
}



export default withStyles(styles)(UserProfileRelatedRolePanel);
