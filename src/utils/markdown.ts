import marked from 'marked';

const pre = /<pre (?:(?:[\w\-]+:)?[\w\-]+(?:=(?:"[^"]*"|'[^']*'))?\s+)*lang=(?:"markdown"|'markdown'|markdown)(?:\s+(?:[\w\-]+:)?[\w\-]+(?:=(?:"[^"]*"|'[^']*'))?)*\s*>([\s\S]+?)<\/pre>/mg;

function markup(input: string): string {
  let match = pre.exec(input);
  while (match !== null) {
    let markedUp = marked(match[1], { breaks: false });
    markedUp = markedUp.replace(/<pre><code(?: class="language-(.*?)")>([\s\S]*?)<\/code><\/pre>/mg,
      '<pre class="lang:$1">$2</pre>');
    input = input.replace(match[0], markedUp);
    match = pre.exec(input);
  }
  return input;
}

export default markup;
