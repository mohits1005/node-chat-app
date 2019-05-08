function handleSubmit(event) {
    event.preventDefault();
    let formEl = document.getElementById('sigupForm');
    let email = formEl.elements[0]['value'];
    let password = formEl.elements[1]['value'];
    registerUser(email, password).then(data => {
        var expires = "";
        var date = new Date();
        date.setTime(date.getTime() + (3 * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
        document.cookie = "chattoken=" + data.token + ";expires=" + expires + "; path=/";
        document.cookie = "email=" + data.user.email + " ;expires=" + expires + "; path=/";
        window.location = '/chat';
    })
}
function registerUser(email, password) {
    let url = 'http://localhost:3000/users';
    let data = { email: email, password: password }
    let headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    let fetchData = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: headers
    }
    return fetch(url, fetchData)
        .then(response => response.json())
}