'use strict';


/**
 *    Polyfills
 */

(function () {

    // complete prototypes

    /**
     * @method remove a single item in an array (starting search at the top of pile), without changing or cloning it.
     * @param item {*}
     * @returns {*}
     */

    function remove(item) {
        var t = this.indexOf(item);
        if (t !== -1) return this.splice(t, 1)[0];
        else return null;
    }

    if (!Array.prototype.hasOwnProperty('remove')) {
        Object.defineProperty(Array.prototype, 'remove', {
            "enumerable": false,
            "configurable": false,
            "value": remove
        });
    }


    /**
     * @method insert a single item at an array position, or at the end if position is bigger than array length
     * @param item
     * @param position
     */

    function insert(item, position) {
        var i, b = false, res = [];
        while (!b && ( i = this.shift() )) {
            if (b = ( res.length === position )) res.push(item);
            res.push(i);
        }
        if (!b) res.push(item);
        while (i = res.pop()) this.unshift(i);

        return this.length;
    }

    if (!Array.prototype.hasOwnProperty('insert')) {
        Object.defineProperty(Array.prototype, 'insert', {
            "enumerable": false,
            "configurable": false,
            "value": insert
        });
    }


    /**
     * @method returns this string cloned and encoded utf-8 to ASCII
     * @returns {string}
     */

    function encode() {
        var result = "",
            s = this.replace(/\r\n/g, "\n");
        for (var index = 0; index < s.length; index++) {
            var c = s.charCodeAt(index);
            if (c < 128) {
                result += String.fromCharCode(c);
            }
            else if (( c > 127 ) && ( c < 2048 )) {
                result += String.fromCharCode(( c >> 6 ) | 192);
                result += String.fromCharCode(( c & 63 ) | 128);
            }
            else {
                result += String.fromCharCode(( c >> 12 ) | 224);
                result += String.fromCharCode(( ( c >> 6 ) & 63 ) | 128);
                result += String.fromCharCode(( c & 63 ) | 128);
            }
        }
        return result;
    }

    if (!String.prototype.hasOwnProperty('encode')) {
        Object.defineProperty(String.prototype, 'encode', {
            "enumerable": false,
            "configurable": false,
            "value": encode
        });
    }


    /**
     * @method returns this string cloned and decoded ASCII to utf-8
     * @returns {string}
     */

    function decode() {
        var result = "",
            index = 0,
            c = 0,
            c1 = 0,
            c2 = 0;
        while (index < this.length) {
            c = this.charCodeAt(index);
            if (c < 128) {
                result += String.fromCharCode(c);
                index++;
            }
            else if (( c > 191 ) && ( c < 224 )) {
                c2 = this.charCodeAt(index + 1);
                result += String.fromCharCode(( ( c & 31 ) << 6 ) | ( c2 & 63 ));
                index += 2;
            }
            else {
                c2 = this.charCodeAt(index + 1);
                c1 = this.charCodeAt(index + 2);
                result += String.fromCharCode(( ( c & 15 ) << 12 ) | ( ( c2 & 63 ) << 6 ) | ( c1 & 63 ));
                index += 3;
            }
        }
        return result;
    }

    if (!String.prototype.hasOwnProperty('decode')) {
        Object.defineProperty(String.prototype, 'decode', {
            "enumerable": false,
            "configurable": false,
            "value": decode
        });
    }


    /**
     * add window|global .isNaN() to Number
     */

    if (!Number.hasOwnProperty('isNaN')) {
        Object.defineProperty(Number, 'isNaN', {
            "enumerable": false,
            "configurable": false,
            "value": isNaN
        });
    }


    /**
     * @function extend is used for inheritance
     * @param constructor function
     * @param parent function|class
     * @param prototype {Object} specific added methods
     * @returns {*}
     */

    function extend(constructor, parent, prototype) {

        if (!( constructor instanceof Function )) throw new Error("First parameter should be a function.");

        if (!( prototype instanceof Object )) prototype = {};
        prototype.constructor = constructor;
        for (var i in prototype)
            if (prototype.hasOwnProperty(i) && !( prototype[i] instanceof Object && (prototype[i].value || prototype[i].get || prototype[i].set) ))
                prototype[i] = {"enumerable": false, "configurable": true, "value": prototype[i]};

        constructor.prototype = Object.create(parent && parent.prototype || null, prototype);
        return constructor;
    }

    if (!Object.hasOwnProperty('extend')) {
        Object.defineProperty(Object, 'extend', {
            "enumerable": false,
            "configurable": false,
            "value": extend
        });
    }

    /**
     * @function extendNull is used for inheritance, but doesn't inherit from Object
     * @warn the class returned IS NOT CHILD CLASS OF Object.
     * @param prototype {Object} specific added methods
     * @returns {*}
     */

    function extendNull(prototype) {

        if (!( prototype instanceof Object )) prototype = {};
        for (var i in prototype)
            if (prototype.hasOwnProperty(i))
                prototype[i] = {"enumerable": false, "configurable": true, "value": prototype[i]};

        return Object.create(null, prototype);
    }

    if (!Object.hasOwnProperty('extendNull')) {
        Object.defineProperty(Object, 'extendNull', {
            "enumerable": false,
            "configurable": false,
            "value": extendNull
        });
    }

    // should be defined as if

    function toString() {
        return "[object " + ( this.constructor.name || "Object" ) + "]";
    }

    Object.defineProperty(Object.prototype, "toString", {"enumerable": false, "value": toString});

    /**
     * @function <isClass> is used to verify a class or a function
     * @param el {*}
     * @returns {boolean}
     */

    function isClass(el) {
        return el.toString().indexOf('class') === 0;
    }

    Object.defineProperty(Function, "isClass", {
        "enumerable": true,
        "writable": false,
        "value": isClass
    });

    /**
     * @function <assign> is used to complete an object with others.
     */

    if (typeof Object.assign !== 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, "assign", {
            value: function assign(target, varArgs) { // .length of function is 2
                'use strict';
                if (target == null) { // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var to = Object(target);

                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments[index];

                    if (nextSource != null) { // Skip over if undefined or null
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            },
            writable: true,
            configurable: true
        });
    }

    function turn(int, mod) {
        if (int < 0)
            return (mod + int % mod) % mod;
        else
            return int % mod;
    }

    if(!Math.hasOwnProperty('turn')) {
        Object.defineProperty(Math, 'turn', {
            'enumerable': false,
            'configurable': true,
            'value': turn
        });
    }

    (function dateConstants(){
        var obj = {};

        obj.SUNDAY = 0;
        obj.MONDAY = 1;
        obj.TUESDAY = 2;
        obj.WEDNESDAY = 3;
        obj.THURSDAY = 4;
        obj.FRIDAY = 5;
        obj.SATURDAY = 6;

        obj.MILLISECOND_DURATION = 1;
        obj.SECOND_DURATION = obj.MILLISECOND_DURATION * 1000;
        obj.MINUTE_DURATION = obj.SECOND_DURATION * 60;
        obj.HOUR_DURATION = obj.MINUTE_DURATION * 60;
        obj.DAY_DURATION = obj.HOUR_DURATION * 24;
        obj.WEEK_DURATION = obj.DAY_DURATION * 7;

        obj.DAYS_NAME = "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(',');
        obj.MONTHS_NAME = "January,February,March,April,May,June,July,August,September,October,November,December".split(',');

        for(var key in obj){
            if(obj.hasOwnProperty(key)) {
                Object.defineProperty(Date, key, {
                    'enumerable': false,
                    'configurable': false,
                    'value': obj[key]
                });
            }
        }
        Date.FIRST_WEEK_DAY = Date.MONDAY;

    })();

    if (!Date.prototype.hasOwnProperty('getISODay')) {
        Object.defineProperty(Date.prototype, 'getISODay', {
            enumerable: false,
            configurable: true,
            value: function getISODay() {
                return Math.turn(this.getDay() - Date.FIRST_WEEK_DAY - 1, 7)
            }
        });
    }

    if (!Date.prototype.hasOwnProperty('getYearFirstWeekDay')) {
        Object.defineProperty(Date.prototype, 'getYearFirstWeekDay', {
            'enumerable': false,
            'configurable': true,
            'value': function getYearFirstWeekDay() {
                var dt = new Date(this.getFullYear(), 0, 1, 0, 0, 0, 0);
                if (dt.getISODay() > 2) {
                    dt.setDate(7 - dt.getISODay());
                }
                else {
                    dt.setDate(-dt.getISODay());
                }
                return dt;
            }
        });
    }

    if (!Date.prototype.hasOwnProperty('getWeek')) {
        Object.defineProperty(Date.prototype, 'getWeek', {
            'enumerable': false,
            'configurable': true,
            'value': function getWeek() {
                var dt = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 1, 0, 0, 0);
                var yearFirstWeekDay = this.getYearFirstWeekDay();
                return Math.floor(( dt.valueOf() - yearFirstWeekDay.valueOf() ) / Date.WEEK_DURATION);
            }
        });
    }

})();


/**
 *    Browser Polyfills
 */

this.window && (function () {


    /**
     * @method selectedOptions is a polyfill of an HTMLSelectElement which returns its options selected
     * @returns {Array}
     */

    function selectedOptions() {
        var res = [];
        this.forEach(function ($option) {
            if ($option.selected) res.push($option);
        });
        return res;
    }

    if (!HTMLSelectElement.prototype.hasOwnProperty('selectedOptions')) {
        Object.defineProperty(HTMLSelectElement.prototype, 'selectedOptions', {
            "enumerable": false,
            "configurable": false,
            "get": selectedOptions
        });
    }


    /**
     * @method remove is a polyfill for removing itself node from its parent
     * @returns {Element|CharacterData|DocumentType}
     * @compatibility
     */

    (function (arr) {
        arr.forEach(function (item) {
            if (item.hasOwnProperty('remove')) {
                return;
            }
            Object.defineProperty(item, 'remove', {
                configurable: true,
                enumerable: true,
                writable: true,
                value: function remove() {
                    if (this.parentNode !== null)
                        this.parentNode.removeChild(this);
                    return this;
                }
            });
        });
    })([Element.prototype, CharacterData.prototype, DocumentType.prototype]);


    /**
     * @method <attachShadow> attaches a shadow DOM tree to the specified element and returns a reference to its
     *      ShadowRoot.
     * @returns {*}
     * @warn just temporary before Shadow implementation.
     */


    function attachShadow() {

        if (attachShadow.old) {
            try {
                return attachShadow.old({mode: 'open'});
            }
            catch (err) {
            }
        }
        var f = new DocumentFragment();
        Object.defineProperty(this, 'shadowRoot', {
            "enumerable": true,
            "configurable": true,
            "value": f
        });
        return f;
    }

    attachShadow.old = Element.prototype.attachShadow;
    Object.defineProperty(Element.prototype, 'attachShadow', {
        "enumerable": false,
        "configurable": true,
        "value": attachShadow
    });


    /**
     * @method formToJSON is used to translate an HTMLFormElement to a JSON object
     * @returns {{name: *, data: {}}}
     */

    function formToJSON() {
        var res = {}, type;
        for (var i = 0; i < this.length; i++) {
            var input = this[i], value;
            if (input.nodeName.toUpperCase() === "INPUT") {
                value = ( ( type = input.attr('type') ) && ( type.toUpperCase() === "CHECKBOX" ) ) ? input.checked : input.value;
            }
            else if (input.nodeName.toUpperCase() === "TEXTAREA") {
                value = input.value;
            }
            else if (input.nodeName.toUpperCase() === "SELECT") {
                if (input.attr('multiple') !== null) {
                    var all = [];
                    input.selectedOptions.forEach(function ($option) {
                        all.push($option.value);
                    });
                    value = all;
                }
                else {
                    value = input.value;
                }
            }
            res[input.name] = value;
        }
        return {
            "name": this.attr('name'),
            "data": res
        };
    }

    Object.defineProperty(HTMLFormElement.prototype, 'toJSON', {
        "enumerable": false,
        "configurable": false,
        "value": formToJSON
    });

    ([HTMLCollection.prototype, NodeList.prototype, HTMLSelectElement.prototype, HTMLFormElement.prototype]).forEach(function (proto) {

        proto.forEach = Array.prototype.forEach;
        proto.indexOf = Array.prototype.indexOf;
    });

})();


/**
 *    class Uniq is used to create unique object referenced by a uniq identifiant 'id'.
 *    if a Uniq object has no id, then the value is automaticly set, that doesn't match definitive id or another temporary id.
 *    if a Uniq object set his id, the object move from temporary to definitive objects and cannot be overriden.
 *    if a Uniq object is set by same id than another Uniq definitive object, then throw an error.
 *    if a Uniq object is set by same id than another Uniq temporary object, then the temporary reset his id.
 */

(function (context) {

    var all = {};
    var ids = {};

    function getById(name, id) {
        if (all[name]) for (var a in all[name]) {
            if (all[name].hasOwnProperty(a) && all[name][a].id === id) return all[name][a];
        }
        return null;
    }

    function nextId(name) {
        var max = 1, a;
        if (all[name]) {
            for (a in all[name]) {
                if (all[name].hasOwnProperty(a) && all[name][a].id >= max)
                    max = all[name][a].id + 1;
            }
        }
        return max;
    }

    function setNextId(name, id) {
        ids[name] = id;
    }


    function getAll(name) {
        if (all[name])
            return all[name];
        else
            return [];
    }

    function toString() {
        return "[object " + this.constructor.name + ":" + this.__id__ + "]";
    }


    /**
     * @warn not an Object child class !!
     * @constructor create an object with an ID, which is null until its set by user.
     * @param id number
     * @param name
     */

    function Uniq(id, name) {
        name = name || this.constructor.name;
        if (!all[name]) all[name] = [];
        if (!ids[name]) ids[name] = 1;
        if (id) {
            var t;
            if (( t = getById(name, id) ) && ( t !== this ))
                throw new Error('An instance of ' + name + ' already has id \'' + id + '\'.');
            if (ids[name] < id)
                ids[name] = id + 1;
            Object.defineProperty(this, '__id__', {
                'enumerable': false,
                'configurable': false,
                'value': id
            });
        }
        else {
            Object.defineProperty(this, '__id__', {
                'enumerable': false,
                'writable': true,
                'value': null
            });
        }
        all[name].push(this);
    }


    /**
     * @method is used to set DEFINITELY id of the Uniq instance.
     * @warn if you want to synchronize with a server, please beware to set id by the server response id.
     * @param id number
     * @private
     */

    function _set(id) {
        var name = this.constructor.name, t;

        if (this.__id__ !== null)
            throw new Error('This instance has already an id (' + this.__id__ + ').');

        if (( t = getById(name, id) ) && ( t !== this ))
            throw new Error('An instance of ' + name + ' already has id \'' + id + '\'.');

        if (ids[name] < id)
            ids[name] = id + 1;

        Object.defineProperty(this, '__id__', {
            'enumerable': false,
            'configurable': false,
            'value': id
        });
    }

    Object.extend(Uniq, null, {
        'id': {
            'enumerable': true,
            'configurable': false,
            'get': function () {
                return this.__id__;
            },
            'set': _set
        },
        'toString': toString
    });


    Uniq.getById = getById;
    Uniq.getAll = getAll;
    Uniq.nextId = nextId;
    Uniq.setNextId = setNextId;
    context.Uniq = Uniq;

})(this.window || this.require.exports);


/**
 *    This context instances the DOM selector :
 *        (window|Node).$(String, [Function])   // (Node) select first match
 *        (window|Node).$$(String, [Function])  // (Array) select all matches
 *        Node.prependChild(Node)               // insert into as first child
 *        Node.getParent(String)                // select first parent match node type
 *        Node.isChildOf(Node)
 *        Node.isParentOf(Node)
 */

this.window && (function (context) {

    function auto(prop, fn_auto, parent) {
        var matched = [];
        $.load(function (ev) {
            var fn = function (ev) {

                var match = [],
                    added = [],
                    removed = [];
                parent.$$(prop).forEach(function ($el) {
                    match.push($el);
                });
                matched.forEach(function ($el) {
                    if (match.indexOf($el) === -1)
                        removed.push($el);
                });
                match.forEach(function ($el) {
                    if (matched.indexOf($el) === -1)
                        added.push($el);
                });
                ev.added = added.slice();
                ev.removed = removed.slice();
                ev.match = match.slice();

                added.forEach(function ($el, key, all) {
                    fn_auto(ev, $el, key, all);
                });

                matched = match;
            };
            $.change(fn);
            fn(ev);
        });
    }

    //  SELECTORS
    context.$ = function $(prop, fn_auto) {
        if (prop instanceof Function)
            return context.$.load(prop);
        if (arguments.length === 1)
            return document.querySelector(prop);
        if (arguments.length === 2)
            return auto(prop, fn_auto, context);
        return null;
    };
    context.$$ = function $$(prop, fn_auto) {
        if (arguments.length === 1)
            return document.querySelectorAll(prop);
        if (arguments.length === 2)
            return auto(prop, fn_auto, context);
        return null;
    };

    ([Element.prototype, DocumentFragment.prototype, HTMLDocument.prototype]).forEach(function (proto) {

        proto.$ = function $(prop, fn_auto) {
            if (arguments.length === 1)
                return this.querySelector(prop);
            if (arguments.length === 2)
                return auto(prop, fn_auto, this);
            return null;
        };
        proto.$$ = function $$(prop, fn_auto) {
            if (arguments.length === 1)
                return this.querySelectorAll(prop);
            if (arguments.length === 2)
                return auto(prop, fn_auto, this);
            return null;
        };

    });

    Node.prototype.prependChild = function prependChild($el) {
        if (this.firstChild) {
            this.insertBefore($el, this.firstChild);
        }
        else {
            this.appendChild($el);
        }
        return this;
    };

    Element.prototype.isChildOf = function isChildOf($parent) {
        var $el = this;
        while ($el = $el.parentNode) {
            if ($el === $parent)
                return true;
        }
        return false;
    };

    Element.prototype.isParentOf = function isParentOf($child) {
        return $child.isChildOf(this);
    };

    Element.prototype.getParent = function getParent(nodeType) {
        if (nodeType) {
            nodeType = nodeType.toLowerCase();
            var $el = this;
            while ($el = $el.parentNode) {
                if ($el.nodeName.toLowerCase() === nodeType)
                    return $el;
            }
            return null;
        }
        else {
            return this.parentNode;
        }
    };

})(this.window);


/**
 *    This context instances function for Node self modification:
 *        create
 *        createSVG
 *        attr
 *        css
 *        generateID
 */

this.window && (function (context) {

    var SVGNS = "http://www.w3.org/2000/svg";

    /**
     * @method setStyles set the style <style> to value <value> of this instance of Element in DOM,
     *      or return <style> value if <value> is not used,
     *      or remove <style> if <value> is null or undefined
     * @param style string|{Object}
     * @param value string
     * @param prior string
     * @returns {*}
     * @throws Error|TypeError
     */

    function setStyles(style, value, prior) {
        if (this instanceof Element) {
            if (style instanceof Object) {
                for (var s in style) {
                    if (style.hasOwnProperty(s)) {
                        setStyles.call(this, s, style[s]);
                    }
                }
            }
            else {
                if (typeof style === "string") {
                    if (arguments.length === 2) {
                        if (value === undefined || value === null) {
                            this.style.removeProperty(style);
                        }
                        else {
                            this.style.setProperty(style, value, prior || '');
                        }
                    }
                    else {
                        return this.style.getPropertyValue(style);
                    }
                }
                else {
                    throw new TypeError("First parameter should be an Object or a String.");
                }
            }
            return this;
        }
        else {
            throw new TypeError("This context should be an Element context.");
        }
    }


    /**
     * @method setAttributes set the attribute <attr> to value <value> of this instance of Element in DOM,
     *      or return <attr> value if <value> is not used,
     *      or remove <attr> if <value> is null or undefined
     * @param attr
     * @param value
     * @returns {*}
     * @throws Error|TypeError
     */

    function setAttributes(attr, value) {
        if (this instanceof Element) {
            if (attr instanceof Object) {
                for (var a in attr) {
                    if (attr.hasOwnProperty(a)) {
                        setAttributes.call(this, a, attr[a]);
                    }
                }
            }
            else {
                if (typeof attr === "string") {
                    if (attr === "style" && value instanceof Object) {
                        setStyles.call(this, value);
                    }
                    else {
                        if (arguments.length === 2) {
                            if (value === undefined || value === null) {
                                this.removeAttribute(attr);
                            }
                            else {
                                this.setAttribute(attr, value);
                            }
                        }
                        else {
                            return this.getAttribute(attr);
                        }
                    }
                }
                else {
                    throw new TypeError("First parameter should be an Object or a String.");
                }
            }
            return this;
        }
        else {
            throw new TypeError("This context should be an Element context.");
        }
    }

    var isSimpleSelector = /^[\w\-_#.\[="' \]]+$/g;
    var getSelectorNodetype = /^[\w-]*/;
    var getSelectorClasses = /\.[\w-]+/g;
    var getSelectorId = /#[\w-]+/;
    var getSelectorAttributes = /\[[\w-]+(=[^\]=]+)?\]/g;
    var getSelectorAttributeSplit = /\[([\w-]+)(=([^\]=]+))?\]/;

    var isNodetypeName = /^[\w-]+$/g;

    function createFromHTML(html) {
        var $incubator = document.createElement("div");
        $incubator.innerHTML = html;
        return $incubator.childNodes;
    }

    function createSVGFromHTML(html) {
        var $incubator = document.createElementNS(SVGNS, "div");
        $incubator.innerHTML = html;
        return $incubator.childNodes;
    }

    function createFromSimpleSelector(simpleSelector) {
        var t;
        var nodeType = ( t = simpleSelector.match(getSelectorNodetype) ) && t[0] || "div";
        var id = ( t = simpleSelector.match(getSelectorId) ) && t[0].substr(1);
        var _classes = simpleSelector.match(getSelectorClasses), classes = [];
        var attributes = simpleSelector.match(getSelectorAttributes);
        var attr = {};

        if (attributes) {
            attributes.forEach(function (el) {
                var split = el.match(getSelectorAttributeSplit);
                attr[split[1]] = split[3] || "";
            });
        }

        if (_classes) {
            _classes.forEach(function (clas) {
                classes.push(clas.substr(1));
            });
            attr["class"] = classes.join(" ");
        }

        if (id) {
            attr["id"] = id;
        }

        var $el = document.createElement(nodeType);
        $el.attr(attr);

        return $el;
    }

    function createSVGFromSimpleSelector(simpleSelector) {
        var t;
        var nodeType = ( t = simpleSelector.match(getSelectorNodetype) ) && t[0] || "g";
        var id = ( t = simpleSelector.match(getSelectorId) ) && t[0].substr(1);
        var _classes = simpleSelector.match(getSelectorClasses), classes = [];
        var attributes = simpleSelector.match(getSelectorAttributes);
        var attr = {};

        if (attributes) {
            attributes.forEach(function (el) {
                var split = el.match(getSelectorAttributeSplit);
                attr[split[1]] = split[3] || "";
            });
        }

        if (_classes) {
            _classes.forEach(function (clas) {
                classes.push(clas.substr(1));
            });
            attr["class"] = classes.join(" ");
        }

        if (id) {
            attr["id"] = id;
        }

        var $el = document.createElementNS(SVGNS, nodeType);
        $el.attr(attr);

        return $el;
    }


    /**
     * @function create create a Node, where <html> define the constructor, <attr> define the attributes and styles,
     *      and <children> is a Node or a string, or an Array or NodeList of Node or String, append as child of this
     *      new Node.
     * @param html string constructor of the new Node
     * @param attr {Object}
     * @param children Element|[Node|string..]|NodeList|string
     * @returns Node
     */

    function create(html, attr, children) {

        var $node;

        if (typeof html === "string") {
            html = html.trim();
            if (html.match(isSimpleSelector)) {
                $node = createFromSimpleSelector(html);
            }
            else {
                if (html.match(isNodetypeName)) {
                    $node = document.createElement(html);
                }
                else {
                    $node = createFromHTML(html);
                }
            }
        }
        else {
            throw new TypeError("First parameter is not a string.");
        }

        if (attr instanceof Object) {
            $node.attr(attr);
        }

        if (children instanceof Element) {
            $node.appendChild(children);
        }
        else {
            if (typeof children === "string") {
                children = [children];
            }
            if (children && children.forEach) {
                children.forEach(function ($el) {
                    if ($el instanceof Node) {
                        $node.appendChild($el);
                    }
                    else {
                        if (typeof $el === "string") {
                            $node.appendChild(document.createTextNode($el));
                        }
                        else {
                            console.error($el);
                            throw new TypeError("Parameter should be Node instance or a String.");
                        }
                    }
                });
            }
        }

        return $node;
    }


    /**
     * @function create create a Node for SVG context, where <html> define the constructor, <attr> define the
     *      attributes and styles, and <children> is a Node or a string, or an Array or NodeList of Node or String,
     *      append as child of this new Node.
     * @param html string constructor of the new SVG Node
     * @param attr {Object}
     * @param children Element|[Node|string..]|NodeList|string
     * @returns Node
     */

    function createSVG(html, attr, children) {

        var $node;

        if (typeof html === "string") {
            html = html.trim();
            if (html.match(isSimpleSelector)) {
                $node = createSVGFromSimpleSelector(html);
            }
            else {
                if (html.match(isNodetypeName)) {
                    $node = document.createElementNS(SVGNS, html);
                }
                else {
                    $node = createSVGFromHTML(html);
                }
            }
        }
        else {
            throw new TypeError("First parameter is not a string.");
        }

        if (attr instanceof Object) {
            $node.attr(attr);
        }

        if (children instanceof Element) {
            $node.appendChild(children);
        }
        else {
            if (children instanceof Array || children instanceof NodeList) {
                children.forEach(function ($el) {
                    if ($el instanceof Node) {
                        $node.appendChild($el);
                    }
                    else {
                        if (typeof $el === "string") {
                            $node.appendChild(document.createTextNode($el));
                        }
                        else {
                            throw new TypeError("Parameter should be Node instance or a String.");
                        }
                    }
                });
            }
            else {
                if (typeof children === "string") {
                    $node.appendChild(document.createTextNode(children));
                }
            }
        }

        return $node;
    }


    /**
     * @method generateID is used for generating a unique ID for this element, and to sibling it easily.
     * @returns {string} the ID.
     */

    function generateID() {
        if (this instanceof Element) {
            var id;
            do {
                id = Math.round(Math.random() * 0xfffffffffffff).toString(16);
            }
            while ($("#id" + id));
            return this.id = "id" + id;
        }
    }

    Element.prototype.attr = setAttributes;
    Element.prototype.css = setStyles;
    Element.prototype.generateID = generateID;

    HTMLCollection.prototype.attr = NodeList.prototype.attr = function (field, value) {
        this.forEach(function ($el) {
            $el.attr(field, value);
        });
        return this;
    };
    HTMLCollection.prototype.css = NodeList.prototype.css = function (field, value) {
        this.forEach(function ($el) {
            $el.css(field, value);
        });
        return this;
    };

    context.$.create = create;
    context.$.createSVG = createSVG;


})(this.window);


/**
 *    Override class Event for customizing events, inheritance, arguments etc.
 */

this.window && (function (context) {

    var Original = context.Event;

    function preventDefault() {
        if (this.detail instanceof context.MutationObserver) {
            this.detail.defaultPrevented = true;
        }
        if (this.parent && this.parent.preventDefault) {
            this.parent.preventDefault();
        }
        else {
            this.defaultPrevented = true;
        }
        return this;
    }

    function stopPropagation() {
        if (this.detail instanceof context.MutationObserver) {
            this.detail.propagationStopped = true;
        }
        if (this.parent && this.parent.stopPropagation) {
            this.parent.stopPropagation();
        }
        else {
            this.propagationStopped = true;
        }
        return this;
    }

    function stopImmediatePropagation() {
        if (this.detail instanceof context.MutationObserver) {
            this.detail.propagationStopped = true;
        }
        if (this.parent && this.parent.stopImmediatePropagation) {
            this.parent.stopImmediatePropagation();
        }
        else {
            this.propagationStopped = true;
        }
        return this;
    }

    function def(field, value) {
        Object.defineProperty(this, field, {
            "enumerable": true,
            "writable": false,
            "value": value
        });
    }

    function deff(obj) {
        for (var field in obj)
            if (obj.hasOwnProperty(field))
                def.call(this, field, obj[field]);
    }

    function Event(type, params, target) {

        if (!(this instanceof Event))
            return new Event(type, params, target);

        var parent;
        if (type instanceof context.Event || type instanceof context.Event.Original) {
            parent = type;
            type = parent.type;
        }

        var defs = {};
        defs['type'] = type;
        defs['parent'] = parent;
        defs['currentTarget'] = target;
        defs['timestamp'] = Date.now();

        if (!parent) {
            parent = {};
            this.defaultPrevented = false;
            this.propagationStopped = false;
        }
        else {
            var self = this;
            Object.defineProperty(this, 'defaultPrevented', {
                "get": function () {
                    return self.parent.defaultPrevented;
                }
            });
            Object.defineProperty(this, 'propagationStopped', {
                "get": function () {
                    return self.parent.propagationStopped;
                }
            });
        }

        var original = parent.originalTarget || parent.srcElement || target || null;
        defs['detail'] = params || parent.detail || null;
        defs['value'] = original;
        defs['originalTarget'] = original;
        defs['target'] = original;

        if (!params) params = {};
        defs['cancelable'] = params.cancelable || parent.cancelable || true;
        defs['bubbles'] = params.bubbles || parent.bubbles || true;

        if (!defs['parent'] && context.document && context.document.createEvent) {
            var ev = context.document.createEvent("Event");
            if (this.detail) ev.detail = this.detail;
            ev.initEvent(type, true, true);
            defs['parent'] = ev;
        }

        deff.call(this, defs);
    }

    Object.extend(Event, {}, {
        'preventDefault': preventDefault,
        'stopPropagation': stopPropagation,
        'stopImmediatePropagation': stopImmediatePropagation
    });

    Event.Original = Original;
    context.Event = Event;

})(this.window);


/**
 *    Declare event functions for EvenTarget instances.
 *    Use the class Event overrided.
 *        on
 *        dispatch
 *        detach
 */

(function (context) {

    function is_string(el) {
        return typeof el === 'string';
    }

    function is_list(el) {
        return (typeof el === 'object') && (el instanceof Array);
    }

    function is_function(el) {
        return (typeof el === 'function');
    }

    function is_object(el) {
        return (typeof el === 'object');
    }

    //  EVENTS

    /**
     * @method <on> add a function, which is executed at <even> in this object.
     * @param event {string|Array}
     * @param fn {function|Array}
     * @returns {EventTarget}
     */

    function on(event, fn) {
        if (is_string(event)) {
            event = event.toLowerCase();
            var split = event.split(/[, ]+/g);
            if (split.length >= 2) {
                on.call(this, split, fn);
                return this;
            }
        }
        if (is_list(event)) {
            for (var ev in event)
                if (event.hasOwnProperty(ev))
                    on.call(this, event[ev], fn);
            return this;
        }
        if (is_list(fn)) {
            for (var f in fn)
                if (fn.hasOwnProperty(f))
                    on.call(this, event, fn[f]);
            return this;
        }

        if (!this.__events__) {
            Object.defineProperty(this, '__events__', {
                "enumerable": false,
                "configurable": false,
                "writable": false,
                "value": {}
            });
        }

        var self = this;
        if (is_string(event) && is_function(fn)) {

            if (this.addEventListener && !this.__events__[event]) {
                this.addEventListener(event, function (ev) {
                    arguments[0] = new Event(ev, null, self);
                    dispatch.apply(self, arguments)
                });
            }

            if (this.attachEvent && !this.__events__[event]) {
                this.attachEvent(event, function (ev) {
                    arguments[0] = new Event(ev, null, self);
                    dispatch.apply(self, arguments)
                });
            }

            if (!is_list(this.__events__[event]))
                this.__events__[event] = [];

            this.__events__[event].push(fn);
        }
        return this;
    }

    /**
     * @method <detach> is used to revoke a function <fn> or every functions if undefined, to call $when <event> is
     * dispatched.
     * @param event {string|Array}
     * @param fn {function|Array|undefined}
     * @returns {EventTarget}
     */

    function detach(event, fn) {

        if (is_string(event)) {
            event = event.toLowerCase();
            var split = event.split(/[, ]+/g);
            if (split.length >= 2) {
                detach.call(this, split, fn);
                return this;
            }
        }
        if (is_list(event)) {
            for (var ev in event)
                if (event.hasOwnProperty(ev))
                    detach.call(this, event[ev], fn);
            return this;
        }
        if (is_list(fn)) {
            for (var f in fn)
                if (fn.hasOwnProperty(f))
                    detach.call(this, event, fn[f]);
            return this;
        }

        if (!this.__events__) {
            Object.defineProperty(this, '__events__', {
                "enumerable": false,
                "configurable": false,
                "writable": false,
                "value": {}
            });
        }


        if (is_string(event) && is_list(this.__events__[event])) {
            if (is_function(fn)) {
                var res = [], t;
                while (t = this.__events__[event].shift()) {
                    if (t !== fn)
                        res.push(t);
                }
                this.__events__[event] = res;
            }
            else {
                this.__events__[event] = [];
            }
        }
        return this;
    }

    /**
     * @method <dispatch> is used to call every functions of <event> asynchronously after a short timeout, with
     * arguments <arg>.
     * @param event {Event|string|Array}
     * @param args {Array|undefined}
     * @returns {EventTarget}
     */

    function dispatch(event, args) {

        if (is_string(event)) {
            event = event.toLowerCase();
            var split = event.split(/[, ]+/g);
            if (split.length >= 2) {
                dispatch.call(this, split, args);
                return this;
            }
        }
        if (is_list(event)) {
            for (var ev in event)
                if (event.hasOwnProperty(ev))
                    dispatch.call(this, event[ev], args);
            return this;
        }

        var obj;
        if (is_string(event))
            obj = new Event(event);
        else if (is_object(event)) {
            obj = event;
            event = event.type;
        }
        else {
            obj = new Event("");
            event = "";
        }

        if (!this.__events__) {
            Object.defineProperty(this, '__events__', {
                "enumerable": false,
                "configurable": false,
                "writable": false,
                "value": {}
            });
        }

        var self = this;
        if (is_list(this.__events__[event])) {

            this.__events__[event].done = obj;

            if (!is_list(args)) {
                if (args === undefined) args = [];
                else args = [args];
            }
            args.unshift(obj);

            this.__events__[event].forEach(function (fn) {
                if (is_function(fn)) {
                    setTimeout(function () {
                        fn.apply(self, args);
                    }, 1);
                }
            });
        }
        else {
            this.__events__[event] = [];
            this.__events__[event].done = obj;
        }
        return this;
    }

    /**
     * @method <dispatchSync> is used to call every functions of <event> synchronously, with arguments <arg>.
     * @param event {string|Array}
     * @param args {Array|undefined}
     * @returns {EventTarget}
     */

    function dispatchSync(event, args) {

        if (is_string(event)) {
            event = event.toLowerCase();
            var split = event.split(/[, ]+/g);
            if (split.length >= 2) {
                dispatchSync.call(this, split, args);
                return this;
            }
        }
        if (is_list(event)) {
            for (var ev in event)
                if (event.hasOwnProperty(ev))
                    dispatchSync.call(this, event[ev], args);
            return this;
        }

        var obj;
        if (is_string(event))
            obj = new Event(event);
        else if (is_object(event)) {
            obj = event;
            event = event.type;
        }
        else {
            obj = new Event("");
            event = "";
        }

        if (!this.__events__) {
            Object.defineProperty(this, '__events__', {
                "enumerable": false,
                "configurable": false,
                "writable": false,
                "value": {}
            });
        }

        if (is_list(this.__events__[event])) {

            this.__events__[event].done = obj;

            if (!is_list(args)) {
                if (args === undefined) args = [];
                else args = [args];
            }
            args.unshift(obj);

            for (var fn in this.__events__[event]) {
                if (this.__events__[event].hasOwnProperty(fn) && is_function(this.__events__[event][fn])) {
                    this.__events__[event][fn].apply(this, args);
                }
            }
        }
        else {
            this.__events__[event] = [];
            this.__events__[event].done = obj;
        }

        return this;
    }

    /**
     * @method <once> register the function <fn> for this <event>, then execute it if event already happened
     * @param event {string|Array}
     * @param fn {function|Array}
     * @param args {Object|undefined}
     * @returns {EventTarget}
     */

    function once(event, fn, args) {
        if (is_string(event)) {
            event = event.toLowerCase();
            var split = event.split(/[, ]+/g);
            if (split.length >= 2) {
                once.call(this, split, fn);
                return this;
            }
        }
        if (is_list(event)) {
            for (var ev in event)
                if (event.hasOwnProperty(ev))
                    once.call(this, event[ev], fn);
            return this;
        }

        on.call(this, event, fn);

        if (this.__events__[event].done && is_function(fn)) {
            var obj = this.__events__[event].done,
                self = this;

            if (is_list(this.__events__[event])) {

                if (!is_list(args)) {
                    if (args === undefined) args = [];
                    else args = [args];
                }
                args.unshift(obj);

                setTimeout(function () {
                    fn.apply(self, args);
                }, 1);
            }
        }

        return this;
    }

    /**
     * @method <onceSync> register the function <fn> for the <event>, then execute it if event already happened
     * @param event {Event|Array|string}
     * @param fn {function|Array}
     * @param args {Array|undefined}
     * @returns {onceSync}
     */

    function onceSync(event, fn, args) {
        if (is_string(event)) {
            event = event.toLowerCase();
            var split = event.split(/[, ]+/g);
            if (split.length >= 2) {
                onceSync.call(this, split, fn);
                return this;
            }
        }
        if (is_list(event)) {
            for (var ev in event)
                if (event.hasOwnProperty(ev))
                    onceSync.call(this, event[ev], fn);
            return this;
        }

        on.call(this, event, fn);

        if (this.__events__[event].done && is_function(fn)) {
            var obj = this.__events__[event].done;

            if (is_list(this.__events__[event])) {

                if (!is_list(args)) {
                    if (args === undefined) args = [];
                    else args = [args];
                }
                args.unshift(obj);
                fn.apply(this, args);
            }
        }

        return this;
    }

    /**
     * @method count recorded functions of an event <event> name.
     * @param event {string}
     * @returns {null|number} null if <event> never used before
     */

    function count(event) {
        return is_string(event) && is_list(this.__events__[event]) ?
            this.__events__[event].length :
            null;
    }


    /**
     * @alias on
     */

    function onAll(eventName, fn) {
        this.forEach(function ($el) {
            $el.on(eventName, fn);
        });
        return this;
    }

    /**
     * @alias detach
     */

    function detachAll(eventName, fn) {
        this.forEach(function ($el) {
            $el.detach(eventName, fn);
        });
        return this;
    }

    /**
     * @alias dispatch
     */

    function dispatchAll(eventName, args) {
        this.forEach(function ($el) {
            $el.dispatch(eventName, args);
        });
        return this;
    }

    /**
     * @alias dispatchSync
     */

    function dispatchAllSync(eventName, args) {
        this.forEach(function ($el) {
            $el.dispatchSync(eventName, args);
        });
        return this;
    }

    /**
     * @alias once
     */

    function onceAll(eventName, fn, args) {
        this.forEach(function ($el) {
            $el.once(eventName, fn, args);
        });
        return this;
    }

    /**
     * @alias onceSync
     */

    function onceAllSync(eventName, fn, args) {
        this.forEach(function ($el) {
            $el.onceSync(eventName, fn, args);
        });
        return this;
    }


    function _declare() {

        function EventTarget() {

            if (!this.__events__) {
                Object.defineProperty(this, '__events__', {
                    "enumerable": false,
                    "configurable": false,
                    "writable": false,
                    "value": {}
                })
            }

        }

        Object.extend(EventTarget, {}, {
            "on": on,
            "dispatch": dispatch,
            "dispatchSync": dispatchSync,
            "once": once,
            "onceSync": onceSync,
            "detach": detach,
            "count": count
        });

        return EventTarget;

    }

    //	EventTargets
    ([Window.prototype, Node.prototype, XMLHttpRequest.prototype]).forEach(function (proto) {
        proto.on = on;
        proto.detach = detach;
        proto.dispatch = dispatch;
        proto.dispatchSync = dispatchSync;
        proto.once = once;
        proto.onceSync = onceSync;
    });

    (function (self) {
        self.on = on.bind(self);
        self.detach = detach.bind(self);
        self.dispatch = dispatch.bind(self);
        self.dispatchSync = dispatchSync.bind(self);
        self.once = once.bind(self);
        self.onceSync = onceSync.bind(self);
    })(context);

    //	List of EventTargets
    ([HTMLCollection.prototype, NodeList.prototype]).forEach(function (proto) {
        proto.on = onAll;
        proto.detach = detachAll;
        proto.dispatch = dispatchAll;
        proto.dispatchSync = dispatchAllSync;
        proto.once = onceAll;
        proto.onceSync = onceAllSync;
    });

    context.EventTarget = _declare();

})(this.window || this.module.exports);


/**
 *    Listen environment changes and fire them, and fire to parents until a stopPropagation() :
 *        domadd,
 *        domremove,
 *        domtextchange,
 *        domattributechange,
 *        domchange
 *    Global:
 *        $.load
 *        $.change
 */

this.window && (function (context) {

    function isLoaded() {
        return isLoaded.end;
    }

    function onload(fn) {
        window.on("load", fn);
        if (isLoaded()) {
            fn(new Event("load"));
        }
    }

    function onchange(fn) {
        return window.on("domchange", fn);
    }

    $.load = onload;
    $.change = onchange;

    $.load(function () {
        Object.defineProperty(isLoaded, "end", {"configurable": false, "value": true});
    });

    (function () {
        function fire(name, mut, $el) {
            var ev = new Event(name, mut);
            $el.dispatch(ev);

            while (($el = $el.parentNode) && !mut.propagationStopped) {
                ev = new Event(ev, null, $el);
                $el.dispatch(ev);
            }

            if (!mut.propagationStopped) {
                ev = new Event(ev, null, context);
                context.dispatch(ev);
            }
        }

        function fireDomRemove(mut, $original) {
            fire('domremove', mut, $original);
        }

        function fireDomAdd(mut, $original) {
            fire('domadd', mut, $original);
        }

        function fireDomChange(mut, $original) {
            fire('domchange', mut, $original);
        }

        function fireDomAttr(mut, $original) {
            fire('domattributechange', mut, $original);
        }

        function fireTextChange(mut, $original) {
            fire('domtextchange', mut, $original);
        }

        var mo = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.propagationStopped = false;

                if (mutation.addedNodes.length) {
                    for (var a in mutation.addedNodes) {
                        if (mutation.addedNodes.hasOwnProperty(a)) {
                            if (mutation.addedNodes[a] instanceof context.HTMLElement) {
                                fireDomAdd(mutation, mutation.addedNodes[a]);
                                fireDomChange(mutation, mutation.addedNodes[a]);
                            }
                        }
                    }
                }

                if (mutation.removedNodes.length) {
                    for (var r in mutation.removedNodes) {
                        if (mutation.removedNodes.hasOwnProperty(r)) {
                            if (mutation.removedNodes[r] instanceof context.HTMLElement) {
                                fireDomRemove(mutation, mutation.removedNodes[r]);
                                fireDomChange(mutation, mutation.removedNodes[r]);
                            }
                            else if (mutation.removedNodes[r] instanceof context.Text) {
                                fireTextChange(mutation, mutation.removedNodes[r]);
                            }
                        }
                    }
                }

                if (mutation.type === "attributes") {
                    fireDomAttr(mutation, mutation.target);
                    fireDomChange(mutation, mutation.target);
                }
            });
        });

        var cnf = {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        };

        mo.observe($("html"), cnf);
    })();

})(this.window);


/**
 *  class Url is used to easily write or modify a URL, properly!
 *  it complete the value in first parameter with this context.
 *  use like this :
 *  -   `Url('any.com')` -> 'http://any.com/'
 *  -   `Url('wsocket://any.com')` -> 'wsocket://any.com/'
 *  -   `Url('any.com/folder/file.suf')` -> 'http://any.com/folder/file.suf'
 *  -   `Url('any.com/?any=test&foo=bar?hello=world')` -> 'http://any.com/?any="test"&foo="bar"&hello="world"'
 *  -   `Url('any.com/#/any:test/foo:bar/hello:world')` -> 'http://any.com/#/any:"test"/foo:"bar"/hello:"world"'
 *  JSON.Stringify arguments
 */

this.window && (function (context) {

    // HASH
    var Hash = function (value) {

        this._value = {};

        if (typeof value === "string")
            value = split(value.replace(/\/\//g, '/'), "/", ":");

        if (value instanceof Object)
            for (var field in value)
                this.add(field, value[field]);
    };
    // GET ARGUMENTS
    var Arg = function (value) {

        this._value = {};

        if (typeof value === "string")
            value = split(value.replace(/(&&)|\?+/g, '&'), "&", "=");

        if (value instanceof Object)
            for (var field in value)
                this.add(field, value[field]);
    };

    function obj_add(field, value) {
        if (this[field] !== undefined)
            throw new Error("First parameter should not be \"" + field + "\" as a resource name, this name is already used.");
        Object.defineProperty(this, field, {
            "get": function () {
                return this._value[field];
            }.bind(this),
            "set": function (v) {
                this._value[field] = v;
            }.bind(this),
            "enumerable": true,
            "configurable": true
        });
        this[field] = value;
        return this;
    }

    function obj_remove(field) {
        var v = this._value[field];
        this._value[field] = undefined;
        return v;
    }

    function hash_string() {
        return join(this._value, "/", ":");
    }

    function arg_string() {
        return join(this._value, "&", "=");
    }

    Object.extend(Hash, {}, {
        'add': obj_add,
        'remove': obj_remove,
        'toString': hash_string
    });

    Object.extend(Arg, {}, {
        'add': obj_add,
        'remove': obj_remove,
        'toString': arg_string
    });


    function list_push(value) {
        this._value.push(value);
        return this;
    }

    function list_pop() {
        return ( this._value.pop() );
    }

    // PATH
    var Path = function (value) {

        this._value = [];

        if (typeof value === "string")
            value = split(value.replace(/\/\//g, '/'), "/");

        if (value instanceof Array) {
            var c = split(getPath(window.location.href), "/");
            c.pop();

            while (value[0] === "..") {
                value.shift();
                c.pop();
            }

            if (value[0] === "" && ( !value[1] || value[1].match(/[^\/]/) )) {
                for (var k in value)
                    this.push(value[k]);
            }
            else {
                if (value[0] === ".") value.shift();
                var y;

                while (c.length) if (y = c.shift()) this.push(y);
                while (value.length) if (y = value.shift()) this.push(y);
            }
        }

    };

    function path_string() {
        return join(this._value, "/");
    }

    // DNS
    var Dns = function (value) {

        this._value = [];

        if (typeof value === "string")
            value = split(value, ".").reverse();

        if (value instanceof Array) {
            for (var v in value)
                this.push(value[v]);
        }
    };

    function dns_string() {
        return join(this._value.slice().reverse(), ".");
    }

    Object.extend(Path, {}, {
        'push': list_push,
        'pop': list_pop,
        'toString': path_string
    });

    Object.extend(Dns, {}, {
        'push': list_push,
        'pop': list_pop,
        'toString': dns_string
    });


    // MAIN: URL
    var Url = function (value) {

        if (!(this instanceof Url))
            return new Url(value);

        var t = window.location.href;
        if (!value) value = t;

        if (!value.match(/:\/\//)) {
            this._protocol = getProtocol(t);
            this._dns = new Dns(getDNS(t));
            this.port = getPort(t);
            this._path = new Path(value.match(/^[^?#]*/)[0] || getPath(t));
            this._arg = new Arg(getArg(value));
            this._hash = new Hash(getHash(value));
        }
        else {
            if (value.match(/^\?/)) {
                this._protocol = getProtocol(t);
                this._dns = new Dns(getDNS(t));
                this.port = getPort(t);
                this._path = new Path(getPath(t));
                this._arg = new Arg(getArg(value));
                this._hash = new Hash(getHash(value));
            }
            else {
                if (value.match(/^#/)) {
                    this._protocol = getProtocol(t);
                    this._dns = new Dns(getDNS(t));
                    this.port = getPort(t);
                    this._path = new Path(getPath(t));
                    this._arg = new Arg(getArg(t));
                    this._hash = new Hash(getHash(value));
                }
                else {
                    this._protocol = getProtocol(value) || getProtocol(t);
                    this._dns = new Dns(getDNS(value));
                    this.port = getPort(t);
                    this._path = new Path(getPath(value));
                    this._arg = new Arg(getArg(value));
                    this._hash = new Hash(getHash(value));
                }
            }
        }
    };

    function getHash(str) {
        var t = str.match(/#(.*)$/);
        if (t && t[1]) return t[1];
        return null;
    }

    function getArg(str) {
        var t = str.match(/\?([^#]*)/);
        if (t && t[1]) return t[1];
        return null;
    }

    function getPath(str) {
        var t = str.match(/\w(\/[^?#]*)/);
        if (t && t[1]) return t[1];
        return null;
    }

    function getDNS(str) {
        var t = str.match(/:\/\/([^\/?#:]*)/);
        if (t && t[1]) return t[1];
        return null;
    }

    function getProtocol(str) {
        var t = str.match(/^(\w+):\/\//);
        if (t && t[1]) return t[1];
        return null;
    }

    function getPort(str) {
        var t = str.match(/:\/\/([^\/?#:]*):(\d+)/);
        if (t && t[2]) return t[2];
        return null;
    }

    function split(str, sep_field, sep) {
        var els = str.split(sep_field);

        if (sep) {
            var obj = {};
            els.forEach(function (el) {
                var s = el.split(sep),
                    field = decodeURI(s.shift()),
                    value = decodeURIComponent(s.join(sep));
                if (value.length) {
                    try {
                        obj[field] = JSON.parse(value);
                    }
                    catch (e) {
                        obj[field] = value;
                    }
                }
                else
                    obj[field] = true;
            });
            return obj;
        }
        else {
            return els;
        }
    }

    function join(obj, sep_field, sep) {

        if (obj instanceof Array && !sep) {
            return obj.join(sep_field).replace(new RegExp("\\" + sep_field + "\\" + sep_field, 'g'), sep_field);
        }
        else {
            var els = [];
            for (var key in obj) {
                if (obj[key] === undefined)
                    continue;
                if (obj[key] === true)
                    els.push(encodeURI(key));
                else
                    els.push(encodeURI(key) + sep + encodeURIComponent(JSON.stringify(obj[key])));
            }
            return els.join(sep_field);
        }
    }

    function toString() {
        var str = "";
        if (this instanceof Url) {
            str += ( this.protocol ? this.protocol + "://" : "" )
                + this.dns
                + ( this.port ? ':' + this.port : '' )
                + ( "" + this.path ? this.path : "/" )
                + ( "" + this.arg ? "?" + this.arg : "" )
                + ( "" + this.hash ? "#" + this.hash : "" );
        }
        return str;
    }

    Url.prototype = {
        "constructor": Url,
        "toString": toString
    };

    Object.defineProperty(Url.prototype, "protocol", {
        "get": function () {
            return this._protocol;
        },
        "set": function (value) {
            this._protocol = value;
        },
        "enumerable": true,
        "configurable": false
    });

    Object.defineProperty(Url.prototype, "dns", {
        "get": function () {
            return this._dns;
        },
        "set": function (value) {
            this._dns = new Dns(value);
        },
        "enumerable": true,
        "configurable": false
    });

    Object.defineProperty(Url.prototype, "path", {
        "get": function () {
            return this._path;
        },
        "set": function (value) {
            this._path = new Path(value);
        },
        "enumerable": true,
        "configurable": false
    });

    Object.defineProperty(Url.prototype, "arg", {
        "get": function () {
            return this._arg;
        },
        "set": function (value) {
            this._arg = new Arg(value);
        },
        "enumerable": true,
        "configurable": false
    });

    Object.defineProperty(Url.prototype, "hash", {
        "get": function () {
            return this._hash;
        },
        "set": function (value) {
            this._hash = new Hash(value);
        },
        "enumerable": true,
        "configurable": false
    });

    Url.split = split;
    Url.join = join;

    context.Url = Url;

    context.on("load", function () {

        $$("a[to-dns], a[to-path], a[to-arg], a[to-hash]").forEach(function ($el) {

            var url = new Url();

            if ($el.hasAttribute("to-dns")) {
                var to_dns = $el.getAttribute("to-dns");
                try {
                    to_dns = Url.join(JSON.parse(to_dns).reverse(), ".");
                } catch (e) {
                }
                url.dns = to_dns;
                url.path = null;
                url.arg = null;
                url.hash = null;
            }

            if ($el.hasAttribute("to-path")) {
                var to_path = $el.getAttribute("to-path");
                try {
                    to_path = Url.join(JSON.parse(to_path), "/");
                } catch (e) {
                }
                url.path = to_path;
                url.arg = null;
                url.hash = null;
            }

            if ($el.hasAttribute("to-arg")) {
                var to_arg = $el.getAttribute("to-arg");
                try {
                    to_arg = Url.join(JSON.parse(to_arg), "&", "=");
                } catch (e) {
                }
                url.arg = to_arg;
                url.hash = null;
            }

            if ($el.hasAttribute("to-hash")) {
                var to_hash = $el.getAttribute("to-hash");
                try {
                    to_hash = Url.join(JSON.parse(to_hash), "/", ":");
                } catch (e) {
                }
                url.hash = to_hash;
            }

            $el.href = "" + url;
        });

    });

})(this.window);


/**
 *  class Resource is used to centralize requests over a single file.
 *  when class is instantiated, the arguments are the resource default values
 *  when a method is added, the arguments are the method default values, that overrides resource default values
 *  when a method is called, the arguments overrides method default values.
 *
 *  usage:
 *      var model_user = new Resource( {file: 'data/users.json'} );
 *      model_user.addMethod( "getAll", {method: 'GET'}  );
 *      model_user.addMethod( "",  {method: 'GET'}  );
 *      model_user.getAll().then( function(){} )
 */

this.window && (function (context) {

    //  PRIVATE

    function is_string(el) {
        return typeof el === 'string';
    }

    function is_object(el) {
        return (typeof el === 'object');
    }

    function is_function(el) {
        return (typeof el === 'function');
    }

    function empty() {
    }


    function ajax(method, file, data, success, fail, headers, overrideMime) {

        var x = new XMLHttpRequest();

        method = try_exec(method, x);
        file = try_exec(file, x);
        data = try_exec(data, x);
        headers = try_exec(headers, x);
        overrideMime = try_exec(overrideMime, x);

        method = is_string(method) ? method : "GET";
        file = is_string(file) ? file : ".";
        success = is_function(success) ? success : empty;
        fail = is_function(fail) ? fail : empty;
        overrideMime = is_string(overrideMime) ? overrideMime : null;

        ( x.on || x.addEventListener || x.attachEvent ).call(x, 'loadend', success);
        ( x.on || x.addEventListener || x.attachEvent ).call(x, 'error', fail);
        x.open(method, file, true);

        if (is_object(headers)) {
            for (var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    if (!is_string(headers[key]))
                        headers[key] = JSON.stringify(headers[key]);
                    x.setRequestHeader(key, headers[key]);
                }
            }
        }
        if (overrideMime) x.overrideMimeType(overrideMime);

        x.send(data);

        var endEvent = null;
        x.on('loadend,error', function (ev) {
            endEvent = ev
        });

        x.then = function (fn) {
            if (is_function(fn)) {
                if (endEvent && endEvent.type === 'loadend') {
                    fn.call(x, endEvent);
                }
                else {
                    x.on('loadend', fn);
                }
            }
            return x;
        };

        x.catch = function (fn) {
            if (is_function(fn)) {
                if (endEvent && endEvent.type === 'error') {
                    fn.call(x, endEvent);
                }
                else {
                    x.on('error', fn);
                }
            }
            return x;
        };

        return x;
    }

    function try_exec(el, xhr) {
        if (is_function(el)) {
            return el(xhr);
        }
        return el;
    }

    function param_filter(method, file, data, success, fail, headers, overrideMime) {

        if (is_object(method)) {
            overrideMime = method.overrideMimeType;
            headers = method.headers;
            fail = method.fail || method.failure || method.error;
            success = method.success || method.load;
            data = method.data || method.post || method.args || method.arguments || method.body;
            file = method.file || method.path || method.source || method.url;
            method = method.method;

            return param_filter(method, file, data, success, fail, headers, overrideMime);
        }

        return [method, file, data, success, fail, headers, overrideMime];
    }

    function merge(obj, prior) {
        var res = [];
        for (var i = 0; i < 7; i++) {
            if (prior[i])
                res.push(prior[i]);
            else
                res.push(obj[i]);
        }
        return res;
    }


    //  PUBLIC

    /**
     * @class Resource
     * @param method string|function|{Object} where object can be written like this :
     *      {
     *          method: string|{Function},
     *          file=path=source=url: string|{Function},
     *          data=post=args=arguments=body: *|{Function},
     *          success=load: {Function},
     *          fail=failure=error: {Function},
     *          header: {}|{Function},
     *          overrideMimeType: string|{Function}
     *      }
     *
     * @param file string|function
     * @param data any
     * @param success function
     * @param fail function
     * @param headers object
     * @param overrideMime string
     * @returns {Resource}
     * @constructor
     */

    function Resource(method, file, data, success, fail, headers, overrideMime) {
        if (!(this instanceof Resource))
            return new Resource(method, file, data, success, fail, headers, overrideMime);

        this._default = param_filter(method, file, data, success, fail, headers, overrideMime);
    }


    /**
     * @method addMethod
     * @param name string is used for register a function to this resource
     * @param method string|function|{Object} where object can be written like this :
     *      {
     *          method: string|{Function},
     *          file=path=source=url: string|{Function},
     *          data=post=args=arguments=body: *|{Function},
     *          success=load: {Function},
     *          fail=failure=error: {Function},
     *          header: {}|{Function},
     *          overrideMimeType: string|{Function}
     *      }
     *
     * @param file string|function
     * @param data any
     * @param success function
     * @param fail function
     * @param headers object
     * @param overrideMime string
     * @returns {Resource}
     * @constructor
     */

    function addMethod(name, method, file, data, success, fail, headers, overrideMime) {
        var _default_method = merge(this._default, param_filter(method, file, data, success, fail, headers, overrideMime));

        this[name] = function _method(method, file, data, success, fail, headers, overrideMime) {
            var _default = merge(_default_method, param_filter(method, file, data, success, fail, headers, overrideMime));
            return ajax.apply(null, _default);
        };
        return this;
    }

    Object.extend(Resource, null, {

        "addMethod": addMethod
    });

    context.Resource = Resource;

})(this.window);


this.window && (function (context) {

    //  static
    function is_function(el) {
        return (typeof el === 'function');
    }

    function is_string(el) {
        return (typeof el === 'string');
    }

    function HTMLCustomElement() {
    }

    HTMLCustomElement.prototype = Object.create(document.createElement("div"));

    function define(nodeName, constructor, prototype) {
        if (is_string(nodeName) && nodeName.match(/^[\w\-_]+$/i) && is_function(constructor)) {
            if (context.customElements && Function.isClass(constructor)) {
                context.customElements.define(nodeName, constructor);
            }
            else if (prototype) {
                Object.extend(constructor, HTMLCustomElement, prototype);
            }
            var old = nodeNames[nodeName] || null;
            nodeNames[nodeName] = constructor;
            return old;
        }
    }

    function construct(node) {
        var constructor;
        if (is_function(constructor = nodeNames[node.nodeName.toLowerCase()])) {
            if (listened.indexOf(node) === -1) {
                listened.push(node);

                if (!(context.customElements && Function.isClass(constructor))) {
                    Object.getOwnPropertyNames(constructor.prototype).forEach(function (key) {
                        Object.defineProperty(node, key, Object.getOwnPropertyDescriptor(constructor.prototype, key));
                    });
                    constructor.apply(node);
                }

                var children_ended = [];

                var ended = function () {
                    for (var i in node.children) {
                        if (node.children.hasOwnProperty(i)
                            && children_ended.indexOf(node.children[i]) === -1
                            && nodeNames.indexOf(node.children[i].nodeName.toLowerCase()) !== -1) {
                            return false;
                        }
                    }
                    return true;
                };

                var end = function (ev) {
                    children_ended.push(ev.target);
                    if (ended()) {
                        node.dispatch('load,define');
                    }
                    ev.target.detach('load', end);
                };

                var count = 0;
                for (var i in node.children) {
                    if (node.children.hasOwnProperty(i) && nodeNames.indexOf(node.children[i].nodeName.toLowerCase()) !== -1) {
                        node.children[i].on('load', end);
                        count++;
                    }
                }
                if (!count) {
                    node.dispatch('load,define');
                }
            }
        }
    }

    var listened = window.listened = [];
    var nodeNames = window.nodeNames = [];

    $.change(function (ev) {
        function add(node) {
            node.children.forEach(add);
            construct(node);
        }

        ev.detail.addedNodes.forEach(add);
    });

    $.define = define;
    $.define.definitions = nodeNames;
    $.define.defined = listened;

    context.HTMLCustomElement = HTMLCustomElement;

})(this.window);
