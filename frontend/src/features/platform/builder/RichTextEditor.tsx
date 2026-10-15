import { useEffect } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';

/**
 * Word-like text editor of the course builder (TipTap). Produces only the tags the server keeps
 * (HtmlContentSanitizer): paragraphs, headings 2–4, bold, italic, underline, strike, lists, quotes, links and
 * text alignment.
 */
export function RichTextEditor({
  value,
  onChange,
  onBlur,
  label,
  readOnly = false,
  autoFocus = false,
}: {
  value: string;
  onChange: (html: string) => void;
  onBlur?: () => void;
  label: string;
  readOnly?: boolean;
  autoFocus?: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] }, code: false, codeBlock: false, horizontalRule: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: value,
    editable: !readOnly,
    autofocus: autoFocus ? 'end' : false,
    editorProps: { attributes: { 'aria-label': label, class: 'pa-rte-content', role: 'textbox', 'aria-multiline': 'true' } },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? '' : current.getHTML()),
    onBlur: () => onBlur?.(),
  });

  // Content saved elsewhere (another tab, a reload) replaces the editor text only while it is not being edited.
  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  return (
    <div className={`pa-rte${readOnly ? ' readonly' : ''}`}>
      {!readOnly && editor && <Toolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const button = (label: string, text: string, active: boolean, run: () => void, disabled = false) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
    >
      {text}
    </button>
  );
  const chain = () => editor.chain().focus();
  const setLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Địa chỉ liên kết (để trống để bỏ liên kết)', previous ?? 'https://');
    if (url === null) return;
    if (url.trim() === '' || url.trim() === 'https://') {
      chain().extendMarkRange('link').unsetLink().run();
      return;
    }
    chain().extendMarkRange('link').setLink({ href: url.trim() }).run();
  };

  return (
    <div className="pa-rte-toolbar" role="toolbar" aria-label="Định dạng chữ">
      {button('Đậm', 'B', editor.isActive('bold'), () => chain().toggleBold().run())}
      {button('Nghiêng', 'I', editor.isActive('italic'), () => chain().toggleItalic().run())}
      {button('Gạch chân', 'U', editor.isActive('underline'), () => chain().toggleUnderline().run())}
      {button('Gạch ngang', 'S', editor.isActive('strike'), () => chain().toggleStrike().run())}
      <span className="sep" aria-hidden="true" />
      {button('Tiêu đề lớn', 'H2', editor.isActive('heading', { level: 2 }), () => chain().toggleHeading({ level: 2 }).run())}
      {button('Tiêu đề nhỏ', 'H3', editor.isActive('heading', { level: 3 }), () => chain().toggleHeading({ level: 3 }).run())}
      {button('Đoạn văn', '¶', editor.isActive('paragraph'), () => chain().setParagraph().run())}
      <span className="sep" aria-hidden="true" />
      {button('Danh sách chấm', '•', editor.isActive('bulletList'), () => chain().toggleBulletList().run())}
      {button('Danh sách số', '1.', editor.isActive('orderedList'), () => chain().toggleOrderedList().run())}
      {button('Trích dẫn', '❝', editor.isActive('blockquote'), () => chain().toggleBlockquote().run())}
      <span className="sep" aria-hidden="true" />
      {button('Căn trái', '⇤', editor.isActive({ textAlign: 'left' }), () => chain().setTextAlign('left').run())}
      {button('Căn giữa', '↔', editor.isActive({ textAlign: 'center' }), () => chain().setTextAlign('center').run())}
      {button('Căn phải', '⇥', editor.isActive({ textAlign: 'right' }), () => chain().setTextAlign('right').run())}
      <span className="sep" aria-hidden="true" />
      {button('Liên kết', '🔗', editor.isActive('link'), setLink)}
      {button('Bỏ định dạng', '⌫', false, () => chain().unsetAllMarks().clearNodes().run())}
      {button('Hoàn tác', '↶', false, () => chain().undo().run(), !editor.can().undo())}
      {button('Làm lại', '↷', false, () => chain().redo().run(), !editor.can().redo())}
    </div>
  );
}
