import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseLayout,samplePan,sampleFull,panDuration,panTiming,fullDuration,ballArrivalTime,boundsFor,renderRaster} from './masthead-raster.mjs';

const widths=[240,265,280,335,350,375,390,580];
const close=(actual,expected)=>assert(Math.abs(actual-expected)<1e-8,`${actual} != ${expected}`);

test('compact pages use the whole title row; desktop choices are unchanged',()=>{
  for(const width of widths) assert.deepEqual(chooseLayout({markWidth:width,titleWidth:219,canHover:false,compact:true}),{mode:'pan',width,height:72});
  assert.deepEqual(chooseLayout({markWidth:1061,titleWidth:343,canHover:true}),{mode:'full',width:560,height:112});
  assert.equal(chooseLayout({markWidth:400,titleWidth:219,canHover:true}).mode,'peek');
  assert.notEqual(chooseLayout({markWidth:230,titleWidth:219,canHover:false,compact:true}).mode,'pan');
});

test('title leaves and returns continuously within the story rather than after it',()=>{
  const titleWidth=219;
  close(samplePan(0,335,72,titleWidth).titleShift,0);
  let outgoing=0;
  for(let t=0;t<panTiming.exitEnd;t+=.01){const shift=samplePan(t,335,72,titleWidth).titleShift;assert(shift<=outgoing);outgoing=shift;}
  for(let t=panTiming.exitEnd;t<=panTiming.returnStart;t+=.01) assert(samplePan(t,335,72,titleWidth).titleShift+titleWidth<0);
  let previous=-Infinity;
  for(let t=panTiming.returnStart;t<=panDuration;t+=.01){const s=samplePan(t,335,72,titleWidth);assert(s.titleShift>=previous);previous=s.titleShift;}
  assert.equal(samplePan(panTiming.returnEnd,335,72,titleWidth).titleShift,0);
  assert.equal(samplePan(panDuration,335,72,titleWidth).titleShift,0);
  assert.equal(samplePan(panDuration+1,335,72,titleWidth).phase,'end');
  assert.equal(panDuration,fullDuration,'no empty tail after the cat story');
});

test('title departure uses the exact fast-to-slow progress of the arriving ball',()=>{
  for(const width of widths) for(const titleWidth of [219,width-8]){
    const sceneWidth=Math.min(560,width/.7),ballStart=sceneWidth+20,ballTravel=ballStart-sceneWidth*.64;
    let previous=0,previousStep=Infinity;
    for(let i=0;i<=100;i++){
      const progress=i/100,state=samplePan(progress*ballArrivalTime,width,72,titleWidth);
      const titleProgress=-state.titleShift/(titleWidth+24);
      close(titleProgress,1-(1-progress)**3);
      close(titleProgress,(ballStart-state.ball.x)/ballTravel);
      assert(titleProgress>=0&&titleProgress<=1,'no overshoot');
      if(i>0){
        const step=titleProgress-previous;
        assert(step>0&&step<previousStep,'departure slows continuously, with no initial acceleration');
        previousStep=step;
      }
      previous=titleProgress;
    }
  }
});

test('title returns linearly throughout, without speed ramps or bounce',()=>{
  for(const width of widths) for(const titleWidth of [219,width-8]){
    const distance=titleWidth+24,duration=panTiming.returnEnd-panTiming.returnStart;
    let previous=-distance;
    for(let i=0;i<=100;i++){
      const progress=i/100,shift=samplePan(panTiming.returnStart+duration*progress,width,72,titleWidth).titleShift;
      close(shift,-distance*(1-progress));
      assert(shift>=-distance&&shift<=0,'no overshoot');
      if(i>0) close(shift-previous,distance/100);
      previous=shift;
    }
  }
});

test('title finishes leaving when the ball arrives, with no change to return timing',()=>{
  assert.equal(panTiming.exitEnd,ballArrivalTime);
  assert.equal(ballArrivalTime,.85);
  assert.equal(panTiming.returnStart,6.25);assert.equal(panTiming.returnEnd,8.35);
  for(const width of widths) for(const titleWidth of [219,width-8]){
    const sceneWidth=Math.min(560,width/.7),rest=sceneWidth*.64;
    assert(samplePan(ballArrivalTime-.01,width,72,titleWidth).ball.x>rest);
    const arrival=samplePan(ballArrivalTime,width,72,titleWidth);
    close(arrival.ball.x,rest);
    close(arrival.titleShift,-(titleWidth+24));
    close(samplePan(ballArrivalTime+.2,width,72,titleWidth).titleShift,arrival.titleShift);
  }
});

test('title overlaps the entering ball and still overlaps BOTH actors on return',()=>{
  for(const width of widths) for(const titleWidth of [219,width-8]){
    let entranceOverlap=0,exitOverlap=0,exitCatOverlap=0;
    for(let t=0;t<fullDuration;t+=.005){
      const s=samplePan(t,width,72,titleWidth),titleRight=titleWidth+s.titleShift;
      if(titleRight<12||s.titleShift===0) continue;
      const b=s.cat&&boundsFor(s.cat);
      const catVisible=b&&Math.min(width,s.view.x+b.right*s.view.scale)-Math.max(0,s.view.x+b.left*s.view.scale)>=8;
      const ballVisible=s.ball&&s.view.x+(s.ball.x-s.ball.radius)*s.view.scale<width&&s.view.x+(s.ball.x+s.ball.radius)*s.view.scale>0;
      if(t<panTiming.exitEnd&&ballVisible) entranceOverlap+=.005;
      if(t>panTiming.returnStart&&catVisible){exitCatOverlap+=.005;if(ballVisible)exitOverlap+=.005;}
    }
    assert(entranceOverlap>=.3,`entry overlap ${entranceOverlap} at ${width}/${titleWidth}`);
    assert(exitOverlap>=.3,`exit ball overlap ${exitOverlap} at ${width}/${titleWidth}`);
    assert(exitCatOverlap>=1,`exit cat overlap ${exitCatOverlap} at ${width}/${titleWidth}`);
  }
});

test('phone reproduces every desktop story pose rather than a shortened peek',()=>{
  for(const width of widths) for(const time of [0,.85,1.5,2.9,3.3,4.46,5.42,6.8,8.2]){
    const phone=samplePan(time,width),original=sampleFull(time,Math.min(560,width/.7),72/.7);
    assert.equal(phone.phase,original.phase);
    assert.deepEqual(phone.cat,original.cat);
    assert.deepEqual(phone.ball,original.ball);
  }
});

test('small-screen projection retains ears, tail and feet within the existing row',()=>{
  for(const width of widths){
    for(let time=.65;time<fullDuration;time+=.01){
      const s=samplePan(time,width),bounds=boundsFor(s.cat),{scale,x,y}=s.view;
      assert(bounds.left*scale+x>=0);
      assert(bounds.top*scale+y>=0);
      assert(bounds.bottom*scale+y<=72);
    }
    const first=samplePan(.65,width),last=samplePan(fullDuration-.001,width);
    assert(boundsFor(first.cat).left*first.view.scale+first.view.x>width);
    assert(boundsFor(last.cat).left*last.view.scale+last.view.x>width);
    assert((last.ball.x-last.ball.radius)*last.view.scale+last.view.x>width);
  }
});

test('the canvas paints at physical size, then applies the scene camera consistently',()=>{
  const events=[],ctx=new Proxy({}, {get:(_,method)=>(...args)=>events.push([method,...args]),set:()=>true});
  const state=samplePan(3.3,335);renderRaster(ctx,{leap:{}},state,335,72);
  assert.deepEqual(events[1],['clearRect',0,0,335,72]);
  assert.deepEqual(events[2],['fillRect',0,0,335,72]);
  assert.deepEqual(events[3],['translate',state.view.x,0]);
  assert.deepEqual(events[4],['scale',.7,.7]);
  assert.equal(events.at(-1)[0],'restore');
});
