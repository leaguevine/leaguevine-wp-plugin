var capwords = new Array();
var capinx = 0;
var ll_nmb = 0;
var ll_flag = true;

jQuery(document).ready(function() {
	// Leaguevine Linking icon click
	jQuery('#ll-form-link').click(function() {
		capwords = new Array(); capinx = 0; ll_nmb = 0; ll_flag = true; // reset params

		var post_content = jQuery("#content_ifr").contents().find("#tinymce").html(); // get editor html
		jQuery('.llinking-form-content').html(post_content); // fill popup content
		jQuery('.llinking-form-content').parsecapitalize(); // parse and find capitalized words

		// if found caps words then add tags for highlighting
		if (capwords.length > 0) {
			for (cw=0; cw<capwords.length; cw++) {
				var capregexp = eval('/'+capwords[cw]+'(?=[,\.< ])/g;'); // if end of word is (, or . or < or space)
				post_content = post_content.replace(capregexp, '<font class="ll' + cw + '">' + capwords[cw] + '</font>');
			}
			jQuery('.llinking-form-content').html(post_content); // fill popup content with highlighting tags
		}
		llinking_next();
	});
});

// skip function
function llinking_next() {
	if (ll_flag) {
		jQuery('.llinking-form-content font').removeClass('lighted'); // remove all highlightings
		jQuery('.curr-word').html('&nbsp;');
		if (ll_nmb < capwords.length) {
			jQuery('.ll'+ll_nmb).addClass('lighted'); // highlighting current word
			jQuery('.curr-word').html(capwords[ll_nmb]); // show current word
			ll_nmb++;
		} else { // if end of words
			tb_remove(); // close lightbox
		}
	}
}

// link function
function llinking_link() {
	if (ll_flag) {
		ll_flag = false;
		jQuery('#link-loading').show(); // show loading icon

		// get JSON data from leaguevine server
		jQuery.getJSON(leaguevine_api_url, {name: capwords[ll_nmb - 1]}, function(json){
			jQuery('#link-loading').hide(); // hide loading icon
			if (json.objects != '') { // if found player(s)
				if (json.objects.length > 1) { // if found more 1 players then show popup with list of players
					var players_popup_html = '<table cellpadding="0" cellspacing="0" width="100%">';
					players_popup_html += '<tr><td></td><td><strong>ID</strong></td><td><strong>First Name</strong></td><td><strong>Last Name</strong></td><td><strong>Nickname</strong></td><td><strong>Image</strong></td><td><strong>URL</strong></td></tr>';
					for (var p=0; p<json.objects.length; p++) {
						players_popup_html += '<tr><td><input type="checkbox" value="'+json.objects[p].id+'" onclick="llinking_set_url(\''+json.objects[p].leaguevine_url+'\');"></td><td>'+json.objects[p].id+'</td><td>'+json.objects[p].first_name+'</td><td>'+json.objects[p].last_name+'</td><td>'+json.objects[p].nickname+'</td><td><img src="'+json.objects[p].profile_image_50+'"></td><td><a href="'+json.objects[p].leaguevine_url+'" target="_blank">view</a></td></tr>';
					}
					players_popup_html += '</table>';
					jQuery('.players-popup').html(players_popup_html);
					jQuery('.players-popup').animate({height: 'show'}, 300); // show players popup
				} else {
					llinking_set_url(json.objects[0].leaguevine_url);
				}
			} else {
				ll_flag = true;
				llinking_next();
			}
		});
	}
}

// set leaguevine url function
function llinking_set_url(leaguevine_url) {
	var clid = ll_nmb - 1;
	jQuery('.players-popup').animate({height: 'hide'}, 300); // hide players popup
	if (leaguevine_url != '') {
		// replace player name by link
		jQuery('.ll'+clid).html('<a href="'+leaguevine_url+'" target="_blank">'+capwords[clid]+'</a>');
		// replace content in wp editor
		jQuery("#content_ifr").contents().find("#tinymce").html(jQuery('.llinking-form-content').html());
		for (var i=0; i<capwords.length; i++) {
			// clear specs tags
			jQuery("#content_ifr").contents().find("#tinymce .ll"+i).replaceWith(jQuery("#content_ifr").contents().find("#tinymce .ll"+i).html());
		}
	}
	ll_flag = true;
	llinking_next();
}

// add caps word to array function
function llinking_add_word(capword) {
	var capword_arr = capword.split(' ');
	if (jQuery.inArray(capword, capwords) == -1 && capword_arr.length > 1) { // if word isn't in array and no single add to array
		capwords[capinx] = capword;
		capinx++;
	}
}

// js trim function
function trim(str) {
	if (str != 'undefined') {
		return str.replace(/^\s+|\s+$/g, "");
	}
}

// parse and find capitalized words function
jQuery.fn.parsecapitalize = function() {
	function words_parse_capitalize(node) {
		if (node.nodeType == 3) {
			var cappat = new RegExp('^[A-Z]{1}'); // pattern for capitalized word
			var ndata = node.data; // html paragraph text

			var doted_array = ndata.split('.'); // dotes spliting
			for (var s=0; s<doted_array.length; s++) {
				var doted_data = trim(doted_array[s]);
				if (doted_data != '') {
					var comma_array = doted_data.split(','); // commas spliting
					for (var c=0; c<comma_array.length; c++) {
						var clear_data = trim(comma_array[c]);

						var space_array = clear_data.split(' '); // spaces spliting
						var capword = '';
						for (var cp=0; cp<space_array.length; cp++) {
							var wrd = trim(space_array[cp]);
							if (wrd.length > 2 && wrd.match(cappat)) { // check capitalize
								if (capword != '') { capword = capword + ' '; }
								capword = capword + wrd;
							} else {
								if (capword != '') { // if isn't empty
									llinking_add_word(capword);
								}
								capword = '';
							}
						}
						// last word(s)
						if (capword != '') { // if isn't empty
							llinking_add_word(capword);
						}
					}
				}
			}
		} else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
	        	for (var i = 0; i < node.childNodes.length; i++) {
	        		words_parse_capitalize(node.childNodes[i]);
	        	}
		}
	}
 
	return this.each(function() {
	    words_parse_capitalize(this);
	});
};
