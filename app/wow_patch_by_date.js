module.exports = function(ddate, beta) {
    if (beta) {
        if (ddate.isAfter('2016-05-12T009:00:00Z'))
            return "7.0.3 Legion Beta";

        if (ddate.isAfter('2016-01-01T009:00:00Z'))
            return "7.0.1 Legion Alpha";
    }

    if (ddate.isAfter('2016-08-30T00:00:00Z'))
        return "7.0.3 Legion";

    if (ddate.isAfter('2016-07-19T03:00:00Z'))
        return "7.0.3 Legion Pre-patch";

    if (ddate.isAfter('2016-03-22T03:00:00Z'))
        return "6.2.4";

    return "6.2.3"; // default; site started testing during 6.2.3
}