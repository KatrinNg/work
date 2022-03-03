import * as commonUtilities from '../../../utilities/commonUtilities';
import palette from '../../palette';

const sysRatio = commonUtilities.getSystemRatio();
const unit = commonUtilities.getResizeUnit(sysRatio);

export default {
    outlined: {
        zIndex: 1,
        transform: `translate(14px, ${10.5 * unit}px) scale(1)`,
        color:palette.cimsPlaceholderColor,
        '&$shrink': {
            transform: 'translate(14px, -6px) scale(1)',
            zIndex: 1,
            padding: '0px 4px',
            fontSize: 12,
            backgroundColor: palette.cimsBackgroundColor,
            color:palette.cimsLabelColor
        }
    }
};