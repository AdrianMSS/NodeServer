// Open/Close nav
$('#openMenu').click(function () {

    $('#menu').css('width',  $(window).width() > 768 ? '25%':'100%') 
    $(this).hide();

});

$('#closeMenu').click(function () {
    $('#menu').css('width', '0%');
    $('#openMenu').show();
}); 
