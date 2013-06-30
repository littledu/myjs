;(function( myjs ){

    var rUnit = /^[-\d.]+/;

    var myAnim = {
            parseStyle: function( prop, value ){
                value += '';

                var val, unit, compute, set;

                val = parseFloat( value );
                unit = value.replace( rUnit, '' );

                compute = function( sv, tv, tu, e ){
                    return ( sv + ( tv - sv ) * e ).toFixed( 7 ) + tu;
                };

                set = function( elem, val, unit ){
                    myjs( elem ).css( prop, val + unit );
                }

                return { val: val, unit: unit, compute: compute, set: set };
            }
    }

    var Anim = function( elem, duration, easing, complete ){
        this.elem = elem;
        this.$elem = myjs( elem );
        this.duration = duration;
        this.easing = easing;
        this.complete = complete;
    };

    Anim.prototype = {
        start: function( source, target, len ){

            var self = this,
                elem = this.elem,
                timer;

            this.len = len;
            this.source = source;
            this.target = target;

            this.startTime = +new Date();
            this.endTimer = this.startTimer + this.duration;

            timer = setInterval(function(){
                self.run();
            }, 30 );
        },

        run: function( end ){
            var source = this.source,
                target = this.target,
                parm, i, sv, tv, tu, tp;

            for( parm in source ){
                sv = source[ parm ].val;
                tp = target[ parm ];
                tv = tp.val;
                tu = tp.unit;
            }
        }
    }

    myjs.extend( myjs.fn, {
        animate: function( options ){
            //首先，进来时，先对一些参数进行初始化
            var elem = this[0],
                to = options['to'],
                duration = options['duration'] || 400,
                easing = options['easing'] || 'swing',
                fn = options['fn'] || function(){},
                len = 0,
                source = {},
                target = {},
                anim,parm,sv,tv;

            //接着，实例化动画类，如new Anim( elem, duration,easing,complete)
            anim = new Anim( elem, duration, easing, fn );

            //遍历参数属性，准备动画
            for( parm in to ){
                len++;

                sv = myjs( elem ).css( parm );
                tv = to[ parm ];

                source[ parm ] = myAnim.parseStyle( parm, sv );
                target[ parm ] = myAnim.parseStyle( parm, tv );
            }

            anim.start( source, target, len );
            //  1. 获取起始值和结束值
            //  2. 解析获取到的值，存入一个对象
            //  3. 调用实例start开始动画
        }
    })
})( myjs );