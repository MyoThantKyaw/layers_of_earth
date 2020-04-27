
function setupActionListeners() {
    // // semantic ui
    // $('.ui.dropdown').dropdown(

    // );

    var btnHome = document.getElementById("btnHome")
    btnHome.addEventListener("click", function(evt){
        threeD.resetView();
    })


    // When the user clicks anywhere outside of the modal, close it
    // window.onclick = function (event) {
    //     if (event.target == modal) {
    //         hideDialog()
    //     }
    // }

    // showDialog();
}

setupActionListeners() 