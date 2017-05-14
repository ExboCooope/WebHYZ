/**
 * Created by Exbo on 2015/11/21.
 * 和数学、算法相关的实用函数
 */



function sArrowRotateTo(arrow1,arrow2){
    var t=arrow2-arrow1;
    if(t<0){
        t=t+(((-t/PI2)>>0)+1)*PI2;
    }else{
        t=t%PI2;
    }
    if(t>PI)t=t-PI2;
    return t;
}

function sArrowRotateToClockWise(arrow1,arrow2,dir){
    var t=arrow2-arrow1;
    if(t<0){
        t=t+(((-t/PI2)>>0)+1)*PI2;
    }else{
        t=t%PI2;
    }
    if(!dir)return t-PI2;
    return t;
}


function sLookAt(vaP0,vaP1){
    return atan2(vaP1[1]-vaP0[1],vaP1[0]-vaP0[0]);
}

function clone(o){
    var k, ret= o, b;
    if(o && ((b = (o instanceof Array)) || o instanceof Object)) {
        ret = b ? [] : {};
        for(k in o){
            if(o.hasOwnProperty(k)){
                ret[k] = clone(o[k]);
            }
        }
    }
    return ret;
}

function miscCloneApply(ret,o){
    var k;
    var b;
    for(k in o){
        if(o.hasOwnProperty(k)){
            if(ret[k] instanceof Array || ret[k] instanceof Object){
                miscCloneApply(ret[k],o[k]);
            }else{
                if( (b = (o[k] instanceof Array)) || o[k] instanceof Object){
                    ret[k]=(b ? [] : {});
                    miscCloneApply(ret[k],o[k]);
                }else{
                    ret[k]=o[k];
                }
            }
        }
    }

}


function getRgb(c){
    c= c.toLowerCase();
    if (/^[a-z]+$/.test(c)){
        var colornames={
            aqua:'#00ffff', black:'#000000', blue:'#0000ff', fuchsia:'#ff00ff',
            gray:'#808080', green:'#008000', lime:'#00ff00', maroon:'#800000',
            navy:'#000080', olive:'#808000', orange:'#ffa500', purple:'#800080',
            red:'#ff0000', silver:'#c0c0c0', teal:'#008080', white:'#ffffff',
            yellow:'#ffff00'
        };
        c= colornames[c];
    }
    if(/^#([a-f0-9]{3}){1,2}$/.test(c)){
        if(c.length== 4){
            c= '#'+[c[1], c[1], c[2], c[2], c[3], c[3]].join('');
        }
        c= '0x'+c.substring(1);
        return [(c>>16)&255, (c>>8)&255, c&255];
    }
    else if(c.indexOf('rgb')== 0){
        c= c.match(/\d+(\.\d+)?%?/g);
        if(c){
            for(var i= 0;i<3;i++){
                if(c[i].indexOf('%')!= -1){
                    c[i]= Math.round(parseFloat(c[i])*2.55);
                }
                if(c[i]<0) c[i]= 0;
                if(c[i]>255) c[i]= 255;
            }
            return c;
        }
    }
    return [0,0,0];
}

var stg_rand_seed=[0];
function stg_rnd(){
    stg_rand_seed[0]=stg_rand_seed[0]*9301+49297;
    stg_rand_seed[0]= stg_rand_seed[0]%233280;
    return stg_rand_seed[0]/233280.0;
}

function stg_rand(low,high){
    if(!high)return low*stg_rnd();
    return (high-low)*stg_rnd()+low;
}
function stg_rand_int(low,high){
    if(!high)return Math.floor(stg_rnd()*(low+1));
    return Math.floor((high-low+1)*stg_rnd()+low);
}

function pointToLine(x,y,r,x1,y1,dir,ls,rs,le,re) {
    var kdx = x - x1;
    var kdy = y - y1;
    var sinr = sin(dir);
    var cosr = cos(dir);
    var dl = kdx * cosr + kdy * sinr;
    var dd = kdy * cosr - kdx * sinr;
    if (dl <= ls) {
        stg_laser_close[0] = x + ls * cosr;
        stg_laser_close[1] = y + ls * sinr;
        return sqrt2x(dl - ls, dd) - r - rs;
    }
    if (dl >= le) {
        stg_laser_close[0] = x + le * cosr;
        stg_laser_close[1] = y + le * sinr;
        return sqrt2x(dl - le, dd) - r - re;
    }
    stg_laser_close[0] = x + dl * cosr;
    stg_laser_close[1] = y + dl * sinr;
    var rate = (dl - ls) / (le - ls);
    return (dd < 0 ? -dd : dd) - r - rate * rs - (1 - rate) * re;
}

function bezier42(x1,x2,f){
    var q=1-f;
    var q1=q*q*q+3*q*q*f;
    var q2=f*f*f+3*q*f*f;
    return q1*x1+q2*x2;
}

function clamp(x1,x2,f){
    var q=1-f;
    return q*x1+f*x2;
}

function extendlength(pos,dir,len){
    return [pos[0]+cos(dir)*len,pos[1]+sin(dir)*len];
}

var POW2={};
POW2[1]=1;
POW2[1<<1]=1;
POW2[1<<2]=1;
POW2[1<<3]=1;
POW2[1<<4]=1;
POW2[1<<5]=1;
POW2[1<<6]=1;
POW2[1<<7]=1;
POW2[1<<8]=1;
POW2[1<<9]=1;
POW2[1<<10]=1;
POW2[1<<11]=1;
POW2[1<<12]=1;

