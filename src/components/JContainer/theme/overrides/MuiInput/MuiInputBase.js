import * as commonUtilities from '../../../../../utilities/commonUtilities';

const sysRatio = commonUtilities.getSystemRatio();
const unit = commonUtilities.getResizeUnit(sysRatio);

export default {
    root: {
        // height: 39 * unit,
        lineHeight: 'inherit',
        fontSize: '1rem'
    },
    input: {
        // padding: '8px 14px',
        padding: '0px 14px',
        height: 39 * unit
        //fontSize
    }
};