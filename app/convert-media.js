module.exports = function(format, filename, callback) {
    var extension = filename.match(/\.([0-9a-z]+)$/i)
    if (extension && extension[1]) extension = extension[1].toLowerCase()
    else return callback('Error. Unable to detect file type.')

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