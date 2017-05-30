var user;

$(document).ready(function() {
	user=JSON.parse($("#user").val());
	darkenIcons();

	$('button.delete').click(function(event) {
		var confirmed = confirm("Are you sure you want to delete this post?");
		var id = $(this).attr("id");
		if (confirmed) {
			deletePost(id);
		}
	});

	$('.description').on("click", "button.editDescription", function(event) {
		var description = $('#userDescription').text().trim();
		$('.description').html('<form><button id="updateDescription" type="submit">Submit</button><textarea rows="10" cols="50" name="descriptionField" id="descriptionField" required="required">'+description+'</textarea></form>');
	});

	$('.description').on('click', '#updateDescription', function(event) {
		event.preventDefault();
		var description= $('#descriptionField').val();
		console.log("Description is: "+description);
		editDescription(description);
	});
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

function deletePost(id) {
	$.ajax({
	    type: "DELETE",
	    url: "/post/"+id,
	    success: function(msg) {
	        console.log("Post successfully deleted: " + msg);
	        $("#"+id).parent().remove();
	    },
	    error: function(err) {
	    	console.log("Error deleting post: "+err);
	    	alert("Error deleting post.");
	    }
	});
}

function editDescription(description) {
	$.ajax({
		type: "PUT",
		url: "/profile/"+user._id,
		data: {description:description},
		success: function(msg) {
			var desc = '<h4>'+msg.local.description.replace('\n', '</h4><h4>')+'</h4>';
			$('.description').html('<button class="editDescription">Edit Description</button><span id="userDescription">'+desc+'</span>');
		},
		error: function(err) {
			console.log("Problem editing profile: " +err);
			alert("Error deleting post.");
		}
	});
}