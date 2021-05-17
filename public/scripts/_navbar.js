$(() => {

    function validateEmail (email) {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      }

    $('#register-submit').click(function(e){
        e.preventDefault()
        const email = $('#register-email').val();
        const password = $('#password1').val();
        const passwordConfirm = $('#password2').val();
    

        //Checking if the passwords match
        if (!validateEmail(email)) {
            $('.register-alert').append(`
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <strong>Error!</strong> Email incorrectly formatted
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>
            `)
            $(".alert").delay(3000).fadeOut("slow");
            return;
        }


        //Checking if the passwords match
        if (password !== passwordConfirm) {
          $('.register-alert').append(`
          <div class="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Error!</strong> Your passwords don't match, please try again.
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          </div>
          `)
          $(".alert").delay(3000).fadeOut("slow");
          return;
        }
        //CHecking for min password length
        if (password.length <= 4 ) {
          $('.register-alert').append(`
          <div class="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Error!</strong> Your password must have at least 4 characters!
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          </div>
          `)
          $(".alert").delay(3000).fadeOut("slow");
          return;
        }
    
        $.ajax({
          url: '/users/new',
          data: {email: email.toLowerCase(), password: password},
          method: 'POST'
        }).done((id) => {
          window.location.replace(`/`);
        }).catch((err) => {
          $('.register-alert').append(`
          <div class="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Error!</strong> ${err.responseText}
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          </div>
          `)
        });
      });
});
  