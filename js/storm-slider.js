  $(function() {

	/**
		URL : Identifica url / ambiente do NFSAAS
	**/
	var url = location.href;

	/**
		slider_min_value : Identifica valor minímo para o Slider.
	**/
	var slider_min_value = 0;

	/**
		slider_max_value : Identifica valor máximo para o Slider, variando entre os sizes existentes no NFSAAS: 
		small, medium e large podendo variar de ambiente para ambiente.
	**/

	var slider_max_value = 0;

	/**
		sliderStepMap : Contém array de posições possíveis no Slider, podendo variar de acordo com o valor máximo
	**/
	var sliderStepMap = [];

	/**
		MAX_RANGE_IN_MB : Contém estrutura para armazenar ranges já no formato de kbytes que é o padrão utilizado
		pela NETAPP / NFSAAS.
		
	**/
	var MAX_RANGE_IN_MB = {};	

	/**
		MAX_RANGE_IN_GB : Contém estrutura para armazenar ranges já no formato de GigaBytes para auxiliar na exibição do
		componente de Slider para o Usuário.
	**/
	var MAX_RANGE_IN_GB = {};

	/**
		SIZE_QTREES : Contém estrutura para armazenar parte das Urls do NFSAAS, contemplando a parte de tamanhos.
	**/
	var SIZE_QTREES = {};

	/**
		ENVIROMENTS : Contém estrutura para armazenar os ambientes : local, dev e prod para realizar o cálculo 
		de possíveis sizes de qtree para os respectivos ambientes.
	**/
	var ENVIROMENTS = {};

	/**
		value_selected : Armazena valor final selecionado na Slider e também utilizado para preencher o input.
	**/
	var value_selected = 100;

	loadHtmlSliderStorm();
	startSliderWidget();

	/**
		loadHtmlSliderStorm : Método que inicializa Html completo do componente.
	**/
	function loadHtmlSliderStorm() {

		var sliderStormComponentLabel 					= '<p><label class="label" for="valor-size">Selecione o tamanho da qtree abaixo:</label>'; 
		var sliderStormComponentSliderSizeSelected 		= '<input type="text" id="valor-size" readonly /></p>'; 
		var sliderStormComponentDivSliderAndDivMax 		= '<div id="slider" /></div><div class="max" /></div>'; 
		var sliderStormComponentInputReset 				= '<input class= "reset" type="reset" value="Reiniciar" />';	
		var sliderStormComponentLabelSizeManual 			= '<p><label class="label" for="valor-size">ou se preferir digite aqui (MB) :</label>';
		var sliderStormComponentInputSizeManual 		= '<input class="input-size" type="text" size="15" /></p>';


		var fullHtmlComponent 		= sliderStormComponentLabel + sliderStormComponentSliderSizeSelected + sliderStormComponentDivSliderAndDivMax 
		+ sliderStormComponentInputReset  + sliderStormComponentLabelSizeManual + sliderStormComponentInputSizeManual;

   		$( "#slider-storm" ).html(fullHtmlComponent);	

	}

	/**
		startSliderWidget : Método que inicializa todas as funções do Widget de Slider, com valores e definições,
		para uma execução básica.
	**/
	function startSliderWidget() {
		initializeEnviroments();
		initializeSizesUrls();
		initializeMaxRangeMBData();
		initializeMaxRangeGBData();
		set_slide_bar_range(url);
		load_max_range_preview();
		set_steps_values(slider_max_value);
		initialize_slider_values();	
		set_default_size_for_input();
	}

	/**
		initializeEnviroments : Responsável por instanciar os valores de dominio do nfsaas : local, dev e prod,
		que definirá os sizes possíveis para cada ambiente.

	**/
	function initializeEnviroments() { 
		ENVIROMENTS["local"]  = "localhost";
		ENVIROMENTS["dev"]    = "nfsaas.dev.globoi.com";
		ENVIROMENTS["prod"]   = "nfsaas.globoi.com";
	}

	/**
		initializeSizesUrls : Responsável por iniciar os valores de cada url / tamanhos dentro do nfsaas.
		
	**/
	function initializeSizesUrls() { 
		SIZE_QTREES["small"]  = "tamanhos/1";
		SIZE_QTREES["medium"]  = "tamanhos/2";
		SIZE_QTREES["large"] = "tamanhos/3";
	}

	/**
		initializeMaxRangeMBData : Instancia valores em kbytes para cada max_range atualmente no nfsaas.
		
	**/
	function initializeMaxRangeMBData() { 
		MAX_RANGE_IN_MB["1GB"]  = "1024";
		MAX_RANGE_IN_MB["5GB"]  = "5120";
		MAX_RANGE_IN_MB["10GB"] = "10240";
		MAX_RANGE_IN_MB["20GB"] = "20480";
		MAX_RANGE_IN_MB["50GB"] = "51200";
	}

	/**
		initializeMaxRangeGBData : Instancia valores em gbytes para cada max_range atualmente no nfsaas, estritamente
		para exibição na interface do componente.
		
	**/
	function initializeMaxRangeGBData() { 
		MAX_RANGE_IN_GB["1GB"]  = "1";
		MAX_RANGE_IN_GB["5GB"]  = "5";
		MAX_RANGE_IN_GB["10GB"] = "10";
		MAX_RANGE_IN_GB["20GB"] = "20";
		MAX_RANGE_IN_GB["50GB"] = "50";
	}

	/**
		set_default_size_for_input : Define o valor do campo de input para colocar valor arbitrário, caso não
		seja colocado manualmente, utilizar o valor selecionado no Slider.
		
	**/
	function set_default_size_for_input() { 
		$(".input-size").val(value_selected);
	}

	/**
		convert_megabyte_in_kbyte : Dado uma seleção de sizes/quota em mbytes realiza a conversão para kbytes,
		unidade utilizada na NETAPP para quotas.
		
	**/
	function convert_megabyte_in_kbyte(slider_value) {
	    return slider_value * 1024;              
	}

	/**
		set_slide_bar_range : Dado ambiente da aplicação e tamanho define o valor máximo para o componente
		Slider.
		
	**/
	function set_slide_bar_range(url){

		for (var size_qtree in SIZE_QTREES) {
  			for (var enviroment in ENVIROMENTS) {


  				if (checkContentInUrl(url, ENVIROMENTS["dev"])) {

					// DEV
					// SMALL - até 1GB  && nfsaas.dev.globoi.com
					if (checkContentInUrl(url, SIZE_QTREES["small"])) 
  					{ 
						slider_max_value = MAX_RANGE_IN_MB["1GB"];
					}
			
					// MEDIUM - até 5GB  && nfsaas.dev.globoi.com
					if (checkContentInUrl(url, SIZE_QTREES["medium"]))
					{
						slider_max_value = MAX_RANGE_IN_MB["5GB"];
					} 				

					// LARGE - até 10GB  && nfsaas.dev.globoi.com	
					if (checkContentInUrl(url, SIZE_QTREES["large"])) 
					{
						slider_max_value = MAX_RANGE_IN_MB["10GB"];
					}


  				}


  				if (checkContentInUrl(url, ENVIROMENTS["prod"])) {

  					// PROD
					// SMALL - até 1GB  && nfsaas.globoi.com
					if (checkContentInUrl(url, SIZE_QTREES["small"])) 
  					{ 
						slider_max_value = MAX_RANGE_IN_MB["1GB"];
					}
			
					// MEDIUM - até 20GB  && nfsaas.globoi.com
					if (checkContentInUrl(url, SIZE_QTREES["medium"]))
					{
						slider_max_value = MAX_RANGE_IN_MB["20GB"];
					} 				

					// LARGE - até 50GB  && nfsaas.globoi.com	
					if (checkContentInUrl(url, SIZE_QTREES["large"])) 
					{
						slider_max_value = MAX_RANGE_IN_MB["50GB"];
					}

  				}

  			}	
		}


		// AMBIENTE LOCAL - APENAS VALIDAÇÃO DE IMPLEMENTAÇÃO..SEM CHECAR SIZE..CARREGANDO DAFAULT
		if (checkContentInUrl(url, ENVIROMENTS["local"]))
		{
			// DEFAULT - até 1GB 
			slider_max_value = MAX_RANGE_IN_MB["1GB"];
		}

	}

	/**
		checkContentInUrl : Função utilitária para validar que dado uma String/Url contenha determinado conteudo.
		
	**/
	function checkContentInUrl(url, content) {
		return url.indexOf(content) > -1
	}

	/**
		initialize_slider_values : Instancia o componente Slider, com os valores definidos de acordo,
		com as variáveis de ambiente e tamanho.
		
	**/
	function initialize_slider_values(){

		$( "#slider" ).slider({
			value: 1,
      		min: slider_min_value,
      		max: sliderStepMap.length-1,
      		slide: function( event, ui ) {
        		//$( "#valor-size" ).val( $( "#slider" ).slider( "value" ) + " Mb");
        		$( "#valor-size" ).val( sliderStepMap[ui.value]  + " MB"); 
        		$(".input-size").val(sliderStepMap[ui.value]);
      		}
    	});
		
		$( "#valor-size" ).val( sliderStepMap[$( "#slider" ).slider( "value")]  + " (MB)");
	}

	/**
		load_max_range_preview : Define o valor em gbytes a ser exibido no max_range do componente Slider
		na sua interface.
		
	**/
	function load_max_range_preview(){
		$( ".max" ).html( set_value_in_gigabyte(slider_max_value) + " (GB)");	
	}		

	/**
		set_steps_values : Dado o valor selecionado de ambiente/tamanho retorna o array possível de steps
		para o componente Slider.
		
	**/
	function set_steps_values(slider_max_value) {

		switch (slider_max_value) {
    		case MAX_RANGE_IN_MB["1GB"]: // Step for each 100mb
        		sliderStepMap = [0, 100, 200,300,400,500,600,700,800,900,1000, 1024];
        		break;
    		case MAX_RANGE_IN_MB["5GB"]: // Step for each 200mb
        		sliderStepMap = [0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200, 3400, 3600, 3800,4000, 4200, 4400, 4600, 4800, 5000, 5120]
        		break;
    		case MAX_RANGE_IN_MB["10GB"]: // Step for each 500mb
        		sliderStepMap = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000, 7500, 8000, 8500, 9000, 9500,10000, 10240]
        		break;
    		case MAX_RANGE_IN_MB["20GB"]: // Step for each 1000mb
        		sliderStepMap = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000,20000, 20480]
        		break;
    		case MAX_RANGE_IN_MB["50GB"]: // Step for each 5000mb
        		sliderStepMap = [0, 5000, 10000, 20000, 30000, 40000, 50000]
        		break;
		}

		return sliderStepMap;

	}

	/**
		set_value_in_gigabyte : Utilizado para converter valor em kbytes para gbytes para ser usado na
		exibição do max no componente Slider.
		
	**/
	function set_value_in_gigabyte(value_in_kbytes) { 

		var value_in_gigabyte = 0;

		switch (value_in_kbytes) {
    		case MAX_RANGE_IN_MB["1GB"]:
        		value_in_gigabyte = MAX_RANGE_IN_GB["1GB"];
        		break;
    		case MAX_RANGE_IN_MB["5GB"]:
        		value_in_gigabyte = MAX_RANGE_IN_GB["5GB"];
        		break;
    		case MAX_RANGE_IN_MB["10GB"]:
        		value_in_gigabyte = MAX_RANGE_IN_GB["10GB"];
        		break;
    		case MAX_RANGE_IN_MB["20GB"]:
        		value_in_gigabyte = MAX_RANGE_IN_GB["20GB"];
        		break;
    		case MAX_RANGE_IN_MB["50GB"]:
        		value_in_gigabyte = MAX_RANGE_IN_GB["50GB"];
        		break;
		}

		return value_in_gigabyte;
	}

	/**
		.reset : Mapea o evento de click no componente reset, e reinicializa o Widget Slider com valores
		padrões.
		
	**/
	$( ".reset" ).click(function() {
		initializeEnviroments();
		initializeSizesUrls();
		initializeMaxRangeMBData();
		initializeMaxRangeGBData();
		set_slide_bar_range(url);
		load_max_range_preview();
		set_steps_values(slider_max_value);
		initialize_slider_values();	
		set_default_size_for_input();
	});

  });
