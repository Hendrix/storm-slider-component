var QuotaSlider = QuotaSlider || {};


(function(window, $) {

    var options = {
        quotaSetBtnClass: ".send-quota",
        slider_max_value: "",   
        slider_min_value: "0",  
        export_idx: "",         
        quota_url: "",          
        quota: "",
        percentual:100
    };

    function init(opts) {
        $.extend(options, opts);
        NFSaaSUtils.fixCSRF();
        checkMinAndMaxValues();
    }

    function listenerSlider() {
        $("#quota-slider").on('change', function () {
            options.percentual = $(this).val();
            configureValue('.chosen_value', defineValueAndSetValueInMbOrGb(options.percentual));
        });
    }

    function loadHtmlSlider(errormsg) {

        var sliderHTML = ['<input type="range" id="quota-slider" min="0" max="100"',
                          '" value="'+ options.quota +'" step="1" />'].join('');
        var fullHtmlComponent = ['<img class="loader" src="/static/img/loader.gif" style="margin-top:45px;"/>',
                                   '<div class="form-group slider-form-group">',
                                   '<label for="quota-slider">Selecione abaixo:</label>',
                                   '<input class="chosen_value" type="text" disabled size="9" /><label class="title-atual-value">Atual :&nbsp;&nbsp;&nbsp;</label>',
                                   '<input class="used_value" type="text" disabled size="9" /><label class="title-used-value">Utilizado :&nbsp;</label>',                                   
                                   '<span id="selected_value"></span><span class="atual_value"></span>',
                                   sliderHTML,
                                   '<span class="min label label-info"></span><span class="max label label-info"></span>',
                                 '</div>',
                                 '<div class="form-group">',
                                   '<button class="send-quota btn btn-primary">Enviar</button>',
                                   '<div class="value_error">Valor inserido não é válido, verifique por favor!</div>',
                                 '</div>'].join('');

        if(errormsg !== undefined) {
            fullHtmlComponent = '<span class="errormsg">Erro ao carregar o componente de quota:<br />'+ errormsg +'</span>'
        }

        $("#quota-slider-container").html(fullHtmlComponent);
    }


    function validateQuotaValue() {
        var value_in_kb = setValueForQuotaSet($('.chosen_value').val());

        if (value_in_kb < options.slider_min_value || value_in_kb > options.slider_max_value) {
            return true;
        }

        return false;        
        
    }

    function loadMinAndMaxRangePreview() {
        $( ".min" ).html( setValueFomatInMbOrGb(options.slider_min_value));
        $( ".max" ).html( setValueFomatInMbOrGb(options.slider_max_value));
    }

    function definePercentualOverKbytes(valueInKbytes){

        if (options.slider_min_value == options.slider_max_value) {
            $("#quota-slider").attr("disabled", "true");
            return 100;
        }

        maxMinusMin = options.slider_max_value - options.slider_min_value;
        valueInKbMinusMin = valueInKbytes - options.slider_min_value;        
        percentual = (valueInKbMinusMin * 100) / maxMinusMin;
        return percentual;
    }

    function setValueFomatInMbOrGb(value_in_kbytes) {
        if (value_in_kbytes >= 1048576) {      
            var val = (value_in_kbytes / 1024 / 1024);
            return  val.toFixed(2) + " GB";
        } else {
            var value = (value_in_kbytes / 1024);
            return value.toFixed(2) + " MB";
        }
    }

    function defineValueAndSetValueInMbOrGb(value_slider_in_percentual) {
            var value_in_percentage = (value_slider_in_percentual / 100)
            var final_result = ((parseFloat(options.slider_max_value) - parseFloat(options.slider_min_value)) * value_in_percentage) + parseFloat(options.slider_min_value);
            return setValueFomatInMbOrGb(final_result);

    }

    function setValueForQuotaSet(value) {
        if (value.indexOf(' MB') > -1) {
            var size = value.split(' MB');
            var value =(size[0] * 1024);
            return value;
        } 

        if (value.indexOf(' GB') > -1) {
            var size = value.split(' GB');
            var value = (size[0] * 1024 * 1024);
            return value;
        } 

        return value;
        

    }

    function getQuotaSetEvent() {
        $(options.quotaSetBtnClass).on("click", function() {
            quotaSet();
        });
    }

    function reloadSlider() { 
        $('.reload').click(function() {
            showOrHideValue(".loader", "show");
            location.reload();
        });
    }

    function checkMinAndMaxValues(){

                if ( (options.slider_min_value == "" && options.slider_max_value == "") || 
                     (options.slider_min_value == 'None' && options.slider_max_value == 'None') ||
                     (options.slider_min_value == "" && options.slider_max_value == 'None') ||
                     (options.slider_min_value == 'None' && options.slider_max_value == "")) {
                    showOrHideValue(".loader", "hide");
                    configureValue("#quota-slider", definePercentualOverKbytes(options.quota));
                    showOrHideValue("#quota-slider-container .loader", "hide");
                    loadHtmlSlider("Favor verificar se os valores minimo e máximo foi especificado. [ <a class='reload'>Atualizar</a> ]");
                    reloadSlider();
                    return false;
                }

                
                if (options.slider_min_value == "" || options.slider_min_value == 'None') {
                    showOrHideValue(".loader", "hide");
                    configureValue("#quota-slider", definePercentualOverKbytes(options.quota));
                    showOrHideValue("#quota-slider-container .loader", "hide");
                    loadHtmlSlider("Favor verificar se valor minimo foi especificado. [ <a class='reload'>Atualizar</a> ]");
                    reloadSlider();
                    return false;
                }

                if (options.slider_max_value == "" || options.slider_max_value == 'None') {
                    showOrHideValue(".loader", "hide");
                    configureValue("#quota-slider", definePercentualOverKbytes(options.quota));
                    showOrHideValue("#quota-slider-container .loader", "hide");
                    loadHtmlSlider("Favor verificar se valor máximo foi especificado. [ <a class='reload'>Atualizar</a> ]");
                    reloadSlider();
                    return false;
                }

                getReportAndInitializeEvent();

    }

    function checkQuotaValueNotDefined(value){

        if (value == 'None') {
            return 0;
        }

        return value;
    }

    function getReportAndInitializeEvent() {

        $.ajax({
            type: "GET",
            url: options.quota_url,
        })
        .done(function(data) {
            loadHtmlSlider();
            listenerSlider();
            showOrHideValue(".loader", "hide");
            loadMinAndMaxRangePreview();
            options.quota = checkQuotaValueNotDefined(data[options.export_idx]['disk-limit']);
            console.log(options.quota);
            getQuotaSetEvent();
            configureValue(".used_value", setValueFomatInMbOrGb(data[options.export_idx]['disk-used']));
            configureValue(".chosen_value", setValueFomatInMbOrGb(data[options.export_idx]['disk-limit']));
            options.quota = setValueForQuotaSet($('.chosen_value').val()); 
            configureValue("#quota-slider", definePercentualOverKbytes(options.quota));
        })
        .fail(function(data) {
            loadHtmlSlider(data.statusText + " [ <a class='reload'>Atualizar</a> ] ");
            reloadSlider();
        });
    }

    function fixDecimalPlace(value){
        var quota_value = String(value);
        
        if (quota_value.indexOf(".")) {
            quota_value = quota_value.split(".")[0];
        }

        return quota_value;
    }


    function quotaSet() {
        var quota_value = setValueForQuotaSet($('.chosen_value').val());        

        quota_value = fixDecimalPlace(quota_value);

        if (!validateQuotaValue()) { 
            showOrHideValue(".value_error", "hide");
            showOrHideValue(".loader", "show");
            $.ajax({
                type: "POST",
                url: options.quota_url,
                data: { size: quota_value },
            })
            .done(function(data) {
                showOrHideValue(".loader", "hide");
                showOrHideValue("#quota-slider-container .loader", "hide");
                configureValue("#quota-slider", options.percentual);
            })     
            .fail(function(data) {
                showOrHideValue(".loader", "hide");
                configureValue("#quota-slider", definePercentualOverKbytes(options.quota));
                showOrHideValue("#quota-slider-container .loader", "hide");
                loadHtmlSlider("Ocorreu um erro ao enviar a quota! Verifique o valor informado. [ <a class='reload'>Atualizar</a> ] ");
                reloadSlider();
            });       

        } else {
            showOrHideValue(".loader", "hide");
            showOrHideValue(".value_error", "show");
            return;
        }

    }

    /**
        Métodos Utilitários
    **/

    function configureValue(selector, value) {
        $(selector).val(value);
    }

    function showOrHideValue(selector, type) {
        if (type == "hide") {
            return $(selector).hide();
        }

        if (type == "show") {
            return $(selector).show();
        }
    }

    $.extend(QuotaSlider, {
        init: init
    });

})(window, jQuery);
