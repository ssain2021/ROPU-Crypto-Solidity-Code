function activatedropodownmenu() {
    //console.log('clickeddropodownmenu');

    console.log('activatedropodownmenu');
    document.getElementById("mobnavdm").style.display = "block";
}


document.addEventListener("mousedown", function(e) {

    if (e.target.parentElement.id != "mobnavdm" && e.target.parentElement.parentElement.id != "mobnavdm") {
        document.getElementById("mobnavdm").style.display = "none";
    }

});