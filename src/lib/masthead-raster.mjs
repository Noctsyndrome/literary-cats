// Whole raster drawings: no SVG shapes, rig or outline interpolation.
// The approved running cycle faces left throughout entry; the drawn turn is unchanged.
export const fullDuration = 8.6;
export const peekDuration = 2.45;
export const panDuration = fullDuration;
export const ballArrivalTime = .85;
export const panTiming = {exitEnd:ballArrivalTime,returnStart:6.25,returnEnd:8.35};
export const tapStart = 4.82;
export const contactTime = tapStart + .60;
export const fullAssets = ['approach', 'leap', 'turn', 'tap', 'chase'];
const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const ease = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };
const easeOutCubic = (value) => 1-(1-clamp(value))**3;
const mix = (a, b, t) => a + (b - a) * t;

const definitions = {
  peek: { size: [1536, 1024], scale: .24, bounds: [[67,152,377,472]], anchors: [[244,472]] },
  approach: {
    size: [1536,1024], scale: .254,
    bounds: [[55,216,325,453],[438,216,706,453],[808,227,1089,453],[1204,222,1479,453],[58,655,333,871],[430,650,716,871],[810,656,1097,871],[1193,664,1483,871]],
    anchors: Array.from({length:8}, (_,i) => [i%4*384+230, i<4?453:871]),
  },
  leap: {
    // Measured pixels: this sheet is 1254 squared, not the requested 1536.
    size: [1254,1254], scale: .306,
    bounds: [[39,201,289,409],[345,196,596,409],[650,141,899,360],[952,193,1209,418],[34,577,296,779],[349,575,603,779]],
    anchors: [[188,409],[502,409],[815,360],[1129,418],[188,779],[502,779]],
  },
  turn: {
    size: [1536,1024], scale: .232,
    bounds: [[33,204,360,466],[403,203,741,466],[803,203,1119,465],[1209,206,1488,468],[53,615,305,893],[445,608,708,893],[825,610,1095,893],[1212,609,1483,891]],
    anchors: [[230,466],[614,466],[998,465],[1355,468],[208,893],[592,893],[976,893],[1360,891]],
  },
  tap: {
    size: [1536,1024], scale: .245,
    bounds: [[73,197,310,452],[454,197,693,452],[837,199,1082,452],[1220,213,1476,452],[73,642,342,863],[454,646,733,863],[837,609,1083,863],[1220,606,1458,863]],
    anchors: Array.from({length:8}, (_,i) => [i%4*384+192, i<4?452:863]),
  },
  chase: {
    size: [1536,1024], scale: .245,
    bounds: [[55,205,323,460],[414,245,735,460],[795,260,1113,460],[1187,213,1490,460],[41,639,374,871],[431,641,766,874],[802,660,1115,874],[1174,673,1493,874]],
    anchors: Array.from({length:8}, (_,i) => [i%4*384+192, i<4?460:874]),
  },
};
export const atlases = Object.fromEntries(Object.entries(definitions).map(([id, definition]) => [id, {
  ...definition,
  frames: definition.bounds.map((bounds, index) => {
    const [left,top,right,bottom] = bounds;
    const x=Math.max(0,left-6), y=Math.max(0,top-6);
    return {rect:[x,y,Math.min(definition.size[0],right+6)-x,Math.min(definition.size[1],bottom+6)-y],anchor:definition.anchors[index],bounds};
  }),
}]));

// Shared boundary frames; skip duplicate generated endpoint drawings.
export const actionKeys = [
  [2.65,'approach',4],[2.77,'approach',5],[2.88,'approach',6],[3.00,'approach',7],
  [3.18,'leap',1],[3.28,'leap',2],[3.46,'leap',3],[3.65,'leap',4],[3.85,'leap',5],
  [4.05,'turn',1],[4.18,'turn',2],[4.32,'turn',3],[4.46,'turn',4],[4.59,'turn',5],[4.71,'turn',6],
  [tapStart,'tap',0],[tapStart+.18,'tap',1],[tapStart+.29,'tap',2],[tapStart+.48,'tap',3],
  [contactTime,'tap',4],[tapStart+.68,'tap',5],[tapStart+.84,'tap',6],[tapStart+1.04,'tap',7],[tapStart+1.18,'tap',0],
  [6.18,'chase',0],[6.30,'chase',1],[6.42,'chase',2],
];
export const scenes = [
  {id:'ball',start:0,end:.65},{id:'peek',start:.65,end:1.25},
  {id:'approach',start:1.25,end:2.65},{id:'crouch',start:2.65,end:3.10},
  {id:'pounce',start:3.10,end:3.65},{id:'land',start:3.65,end:4.05},
  {id:'turn',start:4.05,end:tapStart},{id:'play',start:tapStart,end:6.18},
  {id:'chase',start:6.18,end:fullDuration},
];
export function chooseLayout({markWidth,titleWidth,canHover,compact=false}) {
  if(compact&&markWidth>=240) return {mode:'pan',width:markWidth,height:72};
  const free=Math.max(0,markWidth-titleWidth);
  if(canHover&&free-32>=320) return {mode:'full',width:Math.min(560,free-32),height:112};
  const width=Math.min(104,Math.max(0,free-8));
  return {mode:width>=32?'peek':'none',width,height:64};
}
// A single approved whole-body cycle for both directions. Phase is driven by
// distance, so easing the root also slows the feet instead of running in place.
export function strideAt(distance, phase=0) {
  const index=[3,4,5,6,7][(Math.floor(Math.max(0,distance)/10)+phase)%5];
  return {index,lift:index===4?7:index===3?3:0};
}
export function sampleFull(time,width,height=112) {
  const t=clamp(time,0,fullDuration),floor=height-1,radius=7;
  if(t>=fullDuration) return {phase:'end',cat:null,ball:null};
  const ballRest=width*.64;
  const pawOffset={x:(341-192)*atlases.tap.scale,y:(852-863)*atlases.tap.scale};
  const contactOffset=pawOffset.x+Math.sqrt(radius**2-(pawOffset.y+radius)**2);
  const restRoot=ballRest-contactOffset,approachRoot=ballRest+58;
  const sinceContact=Math.max(0,t-contactTime);
  const ballX=t<ballArrivalTime?mix(width+20,ballRest,easeOutCubic(t/ballArrivalTime)):ballRest+clamp(width*.22,72,123)*sinceContact-4*sinceContact**2;
  const ball={x:ballX,y:floor-radius,radius};
  const phase=scenes.find(scene=>t>=scene.start&&t<scene.end)?.id??'end';
  if(t<.65) return {phase,cat:null,ball};
  let x,lift=0,asset='chase',index=7;
  if(t<1.00) x=mix(width+76,width+18,ease((t-.65)/.35));
  else if(t<1.25) x=width+18;
  else if(t<2.65) {
    const progress=ease((t-1.25)/1.4),distance=width+18-approachRoot;
    x=mix(width+18,approachRoot,progress);
    // Complete whole strides: begin and finish gathered on the ground, then
    // lower into the existing crouch rather than freezing an airborne pose.
    const cycles=Math.max(1,Math.round(distance/50));
    ({index,lift}=strideAt(progress*cycles*50,4));
  }
  else if(t<3.10) x=approachRoot;
  else if(t<3.65) {const flight=clamp((t-3.10)/.55);x=mix(approachRoot,restRoot,ease(flight));lift=22*4*flight*(1-flight);}
  else if(t<6.18) x=restRoot;
  else if(t<6.54) x=restRoot+4*ease((t-6.18)/.36);
  else {const running=t-6.54,travel=120*running+20*running**2;x=restRoot+4+travel;asset='chase';({index,lift}=strideAt(travel));}
  if(t>=2.65&&t<6.54) [,asset,index]=actionKeys.findLast(([start])=>start<=t);
  return {phase,cat:{asset,index,x,y:floor-lift,...(t<2.65?{flipX:true}:{})},ball};
}
export function samplePeek(time,width,height=64) {
  const t=clamp(time,0,peekDuration);
  if(t>=peekDuration) return {phase:'end',cat:null,ball:null};
  let x;
  if(t<.45) x=mix(width+52,width+13,ease(t/.45));
  else if(t<1.65) x=width+13-1.5*Math.sin(Math.PI*(t-.45)/1.2);
  else x=mix(width+13,width+52,ease((t-1.65)/.8));
  return {phase:t<.45?'peek-in':t<1.65?'peek-look':'peek-out',cat:{asset:'peek',index:0,x,y:height-1},ball:null};
}
// On phones the title and scene occupy the SAME row. Their motion overlaps:
// the title leaves with the arriving ball, then returns as the cat chases out.
// Keep the cat at a readable size; wider compact layouts retain the right edge.
export function samplePan(time,width,height=72,titleWidth=220) {
  const t=clamp(time,0,panDuration),scale=.7;
  const sceneWidth=Math.min(560,width/scale);
  const view={scale,x:width-sceneWidth*scale,y:0};
  const state=sampleFull(t,sceneWidth,height/scale);
  const distance=titleWidth+24;
  // Match the ball's fast-to-slow arrival, then return at a steady speed.
  // Each trip uses one curve throughout, without separate acceleration ramps.
  const out=easeOutCubic(t/panTiming.exitEnd);
  const back=clamp((t-panTiming.returnStart)/(panTiming.returnEnd-panTiming.returnStart));
  const titleShift=t>=panTiming.returnEnd?0:t>=panTiming.returnStart?-distance*(1-back):-distance*out;
  return {...state,view,titleShift};
}
export function boundsFor(cat) {
  const atlas=atlases[cat.asset],frame=atlas.frames[cat.index],[ax,ay]=frame.anchor,[l,t,r,b]=frame.bounds;
  const left=cat.flipX?ax-r:l-ax,right=cat.flipX?ax-l:r-ax;
  return {left:cat.x+left*atlas.scale,top:cat.y+(t-ay)*atlas.scale,right:cat.x+right*atlas.scale,bottom:cat.y+(b-ay)*atlas.scale};
}
export function renderRaster(ctx,images,state,width,height,paper='#fffef9',yellow='#f2be22') {
  ctx.save();ctx.clearRect(0,0,width,height);ctx.fillStyle=paper;ctx.fillRect(0,0,width,height);
  if(state.view) {ctx.translate(state.view.x,state.view.y);ctx.scale(state.view.scale,state.view.scale);}
  if(state.cat) {
    const cat=state.cat,atlas=atlases[cat.asset],frame=atlas.frames[cat.index],[sx,sy,sw,sh]=frame.rect,[ax,ay]=frame.anchor,image=images[cat.asset];
    if(image) {
      // Keep original artwork/alpha. Blend white backdrops into the paper.
      ctx.save();
      ctx.translate(cat.x,cat.y);
      ctx.scale(cat.flipX?-1:1,1);
      ctx.globalCompositeOperation='multiply';
      ctx.drawImage(image,sx,sy,sw,sh,(sx-ax)*atlas.scale,(sy-ay)*atlas.scale,sw*atlas.scale,sh*atlas.scale);
      ctx.restore();
    }
  }
  if(state.ball) {ctx.fillStyle=yellow;ctx.beginPath();ctx.arc(state.ball.x,state.ball.y,state.ball.radius,0,2*Math.PI);ctx.fill();}
  ctx.restore();
}
