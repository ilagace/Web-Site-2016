/*
  Set up the modal window activation when hovering on company name
 */
$('#company').hover(function() {
    $('.modal').modal({
        show: true
    });
});