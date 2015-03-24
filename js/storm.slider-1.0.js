var StormSlider = StormSlider || {};


(function(window, $) {

    var options = {
        quotaSetBtnClass: ".input-size", // Valor final a ser enviado no Form
        nfsaasApiQuotaUrl: "/quota",     // Url do Nfsaas-api para quota
        slider_max_value: "1024",        // Valor Máximo do Slider..ambiente x tamanho..
        sliderStepMap : [0, 100, 200,300,400,500,600,700,800,900,1000, 1024], // Steps dado o valor máximo 
        value_selected : 100,            // Valor default do component Slider
        slider_min_value : 0,            // Valor mínimo do component Slider   
        slider_default_value_idx : 1,    // Indice dos steps
    };

    function init(opts) {
        $.extend(options, opts);
        _bindEvents();
        StormUtils.init();        
    }

    function _bindEvents() {
        $( document ).ready(function() {
            loadHtmlSliderStorm();
            set_value_in_gigabyte(options.slider_max_value);
            set_steps_values(options.slider_max_value);            
            initialize_slider_values();            
            load_max_range_preview();
            //quota_get();
            //quota_set();
            reset_widget();
        });
 
    }

    /**
        initialize_slider_values : Instancia o componente Slider, com os valores definidos de acordo,
        com as variáveis de ambiente e tamanho.
        
    **/
    function initialize_slider_values(){

        $( "#slider" ).slider({
            value: options.slider_default_value_idx,
            min: options.slider_min_value,
            max: options.sliderStepMap.length -1,
            slide: function( event, ui ) {
                $( "#valor-size" ).val( sliderStepMap[ui.value]  + " MB"); 
                $(".input-size").val(sliderStepMap[ui.value]);

            }
        });
        
        $("#valor-size").val(options.sliderStepMap[$("#slider").slider("value")] + " (MB)");
    }


    /**
        set_steps_values : Dado o valor selecionado de ambiente/tamanho retorna o array possível de steps
        para o componente Slider.
        
    **/
    function set_steps_values(slider_max_value) {

        switch (slider_max_value) {
            case "1024": // Step for each 100mb
                sliderStepMap = [0, 100, 200,300,400,500,600,700,800,900,1000, 1024];
                break;
            case "5120": // Step for each 200mb
                sliderStepMap = [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800,4000, 4200, 4400, 4600, 4800, 5000, 5120]
                break;
            case "10240": // Step for each 500mb
                sliderStepMap = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500,10000, 10240]
                break;
            case "20480": // Step for each 1000mb
                sliderStepMap = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000,20000, 20480]
                break;
            case "51200": // Step for each 5000mb
                sliderStepMap = [0, 5000, 10000, 20000, 30000, 40000, 50000]
                break; 
        }

        return sliderStepMap;

    }

    /**
        loadHtmlSliderStorm : Método que inicializa Html completo do componente.
    **/
    function loadHtmlSliderStorm() {

        var sliderStormComponentLabel                   = '<p><label class="label" for="valor-size">Selecione a quota abaixo:</label>'; 
        var sliderStormComponentSliderSizeSelected      = '<input type="text" id="valor-size" /></p>'; 
        var sliderStormComponentDivSliderAndDivMax      = '<div id="slider" /></div><div class="max" /></div>'; 
        var sliderStormComponentInputReset              = '<input class= "reset" type="reset" value="Reiniciar" />';    
        var sliderStormComponentLabelSizeManual         = '<p><label class="label-manual-input" for="valor-size">ou se preferir digite aqui (MB) :</label>';
        var sliderStormComponentInputSizeManual         = '<input class="input-size" type="text" size="15" value="100"/></p>';
        var sliderStormComponentInputSend               = '<input class="send" type="submit" value="Enviar" />'; 


        var fullHtmlComponent       = sliderStormComponentLabel + sliderStormComponentSliderSizeSelected + sliderStormComponentDivSliderAndDivMax 
        + sliderStormComponentInputReset  + sliderStormComponentLabelSizeManual + sliderStormComponentInputSizeManual 
        + sliderStormComponentInputSend;

        $("#slider-storm").html(fullHtmlComponent);   

    }

    /**
        load_max_range_preview : Define o valor em gbytes a ser exibido no max_range do componente Slider
        na sua interface.
        
    **/
    function load_max_range_preview(){
        $( ".max" ).html( set_value_in_gigabyte(options.slider_max_value) + " (GB)");   
    }       

    /**
        set_value_in_gigabyte : Utilizado para converter valor em kbytes para gbytes para ser usado na
        exibição do max no componente Slider.
        
    **/
    function set_value_in_gigabyte(value_in_kbytes) { 

        var value_in_gigabyte = 0;

        switch (value_in_kbytes) {
            case options.slider_max_value:
                value_in_gigabyte = 1;
                break;
        }

        return value_in_gigabyte;
    }


    /**
        quota_get : Recupera a quota para o export.
        
    **/
    function quota_get(url) {
        $.ajax({
            type: "GET",
            url: options.nfsaasApiQuotaUrl
            }).done(function(data) {
                window.location.href = options.nfsaasReportUrl + "/" + data;
                //loadHtmlReportCall(data.disk-limit, disk-used);
        });
    }

    /**
        quota_set : Defina a quota para o export.
        
    **/
    function quota_set(url) {
        $.ajax({
            type: "POST",
            url: options.nfsaasApiQuotaUrl
        }).done(function(data) {
            //window.location.href = options.nfsaasQuotaSetUrl +"/"+ data.job
            console.log("Data == ");
            console.log(data);
        });
    }

    /**
        loadHtmlReportCall : Método que trata retorno da chamada de report e carrega o html.
    **/
    function loadHtmlReportCall(limit,used) {

        var fullHtmlReport       = '<table><tr><th>Disk-Limit</th><th>Disk-Used</th></tr><tr><td>' + limit + '</td><td>' + used + '</td></tr></table>';
        
        $(document.createElement('div')).addClass("slider-report").html(fullHtmlReport).appendTo($("#slider-storm"));
    }


    /**
        .reset : Mapea o evento de click no componente reset, e reinicializa o Widget Slider com valores
        padrões.
        
    **/
    function reset_widget(){
        $( ".reset" ).click(function() {
            _bindEvents();
        });
    }

    $.extend(StormSlider, {
        init: init
    });

})(window, jQuery);
