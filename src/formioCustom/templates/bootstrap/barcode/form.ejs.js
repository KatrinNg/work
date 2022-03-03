export default `
<div style="display: inline-block; position: relative;">
  {% if (!hideBarcodeText) { %}
    <div style="position: absolute; padding: 2px 5px 0px 5px; left:50%; transform: translateX(-50%); bottom: 0; {{ctx.barcodeFont ? 'font: ' + ctx.barcodeFont + '; ' : ''}}background: #fff;">{{ctx.barcodeValue}}</div>
  {% } %}
  <img
      id="img-{{ctx.rootId}}-{{ctx.id}}"
      class="{{ctx.component.className}}"
      style="{% ctx.styles.forEach(function(style) { %}
        {{style.attr}}: {{style.value}};
      {% }) %}"
      ref="img"
      src="{{ctx.barcodeData}}"
  >
  </img>
</div>
<canvas id="canvas-{{ctx.rootId}}-{{ctx.id}}" ref="canvas" style="display: none"></canvas>
`;
