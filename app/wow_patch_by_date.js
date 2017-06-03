module.exports = function(ddate, beta) {
    if (beta) {
        if (ddate.isAfter('2017-01-19T009:00:00Z'))
            return "7.2 Legion PTR";

        if (ddate.isAfter('2016-10-01T009:00:00Z'))
            return "7.1 Legion PTR";

        if (ddate.isAfter('2016-05-12T009:00:00Z'))
            return "7.0.3 Legion Beta";

        if (ddate.isAfter('2016-01-01T009:00:00Z'))
            return "7.0.1 Legion Alpha";
    }

    if (ddate.isAfter('2017-03-28T03:00:00Z'))
        return "7.2";

    if (ddate.isAfter('2017-01-10T03:00:00Z'))
        return "7.1.5";

    if (ddate.isAfter('2016-10-25T03:00:00Z'))
        return "7.1";

    if (ddate.isAfter('2016-08-30T03:00:00Z'))
        return "7.0.3";

    if (ddate.isAfter('2016-07-19T03:00:00Z'))
        return "7.0.3 Legion Pre-patch";

    if (ddate.isAfter('2016-03-22T03:00:00Z'))
        return "6.2.4";

    return "6.2.3"; // default; site started testing during 6.2.3
}