module.exports = function(load) {
    if (!load) return []
    
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
        console.error('aa')
        for (var classKey in load['class'].multi) {
        console.error('key', classKey)
            if (!load['class'].multi.hasOwnProperty(classKey)) continue

        console.error('has class',classKey)
            if (load['class'].multi[classKey]) {
                class_id = getClassCategory(classKey)
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
        var raid = getEncounterCategory(load.encounterid)
        if (raid && raid.indexOf('raiden')==0)
            categories.push('raiden')
        else if (raid && raid.indexOf('raidnh')==0)
            categories.push('raidnh')

        if (raid)
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
    id = parseInt(id)
    switch (id) {
        case 1853: return 'raiden1' // Nythendra
        case 1876: return 'raiden4' // Elerethe
        case 1873: return 'raiden2' // Ilgynoth
        case 1841: return 'raiden5' // Ursoc
        case 1854: return 'raiden6' // Dragons
        case 1877: return 'raiden7' // Cenarius
        case 1864: return 'raiden8' // Xavius

        case 1849: return 'raidnh1' // Skorpyron
        case 1865: return 'raidnh2' // Chronomatic Anomaly
        case 1867: return 'raidnh3' // Trilliax
        case 1871: return 'raidnh4' // Spellblade Aluriel
        case 1862: return 'raidnh5' // Tichondrius
        case 1842: return 'raidnh6' // Krosus
        case 1886: return 'raidnh7' // High Botanist
        case 1863: return 'raidnh8' // Star Augur
        case 1872: return 'raidnh9' // Elisande
        case 1866: return 'raidnh10' // Guldan

        case 1958: return 'raidtov1' // Odyn
        case 1962: return 'raidtov2' // Guarm
        case 2008: return 'raidtov3' // Helya

        case 2032: return 'raidtomb1' // Goroth
        case 2048: return 'raidtomb2' // Demonic Inquisition
        case 2036: return 'raidtomb3' // Harjatan
        case 2037: return 'raidtomb4' // Mistress Sasszine
        case 2050: return 'raidtomb5' // Sisters of the Moon
        case 2054: return 'raidtomb6' // Desolate Host
        case 2052: return 'raidtomb7' // Maiden of Vigilance
        case 2038: return 'raidtomb8' // Fallen Avatar
        case 2051: return 'raidtomb9' // Kiljaeden
    }
    return false


}
