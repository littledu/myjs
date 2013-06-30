//create
//create用来使用html字符串生成相应的节点
//1.如果只是简单的html字符串如: <div></div>等这种没有内容也没属性的标签字符串，则直接使用createElement创建返回
//2.如果不是，则是利用innerHTML来实现
// 需要进行包裹的元素以及与之对应的包裹元素
    /*wrapMap = {
        option : [ 1, '<select multiple="multiple">', '</select>' ],
        legend : [ 1, '<fieldset>', '</fieldset>' ],
        thead : [ 1, '<table>', '</table>' ],
        tr : [ 2, '<table><tbody>', '</tbody></table>' ],
        td : [ 3, '<table><tbody><tr>', '</tr></tbody></table>' ],
        col : [ 2, '<table><tbody></tbody><colgroup>', '</colgroup></table>' ],
        area : [ 1, '<map>', '</map>' ],
        'default' : [ 0, '', '' ]
    };*/
    
/*wrapMap.optgroup = wrapMap.option;
wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;*/
;(function( myjs ){
    var rTagName = /<([\w:]+)/,
        rSingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
        rCssJsTag = /(<(?:script|link|style))/ig,
        rTbody = /<tbody/i,
        wrapMap = {
            option: [ 1, '<select multiple="multiple">', '</select>' ],
            legend: [ 1, '<fieldset>', '</fieldset>' ],
            thead: [ 1, '<table>', '</table>' ],
            tr: [ 2, '<table><tbody>', '</tbody></table>' ],
            td: [ 3, '<table><tbody><tr>', '</tr></tbody></table>' ],
            col: [ 2, '<table><tbody></tbody><colgroup>', '</colgroup></table>' ],
            area: [ 1, '<map>', '</map>' ],
            normal: [ 0, '', '' ]
        };

    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;

    var scriptTypes = {
        'text/javascript' : true,
        'text/ecmascript' : true,
        'application/ecmascript' : true,
        'application/javascript' : true, 
        'text/vbscript' : true
    },

    myNode = {

        cloneFix: function( elem, clone ){

            //var uuid = myjs.uuid;
            var tagName = elem.tagName;

            //清除IE6-8会克隆attachEvent事件
            //clearAttributes能清除用户自定义的属性，但不会清除id和style
            //mergeAttributes能复制节点上的属性，但不会复制id和name，加flase如clone.mergeAttributes( elem, false ) 则可以
            //这里由于遵循id和name唯一的原则，不复制id和name
            if( clone.clearAttributes ){
                clone.clearAttributes();
                clone.mergeAttributes( elem );
            }

            if( tagName === 'OBJECT' ){
                clone.outerHTML = elem.outerHTML;
            }else if( tagName === 'INPUT' && ( elem.type === 'checkbox' || elem.type === 'radio' ) ){
                clone.checked = elem.checked;
                if( clone.value !== elem.value ){
                    clone.value = elem.value;
                }
            }else if( tagName === 'OPTION' ){
                clone.selected = elem.defaultSelected;
            }else if( tagName === 'INPUT' || tagName === 'TEXTAREA' ){
                clone.defaultValue = elem.defaultValue;
            }

        },

        clone: function( elem ){
            var doc = elem.ownerDocument,
                clone = elem.cloneNode( true ),
                elems,clones;

            if( myjs.support.cloneEvent || myjs.support.cloneChecked ){
                myNode.cloneFix( elem, clone );
                elems = doc.getElementsByTagName( '*' );
                clones = doc.getElementsByTagName( '*' );

                for( var i = 0, len = elems.length; i < len; i++ ){
                    myNode.cloneFix( elems[i], clones[i] );
                }
            }

            return clone;
        }
    }

    myjs.extend({
        create: function( html, context){

            if( !html ) return;

            var tagName,div,wrap,depth,scripts,targetScript,attr,attrs;

            context = context || document;

            tagName = html.match( rTagName );

            if( tagName ){
                tagName = tagName[1];
            }else{
                return;
            }

            if( rSingleTag.test( html ) ){
                return [ context.createElement( tagName ) ];
            }else{
                wrap = wrapMap[ tagName ] || wrapMap[ 'normal' ];
                depth = wrap[0];

                if( !myjs.support.htmlSerialize ){
                    html = html.replace( rCssJsTag, '<br class="myjs_fix"/>$1' );
                }

                div = context.createElement( 'div' );
                div.innerHTML = wrap[1] + html + wrap[2];

                while( depth-- ){
                    div = div.lastChild;
                }

                if( !myjs.support.tbody ){
                     // IE6/7在创建table元素时会自动添加一个tbody标签
                     // 暂不实现，个人觉得浏览器自动添加tbody标签也没什么弊端
                }

            }

            scripts = div.getElementsByTagName( 'script' );

            if( scripts.length ){
                targetScript = context.createElement( 'script' );                       
                    
                for( i = 0, len = scripts.length; i < len; i++ ){
                    sourceScript = scripts[i];
                    // 判断script元素的type属性是否为可执行的script类型
                    if( scriptTypes[ sourceScript.type.toLowerCase() ] || !sourceScript.type ){
                        attrs = sourceScript.attributes;
                        jLen = attrs.length;
                        // 原来script元素的attributes属性也要复制过来
                        for( var j = 0; j < jLen; j++ ){
                            attr = attrs[j];
                            // 浏览器默认添加的attributes属性不需要复制
                            if( attr.specified ){
                                targetScript[ attr.name ] = [ attr.value ];
                            }
                        }
                        
                        targetScript.text = sourceScript.text;
                        sourceScript.parentNode.replaceChild( targetScript, sourceScript );
                    }
                }
            }

            if( !myjs.support.htmlSerialize ){
                var brs = div.getElementsByTagName( 'br' ),               
                    len = brs.length;
                
                for( i = 0; i < len; i++ ){
                    br = brs[i];
                    if( br.className === 'myjs_fix' ){
                        br.parentNode.removeChild( br );
                    }
                }
            }

            return div.childNodes;
            
        }

    });

    myjs.extend( myjs.fn,{

        //遍历获取的对象，回调
        each: function( fn ){
            var length = this.length,
                i = 0;

            for( ; i < length; i++ ){
                fn.call( this[i], i, this[i] );
            }
            return myjs;
        },

        //其实跟each同个功能，只是each没有返回，map会返回回调结果
        map: function( fn ){
            var length = this.length,
                arr = [],
                i = 0;

            for( ; i < length; i++ ){
                arr[i] = fn.call( this[i], i, this[i] );
            }

            return arr;

        },

        find: function( selector ){
            if( typeof selector === 'string' ){
                return myjs.makeArray(myjs.query( selector ), this);
            }
        },

        slice: function( start, end ){
            end = end || this.length;

            return myjs.makeArray( Array.prototype.slice.call(this,start,end), this );
        },

        first: function(){
            return myjs( this[0] );
        },

        last: function(){
            return myjs( this[ this.length-1 ] );
        },

        eq: function( index ){
            index = index < 0 ? (this.length + index) : index;

            return myjs( this[ index ] );
            //ps:有一个"精妙"的实现，但不推荐
            //return index === -1 ? this.slice( index ) : this.slice( index, +index + 1 );
        }

    });

    myjs.extend( myjs.fn,{
        append: function( arg ){

            var elem,elems;

            if( typeof arg === 'string' ){
                elems = myjs.create( arg );
                elem = elems[0];
            }else if( arg.nodeType === 1 ){
                elem = arg;
            }

            for( var i = 0, len = this.length; i < len; i++ ){
                
                if( i === len - 1 ){
                    this[i].appendChild( elem );    
                }else{
                    this[i].appendChild( myNode.clone( elem.cloneNode( true ) ) );
                }
                
            }

            return this;
        }
    })

})( myjs );