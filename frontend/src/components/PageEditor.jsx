import { useEffect, useRef } from 'react';
import grapesjs from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';

const PageEditor = ({ pages, setPages, currentPage }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) {
      // Initialize GrapesJS editor
      editorRef.current = grapesjs.init({
        container: '#editor',
        height: '700px',
        fromElement: false,
        showOffsets: true,
        storageManager: false, // We'll manage saving manually
        blockManager: {
          appendTo: '#blocks',
          blocks: [
            { id: 'text', label: 'Text', content: '<div>Insert Text</div>' },
            { id: 'heading', label: 'Heading', content: '<h2>Heading</h2>' },
            { id: 'paragraph', label: 'Paragraph', content: '<p>Paragraph</p>' },
            { id: 'image', label: 'Image', content: '<img src="https://picsum.photos/200"/>' },
            { id: 'button', label: 'Button', content: '<button>Click Me</button>' },
            { id: 'video', label: 'Video', content: '<video controls src=""></video>' },
            { id: 'list', label: 'List', content: '<ul><li>Item 1</li><li>Item 2</li></ul>' },
            { id: 'table', label: 'Table', content: '<table border="1"><tr><td>Cell 1</td></tr></table>' },
            { id: 'divider', label: 'Divider', content: '<hr />' },
          ]
        },
        styleManager: {
          sectors: [
            {
              name: 'Typography',
              open: false,
              properties: [
                { name: 'Font', property: 'font-family' },
                { name: 'Font Size', property: 'font-size', type: 'integer', units: ['px', 'em'] },
                { name: 'Font Weight', property: 'font-weight' },
                { name: 'Color', property: 'color' },
                { name: 'Line Height', property: 'line-height', type: 'integer' }
              ]
            },
            {
              name: 'Decorations',
              open: false,
              properties: [
                { name: 'Background Color', property: 'background-color' },
                { name: 'Border', property: 'border' },
                { name: 'Border Radius', property: 'border-radius' },
                { name: 'Box Shadow', property: 'box-shadow' }
              ]
            },
            {
              name: 'Spacing',
              open: false,
              properties: [
                { name: 'Margin', property: 'margin' },
                { name: 'Padding', property: 'padding' }
              ]
            }
          ]
        },
        selectorManager: { appendTo: '#styles' },
        panels: {
          defaults: [
            {
              id: 'basic-actions',
              buttons: [
                {
                  id: 'save',
                  className: 'btn-save',
                  label: 'Save',
                  command: 'save-db',
                  attributes: { title: 'Save Content' }
                }
              ]
            }
          ]
        },
      });

      // Add custom save command
      editorRef.current.Commands.add('save-db', {
        run: (editor) => {
          const html = editor.getHtml();
          const css = editor.getCss();
          const fullContent = html + `<style>${css}</style>`;

          const updatedPages = pages.map(p =>
            p.slug === currentPage ? { ...p, content: fullContent } : p
          );

          setPages(updatedPages);
          localStorage.setItem('cmsPages', JSON.stringify(updatedPages));

          alert('Content saved successfully!');
        }
      });
    }

    const editor = editorRef.current;
    const page = pages.find(p => p.slug === currentPage);

    if (page && page.content) {
      editor.setComponents(page.content);
    } else {
      editor.setComponents('<div></div>');
    }
  }, [currentPage, pages, setPages]);

  return (
    <div className="flex flex-col gap-2 p-2">
      <div id="blocks" className="mb-2 flex gap-2 overflow-x-auto"></div>
      <div className="flex gap-2">
        <button
          onClick={() => editorRef.current.runCommand('save-db')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Save Content
        </button>
      </div>
      <div id="editor" className="border rounded min-h-[600px] mt-2"></div>
      <div id="styles"></div>
    </div>
  );
};

export default PageEditor;
