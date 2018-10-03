$.define('repeat', function ($repeat) {

    function add() {

        if ($repeat.childNodes.length < ($repeat.attr('max') || Infinity)) {
            var $item = $repeat.template.cloneNode(true);
            $repeat.appendChild($item);
            $repeat.dispatch('add');
            return $item;
        }
        return null;
    }

    $repeat.template = $.create('repeat-item', null, $repeat.childNodes);
    $repeat.add = add;

    while ($repeat.childNodes.length < ($repeat.attr('min') || 0)) {
        $repeat.add();
    }
});


(function () {

    function is_array(el) {
        return (el instanceof Array);
    }

    function is_object(el) {
        return (typeof el === 'object') && (el !== null);
    }

    $.define('edit-table', function ($editTable) {

        function setRows(rows) {

            while ($editTable.firstChild)
                $editTable.removeChild($editTable.firstChild);

            if (is_array(rows)) {
                rows.forEach(function (row) {
                    $editTable.addRow(row);
                });
            }
            return this;
        }

        function addRow(row) {
            var $row = $.create('edit-table-row');
            $editTable.appendChild($row);
            $row.on('define', function () {
                $row.setRow(row);
            });
            return $row;
        }

        function setColumns(columns) {
            $editTable.childNodes.forEach(function ($editTableRow) {
                if ($editTableRow.setColumns)
                    $editTableRow.setColumns(columns);
            });
            return this;
        }

        $editTable.setRows = setRows;
        $editTable.addRow = addRow;
        $editTable.setColumns = setColumns;
    });


    $.define('edit-table-row', function ($editTableRow) {

        function setRow(row) {

            while ($editTableRow.firstChild)
                $editTableRow.removeChild($editTableRow.firstChild);

            if (is_object(row)) {
                for (var field in row) {
                    if (row.hasOwnProperty(field))
                        $editTableRow.addCell(field, row[field]);
                }
            }
            return this;
        }

        function addCell(field, value, matches) {
            var $cell = $.create('edit-table-cell');
            $editTableRow.appendChild($cell);
            $cell.on('define', function () {
                $cell.setCell(field, value, matches);
            });
            return $cell;
        }

        function setColumns(columns) {

            if (is_array(columns)) {
                var reordered = [];
                columns.forEach(function (column_name) {
                    var found = null;
                    $editTableRow.childNodes.forEach(function ($editTableCell) {
                        if ($editTableCell.attr('field') === column_name) {
                            found = $editTableCell;
                        }
                    });
                    if (found) {
                        reordered.push(found);
                    }
                    else {
                        var create = $.create('edit-table-cell');
                        create.on('define', function () {
                            this.setCell(column_name, '');
                        });
                        reordered.push(create);
                    }
                });

                while ($editTableRow.firstChild)
                    $editTableRow.removeChild($editTableRow.firstChild);

                reordered.forEach(function ($editTableCell) {
                    $editTableRow.appendChild($editTableCell);
                });
            }
            return this;
        }

        $editTableRow.setRow = setRow;
        $editTableRow.addCell = addCell;
        $editTableRow.setColumns = setColumns;
    });


    $.define('edit-table-cell', function ($editTableCell) {

        function setInput(init, matches) {
            if (matches instanceof RegExp) {
                return $.create('input', {'regexp': matches.source, 'value': init}).on('change', function(){
                    $editTableCell.readNode.textContent = $editTableCell.editNode.value;
                });
            }
            else if (is_object(matches)) {
                var options = [];
                for (var value in matches) {
                    if (matches.hasOwnProperty(value)) {
                        var attr = {'value': value};
                        if(value === init) {
                            attr.selected = true;
                        }
                        options.push($.create('option', attr, matches[value]));
                    }
                }
                var select = $.create('select', null, options);
                select.value = init;
                select.on('change', function(){
                    var text = [];
                    $editTableCell.editNode.selectedOptions.forEach(function(option){
                        text.push(option.textContent);
                    });
                    $editTableCell.readNode.textContent = text.join(', ');
                });
                return select;
            }
            else {
                return $.create('input', {'value': init}).on('change', function(){
                    $editTableCell.readNode.textContent = $editTableCell.editNode.value;
                });
            }
        }

        function setCell(field, value, matches) {
            $editTableCell.attr('field', field);
            $editTableCell.readNode.textContent = value;
            $editTableCell.editNode = setInput(value, matches);
            if( $editTableCell.attr('mode') === 'edit') {
                $editTableCell.editMode();
            } else {
                $editTableCell.readMode();
            }
            return this;
        }

        function editMode() {
            while ($editTableCell.firstChild)
                $editTableCell.removeChild($editTableCell.firstChild);
            $editTableCell.appendChild($editTableCell.editNode);
            $editTableCell.attr('mode','edit');
            return this;
        }

        function readMode() {
            while ($editTableCell.firstChild)
                $editTableCell.removeChild($editTableCell.firstChild);
            $editTableCell.appendChild($editTableCell.readNode);
            $editTableCell.attr('mode','read');
            return this;
        }

        $editTableCell.setCell = setCell;
        $editTableCell.editMode = editMode;
        $editTableCell.readMode = readMode;

        $editTableCell.readNode = $.create('span');
        $editTableCell.editNode = $.create('input');

        $editTableCell.appendChild($editTableCell.readNode);
    });

})();


$.load(function () {
    var table = $.create('edit-table');
    $('body').appendChild(table);

    table.on('define', function () {
        table.setRows([
            {"firstName": "azer1", "lastName": "tyui"},
            {"firstName": "azer2", "lastName": "tyui"},
            {"firstName": "azer3", "lastName": "tyui"},
            {"firstName": "azer4", "lastName": "tyui"},
            {"firstName": "azer5", "lastName": "tyui"}
        ]);
        $('edit-table').addRow({"firstName": "you", "lastName": "well"});
    });
});
