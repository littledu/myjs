;(function( myjs ){
    var div = document.createElement('div'),
        button,a;

    div.innerHTML = ' <link /><table></table><a href="/a">a</a><input type="checkbox" /><button value="testValue">click</button>';

    button = div.getElementsByTagName( 'button' )[0];
    a = div.getElementsByTagName( 'a' )[0];
    input = div.getElementsByTagName( 'input' )[0];

    a.style.cssText = 'top:1px;';

    var support = {
        // IE678的childNodes不包含空白文本节点，firstChild同理
        leadingWhitespace: (div.firstChild.nodeType === 3),
        //IE会自动生成tbody，而标准浏览器不会(标准浏览器如果有tr存在，也会自动生成tbody)
        tbody: !div.getElementsByTagName('tbody').length,

        //IE678无法通过div.innerHTML = '<link />';来插入link，同样的还有style,script节点
        htmlSerialize: !!div.getElementsByTagName('link').length,

        buttonValue: button.getAttribute('value') === 'testValue',

        hrefNormalized: ( a.getAttribute("href") === "/a" ),

        style: /top/.test( a.getAttribute('style') ),

        cloneEvent: false,

        cloneHTML5: document.createElement( 'nav' ).cloneNode( true ).outerHTML !== '<:nav></:nav>'

    };

    input.checked = true;
    support.cloneChecked = input.cloneNode( true ).checked;

    if( !div.addEventListener && div.attachEvent && div.fireEvent ){

        var testCloneEvent = function(){
            support.cloneEvent = true;
            div.detachEvent( 'onclick', testCloneEvent );
        }

        div.attachEvent( 'onclick', testCloneEvent );
        div.cloneNode( true ).fireEvent( 'onclick' );

    }

    myjs.extend({
        support: support
    })
})( myjs );