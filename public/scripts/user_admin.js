$(() => {

    //Updates the modal for updating user passwords to show what user the admin is selecting
    $('.btn-update-pass').click(function(e){
        $('#selected-user').html($(this).data("username"))
        $('#newPasswordAdmin-submit').attr('data-userid', $(this).data("id"))
    });

    //Admin submitting a request to update another user's password
    $('#newPasswordAdmin-submit').click(function(e){
        e.preventDefault()
        const currentPassword = $('#currentPassword').val();
        const newPassword = $('#newPassword1').val();
        const newPasswordConfirm = $('#newPassword2').val();
        const selectedUserID = $('#newPasswordAdmin-submit').data('userid')

        //Checking the admin's own password length
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
        
        //Checking for min password length of the new password being set for the user
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
  
        //Checking if the passwords new passwords match
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

        //Sending the request to modify the password of another user
        $.ajax({
          url: '/users/' + selectedUserID + '/admin/edit/',
          data: {currentPassword: currentPassword, newPassword: newPassword, selectedUserID: selectedUserID},
          method: 'POST'
        }).done((data) => {
          $('#newPassword-form').trigger("reset");
          $('.newPassword-alert').append(`
          <div class="alert alert-success alert-dismissible fade show" role="alert">
          The password has been successfully updated. 
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
