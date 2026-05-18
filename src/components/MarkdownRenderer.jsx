import React from 'react';

export default function MarkdownRenderer({ content = '' }) {
  if (!content) return <p className="text-text-muted italic text-xs">No notes provided.</p>;
  
  const lines = content.split('\n');
  
  return (
    <div className="font-sans text-sm text-text-primary leading-relaxed space-y-2">
      {lines.map((line, idx) => {
        // Blockquotes
        if (line.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-4 border-primary/50 bg-surface-elevated/40 px-3 py-1 my-2 rounded-r italic text-text-secondary">
              {parseInline(line.substring(2))}
            </blockquote>
          );
        }
        
        // Headings
        if (line.startsWith('# ')) {
          return <h1 key={idx} className="text-lg font-bold font-sans text-primary mt-4 mb-2">{parseInline(line.substring(2))}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={idx} className="text-md font-bold font-sans text-text-primary border-b border-border pb-1 mt-3 mb-2">{parseInline(line.substring(3))}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={idx} className="text-sm font-semibold font-sans text-text-primary mt-2 mb-1">{parseInline(line.substring(4))}</h3>;
        }
        
        // Bullet Lists
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          const content = line.trim().substring(2);
          return (
            <ul key={idx} className="list-disc list-inside ml-3 text-text-secondary">
              <li>{parseInline(content)}</li>
            </ul>
          );
        }
        
        // Numbered Lists
        if (/^\d+\.\s/.test(line.trim())) {
          const match = line.trim().match(/^(\d+)\.\s(.*)/);
          return (
            <ol key={idx} className="list-decimal list-inside ml-3 text-text-secondary">
              <li value={match[1]}>{parseInline(match[2])}</li>
            </ol>
          );
        }
        
        // Empty Line
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }
        
        // Standard Paragraph
        return <p key={idx} className="text-text-secondary text-13">{parseInline(line)}</p>;
      })}
    </div>
  );
}

function parseInline(text) {
  let parts = [{ type: 'text', content: text }];
  
  // Bold **text**
  parts = parts.flatMap(part => {
    if (part.type !== 'text') return part;
    const segments = part.content.split(/\*\*(.*?)\*\*/g);
    return segments.map((seg, i) => i % 2 === 1 ? { type: 'bold', content: seg } : { type: 'text', content: seg });
  });

  // Italics *text*
  parts = parts.flatMap(part => {
    if (part.type !== 'text') return part;
    const segments = part.content.split(/\*(.*?)\*/g);
    return segments.map((seg, i) => i % 2 === 1 ? { type: 'italic', content: seg } : { type: 'text', content: seg });
  });

  // Inline code `code`
  parts = parts.flatMap(part => {
    if (part.type !== 'text') return part;
    const segments = part.content.split(/`(.*?)`/g);
    return segments.map((seg, i) => i % 2 === 1 ? { type: 'code', content: seg } : { type: 'text', content: seg });
  });

  // Links [text](url)
  parts = parts.flatMap(part => {
    if (part.type !== 'text') return part;
    const segments = part.content.split(/\[(.*?)\]\((.*?)\)/g);
    const result = [];
    for (let i = 0; i < segments.length; i++) {
      if (i % 3 === 0) {
        result.push({ type: 'text', content: segments[i] });
      } else if (i % 3 === 1) {
        result.push({ type: 'link', text: segments[i], url: segments[i+1] });
        i++; // Skip the next index since it contains the URL
      }
    }
    return result;
  });

  return parts.map((part, idx) => {
    switch (part.type) {
      case 'bold':
        return <strong key={idx} className="font-bold text-text-primary">{part.content}</strong>;
      case 'italic':
        return <em key={idx} className="italic text-text-secondary">{part.content}</em>;
      case 'code':
        return <code key={idx} className="px-1.5 py-0.5 bg-surface-elevated text-primary font-mono text-11 rounded border border-border">{part.content}</code>;
      case 'link':
        return (
          <a
            key={idx}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-hover underline font-medium"
            onClick={(e) => {
              if (window.api && window.api.openExternal) {
                e.preventDefault();
                window.api.openExternal(part.url);
              }
            }}
          >
            {part.text}
          </a>
        );
      default:
        return part.content;
    }
  });
}
