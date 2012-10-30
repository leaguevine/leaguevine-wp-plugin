<?php
/*
Plugin Name: Leaguevine Linking
Description: Plugin replaces names with leaguevine url in content.
Author: RH
Version: 1.0
*/

define("LLINKING_PLUGIN_DIR", dirname(__FILE__));
define("LLINKING_PLUGIN_URL", get_option('siteurl').'/wp-content/plugins/leaguevine-linking/');
define("LEAGUEVINE_API_URL", "https://api.leaguevine.com/v1/players/");

// adding linking button to media buttons
add_action('media_buttons_context', 'llinking_media_buttons');
function llinking_media_buttons($context) {
	$form_button = '<a href="#TB_inline?width=600&height=650&inlineId=leaguevine-linking-form" class="thickbox" id="ll-form-link" title="Leaguevine Linking"><img src="'.LLINKING_PLUGIN_URL.'images/form-icon.png" alt="Leaguevine Linking" /></a>';
	return $context . $form_button;
}

// html for Leaguevine Linking popup (in footer)
add_action('admin_footer',  'llinking_popup');
function llinking_popup() {
	?>
	<div id="leaguevine-linking-form" style="position:relative; display:none;">
		<div style="padding:20px 0px 10px 30px;">
			<div>
				<table width="100%" cellspacing="0" cellpadding="0">
					<tr>
						<td width="120"><input type="button" class="button-primary" value="Link" onclick="llinking_link();" /><img src="<?php echo LLINKING_PLUGIN_URL; ?>images/loading.gif" id="link-loading" style="margin-left:7px; display:none;"></td>
						<td align="center"><div class="curr-word">&nbsp;</div></td>
						<td width="120" align="right"><a class="button" href="#skip" onclick="llinking_next(); return false;">Skip</a></td>
					</tr>
				</table>
			</div>
			<div class="players-popup"></div>
			<div style="padding-top:15px;">
				<div class="llinking-form-content"></div>
			</div>
		</div>
	</div>
	<?php
}

// adding plugin CSS and JS
add_action('admin_head', 'llinking_head');
function llinking_head() {
	echo('<link rel="stylesheet" href="'.LLINKING_PLUGIN_URL.'css/llinking.css" type="text/css" />');
	echo '<script type="text/javascript" src="'.LLINKING_PLUGIN_URL.'js/llinking.js"></script>';
	echo '<script type="text/javascript">var leaguevine_api_url = "'.LEAGUEVINE_API_URL.'";</script>';
}
?>