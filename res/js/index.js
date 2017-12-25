jSmart.prototype.left_delimiter = "<{";
jSmart.prototype.right_delimiter = "}>";
var modelTpl = new jSmart($("#model_tpl").text());
var tableTpl = new jSmart($("#table_tpl").text());
var rowTpl = $("#field_tpl").text();
var tables;
$(function () {
    $("ol").sortable();
    //增加一行数据
    function addRow() {
        var dom = $(rowTpl);
        dom.appendTo($("ol"));
        attachEvent(dom);
        return dom;
    }
    //保存用户输入的历史数据
    if (localStorage.jsonData) {
        $("textarea").val(localStorage.jsonData);
    }
    $("textarea").on("change", function () {
        localStorage.jsonData = $(this).val();
    });
    //切换项目
    $("#project").on("change", function () {
        emptyAll();
        var pid = parseInt($("#project").val());
        if (pid > 0) {
            $.get(
                "bin/getTablesByPid.php", {
                PID : pid
            },
                function (data) {
                renderTables(data);
            },
                "json").fail(function () {
                alert("fail");
            });
        }
    });
    //为一行绑定事件
    function attachEvent($row) {
        $("[name=type]", $row).on("change", function () {
            if ($(this).val() == "ArrayList" || $(this).val() == "HashMap") {
                $("span.sub-type", $row).show();
                $("[name=default]", $row).hide();
                $("[name=isAutoIncrement]", $row).get(0).disabled = true;
                $("[name=isAutoIncrement]", $row).get(0).checked = false;

                $("[name=isNotNull]", $row).get(0).disabled = true;
                $("[name=isNotNull]", $row).get(0).checked = false;

                $("[name=isPrimaryKey]", $row).get(0).disabled = true;
                $("[name=isPrimaryKey]", $row).get(0).checked = false;
            } else {
                $("span.sub-type", $row).hide();
                $("[name=default]", $row).show();
                $("[name=isAutoIncrement]", $row).get(0).disabled = true;
                $("[name=isAutoIncrement]", $row).get(0).checked = false;

                $("[name=isNotNull]", $row).get(0).disabled = false;
                $("[name=isNotNull]", $row).get(0).checked = false;

                $("[name=isPrimaryKey]", $row).get(0).disabled = false;
                $("[name=isPrimaryKey]", $row).get(0).checked = false;
            }
        });
        $("[name=isPrimaryKey]", $row).on("change", function () {
            if ($(this).get(0).checked) {
                $("[name=isAutoIncrement]", $row).get(0).disabled = false;
                $("[name=isNotNull]", $row).get(0).disabled = true;
                $("[name=isNotNull]", $row).get(0).checked = false;
            }
            $("li").not($(this).parent()).each(function (index, item) {
                $("[name=isAutoIncrement]", $(item)).get(0).disabled = true;
                $("[name=isNotNull]", $(item)).get(0).disabled = false;
                $("[name=isAutoIncrement]", $(item)).get(0).checked = false;
            })
        })
    }
    //为一行绑定数据
    function attachData(data, $row) {
        $("[name=type]", $row).val(data.type);
        $("[name=subType]", $row).val(data.subType);
        $(".sub-type", $row).css("display", (data.type == "ArrayList" || data.type == "HashMap") ? "inline" : "none");

        $("[name=name]", $row).val(data.name);
        $("[name=default]", $row).val(data.default);
            $("[name=comment]", $row).val(data.comment);
            $("[name=isPrimaryKey]", $row).get(0).checked = data.isPrimaryKey;
            $("[name=isPrimaryKey]", $row).get(0).disabled = (data.type == "ArrayList" || data.type == "HashMap") ? true:
            false;

            $("[name=isAutoIncrement]", $row).get(0).checked = data.isAutoIncrement;
            $("[name=isAutoIncrement]", $row).get(0).disabled = !$("[name=isPrimaryKey]", $row).get(0).checked;

            $("[name=isNotNull]", $row).get(0).checked = data.isNotNull;
            $("[name=isNotNull]", $row).get(0).disabled = $("[name=isPrimaryKey]", $row).get(0).checked;

            $("[name=indexName]", $row).val(data.indexName);

        }
        $("#tables").on("change", "input", function () {
            var tableData = tables[$(this).parent().index()];
            try {
                $("#meta").val(decodeURIComponent(tableData.META));
                var formData = JSON.parse(decodeURIComponent(tableData.META));
                var $container = $("ol");
                $container.text('');
                $.each(formData.fields, function (index, item) {
                    attachData(item, addRow());
                });
                $("[name=tableName]").val(formData.tableName);
                $("[name=tableComment]").val(formData.tableComment);
                $("[name=version]").val(formData.version);
            } catch (e) {
                alert("解析数据异常:" + e);
            }
        })
        $("#import").on("click", function () {
            try {
                var formData = JSON.parse($("#meta").val());
                var $container = $("ol");
                $container.text('');
                $.each(formData.fields, function (index, item) {
                    attachData(item, addRow());
                });
                $("[name=tableName]").val(formData.tableName);
                $("[name=tableComment]").val(formData.tableComment);
                $("[name=version]").val(formData.version);
            } catch (e) {
                alert("解析数据异常:" + e);
            }
        });
        $("#add").on("click", function (e) {
            addRow();
        });
        $("#save").on("click", function () {
            if ($("#project").val() == -1) {
                alert("请选择项目");
                return;
            }
            if (confirm("请在保存前生成代码确认没有错误，确认保存吗？")) {
                var data = generateData();
                var currentTid = getCurrentTid();
                var postData = {
                    meta : JSON.stringify(data),
                    pid : $("#project").val(),
                    name : data.tableName,
                    version : data.version
                };
                if (currentTid != -1) {
                    postData.tid = currentTid;
                }
                $.post("bin/saveTable.php", postData, function (data) {
                    if (data.success) {
                        alert("保存成功");
                        location.reload();
                    } else {
                        alert("保存失败:" + data.errorInfo);
                    }
                }, "json")
                .fail(function () {
                    alert("error");
                })
            }
        });
        //由页面的控件生成数据表示
        function generateData() {
            var data = {
                tableName : $.trim($("[name=tableName]").val()),
                tableComment : $.trim($("[name=tableComment]").val()),
                version : $.trim($("[name=version]").val()),
                fields : []
            };
            if (!data.tableName) {
                alert("请填写表名称");
                return;
            }
            if (!data.version) {
                alert("请填写版本号");
                return;
            }
            data.tableName = data.tableName.charAt(0).toUpperCase() + data.tableName.substr(1);
            var hasPrimaryKey = false;
            var hasArray = false;
            var hasMap = false;
            $("li.field").each(function (index, item) {
                var field = {
                    type : $("[name=type]", item).val(),
                    subType : $(".sub-type", item).css("display") == "none" ? null : $("[name=subType]", item).val(),
                    name : $.trim($("[name=name]", item).val()),
                default:
                    $.trim($("[name=default]", item).val()),
                    comment : $.trim($("[name=comment]", item).val()),
                    isPrimaryKey : !$("[name=isPrimaryKey]", item).get(0).disabled && $("[name=isPrimaryKey]", item).get(0).checked,
                    isAutoIncrement : !$("[name=isAutoIncrement]", item).get(0).disabled && $("[name=isAutoIncrement]", item).get(0).checked,
                    isNotNull : !$("[name=isNotNull]", item).get(0).disabled && $("[name=isNotNull]", item).get(0).checked,
                    indexName : $.trim($("[name=indexName]", item).val())
                }
                if (field.type == "ArrayList") {
                    hasArray = true;
                }
                if (field.type == "HashMap") {
                    hasMap = true;
                }
                if (field.name) {
                    data.fields.push(field);
                    if (field.isPrimaryKey) {
                        hasPrimaryKey = true;
                    }
                }
            });
            data.hasPrimaryKey = hasPrimaryKey;
            data.hasArray = hasArray;
            data.hasMap = hasMap;
            return data;
        }
        $("#generate").on("click", function () {
            generateCode(generateData());
        });
        $("#deleteTable").on("click", function () {
            if (confirm("确认删除表吗？")) {
                var selectTid = getCurrentTid();
                if (selectTid != -1) {
                    $.post("bin/deleteTableByTid.php", {
                        TID : selectTid
                    }, function (data) {
                        if (data.success) {
                            alert("删除成功");
                            location.reload();
                        } else {
                            alert("删除失败:" + data.errorInfo);
                        }
                    }, "json")
                    .fail(function () {
                        alert("error");
                    })
                }
            }
        });
        $("#createTable").on("click", function () {
            emptyAll();
        });
        //生成Java代码
        function generateCode(data) {
            var modelCode = modelTpl.fetch(data);
            var tableCode = tableTpl.fetch(data);
            $("#model h1 span").text(data.tableName + "Model.java");
            $("#table h1 span").text(data.tableName + "Table.java");

            $("#model h1 input").on("click",function(){
                copyToClipboard(modelCode);
                $("#model h1 input").val("已复制");
                setTimeout(function(){
                    $("#model h1 input").val("复制到剪贴板");
                },1000);
            });
            $("#table h1 input").on("click",function(){
                copyToClipboard(tableCode);
                $("#table h1 input").val("已复制");
                setTimeout(function(){
                    $("#table h1 input").val("复制到剪贴板");
                },1000);
            });
            $("#model code").text(modelCode);
            $("#table code").text(tableCode);
            $('pre code').each(function (i, e) {
                hljs.highlightBlock(e)
            });
        }
        function renderTables(tablesData) {
            tables = tablesData;
            $("#tables").html("");
            for (var i = 0; i < tables.length; i++) {
                var table = tables[i];
                $("#tables").append('<li><input name="table" type="radio" value="' + table.TID + '" />' + table.NAME + '@' + table.VERSION + '</li>');
            }
        }
        function getCurrentTid() {
            var selectTid = -1;
            $("#tables input").each(function (index, item) {
                if (item.checked) {
                    selectTid = item.value;
                }
            });
            return selectTid;
        }
        function emptyAll() {
            $("ol").html("");
            $("#meta").val("");
            $("[name=tableName]").val("");
            $("[name=tableComment]").val("");
            $("[name=version]").val("");
            $("#tables input").each(function (index, item) {
                item.checked = false;
            });
            addRow();
            addRow();
            addRow();
            addRow();
        }
        function copyToClipboard(text) {
            if (window.clipboardData && window.clipboardData.setData) {
                // IE specific code path to prevent textarea being shown while dialog is visible.
                return clipboardData.setData("Text", text);
            } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
                var textarea = document.createElement("textarea");
                textarea.textContent = text;
                textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    return document.execCommand("copy"); // Security exception may be thrown by some browsers.
                } catch (ex) {
                    console.warn("Copy to clipboard failed.", ex);
                    return false;
                }
                finally {
                    document.body.removeChild(textarea);
                }
            }
        }
    });
    /*generate({
    tableName:"Question",
    hasPrimaryKey:1,
    hasArray:true,
    fields:[{
    name:"qid",
    type:"int",
    isPrimaryKey:true,
    comment:"问题的ID"
    },{
    name:"content",
    type:"String",
    comment:"问题的内容"
    },{
    name:"isSolved",
    type:"boolean",
    comment:"问题是否解决"
    },{
    name:"isDeleted",
    type:"boolean",
    isPrimaryKey:false,
    comment:"是否已经删除"
    },{
    name:"isAudioOpen",
    type:"boolean",
    comment:"是否接受语音回答"
    },{
    name:"images",
    type:"ArrayList",
    subType:"String",
    comment:"是否接受语音回答"
    }]
    });*/
