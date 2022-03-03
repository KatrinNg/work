import _ from 'lodash';
import memoize from 'memoize-one';

export const isSelf = memoize((loginId, userId) => {
    if (loginId && userId && _.toString(loginId) === _.toString(userId)) {
        return true;
    } else {
        return false;
    }
});