
function setupActionListeners() {
    // // semantic ui
    // $('.ui.dropdown').dropdown(

    // );

    // $('.ui.tiny.modal').modal('show');
    $('.dimmer').dimmer({closable: false}).dimmer('show');

    var btnHome = document.getElementById("btnHome")
    btnHome.addEventListener("click", function (evt) {
        threeD.resetView();
    });

    var btnInfo = document.getElementById("btnInfo");
    btnInfo.addEventListener("click", function (evt) {
        threeD.pauseAnimation();
        $('.ui.modal').modal('show');
    });

    $('.ui.modal').modal({
        onHide: function () {
            
            threeD.resumeAnimation();
        },
        // onShow: function () {
        //     console.log('shown');
        // }
    })

   
    
    // $('.dimmer').dimmer({
    //     onApprove : function() {
    //       console.log("return falsel.")
    //       return false; //Return false as to not close modal dialog
    //     }
    //   }).dimmer('show');
      


    // When the user clicks anywhere outside of the modal, close it
    // window.onclick = function (event) {
    //     if (event.target == modal) {
    //         hideDialog()
    //     }
    // }

    // showDialog();
}

setupActionListeners() 