export default `<table class="spanTable-{{ctx.id}} table
    {{ ctx.component.striped ? 'table-striped' : ''}}
    {{ ctx.component.bordered ? 'table-bordered' : ''}}
    {{ ctx.component.hover ? 'table-hover' : ''}}
    {{ ctx.component.condensed ? 'table-sm' : ''}}
  ">
  {% if (ctx.component.header && ctx.component.header.length > 0) { %}
  <thead>
    <tr>
      {% ctx.component.header.forEach(function(header) { %}
      <th>{{ctx.t(header)}}</th>
      {% }) %}
    </tr>
  </thead>
  {% } %}
  <tbody>
    {% ctx.tableComponents.forEach(function(row, rowIndex) { %}
    <tr ref="row-{{ctx.id}}">
      {% row.forEach(function(column, colIndex) { %}
      <td ref="{{ctx.tableKey}}-{{rowIndex}}"{% if (ctx.cellClassName) { %} class="{{ctx.cellClassName}}"{% } %}>{{column}}</td>
      {% }) %}
    </tr>
    {% }) %}
  </tbody>
</table>

<div class="dropdown-menu dropdown-menu-sm" id="span-menu-{{ctx.rootId}}-{{ctx.id}}" style="position: absolute; z-index: 9999;">
    <a class="dropdown-item colSpanBtn" href="#" data-action="colSpan"><i class="fa fa-arrows-h"></i>&nbsp;&nbsp;Span Column</a>
    <a class="dropdown-item rowSpanBtn" href="#" data-action="rowSpan"><i class="fa fa-arrows-v" style="width: 16px; text-align: center;"></i>&nbsp;&nbsp;Span Row</a>
    <a class="dropdown-item resetSpanBtn" href="#" data-action="removeRow"><i class="fa fa-reply"></i>&nbsp;&nbsp;Reset Span</a>
</div>`;
