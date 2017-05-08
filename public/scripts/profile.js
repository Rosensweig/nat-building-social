var user;

$(document).ready(function() {
	user=JSON.parse($("#user").val());
	darkenIcons();
});

function darkenIcons() {
	if (!user.local.email) {
		$(".fa-user").parent().addClass("text-muted");
		$(".fa-user").parent().removeClass("text-success");
	} else {
		$(".fa-user").parent().removeClass("text-muted");
		$(".fa-user").parent().addClass("text-success");
	}

	if (!user.facebook.token) {
		$(".fa-facebook").parent().addClass("text-muted");
		$(".fa-facebook").parent().removeClass("text-primary");
	} else {
		$(".fa-facebook").parent().removeClass("text-muted");
		$(".fa-facebook").parent().addClass("text-primary");
	}

	if (!user.google.token) {
		$(".fa-google-plus").parent().addClass("text-muted");
		$(".fa-google-plus").parent().removeClass("text-danger");
	} else {
		$(".fa-google-plus").parent().removeClass("text-muted");
		$(".fa-google-plus").parent().addClass("text-danger");
	}
}