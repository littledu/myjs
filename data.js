//data.js
//原理: 
//1. 有一个cache专门存放数据
//2. 以expando作标识,elem[expando]则为cache里的索引
//elem['myjs'] = 0|1|2...
//cache = {
//   0 : { key: value....}
//   1 : {...}
//}
;(function( myjs ){
    var expando = 'myjs',
        cache = {},

        myData = {
            data: function( elem, key, value ){

                var index = elem[expando];

                if( undefined === index ){
                    index = myjs.uuid++;
                    elem[expando] = index;
                }

                if( undefined === cache[ index ] ) cache[ index ] = {};

                if( undefined === value ){
                    return cache[index][key];
                }else{
                    cache[index][key] = value;
                }

            },

            removeData: function( elem, key ){
                var index = elem[expando];

                if( undefined !== index && cache[index]) delete cache[index][key];

            }

        };

    myjs.extend(myjs.fn,{
        data: function( key, value ){
            var length = this.length,
                i = 0;

            if( undefined === value ){
                return myData.data( this[0], key );
            }

            for(; i < length; i++ ){
                myData.data( this[i], key, value );
            }

            return this;
        },

        removeData: function( key ){
            
            for(var i = 0, len = this.length; i < len; i++ ){
                myData.removeData( this[i], key );
            }

            return this;
        }
    });
})( myjs );