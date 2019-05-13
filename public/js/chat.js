var socket = io();

function scrollToBottom() {
    // Selectors
    var messages = jQuery('#messages');
    var newMessage = messages.children('li:last-child');
    // Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();

    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        // console.log('Should scroll');
        messages.scrollTop(scrollHeight);
    }
}
function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

socket.on('connect', function() {
    console.log('Connected to server');
    // var params = jQuery.deparam(window.location.search);
    var chatToken = getCookie('chattoken');
    var email = getCookie('email');
    var params = {
        'name': email,
        'room': 'test',
        'token': chatToken
    }
    socket.emit('join', params, function(err) {
        if (err) {
            alert(err);
            window.location.href = "/";
        } else {
            console.log('No error');
        }
    });
    // socket.emit('createEmail', {
    //     to: 'aku@example.com',
    //     text: 'Hey. This is Moh.'
    // });

    // socket.emit('createMessage', {
    //     from: 'moh',
    //     text: 'Hi'
    // }, function(data) {
    //     console.log('Got it' + data);
    // });
});

socket.on('disconnect', function() {
    console.log('Disconnected from server');
});

socket.on('updateUserList', function(users) {
    console.log(users);
    var ol = jQuery('<ol></ol>');
    users.forEach(function(user) {
        ol.append(jQuery('<li></li>').text(user));
    })
    jQuery('#users').html(ol);
});

// socket.on('newEmail', function(email) {
//     console.log('New email', email);
// });

socket.on('newMessage', function(message) {
    // console.log('newMessage', message);
    var formattedTime = moment(message.createdAt).format('h:mm a');
    // var li = jQuery('<li></li>');
    // li.text(`${message.from} ${formattedTime}: ${message.text}`);
    // jQuery('#messages').append(li);
    var template = jQuery('#message-template').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });
    jQuery('#messages').append(html);
    scrollToBottom();
});

socket.on('newLocationMessage', function(message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    // var li = jQuery('<li></li>');
    // var a = jQuery('<a target="_blank">My current location</a>')
    // li.text(`${message.from} ${formattedTime}: `);
    // a.attr('href', message.url);
    // li.append(a);
    // jQuery('#messages').append(li);
    var template = jQuery('#location-message-template').html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime,
        url: message.url
    });
    jQuery('#messages').append(html);
    scrollToBottom();
});

jQuery('#message-form').on('submit', function(e) {
    e.preventDefault();
    var messageTextBox = jQuery('[name=message]');
    socket.emit('createMessage', {
        text: messageTextBox.val()
    }, function() {
        messageTextBox.val('')
    });
});

var locationButton = jQuery('#send-location');
locationButton.on('click', function() {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported by your browser.');
    }
    locationButton.attr('disabled', 'disabled').text('Sending location...')
    navigator.geolocation.getCurrentPosition(function(position) {
        // console.log(position);
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        })
    }, function() {
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location.');
    });
});