(function($) {
	$(function() {
		var demo = $('#demo');
		var sizeInput = demo.find('input[type="range"]');
		var textInput = demo.find('input[type="text"]');
		var iconToggle = demo.find('input[type="radio"]');
		
		sizeInput.change(function() {
			var val = $(this).val() + "px";
			demo.find('.zocial').css('font-size', val);
			demo.find('#font-size-display').text(val);
		})
		textInput.keyup(function() {
			var newlabel = $(this).val();
			demo.find('.zocial').text(newlabel);
		})
		textInput.blur(function() {
			if ($(this).val().length<1) demo.find('.zocial').text("Sign in with Google+"); 
		})
		iconToggle.click(function() {
			if ($(this).attr('id') == "select-icon") demo.find('.zocial').addClass('icon');
			else demo.find('.zocial').removeClass('icon');
		})
		
		$(document).ready(function() {
			$('#button-lightbox a').click(function() {
				_gaq.push(['_trackPageview', '/hide/button_preview']);
			})
		})
		$('#button-sample').click(function() {
			_gaq.push(['_trackPageview', '/view/button_preview']);
		})
		$('#show-examples').click(function() {
			_gaq.push(['_trackPageview', '/view/code_example']);
			$('#howto').removeClass('compact');
			$(this).remove();
			return false;
		})
		demo.click(function() {
			_gaq.push(['_trackPageview', '/view/demo']);
		})
		$('#purchase-area a').click(function() {
			_gaq.push(['_trackPageview', '/click/' + $(this).attr('id')]);
		});
	})
})(jQuery)