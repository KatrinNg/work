export default `
{% for(var i = 0; i < ctx.inputInfo.length; i++) {%}

{% if (ctx.inputInfo[i].component.prefix || ctx.inputInfo[i].component.suffix) { %}
<div class="input-group">
{% } %}

{% if (ctx.inputInfo[i].component.prefix) { %}
<div class="input-group-prepend" ref="prefix">
  <span class="input-group-text">
    {{ctx.inputInfo[i].component.prefix}}
  </span>
</div>
{% } %}

{% if (!ctx.component.editor && !ctx.component.wysiwyg) { %}
        <{{ctx.inputInfo[i].type}}
          ref="{{ctx.inputInfo[i].ref ? ctx.inputInfo[i].ref : 'input'}}"
          {% for (var attr in ctx.inputInfo[i].attr) { %}
          {{attr}}="{{ctx.inputInfo[i].attr[attr]}}"
          {% } %}
        >{{ctx.inputInfo[i].content}}
        </{{ctx.inputInfo[i].type}}>
{% } %}

{% if (ctx.inputInfo[i].component.editor || ctx.inputInfo[i].component.wysiwyg) { %}
<div ref="input"></div>
{% } %}

{% if (ctx.inputInfo[i].component.showCharCount) { %}
<span class="text-muted pull-right" ref="charcount"></span>
{% } %}

{% if (ctx.inputInfo[i].component.showWordCount) { %}
<span class="text-muted pull-right" ref="wordcount"></span>
{% } %}

{% if (ctx.inputInfo[i].component.suffix) { %}
<div class="input-group-append" ref="suffix">
  <span class="input-group-text" style="min-width: 65px; text-align:left;">
    {{ctx.inputInfo[i].component.suffix}}
  </span>
</div>
{% } %}

{% if (ctx.inputInfo[i].component.prefix || ctx.inputInfo[i].component.suffix) { %}
</div>
{% } %}

{% } %}
`;
