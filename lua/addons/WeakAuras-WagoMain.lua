Wago = {}

Wago.LoadOptionToggle = function(option)
    return '\z
<div class="WA-option col-sm-6 col-md-3">\z
    <div class="input-group">\z
        <span class="input-group-addon input-toggle" data-field="use_'..option.name..'" id="chk_use_'..option.name..'"><span class="icon-checkbox-unchecked"></span> '..option.display..'</span>\z
        <input type="hidden" class="form-control" id="opt_use_'..option.name..'" data-field="use_'..option.name..'" >\z
    </div>\z
</div>'
end

Wago.LoadOptionTristate = function(option)
    return '\z
<div class="WA-option col-sm-6 col-md-3">\z
    <div class="input-group">\z
        <span class="input-group-addon input-tristate" data-field="use_'..option.name..'" id="chk_use_'..option.name..'"><span class="icon-checkbox-unchecked"></span> '..option.display..'</span>\z
        <input type="hidden" class="form-control" id="opt_use_'..option.name..'" data-field="use_'..option.name..'" >\z
    </div>\z
</div>'
end

Wago.LoadOptionString = function(option, lookup)
    local lookup_class = ""
    local lookup_attr = ""
    if lookup then
        lookup_class = "lookup-data"
        lookup_attr = 'data-lookup="'..lookup..'"'
    end
    return '\z
<div class="WA-option col-sm-12 col-md-6">\z
    <div class="input-group">\z
        <span class="input-group-addon input-toggle-field" data-field="use_'..option.name..'" data-textfield="'..option.name..'" id="chk_use_'..option.name..'"><span class="icon-checkbox-unchecked"></span> '..option.display..'</span>\z
        <input type="hidden" class="form-control" id="opt_use_'..option.name..'" data-field="use_'..option.name..'" >\z
        <input type="text" class="form-control '..lookup_class..'" id="opt_'..option.name..'" '..lookup_attr..' disabled data-field="'..option.name..'" >\z
    </div>\z
</div>'
end

Wago.LoadOptionNumber = function(option)
    return '\z
<div class="WA-option col-sm-12 col-md-6">\z
    <div class="input-group">\z
        <span class="input-group-addon input-toggle-field" data-field="use_'..option.name..'" '..option.name..' data-textfield="'..option.name..'" data-opfield="op_'..option.name..'" id="chk_use_'..option.name..'"><span class="icon-checkbox-unchecked"></span> '..option.display..'</span>\z
        <input type="hidden" class="form-control" id="opt_use_'..option.name..'" data-field="use_'..option.name..'" >\z
        <div class="input-group-btn">\z
            <a class="btn btn-secondary dropdown-toggle disabled" href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">&gt;\z
                <input type="hidden" value="&gt;" class="inputValue" data-field="'..option.name..'_operator" />\z
            </a>\z
            <div class="dropdown-menu">\z
                <a class="dropdown-item" href="#">&gt;</a>\z
                <a class="dropdown-item" href="#">&gt;=</a>\z
                <a class="dropdown-item" href="#">==</a>\z
                <a class="dropdown-item" href="#">&lt;=</a>\z
                <a class="dropdown-item" href="#">&lt;</a>\z
            </div>\z
        </div>\z
        <input type="number" class="form-control" id="opt_'..option.name..'" disabled data-field="'..option.name..'" >\z
    </div>\z
</div>'
end

Wago.LoadOptionMultiselect = function(option)
    local values
    if type(WeakAuras[option.values])=="function" then
        values = WeakAuras[option.values]({})
    else
        values = WeakAuras[option.values]
    end

    local options = ""
    local values2 = {}

    if type(values)=="table" then
        for i, v in pairs(values) do
            if type(v)=="string" or type(v)=="number" then
                if string.find(v, '|[cC][fF][fF]')==1 then -- if val starts with a color code then remove it
                    v = string.sub(v, 11, -3)
                    table.insert(values2, v)
                end
                options = options .. '<option value="'..i..'">'..v..#values2..'</option>'
            end
        end

        -- if our table values were modified then sort new values and restart population
        if #values2>0 then
            table.sort(values2)
            options = ""
            for i, v in pairs(values2) do
                if type(v)=="string" or type(v)=="number" then
                    options = options .. '<option value="'..i..'">'..v..'</option>'
                end
            end
        end
    end

    local str = '\z
<div class="WA-option col-sm-12 col-md-6">\z
    <div class="input-group">\z
        <span class="input-group-addon input-toggle-field" data-field="use_'..option.name..'" data-selectfield="'..option.name..'" id="chk_use_'..option.name..'"><span class="icon-checkbox-unchecked"></span> '..option.display..'</span>\z
        <input type="hidden" class="form-control" id="use_'..option.name..'">\z
        <select name="categories[]" multiple id="opt_'..option.name..'" class="input-multiselect" disabled>'..options..'</select>\z
    </div>\z
</div>'

    return str
end




Wago.SetupLoadOptions = function(WeakAuras)
    local window = js.global
    local document = window.document
    local panel = document:getElementById( 'load-editor' )

    local L = WeakAuras.L
    local function_strings = WeakAuras.function_strings
    local anim_function_strings = WeakAuras.anim_function_strings
    local anim_presets = WeakAuras.anim_presets
    local load_prototype = WeakAuras.load_prototype
    local event_prototypes = WeakAuras.event_prototypes

    for index, arg in pairs(load_prototype.args) do
        if arg.type=="toggle" then
            panel.innerHTML = panel.innerHTML .. Wago.LoadOptionToggle(arg)

        elseif arg.type=="tristate" then
            panel.innerHTML = panel.innerHTML .. Wago.LoadOptionTristate(arg)

        elseif arg.type=="string" then
            panel.innerHTML = panel.innerHTML .. Wago.LoadOptionString(arg)

        elseif arg.type=="spell" then
            panel.innerHTML = panel.innerHTML .. Wago.LoadOptionString(arg, arg.type)

        elseif arg.type=="number" then
            panel.innerHTML = panel.innerHTML .. Wago.LoadOptionNumber(arg)

        elseif arg.type=="multiselect" then
            panel.innerHTML = panel.innerHTML .. Wago.LoadOptionMultiselect(arg)

        else

            panel.innerHTML = panel.innerHTML .. "<div class='col-sm-12'>"..arg.display.." ("..arg.type..")</div>"
        end
    end
end