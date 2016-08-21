module.exports = function(load) {
    var categories = []

    // setup vars
    var class_id

    // if set to load only out of combat
    if (load.hasOwnProperty('use_combat') && !load.use_combat)
        categories.push('gen6')

    // check load requirements by class/spec
    // if any specs are selected without a class, or with multiple classes, we're just going to ignore them

    // if single class is selected
    if (load['class'] && load['class'].single) {
        class_id = getClassCategory(load['class'].single)
        if (class_id) {
            categories.push(class_id)
            if (load.use_spec && load['spec'] && load['spec'].single)
                categories.push(class_id+'-'+load['spec'].single)
            else if (load.use_spec && load['spec'] && load['spec'].multi.length>0) {
                for (var i=0; i<load['spec'].multi.length; i++) {
                    if (load['spec'].multi[i])
                        categories.push(class_id+'-'+i)
                }
            }
        }
    }

    // if multi-select class is used
    else if (load.use_class && load['class'] && load['class'].multi) {
        var list = []
        for (var classKey in multiClasses) {
            if (!multiClasses.hasOwnProperty(classKey)) continue
            if (multiClasses[multiClasses]) {
                class_id = getClassCategory(load['class'].single)
                if (class_id) {
                    categories.push(class_id)
                    list.push(class_id)
                }
            }
        }
        // if only one class is selected we can still check for specs
        if (list.length==1) {
            if (load.use_spec && load['spec'] && load['spec'].single)
                categories.push(class_id+'-'+load['spec'].single)
            else if (load.use_spec && load['spec'] && load['spec'].multi.length>0) {
                for (var i=0; i<load['spec'].multi.length; i++) {
                    if (load['spec'].multi[i])
                        categories.push(class_id+'-'+i)
                }
            }
        }
    }


    // check load-on-encounter ID
    if (load.use_encounterid && load.encounterid>0) {
        var raid = getEncounterCategory(id)
        if (raid.indexOf('raiden')==0)
            categories.push('raiden')
        else if (raid.indexOf('raidnh')==0)
            categories.push('raidnh')

        categories.push(raid)
    }



    return categories
}

function getClassCategory(str) {
    switch(str) {
        case 'DEATHKNIGHT':
            return 'cl6'
        case 'DEMONHUNTER':
            return 'cl12'
        case 'DRUID':
            return 'cl11'
        case 'HUNTER':
            return 'cl3'
        case 'MAGE':
            return 'cl8'
        case 'MONK':
            return 'cl10'
        case 'PALADIN':
            return 'cl2'
        case 'PRIEST':
            return 'cl5'
        case 'ROGUE':
            return 'cl4'
        case 'SHAMAN':
            return 'cl7'
        case 'WARLOCK':
            return 'cl9'
        case 'WARRIOR':
            return 'cl1'
    }
    return false
}

function getEncounterCategory(id) {
    switch (id) {
        case 1853:
            return 'raiden1'
        case 1876:
            return 'raiden4'
        case 1873:
            return 'raiden2'
        case 1841:
            return 'raiden5'
        case 1854:
            return 'raiden6'
        case 1877:
            return 'raiden7'
        case 1864:
            return 'raiden8'
        case 1849:
            return 'raidnh1'
        case 1865:
            return 'raidnh2'
        case 1867:
            return 'raidnh3'
        case 1871:
            return 'raidnh4'
        case 1862:
            return 'raidnh5'
        case 1842:
            return 'raidnh6'
        case 1886:
            return 'raidnh7'
        case 1863:
            return 'raidnh8'
        case 1872:
            return 'raidnh9'
        case 1866:
            return 'raidnh10'
    }
}
                    