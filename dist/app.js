!function(){"use strict";function t(t){return document.getElementById(t)}let i,e;const s={},n=t=>t.reduce((t,i)=>t?t[i]:t,i);async function h(t){const e=t.data;let h,a,r;if(h=e&&e.id)if((a=e.type)&&i){e.path=e.path||[];const i={id:h},s=n(e.path),r=n(e.path.slice(0,-1));switch(a){case"G":i.value=s;break;case"S":const n=e.path.length&&e.path.pop();n&&(r[n]=e.value);break;case"A":try{i.value=await s.apply(r,e.args||[])}catch(t){i.error=t.toString()}}t.source.postMessage(i,"*")}else(r=s[h])&&(delete s[h],e.error?r[1](new Error(e.error)):r[0](e.value))}function a(){e||(self.addEventListener("message",h),e=!0)}const r=new class{constructor(t,e){this.bricksDrawnOnce=!1,this.running=!1,this.bricksLeft=0,this.refWinWidth=0,this.refWinHeight=0,this.pendingWindowResize=!1,this.baseSpeed=1,this.lastUpdated=0,this.brickCanvas=t,this.ballCanvas=e,this.root=function(t){return function t(i,e){return e=e||[],new Proxy(function(){},{get(s,n,h){if("then"===n){if(0===e.length)return{then:()=>h};const t=i({type:"G",path:e});return t.then.bind(t)}return t(i,e.concat(n))},set:(t,s,n)=>i({type:"S",path:e.concat(s),value:n}),apply:(t,s,n)=>i({type:"A",path:e,args:n})})}(function(t){const i=`${Date.now()}-${Math.floor(Math.random()*Number.MAX_SAFE_INTEGER)}`;let e=0;return a(),n=>{const h=n.args||[],a=`${i}-${++e}`;return new Promise((i,e)=>{s[a]=[i,e],t.postMessage(Object.assign({},n,{id:a,args:h}),"*")})}}(t))}(window.opener),this.gameState={level:1,livesLeft:5,score:0},function(t){i=t,a()}(this)}initialize(t,i){this.setState(i),this.config=t;const e=window.innerWidth,s=window.innerHeight;this.brickCanvas.width=e,this.brickCanvas.height=s,this.ballCanvas.width=e,this.ballCanvas.height=s,this.brickCanvas.style.opacity="1",this.ballCanvas.style.opacity="1",this.refWinWidth=window.outerWidth,this.refWinHeight=window.outerHeight;const n=Math.floor((e+this.config.brickGap)/(this.config.brickWidth+this.config.brickGap)),h=n*this.config.brickWidth+(n-1)*this.config.brickGap,a=Math.floor((e-h)/2),r=[];for(let t=0;t<this.config.rowCount;t++){const i=`hsl(${(t+(this.config.paddleWindow?this.config.rowCount:0))*Math.round(360/(2*this.config.rowCount))}, 80%, 70%)`;for(let e=0;e<n;e++)r.push({broken:!1,color:i,x:a+e*(this.config.brickWidth+this.config.brickGap),y:this.config.brickGap+t*(this.config.brickGap+this.config.brickHeight)})}const o={radius:this.config.ballRadius,x:0,y:0,dx:0,dy:0},d={height:6,width:70,x:Math.round(e/2)-15,y:s-10};this.bricksLeft=r.length,this.gameModel={ball:o,paddle:d,bricks:r,width:e,height:s},this.bricksDrawnOnce=!1,this.resetBall(),this.draw(!1)}get model(){return this.gameModel}start(){this.running||(this.running=!0,this.nextFrame())}stop(){this.running=!1}resetBall(){const t=this.model.ball,i=this.config.baseSpeed+.75*(this.gameState.level-1);t.x=Math.round(this.model.width/2),t.y=10+this.config.rowCount*(this.config.brickHeight+this.config.brickGap),t.dy=i,t.dx=(.2+.2*Math.random())*i*(Math.random()>.5?-1:1),this.baseSpeed=i,this.lastUpdated=0}ensureWindowSize(){this.refWinHeight&&this.refWinWidth&&!this.pendingWindowResize&&(this.refWinWidth===window.outerWidth&&this.refWinHeight===window.outerHeight||(this.pendingWindowResize=!0,setTimeout(()=>{this.pendingWindowResize=!1,window.resizeTo(this.refWinWidth,this.refWinHeight)},500)))}now(){return performance&&performance.now?performance.now():Date.now()}update(){const t=this.model.ball,i=this.model.paddle,e=this.now();let s=1;const n=e-this.lastUpdated;this.lastUpdated>0&&n<1e3&&(s=60*n/1e3);const h=t.x+t.dx*s;let a=t.y+t.dy*s;this.lastUpdated=e;let r=0;if(t.y<=10+this.config.rowCount*(this.config.brickHeight+this.config.brickGap))for(let i=0;i<this.model.bricks.length;i++){const e=this.model.bricks[i];if(!e.broken){const i=t.x-Math.max(e.x,Math.min(t.x,e.x+this.config.brickWidth)),s=t.y-Math.max(e.y,Math.min(t.y,e.y+this.config.brickHeight));if(i*i+s*s<t.radius*t.radius){e.broken=!0,r=t.y>=e.y&&t.y<=e.y+this.config.brickHeight?-1:1,this.bricksLeft--,this.root.hit(this.bricksLeft>0);break}}}const o=t.dx>0?1:-1;if(r)r<0?t.dx=-t.dx:t.dy=-t.dy;else if((h>this.model.width-t.radius||h<t.radius)&&(t.dx=-t.dx),a<t.radius)t.dy=-t.dy;else if(a>=i.y-t.radius&&a<i.y+i.height&&h>=i.x&&h<i.x+i.width){t.dy=-t.dy;const e=Math.abs(t.dx),s=(h-(i.x+i.width/2))/i.width,n=Math.min(1.4*this.baseSpeed,1.4*e),r=Math.max(.2*this.baseSpeed,.6*e);s>0?t.dx=o*(2*(n-e)*s+e):s<0&&(t.dx=o*(2*(e-r)*s+e)),a=i.y-t.radius}else if(a>this.model.height-t.radius)return!1;return t.x=Math.min(this.model.width-t.radius,Math.max(t.radius,h)),t.y=Math.max(t.radius,a),!0}async draw(t){this.ensureWindowSize();const i=this.model.paddle,e=await this.root.getPaddlePosition();this.config.paddleWindow?i.x=e.xr*this.model.width:(i.x=e.x,i.y=e.y,i.width=e.width);const s=this.bricksLeft,n=this.update();if(this.drawBallCanvas(),this.bricksDrawnOnce?s!==this.bricksLeft&&this.drawBricks():(this.drawBricks(),this.bricksDrawnOnce=!0),n){if(this.bricksLeft<=0)return}else this.root.died(),this.stop();t&&this.nextFrame()}nextFrame(){this.running&&requestAnimationFrame(()=>this.draw(!0))}drawBallCanvas(){const t=this.ballCanvas.getContext("2d");t.clearRect(0,0,this.model.width,this.model.height);const i=this.model.ball;if(t.save(),t.fillStyle="white",t.beginPath(),t.ellipse(i.x,i.y,i.radius,i.radius,0,0,2*Math.PI),t.fill(),t.closePath(),t.restore(),this.config.paddleWindow){const i=this.model.paddle;t.save(),t.fillStyle="white",t.fillRect(i.x,i.y,i.width,i.height),t.restore()}}drawBricks(){const t=this.brickCanvas.getContext("2d");t.clearRect(0,0,this.model.width,this.model.height),t.save(),this.model.bricks.forEach(i=>{i.broken||(t.fillStyle=i.color,t.fillRect(i.x,i.y,this.config.brickWidth,this.config.brickHeight))}),t.restore()}launchBall(){this.stop(),this.resetBall(),setTimeout(()=>{this.start()})}setState(t){this.gameState=t,document.title=`Balls left: ${t.livesLeft}`}async connect(){await this.root.ready()}setLabel(i){this.overlay||(this.overlay=t("overlay")),i?(this.overlay.textContent=i,this.overlay.style.opacity="1"):(this.overlay.textContent="",this.overlay.style.opacity=null)}}(t("brickCanvas"),t("ballCanvas"));setTimeout(()=>{r.connect()},500)}();
