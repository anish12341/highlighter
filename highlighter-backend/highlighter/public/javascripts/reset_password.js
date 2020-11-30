
$(document).ready(function() {
  $('#submit').prop('disabled', true);
  $('#submit').css('backgroundColor', '#cacabf');
  $('#password, #confirm_password').on('keyup', function () {
    if ($('#password').val() == $('#confirm_password').val() && 
    $('#password').val() != '' && $('#confirm_password').val() != '') {
      $('#password_message').html('Passwords match!').css('color', 'green');
      $('#submit').css('backgroundColor', 'yellow');
      $('#submit').css('color', 'black');
      $('#submit').hover(function() {
        this.css('backgroundColor', 'black');
        this.css('color', 'white');
      });
      $('#submit').prop('disabled', false);
    } else {
      $('#password_message').html('Passwords do not match!').css('color', 'red');
      $('#submit').css('backgroundColor', '#cacabf');
      $('#submit').prop('disabled', true);
    }
  });
});