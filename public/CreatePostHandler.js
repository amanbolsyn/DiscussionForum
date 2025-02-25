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


// Handle the form submission with fetch
document.getElementById("newPostForm").addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent default form submission

    // Clear previous error messages
    const titleError = document.getElementById('titleCreateError');
    const bodyError = document.getElementById('bodyCreateError')
    const categoriesError = document.getElementById('categoriesCreateError');

    // reset errors
    titleError.textContent = '';
    bodyError.textContent = '';
    categoriesError.textContent = ''


    title = document.getElementById('postTitle').value
    body = document.getElementById('postContent').value
    categories = document.getElementById('categorySelect').value

    try {
        // Send the data to the server via POST request
        const response = await fetch('/posts', {
            method: 'POST',
            body: JSON.stringify({ title, body, categories }),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json(); // Assuming the server returns JSON

        if (data.errors) {
            titleError.textContent = data.errors.title;
            bodyError.textContent = data.errors.body;
            categoriesError.textContent = data.errors.categories;
        }

        if (data.post) {
            location.assign('/post/' + data.post._id);
        }



    } catch (error) {
        console.error("Error:", error);
    }

});
