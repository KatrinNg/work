import { createMuiTheme } from '@material-ui/core';

import palette from './palette';
import typography from './typography';
import overrides from './overrides';
import zIndex from './zIndex';

const theme = createMuiTheme({
  palette,
  typography,
  zIndex,
  overrides
});

export default theme;
