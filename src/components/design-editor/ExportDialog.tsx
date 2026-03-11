import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DesignElement } from './types';
import { Download, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDialogProps {
  elements: DesignElement[];
  children: React.ReactNode;
}

const generateTailwindClasses = (el: DesignElement): string => {
  const classes: string[] = [];
  const s = el.styles;

  // Size
  classes.push(`w-[${Math.round(el.width)}px]`);
  classes.push(`h-[${Math.round(el.height)}px]`);

  // Border radius
  if (s.borderRadius) {
    if (s.borderRadius >= 999) classes.push('rounded-full');
    else if (s.borderRadius >= 16) classes.push('rounded-2xl');
    else if (s.borderRadius >= 12) classes.push('rounded-xl');
    else if (s.borderRadius >= 8) classes.push('rounded-lg');
    else classes.push('rounded');
  }

  // Font
  if (s.fontSize) {
    if (s.fontSize >= 36) classes.push('text-4xl');
    else if (s.fontSize >= 30) classes.push('text-3xl');
    else if (s.fontSize >= 24) classes.push('text-2xl');
    else if (s.fontSize >= 20) classes.push('text-xl');
    else if (s.fontSize >= 18) classes.push('text-lg');
    else if (s.fontSize >= 16) classes.push('text-base');
    else if (s.fontSize >= 14) classes.push('text-sm');
    else classes.push('text-xs');
  }

  if (s.fontWeight === '700' || s.fontWeight === '800') classes.push('font-bold');
  else if (s.fontWeight === '600') classes.push('font-semibold');
  else if (s.fontWeight === '500') classes.push('font-medium');

  if (s.textAlign === 'center') classes.push('text-center');
  else if (s.textAlign === 'right') classes.push('text-right');

  // Padding
  if (s.padding) {
    if (s.padding >= 24) classes.push('p-6');
    else if (s.padding >= 16) classes.push('p-4');
    else if (s.padding >= 12) classes.push('p-3');
    else if (s.padding >= 8) classes.push('p-2');
    else classes.push('p-1');
  }

  // Shadow
  if (s.boxShadow) {
    if (s.boxShadow.includes('60px')) classes.push('shadow-2xl');
    else if (s.boxShadow.includes('30px')) classes.push('shadow-xl');
    else if (s.boxShadow.includes('12px')) classes.push('shadow-lg');
    else classes.push('shadow');
  }

  if (s.borderWidth) classes.push('border');

  return classes.join(' ');
};

const generateReactCode = (elements: DesignElement[]): string => {
  const lines: string[] = [
    'import React from "react";',
    '',
    'const DesignComponent = () => {',
    '  return (',
    '    <div className="relative min-h-screen bg-slate-950">',
  ];

  elements.forEach(el => {
    const classes = generateTailwindClasses(el);
    const style: Record<string, string> = {};
    if (el.styles.backgroundColor) style.backgroundColor = el.styles.backgroundColor;
    if (el.styles.borderColor) style.borderColor = el.styles.borderColor;
    if (el.styles.color) style.color = el.styles.color;
    
    const styleStr = Object.keys(style).length > 0
      ? ` style={${JSON.stringify(style)}}`
      : '';

    const posStyle = ` style={{ position: 'absolute', left: ${Math.round(el.x)}, top: ${Math.round(el.y)}${Object.keys(style).length > 0 ? ', ' + Object.entries(style).map(([k,v]) => `${k}: '${v}'`).join(', ') : ''} }}`;

    if (el.type === 'image') {
      lines.push(`      <img src="${el.content || ''}" alt="${el.name}" className="${classes} object-cover"${posStyle} />`);
    } else if (el.type === 'input') {
      lines.push(`      <input placeholder="${el.content || ''}" className="${classes}"${posStyle} />`);
    } else {
      lines.push(`      <div className="${classes}"${posStyle}>`);
      if (el.content) lines.push(`        ${el.content}`);
      lines.push(`      </div>`);
    }
  });

  lines.push('    </div>');
  lines.push('  );');
  lines.push('};');
  lines.push('');
  lines.push('export default DesignComponent;');

  return lines.join('\n');
};

const ExportDialog = ({ elements, children }: ExportDialogProps) => {
  const [copied, setCopied] = useState(false);
  const code = generateReactCode(elements);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export as React + Tailwind
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2 z-10 gap-1.5"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
          <pre className="bg-background border border-border rounded-lg p-4 overflow-auto max-h-[50vh] text-xs font-mono text-foreground">
            <code>{code}</code>
          </pre>
        </div>
        <p className="text-xs text-muted-foreground">
          Generated {elements.length} elements. Add inline styles or customize Tailwind classes as needed.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
