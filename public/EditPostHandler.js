var editForm = document.getElementById("editPostForm");
var editPostBttn = document.getElementById("editPost");
var editCloseSpan = document.getElementById("closeEditModal");

// When the user clicks the button, open the modal
editPostBttn.addEventListener('click', (e) => {

    // Fetch post data and fill the form
    const editEndPoint = `/post/${editPostBttn.dataset.doc}/edit`;

    // Fetch the post details from the server
    fetch(editEndPoint, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(post => {
            editForm.style.display = "block";
            // Fill in the form fields with the post data
            document.getElementById('editPostTitle').value = post.title;
            document.getElementById('editPostContent').value = post.body;

            // Set the selected category
            document.getElementById('editCategorySelect').value = post.categories;

        })
        .catch(error => {
            console.error("Error fetching post data:", error);
        });
})

// When the user clicks on <span> (x), close the modal
editCloseSpan.onclick = function () {
    editForm.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == editForm) {
        editForm.style.display = "none";
    }
}

// Handle form submission via Fetch for updating the post
document.getElementById("editPostForm").onsubmit = function (event) {
    event.preventDefault(); // Prevent default form submission

    const postId = editPostBttn.dataset.doc; // Assuming the button has a data-doc attribute with the post ID

    // Clear previous error messages
    const titleError = document.getElementById('titleEditError');
    const bodyError = document.getElementById('bodyEditError')
    const categoriesError = document.getElementById('categoriesEditError');

    // reset errors
    titleError.textContent = '';
    bodyError.textContent = '';
    categoriesError.textContent = ''


    const title = document.getElementById('editPostTitle').value;
    const body = document.getElementById('editPostContent').value;
    const categories = document.getElementById('editCategorySelect').value;


    const postData = { title, body, categories };

    fetch(`/post/${postId}`, {
        method: 'PUT', // Use PUT to update
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
    })
        .then(response => response.json())
        .then(data => {

            if (data.errors) {
                titleError.textContent = data.errors.title;
                bodyError.textContent = data.errors.body;
                categoriesError.textContent = data.errors.categories;
            }

            if (data.post) {
                location.assign('/post/' + data.post._id);
            }
        })
        .catch(error => {
            console.error('Error updating post:', error);
        });
};