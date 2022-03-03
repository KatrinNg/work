import * as commonUtilities from '../../../../../utilities/commonUtilities';
import palette from '../../palette';

const sysRatio = commonUtilities.getSystemRatio();
const unit = commonUtilities.getResizeUnit(sysRatio);

export default {
    head: {
        height: 40 * unit
    },
    root: {
        height: 50 * unit,
        '&$selected, &$selected:hover': {
            backgroundColor: palette.tableSelectedBackground
        }
    },
    footer: {
        border: '1px solid rgba(224, 224, 224, 1)'
    }
};