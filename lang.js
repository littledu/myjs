//lang.js
;(function( myjs ){
    var core_toString = Object.prototype.toString,
        core_hasOwn = Object.prototype.hasOwnProperty;

    myjs.extend({
        
        //有了myjs.type,还有必要实现isOOXX的方法吗？占位待考虑
        isFunction: function( obj ){
            return myjs.type( obj ) === 'function';
        },

        //判断是否为空对象
        isEmptyObject: function( obj ){
            var name;
            for( name in obj ){
                return false;
            }
            return true;
        },

        //判断是否为纯粹的对象
        //纯粹的对象，就是var o = {}和var o = new Object();
        //简单的讲，这种对象都是没有原型链的，所以，直接通过判断其下有原型链来实现，虽然效率低了点
        //有待完善
        isPlainObject: function( obj ){

            if( !obj || myjs.type( obj ) !== 'object' || obj.nodeType || myjs.isWindow( obj ) ){
                return false;
            }

            try{
                for( var name in obj ){
                    if( !core_hasOwn.call( obj, name ) ){
                        return false;
                    }
                }
            }catch( e ){
                return false;
            }

            return true;
        },

        //不是数组，但却具有lenght属性的是arraylike
        isArraylike: function( obj ){
            return obj.length > 0 && ( $.type( obj ) !== 'array' );
        },
        
        makeArray: function( source, target ){
            target = target || [];

            for( var i = 0,len = source.length; i < len; i++){
                target[ target.length++ ] = source[i];
            }

            return target;
        },

        capitalize: function( str ){
            return str.slice( 0, 1 ).toUpperCase() + str.slice( 1 );
        }
    })
})( myjs );
