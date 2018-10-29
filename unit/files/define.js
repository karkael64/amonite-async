//  COMPONENT (test)

(function () {

    /**
     * @function <refresh> is used to update inner html or text
     * @returns {XMLHttpRequest}
     */

    function refresh() {
        if (arguments.length)
            this.setData(arguments[0]);
        return this.ajax.refresh.apply(this, arguments);
    }

    /**
     * @function <setData> set the body to send in the request
     * @param data {*}
     * @returns {HTMLComponentElement}
     */

    function setData(data) {
        this.body = data;
        return this;
    }

    function HTMLComponentElement() {

        this.body = "";
        this.ajax = new Resource();
        var self = this;

        this.ajax.addMethod('refresh', {
            method: function () {
                return (self.body === undefined) ? 'GET' : 'POST';
            },
            url: function () {
                var u = new Url();
                u.arg.add('component', self.attr('name'));
                return u.toString();
            },
            headers: function () {
                return (self.body === undefined) ? null : {"Content-Type": "application/json"};
            },
            body: function () {
                return JSON.stringify(self.body);
            },
            load: function (ev) {
                if (JSON.stringify(self.attr('etag')) !== ev.target.getResponseHeader('ETag')) {
                    while (self.firstChild)
                        self.removeChild(self.firstChild);
                    if (ev.target.getResponseHeader('Content-Type') === 'text/html') {
                        self.appendChild($.create(ev.target.responseText.trim())[0]);
                    }
                    else {
                        self.textContent = ev.target.responseText;
                    }
                }
            }
        });
    }

    Object.extend(HTMLComponentElement, HTMLElement, {
        'refresh': refresh,
        'setData': setData
    });

    $.define('component', HTMLComponentElement);
})();


//  REPEAT (test)

(function () {

    /**
     * @function <add> is used to add an item following the template
     * @returns {*}
     */

    function add() {

        if (this.children.length < (this.attr('max') || Infinity)) {
            var $item = this.template.cloneNode(true);
            this.appendChild($item);
            this.dispatch('add');
            return $item;
        }
        return null;
    }

    function HTMLRepeatElement() {

        this.template = $.create('repeat-item', null, this.children);
        this.add = add;

        while (this.children.length < (this.attr('init') || 0)) {
            this.add();
        }
    }

    Object.extend(HTMLRepeatElement, HTMLElement, {
        'add': add
    });

    $.define('repeat', HTMLRepeatElement);
})();


//  EDIT-TABLE (test)

(function () {

    function is_array(el) {
        return (el instanceof Array);
    }

    function is_object(el) {
        return (typeof el === 'object') && (el !== null);
    }


    //  EDIT-TABLE

    (function () {

        /**
         * @function <setRows> is used to set table rows
         * @param rows {Array}
         * @returns {HTMLEditTableElement}
         */

        function setRows(rows) {

            while (this.firstChild)
                this.removeChild(this.firstChild);

            if (is_array(rows)) {
                rows.forEach(function (row) {
                    this.addRow(row);
                });
            }
            return this;
        }

        /**
         * @function <addRow> is used to add a row with cells
         * @param row {Object}
         * @returns {HTMLEditTableRowElement}
         */

        function addRow(row) {
            var $row = $.create('edit-table-row');
            this.appendChild($row);
            $row.once('load', function () {
                $row.setRow(row);
            });
            return $row;
        }

        /**
         * @function <setColumns> is used to set table columns
         * @param columns {Array}
         * @returns {HTMLEditTableElement}
         */

        function setColumns(columns) {
            this.children.forEach(function ($editTableRow) {
                if ($editTableRow.setColumns)
                    $editTableRow.setColumns(columns);
            });
            return this;
        }

        /**
         * @function <toJSON> is used for getting all table datas.
         * @returns {Array}
         */

        function toJSON() {
            var res = [];
            this.children.forEach(function ($el) {
                if ($el.toJSON) {
                    res.push($el.toJSON());
                }
            });
            return res;
        }

        function HTMLEditTableElement() {
        }

        Object.extend(HTMLEditTableElement, HTMLElement, {
            'setRows': setRows,
            'addRow': addRow,
            'setColumns': setColumns,
            'toJSON': toJSON
        });

        $.define('edit-table', HTMLEditTableElement);

    })();


    //  EDIT-TABLE-ROW

    (function () {

        /**
         * @function <setRow> set the current row cells
         * @param row {Object}
         * @returns {HTMLElement}
         */

        function setRow(row) {

            while (this.firstChild)
                this.removeChild(this.firstChild);

            if (is_object(row)) {
                for (var field in row) {
                    if (row.hasOwnProperty(field))
                        this.addCell(field, row[field]);
                }
            }
            return this;
        }

        /**
         * @function <addCell> is used to add a cell in this row
         * @param field {string}
         * @param value {string}
         * @param matches {RegExp|Array|undefined}
         * @returns {Node|*}
         */

        function addCell(field, value, matches) {
            var $cell = $.create('edit-table-cell');
            this.appendChild($cell);
            $cell.once('load', function () {
                $cell.setCell(field, value, matches);
            });
            return $cell;
        }

        /**
         * @function <setColumns> is used to sort table columns
         * @param columns {Array}
         * @returns {HTMLElement}
         */

        function setColumns(columns) {

            if (is_array(columns)) {
                var reordered = [];
                columns.forEach(function (column_name) {
                    var found = null;
                    this.children.forEach(function ($editTableCell) {
                        if ($editTableCell.attr('field') === column_name) {
                            found = $editTableCell;
                        }
                    });
                    if (found) {
                        reordered.push(found);
                    }
                    else {
                        var created = $.create('edit-table-cell');
                        created.once('load', function () {
                            this.setCell(column_name, '');
                        });
                        reordered.push(created);
                    }
                });

                while (this.firstChild)
                    this.removeChild(this.firstChild);

                reordered.forEach(function ($editTableCell) {
                    this.appendChild($editTableCell);
                });
            }
            return this;
        }

        /**
         * @function <toJSON> returns the row values
         * @returns {Object}
         */

        function toJSON() {
            var res = {};
            this.children.forEach(function ($el) {
                if ($el.toJSON) {
                    res[$el.attr('field')] = $el.toJSON();
                }
            });
            return res;
        }

        function HTMLEditTableRowElement() {
        }

        Object.extend(HTMLEditTableRowElement, HTMLElement, {
            'setRow': setRow,
            'addCell': addCell,
            'setColumns': setColumns,
            'toJSON': toJSON
        });

        $.define('edit-table-row', HTMLEditTableRowElement);

    })();


    //  EDIT-TABLE-CELL

    (function () {

        function setInput(init, matches) {
            if (matches instanceof RegExp) {
                return $.create('input', {
                    'regexp': matches.source,
                    'value': init
                }).on('change', function () {
                    this.readNode.textContent = this.editNode.value;
                });
            }
            else if (is_object(matches)) {
                var options = [];
                for (var value in matches) {
                    if (matches.hasOwnProperty(value)) {
                        var attr = {'value': value};
                        if (value === init) {
                            attr.selected = true;
                        }
                        options.push($.create('option', attr, matches[value]));
                    }
                }
                var select = $.create('select', null, options);
                select.value = init;
                select.on('change', function () {
                    var text = [];
                    this.editNode.selectedOptions.forEach(function (option) {
                        text.push(option.textContent);
                    });
                    this.readNode.textContent = text.join(', ');
                });
                return select;
            }
            else {
                return $.create('input', {'value': init}).on('change', function () {
                    this.readNode.textContent = this.editNode.value;
                });
            }
        }

        /**
         * @function <setCell> set cell configuration, with a name, a value & a match rule
         * @param field
         * @param value
         * @param matches
         * @returns {HTMLElement}
         */

        function setCell(field, value, matches) {
            this.attr('field', field);
            this.readNode.textContent = value;
            this.editNode = setInput.call(this, value, matches);
            if (this.attr('mode') === 'edit') {
                this.editMode();
            } else {
                this.readMode();
            }
            return this;
        }

        /**
         * @function <editMode> translate a read-mode to an input for value editing
         * @returns {HTMLElement}
         */

        function editMode() {
            while (this.firstChild)
                this.removeChild(this.firstChild);
            this.appendChild(this.editNode);
            this.attr('mode', 'edit');
            return this;
        }

        /**
         * @function <readMode> translate an edit-mode to a span for reading only
         * @returns {HTMLElement}
         */

        function readMode() {
            while (this.firstChild)
                this.removeChild(this.firstChild);
            this.appendChild(this.readNode);
            this.attr('mode', 'read');
            return this;
        }

        /**
         * @function <isParentOf> check childs (even if hidden) and returns is its part of it
         * @param $el {HTMLElement}
         * @returns {boolean}
         */

        function isParentOf($el) {
            return ($el === this) || ($el === this.readNode) || ($el === this.editNode) ||
                $el.isChildOf(this.readNode) || $el.isChildOf(this.editNode);
        }

        /**
         * @function <toJSON> returns the input value
         * @returns {string}
         */

        function toJSON() {
            return this.editNode.value;
        }

        function HTMLEditTableCellElement() {

            var self = this;
            this.readNode = $.create('span');
            this.editNode = $.create('input');

            this.appendChild(this.readNode);

            //  CUSTOM
            this.on('click', function () {
                if (self.attr('mode') === 'read') {
                    self.editMode();
                }
            });
        }

        Object.extend(HTMLEditTableCellElement, HTMLElement, {
            'setCell': setCell,
            'editMode': editMode,
            'readMode': readMode,
            'isParentOf': isParentOf,
            'toJSON': toJSON
        });

        $.define('edit-table-cell', HTMLEditTableCellElement);

    })();


    window.on('click', function (ev) {
        $$('edit-table-cell').forEach(function ($el) {
            if (!$el.isParentOf(ev.target) && ($el.attr('mode') !== 'read')) {
                $el.readMode();
            }
        });
    });
})();


//  CHECKBOX (test)

(function () {

    /**
     * @function <check> is used to check this checkbox
     * @returns {HTMLElement}
     */

    function check() {
        this.$input.value = "true";
        this.attr('value', 'true');
        return this;
    }

    /**
     * @function <uncheck> is used to uncheck this checkbox
     * @returns {HTMLElement}
     */

    function uncheck() {
        this.$input.value = "false";
        this.attr('value', 'false');
        return this;
    }

    /**
     * @function <switch_check> is used to alternate the checkbox value
     * @returns {HTMLElement}
     */

    function switch_check() {
        if (this.$input.value === "false") {
            return this.check();
        }
        else {
            return this.uncheck();
        }
    }

    /**
     * @function <setValue> is used to set status of this checkbox
     * @param isChecked {boolean|string}
     * @returns {HTMLElement}
     */

    function setValue(isChecked) {
        if (isChecked && isChecked !== "false") {
            return this.check();
        }
        else {
            return this.uncheck();
        }
    }

    /**
     * @function <getValue> is used to get status of this checkbox
     * @returns {boolean}
     */

    function getValue() {
        var isChecked = this.attr('value');
        return isChecked && isChecked !== "false";
    }

    /**
     * @function <setName> is used to set name of this checkbox
     * @param name {string}
     * @returns {HTMLElement}
     */

    function setName(name) {
        this.attr('name', name);
        return this;
    }

    /**
     * @function <getName> is used to get name of this checkbox
     * @returns {string}
     */

    function getName() {
        return this.attr('name');
    }

    /**
     * @function <setText> is used to set name of this checkbox
     * @param text {string}
     * @returns {HTMLElement}
     */

    function setText(text) {
        this.$text.textContent = text;
        return this;
    }

    /**
     * @function <getText> is used to get name of this checkbox
     * @returns {string}
     */

    function getText() {
        return this.$text.textContent;
    }

    /**
     * @function <checkValidity> is used to verify a form validity by seeking each inputs validity
     * @returns {boolean}
     */

    function checkValidity() {
        if (this.$input.value === "true") {
            return true;
        }
        else {
            this.classList.add('invalid');
            return false;
        }
    }

    function HTMLCheckboxElement() {

        var isRequired = this.attr('required') !== null;
        var isChecked = this.attr('value');
        isChecked = isChecked && isChecked !== "false";

        var attr = {'type': 'hidden', 'name': this.attr('name'), 'value': isChecked};
        if (isRequired) attr.required = true;
        this.$input = this.$('input') || $.create('input', attr);
        this.$text = this.$('checkbox-text') || $.create('checkbox-text', null, this.textContent);
        var $box = this.$('checkbox-box') || $.create('checkbox-box', null, '🗸');
        this.attr('tabindex', 0);

        Object.defineProperty(this, 'isChecked', {
            'enumerable': true,
            'configurable': true,
            'get': getValue,
            'set': setValue
        });

        while (this.firstChild)
            this.removeChild(this.firstChild);

        this.appendChild($box);
        this.appendChild(this.$input);
        this.appendChild(this.$text);

        this.setValue(isChecked);

        var self = this;
        this.on('click', function () {
            self.switch();
            self.classList.remove('invalid');
            $box.focus();
        });
        this.on('keypress', function (ev) {
            if ([13, 43, 45].indexOf(ev.parent.charCode) !== -1) {
                self.switch();
            }
        });
    }

    $.define('checkbox', HTMLCheckboxElement, {
        'check': check,
        'uncheck': uncheck,
        'switch': switch_check,
        'setValue': setValue,
        'getValue': getValue,
        'value': {
            'enumerable': false,
            'configurable': true,
            'get': getValue,
            'set': setValue
        },
        'setName': setName,
        'getName': getName,
        'setText': setText,
        'getText': getText,
        'checkValidity': checkValidity
    });

})();


//  CHECKBOX-LIST (test)

(function () {

    function getMinimumSelectableCount() {
        var min = parseInt(this.attr('min'));
        if (isNaN(min)) {
            min = this.attr('count');
            if (min === 'unique') {
                return 1;
            }
            else if (isNaN(min = parseInt(min))) {
                return 0;
            }
        }
        return min;
    }

    function getMaximumSelectableCount() {
        var max = parseInt(this.attr('max'));
        if (isNaN(max)) {
            max = this.attr('count');
            if (max === 'unique') {
                return 1;
            }
            else if (isNaN(max = parseInt(max))) {
                return Infinity;
            }
        }
        return max;
    }

    /**
     * @method <addItem> add an item in the list.
     * @param name {HTMLCheckboxElement|string}
     * @param text {string}
     * @param value {string}
     * @param required {boolean|undefined}
     * @returns {HTMLCheckboxElement}
     */

    function addItem(name, text, value, required) {
        var $item = null,
            self = this;
        if (name instanceof HTMLElement) {
            $item = name;
            name = $item.attr('name');
        }
        else {
            var attr = {'name': name, 'value': value};
            if (required) attr.required = 'true';
            $item = $.create('checkbox', attr, text);
        }
        this.appendChild($item);
        var isSelected = $item.attr('value');
        if (isSelected && isSelected !== 'false') {
            $item.once('load', function () {
                self.addSelection(name);
            });
        }
        return $item;
    }

    /**
     * @method <addSelection> set item (found by name) as checked.
     * @param name {string}
     * @returns {HTMLCheckboxListElement}
     */

    function addSelection(name) {

        var items = this.getSelectedItems(),
            max = getMaximumSelectableCount.apply(this);
        while (items.length >= max) {
            items.shift().uncheck();
        }

        this.$$('checkbox').forEach(function ($checkbox) {
            if ($checkbox.getName() === name) {
                $checkbox.check();
            }
        });
        return this;
    }

    /**
     * @method <removeSelection> set item (found by name) as not-checked.
     * @param name {string}
     * @returns {HTMLCheckboxListElement}
     */

    function removeSelection(name) {

        var items = this.getSelectedItems(),
            min = getMinimumSelectableCount.apply(this);

        if (items.length <= min)
            return this;

        this.$$('checkbox').forEach(function ($checkbox) {
            if ($checkbox.getName() === name) {
                $checkbox.uncheck();
            }
        });
        return this;
    }

    /**
     * @method <getSelectedItems> returns the checkboxes checked
     * @returns {Array.<HTMLCheckboxElement>}
     */

    function getSelectedItems() {
        var list = [];
        this.children.forEach(function ($item) {
            if ($item.nodeName === 'CHECKBOX-LIST') {
                list = list.concat($item.getSelectedItems());
            }
            else if ($item.isChecked) {
                list.push($item);
            }
        });
        return list;
    }

    /**
     * @method <getValue> returns the array of names of checkboxes checked.
     * @returns {Array.<string>}
     */

    function getValue() {
        var names = [];
        this.getSelectedItems().forEach(function (item) {
            names.push(item.getName());
        });
        return names;
    }

    /**
     * @method <setValue> reset the checkboxes, then set the checkboxes listed in <val> as checked.
     * @param val {Array|string}
     * @returns {HTMLCheckboxListElement}
     */

    function setValue(val) {
        var self = this;
        this.children.forEach(function ($checkbox) {
            self.removeSelection($checkbox.getName());
        });
        if (Array.isArray(val)) {
            val.forEach(function (name) {
                self.addSelection(name);
            });
        }
        else {
            this.addSelection(val);
        }
        return this;
    }

    function setName(text) {
        this.attr('name', text);
        return this;
    }

    function getName() {
        return this.attr('name');
    }

    function setTitle(text) {
        this.listname.textContent = text;
        return this;
    }

    function getTitle() {
        return this.listname.textContent;
    }

    function HTMLCheckboxListElement() {

        var self = this;
        this.list = null;
        var initCheckboxes = this.$$('checkbox');

        while (this.firstChild) {
            if (this.firstChild.nodeName === "CHECKBOX-LIST") {
                this.list = this.firstChild;
            }
            this.removeChild(this.firstChild);
        }

        if (!this.list) {
            this.list = $.create('checkbox-list');
        }

        if (initCheckboxes) {
            initCheckboxes.forEach(function ($item) {
                self.addItem($item);
            });
        }

        this.on('click', function (ev) {
            var $checkbox, t;
            if (self.$$('checkbox').indexOf(ev.target) !== -1)
                $checkbox = ev.target;
            else if ((t = ev.target.getParent('CHECKBOX')) && self.$$('checkbox').indexOf(t) !== -1)
                $checkbox = t;

            if ($checkbox) {
                if ($checkbox.isChecked) {
                    $checkbox.uncheck();
                    self.addSelection($checkbox.attr('name'));
                }
                else {
                    $checkbox.check();
                    self.removeSelection($checkbox.attr('name'));
                }
            }
        });

        this.listname = $.create('checkbox-listname');
        this.prependChild(this.listname);
    }

    Object.extend(HTMLCheckboxListElement, HTMLElement, {
        'addItem': addItem,
        'addSelection': addSelection,
        'removeSelection': removeSelection,
        'getSelectedItems': getSelectedItems,
        'getValue': getValue,
        'setValue': setValue,
        'value': {
            'enumerable': false,
            'configurable': true,
            'get': getValue,
            'set': setValue
        },
        'setTitle': setTitle,
        'getTitle': getTitle,
        'setName': setName,
        'getName': getName
    });

    $.define('checkbox-list', HTMLCheckboxListElement);

})();


//  DROPDOWN (test)

(function () {

    /**
     * @method <setUnique> set the dropdown selection limited to one item selected.
     * @returns {HTMLDropdownElement}
     */

    function setUnique() {
        this.attr('count', 'unique');
        this.list.attr('count', 'unique');
        return this;
    }

    /**
     * @method <setMultiple> set the dropdown selection with no limit of item selected.
     * @returns {HTMLDropdownElement}
     */

    function setMultiple() {
        this.list.attr('count', 'multiple');
        return this;
    }

    /**
     * @method <addItem> add an item at the end of the list;
     * @param name {string|HTMLCheckboxElement}
     * @param text {string|undefined}
     * @param value {string|undefined}
     * @param required {boolean|undefined}
     * @returns {HTMLDropdownElement}
     */

    function addItem(name, text, value, required) {
        var list = this.list,
            self = this;
        this.list.once('load', function () {
            var item = list.addItem(name, text, value, required);
            item.once('load', resetText.bind(self));
        });
        return this;
    }

    /**
     * @method <addSelection> check item (found by name)
     * @param name {string}
     * @returns {HTMLDropdownElement}
     */

    function addSelection(name) {
        this.list.addSelection(name);
        this.resetText();
        return this;
    }

    /**
     * @method <removeSelection> uncheck item (found by name)
     * @param name
     * @returns {HTMLDropdownElement}
     */

    function removeSelection(name) {
        this.list.removeSelection(name);
        this.resetText();
        return this;
    }

    /**
     * @method <getSelectedItems> returns the items that are checked in this list
     * @returns {Array.<HTMLCheckboxElement>}
     */

    function getSelectedItems() {
        return this.list.getSelectedItems();
    }

    /**
     * @method <show> change node classes, by adding "show" and removing "hide".
     * @returns {HTMLDropdownElement}
     */

    function show() {
        this.classList.add('show');
        this.classList.remove('hide');

        this.$$('checkbox').forEach(function (el) {
            el.attr('tabindex', 0);
        });

        return this;
    }

    /**
     * @method <hide> change node classes, by adding "hide" and removing "show".
     * @returns {HTMLDropdownElement}
     */

    function hide() {

        if (this.classList.contains('show')) {
            this.classList.remove('show');
            this.classList.add('hide');


            this.$$('checkbox').forEach(function (el) {
                el.attr('tabindex', null);
            });

            this.resetText();
        }

        return this;
    }

    /**
     * @method <resetText> set text shown in input with texts of items selected
     * @returns {HTMLDropdownElement}
     */

    function resetText() {
        var old = this.field.textContent;
        var text = [];
        this.getSelectedItems().forEach(function (item) {
            text.push(item.getText());
        });
        text = text.join(', ');
        this.field.textContent = text;
        if (old !== text) {
            this.dispatch('change,input');
        }

        return this;
    }

    /**
     * @method <switch> hide if dropdown is shown, overwise hide it.
     * @returns {HTMLDropdownElement}
     */

    function dropdown_switch() {
        if (this.classList.contains('show')) {
            this.hide();
        }
        else {
            this.show();
        }
        return this;
    }

    /**
     * @method <getValue> returns array of names of items checked.
     * @returns {Array.<string>}
     */

    function getValue() {
        var names = [];
        this.getSelectedItems().forEach(function (item) {
            names.push(item.getName());
        });
        return names;
    }

    /**
     * @method <setValue> reset items checked, then check items listed in <val>
     * @param val {Array|string}
     * @returns {HTMLDropdownElement}
     */

    function setValue(val) {
        this.list.setValue(val);
        return this;
    }

    /**
     * @method <addList> can add a sub list into the dropdown list
     * @param children {}
     * @param title
     * @returns {Node|*}
     */

    function addList(children, title) {

        var list;
        if (children instanceof HTMLElement && children.nodeName === 'CHECKBOX-LIST') {
            list = children;
        }
        else {
            list = $.create('checkbox-list');
            var self = this;
            if (Array.isArray(children)) {
                children.forEach(function (builder) {
                    if (builder instanceof HTMLElement) {
                        self.addItem(builder);
                    }
                    else if (typeof builder === 'object') {
                        self.addItem(builder.name, builder.text, builder.value, builder.required);
                    }
                });
            }
        }

        this.list.appendChild(list);
        if (title !== undefined) {
            list.once('load', function () {
                list.setTitle(title);
            });
        }

        return list;
    }

    function HTMLDropdownElement() {

        var self = this;
        this.list = null;
        var initCheckboxes = this.$$('checkbox');

        while (this.firstChild) {
            if (this.firstChild.nodeName === "CHECKBOX-LIST") {
                this.list = this.firstChild;
            }
            this.removeChild(this.firstChild);
        }

        if (!this.list) {
            this.list = $.create('checkbox-list');
        }

        if (initCheckboxes) {
            initCheckboxes.forEach(function ($item) {
                self.addItem($item);
            });
        }

        this.list.once('load', function () {
            if (self.attr('count') === 'multiple') {
                self.setMultiple();
            }
            else {
                self.setUnique();
            }
            self.hide();
        });

        var name = this.attr('name'),
            required = this.attr('required'),
            attr = {'type': 'hidden', 'name': name};
        if (required) attr.required = required;

        this.field = $.create('dropdown-input');
        var $box = $.create('dropdown-box', null, [
            this.field
        ]);

        this.appendChild($box);
        this.appendChild(this.list);

        this.on('click,keypress', function (ev) {
            if (ev.target.isChildOf(this.list)) {
                if (this.list.attr('count') === 'unique') {
                    self.hide();
                }
            }
            else {
                self.switch();
            }
        });

        this.attr('tabindex', 0);
    }

    Object.extend(HTMLDropdownElement, HTMLElement, {
        'setUnique': setUnique,
        'setMultiple': setMultiple,
        'getValue': getValue,
        'setValue': setValue,
        'value': {
            'enumerable': false,
            'configurable': true,
            'get': getValue,
            'set': setValue
        },

        'addItem': addItem,
        'addSelection': addSelection,
        'removeSelection': removeSelection,
        'getSelectedItems': getSelectedItems,
        'show': show,
        'hide': hide,
        'switch': dropdown_switch,
        'resetText': resetText,
        'addList': addList
    });

    $.define('dropdown', HTMLDropdownElement);

    window.on('click,keypress', function (ev) {
        $$('dropdown').forEach(function ($dropdown) {
            if (!$dropdown.isParentOf(ev.target) && !($dropdown === ev.target)) {
                $dropdown.hide();
            }
        });
    });

})();


//  AUTOCOMPLETE (test)

(function () {

    function load() {
        var self = this;
        if (!this.ajax.autocomplete) {
            var uri;
            if (uri = this.getResourceUri()) {
                this.setRequest('POST', uri, function () {
                    return JSON.stringify({'autocomplete': self.value});
                });
            }
            else {
                throw new Error("Request nor URI request are defined for requesting autocompletion.");
            }
        }

        if ([HTMLAutocompleteElement.STATUS_NONE, HTMLAutocompleteElement.STATUS_LOADED].indexOf(this.loadStatus) !== -1) {
            this.loadStatus = HTMLAutocompleteElement.STATUS_LOAD;
        }
        else {
            this.loadStatus = HTMLAutocompleteElement.STATUS_RELOAD;
            return null;
        }

        return this.ajax.autocomplete().then(function () {

            self.loadStatus = HTMLAutocompleteElement.STATUS_LOADED;
            if (HTMLAutocompleteElement.STATUS_RELOAD === self.loadStatus) {
                self.load();
            }

            var data;
            try {
                data = JSON.parse(this.responseText);
            }
            catch (err) {
                return this.dispatch('error', err);
            }

            if (Array.isArray(data.marks)) {
                self.marks = data.marks;
            }
            else if (Array.isArray(data.list)) {
                self.marks = markWords(self.value, data.list);
            }
            else {
                return this.dispatch('error', new TypeError('Autocomplete request response is not well formatted.'));
            }

            setListWithFoundMarks(self, self.marks);

            if (Array.isArray(data.list)) {
                self.loadedItems = data.list;
            }
            else if (Array.isArray(data.marks)) {
                self.loadedItems = marksToItems(data.marks);
            }

        }).catch(function (ev, err) {
            if (HTMLAutocompleteElement.STATUS_RELOAD === self.loadStatus) {
                self.loadStatus = HTMLAutocompleteElement.STATUS_LOAD;
                self.load();
            }
            console.warn(err);
        });
    }

    function test(phrase) {
        setListWithFoundMarks(this, markWords(phrase, this.loadedItems));
    }

    function setListWithFoundMarks(self, marks) {

        while (self.list.firstChild)
            self.list.removeChild(self.list.firstChild);

        marks.forEach(function (markedLine) {
            var attr = {};
            if (self.classList.contains('focus'))
                attr.tabindex = '0';
            var line = $.create('item', attr);
            if (Array.isArray(markedLine)) {
                markedLine.forEach(function (mark) {
                    if (mark.text) {
                        if (mark.match) {
                            line.appendChild($.create('found', null, mark.text));
                        }
                        else {
                            line.appendChild($.create('not-found', null, mark.text));
                        }
                    }
                });
            }
            self.list.appendChild(line);
        });
    }

    function markWords(phrase, loadedList) {
        var lines = [];
        if ((typeof phrase === 'string') && Array.isArray(loadedList)) {
            phrase = phrase.toLowerCase();
            loadedList.forEach(function (item) {
                if (typeof item === 'string') {
                    var line = [];
                    item.split(/\s/).forEach(function (loadedWord) {
                        var match = false;
                        phrase.split(/\s/).forEach(function (word) {
                            if (!word.length) return;
                            if (loadedWord.toLowerCase().indexOf(word) !== -1) {
                                match = true;
                            }
                        });
                        line.push({
                            match: match,
                            text: loadedWord
                        });
                        line.push({
                            match: false,
                            text: ' '
                        });
                    });
                    lines.push(line);
                }
            });
        }
        return lines;
    }

    function marksToItems(marks) {
        var items = [];
        marks.forEach(function (marksLine) {
            var item = [];
            marksLine.forEach(function (mark) {
                item.push(mark.text);
            });
            items.push(item.join(''));
        });
        return items;
    }

    function setValue(val) {
        this.input.value = val;
        this.text.textContent = val;
        return this;
    }

    function getValue() {
        return this.input.value;
    }

    function getName() {
        return this.attr('name');
    }

    function setName(name) {
        this.input.attr('name', name);
        this.attr('name', name);
        return this;
    }

    function setRequest(method, file, data, success, fail, headers, overrideMime) {
        this.ajax.addMethod('autocomplete', method, file, data, success, fail, headers, overrideMime);
    }

    function getResourceUri() {
        return this.attr('resource-uri');
    }

    function setResourceUri(uri) {
        this.attr('resource-uri', uri);
        return this;
    }

    function show() {
        this.classList.remove('blur');
        this.classList.add('focus');
        this.input.focus();
        this.list.children.forEach(function (item) {
            if (item.nodeName === 'ITEM') {
                item.attr('tabindex', '0');
            }
        });
        return this;
    }

    function hide() {
        this.classList.remove('focus');
        this.classList.add('blur');
        this.list.children.forEach(function (item) {
            if (item.nodeName === 'ITEM') {
                item.attr('tabindex', null);
            }
        });
        this.test(this.value);
        return this;
    }

    function list_switch() {
        if (this.classList.contains('focus')) {
            this.hide();
        }
        else {
            this.show();
        }
        return this;
    }

    function HTMLAutocompleteElement() {

        var attr = {'type': 'text'}, t;
        if (t = this.attr('name')) attr.name = t;
        if (t = this.attr('value')) attr.value = t;
        this.input = $.create('input', attr);

        this.list = $.create('autocomplete-list');
        this.box = $.create('autocomplete-box', null, [
            this.text = this.input
        ]);

        this.appendChild(this.box);
        this.appendChild(this.list);

        this.ajax = new Resource();

        var self = this;
        this.on('click', function (ev) {
            if (ev.target.isChildOf(self.list)) {
                var line = ev.target.nodeName === 'ITEM' ? ev.target : ev.target.getParent('item');
                self.value = line.textContent.trim();
                self.hide();
            }
            else {
                self.switch();
            }
        });

        this.list.on('keypress', function (ev) {
            var line = ev.target.nodeName === 'ITEM' ? ev.target : ev.target.getParent('item');
            self.value = line.textContent.trim();
            self.hide();
        });

        this.input.on('input', function () {
            if (self.value.trim() === "") {
                self.loadedItems = null;
                self.marks = null;
            }
            self.load();
            self.test(self.value);
            self.show();
            self.dispatch('input');
        });

        this.input.on('change', function () {
            self.dispatch('change');
        });

        this.loadStatus = HTMLAutocompleteElement.STATUS_NONE;
    }

    Object.extend(HTMLAutocompleteElement, HTMLElement, {
        'test': test,
        'load': load,
        'value': {
            'enumerable': false,
            'configurable': true,
            'get': getValue,
            'set': setValue
        },
        'setRequest': setRequest,
        'getResourceUri': getResourceUri,
        'setResourceUri': setResourceUri,
        'getName': getName,
        'setName': setName,
        'show': show,
        'hide': hide,
        'switch': list_switch
    });

    window.on('click,keypress', function (ev) {
        $$('autocomplete').forEach(function (autocomplete) {
            if (!autocomplete.isParentOf(ev.target) && !(autocomplete === ev.target)) {
                autocomplete.hide();
            }
        });
    });

    HTMLAutocompleteElement.STATUS_NONE = 0;
    HTMLAutocompleteElement.STATUS_LOAD = 1;
    HTMLAutocompleteElement.STATUS_LOADED = 2;
    HTMLAutocompleteElement.STATUS_RELOAD = 3;

    $.define('autocomplete', HTMLAutocompleteElement);
    return HTMLAutocompleteElement;
})();


//  EDITABLE (dev)

(function () {

    function is_string(el) {
        return (typeof el === 'string');
    }

    function input(name, value, type_regexp, placeholder) {

        var attr = {
            'name': name,
            'value': value
        };

        if (is_string(type_regexp)) {
            attr.type = type_regexp;
        }
        else if (type_regexp instanceof RegExp) {
            attr.type = 'regexp';
            attr.source = type_regexp.source;
            attr.flags = type_regexp.flags;
        }

        if (is_string(placeholder)) {
            attr.placeholder = placeholder;
        }

        return $.create('input', attr);
    }

    function textarea(name, value, regexp, placeholder) {

        var attr = {
            'name': name,
            'value': value
        };

        if (regexp instanceof RegExp) {
            attr.type = 'regexp';
            attr.source = regexp.source;
            attr.flags = regexp.flags;
        }
        else {
            attr.type = 'text';
        }

        if (is_string(placeholder)) {
            attr.placeholder = placeholder;
        }

        return $.create('textarea', attr);
    }

    function autocomplete(name, ajax, regexp) {

    }

    function yearpicker(name, value, date_start, until) {

    }

    function monthpicker(name, value, date_start, until) {

    }

    function weekpicker(name, value, date_start, until) {

    }

    function datepicker(name, value, date_start, until) {

    }

    function daypicker(name, value, date_start, until) {

    }

    $.define('editable', function ($editable) {

        var wrapperNode = $.create('div.wrap');
        var messageNode = $.create('div.error');

        $editable.appendChild(wrapperNode);
        $editable.appendChild(messageNode);
    });

})();


//  DATEPICKER (dev)

(function () {

    function is_string(el) {
        return typeof el === 'string';
    }

    //  HOURDIGITAL (dev)

    (function () {

        function getValue() {
            return [
                this.inputHours.value,
                this.inputMinutes.value
            ];
        }

        function setValue(any) {
            if (any instanceof Date) {
                any = [any.getHours(), any.getMinutes()];
            }

            if (is_string(any)) {
                var match = any.match(/\d+/g);
                if (match) {
                    any = [match[0], match[1]];
                }
            }

            if (Array.isArray(any)) {
                var int = parseInt(any[0]);
                if (int < 0) {
                    this.inputHours.value = "23";
                }
                else if (int >= 0 && int < 24) {
                    int = (int < 10 ? "0" : "") + int;
                    this.inputHours.value = int;
                }
                else {
                    this.inputHours.value = "00";
                }

                int = parseInt(any[1]);
                if (int < 0) {
                    this.inputMinutes.value = "59";
                }
                else if (int >= 0 && int < 60) {
                    int = (int < 10 ? "0" : "") + int;
                    this.inputMinutes.value = int;
                }
                else {
                    this.inputMinutes.value = "00";
                }
            }
            return this;
        }

        function setNow() {
            var self = this;
            var id = setInterval(function () {
                self.value = new Date();
                self.stopNow = function () {
                    clearInterval(id);
                    self.stopNow = null;
                    return self;
                };
            }, 100);
            return this;
        }

        function HTMLHourDigitalElement() {
            var self = this;
            [
                this.inputHours = $.create('input'),
                $.create('icon.hours'),
                this.inputMinutes = $.create('input'),
                $.create('icon.minutes'),
            ].forEach(this.appendChild.bind(this));

            if (this.attr('now') !== null) {
                this.setNow(this);
            }
            else if (this.attr("hours") && this.attr("minutes")) {
                this.value = [parseInt(this.attr("hours")) % 24 || 0, parseInt(this.attr("minutes")) % 60 || 0];
                self.dispatch('change,input');
            }
            else {
                this.value = new Date();
            }

            this.inputHours.on('input', function () {
                self.value = [self.inputHours.value, self.inputMinutes.value];
                self.dispatch('input');
            });

            this.inputHours.on('keydown', function (ev) {
                if (ev.parent.key === "ArrowUp") {
                    self.value = [+self.inputHours.value + 1, self.inputMinutes.value];
                    self.dispatch('change,input');
                }
                if (ev.parent.key === "ArrowDown") {
                    self.value = [+self.inputHours.value - 1, self.inputMinutes.value];
                    self.dispatch('change,input');
                }
            });


            this.inputMinutes.on('input', function () {
                self.value = [self.inputHours.value, self.inputMinutes.value];
                self.dispatch('input');
            });

            this.inputMinutes.on('keydown', function (ev) {
                if (ev.parent.key === "ArrowUp") {
                    self.value = [self.inputHours.value, +self.inputMinutes.value + 1];
                    self.dispatch('change,input');
                }
                if (ev.parent.key === "ArrowDown") {
                    self.value = [self.inputHours.value, +self.inputMinutes.value - 1];
                    self.dispatch('change,input');
                }
            });

            this.on('domattributechange', function () {
                if (!self.stopNow && self.attr('now') !== null) {
                    self.setNow(self);
                }
                else if (self.stopNow) {
                    self.stopNow();
                }
            });
        }

        $.define('hour-digital', HTMLHourDigitalElement, {
            "value": {
                "enumerable": true,
                "configurable": true,
                "get": getValue,
                "set": setValue
            },
            "setNow": setNow
        });

    })();

    //  HOURCLOCK (dev)

    (function () {

        function HTMLHourClockElement() {

        }

        $.define('hour-clock', HTMLHourClockElement, {});

    })();

    //  DATE (dev)

    (function () {

        function getValue() {
            return new Date(this.attr('year'), this.attr('month'), this.attr('date'));
        }

        function setValue(val) {
            if (val instanceof Date) {
                this.attr('year', val.getFullYear());
                this.attr('month', val.getMonth());
                this.attr('date', val.getDate());
            }

            if (Array.isArray(val)) {
                this.attr('year', val[0]);
                this.attr('month', val[1]);
                this.attr('date', val[2]);
            }
            return this;
        }

        function HTMLDateElement() {

        }

        $.define('date', HTMLDateElement, {
            'value': {
                'enumerable': true,
                'configurable': false,
                'get': getValue,
                'set': setValue
            }
        });

    })();

    //  WEEK (dev)

    (function () {

        function getFirstWeekDay() {
            var dt = new Date(Date.UTC(this.attr('year'), 0));
            dt = dt.getYearFirstWeekDay();
            dt.setDate(dt.getDate() + this.attr('week') * 7);
            return dt;
        }

        function getValue() {
            var year;
            var week;
            var date = this.attr('date');
            if (date && (date = new Date(date)).valueOf()) {
                this.attr('year', year = date.getFullYear());
                this.attr('week', week = date.getWeek());
            }
            else {
                year = parseInt(this.attr('year'));
                week = parseInt(this.attr('week'));
            }
            return [year, week];
        }

        function setValue(val) {
            if (val instanceof Date) {
                this.attr('year', val.getFullYear());
                this.attr('week', val.getWeek());
            }

            else if (Array.isArray(val)) {
                this.attr('year', val[0]);
                this.attr('week', val[1]);
            }

            this.resetDates();
        }

        function resetDates() {
            while (this.firstChild)
                this.removeChild(this.firstChild);

            var current = this.getFirstWeekDay();
            for (var i = 0; i < 7; i++) {
                this.appendChild($.create('date', {
                    'year': current.getFullYear(),
                    'month': current.getMonth(),
                    'date': current.getDate()
                }, '' + current.getDate()));
                current.setDate(current.getDate() + 1);
            }
        }

        function getHead() {
            var num = Date.FIRST_WEEK_DAY, res = [];
            for (var i = 0; i < 7; i++) {
                res.push((num + i) % 7);
            }
            return res;
        }

        function getDaysName() {
            var num = Date.FIRST_WEEK_DAY, res = [];
            for (var i = 0; i < 7; i++) {
                res.push(Date.DAYS_NAME[(num + i) % 7]);
            }
            return res;
        }

        function HTMLWeekElement() {

            var year = parseInt(this.attr('year')),
                week = parseInt(this.attr('week'));
            if (Number.isNaN(year)) {
                if (Number.isNaN(week)) {
                    this.value = new Date();
                }
                else {
                    this.value = [(new Date().getFullYear()), week];
                }
            }
            else {
                if (Number.isNaN(week)) {
                    this.value = [year, 0];
                }
                else {
                    this.value = [year, week];
                }
            }
        }

        $.define('week', HTMLWeekElement, {
            'value': {
                'enumerable': true,
                'configurable': false,
                'get': getValue,
                'set': setValue
            },
            'getFirstWeekDay': getFirstWeekDay,
            'resetDates': resetDates,
            'getHead': getHead,
            'getDaysName': getDaysName
        });

    })();

    //  MONTH (dev)

    (function () {

        function getValue() {
            var year;
            var month;
            var date = this.attr('date');
            if (date && (date = new Date(date)).valueOf()) {
                this.attr('year', year = date.getFullYear());
                this.attr('month', month = date.getMonth());
            }
            else {
                year = parseInt(this.attr('year'));
                month = parseInt(this.attr('month'));
            }
            return [year, month];
        }

        function setValue(val) {
            if (val instanceof Date) {
                this.attr('year', val.getFullYear());
                this.attr('month', val.getMonth());
            }

            else if (Array.isArray(val)) {
                this.attr('year', val[0]);
                this.attr('month', val[1]);
            }

            this.resetWeeks();
        }

        function resetWeeks() {
            while (this.firstChild)
                this.removeChild(this.firstChild);

            var month = this.attr('month');
            var year = parseInt(this.attr('year'));
            var current = new Date(Date.UTC(year, month, 1, 12));
            while (current.getDay() !== Date.FIRST_WEEK_DAY) current.setDate(current.getDate() - 1);
            var el;
            var self = this;
            do {
                el = this.appendChild($.create('week', {
                    'year': current.getFullYear(),
                    'week': current.getWeek()
                }, '' + current.getDate()));
                current.setDate(current.getDate() + 7);
            } while (current.getMonth() <= month && current.getFullYear() === year);

            el.once('load', function () {
                var days = el.getDaysName(), head = $.create('days-name');
                days.forEach(function (dayName) {
                    head.appendChild($.create('span', null, dayName.substr(0, 2)));
                });
                self.prependChild(head);
            });
        }

        function getMonthName() {
            return Date.MONTHS_NAME[parseInt(this.attr('month'))] || null;
        }

        function getMonthsName() {
            return Date.MONTHS_NAME;
        }

        function HTMLMonthElement() {
            var year = parseInt(this.attr('year')),
                month = parseInt(this.attr('month'));
            if (Number.isNaN(year)) {
                if (Number.isNaN(month)) {
                    this.value = new Date();
                }
                else {
                    this.value = [(new Date().getFullYear()), month];
                }
            }
            else {
                if (Number.isNaN(month)) {
                    this.value = [year, 0];
                }
                else {
                    this.value = [year, month];
                }
            }
        }

        $.define('month', HTMLMonthElement, {
            'value': {
                'enumerable': true,
                'configurable': false,
                'get': getValue,
                'set': setValue
            },
            'resetWeeks': resetWeeks,
            'getMonthName': getMonthName,
            'getMonthsName': getMonthsName
        });

    })();

    //  YEAR (dev)

    (function () {

        function resetMonths() {
            var year = parseInt(this.attr('year')), self = this;
            if (Number.isNaN(year))
                year = new Date().getFullYear();

            this.attr('year', year);

            while (this.firstChild)
                this.removeChild(this.firstChild);

            for (var i = 0; i < 12; i++) {
                self.appendChild($.create('month-wrapper', null, [
                    $.create('month-name', null, Date.MONTHS_NAME[i]),
                    $.create('month', {'year': year, 'month': i})
                ]));
            }
        }

        function getValue() {
            return this.attr('year');
        }

        function setValue(val) {
            if (val instanceof Date) {
                this.attr('year', val.getFullYear());
                return this;
            }

            val = parseInt(val);
            if (!Number.isNaN(val)) {
                this.attr('year', val);
                return this;
            }

            this.resetMonths();
        }

        function HTMLYearElement() {
            this.resetMonths();
        }

        $.define('year', HTMLYearElement, {
            'resetMonths': resetMonths,
            'value': {
                'enumerable': true,
                'configurable': false,
                'get': getValue,
                'set': setValue
            }
        });

    })();

    //  DATEPICKER MODAL (dev)

    (function () {

        function getValue() {
            var config = this.className.toUpperCase().split(/[\w-]+/g), date = new Date();
            config.forEach(function (item) {
                switch (item) {
                    case "YEAR":
                        date.setYear(this.yearInput.value);
                        break;
                    case "MONTH":
                        date.setMonth(this.monthInput.value);
                        break;
                    case "DATE":
                        date.setDate(this.dateInput.value);
                        break;
                    case "CLOCK":
                        date.setHours(this.hourInput.value[0], this.hourInput.value[1]);
                        break
                }
            });
        }

        function toString() {
            var config = this.className.toUpperCase().split(/[\w-]+/g), date = this.getValue();
            if (config.indexOf('YEAR') !== -1 && config.indexOf('MONTH') !== -1 && config.indexOf('DATE') !== -1) {
                if (config.indexOf('HOUR') !== -1 || config.indexOf('CLOCK') !== -1) {
                    return date.toLocaleString();
                }
                else {
                    return date.toLocaleDateString();
                }
            }
            else {
                var text = [];
                if (config.indexOf('MONTH') !== -1)
                    text.push(Date.MONTHS_NAME[date.getMonth()]);
                if (config.indexOf('YEAR') !== -1)
                    text.push(date.getFullYear());
                if (config.indexOf('HOUR') !== -1 || config.indexOf('CLOCK') !== -1) {
                    text.push(date.toLocaleTimeString());
                }
                return text.join(" ");
            }
        }

        function setValue(val) {
            if (val instanceof Date) {
                this.yearInput.value = val;
                this.monthInput.value = val.getMonth();
                this.dayInput.value = val.getDay();
                this.dateInput.value = val;
                this.clockInput.value = val;
                this.hourInput.value = val;
            }
        }

        function reset() {
            var t = this.attr('value');
            this.value = t ? new Date(t) : new Date(this.attr('year'), this.attr('month'), this.attr('date'), this.attr('hours'), this.Attr('minutes'));
        }

        function HTMLDatePickerElement() {

            this.appendChild(this.box = $.create('datepicker-box', null, [
                this.text = $.create('datepicker-text')
            ]));
            this.appendChild($.create('datepicker-modal', null, [
                $.create('year-wrapper', null, this.yearInput = $.create('input')),
                $.create('month-wrapper', null, this.monthInput = $.create('dropdown')),
                $.create('day-wrapper', null, this.dayInput = $.create('dropdown')),
                $.create('date-wrapper', null, this.dateInput = $.create('month')),
                $.create('clock-wrapper', null, this.clockInput = $.create('hour-clock')),
                $.create('hour-wrapper', null, this.hourInput = $.create('hour-digital'))
            ]));

            this.reset();
        }

        $.define('datepicker', HTMLDatePickerElement, {
            'reset': reset,
            'value': {
                'enumerable': true,
                'configurable': false,
                'get': getValue,
                'set': setValue
            },
            'toString': toString
        });


    })();

})();


//  ACTION (dev)

(function () {

    function HTMLActionElement() {
        this.attr('tabindex', 0);
    }

    Object.extend(HTMLActionElement, HTMLElement, {});

    $.define('action', HTMLActionElement);
    return HTMLActionElement;
})();


//  NAVIGATION (dev)

(function () {

    function HTMLNavigationElement() {
        console.log(this);
    }

    Object.extend(HTMLNavigationElement, HTMLElement, {});

    $.define('navigation', HTMLNavigationElement);
    return HTMLNavigationElement;
})();


//  BREADCRUMB (dev)

(function () {

    function HTMLBreadcrumbElement() {
        console.log(this);
    }

    Object.extend(HTMLBreadcrumbElement, HTMLElement, {});

    $.define('breadcrumb', HTMLBreadcrumbElement);
    return HTMLBreadcrumbElement;
})();


Date.MONTHS_NAME = "Janvier,Février,Mars,Avril,Mai,Juin,Juillet,Août,Septembre,Octobre,Novembre,Décembre".split(',');
Date.DAYS_NAME = "Dimanche,Lundi,Mardi,Mercredi,Jeudi,Vendredi,Samedi".split(',');

$.load(function () {

    function getFrenchPublicHoliday(year) {
        var JourAn = new Date(year, 0, 1, 0, 0, 0);
        var FeteTravail = new Date(year, 4, 1, 0, 0, 0);
        var Victoire1945 = new Date(year, 4, 8, 0, 0, 0);
        var FeteNationale = new Date(year, 6, 14, 0, 0, 0);
        var Assomption = new Date(year, 7, 15, 0, 0, 0);
        var Toussaint = new Date(year, 10, 1, 0, 0, 0);
        var Armistice = new Date(year, 10, 11, 0, 0, 0);
        var Noel = new Date(year, 11, 25, 0, 0, 0);

        var G = year % 19;
        var C = Math.floor(year / 100);
        var H = (C - Math.floor(C / 4) - Math.floor((8 * C + 13) / 25) + 19 * G + 15) % 30;
        var I = H - Math.floor(H / 28) * (1 - Math.floor(H / 28) * Math.floor(29 / (H + 1)) * Math.floor((21 - G) / 11));
        var J = (year * 1 + Math.floor(year / 4) + I + 2 - C + Math.floor(C / 4)) % 7;
        var L = I - J;
        var MoisPaques = 3 + Math.floor((L + 40) / 44);
        var JourPaques = L + 28 - 31 * Math.floor(MoisPaques / 4);
        var LundiPaques = new Date(year, MoisPaques - 1, JourPaques + 1, 0, 0, 0);
        var Ascension = new Date(year, MoisPaques - 1, JourPaques + 39, 0, 0, 0);
        var LundiPentecote = new Date(year, MoisPaques - 1, JourPaques + 50, 0, 0, 0);
        return [JourAn, LundiPaques, FeteTravail, Victoire1945, Ascension, LundiPentecote, FeteNationale, Assomption, Toussaint, Armistice, Noel];
    }


    $('year').once('load', function () {

        var frenchPublicHolidays = getFrenchPublicHoliday(this.attr('year'));
        this.$$('day').forEach(function (day) {
            day.once('load', function () {
                frenchPublicHolidays.forEach(function (frenchPublicHoliday) {

                    if (frenchPublicHoliday.valueOf() === day.value.valueOf()) {
                        day.classList.add('public-holiday');
                    }
                });
            });
        });
    });
});
