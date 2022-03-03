import { getState } from '../../../../../store/util';
const { color, font } = getState((state) => state.cimsStyle) || {};

export const styles = () => ({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkBoxGroup: {
    display: 'initial'
  },
  formControlLabel: {
    margin: 0
  },
  checkBoxRoot: {
    padding: 0
  }
});
