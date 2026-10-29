/* VELNAR Industry Markdown reading enhancement; isolated from Consumer and Deep Read. */
(function(root){
'use strict';
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function safeHref(value){try{const u=new URL(String(value||''),location.href);return u.protocol==='http:'||u.protocol==='https:'?u.href:'#'}catch{return'#'}}
function inlineMarkdown(value){
  const tokens=[];const stash=html=>{const token='@@VELNAR_MD_'+tokens.length+'@@';tokens.push(html);return token};
  let s=String(value??'').split('\\`').join('`');
  s=s.replace(/`([^`\n]+)`/g,(_,code)=>stash('<code>'+esc(code)+'</code>'));
  s=s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,(_,label,url)=>stash('<a href="'+esc(safeHref(url))+'" target="_blank" rel="noopener noreferrer">'+esc(label).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')+'</a>'));
  s=esc(s);
  s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/__([^_]+)__/g,'<strong>$1</strong>');
  tokens.forEach((html,i)=>{s=s.replace('@@VELNAR_MD_'+i+'@@',html)});
  return s;
}
function inlineLines(lines){return lines.map((line,i)=>{const hard=/\s{2,}$/.test(line);const clean=hard?line.replace(/\s{2,}$/,''):line;return inlineMarkdown(clean)+(i<lines.length-1?(hard?'<br>':' '):'')}).join('')}
function normalizedFence(line){
  const t=String(line||'').trim().split('\\`').join('`');
  return t.startsWith('```')?t:null;
}
function tableCells(line){
  let s=String(line||'').trim();
  if(s.startsWith('|'))s=s.slice(1);
  if(s.endsWith('|'))s=s.slice(0,-1);
  return s.split('|').map(x=>x.trim());
}
function tableSeparator(line){
  const cells=tableCells(line);
  return cells.length>0&&cells.every(x=>/^:?-{3,}:?$/.test(x.replace(/\s+/g,'')));
}
function tableHtml(lines,start){
  const headers=tableCells(lines[start]),spec=tableCells(lines[start+1]);
  const aligns=spec.map(x=>{const s=x.replace(/\s+/g,'');return s.startsWith(':')&&s.endsWith(':')?'center':s.endsWith(':')?'right':s.startsWith(':')?'left':''});
  const rows=[];let i=start+2;
  while(i<lines.length&&lines[i].trim()&&lines[i].includes('|')){rows.push(tableCells(lines[i]));i++}
  const cell=(tag,value,index)=>'<'+tag+(aligns[index]?' style="text-align:'+aligns[index]+'"':'')+'>'+inlineMarkdown(value??'')+'</'+tag+'>';
  const head='<thead><tr>'+headers.map((x,j)=>cell('th',x,j)).join('')+'</tr></thead>';
  const body=rows.length?'<tbody>'+rows.map(row=>'<tr>'+headers.map((_,j)=>cell('td',row[j]??'',j)).join('')+'</tr>').join('')+'</tbody>':'';
  return {html:'<div class="markdown-table-wrap"><table>'+head+body+'</table></div>',next:i};
}
function markdownToHtml(markdown){
  const lines=String(markdown??'').replace(/\r\n?/g,'\n').split('\n'),out=[];let i=0,headingIndex=0,paragraph=[];
  const flushParagraph=()=>{if(!paragraph.length)return;out.push('<p>'+inlineLines(paragraph)+'</p>');paragraph=[]};
  while(i<lines.length){
    const line=lines[i],fence=normalizedFence(line);
    if(fence){
      flushParagraph();const code=[];const info=fence.slice(3).trim();i++;
      while(i<lines.length&&!normalizedFence(lines[i])){code.push(lines[i]);i++}
      if(i<lines.length)i++;
      out.push('<pre><code'+(info?' data-info="'+esc(info)+'"':'')+'>'+esc(code.join('\n'))+'</code></pre>');continue;
    }
    if(!line.trim()){flushParagraph();i++;continue}
    const heading=line.match(/^(#{1,6})\s+(.+)$/);
    if(heading){
      flushParagraph();headingIndex++;const level=heading[1].length,id='md-heading-'+headingIndex;
      out.push('<h'+level+' id="'+id+'" data-md-heading="1">'+inlineMarkdown(heading[2])+'</h'+level+'>');i++;continue;
    }
    if(i+1<lines.length&&line.includes('|')&&tableSeparator(lines[i+1])){
      flushParagraph();const table=tableHtml(lines,i);out.push(table.html);i=table.next;continue;
    }
    if(/^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line)){flushParagraph();out.push('<hr>');i++;continue}
    if(/^\s*>\s?/.test(line)){
      flushParagraph();const quote=[];
      while(i<lines.length&&/^\s*>\s?/.test(lines[i])){quote.push(lines[i].replace(/^\s*>\s?/,''));i++}
      out.push('<blockquote><p>'+inlineLines(quote)+'</p></blockquote>');continue;
    }
    if(/^\s*[-*+]\s+/.test(line)){
      flushParagraph();const items=[];
      while(i<lines.length&&/^\s*[-*+]\s+/.test(lines[i])){items.push(lines[i].replace(/^\s*[-*+]\s+/,''));i++}
      out.push('<ul>'+items.map(x=>'<li>'+inlineMarkdown(x)+'</li>').join('')+'</ul>');continue;
    }
    if(/^\s*\d+[.)]\s+/.test(line)){
      flushParagraph();const items=[];
      while(i<lines.length&&/^\s*\d+[.)]\s+/.test(lines[i])){items.push(lines[i].replace(/^\s*\d+[.)]\s+/,''));i++}
      out.push('<ol>'+items.map(x=>'<li>'+inlineMarkdown(x)+'</li>').join('')+'</ol>');continue;
    }
    paragraph.push(line);i++;
  }
  flushParagraph();return out.join('');
}

function render(markdown,title){
  const lines=String(markdown??'').replace(/\r\n?/g,'\n').split('\n');
  const first=lines.findIndex(line=>line.trim().length>0);
  if(first>=0){
    const heading=lines[first].match(/^\s{0,3}#\s+(.+?)\s*#*\s*$/);
    if(heading&&heading[1].trim()===String(title||'').trim())lines.splice(first,1);
  }
  return markdownToHtml(lines.join('\n'));
}
root.VelnarIndustryMarkdown=Object.freeze({render});
})(window);
