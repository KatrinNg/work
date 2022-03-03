import * as commonUtilities from '../../../utilities/commonUtilities';

const sysRatio = commonUtilities.getSystemRatio();
const unit = commonUtilities.getResizeUnit(sysRatio);

export default {
    root: {
        // fontSize: `${unit}rem`
        fontSize: '1rem',
        width: `${1.5 * unit}rem`,
        height: `${1.5 * unit}rem`
    }
};