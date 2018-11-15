// function testFunc(e){
//     // var x=e.getAttribute("val");
// var x="<img src='loading.gif'></img>";
//     $("#domainInfo").html(x);
//     setTimeout(function(){
//         x=e.getAttribute("val");
        
//     $("#domainInfo").html(x);
//         }, 300);
// }

$('.openmodale1').click(function (e) {
    e.preventDefault();
    $('.modale1').addClass('opened1');
});
$('.closemodale1').click(function (e) {
    e.preventDefault();
    $('.modale1').removeClass('opened1');
    $('.fileListDuringUpload').removeClass('opened1');
});
$("#tryAnother").click(function(e){
    $("#domainIsUnavailable").hide();
    $("#domainIsAvailable").hide();
    $('#createButton').prop('disabled', true);
    $('#websiteName').attr('readonly', false);
});