//还差offset,width/height等方法未封装
;(function( myjs ){

    var isECMAStyle = !!( document.defaultView && document.defaultView.getComputedStyle ),
        rPosition = /^(?:left|right|top|bottom)$/,
        getStyle = function( elem, name ){
            var val = elem.currentStyle ? elem.currentStyle[name] : getComputedStyle( elem, null )[name];

            if( 'medium' === val ){
                val = '0px';
            }

            return val;
        },
        bgPositionFix = {
            left: '0%',
            right: '100%',
            top: '0%',
            bottom: '100%',
            center: '50%'
        },
        showFix = {
            visibility: 'hidden',
            display: 'block'
        },
        sizeParams = {
            'Width': [ 'Left', 'Right' ],
            'Height': [ 'Top', 'Bottom' ]
        },
        colorMap = {
            'black'  : 'rgb(0,0,0)',
            'silver' : 'rgb(192,192,192)',
            'white'  : 'rgb(255,255,255)',
            'gray'   : 'rgb(128,128,128)',
            'maroon' : 'rgb(128,0,0)',
            'red'    : 'rgb(255,0,0)',
            'purple' : 'rgb(128,0,128)',
            'fuchsia': 'rgb(255,0,255)',
            'green'  : 'rgb(0,128,0)',
            'lime'   : 'rgb(0,255,0)',
            'olive'  : 'rgb(128,128,0)',
            'yellow' : 'rgb(255,255,0)',
            'navy'   : 'rgb(0,0,128)',
            'blue'   : 'rgb(0,0,255)',
            'teal'   : 'rgb(0,128,128)',
            'aqua'   : 'rgb(0,255,255)'
        },
        cssHooks = {};

    var myStyle = {
        getSize: function( elem, type ){

            var val = elem[ 'offset' + type ];

            type = sizeParams[ type ];

            val -= ( parseFloat( getStyle( elem, 'border' + type[0] + 'Width' ) ) + parseFloat( getStyle( elem, 'border' + type[1] + 'Width' ) ) );

            val -= ( parseFloat( getStyle( elem, 'padding' + type[0] ) ) + parseFloat( getStyle( elem, 'padding' + type[1] ) ) );

            return val + 'px'; 
        },

        parseColor: function( val ){

            var len, r, g, b;

            if( val.indexOf('rgb') > -1 ){
                return val;
            }

            if( colorMap[val] ){
                return colorMap[val];
            }

            if( val.indexOf('#') > -1 ){
                len = val.length;
                if( len === 7 ){
                    r = parseInt( val.slice( 1, 3 ), 16 );
                    g = parseInt( val.slice( 3, 5 ), 16 );
                    b = parseInt( val.slice( 5 ), 16 );
                }else{
                    r = parseInt( val.charAt(1) + val.charAt(1), 16 );
                    g = parseInt( val.charAt(2) + val.charAt(2), 16 );
                    b = parseInt( val.charAt(3) + val.charAt(3), 16 );
                }

                return 'rgb('+ r +', '+ g +', '+ b +')';

            }

            return '';

        }
    };

    if( !isECMAStyle ){
        //IE678的透明度兼容
        //标准浏览器下，返回的数值可能是0.3001有小数点的
        //兼容IE方法实现则返回整数，这个区别是否重要，有待研究
        cssHooks.opacity = {
            get: function( elem ){
                var filter = elem.currentStyle['filter'] || '';

                if( filter ){
                    return filter.match( /\d+/ )[0] / 100 + '';
                }else{
                    return '1';
                }
                
            },
            set: function( elem, value ){
                var style = elem.style;

                value = parseFloat( value );
                //IE6下，filter:alpha(opacity=100)会使某些图片出现白点，清除filter可解决
                value = value >= 1 ? '' : 'alpha(opacity='+ value * 100 +')'

                //IE设置透明度需触发haslayout才能成功
                style.zoom = 1;
                style['filter'] = value;
                
            }
        };

        //IE678获取backgroundPostion只能通过backgroundPositionX和backgroundPositionY单独获取，设置则没问题
        //个人感觉获取backgroundPositon很少用到
        cssHooks.backgroundPosition = {
            get: function( elem ){
                var x = elem.currentStyle['backgroundPositionX'],
                    y = elem.currentStyle['backgroundPositionY'];

                x = bgPositionFix[x] || x;
                y = bgPositionFix[y] || y;

                return x + ' ' + y;
            }
        }
    };

    cssHooks.zIndex = {
        get: function( elem ){
            var value = getStyle( elem, 'zIndex' );

            return value === 'auto' ? 0 : value;
        }
    };

    //发现currentStyle和getComputedStyle均可以获取不在dom树的节点的宽高
    //返回来的宽高，只有'数值px','auto'这2种
    //IE下，没有显式的设置width和height，返回auto，不管在不在dom树
    //标准浏览器下，不在dom树且没有显式的设置宽高时，返回auto，其他返回正常值
    myjs.each( ['width', 'height'], function( key, obj ){

        var upName = myjs.capitalize( obj );

        cssHooks[ obj ] = {
            get: function( elem ){
                var temp = {},
                    name,val,docElem;

                //注意，$(window)[0]在现在所有的select库中返回undefined
                if( myjs.isWindow( elem ) ){
                    return elem.document.documentElement[ 'client' + upName ];
                }

                if( elem.nodeType === 9 ){
                    docElem = elem.documentElement;
                    return Math.max( docElem['scroll'+upName], docElem['client'+upName] );
                }

                //如果不在dom树
                if( !elem['offset' + upName ] ){
                    for( name in showFix ){
                        temp[name] = elem.style[name];
                        elem.style[name] = showFix[name];
                    }

                    val = getStyle( elem, obj );
                    val = 'auto' === val ? myStyle.getSize( elem, upName ) : val;

                    for( name in temp ){
                        elem.style[name] = temp[name];
                    }
                }else{
                    val = getStyle( elem, obj );
                    val = 'auto' === val ? myStyle.getSize( elem, upName ) : val;
                }

                return val;

            }
        }
    })

    myjs.extend( myjs.fn, {
        css: function( name, value ){
            var elem,hooks;

            elem = this[0];

            hooks = cssHooks[name];

            //获取
            if( undefined === value ){
                if( hooks && hooks.get ){
                    return hooks.get( elem );
                }

                val = getStyle( elem, name );

                if( rPosition.test( name ) && val === 'auto' ){
                    //占位待写
                }

                if( /color/i.test( name ) ){
                    return myStyle.parseColor( val );
                }

                return val;
            }

            value += '';

            //遍历设置
            myjs.each( this, function( i, elem ){

                if( hooks && hooks.set ){
                    hooks.set( elem, value );
                }else{
                    elem.style[ name ] = value;
                }
                
            })

            return this;

        }
    });

})( myjs );