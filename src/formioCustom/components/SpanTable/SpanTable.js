import _ from 'lodash';
import BuilderUtils from 'formiojs/utils/builder';
import NestedComponent from 'formiojs/components/_classes/nested/NestedComponent';
import editForm from './SpanTable.form';

export default class SpanTableComponent extends NestedComponent {
    static emptyTable(numRows, numCols) {
        const rows = [];
        for (let i = 0; i < numRows; i++) {
            const cols = [];
            for (let j = 0; j < numCols; j++) {
                cols.push({components: []});
            }
            rows.push(cols);
        }
        return rows;
    }

    static schema(...extend) {
        return NestedComponent.schema({
            label: 'Span Table',
            type: 'spanTable',
            input: false,
            key: 'spanTable',
            numRows: 3,
            numCols: 3,
            rows: SpanTableComponent.emptyTable(3, 3),
            header: [],
            caption: '',
            cloneRows: false,
            striped: false,
            bordered: false,
            hover: false,
            condensed: false,
            persistent: false,
            allTd: [],
            spanStep: []
        }, ...extend);
    }

    static get builderInfo() {
        return {
            title: 'Span Table',
            group: 'custom',
            icon: 'table',
            weight: 40,
            documentation: 'http://help.form.io/userguide/#table',
            schema: SpanTableComponent.schema()
        };
    }

    static editForm = editForm;

    get defaultSchema() {
        return SpanTableComponent.schema();
    }

    get schema() {
        const schema = _.omit(super.schema, 'components');
        schema.rows = [];
        this.eachComponent((component) => {
            if (!schema.rows || !schema.rows.length) {
                schema.rows = SpanTableComponent.emptyTable(this.component.numRows, this.component.numCols);
            }
            if (!schema.rows[component.tableRow]) {
                schema.rows[component.tableRow] = [];
            }
            if (!schema.rows[component.tableRow][component.tableColumn]) {
                schema.rows[component.tableRow][component.column] = {components: []};
            }
            schema.rows[component.tableRow][component.tableColumn].components.push(component.schema);
        });
        if (!schema.rows.length) {
            schema.rows = SpanTableComponent.emptyTable(this.component.numRows, this.component.numCols);
        }
        return schema;
    }

    get className() {
        let name = `table-responsive ${super.className}`;
        if (!this.component.bordered) {
            name += ' no-top-border-table';
        }
        return name;
    }

    get cellClassName() {
/*        let name = '';
        if (this.component.cellAlignment) {
            name = `cell-align-${this.component.cellAlignment}`;
        }
        return name;*/

        return `spanTableCell-${this.id}`;
    }

    get tableKey() {
        return `table-${this.key}`;
    }

    constructor(...args) {
        super(...args);
        this.noField = true;
    }

    init() {
        super.init();
        // Ensure component.rows has the correct number of rows and columns.
        for (let rowIndex = 0; rowIndex < this.component.numRows; rowIndex++) {
            this.component.rows[rowIndex] = this.component.rows[rowIndex] || [];
            for (let colIndex = 0; colIndex < this.component.numCols; colIndex++) {
                this.component.rows[rowIndex][colIndex] = this.component.rows[rowIndex][colIndex] || {components: []};
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
                    } else if (lastNonEmptyRow[colIndex]) {
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
        return super.render(this.renderTemplate('spanTable', {
            cellClassName: this.cellClassName,
            tableKey: this.tableKey,
            tableComponents: this.table.map(row =>
                row.map(column =>
                    this.renderComponents(column)
                )
            ),
            rootId: this.root.id,
            id: this.id
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

        this.customSpanTableObj = this.customSpanTable(element);

        return superAttach;
    }

    destroy(all) {
        super.destroy(all);

        if (this.builderMode) {
            this.customSpanTableObj.destroy();
        }

        delete this.table;
    }

    customSpanTable = (element) => {
        let {
            numRows,
            numCols,
            allTd,
            spanStep
        } = this.component;
        const spanTable = element.querySelector(`.spanTable-${this.id}`);
        const spanMenu = element.querySelector('.dropdown-menu');
        const rowSpanBtn = spanMenu.querySelector('.rowSpanBtn');
        const colSpanBtn = spanMenu.querySelector('.colSpanBtn');
        const resetSpanBtn = spanMenu.querySelector('.resetSpanBtn');

        let selectedTdIndex = null;

        allTd = spanTable.querySelectorAll(`.spanTableCell-${this.id}`);

        const showHideMenu = (spanMenu, isShow = false, event = null) => {
            const spanTableRect = spanTable.getBoundingClientRect();

            spanMenu.style.top = isShow ? event.bottom - spanTableRect.y + 'px' : 'auto';
            spanMenu.style.left = isShow ? event.x - spanTableRect.x + 'px' : 'auto';
            spanMenu.style.display = isShow ? 'block' : 'none';
        };

        const handleRowColSpan = (index, isRowSpan = false) => {
            const targetTd = allTd[index];

            if (targetTd) {
                const span = isRowSpan ? targetTd.rowSpan + (targetTd.rowSpan < numRows ? 1 : 0) : targetTd.colSpan + (targetTd.colSpan < numCols ? 1 : 0);

                isRowSpan ? targetTd.rowSpan = span : targetTd.colSpan = span;

                handleRowColOutOfTable();

                if (!spanStep.find(item => item.index === index && item.isRowSpan === isRowSpan && item.span === (isRowSpan ? targetTd.rowSpan : targetTd.colSpan))) {
                    spanStep.push({
                        index: index,
                        span: span,
                        isRowSpan: isRowSpan
                    });
                }
            }
        };

        const handleResetRowColSpan = (index) => {
            allTd[index].rowSpan = 1;
            allTd[index].colSpan = 1;

            handleRowColOutOfTable();

            this.component.spanStep = spanStep.filter(item => !(item.index === index));
        };

        const handleRowColOutOfTable = () => {
            // reset all col to table-cell before handle out of range col
            allTd.forEach((ele, index) => {
                ele.style.display = 'table-cell';
            });

            // handle all colSpan out of table
            allTd.forEach((ele, index) => {
                if (ele.colSpan > 1) {
                    let colSpan = ele.colSpan;

                    while (colSpan > 1) {
                        colSpan--;

                        const currentTd = allTd[index + colSpan];

                        if (currentTd) {
                            currentTd.style.display = 'none';
                            currentTd.colSpan = 1;
                            currentTd.rowSpan = 1;
                        }
                    }
                }
            });

            // handle all rowSpan out of table
            allTd.forEach((ele, index) => {
                if (ele.rowSpan > 1) {
                    let rowSpan = ele.rowSpan;

                    while (rowSpan > 1) {
                        rowSpan--;

                        let colSpan = ele.colSpan;

                        while (colSpan > 0) {
                            colSpan--;

                            const currentTd = allTd[index + (rowSpan * this.component.numCols) + colSpan];

                            if (currentTd) {
                                currentTd.style.display = 'none';
                                currentTd.colSpan = 1;
                                currentTd.rowSpan = 1;
                            }
                        }
                    }
                }
            });
        };

        const eventListenerShowHideMenu = (event) => {
            showHideMenu(spanMenu, false);
        };

        const eventListenerHandleRowSpan = (event) => {
            handleRowColSpan(selectedTdIndex, true);
        };

        const eventListenerHandleColColSpan = (event) => {
            handleRowColSpan(selectedTdIndex, false);
        };

        const eventListenerHandleResetSpan = (event) => {
            handleResetRowColSpan(selectedTdIndex);
        };

        if (this.builderMode) {
            document.addEventListener('click', eventListenerShowHideMenu);

            rowSpanBtn.addEventListener('click', eventListenerHandleRowSpan);

            colSpanBtn.addEventListener('click', eventListenerHandleColColSpan);

            resetSpanBtn.addEventListener('click', eventListenerHandleResetSpan);

            allTd.forEach((value, key) => {
                value.addEventListener('contextmenu', (event) => {
                    event.preventDefault();

                    selectedTdIndex = key;

                    showHideMenu(spanMenu, true, value.getBoundingClientRect());
                });
            });
        }

        if (spanStep) {
            spanStep.forEach((value) => {
                handleRowColSpan(value.index, value.isRowSpan);
            });
        }

        return {
            destroy: () => {
                //console.log('kl_', 'destory');

                document.removeEventListener('click', eventListenerShowHideMenu);

                rowSpanBtn.removeEventListener('click', eventListenerHandleRowSpan);

                colSpanBtn.removeEventListener('click', eventListenerHandleColColSpan);

                resetSpanBtn.removeEventListener('click', eventListenerHandleResetSpan);
            }
        };
    }
}
