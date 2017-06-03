module.exports = function(format, filename, callback) {
    var extension = filename.match(/\.([0-9a-z]+)$/i)
    if (extension && extension[1]) extension = extension[1].toLowerCase()
    else return callback('Error. Unable to detect file type.')

    if (extension=='blp') {  // BLPs converted with https://github.com/Kanma/BLPConverter
        // get output directory from filename
        var output = filename.match(/(.*)[\/\\]/)[1]||''
        require('child_process').exec('/home/mark/BLPConverter/bin/BLPConverter -f '+format+' -o "'+output+'" "'+filename+'"', {maxBuffer: 1024 * 1024 * 16}, function(err, result) {
            if (err) {
                console.error('Error converting to '+extension+' to '+format, err)
                return callback('Error. Unable to read image file.')
            }
            else {
                var re = new RegExp("\."+extension+"$","i");
                new_file = filename.replace("\/home\/mark\/wago.io\/app\/..\/mywago\/media\/", '').replace(re, '.'+format)
                callback(null, new_file)
            }
        })
    }
    else {
        require('child_process').exec('/home/mark/wago.io/nconvert/nconvert -out '+format+' "'+filename+'"', {maxBuffer: 1024 * 1024 * 16}, function(err, result) {
            if (err) {
                console.error('Error converting to '+extension+' to '+format, err)
                return callback('Error. Unable to read image file.')
            }
            else {
                var re = new RegExp("\."+extension+"$","i");
                new_file = filename.replace("\/home\/mark\/wago.io\/app\/..\/mywago\/media\/", '').replace(re, '.'+format)
                callback(null, new_file)
            }
        })
    }
}