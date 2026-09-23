/* kit/trees.js: binary-tree layout helpers for lessons that draw trees. */
/* ---------- binary trees ---------- */
/* B(label,left,right) builds a tree; layout() numbers nodes in creation order (pre-order), x by in-order rank, y by depth */
function B(v,l,r){return {v:v,l:l||null,r:r||null};}
function layout(root){
  var nodes=[],rank=0,maxd=0;
  (function num(n,p,d){var id=nodes.length;nodes.push({id:id,v:n.v,p:p,d:d,l:-1,r:-1});n._id=id;maxd=Math.max(maxd,d);
    if(n.l){nodes[id].l=num(n.l,id,d+1);} if(n.r){nodes[id].r=num(n.r,id,d+1);} return id;})(root,-1,0);
  (function ino(id){var n=nodes[id];if(n.l>=0)ino(n.l);n.x=rank++;if(n.r>=0)ino(n.r);})(0);
  var edges=[];nodes.forEach(function(n){if(n.l>=0)edges.push([n.id,n.l]);if(n.r>=0)edges.push([n.id,n.r]);});
  return {nodes:nodes,edges:edges,depth:maxd,width:rank};
}
function edgeIndex(T,a,b){for(var i=0;i<T.edges.length;i++)if(T.edges[i][0]===a&&T.edges[i][1]===b)return i;return -1;}
function treeBoard(id,T,label,g,extra){var b={id:id,tree:{nodes:T.nodes.map(function(n){return {x:n.x,d:n.d,l:n.v};}),edges:T.edges,width:T.width,depth:T.depth},label:label,g:g};for(var k in (extra||{}))b[k]=extra[k];return b;}
function treeCells(T,f){return T.nodes.map(function(n){return f(n);});}
