var arrayLinksArvore = [];
var arrayLinksPage = [];
var arvoreDropzone = false;
var containerUpload = 'body';
var delayAjax = false;
var selectedItensPanelArvore = false;
var stickNoteDivSelected = 0;

function initCSSArvore() {
    if ( $('head').find('style[data-style="seipro"]').length == 0 ) {
        $('head').prepend("<style type='text/css' data-style='seipro'> "
            +"   #divMsgClipboard.msgGeral.msgSucesso { "
            +"      margin-top: -50px !important;"
            +"      padding: .4em;"
            +"      border: .2em solid #d9d9d9;"
            +"      background: #ffffaa;"
            +"      box-shadow: 0 0 5px #a0a0a0;"
            +"    } "
            +"</style>");
    }
}
function initToolbarDocs() {
    var selectedItensMenu = ( typeof localStorageRestorePro('configViewFlashMenuPro') !== 'undefined' && !$.isEmptyObject(localStorageRestorePro('configViewFlashMenuPro')) ) ? localStorageRestorePro('configViewFlashMenuPro') : [['Copiar n\u00FAmero do processo'],['Copiar link do processo'],['Enviar Documento Externo'],['Atribuir Processo']];
    var selectedItensDocMenu = ( typeof localStorageRestorePro('configViewFlashDocMenuPro') !== 'undefined' && !$.isEmptyObject(localStorageRestorePro('configViewFlashDocMenuPro')) ) ? localStorageRestorePro('configViewFlashDocMenuPro') : [['Copiar n\u00FAmero SEI'],['Copiar nome do documento'],['Copiar link do documento'],['Duplicar documento'],['Copiar para...']];
    var selectedItensDocArvore = ( typeof localStorageRestorePro('configViewFlashDocArvorePro') !== 'undefined' && !$.isEmptyObject(localStorageRestorePro('configViewFlashDocArvorePro')) ) ? localStorageRestorePro('configViewFlashDocArvorePro') : [["Copiar n\u00FAmero SEI"],["Copiar link do documento"],["Duplicar documento"]];
        selectedItensPanelArvore = ( typeof localStorageRestorePro('configViewFlashPanelArvorePro') !== 'undefined' && !$.isEmptyObject(localStorageRestorePro('configViewFlashPanelArvorePro')) ) ? localStorageRestorePro('configViewFlashPanelArvorePro') : [["Anota\u00E7\u00F5es"],["Tipo de Procedimento"],["Assuntos"],["Interessados"],["Atribui\u00E7\u00E3o"],["N\u00EDvel de Acesso"],["Observa\u00E7\u00F5es"]];
    
    var htmlToolbarProc =   '<div id="toolbar-options-proc" class="hidden">';
        if (getOptionsPro('optionsFlashMenu_menuproc') != 'disabled') {
            $.each(selectedItensMenu,function(index, value){
                var data = jmespath.search(arrayLinksArvore, "[?name=='"+value[0]+"'] | [0]");
                if ( data !== null ) {
                    var valueAlt = ( data.alt != '' ) ? data.alt : data.name;
                    htmlToolbarProc +=  '   <a href="#" data-action="linksArvore" style="width: 175px;"><i class="fa '+data.icon+'"></i><span class="info" title="'+data.name+'" alt="'+valueAlt+'">'+valueAlt+'</span></a>';
                }
            });
        }
        htmlToolbarProc +=  '   <a href="#" data-action="configMenu" style="width: 175px; background: #dedede" class="tool-item-gray"><i class="fa fa-cog" style="color: #666;"></i><span style="color: #666;" class="info" title="Personalizar Menu" alt="Personalizar Menu">Personalizar Menu</span></a>';
        htmlToolbarProc +=  '</div>';
    
    var htmlToolbarDoc =    '';
    if (getOptionsPro('optionsFlashMenu_menudoc') != 'disabled') {
        htmlToolbarDoc =    '<div id="toolbar-options-doc" class="hidden">';
        $.each(selectedItensDocMenu,function(index, value){
            var data = jmespath.search(iconsFlashDocMenu, "[?name=='"+value[0]+"'] | [0]");
            if ( data !== null ) {
                var valueAlt = ( data.alt != '' ) ? data.alt : data.name;
                htmlToolbarDoc +=  '   <a href="#" data-action="linksArvore" style="width: 175px;"><i class="fa '+data.icon+'"></i><span class="info" title="'+data.name+'" alt="'+valueAlt+'">'+valueAlt+'</span></a>';
            }
        });
        htmlToolbarDoc +=  '</div>';
    }

    if (getOptionsPro('optionsFlashMenu_iconstree') != 'disabled') {
        $.each(reverseArray(selectedItensDocArvore),function(index, value){
            var data = jmespath.search(iconsFlashDocArvore, "[?name=='"+value[0]+"'] | [0]");
            if ( data !== null ) {
                addIconActionsArvore({name: data.name, mode: data.mode, action: data.action, icon: data.icon, alt: data.alt});
            }
        });
    }
    
    $('#toolbar-options-doc, #toolbar-options-proc').remove();
    $('body').prepend(htmlToolbarProc+htmlToolbarDoc);
    var click = ( jmespath.search(selectedItensDocMenu, "[?[0]=='Ativar menu ao clicar'] | length(@)") > 0 ) ? true : false;
    getToolbarPro(click); 
}
function getLinksPage() {
    var links = [];
    $('script').not('[src*="js"]').each(function(index, value){
        if ($(this).text().indexOf('Nos[0].acoes = ') !== -1) {
            $.each($(this).text().split('\n'), function(ind, val){
                if (val.indexOf('Nos[0].acoes = ') !== -1) {
                    var barraControle = val.trim().replace("Nos[0].acoes = '",'').slice(0,-2);
                    $('<div>'+barraControle+'</div>').find('a.botaoSEI').each(function(){ 
                        if (typeof $(this).attr('href') !== 'undefined' && $(this).attr('href') != '#') { 
                            links.push({name: $(this).find('img').attr('title'), url: $(this).attr('href')}); 
                        }
                    });
                }
            });
        }
    });
    return links;
}
function actionToolbarPro(this_, triggerButton) {
    var button = $(triggerButton);
    var name_action = button.attr('data-action');
    var id_protocolo = this_.attr('id').replace('anchorImg', '').replace('anchor', '');      
    var doc = $('#anchor'+id_protocolo);
    var button_txt = button.find('.info').attr('title');
    var button_alt = button.find('.info').attr('alt');
    var button_clicktxt = '';
    var processo = $("a[target='ifrVisualizacao']").eq(0).text().trim();

    if ( name_action == 'linksArvore' ) {
        button_clicktxt = 'Abrindo...'; 
        var url = jmespath.search(arrayLinksArvore, "[?name=='"+button_txt+"'].url | [0]");
        if ( button_txt == 'Incluir em Bloco' ) {
            parent.execIncluirEmBlocoPro();
        } else if ( button_txt == 'Concluir Processo' ||  button_txt == 'Reabrir Processo' ) {
            parent.execConcluirReabrirProcessoPro(url);
        } else if ( button_txt == 'Copiar n\u00FAmero do processo' ) {
            copyToClipboard(processo);
            button_clicktxt = 'N\u00FAmero copiado!';
        } else if ( button_txt == 'Copiar somente o n\u00FAmero' ) {
            copyToClipboard(onlyNumber(processo));
            button_clicktxt = 'N\u00FAmero copiado!';
        } else if ( button_txt == 'Copiar link do processo' ) {
            callActionsArvore(doc, 'linkproc');
            button_clicktxt = 'Link copiado!';
        } else if ( button_txt == 'Copiar n\u00FAmero SEI' ) {
            callActionsArvore(doc, 'copy');
            button_clicktxt = 'N\u00FAmero copiado!';
        } else if ( button_txt == 'Enviar Documento Externo' ) {
            openModalDropzone();
            closeToolbarPro();
        } else if ( button_txt == 'Copiar para...' ) {
            button_clicktxt = 'Abrindo...';
            callActionsArvore(doc, 'copyto');
        } else if ( button_txt == 'Duplicar documento' ) {
            button_clicktxt = 'Duplicando...';
            callActionsArvore(doc, 'clone');
            // getDadosDoc(doc);
            // setLoadingActionDoc(id_protocolo);
        } else if ( button_txt == 'Copiar nome do documento' ) {
            button_clicktxt = 'Nome copiado!'; 
            callActionsArvore(doc, 'name');
        } else if ( button_txt == 'Copiar nome com link' ) {
            callActionsArvore(doc, 'namelink');
            button_clicktxt = 'Nome e link copiado!';
        } else if ( button_txt == 'Copiar link do documento' ) {
            callActionsArvore(doc, 'link');
            button_clicktxt = 'Link copiado!';
        } else {
            parent.targetIfrVisualizacaoPro(url);
        }
    } else if ( name_action == 'configMenu' ) {
        button_clicktxt = 'Abrindo...';
        parent.configFlashMenuPro(arrayLinksArvore);
    }
    button.addClass('tool-item-active').find('.info').text(button_clicktxt);
    button.find('i').addClass('fa-thumbs-up');
    setTimeout(function () {
        button.removeClass('tool-item-active').find('.info').text(button_alt);
        button.find('i').removeClass('fa-thumbs-up');
        closeToolbarPro();
    }, 2000);
}
function closeToolbarPro() {
    $('.tool-container.tool-bottom.toolbar-menu.animate-standard:visible').css({'opacity': 0, display:'none'});
    $('.clipboard .highlight, a[target="ifrVisualizacao"].highlight').removeClass('highlight');
    $('#divMsgClipboard').hide();
}
function checkToolbarToClose() {
    setTimeout(function () { 
        if ( $('.tool-container.tool-bottom.toolbar-menu.animate-standard:hover').length == 0 ) {
            closeToolbarPro();
        } else {
            checkToolbarToClose();
            // console.log('checkToolbarToClose');
        }
    }, 1000);
}
function getToolbarPro(click) {
    if ( typeof parent.dadosProcessoPro !== 'undefined') {
    //if ( typeof parent.dadosProcessoPro !== 'undefined' && typeof parent.dadosProcessoPro.listLinks !== 'undefined' && parent.dadosProcessoPro.listLinks.length > 0 ) {
        $("a[target='ifrVisualizacao']").eq(0).toolbar({
            content: '#toolbar-options-proc',
            position: 'bottom',
            //event: 'click', hideOnClick: true,
            adjustment: 5,
            style: 'menu'
        }).on('toolbarItemClick', function( event, triggerButton ) {
            actionToolbarPro($(this), triggerButton);
        });
        if (getOptionsPro('optionsFlashMenu_menudoc') != 'disabled') {
            if ($('a.clipboard').length == 0) {
                $('a[id*="anchorImg"]').each(function(){ $(this).addClass('clipboard') });
            }
            $('.clipboard').not(':first').toolbar({
                content: '#toolbar-options-doc',
                position: 'bottom',
                event: (click ? 'click' : ''), 
                hideOnClick: (click ? true : false),
                adjustment: 5,
                style: 'menu'
            }).on('toolbarHidden', function( event ) {
                if ( $('.tool-container.tool-bottom.toolbar-menu.animate-standard:visible').length == 0 ) {
                    $(event.currentTarget).removeClass('highlight');
                    $(event.currentTarget).next().removeClass('highlight');
                }
            }).on('toolbarShown', function( event ) {
                $(event.currentTarget).addClass('highlight');
                $(event.currentTarget).next().addClass('highlight');
                if (click) {
                checkToolbarToClose();
                }
                setTimeout(function () { 
                    if ( $('.tool-container.tool-bottom.toolbar-menu.animate-standard:visible').length > 0 ) {
                        $('.tool-container.tool-bottom.toolbar-menu.animate-standard:visible').not(':first').css({'opacity': 0, display:'none'});
                        $('.clipboard .highlight, a[target="ifrVisualizacao"].highlight').not(':first').removeClass('highlight');
                    }
                }, 300);
            }).on('toolbarItemClick', function( event, triggerButton ) {
                if (typeof $(triggerButton).data('click') === 'undefined' || $(triggerButton).data('click') == false) {
                    $(triggerButton).data('click', true);
                    
                    actionToolbarPro($(this), triggerButton);
                    setTimeout(function () { 
                        $(triggerButton).data('click', false);
                    }, 1000);
                }
            });  
        }
    }
}
function getLinksArvore() {
    var linksArvore = [];
    $('script').each(function(i){
        if (typeof $(this).attr('src') === 'undefined' && $(this).html().indexOf('Nos[0].acoes') !== -1) { 
            var text = $(this).html();
            var linkDocs = $.map(text.split("'"), function(substr, i) {
               return (i % 2 && substr.indexOf('href') !== -1) ? substr : null;
            });
            $.each($(linkDocs[0]),function(index, value){
                if ( typeof $(this).attr('href') !== 'undefined' && $(value).attr('href') != '#' && $(value).attr('href') != '' ) { 
                    var name = $(value).find('img').attr('title');
                    var url = $(value).attr('href');
                    var action = '';
                    var data = ( typeof jmespath !== 'undefined' ) ? jmespath.search(parent.iconsFlashMenu, "[?name=='"+name+"'] | [0]") : null;
                        data = ( data === null ) ? {name: name, icon: '', alt: ''} : data;

                    linksArvore.push({ url: url, name: data.name, icon: data.icon, alt: data.alt}); 
                }
            });
            if ( typeof parent.dadosProcessoPro !== 'undefined' && typeof parent.dadosProcessoPro.listLinks !== 'undefined' && parent.dadosProcessoPro.listLinks.length > 0 ) {
                $.each(parent.dadosProcessoPro.listLinks,function(index, value){
                    linksArvore.push(value);
                });
            }
        }
    });
    if ( typeof parent.iconsFlashMenu !== 'undefined' ) {
        linksArvore.push(parent.iconsFlashMenu[0]); 
        linksArvore.push(parent.iconsFlashMenu[1]); 
        linksArvore.push(parent.iconsFlashMenu[2]); 
        if (parent.checkConfigValue('uploaddocsexternos')) {
            linksArvore.push(parent.iconsFlashMenu[3]); 
        }
    }
    return linksArvore;
}
function initChangeUrl() {
    $('a[target="ifrVisualizacao"]').unbind('click').click(function (e) {
        //e.preventDefault();
        var params_url = getParamsUrlPro($(this).attr('href'));
        var id_procedimento = params_url.id_procedimento;
        var id_documento = params_url.id_documento;
        var linkDoc = url_host+'?acao=procedimento_trabalhar&id_procedimento='+id_procedimento;
            linkDoc = ( typeof id_documento !== 'undefined' ) ? linkDoc+'&id_documento='+id_documento : linkDoc;
        if (typeof id_procedimento !== 'undefined') { 
            parent.window.history.pushState({id_procedimento: id_procedimento, id_documento: id_documento}, '', linkDoc); 
            parent.iHistoryArray.push({id: iHistory, link: linkDoc});
            iHistory++;
        }
    });
}
function addIconActionsArvore(param) {
    $(containerUpload).find('.action-'+param.mode).remove();
    $(containerUpload).find('a[target="ifrVisualizacao"]').each(function(){
        var name = (param.alt == '') ? param.name : param.alt;
        var id_documento = getParamsUrlPro($(this).attr('href')).id_documento;  
        id_documento = (typeof id_documento !== 'undefined') ? id_documento : $(this).attr('id').replace('anchor', '');
        id_documento = (typeof id_documento !== 'undefined') ? id_documento : false;
        var iconDoc = (id_documento && $('#icon'+id_documento).attr('src').indexOf('sei_documento_interno') !== -1) ? true : false;
        var newDocLink = jmespath.search(arrayLinksPage, "[?name=='Incluir Documento'] | [0].url");
        var checkThisDocumento = (id_documento && typeof $('#anchorImg'+id_documento).find('img').attr('src') !== 'undefined' && $('#anchorImg'+id_documento).find('img').attr('src').indexOf('procedimento') !== -1) ? false : true;
        if (
                (
                    checkThisDocumento && id_documento && param.mode != 'clone' && typeof $(this).attr('href') !== 'undefined' &&
                    (
                        $(this).attr('href').indexOf('acao=arvore_visualizar&acao_origem=procedimento_visualizar&id_procedimento=') !== -1 ||
                        $(this).attr('href') == 'about:blank'
                    )
                ) || 
                (checkThisDocumento && id_documento && iconDoc && param.mode == 'clone' && newDocLink != null && newDocLink != '')
            ) {
            var html =  '<span class="action-doc action-'+param.mode+'" data-id="'+id_documento+'" data-action="'+param.mode+'" data-title="'+param.name+'" onclick="getActionsArvore(this)" onmouseover="return infraTooltipMostrar(\''+name+'\');" onmouseout="return infraTooltipOcultar();">'+
                        '   <i class="'+param.icon+'" style="color: #017fff9c; font-size: 10pt;"></i>'+
                        '</span>';
            $(this).after(html);
        }
    });
}    
function getActionsArvore(this_) {
    var _this = $(this_);
    var doc = _this.prevAll('a[target="ifrVisualizacao"]').eq(0);
    var mode = _this.data('action');
        _this.data('class',_this.find('i').attr('class'));
        _this.find('i').attr('class', 'far fa-thumbs-up azulColor');
        $('#divInfraTooltip .infraTooltipTexto').text('Copiado para a \u00E1rea de transfer\u00EAncia');
        callActionsArvore(doc, mode);
        setTimeout(function () { 
            _this.find('i').attr('class', _this.data('class'));
            $('#divInfraTooltip .infraTooltipTexto').text(_this.data('title'));
        }, 1000);
}
function callActionsArvore(doc, mode) {
    var nameDoc = doc.text().trim();
    var nr_sei = getNrSei(nameDoc);
    var documento = getNomeSei(nameDoc);
    var citacaoDoc = getCitacaoDoc();
    var id_documento = doc.attr('id').replace('anchor','');
    var id_procedimento = getParamsUrlPro(window.location.href).id_procedimento;
    var linkDoc = parent.url_host+'?acao=procedimento_trabalhar&id_procedimento='+id_procedimento+'&id_documento='+id_documento;
    var linkProc = parent.url_host+'?acao=procedimento_trabalhar&id_procedimento='+id_procedimento;
    if (mode == 'clone') {
        setLoadingActionDoc(id_documento);
        getDadosDoc(doc);
        // console.log(doc, id_documento);
    } else if (mode == 'copyto') {
        parent.dialogCopyNewDoc(doc);
        // console.log('dialogCopyNewDoc');
    } else if (mode == 'copy') {
        copyToClipboard(nr_sei);
    } else if (mode == 'name') {
        copyToClipboard(documento+' ('+citacaoDoc+nr_sei+')');
    } else if (mode == 'namelink') {
        copyToClipboardHTML(documento+' ('+citacaoDoc+'<a href="'+linkDoc+'" target="_blank">'+nr_sei+'</a>)');
    } else if (mode == 'linkproc') {
        copyToClipboard(linkProc);
    } else if (mode == 'link') {
        copyToClipboard(linkDoc);
    }
    // console.log('copyToClipboard', {id_documento: id_documento, mode: mode, nameDoc: nameDoc, nr_sei: nr_sei, documento: documento});
    // console.log(mode, doc.text(), nr_sei);
}
function getNrSei(nameDoc) {
    var nr_sei = nameDoc.split(' ');
        nr_sei = (nameDoc.indexOf(' ') !== -1) ? nr_sei[nr_sei.length-1] : '';
        nr_sei = (nr_sei.indexOf('(') !== -1) ? nr_sei.replace(')','').replace('(','').trim() : nr_sei;
    return nr_sei;
}
function getNomeSei(nameDoc) {
    var documento = nameDoc.split(' ');
    var nr_sei = (nameDoc.indexOf(' ') !== -1) ? documento[documento.length-1] : '';
        documento = (documento.indexOf(nr_sei) !== -1) ? nameDoc.replace(nr_sei,'').trim() : nameDoc;
    return documento;
}
function getDadosDoc(doc, newproc = false) {    
    var paraUrl = getParamsUrlPro(doc.attr('href'));
    var nameDoc = doc.text().trim();
    var hrefConsulta = false;
    $('script').not('[src*="js"]').each(function(index, value){
        if ($(this).text().indexOf('var objArvore = null;') !== -1) {
            $.each($(this).text().split('\n'), function(ind, val){
                var linkConsultar = 'controlador.php?acao=documento_consultar&acao_origem=arvore_visualizar&acao_retorno=arvore_visualizar&id_procedimento='+paraUrl.id_procedimento+'&id_documento='+paraUrl.id_documento;
                var linkAlterar = 'controlador.php?acao=documento_alterar&acao_origem=arvore_visualizar&acao_retorno=arvore_visualizar&id_procedimento='+paraUrl.id_procedimento+'&id_documento='+paraUrl.id_documento;
                if (val.indexOf(linkConsultar) !== -1 || val.indexOf(linkAlterar) !== -1) {
                    hrefConsulta = $.map(val.split('"'),function(v){ if (v.indexOf(linkConsultar) !== -1 || v.indexOf(linkAlterar) !== -1) { return v } })[0];
                }
            });
        }
    });
    // console.log(hrefConsulta);
    if (!delayAjax) {
        delayAjax = true;
        setTimeout(function(){ delayAjax = false }, 1000);
        if (hrefConsulta) {
            $.ajax({ url: hrefConsulta }).done(function (html) {
                var $htmlConsulta = $(html);
                var paramDoc = {};
                    paramDoc['selAssuntos'] = $htmlConsulta.find('#selAssuntos option').map(function(){ return $(this).val() }).get();
                    paramDoc['hdnAssuntos'] = ($htmlConsulta.find('#selAssuntos option').length == 0) ? [] : $htmlConsulta.find('#selAssuntos option').map(function(){ return $(this).val()+'\u00B1'+$(this).text() }).get().join('\u00A5').replaceAll(' ','+');
                    paramDoc['hdnAssuntos'] = (paramDoc['hdnAssuntos'].length == 0) ? [] : encodeURIComponent(paramDoc['hdnAssuntos']).replaceAll('%C2','').replaceAll('%2B','+');
                    paramDoc['hdnAssuntos'] = (paramDoc['hdnAssuntos'].length == 0) ? '' : paramDoc['hdnAssuntos'];
                    paramDoc['selInteressados'] = $htmlConsulta.find('#selInteressados option').map(function(){ return $(this).val() }).get();
                    paramDoc['hdnInteressados'] = $htmlConsulta.find('#selInteressados option').map(function(){ return $(this).val()+'\u00B1'+$(this).text() }).get().join('\u00A5').replaceAll(' ','+');
                    paramDoc['hdnInteressados'] = encodeURIComponent(paramDoc['hdnInteressados']).replaceAll('%C2','').replaceAll('%2B','+');
                    paramDoc['hdnInteressados'] = (paramDoc['selInteressados'].length == 0) ? '' : paramDoc['hdnInteressados'];
                    paramDoc['txtNumero'] = $htmlConsulta.find('#txtNumero').val();
                    paramDoc['txtDescricao'] = $htmlConsulta.find('#txtDescricao').val();
                    paramDoc['txaObservacoes'] = $htmlConsulta.find('#txaObservacoes').val();
                    paramDoc['rdoNivelAcesso'] = $htmlConsulta.find('input[name="rdoNivelAcesso"]:checked').val();
                    paramDoc['selHipoteseLegal'] = $htmlConsulta.find('#selHipoteseLegal').val();
                // console.log(nameDoc, paraUrl.id_documento, paramDoc);
                getDuplicateDoc(nameDoc, paramDoc, newproc);
            }).fail(function(data){
                getDuplicateDoc(nameDoc, false, newproc);
            })
        } else {
            getDuplicateDoc(nameDoc, false, newproc);
        }
    }
}
function getDuplicateDoc(nameDoc = false, paramDoc = false, newproc = false) {
    console.log('getDuplicateDoc', nameDoc, paramDoc, newproc);
    if (newproc) {
        var arrayCurrentCloneDoc = {
            nameDoc: nameDoc, 
            paramDoc: (typeof paramDoc !== 'undefined' ? paramDoc : false) 
        };
        setOptionsPro('currentCloneDoc', arrayCurrentCloneDoc);
        parent.loadingButtonConfirm(false);
        parent.resetDialogBoxPro('dialogBoxPro');

        var newPage = url_host+'?acao=procedimento_trabalhar&id_procedimento='+newproc+'#&acao_pro=duplicar_documento';
        var win = window.open(newPage, '_blank');
        if (win) {
            win.focus();
        } else {
            alert('Por favor, permita popups para essa p\u00E1gina');
        } 
        // console.log('getDuplicateDoc === true', nameDoc, paramDoc, arrayCurrentCloneDoc, newproc);
    } else {
        if (nameDoc && nameDoc != '') {
            var itemSelected = false;
            var nr_sei = getNrSei(nameDoc);
            var href = jmespath.search(arrayLinksArvore, "[?name=='Incluir Documento'].url | [0]");
            // console.log('getDuplicateDoc === else', nameDoc, nr_sei, href, arrayLinksArvore);
            if (href !== null) {
                $.ajax({ url: href }).done(function (html) {
                    let $html = $(html);
                    $html.find('#tblSeries tbody tr').each(function (v) {
                        var text = $(this).data('desc').trim();
                        var value = $(this).find('input').val();
                        var urlDoc = $(this).find('a.ancoraOpcao').attr('href');
                        if (text != '') {
                            var nameOption = escapeRegExp(text.replace(/_|:/g, ' '));
                                nameDoc = nameDoc.replace(/_|:/g, ' ');
                            var reg = new RegExp('^\\b'+nameOption, "igm");
                            if (reg.test(parent.removeAcentos(nameDoc.trim().toLowerCase()))) { 
                                if (typeof urlDoc !== 'undefined' && text != 'externo') {
                                    itemSelected = true;
                                    $.ajax({ url: urlDoc }).done(function (htmlDoc) {
                                        var $htmlDoc = $(htmlDoc);
                                        var form = $htmlDoc.find('#frmDocumentoCadastro');
                                        var hrefForm = form.attr('action');
                                        var param = {};
                                            form.find("input[type=hidden]").each(function () {
                                                if ( $(this).attr('name') && $(this).attr('id').indexOf('hdn') !== -1) {
                                                    param[$(this).attr('name')] = $(this).val(); 
                                                }
                                            });
                                            form.find('input[type=text]').each(function () { 
                                                if ( $(this).attr('id') && $(this).attr('id').indexOf('txt') !== -1) {
                                                    param[$(this).attr('id')] = $(this).val();
                                                }
                                            });
                                            form.find('select').each(function () { 
                                                if ( $(this).attr('id') && $(this).attr('id').indexOf('sel') !== -1) {
                                                    param[$(this).attr('id')] = $(this).val();
                                                }
                                            });
                                            form.find('input[type=radio]').each(function () { 
                                                if ( $(this).attr('name') && $(this).attr('name').indexOf('rdo') !== -1) {
                                                    param[$(this).attr('name')] = $(this).val();
                                                }
                                            });
                                        param.selTextoPadrao = "0";
                                        param.hdnFlagDocumentoCadastro = "2";
                                        param.rdoTextoInicial = "D";
                                        param.selTextoPadrao = null;
                                        param.txtProtocoloDocumentoTextoBase = nr_sei;
                                        param.selAssuntos = (paramDoc && typeof paramDoc.selAssuntos !== 'undefined') ? paramDoc.selAssuntos : param.selAssuntos;
                                        param.hdnAssuntos = (paramDoc && typeof paramDoc.hdnAssuntos !== 'undefined') ? paramDoc.hdnAssuntos : param.hdnAssuntos;
                                        param.selInteressados = (paramDoc && typeof paramDoc.selInteressados !== 'undefined') ? paramDoc.selInteressados : param.selInteressados;
                                        param.hdnInteressados = (paramDoc && typeof paramDoc.hdnInteressados !== 'undefined') ? paramDoc.hdnInteressados : param.hdnInteressados;
                                        param.txtNumero = (paramDoc && typeof paramDoc.txtNumero !== 'undefined' && !parent.isNumeric(paramDoc.txtNumero)) ? paramDoc.txtNumero : param.txtNumero;
                                        param.txtDescricao = (paramDoc && typeof paramDoc.txtDescricao !== 'undefined') ? paramDoc.txtDescricao : param.txtDescricao;
                                        param.txaObservacoes = (paramDoc && typeof paramDoc.txaObservacoes !== 'undefined') ? paramDoc.txaObservacoes : "";
                                        param.rdoNivelAcesso = (paramDoc && typeof paramDoc.rdoNivelAcesso !== 'undefined') ? paramDoc.rdoNivelAcesso : param.rdoNivelAcesso;
                                        param.selHipoteseLegal = (paramDoc && typeof paramDoc.selHipoteseLegal !== 'undefined') ? paramDoc.selHipoteseLegal : param.selHipoteseLegal;

                                        // console.log({nr_sei: nr_sei, name: nameOption, value: value, url: urlDoc, param: param});

                                        var postData = '';
                                        for (var k in param) {
                                            if (postData !== '') postData = postData + '&';
                                            var valor = (k=='hdnAssuntos') ? param[k] : escapeComponent(param[k]);
                                                valor = (k=='hdnInteressados') ? param[k] : valor;
                                                valor = (k=='txtDescricao') ? parent.encodeURI_toHex(param[k].normalize('NFC')) : valor;
                                                valor = (k=='txtNumero') ? escapeComponent(param[k]) : valor;
                                                postData = postData + k + '=' + valor;
                                        }
                                        // console.log(postData);

                                        var xhr = new XMLHttpRequest();
                                        $.ajax({
                                            method: 'POST',
                                            // data: param,
                                            data: postData,
                                            url: hrefForm,
                                            contentType: 'application/x-www-form-urlencoded; charset=ISO-8859-1',
                                            xhr: function() {
                                                return xhr;
                                            },
                                        }).done(function (htmlResult) {
                                            var status = (xhr.responseURL.indexOf('controlador.php?acao=arvore_visualizar&acao_origem=documento_gerar') !== -1) ? true : false;
                                            var class_icon = '';
                                            var text_icon = '';
                                            if (status) {
                                                // console.log(status);
                                                class_icon = 'fas fa-check verdeColor';
                                                text_icon = 'Documento duplicado com sucesso!';
                                                var $htmlResult = $(htmlResult);
                                                var urlEditor = [];
                                                var idUser = false;
                                                $.each($htmlResult.text().split('\n'), function(i, v){
                                                    if (v.indexOf("atualizarArvore('") !== -1) {
                                                        urlReload = v.split("'")[1];
                                                    }
                                                    if (v.indexOf("acao=editor_montar") !== -1) {
                                                        urlEditor.push(v.split("'")[1]);
                                                    }
                                                    if (v.indexOf("janelaEditor_") !== -1) {
                                                        idUser = v.split("_")[1];
                                                    }
                                                });
                                                if (urlEditor.length > 0 && idUser) {
                                                    openWindowEditor(urlEditor[0], idUser);
                                                }
                                                if (urlReload) {
                                                    window.location.href = urlReload;
                                                } else {
                                                    window.location.reload();
                                                }
                                            } else {
                                                // console.log(status);
                                                class_icon = 'fas fa-exclamation-circle vermelhoColor';
                                                text_icon = 'Erro ao duplicar o documento';
                                            }
                                            if (class_icon != '') {
                                                $(containerUpload).find('.loading-action-doc').attr('onmouseover','return infraTooltipMostrar(\''+text_icon+'\');').attr('onmouseout', 'return infraTooltipOcultar();').find('i').attr('class', class_icon);
                                            }
                                        });
                                    });
                                }
                                return false;
                            }
                        }
                    });
                    if (!itemSelected) { 
                        openAlertDuplicateDoc('Erro ao selecionar o tipo de documento');
                    }
                });
            } else {
                if (!itemSelected) { 
                    openAlertDuplicateDoc('Erro ao localizar o link de inserir documento. Verifique se o processo encontra-se aberto em sua unidade!');
                }
            }
        } else {
            if (!itemSelected) { 
                openAlertDuplicateDoc('Erro ao encontrar o documento de modelo');
            }
        }
    }
}
function openAlertDuplicateDoc(textAlert) {
    if ($(containerUpload).find('.loading-action-doc').length > 0) {
        $(containerUpload).find('.loading-action-doc').attr('onmouseover','return infraTooltipMostrar(\''+textAlert+'\');').attr('onmouseout', 'return infraTooltipOcultar();').find('i').attr('class', 'fas fa-exclamation-circle vermelhoColor') 
    } else {
        parent.alertaBoxPro('Error', 'exclamation-triangle', textAlert);
    }
}
function openWindowEditor(urlEditor, idUser) {
    var id_documento = getParamsUrlPro(urlEditor).id_documento
    var janelaEditor = infraAbrirJanela('', 'janelaEditor_'+idUser+'_'+id_documento, parent.infraClientWidth(), parent.infraClientHeight(), 'location=0,status=0,resizable=1,scrollbars=1', false);
    if (janelaEditor.location=='about:blank') {
        janelaEditor.location.href = urlEditor;
    }
    janelaEditor.focus();
}
function setLoadingActionDoc(id_documento) {
    var html = '<span class="loading-action-doc" data-id="'+id_documento+'"><i class="fas fa-cog fa-spin" style="color: #017FFF; font-size: 10pt;"></i></span>';
    $(containerUpload).find('.loading-action-doc').remove();
    $('#anchor'+id_documento).before(html);
}
function loadUploadArvore() {
    dropzoneDivInfoHover();
    arvoreDropzone = new Dropzone(containerUpload, { 
        url: url_host,
        createImageThumbnails: false,
        autoProcessQueue: false,
        parallelUploads: 1,
        clickable: '#dz-infoupload',
        previewsContainer: '#divArvore',
        timeout: 900000,
        paramName: 'filArquivo',
        renameFile: function (file) {
            return parent.removeAcentos(file.name);
        },
        previewTemplate:    '<div class="dz-preview dz-file-preview">'+
                            '   <div class="dz-details">'+
                            '       <span class="dz-error-mark" '+($(containerUpload).find('a[id*="anchorImgPASTA"]').length > 0 ? 'style="left:30px"' : '')+'><i data-dz-remove class="fas fa-trash vermelhoColor" style="margin: 5px 8px;cursor: pointer; font-size: 10pt;"></i></span>'+
                            '       <span class="dz-error-message" '+($(containerUpload).find('a[id*="anchorImgPASTA"]').length > 0 ? 'style="left:30px"' : '')+'><span data-dz-errormessage></span></span>'+
                            '       <span class="dz-progress">'+
                            '           <span class="dz-upload" data-dz-uploadprogress></span>'+
                            '       </span>'+
                            ($(containerUpload).find('a[id*="anchorImgPASTA"]').length > 0 ? '<img style="margin-left: -3px;" src="/infra_js/arvore/empty.gif" align="absbottom">' : '')+
                            '       <img src="/infra_js/arvore/join.gif" align="absbottom">'+
                            '       <a id="anchorImgID" style="margin-left: -4px;" class="clipboard" title="Clique para copiar o n\u00FAmero do protocolo para a \u00E1rea de transfer\u00EAncia">'+
                            '           <img class="dz-link-icon" src="/infra_css/imagens/pdf.gif" align="absbottom" id="iconID">'+
                            '       </a>'+
                            '       <span class="dz-progress-mark"><i class="fas fa-cog fa-spin" style="color: #017FFF; font-size: 10pt;"></i></span>'+
                            '       <a id="anchorID" target="ifrVisualizacao" class="dz-filename">'+
                            '           <span data-dz-name title="" id="spanID"></span>'+
                            '       </a>'+
                            '       <span class="dz-size" data-dz-size></span>'+
                            '       <span class="dz-remove" data-dz-remove><i class="fas fa-trash-alt vermelhoColor" style="cursor:pointer"></i></span>'+
                            '   </div>'+
                            '</div>',
        dictDefaultMessage: "Solte aqui os arquivos para enviar",
        dictFallbackMessage: "Seu navegador n\u00E3o suporta uploads de arrastar e soltar.",
        dictFallbackText: "Por favor, use o formul\u00E1rio abaixo para enviar seus arquivos como antigamente.",
        dictFileTooBig: "O arquivo \u00E9 muito grande ({{filesize}}MB). Tamanho m\u00E1ximo permitido: {{maxFilesize}}MB.",
        dictInvalidFileType: "Voc\u00EA n\u00E3o pode fazer upload de arquivos desse tipo.",
        dictResponseError: "O servidor respondeu com o c\u00F3digo {{statusCode}}.",
        dictCancelUpload: "Cancelar envio",
        dictCancelUploadConfirmation: "Tem certeza de que deseja cancelar este envio?",
        dictRemoveFile: "Remover arquivo",
        dictMaxFilesExceeded: "Voc\u00EA s\u00F3 pode fazer upload de {{maxFiles}} arquivos."          
    });
    arvoreDropzone.on("addedfiles", function(files) {
        dropzoneCancelInfo();
        console.log()
        if (verifyConfigValue('sortbeforeupload') && arvoreDropzone.getQueuedFiles().length > 1) {
            sortUploadArvore();
        } else {
            sendUploadArvore('upload');
        }
    }).on("addedfile", function(file) {
        // console.log('Files', file);
        dropzoneNormalizeImg(file);
    }).on("removedfile", function(file) {
        dropzoneNormalizeImg(file);
    }).on('success', function(result) {
        var params = arvoreDropzone.options.params;
        var response = result.xhr.response.split('#');
            params.paramsForm.hdnAnexos = encodeUrlUploadArvore(response, params);

        var postData = '';
        for (var k in params.paramsForm) {
            if (postData !== '') postData = postData + '&';
            var valor = (k=='hdnAnexos') ? params.paramsForm[k] : escapeComponent(params.paramsForm[k]);
                valor = (k=='txtNumero') ? parent.encodeURI_toHex(params.paramsForm[k].normalize('NFC')) : valor;                
                postData = postData + k + '=' + valor;
        }
        params.paramsForm = postData;
        sendUploadArvore('save', params);
    }).on('error', function(e) {
        sendUploadArvore('upload');
    }).on('dragleave', function(e) {
        $(containerUpload).addClass('dz-drag-hover');
    });
    var extUpload = localStorageRestorePro('arvoreDropzone_acceptedFiles');
    if (extUpload !== null) {
        arvoreDropzone.options.acceptedFiles = extUpload;
    }
}
function statusUploadArvore(this_) {
    $(this_).find('i').attr('class', 'fas fa-sync-alt fa-spin azulColor');
    $(this_).removeAttr('onclick');
}
function sortUploadArvore() {
    var htmlUpload =    '<div id="divUploadDoc" class="panelDadosArvore" style="margin-top: 15px; padding: 1.2em 0 0 0 !important;">'+
                        '   <a style="cursor:pointer;" onclick="sendUploadArvore(\'upload\'); statusUploadArvore(this)" class="newLink">'+
                        '       <i class="fas fa-upload azulColor"></i>'+
                        '       <span style="font-size:1.2em"> Enviar documentos</span>'+
                        '   </a>'+
                        '</div>';

    $('#divUploadDoc').remove();
    $('#divArvore').sortable({
        items: '.dz-file-preview',
        cursor: 'grabbing',
        handle: '.dz-filename',
        forceHelperSize: true,
        opacity: 0.5,
        update: function(event, ui) {
            var files = arvoreDropzone.getQueuedFiles();
            files.sort(function(a, b){
                return ($(a.previewElement).index() > $(b.previewElement).index()) ? 1 : -1;
            })
            arvoreDropzone.removeAllFiles();
            arvoreDropzone.handleFiles(files);
        }
    }).after(htmlUpload);
}
function encodeUrlUploadArvore(response, params) {
    var id = response[0];
    var nome = response[1];
    var dthora = response[4];
    var tamanho = response[3];
    var tamanho_formatado = infraFormatarTamanhoBytes(parseInt(tamanho));
    var plus = '\u00B1';
    var hdnAnexos = id+plus+nome+plus+dthora+plus+tamanho+plus+tamanho_formatado+plus+params.userUnidade.user+plus+params.userUnidade.unidade;
        hdnAnexos = (hdnAnexos.indexOf(' ') !== -1) ? hdnAnexos.replace(/ /g,'+') : hdnAnexos;
        hdnAnexos = encodeURIComponent(hdnAnexos);
        hdnAnexos = (hdnAnexos.indexOf('%C2') !== -1) ? hdnAnexos.replace(/%C2/g,'') : hdnAnexos;
        hdnAnexos = (hdnAnexos.indexOf('%2B') !== -1) ? hdnAnexos.replace(/%2B/g,'+') : hdnAnexos;

        console.log(hdnAnexos);

    return hdnAnexos;
}
function sendUploadArvore(mode, result = false) {
    var indexUpload = parseInt($(containerUpload).data('index'));
    var elem = $('.dz-preview').eq(indexUpload);
    if (mode == 'upload' && arvoreDropzone.getQueuedFiles().length > 0) {
        var href = jmespath.search(arrayLinksArvore, "[?name=='Incluir Documento'].url | [0]");
        if (href !== null) {
            $.ajax({ url: href }).done(function (html) {
                let $html = $(html);
                var urlDocExterno = $html.find('#tblSeries').find('a[href*="controlador.php?acao=documento_receber"]').attr('href');
                if (typeof urlDocExterno !== 'undefined') {
                    $.ajax({ url: urlDocExterno }).done(function (htmlAnexo) {
                        var $htmlAnexo = $(htmlAnexo);
                        var form = $htmlAnexo.find('#frmDocumentoCadastro');
                        var hrefForm = form.attr('action');

                        var urlUpload = '';
                        var extUpload = [];
                        var userUnidade = '';
                            $.each(htmlAnexo.split('\n'), function(index, value) {
                                if (value.indexOf("objUpload = new infraUpload") !== -1) {
                                    urlUpload = value.split("'")[3];
                                }
                                if (value.indexOf("arrExt") !== -1) {
                                    if (typeof value.split('"')[1] !== 'undefined') {
                                        extUpload.push('.'+value.split('"')[1]);
                                    }
                                }
                                if (value.indexOf("objTabelaAnexos.adicionar") !== -1) {
                                    var regex = /\s*objTabelaAnexos\.adicionar\(\[arr\['nome_upload'\],arr\['nome'\],arr\['data_hora'\],arr\['tamanho'],infraFormatarTamanhoBytes\(arr\['tamanho'\]\),'(.+?)' ,'(.+?)']\);/gm
                                    var paramV = regex.exec(value);
                                    if (paramV === null) return null;
                                    userUnidade = {user: paramV[1], unidade: paramV[2]};
                                }
                            });
                        var param = {};
                            form.find("input[type=hidden]").each(function () {
                                if ( $(this).attr('name') && $(this).attr('id').indexOf('hdn') !== -1) {
                                    param[$(this).attr('name')] = $(this).val(); 
                                }
                            });
                            form.find('input[type=text]').each(function () { 
                                if ( $(this).attr('id') && $(this).attr('id').indexOf('txt') !== -1) {
                                    param[$(this).attr('id')] = $(this).val();
                                }
                            });
                            form.find('select').each(function () { 
                                if ( $(this).attr('id') && $(this).attr('id').indexOf('sel') !== -1) {
                                    param[$(this).attr('id')] = $(this).val();
                                }
                            });
                            form.find('input[type=radio]').each(function () { 
                                if ( $(this).attr('name') && $(this).attr('name').indexOf('rdo') !== -1) {
                                    param[$(this).attr('name')] = $(this).val();
                                }
                            });
                        if (extUpload.length > 0) {
                            arvoreDropzone.options.acceptedFiles = extUpload.join(',');
                            parent.localStorageStorePro('arvoreDropzone_acceptedFiles', extUpload.join(','));
                        }

                        var nexFileQueued = arvoreDropzone.getQueuedFiles()[0];
                        var txtDataElaboracao = (typeof nexFileQueued !== 'undefined' && typeof nexFileQueued.lastModifiedDate !== 'undefined') 
                                                ? moment(nexFileQueued.lastModifiedDate).format('DD/MM/YYYY')
                                                : moment().format('DD/MM/YYYY');
                        var nameFile = nexFileQueued.name;
                        var nameFile_reg = parent.removeAcentos(nameFile.trim().toLowerCase().replace(/_|:/g, ' '));
                        var valueSerie = false;
                        var tipoDoc = [];
                            form.find('#selSerie option').each(function (v) { 
                                if ($(this).text().trim() != '') { 
                                    var nameOption = $(this).text().trim().toLowerCase().replace(/_|:/g, ' ');
                                    var nameOptionReg = escapeRegExp(parent.removeAcentos(nameOption));
                                    var reg = new RegExp('^\\b'+nameOptionReg, "igm");
                                    tipoDoc.push({name: nameOption, value: $(this).val()}) 
                                    if (reg.test(nameFile_reg)) { 
                                        valueSerie = $(this).val();
                                        return false;
                                    }
                                }
                            });
                        var selSerieDefault = (getConfigValue('newdocname')) 
                                ? $.map(tipoDoc, function(value){ if (value.name == getConfigValue('newdocname').trim().toLowerCase().replace(/_|:/g, ' ')) { return value } })[0]
                                : $.map(tipoDoc, function(value){ if (value.name == 'anexo') { return value } })[0];
                            selSerieDefault = (typeof selSerieDefault !== 'undefined') 
                                ? selSerieDefault 
                                : $.map(tipoDoc, function(value){ if (value.name.indexOf('anexo') !== -1) { return value } })[0];

                        // console.log(getConfigValue('newdocname'), selSerieDefault, tipoDoc);

                        var selSerie = (valueSerie) ? valueSerie : selSerieDefault.value;
                        var selSerieSelected = $.map(tipoDoc, function(value){ if (value.value == valueSerie) { return value } })[0];
                            selSerieSelected = (typeof selSerieSelected !== 'undefined') ? selSerieSelected : selSerieDefault;
                            
                        var nameDoc = nameFile.normalize('NFC');
                        var reg = new RegExp('^\\b'+selSerieSelected.name, "igm");
                        if (reg.test(nameDoc)) { nameDoc = nameDoc.replace(reg, '').trim() }
                            nameDoc = nameDoc.substring(0, nameDoc.lastIndexOf("."));
                            nameDoc = (nameDoc.length > 50) ? nameDoc.replace(/^(.{50}[^\s]*).*/, "$1") : nameDoc;
                            nameDoc = (nameDoc.length > 50) ? nameDoc.substring(0,49) : nameDoc;

                        param.selSerie = selSerie;
                        param.hdnIdSerie = selSerie;
                        param.rdoNivelAcesso = (form.find('input[name="rdoNivelAcesso"]:checked').length > 0) ? form.find('input[name="rdoNivelAcesso"]:checked').val() : "0";
                        param.hdnStaNivelAcessoLocal = param.rdoNivelAcesso; //
                        param.rdoFormato = (parent.checkConfigValue('newdocformat') && parent.getConfigValue('newdocformat') && parent.getConfigValue('newdocformat').indexOf('digitalizado') !== -1) ? "D": "N";
                        param.hdnFlagDocumentoCadastro = "2";
                        param.hdnIdHipoteseLegal = param.selHipoteseLegal;
                        param.selTipoConferencia = (parent.checkConfigValue('newdocformat') && parent.getConfigValue('newdocformat') && parent.getConfigValue('newdocformat').indexOf('digitalizado') !== -1 && parent.getConfigValue('newdocformat').indexOf('_') !== -1) ? getConfigValue('newdocformat').split('_')[1] : "";
                        param.hdnIdTipoConferencia = param.selTipoConferencia;
                        param.txaObservacoes = "";
                        param.txtDataElaboracao = txtDataElaboracao;
                        param.txtNumero = nameDoc;
                        // console.log(parent.checkConfigValue('newdocformat'), parent.getConfigValue('newdocformat'), param.rdoFormato, param.hdnIdTipoConferencia);
                        arvoreDropzone.options.url = urlUpload;
                        arvoreDropzone.options.params = {
                                                            urlForm: hrefForm,
                                                            paramsForm: param,
                                                            userUnidade: userUnidade,
                                                        };
                        arvoreDropzone.processQueue();

                        // console.log('param###', param, nameDoc, nameFile, selSerieSelected, selSerie, tipoDoc);
                    });
                } else {
                    elem.addClass("dz-error").find('.dz-error-message span').text('Link para upload n\u00E3o encontrado');
                }
            });
        } else {
            elem.addClass("dz-error").find('.dz-error-message span').text('Link para incluir documento n\u00E3o encontrado');
        }
    } else if (mode == 'save' && result) {
        var href = result.urlForm;
        var param = result.paramsForm;
        var xhr = new XMLHttpRequest();
        $.ajax({
            method: 'POST',
            data: param,
            url: href,
            contentType: 'application/x-www-form-urlencoded; charset=ISO-8859-1',
            xhr: function() {
                 return xhr;
            },
        }).done(function (htmlResult) {
            var status = (xhr.responseURL.indexOf('acao=arvore_visualizar&acao_origem=documento_receber') !== -1) ? true : false;
            if (status) {
                sendUploadArvore('upload');
                getInfoArvoreLastDoc(htmlResult, xhr.responseURL);
            } else {
                elem.addClass("dz-error").find('.dz-error-message span').text('N\u00E3o foi poss\u00EDvel fazer o upload do arquivo');
            }
        });
    }
}
function getInfoArvoreLastDoc(dataResult, urlParent) {
    var indexUpload = parseInt($(containerUpload).data('index'));
    var param = getParamsUrlPro(urlParent);
    $.each(dataResult.split('\n'), function(index, value) {
        if (value.indexOf("atualizarArvore('controlador.php?acao=procedimento_visualizar&acao_origem=arvore_visualizar&id_procedimento="+param.id_procedimento+"&id_documento="+param.id_documento) !== -1) {
            urlArvore = value.split("'")[1];
            $.ajax({ url: urlArvore }).done(function (htmlArvore) {
                var arrayArvore = [];
                $.each(htmlArvore.split('\n'), function(index, value) {
                    if (value.indexOf('new infraArvoreNo("DOCUMENTO","'+param.id_documento+'","'+param.id_procedimento+'"') !== -1) {
                        arrayArvore = value.split('"');
                        return false;
                    }
                });
                var elem = $('.dz-preview').eq(indexUpload);
                    elem.find('a[target="ifrVisualizacao"]').attr('href', arrayArvore[7]).attr('id', 'anchor'+param.id_documento)
                        .find('span').text(arrayArvore[11]).attr('span'+param.id_documento);
                    elem.find('a#anchorImgID').attr('id', 'anchorImg'+param.id_documento)
                        .find('img').attr('src', arrayArvore[15]).attr('id', 'icon'+param.id_documento);

                $(containerUpload).data('index', indexUpload+1 );
                if (arvoreDropzone.getQueuedFiles().length == 0) {
                    dropzoneAlertBoxInfo();
                    setTimeout(function(){ window.location.reload(); }, 500);
                }
            });
            return false;
        }
    });
}
function dropzoneAlertBoxInfo() {
    var accepted = arvoreDropzone.getAcceptedFiles();
    var rejected = arvoreDropzone.getRejectedFiles();
    var html = '';
    var htmlRejected =  (rejected.length > 0)
                            ?   '<div style="margin: 10px 0;"><i class="fas fa-exclamation-triangle vermelhoColor" style="margin-right: 5px;"></i>'+
                                rejected.length+' '+(rejected.length == 1 ? 'arquivo rejeitado' : 'arquivos rejeitados')+' pelo SEI:'+
                                $.map(arvoreDropzone.getRejectedFiles(), function(value){ return '<div style="font-size: 9pt; background: #eaeaea; border-radius: 5px; padding: 5px; margin: 8px 5px;"><i class="fas fa-file cinzaColor" style="margin-right: 5px;"></i>'+value.name+'<span style="background: #fff0f0;display: block;margin-top: 5px;padding: 3px 5px;border-radius: 5px;color: #f54040;">'+($(value.previewElement.children).find('.dz-error-message span').text())+'</span></div>' }).join('')+
                                '</div>'
                                : '';
    var htmlNotify =    '<div>'+
                        '   <span id="no_notify" class="no_notifyPro" data-notify="upload" style="font-size: 8pt; margin: 10px 0; display: block;">'+
                        '       <input onchange="noNotifyPro(this)" type="checkbox" id="no_notifyPro_input">'+
                        '       <label style="color: #404040;" id="no_notifyPro_label" for="no_notifyPro_input">'+
                        '           Ok, n\u00E3o avisar novamente.'+
                        '       </label>'+
                        '   </span>'+
                        '</div>';

    if (accepted.length > 0) {
        html = accepted.length+' '+(accepted.length == 1 ? 'arquivo enviado' : 'arquivos enviados')+' com sucesso!';
        html = (rejected.length > 0) ? html+htmlRejected: html+htmlNotify;
        if (!getOptionsPro('noNotify_upload') || rejected.length > 0) {
            parent.alertaBoxPro('Sucess', 'check-circle', html);
        }
    } else {
        parent.alertaBoxPro('Error', 'exclamation-triangle', html);
    }
}
function dropzoneDivInfoHover() {
var html =  '<div id="dz-infoupload" class="dz-infoupload">'+
            '   <span class="text">Arraste e solte aquivos aqui<br>ou clique para selecionar</span>'+
            '   <span class="cancel" onclick="dropzoneCancelInfo(event); return false;">'+
            '       <i class="far fa-times-circle icon"></i>'+
            '       <span class="label">CANCELAR</span>'+
            '   </span>'+
            '</div>';
    if ($(containerUpload).find('.dz-infoupload').length == 0) {
        $(containerUpload).prepend(html).data('index', 0);
    }
}
function dropzoneCancelInfo(e) {
    if (typeof e !== 'undefined'){
        e.stopImmediatePropagation();
    }
    $(containerUpload).removeClass('dz-drag-hover');
    return false;
}
function dropzoneNormalizeImg(file) {
    var urlIcon = '/infra_css/imagens/pdf.gif';
        urlIcon = (file.type.indexOf('image/') !== -1) ? '/infra_css/imagens/imagem.gif' : urlIcon;
        urlIcon = (file.type.indexOf('video/') !== -1) ? '/infra_css/imagens/video.gif' : urlIcon;
        urlIcon = (file.type.indexOf('audio/') !== -1) ? '/infra_css/imagens/audio.gif' : urlIcon;
        urlIcon = (file.type.indexOf('application/zip') !== -1) ? '/infra_css/imagens/zip.gif' : urlIcon;
        urlIcon = (file.type.indexOf('text/htm') !== -1) ? '/infra_css/imagens/html.gif' : urlIcon;
        urlIcon = (file.type.indexOf('text/plain') !== -1) ? '/infra_css/imagens/txt.gif' : urlIcon;
        urlIcon = (file.type.indexOf('word') !== -1) ? '/infra_css/imagens/doc.gif' : urlIcon;
        urlIcon = (file.type.indexOf('officedocument.presentation') !== -1) ? '/infra_css/imagens/pps.gif' : urlIcon;
        urlIcon = (file.type.indexOf('text/csv') !== -1) ? '/infra_css/imagens/xls.gif' : urlIcon;
        urlIcon = (file.type.indexOf('sheet') !== -1) ? '/infra_css/imagens/xls.gif' : urlIcon;

    $('#divArvore').find('.dz-preview').last().find('.dz-link-icon').attr('src', urlIcon);
    $('#divArvore').find('img[src*="joinbottom.gif"]').last().attr('src', '/infra_js/arvore/join.gif');
    $('#divArvore').find('img[src*="join.gif"]').last().attr('src', '/infra_js/arvore/joinbottom.gif');
}
function openModalDropzone() {
    $(containerUpload).addClass('dz-drag-hover');
}
function initUploadArvore(TimeOut = 9000) {
    if (TimeOut <= 0) { return; }
    if (typeof Dropzone !== 'undefined' && typeof Dropzone === "function" && $("div#divArvore").length > 0) {
        if (typeof arvoreDropzone !== 'object') {
            loadUploadArvore();
        }
    } else {
        setTimeout(function(){ 
            initUploadArvore(TimeOut - 100); 
            console.log('Reload initUploadArvore', TimeOut); 
        }, 500);
    }
}
function initDadosProcessoArvore(TimeOut = 9000) {
    if (TimeOut <= 0 || parent.window.name != '') { return; }
    if (typeof jmespath !== 'undefined' && typeof parent.dadosProcessoPro !== 'undefined' && typeof parent.dadosProcessoPro.propProcesso !== 'undefined' && typeof getOptionsPro !== 'undefined') {
        setDadosProcessoArvore();
    } else {
        setTimeout(function(){ 
            initDadosProcessoArvore(TimeOut - 100); 
            console.log('Reload initDadosProcessoArvore', TimeOut); 
        }, 500);
    }
}
function sticknoteUpdate(this_, value, type, priority = false, mode = 'insert') {
    var _this = $(this_);
    var _parent = _this.closest('.stickDadosArvore');
    var textarea = _parent.find('.stickNotePro');
    var url = jmespath.search(arrayLinksArvore, "[?name=='Anota\u00E7\u00F5es'] | [0].url");
    if (typeof url !== 'undefined' && url != '') {
        if ( $('#frmCheckerProcessoPro').length == 0 ) { getCheckerProcessoPro(); }

        if (textarea.text().trim().length >= 500) {
            var line = formatDadosAnotacao(textarea[0].outerHTML, 'line').substring(0,499);
            var par = formatDadosAnotacao(line, 'paragraph');
                textarea.html(par);
                value = line;
        }

        $('#frmCheckerProcessoPro').attr('src', url).unbind().on('load', function(){
            var iframe = $(this).contents();
            $(this).unbind();
            if (mode == 'insert') {
                iframe.find('#txaDescricao').val(value);
            } else if (mode == 'increment') {
                value = iframe.find('#txaDescricao').val()+'\n'+value; 
                value = value.substring(0,499); 
                console.log({mode: mode, value: value});
                iframe.find('#txaDescricao').val(value);
            }
            iframe.find('#chkSinPrioridade').prop('checked', priority);
            iframe.find('button[type="submit"]').trigger('click');
            _parent.find('.editStickNote').show();
            _parent.find('.removeStickNote').show();
            _parent.find('.priorityStickNote').show();
            _parent.find('.setDateStickNote_input').hide();
            _parent.find('.setDateStickNote').show();
            _parent.find('.countLimit').text('');
            if (type == 'save') {
                _parent.find('.saveStickNote').toggleClass('fa-spinner fa-save').removeClass('fa-spin').hide();
            } else if (type == 'remove') {
                textarea.text('');
                _parent.find('.removeStickNote').toggleClass('fa-spinner fa-trash-alt').removeClass('fa-spin');
            }
            if (_parent.find('.priorityStickNote').hasClass('fa-spin')) {
                _parent.find('.priorityStickNote').removeClass('fa-spin').toggleClass('fa-spinner fa-exclamation-circle');
            }
            textarea.prop('contenteditable',false).html( formatDadosAnotacao(value, 'paragraph') );
            _parent.find('.cancelStickNote').hide();
            _parent.find('.checkStickNote').hide();
            sticknoteDates(_this);
            setStickNoteCheck();
            if (_parent.find('.editStickNote').hasClass('fa-spinner')) {
                _parent.find('.editStickNote').toggleClass('fa-edit fa-spinner').removeClass('fa-spin');
            }
            if (_parent.find('.saveStickNote').hasClass('fa-spinner')) {
                _parent.find('.saveStickNote').toggleClass('fa-save fa-spinner').removeClass('fa-spin');
            }
            if (_parent.find('.setDateStickNote').hasClass('fa-spinner')) {
                _parent.find('.setDateStickNote').toggleClass('fa-calendar-plus fa-spinner').removeClass('fa-spin');
            }
            if (_parent.find('.stickNoteDate .dateboxDisplay').length > 0) {
                _parent.find('.stickNoteDate .dateboxDisplay .userStick').text(parent.userSEI);
            } else {
                _parent.find('.stickNoteDate').html('<span class="dateboxDisplay"><i class="far fa-user" style="color: #777;padding-right: 3px;margin-left: 10px;"></i> por <span class="userStick">'+parent.userSEI+'</span></span>');
            }
        });
    }
}
function sticknoteRemove(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.stickDadosArvore');
    if (_parent.find('.stickNotePro').text().trim() != '') {
        parent.confirmaBoxPro('Tem certeza que deseja remover esta anota\u00E7\u00E3o?', function(){
            sticknoteUpdate(this_, '', 'remove');
            _parent.find('.removeStickNote').toggleClass('fa-trash-alt fa-spinner').addClass('fa-spin');
            _parent.addClass('stickEmpty').removeClass('priority');
        }, 'Remover');
    }
}
function sticknoteSave_(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.stickDadosArvore');
    // console.log('sticknoteSave_',_parent.find('.actions:hover').length);
    if (_parent.find('.actions:hover').length == 0) {
        setTimeout(function(){ 
            sticknoteSave(this_);
        }, 500);
    }
}
function sticknoteSave(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.stickDadosArvore');
    var textarea = _parent.find('.stickNotePro');
    var priority = _parent.hasClass('priority');
    var value = formatDadosAnotacao(textarea[0].outerHTML, 'line');
    var oldValue = textarea.data('oldValue');
    if (!_parent.find('.saveStickNote').hasClass('fa-spin') && (oldValue != value || textarea.data('modify') == true)) {
        sticknoteUpdate(this_, value , 'save', priority);
        _parent.find('.saveStickNote').toggleClass('fa-save fa-spinner').addClass('fa-spin');
    }
}
function sticknoteCancel(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.stickDadosArvore');
    _parent.find('.editStickNote').show();
    _parent.find('.removeStickNote').show();
    _parent.find('.priorityStickNote').show();
    _parent.find('.setDateStickNote').show();
    _parent.find('.setDateStickNote_input').hide();
    _parent.find('.saveStickNote').hide();
    _parent.find('.cancelStickNote').hide();
    _parent.find('.checkStickNote').hide();
    _parent.find('.countLimit').text('');
    var textarea = _parent.find('.stickNotePro');
        textarea.prop('contenteditable',false).html( formatDadosAnotacao(textarea.data('oldValue'), 'paragraph') );

    if (typeof textarea.data('oldValue') === 'undefined' || textarea.data('oldValue').trim() == '') {
        _parent.addClass('stickEmpty').removeClass('priority');
    }
    stickNoteDivSelected = 0;
}
function sticknoteEdit(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.stickDadosArvore');
    _parent.find('.editStickNote').hide();
    _parent.find('.removeStickNote').hide();
    // _parent.find('.priorityStickNote').hide();
    _parent.find('.setDateStickNote_input').hide();
    // _parent.find('.setDateStickNote').hide();
    _parent.find('.saveStickNote').show();
    _parent.find('.cancelStickNote').show();
    _parent.find('.checkStickNote').show();
    _parent.removeClass('stickEmpty');
    var textarea = _parent.find('.stickNotePro');
        textarea.prop('contenteditable',true).data('oldValue', formatDadosAnotacao(textarea[0].outerHTML, 'line') ).focus();
}
function sticknoteSaveDate(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.stickDadosArvore');
    var inputDate = _parent.find('.setDateStickNote_input');
    var input = inputDate.find('input');
    var textarea = _parent.find('.stickNotePro');
    var value = moment(input.val(),'YYYY-MM-DD').format('DD/MM/YYYY');
    var oldValue = moment(input.data('oldValue'),'YYYY-MM-DD').format('DD/MM/YYYY');
    var line = formatDadosAnotacao(textarea[0].outerHTML, 'line');
    var regex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/i;
    var par = '';
    if (regex.test(removeAcentos(textarea.text().trim()))) {
        line = line.replace(oldValue, value);
        par = formatDadosAnotacao(line, 'paragraph');
    } else {
        line = line+' '+value;
        par = formatDadosAnotacao(line, 'paragraph');
    }
    if (par != '' ) {
        textarea.html(par);
        sticknoteSave(this_);
        _parent.find('.setDateStickNote').toggleClass('fa-calendar-plus fa-spinner').addClass('fa-spin');
    } 
    // console.log(value, oldValue, par);
    inputDate.hide();
}

function sticknoteSetDateKey(e, this_) {
    if(e.which == 13) {
        $(this_).closest('.stickDadosArvore').find('.setDateStickNote').trigger('click');
    }
}
function sticknoteSetDate(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.stickDadosArvore');
    var textarea = _parent.find('.stickNotePro');
    var inputDate = _parent.find('.setDateStickNote_input');
    var regex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/i;
    var checkDate = regex.exec(removeAcentos(textarea.text().trim()));
    var dateStick = (checkDate !== null) ? moment(checkDate[0], 'DD/MM/YYYY').format('YYYY-MM-DD') : moment().format('YYYY-MM-DD');
    if (inputDate.is(':visible')) {
        sticknoteSaveDate(this_);
        if (_this.hasClass('fa-thumbs-up')) {
            _this.toggleClass('fa-thumbs-up fa-calendar-plus');
            _this.attr('onmouseover','return infraTooltipMostrar(\'Inserir Data\');');
        }
    } else {
        inputDate.show().find('input').val(dateStick).data('oldValue', dateStick).focus();
        if (_this.hasClass('fa-calendar-plus')) {
            _this.toggleClass('fa-thumbs-up fa-calendar-plus');
            _this.attr('onmouseover','return infraTooltipMostrar(\'Confirmar Data\');');
        }
    }
}
function getSticknoteUser() {
    var id_protocolo = getParamsUrlPro(window.location.href).id_procedimento;
    var userStick = (getOptionsPro('arraySticknoteHome') && typeof id_protocolo !== 'undefined') ? jmespath.search(getOptionsPro('arraySticknoteHome'),"[?id_protocolo=='"+id_protocolo+"'] | [0]") : null;
    userStick = (userStick !== null) ? userStick.usertip : false;
    return userStick;
}
function sticknoteDates(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.stickDadosArvore');
    var textarea = _parent.find('.stickNotePro');
    var date_stick = removeAcentos(textarea.text().trim());
    var regex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/i;
    var htmlDateStick = '';
    var userStick = getSticknoteUser();
        userStick = (userStick) ? '<i class="far fa-user" style="color: #777;padding-right: 3px;margin-left: 10px;"></i> por <span class="userStick">'+userStick+'</span>' : '';
    var checkDate = regex.exec(date_stick);
        htmlDateStick = (checkDate !== null) ? parent.getDatesPreview({date: moment(checkDate[0], 'DD/MM/YYYY').format('YYYY-MM-DD HH:mm:ss')}) : '';
        htmlDateStick = (htmlDateStick != '') ? $(htmlDateStick).html() : htmlDateStick;
    var htmlStick = (htmlDateStick || userStick) ? '<span class="dateboxDisplay" style="'+(checkDate !== null && moment(checkDate[0], 'DD/MM/YYYY') < moment() ? 'background: #fac3c4 !important;' : '')+'" >'+htmlDateStick+userStick+'</span>' : '';
    _parent.find('.stickNoteDate').html(htmlStick);
}
function sticknotePriority(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.stickDadosArvore');
    var _stick = $('.stickNotePro');
    _parent.toggleClass('priority');
    if (typeof _stick.attr('contenteditable') === 'undefined' || _stick.attr('contenteditable') == 'false') {
        _parent.find('.priorityStickNote').addClass('fa-spin').toggleClass('fa-exclamation-circle fa-spinner');
        sticknoteSave(this_);
    } else {
        _stick.data('modify',true); 
        setTimeout(function() {
            _stick.trigger('click').focus();
        }, 0);
    }
}
function removeFormatting(this_) {
    var _this = $(this_);
    setTimeout(function(){ 
        var line = formatDadosAnotacao(_this[0].outerHTML, 'line');
            line = (line.trim() == '') ? _this.text().trim() : line;
        var paragraph = formatDadosAnotacao(line, 'paragraph');
        _this.html( paragraph );
        // console.log('pasting', line, paragraph);
    }, 100);
}
function checkLimitTextArvore(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.stickDadosArvore');
    var maxlength = _this.attr('maxlength');
    var currentLength = (_this.is('textarea')) ? _this.val().length : _this.text().trim().length;
    var textCount = (currentLength >= maxlength) ? 'Voc\u00EA atingiu o n\u00FAmero m\u00E1ximo de caracteres.' : (maxlength - currentLength)+' caracteres restantes';
    _parent.find('.countLimit').html(textCount);
    sticknotePosition();
}
function formatDadosAnotacao(value, type, paste = false) {
    var result = '';
    if (type == 'line') {
        var elem = $('<div/>').html(value).contents();
        var fistLine = elem.clone().children().remove().end().text();
        var othesLines = (paste) ? elem.find('div, p, br') : elem.find('div, p');
            othesLines = othesLines.map(function(v, i){ 
                if ($(this).text().trim() != '') { 
                    var check = ($(this).hasClass('stickNoteCheck')) ? '[ ] ' : '';
                        check = ($(this).hasClass('stickNoteChecked')) ? '[X] ' : check;
                    return check+$(this).text()+'\n';
                } else if (i != 0 ) { 
                    return '\n';
                } 
            }).get().join('');
        // var othesLines = elem.find('div, p, br').map(function(v){ if ($(this).text().trim() != '') { return $(this).text()+'\n' } }).get().join('');
        result = (othesLines != '') ? fistLine+'\n'+othesLines : fistLine;
    } else if ('paragraph') {
        if (value.indexOf('\n') !== -1) {
            $.each(value.trim().split('\n'), function(i, v){
                if (v != '') {
                    var check = (v.indexOf('[ ]') !== -1) ? ' class="stickNoteCheck"' : '';
                        check = (v.indexOf('[X]') !== -1) ? ' class="stickNoteCheck stickNoteChecked"' : check;
                    var text = (v.indexOf('[ ]') !== -1) ? v.replace('[ ]','').trim() : v;
                        text = (v.indexOf('[X]') !== -1) ? v.replace('[X]','').trim() : text;
                    result += '<div'+check+'>'+text+'</div>';
                } else if (i != 0 || i != value.length-1) {
                    result += '<div><br></div>';
                }
            });
        } else {
            result = '<div>'+value+'</div>';
        }
    }
    // console.log(result);
    return result;
}
function setDadosAnotacao(anotacaoTxt, checkPrioridade) {
    var anotacaoClass = (anotacaoTxt == '') ? 'stickEmpty' : '';
    var priorityClass = (checkPrioridade) ? 'priority' : '';
        anotacaoTxt = (anotacaoTxt == '') ? '<div></div>' : formatDadosAnotacao(anotacaoTxt, 'paragraph');
    var htmlAnotacao =  '<div class="stickDadosArvore '+anotacaoClass+' '+priorityClass+'" style="position: relative; ">'+
                        '   <label class="newLink" style="margin-bottom: 10px; display: block;"><i class="fas fa-sticky-note azulColor iconDadosProcesso"></i>Anota\u00E7\u00F5es:</label>'+
                        '   <div class="stickNoteDate"></div>'+
                        '   <div class="stickNotePro" maxlength="500" onclick="sticknotePosition();" onpaste="removeFormatting(this)" oninput="checkLimitTextArvore(this)" onblur="sticknoteSave_(this)" contenteditable="false">'+anotacaoTxt+'</div>'+
                        '   <div class="actionsNew">'+
                        '       <a class="newLink" style="font-size: 10pt;cursor: pointer;" onclick="sticknoteEdit(this)">'+
                        '           <i class="fas fa-sticky-note laranjaColor newStickNote" style="cursor: pointer; display: inline-block;"></i>'+
                        '           Adicionar Anota\u00E7\u00E3o'+
                        '       </a>'+
                        '   </div>'+
                        '   <div class="actions">'+
                        '       <i class="fas fa-edit azulColor editStickNote" style="cursor: pointer;" onclick="sticknoteEdit(this)" onmouseover="return infraTooltipMostrar(\'Editar Anota\u00E7\u00E3o\');" onmouseout="return infraTooltipOcultar();"></i>'+
                        '       <i class="fas fa-save azulColor saveStickNote" style="cursor: pointer; display:none" onclick="sticknoteSave(this)" onmouseover="return infraTooltipMostrar(\'Salvar Anota\u00E7\u00E3o\');" onmouseout="return infraTooltipOcultar();"></i>'+
                        '       <span class="countLimit" style="font-size: 8pt; color: #666;"></span>'+
                        '       <i class="fas fa-trash-alt removeStickNote" style="margin-top: 2px; cursor: pointer;float: right;font-size: 90%;color: #929292;" onclick="sticknoteRemove(this)" onmouseover="return infraTooltipMostrar(\'Remover Anota\u00E7\u00E3o\');" onmouseout="return infraTooltipOcultar();"></i>'+
                        '       <i class="fas fa-times-circle cancelStickNote" style="cursor: pointer;float: right;font-size: 90%; display:none;color: #929292;" onclick="sticknoteCancel(this)" onmouseover="return infraTooltipMostrar(\'Cancelar Edi\u00E7\u00E3o\');" onmouseout="return infraTooltipOcultar();"></i>'+
                        '       <i class="fas fa-calendar-plus azulColor setDateStickNote" style="cursor: pointer;float: right;margin-right: 10px;" onclick="sticknoteSetDate(this)" onmouseover="return infraTooltipMostrar(\'Inserir Data\');" onmouseout="return infraTooltipOcultar();"></i>'+
                        '       <span class="setDateStickNote_input" style="display:none"><input onkeypress="sticknoteSetDateKey(event, this)" type="date"></span>'+
                        '       <span style="cursor: pointer;float: right;margin: -2px 10px 0 0; display:none;" class="checkStickNote" onclick="sticknoteCheck(this)"><i class="fas fa-check-square azulColor" style="font-size: 90%;"></i> <span style="color: #4285f4; font-size: 80%;">Checklist</span></span>'+
                        '       <i class="fas fa-exclamation-circle priorityStickNote" style="cursor: pointer;float: right;margin-right: 10px;" onclick="sticknotePriority(this)" onmouseover="return infraTooltipMostrar(\'Prioridade\');" onmouseout="return infraTooltipOcultar();"></i>'+
                        '   </div>'+
                        '</div>';
    $('.stickDadosArvore').remove();
    $('#divConsultarAndamento').after(htmlAnotacao);
    sticknoteDates($('.stickNotePro')[0]);
    setStickNoteCheck();
}
function sticknotePosition() {
    if (window.getSelection().type == 'Range') {
        var base = $(window.getSelection().baseNode).closest('div').index();
        var extend = $(window.getSelection().extentNode).closest('div').index();
        stickNoteDivSelected = {start: (base < extend ? base : extend), end: (base > extend ? base : extend)};
    } else {
        stickNoteDivSelected = $(window.getSelection().anchorNode).closest('div').index();
        stickNoteDivSelected = (stickNoteDivSelected > $('.stickNotePro div').length-1) ? 0 : stickNoteDivSelected;
    }
    console.log(stickNoteDivSelected);
}
function sticknoteCheck(this_) {
    console.log(stickNoteDivSelected);
    if (typeof stickNoteDivSelected == 'object') {
        $('.stickNotePro div').each(function(index){
            if (index >= stickNoteDivSelected.start && index <= stickNoteDivSelected.end) {
                sticknoteToggleCheck(index);
            }
        });
    } else {
        sticknoteToggleCheck(stickNoteDivSelected);
    }
}
function sticknoteToggleCheck(id) {
    var selected = $('.stickNotePro div').eq(id);
    if (selected.hasClass('stickNoteCheck')) {
        selected.removeClass('stickNoteCheck').removeClass('stickNoteChecked');
    } else {
        selected.addClass('stickNoteCheck');
        console.log('sticknoteToggleCheck', id, selected.text().trim());
        if (selected.text().trim() == '') {
            selected.text(' ')
            setTimeout(function() {
                $('.stickNotePro').trigger('click').focus();
            }, 0);
        }
    }
}
function setStickNoteCheck() {
    $('.stickNotePro div').unbind().on("click", function () {
        var _this = $(this);
        var _parent = $('.stickNotePro');
        if (_this.hasClass('stickNoteCheck') && (typeof _parent.attr('contenteditable') === 'undefined' || _parent.attr('contenteditable') == 'false')) {
            if (_this.hasClass('stickNoteChecked')) {
                _this.removeClass('stickNoteChecked');
            } else {
                _this.addClass('stickNoteChecked');
            }
            _parent.closest('.stickDadosArvore').find('.editStickNote').addClass('fa-spin').toggleClass('fa-edit fa-spinner');
            sticknoteSave(_this[0]);
        } else if (_parent.attr('contenteditable') == 'true') {
            sticknotePosition();
        }
    });
}
function getDadosAnotacao() {
    var urlAnotacao = jmespath.search(arrayLinksPage,"[?name=='Anota\u00E7\u00F5es'] | [0].url");
    if (urlAnotacao) {
        $.ajax({ url: urlAnotacao }).done(function (html) {
            var $htmlAnotacao = $(html);
            var anotacaoTxt = $htmlAnotacao.find('#txaDescricao').val().trim();
            var checkPrioridade = $htmlAnotacao.find('#chkSinPrioridade').is(':checked');
            setDadosAnotacao(anotacaoTxt, checkPrioridade);
        });
    }
}
function togglePanelDadosArvore(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.panelDadosArvore');
    _this.toggleClass('fa-chevron-down fa-chevron-right');
    _parent.find('.infoDadosArvore').slideToggle('fast', function() {
        var type = _parent.data('type');
        var state = (_parent.find('.infoDadosArvore').is(':visible')) ? 'visible' : 'hide';
        setOptionsPro('panelDadosArvorePro_'+type, state);
      });
}
function getDadosInteressadosArvore(this_) {
    var _this = $(this_);
    var data = _this.data();
    if ( $('#frmCheckerProcessoPro').length == 0 ) { getCheckerProcessoPro(); }
    var hrefConsulta = $('#main-menu a[href*="protocolo_pesquisar"]', parent.document.body).attr('href');
    if (hrefConsulta) {
        _this.find('i.iconInteressadosProcesso').toggleClass('fa-folder-open fa-spinner').addClass('fa-spin');
        $('#frmCheckerProcessoPro').attr('src', hrefConsulta).unbind().on('load', function(){
            var iframe = $(this).contents();
                iframe.find('#hdnIdContato').val(data.interessado);
                iframe.find('#optProcessos').prop('checked',true);
                if (data.mesmaNatureza) {
                    iframe.find('#selTipoProcedimentoPesquisa').val(data.tipoProcedimento);
                }
                iframe.find('#chkSinTramitacao').prop('checked', data.tramiteUnidade);
                console.log({interessado: data.interessado, natureza: data.mesmaNatureza, tipo: data.tipoProcedimento, tramite: data.tramiteUnidade});
                $(this).unbind().on('load', function(){
                    $(this).unbind();
                    _this.find('i.iconInteressadosProcesso').toggleClass('fa-folder-open fa-spinner').removeClass('fa-spin');
                    var iframeResult = $(this).contents();
                    var conteudo = iframeResult.find('#conteudo');
                    var count = conteudo.find('.barra').text().trim();
                    var result = [];
                        conteudo.find('table.resultado').each(function(){
                            var _this = $(this);
                            var unidadeElem = _this.find('.metatag table td').eq(0).find('a');
                            var usuarioElem = _this.find('.metatag table td').eq(1).find('a');
                            var param = {
                                title: _this.find('.resTituloEsquerda').text(),
                                url_proc: _this.find('.resTituloEsquerda a').eq(0).attr('href'),
                                unidade: {sigla: unidadeElem.text(), nome: unidadeElem.attr('title')},
                                usuario: {login: usuarioElem.text(), nome: usuarioElem.attr('title')},
                                data: _this.find('.metatag table td').eq(2).text()
                            };
                            result.push(param);
                        });
                        var htmlResult =    '<div class="options_interessado">'+
                                            '   <a class="newLink" data-type="tramiteUnidade" onclick="optionSearchInteressado(this)">'+
                                            '       <i class="'+(data.tramiteUnidade ? 'fas fa-check-square' : 'far fa-square')+' cinzaColor"></i>'+
                                            '       Tramitado na Unidade'+
                                            '   </a>'+
                                            '   <a class="newLink" data-type="mesmaNatureza" onclick="optionSearchInteressado(this)">'+
                                            '       <i class="far '+(data.mesmaNatureza ? 'fas fa-check-square' : 'far fa-square')+' cinzaColor"></i>'+
                                            '       De mesma natureza'+
                                            '       </a>'+
                                            '</div>'+
                                            (count == '' ? '<div class="notfound_interessado"><i class="fas fa-exclamation-circle vermelhoColor"></i> Nenhum resultado encontrado</div>' : '<div class="count_interessado">'+count+'</div>');
                        $.each(result, function(index, value){
                            htmlResult +=   '<div class="proc_interessado">'+
                                            '   <a class="newLink" href="'+value.url_proc+'" target="_blank">'+
                                            '       <i class="fas fa-folder-open cinzaColor"></i>'+
                                            '       '+value.title+
                                            '   <i class="fas fa-external-link-alt" style="font-size: 90%; text-decoration: underline;"></i>'+
                                            '   </a>'+
                                            '   <div style="margin-bottom: 8px;">'+
                                            '       <span style="color:#666666;">'+
                                            '           <i class="fas fa-briefcase cinzaColor"></i>'+
                                            '           '+value.unidade.nome+' ('+value.unidade.sigla+')'+
                                            '       </span>'+
                                            '   </div>'+
                                            '   <div>'+
                                            '       <span style="color:#666666;">'+
                                            '           <i class="fas fa-user cinzaColor"></i>'+
                                            '           '+value.usuario.nome+' ('+value.usuario.login+')'+
                                            '       </span>'+
                                            '       <span style="color:#666666; float: right;">'+
                                            '           <i class="fas fa-calendar cinzaColor"></i>'+
                                            '           '+value.data+
                                            '       </span>'+
                                            '   </div>'+
                                            '</div>';
                        })
                        _this.closest('.dadosInteressados').find('.dadosInteressados_result').html(htmlResult).show();
                        console.log(count, result);
                });
                iframe.find('#sbmPesquisar').trigger('click');
        });
    }
}
function optionSearchInteressado(this_) {
    var _this = $(this_);
    var data = _this.data();
    var _parent = _this.closest('.dadosInteressados');
    var checkbox = _this.find('i').hasClass('fa-check-square') ? false : true;
    console.log('checkbox',checkbox);
    if (data.type == 'tramiteUnidade') {
        _parent.find('a.interessadosProcesso').data('tramite-unidade',checkbox).trigger('click');
        setOptionsPro('panelDadosArvoreInteressados_tramiteUnidade', checkbox);
    } else if (data.type == 'mesmaNatureza') {
        _parent.find('a.interessadosProcesso').data('mesma-natureza',checkbox).trigger('click');
        setOptionsPro('panelDadosArvoreInteressados_mesmaNatureza', checkbox);
    }
    _this.find('i').toggleClass('fa-check-square fa-square');
}
function setDadosProcessoArvore() {
    var prop = parent.dadosProcessoPro.propProcesso;

    var htmlDescricao =  '<div class="panelDadosArvorePro panelDadosArvore" data-type="descricao">'+
                                '   <label class="newLink" style="margin-bottom: 10px; display: block;">'+
                                '      <i class="fas fa-comment-dots azulColor iconDadosProcesso"></i>'+
                                '      Especifica\u00E7\u00E3o:'+
                                '      <i class="fas fa-chevron-'+(getOptionsPro('panelDadosArvorePro_descricao') == 'hide' ? 'right' : 'down')+' azulColor" style="float: right; cursor:pointer; margin-right: 20px;" onclick="togglePanelDadosArvore(this)"></i>'+
                                '   </label>'+
                                '   <div class="infoDadosArvore" style="'+(getOptionsPro('panelDadosArvorePro_descricao') == 'hide' ? 'display:none' : '')+'">'+
                                '       <a class="newLink" style="cursor:pointer" onclick="parent.copyTextThis(this)" onmouseover="return infraTooltipMostrar(\'Clique para copiar\');" onmouseout="return infraTooltipOcultar();">'+prop.txtDescricao+'</a>'+
                                '   </div>'+
                                '</div>';

    var htmlTipoProcedimento =  '<div class="panelDadosArvorePro panelDadosArvore" data-type="tipo_procedimento">'+
                                '   <label class="newLink" style="margin-bottom: 10px; display: block;">'+
                                '      <i class="fas fa-inbox azulColor iconDadosProcesso"></i>'+
                                '      Tipo de Procedimento:'+
                                '      <i class="fas fa-chevron-'+(getOptionsPro('panelDadosArvorePro_tipo_procedimento') == 'hide' ? 'right' : 'down')+' azulColor" style="float: right; cursor:pointer; margin-right: 20px;" onclick="togglePanelDadosArvore(this)"></i>'+
                                '   </label>'+
                                '   <div class="infoDadosArvore" style="'+(getOptionsPro('panelDadosArvorePro_tipo_procedimento') == 'hide' ? 'display:none' : '')+'">'+
                                '       <a class="newLink" style="cursor:pointer" onclick="parent.copyTextThis(this)" onmouseover="return infraTooltipMostrar(\'Clique para copiar\');" onmouseout="return infraTooltipOcultar();">'+prop.hdnNomeTipoProcedimento+'</a>'+
                                '   </div>'+
                                '</div>';
        htmlTipoProcedimento = ($.inArray("Tipo de Procedimento",jmespath.search(selectedItensPanelArvore,"[]")) !== -1) ? htmlTipoProcedimento : '';
    
    var hipoteseLegal = (prop.rdoNivelAcesso == '1') ? jmespath.search(prop.selHipoteseLegal_select, "[?id=='"+prop.selHipoteseLegal+"'] | [0].name") : null;
        hipoteseLegal = (hipoteseLegal == null) ? '' :  hipoteseLegal;
    var dataNivelAcesso = (prop.rdoNivelAcesso == '0') ? {name: 'P\u00FAblico', icon: 'fas fa-globe-americas'} : false;
        dataNivelAcesso = (prop.rdoNivelAcesso == '1') ? {name: 'Restrito: '+hipoteseLegal, icon: 'fas fa-lock'} : dataNivelAcesso;
        dataNivelAcesso = (prop.rdoNivelAcesso == '2') ? {name: 'Sigiloso', icon: 'fas fa-user-slash'} : dataNivelAcesso;
        
    var htmlNivelAcesso =   '<div class="panelDadosArvorePro panelDadosArvore" data-type="nivel_acesso">'+
                            '   <label class="newLink" style="margin-bottom: 10px; display: block;">'+
                            '      <i class="'+dataNivelAcesso.icon+' azulColor iconDadosProcesso"></i>'+
                            '      N\u00EDvel de Acesso:'+
                            '      <i class="fas fa-chevron-'+(getOptionsPro('panelDadosArvorePro_nivel_acesso') == 'hide' ? 'right' : 'down')+' azulColor" style="float: right; cursor:pointer; margin-right: 20px;" onclick="togglePanelDadosArvore(this)"></i>'+
                            '   </label>'+
                            '   <div class="infoDadosArvore" style="'+(getOptionsPro('panelDadosArvorePro_nivel_acesso') == 'hide' ? 'display:none' : '')+'">'+
                            '      <a class="newLink" style="cursor:pointer" onclick="parent.copyTextThis(this)" onmouseover="return infraTooltipMostrar(\'Clique para copiar\');" onmouseout="return infraTooltipOcultar();">'+dataNivelAcesso.name+'</a>'+
                            '   </div>'+
                            '</div>';
        htmlNivelAcesso = ($.inArray("N\u00EDvel de Acesso",jmespath.search(selectedItensPanelArvore,"[]")) !== -1) ? htmlNivelAcesso : '';
    
    var htmlInteressados =      '<div class="panelDadosArvorePro panelDadosArvore" data-type="interessados">'+
                                '   <label class="newLink" style="margin-bottom: 10px; display: block;">'+
                                '      <i class="fas fa-users azulColor iconDadosProcesso"></i>'+
                                '      Interessados:'+
                                '      <i class="fas fa-chevron-'+(getOptionsPro('panelDadosArvorePro_interessados') == 'hide' ? 'right' : 'down')+' azulColor" style="float: right; cursor:pointer; margin-right: 20px;" onclick="togglePanelDadosArvore(this)"></i>'+
                                '   </label>'+
                                '   <div class="infoDadosArvore" style="'+(getOptionsPro('panelDadosArvorePro_interessados') == 'hide' ? 'display:none' : '')+'">'+
                                        $.map(prop.selInteressadosProcedimento_list, function(v, i){ 
                                            var return_ = ((prop.selInteressadosProcedimento_list.length-1) != i && prop.selInteressadosProcedimento_list.length > 1) ? '<div style="border-bottom: 1px solid #ececec;" class="dadosInteressados">' : '<div class="dadosInteressados">';
                                            if (v.name.indexOf('(') !== -1) {
                                                return_ += $.map(v.name.split('('), function(int){
                                                                return '<a class="newLink" style="cursor:pointer" onclick="parent.copyTextThis(this)" onmouseover="return infraTooltipMostrar(\'Clique para copiar\');" onmouseout="return infraTooltipOcultar();">'+int.trim().replace(')','')+'</a>';
                                                            }).join('');
                                            } else {
                                                return_ += '<a class="newLink" style="cursor:pointer" onclick="parent.copyTextThis(this)" onmouseover="return infraTooltipMostrar(\'Clique para copiar\');" onmouseout="return infraTooltipOcultar();">'+v.name+'</a>';
                                            }
                                                return_ +=  '<a class="newLink interessadosProcesso" style="cursor:pointer;float: right;" data-interessado="'+v.value+'" data-tramite-unidade="'+(getOptionsPro('panelDadosArvoreInteressados_tramiteUnidade') ? 'true' : 'false' )+'" data-tipo-procedimento="'+prop.hdnIdTipoProcedimento+'" data-mesma-natureza="'+(getOptionsPro('panelDadosArvoreInteressados_mesmaNatureza') ? 'true' : 'false' )+'" onclick="getDadosInteressadosArvore(this)" onmouseover="return infraTooltipMostrar(\'Pesquisar processos relacionados\');" onmouseout="return infraTooltipOcultar();">'+
                                                            '   <i class="fas fa-folder-open azulColor iconInteressadosProcesso"></i><i class="fas fa-search azulColor" style="margin-left: -10px;"></i>'+
                                                            '</a>';
                                                return_ +=  '<div class="dadosInteressados_result" style="display:none;"></div>'+
                                                            '</div>';
                                            return return_;
                                        }).join('')+
                                '   </div>'+
                                '   </div>';
        htmlInteressados = ($.inArray("Interessados",jmespath.search(selectedItensPanelArvore,"[]")) !== -1) ? htmlInteressados : '';
    
    var htmlAssuntos =  '<div class="panelDadosArvorePro panelDadosArvore" data-type="assuntos">'+
                        '   <label class="newLink" style="margin-bottom: 10px; display: block;">'+
                        '      <i class="fas fa-bookmark azulColor iconDadosProcesso"></i>'+
                        '      Assuntos:'+
                        '      <i class="fas fa-chevron-'+(getOptionsPro('panelDadosArvorePro_assuntos') == 'hide' ? 'right' : 'down')+' azulColor" style="float: right; cursor:pointer; margin-right: 20px;" onclick="togglePanelDadosArvore(this)"></i>'+
                        '   </label>'+
                        '   <div class="infoDadosArvore" style="'+(getOptionsPro('panelDadosArvorePro_assuntos') == 'hide' ? 'display:none' : '')+'">'+
                               $.map(prop.selAssuntos_select, function(v){ return '<div><a class="newLink" style="cursor:pointer" onclick="parent.copyTextThis(this)" onmouseover="return infraTooltipMostrar(\'Clique para copiar\');" onmouseout="return infraTooltipOcultar();">'+v+'</a></div>' }).join('')+
                        '   </div>'+
                        '</div>';
        htmlAssuntos = ($.inArray("Assuntos",jmespath.search(selectedItensPanelArvore,"[]")) !== -1) ? htmlAssuntos : '';
    
    var htmlObservacoes =   '<div class="panelDadosArvorePro panelDadosArvore" data-type="observacoes">'+
                            '   <label class="newLink" style="margin-bottom: 10px; display: block;">'+
                            '      <i class="fas fa-comment-alt azulColor iconDadosProcesso"></i>'+
                            '      Observa\u00E7\u00F5es:'+
                            '      <i class="fas fa-chevron-'+(getOptionsPro('panelDadosArvorePro_observacoes') == 'hide' ? 'right' : 'down')+' azulColor" style="float: right; cursor:pointer; margin-right: 20px;" onclick="togglePanelDadosArvore(this)"></i>'+
                            '   </label>'+
                            '   <div class="infoDadosArvore" style="'+(getOptionsPro('panelDadosArvorePro_observacoes') == 'hide' ? 'display:none' : '')+'">'+
                                    $.map(prop.txaObservacoes, function(v){ return '<div><a class="newLink" style="cursor:pointer" onclick="parent.copyTextThis(this)" onmouseover="return infraTooltipMostrar(\'Clique para copiar\');" onmouseout="return infraTooltipOcultar();">'+v.unidade+': '+v.observacao+'</a></div>' }).join('')+
                            '   </div>'+
                            '</div>';
        htmlObservacoes = ($.inArray("Observa\u00E7\u00F5es",jmespath.search(selectedItensPanelArvore,"[]")) !== -1) ? htmlObservacoes : '';

    $('.panelDadosArvorePro').remove();
    $('#frmArvore').append(htmlDescricao+htmlTipoProcedimento+htmlNivelAcesso+htmlInteressados+htmlAssuntos+htmlObservacoes);  
    parent.forceOnLoadBodyPage();  
}
function initAtividadesProcesso(TimeOut = 9000) {
    if (TimeOut <= 0 || parent.window.name != '') { return; }
    if (
        typeof parent.arrayConfigAtividades !== 'undefined' && 
        typeof parent.arrayConfigAtividades.perfil !== 'undefined'
    ) {
        if (parent.checkConfigValue('gerenciaratividades')) { 
            setAtividadesProcesso();
        }
    } else {
        setTimeout(function(){ 
            if (TimeOut == 9000) { parent.getAtividades(); }
            initAtividadesProcesso(TimeOut - 100); 
        }, 500);
    }
}
function setAtividadesProcesso() {
    var htmlAtividades = getAtividadesProcessoArvore();
    $('.panelDadosArvore_atividades').after(htmlAtividades).remove();

    if (htmlAtividades != '') {
        $('.kanban-item .checklist_progress').each(function(){
            $(this).progressbar({
                value: $(this).data('valuenow'),
                max: $(this).data('max')
            });
        });
    }
}
function filterTagKanbanArvore(this_) {
    var _this = $(this_);
    var _parent = _this.closest('.panelDadosArvore_atividades');
    var head = _parent.find('.panelArvoreHead');
    var data = _this.data();
    var tagName = (typeof data.tagname !== 'undefined' && data.tagname !== null && data.tagname !== '') ? data.tagname : false;
    var htmlFilter = '';
        _parent.find('#filterTagKanban').remove();
    if (tagName) {
        _parent.find('.kanban-item').hide();
        var itemFilter = _parent.find('.kanban-item.tagKanName_'+tagName);
        var nameTag = (typeof data.nametag !== 'undefined') ? data.nametag : _this.text().trim();
        var iconTag = (typeof data.icontag !== 'undefined') ? 'fas fa-'+data.icontag : _this.find('i').attr('class');
            itemFilter.show();
            htmlFilter =    '<span id="filterTagKanban" class="tituloFilter" style="padding: 0 10px 20px; font-size: 9pt; text-align: center;">'+
                            '   Filtro: '+
                            '   <span class="tag" style="background-color: '+data.colortag+'">'+
                            '       <span class="tag-text" style="color: '+data.textcolor+'; margin-right: 5px;">'+
                            '           <i class="tagicon tagicon '+iconTag+'" style="font-size: 120%; margin: 0 2px; color: '+data.textcolor+'"></i>'+
                            '           '+nameTag+
                            '           </span>'+
                            '       <button onclick="filterTagKanbanArvore(this); return false;" class="tag-remove"></button>'+
                            '   </span>'+
                            '</span>';
            head.append(htmlFilter);
    } else {
        _parent.find('.kanban-item').show();
    }
}
function getAtividadesProcessoArvore() {
    var htmlAtividades = '';
    var htmlInfoAtividades = '';
    if (parent.arrayAtividadesProcPro.length > 0) {
        $.each(parent.arrayAtividadesProcPro,function(index, value){
            var htmlActionsAtividade = parent.actionsAtividade(value.id_demanda, 'icon');
            var kanbanItem = parent.getKanbanItem(value);
            
                htmlInfoAtividades +=   '<div class="kanban-item '+kanbanItem.class.join(' ')+'" data-eid="_id_'+value.id_demanda+'">'+
                                        '   '+kanbanItem.title+
                                        (htmlActionsAtividade.action == 'info' ? '' :
                                        '   <span class="info_dates_fav" style="display: block;padding: 0;margin: 10px 0 0 0;">'+
                                        '       <a class="newLink" onclick="parent.actionsAtividade('+value.id_demanda+')">'+
                                        '           <i style="margin-right: 3px;" class="'+htmlActionsAtividade.icon+' azulColor"></i>'+
                                        '           '+htmlActionsAtividade.name+
                                        '       </a>'+
                                        '   </span>'+
                                        '')+
                                        '</div>';
        });
    
        htmlAtividades =    '<div class="panelDadosArvore panelDadosArvore_atividades" data-type="atividades">'+
                            '   <label class="newLink panelArvoreHead" style="margin-bottom: 10px; display: block;">'+
                            '      <i class="fas fa-check-circle azulColor iconDadosProcesso"></i>'+
                            '      Atividades:'+
                            '       <span class="atividadesProActionsArvore">'+
                            '       </span>'+
                            '      <i class="fas fa-chevron-'+(getOptionsPro('panelDadosArvorePro_atividades') == 'hide' ? 'right' : 'down')+' azulColor" style="float: right; cursor:pointer; margin-right: 20px;" onclick="togglePanelDadosArvore(this)"></i>'+
                            '   </label>'+
                            '   <div class="infoDadosArvore kanban-container" style="'+(getOptionsPro('panelDadosArvorePro_atividades') == 'hide' ? 'display:none' : '')+';padding: 10px 0;max-height: 800px;overflow-y: scroll;">'+
                            '       '+htmlInfoAtividades+
                            '   </div>'+
                            '</div>';
    }
    return htmlAtividades;
}
function stylePanelArvore() {
    if ($('.iconDadosProcesso').length == 0) {
        $('#divConsultarAndamento').css({'border-top': '1px solid #dadada'}).find('a').addClass('newLink').prepend('<i class="fas fa-search azulColor iconDadosProcesso"></i>').find('img').remove();
        $('#divRelacionados').addClass('panelDadosArvore').find('label').addClass('newLink').prepend('<i class="fas fa-retweet azulColor iconDadosProcesso"></i>');
        $('#divRelacionadosParciais').css('margin-bottom','10px').find('a').addClass('newLink');

        $('.divRelacionadosParcial .iconStatusProcesso').remove();
        $('.divRelacionadosParcial a').each(function(){
            if ($(this).hasClass('protocoloFechado')) {
                $(this).prepend('<i class="fas fa-folder cinzaColor iconStatusProcesso"></i>');
            } else {
                $(this).prepend('<i class="fas fa-folder-open cinzaColor iconStatusProcesso"></i>');
            }
            var tooltip = (typeof $(this).attr('onmouseover') !== 'undefined') ? parent.extractTooltip($(this).attr('onmouseover')) : false;
            if (tooltip) {
                $(this).append(' ('+tooltip+')');
            }
        });


        var infoResponsaveis = '';
        $('script').not('[src*="js"]').each(function(index, value){
            if ($(this).text().indexOf('Nos[0].html = ') !== -1) {
                $.each($(this).text().split('\n'), function(ind, val){
                    if (val.indexOf('Nos[0].html = ') !== -1) {
                        infoResponsaveis = val.split("'")[1];
                    }
                });
            }
        });
        var htmlInfoResponsaveis = '';
        if (infoResponsaveis != '') {
            $.each(infoResponsaveis.split('<br />'), function(i, v){
                var result = $('<div/>').html(v).contents();
                if (result.text().trim() != '') {
                    var naoAtribuido = ($('<div/>').append(result).find('a.ancoraSigla').length == 1) ? ' <span class="infoAlerta">(n\u00E3o atribu\u00EDdo)</span>' : '';
                    htmlInfoResponsaveis += '<div>'+
                                            '   <a class="newLink" style="cursor:pointer" onclick="parent.copyTextThis(this)" onmouseover="return infraTooltipMostrar(\'Clique para copiar\');" onmouseout="return infraTooltipOcultar();">'+
                                            '   '+result.text().trim()+naoAtribuido+
                                            '   </a>'+
                                            '</div>';
                }
            });
        }

        var htmlResponsaveis =  '<div class="panelDadosArvore" data-type="responsaveis">'+
                                '   <label class="newLink" style="margin-bottom: 10px; display: block;">'+
                                '      <i class="fas fa-user-tie azulColor iconDadosProcesso"></i>'+
                                '      Atribui\u00E7\u00E3o:'+
                                '      <i class="fas fa-chevron-'+(getOptionsPro('panelDadosArvorePro_responsaveis') == 'hide' ? 'right' : 'down')+' azulColor" style="float: right; cursor:pointer; margin-right: 20px;" onclick="togglePanelDadosArvore(this)"></i>'+
                                '   </label>'+
                                '   <div class="infoDadosArvore" style="'+(getOptionsPro('panelDadosArvorePro_responsaveis') == 'hide' ? 'display:none' : '')+'">'+
                                '       '+htmlInfoResponsaveis+
                                '   </div>'+
                                '</div>';
            htmlResponsaveis = ($.inArray("Atribui\u00E7\u00E3o",jmespath.search(selectedItensPanelArvore,"[]")) !== -1) ? htmlResponsaveis : '';

        var htmlAtividades = '<div class="panelDadosArvore panelDadosArvore_atividades" data-type="atividades"></div>';
        initAtividadesProcesso();

        $('#frmArvore').append(htmlAtividades+htmlResponsaveis);

        initDadosProcessoArvore();

        if (htmlAtividades != '') {
            $('.kanban-item .checklist_progress').each(function(){
                $(this).progressbar({
                    value: $(this).data('valuenow'),
                    max: $(this).data('max')
                });
            });
            parent.getInsertIconAtividade();
        }
        parent.forceOnLoadBodyPage();

        if ($.inArray("Anota\u00E7\u00F5es",jmespath.search(selectedItensPanelArvore,"[]")) !== -1) {
            getDadosAnotacao();
        }
        if ($('#divRelacionados').text().trim() == '') {
            $('#divRelacionados').hide();
        }
    }
}
function initStylePanelArvore(TimeOut = 9000) {
    if (TimeOut <= 0 || parent.window.name != '') { return; }
    if (
        typeof getOptionsPro !== 'undefined' && selectedItensPanelArvore && 
        selectedItensPanelArvore.length > 0 && 
        (!parent.userHashAtiv || (parent.userHashAtiv && parent.checkLoadAtividadesProcPro)) &&
        typeof parent.__ !== 'undefined'
    ) {
        if (!getOptionsPro('optionsFlashMenu_panelinfo') || getOptionsPro('optionsFlashMenu_panelinfo') == 'enabled') { 
            stylePanelArvore();
        }
    } else {
        setTimeout(function(){ 
            parent.initNameConst();
            initStylePanelArvore(TimeOut - 100); 
            console.log('Reload initStylePanelArvore', TimeOut); 
        }, 500);
    }
}
function breakDocTwoLines() {
    if ($('.breackline_doc').length > 0) { $('.breackline_doc').remove(); }
    $('#divArvore').find('a[target="ifrVisualizacao"]').each(function(index){
        var checkLast = (index == $('#divArvore').find('a[target="ifrVisualizacao"]').length-1) ? true : false;
        var checkFolder = ($('#divArvore').find('a[id*="anchorImgPASTA"]').length > 0) ? true : false;
        var checkLastFolder = (parseInt($(this).closest('.infraArvore').attr('id').replace('divPASTA','')) == $('#divArvore').find('a[id*="anchorImgPASTA"]').length) ? true : false;
        var checkLastItemFolder = ($(this).attr('id') == $(this).closest('.infraArvore').find('a[target="ifrVisualizacao"]').last().attr('id')) ? true : false;
        var nrSEI = $(this).text().trim();
            nrSEI = (nrSEI.indexOf(' ') !== -1) ? nrSEI.split(' ') : '';
            nrSEI = (nrSEI != '') ? '<span style="font-size:9pt">'+nrSEI[nrSEI.length-1]+'</span>' : '';
        var imgDivPasta = (checkFolder && !checkLast && !checkLastFolder ) ? '<img src="/infra_js/arvore/line.gif" align="absbottom">' : '';
        var paddingLastFolder = (checkFolder && checkLastFolder) ? '<span style="margin-left: 18px;"></span>' : '';
        var imgDiv = (checkLast || checkLastItemFolder) ? '<img src="/infra_js/arvore/joinbottom.gif" align="absbottom" style="margin-left: 18px;">' : '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAASCAYAAAAzI3woAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyVpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ4IDc5LjE2NDAzNiwgMjAxOS8wOC8xMy0wMTowNjo1NyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MkIxNDk0NTBFQzFCMTFFQkFERjBGQzQ1Qjk0MkFCNUEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MkIxNDk0NTFFQzFCMTFFQkFERjBGQzQ1Qjk0MkFCNUEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDoxRkIyMEY3NUVDMUExMUVCQURGMEZDNDVCOTQyQUI1QSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDoxRkIyMEY3NkVDMUExMUVCQURGMEZDNDVCOTQyQUI1QSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PpIKuNMAAABISURBVHjaYvj//z8DLtzQ0PAfnzwxmFQzGEHEYAJM+CQbGxspdi2pZoyG0GgIjYbQaAiNhtBAhRCx9MgLIVLBaAgNuRACCDAA4Zq1PU3G1rcAAAAASUVORK5CYII=" />';
            
        $(this).after('<span class="breackline_doc"><br>'+paddingLastFolder+imgDivPasta+imgDiv+nrSEI+'</span>');
    });
}
function initBreakDocTwoLines(TimeOut = 9000) {
    if (TimeOut <= 0 || parent.window.name != '') { return; }
    if (typeof resizeArvoreMaxWidth !== 'undefined') {
        breakDocTwoLines();
    } else {
        setTimeout(function(){ 
            initBreakDocTwoLines(TimeOut - 100); 
            console.log('Reload initBreakDocTwoLines', TimeOut); 
        }, 500);
    }
}
function initSeiProArvore() {
    arrayLinksArvore = getLinksArvore();
    arrayLinksPage = getLinksPage();
    parent.linksArvore = getLinksPage();

    if (typeof localStorageRestorePro === "function" && typeof parent.checkConfigValue !== 'undefined' && parent.checkConfigValue('infoarvore') ) { 
        initStylePanelArvore();
    } else if (typeof localStorageRestorePro === "function" && typeof parent.checkConfigValue !== 'undefined'  && !parent.checkConfigValue('infoarvore')) {
        parent.forceOnLoadBodyPage(); 
        console.log('forceOnLoadBodyPage');
    }
    
    if (typeof localStorageRestorePro === "function" && typeof parent.checkConfigValue !== 'undefined'  && parent.checkConfigValue('menurapido') ) { 
        initToolbarDocs(); 
        initCSSArvore();
    }
    if (typeof localStorageRestorePro === "function" && typeof parent.verifyConfigValue !== 'undefined'  && parent.verifyConfigValue('duaslinhas') ) { 
        initBreakDocTwoLines();
    }
    // if (typeof resizeWinArvore === "function" && typeof parent.verifyConfigValue !== 'undefined'  && parent.verifyConfigValue('resizearvore') ) { 
        // parent.resizeWinArvore();
    // }
    if (
        (typeof parent.initAtividadesProcesso === 'function' || typeof parent.initAtividadesProcesso !== 'undefined') && 
        parent.checkConfigValue('gerenciaratividades') && localStorage.getItem('configBasePro_atividades') !== null &&
        typeof parent.__ !== 'undefined'
        ) {
        parent.initAtividadesProcesso();
    }
    if (
        (typeof parent.insertIconFavorites === 'function' || typeof parent.insertIconFavorites !== 'undefined') && 
        parent.checkConfigValue('gerenciarfavoritos')
        ) {
        parent.insertIconFavorites();
    }
    if (typeof parent.initCheckDadosProcesso === 'function' || typeof parent.initCheckDadosProcesso !== 'undefined') {
        parent.initCheckDadosProcesso();
    }
    if (typeof localStorageRestorePro === "function" && typeof parent.checkConfigValue !== 'undefined'  && parent.checkConfigValue('uploaddocsexternos')) {
        initUploadArvore();
    }
    if (typeof localStorageRestorePro === "function" && typeof parent.checkConfigValue !== 'undefined'  && parent.checkConfigValue('menususpenso')) {
        parent.hideMenuSistemaView();
    }
}

$(document).ready(function () { initSeiProArvore() });