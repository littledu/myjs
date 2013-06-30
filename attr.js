;(function( myjs ){

    myjs.attrHooks = {};

    myjs.extend( myjs.fn, {
        attr: function( name, value ){
            var elem = this[0],
                hooks,ret;

            if( elem.nodeType !== 1 ){
                return;
            }

            hooks = myjs.attrHooks[ name ];

            if( value === undefined ){
                if( hooks && ('get' in hooks) && (ret = hooks.get(elem)) !== null ){
                    return ret;
                }else{
                    return elem.getAttribute( name );
                }
            }else{
                elem.setAttribute( name, value );
            }

            return this;
        }
    });

    if( !myjs.support.hrefNormalized){

        myjs.each(['href','src'], function(i,name){
            myjs.attrHooks[ name ] = {
                get: function( elem ){
                    var ret = elem.getAttribute(name,2);
                    return ret === null ? undefined : ret;
                }
            }
        })

    }

    if( !myjs.support.style ){
        myjs.attrHooks.style = {
            get: function( elem ){
                return elem.style.cssText.toLowerCase() || undefined;
            }
        }
    }

})( myjs );