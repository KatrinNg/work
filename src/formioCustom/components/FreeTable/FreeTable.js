import _ from 'lodash';
import BuilderUtils from 'formiojs/utils/builder';
import NestedComponent from 'formiojs/components/_classes/nested/NestedComponent';
import editForm from './FreeTable.form';

const getStyleVal = (elm, css) => {
  return window.getComputedStyle(elm, null).getPropertyValue(css);
};

export default class FreeTableComponent extends NestedComponent {
  static emptyTable(numRows, numCols) {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
      const cols = [];
      for (let j = 0; j < numCols; j++) {
        cols.push({ components: [] });
      }
      rows.push(cols);
    }
    return rows;
  }

  static schema(...extend) {
    return NestedComponent.schema({
      label: 'Free Table',
      type: 'freetable',
      input: false,
      key: 'freetable',
      attrs: [],
      styles: [
        { attr: 'width', value: '100%' },
        { attr: 'height', value: '100%' }
      ],
      numRows: 5,
      numCols: 5,
      rows: FreeTableComponent.emptyTable(5, 5),
      rowHeights: [],
      colWidths: [],
      caption: '',
      cloneRows: false,
      striped: false,
      bordered: false,
      hover: false,
      condensed: false,
      padding: false,
      persistent: false
    }, ...extend);
  }

  static get builderInfo() {
    return {
      title: 'Free Table',
      group: 'custom',
      icon: 'table',
      weight: 5,
      // documentation: 'http://help.form.io/userguide/#table',
      schema: FreeTableComponent.schema()
    };
  }

  static editForm = editForm;

  get defaultSchema() {
    return FreeTableComponent.schema();
  }

  get schema() {
    const schema = _.omit(super.schema, 'components');
    schema.rows = [];
    this.eachComponent((component) => {
      if (!schema.rows || !schema.rows.length) {
        schema.rows = FreeTableComponent.emptyTable(this.component.numRows, this.component.numCols);
      }
      if (!schema.rows[component.tableRow]) {
        schema.rows[component.tableRow] = [];
      }
      if (!schema.rows[component.tableRow][component.tableColumn]) {
        schema.rows[component.tableRow][component.column] = { components: [] };
      }
      schema.rows[component.tableRow][component.tableColumn].components.push(component.schema);
    });
    if (!schema.rows.length) {
      schema.rows = FreeTableComponent.emptyTable(this.component.numRows, this.component.numCols);
    }
    return schema;
  }

  get className() {
    let name = `freetable ${super.className}`;
    if (!this.component.bordered) {
      name += ' no-top-border-table';
    }
    return name;
  }

  get cellClassName() {
    let name = '';
    if (this.component.cellAlignment) {
      name = `cell-align-${this.component.cellAlignment}`;
    }
    return name;
  }

  get tableKey() {
    return `table-${this.key}`;
  }

  constructor(...args) {
    super(...args);
    this.noField = true;

    // window.d = {...window.d};
  }

  init() {
    super.init();
    // Ensure component.rows has the correct number of rows and columns.
    for (let rowIndex = 0; rowIndex < this.component.numRows; rowIndex++) {
      this.component.rows[rowIndex] = this.component.rows[rowIndex] || [];
      for (let colIndex = 0; colIndex < this.component.numCols; colIndex++) {
        this.component.rows[rowIndex][colIndex] = this.component.rows[rowIndex][colIndex] || { components: [] };
      }
      this.component.rows[rowIndex] = this.component.rows[rowIndex].slice(0, this.component.numCols);
    }
    this.component.rows = this.component.rows.slice(0, this.component.numRows);

    const lastNonEmptyRow = [];
    this.table = [];
    _.each(this.component.rows, (row, rowIndex) => {
      this.table[rowIndex] = [];
      _.each(row, (column, colIndex) => {
        this.table[rowIndex][colIndex] = [];
        if (this.component.cloneRows) {
          if (column.components.length) {
            lastNonEmptyRow[colIndex] = column;
          }
          else if (lastNonEmptyRow[colIndex]) {
            column.components = _.cloneDeep(lastNonEmptyRow[colIndex].components);
            BuilderUtils.uniquify(this.root._form.components, column);
          }
        }
        _.each(column.components, (comp) => {
          const component = this.createComponent(comp);
          component.tableRow = rowIndex;
          component.tableColumn = colIndex;
          this.table[rowIndex][colIndex].push(component);
        });
      });
    });
  }

  render() {
    // const submission = _.get(this.root, 'submission', {});
    return super.render(this.renderTemplate('freetable', {
      cellClassName: this.cellClassName,
      attrs: (this.component.attrs || []).map((attr) => {
        return {
          attr: attr.attr,
          value: attr.value
        };
      }),
      styles: (this.component.styles || []).map((style) => {
        return {
          attr: style.attr,
          value: style.value
        };
      }),
      numCols: this.component.numCols,
      numRows: this.component.numRows,
      rowHeights: this.component.rowHeights.reduce((acc, cur) => (acc[cur.index] = cur.value, acc), {}),
      colWidths: this.component.colWidths.reduce((acc, cur) => (acc[cur.index] = cur.value, acc), {}),
      rootId: this.root.id,
      tableKey: this.tableKey,
      tableComponents: this.table.map(row =>
        row.map(column =>
          this.renderComponents(column)
        )
      )
    }));
  }

  attach(element) {
    const keys = this.table.reduce((prev, row, rowIndex) => {
      prev[`${this.tableKey}-${rowIndex}`] = 'multiple';
      return prev;
    }, {});
    this.loadRefs(element, keys);
    const superAttach = super.attach(element);
    this.table.forEach((row, rowIndex) => {
      row.forEach((column, columnIndex) => {
        this.attachComponents(this.refs[`${this.tableKey}-${rowIndex}`][columnIndex], this.table[rowIndex][columnIndex], this.component.rows[rowIndex][columnIndex].components);
      });
    });
    this.tableElement = this.builderMode ? element.children[1].children[0] : element.children[0];
    // window.d[this.builderMode ? 'bi' : 'fi'] = this;
    // window.d[this.builderMode ? 'bt' : 'ft'] = this.tableElement;
    if (this.builderMode) {
      this.resizableGridObj = this.resizableGrid(this.tableElement, {
        updateWidthHeight: this.updateWidthHeight,
        refreshCellsBoundaries: this.refreshCellsBoundaries,
        cellAction: this.cellAction
      });
    }
    return superAttach;
  }

  destroy(all) {
    super.destroy(all);
    // delete window.d[this.builderMode ? 'bi' : 'fi'];
    // delete window.d[this.builderMode ? 'bt' : 'ft'];
    if (this.builderMode) {
      this.resizableGridObj.destroy();
      this.resizableGridObj = undefined;
    }
    this.tableElement = undefined;
    delete this.table;
  }

  updateWidthHeight = (colWidths, rowHeights) => {
    this.component.colWidths = colWidths;
    this.component.rowHeights = rowHeights;
    // console.log(this.builderMode ? 'builder' : 'form', this.root.id, this.component.colWidths, this.component.rowHeights);
    // this.emit('updateComponent');
  }

  refreshCellsBoundaries = () => {
    if (!this.component.colWidths ||
      !this.component.rowHeights ||
      this.component.colWidths.filter(x => x.value).length !== this.component.numCols ||
      this.component.rowHeights.filter(x => x.value).length !== this.component.numRows) {
      this.component.colWidths = [];
      this.component.rowHeights = [];
      let tbody = this.tableElement.children[0];
      for (let r = 0; r < this.component.numRows; ++r) {
        for (let c = 0; c < this.component.numCols; ++c) {
          let td = tbody.children[r].children[c];
          let w = getStyleVal(td, 'width');
          let h = getStyleVal(td, 'height');
          td.style.width = w;
          td.style.height = h;
          let colWidth = this.component.colWidths.find(x => x.index === c);
          if (!colWidth) {
            this.component.colWidths.push({ index: c, value: w });
          } else {
            colWidth.value = w;
          }
          let rowHeight = this.component.rowHeights.find(x => x.index === r);
          if (!rowHeight) {
            this.component.rowHeights.push({ index: r, value: h });
          } else {
            rowHeight.value = h;
          }
        }
      }
    }
  }

  cellAction = (action, params) => {
    this[action](params);
  }

  splitRow = ({ rowIndex }) => {
    let curr = this.component.rowHeights.find(x => x.index === rowIndex) || { index: rowIndex };
    let h = parseInt(curr.value);
    this.component.numRows++;
    this.component.rows.splice(rowIndex, 0, Array(this.component.numCols).fill().map(() => ({ components: [] })));
    this.table.splice(rowIndex, 0, Array(this.component.numCols).fill().map(() => []));
    // this.component.rowHeights[rowIndex] = h / 2 + 'px';
    // this.component.rowHeights.splice(rowIndex, 0, h / 2 + 'px');
    for (let i = this.component.numRows - 1; i > rowIndex + 1; --i) {
      let prev = this.component.rowHeights.find(x => x.index === i - 1) || { index: i - 1 };
      let next = this.component.rowHeights.find(x => x.index === i) || { index: i };
      next.value = prev.value;
    }
    let prev = this.component.rowHeights.find(x => x.index === rowIndex) || { index: rowIndex };
    let next = this.component.rowHeights.find(x => x.index === rowIndex + 1) || { index: rowIndex + 1 };
    prev.value = h / 2 + 'px';
    next.value = h / 2 + 'px';
    this.triggerRedraw();
  }

  splitColumn = ({ colIndex }) => {
    let curr = this.component.colWidths.find(x => x.index === colIndex) || { index: colIndex };
    let w = parseInt(curr.value);
    this.component.numCols++;
    for (let i = 0; i < this.component.numRows; ++i) {
      this.component.rows[i].splice(colIndex, 0, { components: [] });
      this.table[i].splice(colIndex, 0, []);
    }
    // this.component.colWidths[colIndex] = w / 2 + 'px';
    // this.component.colWidths.splice(colIndex, 0, w / 2 + 'px');
    for (let i = this.component.numCols - 1; i > colIndex + 1; --i) {
      let prev = this.component.colWidths.find(x => x.index === i - 1) || { index: i - 1 };
      let next = this.component.colWidths.find(x => x.index === i) || { index: i };
      next.value = prev.value;
    }
    let prev = this.component.colWidths.find(x => x.index === colIndex) || { index: colIndex };
    let next = this.component.colWidths.find(x => x.index === colIndex + 1) || { index: colIndex + 1 };
    prev.value = w / 2 + 'px';
    next.value = w / 2 + 'px';
    this.triggerRedraw();
  }

  removeRow = ({ rowIndex }) => {
    if (this.component.numRows <= 1)
      return;
    this.component.numRows--;
    this.component.rows.splice(rowIndex, 1);
    this.table.splice(rowIndex, 1);
    this.triggerRedraw();
  }

  removeColumn = ({ colIndex }) => {
    if (this.component.numCols <= 1)
      return;
    this.component.numCols--;
    for (let i = 0; i < this.component.numRows; ++i) {
      this.component.rows[i].splice(colIndex, 1);
      this.table[i].splice(colIndex, 1);
    }
    this.triggerRedraw();
  }

  resizableGrid = (table, callback) => {
    if (this.builderMode) {
      let key = this.root.id + '-' + this.id;
      let menu = document.getElementById('context-menu-' + key);

      for (let i = 0; i < menu.childElementCount; ++i) {
        let anchor = menu.children[i];
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          const { colIndex, rowIndex } = menu.dataset;
          hideMenu(menu);
          if (callback && callback.cellAction)
            callback.cellAction(anchor.dataset.action, { key, colIndex, rowIndex });
        });
      }

      document.addEventListener('click', function (e) {
        hideAllMenu();
      });

      document.addEventListener('contextmenu', function (e) {
        hideAllMenu();
      });

      let tbody = table.children[0];
      for (let y = 0; y < tbody.childElementCount; ++y) {
        let tr = tbody.children[y];
        for (let x = 0; x < tr.childElementCount; ++x) {
          let td = tr.children[x];
          td.addEventListener('contextmenu', function (e) {
            e.preventDefault();
            e.stopPropagation();
            hideAllMenu();
            let rect = table.getBoundingClientRect();
            showMenu(menu, x, y, e.clientX - rect.x, e.clientY - rect.y);
          });
        }
      }
    }

    function showMenu(_menu, colIndex, rowIndex, clickX, clickY) {
      _menu.dataset.colIndex = colIndex;
      _menu.dataset.rowIndex = rowIndex;
      _menu.style.display = 'block';
      _menu.style.top = `${clickY}px`;
      _menu.style.left = `${clickX}px`;
    }

    function hideMenu(_menu) {
      _menu.dataset.colIndex = undefined;
      _menu.dataset.rowIndex = undefined;
      _menu.style.display = '';
      _menu.style.top = '';
      _menu.style.left = '';
    }

    function hideAllMenu() {
      let menus = document.getElementsByClassName('freetableDropDownMenu');
      for (let i = 0; i < menus.length; ++i) {
        hideMenu(menus[i]);
      }
    }

    window.addResizeListener(table, onResize);

    function onResize(e) {
      // console.log(e);
      setSliderLength();
    }

    let vertDivs = table.getElementsByClassName('vert-' + this.root.id + '-' + this.id);
    for (let i = 0; i < vertDivs.length; ++i) {
      setDivListeners(vertDivs[i], 'v');
    }

    let horiDivs = table.getElementsByClassName('hori-' + this.root.id + '-' + this.id);
    for (let i = 0; i < horiDivs.length; ++i) {
      setDivListeners(horiDivs[i], 'h');
    }

    if (callback && callback.refreshCellsBoundaries)
      callback.refreshCellsBoundaries();
    setSliderLength();

    function setCellLength(dir, currIndex, nextIndex, newCurrValue, newNextValue) {
      let tbody = table.children[0];
      let { numCols, numRows } = table.dataset;
      let length = dir === 'h' ? 'height' : 'width';

      if (dir === 'h') {
        for (let c = 0; c < numCols; ++c) {
          tbody.children[currIndex].children[c].style[length] = newCurrValue;
          if (newNextValue !== undefined) {
            tbody.children[nextIndex].children[c].style[length] = newNextValue;
          }
        }
      }
      else {
        for (let r = 0; r < numRows; ++r) {
          tbody.children[r].children[currIndex].style[length] = newCurrValue;
          if (newNextValue !== undefined) {
            tbody.children[r].children[nextIndex].style[length] = newNextValue;
          }
        }
      }
    }

    function setSliderLength() {
      for (let i = 0; i < vertDivs.length; ++i) {
        let div = vertDivs[i];
        div.style.height = table.offsetHeight + 'px';
      }

      for (let i = 0; i < horiDivs.length; ++i) {
        let div = horiDivs[i];
        div.style.width = table.offsetWidth + 'px';
      }
    }

    function setDivListeners(div, dir) {
      let pos, curr, next, currIndex, nextIndex, currValue, nextValue, moving;
      const { colIndex, rowIndex } = div.dataset;

      div.addEventListener('mousedown', function (e) {
        moving = true;
        curr = e.target.parentElement;
        currIndex = parseInt(dir === 'h' ? rowIndex : colIndex);
        if (dir === 'h') {
          next = curr.parentElement.nextElementSibling
            && curr.parentElement.nextElementSibling.children[0];
          pos = e.pageY;
        }
        else {
          next = curr.nextElementSibling;
          pos = e.pageX;
        }
        if (next)
          nextIndex = currIndex + 1;

        let padding = paddingDiff(curr, dir);

        let length = dir === 'h' ? 'offsetHeight' : 'offsetWidth';
        currValue = curr[length] - padding;
        if (next) nextValue = next[length] - padding;

        e.stopPropagation();
      });

      div.addEventListener('mouseover', function (e) {
        if (dir === 'h')
          e.target.style.borderBottom = '4px solid #ff0000';
        else
          e.target.style.borderRight = '4px solid #0000ff';
      });

      div.addEventListener('mouseout', function (e) {
        if (dir === 'h')
          e.target.style.borderBottom = '';
        else
          e.target.style.borderRight = '';
      });

      document.addEventListener('mousemove', function (e) {
        if (curr) {
          let diff = (dir === 'h' ? e.pageY : e.pageX) - pos;
          let newCurrValue;
          let newNextValue;

          if (next) {
            // next.style[length] = nextValue - diff + "px";
            newNextValue = nextValue - diff + 'px';
          }

          // curr.style[length] = currValue + diff + "px";
          newCurrValue = currValue + diff + 'px';

          setCellLength(dir, currIndex, nextIndex, newCurrValue, newNextValue);
        }
      });

      document.addEventListener('mouseup', function (e) {
        pos = undefined;
        curr = undefined;
        next = undefined;
        currIndex = undefined;
        nextIndex = undefined;
        currValue = undefined;
        nextValue = undefined;

        if (moving) {
          updateWidthHeight();
          moving = undefined;
        }
      });
    }

    function paddingDiff(elm, dir) {
      if (getStyleVal(elm, 'box-sizing') === 'border-box') {
        return 0;
      }

      let padBegin = getStyleVal(elm, dir === 'h' ? 'padding-top' : 'padding-left');
      let padEnd = getStyleVal(elm, dir === 'h' ? 'padding-bottom' : 'padding-right');
      return parseInt(padBegin, 10) + parseInt(padEnd, 10);
    }

    function updateWidthHeight() {
      let colWidths = [];
      for (let i = 0; i < vertDivs.length; ++i) {
        let div = vertDivs[i].parentElement;
        // console.log(i, div, getStyleVal(div, 'width'));
        colWidths.push({ index: i, value: getStyleVal(div, 'width') });
      }

      let rowHeights = [];
      for (let i = 0; i < horiDivs.length; ++i) {
        let div = horiDivs[i].parentElement;
        // console.log(i, div, getStyleVal(div, 'height'));
        rowHeights.push({ index: i, value: getStyleVal(div, 'height') });
      }

      if (callback?.updateWidthHeight)
        callback.updateWidthHeight(colWidths, rowHeights);
    }

    return {
      destroy: () => {
        window.removeResizeListener(table, onResize);
      }
    };
  };
}
