export default `<table class="table
    {{ ctx.component.striped ? 'table-striped' : ''}}
    {{ ctx.component.bordered ? 'table-bordered' : 'table-borderless'}}
    {{ ctx.component.hover ? 'table-hover' : ''}}
    {{ ctx.component.condensed ? 'table-sm' : ''}}
    {{ ctx.component.padding ? '' : 'table-paddingless'}}
  " 
    data-num-cols="{{ctx.numCols}}"
    data-num-rows="{{ctx.numRows}}"
    {% ctx.attrs.forEach(function(attr) { %}
      {{attr.attr}}="{{attr.value}}"
    {% }) %}
    style="{% ctx.styles.forEach(function(style) { %}
      {{style.attr}}: {{style.value}};
    {% }) %}"
>
  {% if (false) { %}
    {% if (ctx.component.header && ctx.component.header.length > 0) { %}
    <thead>
      <tr>
        {% ctx.component.header.forEach(function(header) { %}
        <th>{{ctx.t(header)}}</th>
        {% }) %}
      </tr>
    </thead>
    {% } %}
  {% } %}
  <tbody>
    {% ctx.tableComponents.forEach(function(row, rowIndex) { %}
    <tr ref="row-{{ctx.id}}">
      {% row.forEach(function(column, colIndex) { %}
      <td style="position: relative;padding:0 !important;{{
        ctx.colWidths[colIndex] !== undefined ? "width: " + ctx.colWidths[colIndex] + ";" : ""
      }}{{
        ctx.rowHeights[rowIndex] !== undefined ? "height: " + ctx.rowHeights[rowIndex] + ";" : ""
      }}">
        <div ref="{{ctx.tableKey}}-{{rowIndex}}"{% if (ctx.cellClassName) { %} class="{{ctx.cellClassName}}"{% } %}>{{column}}</div>
        {% if (ctx.builder && rowIndex === 0) { %}
          <div class="vert-{{ctx.rootId}}-{{ctx.id}}" data-col-index="{{colIndex}}" style="top: 0px; right: 0px; width: 2px; height: 0px; position: absolute; cursor: col-resize;
            background-color: rgba(0, 0, 0, {{ ctx.builder ? 0.1 : 0 }}); user-select: none; z-index: 1100;">
          </div>
        {% } %}
        {% if (ctx.builder && colIndex === 0) { %}
          <div class="hori-{{ctx.rootId}}-{{ctx.id}}" data-row-index="{{rowIndex}}" style="bottom: 0px; left: 0px; width: 0px; height: 2px; position: absolute; cursor: row-resize;
            background-color: rgba(0, 0, 0, {{ ctx.builder ? 0.1 : 0 }}); user-select: none; z-index: 1000;">
          </div>
        {% } %}
      </td>
      {% }) %}
    </tr>
    {% }) %}
  </tbody>
</table>
<div class="dropdown-menu dropdown-menu-sm" id="context-menu-{{ctx.rootId}}-{{ctx.id}}" style="position: absolute; z-index: 1200;">
  <a class="dropdown-item" href="#" data-action="splitColumn"><i class="fa fa-indent fa-rotate-90"></i>&nbsp;&nbsp;Split Column</a>
  <a class="dropdown-item" href="#" data-action="removeColumn"><i class="fa fa-outdent fa-rotate-270"></i>&nbsp;&nbsp;Remove Column</a>
  <a class="dropdown-item" href="#" data-action="splitRow"><i class="fa fa-indent"></i>&nbsp;&nbsp;Split Row</a>
  <a class="dropdown-item" href="#" data-action="removeRow"><i class="fa fa-outdent fa-rotate-180"></i>&nbsp;&nbsp;Remove Row</a>
</div>`;
