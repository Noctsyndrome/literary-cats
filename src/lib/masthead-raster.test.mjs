import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {atlases,fullDuration,peekDuration,contactTime,chooseLayout,sampleFull,samplePeek,boundsFor,actionKeys,scenes,strideAt,renderRaster} from './masthead-raster.mjs';

test('source dimensions and padded frames preserve the actual atlas pixels',async()=>{
  for(const [id,atlas] of Object.entries(atlases)){
    const metadata=await sharp(new URL('../assets/masthead/'+(atlas.source??id)+'.png',import.meta.url).pathname).metadata();
    assert.deepEqual([metadata.width,metadata.height],atlas.size,id);
    for(const frame of atlas.frames){
      const [x,y,w,h]=frame.rect,[l,t,r,b]=frame.bounds;
      assert(x>=0&&y>=0&&x+w<=metadata.width&&y+h<=metadata.height,id);
      assert(l>=x&&t>=y&&r<=x+w&&b<=y+h,id);
    }
  }
});
test('approach uses the approved whole-body return cycle, always facing left',()=>{
  const seen=new Set();
  for(let t=1.25;t<2.65;t+=.01){const cat=sampleFull(t,560).cat;assert.equal(cat.asset,'chase');assert.equal(cat.flipX,true);seen.add(cat.index);}
  assert.deepEqual([...seen].sort(),[3,4,5,6,7]);
  for(const [time,asset] of [[2.8,'approach'],[3.3,'leap'],[4.4,'turn'],[5.5,'tap'],[7,'chase']]){
    const cat=sampleFull(time,560).cat;assert.equal(cat.asset,asset);assert(!cat.flipX);
  }
  assert.equal(samplePeek(1,104).cat.asset,'peek');
});
test('the approach completes a grounded stride before crouching; return gait is unchanged',()=>{
  assert.deepEqual([0,10,20,30,40].map(d=>strideAt(d)),[{index:3,lift:3},{index:4,lift:7},{index:5,lift:0},{index:6,lift:0},{index:7,lift:0}]);
  for(const width of [320,406,493,560]){
    for(const t of [1.25,2.65-.00001]) assert.equal(sampleFull(t,width).cat.y,111);
    assert.equal(sampleFull(2.65,width).cat.asset,'approach');
    for(let t=6.54;t<fullDuration;t+=.01){
      const running=t-6.54,travel=120*running+20*running**2,index=[3,4,5,6,7][Math.floor(travel/10)%5],cat=sampleFull(t,width).cat;
      assert.equal(cat.index,index);assert.equal(cat.y,111-(index===4?7:index===3?3:0));
    }
  }
});
test('left-facing bounds and rendering share the same body anchor; ball is not reflected',()=>{
  const cat=sampleFull(1.8,560).cat,normal=boundsFor({...cat,flipX:false}),flipped=boundsFor(cat);
  assert(Math.abs(flipped.left-(2*cat.x-normal.right))<1e-9);
  assert(Math.abs(flipped.right-(2*cat.x-normal.left))<1e-9);
  const operations=[],ctx=new Proxy({}, {get:(_,method)=>(...args)=>operations.push([method,...args]),set:()=>true});
  const state=sampleFull(1.8,560);renderRaster(ctx,{chase:{}},state,560,112);
  assert(operations.some(([name,x,y])=>name==='scale'&&x===-1&&y===1));
  const draw=operations.findIndex(([name])=>name==='drawImage'),arc=operations.findIndex(([name])=>name==='arc');
  assert(operations.slice(draw+1,arc).some(([name])=>name==='restore'));
  assert.deepEqual(operations[arc].slice(1,4),[state.ball.x,state.ball.y,state.ball.radius]);
});
test('desktop uses the full story only when usable width permits; narrow/touch uses peek',()=>{
  assert.deepEqual(chooseLayout({markWidth:1061,titleWidth:343,canHover:true}),{mode:'full',width:560,height:112});
  assert.deepEqual(chooseLayout({markWidth:265,titleWidth:219,canHover:false}),{mode:'peek',width:38,height:64});
  assert.equal(chooseLayout({markWidth:335,titleWidth:219,canHover:true}).mode,'peek');
  assert.equal(chooseLayout({markWidth:1061,titleWidth:343,canHover:false}).mode,'peek');
  assert.equal(chooseLayout({markWidth:230,titleWidth:219,canHover:false}).mode,'none');
});
test('full story starts/ends clear and all visible travel stays inside the right-hand stage',()=>{
  for(const width of [320,360,430,493,560]){
    assert(sampleFull(0,width).ball.x-7>width);
    assert(boundsFor(sampleFull(.65,width).cat).left>width);
    const last=sampleFull(fullDuration-.001,width);
    assert(boundsFor(last.cat).left>width);
    assert(last.ball.x-last.ball.radius>width);
    assert.deepEqual(sampleFull(fullDuration,width),{phase:'end',cat:null,ball:null});
    for(let time=.65;time<fullDuration;time+=.01){
      const state=sampleFull(time,width),bounds=boundsFor(state.cat);
      assert(bounds.left>=0,'No left-edge entrances/exits');
      assert(bounds.top>=0,'No clipped ears/tail at the top');
      assert(bounds.bottom<=112,'No feet below the stage');
    }
  }
});
test('the new contact drawing meets the ball before it can move right',()=>{
  for(const width of [320,560]){
    const before=sampleFull(1,width);
    for(let t=1;t<contactTime;t+=.01) assert.equal(sampleFull(t,width).ball.x,before.ball.x);
    const contact=sampleFull(contactTime,width),scale=atlases.tap.scale;
    assert.equal(contact.cat.asset,'tap');assert.equal(contact.cat.index,4);
    const paw={x:contact.cat.x+(341-192)*scale,y:contact.cat.y+(852-863)*scale};
    assert(Math.abs(Math.hypot(paw.x-contact.ball.x,paw.y-contact.ball.y)-7)<1e-6);
    assert(sampleFull(contactTime+.01,width).ball.x>contact.ball.x);
  }
});
test('scene boundaries share one timeline; roots do not teleport between scenes',()=>{
  for(let i=1;i<scenes.length;i++) assert.equal(scenes[i].start,scenes[i-1].end);
  for(const {start} of scenes.slice(2)){
    const a=sampleFull(start-.00001,560),b=sampleFull(start+.00001,560);
    assert(Math.abs(a.cat.x-b.cat.x)<.02);
    assert(Math.abs(a.ball.x-b.ball.x)<.02);
  }
  for(let i=1;i<actionKeys.length;i++) assert(actionKeys[i][0]>actionKeys[i-1][0]);
});
test('peek fallback shows no ball and retreats through the same edge',()=>{
  for(const width of [32,38,69,84,104]){
    assert(boundsFor(samplePeek(0,width).cat).left>width);
    assert(boundsFor(samplePeek(peekDuration-.001,width).cat).left>width);
    assert(boundsFor(samplePeek(1,width).cat).left>=0);
    assert(boundsFor(samplePeek(1,width).cat).left<width-20);
    for(let t=0;t<peekDuration;t+=.01){const s=samplePeek(t,width);assert.equal(s.ball,null);assert.equal(s.cat.asset,'peek');}
    assert.equal(samplePeek(peekDuration,width).cat,null);
  }
});
