import * as commonUtilities from '../../../../../utilities/commonUtilities';

const sysRatio = commonUtilities.getSystemRatio();
const unit = commonUtilities.getResizeUnit(sysRatio);

export default {
    selectIcon: {
        top: `calc(50% - ${(1.5 * unit) / 2}rem)`
    }
};