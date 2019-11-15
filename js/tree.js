
window.onload = function () {

    var myTreeData = {
        JSON: {},
        Data: [],
        array: [],
        Tree: {
            name: 'Групи товарів',
            id: 0
        },

        buildTree: function (item) {

            var childrenItem = myTreeData.searchChildren(item.id);

            if (childrenItem.length != 0) {
                //додати чілдрен[]
                Vue.set(item, 'children', []);

                var index;
                for (index = 0; index < childrenItem.length; index++) {

                    //додати name, id
                    item.children.push({ name: childrenItem[index][3], id: childrenItem[index][0] })

                }
                item.children.forEach(function (element) {
                    myTreeData.buildTree(element);
                });
            }
            return item;
        },

        searchChildren: function (p_id) {
            return myTreeData.Data.filter(function (el) {
                return (el[2] == p_id);
            });
        },

    };
    // define the tree-item component
    Vue.component('tree-item', {
        template: '#item-template',
        props: {
            item: Object
        },
        data: function () {
            return {
                isOpen: false
            }
        },
        computed: {
            isFolder: function () {
                return this.item.children &&
                    this.item.children.length
            }
        },
        methods: {
            toggle: function () {
                if (this.isFolder) {
                    this.isOpen = !this.isOpen
                }
            },
            chooseItem: function () {
                if (!this.isFolder) {
                    this.$emit('choose-item', this.item)
                    this.isOpen = true
                }
            }
        }
    });

    // boot up the demo
    var demo = new Vue({
        el: '#demo',
        data: {
            treeData: myTreeData.Tree//myTreeData.buildTree()
        },
        methods: {
            chooseItem: function (item) {
                g_elect.id = item.id;
                g_elect.name = item.name + ' ';
                g_elect_type = 1;
                id_e.reload()
            },
        },
    });
    var id_e = new Vue({
        el: '#id_e',
        data: {
            id_elect: -1,
            name_elect: '',
        },
        methods: {
            reload: function () {
                var type = '';
                if (g_elect_type == 1) type = '<b>  Група товарів: </b><br>';
                if (g_elect_type == 2) type = '<b>  Група постачальників: </b><br>';
                this.id_elect = g_elect.id;
                this.name_elect = type + g_elect.name;
                $('#add_order').show();
            }
        }
    });


    var g_elect = {};
    var g_elect_type = -1;

    var Order = {
        GP: -1,

        getGroup: function () {
            var data = {};

            data.CodeData = 11;

            var obj = {};
            obj.data = JSON.stringify(data);

            $.ajax({
                url: apiUrl,
                method: "POST",
                data: obj,
                xhrFields: {
                    withCredentials: true
                },
                success: function (data) {
                    var result = data;
                    var arrLength = result.GroupSupply.length;
                    var options = '<option value=""></option>';
                    for (var i = 0; i < arrLength; i++) {
                        options += '<option value="' + result.GroupSupply[i][0] + '">' + result.GroupSupply[i][1] + '</option>';
                    }
                    $("#combobox1").html(options);
                    $("#combobox1").combobox({
                        change: Order.selectGP
                    });
                    $('.ui-widget.GP').show();

                    myTreeData.Data = result.GroupWares;
                    var tree = myTreeData.buildTree(myTreeData.Tree);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert('errorCode:' + xhr.status + '\n errorMessage:' + thrownError + ' \n Підчас виконання запиту сталася помилка. Спробуйте пізніше або зверніться до техпідтримки.');
                }
            });
        },
        selectGP: function () {
            g_elect.id = $(this).val();
            g_elect.name = this.options[this.selectedIndex].innerHTML+' ';
            g_elect_type = 2;
            id_e.reload();
            $('#add_order').show();
        },
        add_order: function () {
            var data = {};
            if (g_elect_type == 1) {
                document.location = 'multiorder.html?CodeGroupWares=' + g_elect.id;
            }
            if (g_elect_type == 2) {
                document.location = 'multiorder.html?CodeGroupSupply=' + g_elect.id;
            }                
        },
        init: function () {
            Order.getGroup();
            $('#add_order').click(Order.add_order);

        }
    };

    Order.init();
};
