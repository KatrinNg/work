import * as commonUtilities from '../../../../../utilities/commonUtilities';

const sysRatio = commonUtilities.getSystemRatio();
const unit = commonUtilities.getResizeUnit(sysRatio);

export default {
    outlined: {
        zIndex: 0,
        transform: `translate(14px, ${10.5 * unit}px) scale(1)`,
        '&$shrink': {
            transform: 'translate(14px, -6px) scale(1)',
            zIndex: 1,
            padding: '0px 4px',
            fontSize: 12,
            backgroundColor: 'white'
        }
    }
};