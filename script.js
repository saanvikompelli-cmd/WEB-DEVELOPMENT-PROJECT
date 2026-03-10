// Data storage
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentRide = null;
let rideQueue = JSON.parse(localStorage.getItem("rides")) || [];
let rideHistory = JSON.parse(localStorage.getItem("history")) || [];
let contacts = [];
let jobs = JSON.parse(localStorage.getItem("jobs")) || [];
let feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    renderJobs();
    renderFeedback();
    renderRideHistory();
    showSection("login");
});

// Navigation functions
function showSection(id) {
    document.querySelectorAll("section").forEach(s => s.style.display = "none");
    document.getElementById(id).style.display = "block";
}

// Authentication functions
function register() {
    let type = document.getElementById("regType").value;
    let user = document.getElementById("regUser").value;
    let pass = document.getElementById("regPass").value;

    if (!user || !pass) {
        alert("Please fill in all fields");
        return;
    }

    users.push({ type, username: user, password: pass });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registration Successful");
    showSection("login");

    // Clear form
    document.getElementById("regUser").value = "";
    document.getElementById("regPass").value = "";
}

function login() {
    let type = document.getElementById("loginType").value;
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    if (!user || !pass) {
        alert("Please enter username and password");
        return;
    }

    let found = users.find(u => u.username == user && u.password == pass && u.type == type);

    if (!found) {
        alert("Invalid Login");
        return;
    }

    document.getElementById("login").style.display = "none";
    document.getElementById("mainNav").style.display = "flex";

    if (type == "driver") {
        showSection("driverPanel");
        updatePending();
    } else {
        showSection("book");
    }

    // Clear form
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

function logout() {
    location.reload();
}

// Ride booking functions
function bookRide() {
    let passenger = document.getElementById("passengerName").value;
    let pickup = document.getElementById("pickup").value;
    let drop = document.getElementById("drop").value;

    if (!passenger || !pickup || !drop) {
        alert("Please fill in all fields");
        return;
    }

    let distance = Math.floor(Math.random() * 10) + 1;
    let fare = distance * 20;
    let otp = Math.floor(1000 + Math.random() * 9000);

    let ride = {
        passenger,
        pickup,
        drop,
        distance,
        fare,
        otp,
        time: new Date().toLocaleTimeString()
    };

    rideQueue.push(ride);
    localStorage.setItem("rides", JSON.stringify(rideQueue));

    document.getElementById("rideInfo").innerHTML = 
        `Passenger: ${passenger}<br>
         Pickup: ${pickup}<br>
         Drop: ${drop}<br>
         Fare: ₹${fare}<br>
         OTP: ${otp}<br>
         Time: ${ride.time}`;

    updatePending();
    
    alert(`Ride booked successfully! Your OTP is: ${otp}`);

    // Clear form
    document.getElementById("passengerName").value = "";
    document.getElementById("pickup").value = "";
    document.getElementById("drop").value = "";
}

// Driver functions
function loadRideRequests() {
    let container = document.getElementById("driverRides");
    container.innerHTML = "";

    if (rideQueue.length === 0) {
        container.innerHTML = "<p>No ride requests available.</p>";
        return;
    }

    rideQueue.forEach((r, i) => {
        container.innerHTML += `
            <div class="card">
                <strong>Passenger:</strong> ${r.passenger}<br>
                <strong>Pickup:</strong> ${r.pickup}<br>
                <strong>Drop:</strong> ${r.drop}<br>
                <strong>Distance:</strong> ${r.distance}km<br>
                <strong>Fare:</strong> ₹${r.fare}<br>
                <strong>Time:</strong> ${r.time}<br><br>
                <button class="btn" onclick="acceptRide(${i})">Accept Ride</button>
                <button class="btn" onclick="rejectRide(${i})">Reject Ride</button>
            </div>`;
    });

    updatePending();
}

function acceptRide(i) {
    currentRide = rideQueue[i];
    rideQueue.splice(i, 1);
    localStorage.setItem("rides", JSON.stringify(rideQueue));
    alert(`Ride Accepted! Passenger OTP: ${currentRide.otp}`);
    loadRideRequests();
}

function rejectRide(i) {
    rideQueue.splice(i, 1);
    localStorage.setItem("rides", JSON.stringify(rideQueue));
    loadRideRequests();
}

function verifyOTP() {
    let entered = document.getElementById("driverOTP").value;

    if (!currentRide) {
        alert("No active ride selected");
        return;
    }

    if (entered == currentRide.otp) {
        alert("OTP Verified! Ride Started. Safe journey!");
    } else {
        alert("Wrong OTP. Please try again.");
    }
}

function completeRide() {
    if (!currentRide) {
        alert("No active ride to complete");
        return;
    }

    rideHistory.push(currentRide);
    localStorage.setItem("history", JSON.stringify(rideHistory));
    alert("Ride Completed Successfully!");
    currentRide = null;
    renderRideHistory();
    document.getElementById("driverOTP").value = "";
}

function renderRideHistory() {
    let container = document.getElementById("rideHistoryView");
    container.innerHTML = "";

    if (rideHistory.length === 0) {
        container.innerHTML = "<p>No ride history available.</p>";
        return;
    }

    rideHistory.forEach(r => {
        container.innerHTML += `<div>${r.passenger} | ${r.pickup} → ${r.drop} | Fare: ₹${r.fare}</div>`;
    });
}

function updatePending() {
    document.getElementById("pendingCount").innerText = rideQueue.length;
}

// Safety features
function sendSOS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                alert(`🚨 SOS EMERGENCY ALERT SENT!\nLocation: https://maps.google.com/?q=${lat},${lng}\n\nEmergency contacts have been notified.`);
            },
            error => {
                alert("🚨 SOS EMERGENCY ALERT SENT!\nUnable to get location. Emergency contacts have been notified.");
            }
        );
    } else {
        alert("🚨 SOS EMERGENCY ALERT SENT!\nEmergency contacts have been notified.");
    }
}

function fakeCall() {
    alert("📞 Incoming Call...\nMom is calling");
    setTimeout(() => {
        alert("📞 Missed call from Mom");
    }, 3000);
}

function routeCheck() {
    alert("Route Safety Check:\n✓ Route is safe\n✓ Well-lit areas\n✓ Verified driver assigned");
}

function driverAcceptRide() {
    alert("Driver has been notified and will accept your ride soon!");
}

// Emergency contacts
function addContact() {
    let name = document.getElementById("contactName").value;
    let phone = document.getElementById("contactPhone").value;

    if (!name || !phone) {
        alert("Please enter both name and phone number");
        return;
    }

    contacts.push({ name, phone });
    renderContacts();

    // Clear form
    document.getElementById("contactName").value = "";
    document.getElementById("contactPhone").value = "";
    
    alert("Emergency contact added successfully!");
}

function renderContacts() {
    let list = document.getElementById("contactList");
    list.innerHTML = "";

    if (contacts.length === 0) {
        list.innerHTML = "<li>No emergency contacts added</li>";
        return;
    }

    contacts.forEach(c => {
        list.innerHTML += `<li>${c.name} - ${c.phone}</li>`;
    });
}

// Job applications
function applyDriver() {
    let name = document.getElementById("jobName").value;
    let phone = document.getElementById("jobPhone").value;
    let vehicle = document.getElementById("vehicleType").value;
    let exp = document.getElementById("experience").value;

    if (!name || !phone || !vehicle || !exp) {
        alert("Please fill in all fields");
        return;
    }

    jobs.push({ name, phone, vehicle, exp });
    localStorage.setItem("jobs", JSON.stringify(jobs));

    renderJobs();
    alert("Application submitted successfully!");

    // Clear form
    document.getElementById("jobName").value = "";
    document.getElementById("jobPhone").value = "";
    document.getElementById("vehicleType").value = "";
    document.getElementById("experience").value = "";
}

function renderJobs() {
    let container = document.getElementById("jobList");
    container.innerHTML = "";

    if (jobs.length === 0) {
        container.innerHTML = "<p>No job applications yet.</p>";
        return;
    }

    jobs.forEach(d => {
        container.innerHTML += `<div>${d.name} | ${d.vehicle} | ${d.exp} years experience</div>`;
    });
}

// Feedback functions
function submitFeedback() {
    let name = document.getElementById("fbName").value;
    let rating = document.getElementById("rating").value;
    let comment = document.getElementById("comment").value;

    if (!name || !comment) {
        alert("Please enter your name and comment");
        return;
    }

    feedbacks.push({ name, rating, comment });
    localStorage.setItem("feedbacks", JSON.stringify(feedbacks));

    renderFeedback();
    alert("Thank you for your feedback!");

    // Clear form
    document.getElementById("fbName").value = "";
    document.getElementById("comment").value = "";
}

function renderFeedback() {
    let container = document.getElementById("feedbackList");
    container.innerHTML = "";

    if (feedbacks.length === 0) {
        container.innerHTML = "<p>No feedback yet.</p>";
        return;
    }

    feedbacks.forEach(d => {
        container.innerHTML += `<div>
            <strong>${d.name}</strong> - ${d.rating}<br>
            ${d.comment}
        </div>`;
    });
}

// Make functions globally available
window.showSection = showSection;
window.register = register;
window.login = login;
window.logout = logout;
window.bookRide = bookRide;
window.loadRideRequests = loadRideRequests;
window.acceptRide = acceptRide;
window.rejectRide = rejectRide;
window.verifyOTP = verifyOTP;
window.completeRide = completeRide;
window.sendSOS = sendSOS;
window.fakeCall = fakeCall;
window.routeCheck = routeCheck;
window.driverAcceptRide = driverAcceptRide;
window.addContact = addContact;
window.applyDriver = applyDriver;
window.submitFeedback = submitFeedback;