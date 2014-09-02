//require_once(Data.UI.js)

//Namespace for common/geneirc UI functionality
var UI = {
    //Subnamespace for edit dialogues
    Edit: {
        //Subnamespace for section rendering utilities
        Section: {
            //Function to render base section container elements
            render: function(name, head) {
                return $('<fieldset>')
                    //Add generic selection class
                    .addClass('section')
                    //Add specific selection class (e.g. .section.foo)
                    .addClass(name)
                    //Render header element
                    .append(
                        $('<legend>')
                            .addClass('header')
                            .html(head)
                    )
                ;
            },

            //Utility function render basic <input> section elements
            Input: function(name, head, val, opt) {
                //Set defaults
                var label = head;
                var placeholder = head;
                var type = 'text';
                //Check/Apply default overrides
                if(opt) {
                    if(opt.label) label = opt.label;
                    if(opt.placeholder) placeholder = opt.placeholder;
                    if(opt.type) type = opt.type;
                }
                //Generate str for <input> id & <label> for attrs
                var id = 'editSectionInputField-' + name;
                //Render section element
                return UI.Edit.Section.render(name, head)
                    //Add semi-generic selection class (e.g. .section.input)
                    .addClass('input')
                    //Add semi-specific selection class (e.g. .section.input.text)
                    .addClass(type)
                    //Render input label
                    .append(
                        $('<label>')
                            .attr('for', id)
                            .html(label)
                    )
                    //Render actual input element
                    .append(
                        $('<input>')
                            .attr('id', id)
                            .attr('type', type)
                            .attr('placeholder', placeholder)
                            .val(val)
                    )
                ;
            },

            //Utility function to render section to view/choose a single Data obj
            Data: function(type, d, opt) {
                //Set default name/header str from Data type
                var name = type;
                var head = _(type);
                //Override defaults as appropriate
                if(opt) {
                    if(opt.name) name = opt.name;
                    if(opt.head) head = opt.head;
                }
                //Render section element
                return UI.Edit.Section.render(name, head)
                    //Add generic selection class
                    .addClass('singledata')
                    //Render Data.UI element
                    .append(
                        Data.UI.Select(type, d)
                    )
                ;
            },
        },
    },
};
