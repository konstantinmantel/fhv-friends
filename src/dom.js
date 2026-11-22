// Preserve images, focus and native scroll containers when updating existing views.
function domKey(node){
 if(node.nodeType!==1)return '';
 return node.getAttribute('data-key')||node.id||[node.tagName,node.getAttribute('data-action'),node.getAttribute('data-id'),node.getAttribute('data-tab'),node.getAttribute('data-value')].join('|');
}
function compatible(a,b){return a.nodeType===b.nodeType&&(a.nodeType!==1||(a.tagName===b.tagName&&a.namespaceURI===b.namespaceURI&&domKey(a)===domKey(b)));}
function patchNode(node,fresh){
 if(node.nodeType!==1){if(node.nodeValue!==fresh.nodeValue)node.nodeValue=fresh.nodeValue;return;}
 for(const attr of [...node.attributes])if(!fresh.hasAttribute(attr.name))node.removeAttribute(attr.name);
 for(const attr of fresh.attributes)if(node.getAttribute(attr.name)!==attr.value)node.setAttribute(attr.name,attr.value);
 if(node.tagName==='INPUT'&&node.value!==fresh.value)node.value=fresh.value;
 patchChildren(node,fresh);
}
function patchChildren(parent,fresh){
 const available=[...parent.childNodes],used=new Set();let cursor=parent.firstChild;
 for(const child of [...fresh.childNodes]){
  const existing=available.find(node=>!used.has(node)&&compatible(node,child));
  const node=existing||child.cloneNode(true);used.add(node);
  if(node!==cursor)parent.insertBefore(node,cursor);
  if(existing)patchNode(node,child);
  cursor=node.nextSibling;
 }
 for(const node of available)if(!used.has(node))node.remove();
}
export function updateDOM(root,html){const template=document.createElement('template');template.innerHTML=html;patchChildren(root,template.content);}
