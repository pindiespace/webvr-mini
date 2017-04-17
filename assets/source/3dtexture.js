
'use strict';
var gl,//obal
Gradient = {
	color: new Array(256),
	init: function(){
		var min=1e9,max=-1e9,dir=true;
		this.color[0] = 0;
		for (var i=1;i<256;i++) {
			dir = Math.random()>0.25?dir:!dir;
			var c = this.color[i-1]+(dir?0.1:-0.1)*Math.random();
			if (c<min)
				min=c;
			if (c>max)
				max=c;
			this.color[i] = c;
		}
		var d=max-min+0.2;
		for (var i=0;i<256;i++)
			this.color[i] = (this.color[(i+128)%256]-min)/d+0.2;
	}
},
CubicInterpolator = {
	getCubicVal: function(p0,p1,p2,p3,x) {
		return p1+0.5*x*(p2-p0+x*(2.0*p0-5.0*p1+4.0*p2-p3+x*(3.0*(p1-p2)+p3-p0)));
	},
	getCubicArr: function(p,x) {
		return this.getCubicVal(p[0],p[1],p[2],p[3],x);
	},
	getCubic: function(v,i,j,k,x) {
		var x0 = i<0?0:i,
			x1 = i+1>v.length-1?v.length-1:i+1,
			x2 = i+2>v.length-1?v.length-1:i+2,
			x3 = i+3>v.length-1?v.length-1:i+3;
		return this.getCubicVal(
			v[x0][j][k],
			v[x1][j][k],
			v[x2][j][k],
			v[x3][j][k],x
		);
	},
	getBicubic: function(v,i,j,k,x,y) {
		var y0 = j<0?0:j,
			y1 = j+1>v.length-1?v.length-1:j+1,
			y2 = j+2>v.length-1?v.length-1:j+2,
			y3 = j+3>v.length-1?v.length-1:j+3;
		return this.getCubicVal(
			this.getCubic(v,i,y0,k,x),
			this.getCubic(v,i,y1,k,x),
			this.getCubic(v,i,y2,k,x),
			this.getCubic(v,i,y3,k,x),y
		);
	},
	getTricubic: function(v,i,j,k,x,y,z) {
		var z0 = k<0?0:k,
			z1 = k+1>v.length-1?v.length-1:k+1,
			z2 = k+2>v.length-1?v.length-1:k+2,
			z3 = k+3>v.length-1?v.length-1:k+3;
		return this.getCubicVal(
			this.getBicubic(v,i,j,z0,x,y),
			this.getBicubic(v,i,j,z1,x,y),
			this.getBicubic(v,i,j,z2,x,y),
			this.getBicubic(v,i,j,z3,x,y),z
		);
	}
};
function QuadModel(){
	this.v = [];
	this.c = [];
}
QuadModel.prototype = {
	clear: function() {
		this.v.clear();
		this.c.clear();
	},
	quadXM: function(x,y,z,c){
		var y1=y+1,z1=z+1;
		this.v.push(x,y,z, x,y,z1, x,y1,z1, x,y,z, x,y1,z1, x,y1,z);
		for (var i=0;i<6;i++)
			this.c.push(c,0.7*c,0.5*c,1);
	},
	quadXP: function(x,y,z,c){
		var y1=y+1,z1=z+1;
		this.v.push(x,y,z, x,y1,z1, x,y,z1, x,y,z, x,y1,z, x,y1,z1);
		for (var i=0;i<6;i++)
			this.c.push(c,0.7*c,0.5*c,1);
	},
	quadYM: function(x,y,z,c){
		var x1=x+1,z1=z+1;
		this.v.push(x,y,z, x1,y,z, x1,y,z1, x,y,z, x1,y,z1, x,y,z1);
		for (var i=0;i<6;i++)
			this.c.push(c,0.7*c,0.5*c,1);
	},
	quadYP: function(x,y,z,c){
		var x1=x+1,z1=z+1;
		this.v.push(x,y,z, x1,y,z1, x1,y,z, x,y,z, x,y,z1, x1,y,z1);
		for (var i=0;i<6;i++)
			this.c.push(c,0.7*c,0.5*c,1);
	},
	quadZM: function(x,y,z,c){
		var x1=x+1,y1=y+1;
		this.v.push(x,y,z, x,y1,z, x1,y1,z, x,y,z, x1,y1,z, x1,y,z);
		for (var i=0;i<6;i++)
			this.c.push(c,0.7*c,0.5*c,1);
	},
	quadZP: function(x,y,z,c){
		var x1=x+1,y1=y+1;
		this.v.push(x,y,z, x1,y1,z, x,y1,z, x,y,z, x1,y,z, x1,y1,z);
		for (var i=0;i<6;i++)
			this.c.push(c,0.7*c,0.5*c,1);
	}
}
function SampledInterpolator(d,dm,samples) {
	var i,x,y,z;
	this.data = new Array(d);
	for (x=0;x<d;x++) {
		this.data[x] = new Array(d);
		for (y=0;y<d;y++) {
			this.data[x][y] = new Array(d);
			for (z=0;z<d;z++)
				this.data[x][y][z] = 0;
		}
	}
	for (i=0;i<samples;i++) {
		var master = new Array(dm);
		for (x=0;x<dm;x++) {
			master[x] = new Array(dm);
			for (y=0;y<dm;y++) {
				master[x][y] = new Array(dm);
				for (z=0;z<dm;z++)
					master[x][y][z] = Math.random();
			}
		}
		var tdat = this.interpolateTricubic(master,d);
		for (y=0;y<d;y++)
			for (x=0;x<d;x++)
				for (z=0;z<d;z++)
					this.data[x][y][z] += tdat[x][y][z]/dm;
		dm = (((dm-1)<<1)+1);
		//dm++;
	}
	var a=Math.floor(d/3), b=Math.floor(2*d/3)+1;
	this.thres =
		(this.data[a][a][a]
		+this.data[a][a][b]
		+this.data[a][b][a]
		+this.data[a][b][b]
		+this.data[b][a][a]
		+this.data[b][a][b]
		+this.data[b][b][a]
		+this.data[b][b][b])/8;
	/*
	for (x=0;x<d;x++)
		for (y=0;y<d;y++)
			for (z=0;z<d;z++)
				this.data[x][y][z] /= samples;
	*/
	this.doFilter();
}
SampledInterpolator.prototype = {
	interpolateTricubic: function(m,n) {
		var x,y,z,i,j,k,u,v,w,il,jl,kl,
			d=m.length-1,
			l=d/n,
			c = new Array(n);
		for (i=0;i<n;i++) {
			il = i*l;
			u = ~~il;
			x = il-u;
			c[i] = new Array(n);
			for (j=0;j<n;j++) {
				jl = j*l;
				v = ~~jl;
				y = jl-v;
				c[i][j] = new Array(n);
				for (k=0;k<n;k++) {
					kl = k*l;
					w = ~~kl;
					z = kl-w;
					c[i][j][k] = CubicInterpolator.getTricubic(m,u-1,v-1,w-1,x,y,z);
				}
			}
		}
		return c;
	},
	doFilter: function() {
		var x,y,z,d=this.data.length;
		this.cubes = 0;
		this.filter = new Array(d);
		for (x=0;x<d;x++) {
			this.filter[x] = new Array(d);
			for (y=0;y<d;y++) {
				this.filter[x][y] = new Array(d);
				for (z=0;z<d;z++)
					if (this.filter[x][y][z] = this.data[x][y][z]>this.thres-0.015 && this.data[x][y][z]<this.thres+0.015)
						this.cubes++;
			}
		}
		return this;
	},
	doFilterSphere: function() {
		var x,y,z,dx,dy,dz,x2,y2,z2,d=this.data.length,dh=d>>1,d2=dh*dh;
		this.cubes = 0;
		this.filter = new Array(d);
		for (x=0;x<d;x++) {
			dx = x-dh;
			x2 = dx*dx;
			this.filter[x] = new Array(d);
			for (y=0;y<d;y++) {
				dy = y-dh;
				y2 = dy*dy;
				this.filter[x][y] = new Array(d);
				for (z=0;z<d;z++) {
					dz = z-dh;
					z2 = dz*dz;
					if (this.filter[x][y][z] = x2+y2+z2<d2)
						this.cubes++;
				}
			}
		}
		return this;
	}
};
	
({
	DIM: 80,
	mode: true,
	volume: false,
	mouse: {button:false,x:0,y:0,u:0,v:0,max:50},
	keyMask: 0,
	rot: {x:0,y:0},
	pos: {x:0,y:0},
	rMatrix: new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,-100,1]),
	uniRM: false,
	perspective: function(fovy, aspect, n, f) {
		var t = Math.tan(fovy*Math.PI/360)*n,
			b = -t,
			l = aspect * b,
			r = aspect * t;
		//return this.frustum(l, r, b, t, n, f);
		return [
			2*n/(r-l),	0,			(r+l)/(r-l),	0,
			0,			2*n/(t-b),	(t+b)/(t-b),	0,
			0,			0,			-(f+n)/(f-n),	-(2*f*n)/(f-n),
			0,			0,			-1,				0
		];
	},
	init: function() {
		Gradient.init();
		this.rMatrix[14] = -this.DIM-40;
		this.canvas = document.createElement('canvas');
		try {
			gl=this.canvas.getContext('webgl')||this.canvas.getContext('experimental-webgl');
		} catch(e){}
		if (!gl)
			alert('WebGL not initialized!');
		gl.clearColor(0.9,0.95,1,1);
		gl.clearDepth(1);
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.depthFunc(gl.LEQUAL);
		this.initShaders();
		this.createData();
		this.createScene();
		this.doResize();
		this.run();
		var self = this;
		document.body.appendChild(this.canvas);
		document.addEventListener('mousedown', function(e){self.mouseDown(e);});
		document.addEventListener('mouseup', function(e){self.mouseUp(e);});
		document.addEventListener('mouseout', function(e){self.mouseUp(e);});
		document.addEventListener('mousemove', function(e){self.mouseMove(e);});
		document.addEventListener('keydown', function(e){self.keyDown(e);});
		document.addEventListener('keyup', function(e){self.keyUp(e);});
		document.addEventListener('DOMMouseScroll', function(e){self.mouseWheel(e);});
		document.addEventListener('mousewheel', function(e){self.mouseWheel(e);});
		window.addEventListener('resize', function(e){self.resize(e);});
	},
	initShaders: function()  {
		var sh = gl.createProgram();
		gl.attachShader(sh, this.getShader(gl, 'shader-vs'));
		gl.attachShader(sh, this.getShader(gl, 'shader-fs'));
		gl.linkProgram(sh);
		if (!gl.getProgramParameter(sh, gl.LINK_STATUS))
			alert('Shaders not initialized!');
		gl.useProgram(sh);
		this.vertexPositionAttribute = gl.getAttribLocation(sh, 'aPos');
		this.vertexColorAttribute = gl.getAttribLocation(sh, 'aCol');
		this.uniRM = gl.getUniformLocation(sh, 'uMVMatrix');
		this.shader = sh;
		gl.enableVertexAttribArray(this.vertexPositionAttribute);
		gl.enableVertexAttribArray(this.vertexColorAttribute);
	},
	getShader: function(gl,id) {
		var s,script = document.getElementById(id);
		if (script.type === 'x-shader/x-fragment')
			s = gl.createShader(gl.FRAGMENT_SHADER);
		else if (script.type === 'x-shader/x-vertex')
			s = gl.createShader(gl.VERTEX_SHADER);
		else
			return null;
		gl.shaderSource(s, script.firstChild.data);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
			alert('GLSL compile error:\n' + gl.getShaderInfoLog(s));
		return s;
	},
	arrayToBuffer: function(arr,itemSize,ptr) {
		var buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
		buf.itemSize = itemSize;
		buf.numItems = arr.length/buf.itemSize;
		gl.vertexAttribPointer(ptr, buf.itemSize, gl.FLOAT, false, 0, 0);
		return buf;
	},
	createData: function() {
		var time = Date.now(),
			samples = ~~(Math.random()*2)+2,
			segments = ~~(Math.random()*2)+3;
		if (samples+segments>5) {
			if (Math.random()>0.5)
				samples--;
			else
				segments--;
		}
		this.si = new SampledInterpolator(this.DIM,segments,samples);
		console.log('noise with '+samples+' layers * '+segments+' segments in '+(Date.now()-time)+'ms');
	},
	createScene: function() {
		var time = Date.now(),
			dat=this.si.data,filt=this.si.filter,t=this.si.thres,
			x,y,z,x0,y0,z0,x1,y1,z1,
			c,d=this.DIM,d2=d/2,
			m = new QuadModel();
		if (this.volume){
			z0=-d2,z1=d-d2;
			for (x=0;x<d;x++) {
				x0=x-d2;x1=x0+1;
				for (y=0;y<d;y++) {
					y0=y-d2;y1=y0+1;
					m.quadXM(z0,x0,y0,Gradient.color[~~(dat[0][x][y]*256)]*0.5);
					m.quadXP(z1,x0,y0,Gradient.color[~~(dat[d-1][x][y]*256)]*0.6);
					m.quadYM(x0,z0,y0,Gradient.color[~~(dat[x][0][y]*256)]*0.4);
					m.quadYP(x0,z1,y0,Gradient.color[~~(dat[x][d-1][y]*256)]*0.7);
					m.quadZM(x0,y0,z0,Gradient.color[~~(dat[x][y][0]*256)]*0.3);
					m.quadZP(x0,y0,z1,Gradient.color[~~(dat[x][y][d-1]*256)]*0.8);
				}
			}
		} else {
			//this.si.doFilterSphere();
			//filt = this.si.filter;
			for (x=0;x<d;x++) {
				x0=x-d2;x1=x0+1;
				for (y=0;y<d;y++) {
					y0=y-d2;y1=y0+1;
					for (z=0;z<d;z++) {
						z0=z-d2;z1=z0+1;
						if (filt[x][y][z])
						{
							c=this.color?Gradient.color[~~(dat[x][y][z]*256)]:1;
							if (x===d-1||!filt[x+1][y][z])
								m.quadXP(x1,y0,z0,c*0.6);
							if (y===d-1||!filt[x][y+1][z])
								m.quadYP(x0,y1,z0,c*0.7);
							if (z===d-1||!filt[x][y][z+1])
								m.quadZP(x0,y0,z1,c*0.8);
							if (x===0||!filt[x-1][y][z])
								m.quadXM(x0,y0,z0,c*0.5);
							if (y===0||!filt[x][y-1][z])
								m.quadYM(x0,y0,z0,c*0.4);
							if (z===0||!filt[x][y][z-1])
								m.quadZM(x0,y0,z0,c*0.3);
						}
					}
				}
			}
		}
		this.arrayToBuffer(m.c,4,this.vertexColorAttribute);
		this.numItems = this.arrayToBuffer(m.v,3,this.vertexPositionAttribute).numItems;
		console.log(this.si.cubes+' voxels, '+m.v.length+' vertices in '+(Date.now()-time)+'ms');
	},
	render: function() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		var cx = Math.cos(this.rot.x),
			sx = Math.sin(this.rot.x),
			cy = Math.cos(this.rot.y),
			sy = Math.sin(this.rot.y),
			r = this.rMatrix;
		r[0]=cy;r[1]=sx*sy;r[2]=-cx*sy,
		r[5]=cx;r[6]=sx;
		r[8]=sy;r[9]=-sx*cy;r[10]=cx*cy;
		gl.uniformMatrix4fv(this.uniRM, false, r);
		gl.drawArrays(this.mode?gl.TRIANGLES:gl.LINES, 0, this.numItems);
	},
	run: function() {
		if (this.change){
			this.change = false;
			this.render();
		}
		var self = this;
		requestAnimationFrame(function(){
			self.run();
		});
	},
	resize: function() {
		clearTimeout(this.resizeTimer);
		var self = this;
		this.resizeTimer = setTimeout(function(){
			self.doResize();
		},200);
	},
	doResize: function() {
		this.canvas.width=window.innerWidth;
		this.canvas.height=window.innerHeight-document.getElementById('info').clientHeight;
		this.pMatrix = new Float32Array(this.perspective(30,window.innerWidth/this.canvas.height,1,1000));
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shader, 'uPMatrix'),false,this.pMatrix);
		this.change = true;
	},
	mouseWheel: function(evt)  {
		//this.rMatrix[14] += evt.wheelDelta/200.0;
		if (this.color) {
			if (evt.wheelDelta>0||evt.detail>0)
				for (var i=0;i<3;i++)
					Gradient.color.push(Gradient.color.shift());
			else
				for (var i=0;i<3;i++)
					Gradient.color.unshift(Gradient.color.pop());
		} else {
			this.si.thres += evt.detail?evt.detail/1000.0:evt.wheelDelta/10000.0;
			this.si.doFilter();
		}
		this.createScene();
		this.render();
	},
	mouseMove: function(evt) {
		if (this.mouse.button) {
			this.mouse.u = evt.clientX-this.mouse.x;
			this.mouse.v = evt.clientY-this.mouse.y;
			if (this.mouse.u>this.mouse.max)
				this.mouse.u=this.mouse.max;
			else if (this.mouse.u<-this.mouse.max)
				this.mouse.u=-this.mouse.max;
			if (this.mouse.v>this.mouse.max)
				this.mouse.v=this.mouse.max;
			else if (this.mouse.v<-this.mouse.max)
				this.mouse.v=-this.mouse.max;
			this.move();
			this.mouse.x=evt.clientX;
			this.mouse.y=evt.clientY;
		}
	},
	slowDown: function() {
		this.mouse.u *= 0.97;
		this.mouse.v *= 0.9;
		if (this.mouse.u>1||this.mouse.v>1||this.mouse.u<-1||this.mouse.v<-1) {
			this.move();
		} else
			clearInterval(this.slowDownTimer);
	},
	move: function() {
		this.rot.y+=this.mouse.u/360;
		this.rot.x+=this.mouse.v/360;
		if (this.rot.x>Math.PI/2)
			this.rot.x=Math.PI/2;
		else if (this.rot.x<-Math.PI/2)
			this.rot.x=-Math.PI/2;
		this.change = true;
	},
	mouseDown: function(evt) {
		this.mouse.button=true;
		this.mouse.x=evt.clientX;
		this.mouse.y=evt.clientY;
		this.mouse.u = 0;
		this.mouse.v = 0;
		clearInterval(this.slowDownTimer);
	},
	mouseUp: function(evt) {
		this.mouse.button=false;
		var self = this;
		this.slowDownTimer = setInterval(function(){
			self.slowDown();
		},20);
	},
	keyDown: function(e) {
		switch(e.keyCode) {
			case 78: this.createData(); this.createScene(); break;
			case 84: this.color=!this.color; this.createScene(); break;
			case 86: this.color=this.volume=!this.volume; this.createScene(); break;
			case 87: this.mode=!this.mode; break;
			case 37: this.startKeyTimer(1); break;
			case 40: this.startKeyTimer(2); break;
			case 39: this.startKeyTimer(4); break;
			case 38: this.startKeyTimer(8); break;
			case 107:
			case 187: this.mouseWheel({detail:-3}); break;
			case 109:
			case 189: this.mouseWheel({detail:3});
		}
		this.change = true;
	},
	keyUp: function(e) {
		switch(e.keyCode) {
			case 37: this.keyMask &= ~1; break;
			case 40: this.keyMask &= ~2; break; 
			case 39: this.keyMask &= ~4; break;
			case 38: this.keyMask &= ~8;
		}
	},
	startKeyTimer: function(mask){
		this.keyMask |= mask; 
		if (this.keyTimer)
			return;
		var self = this;
		this.keyTimer = setInterval(function(){
			self.processKeys();
		},20);
	},
	processKeys: function() {
		if (this.keyMask===0) {
			clearInterval(this.keyTimer);
			this.keyTimer = null;
		}
		if (this.keyMask&1)
			this.rMatrix[12]-=2;
		if (this.keyMask&2)
			this.rMatrix[13]-=2;
		if (this.keyMask&4)
			this.rMatrix[12]+=2;
		if (this.keyMask&8)
			this.rMatrix[13]+=2;
		this.change = true;
	}
}).init();
		