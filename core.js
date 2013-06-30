;(function( window ){

    var isReady = false,
        readyList = [],
        idReg = /#([\w\-]*)$/,  //从JQ提取出来

        core_toString = Object.prototype.toString,

        myjs = function( selector, context ){
            return new myjs.fn.init( selector, context );
        },

        ready = function( fn ){

            var fireReady = function(){

                if( isReady ) return;
                isReady = true;
       
                if(readyList){
                    var i = 0,readyFn;
                    while( readyFn = readyList[i++] ){
                        readyFn();
                    }
                    readyList.length = 0;
                }
            };

            if( isReady ){
                return fn();   //这里，既然dom已经ready了，下面的代码就不需要执行了。所以直接执行函数并返回。
            }else{
                readyList.push( fn );
            }
   
            if( document.readyState === 'complete' ){
                return fireReady();
            }
   
            if( document.addEventListener ){  //标准浏览器
                document.addEventListener( 'DOMContentLoaded',function(){
                    document.removeEventListener( 'DOMContentLoaded',arguments.callee,false );
                    fireReady();
                },false )
            }else{    //IE
                document.attachEvent( 'onreadystatechange',function(){
                    document.detachEvent( 'onreadystatechange',arguments.callee );
                    fireReady();
                });
   
                (function(){
                    try{
                        document.documentElement.doScroll('left');
                    }catch(e){
                        setTimeout(arguments.callee,4);
                        return;
                    }
                    fireReady();
                })();
            }
        };

    myjs.fn = myjs.prototype = {
        constructor: myjs,

        //这既是myjs的本来构造函数，也是入口函数
        //参数分别可以为：
        //字符串： 分两种，一种为html，一种为选择器
        //函数： 实现dom ready
        //节点
        //节点数组
        init: function( selector, context ){
            var elem, elems, match;

            context = context || document;

            //如果没有selector,直接返回this
            if( !selector ){
                return this;
            }

            //如果为字符串，传入选择器返回myjs对象的类数组
            //字符串分两种情况，一种是传入html，则为生成相应的dom节点
            //一种为选择元素，个人认为这种情况用得较多，故放在第一个判断分支以更快的判断到。
            if( typeof selector === 'string'){
                //1. 当为选择器时
                if( selector.charAt(0) === '#'){
                    match = idReg.exec( selector );

                    if( match[1] ){
                        elem = document.getElementById( match[1] );
                        if( elem ){
                            this[0] = elem;
                            this.length = 1;
                        }
                    }
                    
                    return this;

                }else if( selector.charAt(0) === '<' && selector.charAt(selector.length-1) === '>' && selector.length >= 3 ){   //2. 当为html时
                    //创建节点
                    elems = myjs.create( selector );
                }else{
                    elems = myjs.query( selector, context );
                }
              
                return myjs.makeArray( elems, this );
            }

            //如果为函数，进入domready
            //注意:正美的mass.js注释说：safari下,typeof nodeList的类型为function,暂无测试，先保持注意
            if( typeof selector === 'function' ){
                return ready( selector );
            }

            //如果selector为节点，包装一下返回myjs对象
            if( selector.nodeType ){
                this.length = 1;
                this[0] = selector;
                return this;
            }
            
            //如果为dom list，用makeArray返回myjs对象的类数组
            if(selector.length){
                return myjs.makeArray( selector, this );
            }

            return this;
        },

        length: 0,
        splice: [].splice
    };


    //将myjs的原型给实际对象init的原型，从而实现$()可以访问myjs原型下的方法，如$().version
    //在其下的扩展中，如myjs.fn.ooxx，也能$().ooxx
    myjs.fn.init.prototype = myjs.fn;

    //myjs扩展方法
    //接收3个参数extend(target,source,override)
    //
    myjs.extend = function(){
        var target = arguments[0],
            length = arguments.length,
            i = 1,
            override,
            source,
            key;

        override = typeof arguments[ length - 1 ] == 'boolean' ? arguments[ length - 1 ] : true;

        if( length === i ){
            target = this;
            i = 0;
        }

        source = arguments[i];

        for( key in source ){

            if( override || !( key in target ) ){

                target[ key ] = source[ key ];
            }
        }
        
        return target;
    };

    myjs.extend({
        version: '1.0',

        noConflict: function(){
            
        },

        uuid: 0,

        isWindow: function( obj ){
            return obj !== null && obj.window === window;
        },

        type: function( obj ){
            if( obj == null ){
                return String( obj );
            }

            var type = typeof obj;

            if( type === 'object' || type === 'function' ){
                return core_toString.call( obj ).slice( 8, -1 ).toLowerCase();
            }

            return type;
        },

        /*each: function( obj, callback ){
            var length = obj.length,
                isObj = length === undefined || ( typeof obj === 'function' ),
                i = 0, key;

            if( isObj ){
                for( key in obj ){
                    if( false === callback.call( obj[key], key, obj[key] )) break;
                }
            }else{
                for( ; i < length; i++ ){
                    if( false === callback.call( obj[i], i, obj[i] )) break;
                }
            }

            return obj;
        },*/

        each: function( obj, callback ){

            if( typeof callback !== 'function' ){
                myjs.error( 'check your each callback args' );
            }

            var isArray = isArraylike( obj ),
                i = 0,
                length = obj.length;

            if( isArray ){
                for( ; i < length; i++ ){
                    if( callback.call( obj[i], i, obj[i] ) === false ) break;
                }
            }else{
                for( i in obj ){
                    if( callback.call( obj[i], i, obj[i] ) === false ) break;
                }
            }

            return obj;
        },

        error: function( msg ) {
            throw new Error( msg );
        },

        ui: {}
    });

    //抄自JQ
    /*
        arraylike应该是具有length的非数组，JQ内部有一个isArraylike函数，名字看起来像是判断是不是arraylike，但实际上他的范围是数组和一切具有length的对象，且这个对象的属性均为索引值，即 o = { 0: '1', 1: '2', length: 2 } 是arraylike，而 o = { 0: '1', 1: '2', 'name': 'fatdu', length: 3 }不是。
        实现这个函数是有作用的，比如JQ的each方法里则用它来区分是要使用for循环还是for in遍历，从而达到在纯索引的对象里使用for循环来尽可能的提速( 传说for比for in快 )。而由于它并不是真正的判断arraylike，所以JQ并没把它作为接口公开可能是这个原因吧(纯属个人猜测)，今晚观JQ之感，不保证正确。。。
    */
    function isArraylike( obj ) {
        var length = obj.length,
            type = myjs.type( obj );

        if ( myjs.isWindow( obj ) ) {
            return false;
        }

        if ( obj.nodeType === 1 && length ) {
            return true;
        }

        return type === "array" || type !== "function" &&
            ( length === 0 ||
            typeof length === "number" && length > 0 && ( length - 1 ) in obj );
    }

    window.myjs = window.$ = myjs;

})( window );