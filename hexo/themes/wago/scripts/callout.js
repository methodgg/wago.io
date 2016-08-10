/**
 * Bootstrap callout style
 *
 * Syntax:
 *   {% callout [type] %}
 *   Callout content
 *   {% endcallout %}
 */

hexo.extend.tag.register('callout', function(args, content) {
  var calloutType = args.length ? args[0] : 'default';
  var result = '';
  result += '<div class="bs-callout bs-callout-' + calloutType + '">';
  result += hexo.render.renderSync({text: content, engine: 'markdown'});
  result += '</div>';
  return result;
}, true);