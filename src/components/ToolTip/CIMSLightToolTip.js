import { Tooltip } from '@material-ui/core';
import {withStyles } from '@material-ui/core/styles';

const LightTooltip = withStyles((theme) => ({
    tooltip: {
        backgroundColor: '#ffffff',
        color: 'rgba(0, 0, 0, 0.87)',
        boxShadow: theme.shadows[1],
        fontSize: '1em',
        marginTop: 5
    }
}))(Tooltip);

// const CIMSLightTooltip = (props) => {
//     const { title, children } = props;
//     return (
//         <LightTooltip
//             title={title}
//         >
//             {children}
//         </LightTooltip>
//     );
// };


// export default CIMSLightTooltip;
export default LightTooltip;