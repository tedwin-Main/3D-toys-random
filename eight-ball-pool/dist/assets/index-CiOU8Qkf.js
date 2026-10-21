(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))s(l);new MutationObserver(l=>{for(const c of l)if(c.type==="childList")for(const f of c.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&s(f)}).observe(document,{childList:!0,subtree:!0});function i(l){const c={};return l.integrity&&(c.integrity=l.integrity),l.referrerPolicy&&(c.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?c.credentials="include":l.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function s(l){if(l.ep)return;l.ep=!0;const c=i(l);fetch(l.href,c)}})();var Kd={exports:{}},Al={};/**
 * @license React
 * react-jsx-runtime.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Mx;function OE(){if(Mx)return Al;Mx=1;var r=Symbol.for("react.transitional.element"),t=Symbol.for("react.fragment");function i(s,l,c){var f=null;if(c!==void 0&&(f=""+c),l.key!==void 0&&(f=""+l.key),"key"in l){c={};for(var d in l)d!=="key"&&(c[d]=l[d])}else c=l;return l=c.ref,{$$typeof:r,type:s,key:f,ref:l!==void 0?l:null,props:c}}return Al.Fragment=t,Al.jsx=i,Al.jsxs=i,Al}var Ex;function PE(){return Ex||(Ex=1,Kd.exports=OE()),Kd.exports}var ie=PE(),Jd={exports:{}},Rl={},Qd={exports:{}},jd={};/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var bx;function IE(){return bx||(bx=1,(function(r){function t(k,Q){var ct=k.length;k.push(Q);t:for(;0<ct;){var lt=ct-1>>>1,pt=k[lt];if(0<l(pt,Q))k[lt]=Q,k[ct]=pt,ct=lt;else break t}}function i(k){return k.length===0?null:k[0]}function s(k){if(k.length===0)return null;var Q=k[0],ct=k.pop();if(ct!==Q){k[0]=ct;t:for(var lt=0,pt=k.length,yt=pt>>>1;lt<yt;){var Yt=2*(lt+1)-1,Wt=k[Yt],V=Yt+1,_t=k[V];if(0>l(Wt,ct))V<pt&&0>l(_t,Wt)?(k[lt]=_t,k[V]=ct,lt=V):(k[lt]=Wt,k[Yt]=ct,lt=Yt);else if(V<pt&&0>l(_t,ct))k[lt]=_t,k[V]=ct,lt=V;else break t}}return Q}function l(k,Q){var ct=k.sortIndex-Q.sortIndex;return ct!==0?ct:k.id-Q.id}if(r.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var c=performance;r.unstable_now=function(){return c.now()}}else{var f=Date,d=f.now();r.unstable_now=function(){return f.now()-d}}var m=[],p=[],_=1,v=null,g=3,y=!1,b=!1,C=!1,M=!1,S=typeof setTimeout=="function"?setTimeout:null,N=typeof clearTimeout=="function"?clearTimeout:null,I=typeof setImmediate<"u"?setImmediate:null;function A(k){for(var Q=i(p);Q!==null;){if(Q.callback===null)s(p);else if(Q.startTime<=k)s(p),Q.sortIndex=Q.expirationTime,t(m,Q);else break;Q=i(p)}}function U(k){if(C=!1,A(k),!b)if(i(m)!==null)b=!0,L||(L=!0,K());else{var Q=i(p);Q!==null&&j(U,Q.startTime-k)}}var L=!1,P=-1,T=5,D=-1;function H(){return M?!0:!(r.unstable_now()-D<T)}function G(){if(M=!1,L){var k=r.unstable_now();D=k;var Q=!0;try{t:{b=!1,C&&(C=!1,N(P),P=-1),y=!0;var ct=g;try{e:{for(A(k),v=i(m);v!==null&&!(v.expirationTime>k&&H());){var lt=v.callback;if(typeof lt=="function"){v.callback=null,g=v.priorityLevel;var pt=lt(v.expirationTime<=k);if(k=r.unstable_now(),typeof pt=="function"){v.callback=pt,A(k),Q=!0;break e}v===i(m)&&s(m),A(k)}else s(m);v=i(m)}if(v!==null)Q=!0;else{var yt=i(p);yt!==null&&j(U,yt.startTime-k),Q=!1}}break t}finally{v=null,g=ct,y=!1}Q=void 0}}finally{Q?K():L=!1}}}var K;if(typeof I=="function")K=function(){I(G)};else if(typeof MessageChannel<"u"){var it=new MessageChannel,X=it.port2;it.port1.onmessage=G,K=function(){X.postMessage(null)}}else K=function(){S(G,0)};function j(k,Q){P=S(function(){k(r.unstable_now())},Q)}r.unstable_IdlePriority=5,r.unstable_ImmediatePriority=1,r.unstable_LowPriority=4,r.unstable_NormalPriority=3,r.unstable_Profiling=null,r.unstable_UserBlockingPriority=2,r.unstable_cancelCallback=function(k){k.callback=null},r.unstable_forceFrameRate=function(k){0>k||125<k?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):T=0<k?Math.floor(1e3/k):5},r.unstable_getCurrentPriorityLevel=function(){return g},r.unstable_next=function(k){switch(g){case 1:case 2:case 3:var Q=3;break;default:Q=g}var ct=g;g=Q;try{return k()}finally{g=ct}},r.unstable_requestPaint=function(){M=!0},r.unstable_runWithPriority=function(k,Q){switch(k){case 1:case 2:case 3:case 4:case 5:break;default:k=3}var ct=g;g=k;try{return Q()}finally{g=ct}},r.unstable_scheduleCallback=function(k,Q,ct){var lt=r.unstable_now();switch(typeof ct=="object"&&ct!==null?(ct=ct.delay,ct=typeof ct=="number"&&0<ct?lt+ct:lt):ct=lt,k){case 1:var pt=-1;break;case 2:pt=250;break;case 5:pt=1073741823;break;case 4:pt=1e4;break;default:pt=5e3}return pt=ct+pt,k={id:_++,callback:Q,priorityLevel:k,startTime:ct,expirationTime:pt,sortIndex:-1},ct>lt?(k.sortIndex=ct,t(p,k),i(m)===null&&k===i(p)&&(C?(N(P),P=-1):C=!0,j(U,ct-lt))):(k.sortIndex=pt,t(m,k),b||y||(b=!0,L||(L=!0,K()))),k},r.unstable_shouldYield=H,r.unstable_wrapCallback=function(k){var Q=g;return function(){var ct=g;g=Q;try{return k.apply(this,arguments)}finally{g=ct}}}})(jd)),jd}var Tx;function zE(){return Tx||(Tx=1,Qd.exports=IE()),Qd.exports}var $d={exports:{}},xe={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Ax;function BE(){if(Ax)return xe;Ax=1;var r=Symbol.for("react.transitional.element"),t=Symbol.for("react.portal"),i=Symbol.for("react.fragment"),s=Symbol.for("react.strict_mode"),l=Symbol.for("react.profiler"),c=Symbol.for("react.consumer"),f=Symbol.for("react.context"),d=Symbol.for("react.forward_ref"),m=Symbol.for("react.suspense"),p=Symbol.for("react.memo"),_=Symbol.for("react.lazy"),v=Symbol.for("react.activity"),g=Symbol.for("react.view_transition"),y=Symbol.iterator;function b(V){return V===null||typeof V!="object"?null:(V=y&&V[y]||V["@@iterator"],typeof V=="function"?V:null)}var C={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},M=Object.assign,S={};function N(V,_t,Pt){this.props=V,this.context=_t,this.refs=S,this.updater=Pt||C}N.prototype.isReactComponent={},N.prototype.setState=function(V,_t){if(typeof V!="object"&&typeof V!="function"&&V!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,V,_t,"setState")},N.prototype.forceUpdate=function(V){this.updater.enqueueForceUpdate(this,V,"forceUpdate")};function I(){}I.prototype=N.prototype;function A(V,_t,Pt){this.props=V,this.context=_t,this.refs=S,this.updater=Pt||C}var U=A.prototype=new I;U.constructor=A,M(U,N.prototype),U.isPureReactComponent=!0;var L=Array.isArray;function P(){}var T={H:null,A:null,T:null,S:null},D=Object.prototype.hasOwnProperty;function H(V,_t,Pt){var J=Pt.ref;return{$$typeof:r,type:V,key:_t,ref:J!==void 0?J:null,props:Pt}}function G(V,_t){return H(V.type,_t,V.props)}function K(V){return typeof V=="object"&&V!==null&&V.$$typeof===r}function it(V){var _t={"=":"=0",":":"=2"};return"$"+V.replace(/[=:]/g,function(Pt){return _t[Pt]})}var X=/\/+/g;function j(V,_t){return typeof V=="object"&&V!==null&&V.key!=null?it(""+V.key):_t.toString(36)}function k(V){switch(V.status){case"fulfilled":return V.value;case"rejected":throw V.reason;default:switch(typeof V.status=="string"?V.then(P,P):(V.status="pending",V.then(function(_t){V.status==="pending"&&(V.status="fulfilled",V.value=_t)},function(_t){V.status==="pending"&&(V.status="rejected",V.reason=_t)})),V.status){case"fulfilled":return V.value;case"rejected":throw V.reason}}throw V}function Q(V,_t,Pt,J,F){var st=typeof V;(st==="undefined"||st==="boolean")&&(V=null);var wt=!1;if(V===null)wt=!0;else switch(st){case"bigint":case"string":case"number":wt=!0;break;case"object":switch(V.$$typeof){case r:case t:wt=!0;break;case _:return wt=V._init,Q(wt(V._payload),_t,Pt,J,F)}}if(wt)return F=F(V),wt=J===""?"."+j(V,0):J,L(F)?(Pt="",wt!=null&&(Pt=wt.replace(X,"$&/")+"/"),Q(F,_t,Pt,"",function(fe){return fe})):F!=null&&(K(F)&&(F=G(F,Pt+(F.key==null||V&&V.key===F.key?"":(""+F.key).replace(X,"$&/")+"/")+wt)),_t.push(F)),1;wt=0;var rt=J===""?".":J+":";if(L(V))for(var At=0;At<V.length;At++)J=V[At],st=rt+j(J,At),wt+=Q(J,_t,Pt,st,F);else if(At=b(V),typeof At=="function")for(V=At.call(V),At=0;!(J=V.next()).done;)J=J.value,st=rt+j(J,At++),wt+=Q(J,_t,Pt,st,F);else if(st==="object"){if(typeof V.then=="function")return Q(k(V),_t,Pt,J,F);throw _t=String(V),Error("Objects are not valid as a React child (found: "+(_t==="[object Object]"?"object with keys {"+Object.keys(V).join(", ")+"}":_t)+"). If you meant to render a collection of children, use an array instead.")}return wt}function ct(V,_t,Pt){if(V==null)return V;var J=[],F=0;return Q(V,J,"","",function(st){return _t.call(Pt,st,F++)}),J}function lt(V){if(V._status===-1){var _t=V._result,Pt=_t();Pt.then(function(J){(V._status===0||V._status===-1)&&(V._status=1,V._result=J,Pt.status===void 0&&(Pt.status="fulfilled",Pt.value=J))},function(J){(V._status===0||V._status===-1)&&(V._status=2,V._result=J,Pt.status===void 0&&(Pt.status="rejected",Pt.reason=J))}),V._status===-1&&(V._status=0,V._result=Pt)}if(V._status===1)return V._result.default;throw V._result}var pt=typeof reportError=="function"?reportError:function(V){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var _t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof V=="object"&&V!==null&&typeof V.message=="string"?String(V.message):String(V),error:V});if(!window.dispatchEvent(_t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",V);return}console.error(V)};function yt(V){var _t=T.T,Pt={};Pt.types=_t!==null?_t.types:null,T.T=Pt;try{var J=V(),F=T.S;F!==null&&F(Pt,J),typeof J=="object"&&J!==null&&typeof J.then=="function"&&J.then(P,pt)}catch(st){pt(st)}finally{_t!==null&&Pt.types!==null&&(_t.types=Pt.types),T.T=_t}}function Yt(V){var _t=T.T;if(_t!==null){var Pt=_t.types;Pt===null?_t.types=[V]:Pt.indexOf(V)===-1&&Pt.push(V)}else yt(Yt.bind(null,V))}var Wt={map:ct,forEach:function(V,_t,Pt){ct(V,function(){_t.apply(this,arguments)},Pt)},count:function(V){var _t=0;return ct(V,function(){_t++}),_t},toArray:function(V){return ct(V,function(_t){return _t})||[]},only:function(V){if(!K(V))throw Error("React.Children.only expected to receive a single React element child.");return V}};return xe.Activity=v,xe.Children=Wt,xe.Component=N,xe.Fragment=i,xe.Profiler=l,xe.PureComponent=A,xe.StrictMode=s,xe.Suspense=m,xe.ViewTransition=g,xe.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=T,xe.__COMPILER_RUNTIME={__proto__:null,c:function(V){return T.H.useMemoCache(V)}},xe.addTransitionType=Yt,xe.cache=function(V){return function(){return V.apply(null,arguments)}},xe.cacheSignal=function(){return null},xe.cloneElement=function(V,_t,Pt){if(V==null)throw Error("The argument must be a React element, but you passed "+V+".");var J=M({},V.props),F=V.key;if(_t!=null)for(st in _t.key!==void 0&&(F=""+_t.key),_t)!D.call(_t,st)||st==="key"||st==="__self"||st==="__source"||st==="ref"&&_t.ref===void 0||(J[st]=_t[st]);var st=arguments.length-2;if(st===1)J.children=Pt;else if(1<st){for(var wt=Array(st),rt=0;rt<st;rt++)wt[rt]=arguments[rt+2];J.children=wt}return H(V.type,F,J)},xe.createContext=function(V){return V={$$typeof:f,_currentValue:V,_currentValue2:V,_threadCount:0,Provider:null,Consumer:null},V.Provider=V,V.Consumer={$$typeof:c,_context:V},V},xe.createElement=function(V,_t,Pt){var J,F={},st=null;if(_t!=null)for(J in _t.key!==void 0&&(st=""+_t.key),_t)D.call(_t,J)&&J!=="key"&&J!=="__self"&&J!=="__source"&&(F[J]=_t[J]);var wt=arguments.length-2;if(wt===1)F.children=Pt;else if(1<wt){for(var rt=Array(wt),At=0;At<wt;At++)rt[At]=arguments[At+2];F.children=rt}if(V&&V.defaultProps)for(J in wt=V.defaultProps,wt)F[J]===void 0&&(F[J]=wt[J]);return H(V,st,F)},xe.createRef=function(){return{current:null}},xe.forwardRef=function(V){return{$$typeof:d,render:V}},xe.isValidElement=K,xe.lazy=function(V){return{$$typeof:_,_payload:{_status:-1,_result:V},_init:lt}},xe.memo=function(V,_t){return{$$typeof:p,type:V,compare:_t===void 0?null:_t}},xe.startTransition=yt,xe.unstable_useCacheRefresh=function(){return T.H.useCacheRefresh()},xe.use=function(V){return T.H.use(V)},xe.useActionState=function(V,_t,Pt){return T.H.useActionState(V,_t,Pt)},xe.useCallback=function(V,_t){return T.H.useCallback(V,_t)},xe.useContext=function(V){return T.H.useContext(V)},xe.useDebugValue=function(){},xe.useDeferredValue=function(V,_t){return T.H.useDeferredValue(V,_t)},xe.useEffect=function(V,_t){return T.H.useEffect(V,_t)},xe.useEffectEvent=function(V){return T.H.useEffectEvent(V)},xe.useId=function(){return T.H.useId()},xe.useImperativeHandle=function(V,_t,Pt){return T.H.useImperativeHandle(V,_t,Pt)},xe.useInsertionEffect=function(V,_t){return T.H.useInsertionEffect(V,_t)},xe.useLayoutEffect=function(V,_t){return T.H.useLayoutEffect(V,_t)},xe.useMemo=function(V,_t){return T.H.useMemo(V,_t)},xe.useOptimistic=function(V,_t){return T.H.useOptimistic(V,_t)},xe.useReducer=function(V,_t,Pt){return T.H.useReducer(V,_t,Pt)},xe.useRef=function(V){return T.H.useRef(V)},xe.useState=function(V){return T.H.useState(V)},xe.useSyncExternalStore=function(V,_t,Pt){return T.H.useSyncExternalStore(V,_t,Pt)},xe.useTransition=function(){return T.H.useTransition()},xe.version="19.3.1",xe}var Rx;function Fm(){return Rx||(Rx=1,$d.exports=BE()),$d.exports}var tp={exports:{}},In={};/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var wx;function FE(){if(wx)return In;wx=1;var r=Fm();function t(_){var v="https://react.dev/errors/"+_;if(1<arguments.length){v+="?args[]="+encodeURIComponent(arguments[1]);for(var g=2;g<arguments.length;g++)v+="&args[]="+encodeURIComponent(arguments[g])}return"Minified React error #"+_+"; visit "+v+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function i(){}var s={d:{f:i,r:function(){throw Error(t(522))},D:i,C:i,L:i,m:i,X:i,S:i,M:i},p:0,findDOMNode:null},l=Symbol.for("react.portal"),c=Symbol.for("react.recoverable"),f=Symbol.for("react.optimistic_key");function d(_,v,g){var y=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:l,key:y==null?null:y===f?f:""+y,children:_,containerInfo:v,implementation:g}}var m=r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function p(_,v){if(_==="font")return"";if(typeof v=="string")return v==="use-credentials"?v:""}return In.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=s,In.browser=function(_){return{$$typeof:c,_reason:_}},In.createPortal=function(_,v){var g=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!v||v.nodeType!==1&&v.nodeType!==9&&v.nodeType!==11)throw Error(t(299));return d(_,v,null,g)},In.flushSync=function(_){var v=m.T,g=s.p;try{if(m.T=null,s.p=2,_)return _()}finally{m.T=v,s.p=g,s.d.f()}},In.preconnect=function(_,v){typeof _=="string"&&(v?(v=v.crossOrigin,v=typeof v=="string"?v==="use-credentials"?v:"":void 0):v=null,s.d.C(_,v))},In.prefetchDNS=function(_){typeof _=="string"&&s.d.D(_)},In.preinit=function(_,v){if(typeof _=="string"&&v&&typeof v.as=="string"){var g=v.as,y=p(g,v.crossOrigin),b=typeof v.integrity=="string"?v.integrity:void 0,C=typeof v.fetchPriority=="string"?v.fetchPriority:void 0;g==="style"?s.d.S(_,typeof v.precedence=="string"?v.precedence:void 0,{crossOrigin:y,integrity:b,fetchPriority:C}):g==="script"&&s.d.X(_,{crossOrigin:y,integrity:b,fetchPriority:C,nonce:typeof v.nonce=="string"?v.nonce:void 0})}},In.preinitModule=function(_,v){if(typeof _=="string")if(typeof v=="object"&&v!==null){if(v.as==null||v.as==="script"){var g=p(v.as,v.crossOrigin);s.d.M(_,{crossOrigin:g,integrity:typeof v.integrity=="string"?v.integrity:void 0,nonce:typeof v.nonce=="string"?v.nonce:void 0,fetchPriority:typeof v.fetchPriority=="string"?v.fetchPriority:void 0})}}else v==null&&s.d.M(_)},In.preload=function(_,v){if(typeof _=="string"&&typeof v=="object"&&v!==null&&typeof v.as=="string"){var g=v.as,y=p(g,v.crossOrigin);s.d.L(_,g,{crossOrigin:y,integrity:typeof v.integrity=="string"?v.integrity:void 0,nonce:typeof v.nonce=="string"?v.nonce:void 0,type:typeof v.type=="string"?v.type:void 0,fetchPriority:typeof v.fetchPriority=="string"?v.fetchPriority:void 0,referrerPolicy:typeof v.referrerPolicy=="string"?v.referrerPolicy:void 0,imageSrcSet:typeof v.imageSrcSet=="string"?v.imageSrcSet:void 0,imageSizes:typeof v.imageSizes=="string"?v.imageSizes:void 0,media:typeof v.media=="string"?v.media:void 0})}},In.preloadModule=function(_,v){if(typeof _=="string")if(v){var g=p(v.as,v.crossOrigin);s.d.m(_,{as:typeof v.as=="string"&&v.as!=="script"?v.as:void 0,crossOrigin:g,integrity:typeof v.integrity=="string"?v.integrity:void 0,nonce:typeof v.nonce=="string"?v.nonce:void 0,fetchPriority:typeof v.fetchPriority=="string"?v.fetchPriority:void 0})}else s.d.m(_)},In.requestFormReset=function(_){s.d.r(_)},In.unstable_batchedUpdates=function(_,v){return _(v)},In.useFormState=function(_,v,g){return m.H.useFormState(_,v,g)},In.useFormStatus=function(){return m.H.useHostTransitionStatus()},In.version="19.3.1",In}var Cx;function HE(){if(Cx)return tp.exports;Cx=1;function r(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(r)}catch(t){console.error(t)}}return r(),tp.exports=FE(),tp.exports}/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Nx;function VE(){if(Nx)return Rl;Nx=1;var r=zE(),t=Fm(),i=HE();function s(e){var n="https://react.dev/errors/"+e;if(1<arguments.length){n+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)n+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+n+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function l(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function c(e){for(var n=e,a=n;a&&!a.alternate;)n=a,(n.flags&4098)!==0&&(e=n.return),a=n.return;for(;n.return;)n=n.return;return n.tag===3?e:null}function f(e){if(e.tag===13){var n=e.memoizedState;if(n===null&&(e=e.alternate,e!==null&&(n=e.memoizedState)),n!==null)return n.dehydrated}return null}function d(e){if(e.tag===31){var n=e.memoizedState;if(n===null&&(e=e.alternate,e!==null&&(n=e.memoizedState)),n!==null)return n.dehydrated}return null}function m(e){if(c(e)!==e)throw Error(s(188))}function p(e){var n=e.alternate;if(!n){if(n=c(e),n===null)throw Error(s(188));return n!==e?null:e}for(var a=e,o=n;;){var u=a.return;if(u===null)break;var h=u.alternate;if(h===null){if(o=u.return,o!==null){a=o;continue}break}if(u.child===h.child){for(h=u.child;h;){if(h===a)return m(u),e;if(h===o)return m(u),n;h=h.sibling}throw Error(s(188))}if(a.return!==o.return)a=u,o=h;else{for(var x=!1,w=u.child;w;){if(w===a){x=!0,a=u,o=h;break}if(w===o){x=!0,o=u,a=h;break}w=w.sibling}if(!x){for(w=h.child;w;){if(w===a){x=!0,a=h,o=u;break}if(w===o){x=!0,o=h,a=u;break}w=w.sibling}if(!x)throw Error(s(189))}}if(a.alternate!==o)throw Error(s(190))}if(a.tag!==3)throw Error(s(188));return a.stateNode.current===a?e:n}function _(e){var n=e.tag;if(n===5||n===26||n===27||n===6)return e;for(e=e.child;e!==null;){if(n=_(e),n!==null)return n;e=e.sibling}return null}function v(e,n,a,o,u,h){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,o,u,h)||(e.tag!==22||e.memoizedState===null)&&(n||e.tag!==5&&e.tag!==27)&&v(e.child,n,a,o,u,h))return!0;e=e.sibling}return!1}function g(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function y(e){var n=!1;for(e=e.return;e!==null&&(e.tag===4&&(n=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return n}function b(e){var n=[null,null],a=g(e);return a===null||C(n,e,a.child,{foundSelf:!1}),n}function C(e,n,a,o){for(;a!==null;){if(a===n)o.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(o.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&C(e,n,a.child,o))return!0;a=a.sibling}return!1}function M(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(s(559))}}var S=null,N=null;function I(e,n,a){return e===a?!0:e===n?(S=e,!0):!1}function A(e,n,a){return e===a?(N=e,!1):e===n?(N!==null&&(S=e),!0):!1}function U(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function L(e,n,a){for(var o=0,u=e;u;u=a(u))o++;u=0;for(var h=n;h;h=a(h))u++;for(;0<o-u;)e=a(e),o--;for(;0<u-o;)n=a(n),u--;for(;o--;){if(e===n||n!==null&&e===n.alternate)return e;e=a(e),n=a(n)}return null}var P=Object.assign,T=Symbol.for("react.element"),D=Symbol.for("react.transitional.element"),H=Symbol.for("react.portal"),G=Symbol.for("react.fragment"),K=Symbol.for("react.strict_mode"),it=Symbol.for("react.profiler"),X=Symbol.for("react.consumer"),j=Symbol.for("react.context"),k=Symbol.for("react.forward_ref"),Q=Symbol.for("react.suspense"),ct=Symbol.for("react.suspense_list"),lt=Symbol.for("react.memo"),pt=Symbol.for("react.lazy"),yt=Symbol.for("react.activity"),Yt=Symbol.for("react.legacy_hidden"),Wt=Symbol.for("react.memo_cache_sentinel"),V=Symbol.for("react.view_transition"),_t=Symbol.for("react.recoverable"),Pt=Symbol.iterator;function J(e){return e===null||typeof e!="object"?null:(e=Pt&&e[Pt]||e["@@iterator"],typeof e=="function"?e:null)}var F=Symbol.for("react.client.reference");function st(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===F?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case G:return"Fragment";case it:return"Profiler";case K:return"StrictMode";case Q:return"Suspense";case ct:return"SuspenseList";case yt:return"Activity";case V:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case H:return"Portal";case j:return e.displayName||"Context";case X:return(e._context.displayName||"Context")+".Consumer";case k:var n=e.render;return e=e.displayName,e||(e=n.displayName||n.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case lt:return n=e.displayName||null,n!==null?n:st(e.type)||"Memo";case pt:n=e._payload,e=e._init;try{return st(e(n))}catch{}}return null}var wt=Array.isArray,rt=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,At=i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,fe={pending:!1,data:null,method:null,action:null},xt=[],Ct=-1;function Ut(e){return{current:e}}function Nt(e){0>Ct||(e.current=xt[Ct],xt[Ct]=null,Ct--)}function Dt(e,n){Ct++,xt[Ct]=e.current,e.current=n}var se=Ut(null),re=Ut(null),gt=Ut(null),It=Ut(null);function z(e,n){switch(Dt(gt,n),Dt(re,e),Dt(se,null),n.nodeType){case 9:case 11:e=(e=n.documentElement)&&(e=e.namespaceURI)?D_(e):0;break;default:if(e=n.tagName,n=n.namespaceURI)n=D_(n),e=L_(n,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}Nt(se),Dt(se,e)}function ce(){Nt(se),Nt(re),Nt(gt)}function de(e){var n=e.memoizedState;n!==null&&(to._currentValue=n.memoizedState,Dt(It,e)),n=se.current;var a=L_(n,e.type);n!==a&&(Dt(re,e),Dt(se,a))}function O(e){re.current===e&&(Nt(se),Nt(re)),It.current===e&&(Nt(It),to._currentValue=fe)}var E,Y;function at(e){if(E===void 0)try{throw Error()}catch(a){var n=a.stack.trim().match(/\n( *(at )?)/);E=n&&n[1]||"",Y=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+E+e+Y}var vt=!1;function Ot(e,n){if(!e||vt)return"";vt=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var o={DetermineComponentFrameRoot:function(){try{if(n){var bt=function(){throw Error()};if(Object.defineProperty(bt.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(bt,[])}catch(Xt){var $=Xt}Reflect.construct(e,[],bt)}else{try{bt.call()}catch(Xt){$=Xt}bt=!1;try{var ht=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),bt=!0,new e}finally{bt&&(ht!==void 0?Object.defineProperty(e.prototype,"props",ht):delete e.prototype.props)}}}else{try{throw Error()}catch(Xt){$=Xt}(bt=e())&&typeof bt.catch=="function"&&bt.catch(function(){})}}catch(Xt){if(Xt&&$&&typeof Xt.stack=="string")return[Xt.stack,$.stack]}return[null,null]}};o.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var u=Object.getOwnPropertyDescriptor(o.DetermineComponentFrameRoot,"name");u&&u.configurable&&Object.defineProperty(o.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var h=o.DetermineComponentFrameRoot(),x=h[0],w=h[1];if(x&&w){var B=x.split(`
`),nt=w.split(`
`);for(u=o=0;o<B.length&&!B[o].includes("DetermineComponentFrameRoot");)o++;for(;u<nt.length&&!nt[u].includes("DetermineComponentFrameRoot");)u++;if(o===B.length||u===nt.length)for(o=B.length-1,u=nt.length-1;1<=o&&0<=u&&B[o]!==nt[u];)u--;for(;1<=o&&0<=u;o--,u--)if(B[o]!==nt[u]){if(o!==1||u!==1)do if(o--,u--,0>u||B[o]!==nt[u]){var dt=`
`+B[o].replace(" at new "," at ");return e.displayName&&dt.includes("<anonymous>")&&(dt=dt.replace("<anonymous>",e.displayName)),dt}while(1<=o&&0<=u);break}}}finally{vt=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?at(a):""}function zt(e,n){switch(e.tag){case 26:case 27:case 5:return at(e.type);case 16:return at("Lazy");case 13:return e.child!==n&&n!==null?at("Suspense Fallback"):at("Suspense");case 19:return at("SuspenseList");case 0:case 15:return Ot(e.type,!1);case 11:return Ot(e.type.render,!1);case 1:return Ot(e.type,!0);case 31:return at("Activity");case 30:return at("ViewTransition");default:return""}}function St(e){try{var n="",a=null;do n+=zt(e,a),a=e,e=e.return;while(e);return n}catch(o){return`
Error generating stack: `+o.message+`
`+o.stack}}var Rt=Object.prototype.hasOwnProperty,Ht=r.unstable_scheduleCallback,he=r.unstable_cancelCallback,qt=r.unstable_shouldYield,kt=r.unstable_requestPaint,$t=r.unstable_now,me=r.unstable_getCurrentPriorityLevel,Se=r.unstable_ImmediatePriority,Z=r.unstable_UserBlockingPriority,Ft=r.unstable_NormalPriority,Tt=r.unstable_LowPriority,Vt=r.unstable_IdlePriority,jt=r.log,Lt=r.unstable_setDisableYieldValue,ue=null,Qt=null;function Be(e){if(typeof jt=="function"&&Lt(e),Qt&&typeof Qt.setStrictMode=="function")try{Qt.setStrictMode(ue,e)}catch{}}var ye=Math.clz32?Math.clz32:bf,si=Math.log,_i=Math.LN2;function bf(e){return e>>>=0,e===0?32:31-(si(e)/_i|0)|0}var gr=256,As=262144,ka=4194304;function ga(e){var n=e&42;if(n!==0)return n;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Rs(e,n,a){var o=e.pendingLanes;if(o===0)return 0;var u=0,h=e.suspendedLanes,x=e.pingedLanes;e=e.warmLanes;var w=o&134217727;return w!==0?(o=w&~h,o!==0?u=ga(o):(x&=w,x!==0?u=ga(x):a||(a=w&~e,a!==0&&(u=ga(a))))):(w=o&~h,w!==0?u=ga(w):x!==0?u=ga(x):a||(a=o&~e,a!==0&&(u=ga(a)))),u===0?0:n!==0&&n!==u&&(n&h)===0&&(h=u&-u,a=n&-n,h>=a||h===32&&(a&4194048)!==0)?n:u}function Wa(e,n){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&n)===0}function Xi(e,n){(n&8)!==0&&(n|=n&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=n;0<a;){var o=31-ye(a),u=1<<o;n|=e[o],a&=~u}return n}function Lo(e,n){switch(e){case 1:case 2:case 4:case 8:case 64:return n+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Uo(){var e=ka;return ka<<=1,(ka&62914560)===0&&(ka=4194304),e}function vr(e){for(var n=[],a=0;31>a;a++)n.push(e);return n}function ki(e,n){e.pendingLanes|=n,n!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function ac(e,n,a,o,u,h){var x=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var w=e.entanglements,B=e.expirationTimes,nt=e.hiddenUpdates;for(a=x&~a;0<a;){var dt=31-ye(a),bt=1<<dt;w[dt]=0,B[dt]=-1;var $=nt[dt];if($!==null)for(nt[dt]=null,dt=0;dt<$.length;dt++){var ht=$[dt];ht!==null&&(ht.lane&=-536870913)}a&=~bt}o!==0&&ws(e,o,0),h!==0&&u===0&&e.tag!==0&&(e.suspendedLanes|=h&~(x&~n))}function ws(e,n,a){e.pendingLanes|=n,e.suspendedLanes&=~n;var o=31-ye(n);e.entangledLanes|=n,e.entanglements[o]=e.entanglements[o]|1073741824|a&261930}function Oo(e,n){var a=e.entangledLanes|=n;for(e=e.entanglements;a;){var o=31-ye(a),u=1<<o;u&n|e[o]&n&&(e[o]|=n),a&=~u}}function Po(e,n){var a=n&-n;return a=(a&42)!==0?1:Io(a),(a&(e.suspendedLanes|n))!==0?0:a}function Io(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function zo(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function sc(){var e=At.p;return e!==0?e:(e=window.event,e===void 0?32:mx(e.type))}function rc(e,n){var a=At.p;try{return At.p=e,n()}finally{At.p=a}}var xi=Math.random().toString(36).slice(2),R="__reactFiber$"+xi,W="__reactProps$"+xi,mt="__reactContainer$"+xi,ut="__reactEvents$"+xi,ft="__reactListeners$"+xi,Zt="__reactHandles$"+xi,te="__reactResources$"+xi,Gt="__reactMarker$"+xi,ae="__reactLoad$"+xi;function oe(e){delete e[R],delete e[W],delete e[ft],delete e[Zt]}function ve(e){var n;if(n=e[R])return n;for(var a=e.parentNode;a;){if(n=a[mt]||a[R]){if(a=n.alternate,n.child!==null||a!==null&&a.child!==null)for(e=K_(e);e!==null;){if(a=e[R])return a;e=K_(e)}return n}e=a,a=e.parentNode}return null}function Me(e){if(e=e[R]||e[mt]){var n=e.tag;if(n===5||n===6||n===13||n===31||n===26||n===27||n===3)return e}return null}function ee(e){var n=e.tag;if(n===5||n===26||n===27||n===6)return e.stateNode;throw Error(s(33))}function Le(e){var n=e[te];return n||(n=e[te]={hoistableStyles:new Map,hoistableScripts:new Map}),n}function we(e){e[Gt]=!0}function je(e){e[ae]=void 0}var qe=new Set,En={};function Kt(e,n){hn(e,n),hn(e+"Capture",n)}function hn(e,n){for(En[e]=n,e=0;e<n.length;e++)qe.add(n[e])}var Fe=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Xn={},ri={};function Wi(e){return Rt.call(ri,e)?!0:Rt.call(Xn,e)?!1:Fe.test(e)?ri[e]=!0:(Xn[e]=!0,!1)}var Ce=!1;function Xe(){var e=Ce;return Ce=!1,e}function an(e,n,a){if(Wi(n))if(a===null)e.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(n);return;case"boolean":var o=n.toLowerCase().slice(0,5);if(o!=="data-"&&o!=="aria-"){e.removeAttribute(n);return}}e.setAttribute(n,a)}}function oi(e,n,a){if(a===null)e.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttribute(n,a)}}function Pe(e,n,a,o){if(o===null)e.removeAttribute(a);else{switch(typeof o){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(n,a,o)}}function dn(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function va(e){var n=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(n==="checkbox"||n==="radio")}function oc(e,n,a){var o=Object.getOwnPropertyDescriptor(e.constructor.prototype,n);if(!e.hasOwnProperty(n)&&typeof o<"u"&&typeof o.get=="function"&&typeof o.set=="function"){var u=o.get,h=o.set;return Object.defineProperty(e,n,{configurable:!0,get:function(){return u.call(this)},set:function(x){a=""+x,h.call(this,x)}}),Object.defineProperty(e,n,{enumerable:o.enumerable}),{getValue:function(){return a},setValue:function(x){a=""+x},stopTracking:function(){e._valueTracker=null,delete e[n]}}}}function Tf(e){if(!e._valueTracker){var n=va(e)?"checked":"value";e._valueTracker=oc(e,n,""+e[n])}}function x0(e){if(!e)return!1;var n=e._valueTracker;if(!n)return!0;var a=n.getValue(),o="";return e&&(o=va(e)?e.checked?"true":"false":e.value),e=o,e!==a?(n.setValue(e),!0):!1}var ey=/[\n"\\]/g;function Si(e){return e.replace(ey,function(n){return"\\"+n.charCodeAt(0).toString(16)+" "})}function Af(e,n,a,o,u,h,x,w){e.name="",x!=null&&typeof x!="function"&&typeof x!="symbol"&&typeof x!="boolean"?e.type=x:e.removeAttribute("type"),n!=null?x==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+dn(n)):e.value!==""+dn(n)&&(e.value=""+dn(n)):x!=="submit"&&x!=="reset"||e.removeAttribute("value"),n!=null?x==="number"&&e.value==n?Rf(e,dn(e.value)):Rf(e,dn(n)):a!=null?Rf(e,dn(a)):o!=null&&e.removeAttribute("value"),u==null&&h!=null&&(e.defaultChecked=!!h),u!=null&&(e.checked=u&&typeof u!="function"&&typeof u!="symbol"),w!=null&&typeof w!="function"&&typeof w!="symbol"&&typeof w!="boolean"?e.name=""+dn(w):e.removeAttribute("name")}function S0(e,n,a,o,u,h,x,w){if(h!=null&&typeof h!="function"&&typeof h!="symbol"&&typeof h!="boolean"&&(e.type=h),n!=null||a!=null){if(!(h!=="submit"&&h!=="reset"||n!=null)){Tf(e);return}a=a!=null?""+dn(a):"",n=n!=null?""+dn(n):a,w||n===e.value||(e.value=n),e.defaultValue=n}o=o??u,o=typeof o!="function"&&typeof o!="symbol"&&!!o,e.checked=w?e.checked:!!o,e.defaultChecked=!!o,x!=null&&typeof x!="function"&&typeof x!="symbol"&&typeof x!="boolean"&&(e.name=x),Tf(e)}function Rf(e,n){e.defaultValue!==""+n&&(e.defaultValue=""+n)}function _r(e,n,a,o){if(e=e.options,n){n={};for(var u=0;u<a.length;u++)n["$"+a[u]]=!0;for(a=0;a<e.length;a++)u=n.hasOwnProperty("$"+e[a].value),e[a].selected!==u&&(e[a].selected=u),u&&o&&(e[a].defaultSelected=!0)}else{for(a=""+dn(a),n=null,u=0;u<e.length;u++){if(e[u].value===a){e[u].selected=!0,o&&(e[u].defaultSelected=!0);return}n!==null||e[u].disabled||(n=e[u])}n!==null&&(n.selected=!0)}}function y0(e,n,a){if(n!=null&&(n=""+dn(n),n!==e.value&&(e.value=n),a==null)){e.defaultValue!==n&&(e.defaultValue=n);return}e.defaultValue=a!=null?""+dn(a):""}function M0(e,n,a,o){if(n==null){if(o!=null){if(a!=null)throw Error(s(92));if(wt(o)){if(1<o.length)throw Error(s(93));o=o[0]}a=o}a==null&&(a=""),n=a}a=dn(n),e.defaultValue=a,o=e.textContent,o===a&&o!==""&&o!==null&&(e.value=o),Tf(e)}function xr(e,n){if(n){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=n;return}}e.textContent=n}var ny=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function E0(e,n,a){var o=n.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?o?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="":o?e.setProperty(n,a):typeof a!="number"||a===0||ny.has(n)?n==="float"?e.cssFloat=a:e[n]=(""+a).trim():e[n]=a+"px"}function b0(e,n,a){if(n!=null&&typeof n!="object")throw Error(s(62));if(e=e.style,a!=null){for(var o in a)!a.hasOwnProperty(o)||n!=null&&n.hasOwnProperty(o)||(o.indexOf("--")===0?e.setProperty(o,""):o==="float"?e.cssFloat="":e[o]="",Ce=!0);for(var u in n)o=n[u],n.hasOwnProperty(u)&&a[u]!==o&&(E0(e,u,o),Ce=!0)}else for(var h in n)n.hasOwnProperty(h)&&E0(e,h,n[h])}function wf(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var iy=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),ay=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function lc(e){return ay.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function qi(){}var Cf=null;function Nf(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Sr=null,yr=null;function T0(e){var n=Me(e);if(n&&(e=n.stateNode)){var a=e[W]||null;t:switch(e=n.stateNode,n.type){case"input":if(Af(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),n=a.name,a.type==="radio"&&n!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Si(""+n)+'"][type="radio"]'),n=0;n<a.length;n++){var o=a[n];if(o!==e&&o.form===e.form){var u=o[W]||null;if(!u)throw Error(s(90));Af(o,u.value,u.defaultValue,u.defaultValue,u.checked,u.defaultChecked,u.type,u.name)}}for(n=0;n<a.length;n++)o=a[n],o.form===e.form&&x0(o)}break t;case"textarea":y0(e,a.value,a.defaultValue);break t;case"select":n=a.value,n!=null&&_r(e,!!a.multiple,n,!1)}}}var Df=!1;function A0(e,n,a){if(Df)return e(n,a);Df=!0;try{var o=e(n);return o}finally{if(Df=!1,(Sr!==null||yr!==null)&&(lu(),Sr&&(n=Sr,e=yr,yr=Sr=null,T0(n),e)))for(n=0;n<e.length;n++)T0(e[n])}}function Bo(e,n){var a=e.stateNode;if(a===null)return null;var o=a[W]||null;if(o===null)return null;a=o[n];t:switch(n){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(o=!o.disabled)||(e=e.type,o=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!o;break t;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(s(231,n,typeof a));return a}var _a=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Lf=!1;if(_a)try{var Fo={};Object.defineProperty(Fo,"passive",{get:function(){Lf=!0}}),window.addEventListener("test",Fo,Fo),window.removeEventListener("test",Fo,Fo)}catch{Lf=!1}var qa=null,Uf=null,cc=null;function R0(){if(cc)return cc;var e,n=Uf,a=n.length,o,u="value"in qa?qa.value:qa.textContent,h=u.length;for(e=0;e<a&&n[e]===u[e];e++);var x=a-e;for(o=1;o<=x&&n[a-o]===u[h-o];o++);return cc=u.slice(e,1<o?1-o:void 0)}function uc(e){var n=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&n===13&&(e=13)):e=n,e===10&&(e=13),32<=e||e===13?e:0}function fc(){return!0}function w0(){return!1}function kn(e){function n(a,o,u,h,x){this._reactName=a,this._targetInst=u,this.type=o,this.nativeEvent=h,this.target=x,this.currentTarget=null;for(var w in e)e.hasOwnProperty(w)&&(a=e[w],this[w]=a?a(h):h[w]);return this.isDefaultPrevented=(h.defaultPrevented!=null?h.defaultPrevented:h.returnValue===!1)?fc:w0,this.isPropagationStopped=w0,this}return P(n.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=fc)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=fc)},persist:function(){},isPersistent:fc}),n}var Ya={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},hc=kn(Ya),Ho=P({},Ya,{view:0,detail:0}),sy=kn(Ho),Of,Pf,Vo,dc=P({},Ho,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:zf,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Vo&&(Vo&&e.type==="mousemove"?(Of=e.screenX-Vo.screenX,Pf=e.screenY-Vo.screenY):Pf=Of=0,Vo=e),Of)},movementY:function(e){return"movementY"in e?e.movementY:Pf}}),C0=kn(dc),ry=P({},dc,{dataTransfer:0}),oy=kn(ry),ly=P({},Ho,{relatedTarget:0}),If=kn(ly),cy=P({},Ya,{animationName:0,elapsedTime:0,pseudoElement:0}),uy=kn(cy),fy=P({},Ya,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),hy=kn(fy),dy=P({},Ya,{data:0}),N0=kn(dy),py={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},my={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},gy={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function vy(e){var n=this.nativeEvent;return n.getModifierState?n.getModifierState(e):(e=gy[e])?!!n[e]:!1}function zf(){return vy}var _y=P({},Ho,{key:function(e){if(e.key){var n=py[e.key]||e.key;if(n!=="Unidentified")return n}return e.type==="keypress"?(e=uc(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?my[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:zf,charCode:function(e){return e.type==="keypress"?uc(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?uc(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),xy=kn(_y),Sy=P({},dc,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),D0=kn(Sy),yy=P({},Ya,{submitter:0}),My=kn(yy),Ey=P({},Ho,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:zf}),by=kn(Ey),Ty=P({},Ya,{propertyName:0,elapsedTime:0,pseudoElement:0}),Ay=kn(Ty),Ry=P({},dc,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),wy=kn(Ry),Cy=P({},Ya,{newState:0,oldState:0,source:0}),Ny=kn(Cy),Dy=[9,13,27,32],Bf=_a&&"CompositionEvent"in window,Go=null;_a&&"documentMode"in document&&(Go=document.documentMode);var Ly=_a&&"TextEvent"in window&&!Go,L0=_a&&(!Bf||Go&&8<Go&&11>=Go),U0=" ",O0=!1;function P0(e,n){switch(e){case"keyup":return Dy.indexOf(n.keyCode)!==-1;case"keydown":return n.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function I0(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Mr=!1;function Uy(e,n){switch(e){case"compositionend":return I0(n);case"keypress":return n.which!==32?null:(O0=!0,U0);case"textInput":return e=n.data,e===U0&&O0?null:e;default:return null}}function Oy(e,n){if(Mr)return e==="compositionend"||!Bf&&P0(e,n)?(e=R0(),cc=Uf=qa=null,Mr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(n.ctrlKey||n.altKey||n.metaKey)||n.ctrlKey&&n.altKey){if(n.char&&1<n.char.length)return n.char;if(n.which)return String.fromCharCode(n.which)}return null;case"compositionend":return L0&&n.locale!=="ko"?null:n.data;default:return null}}var Py={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function z0(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n==="input"?!!Py[e.type]:n==="textarea"}function B0(e,n,a,o){Sr?yr?yr.push(o):yr=[o]:Sr=o,n=pu(n,"onChange"),0<n.length&&(a=new hc("onChange","change",null,a,o),e.push({event:a,listeners:n}))}var Xo=null,ko=null;function Iy(e){T_(e,0)}function pc(e){var n=ee(e);if(x0(n))return e}function F0(e,n){if(e==="change")return n}var H0=!1;if(_a){var Ff;if(_a){var Hf="oninput"in document;if(!Hf){var V0=document.createElement("div");V0.setAttribute("oninput","return;"),Hf=typeof V0.oninput=="function"}Ff=Hf}else Ff=!1;H0=Ff&&(!document.documentMode||9<document.documentMode)}function G0(){Xo&&(Xo.detachEvent("onpropertychange",X0),ko=Xo=null)}function X0(e){if(e.propertyName==="value"&&pc(ko)){var n=[];B0(n,ko,e,Nf(e)),A0(Iy,n)}}function zy(e,n,a){e==="focusin"?(G0(),Xo=n,ko=a,Xo.attachEvent("onpropertychange",X0)):e==="focusout"&&G0()}function By(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return pc(ko)}function Fy(e,n){if(e==="click")return pc(n)}function Hy(e,n){if(e==="input"||e==="change")return pc(n)}function Vy(e,n){return e===n&&(e!==0||1/e===1/n)||e!==e&&n!==n}var li=typeof Object.is=="function"?Object.is:Vy;function Wo(e,n){if(li(e,n))return!0;if(typeof e!="object"||e===null||typeof n!="object"||n===null)return!1;var a=Object.keys(e),o=Object.keys(n);if(a.length!==o.length)return!1;for(o=0;o<a.length;o++){var u=a[o];if(!Rt.call(n,u)||!li(e[u],n[u]))return!1}return!0}function Vf(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function k0(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function W0(e,n){var a=k0(e);e=0;for(var o;a;){if(a.nodeType===3){if(o=e+a.textContent.length,e<=n&&o>=n)return{node:a,offset:n-e};e=o}t:{for(;a;){if(a.nextSibling){a=a.nextSibling;break t}a=a.parentNode}a=void 0}a=k0(a)}}function q0(e,n){return e&&n?e===n?!0:e&&e.nodeType===3?!1:n&&n.nodeType===3?q0(e,n.parentNode):"contains"in e?e.contains(n):e.compareDocumentPosition?!!(e.compareDocumentPosition(n)&16):!1:!1}function Y0(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var n=Vf(e.document);n instanceof e.HTMLIFrameElement;){try{var a=typeof n.contentWindow.location.href=="string"}catch{a=!1}if(a)e=n.contentWindow;else break;n=Vf(e.document)}return n}function Gf(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n&&(n==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||n==="textarea"||e.contentEditable==="true")}var Gy=_a&&"documentMode"in document&&11>=document.documentMode,Er=null,Xf=null,qo=null,kf=!1;function Z0(e,n,a){var o=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;kf||Er==null||Er!==Vf(o)||(o=Er,"selectionStart"in o&&Gf(o)?o={start:o.selectionStart,end:o.selectionEnd}:(o=(o.ownerDocument&&o.ownerDocument.defaultView||window).getSelection(),o={anchorNode:o.anchorNode,anchorOffset:o.anchorOffset,focusNode:o.focusNode,focusOffset:o.focusOffset}),qo&&Wo(qo,o)||(qo=o,o=pu(Xf,"onSelect"),0<o.length&&(n=new hc("onSelect","select",null,n,a),e.push({event:n,listeners:o}),n.target=Er)))}function Cs(e,n){var a={};return a[e.toLowerCase()]=n.toLowerCase(),a["Webkit"+e]="webkit"+n,a["Moz"+e]="moz"+n,a}var br={animationend:Cs("Animation","AnimationEnd"),animationiteration:Cs("Animation","AnimationIteration"),animationstart:Cs("Animation","AnimationStart"),transitionrun:Cs("Transition","TransitionRun"),transitionstart:Cs("Transition","TransitionStart"),transitioncancel:Cs("Transition","TransitionCancel"),transitionend:Cs("Transition","TransitionEnd")},Wf={},K0={};_a&&(K0=document.createElement("div").style,"AnimationEvent"in window||(delete br.animationend.animation,delete br.animationiteration.animation,delete br.animationstart.animation),"TransitionEvent"in window||delete br.transitionend.transition);function Ns(e){if(Wf[e])return Wf[e];if(!br[e])return e;var n=br[e],a;for(a in n)if(n.hasOwnProperty(a)&&a in K0)return Wf[e]=n[a];return e}var J0=Ns("animationend"),Q0=Ns("animationiteration"),j0=Ns("animationstart"),Xy=Ns("transitionrun"),ky=Ns("transitionstart"),Wy=Ns("transitioncancel"),$0=Ns("transitionend"),tg=new Map,qf="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");qf.push("scrollEnd");function Ni(e,n){tg.set(e,n),Kt(n,[e])}var qy=0;function xa(e,n){if(e.name!=null&&e.name!=="auto")return e.name;if(n.autoName!==null)return n.autoName;e=Oi.identifierPrefix;var a=qy++;return e="_"+e+"t_"+a.toString(32)+"_",n.autoName=e}function eg(e){if(e==null||typeof e=="string")return e;var n=null,a=kr;if(a!==null)for(var o=0;o<a.length;o++){var u=e[a[o]];if(u!=null){if(u==="none")return"none";n=n==null?u:n+(" "+u)}}return n??e.default}function Sa(e,n){return e=eg(e),n=eg(n),n==null?e==="auto"?null:e:n==="auto"?null:n}var mc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var n=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(n))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},yi=[],Tr=0,Yf=0;function gc(){for(var e=Tr,n=Yf=Tr=0;n<e;){var a=yi[n];yi[n++]=null;var o=yi[n];yi[n++]=null;var u=yi[n];yi[n++]=null;var h=yi[n];if(yi[n++]=null,o!==null&&u!==null){var x=o.pending;x===null?u.next=u:(u.next=x.next,x.next=u),o.pending=u}h!==0&&ng(a,u,h)}}function vc(e,n,a,o){yi[Tr++]=e,yi[Tr++]=n,yi[Tr++]=a,yi[Tr++]=o,Yf|=o,e.lanes|=o,e=e.alternate,e!==null&&(e.lanes|=o)}function Zf(e,n,a,o){return vc(e,n,a,o),_c(e)}function Ds(e,n){return vc(e,null,null,n),_c(e)}function ng(e,n,a){e.lanes|=a;var o=e.alternate;o!==null&&(o.lanes|=a);for(var u=!1,h=e.return;h!==null;)h.childLanes|=a,o=h.alternate,o!==null&&(o.childLanes|=a),h.tag===22&&(e=h.stateNode,e===null||e._visibility&1||(u=!0)),e=h,h=h.return;return e.tag===3?(h=e.stateNode,u&&n!==null&&(u=31-ye(a),e=h.hiddenUpdates,o=e[u],o===null?e[u]=[n]:o.push(n),n.lane=a|536870912),h):null}function _c(e){if(50<pl)throw pl=0,ou=null,Error(s(185));for(var n=e.return;n!==null;)e=n,n=e.return;return e.tag===3?e.stateNode:null}var Ar={};function Yy(e,n,a,o){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=n,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=o,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Jn(e,n,a,o){return new Yy(e,n,a,o)}function Kf(e){return e=e.prototype,!(!e||!e.isReactComponent)}function ya(e,n){var a=e.alternate;return a===null?(a=Jn(e.tag,n,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=n,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,n=e.dependencies,a.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function ig(e,n){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=n,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,n=a.dependencies,e.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),e}function xc(e,n,a,o,u,h){var x=0;if(o=e,typeof o=="function")Kf(o)&&(x=1);else if(typeof o=="string")x=yE(e,a,se.current)?26:e==="html"||e==="head"||e==="body"?27:5;else t:switch(o){case yt:return e=Jn(31,a,n,u),e.elementType=yt,e.lanes=h,e;case G:return Ls(a.children,u,h,n);case K:x=8,u|=24;break;case it:return e=Jn(12,a,n,u|2),e.elementType=it,e.lanes=h,e;case Q:return e=Jn(13,a,n,u),e.elementType=Q,e.lanes=h,e;case ct:return e=Jn(19,a,n,u),e.elementType=ct,e.lanes=h,e;case Yt:case V:return e=u|32,e=Jn(30,a,n,e),e.elementType=V,e.lanes=h,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof o=="object"&&o!==null)switch(o.$$typeof){case j:x=10;break t;case X:x=9;break t;case k:x=11;break t;case lt:x=14;break t;case pt:x=16,o=null;break t}x=29,a=Error(s(130,e===null?"null":typeof e,"")),o=null}return n=Jn(x,a,n,u),n.elementType=e,n.type=o,n.lanes=h,n}function Ls(e,n,a,o){return e=Jn(7,e,o,n),e.lanes=a,e}function Jf(e,n,a){return e=Jn(6,e,null,n),e.lanes=a,e}function ag(e){var n=Jn(18,null,null,0);return n.stateNode=e,n}function Qf(e,n,a){return n=Jn(4,e.children!==null?e.children:[],e.key,n),n.lanes=a,n.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},n}var sg=new WeakMap;function Mi(e,n){if(typeof e=="object"&&e!==null){var a=sg.get(e);return a!==void 0?a:(n={value:e,source:n,stack:St(n)},sg.set(e,n),n)}return{value:e,source:n,stack:St(n)}}var Rr=[],wr=0,Sc=null,Yo=0,Ei=[],bi=0,Za=null,Yi=1,Zi="";function Ma(e,n){Rr[wr++]=Yo,Rr[wr++]=Sc,Sc=e,Yo=n}function rg(e,n,a){Ei[bi++]=Yi,Ei[bi++]=Zi,Ei[bi++]=Za,Za=e;var o=Yi;e=Zi;var u=32-ye(o)-1;o&=~(1<<u),a+=1;var h=32-ye(n)+u;if(30<h){var x=u-u%5;h=(o&(1<<x)-1).toString(32),o>>=x,u-=x,Yi=1<<32-ye(n)+u|a<<u|o,Zi=h+e}else Yi=1<<h|a<<u|o,Zi=e}function yc(e){e.return!==null&&(Ma(e,1),rg(e,1,0))}function jf(e){for(;e===Sc;)Sc=Rr[--wr],Rr[wr]=null,Yo=Rr[--wr],Rr[wr]=null;for(;e===Za;)Za=Ei[--bi],Ei[bi]=null,Zi=Ei[--bi],Ei[bi]=null,Yi=Ei[--bi],Ei[bi]=null}function og(e,n){Ei[bi++]=Yi,Ei[bi++]=Zi,Ei[bi++]=Za,Yi=n.id,Zi=n.overflow,Za=e}var Rn=null,sn=null,Ne=!1,Ka=null,Ti=!1,$f=Error(s(519));function Ja(e){var n=Error(s(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Zo(Mi(n,e)),$f}function lg(e){var n=e.stateNode,a=e.type,o=e.memoizedProps;switch(n[R]=e,n[W]=o,a){case"dialog":Oe("cancel",n),Oe("close",n);break;case"iframe":case"object":case"embed":Oe("load",n);break;case"video":case"audio":for(a=0;a<gl.length;a++)Oe(gl[a],n);break;case"source":Oe("error",n);break;case"img":case"image":case"link":Oe("error",n),Oe("load",n);break;case"details":Oe("toggle",n);break;case"input":Oe("invalid",n),S0(n,o.value,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name,!0);break;case"select":Oe("invalid",n);break;case"textarea":Oe("invalid",n),M0(n,o.value,o.defaultValue,o.children)}a=o.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||n.textContent===""+a||o.suppressHydrationWarning===!0||C_(n.textContent,a)?(o.popover!=null&&(Oe("beforetoggle",n),Oe("toggle",n)),o.onScroll!=null&&Oe("scroll",n),o.onScrollEnd!=null&&Oe("scrollend",n),o.onClick!=null&&(n.onclick=qi),n=!0):n=!1,n||Ja(e,!0)}function Mc(e){for(Rn=e.return;Rn;)switch(Rn.tag){case 5:case 31:case 13:Ti=!1;return;case 27:case 3:Ti=!0;return;default:Rn=Rn.return}}function Cr(e){if(e!==Rn)return!1;if(!Ne)return Mc(e),Ne=!0,!1;var n=e.tag,a;if((a=n!==3&&n!==27)&&((a=n===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Cd(e.type,e.memoizedProps)),a=!a),a&&sn&&Ja(e),Mc(e),n===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(s(317));sn=Z_(e)}else if(n===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(s(317));sn=Z_(e)}else n===27?(n=sn,hs(e.type)?(e=Bd,Bd=null,sn=e):sn=n):sn=Rn?Ri(e.stateNode.nextSibling):null;return!0}function Us(){sn=Rn=null,Ne=!1}function th(){var e=Ka;return e!==null&&($n===null?$n=e:$n.push.apply($n,e),Ka=null),e}function Zo(e){Ka===null?Ka=[e]:Ka.push(e)}var eh=Ut(null),Os=null,Ea=null;function Qa(e,n,a){Dt(eh,n._currentValue),n._currentValue=a}function ba(e){e._currentValue=eh.current,Nt(eh)}function Ec(e,n,a){for(;e!==null;){var o=e.alternate;if((e.childLanes&n)!==n?(e.childLanes|=n,o!==null&&(o.childLanes|=n)):o!==null&&(o.childLanes&n)!==n&&(o.childLanes|=n),e===a)break;e=e.return}}function nh(e,n,a,o){var u=e.child;for(u!==null&&(u.return=e);u!==null;){var h=u.dependencies;if(h!==null){var x=u.child;h=h.firstContext;t:for(;h!==null;){var w=h;h=u;for(var B=0;B<n.length;B++)if(w.context===n[B]){h.lanes|=a,w=h.alternate,w!==null&&(w.lanes|=a),Ec(h.return,a,e),o||(x=null);break t}h=w.next}}else if(u.tag===18){if(x=u.return,x===null)throw Error(s(341));x.lanes|=a,h=x.alternate,h!==null&&(h.lanes|=a),Ec(x,a,e),x=null}else u.tag===13&&u.memoizedState!==null&&u.memoizedState.dehydrated===null?(u.lanes|=a,x=u.alternate,x!==null&&(x.lanes|=a),Ec(u.return,a,e),x=u.child,x=x!==null?x.sibling:null):x=u.child;if(x!==null)x.return=u;else for(x=u;x!==null;){if(x===e){x=null;break}if(u=x.sibling,u!==null){u.return=x.return,x=u;break}x=x.return}u=x}}function Ps(e,n,a,o){e=null;for(var u=n,h=!1;u!==null;){if(!h){if((u.flags&524288)!==0)h=!0;else if((u.flags&262144)!==0)break}if(u.tag===10){var x=u.alternate;if(x===null)throw Error(s(387));if(x=x.memoizedProps,x!==null){var w=u.type;li(u.pendingProps.value,x.value)||(e!==null?e.push(w):e=[w])}}else if(u===It.current){if(x=u.alternate,x===null)throw Error(s(387));x.memoizedState.memoizedState!==u.memoizedState.memoizedState&&(e!==null?e.push(to):e=[to])}u=u.return}return e!==null&&nh(n,e,a,o),n.flags|=262144,e!==null}function bc(e){for(e=e.firstContext;e!==null;){if(!li(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Is(e){Os=e,Ea=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Dn(e){return cg(Os,e)}function Tc(e,n){return Os===null&&Is(e),cg(e,n)}function cg(e,n){var a=n._currentValue;if(n={context:n,memoizedValue:a,next:null},Ea===null){if(e===null)throw Error(s(308));Ea=n,e.dependencies={lanes:0,firstContext:n},e.flags|=524288}else Ea=Ea.next=n;return a}var Zy=typeof AbortController<"u"?AbortController:function(){var e=[],n=this.signal={aborted:!1,addEventListener:function(a,o){e.push(o)}};this.abort=function(){n.aborted=!0,e.forEach(function(a){return a()})}},Ky=r.unstable_scheduleCallback,Jy=r.unstable_NormalPriority,vn={$$typeof:j,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function ih(){return{controller:new Zy,data:new Map,refCount:0}}function Ko(e){e.refCount--,e.refCount===0&&Ky(Jy,function(){e.controller.abort()})}function ug(e,n){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<n.length;e++){var o=n[e];a.indexOf(o)===-1&&a.push(o)}}}var Jo=null;function Qy(e){var n=e.transitionTypes;return e.transitionTypes=null,n}var Qo=null,ah=0,zs=0,Nr=null;function jy(e,n){if(Qo===null){var a=Qo=[];ah=0,zs=Sd(),Nr={status:"pending",value:void 0,then:function(o){a.push(o)}}}return ah++,n.then(fg,fg),n}function fg(){if(--ah===0&&(Jo=null,Qo!==null)){Nr!==null&&(Nr.status="fulfilled");var e=Qo;Qo=null,zs=0,Nr=null;for(var n=0;n<e.length;n++)(0,e[n])()}}function $y(e,n){var a=[],o={status:"pending",value:null,reason:null,then:function(u){a.push(u)}};return e.then(function(){o.status="fulfilled",o.value=n;for(var u=0;u<a.length;u++)(0,a[u])(n)},function(u){for(o.status="rejected",o.reason=u,u=0;u<a.length;u++)(0,a[u])(void 0)}),o}var hg=rt.S;rt.S=function(e,n){if(a_=$t(),typeof n=="object"&&n!==null&&typeof n.then=="function"&&jy(e,n),Jo!==null)for(var a=Zr;a!==null;)ug(a,Jo),a=a.next;if(a=e.types,a!==null){for(var o=Zr;o!==null;)ug(o,a),o=o.next;if(zs!==0){o=Jo,o===null&&(o=Jo=[]);for(var u=0;u<a.length;u++){var h=a[u];o.indexOf(h)===-1&&o.push(h)}}}hg!==null&&hg(e,n)};var Bs=Ut(null);function sh(){var e=Bs.current;return e!==null?e:en.pooledCache}function Ac(e,n){n===null?Dt(Bs,Bs.current):Dt(Bs,n.pool)}function dg(){var e=sh();return e===null?null:{parent:vn._currentValue,pool:e}}var Dr=Error(s(460)),rh=Error(s(474)),Rc=Error(s(542)),wc={then:function(){}};function pg(e){return e=e.status,e==="fulfilled"||e==="rejected"}function mg(e,n,a){switch(a=e[a],a===void 0?e.push(n):a!==n&&(n.then(qi,qi),n=a),n.status){case"fulfilled":return n.value;case"rejected":throw e=n.reason,vg(e),e===void 0&&!("reason"in n)?Error(s(600)):e;default:if(typeof n.status=="string")n.then(qi,qi);else{if(e=en,e!==null&&100<e.shellSuspendCounter)throw Error(s(482));e=n,e.status="pending",e.then(function(o){if(n.status==="pending"){var u=n;u.status="fulfilled",u.value=o}},function(o){if(n.status==="pending"){var u=n;u.status="rejected",u.reason=o}})}switch(n.status){case"fulfilled":return n.value;case"rejected":throw e=n.reason,vg(e),e}throw Hs=n,Dr}}function Fs(e){try{var n=e._init;return n(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Hs=a,Dr):a}}var Hs=null;function gg(){if(Hs===null)throw Error(s(459));var e=Hs;return Hs=null,e}function vg(e){if(e===Dr||e===Rc)throw Error(s(483))}var Lr=null,jo=0;function Cc(e){var n=jo;return jo+=1,Lr===null&&(Lr=[]),mg(Lr,e,n)}function ja(e,n){n=n.props.ref,e.ref=n!==void 0?n:null}function Nc(e,n){throw n.$$typeof===T?Error(s(525)):(e=Object.prototype.toString.call(n),Error(s(31,e==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":e)))}function _g(e){function n(et,q){if(e){var ot=et.deletions;ot===null?(et.deletions=[q],et.flags|=16):ot.push(q)}}function a(et,q){if(!e)return null;for(;q!==null;)n(et,q),q=q.sibling;return null}function o(et){for(var q=new Map;et!==null;)et.key===null?q.set(et.index,et):q.set(et.key,et),et=et.sibling;return q}function u(et,q){return et=ya(et,q),et.index=0,et.sibling=null,et}function h(et,q,ot){return et.index=ot,e?(ot=et.alternate,ot!==null?(ot=ot.index,ot<q?(et.flags|=2,q):ot):(et.flags|=134217730,q)):(et.flags|=1048576,q)}function x(et){return e&&et.alternate===null&&(et.flags|=134217730),et}function w(et,q,ot,Et){return q===null||q.tag!==6?(q=Jf(ot,et.mode,Et),q.return=et,q):(q=u(q,ot),q.return=et,q)}function B(et,q,ot,Et){var ne=ot.type;return ne===G?(et=dt(et,q,ot.props.children,Et,ot.key),ja(et,ot),et):q!==null&&(q.elementType===ne||typeof ne=="object"&&ne!==null&&ne.$$typeof===pt&&Fs(ne)===q.type)?(q=u(q,ot.props),ja(q,ot),q.return=et,q):(q=xc(ot.type,ot.key,ot.props,null,et.mode,Et),ja(q,ot),q.return=et,q)}function nt(et,q,ot,Et){return q===null||q.tag!==4||q.stateNode.containerInfo!==ot.containerInfo||q.stateNode.implementation!==ot.implementation?(q=Qf(ot,et.mode,Et),q.return=et,q):(q=u(q,ot.children||[]),q.return=et,q)}function dt(et,q,ot,Et,ne){return q===null||q.tag!==7?(q=Ls(ot,et.mode,Et,ne),q.return=et,q):(q=u(q,ot),q.return=et,q)}function bt(et,q,ot){if(typeof q=="string"&&q!==""||typeof q=="number"||typeof q=="bigint")return q=Jf(""+q,et.mode,ot),q.return=et,q;if(typeof q=="object"&&q!==null){switch(q.$$typeof){case D:return ot=xc(q.type,q.key,q.props,null,et.mode,ot),ja(ot,q),ot.return=et,ot;case H:return q=Qf(q,et.mode,ot),q.return=et,q;case pt:return q=Fs(q),bt(et,q,ot)}if(wt(q)||J(q))return q=Ls(q,et.mode,ot,null),q.return=et,q;if(typeof q.then=="function")return bt(et,Cc(q),ot);if(q.$$typeof===j)return bt(et,Tc(et,q),ot);Nc(et,q)}return null}function $(et,q,ot,Et){var ne=q!==null?q.key:null;if(typeof ot=="string"&&ot!==""||typeof ot=="number"||typeof ot=="bigint")return ne!==null?null:w(et,q,""+ot,Et);if(typeof ot=="object"&&ot!==null){switch(ot.$$typeof){case D:return ot.key===ne?B(et,q,ot,Et):null;case H:return ot.key===ne?nt(et,q,ot,Et):null;case pt:return ot=Fs(ot),$(et,q,ot,Et)}if(wt(ot)||J(ot))return ne!==null?null:dt(et,q,ot,Et,null);if(typeof ot.then=="function")return $(et,q,Cc(ot),Et);if(ot.$$typeof===j)return $(et,q,Tc(et,ot),Et);Nc(et,ot)}return null}function ht(et,q,ot,Et,ne){if(typeof Et=="string"&&Et!==""||typeof Et=="number"||typeof Et=="bigint")return et=et.get(ot)||null,w(q,et,""+Et,ne);if(typeof Et=="object"&&Et!==null){switch(Et.$$typeof){case D:return et=et.get(Et.key===null?ot:Et.key)||null,B(q,et,Et,ne);case H:return et=et.get(Et.key===null?ot:Et.key)||null,nt(q,et,Et,ne);case pt:return Et=Fs(Et),ht(et,q,ot,Et,ne)}if(wt(Et)||J(Et))return et=et.get(ot)||null,dt(q,et,Et,ne,null);if(typeof Et.then=="function")return ht(et,q,ot,Cc(Et),ne);if(Et.$$typeof===j)return ht(et,q,ot,Tc(q,Et),ne);Nc(q,Et)}return null}function Xt(et,q,ot,Et){for(var ne=null,ze=null,pe=q,ge=q=0,Sn=null;pe!==null&&ge<ot.length;ge++){pe.index>ge?(Sn=pe,pe=null):Sn=pe.sibling;var Ve=$(et,pe,ot[ge],Et);if(Ve===null){pe===null&&(pe=Sn);break}e&&pe&&Ve.alternate===null&&n(et,pe),q=h(Ve,q,ge),ze===null?ne=Ve:ze.sibling=Ve,ze=Ve,pe=Sn}if(ge===ot.length)return a(et,pe),Ne&&Ma(et,ge),ne;if(pe===null){for(;ge<ot.length;ge++)pe=bt(et,ot[ge],Et),pe!==null&&(q=h(pe,q,ge),ze===null?ne=pe:ze.sibling=pe,ze=pe);return Ne&&Ma(et,ge),ne}for(pe=o(pe);ge<ot.length;ge++)Sn=ht(pe,et,ge,ot[ge],Et),Sn!==null&&(e&&(Ve=Sn.alternate,Ve!==null&&pe.delete(Ve.key===null?ge:Ve.key)),q=h(Sn,q,ge),ze===null?ne=Sn:ze.sibling=Sn,ze=Sn);return e&&pe.forEach(function(vs){return n(et,vs)}),Ne&&Ma(et,ge),ne}function le(et,q,ot,Et){if(ot==null)throw Error(s(151));for(var ne=null,ze=null,pe=q,ge=q=0,Sn=null,Ve=ot.next();pe!==null&&!Ve.done;ge++,Ve=ot.next()){pe.index>ge?(Sn=pe,pe=null):Sn=pe.sibling;var vs=$(et,pe,Ve.value,Et);if(vs===null){pe===null&&(pe=Sn);break}e&&pe&&vs.alternate===null&&n(et,pe),q=h(vs,q,ge),ze===null?ne=vs:ze.sibling=vs,ze=vs,pe=Sn}if(Ve.done)return a(et,pe),Ne&&Ma(et,ge),ne;if(pe===null){for(;!Ve.done;ge++,Ve=ot.next())Ve=bt(et,Ve.value,Et),Ve!==null&&(q=h(Ve,q,ge),ze===null?ne=Ve:ze.sibling=Ve,ze=Ve);return Ne&&Ma(et,ge),ne}for(pe=o(pe);!Ve.done;ge++,Ve=ot.next())Ve=ht(pe,et,ge,Ve.value,Et),Ve!==null&&(e&&(Sn=Ve.alternate,Sn!==null&&pe.delete(Sn.key===null?ge:Sn.key)),q=h(Ve,q,ge),ze===null?ne=Ve:ze.sibling=Ve,ze=Ve);return e&&pe.forEach(function(UE){return n(et,UE)}),Ne&&Ma(et,ge),ne}function Ae(et,q,ot,Et){if(typeof ot=="object"&&ot!==null&&ot.type===G&&ot.key===null&&ot.props.ref===void 0&&(ot=ot.props.children),typeof ot=="object"&&ot!==null){switch(ot.$$typeof){case D:t:{for(var ne=ot.key;q!==null;){if(q.key===ne){if(ne=ot.type,ne===G){if(q.tag===7){a(et,q.sibling),Et=u(q,ot.props.children),ja(Et,ot),Et.return=et,et=Et;break t}}else if(q.elementType===ne||typeof ne=="object"&&ne!==null&&ne.$$typeof===pt&&Fs(ne)===q.type){a(et,q.sibling),Et=u(q,ot.props),ja(Et,ot),Et.return=et,et=Et;break t}a(et,q);break}else n(et,q);q=q.sibling}ot.type===G?(Et=Ls(ot.props.children,et.mode,Et,ot.key),ja(Et,ot),Et.return=et,et=Et):(Et=xc(ot.type,ot.key,ot.props,null,et.mode,Et),ja(Et,ot),Et.return=et,et=Et)}return x(et);case H:t:{for(ne=ot.key;q!==null;){if(q.key===ne)if(q.tag===4&&q.stateNode.containerInfo===ot.containerInfo&&q.stateNode.implementation===ot.implementation){a(et,q.sibling),Et=u(q,ot.children||[]),Et.return=et,et=Et;break t}else{a(et,q);break}else n(et,q);q=q.sibling}Et=Qf(ot,et.mode,Et),Et.return=et,et=Et}return x(et);case pt:return ot=Fs(ot),Ae(et,q,ot,Et)}if(wt(ot))return Xt(et,q,ot,Et);if(J(ot)){if(ne=J(ot),typeof ne!="function")throw Error(s(150));return ot=ne.call(ot),le(et,q,ot,Et)}if(typeof ot.then=="function")return Ae(et,q,Cc(ot),Et);if(ot.$$typeof===j)return Ae(et,q,Tc(et,ot),Et);Nc(et,ot)}return typeof ot=="string"&&ot!==""||typeof ot=="number"||typeof ot=="bigint"?(ot=""+ot,q!==null&&q.tag===6?(a(et,q.sibling),Et=u(q,ot),Et.return=et,et=Et):(a(et,q),Et=Jf(ot,et.mode,Et),Et.return=et,et=Et),x(et)):a(et,q)}return function(et,q,ot,Et){try{jo=0;var ne=Ae(et,q,ot,Et);return Lr=null,ne}catch(pe){if(pe===Dr||pe===Rc)throw pe;var ze=Jn(29,pe,null,et.mode);return ze.lanes=Et,ze.return=et,ze}finally{}}}var Vs=_g(!0),xg=_g(!1),$a=!1;function oh(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function lh(e,n){e=e.updateQueue,n.updateQueue===e&&(n.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function ts(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function es(e,n,a){var o=e.updateQueue;if(o===null)return null;if(o=o.shared,(ke&2)!==0){var u=o.pending;return u===null?n.next=n:(n.next=u.next,u.next=n),o.pending=n,n=_c(e),ng(e,null,a),n}return vc(e,o,n,a),_c(e)}function $o(e,n,a){if(n=n.updateQueue,n!==null&&(n=n.shared,(a&4194048)!==0)){var o=n.lanes;o&=e.pendingLanes,a|=o,n.lanes=a,Oo(e,a)}}function ch(e,n){var a=e.updateQueue,o=e.alternate;if(o!==null&&(o=o.updateQueue,a===o)){var u=null,h=null;if(a=a.firstBaseUpdate,a!==null){do{var x={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};h===null?u=h=x:h=h.next=x,a=a.next}while(a!==null);h===null?u=h=n:h=h.next=n}else u=h=n;a={baseState:o.baseState,firstBaseUpdate:u,lastBaseUpdate:h,shared:o.shared,callbacks:o.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=n:e.next=n,a.lastBaseUpdate=n}var uh=!1;function tl(){if(uh){var e=Nr;if(e!==null)throw e}}function el(e,n,a,o){uh=!1;var u=e.updateQueue;$a=!1;var h=u.firstBaseUpdate,x=u.lastBaseUpdate,w=u.shared.pending;if(w!==null){u.shared.pending=null;var B=w,nt=B.next;B.next=null,x===null?h=nt:x.next=nt,x=B;var dt=e.alternate;dt!==null&&(dt=dt.updateQueue,w=dt.lastBaseUpdate,w!==x&&(w===null?dt.firstBaseUpdate=nt:w.next=nt,dt.lastBaseUpdate=B))}if(h!==null){var bt=u.baseState;x=0,dt=nt=B=null,w=h;do{var $=w.lane&-536870913,ht=$!==w.lane;if(ht?(Ie&$)===$:(o&$)===$){$!==0&&$===zs&&(uh=!0),dt!==null&&(dt=dt.next={lane:0,tag:w.tag,payload:w.payload,callback:null,next:null});t:{var Xt=e,le=w;$=n;var Ae=a;switch(le.tag){case 1:if(Xt=le.payload,typeof Xt=="function"){bt=Xt.call(Ae,bt,$);break t}bt=Xt;break t;case 3:Xt.flags=Xt.flags&-65537|128;case 0:if(Xt=le.payload,$=typeof Xt=="function"?Xt.call(Ae,bt,$):Xt,$==null)break t;bt=P({},bt,$);break t;case 2:$a=!0}}$=w.callback,$!==null&&(e.flags|=64,ht&&(e.flags|=8192),ht=u.callbacks,ht===null?u.callbacks=[$]:ht.push($))}else ht={lane:$,tag:w.tag,payload:w.payload,callback:w.callback,next:null},dt===null?(nt=dt=ht,B=bt):dt=dt.next=ht,x|=$;if(w=w.next,w===null){if(w=u.shared.pending,w===null)break;ht=w,w=ht.next,ht.next=null,u.lastBaseUpdate=ht,u.shared.pending=null}}while(!0);dt===null&&(B=bt),u.baseState=B,u.firstBaseUpdate=nt,u.lastBaseUpdate=dt,h===null&&(u.shared.lanes=0),ls|=x,e.lanes=x,e.memoizedState=bt}}function Sg(e,n){if(typeof e!="function")throw Error(s(191,e));e.call(n)}function yg(e,n){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)Sg(a[e],n)}var ns=Ut(null),Dc=Ut(0);function Mg(e,n){e=Ca,Dt(Dc,e),Dt(ns,n),Ca=e|n.baseLanes}function fh(){Dt(Dc,Ca),Dt(ns,ns.current)}function hh(){Ca=Dc.current,Nt(ns),Nt(Dc)}var Ln=Ut(null),Bn=null;function is(e){var n=e.alternate;Dt(Un,Un.current&1),Dt(Ln,e),Bn===null&&(n===null||ns.current!==null||n.memoizedState!==null)&&(Bn=e)}function dh(e){Dt(Un,Un.current),Dt(Ln,e),Bn===null&&(Bn=e)}function Eg(e){e.tag===22?(Dt(Un,Un.current),Dt(Ln,e),Bn===null&&(Bn=e)):as()}function as(){Dt(Un,Un.current),Dt(Ln,Ln.current)}function ci(e){Nt(Ln),Bn===e&&(Bn=null),Nt(Un)}var Un=Ut(0);function nl(e,n){Dt(Ln,Ln.current),Dt(Un,n)}function ph(e){Nt(Un),Nt(Ln),Bn===e&&(Bn=null)}function Lc(e){for(var n=e;n!==null;){if(n.tag===13){var a=n.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Id(a)||zd(a)))return n}else if(n.tag===19&&n.memoizedProps.revealOrder!=="independent"){if((n.flags&128)!==0)return n}else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return null;n=n.return}n.sibling.return=n.return,n=n.sibling}return null}var Ta=0,Te=null,$e=null,_n=null,Uc=!1,Ur=!1,Gs=!1,Oc=0,il=0,Or=null,tM=0;function pn(){throw Error(s(321))}function mh(e,n){if(n===null)return!1;for(var a=0;a<n.length&&a<e.length;a++)if(!li(e[a],n[a]))return!1;return!0}function gh(e,n,a,o,u,h){return Ta=h,Te=n,n.memoizedState=null,n.updateQueue=null,n.lanes=0,rt.H=e===null||e.memoizedState===null?rv:ov,Gs=!1,h=a(o,u),Gs=!1,Ur&&(h=Tg(n,a,o,u)),bg(e),h}function bg(e){rt.H=Vc;var n=$e!==null&&$e.next!==null;if(Ta=0,_n=$e=Te=null,Uc=!1,il=0,Or=null,n)throw Error(s(300));e===null||xn||(e=e.dependencies,e!==null&&bc(e)&&(xn=!0))}function Tg(e,n,a,o){Te=e;var u=0;do{if(Ur&&(Or=null),il=0,Ur=!1,25<=u)throw Error(s(301));if(u+=1,_n=$e=null,e.updateQueue!=null){var h=e.updateQueue;h.lastEffect=null,h.events=null,h.stores=null,h.memoCache!=null&&(h.memoCache.index=0)}rt.H=lM,h=n(a,o)}while(Ur);return h}function eM(){var e=rt.H,n=e.useState()[0];return n=typeof n.then=="function"?al(n):n,e=e.useState()[0],($e!==null?$e.memoizedState:null)!==e&&(Te.flags|=1024),n}function vh(){var e=Oc!==0;return Oc=0,e}function _h(e,n,a){n.updateQueue=e.updateQueue,n.flags&=-2053,e.lanes&=~a}function xh(e){if(Uc){for(e=e.memoizedState;e!==null;){var n=e.queue;n!==null&&(n.pending=null),e=e.next}Uc=!1}Ta=0,_n=$e=Te=null,Ur=!1,il=Oc=0,Or=null}function Wn(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return _n===null?Te.memoizedState=_n=e:_n=_n.next=e,_n}function gn(){if($e===null){var e=Te.alternate;e=e!==null?e.memoizedState:null}else e=$e.next;var n=_n===null?Te.memoizedState:_n.next;if(n!==null)_n=n,$e=e;else{if(e===null)throw Te.alternate===null?Error(s(467)):Error(s(310));$e=e,e={memoizedState:$e.memoizedState,baseState:$e.baseState,baseQueue:$e.baseQueue,queue:$e.queue,next:null},_n===null?Te.memoizedState=_n=e:_n=_n.next=e}return _n}function Pc(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function al(e){var n=il;return il+=1,Or===null&&(Or=[]),e=mg(Or,e,n),n=Te,(_n===null?n.memoizedState:_n.next)===null&&(n=n.alternate,rt.H=n===null||n.memoizedState===null?rv:ov),e}function Ic(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return al(e);if(e.$$typeof===_t)return;if(e.$$typeof===j)return Dn(e)}throw Error(s(438,String(e)))}function Sh(e){var n=null,a=Te.updateQueue;if(a!==null&&(n=a.memoCache),n==null){var o=Te.alternate;o!==null&&(o=o.updateQueue,o!==null&&(o=o.memoCache,o!=null&&(n={data:o.data.map(function(u){return u.slice()}),index:0})))}if(n==null&&(n={data:[],index:0}),a===null&&(a=Pc(),Te.updateQueue=a),a.memoCache=n,a=n.data[n.index],a===void 0)for(a=n.data[n.index]=Array(e),o=0;o<e;o++)a[o]=Wt;return n.index++,a}function Aa(e,n){return typeof n=="function"?n(e):n}function zc(e){var n=gn();return yh(n,$e,e)}function yh(e,n,a){var o=e.queue;if(o===null)throw Error(s(311));o.lastRenderedReducer=a;var u=e.baseQueue,h=o.pending;if(h!==null){if(u!==null){var x=u.next;u.next=h.next,h.next=x}n.baseQueue=u=h,o.pending=null}if(h=e.baseState,u===null)e.memoizedState=h;else{n=u.next;var w=x=null,B=null,nt=n,dt=!1;do{var bt=nt.lane&-536870913;if(bt!==nt.lane?(Ie&bt)===bt:(Ta&bt)===bt){var $=nt.revertLane;if($===0)B!==null&&(B=B.next={lane:0,revertLane:0,gesture:null,action:nt.action,hasEagerState:nt.hasEagerState,eagerState:nt.eagerState,next:null}),bt===zs&&(dt=!0);else if((Ta&$)===$){nt=nt.next,$===zs&&(dt=!0);continue}else bt={lane:0,revertLane:nt.revertLane,gesture:null,action:nt.action,hasEagerState:nt.hasEagerState,eagerState:nt.eagerState,next:null},B===null?(w=B=bt,x=h):B=B.next=bt,Te.lanes|=$,ls|=$;bt=nt.action,Gs&&a(h,bt),h=nt.hasEagerState?nt.eagerState:a(h,bt)}else $={lane:bt,revertLane:nt.revertLane,gesture:nt.gesture,action:nt.action,hasEagerState:nt.hasEagerState,eagerState:nt.eagerState,next:null},B===null?(w=B=$,x=h):B=B.next=$,Te.lanes|=bt,ls|=bt;nt=nt.next}while(nt!==null&&nt!==n);if(B===null?x=h:B.next=w,!li(h,e.memoizedState)&&(xn=!0,dt&&(a=Nr,a!==null)))throw a;e.memoizedState=h,e.baseState=x,e.baseQueue=B,o.lastRenderedState=h}return u===null&&(o.lanes=0),[e.memoizedState,o.dispatch]}function Mh(e){var n=gn(),a=n.queue;if(a===null)throw Error(s(311));a.lastRenderedReducer=e;var o=a.dispatch,u=a.pending,h=n.memoizedState;if(u!==null){a.pending=null;var x=u=u.next;do h=e(h,x.action),x=x.next;while(x!==u);li(h,n.memoizedState)||(xn=!0),n.memoizedState=h,n.baseQueue===null&&(n.baseState=h),a.lastRenderedState=h}return[h,o]}function Ag(e,n,a){var o=Te,u=gn(),h=Ne;if(h){if(a===void 0)throw Error(s(407));a=a()}else a=n();var x=!li(($e||u).memoizedState,a);if(x&&(u.memoizedState=a,xn=!0),u=u.queue,Th(Cg.bind(null,o,u,e),[e]),e=u.getSnapshot!==n||x||_n!==null&&(_n.memoizedState.tag&1)!==0,Pr(e?9:8,{destroy:void 0},wg.bind(null,o,u,a,n),null),e){if(o.flags|=2048,en===null)throw Error(s(349));h||(Ta&127)!==0||Rg(o,n,a)}return a}function Rg(e,n,a){e.flags|=16384,e={getSnapshot:n,value:a},n=Te.updateQueue,n===null?(n=Pc(),Te.updateQueue=n,n.stores=[e]):(a=n.stores,a===null?n.stores=[e]:a.push(e))}function wg(e,n,a,o){n.value=a,n.getSnapshot=o,Ng(n)&&Dg(e)}function Cg(e,n,a){return a(function(){Ng(n)&&Dg(e)})}function Ng(e){var n=e.getSnapshot;e=e.value;try{var a=n();return!li(e,a)}catch{return!0}}function Dg(e){var n=Ds(e,2);n!==null&&ti(n,e,2)}function Eh(e){var n=Wn();if(typeof e=="function"){var a=e;if(e=a(),Gs){Be(!0);try{a()}finally{Be(!1)}}}return n.memoizedState=n.baseState=e,n.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Aa,lastRenderedState:e},n}function Lg(e,n,a,o){return e.baseState=a,yh(e,$e,typeof o=="function"?o:Aa)}function nM(e,n,a,o,u){if(Hc(e))throw Error(s(485));if(e=n.action,e!==null){var h={payload:u,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(x){h.listeners.push(x)}};rt.T!==null?a(!0):h.isTransition=!1,o(h),a=n.pending,a===null?(h.next=n.pending=h,Ug(n,h)):(h.next=a.next,n.pending=a.next=h)}}function Ug(e,n){var a=n.action,o=n.payload,u=e.state;if(n.isTransition){var h=rt.T,x={};x.types=h!==null?h.types:null,rt.T=x;try{var w=a(u,o),B=rt.S;B!==null&&B(x,w),Og(e,n,w)}catch(nt){bh(e,n,nt)}finally{h!==null&&x.types!==null&&(h.types=x.types),rt.T=h}}else try{h=a(u,o),Og(e,n,h)}catch(nt){bh(e,n,nt)}}function Og(e,n,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(o){Pg(e,n,o)},function(o){return bh(e,n,o)}):Pg(e,n,a)}function Pg(e,n,a){n.status="fulfilled",n.value=a,Ig(n),e.state=a,n=e.pending,n!==null&&(a=n.next,a===n?e.pending=null:(a=a.next,n.next=a,Ug(e,a)))}function bh(e,n,a){var o=e.pending;if(e.pending=null,o!==null){o=o.next;do n.status="rejected",n.reason=a,Ig(n),n=n.next;while(n!==o)}e.action=null}function Ig(e){e=e.listeners;for(var n=0;n<e.length;n++)(0,e[n])()}function zg(e,n){return n}function Bg(e,n){if(Ne){var a=en.formState;if(a!==null){t:{var o=Te;if(Ne){if(sn){e:{for(var u=sn,h=Ti;u.nodeType!==8;){if(!h){u=null;break e}if(u=Ri(u.nextSibling),u===null){u=null;break e}}h=u.data,u=h==="F!"||h==="F"?u:null}if(u){sn=Ri(u.nextSibling),o=u.data==="F!";break t}}Ja(o)}o=!1}o&&(n=a[0])}}return a=Wn(),a.memoizedState=a.baseState=n,o={pending:null,lanes:0,dispatch:null,lastRenderedReducer:zg,lastRenderedState:n},a.queue=o,a=iv.bind(null,Te,o),o.dispatch=a,o=Eh(!1),h=Nh.bind(null,Te,!1,o.queue),o=Wn(),u={state:n,dispatch:null,action:e,pending:null},o.queue=u,a=nM.bind(null,Te,u,h,a),u.dispatch=a,o.memoizedState=e,[n,a,!1]}function Fg(e){var n=gn();return Hg(n,$e,e)}function Hg(e,n,a){if(n=yh(e,n,zg)[0],e=zc(Aa)[0],typeof n=="object"&&n!==null&&typeof n.then=="function")try{var o=al(n)}catch(x){throw x===Dr?Rc:x}else o=n;n=gn();var u=n.queue,h=u.dispatch;return a!==n.memoizedState&&(Te.flags|=2048,Pr(9,{destroy:void 0},iM.bind(null,u,a),null)),[o,h,e]}function iM(e,n){e.action=n}function Vg(e){var n=gn(),a=$e;if(a!==null)return Hg(n,a,e);gn(),n=n.memoizedState,a=gn();var o=a.queue.dispatch;return a.memoizedState=e,[n,o,!1]}function Pr(e,n,a,o){return e={tag:e,create:a,deps:o,inst:n,next:null},n=Te.updateQueue,n===null&&(n=Pc(),Te.updateQueue=n),a=n.lastEffect,a===null?n.lastEffect=e.next=e:(o=a.next,a.next=e,e.next=o,n.lastEffect=e),e}function Gg(){return gn().memoizedState}function Bc(e,n,a,o){var u=Wn();Te.flags|=e,u.memoizedState=Pr(1|n,{destroy:void 0},a,o===void 0?null:o)}function Fc(e,n,a,o){var u=gn();o=o===void 0?null:o;var h=u.memoizedState.inst;$e!==null&&o!==null&&mh(o,$e.memoizedState.deps)?u.memoizedState=Pr(n,h,a,o):(Te.flags|=e,u.memoizedState=Pr(1|n,h,a,o))}function Xg(e,n){Bc(8390656,8,e,n)}function Th(e,n){Fc(2048,8,e,n)}function aM(e){Te.flags|=4;var n=Te.updateQueue;if(n===null)n=Pc(),Te.updateQueue=n,n.events=[e];else{var a=n.events;a===null?n.events=[e]:a.push(e)}}function kg(e){var n=gn().memoizedState;return aM({ref:n,nextImpl:e}),function(){if((ke&2)!==0)throw Error(s(440));return n.impl.apply(void 0,arguments)}}function Wg(e,n){return Fc(4,2,e,n)}function qg(e,n){return Fc(4,4,e,n)}function Yg(e,n){if(typeof n=="function"){e=e();var a=n(e);return function(){typeof a=="function"?a():n(null)}}if(n!=null)return e=e(),n.current=e,function(){n.current=null}}function Zg(e,n,a){a=a!=null?a.concat([e]):null,Fc(4,4,Yg.bind(null,n,e),a)}function Ah(){}function Kg(e,n){var a=gn();n=n===void 0?null:n;var o=a.memoizedState;return n!==null&&mh(n,o[1])?o[0]:(a.memoizedState=[e,n],e)}function Jg(e,n){var a=gn();n=n===void 0?null:n;var o=a.memoizedState;if(n!==null&&mh(n,o[1]))return o[0];if(o=e(),Gs){Be(!0);try{e()}finally{Be(!1)}}return a.memoizedState=[o,n],o}function Rh(e,n,a){return a===void 0||(Ta&1073741824)!==0&&(Ie&261930)===0?e.memoizedState=n:(e.memoizedState=a,e=r_(),Te.lanes|=e,ls|=e,a)}function Qg(e,n,a,o){return li(a,n)?a:ns.current!==null?(e=Rh(e,a,o),li(e,n)||(xn=!0),e):(Ta&106)===0||(Ta&1073741824)!==0&&(Ie&261930)===0?(xn=!0,e.memoizedState=a):(e=r_(),Te.lanes|=e,ls|=e,n)}function jg(e,n,a,o,u){var h=At.p;At.p=h!==0&&8>h?h:8;var x=rt.T,w={};w.types=x!==null?x.types:null,rt.T=w,Nh(e,!1,n,a);try{var B=u(),nt=rt.S;if(nt!==null&&nt(w,B),B!==null&&typeof B=="object"&&typeof B.then=="function"){var dt=$y(B,o);sl(e,n,dt,di(e))}else sl(e,n,o,di(e))}catch(bt){sl(e,n,{then:function(){},status:"rejected",reason:bt},di())}finally{At.p=h,x!==null&&w.types!==null&&(x.types=w.types),rt.T=x}}function sM(){}function wh(e,n,a,o){if(e.tag!==5)throw Error(s(476));var u=$g(e).queue;jg(e,u,n,fe,a===null?sM:function(){return tv(e),a(o)})}function $g(e){var n=e.memoizedState;if(n!==null)return n;n={memoizedState:fe,baseState:fe,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Aa,lastRenderedState:fe},next:null};var a={};return n.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Aa,lastRenderedState:a},next:null},e.memoizedState=n,e=e.alternate,e!==null&&(e.memoizedState=n),n}function tv(e){var n=$g(e);n.next===null&&(n=e.alternate.memoizedState),sl(e,n.next.queue,{},di())}function Ch(){return Dn(to)}function ev(){return gn().memoizedState}function nv(){return gn().memoizedState}function rM(e){for(var n=e.return;n!==null;){switch(n.tag){case 24:case 3:var a=di();e=ts(a);var o=es(n,e,a);o!==null&&(ti(o,n,a),$o(o,n,a)),n={cache:ih()},e.payload=n;return}n=n.return}}function oM(e,n,a){var o=di();a={lane:o,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Hc(e)?av(n,a):(a=Zf(e,n,a,o),a!==null&&(ti(a,e,o),sv(a,n,o)))}function iv(e,n,a){var o=di();sl(e,n,a,o)}function sl(e,n,a,o){var u={lane:o,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Hc(e))av(n,u);else{var h=e.alternate;if(e.lanes===0&&(h===null||h.lanes===0)&&(h=n.lastRenderedReducer,h!==null))try{var x=n.lastRenderedState,w=h(x,a);if(u.hasEagerState=!0,u.eagerState=w,li(w,x))return vc(e,n,u,0),en===null&&gc(),!1}catch{}finally{}if(a=Zf(e,n,u,o),a!==null)return ti(a,e,o),sv(a,n,o),!0}return!1}function Nh(e,n,a,o){if(o={lane:2,revertLane:Sd(),gesture:null,action:o,hasEagerState:!1,eagerState:null,next:null},Hc(e)){if(n)throw Error(s(479))}else n=Zf(e,a,o,2),n!==null&&ti(n,e,2)}function Hc(e){var n=e.alternate;return e===Te||n!==null&&n===Te}function av(e,n){Ur=Uc=!0;var a=e.pending;a===null?n.next=n:(n.next=a.next,a.next=n),e.pending=n}function sv(e,n,a){if((a&4194048)!==0){var o=n.lanes;o&=e.pendingLanes,a|=o,n.lanes=a,Oo(e,a)}}var Vc={readContext:Dn,use:Ic,useCallback:pn,useContext:pn,useEffect:pn,useImperativeHandle:pn,useLayoutEffect:pn,useInsertionEffect:pn,useMemo:pn,useReducer:pn,useRef:pn,useState:pn,useDebugValue:pn,useDeferredValue:pn,useTransition:pn,useSyncExternalStore:pn,useId:pn,useHostTransitionStatus:pn,useFormState:pn,useActionState:pn,useOptimistic:pn,useMemoCache:pn,useCacheRefresh:pn,useEffectEvent:pn},rv={readContext:Dn,use:Ic,useCallback:function(e,n){return Wn().memoizedState=[e,n===void 0?null:n],e},useContext:Dn,useEffect:Xg,useImperativeHandle:function(e,n,a){a=a!=null?a.concat([e]):null,Bc(4194308,4,Yg.bind(null,n,e),a)},useLayoutEffect:function(e,n){return Bc(4194308,4,e,n)},useInsertionEffect:function(e,n){Bc(4,2,e,n)},useMemo:function(e,n){var a=Wn();n=n===void 0?null:n;var o=e();if(Gs){Be(!0);try{e()}finally{Be(!1)}}return a.memoizedState=[o,n],o},useReducer:function(e,n,a){var o=Wn();if(a!==void 0){var u=a(n);if(Gs){Be(!0);try{a(n)}finally{Be(!1)}}}else u=n;return o.memoizedState=o.baseState=u,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:u},o.queue=e,e=e.dispatch=oM.bind(null,Te,e),[o.memoizedState,e]},useRef:function(e){var n=Wn();return e={current:e},n.memoizedState=e},useState:function(e){e=Eh(e);var n=e.queue,a=iv.bind(null,Te,n);return n.dispatch=a,[e.memoizedState,a]},useDebugValue:Ah,useDeferredValue:function(e,n){var a=Wn();return Rh(a,e,n)},useTransition:function(){var e=Eh(!1);return e=jg.bind(null,Te,e.queue,!0,!1),Wn().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,n,a){var o=Te,u=Wn();if(Ne){if(a===void 0)throw Error(s(407));a=a()}else{if(a=n(),en===null)throw Error(s(349));(Ie&127)!==0||Rg(o,n,a)}u.memoizedState=a;var h={value:a,getSnapshot:n};return u.queue=h,Xg(Cg.bind(null,o,h,e),[e]),o.flags|=2048,Pr(9,{destroy:void 0},wg.bind(null,o,h,a,n),null),a},useId:function(){var e=Wn(),n=en.identifierPrefix;if(Ne){var a=Zi,o=Yi;a=(o&~(1<<32-ye(o)-1)).toString(32)+a,n="_"+n+"R_"+a,a=Oc++,0<a&&(n+="H"+a.toString(32)),n+="_"}else a=tM++,n="_"+n+"r_"+a.toString(32)+"_";return e.memoizedState=n},useHostTransitionStatus:Ch,useFormState:Bg,useActionState:Bg,useOptimistic:function(e){var n=Wn();n.memoizedState=n.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return n.queue=a,n=Nh.bind(null,Te,!0,a),a.dispatch=n,[e,n]},useMemoCache:Sh,useCacheRefresh:function(){return Wn().memoizedState=rM.bind(null,Te)},useEffectEvent:function(e){var n=Wn(),a={impl:e};return n.memoizedState=a,function(){if((ke&2)!==0)throw Error(s(440));return a.impl.apply(void 0,arguments)}}},ov={readContext:Dn,use:Ic,useCallback:Kg,useContext:Dn,useEffect:Th,useImperativeHandle:Zg,useInsertionEffect:Wg,useLayoutEffect:qg,useMemo:Jg,useReducer:zc,useRef:Gg,useState:function(){return zc(Aa)},useDebugValue:Ah,useDeferredValue:function(e,n){var a=gn();return Qg(a,$e.memoizedState,e,n)},useTransition:function(){var e=zc(Aa)[0],n=gn().memoizedState;return[typeof e=="boolean"?e:al(e),n]},useSyncExternalStore:Ag,useId:ev,useHostTransitionStatus:Ch,useFormState:Fg,useActionState:Fg,useOptimistic:function(e,n){var a=gn();return Lg(a,$e,e,n)},useMemoCache:Sh,useCacheRefresh:nv,useEffectEvent:kg},lM={readContext:Dn,use:Ic,useCallback:Kg,useContext:Dn,useEffect:Th,useImperativeHandle:Zg,useInsertionEffect:Wg,useLayoutEffect:qg,useMemo:Jg,useReducer:Mh,useRef:Gg,useState:function(){return Mh(Aa)},useDebugValue:Ah,useDeferredValue:function(e,n){var a=gn();return $e===null?Rh(a,e,n):Qg(a,$e.memoizedState,e,n)},useTransition:function(){var e=Mh(Aa)[0],n=gn().memoizedState;return[typeof e=="boolean"?e:al(e),n]},useSyncExternalStore:Ag,useId:ev,useHostTransitionStatus:Ch,useFormState:Vg,useActionState:Vg,useOptimistic:function(e,n){var a=gn();return $e!==null?Lg(a,$e,e,n):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:Sh,useCacheRefresh:nv,useEffectEvent:kg};function Dh(e,n,a,o){n=e.memoizedState,a=a(o,n),a=a==null?n:P({},n,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Lh={enqueueSetState:function(e,n,a){e=e._reactInternals;var o=di(),u=ts(o);u.payload=n,a!=null&&(u.callback=a),n=es(e,u,o),n!==null&&(ti(n,e,o),$o(n,e,o))},enqueueReplaceState:function(e,n,a){e=e._reactInternals;var o=di(),u=ts(o);u.tag=1,u.payload=n,a!=null&&(u.callback=a),n=es(e,u,o),n!==null&&(ti(n,e,o),$o(n,e,o))},enqueueForceUpdate:function(e,n){e=e._reactInternals;var a=di(),o=ts(a);o.tag=2,n!=null&&(o.callback=n),n=es(e,o,a),n!==null&&(ti(n,e,a),$o(n,e,a))}};function lv(e,n,a,o,u,h,x){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(o,h,x):n.prototype&&n.prototype.isPureReactComponent?!Wo(a,o)||!Wo(u,h):!0}function cv(e,n,a,o){e=n.state,typeof n.componentWillReceiveProps=="function"&&n.componentWillReceiveProps(a,o),typeof n.UNSAFE_componentWillReceiveProps=="function"&&n.UNSAFE_componentWillReceiveProps(a,o),n.state!==e&&Lh.enqueueReplaceState(n,n.state,null)}function Xs(e,n){var a=n;if("ref"in n){a={};for(var o in n)o!=="ref"&&(a[o]=n[o])}if(e=e.defaultProps){a===n&&(a=P({},a));for(var u in e)a[u]===void 0&&(a[u]=e[u])}return a}function uv(e){mc(e)}function fv(e){console.error(e)}function hv(e){mc(e)}function Gc(e,n){try{var a=e.onUncaughtError;a(n.value,{componentStack:n.stack})}catch(o){setTimeout(function(){throw o})}}function dv(e,n,a){try{var o=e.onCaughtError;o(a.value,{componentStack:a.stack,errorBoundary:n.tag===1?n.stateNode:null})}catch(u){setTimeout(function(){throw u})}}function Uh(e,n,a){return a=ts(a),a.tag=3,a.payload={element:null},a.callback=function(){Gc(e,n)},a}function pv(e){return e=ts(e),e.tag=3,e}function mv(e,n,a,o){var u=a.type.getDerivedStateFromError;if(typeof u=="function"){var h=o.value;e.payload=function(){return u(h)},e.callback=function(){dv(n,a,o)}}var x=a.stateNode;x!==null&&typeof x.componentDidCatch=="function"&&(e.callback=function(){dv(n,a,o),typeof u!="function"&&(cs===null?cs=new Set([this]):cs.add(this));var w=o.stack;this.componentDidCatch(o.value,{componentStack:w!==null?w:""})})}function cM(e,n,a,o,u){if(a.flags|=32768,o!==null&&typeof o=="object"&&typeof o.then=="function"){if(n=a.alternate,n!==null&&Ps(n,a,u,!0),a=Ln.current,a!==null){switch(a.tag){case 31:case 13:case 19:return Bn===null?cu():a.alternate===null&&mn===0&&(mn=3),a.flags&=-257,a.flags|=65536,a.lanes=u,o===wc?a.flags|=16384:(n=a.updateQueue,n===null?a.updateQueue=new Set([o]):n.add(o),vd(e,o,u)),!1;case 22:return a.flags|=65536,o===wc?a.flags|=16384:(n=a.updateQueue,n===null?(n={transitions:null,markerInstances:null,retryQueue:new Set([o])},a.updateQueue=n):(a=n.retryQueue,a===null?n.retryQueue=new Set([o]):a.add(o)),vd(e,o,u)),!1}throw Error(s(435,a.tag))}return vd(e,o,u),cu(),!1}if(Ne)return n=Ln.current,n!==null?((n.flags&65536)===0&&(n.flags|=256),n.flags|=65536,n.lanes=u,o!==$f&&(e=Error(s(422),{cause:o}),Zo(Mi(e,a)))):(o!==$f&&(n=Error(s(423),{cause:o}),Zo(Mi(n,a))),e=e.current.alternate,e.flags|=65536,u&=-u,e.lanes|=u,o=Mi(o,a),u=Uh(e.stateNode,o,u),ch(e,u),mn!==4&&(mn=2)),!1;var h=Error(s(520),{cause:o});if(h=Mi(h,a),dl===null?dl=[h]:dl.push(h),mn!==4&&(mn=2),n===null)return!0;o=Mi(o,a),a=n;do{switch(a.tag){case 3:return a.flags|=65536,e=u&-u,a.lanes|=e,e=Uh(a.stateNode,o,e),ch(a,e),!1;case 1:if(n=a.type,h=a.stateNode,(a.flags&128)===0&&(typeof n.getDerivedStateFromError=="function"||h!==null&&typeof h.componentDidCatch=="function"&&(cs===null||!cs.has(h))))return a.flags|=65536,u&=-u,a.lanes|=u,u=pv(u),mv(u,e,a,o),ch(a,u),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var Oh=Error(s(461)),xn=!1;function bn(e,n,a,o){n.child=e===null?xg(n,null,a,o):Vs(n,e.child,a,o)}function gv(e,n,a,o,u){a=a.render;var h=n.ref;if("ref"in o){var x={};for(var w in o)w!=="ref"&&(x[w]=o[w])}else x=o;return Is(n),o=gh(e,n,a,x,h,u),w=vh(),e!==null&&!xn?(_h(e,n,u),Ra(e,n,u)):(Ne&&w&&yc(n),n.flags|=1,bn(e,n,o,u),n.child)}function vv(e,n,a,o,u){if(e===null){var h=a.type;return typeof h=="function"&&!Kf(h)&&h.defaultProps===void 0&&a.compare===null?(n.tag=15,n.type=h,_v(e,n,h,o,u)):(e=xc(a.type,null,o,n,n.mode,u),e.ref=n.ref,e.return=n,n.child=e)}if(h=e.child,!Gh(e,u)){var x=h.memoizedProps;if(a=a.compare,a=a!==null?a:Wo,a(x,o)&&e.ref===n.ref)return Ra(e,n,u)}return n.flags|=1,e=ya(h,o),e.ref=n.ref,e.return=n,n.child=e}function _v(e,n,a,o,u){if(e!==null){var h=e.memoizedProps;if(Wo(h,o)&&e.ref===n.ref)if(xn=!1,n.pendingProps=o=h,Gh(e,u))(e.flags&131072)!==0&&(xn=!0);else return n.lanes=e.lanes,Ra(e,n,u)}return Ph(e,n,a,o,u)}function xv(e,n,a,o){var u=o.children,h=e!==null?e.memoizedState:null;if(e===null&&n.stateNode===null&&(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),o.mode==="hidden"){if((n.flags&128)!==0){if(h=h!==null?h.baseLanes|a:a,e!==null){for(o=n.child=e.child,u=0;o!==null;)u=u|o.lanes|o.childLanes,o=o.sibling;o=u&~h}else o=0,n.child=null;return Sv(e,n,h,a,o)}if((a&536870912)!==0)n.memoizedState={baseLanes:0,cachePool:null},e!==null&&Ac(n,h!==null?h.cachePool:null),h!==null?Mg(n,h):fh(),Eg(n);else return o=n.lanes=536870912,Sv(e,n,h!==null?h.baseLanes|a:a,a,o)}else h!==null?(Ac(n,h.cachePool),Mg(n,h),as(),n.memoizedState=null):(e!==null&&Ac(n,null),fh(),as());return bn(e,n,u,a),n.child}function rl(e,n){return e!==null&&e.tag===22||n.stateNode!==null||(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.sibling}function Sv(e,n,a,o,u){var h=sh();return h=h===null?null:{parent:vn._currentValue,pool:h},n.memoizedState={baseLanes:a,cachePool:h},e!==null&&Ac(n,null),fh(),Eg(n),e!==null&&Ps(e,n,o,!0),n.childLanes=u,null}function Xc(e,n){return n=kc({mode:n.mode,children:n.children},e.mode),n.ref=e.ref,e.child=n,n.return=e,n}function yv(e,n,a){return Vs(n,e.child,null,a),e=Xc(n,n.pendingProps),e.flags|=2,ci(n),n.memoizedState=null,e}function uM(e,n,a){var o=n.pendingProps,u=(n.flags&128)!==0;if(n.flags&=-129,e===null){if(Ne){if(o.mode==="hidden")return e=Xc(n,o),n.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},rl(null,e);if(dh(n),(e=sn)?(e=Y_(e,Ti),e=e!==null&&e.data==="&"?e:null,e!==null&&(n.memoizedState={dehydrated:e,treeContext:Za!==null?{id:Yi,overflow:Zi}:null,retryLane:536870912,hydrationErrors:null},a=ag(e),a.return=n,n.child=a,Rn=n,sn=null)):e=null,e===null)throw Ja(n);return n.lanes=536870912,null}return Xc(n,o)}var h=e.memoizedState;if(h!==null){var x=h.dehydrated;if(dh(n),u)if(n.flags&256)n.flags&=-257,n=yv(e,n,a);else if(n.memoizedState!==null)n.child=e.child,n.flags|=128,n=null;else throw Error(s(558));else if(xn||Ps(e,n,a,!1),u=(a&e.childLanes)!==0,xn||u){if(ns.current===null){if(o=en,o!==null&&(x=Po(o,a),x!==0&&x!==h.retryLane))throw h.retryLane=x,Ds(e,x),ti(o,e,x),Oh;cu()}n=yv(e,n,a)}else e=h.treeContext,sn=Ri(x.nextSibling),Rn=n,Ne=!0,Ka=null,Ti=!1,e!==null&&og(n,e),n=Xc(n,o),n.flags|=134221824;return n}return e=ya(e.child,{mode:o.mode,children:o.children}),e.ref=n.ref,n.child=e,e.return=n,e}function Ir(e,n){var a=n.ref;if(a===null)e!==null&&e.ref!==null&&(n.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(s(284));(e===null||e.ref!==a)&&(n.flags|=4194816)}}function Ph(e,n,a,o,u){return Is(n),a=gh(e,n,a,o,void 0,u),o=vh(),e!==null&&!xn?(_h(e,n,u),Ra(e,n,u)):(Ne&&o&&yc(n),n.flags|=1,bn(e,n,a,u),n.child)}function Mv(e,n,a,o,u,h){return Is(n),n.updateQueue=null,a=Tg(n,o,a,u),bg(e),o=vh(),e!==null&&!xn?(_h(e,n,h),Ra(e,n,h)):(Ne&&o&&yc(n),n.flags|=1,bn(e,n,a,h),n.child)}function Ev(e,n,a,o,u){if(Is(n),n.stateNode===null){var h=Ar,x=a.contextType;typeof x=="object"&&x!==null&&(h=Dn(x)),h=new a(o,h),n.memoizedState=h.state!==null&&h.state!==void 0?h.state:null,h.updater=Lh,n.stateNode=h,h._reactInternals=n,h=n.stateNode,h.props=o,h.state=n.memoizedState,h.refs={},oh(n),x=a.contextType,h.context=typeof x=="object"&&x!==null?Dn(x):Ar,h.state=n.memoizedState,x=a.getDerivedStateFromProps,typeof x=="function"&&(Dh(n,a,x,o),h.state=n.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof h.getSnapshotBeforeUpdate=="function"||typeof h.UNSAFE_componentWillMount!="function"&&typeof h.componentWillMount!="function"||(x=h.state,typeof h.componentWillMount=="function"&&h.componentWillMount(),typeof h.UNSAFE_componentWillMount=="function"&&h.UNSAFE_componentWillMount(),x!==h.state&&Lh.enqueueReplaceState(h,h.state,null),el(n,o,h,u),tl(),h.state=n.memoizedState),typeof h.componentDidMount=="function"&&(n.flags|=4194308),o=!0}else if(e===null){h=n.stateNode;var w=n.memoizedProps,B=Xs(a,w);h.props=B;var nt=h.context,dt=a.contextType;x=Ar,typeof dt=="object"&&dt!==null&&(x=Dn(dt));var bt=a.getDerivedStateFromProps;dt=typeof bt=="function"||typeof h.getSnapshotBeforeUpdate=="function",w=n.pendingProps!==w,dt||typeof h.UNSAFE_componentWillReceiveProps!="function"&&typeof h.componentWillReceiveProps!="function"||(w||nt!==x)&&cv(n,h,o,x),$a=!1;var $=n.memoizedState;h.state=$,el(n,o,h,u),tl(),nt=n.memoizedState,w||$!==nt||$a?(typeof bt=="function"&&(Dh(n,a,bt,o),nt=n.memoizedState),(B=$a||lv(n,a,B,o,$,nt,x))?(dt||typeof h.UNSAFE_componentWillMount!="function"&&typeof h.componentWillMount!="function"||(typeof h.componentWillMount=="function"&&h.componentWillMount(),typeof h.UNSAFE_componentWillMount=="function"&&h.UNSAFE_componentWillMount()),typeof h.componentDidMount=="function"&&(n.flags|=4194308)):(typeof h.componentDidMount=="function"&&(n.flags|=4194308),n.memoizedProps=o,n.memoizedState=nt),h.props=o,h.state=nt,h.context=x,o=B):(typeof h.componentDidMount=="function"&&(n.flags|=4194308),o=!1)}else{h=n.stateNode,lh(e,n),x=n.memoizedProps,dt=Xs(a,x),h.props=dt,bt=n.pendingProps,$=h.context,nt=a.contextType,B=Ar,typeof nt=="object"&&nt!==null&&(B=Dn(nt)),w=a.getDerivedStateFromProps,(nt=typeof w=="function"||typeof h.getSnapshotBeforeUpdate=="function")||typeof h.UNSAFE_componentWillReceiveProps!="function"&&typeof h.componentWillReceiveProps!="function"||(x!==bt||$!==B)&&cv(n,h,o,B),$a=!1,$=n.memoizedState,h.state=$,el(n,o,h,u),tl();var ht=n.memoizedState;x!==bt||$!==ht||$a||e!==null&&e.dependencies!==null&&bc(e.dependencies)?(typeof w=="function"&&(Dh(n,a,w,o),ht=n.memoizedState),(dt=$a||lv(n,a,dt,o,$,ht,B)||e!==null&&e.dependencies!==null&&bc(e.dependencies))?(nt||typeof h.UNSAFE_componentWillUpdate!="function"&&typeof h.componentWillUpdate!="function"||(typeof h.componentWillUpdate=="function"&&h.componentWillUpdate(o,ht,B),typeof h.UNSAFE_componentWillUpdate=="function"&&h.UNSAFE_componentWillUpdate(o,ht,B)),typeof h.componentDidUpdate=="function"&&(n.flags|=4),typeof h.getSnapshotBeforeUpdate=="function"&&(n.flags|=1024)):(typeof h.componentDidUpdate!="function"||x===e.memoizedProps&&$===e.memoizedState||(n.flags|=4),typeof h.getSnapshotBeforeUpdate!="function"||x===e.memoizedProps&&$===e.memoizedState||(n.flags|=1024),n.memoizedProps=o,n.memoizedState=ht),h.props=o,h.state=ht,h.context=B,o=dt):(typeof h.componentDidUpdate!="function"||x===e.memoizedProps&&$===e.memoizedState||(n.flags|=4),typeof h.getSnapshotBeforeUpdate!="function"||x===e.memoizedProps&&$===e.memoizedState||(n.flags|=1024),o=!1)}return h=o,Ir(e,n),o=(n.flags&128)!==0,h||o?(h=n.stateNode,a=o&&typeof a.getDerivedStateFromError!="function"?null:h.render(),n.flags|=1,e!==null&&o?(n.child=Vs(n,e.child,null,u),n.child=Vs(n,null,a,u)):bn(e,n,a,u),n.memoizedState=h.state,e=n.child):e=Ra(e,n,u),e}function bv(e,n,a,o){return Us(),n.flags|=256,bn(e,n,a,o),n.child}var Ih={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function zh(e){return{baseLanes:e,cachePool:dg()}}function Bh(e,n,a){return e=e!==null?e.childLanes&~a:0,n&&(e|=hi),e}function Tv(e,n,a){var o=n.pendingProps,u=!1,h=(n.flags&128)!==0,x;if((x=h)||(x=e!==null&&e.memoizedState===null?!1:(Un.current&2)!==0),x&&(u=!0,n.flags&=-129),x=(n.flags&32)!==0,n.flags&=-33,e===null){if(Ne){if(u?is(n):as(),(e=sn)?(e=Y_(e,Ti),e=e!==null&&e.data!=="&"?e:null,e!==null&&(n.memoizedState={dehydrated:e,treeContext:Za!==null?{id:Yi,overflow:Zi}:null,retryLane:536870912,hydrationErrors:null},a=ag(e),a.return=n,n.child=a,Rn=n,sn=null)):e=null,e===null)throw Ja(n);return zd(e)?n.lanes=32:n.lanes=536870912,null}return h=o.children,o=o.fallback,u?(as(),u=n.mode,h=kc({mode:"hidden",children:h},u),o=Ls(o,u,a,null),h.return=n,o.return=n,h.sibling=o,n.child=h,o=n.child,o.memoizedState=zh(a),o.childLanes=Bh(e,x,a),n.memoizedState=Ih,rl(null,o)):(is(n),Fh(n,h))}var w=e.memoizedState;if(w!==null){var B=w.dehydrated;if(B!==null)return fM(e,n,h,x,o,B,w,a)}return u?(as(),u=o.fallback,h=n.mode,w=e.child,B=w.sibling,o=ya(w,{mode:"hidden",children:o.children}),o.subtreeFlags=w.subtreeFlags&1206910976,B!==null?u=ya(B,u):(u=Ls(u,h,a,null),u.flags|=2),u.return=n,o.return=n,o.sibling=u,n.child=o,rl(null,o),o=n.child,u=e.child.memoizedState,u===null?u=zh(a):(h=u.cachePool,h!==null?(w=vn._currentValue,h=h.parent!==w?{parent:w,pool:w}:h):h=dg(),u={baseLanes:u.baseLanes|a,cachePool:h}),o.memoizedState=u,o.childLanes=Bh(e,x,a),n.memoizedState=Ih,rl(e.child,o)):(is(n),a=e.child,e=a.sibling,a=ya(a,{mode:"visible",children:o.children}),a.return=n,a.sibling=null,e!==null&&(x=n.deletions,x===null?(n.deletions=[e],n.flags|=16):x.push(e)),n.child=a,n.memoizedState=null,a)}function Fh(e,n){return n=kc({mode:"visible",children:n},e.mode),n.return=e,e.child=n}function kc(e,n){return e=Jn(22,e,null,n),e.lanes=0,e}function Wc(e,n,a){return Vs(n,e.child,null,a),e=Fh(n,n.pendingProps.children),e.flags|=2,n.memoizedState=null,e}function fM(e,n,a,o,u,h,x,w){if(a)return n.flags&256?(is(n),n.flags&=-257,Wc(e,n,w)):n.memoizedState!==null?(as(),n.child=e.child,n.flags|=128,null):(as(),h=u.fallback,x=n.mode,u=kc({mode:"visible",children:u.children},x),h=Ls(h,x,w,null),h.flags|=2,u.return=n,h.return=n,u.sibling=h,n.child=u,Vs(n,e.child,null,w),u=n.child,u.memoizedState=zh(w),u.childLanes=Bh(e,o,w),n.memoizedState=Ih,rl(null,u));if(is(n),zd(h)){if(o=h.nextSibling&&h.nextSibling.dataset,o)var B=o.dgst;return o=B,o!==""&&(u=Error(s(419)),u.stack="",u.digest=o,Zo({value:u,source:null,stack:null})),Wc(e,n,w)}if(xn||Ps(e,n,w,!1),o=(w&e.childLanes)!==0,xn||o){if(ns.current!==null)return Wc(e,n,w);if(o=en,o!==null&&(u=Po(o,w),u!==0&&u!==x.retryLane))throw x.retryLane=u,Ds(e,u),ti(o,e,u),Oh;return Id(h)||cu(),Wc(e,n,w)}return Id(h)?(n.flags|=192,n.child=e.child,null):(e=x.treeContext,sn=Ri(h.nextSibling),Rn=n,Ne=!0,Ka=null,Ti=!1,e!==null&&og(n,e),n=Fh(n,u.children),n.flags|=134221824,n)}function Av(e,n,a){e.lanes|=n;var o=e.alternate;o!==null&&(o.lanes|=n),Ec(e.return,n,a)}function Rv(e){for(var n=null;e!==null;){var a=e.alternate;a!==null&&Lc(a)===null&&(n=e),e=e.sibling}return n}function qc(e,n,a,o,u,h){var x=e.memoizedState;x===null?e.memoizedState={isBackwards:n,rendering:null,renderingStartTime:0,last:o,tail:a,tailMode:u,treeForkCount:h}:(x.isBackwards=n,x.rendering=null,x.renderingStartTime=0,x.last=o,x.tail=a,x.tailMode=u,x.treeForkCount=h)}function Hh(e){var n=e.child;for(e.child=null;n!==null;){var a=n.sibling;n.sibling=e.child,e.child=n,n=a}}function Vh(e,n,a){var o=n.pendingProps,u=o.revealOrder,h=o.tail;o=o.children;var x=Un.current;if(n.flags&128)return nl(n,x),null;var w=(x&2)!==0;if(w?(x=x&1|2,n.flags|=128):x&=1,nl(n,x),u==="backwards"&&e!==null?(Hh(e),bn(e,n,o,a),Hh(e)):bn(e,n,o,a),o=Ne?Yo:0,!w&&e!==null&&(e.flags&128)!==0)t:for(e=n.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Av(e,a,n);else if(e.tag===19)Av(e,a,n);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===n)break t;for(;e.sibling===null;){if(e.return===null||e.return===n)break t;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(u){case"backwards":a=Rv(n.child),a===null?(u=n.child,n.child=null):(u=a.sibling,a.sibling=null,Hh(n)),qc(n,!0,u,null,h,o);break;case"unstable_legacy-backwards":for(a=null,u=n.child,n.child=null;u!==null;){if(e=u.alternate,e!==null&&Lc(e)===null){n.child=u;break}e=u.sibling,u.sibling=a,a=u,u=e}qc(n,!0,a,null,h,o);break;case"together":qc(n,!1,null,null,void 0,o);break;case"independent":n.memoizedState=null;break;default:a=Rv(n.child),a===null?(u=n.child,n.child=null):(u=a.sibling,a.sibling=null),qc(n,!1,u,a,h,o)}return n.child}function wv(e,n,a){var o=n.pendingProps;return Qa(n,n.type,o.value),bn(e,n,o.children,a),n.child}function Ra(e,n,a){if(e!==null&&(n.dependencies=e.dependencies),ls|=n.lanes,(a&n.childLanes)===0)if(e!==null){if(Ps(e,n,a,!1),(a&n.childLanes)===0)return null}else return null;if(e!==null&&n.child!==e.child)throw Error(s(153));if(n.child!==null){for(e=n.child,a=ya(e,e.pendingProps),n.child=a,a.return=n;e.sibling!==null;)e=e.sibling,a=a.sibling=ya(e,e.pendingProps),a.return=n;a.sibling=null}return n.child}function Gh(e,n){return(e.lanes&n)!==0?!0:(e=e.dependencies,!!(e!==null&&bc(e)))}function hM(e,n,a){switch(n.tag){case 3:z(n,n.stateNode.containerInfo),Qa(n,vn,e.memoizedState.cache),Us();break;case 27:case 5:de(n);break;case 4:z(n,n.stateNode.containerInfo);break;case 10:Qa(n,n.type,n.memoizedProps.value);break;case 31:if(n.memoizedState!==null)return n.flags|=128,dh(n),null;break;case 13:var o=n.memoizedState;if(o!==null){if(o.dehydrated!==null)return is(n),n.flags|=128,null;o=Ps(e,n,a,!1);var u=n.child.childLanes;return o||(a&u)!==0?Tv(e,n,a):(is(n),e=Ra(e,n,a),e!==null?e.sibling:null)}is(n);break;case 19:if(n.flags&128)return Vh(e,n,a);if(u=(e.flags&128)!==0,o=(a&n.childLanes)!==0,o||(Ps(e,n,a,!1),o=(a&n.childLanes)!==0),u){if(o)return Vh(e,n,a);n.flags|=128}if(u=n.memoizedState,u!==null&&(u.rendering=null,u.tail=null,u.lastEffect=null),nl(n,Un.current),o)break;return null;case 22:return n.lanes=0,xv(e,n,a,n.pendingProps);case 24:Qa(n,vn,e.memoizedState.cache)}return Ra(e,n,a)}function Cv(e,n,a){if(e!==null)if(e.memoizedProps!==n.pendingProps)xn=!0;else{if(!Gh(e,a)&&(n.flags&128)===0)return xn=!1,hM(e,n,a);xn=(e.flags&131072)!==0}else xn=!1,Ne&&(n.flags&1048576)!==0&&rg(n,Yo,n.index);switch(n.lanes=0,n.tag){case 16:t:{var o=n.pendingProps;if(e=Fs(n.elementType),n.type=e,typeof e=="function")Kf(e)?(o=Xs(e,o),n.tag=1,n=Ev(null,n,e,o,a)):(n.tag=0,n=Ph(null,n,e,o,a));else{if(e!=null){var u=e.$$typeof;if(u===k){n.tag=11,n=gv(null,n,e,o,a);break t}else if(u===lt){n.tag=14,n=vv(null,n,e,o,a);break t}else if(u===j){n.tag=10,n.type=e,n=wv(null,n,a);break t}}throw n=st(e)||e,Error(s(306,n,""))}}return n;case 0:return Ph(e,n,n.type,n.pendingProps,a);case 1:return o=n.type,u=Xs(o,n.pendingProps),Ev(e,n,o,u,a);case 3:t:{if(z(n,n.stateNode.containerInfo),e===null)throw Error(s(387));o=n.pendingProps;var h=n.memoizedState;u=h.element,lh(e,n),el(n,o,null,a);var x=n.memoizedState;if(o=x.cache,Qa(n,vn,o),o!==h.cache&&nh(n,[vn],a,!0),tl(),o=x.element,h.isDehydrated)if(h={element:o,isDehydrated:!1,cache:x.cache},n.updateQueue.baseState=h,n.memoizedState=h,n.flags&256){n=bv(e,n,o,a);break t}else if(o!==u){u=Mi(Error(s(424)),n),Zo(u),n=bv(e,n,o,a);break t}else{switch(e=n.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName==="HTML"?e.ownerDocument.body:e}for(sn=Ri(e.firstChild),Rn=n,Ne=!0,Ka=null,Ti=!0,a=xg(n,null,o,a),n.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling}else{if(Us(),o===u){n=Ra(e,n,a);break t}bn(e,n,o,a)}n=n.child}return n;case 26:return Ir(e,n),e===null?(a=tx(n.type,null,n.pendingProps,null))?n.memoizedState=a:Ne||(n.stateNode=U_(n.type,n.pendingProps,gt.current,n)):n.memoizedState=tx(n.type,e.memoizedProps,n.pendingProps,e.memoizedState),null;case 27:return de(n),e===null&&Ne&&(o=n.stateNode=J_(n.type,n.pendingProps,gt.current),Rn=n,Ti=!0,u=sn,hs(n.type)?(Bd=u,sn=Ri(o.firstChild)):sn=u),bn(e,n,n.pendingProps.children,a),Ir(e,n),e===null&&(n.flags|=4194304),n.child;case 5:return e===null&&Ne&&((u=o=sn)&&(o=rE(o,n.type,n.pendingProps,Ti),o!==null?(n.stateNode=o,Rn=n,sn=Ri(o.firstChild),Ti=!1,u=!0):u=!1),u||Ja(n)),de(n),u=n.type,h=n.pendingProps,x=e!==null?e.memoizedProps:null,o=h.children,Cd(u,h)?o=null:x!==null&&Cd(u,x)&&(n.flags|=32),n.memoizedState!==null&&(u=gh(e,n,eM,null,null,a),to._currentValue=u),Ir(e,n),bn(e,n,o,a),n.child;case 6:return e===null&&Ne&&((e=a=sn)&&(a=oE(a,n.pendingProps,Ti),a!==null?(n.stateNode=a,Rn=n,sn=null,e=!0):e=!1),e||Ja(n)),null;case 13:return Tv(e,n,a);case 4:return z(n,n.stateNode.containerInfo),o=n.pendingProps,e===null?n.child=Vs(n,null,o,a):bn(e,n,o,a),n.child;case 11:return gv(e,n,n.type,n.pendingProps,a);case 7:return o=n.pendingProps,Ir(e,n),bn(e,n,o,a),n.child;case 8:return bn(e,n,n.pendingProps.children,a),n.child;case 12:return bn(e,n,n.pendingProps.children,a),n.child;case 10:return wv(e,n,a);case 9:return u=n.type._context,o=n.pendingProps.children,Is(n),u=Dn(u),o=o(u),n.flags|=1,bn(e,n,o,a),n.child;case 14:return vv(e,n,n.type,n.pendingProps,a);case 15:return _v(e,n,n.type,n.pendingProps,a);case 19:return Vh(e,n,a);case 31:return uM(e,n,a);case 22:return xv(e,n,a,n.pendingProps);case 24:return Is(n),o=Dn(vn),e===null?(u=sh(),u===null&&(u=en,h=ih(),u.pooledCache=h,h.refCount++,h!==null&&(u.pooledCacheLanes|=a),u=h),n.memoizedState={parent:o,cache:u},oh(n),Qa(n,vn,u)):((e.lanes&a)!==0&&(lh(e,n),el(n,null,null,a),tl()),u=e.memoizedState,h=n.memoizedState,u.parent!==o?(u={parent:o,cache:o},n.memoizedState=u,n.lanes===0&&(n.memoizedState=n.updateQueue.baseState=u),Qa(n,vn,o)):(o=h.cache,Qa(n,vn,o),o!==u.cache&&nh(n,[vn],a,!0))),bn(e,n,n.pendingProps.children,a),n.child;case 30:return n.stateNode===null&&(n.stateNode={autoName:null,paired:null,clones:null,ref:null}),o=n.pendingProps,o.name!=null&&o.name!=="auto"?n.flags|=e===null?18882560:18874368:Ne&&yc(n),e!==null&&e.memoizedProps.name!==o.name?n.flags|=4194816:Ir(e,n),bn(e,n,o.children,a),n.child;case 29:throw n.pendingProps}throw Error(s(156,n.tag))}function wa(e){e.flags|=4}function Xh(e,n,a,o,u){var h;if((h=(e.mode&32)!==0)&&(h=a===null?ax(n,o):ax(n,o)&&(o.src!==a.src||o.srcSet!==a.srcSet)),h){if(e.flags|=16777216,(u&335544128)===u)if(e.stateNode.complete)e.flags|=8192;else if(u_())e.flags|=8192;else throw Hs=wc,rh}else e.flags&=-16777217}function Nv(e,n){if(n.type!=="stylesheet"||(n.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!sx(n))if(u_())e.flags|=8192;else throw Hs=wc,rh}function Yc(e,n){n!==null&&(e.flags|=4),e.flags&16384&&(n=e.tag!==22?Uo():536870912,e.lanes|=n,Vr|=n)}function ol(e,n){if(!Ne)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,o=null;a!==null;)a.alternate!==null&&(o=a),a=a.sibling;o===null?n||e.tail===null?e.tail=null:e.tail.sibling=null:o.sibling=null;break;default:for(n=e.tail,a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?e.tail=null:a.sibling=null}}function rn(e){var n=e.alternate!==null&&e.alternate.child===e.child,a=0,o=0;if(n)for(var u=e.child;u!==null;)a|=u.lanes|u.childLanes,o|=u.subtreeFlags&1206910976,o|=u.flags&1206910976,u.return=e,u=u.sibling;else for(u=e.child;u!==null;)a|=u.lanes|u.childLanes,o|=u.subtreeFlags,o|=u.flags,u.return=e,u=u.sibling;return e.subtreeFlags|=o,e.childLanes=a,n}function dM(e,n,a){var o=n.pendingProps;switch(jf(n),n.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return rn(n),null;case 1:return rn(n),null;case 3:return a=n.stateNode,o=null,e!==null&&(o=e.memoizedState.cache),n.memoizedState.cache!==o&&(n.flags|=2048),ba(vn),ce(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(Cr(n)?wa(n):e===null||e.memoizedState.isDehydrated&&(n.flags&256)===0||(n.flags|=1024,th())),rn(n),null;case 26:var u=n.type,h=n.memoizedState;return e===null?(wa(n),h!==null?(rn(n),Nv(n,h)):(rn(n),Xh(n,u,null,o,a))):h?h!==e.memoizedState?(wa(n),rn(n),Nv(n,h)):(rn(n),n.flags&=-16777217):(e=e.memoizedProps,e!==o&&wa(n),rn(n),Xh(n,u,e,o,a)),null;case 27:if(O(n),a=gt.current,u=n.type,e!==null&&n.stateNode!=null)e.memoizedProps!==o&&wa(n);else{if(!o){if(n.stateNode===null)throw Error(s(166));return rn(n),n.subtreeFlags&=-33554433,null}e=se.current,Cr(n)?lg(n):(e=J_(u,o,a),n.stateNode=e,wa(n))}return rn(n),n.subtreeFlags&=-33554433,null;case 5:if(O(n),u=n.type,e!==null&&n.stateNode!=null)e.memoizedProps!==o&&wa(n);else{if(!o){if(n.stateNode===null)throw Error(s(166));return rn(n),n.subtreeFlags&=-33554433,null}if(h=se.current,Cr(n))lg(n);else{var x=_l(gt.current);switch(h){case 1:h=x.createElementNS("http://www.w3.org/2000/svg",u);break;case 2:h=x.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;default:switch(u){case"svg":h=x.createElementNS("http://www.w3.org/2000/svg",u);break;case"math":h=x.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;case"script":h=x.createElement("div"),h.innerHTML="<script><\/script>",h=h.removeChild(h.firstChild);break;case"select":h=typeof o.is=="string"?x.createElement("select",{is:o.is}):x.createElement("select"),o.multiple?h.multiple=!0:o.size&&(h.size=o.size);break;default:h=typeof o.is=="string"?x.createElement(u,{is:o.is}):x.createElement(u)}}h[R]=n,h[W]=o;t:for(x=n.child;x!==null;){if(x.tag===5||x.tag===6)h.appendChild(x.stateNode);else if(x.tag!==4&&x.tag!==27&&x.child!==null){x.child.return=x,x=x.child;continue}if(x===n)break t;for(;x.sibling===null;){if(x.return===null||x.return===n)break t;x=x.return}x.sibling.return=x.return,x=x.sibling}n.stateNode=h;t:switch(Pn(h,u,o),u){case"button":case"input":case"select":case"textarea":o=!!o.autoFocus;break t;case"img":o=!0;break t;default:o=!1}o&&wa(n)}}return rn(n),n.subtreeFlags&=-33554433,Xh(n,n.type,e===null?null:e.memoizedProps,n.pendingProps,a),null;case 6:if(e&&n.stateNode!=null)e.memoizedProps!==o&&wa(n);else{if(typeof o!="string"&&n.stateNode===null)throw Error(s(166));if(e=gt.current,Cr(n)){if(e=n.stateNode,a=n.memoizedProps,o=null,u=Rn,u!==null)switch(u.tag){case 27:case 5:o=u.memoizedProps}e[R]=n,e=!!(e.nodeValue===a||o!==null&&o.suppressHydrationWarning===!0||C_(e.nodeValue,a)),e||Ja(n,!0)}else e=_l(e).createTextNode(o),e[R]=n,n.stateNode=e}return rn(n),null;case 31:if(a=n.memoizedState,e===null||e.memoizedState!==null){if(o=Cr(n),a!==null){if(e===null){if(!o)throw Error(s(318));if(e=n.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(s(557));e[R]=n}else Us(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;rn(n),e=!1}else a=th(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return n.flags&256?(ci(n),n):(ci(n),null);if((n.flags&128)!==0)throw Error(s(558))}return rn(n),null;case 13:if(o=n.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(u=Cr(n),o!==null&&o.dehydrated!==null){if(e===null){if(!u)throw Error(s(318));if(u=n.memoizedState,u=u!==null?u.dehydrated:null,!u)throw Error(s(317));u[R]=n}else Us(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;rn(n),u=!1}else u=th(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=u),u=!0;if(!u)return n.flags&256?(ci(n),n):(ci(n),null)}return ci(n),(n.flags&128)!==0?(n.lanes=a,n):(a=o!==null,e=e!==null&&e.memoizedState!==null,a&&(o=n.child,u=null,o.alternate!==null&&o.alternate.memoizedState!==null&&o.alternate.memoizedState.cachePool!==null&&(u=o.alternate.memoizedState.cachePool.pool),h=null,o.memoizedState!==null&&o.memoizedState.cachePool!==null&&(h=o.memoizedState.cachePool.pool),h!==u&&(o.flags|=2048)),a!==e&&a&&(n.child.flags|=8192),Yc(n,n.updateQueue),rn(n),null);case 4:return ce(),e===null&&bd(n.stateNode.containerInfo),n.flags|=67108864,rn(n),null;case 10:return ba(n.type),rn(n),null;case 19:if(ph(n),o=n.memoizedState,o===null)return rn(n),null;if(u=(n.flags&128)!==0,h=o.rendering,h===null)if(u)ol(o,!1);else{if(mn!==0||e!==null&&(e.flags&128)!==0)for(e=n.child;e!==null;){if(h=Lc(e),h!==null){for(n.flags|=128,ol(o,!1),e=h.updateQueue,n.updateQueue=e,Yc(n,e),n.subtreeFlags=0,e=a,a=n.child;a!==null;)ig(a,e),a=a.sibling;return nl(n,Un.current&1|2),Ne&&Ma(n,o.treeForkCount),n.child}e=e.sibling}o.tail!==null&&$t()>su&&(n.flags|=128,u=!0,ol(o,!1),n.lanes=4194304)}else{if(!u)if(e=Lc(h),e!==null){if(n.flags|=128,u=!0,e=e.updateQueue,n.updateQueue=e,Yc(n,e),ol(o,!0),o.tail===null&&o.tailMode!=="collapsed"&&o.tailMode!=="visible"&&!h.alternate&&!Ne)return rn(n),null}else 2*$t()-o.renderingStartTime>su&&a!==536870912&&(n.flags|=128,u=!0,ol(o,!1),n.lanes=4194304);o.isBackwards?(h.sibling=n.child,n.child=h):(e=o.last,e!==null?e.sibling=h:n.child=h,o.last=h)}if(o.tail!==null){e=o.tail;t:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break t}a=a.sibling}a=!0}return o.rendering=e,o.tail=e.sibling,o.renderingStartTime=$t(),e.sibling=null,h=Un.current,h=u?h&1|2:h&1,o.tailMode==="visible"||o.tailMode==="collapsed"||!a||Ne?nl(n,h):(a=h,Dt(Ln,n),Dt(Un,a),Bn===null&&(Bn=n)),Ne&&Ma(n,o.treeForkCount),e}return rn(n),null;case 22:case 23:return ci(n),hh(),o=n.memoizedState!==null,e!==null?e.memoizedState!==null!==o&&(n.flags|=8192):o&&(n.flags|=8192),o?(a&536870912)!==0&&(n.flags&128)===0&&(rn(n),n.subtreeFlags&6&&(n.flags|=8192)):rn(n),a=n.updateQueue,a!==null&&Yc(n,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),o=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(o=n.memoizedState.cachePool.pool),o!==a&&(n.flags|=2048),e!==null&&Nt(Bs),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),n.memoizedState.cache!==a&&(n.flags|=2048),ba(vn),rn(n),null;case 25:return null;case 30:return n.flags|=33554432,rn(n),null}throw Error(s(156,n.tag))}function pM(e,n){switch(jf(n),n.tag){case 1:return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 3:return ba(vn),ce(),e=n.flags,(e&65536)!==0&&(e&128)===0?(n.flags=e&-65537|128,n):null;case 26:case 27:case 5:return O(n),null;case 31:if(n.memoizedState!==null){if(ci(n),n.alternate===null)throw Error(s(340));Us()}return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 13:if(ci(n),e=n.memoizedState,e!==null&&e.dehydrated!==null){if(n.alternate===null)throw Error(s(340));Us()}return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 19:return ph(n),e=n.flags,e&65536?(n.flags=e&-65537|128,e=n.memoizedState,e!==null&&(e.rendering=null,e.tail=null),n.flags|=4,n):null;case 4:return ce(),null;case 10:return ba(n.type),null;case 22:case 23:return ci(n),hh(),e!==null&&Nt(Bs),e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 24:return ba(vn),null;case 25:return null;default:return null}}function Dv(e,n){switch(jf(n),n.tag){case 3:ba(vn),ce();break;case 26:case 27:case 5:O(n);break;case 4:ce();break;case 31:n.memoizedState!==null&&ci(n);break;case 13:ci(n);break;case 19:ph(n);break;case 10:ba(n.type);break;case 22:case 23:ci(n),hh(),e!==null&&Nt(Bs);break;case 24:ba(vn)}}function ll(e,n){try{var a=n.updateQueue,o=a!==null?a.lastEffect:null;if(o!==null){var u=o.next;a=u;do{if((a.tag&e)===e){o=void 0;var h=a.create,x=a.inst;o=h(),x.destroy=o}a=a.next}while(a!==u)}}catch(w){Ke(n,n.return,w)}}function ss(e,n,a){try{var o=n.updateQueue,u=o!==null?o.lastEffect:null;if(u!==null){var h=u.next;o=h;do{if((o.tag&e)===e){var x=o.inst,w=x.destroy;if(w!==void 0){x.destroy=void 0,u=n;var B=a,nt=w;try{nt()}catch(dt){Ke(u,B,dt)}}}o=o.next}while(o!==h)}}catch(dt){Ke(n,n.return,dt)}}function Lv(e){var n=e.updateQueue;if(n!==null){var a=e.stateNode;try{yg(n,a)}catch(o){Ke(e,e.return,o)}}}function Uv(e,n,a){a.props=Xs(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(o){Ke(e,n,o)}}function Ki(e,n){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var o=e.stateNode;break;case 30:var u=e.stateNode,h=xa(e.memoizedProps,u);(u.ref===null||u.ref.name!==h)&&(u.ref=H_(h)),o=u.ref;break;case 7:if(e.stateNode===null){var x=new pi(e);v(e.child,!1,aE,x,void 0,void 0),e.stateNode=x}o=e.stateNode;break;default:o=e.stateNode}typeof a=="function"?e.refCleanup=a(o):a.current=o}}catch(w){Ke(e,n,w)}}function On(e,n){var a=e.ref,o=e.refCleanup;if(a!==null)if(typeof o=="function")try{o()}catch(u){Ke(e,n,u)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(u){Ke(e,n,u)}else a.current=null}function Zc(e,n){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&n!==null)for(var a=0;a<n.length;a++)q_(e.stateNode,n[a])}function Ov(e){for(var n=e.return;n!==null&&(Wh(n)&&q_(e.stateNode,n.stateNode),!kh(n));)n=n.return}function cl(e){for(var n=e.return;n!==null&&(Wh(n)&&sE(e.stateNode,n.stateNode),!kh(n));)n=n.return}function kh(e){return e.tag===5||e.tag===3||e.tag===27}function Wh(e){return e&&e.tag===7&&e.stateNode!==null}function qh(e){var n=e.type,a=e.memoizedProps,o=e.stateNode;try{t:switch(n){case"button":case"input":case"select":case"textarea":a.autoFocus&&o.focus();break t;case"img":a.src?o.src=a.src:a.srcSet&&(o.srcset=a.srcSet)}}catch(u){Ke(e,e.return,u)}}function Yh(e,n,a){try{var o=e.stateNode;HM(o,e.type,a,n),o[W]=n}catch(u){Ke(e,e.return,u)}}function Pv(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&hs(e.type)||e.tag===4}function Zh(e){t:for(;;){for(;e.sibling===null;){if(e.return===null||Pv(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&hs(e.type)||e.flags&2||e.child===null||e.tag===4)continue t;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Kh(e,n,a,o){var u=e.tag;if(u===5||u===6)u=e.stateNode,n?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(u,n):(n=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,n.appendChild(u),a=a._reactRootContainer,a!=null||n.onclick!==null||(n.onclick=qi)),Zc(e,o),Ce=!0;else if(u!==4&&(u===27&&(Zc(e,o),o=null,hs(e.type)&&(a=e.stateNode,n=null)),e=e.child,e!==null))for(Kh(e,n,a,o),e=e.sibling;e!==null;)Kh(e,n,a,o),e=e.sibling}function Kc(e,n,a,o){var u=e.tag;if(u===5||u===6)u=e.stateNode,n?a.insertBefore(u,n):a.appendChild(u),Zc(e,o),Ce=!0;else if(u!==4&&(u===27&&(Zc(e,o),o=null,hs(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(Kc(e,n,a,o),e=e.sibling;e!==null;)Kc(e,n,a,o),e=e.sibling}function Iv(e){var n=e.stateNode,a=e.memoizedProps;try{for(var o=e.type,u=n.attributes;u.length;)n.removeAttributeNode(u[0]);Pn(n,o,a),n[R]=e,n[W]=a}catch(h){Ke(e,e.return,h)}}var Jc=!1,ui=null;function zv(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Jc=!0)}var Ji=null;function Bv(){var e=Ji;return Ji=null,e}var Qn=0;function zr(e,n,a,o,u){return Qn=0,Fv(e.child,n,a,o,u)}function Fv(e,n,a,o,u){for(var h=!1;e!==null;){if(e.tag===5){var x=e.stateNode;if(o!==null){var w=Ld(x);o.push(w),w.view&&(h=!0)}else h||Ld(x).view&&(h=!0);Jc=!0,B_(x,Qn===0?n:n+"_"+Qn,a),Qn++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&u||Fv(e.child,n,a,o,u)&&(h=!0));e=e.sibling}return h}function Qi(e,n){for(;e!==null;)e.tag===5?F_(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&n||Qi(e.child,n)),e=e.sibling}function Qc(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Qc(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var n=e.memoizedProps;if(n.name==null||n.name==="auto")throw Error(s(544));var a=n.name;n=Sa(n.default,n.share),n!=="none"&&(zr(e,a,n,null,!1)||Qi(e.child,!1))}e=e.sibling}}function Jh(e,n){if(e.tag===30){var a=e.stateNode,o=e.memoizedProps,u=xa(o,a),h=Sa(o.default,a.paired?o.share:o.enter);h!=="none"?zr(e,u,h,null,!1)?(Qc(e),a.paired||n||Wr(e,o.onEnter)):Qi(e.child,!1):Qc(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Jh(e,n),e=e.sibling;else Qc(e)}function Qh(e){if(ui!==null&&ui.size!==0){var n=ui;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,o=a.name;if(o!=null&&o!=="auto"){var u=n.get(o);if(u!==void 0){var h=Sa(a.default,a.share);if(h!=="none"&&(zr(e,o,h,null,!1)?(h=e.stateNode,u.paired=h,h.paired=u,Wr(e,a.onShare)):Qi(e.child,!1)),n.delete(o),n.size===0)break}}}Qh(e)}e=e.sibling}}}function jh(e){if(e.tag===30){var n=e.memoizedProps,a=xa(n,e.stateNode),o=ui!==null?ui.get(a):void 0,u=Sa(n.default,o!==void 0?n.share:n.exit);u!=="none"&&(zr(e,a,u,null,!1)?o!==void 0?(u=e.stateNode,o.paired=u,u.paired=o,ui.delete(a),Wr(e,n.onShare)):Wr(e,n.onExit):Qi(e.child,!1)),ui!==null&&Qh(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)jh(e),e=e.sibling;else ui!==null&&Qh(e)}function Hv(e){for(e=e.child;e!==null;){if(e.tag===30){var n=e.memoizedProps,a=xa(n,e.stateNode);n=Sa(n.default,n.update),e.flags&=-5,n!=="none"&&zr(e,a,n,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&Hv(e);e=e.sibling}}function $h(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var n=e.stateNode;n.paired!==null&&(n.paired=null,Qi(e.child,!1))}$h(e)}e=e.sibling}}function jc(e){if(e.tag===30)e.stateNode.paired=null,Qi(e.child,!1),$h(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)jc(e),e=e.sibling;else $h(e)}function Vv(e){for(e=e.child;e!==null;)e.tag===30?Qi(e.child,!1):(e.subtreeFlags&33554432)!==0&&Vv(e),e=e.sibling}function td(e,n,a,o,u,h,x){for(var w=!1;n!==null;){if(n.tag===5){var B=n.stateNode;if(h!==null&&Qn<h.length){var nt=h[Qn],dt=Ld(B);(nt.view||dt.view)&&(w=!0);var bt;if(bt=(e.flags&4)===0)if(dt.clip)bt=!0;else{bt=nt.rect;var $=dt.rect;bt=bt.y!==$.y||bt.x!==$.x||bt.height!==$.height||bt.width!==$.width}bt&&(e.flags|=4),dt.abs?dt=!nt.abs:(nt=nt.rect,dt=dt.rect,dt=nt.height!==dt.height||nt.width!==dt.width),dt&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&B_(B,Qn===0?a:a+"_"+Qn,u),w&&(e.flags&4)!==0||(Ji===null&&(Ji=[]),Ji.push(B,Qn===0?o:o+"_"+Qn,n.memoizedProps)),Qn++}else(n.tag!==22||n.memoizedState===null)&&(n.tag===30&&x?e.flags|=n.flags&32:td(e,n.child,a,o,u,h,x)&&(w=!0));n=n.sibling}return w}function Gv(e,n){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,o=e.stateNode,u=xa(a,o),h=Sa(a.default,a.update),x;x=e.memoizedState,e.memoizedState=null,o=e;var w=e.child;Qn=0,u=td(o,w,u,u,h,x,!1),(e.flags&4)!==0&&u&&Wr(e,a.onUpdate)}else(e.subtreeFlags&33554432)!==0&&Gv(e);e=e.sibling}}var wn=!1,Ye=!1,ji=!1,ed=!1,Xv=typeof WeakSet=="function"?WeakSet:Set,Cn=null,$i=!1,ul=!1,$c=!1,nd=!1;function mM(e,n,a){if(e=e.containerInfo,Rd=eo,e=Y0(e),Gf(e)){if("selectionStart"in e)var o={start:e.selectionStart,end:e.selectionEnd};else t:{o=(o=e.ownerDocument)&&o.defaultView||window;var u=o.getSelection&&o.getSelection();if(u&&u.rangeCount!==0){o=u.anchorNode;var h=u.anchorOffset,x=u.focusNode;u=u.focusOffset;try{o.nodeType,x.nodeType}catch{o=null;break t}var w=0,B=-1,nt=-1,dt=0,bt=0,$=e,ht=null;e:for(;;){for(var Xt;$!==o||h!==0&&$.nodeType!==3||(B=w+h),$!==x||u!==0&&$.nodeType!==3||(nt=w+u),$.nodeType===3&&(w+=$.nodeValue.length),(Xt=$.firstChild)!==null;)ht=$,$=Xt;for(;;){if($===e)break e;if(ht===o&&++dt===h&&(B=w),ht===x&&++bt===u&&(nt=w),(Xt=$.nextSibling)!==null)break;$=ht,ht=$.parentNode}$=Xt}o=B===-1||nt===-1?null:{start:B,end:nt}}else o=null}o=o||{start:0,end:0}}else o=null;for(wd={focusedElem:e,selectionRange:o},eo=!1,a=(a&335544064)===a,Cn=n,n=a?9270:1024;Cn!==null;){if(e=Cn,a&&(o=e.deletions,o!==null))for(h=0;h<o.length;h++)a&&jh(o[h]);if(e.alternate===null&&(e.flags&2)!==0)a&&zv(e),tu(a);else{if(e.tag===22){if(o=e.alternate,e.memoizedState!==null){o!==null&&o.memoizedState===null&&a&&jh(o),tu(a);continue}else if(o!==null&&o.memoizedState!==null){a&&zv(e),tu(a);continue}}o=e.child,(e.subtreeFlags&n)!==0&&o!==null?(o.return=e,Cn=o):(a&&Hv(e),tu(a))}}ui=null}function tu(e){for(;Cn!==null;){var n=Cn,a=e,o=n.alternate,u=n.flags;switch(n.tag){case 0:case 11:case 15:break;case 1:if((u&1024)!==0&&o!==null){a=void 0,u=o.memoizedProps,o=o.memoizedState;var h=n.stateNode;try{var x=Xs(n.type,u);a=h.getSnapshotBeforeUpdate(x,o),h.__reactInternalSnapshotBeforeUpdate=a}catch(w){Ke(n,n.return,w)}}break;case 3:if((u&1024)!==0){if(o=n.stateNode.containerInfo,a=o.nodeType,a===9)Pd(o);else if(a===1)switch(o.nodeName){case"HEAD":case"HTML":case"BODY":Pd(o);break;default:o.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&o!==null&&(a=xa(o.memoizedProps,o.stateNode),u=n.memoizedProps,u=Sa(u.default,u.update),u!=="none"&&zr(o,a,u,o.memoizedState=[],!0));break;default:if((u&1024)!==0)throw Error(s(163))}if(o=n.sibling,o!==null){o.return=n.return,Cn=o;break}Cn=n.return}}function kv(e,n,a){var o=a.flags;switch(a.tag){case 0:case 11:case 15:ta(e,a),o&4&&ll(5,a);break;case 1:if(ta(e,a),o&4)if(e=a.stateNode,n===null)try{e.componentDidMount()}catch(x){Ke(a,a.return,x)}else{var u=Xs(a.type,n.memoizedProps);n=n.memoizedState;try{e.componentDidUpdate(u,n,e.__reactInternalSnapshotBeforeUpdate)}catch(x){Ke(a,a.return,x)}}o&64&&Lv(a),o&512&&Ki(a,a.return);break;case 3:if(ta(e,a),o&64&&(e=a.updateQueue,e!==null)){if(n=null,a.child!==null)switch(a.child.tag){case 27:case 5:n=a.child.stateNode;break;case 1:n=a.child.stateNode}try{yg(e,n)}catch(x){Ke(a,a.return,x)}}break;case 27:n===null&&o&4&&Iv(a);case 26:case 5:ta(e,a),n===null&&o&4&&qh(a),o&512&&Ki(a,a.return);break;case 12:ta(e,a);break;case 31:ta(e,a),o&4&&Zv(e,a);break;case 13:ta(e,a),o&4&&Kv(e,a),o&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=RM.bind(null,a),lE(e,a))));break;case 22:if(o=a.memoizedState!==null||wn,!o){var h=n!==null&&n.memoizedState!==null||Ye;n=wn,u=Ye,wn=o,(Ye=h)&&!u?(o=2,(a.subtreeFlags&8772)!==0&&(o|=1),Ui(e,a,o)):ta(e,a),wn=n,Ye=u}break;case 30:ta(e,a),o&512&&Ki(a,a.return);break;case 7:o&512&&Ki(a,a.return);default:ta(e,a)}}function id(e,n){for(e=e.child;e!==null;)Wv(e,n),e=e.sibling}function Wv(e,n){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(n){var o=a.style;typeof o.setProperty=="function"?o.setProperty("display","none","important"):o.display="none"}else{var u=e.stateNode,h=e.memoizedProps.style,x=h!=null&&h.hasOwnProperty("display")?h.display:null;u.style.display=x==null||typeof x=="boolean"?"":(""+x).trim()}}catch(B){Ke(e,e.return,B)}ad(e,n);break;case 6:try{e.stateNode.nodeValue=n?"":e.memoizedProps,Ce=!0}catch(B){Ke(e,e.return,B)}break;case 18:try{var w=e.stateNode;n?z_(w,!0):z_(e.stateNode,!1)}catch(B){Ke(e,e.return,B)}break;case 22:case 23:e.memoizedState===null&&id(e,n);break;default:id(e,n)}}function ad(e,n){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){t:{var a=e,o=n;switch(a.tag){case 4:Wv(a,o);break t;case 22:a.memoizedState===null&&ad(a,o);break t;default:ad(a,o)}}e=e.sibling}}function qv(e){var n=e.alternate;n!==null&&(e.alternate=null,qv(n)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(n=e.stateNode,n!==null&&oe(n)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var on=null,jn=!1;function Di(e,n,a){for(a=a.child;a!==null;)Yv(e,n,a),a=a.sibling}function Yv(e,n,a){if(Qt&&typeof Qt.onCommitFiberUnmount=="function")try{Qt.onCommitFiberUnmount(ue,a)}catch{}switch(a.tag){case 26:Ye||On(a,n),Di(e,n,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!Ye&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:Ye||On(a,n),cl(a);var o=on,u=jn;hs(a.type)&&(on=a.stateNode,jn=!1),Di(e,n,a),Q_(a.stateNode,a.type,a.memoizedProps),on=o,jn=u;break;case 5:Ye||On(a,n),cl(a);case 6:if(a.tag===6&&cl(a),o=on,u=jn,on=null,Di(e,n,a),on=o,jn=u,on!==null)if(jn)try{(on.nodeType===9?on.body:on.nodeName==="HTML"?on.ownerDocument.body:on).removeChild(a.stateNode),Ce=!0}catch(h){Ke(a,n,h)}else try{on.removeChild(a.stateNode),Ce=!0}catch(h){Ke(a,n,h)}break;case 18:on!==null&&(jn?(e=on,I_(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),no(e)):I_(on,a.stateNode));break;case 4:o=on,u=jn,on=a.stateNode.containerInfo,jn=!0,Di(e,n,a),on=o,jn=u;break;case 0:case 11:case 14:case 15:ss(2,a,n),Ye||ss(4,a,n),Di(e,n,a);break;case 1:Ye||(On(a,n),o=a.stateNode,typeof o.componentWillUnmount=="function"&&Uv(a,n,o)),Di(e,n,a);break;case 21:Di(e,n,a);break;case 22:Ye=(o=Ye)||a.memoizedState!==null,Di(e,n,a),Ye=o;break;case 30:On(a,n),Di(e,n,a);break;case 7:Ye||On(a,n),Di(e,n,a);break;default:Di(e,n,a)}}function Zv(e,n){if(n.memoizedState===null&&(e=n.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{no(e)}catch(a){Ke(n,n.return,a)}}}function Kv(e,n){if(n.memoizedState===null&&(e=n.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{no(e)}catch(a){Ke(n,n.return,a)}}function gM(e){switch(e.tag){case 31:case 13:case 19:var n=e.stateNode;return n===null&&(n=e.stateNode=new Xv),n;case 22:return e=e.stateNode,n=e._retryCache,n===null&&(n=e._retryCache=new Xv),n;default:throw Error(s(435,e.tag))}}function eu(e,n){var a=gM(e);n.forEach(function(o){if(!a.has(o)){a.add(o);var u=wM.bind(null,e,o);o.then(u,u)}})}function qn(e,n,a){var o=n.deletions;if(o!==null)for(var u=0;u<o.length;u++){var h=o[u],x=e,w=n,B=w;t:for(;B!==null;){switch(B.tag){case 27:if(hs(B.type)){on=B.stateNode,jn=!1;break t}break;case 5:on=B.stateNode,jn=!1;break t;case 3:case 4:on=B.stateNode.containerInfo,jn=!0;break t}B=B.return}if(on===null)throw Error(s(160));Yv(x,w,h),on=null,jn=!1,x=h.alternate,x!==null&&(x.return=null),h.return=null}if(n.subtreeFlags&13886)for(n=n.child;n!==null;)Jv(n,e,a),n=n.sibling}var Li=null;function Jv(e,n,a){var o=e.alternate,u=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(u&4&&(o=e.updateQueue,o=o!==null?o.events:null,o!==null))for(var h=0;h<o.length;h++){var x=o[h];x.ref.impl=x.nextImpl}qn(n,e,a),Yn(e),u&4&&(ss(3,e,e.return),ll(3,e),ss(5,e,e.return));break;case 1:qn(n,e,a),Yn(e),u&512&&(Ye||o===null||On(o,o.return)),u&64&&wn&&(e=e.updateQueue,e!==null&&(n=e.callbacks,n!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?n:a.concat(n))));break;case 26:if(h=Li,qn(n,e,a),Yn(e),u&512&&(Ye||o===null||On(o,o.return)),u&4)if(u=o!==null?o.memoizedState:null,a=e.memoizedState,o===null)if(a===null)if(e.stateNode===null)if(wn)e.stateNode=U_(e.type,e.memoizedProps,n.containerInfo,e);else{t:{n=e.type,a=e.memoizedProps,u=h.ownerDocument||h;e:switch(n){case"title":o=u.getElementsByTagName("title")[0],(!o||o[Gt]||o[R]||o.namespaceURI==="http://www.w3.org/2000/svg"||o.hasAttribute("itemprop"))&&(o=u.createElement(n),u.head.insertBefore(o,u.querySelector("head > title"))),Pn(o,n,a),o[R]=e,we(o),n=o;break t;case"link":if(h=ix("link","href",u).get(n+(a.href||""))){for(x=0;x<h.length;x++)if(o=h[x],o.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&o.getAttribute("rel")===(a.rel==null?null:a.rel)&&o.getAttribute("title")===(a.title==null?null:a.title)&&o.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){h.splice(x,1);break e}}o=u.createElement(n),Pn(o,n,a),u.head.appendChild(o);break;case"meta":if(h=ix("meta","content",u).get(n+(a.content||""))){for(x=0;x<h.length;x++)if(o=h[x],o.getAttribute("content")===(a.content==null?null:""+a.content)&&o.getAttribute("name")===(a.name==null?null:a.name)&&o.getAttribute("property")===(a.property==null?null:a.property)&&o.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&o.getAttribute("charset")===(a.charSet==null?null:a.charSet)){h.splice(x,1);break e}}o=u.createElement(n),Pn(o,n,a),u.head.appendChild(o);break;default:throw Error(s(468,n))}o[R]=e,we(o),n=o}e.stateNode=n}else wn||Gd(h,e.type,e.stateNode);else e.stateNode=nx(h,a,e.memoizedProps);else u!==a?(u===null?(n=o.stateNode,n===null||Ye||n.parentNode.removeChild(n)):u.count--,a===null?wn||Gd(h,e.type,e.stateNode):nx(h,a,e.memoizedProps)):a===null&&e.stateNode!==null&&Yh(e,e.memoizedProps,o.memoizedProps);break;case 27:qn(n,e,a),Yn(e),u&512&&(Ye||o===null||On(o,o.return)),o!==null&&u&4&&Yh(e,e.memoizedProps,o.memoizedProps);break;case 5:if(h=ji,ji=!1,qn(n,e,a),ji=h,Yn(e),u&512&&(Ye||o===null||On(o,o.return)),e.flags&32){n=e.stateNode;try{xr(n,""),Ce=!0}catch(dt){Ke(e,e.return,dt)}}u&4&&e.stateNode!=null&&(n=e.memoizedProps,Yh(e,n,o!==null?o.memoizedProps:n)),u&1024&&(ed=!0);break;case 6:if(qn(n,e,a),Yn(e),u&4){if(e.stateNode===null)throw Error(s(162));n=e.memoizedProps,a=e.stateNode;try{a.nodeValue=n,Ce=!0}catch(dt){Ke(e,e.return,dt)}}break;case 3:if(Ce=!1,gu=null,h=Li,Li=xl(n.containerInfo),qn(n,e,a),Li=h,Yn(e),u&4&&o!==null&&o.memoizedState.isDehydrated)try{no(n.containerInfo)}catch(dt){Ke(e,e.return,dt)}ed&&(ed=!1,Qv(e)),Ce=!1;break;case 4:u=ji,ji=wn,o=Xe(),h=Li,Li=xl(e.stateNode.containerInfo),qn(n,e,a),Yn(e),Li=h,Ce&&ul&&($c=!0),Ce=o,ji=u;break;case 12:qn(n,e,a),Yn(e);break;case 31:qn(n,e,a),Yn(e),u&4&&(n=e.updateQueue,n!==null&&(e.updateQueue=null,eu(e,n)));break;case 13:qn(n,e,a),Yn(e),e.child.flags&8192&&e.memoizedState!==null!=(o!==null&&o.memoizedState!==null)&&(au=$t()),u&4&&(n=e.updateQueue,n!==null&&(e.updateQueue=null,eu(e,n)));break;case 22:h=e.memoizedState!==null,x=o!==null&&o.memoizedState!==null;var w=wn,B=Ye,nt=ji;wn=w||h,ji=nt||h,Ye=B||x,qn(n,e,a),Ye=B,ji=nt,wn=w,Yn(e),u&8192&&(n=e.stateNode,n._visibility=h?n._visibility&-2:n._visibility|1,!h||o===null||x||wn||Ye||(n=x||Ye,a=wn,o=Ye,wn=h||wn,Ye=n,rs(e,2),wn=a,Ye=o),!h&&ji||id(e,h)),u&4&&(n=e.updateQueue,n!==null&&(a=n.retryQueue,a!==null&&(n.retryQueue=null,eu(e,a))));break;case 19:qn(n,e,a),Yn(e),u&4&&(n=e.updateQueue,n!==null&&(e.updateQueue=null,eu(e,n)));break;case 30:u&512&&(Ye||o===null||On(o,o.return)),u=Xe(),h=ul,x=(a&335544064)===a,w=e.memoizedProps,ul=x&&Sa(w.default,w.update)!=="none",qn(n,e,a),Yn(e),x&&o!==null&&Ce&&(e.flags|=4),ul=h,Ce=u;break;case 21:break;case 7:u&512&&(Ye||o===null||On(o,o.return)),o&&o.stateNode!==null&&(o.stateNode._fragmentFiber=e);default:qn(n,e,a),Yn(e)}}function Yn(e){var n=e.flags;if(n&2){try{for(var a,o=e.return;o!==null;){if(Pv(o)){a=o;break}o=o.return}o=null;for(var u=e.return;u!==null;){if(Wh(u)){var h=u.stateNode;o===null?o=[h]:o.push(h)}if(kh(u))break;u=u.return}var x=o;if(a==null)throw Error(s(160));switch(a.tag){case 27:var w=a.stateNode,B=Zh(e);Kc(e,B,w,x);break;case 5:var nt=a.stateNode;a.flags&32&&(xr(nt,""),a.flags&=-33);var dt=Zh(e);Kc(e,dt,nt,x);break;case 3:case 4:var bt=a.stateNode.containerInfo,$=Zh(e);Kh(e,$,bt,x);break;default:throw Error(s(161))}}catch(ht){Ke(e,e.return,ht)}e.flags&=-3}n&4096&&(e.flags&=-4097)}function Qv(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var n=e;Qv(n),n.tag===5&&n.flags&1024&&(n=n.stateNode,eo=!0,n.reset(),eo=!1),e=e.sibling}}function Br(e,n){if(n.subtreeFlags&9270)for(n=n.child;n!==null;)jv(n,e),n=n.sibling;else Gv(n)}function jv(e,n){var a=e.alternate;if(a===null)Jh(e,!1);else switch(e.tag){case 3:if(nd=$i=!1,Bv(),Br(n,e),!$i&&!$c){if(e=Ji,e!==null)for(var o=0;o<e.length;o+=3){a=e[o];var u=e[o+1];F_(a,e[o+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+u+")"})}e=n.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),nd=!0}Ji=null;break;case 5:Br(n,e);break;case 4:o=$i,$i=!1,Br(n,e),$i&&($c=!0),$i=o;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?Jh(e,!1):Br(n,e));break;case 30:o=$i,u=Bv(),$i=!1,Br(n,e),$i&&(e.flags|=4);var h=e.memoizedProps,x=e.stateNode;n=xa(h,x),x=xa(a.memoizedProps,x);var w=Sa(h.default,h.update);w==="none"?n=!1:(h=a.memoizedState,a.memoizedState=null,a=e.child,Qn=0,n=td(e,a,n,x,w,h,!0),Qn!==(h===null?0:h.length)&&(e.flags|=32)),(e.flags&4)!==0&&n?(Wr(e,e.memoizedProps.onUpdate),Ji=u):u!==null&&(u.push.apply(u,Ji),Ji=u),$i=(e.flags&32)!==0?!0:o;break;default:Br(n,e)}}function ta(e,n){if(n.subtreeFlags&8772)for(n=n.child;n!==null;)kv(e,n.alternate,n),n=n.sibling}function rs(e,n){for(e=e.child;e!==null;){var a=e,o=n;switch(a.tag){case 0:case 11:case 14:case 15:ss(4,a,a.return),rs(a,o);break;case 1:On(a,a.return);var u=a.stateNode;typeof u.componentWillUnmount=="function"&&Uv(a,a.return,u),rs(a,o);break;case 27:(o&2)!==0&&Q_(a.stateNode,a.type,a.memoizedProps);case 5:On(a,a.return),a.tag!==5&&a.tag!==27||cl(a),rs(a,o);break;case 6:cl(a);break;case 26:On(a,a.return),u=a.stateNode,a.memoizedState!==null||u===null||Ye||u.parentNode.removeChild(u),rs(a,o);break;case 22:a.memoizedState===null&&rs(a,o);break;case 30:On(a,a.return),rs(a,o);break;case 7:On(a,a.return);default:rs(a,o)}e=e.sibling}}function Ui(e,n,a){for(a=(n.subtreeFlags&8772)!==0?a:a&-2,n=n.child;n!==null;){var o=n.alternate,u=e,h=n,x=h.flags,w=(a&1)!==0;switch(h.tag){case 0:case 11:case 15:Ui(u,h,a),ll(4,h);break;case 1:if(Ui(u,h,a),o=h,u=o.stateNode,typeof u.componentDidMount=="function")try{u.componentDidMount()}catch(dt){Ke(o,o.return,dt)}if(o=h,u=o.updateQueue,u!==null){var B=o.stateNode;try{var nt=u.shared.hiddenCallbacks;if(nt!==null)for(u.shared.hiddenCallbacks=null,u=0;u<nt.length;u++)Sg(nt[u],B)}catch(dt){Ke(o,o.return,dt)}}w&&x&64&&Lv(h),Ki(h,h.return);break;case 27:(a&2)!==0&&Iv(h);case 5:h.tag!==5&&h.tag!==27||Ov(h),Ui(u,h,a),w&&o===null&&x&4&&qh(h),Ki(h,h.return);break;case 6:Ov(h);break;case 26:B=h.stateNode,h.memoizedState!==null||B===null||wn||Gd(xl(B.ownerDocument),h.type,B),Ui(u,h,a),w&&o===null&&x&4&&qh(h),Ki(h,h.return);break;case 12:Ui(u,h,a);break;case 31:Ui(u,h,a),w&&x&4&&Zv(u,h);break;case 13:Ui(u,h,a),w&&x&4&&Kv(u,h);break;case 22:h.memoizedState===null&&Ui(u,h,a),Ki(h,h.return);break;case 30:Ui(u,h,a),Ki(h,h.return);break;case 7:Ki(h,h.return);default:Ui(u,h,a)}n=n.sibling}}function sd(e,n){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(e=n.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Ko(a))}function rd(e,n){e=null,n.alternate!==null&&(e=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==e&&(n.refCount++,e!=null&&Ko(e))}function Ai(e,n,a,o){var u=(a&335544064)===a;if(n.subtreeFlags&(u?10262:10256))for(n=n.child;n!==null;)$v(e,n,a,o),n=n.sibling;else u&&Vv(n)}function $v(e,n,a,o){var u=(a&335544064)===a;u&&n.alternate===null&&n.return!==null&&n.return.alternate!==null&&jc(n);var h=n.flags;switch(n.tag){case 0:case 11:case 15:Ai(e,n,a,o),h&2048&&ll(9,n);break;case 1:Ai(e,n,a,o);break;case 3:Ai(e,n,a,o),u&&nd&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),h&2048&&(h=null,n.alternate!==null&&(h=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==h&&(n.refCount++,h!=null&&Ko(h)));break;case 12:if(h&2048){Ai(e,n,a,o),h=n.stateNode;try{var x=n.memoizedProps,w=x.id,B=x.onPostCommit;typeof B=="function"&&B(w,n.alternate===null?"mount":"update",h.passiveEffectDuration,-0)}catch(nt){Ke(n,n.return,nt)}}else Ai(e,n,a,o);break;case 31:Ai(e,n,a,o);break;case 13:Ai(e,n,a,o);break;case 23:break;case 22:x=n.stateNode,w=n.alternate,n.memoizedState!==null?(u&&w!==null&&w.memoizedState===null&&jc(w),x._visibility&2?Ai(e,n,a,o):fl(e,n)):(u&&w!==null&&w.memoizedState!==null&&jc(n),x._visibility&2?Ai(e,n,a,o):(x._visibility|=2,Fr(e,n,a,o,(n.subtreeFlags&10256)!==0||!1))),h&2048&&sd(w,n);break;case 24:Ai(e,n,a,o),h&2048&&rd(n.alternate,n);break;case 30:u&&(h=n.alternate,h!==null&&(Qi(h.child,!0),Qi(n.child,!0))),Ai(e,n,a,o);break;default:Ai(e,n,a,o)}}function Fr(e,n,a,o,u){for(u=u&&((n.subtreeFlags&10256)!==0||!1),n=n.child;n!==null;){var h=e,x=n,w=a,B=o,nt=x.flags;switch(x.tag){case 0:case 11:case 15:Fr(h,x,w,B,u),ll(8,x);break;case 23:break;case 22:var dt=x.stateNode;x.memoizedState!==null?dt._visibility&2?Fr(h,x,w,B,u):fl(h,x):(dt._visibility|=2,Fr(h,x,w,B,u)),u&&nt&2048&&sd(x.alternate,x);break;case 24:Fr(h,x,w,B,u),u&&nt&2048&&rd(x.alternate,x);break;default:Fr(h,x,w,B,u)}n=n.sibling}}function fl(e,n){if(n.subtreeFlags&10256)for(n=n.child;n!==null;){var a=e,o=n,u=o.flags;switch(o.tag){case 22:fl(a,o),u&2048&&sd(o.alternate,o);break;case 24:fl(a,o),u&2048&&rd(o.alternate,o);break;default:fl(a,o)}n=n.sibling}}var ks=8192;function Ws(e,n,a){if(e.subtreeFlags&ks)for(e=e.child;e!==null;)t_(e,n,a),e=e.sibling}function t_(e,n,a){switch(e.tag){case 26:Ws(e,n,a),e.flags&ks&&(e.memoizedState!==null?ME(a,Li,e.memoizedState,e.memoizedProps):(e=e.stateNode,(n&335544128)===n&&ox(a,e)));break;case 5:Ws(e,n,a),e.flags&ks&&(e=e.stateNode,(n&335544128)===n&&ox(a,e));break;case 3:case 4:var o=Li;Li=xl(e.stateNode.containerInfo),Ws(e,n,a),Li=o;break;case 22:e.memoizedState===null&&(o=e.alternate,o!==null&&o.memoizedState!==null?(o=ks,ks=16777216,Ws(e,n,a),ks=o):Ws(e,n,a));break;case 30:if((e.flags&ks)!==0&&(o=e.memoizedProps.name,o!=null&&o!=="auto")){var u=e.stateNode;u.paired=null,ui===null&&(ui=new Map),ui.set(o,u)}Ws(e,n,a);break;default:Ws(e,n,a)}}function e_(e){var n=e.alternate;if(n!==null&&(e=n.child,e!==null)){n.child=null;do n=e.sibling,e.sibling=null,e=n;while(e!==null)}}function hl(e){var n=e.deletions;if((e.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var o=n[a];Cn=o,i_(o,e)}e_(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)n_(e),e=e.sibling}function n_(e){switch(e.tag){case 0:case 11:case 15:hl(e),e.flags&2048&&ss(9,e,e.return);break;case 3:hl(e);break;case 12:hl(e);break;case 22:var n=e.stateNode;e.memoizedState!==null&&n._visibility&2&&(e.return===null||e.return.tag!==13)?(n._visibility&=-3,nu(e)):hl(e);break;default:hl(e)}}function nu(e){var n=e.deletions;if((e.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var o=n[a];Cn=o,i_(o,e)}e_(e)}for(e=e.child;e!==null;){switch(n=e,n.tag){case 0:case 11:case 15:ss(8,n,n.return),nu(n);break;case 22:a=n.stateNode,a._visibility&2&&(a._visibility&=-3,nu(n));break;default:nu(n)}e=e.sibling}}function i_(e,n){for(;Cn!==null;){var a=Cn;switch(a.tag){case 0:case 11:case 15:ss(8,a,n);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var o=a.memoizedState.cachePool.pool;o!=null&&o.refCount++}break;case 24:Ko(a.memoizedState.cache)}if(o=a.child,o!==null)o.return=a,Cn=o;else t:for(a=e;Cn!==null;){o=Cn;var u=o.sibling,h=o.return;if(qv(o),o===a){Cn=null;break t}if(u!==null){u.return=h,Cn=u;break t}Cn=h}}}var vM={getCacheForType:function(e){var n=Dn(vn),a=n.data.get(e);return a===void 0&&(a=e(),n.data.set(e,a)),a},cacheSignal:function(){return Dn(vn).controller.signal}},_M=typeof WeakMap=="function"?WeakMap:Map,ke=0,en=null,Ue=null,Ie=0,Ze=0,fi=null,os=!1,Hr=!1,od=!1,Ca=0,mn=0,ls=0,qs=0,iu=0,hi=0,Vr=0,dl=null,$n=null,ld=!1,au=0,a_=0,su=1/0,ru=null,cs=null,ln=0,Oi=null,Ys=null,ea=0,cd=0,ud=null,s_=null,Gr=null,Xr=null,kr=null,pl=0,ou=null;function di(){return(ke&2)!==0&&Ie!==0?Ie&-Ie:rt.T!==null?Sd():sc()}function r_(){if(hi===0)if((Ie&536870912)===0||Ne){var e=As;As<<=1,(As&3932160)===0&&(As=262144),hi=e}else hi=536870912;return e=Ln.current,e!==null&&(e.flags|=32),hi}function Wr(e,n){if(n!=null){var a=e.stateNode,o=a.ref;o===null&&(o=a.ref=H_(xa(e.memoizedProps,a))),Xr===null&&(Xr=[]),Xr.push(n.bind(null,o))}}function ti(e,n,a){(e===en&&(Ze===2||Ze===9)||e.cancelPendingCommit!==null)&&(qr(e,0),us(e,Ie,hi,!1)),ki(e,a),((ke&2)===0||e!==en)&&(e===en&&((ke&2)===0&&(qs|=a),mn===4&&us(e,Ie,hi,!1)),na(e))}function o_(e,n,a){if((ke&6)!==0)throw Error(s(327));var o=!a&&(n&127)===0&&(n&e.expiredLanes)===0||Wa(e,n),u=o?yM(e,n):hd(e,n,!0),h=o;do{if(u===0){Hr&&!o&&us(e,n,0,!1);break}else{if(a=e.current.alternate,h&&!xM(a)){u=hd(e,n,!1),h=!1;continue}if(u===2){if(h=n,e.errorRecoveryDisabledLanes&h)var x=0;else x=e.pendingLanes&-536870913,x=x!==0?x:x&536870912?536870912:0;if(x!==0){n=x;t:{var w=e;u=dl;var B=w.current.memoizedState.isDehydrated;if(B&&(qr(w,x).flags|=256),x=hd(w,x,!1),x!==2&&x!==6){if(od&&!B){w.errorRecoveryDisabledLanes|=h,qs|=h,u=4;break t}h=$n,$n=u,h!==null&&($n===null?$n=h:$n.push.apply($n,h))}u=x}if(h=!1,u!==2)continue}}if(u===1){qr(e,0),us(e,n,0,!0);break}t:{switch(o=e,h=u,h){case 0:case 1:throw Error(s(345));case 4:if((n&4194048)!==n&&(n&62914560)!==n)break;case 6:us(o,n,hi,!os);break t;case 2:$n=null;break;case 3:case 5:break;default:throw Error(s(329))}if((n&62914560)===n&&(u=au+300-$t(),10<u)){if(us(o,n,hi,!os),Rs(o,0,!0)!==0)break t;ea=n,o.timeoutHandle=Dd(l_.bind(null,o,a,$n,ru,ld,n,hi,qs,Vr,os,h,"Throttled",-0,0),u);break t}l_(o,a,$n,ru,ld,n,hi,qs,Vr,os,h,null,-0,0)}}break}while(!0);na(e)}function l_(e,n,a,o,u,h,x,w,B,nt,dt,bt,$,ht){e.timeoutHandle=-1;var Xt=n.subtreeFlags,le=(h&335544064)===h;if(bt=null,(le||Xt&8192||(Xt&16785408)===16785408)&&(bt={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:qi},ui=null,t_(n,h,bt),le&&(Xt=bt,le=e.containerInfo,le=(le.nodeType===9?le:le.ownerDocument).__reactViewTransition,le!=null&&(Xt.count++,Xt.waitingForViewTransition=!0,Xt=Ml.bind(Xt),le.finished.then(Xt,Xt))),Xt=(h&62914560)===h?au-$t():(h&4194048)===h?a_-$t():0,Xt=EE(bt,Xt),Xt!==null)){ea=h,e.cancelPendingCommit=Xt(g_.bind(null,e,n,h,a,o,u,x,w,B,nt,dt,bt,null,$,ht)),us(e,h,x,!nt);return}g_(e,n,h,a,o,u,x,w,B,nt,dt,bt)}function xM(e){for(var n=e;;){var a=n.tag;if((a===0||a===11||a===15)&&n.flags&16384&&(a=n.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var o=0;o<a.length;o++){var u=a[o],h=u.getSnapshot;u=u.value;try{if(!li(h(),u))return!1}catch{return!1}}if(a=n.child,n.subtreeFlags&16384&&a!==null)a.return=n,n=a;else{if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return!0;n=n.return}n.sibling.return=n.return,n=n.sibling}}return!0}function us(e,n,a,o){n=Xi(e,n),n&=~iu,n&=~qs,e.suspendedLanes|=n,e.pingedLanes&=~n,o&&(e.warmLanes|=n),o=e.expirationTimes;for(var u=n;0<u;){var h=31-ye(u),x=1<<h;o[h]=-1,u&=~x}a!==0&&ws(e,a,n)}function lu(){return(ke&6)===0?(ml(0),!1):!0}function fd(){if(Ue!==null){if(Ze===0)var e=Ue.return;else e=Ue,Ea=Os=null,xh(e),Lr=null,jo=0,e=Ue;for(;e!==null;)Dv(e.alternate,e),e=e.return;Ue=null}}function qr(e,n){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,XM(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),ea=0,fd(),en=e,Ue=a=ya(e.current,null),Ie=n,Ze=0,fi=null,os=!1,Hr=Wa(e,n),od=!1,Vr=hi=iu=qs=ls=mn=0,$n=dl=null,ld=!1,Ca=Xi(e,n),gc(),a}function c_(e,n){Te=null,rt.H=Vc,n===Dr||n===Rc?(n=gg(),Ze=3):n===rh?(n=gg(),Ze=4):Ze=n===Oh?8:n!==null&&typeof n=="object"&&typeof n.then=="function"?6:1,fi=n,Ue===null&&(mn=1,Gc(e,Mi(n,e.current)))}function u_(){var e=Ln.current;return e===null?!0:(Ie&4194048)===Ie?Bn===null:(Ie&62914560)===Ie||(Ie&536870912)!==0?e===Bn:!1}function f_(){var e=rt.H;return rt.H=Vc,e===null?Vc:e}function h_(){var e=rt.A;return rt.A=vM,e}function cu(){mn=4,os||(Ie&4194048)!==Ie&&Ln.current!==null||(Hr=!0),(ls&134217727)===0&&(qs&134217727)===0||en===null||us(en,Ie,hi,!1)}function hd(e,n,a){var o=ke;ke|=2;var u=f_(),h=h_();(en!==e||Ie!==n)&&(ru=null,qr(e,n)),n=!1;var x=mn;t:do try{if(Ze!==0&&Ue!==null){var w=Ue,B=fi;switch(Ze){case 8:fd(),x=6;break t;case 3:case 2:case 9:case 6:Ln.current===null&&(n=!0);var nt=Ze;if(Ze=0,fi=null,Yr(e,w,B,nt),a&&Hr){x=0;break t}break;default:nt=Ze,Ze=0,fi=null,Yr(e,w,B,nt)}}SM(),x=mn;break}catch(dt){c_(e,dt)}while(!0);return n&&e.shellSuspendCounter++,Ea=Os=null,ke=o,rt.H=u,rt.A=h,Ue===null&&(en=null,Ie=0,gc()),x}function SM(){for(;Ue!==null;)d_(Ue)}function yM(e,n){var a=ke;ke|=2;var o=f_(),u=h_();en!==e||Ie!==n?(ru=null,su=$t()+500,qr(e,n)):Hr=Wa(e,n);t:do try{if(Ze!==0&&Ue!==null){n=Ue;var h=fi;e:switch(Ze){case 1:Ze=0,fi=null,Yr(e,n,h,1);break;case 2:case 9:if(pg(h)){Ze=0,fi=null,p_(n);break}n=function(){Ze!==2&&Ze!==9||en!==e||(Ze=7),na(e)},h.then(n,n);break t;case 3:Ze=7;break t;case 4:Ze=5;break t;case 7:pg(h)?(Ze=0,fi=null,p_(n)):(Ze=0,fi=null,Yr(e,n,h,7));break;case 5:var x=null;switch(Ue.tag){case 26:x=Ue.memoizedState;case 5:case 27:var w=Ue;if(x?sx(x):w.stateNode.complete){Ze=0,fi=null;var B=w.sibling;if(B!==null)Ue=B;else{var nt=w.return;nt!==null?(Ue=nt,uu(nt)):Ue=null}break e}}Ze=0,fi=null,Yr(e,n,h,5);break;case 6:Ze=0,fi=null,Yr(e,n,h,6);break;case 8:fd(),mn=6;break t;default:throw Error(s(462))}}MM();break}catch(dt){c_(e,dt)}while(!0);return Ea=Os=null,rt.H=o,rt.A=u,ke=a,Ue!==null?0:(en=null,Ie=0,gc(),mn)}function MM(){for(;Ue!==null&&!qt();)d_(Ue)}function d_(e){var n=Cv(e.alternate,e,Ca);e.memoizedProps=e.pendingProps,n===null?uu(e):Ue=n}function p_(e){var n=e,a=n.alternate;switch(n.tag){case 15:case 0:n=Mv(a,n,n.pendingProps,n.type,void 0,Ie);break;case 11:n=Mv(a,n,n.pendingProps,n.type.render,n.ref,Ie);break;case 5:xh(n);var o=n;o===Rn&&(Ne?(Mc(o),o.tag===5&&o.stateNode!=null&&(sn=o.stateNode)):(Mc(o),Ne=!0));default:Dv(a,n),n=Ue=ig(n,Ca),n=Cv(a,n,Ca)}e.memoizedProps=e.pendingProps,n===null?uu(e):Ue=n}function Yr(e,n,a,o){Ea=Os=null,xh(n),Lr=null,jo=0;var u=n.return;try{if(cM(e,u,n,a,Ie)){mn=1,Gc(e,Mi(a,e.current)),Ue=null;return}}catch(h){if(u!==null)throw Ue=u,h;mn=1,Gc(e,Mi(a,e.current)),Ue=null;return}n.flags&32768?(Ne||o===1?e=!0:Hr||(Ie&536870912)!==0?e=!1:(os=e=!0,(o===2||o===9||o===3||o===6)&&(o=Ln.current,o!==null&&o.tag===13&&(o.flags|=16384))),m_(n,e)):uu(n)}function uu(e){var n=e;do{if((n.flags&32768)!==0){m_(n,os);return}e=n.return;var a=dM(n.alternate,n,Ca);if(a!==null){Ue=a;return}if(n=n.sibling,n!==null){Ue=n;return}Ue=n=e}while(n!==null);mn===0&&(mn=5)}function m_(e,n){do{var a=pM(e.alternate,e);if(a!==null){a.flags&=32767,Ue=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!n&&(e=e.sibling,e!==null)){Ue=e;return}Ue=e=a}while(e!==null);mn=6,Ue=null}function g_(e,n,a,o,u,h,x,w,B,nt,dt,bt){e.cancelPendingCommit=null;do fu();while(ln!==0);if((ke&6)!==0)throw Error(s(327));if(n!==null){if(n===e.current)throw Error(s(177));e===en&&(Ue=en=null,Ie=0),Ys=n,Oi=e,ea=a,ud=u,s_=o,EM(e,n,a,x,w,B,bt)}}function EM(e,n,a,o,u,h,x){var w=n.lanes|n.childLanes;if(cd=w,w|=Yf,ac(e,a,w,o,u,h),Xr=null,(a&335544064)===a?(kr=Qy(e),o=10262):(kr=null,o=10256),(n.subtreeFlags&o)!==0||(n.flags&o)!==0?(e.callbackNode=null,e.callbackPriority=0,CM(Ft,function(){return gd(),null})):(e.callbackNode=null,e.callbackPriority=0),Jc=!1,o=(n.flags&13878)!==0,(n.subtreeFlags&13878)!==0||o){o=rt.T,rt.T=null,u=At.p,At.p=2,h=ke,ke|=4;try{mM(e,n,a)}finally{ke=h,At.p=u,rt.T=o}}ln=1,Jc?Gr=KM(x,e.containerInfo,kr,dd,pd,TM,md,gd,bM):(dd(),pd(),md())}function bM(e){if(ln!==0){var n=Oi.onRecoverableError;n(e,{componentStack:null})}}function TM(){ln===3&&(ln=0,jv(Ys,Oi),ln=4)}function dd(){if(ln===1){ln=0;var e=Oi,n=Ys,a=ea,o=(n.flags&13878)!==0;if((n.subtreeFlags&13878)!==0||o){o=rt.T,rt.T=null;var u=At.p;At.p=2;var h=ke;ke|=4;try{ul=$c=!1,Jv(n,e,a),a=wd;var x=Y0(e.containerInfo),w=a.focusedElem,B=a.selectionRange;if(x!==w&&w&&w.ownerDocument&&q0(w.ownerDocument.documentElement,w)){if(B!==null&&Gf(w)){var nt=B.start,dt=B.end;if(dt===void 0&&(dt=nt),"selectionStart"in w)w.selectionStart=nt,w.selectionEnd=Math.min(dt,w.value.length);else{var bt=w.ownerDocument||document,$=bt&&bt.defaultView||window;if($.getSelection){var ht=$.getSelection(),Xt=w.textContent.length,le=Math.min(B.start,Xt),Ae=B.end===void 0?le:Math.min(B.end,Xt);!ht.extend&&le>Ae&&(x=Ae,Ae=le,le=x);var et=W0(w,le),q=W0(w,Ae);if(et&&q&&(ht.rangeCount!==1||ht.anchorNode!==et.node||ht.anchorOffset!==et.offset||ht.focusNode!==q.node||ht.focusOffset!==q.offset)){var ot=bt.createRange();ot.setStart(et.node,et.offset),ht.removeAllRanges(),le>Ae?(ht.addRange(ot),ht.extend(q.node,q.offset)):(ot.setEnd(q.node,q.offset),ht.addRange(ot))}}}}for(bt=[],ht=w;ht=ht.parentNode;)ht.nodeType===1&&bt.push({element:ht,left:ht.scrollLeft,top:ht.scrollTop});for(typeof w.focus=="function"&&w.focus(),w=0;w<bt.length;w++){var Et=bt[w];Et.element.scrollLeft=Et.left,Et.element.scrollTop=Et.top}}eo=!!Rd,wd=Rd=null}finally{ke=h,At.p=u,rt.T=o}}e.current=n,ln=2}}function pd(){if(ln===2){ln=0;var e=Oi,n=Ys,a=(n.flags&8772)!==0;if((n.subtreeFlags&8772)!==0||a){a=rt.T,rt.T=null;var o=At.p;At.p=2;var u=ke;ke|=4;try{kv(e,n.alternate,n)}finally{ke=u,At.p=o,rt.T=a}}ln=3}}function md(){if(ln===4||ln===3){ln=0;var e=Gr;Gr=null,kt();var n=Oi,a=Ys,o=ea,u=s_,h=(o&335544064)===o?10262:10256;if((a.subtreeFlags&h)!==0||(a.flags&h)!==0?ln=5:(ln=0,Ys=Oi=null,v_(n,n.pendingLanes)),h=n.pendingLanes,h===0&&(cs=null),zo(o),a=a.stateNode,Qt&&typeof Qt.onCommitFiberRoot=="function")try{Qt.onCommitFiberRoot(ue,a,void 0,(a.current.flags&128)===128)}catch{}if(u!==null){a=rt.T,h=At.p,At.p=2,rt.T=null;try{for(var x=n.onRecoverableError,w=0;w<u.length;w++){var B=u[w];x(B.value,{componentStack:B.stack})}}finally{rt.T=a,At.p=h}}if(u=Xr,x=kr,kr=null,u!==null&&(Xr=null,x===null&&(x=[]),e!==null))for(B=0;B<u.length;B++)a=(0,u[B])(x),a!==void 0&&e.finished.finally(a);(ea&3)!==0&&fu(),na(n),h=n.pendingLanes,(o&261930)!==0&&(h&42)!==0?n===ou?pl++:(pl=0,ou=n):(pl=0,ou=null),ml(0)}}function v_(e,n){(e.pooledCacheLanes&=n)===0&&(n=e.pooledCache,n!=null&&(e.pooledCache=null,Ko(n)))}function fu(){return Gr!==null&&(Gr.skipTransition(),Gr=null),dd(),pd(),md(),gd()}function gd(){if(ln!==5)return!1;var e=Oi,n=cd;cd=0;var a=zo(ea),o=rt.T,u=At.p;try{At.p=32>a?32:a,rt.T=null,a=ud,ud=null;var h=Oi,x=ea;if(ln=0,Ys=Oi=null,ea=0,(ke&6)!==0)throw Error(s(331));var w=ke;if(ke|=4,n_(h.current),$v(h,h.current,x,a),ke=w,ml(0,!1),Qt&&typeof Qt.onPostCommitFiberRoot=="function")try{Qt.onPostCommitFiberRoot(ue,h)}catch{}return!0}finally{At.p=u,rt.T=o,v_(e,n)}}function __(e,n,a){n=Mi(a,n),n=Uh(e.stateNode,n,2),e=es(e,n,2),e!==null&&(ki(e,2),na(e))}function Ke(e,n,a){if(e.tag===3)__(e,e,a);else for(;n!==null;){if(n.tag===3){__(n,e,a);break}else if(n.tag===1){var o=n.stateNode;if(typeof n.type.getDerivedStateFromError=="function"||typeof o.componentDidCatch=="function"&&(cs===null||!cs.has(o))){e=Mi(a,e),a=pv(2),o=es(n,a,2),o!==null&&(mv(a,o,n,e),ki(o,2),na(o));break}}n=n.return}}function vd(e,n,a){var o=e.pingCache;if(o===null){o=e.pingCache=new _M;var u=new Set;o.set(n,u)}else u=o.get(n),u===void 0&&(u=new Set,o.set(n,u));u.has(a)||(od=!0,u.add(a),e=AM.bind(null,e,n,a),n.then(e,e))}function AM(e,n,a){var o=e.pingCache;o!==null&&o.delete(n),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,en===e&&(Ie&a)===a&&((mn===4||mn===3&&(Ie&62914560)===Ie&&300>$t()-au)&&(ke&2)===0?qr(e,0):iu|=a,Vr===Ie&&(Vr=0)),na(e)}function x_(e,n){n===0&&(n=Uo()),e=Ds(e,n),e!==null&&(ki(e,n),na(e))}function RM(e){var n=e.memoizedState,a=0;n!==null&&(a=n.retryLane),x_(e,a)}function wM(e,n){var a=0;switch(e.tag){case 31:case 13:var o=e.stateNode,u=e.memoizedState;u!==null&&(a=u.retryLane);break;case 19:o=e.stateNode;break;case 22:o=e.stateNode._retryCache;break;default:throw Error(s(314))}o!==null&&o.delete(n),x_(e,a)}function CM(e,n){return Ht(e,n)}var Zr=null,Kr=null,_d=!1,hu=!1,xd=!1,fs=0;function na(e){e!==Kr&&e.next===null&&(Kr===null?Zr=Kr=e:Kr=Kr.next=e),hu=!0,_d||(_d=!0,DM())}function ml(e,n){if(!xd&&hu){xd=!0;do for(var a=!1,o=Zr;o!==null;){if(e!==0){var u=o.pendingLanes;if(u===0)var h=0;else{var x=o.suspendedLanes,w=o.pingedLanes;h=(1<<31-ye(42|e)+1)-1,h&=u&~(x&~w),h=h&201326741?h&201326741|1:h?h|2:0}h!==0&&(a=!0,E_(o,h))}else h=Ie,h=Rs(o,o===en?h:0,o.cancelPendingCommit!==null||o.timeoutHandle!==-1),(h&3)===0||Wa(o,h)||(a=!0,E_(o,h));o=o.next}while(a);xd=!1}}function NM(){S_()}function S_(){hu=_d=!1;var e=0;fs!==0&&GM()&&(e=fs);for(var n=$t(),a=null,o=Zr;o!==null;){var u=o.next,h=y_(o,n);h===0?(o.next=null,a===null?Zr=u:a.next=u,u===null&&(Kr=a)):(a=o,(e!==0||(h&3)!==0)&&(hu=!0)),o=u}ln!==0&&ln!==5||ml(e),fs!==0&&(fs=0)}function y_(e,n){for(var a=e.suspendedLanes,o=e.pingedLanes,u=e.expirationTimes,h=e.pendingLanes&-62914561;0<h;){var x=31-ye(h),w=1<<x,B=u[x];B===-1?((w&a)===0||(w&o)!==0)&&(u[x]=Lo(w,n)):B<=n&&(e.expiredLanes|=w),h&=~w}if(n=en,a=Ie,a=Rs(e,e===n?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),o=e.callbackNode,a===0||e===n&&(Ze===2||Ze===9)||e.cancelPendingCommit!==null)return o!==null&&o!==null&&he(o),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||Wa(e,a)){if(n=a&-a,n===e.callbackPriority)return n;switch(o!==null&&he(o),zo(a)){case 2:case 8:a=Z;break;case 32:a=Ft;break;case 268435456:a=Vt;break;default:a=Ft}return o=M_.bind(null,e),a=Ht(a,o),e.callbackPriority=n,e.callbackNode=a,n}return o!==null&&o!==null&&he(o),e.callbackPriority=2,e.callbackNode=null,2}function M_(e,n){if(ln!==0&&ln!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(fu()&&e.callbackNode!==a)return null;var o=Ie;return o=Rs(e,e===en?o:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),o===0?null:(o_(e,o,n),y_(e,$t()),e.callbackNode!=null&&e.callbackNode===a?M_.bind(null,e):null)}function E_(e,n){if(fu())return null;o_(e,n,!0)}function DM(){kM(function(){(ke&6)!==0?Ht(Se,NM):S_()})}function Sd(){if(fs===0){var e=zs;e===0&&(e=gr,gr<<=1,(gr&261888)===0&&(gr=256)),fs=e}return fs}function b_(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:lc(e)}function LM(e,n,a,o,u){if(n==="submit"&&a&&a.stateNode===u){var h=b_((u[W]||null).action),x=o.submitter;x&&(n=(n=x[W]||null)?b_(n.formAction):x.getAttribute("formAction"),n!==null&&(h=n,x=null));var w=new hc("action","action",null,o,u);e.push({event:w,listeners:[{instance:null,listener:function(){if(o.defaultPrevented){if(fs!==0){var B=new FormData(u,x);wh(a,{pending:!0,data:B,method:u.method,action:h},null,B)}}else typeof h=="function"&&(w.preventDefault(),B=new FormData(u,x),wh(a,{pending:!0,data:B,method:u.method,action:h},h,B))},currentTarget:u}]})}}for(var yd=0;yd<qf.length;yd++){var Md=qf[yd],UM=Md.toLowerCase(),OM=Md[0].toUpperCase()+Md.slice(1);Ni(UM,"on"+OM)}Ni(J0,"onAnimationEnd"),Ni(Q0,"onAnimationIteration"),Ni(j0,"onAnimationStart"),Ni("dblclick","onDoubleClick"),Ni("focusin","onFocus"),Ni("focusout","onBlur"),Ni(Xy,"onTransitionRun"),Ni(ky,"onTransitionStart"),Ni(Wy,"onTransitionCancel"),Ni($0,"onTransitionEnd"),hn("onMouseEnter",["mouseout","mouseover"]),hn("onMouseLeave",["mouseout","mouseover"]),hn("onPointerEnter",["pointerout","pointerover"]),hn("onPointerLeave",["pointerout","pointerover"]),Kt("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),Kt("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),Kt("onBeforeInput",["compositionend","keypress","textInput","paste"]),Kt("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),Kt("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),Kt("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var gl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),PM=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(gl));function T_(e,n){n=(n&4)!==0;for(var a=0;a<e.length;a++){var o=e[a],u=o.event;o=o.listeners;t:{var h=void 0;if(n)for(var x=o.length-1;0<=x;x--){var w=o[x],B=w.instance,nt=w.currentTarget;if(w=w.listener,B!==h&&u.isPropagationStopped())break t;h=w,u.currentTarget=nt;try{h(u)}catch(dt){mc(dt)}u.currentTarget=null,h=B}else for(x=0;x<o.length;x++){if(w=o[x],B=w.instance,nt=w.currentTarget,w=w.listener,B!==h&&u.isPropagationStopped())break t;h=w,u.currentTarget=nt;try{h(u)}catch(dt){mc(dt)}u.currentTarget=null,h=B}}}}function Oe(e,n){var a=n[ut];a===void 0&&(a=n[ut]=new Set);var o=e+"__bubble";a.has(o)||(A_(n,e,2,!1),a.add(o))}function Ed(e,n,a){var o=0;n&&(o|=4),A_(a,e,o,n)}var du="_reactListening"+Math.random().toString(36).slice(2);function bd(e){if(!e[du]){e[du]=!0,qe.forEach(function(a){a!=="selectionchange"&&(PM.has(a)||Ed(a,!1,e),Ed(a,!0,e))});var n=e.nodeType===9?e:e.ownerDocument;n===null||n[du]||(n[du]=!0,Ed("selectionchange",!1,n))}}function A_(e,n,a,o){switch(mx(n)){case 2:var u=RE;break;case 8:u=wE;break;default:u=kd}a=u.bind(null,n,a,e),u=void 0,!Lf||n!=="touchstart"&&n!=="touchmove"&&n!=="wheel"||(u=!0),o?u!==void 0?e.addEventListener(n,a,{capture:!0,passive:u}):e.addEventListener(n,a,!0):u!==void 0?e.addEventListener(n,a,{passive:u}):e.addEventListener(n,a,!1)}function Td(e,n,a,o,u){var h=o;if((n&1)===0&&(n&2)===0&&o!==null)t:for(;;){if(o===null)return;var x=o.tag;if(x===3||x===4){var w=o.stateNode.containerInfo;if(w===u)break;if(x===4)for(x=o.return;x!==null;){var B=x.tag;if((B===3||B===4)&&x.stateNode.containerInfo===u)return;x=x.return}for(;w!==null;){if(x=ve(w),x===null)return;if(B=x.tag,B===5||B===6||B===26||B===27){o=h=x;continue t}w=w.parentNode}}o=o.return}A0(function(){var nt=h,dt=Nf(a),bt=[];t:{var $=tg.get(e);if($!==void 0){var ht=hc,Xt=e;switch(e){case"keypress":if(uc(a)===0)break t;case"keydown":case"keyup":ht=xy;break;case"focusin":Xt="focus",ht=If;break;case"focusout":Xt="blur",ht=If;break;case"beforeblur":case"afterblur":ht=If;break;case"click":if(a.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":ht=C0;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":ht=oy;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":ht=by;break;case J0:case Q0:case j0:ht=uy;break;case $0:ht=Ay;break;case"scroll":case"scrollend":ht=sy;break;case"wheel":ht=wy;break;case"copy":case"cut":case"paste":ht=hy;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":ht=D0;break;case"submit":ht=My;break;case"toggle":case"beforetoggle":ht=Ny}var le=(n&4)!==0,Ae=!le&&(e==="scroll"||e==="scrollend"),et=le?$!==null?$+"Capture":null:$;le=[];for(var q=nt,ot;q!==null;){var Et=q;if(ot=Et.stateNode,Et=Et.tag,Et!==5&&Et!==26&&Et!==27||ot===null||et===null||(Et=Bo(q,et),Et!=null&&le.push(vl(q,Et,ot))),Ae)break;q=q.return}0<le.length&&($=new ht($,Xt,null,a,dt),bt.push({event:$,listeners:le}))}}if((n&7)===0){t:{if(ht=e==="mouseover"||e==="pointerover",$=e==="mouseout"||e==="pointerout",ht&&a!==Cf&&(Xt=a.relatedTarget||a.fromElement)&&(ve(Xt)||Xt[mt]))break t;($||ht)&&(Xt=dt.window===dt?dt:(ht=dt.ownerDocument)?ht.defaultView||ht.parentWindow:window,$?(ht=a.relatedTarget||a.toElement,$=nt,ht=ht?ve(ht):null,ht!==null&&(Ae=c(ht),le=ht.tag,ht!==Ae||le!==5&&le!==27&&le!==6)&&(ht=null)):($=null,ht=nt),$!==ht&&(le=C0,Et="onMouseLeave",et="onMouseEnter",q="mouse",(e==="pointerout"||e==="pointerover")&&(le=D0,Et="onPointerLeave",et="onPointerEnter",q="pointer"),Ae=$==null?Xt:ee($),ot=ht==null?Xt:ee(ht),Xt=new le(Et,q+"leave",$,a,dt),Xt.target=Ae,Xt.relatedTarget=ot,Et=null,ve(dt)===nt&&(le=new le(et,q+"enter",ht,a,dt),le.target=ot,le.relatedTarget=Ae,Et=le),Ae=Et,le=$&&ht?L($,ht,IM):null,$!==null&&R_(bt,Xt,$,le,!1),ht!==null&&Ae!==null&&R_(bt,Ae,ht,le,!0)))}t:{if($=nt?ee(nt):window,ht=$.nodeName&&$.nodeName.toLowerCase(),ht==="select"||ht==="input"&&$.type==="file")var ne=F0;else if(z0($))if(H0)ne=Hy;else{ne=By;var ze=zy}else ht=$.nodeName,!ht||ht.toLowerCase()!=="input"||$.type!=="checkbox"&&$.type!=="radio"?nt&&wf(nt.elementType)&&(ne=F0):ne=Fy;if(ne&&(ne=ne(e,nt))){B0(bt,ne,a,dt);break t}ze&&ze(e,$,nt)}switch(ze=nt?ee(nt):window,e){case"focusin":(z0(ze)||ze.contentEditable==="true")&&(Er=ze,Xf=nt,qo=null);break;case"focusout":qo=Xf=Er=null;break;case"mousedown":kf=!0;break;case"contextmenu":case"mouseup":case"dragend":kf=!1,Z0(bt,a,dt);break;case"selectionchange":if(Gy)break;case"keydown":case"keyup":Z0(bt,a,dt)}var pe;if(Bf)t:{switch(e){case"compositionstart":var ge="onCompositionStart";break t;case"compositionend":ge="onCompositionEnd";break t;case"compositionupdate":ge="onCompositionUpdate";break t}ge=void 0}else Mr?P0(e,a)&&(ge="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(ge="onCompositionStart");ge&&(L0&&a.locale!=="ko"&&(Mr||ge!=="onCompositionStart"?ge==="onCompositionEnd"&&Mr&&(pe=R0()):(qa=dt,Uf="value"in qa?qa.value:qa.textContent,Mr=!0)),ze=pu(nt,ge),0<ze.length&&(ge=new N0(ge,e,null,a,dt),bt.push({event:ge,listeners:ze}),pe?ge.data=pe:(pe=I0(a),pe!==null&&(ge.data=pe)))),(pe=Ly?Uy(e,a):Oy(e,a))&&(ge=pu(nt,"onBeforeInput"),0<ge.length&&(ze=new N0("onBeforeInput","beforeinput",null,a,dt),bt.push({event:ze,listeners:ge}),ze.data=pe)),LM(bt,e,nt,a,dt)}T_(bt,n)})}function vl(e,n,a){return{instance:e,listener:n,currentTarget:a}}function pu(e,n){for(var a=n+"Capture",o=[];e!==null;){var u=e,h=u.stateNode;if(u=u.tag,u!==5&&u!==26&&u!==27||h===null||(u=Bo(e,a),u!=null&&o.unshift(vl(e,u,h)),u=Bo(e,n),u!=null&&o.push(vl(e,u,h))),e.tag===3)return o;e=e.return}return[]}function IM(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function R_(e,n,a,o,u){for(var h=n._reactName,x=[];a!==null&&a!==o;){var w=a,B=w.alternate,nt=w.stateNode;if(w=w.tag,B!==null&&B===o)break;w!==5&&w!==26&&w!==27||nt===null||(B=nt,u?(nt=Bo(a,h),nt!=null&&x.unshift(vl(a,nt,B))):u||(nt=Bo(a,h),nt!=null&&x.push(vl(a,nt,B)))),a=a.return}x.length!==0&&e.push({event:n,listeners:x})}var zM=/\r\n?/g,BM=/\u0000|\uFFFD/g;function w_(e){return(typeof e=="string"?e:""+e).replace(zM,`
`).replace(BM,"")}function C_(e,n){return n=w_(n),w_(e)===n}function Je(e,n,a,o,u,h){switch(a){case"children":if(typeof o=="string")n==="body"||n==="textarea"&&o===""||xr(e,o);else if(typeof o=="number"||typeof o=="bigint")n!=="body"&&xr(e,""+o);else return;break;case"className":oi(e,"class",o);break;case"tabIndex":oi(e,"tabindex",o);break;case"dir":case"role":case"viewBox":case"width":case"height":oi(e,a,o);break;case"style":b0(e,o,h);return;case"data":if(n!=="object"){oi(e,"data",o);break}case"src":case"href":if(o===""&&(n!=="a"||a!=="href")){e.removeAttribute(a);break}if(o==null||typeof o=="function"||typeof o=="symbol"||typeof o=="boolean"){e.removeAttribute(a);break}o=lc(o),e.setAttribute(a,o);break;case"action":case"formAction":if(typeof o=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof h=="function"&&(a==="formAction"?(n!=="input"&&Je(e,n,"name",u.name,u,null),Je(e,n,"formEncType",u.formEncType,u,null),Je(e,n,"formMethod",u.formMethod,u,null),Je(e,n,"formTarget",u.formTarget,u,null)):(Je(e,n,"encType",u.encType,u,null),Je(e,n,"method",u.method,u,null),Je(e,n,"target",u.target,u,null)));if(o==null||typeof o=="symbol"||typeof o=="boolean"){e.removeAttribute(a);break}o=lc(o),e.setAttribute(a,o);break;case"onClick":o!=null&&(e.onclick=qi);return;case"onScroll":o!=null&&Oe("scroll",e);return;case"onScrollEnd":o!=null&&Oe("scrollend",e);return;case"dangerouslySetInnerHTML":if(o!=null){if(typeof o!="object"||!("__html"in o))throw Error(s(61));if(a=o.__html,a!=null){if(u.children!=null)throw Error(s(60));(h!=null?h.__html:void 0)!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=o&&typeof o!="function"&&typeof o!="symbol";break;case"muted":e.muted=o&&typeof o!="function"&&typeof o!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(o==null||typeof o=="function"||typeof o=="boolean"||typeof o=="symbol"){e.removeAttribute("xlink:href");break}a=lc(o),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":o!=null&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,o):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":o&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":o===!0?e.setAttribute(a,""):o!==!1&&o!=null&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,o):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":o!=null&&typeof o!="function"&&typeof o!="symbol"&&!isNaN(o)&&1<=o?e.setAttribute(a,o):e.removeAttribute(a);break;case"rowSpan":case"start":o==null||typeof o=="function"||typeof o=="symbol"||isNaN(o)?e.removeAttribute(a):e.setAttribute(a,o);break;case"popover":Oe("beforetoggle",e),Oe("toggle",e),an(e,"popover",o);break;case"xlinkActuate":Pe(e,"http://www.w3.org/1999/xlink","xlink:actuate",o);break;case"xlinkArcrole":Pe(e,"http://www.w3.org/1999/xlink","xlink:arcrole",o);break;case"xlinkRole":Pe(e,"http://www.w3.org/1999/xlink","xlink:role",o);break;case"xlinkShow":Pe(e,"http://www.w3.org/1999/xlink","xlink:show",o);break;case"xlinkTitle":Pe(e,"http://www.w3.org/1999/xlink","xlink:title",o);break;case"xlinkType":Pe(e,"http://www.w3.org/1999/xlink","xlink:type",o);break;case"xmlBase":Pe(e,"http://www.w3.org/XML/1998/namespace","xml:base",o);break;case"xmlLang":Pe(e,"http://www.w3.org/XML/1998/namespace","xml:lang",o);break;case"xmlSpace":Pe(e,"http://www.w3.org/XML/1998/namespace","xml:space",o);break;case"is":an(e,"is",o);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=iy.get(a)||a,an(e,a,o);else return}Ce=!0}function Ad(e,n,a,o,u,h){switch(a){case"style":b0(e,o,h);return;case"dangerouslySetInnerHTML":if(o!=null){if(typeof o!="object"||!("__html"in o))throw Error(s(61));if(a=o.__html,a!=null){if(u.children!=null)throw Error(s(60));(h!=null?h.__html:void 0)!==a&&(e.innerHTML=a)}}break;case"children":if(typeof o=="string")xr(e,o);else if(typeof o=="number"||typeof o=="bigint")xr(e,""+o);else return;break;case"onScroll":o!=null&&Oe("scroll",e);return;case"onScrollEnd":o!=null&&Oe("scrollend",e);return;case"onClick":o!=null&&(e.onclick=qi);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!En.hasOwnProperty(a))t:{if(a[0]==="o"&&a[1]==="n"&&(u=a.endsWith("Capture"),h=a.slice(2,u?a.length-7:void 0),n=e[W]||null,n=n!=null?n[a]:null,typeof n=="function"&&e.removeEventListener(h,n,u),typeof o=="function")){typeof n!="function"&&n!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(h,o,u);break t}Ce=!0,a in e?e[a]=o:o===!0?e.setAttribute(a,""):an(e,a,o)}return}Ce=!0}function Pn(e,n,a){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":Oe("error",e),Oe("load",e);var o=!1,u=!1,h;for(h in a)if(a.hasOwnProperty(h)){var x=a[h];if(x!=null)switch(h){case"src":o=!0;break;case"srcSet":u=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(s(137,n));default:Je(e,n,h,x,a,null)}}u&&Je(e,n,"srcSet",a.srcSet,a,null),o&&Je(e,n,"src",a.src,a,null);return;case"input":Oe("invalid",e);var w=h=x=u=null,B=null,nt=null;for(o in a)if(a.hasOwnProperty(o)){var dt=a[o];if(dt!=null)switch(o){case"name":u=dt;break;case"type":x=dt;break;case"checked":B=dt;break;case"defaultChecked":nt=dt;break;case"value":h=dt;break;case"defaultValue":w=dt;break;case"children":case"dangerouslySetInnerHTML":if(dt!=null)throw Error(s(137,n));break;default:Je(e,n,o,dt,a,null)}}S0(e,h,w,B,nt,x,u,!1);return;case"select":Oe("invalid",e),o=x=h=null;for(u in a)if(a.hasOwnProperty(u)&&(w=a[u],w!=null))switch(u){case"value":h=w;break;case"defaultValue":x=w;break;case"multiple":o=w;default:Je(e,n,u,w,a,null)}n=h,a=x,e.multiple=!!o,n!=null?_r(e,!!o,n,!1):a!=null&&_r(e,!!o,a,!0);return;case"textarea":Oe("invalid",e),h=u=o=null;for(x in a)if(a.hasOwnProperty(x)&&(w=a[x],w!=null))switch(x){case"value":o=w;break;case"defaultValue":u=w;break;case"children":h=w;break;case"dangerouslySetInnerHTML":if(w!=null)throw Error(s(91));break;default:Je(e,n,x,w,a,null)}M0(e,o,u,h);return;case"option":for(B in a)if(a.hasOwnProperty(B)&&(o=a[B],o!=null))switch(B){case"selected":e.selected=o&&typeof o!="function"&&typeof o!="symbol";break;default:Je(e,n,B,o,a,null)}return;case"dialog":Oe("beforetoggle",e),Oe("toggle",e),Oe("cancel",e),Oe("close",e);break;case"iframe":case"object":Oe("load",e);break;case"video":case"audio":for(o=0;o<gl.length;o++)Oe(gl[o],e);break;case"image":Oe("error",e),Oe("load",e);break;case"details":Oe("toggle",e);break;case"embed":case"source":case"link":Oe("error",e),Oe("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(nt in a)if(a.hasOwnProperty(nt)&&(o=a[nt],o!=null))switch(nt){case"children":case"dangerouslySetInnerHTML":throw Error(s(137,n));default:Je(e,n,nt,o,a,null)}return;default:if(wf(n)){for(dt in a)a.hasOwnProperty(dt)&&(o=a[dt],o!==void 0&&Ad(e,n,dt,o,a,void 0));return}}for(w in a)a.hasOwnProperty(w)&&(o=a[w],o!=null&&Je(e,n,w,o,a,null))}var FM={};function HM(e,n,a,o){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var u=null,h=null,x=null,w=null,B=null,nt=null,dt=null;for(ht in a){var bt=a[ht];if(a.hasOwnProperty(ht)&&bt!=null)switch(ht){case"checked":break;case"value":break;case"defaultValue":B=bt;default:o.hasOwnProperty(ht)||Je(e,n,ht,null,o,bt)}}for(var $ in o){var ht=o[$];if(bt=a[$],o.hasOwnProperty($)&&(ht!=null||bt!=null))switch($){case"type":ht!==bt&&(Ce=!0),h=ht;break;case"name":ht!==bt&&(Ce=!0),u=ht;break;case"checked":ht!==bt&&(Ce=!0),nt=ht;break;case"defaultChecked":ht!==bt&&(Ce=!0),dt=ht;break;case"value":ht!==bt&&(Ce=!0),x=ht;break;case"defaultValue":ht!==bt&&(Ce=!0),w=ht;break;case"children":case"dangerouslySetInnerHTML":if(ht!=null)throw Error(s(137,n));break;default:ht!==bt&&Je(e,n,$,ht,o,bt)}}Af(e,x,w,B,nt,dt,h,u);return;case"select":ht=x=w=$=null;for(h in a)if(B=a[h],a.hasOwnProperty(h)&&B!=null)switch(h){case"value":break;case"multiple":ht=B;default:o.hasOwnProperty(h)||Je(e,n,h,null,o,B)}for(u in o)if(h=o[u],B=a[u],o.hasOwnProperty(u)&&(h!=null||B!=null))switch(u){case"value":h!==B&&(Ce=!0),$=h;break;case"defaultValue":h!==B&&(Ce=!0),w=h;break;case"multiple":h!==B&&(Ce=!0),x=h;default:h!==B&&Je(e,n,u,h,o,B)}n=w,a=x,o=ht,$!=null?_r(e,!!a,$,!1):!!o!=!!a&&(n!=null?_r(e,!!a,n,!0):_r(e,!!a,a?[]:"",!1));return;case"textarea":ht=$=null;for(w in a)if(u=a[w],a.hasOwnProperty(w)&&u!=null&&!o.hasOwnProperty(w))switch(w){case"value":break;case"children":break;default:Je(e,n,w,null,o,u)}for(x in o)if(u=o[x],h=a[x],o.hasOwnProperty(x)&&(u!=null||h!=null))switch(x){case"value":u!==h&&(Ce=!0),$=u;break;case"defaultValue":u!==h&&(Ce=!0),ht=u;break;case"children":break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(s(91));break;default:u!==h&&Je(e,n,x,u,o,h)}y0(e,$,ht);return;case"option":for(var Xt in a)if($=a[Xt],a.hasOwnProperty(Xt)&&$!=null&&!o.hasOwnProperty(Xt))switch(Xt){case"selected":e.selected=!1;break;default:Je(e,n,Xt,null,o,$)}for(B in o)if($=o[B],ht=a[B],o.hasOwnProperty(B)&&$!==ht&&($!=null||ht!=null))switch(B){case"selected":$!==ht&&(Ce=!0),e.selected=$&&typeof $!="function"&&typeof $!="symbol";break;default:Je(e,n,B,$,o,ht)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var le in a)$=a[le],a.hasOwnProperty(le)&&$!=null&&!o.hasOwnProperty(le)&&Je(e,n,le,null,o,$);for(nt in o)if($=o[nt],ht=a[nt],o.hasOwnProperty(nt)&&$!==ht&&($!=null||ht!=null))switch(nt){case"children":case"dangerouslySetInnerHTML":if($!=null)throw Error(s(137,n));break;default:Je(e,n,nt,$,o,ht)}return;default:if(wf(n)){for(var Ae in a)$=a[Ae],a.hasOwnProperty(Ae)&&$!==void 0&&!o.hasOwnProperty(Ae)&&Ad(e,n,Ae,void 0,o,$);for(dt in o)$=o[dt],ht=a[dt],!o.hasOwnProperty(dt)||$===ht||$===void 0&&ht===void 0||Ad(e,n,dt,$,o,ht);return}}for(var et in a)$=a[et],a.hasOwnProperty(et)&&$!=null&&!o.hasOwnProperty(et)&&Je(e,n,et,null,o,$);for(bt in o)$=o[bt],ht=a[bt],!o.hasOwnProperty(bt)||$===ht||$==null&&ht==null||Je(e,n,bt,$,o,ht)}function N_(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function VM(){if(typeof performance.getEntriesByType=="function"){for(var e=0,n=0,a=performance.getEntriesByType("resource"),o=0;o<a.length;o++){var u=a[o],h=u.transferSize,x=u.initiatorType,w=u.duration;if(h&&w&&N_(x)){for(x=0,w=u.responseEnd,o+=1;o<a.length;o++){var B=a[o],nt=B.startTime;if(nt>w)break;var dt=B.transferSize,bt=B.initiatorType;dt&&N_(bt)&&(B=B.responseEnd,x+=dt*(B<w?1:(w-nt)/(B-nt)))}if(--o,n+=8*(h+x)/(u.duration/1e3),e++,10<e)break}}if(0<e)return n/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Rd=null,wd=null;function _l(e){return e.nodeType===9?e:e.ownerDocument}function D_(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function L_(e,n){if(e===0)switch(n){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&n==="foreignObject"?0:e}function U_(e,n,a,o){return a=_l(a).createElement(e),a[R]=o,a[W]=n,Pn(a,e,n),we(a),a}function Cd(e,n){return e==="textarea"||e==="noscript"||typeof n.children=="string"||typeof n.children=="number"||typeof n.children=="bigint"||typeof n.dangerouslySetInnerHTML=="object"&&n.dangerouslySetInnerHTML!==null&&n.dangerouslySetInnerHTML.__html!=null}var Nd=null;function GM(){var e=window.event;return e&&e.type==="popstate"?e===Nd?!1:(Nd=e,!0):(Nd=null,!1)}var Dd=typeof setTimeout=="function"?setTimeout:void 0,XM=typeof clearTimeout=="function"?clearTimeout:void 0,O_=typeof Promise=="function"?Promise:void 0,P_=typeof requestAnimationFrame=="function"?requestAnimationFrame:Dd,kM=typeof queueMicrotask=="function"?queueMicrotask:typeof O_<"u"?function(e){return O_.resolve(null).then(e).catch(WM)}:Dd;function WM(e){setTimeout(function(){throw e})}function hs(e){return e==="head"}function I_(e,n){var a=n,o=0;do{var u=a.nextSibling;if(e.removeChild(a),u&&u.nodeType===8)if(a=u.data,a==="/$"||a==="/&"){if(o===0){e.removeChild(u),no(n);return}o--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")o++;else if(a==="html")Fd(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,Fd(a);for(var h=a.firstChild;h;){var x=h.nextSibling,w=h.nodeName;h[Gt]||w==="SCRIPT"||w==="STYLE"||w==="LINK"&&h.rel.toLowerCase()==="stylesheet"||a.removeChild(h),h=x}}else a==="body"&&Fd(e.ownerDocument.body);a=u}while(a);no(n)}function z_(e,n){var a=e;e=0;do{var o=a.nextSibling;if(a.nodeType===1?n?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(n?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),o&&o.nodeType===8)if(a=o.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=o}while(a)}function B_(e,n,a){if(n=CSS.escape(n)!==n?"r-"+btoa(n).replace(/=/g,""):n,e.style.viewTransitionName=n,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(n=e.getClientRects(),n.length===1)var o=1;else for(var u=o=0;u<n.length;u++){var h=n[u];0<h.width&&0<h.height&&o++}o===1&&(e=e.style,e.display=n.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function F_(e,n){e=e.style,n=n.style;var a=n!=null?n.hasOwnProperty("viewTransitionName")?n.viewTransitionName:n.hasOwnProperty("view-transition-name")?n["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=n!=null?n.hasOwnProperty("viewTransitionClass")?n.viewTransitionClass:n.hasOwnProperty("view-transition-class")?n["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(n==null?e.display=e.margin="":(a=n.display,e.display=a==null||typeof a=="boolean"?"":a,a=n.margin,a!=null?e.margin=a:(a=n.hasOwnProperty("marginTop")?n.marginTop:n["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,n=n.hasOwnProperty("marginBottom")?n.marginBottom:n["margin-bottom"],e.marginBottom=n==null||typeof n=="boolean"?"":n)))}function qM(e,n,a){return a=a.ownerDocument.defaultView,{rect:e,abs:n.position==="absolute"||n.position==="fixed",clip:n.clipPath!=="none"||n.overflow!=="visible"||n.filter!=="none"||n.mask!=="none"||n.mask!=="none"||n.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function Ld(e){var n=e.getBoundingClientRect(),a=getComputedStyle(e);return qM(n,a,e)}function YM(e){return e.documentElement.clientHeight}function ZM(e){this.addEventListener("load",e),this.addEventListener("error",e)}function KM(e,n,a,o,u,h,x,w,B){var nt=n.nodeType===9?n:n.ownerDocument;try{var dt=nt.startViewTransition({update:function(){var $=nt.defaultView,ht=$.navigation&&$.navigation.transition,Xt=nt.fonts.status;o();var le=[];if(Xt==="loaded"&&(YM(nt),nt.fonts.status==="loading"&&le.push(nt.fonts.ready)),Xt=le.length,e!==null)for(var Ae=e.suspenseyImages,et=0,q=0;q<Ae.length;q++){var ot=Ae[q];if(!ot.complete){var Et=ot.getBoundingClientRect();if(0<Et.bottom&&0<Et.right&&Et.top<$.innerHeight&&Et.left<$.innerWidth){if(et+=rx(ot),et>vu){le.length=Xt;break}ot=new Promise(ZM.bind(ot)),le.push(ot)}}}if(0<le.length)return $=Promise.race([Promise.all(le),new Promise(function(ne){return setTimeout(ne,500)})]).then(u,u),(ht?Promise.allSettled([ht.finished,$]):$).then(h,h);if(u(),ht)return ht.finished.then(h,h);h()},types:a});nt.__reactViewTransition=dt;var bt=[];return dt.ready.then(function(){for(var $=nt.documentElement.getAnimations({subtree:!0}),ht=0;ht<$.length;ht++){var Xt=$[ht],le=Xt.effect,Ae=le.pseudoElement;if(Ae!=null&&Ae.startsWith("::view-transition")){bt.push(Xt),Xt=le.getKeyframes();for(var et=Ae=void 0,q=!0,ot=0;ot<Xt.length;ot++){var Et=Xt[ot],ne=Et.width;if(Ae===void 0)Ae=ne;else if(Ae!==ne){q=!1;break}if(ne=Et.height,et===void 0)et=ne;else if(et!==ne){q=!1;break}delete Et.width,delete Et.height,Et.transform==="none"&&delete Et.transform}q&&Ae!==void 0&&et!==void 0&&(le.setKeyframes(Xt),q=getComputedStyle(le.target,le.pseudoElement),q.width!==Ae||q.height!==et)&&(q=Xt[0],q.width=Ae,q.height=et,q=Xt[Xt.length-1],q.width=Ae,q.height=et,le.setKeyframes(Xt))}}x()},function($){nt.__reactViewTransition===dt&&(nt.__reactViewTransition=null);try{if(typeof $=="object"&&$!==null)switch($.name){case"InvalidStateError":($.message==="View transition was skipped because document visibility state is hidden."||$.message==="Skipping view transition because document visibility state has become hidden."||$.message==="Skipping view transition because viewport size changed."||$.message==="Transition was aborted because of invalid state")&&($=null)}$!==null&&B($)}finally{o(),u(),x()}}),dt.finished.finally(function(){for(var $=0;$<bt.length;$++)bt[$].cancel();nt.__reactViewTransition===dt&&(nt.__reactViewTransition=null),w()}),dt}catch{return o(),u(),x(),null}}function Zs(e,n){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+n+")"}Zs.prototype.animate=function(e,n){return n=typeof n=="number"?{duration:n}:P({},n),n.pseudoElement=this._selector,this._scope.animate(e,n)},Zs.prototype.getAnimations=function(){for(var e=this._scope,n=this._selector,a=e.getAnimations({subtree:!0}),o=[],u=0;u<a.length;u++){var h=a[u].effect;h!==null&&h.target===e&&h.pseudoElement===n&&o.push(a[u])}return o},Zs.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function H_(e){return{name:e,group:new Zs("group",e),imagePair:new Zs("image-pair",e),old:new Zs("old",e),new:new Zs("new",e)}}function pi(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}pi.prototype.addEventListener=function(e,n,a){var o=null,u=null;if(!(a!=null&&typeof a!="boolean"&&(o=a.signal||null,o!==null&&o.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var h=this._eventListeners;if(G_(h,e,n,a)===-1){var x=this,w=n;a!=null&&typeof a!="boolean"&&a.once===!0&&(w=function(B){x.removeEventListener(e,n,a),typeof n=="function"?n.call(this,B):n.handleEvent(B)}),o!==null&&(u=x.removeEventListener.bind(x,e,n,a),o.addEventListener("abort",u,{once:!0}),u=o.removeEventListener.bind(o,"abort",u)),o=Jr(a),h.push({type:e,listener:n,optionsOrUseCapture:a,attachedListener:w,cleanup:u}),v(this._fragmentFiber.child,!1,JM,e,w,o)}this._eventListeners=h}};function JM(e,n,a,o){return M(e).addEventListener(n,a,o),!1}pi.prototype.removeEventListener=function(e,n,a){var o=this._eventListeners;if(o!==null&&(n=G_(o,e,n,a),n!==-1)){var u=o[n];a=u.attachedListener;var h=u.cleanup;u=Jr(u.optionsOrUseCapture),v(this._fragmentFiber.child,!1,QM,e,a,u),o.splice(n,1),h!==null&&h()}};function QM(e,n,a,o){return M(e).removeEventListener(n,a,o),!1}function Jr(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function V_(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function G_(e,n,a,o){if(e.length===0)return-1;o=V_(o);for(var u=0;u<e.length;u++){var h=e[u];if(h.type===n&&h.listener===a&&V_(h.optionsOrUseCapture)===o)return u}return-1}pi.prototype.dispatchEvent=function(e){var n=g(this._fragmentFiber);if(n===null)return!0;n=M(n);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var o=n.nodeType===9?n.createComment(""):document.createTextNode("");if(a)for(var u=0;u<a.length;u++){var h=a[u];o.addEventListener(h.type,h.attachedListener,Jr(h.optionsOrUseCapture))}if(n.appendChild(o),e=o.dispatchEvent(e),a)for(u=0;u<a.length;u++)h=a[u],o.removeEventListener(h.type,h.attachedListener,Jr(h.optionsOrUseCapture));return n.removeChild(o),e}return n.dispatchEvent(e)},pi.prototype.focus=function(e){v(this._fragmentFiber.child,!0,X_,e,void 0,void 0)};function X_(e,n){return e.tag===6?!1:(e=M(e),cE(e,n))}pi.prototype.focusLast=function(e){var n=[];v(this._fragmentFiber.child,!0,Ud,n,void 0,void 0);for(var a=n.length-1;0<=a&&!X_(n[a],e);a--);};function Ud(e,n){return n.push(e),!1}pi.prototype.blur=function(){var e=g(this._fragmentFiber);e!==null&&(e=M(e),e=_l(e).activeElement,e!==null&&v(this._fragmentFiber.child,!1,jM,e,void 0,void 0))};function jM(e,n){return e.tag===6?!1:(e=M(e),e===n||e.contains(n)?(n.blur(),!0):!1)}pi.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),v(this._fragmentFiber.child,!1,$M,e,void 0,void 0)};function $M(e,n){return e.tag===6||(e=M(e),n.observe(e)),!1}pi.prototype.unobserveUsing=function(e){var n=this._observers;if(n!==null&&n.has(e)){n.delete(e),v(this._fragmentFiber.child,!1,tE,e,void 0,void 0);for(var a=n=0;a<Pi.length;a++){var o=Pi[a];o.fragmentInstance===this&&o.observer===e?e.unobserve(o.instance):Pi[n++]=o}Pi.length=n}};function tE(e,n){return e.tag===6||(e=M(e),n.unobserve(e)),!1}var Pi=[],Od=!1;function eE(e,n,a){Pi.push({fragmentInstance:e,observer:n,instance:a}),Od||(Od=!0,uE(function(){Od=!1;var o=Pi;Pi=[];for(var u=0;u<o.length;u++){var h=o[u];h.observer.unobserve(h.instance)}}))}pi.prototype.getClientRects=function(){var e=[];return v(this._fragmentFiber.child,!1,nE,e,void 0,void 0),e};function nE(e,n){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),n.push.apply(n,a.getClientRects())}else e=M(e),n.push.apply(n,e.getClientRects());return!1}pi.prototype.getRootNode=function(e){var n=g(this._fragmentFiber);return n===null?this:M(n).getRootNode(e)},pi.prototype.compareDocumentPosition=function(e){var n=g(this._fragmentFiber);if(n===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];v(this._fragmentFiber.child,!1,Ud,a,void 0,void 0);var o=M(n);if(a.length===0){if(a=o,y(this._fragmentFiber)){t:{for(n=this._fragmentFiber.return;n!==null;){if(n.tag===4){n=n.stateNode.containerInfo;break t}if(n.tag===3||n.tag===5||n.tag===27)break;n=n.return}n=null}n!=null&&(a=n)}n=this._fragmentFiber;var u=o=a.compareDocumentPosition(e);return a===e?u=Node.DOCUMENT_POSITION_CONTAINS:o&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=b(n)[1],a===null?u=Node.DOCUMENT_POSITION_PRECEDING:(e=M(a).compareDocumentPosition(e),u=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),u|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}n=M(a[0]),u=M(a[a.length-1]);var h=y(this._fragmentFiber)?n.parentElement:o;if(h==null)return Node.DOCUMENT_POSITION_DISCONNECTED;o=h.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_CONTAINED_BY,h=h.compareDocumentPosition(u)&Node.DOCUMENT_POSITION_CONTAINED_BY;var x=n.compareDocumentPosition(e),w=u.compareDocumentPosition(e),B=x&Node.DOCUMENT_POSITION_CONTAINED_BY||w&Node.DOCUMENT_POSITION_CONTAINED_BY;return w=o&&h&&x&Node.DOCUMENT_POSITION_FOLLOWING&&w&Node.DOCUMENT_POSITION_PRECEDING,n=o&&n===e||h&&u===e||B||w?Node.DOCUMENT_POSITION_CONTAINED_BY:!o&&n===e||!h&&u===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:x,n&Node.DOCUMENT_POSITION_DISCONNECTED||n&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||iE(n,this._fragmentFiber,a[0],a[a.length-1],e)?n:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function iE(e,n,a,o,u){var h=ve(u);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!h)t:{for(;h!==null;){if(h.tag===7&&(h===n||h.alternate===n)){a=!0;break t}h=h.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(h===null)return h=u.ownerDocument,u===h||u===h.documentElement||u===h.body;t:{for(h=n,n=g(n);h!==null;){if(!(h.tag!==5&&h.tag!==3&&h.tag!==27||h!==n&&h.alternate!==n)){h=!0;break t}h=h.return}h=!1}return h}return e&Node.DOCUMENT_POSITION_PRECEDING?((n=!!h)&&!(n=h===a)&&(n=L(a,h,U),n===null?n=!1:(v(n,!0,I,h,a),h=S,S=null,n=h!==null)),n):e&Node.DOCUMENT_POSITION_FOLLOWING?((n=!!h)&&!(n=h===o)&&(n=L(o,h,U),n===null?n=!1:(v(n,!0,A,h,o),h=S,N=S=null,n=h!==null)),n):!1}function k_(e,n){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,n?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}pi.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(s(566));var n=[];v(this._fragmentFiber.child,!1,Ud,n,void 0,void 0);var a=e!==!1;if(n.length===0){var o=b(this._fragmentFiber);if(o=a?o[1]||o[0]||g(this._fragmentFiber):o[0]||o[1],o===null)return;if(o.tag===6){e=M(o),k_(e,a);return}if(o=M(o),o.nodeType!==9){if(o.nodeType===11){a="host"in o?o.host:null,a!==null&&a.scrollIntoView(e);return}o.scrollIntoView(e)}}for(o=a?n.length-1:0;o!==(a?-1:n.length);){var u=n[o];u.tag===6?(u=M(u),k_(u,a)):M(u).scrollIntoView(e),o+=a?-1:1}};function aE(e,n){return e=M(e),W_(e,n),!1}function W_(e,n){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(n)}function q_(e,n){var a=n._eventListeners;if(a!==null)for(var o=0;o<a.length;o++){var u=a[o];e.addEventListener(u.type,u.attachedListener,Jr(u.optionsOrUseCapture))}e.nodeType!==3&&(a=n._observers,a!==null&&a.forEach(function(h){for(var x=0,w=0;w<Pi.length;w++){var B=Pi[w];(B.fragmentInstance!==n||B.observer!==h||B.instance!==e)&&(Pi[x++]=B)}Pi.length=x,h.observe(e)}),W_(e,n))}function sE(e,n){var a=n._eventListeners;if(a!==null)for(var o=0;o<a.length;o++){var u=a[o];e.removeEventListener(u.type,u.attachedListener,Jr(u.optionsOrUseCapture))}e.nodeType!==3&&(a=n._observers,a!==null&&a.forEach(function(h){typeof h.rootMargin=="string"?eE(n,h,e):h.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(n))}function Pd(e){var n=e.firstChild;for(n&&n.nodeType===10&&(n=n.nextSibling);n;){var a=n;switch(n=n.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Pd(a),oe(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function rE(e,n,a,o){for(;e.nodeType===1;){var u=a;if(e.nodeName.toLowerCase()!==n.toLowerCase()){if(!o&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(o){if(!e[Gt])switch(n){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(h=e.getAttribute("rel"),h==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(h!==u.rel||e.getAttribute("href")!==(u.href==null||u.href===""?null:u.href)||e.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin)||e.getAttribute("title")!==(u.title==null?null:u.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(h=e.getAttribute("src"),(h!==(u.src==null?null:u.src)||e.getAttribute("type")!==(u.type==null?null:u.type)||e.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin))&&h&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(n==="input"&&e.type==="hidden"){var h=u.name==null?null:""+u.name;if(u.type==="hidden"&&e.getAttribute("name")===h)return e}else return e;if(e=Ri(e.nextSibling),e===null)break}return null}function oE(e,n,a){if(n==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=Ri(e.nextSibling),e===null))return null;return e}function Y_(e,n){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=Ri(e.nextSibling),e===null))return null;return e}function Id(e){return e.data==="$?"||e.data==="$~"}function zd(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function lE(e,n){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=n;else if(e.data!=="$?"||a.readyState!=="loading")n();else{var o=function(){n(),a.removeEventListener("DOMContentLoaded",o)};a.addEventListener("DOMContentLoaded",o),e._reactRetry=o}}function Ri(e){for(;e!=null;e=e.nextSibling){var n=e.nodeType;if(n===1||n===3)break;if(n===8){if(n=e.data,n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"||n==="F!"||n==="F")break;if(n==="/$"||n==="/&")return null}}return e}var Bd=null;function Z_(e){e=e.nextSibling;for(var n=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(n===0)return Ri(e.nextSibling);n--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||n++}e=e.nextSibling}return null}function K_(e){e=e.previousSibling;for(var n=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(n===0)return e;n--}else a!=="/$"&&a!=="/&"||n++}e=e.previousSibling}return null}function cE(e,n){function a(){o=!0}if(e.ownerDocument.activeElement===e)return!0;var o=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,n)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return o}function uE(e){P_(function(){P_(function(n){return e(n)})})}function J_(e,n,a){switch(n=_l(a),e){case"html":if(e=n.documentElement,!e)throw Error(s(452));return e;case"head":if(e=n.head,!e)throw Error(s(453));return e;case"body":if(e=n.body,!e)throw Error(s(454));return e;default:throw Error(s(451))}}function Q_(e,n,a){for(var o in a){var u=a[o];a.hasOwnProperty(o)&&u!=null&&Je(e,n,o,null,FM,u)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===qi&&(e.onclick=null),oe(e)}function Fd(e){for(var n=e.attributes;n.length;)e.removeAttributeNode(n[0]);oe(e)}var wi=new Map,j_=new Set;function xl(e){if(typeof e.getRootNode=="function"){var n=e.getRootNode();if(n.nodeType===9||n.nodeType===11)return n}return e.nodeType===9?e:e.ownerDocument}var Na=At.d;At.d={f:fE,r:hE,D:dE,C:pE,L:mE,m:gE,X:_E,S:vE,M:xE};function fE(){var e=Na.f(),n=lu();return e||n}function hE(e){var n=Me(e);n!==null&&n.tag===5&&n.type==="form"?tv(n):Na.r(e)}var Qr=typeof document>"u"?null:document;function $_(e,n,a){var o=Qr;if(o&&typeof n=="string"&&n){var u=Si(n);u='link[rel="'+e+'"][href="'+u+'"]',typeof a=="string"&&(u+='[crossorigin="'+a+'"]'),j_.has(u)||(j_.add(u),e={rel:e,crossOrigin:a,href:n},o.querySelector(u)===null&&(n=o.createElement("link"),Pn(n,"link",e),we(n),o.head.appendChild(n)))}}function dE(e){Na.D(e),$_("dns-prefetch",e,null)}function pE(e,n){Na.C(e,n),$_("preconnect",e,n)}function mE(e,n,a){Na.L(e,n,a);var o=Qr;if(o&&e&&n){var u='link[rel="preload"][as="'+Si(n)+'"]';n==="image"&&a&&a.imageSrcSet?(u+='[imagesrcset="'+Si(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(u+='[imagesizes="'+Si(a.imageSizes)+'"]')):u+='[href="'+Si(e)+'"]';var h=u;switch(n){case"style":h=jr(e);break;case"script":h=$r(e)}if(!(wi.has(h)||(e=P({rel:"preload",href:n==="image"&&a&&a.imageSrcSet?void 0:e,as:n},a),wi.set(h,e),o.querySelector(u)!==null||n==="style"&&o.querySelector(Sl(h))||n==="script"&&o.querySelector(yl(h))))){var x=o.createElement("link");Pn(x,"link",e),n==="style"&&(x[ae]=!0,x.onload=x.onerror=function(){je(x)}),we(x),o.head.appendChild(x)}}}function gE(e,n){Na.m(e,n);var a=Qr;if(a&&e){var o=n&&typeof n.as=="string"?n.as:"script",u='link[rel="modulepreload"][as="'+Si(o)+'"][href="'+Si(e)+'"]',h=u;switch(o){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":h=$r(e)}if(!wi.has(h)&&(e=P({rel:"modulepreload",href:e},n),wi.set(h,e),a.querySelector(u)===null)){switch(o){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(yl(h)))return}o=a.createElement("link"),Pn(o,"link",e),we(o),a.head.appendChild(o)}}}function vE(e,n,a){Na.S(e,n,a);var o=Qr;if(o&&e){var u=Le(o).hoistableStyles,h=jr(e);n=n||"default";var x=u.get(h);if(!x){var w={loading:0,preload:null};if(x=o.querySelector(Sl(h)))w.loading=5;else{e=P({rel:"stylesheet",href:e,"data-precedence":n},a),(a=wi.get(h))&&Hd(e,a);var B=x=o.createElement("link");we(B),Pn(B,"link",e),B._p=new Promise(function(nt,dt){B.onload=nt,B.onerror=dt}),B.addEventListener("load",function(){w.loading|=1}),B.addEventListener("error",function(){w.loading|=2}),w.loading|=4,mu(x,n,o)}x={type:"stylesheet",instance:x,count:1,state:w},u.set(h,x)}}}function _E(e,n){Na.X(e,n);var a=Qr;if(a&&e){var o=Le(a).hoistableScripts,u=$r(e),h=o.get(u);h||(h=a.querySelector(yl(u)),h||(e=P({src:e,async:!0},n),(n=wi.get(u))&&Vd(e,n),h=a.createElement("script"),we(h),Pn(h,"link",e),a.head.appendChild(h)),h={type:"script",instance:h,count:1,state:null},o.set(u,h))}}function xE(e,n){Na.M(e,n);var a=Qr;if(a&&e){var o=Le(a).hoistableScripts,u=$r(e),h=o.get(u);h||(h=a.querySelector(yl(u)),h||(e=P({src:e,async:!0,type:"module"},n),(n=wi.get(u))&&Vd(e,n),h=a.createElement("script"),we(h),Pn(h,"link",e),a.head.appendChild(h)),h={type:"script",instance:h,count:1,state:null},o.set(u,h))}}function tx(e,n,a,o){var u=(u=gt.current)?xl(u):null;if(!u)throw Error(s(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=jr(a.href),n=Le(u).hoistableStyles,o=n.get(a),o||(o={type:"style",instance:null,count:0,state:null},n.set(a,o)),o):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=jr(a.href);var h=Le(u).hoistableStyles,x=h.get(e);if(x||(u=u.ownerDocument||u,x={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},h.set(e,x),(h=u.querySelector(Sl(e)))?h._p||(x.instance=h,x.state.loading=5):(h=wi.get(e),h||(h={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},wi.set(e,h)),SE(u,e,h,x.state))),n&&o===null)throw Error(s(528,""));return x}if(n&&o!==null)throw Error(s(529,""));return null;case"script":return n=a.async,a=a.src,typeof a=="string"&&n&&typeof n!="function"&&typeof n!="symbol"?(a=$r(a),n=Le(u).hoistableScripts,o=n.get(a),o||(o={type:"script",instance:null,count:0,state:null},n.set(a,o)),o):{type:"void",instance:null,count:0,state:null};default:throw Error(s(444,e))}}function jr(e){return'href="'+Si(e)+'"'}function Sl(e){return'link[rel="stylesheet"]['+e+"]"}function ex(e){return P({},e,{"data-precedence":e.precedence,precedence:null})}function SE(e,n,a,o){if(n=e.querySelector('link[rel="preload"][as="style"]['+n+"]")){if(n[ae]!==!0){o.loading=1;return}}else n=e.createElement("link"),n[ae]=!0,n.onload=n.onerror=je.bind(null,n),Pn(n,"link",a),we(n),e.head.appendChild(n);o.preload=n,n.addEventListener("load",function(){return o.loading|=1}),n.addEventListener("error",function(){return o.loading|=2})}function $r(e){return'[src="'+Si(e)+'"]'}function yl(e){return"script[async]"+e}function nx(e,n,a){if(n.count++,n.instance===null)switch(n.type){case"style":var o=e.querySelector('style[data-href~="'+Si(a.href)+'"]');if(o)return n.instance=o,we(o),o;var u=P({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return o=(e.ownerDocument||e).createElement("style"),we(o),Pn(o,"style",u),mu(o,a.precedence,e),n.instance=o;case"stylesheet":u=jr(a.href);var h=e.querySelector(Sl(u));if(h)return n.state.loading|=4,n.instance=h,we(h),h;o=ex(a),(u=wi.get(u))&&Hd(o,u),h=(e.ownerDocument||e).createElement("link"),we(h);var x=h;return x._p=new Promise(function(w,B){x.onload=w,x.onerror=B}),Pn(h,"link",o),n.state.loading|=4,mu(h,a.precedence,e),n.instance=h;case"script":return h=$r(a.src),(u=e.querySelector(yl(h)))?(n.instance=u,we(u),u):(o=a,(u=wi.get(h))&&(o=P({},a),Vd(o,u)),e=e.ownerDocument||e,u=e.createElement("script"),we(u),Pn(u,"link",o),e.head.appendChild(u),n.instance=u);case"void":return null;default:throw Error(s(443,n.type))}else n.type==="stylesheet"&&(n.state.loading&4)===0&&(o=n.instance,n.state.loading|=4,mu(o,a.precedence,e));return n.instance}function mu(e,n,a){for(var o=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),u=o.length?o[o.length-1]:null,h=u,x=0;x<o.length;x++){var w=o[x];if(w.dataset.precedence===n)h=w;else if(h!==u)break}h?h.parentNode.insertBefore(e,h.nextSibling):(n=a.nodeType===9?a.head:a,n.insertBefore(e,n.firstChild))}function Hd(e,n){e.crossOrigin==null&&(e.crossOrigin=n.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=n.referrerPolicy),e.title==null&&(e.title=n.title)}function Vd(e,n){e.crossOrigin==null&&(e.crossOrigin=n.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=n.referrerPolicy),e.integrity==null&&(e.integrity=n.integrity)}var gu=null;function ix(e,n,a){if(gu===null){var o=new Map,u=gu=new Map;u.set(a,o)}else u=gu,o=u.get(a),o||(o=new Map,u.set(a,o));if(o.has(e))return o;for(o.set(e,null),a=a.getElementsByTagName(e),u=0;u<a.length;u++){var h=a[u];if(!(h[Gt]||h[R]||e==="link"&&h.getAttribute("rel")==="stylesheet")&&h.namespaceURI!=="http://www.w3.org/2000/svg"){var x=h.getAttribute(n)||"";x=e+x;var w=o.get(x);w?w.push(h):o.set(x,[h])}}return o}function Gd(e,n,a){e=e.ownerDocument||e,e.head.insertBefore(a,n==="title"?e.querySelector("head > title"):null)}function yE(e,n,a){if(a===1||n.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof n.precedence!="string"||typeof n.href!="string"||n.href==="")break;return!0;case"link":if(typeof n.rel!="string"||typeof n.href!="string"||n.href===""||n.onLoad||n.onError)break;switch(n.rel){case"stylesheet":return e=n.disabled,typeof n.precedence=="string"&&e==null;default:return!0}case"script":if(n.async&&typeof n.async!="function"&&typeof n.async!="symbol"&&!n.onLoad&&!n.onError&&n.src&&typeof n.src=="string")return!0}return!1}function ax(e,n){return e==="img"&&n.src!=null&&n.src!==""&&n.onLoad==null&&n.loading!=="lazy"}function sx(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function rx(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function ox(e,n){typeof n.decode=="function"&&(e.imgCount++,n.complete||(e.imgBytes+=rx(n),e.suspenseyImages.push(n)),e=bE.bind(e),n.decode().then(e,e))}function ME(e,n,a,o){if(a.type==="stylesheet"&&(typeof o.media!="string"||matchMedia(o.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var u=jr(o.href),h=n.querySelector(Sl(u));if(h){n=h._p,n!==null&&typeof n=="object"&&typeof n.then=="function"&&(e.count++,e=Ml.bind(e),n.then(e,e)),a.state.loading|=4,a.instance=h,we(h);return}h=n.ownerDocument||n,o=ex(o),(u=wi.get(u))&&Hd(o,u),h=h.createElement("link"),we(h);var x=h;x._p=new Promise(function(w,B){x.onload=w,x.onerror=B}),Pn(h,"link",o),a.instance=h}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,n),(n=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Ml.bind(e),n.addEventListener("load",a),n.addEventListener("error",a))}}var vu=0;function EE(e,n){return e.stylesheets&&e.count===0&&xu(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var o=setTimeout(function(){if(e.stylesheets&&xu(e,e.stylesheets),e.unsuspend){var h=e.unsuspend;e.unsuspend=null,h()}},6e4+n);0<e.imgBytes&&vu===0&&(vu=62500*VM());var u=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&xu(e,e.stylesheets),e.unsuspend)){var h=e.unsuspend;e.unsuspend=null,h()}},(e.imgBytes>vu?50:800)+n);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(o),clearTimeout(u)}}:null}function lx(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)xu(e,e.stylesheets);else if(e.unsuspend){var n=e.unsuspend;e.unsuspend=null,n()}}}function Ml(){this.count--,lx(this)}function bE(){this.imgCount--,lx(this)}var _u=null;function xu(e,n){e.stylesheets=null,e.unsuspend!==null&&(e.count++,_u=new Map,n.forEach(TE,e),_u=null,Ml.call(e))}function TE(e,n){if(!(n.state.loading&4)){var a=_u.get(e);if(a)var o=a.get(null);else{a=new Map,_u.set(e,a);for(var u=e.querySelectorAll("link[data-precedence],style[data-precedence]"),h=0;h<u.length;h++){var x=u[h];(x.nodeName==="LINK"||x.getAttribute("media")!=="not all")&&(a.set(x.dataset.precedence,x),o=x)}o&&a.set(null,o)}u=n.instance,x=u.getAttribute("data-precedence"),h=a.get(x)||o,h===o&&a.set(null,u),a.set(x,u),this.count++,o=Ml.bind(this),u.addEventListener("load",o),u.addEventListener("error",o),h?h.parentNode.insertBefore(u,h.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(u,e.firstChild)),n.state.loading|=4}}var to={$$typeof:j,Provider:null,Consumer:null,_currentValue:fe,_currentValue2:fe,_threadCount:0};function AE(e,n,a,o,u,h,x,w,B){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=vr(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=vr(0),this.hiddenUpdates=vr(null),this.identifierPrefix=o,this.onUncaughtError=u,this.onCaughtError=h,this.onRecoverableError=x,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=B,this.transitionTypes=null,this.incompleteTransitions=new Map}function cx(e,n,a,o,u,h,x,w,B,nt,dt,bt){return e=new AE(e,n,a,x,B,nt,dt,bt,w),n=1,h===!0&&(n|=24),h=Jn(3,null,null,n),e.current=h,h.stateNode=e,n=ih(),n.refCount++,e.pooledCache=n,n.refCount++,h.memoizedState={element:o,isDehydrated:a,cache:n},oh(h),e}function ux(e){return e?(e=Ar,e):Ar}function fx(e,n,a,o,u,h){u=ux(u),o.context===null?o.context=u:o.pendingContext=u,o=ts(n),o.payload={element:a},h=h===void 0?null:h,h!==null&&(o.callback=h),a=es(e,o,n),a!==null&&(ti(a,e,n),$o(a,e,n))}function hx(e,n){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<n?a:n}}function Xd(e,n){hx(e,n),(e=e.alternate)&&hx(e,n)}function dx(e){if(e.tag===13||e.tag===31){var n=Ds(e,67108864);n!==null&&ti(n,e,67108864),Xd(e,67108864)}}function px(e){if(e.tag===13||e.tag===31){var n=di();n=Io(n);var a=Ds(e,n);a!==null&&ti(a,e,n),Xd(e,n)}}var eo=!0;function RE(e,n,a,o){var u=rt.T;rt.T=null;var h=At.p;try{At.p=2,kd(e,n,a,o)}finally{At.p=h,rt.T=u}}function wE(e,n,a,o){var u=rt.T;rt.T=null;var h=At.p;try{At.p=8,kd(e,n,a,o)}finally{At.p=h,rt.T=u}}function kd(e,n,a,o){if(eo){var u=Wd(o);if(u===null)Td(e,n,o,Su,a),gx(e,o);else if(NE(u,e,n,a,o))o.stopPropagation();else if(gx(e,o),n&4&&-1<CE.indexOf(e)){for(;u!==null;){var h=Me(u);if(h!==null)switch(h.tag){case 3:if(h=h.stateNode,h.current.memoizedState.isDehydrated){var x=ga(h.pendingLanes);if(x!==0){var w=h;for(w.pendingLanes|=2,w.entangledLanes|=2;x;){var B=1<<31-ye(x);w.entanglements[1]|=B,x&=~B}na(h),(ke&6)===0&&(su=$t()+500,ml(0))}}break;case 31:case 13:w=Ds(h,2),w!==null&&ti(w,h,2),lu(),Xd(h,2)}if(h=Wd(o),h===null&&Td(e,n,o,Su,a),h===u)break;u=h}u!==null&&o.stopPropagation()}else Td(e,n,o,null,a)}}function Wd(e){return e=Nf(e),qd(e)}var Su=null;function qd(e){if(Su=null,e=ve(e),e!==null){var n=c(e);if(n===null)e=null;else{var a=n.tag;if(a===13){if(e=f(n),e!==null)return e;e=null}else if(a===31){if(e=d(n),e!==null)return e;e=null}else if(a===3){if(n.stateNode.current.memoizedState.isDehydrated)return n.tag===3?n.stateNode.containerInfo:null;e=null}else n!==e&&(e=null)}}return Su=e,null}function mx(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(me()){case Se:return 2;case Z:return 8;case Ft:case Tt:return 32;case Vt:return 268435456;default:return 32}default:return 32}}var Yd=!1,ds=null,ps=null,ms=null,El=new Map,bl=new Map,gs=[],CE="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function gx(e,n){switch(e){case"focusin":case"focusout":ds=null;break;case"dragenter":case"dragleave":ps=null;break;case"mouseover":case"mouseout":ms=null;break;case"pointerover":case"pointerout":El.delete(n.pointerId);break;case"gotpointercapture":case"lostpointercapture":bl.delete(n.pointerId)}}function Tl(e,n,a,o,u,h){return e===null||e.nativeEvent!==h?(e={blockedOn:n,domEventName:a,eventSystemFlags:o,nativeEvent:h,targetContainers:[u]},n!==null&&(n=Me(n),n!==null&&dx(n)),e):(e.eventSystemFlags|=o,n=e.targetContainers,u!==null&&n.indexOf(u)===-1&&n.push(u),e)}function NE(e,n,a,o,u){switch(n){case"focusin":return ds=Tl(ds,e,n,a,o,u),!0;case"dragenter":return ps=Tl(ps,e,n,a,o,u),!0;case"mouseover":return ms=Tl(ms,e,n,a,o,u),!0;case"pointerover":var h=u.pointerId;return El.set(h,Tl(El.get(h)||null,e,n,a,o,u)),!0;case"gotpointercapture":return h=u.pointerId,bl.set(h,Tl(bl.get(h)||null,e,n,a,o,u)),!0}return!1}function vx(e){var n=ve(e.target);if(n!==null){var a=c(n);if(a!==null){if(n=a.tag,n===13){if(n=f(a),n!==null){e.blockedOn=n,rc(e.priority,function(){px(a)});return}}else if(n===31){if(n=d(a),n!==null){e.blockedOn=n,rc(e.priority,function(){px(a)});return}}else if(n===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function yu(e){if(e.blockedOn!==null)return!1;for(var n=e.targetContainers;0<n.length;){var a=Wd(e.nativeEvent);if(a===null){a=e.nativeEvent;var o=new a.constructor(a.type,a);Cf=o,a.target.dispatchEvent(o),Cf=null}else return n=Me(a),n!==null&&dx(n),e.blockedOn=a,!1;n.shift()}return!0}function _x(e,n,a){yu(e)&&a.delete(n)}function DE(){Yd=!1,ds!==null&&yu(ds)&&(ds=null),ps!==null&&yu(ps)&&(ps=null),ms!==null&&yu(ms)&&(ms=null),El.forEach(_x),bl.forEach(_x)}function Mu(e,n){e.blockedOn===n&&(e.blockedOn=null,Yd||(Yd=!0,r.unstable_scheduleCallback(r.unstable_NormalPriority,DE)))}var Eu=null;function xx(e){Eu!==e&&(Eu=e,r.unstable_scheduleCallback(r.unstable_NormalPriority,function(){Eu===e&&(Eu=null);for(var n=0;n<e.length;n+=3){var a=e[n],o=e[n+1],u=e[n+2];if(typeof o!="function"){if(qd(o||a)===null)continue;break}var h=Me(a);h!==null&&(e.splice(n,3),n-=3,wh(h,{pending:!0,data:u,method:a.method,action:o},o,u))}}))}function no(e){function n(B){return Mu(B,e)}ds!==null&&Mu(ds,e),ps!==null&&Mu(ps,e),ms!==null&&Mu(ms,e),El.forEach(n),bl.forEach(n);for(var a=0;a<gs.length;a++){var o=gs[a];o.blockedOn===e&&(o.blockedOn=null)}for(;0<gs.length&&(a=gs[0],a.blockedOn===null);)vx(a),a.blockedOn===null&&gs.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(o=0;o<a.length;o+=3){var u=a[o],h=a[o+1],x=u[W]||null;if(typeof h=="function")x||xx(a);else if(x){var w=null;if(h&&h.hasAttribute("formAction")){if(u=h,x=h[W]||null)w=x.formAction;else if(qd(u)!==null)continue}else w=x.action;typeof w=="function"?a[o+1]=w:(a.splice(o,3),o-=3),xx(a)}}}function Sx(){function e(h){h.canIntercept&&h.info==="react-transition"&&h.intercept({handler:function(){return new Promise(function(x){return u=x})},focusReset:"manual",scroll:"manual"})}function n(){u!==null&&(u(),u=null),o||setTimeout(a,20)}function a(){if(!o&&!navigation.transition){var h=navigation.currentEntry;h&&h.url!=null&&navigation.navigate(h.url,{state:h.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var o=!1,u=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",n),navigation.addEventListener("navigateerror",n),setTimeout(a,100),function(){o=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",n),navigation.removeEventListener("navigateerror",n),u!==null&&(u(),u=null)}}}function Zd(e){this._internalRoot=e}bu.prototype.render=Zd.prototype.render=function(e){var n=this._internalRoot;if(n===null)throw Error(s(409));var a=n.current,o=di();fx(a,o,e,n,null,null)},bu.prototype.unmount=Zd.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var n=e.containerInfo;fx(e.current,2,null,e,null,null),lu(),n[mt]=null}};function bu(e){this._internalRoot=e}bu.prototype.unstable_scheduleHydration=function(e){if(e){var n=sc();e={blockedOn:null,target:e,priority:n};for(var a=0;a<gs.length&&n!==0&&n<gs[a].priority;a++);gs.splice(a,0,e),a===0&&vx(e)}};var yx=t.version;if(yx!=="19.3.1")throw Error(s(527,yx,"19.3.1"));At.findDOMNode=function(e){var n=e._reactInternals;if(n===void 0)throw typeof e.render=="function"?Error(s(188)):(e=Object.keys(e).join(","),Error(s(268,e)));return e=p(n),e=e!==null?_(e):null,e=e===null?null:e.stateNode,e};var LE={bundleType:0,version:"19.3.1",rendererPackageName:"react-dom",currentDispatcherRef:rt,reconcilerVersion:"19.3.1"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Tu=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Tu.isDisabled&&Tu.supportsFiber)try{ue=Tu.inject(LE),Qt=Tu}catch{}}return Rl.createRoot=function(e,n){if(!l(e))throw Error(s(299));var a=!1,o="",u=uv,h=fv,x=hv;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(o=n.identifierPrefix),n.onUncaughtError!==void 0&&(u=n.onUncaughtError),n.onCaughtError!==void 0&&(h=n.onCaughtError),n.onRecoverableError!==void 0&&(x=n.onRecoverableError)),n=cx(e,1,!1,null,null,a,o,null,u,h,x,Sx),e[mt]=n.current,bd(e),new Zd(n)},Rl.hydrateRoot=function(e,n,a){if(!l(e))throw Error(s(299));var o=!1,u="",h=uv,x=fv,w=hv,B=null;return a!=null&&(a.unstable_strictMode===!0&&(o=!0),a.identifierPrefix!==void 0&&(u=a.identifierPrefix),a.onUncaughtError!==void 0&&(h=a.onUncaughtError),a.onCaughtError!==void 0&&(x=a.onCaughtError),a.onRecoverableError!==void 0&&(w=a.onRecoverableError),a.formState!==void 0&&(B=a.formState)),n=cx(e,1,!0,n,a??null,o,u,B,h,x,w,Sx),n.context=ux(null),a=n.current,o=di(),o=Io(o),u=ts(o),u.callback=null,es(a,u,o),a=o,n.current.lanes=a,ki(n,a),na(n),e[mt]=n.current,bd(e),new bu(n)},Rl.version="19.3.1",Rl}var Dx;function GE(){if(Dx)return Jd.exports;Dx=1;function r(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(r)}catch(t){console.error(t)}}return r(),Jd.exports=VE(),Jd.exports}var XE=GE(),Mt=Fm();const kE=new Map([["bold",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M228,128a100,100,0,0,1-98.66,100H128a99.39,99.39,0,0,1-68.62-27.29,12,12,0,0,1,16.48-17.45,76,76,0,1,0-1.57-109c-.13.13-.25.25-.39.37L54.89,92H72a12,12,0,0,1,0,24H24a12,12,0,0,1-12-12V56a12,12,0,0,1,24,0V76.72L57.48,57.06A100,100,0,0,1,228,128Z"}))],["duotone",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z",opacity:"0.2"}),Mt.createElement("path",{d:"M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z"}))],["fill",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L60.63,81.29l17,17A8,8,0,0,1,72,112H24a8,8,0,0,1-8-8V56A8,8,0,0,1,29.66,50.3L49.31,70,60.25,60A96,96,0,0,1,224,128Z"}))],["light",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M222,128a94,94,0,0,1-92.74,94H128a93.43,93.43,0,0,1-64.5-25.65,6,6,0,1,1,8.24-8.72A82,82,0,1,0,70,70l-.19.19L39.44,98H72a6,6,0,0,1,0,12H24a6,6,0,0,1-6-6V56a6,6,0,0,1,12,0V90.34L61.63,61.4A94,94,0,0,1,222,128Z"}))],["regular",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L44.59,96H72a8,8,0,0,1,0,16H24a8,8,0,0,1-8-8V56a8,8,0,0,1,16,0V85.8L60.25,60A96,96,0,0,1,224,128Z"}))],["thin",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M220,128a92,92,0,0,1-90.77,92H128a91.47,91.47,0,0,1-63.13-25.1,4,4,0,1,1,5.5-5.82A84,84,0,1,0,68.6,68.57l-.13.12L34.3,100H72a4,4,0,0,1,0,8H24a4,4,0,0,1-4-4V56a4,4,0,0,1,8,0V94.89l35-32A92,92,0,0,1,220,128Z"}))]]),WE=new Map([["bold",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M228,48V96a12,12,0,0,1-12,12H168a12,12,0,0,1,0-24h19l-7.8-7.8a75.55,75.55,0,0,0-53.32-22.26h-.43A75.49,75.49,0,0,0,72.39,75.57,12,12,0,1,1,55.61,58.41a99.38,99.38,0,0,1,69.87-28.47H126A99.42,99.42,0,0,1,196.2,59.23L204,67V48a12,12,0,0,1,24,0ZM183.61,180.43a75.49,75.49,0,0,1-53.09,21.63h-.43A75.55,75.55,0,0,1,76.77,179.8L69,172H88a12,12,0,0,0,0-24H40a12,12,0,0,0-12,12v48a12,12,0,0,0,24,0V189l7.8,7.8A99.42,99.42,0,0,0,130,226.06h.56a99.38,99.38,0,0,0,69.87-28.47,12,12,0,0,0-16.78-17.16Z"}))],["duotone",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M216,128a88,88,0,1,1-88-88A88,88,0,0,1,216,128Z",opacity:"0.2"}),Mt.createElement("path",{d:"M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"}))],["fill",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1-5.66-13.66L180.65,72a79.48,79.48,0,0,0-54.72-22.09h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27,96,96,0,0,1,192,60.7l18.36-18.36A8,8,0,0,1,224,48ZM186.41,183.29A80,80,0,0,1,75.35,184l18.31-18.31A8,8,0,0,0,88,152H40a8,8,0,0,0-8,8v48a8,8,0,0,0,13.66,5.66L64,195.3a95.42,95.42,0,0,0,66,26.76h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"}))],["light",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M222,48V96a6,6,0,0,1-6,6H168a6,6,0,0,1,0-12h33.52L183.47,72a81.51,81.51,0,0,0-57.53-24h-.46A81.5,81.5,0,0,0,68.19,71.28a6,6,0,1,1-8.38-8.58,93.38,93.38,0,0,1,65.67-26.76H126a93.45,93.45,0,0,1,66,27.53l18,18V48a6,6,0,0,1,12,0ZM187.81,184.72a81.5,81.5,0,0,1-57.29,23.34h-.46a81.51,81.51,0,0,1-57.53-24L54.48,166H88a6,6,0,0,0,0-12H40a6,6,0,0,0-6,6v48a6,6,0,0,0,12,0V174.48l18,18.05a93.45,93.45,0,0,0,66,27.53h.52a93.38,93.38,0,0,0,65.67-26.76,6,6,0,1,0-8.38-8.58Z"}))],["regular",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z"}))],["thin",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M220,48V96a4,4,0,0,1-4,4H168a4,4,0,0,1,0-8h38.34L184.89,70.54A84,84,0,0,0,66.8,69.85a4,4,0,1,1-5.6-5.72,92,92,0,0,1,129.34.76L212,86.34V48a4,4,0,0,1,8,0ZM189.2,186.15a83.44,83.44,0,0,1-58.68,23.91h-.47a83.52,83.52,0,0,1-58.94-24.6L49.66,164H88a4,4,0,0,0,0-8H40a4,4,0,0,0-4,4v48a4,4,0,0,0,8,0V169.66l21.46,21.45A91.43,91.43,0,0,0,130,218.06h.51a91.45,91.45,0,0,0,64.28-26.19,4,4,0,1,0-5.6-5.72Z"}))]]),qE=new Map([["bold",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M208,52H182.42L170,33.34A12,12,0,0,0,160,28H96a12,12,0,0,0-10,5.34L73.57,52H48A28,28,0,0,0,20,80V192a28,28,0,0,0,28,28H208a28,28,0,0,0,28-28V80A28,28,0,0,0,208,52Zm4,140a4,4,0,0,1-4,4H48a4,4,0,0,1-4-4V80a4,4,0,0,1,4-4H80a12,12,0,0,0,10-5.34L102.42,52h51.15L166,70.66A12,12,0,0,0,176,76h32a4,4,0,0,1,4,4Zm-32-92v20a12,12,0,0,1-12,12H148a12,12,0,0,1-7.76-21.14,28.07,28.07,0,0,0-29,2.73A12,12,0,0,1,96.79,94.4a52.28,52.28,0,0,1,61.14-.91A12,12,0,0,1,180,100Zm-18.41,52.8a12,12,0,0,1-2.38,16.8,51.71,51.71,0,0,1-31.13,10.34,52.3,52.3,0,0,1-30-9.44A12,12,0,0,1,76,164V144a12,12,0,0,1,12-12h20a12,12,0,0,1,7.76,21.14,28.07,28.07,0,0,0,29-2.73A12,12,0,0,1,161.59,152.8Z"}))],["duotone",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M224,80V192a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V80A16,16,0,0,1,48,64H80L96,40h64l16,24h32A16,16,0,0,1,224,80Z",opacity:"0.2"}),Mt.createElement("path",{d:"M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM176,96v24a8,8,0,0,1-8,8H144a8,8,0,0,1,0-16h5.15a32.12,32.12,0,0,0-40.34-1.61A8,8,0,0,1,99.19,97.6,48.21,48.21,0,0,1,160,100.23V96a8,8,0,0,1,16,0Zm-17.61,59.2a8,8,0,0,1-1.58,11.2A48.21,48.21,0,0,1,96,163.77V168a8,8,0,0,1-16,0V144a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16h-5.15a32.12,32.12,0,0,0,40.34,1.61A8,8,0,0,1,158.39,155.2Z"}))],["fill",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56ZM156.81,166.4A48.21,48.21,0,0,1,96,163.77V168a8,8,0,0,1-16,0V144a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16h-5.15a32.12,32.12,0,0,0,40.34,1.61,8,8,0,0,1,9.62,12.79ZM176,120a8,8,0,0,1-8,8H144a8,8,0,0,1,0-16h5.15a32.12,32.12,0,0,0-40.34-1.61A8,8,0,0,1,99.19,97.6,48.21,48.21,0,0,1,160,100.23V96a8,8,0,0,1,16,0Z"}))],["light",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M208,58H179.21L165,36.67A6,6,0,0,0,160,34H96a6,6,0,0,0-5,2.67L76.78,58H48A22,22,0,0,0,26,80V192a22,22,0,0,0,22,22H208a22,22,0,0,0,22-22V80A22,22,0,0,0,208,58Zm10,134a10,10,0,0,1-10,10H48a10,10,0,0,1-10-10V80A10,10,0,0,1,48,70H80a6,6,0,0,0,5-2.67L99.21,46h57.57L171,67.33A6,6,0,0,0,176,70h32a10,10,0,0,1,10,10ZM174,96v24a6,6,0,0,1-6,6H144a6,6,0,0,1,0-12h10l-2-2.09a34.12,34.12,0,0,0-44.38-3.12,6,6,0,1,1-7.22-9.59,46.2,46.2,0,0,1,60.14,4.27.47.47,0,0,0,.1.1L162,105V96a6,6,0,0,1,12,0Zm-17.2,60.4a6,6,0,0,1-1.19,8.4,46.18,46.18,0,0,1-60.14-4.27l-.1-.1L94,159v9a6,6,0,0,1-12,0V144a6,6,0,0,1,6-6h24a6,6,0,0,1,0,12H102l2,2.09a34.12,34.12,0,0,0,44.38,3.12A6,6,0,0,1,156.8,156.4Z"}))],["regular",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM176,96v24a8,8,0,0,1-8,8H144a8,8,0,0,1,0-16h5.15a32.12,32.12,0,0,0-40.34-1.61A8,8,0,0,1,99.19,97.6,48.21,48.21,0,0,1,160,100.23V96a8,8,0,0,1,16,0Zm-17.61,59.2a8,8,0,0,1-1.58,11.2A48.21,48.21,0,0,1,96,163.77V168a8,8,0,0,1-16,0V144a8,8,0,0,1,8-8h24a8,8,0,0,1,0,16h-5.15a32.12,32.12,0,0,0,40.34,1.61A8,8,0,0,1,158.39,155.2Z"}))],["thin",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M208,60H178.13L163.32,37.78A4,4,0,0,0,160,36H96a4,4,0,0,0-3.32,1.78L77.85,60H48A20,20,0,0,0,28,80V192a20,20,0,0,0,20,20H208a20,20,0,0,0,20-20V80A20,20,0,0,0,208,60Zm12,132a12,12,0,0,1-12,12H48a12,12,0,0,1-12-12V80A12,12,0,0,1,48,68H80a4,4,0,0,0,3.33-1.78L98.13,44h59.72l14.82,22.22A4,4,0,0,0,176,68h32a12,12,0,0,1,12,12ZM172,96v24a4,4,0,0,1-4,4H144a4,4,0,0,1,0-8h14.66l-5.27-5.52a36.12,36.12,0,0,0-47-3.29,4,4,0,1,1-4.8-6.39,44.17,44.17,0,0,1,57.51,4.09L164,110V96a4,4,0,0,1,8,0Zm-16.8,61.6a4,4,0,0,1-.8,5.6,44.15,44.15,0,0,1-57.51-4.09L92,154v14a4,4,0,0,1-8,0V144a4,4,0,0,1,4-4h24a4,4,0,0,1,0,8H97.34l5.27,5.52a36.12,36.12,0,0,0,47,3.29A4,4,0,0,1,155.2,157.6Z"}))]]),YE=new Map([["bold",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M246.81,111.29,158.63,55.12A19.91,19.91,0,0,0,128,71.84v30L54.63,55.12A19.91,19.91,0,0,0,24,71.84V184.16a19.93,19.93,0,0,0,30.63,16.72L128,154.15v30a19.93,19.93,0,0,0,30.63,16.72l88.18-56.17a19.79,19.79,0,0,0,0-33.42ZM48,176.64V79.36L124.38,128Zm104,0V79.36L228.38,128Z"}))],["duotone",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M144,128a7.76,7.76,0,0,1-3.63,6.59L52.18,190.74A7.91,7.91,0,0,1,40,184.15V71.85a7.91,7.91,0,0,1,12.18-6.59l88.19,56.15A7.76,7.76,0,0,1,144,128Zm100.37-6.59L156.18,65.26A7.91,7.91,0,0,0,144,71.85v112.3a7.91,7.91,0,0,0,12.18,6.59l88.19-56.15A7.8,7.8,0,0,0,244.37,121.41Z",opacity:"0.2"}),Mt.createElement("path",{d:"M248.67,114.66,160.48,58.5A15.91,15.91,0,0,0,136,71.84v37.3L56.48,58.5A15.91,15.91,0,0,0,32,71.84V184.16A15.92,15.92,0,0,0,56.48,197.5L136,146.86v37.3a15.92,15.92,0,0,0,24.48,13.34l88.19-56.16a15.8,15.8,0,0,0,0-26.68ZM48,183.94V72.07L135.82,128Zm104,0V72.07L239.82,128Z"}))],["fill",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M256,128a15.76,15.76,0,0,1-7.33,13.34L160.48,197.5A15.91,15.91,0,0,1,136,184.16v-37.3L56.48,197.5A15.91,15.91,0,0,1,32,184.16V71.84A15.91,15.91,0,0,1,56.48,58.5L136,109.14V71.84A15.91,15.91,0,0,1,160.48,58.5l88.19,56.16A15.76,15.76,0,0,1,256,128Z"}))],["light",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M247.59,116.35,159.41,60.18a14,14,0,0,0-14.22-.46A13.83,13.83,0,0,0,138,71.84v41L55.41,60.18a14,14,0,0,0-14.22-.46A13.83,13.83,0,0,0,34,71.84V184.16a13.83,13.83,0,0,0,7.19,12.12,14,14,0,0,0,14.22-.46L138,143.21v40.95a13.83,13.83,0,0,0,7.19,12.12,14,14,0,0,0,14.22-.46l88.18-56.17a13.79,13.79,0,0,0,0-23.3ZM137.15,129.53,49,185.69a1.9,1.9,0,0,1-2,.06,1.73,1.73,0,0,1-1-1.59V71.84a1.73,1.73,0,0,1,1-1.59,2,2,0,0,1,1-.26,1.87,1.87,0,0,1,1,.32l88.19,56.16a1.8,1.8,0,0,1,0,3.06Zm104,0L153,185.69a1.9,1.9,0,0,1-2,.06,1.73,1.73,0,0,1-1-1.59V71.84a1.73,1.73,0,0,1,1-1.59,2,2,0,0,1,1-.26,1.87,1.87,0,0,1,1,.32l88.19,56.16a1.8,1.8,0,0,1,0,3.06Z"}))],["regular",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M248.67,114.66,160.48,58.5A15.91,15.91,0,0,0,136,71.84v37.3L56.48,58.5A15.91,15.91,0,0,0,32,71.84V184.16A15.92,15.92,0,0,0,56.48,197.5L136,146.86v37.3a15.92,15.92,0,0,0,24.48,13.34l88.19-56.16a15.8,15.8,0,0,0,0-26.68ZM48,183.94V72.07L135.82,128Zm104,0V72.07L239.82,128Z"}))],["thin",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M246.52,118,158.33,61.87a12,12,0,0,0-12.18-.39A11.66,11.66,0,0,0,140,71.84v44.59L54.33,61.87a12,12,0,0,0-12.18-.39A11.66,11.66,0,0,0,36,71.84V184.16a11.66,11.66,0,0,0,6.15,10.36,12,12,0,0,0,12.18-.39L140,139.57v44.59a11.66,11.66,0,0,0,6.15,10.36,12,12,0,0,0,12.18-.39L246.52,138a11.81,11.81,0,0,0,0-19.94Zm-108.3,13.19L50,187.38a3.91,3.91,0,0,1-4,.13,3.76,3.76,0,0,1-2-3.35V71.84a3.76,3.76,0,0,1,2-3.35,4,4,0,0,1,1.91-.5,3.94,3.94,0,0,1,2.13.63l88.18,56.16a3.8,3.8,0,0,1,0,6.44Zm104,0L154,187.38a3.91,3.91,0,0,1-4,.13,3.76,3.76,0,0,1-2-3.35V71.84a3.76,3.76,0,0,1,2-3.35,4,4,0,0,1,1.91-.5,3.94,3.94,0,0,1,2.13.63l88.18,56.16a3.8,3.8,0,0,1,0,6.44Z"}))]]),ZE=new Map([["bold",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"}))],["duotone",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M216,56V200a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V56A16,16,0,0,1,56,40H200A16,16,0,0,1,216,56Z",opacity:"0.2"}),Mt.createElement("path",{d:"M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"}))],["fill",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM181.66,170.34a8,8,0,0,1-11.32,11.32L128,139.31,85.66,181.66a8,8,0,0,1-11.32-11.32L116.69,128,74.34,85.66A8,8,0,0,1,85.66,74.34L128,116.69l42.34-42.35a8,8,0,0,1,11.32,11.32L139.31,128Z"}))],["light",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M204.24,195.76a6,6,0,1,1-8.48,8.48L128,136.49,60.24,204.24a6,6,0,0,1-8.48-8.48L119.51,128,51.76,60.24a6,6,0,0,1,8.48-8.48L128,119.51l67.76-67.75a6,6,0,0,1,8.48,8.48L136.49,128Z"}))],["regular",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"}))],["thin",Mt.createElement(Mt.Fragment,null,Mt.createElement("path",{d:"M202.83,197.17a4,4,0,0,1-5.66,5.66L128,133.66,58.83,202.83a4,4,0,0,1-5.66-5.66L122.34,128,53.17,58.83a4,4,0,0,1,5.66-5.66L128,122.34l69.17-69.17a4,4,0,1,1,5.66,5.66L133.66,128Z"}))]]),KE=Mt.createContext({color:"currentColor",size:"1em",weight:"regular",mirrored:!1}),Ro=Mt.forwardRef((r,t)=>{const{alt:i,color:s,size:l,weight:c,mirrored:f,children:d,weights:m,...p}=r,{color:_="currentColor",size:v,weight:g="regular",mirrored:y=!1,...b}=Mt.useContext(KE);return Mt.createElement("svg",{ref:t,xmlns:"http://www.w3.org/2000/svg",width:l??v,height:l??v,fill:s??_,viewBox:"0 0 256 256",transform:f||y?"scale(-1, 1)":void 0,...b,...p},!!i&&Mt.createElement("title",null,i),d,m.get(c??g))});Ro.displayName="IconBase";const j1=Mt.forwardRef((r,t)=>Mt.createElement(Ro,{ref:t,...r,weights:kE}));j1.displayName="ArrowCounterClockwiseIcon";const JE=j1,$1=Mt.forwardRef((r,t)=>Mt.createElement(Ro,{ref:t,...r,weights:WE}));$1.displayName="ArrowsClockwiseIcon";const QE=$1,tS=Mt.forwardRef((r,t)=>Mt.createElement(Ro,{ref:t,...r,weights:qE}));tS.displayName="CameraRotateIcon";const jE=tS,eS=Mt.forwardRef((r,t)=>Mt.createElement(Ro,{ref:t,...r,weights:YE}));eS.displayName="FastForwardIcon";const $E=eS,nS=Mt.forwardRef((r,t)=>Mt.createElement(Ro,{ref:t,...r,weights:ZE}));nS.displayName="XIcon";const tb=nS,ep=Object.freeze({timestep:1/240,collisionIterations:16,gravity:9.81,ball:Object.freeze({mass:.17,radius:.035,restitution:.94,friction:.03,slidingFriction:.24,rollingDeceleration:.115}),table:Object.freeze({width:1.27,length:2.54,cushionRestitution:.86,cornerPocketRadius:.068,sidePocketRadius:.061})}),eb=(r={})=>({...ep,...r,ball:{...ep.ball,...r.ball},table:{...ep.table,...r.table}}),nb=r=>{const t=r.table.width/2,i=r.table.length/2,s=r.table.cornerPocketRadius*1.72,l=r.table.sidePocketRadius*1.35,c=r.ball.radius*1.25,f=[],d=(p,_,v,g,y="cushion")=>{f.push({ax:p,az:_,bx:v,bz:g,type:y})};d(-t+s,-i,t-s,-i),d(-t+s,i,t-s,i),d(-t,-i+s,-t,-l),d(-t,l,-t,i-s),d(t,-i+s,t,-l),d(t,l,t,i-s),[-1,1].forEach(p=>{[-1,1].forEach(_=>{d(p*(t-s),_*i,p*(t-s*.43),_*(i+c),"corner-jaw"),d(p*t,_*(i-s),p*(t+c),_*(i-s*.43),"corner-jaw")}),d(p*t,-l,p*(t+c),-l*.38,"side-jaw"),d(p*t,l,p*(t+c),l*.38,"side-jaw")});const m=[{x:-t-.006,z:-i-.006,radius:r.table.cornerPocketRadius},{x:t+.006,z:-i-.006,radius:r.table.cornerPocketRadius},{x:-t-.008,z:0,radius:r.table.sidePocketRadius},{x:t+.008,z:0,radius:r.table.sidePocketRadius},{x:-t-.006,z:i+.006,radius:r.table.cornerPocketRadius},{x:t+.006,z:i+.006,radius:r.table.cornerPocketRadius}];return{segments:f,pockets:m,halfWidth:t,halfLength:i}};function Hm(r=1){let t=r>>>0||1;const i=()=>{t=t+1831565813>>>0;let s=t;return s=Math.imul(s^s>>>15,s|1),s^=s+Math.imul(s^s>>>7,s|61),((s^s>>>14)>>>0)/4294967296};return i.signed=()=>i()*2-1,i}const wo=eb({ball:{rollingDeceleration:.2}}),tn=nb(wo),ib=Object.freeze(Array.from({length:16},(r,t)=>t)),Ts=wo.ball.radius,bs=Ts*2,Lx=7,er=Object.freeze({x:0,z:-tn.halfLength/2}),nc=tn.halfLength/2,Vm=(r,t,i)=>({id:r,x:t,y:Ts,z:i,mass:wo.ball.mass,vx:0,vz:0,wx:0,wy:0,wz:0,quaternion:{x:0,y:0,z:0,w:1},pocketed:!1,pocketIndex:-1,pocketTime:0,pocketDepth:0,checksUp:!1}),iS=r=>r.map(t=>({...t,quaternion:{...t.quaternion}}));function np(r=1){const t=Hm(r),i=bs+2e-4,s=i*Math.sqrt(3)/2,l=[];for(let g=0;g<5;g+=1)for(let y=0;y<=g;y+=1)l.push({x:er.x+(y-g/2)*i,z:er.z-g*s});const c=g=>{for(let y=g.length-1;y>0;y-=1){const b=Math.floor(t()*(y+1));[g[y],g[b]]=[g[b],g[y]]}return g},f=c([1,2,3,4,5,6,7]),d=c([9,10,11,12,13,14,15]),m=new Array(15);m[4]=8;const p=t()<.5;m[10]=p?f.pop():d.pop(),m[14]=p?d.pop():f.pop();const _=c([...f,...d]);for(let g=0;g<15;g+=1)m[g]===void 0&&(m[g]=_.pop());const v=ib.map(g=>Vm(g,0,0));return Object.assign(v[0],{x:0,z:nc+.2}),m.forEach((g,y)=>{const b=y===0?0:3e-4;v[g].x=l[y].x+t.signed()*b,v[g].z=l[y].z+t.signed()*b}),v}function ab(r,t,i,s=[0]){const l=Math.cos(i),c=Math.sin(i);let f={distance:1/0,ballId:null};for(const U of r){if(U.pocketed||s.includes(U.id))continue;const L=U.x-t.x,P=U.z-t.z,T=L*l+P*c;if(T<=0)continue;const D=L*L+P*P-T*T;if(D>=bs*bs)continue;const H=T-Math.sqrt(bs*bs-D);H<f.distance&&(f={distance:Math.max(0,H),ballId:U.id})}const d=tn.halfWidth-Ts,m=tn.halfLength-Ts,p=Math.abs(l)>1e-9?(Math.sign(l)*d-t.x)/l:1/0,_=Math.abs(c)>1e-9?(Math.sign(c)*m-t.z)/c:1/0,v=Math.max(0,Math.min(p,_));if(v<f.distance){const U={x:t.x+l*v,z:t.z+c*v},L=p<_?{x:-l,z:c}:{x:l,z:-c};return{distance:v,ballId:null,point:U,cushionDir:L}}const g={x:t.x+l*f.distance,z:t.z+c*f.distance},y=r[f.ballId],b=Math.hypot(y.x-g.x,y.z-g.z)||1,C={x:(y.x-g.x)/b,z:(y.z-g.z)/b},M=l*C.x+c*C.z,S=l-M*C.x,N=c-M*C.z,I=Math.hypot(S,N),A=I>1e-6?{x:S/I,z:N/I}:null;return{distance:f.distance,ballId:f.ballId,point:g,objectDir:C,cueDir:A,cut:Math.acos(Math.min(1,Math.max(-1,M)))}}function lf(r,t,{kitchenOnly:i=!1,ignoreId:s=0}={}){return Math.abs(r.x)>tn.halfWidth-Ts||Math.abs(r.z)>tn.halfLength-Ts||i&&r.z<nc?!1:t.every(l=>l.id===s||l.pocketed||Math.hypot(l.x-r.x,l.z-r.z)>=bs+.001)}function Au(r,t){const i=iS(r);return i[0]=Vm(0,t.x,t.z),i}function sb(r,t){const i=iS(r),s=bs+.001,l=[];for(let f=0;er.z-f>-tn.halfLength+Ts;f+=s)l.push(er.z-f);for(let f=s;er.z+f<tn.halfLength-Ts;f+=s)l.push(er.z+f);const c=l.find(f=>lf({x:0,z:f},i,{ignoreId:t}))??er.z;return i[t]=Vm(t,0,c),i}function rb(r,t={x:0,z:nc+.2},{kitchenOnly:i=!1}={}){if(lf(t,r,{kitchenOnly:i}))return t;const s=bs+.002;for(let l=1;l<60;l+=1)for(let c=0;c<l*6;c+=1){const f=c/(l*6)*Math.PI*2,d={x:t.x+Math.cos(f)*l*s,z:t.z+Math.sin(f)*l*s};if(lf(d,r,{kitchenOnly:i}))return d}return t}const aS=Object.freeze([1,2,3,4,5,6,7]),sS=Object.freeze([9,10,11,12,13,14,15]),ob={solids:aS,stripes:sS},lb={solids:"stripes",stripes:"solids"},rS=r=>r===8?"eight":r<8?"solids":"stripes";function cb({mode:r="practice",difficulty:t="easy"}={}){return{mode:r,difficulty:t,players:r==="bot"?[{name:"You",kind:"human",group:null},{name:"Bot",kind:"bot",group:null}]:[{name:"You",kind:"human",group:null}],turn:0,phase:"break",ballInHand:"kitchen",potted:[],shots:0,winner:null,message:r==="bot"?"Your break":"Break the rack"}}const ub=r=>{const t=new Set(r.potted),i=[];for(let s=1;s<=15;s+=1)t.has(s)||i.push(s);return i};function oS(r,t=r.turn){const i=ub(r);if(r.mode==="practice"||r.phase==="break")return i;const s=r.players[t].group;if(!s){const c=i.filter(f=>f!==8);return c.length?c:[8]}const l=i.filter(c=>rS(c)===s);return l.length?l:[8]}const Ux=(r,t)=>r.players[t].kind==="bot"?"Bot":"You",fb=(r,{pocketed:t})=>{const i=t.includes(0),s=[...r.potted,...t.filter(d=>d!==0)],l=r.shots+1,c=t.filter(d=>d!==0).map(d=>({type:"pot",id:d})),f=s.length>=15;return i&&c.push({type:"foul",reason:"scratch"}),f&&c.push({type:"cleared",shots:l}),{state:{...r,phase:f?"over":"play",potted:s,shots:l,ballInHand:i&&!f?"anywhere":null,winner:f?0:null,message:f?`Cleared in ${l} shots`:i?"Scratch: ball in hand":`${s.length} of 15 potted`},events:c}};function hb(r,t){if(r.phase==="over")return{state:r,events:[]};if(r.mode==="practice")return fb(r,t);const{firstContact:i,pocketed:s}=t,l=r.turn,c=1-l,f=oS(r),d=r.phase==="break",m=s.includes(0),p=s.filter(D=>D!==0),_=p.includes(8),v=p.map(D=>({type:"pot",id:D,player:l}));let g=null;m?g="scratch":i==null?g="no-contact":!d&&!f.includes(i)&&(g="wrong-ball");const y=g!==null;y&&v.push({type:"foul",reason:g,player:l});const b=r.players.map(D=>({...D})),C=r.shots+1,M=_&&d;M&&v.push({type:"respot",id:8});const S=[...r.potted,...p.filter(D=>!(M&&D===8))];if(_&&!d){const D=f.length===1&&f[0]===8&&!y,H=D?l:c;return v.push({type:D?"win":"lose",player:l}),{state:{...r,players:b,potted:S,shots:C,phase:"over",ballInHand:null,winner:H,message:`${Ux(r,H)} ${H===0?"win":"wins"}`},events:v}}const N=b[l].group,I=p.filter(D=>D!==8);if(!d&&!N&&!y&&I.length){const D=rS(I[0]);b[l].group=D,b[c].group=lb[D],v.push({type:"groups",player:l,group:D})}const A=!y&&(N?I.some(D=>ob[N].includes(D)):I.length>0),U=A?l:c;A||v.push({type:"turn",player:U});const L=Ux(r,U),T=y?`Foul: ${{scratch:"Scratch","no-contact":"No ball hit","wrong-ball":"Wrong ball first"}[g]}. ${L==="You"?"Your":"Bot"} ball in hand`:A?`${L==="You"?"You":"Bot"} continue${L==="You"?"":"s"}`:`${L==="You"?"Your":"Bot's"} turn`;return{state:{...r,players:b,potted:S,shots:C,turn:U,phase:"play",ballInHand:y?"anywhere":null,winner:null,message:T},events:v}}/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Gm="186",db=0,Ox=1,pb=2,Xl=1,mb=2,Fl=3,lr=0,Kn=1,za=2,Fa=0,kl=1,Px=2,Ix=3,zx=4,gb=5,xo=100,vb=101,_b=102,xb=103,Sb=104,yb=200,Mb=201,Eb=202,bb=203,lS=204,cS=205,Tb=206,Ab=207,Rb=208,wb=209,Cb=210,Nb=211,Db=212,Lb=213,Ub=214,Wp=0,qp=1,Yp=2,Yl=3,Zp=4,Kp=5,Jp=6,Qp=7,Xm=0,Ob=1,Pb=2,ca=0,uS=1,fS=2,hS=3,km=4,dS=5,pS=6,mS=7,gS=300,cr=301,bo=302,ip=303,ap=304,xf=306,Zl=1e3,Ba=1001,jp=1002,zn=1003,Ib=1004,Ru=1005,Vn=1006,sp=1007,nr=1008,vi=1009,vS=1010,_S=1011,Kl=1012,Wm=1013,fa=1014,Hi=1015,ha=1016,qm=1017,Ym=1018,Jl=1020,xS=35902,SS=35899,yS=1021,MS=1022,Vi=1023,Xa=1026,ir=1027,Zm=1028,Km=1029,ur=1030,Jm=1031,Qm=1033,nf=33776,af=33777,sf=33778,rf=33779,$p=35840,tm=35841,em=35842,nm=35843,im=36196,am=37492,sm=37496,rm=37488,om=37489,cf=37490,lm=37491,cm=37808,um=37809,fm=37810,hm=37811,dm=37812,pm=37813,mm=37814,gm=37815,vm=37816,_m=37817,xm=37818,Sm=37819,ym=37820,Mm=37821,Em=36492,bm=36494,Tm=36495,Am=36283,Rm=36284,uf=36285,wm=36286,zb=3200,ff=0,Bb=1,Es="",ni="srgb",hf="srgb-linear",df="linear",Qe="srgb",rp=7680,Fb=519,Hb=512,Vb=513,Gb=514,jm=515,Xb=516,kb=517,$m=518,Wb=519,qb=35044,Bx="300 es",la=2e3,Ql=2001;function Yb(r){for(let t=r.length-1;t>=0;--t)if(r[t]>=65535)return!0;return!1}function pf(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function Zb(){const r=pf("canvas");return r.style.display="block",r}const Fx={};function Hx(...r){const t="THREE."+r.shift();console.log(t,...r)}function ES(r){const t=r[0];if(typeof t=="string"&&t.startsWith("TSL:")){const i=r[1];i&&i.isStackTrace?r[0]+=" "+i.getLocation():r[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return r}function _e(...r){r=ES(r);const t="THREE."+r.shift();{const i=r[0];i&&i.isStackTrace?console.warn(i.getError(t)):console.warn(t,...r)}}function Ge(...r){r=ES(r);const t="THREE."+r.shift();{const i=r[0];i&&i.isStackTrace?console.error(i.getError(t)):console.error(t,...r)}}function Mo(...r){const t=r.join(" ");t in Fx||(Fx[t]=!0,_e(...r))}function Kb(r,t,i){return new Promise(function(s,l){function c(){switch(r.clientWaitSync(t,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:l();break;case r.TIMEOUT_EXPIRED:setTimeout(c,i);break;default:s()}}setTimeout(c,i)})}const Jb={[Wp]:qp,[Yp]:Jp,[Zp]:Qp,[Yl]:Kp,[qp]:Wp,[Jp]:Yp,[Qp]:Zp,[Kp]:Yl};class dr{addEventListener(t,i){this._listeners===void 0&&(this._listeners={});const s=this._listeners;s[t]===void 0&&(s[t]=[]),s[t].indexOf(i)===-1&&s[t].push(i)}hasEventListener(t,i){const s=this._listeners;return s===void 0?!1:s[t]!==void 0&&s[t].indexOf(i)!==-1}removeEventListener(t,i){const s=this._listeners;if(s===void 0)return;const l=s[t];if(l!==void 0){const c=l.indexOf(i);c!==-1&&l.splice(c,1)}}dispatchEvent(t){const i=this._listeners;if(i===void 0)return;const s=i[t.type];if(s!==void 0){t.target=this;const l=s.slice(0);for(let c=0,f=l.length;c<f;c++)l[c].call(this,t);t.target=null}}}const Fn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],op=Math.PI/180,mf=180/Math.PI;function Co(){const r=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0,s=Math.random()*4294967295|0;return(Fn[r&255]+Fn[r>>8&255]+Fn[r>>16&255]+Fn[r>>24&255]+"-"+Fn[t&255]+Fn[t>>8&255]+"-"+Fn[t>>16&15|64]+Fn[t>>24&255]+"-"+Fn[i&63|128]+Fn[i>>8&255]+"-"+Fn[i>>16&255]+Fn[i>>24&255]+Fn[s&255]+Fn[s>>8&255]+Fn[s>>16&255]+Fn[s>>24&255]).toLowerCase()}function De(r,t,i){return Math.max(t,Math.min(i,r))}function Qb(r,t){return(r%t+t)%t}function lp(r,t,i){return(1-i)*r+i*t}function wl(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:case Uint8ClampedArray:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ei(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}const p0=class p0{constructor(t=0,i=0){this.x=t,this.y=i}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,i){return this.x=t,this.y=i,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const i=this.x,s=this.y,l=t.elements;return this.x=l[0]*i+l[3]*s+l[6],this.y=l[1]*i+l[4]*s+l[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,i){return this.x=De(this.x,t.x,i.x),this.y=De(this.y,t.y,i.y),this}clampScalar(t,i){return this.x=De(this.x,t,i),this.y=De(this.y,t,i),this}clampLength(t,i){const s=this.length();return this.divideScalar(s||1).multiplyScalar(De(s,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const i=Math.sqrt(this.lengthSq()*t.lengthSq());if(i===0)return Math.PI/2;const s=this.dot(t)/i;return Math.acos(De(s,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const i=this.x-t.x,s=this.y-t.y;return i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this}lerpVectors(t,i,s){return this.x=t.x+(i.x-t.x)*s,this.y=t.y+(i.y-t.y)*s,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this}rotateAround(t,i){const s=Math.cos(i),l=Math.sin(i),c=this.x-t.x,f=this.y-t.y;return this.x=c*s-f*l+t.x,this.y=c*l+f*s+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};p0.prototype.isVector2=!0;let Bt=p0;class Ha{constructor(t=0,i=0,s=0,l=1){this.isQuaternion=!0,this._x=t,this._y=i,this._z=s,this._w=l}static slerpFlat(t,i,s,l,c,f,d){let m=s[l+0],p=s[l+1],_=s[l+2],v=s[l+3],g=c[f+0],y=c[f+1],b=c[f+2],C=c[f+3];if(v!==C||m!==g||p!==y||_!==b){let M=m*g+p*y+_*b+v*C;M<0&&(g=-g,y=-y,b=-b,C=-C,M=-M);let S=1-d;if(M<.9995){const N=Math.acos(M),I=Math.sin(N);S=Math.sin(S*N)/I,d=Math.sin(d*N)/I,m=m*S+g*d,p=p*S+y*d,_=_*S+b*d,v=v*S+C*d}else{m=m*S+g*d,p=p*S+y*d,_=_*S+b*d,v=v*S+C*d;const N=1/Math.sqrt(m*m+p*p+_*_+v*v);m*=N,p*=N,_*=N,v*=N}}t[i]=m,t[i+1]=p,t[i+2]=_,t[i+3]=v}static multiplyQuaternionsFlat(t,i,s,l,c,f){const d=s[l],m=s[l+1],p=s[l+2],_=s[l+3],v=c[f],g=c[f+1],y=c[f+2],b=c[f+3];return t[i]=d*b+_*v+m*y-p*g,t[i+1]=m*b+_*g+p*v-d*y,t[i+2]=p*b+_*y+d*g-m*v,t[i+3]=_*b-d*v-m*g-p*y,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,i,s,l){return this._x=t,this._y=i,this._z=s,this._w=l,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,i=!0){const s=t._x,l=t._y,c=t._z,f=t._order,d=Math.cos,m=Math.sin,p=d(s/2),_=d(l/2),v=d(c/2),g=m(s/2),y=m(l/2),b=m(c/2);switch(f){case"XYZ":this._x=g*_*v+p*y*b,this._y=p*y*v-g*_*b,this._z=p*_*b+g*y*v,this._w=p*_*v-g*y*b;break;case"YXZ":this._x=g*_*v+p*y*b,this._y=p*y*v-g*_*b,this._z=p*_*b-g*y*v,this._w=p*_*v+g*y*b;break;case"ZXY":this._x=g*_*v-p*y*b,this._y=p*y*v+g*_*b,this._z=p*_*b+g*y*v,this._w=p*_*v-g*y*b;break;case"ZYX":this._x=g*_*v-p*y*b,this._y=p*y*v+g*_*b,this._z=p*_*b-g*y*v,this._w=p*_*v+g*y*b;break;case"YZX":this._x=g*_*v+p*y*b,this._y=p*y*v+g*_*b,this._z=p*_*b-g*y*v,this._w=p*_*v-g*y*b;break;case"XZY":this._x=g*_*v-p*y*b,this._y=p*y*v-g*_*b,this._z=p*_*b+g*y*v,this._w=p*_*v+g*y*b;break;default:_e("Quaternion: .setFromEuler() encountered an unknown order: "+f)}return i===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,i){const s=i/2,l=Math.sin(s);return this._x=t.x*l,this._y=t.y*l,this._z=t.z*l,this._w=Math.cos(s),this._onChangeCallback(),this}setFromRotationMatrix(t){const i=t.elements,s=i[0],l=i[4],c=i[8],f=i[1],d=i[5],m=i[9],p=i[2],_=i[6],v=i[10],g=s+d+v;if(g>0){const y=.5/Math.sqrt(g+1);this._w=.25/y,this._x=(_-m)*y,this._y=(c-p)*y,this._z=(f-l)*y}else if(s>d&&s>v){const y=2*Math.sqrt(1+s-d-v);this._w=(_-m)/y,this._x=.25*y,this._y=(l+f)/y,this._z=(c+p)/y}else if(d>v){const y=2*Math.sqrt(1+d-s-v);this._w=(c-p)/y,this._x=(l+f)/y,this._y=.25*y,this._z=(m+_)/y}else{const y=2*Math.sqrt(1+v-s-d);this._w=(f-l)/y,this._x=(c+p)/y,this._y=(m+_)/y,this._z=.25*y}return this._onChangeCallback(),this}setFromUnitVectors(t,i){let s=t.dot(i)+1;return s<1e-8?(s=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=s):(this._x=0,this._y=-t.z,this._z=t.y,this._w=s)):(this._x=t.y*i.z-t.z*i.y,this._y=t.z*i.x-t.x*i.z,this._z=t.x*i.y-t.y*i.x,this._w=s),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(De(this.dot(t),-1,1)))}rotateTowards(t,i){const s=this.angleTo(t);if(s===0)return this;const l=Math.min(1,i/s);return this.slerp(t,l),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,i){const s=t._x,l=t._y,c=t._z,f=t._w,d=i._x,m=i._y,p=i._z,_=i._w;return this._x=s*_+f*d+l*p-c*m,this._y=l*_+f*m+c*d-s*p,this._z=c*_+f*p+s*m-l*d,this._w=f*_-s*d-l*m-c*p,this._onChangeCallback(),this}slerp(t,i){let s=t._x,l=t._y,c=t._z,f=t._w,d=this.dot(t);d<0&&(s=-s,l=-l,c=-c,f=-f,d=-d);let m=1-i;if(d<.9995){const p=Math.acos(d),_=Math.sin(p);m=Math.sin(m*p)/_,i=Math.sin(i*p)/_,this._x=this._x*m+s*i,this._y=this._y*m+l*i,this._z=this._z*m+c*i,this._w=this._w*m+f*i,this._onChangeCallback()}else this._x=this._x*m+s*i,this._y=this._y*m+l*i,this._z=this._z*m+c*i,this._w=this._w*m+f*i,this.normalize();return this}slerpQuaternions(t,i,s){return this.copy(t).slerp(i,s)}random(){const t=2*Math.PI*Math.random(),i=2*Math.PI*Math.random(),s=Math.random(),l=Math.sqrt(1-s),c=Math.sqrt(s);return this.set(l*Math.sin(t),l*Math.cos(t),c*Math.sin(i),c*Math.cos(i))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,i=0){return this._x=t[i],this._y=t[i+1],this._z=t[i+2],this._w=t[i+3],this._onChangeCallback(),this}toArray(t=[],i=0){return t[i]=this._x,t[i+1]=this._y,t[i+2]=this._z,t[i+3]=this._w,t}fromBufferAttribute(t,i){return this._x=t.getX(i),this._y=t.getY(i),this._z=t.getZ(i),this._w=t.getW(i),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const m0=class m0{constructor(t=0,i=0,s=0){this.x=t,this.y=i,this.z=s}set(t,i,s){return s===void 0&&(s=this.z),this.x=t,this.y=i,this.z=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this.z=t.z+i.z,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this.z+=t.z*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this.z=t.z-i.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,i){return this.x=t.x*i.x,this.y=t.y*i.y,this.z=t.z*i.z,this}applyEuler(t){return this.applyQuaternion(Vx.setFromEuler(t))}applyAxisAngle(t,i){return this.applyQuaternion(Vx.setFromAxisAngle(t,i))}applyMatrix3(t){const i=this.x,s=this.y,l=this.z,c=t.elements;return this.x=c[0]*i+c[3]*s+c[6]*l,this.y=c[1]*i+c[4]*s+c[7]*l,this.z=c[2]*i+c[5]*s+c[8]*l,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const i=this.x,s=this.y,l=this.z,c=t.elements,f=1/(c[3]*i+c[7]*s+c[11]*l+c[15]);return this.x=(c[0]*i+c[4]*s+c[8]*l+c[12])*f,this.y=(c[1]*i+c[5]*s+c[9]*l+c[13])*f,this.z=(c[2]*i+c[6]*s+c[10]*l+c[14])*f,this}applyQuaternion(t){const i=this.x,s=this.y,l=this.z,c=t.x,f=t.y,d=t.z,m=t.w,p=2*(f*l-d*s),_=2*(d*i-c*l),v=2*(c*s-f*i);return this.x=i+m*p+f*v-d*_,this.y=s+m*_+d*p-c*v,this.z=l+m*v+c*_-f*p,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const i=this.x,s=this.y,l=this.z,c=t.elements;return this.x=c[0]*i+c[4]*s+c[8]*l,this.y=c[1]*i+c[5]*s+c[9]*l,this.z=c[2]*i+c[6]*s+c[10]*l,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,i){return this.x=De(this.x,t.x,i.x),this.y=De(this.y,t.y,i.y),this.z=De(this.z,t.z,i.z),this}clampScalar(t,i){return this.x=De(this.x,t,i),this.y=De(this.y,t,i),this.z=De(this.z,t,i),this}clampLength(t,i){const s=this.length();return this.divideScalar(s||1).multiplyScalar(De(s,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this.z+=(t.z-this.z)*i,this}lerpVectors(t,i,s){return this.x=t.x+(i.x-t.x)*s,this.y=t.y+(i.y-t.y)*s,this.z=t.z+(i.z-t.z)*s,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,i){const s=t.x,l=t.y,c=t.z,f=i.x,d=i.y,m=i.z;return this.x=l*m-c*d,this.y=c*f-s*m,this.z=s*d-l*f,this}projectOnVector(t){const i=t.lengthSq();if(i===0)return this.set(0,0,0);const s=t.dot(this)/i;return this.copy(t).multiplyScalar(s)}projectOnPlane(t){return cp.copy(this).projectOnVector(t),this.sub(cp)}reflect(t){return this.sub(cp.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const i=Math.sqrt(this.lengthSq()*t.lengthSq());if(i===0)return Math.PI/2;const s=this.dot(t)/i;return Math.acos(De(s,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const i=this.x-t.x,s=this.y-t.y,l=this.z-t.z;return i*i+s*s+l*l}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,i,s){const l=Math.sin(i)*t;return this.x=l*Math.sin(s),this.y=Math.cos(i)*t,this.z=l*Math.cos(s),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,i,s){return this.x=t*Math.sin(i),this.y=s,this.z=t*Math.cos(i),this}setFromMatrixPosition(t){const i=t.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this}setFromMatrixScale(t){const i=this.setFromMatrixColumn(t,0).length(),s=this.setFromMatrixColumn(t,1).length(),l=this.setFromMatrixColumn(t,2).length();return this.x=i,this.y=s,this.z=l,this}setFromMatrixColumn(t,i){return this.fromArray(t.elements,i*4)}setFromMatrix3Column(t,i){return this.fromArray(t.elements,i*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this.z=t[i+2],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t[i+2]=this.z,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this.z=t.getZ(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,i=Math.random()*2-1,s=Math.sqrt(1-i*i);return this.x=s*Math.cos(t),this.y=i,this.z=s*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};m0.prototype.isVector3=!0;let tt=m0;const cp=new tt,Vx=new Ha,g0=class g0{constructor(t,i,s,l,c,f,d,m,p){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,i,s,l,c,f,d,m,p)}set(t,i,s,l,c,f,d,m,p){const _=this.elements;return _[0]=t,_[1]=l,_[2]=d,_[3]=i,_[4]=c,_[5]=m,_[6]=s,_[7]=f,_[8]=p,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const i=this.elements,s=t.elements;return i[0]=s[0],i[1]=s[1],i[2]=s[2],i[3]=s[3],i[4]=s[4],i[5]=s[5],i[6]=s[6],i[7]=s[7],i[8]=s[8],this}extractBasis(t,i,s){return t.setFromMatrix3Column(this,0),i.setFromMatrix3Column(this,1),s.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const i=t.elements;return this.set(i[0],i[4],i[8],i[1],i[5],i[9],i[2],i[6],i[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,i){const s=t.elements,l=i.elements,c=this.elements,f=s[0],d=s[3],m=s[6],p=s[1],_=s[4],v=s[7],g=s[2],y=s[5],b=s[8],C=l[0],M=l[3],S=l[6],N=l[1],I=l[4],A=l[7],U=l[2],L=l[5],P=l[8];return c[0]=f*C+d*N+m*U,c[3]=f*M+d*I+m*L,c[6]=f*S+d*A+m*P,c[1]=p*C+_*N+v*U,c[4]=p*M+_*I+v*L,c[7]=p*S+_*A+v*P,c[2]=g*C+y*N+b*U,c[5]=g*M+y*I+b*L,c[8]=g*S+y*A+b*P,this}multiplyScalar(t){const i=this.elements;return i[0]*=t,i[3]*=t,i[6]*=t,i[1]*=t,i[4]*=t,i[7]*=t,i[2]*=t,i[5]*=t,i[8]*=t,this}determinant(){const t=this.elements,i=t[0],s=t[1],l=t[2],c=t[3],f=t[4],d=t[5],m=t[6],p=t[7],_=t[8];return i*f*_-i*d*p-s*c*_+s*d*m+l*c*p-l*f*m}invert(){const t=this.elements,i=t[0],s=t[1],l=t[2],c=t[3],f=t[4],d=t[5],m=t[6],p=t[7],_=t[8],v=_*f-d*p,g=d*m-_*c,y=p*c-f*m,b=i*v+s*g+l*y;if(b===0)return this.set(0,0,0,0,0,0,0,0,0);const C=1/b;return t[0]=v*C,t[1]=(l*p-_*s)*C,t[2]=(d*s-l*f)*C,t[3]=g*C,t[4]=(_*i-l*m)*C,t[5]=(l*c-d*i)*C,t[6]=y*C,t[7]=(s*m-p*i)*C,t[8]=(f*i-s*c)*C,this}transpose(){let t;const i=this.elements;return t=i[1],i[1]=i[3],i[3]=t,t=i[2],i[2]=i[6],i[6]=t,t=i[5],i[5]=i[7],i[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const i=this.elements;return t[0]=i[0],t[1]=i[3],t[2]=i[6],t[3]=i[1],t[4]=i[4],t[5]=i[7],t[6]=i[2],t[7]=i[5],t[8]=i[8],this}setUvTransform(t,i,s,l,c,f,d){const m=Math.cos(c),p=Math.sin(c);return this.set(s*m,s*p,-s*(m*f+p*d)+f+t,-l*p,l*m,-l*(-p*f+m*d)+d+i,0,0,1),this}scale(t,i){return Mo("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(up.makeScale(t,i)),this}rotate(t){return Mo("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(up.makeRotation(-t)),this}translate(t,i){return Mo("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(up.makeTranslation(t,i)),this}makeTranslation(t,i){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,i,0,0,1),this}makeRotation(t){const i=Math.cos(t),s=Math.sin(t);return this.set(i,-s,0,s,i,0,0,0,1),this}makeScale(t,i){return this.set(t,0,0,0,i,0,0,0,1),this}equals(t){const i=this.elements,s=t.elements;for(let l=0;l<9;l++)if(i[l]!==s[l])return!1;return!0}fromArray(t,i=0){for(let s=0;s<9;s++)this.elements[s]=t[s+i];return this}toArray(t=[],i=0){const s=this.elements;return t[i]=s[0],t[i+1]=s[1],t[i+2]=s[2],t[i+3]=s[3],t[i+4]=s[4],t[i+5]=s[5],t[i+6]=s[6],t[i+7]=s[7],t[i+8]=s[8],t}clone(){return new this.constructor().fromArray(this.elements)}};g0.prototype.isMatrix3=!0;let Ee=g0;const up=new Ee,Gx=new Ee().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Xx=new Ee().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function jb(){const r={enabled:!0,workingColorSpace:hf,spaces:{},convert:function(l,c,f){return this.enabled===!1||c===f||!c||!f||(this.spaces[c].transfer===Qe&&(l.r=Va(l.r),l.g=Va(l.g),l.b=Va(l.b)),this.spaces[c].primaries!==this.spaces[f].primaries&&(l.applyMatrix3(this.spaces[c].toXYZ),l.applyMatrix3(this.spaces[f].fromXYZ)),this.spaces[f].transfer===Qe&&(l.r=Eo(l.r),l.g=Eo(l.g),l.b=Eo(l.b))),l},workingToColorSpace:function(l,c){return this.convert(l,this.workingColorSpace,c)},colorSpaceToWorking:function(l,c){return this.convert(l,c,this.workingColorSpace)},getPrimaries:function(l){return this.spaces[l].primaries},getTransfer:function(l){return l===Es?df:this.spaces[l].transfer},getToneMappingMode:function(l){return this.spaces[l].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(l,c=this.workingColorSpace){return l.fromArray(this.spaces[c].luminanceCoefficients)},define:function(l){Object.assign(this.spaces,l)},_getMatrix:function(l,c,f){return l.copy(this.spaces[c].toXYZ).multiply(this.spaces[f].fromXYZ)},_getDrawingBufferColorSpace:function(l){return this.spaces[l].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(l=this.workingColorSpace){return this.spaces[l].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(l,c){return Mo("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(l,c)},toWorkingColorSpace:function(l,c){return Mo("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(l,c)}},t=[.64,.33,.3,.6,.15,.06],i=[.2126,.7152,.0722],s=[.3127,.329];return r.define({[hf]:{primaries:t,whitePoint:s,transfer:df,toXYZ:Gx,fromXYZ:Xx,luminanceCoefficients:i,workingColorSpaceConfig:{unpackColorSpace:ni},outputColorSpaceConfig:{drawingBufferColorSpace:ni}},[ni]:{primaries:t,whitePoint:s,transfer:Qe,toXYZ:Gx,fromXYZ:Xx,luminanceCoefficients:i,outputColorSpaceConfig:{drawingBufferColorSpace:ni}}}),r}const He=jb();function Va(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function Eo(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}let io;class $b{static getDataURL(t,i="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let s;if(t instanceof HTMLCanvasElement)s=t;else{io===void 0&&(io=pf("canvas")),io.width=t.width,io.height=t.height;const l=io.getContext("2d");t instanceof ImageData?l.putImageData(t,0,0):l.drawImage(t,0,0,t.width,t.height),s=io}return s.toDataURL(i)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const i=pf("canvas");i.width=t.width,i.height=t.height;const s=i.getContext("2d");s.drawImage(t,0,0,t.width,t.height);const l=s.getImageData(0,0,t.width,t.height),c=l.data;for(let f=0;f<c.length;f++)c[f]=Va(c[f]/255)*255;return s.putImageData(l,0,0),i}else if(t.data){const i=t.data.slice(0);for(let s=0;s<i.length;s++)i instanceof Uint8Array||i instanceof Uint8ClampedArray?i[s]=Math.floor(Va(i[s]/255)*255):i[s]=Va(i[s]);return{data:i,width:t.width,height:t.height}}else return _e("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let tT=0;class t0{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:tT++}),this.uuid=Co(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const i=this.data;return typeof HTMLVideoElement<"u"&&i instanceof HTMLVideoElement?t.set(i.videoWidth,i.videoHeight,0):typeof VideoFrame<"u"&&i instanceof VideoFrame?t.set(i.displayWidth,i.displayHeight,0):i!==null?t.set(i.width,i.height,i.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const i=t===void 0||typeof t=="string";if(!i&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const s={uuid:this.uuid,url:""},l=this.data;if(l!==null){let c;if(Array.isArray(l)){c=[];for(let f=0,d=l.length;f<d;f++)l[f].isDataTexture?c.push(fp(l[f].image)):c.push(fp(l[f]))}else c=fp(l);s.url=c}return i||(t.images[this.uuid]=s),s}}function fp(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?$b.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(_e("Texture: Unable to serialize Texture."),{})}let eT=0;const hp=new tt;class Gn extends dr{constructor(t=Gn.DEFAULT_IMAGE,i=Gn.DEFAULT_MAPPING,s=Ba,l=Ba,c=Vn,f=nr,d=Vi,m=vi,p=Gn.DEFAULT_ANISOTROPY,_=Es){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:eT++}),this.uuid=Co(),this.name="",this.source=new t0(t),this.mipmaps=[],this.mapping=i,this.channel=0,this.wrapS=s,this.wrapT=l,this.magFilter=c,this.minFilter=f,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=m,this.offset=new Bt(0,0),this.repeat=new Bt(1,1),this.center=new Bt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ee,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=_,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(hp).x}get height(){return this.source.getSize(hp).y}get depth(){return this.source.getSize(hp).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,i){this.updateRanges.push({start:t,count:i})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const i in t){const s=t[i];if(s===void 0){_e(`Texture.setValues(): parameter '${i}' has value of undefined.`);continue}const l=this[i];if(l===void 0){_e(`Texture.setValues(): property '${i}' does not exist.`);continue}l&&s&&l.isVector2&&s.isVector2||l&&s&&l.isVector3&&s.isVector3||l&&s&&l.isMatrix3&&s.isMatrix3?l.copy(s):this[i]=s}}toJSON(t){const i=t===void 0||typeof t=="string";if(!i&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const s={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(s.userData=this.userData),i||(t.textures[this.uuid]=s),s}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==gS)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Zl:t.x=t.x-Math.floor(t.x);break;case Ba:t.x=t.x<0?0:1;break;case jp:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Zl:t.y=t.y-Math.floor(t.y);break;case Ba:t.y=t.y<0?0:1;break;case jp:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Gn.DEFAULT_IMAGE=null;Gn.DEFAULT_MAPPING=gS;Gn.DEFAULT_ANISOTROPY=1;const v0=class v0{constructor(t=0,i=0,s=0,l=1){this.x=t,this.y=i,this.z=s,this.w=l}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,i,s,l){return this.x=t,this.y=i,this.z=s,this.w=l,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;case 3:this.w=i;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this.z=t.z+i.z,this.w=t.w+i.w,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this.z+=t.z*i,this.w+=t.w*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this.z=t.z-i.z,this.w=t.w-i.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const i=this.x,s=this.y,l=this.z,c=this.w,f=t.elements;return this.x=f[0]*i+f[4]*s+f[8]*l+f[12]*c,this.y=f[1]*i+f[5]*s+f[9]*l+f[13]*c,this.z=f[2]*i+f[6]*s+f[10]*l+f[14]*c,this.w=f[3]*i+f[7]*s+f[11]*l+f[15]*c,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const i=Math.sqrt(1-t.w*t.w);return i<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/i,this.y=t.y/i,this.z=t.z/i),this}setAxisAngleFromRotationMatrix(t){let i,s,l,c;const m=t.elements,p=m[0],_=m[4],v=m[8],g=m[1],y=m[5],b=m[9],C=m[2],M=m[6],S=m[10];if(Math.abs(_-g)<.01&&Math.abs(v-C)<.01&&Math.abs(b-M)<.01){if(Math.abs(_+g)<.1&&Math.abs(v+C)<.1&&Math.abs(b+M)<.1&&Math.abs(p+y+S-3)<.1)return this.set(1,0,0,0),this;i=Math.PI;const I=(p+1)/2,A=(y+1)/2,U=(S+1)/2,L=(_+g)/4,P=(v+C)/4,T=(b+M)/4;return I>A&&I>U?I<.01?(s=0,l=.707106781,c=.707106781):(s=Math.sqrt(I),l=L/s,c=P/s):A>U?A<.01?(s=.707106781,l=0,c=.707106781):(l=Math.sqrt(A),s=L/l,c=T/l):U<.01?(s=.707106781,l=.707106781,c=0):(c=Math.sqrt(U),s=P/c,l=T/c),this.set(s,l,c,i),this}let N=Math.sqrt((M-b)*(M-b)+(v-C)*(v-C)+(g-_)*(g-_));return Math.abs(N)<.001&&(N=1),this.x=(M-b)/N,this.y=(v-C)/N,this.z=(g-_)/N,this.w=Math.acos((p+y+S-1)/2),this}setFromMatrixPosition(t){const i=t.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this.w=i[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,i){return this.x=De(this.x,t.x,i.x),this.y=De(this.y,t.y,i.y),this.z=De(this.z,t.z,i.z),this.w=De(this.w,t.w,i.w),this}clampScalar(t,i){return this.x=De(this.x,t,i),this.y=De(this.y,t,i),this.z=De(this.z,t,i),this.w=De(this.w,t,i),this}clampLength(t,i){const s=this.length();return this.divideScalar(s||1).multiplyScalar(De(s,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this.z+=(t.z-this.z)*i,this.w+=(t.w-this.w)*i,this}lerpVectors(t,i,s){return this.x=t.x+(i.x-t.x)*s,this.y=t.y+(i.y-t.y)*s,this.z=t.z+(i.z-t.z)*s,this.w=t.w+(i.w-t.w)*s,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this.z=t[i+2],this.w=t[i+3],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t[i+2]=this.z,t[i+3]=this.w,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this.z=t.getZ(i),this.w=t.getW(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};v0.prototype.isVector4=!0;let cn=v0;class nT extends dr{constructor(t=1,i=1,s={}){super(),s=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Vn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},s),this.isRenderTarget=!0,this.width=t,this.height=i,this.depth=s.depth,this.scissor=new cn(0,0,t,i),this.scissorTest=!1,this.viewport=new cn(0,0,t,i),this.textures=[];const l={width:t,height:i,depth:s.depth},c=new Gn(l),f=s.count;for(let d=0;d<f;d++)this.textures[d]=c.clone(),this.textures[d].isRenderTargetTexture=!0,this.textures[d].renderTarget=this;this._setTextureOptions(s),this.depthBuffer=s.depthBuffer,this.stencilBuffer=s.stencilBuffer,this.resolveColorBuffer=s.resolveColorBuffer,this.resolveDepthBuffer=s.resolveDepthBuffer,this.resolveStencilBuffer=s.resolveStencilBuffer,this.storeMultisampledColorBuffer=s.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=s.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=s.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=s.depthTexture,this.samples=s.samples,this.multiview=s.multiview,this.useArrayDepthTexture=s.useArrayDepthTexture}_setTextureOptions(t={}){const i={minFilter:Vn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(i.mapping=t.mapping),t.wrapS!==void 0&&(i.wrapS=t.wrapS),t.wrapT!==void 0&&(i.wrapT=t.wrapT),t.wrapR!==void 0&&(i.wrapR=t.wrapR),t.magFilter!==void 0&&(i.magFilter=t.magFilter),t.minFilter!==void 0&&(i.minFilter=t.minFilter),t.format!==void 0&&(i.format=t.format),t.type!==void 0&&(i.type=t.type),t.anisotropy!==void 0&&(i.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(i.colorSpace=t.colorSpace),t.flipY!==void 0&&(i.flipY=t.flipY),t.generateMipmaps!==void 0&&(i.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(i.internalFormat=t.internalFormat);for(let s=0;s<this.textures.length;s++)this.textures[s].setValues(i)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,i,s=1){if(this.width!==t||this.height!==i||this.depth!==s){this.width=t,this.height=i,this.depth=s;for(let l=0,c=this.textures.length;l<c;l++)this.textures[l].image.width=t,this.textures[l].image.height=i,this.textures[l].image.depth=s,this.textures[l].isData3DTexture!==!0&&(this.textures[l].isArrayTexture=this.textures[l].image.depth>1);this.dispose()}this.viewport.set(0,0,t,i),this.scissor.set(0,0,t,i)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let i=0,s=t.textures.length;i<s;i++){this.textures[i]=t.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;const l=Object.assign({},t.textures[i].image);this.textures[i].source=new t0(l)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){const i=t.depthTexture.clone();i.renderTarget=null,this.depthTexture=i}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Gi extends nT{constructor(t=1,i=1,s={}){super(t,i,s),this.isWebGLRenderTarget=!0}}class bS extends Gn{constructor(t=null,i=1,s=1,l=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:i,height:s,depth:l},this.magFilter=zn,this.minFilter=zn,this.wrapR=Ba,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class iT extends Gn{constructor(t=null,i=1,s=1,l=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:i,height:s,depth:l},this.magFilter=zn,this.minFilter=zn,this.wrapR=Ba,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}}const _f=class _f{constructor(t,i,s,l,c,f,d,m,p,_,v,g,y,b,C,M){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,i,s,l,c,f,d,m,p,_,v,g,y,b,C,M)}set(t,i,s,l,c,f,d,m,p,_,v,g,y,b,C,M){const S=this.elements;return S[0]=t,S[4]=i,S[8]=s,S[12]=l,S[1]=c,S[5]=f,S[9]=d,S[13]=m,S[2]=p,S[6]=_,S[10]=v,S[14]=g,S[3]=y,S[7]=b,S[11]=C,S[15]=M,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new _f().fromArray(this.elements)}copy(t){const i=this.elements,s=t.elements;return i[0]=s[0],i[1]=s[1],i[2]=s[2],i[3]=s[3],i[4]=s[4],i[5]=s[5],i[6]=s[6],i[7]=s[7],i[8]=s[8],i[9]=s[9],i[10]=s[10],i[11]=s[11],i[12]=s[12],i[13]=s[13],i[14]=s[14],i[15]=s[15],this}copyPosition(t){const i=this.elements,s=t.elements;return i[12]=s[12],i[13]=s[13],i[14]=s[14],this}setFromMatrix3(t){const i=t.elements;return this.set(i[0],i[3],i[6],0,i[1],i[4],i[7],0,i[2],i[5],i[8],0,0,0,0,1),this}extractBasis(t,i,s){return this.determinantAffine()===0?(t.set(1,0,0),i.set(0,1,0),s.set(0,0,1),this):(t.setFromMatrixColumn(this,0),i.setFromMatrixColumn(this,1),s.setFromMatrixColumn(this,2),this)}makeBasis(t,i,s){return this.set(t.x,i.x,s.x,0,t.y,i.y,s.y,0,t.z,i.z,s.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();const i=this.elements,s=t.elements,l=1/ao.setFromMatrixColumn(t,0).length(),c=1/ao.setFromMatrixColumn(t,1).length(),f=1/ao.setFromMatrixColumn(t,2).length();return i[0]=s[0]*l,i[1]=s[1]*l,i[2]=s[2]*l,i[3]=0,i[4]=s[4]*c,i[5]=s[5]*c,i[6]=s[6]*c,i[7]=0,i[8]=s[8]*f,i[9]=s[9]*f,i[10]=s[10]*f,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromEuler(t){const i=this.elements,s=t.x,l=t.y,c=t.z,f=Math.cos(s),d=Math.sin(s),m=Math.cos(l),p=Math.sin(l),_=Math.cos(c),v=Math.sin(c);if(t.order==="XYZ"){const g=f*_,y=f*v,b=d*_,C=d*v;i[0]=m*_,i[4]=-m*v,i[8]=p,i[1]=y+b*p,i[5]=g-C*p,i[9]=-d*m,i[2]=C-g*p,i[6]=b+y*p,i[10]=f*m}else if(t.order==="YXZ"){const g=m*_,y=m*v,b=p*_,C=p*v;i[0]=g+C*d,i[4]=b*d-y,i[8]=f*p,i[1]=f*v,i[5]=f*_,i[9]=-d,i[2]=y*d-b,i[6]=C+g*d,i[10]=f*m}else if(t.order==="ZXY"){const g=m*_,y=m*v,b=p*_,C=p*v;i[0]=g-C*d,i[4]=-f*v,i[8]=b+y*d,i[1]=y+b*d,i[5]=f*_,i[9]=C-g*d,i[2]=-f*p,i[6]=d,i[10]=f*m}else if(t.order==="ZYX"){const g=f*_,y=f*v,b=d*_,C=d*v;i[0]=m*_,i[4]=b*p-y,i[8]=g*p+C,i[1]=m*v,i[5]=C*p+g,i[9]=y*p-b,i[2]=-p,i[6]=d*m,i[10]=f*m}else if(t.order==="YZX"){const g=f*m,y=f*p,b=d*m,C=d*p;i[0]=m*_,i[4]=C-g*v,i[8]=b*v+y,i[1]=v,i[5]=f*_,i[9]=-d*_,i[2]=-p*_,i[6]=y*v+b,i[10]=g-C*v}else if(t.order==="XZY"){const g=f*m,y=f*p,b=d*m,C=d*p;i[0]=m*_,i[4]=-v,i[8]=p*_,i[1]=g*v+C,i[5]=f*_,i[9]=y*v-b,i[2]=b*v-y,i[6]=d*_,i[10]=C*v+g}return i[3]=0,i[7]=0,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromQuaternion(t){return this.compose(aT,t,sT)}lookAt(t,i,s){const l=this.elements;return mi.subVectors(t,i),mi.lengthSq()===0&&(mi.z=1),mi.normalize(),_s.crossVectors(s,mi),_s.lengthSq()===0&&(Math.abs(s.z)===1?mi.x+=1e-4:mi.z+=1e-4,mi.normalize(),_s.crossVectors(s,mi)),_s.normalize(),wu.crossVectors(mi,_s),l[0]=_s.x,l[4]=wu.x,l[8]=mi.x,l[1]=_s.y,l[5]=wu.y,l[9]=mi.y,l[2]=_s.z,l[6]=wu.z,l[10]=mi.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,i){const s=t.elements,l=i.elements,c=this.elements,f=s[0],d=s[4],m=s[8],p=s[12],_=s[1],v=s[5],g=s[9],y=s[13],b=s[2],C=s[6],M=s[10],S=s[14],N=s[3],I=s[7],A=s[11],U=s[15],L=l[0],P=l[4],T=l[8],D=l[12],H=l[1],G=l[5],K=l[9],it=l[13],X=l[2],j=l[6],k=l[10],Q=l[14],ct=l[3],lt=l[7],pt=l[11],yt=l[15];return c[0]=f*L+d*H+m*X+p*ct,c[4]=f*P+d*G+m*j+p*lt,c[8]=f*T+d*K+m*k+p*pt,c[12]=f*D+d*it+m*Q+p*yt,c[1]=_*L+v*H+g*X+y*ct,c[5]=_*P+v*G+g*j+y*lt,c[9]=_*T+v*K+g*k+y*pt,c[13]=_*D+v*it+g*Q+y*yt,c[2]=b*L+C*H+M*X+S*ct,c[6]=b*P+C*G+M*j+S*lt,c[10]=b*T+C*K+M*k+S*pt,c[14]=b*D+C*it+M*Q+S*yt,c[3]=N*L+I*H+A*X+U*ct,c[7]=N*P+I*G+A*j+U*lt,c[11]=N*T+I*K+A*k+U*pt,c[15]=N*D+I*it+A*Q+U*yt,this}multiplyScalar(t){const i=this.elements;return i[0]*=t,i[4]*=t,i[8]*=t,i[12]*=t,i[1]*=t,i[5]*=t,i[9]*=t,i[13]*=t,i[2]*=t,i[6]*=t,i[10]*=t,i[14]*=t,i[3]*=t,i[7]*=t,i[11]*=t,i[15]*=t,this}determinant(){const t=this.elements,i=t[0],s=t[4],l=t[8],c=t[12],f=t[1],d=t[5],m=t[9],p=t[13],_=t[2],v=t[6],g=t[10],y=t[14],b=t[3],C=t[7],M=t[11],S=t[15],N=m*y-p*g,I=d*y-p*v,A=d*g-m*v,U=f*y-p*_,L=f*g-m*_,P=f*v-d*_;return i*(C*N-M*I+S*A)-s*(b*N-M*U+S*L)+l*(b*I-C*U+S*P)-c*(b*A-C*L+M*P)}determinantAffine(){const t=this.elements,i=t[0],s=t[4],l=t[8],c=t[1],f=t[5],d=t[9],m=t[2],p=t[6],_=t[10];return i*(f*_-d*p)-s*(c*_-d*m)+l*(c*p-f*m)}transpose(){const t=this.elements;let i;return i=t[1],t[1]=t[4],t[4]=i,i=t[2],t[2]=t[8],t[8]=i,i=t[6],t[6]=t[9],t[9]=i,i=t[3],t[3]=t[12],t[12]=i,i=t[7],t[7]=t[13],t[13]=i,i=t[11],t[11]=t[14],t[14]=i,this}setPosition(t,i,s){const l=this.elements;return t.isVector3?(l[12]=t.x,l[13]=t.y,l[14]=t.z):(l[12]=t,l[13]=i,l[14]=s),this}invert(){const t=this.elements,i=t[0],s=t[1],l=t[2],c=t[3],f=t[4],d=t[5],m=t[6],p=t[7],_=t[8],v=t[9],g=t[10],y=t[11],b=t[12],C=t[13],M=t[14],S=t[15],N=i*d-s*f,I=i*m-l*f,A=i*p-c*f,U=s*m-l*d,L=s*p-c*d,P=l*p-c*m,T=_*C-v*b,D=_*M-g*b,H=_*S-y*b,G=v*M-g*C,K=v*S-y*C,it=g*S-y*M,X=N*it-I*K+A*G+U*H-L*D+P*T;if(X===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const j=1/X;return t[0]=(d*it-m*K+p*G)*j,t[1]=(l*K-s*it-c*G)*j,t[2]=(C*P-M*L+S*U)*j,t[3]=(g*L-v*P-y*U)*j,t[4]=(m*H-f*it-p*D)*j,t[5]=(i*it-l*H+c*D)*j,t[6]=(M*A-b*P-S*I)*j,t[7]=(_*P-g*A+y*I)*j,t[8]=(f*K-d*H+p*T)*j,t[9]=(s*H-i*K-c*T)*j,t[10]=(b*L-C*A+S*N)*j,t[11]=(v*A-_*L-y*N)*j,t[12]=(d*D-f*G-m*T)*j,t[13]=(i*G-s*D+l*T)*j,t[14]=(C*I-b*U-M*N)*j,t[15]=(_*U-v*I+g*N)*j,this}scale(t){const i=this.elements,s=t.x,l=t.y,c=t.z;return i[0]*=s,i[4]*=l,i[8]*=c,i[1]*=s,i[5]*=l,i[9]*=c,i[2]*=s,i[6]*=l,i[10]*=c,i[3]*=s,i[7]*=l,i[11]*=c,this}getMaxScaleOnAxis(){const t=this.elements,i=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],s=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],l=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(i,s,l))}makeTranslation(t,i,s){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,i,0,0,1,s,0,0,0,1),this}makeRotationX(t){const i=Math.cos(t),s=Math.sin(t);return this.set(1,0,0,0,0,i,-s,0,0,s,i,0,0,0,0,1),this}makeRotationY(t){const i=Math.cos(t),s=Math.sin(t);return this.set(i,0,s,0,0,1,0,0,-s,0,i,0,0,0,0,1),this}makeRotationZ(t){const i=Math.cos(t),s=Math.sin(t);return this.set(i,-s,0,0,s,i,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,i){const s=Math.cos(i),l=Math.sin(i),c=1-s,f=t.x,d=t.y,m=t.z,p=c*f,_=c*d;return this.set(p*f+s,p*d-l*m,p*m+l*d,0,p*d+l*m,_*d+s,_*m-l*f,0,p*m-l*d,_*m+l*f,c*m*m+s,0,0,0,0,1),this}makeScale(t,i,s){return this.set(t,0,0,0,0,i,0,0,0,0,s,0,0,0,0,1),this}makeShear(t,i,s,l,c,f){return this.set(1,s,c,0,t,1,f,0,i,l,1,0,0,0,0,1),this}compose(t,i,s){const l=this.elements,c=i._x,f=i._y,d=i._z,m=i._w,p=c+c,_=f+f,v=d+d,g=c*p,y=c*_,b=c*v,C=f*_,M=f*v,S=d*v,N=m*p,I=m*_,A=m*v,U=s.x,L=s.y,P=s.z;return l[0]=(1-(C+S))*U,l[1]=(y+A)*U,l[2]=(b-I)*U,l[3]=0,l[4]=(y-A)*L,l[5]=(1-(g+S))*L,l[6]=(M+N)*L,l[7]=0,l[8]=(b+I)*P,l[9]=(M-N)*P,l[10]=(1-(g+C))*P,l[11]=0,l[12]=t.x,l[13]=t.y,l[14]=t.z,l[15]=1,this}decompose(t,i,s){const l=this.elements;t.x=l[12],t.y=l[13],t.z=l[14];const c=this.determinantAffine();if(c===0)return s.set(1,1,1),i.identity(),this;let f=ao.set(l[0],l[1],l[2]).length();const d=ao.set(l[4],l[5],l[6]).length(),m=ao.set(l[8],l[9],l[10]).length();c<0&&(f=-f),Ii.copy(this);const p=1/f,_=1/d,v=1/m;return Ii.elements[0]*=p,Ii.elements[1]*=p,Ii.elements[2]*=p,Ii.elements[4]*=_,Ii.elements[5]*=_,Ii.elements[6]*=_,Ii.elements[8]*=v,Ii.elements[9]*=v,Ii.elements[10]*=v,i.setFromRotationMatrix(Ii),s.x=f,s.y=d,s.z=m,this}makePerspective(t,i,s,l,c,f,d=la,m=!1){const p=this.elements,_=2*c/(i-t),v=2*c/(s-l),g=(i+t)/(i-t),y=(s+l)/(s-l);let b,C;if(m)b=c/(f-c),C=f*c/(f-c);else if(d===la)b=-(f+c)/(f-c),C=-2*f*c/(f-c);else if(d===Ql)b=-f/(f-c),C=-f*c/(f-c);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+d);return p[0]=_,p[4]=0,p[8]=g,p[12]=0,p[1]=0,p[5]=v,p[9]=y,p[13]=0,p[2]=0,p[6]=0,p[10]=b,p[14]=C,p[3]=0,p[7]=0,p[11]=-1,p[15]=0,this}makeOrthographic(t,i,s,l,c,f,d=la,m=!1){const p=this.elements,_=2/(i-t),v=2/(s-l),g=-(i+t)/(i-t),y=-(s+l)/(s-l);let b,C;if(m)b=1/(f-c),C=f/(f-c);else if(d===la)b=-2/(f-c),C=-(f+c)/(f-c);else if(d===Ql)b=-1/(f-c),C=-c/(f-c);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+d);return p[0]=_,p[4]=0,p[8]=0,p[12]=g,p[1]=0,p[5]=v,p[9]=0,p[13]=y,p[2]=0,p[6]=0,p[10]=b,p[14]=C,p[3]=0,p[7]=0,p[11]=0,p[15]=1,this}equals(t){const i=this.elements,s=t.elements;for(let l=0;l<16;l++)if(i[l]!==s[l])return!1;return!0}fromArray(t,i=0){for(let s=0;s<16;s++)this.elements[s]=t[s+i];return this}toArray(t=[],i=0){const s=this.elements;return t[i]=s[0],t[i+1]=s[1],t[i+2]=s[2],t[i+3]=s[3],t[i+4]=s[4],t[i+5]=s[5],t[i+6]=s[6],t[i+7]=s[7],t[i+8]=s[8],t[i+9]=s[9],t[i+10]=s[10],t[i+11]=s[11],t[i+12]=s[12],t[i+13]=s[13],t[i+14]=s[14],t[i+15]=s[15],t}};_f.prototype.isMatrix4=!0;let nn=_f;const ao=new tt,Ii=new nn,aT=new tt(0,0,0),sT=new tt(1,1,1),_s=new tt,wu=new tt,mi=new tt,kx=new nn,Wx=new Ha;class da{constructor(t=0,i=0,s=0,l=da.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=i,this._z=s,this._order=l}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,i,s,l=this._order){return this._x=t,this._y=i,this._z=s,this._order=l,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,i=this._order,s=!0){const l=t.elements,c=l[0],f=l[4],d=l[8],m=l[1],p=l[5],_=l[9],v=l[2],g=l[6],y=l[10];switch(i){case"XYZ":this._y=Math.asin(De(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(-_,y),this._z=Math.atan2(-f,c)):(this._x=Math.atan2(g,p),this._z=0);break;case"YXZ":this._x=Math.asin(-De(_,-1,1)),Math.abs(_)<.9999999?(this._y=Math.atan2(d,y),this._z=Math.atan2(m,p)):(this._y=Math.atan2(-v,c),this._z=0);break;case"ZXY":this._x=Math.asin(De(g,-1,1)),Math.abs(g)<.9999999?(this._y=Math.atan2(-v,y),this._z=Math.atan2(-f,p)):(this._y=0,this._z=Math.atan2(m,c));break;case"ZYX":this._y=Math.asin(-De(v,-1,1)),Math.abs(v)<.9999999?(this._x=Math.atan2(g,y),this._z=Math.atan2(m,c)):(this._x=0,this._z=Math.atan2(-f,p));break;case"YZX":this._z=Math.asin(De(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(-_,p),this._y=Math.atan2(-v,c)):(this._x=0,this._y=Math.atan2(d,y));break;case"XZY":this._z=Math.asin(-De(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(g,p),this._y=Math.atan2(d,c)):(this._x=Math.atan2(-_,y),this._y=0);break;default:_e("Euler: .setFromRotationMatrix() encountered an unknown order: "+i)}return this._order=i,s===!0&&this._onChangeCallback(),this}setFromQuaternion(t,i,s){return kx.makeRotationFromQuaternion(t),this.setFromRotationMatrix(kx,i,s)}setFromVector3(t,i=this._order){return this.set(t.x,t.y,t.z,i)}reorder(t){return Wx.setFromEuler(this),this.setFromQuaternion(Wx,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],i=0){return t[i]=this._x,t[i+1]=this._y,t[i+2]=this._z,t[i+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}da.DEFAULT_ORDER="XYZ";class e0{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let rT=0;const qx=new tt,so=new Ha,Da=new nn,Cu=new tt,Cl=new tt,oT=new tt,lT=new Ha,Yx=new tt(1,0,0),Zx=new tt(0,1,0),Kx=new tt(0,0,1),Jx={type:"added"},cT={type:"removed"},ro={type:"childadded",child:null},dp={type:"childremoved",child:null};class Mn extends dr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:rT++}),this.uuid=Co(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Mn.DEFAULT_UP.clone();const t=new tt,i=new da,s=new Ha,l=new tt(1,1,1);function c(){s.setFromEuler(i,!1)}function f(){i.setFromQuaternion(s,void 0,!1)}i._onChange(c),s._onChange(f),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:i},quaternion:{configurable:!0,enumerable:!0,value:s},scale:{configurable:!0,enumerable:!0,value:l},modelViewMatrix:{value:new nn},normalMatrix:{value:new Ee}}),this.matrix=new nn,this.matrixWorld=new nn,this.matrixAutoUpdate=Mn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Mn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new e0,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,i){this.quaternion.setFromAxisAngle(t,i)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,i){return so.setFromAxisAngle(t,i),this.quaternion.multiply(so),this}rotateOnWorldAxis(t,i){return so.setFromAxisAngle(t,i),this.quaternion.premultiply(so),this}rotateX(t){return this.rotateOnAxis(Yx,t)}rotateY(t){return this.rotateOnAxis(Zx,t)}rotateZ(t){return this.rotateOnAxis(Kx,t)}translateOnAxis(t,i){return qx.copy(t).applyQuaternion(this.quaternion),this.position.add(qx.multiplyScalar(i)),this}translateX(t){return this.translateOnAxis(Yx,t)}translateY(t){return this.translateOnAxis(Zx,t)}translateZ(t){return this.translateOnAxis(Kx,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Da.copy(this.matrixWorld).invert())}lookAt(t,i,s){t.isVector3?Cu.copy(t):Cu.set(t,i,s);const l=this.parent;this.updateWorldMatrix(!0,!1),Cl.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Da.lookAt(Cl,Cu,this.up):Da.lookAt(Cu,Cl,this.up),this.quaternion.setFromRotationMatrix(Da),l&&(Da.extractRotation(l.matrixWorld),so.setFromRotationMatrix(Da),this.quaternion.premultiply(so.invert()))}add(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.add(arguments[i]);return this}return t===this?(Ge("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Jx),ro.child=t,this.dispatchEvent(ro),ro.child=null):Ge("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let s=0;s<arguments.length;s++)this.remove(arguments[s]);return this}const i=this.children.indexOf(t);return i!==-1&&(t.parent=null,this.children.splice(i,1),t.dispatchEvent(cT),dp.child=t,this.dispatchEvent(dp),dp.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Da.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Da.multiply(t.parent.matrixWorld)),t.applyMatrix4(Da),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Jx),ro.child=t,this.dispatchEvent(ro),ro.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,i){if(this[t]===i)return this;for(let s=0,l=this.children.length;s<l;s++){const f=this.children[s].getObjectByProperty(t,i);if(f!==void 0)return f}}getObjectsByProperty(t,i,s=[]){this[t]===i&&s.push(this);const l=this.children;for(let c=0,f=l.length;c<f;c++)l[c].getObjectsByProperty(t,i,s);return s}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Cl,t,oT),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Cl,lT,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const i=this.matrixWorld.elements;return t.set(i[8],i[9],i[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);const i=this.children;for(let s=0,l=i.length;s<l;s++)i[s].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const i=this.children;for(let s=0,l=i.length;s<l;s++)i[s].traverseVisible(t)}traverseAncestors(t){const i=this.parent;i!==null&&(t(i),i.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const t=this.pivot;if(t!==null){const i=t.x,s=t.y,l=t.z,c=this.matrix.elements;c[12]+=i-c[0]*i-c[4]*s-c[8]*l,c[13]+=s-c[1]*i-c[5]*s-c[9]*l,c[14]+=l-c[2]*i-c[6]*s-c[10]*l}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const i=this.children;for(let s=0,l=i.length;s<l;s++)i[s].updateMatrixWorld(t)}updateWorldMatrix(t,i,s=!1){const l=this.parent;if(t===!0&&l!==null&&l.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||s)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,s=!0),i===!0){const c=this.children;for(let f=0,d=c.length;f<d;f++)c[f].updateWorldMatrix(!1,!0,s)}}toJSON(t){const i=t===void 0||typeof t=="string",s={};i&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},s.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const l={};l.uuid=this.uuid,l.type=this.type,l.name=this.name,l.castShadow=this.castShadow,l.receiveShadow=this.receiveShadow,l.visible=this.visible,l.frustumCulled=this.frustumCulled,l.renderOrder=this.renderOrder,l.static=this.static,l.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(l.userData=this.userData),l.layers=this.layers.mask,l.matrix=this.matrix.toArray(),l.up=this.up.toArray(),this.pivot!==null&&(l.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(l.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(l.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(l.type="InstancedMesh",l.count=this.count,l.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(l.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(l.type="BatchedMesh",l.perObjectFrustumCulled=this.perObjectFrustumCulled,l.sortObjects=this.sortObjects,l.drawRanges=this._drawRanges,l.reservedRanges=this._reservedRanges,l.geometryInfo=this._geometryInfo.map(d=>({...d,boundingBox:d.boundingBox?d.boundingBox.toJSON():void 0,boundingSphere:d.boundingSphere?d.boundingSphere.toJSON():void 0})),l.instanceInfo=this._instanceInfo.map(d=>({...d})),l.availableInstanceIds=this._availableInstanceIds.slice(),l.availableGeometryIds=this._availableGeometryIds.slice(),l.nextIndexStart=this._nextIndexStart,l.nextVertexStart=this._nextVertexStart,l.geometryCount=this._geometryCount,l.maxInstanceCount=this._maxInstanceCount,l.maxVertexCount=this._maxVertexCount,l.maxIndexCount=this._maxIndexCount,l.geometryInitialized=this._geometryInitialized,l.matricesTexture=this._matricesTexture.toJSON(t),l.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(l.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(l.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(l.boundingBox=this.boundingBox.toJSON()));function c(d,m){return d[m.uuid]===void 0&&(d[m.uuid]=m.toJSON(t)),m.uuid}if(this.isScene)this.background&&(this.background.isColor?l.background=this.background.toJSON():this.background.isTexture&&(l.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(l.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){l.geometry=c(t.geometries,this.geometry);const d=this.geometry.parameters;if(d!==void 0&&d.shapes!==void 0){const m=d.shapes;if(Array.isArray(m))for(let p=0,_=m.length;p<_;p++){const v=m[p];c(t.shapes,v)}else c(t.shapes,m)}}if(this.isSkinnedMesh&&(l.bindMode=this.bindMode,l.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(c(t.skeletons,this.skeleton),l.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const d=[];for(let m=0,p=this.material.length;m<p;m++)d.push(c(t.materials,this.material[m]));l.material=d}else l.material=c(t.materials,this.material);if(this.children.length>0){l.children=[];for(let d=0;d<this.children.length;d++)l.children.push(this.children[d].toJSON(t).object)}if(this.animations.length>0){l.animations=[];for(let d=0;d<this.animations.length;d++){const m=this.animations[d];l.animations.push(c(t.animations,m))}}if(i){const d=f(t.geometries),m=f(t.materials),p=f(t.textures),_=f(t.images),v=f(t.shapes),g=f(t.skeletons),y=f(t.animations),b=f(t.nodes);d.length>0&&(s.geometries=d),m.length>0&&(s.materials=m),p.length>0&&(s.textures=p),_.length>0&&(s.images=_),v.length>0&&(s.shapes=v),g.length>0&&(s.skeletons=g),y.length>0&&(s.animations=y),b.length>0&&(s.nodes=b)}return s.object=l,s;function f(d){const m=[];for(const p in d){const _=d[p];delete _.metadata,m.push(_)}return m}}clone(t){return new this.constructor().copy(this,t)}copy(t,i=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),i===!0)for(let s=0;s<t.children.length;s++){const l=t.children[s];this.add(l.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}Mn.DEFAULT_UP=new tt(0,1,0);Mn.DEFAULT_MATRIX_AUTO_UPDATE=!0;Mn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class ar extends Mn{constructor(){super(),this.isGroup=!0,this.type="Group"}}const uT={type:"move"};class pp{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ar,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ar,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new tt,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new tt),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ar,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new tt,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new tt,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const i=this._hand;if(i)for(const s of t.hand.values())this._getHandJoint(i,s)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,i,s){let l=null,c=null,f=null;const d=this._targetRay,m=this._grip,p=this._hand;if(t&&i.session.visibilityState!=="visible-blurred"){if(p&&t.hand){f=!0;for(const C of t.hand.values()){const M=i.getJointPose(C,s),S=this._getHandJoint(p,C);M!==null&&(S.matrix.fromArray(M.transform.matrix),S.matrix.decompose(S.position,S.rotation,S.scale),S.matrixWorldNeedsUpdate=!0,S.jointRadius=M.radius),S.visible=M!==null}const _=p.joints["index-finger-tip"],v=p.joints["thumb-tip"],g=_.position.distanceTo(v.position),y=.02,b=.005;p.inputState.pinching&&g>y+b?(p.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!p.inputState.pinching&&g<=y-b&&(p.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else m!==null&&t.gripSpace&&(c=i.getPose(t.gripSpace,s),c!==null&&(m.matrix.fromArray(c.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,c.linearVelocity?(m.hasLinearVelocity=!0,m.linearVelocity.copy(c.linearVelocity)):m.hasLinearVelocity=!1,c.angularVelocity?(m.hasAngularVelocity=!0,m.angularVelocity.copy(c.angularVelocity)):m.hasAngularVelocity=!1,m.eventsEnabled&&m.dispatchEvent({type:"gripUpdated",data:t,target:this})));d!==null&&(l=i.getPose(t.targetRaySpace,s),l===null&&c!==null&&(l=c),l!==null&&(d.matrix.fromArray(l.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,l.linearVelocity?(d.hasLinearVelocity=!0,d.linearVelocity.copy(l.linearVelocity)):d.hasLinearVelocity=!1,l.angularVelocity?(d.hasAngularVelocity=!0,d.angularVelocity.copy(l.angularVelocity)):d.hasAngularVelocity=!1,this.dispatchEvent(uT)))}return d!==null&&(d.visible=l!==null),m!==null&&(m.visible=c!==null),p!==null&&(p.visible=f!==null),this}_getHandJoint(t,i){if(t.joints[i.jointName]===void 0){const s=new ar;s.matrixAutoUpdate=!1,s.visible=!1,t.joints[i.jointName]=s,t.add(s)}return t.joints[i.jointName]}}const TS={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},xs={h:0,s:0,l:0},Nu={h:0,s:0,l:0};function mp(r,t,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?r+(t-r)*6*i:i<1/2?t:i<2/3?r+(t-r)*6*(2/3-i):r}class be{constructor(t,i,s){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,i,s)}set(t,i,s){if(i===void 0&&s===void 0){const l=t;l&&l.isColor?this.copy(l):typeof l=="number"?this.setHex(l):typeof l=="string"&&this.setStyle(l)}else this.setRGB(t,i,s);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,i=ni){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,He.colorSpaceToWorking(this,i),this}setRGB(t,i,s,l=He.workingColorSpace){return this.r=t,this.g=i,this.b=s,He.colorSpaceToWorking(this,l),this}setHSL(t,i,s,l=He.workingColorSpace){if(t=Qb(t,1),i=De(i,0,1),s=De(s,0,1),i===0)this.r=this.g=this.b=s;else{const c=s<=.5?s*(1+i):s+i-s*i,f=2*s-c;this.r=mp(f,c,t+1/3),this.g=mp(f,c,t),this.b=mp(f,c,t-1/3)}return He.colorSpaceToWorking(this,l),this}setStyle(t,i=ni){function s(c){c!==void 0&&parseFloat(c)<1&&_e("Color: Alpha component of "+t+" will be ignored.")}let l;if(l=/^(\w+)\(([^\)]*)\)/.exec(t)){let c;const f=l[1],d=l[2];switch(f){case"rgb":case"rgba":if(c=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return s(c[4]),this.setRGB(Math.min(255,parseInt(c[1],10))/255,Math.min(255,parseInt(c[2],10))/255,Math.min(255,parseInt(c[3],10))/255,i);if(c=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return s(c[4]),this.setRGB(Math.min(100,parseInt(c[1],10))/100,Math.min(100,parseInt(c[2],10))/100,Math.min(100,parseInt(c[3],10))/100,i);break;case"hsl":case"hsla":if(c=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(d))return s(c[4]),this.setHSL(parseFloat(c[1])/360,parseFloat(c[2])/100,parseFloat(c[3])/100,i);break;default:_e("Color: Unknown color model "+t)}}else if(l=/^\#([A-Fa-f\d]+)$/.exec(t)){const c=l[1],f=c.length;if(f===3)return this.setRGB(parseInt(c.charAt(0),16)/15,parseInt(c.charAt(1),16)/15,parseInt(c.charAt(2),16)/15,i);if(f===6)return this.setHex(parseInt(c,16),i);_e("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,i);return this}setColorName(t,i=ni){const s=TS[t.toLowerCase()];return s!==void 0?this.setHex(s,i):_e("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Va(t.r),this.g=Va(t.g),this.b=Va(t.b),this}copyLinearToSRGB(t){return this.r=Eo(t.r),this.g=Eo(t.g),this.b=Eo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ni){return He.workingToColorSpace(Hn.copy(this),t),Math.round(De(Hn.r*255,0,255))*65536+Math.round(De(Hn.g*255,0,255))*256+Math.round(De(Hn.b*255,0,255))}getHexString(t=ni){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,i=He.workingColorSpace){He.workingToColorSpace(Hn.copy(this),i);const s=Hn.r,l=Hn.g,c=Hn.b,f=Math.max(s,l,c),d=Math.min(s,l,c);let m,p;const _=(d+f)/2;if(d===f)m=0,p=0;else{const v=f-d;switch(p=_<=.5?v/(f+d):v/(2-f-d),f){case s:m=(l-c)/v+(l<c?6:0);break;case l:m=(c-s)/v+2;break;case c:m=(s-l)/v+4;break}m/=6}return t.h=m,t.s=p,t.l=_,t}getRGB(t,i=He.workingColorSpace){return He.workingToColorSpace(Hn.copy(this),i),t.r=Hn.r,t.g=Hn.g,t.b=Hn.b,t}getStyle(t=ni){He.workingToColorSpace(Hn.copy(this),t);const i=Hn.r,s=Hn.g,l=Hn.b;return t!==ni?`color(${t} ${i.toFixed(3)} ${s.toFixed(3)} ${l.toFixed(3)})`:`rgb(${Math.round(i*255)},${Math.round(s*255)},${Math.round(l*255)})`}offsetHSL(t,i,s){return this.getHSL(xs),this.setHSL(xs.h+t,xs.s+i,xs.l+s)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,i){return this.r=t.r+i.r,this.g=t.g+i.g,this.b=t.b+i.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,i){return this.r+=(t.r-this.r)*i,this.g+=(t.g-this.g)*i,this.b+=(t.b-this.b)*i,this}lerpColors(t,i,s){return this.r=t.r+(i.r-t.r)*s,this.g=t.g+(i.g-t.g)*s,this.b=t.b+(i.b-t.b)*s,this}lerpHSL(t,i){this.getHSL(xs),t.getHSL(Nu);const s=lp(xs.h,Nu.h,i),l=lp(xs.s,Nu.s,i),c=lp(xs.l,Nu.l,i);return this.setHSL(s,l,c),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const i=this.r,s=this.g,l=this.b,c=t.elements;return this.r=c[0]*i+c[3]*s+c[6]*l,this.g=c[1]*i+c[4]*s+c[7]*l,this.b=c[2]*i+c[5]*s+c[8]*l,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,i=0){return this.r=t[i],this.g=t[i+1],this.b=t[i+2],this}toArray(t=[],i=0){return t[i]=this.r,t[i+1]=this.g,t[i+2]=this.b,t}fromBufferAttribute(t,i){return this.r=t.getX(i),this.g=t.getY(i),this.b=t.getZ(i),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Hn=new be;be.NAMES=TS;class n0{constructor(t,i=1,s=1e3){this.isFog=!0,this.name="",this.color=new be(t),this.near=i,this.far=s}clone(){return new n0(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class AS extends Mn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new da,this.environmentIntensity=1,this.environmentRotation=new da,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,i){return super.copy(t,i),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const i=super.toJSON(t);return this.fog!==null&&(i.object.fog=this.fog.toJSON()),i.object.backgroundBlurriness=this.backgroundBlurriness,i.object.backgroundIntensity=this.backgroundIntensity,i.object.backgroundRotation=this.backgroundRotation.toArray(),i.object.environmentIntensity=this.environmentIntensity,i.object.environmentRotation=this.environmentRotation.toArray(),i}}const zi=new tt,La=new tt,gp=new tt,Ua=new tt,oo=new tt,lo=new tt,Qx=new tt,vp=new tt,_p=new tt,xp=new tt,Sp=new cn,yp=new cn,Mp=new cn;class Fi{constructor(t=new tt,i=new tt,s=new tt){this.a=t,this.b=i,this.c=s}static getNormal(t,i,s,l){l.subVectors(s,i),zi.subVectors(t,i),l.cross(zi);const c=l.lengthSq();return c>0?l.multiplyScalar(1/Math.sqrt(c)):l.set(0,0,0)}static getBarycoord(t,i,s,l,c){zi.subVectors(l,i),La.subVectors(s,i),gp.subVectors(t,i);const f=zi.dot(zi),d=zi.dot(La),m=zi.dot(gp),p=La.dot(La),_=La.dot(gp),v=f*p-d*d;if(v===0)return c.set(0,0,0),null;const g=1/v,y=(p*m-d*_)*g,b=(f*_-d*m)*g;return c.set(1-y-b,b,y)}static containsPoint(t,i,s,l){return this.getBarycoord(t,i,s,l,Ua)===null?!1:Ua.x>=0&&Ua.y>=0&&Ua.x+Ua.y<=1}static getInterpolation(t,i,s,l,c,f,d,m){return this.getBarycoord(t,i,s,l,Ua)===null?(m.x=0,m.y=0,"z"in m&&(m.z=0),"w"in m&&(m.w=0),null):(m.setScalar(0),m.addScaledVector(c,Ua.x),m.addScaledVector(f,Ua.y),m.addScaledVector(d,Ua.z),m)}static getInterpolatedAttribute(t,i,s,l,c,f){return Sp.setScalar(0),yp.setScalar(0),Mp.setScalar(0),Sp.fromBufferAttribute(t,i),yp.fromBufferAttribute(t,s),Mp.fromBufferAttribute(t,l),f.setScalar(0),f.addScaledVector(Sp,c.x),f.addScaledVector(yp,c.y),f.addScaledVector(Mp,c.z),f}static isFrontFacing(t,i,s,l){return zi.subVectors(s,i),La.subVectors(t,i),zi.cross(La).dot(l)<0}set(t,i,s){return this.a.copy(t),this.b.copy(i),this.c.copy(s),this}setFromPointsAndIndices(t,i,s,l){return this.a.copy(t[i]),this.b.copy(t[s]),this.c.copy(t[l]),this}setFromAttributeAndIndices(t,i,s,l){return this.a.fromBufferAttribute(t,i),this.b.fromBufferAttribute(t,s),this.c.fromBufferAttribute(t,l),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return zi.subVectors(this.c,this.b),La.subVectors(this.a,this.b),zi.cross(La).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Fi.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,i){return Fi.getBarycoord(t,this.a,this.b,this.c,i)}getInterpolation(t,i,s,l,c){return Fi.getInterpolation(t,this.a,this.b,this.c,i,s,l,c)}containsPoint(t){return Fi.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Fi.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,i){const s=this.a,l=this.b,c=this.c;let f,d;oo.subVectors(l,s),lo.subVectors(c,s),vp.subVectors(t,s);const m=oo.dot(vp),p=lo.dot(vp);if(m<=0&&p<=0)return i.copy(s);_p.subVectors(t,l);const _=oo.dot(_p),v=lo.dot(_p);if(_>=0&&v<=_)return i.copy(l);const g=m*v-_*p;if(g<=0&&m>=0&&_<=0)return f=m/(m-_),i.copy(s).addScaledVector(oo,f);xp.subVectors(t,c);const y=oo.dot(xp),b=lo.dot(xp);if(b>=0&&y<=b)return i.copy(c);const C=y*p-m*b;if(C<=0&&p>=0&&b<=0)return d=p/(p-b),i.copy(s).addScaledVector(lo,d);const M=_*b-y*v;if(M<=0&&v-_>=0&&y-b>=0)return Qx.subVectors(c,l),d=(v-_)/(v-_+(y-b)),i.copy(l).addScaledVector(Qx,d);const S=1/(M+C+g);return f=C*S,d=g*S,i.copy(s).addScaledVector(oo,f).addScaledVector(lo,d)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}class pr{constructor(t=new tt(1/0,1/0,1/0),i=new tt(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=i}set(t,i){return this.min.copy(t),this.max.copy(i),this}setFromArray(t){this.makeEmpty();for(let i=0,s=t.length;i<s;i+=3)this.expandByPoint(Bi.fromArray(t,i));return this}setFromBufferAttribute(t){this.makeEmpty();for(let i=0,s=t.count;i<s;i++)this.expandByPoint(Bi.fromBufferAttribute(t,i));return this}setFromPoints(t){this.makeEmpty();for(let i=0,s=t.length;i<s;i++)this.expandByPoint(t[i]);return this}setFromCenterAndSize(t,i){const s=Bi.copy(i).multiplyScalar(.5);return this.min.copy(t).sub(s),this.max.copy(t).add(s),this}setFromObject(t,i=!1){return this.makeEmpty(),this.expandByObject(t,i)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,i=!1){t.updateWorldMatrix(!1,!1);const s=t.geometry;if(s!==void 0){const c=s.getAttribute("position");if(i===!0&&c!==void 0&&t.isInstancedMesh!==!0)for(let f=0,d=c.count;f<d;f++)t.isMesh===!0?t.getVertexPosition(f,Bi):Bi.fromBufferAttribute(c,f),Bi.applyMatrix4(t.matrixWorld),this.expandByPoint(Bi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Du.copy(t.boundingBox)):(s.boundingBox===null&&s.computeBoundingBox(),Du.copy(s.boundingBox)),Du.applyMatrix4(t.matrixWorld),this.union(Du)}const l=t.children;for(let c=0,f=l.length;c<f;c++)this.expandByObject(l[c],i);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,i){return i.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Bi),Bi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let i,s;return t.normal.x>0?(i=t.normal.x*this.min.x,s=t.normal.x*this.max.x):(i=t.normal.x*this.max.x,s=t.normal.x*this.min.x),t.normal.y>0?(i+=t.normal.y*this.min.y,s+=t.normal.y*this.max.y):(i+=t.normal.y*this.max.y,s+=t.normal.y*this.min.y),t.normal.z>0?(i+=t.normal.z*this.min.z,s+=t.normal.z*this.max.z):(i+=t.normal.z*this.max.z,s+=t.normal.z*this.min.z),i<=-t.constant&&s>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Nl),Lu.subVectors(this.max,Nl),co.subVectors(t.a,Nl),uo.subVectors(t.b,Nl),fo.subVectors(t.c,Nl),Ss.subVectors(uo,co),ys.subVectors(fo,uo),Ks.subVectors(co,fo);let i=[0,-Ss.z,Ss.y,0,-ys.z,ys.y,0,-Ks.z,Ks.y,Ss.z,0,-Ss.x,ys.z,0,-ys.x,Ks.z,0,-Ks.x,-Ss.y,Ss.x,0,-ys.y,ys.x,0,-Ks.y,Ks.x,0];return!Ep(i,co,uo,fo,Lu)||(i=[1,0,0,0,1,0,0,0,1],!Ep(i,co,uo,fo,Lu))?!1:(Uu.crossVectors(Ss,ys),i=[Uu.x,Uu.y,Uu.z],Ep(i,co,uo,fo,Lu))}clampPoint(t,i){return i.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Bi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Bi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Oa[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Oa[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Oa[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Oa[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Oa[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Oa[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Oa[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Oa[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Oa),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const Oa=[new tt,new tt,new tt,new tt,new tt,new tt,new tt,new tt],Bi=new tt,Du=new pr,co=new tt,uo=new tt,fo=new tt,Ss=new tt,ys=new tt,Ks=new tt,Nl=new tt,Lu=new tt,Uu=new tt,Js=new tt;function Ep(r,t,i,s,l){for(let c=0,f=r.length-3;c<=f;c+=3){Js.fromArray(r,c);const d=l.x*Math.abs(Js.x)+l.y*Math.abs(Js.y)+l.z*Math.abs(Js.z),m=t.dot(Js),p=i.dot(Js),_=s.dot(Js);if(Math.max(-Math.max(m,p,_),Math.min(m,p,_))>d)return!1}return!0}const yn=new tt,Ou=new Bt;let fT=0;class ua extends dr{constructor(t,i,s=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:fT++}),this.name="",this.array=t,this.itemSize=i,this.count=t!==void 0?t.length/i:0,this.normalized=s,this.usage=qb,this.updateRanges=[],this.gpuType=Hi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,i){this.updateRanges.push({start:t,count:i})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,i,s){t*=this.itemSize,s*=i.itemSize;for(let l=0,c=this.itemSize;l<c;l++)this.array[t+l]=i.array[s+l];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let i=0,s=this.count;i<s;i++)Ou.fromBufferAttribute(this,i),Ou.applyMatrix3(t),this.setXY(i,Ou.x,Ou.y);else if(this.itemSize===3)for(let i=0,s=this.count;i<s;i++)yn.fromBufferAttribute(this,i),yn.applyMatrix3(t),this.setXYZ(i,yn.x,yn.y,yn.z);return this}applyMatrix4(t){for(let i=0,s=this.count;i<s;i++)yn.fromBufferAttribute(this,i),yn.applyMatrix4(t),this.setXYZ(i,yn.x,yn.y,yn.z);return this}applyNormalMatrix(t){for(let i=0,s=this.count;i<s;i++)yn.fromBufferAttribute(this,i),yn.applyNormalMatrix(t),this.setXYZ(i,yn.x,yn.y,yn.z);return this}transformDirection(t){for(let i=0,s=this.count;i<s;i++)yn.fromBufferAttribute(this,i),yn.transformDirection(t),this.setXYZ(i,yn.x,yn.y,yn.z);return this}set(t,i=0){return this.array.set(t,i),this}getComponent(t,i){let s=this.array[t*this.itemSize+i];return this.normalized&&(s=wl(s,this.array)),s}setComponent(t,i,s){return this.normalized&&(s=ei(s,this.array)),this.array[t*this.itemSize+i]=s,this}getX(t){let i=this.array[t*this.itemSize];return this.normalized&&(i=wl(i,this.array)),i}setX(t,i){return this.normalized&&(i=ei(i,this.array)),this.array[t*this.itemSize]=i,this}getY(t){let i=this.array[t*this.itemSize+1];return this.normalized&&(i=wl(i,this.array)),i}setY(t,i){return this.normalized&&(i=ei(i,this.array)),this.array[t*this.itemSize+1]=i,this}getZ(t){let i=this.array[t*this.itemSize+2];return this.normalized&&(i=wl(i,this.array)),i}setZ(t,i){return this.normalized&&(i=ei(i,this.array)),this.array[t*this.itemSize+2]=i,this}getW(t){let i=this.array[t*this.itemSize+3];return this.normalized&&(i=wl(i,this.array)),i}setW(t,i){return this.normalized&&(i=ei(i,this.array)),this.array[t*this.itemSize+3]=i,this}setXY(t,i,s){return t*=this.itemSize,this.normalized&&(i=ei(i,this.array),s=ei(s,this.array)),this.array[t+0]=i,this.array[t+1]=s,this}setXYZ(t,i,s,l){return t*=this.itemSize,this.normalized&&(i=ei(i,this.array),s=ei(s,this.array),l=ei(l,this.array)),this.array[t+0]=i,this.array[t+1]=s,this.array[t+2]=l,this}setXYZW(t,i,s,l,c){return t*=this.itemSize,this.normalized&&(i=ei(i,this.array),s=ei(s,this.array),l=ei(l,this.array),c=ei(c,this.array)),this.array[t+0]=i,this.array[t+1]=s,this.array[t+2]=l,this.array[t+3]=c,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}}class RS extends ua{constructor(t,i,s){super(new Uint16Array(t),i,s)}}class wS extends ua{constructor(t,i,s){super(new Uint32Array(t),i,s)}}class fn extends ua{constructor(t,i,s){super(new Float32Array(t),i,s)}}const hT=new pr,Dl=new tt,bp=new tt;class ic{constructor(t=new tt,i=-1){this.isSphere=!0,this.center=t,this.radius=i}set(t,i){return this.center.copy(t),this.radius=i,this}setFromPoints(t,i){const s=this.center;i!==void 0?s.copy(i):hT.setFromPoints(t).getCenter(s);let l=0;for(let c=0,f=t.length;c<f;c++)l=Math.max(l,s.distanceToSquared(t[c]));return this.radius=Math.sqrt(l),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const i=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=i*i}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,i){const s=this.center.distanceToSquared(t);return i.copy(t),s>this.radius*this.radius&&(i.sub(this.center).normalize(),i.multiplyScalar(this.radius).add(this.center)),i}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Dl.subVectors(t,this.center);const i=Dl.lengthSq();if(i>this.radius*this.radius){const s=Math.sqrt(i),l=(s-this.radius)*.5;this.center.addScaledVector(Dl,l/s),this.radius+=l}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(bp.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Dl.copy(t.center).add(bp)),this.expandByPoint(Dl.copy(t.center).sub(bp))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}let dT=0;const Ci=new nn,Tp=new Mn,ho=new tt,gi=new pr,Ll=new pr,Nn=new tt;class ai extends dr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:dT++}),this.uuid=Co(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Yb(t)?wS:RS)(t,1):this.index=t,this}setIndirect(t,i=0){return this.indirect=t,this.indirectOffset=i,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,i){return this.attributes[t]=i,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,i,s=0){this.groups.push({start:t,count:i,materialIndex:s})}clearGroups(){this.groups=[]}setDrawRange(t,i){this.drawRange.start=t,this.drawRange.count=i}applyMatrix4(t){const i=this.attributes.position;i!==void 0&&(i.applyMatrix4(t),i.needsUpdate=!0);const s=this.attributes.normal;if(s!==void 0){const c=new Ee().getNormalMatrix(t);s.applyNormalMatrix(c),s.needsUpdate=!0}const l=this.attributes.tangent;return l!==void 0&&(l.transformDirection(t),l.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Ci.makeRotationFromQuaternion(t),this.applyMatrix4(Ci),this}rotateX(t){return Ci.makeRotationX(t),this.applyMatrix4(Ci),this}rotateY(t){return Ci.makeRotationY(t),this.applyMatrix4(Ci),this}rotateZ(t){return Ci.makeRotationZ(t),this.applyMatrix4(Ci),this}translate(t,i,s){return Ci.makeTranslation(t,i,s),this.applyMatrix4(Ci),this}scale(t,i,s){return Ci.makeScale(t,i,s),this.applyMatrix4(Ci),this}lookAt(t){return Tp.lookAt(t),Tp.updateMatrix(),this.applyMatrix4(Tp.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ho).negate(),this.translate(ho.x,ho.y,ho.z),this}setFromPoints(t){const i=this.getAttribute("position");if(i===void 0){const s=[];for(let l=0,c=t.length;l<c;l++){const f=t[l];s.push(f.x,f.y,f.z||0)}this.setAttribute("position",new fn(s,3))}else{const s=Math.min(t.length,i.count);for(let l=0;l<s;l++){const c=t[l];i.setXYZ(l,c.x,c.y,c.z||0)}t.length>i.count&&_e("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),i.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new pr);const t=this.attributes.position,i=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ge("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new tt(-1/0,-1/0,-1/0),new tt(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),i)for(let s=0,l=i.length;s<l;s++){const c=i[s];gi.setFromBufferAttribute(c),this.morphTargetsRelative?(Nn.addVectors(this.boundingBox.min,gi.min),this.boundingBox.expandByPoint(Nn),Nn.addVectors(this.boundingBox.max,gi.max),this.boundingBox.expandByPoint(Nn)):(this.boundingBox.expandByPoint(gi.min),this.boundingBox.expandByPoint(gi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ge('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ic);const t=this.attributes.position,i=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ge("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new tt,1/0);return}if(t){const s=this.boundingSphere.center;if(gi.setFromBufferAttribute(t),i)for(let c=0,f=i.length;c<f;c++){const d=i[c];Ll.setFromBufferAttribute(d),this.morphTargetsRelative?(Nn.addVectors(gi.min,Ll.min),gi.expandByPoint(Nn),Nn.addVectors(gi.max,Ll.max),gi.expandByPoint(Nn)):(gi.expandByPoint(Ll.min),gi.expandByPoint(Ll.max))}gi.getCenter(s);let l=0;for(let c=0,f=t.count;c<f;c++)Nn.fromBufferAttribute(t,c),l=Math.max(l,s.distanceToSquared(Nn));if(i)for(let c=0,f=i.length;c<f;c++){const d=i[c],m=this.morphTargetsRelative;for(let p=0,_=d.count;p<_;p++)Nn.fromBufferAttribute(d,p),m&&(ho.fromBufferAttribute(t,p),Nn.add(ho)),l=Math.max(l,s.distanceToSquared(Nn))}this.boundingSphere.radius=Math.sqrt(l),isNaN(this.boundingSphere.radius)&&Ge('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,i=this.attributes;if(t===null||i.position===void 0||i.normal===void 0||i.uv===void 0){Ge("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const s=i.position,l=i.normal,c=i.uv;let f=this.getAttribute("tangent");(f===void 0||f.count!==s.count)&&(f=new ua(new Float32Array(4*s.count),4),this.setAttribute("tangent",f));const d=[],m=[];for(let T=0;T<s.count;T++)d[T]=new tt,m[T]=new tt;const p=new tt,_=new tt,v=new tt,g=new Bt,y=new Bt,b=new Bt,C=new tt,M=new tt;function S(T,D,H){p.fromBufferAttribute(s,T),_.fromBufferAttribute(s,D),v.fromBufferAttribute(s,H),g.fromBufferAttribute(c,T),y.fromBufferAttribute(c,D),b.fromBufferAttribute(c,H),_.sub(p),v.sub(p),y.sub(g),b.sub(g);const G=1/(y.x*b.y-b.x*y.y);isFinite(G)&&(C.copy(_).multiplyScalar(b.y).addScaledVector(v,-y.y).multiplyScalar(G),M.copy(v).multiplyScalar(y.x).addScaledVector(_,-b.x).multiplyScalar(G),d[T].add(C),d[D].add(C),d[H].add(C),m[T].add(M),m[D].add(M),m[H].add(M))}let N=this.groups;N.length===0&&(N=[{start:0,count:t.count}]);for(let T=0,D=N.length;T<D;++T){const H=N[T],G=H.start,K=H.count;for(let it=G,X=G+K;it<X;it+=3)S(t.getX(it+0),t.getX(it+1),t.getX(it+2))}const I=new tt,A=new tt,U=new tt,L=new tt;function P(T){U.fromBufferAttribute(l,T),L.copy(U);const D=d[T];I.copy(D),I.sub(U.multiplyScalar(U.dot(D))).normalize(),A.crossVectors(L,D);const G=A.dot(m[T])<0?-1:1;f.setXYZW(T,I.x,I.y,I.z,G)}for(let T=0,D=N.length;T<D;++T){const H=N[T],G=H.start,K=H.count;for(let it=G,X=G+K;it<X;it+=3)P(t.getX(it+0)),P(t.getX(it+1)),P(t.getX(it+2))}this._transformed=!0}computeVertexNormals(){const t=this.index,i=this.getAttribute("position");if(i!==void 0){let s=this.getAttribute("normal");if(s===void 0||s.count!==i.count)s=new ua(new Float32Array(i.count*3),3),this.setAttribute("normal",s);else for(let g=0,y=s.count;g<y;g++)s.setXYZ(g,0,0,0);const l=new tt,c=new tt,f=new tt,d=new tt,m=new tt,p=new tt,_=new tt,v=new tt;if(t)for(let g=0,y=t.count;g<y;g+=3){const b=t.getX(g+0),C=t.getX(g+1),M=t.getX(g+2);l.fromBufferAttribute(i,b),c.fromBufferAttribute(i,C),f.fromBufferAttribute(i,M),_.subVectors(f,c),v.subVectors(l,c),_.cross(v),d.fromBufferAttribute(s,b),m.fromBufferAttribute(s,C),p.fromBufferAttribute(s,M),d.add(_),m.add(_),p.add(_),s.setXYZ(b,d.x,d.y,d.z),s.setXYZ(C,m.x,m.y,m.z),s.setXYZ(M,p.x,p.y,p.z)}else for(let g=0,y=i.count;g<y;g+=3)l.fromBufferAttribute(i,g+0),c.fromBufferAttribute(i,g+1),f.fromBufferAttribute(i,g+2),_.subVectors(f,c),v.subVectors(l,c),_.cross(v),s.setXYZ(g+0,_.x,_.y,_.z),s.setXYZ(g+1,_.x,_.y,_.z),s.setXYZ(g+2,_.x,_.y,_.z);this.normalizeNormals(),s.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let i=0,s=t.count;i<s;i++)Nn.fromBufferAttribute(t,i),Nn.normalize(),t.setXYZ(i,Nn.x,Nn.y,Nn.z)}toNonIndexed(){function t(d,m){const p=d.array,_=d.itemSize,v=d.normalized,g=new p.constructor(m.length*_);let y=0,b=0;for(let C=0,M=m.length;C<M;C++){d.isInterleavedBufferAttribute?y=m[C]*d.data.stride+d.offset:y=m[C]*_;for(let S=0;S<_;S++)g[b++]=p[y++]}return new ua(g,_,v)}if(this.index===null)return _e("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const i=new ai,s=this.index.array,l=this.attributes;for(const d in l){const m=l[d],p=t(m,s);i.setAttribute(d,p)}const c=this.morphAttributes;for(const d in c){const m=[],p=c[d];for(let _=0,v=p.length;_<v;_++){const g=p[_],y=t(g,s);m.push(y)}i.morphAttributes[d]=m}i.morphTargetsRelative=this.morphTargetsRelative;const f=this.groups;for(let d=0,m=f.length;d<m;d++){const p=f[d];i.addGroup(p.start,p.count,p.materialIndex)}return i}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const m=this.parameters;for(const p in m)m[p]!==void 0&&(t[p]=m[p]);return t}t.data={attributes:{}};const i=this.index;i!==null&&(t.data.index={type:i.array.constructor.name,array:Array.prototype.slice.call(i.array)});const s=this.attributes;for(const m in s){const p=s[m];t.data.attributes[m]=p.toJSON(t.data)}const l={};let c=!1;for(const m in this.morphAttributes){const p=this.morphAttributes[m],_=[];for(let v=0,g=p.length;v<g;v++){const y=p[v];_.push(y.toJSON(t.data))}_.length>0&&(l[m]=_,c=!0)}c&&(t.data.morphAttributes=l,t.data.morphTargetsRelative=this.morphTargetsRelative);const f=this.groups;f.length>0&&(t.data.groups=JSON.parse(JSON.stringify(f)));const d=this.boundingSphere;return d!==null&&(t.data.boundingSphere=d.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const i={};this.name=t.name;const s=t.index;s!==null&&this.setIndex(s.clone());const l=t.attributes;for(const p in l){const _=l[p];this.setAttribute(p,_.clone(i))}const c=t.morphAttributes;for(const p in c){const _=[],v=c[p];for(let g=0,y=v.length;g<y;g++)_.push(v[g].clone(i));this.morphAttributes[p]=_}this.morphTargetsRelative=t.morphTargetsRelative;const f=t.groups;for(let p=0,_=f.length;p<_;p++){const v=f[p];this.addGroup(v.start,v.count,v.materialIndex)}const d=t.boundingBox;d!==null&&(this.boundingBox=d.clone());const m=t.boundingSphere;return m!==null&&(this.boundingSphere=m.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Ap=new tt,pT=new tt,mT=new Ee;class Ia{constructor(t=new tt(1,0,0),i=0){this.isPlane=!0,this.normal=t,this.constant=i}set(t,i){return this.normal.copy(t),this.constant=i,this}setComponents(t,i,s,l){return this.normal.set(t,i,s),this.constant=l,this}setFromNormalAndCoplanarPoint(t,i){return this.normal.copy(t),this.constant=-i.dot(this.normal),this}setFromCoplanarPoints(t,i,s){const l=Ap.subVectors(s,i).cross(pT.subVectors(t,i)).normalize();return this.setFromNormalAndCoplanarPoint(l,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,i){return i.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,i,s=!0){const l=t.delta(Ap),c=this.normal.dot(l);if(c===0)return this.distanceToPoint(t.start)===0?i.copy(t.start):null;const f=-(t.start.dot(this.normal)+this.constant)/c;return s===!0&&(f<0||f>1)?null:i.copy(t.start).addScaledVector(l,f)}intersectsLine(t){const i=this.distanceToPoint(t.start),s=this.distanceToPoint(t.end);return i<0&&s>0||s<0&&i>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,i){const s=i||mT.getNormalMatrix(t),l=this.coplanarPoint(Ap).applyMatrix4(t),c=this.normal.applyMatrix3(s).normalize();return this.constant=-l.dot(c),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}}let gT=0;class No extends dr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:gT++}),this.uuid=Co(),this.name="",this.type="Material",this.blending=kl,this.side=lr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=lS,this.blendDst=cS,this.blendEquation=xo,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new be(0,0,0),this.blendAlpha=0,this.depthFunc=Yl,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Fb,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=rp,this.stencilZFail=rp,this.stencilZPass=rp,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const i in t){const s=t[i];if(s===void 0){_e(`Material: parameter '${i}' has value of undefined.`);continue}const l=this[i];if(l===void 0){_e(`Material: '${i}' is not a property of THREE.${this.type}.`);continue}l&&l.isColor?l.set(s):l&&l.isVector2&&s&&s.isVector2||l&&l.isEuler&&s&&s.isEuler||l&&l.isVector3&&s&&s.isVector3?l.copy(s):this[i]=s}}toJSON(t){const i=t===void 0||typeof t=="string";i&&(t={textures:{},images:{}});const s={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};s.uuid=this.uuid,s.type=this.type,s.blending=this.blending,s.side=this.side,s.shadowSide=this.shadowSide,s.vertexColors=this.vertexColors,s.opacity=this.opacity,s.transparent=this.transparent,s.blendSrc=this.blendSrc,s.blendDst=this.blendDst,s.blendEquation=this.blendEquation,s.blendSrcAlpha=this.blendSrcAlpha,s.blendDstAlpha=this.blendDstAlpha,s.blendEquationAlpha=this.blendEquationAlpha,s.blendColor=this.blendColor.getHex(),s.blendAlpha=this.blendAlpha,s.depthFunc=this.depthFunc,s.depthTest=this.depthTest,s.depthWrite=this.depthWrite,s.colorWrite=this.colorWrite,s.clipIntersection=this.clipIntersection,s.clipShadows=this.clipShadows,s.stencilWriteMask=this.stencilWriteMask,s.stencilFunc=this.stencilFunc,s.stencilRef=this.stencilRef,s.stencilFuncMask=this.stencilFuncMask,s.stencilFail=this.stencilFail,s.stencilZFail=this.stencilZFail,s.stencilZPass=this.stencilZPass,s.stencilWrite=this.stencilWrite,s.polygonOffset=this.polygonOffset,s.polygonOffsetFactor=this.polygonOffsetFactor,s.polygonOffsetUnits=this.polygonOffsetUnits,s.dithering=this.dithering,s.alphaTest=this.alphaTest,s.alphaHash=this.alphaHash,s.alphaToCoverage=this.alphaToCoverage,s.premultipliedAlpha=this.premultipliedAlpha,s.forceSinglePass=this.forceSinglePass,s.allowOverride=this.allowOverride,s.visible=this.visible,s.toneMapped=this.toneMapped,s.name=this.name,this.color&&this.color.isColor&&(s.color=this.color.getHex()),this.roughness!==void 0&&(s.roughness=this.roughness),this.metalness!==void 0&&(s.metalness=this.metalness),this.sheen!==void 0&&(s.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(s.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(s.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(s.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(s.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(s.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(s.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(s.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(s.shininess=this.shininess),this.clearcoat!==void 0&&(s.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(s.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(s.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(s.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(s.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,s.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(s.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(s.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(s.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(s.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(s.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(s.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(s.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(s.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(s.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(s.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(s.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(s.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(s.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(s.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(s.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(s.lightMap=this.lightMap.toJSON(t).uuid,s.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(s.aoMap=this.aoMap.toJSON(t).uuid,s.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(s.bumpMap=this.bumpMap.toJSON(t).uuid,s.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(s.normalMap=this.normalMap.toJSON(t).uuid,s.normalMapType=this.normalMapType,s.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(s.displacementMap=this.displacementMap.toJSON(t).uuid,s.displacementScale=this.displacementScale,s.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(s.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(s.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(s.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(s.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(s.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(s.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(s.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(s.combine=this.combine)),this.envMapRotation!==void 0&&(s.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(s.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(s.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(s.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(s.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(s.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(s.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(s.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(s.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(s.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(s.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(s.size=this.size),this.sizeAttenuation!==void 0&&(s.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(s.clippingPlanes=this.clippingPlanes.map(c=>c.toJSON())),this.rotation!==void 0&&(s.rotation=this.rotation),this.depthPacking!==void 0&&(s.depthPacking=this.depthPacking),this.linewidth!==void 0&&(s.linewidth=this.linewidth),this.linecap!==void 0&&(s.linecap=this.linecap),this.linejoin!==void 0&&(s.linejoin=this.linejoin),this.dashSize!==void 0&&(s.dashSize=this.dashSize),this.gapSize!==void 0&&(s.gapSize=this.gapSize),this.scale!==void 0&&(s.scale=this.scale),this.wireframe!==void 0&&(s.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(s.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(s.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(s.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(s.flatShading=this.flatShading),this.fog!==void 0&&(s.fog=this.fog),Object.keys(this.userData).length>0&&(s.userData=this.userData);function l(c){const f=[];for(const d in c){const m=c[d];delete m.metadata,f.push(m)}return f}if(i){const c=l(t.textures),f=l(t.images);c.length>0&&(s.textures=c),f.length>0&&(s.images=f)}return s}fromJSON(t,i){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new be().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(s=>new Ia().fromJSON(s))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=i[t.map]||null),t.matcap!==void 0&&(this.matcap=i[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=i[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=i[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=i[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let s=t.normalScale;Array.isArray(s)===!1&&(s=[s,s]),this.normalScale=new Bt().fromArray(s)}return t.displacementMap!==void 0&&(this.displacementMap=i[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=i[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=i[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=i[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=i[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=i[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=i[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=i[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=i[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=i[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=i[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=i[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=i[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=i[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Bt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=i[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=i[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=i[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=i[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=i[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=i[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=i[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const i=t.clippingPlanes;let s=null;if(i!==null){const l=i.length;s=new Array(l);for(let c=0;c!==l;++c)s[c]=i[c].clone()}return this.clippingPlanes=s,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}const Pa=new tt,Rp=new tt,Pu=new tt,Iu=new tt;class CS{constructor(t=new tt,i=new tt(0,0,-1)){this.origin=t,this.direction=i}set(t,i){return this.origin.copy(t),this.direction.copy(i),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,i){return i.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Pa)),this}closestPointToPoint(t,i){i.subVectors(t,this.origin);const s=i.dot(this.direction);return s<0?i.copy(this.origin):i.copy(this.origin).addScaledVector(this.direction,s)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const i=Pa.subVectors(t,this.origin).dot(this.direction);return i<0?this.origin.distanceToSquared(t):(Pa.copy(this.origin).addScaledVector(this.direction,i),Pa.distanceToSquared(t))}distanceSqToSegment(t,i,s,l){Rp.copy(t).add(i).multiplyScalar(.5),Pu.copy(i).sub(t).normalize(),Iu.copy(this.origin).sub(Rp);const c=t.distanceTo(i)*.5,f=-this.direction.dot(Pu),d=Iu.dot(this.direction),m=-Iu.dot(Pu),p=Iu.lengthSq(),_=Math.abs(1-f*f);let v,g,y,b;if(_>0)if(v=f*m-d,g=f*d-m,b=c*_,v>=0)if(g>=-b)if(g<=b){const C=1/_;v*=C,g*=C,y=v*(v+f*g+2*d)+g*(f*v+g+2*m)+p}else g=c,v=Math.max(0,-(f*g+d)),y=-v*v+g*(g+2*m)+p;else g=-c,v=Math.max(0,-(f*g+d)),y=-v*v+g*(g+2*m)+p;else g<=-b?(v=Math.max(0,-(-f*c+d)),g=v>0?-c:Math.min(Math.max(-c,-m),c),y=-v*v+g*(g+2*m)+p):g<=b?(v=0,g=Math.min(Math.max(-c,-m),c),y=g*(g+2*m)+p):(v=Math.max(0,-(f*c+d)),g=v>0?c:Math.min(Math.max(-c,-m),c),y=-v*v+g*(g+2*m)+p);else g=f>0?-c:c,v=Math.max(0,-(f*g+d)),y=-v*v+g*(g+2*m)+p;return s&&s.copy(this.origin).addScaledVector(this.direction,v),l&&l.copy(Rp).addScaledVector(Pu,g),y}intersectSphere(t,i){if(t.radius<0)return null;Pa.subVectors(t.center,this.origin);const s=Pa.dot(this.direction),l=Pa.dot(Pa)-s*s,c=t.radius*t.radius;if(l>c)return null;const f=Math.sqrt(c-l),d=s-f,m=s+f;return m<0?null:d<0?this.at(m,i):this.at(d,i)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const i=t.normal.dot(this.direction);if(i===0)return t.distanceToPoint(this.origin)===0?0:null;const s=-(this.origin.dot(t.normal)+t.constant)/i;return s>=0?s:null}intersectPlane(t,i){const s=this.distanceToPlane(t);return s===null?null:this.at(s,i)}intersectsPlane(t){const i=t.distanceToPoint(this.origin);return i===0||t.normal.dot(this.direction)*i<0}intersectBox(t,i){let s,l,c,f,d,m;const p=1/this.direction.x,_=1/this.direction.y,v=1/this.direction.z,g=this.origin;return p>=0?(s=(t.min.x-g.x)*p,l=(t.max.x-g.x)*p):(s=(t.max.x-g.x)*p,l=(t.min.x-g.x)*p),_>=0?(c=(t.min.y-g.y)*_,f=(t.max.y-g.y)*_):(c=(t.max.y-g.y)*_,f=(t.min.y-g.y)*_),s>f||c>l||((c>s||isNaN(s))&&(s=c),(f<l||isNaN(l))&&(l=f),v>=0?(d=(t.min.z-g.z)*v,m=(t.max.z-g.z)*v):(d=(t.max.z-g.z)*v,m=(t.min.z-g.z)*v),s>m||d>l)||((d>s||s!==s)&&(s=d),(m<l||l!==l)&&(l=m),l<0)?null:this.at(s>=0?s:l,i)}intersectsBox(t){return this.intersectBox(t,Pa)!==null}intersectTriangle(t,i,s,l,c){const f=this.origin,d=this.direction,m=d.x,p=d.y,_=d.z,v=t.x-f.x,g=t.y-f.y,y=t.z-f.z,b=i.x-f.x,C=i.y-f.y,M=i.z-f.z,S=s.x-f.x,N=s.y-f.y,I=s.z-f.z,A=Math.abs(m),U=Math.abs(p),L=Math.abs(_);let P,T,D,H,G,K,it,X,j,k,Q,ct;if(A>=U&&A>=L?(D=m,K=v,j=b,ct=S,m>=0?(P=p,T=_,H=g,G=y,it=C,X=M,k=N,Q=I):(P=_,T=p,H=y,G=g,it=M,X=C,k=I,Q=N)):U>=L?(D=p,K=g,j=C,ct=N,p>=0?(P=_,T=m,H=y,G=v,it=M,X=b,k=I,Q=S):(P=m,T=_,H=v,G=y,it=b,X=M,k=S,Q=I)):(D=_,K=y,j=M,ct=I,_>=0?(P=m,T=p,H=v,G=g,it=b,X=C,k=S,Q=N):(P=p,T=m,H=g,G=v,it=C,X=b,k=N,Q=S)),D===0)return null;const lt=P/D,pt=T/D,yt=1/D,Yt=H-lt*K,Wt=G-pt*K,V=it-lt*j,_t=X-pt*j,Pt=k-lt*ct,J=Q-pt*ct,F=Pt*_t-J*V,st=Yt*J-Wt*Pt,wt=V*Wt-_t*Yt;if(l){if(F<0||st<0||wt<0)return null}else if((F<0||st<0||wt<0)&&(F>0||st>0||wt>0))return null;const rt=F+st+wt;if(rt===0)return null;const At=yt*(F*K+st*j+wt*ct);return(rt>0?At<0:At>0)?null:this.at(At/rt,c)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class or extends No{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new da,this.combine=Xm,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const jx=new nn,Qs=new CS,zu=new ic,$x=new tt,Bu=new tt,Fu=new tt,Hu=new tt,wp=new tt,Vu=new tt,t1=new tt,Gu=new tt;class We extends Mn{constructor(t=new ai,i=new or){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=i,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,i){return super.copy(t,i),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const i=this.geometry.morphAttributes,s=Object.keys(i);if(s.length>0){const l=i[s[0]];if(l!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,f=l.length;c<f;c++){const d=l[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[d]=c}}}}getVertexPosition(t,i){const s=this.geometry,l=s.attributes.position,c=s.morphAttributes.position,f=s.morphTargetsRelative;i.fromBufferAttribute(l,t);const d=this.morphTargetInfluences;if(c&&d){Vu.set(0,0,0);for(let m=0,p=c.length;m<p;m++){const _=d[m],v=c[m];_!==0&&(wp.fromBufferAttribute(v,t),f?Vu.addScaledVector(wp,_):Vu.addScaledVector(wp.sub(i),_))}i.add(Vu)}return i}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,i){const s=this.geometry,l=this.material,c=this.matrixWorld;l!==void 0&&(s.boundingSphere===null&&s.computeBoundingSphere(),zu.copy(s.boundingSphere),zu.applyMatrix4(c),Qs.copy(t.ray).recast(t.near),!(zu.containsPoint(Qs.origin)===!1&&(Qs.intersectSphere(zu,$x)===null||Qs.origin.distanceToSquared($x)>(t.far-t.near)**2))&&(jx.copy(c).invert(),Qs.copy(t.ray).applyMatrix4(jx),!(s.boundingBox!==null&&Qs.intersectsBox(s.boundingBox)===!1)&&this._computeIntersections(t,i,Qs)))}_computeIntersections(t,i,s){let l;const c=this.geometry,f=this.material,d=c.index,m=c.attributes.position,p=c.attributes.uv,_=c.attributes.uv1,v=c.attributes.normal,g=c.groups,y=c.drawRange;if(d!==null)if(Array.isArray(f))for(let b=0,C=g.length;b<C;b++){const M=g[b],S=f[M.materialIndex],N=Math.max(M.start,y.start),I=Math.min(d.count,Math.min(M.start+M.count,y.start+y.count));for(let A=N,U=I;A<U;A+=3){const L=d.getX(A),P=d.getX(A+1),T=d.getX(A+2);l=Xu(this,S,t,s,p,_,v,L,P,T),l&&(l.faceIndex=Math.floor(A/3),l.face.materialIndex=M.materialIndex,i.push(l))}}else{const b=Math.max(0,y.start),C=Math.min(d.count,y.start+y.count);for(let M=b,S=C;M<S;M+=3){const N=d.getX(M),I=d.getX(M+1),A=d.getX(M+2);l=Xu(this,f,t,s,p,_,v,N,I,A),l&&(l.faceIndex=Math.floor(M/3),i.push(l))}}else if(m!==void 0)if(Array.isArray(f))for(let b=0,C=g.length;b<C;b++){const M=g[b],S=f[M.materialIndex],N=Math.max(M.start,y.start),I=Math.min(m.count,Math.min(M.start+M.count,y.start+y.count));for(let A=N,U=I;A<U;A+=3){const L=A,P=A+1,T=A+2;l=Xu(this,S,t,s,p,_,v,L,P,T),l&&(l.faceIndex=Math.floor(A/3),l.face.materialIndex=M.materialIndex,i.push(l))}}else{const b=Math.max(0,y.start),C=Math.min(m.count,y.start+y.count);for(let M=b,S=C;M<S;M+=3){const N=M,I=M+1,A=M+2;l=Xu(this,f,t,s,p,_,v,N,I,A),l&&(l.faceIndex=Math.floor(M/3),i.push(l))}}}}function vT(r,t,i,s,l,c,f,d){let m;if(t.side===Kn?m=s.intersectTriangle(f,c,l,!0,d):m=s.intersectTriangle(l,c,f,t.side===lr,d),m===null)return null;Gu.copy(d),Gu.applyMatrix4(r.matrixWorld);const p=i.ray.origin.distanceTo(Gu);return p<i.near||p>i.far?null:{distance:p,point:Gu.clone(),object:r}}function Xu(r,t,i,s,l,c,f,d,m,p){r.getVertexPosition(d,Bu),r.getVertexPosition(m,Fu),r.getVertexPosition(p,Hu);const _=vT(r,t,i,s,Bu,Fu,Hu,t1);if(_){const v=new tt;Fi.getBarycoord(t1,Bu,Fu,Hu,v),l&&(_.uv=Fi.getInterpolatedAttribute(l,d,m,p,v,new Bt)),c&&(_.uv1=Fi.getInterpolatedAttribute(c,d,m,p,v,new Bt)),f&&(_.normal=Fi.getInterpolatedAttribute(f,d,m,p,v,new tt),_.normal.dot(s.direction)>0&&_.normal.multiplyScalar(-1));const g={a:d,b:m,c:p,normal:new tt,materialIndex:0};Fi.getNormal(Bu,Fu,Hu,g.normal),_.face=g,_.barycoord=v}return _}class NS extends Gn{constructor(t=null,i=1,s=1,l,c,f,d,m,p=zn,_=zn,v,g){super(null,f,d,m,p,_,l,c,v,g),this.isDataTexture=!0,this.image={data:t,width:i,height:s},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class e1 extends ua{constructor(t,i,s,l=1){super(t,i,s),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=l}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const po=new nn,n1=new nn,ku=[],i1=new pr,_T=new nn,Ul=new We,Ol=new ic;class xT extends We{constructor(t,i,s){super(t,i),this.isInstancedMesh=!0,this.instanceMatrix=new e1(new Float32Array(s*16),16),this.instanceColor=null,this.morphTexture=null,this.count=s,this.boundingBox=null,this.boundingSphere=null;for(let l=0;l<s;l++)this.setMatrixAt(l,_T)}computeBoundingBox(){const t=this.geometry,i=this.count;this.boundingBox===null&&(this.boundingBox=new pr),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let s=0;s<i;s++)this.getMatrixAt(s,po),i1.copy(t.boundingBox).applyMatrix4(po),this.boundingBox.union(i1)}computeBoundingSphere(){const t=this.geometry,i=this.count;this.boundingSphere===null&&(this.boundingSphere=new ic),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let s=0;s<i;s++)this.getMatrixAt(s,po),Ol.copy(t.boundingSphere).applyMatrix4(po),this.boundingSphere.union(Ol)}copy(t,i){return super.copy(t,i),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,i){return this.instanceColor===null?i.setRGB(1,1,1):i.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,i){return i.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,i){const s=i.morphTargetInfluences,l=this.morphTexture.source.data.data,c=s.length+1,f=t*c+1;for(let d=0;d<s.length;d++)s[d]=l[f+d]}raycast(t,i){const s=this.matrixWorld,l=this.count;if(Ul.geometry=this.geometry,Ul.material=this.material,Ul.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ol.copy(this.boundingSphere),Ol.applyMatrix4(s),t.ray.intersectsSphere(Ol)!==!1))for(let c=0;c<l;c++){this.getMatrixAt(c,po),n1.multiplyMatrices(s,po),Ul.matrixWorld=n1,Ul.raycast(t,ku);for(let f=0,d=ku.length;f<d;f++){const m=ku[f];m.instanceId=c,m.object=this,i.push(m)}ku.length=0}}setColorAt(t,i){return this.instanceColor===null&&(this.instanceColor=new e1(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),i.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,i){return i.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,i){const s=i.morphTargetInfluences,l=s.length+1;this.morphTexture===null&&(this.morphTexture=new NS(new Float32Array(l*this.count),l,this.count,Zm,Hi));const c=this.morphTexture.source.data.data;let f=0;for(let p=0;p<s.length;p++)f+=s[p];const d=this.geometry.morphTargetsRelative?1:1-f,m=l*t;return c[m]=d,c.set(s,m+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const js=new ic,ST=new Bt(.5,.5),Wu=new tt;class i0{constructor(t=new Ia,i=new Ia,s=new Ia,l=new Ia,c=new Ia,f=new Ia){this.planes=[t,i,s,l,c,f]}set(t,i,s,l,c,f){const d=this.planes;return d[0].copy(t),d[1].copy(i),d[2].copy(s),d[3].copy(l),d[4].copy(c),d[5].copy(f),this}copy(t){const i=this.planes;for(let s=0;s<6;s++)i[s].copy(t.planes[s]);return this}setFromProjectionMatrix(t,i=la,s=!1){const l=this.planes,c=t.elements,f=c[0],d=c[1],m=c[2],p=c[3],_=c[4],v=c[5],g=c[6],y=c[7],b=c[8],C=c[9],M=c[10],S=c[11],N=c[12],I=c[13],A=c[14],U=c[15];if(l[0].setComponents(p-f,y-_,S-b,U-N).normalize(),l[1].setComponents(p+f,y+_,S+b,U+N).normalize(),l[2].setComponents(p+d,y+v,S+C,U+I).normalize(),l[3].setComponents(p-d,y-v,S-C,U-I).normalize(),s)l[4].setComponents(m,g,M,A).normalize(),l[5].setComponents(p-m,y-g,S-M,U-A).normalize();else if(l[4].setComponents(p-m,y-g,S-M,U-A).normalize(),i===la)l[5].setComponents(p+m,y+g,S+M,U+A).normalize();else if(i===Ql)l[5].setComponents(m,g,M,A).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+i);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),js.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const i=t.geometry;i.boundingSphere===null&&i.computeBoundingSphere(),js.copy(i.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(js)}intersectsSprite(t){js.center.set(0,0,0);const i=ST.distanceTo(t.center);return js.radius=.7071067811865476+i,js.applyMatrix4(t.matrixWorld),this.intersectsSphere(js)}intersectsSphere(t){const i=this.planes,s=t.center,l=-t.radius;for(let c=0;c<6;c++)if(i[c].distanceToPoint(s)<l)return!1;return!0}intersectsBox(t){const i=this.planes;for(let s=0;s<6;s++){const l=i[s];if(Wu.x=l.normal.x>0?t.max.x:t.min.x,Wu.y=l.normal.y>0?t.max.y:t.min.y,Wu.z=l.normal.z>0?t.max.z:t.min.z,l.distanceToPoint(Wu)<0)return!1}return!0}containsPoint(t){const i=this.planes;for(let s=0;s<6;s++)if(i[s].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class DS extends Gn{constructor(t=[],i=cr,s,l,c,f,d,m,p,_){super(t,i,s,l,c,f,d,m,p,_),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class yT extends Gn{constructor(t,i,s,l,c,f,d,m,p){super(t,i,s,l,c,f,d,m,p),this.isCanvasTexture=!0,this.needsUpdate=!0}}class jl extends Gn{constructor(t,i,s=fa,l,c,f,d=zn,m=zn,p,_=Xa,v=1){if(_!==Xa&&_!==ir)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const g={width:t,height:i,depth:v};super(g,l,c,f,d,m,_,s,p),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new t0(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const i=super.toJSON(t);return i.compareFunction=this.compareFunction,i}}class MT extends jl{constructor(t,i=fa,s=cr,l,c,f=zn,d=zn,m,p=Xa){const _={width:t,height:t,depth:1},v=[_,_,_,_,_,_];super(t,t,i,s,l,c,f,d,m,p),this.image=v,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}}class LS extends Gn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class mr extends ai{constructor(t=1,i=1,s=1,l=1,c=1,f=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:i,depth:s,widthSegments:l,heightSegments:c,depthSegments:f};const d=this;l=Math.floor(l),c=Math.floor(c),f=Math.floor(f);const m=[],p=[],_=[],v=[];let g=0,y=0;b("z","y","x",-1,-1,s,i,t,f,c,0),b("z","y","x",1,-1,s,i,-t,f,c,1),b("x","z","y",1,1,t,s,i,l,f,2),b("x","z","y",1,-1,t,s,-i,l,f,3),b("x","y","z",1,-1,t,i,s,l,c,4),b("x","y","z",-1,-1,t,i,-s,l,c,5),this.setIndex(m),this.setAttribute("position",new fn(p,3)),this.setAttribute("normal",new fn(_,3)),this.setAttribute("uv",new fn(v,2));function b(C,M,S,N,I,A,U,L,P,T,D){const H=A/P,G=U/T,K=A/2,it=U/2,X=L/2,j=P+1,k=T+1;let Q=0,ct=0;const lt=new tt;for(let pt=0;pt<k;pt++){const yt=pt*G-it;for(let Yt=0;Yt<j;Yt++){const Wt=Yt*H-K;lt[C]=Wt*N,lt[M]=yt*I,lt[S]=X,p.push(lt.x,lt.y,lt.z),lt[C]=0,lt[M]=0,lt[S]=L>0?1:-1,_.push(lt.x,lt.y,lt.z),v.push(Yt/P),v.push(1-pt/T),Q+=1}}for(let pt=0;pt<T;pt++)for(let yt=0;yt<P;yt++){const Yt=g+yt+j*pt,Wt=g+yt+j*(pt+1),V=g+(yt+1)+j*(pt+1),_t=g+(yt+1)+j*pt;m.push(Yt,Wt,_t),m.push(Wt,V,_t),ct+=6}d.addGroup(y,ct,D),y+=ct,g+=Q}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new mr(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}class Sf extends ai{constructor(t=1,i=32,s=0,l=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:i,thetaStart:s,thetaLength:l},i=Math.max(3,i);const c=[],f=[],d=[],m=[],p=new tt,_=new Bt;f.push(0,0,0),d.push(0,0,1),m.push(.5,.5);for(let v=0,g=3;v<=i;v++,g+=3){const y=s+v/i*l;p.x=t*Math.cos(y),p.y=t*Math.sin(y),f.push(p.x,p.y,p.z),d.push(0,0,1),_.x=(f[g]/t+1)/2,_.y=(f[g+1]/t+1)/2,m.push(_.x,_.y)}for(let v=1;v<=i;v++)c.push(v,v+1,0);this.setIndex(c),this.setAttribute("position",new fn(f,3)),this.setAttribute("normal",new fn(d,3)),this.setAttribute("uv",new fn(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Sf(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class a0 extends ai{constructor(t=1,i=1,s=1,l=32,c=1,f=!1,d=0,m=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:i,height:s,radialSegments:l,heightSegments:c,openEnded:f,thetaStart:d,thetaLength:m};const p=this;l=Math.floor(l),c=Math.floor(c);const _=[],v=[],g=[],y=[];let b=0;const C=[],M=s/2;let S=0;N(),f===!1&&(t>0&&I(!0),i>0&&I(!1)),this.setIndex(_),this.setAttribute("position",new fn(v,3)),this.setAttribute("normal",new fn(g,3)),this.setAttribute("uv",new fn(y,2));function N(){const A=new tt,U=new tt;let L=0;const P=(i-t)/s;for(let T=0;T<=c;T++){const D=[],H=T/c,G=H*(i-t)+t;for(let K=0;K<=l;K++){const it=K/l,X=it*m+d,j=Math.sin(X),k=Math.cos(X);U.x=G*j,U.y=-H*s+M,U.z=G*k,v.push(U.x,U.y,U.z),A.set(j,P,k).normalize(),g.push(A.x,A.y,A.z),y.push(it,1-H),D.push(b++)}C.push(D)}for(let T=0;T<l;T++)for(let D=0;D<c;D++){const H=C[D][T],G=C[D+1][T],K=C[D+1][T+1],it=C[D][T+1];(t>0||D!==0)&&(_.push(H,G,it),L+=3),(i>0||D!==c-1)&&(_.push(G,K,it),L+=3)}p.addGroup(S,L,0),S+=L}function I(A){const U=b,L=new Bt,P=new tt;let T=0;const D=A===!0?t:i,H=A===!0?1:-1;for(let K=1;K<=l;K++)v.push(0,M*H,0),g.push(0,H,0),y.push(.5,.5),b++;const G=b;for(let K=0;K<=l;K++){const X=K/l*m+d,j=Math.cos(X),k=Math.sin(X);P.x=D*k,P.y=M*H,P.z=D*j,v.push(P.x,P.y,P.z),g.push(0,H,0),L.x=j*.5+.5,L.y=k*.5*H+.5,y.push(L.x,L.y),b++}for(let K=0;K<l;K++){const it=U+K,X=G+K;A===!0?_.push(X,X+1,it):_.push(X+1,X,it),T+=3}p.addGroup(S,T,A===!0?1:2),S+=T}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new a0(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class ma{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){_e("Curve: .getPoint() not implemented.")}getPointAt(t,i){const s=this.getUtoTmapping(t);return this.getPoint(s,i)}getPoints(t=5){const i=[];for(let s=0;s<=t;s++)i.push(this.getPoint(s/t));return i}getSpacedPoints(t=5){const i=[];for(let s=0;s<=t;s++)i.push(this.getPointAt(s/t));return i}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const i=[];let s,l=this.getPoint(0),c=0;i.push(0);for(let f=1;f<=t;f++)s=this.getPoint(f/t),c+=s.distanceTo(l),i.push(c),l=s;return this.cacheArcLengths=i,i}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,i=null){const s=this.getLengths();let l=0;const c=s.length;let f;i?f=i:f=t*s[c-1];let d=0,m=c-1,p;for(;d<=m;)if(l=Math.floor(d+(m-d)/2),p=s[l]-f,p<0)d=l+1;else if(p>0)m=l-1;else{m=l;break}if(l=m,s[l]===f)return l/(c-1);const _=s[l],g=s[l+1]-_,y=(f-_)/g;return(l+y)/(c-1)}getTangent(t,i){let l=t-1e-4,c=t+1e-4;l<0&&(l=0),c>1&&(c=1);const f=this.getPoint(l),d=this.getPoint(c),m=i||(f.isVector2?new Bt:new tt);return m.copy(d).sub(f).normalize(),m}getTangentAt(t,i){const s=this.getUtoTmapping(t);return this.getTangent(s,i)}computeFrenetFrames(t,i=!1){const s=new tt,l=[],c=[],f=[],d=new tt,m=new nn;for(let y=0;y<=t;y++){const b=y/t;l[y]=this.getTangentAt(b,new tt)}c[0]=new tt,f[0]=new tt;let p=Number.MAX_VALUE;const _=Math.abs(l[0].x),v=Math.abs(l[0].y),g=Math.abs(l[0].z);_<=p&&(p=_,s.set(1,0,0)),v<=p&&(p=v,s.set(0,1,0)),g<=p&&s.set(0,0,1),d.crossVectors(l[0],s).normalize(),c[0].crossVectors(l[0],d),f[0].crossVectors(l[0],c[0]);for(let y=1;y<=t;y++){if(c[y]=c[y-1].clone(),f[y]=f[y-1].clone(),d.crossVectors(l[y-1],l[y]),d.length()>Number.EPSILON){d.normalize();const b=Math.acos(De(l[y-1].dot(l[y]),-1,1));c[y].applyMatrix4(m.makeRotationAxis(d,b))}f[y].crossVectors(l[y],c[y])}if(i===!0){let y=Math.acos(De(c[0].dot(c[t]),-1,1));y/=t,l[0].dot(d.crossVectors(c[0],c[t]))>0&&(y=-y);for(let b=1;b<=t;b++)c[b].applyMatrix4(m.makeRotationAxis(l[b],y*b)),f[b].crossVectors(l[b],c[b])}return{tangents:l,normals:c,binormals:f}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class s0 extends ma{constructor(t=0,i=0,s=1,l=1,c=0,f=Math.PI*2,d=!1,m=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=i,this.xRadius=s,this.yRadius=l,this.aStartAngle=c,this.aEndAngle=f,this.aClockwise=d,this.aRotation=m}getPoint(t,i=new Bt){const s=i,l=Math.PI*2;let c=this.aEndAngle-this.aStartAngle;const f=Math.abs(c)<Number.EPSILON;for(;c<0;)c+=l;for(;c>l;)c-=l;c<Number.EPSILON&&(f?c=0:c=l),this.aClockwise===!0&&!f&&(c===l?c=-l:c=c-l);const d=this.aStartAngle+t*c;let m=this.aX+this.xRadius*Math.cos(d),p=this.aY+this.yRadius*Math.sin(d);if(this.aRotation!==0){const _=Math.cos(this.aRotation),v=Math.sin(this.aRotation),g=m-this.aX,y=p-this.aY;m=g*_-y*v+this.aX,p=g*v+y*_+this.aY}return s.set(m,p)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class ET extends s0{constructor(t,i,s,l,c,f){super(t,i,s,s,l,c,f),this.isArcCurve=!0,this.type="ArcCurve"}}function r0(){let r=0,t=0,i=0,s=0;function l(c,f,d,m){r=c,t=d,i=-3*c+3*f-2*d-m,s=2*c-2*f+d+m}return{initCatmullRom:function(c,f,d,m,p){l(f,d,p*(d-c),p*(m-f))},initNonuniformCatmullRom:function(c,f,d,m,p,_,v){let g=(f-c)/p-(d-c)/(p+_)+(d-f)/_,y=(d-f)/_-(m-f)/(_+v)+(m-d)/v;g*=_,y*=_,l(f,d,g,y)},calc:function(c){const f=c*c,d=f*c;return r+t*c+i*f+s*d}}}const a1=new tt,s1=new tt,Cp=new r0,Np=new r0,Dp=new r0;class bT extends ma{constructor(t=[],i=!1,s="centripetal",l=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=i,this.curveType=s,this.tension=l}getPoint(t,i=new tt){const s=i,l=this.points,c=l.length,f=(c-(this.closed?0:1))*t;let d=Math.floor(f),m=f-d;this.closed?d+=d>0?0:(Math.floor(Math.abs(d)/c)+1)*c:m===0&&d===c-1&&(d=c-2,m=1);let p,_;this.closed||d>0?p=l[(d-1)%c]:(s1.subVectors(l[0],l[1]).add(l[0]),p=s1);const v=l[d%c],g=l[(d+1)%c];if(this.closed||d+2<c?_=l[(d+2)%c]:(a1.subVectors(l[c-1],l[c-2]).add(l[c-1]),_=a1),this.curveType==="centripetal"||this.curveType==="chordal"){const y=this.curveType==="chordal"?.5:.25;let b=Math.pow(p.distanceToSquared(v),y),C=Math.pow(v.distanceToSquared(g),y),M=Math.pow(g.distanceToSquared(_),y);C<1e-4&&(C=1),b<1e-4&&(b=C),M<1e-4&&(M=C),Cp.initNonuniformCatmullRom(p.x,v.x,g.x,_.x,b,C,M),Np.initNonuniformCatmullRom(p.y,v.y,g.y,_.y,b,C,M),Dp.initNonuniformCatmullRom(p.z,v.z,g.z,_.z,b,C,M)}else this.curveType==="catmullrom"&&(Cp.initCatmullRom(p.x,v.x,g.x,_.x,this.tension),Np.initCatmullRom(p.y,v.y,g.y,_.y,this.tension),Dp.initCatmullRom(p.z,v.z,g.z,_.z,this.tension));return s.set(Cp.calc(m),Np.calc(m),Dp.calc(m)),s}copy(t){super.copy(t),this.points=[];for(let i=0,s=t.points.length;i<s;i++){const l=t.points[i];this.points.push(l.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let i=0,s=this.points.length;i<s;i++){const l=this.points[i];t.points.push(l.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let i=0,s=t.points.length;i<s;i++){const l=t.points[i];this.points.push(new tt().fromArray(l))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function r1(r,t,i,s,l){const c=(s-t)*.5,f=(l-i)*.5,d=r*r,m=r*d;return(2*i-2*s+c+f)*m+(-3*i+3*s-2*c-f)*d+c*r+i}function TT(r,t){const i=1-r;return i*i*t}function AT(r,t){return 2*(1-r)*r*t}function RT(r,t){return r*r*t}function Wl(r,t,i,s){return TT(r,t)+AT(r,i)+RT(r,s)}function wT(r,t){const i=1-r;return i*i*i*t}function CT(r,t){const i=1-r;return 3*i*i*r*t}function NT(r,t){return 3*(1-r)*r*r*t}function DT(r,t){return r*r*r*t}function ql(r,t,i,s,l){return wT(r,t)+CT(r,i)+NT(r,s)+DT(r,l)}class US extends ma{constructor(t=new Bt,i=new Bt,s=new Bt,l=new Bt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=i,this.v2=s,this.v3=l}getPoint(t,i=new Bt){const s=i,l=this.v0,c=this.v1,f=this.v2,d=this.v3;return s.set(ql(t,l.x,c.x,f.x,d.x),ql(t,l.y,c.y,f.y,d.y)),s}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class LT extends ma{constructor(t=new tt,i=new tt,s=new tt,l=new tt){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=i,this.v2=s,this.v3=l}getPoint(t,i=new tt){const s=i,l=this.v0,c=this.v1,f=this.v2,d=this.v3;return s.set(ql(t,l.x,c.x,f.x,d.x),ql(t,l.y,c.y,f.y,d.y),ql(t,l.z,c.z,f.z,d.z)),s}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class OS extends ma{constructor(t=new Bt,i=new Bt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=i}getPoint(t,i=new Bt){const s=i;return t===1?s.copy(this.v2):(s.copy(this.v2).sub(this.v1),s.multiplyScalar(t).add(this.v1)),s}getPointAt(t,i){return this.getPoint(t,i)}getTangent(t,i=new Bt){return i.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,i){return this.getTangent(t,i)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class UT extends ma{constructor(t=new tt,i=new tt){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=i}getPoint(t,i=new tt){const s=i;return t===1?s.copy(this.v2):(s.copy(this.v2).sub(this.v1),s.multiplyScalar(t).add(this.v1)),s}getPointAt(t,i){return this.getPoint(t,i)}getTangent(t,i=new tt){return i.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,i){return this.getTangent(t,i)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class PS extends ma{constructor(t=new Bt,i=new Bt,s=new Bt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=i,this.v2=s}getPoint(t,i=new Bt){const s=i,l=this.v0,c=this.v1,f=this.v2;return s.set(Wl(t,l.x,c.x,f.x),Wl(t,l.y,c.y,f.y)),s}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class OT extends ma{constructor(t=new tt,i=new tt,s=new tt){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=i,this.v2=s}getPoint(t,i=new tt){const s=i,l=this.v0,c=this.v1,f=this.v2;return s.set(Wl(t,l.x,c.x,f.x),Wl(t,l.y,c.y,f.y),Wl(t,l.z,c.z,f.z)),s}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class IS extends ma{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,i=new Bt){const s=i,l=this.points,c=(l.length-1)*t,f=Math.floor(c),d=c-f,m=l[f===0?f:f-1],p=l[f],_=l[f>l.length-2?l.length-1:f+1],v=l[f>l.length-3?l.length-1:f+2];return s.set(r1(d,m.x,p.x,_.x,v.x),r1(d,m.y,p.y,_.y,v.y)),s}copy(t){super.copy(t),this.points=[];for(let i=0,s=t.points.length;i<s;i++){const l=t.points[i];this.points.push(l.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let i=0,s=this.points.length;i<s;i++){const l=this.points[i];t.points.push(l.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let i=0,s=t.points.length;i<s;i++){const l=t.points[i];this.points.push(new Bt().fromArray(l))}return this}}var Cm=Object.freeze({__proto__:null,ArcCurve:ET,CatmullRomCurve3:bT,CubicBezierCurve:US,CubicBezierCurve3:LT,EllipseCurve:s0,LineCurve:OS,LineCurve3:UT,QuadraticBezierCurve:PS,QuadraticBezierCurve3:OT,SplineCurve:IS});class PT extends ma{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),i=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(i)){const s=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Cm[s](i,t))}return this}getPoint(t,i){const s=t*this.getLength(),l=this.getCurveLengths();let c=0;for(;c<l.length;){if(l[c]>=s){const f=l[c]-s,d=this.curves[c],m=d.getLength(),p=m===0?0:1-f/m;return d.getPointAt(p,i)}c++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let i=0;for(let s=0,l=this.curves.length;s<l;s++)i+=this.curves[s].getLength(),t.push(i);return this.cacheLengths=t,t}getSpacedPoints(t=40){const i=[];for(let s=0;s<=t;s++)i.push(this.getPoint(s/t));return this.autoClose&&i.push(i[0]),i}getPoints(t=12){const i=[];let s;for(let l=0,c=this.curves;l<c.length;l++){const f=c[l],d=f.isEllipseCurve?t*2:f.isLineCurve||f.isLineCurve3?1:f.isSplineCurve?t*f.points.length:t,m=f.getPoints(d);for(let p=0;p<m.length;p++){const _=m[p];s&&s.equals(_)||(i.push(_),s=_)}}return this.autoClose&&i.length>1&&!i[i.length-1].equals(i[0])&&i.push(i[0]),i}copy(t){super.copy(t),this.curves=[];for(let i=0,s=t.curves.length;i<s;i++){const l=t.curves[i];this.curves.push(l.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let i=0,s=this.curves.length;i<s;i++){const l=this.curves[i];t.curves.push(l.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let i=0,s=t.curves.length;i<s;i++){const l=t.curves[i];this.curves.push(new Cm[l.type]().fromJSON(l))}return this}}class Nm extends PT{constructor(t){super(),this.type="Path",this.currentPoint=new Bt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let i=1,s=t.length;i<s;i++)this.lineTo(t[i].x,t[i].y);return this}moveTo(t,i){return this.currentPoint.set(t,i),this}lineTo(t,i){const s=new OS(this.currentPoint.clone(),new Bt(t,i));return this.curves.push(s),this.currentPoint.set(t,i),this}quadraticCurveTo(t,i,s,l){const c=new PS(this.currentPoint.clone(),new Bt(t,i),new Bt(s,l));return this.curves.push(c),this.currentPoint.set(s,l),this}bezierCurveTo(t,i,s,l,c,f){const d=new US(this.currentPoint.clone(),new Bt(t,i),new Bt(s,l),new Bt(c,f));return this.curves.push(d),this.currentPoint.set(c,f),this}splineThru(t){const i=[this.currentPoint.clone()].concat(t),s=new IS(i);return this.curves.push(s),this.currentPoint.copy(t[t.length-1]),this}arc(t,i,s,l,c,f){const d=this.currentPoint.x,m=this.currentPoint.y;return this.absarc(t+d,i+m,s,l,c,f),this}absarc(t,i,s,l,c,f){return this.absellipse(t,i,s,s,l,c,f),this}ellipse(t,i,s,l,c,f,d,m){const p=this.currentPoint.x,_=this.currentPoint.y;return this.absellipse(t+p,i+_,s,l,c,f,d,m),this}absellipse(t,i,s,l,c,f,d,m){const p=new s0(t,i,s,l,c,f,d,m);if(this.curves.length>0){const v=p.getPoint(0);v.equals(this.currentPoint)||this.lineTo(v.x,v.y)}this.curves.push(p);const _=p.getPoint(1);return this.currentPoint.copy(_),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class zS extends Nm{constructor(t){super(t),this.uuid=Co(),this.type="Shape",this.holes=[]}getPointsHoles(t){const i=[];for(let s=0,l=this.holes.length;s<l;s++)i[s]=this.holes[s].getPoints(t);return i}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let i=0,s=t.holes.length;i<s;i++){const l=t.holes[i];this.holes.push(l.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let i=0,s=this.holes.length;i<s;i++){const l=this.holes[i];t.holes.push(l.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let i=0,s=t.holes.length;i<s;i++){const l=t.holes[i];this.holes.push(new Nm().fromJSON(l))}return this}}function IT(r,t,i=2){const s=t&&t.length,l=s?t[0]*i:r.length;let c=BS(r,0,l,i,!0);const f=[];if(!c||c.next===c.prev)return f;let d,m,p;if(s&&(c=VT(r,t,c,i)),r.length>80*i){d=r[0],m=r[1];let _=d,v=m;for(let g=i;g<l;g+=i){const y=r[g],b=r[g+1];y<d&&(d=y),b<m&&(m=b),y>_&&(_=y),b>v&&(v=b)}p=Math.max(_-d,v-m),p=p!==0?32767/p:0}return $l(c,f,i,d,m,p,0),f}function BS(r,t,i,s,l){let c;if(l===jT(r,t,i,s)>0)for(let f=t;f<i;f+=s)c=o1(f/s|0,r[f],r[f+1],c);else for(let f=i-s;f>=t;f-=s)c=o1(f/s|0,r[f],r[f+1],c);return c&&To(c,c.next)&&(ec(c),c=c.next),c}function fr(r,t){if(!r)return r;t||(t=r);let i=r,s;do if(s=!1,!i.steiner&&(To(i,i.next)||un(i.prev,i,i.next)===0)){if(ec(i),i=t=i.prev,i===i.next)break;s=!0}else i=i.next;while(s||i!==t);return t}function $l(r,t,i,s,l,c,f){if(!r)return;!f&&c&&qT(r,s,l,c);let d=r;for(;r.prev!==r.next;){const m=r.prev,p=r.next;if(c?BT(r,s,l,c):zT(r)){t.push(m.i,r.i,p.i),ec(r),r=p.next,d=p.next;continue}if(r=p,r===d){f?f===1?(r=FT(fr(r),t),$l(r,t,i,s,l,c,2)):f===2&&HT(r,t,i,s,l,c):$l(fr(r),t,i,s,l,c,1);break}}}function zT(r){const t=r.prev,i=r,s=r.next;if(un(t,i,s)>=0)return!1;const l=t.x,c=i.x,f=s.x,d=t.y,m=i.y,p=s.y,_=Math.min(l,c,f),v=Math.min(d,m,p),g=Math.max(l,c,f),y=Math.max(d,m,p);let b=s.next;for(;b!==t;){if(b.x>=_&&b.x<=g&&b.y>=v&&b.y<=y&&Hl(l,d,c,m,f,p,b.x,b.y)&&un(b.prev,b,b.next)>=0)return!1;b=b.next}return!0}function BT(r,t,i,s){const l=r.prev,c=r,f=r.next;if(un(l,c,f)>=0)return!1;const d=l.x,m=c.x,p=f.x,_=l.y,v=c.y,g=f.y,y=Math.min(d,m,p),b=Math.min(_,v,g),C=Math.max(d,m,p),M=Math.max(_,v,g),S=Dm(y,b,t,i,s),N=Dm(C,M,t,i,s);let I=r.prevZ,A=r.nextZ;for(;I&&I.z>=S&&A&&A.z<=N;){if(I.x>=y&&I.x<=C&&I.y>=b&&I.y<=M&&I!==l&&I!==f&&Hl(d,_,m,v,p,g,I.x,I.y)&&un(I.prev,I,I.next)>=0||(I=I.prevZ,A.x>=y&&A.x<=C&&A.y>=b&&A.y<=M&&A!==l&&A!==f&&Hl(d,_,m,v,p,g,A.x,A.y)&&un(A.prev,A,A.next)>=0))return!1;A=A.nextZ}for(;I&&I.z>=S;){if(I.x>=y&&I.x<=C&&I.y>=b&&I.y<=M&&I!==l&&I!==f&&Hl(d,_,m,v,p,g,I.x,I.y)&&un(I.prev,I,I.next)>=0)return!1;I=I.prevZ}for(;A&&A.z<=N;){if(A.x>=y&&A.x<=C&&A.y>=b&&A.y<=M&&A!==l&&A!==f&&Hl(d,_,m,v,p,g,A.x,A.y)&&un(A.prev,A,A.next)>=0)return!1;A=A.nextZ}return!0}function FT(r,t){let i=r;do{const s=i.prev,l=i.next.next;!To(s,l)&&HS(s,i,i.next,l)&&tc(s,l)&&tc(l,s)&&(t.push(s.i,i.i,l.i),ec(i),ec(i.next),i=r=l),i=i.next}while(i!==r);return fr(i)}function HT(r,t,i,s,l,c){let f=r;do{let d=f.next.next;for(;d!==f.prev;){if(f.i!==d.i&&KT(f,d)){let m=VS(f,d);f=fr(f,f.next),m=fr(m,m.next),$l(f,t,i,s,l,c,0),$l(m,t,i,s,l,c,0);return}d=d.next}f=f.next}while(f!==r)}function VT(r,t,i,s){const l=[];for(let c=0,f=t.length;c<f;c++){const d=t[c]*s,m=c<f-1?t[c+1]*s:r.length,p=BS(r,d,m,s,!1);p===p.next&&(p.steiner=!0),l.push(ZT(p))}l.sort(GT);for(let c=0;c<l.length;c++)i=XT(l[c],i);return i}function GT(r,t){let i=r.x-t.x;if(i===0&&(i=r.y-t.y,i===0)){const s=(r.next.y-r.y)/(r.next.x-r.x),l=(t.next.y-t.y)/(t.next.x-t.x);i=s-l}return i}function XT(r,t){const i=kT(r,t);if(!i)return t;const s=VS(i,r);return fr(s,s.next),fr(i,i.next)}function kT(r,t){let i=t;const s=r.x,l=r.y;let c=-1/0,f;if(To(r,i))return i;do{if(To(r,i.next))return i.next;if(l<=i.y&&l>=i.next.y&&i.next.y!==i.y){const v=i.x+(l-i.y)*(i.next.x-i.x)/(i.next.y-i.y);if(v<=s&&v>c&&(c=v,f=i.x<i.next.x?i:i.next,v===s))return f}i=i.next}while(i!==t);if(!f)return null;const d=f,m=f.x,p=f.y;let _=1/0;i=f;do{if(s>=i.x&&i.x>=m&&s!==i.x&&FS(l<p?s:c,l,m,p,l<p?c:s,l,i.x,i.y)){const v=Math.abs(l-i.y)/(s-i.x);tc(i,r)&&(v<_||v===_&&(i.x>f.x||i.x===f.x&&WT(f,i)))&&(f=i,_=v)}i=i.next}while(i!==d);return f}function WT(r,t){return un(r.prev,r,t.prev)<0&&un(t.next,r,r.next)<0}function qT(r,t,i,s){let l=r;do l.z===0&&(l.z=Dm(l.x,l.y,t,i,s)),l.prevZ=l.prev,l.nextZ=l.next,l=l.next;while(l!==r);l.prevZ.nextZ=null,l.prevZ=null,YT(l)}function YT(r){let t,i=1;do{let s=r,l;r=null;let c=null;for(t=0;s;){t++;let f=s,d=0;for(let p=0;p<i&&(d++,f=f.nextZ,!!f);p++);let m=i;for(;d>0||m>0&&f;)d!==0&&(m===0||!f||s.z<=f.z)?(l=s,s=s.nextZ,d--):(l=f,f=f.nextZ,m--),c?c.nextZ=l:r=l,l.prevZ=c,c=l;s=f}c.nextZ=null,i*=2}while(t>1);return r}function Dm(r,t,i,s,l){return r=(r-i)*l|0,t=(t-s)*l|0,r=(r|r<<8)&16711935,r=(r|r<<4)&252645135,r=(r|r<<2)&858993459,r=(r|r<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,r|t<<1}function ZT(r){let t=r,i=r;do(t.x<i.x||t.x===i.x&&t.y<i.y)&&(i=t),t=t.next;while(t!==r);return i}function FS(r,t,i,s,l,c,f,d){return(l-f)*(t-d)>=(r-f)*(c-d)&&(r-f)*(s-d)>=(i-f)*(t-d)&&(i-f)*(c-d)>=(l-f)*(s-d)}function Hl(r,t,i,s,l,c,f,d){return!(r===f&&t===d)&&FS(r,t,i,s,l,c,f,d)}function KT(r,t){return r.next.i!==t.i&&r.prev.i!==t.i&&!JT(r,t)&&(tc(r,t)&&tc(t,r)&&QT(r,t)&&(un(r.prev,r,t.prev)||un(r,t.prev,t))||To(r,t)&&un(r.prev,r,r.next)>0&&un(t.prev,t,t.next)>0)}function un(r,t,i){return(t.y-r.y)*(i.x-t.x)-(t.x-r.x)*(i.y-t.y)}function To(r,t){return r.x===t.x&&r.y===t.y}function HS(r,t,i,s){const l=Yu(un(r,t,i)),c=Yu(un(r,t,s)),f=Yu(un(i,s,r)),d=Yu(un(i,s,t));return!!(l!==c&&f!==d||l===0&&qu(r,i,t)||c===0&&qu(r,s,t)||f===0&&qu(i,r,s)||d===0&&qu(i,t,s))}function qu(r,t,i){return t.x<=Math.max(r.x,i.x)&&t.x>=Math.min(r.x,i.x)&&t.y<=Math.max(r.y,i.y)&&t.y>=Math.min(r.y,i.y)}function Yu(r){return r>0?1:r<0?-1:0}function JT(r,t){let i=r;do{if(i.i!==r.i&&i.next.i!==r.i&&i.i!==t.i&&i.next.i!==t.i&&HS(i,i.next,r,t))return!0;i=i.next}while(i!==r);return!1}function tc(r,t){return un(r.prev,r,r.next)<0?un(r,t,r.next)>=0&&un(r,r.prev,t)>=0:un(r,t,r.prev)<0||un(r,r.next,t)<0}function QT(r,t){let i=r,s=!1;const l=(r.x+t.x)/2,c=(r.y+t.y)/2;do i.y>c!=i.next.y>c&&i.next.y!==i.y&&l<(i.next.x-i.x)*(c-i.y)/(i.next.y-i.y)+i.x&&(s=!s),i=i.next;while(i!==r);return s}function VS(r,t){const i=Lm(r.i,r.x,r.y),s=Lm(t.i,t.x,t.y),l=r.next,c=t.prev;return r.next=t,t.prev=r,i.next=l,l.prev=i,s.next=i,i.prev=s,c.next=s,s.prev=c,s}function o1(r,t,i,s){const l=Lm(r,t,i);return s?(l.next=s.next,l.prev=s,s.next.prev=l,s.next=l):(l.prev=l,l.next=l),l}function ec(r){r.next.prev=r.prev,r.prev.next=r.next,r.prevZ&&(r.prevZ.nextZ=r.nextZ),r.nextZ&&(r.nextZ.prevZ=r.prevZ)}function Lm(r,t,i){return{i:r,x:t,y:i,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function jT(r,t,i,s){let l=0;for(let c=t,f=i-s;c<i;c+=s)l+=(r[f]-r[c])*(r[c+1]+r[f+1]),f=c;return l}class $T{static triangulate(t,i,s=2){return IT(t,i,s)}}class So{static area(t){const i=t.length;let s=0;for(let l=i-1,c=0;c<i;l=c++)s+=t[l].x*t[c].y-t[c].x*t[l].y;return s*.5}static isClockWise(t){return So.area(t)<0}static triangulateShape(t,i){const s=[],l=[],c=[];l1(t),c1(s,t);let f=t.length;i.forEach(l1);for(let m=0;m<i.length;m++)l.push(f),f+=i[m].length,c1(s,i[m]);const d=$T.triangulate(s,l);for(let m=0;m<d.length;m+=3)c.push(d.slice(m,m+3));return c}}function l1(r){const t=r.length;t>2&&r[t-1].equals(r[0])&&r.pop()}function c1(r,t){for(let i=0;i<t.length;i++)r.push(t[i].x),r.push(t[i].y)}class o0 extends ai{constructor(t=new zS([new Bt(.5,.5),new Bt(-.5,.5),new Bt(-.5,-.5),new Bt(.5,-.5)]),i={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:i},t=Array.isArray(t)?t:[t];const s=this,l=[],c=[];for(let d=0,m=t.length;d<m;d++){const p=t[d];f(p)}this.setAttribute("position",new fn(l,3)),this.setAttribute("uv",new fn(c,2)),this.computeVertexNormals();function f(d){const m=[],p=i.curveSegments!==void 0?i.curveSegments:12,_=i.steps!==void 0?i.steps:1,v=i.depth!==void 0?i.depth:1;let g=i.bevelEnabled!==void 0?i.bevelEnabled:!0,y=i.bevelThickness!==void 0?i.bevelThickness:.2,b=i.bevelSize!==void 0?i.bevelSize:y-.1,C=i.bevelOffset!==void 0?i.bevelOffset:0,M=i.bevelSegments!==void 0?i.bevelSegments:3;const S=i.extrudePath,N=i.UVGenerator!==void 0?i.UVGenerator:t2;let I,A=!1,U,L,P,T;if(S){I=S.getSpacedPoints(_),A=!0,g=!1;const xt=S.isCatmullRomCurve3?S.closed:!1;U=S.computeFrenetFrames(_,xt),L=new tt,P=new tt,T=new tt}g||(M=0,y=0,b=0,C=0);const D=d.extractPoints(p);let H=D.shape;const G=D.holes;if(!So.isClockWise(H)){H=H.reverse();for(let xt=0,Ct=G.length;xt<Ct;xt++){const Ut=G[xt];So.isClockWise(Ut)&&(G[xt]=Ut.reverse())}}function it(xt){const Ut=10000000000000001e-36;let Nt=xt[0];for(let Dt=1;Dt<=xt.length;Dt++){const se=Dt%xt.length,re=xt[se],gt=re.x-Nt.x,It=re.y-Nt.y,z=gt*gt+It*It,ce=Math.max(Math.abs(re.x),Math.abs(re.y),Math.abs(Nt.x),Math.abs(Nt.y)),de=Ut*ce*ce;if(z<=de){xt.splice(se,1),Dt--;continue}Nt=re}}it(H),G.forEach(it);const X=G.length,j=H;for(let xt=0;xt<X;xt++){const Ct=G[xt];H=H.concat(Ct)}function k(xt,Ct,Ut){return Ct||Ge("ExtrudeGeometry: vec does not exist"),xt.clone().addScaledVector(Ct,Ut)}const Q=H.length;function ct(xt,Ct,Ut){let Nt,Dt,se;const re=xt.x-Ct.x,gt=xt.y-Ct.y,It=Ut.x-xt.x,z=Ut.y-xt.y,ce=re*re+gt*gt,de=re*z-gt*It;if(Math.abs(de)>Number.EPSILON){const O=Math.sqrt(ce),E=Math.sqrt(It*It+z*z),Y=Ct.x-gt/O,at=Ct.y+re/O,vt=Ut.x-z/E,Ot=Ut.y+It/E,zt=((vt-Y)*z-(Ot-at)*It)/(re*z-gt*It);Nt=Y+re*zt-xt.x,Dt=at+gt*zt-xt.y;const St=Nt*Nt+Dt*Dt;if(St<=2)return new Bt(Nt,Dt);se=Math.sqrt(St/2)}else{let O=!1;re>Number.EPSILON?It>Number.EPSILON&&(O=!0):re<-Number.EPSILON?It<-Number.EPSILON&&(O=!0):Math.sign(gt)===Math.sign(z)&&(O=!0),O?(Nt=-gt,Dt=re,se=Math.sqrt(ce)):(Nt=re,Dt=gt,se=Math.sqrt(ce/2))}return new Bt(Nt/se,Dt/se)}const lt=[];for(let xt=0,Ct=j.length,Ut=Ct-1,Nt=xt+1;xt<Ct;xt++,Ut++,Nt++)Ut===Ct&&(Ut=0),Nt===Ct&&(Nt=0),lt[xt]=ct(j[xt],j[Ut],j[Nt]);const pt=[];let yt,Yt=lt.concat();for(let xt=0,Ct=X;xt<Ct;xt++){const Ut=G[xt];yt=[];for(let Nt=0,Dt=Ut.length,se=Dt-1,re=Nt+1;Nt<Dt;Nt++,se++,re++)se===Dt&&(se=0),re===Dt&&(re=0),yt[Nt]=ct(Ut[Nt],Ut[se],Ut[re]);pt.push(yt),Yt=Yt.concat(yt)}let Wt;if(M===0)Wt=So.triangulateShape(j,G);else{const xt=[],Ct=[];for(let Ut=0;Ut<M;Ut++){const Nt=Ut/M,Dt=y*Math.cos(Nt*Math.PI/2),se=b*Math.sin(Nt*Math.PI/2)+C;for(let re=0,gt=j.length;re<gt;re++){const It=k(j[re],lt[re],se);st(It.x,It.y,-Dt),Nt===0&&xt.push(It)}for(let re=0,gt=X;re<gt;re++){const It=G[re];yt=pt[re];const z=[];for(let ce=0,de=It.length;ce<de;ce++){const O=k(It[ce],yt[ce],se);st(O.x,O.y,-Dt),Nt===0&&z.push(O)}Nt===0&&Ct.push(z)}}Wt=So.triangulateShape(xt,Ct)}const V=Wt.length,_t=b+C;for(let xt=0;xt<Q;xt++){const Ct=g?k(H[xt],Yt[xt],_t):H[xt];A?(P.copy(U.normals[0]).multiplyScalar(Ct.x),L.copy(U.binormals[0]).multiplyScalar(Ct.y),T.copy(I[0]).add(P).add(L),st(T.x,T.y,T.z)):st(Ct.x,Ct.y,0)}for(let xt=1;xt<=_;xt++)for(let Ct=0;Ct<Q;Ct++){const Ut=g?k(H[Ct],Yt[Ct],_t):H[Ct];A?(P.copy(U.normals[xt]).multiplyScalar(Ut.x),L.copy(U.binormals[xt]).multiplyScalar(Ut.y),T.copy(I[xt]).add(P).add(L),st(T.x,T.y,T.z)):st(Ut.x,Ut.y,v/_*xt)}for(let xt=M-1;xt>=0;xt--){const Ct=xt/M,Ut=y*Math.cos(Ct*Math.PI/2),Nt=b*Math.sin(Ct*Math.PI/2)+C;for(let Dt=0,se=j.length;Dt<se;Dt++){const re=k(j[Dt],lt[Dt],Nt);st(re.x,re.y,v+Ut)}for(let Dt=0,se=G.length;Dt<se;Dt++){const re=G[Dt];yt=pt[Dt];for(let gt=0,It=re.length;gt<It;gt++){const z=k(re[gt],yt[gt],Nt);A?st(z.x,z.y+I[_-1].y,I[_-1].x+Ut):st(z.x,z.y,v+Ut)}}}Pt(),J();function Pt(){const xt=l.length/3;if(g){let Ct=0,Ut=Q*Ct;for(let Nt=0;Nt<V;Nt++){const Dt=Wt[Nt];wt(Dt[2]+Ut,Dt[1]+Ut,Dt[0]+Ut)}Ct=_+M*2,Ut=Q*Ct;for(let Nt=0;Nt<V;Nt++){const Dt=Wt[Nt];wt(Dt[0]+Ut,Dt[1]+Ut,Dt[2]+Ut)}}else{for(let Ct=0;Ct<V;Ct++){const Ut=Wt[Ct];wt(Ut[2],Ut[1],Ut[0])}for(let Ct=0;Ct<V;Ct++){const Ut=Wt[Ct];wt(Ut[0]+Q*_,Ut[1]+Q*_,Ut[2]+Q*_)}}s.addGroup(xt,l.length/3-xt,0)}function J(){const xt=l.length/3;let Ct=0;F(j,Ct),Ct+=j.length;for(let Ut=0,Nt=G.length;Ut<Nt;Ut++){const Dt=G[Ut];F(Dt,Ct),Ct+=Dt.length}s.addGroup(xt,l.length/3-xt,1)}function F(xt,Ct){let Ut=xt.length;for(;--Ut>=0;){const Nt=Ut;let Dt=Ut-1;Dt<0&&(Dt=xt.length-1);for(let se=0,re=_+M*2;se<re;se++){const gt=Q*se,It=Q*(se+1),z=Ct+Nt+gt,ce=Ct+Dt+gt,de=Ct+Dt+It,O=Ct+Nt+It;rt(z,ce,de,O)}}}function st(xt,Ct,Ut){m.push(xt),m.push(Ct),m.push(Ut)}function wt(xt,Ct,Ut){At(xt),At(Ct),At(Ut);const Nt=l.length/3,Dt=N.generateTopUV(s,l,Nt-3,Nt-2,Nt-1);fe(Dt[0]),fe(Dt[1]),fe(Dt[2])}function rt(xt,Ct,Ut,Nt){At(xt),At(Ct),At(Nt),At(Ct),At(Ut),At(Nt);const Dt=l.length/3,se=N.generateSideWallUV(s,l,Dt-6,Dt-3,Dt-2,Dt-1);fe(se[0]),fe(se[1]),fe(se[3]),fe(se[1]),fe(se[2]),fe(se[3])}function At(xt){l.push(m[xt*3+0]),l.push(m[xt*3+1]),l.push(m[xt*3+2])}function fe(xt){c.push(xt.x),c.push(xt.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),i=this.parameters.shapes,s=this.parameters.options;return e2(i,s,t)}static fromJSON(t,i){const s=[];for(let c=0,f=t.shapes.length;c<f;c++){const d=i[t.shapes[c]];s.push(d)}const l=t.options.extrudePath;return l!==void 0&&(t.options.extrudePath=new Cm[l.type]().fromJSON(l)),new o0(s,t.options)}}const t2={generateTopUV:function(r,t,i,s,l){const c=t[i*3],f=t[i*3+1],d=t[s*3],m=t[s*3+1],p=t[l*3],_=t[l*3+1];return[new Bt(c,f),new Bt(d,m),new Bt(p,_)]},generateSideWallUV:function(r,t,i,s,l,c){const f=t[i*3],d=t[i*3+1],m=t[i*3+2],p=t[s*3],_=t[s*3+1],v=t[s*3+2],g=t[l*3],y=t[l*3+1],b=t[l*3+2],C=t[c*3],M=t[c*3+1],S=t[c*3+2];return Math.abs(d-_)<Math.abs(f-p)?[new Bt(f,1-m),new Bt(p,1-v),new Bt(g,1-b),new Bt(C,1-S)]:[new Bt(d,1-m),new Bt(_,1-v),new Bt(y,1-b),new Bt(M,1-S)]}};function e2(r,t,i){if(i.shapes=[],Array.isArray(r))for(let s=0,l=r.length;s<l;s++){const c=r[s];i.shapes.push(c.uuid)}else i.shapes.push(r.uuid);return i.options=Object.assign({},t),t.extrudePath!==void 0&&(i.options.extrudePath=t.extrudePath.toJSON()),i}class hr extends ai{constructor(t=1,i=1,s=1,l=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:i,widthSegments:s,heightSegments:l};const c=t/2,f=i/2,d=Math.floor(s),m=Math.floor(l),p=d+1,_=m+1,v=t/d,g=i/m,y=[],b=[],C=[],M=[];for(let S=0;S<_;S++){const N=S*g-f;for(let I=0;I<p;I++){const A=I*v-c;b.push(A,-N,0),C.push(0,0,1),M.push(I/d),M.push(1-S/m)}}for(let S=0;S<m;S++)for(let N=0;N<d;N++){const I=N+p*S,A=N+p*(S+1),U=N+1+p*(S+1),L=N+1+p*S;y.push(I,A,L),y.push(A,U,L)}this.setIndex(y),this.setAttribute("position",new fn(b,3)),this.setAttribute("normal",new fn(C,3)),this.setAttribute("uv",new fn(M,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new hr(t.width,t.height,t.widthSegments,t.heightSegments)}}class gf extends ai{constructor(t=.5,i=1,s=32,l=1,c=0,f=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:i,thetaSegments:s,phiSegments:l,thetaStart:c,thetaLength:f},s=Math.max(3,s),l=Math.max(1,l);const d=[],m=[],p=[],_=[];let v=t;const g=(i-t)/l,y=new tt,b=new Bt;for(let C=0;C<=l;C++){for(let M=0;M<=s;M++){const S=c+M/s*f;y.x=v*Math.cos(S),y.y=v*Math.sin(S),m.push(y.x,y.y,y.z),p.push(0,0,1),b.x=(y.x/i+1)/2,b.y=(y.y/i+1)/2,_.push(b.x,b.y)}v+=g}for(let C=0;C<l;C++){const M=C*(s+1);for(let S=0;S<s;S++){const N=S+M,I=N,A=N+s+1,U=N+s+2,L=N+1;d.push(I,A,L),d.push(A,U,L)}}this.setIndex(d),this.setAttribute("position",new fn(m,3)),this.setAttribute("normal",new fn(p,3)),this.setAttribute("uv",new fn(_,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new gf(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class l0 extends ai{constructor(t=1,i=32,s=16,l=0,c=Math.PI*2,f=0,d=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:i,heightSegments:s,phiStart:l,phiLength:c,thetaStart:f,thetaLength:d},i=Math.max(3,Math.floor(i)),s=Math.max(2,Math.floor(s));const m=Math.min(f+d,Math.PI);let p=0;const _=[],v=new tt,g=new tt,y=[],b=[],C=[],M=[];for(let S=0;S<=s;S++){const N=[],I=S/s,A=f+I*d,U=t*Math.cos(A),L=Math.sqrt(t*t-U*U);let P=0;S===0&&f===0?P=.5/i:S===s&&m===Math.PI&&(P=-.5/i);for(let T=0;T<=i;T++){const D=T/i,H=l+D*c;v.x=-L*Math.cos(H),v.y=U,v.z=L*Math.sin(H),b.push(v.x,v.y,v.z),g.copy(v).normalize(),C.push(g.x,g.y,g.z),M.push(D+P,1-I),N.push(p++)}_.push(N)}for(let S=0;S<s;S++)for(let N=0;N<i;N++){const I=_[S][N+1],A=_[S][N],U=_[S+1][N],L=_[S+1][N+1];(S!==0||f>0)&&y.push(I,A,L),(S!==s-1||m<Math.PI)&&y.push(A,U,L)}this.setIndex(y),this.setAttribute("position",new fn(b,3)),this.setAttribute("normal",new fn(C,3)),this.setAttribute("uv",new fn(M,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new l0(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}function Ao(r){const t={};for(const i in r){t[i]={};for(const s in r[i]){const l=r[i][s];if(u1(l))l.isRenderTargetTexture?(_e("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[i][s]=null):t[i][s]=l.clone();else if(Array.isArray(l))if(u1(l[0])){const c=[];for(let f=0,d=l.length;f<d;f++)c[f]=l[f].clone();t[i][s]=c}else t[i][s]=l.slice();else t[i][s]=l}}return t}function Zn(r){const t={};for(let i=0;i<r.length;i++){const s=Ao(r[i]);for(const l in s)t[l]=s[l]}return t}function u1(r){return r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)}function n2(r){const t=[];for(let i=0;i<r.length;i++)t.push(r[i].clone());return t}function GS(r){const t=r.getRenderTarget();return t===null?r.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:He.workingColorSpace}const i2={clone:Ao,merge:Zn};var a2=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,s2=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class pa extends No{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=a2,this.fragmentShader=s2,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ao(t.uniforms),this.uniformsGroups=n2(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){const i=super.toJSON(t);i.glslVersion=this.glslVersion,i.uniforms={};for(const l in this.uniforms){const f=this.uniforms[l].value;f&&f.isTexture?i.uniforms[l]={type:"t",value:f.toJSON(t).uuid}:f&&f.isColor?i.uniforms[l]={type:"c",value:f.getHex()}:f&&f.isVector2?i.uniforms[l]={type:"v2",value:f.toArray()}:f&&f.isVector3?i.uniforms[l]={type:"v3",value:f.toArray()}:f&&f.isVector4?i.uniforms[l]={type:"v4",value:f.toArray()}:f&&f.isMatrix3?i.uniforms[l]={type:"m3",value:f.toArray()}:f&&f.isMatrix4?i.uniforms[l]={type:"m4",value:f.toArray()}:i.uniforms[l]={value:f}}Object.keys(this.defines).length>0&&(i.defines=this.defines),i.vertexShader=this.vertexShader,i.fragmentShader=this.fragmentShader,i.lights=this.lights,i.clipping=this.clipping;const s={};for(const l in this.extensions)this.extensions[l]===!0&&(s[l]=!0);return Object.keys(s).length>0&&(i.extensions=s),i}fromJSON(t,i){if(super.fromJSON(t,i),t.uniforms!==void 0)for(const s in t.uniforms){const l=t.uniforms[s];switch(this.uniforms[s]={},l.type){case"t":this.uniforms[s].value=i[l.value]||null;break;case"c":this.uniforms[s].value=new be().setHex(l.value);break;case"v2":this.uniforms[s].value=new Bt().fromArray(l.value);break;case"v3":this.uniforms[s].value=new tt().fromArray(l.value);break;case"v4":this.uniforms[s].value=new cn().fromArray(l.value);break;case"m3":this.uniforms[s].value=new Ee().fromArray(l.value);break;case"m4":this.uniforms[s].value=new nn().fromArray(l.value);break;default:this.uniforms[s].value=l.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(const s in t.extensions)this.extensions[s]=t.extensions[s];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}}class r2 extends pa{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class oa extends No{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new be(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ff,this.normalScale=new Bt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new da,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class o2 extends oa{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Bt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return De(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(i){this.ior=(1+.4*i)/(1-.4*i)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new be(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new be(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new be(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}class l2 extends No{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new be(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new be(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ff,this.normalScale=new Bt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new da,this.combine=Xm,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class c2 extends No{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=zb,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class u2 extends No{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class yf extends Mn{constructor(t,i=1){super(),this.isLight=!0,this.type="Light",this.color=new be(t),this.intensity=i}copy(t,i){return super.copy(t,i),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const i=super.toJSON(t);return i.object.color=this.color.getHex(),i.object.intensity=this.intensity,i}}class f2 extends yf{constructor(t,i,s){super(t,s),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Mn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new be(i)}copy(t,i){return super.copy(t,i),this.groundColor.copy(t.groundColor),this}toJSON(t){const i=super.toJSON(t);return i.object.groundColor=this.groundColor.getHex(),i}}const Lp=new nn,f1=new tt,h1=new tt;class c0{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Bt(512,512),this.mapType=vi,this.map=null,this.mapPass=null,this.matrix=new nn,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new i0,this._frameExtents=new Bt(1,1),this._viewportCount=1,this._viewports=[new cn(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){const i=this.camera;f1.setFromMatrixPosition(t.matrixWorld),i.position.copy(f1),h1.setFromMatrixPosition(t.target.matrixWorld),i.lookAt(h1),i.updateMatrixWorld(),this._updateMatrix(i,this.matrix,this._frustum)}_updateMatrix(t,i,s,l){Lp.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),s.setFromProjectionMatrix(Lp,t.coordinateSystem,t.reversedDepth);const c=this._frameExtents,f=l?l.z/c.x:1,d=l?l.w/c.y:1,m=l?l.x/c.x:0,p=l?l.y/c.y:0;t.coordinateSystem===Ql||t.reversedDepth?i.set(.5*f,0,0,.5*f+m,0,.5*d,0,.5*d+p,0,0,1,0,0,0,0,1):i.set(.5*f,0,0,.5*f+m,0,.5*d,0,.5*d+p,0,0,.5,.5,0,0,0,1),i.multiply(Lp)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const Zu=new tt,Ku=new Ha,ia=new tt;class XS extends Mn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new nn,this.projectionMatrix=new nn,this.projectionMatrixInverse=new nn,this.coordinateSystem=la,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,i){return super.copy(t,i),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Zu,Ku,ia),ia.x===1&&ia.y===1&&ia.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Zu,Ku,ia.set(1,1,1)).invert()}updateWorldMatrix(t,i,s=!1){super.updateWorldMatrix(t,i,s),this.matrixWorld.decompose(Zu,Ku,ia),ia.x===1&&ia.y===1&&ia.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Zu,Ku,ia.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Ms=new tt,d1=new Bt,p1=new Bt;class ii extends XS{constructor(t=50,i=1,s=.1,l=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=s,this.far=l,this.focus=10,this.aspect=i,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,i){return super.copy(t,i),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const i=.5*this.getFilmHeight()/t;this.fov=mf*2*Math.atan(i),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(op*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return mf*2*Math.atan(Math.tan(op*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,i,s){Ms.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ms.x,Ms.y).multiplyScalar(-t/Ms.z),Ms.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),s.set(Ms.x,Ms.y).multiplyScalar(-t/Ms.z)}getViewSize(t,i){return this.getViewBounds(t,d1,p1),i.subVectors(p1,d1)}setViewOffset(t,i,s,l,c,f){this.aspect=t/i,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=i,this.view.offsetX=s,this.view.offsetY=l,this.view.width=c,this.view.height=f,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let i=t*Math.tan(op*.5*this.fov)/this.zoom,s=2*i,l=this.aspect*s,c=-.5*l;const f=this.view;if(this.view!==null&&this.view.enabled){const m=f.fullWidth,p=f.fullHeight;c+=f.offsetX*l/m,i-=f.offsetY*s/p,l*=f.width/m,s*=f.height/p}const d=this.filmOffset;d!==0&&(c+=t*d/this.getFilmWidth()),this.projectionMatrix.makePerspective(c,c+l,i,i-s,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const i=super.toJSON(t);return i.object.fov=this.fov,i.object.zoom=this.zoom,i.object.near=this.near,i.object.far=this.far,i.object.focus=this.focus,i.object.aspect=this.aspect,this.view!==null&&(i.object.view=Object.assign({},this.view)),i.object.filmGauge=this.filmGauge,i.object.filmOffset=this.filmOffset,i}}class h2 extends c0{constructor(){super(new ii(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){const i=this.camera,s=mf*2*t.angle*this.focus,l=this.mapSize.width/this.mapSize.height*this.aspect,c=t.distance||i.far;(s!==i.fov||l!==i.aspect||c!==i.far)&&(i.fov=s,i.aspect=l,i.far=c,i.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){const t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}}class d2 extends yf{constructor(t,i,s=0,l=Math.PI/3,c=0,f=2){super(t,i),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Mn.DEFAULT_UP),this.updateMatrix(),this.target=new Mn,this.distance=s,this.angle=l,this.penumbra=c,this.decay=f,this.map=null,this.shadow=new h2}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,i){return super.copy(t,i),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){const i=super.toJSON(t);return i.object.distance=this.distance,i.object.angle=this.angle,i.object.decay=this.decay,i.object.penumbra=this.penumbra,i.object.target=this.target.uuid,this.map&&this.map.isTexture&&(i.object.map=this.map.toJSON(t).uuid),i.object.shadow=this.shadow.toJSON(),i}}class p2 extends c0{constructor(){super(new ii(90,1,.5,500)),this.isPointLightShadow=!0}}class m2 extends yf{constructor(t,i,s=0,l=2){super(t,i),this.isPointLight=!0,this.type="PointLight",this.distance=s,this.decay=l,this.shadow=new p2}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,i){return super.copy(t,i),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){const i=super.toJSON(t);return i.object.distance=this.distance,i.object.decay=this.decay,i.object.shadow=this.shadow.toJSON(),i}}class u0 extends XS{constructor(t=-1,i=1,s=1,l=-1,c=.1,f=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=i,this.top=s,this.bottom=l,this.near=c,this.far=f,this.updateProjectionMatrix()}copy(t,i){return super.copy(t,i),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,i,s,l,c,f){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=i,this.view.offsetX=s,this.view.offsetY=l,this.view.width=c,this.view.height=f,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),i=(this.top-this.bottom)/(2*this.zoom),s=(this.right+this.left)/2,l=(this.top+this.bottom)/2;let c=s-t,f=s+t,d=l+i,m=l-i;if(this.view!==null&&this.view.enabled){const p=(this.right-this.left)/this.view.fullWidth/this.zoom,_=(this.top-this.bottom)/this.view.fullHeight/this.zoom;c+=p*this.view.offsetX,f=c+p*this.view.width,d-=_*this.view.offsetY,m=d-_*this.view.height}this.projectionMatrix.makeOrthographic(c,f,d,m,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const i=super.toJSON(t);return i.object.zoom=this.zoom,i.object.left=this.left,i.object.right=this.right,i.object.top=this.top,i.object.bottom=this.bottom,i.object.near=this.near,i.object.far=this.far,this.view!==null&&(i.object.view=Object.assign({},this.view)),i}}class g2 extends c0{constructor(){super(new u0(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class v2 extends yf{constructor(t,i){super(t,i),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Mn.DEFAULT_UP),this.updateMatrix(),this.target=new Mn,this.shadow=new g2}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){const i=super.toJSON(t);return i.object.shadow=this.shadow.toJSON(),i.object.target=this.target.uuid,i}}const mo=-90,go=1;class _2 extends Mn{constructor(t,i,s){super(),this.type="CubeCamera",this.renderTarget=s,this.coordinateSystem=null,this.activeMipmapLevel=0;const l=new ii(mo,go,t,i);l.layers=this.layers,this.add(l);const c=new ii(mo,go,t,i);c.layers=this.layers,this.add(c);const f=new ii(mo,go,t,i);f.layers=this.layers,this.add(f);const d=new ii(mo,go,t,i);d.layers=this.layers,this.add(d);const m=new ii(mo,go,t,i);m.layers=this.layers,this.add(m);const p=new ii(mo,go,t,i);p.layers=this.layers,this.add(p)}updateCoordinateSystem(){const t=this.coordinateSystem,i=this.children.concat(),[s,l,c,f,d,m]=i;for(const p of i)this.remove(p);if(t===la)s.up.set(0,1,0),s.lookAt(1,0,0),l.up.set(0,1,0),l.lookAt(-1,0,0),c.up.set(0,0,-1),c.lookAt(0,1,0),f.up.set(0,0,1),f.lookAt(0,-1,0),d.up.set(0,1,0),d.lookAt(0,0,1),m.up.set(0,1,0),m.lookAt(0,0,-1);else if(t===Ql)s.up.set(0,-1,0),s.lookAt(-1,0,0),l.up.set(0,-1,0),l.lookAt(1,0,0),c.up.set(0,0,1),c.lookAt(0,1,0),f.up.set(0,0,-1),f.lookAt(0,-1,0),d.up.set(0,-1,0),d.lookAt(0,0,1),m.up.set(0,-1,0),m.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const p of i)this.add(p),p.updateMatrixWorld()}update(t,i){this.parent===null&&this.updateMatrixWorld();const{renderTarget:s,activeMipmapLevel:l}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[c,f,d,m,p,_]=this.children,v=t.getRenderTarget(),g=t.getActiveCubeFace(),y=t.getActiveMipmapLevel(),b=t.xr.enabled;t.xr.enabled=!1;const C=s.texture.generateMipmaps;s.texture.generateMipmaps=!1;let M=!1;t.isWebGLRenderer===!0?M=t.state.buffers.depth.getReversed():M=t.reversedDepthBuffer,t.setRenderTarget(s,0,l),M&&t.autoClear===!1&&t.clearDepth(),t.render(i,c),t.setRenderTarget(s,1,l),M&&t.autoClear===!1&&t.clearDepth(),t.render(i,f),t.setRenderTarget(s,2,l),M&&t.autoClear===!1&&t.clearDepth(),t.render(i,d),t.setRenderTarget(s,3,l),M&&t.autoClear===!1&&t.clearDepth(),t.render(i,m),t.setRenderTarget(s,4,l),M&&t.autoClear===!1&&t.clearDepth(),t.render(i,p),s.texture.generateMipmaps=C,t.setRenderTarget(s,5,l),M&&t.autoClear===!1&&t.clearDepth(),t.render(i,_),t.setRenderTarget(v,g,y),t.xr.enabled=b,s.texture.needsPMREMUpdate=!0}}class x2 extends ii{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}}const m1=new nn;class S2{constructor(t,i,s=0,l=1/0){this.ray=new CS(t,i),this.near=s,this.far=l,this.camera=null,this.layers=new e0,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,i){this.ray.set(t,i)}setFromCamera(t,i){i.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(i.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(i).sub(this.ray.origin).normalize(),this.camera=i):i.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,i.projectionMatrix.elements[14]).unproject(i),this.ray.direction.set(0,0,-1).transformDirection(i.matrixWorld),this.camera=i):Ge("Raycaster: Unsupported camera type: "+i.type)}setFromXRController(t){return m1.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(m1),this}intersectObject(t,i=!0,s=[]){return Um(t,this,s,i),s.sort(g1),s}intersectObjects(t,i=!0,s=[]){for(let l=0,c=t.length;l<c;l++)Um(t[l],this,s,i);return s.sort(g1),s}}function g1(r,t){return r.distance-t.distance}function Um(r,t,i,s){let l=!0;if(r.layers.test(t.layers)&&r.raycast(t,i)===!1&&(l=!1),l===!0&&s===!0){const c=r.children;for(let f=0,d=c.length;f<d;f++)Um(c[f],t,i,!0)}}const _0=class _0{constructor(t,i,s,l){this.elements=[1,0,0,1],t!==void 0&&this.set(t,i,s,l)}identity(){return this.set(1,0,0,1),this}fromArray(t,i=0){for(let s=0;s<4;s++)this.elements[s]=t[s+i];return this}set(t,i,s,l){const c=this.elements;return c[0]=t,c[2]=i,c[1]=s,c[3]=l,this}};_0.prototype.isMatrix2=!0;let v1=_0;function _1(r,t,i,s){const l=y2(s);switch(i){case yS:return r*t;case Zm:return r*t/l.components*l.byteLength;case Km:return r*t/l.components*l.byteLength;case ur:return r*t*2/l.components*l.byteLength;case Jm:return r*t*2/l.components*l.byteLength;case MS:return r*t*3/l.components*l.byteLength;case Vi:return r*t*4/l.components*l.byteLength;case Qm:return r*t*4/l.components*l.byteLength;case nf:case af:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case sf:case rf:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case tm:case nm:return Math.max(r,16)*Math.max(t,8)/4;case $p:case em:return Math.max(r,8)*Math.max(t,8)/2;case im:case am:case rm:case om:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case sm:case cf:case lm:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case cm:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case um:return Math.floor((r+4)/5)*Math.floor((t+3)/4)*16;case fm:return Math.floor((r+4)/5)*Math.floor((t+4)/5)*16;case hm:return Math.floor((r+5)/6)*Math.floor((t+4)/5)*16;case dm:return Math.floor((r+5)/6)*Math.floor((t+5)/6)*16;case pm:return Math.floor((r+7)/8)*Math.floor((t+4)/5)*16;case mm:return Math.floor((r+7)/8)*Math.floor((t+5)/6)*16;case gm:return Math.floor((r+7)/8)*Math.floor((t+7)/8)*16;case vm:return Math.floor((r+9)/10)*Math.floor((t+4)/5)*16;case _m:return Math.floor((r+9)/10)*Math.floor((t+5)/6)*16;case xm:return Math.floor((r+9)/10)*Math.floor((t+7)/8)*16;case Sm:return Math.floor((r+9)/10)*Math.floor((t+9)/10)*16;case ym:return Math.floor((r+11)/12)*Math.floor((t+9)/10)*16;case Mm:return Math.floor((r+11)/12)*Math.floor((t+11)/12)*16;case Em:case bm:case Tm:return Math.ceil(r/4)*Math.ceil(t/4)*16;case Am:case Rm:return Math.ceil(r/4)*Math.ceil(t/4)*8;case uf:case wm:return Math.ceil(r/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${i} format.`)}function y2(r){switch(r){case vi:case vS:return{byteLength:1,components:1};case Kl:case _S:case ha:return{byteLength:2,components:1};case qm:case Ym:return{byteLength:2,components:4};case fa:case Wm:case Hi:return{byteLength:4,components:1};case xS:case SS:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Gm}}));typeof window<"u"&&(window.__THREE__?_e("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Gm);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function kS(){let r=null,t=!1,i=null,s=null;function l(c,f){s=r.requestAnimationFrame(l),i(c,f)}return{start:function(){t!==!0&&i!==null&&r!==null&&(s=r.requestAnimationFrame(l),t=!0)},stop:function(){r!==null&&r.cancelAnimationFrame(s),t=!1},setAnimationLoop:function(c){i=c},setContext:function(c){r=c}}}function M2(r){const t=new WeakMap;function i(d,m){const p=d.array,_=d.usage,v=p.byteLength,g=r.createBuffer();r.bindBuffer(m,g),r.bufferData(m,p,_),d.onUploadCallback();let y;if(p instanceof Float32Array)y=r.FLOAT;else if(typeof Float16Array<"u"&&p instanceof Float16Array)y=r.HALF_FLOAT;else if(p instanceof Uint16Array)d.isFloat16BufferAttribute?y=r.HALF_FLOAT:y=r.UNSIGNED_SHORT;else if(p instanceof Int16Array)y=r.SHORT;else if(p instanceof Uint32Array)y=r.UNSIGNED_INT;else if(p instanceof Int32Array)y=r.INT;else if(p instanceof Int8Array)y=r.BYTE;else if(p instanceof Uint8Array)y=r.UNSIGNED_BYTE;else if(p instanceof Uint8ClampedArray)y=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+p);return{buffer:g,type:y,bytesPerElement:p.BYTES_PER_ELEMENT,version:d.version,size:v}}function s(d,m,p){const _=m.array,v=m.updateRanges;if(r.bindBuffer(p,d),v.length===0)r.bufferSubData(p,0,_);else{v.sort((y,b)=>y.start-b.start);let g=0;for(let y=1;y<v.length;y++){const b=v[g],C=v[y];C.start<=b.start+b.count+1?b.count=Math.max(b.count,C.start+C.count-b.start):(++g,v[g]=C)}v.length=g+1;for(let y=0,b=v.length;y<b;y++){const C=v[y];r.bufferSubData(p,C.start*_.BYTES_PER_ELEMENT,_,C.start,C.count)}m.clearUpdateRanges()}m.onUploadCallback()}function l(d){return d.isInterleavedBufferAttribute&&(d=d.data),t.get(d)}function c(d){d.isInterleavedBufferAttribute&&(d=d.data);const m=t.get(d);m&&(r.deleteBuffer(m.buffer),t.delete(d))}function f(d,m){if(d.isInterleavedBufferAttribute&&(d=d.data),d.isGLBufferAttribute){const _=t.get(d);(!_||_.version<d.version)&&t.set(d,{buffer:d.buffer,type:d.type,bytesPerElement:d.elementSize,version:d.version});return}const p=t.get(d);if(p===void 0)t.set(d,i(d,m));else if(p.version<d.version){if(p.size!==d.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");s(p.buffer,d,m),p.version=d.version}}return{get:l,remove:c,update:f}}var E2=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,b2=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,T2=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,A2=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,R2=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,w2=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,C2=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,N2=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,D2=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,L2=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,U2=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,O2=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,P2=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,I2=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,z2=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,B2=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,F2=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,H2=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,V2=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,G2=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,X2=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,k2=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,W2=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,q2=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Y2=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Z2=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,K2=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,J2=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Q2=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,j2=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,$2="gl_FragColor = linearToOutputTexel( gl_FragColor );",tA=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,eA=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,nA=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,iA=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,aA=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,sA=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,rA=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,oA=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,lA=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,cA=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,uA=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,fA=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,hA=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,dA=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,pA=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,mA=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,gA=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,vA=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,_A=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,xA=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,SA=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,yA=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,MA=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,EA=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,bA=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,TA=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,AA=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,RA=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,wA=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,CA=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,NA=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,DA=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,LA=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,UA=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,OA=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,PA=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,IA=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,zA=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,BA=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,FA=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,HA=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,VA=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,GA=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,XA=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,kA=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,WA=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,qA=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,YA=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ZA=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,KA=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,JA=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,QA=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,jA=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,$A=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,t3=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,e3=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,n3=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,i3=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,a3=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,s3=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,r3=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,o3=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,l3=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,c3=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,u3=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,f3=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,h3=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,d3=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,p3=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,m3=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,g3=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,v3=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,_3=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,x3=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,S3=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,y3=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,M3=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const E3=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,b3=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,T3=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,A3=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,R3=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,w3=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,C3=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,N3=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,D3=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,L3=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,U3=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,O3=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,P3=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,I3=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,z3=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,B3=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,F3=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,H3=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,V3=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,G3=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,X3=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,k3=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,W3=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,q3=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Y3=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Z3=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,K3=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,J3=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Q3=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,j3=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,$3=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tR=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,eR=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,nR=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Re={alphahash_fragment:E2,alphahash_pars_fragment:b2,alphamap_fragment:T2,alphamap_pars_fragment:A2,alphatest_fragment:R2,alphatest_pars_fragment:w2,aomap_fragment:C2,aomap_pars_fragment:N2,batching_pars_vertex:D2,batching_vertex:L2,begin_vertex:U2,beginnormal_vertex:O2,bsdfs:P2,iridescence_fragment:I2,bumpmap_pars_fragment:z2,clipping_planes_fragment:B2,clipping_planes_pars_fragment:F2,clipping_planes_pars_vertex:H2,clipping_planes_vertex:V2,color_fragment:G2,color_pars_fragment:X2,color_pars_vertex:k2,color_vertex:W2,common:q2,cube_uv_reflection_fragment:Y2,defaultnormal_vertex:Z2,displacementmap_pars_vertex:K2,displacementmap_vertex:J2,emissivemap_fragment:Q2,emissivemap_pars_fragment:j2,colorspace_fragment:$2,colorspace_pars_fragment:tA,envmap_fragment:eA,envmap_common_pars_fragment:nA,envmap_pars_fragment:iA,envmap_pars_vertex:aA,envmap_physical_pars_fragment:mA,envmap_vertex:sA,fog_vertex:rA,fog_pars_vertex:oA,fog_fragment:lA,fog_pars_fragment:cA,gradientmap_pars_fragment:uA,lightmap_pars_fragment:fA,lights_lambert_fragment:hA,lights_lambert_pars_fragment:dA,lights_pars_begin:pA,lights_toon_fragment:gA,lights_toon_pars_fragment:vA,lights_phong_fragment:_A,lights_phong_pars_fragment:xA,lights_physical_fragment:SA,lights_physical_pars_fragment:yA,lights_fragment_begin:MA,lights_fragment_maps:EA,lights_fragment_end:bA,lightprobes_pars_fragment:TA,logdepthbuf_fragment:AA,logdepthbuf_pars_fragment:RA,logdepthbuf_pars_vertex:wA,logdepthbuf_vertex:CA,map_fragment:NA,map_pars_fragment:DA,map_particle_fragment:LA,map_particle_pars_fragment:UA,metalnessmap_fragment:OA,metalnessmap_pars_fragment:PA,morphinstance_vertex:IA,morphcolor_vertex:zA,morphnormal_vertex:BA,morphtarget_pars_vertex:FA,morphtarget_vertex:HA,normal_fragment_begin:VA,normal_fragment_maps:GA,normal_pars_fragment:XA,normal_pars_vertex:kA,normal_vertex:WA,normalmap_pars_fragment:qA,clearcoat_normal_fragment_begin:YA,clearcoat_normal_fragment_maps:ZA,clearcoat_pars_fragment:KA,iridescence_pars_fragment:JA,opaque_fragment:QA,packing:jA,premultiplied_alpha_fragment:$A,project_vertex:t3,dithering_fragment:e3,dithering_pars_fragment:n3,roughnessmap_fragment:i3,roughnessmap_pars_fragment:a3,shadowmap_pars_fragment:s3,shadowmap_pars_vertex:r3,shadowmap_vertex:o3,shadowmask_pars_fragment:l3,skinbase_vertex:c3,skinning_pars_vertex:u3,skinning_vertex:f3,skinnormal_vertex:h3,specularmap_fragment:d3,specularmap_pars_fragment:p3,tonemapping_fragment:m3,tonemapping_pars_fragment:g3,transmission_fragment:v3,transmission_pars_fragment:_3,uv_pars_fragment:x3,uv_pars_vertex:S3,uv_vertex:y3,worldpos_vertex:M3,background_vert:E3,background_frag:b3,backgroundCube_vert:T3,backgroundCube_frag:A3,cube_vert:R3,cube_frag:w3,depth_vert:C3,depth_frag:N3,distance_vert:D3,distance_frag:L3,equirect_vert:U3,equirect_frag:O3,linedashed_vert:P3,linedashed_frag:I3,meshbasic_vert:z3,meshbasic_frag:B3,meshlambert_vert:F3,meshlambert_frag:H3,meshmatcap_vert:V3,meshmatcap_frag:G3,meshnormal_vert:X3,meshnormal_frag:k3,meshphong_vert:W3,meshphong_frag:q3,meshphysical_vert:Y3,meshphysical_frag:Z3,meshtoon_vert:K3,meshtoon_frag:J3,points_vert:Q3,points_frag:j3,shadow_vert:$3,shadow_frag:tR,sprite_vert:eR,sprite_frag:nR},Jt={common:{diffuse:{value:new be(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ee},alphaMap:{value:null},alphaMapTransform:{value:new Ee},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ee}},envmap:{envMap:{value:null},envMapRotation:{value:new Ee},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ee}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ee}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ee},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ee},normalScale:{value:new Bt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ee},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ee}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ee}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ee}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new be(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new tt},probesMax:{value:new tt},probesResolution:{value:new tt}},points:{diffuse:{value:new be(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ee},alphaTest:{value:0},uvTransform:{value:new Ee}},sprite:{diffuse:{value:new be(16777215)},opacity:{value:1},center:{value:new Bt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ee},alphaMap:{value:null},alphaMapTransform:{value:new Ee},alphaTest:{value:0}}},ra={basic:{uniforms:Zn([Jt.common,Jt.specularmap,Jt.envmap,Jt.aomap,Jt.lightmap,Jt.fog]),vertexShader:Re.meshbasic_vert,fragmentShader:Re.meshbasic_frag},lambert:{uniforms:Zn([Jt.common,Jt.specularmap,Jt.envmap,Jt.aomap,Jt.lightmap,Jt.emissivemap,Jt.bumpmap,Jt.normalmap,Jt.displacementmap,Jt.fog,Jt.lights,{emissive:{value:new be(0)},envMapIntensity:{value:1}}]),vertexShader:Re.meshlambert_vert,fragmentShader:Re.meshlambert_frag},phong:{uniforms:Zn([Jt.common,Jt.specularmap,Jt.envmap,Jt.aomap,Jt.lightmap,Jt.emissivemap,Jt.bumpmap,Jt.normalmap,Jt.displacementmap,Jt.fog,Jt.lights,{emissive:{value:new be(0)},specular:{value:new be(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Re.meshphong_vert,fragmentShader:Re.meshphong_frag},standard:{uniforms:Zn([Jt.common,Jt.envmap,Jt.aomap,Jt.lightmap,Jt.emissivemap,Jt.bumpmap,Jt.normalmap,Jt.displacementmap,Jt.roughnessmap,Jt.metalnessmap,Jt.fog,Jt.lights,{emissive:{value:new be(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Re.meshphysical_vert,fragmentShader:Re.meshphysical_frag},toon:{uniforms:Zn([Jt.common,Jt.aomap,Jt.lightmap,Jt.emissivemap,Jt.bumpmap,Jt.normalmap,Jt.displacementmap,Jt.gradientmap,Jt.fog,Jt.lights,{emissive:{value:new be(0)}}]),vertexShader:Re.meshtoon_vert,fragmentShader:Re.meshtoon_frag},matcap:{uniforms:Zn([Jt.common,Jt.bumpmap,Jt.normalmap,Jt.displacementmap,Jt.fog,{matcap:{value:null}}]),vertexShader:Re.meshmatcap_vert,fragmentShader:Re.meshmatcap_frag},points:{uniforms:Zn([Jt.points,Jt.fog]),vertexShader:Re.points_vert,fragmentShader:Re.points_frag},dashed:{uniforms:Zn([Jt.common,Jt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Re.linedashed_vert,fragmentShader:Re.linedashed_frag},depth:{uniforms:Zn([Jt.common,Jt.displacementmap]),vertexShader:Re.depth_vert,fragmentShader:Re.depth_frag},normal:{uniforms:Zn([Jt.common,Jt.bumpmap,Jt.normalmap,Jt.displacementmap,{opacity:{value:1}}]),vertexShader:Re.meshnormal_vert,fragmentShader:Re.meshnormal_frag},sprite:{uniforms:Zn([Jt.sprite,Jt.fog]),vertexShader:Re.sprite_vert,fragmentShader:Re.sprite_frag},background:{uniforms:{uvTransform:{value:new Ee},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Re.background_vert,fragmentShader:Re.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ee}},vertexShader:Re.backgroundCube_vert,fragmentShader:Re.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Re.cube_vert,fragmentShader:Re.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Re.equirect_vert,fragmentShader:Re.equirect_frag},distance:{uniforms:Zn([Jt.common,Jt.displacementmap,{referencePosition:{value:new tt},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Re.distance_vert,fragmentShader:Re.distance_frag},shadow:{uniforms:Zn([Jt.lights,Jt.fog,{color:{value:new be(0)},opacity:{value:1}}]),vertexShader:Re.shadow_vert,fragmentShader:Re.shadow_frag}};ra.physical={uniforms:Zn([ra.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ee},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ee},clearcoatNormalScale:{value:new Bt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ee},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ee},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ee},sheen:{value:0},sheenColor:{value:new be(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ee},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ee},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ee},transmissionSamplerSize:{value:new Bt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ee},attenuationDistance:{value:0},attenuationColor:{value:new be(0)},specularColor:{value:new be(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ee},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ee},anisotropyVector:{value:new Bt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ee}}]),vertexShader:Re.meshphysical_vert,fragmentShader:Re.meshphysical_frag};const Ju={r:0,b:0,g:0},iR=new nn,WS=new Ee;WS.set(-1,0,0,0,1,0,0,0,1);function aR(r,t,i,s,l,c){const f=new be(0);let d=l===!0?0:1,m,p,_=null,v=0,g=null;function y(N){let I=N.isScene===!0?N.background:null;if(I&&I.isTexture){const A=N.backgroundBlurriness>0;I=t.get(I,A)}return I}function b(N){let I=!1;const A=y(N);A===null?M(f,d):A&&A.isColor&&(M(A,1),I=!0);const U=r.xr.getEnvironmentBlendMode();U==="additive"?i.buffers.color.setClear(0,0,0,1,c):U==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,c),(r.autoClear||I)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function C(N,I){const A=y(I);A&&(A.isCubeTexture||A.mapping===xf)?(p===void 0&&(p=new We(new mr(1,1,1),new pa({name:"BackgroundCubeMaterial",uniforms:Ao(ra.backgroundCube.uniforms),vertexShader:ra.backgroundCube.vertexShader,fragmentShader:ra.backgroundCube.fragmentShader,side:Kn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),p.geometry.deleteAttribute("normal"),p.geometry.deleteAttribute("uv"),p.onBeforeRender=function(U,L,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(p.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(p)),p.material.uniforms.envMap.value=A,p.material.uniforms.backgroundBlurriness.value=I.backgroundBlurriness,p.material.uniforms.backgroundIntensity.value=I.backgroundIntensity,p.material.uniforms.backgroundRotation.value.setFromMatrix4(iR.makeRotationFromEuler(I.backgroundRotation)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&p.material.uniforms.backgroundRotation.value.premultiply(WS),p.material.toneMapped=He.getTransfer(A.colorSpace)!==Qe,(_!==A||v!==A.version||g!==r.toneMapping)&&(p.material.needsUpdate=!0,_=A,v=A.version,g=r.toneMapping),p.layers.enableAll(),N.unshift(p,p.geometry,p.material,0,0,null)):A&&A.isTexture&&(m===void 0&&(m=new We(new hr(2,2),new pa({name:"BackgroundMaterial",uniforms:Ao(ra.background.uniforms),vertexShader:ra.background.vertexShader,fragmentShader:ra.background.fragmentShader,side:lr,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),m.geometry.deleteAttribute("normal"),Object.defineProperty(m.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(m)),m.material.uniforms.t2D.value=A,m.material.uniforms.backgroundIntensity.value=I.backgroundIntensity,m.material.toneMapped=He.getTransfer(A.colorSpace)!==Qe,A.matrixAutoUpdate===!0&&A.updateMatrix(),m.material.uniforms.uvTransform.value.copy(A.matrix),(_!==A||v!==A.version||g!==r.toneMapping)&&(m.material.needsUpdate=!0,_=A,v=A.version,g=r.toneMapping),m.layers.enableAll(),N.unshift(m,m.geometry,m.material,0,0,null))}function M(N,I){N.getRGB(Ju,GS(r)),i.buffers.color.setClear(Ju.r,Ju.g,Ju.b,I,c)}function S(){p!==void 0&&(p.geometry.dispose(),p.material.dispose(),p=void 0),m!==void 0&&(m.geometry.dispose(),m.material.dispose(),m=void 0)}return{getClearColor:function(){return f},setClearColor:function(N,I=1){f.set(N),d=I,M(f,d)},getClearAlpha:function(){return d},setClearAlpha:function(N){d=N,M(f,d)},render:b,addToRenderList:C,dispose:S}}function sR(r,t){const i=r.getParameter(r.MAX_VERTEX_ATTRIBS),s={},l=g(null);let c=l,f=!1;function d(G,K,it,X,j){let k=!1;const Q=v(G,X,it,K);c!==Q&&(c=Q,p(c.object)),k=y(G,X,it,j),k&&b(G,X,it,j),j!==null&&t.update(j,r.ELEMENT_ARRAY_BUFFER),(k||f)&&(f=!1,A(G,K,it,X),j!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,t.get(j).buffer))}function m(){return r.createVertexArray()}function p(G){return r.bindVertexArray(G)}function _(G){return r.deleteVertexArray(G)}function v(G,K,it,X){const j=X.wireframe===!0;let k=s[K.id];k===void 0&&(k={},s[K.id]=k);const Q=G.isInstancedMesh===!0?G.id:0;let ct=k[Q];ct===void 0&&(ct={},k[Q]=ct);let lt=ct[it.id];lt===void 0&&(lt={},ct[it.id]=lt);let pt=lt[j];return pt===void 0&&(pt=g(m()),lt[j]=pt),pt}function g(G){const K=[],it=[],X=[];for(let j=0;j<i;j++)K[j]=0,it[j]=0,X[j]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:K,enabledAttributes:it,attributeDivisors:X,object:G,attributes:{},index:null}}function y(G,K,it,X){const j=c.attributes,k=K.attributes;let Q=0;const ct=it.getAttributes();for(const lt in ct)if(ct[lt].location>=0){const yt=j[lt];let Yt=k[lt];if(Yt===void 0&&(lt==="instanceMatrix"&&G.instanceMatrix&&(Yt=G.instanceMatrix),lt==="instanceColor"&&G.instanceColor&&(Yt=G.instanceColor)),yt===void 0||yt.attribute!==Yt||Yt&&yt.data!==Yt.data)return!0;Q++}return c.attributesNum!==Q||c.index!==X}function b(G,K,it,X){const j={},k=K.attributes;let Q=0;const ct=it.getAttributes();for(const lt in ct)if(ct[lt].location>=0){let yt=k[lt];yt===void 0&&(lt==="instanceMatrix"&&G.instanceMatrix&&(yt=G.instanceMatrix),lt==="instanceColor"&&G.instanceColor&&(yt=G.instanceColor));const Yt={};Yt.attribute=yt,yt&&yt.data&&(Yt.data=yt.data),j[lt]=Yt,Q++}c.attributes=j,c.attributesNum=Q,c.index=X}function C(){const G=c.newAttributes;for(let K=0,it=G.length;K<it;K++)G[K]=0}function M(G){S(G,0)}function S(G,K){const it=c.newAttributes,X=c.enabledAttributes,j=c.attributeDivisors;it[G]=1,X[G]===0&&(r.enableVertexAttribArray(G),X[G]=1),j[G]!==K&&(r.vertexAttribDivisor(G,K),j[G]=K)}function N(){const G=c.newAttributes,K=c.enabledAttributes;for(let it=0,X=K.length;it<X;it++)K[it]!==G[it]&&(r.disableVertexAttribArray(it),K[it]=0)}function I(G,K,it,X,j,k,Q){Q===!0?r.vertexAttribIPointer(G,K,it,j,k):r.vertexAttribPointer(G,K,it,X,j,k)}function A(G,K,it,X){C();const j=X.attributes,k=it.getAttributes(),Q=K.defaultAttributeValues;for(const ct in k){const lt=k[ct];if(lt.location>=0){let pt=j[ct];if(pt===void 0&&(ct==="instanceMatrix"&&G.instanceMatrix&&(pt=G.instanceMatrix),ct==="instanceColor"&&G.instanceColor&&(pt=G.instanceColor)),pt!==void 0){const yt=pt.normalized,Yt=pt.itemSize,Wt=t.get(pt);if(Wt===void 0)continue;const V=Wt.buffer,_t=Wt.type,Pt=Wt.bytesPerElement,J=_t===r.INT||_t===r.UNSIGNED_INT||pt.gpuType===Wm;if(pt.isInterleavedBufferAttribute){const F=pt.data,st=F.stride,wt=pt.offset;if(F.isInstancedInterleavedBuffer){for(let rt=0;rt<lt.locationSize;rt++)S(lt.location+rt,F.meshPerAttribute);G.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=F.meshPerAttribute*F.count)}else for(let rt=0;rt<lt.locationSize;rt++)M(lt.location+rt);r.bindBuffer(r.ARRAY_BUFFER,V);for(let rt=0;rt<lt.locationSize;rt++)I(lt.location+rt,Yt/lt.locationSize,_t,yt,st*Pt,(wt+Yt/lt.locationSize*rt)*Pt,J)}else{if(pt.isInstancedBufferAttribute){for(let F=0;F<lt.locationSize;F++)S(lt.location+F,pt.meshPerAttribute);G.isInstancedMesh!==!0&&X._maxInstanceCount===void 0&&(X._maxInstanceCount=pt.meshPerAttribute*pt.count)}else for(let F=0;F<lt.locationSize;F++)M(lt.location+F);r.bindBuffer(r.ARRAY_BUFFER,V);for(let F=0;F<lt.locationSize;F++)I(lt.location+F,Yt/lt.locationSize,_t,yt,Yt*Pt,Yt/lt.locationSize*F*Pt,J)}}else if(Q!==void 0){const yt=Q[ct];if(yt!==void 0)switch(yt.length){case 2:r.vertexAttrib2fv(lt.location,yt);break;case 3:r.vertexAttrib3fv(lt.location,yt);break;case 4:r.vertexAttrib4fv(lt.location,yt);break;default:r.vertexAttrib1fv(lt.location,yt)}}}}N()}function U(){D();for(const G in s){const K=s[G];for(const it in K){const X=K[it];for(const j in X){const k=X[j];for(const Q in k)_(k[Q].object),delete k[Q];delete X[j]}}delete s[G]}}function L(G){if(s[G.id]===void 0)return;const K=s[G.id];for(const it in K){const X=K[it];for(const j in X){const k=X[j];for(const Q in k)_(k[Q].object),delete k[Q];delete X[j]}}delete s[G.id]}function P(G){for(const K in s){const it=s[K];for(const X in it){const j=it[X];if(j[G.id]===void 0)continue;const k=j[G.id];for(const Q in k)_(k[Q].object),delete k[Q];delete j[G.id]}}}function T(G){for(const K in s){const it=s[K],X=G.isInstancedMesh===!0?G.id:0,j=it[X];if(j!==void 0){for(const k in j){const Q=j[k];for(const ct in Q)_(Q[ct].object),delete Q[ct];delete j[k]}delete it[X],Object.keys(it).length===0&&delete s[K]}}}function D(){H(),f=!0,c!==l&&(c=l,p(c.object))}function H(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:d,reset:D,resetDefaultState:H,dispose:U,releaseStatesOfGeometry:L,releaseStatesOfObject:T,releaseStatesOfProgram:P,initAttributes:C,enableAttribute:M,disableUnusedAttributes:N}}function rR(r,t,i){let s;function l(m){s=m}function c(m,p){r.drawArrays(s,m,p),i.update(p,s,1)}function f(m,p,_){_!==0&&(r.drawArraysInstanced(s,m,p,_),i.update(p,s,_))}function d(m,p,_){if(_===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(s,m,0,p,0,_);let g=0;for(let y=0;y<_;y++)g+=p[y];i.update(g,s,1)}this.setMode=l,this.render=c,this.renderInstances=f,this.renderMultiDraw=d}function oR(r,t,i,s){let l;function c(){if(l!==void 0)return l;if(t.has("EXT_texture_filter_anisotropic")===!0){const P=t.get("EXT_texture_filter_anisotropic");l=r.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else l=0;return l}function f(P){return!(P!==Vi&&s.convert(P)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function d(P){const T=P===ha&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(P!==vi&&P!==Hi&&!T&&s.convert(P)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE))}function m(P){if(P==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let p=i.precision!==void 0?i.precision:"highp";const _=m(p);_!==p&&(_e("WebGLRenderer:",p,"not supported, using",_,"instead."),p=_);const v=i.logarithmicDepthBuffer===!0,g=i.reversedDepthBuffer===!0&&t.has("EXT_clip_control");i.reversedDepthBuffer===!0&&g===!1&&_e("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");const y=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),b=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),C=r.getParameter(r.MAX_TEXTURE_SIZE),M=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),S=r.getParameter(r.MAX_VERTEX_ATTRIBS),N=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),I=r.getParameter(r.MAX_VARYING_VECTORS),A=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),U=r.getParameter(r.MAX_SAMPLES),L=r.getParameter(r.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:c,getMaxPrecision:m,textureFormatReadable:f,textureTypeReadable:d,precision:p,logarithmicDepthBuffer:v,reversedDepthBuffer:g,maxTextures:y,maxVertexTextures:b,maxTextureSize:C,maxCubemapSize:M,maxAttributes:S,maxVertexUniforms:N,maxVaryings:I,maxFragmentUniforms:A,maxSamples:U,samples:L}}function lR(r){const t=this;let i=null,s=0,l=!1,c=!1;const f=new Ia,d=new Ee,m={value:null,needsUpdate:!1};this.uniform=m,this.numPlanes=0,this.numIntersection=0,this.init=function(v,g){const y=v.length!==0||g||s!==0||l;return l=g,s=v.length,y},this.beginShadows=function(){c=!0,_(null)},this.endShadows=function(){c=!1},this.setGlobalState=function(v,g){i=_(v,g,0)},this.setState=function(v,g,y){const b=v.clippingPlanes,C=v.clipIntersection,M=v.clipShadows,S=r.get(v);if(!l||b===null||b.length===0||c&&!M)c?_(null):p();else{const N=c?0:s,I=N*4;let A=S.clippingState||null;m.value=A,A=_(b,g,I,y);for(let U=0;U!==I;++U)A[U]=i[U];S.clippingState=A,this.numIntersection=C?this.numPlanes:0,this.numPlanes+=N}};function p(){m.value!==i&&(m.value=i,m.needsUpdate=s>0),t.numPlanes=s,t.numIntersection=0}function _(v,g,y,b){const C=v!==null?v.length:0;let M=null;if(C!==0){if(M=m.value,b!==!0||M===null){const S=y+C*4,N=g.matrixWorldInverse;d.getNormalMatrix(N),(M===null||M.length<S)&&(M=new Float32Array(S));for(let I=0,A=y;I!==C;++I,A+=4)f.copy(v[I]).applyMatrix4(N,d),f.normal.toArray(M,A),M[A+3]=f.constant}m.value=M,m.needsUpdate=!0}return t.numPlanes=C,t.numIntersection=0,M}}const yo=4,cR=6,uR=20,fR=256,Pl=new u0,x1=new be;let Up=null,Op=0,Pp=0,Ip=!1;const hR=new tt,$s=new tt;class Om{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,i=0,s=.1,l=100,c={}){const{size:f=256,position:d=hR}=c;Up=this._renderer.getRenderTarget(),Op=this._renderer.getActiveCubeFace(),Pp=this._renderer.getActiveMipmapLevel(),Ip=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(f);const m=this._allocateTargets();return m.depthBuffer=!0,this._sceneToCubeUV(t,s,l,m,d),i>0&&this._blur(m,0,0,i),this._applyPMREM(m),this._cleanup(m),m}fromEquirectangular(t,i=null){return this._fromTexture(t,i)}fromCubemap(t,i=null){return this._fromTexture(t,i)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=M1(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=y1(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Up,Op,Pp),this._renderer.xr.enabled=Ip,t.scissorTest=!1,vo(t,0,0,t.width,t.height)}_fromTexture(t,i){t.mapping===cr||t.mapping===bo?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Up=this._renderer.getRenderTarget(),Op=this._renderer.getActiveCubeFace(),Pp=this._renderer.getActiveMipmapLevel(),Ip=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const s=i||this._allocateTargets();return this._textureToCubeUV(t,s),this._applyPMREM(s),this._cleanup(s),s}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),i=4*this._cubeSize,s={magFilter:Vn,minFilter:Vn,generateMipmaps:!1,type:ha,format:Vi,colorSpace:hf,depthBuffer:!1},l=S1(t,i,s);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==i){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=S1(t,i,s);const{_lodMax:c}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=dR(c)),this._blurMaterial=mR(c,t,i),this._ggxMaterial=pR(c,t,i)}return l}_compileMaterial(t){const i=new We(new ai,t);this._renderer.compile(i,Pl)}_sceneToCubeUV(t,i,s,l,c){const m=new ii(90,1,i,s),p=[1,-1,1,1,1,1],_=[1,1,1,-1,-1,-1],v=this._renderer,g=v.autoClear,y=v.toneMapping;v.getClearColor(x1),v.toneMapping=ca,v.autoClear=!1,v.state.buffers.depth.getReversed()&&(v.setRenderTarget(l),v.clearDepth(),v.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new We(new mr,new or({name:"PMREM.Background",side:Kn,depthWrite:!1,depthTest:!1})));const C=this._backgroundBox,M=C.material;let S=!1;const N=t.background;N?N.isColor&&(M.color.copy(N),t.background=null,S=!0):(M.color.copy(x1),S=!0);for(let I=0;I<6;I++){const A=I%3;A===0?(m.up.set(0,p[I],0),m.position.set(c.x,c.y,c.z),m.lookAt(c.x+_[I],c.y,c.z)):A===1?(m.up.set(0,0,p[I]),m.position.set(c.x,c.y,c.z),m.lookAt(c.x,c.y+_[I],c.z)):(m.up.set(0,p[I],0),m.position.set(c.x,c.y,c.z),m.lookAt(c.x,c.y,c.z+_[I]));const U=this._cubeSize;vo(l,A*U,I>2?U:0,U,U),v.setRenderTarget(l),S&&v.render(C,m),v.render(t,m)}v.toneMapping=y,v.autoClear=g,t.background=N}_textureToCubeUV(t,i){const s=this._renderer,l=t.mapping===cr||t.mapping===bo;l?(this._cubemapMaterial===null&&(this._cubemapMaterial=M1()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=y1());const c=l?this._cubemapMaterial:this._equirectMaterial,f=this._lodMeshes[0];f.material=c;const d=c.uniforms;d.envMap.value=t;const m=this._cubeSize;vo(i,0,0,3*m,2*m),s.setRenderTarget(i),s.render(f,Pl)}_applyPMREM(t){const i=this._renderer,s=i.autoClear;i.autoClear=!1;const l=this._lodMeshes.length;for(let c=1;c<l;c++)this._applyGGXFilter(t,c-1,c);i.autoClear=s}_applyGGXFilter(t,i,s){const l=this._renderer,c=this._pingPongRenderTarget,f=this._ggxMaterial,d=this._lodMeshes[s];d.material=f;const m=f.uniforms,p=s/(this._lodMeshes.length-1),_=i/(this._lodMeshes.length-1),v=Math.sqrt(p*p-_*_),g=p*1.25,y=v*g,{_lodMax:b}=this,C=this._sizeLods[s],M=3*C*(s>b-yo?s-b+yo:0),S=4*(this._cubeSize-C);m.envMap.value=t.texture,m.roughness.value=y,m.mipInt.value=b-i,vo(c,M,S,3*C,2*C),l.setRenderTarget(c),l.render(d,Pl),m.envMap.value=c.texture,m.roughness.value=0,m.mipInt.value=b-s,vo(t,M,S,3*C,2*C),l.setRenderTarget(t),l.render(d,Pl)}_blur(t,i,s,l){const c=this._pingPongRenderTarget,f=Math.min(l,Math.PI)/Math.SQRT2;this._blurPass(t,c,i,s,f),this._blurPass(c,t,s,s,f)}_blurPass(t,i,s,l,c){const f=this._renderer,d=this._blurMaterial,m=this._lodMeshes[l];m.material=d;const p=d.uniforms;p.envMap.value=t.texture,p.sigma.value=c,p.mipInt.value=this._lodMax-s;const _=this._sizeLods[l],v=3*_*(l>this._lodMax-yo?l-this._lodMax+yo:0),g=4*(this._cubeSize-_);vo(i,v,g,3*_,2*_),f.setRenderTarget(i),f.render(m,Pl)}}function dR(r){const t=[],i=[];let s=r;const l=r-yo+1+cR;for(let c=0;c<l;c++){const f=Math.pow(2,s);t.push(f);const d=1/(f-2),m=-d,p=1+d,_=[m,m,p,m,p,p,m,m,p,p,m,p],v=6,g=6,y=3,b=new Float32Array(y*g*v),C=new Float32Array(y*g*v);for(let S=0;S<v;S++){const N=S%3*2/3-1,I=S>2?0:-1,A=[N,I,0,N+2/3,I,0,N+2/3,I+1,0,N,I,0,N+2/3,I+1,0,N,I+1,0];b.set(A,y*g*S);for(let U=0;U<g;U++){const L=_[U*2]*2-1,P=_[U*2+1]*2-1;S===0?$s.set(1,P,L):S===1?$s.set(-L,1,-P):S===2?$s.set(-L,P,1):S===3?$s.set(-1,P,-L):S===4?$s.set(-L,-1,P):$s.set(L,P,-1),$s.toArray(C,(S*g+U)*y)}}const M=new ai;M.setAttribute("position",new ua(b,y)),M.setAttribute("outputDirection",new ua(C,y)),i.push(new We(M,null)),s>yo&&s--}return{lodMeshes:i,sizeLods:t}}function S1(r,t,i){const s=new Gi(r,t,i);return s.texture.mapping=xf,s.texture.name="PMREM.cubeUv",s.scissorTest=!0,s}function vo(r,t,i,s,l){r.viewport.set(t,i,s,l),r.scissor.set(t,i,s,l)}function pR(r,t,i){return new pa({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:fR,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/i,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Mf(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Fa,depthTest:!1,depthWrite:!1})}function mR(r,t,i){return new pa({name:"SphericalGaussianBlur",defines:{SAMPLES:uR,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/i,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Mf(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Fa,depthTest:!1,depthWrite:!1})}function y1(){return new pa({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Mf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Fa,depthTest:!1,depthWrite:!1})}function M1(){return new pa({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Mf(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Fa,depthTest:!1,depthWrite:!1})}function Mf(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}class qS extends Gi{constructor(t=1,i={}){super(t,t,i),this.isWebGLCubeRenderTarget=!0;const s={width:t,height:t,depth:1},l=[s,s,s,s,s,s];this.texture=new DS(l),this._setTextureOptions(i),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,i){this.texture.type=i.type,this.texture.colorSpace=i.colorSpace,this.texture.generateMipmaps=i.generateMipmaps,this.texture.minFilter=i.minFilter,this.texture.magFilter=i.magFilter;const s={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},l=new mr(5,5,5),c=new pa({name:"CubemapFromEquirect",uniforms:Ao(s.uniforms),vertexShader:s.vertexShader,fragmentShader:s.fragmentShader,side:Kn,blending:Fa});c.uniforms.tEquirect.value=i;const f=new We(l,c),d=i.minFilter;return i.minFilter===nr&&(i.minFilter=Vn),new _2(1,10,this).update(t,f),i.minFilter=d,f.geometry.dispose(),f.material.dispose(),this}clear(t,i=!0,s=!0,l=!0){const c=t.getRenderTarget();for(let f=0;f<6;f++)t.setRenderTarget(this,f),t.clear(i,s,l);t.setRenderTarget(c)}}function gR(r){let t=new WeakMap,i=new WeakMap,s=null;function l(g,y=!1){return g==null?null:y?f(g):c(g)}function c(g){if(g&&g.isTexture){const y=g.mapping;if(y===ip||y===ap)if(t.has(g)){const b=t.get(g).texture;return d(b,g.mapping)}else{const b=g.image;if(b&&b.height>0){const C=new qS(b.height);return C.fromEquirectangularTexture(r,g),t.set(g,C),g.addEventListener("dispose",p),d(C.texture,g.mapping)}else return null}}return g}function f(g){if(g&&g.isTexture){const y=g.mapping,b=y===ip||y===ap,C=y===cr||y===bo;if(b||C){let M=i.get(g);const S=M!==void 0?M.texture.pmremVersion:0;if(g.isRenderTargetTexture&&g.pmremVersion!==S)return s===null&&(s=new Om(r)),M=b?s.fromEquirectangular(g,M):s.fromCubemap(g,M),M.texture.pmremVersion=g.pmremVersion,i.set(g,M),M.texture;if(M!==void 0)return M.texture;{const N=g.image;return b&&N&&N.height>0||C&&N&&m(N)?(s===null&&(s=new Om(r)),M=b?s.fromEquirectangular(g):s.fromCubemap(g),M.texture.pmremVersion=g.pmremVersion,i.set(g,M),g.addEventListener("dispose",_),M.texture):null}}}return g}function d(g,y){return y===ip?g.mapping=cr:y===ap&&(g.mapping=bo),g}function m(g){let y=0;const b=6;for(let C=0;C<b;C++)g[C]!==void 0&&y++;return y===b}function p(g){const y=g.target;y.removeEventListener("dispose",p);const b=t.get(y);b!==void 0&&(t.delete(y),b.dispose())}function _(g){const y=g.target;y.removeEventListener("dispose",_);const b=i.get(y);b!==void 0&&(i.delete(y),b.dispose())}function v(){t=new WeakMap,i=new WeakMap,s!==null&&(s.dispose(),s=null)}return{get:l,dispose:v}}function vR(r){const t={};function i(s){if(t[s]!==void 0)return t[s];const l=r.getExtension(s);return t[s]=l,l}return{has:function(s){return i(s)!==null},init:function(){i("EXT_color_buffer_float"),i("WEBGL_clip_cull_distance"),i("OES_texture_float_linear"),i("EXT_color_buffer_half_float"),i("WEBGL_multisampled_render_to_texture"),i("WEBGL_render_shared_exponent")},get:function(s){const l=i(s);return l===null&&Mo("WebGLRenderer: "+s+" extension not supported."),l}}}function _R(r,t,i,s){const l={},c=new WeakMap;function f(v){const g=v.target;g.index!==null&&t.remove(g.index);for(const b in g.attributes)t.remove(g.attributes[b]);g.removeEventListener("dispose",f),delete l[g.id];const y=c.get(g);y&&(t.remove(y),c.delete(g)),s.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,i.memory.geometries--}function d(v,g){return l[g.id]===!0||(g.addEventListener("dispose",f),l[g.id]=!0,i.memory.geometries++),g}function m(v){const g=v.attributes;for(const y in g)t.update(g[y],r.ARRAY_BUFFER)}function p(v){const g=[],y=v.index,b=v.attributes.position;let C=0;if(b===void 0)return;if(y!==null){const N=y.array;C=y.version;for(let I=0,A=N.length;I<A;I+=3){const U=N[I+0],L=N[I+1],P=N[I+2];g.push(U,L,L,P,P,U)}}else{const N=b.array;C=b.version;for(let I=0,A=N.length/3-1;I<A;I+=3){const U=I+0,L=I+1,P=I+2;g.push(U,L,L,P,P,U)}}const M=new(b.count>=65535?wS:RS)(g,1);M.version=C;const S=c.get(v);S&&t.remove(S),c.set(v,M)}function _(v){const g=c.get(v);if(g){const y=v.index;y!==null&&g.version<y.version&&p(v)}else p(v);return c.get(v)}return{get:d,update:m,getWireframeAttribute:_}}function xR(r,t,i){let s;function l(v){s=v}let c,f;function d(v){c=v.type,f=v.bytesPerElement}function m(v,g){r.drawElements(s,g,c,v*f),i.update(g,s,1)}function p(v,g,y){y!==0&&(r.drawElementsInstanced(s,g,c,v*f,y),i.update(g,s,y))}function _(v,g,y){if(y===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(s,g,0,c,v,0,y);let C=0;for(let M=0;M<y;M++)C+=g[M];i.update(C,s,1)}this.setMode=l,this.setIndex=d,this.render=m,this.renderInstances=p,this.renderMultiDraw=_}function SR(r){const t={geometries:0,textures:0},i={frame:0,calls:0,triangles:0,points:0,lines:0};function s(c,f,d){switch(i.calls++,f){case r.TRIANGLES:i.triangles+=d*(c/3);break;case r.LINES:i.lines+=d*(c/2);break;case r.LINE_STRIP:i.lines+=d*(c-1);break;case r.LINE_LOOP:i.lines+=d*c;break;case r.POINTS:i.points+=d*c;break;default:Ge("WebGLInfo: Unknown draw mode:",f);break}}function l(){i.calls=0,i.triangles=0,i.points=0,i.lines=0}return{memory:t,render:i,programs:null,autoReset:!0,reset:l,update:s}}function yR(r,t,i){const s=new WeakMap,l=new cn;function c(f,d,m){const p=f.morphTargetInfluences,_=d.morphAttributes.position||d.morphAttributes.normal||d.morphAttributes.color,v=_!==void 0?_.length:0;let g=s.get(d);if(g===void 0||g.count!==v){let D=function(){P.dispose(),s.delete(d),d.removeEventListener("dispose",D)};g!==void 0&&g.texture.dispose();const y=d.morphAttributes.position!==void 0,b=d.morphAttributes.normal!==void 0,C=d.morphAttributes.color!==void 0,M=d.morphAttributes.position||[],S=d.morphAttributes.normal||[],N=d.morphAttributes.color||[];let I=0;y===!0&&(I=1),b===!0&&(I=2),C===!0&&(I=3);let A=d.attributes.position.count*I,U=1;A>t.maxTextureSize&&(U=Math.ceil(A/t.maxTextureSize),A=t.maxTextureSize);const L=new Float32Array(A*U*4*v),P=new bS(L,A,U,v);P.type=Hi,P.needsUpdate=!0;const T=I*4;for(let H=0;H<v;H++){const G=M[H],K=S[H],it=N[H],X=A*U*4*H;for(let j=0;j<G.count;j++){const k=j*T;y===!0&&(l.fromBufferAttribute(G,j),L[X+k+0]=l.x,L[X+k+1]=l.y,L[X+k+2]=l.z,L[X+k+3]=0),b===!0&&(l.fromBufferAttribute(K,j),L[X+k+4]=l.x,L[X+k+5]=l.y,L[X+k+6]=l.z,L[X+k+7]=0),C===!0&&(l.fromBufferAttribute(it,j),L[X+k+8]=l.x,L[X+k+9]=l.y,L[X+k+10]=l.z,L[X+k+11]=it.itemSize===4?l.w:1)}}g={count:v,texture:P,size:new Bt(A,U)},s.set(d,g),d.addEventListener("dispose",D)}if(f.isInstancedMesh===!0&&f.morphTexture!==null)m.getUniforms().setValue(r,"morphTexture",f.morphTexture,i);else{let y=0;for(let C=0;C<p.length;C++)y+=p[C];const b=d.morphTargetsRelative?1:1-y;m.getUniforms().setValue(r,"morphTargetBaseInfluence",b),m.getUniforms().setValue(r,"morphTargetInfluences",p)}m.getUniforms().setValue(r,"morphTargetsTexture",g.texture,i),m.getUniforms().setValue(r,"morphTargetsTextureSize",g.size)}return{update:c}}function MR(r,t,i,s,l){let c=new WeakMap;function f(p){const _=l.render.frame,v=p.geometry,g=t.get(p,v);if(c.get(g)!==_&&(t.update(g),c.set(g,_)),p.isInstancedMesh&&(p.hasEventListener("dispose",m)===!1&&p.addEventListener("dispose",m),c.get(p)!==_&&(i.update(p.instanceMatrix,r.ARRAY_BUFFER),p.instanceColor!==null&&i.update(p.instanceColor,r.ARRAY_BUFFER),c.set(p,_))),p.isSkinnedMesh){const y=p.skeleton;c.get(y)!==_&&(y.update(),c.set(y,_))}return g}function d(){c=new WeakMap}function m(p){const _=p.target;_.removeEventListener("dispose",m),s.releaseStatesOfObject(_),i.remove(_.instanceMatrix),_.instanceColor!==null&&i.remove(_.instanceColor)}return{update:f,dispose:d}}const ER={[uS]:"LINEAR_TONE_MAPPING",[fS]:"REINHARD_TONE_MAPPING",[hS]:"CINEON_TONE_MAPPING",[km]:"ACES_FILMIC_TONE_MAPPING",[pS]:"AGX_TONE_MAPPING",[mS]:"NEUTRAL_TONE_MAPPING",[dS]:"CUSTOM_TONE_MAPPING"};function bR(r,t,i,s,l,c){const f=new Gi(t,i,{type:r,depthBuffer:l,stencilBuffer:c,samples:s?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let d=null,m=null;const p=new ai;p.setAttribute("position",new fn([-1,3,0,-1,-1,0,3,-1,0],3)),p.setAttribute("uv",new fn([0,2,0,0,2,0],2));const _=new r2({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),v=new We(p,_),g=new u0(-1,1,1,-1,0,1);let y=null,b=null,C=!1,M,S=null,N=[],I=!1;this.setSize=function(A,U){f.setSize(A,U),d!==null&&d.setSize(A,U),m!==null&&m.setSize(A,U);for(let L=0;L<N.length;L++){const P=N[L];P.setSize&&P.setSize(A,U)}},this.setEffects=function(A){N=A,I=N.length>0&&N[0].isRenderPass===!0;const U=f.width,L=f.height;N.length>0&&d===null&&(d=new Gi(U,L,{type:ha,depthBuffer:!1,stencilBuffer:!1}),m=new Gi(U,L,{type:ha,depthBuffer:!1,stencilBuffer:!1}));for(let P=0;P<N.length;P++){const T=N[P];T.setSize&&T.setSize(U,L)}},this.begin=function(A,U){if(C||A.toneMapping===ca&&N.length===0)return!1;if(S=U,U!==null){const L=U.width,P=U.height;(f.width!==L||f.height!==P)&&this.setSize(L,P)}return I===!1&&A.setRenderTarget(f),M=A.toneMapping,A.toneMapping=ca,!0},this.hasRenderPass=function(){return I},this.end=function(A,U){A.toneMapping=M,C=!0;let L=f,P=d;for(let T=0;T<N.length;T++){const D=N[T];D.enabled!==!1&&(D.render(A,P,L,U),D.needsSwap!==!1&&(L=P,P=P===d?m:d))}if(y!==A.outputColorSpace||b!==A.toneMapping){y=A.outputColorSpace,b=A.toneMapping,_.defines={},He.getTransfer(y)===Qe&&(_.defines.SRGB_TRANSFER="");const T=ER[b];T&&(_.defines[T]=""),_.needsUpdate=!0}_.uniforms.tDiffuse.value=L.texture,A.setRenderTarget(S),A.render(v,g),S=null,C=!1},this.isCompositing=function(){return C},this.dispose=function(){f.dispose(),d!==null&&d.dispose(),m!==null&&m.dispose(),p.dispose(),_.dispose()}}const YS=new Gn,Pm=new jl(1,1),ZS=new bS,KS=new iT,JS=new DS,E1=[],b1=[],T1=new Float32Array(16),A1=new Float32Array(9),R1=new Float32Array(4);function Do(r,t,i){const s=r[0];if(s<=0||s>0)return r;const l=t*i;let c=E1[l];if(c===void 0&&(c=new Float32Array(l),E1[l]=c),t!==0){s.toArray(c,0);for(let f=1,d=0;f!==t;++f)d+=i,r[f].toArray(c,d)}return c}function Tn(r,t){if(r.length!==t.length)return!1;for(let i=0,s=r.length;i<s;i++)if(r[i]!==t[i])return!1;return!0}function An(r,t){for(let i=0,s=t.length;i<s;i++)r[i]=t[i]}function Ef(r,t){let i=b1[t];i===void 0&&(i=new Int32Array(t),b1[t]=i);for(let s=0;s!==t;++s)i[s]=r.allocateTextureUnit();return i}function TR(r,t){const i=this.cache;i[0]!==t&&(r.uniform1f(this.addr,t),i[0]=t)}function AR(r,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(r.uniform2f(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(Tn(i,t))return;r.uniform2fv(this.addr,t),An(i,t)}}function RR(r,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(r.uniform3f(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else if(t.r!==void 0)(i[0]!==t.r||i[1]!==t.g||i[2]!==t.b)&&(r.uniform3f(this.addr,t.r,t.g,t.b),i[0]=t.r,i[1]=t.g,i[2]=t.b);else{if(Tn(i,t))return;r.uniform3fv(this.addr,t),An(i,t)}}function wR(r,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(r.uniform4f(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(Tn(i,t))return;r.uniform4fv(this.addr,t),An(i,t)}}function CR(r,t){const i=this.cache,s=t.elements;if(s===void 0){if(Tn(i,t))return;r.uniformMatrix2fv(this.addr,!1,t),An(i,t)}else{if(Tn(i,s))return;R1.set(s),r.uniformMatrix2fv(this.addr,!1,R1),An(i,s)}}function NR(r,t){const i=this.cache,s=t.elements;if(s===void 0){if(Tn(i,t))return;r.uniformMatrix3fv(this.addr,!1,t),An(i,t)}else{if(Tn(i,s))return;A1.set(s),r.uniformMatrix3fv(this.addr,!1,A1),An(i,s)}}function DR(r,t){const i=this.cache,s=t.elements;if(s===void 0){if(Tn(i,t))return;r.uniformMatrix4fv(this.addr,!1,t),An(i,t)}else{if(Tn(i,s))return;T1.set(s),r.uniformMatrix4fv(this.addr,!1,T1),An(i,s)}}function LR(r,t){const i=this.cache;i[0]!==t&&(r.uniform1i(this.addr,t),i[0]=t)}function UR(r,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(r.uniform2i(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(Tn(i,t))return;r.uniform2iv(this.addr,t),An(i,t)}}function OR(r,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(r.uniform3i(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else{if(Tn(i,t))return;r.uniform3iv(this.addr,t),An(i,t)}}function PR(r,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(r.uniform4i(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(Tn(i,t))return;r.uniform4iv(this.addr,t),An(i,t)}}function IR(r,t){const i=this.cache;i[0]!==t&&(r.uniform1ui(this.addr,t),i[0]=t)}function zR(r,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(r.uniform2ui(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(Tn(i,t))return;r.uniform2uiv(this.addr,t),An(i,t)}}function BR(r,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(r.uniform3ui(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else{if(Tn(i,t))return;r.uniform3uiv(this.addr,t),An(i,t)}}function FR(r,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(r.uniform4ui(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(Tn(i,t))return;r.uniform4uiv(this.addr,t),An(i,t)}}function HR(r,t,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(r.uniform1i(this.addr,l),s[0]=l);let c;this.type===r.SAMPLER_2D_SHADOW?(Pm.compareFunction=i.isReversedDepthBuffer()?$m:jm,c=Pm):c=YS,i.setTexture2D(t||c,l)}function VR(r,t,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(r.uniform1i(this.addr,l),s[0]=l),i.setTexture3D(t||KS,l)}function GR(r,t,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(r.uniform1i(this.addr,l),s[0]=l),i.setTextureCube(t||JS,l)}function XR(r,t,i){const s=this.cache,l=i.allocateTextureUnit();s[0]!==l&&(r.uniform1i(this.addr,l),s[0]=l),i.setTexture2DArray(t||ZS,l)}function kR(r){switch(r){case 5126:return TR;case 35664:return AR;case 35665:return RR;case 35666:return wR;case 35674:return CR;case 35675:return NR;case 35676:return DR;case 5124:case 35670:return LR;case 35667:case 35671:return UR;case 35668:case 35672:return OR;case 35669:case 35673:return PR;case 5125:return IR;case 36294:return zR;case 36295:return BR;case 36296:return FR;case 35678:case 36198:case 36298:case 36306:case 35682:return HR;case 35679:case 36299:case 36307:return VR;case 35680:case 36300:case 36308:case 36293:return GR;case 36289:case 36303:case 36311:case 36292:return XR}}function WR(r,t){r.uniform1fv(this.addr,t)}function qR(r,t){const i=Do(t,this.size,2);r.uniform2fv(this.addr,i)}function YR(r,t){const i=Do(t,this.size,3);r.uniform3fv(this.addr,i)}function ZR(r,t){const i=Do(t,this.size,4);r.uniform4fv(this.addr,i)}function KR(r,t){const i=Do(t,this.size,4);r.uniformMatrix2fv(this.addr,!1,i)}function JR(r,t){const i=Do(t,this.size,9);r.uniformMatrix3fv(this.addr,!1,i)}function QR(r,t){const i=Do(t,this.size,16);r.uniformMatrix4fv(this.addr,!1,i)}function jR(r,t){r.uniform1iv(this.addr,t)}function $R(r,t){r.uniform2iv(this.addr,t)}function tw(r,t){r.uniform3iv(this.addr,t)}function ew(r,t){r.uniform4iv(this.addr,t)}function nw(r,t){r.uniform1uiv(this.addr,t)}function iw(r,t){r.uniform2uiv(this.addr,t)}function aw(r,t){r.uniform3uiv(this.addr,t)}function sw(r,t){r.uniform4uiv(this.addr,t)}function rw(r,t,i){const s=this.cache,l=t.length,c=Ef(i,l);Tn(s,c)||(r.uniform1iv(this.addr,c),An(s,c));let f;this.type===r.SAMPLER_2D_SHADOW?f=Pm:f=YS;for(let d=0;d!==l;++d)i.setTexture2D(t[d]||f,c[d])}function ow(r,t,i){const s=this.cache,l=t.length,c=Ef(i,l);Tn(s,c)||(r.uniform1iv(this.addr,c),An(s,c));for(let f=0;f!==l;++f)i.setTexture3D(t[f]||KS,c[f])}function lw(r,t,i){const s=this.cache,l=t.length,c=Ef(i,l);Tn(s,c)||(r.uniform1iv(this.addr,c),An(s,c));for(let f=0;f!==l;++f)i.setTextureCube(t[f]||JS,c[f])}function cw(r,t,i){const s=this.cache,l=t.length,c=Ef(i,l);Tn(s,c)||(r.uniform1iv(this.addr,c),An(s,c));for(let f=0;f!==l;++f)i.setTexture2DArray(t[f]||ZS,c[f])}function uw(r){switch(r){case 5126:return WR;case 35664:return qR;case 35665:return YR;case 35666:return ZR;case 35674:return KR;case 35675:return JR;case 35676:return QR;case 5124:case 35670:return jR;case 35667:case 35671:return $R;case 35668:case 35672:return tw;case 35669:case 35673:return ew;case 5125:return nw;case 36294:return iw;case 36295:return aw;case 36296:return sw;case 35678:case 36198:case 36298:case 36306:case 35682:return rw;case 35679:case 36299:case 36307:return ow;case 35680:case 36300:case 36308:case 36293:return lw;case 36289:case 36303:case 36311:case 36292:return cw}}class fw{constructor(t,i,s){this.id=t,this.addr=s,this.cache=[],this.type=i.type,this.setValue=kR(i.type)}}class hw{constructor(t,i,s){this.id=t,this.addr=s,this.cache=[],this.type=i.type,this.size=i.size,this.setValue=uw(i.type)}}class dw{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,i,s){const l=this.seq;for(let c=0,f=l.length;c!==f;++c){const d=l[c];d.setValue(t,i[d.id],s)}}}const zp=/(\w+)(\])?(\[|\.)?/g;function w1(r,t){r.seq.push(t),r.map[t.id]=t}function pw(r,t,i){const s=r.name,l=s.length;for(zp.lastIndex=0;;){const c=zp.exec(s),f=zp.lastIndex;let d=c[1];const m=c[2]==="]",p=c[3];if(m&&(d=d|0),p===void 0||p==="["&&f+2===l){w1(i,p===void 0?new fw(d,r,t):new hw(d,r,t));break}else{let v=i.map[d];v===void 0&&(v=new dw(d),w1(i,v)),i=v}}}class of{constructor(t,i){this.seq=[],this.map={};const s=t.getProgramParameter(i,t.ACTIVE_UNIFORMS);for(let f=0;f<s;++f){const d=t.getActiveUniform(i,f),m=t.getUniformLocation(i,d.name);pw(d,m,this)}const l=[],c=[];for(const f of this.seq)f.type===t.SAMPLER_2D_SHADOW||f.type===t.SAMPLER_CUBE_SHADOW||f.type===t.SAMPLER_2D_ARRAY_SHADOW?l.push(f):c.push(f);l.length>0&&(this.seq=l.concat(c))}setValue(t,i,s,l){const c=this.map[i];c!==void 0&&c.setValue(t,s,l)}setOptional(t,i,s){const l=i[s];l!==void 0&&this.setValue(t,s,l)}static upload(t,i,s,l){for(let c=0,f=i.length;c!==f;++c){const d=i[c],m=s[d.id];m.needsUpdate!==!1&&d.setValue(t,m.value,l)}}static seqWithValue(t,i){const s=[];for(let l=0,c=t.length;l!==c;++l){const f=t[l];f.id in i&&s.push(f)}return s}}function C1(r,t,i){const s=r.createShader(t);return r.shaderSource(s,i),r.compileShader(s),s}const mw=37297;let gw=0;function vw(r,t){const i=r.split(`
`),s=[],l=Math.max(t-6,0),c=Math.min(t+6,i.length);for(let f=l;f<c;f++){const d=f+1;s.push(`${d===t?">":" "} ${d}: ${i[f]}`)}return s.join(`
`)}const N1=new Ee;function _w(r){He._getMatrix(N1,He.workingColorSpace,r);const t=`mat3( ${N1.elements.map(i=>i.toFixed(4))} )`;switch(He.getTransfer(r)){case df:return[t,"LinearTransferOETF"];case Qe:return[t,"sRGBTransferOETF"];default:return _e("WebGLProgram: Unsupported color space: ",r),[t,"LinearTransferOETF"]}}function D1(r,t,i){const s=r.getShaderParameter(t,r.COMPILE_STATUS),c=(r.getShaderInfoLog(t)||"").trim();if(s&&c==="")return"";const f=/ERROR: 0:(\d+)/.exec(c);if(f){const d=parseInt(f[1]);return i.toUpperCase()+`

`+c+`

`+vw(r.getShaderSource(t),d)}else return c}function xw(r,t){const i=_w(t);return[`vec4 ${r}( vec4 value ) {`,`	return ${i[1]}( vec4( value.rgb * ${i[0]}, value.a ) );`,"}"].join(`
`)}const Sw={[uS]:"Linear",[fS]:"Reinhard",[hS]:"Cineon",[km]:"ACESFilmic",[pS]:"AgX",[mS]:"Neutral",[dS]:"Custom"};function yw(r,t){const i=Sw[t];return i===void 0?(_e("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+r+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+r+"( vec3 color ) { return "+i+"ToneMapping( color ); }"}const Qu=new tt;function Mw(){He.getLuminanceCoefficients(Qu);const r=Qu.x.toFixed(4),t=Qu.y.toFixed(4),i=Qu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${t}, ${i} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Ew(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Vl).join(`
`)}function bw(r){const t=[];for(const i in r){const s=r[i];s!==!1&&t.push("#define "+i+" "+s)}return t.join(`
`)}function Tw(r,t){const i={},s=r.getProgramParameter(t,r.ACTIVE_ATTRIBUTES);for(let l=0;l<s;l++){const c=r.getActiveAttrib(t,l),f=c.name;let d=1;c.type===r.FLOAT_MAT2&&(d=2),c.type===r.FLOAT_MAT3&&(d=3),c.type===r.FLOAT_MAT4&&(d=4),i[f]={type:c.type,location:r.getAttribLocation(t,f),locationSize:d}}return i}function Vl(r){return r!==""}function L1(r,t){const i=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return r.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,i).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function U1(r,t){return r.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Aw=/^[ \t]*#include +<([\w\d./]+)>/gm;function Im(r){return r.replace(Aw,ww)}const Rw=new Map;function ww(r,t){let i=Re[t];if(i===void 0){const s=Rw.get(t);if(s!==void 0)i=Re[s],_e('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,s);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Im(i)}const Cw=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function O1(r){return r.replace(Cw,Nw)}function Nw(r,t,i,s){let l="";for(let c=parseInt(t);c<parseInt(i);c++)l+=s.replace(/\[\s*i\s*\]/g,"[ "+c+" ]").replace(/UNROLLED_LOOP_INDEX/g,c);return l}function P1(r){let t=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?t+=`
#define HIGH_PRECISION`:r.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}const Dw={[Xl]:"SHADOWMAP_TYPE_PCF",[Fl]:"SHADOWMAP_TYPE_VSM"};function Lw(r){return Dw[r.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Uw={[cr]:"ENVMAP_TYPE_CUBE",[bo]:"ENVMAP_TYPE_CUBE",[xf]:"ENVMAP_TYPE_CUBE_UV"};function Ow(r){return r.envMap===!1?"ENVMAP_TYPE_CUBE":Uw[r.envMapMode]||"ENVMAP_TYPE_CUBE"}const Pw={[bo]:"ENVMAP_MODE_REFRACTION"};function Iw(r){return r.envMap===!1?"ENVMAP_MODE_REFLECTION":Pw[r.envMapMode]||"ENVMAP_MODE_REFLECTION"}const zw={[Xm]:"ENVMAP_BLENDING_MULTIPLY",[Ob]:"ENVMAP_BLENDING_MIX",[Pb]:"ENVMAP_BLENDING_ADD"};function Bw(r){return r.envMap===!1?"ENVMAP_BLENDING_NONE":zw[r.combine]||"ENVMAP_BLENDING_NONE"}function Fw(r){const t=r.envMapCubeUVHeight;if(t===null)return null;const i=Math.log2(t)-2,s=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,i),112)),texelHeight:s,maxMip:i}}function Hw(r,t,i,s){const l=r.getContext(),c=i.defines;let f=i.vertexShader,d=i.fragmentShader;const m=Lw(i),p=Ow(i),_=Iw(i),v=Bw(i),g=Fw(i),y=Ew(i),b=bw(c),C=l.createProgram();let M,S,N=i.glslVersion?"#version "+i.glslVersion+`
`:"";i.isRawShaderMaterial?(M=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,b].filter(Vl).join(`
`),M.length>0&&(M+=`
`),S=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,b].filter(Vl).join(`
`),S.length>0&&(S+=`
`)):(M=[P1(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,b,i.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",i.batching?"#define USE_BATCHING":"",i.batchingColor?"#define USE_BATCHING_COLOR":"",i.instancing?"#define USE_INSTANCING":"",i.instancingColor?"#define USE_INSTANCING_COLOR":"",i.instancingMorph?"#define USE_INSTANCING_MORPH":"",i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.map?"#define USE_MAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+_:"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.displacementMap?"#define USE_DISPLACEMENTMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.mapUv?"#define MAP_UV "+i.mapUv:"",i.alphaMapUv?"#define ALPHAMAP_UV "+i.alphaMapUv:"",i.lightMapUv?"#define LIGHTMAP_UV "+i.lightMapUv:"",i.aoMapUv?"#define AOMAP_UV "+i.aoMapUv:"",i.emissiveMapUv?"#define EMISSIVEMAP_UV "+i.emissiveMapUv:"",i.bumpMapUv?"#define BUMPMAP_UV "+i.bumpMapUv:"",i.normalMapUv?"#define NORMALMAP_UV "+i.normalMapUv:"",i.displacementMapUv?"#define DISPLACEMENTMAP_UV "+i.displacementMapUv:"",i.metalnessMapUv?"#define METALNESSMAP_UV "+i.metalnessMapUv:"",i.roughnessMapUv?"#define ROUGHNESSMAP_UV "+i.roughnessMapUv:"",i.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+i.anisotropyMapUv:"",i.clearcoatMapUv?"#define CLEARCOATMAP_UV "+i.clearcoatMapUv:"",i.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+i.clearcoatNormalMapUv:"",i.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+i.clearcoatRoughnessMapUv:"",i.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+i.iridescenceMapUv:"",i.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+i.iridescenceThicknessMapUv:"",i.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+i.sheenColorMapUv:"",i.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+i.sheenRoughnessMapUv:"",i.specularMapUv?"#define SPECULARMAP_UV "+i.specularMapUv:"",i.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+i.specularColorMapUv:"",i.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+i.specularIntensityMapUv:"",i.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+i.transmissionMapUv:"",i.thicknessMapUv?"#define THICKNESSMAP_UV "+i.thicknessMapUv:"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexNormals?"#define HAS_NORMAL":"",i.vertexColors?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.flatShading?"#define FLAT_SHADED":"",i.skinning?"#define USE_SKINNING":"",i.morphTargets?"#define USE_MORPHTARGETS":"",i.morphNormals&&i.flatShading===!1?"#define USE_MORPHNORMALS":"",i.morphColors?"#define USE_MORPHCOLORS":"",i.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+i.morphTextureStride:"",i.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+i.morphTargetsCount:"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+m:"",i.sizeAttenuation?"#define USE_SIZEATTENUATION":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Vl).join(`
`),S=[P1(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,b,i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",i.map?"#define USE_MAP":"",i.matcap?"#define USE_MATCAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+p:"",i.envMap?"#define "+_:"",i.envMap?"#define "+v:"",g?"#define CUBEUV_TEXEL_WIDTH "+g.texelWidth:"",g?"#define CUBEUV_TEXEL_HEIGHT "+g.texelHeight:"",g?"#define CUBEUV_MAX_MIP "+g.maxMip+".0":"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoat?"#define USE_CLEARCOAT":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.dispersion?"#define USE_DISPERSION":"",i.retroreflection?"#define USE_RETROREFLECTION":"",i.iridescence?"#define USE_IRIDESCENCE":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaTest?"#define USE_ALPHATEST":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.sheen?"#define USE_SHEEN":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors||i.instancingColor?"#define USE_COLOR":"",i.vertexAlphas||i.batchingColor?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.gradientMap?"#define USE_GRADIENTMAP":"",i.flatShading?"#define FLAT_SHADED":"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+m:"",i.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",i.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",i.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",i.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",i.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",i.toneMapping!==ca?"#define TONE_MAPPING":"",i.toneMapping!==ca?Re.tonemapping_pars_fragment:"",i.toneMapping!==ca?yw("toneMapping",i.toneMapping):"",i.dithering?"#define DITHERING":"",i.opaque?"#define OPAQUE":"",Re.colorspace_pars_fragment,xw("linearToOutputTexel",i.outputColorSpace),Mw(),i.useDepthPacking?"#define DEPTH_PACKING "+i.depthPacking:"",`
`].filter(Vl).join(`
`)),f=Im(f),f=L1(f,i),f=U1(f,i),d=Im(d),d=L1(d,i),d=U1(d,i),f=O1(f),d=O1(d),i.isRawShaderMaterial!==!0&&(N=`#version 300 es
`,M=[y,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+M,S=["#define varying in",i.glslVersion===Bx?"":"layout(location = 0) out highp vec4 pc_fragColor;",i.glslVersion===Bx?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+S);const I=N+M+f,A=N+S+d,U=C1(l,l.VERTEX_SHADER,I),L=C1(l,l.FRAGMENT_SHADER,A);l.attachShader(C,U),l.attachShader(C,L),i.index0AttributeName!==void 0?l.bindAttribLocation(C,0,i.index0AttributeName):i.hasPositionAttribute===!0&&l.bindAttribLocation(C,0,"position"),l.linkProgram(C);function P(G){if(r.debug.checkShaderErrors){const K=l.getProgramInfoLog(C)||"",it=l.getShaderInfoLog(U)||"",X=l.getShaderInfoLog(L)||"",j=K.trim(),k=it.trim(),Q=X.trim();let ct=!0,lt=!0;if(l.getProgramParameter(C,l.LINK_STATUS)===!1)if(ct=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(l,C,U,L);else{const pt=D1(l,U,"vertex"),yt=D1(l,L,"fragment");Ge("WebGLProgram: Shader Error "+l.getError()+" - VALIDATE_STATUS "+l.getProgramParameter(C,l.VALIDATE_STATUS)+`

Material Name: `+G.name+`
Material Type: `+G.type+`

Program Info Log: `+j+`
`+pt+`
`+yt)}else j!==""?_e("WebGLProgram: Program Info Log:",j):(k===""||Q==="")&&(lt=!1);lt&&(G.diagnostics={runnable:ct,programLog:j,vertexShader:{log:k,prefix:M},fragmentShader:{log:Q,prefix:S}})}l.deleteShader(U),l.deleteShader(L),T=new of(l,C),D=Tw(l,C)}let T;this.getUniforms=function(){return T===void 0&&P(this),T};let D;this.getAttributes=function(){return D===void 0&&P(this),D};let H=i.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return H===!1&&(H=l.getProgramParameter(C,mw)),H},this.destroy=function(){s.releaseStatesOfProgram(this),l.deleteProgram(C),this.program=void 0},this.type=i.shaderType,this.name=i.shaderName,this.id=gw++,this.cacheKey=t,this.usedTimes=1,this.program=C,this.vertexShader=U,this.fragmentShader=L,this}let Vw=0;class Gw{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,i,s){const l=this._getShaderCacheForMaterial(t);return l.has(i)===!1&&(l.add(i),i.usedTimes++),l.has(s)===!1&&(l.add(s),s.usedTimes++),this}remove(t){const i=this.materialCache.get(t);for(const s of i)s.usedTimes--,s.usedTimes===0&&this.shaderCache.delete(s.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const i=this.materialCache;let s=i.get(t);return s===void 0&&(s=new Set,i.set(t,s)),s}_getShaderStage(t){const i=this.shaderCache;let s=i.get(t);return s===void 0&&(s=new Xw(t),i.set(t,s)),s}}class Xw{constructor(t){this.id=Vw++,this.code=t,this.usedTimes=0}}function kw(r){return r===ur||r===cf||r===uf}function Ww(r,t,i,s,l,c){const f=new e0,d=new Gw,m=new Set,p=[],_=new Map,v=s.logarithmicDepthBuffer;let g=s.precision;const y={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function b(T){return m.add(T),T===0?"uv":`uv${T}`}function C(T,D,H,G,K,it){const X=G.fog,j=K.geometry,k=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?G.environment:null,Q=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap,ct=t.get(T.envMap||k,Q),lt=ct&&ct.mapping===xf?ct.image.height:null,pt=y[T.type];T.precision!==null&&(g=s.getMaxPrecision(T.precision),g!==T.precision&&_e("WebGLProgram.getParameters:",T.precision,"not supported, using",g,"instead."));const yt=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,Yt=yt!==void 0?yt.length:0;let Wt=0;j.morphAttributes.position!==void 0&&(Wt=1),j.morphAttributes.normal!==void 0&&(Wt=2),j.morphAttributes.color!==void 0&&(Wt=3);let V,_t,Pt,J;if(pt){const Be=ra[pt];V=Be.vertexShader,_t=Be.fragmentShader}else{V=T.vertexShader,_t=T.fragmentShader;const Be=d.getVertexShaderStage(T),ye=d.getFragmentShaderStage(T);d.update(T,Be,ye),Pt=Be.id,J=ye.id}const F=r.getRenderTarget(),st=r.state.buffers.depth.getReversed(),wt=K.isInstancedMesh===!0,rt=K.isBatchedMesh===!0,At=!!T.map,fe=!!T.matcap,xt=!!ct,Ct=!!T.aoMap,Ut=!!T.lightMap,Nt=!!T.bumpMap&&T.wireframe===!1,Dt=!!T.normalMap,se=!!T.displacementMap,re=!!T.emissiveMap,gt=!!T.metalnessMap,It=!!T.roughnessMap,z=T.anisotropy>0,ce=T.clearcoat>0,de=T.dispersion>0,O=T.retroreflectivity>0,E=T.iridescence>0,Y=T.sheen>0,at=T.transmission>0,vt=z&&!!T.anisotropyMap,Ot=ce&&!!T.clearcoatMap,zt=ce&&!!T.clearcoatNormalMap,St=ce&&!!T.clearcoatRoughnessMap,Rt=E&&!!T.iridescenceMap,Ht=E&&!!T.iridescenceThicknessMap,he=Y&&!!T.sheenColorMap,qt=Y&&!!T.sheenRoughnessMap,kt=!!T.specularMap,$t=!!T.specularColorMap,me=!!T.specularIntensityMap,Se=at&&!!T.transmissionMap,Z=at&&!!T.thicknessMap,Ft=!!T.gradientMap,Tt=!!T.alphaMap,Vt=T.alphaTest>0,jt=!!T.alphaHash,Lt=!!T.extensions;let ue=ca;T.toneMapped&&(F===null||F.isXRRenderTarget===!0)&&(ue=r.toneMapping);const Qt={shaderID:pt,shaderType:T.type,shaderName:T.name,vertexShader:V,fragmentShader:_t,defines:T.defines,customVertexShaderID:Pt,customFragmentShaderID:J,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:g,batching:rt,batchingColor:rt&&K._colorsTexture!==null,instancing:wt,instancingColor:wt&&K.instanceColor!==null,instancingMorph:wt&&K.morphTexture!==null,outputColorSpace:F===null?r.outputColorSpace:F.isXRRenderTarget===!0?F.texture.colorSpace:He.workingColorSpace,alphaToCoverage:!!T.alphaToCoverage,map:At,matcap:fe,envMap:xt,envMapMode:xt&&ct.mapping,envMapCubeUVHeight:lt,aoMap:Ct,lightMap:Ut,bumpMap:Nt,normalMap:Dt,displacementMap:se,emissiveMap:re,normalMapObjectSpace:Dt&&T.normalMapType===Bb,normalMapTangentSpace:Dt&&T.normalMapType===ff,packedNormalMap:Dt&&T.normalMapType===ff&&kw(T.normalMap.format),metalnessMap:gt,roughnessMap:It,anisotropy:z,anisotropyMap:vt,clearcoat:ce,clearcoatMap:Ot,clearcoatNormalMap:zt,clearcoatRoughnessMap:St,dispersion:de,retroreflection:O,iridescence:E,iridescenceMap:Rt,iridescenceThicknessMap:Ht,sheen:Y,sheenColorMap:he,sheenRoughnessMap:qt,specularMap:kt,specularColorMap:$t,specularIntensityMap:me,transmission:at,transmissionMap:Se,thicknessMap:Z,gradientMap:Ft,opaque:T.transparent===!1&&T.blending===kl&&T.alphaToCoverage===!1,alphaMap:Tt,alphaTest:Vt,alphaHash:jt,combine:T.combine,mapUv:At&&b(T.map.channel),aoMapUv:Ct&&b(T.aoMap.channel),lightMapUv:Ut&&b(T.lightMap.channel),bumpMapUv:Nt&&b(T.bumpMap.channel),normalMapUv:Dt&&b(T.normalMap.channel),displacementMapUv:se&&b(T.displacementMap.channel),emissiveMapUv:re&&b(T.emissiveMap.channel),metalnessMapUv:gt&&b(T.metalnessMap.channel),roughnessMapUv:It&&b(T.roughnessMap.channel),anisotropyMapUv:vt&&b(T.anisotropyMap.channel),clearcoatMapUv:Ot&&b(T.clearcoatMap.channel),clearcoatNormalMapUv:zt&&b(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:St&&b(T.clearcoatRoughnessMap.channel),iridescenceMapUv:Rt&&b(T.iridescenceMap.channel),iridescenceThicknessMapUv:Ht&&b(T.iridescenceThicknessMap.channel),sheenColorMapUv:he&&b(T.sheenColorMap.channel),sheenRoughnessMapUv:qt&&b(T.sheenRoughnessMap.channel),specularMapUv:kt&&b(T.specularMap.channel),specularColorMapUv:$t&&b(T.specularColorMap.channel),specularIntensityMapUv:me&&b(T.specularIntensityMap.channel),transmissionMapUv:Se&&b(T.transmissionMap.channel),thicknessMapUv:Z&&b(T.thicknessMap.channel),alphaMapUv:Tt&&b(T.alphaMap.channel),vertexTangents:!!j.attributes.tangent&&(Dt||z),vertexNormals:!!j.attributes.normal,vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,pointsUvs:K.isPoints===!0&&!!j.attributes.uv&&(At||Tt),fog:!!X,useFog:T.fog===!0,fogExp2:!!X&&X.isFogExp2,flatShading:T.wireframe===!1&&(T.flatShading===!0||j.attributes.normal===void 0&&Dt===!1&&(T.isMeshLambertMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isMeshPhysicalMaterial)),sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:v,reversedDepthBuffer:st,skinning:K.isSkinnedMesh===!0,hasPositionAttribute:j.attributes.position!==void 0,morphTargets:j.morphAttributes.position!==void 0,morphNormals:j.morphAttributes.normal!==void 0,morphColors:j.morphAttributes.color!==void 0,morphTargetsCount:Yt,morphTextureStride:Wt,numSunLights:D.sun.length,numDirLights:D.directional.length,numPointLights:D.point.length,numSpotLights:D.spot.length,numSpotLightMaps:D.spotLightMap.length,numRectAreaLights:D.rectArea.length,numHemiLights:D.hemi.length,numSunLightShadows:D.sunShadowMap.length,numDirLightShadows:D.directionalShadowMap.length,numPointLightShadows:D.pointShadowMap.length,numSpotLightShadows:D.spotShadowMap.length,numSpotLightShadowsWithMaps:D.numSpotLightShadowsWithMaps,numLightProbes:D.numLightProbes,numLightProbeGrids:it.length,numClippingPlanes:c.numPlanes,numClipIntersection:c.numIntersection,dithering:T.dithering,shadowMapEnabled:r.shadowMap.enabled&&H.length>0,shadowMapType:r.shadowMap.type,toneMapping:ue,decodeVideoTexture:At&&T.map.isVideoTexture===!0&&He.getTransfer(T.map.colorSpace)===Qe,decodeVideoTextureEmissive:re&&T.emissiveMap.isVideoTexture===!0&&He.getTransfer(T.emissiveMap.colorSpace)===Qe,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===za,flipSided:T.side===Kn,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:Lt&&T.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Lt&&T.extensions.multiDraw===!0||rt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return Qt.vertexUv1s=m.has(1),Qt.vertexUv2s=m.has(2),Qt.vertexUv3s=m.has(3),m.clear(),Qt}function M(T){const D=[];if(T.shaderID?D.push(T.shaderID):(D.push(T.customVertexShaderID),D.push(T.customFragmentShaderID)),T.defines!==void 0)for(const H in T.defines)D.push(H),D.push(T.defines[H]);return T.isRawShaderMaterial===!1&&(S(D,T),N(D,T),D.push(r.outputColorSpace)),D.push(T.customProgramCacheKey),D.join()}function S(T,D){T.push(D.precision),T.push(D.outputColorSpace),T.push(D.envMapMode),T.push(D.envMapCubeUVHeight),T.push(D.mapUv),T.push(D.alphaMapUv),T.push(D.lightMapUv),T.push(D.aoMapUv),T.push(D.bumpMapUv),T.push(D.normalMapUv),T.push(D.displacementMapUv),T.push(D.emissiveMapUv),T.push(D.metalnessMapUv),T.push(D.roughnessMapUv),T.push(D.anisotropyMapUv),T.push(D.clearcoatMapUv),T.push(D.clearcoatNormalMapUv),T.push(D.clearcoatRoughnessMapUv),T.push(D.iridescenceMapUv),T.push(D.iridescenceThicknessMapUv),T.push(D.sheenColorMapUv),T.push(D.sheenRoughnessMapUv),T.push(D.specularMapUv),T.push(D.specularColorMapUv),T.push(D.specularIntensityMapUv),T.push(D.transmissionMapUv),T.push(D.thicknessMapUv),T.push(D.combine),T.push(D.fogExp2),T.push(D.sizeAttenuation),T.push(D.morphTargetsCount),T.push(D.morphAttributeCount),T.push(D.numSunLights),T.push(D.numDirLights),T.push(D.numPointLights),T.push(D.numSpotLights),T.push(D.numSpotLightMaps),T.push(D.numHemiLights),T.push(D.numRectAreaLights),T.push(D.numSunLightShadows),T.push(D.numDirLightShadows),T.push(D.numPointLightShadows),T.push(D.numSpotLightShadows),T.push(D.numSpotLightShadowsWithMaps),T.push(D.numLightProbes),T.push(D.shadowMapType),T.push(D.toneMapping),T.push(D.numClippingPlanes),T.push(D.numClipIntersection),T.push(D.depthPacking)}function N(T,D){f.disableAll(),D.instancing&&f.enable(0),D.instancingColor&&f.enable(1),D.instancingMorph&&f.enable(2),D.matcap&&f.enable(3),D.envMap&&f.enable(4),D.normalMapObjectSpace&&f.enable(5),D.normalMapTangentSpace&&f.enable(6),D.clearcoat&&f.enable(7),D.iridescence&&f.enable(8),D.alphaTest&&f.enable(9),D.vertexColors&&f.enable(10),D.vertexAlphas&&f.enable(11),D.vertexUv1s&&f.enable(12),D.vertexUv2s&&f.enable(13),D.vertexUv3s&&f.enable(14),D.vertexTangents&&f.enable(15),D.anisotropy&&f.enable(16),D.alphaHash&&f.enable(17),D.batching&&f.enable(18),D.dispersion&&f.enable(19),D.retroreflection&&f.enable(24),D.batchingColor&&f.enable(20),D.gradientMap&&f.enable(21),D.packedNormalMap&&f.enable(22),D.vertexNormals&&f.enable(23),T.push(f.mask),f.disableAll(),D.fog&&f.enable(0),D.useFog&&f.enable(1),D.flatShading&&f.enable(2),D.logarithmicDepthBuffer&&f.enable(3),D.reversedDepthBuffer&&f.enable(4),D.skinning&&f.enable(5),D.morphTargets&&f.enable(6),D.morphNormals&&f.enable(7),D.morphColors&&f.enable(8),D.premultipliedAlpha&&f.enable(9),D.shadowMapEnabled&&f.enable(10),D.doubleSided&&f.enable(11),D.flipSided&&f.enable(12),D.useDepthPacking&&f.enable(13),D.dithering&&f.enable(14),D.transmission&&f.enable(15),D.sheen&&f.enable(16),D.opaque&&f.enable(17),D.pointsUvs&&f.enable(18),D.decodeVideoTexture&&f.enable(19),D.decodeVideoTextureEmissive&&f.enable(20),D.alphaToCoverage&&f.enable(21),D.numLightProbeGrids>0&&f.enable(22),D.hasPositionAttribute&&f.enable(23),T.push(f.mask)}function I(T){const D=y[T.type];let H;if(D){const G=ra[D];H=i2.clone(G.uniforms)}else H=T.uniforms;return H}function A(T,D){let H=_.get(D);return H!==void 0?++H.usedTimes:(H=new Hw(r,D,T,l),p.push(H),_.set(D,H)),H}function U(T){if(--T.usedTimes===0){const D=p.indexOf(T);p[D]=p[p.length-1],p.pop(),_.delete(T.cacheKey),T.destroy()}}function L(T){d.remove(T)}function P(){d.dispose()}return{getParameters:C,getProgramCacheKey:M,getUniforms:I,acquireProgram:A,releaseProgram:U,releaseShaderCache:L,programs:p,dispose:P}}function qw(){let r=new WeakMap;function t(f){return r.has(f)}function i(f){let d=r.get(f);return d===void 0&&(d={},r.set(f,d)),d}function s(f){r.delete(f)}function l(f,d,m){r.get(f)[d]=m}function c(){r=new WeakMap}return{has:t,get:i,remove:s,update:l,dispose:c}}function Yw(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.material.id!==t.material.id?r.material.id-t.material.id:r.materialVariant!==t.materialVariant?r.materialVariant-t.materialVariant:r.z!==t.z?r.z-t.z:r.id-t.id}function I1(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.z!==t.z?t.z-r.z:r.id-t.id}function z1(){const r=[];let t=0;const i=[],s=[],l=[];function c(){t=0,i.length=0,s.length=0,l.length=0}function f(g){let y=0;return g.isInstancedMesh&&(y+=2),g.isSkinnedMesh&&(y+=1),y}function d(g,y,b,C,M,S){let N=r[t];return N===void 0?(N={id:g.id,object:g,geometry:y,material:b,materialVariant:f(g),groupOrder:C,renderOrder:g.renderOrder,z:M,group:S},r[t]=N):(N.id=g.id,N.object=g,N.geometry=y,N.material=b,N.materialVariant=f(g),N.groupOrder=C,N.renderOrder=g.renderOrder,N.z=M,N.group=S),t++,N}function m(g,y,b,C,M,S,N){N.reversedDepth===!0&&(M=-M);const I=d(g,y,b,C,M,S);b.transmission>0?s.push(I):b.transparent===!0?l.push(I):i.push(I)}function p(g,y,b,C,M,S){const N=d(g,y,b,C,M,S);b.transmission>0?s.unshift(N):b.transparent===!0?l.unshift(N):i.unshift(N)}function _(g,y){i.length>1&&i.sort(g||Yw),s.length>1&&s.sort(y||I1),l.length>1&&l.sort(y||I1)}function v(){for(let g=t,y=r.length;g<y;g++){const b=r[g];if(b.id===null)break;b.id=null,b.object=null,b.geometry=null,b.material=null,b.group=null}}return{opaque:i,transmissive:s,transparent:l,init:c,push:m,unshift:p,finish:v,sort:_}}function Zw(){let r=new WeakMap;function t(s,l){const c=r.get(s);let f;return c===void 0?(f=new z1,r.set(s,[f])):l>=c.length?(f=new z1,c.push(f)):f=c[l],f}function i(){r=new WeakMap}return{get:t,dispose:i}}function Kw(){const r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let i;switch(t.type){case"SunLight":case"DirectionalLight":i={direction:new tt,color:new be};break;case"SpotLight":i={position:new tt,direction:new tt,color:new be,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":i={position:new tt,color:new be,distance:0,decay:0};break;case"HemisphereLight":i={direction:new tt,skyColor:new be,groundColor:new be};break;case"RectAreaLight":i={color:new be,position:new tt,halfWidth:new tt,halfHeight:new tt};break}return r[t.id]=i,i}}}function Jw(){const r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let i;switch(t.type){case"SunLight":case"DirectionalLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt};break;case"SpotLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt};break;case"PointLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[t.id]=i,i}}}let Qw=0;function jw(r,t){return(t.castShadow?2:0)-(r.castShadow?2:0)+(t.map?1:0)-(r.map?1:0)}function $w(r){const t=new Kw,i=Jw(),s={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let p=0;p<9;p++)s.probe.push(new tt);const l=new tt,c=new nn,f=new nn;function d(p){let _=0,v=0,g=0;for(let K=0;K<9;K++)s.probe[K].set(0,0,0);let y=0,b=0,C=0,M=0,S=0,N=0,I=0,A=0,U=0,L=0,P=0,T=0,D=0,H=0;p.sort(jw);for(let K=0,it=p.length;K<it;K++){const X=p[K],j=X.color,k=X.intensity,Q=X.distance;let ct=null;if(X.shadow&&X.shadow.map&&(X.shadow.map.texture.format===ur?ct=X.shadow.map.texture:ct=X.shadow.map.depthTexture||X.shadow.map.texture),X.isAmbientLight)_+=j.r*k,v+=j.g*k,g+=j.b*k;else if(X.isLightProbe){for(let lt=0;lt<9;lt++)s.probe[lt].addScaledVector(X.sh.coefficients[lt],k);H++}else if(X.isSunLight){const lt=t.get(X);if(lt.color.copy(X.color).multiplyScalar(X.intensity),X.castShadow){const pt=X.shadow,yt=i.get(X);yt.shadowIntensity=pt.intensity,yt.shadowBias=pt.bias,yt.shadowNormalBias=pt.normalBias,yt.shadowRadius=pt.radius,yt.shadowMapSize.copy(pt.mapSize).multiply(pt.getFrameExtents()),s.sunShadow[b]=yt,s.sunShadowMap[b]=ct;const Yt=pt.getViewportCount();for(let Wt=0;Wt<Yt;Wt++)s.sunShadowMatrix[C+Wt]=pt.getMatrix(Wt),s.sunShadowCascade[C+Wt]=pt._cascadeData[Wt];C+=Yt,b++}s.sun[y]=lt,y++}else if(X.isDirectionalLight){const lt=t.get(X);if(lt.color.copy(X.color).multiplyScalar(X.intensity),X.castShadow){const pt=X.shadow,yt=i.get(X);yt.shadowIntensity=pt.intensity,yt.shadowBias=pt.bias,yt.shadowNormalBias=pt.normalBias,yt.shadowRadius=pt.radius,yt.shadowMapSize=pt.mapSize,s.directionalShadow[M]=yt,s.directionalShadowMap[M]=ct,s.directionalShadowMatrix[M]=X.shadow.matrix,U++}s.directional[M]=lt,M++}else if(X.isSpotLight){const lt=t.get(X);lt.position.setFromMatrixPosition(X.matrixWorld),lt.color.copy(j).multiplyScalar(k),lt.distance=Q,lt.coneCos=Math.cos(X.angle),lt.penumbraCos=Math.cos(X.angle*(1-X.penumbra)),lt.decay=X.decay,s.spot[N]=lt;const pt=X.shadow;if(X.map&&(s.spotLightMap[T]=X.map,T++,pt.updateMatrices(X),X.castShadow&&D++),s.spotLightMatrix[N]=pt.matrix,X.castShadow){const yt=i.get(X);yt.shadowIntensity=pt.intensity,yt.shadowBias=pt.bias,yt.shadowNormalBias=pt.normalBias,yt.shadowRadius=pt.radius,yt.shadowMapSize=pt.mapSize,s.spotShadow[N]=yt,s.spotShadowMap[N]=ct,P++}N++}else if(X.isRectAreaLight){const lt=t.get(X);lt.color.copy(j).multiplyScalar(k),lt.halfWidth.set(X.width*.5,0,0),lt.halfHeight.set(0,X.height*.5,0),s.rectArea[I]=lt,I++}else if(X.isPointLight){const lt=t.get(X);if(lt.color.copy(X.color).multiplyScalar(X.intensity),lt.distance=X.distance,lt.decay=X.decay,X.castShadow){const pt=X.shadow,yt=i.get(X);yt.shadowIntensity=pt.intensity,yt.shadowBias=pt.bias,yt.shadowNormalBias=pt.normalBias,yt.shadowRadius=pt.radius,yt.shadowMapSize=pt.mapSize,yt.shadowCameraNear=pt.camera.near,yt.shadowCameraFar=pt.camera.far,s.pointShadow[S]=yt,s.pointShadowMap[S]=ct,s.pointShadowMatrix[S]=X.shadow.matrix,L++}s.point[S]=lt,S++}else if(X.isHemisphereLight){const lt=t.get(X);lt.skyColor.copy(X.color).multiplyScalar(k),lt.groundColor.copy(X.groundColor).multiplyScalar(k),s.hemi[A]=lt,A++}}I>0&&(r.has("OES_texture_float_linear")===!0?(s.rectAreaLTC1=Jt.LTC_FLOAT_1,s.rectAreaLTC2=Jt.LTC_FLOAT_2):(s.rectAreaLTC1=Jt.LTC_HALF_1,s.rectAreaLTC2=Jt.LTC_HALF_2)),s.ambient[0]=_,s.ambient[1]=v,s.ambient[2]=g;const G=s.hash;(G.sunLength!==y||G.directionalLength!==M||G.pointLength!==S||G.spotLength!==N||G.rectAreaLength!==I||G.hemiLength!==A||G.numSunShadows!==b||G.numDirectionalShadows!==U||G.numPointShadows!==L||G.numSpotShadows!==P||G.numSpotMaps!==T||G.numLightProbes!==H)&&(s.sun.length=y,s.directional.length=M,s.spot.length=N,s.rectArea.length=I,s.point.length=S,s.hemi.length=A,s.sunShadow.length=b,s.sunShadowMap.length=b,s.sunShadowMatrix.length=C,s.sunShadowCascade.length=C,s.directionalShadow.length=U,s.directionalShadowMap.length=U,s.directionalShadowMatrix.length=U,s.pointShadow.length=L,s.pointShadowMap.length=L,s.pointShadowMatrix.length=L,s.spotShadow.length=P,s.spotShadowMap.length=P,s.spotLightMatrix.length=P+T-D,s.spotLightMap.length=T,s.numSpotLightShadowsWithMaps=D,s.numLightProbes=H,G.sunLength=y,G.directionalLength=M,G.pointLength=S,G.spotLength=N,G.rectAreaLength=I,G.hemiLength=A,G.numSunShadows=b,G.numDirectionalShadows=U,G.numPointShadows=L,G.numSpotShadows=P,G.numSpotMaps=T,G.numLightProbes=H,s.version=Qw++)}function m(p,_){let v=0,g=0,y=0,b=0,C=0,M=0;const S=_.matrixWorldInverse;for(let N=0,I=p.length;N<I;N++){const A=p[N];if(A.isSunLight){const U=s.sun[v];U.direction.setFromMatrixPosition(A.matrixWorld),U.direction.transformDirection(S),v++}else if(A.isDirectionalLight){const U=s.directional[g];U.direction.setFromMatrixPosition(A.matrixWorld),l.setFromMatrixPosition(A.target.matrixWorld),U.direction.sub(l),U.direction.transformDirection(S),g++}else if(A.isSpotLight){const U=s.spot[b];U.position.setFromMatrixPosition(A.matrixWorld),U.position.applyMatrix4(S),U.direction.setFromMatrixPosition(A.matrixWorld),l.setFromMatrixPosition(A.target.matrixWorld),U.direction.sub(l),U.direction.transformDirection(S),b++}else if(A.isRectAreaLight){const U=s.rectArea[C];U.position.setFromMatrixPosition(A.matrixWorld),U.position.applyMatrix4(S),f.identity(),c.copy(A.matrixWorld),c.premultiply(S),f.extractRotation(c),U.halfWidth.set(A.width*.5,0,0),U.halfHeight.set(0,A.height*.5,0),U.halfWidth.applyMatrix4(f),U.halfHeight.applyMatrix4(f),C++}else if(A.isPointLight){const U=s.point[y];U.position.setFromMatrixPosition(A.matrixWorld),U.position.applyMatrix4(S),y++}else if(A.isHemisphereLight){const U=s.hemi[M];U.direction.setFromMatrixPosition(A.matrixWorld),U.direction.transformDirection(S),M++}}}return{setup:d,setupView:m,state:s}}function B1(r){const t=new $w(r),i=[],s=[],l=[];function c(g){v.camera=g,i.length=0,s.length=0,l.length=0}function f(g){i.push(g)}function d(g){s.push(g)}function m(g){l.push(g)}function p(){t.setup(i)}function _(g){t.setupView(i,g)}const v={lightsArray:i,shadowsArray:s,lightProbeGridArray:l,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:c,state:v,setupLights:p,setupLightsView:_,pushLight:f,pushShadow:d,pushLightProbeGrid:m}}function tC(r){let t=new WeakMap;function i(l,c=0){const f=t.get(l);let d;return f===void 0?(d=new B1(r),t.set(l,[d])):c>=f.length?(d=new B1(r),f.push(d)):d=f[c],d}function s(){t=new WeakMap}return{get:i,dispose:s}}const eC=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,nC=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,iC=[new tt(1,0,0),new tt(-1,0,0),new tt(0,1,0),new tt(0,-1,0),new tt(0,0,1),new tt(0,0,-1)],aC=[new tt(0,-1,0),new tt(0,-1,0),new tt(0,0,1),new tt(0,0,-1),new tt(0,-1,0),new tt(0,-1,0)],F1=new nn,Il=new tt,Bp=new tt;function sC(r,t,i){let s=new i0;const l=new Bt,c=new Bt,f=new cn,d=new c2,m=new u2,p={},_=i.maxTextureSize,v={[lr]:Kn,[Kn]:lr,[za]:za},g=new pa({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Bt},radius:{value:4}},vertexShader:eC,fragmentShader:nC}),y=g.clone();y.defines.HORIZONTAL_PASS=1;const b=new ai;b.setAttribute("position",new ua(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const C=new We(b,g),M=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Xl;let S=this.type;this.render=function(L,P,T){if(M.enabled===!1||M.autoUpdate===!1&&M.needsUpdate===!1||L.length===0)return;this.type===mb&&(_e("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Xl);const D=r.getRenderTarget(),H=r.getActiveCubeFace(),G=r.getActiveMipmapLevel(),K=r.state;K.setBlending(Fa),K.buffers.depth.getReversed()===!0?K.buffers.color.setClear(0,0,0,0):K.buffers.color.setClear(1,1,1,1),K.buffers.depth.setTest(!0),K.setScissorTest(!1);const it=S!==this.type;it&&P.traverse(function(X){X.material&&(Array.isArray(X.material)?X.material.forEach(j=>j.needsUpdate=!0):X.material.needsUpdate=!0)});for(let X=0,j=L.length;X<j;X++){const k=L[X],Q=k.shadow;if(Q===void 0){_e("WebGLShadowMap:",k,"has no shadow.");continue}if(Q.autoUpdate===!1&&Q.needsUpdate===!1)continue;l.copy(Q.mapSize);const ct=Q.getFrameExtents();l.multiply(ct),c.copy(Q.mapSize),(l.x>_||l.y>_)&&(l.x>_&&(c.x=Math.floor(_/ct.x),l.x=c.x*ct.x,Q.mapSize.x=c.x),l.y>_&&(c.y=Math.floor(_/ct.y),l.y=c.y*ct.y,Q.mapSize.y=c.y));const lt=r.state.buffers.depth.getReversed();if(Q.camera._reversedDepth=lt,Q.map===null||it===!0){if(Q.map!==null&&(Q.map.depthTexture!==null&&(Q.map.depthTexture.dispose(),Q.map.depthTexture=null),Q.map.dispose()),this.type===Fl){if(k.isPointLight){_e("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}Q.map=new Gi(l.x,l.y,{format:ur,type:ha,minFilter:Vn,magFilter:Vn,generateMipmaps:!1}),Q.map.texture.name=k.name+".shadowMap",Q.map.depthTexture=new jl(l.x,l.y,Hi),Q.map.depthTexture.name=k.name+".shadowMapDepth",Q.map.depthTexture.format=Xa,Q.map.depthTexture.compareFunction=null,Q.map.depthTexture.minFilter=zn,Q.map.depthTexture.magFilter=zn}else k.isPointLight?(Q.map=new qS(l.x),Q.map.depthTexture=new MT(l.x,fa)):(Q.map=new Gi(l.x,l.y),Q.map.depthTexture=new jl(l.x,l.y,fa)),Q.map.depthTexture.name=k.name+".shadowMap",Q.map.depthTexture.format=Xa,this.type===Xl?(Q.map.depthTexture.compareFunction=lt?$m:jm,Q.map.depthTexture.minFilter=Vn,Q.map.depthTexture.magFilter=Vn):(Q.map.depthTexture.compareFunction=null,Q.map.depthTexture.minFilter=zn,Q.map.depthTexture.magFilter=zn);Q.camera.updateProjectionMatrix()}Q.map.isWebGLCubeRenderTarget!==!0&&(Q.map.width!==l.x||Q.map.height!==l.y)&&Q.map.setSize(l.x,l.y);const pt=Q.map.isWebGLCubeRenderTarget?6:Q.getViewportCount();k.isPointLight!==!0&&Q.updateMatrices(k,T);for(let yt=0;yt<pt;yt++){const Yt=Q.getCamera(yt);if(k.isPointLight){const Wt=Q.camera,V=Q.matrix,_t=k.distance||Wt.far;_t!==Wt.far&&(Wt.far=_t,Wt.updateProjectionMatrix()),Il.setFromMatrixPosition(k.matrixWorld),Wt.position.copy(Il),Bp.copy(Wt.position),Bp.add(iC[yt]),Wt.up.copy(aC[yt]),Wt.lookAt(Bp),Wt.updateMatrixWorld(),V.makeTranslation(-Il.x,-Il.y,-Il.z),F1.multiplyMatrices(Wt.projectionMatrix,Wt.matrixWorldInverse),Q._frustum.setFromProjectionMatrix(F1,Wt.coordinateSystem,Wt.reversedDepth)}if(Q.map.isWebGLCubeRenderTarget)r.setRenderTarget(Q.map,yt),r.clear();else{yt===0&&(r.setRenderTarget(Q.map),r.clear());const Wt=Q.getViewport(yt);f.set(c.x*Wt.x,c.y*Wt.y,c.x*Wt.z,c.y*Wt.w),K.viewport(f)}s=Q.getFrustum(yt),A(P,T,Yt,k,this.type)}Q.isPointLightShadow!==!0&&this.type===Fl&&N(Q,T),Q.needsUpdate=!1}S=this.type,M.needsUpdate=!1,r.setRenderTarget(D,H,G)};function N(L,P){const T=t.update(C);g.defines.VSM_SAMPLES!==L.blurSamples&&(g.defines.VSM_SAMPLES=L.blurSamples,y.defines.VSM_SAMPLES=L.blurSamples,g.needsUpdate=!0,y.needsUpdate=!0),L.mapPass===null?L.mapPass=new Gi(l.x,l.y,{format:ur,type:ha}):(L.mapPass.width!==L.map.width||L.mapPass.height!==L.map.height)&&L.mapPass.setSize(L.map.width,L.map.height),g.uniforms.shadow_pass.value=L.map.depthTexture,g.uniforms.resolution.value.set(L.map.width,L.map.height),g.uniforms.radius.value=L.radius,r.setRenderTarget(L.mapPass),r.clear(),r.renderBufferDirect(P,null,T,g,C,null),y.uniforms.shadow_pass.value=L.mapPass.texture,y.uniforms.resolution.value.set(L.map.width,L.map.height),y.uniforms.radius.value=L.radius,r.setRenderTarget(L.map),r.clear(),r.renderBufferDirect(P,null,T,y,C,null)}function I(L,P,T,D){let H=null;const G=T.isPointLight===!0?L.customDistanceMaterial:L.customDepthMaterial;if(G!==void 0)H=G;else if(H=T.isPointLight===!0?m:d,r.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){const K=H.uuid,it=P.uuid;let X=p[K];X===void 0&&(X={},p[K]=X);let j=X[it];j===void 0&&(j=H.clone(),X[it]=j,P.addEventListener("dispose",U)),H=j}if(H.visible=P.visible,H.wireframe=P.wireframe,D===Fl?H.side=P.shadowSide!==null?P.shadowSide:P.side:H.side=P.shadowSide!==null?P.shadowSide:v[P.side],H.alphaMap=P.alphaMap,H.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,H.map=P.map,H.clipShadows=P.clipShadows,H.clippingPlanes=P.clippingPlanes,H.clipIntersection=P.clipIntersection,H.displacementMap=P.displacementMap,H.displacementScale=P.displacementScale,H.displacementBias=P.displacementBias,H.wireframeLinewidth=P.wireframeLinewidth,H.linewidth=P.linewidth,T.isPointLight===!0&&H.isMeshDistanceMaterial===!0){const K=r.properties.get(H);K.light=T}return H}function A(L,P,T,D,H){if(L.visible===!1)return;if(L.layers.test(P.layers)&&(L.isMesh||L.isLine||L.isPoints)&&(L.castShadow||L.receiveShadow&&H===Fl)&&(!L.frustumCulled||L.intersectsFrustum(s))){L.modelViewMatrix.multiplyMatrices(T.matrixWorldInverse,L.matrixWorld);const it=t.update(L),X=L.material;if(Array.isArray(X)){const j=it.groups;for(let k=0,Q=j.length;k<Q;k++){const ct=j[k],lt=X[ct.materialIndex];if(lt&&lt.visible){const pt=I(L,lt,D,H);L.onBeforeShadow(r,L,P,T,it,pt,ct),r.renderBufferDirect(T,null,it,pt,L,ct),L.onAfterShadow(r,L,P,T,it,pt,ct)}}}else if(X.visible){const j=I(L,X,D,H);L.onBeforeShadow(r,L,P,T,it,j,null),r.renderBufferDirect(T,null,it,j,L,null),L.onAfterShadow(r,L,P,T,it,j,null)}}const K=L.children;for(let it=0,X=K.length;it<X;it++)A(K[it],P,T,D,H)}function U(L){L.target.removeEventListener("dispose",U);for(const T in p){const D=p[T],H=L.target.uuid;H in D&&(D[H].dispose(),delete D[H])}}}function rC(r,t){function i(){let Z=!1;const Ft=new cn;let Tt=null;const Vt=new cn(0,0,0,0);return{setMask:function(jt){Tt!==jt&&!Z&&(r.colorMask(jt,jt,jt,jt),Tt=jt)},setLocked:function(jt){Z=jt},setClear:function(jt,Lt,ue,Qt,Be){Be===!0&&(jt*=Qt,Lt*=Qt,ue*=Qt),Ft.set(jt,Lt,ue,Qt),Vt.equals(Ft)===!1&&(r.clearColor(jt,Lt,ue,Qt),Vt.copy(Ft))},reset:function(){Z=!1,Tt=null,Vt.set(-1,0,0,0)}}}function s(){let Z=!1,Ft=!1,Tt=null,Vt=null,jt=null;return{setReversed:function(Lt){if(Ft!==Lt){const ue=t.get("EXT_clip_control");Lt?ue.clipControlEXT(ue.LOWER_LEFT_EXT,ue.ZERO_TO_ONE_EXT):ue.clipControlEXT(ue.LOWER_LEFT_EXT,ue.NEGATIVE_ONE_TO_ONE_EXT),Ft=Lt;const Qt=jt;jt=null,this.setClear(Qt)}},getReversed:function(){return Ft},setTest:function(Lt){Lt?F(r.DEPTH_TEST):st(r.DEPTH_TEST)},setMask:function(Lt){Tt!==Lt&&!Z&&(r.depthMask(Lt),Tt=Lt)},setFunc:function(Lt){if(Ft&&(Lt=Jb[Lt]),Vt!==Lt){switch(Lt){case Wp:r.depthFunc(r.NEVER);break;case qp:r.depthFunc(r.ALWAYS);break;case Yp:r.depthFunc(r.LESS);break;case Yl:r.depthFunc(r.LEQUAL);break;case Zp:r.depthFunc(r.EQUAL);break;case Kp:r.depthFunc(r.GEQUAL);break;case Jp:r.depthFunc(r.GREATER);break;case Qp:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}Vt=Lt}},setLocked:function(Lt){Z=Lt},setClear:function(Lt){jt!==Lt&&(jt=Lt,Ft&&(Lt=1-Lt),r.clearDepth(Lt))},reset:function(){Z=!1,Tt=null,Vt=null,jt=null,Ft=!1}}}function l(){let Z=!1,Ft=null,Tt=null,Vt=null,jt=null,Lt=null,ue=null,Qt=null,Be=null;return{setTest:function(ye){Z||(ye?F(r.STENCIL_TEST):st(r.STENCIL_TEST))},setMask:function(ye){Ft!==ye&&!Z&&(r.stencilMask(ye),Ft=ye)},setFunc:function(ye,si,_i){(Tt!==ye||Vt!==si||jt!==_i)&&(r.stencilFunc(ye,si,_i),Tt=ye,Vt=si,jt=_i)},setOp:function(ye,si,_i){(Lt!==ye||ue!==si||Qt!==_i)&&(r.stencilOp(ye,si,_i),Lt=ye,ue=si,Qt=_i)},setLocked:function(ye){Z=ye},setClear:function(ye){Be!==ye&&(r.clearStencil(ye),Be=ye)},reset:function(){Z=!1,Ft=null,Tt=null,Vt=null,jt=null,Lt=null,ue=null,Qt=null,Be=null}}}const c=new i,f=new s,d=new l,m=new WeakMap,p=new WeakMap;let _={},v={},g={},y=new WeakMap,b=[],C=null,M=!1,S=null,N=null,I=null,A=null,U=null,L=null,P=null,T=new be(0,0,0),D=0,H=!1,G=null,K=null,it=null,X=null,j=null;const k=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Q=!1,ct=0;const lt=r.getParameter(r.VERSION);lt.indexOf("WebGL")!==-1?(ct=parseFloat(/^WebGL (\d)/.exec(lt)[1]),Q=ct>=1):lt.indexOf("OpenGL ES")!==-1&&(ct=parseFloat(/^OpenGL ES (\d)/.exec(lt)[1]),Q=ct>=2);let pt=null,yt={};const Yt=r.getParameter(r.SCISSOR_BOX),Wt=r.getParameter(r.VIEWPORT),V=new cn().fromArray(Yt),_t=new cn().fromArray(Wt);function Pt(Z,Ft,Tt,Vt){const jt=new Uint8Array(4),Lt=r.createTexture();r.bindTexture(Z,Lt),r.texParameteri(Z,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(Z,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let ue=0;ue<Tt;ue++)Z===r.TEXTURE_3D||Z===r.TEXTURE_2D_ARRAY?r.texImage3D(Ft,0,r.RGBA,1,1,Vt,0,r.RGBA,r.UNSIGNED_BYTE,jt):r.texImage2D(Ft+ue,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,jt);return Lt}const J={};J[r.TEXTURE_2D]=Pt(r.TEXTURE_2D,r.TEXTURE_2D,1),J[r.TEXTURE_CUBE_MAP]=Pt(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[r.TEXTURE_2D_ARRAY]=Pt(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),J[r.TEXTURE_3D]=Pt(r.TEXTURE_3D,r.TEXTURE_3D,1,1),c.setClear(0,0,0,1),f.setClear(1),d.setClear(0),F(r.DEPTH_TEST),f.setFunc(Yl),Nt(!1),Dt(Ox),F(r.CULL_FACE),Ct(Fa);function F(Z){_[Z]!==!0&&(r.enable(Z),_[Z]=!0)}function st(Z){_[Z]!==!1&&(r.disable(Z),_[Z]=!1)}function wt(Z,Ft){return g[Z]!==Ft?(r.bindFramebuffer(Z,Ft),g[Z]=Ft,Z===r.DRAW_FRAMEBUFFER&&(g[r.FRAMEBUFFER]=Ft),Z===r.FRAMEBUFFER&&(g[r.DRAW_FRAMEBUFFER]=Ft),!0):!1}function rt(Z,Ft){let Tt=b,Vt=!1;if(Z){Tt=y.get(Ft),Tt===void 0&&(Tt=[],y.set(Ft,Tt));const jt=Z.textures;if(Tt.length!==jt.length||Tt[0]!==r.COLOR_ATTACHMENT0){for(let Lt=0,ue=jt.length;Lt<ue;Lt++)Tt[Lt]=r.COLOR_ATTACHMENT0+Lt;Tt.length=jt.length,Vt=!0}}else Tt[0]!==r.BACK&&(Tt[0]=r.BACK,Vt=!0);Vt&&r.drawBuffers(Tt)}function At(Z){return C!==Z?(r.useProgram(Z),C=Z,!0):!1}const fe={[xo]:r.FUNC_ADD,[vb]:r.FUNC_SUBTRACT,[_b]:r.FUNC_REVERSE_SUBTRACT};fe[xb]=r.MIN,fe[Sb]=r.MAX;const xt={[yb]:r.ZERO,[Mb]:r.ONE,[Eb]:r.SRC_COLOR,[lS]:r.SRC_ALPHA,[Cb]:r.SRC_ALPHA_SATURATE,[Rb]:r.DST_COLOR,[Tb]:r.DST_ALPHA,[bb]:r.ONE_MINUS_SRC_COLOR,[cS]:r.ONE_MINUS_SRC_ALPHA,[wb]:r.ONE_MINUS_DST_COLOR,[Ab]:r.ONE_MINUS_DST_ALPHA,[Nb]:r.CONSTANT_COLOR,[Db]:r.ONE_MINUS_CONSTANT_COLOR,[Lb]:r.CONSTANT_ALPHA,[Ub]:r.ONE_MINUS_CONSTANT_ALPHA};function Ct(Z,Ft,Tt,Vt,jt,Lt,ue,Qt,Be,ye){if(Z===Fa){M===!0&&(st(r.BLEND),M=!1);return}if(M===!1&&(F(r.BLEND),M=!0),Z!==gb){if(Z!==S||ye!==H){if((N!==xo||U!==xo)&&(r.blendEquation(r.FUNC_ADD),N=xo,U=xo),ye)switch(Z){case kl:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Px:r.blendFunc(r.ONE,r.ONE);break;case Ix:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case zx:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:Ge("WebGLState: Invalid blending: ",Z);break}else switch(Z){case kl:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Px:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case Ix:Ge("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case zx:Ge("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ge("WebGLState: Invalid blending: ",Z);break}I=null,A=null,L=null,P=null,T.set(0,0,0),D=0,S=Z,H=ye}return}jt=jt||Ft,Lt=Lt||Tt,ue=ue||Vt,(Ft!==N||jt!==U)&&(r.blendEquationSeparate(fe[Ft],fe[jt]),N=Ft,U=jt),(Tt!==I||Vt!==A||Lt!==L||ue!==P)&&(r.blendFuncSeparate(xt[Tt],xt[Vt],xt[Lt],xt[ue]),I=Tt,A=Vt,L=Lt,P=ue),(Qt.equals(T)===!1||Be!==D)&&(r.blendColor(Qt.r,Qt.g,Qt.b,Be),T.copy(Qt),D=Be),S=Z,H=!1}function Ut(Z,Ft){Z.side===za?st(r.CULL_FACE):F(r.CULL_FACE);let Tt=Z.side===Kn;Ft&&(Tt=!Tt),Nt(Tt),Z.blending===kl&&Z.transparent===!1?Ct(Fa):Ct(Z.blending,Z.blendEquation,Z.blendSrc,Z.blendDst,Z.blendEquationAlpha,Z.blendSrcAlpha,Z.blendDstAlpha,Z.blendColor,Z.blendAlpha,Z.premultipliedAlpha),f.setFunc(Z.depthFunc),f.setTest(Z.depthTest),f.setMask(Z.depthWrite),c.setMask(Z.colorWrite);const Vt=Z.stencilWrite;d.setTest(Vt),Vt&&(d.setMask(Z.stencilWriteMask),d.setFunc(Z.stencilFunc,Z.stencilRef,Z.stencilFuncMask),d.setOp(Z.stencilFail,Z.stencilZFail,Z.stencilZPass)),re(Z.polygonOffset,Z.polygonOffsetFactor,Z.polygonOffsetUnits),Z.alphaToCoverage===!0?F(r.SAMPLE_ALPHA_TO_COVERAGE):st(r.SAMPLE_ALPHA_TO_COVERAGE)}function Nt(Z){G!==Z&&(Z?r.frontFace(r.CW):r.frontFace(r.CCW),G=Z)}function Dt(Z){Z!==db?(F(r.CULL_FACE),Z!==K&&(Z===Ox?r.cullFace(r.BACK):Z===pb?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):st(r.CULL_FACE),K=Z}function se(Z){Z!==it&&(Q&&r.lineWidth(Z),it=Z)}function re(Z,Ft,Tt){Z?(F(r.POLYGON_OFFSET_FILL),(X!==Ft||j!==Tt)&&(X=Ft,j=Tt,f.getReversed()&&(Ft=-Ft),r.polygonOffset(Ft,Tt))):st(r.POLYGON_OFFSET_FILL)}function gt(Z){Z?F(r.SCISSOR_TEST):st(r.SCISSOR_TEST)}function It(Z){Z===void 0&&(Z=r.TEXTURE0+k-1),pt!==Z&&(r.activeTexture(Z),pt=Z)}function z(Z,Ft,Tt){Tt===void 0&&(pt===null?Tt=r.TEXTURE0+k-1:Tt=pt);let Vt=yt[Tt];Vt===void 0&&(Vt={type:void 0,texture:void 0},yt[Tt]=Vt),(Vt.type!==Z||Vt.texture!==Ft)&&(pt!==Tt&&(r.activeTexture(Tt),pt=Tt),r.bindTexture(Z,Ft||J[Z]),Vt.type=Z,Vt.texture=Ft)}function ce(){const Z=yt[pt];Z!==void 0&&Z.type!==void 0&&(r.bindTexture(Z.type,null),Z.type=void 0,Z.texture=void 0)}function de(){try{r.compressedTexImage2D(...arguments)}catch(Z){Ge("WebGLState:",Z)}}function O(){try{r.compressedTexImage3D(...arguments)}catch(Z){Ge("WebGLState:",Z)}}function E(){try{r.texSubImage2D(...arguments)}catch(Z){Ge("WebGLState:",Z)}}function Y(){try{r.texSubImage3D(...arguments)}catch(Z){Ge("WebGLState:",Z)}}function at(){try{r.compressedTexSubImage2D(...arguments)}catch(Z){Ge("WebGLState:",Z)}}function vt(){try{r.compressedTexSubImage3D(...arguments)}catch(Z){Ge("WebGLState:",Z)}}function Ot(){try{r.texStorage2D(...arguments)}catch(Z){Ge("WebGLState:",Z)}}function zt(){try{r.texStorage3D(...arguments)}catch(Z){Ge("WebGLState:",Z)}}function St(){try{r.texImage2D(...arguments)}catch(Z){Ge("WebGLState:",Z)}}function Rt(){try{r.texImage3D(...arguments)}catch(Z){Ge("WebGLState:",Z)}}function Ht(Z){return v[Z]!==void 0?v[Z]:r.getParameter(Z)}function he(Z,Ft){v[Z]!==Ft&&(r.pixelStorei(Z,Ft),v[Z]=Ft)}function qt(Z){V.equals(Z)===!1&&(r.scissor(Z.x,Z.y,Z.z,Z.w),V.copy(Z))}function kt(Z){_t.equals(Z)===!1&&(r.viewport(Z.x,Z.y,Z.z,Z.w),_t.copy(Z))}function $t(Z,Ft){let Tt=p.get(Ft);Tt===void 0&&(Tt=new WeakMap,p.set(Ft,Tt));let Vt=Tt.get(Z);Vt===void 0&&(Vt=r.getUniformBlockIndex(Ft,Z.name),Tt.set(Z,Vt))}function me(Z,Ft){const Vt=p.get(Ft).get(Z);m.get(Ft)!==Vt&&(r.uniformBlockBinding(Ft,Vt,Z.__bindingPointIndex),m.set(Ft,Vt))}function Se(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),f.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),r.pixelStorei(r.PACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,r.BROWSER_DEFAULT_WEBGL),r.pixelStorei(r.PACK_ROW_LENGTH,0),r.pixelStorei(r.PACK_SKIP_PIXELS,0),r.pixelStorei(r.PACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_ROW_LENGTH,0),r.pixelStorei(r.UNPACK_IMAGE_HEIGHT,0),r.pixelStorei(r.UNPACK_SKIP_PIXELS,0),r.pixelStorei(r.UNPACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_SKIP_IMAGES,0),_={},v={},pt=null,yt={},g={},y=new WeakMap,b=[],C=null,M=!1,S=null,N=null,I=null,A=null,U=null,L=null,P=null,T=new be(0,0,0),D=0,H=!1,G=null,K=null,it=null,X=null,j=null,V.set(0,0,r.canvas.width,r.canvas.height),_t.set(0,0,r.canvas.width,r.canvas.height),c.reset(),f.reset(),d.reset()}return{buffers:{color:c,depth:f,stencil:d},enable:F,disable:st,bindFramebuffer:wt,drawBuffers:rt,useProgram:At,setBlending:Ct,setMaterial:Ut,setFlipSided:Nt,setCullFace:Dt,setLineWidth:se,setPolygonOffset:re,setScissorTest:gt,activeTexture:It,bindTexture:z,unbindTexture:ce,compressedTexImage2D:de,compressedTexImage3D:O,texImage2D:St,texImage3D:Rt,pixelStorei:he,getParameter:Ht,updateUBOMapping:$t,uniformBlockBinding:me,texStorage2D:Ot,texStorage3D:zt,texSubImage2D:E,texSubImage3D:Y,compressedTexSubImage2D:at,compressedTexSubImage3D:vt,scissor:qt,viewport:kt,reset:Se}}function oC(r,t,i,s,l,c,f){const d=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,m=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),p=new Bt,_=new WeakMap,v=new Set;let g;const y=new WeakMap;let b=!1;try{b=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function C(O,E){return b?new OffscreenCanvas(O,E):pf("canvas")}function M(O,E,Y){let at=1;const vt=de(O);if((vt.width>Y||vt.height>Y)&&(at=Y/Math.max(vt.width,vt.height)),at<1)if(typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&O instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&O instanceof ImageBitmap||typeof VideoFrame<"u"&&O instanceof VideoFrame){const Ot=Math.floor(at*vt.width),zt=Math.floor(at*vt.height);g===void 0&&(g=C(Ot,zt));const St=E?C(Ot,zt):g;return St.width=Ot,St.height=zt,St.getContext("2d").drawImage(O,0,0,Ot,zt),_e("WebGLRenderer: Texture has been resized from ("+vt.width+"x"+vt.height+") to ("+Ot+"x"+zt+")."),St}else return"data"in O&&_e("WebGLRenderer: Image in DataTexture is too big ("+vt.width+"x"+vt.height+")."),O;return O}function S(O){return O.generateMipmaps}function N(O){r.generateMipmap(O)}function I(O){return O.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:O.isWebGL3DRenderTarget?r.TEXTURE_3D:O.isWebGLArrayRenderTarget||O.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function A(O,E,Y,at,vt,Ot=!1){if(O!==null){if(r[O]!==void 0)return r[O];_e("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+O+"'")}let zt;at&&(zt=t.get("EXT_texture_norm16"),zt||_e("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let St=E;if(E===r.RED&&(Y===r.FLOAT&&(St=r.R32F),Y===r.HALF_FLOAT&&(St=r.R16F),Y===r.UNSIGNED_BYTE&&(St=r.R8),Y===r.UNSIGNED_SHORT&&zt&&(St=zt.R16_EXT),Y===r.SHORT&&zt&&(St=zt.R16_SNORM_EXT)),E===r.RED_INTEGER&&(Y===r.UNSIGNED_BYTE&&(St=r.R8UI),Y===r.UNSIGNED_SHORT&&(St=r.R16UI),Y===r.UNSIGNED_INT&&(St=r.R32UI),Y===r.BYTE&&(St=r.R8I),Y===r.SHORT&&(St=r.R16I),Y===r.INT&&(St=r.R32I)),E===r.RG&&(Y===r.FLOAT&&(St=r.RG32F),Y===r.HALF_FLOAT&&(St=r.RG16F),Y===r.UNSIGNED_BYTE&&(St=r.RG8),Y===r.UNSIGNED_SHORT&&zt&&(St=zt.RG16_EXT),Y===r.SHORT&&zt&&(St=zt.RG16_SNORM_EXT)),E===r.RG_INTEGER&&(Y===r.UNSIGNED_BYTE&&(St=r.RG8UI),Y===r.UNSIGNED_SHORT&&(St=r.RG16UI),Y===r.UNSIGNED_INT&&(St=r.RG32UI),Y===r.BYTE&&(St=r.RG8I),Y===r.SHORT&&(St=r.RG16I),Y===r.INT&&(St=r.RG32I)),E===r.RGB_INTEGER&&(Y===r.UNSIGNED_BYTE&&(St=r.RGB8UI),Y===r.UNSIGNED_SHORT&&(St=r.RGB16UI),Y===r.UNSIGNED_INT&&(St=r.RGB32UI),Y===r.BYTE&&(St=r.RGB8I),Y===r.SHORT&&(St=r.RGB16I),Y===r.INT&&(St=r.RGB32I)),E===r.RGBA_INTEGER&&(Y===r.UNSIGNED_BYTE&&(St=r.RGBA8UI),Y===r.UNSIGNED_SHORT&&(St=r.RGBA16UI),Y===r.UNSIGNED_INT&&(St=r.RGBA32UI),Y===r.BYTE&&(St=r.RGBA8I),Y===r.SHORT&&(St=r.RGBA16I),Y===r.INT&&(St=r.RGBA32I)),E===r.RGB&&(Y===r.UNSIGNED_SHORT&&zt&&(St=zt.RGB16_EXT),Y===r.SHORT&&zt&&(St=zt.RGB16_SNORM_EXT),Y===r.UNSIGNED_INT_5_9_9_9_REV&&(St=r.RGB9_E5),Y===r.UNSIGNED_INT_10F_11F_11F_REV&&(St=r.R11F_G11F_B10F)),E===r.RGBA){const Rt=Ot?df:He.getTransfer(vt);Y===r.FLOAT&&(St=r.RGBA32F),Y===r.HALF_FLOAT&&(St=r.RGBA16F),Y===r.UNSIGNED_BYTE&&(St=Rt===Qe?r.SRGB8_ALPHA8:r.RGBA8),Y===r.UNSIGNED_SHORT&&zt&&(St=zt.RGBA16_EXT),Y===r.SHORT&&zt&&(St=zt.RGBA16_SNORM_EXT),Y===r.UNSIGNED_SHORT_4_4_4_4&&(St=r.RGBA4),Y===r.UNSIGNED_SHORT_5_5_5_1&&(St=r.RGB5_A1)}return(St===r.R16F||St===r.R32F||St===r.RG16F||St===r.RG32F||St===r.RGBA16F||St===r.RGBA32F)&&t.get("EXT_color_buffer_float"),St}function U(O,E){let Y;return O?E===null||E===fa||E===Jl?Y=r.DEPTH24_STENCIL8:E===Hi?Y=r.DEPTH32F_STENCIL8:E===Kl&&(Y=r.DEPTH24_STENCIL8,_e("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===fa||E===Jl?Y=r.DEPTH_COMPONENT24:E===Hi?Y=r.DEPTH_COMPONENT32F:E===Kl&&(Y=r.DEPTH_COMPONENT16),Y}function L(O,E){return S(O)===!0||O.isFramebufferTexture&&O.minFilter!==zn&&O.minFilter!==Vn?Math.log2(Math.max(E.width,E.height))+1:O.mipmaps!==void 0&&O.mipmaps.length>0?O.mipmaps.length:O.isCompressedTexture&&Array.isArray(O.image)?E.mipmaps.length:1}function P(O){const E=O.target;E.removeEventListener("dispose",P),D(E),E.isVideoTexture&&_.delete(E),E.isHTMLTexture&&v.delete(E)}function T(O){const E=O.target;E.removeEventListener("dispose",T),G(E)}function D(O){const E=s.get(O);if(E.__webglInit===void 0)return;const Y=O.source,at=y.get(Y);if(at){const vt=at[E.__cacheKey];vt.usedTimes--,vt.usedTimes===0&&H(O),Object.keys(at).length===0&&y.delete(Y)}s.remove(O)}function H(O){const E=s.get(O);r.deleteTexture(E.__webglTexture);const Y=O.source,at=y.get(Y);delete at[E.__cacheKey],f.memory.textures--}function G(O){const E=s.get(O);if(O.depthTexture&&(O.depthTexture.dispose(),s.remove(O.depthTexture)),O.isWebGLCubeRenderTarget)for(let at=0;at<6;at++){if(Array.isArray(E.__webglFramebuffer[at]))for(let vt=0;vt<E.__webglFramebuffer[at].length;vt++)r.deleteFramebuffer(E.__webglFramebuffer[at][vt]);else r.deleteFramebuffer(E.__webglFramebuffer[at]);E.__webglDepthbuffer&&r.deleteRenderbuffer(E.__webglDepthbuffer[at])}else{if(Array.isArray(E.__webglFramebuffer))for(let at=0;at<E.__webglFramebuffer.length;at++)r.deleteFramebuffer(E.__webglFramebuffer[at]);else r.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&r.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&r.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let at=0;at<E.__webglColorRenderbuffer.length;at++)E.__webglColorRenderbuffer[at]&&r.deleteRenderbuffer(E.__webglColorRenderbuffer[at]);E.__webglDepthRenderbuffer&&r.deleteRenderbuffer(E.__webglDepthRenderbuffer)}const Y=O.textures;for(let at=0,vt=Y.length;at<vt;at++){const Ot=s.get(Y[at]);Ot.__webglTexture&&(r.deleteTexture(Ot.__webglTexture),f.memory.textures--),s.remove(Y[at])}s.remove(O)}let K=0;function it(){K=0}function X(){return K}function j(O){K=O}function k(){const O=K;return O>=l.maxTextures&&_e("WebGLTextures: Trying to use "+(O+1)+" texture units while this GPU supports only "+l.maxTextures),K+=1,O}function Q(O){const E=[];return E.push(O.wrapS),E.push(O.wrapT),E.push(O.wrapR||0),E.push(O.magFilter),E.push(O.minFilter),E.push(O.anisotropy),E.push(O.internalFormat),E.push(O.format),E.push(O.type),E.push(O.generateMipmaps),E.push(O.premultiplyAlpha),E.push(O.flipY),E.push(O.unpackAlignment),E.push(O.colorSpace),E.join()}function ct(O,E){const Y=s.get(O);if(O.isVideoTexture&&z(O),O.isRenderTargetTexture===!1&&O.isExternalTexture!==!0&&O.version>0&&Y.__version!==O.version){const at=O.image;if(at===null)_e("WebGLRenderer: Texture marked for update but no image data found.");else if(at.complete===!1)_e("WebGLRenderer: Texture marked for update but image is incomplete");else{st(Y,O,E);return}}else O.isExternalTexture&&(Y.__webglTexture=O.sourceTexture?O.sourceTexture:null);i.bindTexture(r.TEXTURE_2D,Y.__webglTexture,r.TEXTURE0+E)}function lt(O,E){const Y=s.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&Y.__version!==O.version){st(Y,O,E);return}else O.isExternalTexture&&(Y.__webglTexture=O.sourceTexture?O.sourceTexture:null);i.bindTexture(r.TEXTURE_2D_ARRAY,Y.__webglTexture,r.TEXTURE0+E)}function pt(O,E){const Y=s.get(O);if(O.isRenderTargetTexture===!1&&O.version>0&&Y.__version!==O.version){st(Y,O,E);return}i.bindTexture(r.TEXTURE_3D,Y.__webglTexture,r.TEXTURE0+E)}function yt(O,E){const Y=s.get(O);if(O.isCubeDepthTexture!==!0&&O.version>0&&Y.__version!==O.version){wt(Y,O,E);return}i.bindTexture(r.TEXTURE_CUBE_MAP,Y.__webglTexture,r.TEXTURE0+E)}const Yt={[Zl]:r.REPEAT,[Ba]:r.CLAMP_TO_EDGE,[jp]:r.MIRRORED_REPEAT},Wt={[zn]:r.NEAREST,[Ib]:r.NEAREST_MIPMAP_NEAREST,[Ru]:r.NEAREST_MIPMAP_LINEAR,[Vn]:r.LINEAR,[sp]:r.LINEAR_MIPMAP_NEAREST,[nr]:r.LINEAR_MIPMAP_LINEAR},V={[Hb]:r.NEVER,[Wb]:r.ALWAYS,[Vb]:r.LESS,[jm]:r.LEQUAL,[Gb]:r.EQUAL,[$m]:r.GEQUAL,[Xb]:r.GREATER,[kb]:r.NOTEQUAL};function _t(O,E){if(E.type===Hi&&t.has("OES_texture_float_linear")===!1&&(E.magFilter===Vn||E.magFilter===sp||E.magFilter===Ru||E.magFilter===nr||E.minFilter===Vn||E.minFilter===sp||E.minFilter===Ru||E.minFilter===nr)&&_e("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(O,r.TEXTURE_WRAP_S,Yt[E.wrapS]),r.texParameteri(O,r.TEXTURE_WRAP_T,Yt[E.wrapT]),(O===r.TEXTURE_3D||O===r.TEXTURE_2D_ARRAY)&&r.texParameteri(O,r.TEXTURE_WRAP_R,Yt[E.wrapR]),r.texParameteri(O,r.TEXTURE_MAG_FILTER,Wt[E.magFilter]),r.texParameteri(O,r.TEXTURE_MIN_FILTER,Wt[E.minFilter]),E.compareFunction&&(r.texParameteri(O,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(O,r.TEXTURE_COMPARE_FUNC,V[E.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===zn||E.minFilter!==Ru&&E.minFilter!==nr||E.type===Hi&&t.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||s.get(E).__currentAnisotropy){const Y=t.get("EXT_texture_filter_anisotropic");r.texParameterf(O,Y.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,l.getMaxAnisotropy())),s.get(E).__currentAnisotropy=E.anisotropy}}}function Pt(O,E){let Y=!1;O.__webglInit===void 0&&(O.__webglInit=!0,E.addEventListener("dispose",P));const at=E.source;let vt=y.get(at);vt===void 0&&(vt={},y.set(at,vt));const Ot=Q(E);if(Ot!==O.__cacheKey){vt[Ot]===void 0&&(vt[Ot]={texture:r.createTexture(),usedTimes:0},f.memory.textures++,Y=!0),vt[Ot].usedTimes++;const zt=vt[O.__cacheKey];zt!==void 0&&(vt[O.__cacheKey].usedTimes--,zt.usedTimes===0&&H(E)),O.__cacheKey=Ot,O.__webglTexture=vt[Ot].texture}return Y}function J(O,E,Y){return Math.floor(Math.floor(O/Y)/E)}function F(O,E,Y,at){const Ot=O.updateRanges;if(Ot.length===0)i.texSubImage2D(r.TEXTURE_2D,0,0,0,E.width,E.height,Y,at,E.data);else{Ot.sort((he,qt)=>he.start-qt.start);let zt=0;for(let he=1;he<Ot.length;he++){const qt=Ot[zt],kt=Ot[he],$t=qt.start+qt.count,me=J(kt.start,E.width,4),Se=J(qt.start,E.width,4);kt.start<=$t+1&&me===Se&&J(kt.start+kt.count-1,E.width,4)===me?qt.count=Math.max(qt.count,kt.start+kt.count-qt.start):(++zt,Ot[zt]=kt)}Ot.length=zt+1;const St=i.getParameter(r.UNPACK_ROW_LENGTH),Rt=i.getParameter(r.UNPACK_SKIP_PIXELS),Ht=i.getParameter(r.UNPACK_SKIP_ROWS);i.pixelStorei(r.UNPACK_ROW_LENGTH,E.width);for(let he=0,qt=Ot.length;he<qt;he++){const kt=Ot[he],$t=Math.floor(kt.start/4),me=Math.ceil(kt.count/4),Se=$t%E.width,Z=Math.floor($t/E.width),Ft=me,Tt=1;i.pixelStorei(r.UNPACK_SKIP_PIXELS,Se),i.pixelStorei(r.UNPACK_SKIP_ROWS,Z),i.texSubImage2D(r.TEXTURE_2D,0,Se,Z,Ft,Tt,Y,at,E.data)}O.clearUpdateRanges(),i.pixelStorei(r.UNPACK_ROW_LENGTH,St),i.pixelStorei(r.UNPACK_SKIP_PIXELS,Rt),i.pixelStorei(r.UNPACK_SKIP_ROWS,Ht)}}function st(O,E,Y){let at=r.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(at=r.TEXTURE_2D_ARRAY),E.isData3DTexture&&(at=r.TEXTURE_3D);const vt=Pt(O,E),Ot=E.source;i.bindTexture(at,O.__webglTexture,r.TEXTURE0+Y);const zt=s.get(Ot);if(Ot.version!==zt.__version||vt===!0){if(i.activeTexture(r.TEXTURE0+Y),(typeof ImageBitmap<"u"&&E.image instanceof ImageBitmap)===!1){const Tt=He.getPrimaries(He.workingColorSpace),Vt=E.colorSpace===Es?null:He.getPrimaries(E.colorSpace),jt=E.colorSpace===Es||Tt===Vt?r.NONE:r.BROWSER_DEFAULT_WEBGL;i.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,E.flipY),i.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),i.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,jt)}i.pixelStorei(r.UNPACK_ALIGNMENT,E.unpackAlignment);let Rt=M(E.image,!1,l.maxTextureSize);Rt=ce(E,Rt);const Ht=c.convert(E.format,E.colorSpace),he=c.convert(E.type);let qt=A(E.internalFormat,Ht,he,E.normalized,E.colorSpace,E.isVideoTexture);_t(at,E);let kt;const $t=E.mipmaps,me=E.isVideoTexture!==!0,Se=zt.__version===void 0||vt===!0,Z=Ot.dataReady,Ft=L(E,Rt);if(E.isDepthTexture)qt=U(E.format===ir,E.type),Se&&(me?i.texStorage2D(r.TEXTURE_2D,1,qt,Rt.width,Rt.height):i.texImage2D(r.TEXTURE_2D,0,qt,Rt.width,Rt.height,0,Ht,he,null));else if(E.isDataTexture)if($t.length>0){me&&Se&&i.texStorage2D(r.TEXTURE_2D,Ft,qt,$t[0].width,$t[0].height);for(let Tt=0,Vt=$t.length;Tt<Vt;Tt++)kt=$t[Tt],me?Z&&i.texSubImage2D(r.TEXTURE_2D,Tt,0,0,kt.width,kt.height,Ht,he,kt.data):i.texImage2D(r.TEXTURE_2D,Tt,qt,kt.width,kt.height,0,Ht,he,kt.data);E.generateMipmaps=!1}else me?(Se&&i.texStorage2D(r.TEXTURE_2D,Ft,qt,Rt.width,Rt.height),Z&&F(E,Rt,Ht,he)):i.texImage2D(r.TEXTURE_2D,0,qt,Rt.width,Rt.height,0,Ht,he,Rt.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){me&&Se&&i.texStorage3D(r.TEXTURE_2D_ARRAY,Ft,qt,$t[0].width,$t[0].height,Rt.depth);for(let Tt=0,Vt=$t.length;Tt<Vt;Tt++)if(kt=$t[Tt],E.format!==Vi)if(Ht!==null)if(me){if(Z)if(E.layerUpdates.size>0){const jt=_1(kt.width,kt.height,E.format,E.type);for(const Lt of E.layerUpdates){const ue=kt.data.subarray(Lt*jt/kt.data.BYTES_PER_ELEMENT,(Lt+1)*jt/kt.data.BYTES_PER_ELEMENT);i.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Tt,0,0,Lt,kt.width,kt.height,1,Ht,ue)}}else i.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,Tt,0,0,0,kt.width,kt.height,Rt.depth,Ht,kt.data)}else i.compressedTexImage3D(r.TEXTURE_2D_ARRAY,Tt,qt,kt.width,kt.height,Rt.depth,0,kt.data,0,0);else _e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else me?Z&&i.texSubImage3D(r.TEXTURE_2D_ARRAY,Tt,0,0,0,kt.width,kt.height,Rt.depth,Ht,he,kt.data):i.texImage3D(r.TEXTURE_2D_ARRAY,Tt,qt,kt.width,kt.height,Rt.depth,0,Ht,he,kt.data);E.layerUpdates.size>0&&E.clearLayerUpdates()}else{me&&Se&&i.texStorage2D(r.TEXTURE_2D,Ft,qt,$t[0].width,$t[0].height);for(let Tt=0,Vt=$t.length;Tt<Vt;Tt++)kt=$t[Tt],E.format!==Vi?Ht!==null?me?Z&&i.compressedTexSubImage2D(r.TEXTURE_2D,Tt,0,0,kt.width,kt.height,Ht,kt.data):i.compressedTexImage2D(r.TEXTURE_2D,Tt,qt,kt.width,kt.height,0,kt.data):_e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):me?Z&&i.texSubImage2D(r.TEXTURE_2D,Tt,0,0,kt.width,kt.height,Ht,he,kt.data):i.texImage2D(r.TEXTURE_2D,Tt,qt,kt.width,kt.height,0,Ht,he,kt.data)}else if(E.isDataArrayTexture)if(me){if(Se&&i.texStorage3D(r.TEXTURE_2D_ARRAY,Ft,qt,Rt.width,Rt.height,Rt.depth),Z)if(E.layerUpdates.size>0){const Tt=_1(Rt.width,Rt.height,E.format,E.type);for(const Vt of E.layerUpdates){const jt=Rt.data.subarray(Vt*Tt/Rt.data.BYTES_PER_ELEMENT,(Vt+1)*Tt/Rt.data.BYTES_PER_ELEMENT);i.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,Vt,Rt.width,Rt.height,1,Ht,he,jt)}E.clearLayerUpdates()}else i.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,Rt.width,Rt.height,Rt.depth,Ht,he,Rt.data)}else i.texImage3D(r.TEXTURE_2D_ARRAY,0,qt,Rt.width,Rt.height,Rt.depth,0,Ht,he,Rt.data);else if(E.isData3DTexture)me?(Se&&i.texStorage3D(r.TEXTURE_3D,Ft,qt,Rt.width,Rt.height,Rt.depth),Z&&i.texSubImage3D(r.TEXTURE_3D,0,0,0,0,Rt.width,Rt.height,Rt.depth,Ht,he,Rt.data)):i.texImage3D(r.TEXTURE_3D,0,qt,Rt.width,Rt.height,Rt.depth,0,Ht,he,Rt.data);else if(E.isFramebufferTexture){if(Se)if(me)i.texStorage2D(r.TEXTURE_2D,Ft,qt,Rt.width,Rt.height);else{let Tt=Rt.width,Vt=Rt.height;for(let jt=0;jt<Ft;jt++)i.texImage2D(r.TEXTURE_2D,jt,qt,Tt,Vt,0,Ht,he,null),Tt>>=1,Vt>>=1}}else if(E.isHTMLTexture){if("texElementImage2D"in r){const Tt=r.canvas;if(Tt.hasAttribute("layoutsubtree")||Tt.setAttribute("layoutsubtree","true"),Rt.parentNode!==Tt){Tt.appendChild(Rt),v.add(E),Tt.onpaint=Vt=>{const jt=Vt.changedElements;for(const Lt of v)jt.includes(Lt.image)&&(Lt.needsUpdate=!0)},Tt.requestPaint();return}if(r.texElementImage2D.length===3)r.texElementImage2D(r.TEXTURE_2D,r.RGBA8,Rt);else{const jt=r.RGBA,Lt=r.RGBA,ue=r.UNSIGNED_BYTE;r.texElementImage2D(r.TEXTURE_2D,0,jt,Lt,ue,Rt)}r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)}}else if($t.length>0){if(me&&Se){const Tt=de($t[0]);i.texStorage2D(r.TEXTURE_2D,Ft,qt,Tt.width,Tt.height)}for(let Tt=0,Vt=$t.length;Tt<Vt;Tt++)kt=$t[Tt],me?Z&&i.texSubImage2D(r.TEXTURE_2D,Tt,0,0,Ht,he,kt):i.texImage2D(r.TEXTURE_2D,Tt,qt,Ht,he,kt);E.generateMipmaps=!1}else if(me){if(Se){const Tt=de(Rt);i.texStorage2D(r.TEXTURE_2D,Ft,qt,Tt.width,Tt.height)}Z&&i.texSubImage2D(r.TEXTURE_2D,0,0,0,Ht,he,Rt)}else i.texImage2D(r.TEXTURE_2D,0,qt,Ht,he,Rt);S(E)&&N(at),zt.__version=Ot.version,E.onUpdate&&E.onUpdate(E)}O.__version=E.version}function wt(O,E,Y){if(E.image.length!==6)return;const at=Pt(O,E),vt=E.source;i.bindTexture(r.TEXTURE_CUBE_MAP,O.__webglTexture,r.TEXTURE0+Y);const Ot=s.get(vt);if(vt.version!==Ot.__version||at===!0){i.activeTexture(r.TEXTURE0+Y);const zt=He.getPrimaries(He.workingColorSpace),St=E.colorSpace===Es?null:He.getPrimaries(E.colorSpace),Rt=E.colorSpace===Es||zt===St?r.NONE:r.BROWSER_DEFAULT_WEBGL;i.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,E.flipY),i.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),i.pixelStorei(r.UNPACK_ALIGNMENT,E.unpackAlignment),i.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Rt);const Ht=E.isCompressedTexture||E.image[0].isCompressedTexture,he=E.image[0]&&E.image[0].isDataTexture,qt=[];for(let Lt=0;Lt<6;Lt++)!Ht&&!he?qt[Lt]=M(E.image[Lt],!0,l.maxCubemapSize):qt[Lt]=he?E.image[Lt].image:E.image[Lt],qt[Lt]=ce(E,qt[Lt]);const kt=qt[0],$t=c.convert(E.format,E.colorSpace),me=c.convert(E.type),Se=A(E.internalFormat,$t,me,E.normalized,E.colorSpace),Z=E.isVideoTexture!==!0,Ft=Ot.__version===void 0||at===!0,Tt=vt.dataReady;let Vt=L(E,kt);_t(r.TEXTURE_CUBE_MAP,E);let jt;if(Ht){Z&&Ft&&i.texStorage2D(r.TEXTURE_CUBE_MAP,Vt,Se,kt.width,kt.height);for(let Lt=0;Lt<6;Lt++){jt=qt[Lt].mipmaps;for(let ue=0;ue<jt.length;ue++){const Qt=jt[ue];E.format!==Vi?$t!==null?Z?Tt&&i.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,ue,0,0,Qt.width,Qt.height,$t,Qt.data):i.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,ue,Se,Qt.width,Qt.height,0,Qt.data):_e("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Z?Tt&&i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,ue,0,0,Qt.width,Qt.height,$t,me,Qt.data):i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,ue,Se,Qt.width,Qt.height,0,$t,me,Qt.data)}}}else{if(jt=E.mipmaps,Z&&Ft){jt.length>0&&Vt++;const Lt=de(qt[0]);i.texStorage2D(r.TEXTURE_CUBE_MAP,Vt,Se,Lt.width,Lt.height)}for(let Lt=0;Lt<6;Lt++)if(he){Z?Tt&&i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,0,0,qt[Lt].width,qt[Lt].height,$t,me,qt[Lt].data):i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,Se,qt[Lt].width,qt[Lt].height,0,$t,me,qt[Lt].data);for(let ue=0;ue<jt.length;ue++){const Be=jt[ue].image[Lt].image;Z?Tt&&i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,ue+1,0,0,Be.width,Be.height,$t,me,Be.data):i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,ue+1,Se,Be.width,Be.height,0,$t,me,Be.data)}}else{Z?Tt&&i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,0,0,$t,me,qt[Lt]):i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,0,Se,$t,me,qt[Lt]);for(let ue=0;ue<jt.length;ue++){const Qt=jt[ue];Z?Tt&&i.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,ue+1,0,0,$t,me,Qt.image[Lt]):i.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+Lt,ue+1,Se,$t,me,Qt.image[Lt])}}}S(E)&&N(r.TEXTURE_CUBE_MAP),Ot.__version=vt.version,E.onUpdate&&E.onUpdate(E)}O.__version=E.version}function rt(O,E,Y,at,vt,Ot){const zt=c.convert(Y.format,Y.colorSpace),St=c.convert(Y.type),Rt=A(Y.internalFormat,zt,St,Y.normalized,Y.colorSpace),Ht=s.get(E),he=s.get(Y);if(he.__renderTarget=E,!Ht.__hasExternalTextures){const qt=Math.max(1,E.width>>Ot),kt=Math.max(1,E.height>>Ot);vt===r.TEXTURE_3D||vt===r.TEXTURE_2D_ARRAY?i.texImage3D(vt,Ot,Rt,qt,kt,E.depth,0,zt,St,null):i.texImage2D(vt,Ot,Rt,qt,kt,0,zt,St,null)}i.bindFramebuffer(r.FRAMEBUFFER,O),It(E)?d.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,at,vt,he.__webglTexture,0,gt(E)):(vt===r.TEXTURE_2D||vt>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&vt<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,at,vt,he.__webglTexture,Ot),i.bindFramebuffer(r.FRAMEBUFFER,null)}function At(O,E,Y){if(r.bindRenderbuffer(r.RENDERBUFFER,O),E.depthBuffer){const at=E.depthTexture,vt=at&&at.isDepthTexture?at.type:null,Ot=U(E.stencilBuffer,vt),zt=E.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;It(E)?d.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,gt(E),Ot,E.width,E.height):Y?r.renderbufferStorageMultisample(r.RENDERBUFFER,gt(E),Ot,E.width,E.height):r.renderbufferStorage(r.RENDERBUFFER,Ot,E.width,E.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,zt,r.RENDERBUFFER,O)}else{const at=E.textures;for(let vt=0;vt<at.length;vt++){const Ot=at[vt],zt=c.convert(Ot.format,Ot.colorSpace),St=c.convert(Ot.type),Rt=A(Ot.internalFormat,zt,St,Ot.normalized,Ot.colorSpace);It(E)?d.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,gt(E),Rt,E.width,E.height):Y?r.renderbufferStorageMultisample(r.RENDERBUFFER,gt(E),Rt,E.width,E.height):r.renderbufferStorage(r.RENDERBUFFER,Rt,E.width,E.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function fe(O,E,Y){const at=E.isWebGLCubeRenderTarget===!0;if(i.bindFramebuffer(r.FRAMEBUFFER,O),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const vt=s.get(E.depthTexture);if(vt.__renderTarget=E,(!vt.__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),at){if(vt.__webglInit===void 0&&(vt.__webglInit=!0,E.depthTexture.addEventListener("dispose",P)),vt.__webglTexture===void 0){vt.__webglTexture=r.createTexture(),i.bindTexture(r.TEXTURE_CUBE_MAP,vt.__webglTexture),_t(r.TEXTURE_CUBE_MAP,E.depthTexture);const Ht=c.convert(E.depthTexture.format),he=c.convert(E.depthTexture.type);let qt;E.depthTexture.format===Xa?qt=r.DEPTH_COMPONENT24:E.depthTexture.format===ir&&(qt=r.DEPTH24_STENCIL8);for(let kt=0;kt<6;kt++)r.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+kt,0,qt,E.width,E.height,0,Ht,he,null)}}else ct(E.depthTexture,0);const Ot=vt.__webglTexture,zt=gt(E),St=at?r.TEXTURE_CUBE_MAP_POSITIVE_X+Y:r.TEXTURE_2D,Rt=E.depthTexture.format===ir?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;if(E.depthTexture.format===Xa)It(E)?d.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,Rt,St,Ot,0,zt):r.framebufferTexture2D(r.FRAMEBUFFER,Rt,St,Ot,0);else if(E.depthTexture.format===ir)It(E)?d.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,Rt,St,Ot,0,zt):r.framebufferTexture2D(r.FRAMEBUFFER,Rt,St,Ot,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function xt(O){const E=s.get(O),Y=O.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==O.depthTexture){const at=O.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),at){const vt=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,at.removeEventListener("dispose",vt)};at.addEventListener("dispose",vt),E.__depthDisposeCallback=vt}E.__boundDepthTexture=at}if(O.depthTexture&&!E.__autoAllocateDepthBuffer)if(Y)for(let at=0;at<6;at++)fe(E.__webglFramebuffer[at],O,at);else{const at=O.texture.mipmaps;at&&at.length>0?fe(E.__webglFramebuffer[0],O,0):fe(E.__webglFramebuffer,O,0)}else if(Y){E.__webglDepthbuffer=[];for(let at=0;at<6;at++)if(i.bindFramebuffer(r.FRAMEBUFFER,E.__webglFramebuffer[at]),E.__webglDepthbuffer[at]===void 0)E.__webglDepthbuffer[at]=r.createRenderbuffer(),At(E.__webglDepthbuffer[at],O,!1);else{const vt=O.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,Ot=E.__webglDepthbuffer[at];r.bindRenderbuffer(r.RENDERBUFFER,Ot),r.framebufferRenderbuffer(r.FRAMEBUFFER,vt,r.RENDERBUFFER,Ot)}}else{const at=O.texture.mipmaps;if(at&&at.length>0?i.bindFramebuffer(r.FRAMEBUFFER,E.__webglFramebuffer[0]):i.bindFramebuffer(r.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=r.createRenderbuffer(),At(E.__webglDepthbuffer,O,!1);else{const vt=O.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,Ot=E.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,Ot),r.framebufferRenderbuffer(r.FRAMEBUFFER,vt,r.RENDERBUFFER,Ot)}}i.bindFramebuffer(r.FRAMEBUFFER,null)}function Ct(O,E,Y){const at=s.get(O);E!==void 0&&rt(at.__webglFramebuffer,O,O.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),Y!==void 0&&xt(O)}function Ut(O){const E=O.texture,Y=s.get(O),at=s.get(E);O.addEventListener("dispose",T);const vt=O.textures,Ot=O.isWebGLCubeRenderTarget===!0,zt=vt.length>1;if(zt||(at.__webglTexture===void 0&&(at.__webglTexture=r.createTexture()),at.__version=E.version,f.memory.textures++),Ot){Y.__webglFramebuffer=[];for(let St=0;St<6;St++)if(E.mipmaps&&E.mipmaps.length>0){Y.__webglFramebuffer[St]=[];for(let Rt=0;Rt<E.mipmaps.length;Rt++)Y.__webglFramebuffer[St][Rt]=r.createFramebuffer()}else Y.__webglFramebuffer[St]=r.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){Y.__webglFramebuffer=[];for(let St=0;St<E.mipmaps.length;St++)Y.__webglFramebuffer[St]=r.createFramebuffer()}else Y.__webglFramebuffer=r.createFramebuffer();if(zt)for(let St=0,Rt=vt.length;St<Rt;St++){const Ht=s.get(vt[St]);Ht.__webglTexture===void 0&&(Ht.__webglTexture=r.createTexture(),f.memory.textures++)}if(O.samples>0&&It(O)===!1){Y.__webglMultisampledFramebuffer=r.createFramebuffer(),Y.__webglColorRenderbuffer=[],i.bindFramebuffer(r.FRAMEBUFFER,Y.__webglMultisampledFramebuffer);for(let St=0;St<vt.length;St++){const Rt=vt[St];Y.__webglColorRenderbuffer[St]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,Y.__webglColorRenderbuffer[St]);const Ht=c.convert(Rt.format,Rt.colorSpace),he=c.convert(Rt.type),qt=A(Rt.internalFormat,Ht,he,Rt.normalized,Rt.colorSpace,O.isXRRenderTarget===!0),kt=gt(O);r.renderbufferStorageMultisample(r.RENDERBUFFER,kt,qt,O.width,O.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+St,r.RENDERBUFFER,Y.__webglColorRenderbuffer[St])}r.bindRenderbuffer(r.RENDERBUFFER,null),O.depthBuffer&&(Y.__webglDepthRenderbuffer=r.createRenderbuffer(),At(Y.__webglDepthRenderbuffer,O,!0)),i.bindFramebuffer(r.FRAMEBUFFER,null)}}if(Ot){i.bindTexture(r.TEXTURE_CUBE_MAP,at.__webglTexture),_t(r.TEXTURE_CUBE_MAP,E);for(let St=0;St<6;St++)if(E.mipmaps&&E.mipmaps.length>0)for(let Rt=0;Rt<E.mipmaps.length;Rt++)rt(Y.__webglFramebuffer[St][Rt],O,E,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+St,Rt);else rt(Y.__webglFramebuffer[St],O,E,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+St,0);S(E)&&N(r.TEXTURE_CUBE_MAP),i.unbindTexture()}else if(zt){for(let St=0,Rt=vt.length;St<Rt;St++){const Ht=vt[St],he=s.get(Ht);let qt=r.TEXTURE_2D;(O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(qt=O.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),i.bindTexture(qt,he.__webglTexture),_t(qt,Ht),rt(Y.__webglFramebuffer,O,Ht,r.COLOR_ATTACHMENT0+St,qt,0),S(Ht)&&N(qt)}i.unbindTexture()}else{let St=r.TEXTURE_2D;if((O.isWebGL3DRenderTarget||O.isWebGLArrayRenderTarget)&&(St=O.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),i.bindTexture(St,at.__webglTexture),_t(St,E),E.mipmaps&&E.mipmaps.length>0)for(let Rt=0;Rt<E.mipmaps.length;Rt++)rt(Y.__webglFramebuffer[Rt],O,E,r.COLOR_ATTACHMENT0,St,Rt);else rt(Y.__webglFramebuffer,O,E,r.COLOR_ATTACHMENT0,St,0);S(E)&&N(St),i.unbindTexture()}O.depthBuffer&&xt(O)}function Nt(O){const E=O.textures;for(let Y=0,at=E.length;Y<at;Y++){const vt=E[Y];if(S(vt)){const Ot=I(O),zt=s.get(vt).__webglTexture;i.bindTexture(Ot,zt),N(Ot),i.unbindTexture()}}}const Dt=[],se=[];function re(O){if(O.samples>0){if(It(O)===!1){const E=O.textures,Y=O.width,at=O.height;let vt=r.COLOR_BUFFER_BIT;const Ot=O.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,zt=s.get(O),St=E.length>1;if(St)for(let Ht=0;Ht<E.length;Ht++)i.bindFramebuffer(r.FRAMEBUFFER,zt.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ht,r.RENDERBUFFER,null),i.bindFramebuffer(r.FRAMEBUFFER,zt.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ht,r.TEXTURE_2D,null,0);i.bindFramebuffer(r.READ_FRAMEBUFFER,zt.__webglMultisampledFramebuffer);const Rt=O.texture.mipmaps;Rt&&Rt.length>0?i.bindFramebuffer(r.DRAW_FRAMEBUFFER,zt.__webglFramebuffer[0]):i.bindFramebuffer(r.DRAW_FRAMEBUFFER,zt.__webglFramebuffer);for(let Ht=0;Ht<E.length;Ht++){if(O.resolveDepthBuffer&&(O.depthBuffer&&(vt|=r.DEPTH_BUFFER_BIT),O.stencilBuffer&&O.resolveStencilBuffer&&(vt|=r.STENCIL_BUFFER_BIT)),St){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,zt.__webglColorRenderbuffer[Ht]);const he=s.get(E[Ht]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,he,0)}r.blitFramebuffer(0,0,Y,at,0,0,Y,at,vt,r.NEAREST),m===!0&&(Dt.length=0,se.length=0,Dt.push(r.COLOR_ATTACHMENT0+Ht),O.depthBuffer&&O.storeMultisampledDepthBuffer===!1&&(Dt.push(Ot),se.push(Ot),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,se)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,Dt))}if(i.bindFramebuffer(r.READ_FRAMEBUFFER,null),i.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),St)for(let Ht=0;Ht<E.length;Ht++){i.bindFramebuffer(r.FRAMEBUFFER,zt.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ht,r.RENDERBUFFER,zt.__webglColorRenderbuffer[Ht]);const he=s.get(E[Ht]).__webglTexture;i.bindFramebuffer(r.FRAMEBUFFER,zt.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+Ht,r.TEXTURE_2D,he,0)}i.bindFramebuffer(r.DRAW_FRAMEBUFFER,zt.__webglMultisampledFramebuffer)}else if(O.depthBuffer&&O.storeMultisampledDepthBuffer===!1&&m){const E=O.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[E])}}}function gt(O){return Math.min(l.maxSamples,O.samples)}function It(O){const E=s.get(O);return O.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function z(O){const E=f.render.frame;_.get(O)!==E&&(_.set(O,E),O.update())}function ce(O,E){const Y=O.colorSpace,at=O.format,vt=O.type;return O.isCompressedTexture===!0||O.isVideoTexture===!0||Y!==hf&&Y!==Es&&(He.getTransfer(Y)===Qe?(at!==Vi||vt!==vi)&&_e("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ge("WebGLTextures: Unsupported texture color space:",Y)),E}function de(O){return typeof HTMLImageElement<"u"&&O instanceof HTMLImageElement?(p.width=O.naturalWidth||O.width,p.height=O.naturalHeight||O.height):typeof VideoFrame<"u"&&O instanceof VideoFrame?(p.width=O.displayWidth,p.height=O.displayHeight):(p.width=O.width,p.height=O.height),p}this.allocateTextureUnit=k,this.resetTextureUnits=it,this.getTextureUnits=X,this.setTextureUnits=j,this.setTexture2D=ct,this.setTexture2DArray=lt,this.setTexture3D=pt,this.setTextureCube=yt,this.rebindTextures=Ct,this.setupRenderTarget=Ut,this.updateRenderTargetMipmap=Nt,this.updateMultisampleRenderTarget=re,this.setupDepthRenderbuffer=xt,this.setupFrameBufferTexture=rt,this.useMultisampledRTT=It,this.isReversedDepthBuffer=function(){return i.buffers.depth.getReversed()}}function lC(r,t){function i(s,l=Es){let c;const f=He.getTransfer(l);if(s===vi)return r.UNSIGNED_BYTE;if(s===qm)return r.UNSIGNED_SHORT_4_4_4_4;if(s===Ym)return r.UNSIGNED_SHORT_5_5_5_1;if(s===xS)return r.UNSIGNED_INT_5_9_9_9_REV;if(s===SS)return r.UNSIGNED_INT_10F_11F_11F_REV;if(s===vS)return r.BYTE;if(s===_S)return r.SHORT;if(s===Kl)return r.UNSIGNED_SHORT;if(s===Wm)return r.INT;if(s===fa)return r.UNSIGNED_INT;if(s===Hi)return r.FLOAT;if(s===ha)return r.HALF_FLOAT;if(s===yS)return r.ALPHA;if(s===MS)return r.RGB;if(s===Vi)return r.RGBA;if(s===Xa)return r.DEPTH_COMPONENT;if(s===ir)return r.DEPTH_STENCIL;if(s===Zm)return r.RED;if(s===Km)return r.RED_INTEGER;if(s===ur)return r.RG;if(s===Jm)return r.RG_INTEGER;if(s===Qm)return r.RGBA_INTEGER;if(s===nf||s===af||s===sf||s===rf)if(f===Qe)if(c=t.get("WEBGL_compressed_texture_s3tc_srgb"),c!==null){if(s===nf)return c.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(s===af)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(s===sf)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(s===rf)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(c=t.get("WEBGL_compressed_texture_s3tc"),c!==null){if(s===nf)return c.COMPRESSED_RGB_S3TC_DXT1_EXT;if(s===af)return c.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(s===sf)return c.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(s===rf)return c.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(s===$p||s===tm||s===em||s===nm)if(c=t.get("WEBGL_compressed_texture_pvrtc"),c!==null){if(s===$p)return c.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(s===tm)return c.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(s===em)return c.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(s===nm)return c.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(s===im||s===am||s===sm||s===rm||s===om||s===cf||s===lm)if(c=t.get("WEBGL_compressed_texture_etc"),c!==null){if(s===im||s===am)return f===Qe?c.COMPRESSED_SRGB8_ETC2:c.COMPRESSED_RGB8_ETC2;if(s===sm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:c.COMPRESSED_RGBA8_ETC2_EAC;if(s===rm)return c.COMPRESSED_R11_EAC;if(s===om)return c.COMPRESSED_SIGNED_R11_EAC;if(s===cf)return c.COMPRESSED_RG11_EAC;if(s===lm)return c.COMPRESSED_SIGNED_RG11_EAC}else return null;if(s===cm||s===um||s===fm||s===hm||s===dm||s===pm||s===mm||s===gm||s===vm||s===_m||s===xm||s===Sm||s===ym||s===Mm)if(c=t.get("WEBGL_compressed_texture_astc"),c!==null){if(s===cm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:c.COMPRESSED_RGBA_ASTC_4x4_KHR;if(s===um)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:c.COMPRESSED_RGBA_ASTC_5x4_KHR;if(s===fm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:c.COMPRESSED_RGBA_ASTC_5x5_KHR;if(s===hm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:c.COMPRESSED_RGBA_ASTC_6x5_KHR;if(s===dm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:c.COMPRESSED_RGBA_ASTC_6x6_KHR;if(s===pm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:c.COMPRESSED_RGBA_ASTC_8x5_KHR;if(s===mm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:c.COMPRESSED_RGBA_ASTC_8x6_KHR;if(s===gm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:c.COMPRESSED_RGBA_ASTC_8x8_KHR;if(s===vm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:c.COMPRESSED_RGBA_ASTC_10x5_KHR;if(s===_m)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:c.COMPRESSED_RGBA_ASTC_10x6_KHR;if(s===xm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:c.COMPRESSED_RGBA_ASTC_10x8_KHR;if(s===Sm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:c.COMPRESSED_RGBA_ASTC_10x10_KHR;if(s===ym)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:c.COMPRESSED_RGBA_ASTC_12x10_KHR;if(s===Mm)return f===Qe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:c.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(s===Em||s===bm||s===Tm)if(c=t.get("EXT_texture_compression_bptc"),c!==null){if(s===Em)return f===Qe?c.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:c.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(s===bm)return c.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(s===Tm)return c.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(s===Am||s===Rm||s===uf||s===wm)if(c=t.get("EXT_texture_compression_rgtc"),c!==null){if(s===Am)return c.COMPRESSED_RED_RGTC1_EXT;if(s===Rm)return c.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(s===uf)return c.COMPRESSED_RED_GREEN_RGTC2_EXT;if(s===wm)return c.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return s===Jl?r.UNSIGNED_INT_24_8:r[s]!==void 0?r[s]:null}return{convert:i}}const cC=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,uC=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class fC{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,i){if(this.texture===null){const s=new LS(t.texture);(t.depthNear!==i.depthNear||t.depthFar!==i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){const i=t.cameras[0].viewport,s=new pa({vertexShader:cC,fragmentShader:uC,uniforms:{depthColor:{value:this.texture},depthWidth:{value:i.z},depthHeight:{value:i.w}}});this.mesh=new We(new hr(20,20),s)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class hC extends dr{constructor(t,i){super();const s=this;let l=null,c=1,f=null,d="local-floor",m=1,p=null,_=null,v=null,g=null,y=null,b=null;const C=typeof XRWebGLBinding<"u",M=new fC,S={},N=i.getContextAttributes();let I=null,A=null;const U=[],L=[],P=new Bt;let T=null,D=null;const H=new ii;H.viewport=new cn;const G=new ii;G.viewport=new cn;const K=[H,G],it=new x2;let X=null,j=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let F=U[J];return F===void 0&&(F=new pp,U[J]=F),F.getTargetRaySpace()},this.getControllerGrip=function(J){let F=U[J];return F===void 0&&(F=new pp,U[J]=F),F.getGripSpace()},this.getHand=function(J){let F=U[J];return F===void 0&&(F=new pp,U[J]=F),F.getHandSpace()};function k(J){const F=L.indexOf(J.inputSource);if(F===-1)return;const st=U[F];st!==void 0&&(st.update(J.inputSource,J.frame,p||f),st.dispatchEvent({type:J.type,data:J.inputSource}))}function Q(){l.removeEventListener("select",k),l.removeEventListener("selectstart",k),l.removeEventListener("selectend",k),l.removeEventListener("squeeze",k),l.removeEventListener("squeezestart",k),l.removeEventListener("squeezeend",k),l.removeEventListener("end",Q),l.removeEventListener("inputsourceschange",ct);for(let J=0;J<U.length;J++){const F=L[J];F!==null&&(L[J]=null,U[J].disconnect(F))}X=null,j=null,M.reset();for(const J in S)delete S[J];if(t.setRenderTarget(I),y=null,g=null,v=null,l=null,A=null,Pt.stop(),s.isPresenting=!1,t.setPixelRatio(T),t.setSize(P.width,P.height,!1),D!==null){const J=D.camera;J.fov=D.fov,J.zoom=D.zoom,J.updateProjectionMatrix(),D=null}s.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){c=J,s.isPresenting===!0&&_e("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){d=J,s.isPresenting===!0&&_e("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return p||f},this.setReferenceSpace=function(J){p=J},this.getBaseLayer=function(){return g!==null?g:y},this.getBinding=function(){return v===null&&C&&(v=new XRWebGLBinding(l,i)),v},this.getFrame=function(){return b},this.getSession=function(){return l},this.setSession=async function(J){if(l=J,l!==null){if(I=t.getRenderTarget(),l.addEventListener("select",k),l.addEventListener("selectstart",k),l.addEventListener("selectend",k),l.addEventListener("squeeze",k),l.addEventListener("squeezestart",k),l.addEventListener("squeezeend",k),l.addEventListener("end",Q),l.addEventListener("inputsourceschange",ct),N.xrCompatible!==!0&&await i.makeXRCompatible(),T=t.getPixelRatio(),t.getSize(P),C&&"createProjectionLayer"in XRWebGLBinding.prototype){let st=null,wt=null,rt=null;N.depth&&(rt=N.stencil?i.DEPTH24_STENCIL8:i.DEPTH_COMPONENT24,st=N.stencil?ir:Xa,wt=N.stencil?Jl:fa);const At={colorFormat:i.RGBA8,depthFormat:rt,scaleFactor:c};v=this.getBinding(),g=v.createProjectionLayer(At),l.updateRenderState({layers:[g]}),t.setPixelRatio(1),t.setSize(g.textureWidth,g.textureHeight,!1),A=new Gi(g.textureWidth,g.textureHeight,{format:Vi,type:vi,depthTexture:new jl(g.textureWidth,g.textureHeight,wt,void 0,void 0,void 0,void 0,void 0,void 0,st),stencilBuffer:N.stencil,colorSpace:t.outputColorSpace,samples:N.antialias?4:0,resolveDepthBuffer:g.ignoreDepthValues===!1,resolveStencilBuffer:g.ignoreDepthValues===!1,storeMultisampledDepthBuffer:g.ignoreDepthValues===!1,storeMultisampledStencilBuffer:g.ignoreDepthValues===!1})}else{const st={antialias:N.antialias,alpha:!0,depth:N.depth,stencil:N.stencil,framebufferScaleFactor:c};y=new XRWebGLLayer(l,i,st),l.updateRenderState({baseLayer:y}),t.setPixelRatio(1),t.setSize(y.framebufferWidth,y.framebufferHeight,!1),A=new Gi(y.framebufferWidth,y.framebufferHeight,{format:Vi,type:vi,colorSpace:t.outputColorSpace,stencilBuffer:N.stencil,resolveDepthBuffer:y.ignoreDepthValues===!1,resolveStencilBuffer:y.ignoreDepthValues===!1,storeMultisampledDepthBuffer:y.ignoreDepthValues===!1,storeMultisampledStencilBuffer:y.ignoreDepthValues===!1})}A.isXRRenderTarget=!0,this.setFoveation(m),p=null,f=await l.requestReferenceSpace(d),Pt.setContext(l),Pt.start(),s.isPresenting=!0,s.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(l!==null)return l.environmentBlendMode},this.getDepthTexture=function(){return M.getDepthTexture()};function ct(J){for(let F=0;F<J.removed.length;F++){const st=J.removed[F],wt=L.indexOf(st);wt>=0&&(L[wt]=null,U[wt].disconnect(st))}for(let F=0;F<J.added.length;F++){const st=J.added[F];let wt=L.indexOf(st);if(wt===-1){for(let At=0;At<U.length;At++)if(At>=L.length){L.push(st),wt=At;break}else if(L[At]===null){L[At]=st,wt=At;break}if(wt===-1)break}const rt=U[wt];rt&&rt.connect(st)}}const lt=new tt,pt=new tt;function yt(J,F,st){lt.setFromMatrixPosition(F.matrixWorld),pt.setFromMatrixPosition(st.matrixWorld);const wt=lt.distanceTo(pt),rt=F.projectionMatrix.elements,At=st.projectionMatrix.elements,fe=rt[14]/(rt[10]-1),xt=rt[14]/(rt[10]+1),Ct=(rt[9]+1)/rt[5],Ut=(rt[9]-1)/rt[5],Nt=(rt[8]-1)/rt[0],Dt=(At[8]+1)/At[0],se=fe*Nt,re=fe*Dt,gt=wt/(-Nt+Dt),It=gt*-Nt;if(F.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(It),J.translateZ(gt),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),rt[10]===-1)J.projectionMatrix.copy(F.projectionMatrix),J.projectionMatrixInverse.copy(F.projectionMatrixInverse);else{const z=fe+gt,ce=xt+gt,de=se-It,O=re+(wt-It),E=Ct*xt/ce*z,Y=Ut*xt/ce*z;J.projectionMatrix.makePerspective(de,O,E,Y,z,ce),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function Yt(J,F){F===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(F.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(l===null)return;let F=J.near,st=J.far;M.texture!==null&&(M.depthNear>0&&(F=M.depthNear),M.depthFar>0&&(st=M.depthFar)),it.near=G.near=H.near=F,it.far=G.far=H.far=st,(X!==it.near||j!==it.far)&&(l.updateRenderState({depthNear:it.near,depthFar:it.far}),X=it.near,j=it.far),it.layers.mask=J.layers.mask|6,H.layers.mask=it.layers.mask&-5,G.layers.mask=it.layers.mask&-3;const wt=J.parent,rt=it.cameras;Yt(it,wt);for(let At=0;At<rt.length;At++)Yt(rt[At],wt);rt.length===2?yt(it,H,G):it.projectionMatrix.copy(H.projectionMatrix),D===null&&J.isPerspectiveCamera&&(D={camera:J,fov:J.fov,zoom:J.zoom}),Wt(J,it,wt)};function Wt(J,F,st){st===null?J.matrix.copy(F.matrixWorld):(J.matrix.copy(st.matrixWorld),J.matrix.invert(),J.matrix.multiply(F.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(F.projectionMatrix),J.projectionMatrixInverse.copy(F.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=mf*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return it},this.getFoveation=function(){if(!(g===null&&y===null))return m},this.setFoveation=function(J){m=J,g!==null&&(g.fixedFoveation=J),y!==null&&y.fixedFoveation!==void 0&&(y.fixedFoveation=J)},this.hasDepthSensing=function(){return M.texture!==null},this.getDepthSensingMesh=function(){return M.getMesh(it)},this.getCameraTexture=function(J){return S[J]};let V=null;function _t(J,F){if(_=F.getViewerPose(p||f),b=F,_!==null){const st=_.views;y!==null&&(t.setRenderTargetFramebuffer(A,y.framebuffer),t.setRenderTarget(A));let wt=!1;st.length!==it.cameras.length&&(it.cameras.length=0,wt=!0);for(let xt=0;xt<st.length;xt++){const Ct=st[xt];let Ut=null;if(y!==null)Ut=y.getViewport(Ct);else{const Dt=v.getViewSubImage(g,Ct);Ut=Dt.viewport,xt===0&&(t.setRenderTargetTextures(A,Dt.colorTexture,Dt.depthStencilTexture),t.setRenderTarget(A))}let Nt=K[xt];Nt===void 0&&(Nt=new ii,Nt.layers.enable(xt),Nt.viewport=new cn,K[xt]=Nt),Nt.matrix.fromArray(Ct.transform.matrix),Nt.matrix.decompose(Nt.position,Nt.quaternion,Nt.scale),Nt.projectionMatrix.fromArray(Ct.projectionMatrix),Nt.projectionMatrixInverse.copy(Nt.projectionMatrix).invert(),Nt.viewport.set(Ut.x,Ut.y,Ut.width,Ut.height),xt===0&&(it.matrix.copy(Nt.matrix),it.matrix.decompose(it.position,it.quaternion,it.scale)),wt===!0&&it.cameras.push(Nt)}const rt=l.enabledFeatures;if(rt&&rt.includes("depth-sensing")&&l.depthUsage=="gpu-optimized"&&C){v=s.getBinding();const xt=v.getDepthInformation(st[0]);xt&&xt.isValid&&xt.texture&&M.init(xt,l.renderState)}if(rt&&rt.includes("camera-access")&&C){t.state.unbindTexture(),v=s.getBinding();for(let xt=0;xt<st.length;xt++){const Ct=st[xt].camera;if(Ct){let Ut=S[Ct];Ut||(Ut=new LS,S[Ct]=Ut);const Nt=v.getCameraImage(Ct);Ut.sourceTexture=Nt}}}}for(let st=0;st<U.length;st++){const wt=L[st],rt=U[st];wt!==null&&rt!==void 0&&rt.update(wt,F,p||f)}V&&V(J,F),F.detectedPlanes&&s.dispatchEvent({type:"planesdetected",data:F}),b=null}const Pt=new kS;Pt.setAnimationLoop(_t),this.setAnimationLoop=function(J){V=J},this.dispose=function(){}}}const dC=new nn,QS=new Ee;QS.set(-1,0,0,0,1,0,0,0,1);function pC(r,t){function i(M,S){M.matrixAutoUpdate===!0&&M.updateMatrix(),S.value.copy(M.matrix)}function s(M,S){S.color.getRGB(M.fogColor.value,GS(r)),S.isFog?(M.fogNear.value=S.near,M.fogFar.value=S.far):S.isFogExp2&&(M.fogDensity.value=S.density)}function l(M,S,N,I,A){S.isNodeMaterial?S.uniformsNeedUpdate=!1:S.isMeshBasicMaterial?c(M,S):S.isMeshLambertMaterial?(c(M,S),S.envMap&&(M.envMapIntensity.value=S.envMapIntensity)):S.isMeshToonMaterial?(c(M,S),v(M,S)):S.isMeshPhongMaterial?(c(M,S),_(M,S),S.envMap&&(M.envMapIntensity.value=S.envMapIntensity)):S.isMeshStandardMaterial?(c(M,S),g(M,S),S.isMeshPhysicalMaterial&&y(M,S,A)):S.isMeshMatcapMaterial?(c(M,S),b(M,S)):S.isMeshDepthMaterial?c(M,S):S.isMeshDistanceMaterial?(c(M,S),C(M,S)):S.isMeshNormalMaterial?c(M,S):S.isLineBasicMaterial?(f(M,S),S.isLineDashedMaterial&&d(M,S)):S.isPointsMaterial?m(M,S,N,I):S.isSpriteMaterial?p(M,S):S.isShadowMaterial?(M.color.value.copy(S.color),M.opacity.value=S.opacity):S.isShaderMaterial&&(S.uniformsNeedUpdate=!1)}function c(M,S){M.opacity.value=S.opacity,S.color&&M.diffuse.value.copy(S.color),S.emissive&&M.emissive.value.copy(S.emissive).multiplyScalar(S.emissiveIntensity),S.map&&(M.map.value=S.map,i(S.map,M.mapTransform)),S.alphaMap&&(M.alphaMap.value=S.alphaMap,i(S.alphaMap,M.alphaMapTransform)),S.bumpMap&&(M.bumpMap.value=S.bumpMap,i(S.bumpMap,M.bumpMapTransform),M.bumpScale.value=S.bumpScale,S.side===Kn&&(M.bumpScale.value*=-1)),S.normalMap&&(M.normalMap.value=S.normalMap,i(S.normalMap,M.normalMapTransform),M.normalScale.value.copy(S.normalScale),S.side===Kn&&M.normalScale.value.negate()),S.displacementMap&&(M.displacementMap.value=S.displacementMap,i(S.displacementMap,M.displacementMapTransform),M.displacementScale.value=S.displacementScale,M.displacementBias.value=S.displacementBias),S.emissiveMap&&(M.emissiveMap.value=S.emissiveMap,i(S.emissiveMap,M.emissiveMapTransform)),S.specularMap&&(M.specularMap.value=S.specularMap,i(S.specularMap,M.specularMapTransform)),S.alphaTest>0&&(M.alphaTest.value=S.alphaTest);const N=t.get(S),I=N.envMap,A=N.envMapRotation;I&&(M.envMap.value=I,M.envMapRotation.value.setFromMatrix4(dC.makeRotationFromEuler(A)).transpose(),I.isCubeTexture&&I.isRenderTargetTexture===!1&&M.envMapRotation.value.premultiply(QS),M.reflectivity.value=S.reflectivity,M.ior.value=S.ior,M.refractionRatio.value=S.refractionRatio),S.lightMap&&(M.lightMap.value=S.lightMap,M.lightMapIntensity.value=S.lightMapIntensity,i(S.lightMap,M.lightMapTransform)),S.aoMap&&(M.aoMap.value=S.aoMap,M.aoMapIntensity.value=S.aoMapIntensity,i(S.aoMap,M.aoMapTransform))}function f(M,S){M.diffuse.value.copy(S.color),M.opacity.value=S.opacity,S.map&&(M.map.value=S.map,i(S.map,M.mapTransform))}function d(M,S){M.dashSize.value=S.dashSize,M.totalSize.value=S.dashSize+S.gapSize,M.scale.value=S.scale}function m(M,S,N,I){M.diffuse.value.copy(S.color),M.opacity.value=S.opacity,M.size.value=S.size*N,M.scale.value=I*.5,S.map&&(M.map.value=S.map,i(S.map,M.uvTransform)),S.alphaMap&&(M.alphaMap.value=S.alphaMap,i(S.alphaMap,M.alphaMapTransform)),S.alphaTest>0&&(M.alphaTest.value=S.alphaTest)}function p(M,S){M.diffuse.value.copy(S.color),M.opacity.value=S.opacity,M.rotation.value=S.rotation,S.map&&(M.map.value=S.map,i(S.map,M.mapTransform)),S.alphaMap&&(M.alphaMap.value=S.alphaMap,i(S.alphaMap,M.alphaMapTransform)),S.alphaTest>0&&(M.alphaTest.value=S.alphaTest)}function _(M,S){M.specular.value.copy(S.specular),M.shininess.value=Math.max(S.shininess,1e-4)}function v(M,S){S.gradientMap&&(M.gradientMap.value=S.gradientMap)}function g(M,S){M.metalness.value=S.metalness,S.metalnessMap&&(M.metalnessMap.value=S.metalnessMap,i(S.metalnessMap,M.metalnessMapTransform)),M.roughness.value=S.roughness,S.roughnessMap&&(M.roughnessMap.value=S.roughnessMap,i(S.roughnessMap,M.roughnessMapTransform)),S.envMap&&(M.envMapIntensity.value=S.envMapIntensity)}function y(M,S,N){M.ior.value=S.ior,S.sheen>0&&(M.sheenColor.value.copy(S.sheenColor).multiplyScalar(S.sheen),M.sheenRoughness.value=S.sheenRoughness,S.sheenColorMap&&(M.sheenColorMap.value=S.sheenColorMap,i(S.sheenColorMap,M.sheenColorMapTransform)),S.sheenRoughnessMap&&(M.sheenRoughnessMap.value=S.sheenRoughnessMap,i(S.sheenRoughnessMap,M.sheenRoughnessMapTransform))),S.clearcoat>0&&(M.clearcoat.value=S.clearcoat,M.clearcoatRoughness.value=S.clearcoatRoughness,S.clearcoatMap&&(M.clearcoatMap.value=S.clearcoatMap,i(S.clearcoatMap,M.clearcoatMapTransform)),S.clearcoatRoughnessMap&&(M.clearcoatRoughnessMap.value=S.clearcoatRoughnessMap,i(S.clearcoatRoughnessMap,M.clearcoatRoughnessMapTransform)),S.clearcoatNormalMap&&(M.clearcoatNormalMap.value=S.clearcoatNormalMap,i(S.clearcoatNormalMap,M.clearcoatNormalMapTransform),M.clearcoatNormalScale.value.copy(S.clearcoatNormalScale),S.side===Kn&&M.clearcoatNormalScale.value.negate())),S.dispersion>0&&(M.dispersion.value=S.dispersion),S.retroreflectivity>0&&(M.retroreflectivity.value=S.retroreflectivity),S.iridescence>0&&(M.iridescence.value=S.iridescence,M.iridescenceIOR.value=S.iridescenceIOR,M.iridescenceThicknessMinimum.value=S.iridescenceThicknessRange[0],M.iridescenceThicknessMaximum.value=S.iridescenceThicknessRange[1],S.iridescenceMap&&(M.iridescenceMap.value=S.iridescenceMap,i(S.iridescenceMap,M.iridescenceMapTransform)),S.iridescenceThicknessMap&&(M.iridescenceThicknessMap.value=S.iridescenceThicknessMap,i(S.iridescenceThicknessMap,M.iridescenceThicknessMapTransform))),S.transmission>0&&(M.transmission.value=S.transmission,M.transmissionSamplerMap.value=N.texture,M.transmissionSamplerSize.value.set(N.width,N.height),S.transmissionMap&&(M.transmissionMap.value=S.transmissionMap,i(S.transmissionMap,M.transmissionMapTransform)),M.thickness.value=S.thickness,S.thicknessMap&&(M.thicknessMap.value=S.thicknessMap,i(S.thicknessMap,M.thicknessMapTransform)),M.attenuationDistance.value=S.attenuationDistance,M.attenuationColor.value.copy(S.attenuationColor)),S.anisotropy>0&&(M.anisotropyVector.value.set(S.anisotropy*Math.cos(S.anisotropyRotation),S.anisotropy*Math.sin(S.anisotropyRotation)),S.anisotropyMap&&(M.anisotropyMap.value=S.anisotropyMap,i(S.anisotropyMap,M.anisotropyMapTransform))),M.specularIntensity.value=S.specularIntensity,M.specularColor.value.copy(S.specularColor),S.specularColorMap&&(M.specularColorMap.value=S.specularColorMap,i(S.specularColorMap,M.specularColorMapTransform)),S.specularIntensityMap&&(M.specularIntensityMap.value=S.specularIntensityMap,i(S.specularIntensityMap,M.specularIntensityMapTransform))}function b(M,S){S.matcap&&(M.matcap.value=S.matcap)}function C(M,S){const N=t.get(S).light;M.referencePosition.value.setFromMatrixPosition(N.matrixWorld),M.nearDistance.value=N.shadow.camera.near,M.farDistance.value=N.shadow.camera.far}return{refreshFogUniforms:s,refreshMaterialUniforms:l}}function mC(r,t,i,s){let l={},c={},f=[];const d=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function m(A,U){const L=U.program;s.uniformBlockBinding(A,L)}function p(A,U){let L=l[A.id];L===void 0&&(M(A),L=_(A),l[A.id]=L,A.addEventListener("dispose",N));const P=U.program;s.updateUBOMapping(A,P);const T=t.render.frame;c[A.id]!==T&&(g(A),c[A.id]=T)}function _(A){const U=v();A.__bindingPointIndex=U;const L=r.createBuffer(),P=A.__size,T=A.usage;return r.bindBuffer(r.UNIFORM_BUFFER,L),r.bufferData(r.UNIFORM_BUFFER,P,T),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,U,L),L}function v(){for(let A=0;A<d;A++)if(f.indexOf(A)===-1)return f.push(A),A;return Ge("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function g(A){const U=l[A.id],L=A.uniforms,P=A.__cache;r.bindBuffer(r.UNIFORM_BUFFER,U);for(let T=0,D=L.length;T<D;T++){const H=L[T];if(Array.isArray(H))for(let G=0,K=H.length;G<K;G++)y(H[G],T,G,P);else y(H,T,0,P)}r.bindBuffer(r.UNIFORM_BUFFER,null)}function y(A,U,L,P){if(C(A,U,L,P)===!0){const T=A.__offset,D=A.value;if(Array.isArray(D)){let H=0;for(let G=0;G<D.length;G++){const K=D[G],it=S(K);b(K,A.__data,H),typeof K!="number"&&typeof K!="boolean"&&!K.isMatrix3&&!ArrayBuffer.isView(K)&&(H+=it.storage/Float32Array.BYTES_PER_ELEMENT)}}else b(D,A.__data,0);r.bufferSubData(r.UNIFORM_BUFFER,T,A.__data)}}function b(A,U,L){typeof A=="number"||typeof A=="boolean"?U[0]=A:A.isMatrix3?(U[0]=A.elements[0],U[1]=A.elements[1],U[2]=A.elements[2],U[3]=0,U[4]=A.elements[3],U[5]=A.elements[4],U[6]=A.elements[5],U[7]=0,U[8]=A.elements[6],U[9]=A.elements[7],U[10]=A.elements[8],U[11]=0):ArrayBuffer.isView(A)?U.set(new A.constructor(A.buffer,A.byteOffset,U.length)):A.toArray(U,L)}function C(A,U,L,P){const T=A.value,D=U+"_"+L;if(P[D]===void 0)return typeof T=="number"||typeof T=="boolean"?P[D]=T:ArrayBuffer.isView(T)?P[D]=T.slice():P[D]=T.clone(),!0;{const H=P[D];if(typeof T=="number"||typeof T=="boolean"){if(H!==T)return P[D]=T,!0}else{if(ArrayBuffer.isView(T))return!0;if(H.equals(T)===!1)return H.copy(T),!0}}return!1}function M(A){const U=A.uniforms;let L=0;const P=16;for(let D=0,H=U.length;D<H;D++){const G=Array.isArray(U[D])?U[D]:[U[D]];for(let K=0,it=G.length;K<it;K++){const X=G[K],j=Array.isArray(X.value)?X.value:[X.value];for(let k=0,Q=j.length;k<Q;k++){const ct=j[k],lt=S(ct),pt=L%P,yt=pt%lt.boundary,Yt=pt+yt;L+=yt,Yt!==0&&P-Yt<lt.storage&&(L+=P-Yt),X.__data=new Float32Array(lt.storage/Float32Array.BYTES_PER_ELEMENT),X.__offset=L,L+=lt.storage}}}const T=L%P;return T>0&&(L+=P-T),A.__size=L,A.__cache={},this}function S(A){const U={boundary:0,storage:0};return typeof A=="number"||typeof A=="boolean"?(U.boundary=4,U.storage=4):A.isVector2?(U.boundary=8,U.storage=8):A.isVector3||A.isColor?(U.boundary=16,U.storage=12):A.isVector4?(U.boundary=16,U.storage=16):A.isMatrix3?(U.boundary=48,U.storage=48):A.isMatrix4?(U.boundary=64,U.storage=64):A.isTexture?_e("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(A)?(U.boundary=16,U.storage=A.byteLength):_e("WebGLRenderer: Unsupported uniform value type.",A),U}function N(A){const U=A.target;U.removeEventListener("dispose",N);const L=f.indexOf(U.__bindingPointIndex);f.splice(L,1),r.deleteBuffer(l[U.id]),delete l[U.id],delete c[U.id]}function I(){for(const A in l)r.deleteBuffer(l[A]);f=[],l={},c={}}return{bind:m,update:p,dispose:I}}const gC=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let aa=null;function vC(){return aa===null&&(aa=new NS(gC,16,16,ur,ha),aa.name="DFG_LUT",aa.minFilter=Vn,aa.magFilter=Vn,aa.wrapS=Ba,aa.wrapT=Ba,aa.generateMipmaps=!1,aa.needsUpdate=!0),aa}class _C{constructor(t={}){const{canvas:i=Zb(),context:s=null,depth:l=!0,stencil:c=!1,alpha:f=!1,antialias:d=!1,premultipliedAlpha:m=!0,preserveDrawingBuffer:p=!1,powerPreference:_="default",failIfMajorPerformanceCaveat:v=!1,reversedDepthBuffer:g=!1,outputBufferType:y=vi}=t;this.isWebGLRenderer=!0;let b;if(s!==null){if(typeof WebGLRenderingContext<"u"&&s instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");b=s.getContextAttributes().alpha}else b=f;const C=y,M=new Set([Qm,Jm,Km]),S=new Set([vi,fa,Kl,Jl,qm,Ym]),N=new Uint32Array(4),I=new Int32Array(4),A=new tt;let U=null,L=null;const P=[],T=[];let D=null;this.domElement=i,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ca,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const H=this;let G=!1,K=null,it=null,X=null,j=null;this._outputColorSpace=ni;let k=0,Q=0,ct=null,lt=-1,pt=null;const yt=new cn,Yt=new cn;let Wt=null;const V=new be(0);let _t=0,Pt=i.width,J=i.height,F=1,st=null,wt=null;const rt=new cn(0,0,Pt,J),At=new cn(0,0,Pt,J);let fe=!1;const xt=new i0;let Ct=!1,Ut=!1;const Nt=new nn,Dt=new tt,se=new cn,re={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let gt=!1;function It(){return ct===null?F:1}let z=s;function ce(R,W){return i.getContext(R,W)}let de,O,E,Y,at,vt,Ot,zt,St,Rt,Ht,he,qt,kt,$t,me,Se,Z,Ft,Tt,Vt,jt,Lt;try{const R={alpha:!0,depth:l,stencil:c,antialias:d,premultipliedAlpha:m,preserveDrawingBuffer:p,powerPreference:_,failIfMajorPerformanceCaveat:v};if("setAttribute"in i&&i.setAttribute("data-engine",`three.js r${Gm}`),i.addEventListener("webglcontextlost",Be,!1),i.addEventListener("webglcontextrestored",ye,!1),i.addEventListener("webglcontextcreationerror",si,!1),z===null){const W="webgl2";if(z=ce(W,R),z===null)throw ce(W)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}ue()}catch(R){throw i.removeEventListener("webglcontextlost",Be,!1),i.removeEventListener("webglcontextrestored",ye,!1),i.removeEventListener("webglcontextcreationerror",si,!1),Ge("WebGLRenderer: "+R.message),R}function ue(){de=new vR(z),de.init(),Vt=new lC(z,de),O=new oR(z,de,t,Vt),E=new rC(z,de),O.reversedDepthBuffer&&g&&E.buffers.depth.setReversed(!0),it=z.createFramebuffer(),X=z.createFramebuffer(),j=z.createFramebuffer(),Y=new SR(z),at=new qw,vt=new oC(z,de,E,at,O,Vt,Y),Ot=new gR(H),zt=new M2(z),jt=new sR(z,zt),St=new _R(z,zt,Y,jt),Rt=new MR(z,St,zt,jt,Y),Z=new yR(z,O,vt),$t=new lR(at),Ht=new Ww(H,Ot,de,O,jt,$t),he=new pC(H,at),qt=new Zw,kt=new tC(de),Se=new aR(H,Ot,E,Rt,b,m),me=new sC(H,Rt,O),Lt=new mC(z,Y,O,E),Ft=new rR(z,de,Y),Tt=new xR(z,de,Y),Y.programs=Ht.programs,H.capabilities=O,H.extensions=de,H.properties=at,H.renderLists=qt,H.shadowMap=me,H.state=E,H.info=Y}C!==vi&&(D=new bR(C,i.width,i.height,d,l,c));const Qt=new hC(H,z);this.xr=Qt,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){const R=de.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){const R=de.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return F},this.setPixelRatio=function(R){R!==void 0&&(F=R,this.setSize(Pt,J,!1))},this.getSize=function(R){return R.set(Pt,J)},this.setSize=function(R,W,mt=!0){if(Qt.isPresenting){_e("WebGLRenderer: Can't change size while VR device is presenting.");return}Pt=R,J=W,i.width=Math.floor(R*F),i.height=Math.floor(W*F),mt===!0&&(i.style.width=R+"px",i.style.height=W+"px"),D!==null&&D.setSize(i.width,i.height),this.setViewport(0,0,R,W)},this.getDrawingBufferSize=function(R){return R.set(Pt*F,J*F).floor()},this.setDrawingBufferSize=function(R,W,mt){Pt=R,J=W,F=mt,i.width=Math.floor(R*mt),i.height=Math.floor(W*mt),this.setViewport(0,0,R,W)},this.setEffects=function(R){if(C===vi){Ge("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(R){for(let W=0;W<R.length;W++)if(R[W].isOutputPass===!0){_e("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}D.setEffects(R||[])},this.getCurrentViewport=function(R){return R.copy(yt)},this.getViewport=function(R){return R.copy(rt)},this.setViewport=function(R,W,mt,ut){R.isVector4?rt.set(R.x,R.y,R.z,R.w):rt.set(R,W,mt,ut),E.viewport(yt.copy(rt).multiplyScalar(F).round())},this.getScissor=function(R){return R.copy(At)},this.setScissor=function(R,W,mt,ut){R.isVector4?At.set(R.x,R.y,R.z,R.w):At.set(R,W,mt,ut),E.scissor(Yt.copy(At).multiplyScalar(F).round())},this.getScissorTest=function(){return fe},this.setScissorTest=function(R){E.setScissorTest(fe=R)},this.setOpaqueSort=function(R){st=R},this.setTransparentSort=function(R){wt=R},this.getClearColor=function(R){return R.copy(Se.getClearColor())},this.setClearColor=function(){Se.setClearColor(...arguments)},this.getClearAlpha=function(){return Se.getClearAlpha()},this.setClearAlpha=function(){Se.setClearAlpha(...arguments)},this.clear=function(R=!0,W=!0,mt=!0){let ut=0;if(R){let ft=!1;if(ct!==null){const Zt=ct.texture.format;ft=M.has(Zt)}if(ft){const Zt=ct.texture.type,te=S.has(Zt),Gt=Se.getClearColor(),ae=Se.getClearAlpha(),oe=Gt.r,ve=Gt.g,Me=Gt.b;te?(N[0]=oe,N[1]=ve,N[2]=Me,N[3]=ae,z.clearBufferuiv(z.COLOR,0,N)):(I[0]=oe,I[1]=ve,I[2]=Me,I[3]=ae,z.clearBufferiv(z.COLOR,0,I))}else ut|=z.COLOR_BUFFER_BIT}W&&(ut|=z.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),mt&&(ut|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),ut!==0&&z.clear(ut)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(R){R.setRenderer(this),K=R},this.dispose=function(){i.removeEventListener("webglcontextlost",Be,!1),i.removeEventListener("webglcontextrestored",ye,!1),i.removeEventListener("webglcontextcreationerror",si,!1),Se.dispose(),qt.dispose(),kt.dispose(),at.dispose(),Ot.dispose(),Rt.dispose(),jt.dispose(),Lt.dispose(),Ht.dispose(),Qt.dispose(),Qt.removeEventListener("sessionstart",Rs),Qt.removeEventListener("sessionend",Wa),Xi.stop()};function Be(R){R.preventDefault(),Hx("WebGLRenderer: Context Lost."),G=!0}function ye(){Hx("WebGLRenderer: Context Restored."),G=!1;const R=Y.autoReset,W=me.enabled,mt=me.autoUpdate,ut=me.needsUpdate,ft=me.type;ue(),Y.autoReset=R,me.enabled=W,me.autoUpdate=mt,me.needsUpdate=ut,me.type=ft}function si(R){Ge("WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function _i(R){const W=R.target;W.removeEventListener("dispose",_i),bf(W)}function bf(R){gr(R),at.remove(R)}function gr(R){const W=at.get(R).programs;W!==void 0&&(W.forEach(function(mt){Ht.releaseProgram(mt)}),R.isShaderMaterial&&Ht.releaseShaderCache(R))}this.renderBufferDirect=function(R,W,mt,ut,ft,Zt){W===null&&(W=re);const te=ft.isMesh&&ft.matrixWorld.determinantAffine()<0,Gt=zo(R,W,mt,ut,ft);E.setMaterial(ut,te);let ae=mt.index,oe=1;if(ut.wireframe===!0){if(ae=St.getWireframeAttribute(mt),ae===void 0)return;oe=2}const ve=mt.drawRange,Me=mt.attributes.position;let ee=ve.start*oe,Le=(ve.start+ve.count)*oe;Zt!==null&&(ee=Math.max(ee,Zt.start*oe),Le=Math.min(Le,(Zt.start+Zt.count)*oe)),ae!==null?(ee=Math.max(ee,0),Le=Math.min(Le,ae.count)):Me!=null&&(ee=Math.max(ee,0),Le=Math.min(Le,Me.count));const we=Le-ee;if(we<0||we===1/0)return;jt.setup(ft,ut,Gt,mt,ae);let je,qe=Ft;if(ae!==null&&(je=zt.get(ae),qe=Tt,qe.setIndex(je)),ft.isMesh)ut.wireframe===!0?(E.setLineWidth(ut.wireframeLinewidth*It()),qe.setMode(z.LINES)):qe.setMode(z.TRIANGLES);else if(ft.isLine){let En=ut.linewidth;En===void 0&&(En=1),E.setLineWidth(En*It()),ft.isLineSegments?qe.setMode(z.LINES):ft.isLineLoop?qe.setMode(z.LINE_LOOP):qe.setMode(z.LINE_STRIP)}else ft.isPoints?qe.setMode(z.POINTS):ft.isSprite&&qe.setMode(z.TRIANGLES);if(ft.isBatchedMesh)if(de.get("WEBGL_multi_draw"))qe.renderMultiDraw(ft._multiDrawStarts,ft._multiDrawCounts,ft._multiDrawCount);else{const En=ft._multiDrawStarts,Kt=ft._multiDrawCounts,hn=ft._multiDrawCount,Fe=ae?zt.get(ae).bytesPerElement:1,Xn=at.get(ut).currentProgram.getUniforms();for(let ri=0;ri<hn;ri++)Xn.setValue(z,"_gl_DrawID",ri),qe.render(En[ri]/Fe,Kt[ri])}else if(ft.isInstancedMesh)qe.renderInstances(ee,we,ft.count);else if(mt.isInstancedBufferGeometry){const En=mt._maxInstanceCount!==void 0?mt._maxInstanceCount:1/0,Kt=Math.min(mt.instanceCount,En);qe.renderInstances(ee,we,Kt)}else qe.render(ee,we)};function As(R,W,mt,ut){K!==null&&R.isNodeMaterial&&K.setObject(ut,R),Ct===!0&&$t.setState(R,mt,!1),R.transparent===!0&&R.side===za&&R.forceSinglePass===!1?(R.side=Kn,R.needsUpdate=!0,ws(R,W,ut),R.side=lr,R.needsUpdate=!0,ws(R,W,ut),R.side=za):ws(R,W,ut)}this.compile=function(R,W,mt=null){mt===null&&(mt=R),K!==null&&K.renderStart(R,W,mt),L=kt.get(mt),L.init(W),T.push(L),mt.traverseVisible(function(ft){ft.isLight&&ft.layers.test(W.layers)&&(L.pushLight(ft),ft.castShadow&&L.pushShadow(ft))}),R!==mt&&R.traverseVisible(function(ft){ft.isLight&&ft.layers.test(W.layers)&&(L.pushLight(ft),ft.castShadow&&L.pushShadow(ft))}),L.setupLights(),K!==null&&K.updateLights(L.state.lightsArray),Ut=this.localClippingEnabled,Ct=$t.init(this.clippingPlanes,Ut),Ct===!0&&$t.setGlobalState(this.clippingPlanes,W),K!==null&&me.render(L.state.shadowsArray,mt,W);const ut=new Set;return R.traverse(function(ft){if(!(ft.isMesh||ft.isPoints||ft.isLine||ft.isSprite))return;const Zt=ft.material;if(Zt)if(Array.isArray(Zt))for(let te=0;te<Zt.length;te++){const Gt=Zt[te];As(Gt,mt,W,ft),ut.add(Gt)}else As(Zt,mt,W,ft),ut.add(Zt)}),L=T.pop(),K!==null&&K.renderEnd(),ut},this.compileAsync=function(R,W,mt=null){const ut=this.compile(R,W,mt);return new Promise(ft=>{function Zt(){if(ut.forEach(function(te){const ae=at.get(te).currentProgram;(ae===void 0||ae.isReady())&&ut.delete(te)}),ut.size===0){ft(R);return}setTimeout(Zt,10)}de.get("KHR_parallel_shader_compile")!==null?Zt():setTimeout(Zt,10)})};let ka=null;function ga(R){ka&&ka(R)}function Rs(){Xi.stop()}function Wa(){Xi.start()}const Xi=new kS;Xi.setAnimationLoop(ga),typeof self<"u"&&Xi.setContext(self),this.setAnimationLoop=function(R){ka=R,Qt.setAnimationLoop(R),R===null?Xi.stop():Xi.start()},Qt.addEventListener("sessionstart",Rs),Qt.addEventListener("sessionend",Wa),this.render=function(R,W){if(W!==void 0&&W.isCamera!==!0){Ge("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(G===!0)return;K!==null&&K.renderStart(R,W);const mt=Qt.enabled===!0&&Qt.isPresenting===!0,ut=D!==null&&(ct===null||mt)&&D.begin(H,ct);if(R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),W.parent===null&&W.matrixWorldAutoUpdate===!0&&W.updateMatrixWorld(),Qt.enabled===!0&&Qt.isPresenting===!0&&(D===null||D.isCompositing()===!1)&&(Qt.cameraAutoUpdate===!0&&Qt.updateCamera(W),W=Qt.getCamera()),R.isScene===!0&&R.onBeforeRender(H,R,W,ct),L=kt.get(R,T.length),L.init(W),L.state.textureUnits=vt.getTextureUnits(),T.push(L),Nt.multiplyMatrices(W.projectionMatrix,W.matrixWorldInverse),xt.setFromProjectionMatrix(Nt,la,W.reversedDepth),Ut=this.localClippingEnabled,Ct=$t.init(this.clippingPlanes,Ut),U=qt.get(R,P.length),U.init(),P.push(U),Qt.enabled===!0&&Qt.isPresenting===!0){const te=H.xr.getDepthSensingMesh();te!==null&&Lo(te,W,-1/0,H.sortObjects)}Lo(R,W,0,H.sortObjects),U.finish(),K!==null&&K.updateLights(L.state.lightsArray),H.sortObjects===!0&&U.sort(st,wt),gt=Qt.enabled===!1||Qt.isPresenting===!1||Qt.hasDepthSensing()===!1,gt&&Se.addToRenderList(U,R),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ct===!0&&$t.beginShadows();const ft=L.state.shadowsArray;if(me.render(ft,R,W),Ct===!0&&$t.endShadows(),(ut&&D.hasRenderPass())===!1){const te=U.opaque,Gt=U.transmissive;if(L.setupLights(),W.isArrayCamera){const ae=W.cameras;if(Gt.length>0)for(let oe=0,ve=ae.length;oe<ve;oe++){const Me=ae[oe];vr(te,Gt,R,Me)}gt&&Se.render(R);for(let oe=0,ve=ae.length;oe<ve;oe++){const Me=ae[oe];Uo(U,R,Me,Me.viewport)}}else Gt.length>0&&vr(te,Gt,R,W),gt&&Se.render(R),Uo(U,R,W)}ct!==null&&Q===0&&(vt.updateMultisampleRenderTarget(ct),vt.updateRenderTargetMipmap(ct)),ut&&D.end(H),R.isScene===!0&&R.onAfterRender(H,R,W),jt.resetDefaultState(),lt=-1,pt=null,T.pop(),T.length>0?(L=T[T.length-1],vt.setTextureUnits(L.state.textureUnits),Ct===!0&&$t.setGlobalState(H.clippingPlanes,L.state.camera)):L=null,P.pop(),P.length>0?U=P[P.length-1]:U=null,K!==null&&K.renderEnd()};function Lo(R,W,mt,ut){if(R.visible===!1)return;if(R.layers.test(W.layers)){if(R.isGroup)mt=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(W);else if(R.isLightProbeGrid)L.pushLightProbeGrid(R);else if(R.isLight)L.pushLight(R),R.castShadow&&L.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||R.intersectsFrustum(xt)){ut&&se.setFromMatrixPosition(R.matrixWorld).applyMatrix4(Nt);const te=Rt.update(R),Gt=R.material;Gt.visible&&U.push(R,te,Gt,mt,se.z,null,W)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||R.intersectsFrustum(xt))){const te=Rt.update(R),Gt=R.material;if(ut&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),se.copy(R.boundingSphere.center)):(te.boundingSphere===null&&te.computeBoundingSphere(),se.copy(te.boundingSphere.center)),se.applyMatrix4(R.matrixWorld).applyMatrix4(Nt)),Array.isArray(Gt)){const ae=te.groups;for(let oe=0,ve=ae.length;oe<ve;oe++){const Me=ae[oe],ee=Gt[Me.materialIndex];ee&&ee.visible&&U.push(R,te,ee,mt,se.z,Me,W)}}else Gt.visible&&U.push(R,te,Gt,mt,se.z,null,W)}}const Zt=R.children;for(let te=0,Gt=Zt.length;te<Gt;te++)Lo(Zt[te],W,mt,ut)}function Uo(R,W,mt,ut){const{opaque:ft,transmissive:Zt,transparent:te}=R;L.setupLightsView(mt),Ct===!0&&$t.setGlobalState(H.clippingPlanes,mt),ut&&E.viewport(yt.copy(ut)),ft.length>0&&ki(ft,W,mt),Zt.length>0&&ki(Zt,W,mt),te.length>0&&ki(te,W,mt),E.buffers.depth.setTest(!0),E.buffers.depth.setMask(!0),E.buffers.color.setMask(!0),E.setPolygonOffset(!1)}function vr(R,W,mt,ut){if((mt.isScene===!0?mt.overrideMaterial:null)!==null)return;if(L.state.transmissionRenderTarget[ut.id]===void 0){const ee=de.has("EXT_color_buffer_half_float")||de.has("EXT_color_buffer_float");L.state.transmissionRenderTarget[ut.id]=new Gi(1,1,{generateMipmaps:!0,type:ee?ha:vi,minFilter:nr,samples:Math.max(4,O.samples),stencilBuffer:c,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:He.workingColorSpace})}const Zt=L.state.transmissionRenderTarget[ut.id],te=ut.viewport||yt;Zt.setSize(te.z*H.transmissionResolutionScale,te.w*H.transmissionResolutionScale);const Gt=H.getRenderTarget(),ae=H.getActiveCubeFace(),oe=H.getActiveMipmapLevel();H.setRenderTarget(Zt),H.getClearColor(V),_t=H.getClearAlpha(),_t<1&&H.setClearColor(16777215,.5),H.clear(),gt&&Se.render(mt);const ve=H.toneMapping;H.toneMapping=ca;const Me=ut.viewport;if(ut.viewport!==void 0&&(ut.viewport=void 0),L.setupLightsView(ut),Ct===!0&&$t.setGlobalState(H.clippingPlanes,ut),ki(R,mt,ut),vt.updateMultisampleRenderTarget(Zt),vt.updateRenderTargetMipmap(Zt),de.has("WEBGL_multisampled_render_to_texture")===!1){let ee=!1;for(let Le=0,we=W.length;Le<we;Le++){const je=W[Le],{object:qe,geometry:En,material:Kt,group:hn}=je;if(Kt.side===za&&qe.layers.test(ut.layers)){const Fe=Kt.side;Kt.side=Kn,Kt.needsUpdate=!0,ac(qe,mt,ut,En,Kt,hn),Kt.side=Fe,Kt.needsUpdate=!0,ee=!0}}ee===!0&&(vt.updateMultisampleRenderTarget(Zt),vt.updateRenderTargetMipmap(Zt))}H.setRenderTarget(Gt,ae,oe),H.setClearColor(V,_t),Me!==void 0&&(ut.viewport=Me),H.toneMapping=ve}function ki(R,W,mt){const ut=W.isScene===!0?W.overrideMaterial:null;for(let ft=0,Zt=R.length;ft<Zt;ft++){const te=R[ft],{object:Gt,geometry:ae,group:oe}=te;let ve=te.material;ve.allowOverride===!0&&ut!==null&&(ve=ut),Gt.layers.test(mt.layers)&&ac(Gt,W,mt,ae,ve,oe)}}function ac(R,W,mt,ut,ft,Zt){K!==null&&ft.isNodeMaterial&&K.setObject(R,ft),R.onBeforeRender(H,W,mt,ut,ft,Zt),R.modelViewMatrix.multiplyMatrices(mt.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),ft.onBeforeRender(H,W,mt,ut,R,Zt),ft.transparent===!0&&ft.side===za&&ft.forceSinglePass===!1?(ft.side=Kn,ft.needsUpdate=!0,H.renderBufferDirect(mt,W,ut,ft,R,Zt),ft.side=lr,ft.needsUpdate=!0,H.renderBufferDirect(mt,W,ut,ft,R,Zt),ft.side=za):H.renderBufferDirect(mt,W,ut,ft,R,Zt),R.onAfterRender(H,W,mt,ut,ft,Zt)}function ws(R,W,mt){W.isScene!==!0&&(W=re);const ut=at.get(R),ft=L.state.lights,Zt=L.state.shadowsArray,te=ft.state.version,Gt=Ht.getParameters(R,ft.state,Zt,W,mt,L.state.lightProbeGridArray),ae=Ht.getProgramCacheKey(Gt);let oe=ut.programs;ut.environment=R.isMeshStandardMaterial||R.isMeshLambertMaterial||R.isMeshPhongMaterial?W.environment:null,ut.fog=W.fog;const ve=R.isMeshStandardMaterial||R.isMeshLambertMaterial&&!R.envMap||R.isMeshPhongMaterial&&!R.envMap;ut.envMap=Ot.get(R.envMap||ut.environment,ve),ut.envMapRotation=ut.environment!==null&&R.envMap===null?W.environmentRotation:R.envMapRotation,oe===void 0&&(R.addEventListener("dispose",_i),oe=new Map,ut.programs=oe);let Me=oe.get(ae);if(Me!==void 0){if(ut.currentProgram===Me&&ut.lightsStateVersion===te)return Po(R,Gt),Me}else Gt.uniforms=Ht.getUniforms(R),K!==null&&R.isNodeMaterial&&K.build(R,mt,Gt),R.onBeforeCompile(Gt,H),Me=Ht.acquireProgram(Gt,ae),oe.set(ae,Me),ut.uniforms=Gt.uniforms;const ee=ut.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(ee.clippingPlanes=$t.uniform),Po(R,Gt),ut.needsLights=rc(R),ut.lightsStateVersion=te,ut.needsLights&&(ee.ambientLightColor.value=ft.state.ambient,ee.lightProbe.value=ft.state.probe,ee.sunLights.value=ft.state.sun,ee.sunLightShadows.value=ft.state.sunShadow,ee.directionalLights.value=ft.state.directional,ee.directionalLightShadows.value=ft.state.directionalShadow,ee.spotLights.value=ft.state.spot,ee.spotLightShadows.value=ft.state.spotShadow,ee.rectAreaLights.value=ft.state.rectArea,ee.ltc_1.value=ft.state.rectAreaLTC1,ee.ltc_2.value=ft.state.rectAreaLTC2,ee.pointLights.value=ft.state.point,ee.pointLightShadows.value=ft.state.pointShadow,ee.hemisphereLights.value=ft.state.hemi,ee.sunShadowMatrix.value=ft.state.sunShadowMatrix,ee.sunShadowCascade.value=ft.state.sunShadowCascade,ee.directionalShadowMatrix.value=ft.state.directionalShadowMatrix,ee.spotLightMatrix.value=ft.state.spotLightMatrix,ee.spotLightMap.value=ft.state.spotLightMap,ee.pointShadowMatrix.value=ft.state.pointShadowMatrix),ut.lightProbeGrid=L.state.lightProbeGridArray.length>0,ut.currentProgram=Me,ut.uniformsList=null,Me}function Oo(R){if(R.uniformsList===null){const W=R.currentProgram.getUniforms();R.uniformsList=of.seqWithValue(W.seq,R.uniforms)}return R.uniformsList}function Po(R,W){const mt=at.get(R);mt.outputColorSpace=W.outputColorSpace,mt.batching=W.batching,mt.batchingColor=W.batchingColor,mt.instancing=W.instancing,mt.instancingColor=W.instancingColor,mt.instancingMorph=W.instancingMorph,mt.skinning=W.skinning,mt.morphTargets=W.morphTargets,mt.morphNormals=W.morphNormals,mt.morphColors=W.morphColors,mt.morphTargetsCount=W.morphTargetsCount,mt.numClippingPlanes=W.numClippingPlanes,mt.numIntersection=W.numClipIntersection,mt.vertexAlphas=W.vertexAlphas,mt.vertexTangents=W.vertexTangents,mt.toneMapping=W.toneMapping}function Io(R,W){if(R.length===0)return null;if(R.length===1)return R[0].texture!==null?R[0]:null;A.setFromMatrixPosition(W.matrixWorld);for(let mt=0,ut=R.length;mt<ut;mt++){const ft=R[mt];if(ft.texture!==null&&ft.boundingBox.containsPoint(A))return ft}return null}function zo(R,W,mt,ut,ft){W.isScene!==!0&&(W=re),vt.resetTextureUnits();const Zt=W.fog,te=ut.isMeshStandardMaterial||ut.isMeshLambertMaterial||ut.isMeshPhongMaterial?W.environment:null,Gt=ct===null?H.outputColorSpace:ct.isXRRenderTarget===!0?ct.texture.colorSpace:He.workingColorSpace,ae=ut.isMeshStandardMaterial||ut.isMeshLambertMaterial&&!ut.envMap||ut.isMeshPhongMaterial&&!ut.envMap,oe=Ot.get(ut.envMap||te,ae),ve=ut.vertexColors===!0&&!!mt.attributes.color&&mt.attributes.color.itemSize===4,Me=!!mt.attributes.tangent&&(!!ut.normalMap||ut.anisotropy>0),ee=!!mt.morphAttributes.position,Le=!!mt.morphAttributes.normal,we=!!mt.morphAttributes.color;let je=ca;ut.toneMapped&&(ct===null||ct.isXRRenderTarget===!0)&&(je=H.toneMapping);const qe=mt.morphAttributes.position||mt.morphAttributes.normal||mt.morphAttributes.color,En=qe!==void 0?qe.length:0,Kt=at.get(ut),hn=L.state.lights;if(Ct===!0&&(Ut===!0||R!==pt)){const Pe=R===pt&&ut.id===lt;$t.setState(ut,R,Pe)}let Fe=!1;ut.version===Kt.__version?(Kt.needsLights&&Kt.lightsStateVersion!==hn.state.version||Kt.outputColorSpace!==Gt||ft.isBatchedMesh&&Kt.batching===!1||!ft.isBatchedMesh&&Kt.batching===!0||ft.isBatchedMesh&&Kt.batchingColor===!0&&ft._colorsTexture===null||ft.isBatchedMesh&&Kt.batchingColor===!1&&ft._colorsTexture!==null||ft.isInstancedMesh&&Kt.instancing===!1||!ft.isInstancedMesh&&Kt.instancing===!0||ft.isSkinnedMesh&&Kt.skinning===!1||!ft.isSkinnedMesh&&Kt.skinning===!0||ft.isInstancedMesh&&Kt.instancingColor===!0&&ft.instanceColor===null||ft.isInstancedMesh&&Kt.instancingColor===!1&&ft.instanceColor!==null||ft.isInstancedMesh&&Kt.instancingMorph===!0&&ft.morphTexture===null||ft.isInstancedMesh&&Kt.instancingMorph===!1&&ft.morphTexture!==null||Kt.envMap!==oe||ut.fog===!0&&Kt.fog!==Zt||Kt.numClippingPlanes!==void 0&&(Kt.numClippingPlanes!==$t.numPlanes||Kt.numIntersection!==$t.numIntersection)||Kt.vertexAlphas!==ve||Kt.vertexTangents!==Me||Kt.morphTargets!==ee||Kt.morphNormals!==Le||Kt.morphColors!==we||Kt.toneMapping!==je||Kt.morphTargetsCount!==En||!!Kt.lightProbeGrid!=L.state.lightProbeGridArray.length>0)&&(Fe=!0):(Fe=!0,Kt.__version=ut.version);let Xn=Kt.currentProgram;Fe===!0&&(Xn=ws(ut,W,ft),K&&ut.isNodeMaterial&&K.onUpdateProgram(ut,Xn,Kt));let ri=!1,Wi=!1,Ce=!1;const Xe=Xn.getUniforms(),an=Kt.uniforms;if(E.useProgram(Xn.program)&&(ri=!0,Wi=!0,Ce=!0),ut.id!==lt&&(lt=ut.id,Wi=!0),Kt.needsLights){const Pe=Io(L.state.lightProbeGridArray,ft);Kt.lightProbeGrid!==Pe&&(Kt.lightProbeGrid=Pe,Wi=!0)}if(ri||pt!==R){E.buffers.depth.getReversed()&&R.reversedDepth!==!0&&(R._reversedDepth=!0,R.updateProjectionMatrix()),Xe.setValue(z,"projectionMatrix",R.projectionMatrix),Xe.setValue(z,"viewMatrix",R.matrixWorldInverse);const dn=Xe.map.cameraPosition;dn!==void 0&&dn.setValue(z,Dt.setFromMatrixPosition(R.matrixWorld)),O.logarithmicDepthBuffer&&Xe.setValue(z,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(ut.isMeshPhongMaterial||ut.isMeshToonMaterial||ut.isMeshLambertMaterial||ut.isMeshBasicMaterial||ut.isMeshStandardMaterial||ut.isShaderMaterial)&&Xe.setValue(z,"isOrthographic",R.isOrthographicCamera===!0),pt!==R&&(pt=R,Wi=!0,Ce=!0)}if(Kt.needsLights&&(hn.state.sunShadowMap.length>0&&Xe.setValue(z,"sunShadowMap",hn.state.sunShadowMap,vt),hn.state.directionalShadowMap.length>0&&Xe.setValue(z,"directionalShadowMap",hn.state.directionalShadowMap,vt),hn.state.spotShadowMap.length>0&&Xe.setValue(z,"spotShadowMap",hn.state.spotShadowMap,vt),hn.state.pointShadowMap.length>0&&Xe.setValue(z,"pointShadowMap",hn.state.pointShadowMap,vt)),ft.isSkinnedMesh){Xe.setOptional(z,ft,"bindMatrix"),Xe.setOptional(z,ft,"bindMatrixInverse");const Pe=ft.skeleton;Pe&&(Pe.boneTexture===null&&Pe.computeBoneTexture(),Xe.setValue(z,"boneTexture",Pe.boneTexture,vt))}ft.isBatchedMesh&&(Xe.setOptional(z,ft,"batchingTexture"),Xe.setValue(z,"batchingTexture",ft._matricesTexture,vt),Xe.setOptional(z,ft,"batchingIdTexture"),Xe.setValue(z,"batchingIdTexture",ft._indirectTexture,vt),Xe.setOptional(z,ft,"batchingColorTexture"),ft._colorsTexture!==null&&Xe.setValue(z,"batchingColorTexture",ft._colorsTexture,vt));const oi=mt.morphAttributes;if((oi.position!==void 0||oi.normal!==void 0||oi.color!==void 0)&&Z.update(ft,mt,Xn),(Wi||Kt.receiveShadow!==ft.receiveShadow)&&(Kt.receiveShadow=ft.receiveShadow,Xe.setValue(z,"receiveShadow",ft.receiveShadow)),(ut.isMeshStandardMaterial||ut.isMeshLambertMaterial||ut.isMeshPhongMaterial)&&ut.envMap===null&&W.environment!==null&&(an.envMapIntensity.value=W.environmentIntensity),an.dfgLUT!==void 0&&(an.dfgLUT.value=vC()),Wi){if(Xe.setValue(z,"toneMappingExposure",H.toneMappingExposure),Kt.needsLights&&sc(an,Ce),Zt&&ut.fog===!0&&he.refreshFogUniforms(an,Zt),he.refreshMaterialUniforms(an,ut,F,J,L.state.transmissionRenderTarget[R.id]),Kt.needsLights&&Kt.lightProbeGrid){const Pe=Kt.lightProbeGrid;an.probesSH.value=Pe.texture,an.probesMin.value.copy(Pe.boundingBox.min),an.probesMax.value.copy(Pe.boundingBox.max),an.probesResolution.value.copy(Pe.resolution)}of.upload(z,Oo(Kt),an,vt)}if(ut.isShaderMaterial&&ut.uniformsNeedUpdate===!0&&(of.upload(z,Oo(Kt),an,vt),ut.uniformsNeedUpdate=!1),ut.isSpriteMaterial&&Xe.setValue(z,"center",ft.center),Xe.setValue(z,"modelViewMatrix",ft.modelViewMatrix),Xe.setValue(z,"normalMatrix",ft.normalMatrix),Xe.setValue(z,"modelMatrix",ft.matrixWorld),ut.uniformsGroups!==void 0){const Pe=ut.uniformsGroups;for(let dn=0,va=Pe.length;dn<va;dn++){const oc=Pe[dn];Lt.update(oc,Xn),Lt.bind(oc,Xn)}}return Xn}function sc(R,W){R.ambientLightColor.needsUpdate=W,R.lightProbe.needsUpdate=W,R.sunLights.needsUpdate=W,R.sunLightShadows.needsUpdate=W,R.directionalLights.needsUpdate=W,R.directionalLightShadows.needsUpdate=W,R.pointLights.needsUpdate=W,R.pointLightShadows.needsUpdate=W,R.spotLights.needsUpdate=W,R.spotLightShadows.needsUpdate=W,R.rectAreaLights.needsUpdate=W,R.hemisphereLights.needsUpdate=W}function rc(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return k},this.getActiveMipmapLevel=function(){return Q},this.getRenderTarget=function(){return ct},this.setRenderTargetTextures=function(R,W,mt){const ut=at.get(R);ut.__autoAllocateDepthBuffer=R.resolveDepthBuffer===!1,ut.__autoAllocateDepthBuffer===!1&&(ut.__useRenderToTexture=!1),at.get(R.texture).__webglTexture=W,at.get(R.depthTexture).__webglTexture=ut.__autoAllocateDepthBuffer?void 0:mt,ut.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(R,W){const mt=at.get(R);mt.__webglFramebuffer=W,mt.__useDefaultFramebuffer=W===void 0},this.setRenderTarget=function(R,W=0,mt=0){ct=R,k=W,Q=mt;let ut=null,ft=!1,Zt=!1;if(R){const Gt=at.get(R);if(Gt.__useDefaultFramebuffer!==void 0){E.bindFramebuffer(z.FRAMEBUFFER,Gt.__webglFramebuffer),yt.copy(R.viewport),Yt.copy(R.scissor),Wt=R.scissorTest,E.viewport(yt),E.scissor(Yt),E.setScissorTest(Wt),lt=-1;return}else if(Gt.__webglFramebuffer===void 0)vt.setupRenderTarget(R);else if(Gt.__hasExternalTextures)vt.rebindTextures(R,at.get(R.texture).__webglTexture,at.get(R.depthTexture).__webglTexture);else if(R.depthBuffer){const ve=R.depthTexture;if(Gt.__boundDepthTexture!==ve){if(ve!==null&&at.has(ve)&&(R.width!==ve.image.width||R.height!==ve.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");vt.setupDepthRenderbuffer(R)}}const ae=R.texture;(ae.isData3DTexture||ae.isDataArrayTexture||ae.isCompressedArrayTexture)&&(Zt=!0);const oe=at.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(oe[W])?ut=oe[W][mt]:ut=oe[W],ft=!0):R.samples>0&&vt.useMultisampledRTT(R)===!1?ut=at.get(R).__webglMultisampledFramebuffer:Array.isArray(oe)?ut=oe[mt]:ut=oe,yt.copy(R.viewport),Yt.copy(R.scissor),Wt=R.scissorTest}else yt.copy(rt).multiplyScalar(F).floor(),Yt.copy(At).multiplyScalar(F).floor(),Wt=fe;if(mt!==0&&(ut=it),E.bindFramebuffer(z.FRAMEBUFFER,ut)&&E.drawBuffers(R,ut),E.viewport(yt),E.scissor(Yt),E.setScissorTest(Wt),ft){const Gt=at.get(R.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+W,Gt.__webglTexture,mt)}else if(Zt){const Gt=W;for(let ae=0;ae<R.textures.length;ae++){const oe=at.get(R.textures[ae]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+ae,oe.__webglTexture,mt,Gt)}}else if(R!==null&&mt!==0){const Gt=at.get(R.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,Gt.__webglTexture,mt)}lt=-1};function xi(R){const W=at.get(R);return(W.__readFormat!==R.format||W.__readType!==R.type)&&(W.__readFormat=R.format,W.__readType=R.type,W.__formatReadable=O.textureFormatReadable(R.format),W.__typeReadable=O.textureTypeReadable(R.type)),W}this.readRenderTargetPixels=function(R,W,mt,ut,ft,Zt,te,Gt=0){if(!(R&&R.isWebGLRenderTarget)){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ae=at.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&te!==void 0&&(ae=ae[te]),ae){E.bindFramebuffer(z.FRAMEBUFFER,ae);try{const oe=R.textures[Gt],ve=oe.format,Me=oe.type;R.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+Gt);const ee=xi(oe);if(ee.__formatReadable===!1){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(ee.__typeReadable===!1){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}W>=0&&W<=R.width-ut&&mt>=0&&mt<=R.height-ft&&z.readPixels(W,mt,ut,ft,Vt.convert(ve),Vt.convert(Me),Zt)}finally{const oe=ct!==null?at.get(ct).__webglFramebuffer:null;E.bindFramebuffer(z.FRAMEBUFFER,oe)}}},this.readRenderTargetPixelsAsync=async function(R,W,mt,ut,ft,Zt,te,Gt=0){if(!(R&&R.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ae=at.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&te!==void 0&&(ae=ae[te]),ae)if(W>=0&&W<=R.width-ut&&mt>=0&&mt<=R.height-ft){E.bindFramebuffer(z.FRAMEBUFFER,ae);const oe=R.textures[Gt],ve=oe.format,Me=oe.type;R.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+Gt);const ee=xi(oe);if(ee.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(ee.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Le=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,Le),z.bufferData(z.PIXEL_PACK_BUFFER,Zt.byteLength,z.STREAM_READ),z.readPixels(W,mt,ut,ft,Vt.convert(ve),Vt.convert(Me),0),z.bindBuffer(z.PIXEL_PACK_BUFFER,null);const we=ct!==null?at.get(ct).__webglFramebuffer:null;E.bindFramebuffer(z.FRAMEBUFFER,we);const je=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await Kb(z,je,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,Le),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,Zt),z.bindBuffer(z.PIXEL_PACK_BUFFER,null),z.deleteBuffer(Le),z.deleteSync(je),Zt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(R,W=null,mt=0){const ut=Math.pow(2,-mt),ft=Math.floor(R.image.width*ut),Zt=Math.floor(R.image.height*ut),te=W!==null?W.x:0,Gt=W!==null?W.y:0;vt.setTexture2D(R,0),z.copyTexSubImage2D(z.TEXTURE_2D,mt,0,0,te,Gt,ft,Zt),E.unbindTexture()},this.copyTextureToTexture=function(R,W,mt=null,ut=null,ft=0,Zt=0){let te,Gt,ae,oe,ve,Me,ee,Le,we;const je=R.isCompressedTexture?R.mipmaps[Zt]:R.image;if(mt!==null)te=mt.max.x-mt.min.x,Gt=mt.max.y-mt.min.y,ae=mt.isBox3?mt.max.z-mt.min.z:1,oe=mt.min.x,ve=mt.min.y,Me=mt.isBox3?mt.min.z:0;else{const an=Math.pow(2,-ft);te=Math.floor(je.width*an),Gt=Math.floor(je.height*an),R.isDataArrayTexture?ae=je.depth:R.isData3DTexture?ae=Math.floor(je.depth*an):ae=1,oe=0,ve=0,Me=0}ut!==null?(ee=ut.x,Le=ut.y,we=ut.z):(ee=0,Le=0,we=0);const qe=Vt.convert(W.format),En=Vt.convert(W.type);let Kt;W.isData3DTexture?(vt.setTexture3D(W,0),Kt=z.TEXTURE_3D):W.isDataArrayTexture||W.isCompressedArrayTexture?(vt.setTexture2DArray(W,0),Kt=z.TEXTURE_2D_ARRAY):(vt.setTexture2D(W,0),Kt=z.TEXTURE_2D),E.activeTexture(z.TEXTURE0),E.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,W.flipY),E.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,W.premultiplyAlpha),E.pixelStorei(z.UNPACK_ALIGNMENT,W.unpackAlignment);const hn=E.getParameter(z.UNPACK_ROW_LENGTH),Fe=E.getParameter(z.UNPACK_IMAGE_HEIGHT),Xn=E.getParameter(z.UNPACK_SKIP_PIXELS),ri=E.getParameter(z.UNPACK_SKIP_ROWS),Wi=E.getParameter(z.UNPACK_SKIP_IMAGES);E.pixelStorei(z.UNPACK_ROW_LENGTH,je.width),E.pixelStorei(z.UNPACK_IMAGE_HEIGHT,je.height),E.pixelStorei(z.UNPACK_SKIP_PIXELS,oe),E.pixelStorei(z.UNPACK_SKIP_ROWS,ve),E.pixelStorei(z.UNPACK_SKIP_IMAGES,Me);const Ce=R.isDataArrayTexture||R.isData3DTexture,Xe=W.isDataArrayTexture||W.isData3DTexture;if(R.isDepthTexture){const an=at.get(R),oi=at.get(W),Pe=at.get(an.__renderTarget),dn=at.get(oi.__renderTarget);E.bindFramebuffer(z.READ_FRAMEBUFFER,Pe.__webglFramebuffer),E.bindFramebuffer(z.DRAW_FRAMEBUFFER,dn.__webglFramebuffer);for(let va=0;va<ae;va++)Ce&&(z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,at.get(R).__webglTexture,ft,Me+va),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,at.get(W).__webglTexture,Zt,we+va)),z.blitFramebuffer(oe,ve,te,Gt,ee,Le,te,Gt,z.DEPTH_BUFFER_BIT,z.NEAREST);E.bindFramebuffer(z.READ_FRAMEBUFFER,null),E.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(ft!==0||R.isRenderTargetTexture||at.has(R)){const an=at.get(R),oi=at.get(W);E.bindFramebuffer(z.READ_FRAMEBUFFER,X),E.bindFramebuffer(z.DRAW_FRAMEBUFFER,j);for(let Pe=0;Pe<ae;Pe++)Ce?z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,an.__webglTexture,ft,Me+Pe):z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,an.__webglTexture,ft),Xe?z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,oi.__webglTexture,Zt,we+Pe):z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,oi.__webglTexture,Zt),ft!==0?z.blitFramebuffer(oe,ve,te,Gt,ee,Le,te,Gt,z.COLOR_BUFFER_BIT,z.NEAREST):Xe?z.copyTexSubImage3D(Kt,Zt,ee,Le,we+Pe,oe,ve,te,Gt):z.copyTexSubImage2D(Kt,Zt,ee,Le,oe,ve,te,Gt);E.bindFramebuffer(z.READ_FRAMEBUFFER,null),E.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else Xe?R.isDataTexture||R.isData3DTexture?z.texSubImage3D(Kt,Zt,ee,Le,we,te,Gt,ae,qe,En,je.data):W.isCompressedArrayTexture?z.compressedTexSubImage3D(Kt,Zt,ee,Le,we,te,Gt,ae,qe,je.data):z.texSubImage3D(Kt,Zt,ee,Le,we,te,Gt,ae,qe,En,je):R.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,Zt,ee,Le,te,Gt,qe,En,je.data):R.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,Zt,ee,Le,je.width,je.height,qe,je.data):z.texSubImage2D(z.TEXTURE_2D,Zt,ee,Le,te,Gt,qe,En,je);E.pixelStorei(z.UNPACK_ROW_LENGTH,hn),E.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Fe),E.pixelStorei(z.UNPACK_SKIP_PIXELS,Xn),E.pixelStorei(z.UNPACK_SKIP_ROWS,ri),E.pixelStorei(z.UNPACK_SKIP_IMAGES,Wi),Zt===0&&W.generateMipmaps&&z.generateMipmap(Kt),E.unbindTexture()},this.initRenderTarget=function(R){at.get(R).__webglFramebuffer===void 0&&vt.setupRenderTarget(R)},this.initTexture=function(R){R.isCubeTexture?vt.setTextureCube(R,0):R.isData3DTexture?vt.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?vt.setTexture2DArray(R,0):vt.setTexture2D(R,0),E.unbindTexture()},this.resetState=function(){k=0,Q=0,ct=null,E.reset(),jt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return la}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const i=this.getContext();i.drawingBufferColorSpace=He._getDrawingBufferColorSpace(t),i.unpackColorSpace=He._getUnpackColorSpace()}}class xC extends AS{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;const t=new mr;t.deleteAttribute("uv");const i=new oa({side:Kn}),s=new oa,l=new m2(16777215,900,28,2);l.position.set(.418,16.199,.3),this.add(l);const c=new We(t,i);c.position.set(-.757,13.219,.717),c.scale.set(31.713,28.305,28.591),this.add(c);const f=new xT(t,s,6),d=new Mn;d.position.set(-10.906,2.009,1.846),d.rotation.set(0,-.195,0),d.scale.set(2.328,7.905,4.651),d.updateMatrix(),f.setMatrixAt(0,d.matrix),d.position.set(-5.607,-.754,-.758),d.rotation.set(0,.994,0),d.scale.set(1.97,1.534,3.955),d.updateMatrix(),f.setMatrixAt(1,d.matrix),d.position.set(6.167,.857,7.803),d.rotation.set(0,.561,0),d.scale.set(3.927,6.285,3.687),d.updateMatrix(),f.setMatrixAt(2,d.matrix),d.position.set(-2.017,.018,6.124),d.rotation.set(0,.333,0),d.scale.set(2.002,4.566,2.064),d.updateMatrix(),f.setMatrixAt(3,d.matrix),d.position.set(2.291,-.756,-2.621),d.rotation.set(0,-.286,0),d.scale.set(1.546,1.552,1.496),d.updateMatrix(),f.setMatrixAt(4,d.matrix),d.position.set(-2.193,-.369,-5.547),d.rotation.set(0,.516,0),d.scale.set(3.875,3.487,2.986),d.updateMatrix(),f.setMatrixAt(5,d.matrix),this.add(f);const m=new We(t,_o(50));m.position.set(-16.116,14.37,8.208),m.scale.set(.1,2.428,2.739),this.add(m);const p=new We(t,_o(50));p.position.set(-16.109,18.021,-8.207),p.scale.set(.1,2.425,2.751),this.add(p);const _=new We(t,_o(17));_.position.set(14.904,12.198,-1.832),_.scale.set(.15,4.265,6.331),this.add(_);const v=new We(t,_o(43));v.position.set(-.462,8.89,14.52),v.scale.set(4.38,5.441,.088),this.add(v);const g=new We(t,_o(20));g.position.set(3.235,11.486,-12.541),g.scale.set(2.5,2,.1),this.add(g);const y=new We(t,_o(100));y.position.set(0,20,0),y.scale.set(1,.1,1),this.add(y)}dispose(){const t=new Set;this.traverse(i=>{i.isMesh&&(t.add(i.geometry),t.add(i.material))});for(const i of t)i.dispose()}}function _o(r){return new l2({color:0,emissive:16777215,emissiveIntensity:r})}const H1=.9,ju=(r,t,i)=>r+(t-r)*i,SC=r=>Math.atan2(Math.sin(r),Math.cos(r));function yC(r,t,i,s,l){const c=Math.tan(s*Math.PI/360),f=c*l,d=[Math.sin(t)*Math.cos(i),Math.sin(i),Math.cos(t)*Math.cos(i)],m=d.map(C=>-C),p=Math.hypot(m[2],m[0])||1,_=[-m[2]/p,0,m[0]/p],v=[_[1]*m[2]-_[2]*m[1],_[2]*m[0]-_[0]*m[2],_[0]*m[1]-_[1]*m[0]],g=C=>r.every(M=>{const S=M.map((U,L)=>U-d[L]*C),N=S[0]*m[0]+S[1]*m[1]+S[2]*m[2];if(N<=.05)return!1;const I=(S[0]*_[0]+S[2]*_[2])/(N*f),A=(S[0]*v[0]+S[1]*v[1]+S[2]*v[2])/(N*c);return Math.abs(I)<=H1&&Math.abs(A)<=H1});let y=.1,b=60;for(let C=0;C<40;C+=1){const M=(y+b)/2;g(M)?b=M:y=M}return b}function MC(r,t,i){const s=Math.min(1,Math.max(0,i));return{target:r.target.map((l,c)=>ju(l,t.target[c],s)),azimuth:r.azimuth+SC(t.azimuth-r.azimuth)*s,elevation:ju(r.elevation,t.elevation,s),distance:Math.exp(ju(Math.log(r.distance),Math.log(t.distance),s)),fov:ju(r.fov,t.fov,s)}}function EC(r){const{target:t,azimuth:i,elevation:s,distance:l}=r;return{position:[t[0]+l*Math.sin(i)*Math.cos(s),t[1]+l*Math.sin(s),t[2]+l*Math.cos(i)*Math.cos(s)],target:t}}const zm="#f6f2e8",bC="#111214",f0=(r,t)=>{const i=document.createElement("canvas");return i.width=r,i.height=t,{canvas:i,context:i.getContext("2d")}},h0=(r,t,i,s)=>{var c;const l=new yT(r);return l.colorSpace=ni,l.anisotropy=8,t(),i&&((c=document.fonts)!=null&&c.load)&&document.fonts.load(i).then(()=>{t(),l.needsUpdate=!0,s==null||s()}).catch(()=>{}),l},TC=(r,t,i,s)=>{const{canvas:l,context:c}=f0(1024,512),f=`700 88px ${i}`;return h0(l,()=>{const m=r>8;c.fillStyle=m?zm:t,c.fillRect(0,0,1024,512),m&&(c.fillStyle=t,c.fillRect(0,120,1024,272));for(const p of[256,768])c.fillStyle=zm,c.beginPath(),c.arc(p,256,82,0,Math.PI*2),c.fill(),c.fillStyle=bC,c.font=f,c.textAlign="center",c.textBaseline="middle",c.fillText(String(r),p,262)},f,s)},AC=()=>{const{canvas:r,context:t}=f0(512,256);return h0(r,()=>{t.fillStyle=zm,t.fillRect(0,0,512,256),t.fillStyle="#c4442b";for(const s of[128,384])t.beginPath(),t.arc(s,128,9,0,Math.PI*2),t.fill()})},V1=(r,t)=>{const{canvas:s,context:l}=f0(512,512),c=Hm(4242),f=new be(t),m=h0(s,()=>{if(l.fillStyle=f.getStyle(),l.fillRect(0,0,512,512),r==="wood")for(let g=0;g<6;g+=1){const y=f.clone().offsetHSL(0,0,(c()-.5)*.08);l.fillStyle=y.getStyle(),l.fillRect(g*(512/6),0,512/6-2,512),l.strokeStyle="rgba(0,0,0,0.06)";for(let b=0;b<14;b+=1){const C=g*85.33333333333333+c()*85.33333333333333;l.lineWidth=1+c()*2,l.beginPath(),l.moveTo(C,0),l.bezierCurveTo(C+6,512*.3,C-6,512*.6,C,512),l.stroke()}}const p=l.getImageData(0,0,512,512),_=r==="felt"?14:8;for(let v=0;v<p.data.length;v+=4){const g=(c()-.5)*_;p.data[v]+=g,p.data[v+1]+=g,p.data[v+2]+=g}l.putImageData(p,0,0)});return m.wrapS=Zl,m.wrapT=Zl,m},jS=Object.freeze(["#f5b818","#1b46a2","#cb242a","#59287a","#e76317","#126d40","#7a1d33","#0a0c0a","#f5b818","#1b46a2","#cb242a","#59287a","#e76317","#126d40","#7a1d33"]),sa=wo.ball.radius,Ga=.05,RC=.044,d0=.14,Bm=.052,vf=-.08,G1="#0f5e3c",X1="#5b331c",k1=1.2,zl=typeof window<"u"&&window.matchMedia("(hover: none) and (pointer: coarse)").matches,sr=tn.halfWidth+Ga+d0,rr=tn.halfLength+Ga+d0,Fp="#f2f1e9",W1="#ff5a4f",Hp=(r,t)=>Math.abs(r-t)<1e-9,$S=(r,t,i=[])=>{const s=new zS(r.map(c=>new Bt(c.x,-c.z)));for(const c of i)s.holes.push(new Nm(c.map(f=>new Bt(f.x,-f.z))));const l=new o0(s,{depth:t,bevelEnabled:!1,curveSegments:4});return l.rotateX(-Math.PI/2),l},wC=(r,t)=>{const i=tn.segments.filter(s=>s.type!=="cushion");for(const s of tn.segments.filter(l=>l.type==="cushion")){const l=Hp(s.az,s.bz),c=l?{x:0,z:Math.sign(s.az)}:{x:Math.sign(s.ax),z:0},f=(y,b)=>i.find(C=>Hp(C.ax,y)&&Hp(C.az,b)),d=f(s.ax,s.az),m=f(s.bx,s.bz),p=d?{x:d.bx,z:d.bz}:{x:s.ax,z:s.az},_=m?{x:m.bx,z:m.bz}:{x:s.bx,z:s.bz},v=y=>l?{x:y.x,z:s.az+c.z*Ga}:{x:s.ax+c.x*Ga,z:y.z},g=new We($S([p,{x:s.ax,z:s.az},{x:s.bx,z:s.bz},_,v(_),v(p)],RC),t);g.castShadow=!0,g.receiveShadow=!0,r.add(g)}},CC=(r,t)=>{const i=tn.halfWidth+Ga,s=tn.halfLength+Ga,l=[{x:-i,z:-s},{x:i,z:-s},{x:i,z:s},{x:-i,z:s}],c=[];for(let g=0;g<4;g+=1){const y=l[g],b=l[(g+1)%4],C=Math.ceil(Math.hypot(b.x-y.x,b.z-y.z)/.004);for(let M=0;M<C;M+=1){let S={x:y.x+(b.x-y.x)*(M/C),z:y.z+(b.z-y.z)*(M/C)};for(const N of tn.pockets){const I=N.radius*1.18,A=Math.hypot(S.x-N.x,S.z-N.z);if(A<I){const U=I/Math.max(A,1e-6);S={x:N.x+(S.x-N.x)*U,z:N.z+(S.z-N.z)*U}}}c.push(S)}}const f=[{x:-sr,z:-rr},{x:sr,z:-rr},{x:sr,z:rr},{x:-sr,z:rr}],d=new We($S(f,Bm-vf,[c]),t);d.position.y=vf,d.castShadow=!0,d.receiveShadow=!0,r.add(d);const m=new oa({color:"#efe6cf",roughness:.3,metalness:.3}),p=new Sf(.008,16);p.rotateX(-Math.PI/2);const _=Ga+d0/2,v=(g,y)=>{const b=new We(p,m);b.position.set(g,Bm+5e-4,y),r.add(b)};for(let g=1;g<8;g+=1){if(g===4)continue;const y=-tn.halfLength+g/8*tn.halfLength*2;v(-tn.halfWidth-_,y),v(tn.halfWidth+_,y)}for(let g=1;g<4;g+=1){const y=-tn.halfWidth+g/4*tn.halfWidth*2;v(y,-tn.halfLength-_),v(y,tn.halfLength+_)}},NC=()=>{const r=new ar,t=V1("felt",G1);t.repeat.set(3,6);const i=new We(new hr((tn.halfWidth+Ga)*2,(tn.halfLength+Ga)*2),new oa({map:t,roughness:.95}));i.rotation.x=-Math.PI/2,i.receiveShadow=!0,r.add(i);const s=new or({color:"#020302"});for(const m of tn.pockets){const p=new We(new Sf(m.radius*1.18,40),s);p.rotation.x=-Math.PI/2,p.position.set(m.x,6e-4,m.z),r.add(p)}const l=new oa({color:new be(G1).multiplyScalar(.82),roughness:.92});wC(r,l);const c=V1("wood",X1);c.repeat.set(1.6,1.6),CC(r,new oa({map:c,roughness:.38,metalness:.05}));const f=new We(new mr(sr*2-.06,.62,rr*2-.06),new oa({color:new be(X1).multiplyScalar(.45),roughness:.6}));f.position.y=vf-.31,f.receiveShadow=!0,r.add(f);const d=new We(new hr(40,40),new oa({color:"#0b100d",roughness:1}));return d.rotation.x=-Math.PI/2,d.position.y=-.78,d.receiveShadow=!0,r.add(d),r},$u=(r,t)=>{const i=new hr(1,1);i.rotateX(-Math.PI/2),i.translate(.5,0,0);const s=new We(i,new or({color:r,transparent:!0,opacity:t,depthWrite:!1}));return s.renderOrder=3,s},tf=(r,t,i,s,l,c=.0045)=>{r.visible=l>.002,r.position.set(t.x,.0012,t.z),r.rotation.y=Math.atan2(-s,i),r.scale.set(l,1,c)},DC=()=>{const r=new ar,t=(i,s,l,c,f,d=.35)=>{const m=new a0(s,l,i,20);m.rotateZ(-Math.PI/2),m.translate(-f-i/2,0,0);const p=new We(m,new oa({color:c,roughness:d,metalness:.05}));p.castShadow=!0,r.add(p)};return t(.008,.0062,.0062,"#2e5f9e",0,.8),t(.022,.0063,.0064,"#f4efe2",.008),t(.86,.0064,.0098,"#e2c08a",.03),t(.54,.0098,.0142,"#24140c",.89,.25),r};function LC({canvas:r}){const t=new _C({canvas:r,antialias:!0,powerPreference:"high-performance"});t.setPixelRatio(Math.min(window.devicePixelRatio||1,zl?1.5:2)),t.outputColorSpace=ni,t.toneMapping=km,t.toneMappingExposure=1,t.shadowMap.enabled=!0,t.shadowMap.type=Xl;const i=new AS;i.background=new be("#050806"),i.fog=new n0("#050806",4,11);const s=new Om(t),l=s.fromScene(new xC,.04).texture;i.environment=l,i.environmentIntensity=.32;const c=new ii(40,1,.02,40);i.add(new f2("#d6efe0","#050806",.35));const f=new v2("#fff1dc",1.3);f.position.set(.5,3.2,.7),f.castShadow=!0,f.shadow.mapSize.set(zl?1024:2048,zl?1024:2048),Object.assign(f.shadow.camera,{left:-1.7,right:1.7,top:1.7,bottom:-1.7,near:.5,far:6}),f.shadow.camera.updateProjectionMatrix(),f.shadow.bias=-4e-4,f.shadow.normalBias=.01,f.shadow.radius=3,i.add(f,f.target);for(const gt of[-.62,.62]){const It=new d2("#ffe3b8",7,0,.8,.65,1.6);It.position.set(0,1.45,gt),It.target.position.set(0,0,gt),i.add(It,It.target)}i.add(NC());const d='"Space Grotesk Variable", sans-serif',m=new l0(sa,zl?32:48,zl?20:32),p=Hm(77),_=[],v=[];for(let gt=0;gt<16;gt+=1){const It=gt===0?AC():TC(gt,jS[gt-1],d,()=>ct()),z=new o2({map:It,roughness:.12,clearcoat:1,clearcoatRoughness:.04}),ce=new We(m,z);ce.castShadow=!0,i.add(ce),_.push(ce),v.push(new Ha().setFromEuler(new da(-Math.PI/2+p.signed()*.5,p()*Math.PI*2,0,"YXZ")))}const g=new ar;i.add(g);const y=$u("#f2f1e9",.72),b=$u("#f2f1e9",.5),C=$u("#9fd8ff",.45),M=$u("#f2f1e9",.35),S=new gf(sa*.86,sa,48);S.rotateX(-Math.PI/2);const N=new We(S,new or({color:Fp,transparent:!0,opacity:.85,depthWrite:!1}));N.renderOrder=3,g.add(y,b,C,M,N);const I=DC();i.add(I);const A=new gf(sa*1.25,sa*1.45,40);A.rotateX(-Math.PI/2);const U=new or({color:"#f2f1e9",transparent:!0,opacity:.32,depthWrite:!1}),L=_.map(()=>{const gt=new We(A,U);return gt.visible=!1,gt.renderOrder=2,i.add(gt),gt}),P=new We(A,new or({color:"#7be08f",transparent:!0,opacity:.9,depthWrite:!1}));P.visible=!1,P.renderOrder=2,i.add(P);let T=null,D={visible:!1,angle:-Math.PI/2,power:0,legal:[],halo:[]},H={active:!1,valid:!0},G=null,K="overhead",it=1,X=null,j=0,k=0,Q=!1;const ct=()=>{Q||k||(k=requestAnimationFrame(rt))},lt=()=>{const gt=it>=1?Math.PI/2:0,It=it<1?50:36,z=[];for(const ce of[-sr,sr])for(const de of[-rr,rr])for(const O of[vf,Bm])z.push([ce,O,de]);return{target:[0,0,0],azimuth:gt,elevation:k1,distance:yC(z,gt,k1,It,it),fov:It}},pt=()=>{const gt=T==null?void 0:T[0];if(!gt||gt.pocketed)return lt();const It=Math.cos(D.angle),z=Math.sin(D.angle);return{target:[gt.x+It*.5,0,gt.z+z*.5],azimuth:Math.atan2(-It,-z),elevation:.36,distance:it<1?1.35:1.05,fov:it<1?58:44}},yt=()=>K==="cue"&&!G?pt():lt();let Yt=null;const Wt=gt=>{const{position:It,target:z}=EC(gt);c.position.set(...It),c.lookAt(...z),c.fov!==gt.fov&&(c.fov=gt.fov,c.updateProjectionMatrix())},V=(gt,It)=>Math.abs(gt.azimuth-It.azimuth)+Math.abs(gt.elevation-It.elevation)+Math.abs(Math.log(gt.distance/It.distance))+Math.abs(gt.fov-It.fov)/50+Math.hypot(gt.target[0]-It.target[0],gt.target[2]-It.target[2]),_t=(gt,It,z,ce,de)=>{const O=_[gt];O.position.set(It,z,ce),O.quaternion.set(de.x,de.y,de.z,de.w).multiply(v[gt]),O.visible=z>-sa*1.2},Pt=()=>{if(T)for(const gt of T)_t(gt.id,gt.x,gt.pocketed?-1:sa,gt.z,gt.quaternion)},J=new Ha,F=new Ha,st=(gt,It)=>{const z=gt.frameCount-1,ce=Math.min(z,Math.floor(It)),de=Math.min(z,ce+1),O=Math.min(1,It-ce),{frames:E,ballCount:Y}=gt;for(let at=0;at<Y;at+=1){const vt=(ce*Y+at)*Lx,Ot=(de*Y+at)*Lx;J.set(E[vt+3],E[vt+4],E[vt+5],E[vt+6]),F.set(E[Ot+3],E[Ot+4],E[Ot+5],E[Ot+6]),J.slerp(F,O),_t(at,E[vt]+(E[Ot]-E[vt])*O,E[vt+1]+(E[Ot+1]-E[vt+1])*O,E[vt+2]+(E[Ot+2]-E[vt+2])*O,J)}},wt=()=>{const gt=T==null?void 0:T[0],It=D.visible&&gt&&!gt.pocketed&&!G;if(g.visible=It,I.visible=It||!!(D.stickOnly&&gt&&!gt.pocketed&&!G),L.forEach((Ot,zt)=>{const St=T==null?void 0:T[zt];Ot.visible=!!(It&&St&&!St.pocketed&&D.halo.includes(zt)),Ot.visible&&Ot.position.set(St.x,.0011,St.z)}),P.visible=!!(H.active&&gt&&!gt.pocketed&&!G),P.visible&&(P.position.set(gt.x,.0013,gt.z),P.material.color.set(H.valid?"#7be08f":W1)),!gt||gt.pocketed)return;const z=Math.cos(D.angle),ce=Math.sin(D.angle),de=5*Math.PI/180,O=new tt(z*Math.cos(de),-Math.sin(de),ce*Math.cos(de)),E=sa+.012+D.power*.3;if(I.position.set(gt.x-O.x*E,sa-O.y*E,gt.z-O.z*E),I.quaternion.setFromUnitVectors(new tt(1,0,0),O),!It)return;const Y=ab(T,gt,D.angle);if(tf(y,gt,z,ce,Y.distance),N.position.set(Y.point.x,.0014,Y.point.z),Y.ballId===null){N.scale.setScalar(.5),N.material.color.set(Fp),b.visible=!1,C.visible=!1,tf(M,Y.point,Y.cushionDir.x,Y.cushionDir.z,.16);return}N.scale.setScalar(1),N.material.color.set(D.legal.includes(Y.ballId)?Fp:W1),M.visible=!1;const at=T[Y.ballId],vt=Math.cos(Y.cut);tf(b,at,Y.objectDir.x,Y.objectDir.z,.06+.32*vt),Y.cueDir?tf(C,Y.point,Y.cueDir.x,Y.cueDir.z,.04+.22*Math.sin(Y.cut)):C.visible=!1};function rt(gt){if(k=0,Q)return;const It=j?Math.min(.05,(gt-j)/1e3):1/60;j=gt;let z=!1;if(G){const O=(gt-G.start)/1e3*G.speed*G.result.fps;if(O>=G.result.frameCount-1||G.skip){st(G.result,G.result.frameCount-1);const E=G.onDone;G=null,wt(),E==null||E()}else st(G.result,O),z=!0}const ce=Yt||yt();X?(X=MC(X,ce,1-Math.exp(-It*6)),V(X,ce)>5e-4?z=!0:X=ce):X=ce,Wt(X),t.render(i,c),z?ct():j=0}let At={top:0,right:0,bottom:0,left:0},fe={width:1,height:1};const xt=()=>{const gt=Math.max(1,fe.width-At.left-At.right),It=Math.max(1,fe.height-At.top-At.bottom);it=gt/It,c.aspect=it,c.setViewOffset(gt,It,-At.left,-At.top,fe.width,fe.height),c.updateProjectionMatrix()},Ct=()=>{const gt=r.parentElement;fe={width:Math.max(1,(gt==null?void 0:gt.clientWidth)||r.clientWidth),height:Math.max(1,(gt==null?void 0:gt.clientHeight)||r.clientHeight)},t.setSize(fe.width,fe.height,!1),xt(),X=null,ct()},Ut=new ResizeObserver(Ct);Ut.observe(r.parentElement||r),Ct();const Nt=new S2,Dt=new Bt,se=new Ia(new tt(0,1,0),-sa),re=new tt;return{setBalls(gt){T=gt,Pt(),wt(),ct()},setAim(gt){D={...D,...gt},wt(),ct()},setPlacement(gt){H={...H,...gt},wt(),ct()},setInsets(gt){const It=Object.fromEntries(Object.entries({...At,...gt}).map(([z,ce])=>[z,Math.max(0,Math.round(ce))]));Object.keys(It).every(z=>It[z]===At[z])||(At=It,xt(),ct())},setCameraMode(gt){K=gt,Yt=null,ct()},playShot(gt,{speed:It=1}={}){return new Promise(z=>{K==="cue"&&(Yt=X),G={result:gt,start:performance.now(),speed:It,onDone:()=>{Yt=null,z()}},wt(),ct()})},skipShot(){G&&(G.skip=!0),ct()},isPlaying:()=>!!G,pickTable(gt,It){const z=r.getBoundingClientRect();return Dt.set((gt-z.left)/z.width*2-1,-((It-z.top)/z.height)*2+1),Nt.setFromCamera(Dt,c),Nt.ray.intersectPlane(se,re)?{x:re.x,z:re.z}:null},screenScale(){return X?X.distance*Math.tan(c.fov*Math.PI/360)*2/Math.max(1,r.clientHeight):.003},invalidate:ct,dispose(){Q=!0,cancelAnimationFrame(k),Ut.disconnect(),i.traverse(gt=>{var z;(z=gt.geometry)==null||z.dispose();const It=Array.isArray(gt.material)?gt.material:gt.material?[gt.material]:[];for(const ce of It){for(const de of Object.values(ce))de!=null&&de.isTexture&&de.dispose();ce.dispose()}}),l.dispose(),s.dispose(),t.dispose()}}}const Vp=wo.ball.radius,UC=.42,OC=6,Bl=r=>Math.atan2(Math.sin(r),Math.cos(r));function PC({canvas:r,scene:t,ctx:i,onAim:s,onPower:l,onShoot:c,onPlace:f,onPlaceEnd:d,onToggleCamera:m}){let p=null;const _=(M,S)=>Math.atan2(M.z-S.z,M.x-S.x),v=M=>{const S=i();if(!S.canAct)return;const N=t.pickTable(M.clientX,M.clientY);if(!p){M.pointerType==="mouse"&&S.cameraMode==="overhead"&&N&&Math.hypot(N.x-S.cue.x,N.z-S.cue.z)>Vp&&s(_(N,S.cue));return}if(p.travel=Math.max(p.travel,Math.hypot(M.clientX-p.startX,M.clientY-p.startY)),p.kind==="place"){N&&f(N);return}if(p.kind==="pull"){if(!N)return;const I=-((N.x-p.start.x)*Math.cos(S.angle)+(N.z-p.start.z)*Math.sin(S.angle));p.power=Math.max(0,Math.min(1,I/UC)),l(p.power);return}if(p.kind==="rotate"){if(S.cameraMode==="cue"||!N||!p.last)s(Bl(S.angle+(M.clientX-p.lastX)*.0035));else{const I=_(p.last,S.cue),A=_(N,S.cue);s(Bl(S.angle+Bl(A-I)*.35))}p.last=N,p.lastX=M.clientX}},g=M=>{var A;const S=i();if(!S.canAct||M.button>0)return;const N=t.pickTable(M.clientX,M.clientY),I={startX:M.clientX,startY:M.clientY,lastX:M.clientX,travel:0,last:N};S.ballInHand&&N&&Math.hypot(N.x-S.cue.x,N.z-S.cue.z)<Vp*2.6?(p={...I,kind:"place"},f(N)):M.pointerType==="mouse"&&S.cameraMode==="overhead"&&N?p={...I,kind:"pull",start:N,power:0}:p={...I,kind:"rotate"},(A=r.setPointerCapture)==null||A.call(r,M.pointerId),M.preventDefault()},y=M=>{var I;if(!p)return;const S=i(),N=p;if(p=null,(I=r.releasePointerCapture)==null||I.call(r,M.pointerId),!!S.canAct){if(N.kind==="place"){d();return}if(N.kind==="pull"){N.power>.02?c(N.power):l(0);return}if(N.travel<OC&&S.cameraMode==="overhead"){const A=t.pickTable(M.clientX,M.clientY);A&&Math.hypot(A.x-S.cue.x,A.z-S.cue.z)>Vp&&s(_(A,S.cue))}}},b=()=>{(p==null?void 0:p.kind)==="pull"&&l(0),(p==null?void 0:p.kind)==="place"&&d(),p=null},C=M=>{const S=i();if(M.target instanceof HTMLElement&&M.target.closest('input, textarea, select, [role="slider"]'))return;if(M.key==="c"||M.key==="C"){m();return}if(!S.canAct)return;const N=M.shiftKey?.02:.0025;if(M.key==="ArrowLeft")s(Bl(S.angle-N));else if(M.key==="ArrowRight")s(Bl(S.angle+N));else if(M.key==="ArrowUp")l(Math.min(1,S.power+.05));else if(M.key==="ArrowDown")l(Math.max(0,S.power-.05));else if(M.key===" "||M.key==="Enter"){if(M.target instanceof HTMLElement&&M.target.closest("button"))return;S.power>.02&&c(S.power)}else return;M.preventDefault()};return r.addEventListener("pointermove",v),r.addEventListener("pointerdown",g),r.addEventListener("pointerup",y),r.addEventListener("pointercancel",b),window.addEventListener("keydown",C),()=>{r.removeEventListener("pointermove",v),r.removeEventListener("pointerdown",g),r.removeEventListener("pointerup",y),r.removeEventListener("pointercancel",b),window.removeEventListener("keydown",C)}}let tr=null,IC=0;const Gl=new Map,zC=()=>tr||(tr=new Worker(new URL(""+new URL("pool-shot-worker-xW8J5-_0.js",import.meta.url).href,import.meta.url),{type:"module"}),tr.onmessage=({data:r})=>{const t=Gl.get(r.id);t&&(Gl.delete(r.id),r.error?t.reject(new Error(r.error)):t.resolve(r.result??r.shot))},tr.onerror=r=>{for(const t of Gl.values())t.reject(new Error(r.message||"Shot worker crashed"));Gl.clear(),tr=null},tr),ty=r=>new Promise((t,i)=>{const s=IC++;Gl.set(s,{resolve:t,reject:i}),zC().postMessage({...r,id:s})}),BC=(r,t)=>ty({type:"simulate",balls:r,shot:t}),FC=({balls:r,state:t,difficulty:i,seed:s})=>ty({type:"bot",balls:r,state:t,difficulty:i,seed:s}),Gp=r=>Math.min(1,Math.max(0,r));function HC({power:r,disabled:t,onPower:i,onShoot:s}){const l=Mt.useRef(null),c=Mt.useRef(!1),f=d=>{const m=l.current.getBoundingClientRect();return Gp((d.clientY-m.top)/m.height)};return ie.jsxs("div",{ref:l,className:"power-bar",role:"slider","aria-label":"Shot power: drag down, release to shoot","aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":Math.round(r*100),"aria-disabled":t,tabIndex:t?-1:0,"data-disabled":t,onPointerDown:d=>{t||(c.current=!0,d.currentTarget.setPointerCapture(d.pointerId),i(f(d)))},onPointerMove:d=>{c.current&&i(f(d))},onPointerUp:d=>{if(!c.current)return;c.current=!1;const m=f(d);m>.02?s(m):i(0)},onPointerCancel:()=>{c.current=!1,i(0)},onKeyDown:d=>{if(!t){if(d.key==="ArrowDown")i(Gp(r+.05));else if(d.key==="ArrowUp")i(Gp(r-.05));else if(d.key==="Enter"||d.key===" ")r>.02&&s(r);else return;d.preventDefault(),d.stopPropagation()}},children:[ie.jsx("div",{className:"power-fill",style:{height:`${r*100}%`}}),ie.jsx("div",{className:"power-handle",style:{top:`${r*100}%`}}),ie.jsx("span",{className:"power-label",children:r>0?Math.round(r*100):"Pull"})]})}function VC({spin:r,disabled:t,onSpin:i}){const s=Mt.useRef(null),l=Mt.useRef(!1),c=f=>{const d=s.current.getBoundingClientRect(),m=(f.clientY-(d.top+d.height/2))/(d.height/2),p=Math.max(-1,Math.min(1,-m/.8));return Math.abs(p)<.12?0:Math.round(p*20)/20};return ie.jsxs("div",{ref:s,className:"spin-pad",role:"slider","aria-label":"Cue ball spin: up follow, down draw","aria-valuemin":-100,"aria-valuemax":100,"aria-valuenow":Math.round(r*100),"aria-valuetext":r>0?`Follow ${Math.round(r*100)}%`:r<0?`Draw ${Math.round(-r*100)}%`:"Centre ball",tabIndex:t?-1:0,"data-disabled":t,onPointerDown:f=>{t||(l.current=!0,f.currentTarget.setPointerCapture(f.pointerId),i(c(f)))},onPointerMove:f=>{l.current&&i(c(f))},onPointerUp:()=>{l.current=!1},onDoubleClick:()=>i(0),onKeyDown:f=>{if(!t){if(f.key==="ArrowUp")i(Math.min(1,r+.1));else if(f.key==="ArrowDown")i(Math.max(-1,r-.1));else if(f.key==="0")i(0);else return;f.preventDefault(),f.stopPropagation()}},children:[ie.jsx("span",{className:"spin-dot",style:{transform:`translateY(${-r*40}%)`}}),ie.jsx("span",{className:"spin-label",children:r>0?"Follow":r<0?"Draw":"Stun"})]})}function q1({id:r,potted:t=!1}){const i=jS[r-1],s=r>8;return ie.jsx("span",{className:"ball-chip","data-potted":t,"data-stripe":s,style:{"--chip":i},"aria-label":`${r}${t?" potted":""}`,children:r})}const GC={solids:"Solids",stripes:"Stripes"};function XC({game:r}){if(r.mode==="practice")return ie.jsx("div",{className:"player-cards",children:ie.jsxs("div",{className:"player-card","data-active":"true",children:[ie.jsx("span",{className:"player-name",children:"Practice"}),ie.jsxs("span",{className:"player-meta",children:[r.shots," shot",r.shots===1?"":"s"," · ",r.potted.length,"/15 potted"]})]})});const t=new Set(r.potted);return ie.jsx("div",{className:"player-cards",children:r.players.map((i,s)=>{const l=i.group==="solids"?aS:i.group==="stripes"?sS:[],c=l.length>0&&l.every(f=>t.has(f));return ie.jsxs("div",{className:"player-card","data-active":r.turn===s&&r.phase!=="over",children:[ie.jsx("span",{className:"player-name",children:i.name}),ie.jsx("span",{className:"player-meta",children:i.group?GC[i.group]:"Open table"}),ie.jsxs("span",{className:"player-chips",children:[l.map(f=>ie.jsx(q1,{id:f,potted:t.has(f)},f)),c&&ie.jsx(q1,{id:8,potted:t.has(8)})]})]},i.name)})})}const Y1=wo.ball.radius,Z1=typeof window<"u"&&window.matchMedia("(hover: hover) and (pointer: fine)").matches,ef=-Math.PI/2,kC={x:0,z:nc+.2},K1=(r,t,i)=>Math.min(i,Math.max(t,r)),Xp=r=>new Promise(t=>setTimeout(t,r)),J1=r=>r<.5?2*r*r:1-(-2*r+2)**2/2,Q1=()=>Math.floor(Math.random()*2**31),kp=(r,t)=>new Promise(i=>{const s=performance.now(),l=c=>{const f=Math.min(1,(c-s)/r);t(f),f<1?requestAnimationFrame(l):i()};requestAnimationFrame(l)}),WC=[{mode:"practice",difficulty:"easy",label:"Practice",note:"Solo. Clear the table."},{mode:"bot",difficulty:"easy",label:"vs Bot · Easy",note:"Misses now and then."},{mode:"bot",difficulty:"pro",label:"vs Bot · Pro",note:"Plans position. Rarely misses."}];function qC(){const r=Mt.useRef(null),t=Mt.useRef(null),i=Mt.useRef(null),s=Mt.useRef(null),[l,c]=Mt.useState(!1),[f,d]=Mt.useState(null),[m,p]=Mt.useState("menu"),[_,v]=Mt.useState(0),[g,y]=Mt.useState(0),[b,C]=Mt.useState("overhead"),[M,S]=Mt.useState(null),[N,I]=Mt.useState(!1),A=Mt.useRef({balls:null,game:null,phase:"menu",angle:ef,power:0,spin:0,cameraMode:"overhead",placeValid:!0,lastValid:null,lastShot:null,run:0}),U=F=>{A.current.phase=F,p(F)},L=F=>{var st;A.current.power=F,v(F),(st=t.current)==null||st.setAim({power:F})},P=F=>{A.current.spin=F,y(F)},T=F=>{var st;A.current.angle=F,(st=t.current)==null||st.setAim({angle:F})},D=F=>S({text:F,key:performance.now()}),H=F=>{var st;A.current.balls=F,(st=t.current)==null||st.setBalls(F)},G=F=>{A.current.game=F,d(F)},K=F=>{const st=t.current;if(F.phase==="over"){st.setAim({visible:!1,stickOnly:!1}),st.setPlacement({active:!1}),U("over");return}if(F.players[F.turn].kind==="bot"){st.setAim({visible:!1,stickOnly:!0,power:0,legal:[],halo:[]}),st.setPlacement({active:!1}),U("bot"),k(F);return}const wt=A.current.balls[0];A.current.lastValid={x:wt.x,z:wt.z},A.current.placeValid=!0;const rt=oS(F),At=F.mode==="bot"&&F.players[F.turn].group;st.setAim({visible:!0,stickOnly:!1,power:0,legal:rt,halo:At?rt:[]}),st.setPlacement({active:!!F.ballInHand,valid:!0}),U("aim")},it=F=>{const{state:st,events:wt}=hb(A.current.game,F);let rt=F.balls;wt.some(At=>At.type==="respot")&&(rt=sb(rt,8)),rt[0].pocketed&&st.phase!=="over"&&(rt=Au(rt,rb(rt,kC))),H(rt),G(st),L(0),D(st.message),K(st)},X=async(F,st)=>{const wt=t.current,rt=A.current.balls;U("shooting"),wt.setPlacement({active:!1});const At=BC(rt,F);A.current.angle=F.angle,wt.setAim({visible:!1,stickOnly:!0,angle:F.angle,power:F.power}),await kp(90,xt=>wt.setAim({power:F.power*(1-xt)}));let fe;try{fe=await At}catch(xt){if(console.error(xt),st!==A.current.run)return;D("Shot could not run. Try again."),K(A.current.game);return}st===A.current.run&&(wt.setAim({stickOnly:!1}),A.current.lastShot={before:rt,result:fe},I(!0),await wt.playShot(fe),st===A.current.run&&it(fe))},j=F=>{const st=A.current;if(st.phase==="aim"){if(st.game.ballInHand&&!st.placeValid){D("Move the cue ball to a clear spot"),L(0);return}X({angle:st.angle,power:F,spin:st.spin},st.run)}},k=async F=>{const st=A.current.run,wt=t.current;if(await Xp(600),st!==A.current.run)return;let rt;try{rt=await FC({balls:A.current.balls,state:F,difficulty:F.difficulty,seed:Q1()})}catch(xt){console.error(xt),D("Bot lost its cue. Your turn."),G({...F,turn:0,ballInHand:"anywhere"}),K(A.current.game);return}if(st!==A.current.run)return;rt.cuePosition&&(H(Au(A.current.balls,rt.cuePosition)),await Xp(300));const At=A.current.angle,fe=Math.atan2(Math.sin(rt.angle-At),Math.cos(rt.angle-At));await kp(Math.min(900,280+Math.abs(fe)*380),xt=>{A.current.angle=At+fe*J1(xt),wt.setAim({angle:A.current.angle})}),st===A.current.run&&(await kp(420,xt=>wt.setAim({power:rt.power*J1(xt)})),await Xp(140),st===A.current.run&&X({angle:rt.angle,power:rt.power,spin:rt.spin},st))},Q=F=>{var Ct;const st=A.current,wt=((Ct=st.game)==null?void 0:Ct.ballInHand)==="kitchen",rt=tn.halfWidth-Y1,At=tn.halfLength-Y1,fe={x:K1(F.x,-rt,rt),z:K1(F.z,wt?nc:-At,At)},xt=lf(fe,st.balls,{kitchenOnly:wt});st.placeValid=xt,xt&&(st.lastValid=fe),H(Au(st.balls,fe)),t.current.setPlacement({valid:xt})},ct=()=>{const F=A.current;F.placeValid||!F.lastValid||(H(Au(F.balls,F.lastValid)),F.placeValid=!0,t.current.setPlacement({valid:!0}))},lt=()=>{var st;const F=A.current.cameraMode==="overhead"?"cue":"overhead";A.current.cameraMode=F,C(F),(st=t.current)==null||st.setCameraMode(F)},pt=(F,st)=>{A.current.run+=1;const wt=cb({mode:F,difficulty:st});A.current.lastShot=null,I(!1),T(ef),L(0),P(0),H(np(Q1())),G(wt),D(wt.message),K(wt)},yt=()=>{var F,st,wt;A.current.run+=1,(F=t.current)==null||F.skipShot(),G(null),H(np(1)),T(ef),L(0),(st=t.current)==null||st.setAim({visible:!1,stickOnly:!1}),(wt=t.current)==null||wt.setPlacement({active:!1}),U("menu")},Yt=async()=>{const F=A.current;if(!F.lastShot||F.phase!=="aim"&&F.phase!=="over")return;const st=F.phase,wt=F.run,rt=t.current;U("replay"),rt.setAim({visible:!1,stickOnly:!1}),rt.setPlacement({active:!1}),rt.setBalls(F.lastShot.before),await rt.playShot(F.lastShot.result),wt===A.current.run&&(rt.setBalls(A.current.balls),st==="over"?U("over"):K(A.current.game))},Wt=()=>{var F;return(F=t.current)==null?void 0:F.skipShot()};Mt.useEffect(()=>{let F;try{F=LC({canvas:r.current})}catch(wt){console.warn("WebGL unavailable:",wt),c(!0);return}t.current=F,H(np(1)),F.setAim({angle:ef,visible:!1});const st=PC({canvas:r.current,scene:F,ctx:()=>{var wt,rt;return{canAct:A.current.phase==="aim",cue:(wt=A.current.balls)==null?void 0:wt[0],angle:A.current.angle,power:A.current.power,cameraMode:A.current.cameraMode,ballInHand:!!((rt=A.current.game)!=null&&rt.ballInHand)}},onAim:T,onPower:L,onShoot:j,onPlace:Q,onPlaceEnd:ct,onToggleCamera:lt});return()=>{A.current.run+=1,st(),F.dispose(),t.current=null}},[]),Mt.useEffect(()=>{if(!M)return;const F=setTimeout(()=>S(null),2800);return()=>clearTimeout(F)},[M]);const V=!!f&&m!=="menu";Mt.useLayoutEffect(()=>{const F=()=>{var xt,Ct;const st=t.current;if(!st)return;if(!V){st.setInsets({top:0,right:0,bottom:0,left:0});return}const wt=((xt=i.current)==null?void 0:xt.getBoundingClientRect().bottom)??0,rt=(Ct=s.current)==null?void 0:Ct.getBoundingClientRect(),At=rt?Math.max(0,window.innerWidth-rt.left-18):0,fe=window.innerWidth>=700;st.setInsets({top:wt+4,right:At,bottom:46,left:fe?At:6})};return F(),window.addEventListener("resize",F),()=>window.removeEventListener("resize",F)},[V,f==null?void 0:f.mode]);const _t=m==="shooting"||m==="replay",Pt=m==="aim",J=m==="bot"?"Bot is lining up…":_t?"Tap table to skip":Pt&&(f!=null&&f.ballInHand)?"Ball in hand: drag the cue ball, then shoot":Pt?Z1&&b==="overhead"?"Move to aim · press, pull back, release · ← → fine aim":"Tap or drag to aim · pull power bar down, release":"";return ie.jsxs("main",{className:"play","data-phase":m,children:[ie.jsx("div",{className:"play-stage",onPointerDown:()=>{_t&&Wt()},children:ie.jsx("canvas",{ref:r,className:"play-canvas","aria-label":"Pool table"})}),l&&ie.jsxs("div",{className:"play-panel play-fallback",children:[ie.jsx("h1",{children:"Table unavailable"}),ie.jsx("p",{children:"This device could not start WebGL, which the table needs."})]}),m==="menu"&&!l&&ie.jsx("div",{className:"play-menu",children:ie.jsxs("div",{className:"play-panel",children:[ie.jsx("p",{className:"play-kicker",children:"Back room"}),ie.jsx("h1",{children:"8-Ball"}),ie.jsx("p",{className:"play-lede",children:"Real table physics. Break, run the rack, sink the 8."}),ie.jsx("div",{className:"play-modes",children:WC.map(F=>ie.jsxs("button",{type:"button",className:"play-mode",onClick:()=>pt(F.mode,F.difficulty),children:[ie.jsx("span",{children:F.label}),ie.jsx("small",{children:F.note})]},F.label))}),ie.jsx("p",{className:"play-keys",children:Z1?"Mouse aims · press and pull back to shoot · C swaps camera":"Tap to aim · drag to fine-tune · pull the power bar"})]})}),f&&m!=="menu"&&ie.jsxs(ie.Fragment,{children:[ie.jsxs("header",{ref:i,className:"play-top",children:[ie.jsx("button",{type:"button",className:"play-icon",onClick:yt,"aria-label":"Back to menu",children:ie.jsx(tb,{size:18,weight:"bold"})}),ie.jsx(XC,{game:f}),ie.jsxs("div",{className:"play-tools",children:[ie.jsx("button",{type:"button",className:"play-icon",onClick:lt,"aria-label":b==="overhead"?"Cue camera":"Overhead camera","aria-pressed":b==="cue",children:ie.jsx(jE,{size:18})}),ie.jsx("button",{type:"button",className:"play-icon",onClick:Yt,disabled:!N||!(m==="aim"||m==="over"),"aria-label":"Replay last shot",children:ie.jsx(JE,{size:18})}),ie.jsx("button",{type:"button",className:"play-icon",onClick:()=>pt(f.mode,f.difficulty),"aria-label":"New rack",children:ie.jsx(QE,{size:18})})]})]}),ie.jsx("div",{className:"play-toast","aria-live":"polite",children:M&&ie.jsx("span",{children:M.text},M.key)}),ie.jsxs("aside",{ref:s,className:"play-controls","data-hidden":!Pt,children:[ie.jsx(VC,{spin:g,disabled:!Pt,onSpin:P}),ie.jsx(HC,{power:_,disabled:!Pt,onPower:L,onShoot:j})]}),_t&&ie.jsxs("button",{type:"button",className:"play-skip",onClick:Wt,children:[ie.jsx($E,{size:16,weight:"fill"})," Skip"]}),J&&ie.jsx("p",{className:"play-hint",children:J}),m==="over"&&ie.jsx("div",{className:"play-menu",children:ie.jsxs("div",{className:"play-panel",children:[ie.jsx("p",{className:"play-kicker",children:f.mode==="practice"?"Table cleared":"Game over"}),ie.jsx("h1",{children:f.message}),ie.jsxs("div",{className:"play-modes",children:[ie.jsx("button",{type:"button",className:"play-mode",onClick:()=>pt(f.mode,f.difficulty),children:ie.jsx("span",{children:"Rack again"})}),ie.jsx("button",{type:"button",className:"play-mode",onClick:Yt,disabled:!N,children:ie.jsx("span",{children:"Replay last shot"})}),ie.jsx("button",{type:"button",className:"play-mode",onClick:yt,children:ie.jsx("span",{children:"Menu"})})]})]})})]})]})}XE.createRoot(document.getElementById("root")).render(ie.jsx(qC,{}));
