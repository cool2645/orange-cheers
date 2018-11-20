function initMonacoEditor() {
  if (!window.monaco) {
    require.config({ paths: { vs: 'https://unpkg.com/monaco-editor/min/vs' } });
    window.MonacoEnvironment = { getWorkerUrl: () => proxy };

    const proxy = URL.createObjectURL(new Blob([`
	self.MonacoEnvironment = {
		baseUrl: 'https://unpkg.com/monaco-editor/min/'
	};
	importScripts('https://unpkg.com/monaco-editor/min/vs/base/worker/workerMain.js');
`], { type: 'text/javascript' }));

    window.monacoIns = [];
  }
  for (const element of document.getElementsByTagName('pre')) {
    if (element.getAttribute('monaco-ins') !== null) continue;
    element.setAttribute('monaco-ins', 'pending');
    require(['vs/editor/editor.main'], () => {
      const code = element.innerText.trim();
      let lang = element.className.match(/lang:(\S+)/);
      lang = (lang && lang.length) > 1 ? lang[1] : '';
      lang = lang.replace(/\+/g, 'p');
      lang = lang.replace(/#/g, 'sharp');
      console.log(lang);
      element.style.display = 'block';
      element.style.overflow = 'hidden';
      const enter = code.match(/\n\r?/g);
      element.style.height = 19 * (enter ? enter.length + 1 : 1) + 'px';
      element.innerHTML = '';
      const editor = window.monaco.editor.create(element, {
        value: code,
        language: lang,
        folding: true,
        scrollBeyondLastLine: false,
      });
      window.monacoIns.push(editor);
      element.setAttribute('monaco-ins', window.monacoIns.length - 1);
    });
  }
}
