'use strict';
// Native details owns interaction. Scripting only draws the decorative stroke.
document.querySelectorAll('[data-journey-trail]').forEach(trail=>{
 const bubbles=[...trail.querySelectorAll('.journey-bubble')];
 const svg=trail.querySelector('svg');
 const strokes=[...trail.querySelectorAll('[data-trail-stroke]')];
 function draw(){
  const bounds=trail.getBoundingClientRect();
  if(!bounds.width)return;
  const points=bubbles.map(bubble=>{const r=bubble.querySelector('summary').getBoundingClientRect();return {x:r.left-bounds.left+r.width/2,y:r.top-bounds.top+r.height/2};});
  if(!points.length)return;
  svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
  let d=`M ${points[0].x} ${points[0].y}`;
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],middle=(a.y+b.y)/2;
   d+=` C ${a.x} ${middle}, ${b.x} ${middle}, ${b.x} ${b.y}`;
  }
  strokes.forEach(stroke=>stroke.setAttribute('d',d));
 }
 bubbles.forEach(bubble=>bubble.addEventListener('toggle',draw));
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(draw).observe(trail);
 window.addEventListener('resize',draw);
 if(document.fonts)document.fonts.ready.then(draw);
 draw();
});
