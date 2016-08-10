$(document).ready(function ($) {
    $('.dropdown-toggle').dropdown()
    $('[data-toggle="tooltip"]').tooltip()
    $('[data-toggle="htmltooltip"]').tooltip({html: true})
    $(document).on('click', '.mega-dropdown', function(e) {
        e.stopPropagation()
    })
    $('body').append('<i id="cursor-tooltip" data-toggle="tooltip" data-placement="right" title="" data-html="true" data-animation="false" data-trigger="manual" style="position:absolute" />')
    $('[data-toggle="cursor-tooltip"]').on('mousemove', function(e) {
        $("#cursor-tooltip").attr('title', $(this).attr('data-title')).css({top: e.pageY, left: e.pageX });
        $('#cursor-tooltip').attr('data-original-title', $(this).attr('data-title')).tooltip('fixTitle').tooltip('show')
        $('.tooltip').css('left',parseInt($('.tooltip').css('left')) + 15 + 'px')
    }).on('mouseleave', function(e) {
        $('#cursor-tooltip').tooltip('hide')
    })

    var quickExportClip = new Clipboard('.aura-quickexport');
    quickExportClip.on('success', function(e) {
        $(e.trigger).attr('title', 'Copied').tooltip('show').mouseout(function() { $(this).tooltip('destroy') })
        e.clearSelection();
    });


    if (typeof scroll_list == "object") {
        var win = $(window);
    	var doc = $(document);
        var page = scroll_list.page

    	// Each time the user scrolls
    	win.scroll(function() {
    		// Vertical end reached?
    		if (doc.height() - win.height() == win.scrollTop()) {
    		    if ($('.scroll-load').length>0) return
    		    $('#aura-list').append('<div class="scroll-load">Loading more...</div>')
                var fetch = scroll_list
                fetch.fetch = "more"
                fetch.page = page
                $.get(scroll_list.lookup, fetch, function(html) {
                    $('.scroll-load').remove()
                    if (html=="") {
                        win.unbind('scroll')
                        return
                    }
                    $('#aura-list').append(html)
                    page++
                })
            }
        }).trigger('scroll')
    }

    // view index page
    if ($('body').is('#page-index')) {
        $('#import-as-anon-select a').click(function(e) {
            e.preventDefault()

            val = $(this).text()
            $('#import-as-anon').val(val)
            $('#import-as-anon-button').html(val+' <span class="caret"></span>')

            if (val=="Anonymous guest") {
                if ($('#aura-visibility').val()=="Private") {
                    $('#aura-visibility').val("Public")
                    $('#aura-visibility-button').html('Public <span class="caret"></span>')
                }

                $('#import-visibility-private').addClass('disabled')
            }
            else {
                $('#import-visibility-private').removeClass('disabled')
            }

        })
        $('#aura-visibility-select a').click(function(e) {
            e.preventDefault()

            val = $(this).text()
            $('#aura-visibility').val(val)
            $('#aura-visibility-button').html(val+' <span class="caret"></span>')
        })
        $('#aura-beta-select a').click(function(e) {
            e.preventDefault()

            val = $(this).text()
            $('#aura-beta').val(val)
            $('#aura-beta-button').html(val+' <span class="caret"></span>')
        })

        $('#importwa').keyup(function() {
            var input = $(this).val()
            if (input.length==0) return
            var m = input.match(/\b(and|break|do|else|elseif|end|false|for|if|in|local|nil|not|repeat|return|then|true|until|while|_G|_VERSION|getfenv|getmetatable|ipairs|load|module|next|pairs|pcall|print|rawequal|rawget|rawset|select|setfenv|setmetatable|tonumber|tostring|type|unpack|xpcall|coroutine|debug|math|package|string|table)\b/g)
            if (m.length>3) {
                // snippet detected
                $('.import-snippet-only').show()
                $('.import-wa-only').hide()
                $('.importauraname').text('Snippet')
                // try to detect a name
                var re = /(function *([\w]+) *\(|--([^\[][^\n]+)|--\[\[([^\n\]\-]+)*|"([^\n"]+)")/
                if ((m = re.exec(input)) !== null) {
                    val = m[1].trim().replace(/"/g,'')
                    $('#import-name').val(val)
                }
            }
            else {
                $('.import-snippit-only').hide()
                $('.import-wa-only').show()
                $('.importauraname').text('Aura')
            }

        })
    }
    // view account page
    else if ($('body').is('#page-account')) {
        $('#profile-visibility-select a').click(function(e) {
            e.preventDefault()

            val = $(this).text()
            $('#profile-visibility').val(val)
            $('#profile-visibility-button').html(val+' <span class="caret"></span>')
        })
        $('#aura-visibility-select a').click(function(e) {
            e.preventDefault()

            val = $(this).text()
            $('#aura-visibility').val(val)
            $('#aura-visibility-button').html(val+' <span class="caret"></span>')
        })
    }

    else if ($('body').is('#page-collection')) {
        $('#collection-visibility-select a').click(function(e) {
            e.preventDefault()

            val = $(this).text()
            $('#collection-visibility').val(val)
            $('#collection-visibility-button').html(val+' <span class="caret"></span>')
        })
        $('#delete_collection').click(function() {
            $('#delete_collection_confirm').show()
            setTimeout(function(){ $('#delete_collection_confirm').fadeOut() }, 7500)
        })
        $('#delete_collection_confirm').click(function() {
            $.post('/collection/'+$('#wago_id').text()+'/delete', function(r) {
                if (r.wago)
                    window.location = "https://wago.io/"
            })
        })
        $('#toggle_favorite').click(function() {
            if (!aura_fave) {
                var star='1'
                aura_fave = true
                $('#toggle_favorite .glyphicon').addClass('glyphicon-star').removeClass('glyphicon-star-empty')
                $('#star_count').text((parseInt($('#star_count').text().replace(',', ''))+1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
            }
            else {
                var star='0'
                aura_fave = false
                $('#toggle_favorite .glyphicon').removeClass('glyphicon-star').addClass('glyphicon-star-empty')
                $('#star_count').text((parseInt($('#star_count').text().replace(',', ''))-1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
            }
            $(this).blur()
            $.post('/star', {wagoID: $('#wago_id').text(), star: star})
        })
    }

    // view wago page
    else if ($('body').is('#page-wago')){
        $('#export-wago').click(function() {
            $.when( $('#select_func li:first a').triggerHandler('click') ).done(function() {
                $.post("/aura/export", {json: editor.getValue()}, function(r) {
                    $('#exportwago').val(r)
                    $('#export_modal').modal()
                })
            })
        })

        $('#delete_wago').click(function() {
            $('#delete_wago_confirm').show()
            setTimeout(function(){ $('#delete_wago_confirm').fadeOut() }, 7500)
        })
        $('#delete_wago_confirm').click(function() {
            $.post('/'+wagoID+'/delete', function(r) {
                if (r.wago)
                    window.location = "https://wago.io/"
            })
        })

        $('#commentjump').click(function() {
            if ($(".newcomment").length) var scrollto = $(".newcomment:first")
            else var scrollto = $("#comments_container")
            $('html, body').animate({
                scrollTop: scrollto.offset().top
            }, 333);
        })

        // if user can edit
        if ($('#modify_wago_modal').length) {
            $('#wago-visibility-select a').click(function(e) {
                e.preventDefault()

                val = $(this).text()
                $('#wago-visibility').val(val)
                $('#wago-visibility-button').html(val+' <span class="caret"></span>')
            })
            $('#wago-beta-select a').click(function(e) {
                e.preventDefault()

                val = $(this).text()
                $('#wago-beta').val(val)
                $('#wago-beta-button').html(val+' <span class="caret"></span>')
            })

            $('a.delete-comment').click(function(e) {
                e.preventDefault()

                var comment = $(this).attr('data-comment')
                $.post('/'+wagoID+'/deletecomment', {comment: comment})
                $(this).parent().parent().parent().parent().parent().remove()
            })

            $('#import_new_modal').on('shown.bs.modal', function (e) {
                $('#importwago').focus()
            })
        }

        if ($('#lua-editor').length>0) {
            var editor = ace.edit("lua-editor")
            editor.setTheme("ace/theme/tomorrow")
            editor.setAutoScrollEditorIntoView(true)
            editor.setOption("maxLines", 2000)
            editor.setShowPrintMargin(false)

            if (wago_table) {
                editor.getSession().setMode("ace/mode/json")
                editor.setValue(JSON.stringify(wago_table, null, 4), -1)
                var current_func = 'datatable'
            }
            else {
                editor.getSession().setMode("ace/mode/lua")
            }
        }

        var clip3 = new Clipboard('#copyurl');
        clip3.on('success', function(e) {
            $('#copyurl').attr('title', 'Copied').tooltip('show').mouseout(function() { $(this).tooltip('destroy') })
            e.clearSelection()
        })

        $('#save-wago').click(function() {
            $.when( $('#select_func li:first a').triggerHandler('click') ).done(function() {
                $.post("/aura/save", {json: editor.getValue(), auraID: wagoID}, function(r) {
                    if (r.wago)
                        window.location = "https://wago.io/"+r.wago
                })
            })
        })

        $('#fork-wago').click(function() {
            $.when( $('#select_func li:first a').triggerHandler('click') ).done(function() {
                $.post("/aura/fork", {json: editor.getValue(), wagoID: wagoID}, function(r) {
                    if (r.wago)
                        window.location = "https://wago.io/"+r.wago
                })
            })
        })

        $('#extract-wago').click(function() {
            $.post("/aura/fork", {lua: editor.getValue(), name: $('#current_func').text()}, function(r) {
                if (r.wago)
                    window.location = "https://wago.io/"+r.wago
            })
        })

        var clip = new Clipboard('#copywago');
        clip.on('success', function(e) {
            $('#copywago').attr('title', 'Copied').tooltip('show').mouseout(function() { $(this).tooltip('destroy') })
            e.clearSelection()
        });
        clip.on('error', function(e) {
            if(/iPhone|iPad/i.test(navigator.userAgent)) {
                actionMsg = 'No support :(';
            }
            else if (/Mac/i.test(navigator.userAgent)) {
                actionMsg = 'Press ⌘-' + actionKey + ' to ' + action;
            }
            else {
                actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action;
            }
            $('#copywago').attr('data-toggle', 'tooltip').attr('title', actionMsg).tooltip().blur(function() { /*$(this).tooltip('destroy')*/ })
        })

        var clip2 = new Clipboard('#copyaura_export');
        clip2.on('success', function(e) {
            $('#copyaura_export').attr('title', 'Copied').tooltip('show').mouseout(function() { $(this).tooltip('destroy') })
            e.clearSelection()
        });
        clip2.on('error', function(e) {
            if(/iPhone|iPad/i.test(navigator.userAgent)) {
                actionMsg = 'No support :(';
            }
            else if (/Mac/i.test(navigator.userAgent)) {
                actionMsg = 'Press ⌘-' + actionKey + ' to ' + action;
            }
            else {
                actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action;
            }
            $('#copyaura_export').attr('data-toggle', 'tooltip').attr('title', actionMsg).tooltip().blur(function() { /*$(this).tooltip('destroy')*/ })
        })

        var clip4 = new Clipboard('#copyaura_extract1wa');
        clip4.on('success', function(e) {
            $('#copyaura_extract1wa').attr('title', 'Copied').tooltip('show').mouseout(function() { $(this).tooltip('destroy') })
            e.clearSelection()
        });
        clip4.on('error', function(e) {
            if(/iPhone|iPad/i.test(navigator.userAgent)) {
                actionMsg = 'No support :(';
            }
            else if (/Mac/i.test(navigator.userAgent)) {
                actionMsg = 'Press ⌘-' + actionKey + ' to ' + action;
            }
            else {
                actionMsg = 'Press Ctrl-' + actionKey + ' to ' + action;
            }
            $('#copyaura_extract1wa').attr('data-toggle', 'tooltip').attr('title', actionMsg).tooltip().blur(function() { /*$(this).tooltip('destroy')*/ })
        })

        $('#toggle_favorite').click(function() {
            if (!wago_fave) {
                var star='1'
                wago_fave = true
                $('#toggle_favorite .glyphicon').addClass('glyphicon-star').removeClass('glyphicon-star-empty')
                $('#star_count').text((parseInt($('#star_count').text().replace(',', ''))+1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
            }
            else {
                var star='0'
                wago_fave = false
                $('#toggle_favorite .glyphicon').removeClass('glyphicon-star').addClass('glyphicon-star-empty')
                $('#star_count').text((parseInt($('#star_count').text().replace(',', ''))-1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
            }
            $(this).blur()
            $.post('/star', {wagoID: wagoID, star: star})
        })

        // if select function dropdown clicked
        $('#select_func li a').click(function(e) {
            e.preventDefault()
            ident = $(this).attr('data-fn')
            if (!ident) return
            custom_fn = editor.getValue()

            // if we're leaving the data table
            if (current_func=='datatable') {
                // make sure we can parse the data
                try{
                    tmp=JSON.parse(custom_fn);
                } catch(e) {
                    alert(e) // unable to parse
                    return false
                }
                wago_table = tmp
                tmp = null
            }
            // save code to data table
            else {
                custom_fn = custom_fn./*replace(/^[\s]*function[\s]*wago[\s]*\(m/, "function (").*/replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
                eval("wago_table."+current_func+"=\""+custom_fn+"\"")
            }

            // if we're entering the data table
            if (ident=='datatable') {
                editor.setValue(JSON.stringify(wago_table, null, 4), -1)
                editor.getSession().setMode("ace/mode/json")
                $('#extract-fn').hide()
            }

            // get code from data table
            else {
                eval("get_fn = wago_table."+ident)

                if (get_fn) {
                    get_fn = JSON.stringify(get_fn)
                    get_fn = get_fn.replace(/^"|"$/g, '').replace(/([^\\\n])\\n/g, "$1\n").replace(/\\n\n|\\n$/g,"\n").replace(/\\"/g, "\"").replace(/\\\\/g, "\\").trim().replace(/^\\n/gm, '\n')
                    //get_fn = get_fn.replace(/^[\s]*function[\s]*\(/m, "function wago(")
                    editor.setValue(get_fn, -1)
                    editor.getSession().setMode("ace/mode/lua")

                    $('#extract-fn').show()
                }
            }

            $('#current_func').text($(this).text())
            current_func = ident
            return true
        })

        $('#extract_single_wa li a').click(function(e) {
            e.preventDefault()
            ident = $(this).attr('data-ident')
            if (!ident) return
            custom_fn = editor.getValue()

            // if we're leaving the data table
            if (current_func=='datatable') {
                // make sure we can parse the data
                try{
                    tmp=JSON.parse(custom_fn);
                } catch(e) {
                    alert(e) // unable to parse
                    return false
                }
                wago_table = tmp
                tmp = null
            }
            // save code to data table
            else {
                custom_fn = custom_fn./*replace(/^[\s]*function[\s]*wago[\s]*\(m/, "function (").*/replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
                eval("wago_table."+current_func+"=\""+custom_fn+"\"")
            }

            var extract = wago_table
            $('#extract1_name').text(extract.c[ident].id)
            $.extend(true, extract.d, extract.c[ident])
            delete extract.c

            $.post("/aura/export", {json: JSON.stringify(extract) }, function(r) {
                $('#extract1wa').val(r)
                $('#extract1_modal').modal()
            })

            return true
        })

        $('#collection-select').click(function(e) {
            e.stopPropagation();
        })
        $('#collection-select').on('click', '.removefromcollection', function(e) {
            e.preventDefault();
            var collectionID = $(this).attr('data-collection')
            $(this).removeClass('removefromcollection').addClass('addtocollection')
            $.post('/collection/remove', {wagoID: wagoID, collectionID: collectionID})
        })
        $('#collection-select').on('click', '.addtocollection', function(e) {
            e.preventDefault();                  
            var collectionID = $(this).attr('data-collection')
            $(this).removeClass('addtocollection').addClass('removefromcollection')
            $.post('/collection/add', {wagoID: wagoID, collectionID: collectionID})
        })
        $('#collection-select').on('click', '.newcollection', function(e) {
            e.preventDefault();
            $('#modal_new_collection').modal()
        })

        var thisVid=''
        $('#video_url_input').keyup(function(){
            var url = $(this).val()
            if ((m = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i.exec(url)) !== null) {
                if (m && m[1] && thisVid!=m[1]) {
                    thisVid=m[1]
                    $('#video_url_input').val('Processing...')
                    $.post('/'+wagoID+'/addvideo', {source: 'youtube', videoID: thisVid}, function(r) {
                        var thumb = $('<img id="vid_'+r._id+'">')
                        thumb.attr('src', r.thumbnail).attr('data-id', r._id).attr('data-embed', r.embed)
                        thumb.appendTo('#video_list')
                        $('#video_list .selected').removeClass('selected')
                        $('#video_preview').html(r.embed)
                        $('#video_prop').show()
                        $('#video_url_input').val('')
                    })
                }
            }
            else if ((m = /twitch\.tv\/[^\/]+\/v\/([0-9]+)|twitch\.tv\/\?video=v([0-9]+)/i.exec(url)) !== null) {
                if (m && m[1] && thisVid!=m[1]) {
                    thisVid=m[1]
                    $('#video_url_input').val('Processing...')
                    $.post('/'+wagoID+'/addvideo', {source: 'twitch', videoID: thisVid}, function(r) {
                        var thumb = $('<img id="vid_'+r._id+'">')
                        thumb.attr('src', r.thumbnail).attr('data-id', r._id).attr('data-embed', r.embed)
                        thumb.appendTo('#video_list')
                        $('#video_list .selected').removeClass('selected')
                        $('#video_preview').html(r.embed)
                        $('#video_prop').show()
                        $('#video_url_input').val('')
                    })
                }
            }

              
        })

        $('#video_list').on('click', 'img', function() {
            $('#video_list .selected').removeClass('selected')
            $(this).addClass('selected')
            $('#video_preview').html($(this).attr('data-embed'))
            $('#video_preview').show()
            $('#delete_vid_confirm').hide()
            $('#video_prop').show()
        })
        $('#delete_vid').click(function() {
            $('#delete_vid_confirm').show()
            setTimeout(function(){ $('#delete_vid_confirm').fadeOut() }, 7500)
        })
        $('#delete_vid_confirm').click(function() {
            var vidID = $('#video_list .selected').attr('data-id')
            $.post(wagoID+'/delvideo', {video: vidID }, function(r) {
                $('#vid_'+vidID+', #vidt_'+vidID).remove()
                $('#video_preview').html('')
                $('#video_prop').hide()
            })
        })
        $('.playvideo').click(function() {
            $('#videoplayer').html($(this).attr('data-video')).show()
            return false;
        })
    }

    else if ($('body').is('#page-media')) {
        $('#media_file_input').change(function() {
            $($(this)[0].files).each(function () {
                var file = $(this)[0]
                if (file.name.indexOf('.jpg')>0 || file.name.indexOf('.png')>0) {
                    var reader = new FileReader();
                    reader.onload = function(e) {
                        $('#media_preview').html('')
                        $("<img />", { "src": e.target.result }).appendTo($('#media_preview'));
                        $('#media_preview').css('height', ($('#media_preview img').height()-40)+'px')
                    }
                    reader.readAsDataURL(file)
                    if ($('#media-name').val()=='') {
                        var filename = file.name.replace(/.*\/|\.[^.]*$/g, '');
                        $('#media-name').val(filename)
                    }
                }
                else if (file.name.indexOf('.blp')>0 || file.name.indexOf('.tga')>0) {
                    $('#media_preview').html(file.name+'; Can not show upload preview for this file type.').css('height', 'auto')
                }
                else {
                    $('#media_file_input').val('')
                    $('#media_preview').text(file.name+' is not valid.').css('height', 'auto')
                }
            })
        })

        $('#import-as-anon-select a').click(function(e) {
            e.preventDefault()

            val = $(this).text()
            $('#import-as-anon').val(val)
            $('#import-as-anon-button').html(val+' <span class="caret"></span>')

            if (val=="Anonymous guest") {
                if ($('#media-visibility').val()=="Private") {
                    $('#media-visibility').val("Public")
                    $('#media-visibility-button').html('Public <span class="caret"></span>')
                }

                $('#import-visibility-private').addClass('disabled')
            }
            else {
                $('#import-visibility-private').removeClass('disabled')
            }

        })
        $('#media-visibility-select a').click(function(e) {
            e.preventDefault()

            val = $(this).text()
            $('#media-visibility').val(val)
            $('#media-visibility-button').html(val+' <span class="caret"></span>')
        })
        $('#image-type-select a').click(function(e) {
            e.preventDefault()

            val = $(this).text()
            $('#image-type').val(val)
            $('#image-type-button').html(val+' <span class="caret"></span>')

            if (val=='Sprite Sheet') {
                $('.spritesheet-only').show()
            }
            else {
                $('.spritesheet-only').hide()
            }
        })

        $('a.delete-comment').click(function(e) {
            e.preventDefault()

            var mediaID = $(this).attr('data-media')
            var comment = $(this).attr('data-comment')
            $.post('/'+mediaID+'/deletecomment', {comment: comment})
            $(this).parent().parent().parent().parent().parent().remove()
        })

        $('#toggle_favorite').click(function() {
            if (!media_fave) {
                var star='1'
                aura_fave = true
                $('#toggle_favorite .glyphicon').addClass('glyphicon-star').removeClass('glyphicon-star-empty')
                $('#star_count').text((parseInt($('#star_count').text().replace(',', ''))+1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
            }
            else {
                var star='0'
                aura_fave = false
                $('#toggle_favorite .glyphicon').removeClass('glyphicon-star').addClass('glyphicon-star-empty')
                $('#star_count').text((parseInt($('#star_count').text().replace(',', ''))-1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
            }
            $(this).blur()
            $.post('/star', {wagoID: $('#media_id').text(), star: star})
        })

        // fix image preview container height
        var fixImageSizeX = 0
        var fixImageSize = setInterval(function() {
            $('#media-preview').height(Math.max(200,($('#media-preview img').height()+30))+'px')
            if (++fixImageSizeX === 15) {
                window.clearInterval(fixImageSize);
            }
        }, 100)

        $('#media-preview a').click(function(e) {
            e.preventDefault()
            $('#media-preview').removeAttr('class').addClass($(this).attr('data-class'))
        })

        if (typeof sprite=='object' && sprite.framecount && sprite.framecount>0) {
            $('#media-preview').append('<div id="media-sprite"></div>')
            $("#media-sprite").spritespin({
                source: $('#media-preview img').attr('src'),
                width: sprite.width,
                height: sprite.height,
                frames: sprite.framecount,
                framesX: sprite.columns
            })
            window.clearInterval(fixImageSize)
            $('#media-preview img').hide()
            $('#media-preview').height((sprite.height+30)+'px')

            var spriteAPI = $("#media-sprite").spritespin("api")
            $("#media-sprite").click(function() {
                spriteAPI.toggleAnimation()
            })
            $('#spritefps').slider()
            $('#spritefps').on('slide', function(e) {
                spriteAPI.setFPS(parseInt(e.value))
            })
            $('#media_preview-fps').show()


            $('#media_preview-togglesprite').show().click(function() {
                if ($('#media-preview img').is(':visible')) {
                    $('#media-preview img').hide()
                    $("#media-sprite, #media_preview-fps").show()

                    $('#media-preview').height((sprite.height+30)+'px')
                }
                else {
                    $('#media-preview img').show()
                    $("#media-sprite, #media_preview-fps").hide()

                    $('#media-preview').height(Math.max(200,($('#media-preview img').height()+30))+'px')
                }
            })
        }

        $('#delete_media').click(function() {
            $('#delete_media_confirm').show()
            setTimeout(function(){ $('#delete_media_confirm').fadeOut() }, 7500)
        })
        $('#delete_media_confirm').click(function() {
            $.post('/media/'+$('#media_id').text()+'/delete', function(r) {
                if (r.wago)
                    window.location = "https://wago.io/media/"
            })
        })
    }

    /*
    Function called when file input updated. If there is a file selected, then
    start upload procedure by asking for a signed request from the app.
    */
    $('#screenshot_file_input').change(function() {
        $($(this)[0].files).each(function () {
            var file = $(this)[0]
            if (file.type.indexOf('image/')!=0) return

            var img_id = generateID('new_ss')

            var reader = new FileReader();
            reader.onload = function(e) {
                $("<img />", { "src": e.target.result}).prependTo($('#'+img_id));
            }

            $('#ss_list').append("<div class='new_ss' id='"+img_id+"' ><img><span>Preparing Upload</span></div>")
            reader.readAsDataURL(file)
            ss_upload_file(file, img_id);
        })
    })

    // screenshots that don't load right away might be processing, add error checking for these
    $("#screenshots_container img, #ss_list img").each(function () {
        if (!this.complete || typeof this.naturalWidth == "undefined" || this.naturalWidth == 0)
            $(this).attr('onError','this.onerror=null;this.src="/assets/img/processing-thumb.png"')
    })

    $("#screenshots_wrapper").mousewheel(function(event, delta) {
        this.scrollLeft -= (delta * 40);
        event.preventDefault();
    })

    $('#ss_list').on('click', 'img', function() {
        $('#ss_list .selected').removeClass('selected')
        $(this).addClass('selected')
        $('#ss_prop div a').attr('href', $(this).attr('data-fullsize'))
        $('#ss_prop div a img').attr('src', $(this).attr('src'))
        $('#ss_id').val($(this).attr('data-id'))
        $('#ss_caption').val($(this).attr('data-caption'))
        $('#ss_filename').text($(this).attr('data-filename'))
        $('#ss_prop').show()
        $('#delete_ss_confirm').hide()
    })

    $('#delete_ss').click(function() {
        $('#delete_ss_confirm').show()
        setTimeout(function(){ $('#delete_aura_confirm').fadeOut() }, 7500)
    })
    $('#delete_ss_confirm').click(function() {
        $.post('/'+wagoID+'/ss-delete', {ss: $('#ss_id').val() }, function(r) {
            if (r.deleted) {
                $('#ss_'+$('#ss_id').val()+', #sst_'+$('#ss_id').val()).remove()
                $('#ss_prop').hide()
            }
        })
    })
    $('#ss_prop').submit(function(e) {                                        
        e.preventDefault()
        $.post($(this).attr('action'), $(this).serialize(), function() {
            $('#ss_prop input[type=submit]').attr('title', 'Saved').attr('data-placement', 'right').tooltip('show').mouseout(function() { $(this).tooltip('destroy') })
        })
    })

    lightbox.option({
      'resizeDuration': 100,
      'wrapAround': true,
      'positionFromTop': 25
    })


    if ($('#select-categories').length && all_categories && all_categories.length) {
        $('#select-categories').selectize({
            hideSelected: false,
            valueField: 'id',
            labelField: 'text',
            searchField: ['text', 'slug'],
            options: filter_selectize_cols(all_categories),
            optgroups: filter_selectize_headers(all_categories),
            optgroupLabelField: 'text',
            optgroupField: 'col',
            optgroupValueField: 'id',
            items: wago_categories,
            render: {
                item: function(item, escape) {
                    return '<div>' +
                        '<span class="'+escape(item.cls)+'">' + escape(item.text) + '</span>' +
                    '</div>';
                },
                option: function(item, escape) {
                    if (item.noselect)
                        return '<div class="optgroup-header '+escape(item.cls)+'">' + escape(item.text) + '</div>'
                    else if (item.subcat)
                        return '<div><span class="label '+escape(item.cls)+'">· ' + escape(item.text) + '</span></div>';
                    else
                        return '<div><span class="label '+escape(item.cls)+'">' + escape(item.text) + '</span></div>';
                }
            },
            plugins: ['optgroup_columns', 'remove_button']
        })
    }
    $('#enable_adv_search').click(function(e) {
        e.preventDefault()
        $(this).remove()
        $('#adv_search').slideDown(200)
        $('#advancedSearchInput').val('1')
    })
})

function filter_selectize(tags) {
    var filtered = []
    for (i=0;i<tags.length;i++) {
        if (!tags[i].systemtag && !tags[i].noselect) filtered.push(tags[i])
    }
    return filtered
}
function filter_selectize_cols(tags) {
    var filtered = []
    var col
    var col_parent
    var subcat_name
    for (i=0;i<tags.length;i++) {
        var c = tags[i]
        if ($('body').is('#page-aura') && c.type=="snippet") continue
        else if ($('body').is('#page-snippet') && c.type!="snippet") continue
        if (!c.parent && c.menucol ) {
            col = c.menucol
            if (col==5) col=1
            col_parent = c.id
        }
        if (!c.systemtag) {
            c.col = "selectize_col"+col
            if (c.parent!=col_parent) {
                c.subcat = true
                c.text = c.text.replace(subcat_name, '')
            }
            else
                subcat_name = c.text

            filtered.push(c)
        }
    }
    return filtered
}
function filter_selectize_headers(tags) {
    var filtered = []
    var col
    for (i=0;i<tags.length;i++) {
        var c = tags[i]
        if ($('body').is('#page-aura') && c.type=="snippet") continue
        else if ($('body').is('#page-snippet') && c.type!="snippet") continue
        if (!c.parent && c.menucol ) {
            col = c.menucol
            if (col==5) col=1
            filtered.push({"id": "selectize_col"+col, "text": ''})
        }
    }
    return filtered
}

function ss_upload_file(file, img_id){
    $.post("/"+wagoID+"/uploadreq", {file_name:file.name, file_type: file.type }, function(r) {
        var response = JSON.parse(r);
        if (!response.signed_request) return
        var signed_request = response.signed_request
        var url = response.url

        var xhr = new XMLHttpRequest();

        xhr.open("PUT", signed_request);
        xhr.setRequestHeader('x-amz-acl', 'public-read');
        xhr.onload = function() {
            if (xhr.status === 200) {
                $('#'+img_id+' span').remove()
                m = /&Signature=([\w]+)/.exec(response.signed_request)
                $.post("/"+wagoID+"/verifyupload", { verify: m[1] });
            }
        };
        xhr.onerror = function(e) {
            console.log(e)
            alert("Could not upload file.");
        };
        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                pct = Math.round((e.loaded / e.total) * 100)
                $('#'+img_id+' span').html('Uploading<br>'+pct)
            }
        }
        console.log(file)
        xhr.send(file);
    });
}


var generateID = (function() {
    var globalIdCounter = 0;
    return function(baseStr) {
        return(baseStr + globalIdCounter++);
    }
})();


