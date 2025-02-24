var createForm = document.getElementById("createPostForm");
var createPostBttn = document.getElementById("createPost");
var createCloseSpan = document.getElementById("closeCreateModal");

// When the user clicks the button, open the modal
createPostBttn.onclick = function () {
    createForm.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
createCloseSpan.onclick = function () {
    createForm.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == createForm) {
        createForm.style.display = "none";
    }
}

// Validate that at least one category is selected
function validateForm() {
    var selectedCategories = document.querySelectorAll('#categorySelect option:checked');
    if (selectedCategories.length == 0) {
        alert("Please select at least one category.");
        return false; // Prevent form submission
    }
    return true; // Allow form submission
}