$(() => {

  $('#newPassword-submit').click(function(e){
      e.preventDefault()
      const currentPassword = $('#currentPassword').val();
      const newPassword = $('#newPassword1').val();
      const newPasswordConfirm = $('#newPassword2').val();

      if (currentPassword.length < 1) {
          $('.newPassword-alert').append(`
          <div class="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Error!</strong> Current password cannot be blank, please try again.
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          </div>
          `)
          $('#newPassword-form').trigger("reset");
          $(".alert").delay(3000).fadeOut("slow");
          return;
      }


      //Checking for min password length
      if (newPassword.length <= 4 ) {
        $('.newPassword-alert').append(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Error!</strong> Your password must have at least 4 characters!
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        </div>
        `)
        $('#newPassword-form').trigger("reset");
        $(".alert").delay(3000).fadeOut("slow");
        return;
      }

      //Checking if the passwords match
      if (newPassword !== newPasswordConfirm) {
        $('.newPassword-alert').append(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Error!</strong> Your passwords don't match, please try again.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        </div>
        `)
        $('#newPassword-form').trigger("reset");
        $(".alert").delay(3000).fadeOut("slow");
        return;
      }

      $.ajax({
        url: '/users/' + userID + '/edit/',
        data: {currentPassword: currentPassword, newPassword: newPassword},
        method: 'POST'
      }).done((data) => {
        $('#newPassword-form').trigger("reset");
        $('.newPassword-alert').append(`
        <div class="alert alert-success alert-dismissible fade show" role="alert">
        Your password has been successfully updated. 
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        </div>
        `)
        $(".alert").delay(3000).fadeOut("slow");
      }).catch((err) => {
        $('#newPassword-form').trigger("reset");
        $('.newPassword-alert').append(`
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <strong>Error!</strong> ${err.responseText}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        </div>
        `)
        $(".alert").delay(3000).fadeOut("slow");
      });
    });

});
  