define([
    '/api/docs/locales/ca.js',
    '/api/docs/locales/de.js',
    '/api/docs/locales/es.js',
    '/api/docs/locales/fr.js',
    '/api/docs/locales/it.js',
    '/api/docs/locales/nl.js',
    '/api/docs/locales/pl.js',
    '/api/docs/locales/pt_br.js',
    '/api/docs/locales/ru.js',
    '/api/docs/locales/zh.js',
    '/api/docs/locales/zh_cn.js'
], function() {
    var langId = (navigator.language || navigator.userLanguage).toLowerCase().replace('-', '_');
    var language = langId.substr(0, 2);
    var locales = {};

    for (index in arguments) {
        for (property in arguments[index])
            locales[property] = arguments[index][property];
    }
    if ( ! locales['en'])
        locales['en'] = {};

    if ( ! locales[langId] && ! locales[language])
        language = 'en';

    var locale = (locales[langId] ? locales[langId] : locales[language]);

    function __(text) {
        var index = locale[text];
        if (index === undefined)
            return text;
        return index;
    };

    function setLanguage(language) {
        locale = locales[language];
    }

    return {
        __         : __,
        locales    : locales,
        locale     : locale,
        setLanguage: setLanguage
    };
});
