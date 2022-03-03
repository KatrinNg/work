import * as commonUtilities from '../../../utilities/commonUtilities';
import palette from '../../palette';
const sysRatio = commonUtilities.getSystemRatio();
const unit = commonUtilities.getResizeUnit(sysRatio);

export default {
    root: {
        // height: 39 * unit,
        lineHeight: 'inherit',
        fontSize: '1rem',
        backgroundColor:palette.cimsBackgroundColor,
        color:palette.cimsTextColor,
        '&$disabled':{
            backgroundColor:palette.cimsDisableColor
        }
    },
    input: {
        // padding: '8px 14px',
        padding: '0px 14px',
        height: 39 * unit
        //fontSize
    }
};